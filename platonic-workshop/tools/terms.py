"""Milestone 17: key terms linked in the text, opening beside it.

The term list is every concept of the concept index (milestone 10: the index
written by hand, the Definitions, Taylor's Platonic terms, Alcinous, the
scholia), with what sources/terms/terms.json adds: the Neoplatonic vocabulary
(the One, procession and return, the henads, bound and the infinite, life...),
Taylor's English forms of each term with a quotation that shows him using them,
fixed English phrases ("the Good", capitalised as printed), and a one-line
plain meaning in the Workshop's own words.

How a word in the reader is marked (underlined) as a term:

  Greek     a word is marked when GLAUx's lemma for it is one of the term's
            lemmas. For a very common word (the concept index marks it
            "broad", or terms.json gives the rule "with-article") only where
            Plato uses it as a name, neuter with the article: τὸ ἕν, τὸ ὄν,
            τὸ γιγνόμενον. A lemma with the rule "none" is listed, not marked.
  English   a word is marked only where the Greek of the same section has one
            of the term's marked words (so "good" is marked only above
            ἀγαθός), or where a fixed phrase is printed as given, capitals
            and all ("the Good").

Which terms are marked at all: the "key" terms, those gathered from anything
but the Definitions alone (Taylor's terms, the index written by hand,
Alcinous, the scholia, the later Platonists) and every term of terms.json.
A term only the Definitions define (day, bone, festival) is in the list, and
opens from the word box, but is not underlined.

Every quotation is looked for in the text it names, as in the concept index,
and reports/terms.md lists any not found. Written into term, term_lemma,
term_form and term_hit (every marked word).
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import concepts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "sources" / "terms" / "terms.json"
INTRO = ROOT / "texts" / "taylor-1804" / "vol1" / "general-introduction.json"
REPORT = ROOT / "reports" / "terms.md"
RULES = ("all", "with-article", "none")
GLAUX = "glaux-plato"
ARTICLE = "ὁ"
# Little words that may stand between the article and its word (τὸ δὲ ὄν, τὸ μὲν ἕν), as GLAUx lemmatises them.
BETWEEN = {"δέ", "μέν", "γάρ", "οὖν", "τε", "γε", "δή", "ἄρα", "τοι", "που", "αὖ"}
TAYLOR_INTRO = "Taylor, General Introduction to the Works of Plato (1804)"


def load():
    return json.loads(SOURCE.read_text(encoding="utf-8"))


class Evidence(concepts.Sources):
    """The concept index's sources, and two more: Taylor's General Introduction
    ('taylor-introduction') and the English of a translation at a Stephanus
    section ('translation': edition, work, ref)."""

    def __init__(self, db):
        super().__init__(db)
        d = json.loads(INTRO.read_text(encoding="utf-8"))
        self.intro = [s for s in d["segments"] if s.get("part") == "text"]

    def check(self, ev):
        src = ev["source"]
        if src == "taylor-introduction":
            q = concepts.eng(ev["quote"])
            for s in self.intro:
                if q in concepts.eng(s["text"]):
                    page = s.get("page_1804")
                    return True, s["id"], TAYLOR_INTRO + (f", p. {page}" if page else ""), None
            return False, None, TAYLOR_INTRO, None
        if src == "translation":
            ed = self.db.execute("SELECT e.label, e.responsible, w.title FROM edition e JOIN work w ON w.id = e.work_id WHERE e.id = ?",
                                 (ev["edition"],)).fetchone()
            if not ed:
                return None, ev["ref"], f"{ev['edition']} {ev['ref']}", None
            rows = self.db.execute("SELECT text FROM chunk WHERE edition_id = ? AND section_ref = ?", (ev["edition"], ev["ref"])).fetchall()
            text = concepts.eng(" ".join(r[0] for r in rows))
            who = (ed[1] or ed[0]).split(" and ")[0]
            return concepts.eng(ev["quote"]) in text, ev["ref"], f"{who}, {ed[2]} {ev['ref']}", None
        return super().check(ev)


def gather(db):
    """Every concept as a term, with terms.json's additions. -> list of term dicts."""
    hand = load()
    rows = db.execute("SELECT id, label, greek, layer, origin, seq FROM concept ORDER BY seq").fetchall()
    lemmas = defaultdict(list)
    for cid, lemma, broad in db.execute("SELECT concept_id, lemma, broad FROM concept_term ORDER BY concept_id, n"):
        lemmas[cid].append({"lemma": lemma, "rule": "with-article" if broad else "all", "why": "the concept index marks it as mostly the ordinary word" if broad else ""})
    glossary = defaultdict(list)
    for r in concepts.load_defined()["taylor_terms"]:
        glossary[r["concept"]].append(r["segment"])
    terms, by = [], {}
    for cid, label, greek, layer, origin, seq in rows:
        origin = json.loads(origin)
        t = {"id": cid, "label": label, "greek": greek, "concept": cid, "layer": layer, "origin": origin,
             "key": any(o != "Definitions" for o in origin), "lemmas": lemmas[cid], "english": [], "phrases": [],
             "plain": None, "glossary": glossary[cid], "neoplatonic": False}
        terms.append(t)
        by[cid] = t
    tagged = {r[0] for r in db.execute("SELECT DISTINCT lemma FROM lemma_count")}
    untagged = []
    for h in hand["terms"]:
        t = by.get(h["id"])
        if t is None:
            if not h.get("label"):
                raise SystemExit(f"terms: new term {h['id']!r} needs a label")
            if h.get("concept") and h["concept"] not in by:
                raise SystemExit(f"terms: {h['id']}: unknown concept {h['concept']!r}")
            t = {"id": h["id"], "label": h["label"], "greek": h.get("greek", ""), "concept": h.get("concept"), "layer": None,
                 "origin": [], "key": True, "lemmas": [], "english": [], "phrases": [], "plain": None,
                 "glossary": list(glossary.get(h.get("concept"), [])) if h.get("concept") else [], "neoplatonic": False}
            terms.append(t)
            by[h["id"]] = t
        t["key"] = h.get("key", True)
        t["neoplatonic"] = bool(h.get("neoplatonic"))
        for k in ("label", "greek", "plain"):
            if h.get(k):
                t[k] = h[k]
        if "Neoplatonic vocabulary" not in t["origin"] and h.get("neoplatonic"):
            t["origin"].append("Neoplatonic vocabulary")
        for x in h.get("lemmas", []):
            x = {"lemma": x, "rule": "all", "why": ""} if isinstance(x, str) else {"why": "", **x}
            if x["rule"] not in RULES:
                raise SystemExit(f"terms: {h['id']}: rule {x['rule']!r}")
            if x["lemma"] not in tagged:     # not in this build (a build of a few works), or a slip in terms.json
                untagged.append(f"{h['id']}: {x['lemma']}")
                continue
            old = next((y for y in t["lemmas"] if y["lemma"] == x["lemma"]), None)
            if old:
                old.update(x)
            else:
                t["lemmas"].append(x)
        t["english"] += h.get("english", [])
        t["phrases"] += h.get("phrases", [])
        t["related"] = h.get("related", [])
        t["passages"] = h.get("passages", [])
        t["later"] = h.get("later", [])
        if "key" in h and not h["key"]:
            t["key_why"] = h.get("why") or "a topic of Alcinous' physics or of the senses, not a term of Plato's or the Platonists' vocabulary"
    for t in terms:
        if not t["english"]:
            t["english"] = label_forms(db, t)
    return terms, untagged


