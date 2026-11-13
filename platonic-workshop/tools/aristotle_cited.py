#!/usr/bin/env python3
"""Aristotle milestone A8f: the works that are not on Bekker's pages, each cited by its own numbers.

Bekker's Berlin edition (1831) did not print the Constitution of the Athenians (found on a papyrus in 1890), the Letters or
the Divisions, so they have no Bekker columns. Each is cited here as its own editions cite it, in the reader's form for a
chapter and verse (the New Testament's, milestone 23): a section is "chapter:number", and a page of the reader is the chapter.

  ar003  Constitution of the Athenians   Kenyon's Greek (Oxford Classical Texts, 1920), Perseus TEI: chapter and section, as
                                         every edition numbers them (42.1 is the section "42:1", on page 42). The four
                                         fragments of the lost beginning, quoted by later writers, are left out.
                                         English: Kenyon's translation (Project Gutenberg #26095), each chapter at its first
                                         section (printed), the sections within it shared out by length (≈).
  ar011  Letters                         Hercher's Greek (Epistolographi Graeci, Paris, 1873), First1KGreek TEI: by letter
                                         ("3:1" is the third letter, whole; page 3).
  ar048  Divisions                       Mutschmann's Greek (Divisiones quae vulgo dicuntur Aristoteleae, Leipzig, 1906),
                                         First1KGreek TEI. Mutschmann prints two texts of the divisions side by side and
                                         numbers each: Diogenes Laertius' (III 80-109; page 1, "1:5" is his fifth division) and
                                         the codex Marcianus' (page 2, "2:58" is its fifty-eighth).

Every word is paired with GLAUx's where GLAUx has the work (aristotle_f1k.tag_words): the Constitution chapter by chapter, the
Letters as a whole; GLAUx has twenty-one of the Divisions, in its own order and numbering, each paired with the division of
Mutschmann's text it matches best.
"""
import difflib
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_f1k  # noqa: E402
import build_db  # noqa: E402
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
TEI = "{http://www.tei-c.org/ns/1.0}"
PERSEUS_SRC, F1K_SRC, GLAUX_SRC = "perseus-greek-aristotle", "first1k-aristotle", "glaux-aristotle"
KENYON = ROOT / "sources" / "aristotle" / "kenyon-athenian-constitution" / "pg26095.txt"
REF = re.compile(r"^(\d{1,3}):(\d{1,3})$")

WORKS = [
    {"id": "ar003", "tlg": "tlg003", "title": "Constitution of the Athenians", "abbr": "Ath. Pol.", "slug": "constitution-of-the-athenians",
     "greek_title": "Ἀθηναίων πολιτεία", "source": PERSEUS_SRC, "file": "perseus-grc2", "editor": "Frederic G. Kenyon",
     "label": "Kenyon (Oxford, 1920)", "scheme": "chapter",
     "plain": "The history of Athens' constitution in eleven changes, from the kings and Draco through Solon, Pisistratus, Cleisthenes "
              "and the democracy to the restoration of 403 (chapters 1-41); then the constitution of Aristotle's own day, its "
              "citizens, council, magistrates and law courts (42-69). Found on a papyrus in 1890; Aristotle's or his school's."},
    {"id": "ar011", "tlg": "tlg011", "title": "Letters", "abbr": "Ep.", "slug": "letters-of-aristotle",
     "greek_title": "Ἐπιστολαί", "source": F1K_SRC, "file": "grc1", "editor": "Rudolf Hercher",
     "label": "Hercher (Paris, 1873)", "scheme": "letter", "pair": "whole",
     "plain": "Six short letters under Aristotle's name, to Philip, Alexander and Theophrastus, on kindness and the use of rule; the "
              "last, to Alexander, says his lectures are published and not published, for only his hearers understand them. "
              "Thought not to be his."},
    {"id": "ar048", "tlg": "tlg048", "title": "Divisions", "abbr": "Div.", "slug": "divisions",
     "greek_title": "Διαιρέσεις", "source": F1K_SRC, "file": "grc1", "editor": "Hermann Mutschmann",
     "label": "Mutschmann (Leipzig, 1906)", "scheme": "division",
     "plain": "Divisions of the goods, friendship, constitutions, justice, the sciences, medicine, law, speech and more, each into its "
              "kinds, of the kind Plato practised in the Academy; Diogenes Laertius gives them as Aristotle's account of Plato's "
              "divisions. Two texts of them, Diogenes' and a manuscript's, side by side."},
]
WORK_BY_ID = {w["id"]: w for w in WORKS}
# The two texts of the Divisions, by the page they are on.
DIVISION_TEXTS = {1: "Diogenes", 2: "Marcianus"}


