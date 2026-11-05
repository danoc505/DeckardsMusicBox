#!/usr/bin/env python3
"""Milestone 6: the historical translations, placed at Stephanus sections.

Called by build_db.py for each work after the Greek and the Loeb English are
in. Adds, beside the Loeb English (Perseus, already by section):

- Jowett, from Project Gutenberg (tools/jowett.py). The Republic (third
  edition, 1888) is printed with its Stephanus sections: each section of the
  translation is where the book puts it. The dialogues of vol. II (1892) are
  printed with Stephanus pages: the page numbers are fixed points, and the
  sections within each page are found by tools/align.py. The rest are placed
  by tools/align.py alone.
- Taylor and Sydenham (1804). Vol. I (First Alcibiades, Republic) from
  theosophylib.com, whose editor inserted Stephanus numbers: placed where the
  site puts them. Vols. II to V from the OCR cleaned by rule
  (tools/taylor_ocr.py, texts/taylor-1804/vol2 to vol5): placed by
  tools/align.py.

Each translation is an edition; each run of its text at one place is a chunk
whose align_method says how its section was found:

  printed                    the book (or the site's editor) prints the number there
  printed page, section computed   the page is printed; the section is computed within it
  computed                   tools/align.py, against the Loeb English

A computed paragraph is kept whole when it starts and ends within one
section of each other (end_ref says where it ends); a longer one is cut at
the sentence where the computed section changes, so a speech running over a
whole page is not shown at its first section only.

Footnotes become notes of their translator ('Jowett (1892)', 'Sydenham
(1804)' for notes signed S., 'Taylor (1804)' for T.), placed in the chunk
that carries them.
"""
import json
import re
from pathlib import Path

import align
import jowett

ROOT = Path(__file__).resolve().parent.parent
TAYLOR = ROOT / "texts" / "taylor-1804"
TAYLOR_CFG = ROOT / "sources" / "taylor-1804" / "dialogues.json"

PRINTED = "printed"
PAGE = "printed page, section computed"
COMPUTED = "computed"


# ------------------------------------------------------------------ sources

_jowett = None


def jowett_data():
    global _jowett
    if _jowett is None:
        _jowett = jowett.load_all()
    return _jowett


def taylor_files():
    """{work id: path to its JSON}, vol. I from theosophylib and vols. II to V from the OCR."""
    out = {}
    for f in sorted((TAYLOR / "vol1").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        w = (d.get("perseus_work") or "").rsplit(".", 1)[-1]
        if w.startswith("tlg"):
            out[w] = f
    for d in json.loads(TAYLOR_CFG.read_text(encoding="utf-8"))["dialogues"]:
        f = TAYLOR / f"vol{d['vol']}" / f"{d['slug']}.json"
        if f.exists():
            out[d["work"]] = f
    return out


# ------------------------------------------------------------------ placing text

class Placer:
    """Cuts paragraphs into chunks at sections, by printed markers or by
    alignment against the reference (Loeb) chunks of the same work."""

    def __init__(self, db, work_id):
        self.db = db
        self.work_id = work_id
        self.order = [r[0] for r in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work_id,))]
        self.seq = {r: i for i, r in enumerate(self.order)}
        ref_ed = db.execute("SELECT id FROM edition WHERE work_id = ? AND source_id = 'perseus-english-plato'", (work_id,)).fetchone()[0]
        self.ref_pieces = [(t, r) for t, r in db.execute(
            "SELECT text, section_ref FROM chunk WHERE edition_id = ? ORDER BY seq", (ref_ed,))]
        # Where each section begins in the reference stream (as align.Stream counts).
        self.ref_start = {}
        pos = 0
        for t, r in self.ref_pieces:
            self.ref_start.setdefault(r, pos)
            pos += len(t) + 1

    def nearest(self, ref):
        """A printed reference that is not a section of Burnet's text (editions
        letter the pages differently): the last section before it."""
        if ref in self.seq:
            return ref
        m = re.match(r"(\d+)([a-e])", ref)
        page, letter = int(m.group(1)), m.group(2)
        best = None
        for r in self.order:
            mm = re.match(r"(\d+)([a-e])", r)
            if (int(mm.group(1)), mm.group(2)) <= (page, letter):
                best = r
        return best or self.order[0]

    def computed(self, paras, fixed=()):
        """paras: [{'text', ...}] -> [(para index, start, end, section, end section)]
        pieces, by alignment; fixed are (stream position, reference position) anchors."""
        pieces = [(p["text"], None) for p in paras]
        mapper, info = align.align(pieces, self.ref_pieces, fixed)
        out = []
        for k, (p, start) in enumerate(zip(paras, info["t_starts"])):
            text = p["text"]
            if not text:
                continue
            us = align.units(text, 0) or [(0, len(text))]
            secs = [mapper(start + (a + b) / 2) for a, b in us]
            first, last = secs[0], secs[-1]
            if self.seq[last] - self.seq[first] <= 1:
                out.append((k, 0, len(text), first, last))
                continue
            cut = 0
            for i in range(1, len(us) + 1):
                if i == len(us) or secs[i] != secs[i - 1]:
                    end = us[i][0] if i < len(us) else len(text)
                    out.append((k, cut, end, secs[i - 1], secs[i - 1]))
                    cut = end
        return out, info

    def stream_positions(self, paras):
        starts, pos = [], 0
        for p in paras:
            starts.append(pos)
            pos += len(p["text"]) + 1
        return starts


