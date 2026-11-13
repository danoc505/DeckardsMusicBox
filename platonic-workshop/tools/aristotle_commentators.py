#!/usr/bin/env python3
"""Aristotle milestone A5: the Greek commentators on Aristotle, on their own shelf.

The Commentaria in Aristotelem Graeca (Berlin: Reimer, 1882-1909), the Berlin Academy's edition of the Greek
commentators, in First1KGreek's corrected TEI (CC BY-SA 4.0; source first1k-commentators in sources/manifest.json):
Alexander of Aphrodisias, Porphyry, Ammonius, Simplicius, Philoponus, Syrianus, Asclepius, Olympiodorus, Elias and
David, and Alexander's own On the Soul with its Mantissa (Supplementum Aristotelicum II.1, Bruns, 1887), which the
later school read on the intellect of De Anima III 5. They are read whole, like the Neoplatonists of milestone 25
(tools/neoplatonists.py stores them in neo_text, neo_part and neo_unit, with shelf = 'commentators'), and shown by
the same reader.

How a commentary is read (read_cag; nothing guessed):

1. The unit is a page of the Berlin edition (<pb n>), the page every commentary is cited by ("Simpl. in Phys. 1361,
   11" is page 1361, line 11). Where a page number in the file does not fit between the pages on either side of it
   (Alexander on the Metaphysics prints 393 between 322 and 324) it is read as the page between them, and the reader
   says so. Pages numbered in Roman (the end of the editor's preface, the indices) and the indices themselves are
   left out and counted.
2. The contents are twenty pages at a time, named by the book of Aristotle they are in where the file's divisions
   are the books (BOOKS below).
3. The editor's apparatus and the marginal notes (the folios of the manuscript or of the Aldine edition, and the
   Bekker page, column and line of the passage commented on) are kept apart from the text, as the file marks them.

How a page is linked to the Aristotle it comments on (link; build_db.py calls it once Aristotle's Greek is built):

  printed  the editor prints Bekker's page, column and line in the margin ("p. 980a21") beside the lemma, or the
           file names a division by it (Alexander on the Prior Analytics, "24a10"); the column must be one of the
           work's own. Porphyry's Introduction is cited by Busse's page and line ("p. 5, 17").
  quoted   the page repeats at least two runs of five words, accents aside, that stand in one column of Aristotle's
           Greek and in no other column of that work: a lemma or a quotation, found by the words (≈).

    python3 tools/aristotle_commentators.py --check            # read every commentary and print what it holds
    python3 tools/aristotle_commentators.py --check simplicius  # those whose id has this in it
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCE = "first1k-commentators"
DATA = ROOT / "data" / "raw" / SOURCE / "data"
TEI_NS = "{http://www.tei-c.org/ns/1.0}"
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"]
METAPH = ["Α", "α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν"]
PAGES_PER_PART = 20


def cag(vol, editor, year, title):
    return f"{title}, ed. {editor}, Commentaria in Aristotelem Graeca {vol} (Berlin: Reimer, {year})"


def books(n, names=None):
    """The file's top divisions 1..n are the books of the work commented on."""
    names = names or [f"Book {ROMAN[i]}" for i in range(1, n + 1)]
    return {str(i + 1): names[i] for i in range(n)}


