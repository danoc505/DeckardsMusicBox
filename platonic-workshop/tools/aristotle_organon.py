#!/usr/bin/env python3
"""Aristotle milestone A4: the Organon, with the Oxford translation (1928) beside the Greek.

    python3 tools/aristotle_organon.py            # clean the committed OCR into texts/aristotle/<work>/oxford-1928.json
    python3 tools/aristotle_organon.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

The Oxford translators (Edghill, Jenkinson, Mure, Pickard-Cambridge; The Works of Aristotle, vol. I, 1928) print in the
margin of their English the Bekker line numbers (5, 10, ... 35) and, where a column begins, its page and column
(2ᵃ); in the inner margin the number of each chapter. The scan's OCR reads the line numbers well and the column marks
less well (the small a and b are often lost), so a column is placed:

  printed    where its mark is read in the margin;
  computed   where the line numbers start again (35 ... 5) with no mark read: between the two numbers, in proportion
             to the lines (a column has some 36 to 38 of Bekker's lines).

The Greek of the Analytics (Ross, in First1KGreek) prints Bekker's columns in its margin. The Greek of the Categories,
On Interpretation, the Topics and the Sophistical Refutations in First1KGreek is Bekker's own text, but in the Oxford
reprint of 1837, without the Berlin pages: their columns are carried over from the English, chapter by chapter, at the
same proportion of the chapter's length (≈); every page of the reader says so.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
from aristotle_ocr import _median, join_lines, merge_margin_lines, page_layout, split_margin  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "texts" / "aristotle"
SRC = "ia-oxford-organon-1928"
LINE_NUMBERS = {5, 10, 15, 20, 25, 30, 35, 40}
COLUMN_LINES = 37          # Bekker's lines in a column, about (36 to 38)
OCR_DIGITS = str.maketrans({"o": "0", "O": "0", "I": "1", "l": "1", "i": "1", "r": "1", "t": "1", "s": "5", "S": "5",
                            "a": "2", "g": "3", "y": "1", "J": "1", "T": "1", "Z": "2", "B": "8", "b": "6"})
ROMAN_NUM = {"I": 1, "V": 5, "X": 10, "L": 50}

# work id -> (first leaf, last leaf, translator, running-head words, first column, last column)
TREATISES = {
    "ar006": (17, 54, "E. M. Edghill", r"CATEG|CHAPTER", "1a", "15b"),
    "ar017": (59, 88, "E. M. Edghill", r"INTERP|CHAPTER", "16a", "24b"),
    "ar001": (97, 227, "A. J. Jenkinson", r"ANALYT|PRIORA|BOOK", "24a", "70b"),
    "ar001p": (235, 346, "G. R. G. Mure", r"ANALYT|POSTER|BOOK", "71a", "100b"),
    "ar044": (369, 553, "W. A. Pickard-Cambridge", r"TOPIC|BOOK", "100a", "164b"),
    "ar040": (555, 617, "W. A. Pickard-Cambridge", r"SOPHIST|ELENCH|CHAPTER", "164a", "184b"),
}
# Aristotle milestone A8d: Thompson's Historia Animalium (Oxford, 1910), read the same way, for its Bekker columns only (the
# Greek, Bekker's Oxford reprint of 1837, prints none): {work id: (source, file name, spec as in TREATISES)}.
CARRIED = {
    "ar014": ("ia-thompson-historia-1910", "thompson-1910",
              (23, 472, "D'Arcy Wentworth Thompson", r"HISTORIA|ANIMALIUM|BOOK", "486a", "633b")),
}
PRINTED = ("E. M. Edghill (Categories, On Interpretation), A. J. Jenkinson (Prior Analytics), G. R. G. Mure (Posterior "
           "Analytics), W. A. Pickard-Cambridge (Topics, Sophistical Refutations), The Works of Aristotle translated into "
           "English, vol. I (Oxford: Clarendon Press, 1928)")


def columns(first, last):
    """Bekker's columns from first to last: 1a, 1b, 2a ..."""
    p0, p1 = int(first[:-1]), int(last[:-1])
    out = [f"{p}{c}" for p in range(p0, p1 + 1) for c in "ab"]
    return out[out.index(first):out.index(last) + 1]


