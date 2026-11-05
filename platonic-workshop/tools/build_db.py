#!/usr/bin/env python3
"""Build the Workshop's library database, data/workshop.sqlite, from the
fetched sources, and create data/user.sqlite for your own work if it does not
exist yet.

    python3 tools/fetch_sources.py
    python3 tools/build_db.py              # all 36 works, a few minutes
    python3 tools/build_db.py tlg031       # only the Timaeus, about 30 seconds

The library is rebuilt from scratch every time (into a temporary file that
replaces the old one only when the build succeeds). data/user.sqlite is
never opened for writing except to create its tables if they are missing.

Milestone 2 imports the Timaeus:
  text        Burnet's Greek and Bury's English (Perseus TEI), by Stephanus section
  tagging     GLAUx lemma and parse for each Greek word (machine-tagged, labelled so),
              and every Morpheus parse of each form beside it
  structure   Stephanus pages and the speeches (who is speaking, from the TEI)
  commentary  Bury's Loeb footnotes, anchored to the section they are printed in
  links       the Plato references in those footnotes, read by pattern

Milestone 3 adds the word lookup:
  dictionaries Middle Liddell and LSJ entries for every lemma in the imported texts,
              with LSJ's abbreviations marked with LSJ's own expansions (lexicon.py)
  grammar     Smyth's sections for each grammatical category, and the treebank
              guidelines' definitions of the sentence roles (grammar.py)
Milestone 5 imports every work of the Thrasyllan tetralogies (Perseus tlg001 to
tlg036) the same way, and adds the word search:
  structure   books (Republic, Laws) and letters (Letters) as divisions
  search      counts of every lemma and every form per work (lemma_count,
              form_count), so a search of all Plato answers at once
Milestone 8 adds the citation web (citations.py): every note, of every
commentator and translator, read for references to passages of Plato, and
every link checked against the library's own Stephanus sections.
Every rule used is in this file or those two; nothing is guessed or generated.
"""
import argparse
import difflib
import html
import json
import re
import sqlite3
import sys
import time
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import grammar  # noqa: E402
import greek  # noqa: E402
import lexicon  # noqa: E402
import translations  # noqa: E402
import commentary_db  # noqa: E402
import citations  # noqa: E402
import structure  # noqa: E402
import concepts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
DATA = ROOT / "data"
DB_PATH = DATA / "workshop.sqlite"
USER_DB_PATH = DATA / "user.sqlite"
SCHEMA = ROOT / "db" / "schema.sql"
USER_SCHEMA = ROOT / "db" / "user_schema.sql"
MANIFEST = ROOT / "sources" / "manifest.json"
TEI = "{http://www.tei-c.org/ns/1.0}"
STEPH = re.compile(r"^(\d+)([a-e])$")
PLATO_URN = "urn:cts:greekLit:tlg0059"
PERSEUS_DIR = RAW / "perseus-greek-plato" / "data" / "tlg0059"

# Every work of the tetralogies, in Perseus (= Thrasyllus') order.
ALL_WORKS = [f"tlg{n:03d}" for n in range(1, 37)]

# LSJ's abbreviation of each work (List I, under Pl.), used in the reader's
# jump box and in citations. tests/test_corpus.py checks every one against
# LSJ's own list in the abbreviation table.
WORK_ABBR = {
    "tlg001": "Euthphr.", "tlg002": "Ap.", "tlg003": "Cri.", "tlg004": "Phd.", "tlg005": "Cra.",
    "tlg006": "Tht.", "tlg007": "Sph.", "tlg008": "Plt.", "tlg009": "Prm.", "tlg010": "Phlb.",
    "tlg011": "Smp.", "tlg012": "Phdr.", "tlg013": "Alc. 1", "tlg014": "Alc.2", "tlg015": "Hipparch.",
    "tlg016": "Amat.", "tlg017": "Thg.", "tlg018": "Chrm.", "tlg019": "La.", "tlg020": "Ly.",
    "tlg021": "Euthd.", "tlg022": "Prt.", "tlg023": "Grg.", "tlg024": "Men.", "tlg025": "Hp.Ma.",
    "tlg026": "Hp.Mi.", "tlg027": "Ion", "tlg028": "Mx.", "tlg029": "Clit.", "tlg030": "R.",
    "tlg031": "Ti.", "tlg032": "Criti.", "tlg033": "Min.", "tlg034": "Lg.", "tlg035": "Epin.", "tlg036": "Ep.",
}

# Titles of Plato's works as abbreviated in Bury's notes -> Perseus work id.
# Only these are read as references to Plato; any other <title> is another author.
PLATO_TITLES = {
    "Rep": "tlg030", "Republic": "tlg030", "Laws": "tlg034", "Tim": "tlg031", "Timaeus": "tlg031",
    "Cratyl": "tlg005", "Phileb": "tlg010", "Phaedo": "tlg004", "Soph": "tlg007", "Sophist": "tlg007",
    "Theaet": "tlg006", "Sympos": "tlg011", "Symp": "tlg011", "Lysis": "tlg020", "Ion": "tlg027",
    "Protag": "tlg022", "Phaedr": "tlg012", "Phaedrus": "tlg012", "Gorg": "tlg023", "Gorgias": "tlg023",
    "Polit": "tlg008", "Parm": "tlg009", "Critias": "tlg032", "Meno": "tlg024", "Epin": "tlg035",
    "Theages": "tlg017", "Charm": "tlg018", "Laches": "tlg019", "Euthyd": "tlg021", "Menex": "tlg028",
    "Apol": "tlg002", "Crito": "tlg003", "Euthyph": "tlg001", "Alc": "tlg013",
    # Milestone 5: the titles the other Loeb translators use (Fowler, Lamb, Shorey).
    "Protagoras": "tlg022", "Prot": "tlg022", "Philebus": "tlg010", "Theaetetus": "tlg006",
    "Politicus": "tlg008", "Statesman": "tlg008", "Euthydem": "tlg021", "Euthydemus": "tlg021",
    "Charmides": "tlg018", "Parmen": "tlg009", "Parmenides": "tlg009", "Euthyphro": "tlg001",
    "Symposium": "tlg011", "Cratylus": "tlg005", "Crat": "tlg005", "Alc. I": "tlg013",
    "Apology": "tlg002", "Hipp. Maj": "tlg025", "Hippias Major": "tlg025", "Hippias Minor": "tlg026",
    "Menexenus": "tlg028", "Epinomis": "tlg035", "Hipparchus": "tlg015",
    "Epist": "tlg036", "Epistle": "tlg036", "Epistles": "tlg036", "Letters": "tlg036",
}
# An author's name just before a <title> means the work is not Plato's ("Eurip. Ion").
OTHER_AUTHOR = re.compile(r"(Eurip|Hom|Ovid|Emped|Aristot\w*|Aristoph|Hes|Hdt|Pind|Thuc|Xen|Isoc\w*|Cic|Plut|Lucian|Aeschin|Aesch|Dem|Lys|Diog\.? L|Soph)\.?\s*$")
REF_LIST = re.compile(r"^\s*\.?\s*((?:(?:\d{1,3}|[A-E]\b)(?:\s*[A-E]\b)?(?:\s*\.?\s*(?:B\.C\.|ff?\.?))?\s*(?:,|and|;)?\s*)+)")
BARE_REF = re.compile(r"\b(\d{2,3})\s?([A-E])\b(?:\s*(?:ff?\.)?\s*,\s*[A-E]\b)*")


