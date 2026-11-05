"""One search box for the whole Workshop (milestone 12).

Type anything: a Greek word, English words, a Stephanus reference, a name. The
search looks in every part of the library and in your own work, and every
result says why it was returned: which field matched, in which text, by what
rule. There is no ranking by meaning and no AI: a result is returned because
the words you typed are in it, or because it is the thing you named.

What is searched, and how:

  Greek words      by lemma (GLAUx's tags), by form as printed, or by letters
                   only (tools/search.py); with a morphological filter
                   (case:genitive, tense:aorist ...) the tags are filtered too
  Greek text       the words of Burnet's text, accents and capitals ignored
  English          every English translation, by translator
  commentary       every note in the library, by commentator
  ancient texts    Alcinous, Plotinus, Proclus ... in the library's editions
  concepts         the concept index (milestone 10): names, Greek, the words indexed
  reconciliations  the tensions and the interpretive methods (milestone 12)
  dossiers         the dossiers, when the library has them (milestone 11)
  works, people    dialogue titles, commentators, translators, ancient authors
  passages         a Stephanus reference (Rep. 509b, Tim 29e-30a): the passage,
                   the notes on it, the notes elsewhere that cite it, and the
                   concepts and tensions it belongs to
  your work        your translations, notes, word studies and reconciliations

A query may carry fields, written name:value, which narrow it:

  greek: english: note: ancient:     search only that text
  lemma: form: plain:                one Greek word, searched that way
  case: number: tense: mood: voice: person: gender: pos: degree:
                                     morphological filters on a Greek word
  work: (or in:)                     only in that dialogue (Rep, Republic, tlg030)
  author: (or by:)                   only notes by that commentator, or English by that translator
  translator:                        only English by that translator
  concept: method: tension:          only those parts of the library
  cites:                             notes that cite a passage (cites:Rep 509b)
  mine:                              only your own work

Words in "double quotes" are an exact phrase.

The text indexes (SQLite FTS5) are built by build_db.py with the library;
`python3 tools/find.py QUERY` searches from the command line.
"""
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import citations  # noqa: E402
import greek  # noqa: E402
import search as wordsearch  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
LIMIT = 12          # results shown per group (the total is always given)
SNIPPET = 90        # characters each side of the first match

TEXT_KINDS = {
    "greek": "Greek text (Burnet)",
    "english": "English translations",
    "note": "Commentary notes",
    "ancient": "Ancient texts",
}
MORPH = {  # field name -> position in the 9-letter tag, and the value names (greek._POSTAG)
    name.replace("part of speech", "pos"): (i, {v: k for k, v in codes.items()})
    for i, (name, codes) in enumerate(greek._POSTAG)
}
MORPH_SHORT = {"nom": "nominative", "gen": "genitive", "dat": "dative", "acc": "accusative", "voc": "vocative",
               "sg": "singular", "pl": "plural", "pres": "present", "impf": "imperfect", "perf": "perfect", "fut": "future",
               "aor": "aorist", "plup": "pluperfect", "ind": "indicative", "subj": "subjunctive", "opt": "optative",
               "inf": "infinitive", "imp": "imperative", "imper": "imperative", "part": "participle", "ptcp": "participle",
               "act": "active", "pass": "passive", "mid": "middle", "masc": "masculine", "fem": "feminine", "neut": "neuter",
               "1": "1st person", "2": "2nd person", "3": "3rd person", "first": "1st person", "second": "2nd person",
               "third": "3rd person", "adj": "adjective", "adv": "adverb", "comp": "comparative", "superl": "superlative",
               "art": "article", "pron": "pronoun", "prep": "preposition", "conj": "conjunction", "partic": "particle",
               "mp": "middle or passive", "medio-passive": "middle or passive"}
FIELDS = {"greek", "english", "note", "ancient", "lemma", "form", "plain", "work", "in", "author", "by", "translator",
          "concept", "method", "tension", "cites", "mine", "passage", "ref", "dossier", *MORPH}
PASSAGE_FIELDS = {"cites", "passage", "ref"}
ONLY = {"greek", "english", "note", "ancient", "concept", "method", "tension", "mine", "dossier"}


class Invalid(ValueError):
    pass


def fold(s):
    """Text as indexed and as searched: no accents, breathings or capitals; final sigma as sigma."""
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower().replace("ς", "σ").replace("ϲ", "σ")


# ---------------------------------------------------------------- the index