def label_forms(db, t):
    """For a term terms.json says nothing of: its English name, when a definition the index quotes
    begins with it (Burges' Definitions, Taylor's terms). 'Courage (andreia)' -> 'courage'."""
    name = re.sub(r"\s*\(.*?\)\s*", " ", t["label"]).strip()
    name = re.sub(r"^(The|the)\s+", "", name)
    if not name or " and " in name or len(name) < 3:
        return []
    for src, quote in db.execute("SELECT e.source_text, e.quote FROM concept_cite c JOIN evidence e ON e.owner = c.owner "
                                 "WHERE c.concept_id = ? AND c.kind = 'definition' AND e.found = 1 ORDER BY c.n", (t["id"],)):
        if re.match(r"\W*(the\s+)?" + re.escape(name) + r"\b", quote, re.I):
            return [{"form": name.lower(), "source": src, "quote": quote, "auto": True}]
    return []


def articular(prev, tag, form="", except_=()):
    """Is the word (its GLAUx tag) neuter, with the article before it in the same case and number
    (τὸ ἕν, τοῦ ὄντος, τὰ γιγνόμενα), at most two little words between (τὸ δὲ ὄν)?"""
    pos = tag["postag"] or ""
    if len(pos) < 9 or pos[6] != "n":
        return False
    if prev and f"{prev[-1]['form']} {form}" in except_:
        return False
    for p in reversed(prev[-3:]):
        if p["lemma"] == ARTICLE:
            pp = p["postag"] or ""
            return len(pp) >= 9 and pp[2] == pos[2] and pp[7] == pos[7] and pp[6] in "n-"
        if p["lemma"] not in BETWEEN:
            return False
    return False