def steph_key(ref):
    m = STEPH.match(ref)
    return (int(m.group(1)), m.group(2))


def load_sources():
    sources = json.loads(MANIFEST.read_text(encoding="utf-8"))["sources"]
    for s in sources:
        stamp = RAW / s["id"] / ".fetched.json"
        s["fetched_sha"] = json.loads(stamp.read_text())["commit"] if stamp.exists() else None
    return sources


def require(source_ids, sources):
    by_id = {s["id"]: s for s in sources}
    missing = [i for i in source_ids if not by_id.get(i, {}).get("fetched_sha")]
    if missing:
        sys.exit("not fetched yet: " + ", ".join(missing) + "\nrun: python3 tools/fetch_sources.py " + " ".join(missing))


# ---------------------------------------------------------------- TEI


def header_info(root):
    sd = root.find(f".//{TEI}sourceDesc")

    def first(path):
        e = sd.find(path) if sd is not None else None
        return " ".join("".join(e.itertext()).split()) if e is not None else ""

    editor = first(f".//{TEI}editor")
    if not editor:
        # Some Loeb files name the translator only in the title ('..., translated by Harold N. Fowler').
        m = re.search(r"translated by (.+)$", first(f".//{TEI}monogr/{TEI}title"))
        editor = m.group(1).strip() if m else ""
    return {
        "editor": editor,
        "title": first(f".//{TEI}monogr/{TEI}title"),
        "place": first(f".//{TEI}pubPlace"),
        "date": first(f".//{TEI}date"),
        "volume": first(f".//{TEI}biblScope"),
    }


class Walker:
    """Reads a Perseus TEI body in reading order into chunks (one paragraph's
    text inside one Stephanus section) and notes (with the chunk and character
    offset where their marker stands)."""

    def __init__(self, root):
        self.chunks = []      # dicts: section, para, speaker, label, parts
        self.notes = []       # dicts: el, section, chunk index, offset
        self.order = []       # Stephanus sections in order
        self.section = None
        self.para = 0
        self.speaker = None
        self.label = None
        self.open = None      # current chunk
        self.parts = []       # [subtype, n, first section, last section]: books, letters
        self.walk(root.find(f".//{TEI}body"))
        for c in self.chunks:
            c["text"] = re.sub(r"\s+", " ", "".join(c.pop("parts"))).strip()

    def _chunk(self):
        if self.open is None and self.section:
            self.open = {"section": self.section, "para": self.para, "speaker": self.speaker,
                         "label": self.label, "parts": []}
            self.label = None
            self.chunks.append(self.open)
        return self.open

    def text(self, s):
        if not s:
            return
        if self.open is None and not s.strip():
            return
        if s.strip() and self.parts and self.parts[-1][2] is None and self.section:
            # Text before the part's first milestone: it begins inside the section the last part ended in.
            self.parts[-1][2] = self.parts[-1][3] = self.section
        c = self._chunk()
        if c is not None:
            c["parts"].append(s)

    def walk(self, el):
        tag = el.tag.replace(TEI, "")
        if tag == "milestone":
            n = (el.get("n") or "").strip()
            if el.get("unit") == "section" and STEPH.match(n):
                if self.parts and self.parts[-1][2] is None:
                    self.parts[-1][2] = n
                if self.parts:
                    self.parts[-1][3] = n
                if n != self.section:
                    self.section = n
                    self.order.append(n)
                    self.open = None  # a new section starts a new chunk of the same paragraph
            return
        if tag == "label":
            self.label = " ".join("".join(el.itertext()).split())
            return
        if tag == "note":
            c = self._chunk()
            if c is not None:
                self.notes.append({"el": el, "section": self.section, "chunk": len(self.chunks) - 1,
                                   "offset": len(re.sub(r"\s+", " ", "".join(c["parts"])).lstrip())})
            return
        if tag in ("head", "bibl"):
            return
        if tag == "div" and el.get("type") == "textpart" and el.get("subtype") in ("book", "letter"):
            self.parts.append([el.get("subtype"), el.get("n"), None, None])
        prev_speaker = self.speaker
        if tag == "p":
            self.para += 1
            self.open = None
        if tag == "said":
            self.speaker = (el.get("who") or "").lstrip("#") or None
            self.open = None
        if tag == "del":
            self.text("[")  # Burnet's square brackets: words the editor deletes
        self.text(el.text)
        for child in el:
            self.walk(child)
            self.text(child.tail)
        if tag == "del":
            self.text("]")
        if tag in ("p", "said"):
            self.open = None
            self.speaker = prev_speaker if tag == "said" else self.speaker


