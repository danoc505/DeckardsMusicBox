#!/usr/bin/env python3
"""The citation web (milestone 8).

Every note in the library, whoever wrote it, is read for references to
passages of Plato ("cf. Rep. 509 B", "Philebus 26 E", "compare 92 C"), and each
reference becomes a row of `link` that names the note it was read from. So every
passage shows what it cites and what cites it, across the whole corpus, and the
passages cited most surface on their own (`most_discussed`).

Milestone 2 already read the Loeb notes, whose TEI marks the titles of works
(build_db.note_links). This module reads the plain text of every other note:
the translators' footnotes (Taylor, Sydenham, Jowett) and the commentaries
(Proclus, Taylor's Additional Notes, Archer-Hind, the introductions). It then
checks every link, the Loeb ones included, against the library's own list of
Stephanus sections. Nothing is guessed: a reference is read by the patterns
below, and anything the patterns cannot settle is kept and marked, never
silently dropped or silently trusted.

Each link has a certainty:

  certain     the reference reads cleanly and the section exists
  uncertain   read, but with a doubt, said in `doubt`: the title was read
              through an OCR error, the page has no such letter, the page is
              not in the book named, or the number follows another author's name
  unresolved  the work is named but has no such page (a misprint or a misread
              number); kept with the words as printed, not followable

    python3 tools/citations.py            # report on data/workshop.sqlite as built
"""
import difflib
import re
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "workshop.sqlite"
REPORT = ROOT / "reports" / "citations.md"

# How the titles of Plato's works are written in the notes. Full English titles,
# the usual abbreviations, Taylor's names (the Banquet, the Rivals) and the Latin
# ones (Legg., Resp.). A title is only read as Plato when a page of that work
# follows it, so names that are also people (Ion, Meno, Crito, Minos) are safe.
TITLES = {
    "tlg001": ["Euthyphro", "Euthyph", "Euthphr", "Euthyphr"],
    "tlg002": ["Apology", "Apol", "Apolog", "Ap"],
    "tlg003": ["Crito", "Cri"],
    "tlg004": ["Phaedo", "Phaed", "Phd", "Phædo", "Phæd"],
    "tlg005": ["Cratylus", "Cratyl", "Crat", "Cra"],
    "tlg006": ["Theaetetus", "Theaet", "Theaetet", "Theat", "Tht", "Theætetus", "Theæt"],
    "tlg007": ["Sophist", "Sophista", "Soph", "Sph"],
    "tlg008": ["Politicus", "Statesman", "Polit", "Pol", "Plt"],
    "tlg009": ["Parmenides", "Parmen", "Parm", "Prm"],
    "tlg010": ["Philebus", "Phileb", "Phil", "Phlb"],
    "tlg011": ["Symposium", "Sympos", "Symp", "Smp", "Banquet", "Conviv"],
    "tlg012": ["Phaedrus", "Phaedr", "Phdr", "Phædrus", "Phædr"],
    "tlg013": ["Alcibiades I", "First Alcibiades", "Alcibiades i", "Alc. I", "Alc. i", "Alc. 1", "Alc 1", "Alcib. I", "Alcibiades"],
    "tlg014": ["Alcibiades II", "Second Alcibiades", "Alcibiades ii", "Alc. II", "Alc. ii", "Alc. 2", "Alc.2", "Alcib. II"],
    "tlg015": ["Hipparchus", "Hipparch"],
    "tlg016": ["Rivals", "Lovers", "Amatores", "Amat", "Erastae"],
    "tlg017": ["Theages", "Thg"],
    "tlg018": ["Charmides", "Charm", "Chrm"],
    "tlg019": ["Laches", "Lach", "La"],
    "tlg020": ["Lysis", "Ly"],
    "tlg021": ["Euthydemus", "Euthydem", "Euthyd", "Euthd"],
    "tlg022": ["Protagoras", "Protag", "Prot", "Prt"],
    "tlg023": ["Gorgias", "Gorg", "Grg"],
    "tlg024": ["Meno", "Men"],
    "tlg025": ["Hippias Major", "Greater Hippias", "Hipp. Maj", "Hipp. Mai", "Hp. Ma", "Hp.Ma"],
    "tlg026": ["Hippias Minor", "Lesser Hippias", "Hipp. Min", "Hp. Mi", "Hp.Mi"],
    "tlg027": ["Ion"],
    "tlg028": ["Menexenus", "Menex", "Mx"],
    "tlg029": ["Clitophon", "Cleitophon", "Clit"],
    "tlg030": ["Republic", "Repub", "Rep", "Resp", "Rp", "R"],
    "tlg031": ["Timaeus", "Tim", "Ti", "Timæus"],
    "tlg032": ["Critias", "Criti"],
    "tlg033": ["Minos", "Min"],
    "tlg034": ["Laws", "Legg", "Leg", "Lg", "Laws of Plato"],
    "tlg035": ["Epinomis", "Epin"],
    "tlg036": ["Epistles", "Epistle", "Letters", "Letter", "Epist", "Ep"],
}
# One- and two-letter abbreviations are read only with a full stop after them
# and an upper-case section letter ("R. 509 B"), never as a bare word.
SHORT_NEED_DOT = {t for ts in TITLES.values() for t in ts if len(t) <= 2}
TITLE_OF = {t: w for w, ts in TITLES.items() for t in ts}
FULL_TITLES = {w: ts[0] for w, ts in TITLES.items()}
# Words for fuzzy title matching: whole titles of five letters or more.
FUZZY_POOL = {t: w for w, ts in TITLES.items() for t in ts if len(t) >= 6 and " " not in t and "." not in t}