def find_hits(db, terms):
    """Every word of Plato marked as a term: (term_id, token_id, work_id, section_ref, form)."""
    by_lemma = defaultdict(list)
    for t in terms:
        for x in t["lemmas"]:
            if x["rule"] != "none":
                by_lemma[x["lemma"]].append((t["id"], x["rule"], tuple(x.get("except", ()))))
    rows = db.execute("SELECT k.id, k.chunk_id, k.section_ref, k.form, e.work_id, g.part, g.lemma, g.postag FROM token k "
                      "JOIN edition e ON e.id = k.edition_id LEFT JOIN tag g ON g.token_id = k.id AND g.source_id = ? "
                      "ORDER BY k.id, g.part", (GLAUX,))
    out = []
    prev, chunk, last = [], None, None
    for tid, cid, ref, form, work, part, lemma, postag in rows:
        if cid != chunk:
            prev, chunk = [], cid
        tag = {"lemma": lemma, "postag": postag, "form": form}
        if lemma in by_lemma:
            for term_id, rule, except_ in by_lemma[lemma]:
                if rule == "all" or articular(prev, tag, form, except_):
                    if (term_id, tid) != last:
                        out.append((term_id, tid, work, ref, form))
                        last = (term_id, tid)
        prev.append(tag)
    return sorted(set(out), key=lambda r: (r[0], r[1]))


def count(stats, ok, what):
    if ok is None:
        stats["quotations not checked (work not in this build)"] += 1
        return
    stats["quotations"] += 1
    stats["quotations found"] += bool(ok)
    if not ok:
        stats.setdefault("not found", []).append(what)


def build(db):
    """Called by build_db.py after concepts.build. Returns the figures for the report."""
    stats = Counter()
    src = Evidence(db)
    terms, untagged = gather(db)
    stats["lemmas of terms.json not tagged in this build"] = untagged
    ids = [t["id"] for t in terms]
    if len(set(ids)) != len(ids):
        raise SystemExit("terms: an id is used twice")
    known = set(ids)
    for seq, t in enumerate(terms):
        extra = {"passages": [], "later": []}
        for p in t.get("passages", []):
            ok, at, cited, _ = src.check({"source": "plato", "work": p["work"], "ref": p["start"], "quote": p["quote"]})
            count(stats, ok, f"{t['id']}: passage {p['work']} {p['start']} «{p['quote']}»")
            extra["passages"].append({**p, "found": ok})
        for x in t.get("later", []):
            ok, at, cited, nid = src.check(x)
            count(stats, ok, f"{t['id']}: later {x['source']} «{x['quote']}»")
            extra["later"].append({**x, "found": ok, "cited_as": cited, "at": at, "note_id": nid})
        if t.get("key_why"):
            extra["not_underlined"] = t["key_why"]
        db.execute("INSERT INTO term VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                   (t["id"], t["label"], t["greek"], t["concept"], int(t["key"]), t["plain"], json.dumps(t["origin"], ensure_ascii=False),
                    json.dumps(t["glossary"]), json.dumps([r for r in t.get("related", []) if r in known]), json.dumps(extra, ensure_ascii=False), seq))
        for n, x in enumerate(t["lemmas"]):
            db.execute("INSERT INTO term_lemma VALUES (?,?,?,?,?)", (t["id"], n, x["lemma"], x["rule"], x.get("why") or None))
        for kind, key in (("english", "form"), ("phrase", "phrase")):
            for n, ev in enumerate(t["english"] if kind == "english" else t["phrases"]):
                form = ev[key]
                ok, at, cited, _ = src.check(ev)
                has = (form.lower() in ev["quote"].lower()) if kind == "english" else (form in ev["quote"])
                count(stats, None if ok is None else bool(ok and has), f"{t['id']}: {kind} “{form}” in {ev['source']} {ev.get('ref', '')} «{ev['quote']}»")
                db.execute("INSERT INTO term_form VALUES (?,?,?,?,?,?,?,?,?)",
                           (t["id"], kind, n, form, ev["source"], ev["quote"], None if ok is None else int(bool(ok and has)), cited, int(bool(ev.get("auto")))))
        for r in t.get("related", []):
            if r not in known:
                raise SystemExit(f"terms: {t['id']}: related term {r!r} unknown")
    hits = find_hits(db, terms)
    db.executemany("INSERT INTO term_hit VALUES (?,?,?,?,?)", hits)
    key = {t["id"] for t in terms if t["key"]}
    per = Counter(h[0] for h in hits)
    stats["terms"] = len(terms)
    stats["key terms (underlined)"] = len(key)
    stats["new terms (not in the concept index)"] = sum(1 for t in terms if not t["layer"])
    stats["terms with a plain meaning"] = sum(1 for t in terms if t["plain"])
    stats["terms with Taylor's glossary entry"] = sum(1 for t in terms if t["glossary"])
    stats["English forms"] = sum(len(t["english"]) for t in terms)
    stats["fixed phrases"] = sum(len(t["phrases"]) for t in terms)
    stats["words marked (key terms)"] = sum(n for t, n in per.items() if t in key)
    stats["words of key terms, rule with-article"] = sum(1 for t in terms if t["key"] for x in t["lemmas"] if x["rule"] == "with-article")
    stats["most marked"] = [[t, n] for t, n in per.most_common() if t in key][:12]
    stats["key terms marked nowhere in Plato"] = sorted(t for t in key if not per.get(t))
    return stats


