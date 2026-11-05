#!/usr/bin/env python3
"""Milestone 11: the commentaries on the rest of Plato, read from their
sources into texts/commentary/<dialogue>/, the same way milestone 7 read the
Timaeus commentaries (tools/commentary.py).

This step only reads each printed book into notes, in the order printed, with
what the book says about where each note belongs: the Stephanus page, letter
and line printed at its head, or the Greek words it quotes. The Stephanus
section is decided when the library is built (tools/commentary_db.py), from
Burnet's Greek.

The books, and how each is read (all Internet Archive OCR, kept as received in
sources/<folder>/, except Jowett, which is Project Gutenberg's clean text):

Notes headed by a Stephanus reference ("steph"). Each note begins at the start
of a line with the reference of the passage it is on, then the Greek words
(the lemma) and the note:

    Adam, Republic (1902)        "533 C 14 ὀνειρώττουσι κτλ. Krohn ..."
                                 or only the line ("27 ὡσαύτως: ...") on the
                                 same section as the note before.
    England, Laws (1921)         "659 a 1. τὸν διαφέροντα : whereas ..." or
                                 "a 4. ..." on the page of the note before.
    Burnet, Phaedo (1911)        "b 6 τῶν ἐπιχωρίων, 'of native Athenians.'",
                                 the page from the running head ("NOTES 59").
    Bury, Symposium (1909)       "176 C ἐξαιρῶ λόγον: ..."

    A line is taken as a note's head only when the reference is followed by a
    line number, or by Greek words; only when its page is a page of the
    dialogue; and only when it is not before the note before, nor more than
    four pages after it (so a reference cited in the run of a note is not
    taken for a head). A letter printed without its page, lower than the letter
    before, is on the next page: the page is then counted, not printed, and the
    note says so.

Notes headed by the Greek words alone ("bracket"). As in Archer-Hind's
Timaeus: "4. κατὰ τὰς αὐτῶν ὁμοιότητας] 'according to ...'", the number being
the line of his page of Greek. Placed when the library is built by finding the
words in Burnet's Greek (tools/commentary_db.py, place_greek_lemmata).

    Archer-Hind, Phaedo (1883)
    Campbell, Theaetetus (2nd ed., 1883)
    Campbell, Sophist and Statesman (1867)

Introductions on the whole dialogue ("jowett"): Jowett's Introduction (and
Analysis) to each dialogue he translated (The Dialogues of Plato, 3rd ed.,
1892; the Republic, 3rd ed., 1888), from the Project Gutenberg texts already in
sources/jowett-gutenberg/. A note on the whole dialogue per paragraph. (The
Timaeus Introduction was read in milestone 7.)

Every note keeps the OCR as received ('raw') beside the text. Nothing is
corrected by hand, and nothing is placed by its meaning.

    python3 tools/commentary_corpus.py fetch     # download the OCR (about 15 MB)
    python3 tools/commentary_corpus.py           # read them all into texts/commentary/
    python3 tools/commentary_corpus.py adam1902  # one of them
"""
import argparse
import hashlib
import json
import re
import sys
import time
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import commentary  # noqa: E402
from fetch_commentaries import fetch  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "sources"
OUT = ROOT / "texts" / "commentary"
SCHEMA = commentary.SCHEMA

# Folder of texts/commentary/ for each work (the names milestones 9 and 10 used).
DIRS = {"tlg023": "gorgias", "tlg004": "phaedo", "tlg006": "theaetetus", "tlg007": "sophist", "tlg008": "statesman", "tlg011": "symposium",
        "tlg030": "republic", "tlg034": "laws"}

# Stephanus pages of each work, from the first to the last (Burnet).
PAGES = {"tlg004": (57, 118), "tlg006": (142, 210), "tlg007": (216, 268), "tlg008": (257, 311), "tlg011": (172, 223),
         "tlg030": (327, 621), "tlg034": (624, 969), "tlg023": (447, 527)}