_alts = "|".join(re.escape(t).replace(r"\ ", r"\.?\s*") for t in sorted(TITLE_OF, key=len, reverse=True))
# Words that end one reference and may begin another: "370 E, 374 E", "26 E—28 E", "892 A and B".
SEP = r"(?:,|and|&|[–—-]|to)"
TAIL = r"(?:\s*(?:ff?\.|foll\.|sqq?\.|seq\.))?"
# "Rep. vi. 509 B", "Laws x 896 A", "Republic 370 E, 374 E ff.", "Phaedo 100D". A line number after
# the letter ("665 B 7") is passed over.
REF_ONE = r"(\d{1,3})(?:\s?([A-E])\b(?:\s\d{1,2}\b(?!\s?[A-Ea-e]\b))?|([a-e])\b(?![\'’]))?"
TITLED = re.compile(
    rf"(?<![A-Za-z])(?P<title>{_alts})(?P<dot>\.?)(?:,|\s)\s*(?:(?P<book>[IVXivx]{{1,4}})\.?,?\s+)?"
    rf"(?P<refs>{REF_ONE}{TAIL}(?:\s*{SEP}\s*(?:{REF_ONE}|[A-E]\b){TAIL})*)")
# A word that may be a title misread by the OCR ("Zheaetetus 176 A", "Repudlic 596 A").
FUZZY = re.compile(rf"(?<![A-Za-z])(?P<word>[A-Z][a-zæ]{{4,}})\.?\s+(?P<refs>(\d{{1,3}})\s?([A-E])\b{TAIL}(?:\s*{SEP}\s*(?:\d{{1,3}}\s?[A-E]\b|[A-E]\b){TAIL})*)")
# A bare reference within the note's own dialogue: "cf. 31 B", "In 29 E", "92 c".
BARE = re.compile(r"(?<![\w.,/:-])(\d{2,3})\s?([A-E]|[a-e](?![\w\'’]))(?:\s*(?:ff?\.|foll\.))?(?![\w])")
# Archer-Hind heads each part of his commentary with its span and chapter ("27 C—29 D, c. v."):
# that is his outline of the dialogue, not a citation, and is not read.
HEADING_TAIL = re.compile(r"^(?:\s*[–—-]\s*\S{1,4}\s?\S{0,2})?\s*,\s*\S{1,3}\s*[ivxlc]+\.")
# Numbers that are not Stephanus pages: a page or volume of a book, a line, a chapter.
NOT_STEPH = re.compile(r"(?:\bp\.|\bpp\.|\bvol\.|\bvols\.|\bl\.|\bll\.|\bline|\blines|\bch\.|\bc\.|§|\bpage|\bfr\.|\bv\.|\bvv\.)\s*$", re.I)
# Words that may stand before a bare reference without casting doubt on it.
LEAD_INS = {"Cf", "Cp", "Compare", "Comp", "See", "In", "At", "Also", "And", "So", "Thus", "Above", "Below", "Infra", "Supra",
            "Plato", "Here", "There", "Again", "With", "Where", "On", "Vide", "Conf", "Comparing", "Note", "Notes", "Book"}
