"""Passage dossiers: the famous passages, images, myths and arguments of Plato,
each gathered in one place.

A dossier is written by hand in sources/dossiers/ (index.json lists the files). What is
written there is only what a rule cannot find, and every piece of it quotes
the words it rests on:

  passage      the Stephanus span, with a quotation of Burnet's Greek where it
               begins and another where it ends (both checked)
  parts        its stages ('the prisoners', 'the release'), each with a quotation
  echoes       other places where Plato himself returns to it, recalls it or
               reuses it, each with a quotation of the Greek there
  related      other dossiers it is tied to, with the words that tie them
  testimonia   the ancient and later readers in the library (Alcinous, the
               Definitions, Diogenes Laertius, Proclus, Taylor...), quoted
  renderings   how each translator renders its key words: the Greek word at a
               section, and the English each translation has for it there,
               both looked for in the texts
  diagram      a drawing made from the text: every label is a quotation of the
               Greek, checked like the rest
  web          open resources about it (the Stanford and Internet Encyclopedias
               of Philosophy, Wikipedia, Perseus...), each with words quoted
               from the page; tools/webcheck.py fetches the pages and records
               whether the words are there (sources/dossiers/web-checks.json)

Everything else is gathered by the build from the library, by rule, and the
reader says how each was found:

  - the Greek and every translation of the span, and every note placed in it
    (translators' notes, commentaries, scholia), from the tables of earlier
    milestones, so new commentaries appear in the dossiers when imported;
  - every note anywhere that cites a section of the span (the citation web);
  - notes anywhere in the library that name the passage by one of its
    keywords ('divided line'), on the passage or elsewhere: found by rule;
  - the concept passages and the myths and images that overlap the span;
  - its vocabulary: the words GLAUx tags in it that occur nowhere else in
    Plato, and those far more frequent here than in Plato as a whole;
  - phrases it shares with other passages of Plato: three words in a row with
    the same lemmas, at least two of them rare (found by rule).
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ancient  # noqa: E402
import concepts  # noqa: E402
import structure  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "sources" / "dossiers"
INDEX = SOURCES / "index.json"
CHECKS = ROOT / "sources" / "dossiers" / "web-checks.json"
REPORT = ROOT / "reports" / "dossiers.md"
KINDS = ("image", "myth", "argument", "scene", "method", "doctrine", "saying")
DIAGRAMS = ("line", "cave", "steps", "table", "tree", "rings", "lambda", "square", "analogy", "figure")

# Shared phrases: a lemma is "rare" if GLAUx tags it fewer than this many times in all of Plato.
RARE = 400
# A phrase shared with more than this many other places is a formula, not an echo.
MAX_SHARED = 4


def perseus_url(work):
    """Perseus's Greek text at a Stephanus section: its 'abo' address for Plato (tlg0059)."""
    return f"https://www.perseus.tufts.edu/hopper/text?doc=Perseus:abo:tlg,0059,{work[3:]}:"


def perseus_links(x):
    """The Perseus page of the Greek where the passage begins: generated, and checked like the rest."""
    p = x["passage"]
    return [{"site": "Perseus Digital Library", "title": "The Greek text at Perseus, with each word linked to its parse and LSJ",
             "url": perseus_url(p["work"]) + p["start"], "quote": p["start_quote"], "kind": "text", "auto": True}]


def load():
    """sources/dossiers/index.json names the files of dossiers in reading order, and the groups."""
    idx = json.loads(INDEX.read_text(encoding="utf-8"))
    out = []
    for f in idx["files"]:
        out += json.loads((SOURCES / f).read_text(encoding="utf-8"))["dossiers"]
    return {"dossiers": out, "groups": idx.get("groups", {}), "kinds": idx.get("kinds", {})}


def web_checks():
    return json.loads(CHECKS.read_text(encoding="utf-8"))["pages"] if CHECKS.exists() else {}


def eng(s):
    return ancient.norm(s, "eng").lower()


