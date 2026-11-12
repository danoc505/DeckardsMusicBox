#!/usr/bin/env python3
"""Aristotle milestone A1: the OCR of the scanned English translations, read by rule.

Two scans from the Internet Archive (sources/manifest.json pins each download by sha256):

  ia-ross-metaphysics-1908   W. D. Ross, Metaphysica, The Works of Aristotle translated into
                             English, vol. VIII (Oxford, 1908). Bekker's pages and columns are
                             printed in the margin, at the line where each begins.
  ia-taylor-metaphysics-1801 Thomas Taylor, The Metaphysics of Aristotle (London, 1801), with
                             his notes from the Greek commentators. No Bekker numbers (Bekker's
                             edition is of 1831): placed when the library is built (tools/align.py).

The scans' OCR with the place of every word (_djvu.xml) is cut down to the pages read and
committed in sources/aristotle/ocr/<source>.json.gz (--extract), because the Archive often
refuses GitHub's servers. Every line keeps its words with their left and right edges and the
line's top and bottom, so that the margin (Ross's Bekker numbers and line numbers) and the
smaller type of the footnotes can be told from the text by their place on the page.

The cleaned texts are written to texts/aristotle/<work>/<translator>.json: paragraphs, each with
its raw OCR, its book and chapter as printed, the Bekker columns printed in it (Ross) at their
character offsets, and the footnotes. Nothing is proofread by a person; every record says so.

    python3 tools/aristotle_ocr.py --extract   # from data/raw/ia-*/djvu.xml
    python3 tools/aristotle_ocr.py             # clean both into texts/aristotle/
"""
import gzip
import json
import re
import statistics
import sys
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OCR_COPY = ROOT / "sources" / "aristotle" / "ocr"
TEXTS = ROOT / "texts" / "aristotle"
MANIFEST = ROOT / "sources" / "manifest.json"

# Scanned leaves (1-based, as the Archive numbers them) that hold each translation.
LEAVES = {
    "ia-ross-metaphysics-1908": None,       # set from the scan below by --extract (the whole Metaphysics)
    "ia-taylor-metaphysics-1801": None,
}


def manifest_sha(src):
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return next(s["sha256"] for s in m["sources"] if s["id"] == src)


def djvu_pages(path):
    """[[[y0, y1, [[word, x0, x1], ...]], ...] for each scanned leaf]."""
    t = path.read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r"<OBJECT\b(.*?)</OBJECT>", t, re.S):
        lines = []
        for lm in re.finditer(r"<LINE>(.*?)</LINE>", m.group(1), re.S):
            ws, ys = [], []
            for c, w in re.findall(r'<WORD coords="([^"]+)"[^>]*>(.*?)</WORD>', lm.group(1), re.S):
                x0, y1, x1, y0 = (int(v) for v in c.split(",")[:4])
                ws.append([unescape(w).strip(), x0, x1])
                ys.append((y0, y1))
            if ws:
                lines.append([min(y for y, _ in ys), max(y for _, y in ys), ws])
        out.append(lines)
    return out


def extract(src, leaves):
    pages = djvu_pages(RAW / src / "djvu.xml")
    return {"source": src, "djvu_sha256": manifest_sha(src), "n_pages": len(pages),
            "pages": {str(lf): pages[lf - 1] for lf in leaves if lf <= len(pages)}}


