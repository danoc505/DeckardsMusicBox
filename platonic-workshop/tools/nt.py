#!/usr/bin/env python3
"""Milestone 23: the Greek New Testament, on its own shelf beside Plato.

Two sources, both free to reuse (sources/manifest.json quotes the licences):

  morphgnt-sblgnt  the SBL Greek New Testament (2010, CC BY 4.0) with MorphGNT's
                   dictionary form and grammar of every word (CC BY-SA 3.0), one
                   word a line: book/chapter/verse, part of speech, parse, the
                   text with punctuation, the word, the word normalised, the lemma.
  asv-1901         the American Standard Version (1901, public domain), one verse
                   a line, from eBible.org (sources/asv-1901/).

How it is read (all here, nothing guessed):

1. Each of the 27 books is a work of its own, corpus 'nt', with the CTS address
   of the New Testament (urn:cts:greekLit:tlg0031.tlg001 is Matthew). A verse
   is a section, cited 'chapter:verse' ('3:16'); a chapter is a page.
2. The verses are those of either text, in order: a verse the ASV leaves empty
   (it put Matthew 17:21 and fifteen others in its margin) and SBLGNT leaves out
   is not a section; a verse in one text only has that text only.
3. The Greek of a verse is MorphGNT's text column, word after word, with the
   marks of the SBLGNT apparatus (⸀ ⸂ ⸃, which point to variant readings the
   apparatus gives) left out, since the apparatus is not here. Every word is a
   token with MorphGNT's lemma and parse, turned into the 9-letter tag the
   reader already decodes (MORPHGNT_POS below; MorphGNT's own code is kept).
4. Morpheus's every possible grammar is looked up for every form, as for Plato.
5. Key terms (milestone 17): a word is marked where its MorphGNT lemma is one of
   a term's lemmas, by the term's own rule (a very common word only with the
   article, as in Plato). Kept in nt_term_hit, apart from Plato's term_hit, so
   that every count of Plato stays Plato's.
6. Word counts for the concordance are kept in nt_lemma_count and nt_form_count,
   apart from Plato's, for the same reason.

Called by build_db.py: lemmas() before the dictionaries (so that every New
Testament word has its entries), build() at the very end (so that nothing
built from Plato reads it). Standard library only.

    python3 tools/nt.py --check      # read both sources and print what they hold
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "morphgnt-sblgnt"
ASV = ROOT / "sources" / "asv-1901" / "eng-asv_vpl-nt.txt"
TERMS_JSON = ROOT / "sources" / "terms" / "terms.json"
REPORT = ROOT / "reports" / "nt.md"
SRC = "morphgnt-sblgnt"
ASV_SRC = "asv-1901"
NT_URN = "urn:cts:greekLit:tlg0031"

# MorphGNT file, ASV code, title, address-bar name, SBL abbreviation, the Library's group, a plain description.
BOOKS = [
    ("61-Mt", "MAT", "Matthew", "Mt", "Gospels and Acts", "The Gospel according to Matthew"),
    ("62-Mk", "MAR", "Mark", "Mk", "Gospels and Acts", "The Gospel according to Mark"),
    ("63-Lk", "LUK", "Luke", "Lk", "Gospels and Acts", "The Gospel according to Luke"),
    ("64-Jn", "JOH", "John", "Jn", "Gospels and Acts", "The Gospel according to John; it opens with the Word, the logos"),
    ("65-Ac", "ACT", "Acts", "Acts", "Gospels and Acts", "The Acts of the Apostles; Paul speaks to the philosophers of Athens in chapter 17"),
    ("66-Ro", "ROM", "Romans", "Rom", "Paul's letters", "Paul's letter to the Romans"),
    ("67-1Co", "1CO", "1 Corinthians", "1 Cor", "Paul's letters", "Paul's first letter to the Corinthians"),
    ("68-2Co", "2CO", "2 Corinthians", "2 Cor", "Paul's letters", "Paul's second letter to the Corinthians"),
    ("69-Ga", "GAL", "Galatians", "Gal", "Paul's letters", "Paul's letter to the Galatians"),
    ("70-Eph", "EPH", "Ephesians", "Eph", "Paul's letters", "The letter to the Ephesians"),
    ("71-Php", "PHI", "Philippians", "Phil", "Paul's letters", "Paul's letter to the Philippians"),
    ("72-Col", "COL", "Colossians", "Col", "Paul's letters", "The letter to the Colossians"),
    ("73-1Th", "1TH", "1 Thessalonians", "1 Thess", "Paul's letters", "Paul's first letter to the Thessalonians"),
    ("74-2Th", "2TH", "2 Thessalonians", "2 Thess", "Paul's letters", "The second letter to the Thessalonians"),
    ("75-1Ti", "1TI", "1 Timothy", "1 Tim", "Paul's letters", "The first letter to Timothy"),
    ("76-2Ti", "2TI", "2 Timothy", "2 Tim", "Paul's letters", "The second letter to Timothy"),
    ("77-Tit", "TIT", "Titus", "Titus", "Paul's letters", "The letter to Titus"),
    ("78-Phm", "PHM", "Philemon", "Phlm", "Paul's letters", "Paul's letter to Philemon"),
    ("79-Heb", "HEB", "Hebrews", "Heb", "Other letters and Revelation", "The letter to the Hebrews"),
    ("80-Jas", "JAM", "James", "Jas", "Other letters and Revelation", "The letter of James"),
    ("81-1Pe", "1PE", "1 Peter", "1 Pet", "Other letters and Revelation", "The first letter of Peter"),
    ("82-2Pe", "2PE", "2 Peter", "2 Pet", "Other letters and Revelation", "The second letter of Peter"),
    ("83-1Jn", "1JO", "1 John", "1 Jn", "Other letters and Revelation", "The first letter of John"),
    ("84-2Jn", "2JO", "2 John", "2 Jn", "Other letters and Revelation", "The second letter of John"),
    ("85-3Jn", "3JO", "3 John", "3 Jn", "Other letters and Revelation", "The third letter of John"),
    ("86-Jud", "JUD", "Jude", "Jude", "Other letters and Revelation", "The letter of Jude"),
    ("87-Re", "REV", "Revelation", "Rev", "Other letters and Revelation", "The Revelation to John (the Apocalypse)"),
]

SBLGNT_PRINTED = ("The SBL Greek New Testament, ed. Michael W. Holmes (Atlanta: Society of Biblical Literature; "
                  "Bellingham: Logos Bible Software, 2010)")
SBLGNT_NOTICE = ("Scripture quotations marked SBLGNT are from the SBL Greek New Testament. Copyright © 2010 Society of "
                 "Biblical Literature and Logos Bible Software. Licensed CC BY 4.0. Dictionary forms and grammar: MorphGNT "
                 "(Tauber, ed., MorphGNT: SBLGNT Edition), CC BY-SA 3.0.")
ASV_PRINTED = "The Holy Bible ... Newly Edited by the American Revision Committee A.D. 1901, Standard Edition (New York: Thomas Nelson & Sons, 1901)"
APPARATUS = re.compile(r"[⸀-⸅]\d?")

# MorphGNT's part of speech -> the 9-letter tag's first letter, and its own name for it.
MORPHGNT_POS = {
    "A-": ("a", "adjective"), "C-": ("c", "conjunction"), "D-": ("d", "adverb"), "I-": ("i", "interjection"),
    "N-": ("n", "noun"), "P-": ("r", "preposition"), "RA": ("l", "article"), "RD": ("p", "demonstrative pronoun"),
    "RI": ("p", "interrogative or indefinite pronoun"), "RP": ("p", "personal pronoun"), "RR": ("p", "relative pronoun"),
    "V-": ("v", "verb"), "X-": ("g", "particle"),
}
# MorphGNT's parse: person, tense, voice, mood, case, number, gender, degree.
_TENSE = {"P": "p", "I": "i", "F": "f", "A": "a", "X": "r", "Y": "l"}
_VOICE = {"A": "a", "M": "m", "P": "p"}
_MOOD = {"I": "i", "D": "m", "S": "s", "O": "o", "N": "n", "P": "p"}


def postag(pos, parse):
    """MorphGNT's ('V-', '3AAI-S--') -> the AGDT 9-letter tag 'v3saia---'
    (part of speech, person, number, tense, mood, voice, gender, case, degree)."""
    p = (parse + "--------")[:8]
    person, tense, voice, mood, case, number, gender, degree = p
    return "".join([
        MORPHGNT_POS[pos][0],
        person if person in "123" else "-",
        number.lower() if number in "SP" else "-",
        _TENSE.get(tense, "-"),
        _MOOD.get(mood, "-"),
        _VOICE.get(voice, "-"),
        gender.lower() if gender in "MFN" else "-",
        case.lower() if case in "NGDAV" else "-",
        degree.lower() if degree in "CS" else "-",
    ])


def slug(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def work_id(i):
    return f"nt{i + 1:02d}"


def read_morphgnt(code):
    """[(chapter, verse, [word dicts])] in order, for one book file."""
    verses = []
    for n, line in enumerate((RAW / f"{code}-morphgnt.txt").read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        bcv, pos, parse, text, word, norm, lemma = line.split(" ")
        c, v = int(bcv[2:4]), int(bcv[4:6])
        if not verses or verses[-1][:2] != (c, v):
            verses.append((c, v, []))
        verses[-1][2].append({"bcv": bcv, "pos": pos, "parse": parse, "text": greek.nfc(text), "word": greek.nfc(word),
                              "norm": greek.nfc(norm), "lemma": greek.nfc(lemma), "line": n})
    return verses


def read_asv():
    """{ASV code: {(chapter, verse): text}}; an empty verse is kept as ''."""
    out = defaultdict(dict)
    for line in ASV.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^(\w{3}) (\d+):(\d+) ?(.*)$", line)
        if not m:
            raise SystemExit(f"nt: an ASV line not read: {line[:60]!r}")
        out[m.group(1)][(int(m.group(2)), int(m.group(3)))] = m.group(4).strip()
    return out


def alternates(lemma):
    """Where the dictionaries of Plato's Greek file a word of the New Testament they spell or cite
    otherwise: [(headword, why)], most likely first. Each is offered only if that headword has an
    entry, and the reader says which headword it is."""
    out = []
    if "γιν" in lemma:
        out.append((lemma.replace("γιν", "γιγν", 1), f"the Attic spelling of {lemma}"))
    if lemma.endswith("ομαι"):
        act = lemma[:-4] + "ω"
        out.append((act, "its active form"))
        if "γιν" in act:
            out.append((act.replace("γιν", "γιγν", 1), "its active form, in the Attic spelling"))
    if lemma.endswith("γω"):
        out.append((lemma[:-1] + "νυμι", f"the form in -νυμι of {lemma}"))
    if lemma.endswith("ιον"):
        out.append((lemma[:-1] + "ς", "the adjective it is the neuter of"))
    return [(greek.nfc(a), why) for a, why in out if a != lemma]


def lemmas():
    """Every lemma MorphGNT gives (and the headwords it may be filed under), and every form,
    for the dictionaries and Morpheus (before they are built)."""
    lem, forms = set(), set()
    for code, *_ in BOOKS:
        for _, _, words in read_morphgnt(code):
            for w in words:
                lem.add(w["lemma"])
                forms.add(w["word"])
    lem |= {a for l in list(lem) for a, _ in alternates(l)}
    return lem, forms


def link_entries(db, nt_lemmas):
    """A lemma with no entry of its own is given the entries of the first alternate headword that
    has some, marked 'under <headword>: <why>'. Returns how many lemmas were so linked."""
    have = {r[0] for r in db.execute("SELECT DISTINCT lemma FROM lemma_entry")}
    n = 0
    for l in sorted(nt_lemmas - have):
        for alt, why in alternates(l):
            if alt in have:
                db.execute("INSERT OR IGNORE INTO lemma_entry SELECT ?, lexicon_id, entry_id, ? FROM lemma_entry WHERE lemma = ?",
                           (l, f"under {alt}: {why}", alt))
                n += 1
                break
    return n


def greek_verse(words):
    """The verse as printed, without the apparatus marks, and each word's place in it."""
    text, spans = "", []
    for w in words:
        shown = APPARATUS.sub("", w["text"])
        at = shown.find(w["word"])
        if at < 0:
            raise SystemExit(f"nt: {w['bcv']}: {w['word']!r} not in {w['text']!r}")
        if text:
            text += " "
        spans.append((len(text) + at, len(text) + at + len(w["word"])))
        text += shown
    return text, spans


