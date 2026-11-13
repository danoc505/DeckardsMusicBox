#!/usr/bin/env python3
"""Aristotle milestone A3 onward: the works Perseus does not have, from First1KGreek's TEI.

    first1k-aristotle   the Greek (On the Soul, On the Heavens, Physics ...), with Bekker's pages and columns
                        printed in the margin (<note type="marginal">184a</note>): each starts a section, as a
                        Perseus milestone does for the Metaphysics.
    glaux-aristotle     GLAUx's dictionary form and grammar of every word. GLAUx keys these works by book and
                        chapter, so our words are paired with GLAUx's chapter by chapter (build_db.align).

The works are written into the library as build_db.build_work writes the Metaphysics (sections, the Greek
edition, chunks, tokens, tags, Morpheus keys, pages, books and chapters); the English beside them comes from
the scanned translations (tools/aristotle_trans.py), since Perseus has no Loeb English for them.
"""
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_db  # noqa: E402
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
TEI = "{http://www.tei-c.org/ns/1.0}"
F1K_SRC, GLAUX_SRC = "first1k-aristotle", "glaux-aristotle"
BEKKER = re.compile(r"^(\d{2,4})\s?([ab])$")
# A column as the margin of a scanned edition prints it: "p. 704a", "698 a", "650.a", "1181a 25" (with the line number).
MARGIN = re.compile(r"^(?:p\s?\.?\s?)?(\d{2,4})\s?[.,]?\s?([ab])(?:\s+\d{1,2})?$")
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"]

