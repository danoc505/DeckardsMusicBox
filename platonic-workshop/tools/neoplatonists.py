#!/usr/bin/env python3
"""Milestone 25: the rest of the Neoplatonists, in public-domain Greek editions,
read whole with their contents.

Two kinds of source (sources/manifest.json names each edition and quotes its licence):

  first1k-neoplatonists   First1KGreek's TEI (CC BY-SA 4.0), made from the printed
                          editions and corrected: Plotinus (Volkmann), Proclus on the
                          Republic (Kroll), five works of Iamblichus.
  ia-*                    Internet Archive scans of public-domain editions, read as the
                          Archive's OCR gives them (_djvu.xml: the words of every line,
                          page by page): Proclus on the Alcibiades and the Parmenides
                          (Cousin), on the Cratylus (Pasquali), the Elements of Theology
                          and Olympiodorus on the Alcibiades (Creuzer), Hermias on the
                          Phaedrus (Couvreur), Damascius on the first principles (Kopp).

How a TEI text is read (all here, nothing guessed):

1. The unit is the file's own smallest citable division (its refsDecl): a chapter of a
   treatise of Plotinus ('I.6.9'), a section of Iamblichus ('3.12'), a page of the
   edition where the file cites by page (Iamblichus on Nicomachus, 'p. 12'). Proclus on
   the Republic is cited by Kroll's volume and page: its file has one division per essay,
   so the unit is the page (<pb n>), the volume counted where the page numbers start again.
2. The contents are the division above the unit, with the heading the file prints (a
   treatise of Plotinus, an essay of Proclus); a text with one level only is listed ten
   units at a time.
3. Footnotes (the editor's apparatus) and marginal notes (manuscript folios, the pages
   of an older edition) are kept apart from the text, as the file marks them.

How a scan is read:

1. Each scanned page (the Archive's 'leaf') of the range RANGES gives is a unit, its
   lines as the OCR has them. Nothing is corrected in the text: the OCR is shown as
   received.
2. The page number is read from the page itself: a number standing alone in its first
   three or last two lines ('( 74 )', '112 PROCLI SCHOLIA'), not in square brackets
   (which hold an older edition's pages). Each number votes for the gap between it and
   the page's place in the scan; a number is believed ('read') when it agrees with the gap
   that most numbers within twelve pages vote for, and at least three do. The pages between
   two believed numbers that agree are counted, and say so. A page with no believed number is named by its image.
   (The Archive's own reading of the numbers, _page_numbers.json, is kept with the scan
   but not used: in these books it is often one page out.) Creuzer prints the Greek and
   his Latin on facing pages with the same number, so there each language is counted on
   its own.
3. A page is Latin (the editor's translation, preface or notes) when fewer than a third
   of its letters are Greek; the reader folds those pages away. (Kopp's scan was read
   as Greek throughout, his Latin notes too.)
4. Lines with fewer than three letters in words, or more marks than letters, are
   specks and stray accents the OCR read as characters: the reader hides them and
   shows them under "the OCR as received".
5. Corrections are kept apart, in sources/neoplatonists/corrections.json: each says
   what the OCR prints, what is read, where (one page, or every page of a text), and
   why. The reader shows the text as received, and the corrections beside it.

Called by build_db.py: build(db) before the dictionaries, so that the words can be
tapped for their meaning (tools/gloss.py collects them from neo_unit). Standard library
only.

    python3 tools/neoplatonists.py --check          # read every text and print what it holds
    python3 tools/neoplatonists.py --check hermias  # one text, with its pages
"""
import gzip
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from html import unescape
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
F1K = RAW / "first1k-neoplatonists" / "data"
CORRECTIONS = ROOT / "sources" / "neoplatonists" / "corrections.json"
# The OCR of the scanned pages the texts use, copied from the Archive's _djvu.xml (python3 tools/neoplatonists.py --extract)
# and committed, so the library builds without the Archive's servers, which often refuse GitHub's.
OCR_COPY = ROOT / "sources" / "neoplatonists" / "ocr"
REPORT = ROOT / "reports" / "neoplatonists.md"
TEI_NS = "{http://www.tei-c.org/ns/1.0}"
F1K_LICENCE = "CC BY-SA 4.0 (First1KGreek: \"Available under a Creative Commons Attribution-ShareAlike 4.0 International License\")"
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

