#!/usr/bin/env python3
"""Aristotle milestone A4c: Octavius Freire Owen's Organon (London: Bohn, 1853), a second English beside the Oxford's.

    python3 tools/aristotle_owen.py            # clean the committed OCR into texts/aristotle/<work>/owen-1853.json
    python3 tools/aristotle_owen.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

Owen's two volumes in Bohn's Classical Library: vol. I (the Categories, On Interpretation, the Prior and Posterior
Analytics), the Internet Archive's scan of the Toronto copy (organonorlogicalt01aris); vol. II (the Topics, the Sophistical
Elenchi, Porphyry's Introduction), its scan of a Google copy (organonorlogica04porpgoog). Both are pinned by sha256 in
sources/manifest.json, and the OCR of the pages read is committed in sources/aristotle/ocr/.

Owen's page, read by rule (the same rules read Porphyry's Introduction, tools/aristotle_porphyry.py):
  - the running head and the printer's signature dropped;
  - his side-notes (a summary of the argument in small type, cut into the outer margin: the right of a recto, the left
    of a verso) set apart from the text, and kept as notes where the scan could read them;
  - his footnotes (smaller type at the foot, after a gap) set apart, each matched to the note mark in the text in order
    on the page where the scan read one, and otherwise to the page;
  - BOOK and CHAP. headings read as printed.
Owen prints no Bekker columns. Each treatise is placed at Bekker's columns by the Oxford translation of 1928 (cleaned by
tools/aristotle_organon.py, its columns read from its margin): the chapters are fixed points, and between two chapter
starts a column the Oxford begins at some fraction of the way begins at the same fraction of Owen's text (≈), as the
Greek's columns are carried over where the Greek does not print them.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
from aristotle_ocr import _median, page_layout  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "texts" / "aristotle"
V1, V2 = "ia-owen-organon-1853-v1", "ia-owen-organon-1853"
# Each volume: the leaves read, the scale of its scan (the distance between two lines of the text, against 79 pixels in
# the scan of vol. II, for which the rules were made), and whether a recto (the side-notes on the right) is an even leaf.
# The OCR of vol. I gives each word a box that runs on to the next word, so there is no gap between the side-note and the
# text to find: the cut is found where a word begins at the side-note's place on the page ("gapless").
VOLUMES = {V1: {"leaves": (13, 368), "scale": 0.85, "recto_even": False, "gapless": True},
           V2: {"leaves": (12, 288), "scale": 1.0, "recto_even": True, "gapless": False}}
# The treatises: (work id, volume, first leaf, last leaf, its title on the first leaf, the next one's on the last).
TREATISES = [
    ("ar006", V1, 13, 58, r"CATEG", r"INTERPRETATION"),
    ("ar017", V1, 58, 91, r"INTERPRETATION", None),
    ("ar001", V1, 92, 255, r"PRIOR\s+ANALYT", None),
    ("ar001p", V1, 256, 368, r"POSTERIOR\s+ANALYT", None),
    ("ar044", V2, 12, 194, r"TOPICS", None),
    ("ar040", V2, 195, 263, r"SOPHISTICAL", None),
]
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII",
         "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII", "XXXIII",
         "XXXIV", "XXXV", "XXXVI", "XXXVII", "XXXVIII", "XXXIX", "XL", "XLI", "XLII", "XLIII", "XLIV", "XLV", "XLVI", "XLVII"]
END = re.compile(r"[.?!:\"”’)]\s*\W?$")
# A note mark in the text, as the scan reads Owen's superior figures: after a stop, "!", "?", "*", "'" or a figure;
# after a letter, "!", "*" or a figure ("?" after a letter is a question).
TEXT_MARK = re.compile(r"(?<=[.,;:])([!?*'’>]{1,2}|\d)(?=\s|$)|(?<=[a-z])([!*]|\d)(?=[\s,.;:]|$)")
# "CHAP. II.--Of the Nature of Genus and Species", as the scan reads it: "Cuap.", "Cnap.", "Crap.", "παρ.", "(βαρ,".
HEADING = re.compile(r"^\W{0,3}(?:C\w{1,3}[pPrR]|[πΠβ(]*α[ρp]|[OΟ]HAP)[.,]?\s*([IVXLΙΠΧli1\]]{1,7}(?:\s?[IVXL]{1,3})?)[.,]?\s*(?:[—–-]{1,3}\s*|(?=O[fn]\s))(.*)$")
BOOK = re.compile(r"^\W{0,3}B[O0o]{2}[KX]\s+([IVXLl1]{1,5})\W{0,4}$")


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


def roman_value(numeral):
    s = numeral.replace(" ", "").translate(str.maketrans({"Ι": "I", "Χ": "X", "l": "I", "1": "I", "Π": "II", "L": "L", "]": "I", "i": "I"}))
    return ROMAN.index(s) if s in ROMAN else None


def chapter_number(numeral):
    """The chapter's number as the scan reads it, or None. (A final "L" is often the scan's "I.": XIIL for XIII, IL for II.)"""
    for cand in (numeral[:-1] + "I" if numeral.endswith("L") and len(numeral) > 1 else None, numeral):
        n = roman_value(cand) if cand else None
        if n:
            return n
    return None


class Page:
    """The rules for one scan, at its scale."""

    def __init__(self, scale, recto_even, gapless=False):
        self.s = scale
        self.recto_even = recto_even
        self.gapless = gapless

    def px(self, v):
        return v * self.s

    def recto(self, lf):
        return (lf % 2 == 0) == self.recto_even

    def find_cut(self, lines, recto, left):
        """Where the scan gives no gaps: the place of the cut on this page, where many lines have a word begin at the
        same place (within a few pixels) in the side-note's band; None when no cut is printed on the page."""
        px = self.px
        lo, hi = (left + px(1520), left + px(1720)) if recto else (left + px(330), left + px(460))
        xs = [w[1] for _, _, ws in lines for i, w in enumerate(ws) if lo <= w[1] <= hi and (i > 0 or recto)]
        best = max(((sum(abs(x - c) <= px(8) for x in xs), c) for c in xs), default=(0, None))
        return best[1] if best[0] >= 3 else None

    def split_side(self, ws, recto, left):
        """(side-note words, text words) of a line. On a recto the side-notes begin some 1600 pixels (at vol. II's scale)
        right of the text's left edge, after a gap; on a verso they end before the text, which then begins some 390 in."""
        px = self.px
        if self.gapless:
            at = self.cut
            if at is None:
                return [], ws
            for i, w in enumerate(ws):
                if (i == 0 and recto and w[1] >= at - px(10)) or (i > 0 and abs(w[1] - at) <= px(10)):
                    return (ws[i:], ws[:i]) if recto else (ws[:i], ws[i:])
            return [], ws
        if recto:
            for i, w in enumerate(ws):
                if w[1] >= left + px(1590) and (i == 0 or (w[1] - ws[i - 1][2] >= px(38) and ws[i - 1][2] <= left + px(1605))):
                    return ws[i:], ws[:i]
            return [], ws
        for i in range(len(ws) - 1, 0, -1):
            before = [w for w in ws[:i] if not junk(w)]
            if before and before[-1][2] <= left + px(400) and ws[i][1] >= left + px(340) and ws[i][1] - before[-1][2] >= px(38) \
                    and (ws[i - 1] is before[-1] or ws[i][1] - ws[i - 1][2] >= px(20)):
                return ws[:i], ws[i:]
        return [], ws

    def side_only(self, ws, recto, left):
        real = [w for w in ws if not junk(w)]
        if not real:
            return True
        return all(w[1] >= left + self.px(1450) for w in real) if recto else all(w[2] <= left + self.px(420) for w in real)