BOOKS = [
    {"id": "adam1902", "style": "steph", "folder": "adam-1902", "author": "James Adam", "label": "Adam (1902)",
     "title": "Commentary on the Republic",
     "printed": "The Republic of Plato, edited with critical notes, commentary and appendices by James Adam, "
                "2 vols. (Cambridge: University Press, 1902)",
     "items": ["republic01platuoft", "republic02platuoft"],
     "copy": "the University of Toronto copy",
     "parts": [{"work": "tlg030", "item": 0, "from": None, "to": None}, {"work": "tlg030", "item": 1, "from": None, "to": None}],
     "line_only": True, "page_text": True,
     "ocr_note": "Vol. I's OCR reads Adam's Greek in Latin letters, so its notes are placed by the reference printed "
                 "at their head only; vol. II reads the Greek well."},
    {"id": "england1921", "style": "steph", "folder": "england-1921", "author": "E. B. England", "label": "England (1921)",
     "title": "Notes on the Laws",
     "printed": "The Laws of Plato, the text edited with introduction, notes, etc. by E. B. England, 2 vols. "
                "(Manchester: University Press, 1921)",
     "items": ["thelawsofplatoth01platuoft", "lawsofplatotexte02platuoft"],
     "copy": "the University of Toronto copy",
     "parts": [{"work": "tlg034", "item": 0, "from": r"^NOTES\s*$", "skip": 1, "to": None},
               {"work": "tlg034", "item": 1, "from": r"^BOOK VII\s*$", "skip": 1, "to": None}]},
    {"id": "burnet1911", "style": "steph", "folder": "burnet-1911", "author": "John Burnet", "label": "Burnet (1911)",
     "title": "Notes on the Phaedo",
     "printed": "Plato's Phaedo, edited with introduction and notes by John Burnet (Oxford: Clarendon Press, 1911)",
     "items": ["cu31924026679484"], "copy": "the Cornell University copy",
     "parts": [{"work": "tlg004", "item": 0, "from": r"^NOTES\s*$", "to": r"^INDEX"}],
     "running": r"^(?:NOTES\.?\s+(\d{2,3})\.?|(\d{2,3})\s+NOTES\.?)\s*$"},
    {"id": "bury1909", "style": "steph", "folder": "bury-1909", "author": "R. G. Bury", "label": "Bury, Symposium (1909)",
     "title": "Notes on the Symposium",
     "printed": "The Symposium of Plato, edited with introduction, critical notes and commentary by R. G. Bury "
                "(Cambridge: W. Heffer and Sons, 1909)",
     "items": ["cu31924073426151"], "copy": "the Cornell University copy",
     "parts": [{"work": "tlg011", "item": 0, "from": r"^ΠΛΑΤΩΝΟΣ ZYMMTTIOSION", "to": r"^INDEX"}], "page_text": True},
    {"id": "jowettcampbell1894", "style": "bracket", "folder": "jowett-campbell-1894", "author": "B. Jowett and L. Campbell",
     "label": "Jowett and Campbell (1894)", "title": "Notes on the Republic",
     "printed": "Plato's Republic, the Greek text, edited with notes and essays by B. Jowett and Lewis Campbell, vol. III, "
                "Notes (Oxford: Clarendon Press, 1894)",
     "items": ["republicgreektex03platuoft"], "copy": "the University of Toronto copy",
     "parts": [{"work": "tlg030", "item": 0, "from": r"^BOOK ΤῈ", "to": r"^\s*INDEX"}]},
    {"id": "lodge1896", "style": "colon", "folder": "lodge-1896", "author": "Gonzalez Lodge", "label": "Lodge, Gorgias (1896)",
     "title": "Notes on the Gorgias",
     "printed": "Plato, Gorgias, edited on the basis of the Deuschle-Cron edition by Gonzalez Lodge (Boston: Ginn, 1896)",
     "items": ["gorgiasss00platuoft"], "copy": "the University of Toronto copy",
     "parts": [{"work": "tlg023", "item": 0, "from": None, "to": r"^\s*(?:APPENDIX|INDEX)"}]},
    {"id": "archerhind1883", "style": "bracket", "folder": "archer-hind-1883", "author": "R. D. Archer-Hind",
     "label": "Archer-Hind, Phaedo (1883)", "title": "Notes on the Phaedo",
     "printed": "The Phaedo of Plato, edited with introduction, notes and appendices by R. D. Archer-Hind "
                "(London: Macmillan, 1883)",
     "items": ["cu31924026679435"], "copy": "the Cornell University copy",
     "parts": [{"work": "tlg004", "item": 0, "from": r"^ΦΑΙΔΩΝ\s*$", "to": r"^(?:APPENDIX|INDEX)"}]},
    {"id": "campbell1883", "style": "bracket", "folder": "campbell-1883", "author": "Lewis Campbell",
     "label": "Campbell, Theaetetus (1883)", "title": "Notes on the Theaetetus",
     "printed": "The Theaetetus of Plato, with a revised text and English notes by Lewis Campbell, 2nd ed. "
                "(Oxford: Clarendon Press, 1883)",
     "items": ["thetetusofplatow00plat"], "copy": "the Internet Archive copy",
     "parts": [{"work": "tlg006", "item": 0, "from": r"^\.?\s*ΘΕΑΙΤΗΤΟΣ\.?\s*$", "to": r"^\s*(?:APPENDIX|INDEX)"}]},
    {"id": "campbell1867", "style": "bracket", "folder": "campbell-1867", "author": "Lewis Campbell",
     "label": "Campbell, Sophist and Statesman (1867)", "title": "Notes",
     "printed": "The Sophistes and Politicus of Plato, with a revised text and English notes by Lewis Campbell "
                "(Oxford: Clarendon Press, 1867)",
     "items": ["sophistespolitic00plat"], "copy": "the Internet Archive copy",
     "parts": [{"work": "tlg007", "item": 0, "from": r"^ΣΟΦΙΣΤΗΣ\.?\s*\d*\s*$", "to": r"^\s*ΠΟΛΙΤΙΚΟΣ\.?\s*\d*\s*$"},
               {"work": "tlg008", "item": 0, "from": r"^\s*ΠΟΛΙΤΙΚΟΣ\.?\s*\d*\s*$", "to": r"^\s*(?:APPENDIX|INDEX)"}]},
]
BY_ID = {b["id"]: b for b in BOOKS}

