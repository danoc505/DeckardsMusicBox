"""Milestone 27: modern English, written for the Workshop, of the Neoplatonists, made from the Greek.

No modern English versions of these texts exist that the Workshop may reuse, so it makes them, as it did
for Taylor's Introduction and the Life of Plato (milestone 24, tools/modern.py): a plain rendering of each
chapter, paragraph by paragraph, every idea kept, in short sentences and today's words. Here the modern
version is made from the Greek of milestone 25, not from Taylor, so that it does not inherit his oddities;
it is checked against Taylor's English of the same chapter (milestone 26), and where the two differ a flag
quotes Taylor's words and says why. The Greek of each paragraph and Taylor's English of each chapter are
one tap away in the reader.

The first texts are those read first: Plotinus' first Ennead, which Porphyry set first, and of it the two
treatises Taylor translated, I.2 On the Virtues and I.3 On Dialectic. I.2 is where the later Platonists
found the ranks of virtue (civic, then purifying) that their curriculum climbs (the Gorgias "as political",
the Phaedo "as purificatory", in the Anonymous Prolegomena, ch. 26; sources/structure/reading-order.json).

Each version is labelled as the Workshop's own and machine-assisted: it was drafted with an AI model, and
no scholar has checked it yet.

The master copy is plain text, easy to revise by hand (its format is described at its head):
sources/translations/modern/<text>.txt

This tool turns it into sources/translations/modern/<text>.json, which the reader shows, and checks it
(reports/modern_neo.md):

  * every chapter of each treatise in the Greek has a modern version, once, in order;
  * every @greek start is found in its chapter's Greek, in order, and the Greek from one start to the
    next is kept with the paragraph (the first paragraph begins with the chapter), so all of it is covered;
  * every flag's words are found word for word in Taylor's English of the chapter (the OCR as milestone 26
    reads it);
  * the key words are rendered the same way throughout (sources/translations/modern/terms-greek.json):
    where a paragraph's Greek has one of them (νοῦς, ψυχή, ἀρετή ...), the modern paragraph has its fixed
    rendering (intellect, soul, virtue ...), unless the paragraph is listed as an exception, with the reason.

It needs the Greek, from data/raw/ (python3 tools/fetch_sources.py first).

    python3 tools/modern_neo.py            build the JSON and the report
    python3 tools/modern_neo.py --check    only check; exit 1 on a problem
"""

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import modern  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MODERN = ROOT / "sources" / "translations" / "modern"
TERMS = MODERN / "terms-greek.json"
REPORT = ROOT / "reports" / "modern_neo.md"
SCHEMA = "platonic-workshop/modern-neo-v1"

LABEL = ("The Workshop's modern English, machine-assisted: drafted with an AI model (Claude) from the Greek and not yet "
         "checked by a scholar. Taylor's English of each chapter is one tap away.")
TEXTS = {
    "plotinus": {
        "title": "Plotinus in modern English",
        "author": "Plotinus",
        "greek_text": "plotinus-enneads",
        "taylor_work": "taylor-plotinus",
        "about": "A modern English version of Plotinus, written for the Workshop. It is translated from the Greek of "
                 "Volkmann's edition (Leipzig, 1883-1884), as First1KGreek gives it, chapter by chapter, and checked against "
                 "Thomas Taylor's translation of 1817. Where the Greek says something Taylor's English does not, the modern "
                 "version follows the Greek, and a flag shows Taylor's words and the difference. Plato's words that Plotinus "
                 "quotes are noted with their place. The chapters are Volkmann's (Ficino's); the short titles and summaries "
                 "are the Workshop's. It covers all fifteen treatises that Taylor translated, in Porphyry's order, "
                 "from I.2, On the Virtues, to VI.9, On the Good, or the One.",
    },
    "proclus-alcibiades": {
        "title": "Proclus on the First Alcibiades in modern English",
        "author": "Proclus",
        "greek_text": "proclus-alcibiades",
        "taylor_work": "taylor-1804-alcibiades-intro",
        "kind": "proofread",
        "about": "A modern English version of Proclus' commentary on the First Alcibiades, the dialogue the school read first, written for the "
                 "Workshop. It is translated from the Greek of Cousin's edition (Paris, 1820), proofread first from the page images, and checked against "
                 "the Introduction to the First Alcibiades in Thomas Taylor's Works of Plato (1804), which Taylor drew from Proclus' commentary. "
                 "Where the Greek says something Taylor's English does not, the modern version follows the Greek, and a flag shows Taylor's words "
                 "and the difference. The sections, their short titles and summaries are the Workshop's. This first part is Proclus' prologue "
                 "(Cousin's pages 2 to 46): why knowing ourselves is the start of philosophy, the aim of the dialogue, and how it is divided. "
                 "One paragraph of Taylor's Introduction (on Socrates' love, and his three sciences) comes from later in the commentary.",
    },
}
LINE = re.compile(r"^@(treatise|ch|p|greek|taylor)\b\s*(.*)$")