def read(pages, rules, leaves, start=None, stop=None, title=None, stats=None):
    """Owen's text over the leaves: (paragraphs and headings, footnotes, side-notes). On the first leaf the text begins
    after the line matching start (the treatise's title), and on the last it ends at the line matching stop.
    title: the heading given to the title line, when one is wanted."""
    px = rules.px
    paras, notes, sides = [], [], []
    cur = None
    book, chapter = 0, 0
    last_note = None
    pending_sides = []
    st = stats if stats is not None else {}
    for k in ("leaves", "notes_continued", "marks_matched", "chapters", "books"):
        st.setdefault(k, 0)
    begun = start is None

    def close():
        nonlocal cur
        if cur and cur["lines"]:
            paras.append(cur)
        cur = None

    for lf in leaves:
        if lf not in pages:
            continue
        st["leaves"] += 1
        recto = rules.recto(lf)
        lines = sorted(pages[lf], key=lambda l: l[0])
        lines = [l for l in lines if l[0] >= px(300)]                   # the running head, with the page number
        while lines and sum(c.isalnum() for c in words(lines[-1][2])) <= 6:
            lines = lines[:-1]                                          # the signature, or a speck, at the foot
        if not lines:
            continue
        left, right, _ = page_layout(lines)
        full = sorted(l[2][0][1] for l in lines if len(l[2]) >= 6)
        if full:
            left = full[len(full) // 4]
        # Each line: its side-note words and its text words. A cut is believed when a neighbour is also cut, or is
        # side-note alone: a full line of text can have a gap where the cut would be.
        rows = []
        rules.cut = rules.find_cut(lines, recto, left) if rules.gapless else None
        for y0, y1, ws in lines:
            if rules.side_only(ws, recto, left):
                rows.append({"y0": y0, "y1": y1, "side": [w for w in ws if not junk(w)], "text": [], "only": True})
            else:
                s, t = rules.split_side(ws, recto, left)
                t = [w for w in t if not junk(w) or re.fullmatch(r"[;:,.!?()\[\]'’‘“”\"—-]+", w[0])]
                while len(t) > 1 and junk(t[0]) and t[1][1] - t[0][2] >= px(40):
                    t = t[1:]                   # a speck before the line, read as a stop
                while len(t) > 1 and junk(t[-1]) and t[-1][1] - t[-2][2] >= px(40):
                    t = t[:-1]
                n_alpha = sum(c.isalpha() for w in t for c in w[0])
                if n_alpha < 3 or (n_alpha < 8 and t[0][1] > left + px(300) and len(t) <= 2 and not re.match(r"^[A-Z]", t[0][0])):
                    t = []                      # specks in the gutter of a cut-in
                rows.append({"y0": y0, "y1": y1, "side": s, "text": t, "only": False})
        for i, r in enumerate(rows):
            if r["side"] and not r["only"]:
                near = [o for o in rows[max(0, i - 3): i + 4] if o is not r and abs(o["y0"] - r["y0"]) < px(170)]
                # Where the scan gives no gaps, a word of a full line can begin just where a cut would be: believe a cut
                # only beside another cut line.
                if not any(o["side"] and (not rules.gapless or o["text"]) for o in near):
                    r["text"] = sorted(r["side"] + r["text"], key=lambda w: w[1])
                    r["side"] = []
        # A short last line of a paragraph on a verso, at the left edge after a broken word, is text, not a side-note.
        prev_text = None
        for r in rows:
            if r["only"] and not recto and r["side"] and r["side"][0][1] <= left + px(30) and r["y1"] - r["y0"] >= px(58) \
                    and prev_text is not None and words(prev_text["text"]).endswith("-"):
                r["text"], r["side"], r["only"] = r["side"], [], False
            if r["text"]:
                prev_text = r
        # The treatise's own lines: after its title on the first leaf, and before the next one's on the last.
        if not begun:
            at = next((i for i, r in enumerate(rows) if re.search(start, words(r["text"] or r["side"]).upper())), None)
            if at is None:
                continue
            begun = True
            if title:
                paras.append({"kind": "heading", "lines": [title], "raw": [words(rows[at]["text"] or rows[at]["side"])],
                              "leaf": lf, "book": 0, "chapter": 0})
            rows = rows[at + 1:]
        ended_here = None
        if stop and lf == leaves[-1]:
            at = next((i for i, r in enumerate(rows) if r["text"] and re.search(stop, words(r["text"]).upper())
                       and r["text"][0][1] > left + px(150)), None)
            if at is not None:
                ended_here = rows[at]["y0"]
                rows = rows[:at]
        body = [r for r in rows if r["text"]]
        cut_x = _median([r["text"][0][1] for r in body if r["side"] and not recto], left)
        cut_right = _median([r["text"][-1][2] for r in body if r["side"] and recto], left + px(1590))
        # The foot: after a gap, lines closer together than the text's (about 64 pixels apart, against 79).
        foot_at = None
        for i in range(1, len(body)):
            gap = body[i]["y0"] - body[i - 1]["y0"]
            rest = [body[j + 1]["y0"] - body[j]["y0"] for j in range(i, len(body) - 1)]
            small = (sum(d <= px(72) for d in rest) >= 0.7 * len(rest)) if rest else body[i]["y1"] - body[i]["y0"] < px(72)
            heads = [words(body[j]["text"]) for j in (i - 1, i - 2) if j >= 0]
            after_head = any(HEADING.match(h) or BOOK.match(h) for h in heads)
            # A short foot, which the scan reads with its lines run together: an indented first line after a gap, near the end.
            short_foot = i >= len(body) - 4 and gap >= px(100) and px(40) <= body[i]["text"][0][1] - left <= px(130)
            if gap >= px(95) and ((small and body[i]["y1"] - body[i]["y0"] < px(75)) or short_foot) \
                    and not HEADING.match(words(body[i]["text"])) and not after_head:
                foot_at = i
                break
        foot_y = body[foot_at]["y0"] if foot_at is not None else 10 ** 6
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
            t = words(r["text"])
            if r["side"]:
                s = words([w for w in r["side"] if not junk(w)])
                if s:
                    new = side_buf is None or re.match(r"^\d{1,2}\.\s", s) or r["y0"] - side_buf["y"] > px(220)
                    if new:
                        side_buf = {"lines": [s], "leaf": lf, "y": r["y0"], "para": None, "k": 0}
                        sides.append(side_buf)
                        if cur is not None and cur["kind"] == "paragraph":
                            side_buf["para"], side_buf["k"] = cur, len(cur["lines"])
                        else:
                            pending_sides.append(side_buf)
                    else:
                        side_buf["lines"].append(s)
                        side_buf["y"] = r["y0"]
            if not r["text"]:
                continue
            ws = r["text"]
            base = cut_x if (r["side"] and not recto) else left
            centred = ws[0][1] > left + px(100)
            b = BOOK.match(t)
            if b and centred:
                close()
                book = roman_value(b.group(1)) or book + 1
                if book <= (paras[-1]["book"] if paras else 0):
                    book = (paras[-1]["book"] if paras else 0) + 1
                chapter = 0
                st["books"] += 1
                prev, in_head = None, False
                continue
            m = HEADING.match(t)
            if m and len(t) < 110 and (ws[0][1] > base + px(40) or r is rows[0] or prev is None or END.search(words(prev))):
                close()
                n = chapter_number(m.group(1))
                if n and n <= 3 and chapter >= 3 and title is None:
                    book += 1                   # a chapter of a new book whose BOOK heading the scan missed
                    st["books"] += 1
                    chapter = n
                else:
                    chapter = n if n and chapter < n <= chapter + 8 else chapter + 1
                head = re.sub(r"\s+", " ", m.group(2)).strip()
                head = re.sub(r"^Οὗ\s", "Of ", head)                  # "Of", read as Greek
                head = re.sub(r"[\s'’«»?*!]+$", "", head)              # a note mark, or a speck, after the heading
                paras.append({"kind": "heading", "lines": [f"Chapter {ROMAN[chapter] if chapter < len(ROMAN) else chapter}" + (f": {head}" if head else "")],
                              "raw": [t], "leaf": lf, "book": book, "chapter": chapter})
                st["chapters"] += 1
                prev = None
                in_head = True
                continue
            if in_head and ws[0][1] > left + px(250) and len(t) < 40:
                paras[-1]["lines"][0] += " " + re.sub(r"[\s'’«»?*!]+$", "", t)     # the heading's second line
                paras[-1]["raw"].append(t)
                in_head = not END.search(t)
                continue
            in_head = False
            indent = px(35) < ws[0][1] - base < px(220)
            short_prev = prev is not None and prev[-1][2] < (cut_right if prev_cut else right) - px(120)
            ended = prev is not None and END.search(words(prev))
            new = cur is None or (indent and (short_prev or ended)) or (short_prev and ended)
            if new:
                close()
                cur = {"kind": "paragraph", "lines": [], "raw": [], "leaf": lf, "book": book, "chapter": chapter}
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
            ind = px(40) < ws[0][1] - left < px(170)
            if ind or not blocks:
                blocks.append({"lines": [words(ws)], "indented": ind})
            else:
                blocks[-1]["lines"].append(words(ws))
        for bi, b in enumerate(blocks):
            if bi == 0 and not b["indented"] and last_note is not None:
                last_note["lines"].extend(b["lines"])
                st["notes_continued"] += 1
                continue
            target = page_marks.pop(0) if page_marks else None
            st["marks_matched"] += bool(target)
            last_note = {"lines": b["lines"], "leaf": lf, "target": target, "fallback": cur}
            notes.append(last_note)
        if ended_here is not None:
            break
    close()
    return paras, notes, sides, st


# ------------------------------------------------------------------ the reading

class Plain:
    """Taylor's corrector (tools/taylor_ocr.py) is made for the long s of 1801 and reads Owen's "crows" as "crews" and
    "(as" as "(es": only its rule for a word broken at the end of a line is used here, and its word list."""

    def __init__(self, corrector):
        self.v = corrector.v
        self.join_hyphen = corrector.join_hyphen

    @staticmethod
    def text(s):
        return s


def plain_corrector():
    import taylor_ocr
    return Plain(taylor_ocr.Corrector(aristotle_ocr.taylor_vocab()))


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


def at_line(p, text, n_lines, corrector, col=None):
    """The place in the reading of a paragraph's first n lines (and col characters into the next)."""
    if not n_lines:
        return 0
    before = reading(p["lines"][:n_lines - 1], corrector) if n_lines > 1 else ""
    if col is not None:
        part = reading([p["lines"][n_lines - 1][:col]], corrector)
        at = len(before) + (1 if before else 0) + len(part)
    else:
        at = len(reading(p["lines"][:n_lines], corrector))
    return min(at, len(text))


def side_text(s, corrector):
    raw = " ".join(s["lines"])
    body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), raw)
    return raw, corrector.text(re.sub(r"\s+", " ", body)).strip()