def write_extract(src, leaves):
    OCR_COPY.mkdir(parents=True, exist_ok=True)
    body = json.dumps(extract(src, leaves), ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    with open(OCR_COPY / f"{src}.json.gz", "wb") as f:
        with gzip.GzipFile(filename="", mode="wb", fileobj=f, mtime=0, compresslevel=9) as g:
            g.write(body)


def scan_pages(src):
    d = json.loads(gzip.decompress((OCR_COPY / f"{src}.json.gz").read_bytes()).decode("utf-8"))
    if d["djvu_sha256"] != manifest_sha(src):
        raise SystemExit(f"aristotle_ocr: {src}: the committed OCR is of another download; run tools/aristotle_ocr.py --extract")
    return {int(k): v for k, v in d["pages"].items()}


# ------------------------------------------------------------------ the page: text, margin, notes

def _median(xs, default=0):
    return statistics.median(xs) if xs else default


def page_layout(lines):
    """The text block's left and right edges and its usual line height, from the page's own lines."""
    full = [l for l in lines if len(l[2]) >= 5]
    left = _median([l[2][0][1] for l in full])
    right = _median([l[2][-1][2] for l in full])
    height = _median([l[1] - l[0] for l in full], 50)
    return left, right, height


def split_margin(ws, left, right, slack=8):
    """(margin words, text words) of a line: words wholly outside the text block."""
    margin, text = [], []
    for w in ws:
        if w[2] < left - slack or w[1] > right + slack:
            margin.append(w)
        else:
            text.append(w)
    return margin, text


def merge_margin_lines(lines, left, right):
    """The OCR sometimes reads a margin number as a line of its own, listed out of order: give its
    words to the text line beside it (the nearest by height on the page), and put the lines in order."""
    lines = sorted(([y0, y1, list(ws)] for y0, y1, ws in lines), key=lambda l: l[0])
    textual = [l for l in lines if split_margin(l[2], left, right)[1]]
    for l in lines:
        if split_margin(l[2], left, right)[1] or not textual:
            continue
        mid = (l[0] + l[1]) / 2
        best = min(textual, key=lambda t: abs((t[0] + t[1]) / 2 - mid))
        if abs((best[0] + best[1]) / 2 - mid) < 45:
            best[2].extend(l[2])
            l[2] = []
    return [l for l in lines if l[2]]


def join_lines(lines, vocab):
    """Join a paragraph's lines, mending words broken at the end of a line."""
    out = ""
    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue
        if out.endswith("-") and not out.endswith("--") and not out.endswith("—"):
            head = re.search(r"([A-Za-z]+)-$", out)
            tail = re.match(r"([A-Za-z]+)", ln)
            if head and tail:
                joined = (head.group(1) + tail.group(1)).lower()
                if joined in vocab or (head.group(1) + "-" + tail.group(1)).lower() not in vocab:
                    out = out[:-1] + ln
                    continue
            out += ln
        else:
            out += (" " if out else "") + ln
    return re.sub(r"\s+", " ", out)


def english_vocab():
    """Words of the clean English texts the Workshop has (the Loeb translations of Plato and Aristotle)."""
    words = set()
    for d in ("perseus-english-plato/data/tlg0059", "perseus-english-aristotle/data/tlg0086"):
        for p in (RAW / d).glob("*/*-eng*.xml"):
            words.update(w.lower() for w in re.findall(r"[A-Za-z]+", re.sub(r"<[^>]+>", " ", p.read_text(encoding="utf-8"))))
    return words


# ------------------------------------------------------------------ Ross (1908)

BEKKER_MARK = re.compile(r"^(\d{3,4})")


def bekker_order(work="tlg025"):
    """The Bekker columns of the Perseus Greek, in order (the columns Ross's margin can name)."""
    import xml.etree.ElementTree as ET
    f = next((RAW / "perseus-greek-aristotle" / "data" / "tlg0086" / work).glob("*-grc*.xml"))
    out = []
    for m in ET.parse(f).getroot().iter("{http://www.tei-c.org/ns/1.0}milestone"):
        if m.get("unit") == "page" and m.get("resp") == "Bekker" and (not out or out[-1] != m.get("n")):
            out.append(m.get("n"))
    return out


def clean_ross(vocab, src="ia-ross-metaphysics-1908", order=None, head=r"BOOK|METAPHYSICA|^\W*\d", leaves=None):
    """An Oxford translation (Ross's Metaphysics, 1908; and the others of the series, Aristotle milestone A3), with
    Bekker's pages and columns in the margin. order: the Bekker columns of the Greek, in order; leaves: (first, last)."""
    pages = scan_pages(src)
    if leaves:
        pages = {lf: v for lf, v in pages.items() if leaves[0] <= lf <= leaves[1]}
    order = order or bekker_order()
    nxt = 0                      # index in order of the next column Ross's margin should name
    paras, notes = [], []
    cur = None                   # {'lines', 'raw', 'marks': [(line index, ref)], 'leaf', 'book'}
    book = 0
    stats = {"leaves": 0, "marks_read": 0, "marks_unread": [], "notes": 0, "textual_notes_left_out": 0, "headings": 0}

    def close():
        nonlocal cur
        if cur and cur["lines"]:
            paras.append(cur)
        cur = None

    for lf in sorted(pages):
        lines = pages[lf]
        if not lines:
            continue
        stats["leaves"] += 1
        left, right, height = page_layout(lines)
        scale = height / 50 if src != "ia-ross-metaphysics-1908" else 1     # the scan's resolution against Ross's
        lines = merge_margin_lines(lines, left, right)
        body, foot = [], []
        # The running head: the first line, when it names the book or the work, or is a number.
        start = 1 if lines and lines[0][0] < 260 * scale and re.search(head, " ".join(w[0] for w in lines[0][2])) else 0
        pitch = _median([b[0] - a[0] for a, b in zip(lines[start:], lines[start + 1:])], 63)
        in_foot = False
        if src != "ia-ross-metaphysics-1908":
            # The notes may fill most of the page: the text's leading is measured from its first lines, and the notes
            # begin after a gap, in a closer leading.
            top = [b[0] - a[0] for a, b in zip(lines[start:start + 7], lines[start + 1:start + 8]) if b[0] - a[0] > 0.5 * height]
            pitch = _median(top, pitch)
        for i in range(start, len(lines)):
            y0, y1, ws = lines[i]
            gap = y0 - lines[i - 1][0] if i > start else 0
            rest = [b - a for a, b, _ in lines[i:]]
            if src != "ia-ross-metaphysics-1908":
                after = [b[0] - a[0] for a, b in zip(lines[i:i + 8], lines[i + 1:i + 9])]
                if not in_foot and i > start + 1 and gap > 1.3 * pitch and (len(after) < 2 or _median(after) < 0.85 * pitch) \
                        and not re.match(r"^\W*(C\w?A\w?P|BOOK)", " ".join(w[0] for w in ws)):
                    in_foot = True
            elif not in_foot and i > start + 3 and gap > 1.35 * pitch and i > len(lines) * 0.5 and _median(rest) < 0.88 * height \
                    and not re.match(r"^\W*(C\w?A\w?P|BOOK)", " ".join(w[0] for w in ws)):
                in_foot = True
            (foot if in_foot else body).append(lines[i])
        for y0, y1, ws in body:
            margin, text = split_margin(ws, left, right)
            t = " ".join(w[0] for w in text).strip()
            if not t:
                continue
            centred = text[0][1] > left + 120 * scale and text[-1][2] < right - 120 * scale
            if centred and (re.match(r"^\W*(BOOK|CHAP|CH\b)", t) or len(t) < 30):
                close()
                stats["headings"] += 1
                if re.match(r"^\W*BOOK", t):
                    book += 1
                continue
            indent = text[0][1] > left + 25 * scale
            if cur is None or indent:
                close()
                cur = {"lines": [], "raw": [], "marks": [], "leaf": lf, "book": book}
            for w in margin:
                m = BEKKER_MARK.match(w[0])
                if not m or nxt >= len(order):
                    continue
                page = int(m.group(1))
                if not int(order[nxt][:-1]) <= page <= int(order[nxt][:-1]) + 3 and len(m.group(1)) == 4:
                    page = int(m.group(1)[:3])     # '1848' read for 184ᵃ: the column's letter read as a digit
                # The column the margin names is the next one in Bekker's order, if its page agrees.
                # (Some marks are not read by the OCR, so a page up to three ahead is taken too.)
                if not int(order[nxt][:-1]) <= page <= int(order[nxt][:-1]) + 3:
                    continue
                for k in range(nxt, min(nxt + 8, len(order))):
                    if int(order[k][:-1]) == page:
                        cur["marks"].append((len(cur["lines"]), order[k]))
                        stats["marks_unread"].extend(order[nxt:k])
                        nxt = k + 1
                        stats["marks_read"] += 1
                        break
            cur["lines"].append(t)
            cur["raw"].append(" ".join(w[0] for w in ws))
        # Footnotes: explanatory notes begin with their number; Ross's textual notes begin with a Bekker reference.
        note_lines = [" ".join(w[0] for w in ws) for y0, y1, ws in foot]
        note_lines = [l for l in note_lines if not re.fullmatch(r"\W*(B\s?\d|[A-Z]{1,3}\.?\s*MET.*|\W*\w{0,3}\W*)", l.strip())]
        block = []
        for l in note_lines + [None]:
            if l is None or re.match(r"^\s*[\d¹²³'*†?]\s+\S", l) or re.match(r"^\s*(\d{3,4}|[ab])\S*\s+\d", l):
                if block:
                    text = " ".join(block)
                    if re.match(r"^\s*\W?\s*(\d{3,4}\S*|[ab]\s?\d)", text) or re.match(r"^\s*\W?\s*\d{1,2}\s", text) and re.search(r"\b(read|om\.|codd|MSS|Christ|Bonitz|Jaeger)\b", text):
                        stats["textual_notes_left_out"] += 1
                    else:
                        target = cur if cur and cur["lines"] else (paras[-1] if paras else None)
                        notes.append({"leaf": lf, "raw": text, "text": re.sub(r"^\s*[\d¹²³'*†?]\s+", "", text).strip(),
                                      "para": target})
                        stats["notes"] += 1
                block = [l] if l is not None else []
            else:
                block.append(l)
    close()
    stats["marks_unread"].extend(order[nxt:])
    out_paras = []
    for p in paras:
        text_lines = p["lines"]
        # Character offset of each printed mark: where its line begins in the joined text.
        marks = []
        for li, ref in p["marks"]:
            prefix = join_lines(text_lines[:li], vocab)
            marks.append([len(prefix) + (1 if prefix else 0), ref])
        out_paras.append({"text": join_lines(text_lines, vocab), "raw": "\n".join(p["raw"]), "leaf": p["leaf"],
                          "book": p["book"], "marks": marks})
    for n in notes:
        n["para"] = next((i for i, p in enumerate(paras) if p is n["para"]), len(paras) - 1)
        n["offset"] = len(out_paras[n["para"]]["text"])
    return out_paras, notes, stats


# ------------------------------------------------------------------ Taylor (1801)

TAYLOR_PARTS = [  # (first leaf, last leaf, part, label)
    (9, 63, "introduction", "Taylor's Introduction"),
    (65, 462, "translation", "The Metaphysics"),
    (463, 499, "additional-notes", "Taylor's Additional Notes"),
]
NOTE_MARK = re.compile(r"^\s*([*†‡§‖¶+•■f]|\|\||[tJ]\s)")
TEXT_MARK = re.compile(r"(?<=[A-Za-z.,;:’'”)])\s?([*†‡§‖¶]|\+(?=\s))")
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50}