def note_html(el):
    """A Loeb note as small, safe HTML: Greek, titles, glosses and quotations kept."""
    def conv(e, top=False):
        tag = e.tag.replace(TEI, "")
        inner = html.escape(e.text or "")
        for c in e:
            inner += conv(c) + html.escape(c.tail or "")
        if top:
            return inner
        if tag == "foreign" and e.get("{http://www.w3.org/XML/1998/namespace}lang") == "grc":
            return f'<span lang="grc">{inner}</span>'
        if tag == "title":
            return f"<cite>{inner}</cite>"
        if tag in ("gloss", "emph"):
            return f"<i>{inner}</i>"
        if tag in ("q", "quote"):
            return f"“{inner}”"
        return inner
    return re.sub(r"\s+", " ", conv(el, top=True)).strip()


def note_plain(el):
    return " ".join("".join(el.itertext()).split())


def note_links(el, from_ref, work_id="tlg031", pages=(17, 92)):
    """Plato references in a note, read by pattern. Returns (to_work, to_ref, raw).

    A <title> naming a work of Plato is followed by Stephanus references
    ('Rep. 369 E ff., 374 E'); a bare 'page letter' with no title before it
    ('cf. 31 B') is a reference within the note's own work, when the page is
    one of that work's pages (`pages`, first and last). Pages without a letter
    are kept as the page ('Laws 676 ff.' -> 676)."""
    segs = _segments(el)
    out = []
    pending = None  # Plato work id waiting for its references
    for idx, (kind, s) in enumerate(segs):
        if kind == "title":
            prev_text = "".join(t for k, t in segs[:idx] if k == "text")[-20:]
            name = s.rstrip(".,; ")
            pending = PLATO_TITLES.get(name) if not OTHER_AUTHOR.search(prev_text) else None
            if pending is None:
                pending = "OTHER"
            continue
        if kind != "text":
            continue
        rest = s
        if pending and pending != "OTHER":
            m = REF_LIST.match(rest)
            if m:
                out.extend((pending, ref, f"{_title_for(pending)} {raw}") for ref, raw in _refs(m.group(1)))
                rest = rest[m.end():]
        elif pending == "OTHER":
            # Skip the other author's own reference numbers.
            m = REF_LIST.match(rest)
            if m:
                rest = rest[m.end():]
        pending = None
        for m in BARE_REF.finditer(rest):
            if pages[0] <= int(m.group(1)) <= pages[1]:
                out.extend((work_id, ref, raw) for ref, raw in _refs(m.group(0)))
    return out


def _refs(text):
    """'369 E ff., 374 E' -> [('369e', '369 E'), ('374e', '374 E')]. A letter on
    its own continues the page before it ('892 A, B' -> 892a, 892b); a page with
    no letter is kept as the page ('676 ff.' -> 676)."""
    out = []
    page = None
    for m in re.finditer(r"(\d{1,3})(?:\s*([A-E])\b)?|\b([A-E])\b", text):
        if m.group(1):
            page = int(m.group(1))
            letter = m.group(2)
            out.append((f"{page}{letter.lower()}" if letter else str(page), m.group(0)))
        elif page is not None:
            out.append((f"{page}{m.group(3).lower()}", f"{page} {m.group(3)}"))
    return out


def _segments(el):
    segs = [("text", el.text or "")]
    for c in el:
        tag = c.tag.replace(TEI, "")
        if tag == "title":
            segs.append(("title", " ".join("".join(c.itertext()).split())))
        elif tag == "foreign":
            segs.append(("skip", "".join(c.itertext())))
        else:
            inner = _segments(c)
            segs.extend(inner)
        segs.append(("text", c.tail or ""))
    return segs


def _title_for(work_id):
    return {v: k for k, v in reversed(list(PLATO_TITLES.items()))}.get(work_id, work_id)


# ---------------------------------------------------------------- GLAUx and Morpheus


def glaux_words_by_section(work_num):
    """GLAUx words of one work, real words only, grouped by Stephanus section."""
    path = RAW / "glaux-plato" / "xml" / f"0059-{work_num}.xml"
    by_sec = defaultdict(list)
    analysis = None
    for event, el in ET.iterparse(path, events=("start", "end")):
        if event == "start" and el.tag == "sentence":
            analysis = el.get("analysis")
        elif event == "end" and el.tag == "word":
            a = el.attrib
            if not a.get("artificial") and greek.is_greek(a.get("form", "")):
                by_sec[a.get("div_stephanus_section")].append({**a, "analysis": analysis})
            el.clear()
    return by_sec


def align(ours, theirs):
    """Pair our tokens with GLAUx words in one section. Returns {our_index:
    (their_index, method)}. 'same-form': the accentless forms are identical.
    'same-position': inside a stretch where both sides have the same number of
    words but the forms differ (usually crasis or elision written differently);
    paired in order. 'split-word': GLAUx has the word as two or three words
    that spell it exactly. Anything else is left untagged rather than guessed.
    Values are (list of their indexes, method)."""
    def key(t):
        # GLAUx marks the second half of a split word with a hyphen: οὐ, -δὲ.
        return greek.strip_accents(t).rstrip(greek.APOSTROPHES).lstrip("-")
    a = [key(t) for t in ours]
    b = [key(t) for t in theirs]
    pairs = {}
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                pairs[i1 + k] = (j1 + k, "same-form")
        elif op == "replace" and i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                pairs[i1 + k] = ([j1 + k], "same-position")
        elif op == "replace":
            # GLAUx writes some words as two (οὐδέ as οὐ + δέ, εἴτε as εἰ + τε).
            # Pair one of ours with the run of theirs that spells it exactly.
            j = j1
            for i in range(i1, i2):
                for n in (1, 2, 3):
                    if "".join(b[j:j + n]) == a[i] and j + n <= j2:
                        pairs[i] = (list(range(j, j + n)), "same-form" if n == 1 else "split-word")
                        j += n
                        break
    return {i: v if isinstance(v[0], list) else ([v[0]], v[1]) for i, v in pairs.items()}


_MORPHEUS = {}


def morpheus_lines(keys):
    """{beta_key: raw analyses} for the keys asked for. The table (about 100 MB)
    is read once per build and kept for the next work."""
    if not _MORPHEUS:
        _MORPHEUS.update(_morpheus_table())
    return {k: _MORPHEUS[k] for k in keys if k in _MORPHEUS}