def term_rules(db):
    """The terms' lemmas and rules as the build wrote them (term_lemma), with the exceptions terms.json gives."""
    excepts = {}
    if TERMS_JSON.exists():
        for t in json.loads(TERMS_JSON.read_text(encoding="utf-8")).get("terms", []):
            for x in t.get("lemmas", []):
                if isinstance(x, dict) and x.get("except"):
                    excepts[(t["id"], x["lemma"])] = tuple(x["except"])
    by_lemma = defaultdict(list)
    for term_id, lemma, rule in db.execute("SELECT term_id, lemma, rule FROM term_lemma"):
        if rule != "none":
            by_lemma[lemma].append((term_id, rule, excepts.get((term_id, lemma), ())))
    return by_lemma


def build(db, morpheus_lines, parse_morpheus):
    """Write the 27 books into the library. Returns the figures for reports/nt.md."""
    import terms  # noqa: E402  (after the terms are built)
    asv = read_asv()
    stats = {"books": [], "verses": 0, "words": 0, "tagged": 0, "with_morpheus": 0, "greek_only": [], "english_only": [],
             "asv_empty": [], "lemmas": 0}
    tok_keys, all_forms = {}, set()
    books = []
    for i, (code, acode, title, abbr, group, plain) in enumerate(BOOKS):
        books.append((i, code, acode, title, abbr, group, plain, read_morphgnt(code)))
        for _, _, words in books[-1][-1]:
            for w in words:
                all_forms.add(w["word"])
    for f in all_forms:
        tok_keys[f] = greek.lookup_keys(f)
    morph = morpheus_lines({k for ks in tok_keys.values() for k in ks})
    for key, rest in morph.items():
        for n, (lemma, gloss, parse) in enumerate(parse_morpheus(rest)):
            db.execute("INSERT OR IGNORE INTO morph VALUES (?,?,?,?,?,?,?)",
                       (key, n, lemma, greek.from_betacode(lemma), gloss, parse, "morpheus-analyses"))
    rules = term_rules(db)
    term_hits = []
    lemma_n, form_n = Counter(), Counter()
    for i, code, acode, title, abbr, group, plain, verses in books:
        wid = work_id(i)
        urn = f"{NT_URN}.tlg{i + 1:03d}"
        db.execute("INSERT INTO work (id, urn, title, imported, abbr, slug, corpus) VALUES (?,?,?,?,?,?,?)",
                   (wid, urn, title, 1, abbr, slug(title), "nt"))
        eng = asv.get(acode, {})
        grc = {(c, v): words for c, v, words in verses}
        refs = sorted(set(grc) | {k for k, t in eng.items() if t})
        for k, t in eng.items():
            if not t:
                stats["asv_empty"].append(f"{title} {k[0]}:{k[1]}")
        for seq, (c, v) in enumerate(refs):
            db.execute("INSERT INTO section VALUES (?,?,?,?,?,?)", (wid, f"{c}:{v}", c, str(v), seq, f"{urn}:{c}.{v}"))
            if (c, v) not in grc:
                stats["english_only"].append(f"{title} {c}:{v}")
            if not eng.get((c, v)):
                if (c, v) in grc:
                    stats["greek_only"].append(f"{title} {c}:{v}")
        g_ed, e_ed = f"{wid}.sblgnt", f"{wid}.asv"
        db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status, translator_note, align_method) "
                   "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                   (g_ed, wid, SRC, "grc", "text", "SBLGNT (2010)", "Michael W. Holmes", SBLGNT_PRINTED + ". " + SBLGNT_NOTICE,
                    f"{code}-morphgnt.txt", "clean source text", None, "printed"))
        db.execute("INSERT INTO edition (id, work_id, source_id, lang, role, label, responsible, printed, file, proof_status, translator_note, align_method) "
                   "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                   (e_ed, wid, ASV_SRC, "eng", "translation", "ASV (1901)", "the American Revision Committee", ASV_PRINTED,
                    "sources/asv-1901/eng-asv_vpl-nt.txt", "clean source text",
                    "The American Standard Version, the American edition of the Revised Version of 1881, itself a revision of the "
                    "King James Version; its verse numbers are printed. Square brackets as eBible.org prints them, mostly words the "
                    "translators supplied (italic in the printed book).", "printed"))
        n_words = n_tagged = 0
        for seq, (c, v) in enumerate(refs):
            ref = f"{c}:{v}"
            words = grc.get((c, v))
            if words:
                text, spans = greek_verse(words)
                cid = db.execute("INSERT INTO chunk (edition_id, work_id, section_ref, seq, para, text, align_method, printed_at) VALUES (?,?,?,?,?,?,?,?)",
                                 (g_ed, wid, ref, seq, seq, text, "printed", f"MorphGNT {code}-morphgnt.txt, line {words[0]['line']}")).lastrowid
                prev = []
                for n, (w, (s, e)) in enumerate(zip(words, spans), start=1):
                    form = w["word"]
                    mkey = next((k for k in tok_keys[form] if k in morph), None)
                    tid = db.execute("INSERT INTO token (chunk_id, edition_id, section_ref, seq, start, end, form, plain, morph_key) VALUES (?,?,?,?,?,?,?,?,?)",
                                     (cid, g_ed, ref, n, s, e, form, greek.strip_accents(form).rstrip(greek.APOSTROPHES), mkey)).lastrowid
                    tag = postag(w["pos"], w["parse"])
                    db.execute("INSERT INTO tag VALUES (?,?,?,?,?,?,?,?,?,?)",
                               (tid, SRC, 0, w["lemma"], tag, None, "morphgnt", f"{w['bcv']} {w['pos']} {w['parse']}", w["norm"], "same-word"))
                    n_words += 1
                    n_tagged += 1
                    stats["with_morpheus"] += mkey is not None
                    lemma_n[(w["lemma"], wid)] += 1
                    form_n[(form, wid)] += 1
                    t = {"lemma": w["lemma"], "postag": tag, "form": form}
                    for term_id, rule, except_ in rules.get(w["lemma"], ()):
                        if rule == "all" or terms.articular(prev, t, form, except_):
                            term_hits.append((term_id, tid, wid, ref, form))
                    prev.append(t)
            if eng.get((c, v)):
                db.execute("INSERT INTO chunk (edition_id, work_id, section_ref, seq, para, text, align_method, printed_at) VALUES (?,?,?,?,?,?,?,?)",
                           (e_ed, wid, ref, seq, seq, eng[(c, v)], "printed", f"eBible.org eng-asv_vpl.txt, {acode} {c}:{v}"))
        chapters = defaultdict(list)
        for c, v in refs:
            chapters[c].append(f"{c}:{v}")
        for c, rs in chapters.items():
            db.execute("INSERT INTO division (work_id, kind, label, start_ref, end_ref, source_id, basis) VALUES (?,?,?,?,?,?,?)",
                       (wid, "page", f"Chapter {c}", rs[0], rs[-1], SRC, "the chapter and verse numbers of MorphGNT and the ASV"))
        stats["books"].append({"work": wid, "title": title, "group": group, "plain": plain, "chapters": len(chapters),
                               "verses": len(refs), "words": n_words})
        stats["verses"] += len(refs)
        stats["words"] += n_words
        stats["tagged"] += n_tagged
    db.execute("""UPDATE work SET first_token = r.lo, last_token = r.hi, n_tokens = r.n FROM
                  (SELECT e.work_id, min(t.id) lo, max(t.id) hi, count(*) n FROM token t JOIN edition e ON e.id = t.edition_id
                   WHERE e.lang = 'grc' AND e.source_id = ? GROUP BY e.work_id) r WHERE r.work_id = work.id""", (SRC,))
    plain = lambda s: greek.strip_accents(re.sub(r"\d", "", s or "")).rstrip(greek.APOSTROPHES)
    db.executemany("INSERT INTO nt_lemma_count VALUES (?,?,?,?)", [(l, plain(l), w, n) for (l, w), n in lemma_n.items()])
    db.executemany("INSERT INTO nt_form_count VALUES (?,?,?,?)", [(f, plain(f), w, n) for (f, w), n in form_n.items()])
    db.executemany("INSERT OR IGNORE INTO nt_term_hit VALUES (?,?,?,?,?)", term_hits)
    stats["lemmas"] = len({l for l, _ in lemma_n})
    plato = {r[0] for r in db.execute("SELECT DISTINCT lemma FROM lemma_count")}
    stats["lemmas_also_in_plato"] = len({l for l, _ in lemma_n} & plato)
    stats["term_words"] = len(term_hits)
    stats["terms_marked"] = len({h[0] for h in term_hits})
    key = {r[0] for r in db.execute("SELECT id FROM term WHERE key = 1")}
    per = Counter(h[0] for h in term_hits if h[0] in key)
    stats["key_term_words"] = sum(per.values())
    stats["key_terms_marked"] = len(per)
    labels = dict(db.execute("SELECT id, label FROM term"))
    stats["most_marked_terms"] = [[labels.get(t, t), n] for t, n in per.most_common(12)]
    nt_lemmas = {l for l, _ in lemma_n}
    stats["lemmas_under_another_headword"] = link_entries(db, nt_lemmas)
    have = {r[0] for r in db.execute("SELECT DISTINCT lemma FROM lemma_entry")}
    stats["lemmas_with_entry"] = len(nt_lemmas & have)
    stats["lemmas_without_entry_examples"] = sorted(nt_lemmas - have, key=lambda l: -sum(n for (x, _), n in lemma_n.items() if x == l))[:20]
    db.execute("INSERT INTO build VALUES ('nt_stats', ?)", (json.dumps({k: v for k, v in stats.items() if k != "books"}, ensure_ascii=False),))
    db.execute("INSERT INTO build VALUES ('nt_books', ?)", (json.dumps(stats["books"], ensure_ascii=False),))
    return stats


