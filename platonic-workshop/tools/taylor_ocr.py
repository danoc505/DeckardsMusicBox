#!/usr/bin/env python3
"""Clean the OCR of Taylor and Sydenham's Works of Plato (1804), vols. II to V,
by rule, into one JSON file per work in texts/taylor-1804/vol<N>/.

The OCR files in sources/taylor-1804/ are kept exactly as received; every
cleaned paragraph and note keeps its raw OCR beside it ('raw'), so any
correction can be checked against what the scan reads. Nothing is proofread
by a person; every record says so (proof_status 'OCR cleaned by rule').

What the rules do, in order (each counted in reports/taylor_ocr.md):

1. Cut each work out of its volume by the line ranges in
   sources/taylor-1804/dialogues.json.
2. Pages. A page ends at two blank lines. Its first line is the running head
   ('THE CRITO. 231', '230 THE CRITO.'): it is removed, and its page number
   kept for the record. The last line, when it is a catchword (the first word
   of the next page, printed at the foot) or a signature mark ('2 G 2',
   'VOL. IV.'), is removed.
3. Footnotes. They are set in smaller type, so their lines are wider: in the
   OCR, 86 characters or more against 64 to 84 for the text (counted over the
   Crito). A block at the foot of a page whose lines are that wide, or that
   begins with a note mark (' * ^ †), and every block after it on the page,
   is a footnote. A footnote block with no mark at the top of a page's notes
   continues the last note of the page before. A note signed '— S.' is
   Sydenham's, '— T.' Taylor's.
4. Paragraphs run on across a page break unless the page ended a sentence and
   the next begins with a speaker. Words broken at the end of a line are
   joined, keeping the hyphen only where the joined word is not a word and the
   hyphenated one is (to-day).
5. Speakers. A paragraph opening with a short name and a full stop ('Soc.',
   'CRI.', 'C R I .') is a speech when the name begins one of the names in the
   work's PERSONS OF THE DIALOGUE.
6. Letters. The 1804 printing uses the long s, which the OCR reads as f
   ('fuch', 'thefe'), and the ct ligature, which it reads in a dozen ways
   ('refpe6l', 'negle61ed', 'effed'). Each word that is not an English word, or
   contains f, is compared with the words it could be under these readings
   (f -> s except at the end of a word, where the long s was never used;
   fl, ff -> st, ss; fli -> sh; the ct ligature; and at most one of the common
   OCR confusions c/e, rn/m, li/h, tli/th, 1/l). A reading is taken only if it
   is a word in the clean texts the Workshop already has: Taylor's own vol. I
   (theosophylib.com, which keeps his spelling), Jowett and the Loeb
   translations. When the OCR word is itself a word (fame, fold, fit), the
   choice between it and its reading (same, sold, sit) goes to whichever is
   more frequent with the words on either side of it, in those texts.
7. Isolated note marks in the text are removed; each footnote is attached to
   the paragraph on its page that carried the mark (in order), or to the last
   paragraph of the page.

Stephanus sections are not printed in the 1804 edition. They are assigned
when the library is built (tools/build_db.py, with tools/align.py), not here.

    python3 tools/taylor_ocr.py            # clean every work, write texts/ and the report
    python3 tools/taylor_ocr.py --check    # print the first and last lines of every range
    python3 tools/taylor_ocr.py crito      # clean one work (by slug) and print its start
"""
import argparse
import json
import math
import re
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "taylor-1804"
OUT = ROOT / "texts" / "taylor-1804"
VOL1 = OUT / "vol1"
JOWETT = ROOT / "sources" / "jowett-gutenberg"
PERSEUS_ENG = ROOT / "data" / "raw" / "perseus-english-plato" / "data" / "tlg0059"
REPORT = ROOT / "reports" / "taylor_ocr.md"
PROOF_STATUS = "OCR cleaned by rule"

NOTE_WIDTH = 86          # a line this wide (spaces collapsed) is in footnote type
MARKS = "'*^†‡§|»«•°%"
MARK_TOKEN = re.compile(r"(?<=\s)[" + re.escape(MARKS) + r"]{1,2}(?=\s|$)")
NOTE_START = re.compile(r"^[" + re.escape(MARKS) + r"]{1,2}\s")
SIGNED = re.compile(r"[—\-–]+\s*([ST5])[.,;]?\s*$")
TERMINAL = tuple(".?!:;\"'”’)")


