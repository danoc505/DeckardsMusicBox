"""Milestone 24: modern English, written for the Workshop, of Taylor's General
Introduction (1804) and of Olympiodorus' Life of Plato.

No modern English versions of these texts exist, so the Workshop makes them:
a plain rendering beside every paragraph, keeping every idea, in short
sentences and today's words, with Taylor's own words one tap away. The
Introduction is made from Taylor's English. The Life is made from
Olympiodorus' Greek as Hermann printed it (Platonis Dialogi vol. VI, 1887,
pp. 190-195, the archive.org OCR), checked against Taylor's translation.

Each version is labelled as the Workshop's own and machine-assisted: it was
drafted with an AI model, and no scholar has checked it yet. Hard or disputed
places carry a flag, which quotes Taylor's words and says why.

The master copy of each version is plain text, easy to revise by hand:
sources/translations/modern/<text>.txt

    @section <id> | <title>         a section, with its short summary on the lines after
    @p <paragraph>                  the modern version of Taylor's paragraph p0001, p0002 ...
    @extra <id> before <paragraph>  a paragraph of the Greek that Taylor leaves out
    @greek <first words>            where the paragraph begins in Hermann's Greek (the Life)
    !flag <Taylor's words> | <why>  a hard or disputed place
    !note <text>                    a note on the paragraph

This tool turns each into sources/translations/modern/<text>.json, which the
reader shows, and checks it (reports/modern.md):

  * every paragraph of Taylor's text has a modern version, once, in order;
  * every flag's words are found word for word in Taylor's paragraph;
  * every @greek start is found in Hermann's Greek, in order, and the Greek
    between one start and the next is kept with the paragraph;
  * the key words are rendered the same way throughout
    (sources/translations/modern/terms.json): where Taylor's paragraph has
    one of his forms ("intellect", "ideas", "unities"), the modern paragraph
    has one of the fixed modern forms ("intellect", "Forms", "henads"),
    unless the paragraph is listed as an exception, with the reason.

    python3 tools/modern.py            build the JSON and the report
    python3 tools/modern.py --check    only check; exit 1 on a problem
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODERN = ROOT / "sources" / "translations" / "modern"
TERMS = MODERN / "terms.json"
TAYLOR_VOL1 = ROOT / "texts" / "taylor-1804" / "vol1"
KEY_TERMS = ROOT / "sources" / "terms" / "terms.json"
CONCEPTS = ROOT / "sources" / "concepts"
HERMANN = ROOT / "sources" / "hermann-appendix" / "platonisdialogi06plat_djvu.txt"
REPORT = ROOT / "reports" / "modern.md"
SCHEMA = "platonic-workshop/modern-v1"

LABEL = ("The Workshop's modern English, machine-assisted: drafted with an AI model (Claude) and not yet checked "
         "by a scholar. Taylor's own words are under every paragraph.")
TEXTS = {
    "general-introduction": {
        "title": "General Introduction, in modern English",
        "made_from": "taylor",
        "about": "A modern English version of Thomas Taylor's General Introduction to the Philosophy and Writings of Plato "
                 "(1804), written for the Workshop, because none exists. It is made from Taylor's English, paragraph by paragraph: "
                 "every idea is kept, the long sentences are broken into short ones, and old words are replaced by today's "
                 "(the key words always the same way, linked to the Term tab). Taylor's Latin names of the gods are given in Greek "
                 "(Zeus for Jupiter). The quotations he translates (Proclus, Damascius, Simplicius, Plato) are modernised from his "
                 "English, not translated afresh from the Greek. His footnotes are left as he printed them, under his own words. "
                 "The sections and their summaries are the Workshop's; Taylor's text has no headings. A flag marks a place that is "
                 "hard, or where Taylor states as fact what is disputed, with his words and the reason.",
    },
    "olympiodorus-life": {
        "title": "The Life of Plato, by Olympiodorus, in modern English",
        "made_from": "greek",
        "greek_source": "Hermann, Platonis Dialogi vol. VI (Leipzig, 1887), pp. 190-195, as the archive.org OCR gives it",
        "about": "A modern English version of Olympiodorus' Life of Plato (6th century), written for the Workshop, because none "
                 "exists. It is translated from the Greek as Hermann printed it, and checked against Taylor's translation of 1804, "
                 "paragraph by paragraph. Where the Greek says something Taylor's English does not, the modern version follows the "
                 "Greek, and a flag shows Taylor's words and the difference. The opening paragraph, which Taylor leaves out, is "
                 "translated too and marked as not in Taylor. The Greek of each paragraph is shown as the OCR gives it, page "
                 "headings and misreadings included. The sections and their summaries are the Workshop's.",
    },
}
LINE = re.compile(r"^@(section|p|extra|greek)\s+(.*)$")
SENT = re.compile(r'([.!?]["”’)\]]?)\s+(?=["“‘(\[]?[A-Z0-9])')


def load_terms():
    return json.loads(TERMS.read_text(encoding="utf-8"))


def taylor_text(text_id):
    return json.loads((TAYLOR_VOL1 / f"{text_id}.json").read_text(encoding="utf-8"))


def parse(src):
    """The plain-text master copy as sections and paragraphs, in order."""
    sections, paras = [], []
    cur = None          # the section or paragraph the following lines belong to
    for n, raw in enumerate(src.splitlines(), 1):
        line = raw.rstrip()
        m = LINE.match(line)
        if m:
            kind, rest = m.groups()
            if kind == "section":
                sid, _, title = rest.partition("|")
                cur = {"id": sid.strip(), "title": title.strip(), "summary": [], "first": None, "line": n}
                sections.append(cur)
            elif kind in ("p", "extra"):
                if kind == "p":
                    seg, before, extra = rest.strip(), None, False
                else:
                    mm = re.fullmatch(r"(\S+)\s+before\s+(\S+)", rest.strip())
                    if not mm:
                        raise ValueError(f"line {n}: @extra <id> before <paragraph>")
                    seg, before, extra = mm.group(1), mm.group(2), True
                cur = {"seg": seg, "extra": extra, "before": before, "lines": [], "flags": [], "notes": [], "greek_start": None, "line": n}
                paras.append(cur)
                if sections and sections[-1]["first"] is None:
                    sections[-1]["first"] = seg
            else:  # greek
                if not cur or "lines" not in cur:
                    raise ValueError(f"line {n}: @greek outside a paragraph")
                cur["greek_start"] = rest.strip()
            continue
        if line.startswith("!flag "):
            words, sep, why = line[6:].partition(" | ")
            if not sep or not cur or "lines" not in cur:
                raise ValueError(f"line {n}: !flag <Taylor's words> | <why>, inside a paragraph")
            cur["flags"].append({"taylor": words.strip(), "why": why.strip()})
            continue
        if line.startswith("!note "):
            cur["notes"].append(line[6:].strip())
            continue
        if cur is None:
            if line.strip():
                raise ValueError(f"line {n}: text before the first @section or @p")
            continue
        if "summary" in cur:
            cur["summary"].append(line)
        else:
            cur["lines"].append(line)
    out_s = [{"id": s["id"], "title": s["title"], "summary": " ".join(x.strip() for x in s["summary"] if x.strip()),
              "first": s["first"]} for s in sections]
    out_p = []
    for p in paras:
        body = "\n".join(p["lines"]).strip()
        body = re.sub(r"\n{2,}", "\n", body)
        out_p.append({"seg": p["seg"], "extra": p["extra"], "before": p["before"], "modern": body,
                      "flags": p["flags"], "notes": p["notes"], "greek_start": p["greek_start"], "line": p["line"]})
    return out_s, out_p


def normalise_ocr(s):
    """Hermann's OCR as one line: words broken at a line end joined again, runs of space as one."""
    s = re.sub(r"-\s*\n\s*", "", s)
    return re.sub(r"\s+", " ", s)