def line_number(tok):
    t = tok.strip(".,;:'’‘”“\"*°-—_|()[]{}!?~^`")
    t = t.translate(OCR_DIGITS)
    return int(t) if t.isdigit() and int(t) in LINE_NUMBERS else None


def column_mark(tok, page):
    """The page of a column mark ('2°', '14”', '101"', '1642' for 164ᵃ), if it names page or the page after."""
    m = re.match(r"^(\d{1,3})(\S*)$", tok.strip(".,;:|()[]"))
    if not m:
        return None
    n, rest = int(m.group(1)), m.group(2)
    for p in (page, page + 1):
        if n == p and (rest or p not in LINE_NUMBERS):
            return p
        # The superscript letter read as a digit after the page: 1642 for 164ᵃ, 262 for 26ᵃ.
        if len(m.group(1)) == len(str(p)) + 1 and m.group(1).startswith(str(p)) and not rest and n not in LINE_NUMBERS:
            return p
    return None


def roman(s):
    s = s.replace("l", "I").replace("1", "I")
    if not re.fullmatch(r"[IVXL]+", s):
        return None
    v = 0
    for a, b in zip(s, s[1:] + " "):
        x = ROMAN_NUM[a]
        v += -x if b != " " and ROMAN_NUM.get(b, 0) > x else x
    return v