def taylor_part(lf):
    return next(((p, lab) for a, b, p, lab in TAYLOR_PARTS if a <= lf <= b), (None, None))


def taylor_vocab():
    import taylor_ocr
    v = taylor_ocr.Vocab.build()
    n = 0
    for f in sorted((RAW / "perseus-english-aristotle" / "data" / "tlg0086").glob("*/*eng*.xml")):
        t = re.sub(r"<teiHeader.*?</teiHeader>", " ", f.read_text(encoding="utf-8"), flags=re.S)
        n += v.add(re.sub(r"<[^>]+>", " ", t))
    v.sources["Loeb translations of Aristotle (Perseus)"] = n
    return v


TAYLOR_HEAD = r"METAPH|INTRODUC|ADDITIONAL|NOTES|Book|BOOK"


def clean_taylor(corrector, src="ia-taylor-metaphysics-1801", part_of=None, counted=("translation",), head=TAYLOR_HEAD, pages=None, head_top=420, text_height=None,
                 heading=None, foot_mark=None):
    """Taylor's pages read by rule: the running head and the catchword dropped, the footnotes (smaller type, after a gap)
    set apart and matched to the marks in the text in order. part_of(leaf) gives (part, label); the books and chapters are
    counted in the parts named in counted, afresh in each (his Works of Aristotle bind several treatises in one volume)."""
    pages = pages if pages is not None else scan_pages(src)
    part_of = part_of or taylor_part
    paras, notes = [], []
    cur = None
    book = chapter = 0
    stats = {"leaves": 0, "paragraphs": 0, "notes": 0, "notes_continued": 0, "marks_matched": 0, "notes_unmatched": 0,
             "books": 0, "chapters": Counter() if False else {}}

    def close():
        nonlocal cur
        if cur and cur["lines"]:
            paras.append(cur)
        cur = None

    last_note = None
    last_part = None
    for lf in sorted(pages):
        part, label = part_of(lf)
        lines = sorted(pages[lf], key=lambda l: l[0])
        if not part or not lines:
            continue
        if part != last_part:
            close()
            book = chapter = 0
            last_part = part
        stats["leaves"] += 1
        left, right, height = page_layout(lines)
        # Running head and page number: the first line, when it is near the top.
        if lines and lines[0][0] < head_top and (re.search(head, " ".join(w[0] for w in lines[0][2]).replace(" ", ""))
                                            or len(lines[0][2]) <= 2):
            if not re.match(r"^\W*BOOK\s", " ".join(w[0] for w in lines[0][2])) or lines[0][0] < head_top - 90:
                lines = lines[1:]
        # Catchword and signature at the foot: short lines, alone at the bottom.
        while lines and len(lines[-1][2]) <= 3 and (lines[-1][2][0][1] > right - 400 or lines[-1][2][-1][2] < right - 300
                                                    or re.match(r"^[A-Z][a-z]?\s*\d", " ".join(w[0] for w in lines[-1][2]))) \
                and sum(len(w[0]) for w in lines[-1][2]) < 14:
            lines = lines[:-1]
        if not lines:
            continue
        # The text's own height and spacing, from the top of the page (the notes are at the foot, and may fill most of it).
        full = [l for l in lines if len(l[2]) >= 5]
        top = full[:7] or lines[:7]
        height = _median([l[1] - l[0] for l in top], height)
        pitch = _median([b[0] - a[0] for a, b in zip(top, top[1:]) if b[0] - a[0] < 3 * (a[1] - a[0])], 65)
        if text_height:
            # The text's height and spacing for the whole volume, where a page of notes under a few lines of text would
            # otherwise give the notes' own.
            height, pitch = text_height, 65
        body, foot = [], []
        in_foot = False
        for i, (y0, y1, ws) in enumerate(lines):
            if not in_foot and i > 0:
                gap = y0 - lines[i - 1][0]
                rest = [b - a for a, b, _ in lines[i:]]
                centred = ws[0][1] > left + 150 and ws[-1][2] < right - 150
                marked = re.match(foot_mark or r"^\s*([*†‡§‖¶+■f]|\|\||t|-\]-|X)\s+[A-Z\"“'(]", " ".join(w[0] for w in ws))
                if not centred and ((gap > 1.15 * pitch and _median(rest) < 0.88 * height and _median(rest[:3]) < 0.9 * height) or (gap > 1.1 * pitch and marked)):
                    in_foot = True
            (foot if in_foot else body).append((y0, y1, ws))
        # The text.
        page_marks = []
        prev_line = None
        for y0, y1, ws in body:
            t = " ".join(w[0] for w in ws).strip()
            centred = ws[0][1] > left + 150 and ws[-1][2] < right - 150
            if centred and len(t) < 40 and heading is not None:
                # The headings read by the volume's own rule (heading(text, book, chapter) -> ('book' | 'chapter', number)
                # or None); another centred line (a verse, a syllogism set out) is text.
                h = heading(t, book, chapter) if part in counted else None
                if h or re.match(r"^\W*(THE|NICOMACH|CATEGOR|PRIOR|ON|INTERPRET|O\s?F|ARIST)\W*$|^[\W\d]*$", t.upper().replace(" ", "")):
                    close()
                    if h and h[0] == "book":
                        book, chapter = h[1], 0
                        stats["books"] += 1
                    elif h:
                        chapter = h[1]
                    prev_line = None
                    continue
            elif centred and len(t) < 40:
                close()
                s = re.sub(r"\s+", "", t).upper()
                if part in counted and re.match(r"^\W*BOOK", s):
                    book += 1
                    chapter = 0
                    stats["books"] += 1
                elif part in counted and re.match(r"^\W*C\W*H\W*A\W*P", s):
                    chapter += 1
                prev_line = None
                continue
            indent = 30 < ws[0][1] - left < 160
            short_prev = prev_line is not None and prev_line[2][-1][2] < right - 90
            if cur is None or (indent and (short_prev or re.search(r"[.?!:;\"”’]\s*\W?$", " ".join(w[0] for w in prev_line[2]) if prev_line else ""))):
                close()
                cur = {"lines": [], "raw": [], "leaf": lf, "part": part, "book": book, "chapter": chapter, "marks": []}
            for m in TEXT_MARK.finditer(t):
                page_marks.append((cur, len(cur["lines"]), m.group(1)))
            cur["lines"].append(t)
            cur["raw"].append(t)
            prev_line = (y0, y1, ws)
        # The footnotes of the page, each opening with its mark.
        blocks = []
        for y0, y1, ws in foot:
            t = " ".join(w[0] for w in ws).strip()
            if NOTE_MARK.match(t) and ws[0][1] > left + 20 or not blocks:
                blocks.append([t])
            else:
                blocks[-1].append(t)
        for bi, b in enumerate(blocks):
            if bi == 0 and not NOTE_MARK.match(b[0]) and last_note is not None:
                last_note["lines"].extend(b)
                stats["notes_continued"] += 1
                continue
            target = None
            if page_marks:
                target = page_marks.pop(0)
                stats["marks_matched"] += 1
            else:
                stats["notes_unmatched"] += 1
            last_note = {"lines": b, "leaf": lf, "target": target, "fallback": cur}
            notes.append(last_note)
            stats["notes"] += 1
    close()
    out = []
    index = {id(p): i for i, p in enumerate(paras)}
    for p in paras:
        text = ""
        for ln in p["lines"]:
            if text.endswith("-") and not text.endswith("--"):
                text = corrector.join_hyphen(text, ln)
            else:
                text = (text + " " + ln) if text else ln
        p["joined"] = text
    for n in notes:
        if n["target"]:
            para = n["target"][0]
        else:
            para = n["fallback"]
        n["para"] = index.get(id(para), len(paras) - 1)
    for p in paras:
        raw = p["joined"]
        text = TEXT_MARK.sub("", raw)
        text = corrector.text(re.sub(r"\s+", " ", text)).strip()
        out.append({"text": text, "raw": "\n".join(p["raw"]), "leaf": p["leaf"], "part": p["part"],
                    "book": p["book"], "chapter": p["chapter"]})
    out_notes = []
    for n in notes:
        raw = " ".join(n["lines"])
        body = re.sub(r"\s+", " ", NOTE_MARK.sub("", raw, count=1))
        if body.endswith("-"):
            body = body[:-1]
        body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), body)
        out_notes.append({"para": n["para"], "leaf": n["leaf"], "raw": raw, "text": corrector.text(body).strip(),
                          "offset": len(out[n["para"]]["text"]) if out else 0,
                          "anchor": "the note mark in the text, in order on the page" if n["target"] else "the page it is printed on"})
    stats["paragraphs"] = len(out)
    stats["chapters"] = {}
    for p in out:
        if p["part"] in counted:
            stats["chapters"].setdefault(str(p["book"]) if len(counted) == 1 else f"{p['part']}:{p['book']}", set()).add(p["chapter"])
    stats["chapters"] = {b: len(c) for b, c in stats["chapters"].items()}
    return out, out_notes, stats


