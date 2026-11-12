#!/usr/bin/env python3
"""Aristotle on his own shelf, read as the later Platonists read him (Aristotle milestone A1).

The works open in the same reader as the dialogues, built the same way (build_db.build_work):

  perseus-greek-aristotle    the Greek: Ross's Metaphysics (1924) and Bywater's Nicomachean Ethics
                             (1894), Perseus TEI, with Bekker's pages and columns (980a) as milestones.
  perseus-english-aristotle  the Loeb English of the same Perseus commit (Tredennick, Rackham), with
                             the same Bekker milestones and the translators' footnotes.
  glaux-aristotle            GLAUx's dictionary form and grammar of every Greek word, keyed by Bekker
                             column (div_section), as GLAUx keys Plato's by Stephanus section.

A Bekker column (980a) is to Aristotle what a Stephanus section (29e) is to Plato: the reader's
section; a Bekker page (980) is its page. The two numberings cannot be confused in the library, since
each work keeps its own id (ar025 is the Metaphysics, tlg025 Plato's Hippias Major).

Beside the Loeb English, the older translations, from scans read by tools/aristotle_ocr.py:

  Ross (1908)    the Oxford translation of the Metaphysics. Ross prints Bekker's pages and columns
                 in his margin; each column he prints is a fixed point (printed), and the text
                 between two of them is placed by tools/align.py within them (computed).
  Taylor (1801)  Thomas Taylor's Metaphysics, with his notes from Alexander, Syrianus and the other
                 Greek commentators. No Bekker numbers (Bekker printed in 1831): every paragraph is
                 placed by tools/align.py against the Loeb English, with the start of each book, and
                 of each chapter in the books whose chapters Taylor numbers as Bekker does, as fixed points.
  Chase (1847)   the Nicomachean Ethics (Project Gutenberg #8438, the Everyman text of 1911), placed
                 the same way, with the start of each book as a fixed point.

Taylor's Introduction to the Metaphysics and his Additional Notes ("to illustrate the Platonic
doctrine concerning Ideas and the principle of the universe") are read whole, as his General
Introduction to Plato is (#taylor/<id>).

Built at the end of build_db.build, after everything that counts Plato's words, so that every count
of Plato stays Plato's. The key terms of milestone 17 are marked in the Greek by their own rules, and
kept in ar_term_hit apart from Plato's term_hit.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_db  # noqa: E402
import greek  # noqa: E402
import translations  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
TEXTS = ROOT / "texts" / "aristotle"
REPORT = ROOT / "reports" / "aristotle.md"
AR_URN = "urn:cts:greekLit:tlg0086"
GREEK_SRC, ENGLISH_SRC, GLAUX_SRC = "perseus-greek-aristotle", "perseus-english-aristotle", "glaux-aristotle"
CHASE = ROOT / "sources" / "aristotle" / "chase-1847" / "pg8438.txt"

# The books of the Metaphysics by their Greek letters, as they are cited (Metaph. Λ 7).
META_BOOKS = ["Α", "α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν"]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"]

WORKS = [
    {"id": "ar025", "tlg": "tlg025", "title": "Metaphysics", "abbr": "Metaph.", "slug": "metaphysics",
     "greek_title": "Τὰ μετὰ τὰ φυσικά", "letters": True,
     "plain": "First philosophy: being as being, substance, actuality, and the unmoved mover, the intellect that thinks "
              "itself (Book Λ). Books Α, Μ and Ν argue against Plato's Forms and numbers; Syrianus answered them."},
    {"id": "ar010", "tlg": "tlg010", "title": "Nicomachean Ethics", "abbr": "EN", "slug": "nicomachean-ethics",
     "greek_title": "Ἠθικὰ Νικομάχεια", "letters": False,
     "plain": "The good for man, the virtues of character and of intellect, friendship, pleasure, and the life of "
              "contemplation as the most divine (Book X)."},
]
WORK_BY_ID = {w["id"]: w for w in WORKS}


class BekkerWalker(build_db.Walker):
    """A Perseus TEI of Aristotle: a section is a Bekker column (<milestone unit='page' resp='Bekker'
    n='980a'>); books and chapters (<div subtype='book'>, <div subtype='section'>) are kept, with
    the chunk each chapter opens with."""
    SECTION_UNIT = "page"
    SECTION_RESP = "Bekker"
    PART_SUBTYPES = ("book", "section")

    def __init__(self, root):
        self.chapter_chunks = []   # (book, chapter, index of the chunk it opens with)
        self._pending = None
        self._book = None
        super().__init__(root)

    def _chunk(self):
        before = len(self.chunks)
        c = super()._chunk()
        if self._pending and len(self.chunks) > before:
            self.chapter_chunks.append((*self._pending, len(self.chunks) - 1))
            self._pending = None
        return c

    def walk(self, el):
        if el.tag.endswith("}div") and el.get("type") == "textpart":
            if el.get("subtype") == "book":
                self._book = el.get("n")
            elif el.get("subtype") == "section":
                self._pending = (self._book, el.get("n"))
        super().walk(el)


def book_label(work, n):
    i = int(n) - 1
    if work["letters"]:
        return f"Book {META_BOOKS[i]} ({ROMAN[i]})"
    return f"Book {ROMAN[i]}"


def parts_of(work):
    """The books and chapters of the Greek, from the walker's parts, as division rows (kind, label, first, last)."""
    def parts(g):
        out, book = [], None
        books = {}
        for subtype, n, a, b in g.parts:
            if subtype == "book":
                book = n
                continue
            if not (a and b):
                continue
            out.append(("ar-chapter", f"{book_label(work, book)}, chapter {n}", a, b))
            first, last = books.get(book, (a, b))
            books[book] = (first, b)
        return [("book", book_label(work, k), a, b) for k, (a, b) in books.items()] + out
    return parts


