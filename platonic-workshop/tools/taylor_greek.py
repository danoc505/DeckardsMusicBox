#!/usr/bin/env python3
"""Milestone 26: the commentators' Greek beside Taylor's English.

Taylor translated three of the Neoplatonist texts whose Greek milestone 25 brought in:

  taylor-plotinus      Select Works of Plotinus (1817): fifteen treatises, each divided
                       into chapters numbered as the Greek editions number them (Ficino's
                       chapters, which Volkmann keeps).
  taylor-mysteries     Iamblichus on the Mysteries (1821): ten sections, each in chapters,
                       Gale's division, which Parthey keeps (book and chapter).
  taylor-elements      Proclus' Elements of Theology (1816, in the second volume of the
                       Theology of Plato): 211 propositions.

Each of Taylor's chapters (a proposition, for the Elements) is matched to the Greek of
milestone 25, so the Greek of any passage is one tap from the English. How (nothing guessed,
and every match says how it was made):

1. Plotinus. A treatise is named by Taylor's own heading; which treatise of the Enneads it is
   comes from the list of Plotinus' books in Taylor's Introduction (Porphyry's list, with the
   Ennead and book), quoted, and from the Greek heading of that treatise in Volkmann, quoted.
   Within a treatise Taylor numbers the chapters (I., II., ...); chapter n is the Greek
   chapter n. The numbers are read from the OCR in order: a number the OCR misread (X. for
   I.) is taken as the next one only when it stands where the next chapter begins; a number
   the OCR lost entirely leaves its chapter joined to the one before, and the passage is
   matched to both Greek chapters, and says so.
2. On the Mysteries. "SECTION n." and "CHAP. m." in Taylor are book n, chapter m of the Greek
   file. Where the file has no chapter of that number (First1KGreek's text skips some), the
   English is shown without Greek, and says so.
3. The Elements. Creuzer's Greek is the OCR of a scan, page by page, and most propositions
   are not numbered in it. A proposition's start is found where Creuzer prints its number and
   title (in the Greek, or in his Latin on the facing page, which has the same page number),
   and otherwise matched: every proposition is placed at a line of the Greek that begins a
   general statement (Πᾶν, Πᾶσα, Πάντα ...), in order, so that the length of each
   proposition's Greek is as near as can be to its length in Taylor's English (dynamic
   programming over all the placings). The matched ones are labelled machine-matched, with the
   first words of the Greek shown, so the reader can check them against Taylor's first sentence.

The check of every match: Taylor's footnotes quote the Greek he translates ("In the
original, ..."). Each quotation of three or more Greek words is looked for in the Greek
matched to its chapter, letters only (accents and breathings set aside); the report counts
those found there, found in another chapter, and not found (the OCR of the footnotes is often
too poor to find anything).

Taylor's English is his text as the Internet Archive's OCR gives it (Plotinus, Iamblichus) or
as Project Gutenberg transcribed it (the Elements): the page furniture (page numbers, running
heads, printers' signatures) is set aside, words broken at the end of a line are joined, and
the footnotes are kept apart from the text. Nothing else is changed.

Called by build_db.py after neoplatonists.build(). Standard library only.

    python3 tools/taylor_greek.py --check          # read Taylor's three texts and print what was matched
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import neoplatonists  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
REPORT = ROOT / "reports" / "taylor_greek.md"

PLOTINUS_TXT = SRC / "taylor-plotinus-1817" / "b29318178_djvu.txt"
MYSTERIES_TXT = SRC / "taylor-iamblichus-1821" / "b29338888_0002_djvu.txt"
ELEMENTS_TXT = SRC / "taylor-gutenberg" / "pg78800.txt"

WORKS = [
    {"id": "taylor-plotinus", "author": "Plotinus", "title": "Select Works of Plotinus", "greek_text": "plotinus-enneads", "source": "taylor-plotinus-1817",
     "edition": "Select Works of Plotinus, translated from the Greek by Thomas Taylor (London, 1817)", "year": 1817, "unit": "chapter",
     "text_how": "the Internet Archive's OCR of the 1817 edition, unproofread",
     "about": "Fifteen of Plotinus' treatises in Taylor's translation, with his notes. Each chapter has Volkmann's Greek one tap away."},
    {"id": "taylor-mysteries", "author": "Iamblichus", "title": "On the Mysteries", "greek_text": "iamblichus-mysteries", "source": "taylor-iamblichus-1821",
     "edition": "Iamblichus on the Mysteries of the Egyptians, Chaldeans, and Assyrians, translated from the Greek by Thomas Taylor (Chiswick, 1821)", "year": 1821,
     "unit": "chapter", "text_how": "the Internet Archive's OCR of the 1821 edition, unproofread",
     "about": "Iamblichus' answer, as the priest Abammon, to Porphyry's letter, in Taylor's translation. Each chapter has Parthey's Greek one tap away."},
    {"id": "taylor-elements", "author": "Proclus", "title": "Elements of Theology", "greek_text": "proclus-elements", "source": "taylor-gutenberg",
     "edition": "Proclus' Elements of Theology, in The Six Books of Proclus on the Theology of Plato, vol. II, translated by Thomas Taylor (London, 1816)", "year": 1816,
     "unit": "proposition", "text_how": "Project Gutenberg's transcription (ebook 78800)",
     "about": "Proclus' 211 propositions in Taylor's translation. Each has the Greek of Creuzer's edition (1822) one tap away: the OCR of the scan, "
              "where the proposition's start is found by its number, or matched by machine and labelled so."},
]

# Taylor's fifteen treatises of Plotinus: (the first words of his heading, the Ennead and book,
# his own words in the list of Plotinus' books in his Introduction, a note where the two differ).
# The Greek heading of each treatise is read from Volkmann's file and quoted beside it.
PLOTINUS_TREATISES = [
    ("ON THE VIRTUES", "1.2", "On the Virtues. Ϊ, 2.", None),
    ("ON DIALECTIC", "1.3", "On Dialectic. I. 3.", None),
    ("ON MATTER", "2.4", "On the two Matters [i. e. the Intelligible and the Sensible}. II. 4.", None),
    ("AGAINST THE GNOSTICS", "2.9", "Against the Gnostics. II. 9·", None),
    ("ON THE IMPASSIVITY OF", "3.6", "On the impassivity of Incorporeal Natures. 1 Ennead III. 6.", None),
    ("ETERNITY AND TIME", "3.7", "On Eternity and Time. III. 7»", None),
    ("IMMORTALITY OF THE SOUL", "4.7", "On the Immortality of the Soul. IV. 7®", None),
    ("THREE HYPOSTASES", "5.1", "On the three Hypostases that rank as the Principles of Things, V. 1.", None),
    ("INTELLECT, IDEAS", "5.9", "On Intellect, Ideas, and Being. V.", "the OCR of Taylor's list has lost the book's number; Volkmann's heading of V.9 is the same title"),
    ("ON THE ESSENCE OF SOUL", "4.2", "On the Essence of the Soul. IV. I,",
     "Taylor's list numbers it IV.1, as Ficino did; Volkmann numbers the two short treatises On the Essence of the Soul the other way round, and his IV.2 is the one Taylor translates (it begins, as Taylor does, with the soul's being neither body nor harmony nor entelechy)"),
    ("DISCUSSION OF DOUBTS", "4.3", "On the Soul, two Rooks. IV. 3. 4.", "Taylor translates the first of the two books, IV.3"),
    ("GENERATION AND ORDER OF THINGS", "5.2", "On the Generation and Order of Things posterior to the First. V.", "the OCR of Taylor's list has lost the book's number; Volkmann's heading of V.2 is the same title"),
    ("GNOSTIC HYPOSTASES", "5.3", "On Gnostic Hypostases, and that which is beyond thena. IV. 3.",
     "Taylor's list (or its OCR) prints IV.3; the treatise is V.3, Volkmann's ΠΕΡΙ ΤΩΝ ΓΝΩΡΙΣΤΙΚΩΝ ΥΠΟΣΤΑΣΕΩΝ, the same title"),
    ("NATURE WHICH IS BEYOND BEING", "5.6", "That the nature which is beyond being is not intellective , and what that is which is primarily , and also that which is secondarily intellective. Ennead v. 6.", None),
    ("ON THE GOOD", "6.9", "On the Good , or the One. VI. 9.", None),
]
PLOTINUS_END = "TREATISE  OF  SYNESIUS"
# Taylor's headings as he prints them, in his capitals made lower case (the OCR of the headings is quoted with each treatise).
TITLES = {'ON THE VIRTUES': 'On the Virtues', 'ON DIALECTIC': 'On Dialectic', 'ON MATTER': 'On Matter', 'AGAINST THE GNOSTICS': 'Against the Gnostics', 'ON THE IMPASSIVITY OF': 'On the Impassivity of Incorporeal Natures', 'ETERNITY AND TIME': 'On Eternity and Time', 'IMMORTALITY OF THE SOUL': 'On the Immortality of the Soul', 'THREE HYPOSTASES': 'On the Three Hypostases that rank as the Principles of Things', 'INTELLECT, IDEAS': 'On Intellect, Ideas, and [Real] Being', 'ON THE ESSENCE OF SOUL': 'On the Essence of Soul', 'DISCUSSION OF DOUBTS': 'A Discussion of Doubts relative to the Soul', 'GENERATION AND ORDER OF THINGS': 'On the Generation and Order of Things after the First', 'GNOSTIC HYPOSTASES': 'On Gnostic Hypostases, and that which is beyond them', 'NATURE WHICH IS BEYOND BEING': 'That the Nature which is beyond Being is not Intellective', 'ON THE GOOD': 'On the Good, or the One'}


# ---------------------------------------------------------------- reading Taylor's OCR

ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def roman(s):
    """The value of a Roman numeral, or None."""
    s = s.upper()
    if not s or any(c not in ROMAN for c in s):
        return None
    t = 0
    for i, c in enumerate(s):
        v = ROMAN[c]
        t += -v if i + 1 < len(s) and ROMAN[s[i + 1]] > v else v
    return t


def to_roman(n):
    out = ""
    for v, s in [(100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]:
        while n >= v:
            out += s
            n -= v
    return out


# The OCR's misreadings of the letters of a chapter number: Greek capitals for Latin ones, l and 1 and i for I, L for I at the end (IIL for III).
_ROMAN_OCR = str.maketrans({"Χ": "X", "Ι": "I", "Ϊ": "I", "l": "I", "1": "I", "i": "I", "|": "I", "!": "I", "T": "I", "Τ": "I"})


def ocr_roman(tok):
    """A chapter number as the OCR prints it: its value, read leniently (IIL for III, XL for XI, XXYI for XXVI, H for II, 111 for III).
    No chapter of these books runs to forty, so a final L is the OCR's I."""
    t = tok.strip().replace(" ", "")
    if t in ("H", "IT", "Il", "IL", "11"):
        return 2
    t = t.translate(_ROMAN_OCR).replace("Y", "V")
    if t.endswith("L") and len(t) > 1:
        t = t[:-1] + "I"
    return roman(t)


