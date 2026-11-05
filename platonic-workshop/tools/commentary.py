#!/usr/bin/env python3
"""Milestone 7: the commentaries on the Timaeus, read from their sources into
one JSON file each in texts/commentary/timaeus/.

This step only reads the printed books into notes, in the order printed, with
what the book itself says about where each note belongs (a page of Taylor's
translation, a line of Archer-Hind's Greek, a quoted lemma). It does not
decide the Stephanus section: that needs the library (the Greek words, and
Taylor's translation as placed by tools/align.py), and is done when the
library is built (tools/commentary_db.py).

The commentaries, and how each is read:

- Taylor (1804), vol. II: his Introduction to the Timaeus (pp. 415-459) and
  the eight "Additional Notes on the Timaeus, extracted from the Commentaries
  of Proclus" (pp. 595-658). OCR of the 1804 printing, cleaned by the rules of
  tools/taylor_ocr.py (long s, ct ligature, running heads, footnotes). Each
  Additional Note is headed by the page of Taylor's translation and the words
  it is on ("P. 474. It was generated. For this universe is visible and has a
  body, &c.").
- Proclus, The Commentaries on the Timaeus, translated by Taylor (1820), 2
  vols. Internet Archive OCR of the University of Toronto copy (no long s;
  good English, Greek poor). Proclus quotes the Timaeus a passage at a time in
  Taylor's translation (the lemma) and comments on it; the lemma is a
  paragraph in quotation marks. A paragraph is taken as a lemma only when it
  is found in Taylor's 1804 translation of the Timaeus (most of the 1820
  lemmata are the 1804 text, lightly revised): at least 15% of its three-word
  runs in one place if it opens with a quotation mark (the OCR often misreads
  the mark), half of them if not. A lemma printed over a page break is joined
  up again, and one with no comment of its own is joined to the next. Only in
  order: the
  longest run of quotations that are found and follow one another in the
  dialogue is kept, so a quotation of an earlier passage inside the
  commentary is not taken for a lemma. The commentary runs from one lemma to
  the next. What comes before the first lemma (Proclus' preface on the scope
  of the dialogue) is a note on the whole dialogue.
- Archer-Hind, The Timaeus of Plato (1888). Internet Archive OCR of the
  University of California copy, which reads both the Greek and the English
  well. Each note begins with the line number on Archer-Hind's page of Greek
  and the Greek words it is on, closed by a bracket: "4. εἰς γυναικὸς φύσιν]".
  A note without a number is on the same line as the one before. Also his
  Introduction, as a note on the whole dialogue.
- Jowett, Introduction and Analysis (1892, Project Gutenberg 1572): a note on
  the whole dialogue, a paragraph at a time.

Every note keeps the text as received ('raw') beside the cleaned text.

    python3 tools/commentary.py          # read all four, write texts/commentary/timaeus/
    python3 tools/commentary.py proclus  # one of them (taylor, proclus, archer-hind, jowett)
"""
import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import taylor_ocr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "texts" / "commentary" / "timaeus"
TAYLOR_1804_TIMAEUS = ROOT / "texts" / "taylor-1804" / "vol2" / "timaeus.json"
PROCLUS = ROOT / "sources" / "proclus-1820"
ARCHER = ROOT / "sources" / "archer-hind-1888"
JOWETT = ROOT / "sources" / "jowett-gutenberg" / "pg1572.txt"

SCHEMA = "platonic-workshop/commentary-v1"
WORK = "tlg031"


def collapse(s):
    return re.sub(r"\s+", " ", s).strip()


def nfc(s):
    return unicodedata.normalize("NFC", s)


def write(doc):
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{doc['id']}.json"
    doc["stats"] = dict(doc.get("stats", {}), notes=len(doc["notes"]))
    dest.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return dest


# ------------------------------------------------------------------ English words, for finding a lemma in a translation

EN_WORD = re.compile(r"[a-z]+")


def en_words(s):
    """Lower-case words with the spelling differences of 1804 and 1820 evened out."""
    s = s.lower().replace("æ", "ae").replace("œ", "oe")
    out = []
    for w in EN_WORD.findall(s):
        w = {"timæus": "timaeus", "timeus": "timaeus", "timaus": "timaeus"}.get(w, w)
        out.append(w)
    return out


