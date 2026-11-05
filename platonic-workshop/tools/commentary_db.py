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
             "jowett-timaeus": "jowett-timaeus", "hermann-appendix": "hermann-appendix"}


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

def source_of(doc):
    m = doc["source"]["manifest_id"]
    return SOURCE_OF.get(m, m)


def add_commentary(db, doc, work_id):
    db.execute("INSERT INTO commentary (id, source_id, work_id, author, label, title, printed, kind, lang, proof_status, "
               "anchoring, file, stats) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
               (doc["id"], source_of(doc), work_id, doc["author"], doc["label"], doc["title"],
                doc["printed"], doc["kind"], doc["lang"], doc["proof_status"], doc["anchoring"],
                str((TEXTS / WORK_DIRS[work_id] / f"{doc['id']}.json").relative_to(ROOT)),
                json.dumps(doc.get("stats", {}), ensure_ascii=False)))


def add_note(db, doc, n, work_id, start, end, method, detail, computed, word=None, parent=None):
    printed = []
    if n.get("vol"):
        printed.append(f"vol. {'I' * n['vol']}")
    if n.get("page"):
        printed.append(f"p. {n['page']}" + (f"–{n['last_page']}" if n.get("last_page") and n["last_page"] != n["page"] else ""))
    if n.get("steph"):
        printed.append(f"headed {n['steph']}" + (f" {n['printed_line']}" if n.get("printed_line") else ""))
    elif n.get("printed_line"):
        printed.append(f"note on line {n['printed_line']} of his page of Greek")
    if n.get("book"):
        printed.insert(0, f"Book {n['book']}")
    w = word or {}
    cur = db.execute(
        "INSERT INTO note (source_id, commentator, work_id, start_ref, end_ref, edition_id, chunk_id, offset, lemma_text, body, "
        "body_html, printed_at, anchor_method, proof_status, commentary_id, note_key, kind, seq, word_start, word_end_ref, "
        "word_end, word_method, computed, anchor_detail, raw, parent_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (source_of(doc), doc["label"], work_id, start, end, None, None, None, n.get("lemma"),
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


def printed_place(n, sections, seq_of, prev_ref):
    """(section, computed, detail) for a note placed at the Stephanus page and letter printed
    over it (the scholia). A letter the page lacks gives the last section of the page before it."""
    ref = n.get("page_steph")
    how = n.get("page_how")
    if ref in seq_of:
        return ref, 1 if how else 0, f"Placed at {ref}, the page and letter printed" + (f" ({how})." if how else ".")
    page = re.match(r"\d+", ref or "")
    on_page = [r for r in sections if page and re.match(r"\d+", r).group(0) == page.group(0) and r <= ref]
    if on_page:
        return on_page[-1], 1, f"{ref} is printed, but Burnet's text has no such section; placed at {on_page[-1]}" + (f" ({how})." if how else ".")
    return prev_ref, 1, f"{ref} is printed, but is not a page of this dialogue in Burnet's text; placed with the note before."


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
                                          "found in Taylor": 0, **({"placed as printed": 0} if doc.get("place_by") == "printed" else {})})
        id_of = {}
        prev_ref = first
        greek_notes = [n for n in doc["notes"] if n.get("lemma_lang") == "grc"]
        if doc.get("ocr_theta"):
            # Hermann's Teubner prints θ as ϑ, which the reading of Archer-Hind's OCR takes for δ.
            greek_notes = [dict(n, lemma=n["lemma"].replace("ϑ", "θ")) for n in greek_notes]
        if doc.get("place_by") == "steph":
            place_steph(db, doc, work_id, greek_text, sections, seq_of, st, id_of)
            db.execute("UPDATE commentary SET n_notes = ? WHERE id = ?", (st["notes"], doc["id"]))
            continue
        greek_hits = place_greek_lemmata(greek_text, greek_notes)
        quoter = doc.get("quoter", "Archer-Hind")
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
                words = greek_text.lemma_words(n["lemma"].replace("ϑ", "θ") if doc.get("ocr_theta") else n["lemma"])
                if hit:
                    a, b, matched, kind = hit
                    ta, tb = greek_text.toks[a], greek_text.toks[b]
                    word = {"start": ta[1], "end_ref": tb[0], "end": tb[1],
                            "method": "quoted Greek found word for word (accents ignored)" if kind == "exact"
                            else f"quoted Greek found in part ({matched} of {len(words)} words)"}
                    computed = kind != "exact"
                    detail = (f"{quoter} quotes {n['lemma']!r}; found {'word for word' if kind == 'exact' else 'in part'} "
                              f"in Burnet's text at {ta[0]}: " + " ".join(t[2] for t in greek_text.toks[a:b + 1]) + ".")
                    id_of[n["id"]] = add_note(db, doc, n, work_id, ta[0], tb[0], "quoted Greek", detail, computed, word)
                    prev_ref = ta[0]
                    st["words exact" if kind == "exact" else "words partial"] += 1
                    st["computed"] += computed
                elif doc.get("place_by") == "printed":
                    ref, computed, detail = printed_place(n, sections, seq_of, prev_ref)
                    detail = f"{quoter} quotes {n['lemma']!r}; not found in Burnet's text near the place printed. " + detail
                    id_of[n["id"]] = add_note(db, doc, n, work_id, ref, ref, "printed reference", detail, computed)
                    prev_ref = ref
                    st["not found"] += 1
                    st["placed as printed"] += 1
                    st["computed"] += computed
                else:
                    ref = prev_ref
                    detail = (f"Archer-Hind quotes {n['lemma']!r}; not found in Burnet's text between the notes "
                              f"around it (the OCR may have misread it, or his text differs). Placed with the note before.")
                    id_of[n["id"]] = add_note(db, doc, n, work_id, ref, ref, "quoted Greek", detail, 1)
                    st["not found"] += 1
                    st["computed"] += 1
                continue
            if doc.get("place_by") == "printed":
                ref, computed, detail = printed_place(n, sections, seq_of, prev_ref)
                id_of[n["id"]] = add_note(db, doc, n, work_id, ref, ref, "printed reference", "No words of Plato quoted. " + detail, computed)
                prev_ref = ref
                st["placed as printed"] += 1
                st["computed"] += computed
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


