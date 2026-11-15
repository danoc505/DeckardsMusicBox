"""Proclus' Theology of Plato in modern English, made for the Workshop from Taylor's English (1816).

Asked for by Daniel (November 15, 2026): "Lets move over to modernizing Proclus Theology of Plato". No Greek of the
Theology is on the site (the only free edition, Portus' of 1618, is a scan whose Greek OCR is badly garbled), so the
modern version is made from Thomas Taylor's translation, as the General Introduction was (milestone 24, tools/modern.py):
paragraph by paragraph, every idea kept, in short sentences and today's words, with Taylor's paragraph beside it or one tap
away. Taylor's English is Project Gutenberg's proofread transcription of his two volumes (sources/taylor-gutenberg/,
pg77393.txt for vol. I, Books I-V, and pg78800.txt for vol. II, Books VI and VII), kept as received.

Taylor renders Proclus' key words by a fixed vocabulary ("essence" for ousia, "intellect" for nous, "progression" for
proodos, "participate" for metechein, "unities" for the henads ...), so the fixed modern renderings are checked against his
words: sources/translations/modern/terms.json, the list the General Introduction and the Life of Plato use, with the rules
added for the Theology (those with "texts": ["proclus-theology"]), and its "forbidden" words, which the modern version must
never use (ousia is "being", never "essence"; nor "subsist", "energy", "felicity", as in Proclus on the Alcibiades).

Each version is labelled as the Workshop's own and machine-assisted: it was drafted with an AI model, and no scholar has
checked it yet. A flag marks a hard place, or one where Taylor's English is unclear or seems to miss Proclus' sense, and
quotes Taylor's words, word for word (the build checks the quotation).

The master copy is plain text, easy to revise by hand: sources/translations/modern/proclus-theology.txt

    # ...                           a comment
    @book <I> | <title>             a book of Proclus', with its short summary on the lines after
    @ch <I.1> | <title>             one of Taylor's chapters (his numbers), with its short summary on the lines after
    @p                              the modern version of Taylor's next paragraph in the chapter (I.1.p1, I.1.p2 ...)
    !flag <Taylor's words> | <why>  a hard place, or where Taylor's English misleads
    !note <text>                    a note on the paragraph (Plato's places, who is meant ...)

This tool turns it into sources/translations/modern/proclus-theology.json, which the reader shows at
#neo-modern/proclus-theology, and checks it (reports/modern_theology.md):

  * the chapters done are Taylor's, in his order, from the first chapter of Book I with none skipped;
  * each chapter has a modern version of every one of Taylor's paragraphs, once, in order;
  * every flag's words are found word for word in Taylor's paragraph;
  * the key words are rendered the same way throughout (terms.json): where Taylor's paragraph has one of his forms, the
    modern paragraph has one of the fixed modern forms, unless the paragraph is listed as an exception, with the reason;
    and no modern paragraph uses a forbidden word.

    python3 tools/modern_theology.py            build the JSON and the report
    python3 tools/modern_theology.py --check    only check; exit 1 on a problem
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import modern  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MODERN = ROOT / "sources" / "translations" / "modern"
GUTENBERG = ROOT / "sources" / "taylor-gutenberg"
REPORT = ROOT / "reports" / "modern_theology.md"
TEXT = "proclus-theology"
SCHEMA = "platonic-workshop/modern-neo-v1"
# Taylor's two volumes as Project Gutenberg gives them: the file, the first book in it, and where its text ends.
VOLUMES = [("pg77393.txt", "I", 1, ("END OF VOL. I.", "FOOTNOTES:")),
           ("pg78800.txt", "VI", 2, ("ELEMENTS OF THEOLOGY.", "FOOTNOTES:"))]
# Proclus wrote six books; the seventh is Taylor's own, made from Proclus on the Timaeus to stand for a lost one.
BOOKS = ["I", "II", "III", "IV", "V", "VI"]

TITLE = "Proclus, The Theology of Plato, in modern English"
LABEL = ("The Workshop's modern English, machine-assisted: drafted with an AI model (Claude) from Thomas Taylor's translation "
         "(1816) and not yet checked by a scholar. Taylor's own words are beside every chapter, or one tap away.")
ABOUT = ("A modern English version of Proclus' Theology of Plato (fifth century), the school's summa of the gods as Plato "
         "teaches them, written for the Workshop, because none in modern English may be reused. It is made from Thomas Taylor's "
         "translation (The Six Books of Proclus on the Theology of Plato, London, 1816), as Project Gutenberg's proofread "
         "transcription gives it, paragraph by paragraph: every idea is kept, the long sentences are broken into short ones, and "
         "old words are replaced by today's, the key words always the same way (Taylor's 'essence' is 'being', 'progression' "
         "is 'procession', 'participate' is 'share', 'unities' are 'henads', 'ideas' are 'Forms', 'superessential' is 'beyond "
         "being'), linked to the Term tab. Taylor's Latin names of the gods are given in Greek (Kronos for Saturn). Proclus' "
         "Greek is not yet on the site (the only free edition, Portus' of 1618, is a scan whose Greek OCR is badly garbled), so "
         "this version cannot yet be checked against the Greek; a flag marks a place where Taylor's English is hard or unclear, "
         "with his words. Taylor's footnotes are kept under his words. The chapters and their numbers are Taylor's (his "
         "headings are in his table of contents); the short titles and summaries are the Workshop's. So far: Books I to IV, and Book V, chapters 1-11. "
         "Book I, chapters 1-8: Proclus' preface and its praise of Plato and his heirs, how the work will proceed and what its hearer needs, who "
         "a theologian is in Plato's sense, the four ways Plato teaches about the gods, which dialogues hold his theology, and "
         "why the Parmenides holds all of it; chapters 9-12, against the merely logical reading of the Parmenides, and Syrianus' "
         "reading of its hypotheses as the orders of the gods; chapters 13-17, the Laws' three rules (the gods exist, provide "
         "for all things and cannot be bribed) and the Republic's axioms, beginning with the gods' goodness and the nature of evil; chapters 18-29, the gods' unchangeableness, simplicity and truth, "
         "the Phaedrus' beautiful, wise and good, faith, truth and love, the Phaedo's divine, immortal and intelligible, the "
         "unbegotten, father and mother causes, and the divine names. Book II, chapters 1-3: three arguments that the "
         "first principle is the One itself, beyond being and beyond all multitude; chapters 4-12, against Origen, the two "
         "ways up (analogy and negation) and the two names (the One and the Good), the Republic's sun, the Second Letter's "
         "king of all, and the first hypothesis of the Parmenides as a hymn of denials. Book III, chapters 1-8: the henads "
         "after the One, shared by being, life, intellect, soul and body, and the two principles after the One, limit and the "
         "unlimited; chapters 9-18, the mixed, first being, and the three intelligible triads, in the Philebus and in the "
         "Timaeus (the one, eternity, and the living being itself); chapters 19-28, the four intelligible Forms, the Sophist's one being, whole and all, father, power and intellect, the marks of the good, the wise and the beautiful, the three triads in the Parmenides (the one being, the whole, unlimited multitude), and a hymn to the intelligible gods. Book IV, chapters 1-13: the intelligible and intellectual gods, their three triads, the Phaedrus' heaven (not the visible one), the place above the heaven and the arch beneath it, the way up as in the mysteries, and the denials and affirmations of the place above the heaven; chapters 14-26, science, temperance and justice, the plain of truth, the meadow, nectar and ambrosia, Adrastia, the gods who hold together (the heaven's back, depth and arch, Ouranos in the Cratylus), and the arch beneath the heaven and the perfecting gods, the teletarchs; chapters 27-39, the same three triads in the Parmenides: number (feminine difference, monads, dyads and triads, odd and even), the one and many, whole and parts, limited and unlimited, and extremes, the perfect and shape, with the Chaldean worlds they explain. Book V, chapters 1-11: the intellectual gods, their hebdomad (three fathers, three undefiled Kouretes, and the god who separates) and its seven hebdomads; Kronos, pure intellect, his bonds and his castration, the life under Kronos in the Statesman, his law, his agelessness; and Rhea, the life-giving mother, who is also Demeter.")

LINE = re.compile(r"^@(book|ch|p)\b\s*(.*)$")
ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50}


def roman(s):
    t = 0
    for i, c in enumerate(s):
        v = ROMAN[c]
        t += -v if i + 1 < len(s) and ROMAN[s[i + 1]] > v else v
    return t


def clean(s):
    """A paragraph of Taylor's as one line: italics' underscores out, one kind of space."""
    s = s.replace("_", "")
    return re.sub(r"\s+", " ", s).strip()


def footnotes(lines):
    """{n: text} of a volume's footnotes, from 'FOOTNOTES:' to the end of the book."""
    try:
        i = lines.index("FOOTNOTES:")
    except ValueError:
        return {}
    notes, cur = {}, None
    for line in lines[i + 1:]:
        if line.startswith("*** END"):
            break
        m = re.match(r"^\[(\d+)\]\s*(.*)$", line)
        if m:
            cur = int(m.group(1))
            notes[cur] = [m.group(2)]
        elif cur is not None:
            if not line.strip() and notes[cur] and not notes[cur][-1]:
                cur = None
                continue
            notes[cur].append(line)
    return {n: clean(" ".join(v)) for n, v in notes.items()}


