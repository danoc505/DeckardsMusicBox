#!/usr/bin/env python3
"""Milestone 9: each dialogue as a whole, and the corpus as a whole.

Two steps, like the commentaries:

    python3 tools/structure.py read     # reads the printed divisions into texts/structure/ (committed)
    (tools/build_db.py calls build(db)) # puts them, and every claim in sources/structure/, into the library

What is read (`read`), all by rule from files already in sources/:

- Archer-Hind's chapters of the Timaeus (1888): he divides the dialogue into
  44 chapters and heads each part of his commentary with its span, its number
  and a summary ('27 C-29 D, c. v. Timaeus, after due ...'). The OCR misreads
  many of the spans, so the 44 headings are listed in CHAPTERS as read from the
  printed lines, each with its line in the OCR file; `read` checks that the
  line carries the chapter's number and takes the summary from it. Where the
  OCR letter had to be read (Ὁ for D or C), the entry says so.
- Jowett's marginal analysis: the sidenotes of the Republic (1888), placed at
  the Stephanus section printed in the margin before them, and of the
  Dialogues vol. II (1892), at the Stephanus page printed before them.
- The persons of the dialogue and its scene, as printed at the head of each
  translation by Jowett (Project Gutenberg) and by Taylor (1804, OCR cleaned).

What the build adds (`build`):

- The ancient introductions (texts/ancient/, tools/ancient.py), so the reader
  can show the words every claim rests on.
- Every claim of sources/structure/ (reading orders and classes, dramatic
  sequences, myths and images, statements of the skopos): each quotation is
  looked for in the text it names (an ancient text, or Burnet's Greek at the
  section given). A quotation that is not found is kept, marked not found, and
  listed in reports/structure.md; the tests require that there are none.
- Statements of the scope found by rule in Taylor's Introductions and in
  Proclus' preface: every sentence of those notes in which 'scope' or
  'design' is said of the dialogue (SCOPE below). They are candidates found by
  their words, not chosen, and the reader says so.
- For each myth and image, the notes on the passage that name it by one of its
  keywords, and the notes in the library that link two passages of the same
  theme or group (from the citation web of milestone 8).
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ancient  # noqa: E402
import jowett  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CLAIMS = ROOT / "sources" / "structure"
TEXTS = ROOT / "texts" / "structure"
REPORT = ROOT / "reports" / "structure.md"
STEPH = re.compile(r"^(\d+)([a-e])$")

ARCHER = "sources/archer-hind-1888/timaeusofplato00platiala_djvu.txt"
# (chapter, OCR line, start, end, how the span was read where the OCR is not plain)
CHAPTERS = [
    ("i", 3394, "17a", "19b", "OCR '17 A—I9Q Β'"), ("ii", 3969, "19b", "21a", None), ("iii", 4515, "21a", "25d", "OCR '25 Ὁ' read as D: c. iv begins at 25 D"),
    ("iv", 5754, "25d", "27b", None), ("v", 5977, "27c", "29d", "OCR '29 Ὁ' read as D: c. vi begins at 29 D"), ("vi", 6554, "29d", "31b", None),
    ("vii", 7147, "31b", "34a", None), ("viii", 7844, "34a", "36d", None), ("ix", 9056, "36d", "37c", "OCR '37 Ὁ' read as C: c. x begins at 37 C"),
    ("x", 9464, "37c", "38b", None), ("xi", 9806, "38b", "39e", None), ("xii", 10617, "39e", "40d", "OCR '40 Ὁ' read as D: c. xiii begins at 40 D"),
    ("xiii", 11229, "40d", "41d", "OCR '4tD'"), ("xiv", 11628, "41d", "42e", None), ("xv", 12252, "42e", "44d", "OCR '44 Ὁ' read as D: c. xvi begins at 44 D"),
    ("xvi", 12831, "44d", "47e", None), ("xvii", 13932, "47e", "48e", None), ("xviii", 14456, "48e", "52d", "OCR '52 Ὁ' read as D: c. xix begins at 52 D"),
    ("xix", 16009, "52d", "53c", None), ("xx", 16311, "53c", "55c", None), ("xxi", 17086, "55c", "56c", None),
    ("xxii", 17502, "56c", "57d", None), ("xxiii", 18077, "57d", "58c", None), ("xxiv", 18409, "58c", "60b", "OCR '58cC—6oB'"),
    ("xxv", 19113, "60b", "61c", None), ("xxvi", 19740, "61c", "64a", None), ("xxvii", 20691, "64a", "65b", None),
    ("xxviii", 21125, "65b", "66d", "OCR '65 B—66,': the letter is lost; c. xxix begins at 66 D"), ("xxix", 21508, "66d", "67c", None),
    ("xxx", 21970, "67c", "69a", None), ("xxxi", 22582, "69a", "70d", "OCR '7o Ὁ' read as D: c. xxxii begins at 70 D"),
    ("xxxii", 23297, "70d", "72d", None), ("xxxiii", 23978, "72d", "76e", None), ("xxxiv", 25526, "76e", "77c", None),
    ("xxxv", 25958, "77c", "79a", None), ("xxxvi", 26585, "79a", "79e", "OCR '79 A—E'"),
    ("xxxvii", 26968, "79e", "80c", "OCR '79 A—8o 6': the start read as 79 E, where c. xxxvi ends, and '6' as C; check the page"),
    ("xxxviii", 27429, "80d", "81e", "OCR '80 Ὁ--ϑβϑὶ E' read as 80 D-81 E: c. xxxix begins at 81 E"),
    ("xxxix", 27881, "81e", "84c", "OCR '84 6' read as C: c. xl begins at 84 C"), ("xl", 28690, "84c", "86a", None),
    ("xli", 29194, "86b", "87b", None), ("xlii", 29732, "87c", "89d", "OCR '87C—8g D'"), ("xliii", 30424, "89d", "90d", "OCR '9o D'"),
    ("xliv", 30785, "90e", "92c", "OCR 'goE—9g2 C'"),
]

# Scope found by rule: a sentence of Taylor's Introductions or Proclus' preface in which the
# scope or design is said of the dialogue ('the scope of the dialogue', 'its scope', 'the design
# of this dialogue', 'the design of the Hipparchus', 'Plato's design'), and not the translator's
# own design ('my design').
SCOPE = re.compile(r"\b(?:(?:leading |whole |real |main |true )?scope|design|end and design)\b(?:,? says \w+,)? of (?:this|the|the present|the following|Plato's) (?:[A-Z][a-z]+|dialogue|book)"
                   r"|\b(?:its|the) (?:leading |whole |real )?(?:scope|design)\b(?! of (?:publishing|it\b))"
                   r"|\bPlato's design\b", re.I)
# Not the scope of the dialogue: the translator's design, a design to do something ('the design of
# publishing', 'of saving'; the OCR reads publishing as 'pubhfhing'), the design of a speech in it ('of which').
NOT_SCOPE = re.compile(r"\bmy design\b|\bdesign of (?:pub\w*|\w+ing|which)\b", re.I)
SENTENCE = re.compile(r"(?<=[.;?!])\s+(?=[A-Z\"“‘'])")


# ------------------------------------------------------------------ read

def read_archer():
    lines = ancient.lines_of(ARCHER)
    out = []
    for k, (num, line, a, b, how) in enumerate(CHAPTERS, 1):
        head = lines[line - 1]
        m = re.search(r"\b" + num + r"[.,s]?[\s,]+", head)
        if not m:
            raise SystemExit(f"Archer-Hind c. {num}: line {line} does not carry its number: {head!r}")
        para = [head[m.end():]]
        for ln in lines[line:line + 40]:
            if not ln.strip():
                break
            para.append(ln)
        summary = ancient.join_lines(para)
        out.append({"n": k, "chapter": num, "start": a, "end": b, "line": line, "heading_raw": head.strip(),
                    "span_read": how, "summary": summary,
                    # The summary runs in the margin column; where the OCR breaks it at a page, only the first part is kept.
                    "summary_cut": not summary.rstrip().endswith((".", ":", ";", "?")),
                    "raw": "\n".join([head] + para[1:])})
    return {"schema": "platonic-workshop/divisions-v1", "work": "tlg031", "id": "archerhind1888-chapters",
            "label": "Archer-Hind (1888)", "kind": "chapter",
            "printed": "The Timaeus of Plato, edited with introduction and notes by R. D. Archer-Hind (London: Macmillan, 1888)",
            "source": {"manifest_id": "archer-hind-1888", "file": ARCHER}, "proof_status": "OCR as received",
            "basis": "Archer-Hind's own division of the dialogue into chapters: each part of his commentary is headed with the span of the chapter, its number and its summary. Spans read from those headings (see tools/structure.py, CHAPTERS).",
            "divisions": out}


def balanced_sidenotes(text):
    """[(start offset, text)] of every [Sidenote: ...] block (brackets may nest)."""
    out = []
    for m in jowett.SIDENOTE.finditer(text):
        depth, k = 0, m.start()
        while k < len(text):
            if text[k] == "[":
                depth += 1
            elif text[k] == "]":
                depth -= 1
                if depth == 0:
                    break
            k += 1
        body = text[m.end():k]
        out.append((m.start(), " ".join(body.replace("_", "").split())))
    return out


def read_jowett_sidenotes():
    """The marginal analysis of the Republic (sections printed) and of vol. II (pages printed)."""
    out = {}
    t = jowett.read(55201)
    start = t.index("*Ed. Steph. 327*")
    body = t[start:t.index("\nINDEX.\n", start)]
    marks, skipped = [], []
    for m in jowett.SECTION_MARK.finditer(body):
        r = f"{m.group(1)}{(m.group(2) or 'a').lower()}"
        # A marker that goes back is a misprint in the ebook ('*561A*' after '*561E*', line 22815, for 562A):
        # it is skipped, and the sidenotes after it stay at the section before.
        if marks and (int(r[:-1]), r[-1]) < (int(marks[-1][1][:-1]), marks[-1][1][-1]):
            at = start + m.start() + len(m.group(0)) - len(m.group(0).lstrip())
            skipped.append({"line": t[:at].count("\n") + 1, "printed": m.group(0).strip()})
            continue
        marks.append((m.start(), r))
    rows = []
    for pos, text in balanced_sidenotes(body):
        before = [r for p, r in marks if p < pos]
        rows.append({"ref": before[-1] if before else "327a", "precision": "section", "text": text,
                     "line": t[:start + pos].count("\n") + 1})
    out["tlg030"] = {"ebook": 55201, "printed": "The Republic of Plato, translated by B. Jowett, third edition (Oxford, 1888)",
                     "placed": "at the Stephanus section printed in the margin before the sidenote", "sidenotes": rows,
                     "markers_skipped": skipped}
    # Vol. II: each dialogue from its PERSONS heading (the Apology from its first words) to its FOOTNOTES.
    cfg = next(e for e in jowett.ebooks()["ebooks"] if e["ebook"] == 76464)
    t = jowett.read(76464)
    lines = t.split("\n")
    persons = [i for i, ln in enumerate(lines) if ln.strip() == "_PERSONS OF THE DIALOGUE._"]
    apology = next(i for i, ln in enumerate(lines) if "How you, O Athenians, have been affected" in ln and "=Steph.=" in ln)
    # The Apology's sidenotes begin above its first words: start it at its title's sidenote.
    ap_start = max(i for i in range(apology) if lines[i].startswith("[Sidenote: _Apology._") or i == 0)
    starts = sorted(persons + [ap_start])
    for k, (w, s) in enumerate(zip([x["work"] for x in cfg["works"]], starts)):
        if not w:
            continue
        nxt = starts[k + 1] if k + 1 < len(starts) else len(lines)
        seg = lines[s:nxt]
        fn = next((i for i, ln in enumerate(seg) if ln.strip() == "FOOTNOTES"), len(seg))
        for i in range(len(seg[:fn])):
            if seg[i].strip() == "INTRODUCTION." and i > 5:
                fn = i
                break
        text = "\n".join(seg[:fn])
        line_of = []
        pos = 0
        for i, ln in enumerate(seg[:fn]):
            line_of.append(pos)
            pos += len(ln) + 1
        pages = []
        for i, ln in enumerate(seg[:fn]):
            m = jowett.PAGE_MARK.search(ln)
            if m and not ln.lstrip().startswith("[Sidenote"):
                pages.append((line_of[i], int(m.group(1))))
        rows = []
        for p, body in balanced_sidenotes(text):
            before = [pg for o, pg in pages if o <= p]
            after = [pg for o, pg in pages if o > p]
            page = before[-1] if before else (after[0] if after else None)
            if page is None:
                continue
            rows.append({"ref": f"{page}a", "page": page, "precision": "page", "text": body,
                         "line": s + text[:p].count("\n") + 1})
        out[w] = {"ebook": 76464, "printed": cfg["printed"],
                  "placed": "at the Stephanus page printed at the line end before the sidenote (the first sidenotes, above the first page number, at that page)",
                  "sidenotes": rows}
    return {"schema": "platonic-workshop/sidenotes-v1", "label": "Jowett, marginal analysis", "source": {"manifest_id": "jowett-gutenberg"},
            "proof_status": "clean source text", "works": out}


def read_persons():
    """PERSONS OF THE DIALOGUE and SCENE as printed by Jowett and by Taylor."""
    out = defaultdict(list)
    for e in jowett.ebooks()["ebooks"]:
        t = jowett.read(e["ebook"])
        lines = t.split("\n")
        heads = [i for i, ln in enumerate(lines) if "PERSONS OF THE DIALOGUE" in ln]
        works = [w for w in e["works"] if w["work"]]
        if e["markers"] == "pages":
            pairs = [(w["work"], i) for w, i in zip([x for x in e["works"]], heads)]
            # The Apology has no PERSONS heading in vol. II: its works list lacks one, so pair in order of the others.
            names = [w["work"] for w in e["works"] if w["work"] != "tlg002"]
            pairs = list(zip(names, heads))
        else:
            pairs = [(works[0]["work"], heads[-1])] if heads else []
        for w, i in pairs:
            if not w:
                continue
            blocks, cur, j = [], [], i
            first = re.sub(r"_?PERSONS OF THE DIALOGUE\.?_?:?", "", lines[i]).strip()
            cur = [first] if first else []
            j = i + 1
            while j < len(lines) and len(blocks) < 5:
                ln = lines[j].strip()
                if not ln:
                    if cur:
                        blocks.append(" ".join(cur))
                        cur = []
                    # The head of the dialogue ends at the first double blank line after it.
                    if blocks and j + 1 < len(lines) and not lines[j + 1].strip():
                        break
                    j += 1
                    continue
                if ln.startswith("[Sidenote") or ln.startswith("*Ed.") or jowett.SPEAKER_CAPS.match(ln) or jowett.SPEAKER_ITAL.match(ln) or ln.startswith("BOOK"):
                    break
                cur.append(ln)
                j += 1
            if cur:
                blocks.append(" ".join(cur))
            rec = {"source": "jowett-gutenberg", "label": "Jowett", "ebook": e["ebook"], "line": i + 1, "persons": None, "scene": None, "frame": []}
            for b in blocks:
                b = " ".join(b.replace("_", "").split())
                if re.match(r"(SCENE|Scene)\b", b) or b.startswith("The scene is laid"):
                    rec["scene"] = re.sub(r"^SCENE:?—?\s*", "", b)
                elif rec["persons"] is None:
                    rec["persons"] = b
                elif b.startswith("And others"):
                    rec["persons"] += " " + b
                else:
                    rec["frame"].append(b)
            rec["raw"] = "\n".join(lines[i:j])
            out[w].append(rec)
    # Taylor (1804): the 'persons' segments at the head of each translation, OCR cleaned by rule. The last
    # one is dropped when it is a single name: that is the first speaker's name over the first speech.
    for f in sorted((ROOT / "texts" / "taylor-1804").glob("vol*/*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        w = (d.get("perseus_work") or "").split(".")[-1]
        segs = d.get("segments", [])
        k = next((i for i, s in enumerate(segs) if s.get("kind") == "persons" and "PERSONS" in s["text"].upper()), None)
        if not w or k is None:
            continue
        head = []
        for s in segs[k:]:
            if s.get("kind") != "persons":
                break
            head.append(s)
        if len(head) > 1 and re.fullmatch(r"[A-Z\W]+\.?", head[-1]["text"]) and len(head[-1]["text"].split()) == 1:
            head = head[:-1]
        txt = " ".join(s["text"] for s in head)
        txt = re.sub(r"^.*?PERSONS\W*\s*OF\s+THE\s+\w+\W*", "", txt, flags=re.I)
        persons, _, scene = re.split(r"\bSCENE\b", txt, maxsplit=1)[0], None, (re.split(r"\bSCENE\b", txt, maxsplit=1) + [""])[1]
        persons = persons.strip(" .,;")
        scene = re.sub(r"^\W+", "", scene).strip(" .,") or None
        if not persons:
            continue
        tr = head[0].get("translator") or d.get("translator") or "Thomas Taylor"
        out[w].append({"source": "taylor-1804", "label": f"{'Taylor' if 'Taylor' in tr else tr.split()[-1]} (1804)",
                       "file": str(f.relative_to(ROOT)), "line": head[0].get("line"), "persons": persons, "scene": scene,
                       "frame": [], "raw": "\n".join(s.get("raw") or s["text"] for s in head)})
    return {"schema": "platonic-workshop/persons-v1", "works": dict(sorted(out.items()))}


def read():
    TEXTS.mkdir(parents=True, exist_ok=True)
    for name, doc in (("archerhind1888-chapters", read_archer()), ("jowett-sidenotes", read_jowett_sidenotes()), ("persons", read_persons())):
        (TEXTS / f"{name}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        n = len(doc.get("divisions") or []) or sum(len(v["sidenotes"]) for v in doc.get("works", {}).values() if isinstance(v, dict) and "sidenotes" in v) \
            or sum(len(v) for v in doc["works"].values())
        print(f"{name}: {n}")


# ------------------------------------------------------------------ build

def load_json(name, folder=CLAIMS):
    return json.loads((folder / name).read_text(encoding="utf-8"))


class Texts:
    """Where a quotation is looked for: an ancient text (texts/ancient/<id>.json),
    or Burnet's Greek of one Stephanus section ('plato')."""

    def __init__(self, db):
        self.db = db
        self.docs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted(ancient.OUT.glob("*.json"))}
        self.greek = {}
        self.imported = {r[0] for r in db.execute("SELECT id FROM work WHERE imported = 1")}

    def plato(self, work, ref):
        k = (work, ref)
        if k not in self.greek:
            rows = self.db.execute("SELECT c.text FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE c.work_id = ? AND c.section_ref = ? "
                                   "AND e.lang = 'grc' ORDER BY c.seq", (work, ref)).fetchall()
            self.greek[k] = ancient.norm(" ".join(r[0] for r in rows), "grc")
        return self.greek[k]

    def find(self, ev):
        """-> (found, where, cited_as); found is None when the work is not in this build."""
        if ev["source"] == "plato":
            if ev["work"] not in self.imported:
                return None, ev["ref"], f"{ev['work']} {ev['ref']} (Burnet)"
            ok = ancient.norm(ev["quote"], "grc") in self.plato(ev["work"], ev["ref"])
            return ok, ev["ref"], f"{ev['work']} {ev['ref']} (Burnet)"
        doc = self.docs[ev["source"]]
        s = ancient.find(doc, ev["quote"])
        if not s:
            return False, None, doc["cite"]
        where = s["n"]
        unit = {"sections": "", "chapters": "ch. ", "pages": "p. "}[doc["numbering"]]
        cited = f"{doc['cite']} {unit}{where}"
        if doc["numbering"] != "pages" and doc["translator"] and doc["translator"].split()[-1] not in doc["cite"]:
            cited += f" ({doc['translator'].split()[-1]}" + (f", p. {s['page']}" if s.get("page") else "") + ")"
        elif doc["numbering"] == "pages":
            cited = f"{doc['cite']}, Hermann VI p. {s.get('pages') or where}"
        return True, where, cited