# The shelf, in the order the Library lists it: the texts read first in the school come first.
# group: the Library's heading. kind: tei | ocr. For a scan, ranges: [(source id, first leaf, last leaf)], leaves counted from 1.
TEXTS = [
    {"id": "plotinus-enneads", "group": "Plotinus", "author": "Plotinus", "title": "Enneads", "greek": "Ἐννεάδες",
     "cite": "Enn.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2000/tlg001/tlg2000.tlg001.1st1K-grc1.xml",
     "edition": "Plotini Enneades, ed. Richard Volkmann, 2 vols (Leipzig: Teubner, 1883-1884)", "editor": "Richard Volkmann", "year": 1883,
     "unit": "chapter", "about": "The 54 treatises of Plotinus (3rd century), arranged by his pupil Porphyry in six groups of nine; the founding text of Neoplatonism. "
     "Cited by Ennead, treatise and chapter: I.6.9 is the ninth chapter of the sixth treatise of the first Ennead (On Beauty)."},
    {"id": "porphyry-isagoge", "group": "Porphyry", "author": "Porphyry", "title": "Introduction (Isagoge)", "greek": "Εἰσαγωγή",
     "cite": "Isag.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2034/tlg006/tlg2034.tlg006.opp-grc1.xml", "unit": "page",
     "edition": "Porphyrii Isagoge et in Aristotelis Categorias commentarium, ed. Adolf Busse, Commentaria in Aristotelem Graeca IV.1 (Berlin: Reimer, 1887)", "editor": "Adolf Busse", "year": 1887,
     "about": "Plotinus' pupil and editor on the five words the Categories takes for granted: genus, species, difference, property and accident. "
     "The school read it first of all, as the door to Aristotle's logic; the Aristotle shelf has Owen's English (1853). Cited by Busse's page."},
    {"id": "proclus-alcibiades", "group": "Proclus", "author": "Proclus", "title": "Commentary on the First Alcibiades", "greek": "Εἰς τὸν Πλάτωνος πρῶτον Ἀλκιβιάδην",
     "cite": "in Alc.", "head": r"\(\s*([0-9oO]{1,3})\s*[.,]?\s*[)}J]", "kind": "ocr", "ranges": [("ia-cousin-proclus-t2", 28, 365), ("ia-cousin-proclus-t3", 7, 235)],
     "edition": "Procli philosophi Platonici opera, ed. Victor Cousin, vols II-III (Paris, 1820-1821)", "editor": "Victor Cousin", "year": 1820,
     "about": "Proclus' lectures on the dialogue the school read first: who the true lover is, and how the soul comes to know itself. "
     "Only the first part survives. Cousin prints the Greek with his Latin on some pages; the scan's page numbers are Cousin's."},
    {"id": "proclus-elements", "group": "Proclus", "author": "Proclus", "title": "Elements of Theology", "greek": "Στοιχείωσις θεολογική",
     "cite": "El. Theol.", "head": r"^\W{0,3}(\d{1,3})\W{0,3}$", "kind": "ocr", "ranges": [("ia-creuzer-initia-t3", 18, 334)],
     "edition": "Initia philosophiae ac theologiae ex Platonicis fontibus ducta, ed. Friedrich Creuzer, part III (Frankfurt: Broenner, 1822)", "editor": "Friedrich Creuzer", "year": 1822,
     "about": "Proclus' whole system in 211 propositions, each proved from those before it, in the manner of Euclid. Creuzer prints the Greek "
     "with a Latin version on the facing page and notes below; Dodds' edition (1933) is in copyright."},
    {"id": "proclus-cratylus", "group": "Proclus", "author": "Proclus", "title": "Commentary on the Cratylus (excerpts)", "greek": "Ἐκ τῶν Πρόκλου σχολίων εἰς τὸν Κρατύλον ἐκλογαί",
     "cite": "in Crat.", "head": r"^\W{0,3}(\d{1,3})\s+PROCLI|\]\s*(\d{1,3})\W{0,2}$|CRATYLVM\S*\s+(\d{1,3})\W{0,2}$", "kind": "ocr", "ranges": [("ia-pasquali-1908", 15, 127)],
     "edition": "Procli Diadochi in Platonis Cratylum commentaria, ed. Giorgio Pasquali (Leipzig: Teubner, 1908)", "editor": "Giorgio Pasquali", "year": 1908,
     "about": "Excerpts from Proclus' lectures on the Cratylus: names, their makers, and the names of the gods. Pasquali numbers the excerpts; "
     "his apparatus is at the foot of each page."},
    {"id": "proclus-parmenides", "group": "Proclus", "author": "Proclus", "title": "Commentary on the Parmenides", "greek": "Εἰς τὸν Πλάτωνος Παρμενίδην",
     "cite": "in Parm.", "head": r"\(\s*([0-9oO]{1,3})\s*[.,]?\s*[)}J]", "kind": "ocr", "ranges": [("ia-cousin-proclus-t4", 10, 281), ("ia-cousin-proclus-t5", 3, 422), ("ia-cousin-proclus-t6", 4, 369)],
     "edition": "Procli philosophi Platonici opera, ed. Victor Cousin, vols IV-VI (Paris, 1821-1827)", "editor": "Victor Cousin", "year": 1821,
     "about": "Proclus' seven books on the Parmenides, the dialogue the school read last, as its theology. The Greek breaks off in book VII; "
     "the rest survives only in William of Moerbeke's Latin, which Cousin prints at the end of volume VI."},
    {"id": "proclus-republic", "group": "Proclus", "author": "Proclus", "title": "Commentary on the Republic", "greek": "Εἰς τὴν Πλάτωνος Πολιτείαν",
     "cite": "in Remp.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg4036/tlg001/tlg4036.tlg001.opp-grc1.xml", "unit": "page",
     "edition": "Procli Diadochi in Platonis Rem publicam commentarii, ed. Wilhelm Kroll, 2 vols (Leipzig: Teubner, 1899-1901)", "editor": "Wilhelm Kroll", "year": 1899,
     "about": "Seventeen essays on the Republic, among them Proclus' defence of Homer against Plato's criticism and his long reading of the myth of Er. "
     "Cited by Kroll's volume, page and line."},
    {"id": "iamblichus-pythagorean-life", "group": "Iamblichus", "author": "Iamblichus", "title": "On the Pythagorean Life", "greek": "Περὶ τοῦ Πυθαγορικοῦ βίου",
     "cite": "VP", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2023/tlg001/tlg2023.tlg001.1st1K-grc1.xml",
     "edition": "Iamblichi de vita Pythagorica liber, ed. August Nauck (St Petersburg, 1884)", "editor": "August Nauck", "year": 1884,
     "about": "The first book of Iamblichus' great work on Pythagoreanism: the life of Pythagoras as the model of the philosophical life."},
    {"id": "iamblichus-protrepticus", "group": "Iamblichus", "author": "Iamblichus", "title": "Exhortation to Philosophy (Protrepticus)", "greek": "Λόγος προτρεπτικὸς ἐπὶ φιλοσοφίαν",
     "cite": "Protr.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2023/tlg002/tlg2023.tlg002.1st1K-grc1.xml",
     "edition": "Iamblichi Protrepticus, ed. Ermenegildo Pistelli (Leipzig: Teubner, 1888)", "editor": "Ermenegildo Pistelli", "year": 1888,
     "about": "The second book: an exhortation to philosophy built from Pythagorean sayings, Plato and the lost Protrepticus of Aristotle."},
    {"id": "iamblichus-mathematics", "group": "Iamblichus", "author": "Iamblichus", "title": "On General Mathematical Science", "greek": "Περὶ τῆς κοινῆς μαθηματικῆς ἐπιστήμης",
     "cite": "Comm. Math.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2023/tlg003/tlg2023.tlg003.1st1K-grc1.xml",
     "edition": "Iamblichi de communi mathematica scientia liber, ed. Nicola Festa (Leipzig: Teubner, 1891)", "editor": "Nicola Festa", "year": 1891,
     "about": "The third book: what mathematics is, and why it stands between the sensible and the intelligible."},
    {"id": "iamblichus-nicomachus", "group": "Iamblichus", "author": "Iamblichus", "title": "On Nicomachus' Introduction to Arithmetic", "greek": "Περὶ τῆς Νικομάχου ἀριθμητικῆς εἰσαγωγῆς",
     "cite": "in Nic.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2023/tlg004/tlg2023.tlg004.1st1K-grc1.xml", "unit": "page",
     "edition": "Iamblichi in Nicomachi arithmeticam introductionem liber, ed. Ermenegildo Pistelli (Leipzig: Teubner, 1894)", "editor": "Ermenegildo Pistelli", "year": 1894,
     "about": "The fourth book: a commentary on Nicomachus' handbook of number theory. Cited by Pistelli's page."},
    {"id": "iamblichus-mysteries", "group": "Iamblichus", "author": "Iamblichus", "title": "On the Mysteries", "greek": "Ἀβάμμωνος διδασκάλου πρὸς τὴν Πορφυρίου πρὸς Ἀνεβὼ ἐπιστολὴν ἀπόκρισις",
     "cite": "Myst.", "kind": "tei", "source": "first1k-neoplatonists", "file": "tlg2023/tlg006/tlg2023.tlg006.1st1K-grc1.xml",
     "edition": "Iamblichi de mysteriis liber, ed. Gustav Parthey (Berlin: Nicolai, 1857)", "editor": "Gustav Parthey", "year": 1857,
     "about": "Iamblichus' answer, as the priest Abammon, to Porphyry's letter doubting the rites: the defence of theurgy. Taylor translated it (1821). "
     "Cited by book and chapter."},
    {"id": "damascius-principles", "group": "Damascius", "author": "Damascius", "title": "Problems and Solutions concerning First Principles", "greek": "Ἀπορίαι καὶ λύσεις περὶ τῶν πρώτων ἀρχῶν",
     "cite": "De princ.", "head": r"^\W{0,3}(\d{1,3})\W{0,3}$", "kind": "ocr", "ranges": [("ia-kopp-1826", 17, 421)],
     "edition": "Damascii philosophi Platonici quaestiones de primis principiis, ed. Joseph Kopp (Frankfurt: Broenner, 1826)", "editor": "Joseph Kopp", "year": 1826,
     "about": "The last head of the Athenian school asks whether anything can be said of the first principle at all. Kopp's edition, the first; "
     "the scan was read as Greek throughout, so his Latin notes come out as Greek letters, and the Greek is read without most of its accents."},
    {"id": "hermias-phaedrus", "group": "Hermias and Olympiodorus", "author": "Hermias", "title": "Scholia on the Phaedrus", "greek": "Εἰς τὸν Πλάτωνος Φαῖδρον σχόλια",
     "cite": "in Phdr.", "head": r"^\W{0,3}(\d{1,3})\s*\W{0,2}\s*[EΕ][PΡ]M|(?:ΣΧ|XX|EX|ΖΧ|ΣΧ|XEX|XΧ)\S*\s+(\d{1,3})\W{0,2}$", "kind": "ocr", "ranges": [("ia-couvreur-1901", 37, 302)],
     "edition": "Hermiae Alexandrini in Platonis Phaedrum scholia, ed. Paul Couvreur (Paris: Bouillon, 1901)", "editor": "Paul Couvreur", "year": 1901,
     "about": "Hermias' notes from Syrianus' lectures on the Phaedrus, the only full ancient commentary on it. The numbers in square brackets "
     "in the text are the pages of Ast's edition (1810); the apparatus is at the foot of each page."},
    {"id": "olympiodorus-alcibiades", "group": "Hermias and Olympiodorus", "author": "Olympiodorus", "title": "Commentary on the First Alcibiades", "greek": "Σχόλια εἰς τὸν Πλάτωνος Ἀλκιβιάδην",
     "cite": "in Alc.", "head": r"^\W{0,3}(\d{1,3})\W{0,3}$", "kind": "ocr", "ranges": [("ia-creuzer-initia-t2", 17, 246)],
     "edition": "Initia philosophiae ac theologiae ex Platonicis fontibus ducta, ed. Friedrich Creuzer, part II (Frankfurt: Broenner, 1821)", "editor": "Friedrich Creuzer", "year": 1821,
     "about": "Olympiodorus' lectures in Alexandria in the 6th century, on the dialogue that opens the course; it begins with his Life of Plato. "
     "Creuzer's notes are printed below the Greek."},
]
# Asked for in the roadmap and not here, with why (reports/neoplatonists.md, and the Library says so).
NOT_HERE = [
    ("Olympiodorus, Commentary on the Gorgias", "the only full editions are Norvin's (1936, still in copyright in the United States) and Westerink's (1970); Jahn's of 1848, "
     "in a journal supplement, was not found among the scans the Workshop can reach"),
    ("Olympiodorus, Commentary on the Phaedo", "Norvin's edition (1913) was not found among the scans; Finckh's (1847) is on the Internet Archive, "
     "but its OCR read the Greek as Latin letters throughout, so there is no Greek to show"),
    ("Damascius, Commentary on the Parmenides, and his lectures on the Phaedo and Philebus", "Ruelle's Parmenides (1889-1899) and Norvin's "
     "Phaedo (1913) were not found among the scans; Westerink's Phaedo and Philebus are in copyright"),
    ("Proclus, Commentary on the Timaeus, and the Theology of Plato", "already in the library in Taylor's English (milestones 7 and 10); "
     "their Greek (Diehl, 1903-1906; Portus, 1618) is left for a later milestone"),
]
# Aristotle milestone A5: the Greek commentators on Aristotle, on their own shelf, stored and read with these
# (tools/aristotle_commentators.py; shelf = 'commentators').
import aristotle_commentators  # noqa: E402
TEXTS = TEXTS + aristotle_commentators.TEXTS