# Looked for on the Internet Archive (advanced search, 5 November 2026) and not imported, with the reason.
NOT_IMPORTED = [
    "Thompson, Gorgias (1871; gorgiaswithengli00platuoft) and Phaedrus (1868; phaedrusofplato00plat): the only copies "
    "found, and their OCR reads all the Greek in Latin letters ('éx tpirwy' for ἐκ τρίτων), lemmata and text alike.",
    "Adam, Republic, the 1909 reprint (republicplat01plat, republicplat02plat): the 1902 printing is used; vol. I of the "
    "reprint reads the Greek no better.",
    "Archer-Hind, Phaedo, other copies (platonosphaidon00plat, phaedofoplato00platuoft): their OCR breaks the notes; the "
    "Cornell copy is used.",
    "Bury, Philebus (1897; philebus00plat_0, philebusofplato00plat_0): the OCR runs the two columns of notes into each "
    "other line by line, so the notes cannot be separated.",
    "Burnet, Euthyphro, Apology and Crito (1924): only lending-library scans, with no OCR text to download.",
    "England, Laws, the Digital Library of India copy (dli.ernet.18445): the Toronto copy is used.",
    "Adam, Euthyphro (1890; euthyphroneuthyp00platuoft): the OCR reads the English of the notes in Greek letters.",
    "Adam, Crito (1888; critowithintrod00platuoft) and Tatham, Laches (1896; lachesofplato00tath): the OCR reads none of "
    "the Greek as Greek.",
    "Stock, Meno (1887; menostoc00platuoft): the Internet Archive has no OCR text for it.",
]

# Found on the Internet Archive with Greek the OCR reads, and not yet read into notes: the next to import.
FOUND_NOT_YET_READ = [
    "Riddell, The Apology of Plato, with a Digest of Platonic Idioms (1867; apologyofplatowi00platuoft)",
    "Badham, Philebus (2nd ed., 1878; philebuswirevenl00platuoft): lemmata in square brackets",
    "Poste, Philebus (1860; thephilebusofpl00platuoft)",
    "J. and A. M. Adam, Protagoras (1893; protagoraswithin00platuoft)",
    "Sauppe, Protagoras, tr. Towle (1889; protagoraswithth00platuoft)",
    "Dyer and Seymour, Apology and Crito (1908; apolsocrate00platuoft)",
]

GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")
LATIN = re.compile(r"[A-Za-z]")


def greek_share(s):
    g, l = len(GREEK.findall(s)), len(LATIN.findall(s))
    return g / (g + l) if g + l else 0


def collapse(s):
    return re.sub(r"\s+", " ", s).strip()


# ------------------------------------------------------------------ fetching

def fetch_all(which=None):
    for b in BOOKS:
        if which and b["id"] not in which:
            continue
        dest = SOURCES / b["folder"]
        dest.mkdir(parents=True, exist_ok=True)
        rec_path = dest / "fetched.json"
        rec = json.loads(rec_path.read_text()) if rec_path.exists() else {}
        for ident in b["items"]:
            for kind, url in (("text", f"https://archive.org/download/{ident}/{ident}_djvu.txt"),
                              ("metadata", f"https://archive.org/metadata/{ident}/metadata")):
                name = f"{ident}_djvu.txt" if kind == "text" else f"{ident}_metadata.json"
                if (dest / name).exists() and name in rec:
                    continue
                status, ctype, body = fetch(url)
                (dest / name).write_bytes(body)
                rec[name] = {"url": url, "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
                             "http_status": status, "content_type": ctype, "bytes": len(body),
                             "sha256": hashlib.sha256(body).hexdigest()}
                print(f"{b['folder']}/{name}: {len(body):,} bytes")
                time.sleep(1)
        rec_path.write_text(json.dumps(rec, indent=2) + "\n")