def add_evidence(db, texts, owner, evs, stats):
    for ev in evs:
        ok, where, cited = texts.find(ev)
        db.execute("INSERT INTO evidence (owner, source_text, work_id, at, quote, found, cited_as) VALUES (?,?,?,?,?,?,?)",
                   (owner, ev["source"], ev.get("work"), where, ev["quote"], None if ok is None else int(ok), cited))
        if ok is None:
            stats["quotations not checked (work not in this build)"] += 1
            continue
        stats["quotations"] += 1
        stats["quotations found"] += ok
        if not ok:
            stats.setdefault("not found", []).append(f"{owner}: {ev['source']} {ev.get('ref', '')} «{ev['quote']}»")


def build_ancient(db):
    src = {"burges-1854": "burges-1854", "yonge-1853": "yonge-1853", "hermann-appendix": "hermann-appendix"}
    for p in sorted(ancient.OUT.glob("*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        db.execute("INSERT INTO ancient_text VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                   (d["id"], d["title"], d["author"], d["translator"], d["lang"], d["printed"], d["cite"], d["numbering"],
                    src[d["source"]["manifest_id"]], d["source"]["file"], d["proof_status"]))
        for k, s in enumerate(d["sections"]):
            db.execute("INSERT INTO ancient_section VALUES (?,?,?,?,?,?,?,?)",
                       (d["id"], k, s["n"], s.get("pages") or (str(s["page"]) if s.get("page") else None), s.get("line"),
                        s["text"], s.get("raw"), s.get("number_read")))


def ref_range(db, work):
    return {r: i for r, i in db.execute("SELECT ref, seq FROM section WHERE work_id = ?", (work,))}


def build_divisions(db, stats):
    # Archer-Hind's chapters.
    d = load_json("archerhind1888-chapters.json", TEXTS)
    imported = {r[0] for r in db.execute("SELECT id FROM work WHERE imported = 1")}
    for c in (d["divisions"] if "tlg031" in imported else []):
        db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis, detail, printed_at, seq, precision, author) "
                   "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                   ("tlg031", "chapter", f"c. {c['chapter']}", c["start"], c["end"], "archer-hind-1888",
                    d["basis"] + (f" Span: {c['span_read']}." if c["span_read"] else ""), c["summary"], f"OCR line {c['line']}", c["n"], "section", d["label"]))
    stats["Archer-Hind chapters"] = len(d["divisions"]) if "tlg031" in imported else 0
    # Jowett's marginal analysis.
    s = load_json("jowett-sidenotes.json", TEXTS)
    n = 0
    for w, rec in s["works"].items():
        seq = ref_range(db, w)
        order = sorted(seq, key=seq.get)
        pages = defaultdict(list)
        for r in order:
            pages[int(STEPH.match(r).group(1))].append(r)

        def start_of(x):
            if x["precision"] == "section":
                return x["ref"] if x["ref"] in seq else None
            return pages[x["page"]][0] if x["page"] in pages else None
        rows = [(x, start_of(x)) for x in rec["sidenotes"]]
        rows = [(x, a) for x, a in rows if a]
        for k, (x, start) in enumerate(rows):
            # A sidenote runs to the section before the next one begins; one placed by page covers at least its page.
            nxt = rows[k + 1][1] if k + 1 < len(rows) else None
            last = seq[nxt] - 1 if nxt else len(order) - 1
            if x["precision"] == "page":
                last = max(last, seq[pages[x["page"]][-1]])
            end = order[max(seq[start], last)]
            db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis, detail, printed_at, seq, precision, author) "
                       "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                       (w, "sidenote", x["text"], start, end, "jowett-gutenberg",
                        f"Jowett's marginal analysis, {rec['printed']}; placed {rec['placed']}.", None,
                        f"Project Gutenberg {rec['ebook']}, line {x['line']}", k + 1, x["precision"], "Jowett"))
            n += 1
    stats["Jowett sidenotes"] = n


