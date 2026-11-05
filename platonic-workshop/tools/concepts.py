"""Milestone 10: the concept index across the dialogues.

The index is written by hand in sources/concepts/concepts.json: twenty-five
Platonic concepts, each with

  terms        the GLAUx lemmas it is indexed under (checked: the lemma must be
               tagged in the corpus); the reader shows where each occurs
  definitions  quotations: the Definitions (Hermann's Greek, Burges' English),
               Taylor's 'Explanation of Certain Platonic Terms', Alcinous
  passages     Plato's passages, each with a quotation of Burnet's Greek at its
               first section; for a later doctrine, the note that reads it there
  later        quotations from the later Platonists (Alcinous, Proclus) and
               Taylor, from the ancient texts or the notes in the library
  related      relations to other concepts, each resting on a quotation
  layer        plato | plato-later | later: Plato's own, or the later
               Platonists' systematic form, or a later doctrine only

Every quotation is looked for in the text it names, and reports/concepts.md
lists any not found. Nothing is linked because two places share a word: the
words a concept is indexed under are shown as words (lexical evidence), and
the notes placed on its passages that name it are shown as found by rule,
with the word that names it.
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ancient  # noqa: E402
import structure  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "sources" / "concepts" / "concepts.json"
DEFINED = ROOT / "sources" / "concepts" / "sources.json"
TERMS = ROOT / "texts" / "taylor-1804" / "vol1" / "platonic-terms.json"
REPORT = ROOT / "reports" / "concepts.md"
LAYERS = ("plato", "plato-later", "later", "academy")
TAYLOR_TERMS = "Taylor, 'Explanation of Certain Platonic Terms' (1804)"


def load():
    return json.loads(SOURCE.read_text(encoding="utf-8"))


def eng(s):
    """Comparison form for English (and the OCR): one space, same quotes, lower case."""
    return ancient.norm(s, "eng").lower()


def grc(s):
    return ancient.norm(s.replace("ϑ", "θ"), "grc").lower()


def load_defined():
    return json.loads(DEFINED.read_text(encoding="utf-8"))


def book_text(path):
    """A later Platonist in Taylor's English, OCR as received: words broken at a line end joined."""
    t = (ROOT / path).read_text(encoding="utf-8", errors="replace")
    return ancient.norm(re.sub(r"[¬-]\s*\n\s*", "", t))


class Sources(structure.Texts):
    """structure.Texts, and two more kinds of source: Taylor's Platonic terms,
    and a note in the library ('note': by, work, ref)."""

    def __init__(self, db):
        super().__init__(db)
        for d in self.docs.values():
            if d["lang"] == "grc":       # Hermann's OCR prints ϑ for θ
                for s in d["sections"]:
                    s["text"] = s["text"].replace("ϑ", "θ")
        t = json.loads(TERMS.read_text(encoding="utf-8"))
        self.terms = [s for s in t["segments"] if s.get("part") == "text"]
        self.books = load_defined()["books"]
        self._book = {}

    def book(self, ev):
        b = self.books[ev["source"]]
        if ev["source"] not in self._book:
            self._book[ev["source"]] = [eng(book_text(f)) for f in b["files"]]
        q = eng(ev["quote"])
        for k, t in enumerate(self._book[ev["source"]]):
            if q in t:
                return True, (f"vol. {k + 1}" if len(b["files"]) > 1 else None), b["cite"] + (f", vol. {k + 1}" if len(b["files"]) > 1 else "")
        return False, None, b["cite"]

    def taylor_term(self, quote):
        q = eng(quote)
        for s in self.terms:
            if q in eng(s["text"]):
                head = re.split(r"[.,(]", s["text"], maxsplit=1)[0].strip()
                return s, f"{TAYLOR_TERMS}, s.v. {head}"
        return None, TAYLOR_TERMS

    def note(self, ev):
        """-> (found, ref, cited_as, note_id)."""
        if ev["work"] not in self.imported:
            return None, ev["ref"], f"{ev['by']}, {ev['work']} {ev['ref']}", None
        rows = self.db.execute("SELECT n.id, n.note_key, n.body, c.lang FROM note n LEFT JOIN commentary c ON c.id = n.commentary_id "
                               "WHERE n.commentator = ? AND n.work_id = ? AND n.start_ref = ? ORDER BY n.seq, n.id",
                               (ev["by"], ev["work"], ev["ref"])).fetchall()
        title = self.db.execute("SELECT title FROM work WHERE id = ?", (ev["work"],)).fetchone()[0]
        for nid, key, body, lang in rows:
            f = grc if lang == "grc" else eng
            if f(ev["quote"]) in f(body):
                return True, ev["ref"], f"{ev['by']}, on {title} {ev['ref']}" + (f" ({key})" if key else ""), nid
        return False, ev["ref"], f"{ev['by']}, on {title} {ev['ref']}", None

    def check(self, ev):
        """-> (found, at, cited_as, note_id) for any kind of source."""
        src = ev["source"]
        if src == "note":
            return self.note(ev)
        if src in self.books:
            ok, at, cited = self.book(ev)
            return ok, at, cited, None
        if src == "taylor-terms":
            s, cited = self.taylor_term(ev["quote"])
            return (s is not None), (s["id"] if s else None), cited, None
        if src not in self.docs and src != "plato":
            raise SystemExit(f"concepts: unknown source {src!r}")
        ok, at, cited = self.find(ev)
        return ok, at, cited, None