# The shelf, by the work commented on, in the Platonists' order of reading: the introductions and Porphyry first, then
# the logic, the physics and the soul, and the Metaphysics last. on: the Workshop's id of the work commented on
# ('isagoge' for Porphyry's Introduction; None where the Workshop does not have the work yet).
_T = [
    # group, id, author, title, greek, cite, file, on, vol, editor, year, edition title, about, books
    ("Introductions to philosophy and to Aristotle", "ammonius-isagoge", "Ammonius", "On Porphyry's Introduction", "Εἰς τὴν Πορφυρίου εἰσαγωγήν",
     "in Isag.", "tlg4016/tlg001/tlg4016.tlg001.1st1K-grc1.xml", "isagoge", "IV.3", "Adolf Busse", 1891, "Ammonius in Porphyrii Isagogen sive V voces",
     "Ammonius, Proclus' pupil and head of the school at Alexandria, on the five words; it opens with his definitions of philosophy.", None),
    ("Introductions to philosophy and to Aristotle", "olympiodorus-prolegomena", "Olympiodorus", "Prolegomena to the logic", "Προλεγόμενα",
     "Prol.", "tlg4019/tlg001/tlg4019.tlg001.1st1K-grc1.xml", None, "XII.1", "Adolf Busse", 1902, "Olympiodori prolegomena et in Categorias commentarium",
     "The ten questions asked before reading Aristotle (the names of the schools, the order of reading, the aim of his philosophy, why he is obscure), "
     "as Olympiodorus put them to his class at Alexandria in the 6th century.", None),
    ("Introductions to philosophy and to Aristotle", "elias-isagoge", "Elias", "Prolegomena to philosophy, and on Porphyry's Introduction", "Προλεγόμενα τῆς φιλοσοφίας",
     "in Isag.", "tlg4020/tlg001/tlg4020.tlg001.1st1K-grc1.xml", "isagoge", "XVIII.1", "Adolf Busse", 1900, "Eliae in Porphyrii Isagogen et Aristotelis Categorias commentaria",
     "Olympiodorus' pupil: the six definitions of philosophy and its divisions, then a commentary on the Introduction, lecture by lecture.", None),
    ("Introductions to philosophy and to Aristotle", "david-prolegomena", "David", "Prolegomena to philosophy", "Προλεγόμενα τῆς φιλοσοφίας",
     "Prol.", "tlg4021/tlg001/tlg4021.tlg001.1st1K-grc1.xml", None, "XVIII.2", "Adolf Busse", 1904, "Davidis prolegomena et in Porphyrii Isagogen commentarium",
     "The same course as Elias', from a pupil of the same school: whether philosophy is, what it is, of what sort, and why.", None),
    ("Introductions to philosophy and to Aristotle", "david-isagoge", "David", "On Porphyry's Introduction", "Εἰς τὴν Πορφυρίου εἰσαγωγήν",
     "in Isag.", "tlg4021/tlg002/tlg4021.tlg002.1st1K-grc1.xml", "isagoge", "XVIII.2", "Adolf Busse", 1904, "Davidis prolegomena et in Porphyrii Isagogen commentarium",
     "David's lectures on the Introduction, after its own prolegomena.", None),
    ("Categories", "porphyry-categories", "Porphyry", "On the Categories, by question and answer", "Εἰς τὰς Ἀριστοτέλους Κατηγορίας κατὰ πεῦσιν καὶ ἀπόκρισιν",
     "in Cat.", "tlg2034/tlg007/tlg2034.tlg007.opp-grc1.xml", "ar006", "IV.1", "Adolf Busse", 1887, "Porphyrii Isagoge et in Aristotelis Categorias commentarium",
     "Porphyry's shorter commentary, for beginners, as questions and answers: the Categories as a book about words that signify things.", None),
    ("Categories", "ammonius-categories", "Ammonius", "On the Categories", "Εἰς τὰς Ἀριστοτέλους Κατηγορίας",
     "in Cat.", "tlg4016/tlg002/tlg4016.tlg002.1st1K-grc1.xml", "ar006", "IV.4", "Adolf Busse", 1895, "Ammonius in Aristotelis Categorias commentarius",
     "Ammonius' lectures, with the prolegomena on Aristotle's writings and the order in which they are read.", None),
    ("Categories", "philoponus-categories", "Philoponus", "On the Categories", "Εἰς τὰς Ἀριστοτέλους Κατηγορίας",
     "in Cat.", "tlg4015/tlg001/tlg4015.tlg001.1st1K-grc1.xml", "ar006", "XIII.1", "Adolf Busse", 1898, "Philoponi (olim Ammonii) in Aristotelis Categorias commentarium",
     "Philoponus' notes from Ammonius' lectures (printed under Ammonius' name in 1546).", None),
    ("Categories", "olympiodorus-categories", "Olympiodorus", "On the Categories", "Εἰς τὰς Κατηγορίας",
     "in Cat.", "tlg4019/tlg002/tlg4019.tlg002.1st1K-grc1.xml", "ar006", "XII.1", "Adolf Busse", 1902, "Olympiodori prolegomena et in Categorias commentarium",
     "Olympiodorus' lectures on the Categories, after his Prolegomena.", None),
    ("Categories", "elias-categories", "Elias", "On the Categories", "Εἰς τὰς Κατηγορίας",
     "in Cat.", "tlg4020/tlg002/tlg4020.tlg002.1st1K-grc1.xml", "ar006", "XVIII.1", "Adolf Busse", 1900, "Eliae in Porphyrii Isagogen et Aristotelis Categorias commentaria",
     "Elias' lectures on the Categories (once ascribed to David), with prolegomena to Aristotle.", None),
    ("Categories", "simplicius-categories", "Simplicius", "On the Categories", "Εἰς τὰς Ἀριστοτέλους Κατηγορίας",
     "in Cat.", "tlg4013/tlg003/tlg4013.tlg003.1st1K-grc1.xml", "ar006", "VIII", "Karl Kalbfleisch", 1907, "Simplicii in Aristotelis Categorias commentarium",
     "The fullest of the commentaries: Simplicius gathers Porphyry, Iamblichus and the objections of Plotinus, and reconciles Aristotle's categories with Plato.", None),
    ("On Interpretation", "ammonius-interpretation", "Ammonius", "On On Interpretation", "Εἰς τὸ Περὶ ἑρμηνείας",
     "in Int.", "tlg4016/tlg003/tlg4016.tlg003.1st1K-grc1.xml", "ar017", "IV.5", "Adolf Busse", 1897, "Ammonius in Aristotelis De interpretatione commentarius",
     "Ammonius' commentary, from Proclus' lectures as he says: names, sentences, and the sea battle of tomorrow.", None),
    ("Prior Analytics", "alexander-prior-analytics", "Alexander of Aphrodisias", "On the Prior Analytics, Book I", "Εἰς τὸ πρῶτον τῶν Ἀναλυτικῶν προτέρων",
     "in APr.", "tlg0732/tlg005/tlg0732.tlg005.1st1K-grc1.xml", "ar001", "II.1", "Maximilian Wallies", 1883, "Alexandri in Aristotelis Analyticorum priorum librum I commentarium",
     "The oldest commentary on the syllogism, from the Peripatetic Alexander (about 200 AD), whom the Platonists read as the commentator.", None),
    ("Prior Analytics", "ammonius-prior-analytics", "Ammonius", "On the Prior Analytics, Book I", "Εἰς τὸ πρῶτον τῶν Προτέρων ἀναλυτικῶν",
     "in APr.", "tlg4016/tlg004/tlg4016.tlg004.1st1K-grc1.xml", "ar001", "IV.6", "Maximilian Wallies", 1899, "Ammonii in Aristotelis Analyticorum priorum librum I commentarium",
     "Notes from Ammonius' lectures, from one manuscript (Paris. gr. 2064).", None),
    ("Prior Analytics", "philoponus-prior-analytics", "Philoponus", "On the Prior Analytics", "Εἰς τὰ Πρότερα ἀναλυτικά",
     "in APr.", "tlg4015/tlg002/tlg4015.tlg002.1st1K-grc1.xml", "ar001", "XIII.2", "Maximilian Wallies", 1905, "Ioannis Philoponi in Aristotelis Analytica priora commentaria",
     "Philoponus on both books, from Ammonius' lectures.", None),
    ("Posterior Analytics", "philoponus-posterior-analytics", "Philoponus", "On the Posterior Analytics", "Εἰς τὰ Ὕστερα ἀναλυτικά",
     "in APo.", "tlg4015/tlg004/tlg4015.tlg004.1st1K-grc1.xml", "ar001p", "XIII.3", "Maximilian Wallies", 1909, "Ioannis Philoponi in Aristotelis Analytica posteriora commentaria",
     "Philoponus on demonstration and how first principles are known; the second book's commentary is of uncertain author.", books(2)),
    ("Topics", "alexander-topics", "Alexander of Aphrodisias", "On the Topics", "Εἰς τὰ Τοπικά",
     "in Top.", "tlg0732/tlg006/tlg0732.tlg006.1st1K-grc1.xml", "ar044", "II.2", "Maximilian Wallies", 1891, "Alexandri in Aristotelis Topicorum libros octo commentaria",
     "Alexander on the eight books of dialectic.", books(8)),
    ("Sophistical Refutations", "alexander-sophistical-refutations", "[Alexander of Aphrodisias]", "On the Sophistical Refutations", "Εἰς τοὺς Σοφιστικοὺς ἐλέγχους",
     "in SE", "tlg0732/tlgX01/tlg0732.tlgX01.1st1K-grc1.xml", "ar040", "II.3", "Maximilian Wallies", 1898, "Pseudo-Alexandri quod fertur in Aristotelis Sophisticos elenchos commentarium",
     "A Byzantine commentary printed under Alexander's name (now given to Michael of Ephesus, 12th century).", None),
    ("Physics", "simplicius-physics", "Simplicius", "On the Physics", "Εἰς τὰ Φυσικά",
     "in Phys.", "tlg4013/tlg004/tlg4013.tlg004.1st1K-grc1.xml", "ar031", "IX-X", "Hermann Diels", 1882, "Simplicii in Aristotelis Physicorum libros commentaria",
     "Simplicius' great commentary, which keeps much of what survives of Parmenides and the Presocratics, quoted at length, and his answer to Philoponus on "
     "the eternity of the world. First1KGreek's file stops at p. 551, in Book IV, and starts again at p. 801 with Book V: the rest of Book IV, with his "
     "Corollaries on place and on time, is not here.", books(8)),
    ("Physics", "philoponus-physics", "Philoponus", "On the Physics", "Εἰς τὰ Φυσικά",
     "in Phys.", "tlg4015/tlg009/tlg4015.tlg009.1st1K-grc1.xml", "ar031", "XVI-XVII", "Girolamo Vitelli", 1887, "Ioannis Philoponi in Aristotelis Physicorum libros octo commentaria",
     "Philoponus on Books I-IV in Greek, with his arguments on place, the void and motion; Books V-VIII survive only in excerpts, which Vitelli prints.", None),
    ("On the Heavens", "simplicius-de-caelo", "Simplicius", "On the Heavens", "Εἰς τὸ Περὶ οὐρανοῦ",
     "in Cael.", "tlg4013/tlg001/tlg4013.tlg001.1st1K-grc1.xml", "ar005", "VII", "J. L. Heiberg", 1894, "Simplicii in Aristotelis De caelo commentaria",
     "Simplicius on the fifth body and the eternity of the heavens, against Philoponus, whose lost Against Aristotle survives in what he quotes.", books(4)),
    ("Generation and Corruption", "philoponus-generation", "Philoponus", "On Generation and Corruption", "Εἰς τὸ Περὶ γενέσεως καὶ φθορᾶς",
     "in GC", "tlg4015/tlg006/tlg4015.tlg006.1st1K-grc1.xml", "ar013", "XIV.2", "Girolamo Vitelli", 1897, "Ioannis Philoponi in Aristotelis libros De generatione et corruptione commentaria",
     "Philoponus on the two books of coming to be and passing away.", books(2)),
    ("Meteorology", "alexander-meteorology", "Alexander of Aphrodisias", "On the Meteorology", "Εἰς τὰ Μετεωρολογικά",
     "in Meteor.", "tlg0732/tlg008/tlg0732.tlg008.1st1K-grc1.xml", "ar026", "III.2", "Michael Hayduck", 1899, "Alexandri in Aristotelis Meteorologicorum libros commentaria",
     "Alexander on the four books of the Meteorology.", books(4)),
    ("Meteorology", "philoponus-meteorology", "Philoponus", "On the Meteorology, Book I", "Εἰς τὸ πρῶτον τῶν Μετεωρολογικῶν",
     "in Meteor.", "tlg4015/tlg005/tlg4015.tlg005.1st1K-grc1.xml", "ar026", "XIV.1", "Michael Hayduck", 1901, "Ioannis Philoponi in Aristotelis Meteorologicorum librum primum commentarium",
     "Philoponus on the first book.", None),
    ("Meteorology", "olympiodorus-meteorology", "Olympiodorus", "On the Meteorology", "Εἰς τὰ Μετεωρολογικά",
     "in Meteor.", "tlg4019/tlg003/tlg4019.tlg003.1st1K-grc1.xml", "ar026", "XII.2", "Wilhelm Stüve", 1900, "Olympiodori in Aristotelis Meteora commentaria",
     "Olympiodorus' lectures on the four books.", books(4)),
    ("On the Soul", "alexander-de-anima", "Alexander of Aphrodisias", "On the Soul (his own treatise)", "Περὶ ψυχῆς",
     "de An.", "tlg0732/tlg010/tlg0732.tlg010.1st1K-grc1.xml", "ar002", "Supplementum II.1", "Ivo Bruns", 1887, "Alexandri Aphrodisiensis praeter commentaria scripta minora: De anima liber cum mantissa",
     "Not a commentary but Alexander's own treatise on the soul, after Aristotle's: the material intellect, and the intellect that makes it think, "
     "which he takes to be the first cause. The later school argued with it on De Anima III 5.", None),
    ("On the Soul", "alexander-mantissa", "Alexander of Aphrodisias", "Mantissa (supplement to On the Soul), with On the Intellect", "Περὶ ψυχῆς βιβλίον δεύτερον",
     "Mant.", "tlg0732/tlg011/tlg0732.tlg011.1st1K-grc1.xml", "ar002", "Supplementum II.1", "Ivo Bruns", 1887, "Alexandri Aphrodisiensis praeter commentaria scripta minora: De anima liber cum mantissa",
     "Twenty-five short essays from Alexander's school; the first, On the Intellect (Περὶ νοῦ), on the intellect \"from outside\", is the text the "
     "medieval and Renaissance debates on the active intellect start from.", None),
    ("On the Soul", "simplicius-de-anima", "[Simplicius]", "On the Soul", "Εἰς τὸ Περὶ ψυχῆς",
     "in de An.", "tlg4013/tlg005/tlg4013.tlg005.1st1K-grc1.xml", "ar002", "XI", "Michael Hayduck", 1882, "Simplicii in libros Aristotelis De anima commentaria",
     "Printed as Simplicius'; perhaps by Priscian of Lydia. A strictly Neoplatonic reading of the soul and of the intellect of Book III.", books(3)),
    ("On the Soul", "philoponus-de-anima", "Philoponus", "On the Soul", "Εἰς τὸ Περὶ ψυχῆς",
     "in de An.", "tlg4015/tlg008/tlg4015.tlg008.1st1K-grc1.xml", "ar002", "XV", "Michael Hayduck", 1897, "Ioannis Philoponi in Aristotelis De anima libros commentaria",
     "Philoponus from Ammonius' lectures; the commentary printed on Book III is of uncertain author (Philoponus' own on III 4-8 "
     "survives in William of Moerbeke's Latin, not here).", books(3)),
    ("Sense and Generation of Animals", "alexander-de-sensu", "Alexander of Aphrodisias", "On Sense and Sensibles", "Εἰς τὸ Περὶ αἰσθήσεως",
     "in Sens.", "tlg0732/tlg007/tlg0732.tlg007.1st1K-grc1.xml", None, "III.1", "Paul Wendland", 1901, "Alexandri in librum De sensu commentarium",
     "Alexander on the first of the short treatises on nature (the Workshop does not have the treatise itself yet).", None),
    ("Sense and Generation of Animals", "philoponus-generation-animals", "[Philoponus]", "On the Generation of Animals", "Εἰς τὸ Περὶ ζῴων γενέσεως",
     "in GA", "tlg4015/tlg007/tlg4015.tlg007.1st1K-grc1.xml", "ar012", "XIV.3", "Michael Hayduck", 1903, "Ioannis Philoponi (Michaelis Ephesii) in libros De generatione animalium commentaria",
     "Printed under Philoponus' name; by Michael of Ephesus (12th century).", books(5)),
    ("Metaphysics", "alexander-metaphysics", "Alexander of Aphrodisias", "On the Metaphysics", "Εἰς τὰ Μετὰ τὰ φυσικά",
     "in Metaph.", "tlg0732/tlg004/tlg0732.tlg004.1st1K-grc1.xml", "ar025", "I", "Michael Hayduck", 1891, "Alexandri Aphrodisiensis in Aristotelis Metaphysica commentaria",
     "Alexander on Books Α-Δ; the commentary on Ε-Ν printed with it is a later one (now generally given to Michael of Ephesus). On Α 9 it keeps much of Aristotle's lost "
     "On the Ideas.", books(14, [f"Book {x}" for x in METAPH])),
    ("Metaphysics", "syrianus-metaphysics", "Syrianus", "On the Metaphysics, Books Β, Γ, Μ and Ν", "Εἰς τὰ Μετὰ τὰ φυσικά",
     "in Metaph.", "tlg4017/tlg001/tlg4017.tlg001.1st1K-grc1.xml", "ar025", "VI.1", "Wilhelm Kroll", 1902, "Syriani in Metaphysica commentaria",
     "Proclus' master answers Aristotle's criticism of the Forms and of the Pythagorean numbers in Books Μ and Ν, defending Plato and the Pythagoreans. Taylor translated extracts in his Metaphysics (1801).", books(3, ["Book Β", "Book Γ", "Books Μ and Ν"])),
    ("Metaphysics", "asclepius-metaphysics", "Asclepius", "On the Metaphysics, Books Α-Ζ", "Εἰς τὰ Μετὰ τὰ φυσικά",
     "in Metaph.", "tlg4018/tlg001/tlg4018.tlg001.1st1K-grc1.xml", "ar025", "VI.2", "Michael Hayduck", 1888, "Asclepii in Aristotelis Metaphysicorum libros Α-Ζ commentaria",
     "Asclepius' notes \"from the voice of Ammonius\", his lectures at Alexandria.", books(7, [f"Book {x}" for x in METAPH[:7]])),
]

