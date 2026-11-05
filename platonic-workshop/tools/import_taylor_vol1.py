#!/usr/bin/env python3
"""Turn the saved theosophylib.com pages of Taylor's vol. I into Workshop records.

Reads   sources/taylor-1804-vol1-theosophylib/html/*.html  (kept as received)
Writes  texts/taylor-1804/vol1/<work>.json                  (one file per work)
        reports/taylor_vol1.md and .json                     (what the import found)

Every work file holds two lists:

- segments: the running text, one record per paragraph, heading, quotation or
  table. In a dialogue a paragraph that crosses a Stephanus boundary is split
  there, so every translation segment belongs to exactly one Stephanus
  section (e.g. "327a"). Segment ids are stable and linkable, for example
  "taylor1804.republic.327a" or "taylor1804.general-introduction.p0042".
- notes: Taylor's (and Sydenham's) footnotes and the "Additional Notes" from
  Proclus, each a separate record with its own id. A note records where it is
  anchored (segment id and character offset) and, for a dialogue, the
  Stephanus section of that anchor. Segments list the notes they carry.

Text is plain Unicode with whitespace collapsed. Italics, words the site has
flagged in red as doubtful, page breaks of the 1804 edition ("[p. iv]") and
Stephanus markers are removed from the text and kept as offsets, so the text
itself stays searchable and the markup is not lost.

The site's wording and spelling are kept as they are; nothing is corrected.

    python3 tools/import_taylor_vol1.py

Standard library only. If data/raw/perseus-greek-plato exists (see
tools/fetch_sources.py), the Stephanus sections are also compared with
Burnet's Greek.
"""
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter, OrderedDict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "taylor-1804-vol1-theosophylib"
OUT = ROOT / "texts" / "taylor-1804" / "vol1"
REPORTS = ROOT / "reports"
SCHEMA = "platonic-workshop/text-v1"
EDITION = "The Works of Plato, translated by Floyer Sydenham and Thomas Taylor, vol. I (London, 1804)"

BREAK = "\u2028"  # a real line break (<br>, or a block inside a block); "\n" in the HTML source is only whitespace
VOID = {"br", "hr", "img", "col", "meta", "link", "input", "wbr"}
STEPH_MARK = re.compile(r"\s*\[(\d{1,3}[a-e])\]\s*")
PAGE_MARK = re.compile(r"\s*\[(?:p\.\s*([0-9]+|[ivxlc]+)|([ivxlc]+))\]\s*")
SIGNED = re.compile(r"[—–-]\s*([TS])\.?\s*$")
ADD_NOTE_PAGE = re.compile(r"^Page\.?\s+(\d+)\.\s*(Note\.\s*)?")

# ---------------------------------------------------------------- tiny DOM


class Node:
    __slots__ = ("tag", "attrs", "children", "parent")

    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.children, self.parent = tag, dict(attrs or {}), [], parent

    def cls(self):
        return (self.attrs.get("class") or "").split()

    def style(self):
        return (self.attrs.get("style") or "").replace(" ", "").lower()

    def centered(self):
        return "text-align:center" in self.style()

    def iter(self):
        yield self
        for c in self.children:
            if isinstance(c, Node):
                yield from c.iter()

    def text(self):
        return "".join(c if isinstance(c, str) else c.text() for c in self.children)


class TreeBuilder(HTMLParser):
    """Builds a forgiving tree. Unlike a browser it does not auto-close <p>,
    so the site's <p><p class="jwf-divide"></p></p> stays nested, which is
    easy to recognise."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root")
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def content_html(raw):
    """The article body: from the entry-content div to the site's end marker."""
    start = raw.index('class="nv-content-wrap entry-content">') + len('class="nv-content-wrap entry-content">')
    end = raw.index("<!--[googlesitekit-end-of-content]-->")
    return raw[start:end]


def parse(raw):
    tb = TreeBuilder()
    tb.feed(content_html(raw))
    tb.close()
    return tb.root


# ---------------------------------------------------------------- inline text


class Inline:
    """Plain text of a node plus its marks (italic, flagged, note anchors)."""

    def __init__(self):
        self.parts, self.marks, self.notes, self.open = [], [], [], []
        self.length = 0

    def add(self, s):
        self.parts.append(s)
        self.length += len(s)


def render(node, keep_note_anchors=True):
    out = Inline()

    def walk(n):
        for c in n.children:
            if isinstance(c, str):
                out.add(c)
                continue
            cls = c.cls()
            if c.tag == "a" and ({"sdendnoteanc", "sdfootnoteanc"} & set(cls)):
                if keep_note_anchors:
                    key = (c.attrs.get("href") or "").lstrip("#").replace("sym", "")
                    out.notes.append({"key": key, "pos": out.length, "printed": c.text().strip()})
                continue
            if c.tag == "a" and ({"sdendnotesym", "sdfootnotesym"} & set(cls)):
                continue
            if c.tag == "br":
                out.add(BREAK)
                continue
            if c.tag in ("p", "div", "td", "blockquote") and out.length:
                out.add(BREAK)
            kind = None
            if c.tag in ("em", "i"):
                kind = "italic"
            elif c.tag in ("b", "strong"):
                kind = "bold"
            elif c.tag == "u":
                kind = "underline"
            elif c.tag == "span" and "color:#ff3333" in c.style():
                kind = "flagged"
            start = out.length
            walk(c)
            if kind and out.length > start:
                out.marks.append({"type": kind, "start": start, "end": out.length})

    walk(node)
    return finish(out)