def _morpheus_table():
    d = RAW / "morpheus-analyses"
    found = {}
    # The CLTK repository splits one file at an arbitrary byte; reading both
    # parts as one stream joins the line that was cut in two.
    data = (d / "greek-analyses_1.txt").read_text(encoding="utf-8") + (d / "greek-analyses_2.txt").read_text(encoding="utf-8")
    for line in data.splitlines():
        form, _, rest = line.partition("\t")
        if rest:
            found[form] = rest
    return found


def parse_morpheus(rest):
    """'{id 9 yu_xh=|,yuxh/\\tlife\\tfem dat sg (attic)}{...}' -> [(lemma_beta, gloss, parse)]."""
    out = []
    for entry in re.findall(r"\{([^}]*)\}", rest):
        cols = entry.split("\t")
        head = cols[0].split(" ", 2)
        lemma_field = head[2] if len(head) > 2 else head[-1]
        lemma = lemma_field.split(",")[-1]
        gloss = cols[1] if len(cols) > 1 else ""
        parse = cols[2] if len(cols) > 2 else ""
        out.append((lemma, gloss, parse))
    return out


# ---------------------------------------------------------------- build


def speaker_names(g, e):
    """The English name of each Greek speaker, read from the two Perseus files.
    In every section where the Greek and the English have the same number of
    changes of speaker, the speakers are paired in order and the pair counted;
    each Greek name takes the English name it is paired with most often. A name
    never paired keeps its Greek form."""
    def by_section(w):
        out = defaultdict(list)
        for c in w.chunks:
            seq = out[c["section"]]
            if c["speaker"] and (not seq or seq[-1] != c["speaker"]):
                seq.append(c["speaker"])
        return out
    gs, es = by_section(g), by_section(e)
    pairs = defaultdict(Counter)
    for ref, names in gs.items():
        if len(names) == len(es.get(ref, ())):
            for a, b in zip(names, es[ref]):
                pairs[a][b] += 1
    return {gname: c.most_common(1)[0][0] for gname, c in pairs.items()}


