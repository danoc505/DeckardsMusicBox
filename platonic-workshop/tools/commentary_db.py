#!/usr/bin/env python3
"""Milestone 7: put the commentaries of texts/commentary/<work>/ into the
library, each note anchored to its Stephanus passage and, where the
commentator quotes the Greek, to the Greek words themselves.

Called by build_db.py after the texts and translations are in. Every note
says how its place was found (note.anchor_method, with the evidence in
note.anchor_detail), and whether that place is computed (note.computed = 1,
shown ≈) or rests on what is printed:

  quoted Greek            The commentator quotes Greek words (Archer-Hind's
                          lemmata). They are found in Burnet's text, searching
                          forward from the note before and from the Stephanus
                          reference at the head of Archer-Hind's page. Found
                          word for word (accents and breathings ignored, since
                          the OCR misreads them): the note is on those words,
                          not computed. Found only in part (at least two words
                          in three, in order): on those words, computed.
                          Not found: at the section of the note before, computed.
  quoted translation      The commentator quotes Taylor's translation (Proclus'
                          lemmata; Taylor's Additional Notes, which also give
                          the page of the 1804 translation). The words are
                          found in Taylor's 1804 translation, whose Stephanus
                          sections tools/align.py computed: computed.
  whole dialogue          An introduction, or Proclus' preface: on the whole
                          dialogue, shown with the introductions, not at a passage.
  with its note           A footnote to a note: where its note is.

Nothing here is guessed from meaning, and no note is moved without saying so.
"""
import difflib
import html
import json
import re
from pathlib import Path

import commentary
import greek

ROOT = Path(__file__).resolve().parent.parent
TEXTS = ROOT / "texts" / "commentary"

# Which folder of texts/commentary/ holds which work.
WORK_DIRS = {"tlg031": "timaeus"}
# Milestone 9: Taylor's introductions to the other dialogues, one folder per dialogue (tools/taylor_intros.py).
for _d in sorted((ROOT / "texts" / "commentary").glob("*/")):
    for _f in sorted(_d.glob("*.json"))[:1]:
        WORK_DIRS.setdefault(json.loads(_f.read_text(encoding="utf-8"))["work"], _d.name)

SOURCE_OF = {"taylor-1804": "taylor-1804", "proclus-1820": "proclus-1820", "archer-hind-1888": "archer-hind-1888",
             "jowett-timaeus": "jowett-timaeus"}


def load(work_id):
    d = TEXTS / WORK_DIRS.get(work_id, "-")
    if not d.is_dir():
        return []
    return [json.loads(f.read_text(encoding="utf-8")) for f in sorted(d.glob("*.json"))]


# ------------------------------------------------------------------ HTML

GREEK_RUN = re.compile(r"([Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿̀-ͯ᾽’'.,·;\s]*[Ͱ-Ͽἀ-῿])")


def body_html(text):
    """Paragraphs, with Greek marked as Greek. Nothing else is added."""
    out = []
    for p in re.split(r"\n\s*\n", text.strip()):
        e = html.escape(p.strip())
        e = GREEK_RUN.sub(r'<span lang="grc">\1</span>', e)
        out.append(f"<p>{e}</p>")
    return "".join(out)


# ------------------------------------------------------------------ the Greek text

# Short Greek words that the OCR of Archer-Hind reads in Latin letters, as
# found in his lemmata (kal for καί, yap for γάρ ...), read back. Accentless,
# as the matching is.
LATIN_READ = {"kal": "και", "kai": "και", "yap": "γαρ", "dv": "αν", "av": "αν", "del": "αει", "re": "τε", "te": "τε",
              "tov": "τον", "ov": "ου", "els": "εισ", "thy": "την", "tas": "τασ", "to": "το", "ta": "τα", "tn": "τη",
              "dp": "αρ", "per": "μετ", "xt": "τι"}