def config():
    return json.loads((SRC / "dialogues.json").read_text(encoding="utf-8"))


@lru_cache(maxsize=None)
def volume_lines(vol):
    return (SRC / f"Taylor_Sydenham_v{vol}_djvu.txt").read_text(encoding="utf-8").split("\n")


def collapse(s):
    return re.sub(r"\s+", " ", s).strip()


# ------------------------------------------------------------------ vocabulary

WORDS = re.compile(r"[a-z]+(?:'[a-z]+)?")


class Vocab:
    """Word and word-pair counts from the clean English texts in the Workshop."""

    def __init__(self):
        self.uni, self.bi = Counter(), Counter()
        self.sources = {}

    def add(self, text, weight=1):
        ws = WORDS.findall(text.lower())
        for w in ws:
            self.uni[w] += weight
        for a, b in zip(ws, ws[1:]):
            self.bi[(a, b)] += weight
        return len(ws)

    @classmethod
    def build(cls):
        v = cls()
        n = 0
        for f in sorted(VOL1.glob("*.json")):
            d = json.loads(f.read_text(encoding="utf-8"))
            for s in d.get("segments", []):
                n += v.add(s.get("text", ""), 3)
            for s in d.get("notes", []):
                n += v.add(s.get("text", ""), 3)
        v.sources["Taylor vol. I (theosophylib.com), counted three times"] = n
        n = 0
        for f in sorted(JOWETT.glob("pg*.txt")):
            n += v.add(f.read_text(encoding="utf-8"))
        v.sources["Jowett (Project Gutenberg)"] = n
        n = 0
        if not PERSEUS_ENG.exists():
            sys.exit("The Loeb English is needed for the word list: run python3 tools/fetch_sources.py first.")
        for f in sorted(PERSEUS_ENG.glob("*/*eng*.xml")):
            t = f.read_text(encoding="utf-8")
            t = re.sub(r"<teiHeader.*?</teiHeader>", " ", t, flags=re.S)
            n += v.add(re.sub(r"<[^>]+>", " ", t))
        v.sources["Loeb translations (Perseus)"] = n
        return v

    def known(self, w, least=2):
        return self.uni.get(w, 0) >= least


# Readings the OCR may stand for: (what the OCR has, what it may be, kind).
LONG_S = [("fli", "sh"), ("fl", "st"), ("fl", "ss"), ("ff", "st"), ("ff", "ss"), ("ft", "ss"), ("lt", "ss"),
          ("lf", "ss"), ("f", "s"), ("(", "s"), ("f^", "ss")]
LIGATURE = [("6l", "ct"), ("61", "ct"), ("6t", "ct"), ("dl", "ct"), ("dt", "ct"), ("(9", "ct"), ("<51", "ct"),
            ("(5", "ct"), ("€l", "ct"), ("£l", "ct"), ("€t", "ct"), ("cl", "ct"), ("£", "ct"), ("d", "ct")]
OCR = [("c", "e"), ("e", "c"), ("rn", "m"), ("li", "h"), ("tli", "th"), ("ii", "u"), ("1", "l"), ("1", "i"),
       ("0", "o"), ("u", "n"), ("n", "u"), ("vv", "w"), ("j", "i"), ("i", "l"), ("l", "i"), ("o", "e"), ("a", "e"),
       ("^", "s"), ("^", ""), ("^", "e"), ("b", "o"), ("v", "y"), ("6", "e"), ("o", "g"), ("i", "f"), ("o", "n"), ("i", "s")]
RULES = [(a, b, "long s") for a, b in LONG_S] + [(a, b, "ct ligature") for a, b in LIGATURE] + [(a, b, "OCR letter") for a, b in OCR]
MAX_SITES = 9