# ------------------------------------------------------------------ Taylor (1804)

TAYLOR_INTRO = {"vol": 2, "slug": "timaeus-introduction", "title": "Introduction to the Timaeus", "start": 18315, "end": 20347,
                "translator": "Thomas Taylor", "prose": True}
TAYLOR_NOTES = {"vol": 2, "slug": "timaeus-additional-notes", "title": "Additional Notes on the Timaeus", "start": 25941, "end": 28474,
                "translator": "Thomas Taylor", "prose": True, "note_width": 97}
HEADING = re.compile(r"^P(?:age|\.)\s*(\d{3})\s*\.\s*[—-]*\s*(.*)$", re.I | re.S)
HEADING_AT = re.compile(r"(?:^|(?<=\s))P(?:age|\.)\s*\d{3}\s*\.(?=\s)", re.I)
ETC = re.compile(r"[,;]?\s*(?:&c|[lC]?\^c|Gfr|l\^c|C\^c|[A-Z]\^c|Cc)\.?(?=\s|$)")


def split_headings(paras):
    """A heading that the page layout ran into another paragraph starts a paragraph of its own."""
    out = []
    for s in paras:
        cuts = [m.start() for m in HEADING_AT.finditer(s["text"])]
        if not cuts:
            out.append(s)
            continue
        pieces = [s["text"][a:b].strip() for a, b in zip([0] + cuts, cuts + [len(s["text"])])]
        for k, t in enumerate(pieces):
            if not t:
                continue
            if k == 0 and cuts[0] > 0 and t.upper() == t:
                continue          # the title over the first note ('ADDITIONAL NOTES ON THE TIMAEUS')
            out.append(dict(s, text=t))
    return out


def taylor_corrector():
    return taylor_ocr.Corrector(taylor_ocr.Vocab.build())