STEPH_STATS = ("printed, on the Greek words quoted", "printed, quoted Greek not found there", "printed, no Greek quoted",
               "counted, on the Greek words quoted", "counted, the Greek found on another section",
               "counted, quoted Greek not found", "counted, no Greek quoted", "letter not in Burnet's text")


def steph_lemma(lemma):
    """The Greek words of a lemma headed by a Stephanus reference: up to the first
    comma, semicolon, bracket or word in Latin letters, without 'κτλ.' (and the rest)."""
    out = []
    for w in re.split(r"\s+", lemma.strip()):
        if re.search(r"[A-Za-z0-9]", w) or w.startswith(("κτλ", "κ.τ.λ")):
            break
        stop = re.search(r"[,;()\[\]]", w)
        if stop:
            w = w[:stop.start()]
            if w:
                out.append(w)
            break
        out.append(w)
    return " ".join(out)


def place_steph(db, doc, work_id, text, sections, seq_of, st, id_of):
    """Milestone 11: notes headed by their Stephanus reference (Adam, England,
    Burnet, Bury; tools/commentary_corpus.py).

    The note is at the section printed at its head. Where it quotes Greek, the
    words are looked for in Burnet's text on that section (and a little either
    side, since a lemma may run over a letter): found word for word, the note is
    on those words. Where the page was counted rather than printed, the Greek is
    also looked for on the two pages either side; found word for word at one
    place only, the note is put there, on those words, and says so. Nothing
    else moves a note."""
    for k in STEPH_STATS:
        st.setdefault(k, 0)
    pages_of = {}
    for r in sections:
        pages_of.setdefault(re.match(r"\d+", r).group(0), []).append(r)
    for n in doc["notes"]:
        st["notes"] += 1
        if n["kind"] == "introduction":
            id_of[n["id"]] = add_note(db, doc, n, work_id, sections[0], sections[-1], "whole dialogue",
                                      "An introduction to the whole dialogue, not to one passage.", 0)
            st["whole dialogue"] += 1
            continue
        ref = n["steph"]
        counted = n["steph_how"].startswith("counted")
        how = {"printed": "printed at the head of the note",
               "printed with an earlier note": "the letter printed at the head of the note, the page printed with an earlier note",
               "running head": "the letter printed at the head of the note, the page from the running head",
               }.get(n["steph_how"], n["steph_how"])
        if ref not in seq_of:
            page = re.match(r"\d+", ref).group(0)
            on_page = [r for r in pages_of.get(page, []) if r <= ref]
            fallback = on_page[-1] if on_page else (pages_of.get(page) or [sections[0]])[0]
            detail = f"{ref} ({how}); Burnet's text has no such section, so placed at {fallback}."
            ref, counted = fallback, True
            st["letter not in Burnet's text"] += 1
        else:
            detail = f"At {ref}: {how}."
        words = text.lemma_words(steph_lemma(n["lemma"])) if n.get("lemma") else []
        i0 = text.first_of.get(ref)
        nxt = sections[seq_of[ref] + 1] if seq_of[ref] + 1 < len(sections) else None
        i1 = text.first_of.get(nxt, len(text.plain)) if nxt else len(text.plain)
        hit = text.find(words, i0 - 40, i1 + 60, i0) if words and i0 is not None else None
        if hit and hit[3] != "exact":
            hit = None
        moved = False
        if words and not hit and counted and len(words) >= 2 and i0 is not None:
            span = 1200
            cands = [i for i in text.exact_all(words) if i0 - span <= i <= i1 + span]
            if len(cands) == 1:
                hit = (cands[0], cands[0] + len(words) - 1, len(words), "exact")
                moved = True
        word = None
        if hit:
            a, b, _, _ = hit
            ta, tb = text.toks[a], text.toks[b]
            word = {"start": ta[1], "end_ref": tb[0], "end": tb[1], "method": "quoted Greek found word for word (accents ignored)"}
            if moved:
                detail = (f"The page was counted ({ref}); the Greek it quotes, {n['lemma']!r}, is found word for word at one "
                          f"place only near there, {ta[0]}: " + " ".join(t[2] for t in text.toks[a:b + 1]) + ".")
                ref = ta[0]
                st["counted, the Greek found on another section"] += 1
            else:
                detail += f" The Greek quoted, {n['lemma']!r}, is found there word for word: " + " ".join(t[2] for t in text.toks[a:b + 1]) + "."
                st["counted, on the Greek words quoted" if counted else "printed, on the Greek words quoted"] += 1
            start = ref
            end = tb[0] if seq_of.get(tb[0], 0) >= seq_of[ref] else ref
            computed = 0        # the place rests on the Greek words quoted, found word for word
        else:
            if words:
                detail += f" The Greek quoted, {n['lemma']!r}, is not found there word for word (the OCR may have misread it)."
                st["counted, quoted Greek not found" if counted else "printed, quoted Greek not found there"] += 1
            else:
                st["counted, no Greek quoted" if counted else "printed, no Greek quoted"] += 1
            start, end, computed = ref, ref, 1 if counted else 0
        id_of[n["id"]] = add_note(db, doc, n, work_id, start, end, "printed reference", detail, computed, word)
        st["computed"] += computed


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


