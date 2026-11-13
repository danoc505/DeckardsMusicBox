#!/usr/bin/env python3
"""Aristotle milestone A8d: Bekker's columns for the Parva Naturalia, from Biehl's Greek (Teubner, 1898).

First1KGreek has the Parva Naturalia only in Bekker's own text as reprinted at Oxford (1837), which prints no Berlin
pages, and GLAUx gives none either. Biehl prints in his margin Bekker's page and column where each begins (436ᵇ) and
Bekker's line numbers (5, 10 ... 35). His Greek is close to Bekker's, so the column is carried over word by word:

  1. The scan's OCR (sources/aristotle/ocr/ia-biehl-parva-naturalia-1898.json.gz, the place of every word) is read
     page by page: the running head and the apparatus below the text are left out; a number in the margin is a
     column mark (three digits, the page) or a line number.
  2. A column begins at the line where its mark is read. Where the mark is not read but the line numbers start
     again (30 ... 5), it begins between, in proportion to the lines, as in the Oxford Organon
     (tools/aristotle_organon.py).
  3. Biehl's words are paired with the First1KGreek words (build_db.align, on the forms without accents); a column
     begins in the First1KGreek text at the word paired with the first word of Biehl's line, or the nearest paired
     word after it. The column is placed to the line, not to the word, and is marked ≈ in the reader.

    python3 tools/aristotle_biehl.py            # report how many columns are read and placed, work by work
    python3 tools/aristotle_biehl.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
import build_db  # noqa: E402
import greek  # noqa: E402
from aristotle_ocr import _median, merge_margin_lines, page_layout, split_margin  # noqa: E402
from aristotle_organon import columns  # noqa: E402

SRC = "ia-biehl-parva-naturalia-1898"
LEAVES = (25, 150)
FIRST, LAST = "436a", "480b"
LO, HI = 0.6, 1.5     # a column's length against the mean column's, at least and at most
PRINTED = "Wilhelm Biehl, Aristotelis Parva naturalia (Leipzig: Teubner, 1898)"


def column_page(tok):
    """The page a column mark names ('436b', '445»', '4118' for 471ᵇ, '496b' for 436ᵇ), as read: (digits, letter or None)."""
    m = re.match(r"^(\d{3})(\S?)", tok.strip(".,;:|()[]'‘’"))
    if not m or m.group(1)[0] != "4":
        return None
    letter = {"a": "a", "b": "b"}.get(m.group(2))
    return m.group(1), letter


def likeness(digits, page):
    """How many of the three digits are the page's, in place (496 and 436: two; a 7 is often read as 1, 411 for 471)."""
    return sum(a == b or (a, b) == ("1", "7") for a, b in zip(digits, str(page)))


def stream():
    """Biehl's text, line by line: [{'leaf', 'words': [str], 'mark': (digits, letter) or None}]."""
    pages = aristotle_ocr.scan_pages(SRC)
    out, seen = [], set()
    for lf in range(LEAVES[0], LEAVES[1] + 1):
        lines = pages.get(lf, [])
        if len(lines) < 4:
            continue
        left, right, height = page_layout(lines)
        lines = merge_margin_lines(lines, left, right)
        # The running head: the treatise's name or 'Cap. 5. 444b, 39 — Cap. 6. 445b, 11. 95', at the top.
        start = 0
        if lines and (re.search(r"Cap\.|ΠΕΡ|Π Ε Ρ", " ".join(w[0] for w in lines[0][2])) or len(lines[0][2]) <= 2):
            start = 1
        body = lines[start:]
        pitch = _median([b[0] - a[0] for a, b in zip(body[:8], body[1:9])], 95)
        # The apparatus: after a gap, in a closer leading, to the foot of the page.
        cut = len(body)
        for i in range(3, len(body)):
            after = [b[0] - a[0] for a, b in zip(body[i:i + 5], body[i + 1:i + 6])]
            if body[i][0] - body[i - 1][0] > 1.15 * pitch and after and _median(after) < 0.85 * pitch:
                cut = i
                break
        # The scan has some pages twice (leaves 74 and 76): a page whose first lines are those of one just read is left out.
        first = " ".join(w[0] for _, _, ws in body[:3] for w in ws)
        if first in seen:
            continue
        seen.add(first)
        for y0, y1, ws in body[:cut]:
            margin, text = split_margin(ws, left, right)
            words = [w[0] for w in text]
            # A heading (the treatise's title, centred, in capitals) has no place in the text.
            joined = " ".join(words)
            letters = [c for c in joined if c.isalpha()]
            if letters and sum(c.isupper() for c in letters) > 0.6 * len(letters):
                continue
            e = {"leaf": lf, "words": words, "mark": None}
            for w in margin:
                if len(re.sub(r"\D", "", w[0])) >= 3:
                    e["mark"] = column_page(w[0]) or e["mark"]
            if words:
                out.append(e)
    return out