class GreekText:
    def __init__(self, db, work_id):
        self.toks = db.execute(
            "SELECT t.section_ref, t.seq, t.form, t.plain FROM token t JOIN edition e ON e.id = t.edition_id "
            "WHERE e.work_id = ? AND e.lang = 'grc' ORDER BY t.id", (work_id,)).fetchall()
        self.plain = [self.norm(t[3]) for t in self.toks]
        self.first_of = {}
        for i, t in enumerate(self.toks):
            self.first_of.setdefault(t[0], i)

    @staticmethod
    def norm(word):
        """Accentless letters only. The OCR reads δ as ϑ; Archer-Hind prints ξυν- where Burnet has συν-."""
        w = greek.strip_accents(greek.nfc(word)).replace("ϑ", "δ")
        w = re.sub(r"[^Ͱ-Ͽ]", "", w)
        return "συ" + w[2:] if w.startswith("ξυ") else w

    def lemma_words(self, lemma):
        """The Greek words of a printed lemma, normalised. Short Greek words the
        OCR read in Latin letters are read back (LATIN_READ); other Latin-letter
        junk is dropped. A lemma with an ellipsis ('κατὰ ... φύσιν', '..') keeps
        the words before it, and a line number the OCR ran in ('το.' for 10.) is dropped."""
        lemma = re.sub(r"^(?:το|ἡ|[\dIl]{1,2})[.,:]\s+", "", lemma.strip())
        lemma = re.split(r"\.\.+|…|\s[—-]+\s|\s–\s", lemma)[0]
        ws = []
        for w in lemma.split():
            bare = re.sub(r"[^A-Za-z]", "", w)
            if bare and bare == re.sub(r"[^\w]", "", w) and bare.lower() in LATIN_READ:
                ws.append(LATIN_READ[bare.lower()])
                continue
            ws.append(self.norm(w))
        return [w for w in ws if w]

    def exact_all(self, words):
        n = len(words)
        if not n:
            return []
        first = words[0]
        return [i for i, w in enumerate(self.plain) if w == first and self.plain[i:i + n] == words]

    def find(self, words, lo, hi, prefer):
        """Best place for words in tokens lo..hi: (start, end, matched, kind) or None.
        kind: 'exact' (every word, in order) or 'partial'."""
        n = len(words)
        if not n:
            return None
        lo, hi = max(0, lo), min(len(self.plain) - n, hi)
        exact = [i for i in range(lo, hi + 1) if self.plain[i:i + n] == words]
        if exact:
            i = min(exact, key=lambda k: (k < prefer, abs(k - prefer)))
            return i, i + n - 1, n, "exact"
        if n < 2:
            # One word, not found exactly: the OCR may have misread a letter.
            cands = [i for i in range(lo, hi + 1) if difflib.SequenceMatcher(None, self.plain[i], words[0]).ratio() >= 0.8
                     and len(words[0]) >= 5]
            if cands:
                i = min(cands, key=lambda k: (k < prefer, abs(k - prefer)))
                return i, i, 0, "partial"
            return None
        best = None
        for i in range(lo, hi + 1):
            hits = sum(1 for k in range(n) if difflib.SequenceMatcher(None, self.plain[i + k], words[k]).ratio() >= 0.75)
            if hits * 3 >= n * 2 and self.plain[i] and (best is None or (hits, -(i < prefer), -abs(i - prefer)) > best[0]):
                best = ((hits, -(i < prefer), -abs(i - prefer)), i, hits)
        if best:
            return best[1], best[1] + n - 1, best[2], "partial"
        return None


# ------------------------------------------------------------------ Taylor's translation, as placed