FTS_SCHEMA = """
DROP TABLE IF EXISTS find_doc;
DROP TABLE IF EXISTS find_fts;
-- One row per indexed text: a chunk of Greek or English, a note, a section of an ancient text.
CREATE TABLE find_doc (
    id          INTEGER PRIMARY KEY,       -- = find_fts.rowid
    kind        TEXT NOT NULL,             -- greek | english | note | ancient
    key         TEXT NOT NULL,             -- chunk.id, note.id, 'text_id:seq'
    work_id     TEXT,
    ref         TEXT,                      -- Stephanus section, or the ancient text's number
    who         TEXT                       -- translator or commentator label; the ancient text's title
);
-- The folded words of each text (accents and capitals removed, as fold() does). Contentless:
-- the text itself is read from chunk, note and ancient_section when a result is shown.
CREATE VIRTUAL TABLE find_fts USING fts5(body, content='', tokenize='unicode61 remove_diacritics 0');
"""


def build(db):
    """Called by build_db.py: index every text for the search box."""
    db.executescript(FTS_SCHEMA)
    n = 0
    stats = {}

    def add(kind, key, work, ref, who, text):
        nonlocal n
        n += 1
        db.execute("INSERT INTO find_doc VALUES (?,?,?,?,?,?)", (n, kind, str(key), work, ref, who))
        db.execute("INSERT INTO find_fts(rowid, body) VALUES (?,?)", (n, fold(text)))
        stats[kind] = stats.get(kind, 0) + 1

    for cid, work, ref, text, lang, label in db.execute(
            "SELECT c.id, c.work_id, c.section_ref, c.text, e.lang, e.label FROM chunk c JOIN edition e ON e.id = c.edition_id ORDER BY c.id").fetchall():
        add("greek" if lang == "grc" else "english", cid, work, ref, None if lang == "grc" else label, text)
    for nid, work, ref, who, lemma, body in db.execute(
            "SELECT n.id, n.work_id, n.start_ref, COALESCE(cm.label, n.commentator), n.lemma_text, n.body FROM note n "
            "LEFT JOIN commentary cm ON cm.id = n.commentary_id ORDER BY n.id").fetchall():
        add("note", nid, work, ref, who, f"{lemma or ''} {body or ''}")
    for tid, seq, num, title, text in db.execute(
            "SELECT s.text_id, s.seq, s.n, t.title, s.text FROM ancient_section s JOIN ancient_text t ON t.id = s.text_id ORDER BY s.text_id, s.seq").fetchall():
        add("ancient", f"{tid}:{seq}", None, num, title, text)
    return stats


# ---------------------------------------------------------------- reading a query

def split_query(q):
    """'case:gen λόγος "the good" in:Rep' -> ({'case': 'gen', 'in': 'Rep'}, ['λόγος'], ['the good'])."""
    fields, words, phrases = {}, [], []
    last = None
    for m in re.finditer(r'(\w+):("([^"]*)"|\S*)|"([^"]*)"|(\S+)', q or ""):
        # cites:Tim 29e, passage:Rep 509b-c: the reference after a passage field belongs to it
        if last in PASSAGE_FIELDS and m.group(5) and re.fullmatch(r"\d{1,3}[a-e]?(?:[-–]\d{0,3}[a-e]?)?", m.group(5)):
            fields[last] += " " + m.group(5)
            last = None
            continue
        last = m.group(1).lower() if m.group(1) and m.group(1).lower() in FIELDS else None
        if m.group(1) and m.group(1).lower() in FIELDS:
            v = m.group(3) if m.group(3) is not None else m.group(2)
            k = m.group(1).lower()
            fields[k] = (fields[k] + " " + v) if k in fields else v
        elif m.group(1):
            words.append(m.group(0))
        elif m.group(4) is not None:
            if m.group(4).strip():
                phrases.append(m.group(4).strip())
        else:
            words.append(m.group(5))
    return fields, words, phrases


TITLE_OF = {k.lower().rstrip("."): w for k, w in citations.TITLE_OF.items()}


def find_work(db, s):
    """A work named by title, abbreviation, slug or Perseus id."""
    s = (s or "").strip().rstrip(".").lower()
    if not s:
        return None
    if s in TITLE_OF:
        return TITLE_OF[s]
    r = db.execute("SELECT id FROM work WHERE lower(id) = ? OR lower(slug) = ? OR lower(title) = ? OR lower(rtrim(abbr, '.')) = ?",
                   (s, s, s, s)).fetchone()
    return r[0] if r else None


REF = re.compile(r"^(?P<work>[A-Za-zæ][A-Za-zæ .]*?)\.?\s*(?P<a>\d{1,3}[a-e]?)(?:\s*[-–]\s*(?P<b>\d{1,3}[a-e]?))?$")