AUTHOR_BEFORE = re.compile(r"(?<![A-Za-z])([A-Z][a-zæ]+)\.?\s*(?:[IVXLC]+\.?\s*)?(?:\d+\s*[.,]?\s*)?$")
CITE_WORD = re.compile(r"(?:\b(?:cf|cp|see|compare|in|at|above|below)\.?)\s*$", re.I)
# Greek capitals the OCR gives for the Latin section letters ("795 Ε", "68Ε").
GREEK_LETTER = re.compile(r"(?<=\d)(\s?)([ΑΒΕ])(?![Ͱ-Ͽἀ-῿])")
LATIN_FOR = {"Α": "A", "Β": "B", "Ε": "E"}
# A dialogue named without a page: "as it is said in the Phaedrus", "his Republic".
MENTION = re.compile(
    r"\b(?:the|his|Plato['’]s|Plato's)\s+(?P<title>First Alcibiades|Second Alcibiades|Greater Hippias|Lesser Hippias|Euthyphro|Apology|Crito|"
    r"Phaedo|Cratylus|Theaetetus|Sophist|Politicus|Statesman|Parmenides|Philebus|Symposium|Banquet|Phaedrus|Alcibiades|Hipparchus|"
    r"Rivals|Theages|Charmides|Laches|Lysis|Euthydemus|Protagoras|Gorgias|Meno|Ion|Menexenus|Clitophon|Cleitophon|Republic|Timaeus|"
    r"Critias|Minos|Laws|Epinomis|Epistles|Letters|Phædo|Phædrus|Theætetus|Timæus)\b(?![\s.,]*\d)")
# Titles that are also ordinary words or titles of people: named this way, a doubt is recorded.
MENTION_DOUBT = {"Apology", "Sophist", "Statesman", "Banquet", "Rivals", "Laws", "Letters", "Epistles", "Alcibiades"}


def plain_letter(m_letter_upper, m_letter_lower):
    return (m_letter_upper or m_letter_lower or "").lower()


class Corpus:
    """What the library knows of each work's Stephanus sections and books."""

    def __init__(self, db):
        self.sections = defaultdict(lambda: defaultdict(set))   # work -> page -> letters
        for w, ref, page in db.execute("SELECT work_id, ref, page FROM section"):
            self.sections[w][page].add(ref[len(str(page)):])
        self.pages = {w: (min(p), max(p)) for w, p in self.sections.items()}
        self.books = defaultdict(list)                          # work -> [(roman, first page, last page)]
        for w, label, a, b in db.execute("SELECT work_id, label, start_ref, end_ref FROM division WHERE kind = 'book' ORDER BY id"):
            m = re.search(r"\b([IVX]+)\b", label or "")
            if m:
                self.books[w].append((m.group(1), int(re.match(r"\d+", a).group()), int(re.match(r"\d+", b).group())))
        self.titles = {w: t for w, t in db.execute("SELECT id, title FROM work")}

    @classmethod
    def from_sections(cls, sections, books=None, titles=None):
        """For tests: {work: ['509b', ...]}, {work: [(roman, first page, last page)]}."""
        c = cls.__new__(cls)
        c.sections = defaultdict(lambda: defaultdict(set))
        for w, refs in sections.items():
            for r in refs:
                page = int(re.match(r"\d+", r).group())
                c.sections[w][page].add(r[len(str(page)):])
        c.sections = {w: dict(p) for w, p in c.sections.items()}
        c.pages = {w: (min(p), max(p)) for w, p in c.sections.items()}
        c.books = defaultdict(list, books or {})
        c.titles = titles or {w: FULL_TITLES[w] for w in TITLES}
        return c

    def known(self, work):
        """Whether the work is in the library (a build of some works only leaves the rest out)."""
        return work in self.sections

    def has_page(self, work, page):
        return page in self.sections.get(work, {})

    def in_range(self, work, page):
        lo_hi = self.pages.get(work)
        return bool(lo_hi) and lo_hi[0] <= page <= lo_hi[1]

    def book_pages(self, work, roman):
        for r, a, b in self.books.get(work, []):
            if r == roman.upper():
                return a, b
        return None


