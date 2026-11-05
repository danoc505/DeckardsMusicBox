#!/usr/bin/env python3
"""Read Thomas Taylor's Introductions to the dialogues of vols. II to V of the
Works of Plato (1804) into texts/commentary/<dialogue>/ (milestone 9).

Taylor prefaces most dialogues with an Introduction on the dialogue as a
whole: its scope, its parts, and how the Platonists read it, usually after
Proclus, Olympiodorus or Hermias. Each Introduction is read exactly as the
Timaeus Introduction was in milestone 7 (tools/commentary.py): cut out of the
volume, cleaned by rule (tools/taylor_ocr.py: long s, ligatures, running
heads, footnotes), one note on the whole dialogue per paragraph, the raw OCR
kept beside each.

Where an Introduction is: it begins at the line 'INTRODUCTION' (not a running
head, which carries a page number) after the end of the work before it in the
volume, and ends where the dialogue begins (sources/taylor-1804/dialogues.json).
A dialogue with no such line between has no Introduction in the 1804 printing
(the Laws, Critias, Apology, Crito, Protagoras, Laches, Menexenus, Clitophon,
Letters). The Timaeus Introduction was read in milestone 7 and is left as it is.

    python3 tools/taylor_intros.py           # writes the files and prints what it found
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import commentary  # noqa: E402
import taylor_ocr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "texts" / "commentary"
HEADING = re.compile(r"^\s*INTRODUCTION\.?\s*(TO\s*THE.*)?$")
RUNNING_HEAD = re.compile(r"^\s*\S{1,4}\s+INTRODUCTION")
VOLUMES = {2: "II", 3: "III", 4: "IV", 5: "V"}


def ranges():
    cfg = json.loads((ROOT / "sources" / "taylor-1804" / "dialogues.json").read_text(encoding="utf-8"))["dialogues"]
    by_vol = {}
    for d in cfg:
        by_vol.setdefault(d["vol"], []).append(d)
    out = []
    for vol, ds in sorted(by_vol.items()):
        lines = taylor_ocr.volume_lines(vol)
        prev = 0
        for d in sorted(ds, key=lambda d: d["start"]):
            hits = [i + 1 for i in range(prev, d["start"] - 1) if HEADING.match(lines[i]) and not RUNNING_HEAD.match(lines[i])]
            if hits and d["work"] != "tlg031":
                out.append({"vol": vol, "work": d["work"], "slug": d["slug"], "dialogue": d["title"],
                            "start": hits[0], "end": d["start"], "translator": "Thomas Taylor", "prose": True})
            prev = d["end"]
    return out


def read(r, corrector):
    cid = f"taylor1804-intro-{r['slug']}"
    segs, fnotes, stats = taylor_ocr.clean_work(r, corrector)
    paras = [s for s in segs if s["kind"] == "paragraph"]
    # The heading itself ('INTRODUCTION TO THE PHAEDRUS.') and the dialogue's title page are not notes.
    paras = [s for s in paras if not (s["text"].upper() == s["text"] and len(s["text"]) < 90)]
    notes = []
    for k, s in enumerate(paras, 1):
        notes.append({"id": f"{cid}.{k:03d}", "kind": "introduction", "seq": k, "page": s["pages"][0],
                      "pages": s["pages"], "line": s["line"], "text": s["text"], "raw": s["raw"]})
    for k, n in enumerate(fnotes, 1):
        on = next((x for x in notes if x["line"] == next((s["line"] for s in segs if s["id"] == n.get("in")), None)), None)
        notes.append({"id": f"{cid}.f{k:02d}", "kind": "footnote", "seq": len(paras) + k, "page": n["page"],
                      "line": n["line"], "on": on["id"] if on else None, "text": n["text"], "raw": n["raw"]})
    pages = [n["page"] for n in notes if n.get("page")]
    title = r["dialogue"][4:] if r["dialogue"].startswith("The ") else r["dialogue"]
    return {
        "schema": commentary.SCHEMA, "id": cid, "work": r["work"], "author": "Thomas Taylor",
        "label": "Taylor, Introduction (1804)", "title": f"Introduction to the {title}",
        "printed": f"The Works of Plato, translated by Floyer Sydenham and Thomas Taylor, vol. {VOLUMES[r['vol']]} (London, 1804)"
                   + (f", pp. {min(pages)}-{max(pages)}" if pages else ""),
        "kind": "introduction", "lang": "eng",
        "source": {"manifest_id": "taylor-1804", "file": f"sources/taylor-1804/Taylor_Sydenham_v{r['vol']}_djvu.txt",
                   "lines": [r["start"], r["end"]]},
        "proof_status": "OCR cleaned by rule",
        "anchoring": f"An introduction to the whole dialogue: each paragraph is a note on the whole {title}. "
                     "Taylor's footnotes to it are kept with the paragraph they are printed under.",
        "notes": notes, "stats": dict(stats),
    }


def main():
    corrector = commentary.taylor_corrector()
    for r in ranges():
        doc = read(r, corrector)
        dest = OUT / r["slug"]
        dest.mkdir(parents=True, exist_ok=True)
        doc["stats"] = dict(doc["stats"], notes=len(doc["notes"]))
        (dest / f"{doc['id']}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        words = sum(len(n["text"].split()) for n in doc["notes"])
        print(f"{doc['id']:<36} vol. {r['vol']} lines {r['start']}-{r['end']}: {len(doc['notes']):>4} notes {words:>7} words")


if __name__ == "__main__":
    main()