class TaylorPlaced:
    """Where each word of Taylor's 1804 translation of a work was placed by
    tools/translations.py (its chunks), so a quotation found in that
    translation can be given the computed Stephanus section."""

    def __init__(self, db, work_id):
        self.text = commentary.TaylorText()
        segs = [s for s in json.loads(commentary.TAYLOR_1804_TIMAEUS.read_text(encoding="utf-8"))["segments"]
                if s["kind"] == "paragraph"]
        self.seg_index = {s["id"]: k for k, s in enumerate(segs)}
        self.segs = segs
        chunks = db.execute("SELECT para, section_ref, end_ref, text, printed_at FROM chunk WHERE edition_id = ? ORDER BY seq",
                            (f"{work_id}.taylor1804",)).fetchall()
        # For each paragraph: [(start char, end char, section, end section)] of its chunks.
        self.spans = {}
        for para, ref, end, text, _ in chunks:
            full = segs[para]["text"]
            prev = self.spans.get(para, [])
            at = full.find(text[:40], prev[-1][1] if prev else 0)
            if at < 0:
                at = prev[-1][1] if prev else 0
            self.spans.setdefault(para, []).append((at, at + len(text), ref, end or ref))
        # Pages of the 1804 printing, for each word.
        self.page_of = []
        for s in segs:
            n = len(commentary.en_words(s["text"]))
            pages = s.get("pages") or [None]
            for k in range(n):
                self.page_of.append(pages[min(len(pages) - 1, k * len(pages) // max(n, 1))])

    def section_at(self, seg_id, word, last=False):
        k = self.seg_index[seg_id]
        text = self.segs[k]["text"]
        ms = list(re.finditer(r"[a-z]+", text.lower().replace("æ", "ae").replace("œ", "oe")))
        ch = ms[min(word, len(ms) - 1)].start() if ms else 0
        spans = self.spans.get(k)
        if not spans:
            return None
        for a, b, ref, end in spans:
            if a <= ch < b + 1:
                return end if last else ref
        return spans[-1][3] if last else spans[0][2]

    def place(self, lemma, page=None, min_share=0.15, hint=None):
        """(start ref, end ref, share, pages) for a quotation, or None."""
        if hint:
            a = (hint["segment"], hint["word"])
            b = (hint["end_segment"], hint["end_word"])
            share = hint["share"]
        else:
            # The page printed with the note first; the italic lemmata are badly
            # read, so then two-word runs on that page; then anywhere, more strictly.
            hit = None
            if page:
                hit = (self.text.find(lemma, min_share, pages=self.near_pages(page), page_of=self.page_of)
                       or self.text.find(lemma, 0.3, pages=self.near_pages(page), page_of=self.page_of, n=2))
            hit = hit or self.text.find(lemma, 0.4)
            if not hit:
                return None
            s, e, share = hit
            a, b = self.text.seg_of[s], self.text.seg_of[min(e, len(self.text.seg_of) - 1)]
        start = self.section_at(*a)
        end = self.section_at(*b, last=True)
        if not start:
            return None
        return start, end or start, share, a[0]

    @staticmethod
    def near_pages(page):
        return {page - 1, page, page + 1}


# ------------------------------------------------------------------ writing

def add_commentary(db, doc, work_id):
    db.execute("INSERT INTO commentary (id, source_id, work_id, author, label, title, printed, kind, lang, proof_status, "
               "anchoring, file, stats) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
               (doc["id"], SOURCE_OF[doc["source"]["manifest_id"]], work_id, doc["author"], doc["label"], doc["title"],
                doc["printed"], doc["kind"], doc["lang"], doc["proof_status"], doc["anchoring"],
                str((TEXTS / WORK_DIRS[work_id] / f"{doc['id']}.json").relative_to(ROOT)),
                json.dumps(doc.get("stats", {}), ensure_ascii=False)))


def add_note(db, doc, n, work_id, start, end, method, detail, computed, word=None, parent=None):
    printed = []
    if n.get("vol"):
        printed.append(f"vol. {'I' * n['vol']}")
    if n.get("page"):
        printed.append(f"p. {n['page']}" + (f"–{n['last_page']}" if n.get("last_page") and n["last_page"] != n["page"] else ""))
    if n.get("printed_line"):
        printed.append(f"note on line {n['printed_line']} of his page of Greek")
    if n.get("book"):
        printed.insert(0, f"Book {n['book']}")
    w = word or {}
    cur = db.execute(
        "INSERT INTO note (source_id, commentator, work_id, start_ref, end_ref, edition_id, chunk_id, offset, lemma_text, body, "
        "body_html, printed_at, anchor_method, proof_status, commentary_id, note_key, kind, seq, word_start, word_end_ref, "
        "word_end, word_method, computed, anchor_detail, raw, parent_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (SOURCE_OF[doc["source"]["manifest_id"]], doc["label"], work_id, start, end, None, None, None, n.get("lemma"),
         n["text"], body_html(n["text"]), ", ".join(printed) or None, method, doc["proof_status"], doc["id"], n["id"],
         n["kind"], n["seq"], w.get("start"), w.get("end_ref"), w.get("end"), w.get("method"), 1 if computed else 0,
         detail, n.get("raw"), parent))
    return cur.lastrowid


def short(s, n=70):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[:n - 1].rstrip() + "…"


def longest_chain(points):
    """points: [(note index, token)] in note order -> the longest run whose tokens increase."""
    n = len(points)
    best, prev = [1] * n, [-1] * n
    for i in range(n):
        for j in range(max(0, i - 400), i):
            if points[j][1] < points[i][1] and best[j] + 1 > best[i]:
                best[i], prev[i] = best[j] + 1, j
    if not n:
        return []
    i = max(range(n), key=lambda k: best[k])
    out = []
    while i >= 0:
        out.append(points[i])
        i = prev[i]
    return out[::-1]


def place_greek_lemmata(text, notes):
    """{note id: (start token, end token, words matched, 'exact' | 'partial')}.

    1. Fixed points: lemmata of two words or more found word for word at one
       place only in the whole dialogue, and near the Stephanus reference at the
       head of their page when it was read. Of these, the longest run in which
       the places follow the order of the notes is kept.
    2. Every other lemma is looked for between the fixed points before and
       after it (a little either side, since a page's notes are in two columns),
       word for word first, then in part."""
    words = [text.lemma_words(n["lemma"]) for n in notes]
    fixed = []
    for k, (n, ws) in enumerate(zip(notes, words)):
        if len(ws) < 2:
            continue
        hits = text.exact_all(ws)
        if len(hits) != 1:
            continue
        page = text.first_of.get(n.get("page_steph"))
        if page is not None and not (page - 400 <= hits[0] <= page + 1500):
            continue
        fixed.append((k, hits[0]))
    chain = longest_chain(fixed)
    at = dict(chain)
    out = {}
    keys = [k for k, _ in chain]
    import bisect
    last = 0
    for k, (n, ws) in enumerate(zip(notes, words)):
        if k in at:
            a = at[k]
            out[n["id"]] = (a, a + len(ws) - 1, len(ws), "exact")
            last = a
            continue
        j = bisect.bisect_left(keys, k)
        lo = at[keys[j - 1]] - 150 if j > 0 else 0
        hi = at[keys[j]] + 150 if j < len(keys) else len(text.plain)
        hit = text.find(ws, lo, hi, last)
        if hit:
            out[n["id"]] = hit
            last = hit[0]
    return out


def build_commentaries(db, work_id):
    docs = load(work_id)
    if not docs:
        return None
    sections = [r[0] for r in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work_id,))]
    seq_of = {r: i for i, r in enumerate(sections)}
    first, last = sections[0], sections[-1]
    greek_text = GreekText(db, work_id)
    taylor = None
    stats = {}
    for doc in docs:
        add_commentary(db, doc, work_id)
        st = stats.setdefault(doc["id"], {"label": doc["label"], "notes": 0, "whole dialogue": 0, "words exact": 0,
                                          "words partial": 0, "not found": 0, "computed": 0, "with its note": 0,
                                          "found in Taylor": 0})
        id_of = {}
        prev_ref = first
        greek_hits = place_greek_lemmata(greek_text, [n for n in doc["notes"] if n.get("lemma_lang") == "grc"])
        for n in sorted(doc["notes"], key=lambda x: (x["kind"] == "footnote", x["seq"])):
            st["notes"] += 1
            if n["kind"] == "footnote":
                parent = id_of.get(n.get("on"))
                if parent:
                    s, e = db.execute("SELECT start_ref, end_ref FROM note WHERE id = ?", (parent,)).fetchone()
                    pc = db.execute("SELECT computed FROM note WHERE id = ?", (parent,)).fetchone()[0]
                    id_of[n["id"]] = add_note(db, doc, n, work_id, s, e, "with its note",
                                              f"Taylor's footnote, printed under {n.get('on')}", pc, parent=parent)
                    st["with its note"] += 1
                    continue
                n = dict(n, kind="introduction")
            if n["kind"] == "introduction":
                id_of[n["id"]] = add_note(db, doc, n, work_id, first, last, "whole dialogue",
                                          "An introduction to the whole dialogue, not to one passage.", 0)
                st["whole dialogue"] += 1
                continue
            if n.get("lemma_lang") == "grc":
                hit = greek_hits.get(n["id"])
                words = greek_text.lemma_words(n["lemma"])
                if hit:
                    a, b, matched, kind = hit
                    ta, tb = greek_text.toks[a], greek_text.toks[b]
                    word = {"start": ta[1], "end_ref": tb[0], "end": tb[1],
                            "method": "quoted Greek found word for word (accents ignored)" if kind == "exact"
                            else f"quoted Greek found in part ({matched} of {len(words)} words)"}
                    computed = kind != "exact"
                    detail = (f"Archer-Hind quotes {n['lemma']!r}; found {'word for word' if kind == 'exact' else 'in part'} "
                              f"in Burnet's text at {ta[0]}: " + " ".join(t[2] for t in greek_text.toks[a:b + 1]) + ".")
                    id_of[n["id"]] = add_note(db, doc, n, work_id, ta[0], tb[0], "quoted Greek", detail, computed, word)
                    prev_ref = ta[0]
                    st["words exact" if kind == "exact" else "words partial"] += 1
                    st["computed"] += computed
                else:
                    ref = prev_ref
                    detail = (f"Archer-Hind quotes {n['lemma']!r}; not found in Burnet's text between the notes "
                              f"around it (the OCR may have misread it, or his text differs). Placed with the note before.")
                    id_of[n["id"]] = add_note(db, doc, n, work_id, ref, ref, "quoted Greek", detail, 1)
                    st["not found"] += 1
                    st["computed"] += 1
                continue
            # A quotation of Taylor's translation.
            if taylor is None:
                taylor = TaylorPlaced(db, work_id)
            placed = taylor.place(n.get("lemma", ""), page=n.get("taylor_page"), hint=n.get("found_in_taylor"))
            if placed:
                s, e, share, seg = placed
                if seq_of[e] < seq_of[s]:
                    e = s
                pages = sorted({p for p in (taylor.segs[taylor.seg_index[seg]].get("pages") or []) if p})
                detail = (f"Quotes {short(n.get('lemma'))!r}; found in Taylor's 1804 translation"
                          f"{' (vol. II, p. ' + str(pages[0]) + ')' if pages else ''}, {round(share * 100)}% of its runs of words; "
                          f"that passage was placed at {s}{'–' + e if e != s else ''} by tools/align.py.")
                id_of[n["id"]] = add_note(db, doc, n, work_id, s, e, "quoted translation", detail, 1)
                prev_ref = s
                st["found in Taylor"] += 1
                st["computed"] += 1
            else:
                detail = (f"Quotes {short(n.get('lemma'))!r}; not found in Taylor's 1804 translation"
                          f"{' near p. ' + str(n['taylor_page']) if n.get('taylor_page') else ''}. Placed with the note before.")
                id_of[n["id"]] = add_note(db, doc, n, work_id, prev_ref, prev_ref, "quoted translation", detail, 1)
                st["not found"] += 1
                st["computed"] += 1
        db.execute("UPDATE commentary SET n_notes = ? WHERE id = ?", (st["notes"], doc["id"]))
    return stats