def cfg_for(work):
    return {
        "perseus_dir": RAW / GREEK_SRC / "data" / "tlg0086", "urn": AR_URN, "tlg_dir": "data/tlg0086",
        "greek_source": GREEK_SRC, "english_source": ENGLISH_SRC,
        "glaux_source": GLAUX_SRC, "glaux_file": lambda num: RAW / GLAUX_SRC / "xml" / f"0086-{num}.xml",
        "glaux_section": ("div_section", "div_bekker_page"), "walker": BekkerWalker, "note_resp": None,
        "page_label": "Bekker page {}", "page_basis": "Bekker's pages and columns (<milestone unit='page' resp='Bekker'>) in the Perseus TEI",
        "perseus_id": lambda work_id: WORK_BY_ID[work_id]["tlg"], "parts": parts_of(work),
    }


def available():
    return all((RAW / s).exists() for s in (GREEK_SRC, GLAUX_SRC)) and \
        (RAW / GREEK_SRC / "data" / "tlg0086" / "tlg025").exists()


def lemmas():
    """Every GLAUx lemma of the Aristotle files (so that the dictionaries are linked for them too)."""
    import aristotle_f1k
    out = set(aristotle_f1k.lemmas())
    for w in WORKS:
        p = RAW / GLAUX_SRC / "xml" / f"0086-{w['tlg'][3:]}.xml"
        for m in re.finditer(r' lemma="([^"]*)"', p.read_text(encoding="utf-8")):
            out.add(greek.nfc(m.group(1)))
    return {l for l in out if greek.is_greek(l)}


# ------------------------------------------------------------------ the older translations

def english_chapter_starts(work, placer):
    """{(book, chapter): position in the Loeb English stream where the chapter begins}."""
    import xml.etree.ElementTree as ET
    f = sorted((RAW / ENGLISH_SRC / "data" / "tlg0086" / work["tlg"]).glob("*-eng*.xml"))[0]
    e = BekkerWalker(ET.parse(f).getroot())
    pos, starts = 0, []
    for t, _ in placer.ref_pieces:
        starts.append(pos)
        pos += len(t) + 1
    if len(starts) != len(e.chunks):
        return {}
    return {(int(b), int(c)): starts[i] for b, c, i in e.chapter_chunks if b and c and b.isdigit() and c.isdigit()}


def place(db, work_id, placer, paras, fixed_of, printed_at, ed, method_of=None):
    """Place paragraphs [{'text', ...}] with fixed anchors; returns [(k, a, b, ref, end_ref, method)]."""
    starts = placer.stream_positions(paras)
    fixed = sorted({(starts[k] + off, ref_pos) for k, off, ref_pos in fixed_of(starts)})
    pieces, info = placer.computed(paras, fixed)
    return pieces, info, fixed