def fold(s):
    """Greek in small letters, without accents or breathings, for the key words."""
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.replace("ς", "σ").replace("ϑ", "θ")


def norm(s):
    """One line, one kind of space: how starts and flags are found."""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", s)).strip()


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
                    raise ValueError(f"line {n}: !flag <Taylor's words> | <why>")
                cur["flags"].append({"taylor": words.strip(), "why": why.strip()})
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


def greek_units(text_id):
    """{label: unit} of a text of milestone 25 read from its TEI (data/raw/)."""
    import neoplatonists
    t = next(x for x in neoplatonists.TEXTS if x["id"] == text_id)
    units = neoplatonists.read_tei(t)[0]
    return {u["label"]: u for u in units}


def taylor_chapters(work_id):
    """{Greek chapter label: Taylor's English of it, one line} for a translation of milestone 26."""
    import taylor_greek
    if work_id != "taylor-plotinus":
        raise ValueError(work_id)
    out = {}
    for t, chs in taylor_greek.taylor_plotinus():
        e, b = t["enn"].split(".")
        for c in chs:
            for n in c["nums"]:
                out[f"{taylor_greek.to_roman(int(e))}.{b}.{n}"] = {"text": norm(" ".join(c["paras"])), "paras": c["paras"]}
    return out


def has_modern(text, form):
    return re.search(r"(?<![\w-])" + re.escape(form), text, re.I) is not None