def write_report(db, stats, path=REPORT):
    terms = db.execute("SELECT id, label, greek, key, plain, origin, glossary FROM term ORDER BY seq").fetchall()
    lem = defaultdict(list)
    for tid, lemma, rule in db.execute("SELECT term_id, lemma, rule FROM term_lemma ORDER BY term_id, n"):
        lem[tid].append(lemma + ("" if rule == "all" else f" ({rule})"))
    forms = defaultdict(list)
    for tid, kind, form, found in db.execute("SELECT term_id, kind, form, found FROM term_form ORDER BY term_id, kind, n"):
        forms[tid].append(("“" + form + "”" if kind == "phrase" else form) + ("" if found else " (not found)"))
    count = dict(db.execute("SELECT term_id, count(*) FROM term_hit GROUP BY term_id").fetchall())
    lines = ["# Key terms in the text (milestone 17)", "",
             "Written by `tools/terms.py` when the library is built; every figure is counted from the build.", "",
             f"**{stats['terms']} terms, {stats['key terms (underlined)']} of them underlined in the reader.** "
             f"{stats['words marked (key terms)']:,} words of Plato are marked. "
             f"{stats.get('quotations found', 0)} of {stats.get('quotations', 0)} quotations behind the English forms and phrases were found "
             "in the texts they are said to be in.", "",
             "A term is underlined when it is gathered from anything but the Definitions alone (see `tools/terms.py`). "
             "For a very common word, only its uses as a name, neuter with the article (τὸ ἕν, τὸ ὄν), are marked.", ""]
    nf = stats.get("not found", [])
    lines += ["## Quotations not found", ""] + ([f"- {x}" for x in nf] or ["None."]) + [""]
    lines += ["## Most marked", "", "| Term | Words |", "|---|---:|"] + [f"| {t} | {n:,} |" for t, n in stats["most marked"]] + [""]
    lines += ["## Every term", "", "| Term | Greek words (rule) | English forms and “phrases” | Underlined | Words | Plain meaning | Taylor's glossary |",
              "|---|---|---|---|---:|---|---|"]
    for tid, label, greek, key, plain, origin, gl in terms:
        lines.append(f"| {label} (`{tid}`) | {', '.join(lem[tid]) or '–'} | {', '.join(forms[tid]) or '–'} | {'yes' if key else 'no'} | "
                     f"{count.get(tid, 0):,} | {'yes' if plain else '–'} | {len(json.loads(gl)) or '–'} |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
