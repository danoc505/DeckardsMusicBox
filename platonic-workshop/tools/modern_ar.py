"""Milestone 35: modern English of Aristotle, written for the Workshop, checked against the Greek.

As milestone 27 did for the Neoplatonists (tools/modern_neo.py), for Aristotle: a plain rendering of each chapter,
paragraph by paragraph, every idea kept, in short sentences and today's words. Where public-domain English is on the
shelf (Taylor, the Oxford translation of 1928, Owen, Thompson, Kenyon ...), the modern version modernises it, checked
line by line against the Greek, and follows the Greek where they differ; where there is none, it is made fresh from the
Greek. Each version is labelled as the Workshop's own and machine-assisted: it was drafted with an AI model, and no
scholar has checked it yet.

The master copy is plain text, in the format of milestone 27 (described at its head):
sources/translations/modern/aristotle-<slug>.txt

  @treatise <abbr> | <title>          the work, with its summary on the lines after
  @ch <abbr>.<chapter> | <title>      a chapter of the Greek (Cat.5; for a work in books, NE.I.5), its gist after
  @taylor <n> <n> ... | none          Taylor's chapters shown with it (by default the one of the same number)
  @p, @greek, !flag, !note            as in milestone 27; a flag quotes an English on the shelf word for word

This tool turns it into sources/translations/modern/aristotle-<slug>.json, which the reader shows at
#neo-modern/aristotle-<slug>, and checks it (reports/modern_ar.md):

  * every chapter of the work's Greek (First1KGreek's TEI, tools/aristotle_f1k.py; for the Metaphysics, Perseus' TEI,
    tools/aristotle.py) has a modern version, once, in order; a long work done a few books a session ("done_books")
    wants only the chapters of the books done so far;
  * every @greek start is found in its chapter's Greek, in order; the Greek from one start to the next is kept with the
    paragraph, with the Bekker columns it lies on (the reader's own columns, from tools/aristotle_f1k.sections_of);
  * every flag's words are found word for word in Taylor's chapters named for the chapter, or anywhere in another
    English of the work on the shelf (texts/aristotle/<slug>/*.json, the OCR as received, cleaned by rule);
  * the key words are rendered the same way throughout (sources/translations/modern/terms-greek.json), as in milestone 27.

It needs the Greek, from data/raw/ (python3 tools/fetch_sources.py first).

    python3 tools/modern_ar.py            build the JSON and the report
    python3 tools/modern_ar.py --check    only check; exit 1 on a problem
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import modern  # noqa: E402
from modern_neo import LINE, TERMS, check_terms, norm  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MODERN = ROOT / "sources" / "translations" / "modern"
AR_TEXTS = ROOT / "texts" / "aristotle"
REPORT = ROOT / "reports" / "modern_ar.md"
SCHEMA = "platonic-workshop/modern-ar-v1"
ROMAN = {r: i for i, r in enumerate(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"], 1)}

LABEL = ("The Workshop's modern English, machine-assisted: drafted with an AI model (Claude) and not yet checked by a scholar. "
         "The Greek of each paragraph, and Taylor's English of each chapter, are one tap away.")

# The English on the shelf for each work: {file stem: label}; the first is shown beside the modern version.
TEXTS = {
    "aristotle-categories": {
        "work": "ar006",
        "slug": "categories",
        "title": "The Categories in modern English",
        "english": {"taylor-1812": "Taylor (1812)", "oxford-1928": "Edghill, Oxford (1928)", "owen-1853": "Owen (1853)"},
        "taylor_title": "Taylor, The Categories (1812)",
        "about": "A modern English version of Aristotle's Categories, written for the Workshop. It modernises the public-domain "
                 "English on the shelf, E. M. Edghill's in the Oxford translation (1928), checked sentence by sentence against "
                 "the Greek, Bekker's text (Oxford, 1837) as First1KGreek gives it; where the old English and the Greek differ, the "
                 "modern version follows the Greek. It is compared with Thomas Taylor's translation (1812), the English the "
                 "Platonists' Workshop reads beside it, and with Owen's (1853): where an older English says something the Greek "
                 "does not, or the Greek is hard, a flag shows the older words and the difference. The chapters are Bekker's; the "
                 "short titles and summaries are the Workshop's. The Platonists read the Categories first of all Aristotle's "
                 "works, after Porphyry's Introduction: it is about simple words as they signify things, by way of thoughts.",
    },
    "aristotle-on-interpretation": {
        "work": "ar017",
        "slug": "on-interpretation",
        "title": "On Interpretation in modern English",
        "english": {"taylor-1812": "Taylor (1812)", "oxford-1928": "Edghill, Oxford (1928)", "owen-1853": "Owen (1853)"},
        "taylor_title": "Taylor, On Interpretation (1812)",
        "about": "A modern English version of Aristotle's On Interpretation, written for the Workshop. It modernises the public-domain "
                 "English on the shelf, E. M. Edghill's in the Oxford translation (1928), checked sentence by sentence against "
                 "the Greek, Bekker's text (Oxford, 1837) as First1KGreek gives it; where the old English and the Greek differ, the "
                 "modern version follows the Greek, and where the OCR of Edghill's pages has lost a passage, it follows the Greek "
                 "with Owen (1853) and Taylor (1812) beside it. Where an older English says something the Greek does not, or the "
                 "Greek is hard, a flag shows the older words and the difference. The chapters are Bekker's; the short titles and "
                 "summaries are the Workshop's. The Platonists read On Interpretation second, after the Categories: the Categories "
                 "is about simple words, this work about words joined into statements that are true or false.",
    },
    "aristotle-prior-analytics": {
        "work": "ar001",
        "slug": "prior-analytics",
        "books": True,
        "title": "The Prior Analytics in modern English",
        "english": {"taylor-1812": "Taylor (1812)", "oxford-1928": "Jenkinson, Oxford (1928)", "owen-1853": "Owen (1853)"},
        "taylor_title": "Taylor, The Prior Analytics (1812)",
        "about": "A modern English version of Aristotle's Prior Analytics, written for the Workshop. It modernises the public-domain "
                 "English on the shelf, A. J. Jenkinson's in the Oxford translation (1928), checked sentence by sentence against "
                 "the Greek, Ross's text (Oxford, 1964) as First1KGreek gives it; where the old English and the Greek differ, the "
                 "modern version follows the Greek, and where the OCR of Jenkinson's pages has lost words, it follows the Greek "
                 "with Owen (1853) and Taylor (1812) beside it. Where an older English says something the Greek does not, or "
                 "the Greek is hard, a flag shows the older words and the difference. The books and chapters are Bekker's; the "
                 "short titles and summaries are the Workshop's. Taylor numbers the chapters of Book II his own way, so each "
                 "chapter names the chapters of his that hold it. The Platonists read the Prior Analytics third, after the "
                 "Categories and On Interpretation: the Categories is about simple terms, On Interpretation about statements, "
                 "and this work about statements joined into syllogisms.",
    },
    "aristotle-metaphysics": {
        "work": "ar025",
        "slug": "metaphysics",
        "books": True,
        "done_books": [1, 2, 3, 4], # 35m1 (I, II), 35m2 (III, IV); each later sub-milestone adds its books (ROADMAP, 35m3 to 35m8)
        "title": "The Metaphysics in modern English",
        "english": {"taylor-1801": "Taylor (1801)", "ross-1908": "Ross, Oxford (1908)"},
        "taylor_title": "Taylor, The Metaphysics (1801)",
        "about": "A modern English version of Aristotle's Metaphysics, written for the Workshop, a few books at a time: so far "
                 "Books Α, α, Β and Γ (I to IV). It modernises the public-domain English on the shelf, W. D. Ross's in the Oxford "
                 "translation (1908), checked sentence by sentence against the Greek, Ross's own later text (Oxford, 1924) as "
                 "Perseus gives it; where the old English and the Greek differ, the modern version follows the Greek. It is "
                 "compared with Thomas Taylor's translation (1801), the English the Platonists' Workshop reads beside it: where "
                 "an older English says something the Greek does not, or the Greek is hard, a flag shows the older words and the "
                 "difference. The books and chapters are Bekker's; the short titles and summaries are the Workshop's. Taylor "
                 "divides Book Α into seven chapters, not ten, and Book Γ into seven, not eight, so each chapter names the chapter "
                 "of his that holds it. The "
                 "Platonists read the Metaphysics last of Aristotle's works, as the summit of the course: the science of the "
                 "first causes and principles, which Aristotle calls wisdom and theology.",
    },
}


# Works whose Greek is Perseus' (tools/aristotle.py), not First1KGreek's: the edition, as the report names it.
PERSEUS = {"ar025": {"editor": "Ross", "label": "Oxford, 1924 (Perseus)"}}


def chapter_key(cid):
    """'Cat.5' -> (None, 5); 'NE.I.5' -> (1, 5)."""
    parts = cid.split(".")
    if len(parts) == 2:
        return None, int(parts[1])
    return ROMAN[parts[1]], int(parts[2])


def parse(src):
    """The master copy as the work, chapters and paragraphs (milestone 27's format, @taylor for each chapter)."""
    treatises, chapters, paras = [], [], []
    cur = None
    for n, raw in enumerate(src.splitlines(), 1):
        line = raw.rstrip()
        if line.startswith("#"):
            continue
        m = LINE.match(line)
        if m:
            kind, rest = m.groups()
            if kind in ("treatise", "ch"):
                key, _, title = rest.partition("|")
                cur = {"id": key.strip(), "title": title.strip(), "summary": [], "line": n}
                if kind == "treatise":
                    cur["chapters"] = []
                    treatises.append(cur)
                else:
                    if not treatises:
                        raise ValueError(f"line {n}: @ch before the @treatise")
                    cur["treatise"] = treatises[-1]["id"]
                    treatises[-1]["chapters"].append(cur["id"])
                    chapters.append(cur)
            elif kind == "taylor":
                if not chapters or cur is not chapters[-1]:
                    raise ValueError(f"line {n}: @taylor belongs right after its @ch")
                cur["taylor"] = [] if rest.strip() == "none" else [int(x) for x in rest.split()]
            elif kind == "p":
                if not chapters:
                    raise ValueError(f"line {n}: @p before the first @ch")
                k = sum(1 for p in paras if p["chapter"] == chapters[-1]["id"]) + 1
                cur = {"seg": f"{chapters[-1]['id']}.p{k}", "chapter": chapters[-1]["id"], "lines": [], "flags": [],
                       "notes": [], "greek_start": None, "line": n}
                paras.append(cur)
            else:
                if not cur or "lines" not in cur:
                    raise ValueError(f"line {n}: @greek outside a paragraph")
                cur["greek_start"] = rest.strip()
            continue
        if line.startswith("!flag ") or line.startswith("!note "):
            if not cur or "lines" not in cur:
                raise ValueError(f"line {n}: {line[:5]} outside a paragraph")
            if line.startswith("!flag "):
                words, sep, why = line[6:].partition(" | ")
                if not sep:
                    raise ValueError(f"line {n}: !flag <older words> | <why>")
                cur["flags"].append({"words": words.strip(), "why": why.strip()})
            else:
                cur["notes"].append(line[6:].strip())
            continue
        if cur is None:
            if line.strip():
                raise ValueError(f"line {n}: text before the @treatise")
            continue
        (cur["lines"] if "lines" in cur else cur["summary"]).append(line)
    for x in treatises + chapters:
        x["summary"] = " ".join(s.strip() for s in x["summary"] if s.strip())
    for p in paras:
        p["modern"] = re.sub(r"\n{2,}", "\n", "\n".join(p.pop("lines")).strip())
    return treatises, chapters, paras


def greek_chapters_perseus(work_id):
    """The same, for a work whose Greek is Perseus' TEI (the Metaphysics: Ross's text of 1924), read by the walker the
    reader is built with (tools/aristotle.py): each piece is one Bekker column, and each chapter begins a piece."""
    import xml.etree.ElementTree as ET
    import aristotle
    work = aristotle.WORK_BY_ID[work_id]
    f = sorted((aristotle.RAW / aristotle.GREEK_SRC / "data" / "tlg0086" / work["tlg"]).glob("*-grc*.xml"))[0]
    g = aristotle.BekkerWalker(ET.parse(f).getroot())
    opens = {i: (int(b), int(c)) for b, c, i in g.chapter_chunks}
    out, key = {}, None
    for i, c in enumerate(g.chunks):
        key = opens.get(i, key)
        if key is None or not c["text"].strip():
            continue
        ch = out.setdefault(key, {"text": "", "cols": []})
        if ch["text"]:
            ch["text"] += " "
        ch["cols"].append((len(ch["text"]), c["section"]))
        ch["text"] += norm(c["text"])
    return out


def greek_chapters(work_id):
    """{(book, chapter): {'text': the chapter's Greek on one line, 'cols': [(start, column)]}} as the reader has it."""
    if work_id in PERSEUS:
        return greek_chapters_perseus(work_id)
    import aristotle_f1k
    work = aristotle_f1k.WORK_BY_ID[work_id]
    paras, _ = aristotle_f1k.read_tei(work)
    glaux, glaux_cols = aristotle_f1k.glaux_words(work)
    carried = None
    if work.get("columns") == "english":
        import aristotle_organon
        carried = aristotle_organon.carried_marks(work, paras)
    pieces = aristotle_f1k.sections_of(paras, glaux_cols, glaux, carried, work.get("bekker"))[0]
    out = {}
    starts = {}
    for k, p in enumerate(paras):
        ch = out.setdefault((p["book"], p["chapter"]), {"text": "", "cols": []})
        if ch["text"]:
            ch["text"] += " "
        starts[k] = (ch, len(ch["text"]))
        ch["text"] += norm(p["text"])
    for k, a, b, col in pieces:
        ch, at = starts[k]
        t = paras[k]["text"]
        while a < b and t[a].isspace():
            a += 1
        ch["cols"].append((at + len(norm(t[:a] + "x")) - 1, col))     # the place in the text on one line, in NFC
    return out


def english(meta):
    """{stem: (label, {chapter: text on one line}, whole text on one line)} of each English of the work on the shelf."""
    out = {}
    for stem, label in meta["english"].items():
        d = json.loads((AR_TEXTS / meta["slug"] / f"{stem}.json").read_text(encoding="utf-8"))
        by_ch = {}
        for p in d["paragraphs"]:
            key = (p.get("book"), p.get("chapter")) if meta.get("books") else p.get("chapter")
            by_ch.setdefault(key, []).append(p["text"])
        out[stem] = (label, {c: norm(" ".join(t)) for c, t in by_ch.items()},
                     norm(" ".join(p["text"] for p in d["paragraphs"])), {c: t for c, t in by_ch.items()})
    return out


def build(text_id, terms=None, greek_chs=None, eng=None):
    """The JSON the reader shows, and the problems found (a list of strings)."""
    meta = TEXTS[text_id]
    terms = terms or json.loads(TERMS.read_text(encoding="utf-8"))
    treatises, chapters, paras = parse((MODERN / f"{text_id}.txt").read_text(encoding="utf-8"))
    greek_chs = greek_chs if greek_chs is not None else greek_chapters(meta["work"])
    if meta.get("done_books"):      # a long work done a few books a session: only the books done so far are wanted
        greek_chs = {k: v for k, v in greek_chs.items() if k[0] in meta["done_books"]}
    eng = eng if eng is not None else english(meta)
    taylor_stem = next(iter(meta["english"]))
    problems = []
    books = sorted({k[0] for k in greek_chs}) if meta.get("books") else [None]
    if len(treatises) != len(books):
        problems.append(f"{text_id}: one @treatise for the work, or for each of its books, is wanted ({len(books)})")
    for t in treatises:
        for cid in t["chapters"]:
            if meta.get("books") and not cid.startswith(t["id"] + "."):
                problems.append(f"{text_id} {cid}: a chapter under the @treatise of another book ({t['id']})")
    # Every chapter of the Greek, once, in order.
    want = sorted(greek_chs, key=lambda k: (k[0] or 0, k[1] or 0))
    have = []
    for c in chapters:
        try:
            have.append(chapter_key(c["id"]))
        except (KeyError, ValueError, IndexError):
            problems.append(f"{text_id} {c['id']}: not a chapter id (Cat.5, NE.I.5)")
    if have != want:
        problems.append(f"{text_id}: the chapters are {have}, the Greek has {want}")
    by_ch = {}
    for p in paras:
        by_ch.setdefault(p["chapter"], []).append(p)
    greek, cols = {}, {}
    for c in chapters:
        try:
            g = greek_chs.get(chapter_key(c["id"]))
        except (KeyError, ValueError, IndexError):
            g = None
        ps = by_ch.get(c["id"], [])
        if g is None:
            problems.append(f"{text_id} {c['id']}: no such chapter in the Greek")
            continue
        if not ps:
            problems.append(f"{text_id} {c['id']}: no paragraphs")
            continue
        text = g["text"]
        starts, pos = [], 0
        for k, p in enumerate(ps):
            if k == 0:
                if p["greek_start"]:
                    problems.append(f"{text_id} {p['seg']}: the first paragraph of a chapter begins with it, and needs no @greek")
                starts.append(0)
                continue
            s = norm(p["greek_start"] or "")
            i = text.find(s, pos) if s else -1
            if i < 0:
                problems.append(f"{text_id} {p['seg']}: Greek start not found (in order) in {c['id']}: {p['greek_start']!r}")
                starts.append(None)
                continue
            starts.append(i)
            pos = i + len(s)
        for k, p in enumerate(ps):
            if starts[k] is None:
                continue
            j = next((x for x in starts[k + 1:] if x is not None), len(text))
            greek[p["seg"]] = text[starts[k]:j].strip()
            before = [col for at, col in g["cols"] if at <= starts[k]]
            inside = [col for at, col in g["cols"] if starts[k] < at < j]
            here = ([before[-1]] if before else []) + inside
            cols[p["seg"]] = [x for i, x in enumerate(here) if x not in here[:i]]
    # Taylor's chapters for each chapter, and the flags.
    tay_label, tay_ch, _, tay_paras = eng[taylor_stem]

    def tkey(c, n):
        """Taylor's chapter n for the chapter c: in a work in books, his chapter n of the same book."""
        return (chapter_key(c["id"])[0], n) if meta.get("books") else n

    for c in chapters:
        if "taylor" not in c:
            try:
                c["taylor"] = [chapter_key(c["id"])[1]]
            except (KeyError, ValueError, IndexError):
                c["taylor"] = []
        for n in c["taylor"]:
            if tkey(c, n) not in tay_ch:
                problems.append(f"{text_id} {c['id']}: Taylor has no chapter {n}")
        if not c["summary"] or not c["title"]:
            problems.append(f"{text_id} {c['id']}: a chapter needs a short title and a summary")
    by_id = {c["id"]: c for c in chapters}
    for p in paras:
        if not p["modern"]:
            problems.append(f"{text_id} {p['seg']}: no modern text")
        c = by_id[p["chapter"]]
        here = " ".join(tay_ch.get(tkey(c, n), "") for n in c["taylor"])
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{text_id} {p['seg']}: a flag with no reason")
            w = norm(f["words"])
            if len(w.split()) < 3:
                problems.append(f"{text_id} {p['seg']}: a flag should quote at least three words: {f['words']!r}")
            if w in here:
                f["in"] = tay_label
                continue
            found = next((lab for stem, (lab, _, whole, _) in eng.items() if stem != taylor_stem and w in whole), None)
            if found:
                f["in"] = found
            else:
                problems.append(f"{text_id} {p['seg']}: flagged words not in Taylor's chapter or another English of the work: {f['words']!r}")
    for t in treatises:
        if not t["summary"]:
            problems.append(f"{text_id} {t['id']}: no summary")
    links = check_terms(text_id, paras, greek, terms, problems)
    def tbook(c):
        return f"Book {list(ROMAN)[chapter_key(c['id'])[0] - 1]}, " if meta.get("books") else ""

    if meta["work"] in PERSEUS:
        import aristotle as aristotle_f1k
        w = {"title": aristotle_f1k.WORK_BY_ID[meta["work"]]["title"], **PERSEUS[meta["work"]]}
    else:
        import aristotle_f1k
        w = aristotle_f1k.WORK_BY_ID[meta["work"]]
    d = {
        "schema": SCHEMA,
        "text": text_id,
        "kind": "aristotle",
        "title": meta["title"],
        "author": "Aristotle",
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL,
        "made_from": "english and greek",
        "work": meta["work"],
        "work_slug": meta["slug"],
        "greek_text": meta["work"],
        "greek_info": {"title": w["title"], "edition": f"{w['editor']}, {w['label']}"},
        "taylor_work": f"texts/aristotle/{meta['slug']}/{taylor_stem}.json",
        "taylor_title": meta["taylor_title"],
        "english": [{"file": f"texts/aristotle/{meta['slug']}/{stem}.json", "label": lab} for stem, lab in meta["english"].items()],
        "about": meta["about"],
        "source": f"sources/translations/modern/{text_id}.txt",
        "treatises": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "chapters": t["chapters"]} for t in treatises],
        "chapters": [{"id": c["id"], "treatise": c["treatise"], "title": c["title"], "summary": c["summary"],
                      "taylor": [{"n": n, "label": f"{tbook(c)}Chapter {n}", "text": "\n\n".join(tay_paras.get(tkey(c, n), []))}
                                 for n in c["taylor"] if tkey(c, n) in tay_paras]}
                     for c in chapters],
        "paragraphs": [],
        "links": links,
    }
    for p in paras:
        item = {"seg": p["seg"], "chapter": p["chapter"], "modern": p["modern"], "greek": greek.get(p["seg"], ""),
                "cols": cols.get(p["seg"], [])}
        if p["flags"]:
            item["flags"] = [{"taylor": f["words"], "in": f.get("in", ""), "why": f["why"]} for f in p["flags"]]
        if p["notes"]:
            item["notes"] = p["notes"]
        d["paragraphs"].append(item)
    return d, problems


