"""The Enneads of Plotinus in modern English, the Workshop's own, made from the Greek, with MacKenna's English beside it.

Milestone 27 put into modern English the fifteen treatises of Plotinus that Thomas Taylor translated (1817), checked
against his English and read beside it (tools/modern_neo.py, sources/translations/modern/plotinus.txt). This tool does
the same for the other thirty-nine, a few at a time, in Porphyry's order (workshop ROADMAP, "The Enneads in modern
English", milestones E1 onward). There is no Taylor to check them against, so they are checked against Stephen MacKenna's
translation (1917-1930), which is in the public domain in the United States and was made from Volkmann's Greek, the
Workshop's own (tools/mackenna.py reads it from the scans' OCR).

Before the treatises comes Porphyry's Life of Plotinus and the order of his books, which Porphyry set at the head of his
edition (milestones E5-E6). Its Greek is not in First1KGreek: it is Volkmann's own text (vol. I, 1883, pp. 1-36), read
from the Internet Archive scan and proofread by hand (sources/neoplatonists/proofread/porphyry-life-plotinus.txt,
tools/proofread.py); its chapters are split at Volkmann's chapter numbers. MacKenna translated it at the head of his first
volume, and his chapters are those of the Greek.

Each version is a plain rendering of each chapter, paragraph by paragraph, every idea kept, in short sentences and
today's words, made from the Greek and not from MacKenna, so that it does not inherit his additions; where MacKenna and
the Greek differ, or the Greek is hard, a flag quotes MacKenna's words and says why. Each version is labelled as the
Workshop's own and machine-assisted: it was drafted with an AI model, and no scholar has checked it yet.

The master copy is plain text, in the format of milestone 27 (described at its head):
sources/translations/modern/enneads.txt

This tool turns it into sources/translations/modern/enneads.json, which the reader shows at #neo-modern/enneads, and
checks it (reports/modern_enneads.md):

  * the Life comes first; the treatises are in Porphyry's order, none of them one of Taylor's fifteen (those are read beside Taylor);
  * each treatise has its chapters from the first, once, in order (a long treatise may be done over two or three
    milestones: then the chapters done so far, and the reader says so);
  * every @greek start is found in its chapter's Greek, in order, and the Greek from one start to the next is kept with
    the paragraph (the first paragraph begins with the chapter), so all of it is covered;
  * every flag's words are found word for word in MacKenna's chapters shown with the chapter (by default his chapter of
    the same number, or those named by @older), as tools/mackenna.py reads them;
  * the key words are rendered the same way throughout (sources/translations/modern/terms-greek.json), as in milestone 27.

The JSON also carries the contents of the whole Enneads, all fifty-four treatises in Porphyry's order, each marked as
done here, done beside Taylor (milestone 27), or to come, with the milestone that will do it.

It needs the Greek, from data/raw/ (python3 tools/fetch_sources.py first).

    python3 tools/modern_enneads.py            build the JSON and the report
    python3 tools/modern_enneads.py --check    only check; exit 1 on a problem
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import modern  # noqa: E402
from modern_neo import TERMS, check_terms, norm  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MODERN = ROOT / "sources" / "translations" / "modern"
TEXT_ID = "enneads"
REPORT = ROOT / "reports" / "modern_enneads.md"
SCHEMA = "platonic-workshop/modern-enneads-v1"
GREEK_TEXT = "plotinus-enneads"
LINE = re.compile(r"^@(treatise|ch|older|p|greek)\b\s*(.*)$")

LABEL = ("The Workshop's modern English, machine-assisted: drafted with an AI model (Claude) from the Greek and not yet "
         "checked by a scholar. The Greek of each paragraph, and MacKenna's English of each chapter, are one tap away.")
TITLE = "The Enneads in modern English"
ABOUT = ("A modern English version of Plotinus' Enneads, written for the Workshop, a few treatises at a time, in the order "
         "Porphyry gave them when he edited his teacher's writings in six sets of nine. It is translated from the Greek of "
         "Volkmann's edition (Leipzig, 1883-1884), as First1KGreek gives it, chapter by chapter, and checked against Stephen "
         "MacKenna's translation (London, 1917-1930), which was made from the same Greek. Where the Greek says something "
         "MacKenna's English does not, the modern version follows the Greek, and a flag shows MacKenna's words and the "
         "difference. Plato's and Aristotle's words that Plotinus uses are noted with their place. The chapters are "
         "Volkmann's (Ficino's); the short titles and summaries are the Workshop's. The fifteen treatises Thomas Taylor "
         "translated (1817) are read in modern English beside his English, from the contents below.")

# Porphyry's order: the fifty-four treatises, with the Workshop's short titles (after Porphyry's), and the milestone of
# the workshop ROADMAP that puts each into modern English ("taylor": done in milestone 27, beside Taylor's English).
PLAN = [
    ("I.1", "What is the living being, and what is the human being?", "E1"),
    ("I.2", "On the virtues", "taylor"),
    ("I.3", "On dialectic", "taylor"),
    ("I.4", "On happiness", "E2"),
    ("I.5", "Whether happiness grows with time", "E2"),
    ("I.6", "On beauty", "E3"),
    ("I.7", "On the first good and the other goods", "E3"),
    ("I.8", "What evils are, and where they come from", "E4"),
    ("I.9", "On going out of life", "E4"),
    ("II.1", "On the heaven", "E7"),
    ("II.2", "On the movement of the heaven", "E7"),
    ("II.3", "Whether the stars are causes", "E8"),
    ("II.4", "On matter", "taylor"),
    ("II.5", "On what is potential and what is actual", "E9"),
    ("II.6", "On substance, or on quality", "E9"),
    ("II.7", "On complete blending", "E9"),
    ("II.8", "On sight, or why distant things look small", "E9"),
    ("II.9", "Against the Gnostics", "taylor"),
    ("III.1", "On destiny", "E10"),
    ("III.2", "On providence, first part", "E11"),
    ("III.3", "On providence, second part", "E12"),
    ("III.4", "On the daemon allotted to us", "E12"),
    ("III.5", "On love", "E13"),
    ("III.6", "On the impassibility of the bodiless", "taylor"),
    ("III.7", "On eternity and time", "taylor"),
    ("III.8", "On nature, contemplation and the One", "E14"),
    ("III.9", "Various considerations", "E14"),
    ("IV.1", "On the being of the soul, first part", "E15"),
    ("IV.2", "On the being of the soul, second part", "taylor"),
    ("IV.3", "On difficulties about the soul, first part", "taylor"),
    ("IV.4", "On difficulties about the soul, second part", "E15-E17"),
    ("IV.5", "On difficulties about the soul, third part, or on sight", "E18"),
    ("IV.6", "On perception and memory", "E18"),
    ("IV.7", "On the immortality of the soul", "taylor"),
    ("IV.8", "On the descent of the soul into bodies", "E19"),
    ("IV.9", "Whether all souls are one", "E19"),
    ("V.1", "On the three first realities", "taylor"),
    ("V.2", "On the origin and order of what comes after the first", "taylor"),
    ("V.3", "On the knowing realities and what is beyond", "taylor"),
    ("V.4", "How what comes after the first comes from it, and on the One", "E20"),
    ("V.5", "That the intelligibles are not outside intellect, and on the Good", "E20"),
    ("V.6", "That what is beyond being does not think", "taylor"),
    ("V.7", "Whether there are forms of individuals", "E21"),
    ("V.8", "On intelligible beauty", "E21"),
    ("V.9", "On intellect, the forms and being", "taylor"),
    ("VI.1", "On the kinds of being, first part", "E22-E23"),
    ("VI.2", "On the kinds of being, second part", "E24"),
    ("VI.3", "On the kinds of being, third part", "E25-E26"),
    ("VI.4", "That being, one and the same, is everywhere whole, first part", "E27"),
    ("VI.5", "That being, one and the same, is everywhere whole, second part", "E28"),
    ("VI.6", "On numbers", "E29"),
    ("VI.7", "How the many forms came to be, and on the Good", "E30-E32"),
    ("VI.8", "On free will and the will of the One", "E33"),
    ("VI.9", "On the Good, or the One", "taylor"),
]
PLAN_IDS = [x[0] for x in PLAN]

# Porphyry's Life of Plotinus, which he set before the Enneads (milestones E5 and E6), read first, as the treatise "Life".
# Its Greek is not in First1KGreek: it is Volkmann's vol. I (1883) from the Internet Archive's scan, proofread from the page
# images (tools/proofread.py, sources/neoplatonists/proofread/porphyry-life-plotinus.txt), split at Volkmann's chapter numbers.
LIFE = "Life"
LIFE_TEXT = "porphyry-life-plotinus"
LIFE_TITLE = "Porphyry, On the life of Plotinus and the order of his books"
LIFE_CHAPTERS = 26
LIFE_PLAN = "E5-E6"


def parse(src):
    """The master copy as treatises, chapters and paragraphs, in order."""
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
                        raise ValueError(f"line {n}: @ch before the first @treatise")
                    cur["treatise"] = treatises[-1]["id"]
                    treatises[-1]["chapters"].append(cur["id"])
                    chapters.append(cur)
            elif kind == "older":
                if not chapters or cur is not chapters[-1]:
                    raise ValueError(f"line {n}: @older belongs right after its @ch")
                cur["older"] = [int(x) for x in rest.split()]
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
                    raise ValueError(f"line {n}: !flag <MacKenna's words> | <why>")
                cur["flags"].append({"words": words.strip(), "why": why.strip()})
            else:
                cur["notes"].append(line[6:].strip())
            continue
        if cur is None:
            if line.strip():
                raise ValueError(f"line {n}: text before the first @treatise")
            continue
        (cur["lines"] if "lines" in cur else cur["summary"]).append(line)
    for x in treatises + chapters:
        x["summary"] = " ".join(s.strip() for s in x["summary"] if s.strip())
    for p in paras:
        p["modern"] = re.sub(r"\n{2,}", "\n", "\n".join(p.pop("lines")).strip())
    return treatises, chapters, paras


def taylor_treatises():
    """The treatises done in modern English beside Taylor (milestone 27), from plotinus.txt."""
    import modern_neo
    return [t["id"] for t in modern_neo.parse((MODERN / "plotinus.txt").read_text(encoding="utf-8"))[0]]


def chapter_n(cid):
    return int(cid.rsplit(".", 1)[1])


def life_units():
    """{'Life.1': {'text', 'n': the scanned page it begins on, 'label': 'p. 3', 'part', 'pages': [unit, ...]}}: the
    proofread Greek of the Life, cut at Volkmann's chapter numbers ("2."), which must run 1, 2, 3 ... in order."""
    import neoplatonists
    import proofread
    text, starts_at = "", []
    for unit, label, t in proofread.main_text(LIFE_TEXT):
        if text.endswith("-"):
            text = text[:-1]
        elif text:
            text += " "
        starts_at.append((len(text), unit, label))
        text += t
    t = next(x for x in neoplatonists.TEXTS if x["id"] == LIFE_TEXT)
    part = {u["n"]: u["part"] for u in neoplatonists.read_ocr(t)[0]}
    marks = list(re.finditer(r"(?:^|(?<=\s))(\d{1,2})\. ", text))
    out = {}
    for k, m in enumerate(marks):
        n = int(m.group(1))
        if n != k + 1:
            raise ValueError(f"the Life: chapter number {n} where {k + 1} was expected")
        a, b = m.end(), (marks[k + 1].start() if k + 1 < len(marks) else len(text))
        pages = [(u, lab) for (at, u, lab), nxt in zip(starts_at, starts_at[1:] + [(len(text), None, None)]) if at < b and nxt[0] > m.start()]
        out[f"{LIFE}.{n}"] = {"text": text[a:b].strip(), "n": pages[0][0], "label": pages[0][1], "part": part.get(pages[0][0]),
                              "pages": [u for u, _ in pages], "greek_text": LIFE_TEXT}
    return out