def strays_to_notes(paras, notes):
    """A short paragraph that opens with a note mark is a footnote the page layout did not show as one:
    it becomes a note of the paragraph before it."""
    keep, moved, remap = [], 0, {}
    for i, p in enumerate(paras):
        if keep and len(p["text"]) < 600 and re.match(r"^\W?[tf*†+■]\s+[A-Z(\"“]", p["text"]):
            notes.append({"para": len(keep) - 1, "leaf": p["leaf"], "raw": p["raw"], "text": re.sub(r"^\W?[tf*†+■]\s+", "", p["text"]),
                          "offset": len(keep[-1]["text"]), "anchor": "the page it is printed on"})
            remap[i] = len(keep) - 1
            moved += 1
            continue
        remap[i] = len(keep)
        keep.append(p)
    for n in notes[: len(notes) - moved]:
        n["para"] = remap.get(n["para"], n["para"])
        n["offset"] = min(n["offset"], len(keep[n["para"]]["text"]))
    notes.sort(key=lambda n: (n["para"], n["leaf"]))
    return keep, notes, moved


def write(name, paras, notes, stats, meta):
    dest = TEXTS / "metaphysics" / f"{name}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps({**meta, "proof_status": "OCR cleaned by rule", "stats": stats,
                                "paragraphs": paras, "notes": notes}, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    return dest


