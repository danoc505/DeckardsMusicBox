#!/usr/bin/env python3
"""Aristotle milestone A4b: Porphyry's Introduction (the Isagoge) in Octavius Freire Owen's English (London: Bohn, 1853).

    python3 tools/aristotle_porphyry.py            # clean the committed OCR into texts/aristotle/porphyry/owen-1853.json
    python3 tools/aristotle_porphyry.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

The Platonists read Porphyry's Introduction first of all, before the Categories: the five words the Categories takes
for granted (genus, species, difference, property, accident). Owen prints it at the end of the second volume of his
Organon (Bohn's Classical Library, 1853), pp. 609-633. The source is the Internet Archive's scan of that volume
(organonorlogica04porpgoog, pinned by sha256 in sources/manifest.json); the OCR of leaves 264-288, with the place of
every word, is committed in sources/aristotle/ocr/ia-owen-organon-1853.json.gz, so the build needs no download.

Cleaned by rule, not proofread; every paragraph keeps its OCR as received beside the reading:
  - the running head (with the page number) and the printer's signature at the foot dropped;
  - Owen's side-notes (a summary of the argument, in small type cut into the outer margin: the right of a recto,
    the left of a verso) set apart from the text, as notes "in the margin" beside the paragraph they stand by;
  - his footnotes (smaller type at the foot, after a gap) set apart, each matched to the note mark in the text
    in order on the page where the scan read one, and otherwise to the page;
  - the chapter headings ("CHAP. II.--Of the Nature of Genus and Species") read as printed, numbered in order.
The Greek (Busse's edition, CAG IV.1, 1887) is on the Neoplatonists' shelf, from First1KGreek (tools/neoplatonists.py).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
from aristotle_ocr import _median, page_layout  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = "ia-owen-organon-1853"
OUT = ROOT / "texts" / "aristotle" / "porphyry" / "owen-1853.json"
LEAVES = range(264, 289)
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII"]
END = re.compile(r"[.?!:\"”’)]\s*\W?$")
# A note mark in the text, as the scan reads Owen's superior figures: after a stop, "!", "?", "*", "'" or a figure;
# after a letter, "!", "*" or a figure ("?" after a letter is a question).
TEXT_MARK = re.compile(r"(?<=[.,;:])([!?*'’>]{1,2}|\d)(?=\s|$)|(?<=[a-z])([!*]|\d)(?=[\s,.;:]|$)")
# "CHAP. II.--Of the Nature of Genus and Species", as the scan reads it: "Cuap.", "Cnap.", "Crap.", "παρ.", "(βαρ,".
HEADING = re.compile(r"^\W{0,3}(?:C\w{1,3}[pPrR]|[πΠβ(]*α[ρp]|[OΟ]HAP)[.,]?\s*([IVXLΙΠΧli1\]]{1,6})[.,]?\s*[—–-]{1,3}\s*(.*)$")


def words(ws):
    return " ".join(w[0] for w in ws).strip()


def junk(w):
    """A speck: no letter or figure, or one letter that is not a word."""
    t = w[0]
    return not re.search(r"[A-Za-z0-9Ά-ώἀ-ῼ]", t) or (len(t) <= 1 and t not in "aAI" and not t.isdigit())


def readable(s, vocab):
    """Most of a side-note's words are English words: the scan read it, and did not make a speck of it."""
    toks = [w.lower() for w in re.findall(r"[A-Za-z]{3,}", s)]
    return (len(toks) >= 3 or (toks and re.match(r"^\d{1,2}\.", s))) and sum(vocab.known(w) for w in toks) >= 0.75 * len(toks)


def printed_chapter(numeral, chapter):
    """The chapter's number as printed, when the scan's reading of the numeral is one of the next few; else the next."""
    s = numeral.translate(str.maketrans({"Ι": "I", "Χ": "X", "l": "I", "1": "I", "Π": "II", "L": "I", "]": "I", "i": "I"}))
    if s in ROMAN and chapter < ROMAN.index(s) <= chapter + 3:
        return ROMAN.index(s)
    return chapter + 1