def cut(text, start, stops, cap=180):
    """A definition as quoted: from its heading to the first stop (at least a few words on)."""
    m = re.compile(stops).search(text, start + 12)
    end = m.start() if m else len(text)
    q = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text[start:min(end, start + cap)])
    return re.sub(r"\s+", " ", re.sub(r"\s\S*-$", "", q.strip())).strip()


def same(a, b):
    a, b = eng(a), eng(b)
    return a in b or b in a


SENSE = re.compile(r'<div class="sense l(\d)">')
LSJ_CITE = re.compile(r'(?:<span lang="grc">((?:(?!</span>).)*)</span>\s*)?<span class="bibl plato" data-work="(tlg\d+)" data-ref="(\d+[a-e]?)"', re.S)


def lsj_plato(html):
    """LSJ's citations of Plato in one entry, as the lexicon build rendered it: per sense, its number,
    its glosses (LSJ's <tr>, as printed) and each place of Plato with the Greek LSJ quotes there, if any."""
    out = []
    parts = SENSE.split(html)
    chunks = [("", parts[0])] + list(zip(parts[1::2], parts[2::2]))
    for _, chunk in chunks:
        sn = re.search(r'<b class="sn">([^<]*)</b>', chunk)
        tr = [re.sub(r"<[^>]+>", "", t).strip(" ,;:.") for t in re.findall(r'<em class="tr">(.*?)</em>', chunk, re.S)]
        for m in LSJ_CITE.finditer(chunk):
            q = re.sub(r"<[^>]+>", "", m.group(1)).strip(" ,;:") if m.group(1) else None
            out.append({"sense": sn.group(1).strip().rstrip(".") if sn else "", "gloss": "; ".join(t for t in tr if t)[:200],
                        "work": m.group(2), "ref": m.group(3), "quote": q or None})
    return out


def lsj_found(src, seqs, work, ref, quote):
    """Is LSJ's quotation in Burnet's Greek at the place cited, or the next two sections? A word LSJ
    abbreviates to its first letters ('ψ.') may stand for any form of it; LSJ's dots of omission are gaps."""
    if work not in src.imported or ref not in seqs.setdefault(work, structure.ref_range(src.db, work)):
        return None
    toks = []
    for t in re.split(r"\s+", quote.replace("…", " … ").replace("...", " … ")):
        if t in ("…", "") or not re.search(r"\w", t):
            if t == "…":
                toks.append(r"(?:\S+ ){0,12}?")
            continue
        n = ancient.norm(t, "grc")
        if not n:
            continue
        toks.append(re.escape(n) + (r"\S*" if t.rstrip(",;:·").endswith(".") else "") + " ")
    if not toks:
        return None
    pat = re.compile("(?<!\\S)" + "".join(toks).rstrip())
    by_seq = {v: k for k, v in seqs[work].items()}
    k = seqs[work][ref]
    text = " ".join(src.plato(work, by_seq[i]) for i in range(k, k + 3) if i in by_seq)
    return bool(pat.search(text.replace("  ", " ") + " "))