# ---------------------------------------------------------------- the TEI texts

def _local(tag):
    return tag.split("}", 1)[-1] if isinstance(tag, str) else ""


def tei_events(el, out):
    """Flatten a TEI body into events: ('div', subtype, n), ('/div',), ('pb', n), ('head', text),
    ('note', type, text), ('text', s), ('break',) at the end of a paragraph or verse line."""
    tag = _local(el.tag)
    if tag == "note":
        out.append(("note", el.get("type") or "note", " ".join("".join(el.itertext()).split())))
        if el.tail:
            out.append(("text", el.tail))
        return
    if tag == "head":
        out.append(("head", " ".join("".join(el.itertext()).split())))
        if el.tail:
            out.append(("text", el.tail))
        return
    if tag == "pb":
        out.append(("pb", el.get("n")))
    if tag == "div" and el.get("type") == "textpart":
        out.append(("div", el.get("subtype"), el.get("n")))
    if el.text and tag not in ("pb", "lb", "milestone"):
        out.append(("text", el.text))
    for c in el:
        tei_events(c, out)
    if tag in ("p", "l", "lg", "quote", "label") and tag != "label":
        out.append(("break",))
    if tag == "div" and el.get("type") == "textpart":
        out.append(("/div",))
    if el.tail:
        out.append(("text", el.tail))