TEXTS = []
for (grp, tid, author, title, gk, cite, f, on, vol, editor, year, ed_title, about, bk) in _T:
    edition = (f"{ed_title}, ed. {editor}, Supplementum Aristotelicum II.1 (Berlin: Reimer, {year})" if vol.startswith("Supplementum")
               else cag(vol, editor, year, ed_title))
    TEXTS.append({"id": tid, "group": grp, "author": author, "title": title, "greek": gk, "cite": cite, "kind": "tei", "reader": "cag",
                  "shelf": "commentators", "source": SOURCE, "file": f, "on": on, "edition": edition, "editor": editor, "year": year,
                  "unit": "page", "books": bk, "about": about})

# The divisions that are not the commentary: the editor's sigla and the indices.
NOT_TEXT = {"sigla", "indices"}

# Asked for in the roadmap and not here, with why.
NOT_HERE = [
    ("Philoponus, Against Proclus on the Eternity of the World, and the other CAG volumes not in First1KGreek (Themistius' paraphrases, "
     "Dexippus, Michael of Ephesus on the Ethics and the Parva naturalia, Eustratius, Stephanus)", "not in First1KGreek at the pinned commit; "
     "they are on the Internet Archive as scans and can be added as OCR, as the Neoplatonists of milestone 25"),
]


