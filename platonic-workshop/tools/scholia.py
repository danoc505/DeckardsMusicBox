#!/usr/bin/env python3
"""Milestone 10: the Greek scholia on Plato, read from Hermann's Appendix
Platonica (Teubner, vol. VI, 1887 printing; the scholia pp. 223-397), into
texts/commentary/<dialogue>/scholia-hermann.json, one file per dialogue.

The scholia are the ancient and Byzantine marginal notes of the manuscripts:
short glosses on words, notes on persons, proverbs and customs, and some
longer notes of Neoplatonic doctrine. Hermann prints them dialogue by
dialogue ('ΕΙΣ ΤΟΝ ΤΙΜΑΙΟΝ.'), each scholion headed by the Stephanus page
(when it changes) and the section letter of the place it is on, then the
words of Plato it is on, closed by a bracket, then the note:

    18 Ο. εὐμνημόνευτον] ὅτι τὸ ἄηθες εὐμνημόνευτον ...

Rules (all here; nothing is guessed from meaning):

1. Each dialogue's scholia are the lines from its heading to the next
   heading (PARTS, read by eye from the OCR: `--check` prints them).
2. Running heads (a short line with a page number and no Greek word in
   small letters, 'ΕΙΣ ΤΟΝ ΕΥΘΥΦΡΟΝ 4. 225') are removed.
3. A paragraph that opens with a section letter (Α Β C D E, as the OCR reads
   them: Α/Ἀ/Ἁ/A, Β/B, Ο/0/6/C, Ὁ/Ὀ/Ὦ/Δ/D, Ε/Ἐ/Ἑ/E), with or without a page
   number before it ('Ρ. 974. Α.'), begins a scholion. So does a paragraph
   that opens with words closed by a bracket (']') with no letter: it is put at the place of the scholion before,
   and its words are looked for from there. (After a letter, ')' is taken
   for the bracket too, as the OCR often reads it.) Any other paragraph
   continues the one before (a scholion broken by a page of the book); a
   paragraph before the first scholion is the argument (ὑπόθεσις) of the
   dialogue, on the whole of it.
4. The page number as the OCR reads it is kept if it is a page of the
   dialogue, not before the page of the scholion before and at most 12
   pages after it. Otherwise the commonest misreadings of the figures are
   tried (8 for 3, 9 for 2, 1 or 7 for each other, 6 for 5), and the first
   reading that meets the same test is taken and recorded. If none does,
   the page stays as it was, and that is recorded.
5. A letter that goes back (a scholion on A after one on D) with no page
   printed means the page went on: the next page is taken, and recorded as
   inferred.
6. The lemma (the words of Plato before the bracket) is kept for the build
   to find in Burnet's Greek (tools/commentary_db.py), as it does Archer-
   Hind's: a scholion whose words are found is placed on them, and one whose
   words are not found, or which has none, at the page and letter Hermann
   prints.

    python3 tools/scholia.py           # writes the files
    python3 tools/scholia.py --check   # the heading line of each dialogue
"""
import json
import re
import sqlite3
import sys
import unicodedata
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ancient  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FILE = "sources/hermann-appendix/platonisdialogi06plat_djvu.txt"
OUT = ROOT / "texts" / "commentary"
DB = ROOT / "data" / "workshop.sqlite"
PRINTED = ("Scholia Platonica, in Platonis Dialogi secundum Thrasylli tetralogias dispositi, ed. C. F. Hermann, "
           "vol. VI (Leipzig: Teubner, 1887; first printed 1853), pp. 223-397")

# (line of the heading 'ΕΙΣ ΤΟΝ ...', work) in the order Hermann prints them; the last line ends the Letters.
PARTS = [(12255, "tlg001"), (12436, "tlg002"), (12604, "tlg003"), (12641, "tlg004"), (12917, "tlg005"),
         (13027, "tlg006"), (13741, "tlg007"), (13843, "tlg008"), (13906, "tlg009"), (13971, "tlg010"),
         (14061, "tlg011"), (14412, "tlg012"), (15112, "tlg013"), (15577, "tlg014"), (15615, "tlg015"),
         (15674, "tlg016"), (15707, "tlg017"), (15749, "tlg018"), (15911, "tlg019"), (15973, "tlg020"),
         (16080, "tlg021"), (16162, "tlg022"), (16212, "tlg023"), (17682, "tlg024"), (17743, "tlg025"),
         (17839, "tlg026"), (17883, "tlg027"), (17917, "tlg028"), (18006, "tlg029"), (18041, "tlg030"),
         (19757, "tlg031"), (20086, "tlg032"), (20142, "tlg033"), (20219, "tlg034"), (21202, "tlg035"),
         (21216, "tlg036"), (21322, None)]