def book_lines(b, item):
    return (SOURCES / b["folder"] / f"{b['items'][item]}_djvu.txt").read_text(encoding="utf-8").split("\n")


def part_range(lines, part):
    lo = 0
    if part.get("from"):
        hits = [i for i, l in enumerate(lines) if re.match(part["from"], l)]
        if not hits:
            raise SystemExit(f"start {part['from']!r} not found")
        lo = hits[part.get("skip", 0)] + 1 if len(hits) > part.get("skip", 0) else hits[-1] + 1
    hi = len(lines)
    if part.get("to"):
        ends = [i for i, l in enumerate(lines) if i > lo + 200 and re.match(part["to"], l)]
        if ends:
            hi = ends[0]
    return lo, hi


# ------------------------------------------------------------------ notes headed by a Stephanus reference

# The section letter as the OCR reads it: Greek capitals for Latin ones, € for e, ¢ for c. ἃ is read for
# both a and d, Ὁ for both b and d; each is taken as whichever is not before the letter before.
LETTER = {"a": "a", "b": "b", "c": "c", "d": "d", "e": "e", "ἃ": "ad", "€": "e", "¢": "c", "Ο": "d",
          "Β": "b", "Α": "a", "Ε": "e", "Δ": "d", "Ὁ": "bd"}
HEAD = re.compile(r"^\s*(?P<page>\d{2,3})?\s?(?P<let>[a-eA-EἃὉΟΒΑΕΔ€¢])\s?(?P<line>\d{1,2})?(?P<ff>\s?ff\.?)?"
                  r"(?P<sep>[.,]?)(?:\s+(?P<rest>\S.*))?$")
LINE_ONLY = re.compile(r"^\s*(?P<line>\d{1,2})\s+(?P<rest>\S.*)$")
JUNK = re.compile(r"^\s*(?:[\divxlcIVXLC.]{1,6}|NOTES\.?.{0,6}|[A-Z .,]{1,40}\d*\.?|.{0,3})\s*$")
BREAK = re.compile(r"^\s*(?:APPENDIX|APPENDICES|INDEX|ADDENDA)\b")
# A running head over a page of Greek text (Adam, Bury): '56 ΠΛΑΤΩΝΟΣ [351 D', 'ΠΟΛΙΤΕΙΑΣ ς 491 B'.
GREEK_PAGE = re.compile(r"ΠΛΑΤΩΝΟΣ|TAATQNOS|IAATQNOS|ΠΟΛΙΤΕΙΑ|IIOAITEIA|ΣΥΜΠΟΣΙΟΝ|^\[?\s*\d{3}\s?[A-EΑΒΓΔΕ]\]?\s*$")
STOP = {"the", "of", "and", "is", "that", "which", "with", "for", "as", "in", "by", "not", "be", "it", "this", "see",
        "cf.", "are", "was", "but", "or", "to", "we", "a", "an", "here", "his", "has", "on", "so", "he", "may"}
SIGLA = re.compile(r"\b(?:del|secl|om|codd|corr|add|cj|vulg|Bt|Sz|Bdhm|Herm|Stallb|Schanz)\.|\b[BTW]{2,3}\b|J\.-U\.")


def english(s):
    ws = s.split()
    return ws and sum(w.lower().strip(",;:") in STOP for w in ws) / len(ws)


def letter_of(raw, cur_idx):
    """The section letter, given the letter before (an index, or -1)."""
    c = LETTER.get(raw.lower() if raw in "ABCDE" else raw)
    if not c:
        return None
    if len(c) == 1:
        return c
    ok = [x for x in c if "abcde".index(x) >= cur_idx]
    return ok[0] if ok else c[0]