def build_persons(db, stats):
    p = load_json("persons.json", TEXTS)
    for w, recs in p["works"].items():
        for r in recs:
            for kind in ("persons", "scene"):
                if r.get(kind):
                    db.execute("INSERT INTO claim (kind, work_id, value, source_id, cited_as, quote, found, method) VALUES (?,?,?,?,?,?,?,?)",
                               (kind, w, r[kind], r["source"], f"{r['label']}" + (f", Project Gutenberg {r['ebook']}" if r.get("ebook") else ""),
                                r["raw"], 1, "as printed at the head of the translation"))
                    stats[f"{kind} ({r['label'].split()[0]})"] = stats.get(f"{kind} ({r['label'].split()[0]})", 0) + 1
            for f in r.get("frame", []):
                db.execute("INSERT INTO claim (kind, work_id, value, source_id, cited_as, quote, found, method) VALUES (?,?,?,?,?,?,?,?)",
                           ("frame", w, f, r["source"], r["label"], r["raw"], 1, "as printed at the head of the translation"))


def build_orders(db, texts, stats):
    d = load_json("orders.json")
    for k, o in enumerate(d["orders"]):
        db.execute("INSERT INTO reading_order VALUES (?,?,?,?,?,?,?)", (o["id"], o["label"], o["by"], o["cited"], o["kind"], o["about"], k))
        add_evidence(db, texts, f"order:{o['id']}", o["frame"], stats)
        for i, it in enumerate(o["items"]):
            db.execute("INSERT INTO reading_order_item (order_id, n, pos, grp, work_id, name, subtitle, character, doubt) VALUES (?,?,?,?,?,?,?,?,?)",
                       (o["id"], i, it.get("pos"), it.get("group"), it.get("work"), it.get("name"), it.get("subtitle"), it.get("character"), it.get("doubt")))
            add_evidence(db, texts, f"order:{o['id']}:{i}", it["evidence"], stats)
            stats["order items"] += 1