def build_work(db, work_id, sources):
    num = work_id.replace("tlg", "")
    wdir = PERSEUS_DIR / work_id
    cts = (wdir / "__cts__.xml").read_text(encoding="utf-8")
    title = re.search(r"<ti:title[^>]*>([^<]+)", cts).group(1).strip()
    work_urn = f"{PLATO_URN}.{work_id}"
    db.execute("UPDATE work SET imported = 1 WHERE id = ?", (work_id,))
    stats = {"work": work_id, "title": title}

    grc_file = sorted(wdir.glob("*-grc*.xml"))[0]
    eng_file = sorted(wdir.glob("*-eng*.xml"))[0]
    g_root = ET.parse(grc_file).getroot()
    e_root = ET.parse(eng_file).getroot()
    g = Walker(g_root)
    e = Walker(e_root)
    speakers = speaker_names(g, e)
    stats["speaker_names"] = speakers

    # Sections: the Greek order is the reference order.
    for i, ref in enumerate(g.order):
        page, letter = steph_key(ref)
        db.execute("INSERT INTO section VALUES (?,?,?,?,?,?)", (work_id, ref, page, letter, i, f"{work_urn}:{ref}"))
    known = set(g.order)
    stats["sections"] = len(g.order)

    gh, eh = header_info(g_root), header_info(e_root)
    g_ed, e_ed = f"{work_id}.{grc_file.stem.split('.')[-1]}", f"{work_id}.{eng_file.stem.split('.')[-1]}"
    db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status) VALUES (?,?,?,?,?,?,?,?,?,?)", (
        g_ed, work_id, "perseus-greek-plato", "grc", "text",
        f"{gh['editor'].split()[-1]} ({gh['place']}, {gh['date']})", gh["editor"],
        f"{gh['editor']}, {gh['title']}, vol. {gh['volume']} ({gh['place']}, {gh['date']})",
        f"data/tlg0059/{work_id}/{grc_file.name}", "clean source text"))
    db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status) VALUES (?,?,?,?,?,?,?,?,?,?)", (
        e_ed, work_id, "perseus-english-plato", "eng", "translation",
        f"{eh['editor'].split()[-1]} (Loeb, {eh['date']})", eh["editor"],
        f"{eh['editor']}, {eh['title']}, vol. {eh['volume']} ({eh['place']}, {eh['date']})",
        f"data/tlg0059/{work_id}/{eng_file.name}", "clean source text"))

    # Text layer: chunks.
    def insert_chunks(walker, edition_id):
        ids = []
        for seq, c in enumerate(walker.chunks):
            if c["section"] not in known:
                raise SystemExit(f"{edition_id}: section {c['section']} is not in the Greek text")
            cur = db.execute(
                "INSERT INTO chunk (edition_id, work_id, section_ref, seq, para, speaker, label, text) VALUES (?,?,?,?,?,?,?,?)",
                (edition_id, work_id, c["section"], seq, c["para"], speakers.get(c["speaker"], c["speaker"]), c["label"], c["text"]))
            ids.append(cur.lastrowid)
        return ids

    g_chunk_ids = insert_chunks(g, g_ed)
    e_chunk_ids = insert_chunks(e, e_ed)
    stats["english_sections"] = len(set(e.order))
    stats["english_sections_missing"] = sorted(known - set(e.order), key=steph_key)

    # Tokens, section by section, with GLAUx tags and Morpheus keys.
    glaux = glaux_words_by_section(num)
    tokens_by_sec = defaultdict(list)  # ref -> [(chunk_id, start, end, form)]
    for cid, c in zip(g_chunk_ids, g.chunks):
        for m in greek.WORD.finditer(c["text"]):
            tokens_by_sec[c["section"]].append((cid, m.start(), m.end(), greek.nfc(m.group(0))))

    all_keys = set()
    tok_keys = {}
    for toks in tokens_by_sec.values():
        for _, _, _, form in toks:
            if form not in tok_keys:
                tok_keys[form] = greek.lookup_keys(form)
                all_keys.update(tok_keys[form])
    morph = morpheus_lines(all_keys)

    n_tok = n_tag = n_pos = n_split = n_morph = 0
    for ref in g.order:
        toks = tokens_by_sec.get(ref, [])
        theirs = glaux.get(ref, [])
        pairs = align([t[3] for t in toks], [w["form"] for w in theirs])
        for i, (cid, s, e_, form) in enumerate(toks, start=1):
            mkey = next((k for k in tok_keys[form] if k in morph), None)
            cur = db.execute(
                "INSERT INTO token (chunk_id, edition_id, section_ref, seq, start, end, form, plain, morph_key) VALUES (?,?,?,?,?,?,?,?,?)",
                (cid, g_ed, ref, i, s, e_, form, greek.strip_accents(form).rstrip(greek.APOSTROPHES), mkey))
            n_tok += 1
            n_morph += mkey is not None
            if i - 1 in pairs:
                js, method = pairs[i - 1]
                for part, j in enumerate(js):
                    w = theirs[j]
                    db.execute("INSERT INTO tag VALUES (?,?,?,?,?,?,?,?,?,?)", (
                        cur.lastrowid, "glaux-plato", part, greek.nfc(w.get("lemma", "")), w.get("postag"),
                        w.get("relation"), w.get("analysis"), w.get("id"), greek.nfc(w.get("form", "")), method))
                n_tag += 1
                n_pos += method == "same-position"
                n_split += method == "split-word"
    for key, rest in morph.items():
        for n, (lemma, gloss, parse) in enumerate(parse_morpheus(rest)):
            db.execute("INSERT OR IGNORE INTO morph VALUES (?,?,?,?,?,?,?)",
                       (key, n, lemma, greek.from_betacode(lemma), gloss, parse, "morpheus-analyses"))
    stats.update({"tokens": n_tok, "tagged": n_tag, "tagged_by_position": n_pos, "tagged_split_word": n_split, "with_morpheus": n_morph})

    # Structure layer: pages and speeches.
    pages = defaultdict(list)
    for ref in g.order:
        pages[steph_key(ref)[0]].append(ref)
    for page, refs in pages.items():
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (work_id, "page", f"Stephanus page {page}", refs[0], refs[-1], "perseus-greek-plato",
                    "Stephanus milestones in the Perseus TEI"))
    speeches = []
    for c in g.chunks:
        sp = speakers.get(c["speaker"], c["speaker"])
        if speeches and speeches[-1][0] == sp:
            speeches[-1][2] = c["section"]
        else:
            speeches.append([sp, c["section"], c["section"]])
    for sp, a, b in speeches:
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (work_id, "speech", sp or "(no speaker)", a, b, "perseus-greek-plato",
                    "consecutive <said who> in the Perseus TEI with the same speaker"))
    stats["speeches"] = len(speeches)
    for subtype, n, a, b in g.parts:
        if a and b:
            db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                       (work_id, subtype, f"{'Book' if subtype == 'book' else 'Letter'} {n}", a, b, "perseus-greek-plato",
                        f"<div subtype=\"{subtype}\"> in the Perseus TEI"))
    stats["parts"] = len(g.parts)

    # Commentary layer: the Loeb footnotes in the English, and links read from them.
    n_notes = n_links = 0
    commentator = f"{eh['editor'].split()[-1]} (Loeb, {eh['date']})"
    for nt in e.notes:
        el = nt["el"]
        if el.get("resp") != "Loeb":
            continue
        cur = db.execute(
            "INSERT INTO note (source_id, commentator, work_id, start_ref, end_ref, edition_id, chunk_id, offset, body, body_html, printed_at, anchor_method, proof_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            ("perseus-english-plato", commentator, work_id, nt["section"], nt["section"], e_ed, e_chunk_ids[nt["chunk"]],
             nt["offset"], note_plain(el), note_html(el), f"Loeb vol. {eh['volume']}, {eh['date']}",
             "containing section", "clean source text"))
        n_notes += 1
        for to_work, to_ref, raw in note_links(el, nt["section"], work_id, (steph_key(g.order[0])[0], steph_key(g.order[-1])[0])):
            db.execute("INSERT INTO link (from_work, from_ref, to_work, to_ref, kind, note_id, source_id, raw, method) VALUES (?,?,?,?,?,?,?,?,?)",
                       (work_id, nt["section"], to_work, to_ref, "cf", cur.lastrowid, "perseus-english-plato", raw, "pattern"))
            n_links += 1
    stats.update({"notes": n_notes, "links": n_links})
    return stats


# ---------------------------------------------------------------- dictionaries and grammar

LSJ_DIR = RAW / "lsj" / "CTS_XML_TEI" / "perseus" / "pdllex" / "grc" / "lsj"
LEXICA = [
    # id, source, entry tag, files, label, printed, how abbreviations are expanded
    ("middle-liddell", "middle-liddell", "entry", lambda: [RAW / "middle-liddell" / "Perseus_text_1999.04.0058.xml"],
     "Middle Liddell (1889)", "H. G. Liddell and R. Scott, An Intermediate Greek-English Lexicon (Oxford, 1889)",
     "Middle Liddell's own list of abbreviations is not digitised. Grammatical abbreviations (metaph., c. gen.) and "
     "authors that LSJ abbreviates the same way (Hdt., Ar.) are expanded from LSJ's lists; the rest (Plat., Xen.) are left as printed."),
    ("lsj", "lsj", "entryFree", lambda: sorted(LSJ_DIR.glob("grc.lsj.perseus-eng*.xml"), key=lambda p: int(re.search(r"eng(\d+)", p.name).group(1))),
     "LSJ (1940)", "H. G. Liddell, R. Scott and H. S. Jones, A Greek-English Lexicon, 9th edition (Oxford, 1940)",
     "Authors and works from LSJ's List I, everything else from its List V (General List of Abbreviations), as printed."),
]