def readings(word):
    """Every string the OCR word may stand for under the rules, with the kinds
    of rule used. At most one 'OCR letter' change; the long s never ends a word."""
    sites = []
    for a, b, kind in RULES:
        start = 0
        while True:
            i = word.find(a, start)
            if i < 0:
                break
            start = i + 1
            if kind == "long s" and b.endswith("s") and a != "f^" and i + len(a) >= len(word):
                continue                      # no long s at the end of a word
            if a == "(" and i != 0:
                continue
            if kind == "ct ligature" and a == "d" and i + 1 < len(word) and word[i + 1] not in "eis":
                continue                      # effed, refped; not 'dog'
            sites.append((i, a, b, kind))
    sites.sort()
    if len(sites) > MAX_SITES:
        sites = [s for s in sites if s[3] != "OCR letter"][:MAX_SITES]
    out = {}

    def rec(k, pos, acc, kinds, n_ocr):
        if k == len(sites):
            s = "".join(acc) + word[pos:]
            if s != word:
                key = tuple(sorted(kinds))
                if s not in out or len(key) < len(out[s]):
                    out[s] = key
            return
        i, a, b, kind = sites[k]
        rec(k + 1, pos, acc, kinds, n_ocr)          # leave this site as it is
        if i >= pos and (kind != "OCR letter" or n_ocr == 0):
            rec(k + 1, i + len(a), acc + [word[pos:i], b], kinds + [kind], n_ocr + (kind == "OCR letter"))
    rec(0, 0, [], [], 0)
    return out


class Corrector:
    def __init__(self, vocab):
        self.v = vocab
        self.counts = Counter()
        self.changes = Counter()   # (ocr, reading) -> n, for the report

    @lru_cache(maxsize=None)
    def options(self, low):
        """[(reading, kinds)] in the word list, for a lower-case OCR word."""
        return [(s, k) for s, k in readings(low).items() if self.v.known(s.lstrip("("))]

    def score(self, w, prev, nxt, kinds):
        u = self.v.uni
        s = math.log(u.get(w, 0) + 1)
        if prev:
            s += 1.5 * math.log(self.v.bi.get((prev, w), 0) + 1)
        if nxt:
            s += 1.5 * math.log(self.v.bi.get((w, nxt), 0) + 1)
        s -= 1.5 * sum(1 for k in kinds if k == "OCR letter") + 0.5 * sum(1 for k in kinds if k == "ct ligature")
        return s

    def word(self, core, prev, nxt):
        """Correct one word (letters and OCR junk, no surrounding punctuation)."""
        low = core.lower()
        plain_known = self.v.known(low, 1) and re.fullmatch(r"[a-z']+", low)
        if plain_known and "f" not in low and "(" not in low:
            self.counts["known as printed"] += 1
            return core
        opts = self.options(low)
        if not opts:
            self.counts["known as printed" if plain_known else "not in the word list, kept"] += 1
            return core
        # A reading by the long s or the ligature alone is preferred to one that
        # also needs an OCR letter change (thofe is those, not these).
        if any("OCR letter" not in k for _, k in opts):
            opts = [(s, k) for s, k in opts if "OCR letter" not in k]
        best, best_kinds = (low, ()) if plain_known else (None, ())
        best_score = self.score(low, prev, nxt, ()) if plain_known else -1e9
        for s, kinds in opts:
            sc = self.score(s, prev, nxt, kinds)
            if sc > best_score:
                best, best_kinds, best_score = s, kinds, sc
        if best is None or best == low:
            self.counts["known as printed"] += 1
            return core
        for k in set(best_kinds):
            self.counts[f"changed: {k}"] += 1
        self.changes[(low, best)] += 1
        # Keep the printed capitals.
        if core[:1].isupper():
            best = best[:1].upper() + best[1:]
        if len(core) > 1 and core.isupper():
            best = best.upper()
        return best

    TOKEN = re.compile(r"^([\"“‘\[(]*)(.*?)([.,;:!?\"”’'\])]*)$")

    def text(self, s):
        out = []
        toks = s.split(" ")
        prev = None
        for i, tok in enumerate(toks):
            if not tok:
                continue
            m = self.TOKEN.match(tok)
            lead, core, trail = m.groups()
            if lead.endswith("(") and core and core[0].isalpha() and ")" not in trail:
                # '(hall' may be 'shall': let the word rules see the bracket.
                lead, core = lead[:-1], "(" + core
            if core == "1" and i + 1 < len(toks) and toks[i + 1][:1].islower():
                core = "I"                    # '1 come' for 'I come'
                self.counts["changed: OCR letter"] += 1
            if core.endswith("-") and not core.endswith("--") and len(core) > 2:
                core = core[:-1]              # 'beino-': the OCR's reading of a final g
            if core and re.search(r"[A-Za-z]", core):
                nxt = None
                if i + 1 < len(toks):
                    nm = re.sub(r"[^a-z]", "", toks[i + 1].lower())
                    nxt = nm or None
                parts = core.split("-")
                fixed = []
                for p in parts:
                    if p and re.search(r"[A-Za-z]", p):
                        fixed.append(self.word(p, prev, nxt))
                        prev = re.sub(r"[^a-z']", "", fixed[-1].lower()) or prev
                    else:
                        fixed.append(p)
                core = "-".join(fixed)
                if core.startswith("(") and not lead:
                    lead, core = "(", core[1:]
            out.append(lead + core + trail)
        return " ".join(out)

    def join_hyphen(self, left, right):
        """'confe-' + 'quence' -> the joined word if it is one, else keep the hyphen."""
        a = re.sub(r"[^A-Za-z(]", "", left.split(" ")[-1])
        b = re.sub(r"[^A-Za-z]", "", right.split(" ")[0]) if right else ""
        joined = (a + b).lower()
        cands = [joined] + [s for s, _ in self.options(joined)]
        if any(self.v.known(c) for c in cands):
            return left[:-1] + right
        if self.v.known(a.lower()) and self.v.known(b.lower()):
            return left + right
        return left[:-1] + right