def read_steph(b):
    notes = []
    stats = Counter()
    for part in b["parts"]:
        lines = book_lines(b, part["item"])
        lo, hi = part_range(lines, part)
        first_page, last_page = PAGES[part["work"]]
        pages = range(first_page, last_page + 1)
        cur = None          # (page, letter index, how the page is known)
        cur_line = 0
        running = re.compile(b["running"]) if b.get("running") else None
        note = None
        in_text = False     # on a page of Greek text or apparatus, between notes (Adam, Bury)
        last_head = lo      # where the last head was taken; the longer since, the further ahead the next may be
        i = lo
        while i < hi:
            raw = lines[i]
            s = raw.strip()
            i += 1
            if not s:
                continue
            if BREAK.match(s):
                note = None
                stats["appendix or index: notes stop"] += 1
                continue
            if running:
                m = running.match(s)
                if m:
                    p = int(next(g for g in m.groups() if g))
                    if p in pages and (cur is None or cur[0] - 6 <= p <= cur[0] + 3) and (cur is None or p != cur[0]):
                        if cur is None or p > cur[0] or cur[2] != "printed":
                            cur = (p, -1, "running head")
                    stats["running heads"] += 1
                    continue
            if b.get("page_text") and GREEK_PAGE.search(s) and len(s) < 40:
                in_text = True
                stats["running heads over the Greek"] += 1
                continue
            head = None
            m = HEAD.match(s)
            if m:
                page = int(m["page"]) if m["page"] else None
                let = letter_of(m["let"], cur[1] if cur and (page is None or page == cur[0]) else -1)
                line = int(m["line"]) if m["line"] else None
                rest = m["rest"] or ""
                if page in pages and let and not rest and line is None:
                    # A page and letter on a line of their own (England): where the notes now are. (Over a
                    # page of Greek text, as in Adam, it is the margin of the text, and says nothing of the notes.)
                    back = 0 if cur is None or cur[2] == "printed" else 6
                    if not b.get("page_text") and (cur is None or cur[0] - back <= page <= cur[0] + 4):
                        cur = (page, "abcde".index(let), "printed")
                        cur_line = 0
                    stats["section markers"] += 1
                    continue
                skip_next = False
                if not rest and i < hi:
                    # The reference on a line of its own; the lemma on the next.
                    j = i
                    while j < hi and not lines[j].strip():
                        j += 1
                    rest = lines[j].strip() if j < hi else ""
                    skip_next = True
                ok = (let and rest and not rest[:1].isdigit() and m["sep"] != ","
                      and (line is not None or (page is not None and greek_share(rest[:20]) >= 0.5))
                      and (page is not None or line is not None)
                      and (line is None or line <= 45))
                how = None
                if ok and page is not None:
                    back = 0 if cur is None or cur[2] == "printed" else 6
                    ahead = 4 + (i - last_head) // 150
                    ok = page in pages and (cur is None or cur[0] - back <= page <= cur[0] + ahead) \
                        and (cur is None or page != cur[0] or "abcde".index(let) >= cur[1] or back)
                    how = "printed"
                elif ok:
                    if cur is None:
                        ok = False
                    elif "abcde".index(let) >= max(cur[1], 0):
                        page = cur[0]
                        how = "printed with an earlier note" if cur[2] == "printed" else cur[2]
                    else:
                        page, how = cur[0] + 1, "counted (the letter is lower than the one before)"
                        ok = page in pages
                if ok and SIGLA.search(rest[:120]) and len(SIGLA.findall(rest[:160])) >= 2:
                    ok = False          # a line of the critical apparatus
                    in_text = True
                    stats["apparatus lines left out"] += 1
                    continue
                if ok:
                    head = {"page": page, "letter": let, "line": line, "rest": rest, "how": how, "skip_next": skip_next}
            if head is None and b.get("line_only") and cur is not None and note is not None:
                m2 = LINE_ONLY.match(s)
                if m2:
                    line = int(m2["line"])
                    rest = m2["rest"]
                    if cur_line < line <= cur_line + 15 and not rest[:1].isdigit() and re.search(r"[:.]", rest[:70]) \
                            and not re.match(r"[a-z]", rest) and not SIGLA.search(rest[:80]):
                        head = {"page": cur[0], "letter": "abcde"[max(cur[1], 0)], "line": line, "rest": rest,
                                "how": "the section of the note before (only the line is printed)", "skip_next": False}
            if head:
                in_text = False
                last_head = i
                if head["skip_next"]:
                    while i < hi and not lines[i].strip():
                        i += 1
                    raw = raw + "\n" + lines[i]
                    i += 1
                cur = (head["page"], "abcde".index(head["letter"]), "printed" if head["how"].startswith("printed") else head["how"])
                cur_line = head["line"] or 0
                lemma, body = split_lemma(head["rest"])
                note = {"id": f"{b['id']}.{len(notes) + 1:04d}", "kind": "note", "seq": len(notes) + 1,
                        "work": part["work"], "vol": part["item"] + 1 if len(b["items"]) > 1 else None,
                        "line": i, "steph": f"{head['page']}{head['letter']}", "printed_line": head["line"],
                        "steph_how": head["how"], "lemma": lemma, "lemma_lang": "grc" if lemma else None,
                        "text": body, "raw": raw}
                notes.append(note)
                stats["notes"] += 1
                stats[f"page {head['how']}"] += 1
                continue
            if note is None:
                continue
            if b.get("page_text"):
                if in_text:
                    if len(s) <= 56 and english(s) >= 0.15 and greek_share(s) < 0.3:
                        in_text = False         # the notes again, the note before running on
                    else:
                        stats["lines of Greek text or apparatus left out"] += 1
                        continue
                elif len(s) > 58 and english(s) < 0.08:
                    in_text = True
                    stats["lines of Greek text or apparatus left out"] += 1
                    continue
            if JUNK.match(s) and len(s) < 30:
                stats["page numbers and running heads left out"] += 1
                continue
            t = collapse(s)
            if note["text"].endswith("-") and not note["text"].endswith("--"):
                note["text"] = note["text"][:-1] + t
            else:
                note["text"] = (note["text"] + " " + t).strip()
            note["raw"] += "\n" + raw
    for n in notes:
        n["text"] = commentary.nfc(n["text"])
        if n["lemma"]:
            n["lemma"] = commentary.nfc(n["lemma"])
        else:
            del n["lemma"], n["lemma_lang"]
    return notes, stats