LETTER = {"Α": "a", "Ἀ": "a", "Ἁ": "a", "A": "a", "Β": "b", "B": "b", "Ο": "c", "0": "c", "C": "c", "Ϲ": "c",
          "Ὁ": "d", "Ὀ": "d", "Ὦ": "d", "Δ": "d", "D": "d", "6": "c", "Ε": "e", "Ἐ": "e", "Ἑ": "e", "E": "e"}
HEAD = re.compile(r"^(?:[ῬΡP][.,]\s*)?(?:(\d{1,3})[.,1l]*\s*)?([" + "".join(LETTER) + r"])\s?[.,:;]{1,2}\s+(?=\S)")
SMALL_GREEK = re.compile(r"(?:(?=[Ͱ-Ͽἀ-῿])[^\W\d_A-ZΑ-ΩἈ-ἏἘ-ἝἨ-ἯἸ-ἿὈ-ὍὙ-ὟὨ-Ὧ]){3}")
# The words of Plato a scholion is on: up to a closing bracket, which the OCR often reads as ')'.
LEMMA = re.compile(r"([^\])(\[]{1,80}?)\s?[\])]")
MISREAD = {"8": "3", "9": "2", "1": "7", "7": "1", "6": "5", "3": "8", "2": "9", "5": "6"}


def is_running_head(s):
    s = s.strip()
    return bool(s) and len(s) < 45 and bool(re.search(r"\d", s)) and not SMALL_GREEK.search(unicodedata.normalize("NFC", s))


def page_candidates(tok):
    """The page as read, then each reading with one or two figures read the other way."""
    out = [tok]
    for i, c in enumerate(tok):
        if c in MISREAD:
            out.append(tok[:i] + MISREAD[c] + tok[i + 1:])
    for i, c in enumerate(tok):
        for j in range(i + 1, len(tok)):
            if c in MISREAD and tok[j] in MISREAD:
                out.append(tok[:i] + MISREAD[c] + tok[i + 1:j] + MISREAD[tok[j]] + tok[j + 1:])
    return out