class Checker:
    """Looks for every quotation in the text it names, and records it as evidence."""

    def __init__(self, db, stats):
        self.db = db
        self.src = concepts.Sources(db)
        self.stats = stats
        self.seq = {}

    def order(self, work):
        if work not in self.seq:
            self.seq[work] = structure.ref_range(self.db, work)
        return self.seq[work]

    def span(self, owner, work, a, b):
        s = self.order(work)
        if a not in s or b not in s or s[b] < s[a]:
            raise SystemExit(f"{owner}: no such span {work} {a}-{b}")

    def ev(self, owner, e):
        """e: {source, quote, ...} -> e with found, at, cited_as, note_id. Records it in evidence."""
        if e["source"] == "plato" and e["work"] in self.src.imported:
            self.span(owner, e["work"], e["ref"], e["ref"])
        ok, at, cited, nid = self.src.check(e)
        self.db.execute("INSERT INTO evidence (owner, source_text, work_id, at, quote, found, cited_as, note_id) VALUES (?,?,?,?,?,?,?,?)",
                        (owner, e["source"], e.get("work"), at, e["quote"], None if ok is None else int(ok), cited, nid))
        if ok is None:
            self.stats["quotations not checked (work not in this build)"] += 1
        else:
            self.stats["quotations"] += 1
            self.stats["quotations found"] += ok
            if not ok:
                self.stats.setdefault("not found", []).append(f"{owner}: {e['source']} {e.get('work', '')} {e.get('ref', '')} «{e['quote']}»")
        return {**e, "found": None if ok is None else bool(ok), "at": at, "cited_as": cited, "note_id": nid}

    def plato(self, owner, work, ref, quote):
        return self.ev(owner, {"source": "plato", "work": work, "ref": ref, "quote": quote})

    def english(self, edition, work, ref, words):
        """Is `words` in the translation `edition` at Stephanus `ref`? A translation placed by computation
        may put a sentence a section early or late, so the neighbouring sections are read too, and say so."""
        s = self.order(work)
        i = s.get(ref)
        if i is None:
            return False, None
        inv = {v: k for k, v in s.items()}
        rows = self.db.execute("SELECT c.section_ref, c.end_ref, c.text, c.align_method FROM chunk c WHERE c.edition_id = ? AND c.work_id = ?",
                               (edition, work)).fetchall()
        q = eng(words)
        best = None
        for a, b, text, method in rows:
            lo, hi = s.get(a), s.get(b or a)
            if lo is None or hi is None:
                continue
            if lo <= i <= hi:
                d = 0
            else:
                d = min(abs(lo - i), abs(hi - i))
            if d <= 1 and q in eng(text):
                if best is None or d < best[0]:
                    best = (d, a if d == 0 else inv.get(lo), method)
        if best is None:
            return False, None
        return True, {"at": best[1], "near": best[0] > 0, "method": best[2]}


def notes_naming(db, rules, work, lo, hi, seq):
    """Every note in the library that names the passage by a keyword: (note id, word, on the passage or elsewhere)."""
    out = []
    for nid, w, ref, body, lang in db.execute("SELECT n.id, n.work_id, n.start_ref, n.body, c.lang FROM note n LEFT JOIN commentary c ON c.id = n.commentary_id"):
        for rl, rx in rules:
            if rl == "eng" and lang == "grc":
                continue
            m = rx.search(concepts.grc(body) if rl == "grc" else body)
            if m:
                i = seq.get(ref) if w == work else None
                out.append((nid, m.group(0), "on" if i is not None and lo <= i <= hi else "elsewhere"))
                break
    return out


def keyword_rules(x):
    kw = x.get("keywords") or {}
    return concepts.keyword_rules({"keywords": kw}) if kw else []