def split_lemma(rest):
    """The Greek words a note is on, where it quotes them: the Greek before the
    first ':' or ']', or the leading run of Greek words. (lemma or None, the note)."""
    rest = collapse(rest)
    m = re.match(r"^(.{1,90}?)\s?[:\]]\s*(.*)$", rest)
    if m and greek_share(m.group(1)) >= 0.6:
        return m.group(1).strip(" .,"), rest
    words = rest.split()
    k = 0
    while k < len(words) and greek_share(words[k]) >= 0.8:
        k += 1
    if k:
        return " ".join(words[:k]).strip(" .,"), rest
    return None, rest


# ------------------------------------------------------------------ notes headed by the Greek words alone

NOTE_HEAD = commentary.NOTE_HEAD


def read_bracket(b):
    notes = []
    stats = Counter()
    for part in b["parts"]:
        lines = book_lines(b, part["item"])
        lo, hi = part_range(lines, part)
        blocks, cur = [], []
        for i in range(lo, hi):
            if lines[i].strip():
                cur.append((i + 1, lines[i]))
            elif cur:
                blocks.append(cur)
                cur = []
        if cur:
            blocks.append(cur)
        part_notes = []
        for blk in blocks:
            text = ""
            for _, ln in blk:
                ln = collapse(ln)
                text = text[:-1] + ln if text.endswith("-") and not text.endswith("--") else (text + " " + ln).strip()
            m = NOTE_HEAD.match(text)
            if m and greek_share(m.group(2)) > 0.5 and len(m.group(3)) > 0 and greek_share(m.group(3)[:200]) < 0.6 \
                    and len(m.group(2).split()) <= 12:
                num = int(m.group(1)) if m.group(1) else (part_notes[-1]["printed_line"] if part_notes else None)
                lemma = commentary.nfc(re.sub(r"^[IlΙ1]\.\s+", "", m.group(2)).strip(" .,"))
                n = {"id": f"{b['id']}.{len(notes) + len(part_notes) + 1:04d}", "kind": "note",
                     "seq": len(notes) + len(part_notes) + 1, "work": part["work"], "line": blk[0][0],
                     "printed_line": num, "lemma": lemma, "lemma_lang": "grc",
                     "text": commentary.nfc(m.group(3).strip()), "raw": "\n".join(x[1] for x in blk)}
                part_notes.append(n)
                stats["notes"] += 1
                continue
            if part_notes and greek_share(text) < 0.5 and len(LATIN.findall(text)) > 25 and not re.match(r"^\d+\s+\S+\s?:", text):
                part_notes[-1]["text"] += " " + commentary.nfc(text)
                part_notes[-1]["raw"] += "\n" + "\n".join(x[1] for x in blk)
                stats["blocks run on"] += 1
            else:
                stats["blocks of text, apparatus or margin left out"] += 1
        for n in part_notes:
            n["text"] = re.sub(r"(\w)- (\w)", r"\1\2", n["text"])
        notes += part_notes
    return notes, stats


# ------------------------------------------------------------------ notes headed by a line number and the Greek, closed by a colon

COLON_HEAD = re.compile(r"^\s*(?:(?P<page>\d{3})\.\s+)?(?P<line>\d{1,2})\.\s+(?P<lemma>[^:A-Za-z]{2,70}?)\s?:\s*(?P<rest>.*)$")