def build(text_id, terms=None, units=None, taylor=None):
    """The JSON the reader shows, and the problems found (a list of strings)."""
    meta = TEXTS[text_id]
    if meta.get("kind") == "proofread":
        return build_proofread(text_id, terms)
    terms = terms or json.loads(TERMS.read_text(encoding="utf-8"))
    treatises, chapters, paras = parse((MODERN / f"{text_id}.txt").read_text(encoding="utf-8"))
    units = units if units is not None else greek_units(meta["greek_text"])
    taylor = taylor if taylor is not None else taylor_chapters(meta["taylor_work"])
    problems = []
    # Every chapter of each treatise, once, in order.
    for t in treatises:
        want = sorted((lab for lab in units if lab.startswith(t["id"] + ".")), key=lambda x: int(x.rsplit(".", 1)[1]))
        if t["chapters"] != want:
            problems.append(f"{text_id} {t['id']}: the chapters are {t['chapters']}, the Greek has {want}")
    # The Greek of each paragraph: from its start to the next one's.
    by_ch = {}
    for p in paras:
        by_ch.setdefault(p["chapter"], []).append(p)
    greek = {}
    for ch in chapters:
        u = units.get(ch["id"])
        ps = by_ch.get(ch["id"], [])
        if u is None:
            problems.append(f"{text_id} {ch['id']}: no such chapter in the Greek")
            continue
        if not ps:
            problems.append(f"{text_id} {ch['id']}: no paragraphs")
            continue
        g = norm(u["text"])
        starts, pos = [], 0
        for k, p in enumerate(ps):
            if k == 0:
                if p["greek_start"]:
                    problems.append(f"{text_id} {p['seg']}: the first paragraph of a chapter begins with it, and needs no @greek")
                starts.append(0)
                continue
            s = norm(p["greek_start"] or "")
            i = g.find(s, pos) if s else -1
            if i < 0:
                problems.append(f"{text_id} {p['seg']}: Greek start not found (in order) in {ch['id']}: {p['greek_start']!r}")
                starts.append(None)
                continue
            starts.append(i)
            pos = i + len(s)
        ok = [i for i in starts if i is not None]
        for k, p in enumerate(ps):
            if starts[k] is None:
                continue
            j = next((x for x in starts[k + 1:] if x is not None), len(g))
            greek[p["seg"]] = g[starts[k]:j].strip()
        if ok != sorted(ok):
            problems.append(f"{text_id} {ch['id']}: the Greek starts are out of order")
    # Flags: Taylor's words, word for word, in his English of the chapter.
    for p in paras:
        if not p["modern"]:
            problems.append(f"{text_id} {p['seg']}: no modern text")
        tay = taylor.get(p["chapter"])
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{text_id} {p['seg']}: a flag with no reason")
            if tay is None or norm(f["taylor"]) not in tay["text"]:
                problems.append(f"{text_id} {p['seg']}: flagged words not in Taylor's {p['chapter']}: {f['taylor']!r}")
    for ch in chapters:
        if ch["id"] not in taylor:
            problems.append(f"{text_id} {ch['id']}: Taylor has no chapter of this number")
        if not ch["summary"] or not ch["title"]:
            problems.append(f"{text_id} {ch['id']}: a chapter needs a short title and a summary")
    for t in treatises:
        if not t["summary"]:
            problems.append(f"{text_id} {t['id']}: no summary")
    # The key words, the same way throughout.
    known = modern.term_ids()
    exceptions = terms.get("exceptions", {}).get(text_id, {})
    pats = []
    for r in terms["terms"]:
        if r.get("term") and r["term"] not in known:
            problems.append(f"terms-greek.json: {r['term']!r} is not a key term or a concept")
        pats.append((r, re.compile(r"(?<!\w)(?:" + r["greek"] + r")(?!\w)")))
    for p in paras:
        g = fold(greek.get(p["seg"], ""))
        for r, rx in pats:
            hit = rx.search(g)
            if not hit or any(has_modern(p["modern"], m) for m in r["modern"]):
                continue
            key = f"{p['seg']}:{r['modern'][0]}"
            if key in exceptions:
                continue
            problems.append(f"{text_id} {p['seg']}: the Greek has {hit.group(0)!r}, the modern version none of {r['modern']}")
    segs = {p["seg"] for p in paras}
    for key in exceptions:
        if key.split(":", 1)[0] not in segs:
            problems.append(f"terms-greek.json: exception {key!r} names no paragraph of {text_id}")
    links = [{"term": r["term"], "forms": r["link"]} for r in terms["terms"] if r.get("term") and r.get("link")]
    links += [{"term": x["term"], "forms": x["link"]} for x in terms.get("extra_links", []) if x["term"] in known]
    d = {
        "schema": SCHEMA,
        "text": text_id,
        "title": meta["title"],
        "author": meta["author"],
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL,
        "made_from": "greek",
        "greek_text": meta["greek_text"],
        "taylor_work": meta["taylor_work"],
        "about": meta["about"],
        "source": f"sources/translations/modern/{text_id}.txt",
        "treatises": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "chapters": t["chapters"]} for t in treatises],
        "chapters": [{"id": c["id"], "treatise": c["treatise"], "title": c["title"], "summary": c["summary"],
                      "greek_unit": units[c["id"]]["n"] if c["id"] in units else None} for c in chapters],
        "paragraphs": [],
        "links": links,
    }
    for p in paras:
        item = {"seg": p["seg"], "chapter": p["chapter"], "modern": p["modern"], "greek": greek.get(p["seg"], "")}
        if p["flags"]:
            item["flags"] = p["flags"]
        if p["notes"]:
            item["notes"] = p["notes"]
        d["paragraphs"].append(item)
    return d, problems