def build(terms=None, units=None, older=None, taylor_done=None):
    """The JSON the reader shows, and the problems found (a list of strings)."""
    import mackenna
    terms = terms or json.loads(TERMS.read_text(encoding="utf-8"))
    treatises, chapters, paras = parse((MODERN / f"{TEXT_ID}.txt").read_text(encoding="utf-8"))
    if units is None:
        import modern_neo
        units = {**modern_neo.greek_units(GREEK_TEXT), **life_units()}
    older = older if older is not None else mackenna.chapters()
    taylor_done = taylor_done if taylor_done is not None else taylor_treatises()
    problems = []
    # The plan: Porphyry's fifty-four, and Taylor's fifteen marked as his.
    if sorted(x for x, _, how in PLAN if how == "taylor") != sorted(taylor_done):
        problems.append(f"the plan's treatises beside Taylor are not those of plotinus.txt: {sorted(taylor_done)}")
    if len(PLAN) != 54 or len(set(PLAN_IDS)) != 54:
        problems.append("the plan must list the fifty-four treatises, once each")
    # Porphyry's order, none of Taylor's.
    ids = [t["id"] for t in treatises]
    if LIFE in ids and ids.index(LIFE) != 0:
        problems.append("Porphyry's Life of Plotinus comes first, before the Enneads, as he set it")
    for t in treatises:
        if t["id"] == LIFE:
            continue
        if t["id"] not in PLAN_IDS:
            problems.append(f"{t['id']}: not a treatise of the Enneads")
        elif t["id"] in taylor_done:
            problems.append(f"{t['id']}: one of Taylor's treatises; it is read in modern English beside his (plotinus.txt)")
    known = [i for i in ids if i in PLAN_IDS]
    if known != sorted(known, key=PLAN_IDS.index) or len(set(ids)) != len(ids):
        problems.append(f"the treatises are not in Porphyry's order, once each: {ids}")
    # Each treatise's chapters from the first, once, in order.
    partial = {}
    for t in treatises:
        want = sorted((lab for lab in units if lab.startswith(t["id"] + ".") and lab.count(".") == (1 if t["id"] == LIFE else 2)), key=chapter_n)
        if t["chapters"] != want[:len(t["chapters"])] or not t["chapters"]:
            problems.append(f"{t['id']}: the chapters are {t['chapters']}, the Greek has {want}")
        elif len(t["chapters"]) < (LIFE_CHAPTERS if t["id"] == LIFE else len(want)):
            partial[t["id"]] = (len(t["chapters"]), LIFE_CHAPTERS if t["id"] == LIFE else len(want))
    # The Greek of each paragraph: from its start to the next one's.
    by_ch = {}
    for p in paras:
        by_ch.setdefault(p["chapter"], []).append(p)
    greek = {}
    for ch in chapters:
        u = units.get(ch["id"])
        ps = by_ch.get(ch["id"], [])
        if u is None:
            problems.append(f"{ch['id']}: no such chapter in the Greek")
            continue
        if not ps:
            problems.append(f"{ch['id']}: no paragraphs")
            continue
        g = norm(u["text"])
        starts, pos = [], 0
        for k, p in enumerate(ps):
            if k == 0:
                if p["greek_start"]:
                    problems.append(f"{p['seg']}: the first paragraph of a chapter begins with it, and needs no @greek")
                starts.append(0)
                continue
            s = norm(p["greek_start"] or "")
            i = g.find(s, pos) if s else -1
            if i < 0:
                problems.append(f"{p['seg']}: Greek start not found (in order) in {ch['id']}: {p['greek_start']!r}")
                starts.append(None)
                continue
            starts.append(i)
            pos = i + len(s)
        for k, p in enumerate(ps):
            if starts[k] is None:
                continue
            j = next((x for x in starts[k + 1:] if x is not None), len(g))
            greek[p["seg"]] = g[starts[k]:j].strip()
    # MacKenna's chapters for each chapter, and the flags in them.
    for ch in chapters:
        t = ch["id"].rsplit(".", 1)[0]
        ch.setdefault("older", [chapter_n(ch["id"])])
        ch["_older"] = []
        for n in ch["older"]:
            o = older.get(f"{t}.{n}")
            if o is None:
                problems.append(f"{ch['id']}: MacKenna has no chapter {n} of {t}")
            else:
                ch["_older"].append((n, o))
        if not ch["summary"] or not ch["title"]:
            problems.append(f"{ch['id']}: a chapter needs a short title and a summary")
    by_id = {c["id"]: c for c in chapters}
    for p in paras:
        if not p["modern"]:
            problems.append(f"{p['seg']}: no modern text")
        here = " ".join(o["text"] for _, o in by_id[p["chapter"]]["_older"])
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{p['seg']}: a flag with no reason")
            w = norm(f["words"])
            if len(w.split()) < 3:
                problems.append(f"{p['seg']}: a flag should quote at least three words: {f['words']!r}")
            if w not in here:
                problems.append(f"{p['seg']}: flagged words not in MacKenna's chapter: {f['words']!r}")
    for t in treatises:
        if not t["summary"] or not t["title"]:
            problems.append(f"{t['id']}: a treatise needs a title and a summary")
    links = check_terms(TEXT_ID, paras, greek, terms, problems)
    vols = {}
    for c in chapters:
        for _, o in c["_older"]:
            vols.setdefault(o["volume"], o["year"])
    done = {t["id"]: t for t in treatises}
    contents = []
    for tid, title, how in [(LIFE, LIFE_TITLE, LIFE_PLAN)] + PLAN:
        item = {"id": tid, "title": title}
        if tid in done:
            item["status"] = "here"
            item["first"] = done[tid]["chapters"][0]
            if tid in partial:
                item["chapters_done"], item["chapters_all"] = partial[tid]
        elif how == "taylor":
            item["status"] = "taylor"
        else:
            item["status"] = "to come"
            item["milestone"] = how
        contents.append(item)
    d = {
        "schema": SCHEMA,
        "text": TEXT_ID,
        "kind": "enneads",
        "title": TITLE,
        "author": "Plotinus",
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL,
        "made_from": "greek",
        "greek_text": GREEK_TEXT,
        "taylor_work": None,
        "older": {"translator": "Stephen MacKenna", "label": "MacKenna",
                  "volumes": [{"file": f"texts/plotinus/{v}.json", "year": y} for v, y in sorted(vols.items())],
                  "how": "the Internet Archive's OCR of the printed volumes, read by rule (tools/mackenna.py), not proofread"},
        "about": ABOUT,
        "source": f"sources/translations/modern/{TEXT_ID}.txt",
        "contents": contents,
        "treatises": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "chapters": t["chapters"],
                       **({"chapters_done": partial[t["id"]][0], "chapters_all": partial[t["id"]][1]} if t["id"] in partial else {})}
                      for t in treatises],
        "chapters": [{"id": c["id"], "treatise": c["treatise"], "title": c["title"], "summary": c["summary"],
                      "greek_unit": units[c["id"]]["n"] if c["id"] in units else None,
                      "greek_part": units[c["id"]]["part"] if c["id"] in units else None,
                      **({"greek_text": LIFE_TEXT, "greek_label": units[c["id"]]["label"], "greek_pages": units[c["id"]]["pages"]}
                         if c["treatise"] == LIFE and c["id"] in units else {}),
                      "older": [{"n": n, "label": f"{c['treatise']}, chapter {n}", "page": o["page"], "year": o["year"],
                                 "text": "\n\n".join(o["paras"])} for n, o in c["_older"]]}
                     for c in chapters],
        "paragraphs": [],
        "links": links,
    }
    for p in paras:
        item = {"seg": p["seg"], "chapter": p["chapter"], "modern": p["modern"], "greek": greek.get(p["seg"], "")}
        if p["flags"]:
            item["flags"] = [{"taylor": f["words"], "in": "MacKenna", "why": f["why"]} for f in p["flags"]]
        if p["notes"]:
            item["notes"] = p["notes"]
        d["paragraphs"].append(item)
    return d, problems