def read_colon(b):
    """Lodge's Gorgias: notes in narrow columns under the Greek, each headed by
    the line of his page of Greek and the Greek words, closed by a colon
    ('26. δόξα ψευδής : the force of ...'). The Greek text on the same page is
    left out (lines longer than the columns, or with no English in them). The
    notes are placed by their Greek words, like the bracket notes."""
    notes, stats = [], Counter()
    for part in b["parts"]:
        lines = book_lines(b, part["item"])
        lo, hi = part_range(lines, part)
        note, in_text = None, False
        for i in range(lo, hi):
            s = lines[i].strip()
            if not s:
                continue
            m = COLON_HEAD.match(s)
            if m and greek_share(m["lemma"]) > 0.6 and len(s) <= 60:
                note = {"id": f"{b['id']}.{len(notes) + 1:04d}", "kind": "note", "seq": len(notes) + 1, "work": part["work"],
                        "line": i + 1, "printed_line": int(m["line"]), "lemma": commentary.nfc(m["lemma"].strip(" .,")),
                        "lemma_lang": "grc", "text": commentary.nfc(collapse(m["rest"])), "raw": lines[i]}
                notes.append(note)
                in_text = False
                stats["notes"] += 1
                continue
            if note is None:
                continue
            if len(s) > 56 or (english(s) < 0.08 and greek_share(s) > 0.4) or GREEK_PAGE.search(s):
                in_text = True
                stats["lines of Greek text left out"] += 1
                continue
            if in_text and english(s) < 0.12:
                stats["lines of Greek text left out"] += 1
                continue
            in_text = False
            if JUNK.match(s) and len(s) < 12:
                continue
            t = collapse(s)
            note["text"] = note["text"][:-1] + t if note["text"].endswith("-") else (note["text"] + " " + t).strip()
            note["raw"] += "\n" + lines[i]
    for n in notes:
        n["text"] = commentary.nfc(n["text"])
    return notes, stats


# ------------------------------------------------------------------ Jowett's introductions

JOWETT = SOURCES / "jowett-gutenberg"


def jowett_intro_text(ebook, title):
    t = (JOWETT / f"pg{ebook}.txt").read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    starts = [m.end() for m in re.finditer(r"(?m)^\s*_?INTRODUCTION(?: AND ANALYSIS)?\.?_?\s*$", t)]
    if not starts:
        return None
    a = starts[0]
    b = t.find("PERSONS OF THE DIALOGUE", a)
    if b < 0:
        return None
    body = t[a:b]
    body = body[:body.rstrip().rfind("\n")]     # the dialogue's title, before the persons
    return body


def jowett_paragraphs(body, title):
    # Jowett's marginal headings ('[Sidenote: _Analysis 17-19._]') are read with the structure (milestone 9).
    body = re.sub(r"\[Sidenote:[^\]]*\]", "", body)
    paras = [collapse(p) for p in re.split(r"\n\s*\n", body)]
    out = []
    for p in paras:
        if not p or re.fullmatch(r"(?:Section\s+)?[IVXL]+\.?|[*\s]+", p) or (p.isupper() and len(p) < 80):
            continue
        out.append(p)
    return out


def read_jowett():
    cfg = json.loads((JOWETT / "ebooks.json").read_text(encoding="utf-8"))["ebooks"]
    docs = []
    for e in cfg:
        if len(e["works"]) != 1 or e["ebook"] == 1572:    # vol. II is read below; the Timaeus in milestone 7
            continue
        w = e["works"][0]
        body = jowett_intro_text(e["ebook"], w["title"])
        if body is None:
            print(f"pg{e['ebook']}: no Introduction found", file=sys.stderr)
            continue
        docs.append(jowett_doc(w["work"], w["title"], jowett_paragraphs(body, w["title"]), e["ebook"],
                               e.get("printed") or "The Dialogues of Plato, translated by B. Jowett, 3rd ed. (Oxford, 1892)"))
    docs += read_jowett_vol2(next(e for e in cfg if e["ebook"] == 76464))
    return docs


def read_jowett_vol2(e):
    """Vol. II of 1892 holds ten dialogues, each with its Introduction before it,
    under the dialogue's title ('EUTHYPHRO.' then 'INTRODUCTION.'). An
    Introduction runs to the title printed again over the translation."""
    t = (JOWETT / "pg76464.txt").read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    docs = []
    for m in re.finditer(r"(?m)^([A-Z][A-Z .]+?)\.\s*\n\s*\n\s*INTRODUCTION\.\s*$", t):
        title = m.group(1).strip()
        w = next((w for w in e["works"] if w["title"].upper() == title), None)
        if not w or not w["work"] or w["translator"] != "Benjamin Jowett":
            continue
        a = m.end()
        again = re.search(r"(?m)^" + re.escape(title) + r"\.\s*$", t[a:])
        b = a + again.start() if again else len(t)
        persons = t.find("PERSONS OF THE DIALOGUE", a)
        if 0 <= persons < b:
            b = persons
        body = t[a:b]
        docs.append(jowett_doc(w["work"], w["title"], jowett_paragraphs(body, w["title"]), 76464, e["printed"]))
    return docs


