#!/usr/bin/env python3
"""Aristotle milestone A4b: Porphyry's Introduction (the Isagoge) in Octavius Freire Owen's English (London: Bohn, 1853).

    python3 tools/aristotle_porphyry.py            # clean the committed OCR into texts/aristotle/porphyry/owen-1853.json

The Platonists read Porphyry's Introduction first of all, before the Categories: the five words the Categories takes
for granted (genus, species, difference, property, accident). Owen prints it at the end of the second volume of his
Organon (Bohn's Classical Library, 1853), pp. 609-633. The source is the Internet Archive's scan of that volume
(organonorlogica04porpgoog, pinned by sha256 in sources/manifest.json); the OCR of leaves 264-288, with the place of
every word, is committed in sources/aristotle/ocr/ia-owen-organon-1853.json.gz, so the build needs no download.

Cleaned by rule, not proofread; every paragraph keeps its OCR as received beside the reading:
  - the running head (with the page number) and the printer's signature at the foot dropped;
  - Owen's side-notes (a summary of the argument, in small type cut into the outer margin: the right of a recto,
    the left of a verso) set apart from the text, as notes "in the margin" beside the paragraph they stand by;
  - his footnotes (smaller type at the foot, after a gap) set apart, each matched to the note mark in the text
    in order on the page where the scan read one, and otherwise to the page;
  - the chapter headings ("CHAP. II.--Of the Nature of Genus and Species") read as printed, numbered in order.
The Greek (Busse's edition, CAG IV.1, 1887) is on the Neoplatonists' shelf, from First1KGreek (tools/neoplatonists.py).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import aristotle_ocr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = "ia-owen-organon-1853"
OUT = ROOT / "texts" / "aristotle" / "porphyry" / "owen-1853.json"
LEAVES = range(264, 289)
from aristotle_owen import (Page, VOLUMES, note_body, plain_corrector, read, readable, reading)  # noqa: E402


def clean(corrector):
    """Owen's pages read by the rules of tools/aristotle_owen.py, from the title on leaf 264 to the end on leaf 288."""
    v = VOLUMES[SRC]
    stats = {"leaves": 0, "paragraphs": 0, "notes": 0, "side_notes": 0, "side_notes_unread": 0, "notes_continued": 0,
             "marks_matched": 0, "chapters": 0}
    paras, notes, sides, stats = read(aristotle_ocr.scan_pages(SRC), Page(v["scale"], v["recto_even"]), list(LEAVES),
                                      start=r"INTRODUCTION\s+OF\s+PORPHYRY", title="The Introduction of Porphyry", stats=stats)
    del stats["books"]
    return paras, notes, sides, stats