def finish(out):
    """Collapse whitespace and pull out page and Stephanus markers, keeping
    every offset right."""
    raw = "".join(out.parts)
    # Map each raw offset to its offset in the cleaned string.
    keep, mapping, pages, stephs = [], [], [], []
    i, n = 0, len(raw)
    clean_len = 0  # length of the cleaned text so far
    last_space = True
    events = []
    for m in PAGE_MARK.finditer(raw):
        events.append((m.start(), m.end(), "page", m.group(1) or m.group(2)))
    for m in STEPH_MARK.finditer(raw):
        events.append((m.start(), m.end(), "steph", m.group(1)))
    events.sort()
    ev = 0
    while i < n:
        if ev < len(events) and i == events[ev][0]:
            s, e, kind, val = events[ev]
            # A marker stands where a space was: keep one space, and point
            # the marker at the word after it.
            if not last_space:
                keep.append(" ")
                clean_len += 1
                last_space = True
            (pages if kind == "page" else stephs).append({"value": val, "pos": clean_len})
            for _ in range(s, e):
                mapping.append(clean_len)
            i = e
            ev += 1
            continue
        ch = raw[i]
        mapping.append(clean_len)
        if ch.isspace() and ch != BREAK:
            if not last_space:
                keep.append(" ")
                clean_len += 1
                last_space = True
        elif ch == BREAK:
            # A line break inside verse or an address: keep it, but trim the
            # space before it.
            if keep and keep[-1] == " ":
                keep.pop()
                clean_len -= 1
            if keep and keep[-1] != "\n":
                keep.append("\n")
                clean_len += 1
            last_space = True
        else:
            keep.append(ch)
            clean_len += 1
            last_space = False
        i += 1
    mapping.append(clean_len)
    text = "".join(keep)
    lead = len(text) - len(text.lstrip())
    text = text.strip()

    def pos(p):
        return max(0, min(len(text), p - lead))

    def raw_pos(p):
        return pos(mapping[p])

    marks = []
    for mk in out.marks:
        s, e = raw_pos(mk["start"]), raw_pos(mk["end"])
        while e > s and text[e - 1].isspace():
            e -= 1
        while s < e and text[s].isspace():
            s += 1
        if e > s:
            marks.append({"type": mk["type"], "start": s, "end": e})
    notes = [{"key": nt["key"], "at": raw_pos(nt["pos"]), "printed": nt["printed"]} for nt in out.notes]
    return {
        "text": text,
        "marks": marks,
        "notes": notes,
        "pages": [{"page": p["value"], "at": pos(p["pos"])} for p in pages],
        "stephanus": [{"section": s["value"], "at": pos(s["pos"])} for s in stephs],
    }


# ---------------------------------------------------------------- blocks


def is_divider(node):
    return any("jwf-divide" in x.cls() for x in node.iter())


def anchor_names(node):
    return [x.attrs["name"] for x in node.iter() if x.tag == "a" and "name" in x.attrs
            and not x.attrs["name"].startswith(("sdendnote", "sdfootnote"))]


def blocks(root):
    """Flatten the article into a list of (kind, node, extra) in reading order."""
    out = []

    def walk(n):
        for c in n.children:
            if isinstance(c, str):
                if c.strip():
                    out.append(("stray", c, None))
                continue
            names = anchor_names(c)
            # A named anchor inside a paragraph with text (the site's contents
            # list ends with <a name="intro">) starts the next section, so it
            # goes after the paragraph.
            trailing = c.tag == "p" and bool(names) and bool(render(c)["text"])
            if not trailing:
                for name in names:
                    out.append(("anchor", c, name))
            if c.tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
                out.append(("heading", c, int(c.tag[1])))
            elif c.tag == "hr":
                out.append(("rule", c, None))
            elif c.tag == "div" and re.match(r"sd(end|foot)note\d+$", c.attrs.get("id", "")):
                out.append(("notediv", c, c.attrs["id"]))
            elif c.tag == "div":
                walk(c)
            elif c.tag == "blockquote":
                out.append(("quote", c, None))
            elif c.tag == "table":
                out.append(("table", c, None))
            elif c.tag == "p":
                if is_divider(c) and not render(c)["text"]:
                    out.append(("divider", c, None))
                elif names and not render(c)["text"]:
                    pass
                else:
                    out.append(("para", c, None))
            else:
                out.append(("para", c, None))
            if trailing:
                for name in names:
                    out.append(("anchor", c, name))

    walk(root)
    return out