# The works, in the Platonists' order within each step (logic, ethics, physics, theology).
# columns "english": the Greek prints no Bekker columns (Bekker's own text, in the Oxford reprint of 1837, paged anew);
# they are carried over from the Oxford translation's margin (tools/aristotle_organon.py), chapter by chapter (≈).
# select: of a file holding both Analytics, the one (<div subtype="book">) this work is; its <div subtype="part"> are the books.
LOGIC_EDITOR = "Immanuel Bekker"
WORKS = [
    {"id": "ar006", "tlg": "tlg006", "file": "grc1", "title": "Categories", "abbr": "Cat.", "slug": "categories",
     "greek_title": "Κατηγορίαι", "editor": LOGIC_EDITOR, "label": "Bekker (Oxford, 1837)", "columns": "english",
     "plain": "The ten kinds of thing that can be said: substance, quantity, quality, relation, place, time, position, state, "
              "action, affection; the primary substance, the individual man or horse, and the secondary, his species and genus."},
    {"id": "ar017", "tlg": "tlg017", "file": "grc1", "title": "On Interpretation", "abbr": "Int.", "slug": "on-interpretation",
     "greek_title": "Περὶ ἑρμηνείας", "editor": LOGIC_EDITOR, "label": "Bekker (Oxford, 1837)", "columns": "english",
     "plain": "Words as symbols of thoughts, and thoughts as likenesses of things; the noun, the verb and the sentence; "
              "affirmation and denial, and whether there will be a sea-fight tomorrow (chapter 9)."},
    {"id": "ar001", "tlg": "tlg001", "file": "grc2", "title": "Prior Analytics", "abbr": "APr.", "slug": "prior-analytics",
     "greek_title": "Ἀναλυτικὰ πρότερα", "editor": "W. D. Ross", "label": "Ross (Oxford, 1964)", "select": "1", "glaux_book": "priora", "bekker": ("24a", "70b"),
     "plain": "The syllogism: from two premisses something other than them follows of necessity; its three figures, "
              "necessary and possible premisses, and how syllogisms are found and reduced."},
    {"id": "ar001p", "tlg": "tlg001", "file": "grc2", "title": "Posterior Analytics", "abbr": "APo.", "slug": "posterior-analytics",
     "greek_title": "Ἀναλυτικὰ ὕστερα", "editor": "W. D. Ross", "label": "Ross (Oxford, 1964)", "select": "2", "glaux_book": "posteriora", "bekker": ("71a", "100b"),
     "plain": "Demonstration: knowledge through causes from first principles that are true, primary and immediate; "
              "definition; and in the last chapter how the first principles are known by intellect (νοῦς)."},
    {"id": "ar044", "tlg": "tlg044", "file": "grc1", "title": "Topics", "abbr": "Top.", "slug": "topics",
     "greek_title": "Τοπικά", "editor": LOGIC_EDITOR, "label": "Bekker (Oxford, 1837)", "columns": "english",
     "plain": "Dialectic: reasoning from reputable opinions; the four predicables (definition, property, genus, accident) "
              "and the places from which arguments about each are drawn."},
    {"id": "ar040", "tlg": "tlg040", "file": "grc1", "title": "Sophistical Refutations", "abbr": "SE", "slug": "sophistical-refutations",
     "greek_title": "Περὶ σοφιστικῶν ἐλέγχων", "editor": LOGIC_EDITOR, "label": "Bekker (Oxford, 1837)", "columns": "english",
     "plain": "The fallacies of the sophists, those that depend on language and those that do not, and how each is solved."},
    {"id": "ar031", "tlg": "tlg031", "file": "grc1", "title": "Physics", "abbr": "Phys.", "slug": "physics",
     "greek_title": "Φυσικὴ ἀκρόασις", "editor": "W. D. Ross", "label": "Ross (Oxford)",
     "plain": "Nature, its principles and causes; motion, the infinite, place, the void and time; and in Book VIII the first "
              "unmoved mover, without parts or magnitude, on which the eternal motion of the heaven depends."},
    {"id": "ar005", "tlg": "tlg005", "file": "grc1", "title": "On the Heavens", "abbr": "Cael.", "slug": "on-the-heavens",
     "greek_title": "Περὶ οὐρανοῦ", "editor": "Carl Prantl", "label": "Prantl (Leipzig, 1881)",
     "plain": "The heaven, ungenerated and imperishable, moving in a circle; the fifth body; the elements and their natural "
              "motions; Simplicius' commentary on it is the Platonists' great defence of the eternity of the world."},
    {"id": "ar002", "tlg": "tlg002", "file": "grc2", "title": "On the Soul", "abbr": "de An.", "slug": "on-the-soul",
     "greek_title": "Περὶ ψυχῆς", "editor": "W. D. Ross", "label": "Ross (Oxford)",
     "plain": "The soul as the first actuality of a natural body; nutrition, sensation, imagination, thought; and in Book III "
              "chapter 5 the intellect that makes all things, separate, impassive and unmixed, which the commentators read "
              "as the divine intellect in us."},
    # Aristotle milestone A8c: the works First1KGreek has in Greek only that print Bekker's columns (in the margin, or in
    # GLAUx). margin: the columns are read from the margin of the TEI, not GLAUx's; fill_gaps: the columns lost (in the margin,
    # or GLAUx's) are placed by length (≈); bekker: the work's first and last column; glaux: GLAUx's number for the work.
    {"id": "ar022", "tlg": "tlg022", "file": "grc1", "title": "Magna Moralia", "abbr": "MM", "slug": "magna-moralia",
     "greek_title": "Ἠθικὰ μεγάλα", "editor": "Franz Susemihl", "label": "Susemihl (Leipzig, 1883)", "margin": True, "bekker": ("1181a", "1213b"), "fill_gaps": True,
     "plain": "A shorter course of the ethics in two books, under Aristotle's name since antiquity: happiness, the virtues of character "
              "and of intellect, self-control, pleasure and friendship; whether it is his own or his school's is disputed."},
    {"id": "ar013", "tlg": "tlg013", "file": "grc2", "title": "On Generation and Corruption", "abbr": "GC", "slug": "generation-and-corruption",
     "greek_title": "Περὶ γενέσεως καὶ φθορᾶς", "editor": "Carl Prantl", "label": "Prantl (Leipzig, 1881)", "margin": True, "bekker": ("314a", "338b"), "fill_gaps": True,
     "glaux_merge": {(1, 10): (1, 9)},     # Prantl's TEI runs Book I chapter 10 on in chapter 9
     "plain": "Coming to be and passing away, distinguished from alteration and growth; contact, action and passion, mixture; the four "
              "elements from the hot, cold, wet and dry, and their change into one another; the cycle of generation kept going by the "
              "sun's motion along the ecliptic (Book II 10)."},
    {"id": "ar026", "tlg": "tlg026", "file": "grc2", "title": "Meteorology", "abbr": "Mete.", "slug": "meteorology",
     "greek_title": "Μετεωρολογικά", "editor": "Francis H. Fobes", "label": "Fobes (Cambridge, Mass., 1919)", "margin": True, "bekker": ("338a", "390b"), "fill_gaps": True,
     "plain": "What happens in the region below the moon: shooting stars, comets and the Milky Way; rain, snow and dew; rivers and the "
              "sea, and why it is salt; winds, earthquakes, thunder, rainbows; and in Book IV the hot and the cold working on the "
              "homoeomerous bodies."},
    {"id": "ar030", "tlg": "tlg030", "file": "grc1", "title": "Parts of Animals", "abbr": "PA", "slug": "parts-of-animals",
     "greek_title": "Περὶ ζῴων μορίων", "editor": "Bernhard Langkavel", "label": "Langkavel (Leipzig, 1868)", "bekker": ("639a", "697b"), "fill_gaps": True,
     "plain": "The method of the study of nature: the final cause before the necessary, and the dignity of studying even the humblest "
              "animals, since in all of them there is something natural and beautiful (Book I 5); then the parts of animals, "
              "uniform and non-uniform, and what each is for."},
    {"id": "ar015", "tlg": "tlg015", "file": "grc1", "title": "Progression of Animals", "abbr": "IA", "slug": "progression-of-animals",
     "greek_title": "Περὶ πορείας ζῴων", "editor": "Werner Jaeger", "label": "Jaeger (Leipzig, 1913)", "margin": True, "bekker": ("704a", "714b"), "fill_gaps": True, "glaux": "021",
     "plain": "Why animals move as they do: the three dimensions of up and down, front and back, right and left, and why animals with "
              "blood walk on no more than four points; nature does nothing in vain."},
    {"id": "ar021", "tlg": "tlg021", "file": "grc1", "title": "Movement of Animals", "abbr": "MA", "slug": "movement-of-animals",
     "greek_title": "Περὶ ζῴων κινήσεως", "editor": "Werner Jaeger", "label": "Jaeger (Leipzig, 1913)", "margin": True, "bekker": ("698a", "704b"), "fill_gaps": True, "glaux": "015",
     "plain": "The common cause of animal motion: an unmoved point within the animal and an unmoved mover outside, as the first mover "
              "of the heaven (chapters 1-4); desire and thought as the movers of the animal, and the practical syllogism."},
    {"id": "ar012", "tlg": "tlg012", "file": "grc1", "title": "Generation of Animals", "abbr": "GA", "slug": "generation-of-animals",
     "greek_title": "Περὶ ζῴων γενέσεως", "editor": "Immanuel Bekker", "label": "Bekker (Berlin, 1829)",
     "plain": "How animals are generated: the male gives the form and the source of motion, the female the matter; the soul's "
              "powers in the embryo, and the intellect alone entering from outside (θύραθεν) as divine (Book II 3); then "
              "inheritance, and why offspring take after one parent or the other."},
]
WORK_BY_ID = {w["id"]: w for w in WORKS}