# ---------------------------------------------------------------- a scanned text, proofread first

TAYLOR_ALC = ROOT / "texts" / "taylor-1804" / "vol1" / "alcibiades-1.json"


def taylor_intro_alcibiades():
    """{paragraph number: text} of Taylor's Introduction to the First Alcibiades (1804), which he drew from Proclus."""
    d = json.loads(TAYLOR_ALC.read_text(encoding="utf-8"))
    out = {}
    for s in d["segments"]:
        if s["part"] == "introduction":
            k = int(s["id"].rsplit(".p", 1)[1])
            if k > 1:      # p0001 is the heading
                out[k] = norm(s["text"])
    return out


def check_terms(text_id, paras, greek, terms, problems):
    known = modern.term_ids()
    exceptions = terms.get("exceptions", {}).get(text_id, {})
    pats = []
    for r in terms["terms"]:
        if r.get("term") and r["term"] not in known:
            problems.append(f"terms-greek.json: {r['term']!r} is not a key term or a concept")
        pats.append((r, re.compile(r"(?<!\w)(?:" + r["greek"] + r")(?!\w)")))
    for p in paras:
        g = fold(greek.get(p["seg"], ""))
        for r, rx in pats:
            hit = rx.search(g)
            if not hit or any(has_modern(p["modern"], m) for m in r["modern"]):
                continue
            if f"{p['seg']}:{r['modern'][0]}" in exceptions:
                continue
            problems.append(f"{text_id} {p['seg']}: the Greek has {hit.group(0)!r}, the modern version none of {r['modern']}")
    segs = {p["seg"] for p in paras}
    for key in exceptions:
        if key.split(":", 1)[0] not in segs:
            problems.append(f"terms-greek.json: exception {key!r} names no paragraph of {text_id}")
    links = [{"term": r["term"], "forms": r["link"]} for r in terms["terms"] if r.get("term") and r.get("link")]
    links += [{"term": x["term"], "forms": x["link"]} for x in terms.get("extra_links", []) if x["term"] in known]
    return links