def blocks(path, start, end, split_at=None):
    """The OCR's blocks (runs of lines between blank lines) from line `start` to `end` (counted from 1), as lists of lines.
    A line matching `split_at` (a chapter's number) always begins a block."""
    lines = path.read_text(encoding="utf-8").split("\n")[start - 1:end - 1]
    out, cur, first = [], [], None
    for i, ln in enumerate(lines, start):
        if cur and split_at is not None and split_at.match(ln):
            out.append((first, cur))
            cur = []
        if ln.strip():
            if not cur:
                first = i
            cur.append(ln.rstrip())
        elif cur:
            out.append((first, cur))
            cur = []
    if cur:
        out.append((first, cur))
    return out


_GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")
_LATIN = re.compile(r"[A-Za-z]")


def is_greek_block(lines):
    t = "".join(lines)
    g, l = len(_GREEK.findall(t)), len(_LATIN.findall(t))
    return g > 12 and g > l


def furniture(lines):
    """Page furniture: a page number, a running head, a printer's signature (one or two short lines). Returns ('page', n) | ('head', text) | None."""
    if len(lines) > 2:
        return None
    t = " ".join(x.strip() for x in lines)
    words = t.split()
    if not words or len(words) > 6:
        return None
    if re.fullmatch(r"[\W_]*(\d{1,3})[\W_]*", t):
        return ("page", int(re.sub(r"\D", "", t)))
    letters = sum(c.isalpha() for c in t)
    if re.match(r"[a-z]{2,}", t) and re.search(r"[a-z]{2,}", words[-1]):
        return None                          # 'in one.': the end of a sentence carried to a line of its own
    if len(words) <= 3 and letters <= 12 and not re.search(r"[a-z]{4,}", t):
        return ("head", t)                   # 'Plot,'  'A'  'c2'  '£ C'  'XXIV'
    if t.upper() == t and letters >= 4:
        return ("head", t)                   # a running head in capitals: 'INTRODUCTION.'
    return None


_NOTE_START = re.compile(r"^\s*(?:[“\"‘'.,]?\s*[*†‡§¶]|\d{1,2}(?!\s*[.,]\s)|[1Il]\s(?=[A-Z]))\s*\S")


def join_lines(lines):
    """Lines of the OCR as one paragraph: a word broken at the end of a line (¬ or -) joined."""
    out = ""
    for ln in lines:
        ln = re.sub(r"\s+", " ", ln.strip())
        if not ln:
            continue
        if out.endswith("¬") or (out.endswith("-") and not out.endswith(" -") and re.search(r"[a-z]-$", out) and ln[:1].islower()):
            out = out[:-1] + ln
        else:
            out = (out + " " + ln) if out else ln
    return out.replace("¬", "")