def tei_file(work):
    d = RAW / F1K_SRC / "data" / "tlg0086" / work["tlg"]
    return next(d.glob(f"*-{work['file']}.xml"))


def read_tei(work):
    """The paragraphs of the Greek: [{'book', 'chapter', 'text', 'marks': [(offset, column)]}], and the header."""
    root = ET.parse(tei_file(work)).getroot()
    body = root.find(f".//{TEI}body")
    paras = []
    state = {"book": None, "chapter": None, "cur": None, "in": "select" not in work}

    def out(s):
        if s and state["cur"] is not None:
            state["cur"]["parts"].append(s)

    def walk(el):
        tag = el.tag.replace(TEI, "")
        if tag == "div" and el.get("type") == "textpart":
            if el.get("subtype") == "book" and "select" in work:
                state["in"] = el.get("n") == work["select"]
                state["book"] = None
            elif el.get("subtype") in ("book", "part"):
                state["book"] = int(el.get("n"))
            elif el.get("subtype") == "chapter":
                state["chapter"] = int(el.get("n"))
        if tag in ("head", "gap", "bibl"):
            return
        if tag == "note":
            n = " ".join("".join(el.itertext()).split())
            m = MARGIN.match(n)
            if el.get("type") == "marginal" and m and state["cur"] is not None:
                state["cur"]["marks"].append((len("".join(state["cur"]["parts"])), f"{int(m.group(1))}{m.group(2)}"))
            return
        if tag == "p":
            state["cur"] = {"book": state["book"], "chapter": state["chapter"], "parts": [], "marks": []}
            if state["in"]:
                paras.append(state["cur"])
        if tag == "del":
            out("[")
        if tag == "add":
            out("⟨")
        out(el.text)
        for c in el:
            walk(c)
            out(c.tail)
        if tag == "del":
            out("]")
        if tag == "add":
            out("⟩")
        if tag in ("l", "lb"):
            out(" ")

    walk(body)
    result = []
    for p in paras:
        raw = "".join(p["parts"])
        # Collapse the spacing; where[i] is the place in the collapsed text of the raw text's i-th character.
        out, where, space = [], [], True
        for ch in raw:
            where.append(len(out))
            if ch.isspace():
                if not space:
                    out.append(" ")
                space = True
            else:
                out.append(ch)
                space = False
        where.append(len(out))
        text = "".join(out).rstrip()
        if not text.strip():
            continue
        marks = sorted({min(where[o], len(text)): c for o, c in reversed(p["marks"])}.items())
        result.append({"book": p["book"], "chapter": p["chapter"], "text": text, "marks": marks})
    return result, build_db.header_info(root)