def build_ross(db, work, placer):
    path = TEXTS / work["slug"] / "ross-1908.json"
    if not path.exists():
        return None
    d = json.loads(path.read_text(encoding="utf-8"))
    wid = work["id"]
    ed = f"{wid}.ross1908"
    # Cut each paragraph at the Bekker columns Ross prints, so that every printed column starts a piece.
    paras = []
    for k, p in enumerate(d["paragraphs"]):
        cuts = [0] + [m[0] for m in p["marks"] if 0 < m[0] < len(p["text"])] + [len(p["text"])]
        marks = {m[0]: m[1] for m in p["marks"]}
        for a, b in zip(cuts, cuts[1:]):
            if p["text"][a:b].strip():
                paras.append({"text": p["text"][a:b], "para": k, "start": a, "printed": marks.get(a), "leaf": p["leaf"],
                              "raw": p["raw"] if a == 0 else None})
    placed = [p for p in paras if p["printed"] in placer.ref_start]
    fixed = []
    starts = placer.stream_positions(paras)
    for i, p in enumerate(paras):
        if p["printed"] in placer.ref_start:
            fixed.append((starts[i], placer.ref_start[p["printed"]]))
    pieces, info = placer.computed(paras, sorted(fixed))
    translations.add_edition(db, ed, wid, "ia-ross-metaphysics-1908", "Ross (1908)", "W. D. Ross",
                             "W. D. Ross, Metaphysica, The Works of Aristotle translated into English, vol. VIII (Oxford: Clarendon Press, 1908)",
                             str(path.relative_to(ROOT)), "OCR cleaned by rule",
                             f"Ross prints Bekker's pages and columns in his margin; {len(placed)} of them are read from the scan and placed where he "
                             "prints them. The text between two of them is placed by tools/align.py within them (≈).", "printed")
    seq = 0
    chunk_of = {}
    n_printed = 0
    for k, a, b, s0, e in pieces:
        p = paras[k]
        text = p["text"][a:b].strip()
        if not text:
            continue
        printed = a == 0 and p["printed"] == s0
        n_printed += printed
        cid = translations.add_chunk(db, ed, wid, seq, p["para"], s0, e, "printed" if printed else translations.COMPUTED,
                                     None, "W. D. Ross", p["raw"] if a == 0 else None, f"scan image {p['leaf']}", text)
        seq += 1
        chunk_of.setdefault(p["para"], []).append((p["start"] + a, s0, cid))
    n_notes = 0
    for n in d["notes"]:
        target = chunk_of.get(n["para"])
        if not target:
            continue
        _, ref, cid = target[-1]
        translations.add_note(db, "ia-ross-metaphysics-1908", "Ross (1908)", wid, ref, ed, cid, None, n["text"],
                              f"scan image {n['leaf']}", "the page it is printed on", "OCR cleaned by rule")
        n_notes += 1
    return {"edition": ed, "paragraphs": len(d["paragraphs"]), "pieces": len(paras), "printed_columns": len(placed),
            "chunks": seq, "chunks_at_a_printed_column": n_printed, "notes": n_notes, "anchors": info["anchors"],
            "words": sum(len(p["text"].split()) for p in d["paragraphs"]), "method": "printed and computed"}


def taylor_commentator(text, label="Taylor (1801)"):
    """Taylor's notes draw on Alexander, Syrianus and the other commentators by name; the note is his."""
    named = [n for n in ("Syrianus", "Alexander", "Asclepius", "Proclus", "Simplicius", "Plotinus", "Damascius", "Iamblichus",
                         "Ammonius", "Philoponus", "Eustratius", "Aspasius")
             if re.search(n, text)]
    return label + (f", from {', '.join(named[:2])}" if named else "")


# Taylor's translations placed against the Loeb English: (file, source, edition suffix, label, title).
TAYLOR_LOEB = {
    "ar025": ("taylor-1801", "ia-taylor-metaphysics-1801", "taylor1801", "Taylor (1801)",
              "Thomas Taylor, The Metaphysics of Aristotle, translated from the Greek; with copious notes, in which the Pythagoric "
              "and Platonic dogmas respecting numbers and ideas are unfolded from antient sources (London, 1801)",
              "His notes, from Alexander, Syrianus and the other Greek commentators, are under the text."),
    "ar010": ("taylor-1811", "ia-taylor-ethics-1811", "taylor1811", "Taylor (1811)",
              "Thomas Taylor, The Rhetoric, Poetic, and Nicomachean Ethics of Aristotle, translated from the Greek (London, 1811)",
              "His notes are under the text."),
}


