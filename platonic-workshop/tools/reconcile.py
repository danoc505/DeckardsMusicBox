"""Milestone 12: the reconciliation worksheet, tested on tensions within Plato.

Two files written by hand, in sources/reconcile/:

  methods.json   the interpretive methods (allegorical reading, ontological
                 distinction, image and original, participation, privation,
                 ascent and return, psychological, symbolic and the others the
                 sources use). Each has a plain-English account, written for the
                 Workshop and marked so, and its grounds: quotations of Plato or
                 of the Platonists who use the method, each looked for in the
                 text it names. Each names the concepts of the concept index it
                 belongs with, which is how the worksheet finds the methods that
                 apply to a passage.
  tensions.json  the tensions: two (or more) passages of Plato that seem to
                 disagree. Each record has the passages (Burnet's Greek quoted
                 at its first section, and an English translation quoted at the
                 same section), what each says, the nature of the apparent
                 contradiction, who documents it (a quotation: nothing is
                 recorded as a tension unless a commentator or a scholar is
                 quoted saying so), the Greek words at issue (each must be
                 tagged in its passage), the concepts it touches, and one or
                 more readings that reconcile it, each with its method, who
                 holds it, and the words it rests on. A reading is either
                 'established' (a commentator, a later Platonist, or Plato
                 himself is quoted giving it) or 'proposed' (the Workshop's
                 editorial suggestion, marked as such, never as the text's
                 meaning).

The build checks every quotation (in Burnet's Greek at the section named, in
the translator's English at that section, in the note named, in the later
Platonist's book, or on the web page, against the copy checked by
tools/reconcile.py --web), and reports/reconcile.md lists any not found. It
also finds, by rule, the notes placed on either passage, and the notes on one
passage that cite the other (the citation web), so the commentary shown with a
tension is the commentary the library has, not a selection.

Your own worksheets (your interpretation, your reconciled rendering, the
methods and references you chose) are kept in data/user.sqlite by
tools/mywork.py, with every version.

    python3 tools/reconcile.py          # rebuild only these tables in data/workshop.sqlite
    python3 tools/reconcile.py --web    # fetch the web pages quoted and check the quotations
"""
import hashlib
import json
import re
import sqlite3
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ancient  # noqa: E402
import concepts  # noqa: E402
import greek  # noqa: E402
import structure  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "reconcile"
WEB_CHECKS = SRC / "web-checks.json"
REPORT = ROOT / "reports" / "reconcile.md"
STATUSES = ("established", "proposed")
SIDES = ("a", "b", "more")

TABLES = ("reconcile_method", "reconcile_method_concept", "reconcile_tension", "reconcile_passage", "reconcile_word",
          "reconcile_concept", "reconcile_reading", "reconcile_cites")


def load(name):
    return json.loads((SRC / name).read_text(encoding="utf-8"))


def norm_web(s):
    """A quotation or a web page in comparison form: one space, plain quotes and dashes, lower case."""
    s = ancient.norm(s.replace("_", ""), "eng").lower()
    s = re.sub(r"[‐-―−]", "-", s)
    return re.sub(r"\s+", " ", s).strip()


class Sources(concepts.Sources):
    """concepts.Sources (Burnet's Greek, the ancient texts, the notes, the later
    Platonists' books), and three more kinds of source:

      translation   an English translation of Plato at a Stephanus section, by
                    translator ('Jowett', 'Taylor', 'Shorey' ...): the edition
                    whose label names him
      books         the Gutenberg transcriptions of Taylor's later Platonists
                    (sources/reconcile/sources.json), as well as those of the
                    concept index
      web           a page on the web: the quotation is checked against the
                    page as fetched by `reconcile.py --web` (web-checks.json)
    """

    def __init__(self, db):
        super().__init__(db)
        mine = load("sources.json")
        self.books.update(mine["books"])
        self.web = json.loads(WEB_CHECKS.read_text(encoding="utf-8")) if WEB_CHECKS.exists() else {}
        self._eng = {}

    def book(self, ev):
        b = self.books[ev["source"]]
        if ev["source"] not in self._book:
            self._book[ev["source"]] = [norm_web(concepts.book_text(f)) for f in b["files"]]
        q = norm_web(ev["quote"])
        for k, t in enumerate(self._book[ev["source"]]):
            if q in t:
                vol = f", vol. {k + 1}" if len(b["files"]) > 1 else ""
                return True, (f"vol. {k + 1}" if vol else None), b["cite"] + vol
        return False, None, b["cite"]

    def english(self, work, ref, by):
        k = (work, ref, by)
        if k not in self._eng:
            rows = self.db.execute(
                "SELECT c.text, e.label FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE c.work_id = ? AND e.lang = 'eng' "
                "AND (c.section_ref = ? OR c.end_ref = ?) AND (e.label LIKE ? OR e.responsible LIKE ?) ORDER BY c.seq",
                (work, ref, ref, f"%{by}%", f"%{by}%")).fetchall()
            self._eng[k] = (norm_web(" ".join(r[0] for r in rows)), rows[0][1] if rows else by)
        return self._eng[k]

    def check(self, ev):
        src = ev["source"]
        if src == "translation":
            if ev["work"] not in self.imported:
                return None, ev["ref"], f"{ev['by']}, {ev['work']} {ev['ref']}", None
            text, label = self.english(ev["work"], ev["ref"], ev["by"])
            title = self.db.execute("SELECT title FROM work WHERE id = ?", (ev["work"],)).fetchone()[0]
            return norm_web(ev["quote"]) in text, ev["ref"], f"{label}, {title} {ev['ref']}", None
        if src == "web":
            page = self.web.get(ev["url"])
            cited = ev["cite"]
            if not page:
                return None, ev["url"], cited, None
            return bool(page["quotes"].get(ev["quote"])), ev["url"], cited, None
        return super().check(ev)