def glaux_file(work):
    """GLAUx's file of a work: by its TLG number, except where GLAUx numbers it otherwise (it has De motu animalium as
    0086-015 and De incessu animalium as 0086-021, the other way round from the TLG and First1KGreek)."""
    return RAW / GLAUX_SRC / "xml" / f"0086-{work.get('glaux', work['tlg'][3:])}.xml"


def glaux_words(work):
    """GLAUx words of one work, real words only, grouped by (book, chapter); and its Bekker columns in order, if it has them."""
    by_ch = defaultdict(list)
    cols = []
    path = glaux_file(work)
    analysis = None
    for event, el in ET.iterparse(path, events=("start", "end")):
        if event == "start" and el.tag == "sentence":
            analysis = el.get("analysis")
        elif event == "end" and el.tag == "word":
            a = el.attrib
            col = a.get("div_bekker_page") or a.get("div_section")
            if col and BEKKER.match(col) and (not cols or cols[-1] != col):
                cols.append(col)
            if work.get("glaux_book") and a.get("div_book") != work["glaux_book"]:
                pass
            elif not a.get("artificial") and greek.is_greek(a.get("form", "")):
                ch = [int(x) for x in re.findall(r"\d+", a.get("div_chapter", "0"))]
                if a.get("div_book", "").isdigit():
                    key = (int(a["div_book"]), ch[-1])
                elif len(ch) >= 2:
                    key = (ch[-2], ch[-1])      # the Analytics: 'priora.1.3' is book I, chapter 3
                elif ch:
                    key = (0, ch[0])
                else:
                    key = (0, 0)
                key = work.get("glaux_merge", {}).get(key, key)
                by_ch[key].append({**a, "analysis": analysis})
            el.clear()
    return by_ch, cols


def increasing(seq, key):
    """The longest run of seq, in order, whose keys strictly increase (a misprinted column is left out)."""
    import bisect
    tails, tail_idx, prev = [], [], [None] * len(seq)
    for i, x in enumerate(seq):
        k = key(x)
        j = bisect.bisect_left(tails, k)
        if j == len(tails):
            tails.append(k)
            tail_idx.append(i)
        else:
            tails[j] = k
            tail_idx[j] = i
        prev[i] = tail_idx[j - 1] if j else None
    out, i = [], tail_idx[-1] if tail_idx else None
    while i is not None:
        out.append(seq[i])
        i = prev[i]
    return out[::-1]


def col_key(c):
    return (int(c[:-1]), c[-1])