NOTE_LABEL = re.compile(r"^(Additional Notes|Notes|Introduction|Translation|Book)\b")


def is_note_label(p, text):
    """A short line in the notes area that names the part of the work the
    following notes belong to ("Translation", "Book 2", "Additional Notes to
    The Republic"). The site centres most of them, but not all."""
    return bool(text) and len(text) < 60 and (p.centered() or NOTE_LABEL.match(text) and not text.endswith("."))


def table_text(node):
    rows = []
    for tr in (x for x in node.iter() if x.tag == "tr"):
        cells = [" ".join(render(td)["text"].split()) for td in tr.children if isinstance(td, Node) and td.tag == "td"]
        rows.append(" | ".join(c for c in cells if c and c != "{"))
    return "\n".join(rows)


# ---------------------------------------------------------------- import


def roman(s):
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}
    total = 0
    for a, b in zip(s, s[1:] + " "):
        v = vals[a]
        total += -v if b != " " and vals.get(b, 0) > v else v
    return total


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.replace("æ", "ae").replace("œ", "oe")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()


class WorkImporter:
    def __init__(self, page, raw, corrections=()):
        self.page = page
        self.corrections = {(c["printed"], c["occurrence"]): c for c in corrections}
        self.marker_seen = Counter()
        self.wid = f"taylor1804.{page['work']}"
        self.is_dialogue = bool(page["perseus"])
        self.segments, self.notes = [], OrderedDict()
        self.problems = []
        # A dialogue page opens with the site's own description and contents
        # list, before the first section anchor: kept, but marked as the site's.
        self.part = "site" if self.is_dialogue else "text"
        self.book = None
        self.steph = None
        self.page_no = None
        self.para = 0
        self.heading_path = []
        self.note_label = None
        self.pending_lemma = None
        self.current_add = None
        self.id_counts = Counter()
        self.root = parse(raw)

    # ids -------------------------------------------------------------------
    def seg_id(self):
        if self.part == "translation" and self.steph:
            base = f"{self.wid}.{self.steph}"
        else:
            base = f"{self.wid}.{self.part}.p{len([s for s in self.segments if s['part'] == self.part]) + 1:04d}"
        self.id_counts[base] += 1
        k = self.id_counts[base]
        return base if k == 1 else f"{base}.{k}"

    # segments --------------------------------------------------------------
    def add_segment(self, kind, r, split_steph=True):
        """Add one block. In the translation, split at Stephanus markers."""
        if not r["text"] and not r["notes"]:
            return []
        self.para += 1
        pieces = [(0, None)]
        if self.part == "translation" and split_steph:
            pieces = [(0, None)] + [(s["at"], s["section"]) for s in r["stephanus"]]
        elif r["stephanus"]:
            self.problems.append(f"Stephanus marker outside the translation: {r['text'][:60]!r}")
        made = []
        for idx, (start, section) in enumerate(pieces):
            end = pieces[idx + 1][0] if idx + 1 < len(pieces) else len(r["text"])
            printed = None
            if section:
                self.marker_seen[section] += 1
                fix = self.corrections.get((section, self.marker_seen[section]))
                if fix:
                    printed, section = section, fix["read_as"]
                self.steph = section
            chunk = r["text"][start:end]
            lead = len(chunk) - len(chunk.lstrip())
            body = chunk.strip()
            notes_here = [n for n in r["notes"] if start <= n["at"] < end or (n["at"] == end == len(r["text"]) and idx + 1 == len(pieces))]
            if not body and not notes_here:
                continue
            off = start + lead
            for pg in r["pages"]:
                if pg["at"] <= start:
                    self.page_no = pg["page"]
            seg = OrderedDict()
            seg["id"] = self.seg_id()
            seg["kind"] = kind
            seg["part"] = self.part
            if self.book is not None:
                seg["book"] = self.book
            if self.is_dialogue and self.part == "translation":
                seg["stephanus"] = self.steph
                if printed:
                    seg["stephanus_printed"] = printed
            if self.page_no:
                seg["page_1804"] = self.page_no
            if self.heading_path:
                seg["heading"] = " / ".join(self.heading_path)
            seg["paragraph"] = self.para
            seg["text"] = body
            marks = [dict(m, start=m["start"] - off, end=m["end"] - off) for m in r["marks"]
                     if m["end"] > off and m["start"] < off + len(body)]
            for m in marks:
                m["start"], m["end"] = max(0, m["start"]), min(len(body), m["end"])
            if marks:
                seg["marks"] = marks
            pages = [{"page": p["page"], "at": p["at"] - off} for p in r["pages"] if off < p["at"] <= off + len(body)]
            if pages:
                seg["page_breaks"] = pages
            seg["notes"] = []
            for n in notes_here:
                seg["notes"].append({"note": self.note_id(n["key"]), "at": max(0, min(len(body), n["at"] - off))})
            for pg in r["pages"]:
                if pg["at"] < end:
                    self.page_no = pg["page"]
            self.segments.append(seg)
            made.append(seg)
        return made

    def note_id(self, key):
        return f"{self.wid}.n{int(re.sub(r'\D', '', key)):03d}"

    # notes ---------------------------------------------------------------
    def note_record(self, key):
        nid = self.note_id(key)
        if nid not in self.notes:
            rec = OrderedDict()
            rec["id"] = nid
            rec["type"] = "footnote"
            self.notes[nid] = rec
        return self.notes[nid]

    def add_footnote_div(self, div):
        """One <div id="sdendnoteN">: the note body, maybe several paragraphs,
        and sometimes a centred section label that belongs to the next note."""
        key = div.attrs["id"]
        paras, marks, inner_notes = [], [], []
        printed = None
        label = self.note_label
        for p in div.children:
            if not isinstance(p, Node):
                continue
            sym = next((x for x in p.iter() if x.tag == "a" and ({"sdendnotesym", "sdfootnotesym"} & set(x.cls()))), None)
            if sym is not None and not sym.text().strip():
                sym = None  # an empty duplicate of the number, left by the site's editor
            if sym is not None:
                sym_key = (sym.attrs.get("name") or key).replace("sym", "")
                if paras and sym_key != key:
                    # Two notes share one <div>: close the first, start the next.
                    self.store_footnote(key, printed, paras, marks, inner_notes, label)
                    paras, marks, inner_notes = [], [], []
                key = sym_key
                printed = sym.text().strip()
                label = self.note_label
            r = render(p)
            if sym is None and is_note_label(p, r["text"]):
                self.note_label = r["text"]
                continue
            t = r["text"]
            if sym is not None:
                t2 = re.sub(r"^\.\s*", "", t)
                shift = len(t) - len(t2)
                t = t2
                r["marks"] = [dict(m, start=max(0, m["start"] - shift), end=m["end"] - shift) for m in r["marks"] if m["end"] - shift > 0]
                r["notes"] = [dict(n, at=max(0, n["at"] - shift)) for n in r["notes"]]
            if not t:
                continue
            base = sum(len(x) + 2 for x in paras)
            paras.append(t)
            marks += [dict(m, start=m["start"] + base, end=m["end"] + base) for m in r["marks"]]
            inner_notes += [{"note": self.note_id(n["key"]), "at": n["at"] + base} for n in r["notes"]]
            if r["pages"]:
                self.problems.append(f"1804 page marker inside footnote {key}: {[x['page'] for x in r['pages']]}")
        self.store_footnote(key, printed, paras, marks, inner_notes, label)

    def store_footnote(self, key, printed, paras, marks, inner_notes, label):
        if not paras:
            return
        rec = self.note_record(key)
        text = "\n\n".join(paras)
        rec["printed_number"] = printed
        if label:
            rec["section"] = label
        sig = SIGNED.search(text)
        rec["signed"] = {"T": "Taylor", "S": "Sydenham"}[sig.group(1)] if sig else None
        rec["text"] = text
        if marks:
            rec["marks"] = marks
        if inner_notes:
            rec["notes"] = inner_notes

    # additional notes ------------------------------------------------------
    def start_additional(self, lemma_r, page=None, on_note=False):
        self.close_additional()
        nid = f"{self.wid}.add{sum(1 for n in self.notes.values() if n['type'] == 'additional') + 1:03d}"
        rec = OrderedDict()
        rec["id"] = nid
        rec["type"] = "additional"
        if self.page["work"] == "alcibiades-1":
            rec["source"] = "Proclus, commentary on the First Alcibiades (manuscript), extracted and translated by Taylor"
        if self.book is not None:
            rec["book"] = self.book
        if page:
            rec["page_1804"] = page
        rec["lemma"] = lemma_r["text"]
        rec["lemma_on_footnote"] = on_note
        rec["_paras"], rec["_marks"], rec["_notes"] = [], [], []
        self.notes[nid] = rec
        self.current_add = rec
        for n in lemma_r["notes"]:
            self.anchor_note(n["key"], {"in": nid, "field": "lemma", "at": n["at"]})

    def add_to_additional(self, r):
        rec = self.current_add
        base = sum(len(x) + 2 for x in rec["_paras"])
        rec["_paras"].append(r["text"])
        rec["_marks"] += [dict(m, start=m["start"] + base, end=m["end"] + base) for m in r["marks"]]
        for n in r["notes"]:
            rec["_notes"].append({"note": self.note_id(n["key"]), "at": n["at"] + base})
            self.anchor_note(n["key"], {"in": rec["id"], "at": n["at"] + base})

    def close_additional(self):
        rec = self.current_add
        if not rec:
            return
        rec["text"] = "\n\n".join(rec.pop("_paras"))
        marks, notes = rec.pop("_marks"), rec.pop("_notes")
        if marks:
            rec["marks"] = marks
        if notes:
            rec["notes"] = notes
        self.current_add = None

    def anchor_note(self, key, anchor):
        rec = self.note_record(key)
        rec.setdefault("anchors", []).append(anchor)

    # main walk -------------------------------------------------------------
    def run(self):
        in_notes = False  # the footnote area at the end of the page
        for kind, node, extra in blocks(self.root):
            if kind == "anchor":
                self.on_anchor(extra)
                continue
            if kind in ("divider", "rule", "stray"):
                if kind == "stray":
                    self.problems.append(f"loose text outside a paragraph: {node.strip()[:60]!r}")
                continue
            if kind == "notediv":
                in_notes = True
                self.add_footnote_div(node)
                continue
            r = render(node) if kind != "table" else None
            if kind == "heading":
                title = r["text"]
                if norm(title) == "notes":
                    self.close_additional()
                    in_notes = True
                    self.note_label = None
                    continue
                if in_notes:
                    self.note_label = title
                    continue
                if self.part == "additional-notes":
                    self.close_additional()
                self.on_heading(title, extra, r)
                continue
            if in_notes:
                if r["text"] and node.centered() and len(r["text"]) < 60:
                    self.note_label = r["text"]
                elif r["text"]:
                    self.problems.append(f"text in the notes area outside a note: {r['text'][:60]!r}")
                continue
            if self.part == "additional-notes":
                self.on_additional_block(kind, node, r)
                continue
            if kind == "table":
                seg_r = {"text": table_text(node), "marks": [], "notes": [], "pages": [], "stephanus": []}
                for a in node.iter():
                    if a.tag == "a" and "sdendnoteanc" in a.cls():
                        seg_r["notes"].append({"key": a.attrs["href"].lstrip("#").replace("sym", ""), "at": 0, "printed": a.text().strip()})
                self.add_segment("table", seg_r, split_steph=False)
                continue
            if kind == "para" and node.centered() and not r["notes"] and r["text"] and set(r["text"]) <= set("—–- "):
                continue  # printed rule "—————"
            seg_kind = {"quote": "quotation", "para": "paragraph"}.get(kind, kind)
            if self.page["work"] == "platonic-terms":
                seg_kind = "term" if any(x.tag == "b" for x in node.iter()) else seg_kind
            if kind == "para" and node.centered():
                seg_kind = "caption"
            site_key = self.page["work"] == "platonic-terms" and (
                r["text"] == "Sources:" or re.match(r"^\[[^\]]+\] : ", r["text"]))
            if site_key:  # the site's key to its source tags
                self.part = "site"
            made = self.add_segment(seg_kind, r)
            if site_key:
                self.part = "text"
            if seg_kind == "term" and made:
                seg = made[0]
                bold = [seg["text"][m["start"]:m["end"]] for m in seg.get("marks", []) if m["type"] == "bold"]
                seg["term"] = bold[0].rstrip(".,") if bold else None
                seg["cited_from"] = re.findall(r"\[(Plato Dialogues|Procl\. [^\]]+)\]", seg["text"])
        self.close_additional()
        self.link_anchors()

    def on_anchor(self, name):
        self.close_additional()
        if name == "intro":
            self.part, self.book = "introduction", None
        elif name == "trans":
            self.part, self.book = "translation", None
        elif name in ("notes", "add-notes"):
            self.part, self.book = "additional-notes", None
        elif name == "apology":
            self.part, self.book = "introduction-books-2-3", None
        elif name.startswith("book-"):
            self.part, self.book = "translation", int(name.split("-")[1])
        else:
            self.problems.append(f"unknown section anchor {name!r}")
        self.heading_path = []

    def on_heading(self, title, level, r):
        if norm(title) == "contents":
            return
        m = re.match(r"^BOOK\s+([IVXL]+)\.?$", title.strip())
        if m:
            self.book = roman(m.group(1))
        self.heading_path = [title]
        self.add_segment("heading", r, split_steph=False)

    def on_additional_block(self, kind, node, r):
        text = r["text"]
        if kind == "heading":
            m = re.match(r"^BOOK\s+([IVXL]+)\.?$", text.strip())
            if m:
                self.close_additional()
                self.book = roman(m.group(1))
                return
            if norm(text) == "additional notes":
                return
        if kind == "para" and node.centered():
            # "on", "The Republic", "—————": the section's title page
            self.add_segment("caption", r) if text and not set(text) <= set("—–- ") else None
            return
        if kind == "para":
            m = ADD_NOTE_PAGE.match(text)
            if m:
                cut = m.end()
                lemma = dict(r, text=text[cut:].strip(), notes=[dict(n, at=max(0, n["at"] - cut)) for n in r["notes"]])
                self.start_additional(lemma, page=m.group(1), on_note=bool(m.group(2)))
                return
        if kind == "quote":
            ems = [x for x in node.iter() if x.tag in ("em", "i")]
            em_text = "".join(x.text() for x in ems)
            if ems and norm(em_text) == norm(text) and self.page["work"] == "alcibiades-1":
                self.start_additional(r)
                return
        if not text and not r["notes"]:
            return
        if self.current_add is None:
            if self.book is None:
                # The heading paragraph of the section ("THE FOLLOWING ADDITIONAL NOTES ...").
                self.add_segment("paragraph", r)
                return
            # A note on a whole book, with no lemma (Republic book IV: Proclus on the virtues).
            self.start_additional({"text": None, "notes": []})
        self.add_to_additional(r)

    # linking ---------------------------------------------------------------
    def link_anchors(self):
        by_id = {s["id"]: s for s in self.segments}
        for seg in self.segments:
            for ref in seg["notes"]:
                rec = self.notes.get(ref["note"])
                if rec is None:
                    self.problems.append(f"note mark {ref['note']} in {seg['id']} has no note text")
                    continue
                a = {"in": seg["id"], "at": ref["at"]}
                if "stephanus" in seg:
                    a["stephanus"] = seg["stephanus"]
                rec.setdefault("anchors", []).append(a)
        for parent in list(self.notes.values()):
            if parent["type"] != "footnote":
                continue  # Additional Notes anchored their footnotes as they were read
            for ref in parent.get("notes", []):
                child = self.notes.get(ref["note"])
                if child is not None:
                    child.setdefault("anchors", []).append({"in": parent["id"], "at": ref["at"]})
        for rec in self.notes.values():
            if rec["type"] == "footnote" and "text" not in rec:
                self.problems.append(f"note {rec['id']} is referenced but has no text")
            if rec["type"] == "footnote" and not rec.get("anchors"):
                self.problems.append(f"note {rec['id']} ({rec.get('printed_number')}) has no mark in the text")
            for a in rec.get("anchors", []):
                if a["in"] in by_id:
                    continue
                parent = self.notes.get(a["in"])
                if parent and parent.get("stephanus"):
                    a["stephanus"] = parent["stephanus"]

    # aligning additional notes to Stephanus -------------------------------
    def align_additional(self):
        """Find each Additional Note's lemma in the translation (or in a
        footnote, for 'Page N. Note.' lemmas) and give it a Stephanus section.

        A lemma found in only one place is placed there. A lemma found in
        several places (e.g. 'Thrasymachus.') is placed at the hit nearest to
        where it should be: estimated from the 1804 page number between the
        neighbouring notes that were placed for certain, or, with no page
        number, the first hit after the previous note."""
        trans = [s for s in self.segments if s["part"] == "translation" and s.get("stephanus")]
        if not trans:
            return
        blob, owner = [], []
        for s in trans:
            t = norm(s["text"]) + " "
            blob.append(t)
            owner.extend([s["id"]] * len(t))
        blob = "".join(blob)
        seg_by_id = {s["id"]: s for s in trans}
        seg_start = {}
        for i, sid in enumerate(owner):
            seg_start.setdefault(sid, i)
        note_blob = {nid: norm(n.get("text", "")) for nid, n in self.notes.items() if n["type"] == "footnote"}
        adds = [n for n in self.notes.values() if n["type"] == "additional"]

        cands = []  # per note: (list of char positions, how)
        for rec in adds:
            if rec["lemma"] is None:
                cands.append(([], "no lemma"))
                continue
            lemma = re.sub(r"\s*(&c|etc)\.?\s*$", "", rec["lemma"].strip(), flags=re.I)
            words = norm(lemma).split()
            hits, how = [], None
            if rec.get("lemma_on_footnote"):
                for k in (len(words), 8, 5):
                    probe = " ".join(words[:k])
                    fns = [nid for nid, t in note_blob.items() if probe and probe in t]
                    anchored = [f for f in fns if (self.notes[f].get("anchors") or [{}])[0].get("in") in seg_by_id]
                    if anchored:
                        rec["on_footnote"] = anchored[0]
                        hits = [seg_start[self.notes[f]["anchors"][0]["in"]] for f in anchored]
                        how = "in footnote" if k == len(words) else f"in footnote, first {k} words"
                        break
            if not hits:
                for k in (len(words), 8, 6, 4):
                    if k > len(words) or (k < len(words) and k < 4):
                        continue
                    probe = " ".join(words[:k])
                    hits = [m.start() for m in re.finditer(r"(?<![a-z0-9])" + re.escape(probe) + r"(?![a-z0-9])", blob)]
                    if rec.get("book") is not None:
                        hits = [h for h in hits if seg_by_id[owner[h]].get("book") == rec["book"]] or hits
                    if hits:
                        how = "exact" if k == len(words) else f"first {k} words"
                        break
            cands.append((hits, how))

        placed = {}
        for i, (hits, how) in enumerate(cands):
            if len(hits) == 1:
                placed[i] = hits[0]
        for i, (hits, how) in enumerate(cands):
            if len(hits) <= 1:
                continue
            rec = adds[i]
            target = None
            page = int(rec["page_1804"]) if rec.get("page_1804") else None
            if page is not None:
                known = sorted((int(adds[j]["page_1804"]), pos) for j, pos in placed.items() if adds[j].get("page_1804"))
                before = [k for k in known if k[0] <= page]
                after = [k for k in known if k[0] > page]
                if before and after and after[0][0] != before[-1][0]:
                    (p0, c0), (p1, c1) = before[-1], after[0]
                    target = c0 + (c1 - c0) * (page - p0) / (p1 - p0)
                    choice = min(hits, key=lambda h: abs(h - target))
                    how += f"; {len(hits)} places, nearest to the 1804 page"
            if target is None:
                prev = max((pos for j, pos in placed.items() if j < i), default=-1)
                choice = next((h for h in hits if h > prev), hits[0])
                how += f"; {len(hits)} places, first after the previous note"
            placed[i] = choice
            cands[i] = (hits, how)

        for i, rec in enumerate(adds):
            hits, how = cands[i]
            if i in placed:
                seg = seg_by_id[owner[placed[i]]]
                rec["anchors"] = [{"in": seg["id"], "stephanus": seg["stephanus"], "matched": how}]
                rec["stephanus"] = seg["stephanus"]
            else:
                rec["anchors"] = []
                rec["stephanus"] = None
                if rec["lemma"] is None:
                    rec["scope"] = f"book {rec['book']}" if rec.get("book") else "whole dialogue"
                else:
                    self.problems.append(f"additional note {rec['id']}: lemma not found in the translation: {rec['lemma'][:70]!r}")
        # Footnotes anchored inside an additional note inherit its section.
        for rec in self.notes.values():
            for a in rec.get("anchors", []):
                parent = self.notes.get(a["in"])
                if parent is not None and parent.get("stephanus"):
                    a["stephanus"] = parent["stephanus"]

    def result(self, fetched):
        out = OrderedDict()
        out["schema"] = SCHEMA
        out["id"] = self.wid
        out["title"] = self.page["title"]
        out["author"] = self.page["author"]
        out["translator"] = self.page["translator"]
        out["edition"] = EDITION
        if self.page["perseus"]:
            out["perseus_work"] = f"urn:cts:greekLit:tlg0059.{self.page['perseus']}"
            out["citation"] = "Stephanus section on every translation segment (e.g. 327a); Additional Notes aligned by finding their lemma in the translation"
        out["source"] = OrderedDict([
            ("manifest_id", "taylor-1804-vol1-theosophylib"),
            ("file", f"sources/taylor-1804-vol1-theosophylib/html/{self.page['slug']}.html"),
            ("url", self.page["url"]),
            ("fetched_at", fetched["fetched_at"]),
            ("sha256", fetched["sha256"]),
        ])
        out["segments"] = self.segments
        out["notes"] = sorted(self.notes.values(), key=lambda n: (n["type"] != "footnote", n["id"]))
        return out