def write_taylor_texts(paras, notes):
    """Taylor's Introduction and Additional Notes as whole texts, in the form the reader shows Taylor's
    General Introduction to Plato in (texts/taylor-1804/vol1/*.json), for #taylor/metaphysics-introduction."""
    titles = {"introduction": "Introduction to the Metaphysics of Aristotle",
              "additional-notes": "Additional Notes to the Metaphysics of Aristotle"}
    for part, title in titles.items():
        tid = f"taylor1801.metaphysics-{part}"
        segs, out_notes, k = [], [], 0
        for i, p in enumerate(paras):
            if p["part"] != part:
                continue
            k += 1
            seg = {"id": f"{tid}.p{k:04d}", "kind": "paragraph", "part": "text", "page_1804": str(p["leaf"]),
                   "paragraph": k, "text": p["text"], "raw": p["raw"], "notes": []}
            for n in notes:
                if n["para"] == i:
                    nid = f"{tid}.n{len(out_notes) + 1:03d}"
                    out_notes.append({"id": nid, "type": "footnote", "printed_number": "*", "signed": None, "text": n["text"],
                                      "raw": n["raw"], "anchors": [{"in": seg["id"], "at": len(p["text"])}]})
                    seg["notes"].append({"note": nid, "at": len(p["text"])})
            segs.append(seg)
        d = {"schema": "platonic-workshop/text-v1", "id": tid, "title": title, "author": "Thomas Taylor", "translator": None,
             "edition": "The Metaphysics of Aristotle, translated from the Greek by Thomas Taylor (London, 1801)",
             "source": {"manifest_id": "ia-taylor-metaphysics-1801", "name": "the Internet Archive's scan",
                        "url": "https://archive.org/details/metaphysicsofari00aris", "file": "sources/aristotle/ocr/ia-taylor-metaphysics-1801.json.gz"},
             "page_label": "Scan images", "proof_status": "OCR cleaned by rule, not proofread",
             "segments": segs, "notes": out_notes}
        (TEXTS / "metaphysics" / f"taylor-{part}.json").write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")


def main():
    if "--extract" in sys.argv:
        write_extract("ia-ross-metaphysics-1908", range(21, 325))
        write_extract("ia-taylor-metaphysics-1801", range(9, 500))
        return
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import taylor_ocr
    p, n, s = clean_ross(english_vocab())
    s["marks_unread"] = sorted(set(s["marks_unread"]), key=lambda r: (int(r[:-1]), r[-1]))
    d = write("ross-1908", p, n, s, {"source": "ia-ross-metaphysics-1908", "translator": "W. D. Ross", "date": 1908})
    print(f"Ross (1908): {len(p)} paragraphs, {len(n)} notes, {s['marks_read']} Bekker columns printed -> {d.relative_to(ROOT)}")
    v = taylor_vocab()
    p, n, s = clean_taylor(taylor_ocr.Corrector(v))
    p, n, s["stray_notes_moved"] = strays_to_notes(p, n)
    s["notes"] = len(n)
    write_taylor_texts(p, n)
    d = write("taylor-1801", p, n, s, {"source": "ia-taylor-metaphysics-1801", "translator": "Thomas Taylor", "date": 1801})
    print(f"Taylor (1801): {len(p)} paragraphs, {len(n)} notes, chapters per book {s['chapters']} -> {d.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