# ------------------------------------------------------------------ report

def write_report(db, work_id, stats, path):
    """reports/commentary_timaeus.md: what the import found, every figure counted from the library."""
    docs = {d["id"]: d for d in load(work_id)}
    seq = {r: i for i, (r,) in enumerate(db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work_id,)))}
    title = db.execute("SELECT title FROM work WHERE id = ?", (work_id,)).fetchone()[0]
    L = [f"# The commentaries on the {title}: what the import found", "",
         "Written by `tools/build_db.py` (milestone 7) from the library it builds; every figure is counted, not typed. "
         "The notes are read from the printed books by `tools/commentary.py` into `texts/commentary/`, and placed by "
         "`tools/commentary_db.py`.", "",
         "| Commentary | Notes | On the Greek words, word for word | On the Greek words, in part (≈) | By a quotation of Taylor's translation (≈) | Not found, placed with the note before (≈) | Whole dialogue | Footnotes with their note |",
         "|---|---:|---:|---:|---:|---:|---:|---:|"]
    for cid, s in stats.items():
        L.append(f"| {s['label']} | {s['notes']} | {s['words exact']} | {s['words partial']} | {s['found in Taylor']} | "
                 f"{s['not found']} | {s['whole dialogue']} | {s['with its note']} |")
    L += ["", "≈ marks a place that is computed rather than printed; the reader shows it so.", ""]

    # Archer-Hind: a check against his own page heads.
    if "archerhind1888" in docs:
        heads = {n["id"]: n.get("page_steph") for n in docs["archerhind1888"]["notes"]}
        ok = off = 0
        offs = []
        for key, ref, comp in db.execute("SELECT note_key, start_ref, computed FROM note WHERE commentary_id = 'archerhind1888' "
                                         "AND word_start IS NOT NULL"):
            h = heads.get(key)
            if h not in seq:
                continue
            if -1 <= seq[ref] - seq[h] <= 6:
                ok += 1
            else:
                off += 1
                offs.append((key, h, ref))
        L += ["## Archer-Hind (1888)", "",
              "Each note quotes the Greek it is on. The words are found in Burnet's text, so the note is placed on "
              "the words themselves, at the section the Perseus text prints for them.", "",
              f"**Check.** Archer-Hind heads each page of his Greek with its first Stephanus reference ('[42 B—'). "
              f"Of the notes placed on words whose page head the OCR reads, {ok} of {ok + off} "
              f"({100 * ok / max(1, ok + off):.1f}%) fall within that page (from one section before the head to six after). "
              "The rest are mostly page heads the OCR misreads.", ""]
        nf = db.execute("SELECT note_key, start_ref, lemma_text FROM note WHERE commentary_id = 'archerhind1888' "
                        "AND word_start IS NULL ORDER BY seq").fetchall()
        L += [f"**Not found ({len(nf)}).** The OCR misread the Greek (Latin letters for Greek ones, a line number "
              "run into the words), or Archer-Hind's text differs from Burnet's. Each is placed with the note before "
              "and marked ≈; proofreading the lemma is the way to fix it.", "",
              "| Note | Placed at | Lemma as read |", "|---|---|---|"]
        L += [f"| {k} | {r} | {l} |" for k, r, l in nf]
        L.append("")

    if "proclus1820" in docs:
        d = docs["proclus1820"]
        rows = db.execute("SELECT note_key, start_ref, end_ref, length(body) FROM note WHERE commentary_id = 'proclus1820' "
                          "AND kind = 'note' ORDER BY seq").fetchall()
        books = {}
        for n in d["notes"]:
            if n["kind"] == "note":
                books[n["book"]] = books.get(n["book"], 0) + 1
        L += ["## Proclus, tr. Taylor (1820)", "",
              f"{len(rows)} lemmata, from {rows[0][1]} to {rows[-1][2]} (Proclus' commentary stops in the Timaeus at about 44d). "
              "By book: " + ", ".join(f"{b} {n}" for b, n in books.items()) + ". "
              f"Reading: {', '.join(f'{k} {v}' for k, v in d['stats'].items())}.", "",
              "A lemma is taken only when it is found in Taylor's 1804 translation and follows the lemma before it in "
              "the dialogue. Where a lemma was missed, its comment runs on in the note before; the longest notes are "
              "where to look:", "",
              "| Note | Passage | Characters |", "|---|---|---:|"]
        for k, s, e, n in sorted(rows, key=lambda r: -r[3])[:8]:
            L.append(f"| {k} | {s}{'–' + e if e != s else ''} | {n:,} |")
        L.append("")

    if "taylor1804-addnotes" in docs:
        L += ["## Taylor, Additional Notes from Proclus (1804)", "", "| Note | Printed | Lemma as read | Placed | How |", "|---|---|---|---|---|"]
        for k, p, lem, s, e, det in db.execute(
                "SELECT n.note_key, n.printed_at, n.lemma_text, n.start_ref, n.end_ref, n.anchor_detail FROM note n "
                "WHERE n.commentary_id = 'taylor1804-addnotes' AND n.kind = 'note' ORDER BY n.seq"):
            how = "not found: with the note before" if "not found" in det else "found in Taylor's translation"
            L.append(f"| {k} | {p} | {lem} | {s}{'–' + e if e != s else ''} | {how} |")
        L.append("")
    L += ["## Introductions", "",
          "Taylor's Introduction (1804), Archer-Hind's Introduction (1888), Jowett's Introduction and Analysis (1892) and "
          "Proclus' preface are on the whole dialogue: the reader shows them under *Introductions*, not at a passage.", ""]
    path.write_text("\n".join(L) + "\n", encoding="utf-8")