def tei_file(work):
    d = RAW / work["source"] / "data" / "tlg0086" / work["tlg"]
    return next(d.glob(f"*{work['file']}.xml"))


def parse_ref(ref):
    """'42:1' -> (42, 1): the page (chapter, letter, or the text of the Divisions) and the number within it."""
    m = REF.match(ref)
    return (int(m.group(1)), int(m.group(2)))


def label_of(work, ref):
    """How a section is cited: 'Ath. Pol. 42.1', 'Letter 3', 'Diogenes 5' (Mutschmann's numbers)."""
    a, b = parse_ref(ref)
    if work["scheme"] == "chapter":
        return f"{a}.{b}"
    if work["scheme"] == "letter":
        return f"Letter {a}"
    return f"{DIVISION_TEXTS[a]} {b}"


def page_label(work, page):
    if work["scheme"] == "chapter":
        return f"Chapter {page}"
    if work["scheme"] == "letter":
        return f"Letter {page}"
    return "Diogenes Laertius' text" if page == 1 else "The codex Marcianus' text"


# ------------------------------------------------------------------ reading the Greek

def text_of(el, skip=("note", "head", "bibl", "pb", "label")):
    """The running text of an element: editors' additions in ⟨⟩, deletions in [], a lost stretch as …; notes, heads and
    page breaks left out; the spacing collapsed."""
    out = []

    def walk(e):
        tag = e.tag.replace(TEI, "")
        if tag in skip:
            return
        if tag == "gap":
            out.append(" … ")
            return
        out.append({"add": "⟨", "del": "["}.get(tag, ""))
        out.append(e.text or "")
        for c in e:
            walk(c)
            out.append(c.tail or "")
        out.append({"add": "⟩", "del": "]"}.get(tag, ""))
        if tag in ("l", "lb", "p"):
            out.append(" ")

    walk(el)
    return " ".join("".join(out).split())


def head_of(div):
    h = div.find(f"{TEI}head")
    return text_of(h, skip=("note", "bibl", "pb", "label")).rstrip(".") if h is not None else ""


def textparts(el, subtype):
    return [d for d in el.iter(f"{TEI}div") if d.get("type") == "textpart" and d.get("subtype") == subtype]


def read_constitution(root):
    """The Constitution, section by section: [{'book', 'chapter', 'ref', 'cts', 'label', 'text'}]. The fragments
    (frag_1 ...) are left out: they are quotations of the lost beginning by later writers, not on the papyrus."""
    paras = []
    for ch in textparts(root, "section"):
        if not ch.get("n", "").isdigit():
            continue
        for sec in textparts(ch, "subsection"):
            t = text_of(sec)
            if t:
                paras.append({"book": None, "chapter": int(ch.get("n")), "ref": f"{int(ch.get('n'))}:{int(sec.get('n'))}",
                              "cts": f"{ch.get('n')}.{sec.get('n')}", "label": None, "text": t})
    return paras


def read_letters(root):
    paras = []
    for ep in textparts(root, "epistle"):
        n = int(ep.get("n"))
        for p in ep.iter(f"{TEI}p"):
            t = text_of(p)
            if t:
                paras.append({"book": None, "chapter": n, "ref": f"{n}:1", "cts": str(n), "label": f"Letter {n}: {head_of(ep)}", "text": t})
    return paras


def read_divisions(root):
    """Mutschmann's two texts. His first part sets them side by side: n='1_col1' is Diogenes' first division, n='5_col2' the
    Marcianus' fifth; where the Marcianus has two divisions against one of Diogenes' (n='63_51_col2'), its paragraphs are
    the two, in the order named. His second part (n='3') is the Marcianus' divisions Diogenes does not have. Diogenes'
    are put first, then the Marcianus' in its own order (1 to 69)."""
    paras = []
    for book in textparts(root, "book"):
        for sec in textparts(book, "section"):
            n = sec.get("n")
            text_no = 1 if n.endswith("_col1") else 2
            nums = [int(x) for x in n.replace("_col1", "").replace("_col2", "").split("_")]
            # (the source Mutschmann names before Diogenes' first division, "Diog. Laert. III 80 sqq.:", is left out with its colon)
            ps = [text_of(p).lstrip(":· ") for p in sec.iter(f"{TEI}p")]
            ps = [p for p in ps if p]
            if len(nums) > 1 and len(ps) != len(nums):
                raise SystemExit(f"Divisions {n}: {len(ps)} paragraphs for {len(nums)} divisions")
            for i, p in enumerate(ps):
                num = nums[i] if len(nums) > 1 else nums[0]
                paras.append({"book": text_no, "chapter": num, "ref": f"{text_no}:{num}", "cts": f"{book.get('n')}.{n}" + (f".{i + 1}" if len(nums) > 1 else ""),
                              "label": f"{DIVISION_TEXTS[text_no]} {num}: {head_of(sec)}", "text": p})
    return sorted(paras, key=lambda p: (p["book"], p["chapter"]))       # sorted() keeps the paragraphs of one division in order