def gather(src):
    """The whole index: the concepts written by hand (concepts.json), and every term the
    sources define (sources.json): each definition of the Definitions, in Burges' English and
    Hermann's Greek, and each of Taylor's Platonic terms, added to a concept of concepts.json
    or making one of its own; and the later Platonists' readings added to them."""
    d, x = load(), load_defined()
    concepts = [dict(c, origin=["index"], untagged=[]) for c in d["concepts"]]
    by = {c["id"]: c for c in concepts}
    tagged = {r[0] for r in src.db.execute("SELECT DISTINCT lemma FROM lemma_count")}

    def concept(cid, label, layer, note, greek=""):
        if cid not in by:
            if not label:
                raise SystemExit(f"concepts: new concept {cid!r} needs a label")
            by[cid] = {"id": cid, "label": label, "greek": greek, "layer": layer, "note": note, "terms": [], "keywords": {},
                       "definitions": [], "passages": [], "later": [], "related": [], "origin": [], "untagged": []}
            concepts.append(by[cid])
        return by[cid]

    def word(c, lemma, note):
        if not lemma or any(t["lemma"] == lemma for t in c["terms"]) or lemma in c["untagged"]:
            return
        if lemma in tagged:
            c["terms"].append({"lemma": lemma, "note": note})
        else:
            c["untagged"].append(lemma)
        if not c["greek"]:
            c["greek"] = lemma

    def define(c, e):
        if not any(same(e["quote"], o["quote"]) for o in c["definitions"]):
            c["definitions"].append(e)

    pages = {s["n"]: s["text"] for s in src.docs["definitions-burges"]["sections"]}
    greek = " ".join(s["text"] for s in src.docs["definitions-hermann"]["sections"])
    for r in x["definitions"]:
        c = concept(r["concept"], r.get("label"), "academy",
                    "Defined in the Definitions (Ὅροι), the collection of definitions from Plato's school printed with his works.")
        if "Definitions" not in c["origin"]:
            c["origin"].append("Definitions")
        raw = pages[str(r["page"])]
        m = re.search(re.escape(r["english"]) + r"\S{0,3}\s*[^\w\s]{0,4}\d?\s*(—|--)", raw)
        if not m:
            raise SystemExit(f"concepts: no heading {r['english']!r} on Burges p. {r['page']}")
        define(c, {"source": "definitions-burges", "quote": cut(raw, m.start(), r"[;.](\s|$)|\n\n"),
                   "says": f"The Definitions, in Burges' English (p. {r['page']}), under “{r['english']}”."})
        if r["greek"]:
            i = greek.find(r["greek"])
            if i < 0:
                raise SystemExit(f"concepts: no Greek headword {r['greek']!r} in Hermann's Definitions")
            while i > 0 and not greek[i - 1].isspace():
                i -= 1
            define(c, {"source": "definitions-hermann", "quote": cut(greek, i, r"[.;:\"·᾽’]\s"),
                       "says": "The Definitions, in Hermann's Greek (OCR as received)."})
        word(c, r.get("lemma"), "the word the Definitions define")
    segs = {s["id"]: s for s in src.terms}
    for r in x["taylor_terms"]:
        c = concept(r["concept"], r.get("label"), "later",
                    "Explained in Taylor's 'Explanation of Certain Platonic Terms' (1804): the vocabulary of the later Platonists that his translations use.")
        if "Taylor's terms" not in c["origin"]:
            c["origin"].append("Taylor's terms")
        t = segs[r["segment"]]["text"]
        head = re.split(r"[.,(]", t, maxsplit=1)[0].strip()
        define(c, {"source": "taylor-terms", "quote": cut(t, 0, r"\.(\s|$)", 240), "says": f"Taylor, s.v. {head}."})
        for lemma in r.get("lemmas", []):
            word(c, lemma, "the Greek word of Taylor's entry")
    for r in x["alcinous"]:
        c = concept(r["concept"], r.get("label"), "plato-later",
                    "A topic of Alcinous' handbook of Platonism (Didaskalikos, 2nd c. AD), which sets out Plato's doctrine chapter by chapter.")
        if "Alcinous" not in c["origin"]:
            c["origin"].append("Alcinous")
        c["later"].append({"source": "alcinous-burges", "quote": r["quote"], "says": f"Alcinous, Handbook of Platonism, ch. {r['chapter']}."})
        for lemma in r.get("lemmas", []):
            word(c, lemma, "the word of Alcinous' chapter")
    for r in x["scholia"]:
        c = concept(r["concept"], r.get("label"), "later",
                    "Named in the Greek scholia on Plato (Hermann's Scholia Platonica): the ancient notes on the dialogues, some of them Neoplatonic.")
        if "scholia" not in c["origin"]:
            c["origin"].append("scholia")
        c["later"].append({"source": "note", "by": "Scholia (Hermann)", "work": r["work"], "ref": r["ref"], "quote": r["quote"], "says": r["says"]})
        for lemma in r.get("lemmas", []):
            word(c, lemma, "the word of the scholion")
    for r in x["relations"]:
        if r["from"] not in by or r["concept"] not in by:
            raise SystemExit(f"concepts: relation {r['from']} -> {r['concept']}: unknown concept")
        by[r["from"]]["related"].append({k: v for k, v in r.items() if k != "from"})
    for r in x["later"]:
        if r["concept"] not in by:
            raise SystemExit(f"concepts: later reading for unknown concept {r['concept']!r}")
        c = by[r["concept"]]
        c["later"].append({k: r[k] for k in ("source", "quote", "says")})
        if "later Platonists" not in c["origin"]:
            c["origin"].append("later Platonists")
    return concepts