def read_part(lines, a, b, work, pages):
    lo, hi = min(pages), max(pages)
    body = [(i, ln) for i, ln in enumerate(lines[a:b - 1], a + 1) if not is_running_head(ln)]
    paras = ancient.paragraphs(body)
    notes, intro, cur = [], [], None
    page, letter = lo, None
    st = Counter()
    for p in paras:
        text = ancient.join_lines([x[1] for x in p])
        raw = "\n".join(x[1] for x in p)
        if len(re.sub(r"[^Ͱ-Ͽἀ-῿]", "", text)) < 4:
            st["fragments skipped (letter headings, OCR noise)"] += 1
            continue
        m = HEAD.match(text)
        lem = LEMMA.match(text)
        if not m and lem and cur is not None and lem.group(0).endswith("]"):
            # Words of Plato closed by a bracket, with no letter before them (the OCR lost it, or
            # Hermann gives several scholia on one place): a new scholion, at the place of the one before.
            cur = {"kind": "note", "line": p[0][0], "page_steph": cur["page_steph"], "page_how": "no letter printed (or read); at the place of the scholion before",
                   "head_raw": "", "lemma": lem.group(1).strip(" .,"), "lemma_lang": "grc", "text": text[lem.end():].strip(), "raw": raw}
            notes.append(cur)
            st["scholia"] += 1
            st["with a lemma"] += 1
            st["scholia with no letter"] += 1
            continue
        if not m:
            if cur is None:
                intro.append((p[0][0], text, raw))
            else:
                cur["text"] += " " + text
                cur["raw"] += "\n\n" + raw
                st["paragraphs run on"] += 1
            continue
        tok, let = m.group(1), LETTER[m.group(2)]
        how = None
        if tok:
            took = None
            for k, c in enumerate(page_candidates(tok)):
                n = int(c)
                if n in pages and page <= n <= page + 12 and (cur is not None or n <= lo + 12):
                    took = n
                    if k:
                        how = f"page printed {tok}, read as {n}"
                    break
            if took is None:
                how = f"page printed {tok}: not a page due here, so kept at {page}"
                st["page numbers not read"] += 1
            else:
                page = took
                st["pages read" if not how else "pages read through a misreading"] += 1
        elif letter and let < letter and cur is not None:
            nxt = next((q for q in sorted(pages) if q > page), None)
            if nxt is not None:
                page = nxt
                how = f"no page printed; the letter goes back from {letter.upper()} to {let.upper()}, so the next page, {page}, is taken"
                st["pages inferred"] += 1
        letter = let
        rest = text[m.end():]
        lemma = None
        lm = LEMMA.match(rest)
        if lm and rest[lm.end():].strip():   # a scholion that is all lemma is a misread bracket: keep it as text
            lemma, rest = lm.group(1).strip(" .,"), rest[lm.end():].strip()
        cur = {"kind": "note", "line": p[0][0], "page_steph": f"{page}{let}", "page_how": how,
               "head_raw": m.group(0).strip(), "lemma": lemma, "lemma_lang": "grc" if lemma else None,
               "text": rest, "raw": raw}
        notes.append(cur)
        st["scholia"] += 1
        st["with a lemma"] += bool(lemma)
    out = []
    if intro:
        out.append({"kind": "introduction", "line": intro[0][0], "text": "\n\n".join(t for _, t, _ in intro),
                    "raw": "\n\n".join(r for _, _, r in intro)})
    out += notes
    for k, n in enumerate(out, 1):
        n["id"] = f"scholia-hermann.{work}.{k:04d}"
        n["seq"] = k
        n["text"] = unicodedata.normalize("NFC", n["text"]).strip()
        if n.get("lemma"):
            n["lemma"] = unicodedata.normalize("NFC", n["lemma"])
    return out, dict(st)


def main():
    lines = ancient.lines_of(FILE)
    if "--check" in sys.argv:
        for ln, w in PARTS:
            print(f"{w}: {ln}: {lines[ln - 1].strip()!r}")
        return
    db = sqlite3.connect(DB)
    pages = {}
    for w, p in db.execute("SELECT work_id, page FROM section GROUP BY work_id, page"):
        pages.setdefault(w, set()).add(p)
    slugs = dict(db.execute("SELECT id, slug FROM work"))
    folders = {}
    for d in sorted(OUT.glob("*/")):
        for f in sorted(d.glob("*.json"))[:1]:
            folders[json.loads(f.read_text(encoding="utf-8"))["work"]] = d
    total = Counter()
    for (a, w), (b, _) in zip(PARTS, PARTS[1:]):
        notes, st = read_part(lines, a, b, w, pages[w])
        d = folders.get(w) or OUT / slugs[w]
        d.mkdir(parents=True, exist_ok=True)
        doc = {"schema": "platonic-workshop/commentary-v1", "work": w, "author": "Scholia (ancient and Byzantine)", "lang": "grc",
               "printed": PRINTED, "source": {"manifest_id": "hermann-appendix", "file": FILE, "lines": [a, b - 1]},
               "proof_status": "OCR as received", "id": f"scholia-hermann-{w}", "label": "Scholia (Hermann)",
               "title": "Scholia on Plato", "kind": "notes", "ocr_theta": True, "quoter": "The scholion",
               "place_by": "printed",
               "anchoring": ("Hermann heads each scholion with the Stephanus page (when it changes) and the letter of the place, "
                             "then the words of Plato it is on. Those words are found in Burnet's Greek when the library is built, "
                             "near the page printed; a scholion is then on them, at their section. A scholion whose words are not "
                             "found, or which quotes none, is placed at the page and letter Hermann prints, as the OCR reads them "
                             "(tools/scholia.py says how each page was read)."),
               "stats": st, "notes": notes}
        (d / "scholia-hermann.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        total.update(st)
        print(f"{w}: {len(notes)} ({', '.join(f'{k} {v}' for k, v in st.items())})")
    print(dict(total))


if __name__ == "__main__":
    main()