# Where Taylor's printed text runs chapters together that his table of contents divides (Gutenberg reproduces it):
# Book III has headings for chapters I, II, III and then IX. The Workshop divides his paragraphs among the chapters his
# contents name, by their matter: {book: {printed chapter: [(chapter, paragraphs), ...]}}. Book III's chapter 1 is the
# introduction; 2, the axioms that prove the henads come after the One; 3, the henads joining beings to the One (the
# Parmenides' second hypothesis); 4, the Republic's light: every god a shared henad; 5, nearer henads shared by simpler
# beings; 6, being, life, intellect, soul and body; 7 and 8, the One again, and the two principles after it.
SPLITS = {
    "III": {1: [(1, 1), (2, 5), (3, 3)], 2: [(4, 1), (5, 2), (6, 7)], 3: [(7, 1), (8, 2)]},
}


def taylor():
    """Taylor's text: {book: {"chapters": [{"n": 1, "id": "I.1", "paras": [{"text", "notes"}]}]}}, and his chapter heads."""
    books = {}
    for name, first, vol, stops in VOLUMES:
        lines = (GUTENBERG / name).read_text(encoding="utf-8").splitlines()
        notes = footnotes(lines)
        # The text begins at the first book's heading after the volume's tables of contents.
        start = next(k for k, l in enumerate(lines) if l.strip() == f"BOOK {first}." and l.startswith("   ")
                     and any("Theology of Plato" in x for x in lines[k - 8:k]))
        book = chap = None
        for line in lines[start:]:
            # Gutenberg's text has Greek look-alikes in two headings: a Chi in "CHAPTER Χ." (Book I), and two Chis and an
            # Iota with varia in "CHAPTER ΧΧVῚ." (Book V).
            s = line.strip().replace("Χ", "X").replace("Ι", "I").replace("\u1fda", "I")
            if s in stops or s.startswith("*** END"):
                break
            m = re.fullmatch(r"BOOK ([IVX]+)\.", s)
            if m and line.startswith("   "):
                book = books.setdefault(m.group(1), {"chapters": [], "volume": vol})
                chap = None
                continue
            m = re.fullmatch(r"CHAPTER ([IVXL]+)\.", s)
            if m and line.startswith("   ") and book is not None:
                n = roman(m.group(1))
                bid = next(k for k, v in books.items() if v is book)
                chap = {"n": n, "id": f"{bid}.{n}", "lines": []}
                book["chapters"].append(chap)
                continue
            if chap is not None:
                chap["lines"].append(line)
        for b in books.values():
            for c in b["chapters"]:
                if "lines" not in c:
                    continue
                paras = []
                for block in re.split(r"\n\s*\n", "\n".join(c.pop("lines"))):
                    if not block.strip():
                        continue
                    refs = [int(x) for x in re.findall(r"\[(\d+)\]", block)]
                    text = clean(re.sub(r"\[(\d+)\]", "", block))
                    paras.append({"text": text, "notes": [{"n": r, "text": notes.get(r, "")} for r in refs]})
                c["paras"] = paras
    for bid, splits in SPLITS.items():
        if bid not in books:
            continue
        chapters = []
        for c in books[bid]["chapters"]:
            parts = splits.get(c["n"])
            if not parts:
                chapters.append(c)
                continue
            if sum(k for _, k in parts) != len(c["paras"]):
                raise ValueError(f"{c['id']}: SPLITS divides {sum(k for _, k in parts)} paragraphs, Taylor has {len(c['paras'])}")
            at = 0
            for n, k in parts:
                chapters.append({"n": n, "id": f"{bid}.{n}", "paras": c["paras"][at:at + k], "divided": True})
                at += k
        books[bid]["chapters"] = chapters
    heads = chapter_heads()
    for bid, b in books.items():
        for c in b["chapters"]:
            c["head"] = heads.get(c["id"], "")
    return books


