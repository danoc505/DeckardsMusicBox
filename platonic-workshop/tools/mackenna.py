"""Stephen MacKenna's English of Plotinus (1917-1930), read from the Internet Archive's OCR, chapter by chapter.

MacKenna's translation is the older English set beside the Workshop's modern English of the treatises Taylor did not
translate (tools/modern_enneads.py), as Taylor's is beside the fifteen he did (tools/modern_neo.py). MacKenna translated
from Volkmann's text (Teubner, 1883-1884), the edition of the Workshop's Greek, and mostly numbers the chapters as Volkmann
does; where he does not (in I.8 his chapters 1 to 12 hold Volkmann's 1 to 15), the master copy of the modern English names
his chapters for each Greek chapter (@older), and the check finds them.

The OCR is kept as received in sources/<volume>/; this tool reads it by rule, and nothing is rewritten by hand:

  * the running heads ("30  PLOTINUS", "1. 1. 7]  THE ANIMATE AND THE MAN  35") and the page numbers at the foot of a
    first page are taken out, and give the page each chapter begins on;
  * a word broken at the end of a line is joined ("instru- / ment" is "instrument"), but a hyphen before a capital is
    kept, since MacKenna joins his terms with hyphens ("Sense- / Perception" is "Sense-Perception");
  * a paragraph cut by a page break (it ends without a stop) is joined to the next again;
  * a line that is only a chapter number ("2.", "3-", the OCR's "i." for 1) begins a chapter, when it is the next number;
  * a footnote (a paragraph beginning with "*") is kept apart, with its chapter.

Each volume is added when the milestone that first needs it is done (workshop ROADMAP, "The Enneads in modern English").

    python3 tools/mackenna.py            write texts/plotinus/mackenna-<year>.json
    python3 tools/mackenna.py --check    only check that the files are up to date; exit 1 if not
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
OUT = ROOT / "texts" / "plotinus"
SCHEMA = "platonic-workshop/mackenna-v1"
ROMAN = ["I", "II", "III", "IV", "V", "VI"]
ORD = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH"]

VOLUMES = {
    "mackenna-1917": {
        "source": "mackenna-plotinus-1917",
        "file": "plotinusethicalt01plotuoft_djvu.txt",
        "item": "plotinusethicalt01plotuoft",
        "title": "Plotinus: The Ethical Treatises (the First Ennead)",
        "year": 1917,
        "enneads": [1],
        # where the treatises end: the translator's notes follow the Ninth Tractate
        "end": "BIBLIOGRAPHY  AND  EXPLANATORY  MATTER",
    },
}

NUM = r"[0-9ioIlO]{1,3}"     # a page number, as the OCR reads it ("io8", "IOI")
HEAD_EVEN = re.compile(rf"^({NUM})[\s:.,]+PLOTINUS\s*$")
HEAD_ODD = re.compile(rf"^[^\]\s][^\]]{{0,14}}\]\s+([^a-z0-9]+?)\s+({NUM})\s*$")    # the title in capitals, then the page
FOOT_NUM = re.compile(r"^(\d{1,3})\s*$")
CHAPTER = re.compile(r"^([0-9ilI]{1,3})\s*[.\-]\s*$")
STOPS = tuple('.?!:;"\')—]')


def as_number(s):
    s = s.translate(str.maketrans("ioIlO", "10110"))
    return int(s) if s.isdigit() else None


def page_of_head(line):
    m = HEAD_EVEN.match(line)
    if m:
        return as_number(m.group(1))
    m = HEAD_ODD.match(line)
    return as_number(m.group(2)) if m and re.search(r"[A-Z]{3}", m.group(1)) else None


def chapter_number(line):
    m = CHAPTER.match(line.strip())
    if not m:
        return None
    s = re.sub(r"[ilI]", "1", m.group(1))
    return int(s) if s.isdigit() else None


def join_lines(lines):
    """The lines of one paragraph as one line: broken words joined, MacKenna's hyphened terms kept."""
    out = ""
    for ln in lines:
        ln = re.sub(r"\s+", " ", ln).strip()
        if not ln:
            continue
        if out.endswith("-") and not out.endswith("--") and not out.endswith(" -"):
            out = out + ln if ln[:1].isupper() else out[:-1] + ln
        else:
            out = f"{out} {ln}" if out else ln
    return out