def marks_from_glaux(paras, glaux):
    """Where GLAUx gives each word its Bekker column: the column of each of our words, by pairing them with GLAUx's
    chapter by chapter; a column starts at the first of our words GLAUx puts in it. [(para, offset, column)]."""
    toks = []
    for k, p in enumerate(paras):
        for m in greek.WORD.finditer(p["text"]):
            toks.append((k, m.start(), greek.nfc(m.group(0)), (p["book"] or 0, p["chapter"] or 0)))
    by_ch = defaultdict(list)
    for i, t in enumerate(toks):
        by_ch[t[3]].append(i)
    col_of = {}
    for ch, idxs in by_ch.items():
        theirs = glaux.get(ch, [])
        for li, (js, _) in build_db.align([toks[i][2] for i in idxs], [w["form"] for w in theirs]).items():
            c = theirs[js[0]].get("div_bekker_page") or theirs[js[0]].get("div_section")
            if c and BEKKER.match(c):
                col_of[idxs[li]] = c
    out, last = [], None
    for i, t in enumerate(toks):
        c = col_of.get(i)
        if c and c != last:
            out.append((t[0], t[1], c))
            last = c
    return out


def sections_of(paras, glaux_cols, glaux=None, carried=None, bekker=None, fill=False):
    """Cut the paragraphs at the Bekker columns: [(para index, start, end, column)]. The columns are GLAUx's, word by
    word, where GLAUx has them; otherwise those printed in the margin of the TEI. Either way, only the longest run in
    Bekker's order is kept, so that a misprinted or misread column (another edition's page, 440b for 404b) is left out."""
    if carried is not None:
        cand = carried
        basis = ("Bekker's columns carried over from the margin of the Oxford translation (1928), chapter by chapter, at the same "
                 "proportion of the chapter (≈): this Greek, Bekker's text in his Oxford reprint (1837), does not print them")
    elif glaux_cols and glaux is not None:
        cand = marks_from_glaux(paras, glaux)
        basis = "GLAUx's Bekker column of each word"
    else:
        cand, hundreds = [], None
        for k, p in enumerate(paras):
            for off, col in p["marks"]:
                if int(col[:-1]) < 100 and hundreds:     # '20a' printed for 420a: the hundreds of the column before
                    col = f"{hundreds}{int(col[:-1]):02d}{col[-1]}"
                hundreds = int(col[:-1]) // 100
                cand.append((k, off, col))
        basis = "Bekker's pages and columns printed in the margin of the First1KGreek TEI"
    out_of_range = []
    if bekker:          # a file holding two works: the other's columns are left out (and a misread one outside the work)
        lo, hi = col_key(bekker[0]), col_key(bekker[1])
        out_of_range = [x[2] for x in cand if not lo <= col_key(x[2]) <= hi]
        cand = [x for x in cand if lo <= col_key(x[2]) <= hi]
    kept = increasing(cand, lambda x: col_key(x[2]))
    keep_set = set(id(x) for x in kept)
    dropped = [x[2] for x in cand if id(x) not in keep_set] + (out_of_range if fill else [])
    by_length = []
    if fill and kept:
        kept, by_length = fill_gaps(paras, kept, bekker)
        if by_length:
            basis += ("; where a column is lost (" + ("GLAUx gives no word of it" if glaux_cols and glaux is not None and carried is None
                      else "the margin does not print it, or the scan misread it") + "), it is placed by the length of the text "
                      "between the columns either side (≈): " + ", ".join(by_length))
    pieces = []
    cur = kept[0][2] if kept else "1a"
    if bekker and kept and kept[0][2] != bekker[0] and (kept[0][0], kept[0][1]) != (0, 0):
        cur = bekker[0]         # the text before the first column printed is in the work's first column
    marks_by_para = defaultdict(list)
    for k, off, col in kept:
        marks_by_para[k].append((off, col))
    for k, p in enumerate(paras):
        t = p["text"]
        cuts = {0: cur}
        for off, col in marks_by_para.get(k, []):
            while 0 < off < len(t) and not t[off - 1].isspace():   # a mark inside a word moves to the word's start
                off -= 1
            cuts[off] = col
            cur = col
        offs = sorted(cuts)
        for a, b in zip(offs, offs[1:] + [len(t)]):
            if t[a:b].strip():
                pieces.append((k, a, b, cuts[a]))
    if fill:
        return pieces, [c for _, _, c in kept], dropped, basis, by_length
    return pieces, [c for _, _, c in kept], dropped, basis


def next_col(c):
    return f"{c[:-1]}b" if c[-1] == "a" else f"{int(c[:-1]) + 1}a"