def add(db, src, owner, ev, stats):
    ok, at, cited, nid = src.check(ev)
    db.execute("INSERT INTO evidence (owner, source_text, work_id, at, quote, found, cited_as, note_id) VALUES (?,?,?,?,?,?,?,?)",
               (owner, ev["source"], ev.get("work"), at, ev["quote"], None if ok is None else int(ok), cited, nid))
    if ok is None:
        stats["quotations not checked (work not in this build)"] += 1
    else:
        stats["quotations"] += 1
        stats["quotations found"] += ok
        if not ok:
            stats.setdefault("not found", []).append(f"{owner}: {ev['source']} {ev.get('work', '')} {ev.get('ref', '')} «{ev['quote']}»".replace("  ", " "))
    return ok, cited, nid


def keyword_rules(c):
    """The words a note names the concept by: English as written (case kept if
    any capital is given), Greek without accents."""
    en = c["keywords"].get("en", [])
    lower = [x for x in en if x == x.lower()]
    upper = [x for x in en if x != x.lower()]
    rules = []
    if lower:
        rules.append(("eng", re.compile(r"\b(?:" + "|".join(re.escape(x) for x in lower) + r")\b", re.I)))
    if upper:
        rules.append(("eng", re.compile(r"\b(?:" + "|".join(re.escape(x) for x in upper) + r")\b")))
    gk = c["keywords"].get("grc", [])
    if gk:
        rules.append(("grc", re.compile(r"(?<!\w)(?:" + "|".join(re.escape(grc(x)) for x in gk) + r")")))
    return rules