def write_report(stats):
    pct = lambda a, b: f"{100 * a / b:.1f}%" if b else "-"
    s = stats
    lines = ["# The Greek New Testament: what the import found", "",
             "Written by `tools/nt.py` when the library is built (milestone 23); every figure is counted from the build.", "",
             f"**27 books, {s['verses']:,} verses, {s['words']:,} Greek words**, every one with MorphGNT's dictionary form and grammar "
             f"({s['tagged']:,}); Morpheus has every possible grammar for {s['with_morpheus']:,} of them ({pct(s['with_morpheus'], s['words'])}). "
             f"{s['lemmas']:,} dictionary forms, {s['lemmas_also_in_plato']:,} of them also in Plato (as GLAUx marks Plato's words); "
             f"{s['lemmas_with_entry']:,} ({pct(s['lemmas_with_entry'], s['lemmas'])}) have an entry in Middle Liddell or LSJ, "
             f"{s['lemmas_under_another_headword']:,} of them filed under another headword the reader names (γινώσκω under the Attic γιγνώσκω, "
             "a deponent under its active form, nt.alternates).", "",
             "Sources: the SBL Greek New Testament (2010, CC BY 4.0) with MorphGNT's tagging (CC BY-SA 3.0), "
             "`morphgnt-sblgnt` in `sources/manifest.json`; the American Standard Version (1901, public domain), `sources/asv-1901/`.", "",
             "| Book | Chapters | Verses | Greek words |", "|---|---:|---:|---:|"]
    lines += [f"| {b['title']} (`{b['work']}`) | {b['chapters']} | {b['verses']} | {b['words']:,} |" for b in s["books"]]
    lines += ["", f"**Verses in one text only.** In the Greek and not the ASV: {', '.join(s['greek_only']) or 'none'}. "
              f"In the ASV and not the Greek: {', '.join(s['english_only']) or 'none'}.", "",
              f"**Verses the ASV prints empty** ({len(s['asv_empty'])}; it put them in its margin as not in the oldest manuscripts): "
              f"{', '.join(s['asv_empty'])}.", "",
              f"**Key terms.** {s['key_term_words']:,} words of the New Testament are underlined as {s['key_terms_marked']} of the Workshop's key terms, by "
              "MorphGNT's lemma and the term's own rule, as in Plato (and, as there, the terms only the Definitions define are found "
              f"but not underlined: {s['term_words']:,} words in all, of {s['terms_marked']} terms). They are kept apart from Plato's (`nt_term_hit`). Most underlined: "
              + ", ".join(f"{t} {n:,}" for t, n in s["most_marked_terms"]) + ".", "",
              "**Words without a dictionary entry** (mostly names), the most frequent: "
              + ", ".join(s["lemmas_without_entry_examples"]) + ".", "",
              "**Not done.** Westcott and Hort's Greek (1881) as a second text: the roadmap offers it as optional, and no tagged "
              "copy with a licence to reuse it was found to pin; the SBLGNT apparatus (the variant readings its marks ⸀ ⸂ ⸃ point to) "
              "is not here, so the marks are left out of the text shown.", ""]
    REPORT.write_text("\n".join(lines), encoding="utf-8")


def main():
    if "--check" in sys.argv:
        asv = read_asv()
        for code, acode, title, *_ in BOOKS:
            verses = read_morphgnt(code)
            print(f"{title}: {len(verses)} Greek verses, {sum(len(w) for _, _, w in verses)} words; "
                  f"{sum(1 for t in asv[acode].values() if t)} ASV verses")
        return
    print(__doc__)


if __name__ == "__main__":
    main()