def add(db, src, owner, ev, stats):
    ok, at, cited, nid = src.check(ev)
    db.execute("INSERT INTO evidence (owner, source_text, work_id, at, quote, found, cited_as, note_id) VALUES (?,?,?,?,?,?,?,?)",
               (owner, ev["source"], ev.get("work"), at, ev["quote"], None if ok is None else int(ok), cited, nid))
    if ok is None:
        stats["quotations not checked"] += 1
        stats.setdefault("not checked", []).append(f"{owner}: {ev['source']} {ev.get('url') or ev.get('work', '')} «{ev['quote'][:80]}»")
    else:
        stats["quotations"] += 1
        stats["quotations found"] += ok
        if ev["source"] == "web":
            stats["web quotations"] += 1
        if not ok:
            stats.setdefault("not found", []).append(
                f"{owner}: {ev['source']} {ev.get('by', '')} {ev.get('work', '')} {ev.get('ref', '')} {ev.get('url', '')} «{ev['quote']}»".replace("  ", " "))
    return ok


def span_refs(db, work, a, b):
    seq = structure.ref_range(db, work)
    if a not in seq or b not in seq or seq[b] < seq[a]:
        raise SystemExit(f"reconcile: no such span {work} {a}-{b}")
    return [r for r, i in sorted(seq.items(), key=lambda x: x[1]) if seq[a] <= i <= seq[b]]


def lemma_in_span(db, work, refs, lemma):
    q = ",".join("?" * len(refs))
    return db.execute(f"SELECT count(DISTINCT t.id) FROM token t JOIN edition e ON e.id = t.edition_id JOIN tag g ON g.token_id = t.id "
                      f"WHERE e.work_id = ? AND e.lang = 'grc' AND t.section_ref IN ({q}) AND g.lemma = ?", (work, *refs, lemma)).fetchone()[0]


def clear(db):
    for t in TABLES:
        db.execute(f"DELETE FROM {t}")
    db.execute("DELETE FROM evidence WHERE owner LIKE 'reconcile:%' OR owner LIKE 'method:%'")