def read_taylor(corrector):
    edition = "The Works of Plato, translated by Floyer Sydenham and Thomas Taylor, vol. II (London, 1804)"
    source = {"manifest_id": "taylor-1804", "file": "sources/taylor-1804/Taylor_Sydenham_v2_djvu.txt"}
    docs = []

    # The Introduction: one note on the whole dialogue per paragraph.
    segs, fnotes, stats = taylor_ocr.clean_work(TAYLOR_INTRO, corrector)
    paras = [s for s in segs if s["kind"] == "paragraph"]
    notes = []
    for k, s in enumerate(paras, 1):
        notes.append({"id": f"taylor1804-intro.{k:03d}", "kind": "introduction", "seq": k, "page": s["pages"][0],
                      "pages": s["pages"], "line": s["line"], "text": s["text"], "raw": s["raw"]})
    for k, n in enumerate(fnotes, 1):
        on = next((x for x in notes if x["line"] == next((s["line"] for s in segs if s["id"] == n.get("in")), None)), None)
        notes.append({"id": f"taylor1804-intro.f{k:02d}", "kind": "footnote", "seq": len(paras) + k, "page": n["page"],
                      "line": n["line"], "on": on["id"] if on else None, "text": n["text"], "raw": n["raw"]})
    docs.append({
        "schema": SCHEMA, "id": "taylor1804-intro", "work": WORK, "author": "Thomas Taylor",
        "label": "Taylor, Introduction (1804)", "title": "Introduction to the Timaeus", "printed": edition + ", pp. 415-459",
        "kind": "introduction", "lang": "eng", "source": dict(source, lines=[TAYLOR_INTRO["start"], TAYLOR_INTRO["end"]]),
        "proof_status": "OCR cleaned by rule",
        "anchoring": "An introduction to the whole dialogue: each paragraph is a note on the whole Timaeus. "
                     "Taylor's footnotes to it are kept with the paragraph they are printed under.",
        "notes": notes, "stats": dict(stats),
    })

    # The Additional Notes: headed by the page of the translation and the words.
    segs, fnotes, stats = taylor_ocr.clean_work(TAYLOR_NOTES, corrector)
    paras = split_headings([s for s in segs if s["kind"] == "paragraph"])
    notes, cur = [], None
    for i, s in enumerate(paras):
        m = HEADING.match(s["text"])
        if m:
            lemma = m.group(2).strip()
            if not lemma:
                continue      # 'P. 499.' alone at the foot of a page: the heading is repeated overleaf
            rest = ""
            e = ETC.search(lemma)
            if e and len(lemma[:e.start()].split()) <= 40:
                lemma, rest = lemma[:e.start()], lemma[e.end():].strip()
            elif len(lemma.split()) > 40:
                cut = lemma.find(". ") + 1
                lemma, rest = lemma[:cut], lemma[cut:].strip()
            if not rest and len(lemma.split()) < 25 and not re.search(r"(&c|c\.|[.?!])$", lemma) and i + 1 < len(paras) \
                    and len(paras[i + 1]["text"].split()) <= 4:
                lemma += " " + paras[i + 1]["text"]
                paras[i + 1]["skip"] = True
            lemma = lemma.strip(" ,;")
            cur = {"id": f"taylor1804-addnotes.{len(notes) + 1:02d}", "kind": "note", "seq": len(notes) + 1,
                   "page": s["pages"][0], "pages": list(s["pages"]), "line": s["line"],
                   "printed_ref": f"p. {m.group(1)}", "taylor_page": int(m.group(1)),
                   "lemma": lemma, "lemma_lang": "eng", "paragraphs": [rest] if rest else [], "raw": s["raw"]}
            notes.append(cur)
            continue
        if s.get("skip") or cur is None:
            continue
        cur["paragraphs"].append(s["text"])
        cur["raw"] += "\n\n" + s["raw"]
        for p in s["pages"]:
            if p not in cur["pages"]:
                cur["pages"].append(p)
    for n in notes:
        n["text"] = "\n\n".join(n.pop("paragraphs"))
    for k, f in enumerate(fnotes, 1):
        notes.append({"id": f"taylor1804-addnotes.f{k:02d}", "kind": "footnote", "seq": 100 + k, "page": f["page"],
                      "line": f["line"], "text": f["text"], "raw": f["raw"]})
    # A footnote belongs to the Additional Note printed on its page.
    for f in [n for n in notes if n["kind"] == "footnote"]:
        on = [n for n in notes if n["kind"] == "note" and n["line"] <= f["line"]]
        f["on"] = on[-1]["id"] if on else None
    docs.append({
        "schema": SCHEMA, "id": "taylor1804-addnotes", "work": WORK, "author": "Thomas Taylor, from Proclus",
        "label": "Taylor, Additional Notes from Proclus (1804)", "title": "Additional Notes on the Timaeus, extracted from the Commentaries of Proclus on that Dialogue",
        "printed": edition + ", pp. 595-658", "kind": "notes", "lang": "eng",
        "source": dict(source, lines=[TAYLOR_NOTES["start"], TAYLOR_NOTES["end"]]),
        "proof_status": "OCR cleaned by rule",
        "anchoring": "Each note names the page of Taylor's translation and quotes the words it is on. The words are found "
                     "in Taylor's translation (on that page) when the library is built; the note takes the Stephanus "
                     "section that tools/align.py computed for them, so the section is computed (≈).",
        "notes": notes, "stats": dict(stats),
    })
    return docs


# ------------------------------------------------------------------ Proclus (Taylor, 1820)

# The running heads, as the OCR reads them ('54 PROCLUS ON THE [BOOK I.', 'BOOK I.] TIMÆUS OF PLATO. 55',
# misread as '1MIOCLUS ON THE', 'TIM/KUS 01- PLATO'): a short line in capitals naming Proclus, Plato or the book.
HEAD_HINT = re.compile(r"[PF1][RHMK]?[O0]?C[LU]|ON\s*['‘]?\s*T[HI1]|OF\s+[PI1]|PLA|[\[{(]\s*[BbRrΒβ][oOοΟ]|ADDITIONAL|NOT[EKRL]S")
SIGNATURE = re.compile(r"^(?:Tim\.?\s*Plat|Yw\.)|VOL\.?\s*I", re.I)
# Where each book begins: (volume, line of its heading in the OCR file).
BOOKS = [(1, 596, "I"), (1, 8586, "II"), (1, 18667, "III"), (2, 7993, "IV"), (2, 13908, "V")]
# Where the commentary ends: Taylor's own Additional Notes, at the end of vol. 2.
PROCLUS_END = (2, 21063)
BOOK = re.compile(r"^BOOK\s+([IVX1l]+)\.?\s*$")