def to_text(paras, notes, sides, stats, corrector):
    tid = "owen1853.isagoge"
    segs, out_notes, index = [], [], {}
    k = 0
    for p in paras:
        if p["kind"] != "heading" and sum(c.isalpha() for c in " ".join(p["lines"])) < 8:
            continue
        k += 1
        text = p["lines"][0] if p["kind"] == "heading" else reading(p["lines"], corrector)
        seg = {"id": f"{tid}.p{k:05d}", "kind": p["kind"], "part": "isagoge", "page_1804": str(p["leaf"]), "paragraph": k,
               "book": None, "chapter": p["chapter"], "text": text, "raw": "\n".join(p["raw"]), "notes": []}
        if p["kind"] == "heading":
            seg["heading"] = text
        index[id(p)] = len(segs)
        segs.append(seg)

    def at_line(i, n_lines, col=None):
        """The place in the reading of a paragraph's first n lines (and col characters into the next)."""
        p = paras_by_seg[i]
        if n_lines <= 0:
            return 0
        before = reading(p["lines"][:n_lines - 1], corrector) if n_lines > 1 else ""
        if col is not None:
            part = reading([p["lines"][n_lines - 1][:col]], corrector)
            at = len(before) + (1 if before else 0) + len(part)
        else:
            at = len(reading(p["lines"][:n_lines], corrector))
        return min(at, len(segs[i]["text"]))

    paras_by_seg = {index[id(p)]: p for p in paras if id(p) in index}
    for n in notes:
        if n["target"]:
            para, line_no, col = n["target"]
        else:
            para, line_no, col = n["fallback"], None, None
        i = index.get(id(para), len(segs) - 1)
        raw, body = note_body(n["lines"], corrector)
        at = at_line(i, line_no, col) if line_no else len(segs[i]["text"])
        nid = f"{tid}.n{len(out_notes) + 1:04d}"
        out_notes.append({"id": nid, "type": "footnote", "printed_number": None, "signed": None, "text": body, "raw": raw,
                          "leaf": n["leaf"], "anchors": [{"in": segs[i]["id"], "at": at}],
                          "anchor": "the note mark in the text, in order on the page" if n["target"] else "the page it is printed on"})
        segs[i]["notes"].append({"note": nid, "at": at})
    for s in sides:
        if s["para"] is None or id(s["para"]) not in index:
            continue
        i = index[id(s["para"])]
        raw = " ".join(s["lines"])
        body = re.sub(r"(\w)- (\w)", lambda m: m.group(1) + m.group(2), raw)
        body = corrector.text(re.sub(r"\s+", " ", body)).strip()
        if sum(c.isalpha() for c in body) < 4 or not readable(body, corrector.v):
            stats["side_notes_unread"] += 1
            continue
        at = at_line(i, s["k"])
        nid = f"{tid}.n{len(out_notes) + 1:04d}"
        out_notes.append({"id": nid, "type": "sidenote", "printed_number": None, "signed": None, "text": body, "raw": raw,
                          "leaf": s["leaf"], "anchors": [{"in": segs[i]["id"], "at": at}],
                          "anchor": "the line of the text it is printed beside"})
        segs[i]["notes"].append({"note": nid, "at": at})
    for s in segs:
        s["notes"].sort(key=lambda x: x["at"])
    stats["paragraphs"] = sum(s["kind"] == "paragraph" for s in segs)
    stats["notes"] = sum(n["type"] == "footnote" for n in out_notes)
    stats["side_notes"] = sum(n["type"] == "sidenote" for n in out_notes)
    return {"schema": "platonic-workshop/text-v1", "id": tid,
            "title": "Porphyry's Introduction (Isagoge)", "author": "Porphyry", "translator": "Octavius Freire Owen",
            "edition": "The Organon, or Logical Treatises, of Aristotle, with the Introduction of Porphyry, literally translated, with notes, "
                       "by Octavius Freire Owen, vol. II (London: Henry G. Bohn, 1853), pp. 609-633",
            "source": {"manifest_id": SRC, "name": "the Internet Archive's scan",
                       "url": "https://archive.org/details/organonorlogica04porpgoog", "file": f"sources/aristotle/ocr/{SRC}.json.gz"},
            "page_label": "Scan images", "proof_status": "OCR cleaned by rule, not proofread",
            "reading_note": "Owen's footnotes are given below the paragraph they are marked in; his side-notes, a summary of the argument "
                            "printed in the margin, are given there too, marked \"margin\". Greek in his notes is read by the scan and often garbled.",
            "parts": [{"part": "isagoge", "label": "The Introduction of Porphyry", "leaves": [LEAVES[0], LEAVES[-1]]}],
            "stats": stats, "segments": segs, "notes": out_notes}


def main():
    if "--extract" in sys.argv:
        raise SystemExit("the OCR of Owen's second volume, with these leaves, is copied by: python3 tools/aristotle_owen.py --extract")
    corrector = plain_corrector()
    paras, notes, sides, stats = clean(corrector)
    d = to_text(paras, notes, sides, stats, corrector)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(d, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    s = d["stats"]
    print(f"Porphyry's Introduction (Owen, 1853): {s['chapters']} chapters, {s['paragraphs']} paragraphs, {s['notes']} footnotes "
          f"({s['marks_matched']} by their mark), {s['side_notes']} side-notes ({s['side_notes_unread']} left out as unreadable) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