# ------------------------------------------------------------------ a treatise, at Bekker's columns

def treatise(work_id, vol, first, last, start, stop, pages, corrector):
    rules = Page(VOLUMES[vol]["scale"], VOLUMES[vol]["recto_even"], VOLUMES[vol]["gapless"])
    stats = {}
    paras, notes, sides, stats = read(pages, rules, list(range(first, last + 1)), start=start, stop=stop, stats=stats)
    out, index = [], {}
    for p in paras:
        if p["kind"] == "heading":
            continue
        if sum(c.isalpha() for c in " ".join(p["lines"])) < 8:
            continue
        index[id(p)] = len(out)
        out.append({"text": reading(p["lines"], corrector), "raw": "\n".join(p["raw"]), "leaf": p["leaf"],
                    "book": p["book"] or 1, "chapter": p["chapter"], "marks": [], "_p": p})
    out_notes = []
    stats["notes"] = stats["side_notes"] = stats["side_notes_unread"] = 0
    for n in notes:
        para = n["target"][0] if n["target"] else n["fallback"]
        k = index.get(id(para))
        if k is None:
            continue
        raw, body = note_body(n["lines"], corrector)
        out_notes.append({"leaf": n["leaf"], "raw": raw, "text": body, "para": k})
        stats["notes"] += 1
    for s in sides:
        k = index.get(id(s["para"])) if s["para"] is not None else None
        if k is None:
            continue
        raw, body = side_text(s, corrector)
        if sum(c.isalpha() for c in body) < 4 or not readable(body, corrector.v):
            stats["side_notes_unread"] += 1
            continue
        out_notes.append({"leaf": s["leaf"], "raw": raw, "text": "In the margin: " + body, "para": k})
        stats["side_notes"] += 1
    for p in out:
        del p["_p"]
    return out, out_notes, stats