def is_proclus_head(s):
    if len(s) > 55 or len(s) < 6:
        return False
    letters = [c for c in s if c.isalpha()]
    if len(letters) < 6 or sum(c.isupper() for c in letters) / len(letters) < 0.6:
        return False
    return bool(HEAD_HINT.search(s.upper()))


def head_number(s):
    toks = s.split()
    for tok in (toks[0], toks[-1]):
        t = tok.strip(".,;:'\"^*")
        if t.isdigit() and 1 <= len(t) <= 3:
            return int(t)
    return None


def proclus_pages(vol):
    """[(page number or None, [(line no, line)])] split at running heads."""
    lines = (PROCLUS / f"proclusontimaeus0{vol}procuoft_djvu.txt").read_text(encoding="utf-8").split("\n")
    pages, cur, num = [], [], None
    for i, ln in enumerate(lines, 1):
        if (vol, i) >= PROCLUS_END:
            break
        s = collapse(ln)
        if is_proclus_head(s):
            pages.append((num, cur))
            cur, num = [], head_number(s)
            continue
        if len(s) < 30 and SIGNATURE.search(s):
            continue
        cur.append((i, ln))
    pages.append((num, cur))
    return pages


def proclus_blocks(vol):
    """Paragraphs: [{'text', 'raw', 'page', 'line'}], running heads removed,
    paragraphs that run over a page joined, hyphens at line ends mended."""
    out = []
    last_page = None
    for num, lines in proclus_pages(vol):
        # A page number misread by the OCR: the next page in order instead.
        if num and last_page and not (last_page < num <= last_page + 3):
            num = None
        page = num if num else (last_page + 1 if last_page else None)
        last_page = page
        block = []
        first = True

        def flush(block, first):
            if not block:
                return
            raw = "\n".join(x[1] for x in block)
            text = ""
            for _, ln in block:
                ln = collapse(ln)
                if text.endswith("-") and not text.endswith("--"):
                    text = text[:-1] + ln
                else:
                    text = (text + " " + ln).strip()
            if not text:
                return
            # A page number or a signature alone.
            if re.fullmatch(r"[\dIVXLlvx .,]{1,8}", text) or (len(text) < 20 and re.fullmatch(r"VOL\.?.*", text, re.I)):
                return
            prev = out[-1] if out else None
            # Runs on from the page before: the last paragraph did not end a sentence.
            if first and prev and not re.search(r"[.?!”\"’:]$", prev["text"]) and text[:1].islower():
                prev["text"] = (prev["text"][:-1] + text) if prev["text"].endswith("-") else prev["text"] + " " + text
                prev["raw"] += "\n" + raw
                return
            out.append({"text": text, "raw": raw, "page": page, "line": block[0][0], "vol": vol})

        for no, ln in lines:
            if ln.strip():
                block.append((no, ln))
            else:
                flush(block, first)
                if block:
                    first = False
                block = []
        flush(block, first)
    return out


QUOTE_OPEN = "“\"‘'"