def build_sequences(db, texts, stats):
    d = load_json("sequences.json")
    for k, s in enumerate(d["sequences"]):
        db.execute("INSERT INTO sequence VALUES (?,?,?,?)", (s["id"], s["label"], json.dumps(s["works"]), k))
        add_evidence(db, texts, f"sequence:{s['id']}", s["testimony"], stats)
        for i, st in enumerate(s["steps"]):
            db.execute("INSERT INTO sequence_step VALUES (?,?,?,?,?)", (s["id"], i, st["work"], st["ref"], st["says"]))
            add_evidence(db, texts, f"sequence:{s['id']}:{i}", st["evidence"], stats)
            stats["sequence steps"] += 1


def notes_in(db, work, a, b):
    """Notes placed on any section from a to b (not the introductions on the whole dialogue)."""
    seq = ref_range(db, work)
    lo, hi = seq[a], seq[b]
    refs = [r for r, i in seq.items() if lo <= i <= hi]
    q = ",".join("?" * len(refs))
    return db.execute(f"SELECT id, commentator, start_ref, body FROM note WHERE work_id = ? AND start_ref IN ({q}) "
                      f"AND (kind IS NULL OR kind != 'introduction')", (work, *refs)).fetchall()


def build_themes(db, texts, stats):
    d = load_json("themes.json")
    for g in d["groups"]:
        db.execute("INSERT INTO theme_group VALUES (?,?,?)", (g["id"], g["label"], g["about"]))
    spans = []        # (theme, passage n, work, lo, hi)
    for k, t in enumerate(d["themes"]):
        db.execute("INSERT INTO theme VALUES (?,?,?,?,?,?)", (t["id"], t["label"], t["kind"], t.get("group"), json.dumps(t["keywords"]), k))
        kw = re.compile(r"\b(?:" + "|".join(re.escape(x) for x in t["keywords"]) + r")\w*\b", re.I if all(x.islower() for x in t["keywords"]) else 0)
        for i, p in enumerate(t["passages"]):
            if p["work"] not in texts.imported:
                continue
            ev = {"source": "plato", "work": p["work"], "ref": p["start"], "quote": p["quote"]}
            ok, _, _ = texts.find(ev)
            seq = ref_range(db, p["work"])
            if p["end"] not in seq or p["start"] not in seq or seq[p["end"]] < seq[p["start"]]:
                raise SystemExit(f"theme {t['id']}: no such span {p['work']} {p['start']}-{p['end']}")
            db.execute("INSERT INTO theme_passage VALUES (?,?,?,?,?,?,?)", (t["id"], i, p["work"], p["start"], p["end"], p["quote"], None if ok is None else int(ok)))
            add_evidence(db, texts, f"theme:{t['id']}:{i}", [ev], stats)
            spans.append((t["id"], i, p["work"], seq[p["start"]], seq[p["end"]]))
            for nid, who, ref, body in notes_in(db, p["work"], p["start"], p["end"]):
                m = kw.search(body)
                if m:
                    db.execute("INSERT INTO theme_named VALUES (?,?,?,?)", (t["id"], i, nid, m.group(0)))
                    stats["notes naming a theme"] += 1
            stats["theme passages"] += 1
    # The citation web between passages of one theme, or of one group of themes.
    group_of = {t["id"]: t.get("group") for t in d["themes"]}
    by_work = defaultdict(list)
    for s in spans:
        by_work[s[2]].append(s)
    seq_of = {}
    for (fw, fr, tw, tr, lid, nid) in db.execute("SELECT from_work, from_ref, to_work, to_ref, id, note_id FROM link WHERE kind = 'cf' AND certainty != 'unresolved'"):
        if fw not in by_work or tw not in by_work:
            continue
        for w in (fw, tw):
            if w not in seq_of:
                seq_of[w] = ref_range(db, w)
        fi = seq_of[fw].get(fr)
        ti = seq_of[tw].get(tr)
        if ti is None and re.fullmatch(r"\d+", tr):
            ti = min((i for r, i in seq_of[tw].items() if r[:-1] == tr), default=None)
        if fi is None or ti is None:
            continue
        for a in by_work[fw]:
            if not a[3] <= fi <= a[4]:
                continue
            for b in by_work[tw]:
                if b[:2] == a[:2] or not b[3] <= ti <= b[4]:
                    continue
                same = a[0] == b[0] or (group_of[a[0]] and group_of[a[0]] == group_of[b[0]])
                if same:
                    db.execute("INSERT INTO theme_link VALUES (?,?,?,?,?)", (a[0], a[1], b[0], b[1], lid))
                    stats["links within a theme or group"] += 1