def clean(work_id, vocab, src=SRC, spec=None, head_books=False):
    """spec: (first leaf, last leaf, translator, running-head words, first column, last column), TREATISES' by default.
    head_books: the book is also read from the running head (BOOK III. 4), where the book's own heading is lost or
    misread (Thompson's Historia Animalium)."""
    first_leaf, last_leaf, translator, head_re, c0, c1 = spec or TREATISES[work_id]
    order = columns(c0, c1)
    pages = aristotle_ocr.scan_pages(src)
    stream = []          # one entry per line of text: {'text', 'raw', 'leaf', 'new_para', 'chapter', 'book', 'line', 'mark'}
    notes = []
    stats = {"leaves": 0, "line_numbers": 0, "marks_read": 0, "chapters_read": 0, "notes": 0, "textual_notes_left_out": 0}
    book, nxt, last_line = 1, 0, 0
    last_chapter = {}
    for lf in range(first_leaf, last_leaf + 1):
        lines = sorted(pages.get(lf, []), key=lambda l: l[0])
        if len(lines) < 4:
            continue
        stats["leaves"] += 1
        left, right, height = page_layout(lines)
        lines = merge_margin_lines(lines, left, right)
        # The running head: the treatise's name, CHAPTER or BOOK, with the column at the top of the page.
        start = 0
        while start < min(2, len(lines)):
            t = " ".join(w[0] for w in lines[start][2])
            if lines[start][0] > 4.5 * height or re.fullmatch(r"\W*BOOK\s+[IVXLl1]+\W*", t):
                break                # a book's heading, lower on the page, is not the running head
            if re.search(head_re, t.upper()) and len(split_margin(lines[start][2], left, right)[1]) <= 6 or re.fullmatch(r"\W*\d{1,3}\W*\w?\W*", t):
                start += 1
            else:
                break
        head_page = []      # the numbers in the running head that may be the page at its top
        for hl in lines[:start]:
            words = [w[0] for w in hl[2]]
            hb = re.match(r"^\W*BOOK\W*([IVXLl1T]+)\b", " ".join(words)) if head_books else None
            if hb and roman(hb.group(1).replace("T", "I")) == book + 1:
                book += 1
            for j, w in enumerate(hl[2]):
                before = words[j - 1] if j else ""
                if re.match(r"^(CHAPTER|CH|[IVXL]+\.?,?)$", before.strip(".,")) or before.endswith("."):
                    continue            # the chapter's number in 'CHAPTER 4' or 'BOOK I. 4', not the page
                m = re.match(r"^(\d{1,4})\D{0,2}$", w[0])
                if m:
                    v = int(m.group(1))
                    head_page += [v, v // 10]
        body = lines[start:]
        pitch = _median([b[0] - a[0] for a, b in zip(body[:8], body[1:9])], 60)
        # The footnotes: after a gap, in smaller type, beginning with a mark.
        cut = len(body)
        for i in range(2, len(body)):
            y0, y1, ws = body[i]
            t = " ".join(w[0] for w in ws)
            rest = [b[1] - b[0] for b in body[i:]]
            gap = body[i][0] - body[i - 1][0]
            if gap > 1.1 * pitch and _median(rest) < 0.92 * height and re.match(r"^[\W\d]", t) or \
                    gap > 1.3 * pitch and _median(rest) < 0.9 * height and i > len(body) // 3 or \
                    gap > 1.2 * pitch and i > len(body) // 3 and \
                    _median([b[0] - a[0] for a, b in zip(body[i:i + 6], body[i + 1:i + 7])], pitch) < 0.85 * pitch:
                cut = i
                break
        side_votes = {"L": 0, "R": 0}
        for y0, y1, ws in body[:cut]:
            margin, _ = split_margin(ws, left, right)
            for w in margin:
                if line_number(w[0]):
                    side_votes["L" if w[2] < left else "R"] += 1
        line_side = "L" if side_votes["L"] >= side_votes["R"] else "R"
        first = True
        for y0, y1, ws in body[:cut]:
            margin, text = split_margin(ws, left, right)
            t = " ".join(w[0] for w in text).strip()
            if not t:
                continue
            centred = text[0][1] > left + 0.15 * (right - left) and text[-1][2] < right - 0.15 * (right - left)
            m = re.match(r"^\W*BOOK\s+([IVXLl1]+)\W*$", t)
            if centred and m:
                b = roman(m.group(1))
                if b and b == book + 1:
                    book = b
                continue
            if head_books and centred and re.match(r"^\W*BOOK\W+\S{1,5}\W*$", t) and text[0][0] and \
                    last_chapter.get(book, 0) > 3:
                book += 1                    # 'BOOK. WI': a book's heading, its number misread
                continue
            letters = [c for c in t if c.isalpha()]
            if centred and len(t) < 25 or len(t.split()) <= 4 and letters and sum(c.isupper() for c in letters) > 0.7 * len(letters):
                continue          # a heading (the treatise's name)
            # A number set at the start of the line, just inside the text block, is a margin number too.
            lead = []
            if len(text) > 1 and re.fullmatch(r"\d{1,3}\W?", text[0][0]) and text[1][1] - text[0][2] > 15:
                lead, text = [text[0]], text[1:]
                t = " ".join(w[0] for w in text).strip()
            entry = {"text": t, "raw": " ".join(w[0] for w in ws), "leaf": lf, "new_para": text[0][1] > left + 0.02 * (right - left),
                     "book": book, "chapter": None, "line": None, "mark": None}
            # Line numbers and column marks are on one side (the outer margin), the chapter's number on the other.
            for w in lead + margin:
                side = "L" if (w[2] < left or w in lead) else "R"
                n = re.sub(r"\W", "", w[0])
                if side != line_side:
                    if n.isdigit() and 0 < int(n) < 50:
                        entry["chapter"] = int(n)
                        last_chapter[book] = max(last_chapter.get(book, 0), int(n))
                    continue
                page = int(order[min(nxt, len(order) - 1)][:-1])
                cm = column_mark(w[0], page)
                ln = line_number(w[0])
                if cm is not None and ln and last_line in (ln - 5, ln - 10):
                    cm = None           # '1°' after line 5 is line 10, not column 1ᵃ
                if cm is not None and nxt < len(order):
                    for k in range(nxt, min(nxt + 4, len(order))):
                        if int(order[k][:-1]) == cm:
                            entry["mark"] = order[k]
                            nxt = k + 1
                            stats["marks_read"] += 1
                            break
                    if entry["mark"]:
                        last_line = 0
                        continue
                if ln:
                    entry["line"] = ln
                    last_line = ln
                    stats["line_numbers"] += 1
            if first:
                entry["head_page"] = head_page
            first = False
            stream.append(entry)
        # Notes.
        block = []
        for item in body[cut:] + [None]:
            l = " ".join(w[0] for w in item[2]) if item else None
            if l is None or re.match(r"^\s*[\d¹²³'*†?‘]\s*\S", l) and block:
                if block:
                    text = " ".join(block)
                    if re.search(r"\b(Read|read|Omit|omit|codd|MSS|Waitz|Bekker|Strache|Wallies|Ross|Bonitz|Pacius|cod\.|om\.)\b", text):
                        stats["textual_notes_left_out"] += 1
                    else:
                        notes.append({"leaf": lf, "raw": text, "text": re.sub(r"^\s*[\d¹²³'*†?‘]\s*", "", text).strip(), "at": len(stream) - 1})
                        stats["notes"] += 1
                block = [l] if l else []
            else:
                block.append(l)
    return assemble(stream, notes, order, vocab, stats)


def assemble(stream, notes, order, vocab, stats):
    """Chapters kept in order; column marks where printed or where the line numbers start again; paragraphs."""
    # Chapters: a number read in the inner margin is kept if it follows the chapter before (one may be missed).
    cur_book, cur_ch = None, 0
    for e in stream:
        if e["book"] != cur_book:
            cur_book, cur_ch = e["book"], 0
        if e["chapter"] is not None and cur_ch < e["chapter"] <= cur_ch + 4:
            cur_ch = e["chapter"]
            e["new_para"] = True
            stats["chapters_read"] += 1
        else:
            e["chapter"] = None
        e["in_chapter"] = cur_ch
    # Columns: printed marks first; where the line numbers go back (from 25 or more to 15 or less) with no mark read
    # between, a column begins in between, at the place in proportion to the lines.
    idx = {c: i for i, c in enumerate(order)}
    printed = [(i, idx[e["mark"]]) for i, e in enumerate(stream) if e["mark"]]
    nums = [(i, e["line"]) for i, e in enumerate(stream) if e["line"]]
    computed = []
    for (i0, n0), (i1, n1) in zip(nums, nums[1:]):
        if n0 >= 25 and n1 <= 15 and n1 < n0:
            if any(i0 <= i <= i1 for i, _ in printed):
                continue
            per = (i1 - i0) / max(1, (COLUMN_LINES - n0) + n1)
            at = i0 + round(per * (COLUMN_LINES - n0 + 1))
            computed.append(min(max(at, i0 + 1), i1))
    # Number the columns: walk the stream, a printed mark sets the column, a computed start moves to the next one.
    starts = {}
    ci = 0
    starts[0] = (0, "computed" if not stream or not stream[0]["mark"] else "printed")
    # The running head names the page at the top of each page: a column missed before it is begun there (computed).
    heads = [(i, "h", e["head_page"]) for i, e in enumerate(stream) if e.get("head_page")]
    events = sorted([(i, "p", c) for i, c in printed] + [(i, "c", None) for i in computed] + heads, key=lambda x: (x[0], x[1] != "h"))
    for i, kind, c in events:
        if kind == "h":
            here = int(order[ci][:-1])
            c = min((x for x in c if here < x <= here + 4 and f"{x}a" in idx), default=None)
            if c:
                ci = idx[f"{c}a"]
                starts[i] = (ci, "computed")
                stats["columns_from_heads"] = stats.get("columns_from_heads", 0) + 1
        elif kind == "p":
            if c >= ci:
                ci = c
                starts[i] = (ci, "printed")
        elif ci + 1 < len(order):
            ci += 1
            starts[i] = (ci, "computed")
    stats["columns_printed"] = sum(1 for _, m in starts.values() if m == "printed")
    stats["columns_computed"] = sum(1 for _, m in starts.values() if m == "computed")
    stats["columns_reached"] = order[ci]
    # Paragraphs.
    paras, cur = [], None
    para_of_line = []
    for i, e in enumerate(stream):
        prev = stream[i - 1]["text"] if i else ""
        if cur is None or (e["new_para"] and re.search(r"[.?!:’”'\"]\W?$", prev)) or e["chapter"] is not None:
            cur = {"lines": [], "raw": [], "leaf": e["leaf"], "book": e["book"], "chapter": e["in_chapter"], "marks": []}
            paras.append(cur)
        if i in starts:
            cur["marks"].append((len(cur["lines"]), order[starts[i][0]], starts[i][1]))
        cur["lines"].append(e["text"])
        cur["raw"].append(e["raw"])
        para_of_line.append(len(paras) - 1)
    out = []
    for p in paras:
        marks = []
        for li, c, how in p["marks"]:
            prefix = join_lines(p["lines"][:li], vocab)
            marks.append([len(prefix) + (1 if prefix else 0), c, how])
        out.append({"text": join_lines(p["lines"], vocab), "raw": "\n".join(p["raw"]), "leaf": p["leaf"], "book": p["book"],
                    "chapter": p["chapter"], "marks": marks})
    for n in notes:
        n["para"] = para_of_line[n.pop("at")] if para_of_line else 0
    return out, notes, stats


def write(work_id, slug, vocab):
    if work_id in CARRIED:
        src, name, spec = CARRIED[work_id]
        paras, notes, stats = clean(work_id, vocab, src=src, spec=spec, head_books=True)
    else:
        src, name, spec = SRC, "oxford-1928", TREATISES[work_id]
        paras, notes, stats = clean(work_id, vocab)
    dest = TEXTS / slug / f"{name}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps({"source": src, "translator": spec[2], "proof_status": "OCR cleaned by rule",
                                "stats": stats, "paragraphs": paras, "notes": notes}, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    return stats