def chapter_heads():
    """Taylor's heading of each chapter, from the table of contents before each book: {"I.1": "The Preface, in which ..."}."""
    heads = {}
    for name, _, _, _ in VOLUMES:
        lines = (GUTENBERG / name).read_text(encoding="utf-8").splitlines()
        book = None
        k = 0
        while k < len(lines):
            s = lines[k].strip()
            m = re.search(r"THE CHAPTERS OF BOOK ([IVX]+)\.$", s)
            if m:
                book = m.group(1)
                k += 1
                continue
            m = re.fullmatch(r"CHAPTER ([IVXL]+)\.", s.replace("Χ", "X").replace("\u1fda", "I"))
            if m and book:
                cid = f"{book}.{roman(m.group(1))}"
                body = []
                k += 1
                while k < len(lines) and not lines[k].strip():
                    k += 1
                while k < len(lines) and lines[k].strip() and lines[k].startswith("    ") and not lines[k].strip().startswith("CHAPTER"):
                    body.append(lines[k])
                    k += 1
                if cid not in heads and body:
                    heads[cid] = clean(re.sub(r"\[\d+\]", "", " ".join(body)))   # without his footnote numbers
                continue
            k += 1
    return heads


def load_terms():
    return json.loads((MODERN / "terms.json").read_text(encoding="utf-8"))