def column_starts(lines, at):
    """{line index: column}: where each column printed in the margin begins. at(line): the place in the First1KGreek
    text (characters from the start of the Parva Naturalia) of the line's first word, from the pairing of the words.
    A mark's page is often misread by a digit (496 for 436) and its letter lost, so each mark may name any column of a
    page that shares two of its three digits in place (and the letter, if read). Bekker's columns are of much the same
    length, so between two marks there is some LO to HI times the mean column's length a column: of the readings that
    keep to that, in order, the most marks are taken (a longest path). A mark left out is placed by length (≈)."""
    order = columns(FIRST, LAST)
    total = at(len(lines))
    mean = total / len(order)
    nodes = [(0, 0, 3, 0)]        # (line, column index, likeness, place): the first column begins with the text
    for i, e in enumerate(lines):
        if e["mark"] and at(i) is not None:
            digits, letter = e["mark"]
            for c, col in enumerate(order):
                k = likeness(digits, int(col[:-1]))
                if k >= 2 and (letter is None or col[-1] == letter) and c > 0:
                    nodes.append((i, c, k, at(i)))
    best = [(1, 3, None)]         # (marks, likeness, previous node) for each node
    for n in range(1, len(nodes)):
        i1, c1, k1, g1 = nodes[n]
        top = (0, 0, None)
        for m in range(n):
            i0, c0, _, g0 = nodes[m]
            if i0 < i1 and c0 < c1 and best[m][0] and LO * mean <= (g1 - g0) / (c1 - c0) <= HI * mean:
                cand = (best[m][0] + 1, best[m][1] + k1, m)
                if cand[:2] > top[:2]:
                    top = cand
        best.append(top)
    n = max(range(len(nodes)), key=lambda n: best[n][:2])
    starts = {}
    while n is not None:
        starts[nodes[n][0]] = order[nodes[n][1]]
        n = best[n][2]
    return starts


def tokens(lines):
    """Biehl's Greek words, a word broken at the end of a line joined again: [(form, line index)]."""
    out, carry = [], None
    for i, e in enumerate(lines):
        words = list(e["words"])
        if carry is not None and words:
            words[0] = carry[0] + words[0]
            li = carry[1]
            carry = None
        else:
            li = i
        for j, w in enumerate(words):
            if j == len(words) - 1 and w.endswith(("-", "—")) and len(w) > 1:
                carry = (w.rstrip("-—"), li if j == 0 else i)
                continue
            for m in greek.WORD.finditer(w):
                out.append((greek.nfc(m.group(0)), li if j == 0 else i))
    return out


def key(t):
    k = greek.strip_accents(t).rstrip(greek.APOSTROPHES).lower().replace("ϑ", "θ").replace("ς", "σ").replace("ϕ", "φ")
    return k.replace("ξ", "ζ")          # the OCR reads ζ as ξ (ξῴων)


_CACHE = {}


def biehl():
    """Biehl's words [(form, line)], each paired with a First1KGreek word {word: (work id, para, offset)}, and the
    columns printed in his margin {word: column}, at the first word of the line where each is printed."""
    if "t" not in _CACHE:
        import aristotle_f1k
        lines = stream()
        toks = tokens(lines)
        ours, place, total = [], [], 0
        for w in aristotle_f1k.WORKS:
            if w.get("columns") == "biehl":
                paras, _ = aristotle_f1k.read_tei(w)
                for k, p in enumerate(paras):
                    for m in greek.WORD.finditer(p["text"]):
                        ours.append((w["id"], k, m.start(), greek.nfc(m.group(0))))
                        place.append(total + m.start())
                    total += len(p["text"]) + 1
        pairs = build_db.align([key(t) for t, _ in toks], [key(o[3]) for o in ours])
        paired = {i: js[0] for i, (js, _) in pairs.items()}
        first_tok = {}
        for n, (_, li) in enumerate(toks):
            first_tok.setdefault(li, n)
        line_at = {}
        for li in range(len(lines)):
            n = first_tok.get(li)
            if n is None:
                continue
            j = next((paired[x] for x in range(n, min(n + 15, len(toks))) if x in paired), None)
            line_at[li] = place[j] if j is not None else None
        line_at[len(lines)] = total
        starts = column_starts(lines, line_at.get)
        start_at = {first_tok[li]: c for li, c in starts.items() if li in first_tok}
        _CACHE["t"] = (toks, {i: ours[j][:3] for i, j in paired.items()}, start_at, len(pairs) / max(1, len(toks)))
    return _CACHE["t"]


def carried_marks(work, paras):
    """For aristotle_f1k: the columns of one work of the Parva Naturalia, carried from Biehl's margin to the
    First1KGreek text word by word: [(para index, offset, column)]. A column begins at the word paired with the
    first word of Biehl's line, or with the nearest paired word after it in that line or the next."""
    toks, paired, start_at, _ = biehl()
    order = columns(*work["bekker"])
    out = []
    for n, c in sorted(start_at.items()):
        if c not in order:
            continue
        for j in range(n, min(n + 15, len(toks))):
            if j in paired:
                wid, k, off = paired[j]
                if wid == work["id"]:
                    out.append((k, off, c))
                break
    return out


def main():
    import aristotle_f1k
    if "--extract" in sys.argv:
        aristotle_ocr.write_extract(SRC, range(LEAVES[0] - 1, LEAVES[1] + 1))
        return
    toks, paired, start_at, share = biehl()
    print(f"Biehl: {len(toks)} words, {share:.0%} paired with the First1KGreek text; "
          f"{len(start_at)} of {len(columns(FIRST, LAST))} columns read in the margin")
    for w in aristotle_f1k.WORKS:
        if w.get("columns") == "biehl":
            paras, _ = aristotle_f1k.read_tei(w)
            marks = carried_marks(w, paras)
            print(f"{w['title']}: {len(marks)} of {len(columns(*w['bekker']))} columns carried")


if __name__ == "__main__":
    main()