def strict_anchors(english, estart, etotal, gfirst, gtotal, key, lo=0.6, hi=1.6):
    """The chapters read in the English margin that may be trusted as fixed points: a number misread (a note's, or a
    chapter's read twice) would put a chapter where the Greek's is not. Between two fixed points the Greek must run to
    some lo to hi times its usual length for the English; of the chapters that keep to that, in order, the most are
    taken (a longest path), with the start and the end."""
    cands = [(0, 0)]
    seen = set()
    for k, p in enumerate(english):
        ck = key(p)
        if ck in seen or ck[1] == 0 or ck not in gfirst:
            continue
        seen.add(ck)
        cands.append((estart[k], gfirst[ck]))
    cands.append((etotal, gtotal))
    rate = gtotal / max(1, etotal)
    best = [(1, None)]
    for n in range(1, len(cands)):
        e1, g1 = cands[n]
        top = (0, None)
        for m in range(n):
            e0, g0 = cands[m]
            if best[m][0] and e0 < e1 and g0 < g1 and lo * rate <= (g1 - g0) / (e1 - e0) <= hi * rate and best[m][0] + 1 > top[0]:
                top = (best[m][0] + 1, m)
        best.append(top)
    n, out = len(cands) - 1, []
    while n is not None:
        out.append(cands[n])
        n = best[n][1]
    return out[::-1]