def hermann_life():
    """The Greek of the Life in Hermann (pp. 190-195): from its first words to the title of the Prolegomena."""
    text = normalise_ocr(HERMANN.read_text(encoding="utf-8"))
    a = text.index("Αριστοτέλης ἀρχόμενος τῆς ἑαυτοῦ")
    b = text.index("ΠΡΟΔΕΓΟΜΕΝ", a)
    return text[a:b]


def short_id(seg_id):
    return seg_id.rsplit(".", 1)[-1]


def has_form(text, form, case=False):
    return re.search(r"(?<![\w-])" + re.escape(form) + r"(?![\w-])", text, 0 if case else re.I) is not None


def has_modern(text, form, case=False):
    return re.search(r"(?<![\w-])" + re.escape(form), text, 0 if case else re.I) is not None


def term_ids():
    ids = {t["id"] for t in json.loads(KEY_TERMS.read_text(encoding="utf-8"))["terms"]}
    for p in CONCEPTS.glob("*.json"):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except ValueError:
            continue
        for c in d.get("concepts", []) if isinstance(d, dict) else []:
            if isinstance(c, dict) and c.get("id"):
                ids.add(c["id"])
    return ids


def build(text_id, terms=None):
    """The JSON the reader shows, and the problems found (a list of strings)."""
    meta = TEXTS[text_id]
    terms = terms or load_terms()
    sections, paras = parse((MODERN / f"{text_id}.txt").read_text(encoding="utf-8"))
    t = taylor_text(text_id)
    taylor = [s for s in t["segments"] if s["part"] == "text"]
    by_short = {short_id(s["id"]): s for s in taylor}
    problems = []
    # Every paragraph of Taylor's, once, in order.
    mine = [p["seg"] for p in paras if not p["extra"]]
    want = [short_id(s["id"]) for s in taylor]
    if mine != want:
        missing = [x for x in want if x not in mine]
        extra = [x for x in mine if x not in want]
        dup = sorted({x for x in mine if mine.count(x) > 1})
        problems.append(f"{text_id}: the paragraphs do not match Taylor's"
                        f"{'; missing ' + ', '.join(missing[:10]) if missing else ''}"
                        f"{'; not in Taylor ' + ', '.join(extra[:10]) if extra else ''}"
                        f"{'; twice ' + ', '.join(dup) if dup else ''}"
                        f"{'; out of order' if not (missing or extra or dup) else ''}")
    for p in paras:
        if p["extra"] and p["before"] not in by_short:
            problems.append(f"{text_id} {p['seg']}: placed before {p['before']}, which is not a paragraph of Taylor's")
        if not p["modern"]:
            problems.append(f"{text_id} {p['seg']}: no modern text")
    # Flags: Taylor's words, word for word.
    for p in paras:
        src = by_short.get(p["seg"])
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{text_id} {p['seg']}: a flag with no reason")
            if p["extra"]:
                continue
            if src is None or f["taylor"] not in src["text"]:
                problems.append(f"{text_id} {p['seg']}: flagged words not in Taylor's paragraph: {f['taylor']!r}")
    # The Greek, for a version made from it.
    greek = {}
    if meta["made_from"] == "greek":
        life = hermann_life()
        pos, starts = 0, []
        for p in paras:
            g = p["greek_start"]
            if not g:
                problems.append(f"{text_id} {p['seg']}: no @greek start")
                continue
            i = life.find(g, pos)
            if i < 0:
                problems.append(f"{text_id} {p['seg']}: Greek start not found (in order) in Hermann: {g!r}")
                continue
            if life.count(g) > 1 and life.find(g) != i:
                pass  # found in order after the previous start; an earlier copy belongs to an earlier paragraph
            starts.append((p["seg"], i))
            pos = i + len(g)
        for k, (seg, i) in enumerate(starts):
            j = starts[k + 1][1] if k + 1 < len(starts) else len(life)
            greek[seg] = life[i:j].strip()
    elif any(p["greek_start"] for p in paras):
        problems.append(f"{text_id}: @greek starts in a version made from Taylor's English")
    # The key words, the same way throughout.
    exceptions = terms.get("exceptions", {}).get(text_id, {})
    known = term_ids()
    for r in terms["terms"]:
        if r.get("term") and r["term"] not in known:
            problems.append(f"terms.json: {r['term']!r} is not a key term or a concept")
    for p in paras:
        src = by_short.get(p["seg"])
        if src is None or p["extra"]:
            continue
        for r in terms["terms"]:
            case = r.get("case", False)
            hit = [f for f in r["taylor"] if has_form(src["text"], f, case)]
            if not hit:
                continue
            if any(has_modern(p["modern"], m, case) for m in r["modern"]):
                continue
            key = f"{p['seg']}:{r['taylor'][0]}"
            if key in exceptions:
                continue
            problems.append(f"{text_id} {p['seg']}: Taylor has {hit[0]!r}, the modern version none of {r['modern']}")
    for key in exceptions:
        if not any(f"{p['seg']}:" == key[:len(p['seg']) + 1] for p in paras):
            problems.append(f"terms.json: exception {key!r} names no paragraph of {text_id}")
    links = [{"term": r["term"], "forms": r["link"]} for r in terms["terms"] if r.get("term") and r.get("link")]
    links += [x for x in terms.get("extra_links", []) if x.get("link") and x["term"] in known]
    for x in links:
        x.setdefault("forms", x.get("link"))
        x.pop("link", None)
    d = {
        "schema": SCHEMA,
        "text": text_id,
        "title": meta["title"],
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL,
        "made_from": meta["made_from"],
        "about": meta["about"],
        "source": f"sources/translations/modern/{text_id}.txt",
        "sections": sections,
        "paragraphs": [],
        "links": links,
    }
    if meta["made_from"] == "greek":
        d["greek_source"] = meta["greek_source"]
    for p in paras:
        item = {"seg": by_short[p["seg"]]["id"] if p["seg"] in by_short else p["seg"], "p": p["seg"], "modern": p["modern"]}
        if p["extra"]:
            item["extra"] = True
            item["before"] = by_short[p["before"]]["id"] if p["before"] in by_short else p["before"]
        if p["flags"]:
            item["flags"] = p["flags"]
        if p["notes"]:
            item["notes"] = p["notes"]
        if p["seg"] in greek:
            item["greek"] = greek[p["seg"]]
        d["paragraphs"].append(item)
    return d, problems