def fill_gaps(paras, kept, bekker=None):
    """The columns the margin has lost, between two it prints (and before the first, after the last, to the work's first and
    last column): placed by length, each at the same share of the text between the columns read either side, at a word's
    start. Returns the marks with these added, in order, and the columns so placed."""
    starts, total = [], 0
    for p in paras:
        starts.append(total)
        total += len(p["text"]) + 1

    def at(pos):
        k = max(i for i, s0 in enumerate(starts) if s0 <= pos)
        return k, min(pos - starts[k], len(paras[k]["text"]))

    def missing(a, b):
        out, c = [], next_col(a)
        while col_key(c) < col_key(b) and len(out) < 50:
            out.append(c)
            c = next_col(c)
        return out

    marks = [(starts[k] + off, col) for k, off, col in kept]
    if bekker and col_key(bekker[0]) < col_key(marks[0][1]):
        marks.insert(0, (0, bekker[0]))
    if bekker and col_key(marks[-1][1]) < col_key(bekker[1]):
        marks.append((total, next_col(bekker[1])))          # the end of the text, as if the next column began there
    out, placed = [], []
    for (p0, c0), (p1, c1) in zip(marks, marks[1:]):
        out.append((p0, c0))
        gap = missing(c0, c1)
        for i, c in enumerate(gap, 1):
            out.append((p0 + (p1 - p0) * i // (len(gap) + 1), c))
            placed.append(c)
    out.append(marks[-1])
    if bekker and out[-1][0] == total:
        out.pop()
    return [(*at(pos), col) for pos, col in out], placed


def build_greek(db, work, sources):
    """The Greek of one work into the library. Returns its figures (as build_db.build_work does)."""
    wid = work["id"]
    paras, head = read_tei(work)
    glaux, glaux_cols = glaux_words(work)
    carried = None
    if work.get("columns") == "english":
        import aristotle_organon
        carried = aristotle_organon.carried_marks(work, paras)
    fill = work.get("fill_gaps", False)
    pieces, cols, dropped, basis, *rest = sections_of(paras, [] if work.get("margin") else glaux_cols, glaux, carried, work.get("bekker"), fill)
    order = []
    for _, _, _, col in pieces:
        if not order or order[-1] != col:
            order.append(col)
    stats = {"work": wid, "title": work["title"], "columns_from": basis, "marks_kept": len(cols), "marks_left_out": dropped,
             "glaux_columns": len(glaux_cols), "columns_by_length": rest[0] if rest else []}
    seen = set()
    order = [c for c in order if not (c in seen or seen.add(c))]
    urn = f"urn:cts:greekLit:tlg0086.{work['tlg']}"
    for i, ref in enumerate(order):
        page, letter = build_db.steph_key(ref)
        db.execute("INSERT INTO section VALUES (?,?,?,?,?,?)", (wid, ref, page, letter, i, f"{urn}:{ref}"))
    stats["sections"] = len(order)
    ed = f"{wid}.f1k-{work['file']}"
    f = tei_file(work)
    db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status) VALUES (?,?,?,?,?,?,?,?,?,?)", (
        ed, wid, F1K_SRC, "grc", "text", work["label"], work["editor"],
        f"{head['editor'] or work['editor']}, {head['title']}" + (f" ({head['place']}, {head['date']})" if head.get("date") else ""),
        f"data/tlg0086/{work['tlg']}/{f.name}", "clean source text"))
    # Chunks: each piece of a paragraph within one column.
    chunk_rows = []
    for seq, (k, a, b, col) in enumerate(pieces):
        text = paras[k]["text"][a:b].strip()
        cur = db.execute("INSERT INTO chunk (edition_id, work_id, section_ref, seq, para, speaker, label, text) VALUES (?,?,?,?,?,?,?,?)",
                         (ed, wid, col, seq, k, None, None, text))
        chunk_rows.append((cur.lastrowid, k, col, text))
    # Tokens, paired with GLAUx chapter by chapter.
    toks = []   # (chunk id, start, end, form, column, (book, chapter))
    for cid, k, col, text in chunk_rows:
        for m in greek.WORD.finditer(text):
            toks.append((cid, m.start(), m.end(), greek.nfc(m.group(0)), col, (paras[k]["book"] or 0, paras[k]["chapter"] or 0)))
    tok_keys, all_keys = {}, set()
    for t in toks:
        if t[3] not in tok_keys:
            tok_keys[t[3]] = greek.lookup_keys(t[3])
            all_keys.update(tok_keys[t[3]])
    morph = build_db.morpheus_lines(all_keys)
    by_ch = defaultdict(list)
    for i, t in enumerate(toks):
        by_ch[t[5]].append(i)
    pair_of = {}
    for ch, idxs in by_ch.items():
        theirs = glaux.get(ch, [])
        pairs = build_db.align([toks[i][3] for i in idxs], [w["form"] for w in theirs])
        for li, (js, method) in pairs.items():
            pair_of[idxs[li]] = ([theirs[j] for j in js], method)
    n_tok = n_tag = n_pos = n_split = n_morph = 0
    seq_in = defaultdict(int)
    for i, (cid, s, e, form, col, _) in enumerate(toks):
        seq_in[col] += 1
        mkey = next((k for k in tok_keys[form] if k in morph), None)
        cur = db.execute("INSERT INTO token (chunk_id, edition_id, section_ref, seq, start, end, form, plain, morph_key) VALUES (?,?,?,?,?,?,?,?,?)",
                         (cid, ed, col, seq_in[col], s, e, form, greek.strip_accents(form).rstrip(greek.APOSTROPHES), mkey))
        n_tok += 1
        n_morph += mkey is not None
        if i in pair_of:
            ws, method = pair_of[i]
            for part, w in enumerate(ws):
                db.execute("INSERT INTO tag VALUES (?,?,?,?,?,?,?,?,?,?)", (
                    cur.lastrowid, GLAUX_SRC, part, greek.nfc(w.get("lemma", "")), w.get("postag"), w.get("relation"),
                    w.get("analysis"), w.get("id"), greek.nfc(w.get("form", "")), method))
            n_tag += 1
            n_pos += method == "same-position"
            n_split += method == "split-word"
    for key, rest in morph.items():
        for n, (lemma, gloss, parse) in enumerate(build_db.parse_morpheus(rest)):
            db.execute("INSERT OR IGNORE INTO morph VALUES (?,?,?,?,?,?,?)",
                       (key, n, lemma, greek.from_betacode(lemma), gloss, parse, "morpheus-analyses"))
    stats.update({"tokens": n_tok, "tagged": n_tag, "tagged_by_position": n_pos, "tagged_split_word": n_split, "with_morpheus": n_morph,
                  "notes": 0, "english_sections": 0, "english_sections_missing": []})
    # Pages, books and chapters.
    pages = defaultdict(list)
    for ref in order:
        pages[build_db.steph_key(ref)[0]].append(ref)
    for page, refs in pages.items():
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (wid, "page", f"Bekker page {page}", refs[0], refs[-1], F1K_SRC, basis))
    spans = {}
    for k, a, b, col in pieces:
        key = (paras[k]["book"], paras[k]["chapter"])
        spans.setdefault(key, [col, col])[1] = col
    books = {}
    for (bk, ch), (a, b) in spans.items():
        books.setdefault(bk, [a, b])[1] = b
    for bk, (a, b) in books.items():
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (wid, "book", f"Book {ROMAN[bk - 1]}" if bk else work["title"], a, b, F1K_SRC, "<div subtype=\"book\"> in the First1KGreek TEI"))
    for (bk, ch), (a, b) in spans.items():
        if ch is None:
            continue
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (wid, "ar-chapter", (f"Book {ROMAN[bk - 1]}, chapter {ch}" if bk else f"Chapter {ch}"), a, b, F1K_SRC,
                    "<div subtype=\"chapter\"> in the First1KGreek TEI"))
    stats["parts"] = len(spans)
    return stats


def lemmas():
    out = set()
    for w in WORKS:
        p = glaux_file(w)
        if p.exists():
            for m in re.finditer(r' lemma="([^"]*)"', p.read_text(encoding="utf-8")):
                out.add(greek.nfc(m.group(1)))
    return {l for l in out if greek.is_greek(l)}


def available():
    return all((RAW / F1K_SRC / "data" / "tlg0086" / w["tlg"]).exists() and glaux_file(w).exists()
               for w in WORKS)