# ---------------------------------------------------------------- reading a commentary

def _local(tag):
    return tag.split("}", 1)[-1] if isinstance(tag, str) else ""


def _walk(el, out, depth=0):
    """Flatten the body into events: ('top', n) at each top division, ('pb', n), ('head', s), ('note', type, s),
    ('div', subtype, n) for a division named by Bekker's reference, ('text', s), ('break',)."""
    tag = _local(el.tag)
    if tag == "note":
        out.append(("note", el.get("type") or "note", " ".join("".join(el.itertext()).split())))
    elif tag == "head":
        out.append(("head", " ".join("".join(el.itertext()).split())))
    else:
        if tag == "pb":
            out.append(("pb", el.get("n")))
        if tag == "div" and el.get("type") == "textpart":
            if depth == 0:
                out.append(("top", el.get("n")))
            out.append(("div", el.get("subtype"), el.get("n")))
        if el.text and tag not in ("pb", "lb", "milestone"):
            out.append(("text", el.text))
        inner = depth + 1 if tag == "div" and el.get("type") == "textpart" else depth
        for c in el:
            _walk(c, out, inner)
        if tag in ("p", "l", "lg"):
            out.append(("break",))
    if el.tail:
        out.append(("text", el.tail))


def _clean(s):
    return re.sub(r"[ \t]+", " ", re.sub(r" *\n *", "\n", s)).strip()