class Lemmas:
    """The lemma of every word of Plato, in reading order, for the vocabulary and the shared phrases."""

    def __init__(self, db):
        self.db = db
        self.count = {r[0]: r[1] for r in db.execute("SELECT lemma, sum(n) FROM lemma_count GROUP BY lemma")}
        self.works_of = {r[0]: r[1] for r in db.execute("SELECT lemma, count(*) FROM lemma_count GROUP BY lemma")}
        self.words = defaultdict(list)       # work -> [(section, word seq, lemma, form)]
        q = ("SELECT e.work_id, t.section_ref, t.seq, g.lemma, t.form FROM token t JOIN edition e ON e.id = t.edition_id "
             "JOIN tag g ON g.token_id = t.id AND g.part = 0 WHERE e.lang = 'grc' AND g.lemma IS NOT NULL ORDER BY t.id")
        for w, ref, n, lemma, form in db.execute(q):
            self.words[w].append((ref, n, lemma, form))
        self.trigrams = defaultdict(list)    # (l1, l2, l3) -> [(work, index)]
        for w, ws in self.words.items():
            for i in range(len(ws) - 2):
                k = (ws[i][2], ws[i + 1][2], ws[i + 2][2])
                if self.phrase_ok(k):
                    self.trigrams[k].append((w, i))

    def rare(self, lemma):
        return self.count.get(lemma, 0) < RARE

    def phrase_ok(self, k):
        return len(set(k)) == 3 and sum(self.rare(x) for x in k) >= 2

    def span(self, work, refs):
        rs = set(refs)
        return [(i, x) for i, x in enumerate(self.words.get(work, [])) if x[0] in rs]

    def vocab(self, work, refs):
        here = Counter(x[2] for _, x in self.span(work, refs))
        total = sum(self.count.values()) or 1
        n_here = sum(here.values()) or 1
        only, dist = [], []
        for lemma, n in here.items():
            c = self.count.get(lemma, 0)
            if c == n:
                only.append((lemma, n, c))
            elif n >= 3:
                ratio = (n / n_here) / (c / total)
                if ratio >= 20:
                    dist.append((lemma, n, c, ratio))
        only.sort(key=lambda r: (-r[1], r[0]))
        dist.sort(key=lambda r: -r[3])
        return only, dist[:30]

    def shared(self, work, refs):
        """Three words in a row, the same lemmas in the same order elsewhere in Plato, at least two of them rare."""
        sp = self.span(work, refs)
        mine = {i for i, _ in sp}
        ws = self.words[work]
        out, seen = [], set()
        for i, x in sp:
            if i + 2 >= len(ws) or i + 2 not in mine:
                continue
            k = (ws[i][2], ws[i + 1][2], ws[i + 2][2])
            if k in seen or not self.phrase_ok(k):
                continue
            others = [(w, j) for w, j in self.trigrams.get(k, []) if not (w == work and j in mine)]
            if not others or len(others) > MAX_SHARED:
                continue
            seen.add(k)
            here = " ".join(ws[i + d][3] for d in range(3))
            places = []
            for w, j in others:
                o = self.words[w]
                places.append({"work_id": w, "ref": o[j][0], "word": o[j][1], "words": " ".join(o[j + d][3] for d in range(3))})
            out.append({"lemmas": list(k), "ref": x[0], "word": x[1], "words": here, "elsewhere": places})
        return out


def check_diagram(ck, owner, d, work):
    """Every label of a diagram that carries a quotation is checked as Burnet's Greek at its section."""
    if d["kind"] not in DIAGRAMS:
        raise SystemExit(f"{owner}: diagram kind {d['kind']!r}")

    def walk(obj, path):
        if isinstance(obj, dict):
            if "quote" in obj and "ref" in obj:
                found = ck.plato(f"{owner}:{path}", obj.get("work", work), obj["ref"], obj["quote"])
                obj["found"] = found["found"]
                obj["cited_as"] = found["cited_as"]
            for k, v in obj.items():
                if isinstance(v, (dict, list)):
                    walk(v, f"{path}.{k}" if path else k)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f"{path}.{i}")
    walk(d, "")
    ck.stats["diagrams"] += 1
    return d