def split_refs(text):
    """'370 E, 374 E ff.' -> [(370, 'e', '370 E'), (374, 'e', '374 E')]; 'B' after a page continues it.
    A line number after a letter ('665 B 7') is passed over."""
    out, page, last_letter = [], None, False
    for m in re.finditer(r"(\d{1,3})(?:\s?([A-E])\b|([a-e])\b)?|\b([A-E])\b", text):
        if m.group(1):
            if last_letter and len(m.group(1)) <= 2 and not (m.group(2) or m.group(3)) and int(m.group(1)) < 20:
                last_letter = False
                continue
            page = int(m.group(1))
            letter = plain_letter(m.group(2), m.group(3))
            last_letter = bool(letter)
            out.append((page, letter, m.group(0)))
        elif page is not None:
            last_letter = True
            out.append((page, m.group(4).lower(), f"{page} {m.group(4)}"))
    return out


def join_doubt(*parts):
    parts = [p for p in parts if p]
    return "; ".join(parts) or None


def read_refs(text, own_work, corpus):
    """The references to Plato in one note's plain text.

    Returns dicts: to_work, to_ref (a section '509b', a page '676', or '' for a
    dialogue named without a page), kind ('cf' or 'dialogue'), raw (the words
    read), rule (which pattern), certainty and doubt."""
    text = GREEK_LETTER.sub(lambda m: m.group(1) + LATIN_FOR[m.group(2)], text or "")
    found, taken = [], []

    def add(work, page, letter, raw, rule, doubt=None, book=None, may_be_own=False):
        if not corpus.known(work):
            found.append(dict(to_work=work, to_ref=f"{page}{letter}", kind="cf", raw=raw, rule=rule, certainty="uncertain",
                              doubt=join_doubt(doubt, f"the {corpus.titles.get(work, work)} is not in the library, so the page is not checked")))
            return
        if not corpus.has_page(work, page):
            title = corpus.titles.get(work, work)
            if may_be_own and work != own_work and corpus.has_page(own_work, page):
                # "Laws 690 A ff. and 434 B" in a note on the Republic: the Laws has no page 434.
                doubt = join_doubt(doubt, f"the {title} has no page {page}; read as the note's own dialogue")
                work = own_work
            else:
                found.append(dict(to_work=work, to_ref=f"{page}{letter}", kind="cf", raw=raw, rule=rule, certainty="unresolved",
                                  doubt=join_doubt(doubt, f"the {title} has no page {page}")))
                return
        ref = f"{page}{letter}"
        if letter and letter not in corpus.sections[work][page]:
            doubt = join_doubt(doubt, f"page {page} has no section {letter}; linked to the page")
            ref = str(page)
        if book:
            rng = corpus.book_pages(work, book)
            if rng and not rng[0] <= page <= rng[1]:
                doubt = join_doubt(doubt, f"page {page} is not in book {book.upper()}")
        found.append(dict(to_work=work, to_ref=ref, kind="cf", raw=raw, rule=rule,
                          certainty="uncertain" if doubt else "certain", doubt=doubt))

    for m in TITLED.finditer(text):
        key = next((t for t in TITLE_OF if re.fullmatch(re.escape(t).replace(r"\ ", r"\.?\s*"), m.group("title"))), None)
        if key is None:
            continue
        work = TITLE_OF[key]
        abbreviated = key != TITLES[work][0] and not any(key == t for t in TITLES[work] if len(t) > 6)
        if key in SHORT_NEED_DOT and not m.group("dot"):
            continue
        # "…in the Republic. 69 A—70 D" : after a full title the stop ends the sentence.
        if m.group("dot") and not abbreviated and not m.group("book"):
            continue
        refs = split_refs(m.group("refs"))
        if not refs:
            continue
        # A short or ambiguous abbreviation must be followed by a page of that work and a letter.
        if key in SHORT_NEED_DOT or len(key) <= 3:
            if not corpus.in_range(work, refs[0][0]) or not refs[0][1]:
                continue
        # A title that is also a name or a word, then a number that is not one of its pages and no letter: not read.
        if not refs[0][1] and not corpus.has_page(work, refs[0][0]):
            continue
        # "Proclus in Tim. 3 E": the title of another author's book.
        before = text[max(0, m.start() - 14):m.start()]
        if re.search(r"\b(?:in|on|ad)\s*$", before) and re.search(r"[A-Z][a-z]+\s+(?:in|on|ad)\s*$", before) and not corpus.has_page(work, refs[0][0]):
            continue
        taken.append(m.span())
        book = m.group("book")
        for i, (page, letter, raw) in enumerate(refs):
            add(work, page, letter, f"{m.group('title')}{m.group('dot')} {(book + ' ') if book else ''}{raw}".strip(),
                "title and page", book=book, may_be_own=i > 0)

    def free(span):
        return not any(a < span[1] and span[0] < b for a, b in taken)

    for m in FUZZY.finditer(text):
        if not free(m.span()):
            continue
        word = m.group("word")
        if word in TITLE_OF or word in LEAD_INS:
            continue
        close = difflib.get_close_matches(word, FUZZY_POOL, n=1, cutoff=0.8)
        if not close:
            continue
        work = FUZZY_POOL[close[0]]
        refs = split_refs(m.group("refs"))
        if not refs or not corpus.in_range(work, refs[0][0]):
            continue
        taken.append(m.span())
        for i, (page, letter, raw) in enumerate(refs):
            add(work, page, letter, f"{word} {raw}", "title read through OCR",
                doubt=f"“{word}” read as the {FULL_TITLES[work]}", may_be_own=i > 0)

    for m in BARE.finditer(text):
        if not free(m.span()):
            continue
        page, letter = int(m.group(1)), m.group(2).lower()
        if not corpus.in_range(own_work, page):
            continue
        before = text[max(0, m.start() - 30):m.start()]
        if NOT_STEPH.search(before) or HEADING_TAIL.match(text[m.end():m.end() + 24]):
            continue
        doubt = None
        a = AUTHOR_BEFORE.search(before)
        if a and a.group(1) not in LEAD_INS and a.group(1) not in TITLE_OF:
            doubt = f"follows “{a.group(1)}”: may be a page of another work"
        if m.group(2) == "a" and " " in m.group(0) and not CITE_WORD.search(before):
            doubt = join_doubt(doubt, "a lower-case “a” after a number may be the word")
        taken.append(m.span())
        add(own_work, page, letter, m.group(0).strip(), "page in this dialogue", doubt=doubt)

    cited_works = {f["to_work"] for f in found}
    for m in MENTION.finditer(text):
        title = m.group("title").replace("æ", "ae")
        work = next((w for w, ts in TITLES.items() if title in ts or title.replace("ae", "æ") in ts), None)
        if title == "Alcibiades":
            work = "tlg013"
        if title in ("First Alcibiades",):
            work = "tlg013"
        if not work or work == own_work or work in cited_works or not free(m.span()):
            continue
        cited_works.add(work)
        doubt = f"“the {title}” may not mean the dialogue" if title in MENTION_DOUBT else None
        found.append(dict(to_work=work, to_ref="", kind="dialogue", raw=m.group(0), rule="dialogue named",
                          certainty="uncertain" if doubt else "certain", doubt=doubt))

    seen, out = set(), []
    for f in found:
        k = (f["to_work"], f["to_ref"])
        if k not in seen:
            seen.add(k)
            out.append(f)
    return out