def tei_levels(root):
    """The citation levels, outermost first, from the refsDecl: ['book', 'chapter', 'section']."""
    pats = root.findall(f".//{TEI_NS}refsDecl/{TEI_NS}cRefPattern")
    return [p.get("n") for p in sorted(pats, key=lambda p: p.get("matchPattern").count("."))]


def clean(s):
    return re.sub(r"[ \t]+", " ", re.sub(r" *\n *", "\n", s)).strip()


def read_tei(t):
    """[units], [parts], header facts. A unit: {n, label, part, text, notes, margin, page}."""
    path = F1K / t["file"]
    root = ET.parse(path).getroot()
    levels = tei_levels(root)
    body = root.find(f".//{TEI_NS}body")
    ev = []
    tei_events(body, ev)
    by_page = t.get("unit") == "page" and levels == ["chapter"]   # Kroll: essays, cited by page
    unit_level = levels[-1]
    part_level = levels[-2] if len(levels) > 1 else None
    units, parts = [], []
    stack = []            # open divisions: (subtype, n)
    cur = None
    vol, last_pb = 1, None
    pending_head = None

    def part_key():
        if by_page:
            return tuple(n for s, n in stack if s == "chapter")
        return tuple(n for s, n in stack if s in levels[:-1])

    def open_unit(n, label, page=None):
        nonlocal cur
        pk = part_key()
        if not parts or parts[-1]["key"] != pk:
            parts.append({"key": pk, "head": None, "units": []})
        cur = {"n": n, "label": label, "text": "", "notes": [], "margin": [], "page": page, "part": len(parts) - 1, "head": None}
        units.append(cur)
        parts[-1]["units"].append(len(units) - 1)

    for e in ev:
        k = e[0]
        if k == "div":
            if cur is not None and cur.get("loose"):
                cur = None
            stack.append((e[1], e[2]))
            if not by_page and e[1] == unit_level:
                ns = [n for s, n in stack if s in levels]
                if t["id"] == "plotinus-enneads":
                    label = f"{ROMAN[int(ns[0])]}.{ns[1]}.{ns[2]}"
                else:
                    label = ".".join(ns) if len(ns) > 1 else (f"p. {ns[0]}" if unit_level == "page" else ns[0])
                open_unit(".".join(ns), label)
                if pending_head:
                    cur["head"] = pending_head
                    pending_head = None
        elif k == "/div":
            if cur is not None and cur.get("loose") == len(stack):
                cur = None
            s, _ = stack.pop()
            if not by_page and s == unit_level:
                cur = None
        elif k == "pb":
            n = e[1]
            if by_page and n and n.isdigit():
                if last_pb is not None and int(n) < last_pb:
                    vol += 1
                last_pb = int(n)
                open_unit(f"{vol}.{n}", f"{ROMAN[vol]} {n}", page=f"{ROMAN[vol]} {n}")
            elif cur is not None and n:
                cur.setdefault("pages", []).append(n)
        elif k == "head":
            if by_page:
                if cur is not None:
                    cur["text"] += "\n" + e[1] + "\n"
                    if parts and len(parts[-1]["units"]) <= 2:
                        parts[-1]["head"] = ((parts[-1]["head"] or "") + " " + e[1]).strip()
                continue
            # The heading of a part (the treatise's title) or of the unit about to open.
            if stack and stack[-1][0] == part_level and cur is None:
                pending_head = e[1] if pending_head is None else pending_head + " " + e[1]
            elif cur is not None:
                cur["text"] += "\n" + e[1] + "\n"
            else:
                pending_head = e[1] if pending_head is None else pending_head + " " + e[1]
        elif k == "note":
            if cur is None:
                continue
            (cur["margin"] if e[1] == "marginal" else cur["notes"]).append(e[2])
        elif k == "text":
            if cur is None and not by_page and stack and e[1].strip():
                # Text in a division with no smaller one (the Protrepticus' first twenty chapters): that division is the unit.
                ns = [n for s, n in stack if s in levels]
                open_unit(".".join(ns), ".".join(ns))
                cur["loose"] = len(stack)
                if pending_head:
                    cur["head"] = pending_head
                    pending_head = None
            if cur is not None:
                cur["text"] += e[1]
        elif k == "break":
            if cur is not None:
                cur["text"] += "\n"
    for u in units:
        u["text"] = clean(u["text"])
    units = [u for u in units if u["text"] or u["notes"]]
    # Kroll's volume II ends with Hultsch's three excursus in German (on the nuptial number): not Proclus.
    drop = {i for i, p in enumerate(parts) if (p["head"] or "").startswith("Drei Exkurse")}
    units = [u for u in units if u["part"] not in drop]
    # Re-number the parts after dropping empty units, and give each its heading: the first unit's.
    out_parts = []
    for u in units:
        if not out_parts or out_parts[-1]["_src"] != u["part"]:
            out_parts.append({"_src": u["part"], "units": [], "head": parts[u["part"]]["head"] or u.get("head"), "key": parts[u["part"]]["key"]})
        out_parts[-1]["units"].append(u)
        u["part"] = len(out_parts) - 1
    if part_level is None and not by_page:
        out_parts = group_by(units, 10)
    for i, p in enumerate(out_parts):
        p["label"] = part_label(t, p, i)
    return units, out_parts