class TaylorText:
    """Taylor's 1804 translation of the Timaeus as one stream of words, for
    finding where a quotation from it comes from."""

    def __init__(self):
        d = json.loads(TAYLOR_1804_TIMAEUS.read_text(encoding="utf-8"))
        self.words = []
        self.seg_of = []   # word index -> (segment id, word number within segment)
        for s in d["segments"]:
            if s["kind"] != "paragraph":
                continue
            ws = en_words(s["text"])
            for k, w in enumerate(ws):
                self.words.append(w)
                self.seg_of.append((s["id"], k))
        self.index = {3: {}, 2: {}}
        for n in (3, 2):
            for i in range(len(self.words) - n + 1):
                self.index[n].setdefault(tuple(self.words[i:i + n]), []).append(i)

    def find(self, text, min_share=0.4, pages=None, page_of=None, n=3):
        """(start word, end word, share of the quotation's n-word runs found
        in that place) for the best place, or None. With pages (and page_of,
        the printed page of each word), only on those pages."""
        ws = en_words(text)
        if len(ws) < 4:
            return None
        index = self.index[n]
        grams = [tuple(ws[i:i + n]) for i in range(len(ws) - n + 1)]
        ok = (lambda pos: page_of[pos] in pages) if pages else (lambda pos: True)
        votes = Counter()
        for gi, g in enumerate(grams):
            for pos in index.get(g, ()):
                if ok(pos):
                    votes[(pos - gi) // 8] += 1
        if not votes:
            return None
        (bucket, n), = votes.most_common(1)
        base = bucket * 8
        lo, hi = base - 12, base + len(ws) + 20
        hits = [(gi, pos) for gi, g in enumerate(grams) for pos in index.get(g, ()) if lo <= pos <= hi and ok(pos)]
        if not hits:
            return None
        share = len({gi for gi, _ in hits}) / len(grams)
        if share < min_share:
            return None
        start = min(p for _, p in hits)
        end = max(p for _, p in hits) + n - 1
        return start, end, share


def longest_chain(cands):
    """cands: [(index, start)] in printed order -> the indexes of the longest
    run whose starts increase."""
    n = len(cands)
    best, prev = [1] * n, [-1] * n
    for i in range(n):
        for j in range(i):
            if cands[j][1] < cands[i][1] and best[j] + 1 > best[i]:
                best[i], prev[i] = best[j] + 1, j
    if not n:
        return set()
    i = max(range(n), key=lambda k: best[k])
    keep = set()
    while i >= 0:
        keep.add(cands[i][0])
        i = prev[i]
    return keep


def strip_quotes(t):
    t = t.strip()
    t = re.sub(r"^[“\"‘'\s]+", "", t)
    t = re.sub(r"[”\"’'\s]+([.,;:]?)\s*$", r"\1", t)
    return t


def starts_quoted(text):
    t = text.strip()
    return t[:1] in QUOTE_OPEN + "*«" or t[:2] in ("**", "‘ ", "“ ")


def ends_quoted(text):
    return text.rstrip(" .,")[-1:] in "”\"’"


def read_proclus():
    taylor = TaylorText()
    paras = proclus_blocks(1) + proclus_blocks(2)
    # Where the commentary begins: the heading of Book I in vol. 1.
    start = next(i for i, p in enumerate(paras) if (p["vol"], p["line"]) >= BOOKS[0][:2])
    paras = paras[start:]
    # A lemma: a paragraph that opens with a quotation mark and is found in
    # Taylor's translation (at least 15% of its three-word runs in one place),
    # or any paragraph of which half the three-word runs are found there. A
    # lemma printed over a page break is two paragraphs: the second is joined
    # to the first when it goes on where the first stopped.
    found = []
    for i, p in enumerate(paras):
        if len(p["text"].split()) < 6:
            continue
        hit = taylor.find(strip_quotes(p["text"]), 0.15 if starts_quoted(p["text"]) else 0.5)
        if not hit:
            continue
        if found and found[-1][-1] == i - 1 and not ends_quoted(paras[i - 1]["text"]) and 0 <= hit[0] - found[-1][1][1] <= 30:
            j, (a, b, sh), members = found[-1][0], found[-1][1], found[-1][2]
            found[-1] = (j, (a, hit[1], max(sh, hit[2])), members + [i], i)
            continue
        found.append((i, hit, [i], i))
    keep = longest_chain([(f[0], f[1][0]) for f in found])
    lemma_at = {f[0]: f for f in found if f[0] in keep}
    member = {m: f[0] for f in lemma_at.values() for m in f[2]}
    stats = Counter({"paragraphs": len(paras), "found in Taylor 1804": len(found), "lemmata (in order)": len(lemma_at),
                     "lemmata over a page break": sum(len(f[2]) > 1 for f in lemma_at.values())})
    notes = []
    pre = {"id": "proclus1820.000", "kind": "introduction", "seq": 0, "vol": 1, "page": paras[0]["page"] or 1, "line": paras[0]["line"],
           "paragraphs": [], "raw": ""}
    cur = pre
    book = "I"
    for i, p in enumerate(paras):
        for v, ln, b in BOOKS:
            if (p["vol"], p["line"]) >= (v, ln):
                book = b
        if BOOK.match(p["text"]) or re.fullmatch(r"BOOK\W.{0,6}", p["text"]):
            continue
        if i in member and member[i] != i:
            continue
        if i in lemma_at:
            (a, b, share), members = lemma_at[i][1], lemma_at[i][2]
            text = " ".join(paras[k]["text"] for k in members)
            cur = {"id": f"proclus1820.{len(notes) + 1:03d}", "kind": "note", "seq": len(notes) + 1, "vol": p["vol"],
                   "page": p["page"], "line": p["line"], "book": book, "lemma": strip_quotes(text), "lemma_lang": "eng",
                   "lemma_raw": "\n".join(paras[k]["raw"] for k in members),
                   "found_in_taylor": {"segment": taylor.seg_of[a][0], "word": taylor.seg_of[a][1],
                                       "end_segment": taylor.seg_of[min(b, len(taylor.seg_of) - 1)][0],
                                       "end_word": taylor.seg_of[min(b, len(taylor.seg_of) - 1)][1],
                                       "share": round(share, 2)},
                   "paragraphs": [], "raw": ""}
            notes.append(cur)
            continue
        cur["paragraphs"].append(p["text"])
        cur["raw"] += ("\n\n" if cur["raw"] else "") + p["raw"]
        cur.setdefault("last_page", p["page"])
        cur["last_page"] = p["page"]
    for n in [pre] + notes:
        n["text"] = "\n\n".join(n.pop("paragraphs"))
    # A lemma with no comment of its own is the first part of the next one
    # (Proclus quotes a long passage in two pieces and comments on both).
    merged = []
    for n in notes:
        if merged and not merged[-1]["text"].strip():
            prev = merged.pop()
            n = dict(n, lemma=prev["lemma"] + " " + n["lemma"], lemma_raw=prev["lemma_raw"] + "\n\n" + n["lemma_raw"],
                     page=prev["page"], line=prev["line"],
                     found_in_taylor=dict(n["found_in_taylor"], segment=prev["found_in_taylor"]["segment"],
                                          word=prev["found_in_taylor"]["word"]))
            stats["lemmata in two pieces, joined"] += 1
        merged.append(n)
    for k, n in enumerate(merged, 1):
        n["id"], n["seq"] = f"proclus1820.{k:03d}", k
    notes = [pre] + merged
    return {
        "schema": SCHEMA, "id": "proclus1820", "work": WORK, "author": "Proclus, translated by Thomas Taylor",
        "label": "Proclus, tr. Taylor (1820)",
        "title": "The Commentaries of Proclus on the Timaeus of Plato, in five books, translated from the Greek by Thomas Taylor",
        "printed": "2 vols, London, 1820", "kind": "commentary", "lang": "eng",
        "source": {"manifest_id": "proclus-1820", "file": "sources/proclus-1820/proclusontimaeus0{1,2}procuoft_djvu.txt"},
        "proof_status": "OCR as received",
        "anchoring": "Proclus comments on the Timaeus a passage at a time, quoting it in Taylor's translation. Each quotation "
                     "was found in Taylor's 1804 translation of the Timaeus (three-word runs in common); only quotations "
                     "that follow one another in the dialogue are taken as lemmata. The note takes the Stephanus sections "
                     "tools/align.py computed for those words of Taylor's translation, so its place is computed (≈). "
                     "Proclus' preface, before the first lemma, is a note on the whole dialogue.",
        "notes": notes, "stats": dict(stats),
    }


# ------------------------------------------------------------------ Archer-Hind (1888)

ARCHER_FILE = ARCHER / "timaeusofplato00platiala_djvu.txt"
GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")
LATIN = re.compile(r"[A-Za-z]")
NOTE_HEAD = re.compile(r"^(?:(\d{1,2})[.,]\s+)?([^\]\[]{1,90}?)\s?[\])}]\s*(.*)$", re.S)
STEPH_HEAD = re.compile(r"(?:\[|^)\s*(\d{2})\s*([A-EΑΒΓΔΕaеabcdeoΟὉ])\s*[—=\-–]")


def greek_share(s):
    g, l = len(GREEK.findall(s)), len(LATIN.findall(s))
    return g / (g + l) if g + l else 0


def archer_lines():
    return ARCHER_FILE.read_text(encoding="utf-8").split("\n")


def read_archer():
    lines = archer_lines()
    # The commentary runs from the first page of the text (17 A) to the end of the notes on 92 C.
    first = next(i for i, l in enumerate(lines) if l.strip().startswith("ΣΩΚΡΑΤΗΣ, ΚΡΙΤΙΑΣ"))
    last = next(i for i, l in enumerate(lines) if i > first + 20000 and re.match(r"\s*APPENDIX|\s*INDEX", l)) \
        if any(re.match(r"\s*APPENDIX|\s*INDEX", l) for l in lines[first + 20000:]) else len(lines)
    blocks, cur = [], []
    for i in range(first, last):
        if lines[i].strip():
            cur.append((i + 1, lines[i]))
        elif cur:
            blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)
    notes = []
    stats = Counter()
    steph = None      # the last Stephanus reference printed in a page head
    for b in blocks:
        text = ""
        for _, ln in b:
            ln = collapse(ln)
            if text.endswith("-") and not text.endswith("--"):
                text = text[:-1] + ln
            else:
                text = (text + " " + ln).strip()
        h = STEPH_HEAD.search(text) if len(text) < 40 else None
        if h:
            steph = f"{h.group(1)}{'abcde'['ΑΒΓΔΕ'.find(h.group(2).upper()) if h.group(2).upper() in 'ΑΒΓΔΕ' else 'ABCDE'.find(h.group(2).upper().replace('Ο', 'D').replace('Ὁ', 'D'))]}" \
                if h.group(2).upper() in "ABCDEΑΒΓΔΕΟὉ" else steph
        m = NOTE_HEAD.match(text)
        if m and greek_share(m.group(2)) > 0.5 and len(m.group(3)) > 0 and greek_share(m.group(3)[:200]) < 0.6:
            num = int(m.group(1)) if m.group(1) else (notes[-1]["printed_line"] if notes else None)
            lemma = nfc(re.sub(r"^[IlΙ1]\.\s+", "", m.group(2)).strip(" .,"))
            notes.append({"id": f"archerhind1888.{len(notes) + 1:04d}", "kind": "note", "seq": len(notes) + 1,
                          "line": b[0][0], "printed_line": num, "page_steph": steph, "lemma": lemma, "lemma_lang": "grc",
                          "text": nfc(m.group(3).strip()), "raw": "\n".join(x[1] for x in b)})
            stats["notes"] += 1
            continue
        # A continuation of the last note: English prose, not the Greek text, not the apparatus.
        if notes and greek_share(text) < 0.5 and len(LATIN.findall(text)) > 25 and not re.match(r"^\d+\s+\S+\s?:", text):
            if "ΠΛΑΤΩΝΟΣ" in text or "ΤΙΜΑΙΟΣ" in text:
                continue
            notes[-1]["text"] += ("" if notes[-1]["text"].endswith("-") else " ") + nfc(text)
            notes[-1]["raw"] += "\n" + "\n".join(x[1] for x in b)
            stats["blocks run on"] += 1
        else:
            stats["blocks of text or apparatus left out"] += 1
    for n in notes:
        n["text"] = re.sub(r"(\w)- (\w)", r"\1\2", n["text"])
    # The Introduction: from its heading to the text.
    intro_start = next(i for i, l in enumerate(lines) if l.strip() == "INTRODUCTION.")
    intro = []
    cur = []
    for i in range(intro_start + 1, first):
        s = collapse(lines[i])
        if not s:
            if cur:
                intro.append(cur)
                cur = []
            continue
        if re.fullmatch(r"(?:\d+\.?\s+)?INTRODUCTION\.?(?:\s+\d+)?", s) or re.fullmatch(r"[\divxl.]{1,6}", s):
            continue
        cur.append((i + 1, s))
    if cur:
        intro.append(cur)
    k = 0
    intro_notes = []
    for blk in intro:
        t = ""
        for _, s in blk:
            t = (t[:-1] + s) if t.endswith("-") and not t.endswith("--") else (t + " " + s).strip()
        if len(t) < 40 or greek_share(t) > 0.5:
            continue
        # A paragraph that runs over a page: no capital at the start.
        if intro_notes and t[:1].islower():
            intro_notes[-1]["text"] += " " + nfc(t)
            intro_notes[-1]["raw"] += "\n" + "\n".join(s for _, s in blk)
            continue
        k += 1
        intro_notes.append({"id": f"archerhind1888-intro.{k:03d}", "kind": "introduction", "seq": k, "line": blk[0][0],
                            "text": nfc(t), "raw": "\n".join(s for _, s in blk)})
    base = {"schema": SCHEMA, "work": WORK, "author": "R. D. Archer-Hind", "lang": "eng",
            "printed": "The Timaeus of Plato, edited with introduction and notes by R. D. Archer-Hind (London: Macmillan, 1888)",
            "source": {"manifest_id": "archer-hind-1888", "file": "sources/archer-hind-1888/timaeusofplato00platiala_djvu.txt"},
            "proof_status": "OCR as received"}
    return [
        dict(base, id="archerhind1888", label="Archer-Hind (1888)", title="Notes on the Timaeus", kind="notes",
             anchoring="Each note names the line of Archer-Hind's page of Greek and quotes the Greek words it is on. Those "
                       "words are found in Burnet's Greek when the library is built, searching forward from the place "
                       "of the note before; the note is then on those words, at their section as printed. A note whose "
                       "words are not found takes the section of the note before it and is marked as such.",
             notes=notes, stats=dict(stats, lines=[first + 1, last])),
        dict(base, id="archerhind1888-intro", label="Archer-Hind, Introduction (1888)", title="Introduction", kind="introduction",
             anchoring="An introduction to the whole dialogue: each paragraph is a note on the whole Timaeus.",
             notes=intro_notes, stats={"paragraphs": len(intro_notes)}),
    ]