def build(db):
    """Called by build_db.py near the end (it reads the notes, the citation web and the concept index)."""
    stats = Counter()
    src = Sources(db)
    concept_ids = {r[0] for r in db.execute("SELECT id FROM concept")}
    methods = load("methods.json")
    method_ids = [m["id"] for m in methods["methods"]]
    if len(set(method_ids)) != len(method_ids):
        raise SystemExit("reconcile: a method id is used twice")
    for k, m in enumerate(methods["methods"]):
        for c in m["concepts"]:
            if c not in concept_ids:
                raise SystemExit(f"reconcile: method {m['id']} names unknown concept {c!r}")
            db.execute("INSERT INTO reconcile_method_concept VALUES (?,?)", (m["id"], c))
        owner = f"method:{m['id']}"
        for e in m["grounds"]:
            add(db, src, owner, e, stats)
        db.execute("INSERT INTO reconcile_method VALUES (?,?,?,?,?,?,?)",
                   (m["id"], m["name"], m["plain"], int(bool(m.get("named_in_prompt"))), m.get("greek"), owner, k))
        stats["methods"] += 1
    t = load("tensions.json")
    categories = {r[0] for r in db.execute("SELECT name FROM concept_category")}
    ids = [x["id"] for x in t["tensions"]]
    if len(set(ids)) != len(ids):
        raise SystemExit("reconcile: a tension id is used twice")
    for k, r in enumerate(t["tensions"]):
        tid = r["id"]
        if r["category"] not in categories:
            raise SystemExit(f"reconcile {tid}: unknown category {r['category']!r}")
        if not r.get("documented"):
            raise SystemExit(f"reconcile {tid}: no quotation documents the tension")
        if not r.get("readings"):
            raise SystemExit(f"reconcile {tid}: no reading")
        db.execute("INSERT INTO reconcile_tension VALUES (?,?,?,?,?,?,?)",
                   (tid, r["title"], r["category"], r["question"], r["nature"], f"reconcile:{tid}:documented", k))
        stats["tensions"] += 1
        for e in r["documented"]:
            add(db, src, f"reconcile:{tid}:documented", e, stats)
        sides = [("a", r["a"]), ("b", r["b"])] + [("more", p) for p in r.get("more", [])]
        spans = {}
        for n, (side, p) in enumerate(sides):
            if p["work"] not in src.imported:
                stats["passages not in this build"] += 1
                continue
            refs = span_refs(db, p["work"], p["start"], p["end"])
            spans[n] = (p["work"], refs)
            owner = f"reconcile:{tid}:passage:{n}"
            add(db, src, owner, {"source": "plato", "work": p["work"], "ref": p.get("quote_at", p["start"]), "quote": p["greek"]}, stats)
            for e in p.get("english", []):
                add(db, src, owner, {"source": "translation", "work": p["work"], **e}, stats)
            db.execute("INSERT INTO reconcile_passage VALUES (?,?,?,?,?,?,?,?)",
                       (tid, n, side, p["work"], p["start"], p["end"], p["says"], owner))
            stats["passages"] += 1
            for w in p.get("words", []):
                found = lemma_in_span(db, p["work"], refs, greek.nfc(w["lemma"]))
                if not found:
                    stats.setdefault("words not tagged", []).append(f"{tid} {side}: {w['lemma']} not tagged in {p['work']} {p['start']}-{p['end']}")
                db.execute("INSERT INTO reconcile_word VALUES (?,?,?,?,?)", (tid, n, greek.nfc(w["lemma"]), w["why"], found))
                stats["words"] += 1
        for c in r.get("concepts", []):
            if c not in concept_ids:
                raise SystemExit(f"reconcile {tid}: unknown concept {c!r}")
            db.execute("INSERT INTO reconcile_concept VALUES (?,?)", (tid, c))
        for i, rd in enumerate(r["readings"]):
            if rd["method"] not in method_ids:
                raise SystemExit(f"reconcile {tid}: unknown method {rd['method']!r}")
            if rd["status"] not in STATUSES:
                raise SystemExit(f"reconcile {tid}: status {rd['status']!r}")
            if rd["status"] == "established" and not rd.get("evidence"):
                raise SystemExit(f"reconcile {tid}: an established reading needs the words it rests on")
            owner = f"reconcile:{tid}:reading:{i}"
            for e in rd.get("evidence", []):
                add(db, src, owner, e, stats)
            db.execute("INSERT INTO reconcile_reading VALUES (?,?,?,?,?,?,?)",
                       (tid, i, rd["method"], rd["status"], rd["by"], rd["summary"], owner))
            stats[f"readings {rd['status']}"] += 1
        # The citation web between the passages: a note on one that cites the other (found by rule, milestone 8).
        for n, (work, refs) in spans.items():
            for m, (work2, refs2) in spans.items():
                if m == n:
                    continue
                pages = sorted({re.match(r"\d+", x).group(0) for x in refs2})
                q1, q2, q3 = ",".join("?" * len(refs)), ",".join("?" * len(refs2)), ",".join("?" * len(pages))
                for (nid,) in db.execute(
                        f"SELECT DISTINCT l.note_id FROM link l WHERE l.from_work = ? AND l.from_ref IN ({q1}) AND l.to_work = ? "
                        f"AND (l.to_ref IN ({q2}) OR l.to_ref IN ({q3})) AND l.note_id IS NOT NULL AND l.certainty != 'unresolved'",
                        (work, *refs, work2, *refs2, *pages)).fetchall():
                    db.execute("INSERT OR IGNORE INTO reconcile_cites VALUES (?,?,?,?)", (tid, n, m, nid))
                    stats["notes on one passage citing another"] += 1
    out = dict(stats)
    for k in ("not found", "not checked", "words not tagged"):
        out[k] = stats.get(k, [])
    return out