def read_volume(vid):
    """{'treatises': [{'id': 'I.1', 'title', 'page', 'chapters': [{'id': 'I.1.1', 'n', 'page', 'paras', 'notes'}]}]}"""
    v = VOLUMES[vid]
    lines = (SRC / v["source"] / v["file"]).read_text(encoding="utf-8").splitlines()
    # The treatises begin at the first "THE <n> ENNEAD" heading followed by "FIRST TRACTATE".
    start = next(i for i, ln in enumerate(lines)
                 if re.fullmatch(r"THE\s+\w+\s+ENNEAD", ln.strip()) and any(
                     re.fullmatch(r"FIRST\s+TRACTATE", x.strip()) for x in lines[i + 1:i + 4]))
    end = next(i for i in range(start, len(lines)) if lines[i].strip() == v["end"].strip() or
               re.sub(r"\s+", " ", lines[i].strip()) == re.sub(r"\s+", " ", v["end"]))
    treatises, ennead = [], None
    page, pending = None, []          # the page now being read; chapters whose first page is not yet known
    cur_ch, para, after_title = None, [], False

    def close_para():
        nonlocal para
        if para and cur_ch is not None:
            t = join_lines(para)
            if t:
                cur_ch["_paras"].append(t)
        para = []

    def new_chapter(n):
        nonlocal cur_ch
        close_para()
        t = treatises[-1]
        cur_ch = {"id": f"{t['id']}.{n}", "n": n, "page": page, "_paras": []}
        if page is None:
            pending.append(cur_ch)
        t["chapters"].append(cur_ch)

    i = start
    while i < end:
        raw = lines[i]
        s = raw.strip()
        i += 1
        m = re.fullmatch(r"THE\s+(\w+)\s+ENNEAD", s)
        if m and m.group(1) in ORD:
            close_para()
            ennead = ORD.index(m.group(1)) + 1
            continue
        m = re.fullmatch(r"(\w+)\s+TRACTATE", s)
        if m and m.group(1) in ORD:
            close_para()
            k = ORD.index(m.group(1)) + 1
            # the title: the next non-empty line
            while i < end and not lines[i].strip():
                i += 1
            title = re.sub(r"\s+", " ", lines[i].strip())
            i += 1
            treatises.append({"id": f"{ROMAN[ennead - 1]}.{k}", "title": title.strip('" '), "page": page, "chapters": []})
            cur_ch = None
            new_chapter(1)
            after_title = True
            continue
        p = page_of_head(s)
        if p is not None:
            page = p
            for c in pending:
                c["page"] = p - 1 if c["page"] is None else c["page"]
            pending.clear()
            continue
        m = FOOT_NUM.match(s)
        if m and not CHAPTER.match(s):
            n = int(m.group(1))
            if page is None or n == page or n == page + 1:
                for c in pending:
                    c["page"] = n
                for t in treatises:
                    if t["page"] is None:
                        t["page"] = n
                pending.clear()
                page = n + 1
                continue
        if not treatises:
            continue
        n = chapter_number(s)
        if n is not None:
            t = treatises[-1]
            if after_title and n == 1:
                after_title = False
                close_para()
                continue
            if n == t["chapters"][-1]["n"] + 1:
                after_title = False
                new_chapter(n)
                continue
        if not s:
            close_para()
            continue
        after_title = False
        para.append(raw)
    close_para()
    for t in treatises:
        if t["page"] is None and t["chapters"]:
            t["page"] = t["chapters"][0]["page"]
        for c in t["chapters"]:
            c["paras"], c["notes"] = mend(c.pop("_paras"))
    return {"schema": SCHEMA, "id": vid, "title": v["title"], "translator": "Stephen MacKenna", "year": v["year"],
            "source": v["source"], "scan": f"https://archive.org/details/{v['item']}",
            "how": "the Internet Archive's OCR, read by rule (tools/mackenna.py): running heads and page numbers taken out, "
                   "broken words and paragraphs cut by a page break joined; not proofread",
            "treatises": treatises}


def mend(paras):
    """Join a paragraph cut by a page break; keep footnotes apart."""
    out, notes = [], []
    for p in paras:
        if p.startswith("*") or p.startswith("+ "):
            notes.append(p.lstrip("*+ ").strip())
            continue
        if out and not out[-1].endswith(STOPS):
            out[-1] = join_lines([out[-1], p])
        else:
            out.append(p)
    return out, notes


def write(vid):
    d = read_volume(vid)
    OUT.mkdir(parents=True, exist_ok=True)
    return OUT / f"{vid}.json", json.dumps(d, ensure_ascii=False, indent=1) + "\n"


def chapters(vids=None):
    """{'I.1.1': {'text': the chapter on one line, 'paras': [...], 'page': 29, 'volume': 'mackenna-1917'}} from texts/plotinus/."""
    out = {}
    for vid in vids or VOLUMES:
        f = OUT / f"{vid}.json"
        d = json.loads(f.read_text(encoding="utf-8"))
        for t in d["treatises"]:
            for c in t["chapters"]:
                out[c["id"]] = {"text": re.sub(r"\s+", " ", " ".join(c["paras"])).strip(), "paras": c["paras"],
                                "page": c["page"], "volume": vid, "year": d["year"], "treatise_title": t["title"]}
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    bad = 0
    for vid in VOLUMES:
        path, text = write(vid)
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != text:
                print(f"{path.relative_to(ROOT)} is out of date: run python3 tools/mackenna.py")
                bad += 1
            continue
        path.write_text(text, encoding="utf-8")
        d = json.loads(text)
        print(f"{path.relative_to(ROOT)}: " + ", ".join(f"{t['id']} ({len(t['chapters'])} ch., p. {t['page']})" for t in d["treatises"]))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
