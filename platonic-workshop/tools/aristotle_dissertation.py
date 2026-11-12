#!/usr/bin/env python3
"""Aristotle milestone A2: Thomas Taylor's Dissertation on the Philosophy of Aristotle (London, 1812), read whole.

    python3 tools/aristotle_dissertation.py            # clean the committed OCR into texts/aristotle/dissertation/
    python3 tools/aristotle_dissertation.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

The source is the Internet Archive's scan of the Harvard copy (adissertationon00taylgoog, pinned by sha256 in
sources/manifest.json). The OCR of the pages read, with the place of every word, is committed in
sources/aristotle/ocr/ia-taylor-dissertation-1812.json.gz, so the build needs no download.

Cleaned by rule, as tools/aristotle_ocr.py cleans Taylor's Metaphysics (1801): the running head and the catchword
dropped; the footnotes (smaller type at the foot, opening with a mark) set apart from the text; the passages Taylor
quotes from Aristotle and the commentators (also in smaller type, but in the text) kept as quotations; BOOK and
CHAPTER headings read as printed. Not proofread: every paragraph keeps its OCR as received beside the reading.

Book I chapter 1 is the ancient preface to Aristotle as the Platonists gave it: "a division of his works; ... what the
end is of his philosophy, and which of his writings lead us to this end: what kind of diction he employs; why he
designedly wrote with such obscurity; and ... that his principal doctrines are conformable to those of Plato". The
reader's Start here for Aristotle (reader/aristotle.js) quotes it from this file.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
from aristotle_ocr import _median, page_layout  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = "ia-taylor-dissertation-1812"
OUT = ROOT / "texts" / "aristotle" / "dissertation" / "taylor-1812.json"
LEAVES = range(10, 617)

# (first leaf, last leaf, part, label). Leaves 14-27 (a poem, the Panegyric, and the catalogue of the books Taylor
# used) and 32-33 (a list of his own works) are not read.
PARTS = [
    (10, 13, "preface", "Preface"),
    (28, 31, "terms", "An Explanation of Certain Terms used by Aristotle and his Greek Commentators"),
    (34, 609, "dissertation", "The Dissertation"),
    (610, 616, "additional-note", "An Additional Note to p. 48: the doctrine of Parmenides, from Simplicius on the Physics"),
]
ROMAN_BOOK = {1: "I", 2: "II", 3: "III", 4: "IV"}
HEAD = re.compile(r"DISS|PHIL|ARIST|PREFACE|EXPLANATION|TERMS|BOOK|ON\s+TH", re.I)
MARK = re.compile(r"^\s*([*†‡§‖¶+•■^]|\|\||[tfJ]\s|\W?\s?[*†‡§^])\s*")
TEXT_MARK = re.compile(r"(?<=[A-Za-z.,;:’'”)])\s?([*†‡§‖¶^]|\+(?=\s))")
PITCH = 121
END = re.compile(r"[.?!:\"”’)]\s*\W?$")


def part_of(lf):
    return next(((p, lab) for a, b, p, lab in PARTS if a <= lf <= b), (None, None))


def words(line):
    return " ".join(w[0] for w in line[2]).strip()


def type_sizes(lines, body_h, small):
    """Each line's type size (body_h for the body type, 0 for the smaller), from its leading: the distance to the line
    before or after it, about 134 pixels in the body type and 108 in the smaller, which the scan reads more steadily
    than the height of the letters; a lone line goes by its height, and each line by the majority of it and its neighbours."""
    n = len(lines)
    diffs = [lines[i + 1][0] - lines[i][0] for i in range(n - 1)]
    is_small = []
    for i in range(n):
        near = [d for d in (diffs[i - 1] if i else None, diffs[i] if i < n - 1 else None) if d is not None and d < 165]
        is_small.append(sum(near) / len(near) < PITCH if near else (lines[i][1] - lines[i][0]) < small)
    is_small = [sorted(is_small[max(0, i - 1): i + 2])[len(is_small[max(0, i - 1): i + 2]) // 2] for i in range(n)]
    return [0 if x else body_h for x in is_small]


def clean(corrector):
    pages = aristotle_ocr.scan_pages(SRC)
    # The body type and the smaller type (quotations and footnotes), from the height of every full line of the book:
    # the scan is at one scale throughout.
    hs = sorted(l[1] - l[0] for lf in pages for l in pages[lf] if len(l[2]) >= 6 and part_of(lf)[0] == "dissertation")
    body_h = hs[int(len(hs) * 0.75)]
    small = 0.89 * body_h
    paras, notes = [], []
    cur = None
    book = chapter = 0
    stats = {"leaves": 0, "paragraphs": 0, "quotations": 0, "notes": 0, "notes_continued": 0, "marks_matched": 0,
             "headings": 0, "body_line_height": body_h}
    last_note = None

    def close():
        nonlocal cur
        if cur and cur["lines"]:
            paras.append(cur)
        cur = None

    for lf in sorted(pages):
        part, label = part_of(lf)
        lines = sorted(pages[lf], key=lambda l: l[0])
        if not part or not lines:
            continue
        stats["leaves"] += 1
        left, right, _ = page_layout(lines)
        # The running head (with the page number), which may be read as two lines.
        if lines and lines[0][0] < 1000 and (HEAD.search(words(lines[0])) or len(lines[0][2]) <= 2
                                             or (len(lines) > 1 and lines[1][0] - lines[0][0] > 170)):
            y1 = lines[0][1]
            lines = [l for l in lines[1:] if l[0] > y1 - 10]
        # The catchword at the foot: one or two words, at the right.
        while lines and len(lines[-1][2]) <= 4 and sum(len(w[0]) for w in lines[-1][2]) < 18 and (
                lines[-1][2][0][1] > left + 300 or re.match(r"^\W?[A-Za-z]{1,2}\s?\d?\s", words(lines[-1]) + " ")):
            lines = lines[:-1]
        if not lines:
            continue
        # The foot: from the first line in the smaller type that opens with a note mark, when all after it are small;
        # or, when the last note of the page before is unfinished, the small type that ends this page after the text.
        # A line's type size, from its leading (the distance to the line before or after it: about 134 pixels in the body
        # type and 108 in the smaller), which the scan reads more steadily than the height of the letters.
        sizes = type_sizes(lines, body_h, small)
        foot_at = None
        for i in range(1, len(lines)):
            mark = re.match(r"^\W?\s?[*†‡§‖¶^]", words(lines[i])) if part == "terms" else MARK.match(words(lines[i]))
            gap = lines[i][0] - lines[i - 1][0]
            mark = mark or (gap >= 200 and re.match(r"^\W", words(lines[i])))   # a mark the scan read as a quote or a comma
            if all(h < small for h in sizes[i:i + 30]) and mark and lines[i][2][0][1] > left - 60:
                foot_at = i
                break
        if foot_at is None and last_note is not None and last_note["leaf"] == lf - 1 and not END.search(last_note["lines"][-1]):
            i = len(lines)
            while i > 1 and sizes[i - 1] < small:
                i -= 1
            if i < len(lines) and sizes[i - 1] >= small and lines[i][0] - lines[i - 1][1] > 0.25 * body_h:
                foot_at = i
        body, foot = (lines, []) if foot_at is None else (lines[:foot_at], lines[foot_at:])
        sizes = type_sizes(body, body_h, small)     # again, without the notes beside the last lines of the text
        page_marks = []
        prev = None
        for li, (y0, y1, ws) in enumerate(body):
            t = words((y0, y1, ws))
            if len(ws) <= 2 and len(t) < 16 and ws[0][1] > right - 700 and li == len(body) - 1 and foot:
                continue    # the catchword of the text, printed above the notes
            s = re.sub(r"\s+", "", t).upper()
            centred = ws[0][1] > left + 300 and ws[-1][2] < right - 300
            if centred and len(t) < 40 and re.match(r"^\W*(BOOK|BOOX|BOOIL|CHAP|CUAP|TJHAP)", s):
                close()
                if s.startswith(("BOOK", "BOOX", "BOOIL")) and part == "dissertation":
                    book += 1
                    chapter = 0
                    continue    # the chapter heading follows at once
                chapter += 1
                head = f"Book {ROMAN_BOOK.get(book, book)}, chapter {chapter}" if part == "dissertation" else t
                paras.append({"kind": "heading", "lines": [head], "raw": [t], "leaf": lf, "part": part, "book": book, "chapter": chapter})
                stats["headings"] += 1
                prev = None
                continue
            if ws[0][1] > left + 200 and len(t) < 60 and re.search(r"DISSERTATION|PHILOSOPHY|ONTH|ARISTOT|EXPLANATION|TERMS|PREFACE|COMMENTATORS|USEDBY|USBO|ADDITIONAL|CONCERNING|TARIESOF", s) and t.upper() == t.upper() and sum(c.isupper() for c in t) > 0.6 * sum(c.isalpha() for c in t):
                prev = None     # a title line of the book or of the part
                continue
            kind = "quotation" if sizes[li] < small and part in ("dissertation", "additional-note") else "paragraph"
            indent = 60 < ws[0][1] - left < 360
            short_prev = prev is not None and prev[2][-1][2] < right - 180
            new = (cur is None or cur["kind"] != kind
                   or (indent and (short_prev or (prev is not None and END.search(words(prev)))))
                   or (part == "terms" and ws[0][1] < left + 40 and short_prev))
            if new:
                close()
                cur = {"kind": kind, "lines": [], "raw": [], "leaf": lf, "part": part, "book": book, "chapter": chapter}
            for m in TEXT_MARK.finditer(t):
                page_marks.append((cur, m.group(1)))
            cur["lines"].append(t)
            cur["raw"].append(t)
            prev = (y0, y1, ws)
        blocks = []
        for l in foot:
            t = words(l)
            if (MARK.match(t) and l[2][0][1] > left - 60 and l[2][0][1] < left + 200) or not blocks:
                blocks.append([t])
            else:
                blocks[-1].append(t)
        for bi, b in enumerate(blocks):
            if bi == 0 and not MARK.match(b[0]) and last_note is not None and not END.search(last_note["lines"][-1]):
                last_note["lines"].extend(b)
                last_note["leaf"] = lf
                stats["notes_continued"] += 1
                continue
            target = page_marks.pop(0)[0] if page_marks else None
            stats["marks_matched"] += bool(target)
            last_note = {"lines": b, "leaf": lf, "first_leaf": lf, "target": target, "fallback": cur}
            notes.append(last_note)
        if not foot and last_note is not None and last_note["leaf"] < lf:
            last_note = None
    close()
    return paras, notes, stats


def join(lines, corrector):
    text = ""
    for ln in lines:
        if text.endswith("-") and not text.endswith("--"):
            text = corrector.join_hyphen(text, ln)
        else:
            text = (text + " " + ln) if text else ln
    return text


def to_text(paras, notes, stats, corrector):
    tid = "taylor1812.dissertation"
    segs, out_notes = [], []
    index = {}
    k = 0
    for p in paras:
        if p["kind"] != "heading" and sum(c.isalpha() for c in " ".join(p["lines"])) < 8:
            continue    # a stray mark or a smudge read as text
        k += 1
        text = p["lines"][0] if p["kind"] == "heading" else corrector.text(re.sub(r"\s+", " ", TEXT_MARK.sub("", join(p["lines"], corrector)))).strip()
        seg = {"id": f"{tid}.p{k:05d}", "kind": p["kind"], "part": p["part"], "page_1804": str(p["leaf"]), "paragraph": k,
               "book": p["book"], "chapter": p["chapter"], "text": text, "raw": "\n".join(p["raw"]), "notes": []}
        if p["kind"] == "heading":
            seg["heading"] = text
        index[id(p)] = len(segs)
        segs.append(seg)
    for n in notes:
        para = n["target"] or n["fallback"]
        i = index.get(id(para))
        if i is None:
            i = len(segs) - 1
        raw = " ".join(n["lines"])
        body = re.sub(r"\s+", " ", MARK.sub("", raw, count=1))
        body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), body)
        nid = f"{tid}.n{len(out_notes) + 1:04d}"
        at = len(segs[i]["text"])
        out_notes.append({"id": nid, "type": "footnote", "printed_number": "*", "signed": None, "text": corrector.text(body).strip(),
                          "raw": raw, "leaf": n["first_leaf"], "anchors": [{"in": segs[i]["id"], "at": at}],
                          "anchor": "the note mark in the text, in order on the page" if n["target"] else "the page it is printed on"})
        segs[i]["notes"].append({"note": nid, "at": at})
    stats["paragraphs"] = sum(s["kind"] == "paragraph" for s in segs)
    stats["quotations"] = sum(s["kind"] == "quotation" for s in segs)
    stats["notes"] = len(out_notes)
    stats["chapters"] = {}
    for s in segs:
        if s["kind"] == "heading" and s["part"] == "dissertation":
            stats["chapters"][str(s["book"])] = stats["chapters"].get(str(s["book"]), 0) + 1
    return {"schema": "platonic-workshop/text-v1", "id": tid,
            "title": "A Dissertation on the Philosophy of Aristotle", "author": "Thomas Taylor", "translator": None,
            "edition": "A Dissertation on the Philosophy of Aristotle, in four books, in which his principal physical and metaphysical "
                       "dogmas are unfolded, by Thomas Taylor (London, 1812)",
            "source": {"manifest_id": SRC, "name": "the Internet Archive's scan",
                       "url": "https://archive.org/details/adissertationon00taylgoog", "file": f"sources/aristotle/ocr/{SRC}.json.gz"},
            "page_label": "Scan images", "proof_status": "OCR cleaned by rule, not proofread",
            "parts": [{"part": p, "label": lab, "leaves": [a, b]} for a, b, p, lab in PARTS],
            "stats": stats, "segments": segs, "notes": out_notes}


def main():
    if "--extract" in sys.argv:
        aristotle_ocr.write_extract(SRC, LEAVES)
        return
    import taylor_ocr
    corrector = taylor_ocr.Corrector(aristotle_ocr.taylor_vocab())
    paras, notes, stats = clean(corrector)
    d = to_text(paras, notes, stats, corrector)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    print(f"Taylor's Dissertation (1812): {stats['paragraphs']} paragraphs, {stats['quotations']} quotations, {stats['notes']} notes, "
          f"chapters per book {stats['chapters']} -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