def group_by(units, size):
    out = []
    for i, u in enumerate(units):
        if i % size == 0:
            out.append({"units": [], "head": None, "key": ()})
        out[-1]["units"].append(u)
        u["part"] = len(out) - 1
    return out


def part_label(t, p, i):
    first, last = p["units"][0]["label"], p["units"][-1]["label"]
    head = p.get("head")
    if t["id"] == "plotinus-enneads":
        e, tr = p["key"]
        return f"Ennead {ROMAN[int(e)]}, treatise {tr}" + (f": {head}" if head else "")
    if t["id"] == "iamblichus-mysteries":
        return f"Book {p['key'][0]}" if p["key"] and p["key"][0] != "0" else "The title"
    if t["id"] == "proclus-republic":
        return f"Essay {p['key'][0]}" + (f": {head}" if head else "") + f" ({first}–{last})"
    if p["key"]:
        k = p["key"][0]
        return ("Chapter " + k if k not in ("0", "praef") else "Contents") + (f": {head}" if head and k not in ("0", "praef") else "")
    return f"{first}–{last}" if first != last else first


# ---------------------------------------------------------------- the scans

def scan_ranges():
    """{source id: set of leaves} the texts read."""
    out = {}
    for t in TEXTS:
        for src, first, last in t.get("ranges", []):
            out.setdefault(src, set()).update(range(first, last + 1))
    return out


def manifest_sha(src):
    m = json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))
    return next(s["sha256"] for s in m["sources"] if s["id"] == src)


def extract(src):
    """The committed copy of a scan's OCR: the lines of every page a text reads, as djvu_pages reads them,
    with the sha256 of the _djvu.xml they come from. Written by --extract from data/raw."""
    pages = djvu_pages(RAW / src / "djvu.xml")
    leaves = sorted(lf for lf in scan_ranges()[src] if lf <= len(pages))
    return {"source": src, "djvu_sha256": manifest_sha(src), "n_pages": len(pages),
            "pages": {str(lf): pages[lf - 1] for lf in leaves}}


def write_extract(src):
    OCR_COPY.mkdir(parents=True, exist_ok=True)
    body = json.dumps(extract(src), ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
    with open(OCR_COPY / f"{src}.json.gz", "wb") as f:
        with gzip.GzipFile(filename="", mode="wb", fileobj=f, mtime=0, compresslevel=9) as g:   # the same bytes every time
            g.write(body)


def scan_pages(src):
    """[[line, ...] for each scanned page] from the committed copy (pages not read are empty)."""
    d = json.loads(gzip.decompress((OCR_COPY / f"{src}.json.gz").read_bytes()).decode("utf-8"))
    if d["djvu_sha256"] != manifest_sha(src):
        raise SystemExit(f"neoplatonists: {src}: the committed OCR is of another download; run tools/neoplatonists.py --extract")
    out = [[] for _ in range(d["n_pages"])]
    for lf, lines in d["pages"].items():
        out[int(lf) - 1] = lines
    return out


def djvu_pages(path):
    """[[line, ...] for each scanned page], from the Archive's _djvu.xml (its OBJECT, LINE and WORD elements)."""
    t = path.read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r"<OBJECT\b(.*?)</OBJECT>", t, re.S):
        lines = []
        for lm in re.finditer(r"<LINE>(.*?)</LINE>", m.group(1), re.S):
            words = [unescape(w) for w in re.findall(r"<WORD[^>]*>(.*?)</WORD>", lm.group(1), re.S)]
            lines.append(greek.nfc(" ".join(words)))
        out.append(lines)
    return out