def jowett_doc(work, title, paras, ebook, printed):
    slug = DIRS.get(work) or work
    cid = f"jowett1892-intro-{work}"
    notes = [{"id": f"{cid}.{k:03d}", "kind": "introduction", "seq": k, "work": work, "text": p, "raw": p}
             for k, p in enumerate(paras, 1)]
    return {"schema": SCHEMA, "id": cid, "work": work, "author": "Benjamin Jowett",
            "label": "Jowett, Introduction (1892)" if ebook != 55201 else "Jowett, Introduction (1888)",
            "title": f"Introduction to the {title}", "printed": f"{printed}; Project Gutenberg {ebook}",
            "kind": "introduction", "lang": "eng",
            "source": {"manifest_id": "jowett-gutenberg", "file": f"sources/jowett-gutenberg/pg{ebook}.txt"},
            "proof_status": "clean source text (Project Gutenberg)",
            "anchoring": f"An introduction to the whole dialogue: each paragraph is a note on the whole {title}.",
            "notes": notes, "stats": {"paragraphs": len(notes)}}


# ------------------------------------------------------------------ writing

def work_dir(work):
    if work in DIRS:
        return DIRS[work]
    # The folder milestones 9 and 10 made for it.
    for d in sorted(OUT.glob("*/")):
        for f in sorted(d.glob("*.json"))[:1]:
            if json.loads(f.read_text(encoding="utf-8"))["work"] == work:
                return d.name
    raise SystemExit(f"no folder for {work}")


def write(doc):
    dest = OUT / work_dir(doc["work"]) / f"{doc['id']}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    doc["stats"] = dict(doc.get("stats", {}), notes=len(doc["notes"]))
    dest.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return dest


def book_docs(b):
    notes, stats = {"steph": read_steph, "bracket": read_bracket, "colon": read_colon}[b["style"]](b)
    by_work = {}
    for n in notes:
        by_work.setdefault(n["work"], []).append(n)
    docs = []
    files = [f"sources/{b['folder']}/{x}_djvu.txt" for x in b["items"]]
    for work, ns in by_work.items():
        suffix = "" if len(by_work) == 1 else f"-{work}"
        for k, n in enumerate(ns, 1):
            n["seq"] = k
            if suffix:
                n["id"] = f"{b['id']}{suffix}.{k:04d}"
        anchoring = (
            "Each note is headed by the Stephanus page, letter and line of the passage it is on, as printed. The note is "
            "placed at that section; where it quotes Greek words and they are found there in Burnet's text, on those "
            "words. A letter printed without its page takes the page of the note before, or the next page where the "
            "letter is lower; such a page is counted, not printed, and is marked ≈."
            if b["style"] == "steph" else
            "Each note names the line of the commentator's page of Greek and quotes the Greek words it is on. Those words "
            "are found in Burnet's Greek when the library is built; the note is then on those words, at their section. "
            "A note whose words are not found takes the section of the note before it and is marked ≈.")
        docs.append({"schema": SCHEMA, "id": b["id"] + suffix, "work": work, "author": b["author"], "label": b["label"],
                     "title": b["title"], "printed": b["printed"], "kind": "notes", "lang": "eng",
                     "source": {"manifest_id": b["folder"], "file": files[0] if len(files) == 1 else files},
                     "proof_status": "OCR as received", "anchoring": anchoring,
                     "place_by": "steph" if b["style"] == "steph" else None,
                     "quoter": b["author"].split()[-1],
                     "ocr_note": b.get("ocr_note"), "notes": ns, "stats": dict(stats)})
    return docs


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("which", nargs="*")
    args = ap.parse_args()
    which = set(args.which)
    if "fetch" in which:
        fetch_all(which - {"fetch"} or None)
        return
    docs = []
    for b in BOOKS:
        if not which or b["id"] in which:
            docs += book_docs(b)
    if not which or "jowett" in which:
        docs += read_jowett()
    for d in docs:
        dest = write(d)
        print(f"{d['id']:<28} {len(d['notes']):>5} notes  {sum(len(n['text'].split()) for n in d['notes']):>8} words -> "
              f"{dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