def report(d, problems):
    ps = d["paragraphs"]
    flags = [(p["seg"], f) for p in ps for f in p.get("flags", [])]
    older_words = sum(len(o["text"].split()) for c in d["chapters"] for o in c["older"])
    here = [c for c in d["contents"] if c["status"] == "here"]
    lines = ["# The Enneads in modern English, from the Greek (milestones E1 onward)", "",
             "Written by `tools/modern_enneads.py` from `sources/translations/modern/enneads.txt`. " + LABEL, "",
             f"- Made from: Volkmann's Greek (Leipzig, 1883-1884), as First1KGreek gives it; checked against MacKenna's English "
             f"({', '.join(str(v['year']) for v in d['older']['volumes'])}; {d['older']['how']}).",
             f"- Porphyry's Life of Plotinus: Volkmann's own Greek (vol. I, 1883), proofread from the scan "
             f"(`sources/neoplatonists/proofread/{LIFE_TEXT}.txt`).",
             f"- Treatises done here: {', '.join(t['title'] if t['id'] == LIFE else t['id'] + ' ' + t['title'] for t in d['treatises'])}.",
             f"- The whole Enneads: {len(here)} treatise{'' if len(here) == 1 else 's'} here, {sum(1 for c in d['contents'] if c['status'] == 'taylor')} beside "
             f"Taylor (milestone 27), {sum(1 for c in d['contents'] if c['status'] == 'to come')} to come.",
             f"- Chapters: {len(d['chapters'])}, each with a short title and a summary.",
             f"- Paragraphs: {len(ps)}, each with its Greek.",
             f"- Words: {sum(len(p['modern'].split()) for p in ps):,} modern, {sum(len(p['greek'].split()) for p in ps):,} Greek, "
             f"{older_words:,} in MacKenna's English of the same chapters.",
             f"- Sentences (each can be marked in the reader): {sum(len(modern.sentences(p['modern'])) for p in ps):,}.",
             f"- Flags (where MacKenna and the Greek differ, or the Greek is hard): {len(flags)}.",
             f"- Notes (Plato's, Aristotle's and Homer's places, hard readings): {sum(len(p.get('notes', [])) for p in ps)}.",
             f"- Problems found: {len(problems)}.", ""]
    if problems:
        lines += ["## Problems", ""] + [f"- {x}" for x in problems] + [""]
    lines += ["## Flags", "", "| Paragraph | MacKenna's words | Why |", "|---|---|---|"]
    for seg, f in flags:
        lines.append(f"| {seg} | {f['taylor'].replace('|', '/')} | {f['why'].replace('|', '/')} |")
    lines += ["", "## The plan, in Porphyry's order", "", "| Treatise | Title | Modern English |", "|---|---|---|"]
    for c in d["contents"]:
        st = {"here": "done here", "taylor": "done beside Taylor (milestone 27)"}.get(c["status"], f"to come ({c.get('milestone')})")
        if c.get("chapters_done"):
            st += f", chapters 1-{c['chapters_done']} of {c['chapters_all']}"
        lines.append(f"| {c['id']} | {c['title']} | {st} |")
    return "\n".join(lines).rstrip() + "\n"


def build_all(write=True):
    d, problems = build()
    if write:
        (MODERN / f"{TEXT_ID}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        REPORT.write_text(report(d, problems), encoding="utf-8")
    return d, problems


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="only check; exit 1 on a problem")
    args = ap.parse_args()
    d, problems = build_all(write=not args.check)
    print(f"{TEXT_ID}: {len(d['treatises'])} treatises, {len(d['chapters'])} chapters, {len(d['paragraphs'])} paragraphs, "
          f"{len(problems)} problems")
    for x in problems:
        print("  " + x)
    n = len(problems)
    if args.check:
        p = MODERN / f"{TEXT_ID}.json"
        if not p.exists() or json.loads(p.read_text(encoding="utf-8")) != json.loads(json.dumps(d, ensure_ascii=False)):
            print(f"{p.relative_to(ROOT)} is out of date: run python3 tools/modern_enneads.py")
            n += 1
    sys.exit(1 if n and args.check else 0)


if __name__ == "__main__":
    main()