def build_proofread(text_id, terms=None):
    """A text of milestone 25 read from a scan, proofread first (tools/proofread.py): the Greek of each paragraph is
    the proofread text from its @greek start to the next paragraph's, every paragraph naming the pages it lies on;
    the flags are checked against the paragraphs of Taylor's English that each section names (@taylor)."""
    import proofread
    meta = TEXTS[text_id]
    terms = terms or json.loads(TERMS.read_text(encoding="utf-8"))
    treatises, chapters, paras = parse((MODERN / f"{text_id}.txt").read_text(encoding="utf-8"))
    problems = []
    # The proofread Greek as one text, with where each page starts.
    text, starts_at = "", []
    for unit, label, t in proofread.main_text(meta["greek_text"]):
        if text.endswith("-"):
            text = text[:-1]
        elif text:
            text += " "
        starts_at.append((len(text), unit, label))
        text += t
    g = norm(text)
    if g != text:
        problems.append(f"{text_id}: the proofread Greek is not on one line with single spaces")
    pos, starts = 0, []
    for p in paras:
        s = norm(p["greek_start"] or "")
        i = g.find(s, pos) if s else -1
        if i < 0:
            problems.append(f"{text_id} {p['seg']}: Greek start not found (in order): {p['greek_start']!r}")
        else:
            pos = i + len(s)
        starts.append(i)
    if starts and starts[0] >= 0:
        head = g[:starts[0]].strip()
        if head and not re.fullmatch(r"[Α-ΩΆ-Ώ\s.]+", head):
            problems.append(f"{text_id}: Greek before the first paragraph that is not a heading: {head[:60]!r}")
    greek, pages = {}, {}
    for k, p in enumerate(paras):
        if starts[k] < 0:
            continue
        j = next((x for x in starts[k + 1:] if x >= 0), len(g))
        greek[p["seg"]] = g[starts[k]:j].strip()
        pages[p["seg"]] = [{"n": u, "label": lab} for (at, u, lab), nxt in zip(starts_at, starts_at[1:] + [(len(g), None, None)])
                           if at < j and nxt[0] > starts[k]]
    # Taylor's paragraphs, and the flags in them.
    tay = taylor_intro_alcibiades()
    by_ch = {c["id"]: c for c in chapters}
    if len(by_ch) != len(chapters):
        problems.append(f"{text_id}: two sections with the same id")
    for c in chapters:
        if "taylor" not in c:
            problems.append(f"{text_id} {c['id']}: no @taylor line (write @taylor none if Taylor draws nothing from it)")
            c["taylor"] = []
        for k in c["taylor"]:
            if k not in tay:
                problems.append(f"{text_id} {c['id']}: Taylor's Introduction has no paragraph {k}")
        if not c["summary"] or not c["title"]:
            problems.append(f"{text_id} {c['id']}: a section needs a short title and a summary")
    for p in paras:
        if not p["modern"]:
            problems.append(f"{text_id} {p['seg']}: no modern text")
        here = " ".join(tay.get(k, "") for k in by_ch[p["chapter"]]["taylor"])
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{text_id} {p['seg']}: a flag with no reason")
            if norm(f["taylor"]) not in here:
                problems.append(f"{text_id} {p['seg']}: flagged words not in the paragraphs of Taylor named for {p['chapter']}: {f['taylor']!r}")
    for t in treatises:
        if not t["summary"]:
            problems.append(f"{text_id} {t['id']}: no summary")
    links = check_terms(text_id, paras, greek, terms, problems)
    d = {
        "schema": SCHEMA,
        "text": text_id,
        "kind": "proofread",
        "title": meta["title"],
        "author": meta["author"],
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL.replace("Taylor's English of each chapter is one tap away.",
                               "The Greek was proofread from the page images first; Taylor's English, where he drew on these pages, is one tap away."),
        "made_from": "greek",
        "greek_text": meta["greek_text"],
        "taylor_work": meta["taylor_work"],
        "taylor_source": "Thomas Taylor, Introduction to the First Alcibiades, in The Works of Plato, vol. I (London, 1804), from texts/taylor-1804/vol1/alcibiades-1.json",
        "about": meta["about"],
        "source": f"sources/translations/modern/{text_id}.txt",
        "proofread": f"sources/neoplatonists/proofread/{meta['greek_text']}.txt",
        "treatises": [{"id": t["id"], "title": t["title"], "summary": t["summary"], "chapters": t["chapters"]} for t in treatises],
        "chapters": [{"id": c["id"], "treatise": c["treatise"], "title": c["title"], "summary": c["summary"],
                      "greek_unit": (pages.get(next((p["seg"] for p in paras if p["chapter"] == c["id"]), ""), [{}])[0]).get("n"),
                      "taylor": [{"n": k, "text": tay[k]} for k in c["taylor"] if k in tay]} for c in chapters],
        "paragraphs": [],
        "links": links,
    }
    for p in paras:
        item = {"seg": p["seg"], "chapter": p["chapter"], "modern": p["modern"], "greek": greek.get(p["seg"], ""),
                "pages": pages.get(p["seg"], [])}
        if p["flags"]:
            item["flags"] = p["flags"]
        if p["notes"]:
            item["notes"] = p["notes"]
        d["paragraphs"].append(item)
    return d, problems