def build(db):
    stats = Counter()
    data = load()
    ck = Checker(db, stats)
    checks = web_checks()
    ids = [x["id"] for x in data["dossiers"]]
    if len(set(ids)) != len(ids):
        raise SystemExit("dossiers: an id is used twice")
    lem = Lemmas(db)
    have_concepts = db.execute("SELECT count(*) FROM sqlite_master WHERE name = 'concept_passage'").fetchone()[0]
    for k, x in enumerate(data["dossiers"]):
        did = x["id"]
        own = f"dossier:{did}"
        if x["kind"] not in KINDS:
            raise SystemExit(f"{own}: kind {x['kind']!r}")
        p = x["passage"]
        if p["work"] not in ck.src.imported:
            stats["dossiers not in this build"] += 1
            continue
        ck.span(own, p["work"], p["start"], p["end"])
        x["passage_evidence"] = [ck.plato(f"{own}:start", p["work"], p["start"], p["start_quote"]),
                                 ck.plato(f"{own}:end", p["work"], p["end"], p["end_quote"])]
        for i, part in enumerate(x.get("parts", [])):
            part["evidence"] = ck.plato(f"{own}:part:{i}", p["work"], part["ref"], part["quote"])
            stats["parts"] += 1
        for i, e in enumerate(x.get("echoes", [])):
            if e["work"] in ck.src.imported and e.get("end"):
                ck.span(f"{own}:echo:{i}", e["work"], e["ref"], e["end"])
            e["evidence"] = ck.plato(f"{own}:echo:{i}", e["work"], e["ref"], e["quote"])
            stats["echoes"] += 1
        for i, r in enumerate(x.get("related", [])):
            if r["dossier"] not in ids:
                stats.setdefault("not found", []).append(f"{own}: related to unknown dossier {r['dossier']!r}")
            r["evidence"] = [ck.ev(f"{own}:related:{i}", e) for e in r["evidence"]]
            stats["relations"] += 1
        for i, t in enumerate(x.get("testimonia", [])):
            t["evidence"] = ck.ev(f"{own}:testimony:{i}", t)
            stats["testimonia"] += 1
        for i, r in enumerate(x.get("renderings", [])):
            r["evidence"] = ck.plato(f"{own}:rendering:{i}", p["work"], r["ref"], r["grc"])
            r["found_in"] = {}
            for ed, words in r["by"].items():
                edition = f"{p['work']}.{ed}"
                ok, where = ck.english(edition, p["work"], r["ref"], words)
                label = db.execute("SELECT label FROM edition WHERE id = ?", (edition,)).fetchone()
                r["found_in"][ed] = {"words": words, "found": ok, "edition": edition, "label": label[0] if label else ed, **(where or {})}
                stats["renderings"] += 1
                stats["renderings found"] += ok
                if not ok:
                    stats.setdefault("not found", []).append(f"{own}: rendering of {r['grc']} in {edition} at {r['ref']} «{words}»")
        if x.get("diagram"):
            x["diagram"] = check_diagram(ck, f"{own}:diagram", x["diagram"], p["work"])
        web = []
        for w in perseus_links(x) + x.get("web", []):
            c = checks.get(w["url"])
            if w.get("auto") and c and not c["quotes"].get(w["quote"]):
                # Perseus serves some sections without their text: the generated link is not offered.
                stats["Perseus pages without the text (link not offered)"] += 1
                continue
            web.append(w)
            w["checked"] = c["checked"] if c else None
            w["status"] = c["status"] if c else None
            w["found"] = bool(c and c["quotes"].get(w["quote"]))
            stats["web links"] += 1
            stats["web quotations found"] += w["found"]
            if not w["found"]:
                stats.setdefault("web not found", []).append(f"{own}: {w['url']} «{w['quote']}»" + ("" if c else " (not checked: run tools/webcheck.py)"))
        x["web"] = web
        # Gathered by rule.
        seq = ck.order(p["work"])
        lo, hi = seq[p["start"]], seq[p["end"]]
        refs = [r for r, i in sorted(seq.items(), key=lambda kv: kv[1]) if lo <= i <= hi]
        named = notes_naming(db, keyword_rules(x), p["work"], lo, hi, seq) if x.get("keywords") else []
        for nid, word, placed in named:
            db.execute("INSERT INTO dossier_named VALUES (?,?,?,?)", (did, nid, word, placed))
            stats[f"notes naming a dossier, {placed}"] += 1
        only, dist = lem.vocab(p["work"], refs)
        for lemma, n, c in only:
            db.execute("INSERT INTO dossier_vocab VALUES (?,?,?,?,?,?)", (did, lemma, n, c, 1, "only here"))
            stats["words found only in a dossier's passage"] += 1
        for lemma, n, c, ratio in dist:
            db.execute("INSERT INTO dossier_vocab VALUES (?,?,?,?,?,?)", (did, lemma, n, c, lem.works_of.get(lemma, 0), f"{ratio:.0f}x"))
        shared = lem.shared(p["work"], refs)
        x["shared"] = shared
        stats["shared phrases"] += len(shared)
        if have_concepts:
            x["concepts"] = [dict(zip(("id", "label", "start_ref", "end_ref"), r)) for r in db.execute(
                "SELECT DISTINCT c.id, c.label, cp.start_ref, cp.end_ref FROM concept_passage cp JOIN concept c ON c.id = cp.concept_id "
                "JOIN section a ON a.work_id = cp.work_id AND a.ref = cp.start_ref JOIN section b ON b.work_id = cp.work_id AND b.ref = cp.end_ref "
                "WHERE cp.work_id = ? AND a.seq <= ? AND b.seq >= ? ORDER BY a.seq", (p["work"], hi, lo))]
        x["themes"] = [dict(zip(("id", "label", "kind", "start_ref", "end_ref"), r)) for r in db.execute(
            "SELECT DISTINCT t.id, t.label, t.kind, tp.start_ref, tp.end_ref FROM theme_passage tp JOIN theme t ON t.id = tp.theme_id "
            "JOIN section a ON a.work_id = tp.work_id AND a.ref = tp.start_ref JOIN section b ON b.work_id = tp.work_id AND b.ref = tp.end_ref "
            "WHERE tp.work_id = ? AND a.seq <= ? AND b.seq >= ?", (p["work"], hi, lo))]
        db.execute("INSERT INTO dossier VALUES (?,?,?,?,?,?,?,?,?,?)",
                   (did, x["label"], x.get("greek"), x["kind"], p["work"], p["start"], p["end"], x.get("group"), k,
                    json.dumps(x, ensure_ascii=False)))
        stats["dossiers"] += 1
    out = dict(stats)
    out["not found"] = stats.get("not found", [])
    out["web not found"] = stats.get("web not found", [])
    return out