def build_dictionaries(db):
    """Entries for every lemma in the database (tagged and Morpheus), then for
    the words those entries cross-refer to. Returns statistics."""
    front_xml = (RAW / "lsj-abbreviations" / "lsj-frontmatter.xml").read_text(encoding="utf-8")
    front = ET.fromstring(front_xml[front_xml.index("<front>"):])
    abbr = lexicon.abbreviations(front)
    for a, info in abbr["authors"].items():
        detail = ", ".join(x for x in (info["epithet"], info["date"]) if x)
        db.execute("INSERT INTO abbreviation (source_id, list, abbr, expansion, detail, basis) VALUES (?,?,?,?,?,?)",
                   ("lsj-abbreviations", "I author", a, info["name"], detail, "as printed"))
        for w, title in info["works"].items():
            db.execute("INSERT INTO abbreviation (source_id, list, abbr, author_abbr, expansion, basis) VALUES (?,?,?,?,?,?)",
                       ("lsj-abbreviations", "I work", w, a, title, "as printed"))
    for p, (lst, full) in abbr["publications"].items():
        db.execute("INSERT INTO abbreviation (source_id, list, abbr, expansion, basis) VALUES (?,?,?,?,?)",
                   ("lsj-abbreviations", f"{lst} publication", p, full, "as printed"))
    for g, exp in abbr["general"].items():
        basis = abbr["derived"][g] if g in abbr["derived"] else "as printed"
        db.execute("INSERT INTO abbreviation (source_id, list, abbr, expansion, basis) VALUES (?,?,?,?,?)",
                   ("lsj-abbreviations", "V general", g, exp, "one word of a printed phrase: " + basis.split(" (from ")[1].rstrip(")") if basis != "as printed" else basis))

    lemmas = {r[0] for r in db.execute("SELECT DISTINCT lemma FROM tag WHERE lemma != ''")}
    lemmas |= {r[0] for r in db.execute("SELECT DISTINCT lemma FROM morph")}
    # Morpheus lists word-endings (-τε, -ως) as lemmas of compounds; they have no entries.
    lemmas = {greek.nfc(re.sub(r"\d", "", l)) for l in lemmas if l and greek.is_greek(l) and not l.startswith("-")}
    stats = {"lemmas": len(lemmas), "abbreviations": {"authors": len(abbr["authors"]),
             "works": sum(len(a["works"]) for a in abbr["authors"].values()), "general": len(abbr["general"]),
             "general_derived": len(abbr["derived"]), "general_unparsed": len(abbr["unparsed"]),
             "publications": len(abbr["publications"])}}
    for lex_id, src, tag, files, label, printed, note in LEXICA:
        db.execute("INSERT INTO lexicon VALUES (?,?,?,?,?)", (lex_id, src, label, printed, note))
        renderer = lexicon.Renderer(lex_id, abbr)
        stored = {}  # match_key -> [entry ids]
        unaccented = defaultdict(list)
        plain = defaultdict(list)

        def load(wanted):
            xrefs = set()
            for key, el in lexicon.entries(files(), tag, wanted):
                mk = lexicon.entry_key(key)
                body = renderer.render(el)
                n_ab = body.count('<abbr class="ab')
                cur = db.execute("INSERT INTO lex_entry (lexicon_id, src_id, key, headword, match_key, unaccented_key, plain_key, html, n_abbr) VALUES (?,?,?,?,?,?,?,?,?)",
                                 (lex_id, el.get("id"), key, lexicon.headword(mk), mk, lexicon.unaccented_key(key), lexicon.accentless_key(key), body, n_ab))
                stored.setdefault(mk, []).append(cur.lastrowid)
                unaccented[lexicon.unaccented_key(key)].append(cur.lastrowid)
                plain[lexicon.accentless_key(key)].append(cur.lastrowid)
                xrefs.update(re.findall(r'data-lemma="([^"]+)"', body))
                el.clear()
            return xrefs

        wanted = set()
        for l in lemmas:
            for k in lexicon.lemma_keys(l):
                wanted.add(k)
                wanted.add(lexicon.accentless_key(k))
        xrefs = load(wanted)
        # Cross-references ('v. ἔργω'), one level: entries they point to that are not in yet.
        extra = set()
        for x in xrefs:
            for k in lexicon.lemma_keys(x):
                if k not in stored:
                    extra.add(k)
        if extra:
            load(extra)
        counts = Counter()
        for l in sorted(lemmas | {greek.nfc(x) for x in xrefs if not x.startswith("-")}):
            keys = lexicon.lemma_keys(l)
            hit, method = [], None
            for k, m in zip(keys, ("same-spelling", "capital-lowered")):
                if k in stored:
                    hit, method = stored[k], m
                    break
            if not hit and keys:
                # Same letters and breathing, different accent (a misprint or variant accentuation);
                # failing that, the same bare letters. Both are shown with a warning.
                uk, pk = lexicon.unaccented_key(keys[0]), lexicon.accentless_key(keys[0])
                if uk in unaccented:
                    hit, method = unaccented[uk], "accent-differs"
                elif pk in plain:
                    hit, method = plain[pk], "letters-only"
            for eid in hit:
                db.execute("INSERT OR IGNORE INTO lemma_entry VALUES (?,?,?,?)", (l, lex_id, eid, method))
            if l in lemmas:
                counts[method or "none"] += 1
        stats[lex_id] = {"entries": len({e for v in stored.values() for e in v}), "lemmas": dict(counts),
                         "abbreviations_marked": renderer.stats["abbr_expanded"],
                         "abbreviations_not_in_lists": renderer.stats["abbr_unknown"]}
    return stats