READERS = {"chapter": read_constitution, "letter": read_letters, "division": read_divisions}


def read(work):
    root = ET.parse(tei_file(work)).getroot()
    return READERS[work["scheme"]](root), build_db.header_info(root)


# ------------------------------------------------------------------ GLAUx

def plain_words(text):
    return [greek.strip_accents(greek.nfc(m.group(0))).rstrip(greek.APOSTROPHES) for m in greek.WORD.finditer(text)]


def glaux_for(work, paras):
    """GLAUx's words, keyed as our paragraphs are paired (aristotle_f1k.pair_key). GLAUx has the Divisions in twenty-one
    chapters of its own: each is given to the division of Mutschmann's text whose words it matches best (at least half)."""
    by_ch, _ = aristotle_f1k.glaux_words(work)
    if work["scheme"] != "division":
        return by_ch, {}
    ours = defaultdict(list)
    for p in paras:
        ours[(p["book"], p["chapter"])] += plain_words(p["text"])
    out, matched = {}, {}
    for (_, ch), ws in sorted(by_ch.items()):
        theirs = [greek.strip_accents(greek.nfc(w["form"])).rstrip(greek.APOSTROPHES) for w in ws]
        best, score = None, 0
        for key, mine in ours.items():
            r = difflib.SequenceMatcher(None, mine, theirs, autojunk=False).ratio()
            if r > score:
                best, score = key, r
        if best and score >= 0.5 and best not in out:
            out[best] = ws
            matched[ch] = (best, round(score, 2))
    return out, matched


# ------------------------------------------------------------------ the build

def available():
    return all((RAW / w["source"] / "data" / "tlg0086" / w["tlg"]).exists() for w in WORKS) and \
        all((RAW / GLAUX_SRC / "xml" / f"0086-{w['tlg'][3:]}.xml").exists() for w in WORKS)


def build_work(db, work, sources):
    """One work into the library, with its English where there is one. Returns its figures (as aristotle_f1k.build_greek)."""
    import aristotle
    wid = work["id"]
    urn = f"urn:cts:greekLit:tlg0086.{work['tlg']}"
    db.execute("INSERT INTO work (id, urn, title, imported, abbr, slug, corpus) VALUES (?,?,?,?,?,?,?)",
               (wid, urn, work["title"], 1, work["abbr"], work["slug"], "aristotle"))
    paras, head = read(work)
    order = []
    for p in paras:
        if not order or order[-1][0] != p["ref"]:
            order.append((p["ref"], p["cts"]))
    for i, (ref, cts) in enumerate(order):
        page, n = parse_ref(ref)
        db.execute("INSERT INTO section VALUES (?,?,?,?,?,?)", (wid, ref, page, str(n), i, f"{urn}:{cts}"))
    f = tei_file(work)
    ed = f"{wid}.{'f1k-' if work['source'] == F1K_SRC else ''}{work['file']}"
    db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status) VALUES (?,?,?,?,?,?,?,?,?,?)", (
        ed, wid, work["source"], "grc", "text", work["label"], work["editor"],
        f"{head['editor'] or work['editor']}, {head['title']}" + (f" ({head['place']}, {head['date']})" if head.get("date") else ""),
        f"data/tlg0086/{work['tlg']}/{f.name}", "clean source text"))
    chunk_rows = []
    for seq, p in enumerate(paras):
        cur = db.execute("INSERT INTO chunk (edition_id, work_id, section_ref, seq, para, speaker, label, text) VALUES (?,?,?,?,?,?,?,?)",
                         (ed, wid, p["ref"], seq, seq, None, None, p["text"]))
        chunk_rows.append((cur.lastrowid, seq, p["ref"], p["text"]))
    glaux, matched = glaux_for(work, paras)
    basis = {"chapter": "chapter and section as Perseus divides Kenyon's text (<div subtype=\"section\">, <div subtype=\"subsection\">), "
                        "as every edition numbers them",
             "letter": "the letters as Hercher numbers them (<div subtype=\"epistle\">)",
             "division": "Mutschmann's numbers of the divisions, in Diogenes Laertius' text and in the codex Marcianus' "
                         "(<div subtype=\"section\" n=\"1_col1\">, n=\"5_col2\")"}[work["scheme"]]
    stats = {"work": wid, "title": work["title"], "columns_from": basis, "marks_kept": 0, "marks_left_out": [], "glaux_columns": 0,
             "columns_by_length": [], "sections": len(order), "greek_from": "Perseus" if work["source"] == PERSEUS_SRC else "First1KGreek",
             "sections_are": {"chapter": "sections", "letter": "letters", "division": "divisions"}[work["scheme"]],
             "glaux_divisions": matched}
    stats.update(aristotle_f1k.tag_words(db, work, ed, chunk_rows, paras, glaux))
    stats.update({"notes": 0, "english_sections": 0, "english_sections_missing": []})
    # Pages (the chapters, the letters, the two texts of the Divisions), and the letters and divisions by their headings.
    pages = defaultdict(list)
    for ref, _ in order:
        pages[parse_ref(ref)[0]].append(ref)
    for page, refs in pages.items():
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (wid, "page", page_label(work, page), refs[0], refs[-1], work["source"], basis))
    seen = set()
    for p in paras:
        if p["label"] and p["ref"] not in seen:
            seen.add(p["ref"])
            db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                       (wid, "ar-chapter", p["label"], p["ref"], p["ref"], work["source"], "the heading printed over it (<head>)"))
    stats["parts"] = len(seen)
    stats["translations"] = [t for t in (build_kenyon(db, work),) if t]
    stats["term_words"] = aristotle.mark_terms(db, wid)
    stats["plain"] = work["plain"]
    return stats