def carry_columns(work_id, owen):
    """Bekker's columns in Owen's text, carried over from the Oxford translation chapter by chapter (≈)."""
    import aristotle_f1k
    import aristotle_organon
    import aristotle_trans
    w = next(x for x in aristotle_f1k.WORKS if x["id"] == work_id)
    oxford = json.loads((TEXTS / w["slug"] / "oxford-1928.json").read_text(encoding="utf-8"))["paragraphs"]
    c0, c1 = aristotle_organon.TREATISES[work_id][4:6]
    order = aristotle_organon.columns(c0, c1)
    begun = {}
    for k, a, b, col, how in aristotle_trans.place(oxford, order):
        begun.setdefault(col, (k, a))
    marked = [dict(p, marks=[]) for p in oxford]
    for col, (k, a) in begun.items():
        marked[k]["marks"].append([a, col])
    for p in marked:
        p["marks"].sort()
    prev = (-1, -1)
    for k, off, col in aristotle_organon.greek_marks(owen, marked, order):
        if off >= len(owen[k]["text"].rstrip()) and k + 1 < len(owen):
            k, off = k + 1, 0           # at the very end of a paragraph: the column begins with the next
        if (k, off) <= prev:
            # Two columns carried to the same word (a short stretch of Owen's text): the later one begins at the next word.
            k, off = prev
            text = owen[k]["text"]
            nxt = text.find(" ", off + 1)
            if nxt < 0:
                if k + 1 >= len(owen):
                    continue
                k, off = k + 1, 0
            else:
                off = nxt + 1
        owen[k]["marks"].append([off, col, "computed"])
        prev = (k, off)
    return len({c for p in owen for _, c, _ in p["marks"]}), len(order)


def main():
    if "--extract" in sys.argv:
        for vol, v in VOLUMES.items():
            aristotle_ocr.write_extract(vol, range(v["leaves"][0], v["leaves"][1] + 1))
        return
    corrector = plain_corrector()
    pages = {vol: aristotle_ocr.scan_pages(vol) for vol in VOLUMES}
    import aristotle_f1k
    slug = {w["id"]: w["slug"] for w in aristotle_f1k.WORKS}
    for work_id, vol, first, last, start, stop in TREATISES:
        paras, notes, stats = treatise(work_id, vol, first, last, start, stop, pages[vol], corrector)
        placed, n_cols = carry_columns(work_id, paras)
        stats["columns_carried"] = placed
        d = {"source": vol, "translator": "Octavius Freire Owen", "proof_status": "OCR cleaned by rule", "stats": stats,
             "paragraphs": paras, "notes": notes}
        out = TEXTS / slug[work_id] / "owen-1853.json"
        out.write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
        print(f"{work_id}: {stats['books']} books, {stats['chapters']} chapters, {len(paras)} paragraphs, {stats['notes']} footnotes, "
              f"{stats['side_notes']} side-notes ({stats['side_notes_unread']} unread), {placed} of {n_cols} columns -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