def read_flow(path, start, end, split_at=None):
    """Taylor's text from line `start` to `end` as paragraphs and footnotes, the furniture set aside.

    Returns a list of items: {"kind": "para"|"note", "text", "line", "page"}. A block after page furniture
    continues the paragraph before it when that paragraph did not end a sentence, or the block begins in
    lower case. A footnote runs on until the next page's furniture."""
    items = []
    page = None
    in_note = False
    after_furniture = False
    for first, lines in blocks(path, start, end, split_at):
        f = furniture(lines)
        if f:
            if f[0] == "page":
                page = f[1]
            in_note = False
            after_furniture = True
            continue
        text = join_lines(lines)
        if not text:
            continue
        nonspace = re.sub(r"\s", "", text)
        if sum(c.isalpha() for c in text) < max(8, len(nonspace) // 2):
            continue                                    # specks of the scan the OCR read as marks ('.... , . i t * r')
        starts_note = bool(_NOTE_START.match(lines[0])) or is_greek_block(lines)
        if split_at is not None and split_at.match(lines[0]):
            starts_note = in_note = False                  # a chapter's number begins the text again
        if starts_note or in_note:
            if in_note and items and items[-1]["kind"] == "note" and not starts_note:
                items[-1]["text"] += " " + text
            elif in_note and items and items[-1]["kind"] == "note" and is_greek_block(lines):
                items[-1]["text"] += " " + text
            else:
                items.append({"kind": "note", "text": text, "line": first, "page": page})
            in_note = True
            after_furniture = False
            continue
        last = next((it for it in reversed(items) if it["kind"] == "para"), None)
        cont = last is not None and after_furniture and not (split_at is not None and split_at.match(lines[0])) and (not re.search(r"[.?!:\"”’;)\]]\s*$", last["text"]) or text[:1].islower())
        if cont:
            if last["text"].endswith("-") and text[:1].islower():
                last["text"] = last["text"][:-1] + text
            else:
                last["text"] += " " + text
        else:
            items.append({"kind": "para", "text": text, "line": first, "page": page})
        after_furniture = False
    return items


# ---------------------------------------------------------------- chapters

# A chapter's number at the head of a line: Taylor's 'XII.', or as the OCR prints it ('XI L', 'XXYI.', 'XIV*', 'IL  Hence').
# group 1: the numeral; group 2: the stop after it (empty when the OCR lost it).
_CHAP_NUM = re.compile(r"^\s*((?=[^\s]*[IVXΙΧ])[IVXLYlTHiΙΧΪ1|!]{1,7}(?: [IVXL]{1,2}(?=[\s.,;:*]))?)\s*([.,;:*]?)\s+(?=[\"“‘'A-Z\[(])")


def split_chapters(items, expect_first=1, greek_ns=None):
    """Taylor's paragraphs in chapters, by the numbers he prints at the head of each chapter (I., II., ...).

    The numbers are read in order. A paragraph that begins with a numeral is a chapter's start when the
    numeral is the next number, or (misread by the OCR) when it is no more than a chapter ahead of it and
    is a numeral the OCR is known to confuse. A number skipped (the OCR lost it) joins its chapter to the one
    before; the chapter then carries both numbers. Returns [{"nums": [n, ...], "how", "paras", "notes", "page"}]."""
    chapters = []
    expected = expect_first
    for it in items:
        if it["kind"] == "note":
            if chapters:
                chapters[-1]["notes"].append(it["text"])
            continue
        m = _CHAP_NUM.match(it["text"])
        if m and m.group(1) in ("I", "l", "1", "i") and not m.group(2):
            m = None                                               # 'I have followed ...': the pronoun, not a number
        v = ocr_roman(m.group(1)) if m else None
        how = None
        if m and v == expected:
            how = "read" if m.group(2) else "misread"
        elif m and expected == 1 and m.group(1) in ("X", "Χ"):
            how, v = "misread", 1                                  # the OCR's X. for I. at a treatise's head
        elif m and v is not None and expected < v <= expected + 2 and chapters and m.group(2):
            how = "read"                                           # numbers between were lost: the chapter before carries them
            chapters[-1]["nums"] += list(range(expected, v))
            chapters[-1]["lost"] = list(range(expected, v))
        elif m and m.group(2) and chapters and v not in range(1, expected):
            how, v = "misread", expected                           # a numeral the OCR garbled ('VXIL.'), where the next chapter begins
        if how:
            text = it["text"][m.end():].strip()
            chapters.append({"nums": [v], "how": how, "printed": m.group(1), "paras": [text], "notes": [], "page": it["page"], "line": it["line"]})
            expected = v + 1
        elif chapters:
            chapters[-1]["paras"].append(it["text"])
        elif expected == expect_first:
            # text before any number: the first chapter, its number not printed (or not read)
            m1 = re.match(r"^\s*([1lI])\.\s+", it["text"])
            chapters.append({"nums": [expected], "how": "misread" if m1 else "unnumbered", "printed": m1.group(1) if m1 else "",
                             "paras": [it["text"][m1.end():] if m1 else it["text"]], "notes": [], "page": it["page"], "line": it["line"]})
            expected += 1
    return chapters


def plotinus_treatises():
    """Taylor's fifteen treatises: their line ranges in the OCR, found by their headings in order."""
    lines = PLOTINUS_TXT.read_text(encoding="utf-8").split("\n")
    norm = [re.sub(r"\s+", " ", ln.strip().upper().replace("Ο Ν", "ON").replace("OX", "ON").replace("OK", "ON")) for ln in lines]
    starts = []
    pos = next(i for i, ln in enumerate(norm) if ln.startswith("ON THE VIRTUES") and i > 2000)
    for head, enn, listed, note in PLOTINUS_TREATISES:
        key = re.sub(r"\s+", " ", head)
        i = next(j for j in range(pos, len(norm)) if key in norm[j])
        starts.append(i)
        pos = i + 1
    end = next(j for j in range(pos, len(lines)) if PLOTINUS_END in lines[j])
    # A heading may run over several lines before the text: the treatise's text starts after the last capital line.
    out = []
    for k, (head, enn, listed, note) in enumerate(PLOTINUS_TREATISES):
        a = starts[k]
        b = starts[k + 1] if k + 1 < len(starts) else end
        # back up to the first line of a heading that begins on an earlier line ('ON THE' / 'IMMORTALITY OF THE SOUL')
        while a > 0 and norm[a - 1] and (norm[a - 1] in ("ON THE", "ON", "A", "THAT THE", "AND") or norm[a - 2:a - 1] == [""] and norm[a - 1] in ("ON THE", "ON")):
            a -= 1
        if k + 1 < len(starts):
            while b > a and norm[b - 1] in ("ON THE", "ON", "A", "THAT THE", "", "AND"):
                b -= 1
        heading_lines = []
        j = a
        while j < b and not _CHAP_NUM.match(lines[j]):
            ln = lines[j].strip()
            if ln and re.search(r"[a-z]{3,}", ln) and len(ln.split()) > 4:
                break                                   # the text has begun, its first chapter unnumbered
            if ln:
                heading_lines.append(ln)
            j += 1
        out.append({"head": head, "enn": enn, "listed": listed, "note": note, "start": j + 1, "end": b + 1,
                    "heading": " ".join(re.sub(r"\s+", " ", h) for h in heading_lines if not re.fullmatch(r"\d{1,3}", h))})
    return out


def taylor_plotinus():
    """[(treatise, chapters)] for Taylor's Plotinus."""
    out = []
    for t in plotinus_treatises():
        items = read_flow(PLOTINUS_TXT, t["start"], t["end"], _CHAP_NUM)
        out.append((t, split_chapters(items)))
    return out


def taylor_mysteries():
    """[(section n, chapters)] for Taylor's Iamblichus, by his SECTION and CHAP. headings."""
    lines = MYSTERIES_TXT.read_text(encoding="utf-8").split("\n")
    first = next(i for i, ln in enumerate(lines) if ln.strip() == "SECTION I.")
    end = len(lines)
    for i in range(first, len(lines)):
        if re.match(r"^\s*(ADDITIONAL NOTES|INDEX)\b", lines[i]):
            end = i
            break
    heads = []          # (line index, 'section'|'chap', value)
    expected_sec, expected_chap = 1, 1
    for i in range(first, end):
        ln = lines[i].strip()
        m = re.match(r"^SECTION\s+([IVXLΙΧ1l]+)\s*[.,]", ln)
        if m and ocr_roman(m.group(1)) == expected_sec:
            heads.append((i, "section", expected_sec))
            expected_sec += 1
            expected_chap = 1
            continue
        m = re.match(r"^(?:\S{1,2}\s+)?\W{0,3}CHA[PD]\s*[.,]?\s*([^\s.;,|]+)", ln)
        if m:
            v = ocr_roman(m.group(1))
            if v is None or not expected_chap <= v <= expected_chap + 1:
                v = expected_chap               # 'CHAP. 1.' where II is printed, 'CHAP. TV;': the chapters follow in order
            heads.append((i, "chap", v))
            expected_chap = v + 1
    out = []
    for k, (i, kind, v) in enumerate(heads):
        if kind == "section":
            out.append((v, []))
            continue
        j = heads[k + 1][0] if k + 1 < len(heads) else end
        items = read_flow(MYSTERIES_TXT, i + 2, j + 1)
        paras = [it["text"] for it in items if it["kind"] == "para"]
        notes = [it["text"] for it in items if it["kind"] == "note"]
        page = next((it["page"] for it in items if it["page"]), None)
        if not out:
            out.append((1, []))
        out[-1][1].append({"nums": [v], "how": "read", "printed": lines[i].strip(), "paras": paras, "notes": notes, "page": page, "line": i + 1})
    return out


# ---------------------------------------------------------------- the Elements

def taylor_elements():
    """Taylor's 211 propositions from Project Gutenberg's text: [{"nums": [n], "paras", "notes", "enunciation"}]."""
    text = ELEMENTS_TXT.read_text(encoding="utf-8")
    a = text.index("                         ELEMENTS OF THEOLOGY.")
    body = text[a:]
    parts = re.split(r"\n\s+PROPOSITION ([CLXVI]+)\.\s*\n", body)
    out = []
    for k in range(1, len(parts), 2):
        n = roman(parts[k])
        chunk = parts[k + 1]
        if k + 2 >= len(parts):
            # the last proposition ends where the next piece of the book begins (a heading in capitals)
            m = re.search(r"\n\s{10,}[A-Z][A-Z ’'.,]{8,}\n", chunk)
            if m:
                chunk = chunk[:m.start()]
        paras, notes = [], []
        for p in re.split(r"\n\s*\n", chunk):
            p = re.sub(r"\s+", " ", p).strip()
            if not p or re.fullmatch(r"[*\s]+", p):
                continue
            if re.match(r"^\[(?:Footnote|\d+)", p) or re.match(r"^\d+\s*\]", p):
                notes.append(p)
            else:
                paras.append(p)
        out.append({"nums": [n], "how": "read", "printed": f"PROPOSITION {parts[k]}.", "paras": paras, "notes": notes, "page": None})
    return out


_ENUNC = re.compile(r"^\W{0,4}(?:Π[ᾶάὰa][νσ]|Πά?ντ|Il[üàáaã][νv]|Il[üàáa]s|Ilá?vr|Ilavr|ΠΤ[ᾶά]|Ἅπα|Ἀπα|Hà[νv]|IIà[νv]|IIá[νv]|Πὰ[νσ]|Πὰντ|Π[ᾶάὰ]ς)")
_NOT_ENUNC = re.compile(r"^\W{0,4}\S+\s+(?:γὰρ|γάρ|ἄρα|οὖν|δὲ|δή|ydg|yag|yao|ovv)\b")
_GREEK_HEAD = re.compile(r"^\W{0,3}([α-ωϛϟϡϑ]{1,3})\s*[΄'’ʹ`]\s*\.?\s*(?:Π|ll|Il)")
_LATIN_HEAD = re.compile(r"^\W{0,2}([IVXLCJl]{1,9})\s*[.,]\s+(?:De|Quod)\b")
_NOTE_LINE = re.compile(r"^.{0,4}[(Q{]\s*[\dlI]{1,2}\s*[)}]")


def is_note_line(ln):
    """The first line of Creuzer's notes at the foot of a page: '(1) A. μετέχον.', or a line mostly in Latin letters."""
    if _NOTE_LINE.match(ln):
        return True
    g, l = len(_GREEK.findall(ln)), len(_LATIN.findall(ln))
    return l >= 12 and l > 2 * g


def greek_numeral(s):
    vals = {"α": 1, "β": 2, "γ": 3, "δ": 4, "ε": 5, "ϛ": 6, "ς": 6, "ζ": 7, "η": 8, "θ": 9, "ϑ": 9, "ι": 10, "κ": 20, "λ": 30, "μ": 40, "ν": 50,
            "ξ": 60, "ο": 70, "π": 80, "ϟ": 90, "ρ": 100, "σ": 200}
    if not s or any(c not in vals for c in s):
        return None
    return sum(vals[c] for c in s)


_TITLE = re.compile(r"^\W{0,6}\S{0,6}\W{0,3}\s*(?:Π[εὲέ]ρ|ll[εs]g|Ilsg|Ilep|Il[εe]ρ|Περ)")
_CAPITAL = re.compile(r"^\W{0,4}(?:[Α-ΩἈ-ἏἘ-ἝἨ-ἯἸ-ἿὈ-ὍὙ-ὟὨ-Ὧᾈ-ᾏᾘ-ᾟᾨ-ᾯᾸ-ᾼῈ-ῌῘ-ῚῨ-ῬῸ-ῼ]|Il|Ei|Ti|Tó|Tà|Tw|Oi|Ov|At|An|Ka)")


def elements_lines(units):
    """The Greek lines of Creuzer's Elements, page by page, the footnotes (from the first '(1)' line down) set aside.

    Returns [(unit seq, line index, line)] and the anchors {proposition: (index into the lines, how, the words found)}:
    the line after a title Creuzer numbers, in the Greek ('ϑ΄. Περὶ αὐτάρκους'), or in his Latin ('IX. De eo, quod ...'),
    which faces the Greek: the Latin page is numbered one more than the Greek page it translates (VI and VII are on the
    Latin p. 11 and the Greek p. 10, IX on p. 17 and p. 16)."""
    out = []
    lat_by_page = {}
    for u in units:
        if u["lang"] == "lat":
            for ln in u["text"].split("\n"):
                m = _LATIN_HEAD.match(ln)
                if m and u["page"] is not None:
                    v = roman(m.group(1).replace("J", "I").replace("l", "I"))
                    if v:
                        lat_by_page.setdefault(u["page"] - 1, []).append((v, ln.strip()))
            continue
        lines = u["text"].split("\n")
        for i, ln in enumerate(lines):
            if i > 4 and is_note_line(ln):
                break
            out.append((u["seq"], i, ln))
    titles = {}            # Greek page -> [index of a title line]
    for k, (s, i, ln) in enumerate(out):
        if _TITLE.match(ln) and len(ln) < 70:
            titles.setdefault(s, []).append(k)
    page_seq = {u["page"]: u["seq"] for u in units if u["lang"] != "lat" and u["page"] is not None}

    def start_after(k):
        """The proposition's first line: the first line after its title that begins with a capital (a title may run onto a second line)."""
        for j in range(k + 1, min(k + 4, len(out))):
            if _CAPITAL.match(out[j][2]):
                return j
        return min(k + 1, len(out) - 1)

    anchors = {}
    for s, ks in titles.items():
        for k in ks:
            m = _GREEK_HEAD.match(out[k][2])
            v = greek_numeral(m.group(1)) if m else None
            if v and 1 <= v <= 211:
                anchors.setdefault(v, (start_after(k), "Creuzer's number and title, in the Greek", out[k][2].strip()))
    for page, heads in lat_by_page.items():
        s = page_seq.get(page)
        ks = titles.get(s, [])
        if len(ks) != len(heads):
            continue                     # the titles on the Greek page and the headings on the Latin do not pair one to one
        for (v, lat), k in zip(heads, ks):
            if v not in anchors:
                anchors[v] = (start_after(k), f"Creuzer's number and title, in his Latin on the facing page (\"{lat}\")", out[k][2].strip())
    # keep only anchors that stand in order (a misread number would break it)
    vs = sorted(anchors)
    keep = []
    for v in vs:
        while keep and anchors[keep[-1]][0] >= anchors[v][0]:
            keep.pop() if len(keep) > 1 and anchors[keep[-2]][0] < anchors[v][0] else None
            break
        if not keep or anchors[keep[-1]][0] < anchors[v][0]:
            keep.append(v)
    return out, {v: anchors[v] for v in keep}


# Taylor's fixed words for Proclus' terms, and the Greek they render (the first letters of the Greek word, letters only):
# used to compare a proposition's statement in Taylor with the first lines of a place in the Greek.
TERMS = {
    "multitude": ["πληθ"], "one": ["εν ", "ενο", "ενι", "ενα"], "unity": ["εναδ", "ενωσ"], "unities": ["εναδ"], "union": ["ενωσ"], "united": ["ηνωμ"],
    "divine": ["θει"], "god": ["θεο", "θεω"], "gods": ["θεο", "θεω", "θεοι"], "cause": ["αιτι"], "causes": ["αιτι"], "soul": ["ψυχ"], "souls": ["ψυχ"],
    "intellect": ["νου", "νω", "νοε"], "intellectual": ["νοερ"], "intelligible": ["νοητ"], "being": ["οντ", "ον "], "beings": ["οντ"], "essence": ["ουσι"],
    "power": ["δυναμ"], "powers": ["δυναμ"], "order": ["ταξ"], "orders": ["ταξ"], "participated": ["μετεχομ", "μεθεκτ"], "participates": ["μετεχ"],
    "participate": ["μετεχ"], "participants": ["μετεχοντ"], "participation": ["μεθεξ"], "imparticipable": ["αμεθεκτ"], "participable": ["μεθεκτ"],
    "time": ["χρον"], "eternal": ["αιων"], "eternity": ["αιων"], "energy": ["ενεργ"], "energizes": ["ενεργ"], "partial": ["μερικ"], "whole": ["ολο", "ολη", "ολω"],
    "number": ["αριθμ"], "converted": ["επιστρ"], "conversion": ["επιστρ"], "convertive": ["επιστρ"], "proceeds": ["προει", "προοδ"], "progression": ["προοδ"],
    "body": ["σωμ"], "bodies": ["σωμ"], "incorporeal": ["ασωματ"], "life": ["ζω"], "good": ["αγαθ"], "infinite": ["απειρ"], "infinity": ["απειρ"],
    "perfect": ["τελει"], "bound": ["περα"], "motion": ["κινη", "κινου"], "moves": ["κινε", "κινου"], "immoveable": ["ακινητ"], "generation": ["γενεσ"],
    "form": ["ειδ"], "self": ["αυτ"], "itself": ["εαυτ"], "producing": ["παραγ"], "produced": ["παραγ"], "produces": ["παραγ"], "monad": ["μοναδ"],
    "sufficient": ["αυταρκ"], "providence": ["προνο"], "fate": ["ειμαρ"], "providential": ["προνο"], "father": ["πατρ"], "paternal": ["πατρικ"],
    "demiurgic": ["δημιουργ"], "vehicle": ["οχημ"], "perpetual": ["αιδι", "αει"], "always": ["αει"], "similitude": ["ομοιοτ"], "similar": ["ομοι"],
    "impartible": ["αμεριστ"], "parts": ["μερ"], "first": ["πρωτ"], "primarily": ["πρωτ"], "principle": ["αρχ"], "measure": ["μετρ"], "measured": ["μετρ"],
    "knowledge": ["γνωσ"], "knows": ["γινωσκ", "γιγνωσκ"], "subsistence": ["υποστ", "υπαρξ"], "hyparxis": ["υπαρξ"], "unparticipated": ["αμεθεκτ"],
    "superessential": ["υπερουσι"], "illuminations": ["ελλαμψ"], "illumination": ["ελλαμψ"], "secondary": ["δευτερ"], "secondarily": ["δευτερ"],
    "nature": ["φυσ"], "natures": ["φυσ"], "dissoluble": ["λυτ"], "indissoluble": ["αλυτ"], "corruptible": ["φθαρτ"], "incorruptible": ["αφθαρτ"],
    "unbegotten": ["αγενητ"], "generated": ["γενητ"], "medium": ["μεσ"], "middle": ["μεσ"], "same": ["αυτ", "ταυτ"], "different": ["ετερ"], "other": ["αλλ", "ετερ"],
}
_ENG_WORD = re.compile(r"[a-z]+")


def statement_terms(text):
    """The terms of Taylor's statement of a proposition, each with the Greek stems it renders: {english: (stem, ...)}."""
    out = {}
    for w in _ENG_WORD.findall(text.lower()):
        if w in TERMS:
            out[w] = tuple(TERMS[w])
    return out


def terms_found(terms, greek):
    """Which of the terms have one of their stems beginning a word of the Greek (letters only)."""
    hay = " " + " ".join(letters(greek).split()) + " "
    return {w for w, stems in terms.items() if any((" " + st) in hay for st in stems)}


_PAS = re.compile(r"^(?:πασ|παν|παντ|απασ|απαν)")


def _starts_general(ln):
    """A line beginning a general statement: a form of πᾶς among its first three words (after any specks), not 'Πᾶν γὰρ', 'Πᾶν ἄρα'."""
    if _ENUNC.match(ln) and not _NOT_ENUNC.match(ln):
        return True
    raw = ln.split()[:4]
    for k, r in enumerate(raw):
        w = letters(r).strip()
        if not w:
            continue
        if _PAS.match(w) and re.match(r"^\W*(?:Π|Ἅ|Ἀ|Il|II|Tl|ΤΙ|TI|Ii)", r):          # a capital: the statement, not the proof's 'πᾶν ἄρα'
            nxt = letters(raw[k + 1]).strip() if k + 1 < len(raw) else ""
            return nxt not in ("γαρ", "αρα", "ουν", "δε")
        if len(w) > 3:
            return False
    return False


def _dp_place(props, lines, anchors):
    """Each proposition's start in Creuzer's Greek: [(unit seq, line index, how, the first words)], in order.

    Anchors (Creuzer's printed number) fix some starts. Every other proposition starts at a line that begins a
    sentence (its first word a capital, the line before ending a sentence), chosen with all the others at once
    (dynamic programming) so that the Greek of each proposition is as near as can be to the length of Taylor's
    English times the ratio of the whole Greek to the whole English; a start that is a general statement
    (Πᾶν, Πᾶσα, Πάντα ...), as almost every proposition is, is preferred."""
    words_before = []
    total = 0
    for s, i, ln in lines:
        words_before.append(total)
        total += len(neoplatonists.greek.WORD.findall(ln))
    first_line = 0
    for k, (s, i, ln) in enumerate(lines[:80]):
        if "εφάλαιον" in ln:
            first_line = k + 1
    cand = {first_line}
    for k in range(first_line + 1, len(lines)):
        ln, prev = lines[k][2], lines[k - 1][2].rstrip()
        if _starts_general(ln) or (_CAPITAL.match(ln) and re.search(r"[.·;:].{0,6}$|^\W*$", prev)):
            cand.add(k)
    for v, (k, how, w) in anchors.items():
        cand.add(k)
    cand = sorted(cand)
    general = [_starts_general(lines[k][2]) for k in cand]
    window = [" ".join(lines[x][2] for x in range(k, min(k + 3, len(lines)))) for k in cand]
    body = [[p for p in pr["paras"] if not re.fullmatch(r"_[^_]+_\.?(\[\d+\])?", p)] or pr["paras"] for pr in props]   # without Taylor's titles
    eng = [sum(len(p.split()) for p in b) for b in body]
    stems = [statement_terms(b[0]) for b in body]
    n, m = len(props), len(cand)
    ratio = (total - words_before[first_line]) / max(1, sum(eng))
    W = [words_before[k] for k in cand] + [total]
    idx = {k: j for j, k in enumerate(cand)}
    fixed = {v - 1: idx[k] for v, (k, how, w) in anchors.items() if v - 1 < n}
    fixed[0] = idx[first_line]
    # expected start of each proposition, by the English before it; candidates are looked for within a window round it
    cum = [0]
    for e in eng:
        cum.append(cum[-1] + e)
    INF = float("inf")
    prev = {fixed[0]: (0.0, None)}
    back = [prev]
    for i in range(1, n):
        exp_len = ratio * eng[i - 1]
        here = {}
        if i in fixed:
            js = [fixed[i]]
        else:
            centre = W[fixed[0]] + ratio * cum[i]
            js = [j for j in range(m) if abs(W[j] - centre) < 2500]
        for j in js:
            bj = None
            for jp, (c, _) in prev.items():
                if jp >= j:
                    continue
                d = W[j] - W[jp]
                cost = c + (d - exp_len) ** 2 / (exp_len + 40)
                if bj is None or cost < bj[0]:
                    bj = (cost, jp)
            if bj:
                pen = 0 if general[j] else 150
                if stems[i]:
                    pen -= 300 * len(terms_found(stems[i], window[j])) / len(stems[i])
                here[j] = (bj[0] + pen, bj[1])
        if not here:
            raise SystemExit(f"taylor_greek: no place for proposition {i + 1} of the Elements")
        prev = here
        back.append(here)
    last = min(prev.items(), key=lambda x: x[1][0] + (W[-1] - W[x[0]] - ratio * eng[-1]) ** 2 / (ratio * eng[-1] + 40))[0]
    chosen = [None] * n
    chosen[n - 1] = last
    for i in range(n - 1, 0, -1):
        chosen[i - 1] = back[i][chosen[i]][1]
    return [cand[j] for j in chosen]


def _statement(pr):
    """Taylor's statement of a proposition: its first paragraph after his title."""
    return next((p for p in pr["paras"] if not re.fullmatch(r"_[^_]+_\.?(\[\d+\])?", p)), pr["paras"][0])


def place_elements(props, units):
    """Each proposition's place in Creuzer's Greek: [(unit seq, line index, how, the first words, terms found)], in order.

    1. Found: where Creuzer prints the proposition's number and title (the anchors), and the first proposition.
    2. Matched: the placing of _dp_place, kept only where it can be checked: the line begins a general
       statement (Πᾶν, Πᾶσα ...), at least three in five of the terms of Taylor's statement have their Greek in
       its first three lines (and at least two terms), and more of them than of the statement of the proposition
       before or after. The matched starts are added to the fixed ones and the placing is made again, until no
       more can be checked.
    3. Not placed: the rest. Such a proposition lies between the starts of the nearest placed propositions
       before and after it; the reader shows that stretch of the Greek, and says so."""
    lines, anchors = elements_lines(units)
    fixed = dict(anchors)
    stm = [statement_terms(_statement(pr)) for pr in props]

    def overlap(i, k):
        w = " ".join(lines[x][2] for x in range(k, min(k + 3, len(lines))))
        t = stm[i]
        return (len(terms_found(t, w)) / len(t) if t else 0.0), terms_found(t, w)

    checked = {}
    for _ in range(6):
        starts = _dp_place(props, lines, fixed)
        grew = False
        for i, k in enumerate(starts):
            if i == 0 or (i + 1) in fixed:
                continue
            r, f = overlap(i, k)
            nb = max(overlap(j, k)[0] for j in (i - 1, i + 1) if 0 <= j < len(props))
            if _starts_general(lines[k][2]) and len(stm[i]) >= 2 and r >= 0.6 and r > nb:
                if checked.get(i + 1) != k:
                    checked[i + 1] = k
                    fixed[i + 1] = (k, "matched", lines[k][2].strip())
                    grew = True
        if not grew:
            break
    starts = _dp_place(props, lines, fixed)
    out = []
    for i, k in enumerate(starts):
        s, li, ln = lines[k]
        if i + 1 in anchors and anchors[i + 1][0] == k:
            out.append((s, li, "found: " + anchors[i + 1][1], ln.strip(), None))
        elif i == 0:
            out.append((s, li, "found: the first line of the text, after the book's title", ln.strip(), None))
        elif checked.get(i + 1) == k:
            out.append((s, li, "matched", ln.strip(), sorted(overlap(i, k)[1])))
        else:
            out.append((s, li, "not placed", None, None))
    return out, lines, anchors




# ---------------------------------------------------------------- the Greek quotations in Taylor's notes

def letters(s):
    """Greek letters only, lower case, without accents or breathings, final sigma as sigma, ϑ as θ."""
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("ς", "σ").replace("ϑ", "θ").replace("ϐ", "β").replace("µ", "μ")
    return re.sub(r"[^α-ω ]+", " ", s)


_GK = "[\u0370-\u03ff\u1f00-\u1fff\u00b5]"


def note_quotes(notes):
    """The runs of three or more Greek words in Taylor's notes (each word of three or more letters), with their letters."""
    out = []
    sep = r"[\s,.;·:“”\"'‘’()\[\]\-]+"
    for n in notes:
        for run in re.findall(rf"(?:{_GK}{{2,}}{sep}){{2,}}{_GK}{{2,}}", n):
            ws = [w for w in letters(run).split() if len(w) >= 3]
            if len(ws) >= 3:
                out.append((run.strip(), ws))
    return out


def find_quote(ws, hay):
    """True when three of the quotation's words, one after another, follow one another in `hay` (letters only),
    allowing one word between: the OCR of Taylor's notes and of the scans misreads many single words."""
    for k in range(len(ws) - 2):
        three = ws[k:k + 3]
        if sum(len(w) for w in three) < 12:
            continue
        pat = r"(?:^| )" + r" (?:\S+ )?".join(re.escape(w) for w in three) + r"(?: |$)"
        if re.search(pat, hay):
            return True
    return False


# ---------------------------------------------------------------- the library

def greek_units(db, text_id):
    cols = ["seq", "part_seq", "n", "label", "page", "lang", "text"]
    return [dict(zip(cols, r)) for r in db.execute(f"SELECT {', '.join(cols)} FROM neo_unit WHERE text_id = ? ORDER BY seq", (text_id,))]


def greek_parts(db, text_id):
    return {r[0]: r[1] for r in db.execute("SELECT seq, label FROM neo_part WHERE text_id = ?", (text_id,))}


def build(db):
    """Write taylor_work, taylor_part and taylor_chapter. Returns the figures for the report."""
    stats = {"works": []}
    if not db.execute("SELECT 1 FROM neo_text LIMIT 1").fetchone():
        return None
    for seq, w in enumerate(WORKS):
        gu = greek_units(db, w["greek_text"])
        by_n = {u["n"]: u for u in gu}
        gparts = greek_parts(db, w["greek_text"])
        parts = []       # (label, greek label, evidence json, chapters)
        if w["id"] == "taylor-plotinus":
            for t, chs in taylor_plotinus():
                first = by_n.get(f"{t['enn']}.1")
                ghead = gparts.get(first["part_seq"]) if first else None
                e, b = t["enn"].split(".")
                for c in chs:
                    c["keys"] = [f"{t['enn']}.{k}" for k in c["nums"]]
                    c["label"] = f"{to_roman(int(e))}.{b}." + "–".join(str(k) for k in (c["nums"][:1] + c["nums"][-1:] if len(c["nums"]) > 1 else c["nums"]))
                ev = {"heading": t["heading"], "listed": t["listed"], "greek_heading": ghead, "note": t["note"]}
                parts.append((f"Ennead {to_roman(int(e))}.{b}: {TITLES[t['head']]}", ghead, ev, chs, t["enn"]))
        elif w["id"] == "taylor-mysteries":
            for sec, chs in taylor_mysteries():
                for c in chs:
                    c["keys"] = [f"{sec}.{k}" for k in c["nums"]]
                    c["label"] = f"{sec}.{c['nums'][0]}"
                gfirst = by_n.get(f"{sec}.1")
                parts.append((f"Section {to_roman(sec)}", gparts.get(gfirst["part_seq"]) if gfirst else None, {"heading": f"SECTION {to_roman(sec)}."}, chs, str(sec)))
        else:
            props = taylor_elements()
            places, glines, anchors = place_elements(props, gu)
            placed = [i for i, pl in enumerate(places) if pl[2] != "not placed"]
            for i, (pr, pl) in enumerate(zip(props, places)):
                pr["label"] = f"Prop. {pr['nums'][0]}"
                pr["place"] = pl
                if pl[2] == "not placed":
                    before = max(j for j in placed if j < i)
                    after = min((j for j in placed if j > i), default=None)
                    pr["range"] = (before, after)
                    pr["place"] = places[before]
                    pr["next_place"] = places[after] if after is not None else None
                else:
                    # the Greek runs to the start of the next placed proposition (past any whose start could not be placed)
                    nxt = min((j for j in placed if j > i), default=None)
                    pr["next_place"] = places[nxt] if nxt is not None else None
                    pr["runs_past"] = (nxt - i - 1) if nxt is not None else (len(places) - i - 1)
            for a in range(0, len(props), 10):
                chs = props[a:a + 10]
                parts.append((f"Propositions {chs[0]['nums'][0]}–{chs[-1]['nums'][0]}", None, {}, chs, None))
            stats["elements_anchors"] = len(anchors)
            stats["elements_lines"] = len(glines)
        # Where the Greek file prints no chapter of Taylor's number, see whether the chapter before runs on through it:
        # Taylor's two chapters together stand to that Greek chapter as his other chapters stand to theirs.
        if w["id"] != "taylor-elements":
            allch = [c for p_ in parts for c in p_[3]]
            def _gw(keys):
                return sum(len(neoplatonists.greek.WORD.findall(by_n[k]["text"])) for k in keys if k in by_n)
            rs = sorted(sum(len(x.split()) for x in c["paras"]) / _gw(c["keys"]) for c in allch if all(k in by_n for k in c["keys"]) and _gw(c["keys"]))
            med = rs[len(rs) // 2] if rs else 1
            for a_, b_ in zip(allch, allch[1:]):
                miss = [k for k in b_["keys"] if k not in by_n]
                if miss and len(b_["keys"]) == 1 and all(k in by_n for k in a_["keys"]):
                    e2 = sum(len(x.split()) for x in a_["paras"] + b_["paras"])
                    g = _gw(a_["keys"])
                    if g and 0.67 * med <= e2 / g <= 1.5 * med:
                        b_["runs_on"] = a_["keys"][-1]
                        a_["run_into"] = True
        # write (the work first: its chapters refer to it)
        db.execute("INSERT INTO taylor_work (id, seq, author, title, edition, year, source_id, text_how, greek_text, unit_name, about, n_parts, n_chapters, n_matched, n_paras, words) "
                   "VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,0)",
                   (w["id"], seq, w["author"], w["title"], w["edition"], w["year"], w["source"], w["text_how"], w["greek_text"], w["unit"], w["about"]))
        n_ch = n_match = n_paras = n_words = 0
        ratios = []           # English words to Greek words, chapter by chapter: the check that the numbers match
        checks = Counter()
        unmatched = []
        cseq = 0
        for pseq, (label, glabel, ev, chs, key) in enumerate(parts):
            first = cseq
            for c in chs:
                if w["id"] == "taylor-elements":
                    s, li = c["place"][0], c["place"][1]
                    nxt = c["next_place"]
                    span = {"from": [s, li], "to": [nxt[0], nxt[1]] if nxt else None, "placed": "range" not in c}
                    useqs = sorted({u["seq"] for u in gu if u["lang"] != "lat" and s <= u["seq"] <= (nxt[0] if nxt else gu[-1]["seq"])})
                    if "range" in c:
                        a, b = c["range"]
                        match_how = "not placed"
                        match_note = (f"its start could not be found in the OCR with confidence; it lies in the Greek between the starts of "
                                      f"Proposition {a + 1} and {'Proposition ' + str(b + 1) if b is not None else 'the end of the book'}")
                    elif c["place"][2] == "matched":
                        match_how = "machine-matched"
                        match_note = (f"placed by length and checked by Taylor's terms: the Greek of {', '.join(c['place'][4])} "
                                      f"is in its first lines")
                    else:
                        match_how = "found"
                        match_note = c["place"][2][len("found: "):]
                    if "range" not in c and c.get("runs_past"):
                        k_ = c["runs_past"]
                        match_note += (f"; the Greek shown runs on through the next {'proposition' if k_ == 1 else str(k_) + ' propositions'}, "
                                       f"whose start{'' if k_ == 1 else 's'} could not be placed")
                    greek_hay = " ".join(letters(elements_slice(gu, c["place"], nxt)).split())
                else:
                    us = [by_n[k] for k in c["keys"] if k in by_n]
                    useqs = [u["seq"] for u in us]
                    span = None
                    missing = [k for k in c["keys"] if k not in by_n]
                    if not us and c.get("runs_on"):
                        u0 = by_n[c["runs_on"]]
                        useqs = [u0["seq"]]
                        match_how = "chapter number"
                        match_note = (f"the Greek file prints no chapter {missing[0]}: its chapter {c['runs_on']} runs on through it "
                                      f"(Taylor's chapters {u0['label'].split('.')[-1]} and {missing[0].split('.')[-1]} together are as long, against that Greek, "
                                      f"as his other chapters are against theirs)")
                        missing = []
                        us_check = [u0]
                    elif not us:
                        match_how, match_note = "no Greek", f"the Greek file has no chapter {', '.join(missing)}"
                        unmatched.append(f"{w['title']} {c['label']}")
                    elif c.get("lost"):
                        match_how = "chapter number"
                        match_note = (f"the OCR lost Taylor's number{'s' if len(c['lost']) > 1 else ''} {', '.join(to_roman(x) for x in c['lost'])}, "
                                      f"so this passage holds chapters {to_roman(c['nums'][0])}–{to_roman(c['nums'][-1])}")
                    else:
                        match_how = "chapter number"
                        match_note = None if c["how"] == "read" else f"the OCR prints the number as {c['printed']}"
                    if missing and us:
                        match_note = ((match_note + "; ") if match_note else "") + f"the Greek file has no chapter {', '.join(missing)}"
                    if c.get("runs_on") and not us:
                        us = us_check
                    greek_hay = " ".join(letters(" ".join(u["text"] for u in us)).split())
                    gw = sum(len(neoplatonists.greek.WORD.findall(u["text"])) for u in us)
                    ew = sum(len(p.split()) for p in c["paras"])
                    if gw and not c.get("runs_on") and not c.get("run_into"):
                        ratios.append((ew / gw, c["label"], ew, gw))
                # the check: Taylor's Greek quotations in his notes, looked for in the Greek matched
                qs = []
                for raw, ws in note_quotes(c["notes"]):
                    if find_quote(ws, greek_hay):
                        where = "here"
                    else:
                        where = None
                        for u in gu:
                            if u["lang"] != "lat" and find_quote(ws, " ".join(letters(u["text"]).split())):
                                where = u["label"]
                                break
                    qs.append({"quote": raw[:200], "found": where})
                    checks["here" if where == "here" else "elsewhere" if where else "not found"] += 1
                db.execute("INSERT INTO taylor_chapter (work_id, seq, part_seq, n, label, printed, page, text, notes, greek_units, greek_span, match_how, match_note, checks, words) "
                           "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                           (w["id"], cseq, pseq, ",".join(c.get("keys") or [str(c["nums"][0])]), c["label"], c["printed"], c.get("page"), "\n\n".join(c["paras"]),
                            json.dumps(c["notes"], ensure_ascii=False) if c["notes"] else None, json.dumps(useqs), json.dumps(span) if span else None,
                            match_how, match_note, json.dumps(qs, ensure_ascii=False) if qs else None, sum(len(p.split()) for p in c["paras"])))
                cseq += 1
                n_ch += 1
                n_match += 1 if useqs else 0
                n_paras += len(c["paras"])
                n_words += sum(len(p.split()) for p in c["paras"])
            db.execute("INSERT INTO taylor_part (work_id, seq, label, greek_label, evidence, first_chapter, last_chapter) VALUES (?,?,?,?,?,?,?)",
                       (w["id"], pseq, label, glabel, json.dumps(ev, ensure_ascii=False), first, cseq - 1))
        how = Counter(r[0].split(":")[0] for r in db.execute("SELECT match_how FROM taylor_chapter WHERE work_id = ?", (w["id"],)))
        db.execute("UPDATE taylor_work SET n_parts = ?, n_chapters = ?, n_matched = ?, n_paras = ?, words = ? WHERE id = ?",
                   (len(parts), n_ch, n_match, n_paras, n_words, w["id"]))
        stats["works"].append({"id": w["id"], "author": w["author"], "title": w["title"], "greek_text": w["greek_text"], "parts": len(parts), "chapters": n_ch,
                               "matched": n_match, "paras": n_paras, "words": n_words, "how": dict(how), "checks": dict(checks), "unmatched": unmatched})
        if ratios:
            med = sorted(r[0] for r in ratios)[len(ratios) // 2]
            stats["works"][-1]["ratio"] = {"median": round(med, 2), "chapters": len(ratios),
                                           "outliers": [{"label": l, "english": e, "greek": g} for r, l, e, g in ratios if not 0.5 * med <= r <= 2 * med]}
    db.execute("INSERT INTO build VALUES ('taylor_greek_stats', ?)", (json.dumps(stats, ensure_ascii=False),))
    return stats


def elements_slice(units, place, nxt):
    """The Greek of a proposition of the Elements: from its start line to the next proposition's, the Latin pages and footnotes left out."""
    s, li = place[0], place[1]
    out = []
    for u in units:
        if u["lang"] == "lat" or u["seq"] < s or (nxt and u["seq"] > nxt[0]):
            continue
        lines = u["text"].split("\n")
        a = li if u["seq"] == s else 0
        b = len(lines)
        for i, ln in enumerate(lines):
            if i > 4 and is_note_line(ln):
                b = i
                break
        if nxt and u["seq"] == nxt[0]:
            b = min(b, nxt[1])
        out.extend(lines[a:b])
    return "\n".join(out)


def write_report(stats):
    if not stats:
        return
    L = ["# The commentators' Greek beside Taylor's English: what the matching found", "",
         "Written by `tools/taylor_greek.py` when the library is built (milestone 26); every figure is counted from the build.", "",
         "| Taylor's translation | Greek (milestone 25) | Parts | Chapters | With Greek | Paragraphs | English words | How matched |",
         "|---|---|---:|---:|---:|---:|---:|---|"]
    for w in stats["works"]:
        how = "; ".join(f"{k} {v}" for k, v in sorted(w["how"].items(), key=lambda x: -x[1]))
        L.append(f"| {w['author']}, {w['title']} (`{w['id']}`) | `{w['greek_text']}` | {w['parts']} | {w['chapters']} | {w['matched']} | {w['paras']:,} | {w['words']:,} | {how} |")
    L += ["", "**The check.** Taylor's footnotes quote the Greek he translates. Each quotation of three or more Greek words "
          "is looked for, letters only, in the Greek matched to its chapter, and if not there, anywhere in the text:", "",
          "| Text | Found in the Greek matched | Found in another place | Not found (the OCR of the note, or of the Greek, too poor) |", "|---|---:|---:|---:|"]
    for w in stats["works"]:
        c = w["checks"]
        L.append(f"| {w['author']}, {w['title']} | {c.get('here', 0)} | {c.get('elsewhere', 0)} | {c.get('not found', 0)} |")
    L += ["", "**The check of the chapter numbers.** If Taylor's chapter n is the Greek chapter n, his English should run to about the same "
          "multiple of the Greek in every chapter. It does:", "",
          "| Text | Chapters | English words to one Greek word (median) | Chapters outside half to twice that |", "|---|---:|---:|---|"]
    for w in stats["works"]:
        r = w.get("ratio")
        if r:
            outl = "; ".join(f"{o['label']} ({o['english']:,} English, {o['greek']:,} Greek)" for o in r["outliers"]) or "none"
            L.append(f"| {w['author']}, {w['title']} | {r['chapters']} | {r['median']} | {outl} |")
    L += ["", "Each outlier was read, and begins where its Greek chapter begins. Where the Greek is much the longer, the Greek file holds more than Taylor "
          "translates: Plotinus IV.7.8, where Volkmann prints within chapter 8 the long passage preserved by Eusebius (8¹ to 8⁵), which Taylor, following Ficino, "
          "does not have; On the Mysteries 7.3, where the Greek file prints no chapter 7.4 and its 7.3 runs on. Where the English is much the longer, a long note of "
          "Taylor's runs over a page and the OCR set its continuation among the text, where it is shown as a paragraph of the chapter."]
    if "elements_anchors" in stats:
        h = next((w["how"] for w in stats["works"] if w["id"] == "taylor-elements"), {})
        L += ["", f"**The Elements.** Creuzer prints the number and title of {stats['elements_anchors']} of the 211 propositions where the OCR can read them "
              "(in the Greek, or in his Latin on the facing page, which is numbered one more than the Greek page it translates): those starts are *found*, with the first proposition, "
              "which begins the text. Every other proposition is placed by machine, all at once (dynamic programming), at a line that begins a sentence, so that the length of "
              "each proposition's Greek is as near as can be to its length in Taylor's English, a general statement (Πᾶν, Πᾶσα, Πάντα ...) preferred, and a line where the Greek of "
              "Taylor's terms is found preferred. A placing is kept (*machine-matched*) only where it can be checked: the line begins a general statement, three in five or more of "
              "the terms of Taylor's statement (two at least) have their Greek in its first three lines, and more of them than of the statement of the proposition before or after; "
              "the kept placings are fixed and the rest placed again, until no more can be checked. "
              f"Found {h.get('found', 0)}, machine-matched {h.get('machine-matched', 0)}, *not placed* {h.get('not placed', 0)}: for these the reader shows the pages of the Greek between "
              "the placed propositions before and after, and says so. Taylor's terms and their Greek are listed in `TERMS` in the tool."]
    un = [x for w in stats["works"] for x in w["unmatched"]]
    if un:
        L += ["", "**English without Greek** (the Greek file has no chapter of that number): " + ", ".join(un) + "."]
    L.append("")
    REPORT.write_text("\n".join(L), encoding="utf-8")


def main():
    if "--check" in sys.argv:
        for t, chs in taylor_plotinus():
            nums = [n for c in chs for n in c["nums"]]
            print(f"{t['enn']:<5} {t['heading'][:60]:<60} chapters {len(chs)} -> {nums[-1] if nums else 0} "
                  f"{'' if nums == list(range(1, len(nums) + 1)) else 'GAPS ' + str(nums)} misread {[c['printed'] for c in chs if c['how'] != 'read']}")
        for sec, chs in taylor_mysteries():
            print(f"Mysteries section {sec}: {len(chs)} chapters, {sum(len(c['paras']) for c in chs)} paragraphs, {sum(len(c['notes']) for c in chs)} notes")
        props = taylor_elements()
        print(f"Elements: {len(props)} propositions, {sum(len(p['notes']) for p in props)} notes")
        return
    print(__doc__)


if __name__ == "__main__":
    main()