def parse_passage(db, s):
    """'Rep. 509b', 'Republic 509b-c', 'tlg031 29e' -> (work, start, end) or None."""
    m = REF.match((s or "").strip())
    if not m:
        return None
    work = find_work(db, m.group("work"))
    if not work:
        return None
    a = m.group("a")
    b = m.group("b") or a
    if re.fullmatch(r"[a-e]", b):
        b = re.match(r"\d+", a).group(0) + b
    refs = [r[0] for r in db.execute("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", (work,))]
    if a not in refs:
        a = next((r for r in refs if re.fullmatch(re.escape(a) + "[a-e]?", r)), None)
    if b not in refs:
        b = next((r for r in reversed(refs) if re.fullmatch(re.escape(b) + "[a-e]?", r)), None)
    if not a or not b:
        return None
    return work, a, b


def fts_query(words, phrases):
    """FTS5 syntax for the words (all must be present) and phrases (exact)."""
    parts = []
    for w in words:
        t = re.findall(r"\w+", fold(w))
        parts += [f'"{x}"' for x in t]
    for p in phrases:
        t = re.findall(r"\w+", fold(p))
        if t:
            parts.append('"' + " ".join(t) + '"')
    return " ".join(parts)


def snippet(text, terms, width=SNIPPET):
    """The text around the first place any of the folded terms occurs, with the match marked [[...]]."""
    text = re.sub(r"\s+", " ", text or "").strip()
    ft = fold(text)
    best = None
    for t in terms:
        m = re.search(r"(?<!\w)" + re.escape(t) + r"(?!\w)", ft)
        if m and (best is None or m.start() < best[0]):
            best = (m.start(), m.end())
    if best is None:
        return text[:2 * width] + ("…" if len(text) > 2 * width else "")
    a, b = best
    lo, hi = max(0, a - width), min(len(text), b + width)
    return ("…" if lo else "") + text[lo:a] + "[[" + text[a:b] + "]]" + text[b:hi] + ("…" if hi < len(text) else "")


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s or "")).strip()


# ---------------------------------------------------------------- searching