# ------------------------------------------------------------------ pages and blocks

HEAD_WORDS = re.compile(r"[A-Za-z]{2,}")


def is_head(line):
    s = collapse(line)
    if not s or len(s) > 70:
        return False
    letters = [c for c in s if c.isalpha()]
    if len(letters) < 3:
        return False
    upper = sum(c.isupper() for c in letters) / len(letters)
    if not (upper > 0.6 and len(s.split()) <= 12 and not s.endswith(("?", "!"))):
        return False
    # A running head carries the page number or the title ('THE CRITO'); a list
    # of speakers in capitals ('EUCLID, TERPSIO,') does not.
    return bool(re.search(r"\d", s) or re.search(r"T\s?[HI]\s?[EB£]|INTRO|NOTES|EPISTLE", s.upper()))


def head_page(line):
    s = collapse(line)
    for tok in (s.split()[0], s.split()[-1]):
        t = tok.strip(".,;:'\"^*")
        if t.isdigit() and 1 <= len(t) <= 3:
            return int(t)
    return None


def split_pages(lines):
    """[(page lines)] split at two or more blank lines."""
    pages, cur, blank = [], [], 0
    for ln in lines:
        if not ln.strip():
            blank += 1
            cur.append("")
            continue
        if blank >= 2 and any(x.strip() for x in cur):
            pages.append(cur)
            cur = []
        blank = 0
        cur.append(ln)
    if any(x.strip() for x in cur):
        pages.append(cur)
    return pages


def first_word(lines):
    for ln in lines:
        s = collapse(ln)
        if s:
            return re.sub(r"[^a-z]", "", s.split()[0].lower())
    return ""


def page_blocks(lines):
    blocks, cur = [], []
    for ln in lines:
        if ln.strip():
            cur.append(ln)
        elif cur:
            blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)
    return blocks


def wide(block):
    long_lines = [collapse(l) for l in block if len(collapse(l).split()) >= 5]
    if not long_lines:
        return False
    return sum(len(l) >= NOTE_WIDTH for l in long_lines) * 2 > len(long_lines)


