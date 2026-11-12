#!/usr/bin/env python3
"""Milestone 27: the scanned Greek, proofread from the page images, before it is translated.

The Greek of Proclus and Olympiodorus on the First Alcibiades (milestone 25) is the Internet Archive's OCR of
Cousin's and Creuzer's editions, shown as received and not proofread. Before a passage is translated into
modern English, its pages are proofread against the page images, line by line, and written down in a master
copy that is easy to read and revise by hand:

    sources/neoplatonists/proofread/<text>.txt

(its format is described at its head). This tool compares each proofread page with the OCR of the same page,
line by line, and writes a correction into sources/neoplatonists/corrections.json for every line the OCR
misreads: what the OCR prints (the whole line, with any line of specks or stray marks next to it that the
proofread page does not have), what the page reads, where (that page only), and why. So the rule of milestone
25 holds: the OCR is still shown as received, the corrections are kept apart, and the reader's "With
corrections" reading of a proofread page is the proofread text. Lines at the foot of a page that the proofread
page does not have (Cousin's notes) are left as the OCR has them.

The OCR's lines and the page's are matched by how alike they are (an alignment that may skip a line on either
side); the tool then applies the corrections exactly as the build will (neoplatonists.apply_corrections) and
checks that each page comes out as proofread, every correction used once.

    python3 tools/proofread.py            write the corrections for every proofread text
    python3 tools/proofread.py --check    only check that corrections.json is up to date; exit 1 if not
"""

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402
import neoplatonists  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PROOF = ROOT / "sources" / "neoplatonists" / "proofread"
BY = "the Workshop, proofread from the page image"


def parse(text_id):
    """The proofread pages of a text, in order: [{unit, label, lines}]."""
    pages = []
    for n, raw in enumerate((PROOF / f"{text_id}.txt").read_text(encoding="utf-8").splitlines(), 1):
        line = raw.rstrip()
        if line.startswith("#"):
            continue
        if line.startswith("@page "):
            unit, _, rest = line[6:].partition("|")
            label, _, supplied = rest.partition("|")
            pages.append({"unit": unit.strip(), "label": label.strip(), "lines": [], "line": n,
                          "supplied": supplied.strip().removeprefix("supplied from").strip() or None})
            continue
        if not line.strip():
            continue
        if not pages:
            raise ValueError(f"{text_id}.txt line {n}: text before the first @page")
        pages[-1]["lines"].append(greek.nfc(line.strip()))
    return pages


def texts():
    return sorted(p.stem for p in PROOF.glob("*.txt"))


def _sim(a, b):
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()