_GREEK = re.compile(r"[Ͱ-Ͽἀ-῿]")
_LETTER = re.compile(r"[^\W\d_]", re.U)
_NUM = re.compile(r"(?<![\w\[.,;:/-])\(?\s*(\d{1,3}|\d{1,2}[oO]|[oO]\d{1,2})\s*[).]{0,2}(?![\w\],;:/-])")


def greek_share(lines):
    t = "".join(lines)
    letters = len(_LETTER.findall(t))
    return len(_GREEK.findall(t)) / letters if letters else 0.0


def is_noise(line):
    """A line of specks and stray accents: fewer than three letters in words of two or more, or more marks than letters."""
    words = re.findall(r"[^\W\d_]{2,}", line)
    letters = sum(len(w) for w in words)
    marks = len(re.sub(r"[\w\s]", "", line))
    return letters < 3 or marks > letters


def page_candidates(lines, head=None):
    """The page numbers a page may carry: with `head` (the edition's running head, a pattern whose
    groups hold the number), what it finds in the first five lines and the last two; otherwise
    numbers standing alone near the top or the foot of the page (not in square brackets)."""
    near = lines[:5] + lines[-2:] if len(lines) > 7 else lines
    out = set()
    if head:
        for ln in near:
            for m in re.finditer(head, ln):
                for g in m.groups():
                    v = (g or "").replace("o", "0").replace("O", "0")
                    if v.isdigit() and 0 < int(v) < 1000:
                        out.add(int(v))
        return out
    for ln in near:
        if "[" in ln and "]" in ln and re.search(r"\[\s*\d+\s*\]", ln):
            ln = re.sub(r"\[\s*\d+\s*\]", " ", ln)
        for m in _NUM.finditer(ln):
            v = m.group(1).replace("o", "0").replace("O", "0")
            if v.isdigit() and 0 < int(v) < 1000:
                out.add(int(v))
    return out


def number_pages(cands, window=12):
    """cands: [set of numbers] for a run of pages in order. Returns [(number or None, 'read' | 'counted' | None)].
    Each number votes for the offset between it and the page's place in the run; a page's number is believed
    ('read') when it agrees with the offset most numbers within twelve pages vote for, and at least three do.
    Pages between two believed numbers that agree are counted."""
    n = len(cands)
    votes = [{v - i for v in c} for i, c in enumerate(cands)]
    anchor = [None] * n
    for i in range(n):
        tally = Counter(d for j in range(max(0, i - window), min(n, i + window + 1)) for d in votes[j])
        if not tally:
            continue
        d, k = tally.most_common(1)[0]
        if k >= 3 and d in votes[i] and d + i > 0:
            anchor[i] = d + i
    out = [(a, "read") if a is not None else (None, None) for a in anchor]
    idx = [i for i in range(n) if anchor[i] is not None]
    for a, b in zip(idx, idx[1:]):
        if anchor[b] - anchor[a] == b - a:
            for k in range(a + 1, b):
                out[k] = (anchor[a] + k - a, "counted")
    # Before the first and after the last believed number, a few pages are counted on.
    if idx:
        for k in range(max(0, idx[0] - 3), idx[0]):
            if anchor[idx[0]] - (idx[0] - k) > 0:
                out[k] = (anchor[idx[0]] - (idx[0] - k), "counted")
        for k in range(idx[-1] + 1, min(n, idx[-1] + 4)):
            out[k] = (anchor[idx[-1]] + k - idx[-1], "counted")
    return out


def read_ocr(t, sources=None):
    units = []
    for vol_i, (src, first, last) in enumerate(t["ranges"]):
        pages = scan_pages(src)
        leaves = list(range(first, min(last, len(pages)) + 1))
        langs = {lf: ("grc" if greek_share(pages[lf - 1]) >= 1 / 3 else "lat") for lf in leaves}
        if t.get("facing"):
            numbers = {}
            for lang in ("grc", "lat"):
                run = [lf for lf in leaves if langs[lf] == lang]
                for lf, got in zip(run, number_pages([page_candidates(pages[lf - 1], t.get("head")) for lf in run])):
                    numbers[lf] = got
        else:
            numbers = dict(zip(leaves, number_pages([page_candidates(pages[lf - 1], t.get("head")) for lf in leaves])))
        for lf in leaves:
            lines = pages[lf - 1]
            num, how = numbers[lf]
            # The edition's own volume number (Cousin's IV, V, VI), from the scan's id, when a text runs over volumes.
            tv = re.search(r"-t(\d+)$", src)
            vol = (ROMAN[int(tv.group(1)) if tv else vol_i + 1] + " ") if len(t["ranges"]) > 1 else ""
            label = f"{vol}p. {num}" if num is not None else f"{vol}image {lf}"
            shown = [ln for ln in lines if not is_noise(ln)]
            units.append({"n": f"{src}:{lf}", "label": label, "page": num, "page_how": how, "source": src, "leaf": lf,
                          "lang": langs[lf], "lines": lines, "text": "\n".join(shown), "hidden": len(lines) - len(shown)})
    return units, group_by_pages(t, units)