def split_side(ws, recto, left):
    """(side-note words, text words) of a line. The side-notes are cut into the outer margin: on a recto they begin
    some 1600 pixels right of the text's left edge, after a gap; on a verso they end before the text, which then
    begins some 390 pixels in."""
    if recto:
        for i, w in enumerate(ws):
            if w[1] >= left + 1590 and (i == 0 or (w[1] - ws[i - 1][2] >= 38 and ws[i - 1][2] <= left + 1605)):
                return ws[i:], ws[:i]
        return [], ws
    for i in range(len(ws) - 1, 0, -1):
        before = [w for w in ws[:i] if not junk(w)]
        if before and before[-1][2] <= left + 400 and ws[i][1] >= left + 340 and ws[i][1] - before[-1][2] >= 38 \
                and (ws[i - 1] is before[-1] or ws[i][1] - ws[i - 1][2] >= 20):
            return ws[:i], ws[i:]
    return [], ws


def side_only(ws, recto, left):
    real = [w for w in ws if not junk(w)]
    if not real:
        return True
    return all(w[1] >= left + 1450 for w in real) if recto else all(w[2] <= left + 420 for w in real)


def clean(corrector):
    pages = aristotle_ocr.scan_pages(SRC)
    paras, notes, sides = [], [], []
    cur = None
    chapter = 0
    last_note = None
    pending_sides = []
    stats = {"leaves": 0, "paragraphs": 0, "notes": 0, "side_notes": 0, "side_notes_unread": 0, "notes_continued": 0, "marks_matched": 0, "chapters": 0}

    def close():
        nonlocal cur
        if cur and cur["lines"]:
            paras.append(cur)
        cur = None

    for lf in sorted(pages):
        stats["leaves"] += 1
        recto = lf % 2 == 0
        lines = sorted(pages[lf], key=lambda l: l[0])
        lines = [l for l in lines if l[0] >= 300]                       # the running head, with the page number
        while lines and sum(c.isalnum() for c in words(lines[-1][2])) <= 6:
            lines = lines[:-1]                                          # the signature, or a speck, at the foot
        left, right, _ = page_layout(lines)
        full = sorted(l[2][0][1] for l in lines if len(l[2]) >= 6)
        if full:
            left = full[len(full) // 4]
        # Each line: its side-note words and its text words. A cut is believed when a neighbour is also cut, or is
        # side-note alone: a full line of text can have a gap where the cut would be.
        rows = []
        for y0, y1, ws in lines:
            if side_only(ws, recto, left):
                rows.append({"y0": y0, "y1": y1, "side": [w for w in ws if not junk(w)], "text": [], "only": True})
            else:
                s, t = split_side(ws, recto, left)
                t = [w for w in t if not junk(w) or re.fullmatch(r"[;:,.!?()\[\]'’‘“”\"—-]+", w[0])]
                while len(t) > 1 and junk(t[0]) and t[1][1] - t[0][2] >= 40:
                    t = t[1:]                   # a speck before the line, read as a stop
                while len(t) > 1 and junk(t[-1]) and t[-1][1] - t[-2][2] >= 40:
                    t = t[:-1]
                n_alpha = sum(c.isalpha() for w in t for c in w[0])
                if n_alpha < 3 or (n_alpha < 8 and t[0][1] > left + 300 and not side_only(ws, recto, left) and len(t) <= 2
                                   and not re.match(r"^[A-Z]", t[0][0])):
                    t = []                      # specks in the gutter of a cut-in
                rows.append({"y0": y0, "y1": y1, "side": s, "text": t, "only": False})
        for i, r in enumerate(rows):
            if r["side"] and not r["only"]:
                near = [o for o in rows[max(0, i - 3): i + 4] if o is not r and abs(o["y0"] - r["y0"]) < 170]
                if not any(o["side"] for o in near):
                    r["text"] = sorted(r["side"] + r["text"], key=lambda w: w[1])
                    r["side"] = []
        # A short last line of a paragraph on a verso, at the left edge after a broken word, is text, not a side-note.
        prev_text = None
        for r in rows:
            if r["only"] and not recto and r["side"] and r["side"][0][1] <= left + 30 and r["y1"] - r["y0"] >= 58 and prev_text is not None \
                    and words(prev_text["text"]).endswith("-"):
                r["text"], r["side"], r["only"] = r["side"], [], False
            if r["text"]:
                prev_text = r
        body = [r for r in rows if r["text"]]
        cut_x = _median([r["text"][0][1] for r in body if r["side"] and not recto], left)
        cut_right = _median([r["text"][-1][2] for r in body if r["side"] and recto], left + 1590)
        # The foot: after a gap, lines closer together than the text's (about 64 pixels apart, against 79).
        foot_at = None
        for i in range(1, len(body)):
            gap = body[i]["y0"] - body[i - 1]["y0"]
            rest = [body[j + 1]["y0"] - body[j]["y0"] for j in range(i, len(body) - 1)]
            small = (sum(d <= 72 for d in rest) >= 0.7 * len(rest)) if rest else body[i]["y1"] - body[i]["y0"] < 72
            after_head = HEADING.match(words(body[i - 1]["text"])) or (i > 1 and HEADING.match(words(body[i - 2]["text"])))
            # A short foot, which the scan reads with its lines run together: an indented first line after a gap, near the end.
            short_foot = i >= len(body) - 4 and gap >= 100 and 40 <= body[i]["text"][0][1] - left <= 130
            if gap >= 95 and ((small and body[i]["y1"] - body[i]["y0"] < 75) or short_foot) \
                    and not HEADING.match(words(body[i]["text"])) and not after_head:
                foot_at = i
                break
        foot = body[foot_at:] if foot_at is not None else []
        foot_y = foot[0]["y0"] if foot else 10 ** 6
        # Below the text there are no side-notes: a short line of a footnote the scan set apart goes back to its note.
        foot = [dict(r, text=sorted(r["side"] + r["text"], key=lambda w: w[1]), side=[])
                for r in rows if r["y0"] >= foot_y and (r["text"] or r["side"])]
        page_marks = []
        side_buf = None
        prev, prev_cut = None, False
        in_head = False
        for r in rows:
            if r["y0"] >= foot_y:
                break
            if r["side"]:
                t = words([w for w in r["side"] if not junk(w)])
                if t:
                    new = side_buf is None or re.match(r"^\d{1,2}\.\s", t) or r["y0"] - side_buf["y"] > 220
                    if new:
                        side_buf = {"lines": [t], "leaf": lf, "y": r["y0"], "para": None, "k": 0}
                        sides.append(side_buf)
                        if cur is not None and cur["kind"] == "paragraph":
                            side_buf["para"], side_buf["k"] = cur, len(cur["lines"])
                        else:
                            pending_sides.append(side_buf)
                    else:
                        side_buf["lines"].append(t)
                        side_buf["y"] = r["y0"]
            if not r["text"]:
                continue
            ws = r["text"]
            t = words(ws)
            base = cut_x if (r["side"] and not recto) else left
            centred = ws[0][1] > left + 100
            if lf == LEAVES[0] and centred and re.fullmatch(r"THE", t):
                continue
            if lf == LEAVES[0] and centred and "PORPHYRY" in t.upper() and chapter == 0 and not paras:
                close()
                paras.append({"kind": "heading", "lines": ["The Introduction of Porphyry"], "raw": [t], "leaf": lf, "chapter": 0})
                prev = None
                continue
            m = HEADING.match(t)
            if m and len(t) < 110 and (ws[0][1] > base + 40 or r is rows[0] or prev is None or END.search(words(prev))):
                close()
                chapter = printed_chapter(m.group(1), chapter)
                title = re.sub(r"\s+", " ", m.group(2)).strip()
                title = re.sub(r"^Οὗ\s", "Of ", title)                # "Of", read as Greek
                title = re.sub(r"[\s'’«»?*!]+$", "", title)            # a note mark, or a speck, after the heading
                paras.append({"kind": "heading", "lines": [f"Chapter {ROMAN[chapter]}" + (f": {title}" if title else "")],
                              "raw": [t], "leaf": lf, "chapter": chapter})
                stats["chapters"] += 1
                prev = None
                in_head = True
                continue
            if in_head and ws[0][1] > left + 250 and len(t) < 40:
                paras[-1]["lines"][0] += " " + re.sub(r"[\s'’«»?*!]+$", "", t)     # the heading's second line
                paras[-1]["raw"].append(t)
                in_head = not END.search(t)
                continue
            in_head = False
            indent = 35 < ws[0][1] - base < 220
            short_prev = prev is not None and prev[-1][2] < (cut_right if prev_cut else right) - 120
            ended = prev is not None and END.search(words(prev))
            new = cur is None or (indent and (short_prev or ended)) or (short_prev and ended)
            if new:
                close()
                cur = {"kind": "paragraph", "lines": [], "raw": [], "leaf": lf, "chapter": chapter}
                for s in pending_sides:
                    s["para"], s["k"] = cur, 0
                pending_sides = []
            for mk in TEXT_MARK.finditer(t):
                page_marks.append((cur, len(cur["lines"]) + 1, len(t[:mk.start()])))
            cur["lines"].append(t)
            cur["raw"].append(t)
            prev, prev_cut = ws, bool(r["side"]) and recto
        # The footnotes: each opens indented; a first block not indented goes on with the last note of the page before.
        blocks = []
        for r in foot:
            ws = r["text"]
            ind = 40 < ws[0][1] - left < 170
            if ind or not blocks:
                blocks.append({"lines": [words(ws)], "indented": ind})
            else:
                blocks[-1]["lines"].append(words(ws))
        for bi, b in enumerate(blocks):
            if bi == 0 and not b["indented"] and last_note is not None:
                last_note["lines"].extend(b["lines"])
                stats["notes_continued"] += 1
                continue
            target = page_marks.pop(0) if page_marks else None
            stats["marks_matched"] += bool(target)
            last_note = {"lines": b["lines"], "leaf": lf, "target": target, "fallback": cur}
            notes.append(last_note)
    close()
    return paras, notes, sides, stats


def join(lines, corrector):
    text = ""
    for ln in lines:
        if text.endswith("-") and not text.endswith("--"):
            text = corrector.join_hyphen(text, ln)
        else:
            text = (text + " " + ln) if text else ln
    return text


def reading(lines, corrector):
    return corrector.text(re.sub(r"\s+", " ", TEXT_MARK.sub("", join(lines, corrector)))).strip()


def note_body(lines, corrector):
    raw = " ".join(lines)
    body = re.sub(r"^\W{0,3}\s?(\d{1,2}|[!'‘’?*|.,»]{1,3})\s+", "", raw, count=1)
    body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), body)
    return raw, corrector.text(re.sub(r"\s+", " ", body)).strip()