def parse(src):
    """The master copy as books, chapters and paragraphs, in order."""
    books, chapters, paras = [], [], []
    cur = None
    for n, raw in enumerate(src.splitlines(), 1):
        line = raw.rstrip()
        if line.startswith("#"):
            continue
        m = LINE.match(line)
        if m:
            kind, rest = m.groups()
            if kind in ("book", "ch"):
                key, _, title = rest.partition("|")
                cur = {"id": key.strip(), "title": title.strip(), "summary": [], "line": n}
                if kind == "book":
                    cur["chapters"] = []
                    books.append(cur)
                else:
                    if not books:
                        raise ValueError(f"line {n}: @ch before the first @book")
                    cur["treatise"] = books[-1]["id"]
                    books[-1]["chapters"].append(cur["id"])
                    chapters.append(cur)
            else:
                if not chapters:
                    raise ValueError(f"line {n}: @p before the first @ch")
                k = sum(1 for p in paras if p["chapter"] == chapters[-1]["id"]) + 1
                cur = {"seg": f"{chapters[-1]['id']}.p{k}", "chapter": chapters[-1]["id"], "lines": [], "flags": [], "notes": [], "line": n}
                paras.append(cur)
            continue
        if line.startswith("!flag ") or line.startswith("!note "):
            if not cur or "lines" not in cur:
                raise ValueError(f"line {n}: {line.split()[0]} outside a paragraph")
            if line.startswith("!flag "):
                words, sep, why = line[6:].partition(" | ")
                if not sep:
                    raise ValueError(f"line {n}: !flag <Taylor's words> | <why>")
                cur["flags"].append({"taylor": words.strip(), "why": why.strip()})
            else:
                cur["notes"].append(line[6:].strip())
            continue
        if cur is None:
            if line.strip():
                raise ValueError(f"line {n}: text before the first @book")
            continue
        (cur["lines"] if "lines" in cur else cur["summary"]).append(line)
    for x in books + chapters:
        x["summary"] = " ".join(s.strip() for s in x["summary"] if s.strip())
    for p in paras:
        p["modern"] = re.sub(r"\n{2,}", "\n", "\n".join(p.pop("lines")).strip())
    return books, chapters, paras


def rules_for(terms):
    """The rules of terms.json that apply to the Theology: those for every text, and those named for it."""
    return [r for r in terms["terms"] if TEXT in r.get("texts", [TEXT])]