def specks(u):
    """The lines of a scanned page hidden as specks, with their places: JSON [[line index, line]], so that
    the page as received is the shown lines with these put back."""
    if "lines" not in u:
        return None
    return json.dumps([[i, ln] for i, ln in enumerate(u["lines"]) if is_noise(ln)], ensure_ascii=False)


def as_received(text, specks_json):
    """The page as received: the lines shown, with the hidden ones put back in their places."""
    shown = text.split("\n") if text else []
    out = list(shown)
    for i, ln in json.loads(specks_json or "[]"):
        out.insert(i, ln)
    return "\n".join(out)


def group_by_pages(t, units, size=10):
    """The contents of a scan: ten pages at a time, by volume."""
    out = []
    for u in units:
        if not out or len(out[-1]["units"]) == size or out[-1]["units"][0]["source"] != u["source"]:
            out.append({"units": [], "head": None, "key": ()})
        out[-1]["units"].append(u)
        u["part"] = len(out) - 1
    for p in out:
        a, b = p["units"][0]["label"], p["units"][-1]["label"]
        ma, mb = re.fullmatch(r"(.*?)p\. (\d+)", a), re.fullmatch(r"(.*?)p\. (\d+)", b)
        if a == b:
            p["label"] = a
        elif ma and mb and ma.group(1) == mb.group(1):
            p["label"] = f"{ma.group(1)}pp. {ma.group(2)}–{mb.group(2)}"     # IV pp. 43–52
        else:
            p["label"] = f"{a} – {b}"
    return out


# ---------------------------------------------------------------- corrections

def load_corrections():
    if not CORRECTIONS.exists():
        return []
    return json.loads(CORRECTIONS.read_text(encoding="utf-8"))["corrections"]


def apply_corrections(text, corrs):
    """The text with the corrections that apply to it, word by word: (corrected text, [(ocr, read, n)])."""
    used = []
    for c in corrs:
        if not c["ocr"]:
            # A page the scan lost (a blank leaf), supplied whole: it applies only to a unit with no text.
            if not (text or "").strip():
                text = greek.nfc(c["read"])
                used.append((c["ocr"], c["read"], 1))
            continue
        pat = re.compile(r"(?<![\wͰ-Ͽἀ-῿])" + re.escape(greek.nfc(c["ocr"])) + r"(?![\wͰ-Ͽἀ-῿])")
        text, k = pat.subn(greek.nfc(c["read"]), text)
        if k:
            used.append((c["ocr"], c["read"], k))
    return text, used


# ---------------------------------------------------------------- the library

def read_all(only=None):
    out = []
    for t in TEXTS:
        if only and t["id"] not in only:
            continue
        if t.get("reader") == "cag":
            units, parts = aristotle_commentators.read(t)
        else:
            units, parts = read_tei(t) if t["kind"] == "tei" else read_ocr(t)
        out.append((t, units, parts))
    return out


def available():
    """True when the sources are downloaded (tools/fetch_sources.py)."""
    return ((F1K / "tlg2000").exists() and all((OCR_COPY / f"{s}.json.gz").exists() for s in scan_ranges())
            and aristotle_commentators.available())


def words(text):
    return len(greek.WORD.findall(text or ""))


def build(db):
    """Write the texts into neo_text, neo_part, neo_unit and neo_correction. Returns the figures for the report."""
    corrs = load_corrections()
    known = {t["id"] for t in TEXTS}
    bad = [c for c in corrs if c["text"] not in known]
    if bad:
        raise SystemExit(f"neoplatonists: corrections for unknown texts: {sorted({c['text'] for c in bad})}")
    sources = {r[0]: r for r in db.execute("SELECT id, licence FROM source")}
    stats = {"texts": [], "units": 0, "words": 0, "corrections": 0, "corrected_words": 0}
    for seq, (t, units, parts) in enumerate(read_all()):
        src_ids = [t["source"]] if t["kind"] == "tei" else [s for s, _, _ in t["ranges"]]
        missing = [s for s in src_ids if s not in sources]
        if missing:
            raise SystemExit(f"neoplatonists: {t['id']}: source not in the manifest: {missing}")
        licence = sources[src_ids[0]][1]
        mine = [c for c in corrs if c["text"] == t["id"]]
        n_corr = 0
        per_corr = Counter()
        rows = []
        for i, u in enumerate(units):
            here = [c for c in mine if c.get("unit") in (None, u["n"])]
            corrected, used = apply_corrections(u["text"], here) if here else (u["text"], [])
            for o, r, k in used:
                per_corr[(o, r)] += k
                n_corr += k
            rows.append((t["id"], i, u["part"], u["n"], u["label"], u.get("page"), u.get("page_how"), u.get("lang", "grc"), u.get("source", t.get("source")),
                         u.get("leaf"), u["text"], corrected if used else None, specks(u), u.get("hidden", 0),
                         json.dumps(u["notes"], ensure_ascii=False) if u.get("notes") else None,
                         json.dumps(u["margin"], ensure_ascii=False) if u.get("margin") else None, words(u["text"])))
        n_words = sum(r[-1] for r in rows)
        latin = sum(1 for u in units if u.get("lang") == "lat")
        how = Counter(u.get("page_how") for u in units if t["kind"] == "ocr")
        db.execute("INSERT INTO neo_text (id, seq, grp, author, title, greek, cite, kind, source_ids, edition, editor, year, licence, about, unit_name, "
                   "n_parts, n_units, words, latin_units, proof_status, shelf, on_work) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                   (t["id"], seq, t["group"], t["author"], t["title"], t["greek"], t["cite"], t["kind"], json.dumps(src_ids), t["edition"], t["editor"], t["year"],
                    licence, t["about"], "page" if t["kind"] == "ocr" else t.get("unit") or "section", len(parts), len(units), n_words, latin,
                    "corrected source text (First1KGreek)" if t["kind"] == "tei" else "unproofread OCR, shown as received",
                    t.get("shelf", "neo"), t.get("on")))
        db.executemany("INSERT INTO neo_unit (text_id, seq, part_seq, n, label, page, page_how, lang, source_id, leaf, text, corrected, raw, hidden, notes, margin, words) "
                       "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", rows)
        index = {id(u): i for i, u in enumerate(units)}
        for pi, p in enumerate(parts):
            us = p["units"]
            db.execute("INSERT INTO neo_part VALUES (?,?,?,?,?,?,?)",
                       (t["id"], pi, p["label"], index[id(us[0])], index[id(us[-1])], len(us), sum(words(u["text"]) for u in us)))
        for c in mine:
            db.execute("INSERT INTO neo_correction (text_id, unit_n, ocr, read, why, by, applied) VALUES (?,?,?,?,?,?,?)",
                       (t["id"], c.get("unit"), c["ocr"], c["read"], c["why"], c.get("by", "the Workshop"), per_corr[(c["ocr"], c["read"])]))
        if t.get("shelf", "neo") != "neo":
            continue   # the Greek commentators on Aristotle: their report is tools/aristotle_commentators.py's
        stats["texts"].append({"id": t["id"], "author": t["author"], "title": t["title"], "kind": t["kind"], "edition": t["edition"],
                               "parts": len(parts), "units": len(units), "words": n_words, "latin": latin, "corrections": len(mine), "corrected": n_corr,
                               "pages_read": how.get("read", 0), "pages_counted": how.get("counted", 0), "pages_unnumbered": how.get(None, 0),
                               "hidden_lines": sum(u.get("hidden", 0) for u in units), "lines": sum(len(u.get("lines", [])) for u in units)})
        stats["units"] += len(units)
        stats["words"] += n_words
        stats["corrections"] += len(mine)
        stats["corrected_words"] += n_corr
    stats["not_here"] = NOT_HERE
    db.execute("INSERT INTO build VALUES ('neo_stats', ?)", (json.dumps(stats, ensure_ascii=False),))
    return stats