def page_numbers(ns):
    """The Berlin pages of the file's <pb n>, in order: [(page or None, how)]. A number that does not fit between the
    pages on either side of it (one before and one after, two apart) is read as the page between them."""
    raw = [int(n) if (n or "").isdigit() else None for n in ns]
    out = []
    for i, p in enumerate(raw):
        if p is None:
            out.append((None, "roman"))
            continue
        a = raw[i - 1] if i > 0 else None
        b = raw[i + 1] if i + 1 < len(raw) else None
        if a is not None and b is not None and b == a + 2 and p != a + 1:
            out.append((a + 1, f"the file prints {p}"))
        else:
            out.append((p, None))
    return out


def read_cag(t):
    """[units], [parts] of one commentary, by the Berlin pages. A unit: {n, label, page, text, notes, margin, part, bekker, how}."""
    root = ET.parse(DATA / t["file"]).getroot()
    body = root.find(f".//{TEI_NS}body")
    ed = body.find(f"{TEI_NS}div")
    ev = []
    for c in ed:
        _walk(c, ev)
    pages = iter(page_numbers([e[1] for e in ev if e[0] == "pb"]))
    units, top, cur, seen = [], None, None, Counter()
    stats = t.setdefault("_stats", {"pages_left_out": 0, "words_left_out": 0, "pages_read_between": 0})
    for e in ev:
        k = e[0]
        if k == "top":
            top = e[1]
            if top in NOT_TEXT:
                cur = None
            continue
        if k == "pb":
            p, how = next(pages)
            if p is None or top in NOT_TEXT:
                cur = None
                stats["pages_left_out"] += 1
                continue
            seen[p] += 1
            n = str(p) if seen[p] == 1 else f"{p}.{seen[p]}"
            cur = {"n": n, "label": f"p. {p}", "page": p, "text": "", "notes": [], "margin": [], "top": top, "divs": [], "how": how}
            if how:
                stats["pages_read_between"] += 1
            units.append(cur)
            continue
        if cur is None:
            if k == "text":
                stats["words_left_out"] += len(greek.WORD.findall(e[1]))
            continue
        if k == "head":
            cur["text"] += "\n" + e[1] + "\n"
        elif k == "note":
            (cur["margin"] if e[1] == "marginal" else cur["notes"]).append(e[2])
        elif k == "div":
            cur["divs"].append(e[2] or "")
        elif k == "text":
            cur["text"] += e[1]
        elif k == "break":
            cur["text"] += "\n"
    for u in units:
        u["text"] = _clean(u["text"])
    units = [u for u in units if u["text"] or u["notes"]]
    # The contents: twenty pages at a time, within a book where the file's top divisions are the books.
    parts = []
    bk = t.get("books") or {}
    for u in units:
        label = bk.get(u["top"])
        if not parts or parts[-1]["book"] != label or len(parts[-1]["units"]) >= PAGES_PER_PART:
            parts.append({"book": label, "units": [], "head": None, "key": ()})
        parts[-1]["units"].append(u)
        u["part"] = len(parts) - 1
    for p in parts:
        a, b = p["units"][0]["page"], p["units"][-1]["page"]
        rng = f"p. {a}" if a == b else f"pp. {a}–{b}"
        p["label"] = f"{p['book']}, {rng}" if p["book"] else rng
    return units, parts