def align(ocr, page):
    """Match OCR lines to proofread lines: [(ocr index or None, page index or None)], in order."""
    m, n = len(ocr), len(page)
    skip = -0.15
    best = [[0.0] * (n + 1) for _ in range(m + 1)]
    move = [[None] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        best[i][0], move[i][0] = best[i - 1][0] + skip, "o"
    for j in range(1, n + 1):
        best[0][j], move[0][j] = best[0][j - 1] + skip, "p"
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            opts = [(best[i - 1][j - 1] + _sim(ocr[i - 1], page[j - 1]), "m"),
                    (best[i - 1][j] + skip, "o"), (best[i][j - 1] + skip, "p")]
            best[i][j], move[i][j] = max(opts)
    out, i, j = [], m, n
    while i or j:
        k = move[i][j]
        if k == "m":
            out.append((i - 1, j - 1)); i -= 1; j -= 1
        elif k == "o":
            out.append((i - 1, None)); i -= 1
        else:
            out.append((None, j - 1)); j -= 1
    return out[::-1]


def groups(ocr, page):
    """The page cut into groups of OCR lines and proofread lines that replace each other: [(ocr idx, page idx)].
    Every proofread line is in a group with at least one OCR line; OCR lines after the last proofread line
    (the notes at the foot) are left out."""
    pairs = align(ocr, page)
    last = max((k for k, (o, p) in enumerate(pairs) if p is not None), default=-1)
    out, pend = [], ([], [])
    for o, p in pairs[:last + 1]:
        if o is not None and p is not None:
            out.append((pend[0] + [o], pend[1] + [p]))
            pend = ([], [])
        elif out:
            # a line on one side only: joined to the group before it
            (out[-1][0] if o is not None else out[-1][1]).append(o if o is not None else p)
        else:
            (pend[0] if o is not None else pend[1]).append(o if o is not None else p)
    if not out:
        raise ValueError("no OCR line matches the page")
    return out


def page_corrections(text_id, unit, page):
    """The corrections for one page: (corrections, the corrected text)."""
    lines = unit["text"].split("\n") if unit["text"] else []
    if page.get("supplied"):
        # The scan's leaf is blank: the page, proofread from another scan of the same edition, is supplied whole.
        if any(ln.strip() for ln in lines):
            raise ValueError(f"{unit['n']}: a page is supplied for it, but the scan has text there")
        c = {"text": text_id, "unit": unit["n"], "ocr": "", "read": "\n".join(page["lines"]),
             "why": f"Supplied (Cousin's {page['label']}): the scan's leaf for this page is blank; the page is proofread from "
                    f"another scan of the same edition, {page['supplied']} (sources/neoplatonists/proofread/{text_id}.txt).",
             "by": BY, "proofread": True}
        got, _ = neoplatonists.apply_corrections(unit["text"], [c])
        return [c], got
    gs = groups(lines, page["lines"])

    def make(gs):
        out = []
        for os_, ps in gs:
            o = "\n".join(lines[i] for i in sorted(os_))
            r = "\n".join(page["lines"][j] for j in sorted(ps))
            if o != r:
                out.append({"text": text_id, "unit": unit["n"], "ocr": o, "read": r,
                            "why": f"Proofread from the page image (Cousin's {page['label']}): the OCR misreads this line; "
                                   f"the page reads so (sources/neoplatonists/proofread/{text_id}.txt).",
                            "by": BY, "proofread": True})
        return out

    for _ in range(len(gs)):
        corrs = make(gs)
        got, used = neoplatonists.apply_corrections(unit["text"], corrs)
        counts = {(o, r): k for o, r, k in used}
        bad = [i for i, c in enumerate(corrs) if counts.get((greek.nfc(c["ocr"]), greek.nfc(c["read"]))) != 1]
        if not bad:
            return corrs, got
        # A line found more than once (a short line inside another): join it to the group before it.
        c = corrs[bad[0]]
        gi = next(k for k, (os_, ps) in enumerate(gs) if "\n".join(lines[i] for i in sorted(os_)) == c["ocr"])
        if gi == 0:
            gi = 1
        gs[gi - 1] = (gs[gi - 1][0] + gs[gi][0], gs[gi - 1][1] + gs[gi][1])
        del gs[gi]
    raise ValueError(f"{unit['n']}: the corrections cannot be made to apply once each")


def build(text_id):
    """All the corrections for a proofread text, and the problems found."""
    t = next(x for x in neoplatonists.TEXTS if x["id"] == text_id)
    units = {u["n"]: u for u in neoplatonists.read_ocr(t)[0]}
    out, problems = [], []
    for page in parse(text_id):
        u = units.get(page["unit"])
        if u is None:
            problems.append(f"{text_id}: no page {page['unit']} in the text")
            continue
        if u["label"] != page["label"]:
            problems.append(f"{text_id} {page['unit']}: the page is {u['label']}, the proofread copy says {page['label']}")
        corrs, got = page_corrections(text_id, u, page)
        if got.split("\n")[:len(page["lines"])] != page["lines"]:
            problems.append(f"{text_id} {page['unit']}: with the corrections, the page does not read as proofread")
        out += corrs
    return out, problems


def main_text(text_id):
    """The proofread Greek, page by page, as one text: [(unit, label, text)], a word broken at the end of a line
    joined again, Cousin's note calls (*) left out."""
    out = []
    for p in parse(text_id):
        s = ""
        for ln in p["lines"]:
            if s.endswith("-"):
                s = s[:-1] + ln
            else:
                s = (s + " " + ln) if s else ln
        s = re.sub(r"\s*\(\*+\)", "", s)
        out.append((p["unit"], p["label"], re.sub(r"\s+", " ", s).strip()))
    return out


def joined(text_id):
    """The proofread Greek of a text as one string, pages joined (a word broken across pages joined too)."""
    s = ""
    for _, _, t in main_text(text_id):
        s = s[:-1] + t if s.endswith("-") else (s + " " + t if s else t)
    return s


def write(all_corrs, check=False):
    d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
    mine = set(texts())
    keep = [c for c in d["corrections"] if not (c.get("proofread") and c["text"] in mine)]
    new = keep + all_corrs
    if check:
        return new == d["corrections"]
    d["corrections"] = new
    neoplatonists.CORRECTIONS.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return True


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    all_corrs, n = [], 0
    for tid in texts():
        corrs, problems = build(tid)
        print(f"{tid}: {len(parse(tid))} pages proofread, {len(corrs)} line corrections, {len(problems)} problems")
        for p in problems:
            print("  " + p)
        n += len(problems)
        all_corrs += corrs
    ok = write(all_corrs, check=args.check)
    if args.check and not ok:
        print("sources/neoplatonists/corrections.json is out of date: run python3 tools/proofread.py")
        n += 1
    sys.exit(1 if n else 0)


if __name__ == "__main__":
    main()