def report(results):
    lines = ["# Modern English of Aristotle (milestone 35)", "",
             "Written by `tools/modern_ar.py` from `sources/translations/modern/aristotle-*.txt`. " + LABEL, ""]
    for text_id, (d, problems) in results.items():
        ps = d["paragraphs"]
        flags = [(p["seg"], f) for p in ps for f in p.get("flags", [])]
        lines += [f"## {d['title']}", "",
                  f"- The Greek: {d['greek_info']['edition']}{'' if d['work'] in PERSEUS else ', from First1KGreek'}; the English compared: "
                  f"{', '.join(e['label'] for e in d['english'])}.",
                  f"- Chapters: {len(d['chapters'])}, every one of the Greek's, each with a short title and a summary.",
                  f"- Paragraphs: {len(ps)}, each with its Greek and its Bekker columns.",
                  f"- Words: {sum(len(p['modern'].split()) for p in ps):,} modern, {sum(len(p['greek'].split()) for p in ps):,} Greek.",
                  f"- Sentences (each can be marked in the reader): {sum(len(modern.sentences(p['modern'])) for p in ps):,}.",
                  f"- Flags (where an older English and the Greek differ, or the Greek is hard): {len(flags)}.",
                  f"- Problems found: {len(problems)}.", ""]
        if problems:
            lines += ["### Problems", ""] + [f"- {x}" for x in problems] + [""]
        lines += ["### Flags", "", "| Paragraph | In | Older words | Why |", "|---|---|---|---|"]
        for seg, f in flags:
            lines.append(f"| {seg} | {f['in']} | {f['taylor'].replace('|', '/')} | {f['why'].replace('|', '/')} |")
        lines += [""]
    return "\n".join(lines).rstrip() + "\n"


def build_all(write=True):
    terms = json.loads(TERMS.read_text(encoding="utf-8"))
    results = {tid: build(tid, terms) for tid in TEXTS}
    if write:
        for tid, (d, _) in results.items():
            (MODERN / f"{tid}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        REPORT.write_text(report(results), encoding="utf-8")
    return results


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="only check; exit 1 on a problem")
    args = ap.parse_args()
    results = build_all(write=not args.check)
    n = 0
    for tid, (d, problems) in results.items():
        print(f"{tid}: {len(d['chapters'])} chapters, {len(d['paragraphs'])} paragraphs, {len(problems)} problems")
        for x in problems:
            print("  " + x)
        n += len(problems)
    if args.check:
        for tid, (d, _) in results.items():
            p = MODERN / f"{tid}.json"
            if not p.exists() or json.loads(p.read_text(encoding="utf-8")) != json.loads(json.dumps(d, ensure_ascii=False)):
                print(f"{p.relative_to(ROOT)} is out of date: run python3 tools/modern_ar.py")
                n += 1
    sys.exit(1 if n and args.check else 0)


if __name__ == "__main__":
    main()