def write_report(db, stats, path=REPORT):
    q = lambda sql, *a: db.execute(sql, a).fetchall()
    lines = ["# Passage dossiers: what the build found", "",
             "Written by `tools/build_db.py` (`tools/dossiers.py`) from `sources/dossiers/dossiers.json`; every figure is counted from the library.", "",
             f"**{stats.get('dossiers', 0)} dossiers. {stats.get('quotations found', 0):,} of {stats.get('quotations', 0):,} quotations found** "
             "in the texts they are said to be in (Burnet's Greek at the section named, the ancient texts, the notes). "
             f"**{stats.get('renderings found', 0)} of {stats.get('renderings', 0)} renderings** found in the translation at the section named (or the next). "
             f"**{stats.get('web quotations found', 0)} of {stats.get('web links', 0)} web pages** hold the words quoted from them "
             "(`tools/webcheck.py`, `sources/dossiers/web-checks.json`)."]
    nf = (stats.get("not found") or []) + (stats.get("web not found") or [])
    lines += ["", "Not found: none." if not nf else "Not found:", ""] + [f"- {x}" for x in nf]
    lines += ["", "## The dossiers", "",
              "| Dossier | Kind | Passage | Parts | Echoes in Plato | Testimonia | Renderings | Diagram | Web | Notes on it | Notes citing it | Notes naming it elsewhere | Only here | Shared phrases |",
              "|---|---|---|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|"]
    for did, label, kind, work, a, b, data in q("SELECT d.id, d.label, d.kind, w.title, d.start_ref, d.end_ref, d.data FROM dossier d JOIN work w ON w.id = d.work_id ORDER BY d.seq"):
        x = json.loads(data)
        refs = refs_between(db, x["passage"]["work"], a, b)
        marks = ",".join("?" * len(refs))
        on = q(f"SELECT count(*) FROM note WHERE work_id = ? AND start_ref IN ({marks}) AND (kind IS NULL OR kind != 'introduction')", x["passage"]["work"], *refs)[0][0]
        cit = q(f"SELECT count(DISTINCT note_id) FROM link WHERE to_work = ? AND to_ref IN ({marks}) AND certainty != 'unresolved'", x["passage"]["work"], *refs)[0][0]
        el = q("SELECT count(*) FROM dossier_named WHERE dossier_id = ? AND placed = 'elsewhere'", did)[0][0]
        only = q("SELECT count(*) FROM dossier_vocab WHERE dossier_id = ? AND kind = 'only here'", did)[0][0]
        lines.append(f"| {label} | {kind} | {work} {a}–{b} | {len(x.get('parts', []))} | {len(x.get('echoes', []))} | {len(x.get('testimonia', []))} | "
                     f"{len(x.get('renderings', []))} | {x['diagram']['kind'] if x.get('diagram') else ''} | {len(x.get('web', []))} | {on} | {cit} | {el} | {only} | {len(x.get('shared', []))} |")
    lines += ["", "*Notes on it*: notes placed on a section of the passage (any commentator or translator, the scholia). "
              "*Notes citing it*: notes anywhere that cite a section of it (the citation web). *Notes naming it elsewhere*: notes placed elsewhere "
              "that name it by one of its keywords (found by rule). *Only here*: lemmas GLAUx tags in the passage and nowhere else in Plato. "
              "*Shared phrases*: three words with the same lemmas in the same order elsewhere in Plato, two of them rare "
              f"(fewer than {RARE} occurrences in Plato), and found in at most {MAX_SHARED} other places."]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def refs_between(db, work, a, b):
    seq = structure.ref_range(db, work)
    return [r for r, i in sorted(seq.items(), key=lambda kv: kv[1]) if seq[a] <= i <= seq[b]]


