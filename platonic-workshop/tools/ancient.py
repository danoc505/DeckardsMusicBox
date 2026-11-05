#!/usr/bin/env python3
"""Read the ancient introductions to Plato (milestone 9) into texts/ancient/.

Four texts, each kept with its OCR or ebook text as received ('raw') and
cited the way the printed book numbers it:

- dl3-burges:   Diogenes Laertius III (the Life of Plato), tr. Burges (1854),
                by the section numbers Burges prints, [57.].
- albinus-burges: Albinus, Introduction to the Dialogues of Plato, tr. Burges
                (1854), by his chapters [1.] to [9.].
- dl3-yonge:    Diogenes Laertius III, tr. Yonge (1853), Project Gutenberg, by
                Yonge's own chapters (I. to ...), which are not the standard
                sections.
- prolegomena-hermann, albinus-hermann: the Greek of the Anonymous
                Prolegomena and of Albinus in Hermann's Appendix Platonica,
                by Hermann's pages, as the OCR reads them. Unproofread.

Rules (all here, nothing guessed):

1. Each text is cut out of its file by the line ranges in RANGES (found by
   reading the files; `python3 tools/ancient.py --check` prints their first
   and last lines).
2. Pages end at a running head: a short line naming the work, with a page
   number ('204 THE LIFE OF PLATO, [c. 57-59.', 'c. 60, 61.] ACCORDING TO
   DIOGENES LAERTIUS. 205'). The head is removed and its page kept.
3. Burges' footnotes: on each page, the first paragraph that begins with a
   note mark (a figure, *, °, ', ! and the like, then a space) and everything
   after it on the page are footnotes. They are kept, apart from the text.
4. Section numbers: '[57.]' starts section 57. A bracket whose number the OCR
   garbled ('[8,7' where 58 is due) is read as the next number when it is
   the only bracket in reach; each such reading is listed in the section's
   'number_read'.
5. Words broken at a line end ('argu-' / 'ment') are joined for the clean
   text; the raw text keeps the lines.

    python3 tools/ancient.py           # writes texts/ancient/*.json
    python3 tools/ancient.py --check   # the first and last lines of each range
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "texts" / "ancient"
SCHEMA = "platonic-workshop/ancient-v1"

BURGES = "sources/burges-1854/worksofplatonewl06platiala_djvu.txt"
YONGE = "sources/yonge-1853/pg57342.txt"
HERMANN = "sources/hermann-appendix/platonisdialogi06plat_djvu.txt"
BURGES_BOOK = "The Works of Plato, vol. VI, translated by George Burges (London: Henry G. Bohn, 1854)"
HERMANN_BOOK = "Platonis Dialogi secundum Thrasylli tetralogias dispositi, ed. C. F. Hermann, vol. VI (Leipzig: Teubner, 1887; the Appendix Platonica first printed 1853)"

RANGES = {
    "dl3-burges": {"file": BURGES, "manifest_id": "burges-1854", "lines": [10774, 14075], "lang": "eng",
                   "author": "Diogenes Laertius", "translator": "George Burges",
                   "title": "The Life of Plato, according to Diogenes Laertius (Lives III)", "cite": "DL III",
                   "printed": BURGES_BOOK + ", pp. 167-228", "numbering": "sections",
                   "head": r"DIOGENES\s*LAERTI|LIFE\s*OF\s*PLATO"},
    "albinus-burges": {"file": BURGES, "manifest_id": "burges-1854", "lines": [19164, 19574], "lang": "eng",
                       "author": "Albinus", "translator": "George Burges",
                       "title": "The Introduction of Albinus to the Dialogues of Plato", "cite": "Albinus, Prologue",
                       "printed": BURGES_BOOK + ", pp. 315-322", "numbering": "sections",
                       "head": r"INTRODUCTION\s*OF\s*ALBINUS|TO\s*THE\s*DIALOGUES\s*OF\s*PLATO"},
    "dl3-yonge": {"file": YONGE, "manifest_id": "yonge-1853", "lines": [4323, 5874], "lang": "eng",
                  "author": "Diogenes Laertius", "translator": "C. D. Yonge",
                  "title": "Life of Plato (Lives and Opinions of Eminent Philosophers, book III)", "cite": "DL III (Yonge)",
                  "printed": "The Lives and Opinions of Eminent Philosophers, by Diogenes Laërtius, translated by C. D. Yonge (London: Henry G. Bohn, 1853); Project Gutenberg ebook 57342",
                  "numbering": "chapters"},
    "prolegomena-hermann": {"file": HERMANN, "manifest_id": "hermann-appendix", "lines": [11050, 12257], "lang": "grc",
                            "author": "Anonymous", "translator": None,
                            "title": "Προλεγόμενα τῆς Πλάτωνος φιλοσοφίας (Anonymous Prolegomena to Platonic Philosophy)",
                            "cite": "Anon. Prol.", "printed": HERMANN_BOOK + ", pp. 196-222", "numbering": "pages",
                            "first_page": 196, "head": r"Π\S{0,2}Ρ\S{0,2}Ο\S{0,3}Ε\S{0,2}Γ\S{0,2}Ο\S{0,2}Μ|ΦΙ\S{0,3}Ο?ΣΟΦΙ"},
    "albinus-hermann": {"file": HERMANN, "manifest_id": "hermann-appendix", "lines": [8925, 9120], "lang": "grc",
                        "author": "Albinus", "translator": None, "title": "Ἀλβίνου εἰσαγωγή (Albinus, Prologue)",
                        "cite": "Albinus, Prologue (Greek)", "printed": HERMANN_BOOK + ", pp. 147-151", "numbering": "pages",
                        "first_page": 147, "head": r"ΕἸ?Ι?Σ\S{0,3}Α\S{0,2}Γ|Α\S{0,2}Β\S{0,2}ΟΣ"},
}

NOTE_START = re.compile(r"^[_\s]*(?:[\d*°'‘’!“\"§†‡^®©¢]{1,3}(?:\s*[—–-]+\s*[\d*°'‘’!“\"®]{0,3})?\.?)\s+(?=\S)")
SECTION = re.compile(r"\[\s*([0-9IlSO]{1,3})\s*[.,·]?\s*[1l\]]?\]?\s?(?=[A-Z‘“(])")
BRACKET = re.compile(r"\[\s*([0-9IlSO]{1,3}\s?[.,]?\s?[0-9\]1l7|]?)")
ROMAN_CH = re.compile(r"^([IVXL]{1,7})\.\s+(?=[A-Z])")


def lines_of(path):
    return (ROOT / path).read_text(encoding="utf-8-sig").replace("\r\n", "\n").split("\n")


def join_lines(lines):
    s = ""
    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue
        if s.endswith("-") and ln[:1].isalpha() and s[-2:-1].isalpha():
            s = s[:-1] + ln
        else:
            s = (s + " " + ln) if s else ln
    return re.sub(r"\s+", " ", s).strip()


def pages(lines, start, head_re, numbering):
    """[(page or None, [(line no, text)])], cut at running heads."""
    out, cur, page = [], [], None
    head = re.compile(head_re)
    for i, ln in enumerate(lines):
        s = ln.strip()
        is_head = bool(s) and len(s) < 70 and head.search(s) and re.search(r"\d", s) and i > 3 \
            and (numbering != "pages" or re.search(r"^\S{3}\s|\s\S{3}\s*$", s) and sum(c.isupper() for c in s) >= 5)
        if is_head:
            out.append((page, cur))
            cur = []
            nums = [int(x) for x in re.findall(r"\b(\d{3})\b", s)]
            page = nums[0] if nums else None
            continue
        cur.append((start + i, ln))
    out.append((page, cur))
    return out


def paragraphs(page_lines):
    paras, cur = [], []
    for no, ln in page_lines:
        if not ln.strip():
            if cur:
                paras.append(cur)
                cur = []
            continue
        cur.append((no, ln))
    if cur:
        paras.append(cur)
    return paras


def read_burges(cfg):
    lines = lines_of(cfg["file"])
    a, b = cfg["lines"]
    pg = pages(lines[a - 1:b], a, cfg["head"], "sections")
    body, notes = [], []          # body: [(line, text, page)]
    for k, (page, pl) in enumerate(pg):
        # The page number printed in the head *after* a page is that of the next page; Burges heads
        # stand at the top, so page of block k is the number read from head k (block 0 is the title page).
        in_notes = False
        for p in paragraphs(pl):
            first = p[0][1]
            if not in_notes and k > 0 and NOTE_START.match(first) and not SECTION.match(first.strip()):
                in_notes = True
            if in_notes:
                notes.append({"page": page, "line": p[0][0], "text": join_lines([x[1] for x in p]),
                              "raw": "\n".join(x[1] for x in p)})
            else:
                body.append((p, page))
    # Sections.
    sections, cur, expect = [], None, 1
    for p, page in body:
        raw = "\n".join(x[1] for x in p)
        text = join_lines([x[1] for x in p])
        pos = 0
        for m in BRACKET.finditer(text):
            tok = m.group(1)
            tok = tok.replace(" ", "")
            clean = re.fullmatch(r"(\d{1,3})\.?[\]|]", tok)
            lead = re.match(r"[0-9IlSO]{1,3}", tok)
            n = int(lead.group(0).replace("I", "1").replace("l", "1").replace("S", "5").replace("O", "0")) if lead else None
            read = None
            if n == expect:
                pass
            elif clean and expect < n <= expect + 10:
                pass                      # printed cleanly; the OCR lost the brackets in between
            elif not clean and len(tok) <= 4 and re.search(r"[.,]", tok):
                read = f"'[{tok}' read as [{expect}.]"
                n = expect
            else:
                continue
            if cur is not None:
                cur["text"] += (" " if cur["text"] else "") + text[pos:m.start()].strip()
            cur = {"n": str(n), "page": page, "line": p[0][0], "text": "", "raw": "", "number_read": read}
            sections.append(cur)
            pos = m.end()
            expect = n + 1
        if cur is None:
            continue
        cur["text"] = (cur["text"] + " " + text[pos:].strip()).strip()
        cur["raw"] += ("\n\n" if cur["raw"] else "") + raw
    for s in sections:
        s["text"] = re.sub(r"\s+", " ", s["text"]).strip()
        if not s["number_read"]:
            del s["number_read"]
    return sections, notes


def read_yonge(cfg):
    lines = lines_of(cfg["file"])
    a, b = cfg["lines"]
    chapters, cur = [], None
    for p in paragraphs([(a + i, ln) for i, ln in enumerate(lines[a - 1:b])]):
        text = join_lines([x[1] for x in p])
        raw = "\n".join(x[1] for x in p)
        m = ROMAN_CH.match(text)
        if m:
            cur = {"n": m.group(1), "line": p[0][0], "text": text[m.end():], "raw": raw}
            chapters.append(cur)
        elif cur:
            cur["text"] += "\n\n" + text
            cur["raw"] += "\n\n" + raw
    return chapters, []


HERMANN_HEAD = r"^\S{1,3}\s+\S{0,3}\s?[Α-Ω«]\S*[Α-Ω].{0,30}$|^.{0,6}[Α-Ω]{2}.{0,34}\s\S{3}\s*$"


def read_hermann(cfg):
    lines = lines_of(cfg["file"])
    a, b = cfg["lines"]
    out = []
    pg = pages(lines[a - 1:b], a, HERMANN_HEAD, "pages")
    expected = cfg["first_page"]
    for k, (printed, pl) in enumerate(pg):
        text = join_lines([x[1] for x in pl])
        if k > 0:
            expected += 1
            # The head's number, when the OCR reads it near where it is due; a head the OCR
            # missed leaves two pages in one block, and the next head's number puts it right.
            if printed is not None and expected <= printed <= expected + 2:
                expected = printed
        if not text:
            continue
        nonblank = [x for x in pl if x[1].strip()]
        rec = {"n": str(expected), "page": expected, "page_read": printed,
               "line": nonblank[0][0] if nonblank else None,
               "text": unicodedata.normalize("NFC", text), "raw": "\n".join(x[1] for x in pl)}
        if out and int(out[-1]["n"]) < expected - 1:
            out[-1]["pages"] = f"{out[-1]['n']}-{expected - 1}"
        out.append(rec)
    return out, []


def read_all():
    docs = {}
    for id_, cfg in RANGES.items():
        if id_.endswith("burges"):
            secs, notes = read_burges(cfg)
        elif id_ == "dl3-yonge":
            secs, notes = read_yonge(cfg)
        else:
            secs, notes = read_hermann(cfg)
        docs[id_] = {"schema": SCHEMA, "id": id_, "title": cfg["title"], "author": cfg["author"],
                     "translator": cfg["translator"], "lang": cfg["lang"], "printed": cfg["printed"], "cite": cfg["cite"],
                     "numbering": cfg["numbering"],
                     "source": {"manifest_id": cfg["manifest_id"], "file": cfg["file"], "lines": cfg["lines"]},
                     "proof_status": "OCR as received" if cfg["file"] != YONGE else "clean source text",
                     "sections": secs, "notes": notes}
    return docs


# ------------------------------------------------------------------ finding a quotation

QUOTES = str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"', "—": "-", "–": "-", "ϑ": "θ", "ϕ": "φ", "ς": "σ"})


def norm(s, lang="eng"):
    """The comparison form of a text or a quotation: one space between words,
    the same quotation marks and dashes, words broken at a line end joined; for
    Greek also no accents or breathings (the OCR misreads them often)."""
    s = unicodedata.normalize("NFC", s).translate(QUOTES)
    s = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", s)
    s = re.sub(r"\s+", " ", s).strip()
    if lang == "grc":
        s = greek.strip_accents(s).translate(QUOTES)
        s = re.sub(r"[^\w ]", "", s)
        s = re.sub(r"\s+", " ", s)
    return s


def find(doc, quote, where=None):
    """The section (or page, or chapter) of `doc` whose text holds `quote`, or None.
    `where` limits the search to that section number."""
    q = norm(quote, doc["lang"])
    for s in doc["sections"]:
        if where is not None and s["n"] != str(where):
            continue
        if q in norm(s["text"], doc["lang"]):
            return s
    return None


def load(id_):
    return json.loads((OUT / f"{id_}.json").read_text(encoding="utf-8"))


def main():
    if "--check" in sys.argv:
        for id_, cfg in RANGES.items():
            ls = lines_of(cfg["file"])
            a, b = cfg["lines"]
            print(f"{id_}: {a}: {ls[a - 1].strip()!r} ... {b}: {ls[b - 1].strip()!r}")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    for id_, d in read_all().items():
        (OUT / f"{id_}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        nums = [s["n"] for s in d["sections"]]
        print(f"{id_}: {len(nums)} {d['numbering']} ({nums[0]} to {nums[-1]}), {len(d['notes'])} footnotes")


if __name__ == "__main__":
    main()