# ------------------------------------------------------------------ Jowett (1892)

def read_jowett():
    t = JOWETT.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    a = t.index("INTRODUCTION AND ANALYSIS.")
    b = t.index("PERSONS OF THE DIALOGUE")
    body = t[a + len("INTRODUCTION AND ANALYSIS."):b]
    body = body[:body.rstrip().rfind("\n")]          # the heading 'TIMAEUS.' before the persons
    paras = [collapse(p) for p in re.split(r"\n\s*\n", body)]
    paras = [p for p in paras if p and not re.fullmatch(r"(?:Section\s+)?[IVXL]+\.?|TIMAEUS\.?", p)]
    notes = [{"id": f"jowett1892-intro.{k:03d}", "kind": "introduction", "seq": k, "text": p, "raw": p}
             for k, p in enumerate(paras, 1)]
    return {
        "schema": SCHEMA, "id": "jowett1892-intro", "work": WORK, "author": "Benjamin Jowett",
        "label": "Jowett, Introduction and Analysis (1892)", "title": "Introduction and Analysis",
        "printed": "The Dialogues of Plato, 3rd ed. (Oxford, 1892), vol. III; Project Gutenberg 1572",
        "kind": "introduction", "lang": "eng",
        "source": {"manifest_id": "jowett-timaeus", "file": "sources/jowett-gutenberg/pg1572.txt"},
        "proof_status": "clean source text (Project Gutenberg)",
        "anchoring": "An introduction to the whole dialogue: each paragraph is a note on the whole Timaeus.",
        "notes": notes, "stats": {"paragraphs": len(notes)},
    }


# ------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("which", nargs="*", default=["taylor", "proclus", "archer-hind", "jowett"])
    args = ap.parse_args()
    docs = []
    if "taylor" in args.which:
        docs += read_taylor(taylor_corrector())
    if "proclus" in args.which:
        docs.append(read_proclus())
    if "archer-hind" in args.which:
        docs += read_archer()
    if "jowett" in args.which:
        docs.append(read_jowett())
    for d in docs:
        dest = write(d)
        print(f"{d['id']:<22} {len(d['notes']):>5} notes  {sum(len(n['text'].split()) for n in d['notes']):>8} words -> {dest.relative_to(ROOT)}")
        print("   ", {k: v for k, v in d["stats"].items() if k != "lines"})


if __name__ == "__main__":
    main()