# ---------------------------------------------------------------- checks


def perseus_sections(work):
    sys.path.insert(0, str(ROOT / "tools"))
    import verify_sources as vs  # noqa: E402
    d = vs.perseus_dir() / work
    grc = next(iter(sorted(d.glob("*-grc*.xml"))), None) if d.exists() else None
    if not grc:
        return None
    _, root = vs.tei_header(grc)
    return vs.stephanus_sections(root)


def check(doc, problems, perseus_work):
    segs, notes = doc["segments"], doc["notes"]
    r = OrderedDict()
    r["segments"] = len(segs)
    r["words"] = sum(len(s["text"].split()) for s in segs)
    r["parts"] = dict(Counter(s["part"] for s in segs))
    foot = [n for n in notes if n["type"] == "footnote"]
    add = [n for n in notes if n["type"] == "additional"]
    r["footnotes"] = len(foot)
    r["footnotes_signed"] = dict(Counter(n.get("signed") or "unsigned" for n in foot))
    r["additional_notes"] = len(add)
    r["additional_aligned"] = sum(1 for n in add if n.get("stephanus"))
    r["additional_match_kinds"] = dict(Counter((n["anchors"][0]["matched"].split(" (")[0] if n.get("anchors") else "not found") for n in add))
    r["flagged_spans"] = sum(1 for s in segs for m in s.get("marks", []) if m["type"] == "flagged")
    r["page_breaks"] = sum(len(s.get("page_breaks", [])) for s in segs)
    if perseus_work:
        order = []
        for s in segs:
            if s["part"] == "translation" and s.get("stephanus") and (not order or order[-1] != s["stephanus"]):
                order.append(s["stephanus"])
        r["stephanus_sections"] = len(order)
        r["stephanus_first_last"] = [order[0], order[-1]] if order else None
        sys.path.insert(0, str(ROOT / "tools"))
        import verify_sources as vs  # noqa: E402
        r["stephanus_sequence_breaks"] = vs.sequence_problems(order)
        r["translation_before_first_marker"] = sum(1 for s in segs if s["part"] == "translation" and not s.get("stephanus") and s["kind"] != "heading" and s["kind"] != "caption")
        greek = perseus_sections(perseus_work)
        if greek is None:
            r["perseus"] = "not checked (run tools/fetch_sources.py perseus-greek-plato)"
        else:
            g, t = set(greek), set(order)
            r["perseus"] = OrderedDict([
                ("greek_sections", len(greek)),
                ("missing_in_taylor", [x for x in greek if x not in t]),
                ("not_in_greek", [x for x in order if x not in g]),
            ])
    r["problems"] = problems
    return r