def build_taylor(db, work, placer):
    if work["id"] not in TAYLOR_LOEB:
        return None
    name, src, suffix, label, title, notes_said = TAYLOR_LOEB[work["id"]]
    path = TEXTS / work["slug"] / f"{name}.json"
    if not path.exists():
        return None
    d = json.loads(path.read_text(encoding="utf-8"))
    wid = work["id"]
    ed = f"{wid}.{suffix}"
    year = label[-5:-1]
    idx = [i for i, p in enumerate(d["paragraphs"]) if p.get("part", "translation") == "translation"]
    paras = [d["paragraphs"][i] for i in idx]
    starts_of = english_chapter_starts(work, placer)
    perseus_chapters = Counter(b for b, c in starts_of)
    taylor_chapters = {int(b): n for b, n in d["stats"]["chapters"].items()}
    starts = placer.stream_positions(paras)
    fixed, seen, agree = [], set(), []
    for k, p in enumerate(paras):
        key = (p["book"], p["chapter"])
        if key in seen:
            continue
        seen.add(key)
        if p["chapter"] == 1 or taylor_chapters.get(p["book"]) == perseus_chapters.get(p["book"]):
            if key in starts_of:
                fixed.append((starts[k], starts_of[key]))
    for b in sorted(taylor_chapters):
        if taylor_chapters[b] == perseus_chapters.get(b):
            agree.append(b)
    pieces, info = placer.computed(paras, sorted(fixed))
    translations.add_edition(db, ed, wid, src, label, "Thomas Taylor", title,
                             str(path.relative_to(ROOT)), "OCR cleaned by rule",
                             f"No Bekker numbers in {year} (Bekker's edition is of 1831): every paragraph is placed by tools/align.py against the "
                             f"Loeb English (≈), with {len(fixed)} fixed points: the first chapter of each book, and every chapter of the books whose "
                             f"chapters Taylor numbers as the Perseus text does ({', '.join(book_label(work, b) for b in agree) or 'none'}). "
                             + notes_said, translations.COMPUTED)
    seq = 0
    chunk_of = {}
    for k, a, b, s0, e in pieces:
        p = paras[k]
        text = p["text"][a:b].strip()
        if not text:
            continue
        cid = translations.add_chunk(db, ed, wid, seq, k, s0, e, translations.COMPUTED, None, "Thomas Taylor",
                                     p["raw"] if a == 0 else None, f"scan image {p['leaf']}", text)
        seq += 1
        chunk_of.setdefault(idx[k], []).append((a, b, s0, cid))
    n_notes = 0
    for n in d["notes"]:
        target = chunk_of.get(n["para"])
        if not target:
            continue
        a, b, ref, cid = target[-1]
        translations.add_note(db, src, taylor_commentator(n["text"], label), wid, ref, ed, cid, b - a, n["text"],
                              f"scan image {n['leaf']}", f"alignment ({n['anchor']})", "OCR cleaned by rule")
        n_notes += 1
    return {"edition": ed, "paragraphs": len(paras), "chunks": seq, "notes": n_notes, "fixed_points": len(fixed),
            "books_with_chapters_as_perseus": agree, "anchors": info["anchors"],
            "words": sum(len(p["text"].split()) for p in paras), "method": translations.COMPUTED}


def read_chase():
    """Chase's Nicomachean Ethics from the Gutenberg text: [{'text', 'book', 'chapter'}]."""
    t = CHASE.read_text(encoding="utf-8").replace("\r\n", "\n")
    t = t.split("*** START OF THE PROJECT GUTENBERG EBOOK", 1)[1].split("*** END OF THE PROJECT GUTENBERG EBOOK", 1)[0]
    # The translation runs from the first "BOOK I" at the start of a line (the contents indent theirs)
    # to Chase's NOTES, left out here.
    starts = [m.start() for m in re.finditer(r"^BOOK I\s*$", t, re.M)]
    t = t[starts[0]:] if starts else t
    t = re.split(r"^NOTES\s*$", t, maxsplit=1, flags=re.M)[0]
    paras, book, chapter = [], 0, 0
    for block in re.split(r"\n\s*\n", t):
        b = " ".join(block.split())
        if not b:
            continue
        m = re.fullmatch(r"BOOK ([IVX]+)", b)
        if m:
            book = ROMAN.index(m.group(1)) + 1
            chapter = 0
            continue
        m = re.fullmatch(r"Chapter ([IVXL]+)\.?", b)
        if m:
            chapter += 1
            continue
        if b.startswith("[Footnote"):
            continue
        b = re.sub(r"\[\d+\]", "", b)
        paras.append({"text": b, "book": book, "chapter": chapter})
    return paras