def greek_marks(greek_paras, english, order, strict=False):
    """The columns of a Greek text that does not print them, carried over from the English. The chapters whose start
    is read in the English margin are fixed points (the Greek's chapters are marked in its TEI); between two of them a
    column the English begins at some fraction of the way begins at the same fraction of the Greek, at a word's start.
    [(para index, offset, column)]."""
    def starts_of(paras):
        out, pos = [], 0
        for p in paras:
            out.append(pos)
            pos += len(p["text"]) + 1
        return out, pos
    gstart, gtotal = starts_of(greek_paras)
    estart, etotal = starts_of(english)
    key = lambda p: (p.get("book") or 1, p.get("chapter") or 0)
    gfirst = {}
    for k, p in enumerate(greek_paras):
        gfirst.setdefault(key(p), gstart[k])
    if strict:
        # The English stops before the Greek does (Thompson leaves out Book X): the Greek's end is its next book's start.
        last_book = max((p.get("book") or 1) for p in english)
        gtotal = min((g for (b, c), g in gfirst.items() if b > last_book), default=gtotal)
        anchors = strict_anchors(english, estart, etotal, gfirst, gtotal, key)
    else:
        anchors = [(0, 0)]
        seen = set()
        for k, p in enumerate(english):
            ck = key(p)
            if ck in seen or ck[1] == 0:
                continue
            seen.add(ck)
            if ck in gfirst and gfirst[ck] > anchors[-1][1] and estart[k] > anchors[-1][0]:
                anchors.append((estart[k], gfirst[ck]))
        anchors.append((etotal, gtotal))

    def to_greek(e):
        for (e0, g0), (e1, g1) in zip(anchors, anchors[1:]):
            if e0 <= e <= e1:
                return g0 + (e - e0) / max(1, e1 - e0) * (g1 - g0)
        return gtotal
    out, last = [], -1
    idx = {c: i for i, c in enumerate(order)}
    for k, p in enumerate(english):
        for m in p["marks"]:
            off, col = m[0], m[1]
            if col not in idx or idx[col] <= last:
                continue
            at = to_greek(estart[k] + off)
            gk = max(i for i, s in enumerate(gstart) if s <= at)
            t = greek_paras[gk]["text"]
            o = int(min(len(t), max(0, at - gstart[gk])))
            while 0 < o < len(t) and not t[o - 1].isspace():
                o -= 1
            out.append((gk, o, col))
            last = idx[col]
    return out