class Find:
    def __init__(self, db, mine=None):
        self.db = db                # the library, read only
        self.mine = mine            # mywork.MyWork, for your own work
        self.words = wordsearch.Search(db)
        self.has_index = bool(db.execute("SELECT 1 FROM sqlite_master WHERE name = 'find_fts'").fetchone())

    def rows(self, sql, *args):
        cur = self.db.execute(sql, args)
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, r)) for r in cur.fetchall()]

    def title(self, work):
        r = self.db.execute("SELECT title, slug FROM work WHERE id = ?", (work,)).fetchone()
        return (r[0], r[1]) if r else (work, work)

    def href(self, work, ref):
        t, slug = self.title(work)
        return f"#{slug}/{ref}" if ref else f"#{slug}"

    def find(self, q, limit=LIMIT):
        fields, words, phrases = split_query(q)
        if not (fields or words or phrases):
            raise Invalid("type something to search for")
        understood = []          # how the query was read, in plain words
        groups = []
        work = None
        wf = fields.get("work") or fields.get("in")
        if wf:
            work = find_work(self.db, wf)
            if not work:
                raise Invalid(f"no dialogue called {wf!r}")
            understood.append(f"only in the {self.title(work)[0]} (work:{wf})")
        who = fields.get("author") or fields.get("by")
        trans = fields.get("translator")
        only = {k for k in fields if k in ONLY and k not in ("mine",)}
        if "mine" in fields:
            only.add("mine")
            words += fields["mine"].split()
        for k in ("greek", "english", "note", "ancient", "concept", "tension", "dossier"):
            if k in fields and fields[k] and fields[k] != "*":
                words += fields[k].split()
        if only:
            understood.append("only " + ", ".join(sorted(only)))
        if who:
            understood.append(f"commentary by, or English translated by, someone matching “{who}”")
        if trans:
            understood.append(f"English by a translator matching “{trans}”")
        text = " ".join(words + phrases)
        allowed = lambda k: not only or k in only

        # A passage, typed as a reference.
        passage = fields.get("passage") or fields.get("ref")
        p = parse_passage(self.db, passage or (" ".join(words) if not phrases else ""))
        if p and allowed("passage"):
            groups += self.passage(*p)
            understood.append(f"the passage {self.title(p[0])[0]} {p[1]}" + (f"–{p[2]}" if p[2] != p[1] else ""))
            words = []
            text = " ".join(phrases)
        if fields.get("cites"):
            c = parse_passage(self.db, fields["cites"])
            if not c:
                raise Invalid(f"cites: needs a passage, such as cites:Rep 509b (not {fields['cites']!r})")
            groups.append(self.cited_by(*c, who=who))
            understood.append(f"notes that cite {self.title(c[0])[0]} {c[1]}")

        # Greek words: by lemma, form or letters, with any morphological filter.
        morph = {k: v for k, v in fields.items() if k in MORPH}
        gk_words = [w for w in words if greek.is_greek(greek.nfc(w))]
        for mode in ("lemma", "form", "plain"):
            if fields.get(mode):
                g = self.greek_word(fields[mode], mode, morph, work, limit)
                groups.append(g)
                understood.append(g["understood"])
        if not any(fields.get(m) for m in ("lemma", "form", "plain")) and len(gk_words) == 1 and not phrases and allowed("greek"):
            g = self.greek_word(gk_words[0], "lemma", morph, work, limit)
            groups.append(g)
            understood.append(g["understood"])
        elif morph and not any(fields.get(m) for m in ("lemma", "form", "plain")):
            raise Invalid("a morphological filter (case:, tense: ...) needs one Greek word to filter")

        # The texts.
        fts = fts_query(words, phrases)
        terms = [fold(t) for w in words for t in re.findall(r"\w+", w)] + [fold(p) for p in phrases]
        if fts and self.has_index:
            for kind in ("greek", "english", "note", "ancient"):
                if not allowed(kind):
                    continue
                if kind == "greek" and not any(greek.is_greek(greek.nfc(t)) for t in words + phrases):
                    continue
                if kind != "greek" and words + phrases and all(greek.is_greek(greek.nfc(t)) for t in words + phrases) and kind != "note":
                    continue  # Greek typed: English and ancient (English) texts cannot contain it; the notes may quote it
                g = self.texts(kind, fts, terms, work, who, trans, limit)
                if g["total"]:
                    groups.append(g)
        # The library's own records, and your work.
        if text or fields.get("method") or "mine" in fields:
            for kind, fn in (("concept", self.concepts), ("tension", self.tensions), ("method", self.methods),
                             ("dossier", self.dossiers), ("names", self.names), ("mine", self.your_work)):
                if not allowed(kind) and not (kind in ("tension", "mine") and fields.get("method")):
                    continue
                g = fn(text, words, phrases, fields)
                if g and g["total"]:
                    groups.append(g)
        # Nothing found with every word: a word that is the name of a commentator or translator is read as one.
        if not groups and not who and len(words) > 1:
            for w in words:
                if len(w) > 3 and self.db.execute("SELECT 1 FROM commentary WHERE author LIKE ? OR label LIKE ? UNION SELECT 1 FROM edition WHERE label LIKE ?",
                                                  (f"%{w}%", f"%{w}%", f"%{w}%")).fetchone():
                    rest = " ".join(x for x in re.findall(r'\S+', q) if x != w)
                    r = self.find(f"{rest} by:{w}", limit)
                    r["understood"].insert(0, f"no text has all the words, so “{w}” was read as a name: by:{w}")
                    r["query"] = q
                    return r
        if not understood:
            understood.append("these words anywhere: " + ", ".join([*words, *(f'“{p}”' for p in phrases)]))
        return {"query": q, "understood": understood, "groups": groups, "total": sum(g["total"] for g in groups),
                "indexed": self.has_index}

    # ------------------------------------------------------------ a passage

    def passage(self, work, a, b):
        import reconcile
        t, slug = self.title(work)
        span = a if a == b else f"{a}–{b}"
        out = [{"kind": "passage", "label": "The passage", "total": 1, "results": [{
            "title": f"{t} {span}", "href": f"#{slug}/{a}", "snippet": "",
            "why": "You typed a Stephanus reference; this is the passage in Burnet's text, with its translations and notes."}]}]
        notes = self.rows("SELECT n.id, COALESCE(cm.label, n.commentator) AS who, n.start_ref, substr(n.body, 1, 400) AS body FROM note n "
                          "LEFT JOIN commentary cm ON cm.id = n.commentary_id JOIN section s ON s.work_id = n.work_id AND s.ref = n.start_ref "
                          "WHERE n.work_id = ? AND s.seq BETWEEN (SELECT seq FROM section WHERE work_id = ? AND ref = ?) "
                          "AND (SELECT seq FROM section WHERE work_id = ? AND ref = ?) ORDER BY s.seq, n.id", work, work, a, work, b)
        if notes:
            out.append({"kind": "note", "label": "Notes on the passage", "total": len(notes), "results": [
                {"title": f"{n['who']} on {t} {n['start_ref']}", "href": f"#{slug}/{n['start_ref']}", "note_id": n["id"],
                 "snippet": strip_html(n["body"])[:240], "why": f"a note printed on {n['start_ref']}, inside the passage you typed"}
                for n in notes[:LIMIT]]})
        out.append(self.cited_by(work, a, b))
        ap = reconcile.applicable(self.db, work, a)
        if ap and (ap["tensions"] or ap["concepts"]):
            res = [{"title": x["title"], "href": f"#reconcile/{x['id']}", "snippet": "",
                    "why": f"this passage is side {x['side']} ({x['span']}) of a recorded tension"} for x in ap["tensions"]]
            res += [{"title": x["label"], "href": f"#concepts/{x['id']}", "snippet": x.get("why") or "",
                     "why": f"the concept index lists {t} {x['span']} as a passage of this concept"} for x in ap["concepts"]]
            out.append({"kind": "concept", "label": "Concepts and tensions this passage belongs to", "total": len(res), "results": res})
        return [g for g in out if g["total"]]

    def cited_by(self, work, a, b, who=None):
        """Notes elsewhere that cite the passage (the citation web of milestone 8)."""
        t, slug = self.title(work)
        refs = [r[0] for r in self.db.execute(
            "SELECT ref FROM section WHERE work_id = ? AND seq BETWEEN (SELECT seq FROM section WHERE work_id = ? AND ref = ?) "
            "AND (SELECT seq FROM section WHERE work_id = ? AND ref = ?)", (work, work, a, work, b))]
        pages = sorted({re.match(r"\d+", r).group(0) for r in refs})
        marks = ",".join("?" * len(refs + pages))
        rows = self.rows(f"SELECT l.note_id, l.from_work, l.from_ref, l.to_ref, l.raw, l.rule, l.certainty, COALESCE(cm.label, n.commentator) AS who, "
                         f"n.body FROM link l JOIN note n ON n.id = l.note_id LEFT JOIN commentary cm ON cm.id = n.commentary_id "
                         f"WHERE l.to_work = ? AND l.to_ref IN ({marks}) AND l.certainty != 'unresolved' ORDER BY l.from_work, l.id",
                         work, *refs, *pages)
        if who:
            rows = [r for r in rows if who.lower() in (r["who"] or "").lower()]
        seen, res = set(), []
        for r in rows:
            if r["note_id"] in seen:
                continue
            seen.add(r["note_id"])
            ft, fslug = self.title(r["from_work"])
            res.append({"title": f"{r['who']} on {ft} {r['from_ref']}", "href": f"#{fslug}/{r['from_ref']}", "note_id": r["note_id"],
                        "snippet": citations.excerpt(r["body"], r["raw"], 200),
                        "why": f"the note cites “{r['raw']}”, read as {t} {r['to_ref']} ({r['certainty']}, rule {r['rule']})"})
        return {"kind": "cites", "label": f"Notes that cite {t} {a if a == b else a + '–' + b}", "total": len(res), "results": res[:LIMIT * 2]}

    # ------------------------------------------------------------ a Greek word

    def greek_word(self, w, mode, morph, work, limit):
        try:
            t = self.words.terms(w, mode)
        except wordsearch.Invalid as e:
            raise Invalid(str(e))
        pattern = None
        said = []
        if morph:
            pat = ["_"] * 9
            for k, v in morph.items():
                pos, codes = MORPH[k]
                name = MORPH_SHORT.get(v.lower(), v.lower())
                code = codes.get(name) or next((c for n, c in codes.items() if n.startswith(name)), None)
                if not code:
                    raise Invalid(f"{k}: one of {', '.join(codes)} (not {v!r})")
                pat[pos] = code
                said.append(f"{k} {next(n for n, c in codes.items() if c == code)}")
            pattern = "".join(pat)
        chosen = [x["term"] for x in t["terms"]]
        total, hits, counts = 0, [], []
        if chosen:
            marks = ",".join("?" * len(chosen))
            where, args = (f"g.lemma IN ({marks})", chosen) if mode == "lemma" else (f"t.form IN ({marks})", chosen)
            if pattern:
                where += " AND g.postag LIKE ?"
                args = [*args, pattern]
            if work:
                where += " AND e.work_id = ?"
                args = [*args, work]
            join = "FROM tag g JOIN token t ON t.id = g.token_id JOIN edition e ON e.id = t.edition_id" if (pattern or mode == "lemma") else \
                   "FROM token t JOIN edition e ON e.id = t.edition_id LEFT JOIN tag g ON 0"
            counts = self.rows(f"SELECT e.work_id, count(DISTINCT t.id) AS n {join} WHERE {where} GROUP BY e.work_id ORDER BY n DESC", *args)
            total = sum(c["n"] for c in counts)
            ids = [r["id"] for r in self.rows(f"SELECT DISTINCT t.id {join} WHERE {where} ORDER BY t.id LIMIT ?", *args, limit)]
            hits = self.words.hits(ids)
        how = {"lemma": "tagged by GLAUx with the lemma", "form": "printed as the form", "plain": "spelt with the letters"}[mode]
        terms = ", ".join(chosen[:8]) + ("…" if len(chosen) > 8 else "")
        why = f"{how} {terms}" + (f", parsed {', '.join(said)}" if said else "") + (" (machine tagging, not checked by hand)" if mode == "lemma" else "")
        res = [{"title": f"{h['title']} {h['ref']}", "href": f"#{h['slug']}/{h['ref']}",
                "snippet": f"{h['before']} [[{h['form']}]] {h['after']}", "why": why, "lang": "grc"} for h in hits]
        by_work = ", ".join(f"{self.title(c['work_id'])[0]} {c['n']}" for c in counts[:8])
        more = f"#search?q={t['word']}&by={mode}"
        return {"kind": "word", "label": f"The Greek word {t['word']}" + (f" ({', '.join(said)})" if said else ""), "total": total,
                "results": res, "more": more, "summary": f"{total:,} words {why}" + (f"; most in {by_work}" if by_work else ""),
                "understood": f"the Greek word {t['word']}, {t['how']}" + (f", filtered to {', '.join(said)}" if said else "")}

    # ------------------------------------------------------------ the texts

    def texts(self, kind, fts, terms, work, who, trans, limit):
        where, args = "d.kind = ?", [kind]
        if work and kind != "ancient":
            where += " AND d.work_id = ?"
            args.append(work)
        if kind == "english" and (trans or who):
            where += " AND d.who LIKE ?"
            args.append(f"%{trans or who}%")
        if kind == "note" and who:
            where += " AND d.who LIKE ?"
            args.append(f"%{who}%")
        if kind == "ancient" and who:
            where += " AND d.who LIKE ?"
            args.append(f"%{who}%")
        if kind in ("greek", "ancient") and trans:
            return {"total": 0}
        base = f"FROM find_fts f JOIN find_doc d ON d.id = f.rowid WHERE find_fts MATCH ? AND {where}"
        try:
            total = self.db.execute(f"SELECT count(*) {base}", (fts, *args)).fetchone()[0]
        except sqlite3.OperationalError as e:
            raise Invalid(f"could not read the words: {e}")
        if not total:
            return {"total": 0}
        found = self.rows(f"SELECT d.* {base} ORDER BY bm25(find_fts), d.id LIMIT ?", fts, *args, limit)
        res = []
        for d in found:
            if kind in ("greek", "english"):
                text = self.db.execute("SELECT text FROM chunk WHERE id = ?", (int(d["key"]),)).fetchone()[0]
                t, slug = self.title(d["work_id"])
                res.append({"title": f"{t} {d['ref']}" + (f" · {d['who']}" if d["who"] else ""), "href": f"#{slug}/{d['ref']}",
                            "snippet": snippet(text, terms), "lang": "grc" if kind == "greek" else "en",
                            "why": (f"Burnet's Greek of {t} {d['ref']} contains the words, accents ignored" if kind == "greek"
                                    else f"{d['who']}'s English of {t} {d['ref']} contains the words")})
            elif kind == "note":
                body = self.db.execute("SELECT body FROM note WHERE id = ?", (int(d["key"]),)).fetchone()[0]
                t, slug = self.title(d["work_id"])
                res.append({"title": f"{d['who']} on {t} {d['ref']}", "href": f"#{slug}/{d['ref']}", "note_id": int(d["key"]),
                            "snippet": snippet(strip_html(body), terms), "why": f"the note by {d['who']} on {t} {d['ref']} contains the words"})
            else:
                tid, seq = d["key"].split(":")
                text = self.db.execute("SELECT text FROM ancient_section WHERE text_id = ? AND seq = ?", (tid, int(seq))).fetchone()[0]
                res.append({"title": f"{d['who']} {d['ref'] or ''}".strip(), "ancient": tid, "at": d["ref"],
                            "snippet": snippet(text, terms), "why": f"{d['who']}, section {d['ref']}, contains the words"})
        return {"kind": kind, "label": TEXT_KINDS[kind], "total": total, "results": res}

    # ------------------------------------------------------------ the library's records

    @staticmethod
    def _match(terms, *texts):
        """Which of the texts contain every term (folded); the names of the fields that matched."""
        hit = []
        if not terms:
            return hit
        for name, t in texts:
            ft = fold(t or "")
            if all(x in ft for x in terms):
                hit.append(name)
        return hit

    def _terms(self, words, phrases):
        return [fold(w) for w in words] + [fold(p) for p in phrases]

    def concepts(self, text, words, phrases, fields):
        terms = self._terms(words, phrases)
        res = []
        for c in self.rows("SELECT id, label, greek, note, keywords FROM concept ORDER BY seq"):
            lemmas = " ".join(r[0] for r in self.db.execute("SELECT lemma FROM concept_term WHERE concept_id = ?", (c["id"],)))
            hit = self._match(terms, ("its name", c["label"]), ("its Greek", c["greek"]), ("the words it is indexed under", lemmas),
                              ("its keywords", " ".join(json.loads(c["keywords"] or "[]"))), ("its description", c["note"]))
            if hit:
                res.append({"title": c["label"], "href": f"#concepts/{c['id']}", "snippet": (c["note"] or "")[:200],
                            "why": "the concept index: " + ", ".join(hit) + " match"})
        return {"kind": "concept", "label": "Concepts", "total": len(res), "results": res[:LIMIT]}

    def tensions(self, text, words, phrases, fields):
        terms = self._terms(words, phrases)
        method = fields.get("method")
        if not terms and not method:
            return None
        res = []
        for t in self.rows("SELECT id, title, question, nature FROM reconcile_tension ORDER BY seq"):
            says = " ".join(r[0] for r in self.db.execute("SELECT says FROM reconcile_passage WHERE tension_id = ?", (t["id"],)))
            readings = self.rows("SELECT r.method_id, m.name, r.by, r.summary, r.status FROM reconcile_reading r JOIN reconcile_method m ON m.id = r.method_id "
                                 "WHERE r.tension_id = ?", t["id"])
            if method:
                ms = [r for r in readings if fold(method) in fold(r["method_id"] + " " + r["name"])]
                if not ms:
                    continue
                why = "reconciled by the method " + "; ".join(f"{r['name']} ({r['status']}, {r['by']})" for r in ms)
                if terms and not self._match(terms, ("", t["title"] + t["question"] + t["nature"] + says)):
                    continue
            else:
                hit = self._match(terms, ("its title", t["title"]), ("its question", t["question"]), ("the nature of the contradiction", t["nature"]),
                                  ("what its passages say", says), ("its readings", " ".join(r["summary"] + " " + r["by"] for r in readings)))
                if not hit:
                    continue
                why = "the reconciliation record: " + ", ".join(hit) + " match"
            res.append({"title": t["title"], "href": f"#reconcile/{t['id']}", "snippet": t["question"][:220], "why": why})
        return {"kind": "tension", "label": "Reconciliations", "total": len(res), "results": res[:LIMIT]}

    def methods(self, text, words, phrases, fields):
        terms = self._terms(words, phrases) or [fold(fields.get("method", ""))]
        res = []
        for m in self.rows("SELECT id, name, plain, greek FROM reconcile_method ORDER BY seq"):
            hit = self._match(terms, ("its name", m["name"] + " " + m["id"]), ("its Greek", m["greek"]), ("its description", m["plain"]))
            if hit:
                res.append({"title": m["name"], "href": f"#reconcile/methods/{m['id']}", "snippet": m["plain"][:220],
                            "why": "the methods database: " + ", ".join(hit) + " match"})
        return {"kind": "method", "label": "Interpretive methods", "total": len(res), "results": res}

    def dossiers(self, text, words, phrases, fields):
        if not self.db.execute("SELECT 1 FROM sqlite_master WHERE name = 'dossier'").fetchone():
            return None
        terms = self._terms(words, phrases)
        res = []
        for d in self.rows("SELECT * FROM dossier ORDER BY grp, seq"):
            try:
                about = (json.loads(d.get("data") or "{}") or {}).get("about") or ""
            except ValueError:
                about = ""
            hit = self._match(terms, ("its name", d.get("label")), ("its Greek", d.get("greek")), ("its description", about))
            if hit:
                res.append({"title": d.get("label") or d["id"], "href": f"#dossiers/{d['id']}", "snippet": about[:220],
                            "why": "the dossiers: " + ", ".join(hit) + " match"})
        return {"kind": "dossier", "label": "Dossiers", "total": len(res), "results": res[:LIMIT]}

    def names(self, text, words, phrases, fields):
        """Works, commentators, translators and ancient authors whose names match."""
        terms = self._terms(words, phrases)
        if not terms or any(len(t) < 3 for t in terms):
            return None
        res = []
        for w in self.rows("SELECT id, title, abbr, slug, imported FROM work ORDER BY id"):
            if self._match(terms, ("", f"{w['title']} {w['abbr'] or ''} {w['id']}")):
                res.append({"title": w["title"], "href": f"#{w['slug']}" if w["imported"] else f"#{w['slug']}/whole", "snippet": "",
                            "why": f"a dialogue whose title or abbreviation ({w['abbr']}) matches"})
        for c in self.rows("SELECT c.id, c.label, c.author, c.title, c.work_id, c.n_notes, w.slug, w.title AS wt FROM commentary c JOIN work w ON w.id = c.work_id ORDER BY c.author, c.work_id"):
            if self._match(terms, ("", f"{c['author']} {c['label']} {c['title']}")):
                res.append({"title": f"{c['label']}: {c['title']}", "href": "#commentaries", "snippet": f"{c['n_notes'] or 0} notes on the {c['wt']}",
                            "why": f"a commentary whose author or title matches ({c['author']})"})
        for e in self.rows("SELECT label, responsible, count(*) AS n, group_concat(work_id) AS works FROM edition WHERE lang = 'eng' GROUP BY label ORDER BY label"):
            if self._match(terms, ("", f"{e['label']} {e['responsible']}")):
                res.append({"title": f"{e['label']} (translator: {e['responsible']})", "href": "#search", "snippet": f"English of {e['n']} works",
                            "why": "a translator whose name matches; search with translator:" + e["label"].split(" ")[0] + " to see only their English"})
        for a in self.rows("SELECT id, title, author, translator FROM ancient_text ORDER BY id"):
            if self._match(terms, ("", f"{a['title']} {a['author']} {a['translator']}")):
                res.append({"title": a["title"], "ancient": a["id"], "at": "", "snippet": f"{a['author']}, translated by {a['translator']}",
                            "why": "an ancient text whose author, title or translator matches"})
        return {"kind": "names", "label": "Works, commentators, translators", "total": len(res), "results": res[:LIMIT * 2]}

    def your_work(self, text, words, phrases, fields):
        if not self.mine:
            return None
        terms = self._terms(words, phrases)
        listing = not terms   # mine: alone lists all your work
        titles = {u: (t, s) for u, t, s in self.db.execute("SELECT urn, title, slug FROM work")}
        res = []
        with self.mine.session() as db:
            for table, kind in (("translation", "'translation'"), ("user_note", "kind")):
                for r in db.execute(f"SELECT id, work_urn, start_ref, label, body, {kind} AS kind FROM {table} WHERE deleted_at IS NULL ORDER BY updated_at DESC"):
                    if listing or self._match(terms, ("", f"{r['label'] or ''} {r['body']}")):
                        t, slug = titles.get(r["work_urn"], (r["work_urn"], ""))
                        res.append({"title": f"Your {r['kind']} on {t} {r['start_ref']}", "href": f"#{slug}/{r['start_ref']}",
                                    "snippet": snippet(r["body"], terms), "why": f"your {r['kind']} contains the words"})
            for r in db.execute("SELECT id, title, query, body FROM word_study WHERE deleted_at IS NULL"):
                if listing or self._match(terms, ("", f"{r['title']} {r['query']} {r['body']}")):
                    res.append({"title": f"Your word study “{r['title']}”", "href": "#search", "snippet": snippet(r["body"] or r["query"], terms),
                                "why": "your word study's title, word or note contains the words"})
            for r in db.execute("SELECT id, title, tension_id, body FROM reconciliation WHERE deleted_at IS NULL"):
                sheet = json.loads(r["body"])
                flat = " ".join(str(sheet.get(k) or "") for k in ("contradiction", "dictionary", "commentary", "interpretation", "rendering", "references"))
                method = fields.get("method")
                if method and not any(fold(method) in fold(m) for m in sheet.get("methods", [])):
                    continue
                if listing or self._match(terms, ("", f"{r['title']} {flat}")):
                    res.append({"title": f"Your reconciliation “{r['title']}”", "href": f"#reconcile/sheet/{r['id']}", "snippet": snippet(flat, terms),
                                "why": ("your reconciliation worksheet" + (" contains the words" if terms else "")) + (f", using the method {method}" if method else "")})
            if not fields.get("method"):
                for r in db.execute("SELECT id, title, body FROM user_method WHERE deleted_at IS NULL"):
                    m = json.loads(r["body"])
                    if listing or self._match(terms, ("", f"{r['title']} {m.get('plain')} {m.get('citation')}")):
                        res.append({"title": f"Your method “{r['title']}”", "href": "#reconcile/methods", "snippet": m.get("plain", "")[:200],
                                    "why": "your own interpretive method" + (" contains the words" if terms else "")})
        return {"kind": "mine", "label": "Your work", "total": len(res), "results": res[:LIMIT * 2]}


def main():
    import argparse
    import build_db
    ap = argparse.ArgumentParser(description="Search the whole Workshop from the command line.")
    ap.add_argument("query", nargs="*")
    ap.add_argument("--build", action="store_true", help="(re)build the search index in the existing library")
    args = ap.parse_args()
    if args.build:
        db = sqlite3.connect(build_db.DB_PATH)
        print(build(db))
        db.commit()
        return
    db = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    r = Find(db).find(" ".join(args.query))
    print("Read as: " + "; ".join(r["understood"]))
    for g in r["groups"]:
        print(f"\n{g['label']}: {g['total']}" + (f"  ({g['summary']})" if g.get("summary") else ""))
        for x in g["results"]:
            print(f"  {x['title']}\n    why: {x['why']}" + (f"\n    {x['snippet'][:160]}" if x.get("snippet") else ""))


if __name__ == "__main__":
    main()