def build(terms=None, books=None):
    """The JSON the reader shows, and the problems found (a list of strings)."""
    terms = terms or load_terms()
    books = books or taylor()
    mb, mc, mp = parse((MODERN / f"{TEXT}.txt").read_text(encoding="utf-8"))
    problems = []
    # Taylor's chapters, in order, from I.1, none skipped.
    order = [c["id"] for b in BOOKS for c in books.get(b, {}).get("chapters", [])]
    done = [c["id"] for c in mc]
    if done != order[:len(done)]:
        problems.append(f"the chapters done are not Taylor's from I.1 in order: {', '.join(done[:12])}")
    if [b["id"] for b in mb] != [x for x in BOOKS if any(c.startswith(x + ".") for c in done)]:
        problems.append(f"the books are not Proclus' in order, or a book has no chapter: {', '.join(b['id'] for b in mb)}")
    for b in mb:
        if any(not c.startswith(b["id"] + ".") for c in b["chapters"]):
            problems.append(f"Book {b['id']} holds a chapter of another book")
    tchap = {c["id"]: c for b in books.values() for c in b["chapters"]}
    for c in mc:
        t = tchap.get(c["id"])
        if not t:
            problems.append(f"{c['id']}: not one of Taylor's chapters")
            continue
        mine = [p for p in mp if p["chapter"] == c["id"]]
        if len(mine) != len(t["paras"]):
            problems.append(f"{c['id']}: {len(mine)} modern paragraphs for Taylor's {len(t['paras'])}")
        if not c["title"] or not c["summary"]:
            problems.append(f"{c['id']}: no title or no summary")
    for b in mb:
        if not b["title"] or not b["summary"]:
            problems.append(f"Book {b['id']}: no title or no summary")
    # Each paragraph: its text, its flags found in Taylor's paragraph, the key words.
    rules = rules_for(terms)
    exceptions = terms.get("exceptions", {}).get(TEXT, {})
    forbidden = terms.get("forbidden", {}).get(TEXT, [])
    known = modern.term_ids()
    for r in rules:
        if r.get("term") and r["term"] not in known:
            problems.append(f"terms.json: {r['term']!r} is not a key term or a concept")
    used = set()
    for p in mp:
        t = tchap.get(p["chapter"])
        k = int(p["seg"].rsplit(".p", 1)[1]) - 1
        src = t["paras"][k]["text"] if t and k < len(t["paras"]) else None
        p["taylor"] = src
        if not p["modern"]:
            problems.append(f"{p['seg']}: no modern text")
        for f in p["flags"]:
            if not f["why"]:
                problems.append(f"{p['seg']}: a flag with no reason")
            if src is None or f["taylor"] not in src:
                problems.append(f"{p['seg']}: flagged words not in Taylor's paragraph: {f['taylor']!r}")
        for w in forbidden:
            if re.search(r"(?<![\w-])" + re.escape(w), p["modern"], re.I):
                problems.append(f"{p['seg']}: the modern version uses {w!r}, which the Theology never uses (see terms.json, 'forbidden')")
        if src is None:
            continue
        for r in rules:
            case = r.get("case", False)
            hit = [f for f in r["taylor"] if modern.has_form(src, f, case)]
            if not hit or any(modern.has_modern(p["modern"], m, case) for m in r["modern"]):
                continue
            key = f"{p['seg']}:{r['taylor'][0]}"
            if key in exceptions:
                used.add(key)
                continue
            problems.append(f"{p['seg']}: Taylor has {hit[0]!r}, the modern version none of {r['modern']}")
    for key in exceptions:
        if key not in used:
            problems.append(f"terms.json: exception {key!r} is not needed, or names no paragraph of the Theology")
    links = [{"term": r["term"], "forms": r["link"]} for r in rules if r.get("term") and r.get("link")]
    links += [{"term": x["term"], "forms": x["link"]} for x in terms.get("extra_links", []) if x.get("link") and x["term"] in known]
    d = {
        "schema": SCHEMA,
        "text": TEXT,
        "kind": "theology",
        "title": TITLE,
        "author": "Proclus",
        "by": "Workshop modern version",
        "machine_assisted": True,
        "label": LABEL,
        "made_from": "taylor",
        "greek_text": None,
        "taylor_work": None,
        "taylor_title": "Taylor, The Theology of Plato (1816)",
        "taylor_source": "Thomas Taylor, The Six Books of Proclus, the Platonic Successor, on the Theology of Plato, 2 vols (London, 1816), "
                         "Project Gutenberg's proofread transcription (sources/taylor-gutenberg/pg77393.txt and pg78800.txt)",
        "about": ABOUT,
        "source": f"sources/translations/modern/{TEXT}.txt",
        "treatises": [{"id": b["id"], "title": b["title"], "summary": b["summary"], "chapters": b["chapters"]} for b in mb],
        "chapters": [],
        "paragraphs": [],
        "contents": [],
        "links": links,
    }
    for c in mc:
        t = tchap.get(c["id"], {"paras": [], "head": "", "n": 0})
        d["chapters"].append({"id": c["id"], "treatise": c["treatise"], "title": c["title"], "summary": c["summary"],
                              "taylor_head": t["head"],
                              "taylor": [{"n": k + 1, "label": f"Book {c['treatise']}, chapter {t['n']}, paragraph {k + 1}",
                                          "text": x["text"], "notes": x["notes"]} for k, x in enumerate(t["paras"])]})
    for p in mp:
        item = {"seg": p["seg"], "chapter": p["chapter"], "modern": p["modern"]}
        if p["flags"]:
            item["flags"] = p["flags"]
        if p["notes"]:
            item["notes"] = p["notes"]
        d["paragraphs"].append(item)
    have = set(done)
    for bid in BOOKS:
        chs = books.get(bid, {}).get("chapters", [])
        d["contents"].append({"id": bid, "title": next((b["title"] for b in mb if b["id"] == bid), ""),
                              "chapters": [{"id": c["id"], "head": c["head"], "done": c["id"] in have,
                                            "title": next((x["title"] for x in mc if x["id"] == c["id"]), "")} for c in chs]})
    return d, problems