def carried_marks(work, greek_paras):
    """For aristotle_f1k: the Greek's columns carried over from this English (texts/aristotle/<slug>/oxford-1928.json,
    or the file CARRIED names)."""
    name, spec = (CARRIED[work["id"]][1:] if work["id"] in CARRIED else ("oxford-1928", TREATISES[work["id"]]))
    path = TEXTS / work["slug"] / f"{name}.json"
    if not path.exists():
        return []
    import aristotle_trans
    english = json.loads(path.read_text(encoding="utf-8"))["paragraphs"]
    c0, c1 = spec[4:6]
    order = columns(c0, c1)
    # Every column, where the English has it: printed, computed from its line numbers, or shared out between two.
    begun = {}
    for k, a, b, col, how in aristotle_trans.place(english, order):
        begun.setdefault(col, (k, a))
    marked = [dict(p, marks=[]) for p in english]
    for col, (k, a) in begun.items():
        marked[k]["marks"].append([a, col])
    for p in marked:
        p["marks"].sort()
    return greek_marks(greek_paras, marked, order, strict=work["id"] in CARRIED)


def main():
    import aristotle_f1k
    if "--extract" in sys.argv:
        aristotle_ocr.write_extract(SRC, range(17, 620))
        for src, _, spec in CARRIED.values():
            aristotle_ocr.write_extract(src, range(spec[0], spec[1] + 1))
        return
    vocab = aristotle_ocr.english_vocab()
    for wid in list(TREATISES) + list(CARRIED):
        w = aristotle_f1k.WORK_BY_ID[wid]
        s = write(wid, w["slug"], vocab)
        print(f"{w['title']}: {s['leaves']} leaves, {s['columns_printed']} columns printed and {s['columns_computed']} computed "
              f"(to {s['columns_reached']}), {s['chapters_read']} chapters, {s['notes']} notes")


if __name__ == "__main__":
    main()