def build_chase(db, work, placer):
    if work["id"] != "ar010" or not CHASE.exists():
        return None
    wid = work["id"]
    ed = f"{wid}.chase1847"
    paras = read_chase()
    starts_of = english_chapter_starts(work, placer)
    starts = placer.stream_positions(paras)
    fixed, seen = [], set()
    for k, p in enumerate(paras):
        if p["book"] not in seen and (p["book"], 1) in starts_of:
            seen.add(p["book"])
            fixed.append((starts[k], starts_of[(p["book"], 1)]))
    pieces, info = placer.computed(paras, sorted(fixed))
    translations.add_edition(db, ed, wid, "chase-1847", "Chase (1847)", "D. P. Chase",
                             "The Nicomachean Ethics of Aristotle, translated by D. P. Chase (1847), with an introduction by J. A. Smith "
                             "(Everyman's Library, London: J. M. Dent, 1911); Project Gutenberg eBook #8438",
                             str(CHASE.relative_to(ROOT)), "clean source text (Project Gutenberg)",
                             "No Bekker numbers in this edition: every paragraph is placed by tools/align.py against the Loeb English (≈), "
                             f"with the start of each book as a fixed point ({len(fixed)}).", translations.COMPUTED)
    seq = 0
    for k, a, b, s0, e in pieces:
        text = paras[k]["text"][a:b].strip()
        if text:
            translations.add_chunk(db, ed, wid, seq, k, s0, e, translations.COMPUTED, None, "D. P. Chase", None,
                                   f"Book {ROMAN[paras[k]['book'] - 1]}, chapter {paras[k]['chapter']}", text)
            seq += 1
    return {"edition": ed, "paragraphs": len(paras), "chunks": seq, "fixed_points": len(fixed), "anchors": info["anchors"],
            "words": sum(len(p["text"].split()) for p in paras), "method": translations.COMPUTED}


# ------------------------------------------------------------------ key terms

def mark_terms(db, work_id):
    """Milestone 17's key terms in the Greek of one work, by the terms' own rules, into ar_term_hit."""
    import nt
    import terms
    rules = nt.term_rules(db)
    hits = []
    rows = db.execute("SELECT t.id, t.section_ref, t.form, g.lemma, g.postag, t.chunk_id FROM token t JOIN edition e ON e.id = t.edition_id "
                      "LEFT JOIN tag g ON g.token_id = t.id AND g.part = 0 WHERE e.work_id = ? AND e.lang = 'grc' ORDER BY t.id", (work_id,)).fetchall()
    prev, chunk = [], None
    for tid, ref, form, lemma, postag, cid in rows:
        if cid != chunk:
            prev, chunk = [], cid
        t = {"lemma": lemma or "", "postag": postag or "", "form": form}
        for term_id, rule, except_ in rules.get(lemma, ()):
            if rule == "all" or terms.articular(prev, t, form, except_):
                hits.append((term_id, tid, work_id, ref, form))
        prev.append(t)
    db.executemany("INSERT OR IGNORE INTO ar_term_hit VALUES (?,?,?,?,?)", hits)
    return len(hits)


# ------------------------------------------------------------------ the build

