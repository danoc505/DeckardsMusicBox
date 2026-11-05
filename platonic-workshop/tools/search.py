"""Word search across all of Plato (milestone 5).

Three ways to search, all over the Greek text as imported:

  lemma   by dictionary form: every word GLAUx tagged with that lemma
          (machine-tagged, so the result is labelled so). λόγος finds λόγου,
          λόγοις, λόγων ...
  form    by the exact form as printed, accents included: λόγον
  plain   by the letters only, ignoring accents, breathings and capitals: λογον
          finds λόγον and λογόν alike

A query may be typed in Greek or in Beta Code (lo/gos). A trailing * searches
by beginning (λογ*: every lemma or form whose letters start with λογ).

Counts per work come from lemma_count and form_count (built with the library),
so they are exact and immediate. Occurrences are returned in reading order,
work by work in Thrasyllus' order, a page at a time.
"""
import re

import greek

MODES = ("lemma", "form", "plain")
MAX_TERMS = 200      # lemmas or forms a wildcard may expand to
PAGE = 100
CONTEXT = 70         # characters of context each side


class Invalid(ValueError):
    pass


def plain(s):
    return greek.strip_accents(re.sub(r"\d", "", s or "")).rstrip(greek.APOSTROPHES)


def normalise(q):
    """The query as Greek, and whether it ends in *. Latin letters are read as Beta Code."""
    q = (q or "").strip()
    star = q.endswith("*")
    q = q.rstrip("*").strip()
    if not q:
        raise Invalid("type a word")
    if re.search(r"[A-Za-z]", q):
        q = greek.from_betacode(q)
    q = greek.nfc(q)
    if not greek.is_greek(q) or " " in q:
        raise Invalid("one Greek word, or one word in Beta Code")
    return q, star