def is_catchword(line, next_first):
    s = collapse(line)
    toks = s.split()
    if not toks or len(s) > 24 or len(toks) > 4:
        return False
    if re.search(r"\d", s) or s.upper().startswith("VOL"):
        return True
    w = re.sub(r"[^a-z]", "", toks[-1].lower())
    if len(toks) <= 2 and bool(w) and bool(next_first) and w[:3] == next_first[:3]:
        return True
    # A word or two at the foot, not ending a sentence: a catchword the OCR misread.
    return len(toks) <= 2 and len(s) <= 14 and not s.endswith((".", "?", "!"))


# ------------------------------------------------------------------ one work

def persons_names(blocks):
    names = set()
    for b in blocks:
        for w in re.findall(r"[A-Za-z]{3,}", " ".join(b)):
            if w.lower() not in ("the", "and", "persons", "dialogue", "scene", "of", "son", "his", "who", "with"):
                names.add(w.lower())
    return names


NOT_SPEAKERS = set("""yes no true but and so very certainly entirely by it this that what how why it right
perfectly most nothing well nor or if then for all just undoubtedly necessarily granted surely impossible clearly""".split())
LABEL = re.compile(r"^((?:[A-Z][A-Za-z]{1,12})|(?:[A-Z](?:\s[A-Z]){1,6}))\s?[.,;»](?=\s)")


def speaker_of(text, names):
    m = LABEL.match(text)
    if not m:
        return None, text
    lab = re.sub(r"\s", "", m.group(1)).lower()
    if len(lab) < 2:
        return None, text
    for n in names:
        if n.startswith(lab) or (len(lab) >= 3 and n[:len(lab)][:-1] == lab[:-1] and lab[-1] in "ce"):
            return m.group(1).replace(" ", ""), text[m.end():].strip()
    return None, text