def render_report(results):
    L = []
    w = L.append
    w("# Taylor, Works of Plato vol. I (theosophylib.com): import report\n")
    w("Written by `tools/import_taylor_vol1.py`. Every figure is counted from the files in "
      "`texts/taylor-1804/vol1/`.\n")
    w("| Work | Segments | Words | Footnotes | Additional Notes (aligned) | Stephanus sections | Against Burnet's Greek |")
    w("|---|---|---|---|---|---|---|")
    for wid, r in results.items():
        steph = per = "–"
        if "stephanus_sections" in r:
            fl = r["stephanus_first_last"]
            steph = f"{r['stephanus_sections']} ({fl[0]} to {fl[1]})"
            p = r["perseus"]
            if isinstance(p, dict):
                miss, extra = p["missing_in_taylor"], p["not_in_greek"]
                per = f"{p['greek_sections']} in the Greek; " + (
                    "identical" if not miss and not extra else
                    f"missing in Taylor: {', '.join(miss) or 'none'}; not in the Greek: {', '.join(extra) or 'none'}")
            else:
                per = p
        add = f"{r['additional_notes']} ({r['additional_aligned']})" if r["additional_notes"] else "–"
        w(f"| {wid} | {r['segments']:,} | {r['words']:,} | {r['footnotes']} | {add} | {steph} | {per} |")
    w("")
    for wid, r in results.items():
        w(f"## {wid}\n")
        w(f"- Parts: " + ", ".join(f"{k} {v}" for k, v in r["parts"].items()))
        w(f"- Footnotes by signature: " + ", ".join(f"{k} {v}" for k, v in r["footnotes_signed"].items()))
        if r["additional_notes"]:
            w(f"- Additional Notes: {r['additional_notes']}, of which {r['additional_aligned']} were placed at a Stephanus section. "
              "How the lemma was found: " + ", ".join(f"{k} {v}" for k, v in r["additional_match_kinds"].items()))
        if r.get("stephanus_sequence_breaks") is not None:
            b = r["stephanus_sequence_breaks"]
            w(f"- Breaks in the Stephanus sequence: {', '.join(b) if b else 'none'}")
        if r["flagged_spans"]:
            w(f"- Words the site marks in red as doubtful (kept, as `flagged` marks): {r['flagged_spans']}")
        if r["page_breaks"]:
            w(f"- Page breaks of the 1804 edition kept: {r['page_breaks']}")
        if r["problems"]:
            w(f"- Things to look at ({len(r['problems'])}):")
            for p in r["problems"]:
                w(f"  - {p}")
        else:
            w("- Nothing left unresolved.")
        w("")
    return "\n".join(L)