def build(db, sources):
    """Write the works into the library (called last by build_db.build). Returns the figures for reports/aristotle.md."""
    stats = {"works": []}
    for i, w in enumerate(WORKS):
        db.execute("INSERT INTO work (id, urn, title, imported, abbr, slug, corpus) VALUES (?,?,?,?,?,?,?)",
                   (w["id"], f"{AR_URN}.{w['tlg']}", w["title"], 0, w["abbr"], w["slug"], "aristotle"))
        s = build_db.build_work(db, w["id"], sources, cfg_for(w))
        placer = translations.Placer(db, w["id"])
        s["translations"] = [t for t in (build_ross(db, w, placer), build_taylor(db, w, placer), build_chase(db, w, placer)) if t]
        s["term_words"] = mark_terms(db, w["id"])
        s["plain"] = w["plain"]
        stats["works"].append(s)
    # Aristotle milestone A3 onward: the works Perseus does not have, from First1KGreek, with the scanned translations.
    import aristotle_f1k
    import aristotle_trans
    if aristotle_f1k.available():
        for w in aristotle_f1k.WORKS:
            build_f1k_work(db, w, sources, stats)
    db.execute("""UPDATE work SET first_token = r.lo, last_token = r.hi, n_tokens = r.n FROM
                  (SELECT e.work_id, min(t.id) lo, max(t.id) hi, count(*) n FROM token t JOIN edition e ON e.id = t.edition_id
                   WHERE e.lang = 'grc' AND e.source_id IN (?, ?) GROUP BY e.work_id) r WHERE r.work_id = work.id""",
               (GREEK_SRC, aristotle_f1k.F1K_SRC))
    db.execute("INSERT INTO build VALUES ('aristotle_stats', ?)", (json.dumps(stats, ensure_ascii=False, default=str),))
    return stats


def build_f1k_work(db, w, sources, stats):
    """One work from First1KGreek (aristotle_f1k) with its scanned translations (aristotle_trans)."""
    import aristotle_f1k
    import aristotle_trans
    db.execute("INSERT INTO work (id, urn, title, imported, abbr, slug, corpus) VALUES (?,?,?,?,?,?,?)",
               (w["id"], f"{AR_URN}.{w['tlg']}" + (f":{w['select']}" if w["id"].endswith("p") else ""),   # both Analytics are tlg001
                w["title"], 1, w["abbr"], w["slug"], "aristotle"))
    s = aristotle_f1k.build_greek(db, w, sources)
    s["translations"] = aristotle_trans.build_for(db, w)
    s["term_words"] = mark_terms(db, w["id"])
    s["plain"] = w["plain"]
    stats["works"].append(s)
    return s


def write_report(stats):
    lines = ["# Aristotle (Aristotle milestones A1 and A3)", "",
             "Written by `tools/build_db.py` (through `tools/aristotle.py`) each time the library is built.", "",
             "| Work | Bekker columns | Greek words | tagged by GLAUx | with Morpheus | Loeb notes | key-term words |",
             "|---|---:|---:|---:|---:|---:|---:|"]
    for s in stats["works"]:
        lines.append(f"| {s['title']} | {s['sections']} | {s['tokens']:,} | {s['tagged']:,} ({100 * s['tagged'] / max(1, s['tokens']):.2f}%) | "
                     f"{s['with_morpheus']:,} | {s['notes']} | {s['term_words']:,} |")
    lines += ["", "## The translations beside the Greek", ""]
    for s in stats["works"]:
        if s.get("english_sections"):
            lines.append(f"- **{s['title']}**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them "
                         f"({s['english_sections']} of {s['sections']} columns; none missing: {not s['english_sections_missing']}).")
        else:
            lines.append(f"- **{s['title']}**: the Greek from First1KGreek, its {s['sections']} Bekker columns from {s['columns_from']}"
                         + (f" (left out, out of Bekker's order: {', '.join(s['marks_left_out'])})" if s['marks_left_out'] else "") + ".")
        for t in s["translations"]:
            extra = ""
            if "printed_columns" in t:
                extra = (f" {t['printed_columns']} Bekker columns read from Ross's margin and used as fixed points; "
                         f"{t['chunks_at_a_printed_column']} pieces begin at a column he prints.")
            if "books_with_chapters_as_perseus" in t:
                extra = (f" {t['fixed_points']} fixed points (book and chapter starts); Taylor's chapters agree with the Perseus "
                         f"text's in books {', '.join(map(str, t['books_with_chapters_as_perseus']))}.")
            lines.append(f"  - `{t['edition']}`: {t['paragraphs']} paragraphs, {t['words']:,} words, {t['chunks']} pieces placed, "
                         f"{t.get('notes', 0)} notes; {t.get('anchors', 0)} anchors found by tools/align.py.{extra}")
    lines += ["", "Every placement not printed in the book is marked ≈ in the reader. The OCR of Ross and Taylor is cleaned by rule "
              "(`tools/aristotle_ocr.py`) and not proofread; *Show the OCR* in the reader shows each paragraph as the scan reads it.", ""]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