# ------------------------------------------------------------------ building

def check_link(corpus, from_work, to_work, to_ref):
    """(to_work, to_ref, certainty, doubt) for a link read elsewhere (the Loeb notes, milestone 2)."""
    m = re.fullmatch(r"(\d+)([a-e]?)", to_ref)
    if not m:
        return to_work, to_ref, "unresolved", f"“{to_ref}” is not a Stephanus reference"
    page, letter = int(m.group(1)), m.group(2)
    title = corpus.titles.get(to_work, to_work)
    if not corpus.known(to_work):
        return to_work, to_ref, "uncertain", f"the {title} is not in the library, so the page is not checked"
    if not corpus.has_page(to_work, page):
        if page < 17 and not letter:
            return to_work, to_ref, "unresolved", f"the {title} has no page {page}: probably a line number"
        if to_work != from_work and corpus.has_page(from_work, page) and (not letter or letter in corpus.sections[from_work][page]):
            # "Laws 690 A ff. and 434 B" in a note on the Republic.
            return from_work, to_ref, "uncertain", f"the {title} has no page {page}; read as the note's own dialogue"
        return to_work, to_ref, "unresolved", f"the {title} has no page {page}"
    if letter and letter not in corpus.sections[to_work][page]:
        return to_work, str(page), "uncertain", f"page {page} has no section {letter}; linked to the page"
    return to_work, to_ref, "certain", None