class Search:
    def __init__(self, db):
        self.db = db  # read-only library connection (sqlite3.Row rows)

    def rows(self, sql, *args):
        return [dict(r) for r in self.db.execute(sql, args)]

    def works(self):
        return {r["id"]: r for r in self.rows("SELECT id, title, abbr, slug, n_tokens FROM work WHERE imported = 1 ORDER BY id")}

    # ------------------------------------------------------------ what a query means

    def terms(self, q, by, exact_only=False):
        """The lemmas (by='lemma') or forms (by='form'/'plain') a query matches,
        each with its total in Plato. Also `near`: other lemmas with the same
        letters, offered when an exact lemma match was found."""
        if by not in MODES:
            raise Invalid(f"search by one of {MODES}")
        word, star = normalise(q)
        p = plain(word)
        table, col = ("lemma_count", "lemma") if by == "lemma" else ("form_count", "form")
        near = []
        if star:
            like = p.replace("%", "").replace("_", "") + "%"
            terms = self.rows(f"SELECT {col} AS term, plain, sum(n) AS total FROM {table} WHERE plain LIKE ? GROUP BY {col} "
                              f"ORDER BY total DESC LIMIT ?", like, MAX_TERMS + 1)
            how = f"every {'lemma' if by == 'lemma' else 'form'} beginning {p}"
        elif by == "plain":
            terms = self.rows("SELECT form AS term, plain, sum(n) AS total FROM form_count WHERE plain = ? GROUP BY form ORDER BY total DESC", p)
            how = f"every form spelt {p}, whatever its accents"
        else:
            terms = self.rows(f"SELECT {col} AS term, plain, sum(n) AS total FROM {table} WHERE {col} = ? GROUP BY {col}", word)
            how = f"the {'lemma' if by == 'lemma' else 'form'} {word} exactly"
            same_letters = self.rows(f"SELECT {col} AS term, plain, sum(n) AS total FROM {table} WHERE plain = ? GROUP BY {col} "
                                     f"ORDER BY total DESC", p)
            if not terms and not exact_only:
                terms = same_letters
                how = f"no {'lemma' if by == 'lemma' else 'form'} is spelt exactly {word}; every one with the letters {p}"
            else:
                near = [t for t in same_letters if t["term"] != word]
        truncated = len(terms) > MAX_TERMS
        return {"query": q, "word": word, "plain": p, "by": by, "wildcard": star, "how": how,
                "terms": terms[:MAX_TERMS], "truncated": truncated, "near": near}

    # ------------------------------------------------------------ counts and occurrences

    def search(self, q, by="lemma", works=None, after=0, limit=PAGE, exact_only=False, terms=None):
        """Counts per work and one page of occurrences. `terms` narrows the
        search to some of the matched lemmas or forms; `works` to some works."""
        t = self.terms(q, by, exact_only)
        chosen = [x["term"] for x in t["terms"]]
        if terms:
            chosen = [x for x in chosen if x in set(terms)]
        all_works = self.works()
        works = [w for w in (works or []) if w in all_works]
        out = {**t, "chosen": chosen, "works_filter": works, "counts": [], "total": 0, "hits": [], "next_after": None}
        if not chosen:
            return out
        table, col = ("lemma_count", "lemma") if by == "lemma" else ("form_count", "form")
        marks = ",".join("?" * len(chosen))
        counts = self.rows(f"SELECT work_id, sum(n) AS n FROM {table} WHERE {col} IN ({marks}) GROUP BY work_id ORDER BY work_id", *chosen)
        for c in counts:
            w = all_works[c["work_id"]]
            c.update(title=w["title"], abbr=w["abbr"], slug=w["slug"], words=w["n_tokens"],
                     per_10k=round(c["n"] * 10000 / w["n_tokens"], 1) if w["n_tokens"] else None)
        out["counts"] = counts
        out["total"] = sum(c["n"] for c in counts)
        out["total_in_filter"] = sum(c["n"] for c in counts if not works or c["work_id"] in works)
        limit = max(1, min(int(limit or PAGE), 500))
        after = int(after or 0)
        ranges = ""
        args = []
        if works:
            spans = self.rows(f"SELECT first_token, last_token FROM work WHERE id IN ({','.join('?' * len(works))})", *works)
            ranges = " AND (" + " OR ".join("token_id BETWEEN ? AND ?" for _ in spans) + ")"
            for s in spans:
                args += [s["first_token"], s["last_token"]]
        if by == "lemma":
            ids = [r["token_id"] for r in self.rows(
                f"SELECT DISTINCT token_id FROM tag WHERE lemma IN ({marks}) AND token_id > ?{ranges} ORDER BY token_id LIMIT ?",
                *chosen, after, *args, limit + 1)]
        else:
            ids = [r["token_id"] for r in self.rows(
                f"SELECT id AS token_id FROM token WHERE form IN ({marks}) AND id > ?{ranges.replace('token_id', 'id')} ORDER BY id LIMIT ?",
                *chosen, after, *args, limit + 1)]
        if len(ids) > limit:
            ids = ids[:limit]
            out["next_after"] = ids[-1]
        out["hits"] = self.hits(ids, all_works)
        return out

    def hits(self, ids, all_works=None):
        """Each token with its place, the words around it, and its tagged lemma and parse."""
        if not ids:
            return []
        all_works = all_works or self.works()
        marks = ",".join("?" * len(ids))
        rows = self.rows(
            f"SELECT t.id, t.chunk_id, t.section_ref, t.seq, t.start, t.end, t.form, e.work_id, c.text, c.seq AS chunk_seq, "
            f"c.edition_id, c.speaker FROM token t JOIN chunk c ON c.id = t.chunk_id JOIN edition e ON e.id = t.edition_id "
            f"WHERE t.id IN ({marks}) ORDER BY t.id", *ids)
        tags = {}
        for g in self.rows(f"SELECT token_id, part, lemma, postag, analysis FROM tag WHERE token_id IN ({marks}) ORDER BY token_id, part", *ids):
            tags.setdefault(g["token_id"], []).append(g)
        neighbours = {}

        def chunk_text(edition_id, seq):
            k = (edition_id, seq)
            if k not in neighbours:
                r = self.db.execute("SELECT text FROM chunk WHERE edition_id = ? AND seq = ?", k).fetchone()
                neighbours[k] = r[0] if r else ""
            return neighbours[k]

        out = []
        for r in rows:
            text = r["text"]
            before, after = text[:r["start"]], text[r["end"]:]
            if len(before) < CONTEXT:
                before = chunk_text(r["edition_id"], r["chunk_seq"] - 1)[-(CONTEXT - len(before)):] + " " + before if r["chunk_seq"] else before
            if len(after) < CONTEXT:
                after = after + " " + chunk_text(r["edition_id"], r["chunk_seq"] + 1)[:CONTEXT - len(after)]
            before = _trim_left(before[-CONTEXT:]) if len(before) > CONTEXT else before
            after = _trim_right(after[:CONTEXT]) if len(after) > CONTEXT else after
            w = all_works[r["work_id"]]
            g = tags.get(r["id"], [])
            out.append({"token_id": r["id"], "work_id": r["work_id"], "title": w["title"], "abbr": w["abbr"], "slug": w["slug"],
                        "ref": r["section_ref"], "word": r["seq"], "form": r["form"], "speaker": r["speaker"],
                        "before": before.strip(), "after": after.strip(),
                        "lemma": " + ".join(x["lemma"] or "" for x in g) or None,
                        "postag": [x["postag"] for x in g], "features": [greek.decode_postag(x["postag"]) for x in g],
                        "hand_checked": bool(g) and all(x["analysis"] == "manual" for x in g)})
        return out

    # ------------------------------------------------------------ for the reader and the search box

    def elsewhere(self, lemma):
        """Per-work counts of one lemma, for the word box: 'this word elsewhere in Plato'."""
        rows = self.rows("SELECT l.work_id, w.title, w.abbr, w.slug, l.n FROM lemma_count l JOIN work w ON w.id = l.work_id "
                         "WHERE l.lemma = ? ORDER BY l.n DESC, l.work_id", lemma)
        return {"lemma": lemma, "total": sum(r["n"] for r in rows), "works": len(rows), "counts": rows}

    def suggest(self, q, limit=12):
        """Lemmas and forms whose letters begin with the query, most frequent first."""
        try:
            word, _ = normalise(q)
        except Invalid:
            return {"lemmas": [], "forms": []}
        like = plain(word).replace("%", "").replace("_", "") + "%"
        lem = self.rows("SELECT lemma AS term, sum(n) AS total FROM lemma_count WHERE plain LIKE ? GROUP BY lemma ORDER BY total DESC LIMIT ?", like, limit)
        frm = self.rows("SELECT form AS term, sum(n) AS total FROM form_count WHERE plain LIKE ? GROUP BY form ORDER BY total DESC LIMIT ?", like, limit)
        return {"lemmas": lem, "forms": frm}


def _trim_left(s):
    i = s.find(" ")
    return s[i + 1:] if 0 <= i < 20 else s


def _trim_right(s):
    i = s.rfind(" ")
    return s[:i] if i > len(s) - 20 else s