def build_skopos(db, texts, stats):
    d = load_json("skopos.json")
    for s in d["statements"]:
        ok, where, cited = texts.find(s)
        db.execute("INSERT INTO claim (kind, work_id, value, stance, source_id, cited_as, quote, found, method, text_id, at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                   ("skopos", s["work"], None, s["stance"], "hermann-appendix", cited, s["quote"], int(ok), "chosen by hand", s["source"], where))
        stats["quotations"] += 1
        stats["quotations found"] += ok
        stats["skopos chosen"] += 1
        if not ok:
            stats.setdefault("not found", []).append(f"skopos {s['work']}: «{s['quote']}»")
    # Found by rule in Taylor's Introductions and Proclus' preface.
    rows = db.execute("SELECT n.id, n.work_id, n.body, n.commentator, n.printed_at, n.source_id, c.title FROM note n JOIN commentary c ON c.id = n.commentary_id "
                      "WHERE n.kind = 'introduction' AND (c.id LIKE 'taylor1804-intro%' OR c.id = 'proclus1820')").fetchall()
    for nid, w, body, who, printed, src, title in rows:
        if w not in texts.imported:
            continue
        for sent in SENTENCE.split(body):
            if SCOPE.search(sent) and not NOT_SCOPE.search(sent):
                db.execute("INSERT INTO claim (kind, work_id, value, stance, source_id, cited_as, quote, found, method, note_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
                           ("skopos", w, None, "stated", src, f"{who}, {title}" + (f", {printed}" if printed else ""), sent.strip(), 1,
                            "found by rule: a sentence that says 'scope' or 'design' of the dialogue (tools/structure.py, SCOPE)", nid))
                stats["skopos found by rule"] += 1


def build(db):
    """Called by build_db.py after the citation web. Returns the figures for the report."""
    stats = Counter()
    texts = Texts(db)
    build_ancient(db)
    build_divisions(db, stats)
    build_persons(db, stats)
    build_orders(db, texts, stats)
    build_sequences(db, texts, stats)
    build_themes(db, texts, stats)
    build_skopos(db, texts, stats)
    out = dict(stats)
    out["not found"] = stats.get("not found", [])
    return out


def write_report(db, stats, path=REPORT):
    q = lambda sql, *a: db.execute(sql, a).fetchall()
    lines = ["# Each dialogue as a whole, and the corpus as a whole: what the build found", "",
             "Written by `tools/build_db.py` (milestone 9, `tools/structure.py`); every figure is counted from the library.", "",
             f"**{stats['quotations found']:,} of {stats['quotations']:,} quotations found** in the texts they are said to be in "
             f"(ancient introductions in texts/ancient/, Burnet's Greek at the section named)."]
    nf = stats.get("not found") or []
    lines += ["", "Not found: none." if not nf else "Not found:", ""] + [f"- {x}" for x in nf]
    lines += ["", "## The ancient texts", "", "| Text | Printed | Numbered by | Units | Proofreading |", "|---|---|---|---:|---|"]
    for tid, title, printed, numbering, proof in q("SELECT id, title, printed, numbering, proof_status FROM ancient_text ORDER BY id"):
        n = q("SELECT count(*) FROM ancient_section WHERE text_id = ?", tid)[0][0]
        lines.append(f"| {title} (`{tid}`) | {printed} | {numbering} | {n} | {proof} |")
    garbled = q("SELECT text_id, n, number_read FROM ancient_section WHERE number_read IS NOT NULL")
    if garbled:
        lines += ["", "Section numbers the OCR garbled, read as the next number due: " + "; ".join(f"{t} §{n} ({r})" for t, n, r in garbled) + "."]
    lines += ["", "## Reading orders and classes", "", "| Order | By | Cited | Items |", "|---|---|---|---:|"]
    for oid, label, by, cited in q("SELECT id, label, by, cited FROM reading_order ORDER BY seq"):
        n = q("SELECT count(*) FROM reading_order_item WHERE order_id = ?", oid)[0][0]
        lines.append(f"| {label} | {by} | {cited} | {n} |")
    for oid, n, w, doubt in q("SELECT order_id, n, work_id, doubt FROM reading_order_item WHERE doubt IS NOT NULL"):
        lines.append(f"\nDoubt, {oid} item {n + 1} ({w}): {doubt}")
    lines += ["", "## Divisions", "",
              f"- Archer-Hind's chapters of the Timaeus: {stats.get('Archer-Hind chapters', 0)}, each with his summary; spans read from his headings, every OCR reading noted.",
              f"- Jowett's marginal analysis: {stats.get('Jowett sidenotes', 0)} sidenotes, in "
              + ", ".join(f"{t} {n}" for t, n in q("SELECT w.title, count(*) FROM division d JOIN work w ON w.id = d.work_id WHERE d.kind = 'sidenote' GROUP BY w.id ORDER BY w.id")) + ".",
              f"- Persons of the dialogue: {q('SELECT count(DISTINCT work_id) FROM claim WHERE kind = ?', 'persons')[0][0]} works (Jowett and Taylor as printed); scene: {q('SELECT count(DISTINCT work_id) FROM claim WHERE kind = ?', 'scene')[0][0]} works.",
              "", "## Skopos", "",
              f"- Chosen by hand from the Anonymous Prolegomena: {stats.get('skopos chosen', 0)} statements (accepted and rejected views), in Greek.",
              f"- Found by rule in Taylor's Introductions and Proclus' preface: {stats.get('skopos found by rule', 0)} sentences, in "
              f"{q('SELECT count(DISTINCT work_id) FROM claim WHERE kind = ? AND method LIKE ?', 'skopos', 'found by rule%')[0][0]} works. They are candidates found by their words; read each in its note.",
              "", "## Dramatic sequences", ""]
    for sid, label in q("SELECT id, label FROM sequence ORDER BY seq"):
        steps = q("SELECT w.title, s.ref FROM sequence_step s JOIN work w ON w.id = s.work_id WHERE s.sequence_id = ? ORDER BY s.n", sid)
        lines.append(f"- {label}: " + " → ".join(f"{t} {r}" for t, r in steps))
    lines += ["", "## Myths and images", "", "| Theme | Passages | Notes naming it | Notes linking its passages |", "|---|---|---:|---:|"]
    for tid, label in q("SELECT id, label FROM theme ORDER BY seq"):
        ps = q("SELECT w.title, p.start_ref, p.end_ref FROM theme_passage p JOIN work w ON w.id = p.work_id WHERE p.theme_id = ? ORDER BY p.n", tid)
        named = q("SELECT count(DISTINCT note_id) FROM theme_named WHERE theme_id = ?", tid)[0][0]
        linked = q("SELECT count(DISTINCT link_id) FROM theme_link WHERE theme_a = ?", tid)[0][0]
        lines.append(f"| {label} | " + "; ".join(f"{t} {a}–{b}" for t, a, b in ps) + f" | {named} | {linked} |")
    lines += ["", "Where a passage ends is chosen by hand; where it begins is a quotation of Burnet's Greek, checked. "
              "'Notes naming it' are the notes placed inside the passage whose words include one of the theme's keywords (sources/structure/themes.json).", ""]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    if sys.argv[1:] == ["read"]:
        read()
    else:
        print(__doc__)