def gaps(units):
    """Runs of Berlin pages missing from the file: [(first, last)]."""
    ps = sorted({u["page"] for u in units})
    return [(a + 1, b - 1) for a, b in zip(ps, ps[1:]) if b - a > 1]


# ---------------------------------------------------------------- the links to Aristotle

BEKKER = re.compile(r"^p\.?\s*(\d{2,4})\s*([ab])\s*(\d{1,2})\b")
BEKKER_DIV = re.compile(r"^(\d{2,4})([ab])(\d{1,2})")
ISAGOGE = re.compile(r"^p\.?\s*(\d{1,2})\s*,\s*(\d{1,2})\b")
SHINGLE = 5


def printed_refs(t, u):
    """[(column, as printed)] of one page: the Bekker references in its margin (and in the names of its divisions)."""
    out = []
    if t["on"] == "isagoge":
        for m in u.get("margin") or []:
            x = ISAGOGE.match(m)
            if x:
                out.append((f"1.{int(x.group(1))}", m))
        return out
    for m in u.get("margin") or []:
        x = BEKKER.match(m)
        if x:
            out.append((f"{int(x.group(1))}{x.group(2)}", m))
    for d in u.get("divs") or []:
        x = BEKKER_DIV.match(d)
        if x:
            out.append((f"{int(x.group(1))}{x.group(2)}", d))
    return out