def clean_work(d, corrector):
    lines = volume_lines(d["vol"])
    lo, hi = d["start"] - 1, d["end"] - 1
    keep = []
    for i in range(lo, hi):
        if any(a - 1 <= i <= b - 1 for a, b in d.get("exclude", [])):
            continue
        keep.append((i + 1, lines[i]))
    switches = sorted((s["line"], s["translator"]) for s in d.get("translator_from", []))
    stats = Counter()
    pages = []
    cur, blank = [], 0
    for no, ln in keep:
        if not ln.strip():
            blank += 1
            cur.append((no, ""))
            continue
        if blank >= 2 and any(x[1].strip() for x in cur):
            pages.append(cur)
            cur = []
        blank = 0
        cur.append((no, ln))
    if any(x[1].strip() for x in cur):
        pages.append(cur)

    paras, notes = [], []
    last_page = None
    names = None
    persons_done = False
    pending_label = None
    for pi, page in enumerate(pages):
        body = [x for x in page]
        nonblank = [x for x in body if x[1].strip()]
        page_no = None
        if pi > 0 and nonblank and is_head(nonblank[0][1]):
            page_no = head_page(nonblank[0][1])
            body = body[body.index(nonblank[0]) + 1:]
            stats["running heads removed"] += 1
        if page_no is None and last_page is not None and pi > 0:
            page_no = last_page + 1
        last_page = page_no if page_no is not None else last_page
        nxt_first = ""
        if pi + 1 < len(pages):
            nb = [x[1] for x in pages[pi + 1] if x[1].strip()]
            nxt_first = first_word(nb[1:] if nb and is_head(nb[0]) else nb)
        nonblank = [x for x in body if x[1].strip()]
        if nonblank and is_catchword(nonblank[-1][1], nxt_first):
            body = body[:body.index(nonblank[-1])]
            stats["catchwords and signatures removed"] += 1
        blocks, curb = [], []
        for x in body:
            if x[1].strip():
                curb.append(x)
            elif curb:
                blocks.append(curb)
                curb = []
        if curb:
            blocks.append(curb)
        # Footnote blocks: from the first wide or marked block to the foot of the page.
        k_note = len(blocks)
        for k in range(len(blocks)):
            texts = [x[1] for x in blocks[k]]
            if k > 0 or pi > 0:
                if wide(texts) or (NOTE_START.match(collapse(texts[0])) and k > 0):
                    if all(wide([x[1] for x in b]) or NOTE_START.match(collapse(b[0][1])) or len(b) <= 2 for b in blocks[k:]):
                        k_note = k
                        break
        text_blocks, note_blocks = blocks[:k_note], blocks[k_note:]
        page_paras = []
        for b in text_blocks:
            raw = [x[1] for x in b]
            s = collapse(" ".join(raw))
            line_no = b[0][0]
            if not persons_done:
                if names is None:
                    names = set()
                if re.search(r"PERSONS|DIALOGUE|SCENE", s.upper()) or (len(s.split()) < 8 and not re.fullmatch(r"[A-Z][a-z]+\.", s)):
                    names |= persons_names([raw])
                    paras.append({"kind": "persons", "raw": "\n".join(raw), "text": s, "page": page_no, "line": line_no})
                    continue
                persons_done = True
            if re.fullmatch(r"(?:BOOK|EPISTLE)\s+[IVXL1l]+\.?.*", s.upper()) and len(s) < 30:
                paras.append({"kind": "heading", "raw": "\n".join(raw), "text": s.title(), "page": page_no, "line": line_no})
                continue
            if re.fullmatch(r"[A-Z][A-Za-z]{2,12}\.", s) and names and speaker_of(s + " x", names)[0]:
                pending_label = s.rstrip(".")
                continue
            # Join the block's lines, mending words broken at line ends.
            joined = ""
            for ln in raw:
                ln = collapse(ln)
                if joined.endswith("-") and not joined.endswith("--"):
                    joined = corrector.join_hyphen(joined, ln)
                    stats["words joined across lines"] += 1
                else:
                    joined = (joined + " " + ln).strip()
            item = {"kind": "paragraph", "raw": "\n".join(raw), "text": joined, "page": page_no, "line": line_no}
            if pending_label:
                item["label"] = pending_label
                pending_label = None
            # Runs on from the page before?
            if not page_paras and paras and paras[-1]["kind"] == "paragraph" and pi > 0:
                prev = paras[-1]
                lab, _ = speaker_of(joined, names or set())
                if not lab and not item.get("label"):
                    if prev["text"].endswith("-") and not prev["text"].endswith("--"):
                        prev["text"] = corrector.join_hyphen(prev["text"], joined)
                    else:
                        prev["text"] = prev["text"] + " " + joined
                    prev["raw"] += "\n" + "\n".join(raw)
                    prev.setdefault("pages", [prev["page"]])
                    if page_no not in prev["pages"]:
                        prev["pages"].append(page_no)
                    stats["paragraphs run on across a page"] += 1
                    page_paras.append(prev)
                    continue
            paras.append(item)
            page_paras.append(item)
        # Notes on this page.
        for b in note_blocks:
            raw = [x[1] for x in b]
            s = ""
            for ln in raw:
                ln = collapse(ln)
                s = corrector.join_hyphen(s, ln) if s.endswith("-") else (s + " " + ln).strip()
            if not NOTE_START.match(s) and notes and b is note_blocks[0] and notes[-1]["page"] != page_no:
                notes[-1]["text"] += " " + s
                notes[-1]["raw"] += "\n" + "\n".join(raw)
                stats["notes run on across a page"] += 1
                continue
            mark = NOTE_START.match(s)
            notes.append({"text": s[mark.end():].strip() if mark else s, "raw": "\n".join(raw), "page": page_no,
                          "line": b[0][0], "on": [p for p in page_paras] or ([paras[-1]] if paras else [])})
            stats["notes"] += 1
    # The first page has no running head: it is the page before the next numbered one.
    known = [p["page"] for p in paras if p.get("page")]
    if known:
        for p in paras:
            if p.get("page") is None:
                p["page"] = known[0] - 1
        for n in notes:
            if n.get("page") is None:
                n["page"] = known[0] - 1
    # Speakers. The names come from the PERSONS OF THE DIALOGUE list; the OCR
    # sometimes runs that list into the first paragraph, so the words in
    # capitals of the first few blocks are read as names too. A short label
    # that opens five or more paragraphs ('Guest.', 'Clin.') is also a speaker,
    # unless it is an ordinary word that can open a reply ('Yes.', 'True.').
    names = set(names or set())
    for p in paras[:8]:
        names |= {w.lower() for w in re.findall(r"\b[A-Z]{3,}\b", p["text"]) if w not in ("THE", "AND", "PERSONS", "DIALOGUE", "SCENE", "OF")}
    opens = Counter()
    for p in paras:
        if p["kind"] == "paragraph":
            m = LABEL.match(p["text"])
            if m and p["text"][m.end(1):m.end(1) + 1] == ".":
                opens[re.sub(r"\s", "", m.group(1)).lower()] += 1
    for lab, n in opens.items():
        if n >= 5 and lab not in NOT_SPEAKERS and len(lab) >= 2:
            names.add(lab)
    # Marks, letters.
    out_segs = []
    seq = 0
    translator = d["translator"]
    sw = list(switches)
    for p in paras:
        while sw and p["line"] >= sw[0][0]:
            translator = sw.pop(0)[1]
        p["translator"] = translator
        if p["kind"] != "paragraph":
            continue
        t = p["text"]
        n_marks = len(MARK_TOKEN.findall(" " + t))
        t = MARK_TOKEN.sub("", " " + t).strip()
        p["marks"] = n_marks
        stats["note marks removed"] += n_marks
        lab, rest = speaker_of(t, names)
        if lab:
            p["label"] = corrector.text(lab)
            t = rest
            stats["speeches"] += 1
        p["text"] = re.sub(r"\s+([.,;:?!])", r"\1", collapse(corrector.text(t)))
    for p in paras:
        seq += 1
        p["id"] = f"taylor1804.{d['slug']}.p{seq:04d}"
    # Attach notes: the k-th note of a page goes to the paragraph with the k-th mark, else the last.
    for n in notes:
        on = [p for p in n.pop("on") if p.get("kind") == "paragraph"]
        n["in"] = on[-1]["id"] if on else None
    by_page = {}
    for n in notes:
        by_page.setdefault(n["page"], []).append(n)
    for pg, ns in by_page.items():
        marked = [p for p in paras if p.get("kind") == "paragraph" and pg in p.get("pages", [p["page"]]) and p.get("marks")]
        slots = [p["id"] for p in marked for _ in range(p["marks"])]
        if len(slots) == len(ns):
            for n, pid in zip(ns, slots):
                n["in"] = pid
                n["anchor"] = "note mark"
        for n in ns:
            n.setdefault("anchor", "same page")
    for i, n in enumerate(notes, 1):
        n["id"] = f"taylor1804.{d['slug']}.n{i:03d}"
        sg = SIGNED.search(n["text"])
        n["signed"] = {"S": "Sydenham", "5": "Sydenham", "T": "Taylor"}.get(sg.group(1)) if sg else None
        n["text"] = re.sub(r"\s+([.,;:?!])", r"\1", collapse(corrector.text(n["text"])))
    for p in paras:
        p.setdefault("pages", [p["page"]])
        out_segs.append({k: p[k] for k in ("id", "kind", "label", "translator", "text", "raw", "pages", "line") if k in p})
    return out_segs, notes, stats