def write_report(stats):
    s = stats
    lines = ["# The rest of the Neoplatonists: what the import found", "",
             "Written by `tools/neoplatonists.py` when the library is built (milestone 25); every figure is counted from the build.", "",
             f"**{len(s['texts'])} texts, {s['units']:,} units, {s['words']:,} Greek words.** The TEI texts are First1KGreek's corrected text "
             "(CC BY-SA 4.0); the scans are the Internet Archive's OCR, shown as received. "
             f"{s['corrections']} corrections are kept apart (`sources/neoplatonists/corrections.json`) and change {s['corrected_words']:,} words "
             "in the corrected reading; the text shown is never changed.", "",
             "| Text | Edition | Kind | Contents | Units | Greek words |", "|---|---|---|---:|---:|---:|"]
    for t in s["texts"]:
        lines.append(f"| {t['author']}, {t['title']} (`{t['id']}`) | {t['edition']} | {'TEI' if t['kind'] == 'tei' else 'scan'} | "
                     f"{t['parts']} | {t['units']:,} | {t['words']:,} |")
    lines += ["", "**The scans, page by page.** A page number is *read* when it is found in the page's running head (or stands alone at its head or foot) "
              "and agrees with the numbers of the pages around it (within twelve, at least three agreeing); *counted* between two read pages; otherwise the page is named by its image. "
              "Pages under a third Greek are folded away as Latin.", "",
              "| Text | Pages | Number read | Counted | By image | Latin pages | Lines hidden as specks |", "|---|---:|---:|---:|---:|---:|---:|"]
    for t in s["texts"]:
        if t["kind"] == "ocr":
            lines.append(f"| {t['author']}, {t['title']} | {t['units']} | {t['pages_read']} | {t['pages_counted']} | {t['pages_unnumbered']} | "
                         f"{t['latin']} | {t['hidden_lines']:,} of {t['lines']:,} |")
    lines += ["", "**Not here, and why.**", ""]
    lines += [f"- {a}: {b}." for a, b in s["not_here"]]
    lines.append("")
    REPORT.write_text("\n".join(lines), encoding="utf-8")


def main():
    if "--extract" in sys.argv:
        # After tools/fetch_sources.py --archive: copy the OCR of the pages the texts read into sources/neoplatonists/ocr/.
        for src in sorted(scan_ranges()):
            write_extract(src)
            print(f"wrote {(OCR_COPY / (src + '.json.gz')).relative_to(ROOT)} ({(OCR_COPY / (src + '.json.gz')).stat().st_size:,} bytes)")
        return
    if "--check" in sys.argv:
        only = [a for a in sys.argv[1:] if not a.startswith("--")]
        only = [t["id"] for t in TEXTS if any(o in t["id"] for o in only)] or None
        for t, units, parts in read_all(only):
            print(f"{t['id']}: {len(parts)} parts, {len(units)} units, {sum(words(u['text']) for u in units):,} words")
            for p in parts[:3] + parts[-2:]:
                print(f"   {p['label'][:90]} ({len(p['units'])})")
            if only:
                for u in units[:: max(1, len(units) // 25)]:
                    print(f"     {u['n']:<28} {u['label']:<14} {u.get('page_how') or '':<8} {u.get('lang', ''):<4} {u['text'][:70]!r}")
        return
    print(__doc__)


if __name__ == "__main__":
    main()