# ---------------------------------------------------------------- what applies to a passage

def contains(db, work, start, end, ref, _cache={}):
    seq = structure.ref_range(db, work)
    return ref in seq and start in seq and end in seq and seq[start] <= seq[ref] <= seq[end]


def applicable(db, work, ref):
    """For a passage (work, Stephanus section): the tensions it is part of, the
    concepts whose passages contain it, and the methods those retrieve, each
    with why it was retrieved. Read by the worksheet and by the reader."""
    seq = structure.ref_range(db, work)
    if ref not in seq:
        return None
    at = seq[ref]

    def inside(w, a, b):
        return w == work and a in seq and b in seq and seq[a] <= at <= seq[b]

    tensions = []
    for tid, title, side, a, b in db.execute(
            "SELECT t.id, t.title, p.side, p.start_ref, p.end_ref FROM reconcile_passage p JOIN reconcile_tension t ON t.id = p.tension_id "
            "WHERE p.work_id = ? ORDER BY t.seq", (work,)).fetchall():
        if inside(work, a, b):
            tensions.append({"id": tid, "title": title, "side": side, "span": f"{a}–{b}" if a != b else a})
    cons = []
    for cid, label, a, b, why in db.execute(
            "SELECT c.id, c.label, p.start_ref, p.end_ref, p.why FROM concept_passage p JOIN concept c ON c.id = p.concept_id "
            "WHERE p.work_id = ? ORDER BY c.seq", (work,)).fetchall():
        if inside(work, a, b):
            cons.append({"id": cid, "label": label, "span": f"{a}–{b}" if a != b else a, "why": why})
    methods = {}
    for t in tensions:
        for mid, name, by, status in db.execute(
                "SELECT r.method_id, m.name, r.by, r.status FROM reconcile_reading r JOIN reconcile_method m ON m.id = r.method_id "
                "WHERE r.tension_id = ?", (t["id"],)):
            methods.setdefault(mid, {"id": mid, "name": name, "because": []})["because"].append(
                f"used to reconcile “{t['title']}” ({status}, {by})")
    for c in cons:
        for mid, name in db.execute("SELECT m.id, m.name FROM reconcile_method_concept mc JOIN reconcile_method m ON m.id = mc.method_id "
                                    "WHERE mc.concept_id = ? ORDER BY m.seq", (c["id"],)):
            methods.setdefault(mid, {"id": mid, "name": name, "because": []})["because"].append(
                f"belongs with the concept {c['label']}, whose passage {c['span']} contains this section")
    return {"work": work, "ref": ref, "tensions": tensions, "concepts": cons, "methods": list(methods.values())}


# ---------------------------------------------------------------- the web pages quoted

def web_links():
    """Every (url, quote) quoted from the web in methods.json and tensions.json."""
    out = {}

    def walk(x):
        if isinstance(x, dict):
            if x.get("source") == "web":
                out.setdefault(x["url"], set()).add(x["quote"])
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(load("methods.json"))
    walk(load("tensions.json"))
    return out


def check_web(refresh=False):
    """Fetch each page quoted (cached in data/web-cache/ by tools/webcheck.py) and
    record, for each quotation, whether its words are on the page as fetched."""
    import webcheck
    out = {}
    for url, quotes in sorted(web_links().items()):
        status, body = webcheck.fetch(url, refresh=refresh)
        text = norm_web(webcheck.page_text(body)) if body else ""
        out[url] = {"checked": datetime.now(timezone.utc).replace(microsecond=0).isoformat(), "status": status,
                    "sha256": hashlib.sha256(body.encode("utf-8") if isinstance(body, str) else (body or b"")).hexdigest(),
                    "quotes": {q: norm_web(q) in text for q in sorted(quotes)}}
        bad = [q for q, ok in out[url]["quotes"].items() if not ok]
        print(f"{status} {url}: {len(quotes) - len(bad)} of {len(quotes)} found" + "".join(f"\n    NOT FOUND «{q}»" for q in bad))
    WEB_CHECKS.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- report