def write_work(d, segs, notes, stats):
    dest = OUT / f"vol{d['vol']}" / f"{d['slug']}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    translators = sorted({s["translator"] for s in segs if s["kind"] == "paragraph"})
    doc = {
        "schema": "platonic-workshop/text-v1",
        "id": f"taylor1804.{d['slug']}",
        "title": d["title"],
        "author": "Plato",
        "translator": " and ".join(translators),
        "edition": f"The Works of Plato, translated by Floyer Sydenham and Thomas Taylor, vol. {'I' * d['vol'] if d['vol'] < 4 else ('IV' if d['vol'] == 4 else 'V')} (London, 1804)",
        "perseus_work": f"urn:cts:greekLit:tlg0059.{d['work']}",
        "citation": "1804 page on every segment; Stephanus sections are assigned when the library is built (tools/align.py)",
        "proof_status": PROOF_STATUS,
        "source": {"manifest_id": "taylor-1804", "file": f"sources/taylor-1804/Taylor_Sydenham_v{d['vol']}_djvu.txt",
                   "lines": [d["start"], d["end"]], "exclude": d.get("exclude", [])},
        "gap": d.get("gap"),
        "segments": segs,
        "notes": notes,
        "stats": dict(stats),
    }
    dest.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return dest


def check():
    for d in config()["dialogues"]:
        lines = volume_lines(d["vol"])
        body = [l for l in lines[d["start"] - 1:d["end"] - 1] if l.strip()]
        print(f"== vol {d['vol']} {d['slug']} {d['start']}-{d['end']} ({d['translator']})")
        for l in body[:3] + ["..."] + body[-3:]:
            print("   ", collapse(l)[:90])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if args.check:
        return check()
    vocab = Vocab.build()
    corrector = Corrector(vocab)
    rows = []
    for d in config()["dialogues"]:
        if args.slugs and d["slug"] not in args.slugs:
            continue
        segs, notes, stats = clean_work(d, corrector)
        dest = write_work(d, segs, notes, stats)
        words = sum(len(s["text"].split()) for s in segs if s["kind"] == "paragraph")
        rows.append((d, segs, notes, stats, words))
        print(f"{d['slug']:<16} {len(segs):>5} segments {words:>7} words {len(notes):>4} notes -> {dest.relative_to(ROOT)}")
        if args.slugs:
            for s in segs[:8]:
                print("  ", s.get("label"), "|", s["text"][:160])
    if not args.slugs:
        write_report(rows, corrector, vocab)


