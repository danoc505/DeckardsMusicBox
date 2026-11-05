#!/usr/bin/env python3
"""Read Jowett's translations (Project Gutenberg plain text) into paragraphs.

Three layouts, all listed in sources/jowett-gutenberg/ebooks.json:

- 'sections' (ebook 55201, the Republic, third edition 1888): the
  transcriber prints the Stephanus numbers of the right-hand margin in the
  text, *327B*, the first one as *Ed. Steph. 327*. Footnotes are
  [Footnote n: ...] blocks under their paragraph, marked [n] in the text.
- 'pages' (ebook 76464, the Dialogues vol. II, third edition 1892): each
  dialogue's translation follows its Introduction; Stephanus page numbers
  stand at the right-hand end of the line on which the page begins
  ('... dearth    71', the first as '=Steph.= 70'). Footnotes are listed
  under FOOTNOTES at the end of each dialogue, marked [n] in the text.
  Speakers are _Soc._, _Men._.
- 'none' (the older Gutenberg ebooks, transcribed by Sue Asscher): the
  translation begins at the last 'PERSONS OF THE DIALOGUE' line, speakers
  are SOCRATES:, and no numbers are printed.

Sidenotes (Jowett's marginal analysis) and page numbers of the printed book
({2}) are taken out of the running text. Everything else is kept as printed.

    python3 tools/jowett.py            # summary of every ebook
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "jowett-gutenberg"

SIDENOTE = re.compile(r"\[Sidenote:")
PAGE_NO = re.compile(r"\s*\{[0-9ivxlc]+\}\s*")
SECTION_MARK = re.compile(r"\s*\*(?:Ed\. Steph\. )?(\d{1,3})([A-E]?)\*\s*")
PAGE_MARK = re.compile(r"\s{3,}(?:=Steph\.=\s*)?-?(\d{1,3})\s*$")
FOOTREF = re.compile(r"\[(\d{1,3})\]")
SPEAKER_CAPS = re.compile(r"^([A-Z][A-Z .']{1,40}?):\s+")
SPEAKER_ITAL = re.compile(r"^_([A-Z][A-Za-z. ]{1,30}?)\.?_\.?\s+")


def ebooks():
    return json.loads((SRC / "ebooks.json").read_text(encoding="utf-8"))


def read(n):
    t = (SRC / f"pg{n}.txt").read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    a = re.search(r"\*\*\* START OF TH(?:E|IS) PROJECT GUTENBERG EBOOK[^\n]*\n", t)
    b = re.search(r"\*\*\* END OF TH(?:E|IS) PROJECT GUTENBERG EBOOK", t)
    return t[a.end() if a else 0: b.start() if b else len(t)]


def strip_sidenotes(text):
    """Remove [Sidenote: ...] blocks (they may span lines and hold brackets)."""
    out, i = [], 0
    while True:
        m = SIDENOTE.search(text, i)
        if not m:
            out.append(text[i:])
            break
        out.append(text[i:m.start()])
        depth, k = 0, m.start()
        while k < len(text):
            if text[k] == "[":
                depth += 1
            elif text[k] == "]":
                depth -= 1
                if depth == 0:
                    break
            k += 1
        i = k + 1
    return "".join(out)


def blocks(text):
    return [b for b in re.split(r"\n\s*\n", text) if b.strip()]


def para(text, layout):
    """One printed paragraph -> (label, clean text, markers [(offset, value)], footrefs [(offset, n)])."""
    markers, refs = [], []
    lines = text.split("\n")
    if layout == "pages":
        # A page number at the end of a line: the page begins on that line.
        joined, pos = [], 0
        for ln in lines:
            m = PAGE_MARK.search(ln)
            s = ln.strip() if not m else ln[:m.start()].strip()
            if m:
                markers.append((pos, ("page", int(m.group(1)))))
            joined.append(s)
            pos += len(s) + 1
        s = " ".join(joined)
    else:
        s = " ".join(ln.strip() for ln in lines)
    s = PAGE_NO.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    label = None
    m = SPEAKER_ITAL.match(s) if layout == "pages" else SPEAKER_CAPS.match(s)
    if m and (layout == "pages" or m.group(1).upper() == m.group(1)):
        label = m.group(1).strip()
        cut = m.end()
        s = s[cut:]
        markers = [(max(0, o - cut), v) for o, v in markers]
    if layout == "sections":
        out, pos = [], 0
        for m in SECTION_MARK.finditer(s):
            out.append(s[pos:m.start()])
            here = len(" ".join(out).strip()) if out else 0
            here = len("".join(out))
            markers.append((here, ("section", f"{m.group(1)}{(m.group(2) or 'a').lower()}")))
            out.append(" ")
            pos = m.end()
        out.append(s[pos:])
        s = "".join(out)
        # Collapse double spaces left by the markers, keeping the offsets right.
        s2, mapping = [], []
        for ch in s:
            if ch == " " and s2 and s2[-1] == " ":
                mapping.append(len(s2) - 1)
                continue
            mapping.append(len(s2))
            s2.append(ch)
        mapping.append(len(s2))
        markers = [(mapping[min(o, len(mapping) - 1)], v) for o, v in markers]
        s = "".join(s2)
        lead = len(s) - len(s.lstrip())
        s = s.strip()
        markers = [(max(0, min(o - lead, len(s))), v) for o, v in markers]
    # Footnote references: [3]; remove them, keep where they stood.
    out, pos, shift = [], 0, 0
    for m in FOOTREF.finditer(s):
        out.append(s[pos:m.start()])
        at = m.start() - shift
        refs.append((at, int(m.group(1))))
        markers = [(o - (m.end() - m.start()) if o > at else o, v) for o, v in markers]
        shift += m.end() - m.start()
        pos = m.end()
    out.append(s[pos:])
    s = "".join(out)
    s = s.replace("_", "")
    return label, s, markers, refs


def parse_sections_layout(n):
    """The Republic (55201): the translation from *Ed. Steph. 327* to INDEX."""
    t = read(n)
    start = t.index("*Ed. Steph. 327*")
    end = t.index("\nINDEX.\n", start)
    body = t[start:end]
    notes = {}

    def take_note(m):
        notes.setdefault(int(m.group(1)), []).append(" ".join(m.group(2).split()))
        return "\n\n"
    body = re.sub(r"\[Footnote (\d+):(.*?)\]\s*(?=\n\s*\n|\Z)", take_note, body, flags=re.S)
    body = strip_sidenotes(body)
    paras, book = [], 1
    for b in blocks(body):
        s = b.strip()
        m = re.fullmatch(r"BOOK ([IVX]+)\.?", s)
        if m:
            book = roman(m.group(1))
            continue
        if re.fullmatch(r"[*\s]+", s):
            continue
        label, text, markers, refs = para(b, "sections")
        if not text and not markers:
            continue
        paras.append({"label": label, "text": text, "markers": markers, "refs": refs, "book": book})
    # Footnotes are numbered from 1 again in each book; attach each ref to the
    # first unused note with its number, in order.
    used = {k: 0 for k in notes}
    for p in paras:
        p["notes"] = []
        for at, k in p["refs"]:
            if k in notes and used[k] < len(notes[k]):
                p["notes"].append((at, notes[k][used[k]]))
                used[k] += 1
    return {"paras": paras}


def roman(s):
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}
    total = 0
    for i, c in enumerate(s):
        v = vals[c]
        total += -v if i + 1 < len(s) and vals[s[i + 1]] > v else v
    return total


def parse_pages_layout(n, works):
    """Vol. II (76464): each dialogue from its PERSONS heading (the Apology from
    its first words) to its FOOTNOTES, with the footnotes it lists."""
    t = read(n)
    lines = t.split("\n")
    persons = [i for i, ln in enumerate(lines) if ln.strip() == "_PERSONS OF THE DIALOGUE._"]
    apology = next(i for i, ln in enumerate(lines) if "How you, O Athenians, have been affected" in ln and "=Steph.=" in ln)
    starts = sorted(persons + [apology])
    order = [w["work"] for w in works]
    if len(starts) != len(order):
        raise SystemExit(f"pg{n}: expected {len(order)} dialogues, found {len(starts)} starts")
    out = {}
    for k, (w, s) in enumerate(zip(order, starts)):
        if not w:
            continue
        nxt = starts[k + 1] if k + 1 < len(starts) else len(lines)
        seg = lines[s:nxt]
        fn = next((i for i, ln in enumerate(seg) if ln.strip() == "FOOTNOTES"), None)
        if fn is None:
            # The Apology's FOOTNOTES may be missing; stop at the next dialogue's title.
            fn = len(seg)
        text_lines = seg[:fn]
        # Drop everything after the translation: the next dialogue's title and
        # Introduction begin with a line in capitals followed by INTRODUCTION.
        for i in range(len(text_lines)):
            if text_lines[i].strip() == "INTRODUCTION." and i > 5:
                j = i - 1
                while j > 0 and not text_lines[j].strip():
                    j -= 1
                text_lines = text_lines[:j]
                break
        notes = {}
        for b in blocks("\n".join(seg[fn + 1:])):
            m = re.match(r"\[(\d+)\]\s*(.*)", b.strip(), re.S)
            if m:
                notes[int(m.group(1))] = " ".join(m.group(2).split())
        body = strip_sidenotes("\n".join(text_lines))
        paras = []
        first = True
        for b in blocks(body):
            s = b.strip()
            if first and (s == "_PERSONS OF THE DIALOGUE._" or s.isupper()):
                continue
            if re.fullmatch(r"[*\s]+", s):
                continue
            if s.isupper() and len(s) < 120 and not paras:
                continue
            first = False
            label, text, markers, refs = para(b, "pages")
            paras.append({"label": label, "text": text, "markers": markers, "refs": refs,
                          "notes": [(at, notes[k]) for at, k in refs if k in notes]})
        out[w] = {"paras": paras}
    return out


def parse_plain_layout(n):
    t = read(n)
    i = t.rindex("PERSONS OF THE DIALOGUE")
    body = t[i:]
    paras = []
    book = 1
    for b in blocks(body)[1:]:
        s = " ".join(b.split())
        if s.startswith("SCENE:") and not paras:
            continue
        m = re.fullmatch(r"BOOK ([IVX]+)\.?", s)
        if m:
            book = roman(m.group(1))
            continue
        if s.startswith("THE END") or re.fullmatch(r"[*\s]+", s):
            continue
        label, text, markers, refs = para(b, "none")
        paras.append({"label": label, "text": text, "markers": [], "refs": refs, "notes": [], "book": book})
    return {"paras": paras}


def load_all():
    """{work id: {'ebook', 'translator', 'translator_evidence', 'printed', 'markers', 'paras'}}"""
    cfg = ebooks()
    out = {}
    for e in cfg["ebooks"]:
        if e["markers"] == "sections":
            parsed = {e["works"][0]["work"]: parse_sections_layout(e["ebook"])}
        elif e["markers"] == "pages":
            parsed = parse_pages_layout(e["ebook"], e["works"])
        else:
            parsed = {e["works"][0]["work"]: parse_plain_layout(e["ebook"])}
        for w in e["works"]:
            if not w["work"]:
                continue
            d = parsed[w["work"]]
            d.update({"ebook": e["ebook"], "translator": w["translator"], "translator_evidence": w.get("translator_evidence"),
                      "printed": e.get("printed"), "markers": e["markers"], "title": w["title"]})
            out[w["work"]] = d
    return out


def main():
    data = load_all()
    for w, d in sorted(data.items()):
        n_mark = sum(len(p["markers"]) for p in d["paras"])
        n_notes = sum(len(p["notes"]) for p in d["paras"])
        words = sum(len(p["text"].split()) for p in d["paras"])
        print(f"{w} {d['title']:<16} pg{d['ebook']:<6} {len(d['paras']):>5} paras {words:>7} words {n_mark:>5} markers {n_notes:>3} notes  {d['translator']}")
    if len(sys.argv) > 1:
        for p in data[sys.argv[1]]["paras"][:int(sys.argv[2]) if len(sys.argv) > 2 else 5]:
            print(p)


if __name__ == "__main__":
    main()