def report(d, problems, books):
    tw = sum(len(x["text"].split()) for c in d["chapters"] for x in c["taylor"])
    mw = sum(len(p["modern"].split()) for p in d["paragraphs"])
    allw = sum(len(x["text"].split()) for b in BOOKS for c in books.get(b, {}).get("chapters", []) for x in c["paras"])
    flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
    lines = ["# Proclus, The Theology of Plato, in modern English", "",
             "Written by `tools/modern_theology.py` from `sources/translations/modern/proclus-theology.txt`. " + LABEL, "",
             f"- Made from: Taylor's English (1816), Project Gutenberg's transcription; no Greek of the Theology is on the site.",
             f"- Chapters done: {len(d['chapters'])} of {sum(len(books.get(b, {}).get('chapters', [])) for b in BOOKS)} in Proclus' six books"
             f" ({', '.join(c['id'] for c in d['chapters'][:1])} to {d['chapters'][-1]['id'] if d['chapters'] else '-'}).",
             f"- Paragraphs: {len(d['paragraphs'])}, one for each of Taylor's in those chapters.",
             f"- Words: {mw:,} modern, {tw:,} of Taylor's ({allw:,} in all six books).",
             f"- Sentences (each can be marked in the reader): {sum(len(modern.sentences(p['modern'])) for p in d['paragraphs']):,}.",
             f"- Flags (hard places, or where Taylor's English misleads): {len(flags)}.",
             f"- Problems found: {len(problems)}.", ""]
    if problems:
        lines += ["## Problems", ""] + [f"- {x}" for x in problems] + [""]
    lines += ["## The books and chapters", "", "| Book | Taylor's chapters | Done here |", "|---|---:|---:|"]
    for c in d["contents"]:
        lines.append(f"| {c['id']} | {len(c['chapters'])} | {sum(x['done'] for x in c['chapters'])} |")
    lines += ["", "## Flags", "", "| Paragraph | Taylor's words | Why |", "|---|---|---|"]
    for seg, f in flags:
        lines.append(f"| {seg} | {f['taylor'].replace('|', '/')} | {f['why'].replace('|', '/')} |")
    terms = load_terms()
    lines += ["", "## The fixed renderings", "", "| Taylor | Modern | Why |", "|---|---|---|"]
    for r in rules_for(terms):
        lines.append(f"| {', '.join(r['taylor'])} | {', '.join(r['modern'])} | {r.get('why', '')} |")
    lines += ["", "Never used in the modern version: " + ", ".join(f"'{w}'" for w in terms.get("forbidden", {}).get(TEXT, [])) + "."]
    return "\n".join(lines).rstrip() + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true", help="only check; exit 1 on a problem")
    args = ap.parse_args()
    books = taylor()
    d, problems = build(books=books)
    print(f"{TEXT}: {len(d['chapters'])} chapters, {len(d['paragraphs'])} paragraphs, {len(problems)} problems")
    for x in problems:
        print("  " + x)
    n = len(problems)
    out = MODERN / f"{TEXT}.json"
    if args.check:
        if not out.exists() or json.loads(out.read_text(encoding="utf-8")) != json.loads(json.dumps(d, ensure_ascii=False)):
            print(f"{out.relative_to(ROOT)} is out of date: run python3 tools/modern_theology.py")
            n += 1
    else:
        out.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        REPORT.write_text(report(d, problems, books), encoding="utf-8")
    sys.exit(1 if n and args.check else 0)


if __name__ == "__main__":
    main()