def sentences(text):
    """The sentences of a modern paragraph, as the reader splits them (reader/guide.js, modernSentences):
    after . ! ? (and a closing quotation mark or bracket) followed by a space, and at every line break."""
    out = []
    for line in text.split("\n"):
        parts = SENT.split(line.strip())
        cur = ""
        for k, x in enumerate(parts):
            cur += x
            if k % 2 == 1:      # the end of a sentence, kept with it
                out.append(cur)
                cur = ""
        if cur.strip():
            out.append(cur)
    return out


def report(results):
    lines = ["# Modern English versions (milestone 24)", "",
             "Written by `tools/modern.py` from `sources/translations/modern/*.txt`. " + LABEL, ""]
    for text_id, (d, problems) in results.items():
        mod = [p for p in d["paragraphs"]]
        words = sum(len(p["modern"].split()) for p in mod)
        taylor = taylor_text(text_id)
        twords = sum(len(s["text"].split()) for s in taylor["segments"] if s["part"] == "text")
        flags = [(p["p"], f) for p in mod for f in p.get("flags", [])]
        lines += [f"## {d['title']}", "",
                  f"- Made from: {'Hermann' + chr(39) + 's Greek, checked against Taylor' if d['made_from'] == 'greek' else 'Taylor' + chr(39) + 's English'}.",
                  f"- Paragraphs: {sum(not p.get('extra') for p in mod)} of Taylor's, all with a modern version"
                  f"{', and ' + str(sum(bool(p.get('extra')) for p in mod)) + ' Taylor leaves out' if any(p.get('extra') for p in mod) else ''}.",
                  f"- Sections, each with a short summary: {len(d['sections'])}.",
                  f"- Words: {words:,} modern, {twords:,} in Taylor.",
                  f"- Sentences (each can be marked in the reader): {sum(len(sentences(p['modern'])) for p in mod):,}.",
                  f"- Flags (hard or disputed places): {len(flags)}.",
                  f"- Problems found: {len(problems)}.", ""]
        if problems:
            lines += ["### Problems", ""] + [f"- {x}" for x in problems] + [""]
        lines += ["### Flags", "", "| Paragraph | Taylor's words | Why |", "|---|---|---|"]
        for p, f in flags:
            lines.append(f"| {p} | {f['taylor'].replace('|', '/')} | {f['why'].replace('|', '/')} |")
        lines += [""]
    terms = load_terms()
    lines += ["## The fixed renderings", "", "| Taylor | Modern | Term tab | Why |", "|---|---|---|---|"]
    for r in terms["terms"]:
        lines.append(f"| {', '.join(r['taylor'])} | {', '.join(r['modern'])} | {r.get('term') or ''} | {r.get('why', '')} |")
    return "\n".join(lines).rstrip() + "\n"


def build_all(write=True):
    terms = load_terms()
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
        print(f"{tid}: {len(d['paragraphs'])} paragraphs, {len(d['sections'])} sections, {len(problems)} problems")
        for x in problems:
            print("  " + x)
        n += len(problems)
    if args.check:
        for tid, (d, _) in results.items():
            p = MODERN / f"{tid}.json"
            if not p.exists() or json.loads(p.read_text(encoding="utf-8")) != json.loads(json.dumps(d, ensure_ascii=False)):
                print(f"{p.relative_to(ROOT)} is out of date: run python3 tools/modern.py")
                n += 1
    sys.exit(1 if n and args.check else 0)


if __name__ == "__main__":
    main()
