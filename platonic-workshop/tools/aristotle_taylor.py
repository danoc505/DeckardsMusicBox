#!/usr/bin/env python3
"""Aristotle milestone A8: Thomas Taylor's own translations of the Organon and the Nicomachean Ethics, from his Works of
Aristotle (1806-1812), beside the Greek.

    python3 tools/aristotle_taylor.py            # clean the committed OCR into texts/aristotle/<work>/taylor-*.json
    python3 tools/aristotle_taylor.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

Two of Google's scans in the Internet Archive, pinned by sha256 in sources/manifest.json:

  ia-taylor-organon-1812  The Works of Aristotle, vol. I, part 1 (1812; the Harvard copy, item works00taylgoog): the
                          Categories, On Interpretation and the Prior Analytics, each with his Introduction, and his
                          notes from Simplicius, Ammonius, Philoponus and the other Greek commentators.
  ia-taylor-ethics-1811   The Rhetoric, Poetic, and Nicomachean Ethics (1811; the Oxford copy, item
                          rhetoricpoetica03arisgoog): the Ethics.

The page is read by the rules that read his Metaphysics (tools/aristotle_ocr.py, clean_taylor): the running head and the
catchword dropped, his footnotes (smaller type, after a gap) set apart and matched to the marks in the text in order,
BOOK and CHAPTER headings read where they are printed, centred. Google's scans are about twice the scale of the 1801 one,
so each page is first brought to that scale; Google's own lines ("Digitized by Google") and lines of specks are dropped.

Taylor prints no Bekker columns (Bekker's edition is of 1831). The Organon is placed at Bekker's columns as Owen's is
(tools/aristotle_owen.py, carry_columns): from the Oxford translation of 1928, chapter by chapter (≈). The Ethics is placed
as his Metaphysics is (tools/aristotle.py), against the Loeb English, with the books as fixed points (≈).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "texts" / "aristotle"
ORGANON, ETHICS = "ia-taylor-organon-1812", "ia-taylor-ethics-1811"

# Each volume: the leaves read, and the scale that brings its page to the 1801 scan's (65 pixels from line to line).
# head_top: the running head is above this line, at that scale.
VOLUMES = {ORGANON: {"leaves": (59, 409), "scale": 0.53, "head_top": 600, "text_height": 60},
           ETHICS: {"leaves": (321, 638), "scale": 0.48, "head_top": 560, "text_height": 58}}
# The parts of each volume, by leaf: (first, last, part, work id or None for Taylor's own introductions).
PARTS = {
    ORGANON: [(59, 72, "categories-introduction", None), (73, 147, "categories", "ar006"),
              (149, 155, "interpretation-introduction", None), (157, 203, "interpretation", "ar017"),
              (205, 212, "prior-introduction", None), (213, 409, "prior", "ar001")],
    ETHICS: [(321, 638, "ethics", "ar010")],
}
HEAD = r"CATEGOR|INTERPRET|ANALYT|INTRODUC|ETHIC|ETHIC|NICOM|BOOK|Book"
SLUG = {"ar006": "categories", "ar017": "on-interpretation", "ar001": "prior-analytics", "ar010": "nicomachean-ethics"}
EDITION = {
    ORGANON: ("taylor-1812", "Thomas Taylor, The Works of Aristotle, translated from the Greek, with copious elucidations from the best "
                             "of his Greek commentators, vol. I (London, 1812)"),
    ETHICS: ("taylor-1811", "Thomas Taylor, The Rhetoric, Poetic, and Nicomachean Ethics of Aristotle, translated from the Greek "
                            "(London, 1811)"),
}


def letters(t):
    return sum(c.isalpha() for c in t)


def speck_line(ws):
    """Google's own lines, and lines of specks the scan read in the margin or the gutter."""
    t = " ".join(w[0] for w in ws)
    if re.search(r"Digitized|Google|VjOOQ|VnOOQ|OOQ\s?[Il]", t):
        return True
    return letters(t) < 0.5 * len(t.replace(" ", "")) or (len(t) > 8 and letters(t) < 4)


def pages_of(src):
    v = VOLUMES[src]
    s = v["scale"]
    out = {}
    for lf, lines in aristotle_ocr.scan_pages(src).items():
        keep = []
        for y0, y1, ws in lines:
            if speck_line(ws) or (y1 * s < v["head_top"] - 200 and len(ws) <= 4):
                continue
            keep.append([round(y0 * s), round(y1 * s), [[w, round(x0 * s), round(x1 * s)] for w, x0, x1 in ws]])
        out[lf] = keep
    return out


def part_of(src):
    def f(lf):
        for a, b, part, _ in PARTS[src]:
            if a <= lf <= b:
                return part, part
        return None, None
    return f


ROMAN_READ = str.maketrans({"l": "I", "L": "I", "1": "I", "t": "I", "f": "I", "r": "I", "!": "I", "|": "I", "i": "I", "]": "I",
                            "n": "II", "H": "II", "m": "III"})