def build_grammar(db):
    sections = grammar.section_map()["sections"]
    wanted = {n for cat in sections.values() for vals in cat.values() for n, _ in vals}
    smyth = grammar.smyth_sections(RAW / "smyth-grammar" / "smyth.xml", wanted)
    missing = wanted - set(smyth)
    if missing:
        raise SystemExit(f"Smyth sections not found: {sorted(missing)}")
    n_notes = 0
    for cat, vals in sections.items():
        for val, secs in vals.items():
            for i, (n, reason) in enumerate(secs):
                s = smyth[n]
                db.execute("INSERT INTO grammar_note VALUES (?,?,?,?,?,?,?,?,?,?)",
                           (cat, val, i, n, s["heading"], s["rule_html"], s["full_html"], s["url"], reason, "smyth-grammar"))
                n_notes += 1
    labels = grammar.agdt_labels(RAW / "agdt-guidelines" / "AGDT2" / "guidelines" / "Greek_guidelines.md")
    for code, lab in labels.items():
        definition = html.escape(lab["definition"])
        definition = re.sub(r"\bSG (\d+)", lambda m: f'SG <a class="smyth" href="{grammar.SMYTH_URL.format(n=m.group(1))}" target="_blank" rel="noopener">{m.group(1)}</a>', definition)
        db.execute("INSERT INTO relation_label VALUES (?,?,?,?)", (code, lab["name"], definition, "agdt-guidelines"))
    return {"grammar_notes": n_notes, "smyth_sections": len(smyth), "relation_labels": len(labels)}


def slug(title):
    """'Alcibiades 1' -> 'alcibiades-1': the work's name in the reader's address bar."""
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def build_search(db):
    """Token ranges per work, and the counts the word search reads (lemma_count, form_count)."""
    db.create_function("plain", 1, lambda s: greek.strip_accents(re.sub(r"\d", "", s or "")).rstrip(greek.APOSTROPHES), deterministic=True)
    db.execute("""UPDATE work SET first_token = r.lo, last_token = r.hi, n_tokens = r.n FROM
                  (SELECT e.work_id, min(t.id) lo, max(t.id) hi, count(*) n FROM token t JOIN edition e ON e.id = t.edition_id
                   WHERE e.lang = 'grc' GROUP BY e.work_id) r WHERE r.work_id = work.id""")
    db.execute("""INSERT INTO lemma_count SELECT g.lemma, plain(g.lemma), e.work_id, count(DISTINCT g.token_id)
                  FROM tag g JOIN token t ON t.id = g.token_id JOIN edition e ON e.id = t.edition_id
                  WHERE g.lemma != '' GROUP BY g.lemma, e.work_id""")
    db.execute("""INSERT INTO form_count SELECT t.form, t.plain, e.work_id, count(*)
                  FROM token t JOIN edition e ON e.id = t.edition_id GROUP BY t.form, e.work_id""")