def markdown(d):
    """A dossier as a Markdown study sheet (the reader's Export): what was written for it, with every
    quotation and where it is, the Greek and the translations of the span, and what the library gathers."""
    q = lambda s: (s or "").replace("\n", " ").strip()
    found = lambda e: "" if e.get("found") else " *(not found in the text named)*"
    out = [f"# {d['label']}" + (f" ({d['greek']})" if d.get("greek") else ""), "",
           f"*{d['title']} {d['start_ref']}–{d['end_ref']}*, {d['kind']}. Platonic Workshop dossier `{d['id']}`.", "",
           f"> {q(d.get('about'))}", "", "*(The Workshop's own sentence on what is gathered here.)*", "",
           "Where it begins and ends (Burnet's Greek):", ""]
    out += [f"- {e['cited_as']}: «{e['quote']}»{found(e)}" for e in d.get("passage_evidence", [])]
    if d.get("parts"):
        out += ["", "## Its stages", ""] + [f"- **{p['label']}**, {p['ref']}: «{p['quote']}»{found(p['evidence'])}" for p in d["parts"]]
    for e in d.get("editions", []):
        if not e["chunks"]:
            continue
        out += ["", f"## {e['label']}" + (" (Greek)" if e["lang"] == "grc" else ""), ""]
        if e.get("align_method") and e["lang"] != "grc":
            out += [f"*Placed: {e['align_method']}.*", ""]
        cur = None
        for c in e["chunks"]:
            if c["section_ref"] != cur:
                cur = c["section_ref"]
                out += ["", f"**{cur}**" + (" (begins before the passage)" if c.get("continued") else "")]
            out.append(q(c["text"]))
    if d.get("renderings"):
        out += ["", "## How the translators render its key words", "", "| Greek | At | " + " | ".join(
            v["label"] for v in d["renderings"][0]["found_in"].values()) + " |", "|---|---|" + "---|" * len(d["renderings"][0]["found_in"])]
        for r in d["renderings"]:
            out.append(f"| {r['term']} | {r['ref']} | " + " | ".join(f"{v['words']}" + ("" if v["found"] else " (not found)") for v in r["found_in"].values()) + " |")
    if d.get("diagram"):
        out += ["", f"## Diagram: {d['diagram'].get('title', '')}", "", q(d["diagram"].get("about")), ""]
    if d.get("echoes"):
        out += ["", "## Where Plato returns to it", ""] + [f"- {e.get('title', e['work'])} {e['ref']}: «{e['quote']}». {e['why']}{found(e['evidence'])}" for e in d["echoes"]]
    if d.get("related"):
        out += ["", "## Tied to other dossiers", ""]
        for r in d["related"]:
            out.append(f"- **{r.get('label', r['dossier'])}**: {r['why']} " + "; ".join(f"{e['cited_as']}: «{e['quote']}»{found(e)}" for e in r["evidence"]))
    if d.get("testimonia"):
        out += ["", "## Ancient and later readers", ""] + [f"- {t['says']} {t['evidence']['cited_as']}: «{t['quote']}»{found(t['evidence'])}" for t in d["testimonia"]]
    if d.get("notes"):
        out += ["", "## Notes on the passage", ""]
        for n in d["notes"]:
            body = re.sub(r"<[^>]+>", "", n.get("body_html") or "")
            out.append(f"- **{n['who']}**, {n['start_ref']}: {q(body)[:1200]}" + ("…" if n.get("long") else ""))
    if d.get("cited_by"):
        out += ["", "## Notes elsewhere that cite it", ""] + [f"- {l['commentator']} on {l['from_title']} {l['from_ref']} (cites {l['to_ref']}): {q(l['excerpt'])}" for l in d["cited_by"] if not l["inside"]]
    el = [n for n in d.get("named", []) if n["placed"] == "elsewhere"]
    if el:
        out += ["", "## Notes elsewhere that name it (found by rule, by the word in brackets)", ""] + [f"- {n['commentator']} on {n['title']} {n['start_ref']} [{n['word']}]: {q(n['excerpt'])}" for n in el]
    if d.get("vocab"):
        out += ["", "## Its vocabulary (GLAUx lemmas, machine-tagged)", "",
                "Only here in Plato: " + (", ".join(v["lemma"] for v in d["vocab"] if v["kind"] == "only here") or "none") + ".",
                "Far more frequent here than in Plato as a whole: " + (", ".join(f"{v['lemma']} ({v['here']} of {v['plato']}, {v['kind']})" for v in d["vocab"] if v["kind"] != "only here") or "none") + "."]
    if d.get("shared"):
        out += ["", "## Phrases shared with other passages (found by rule)", ""] + [
            f"- {s['ref']} «{s['words']}» = " + "; ".join(f"{p['title']} {p['ref']} «{p['words']}»" for p in s["elsewhere"]) for s in d["shared"]]
    if d.get("web"):
        out += ["", "## Open resources", ""] + [f"- [{w['site']}: {w['title']}]({w['url']}): “{w['quote']}”" + (f" (checked {w['checked']})" if w.get("found") else " (quotation not found when checked)") for w in d["web"]]
    if d.get("mine"):
        out += ["", "## Your translations and notes on it", ""] + [f"- {m.get('kind', '')} {m.get('start_ref', '')}: {q(m.get('body') or m.get('text') or '')}" for m in d["mine"]]
    return "\n".join(out) + "\n"
