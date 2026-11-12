#!/usr/bin/env python3
"""Aristotle milestone A3: the English beside the works from First1KGreek (tools/aristotle_f1k.py), from scans.

    python3 tools/aristotle_trans.py            # clean the committed OCR into texts/aristotle/<work>/
    python3 tools/aristotle_trans.py --extract  # re-copy the OCR of the pages read from data/raw (after fetch_sources)

  Hardie and Gaye (1930)  the Oxford Physics; Bekker's pages and columns in the margin, read as for Ross's
                          Metaphysics (aristotle_ocr.clean_ross).
  Stocks (1922)           the Oxford De Caelo, the same way.
  Hicks (1907)            On the Soul, the English facing his Greek; each English page is headed with the Bekker
                          lines it translates (CH. I 402 b 23-403 a 25), read as the column at the top of the page.

Perseus has no Loeb English for these works, so nothing to align against: each column printed (in the margin, or
at the head of Hicks's page) starts a piece there; where the scan misses columns between two it has, the text
between is shared out among them in proportion to its length, cut at the end of a sentence, and marked computed (≈).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402
from aristotle_ocr import _median, page_layout, split_margin  # noqa: E402
import translations  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "texts" / "aristotle"
APPARATUS = re.compile(r"\b(codd|om\.|coni|censet|Bek|Trend|Torst|Biehl|Rodier|Philop|Simpl|Soph|Them|Alex|Susemihl|scripsi|vulg\w*|sqq|transl)\b")
CUT_IN = 720         # Hicks's side-notes end left of this, on the scan's scale
COL = re.compile(r"(\d{3})\s?([aAbBὉὃδ68α])")

# work id -> the translations made for it: (source, edition suffix, label, translator, printed, file name, leaves, cleaner)
TRANSLATIONS = {
    "ar031": [("ia-hardie-gaye-physics-1930", "hardie1930", "Hardie and Gaye (1930)", "R. P. Hardie and R. K. Gaye",
               "R. P. Hardie and R. K. Gaye, Physica, The Works of Aristotle translated into English, vol. II (Oxford: Clarendon Press, 1930)",
               "hardie-gaye-1930", (21, 270), "oxford", r"BOOK|PHYSICA|^\W*\d")],
    "ar005": [("ia-stocks-de-caelo-1922", "stocks1922", "Stocks (1922)", "J. L. Stocks",
               "J. L. Stocks, De Caelo, The Works of Aristotle translated into English (Oxford: Clarendon Press, 1922)",
               "stocks-1922", (13, 148), "oxford", r"BOOK|CAELO|CABLO|^\W*\d")],
    "ar002": [("ia-hicks-de-anima-1907", "hicks1907", "Hicks (1907)", "R. D. Hicks",
               "R. D. Hicks, Aristotle De Anima, with translation, introduction and notes (Cambridge: University Press, 1907)",
               "hicks-1907", (91, 258), "hicks", None)],
}
# The Organon (milestone A4): the Oxford translation, cleaned by tools/aristotle_organon.py into oxford-1928.json.
_OX = "The Works of Aristotle translated into English, vol. I (Oxford: Clarendon Press, 1928)"
for _wid, _tr, _label, _title in (("ar006", "E. M. Edghill", "Edghill (1928)", "Categoriae"),
                                   ("ar017", "E. M. Edghill", "Edghill (1928)", "De Interpretatione"),
                                   ("ar001", "A. J. Jenkinson", "Jenkinson (1928)", "Analytica Priora"),
                                   ("ar001p", "G. R. G. Mure", "Mure (1928)", "Analytica Posteriora"),
                                   ("ar044", "W. A. Pickard-Cambridge", "Pickard-Cambridge (1928)", "Topica"),
                                   ("ar040", "W. A. Pickard-Cambridge", "Pickard-Cambridge (1928)", "De Sophisticis Elenchis")):
    TRANSLATIONS[_wid] = [("ia-oxford-organon-1928", "oxford1928", _label, _tr, f"{_tr}, {_title}, {_OX}", "oxford-1928",
                           None, "organon", None)]
# Milestone A4c: Owen's Organon (1853), cleaned by tools/aristotle_owen.py into owen-1853.json, placed by the Oxford's columns.
for _wid, _vol in (("ar006", "I"), ("ar017", "I"), ("ar001", "I"), ("ar001p", "I"), ("ar044", "II"), ("ar040", "II")):
    TRANSLATIONS[_wid].append(("ia-owen-organon-1853-v1" if _vol == "I" else "ia-owen-organon-1853", "owen1853", "Owen (1853)",
                               "Octavius Freire Owen", "Octavius Freire Owen, The Organon, or Logical Treatises, of Aristotle, with the "
                               f"Introduction of Porphyry, vol. {_vol} (London: Henry G. Bohn, 1853)", "owen-1853", None, "owen", None))
# Milestone A8: Taylor's own Organon (1812), cleaned by tools/aristotle_taylor.py into taylor-1812.json, placed as Owen's is.
for _wid in ("ar006", "ar017", "ar001"):
    TRANSLATIONS[_wid].append(("ia-taylor-organon-1812", "taylor1812", "Taylor (1812)", "Thomas Taylor",
                               "Thomas Taylor, The Works of Aristotle, translated from the Greek, with copious elucidations from the best of "
                               "his Greek commentators, vol. I (London, 1812)", "taylor-1812", None, "taylor", None))


def greek_share(t):
    g = sum(1 for c in t if "Ͱ" <= c <= "Ͽ" or "ἀ" <= c <= "῿")
    return g / max(1, sum(c.isalpha() for c in t))


def head_column(t, order):
    """The first Bekker column named in a page head ('CH. I 402 Ὁ 23—403 a 25 7' -> '402b'), if it is a column of the work."""
    m = COL.search(t.replace(" ", " "))
    if not m:
        return None
    letter = "a" if m.group(2) in "aAα8" else "b"
    c = f"{int(m.group(1))}{letter}"
    return c if c in order else None


def clean_hicks(order, leaves, vocab):
    pages = aristotle_ocr.scan_pages("ia-hicks-de-anima-1907")
    paras, cur = [], None
    stats = {"leaves": 0, "heads_read": 0, "apparatus_lines_left_out": 0, "side_note_lines_left_out": 0}
    last_col = None
    prev = None
    for lf in sorted(pages):
        if not leaves[0] <= lf <= leaves[1]:
            continue
        lines = sorted(pages[lf], key=lambda l: l[0])
        if len(lines) < 5:
            continue
        body_text = " ".join(w[0] for l in lines[1:12] for w in l[2])
        if greek_share(body_text) > 0.1:
            continue                     # Hicks's Greek, on the facing page
        stats["leaves"] += 1
        left, right, height = page_layout(lines)
        head = " ".join(w[0] for w in lines[0][2])
        col = head_column(head, order)
        if col and (last_col is None or order.index(col) >= order.index(last_col)):
            stats["heads_read"] += 1
        else:
            col = None
        lines = lines[1:]
        # The apparatus of the facing Greek runs on at the foot, after a gap: Latin and Greek, readings parted by '||'.
        pitch = _median([b[0] - a[0] for a, b in zip(lines[:8], lines[1:9])], 106)
        cut = len(lines)
        for i in range(1, len(lines)):
            near = " ".join(w[0] for l in lines[i:i + 3] for w in l[2])
            closer = _median([b[0] - a[0] for a, b in zip(lines[i:i + 4], lines[i + 1:i + 5])], pitch) < 0.85 * pitch
            if "||" in " ".join(w[0] for w in lines[i][2]) or \
                    (lines[i][0] - lines[i - 1][0] > 1.15 * pitch or closer) and len(APPARATUS.findall(near)) >= 1 and i > 2:
                cut = i
                break
        # Hicks's side-notes are cut into the text block at the left: a line of the note alone, set between two lines
        # of text, or the note's words before a wide gap at the start of a line of text.
        def gloss_only(i):
            ws = lines[i][2]
            return i > 0 and lines[i][0] - lines[i - 1][0] < 0.8 * pitch and ws and \
                max(w[2] for w in ws if re.search(r"\w", w[0]) or w is ws[0]) < CUT_IN

        def split_at(i):
            ws = lines[i][2]
            for j in range(1, min(4, len(ws))):
                if ws[j - 1][2] < CUT_IN and CUT_IN - 10 <= ws[j][1] <= CUT_IN + 60 and ws[j][1] - ws[j - 1][2] >= 100:
                    return j
            return 0

        shape = ["gloss" if gloss_only(i) else ("cut" if split_at(i) else "") for i in range(cut)]
        kept = []
        for i in range(cut):
            y0, y1, ws = lines[i]
            if shape[i] == "gloss":
                stats["side_note_lines_left_out"] += 1
                continue
            # A side-note runs over two lines or more: a line shaped so alone is a sentence's gap, not a note.
            if shape[i] == "cut" and any(0 <= k < cut and shape[k] for k in (i - 2, i - 1, i + 1, i + 2)):
                ws = ws[split_at(i):]
            kept.append((y0, y1, ws))
        stats["apparatus_lines_left_out"] += len(lines) - cut
        first = True
        for y0, y1, ws in kept:
            margin, text = split_margin(ws, left, right)
            t = re.sub(r"\bgud\b", "qua", " ".join(w[0] for w in text).strip())   # Hicks's italic qua, read so
            if not t:
                continue
            if re.fullmatch(r"\W*(BOOK|Βοοκ|ΒΟΟΚ|DE ANIMA)\W*.*", t) and len(t) < 30 or re.fullmatch(r"[\d\W]{1,8}", t):
                continue                 # the book's title, a signature mark
            # A paragraph's first line is indented, and the line before it ends a sentence.
            indent = text[0][1] > left + 60 and (prev is None or re.search(r"[.?!:”’\"]\W?$", prev))
            if cur is None or indent:
                cur = {"lines": [], "raw": [], "leaf": lf, "marks": []}
                paras.append(cur)
            if first and col:
                cur["marks"].append((len(cur["lines"]), col))
                last_col = col
            first = False
            cur["lines"].append(t)
            cur["raw"].append(" ".join(w[0] for w in ws))
            prev = t
    out = []
    for p in paras:
        marks = []
        for li, c in p["marks"]:
            prefix = aristotle_ocr.join_lines(p["lines"][:li], vocab)
            marks.append([len(prefix) + (1 if prefix else 0), c])
        out.append({"text": aristotle_ocr.join_lines(p["lines"], vocab), "raw": "\n".join(p["raw"]), "leaf": p["leaf"], "marks": marks})
    return out, [], stats


def clean(work_id, order):
    """Every translation of one work, cleaned into texts/aristotle/<slug>/<file>.json."""
    import aristotle_f1k
    w = aristotle_f1k.WORK_BY_ID[work_id]
    vocab = aristotle_ocr.english_vocab()
    for src, suffix, label, tr, printed, fname, leaves, kind, head in TRANSLATIONS.get(work_id, []):
        if kind in ("organon", "owen", "taylor"):
            continue                 # cleaned by tools/aristotle_organon.py, tools/aristotle_owen.py and tools/aristotle_taylor.py
        if kind == "oxford":
            paras, notes, stats = aristotle_ocr.clean_ross(vocab, src, order, head, leaves)
        else:
            paras, notes, stats = clean_hicks(order, leaves, vocab)
        stats["marks_unread"] = sorted(set(stats.get("marks_unread", [])), key=lambda r: (int(r[:-1]), r[-1]))
        dest = TEXTS / w["slug"] / f"{fname}.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps({"source": src, "translator": tr, "proof_status": "OCR cleaned by rule", "stats": stats,
                                    "paragraphs": paras, "notes": notes}, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
        print(f"{label}: {len(paras)} paragraphs, {len(notes)} notes, {stats.get('marks_read', stats.get('heads_read'))} columns printed "
              f"-> {dest.relative_to(ROOT)}")


def sentence_cut(text, at):
    """The end of the sentence nearest to offset at (a full stop, colon or question mark and a space)."""
    ends = [m.end() for m in re.finditer(r"[.;:?!][’”')]?\s", text)]
    if not ends:
        return at
    return min(ends, key=lambda e: abs(e - at))


def place(paras, order):
    """[(para index, start, end, column, method)]: each printed column starts a piece; the columns the scan misses
    between two it has are shared out over the text between them by length, cut at a sentence's end. A mark may carry
    its own method ([offset, column, 'computed']) when it was itself placed by rule."""
    idx = {c: i for i, c in enumerate(order)}
    starts, pos = [], 0
    for p in paras:
        starts.append(pos)
        pos += len(p["text"]) + 1
    total = pos
    marks = []
    for k, p in enumerate(paras):
        for m in p["marks"]:
            off, c = m[0], m[1]
            how = m[2] if len(m) > 2 else "printed"      # a column placed where its line numbers start again: computed
            if c in idx and (not marks or idx[c] > marks[-1][1]):
                marks.append((starts[k] + off, idx[c], how))
    if not marks:
        return []
    cuts = {}       # stream position -> (column index, method)
    if marks[0][0] > 0:
        cuts[0] = (marks[0][1], translations.COMPUTED)
    for (p0, c0, how), nxt in zip(marks, marks[1:] + [(total, len(order), None)]):
        cuts[p0] = (c0, how)
        p1, c1, _ = nxt
        n = c1 - c0
        for t in range(1, n):
            at = p0 + (p1 - p0) * t // n
            k = max(i for i, s in enumerate(starts) if s <= at)
            off = sentence_cut(paras[k]["text"], at - starts[k])
            spot = starts[k] + off
            if p0 < spot < p1 and spot not in cuts:
                cuts[spot] = (c0 + t, translations.COMPUTED)
    out = []
    keys = sorted(cuts)
    cur = cuts[keys[0]]
    for k, p in enumerate(paras):
        a0, b0 = starts[k], starts[k] + len(p["text"])
        inside = [x for x in keys if a0 < x < b0]
        if a0 in cuts:
            cur = cuts[a0]
        bounds = [a0] + inside + [b0]
        for a, b in zip(bounds, bounds[1:]):
            if a in cuts:
                cur = cuts[a]
            method = cur[1]
            if p["text"][a - a0:b - a0].strip():
                out.append((k, a - a0, b - a0, order[cur[0]], method))
    return out


def build_for(db, work):
    """The translations of one work into the library (after its Greek): [figures]."""
    from aristotle import taylor_commentator
    order = [r[0] for r in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work["id"],))]
    out = []
    for src, suffix, label, tr, printed, fname, leaves, kind, head in TRANSLATIONS.get(work["id"], []):
        path = TEXTS / work["slug"] / f"{fname}.json"
        if not path.exists():
            continue
        d = json.loads(path.read_text(encoding="utf-8"))
        wid = work["id"]
        ed = f"{wid}.{suffix}"
        pieces = place(d["paragraphs"], order)
        first_piece = {}
        for x in pieces:
            first_piece.setdefault(x[3], x[4])
        n_printed = sum(1 for m in first_piece.values() if m == "printed")     # columns begun where the scan prints them
        how = (f"{tr.split()[-1]} prints no Bekker columns: they are carried over from the Oxford translation (1928), chapter by chapter, "
               "each at the same proportion of the chapter as in the Oxford" if kind in ("owen", "taylor") else
               "Hicks heads each page of his English with the Bekker lines it translates; the column at the top of each page is "
               "read from the scan as a fixed point" if kind == "hicks" else
               "Bekker's line numbers and columns are printed in the margin; each column read from the scan is a fixed point, and "
               "where the line numbers start again (35 ... 5) with no column read, or the running head names a later page, the "
               "column is placed there (≈)" if kind == "organon" else
               "Bekker's pages and columns are printed in the margin; each one read from the scan is a fixed point")
        note = (f"{how}: every column is so placed (≈). Owen's footnotes, and the side-notes in his margin that the scan could "
                "read, are kept as notes; the text is not proofread." if kind == "owen" else
                f"{how}: every column is so placed (≈). Taylor's notes, from Simplicius, Ammonius, Philoponus and the other Greek "
                "commentators, are kept as notes; the text is not proofread." if kind == "taylor" else
                f"{how} ({n_printed} of {len(order)} columns). Between two fixed points the columns the scan misses are shared "
                "out over the text by its length, cut at the end of a sentence (≈).")
        translations.add_edition(db, ed, wid, src, label, tr, printed, str(path.relative_to(ROOT)), "OCR cleaned by rule",
                                 note, "computed" if kind in ("owen", "taylor") else "printed")
        chunk_of = {}
        for seq, (k, a, b, col, method) in enumerate(pieces):
            p = d["paragraphs"][k]
            cid = translations.add_chunk(db, ed, wid, seq, k, col, col, method, None, tr, p["raw"] if a == 0 else None,
                                         f"scan image {p['leaf']}", p["text"][a:b].strip())
            chunk_of.setdefault(k, []).append((col, cid))
        n_notes = 0
        for n in d["notes"]:
            target = chunk_of.get(n["para"])
            if not target:
                continue
            col, cid = target[-1]
            translations.add_note(db, src, taylor_commentator(n["text"], label) if kind == "taylor" else label, wid, col, ed, cid,
                                  None, n["text"], f"scan image {n['leaf']}",
                                  "the page it is printed on", "OCR cleaned by rule")
            n_notes += 1
        out.append({"edition": ed, "paragraphs": len(d["paragraphs"]), "chunks": len(pieces), "printed_columns": n_printed,
                    "chunks_at_a_printed_column": n_printed, "notes": n_notes, "anchors": 0,
                    "words": sum(len(p["text"].split()) for p in d["paragraphs"]), "method": "printed and computed"})
    return out


def main():
    import aristotle_f1k
    if "--extract" in sys.argv:
        for ts in TRANSLATIONS.values():
            for src, *_, leaves, kind, head in ts:
                if leaves:
                    aristotle_ocr.write_extract(src, range(leaves[0], leaves[1] + 1))
        return
    for w in aristotle_f1k.WORKS:
        if not any(t[7] not in ("organon", "owen", "taylor") for t in TRANSLATIONS.get(w["id"], [])):
            continue
        _, cols = aristotle_f1k.glaux_words(w)
        if not cols:
            paras, _ = aristotle_f1k.read_tei(w)
            _, cols, _, _ = aristotle_f1k.sections_of(paras, [], None)
        clean(w["id"], cols)


if __name__ == "__main__":
    main()