def build(works, db_path=None, progress=False):
    db_path = Path(db_path or DB_PATH)
    sources = load_sources()
    require(["perseus-greek-plato", "glaux-plato", "morpheus-analyses", "lsj", "middle-liddell",
             "lsj-abbreviations", "smyth-grammar", "agdt-guidelines"], sources)
    DATA.mkdir(exist_ok=True)
    tmp = db_path.with_suffix(".building")
    if tmp.exists():
        tmp.unlink()
    db = sqlite3.connect(tmp)
    db.executescript(SCHEMA.read_text(encoding="utf-8"))
    for s in sources:
        db.execute("INSERT INTO source VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (
            s["id"], s["title"], s["kind"], s.get("repo") or s.get("url"), s.get("commit") or s.get("sha256"), s.get("fetched_sha"), s.get("path"),
            s.get("layer"), s.get("language"), s.get("licence"), s["provenance"], s.get("status")))
    for d in sorted(PERSEUS_DIR.glob("tlg0*")):
        cts = (d / "__cts__.xml").read_text(encoding="utf-8")
        title = re.search(r"<ti:title[^>]*>([^<]+)", cts).group(1).strip()
        n = int(d.name[3:])
        db.execute("INSERT INTO work (id, urn, title, abbr, slug, tetralogy) VALUES (?,?,?,?,?,?)",
                   (d.name, f"{PLATO_URN}.{d.name}", title, WORK_ABBR.get(d.name), slug(title),
                    (n - 1) // 4 + 1 if n <= 36 else None))
    all_stats = []
    for w in works:
        t0 = time.time()
        all_stats.append(build_work(db, w, sources))
        all_stats[-1]["translations"] = translations.build_work_translations(db, w)
        if progress:
            s = all_stats[-1]
            tr = ", ".join(f"{t['edition'].split('.')[1]} {t['method']}" for t in s["translations"]) or "no other translation"
            print(f"  {s['title']}: {s['sections']} sections, {s['tokens']} words, {s['tagged']} tagged, "
                  f"{s['notes']} notes; {tr} ({time.time() - t0:.0f}s)", flush=True)
    # Milestones 7 and 11: the commentaries, for the works that have them.
    comm_stats = {w: commentary_db.build_commentaries(db, w) for w in works}
    comm_stats = {w: s for w, s in comm_stats.items() if s}
    db.execute("INSERT INTO build VALUES ('commentary_stats', ?)", (json.dumps(comm_stats, ensure_ascii=False),))
    if "tlg031" in comm_stats:
        commentary_db.write_report(db, "tlg031", comm_stats["tlg031"], REPORTS / "commentary_timaeus.md")
    if set(works) == set(ALL_WORKS):
        # Milestone 11: the commentaries on the rest of Plato.
        commentary_db.write_corpus_report(db, comm_stats, REPORTS / "commentaries.md")
    if progress and comm_stats:
        for w, s in comm_stats.items():
            for cid, c in s.items():
                print(f"  commentary {cid}: " + ", ".join(f"{k} {v}" for k, v in c.items() if v and k != "label"), flush=True)
    # Milestone 8: the citation web. Every note read for references to Plato, every link checked.
    cite_stats = citations.harvest(db)
    if set(works) == set(ALL_WORKS):
        cite_stats.update(citations.write_report(db))
    db.execute("INSERT INTO build VALUES ('citation_stats', ?)", (json.dumps(cite_stats),))
    if progress:
        print(f"  citation web: {cite_stats}", flush=True)
    # Milestone 9: each dialogue as a whole, and the corpus as a whole.
    struct_stats = structure.build(db)
    if set(works) == set(ALL_WORKS):
        structure.write_report(db, struct_stats)
    db.execute("INSERT INTO build VALUES ('structure_stats', ?)", (json.dumps(struct_stats, ensure_ascii=False),))
    if progress:
        print("  structure: " + ", ".join(f"{k} {v}" for k, v in struct_stats.items() if k != "not found")
              + f"; not found: {len(struct_stats['not found'])}", flush=True)
    build_search(db)
    lookup_stats = build_dictionaries(db)  # before the concept index, which reads LSJ's entries
    lookup_stats.update(build_grammar(db))
    # Milestone 10: the concept index across the dialogues (after build_search and the dictionaries: it reads lemma_count and LSJ).
    concept_stats = concepts.build(db)
    if set(works) == set(ALL_WORKS):
        concepts.write_report(db, concept_stats)
    db.execute("INSERT INTO build VALUES ('concept_stats', ?)", (json.dumps(concept_stats, ensure_ascii=False),))
    if progress:
        print("  concepts: " + ", ".join(f"{k} {v}" for k, v in concept_stats.items() if k not in ("not found", "terms not tagged"))
              + f"; not found: {len(concept_stats['not found'])}", flush=True)
    db.execute("INSERT INTO build VALUES ('lookup_stats', ?)", (json.dumps(lookup_stats, ensure_ascii=False),))
    db.execute("INSERT INTO build VALUES ('built_at', ?)", (time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),))
    db.execute("INSERT INTO build VALUES ('stats', ?)", (json.dumps(all_stats),))
    # Milestone 6: how often the computed placement of translations is right,
    # checked on the translations whose Stephanus numbers are printed.
    rows = translations.alignment_check(db)
    summary = translations.write_alignment_report(rows, REPORTS / "alignment.md") if set(works) == set(ALL_WORKS) else None
    db.execute("INSERT INTO build VALUES ('alignment_check', ?)", (json.dumps({"rows": rows, "summary": summary}),))
    db.commit()
    problems = db.execute("PRAGMA foreign_key_check").fetchall()
    db.close()
    if problems:
        raise SystemExit(f"foreign key problems: {problems[:5]}")
    tmp.replace(db_path)
    return all_stats + [lookup_stats]


def ensure_user_db(path=USER_DB_PATH):
    """Create your own database's tables if they are missing, or upgrade an
    older one in place after backing it up. Never alters or removes a row."""
    import mywork
    mywork.ensure(path)


REPORTS = ROOT / "reports"


def write_corpus_report(stats):
    """reports/corpus.json and corpus.md: what the import of all 36 works found,
    every figure counted from the build. Committed so the import is reviewable."""
    srcs = {s["id"]: s for s in load_sources()}
    keep = ("work", "title", "sections", "english_sections", "english_sections_missing", "tokens", "tagged",
            "tagged_by_position", "tagged_split_word", "with_morpheus", "speeches", "parts", "notes", "links", "speaker_names")
    rows = [{k: s.get(k) for k in keep} for s in stats]
    total = {k: sum(r[k] for r in rows) for k in ("sections", "tokens", "tagged", "with_morpheus", "notes", "links")}
    prov = {i: {"commit": srcs[i].get("fetched_sha") or srcs[i].get("commit"), "repo": srcs[i].get("repo")}
            for i in ("perseus-greek-plato", "perseus-english-plato", "glaux-plato", "morpheus-analyses")}
    (REPORTS / "corpus.json").write_text(json.dumps({"total": total, "sources": prov, "works": rows}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    pct = lambda a, b: f"{100 * a / b:.2f}%" if b else "-"
    lines = ["# All of Plato: what the import found", "",
             "Written by `tools/build_db.py` when it builds all 36 works; every figure is counted from the build.", "",
             f"**{len(rows)} works, {total['sections']:,} Stephanus sections, {total['tokens']:,} Greek words.** "
             f"GLAUx tags {total['tagged']:,} of them ({pct(total['tagged'], total['tokens'])}); Morpheus has every possible parse for "
             f"{total['with_morpheus']:,} ({pct(total['with_morpheus'], total['tokens'])}). The Loeb translators' notes give "
             f"{total['notes']:,} notes and {total['links']:,} references read from them.", "",
             "Sources, as built:", ""]
    lines += [f"- `{i}`: {p['repo']} @ `{(p['commit'] or '')[:10]}`" for i, p in prov.items()]
    lines += ["", "| Work | Sections | English sections | Greek words | Tagged | Morpheus | Notes | Links | Speakers named |",
              "|---|---:|---:|---:|---:|---:|---:|---:|---|"]
    for r in rows:
        missing = f" ({len(r['english_sections_missing'])} missing)" if r["english_sections_missing"] else ""
        names = ", ".join(sorted(set(r["speaker_names"].values()))) or "none (narrated, or one speaker)"
        lines.append(f"| {r['title']} (`{r['work']}`) | {r['sections']} | {r['english_sections']}{missing} | {r['tokens']:,} | "
                     f"{pct(r['tagged'], r['tokens'])} | {pct(r['with_morpheus'], r['tokens'])} | {r['notes']} | {r['links']} | {names} |")
    worst = sorted(rows, key=lambda r: (r["tagged"] - r["tokens"]) / r["tokens"])[:3]
    lines += ["", "**Untagged words.** A word is left untagged when GLAUx's words cannot be lined up with ours with certainty "
              "(see the README, *How GLAUx's tags are matched*); nothing is guessed. Most untagged, by share: "
              + ", ".join(f"{r['title']} {pct(r['tokens'] - r['tagged'], r['tokens'])}" for r in worst) + ".", "",
              "**Speakers.** The Greek text names speakers in Greek. The English name of each is read from the English file of the "
              "same work: where a section has the same number of changes of speaker in both, the names are paired in order, "
              "and each Greek name takes the English name it is paired with most often (`speaker_names` in build_db.py). "
              "A name never paired that way keeps its Greek form.", ""]
    (REPORTS / "corpus.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("works", nargs="*", default=ALL_WORKS, help="Perseus work ids (default: all 36, tlg001 to tlg036)")
    args = ap.parse_args()
    t = time.time()
    stats = build(args.works, progress=True)
    ensure_user_db()
    print(json.dumps(stats[-1], ensure_ascii=False, indent=2))
    if set(args.works) == set(ALL_WORKS):
        write_corpus_report(stats[:-1])
    print(f"wrote {DB_PATH.relative_to(ROOT)} in {time.time() - t:.0f}s; your work is in {USER_DB_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