def to_text(paras, notes, sides, stats, corrector):
    tid = "owen1853.isagoge"
    segs, out_notes, index = [], [], {}
    k = 0
    for p in paras:
        if p["kind"] != "heading" and sum(c.isalpha() for c in " ".join(p["lines"])) < 8:
            continue
        k += 1
        text = p["lines"][0] if p["kind"] == "heading" else reading(p["lines"], corrector)
        seg = {"id": f"{tid}.p{k:05d}", "kind": p["kind"], "part": "isagoge", "page_1804": str(p["leaf"]), "paragraph": k,
               "book": None, "chapter": p["chapter"], "text": text, "raw": "\n".join(p["raw"]), "notes": []}
        if p["kind"] == "heading":
            seg["heading"] = text
        index[id(p)] = len(segs)
        segs.append(seg)

    def at_line(i, n_lines, col=None):
        """The place in the reading of a paragraph's first n lines (and col characters into the next)."""
        p = paras_by_seg[i]
        if n_lines <= 0:
            return 0
        before = reading(p["lines"][:n_lines - 1], corrector) if n_lines > 1 else ""
        if col is not None:
            part = reading([p["lines"][n_lines - 1][:col]], corrector)
            at = len(before) + (1 if before else 0) + len(part)
        else:
            at = len(reading(p["lines"][:n_lines], corrector))
        return min(at, len(segs[i]["text"]))

    paras_by_seg = {index[id(p)]: p for p in paras if id(p) in index}
    for n in notes:
        if n["target"]:
            para, line_no, col = n["target"]
        else:
            para, line_no, col = n["fallback"], None, None
        i = index.get(id(para), len(segs) - 1)
        raw, body = note_body(n["lines"], corrector)
        at = at_line(i, line_no, col) if line_no else len(segs[i]["text"])
        nid = f"{tid}.n{len(out_notes) + 1:04d}"
        out_notes.append({"id": nid, "type": "footnote", "printed_number": None, "signed": None, "text": body, "raw": raw,
                          "leaf": n["leaf"], "anchors": [{"in": segs[i]["id"], "at": at}],
                          "anchor": "the note mark in the text, in order on the page" if n["target"] else "the page it is printed on"})
        segs[i]["notes"].append({"note": nid, "at": at})
    for s in sides:
        if s["para"] is None or id(s["para"]) not in index:
            continue
        i = index[id(s["para"])]
        raw = " ".join(s["lines"])
        body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), raw)
        body = corrector.text(re.sub(r"\s+", " ", body)).strip()
        if sum(c.isalpha() for c in body) < 4 or not readable(body, corrector.v):
            stats["side_notes_unread"] += 1
            continue
        at = at_line(i, s["k"])
        nid = f"{tid}.n{len(out_notes) + 1:04d}"
        out_notes.append({"id": nid, "type": "sidenote", "printed_number": None, "signed": None, "text": body, "raw": raw,
                          "leaf": s["leaf"], "anchors": [{"in": segs[i]["id"], "at": at}],
                          "anchor": "the line of the text it is printed beside"})
        segs[i]["notes"].append({"note": nid, "at": at})
    for s in segs:
        s["notes"].sort(key=lambda x: x["at"])
    stats["paragraphs"] = sum(s["kind"] == "paragraph" for s in segs)
    stats["notes"] = sum(n["type"] == "footnote" for n in out_notes)
    stats["side_notes"] = sum(n["type"] == "sidenote" for n in out_notes)
    return {"schema": "platonic-workshop/text-v1", "id": tid,
            "title": "Porphyry's Introduction (Isagoge)", "author": "Porphyry", "translator": "Octavius Freire Owen",
            "edition": "The Organon, or Logical Treatises, of Aristotle, with the Introduction of Porphyry, literally translated, with notes, "
                       "by Octavius Freire Owen, vol. II (London: Henry G. Bohn, 1853), pp. 609-633",
            "source": {"manifest_id": SRC, "name": "the Internet Archive's scan",
                       "url": "https://archive.org/details/organonorlogica04porpgoog", "file": f"sources/aristotle/ocr/{SRC}.json.gz"},
            "page_label": "Scan images", "proof_status": "OCR cleaned by rule, not proofread",
            "reading_note": "Owen's footnotes are given below the paragraph they are marked in; his side-notes, a summary of the argument "
                            "printed in the margin, are given there too, marked \"margin\". Greek in his notes is read by the scan and often garbled.",
            "parts": [{"part": "isagoge", "label": "The Introduction of Porphyry", "leaves": [LEAVES[0], LEAVES[-1]]}],
            "stats": stats, "segments": segs, "notes": out_notes}


class Plain:
    """Taylor's corrector (tools/taylor_ocr.py) is made for the long s of 1801 and reads Owen's "crows" as "crews" and
    "(as" as "(es": here only its rule for a word broken at the end of a line is used, and its word list."""

    def __init__(self, corrector):
        self.v = corrector.v
        self.join_hyphen = corrector.join_hyphen

    @staticmethod
    def text(s):
        return s


def main():
    if "--extract" in sys.argv:
        aristotle_ocr.write_extract(SRC, LEAVES)
        return
    import taylor_ocr
    corrector = Plain(taylor_ocr.Corrector(aristotle_ocr.taylor_vocab()))
    paras, notes, sides, stats = clean(corrector)
    d = to_text(paras, notes, sides, stats, corrector)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    s = d["stats"]
    print(f"Porphyry's Introduction (Owen, 1853): {s['chapters']} chapters, {s['paragraphs']} paragraphs, {s['notes']} footnotes "
          f"({s['marks_matched']} by their mark), {s['side_notes']} side-notes ({s['side_notes_unread']} left out as unreadable) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