def proofread_line(d):
    """How the Greek of a proofread text was made, counted from the files."""
    import proofread
    pages = proofread.parse(d["greek_text"])
    corrs = [c for c in json.loads((ROOT / "sources" / "neoplatonists" / "corrections.json").read_text(encoding="utf-8"))["corrections"]
             if c["text"] == d["greek_text"] and c.get("proofread")]
    return (f"{len(pages)} pages proofread from the page images (`{d['proofread']}`), written into "
            f"`sources/neoplatonists/corrections.json` as {len(corrs)} line corrections by `tools/proofread.py`.")


def report(results, taylor_words):
    lines = ["# Modern English of the Neoplatonists, from the Greek (milestone 27)", "",
             "Written by `tools/modern_neo.py` from `sources/translations/modern/*.txt`. " + LABEL, ""]
    for text_id, (d, problems) in results.items():
        ps = d["paragraphs"]
        words = sum(len(p["modern"].split()) for p in ps)
        gwords = sum(len(p["greek"].split()) for p in ps)
        flags = [(p["seg"], f) for p in ps for f in p.get("flags", [])]
        lines += [f"## {d['title']}", "",
                  f"- Made from: {TEXTS[text_id]['about'].split('. ')[1]}.",
                  f"- Treatises: {', '.join(t['id'] + ' ' + t['title'] for t in d['treatises'])}.",
                  (f"- Chapters: {len(d['chapters'])}, every one of the treatises', each with a short title and a summary."
                   if d.get("kind") != "proofread" else
                   f"- Sections: {len(d['chapters'])}, each with a short title and a summary. The Greek: {proofread_line(d)}"),
                  f"- Paragraphs: {len(ps)}, each with its Greek.",
                  f"- Words: {words:,} modern, {gwords:,} Greek, {taylor_words.get(text_id, 0):,} in Taylor's English of the same "
                  f"{'chapters' if d.get('kind') != 'proofread' else 'pages (his Introduction)'}.",
                  f"- Sentences (each can be marked in the reader): {sum(len(modern.sentences(p['modern'])) for p in ps):,}.",
                  f"- Flags (where Taylor and the Greek differ, or the Greek is hard): {len(flags)}.",
                  f"- Problems found: {len(problems)}.", ""]
        if problems:
            lines += ["### Problems", ""] + [f"- {x}" for x in problems] + [""]
        lines += ["### Flags", "", "| Paragraph | Taylor's words | Why |", "|---|---|---|"]
        for seg, f in flags:
            lines.append(f"| {seg} | {f['taylor'].replace('|', '/')} | {f['why'].replace('|', '/')} |")
        lines += [""]
    terms = json.loads(TERMS.read_text(encoding="utf-8"))
    lines += ["## The fixed renderings", "", "| Greek (without accents) | Modern | Term tab | Why |", "|---|---|---|---|"]
    for r in terms["terms"]:
        lines.append(f"| {r['greek'].replace('|', ' / ')} | {', '.join(r['modern'])} | {r.get('term') or ''} | {r.get('why', '')} |")
    return "\n".join(lines).rstrip() + "\n"


def build_all(write=True):
    terms = json.loads(TERMS.read_text(encoding="utf-8"))
    results, taylor_words = {}, {}
    for tid, meta in TEXTS.items():
        if meta.get("kind") == "proofread":
            results[tid] = build(tid, terms)
            used = {x["n"]: x["text"] for c in results[tid][0]["chapters"] for x in c["taylor"]}
            taylor_words[tid] = sum(len(t.split()) for t in used.values())
            continue
        taylor = taylor_chapters(meta["taylor_work"])
        results[tid] = build(tid, terms, taylor=taylor)
        taylor_words[tid] = sum(len(taylor[c["id"]]["text"].split()) for c in results[tid][0]["chapters"] if c["id"] in taylor)
    if write:
        for tid, (d, _) in results.items():
            (MODERN / f"{tid}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        REPORT.write_text(report(results, taylor_words), encoding="utf-8")
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
                print(f"{p.relative_to(ROOT)} is out of date: run python3 tools/modern_neo.py")
                n += 1
    sys.exit(1 if n and args.check else 0)


if __name__ == "__main__":
    main()