# ------------------------------------------------------------------ milestone 11: the report on the whole corpus

def write_corpus_report(db, comm_stats, path):
    """reports/commentaries.md: every commentary on the rest of Plato (milestone 11), how its notes
    were placed, and the checks, every figure counted from the library."""
    import commentary_corpus
    books = {b["id"]: b for b in commentary_corpus.BOOKS}
    title = dict(db.execute("SELECT id, title FROM work"))
    seq_of = {}
    for w, r, i in db.execute("SELECT work_id, ref, seq FROM section"):
        seq_of[(w, r)] = i
    L = ["# The commentaries across Plato: what the import found", "",
         "Written by `tools/build_db.py` (milestone 11) from the library it builds; every figure is counted, not typed. "
         "The books are read into notes by `tools/commentary_corpus.py` into `texts/commentary/<dialogue>/`, and placed "
         "by `tools/commentary_db.py`. The Timaeus commentaries of milestone 7 are in `reports/commentary_timaeus.md`.", "",
         "## Every commentary in the library", "",
         "| Dialogue | Commentary | Notes | On the Greek words | Computed (≈) | On the whole dialogue | Sections with a note |",
         "|---|---|---:|---:|---:|---:|---:|"]
    rows = db.execute(
        "SELECT c.work_id, c.id, c.label, count(n.id), sum(n.word_start IS NOT NULL), sum(n.computed), "
        "sum(n.kind = 'introduction'), count(DISTINCT CASE WHEN n.kind != 'introduction' THEN n.start_ref END) "
        "FROM commentary c JOIN note n ON n.commentary_id = c.id GROUP BY c.id ORDER BY c.work_id, c.label").fetchall()
    tot = [0] * 5
    works = set()
    for w, cid, label, n, words, comp, whole, secs in rows:
        L.append(f"| {title[w]} | {label} | {n} | {words} | {comp} | {whole} | {secs} |")
        for k, v in enumerate((n, words, comp, whole, secs)):
            tot[k] += v or 0
        works.add(w)
    L += [f"| **{len(works)} dialogues** | **{len(rows)} commentaries** | **{tot[0]}** | **{tot[1]}** | **{tot[2]}** | **{tot[3]}** | **{tot[4]}** |", ""]

    # Notes headed by a Stephanus reference.
    L += ["## Notes headed by their Stephanus reference", "",
          "Adam, England, Burnet and Bury head each note with the page, letter and line it is on. The note is put at that "
          "section. Where the page had to be counted (only the letter is printed, lower than the one before), the Greek the note "
          "quotes decides: found word for word there, the count is confirmed; found at one place only on a page either side, "
          "the note is put there and says so. Where the Greek is found at the section printed, the printed reference is "
          "confirmed by the text itself: that share is the check on the reading of the heads.", "",
          "| Commentary | Notes | Printed, Greek found there | Printed, Greek not found | Printed, no Greek | Counted, Greek found there | Counted, Greek found nearby (moved) | Counted, Greek not found (≈) | Counted, no Greek (≈) | Letter not in Burnet |",
          "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for w, st in comm_stats.items():
        for cid, s in st.items():
            if "printed, on the Greek words quoted" not in s:
                continue
            L.append(f"| {s['label']} ({title[w]}) | {s['notes']} | " + " | ".join(str(s[k]) for k in STEPH_STATS) + " |")
            found = s["printed, on the Greek words quoted"] + s["counted, on the Greek words quoted"]
            tried = found + s["printed, quoted Greek not found there"] + s["counted, quoted Greek not found"] + s["counted, the Greek found on another section"]
            L.append("")
            L.append(f"{s['label']}: of the {tried} notes whose quoted Greek could be looked for, {found} "
                     f"({100 * found / max(1, tried):.1f}%) are found word for word at the section their head gives.")
            L.append("")
    L += ["", "Where the quoted Greek is not found, the OCR has usually misread it (Adam's vol. I reads all his Greek in Latin "
          "letters), or the editor's text differs from Burnet's. The note stays at the section printed.", ""]

    # Notes headed by the Greek words alone.
    L += ["## Notes headed by the Greek words alone", "",
          "Archer-Hind's Phaedo, Campbell's Theaetetus, Sophist and Statesman, and Jowett and Campbell's Republic quote the Greek and close it with a bracket (Lodge's Gorgias with a colon), "
          "with the line of their page of Greek but no Stephanus reference; the words are found in Burnet's text, as for "
          "Archer-Hind's Timaeus. **Check:** the notes are printed in the order of the text, so a note placed before the "
          "note printed before it is out of order; the share in order is the check on the placing.", "",
          "| Commentary | Notes | Word for word | In part (≈) | Not found, with the note before (≈) | In order |",
          "|---|---:|---:|---:|---:|---:|"]
    for w, st in comm_stats.items():
        for cid, s in st.items():
            if cid.split("-")[0] not in books or books[cid.split("-")[0]]["style"] not in ("bracket", "colon"):
                continue
            refs = [r for (r,) in db.execute("SELECT start_ref FROM note WHERE commentary_id = ? AND word_start IS NOT NULL "
                                              "ORDER BY seq", (cid,))]
            ok = sum(1 for a, b in zip(refs, refs[1:]) if seq_of[(w, b)] >= seq_of[(w, a)])
            L.append(f"| {s['label']} ({title[w]}) | {s['notes']} | {s['words exact']} | {s['words partial']} | {s['not found']} | "
                     f"{ok} of {max(0, len(refs) - 1)} ({100 * ok / max(1, len(refs) - 1):.1f}%) |")
    L += ["", "## Where each book came from", ""]
    for b in commentary_corpus.BOOKS:
        L.append(f"- **{b['label']}**: {b['printed']}. Internet Archive OCR of {b['copy']}: "
                 + ", ".join(f"[{x}](https://archive.org/details/{x})" for x in b["items"])
                 + f", in `sources/{b['folder']}/`." + (f" {b['ocr_note']}" if b.get("ocr_note") else ""))
    L.append("- **Jowett, Introductions**: The Dialogues of Plato, 3rd ed. (Oxford, 1892), and the Republic (3rd ed., 1888), "
             "Project Gutenberg plain text in `sources/jowett-gutenberg/`. A note on the whole dialogue per paragraph; his marginal "
             "headings are left to the structure layer (milestone 9).")
    L += ["", "## Looked for and not imported", ""] + [f"- {x}" for x in commentary_corpus.NOT_IMPORTED]
    L += ["", "## Found, with Greek the OCR reads, not yet read into notes", ""] + [f"- {x}" for x in commentary_corpus.FOUND_NOT_YET_READ] + [""]
    path.write_text("\n".join(L), encoding="utf-8")