def _plain_words(text):
    return [greek.strip_accents(w).rstrip(greek.APOSTROPHES) for w in greek.WORD.findall(greek.nfc(text or ""))]


def _shingles(ws):
    return {" ".join(ws[i:i + SHINGLE]) for i in range(len(ws) - SHINGLE + 1)}


def unique_shingles(columns):
    """{run of five words: column} for the runs that stand in one column only. columns: [(column, [plain words])]."""
    owner, many = {}, set()
    for ref, ws in columns:
        for x in _shingles(ws):
            if x in owner and owner[x] != ref:
                many.add(x)
            owner.setdefault(x, ref)
    for x in many:
        del owner[x]
    return owner


def column_shingles(db, work_id):
    """The unique runs of a work's Greek, by Bekker column, and its columns in order. Porphyry's Introduction
    ('isagoge') by Busse's pages, from the Neoplatonists' shelf."""
    if work_id == "isagoge":
        rows = db.execute("SELECT n, text FROM neo_unit WHERE text_id = 'porphyry-isagoge' ORDER BY seq").fetchall()
        return unique_shingles([(n, _plain_words(text)) for n, text in rows]), [n for n, _ in rows]
    ed = db.execute("SELECT id FROM edition WHERE work_id = ? AND lang = 'grc' AND role = 'text'", (work_id,)).fetchone()
    if not ed:
        return {}, []
    cols = defaultdict(list)
    for ref, plain in db.execute("SELECT section_ref, plain FROM token WHERE edition_id = ? ORDER BY id", (ed[0],)):
        cols[ref].append(plain.rstrip(greek.APOSTROPHES))
    order = [r for (r,) in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work_id,))]
    return unique_shingles(cols.items()), order


def link(db):
    """Fill ar_comment: for each page of a commentary on a work the Workshop has, the columns of Aristotle it comments on,
    printed or quoted. Returns the figures for the report."""
    texts = {t["id"]: t for t in TEXTS}
    stats = {"texts": {}, "printed": 0, "quoted": 0, "pages_linked": 0, "printed_not_a_column": 0}
    by_work = defaultdict(list)
    for t in TEXTS:
        if t["on"]:
            by_work[t["on"]].append(t["id"])
    for work, tids in by_work.items():
        owner, order = column_shingles(db, work)
        if not order:
            continue
        valid = set(order)
        for tid in tids:
            t = texts[tid]
            s = {"printed": 0, "quoted": 0, "pages": 0, "not_a_column": 0}
            for seq, n, text, margin in db.execute("SELECT seq, n, text, margin FROM neo_unit WHERE text_id = ? ORDER BY seq", (tid,)).fetchall():
                u = {"margin": json.loads(margin) if margin else [], "divs": DIVS.get((tid, n), [])}
                rows = {}
                for col, how in printed_refs(t, u):
                    if col in valid:
                        rows.setdefault(col, ("printed", how))
                    else:
                        s["not_a_column"] += 1
                if owner:
                    hits = Counter(owner[x] for x in _shingles(_plain_words(text)) if x in owner)
                    for col, k in hits.items():
                        if k >= 2 and col not in rows:
                            rows[col] = ("quoted", f"{k} runs of five words")
                for col, (how, what) in rows.items():
                    db.execute("INSERT INTO ar_comment (work_id, col, text_id, unit_seq, how, what) VALUES (?,?,?,?,?,?)",
                               (work, col, tid, seq, how, what))
                    s[how] += 1
                s["pages"] += bool(rows)
            stats["texts"][tid] = s
            stats["printed"] += s["printed"]
            stats["quoted"] += s["quoted"]
            stats["pages_linked"] += s["pages"]
            stats["printed_not_a_column"] += s["not_a_column"]
    return stats