def roman(numeral):
    """A Roman numeral as the scan reads one ("VL", "Xni", "IlL", "ir"), or None."""
    s = re.sub(r"[^A-Za-z0-9!|\]]", "", numeral).translate(ROMAN_READ)
    if not s or not re.fullmatch(r"[IVX]+", s):
        return None
    vals = {"I": 1, "V": 5, "X": 10}
    n = 0
    for a, b in zip(s, s[1:] + " "):
        n += -vals[a] if b != " " and vals.get(b, 0) > vals[a] else vals[a]
    return n if 0 < n < 60 else None


BOOK_LINE = re.compile(r"^\W*[B?8][O0o]{1,2}[KC]\.?\s*([A-Za-z0-9!|\]]{1,5})\W*$")
CHAPTER_LINE = re.compile(r"^[\Wj]?[CGt][A-Za-z]{4,8}[RLB]\W?\s*([A-Za-z0-9!|\]]{1,6})\W*$")


# A footnote's first line: Taylor's mark (as the scan reads it), then a capital, or his "i. e." and "Viz.".
FOOT_MARK = r"^\s*([*†‡§‖¶+■•f'^]|\|\||t|-\]-|X|\d)\s*([A-Z\"“'(]|i\.\s?[ec]\.|[Vv]iz\.)"


def heading(text, book, chapter):
    """BOOK and CHAPTER, as the scan reads them. A chapter's number is taken where it reads as the next or the one after
    (a heading the scan missed); otherwise the chapters are counted ("XL" may be the fortieth, or the eleventh misread)."""
    t = text.strip()
    m = BOOK_LINE.match(t)
    if m:
        n = roman(m.group(1))
        return ("book", n if n in (book + 1, book + 2) else book + 1)
    m = CHAPTER_LINE.match(t)
    if m and re.match(r"^[\Wj]?[CGt][HhIiJjEeflr]", t):
        n = roman(m.group(1))
        return ("chapter", n if n in (chapter + 1, chapter + 2) else chapter + 1)
    return None


def read(src, corrector):
    counted = tuple(p for _, _, p, w in PARTS[src] if w)
    paras, notes, stats = aristotle_ocr.clean_taylor(corrector, src=src, part_of=part_of(src), counted=counted, head=HEAD,
                                                     pages=pages_of(src), head_top=VOLUMES[src]["head_top"],
                                                     text_height=VOLUMES[src]["text_height"], heading=heading,
                                                     foot_mark=FOOT_MARK)
    paras, notes, moved = aristotle_ocr.strays_to_notes(paras, notes)
    stats["notes_from_strays"] = moved
    return paras, notes, stats


def treatise(paras, notes, part):
    """One treatise's paragraphs and notes, in the form Owen's are kept (texts/aristotle/<work>/owen-1853.json)."""
    # The title on the treatise's first page (before its first chapter) is not text.
    idx = [i for i, p in enumerate(paras) if p["part"] == part and letters(p["text"]) >= 8 and not (p["chapter"] == 0 and len(p["text"]) < 80)]
    where = {i: k for k, i in enumerate(idx)}
    out = [{"text": paras[i]["text"], "raw": paras[i]["raw"], "leaf": paras[i]["leaf"], "book": paras[i]["book"] or 1,
            "chapter": paras[i]["chapter"], "marks": []} for i in idx]
    out_notes = [{"leaf": n["leaf"], "raw": n["raw"], "text": n["text"], "para": where[n["para"]], "anchor": n["anchor"]}
                 for n in notes if n["para"] in where]
    return out, out_notes


def chapters(out):
    c = {}
    for p in out:
        c.setdefault(str(p["book"]), set()).add(p["chapter"])
    return {b: len(v) for b, v in sorted(c.items())}


def main():
    if "--extract" in sys.argv:
        for src, v in VOLUMES.items():
            aristotle_ocr.write_extract(src, range(v["leaves"][0], v["leaves"][1] + 1))
        return
    import aristotle_owen
    corrector = aristotle_owen.plain_corrector()
    for src in VOLUMES:
        paras, notes, stats = read(src, corrector)
        name, edition = EDITION[src]
        for a, b, part, wid in PARTS[src]:
            if not wid:
                continue
            out, out_notes = treatise(paras, notes, part)
            st = {"leaves": [a, b], "paragraphs": len(out), "notes": len(out_notes), "chapters": chapters(out),
                  "words": sum(len(p["text"].split()) for p in out)}
            if src == ORGANON:
                placed, n_cols = aristotle_owen.carry_columns(wid, out)
                st["columns_carried"] = placed
                st["columns"] = n_cols
            d = {"source": src, "translator": "Thomas Taylor", "edition": edition, "proof_status": "OCR cleaned by rule", "stats": st,
                 "paragraphs": out, "notes": out_notes}
            dest = TEXTS / SLUG[wid] / f"{name}.json"
            dest.write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
            print(f"{wid}: {st['paragraphs']} paragraphs, {st['words']} words, {st['notes']} notes, chapters {st['chapters']}"
                  f"{', columns ' + str(st['columns_carried']) + ' of ' + str(st['columns']) if 'columns_carried' in st else ''} -> {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