def build(db):
    """Called by build_db.py after structure.build. Returns the figures for the report."""
    stats = Counter()
    d = load()
    src = Sources(db)
    concepts = gather(src)
    ids = [c["id"] for c in concepts]
    if len(set(ids)) != len(ids):
        raise SystemExit("concepts: an id is used twice")
    tagged = {r[0]: (r[1], r[2]) for r in db.execute("SELECT lemma, sum(n), count(*) FROM lemma_count GROUP BY lemma")}
    lang_of = {r[0]: r[1] for r in db.execute("SELECT id, lang FROM commentary")}
    categories = d["categories"]
    for k, c in enumerate(concepts):     # all first: a relation may name a later concept
        if c["layer"] not in LAYERS:
            raise SystemExit(f"concept {c['id']}: layer {c['layer']!r}")
        db.execute("INSERT INTO concept VALUES (?,?,?,?,?,?,?,?,?)",
                   (c["id"], c["label"], c["greek"], c["layer"], c["note"], json.dumps(c["keywords"], ensure_ascii=False), k,
                    json.dumps(c["origin"]), json.dumps(c["untagged"], ensure_ascii=False) if c["untagged"] else None))
        stats["concepts"] += 1
        stats[f"concepts from {' and '.join(c['origin'])}"] += 1
        stats["words not tagged in Plato"] += len(c["untagged"])
    cw = d["compared_words"]
    for k, w in enumerate(cw["named_in_prompt"] + cw["more"]):
        if w not in tagged:      # a partial corpus (the tests' small builds) may lack it
            stats.setdefault("terms not tagged", []).append(f"compared word: {w}")
        db.execute("INSERT INTO compared_word VALUES (?,?,?)", (w, int(w in cw["named_in_prompt"]), k))
        stats["words compared across translators"] += 1
    for name, about in categories.items():
        db.execute("INSERT INTO concept_category VALUES (?,?,?)", (name, about, list(categories).index(name)))
    lsj_n = 0
    seqs = {}
    lemmas = list(dict.fromkeys([t["lemma"] for c in concepts for t in c["terms"]] + cw["named_in_prompt"] + cw["more"]))
    for lemma in lemmas:
        rows = db.execute("SELECT e.html FROM lemma_entry le JOIN lex_entry e ON e.id = le.entry_id WHERE le.lemma = ? AND le.lexicon_id = 'lsj' ORDER BY e.id", (lemma,)).fetchall()
        if not rows:
            stats.setdefault("words not in LSJ", []).append(lemma)
            continue
        for (html,) in rows:
            for x in lsj_plato(html):
                found = lsj_found(src, seqs, x["work"], x["ref"], x["quote"]) if x["quote"] else None
                db.execute("INSERT INTO lsj_plato VALUES (?,?,?,?,?,?,?,?)", (lemma, lsj_n, x["sense"], x["gloss"], x["work"], x["ref"], x["quote"], found))
                lsj_n += 1
                stats["LSJ citations of Plato"] += 1
                stats["LSJ quotations " + {True: "found", False: "not found as printed", None: "not checked (no quotation, or not in this build)"}[found]] += 1
    for c in concepts:
        cid = c["id"]
        for i, t in enumerate(c["terms"]):
            n, works = tagged.get(t["lemma"], (0, 0))
            db.execute("INSERT INTO concept_term VALUES (?,?,?,?,?,?,?)", (cid, i, t["lemma"], t.get("note"), int(bool(t.get("broad"))), n, works))
            stats["terms"] += 1
            if not n:
                stats.setdefault("terms not tagged", []).append(f"{cid}: {t['lemma']}")
        for kind in ("definitions", "later"):
            for i, e in enumerate(c[kind]):
                owner = f"concept:{cid}:{kind}:{i}"
                ok, cited, nid = add(db, src, owner, e, stats)
                db.execute("INSERT INTO concept_cite VALUES (?,?,?,?,?,?,?)", (cid, kind[:-1] if kind == "definitions" else "later", i, e["source"], e["says"], owner, nid))
                stats[kind] += 1
        rules = keyword_rules(c)
        for i, p in enumerate(c["passages"]):
            if p["work"] not in src.imported:
                stats["passages not in this build"] += 1
                continue
            seq = structure.ref_range(db, p["work"])
            if p["start"] not in seq or p["end"] not in seq or seq[p["end"]] < seq[p["start"]]:
                raise SystemExit(f"concept {cid}: no such span {p['work']} {p['start']}-{p['end']}")
            owner = f"concept:{cid}:passage:{i}"
            ok, _, _ = add(db, src, owner, {"source": "plato", "work": p["work"], "ref": p["start"], "quote": p["quote"]}, stats)
            read_by = []
            for j, e in enumerate(p.get("read_by", [])):
                _, cited, nid = add(db, src, f"{owner}:read:{j}", e, stats)
                read_by.append(nid)
            db.execute("INSERT INTO concept_passage VALUES (?,?,?,?,?,?,?,?,?)",
                       (cid, i, p["work"], p["start"], p["end"], p["quote"], None if ok is None else int(ok), p["why"], int(bool(p.get("read_by")))))
            stats["passages"] += 1
            # Notes placed on the passage that name the concept, by rule.
            for nid, who, ref, body in structure.notes_in(db, p["work"], p["start"], p["end"]):
                lang = db.execute("SELECT c.lang FROM note n LEFT JOIN commentary c ON c.id = n.commentary_id WHERE n.id = ?", (nid,)).fetchone()[0]
                for rl, rx in rules:
                    if rl == "eng" and lang == "grc":
                        continue
                    m = rx.search(grc(body) if rl == "grc" else body)
                    if m:
                        db.execute("INSERT INTO concept_named VALUES (?,?,?,?)", (cid, i, nid, m.group(0)))
                        stats["notes naming a concept on its passages"] += 1
                        break
        for i, r in enumerate(c["related"]):
            if r["concept"] not in ids:
                raise SystemExit(f"concept {cid}: related to unknown {r['concept']!r}")
            owner = f"concept:{cid}:related:{i}"
            for e in r["evidence"]:
                add(db, src, owner, e, stats)
            if r.get("category") not in categories:
                raise SystemExit(f"concept {cid}: relation to {r['concept']} has no known category ({r.get('category')!r})")
            db.execute("INSERT INTO concept_relation VALUES (?,?,?,?,?,?,?)", (cid, i, r["concept"], r["kind"], r["why"], owner, r["category"]))
            stats["relations"] += 1
    out = dict(stats)
    out["not found"] = stats.get("not found", [])
    out["terms not tagged"] = stats.get("terms not tagged", [])
    return out