# The names of the divisions a page opens (Alexander on the Prior Analytics names them by Bekker's reference), kept from
# reading for link(): neo_unit does not store them.
DIVS = {}


def read(t):
    units, parts = read_cag(t)
    for u in units:
        u["page_how"] = u["how"]
        if u["divs"]:
            DIVS[(t["id"], u["n"])] = u["divs"]
    return units, parts


REPORT = ROOT / "reports" / "commentators.md"


def write_report(db, stats):
    """reports/commentators.md: what was read, what is missing, and how each commentary is linked to Aristotle."""
    names = {r[0]: r[1] for r in db.execute("SELECT id, title FROM work")}
    names["isagoge"] = "Porphyry's Introduction"
    lines = ["# The Greek commentators on Aristotle: what the import found", "",
             "Written by `tools/aristotle_commentators.py` when the library is built (Aristotle milestone A5); every figure is counted from the build.", "",
             "The text is First1KGreek's TEI of the *Commentaria in Aristotelem Graeca* (CC BY-SA 4.0), read by the Berlin pages. A page is linked to a "
             "column of Aristotle when the editor prints the column's reference in the margin (*printed*), or when the page repeats at least two runs of "
             "five words found in that column and in no other column of the work (*quoted*, ≈: a lemma, or a quotation from elsewhere in the work).", "",
             f"**{stats['pages_linked']:,} pages linked: {stats['printed']:,} links printed, {stats['quoted']:,} quoted.** "
             f"{stats['printed_not_a_column']:,} printed references name no column of the Workshop's text and are left unlinked.", "",
             "| Commentary | On | Pages | Greek words | Pages linked | Printed | Quoted | Pages missing from the file | Pages left out |",
             "|---|---|---:|---:|---:|---:|---:|---|---:|"]
    for t in TEXTS:
        row = db.execute("SELECT n_units, words FROM neo_text WHERE id = ?", (t["id"],)).fetchone()
        if not row:
            continue
        pages = [p for (p,) in db.execute("SELECT page FROM neo_unit WHERE text_id = ? ORDER BY seq", (t["id"],))]
        ps = sorted(set(pages))
        miss = ", ".join(f"{a}" if a == b else f"{a}-{b}" for a, b in ((a + 1, b - 1) for a, b in zip(ps, ps[1:]) if b - a > 1)) or "none"
        s = stats["texts"].get(t["id"], {})
        lines.append(f"| {t['author']}, {t['title']} (`{t['id']}`) | {names.get(t['on'], 'not in the Workshop yet') if t['on'] else ('philosophy, and Aristotle as a whole' if t['group'].startswith('Introductions') else 'not in the Workshop yet')} | "
                     f"{row[0]:,} | {row[1]:,} | {s.get('pages', 0):,} | {s.get('printed', 0):,} | {s.get('quoted', 0):,} | {miss} | "
                     f"{t.get('_stats', {}).get('pages_left_out', 0)} |")
    lines += ["", "*Pages left out*: numbered in Roman (the end of the editor's preface) or in the indices. *Pages missing from the file*: "
              "Berlin pages between the first and the last that the file does not have.", "",
              "**Not here, and why.**", ""]
    lines += [f"- {a}: {b}." for a, b in NOT_HERE]
    lines.append("")
    REPORT.write_text("\n".join(lines), encoding="utf-8")


def available():
    return all((DATA / t["file"]).exists() for t in TEXTS)


def main():
    if "--check" in sys.argv:
        only = [a for a in sys.argv[1:] if not a.startswith("--")]
        for t in TEXTS:
            if only and not any(o in t["id"] for o in only):
                continue
            units, parts = read(t)
            words = sum(len(greek.WORD.findall(u["text"])) for u in units)
            refs = sum(len(printed_refs(t, u)) for u in units)
            print(f"{t['id']}: {len(parts)} parts, {len(units)} pages, {words:,} words, {refs} printed references; "
                  f"gaps {gaps(units)[:6]}; {t['_stats']}")
            if only:
                for p in parts:
                    print("   ", p["label"], len(p["units"]))
        return
    print(__doc__)


if __name__ == "__main__":
    main()