def write_report(rows, corrector, vocab):
    c = corrector.counts
    total = sum(v for k, v in c.items())
    changed = sum(v for k, v in c.items() if k.startswith("changed"))
    lines = ["# Taylor and Sydenham (1804), vols. II to V: OCR cleaned by rule", "",
             "Written by `tools/taylor_ocr.py`. Every figure is counted from the run that wrote `texts/taylor-1804/vol2` to `vol5`. "
             "Nothing here has been proofread by a person; every paragraph and note keeps its raw OCR as `raw`.", "",
             "## Word list", "",
             "A reading of an OCR word is accepted only if it is a word in these clean texts (word tokens counted):", ""]
    lines += [f"- {k}: {v:,}" for k, v in vocab.sources.items()]
    lines += ["", "## Words", "",
              f"{total:,} words looked at. {changed:,} changed ({100 * changed / max(total, 1):.1f}%).", "",
              "| What happened | Words |", "|---|---:|"]
    lines += [f"| {k} | {v:,} |" for k, v in sorted(c.items(), key=lambda kv: -kv[1])]
    lines += ["", "Most frequent changes (OCR → reading):", ""]
    lines += [", ".join(f"{a} → {b} ({n:,})" for (a, b), n in corrector.changes.most_common(60))]
    lines += ["", "## Works", "",
              "| Work | Vol. | Lines | Translator | Paragraphs | Speeches | Words | Footnotes (signed S. / T.) | Notes placed by mark |",
              "|---|---|---|---|---:|---:|---:|---|---:|"]
    for d, segs, notes, stats, words in rows:
        paras = [s for s in segs if s["kind"] == "paragraph"]
        tr = ", ".join(sorted({s["translator"] for s in paras}))
        sS = sum(n["signed"] == "Sydenham" for n in notes)
        sT = sum(n["signed"] == "Taylor" for n in notes)
        bymark = sum(n.get("anchor") == "note mark" for n in notes)
        lines.append(f"| {d['title']} (`{d['work']}`) | {d['vol']} | {d['start']}–{d['end']} | {tr} | {len(paras):,} | "
                     f"{sum(1 for s in paras if s.get('label')):,} | {words:,} | {len(notes)} ({sS} / {sT}) | {bymark} |")
    lines += ["", "## Page structure", "", "| Rule | Count |", "|---|---:|"]
    agg = Counter()
    for _, _, _, stats, _ in rows:
        agg.update(stats)
    lines += [f"| {k} | {v:,} |" for k, v in sorted(agg.items())]
    gaps = [d for d, *_ in rows if d.get("gap")]
    if gaps:
        lines += ["", "## Gaps in the scan", ""] + [f"- {d['title']}: {d['gap']}" for d in gaps]
    lines.append("")
    REPORT.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