# ------------------------------------------------------------------ writing

def add_edition(db, ed_id, work_id, source_id, label, responsible, printed, file, proof, translator_note, method):
    db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status, "
               "translator_note, align_method) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
               (ed_id, work_id, source_id, "eng", "translation", label, responsible, printed, file, proof, translator_note, method))


def add_chunk(db, ed_id, work_id, seq, para, start, end, method, label=None, translator=None, raw=None, printed_at=None, text=None):
    cur = db.execute("INSERT INTO chunk (edition_id, work_id, section_ref, end_ref, seq, para, speaker, label, text, align_method, translator, raw, printed_at) "
                     "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                     (ed_id, work_id, start, end, seq, para, None, label, text, method, translator, raw, printed_at))
    return cur.lastrowid


def add_note(db, source_id, commentator, work_id, ref, ed_id, chunk_id, offset, body, printed_at, anchor, proof):
    db.execute("INSERT INTO note (source_id, commentator, work_id, start_ref, end_ref, edition_id, chunk_id, offset, body, body_html, printed_at, anchor_method, proof_status) "
               "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
               (source_id, commentator, work_id, ref, ref, ed_id, chunk_id, offset, body, html_escape(body), printed_at, anchor, proof))


def html_escape(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def jowett_label(d):
    year = "1888" if d["markers"] == "sections" else "1892" if d["markers"] == "pages" else None
    who = "Knight" if d["translator"] == "Matthew Knight" else "Jowett"
    return f"{who} ({year})" if year else who


def build_jowett(db, work_id, placer):
    d = jowett_data().get(work_id)
    if not d:
        return None
    ed = f"{work_id}.jowett"
    paras = [p for p in d["paras"]]
    stats = {"edition": ed, "paragraphs": len(paras), "words": sum(len(p["text"].split()) for p in paras)}
    if d["markers"] == "sections":
        method = PRINTED
        note = ("Stephanus sections as printed in the transcription: the 1888 edition prints the page numbers; the "
                "transcriber took the section letters from a 1908 printing (Project Gutenberg's note).")
    elif d["markers"] == "pages":
        method = PAGE
        note = "Stephanus pages as printed in the margin of the 1892 edition; the section within each page by tools/align.py."
    else:
        method = COMPUTED
        note = "No Stephanus numbers in the transcription; every section by tools/align.py, against the Loeb English."
    evidence = d.get("translator_evidence") or "Named on the title page."
    printed = d.get("printed") or f"Project Gutenberg ebook #{d['ebook']} ({d['title']}, transcribed by Sue Asscher); the printed edition is not named in the file"
    add_edition(db, ed, work_id, "jowett-gutenberg", jowett_label(d), d["translator"], printed,
                f"sources/jowett-gutenberg/pg{d['ebook']}.txt", "clean source text", evidence, method)
    seq = 0
    commentator = f"{jowett_label(d)}, footnote"
    if d["markers"] == "sections":
        cur = placer.order[0]
        moved = 0
        for k, p in enumerate(paras):
            cuts = [(0, cur)]
            for off, (kind, ref) in sorted(p["markers"]):
                r = placer.nearest(ref)
                moved += r != ref
                cuts.append((off, r))
                cur = r
            pieces = []
            for i, (off, ref) in enumerate(cuts):
                end = cuts[i + 1][0] if i + 1 < len(cuts) else len(p["text"])
                if end > off and p["text"][off:end].strip():
                    pieces.append((off, end, ref))
            ids = []
            for off, end, ref in pieces:
                ids.append((off, end, ref, add_chunk(db, ed, work_id, seq, k, ref, ref, PRINTED, p["label"], d["translator"],
                                                     None, f"Gutenberg #{d['ebook']}", p["text"][off:end].strip())))
                seq += 1
            for at, body in p["notes"]:
                for off, end, ref, cid in ids:
                    if off <= at <= end or (off, end, ref, cid) == ids[-1]:
                        lead = len(p["text"][off:end]) - len(p["text"][off:end].lstrip())
                        add_note(db, "jowett-gutenberg", commentator, work_id, ref, ed, cid, max(0, at - off - lead), body,
                                 f"Gutenberg #{d['ebook']}", "containing section", "clean source text")
                        break
        stats["printed_refs_not_in_burnet"] = moved
        stats["method"] = method
        return stats
    fixed = []
    if d["markers"] == "pages":
        starts = placer.stream_positions(paras)
        for k, p in enumerate(paras):
            for off, (kind, page) in p["markers"]:
                first = next((r for r in placer.order if r.startswith(f"{page}") and re.fullmatch(rf"{page}[a-e]", r)), None)
                if first and first in placer.ref_start:
                    fixed.append((starts[k] + off, placer.ref_start[first]))
        stats["printed_pages"] = len(fixed)
    pieces, info = placer.computed(paras, fixed)
    stats.update({"method": method, "anchors": info["anchors"], "chunks": len(pieces)})
    by_para = {}
    for k, a, b, s, e in pieces:
        p = paras[k]
        text = p["text"][a:b].strip()
        if not text:
            continue
        cid = add_chunk(db, ed, work_id, seq, k, s, e, method, p["label"] if a == 0 else None, d["translator"], None,
                        f"Gutenberg #{d['ebook']}", text)
        seq += 1
        by_para.setdefault(k, []).append((a, b, s, cid))
    for k, p in enumerate(paras):
        for at, body in p.get("notes", []):
            for a, b, s, cid in by_para.get(k, []):
                if a <= at <= b or (a, b, s, cid) == by_para[k][-1]:
                    lead = len(p["text"][a:b]) - len(p["text"][a:b].lstrip())
                    add_note(db, "jowett-gutenberg", commentator, work_id, s, ed, cid, max(0, at - a - lead), body,
                             f"Gutenberg #{d['ebook']}", "alignment" if method != PRINTED else "containing section", "clean source text")
                    break
    return stats


def page_ref(vol, pages):
    pages = [p for p in (pages or []) if p]
    if not pages:
        return f"vol. {vol}"
    return f"vol. {vol}, p. {pages[0]}" + (f"–{pages[-1]}" if pages[-1] != pages[0] else "")


def taylor_commentator(note, translator):
    if note.get("signed") == "Sydenham":
        return "Sydenham (1804), note signed S."
    if note.get("signed") == "Taylor":
        return "Taylor (1804), note signed T."
    if translator == "Thomas Taylor":
        return "Taylor (1804), note"
    return "Taylor or Sydenham (1804), unsigned note"


def taylor_label(translators):
    names = sorted({t.split()[-1] for t in translators}, key=lambda n: n != "Sydenham")
    return " and ".join(names) + " (1804)"


def build_taylor(db, work_id, placer, path):
    d = json.loads(path.read_text(encoding="utf-8"))
    ed = f"{work_id}.taylor1804"
    vol1 = path.parent.name == "vol1"
    if vol1:
        segs = [s for s in d["segments"] if s.get("part") == "translation" and s["kind"] == "paragraph"]
        translators = [d["translator"]]
        method, proof, source = PRINTED, "clean source text (theosophylib.com; not proofread to the letter)", "taylor-1804-vol1-theosophylib"
        note = ("Stephanus sections as inserted by the theosophylib.com editor, checked against Burnet's Greek "
                "(reports/taylor_vol1.md).")
    else:
        segs = [s for s in d["segments"] if s["kind"] == "paragraph"]
        translators = sorted({s["translator"] for s in segs})
        method, proof, source = COMPUTED, "OCR cleaned by rule", "taylor-1804"
        note = "No Stephanus numbers in the 1804 edition; every section by tools/align.py, against the Loeb English."
    evidence = ("Taylor, General Introduction (vol. I, pp. cv-cvi): Sydenham translated the First and Second Alcibiades, "
                "the Greater and Lesser Hippias, the Banquet (except the speech of Alcibiades), the Philebus, the Meno, "
                "the Io and the Rivals; the rest are Taylor's.")
    label = taylor_label(translators)
    add_edition(db, ed, work_id, source, label, " and ".join(translators), d["edition"],
                str(path.relative_to(ROOT)), proof, evidence + (" " + d["gap"] if d.get("gap") else ""), method)
    stats = {"edition": ed, "paragraphs": len(segs), "words": sum(len(s["text"].split()) for s in segs), "method": method}
    seq = 0
    chunk_of = {}   # segment id -> [(start, end, ref, chunk id)]
    if vol1:
        for k, s in enumerate(segs):
            ref = placer.nearest(s["stephanus"]) if s.get("stephanus") else None
            if not ref:
                continue
            cid = add_chunk(db, ed, work_id, seq, s.get("paragraph", k), ref, ref, PRINTED, None, d["translator"], None,
                            "theosophylib.com", s["text"])
            seq += 1
            chunk_of[s["id"]] = [(0, len(s["text"]), ref, cid)]
    else:
        pieces, info = placer.computed(segs)
        stats.update({"anchors": info["anchors"], "chunks": len(pieces)})
        for k, a, b, s0, e in pieces:
            s = segs[k]
            text = s["text"][a:b].strip()
            if not text:
                continue
            printed_at = page_ref(path.parent.name[3:], s.get("pages"))
            cid = add_chunk(db, ed, work_id, seq, k, s0, e, COMPUTED, s.get("label") if a == 0 else None, s["translator"],
                            s.get("raw") if a == 0 else None, printed_at, text)
            seq += 1
            chunk_of.setdefault(s["id"], []).append((a, b, s0, cid))
    n_notes = 0
    trans_of = {s["id"]: s.get("translator", d["translator"]) for s in segs}
    for n in d.get("notes", []):
        if vol1:
            anchors = n.get("anchors") or []
            a = anchors[0] if anchors else {}
            target = chunk_of.get(a.get("in"))
            if not target:
                continue
            _, _, ref, cid = target[0]
            offset = a.get("at") if n.get("type") == "footnote" else None
            commentator = ("Taylor (1804), Additional Note from Proclus" if n.get("type") == "additional"
                           else taylor_commentator(n, d["translator"]))
            add_note(db, source, commentator, work_id, ref, ed, cid, offset, n["text"], f"{d['edition']}",
                     "printed reference" if n.get("type") == "additional" else "containing section", proof)
        else:
            target = chunk_of.get(n.get("in"))
            if not target:
                continue
            a, b, ref, cid = target[-1]
            commentator = taylor_commentator(n, trans_of.get(n["in"], d["translator"]))
            add_note(db, source, commentator, work_id, ref, ed, cid, b - a, n["text"], f"vol. {path.parent.name[3:]}, p. {n.get('page')}",
                     f"alignment ({n.get('anchor', 'same page')})", proof)
        n_notes += 1
    stats["notes"] = n_notes
    return stats


def build_work_translations(db, work_id):
    placer = Placer(db, work_id)
    out = []
    j = build_jowett(db, work_id, placer)
    if j:
        out.append(j)
    t = taylor_files().get(work_id)
    if t:
        out.append(build_taylor(db, work_id, placer, t))
    return out


# ------------------------------------------------------------------ how good is the computed placement?

def _units_truth(paras, starts, truth_of):
    """[(stream position of a unit's middle, true section)] for every unit."""
    out = []
    for k, (p, s) in enumerate(zip(paras, starts)):
        for a, b in align.units(p["text"], 0):
            t = truth_of(k, (a + b) / 2)
            if t:
                out.append((s + (a + b) / 2, t))
    return out


def alignment_check(db):
    """Run the computed placement on translations whose Stephanus numbers are
    printed, hiding the numbers, and count how often it puts each sentence or
    clause in the printed section (or page). Returns rows for the report."""
    rows = []

    def score(work_id, paras, truth, label, basis, level="section"):
        placer = Placer(db, work_id)
        pieces = [(p["text"], None) for p in paras]
        mapper, info = align.align(pieces, placer.ref_pieces)
        n = exact = near = 0
        for pos, true in truth(placer, info["t_starts"]):
            got = mapper(pos)
            if level == "page":
                g, t = int(re.match(r"\d+", got).group()), true
                d = abs(g - t)
            else:
                d = abs(placer.seq[got] - placer.seq[true])
            n += 1
            exact += d == 0
            near += d <= 1
        rows.append({"work": work_id, "translation": label, "basis": basis, "level": level, "units": n,
                     "exact": exact / n if n else 0, "within_one": near / n if n else 0, "anchors": info["anchors"]})

    # Taylor vol. I: the theosophylib.com editor's section numbers.
    for f in sorted((TAYLOR / "vol1").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        w = (d.get("perseus_work") or "").rsplit(".", 1)[-1]
        if not w.startswith("tlg") or not db.execute("SELECT 1 FROM work WHERE id = ? AND imported = 1", (w,)).fetchone():
            continue
        segs = [s for s in d["segments"] if s.get("part") == "translation" and s["kind"] == "paragraph" and s.get("stephanus")]

        def truth(placer, starts, segs=segs):
            return _units_truth(segs, starts, lambda k, mid: placer.nearest(segs[k]["stephanus"]))
        score(w, segs, truth, f"{d['translator']} (1804), {d['title']}", "theosophylib.com section numbers")
    # Jowett: the Republic's printed sections, and vol. II's printed pages.
    for w, d in sorted(jowett_data().items()):
        if d["markers"] == "none" or not db.execute("SELECT 1 FROM work WHERE id = ? AND imported = 1", (w,)).fetchone():
            continue
        paras = d["paras"]
        # The truth at a point: the last printed marker before it.
        marks = []
        pos = 0
        for k, p in enumerate(paras):
            for off, (kind, v) in sorted(p["markers"]):
                marks.append((k, off, v))

        def truth(placer, starts, paras=paras, marks=marks, kind=d["markers"]):
            flat = sorted((starts[k] + off, v) for k, off, v in marks)
            keys = [x[0] for x in flat]
            import bisect

            def at(k, mid):
                i = bisect.bisect_right(keys, starts[k] + mid) - 1
                if i < 0:
                    return None
                v = flat[i][1]
                return placer.nearest(v) if kind == "sections" else v
            return _units_truth(paras, starts, at)
        score(w, paras, truth, f"{jowett_label(d)}, {d['title']}",
              "printed sections (1888; letters from the 1908 printing)" if d["markers"] == "sections" else "printed pages (1892)",
              "section" if d["markers"] == "sections" else "page")
    return rows


def write_alignment_report(rows, path):
    sec = [r for r in rows if r["level"] == "section"]
    pag = [r for r in rows if r["level"] == "page"]

    def total(rs):
        n = sum(r["units"] for r in rs)
        return (sum(r["exact"] * r["units"] for r in rs) / n, sum(r["within_one"] * r["units"] for r in rs) / n, n) if n else (0, 0, 0)
    te, tn, tu = total([r for r in sec if "1804" in r["translation"]])
    je, jn, ju = total([r for r in sec if "1804" not in r["translation"]])
    pe, pn, pu = total(pag)
    lines = ["# Placing translations at Stephanus sections: how often the computation is right", "",
             "Written by `tools/build_db.py` (`translations.alignment_check`). For each translation below the Stephanus numbers "
             "are printed, so the computed placement (`tools/align.py`, against the Loeb English) can be checked: the printed "
             "numbers are hidden, every sentence and clause is placed by computation, and the result is compared with the printed number.", "",
             f"- **Taylor and Sydenham (1804) against the theosophylib.com section numbers:** {te:.1%} of {tu:,} sentences and clauses "
             f"in the right section, {tn:.1%} in it or the next or previous one.",
             f"- **Jowett against his printed sections (Republic):** {je:.1%} right, {jn:.1%} within one section ({ju:,} units). "
             "The section letters of this transcription come from a 1908 printing, not from Burnet, so part of the difference is "
             "where two editions draw the line between sections, not an error of placement.",
             f"- **Jowett against his printed pages (vol. II):** {pe:.1%} on the right Stephanus page, {pn:.1%} within one page ({pu:,} units).", "",
             "Where numbers are printed, the library uses them, not the computation. Computed placements are labelled as such in "
             "the reader, with these figures.", "",
             "| Translation | Checked against | Level | Units | Right | Within one | Anchors |", "|---|---|---|---:|---:|---:|---:|"]
    for r in rows:
        lines.append(f"| {r['translation']} (`{r['work']}`) | {r['basis']} | {r['level']} | {r['units']:,} | {r['exact']:.1%} | {r['within_one']:.1%} | {r['anchors']:,} |")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")
    return {"taylor_exact": te, "taylor_within_one": tn, "jowett_exact": je, "jowett_within_one": jn,
            "jowett_page_exact": pe, "jowett_page_within_one": pn}