def import_all():
    """Yield (page, doc, problems) for every page, from the committed HTML."""
    pages = json.loads((SRC / "pages.json").read_text(encoding="utf-8"))["pages"]
    fetched = json.loads((SRC / "fetched.json").read_text(encoding="utf-8"))
    corrections = json.loads((SRC / "stephanus_corrections.json").read_text(encoding="utf-8"))["corrections"]
    for page in pages:
        path = SRC / "html" / f"{page['slug']}.html"
        if not path.exists():
            sys.exit(f"{path} missing: run tools/fetch_theosophylib.py")
        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() != fetched[page["slug"]]["sha256"]:
            sys.exit(f"{path} does not match the sha256 in fetched.json: it has changed since it was downloaded")
        imp = WorkImporter(page, data.decode("utf-8"), corrections.get(page["work"], []))
        imp.run()
        imp.align_additional()
        yield page, imp.result(fetched[page["slug"]]), imp.problems


def dump(doc):
    return json.dumps(doc, indent=1, ensure_ascii=False) + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(exist_ok=True)
    results = OrderedDict()
    for page, doc, problems in import_all():
        (OUT / f"{page['work']}.json").write_text(dump(doc), encoding="utf-8")
        results[doc["id"]] = check(doc, problems, page["perseus"])
        print(f"[ok] {doc['id']}: {len(doc['segments'])} segments, {len(doc['notes'])} notes, {len(problems)} to look at")
    (REPORTS / "taylor_vol1.json").write_text(json.dumps(results, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    (REPORTS / "taylor_vol1.md").write_text(render_report(results) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