def harvest(db):
    """Read every note for references, and check the links read in milestone 2. Returns figures for the report."""
    corpus = Corpus(db)
    for lid, fw, w, r in db.execute("SELECT id, from_work, to_work, to_ref FROM link").fetchall():
        db.execute("UPDATE link SET to_work = ?, to_ref = ?, certainty = ?, doubt = ?, "
                   "rule = CASE WHEN raw GLOB '[0-9]*' THEN 'page in this dialogue (Loeb TEI)' ELSE 'title and page (Loeb TEI)' END WHERE id = ?",
                   (*check_link(corpus, fw, w, r), lid))
    linked = defaultdict(set)
    for nid, w in db.execute("SELECT note_id, to_work FROM link WHERE note_id IS NOT NULL"):
        linked[nid].add(w)
    n_read = 0
    for nid, work, ref, body, src in db.execute(
            "SELECT id, work_id, start_ref, body, source_id FROM note ORDER BY id").fetchall():
        n_read += 1
        for f in read_refs(body, work, corpus):
            if src == "perseus-english-plato":
                # A Loeb note: its references were read from the TEI titles; only the dialogues it names are added.
                if f["kind"] != "dialogue" or f["to_work"] in linked.get(nid, ()):
                    continue
            db.execute("INSERT INTO link (from_work, from_ref, to_work, to_ref, kind, note_id, source_id, raw, method, rule, certainty, doubt) "
                       "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                       (work, ref, f["to_work"], f["to_ref"], f["kind"], nid, src, f["raw"], "pattern, plain text", f["rule"],
                        f["certainty"], f["doubt"]))
    return {"notes_read": n_read}


# ------------------------------------------------------------------ queries

def most_discussed(db, work=None, commentator=None, include_uncertain=False, cross_only=False, limit=100):
    """Passages ranked by how many notes cite them (each note counted once).

    Also: how many commentators, how many dialogues the citations come from, and
    how many notes are written on the passage itself."""
    where = ["l.kind = 'cf'", "l.certainty IN ('certain'" + (", 'uncertain'" if include_uncertain else "") + ")"]
    args = []
    if work:
        where.append("l.to_work = ?")
        args.append(work)
    if commentator:
        where.append("COALESCE(c.label, n.commentator) = ?")
        args.append(commentator)
    if cross_only:
        where.append("l.from_work != l.to_work")
    rows = db.execute(
        "SELECT l.to_work, l.to_ref, count(DISTINCT l.note_id) AS citations, "
        "count(DISTINCT COALESCE(c.label, n.commentator)) AS commentators, count(DISTINCT l.from_work) AS dialogues, "
        "group_concat(DISTINCT replace(COALESCE(c.label, n.commentator), ',', '‚')) AS who, "
        "sum(l.certainty = 'uncertain') AS uncertain "
        "FROM link l JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
        f"WHERE {' AND '.join(where)} GROUP BY l.to_work, l.to_ref "
        "ORDER BY citations DESC, commentators DESC, l.to_work, l.to_ref LIMIT ?", (*args, limit)).fetchall()
    out = []
    for r in rows:
        d = dict(zip(("to_work", "to_ref", "citations", "commentators", "dialogues", "who", "uncertain"), r))
        d["who"] = sorted({w.replace("\u201a", ",") for w in (d["who"] or "").split(",")})
        if d["to_ref"].isdigit():
            d["notes_here"] = db.execute(
                "SELECT count(*) FROM note n JOIN section s ON s.work_id = n.work_id AND s.ref = n.start_ref "
                "WHERE n.work_id = ? AND s.page = ? AND n.kind IS NOT 'introduction'", (d["to_work"], int(d["to_ref"]))).fetchone()[0]
        else:
            d["notes_here"] = db.execute("SELECT count(*) FROM note WHERE work_id = ? AND start_ref = ? AND kind IS NOT 'introduction'",
                                         (d["to_work"], d["to_ref"])).fetchone()[0]
        out.append(d)
    return out