# ------------------------------------------------------------------ Kenyon's English

def read_kenyon():
    """Kenyon's Constitution from the Gutenberg text: [{'text', 'chapter'}], the transcriber's notes left out."""
    t = KENYON.read_text(encoding="utf-8").replace("\r\n", "\n")
    t = t.split("*** START OF THE PROJECT GUTENBERG EBOOK", 1)[1].split("*** END OF THE PROJECT GUTENBERG EBOOK", 1)[0]
    t = t[re.search(r"^Part 1\s*$", t, re.M).start():]
    t = re.split(r"^THE END\s*$", t, maxsplit=1, flags=re.M)[0]
    paras, chapter = [], 0
    for block in re.split(r"\n\s*\n", t):
        b = " ".join(block.split())
        if not b:
            continue
        m = re.fullmatch(r"Part (\d+)", b)
        if m:
            chapter = int(m.group(1))
            continue
        b = re.sub(r"\s*\[Transcriber's note:[^\]]*\]", "", b)
        paras.append({"text": b, "chapter": chapter})
    return paras


def build_kenyon(db, work):
    if work["id"] != "ar003" or not KENYON.exists():
        return None
    import aristotle_trans
    import translations
    wid = work["id"]
    ed = f"{wid}.kenyon"
    order = [r[0] for r in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (wid,))]
    paras = read_kenyon()
    first_of = {}
    for k, p in enumerate(paras):
        first_of.setdefault(p["chapter"], k)
    for k, p in enumerate(paras):
        p["marks"] = [(0, f"{p['chapter']}:1")] if first_of[p["chapter"]] == k and f"{p['chapter']}:1" in order else []
    pieces = aristotle_trans.place(paras, order)
    translations.add_edition(db, ed, wid, "kenyon-athenian-constitution", "Kenyon (1891)", "Frederic G. Kenyon",
                             "Aristotle, The Athenian Constitution, translated by Frederic G. Kenyon (first published 1891); "
                             "Project Gutenberg eBook #26095", str(KENYON.relative_to(ROOT)), "clean source text (Project Gutenberg)",
                             "Kenyon's chapters are those of the Greek: each begins at the chapter's first section. He does not number the "
                             "sections, so within a chapter they are shared out over his English by length, cut at the end of a sentence (≈).",
                             "printed")
    for seq, (k, a, b, ref, method) in enumerate(pieces):
        translations.add_chunk(db, ed, wid, seq, k, ref, ref, method, None, "Frederic G. Kenyon", None,
                               f"Part {paras[k]['chapter']}", paras[k]["text"][a:b].strip())
    return {"edition": ed, "paragraphs": len(paras), "chunks": len(pieces), "notes": 0, "anchors": 0,
            "chapters_at_their_section": len({x[3] for x in pieces if x[4] == "printed"}),
            "words": sum(len(p["text"].split()) for p in paras), "method": "printed and computed"}


def lemmas():
    out = set()
    for w in WORKS:
        p = RAW / GLAUX_SRC / "xml" / f"0086-{w['tlg'][3:]}.xml"
        if p.exists():
            for m in re.finditer(r' lemma="([^"]*)"', p.read_text(encoding="utf-8")):
                out.add(greek.nfc(m.group(1)))
    return {l for l in out if greek.is_greek(l)}