def write_report(db, stats, path=REPORT):
    q = lambda sql, *a: db.execute(sql, a).fetchall()
    lines = ["# The reconciliation worksheet: what the build found", "",
             "Written by `tools/build_db.py` (milestone 12, `tools/reconcile.py`) from `sources/reconcile/`; every figure is counted from the library.", "",
             f"**{stats.get('quotations found', 0):,} of {stats.get('quotations', 0):,} quotations found** in the texts they are said to be in "
             f"(Burnet's Greek and the translators' English at the section named, the notes by commentator and place, Taylor's later Platonists, "
             f"and {stats.get('web quotations', 0)} on web pages as fetched and checked by `python3 tools/reconcile.py --web`, recorded in `sources/reconcile/web-checks.json`)."]
    for key, head in (("not found", "Not found"), ("not checked", "Not checked (web page not fetched yet)"), ("words not tagged", "Words not tagged in their passage")):
        items = stats.get(key) or []
        lines += ["", f"{head}: none." if not items else f"{head}:", ""] + [f"- {x}" for x in items]
    lines += ["", "## The methods", "", "Each method's account is written for the Workshop; its grounds are quotations of Plato or of the Platonists who use it.", "",
              "| Method | Named in the build prompt | Grounds (quotations) | Concepts it belongs with | Readings using it |", "|---|---|---:|---|---:|"]
    for mid, name, named, owner in q("SELECT id, name, named, owner FROM reconcile_method ORDER BY seq"):
        cs = ", ".join(r[0] for r in q("SELECT c.label FROM reconcile_method_concept m JOIN concept c ON c.id = m.concept_id WHERE m.method_id = ?", mid))
        lines.append(f"| {name} | {'yes' if named else ''} | {q('SELECT count(*) FROM evidence WHERE owner = ?', owner)[0][0]} | {cs} | "
                     f"{q('SELECT count(*) FROM reconcile_reading WHERE method_id = ?', mid)[0][0]} |")
    lines += ["", "## The tensions", "",
              "A reading is **established** when a commentator, a later Platonist or Plato himself is quoted giving it, **proposed** when it is the Workshop's editorial suggestion.", "",
              "| Tension | Kind | Passages | Documented by | Readings (established + proposed) | Notes on the passages | Notes on one citing another |", "|---|---|---|---:|---|---:|---:|"]
    for tid, title, cat in q("SELECT id, title, category FROM reconcile_tension ORDER BY seq"):
        ps = "; ".join(f"{w} {a}" + (f"–{b}" if b != a else "") for w, a, b in
                       q("SELECT w.abbr, p.start_ref, p.end_ref FROM reconcile_passage p JOIN work w ON w.id = p.work_id WHERE tension_id = ? ORDER BY n", tid))
        est = q("SELECT count(*) FROM reconcile_reading WHERE tension_id = ? AND status = 'established'", tid)[0][0]
        pro = q("SELECT count(*) FROM reconcile_reading WHERE tension_id = ? AND status = 'proposed'", tid)[0][0]
        notes = 0
        for w, a, b in q("SELECT work_id, start_ref, end_ref FROM reconcile_passage WHERE tension_id = ?", tid):
            notes += len(structure.notes_in(db, w, a, b))
        lines.append(f"| {title} | {cat} | {ps} | {q('SELECT count(*) FROM evidence WHERE owner = ?', f'reconcile:{tid}:documented')[0][0]} | "
                     f"{est} + {pro} | {notes} | {q('SELECT count(DISTINCT note_id) FROM reconcile_cites WHERE tension_id = ?', tid)[0][0]} |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    import argparse
    import build_db
    ap = argparse.ArgumentParser(description="Rebuild the reconciliation tables, or check the web quotations.")
    ap.add_argument("--web", action="store_true", help="fetch the pages quoted and write sources/reconcile/web-checks.json")
    ap.add_argument("--refresh", action="store_true", help="with --web: fetch again even if cached")
    args = ap.parse_args()
    if args.web:
        check_web(args.refresh)
        return
    db = sqlite3.connect(build_db.DB_PATH)
    schema = (ROOT / "db" / "schema.sql").read_text(encoding="utf-8")
    block = schema[schema.index("-- @reconcile"):schema.index("-- @end reconcile")]
    db.executescript(block.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ").replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS "))
    clear(db)
    stats = build(db)
    write_report(db, stats)
    db.execute("INSERT OR REPLACE INTO build VALUES ('reconcile_stats', ?)", (json.dumps(stats, ensure_ascii=False),))
    db.commit()
    print({k: v for k, v in stats.items() if not isinstance(v, list)})
    for k in ("not found", "not checked", "words not tagged"):
        for x in stats[k]:
            print(f"{k.upper()}: {x}")


if __name__ == "__main__":
    main()
