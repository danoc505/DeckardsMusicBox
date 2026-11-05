#!/usr/bin/env python3
"""Build the Workshop's library database, data/workshop.sqlite, from the
fetched sources, and create data/user.sqlite for your own work if it does not
exist yet.

    python3 tools/fetch_sources.py perseus-greek-plato glaux-plato morpheus-analyses
    python3 tools/build_db.py              # Timaeus, about 30 seconds

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
Every rule used is in this file; nothing is guessed or generated.
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
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

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

# Speaker names as the TEI gives them (Greek) -> the English used in the reader.
SPEAKERS = {"Σωκράτης": "Socrates", "Τίμαιος": "Timaeus", "Κριτίας": "Critias", "Ἑρμοκράτης": "Hermocrates"}

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
}
# An author's name just before a <title> means the work is not Plato's ("Eurip. Ion").
OTHER_AUTHOR = re.compile(r"(Eurip|Hom|Ovid|Emped|Aristot\w*|Aristoph|Hes|Hdt|Pind|Thuc|Xen)\.?\s*$")
REF_LIST = re.compile(r"^\s*\.?\s*((?:(?:\d{1,3}|[A-E]\b)(?:\s*[A-E]\b)?(?:\s*\.?\s*(?:B\.C\.|ff?\.?))?\s*(?:,|and|;)?\s*)+)")
BARE_TIM_REF = re.compile(r"\b(\d{2})\s?([A-E])\b(?:\s*(?:ff?\.)?\s*,\s*[A-E]\b)*")


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

    return {
        "editor": first(f".//{TEI}editor"),
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
        c = self._chunk()
        if c is not None:
            c["parts"].append(s)

    def walk(self, el):
        tag = el.tag.replace(TEI, "")
        if tag == "milestone":
            n = (el.get("n") or "").strip()
            if el.get("unit") == "section" and STEPH.match(n):
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


def note_links(el, from_ref):
    """Plato references in a note, read by pattern. Returns (to_work, to_ref, raw).

    A <title> naming a work of Plato is followed by Stephanus references
    ('Rep. 369 E ff., 374 E'); a bare 'page letter' with no title before it
    ('cf. 31 B') is a reference within the Timaeus. Pages without a letter are
    kept as the page ('Laws 676 ff.' -> 676)."""
    segs = _segments(el)
    out = []
    pending = None  # Plato work id waiting for its references
    for idx, (kind, s) in enumerate(segs):
        if kind == "title":
            prev_text = "".join(t for k, t in segs[:idx] if k == "text")[-20:]
            name = s.rstrip(". ")
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
        for m in BARE_TIM_REF.finditer(rest):
            if 17 <= int(m.group(1)) <= 92:
                out.extend(("tlg031", ref, raw) for ref, raw in _refs(m.group(0)))
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


def morpheus_lines(keys):
    """{beta_key: raw analyses} for the keys asked for."""
    d = RAW / "morpheus-analyses"
    found = {}
    # The CLTK repository splits one file at an arbitrary byte; reading both
    # parts as one stream joins the line that was cut in two.
    data = (d / "greek-analyses_1.txt").read_text(encoding="utf-8") + (d / "greek-analyses_2.txt").read_text(encoding="utf-8")
    for line in data.splitlines():
        form, _, rest = line.partition("\t")
        if form in keys and rest:
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

    # Sections: the Greek order is the reference order.
    for i, ref in enumerate(g.order):
        page, letter = steph_key(ref)
        db.execute("INSERT INTO section VALUES (?,?,?,?,?,?)", (work_id, ref, page, letter, i, f"{work_urn}:{ref}"))
    known = set(g.order)
    stats["sections"] = len(g.order)

    gh, eh = header_info(g_root), header_info(e_root)
    g_ed, e_ed = f"{work_id}.{grc_file.stem.split('.')[-1]}", f"{work_id}.{eng_file.stem.split('.')[-1]}"
    db.execute("INSERT INTO edition VALUES (?,?,?,?,?,?,?,?,?,?)", (
        g_ed, work_id, "perseus-greek-plato", "grc", "text",
        f"{gh['editor'].split()[-1]} ({gh['place']}, {gh['date']})", gh["editor"],
        f"{gh['editor']}, {gh['title']}, vol. {gh['volume']} ({gh['place']}, {gh['date']})",
        f"data/tlg0059/{work_id}/{grc_file.name}", "clean source text"))
    db.execute("INSERT INTO edition VALUES (?,?,?,?,?,?,?,?,?,?)", (
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
                (edition_id, work_id, c["section"], seq, c["para"], SPEAKERS.get(c["speaker"], c["speaker"]), c["label"], c["text"]))
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
        sp = SPEAKERS.get(c["speaker"], c["speaker"])
        if speeches and speeches[-1][0] == sp:
            speeches[-1][2] = c["section"]
        else:
            speeches.append([sp, c["section"], c["section"]])
    for sp, a, b in speeches:
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                   (work_id, "speech", sp or "(no speaker)", a, b, "perseus-greek-plato",
                    "consecutive <said who> in the Perseus TEI with the same speaker"))
    stats["speeches"] = len(speeches)

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
        for to_work, to_ref, raw in note_links(el, nt["section"]):
            db.execute("INSERT INTO link (from_work, from_ref, to_work, to_ref, kind, note_id, source_id, raw, method) VALUES (?,?,?,?,?,?,?,?,?)",
                       (work_id, nt["section"], to_work, to_ref, "cf", cur.lastrowid, "perseus-english-plato", raw, "pattern"))
            n_links += 1
    stats.update({"notes": n_notes, "links": n_links})
    return stats


def build(works):
    sources = load_sources()
    require(["perseus-greek-plato", "glaux-plato", "morpheus-analyses"], sources)
    DATA.mkdir(exist_ok=True)
    tmp = DB_PATH.with_suffix(".building")
    if tmp.exists():
        tmp.unlink()
    db = sqlite3.connect(tmp)
    db.executescript(SCHEMA.read_text(encoding="utf-8"))
    for s in sources:
        db.execute("INSERT INTO source VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (
            s["id"], s["title"], s["kind"], s.get("repo"), s.get("commit"), s.get("fetched_sha"), s.get("path"),
            s.get("layer"), s.get("language"), s.get("licence"), s["provenance"], s.get("status")))
    for d in sorted(PERSEUS_DIR.glob("tlg0*")):
        cts = (d / "__cts__.xml").read_text(encoding="utf-8")
        db.execute("INSERT INTO work (id, urn, title) VALUES (?,?,?)",
                   (d.name, f"{PLATO_URN}.{d.name}", re.search(r"<ti:title[^>]*>([^<]+)", cts).group(1).strip()))
    all_stats = [build_work(db, w, sources) for w in works]
    db.execute("INSERT INTO build VALUES ('built_at', ?)", (time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),))
    db.execute("INSERT INTO build VALUES ('stats', ?)", (json.dumps(all_stats),))
    db.commit()
    db.execute("PRAGMA foreign_key_check")
    problems = db.execute("PRAGMA foreign_key_check").fetchall()
    db.close()
    if problems:
        raise SystemExit(f"foreign key problems: {problems[:5]}")
    tmp.replace(DB_PATH)
    return all_stats


def ensure_user_db(path=USER_DB_PATH):
    """Create your own database's tables if they are missing. Never alters rows."""
    path.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(path)
    db.executescript(USER_SCHEMA.read_text(encoding="utf-8"))
    db.commit()
    db.close()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("works", nargs="*", default=["tlg031"], help="Perseus work ids (default: tlg031, the Timaeus)")
    args = ap.parse_args()
    t = time.time()
    stats = build(args.works)
    ensure_user_db()
    for s in stats:
        print(json.dumps(s, ensure_ascii=False, indent=2))
    print(f"wrote {DB_PATH.relative_to(ROOT)} in {time.time() - t:.0f}s; your work is in {USER_DB_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