def citing_notes(db, to_work, to_ref):
    """Every link to one passage, with the note it was read from."""
    page = re.match(r"\d+", to_ref).group() if to_ref else ""
    rows = db.execute(
        "SELECT l.id, l.from_work, l.from_ref, l.to_ref, l.raw, l.method, l.rule, l.certainty, l.doubt, l.note_id, "
        "COALESCE(c.label, n.commentator) AS commentator, n.kind AS note_kind, n.proof_status, n.computed, n.body, w.title AS from_title "
        "FROM link l JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id JOIN work w ON w.id = l.from_work "
        "WHERE l.to_work = ? AND (l.to_ref = ? OR l.to_ref = ?) ORDER BY l.certainty, l.from_work, l.id", (to_work, to_ref, page)).fetchall()
    cols = ("id", "from_work", "from_ref", "to_ref", "raw", "method", "rule", "certainty", "doubt", "note_id", "commentator",
            "note_kind", "proof_status", "computed", "body", "from_title")
    out = []
    for r in rows:
        d = dict(zip(cols, r))
        d["excerpt"] = excerpt(d.pop("body"), d["raw"])
        out.append(d)
    return out


def excerpt(body, raw, width=220):
    """The words around the reference in the note."""
    body = re.sub(r"\s+", " ", body or "")
    probe = re.sub(r"\s+", " ", raw or "")
    i = body.find(probe)
    if i < 0:
        num = re.search(r"\d+", probe)
        i = body.find(num.group()) if num else -1
    if i < 0:
        return body[:width] + ("…" if len(body) > width else "")
    a = max(0, i - width // 2)
    b = min(len(body), i + len(probe) + width // 2)
    return ("…" if a else "") + body[a:b].strip() + ("…" if b < len(body) else "")


# ------------------------------------------------------------------ report

def write_report(db, path=REPORT):
    """reports/citations.md: what was read, from whom, and every doubt."""
    def q(sql, *a):
        return db.execute(sql, a).fetchall()
    total = q("SELECT certainty, count(*) FROM link GROUP BY certainty")
    by_cert = dict(total)
    kinds = dict(q("SELECT kind, count(*) FROM link GROUP BY kind"))
    by_who = q("SELECT COALESCE(c.label, n.commentator) AS who, count(*), sum(l.certainty='certain'), sum(l.certainty='uncertain'), "
               "sum(l.certainty='unresolved'), count(DISTINCT l.note_id), sum(l.from_work != l.to_work) "
               "FROM link l JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
               "GROUP BY who ORDER BY count(*) DESC")
    titles = dict(q("SELECT id, title FROM work"))
    lines = [
        "# The citation web", "",
        "Written by `tools/build_db.py` (milestone 8, `tools/citations.py`). Every note in the library is read for references "
        "to passages of Plato; each reference is a link that names the note it was read from.", "",
        f"**{sum(by_cert.values()):,} links**: {by_cert.get('certain', 0):,} certain, {by_cert.get('uncertain', 0):,} uncertain, "
        f"{by_cert.get('unresolved', 0):,} unresolved (the work is named but has no such page). "
        f"{kinds.get('cf', 0):,} cite a passage, {kinds.get('dialogue', 0):,} name a dialogue without a page.", "",
        "## By commentator", "",
        "| Notes by | Links | Certain | Uncertain | Unresolved | Notes with a link | To another dialogue |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for r in by_who:
        lines.append(f"| {r[0]} | {r[1]:,} | {r[2]:,} | {r[3]:,} | {r[4]:,} | {r[5]:,} | {r[6]:,} |")
    lines += ["", "## The most discussed passages", "",
              "Ranked by the number of notes that cite the passage (certain links only). A page with no letter (`Laws 676`) "
              "is a reference to the whole page.", "",
              "| Passage | Notes citing it | Commentators | From dialogues | By |", "|---|---:|---:|---:|---|"]
    for d in most_discussed(db, limit=40):
        lines.append(f"| {titles.get(d['to_work'], d['to_work'])} {d['to_ref']} | {d['citations']} | {d['commentators']} | "
                     f"{d['dialogues']} | {', '.join(d['who'])} |")
    lines += ["", "## Dialogues named without a page", "",
              "Taylor, Sydenham, Proclus and the introductions mostly name a dialogue (\"as it is said in the Phaedrus\") "
              "rather than a page. Each note naming another dialogue gives one link to the dialogue as a whole.", "",
              "| Dialogue | Notes naming it | Certain | By |", "|---|---:|---:|---|"]
    for w, n, c, by in q("SELECT l.to_work, count(DISTINCT l.note_id), sum(l.certainty = 'certain'), "
                         "group_concat(DISTINCT replace(COALESCE(c.label, n.commentator), ',', '‚')) FROM link l "
                         "JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
                         "WHERE l.kind = 'dialogue' GROUP BY l.to_work ORDER BY 2 DESC"):
        who = ", ".join(sorted({x.replace("\u201a", ",") for x in (by or "").split(",")}))
        lines.append(f"| {titles.get(w, w)} | {n} | {c} | {who} |")
    lines += ["", "## Between dialogues", "",
              "How many links run from notes on one dialogue to another (certain links, the 30 largest pairs).", "",
              "| From notes on | To | Links |", "|---|---|---:|"]
    for a, b, n in q("SELECT from_work, to_work, count(*) FROM link WHERE certainty = 'certain' AND from_work != to_work "
                     "GROUP BY from_work, to_work ORDER BY count(*) DESC LIMIT 30"):
        lines.append(f"| {titles.get(a, a)} | {titles.get(b, b)} | {n:,} |")
    lines += ["", "## How references are read", "",
              "- **Title and page** (`Republic 509 B`, `Rep. vi. 509 b`, `Laws 892 A, B`, `Phaedo 100D`): a title of one of Plato's "
              "works (full, abbreviated, Taylor's names such as *the Banquet*, or Latin such as *Legg.*), then Stephanus "
              "numbers. A letter on its own continues the page before it. One- and two-letter abbreviations (`R.`, `Ti.`) "
              "are read only with their full stop and a section letter.",
              "- **Page in this dialogue** (`cf. 31 B`, `In 29 E`): a page and letter with no title, read as the note's own "
              "dialogue when the page is one of its pages. Not read after `p.`, `vol.`, `l.`, `ch.` or `§`.",
              "- **Title read through OCR** (`Zheaetetus 176 A`): a capitalised word within a letter or two of a title "
              "(difflib ratio ≥ 0.8) followed by a page of that work. Always marked uncertain.",
              "- **Dialogue named** (`in the Phaedrus`, `his Republic`): a full title after *the*, *his* or *Plato's*, with no page "
              "after it. One link per note and dialogue, to the dialogue as a whole; the note's own dialogue is not counted. "
              "Titles that are also ordinary words (*the Laws*, *the Republic*, *the Sophist*, *the Banquet*…) are marked uncertain.",
              "- **The Loeb notes** were read in milestone 2 from the titles their TEI marks; here they are checked, and the "
              "dialogues they name without a page are added. A number after another title that is not a page of that work but is "
              "one of the note's own dialogue (`Laws 690 A ff. and 434 B` in a note on the Republic) is read as the note's own "
              "dialogue, and marked uncertain.", "",
              "A link is **uncertain** when the title was read through OCR, the page has no section of that letter "
              "(the link goes to the page), the page is not in the book named, or a bare reference follows another name "
              "(`Athenaeus XI 507 D`), so it may be another author's page. **Unresolved**: the work is named but has no "
              "such page; the words are kept, nothing is linked.", ""]
    doubts = q("SELECT l.certainty, COALESCE(c.label, n.commentator), l.from_work, l.from_ref, l.raw, l.to_work, l.to_ref, l.doubt "
               "FROM link l JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
               "WHERE l.certainty != 'certain' ORDER BY l.certainty DESC, l.from_work, l.id")
    lines += [f"## Every doubt ({len(doubts):,})", "",
              "| | Note by | At | Printed | Read as | Why |", "|---|---|---|---|---|---|"]
    for c, w, fw, fr, raw, tw, tr, doubt in doubts:
        lines.append(f"| {c} | {w} | {titles.get(fw, fw)} {fr} | {raw.replace('|', '/')} | {titles.get(tw, tw)} {tr} | {doubt or ''} |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return by_cert


def main():
    db = sqlite3.connect(DB_PATH)
    print(write_report(db))


if __name__ == "__main__":
    sys.exit(main())