def write_report(db, stats, path=REPORT):
    q = lambda sql, *a: db.execute(sql, a).fetchall()
    lines = ["# The concept index: what the build found", "",
             "Written by `tools/build_db.py` (milestone 10, `tools/concepts.py`) from `sources/concepts/concepts.json`; every figure is counted from the library.", "",
             f"**{stats.get('quotations found', 0):,} of {stats.get('quotations', 0):,} quotations found** in the texts they are said to be in "
             "(Burnet's Greek at the section named; the Definitions, Alcinous; Taylor's Platonic terms; Taylor's Plotinus, Proclus' Theology and Iamblichus; the notes, by commentator and place)."]
    nf = stats.get("not found") or []
    lines += ["", "Not found: none." if not nf else "Not found:", ""] + [f"- {x}" for x in nf]
    nt = stats.get("terms not tagged") or []
    lines += ["", "Every term is a lemma GLAUx tags in the corpus." if not nt else "Terms not tagged in the corpus: " + "; ".join(nt) + "."]
    n = q("SELECT count(*) FROM concept")[0][0]
    lines += ["", f"## {n} concepts, and where they come from", "",
              "Each concept was gathered from one or more of: **index** (written for the index, `concepts.json`), **Definitions** (an entry of the Definitions, Hermann's Greek and Burges' English), "
              "**Taylor's terms** (an entry of Taylor's 'Explanation of Certain Platonic Terms'), **later Platonists** (a reading of Alcinous, Plotinus, Proclus or Iamblichus, quoted from the library). "
              "The mapping of each defined term to a concept is by hand (`sources/concepts/sources.json`); the words of each definition are cut by rule from the text.", "",
              "| Gathered from | Concepts |", "|---|---:|"]
    for origin, k in q("SELECT origin, count(*) FROM concept GROUP BY origin ORDER BY count(*) DESC"):
        lines.append(f"| {', '.join(json.loads(origin))} | {k} |")
    lines += ["", "| Layer | Concepts |", "|---|---:|"] + [f"| {l} | {k} |" for l, k in q("SELECT layer, count(*) FROM concept GROUP BY layer ORDER BY count(*) DESC")]
    unt = q("SELECT label, untagged FROM concept WHERE untagged IS NOT NULL ORDER BY seq")
    if unt:
        lines += ["", "Greek words of a concept that GLAUx does not tag anywhere in Plato (later words, or filed otherwise): "
                  + "; ".join(f"{l}: {', '.join(json.loads(u))}" for l, u in unt) + "."]
    lines += ["", "## Kinds of relation", "", "| Category | About | Relations |", "|---|---|---:|"]
    for name, about in q("SELECT name, about FROM concept_category ORDER BY seq"):
        lines.append(f"| {name} | {about} | {q('SELECT count(*) FROM concept_relation WHERE category = ?', name)[0][0]} |")
    lx = dict(q("SELECT coalesce(found, -1), count(*) FROM lsj_plato GROUP BY 1"))
    lines += ["", "## LSJ's citations of Plato", "",
              f"Under the concept index's words, LSJ cites {sum(lx.values()):,} places of Plato (read from its entries in the lexicon tables). "
              f"{lx.get(1, 0) + lx.get(0, 0):,} come with a Greek quotation: {lx.get(1, 0):,} are word for word in Burnet at the place cited "
              f"(or the next two sections); {lx.get(0, 0):,} are not, because LSJ adapts its quotations (the case or order of words, a word left out). "
              f"{lx.get(-1, 0):,} cite the place without a quotation." + (f" Not in LSJ: {', '.join(stats['words not in LSJ'])}." if stats.get("words not in LSJ") else "")]
    lines += ["", "## Words compared across the translators", "",
              "Passage by passage (`/api/renderings/<lemma>`, `#renderings/<lemma>` in the reader): the six the build prompt names, then the chief words of the index.", "",
              ", ".join(f"{w}{' (named)' if named else ''}" for w, named in q("SELECT lemma, named FROM compared_word ORDER BY seq")) + "."]
    lines += ["", "## The concepts", "",
              "Layer: **plato**, Plato names it and argues about it; **plato-later**, Plato names it and the later Platonists give it its systematic form; "
              "**later**, a later doctrine or term, with the passages the later readers read it in; **academy**, defined in the Definitions of Plato's school.", "",
              "| Concept | Layer | Terms (words in the corpus) | Definitions | Passages | Later readings | Related | Notes naming it on its passages |",
              "|---|---|---|---:|---:|---:|---:|---:|"]
    for cid, label, layer in q("SELECT id, label, layer FROM concept ORDER BY seq"):
        terms = ", ".join(f"{l} ({n:,})" for l, n in q("SELECT lemma, occurrences FROM concept_term WHERE concept_id = ? ORDER BY n", cid)) or "none"
        cnt = lambda t, *w: q(f"SELECT count(*) FROM {t} WHERE concept_id = ?" + "".join(f" AND {x}" for x in w), cid)[0][0]
        lines.append(f"| {label} | {layer} | {terms} | {cnt('concept_cite', 'kind = \"definition\"')} | {cnt('concept_passage')} | "
                     f"{cnt('concept_cite', 'kind = \"later\"')} | {cnt('concept_relation')} | {q('SELECT count(DISTINCT note_id) FROM concept_named WHERE concept_id = ?', cid)[0][0]} |")
    lines += ["", "## Passages by dialogue", "", "| Dialogue | Concept passages |", "|---|---:|"]
    for t, n in q("SELECT w.title, count(*) FROM concept_passage p JOIN work w ON w.id = p.work_id GROUP BY w.id ORDER BY count(*) DESC, w.id"):
        lines.append(f"| {t} | {n} |")
    lines += ["", "## Notes naming a concept, by commentator", "",
              "A note placed on one of a concept's passages that names it by one of its keywords (found by rule; read the note).", "",
              "| Commentator | Notes |", "|---|---:|"]
    for who, n in q("SELECT n.commentator, count(DISTINCT n.id) FROM concept_named c JOIN note n ON n.id = c.note_id GROUP BY n.commentator ORDER BY 2 DESC"):
        lines.append(f"| {who} | {n} |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
