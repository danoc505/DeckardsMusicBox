#!/usr/bin/env python3
"""Run the Workshop reader on this computer.

    python3 tools/build_db.py      # once, and after any change to the sources
    python3 tools/serve.py         # then open http://localhost:8800/

Standard library only. Serves reader/ and a small JSON API over
data/workshop.sqlite (the library, read only) and data/user.sqlite (your own
work, written only through tools/mywork.py, which keeps every version).
It listens on 127.0.0.1 only, so nothing is reachable from other machines,
and refuses writes from any page not served by itself.
"""
import argparse
import json
import os
import tempfile
import mimetypes
import re
import sqlite3
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_db  # noqa: E402
import citations  # noqa: E402
import find  # noqa: E402
import dossiers  # noqa: E402
import greek  # noqa: E402
import lexicon  # noqa: E402
import mywork  # noqa: E402
import reconcile  # noqa: E402
import search  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
READER = ROOT / "reader"


# The columns of a commentary note sent to the reader (milestone 7).
COMMENT_COLS = ("n.id, n.commentary_id, n.commentator, n.note_key, n.kind, n.seq, n.start_ref, n.end_ref, n.lemma_text, "
                "n.word_start, n.word_end_ref, n.word_end, n.word_method, n.computed, n.anchor_method, n.anchor_detail, "
                "n.printed_at, n.proof_status, n.parent_id, length(n.body) AS chars, n.body_html")
LONG_NOTE = 2400      # characters: a note longer than this is sent as its opening (Proclus runs to pages)
EXCERPT = 1400


class Library:
    """Read-only queries the reader needs. One instance per request thread is
    cheap: sqlite connections open in microseconds."""

    def __init__(self, db_path=build_db.DB_PATH, user_path=build_db.USER_DB_PATH):
        if not Path(db_path).exists():
            raise SystemExit(f"{db_path} not found; run python3 tools/build_db.py first")
        self.db = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        # Your work: its own connection per call, so writes from any request thread are safe.
        self.mine = mywork.MyWork(user_path, self.db)
        self.search = search.Search(self.db)
        self.find = find.Find(self.db, self.mine)

    def rows(self, sql, *args, db=None):
        return [dict(r) for r in (db or self.db).execute(sql, args)]

    def one(self, sql, *args):
        r = self.db.execute(sql, args).fetchone()
        return dict(r) if r else None

    # ------------------------------------------------------------ works

    def works(self):
        return self.rows("SELECT w.id, w.urn, w.title, w.imported, w.abbr, w.slug, w.tetralogy, w.n_tokens, "
                         "(SELECT min(ref) FROM section s WHERE s.work_id = w.id AND s.seq = 0) AS first_ref "
                         "FROM work w ORDER BY w.id")

    def work(self, work_id):
        w = self.one("SELECT * FROM work WHERE id = ?", work_id)
        if not w or not w["imported"]:
            return None
        w["editions"] = self.rows(
            "SELECT e.*, s.title AS source_title, s.licence FROM edition e JOIN source s ON s.id = e.source_id WHERE work_id = ?", work_id)
        for e in w["editions"]:
            e["chunks"] = self.one("SELECT count(*) n FROM chunk WHERE edition_id = ?", e["id"])["n"]
            e["sections"] = self.one("SELECT count(DISTINCT section_ref) n FROM chunk WHERE edition_id = ?", e["id"])["n"]
        # How often computed placements are right, from the build's check (reports/alignment.md).
        chk = self.one("SELECT value FROM build WHERE key = 'alignment_check'")
        w["alignment_check"] = json.loads(chk["value"]) if chk else None
        w["sections"] = [r["ref"] for r in self.rows("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", work_id)]
        w["pages"] = self.rows("SELECT label, start_ref, end_ref FROM division WHERE work_id = ? AND kind = 'page' ORDER BY id", work_id)
        w["speeches"] = self.rows("SELECT label, start_ref, end_ref, basis FROM division WHERE work_id = ? AND kind = 'speech' ORDER BY id", work_id)
        w["parts"] = self.rows("SELECT label, start_ref, end_ref, basis, source_id FROM division WHERE work_id = ? AND kind IN ('part', 'skopos') ORDER BY id", work_id)
        w["books"] = self.rows("SELECT kind, label, start_ref, end_ref, basis FROM division WHERE work_id = ? AND kind IN ('book', 'letter') ORDER BY id", work_id)
        w["commentaries"] = self.commentaries(work_id)
        # Milestone 9: the printed divisions of the whole, and the myths and images in it, for "where you are in the whole".
        w["chapters"] = self.rows("SELECT label, start_ref, end_ref, author, precision, detail FROM division WHERE work_id = ? AND kind = 'chapter' ORDER BY seq", work_id)
        w["sidenotes"] = self.rows("SELECT label, start_ref, end_ref, author, precision FROM division WHERE work_id = ? AND kind = 'sidenote' ORDER BY seq", work_id)
        w["themes"] = self.rows("SELECT t.id, t.label, t.kind, p.n, p.start_ref, p.end_ref FROM theme_passage p JOIN theme t ON t.id = p.theme_id "
                                "WHERE p.work_id = ? ORDER BY p.start_ref", work_id)
        # Milestone 10: the concept index's passages in this dialogue.
        w["concepts"] = self.rows("SELECT c.id, c.label, c.layer, p.n, p.start_ref, p.end_ref, p.read_by FROM concept_passage p "
                                  "JOIN concept c ON c.id = p.concept_id WHERE p.work_id = ? ORDER BY p.start_ref", work_id)
        # Milestone 12: the recorded tensions with a passage in this dialogue.
        w["tensions"] = self.rows("SELECT t.id, t.title, p.n, p.side, p.start_ref, p.end_ref FROM reconcile_passage p "
                                  "JOIN reconcile_tension t ON t.id = p.tension_id WHERE p.work_id = ? ORDER BY t.seq, p.n", work_id)
        # The passage dossiers in this dialogue.
        w["dossiers"] = self.rows("SELECT id, label, kind, start_ref, end_ref FROM dossier WHERE work_id = ? ORDER BY seq", work_id) \
            if self.one("SELECT name FROM sqlite_master WHERE name = 'dossier'") else []
        w["counts"] = {
            "notes": self.one("SELECT count(*) n FROM note WHERE work_id = ?", work_id)["n"],
            "links_out": self.one("SELECT count(*) n FROM link WHERE from_work = ?", work_id)["n"],
            "links_in": self.one("SELECT count(*) n FROM link WHERE to_work = ?", work_id)["n"],
            # Milestone 8: notes on other dialogues that cite a passage of this one, or name it.
            "cited_from_others": self.one("SELECT count(DISTINCT note_id) n FROM link WHERE to_work = ? AND from_work != ? "
                                          "AND kind = 'cf' AND certainty != 'unresolved'", work_id, work_id)["n"],
            "named_by_others": self.one("SELECT count(DISTINCT note_id) n FROM link WHERE to_work = ? AND kind = 'dialogue'", work_id)["n"],
            "tokens": w["n_tokens"] or 0,
            # Token ids of a work are one run, so this reads only the work's own rows of tag.
            "tagged": self.one("SELECT count(DISTINCT token_id) n FROM tag WHERE token_id BETWEEN ? AND ?",
                               w["first_token"] or 0, w["last_token"] or -1)["n"],
        }
        return w

    # ------------------------------------------------------------ milestone 9: the whole

    def evidence(self, prefix):
        """Every quotation offered for the claims whose owner starts with prefix, by owner."""
        out = {}
        for e in self.rows("SELECT owner, source_text, work_id, at, quote, found, cited_as, note_id FROM evidence WHERE owner = ? OR owner LIKE ? ORDER BY id",
                           prefix, prefix + ":%"):
            out.setdefault(e["owner"], []).append(e)
        return out

    def orders(self, work_id=None):
        ev = self.evidence("order")
        out = []
        for o in self.rows("SELECT * FROM reading_order ORDER BY seq"):
            o["frame"] = ev.get(f"order:{o['id']}", [])
            o["items"] = self.rows("SELECT i.*, w.title, w.slug, w.imported FROM reading_order_item i LEFT JOIN work w ON w.id = i.work_id "
                                   "WHERE order_id = ? ORDER BY n", o["id"])
            for i in o["items"]:
                i["evidence"] = ev.get(f"order:{o['id']}:{i['n']}", [])
            if work_id and not any(i["work_id"] == work_id for i in o["items"]):
                continue
            out.append(o)
        return out

    def sequences(self, work_id=None):
        ev = self.evidence("sequence")
        out = []
        for s in self.rows("SELECT * FROM sequence ORDER BY seq"):
            s["works"] = json.loads(s["works"])
            if work_id and work_id not in s["works"]:
                continue
            s["testimony"] = ev.get(f"sequence:{s['id']}", [])
            s["steps"] = self.rows("SELECT st.*, w.title, w.slug FROM sequence_step st JOIN work w ON w.id = st.work_id WHERE sequence_id = ? ORDER BY n", s["id"])
            for st in s["steps"]:
                st["evidence"] = ev.get(f"sequence:{s['id']}:{st['n']}", [])
            out.append(s)
        return out

    def themes(self, work_id=None):
        out = []
        groups = {g["id"]: g for g in self.rows("SELECT * FROM theme_group")}
        for t in self.rows("SELECT * FROM theme ORDER BY seq"):
            t["keywords"] = json.loads(t["keywords"])
            t["group"] = groups.get(t["group_id"])
            t["passages"] = self.rows("SELECT p.*, w.title, w.slug FROM theme_passage p JOIN work w ON w.id = p.work_id WHERE theme_id = ? ORDER BY n", t["id"])
            if work_id and not any(p["work_id"] == work_id for p in t["passages"]):
                continue
            for p in t["passages"]:
                p["named"] = self.rows("SELECT n.id, n.commentator, n.start_ref, n.work_id, tn.word FROM theme_named tn JOIN note n ON n.id = tn.note_id "
                                       "WHERE tn.theme_id = ? AND tn.n = ? ORDER BY n.id", t["id"], p["n"])
            t["links"] = self.rows("SELECT tl.n_a, tl.theme_b, tl.n_b, l.from_work, l.from_ref, l.to_work, l.to_ref, l.raw, l.certainty, "
                                   "n.id AS note_id, n.commentator FROM theme_link tl JOIN link l ON l.id = tl.link_id JOIN note n ON n.id = l.note_id "
                                   "WHERE tl.theme_a = ? ORDER BY l.id", t["id"])
            out.append(t)
        return out

    def speakers(self):
        """Who speaks in each dialogue, as the Perseus TEI marks the speeches (<said who>)."""
        out = {}
        for r in self.rows("SELECT d.work_id, d.label, count(*) AS speeches FROM division d WHERE kind = 'speech' GROUP BY d.work_id, d.label ORDER BY d.work_id, speeches DESC"):
            out.setdefault(r["work_id"], []).append({"name": r["label"], "speeches": r["speeches"]})
        return out

    def whole(self, work_id):
        w = self.one("SELECT id, title, slug, tetralogy, imported, abbr FROM work WHERE id = ?", work_id)
        if not w:
            return None
        w["claims"] = self.rows("SELECT c.*, s.title AS source_title FROM claim c JOIN source s ON s.id = c.source_id WHERE work_id = ? ORDER BY c.kind, c.id", work_id)
        w["chapters"] = self.rows("SELECT * FROM division WHERE work_id = ? AND kind = 'chapter' ORDER BY seq", work_id)
        w["sidenotes"] = self.rows("SELECT label, start_ref, end_ref, precision, printed_at FROM division WHERE work_id = ? AND kind = 'sidenote' ORDER BY seq", work_id)
        w["sidenote_basis"] = (self.one("SELECT basis FROM division WHERE work_id = ? AND kind = 'sidenote' LIMIT 1", work_id) or {}).get("basis")
        w["parts"] = self.rows("SELECT label, start_ref, end_ref, basis, kind FROM division WHERE work_id = ? AND kind IN ('part', 'skopos', 'book', 'letter') ORDER BY id", work_id)
        w["introductions"] = self.rows("SELECT c.id, c.label, c.title, c.printed, count(n.id) AS notes FROM commentary c JOIN note n ON n.commentary_id = c.id "
                                       "WHERE c.work_id = ? AND n.kind = 'introduction' GROUP BY c.id ORDER BY c.id", work_id)
        w["orders"] = self.orders(work_id)
        w["sequences"] = self.sequences(work_id)
        w["themes"] = self.themes(work_id)
        w["speakers"] = self.speakers().get(work_id, [])
        # The citation web between this dialogue and the others (milestone 8): notes on one citing the other.
        q = ("SELECT w.id, w.title, w.slug, count(DISTINCT l.note_id) AS notes FROM link l JOIN work w ON w.id = l.{0} "
             "WHERE l.{1} = ? AND l.{0} != ? AND l.kind = 'cf' AND l.certainty != 'unresolved' GROUP BY w.id ORDER BY notes DESC")
        w["cites"] = self.rows(q.format("to_work", "from_work"), work_id, work_id)
        w["cited_by"] = self.rows(q.format("from_work", "to_work"), work_id, work_id)
        return w

    def corpus(self):
        works = self.rows("SELECT id, title, slug, tetralogy, imported, abbr, n_tokens FROM work ORDER BY id")
        matrix = self.rows("SELECT from_work, to_work, count(DISTINCT note_id) AS notes FROM link WHERE kind = 'cf' AND certainty != 'unresolved' "
                           "AND from_work != to_work GROUP BY from_work, to_work")
        stats = self.one("SELECT value FROM build WHERE key = 'structure_stats'")
        return {"works": works, "orders": self.orders(), "sequences": self.sequences(), "themes": self.themes(),
                "speakers": self.speakers(), "citations": matrix,
                "persons": self.rows("SELECT work_id, value, cited_as FROM claim WHERE kind = 'persons' ORDER BY work_id, id"),
                "ancient": self.rows("SELECT * FROM ancient_text ORDER BY id"),
                "stats": json.loads(stats["value"]) if stats else None}

    # ------------------------------------------------------------ milestone 10: the concept index

    def concepts(self):
        """The index: each concept with its layer, terms and how much is gathered under it."""
        out = self.rows("SELECT id, label, greek, layer, note, origin, untagged FROM concept ORDER BY seq")
        for c in out:
            c["origin"] = json.loads(c["origin"])
            c["untagged"] = json.loads(c["untagged"]) if c["untagged"] else []
            c["definitions"] = self.one("SELECT count(*) n FROM concept_cite WHERE concept_id = ? AND kind = 'definition'", c["id"])["n"]
            c["later"] = self.one("SELECT count(*) n FROM concept_cite WHERE concept_id = ? AND kind = 'later'", c["id"])["n"]
            c["terms"] = self.rows("SELECT lemma, broad, occurrences, works FROM concept_term WHERE concept_id = ? ORDER BY n", c["id"])
            c["passages"] = self.one("SELECT count(*) n FROM concept_passage WHERE concept_id = ?", c["id"])["n"]
            c["works"] = self.rows("SELECT DISTINCT p.work_id, w.title, w.slug FROM concept_passage p JOIN work w ON w.id = p.work_id "
                                   "WHERE concept_id = ? ORDER BY p.work_id", c["id"])
            c["related"] = self.rows("SELECT other_id, kind, category FROM concept_relation WHERE concept_id = ? ORDER BY n", c["id"])
        stats = self.one("SELECT value FROM build WHERE key = 'concept_stats'")
        words = self.rows("SELECT c.lemma, c.named, (SELECT sum(n) FROM lemma_count l WHERE l.lemma = c.lemma) AS n FROM compared_word c ORDER BY c.seq")
        return {"concepts": out, "stats": json.loads(stats["value"]) if stats else None, "words": words,
                "categories": self.rows("SELECT name, about, (SELECT count(*) FROM concept_relation r WHERE r.category = k.name) AS n FROM concept_category k ORDER BY seq")}

    def concept(self, concept_id):
        c = self.one("SELECT * FROM concept WHERE id = ?", concept_id)
        if not c:
            return None
        c["keywords"] = json.loads(c["keywords"])
        c["origin"] = json.loads(c["origin"])
        c["untagged"] = json.loads(c["untagged"]) if c["untagged"] else []
        c["compared"] = [r["lemma"] for r in self.rows("SELECT t.lemma FROM concept_term t JOIN compared_word w ON w.lemma = t.lemma WHERE t.concept_id = ?", concept_id)]
        ev = self.evidence(f"concept:{concept_id}")
        c["terms"] = self.rows("SELECT lemma, note, broad, occurrences, works FROM concept_term WHERE concept_id = ? ORDER BY n", concept_id)
        for t in c["terms"]:
            # Lexical evidence: where the word occurs, per dialogue. Not a link between the places.
            t["by_work"] = self.rows("SELECT l.work_id, w.title, w.slug, l.n FROM lemma_count l JOIN work w ON w.id = l.work_id "
                                     "WHERE l.lemma = ? ORDER BY l.n DESC, l.work_id", t["lemma"])
            # LSJ's own citations of Plato for the word, sense by sense, as LSJ prints them.
            t["lsj"] = self.rows("SELECT x.sense, x.gloss, x.work_id, w.title, x.ref, x.quote, x.found FROM lsj_plato x JOIN work w ON w.id = x.work_id "
                                 "WHERE x.lemma = ? ORDER BY x.n", t["lemma"])
        cites = self.rows("SELECT c.kind, c.n, c.source_text, c.says, c.owner, c.note_id, n.commentator, n.work_id AS note_work, n.start_ref AS note_ref, "
                          "w.slug AS note_slug FROM concept_cite c LEFT JOIN note n ON n.id = c.note_id LEFT JOIN work w ON w.id = n.work_id "
                          "WHERE c.concept_id = ? ORDER BY c.kind, c.n", concept_id)
        for x in cites:
            x["evidence"] = ev.get(x["owner"], [])
        c["definitions"] = [x for x in cites if x["kind"] == "definition"]
        c["later"] = [x for x in cites if x["kind"] == "later"]
        c["passages"] = self.rows("SELECT p.*, w.title, w.slug, (SELECT page FROM section s WHERE s.work_id = p.work_id AND s.ref = p.start_ref) AS page "
                                  "FROM concept_passage p JOIN work w ON w.id = p.work_id WHERE concept_id = ? ORDER BY n", concept_id)
        for p in c["passages"]:
            owner = f"concept:{concept_id}:passage:{p['n']}"
            p["evidence"] = ev.get(owner, [])
            p["read_by_evidence"] = [e for k, v in ev.items() if k.startswith(owner + ":read:") for e in v]
            p["named"] = self.rows("SELECT cn.word, n.id AS note_id, COALESCE(cm.label, n.commentator) AS commentator, n.start_ref, n.body "
                                   "FROM concept_named cn JOIN note n ON n.id = cn.note_id LEFT JOIN commentary cm ON cm.id = n.commentary_id "
                                   "WHERE cn.concept_id = ? AND cn.n = ? ORDER BY n.id", concept_id, p["n"])
            for n in p["named"]:
                n["excerpt"] = citations.excerpt(n.pop("body"), n["word"], 220)
        c["related"] = self.rows("SELECT r.n, r.other_id, o.label AS other_label, r.kind, r.category, r.why, r.owner FROM concept_relation r "
                                 "JOIN concept o ON o.id = r.other_id WHERE r.concept_id = ? ORDER BY r.n", concept_id)
        for r in c["related"]:
            r["evidence"] = ev.get(r["owner"], [])
        # The relations other concepts state to this one (their evidence is on their page).
        c["related_from"] = self.rows("SELECT r.concept_id, o.label, r.kind, r.category, r.why FROM concept_relation r JOIN concept o ON o.id = r.concept_id "
                                      "WHERE r.other_id = ? ORDER BY o.seq, r.n", concept_id)
        return c

    def renderings(self, lemma, work=None, after=0, limit=10):
        """How the translators render a word: each place GLAUx tags it, with the Greek section and
        every English translation of that section. Passage by passage: the English is not aligned
        to the Greek word by word, so the whole passage of each translator is given."""
        limit = max(1, min(50, limit))
        cond, args = ("AND e.work_id = ?", (work,)) if work else ("", ())
        places = self.rows(
            "SELECT e.work_id, t.section_ref AS ref, min(s.seq) AS sseq, group_concat(t.form, ' ') AS forms FROM tag g JOIN token t ON t.id = g.token_id "
            "JOIN edition e ON e.id = t.edition_id JOIN section s ON s.work_id = e.work_id AND s.ref = t.section_ref "
            f"WHERE g.lemma = ? {cond} GROUP BY e.work_id, t.section_ref ORDER BY e.work_id, sseq LIMIT ? OFFSET ?",
            lemma, *args, limit + 1, after)
        more = len(places) > limit
        places = places[:limit]
        titles = {w["id"]: w for w in self.rows("SELECT id, title, slug FROM work")}
        for p in places:
            p["title"] = titles[p["work_id"]]["title"]
            p["forms"] = sorted(set(p["forms"].split()))
            p["greek"] = " ".join(r["text"] for r in self.rows(
                "SELECT c.text FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE c.work_id = ? AND c.section_ref = ? AND e.lang = 'grc' ORDER BY c.seq",
                p["work_id"], p["ref"]))
            p["english"] = self.rows(
                "SELECT e.id AS edition_id, e.label, e.responsible, c.translator, c.align_method, c.section_ref, c.end_ref, c.printed_at, "
                "group_concat(c.text, ' ') AS text FROM chunk c JOIN edition e ON e.id = c.edition_id "
                "LEFT JOIN section a ON a.work_id = c.work_id AND a.ref = c.section_ref LEFT JOIN section b ON b.work_id = c.work_id AND b.ref = c.end_ref "
                "WHERE c.work_id = ? AND e.lang = 'eng' AND (c.section_ref = ? OR (c.end_ref IS NOT NULL AND a.seq < ? AND b.seq >= ?)) "
                "GROUP BY e.id ORDER BY e.id", p["work_id"], p["ref"], p["sseq"], p["sseq"])
            del p["sseq"]
        total = self.one("SELECT coalesce(sum(n), 0) n, count(*) w FROM lemma_count WHERE lemma = ?" + (" AND work_id = ?" if work else ""), lemma, *args)
        return {"lemma": lemma, "work": work, "places": places, "after": after, "next": after + limit if more else None,
                "words": total["n"], "works": total["w"],
                "concepts": self.rows("SELECT DISTINCT c.id, c.label FROM concept_term t JOIN concept c ON c.id = t.concept_id WHERE t.lemma = ? ORDER BY c.seq", lemma),
                "by_work": self.rows("SELECT l.work_id, w.title, l.n FROM lemma_count l JOIN work w ON w.id = l.work_id WHERE l.lemma = ? ORDER BY l.n DESC", lemma)}

    # ------------------------------------------------------------ passage dossiers (tools/dossiers.py)

    def dossiers(self):
        """Every dossier, with its span and how much is gathered for it."""
        if not self.one("SELECT name FROM sqlite_master WHERE name = 'dossier'"):
            return {"dossiers": [], "stats": None, "groups": {}, "kinds": {}}
        out = []
        for r in self.rows("SELECT d.id, d.label, d.greek, d.kind, d.work_id, d.start_ref, d.end_ref, d.grp, d.data, w.title, w.slug "
                           "FROM dossier d JOIN work w ON w.id = d.work_id ORDER BY d.seq"):
            x = json.loads(r.pop("data"))
            r["about"] = x.get("about")
            r["diagram"] = (x.get("diagram") or {}).get("kind")
            r["counts"] = {k: len(x.get(k) or []) for k in ("parts", "echoes", "testimonia", "renderings", "web", "related", "shared")}
            r["related"] = [y["dossier"] for y in x.get("related", [])]
            out.append(r)
        stats = self.one("SELECT value FROM build WHERE key = 'dossier_stats'")
        meta = dossiers.load()
        return {"dossiers": out, "stats": json.loads(stats["value"]) if stats else None, "groups": meta["groups"], "kinds": meta["kinds"]}

    def span_refs(self, work_id, a, b):
        return [r["ref"] for r in self.rows("SELECT ref FROM section WHERE work_id = ? AND seq BETWEEN (SELECT seq FROM section WHERE work_id = ? AND ref = ?) "
                                            "AND (SELECT seq FROM section WHERE work_id = ? AND ref = ?) ORDER BY seq", work_id, work_id, a, work_id, b)]

    def dossier(self, dossier_id):
        """A dossier: what was written for it, and everything the library holds on its span."""
        d = self.one("SELECT d.*, w.title, w.slug, w.abbr FROM dossier d JOIN work w ON w.id = d.work_id WHERE d.id = ?", dossier_id)
        if not d:
            return None
        x = json.loads(d.pop("data"))
        d.update(x)
        w, a, b = d["work_id"], d["start_ref"], d["end_ref"]
        refs = self.span_refs(w, a, b)
        marks = ",".join("?" * len(refs))
        d["refs"] = refs
        pages = sorted({int(re.match(r"\d+", r).group()) for r in refs})
        # The text, every edition: the Greek and each translation, section by section (a translation's
        # paragraph that begins before the span and runs into it is included, and marked).
        cols = "c.id, c.edition_id, c.section_ref, c.end_ref, c.para, c.label, c.text, c.align_method, c.translator, c.printed_at"
        d["editions"] = self.rows("SELECT e.id, e.lang, e.label, e.responsible, e.printed, e.proof_status, e.align_method, e.translator_note "
                                  "FROM edition e WHERE e.work_id = ? ORDER BY e.lang = 'eng', e.id", w)
        first = self.one("SELECT seq FROM section WHERE work_id = ? AND ref = ?", w, a)["seq"]
        chunks = self.rows(f"SELECT {cols} FROM chunk c WHERE c.work_id = ? AND c.section_ref IN ({marks}) ORDER BY c.edition_id, c.seq", w, *refs)
        running = self.rows(f"SELECT {cols} FROM chunk c JOIN section s1 ON s1.work_id = c.work_id AND s1.ref = c.section_ref "
                            "JOIN section s2 ON s2.work_id = c.work_id AND s2.ref = c.end_ref "
                            "WHERE c.work_id = ? AND c.end_ref IS NOT NULL AND s1.seq < ? AND s2.seq >= ? ORDER BY c.edition_id, c.seq", w, first, first)
        for c in running:
            c["continued"] = True
        by_ed = {}
        for c in running + chunks:
            by_ed.setdefault(c["edition_id"], []).append(c)
        for e in d["editions"]:
            e["chunks"] = by_ed.get(e["id"], [])
        # Notes placed on the span: translators' notes, commentaries, scholia.
        notes = self.rows(f"SELECT {COMMENT_COLS}, COALESCE(c.label, n.commentator) AS who, n.body FROM note n LEFT JOIN commentary c ON c.id = n.commentary_id "
                          f"WHERE n.work_id = ? AND n.start_ref IN ({marks}) AND (n.kind IS NULL OR n.kind != 'introduction') ORDER BY who, n.id", w, *refs)
        for n in notes:
            n.pop("body")
        d["notes"] = self.shorten(notes)
        # Cited by: every note anywhere citing a section of the span, or one of its pages.
        link_cols = ("l.id, l.raw, l.rule, l.certainty, l.doubt, l.note_id, l.from_work, l.from_ref, l.to_ref, w.title AS from_title, "
                     "COALESCE(c.label, n.commentator) AS commentator, n.body, n.kind AS note_kind")
        cited = self.rows(f"SELECT {link_cols} FROM link l JOIN note n ON n.id = l.note_id JOIN work w ON w.id = l.from_work "
                          f"LEFT JOIN commentary c ON c.id = n.commentary_id WHERE l.to_work = ? AND l.kind = 'cf' AND l.certainty != 'unresolved' "
                          f"AND (l.to_ref IN ({marks}) OR l.to_ref IN ({','.join('?' * len(pages))})) ORDER BY l.from_work, l.from_ref", w, *refs, *map(str, pages))
        for l in cited:
            l["excerpt"] = citations.excerpt(l.pop("body"), l["raw"], 260)
            l["inside"] = l["from_work"] == w and l["from_ref"] in refs
            l["page_only"] = l["to_ref"] not in refs
        d["cited_by"] = cited
        d["cites"] = self.rows(f"SELECT l.id, l.raw, l.certainty, l.note_id, l.from_ref, l.to_work, l.to_ref, w.title AS to_title, COALESCE(c.label, n.commentator) AS commentator "
                               f"FROM link l JOIN note n ON n.id = l.note_id JOIN work w ON w.id = l.to_work LEFT JOIN commentary c ON c.id = n.commentary_id "
                               f"WHERE l.from_work = ? AND l.from_ref IN ({marks}) AND l.kind = 'cf' AND l.certainty != 'unresolved' "
                               f"AND NOT (l.to_work = ? AND l.to_ref IN ({marks})) ORDER BY l.to_work, l.to_ref", w, *refs, w, *refs)
        named = self.rows("SELECT dn.word, dn.placed, n.id AS note_id, n.work_id, n.start_ref, n.kind AS note_kind, wk.title, COALESCE(c.label, n.commentator) AS commentator, n.body "
                          "FROM dossier_named dn JOIN note n ON n.id = dn.note_id JOIN work wk ON wk.id = n.work_id LEFT JOIN commentary c ON c.id = n.commentary_id "
                          "WHERE dn.dossier_id = ? ORDER BY dn.placed DESC, n.work_id, n.id", dossier_id)
        for n in named:
            n["excerpt"] = citations.excerpt(n.pop("body"), n["word"], 300)
        d["named"] = named
        d["vocab"] = self.rows("SELECT lemma, here, plato, works, kind FROM dossier_vocab WHERE dossier_id = ? ORDER BY kind != 'only here', here DESC", dossier_id)
        # The printed divisions over the span: Jowett's marginal analysis, Archer-Hind's chapters.
        d["divisions"] = self.rows("SELECT kind, label, start_ref, end_ref, author, detail FROM division d JOIN section s1 ON s1.work_id = d.work_id AND s1.ref = d.start_ref "
                                   "JOIN section s2 ON s2.work_id = d.work_id AND s2.ref = d.end_ref WHERE d.work_id = ? AND d.kind IN ('chapter', 'sidenote') "
                                   "AND s1.seq <= (SELECT seq FROM section WHERE work_id = ? AND ref = ?) AND s2.seq >= ? ORDER BY s1.seq",
                                   w, w, b, first)
        d["speeches"] = self.rows("SELECT label, start_ref, end_ref FROM division WHERE work_id = ? AND kind = 'speech' AND start_ref IN (" + marks + ") ORDER BY id", w, *refs)
        titles = {r["id"]: r["title"] for r in self.rows("SELECT id, title FROM work")}
        for e in d.get("echoes", []):
            e["title"] = titles.get(e["work"], e["work"])
        for s in d.get("shared", []):
            for p in s["elsewhere"]:
                p["title"] = titles.get(p["work_id"], p["work_id"])
        labels = {r["id"]: r["label"] for r in self.rows("SELECT id, label FROM dossier")}
        for r in d.get("related", []):
            r["label"] = labels.get(r["dossier"], r["dossier"])
        # Other dossiers that point here.
        d["related_from"] = []
        for r in self.rows("SELECT id, label, data FROM dossier WHERE id != ?", dossier_id):
            for y in json.loads(r["data"]).get("related", []):
                if y["dossier"] == dossier_id:
                    d["related_from"].append({"dossier": r["id"], "label": r["label"], "why": y["why"]})
        # Your own translations and notes on the span.
        d["mine"] = self.mine.rows_for_sections(w, refs)
        return d

    def dossier_markdown(self, dossier_id):
        """The dossier as a Markdown study sheet: everything quoted, with where it is."""
        d = self.dossier(dossier_id)
        return dossiers.markdown(d) if d else None

    def ancient(self, text_id, at=None):
        t = self.one("SELECT * FROM ancient_text WHERE id = ?", text_id)
        if not t:
            return None
        if at:
            t["sections"] = self.rows("SELECT * FROM ancient_section WHERE text_id = ? AND n = ?", text_id, at)
        else:
            t["sections"] = self.rows("SELECT * FROM ancient_section WHERE text_id = ? ORDER BY seq", text_id)
        return t

    # ------------------------------------------------------------ one Stephanus page

    def page(self, work_id, page):
        secs = self.rows("SELECT ref, urn FROM section WHERE work_id = ? AND page = ? ORDER BY seq", work_id, page)
        if not secs:
            return None
        refs = [s["ref"] for s in secs]
        marks = ",".join("?" * len(refs))
        cols = ("c.id, c.edition_id, e.lang, c.section_ref, c.end_ref, c.para, c.speaker, c.label, c.text, "
                "c.align_method, c.translator, c.raw, c.printed_at")
        chunks = self.rows(
            f"SELECT {cols} FROM chunk c "
            f"JOIN edition e ON e.id = c.edition_id WHERE c.work_id = ? AND c.section_ref IN ({marks}) ORDER BY c.edition_id, c.seq",
            work_id, *refs)
        # Milestone 6: a translation's paragraph that starts on an earlier page and runs into this one.
        first_seq = self.one("SELECT seq FROM section WHERE work_id = ? AND ref = ?", work_id, refs[0])["seq"]
        running = self.rows(
            f"SELECT {cols}, 1 AS continued FROM chunk c JOIN edition e ON e.id = c.edition_id "
            "JOIN section a ON a.work_id = c.work_id AND a.ref = c.section_ref "
            "JOIN section b ON b.work_id = c.work_id AND b.ref = c.end_ref "
            "WHERE c.work_id = ? AND c.end_ref IS NOT NULL AND a.seq < ? AND b.seq >= ? ORDER BY c.edition_id, c.seq",
            work_id, first_seq, first_seq)
        chunks = running + chunks
        tokens = self.rows(
            f"SELECT t.id, t.chunk_id, t.section_ref, t.seq, t.start, t.end, t.form, "
            f"(SELECT count(*) FROM tag g WHERE g.token_id = t.id) AS tagged FROM token t "
            f"WHERE t.edition_id IN (SELECT id FROM edition WHERE work_id = ?) AND t.section_ref IN ({marks}) ORDER BY t.id",
            work_id, *refs)
        notes = self.rows(
            f"SELECT id, commentator, start_ref, end_ref, edition_id, chunk_id, offset, body_html, printed_at, anchor_method, proof_status, source_id "
            f"FROM note WHERE work_id = ? AND start_ref IN ({marks}) AND commentary_id IS NULL ORDER BY id", work_id, *refs)
        # Milestone 7: the commentaries on these sections (introductions are on the whole dialogue, see commentary()).
        commentary = self.rows(
            f"SELECT {COMMENT_COLS} FROM note n WHERE n.work_id = ? AND n.start_ref IN ({marks}) "
            f"AND n.commentary_id IS NOT NULL AND n.kind != 'introduction' ORDER BY n.commentary_id, n.seq", work_id, *refs)
        self.shorten(commentary)
        # Milestone 8: what each section cites and what cites it, from every note in the
        # library, each link with the note it was read from and how sure the reading is.
        link_cols = ("l.id, l.raw, l.method, l.rule, l.certainty, l.doubt, l.note_id, n.kind AS note_kind, "
                     "COALESCE(c.label, n.commentator) AS commentator, n.computed")
        links_out = self.rows(
            f"SELECT {link_cols}, l.from_ref, l.to_work, l.to_ref, w.title AS to_title, w.imported AS to_imported "
            f"FROM link l JOIN work w ON w.id = l.to_work JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
            f"WHERE l.from_work = ? AND l.from_ref IN ({marks}) AND n.kind IS NOT 'introduction' ORDER BY l.id", work_id, *refs)
        # Links in: to a section here, or to the bare page number.
        links_in = self.rows(
            f"SELECT {link_cols}, l.from_work, l.from_ref, l.to_ref, w.title AS from_title, n.body "
            f"FROM link l JOIN work w ON w.id = l.from_work JOIN note n ON n.id = l.note_id LEFT JOIN commentary c ON c.id = n.commentary_id "
            f"WHERE l.to_work = ? AND (l.to_ref IN ({marks}) OR l.to_ref = ?) AND l.certainty != 'unresolved' ORDER BY l.from_work, l.from_ref",
            work_id, *refs, str(page))
        for l in links_in:
            l["excerpt"] = citations.excerpt(l.pop("body"), l["raw"], 160)
        speeches = self.rows(
            "SELECT label, start_ref, end_ref FROM division WHERE work_id = ? AND kind = 'speech' ORDER BY id", work_id)
        seq = {r: i for i, r in enumerate(self.work_sections(work_id))}
        lo, hi = seq[refs[0]], seq[refs[-1]]
        speeches = [s for s in speeches if seq[s["start_ref"]] <= hi and seq[s["end_ref"]] >= lo]
        # Your translations and notes whose span overlaps this page (it may start on an earlier one).
        mine = self.mine.rows_for_sections(work_id, refs)
        all_pages = [r["page"] for r in self.rows("SELECT DISTINCT page FROM section WHERE work_id = ? ORDER BY page", work_id)]
        i = all_pages.index(page)
        return {
            "work_id": work_id, "page": page, "sections": secs, "chunks": chunks, "tokens": tokens,
            "notes": notes, "commentary": commentary, "links_out": links_out, "links_in": links_in, "speeches": speeches, "mine": mine,
            "prev": all_pages[i - 1] if i > 0 else None, "next": all_pages[i + 1] if i + 1 < len(all_pages) else None,
        }

    # ------------------------------------------------------------ commentaries (milestone 7)

    def shorten(self, notes):
        """A long note is sent as its opening paragraphs; the rest on request (/api/note/<id>).
        Your proofreading marks are added to each."""
        for n in notes:
            html = n.pop("body_html") or ""
            if n["chars"] > LONG_NOTE:
                paras = re.findall(r"<p>.*?</p>", html, re.S)
                out, size = [], 0
                for para in paras:
                    if size and size + len(para) > EXCERPT:
                        break
                    out.append(para if len(para) <= EXCERPT * 2 else para[:EXCERPT].rsplit(" ", 1)[0] + " …</p>")
                    size += len(para)
                n["body_html"] = "".join(out)
                n["long"] = True
            else:
                n["body_html"] = html
        marks = self.mine.proof_marks([n["note_key"] for n in notes])
        for n in notes:
            n["proof"] = marks.get(n["note_key"])
        return notes

    def commentaries(self, work_id):
        rows = self.rows("SELECT id, source_id, author, label, title, printed, kind, lang, proof_status, anchoring, file, stats, n_notes "
                         "FROM commentary WHERE work_id = ? ORDER BY id", work_id)
        for r in rows:
            r["stats"] = json.loads(r["stats"] or "{}")
            r["placed"] = self.rows(
                "SELECT anchor_method, computed, word_method IS NOT NULL AS on_words, count(*) AS n FROM note "
                "WHERE commentary_id = ? GROUP BY 1, 2, 3", r["id"])
        return rows

    def all_commentaries(self):
        """Milestone 11: every commentary in the library, dialogue by dialogue, with how its notes are placed."""
        rows = self.rows(
            "SELECT c.id, c.work_id, w.title AS work_title, w.slug, w.tetralogy, c.author, c.label, c.title, c.printed, c.kind, "
            "c.proof_status, c.anchoring, c.source_id, c.n_notes, "
            "sum(n.kind = 'introduction') AS whole, sum(n.word_start IS NOT NULL) AS on_words, sum(n.computed) AS computed, "
            "count(DISTINCT CASE WHEN n.kind != 'introduction' THEN n.start_ref END) AS sections "
            "FROM commentary c JOIN work w ON w.id = c.work_id LEFT JOIN note n ON n.commentary_id = c.id "
            "GROUP BY c.id ORDER BY w.id, c.kind = 'introduction', c.label")
        stats = self.one("SELECT value FROM build WHERE key = 'commentary_stats'")
        return {"commentaries": rows, "stats": json.loads(stats["value"]) if stats else None}

    def commentary(self, cid, after=0, limit=200):
        """A commentary read straight through, in printed order."""
        c = self.one("SELECT * FROM commentary WHERE id = ?", cid)
        if not c:
            return None
        c["stats"] = json.loads(c["stats"] or "{}")
        notes = self.rows(f"SELECT {COMMENT_COLS} FROM note n WHERE n.commentary_id = ? AND n.seq > ? "
                          "ORDER BY n.kind = 'footnote', n.seq LIMIT ?", cid, after, limit)
        c["notes"] = self.shorten(notes)
        c["more"] = len(notes) == limit
        return c

    def note(self, note_id):
        n = self.one(f"SELECT {COMMENT_COLS}, n.raw, n.body FROM note n WHERE n.id = ?", note_id)
        if not n:
            return None
        n["proof"] = self.mine.proof_marks([n["note_key"]]).get(n["note_key"]) if n["note_key"] else None
        n["proof_history"] = self.mine.proof_history(n["note_key"]) if n["note_key"] else []
        n["footnotes"] = self.rows("SELECT id, note_key, body_html FROM note WHERE parent_id = ? ORDER BY seq", note_id)
        return n

    # ------------------------------------------------------------ the citation web (milestone 8)

    def discussed(self, work=None, commentator=None, uncertain=False, cross=False, limit=100):
        rows = citations.most_discussed(self.db, work=work, commentator=commentator, include_uncertain=uncertain,
                                        cross_only=cross, limit=limit)
        titles = {r["id"]: (r["title"], r["abbr"], r["slug"]) for r in self.rows("SELECT id, title, abbr, slug FROM work")}
        for r in rows:
            r["to_title"], r["to_abbr"], _ = titles.get(r["to_work"], (r["to_work"], None, None))
        who = self.rows("SELECT COALESCE(c.label, n.commentator) AS commentator, count(*) AS n FROM link l JOIN note n ON n.id = l.note_id "
                        "LEFT JOIN commentary c ON c.id = n.commentary_id WHERE l.certainty != 'unresolved' GROUP BY 1 ORDER BY 2 DESC")
        totals = {r["certainty"]: r["n"] for r in self.rows("SELECT certainty, count(*) AS n FROM link GROUP BY certainty")}
        return {"rows": rows, "commentators": who, "totals": totals}

    def cited(self, work_id, ref):
        return citations.citing_notes(self.db, work_id, ref)

    def work_sections(self, work_id):
        return [r["ref"] for r in self.rows("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", work_id)]

    # ------------------------------------------------------------ one word

    def token(self, token_id):
        t = self.one(
            "SELECT t.*, e.work_id, s.urn AS section_urn FROM token t JOIN edition e ON e.id = t.edition_id "
            "JOIN section s ON s.work_id = e.work_id AND s.ref = t.section_ref WHERE t.id = ?", token_id)
        if not t:
            return None
        # CTS subreference: the n-th occurrence of this form in the section.
        n = self.one("SELECT count(*) n FROM token WHERE edition_id = ? AND section_ref = ? AND form = ? AND seq <= ?",
                     t["edition_id"], t["section_ref"], t["form"], t["seq"])["n"]
        t["address"] = f"{t['section_urn']}@{t['form']}[{n}]"
        tags = self.rows("SELECT * FROM tag WHERE token_id = ? ORDER BY source_id, part", token_id)
        for g in tags:
            g["features"] = greek.decode_postag(g["postag"])
        t["tags"] = tags
        tag_lemmas = {greek.strip_accents(re.sub(r"\d", "", g["lemma"] or "")) for g in tags}
        morph = self.rows("SELECT n, lemma, lemma_beta, gloss, parse FROM morph WHERE beta_key = ? ORDER BY n", t["morph_key"]) if t["morph_key"] else []
        for m in morph:
            m["same_lemma_as_tag"] = greek.strip_accents(m["lemma"]) in tag_lemmas
            # The parse the tagger chose, if Morpheus lists it: same lemma, consistent features.
            m["matches_tag"] = m["same_lemma_as_tag"] and any(greek.morpheus_agrees(m["parse"], g["features"]) for g in tags)
        t["morph"] = morph
        # Milestone 3: dictionary entries for the tagged lemma(s), and which of
        # Morpheus's other lemmas have entries (looked up on demand by /api/lookup).
        t["lookup"] = [self.lookup(l) for l in dict.fromkeys(g["lemma"] for g in tags if g["lemma"])]
        have = {r["lemma"] for r in self.rows(
            f"SELECT DISTINCT lemma FROM lemma_entry WHERE lemma IN ({','.join('?' * len(morph)) or 'NULL'})", *[m["lemma"] for m in morph])}
        for m in morph:
            m["has_entry"] = m["lemma"] in have
        t["grammar"] = [self.grammar(g) for g in tags]
        t["sources"] = {s["id"]: s for s in self.rows(
            "SELECT id, title, licence, provenance, commit_sha FROM source WHERE id IN "
            "('glaux-plato', 'morpheus-analyses', 'perseus-greek-plato', 'lsj', 'middle-liddell', 'lsj-abbreviations', 'smyth-grammar', 'agdt-guidelines')")}
        # Milestone 5: this word elsewhere in Plato, per work, for each tagged lemma.
        t["elsewhere"] = [self.search.elsewhere(l) for l in dict.fromkeys(g["lemma"] for g in tags if g["lemma"])]
        here = [c["n"] for e in t["elsewhere"][:1] for c in e["counts"] if c["work_id"] == t["work_id"]]
        t["elsewhere_in_work"] = here[0] if here else 0
        # Milestone 10: concepts indexed under this word's lemma (the word, not this place, is indexed).
        lemmas = [g["lemma"] for g in tags if g["lemma"]]
        t["concepts"] = self.rows(f"SELECT DISTINCT c.id, c.label, c.layer, ct.lemma, ct.broad FROM concept_term ct JOIN concept c ON c.id = ct.concept_id "
                                  f"WHERE ct.lemma IN ({','.join('?' * len(lemmas)) or 'NULL'}) ORDER BY c.seq", *lemmas)
        t["form_in_plato"] = self.one("SELECT coalesce(sum(n), 0) n FROM form_count WHERE form = ?", t["form"])["n"]
        return t

    # ------------------------------------------------------------ dictionaries and grammar

    def lexica(self):
        return self.rows("SELECT * FROM lexicon ORDER BY rowid")

    def lookup(self, lemma):
        """Every entry filed under a lemma, per dictionary, with how it was matched.
        A word not in lemma_entry (typed, or a cross-reference) is matched the same way:
        same Beta Code key, then the same letters and breathing, then letters only.
        Matching is done per dictionary in the build; here, for words outside it, across both."""
        lemma = greek.nfc(re.sub(r"\d", "", lemma or "")).strip()
        rows = self.rows(
            "SELECT le.lexicon_id, le.method, e.id, e.key, e.headword, e.src_id, e.html, e.n_abbr FROM lemma_entry le "
            "JOIN lex_entry e ON e.id = le.entry_id WHERE le.lemma = ? ORDER BY le.lexicon_id, e.id", lemma)
        if not rows and lemma and greek.is_greek(lemma):
            keys = lexicon.lemma_keys(lemma)
            for k, method in zip(keys, ("same-spelling", "capital-lowered")):
                rows = self.rows("SELECT lexicon_id, ? AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE match_key = ? ORDER BY id", method, k)
                if rows:
                    break
            if not rows and keys:
                rows = self.rows("SELECT lexicon_id, 'accent-differs' AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE unaccented_key = ? ORDER BY id",
                                 lexicon.unaccented_key(keys[0]))
            if not rows and keys:
                rows = self.rows("SELECT lexicon_id, 'letters-only' AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE plain_key = ? ORDER BY id",
                                 lexicon.accentless_key(keys[0]))
        by = {lx["id"]: [] for lx in self.lexica()}
        for r in rows:
            by.setdefault(r.pop("lexicon_id"), []).append(r)
        return {"lemma": lemma, "entries": by}

    def grammar(self, tag):
        """Smyth's notes for each category of one tag, and the sentence role's definition."""
        notes = []
        for cat, val in tag["features"]:
            secs = self.rows("SELECT section, heading, rule_html, full_html, url, reason FROM grammar_note "
                             "WHERE category = ? AND value = ? ORDER BY n", cat, val)
            notes.append({"category": cat, "value": val, "smyth": secs})
        role = None
        rel = tag.get("relation") or ""
        if rel:
            base, _, suffix = rel.partition("_")
            role = {"code": rel, "label": self.one("SELECT * FROM relation_label WHERE code = ?", base),
                    "suffix": self.one("SELECT * FROM relation_label WHERE code = ?", "_" + suffix) if suffix else None}
        return {"part": tag["part"], "lemma": tag["lemma"], "notes": notes, "role": role}

    # ------------------------------------------------------------ milestone 12: reconciliation

    def methods(self):
        ev = self.evidence("method")
        out = self.rows("SELECT * FROM reconcile_method ORDER BY seq")
        for m in out:
            m["grounds"] = ev.get(m["owner"], [])
            m["concepts"] = self.rows("SELECT c.id, c.label FROM reconcile_method_concept mc JOIN concept c ON c.id = mc.concept_id "
                                      "WHERE mc.method_id = ? ORDER BY c.seq", m["id"])
            m["used"] = self.rows("SELECT r.tension_id, t.title, r.status, r.by FROM reconcile_reading r JOIN reconcile_tension t ON t.id = r.tension_id "
                                  "WHERE r.method_id = ? ORDER BY t.seq", m["id"])
        return out

    def reconciliations(self):
        out = self.rows("SELECT * FROM reconcile_tension ORDER BY seq")
        sheets = {}
        for r in self.mine.sheets():
            sheets.setdefault(r["tension_id"], []).append(r)
        for t in out:
            t["passages"] = self.rows("SELECT p.n, p.side, p.work_id, w.title, w.slug, p.start_ref, p.end_ref FROM reconcile_passage p "
                                      "JOIN work w ON w.id = p.work_id WHERE p.tension_id = ? ORDER BY p.n", t["id"])
            t["readings"] = self.rows("SELECT r.n, r.method_id, m.name, r.status, r.by FROM reconcile_reading r JOIN reconcile_method m ON m.id = r.method_id "
                                      "WHERE r.tension_id = ? ORDER BY r.n", t["id"])
            t["sheets"] = len(sheets.get(t["id"], []))
        stats = self.one("SELECT value FROM build WHERE key = 'reconcile_stats'")
        return {"tensions": out, "own_sheets": [self._sheet_summary(r) for r in sheets.get(None, [])],
                "stats": json.loads(stats["value"]) if stats else None}

    @staticmethod
    def _sheet_summary(r):
        return {k: r[k] for k in ("id", "title", "tension_id", "rev", "updated_at")} | {"status": r["sheet"].get("status"), "methods": r["sheet"].get("methods", [])}

    def dictionary_evidence(self, lemma, work, refs):
        """A word's senses in Middle Liddell and LSJ, and whether LSJ cites this very passage."""
        out = []
        for lx, html in self.db.execute("SELECT le.lexicon_id, e.html FROM lemma_entry le JOIN lex_entry e ON e.id = le.entry_id "
                                        "WHERE le.lemma = ? ORDER BY le.lexicon_id, e.id", (lemma,)):
            glosses = [re.sub(r"<[^>]+>", "", g).strip() for g in re.findall(r'<em class="tr">(.*?)</em>', html, re.S)]
            here = sorted({r for w, r in re.findall(r'data-work="(tlg\d+)" data-ref="([^"]+)"', html) if w == work and r in refs})
            out.append({"lexicon": lx, "glosses": list(dict.fromkeys(g for g in glosses if g))[:8], "cites_here": here})
        return out

    def reconciliation(self, tid):
        t = self.one("SELECT * FROM reconcile_tension WHERE id = ?", tid)
        if not t:
            return None
        ev = self.evidence(f"reconcile:{tid}")
        t["documented"] = ev.get(t["owner"], [])
        t["passages"] = self.rows("SELECT p.*, w.title, w.slug FROM reconcile_passage p JOIN work w ON w.id = p.work_id "
                                  "WHERE p.tension_id = ? ORDER BY p.n", tid)
        for p in t["passages"]:
            p["evidence"] = ev.get(p["owner"], [])
            refs = list(reconcile.span_refs(self.db, p["work_id"], p["start_ref"], p["end_ref"]))
            p["refs"] = refs
            p["words"] = self.rows("SELECT lemma, why, tagged FROM reconcile_word WHERE tension_id = ? AND n = ?", tid, p["n"])
            for w in p["words"]:
                w["dictionary"] = self.dictionary_evidence(w["lemma"], p["work_id"], set(refs))
            marks = ",".join("?" * len(refs))
            p["notes"] = self.rows(f"SELECT n.id, COALESCE(c.label, n.commentator) AS commentator, n.start_ref, n.kind, length(n.body) AS chars, "
                                   f"substr(n.body, 1, 600) AS opening FROM note n LEFT JOIN commentary c ON c.id = n.commentary_id "
                                   f"WHERE n.work_id = ? AND n.start_ref IN ({marks}) AND n.kind != 'introduction' ORDER BY n.start_ref, c.label, n.seq",
                                   p["work_id"], *refs)
            p["applicable"] = reconcile.applicable(self.db, p["work_id"], p["start_ref"])
        t["cites"] = self.rows("SELECT x.from_n, x.to_n, x.note_id, COALESCE(c.label, n.commentator) AS commentator, n.work_id, n.start_ref, "
                               "substr(n.body, 1, 600) AS opening FROM reconcile_cites x JOIN note n ON n.id = x.note_id "
                               "LEFT JOIN commentary c ON c.id = n.commentary_id WHERE x.tension_id = ? ORDER BY x.from_n, x.to_n", tid)
        t["concepts"] = self.rows("SELECT c.id, c.label, c.greek FROM reconcile_concept rc JOIN concept c ON c.id = rc.concept_id "
                                  "WHERE rc.tension_id = ? ORDER BY c.seq", tid)
        t["readings"] = self.rows("SELECT r.*, m.name AS method_name FROM reconcile_reading r JOIN reconcile_method m ON m.id = r.method_id "
                                  "WHERE r.tension_id = ? ORDER BY r.n", tid)
        for r in t["readings"]:
            r["evidence"] = ev.get(r["owner"], [])
        # The methods for this tension: those its readings use, and those its concepts retrieve (the methods database).
        used = {r["method_id"] for r in t["readings"]}
        t["methods"] = []
        for m in self.rows("SELECT id, name, plain FROM reconcile_method ORDER BY seq"):
            because = [f"used by a reading below ({r['status']}, {r['by']})" for r in t["readings"] if r["method_id"] == m["id"]]
            because += [f"belongs with the concept {c['label']}, which this tension is about" for c in self.rows(
                "SELECT c.label FROM reconcile_method_concept mc JOIN reconcile_concept rc ON rc.concept_id = mc.concept_id "
                "JOIN concept c ON c.id = mc.concept_id WHERE mc.method_id = ? AND rc.tension_id = ? ORDER BY c.seq", m["id"], tid)]
            m["because"] = because
            m["retrieved"] = bool(because)
            t["methods"].append(m)
        concept_ids = {c["id"]: c["label"] for c in t["concepts"]}
        t["my_methods"] = []
        for m in self.mine.user_methods():
            because = [f"you placed it with the concept {concept_ids[c]}, which this tension is about" for c in m["concepts"] if c in concept_ids]
            t["my_methods"].append({**m, "because": because, "retrieved": bool(because)})
        t["sheets"] = [self._sheet_summary(r) | {"sheet": r["sheet"]} for r in self.mine.sheets(tid)]
        return t

    def mine_all(self):
        """Everything of yours, for the My Translations page: by work in Stephanus order, then the rest."""
        works = [{"id": w["id"], "urn": w["urn"], "title": w["title"], "items": rs} for w, rs in self.mine._sorted_by_work(self.mine.all_rows())]
        slugs = {r["id"]: r["slug"] for r in self.rows("SELECT id, slug FROM work")}
        for w in works:
            w["slug"] = slugs.get(w["id"])
        return {"works": works, "studies": self.mine.studies(), "sheets": self.mine.sheets(), "methods": self.mine.user_methods(),
                "deleted_sheets": [r for r in self.mine.sheets(include_deleted=True) if r["deleted_at"]],
                "deleted_methods": [r for r in self.mine.user_methods(include_deleted=True) if r["deleted_at"]]}

    def sources(self):
        return self.rows("SELECT * FROM source ORDER BY rowid")

    def build_info(self):
        return {r["key"]: r["value"] for r in self.rows("SELECT * FROM build")}


class Handler(BaseHTTPRequestHandler):
    library = None
    server_version = "PlatonicWorkshop/6"

    def log_message(self, fmt, *args):
        if self.server.verbose:
            super().log_message(fmt, *args)

    def send_json(self, obj, status=HTTPStatus.OK):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def not_found(self):
        self.send_json({"error": "not found"}, HTTPStatus.NOT_FOUND)

    def send_file(self, body, ctype, filename):
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ------------------------------------------------------------ writes

    def same_origin(self):
        """Accept a write only from the reader itself: the Host must be this
        server (no DNS rebinding), any Origin must match it, and the body must be
        JSON (which a page elsewhere cannot send here without a CORS preflight,
        which this server never answers)."""
        port = self.server.server_address[1]
        hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
        if self.headers.get("Host") not in hosts:
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in {f"http://{h}" for h in hosts}:
            return False
        return (self.headers.get("Content-Type") or "").split(";")[0].strip() == "application/json"

    def read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > 1_000_000:
            raise mywork.Invalid("request too large")
        try:
            data = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, UnicodeDecodeError):
            raise mywork.Invalid("the request is not JSON")
        if not isinstance(data, dict):
            raise mywork.Invalid("the request is not a JSON object")
        return data

    def write(self, method):
        path = unquote(urlparse(self.path).path)
        if not self.same_origin():
            return self.send_json({"error": "writes are accepted only from the reader at this address"}, HTTPStatus.FORBIDDEN)
        mine = self.library.mine
        try:
            data = self.read_json()
            if method == "POST" and path == "/api/mine":
                return self.send_json(mine.create(data), HTTPStatus.CREATED)
            if method == "POST" and path == "/api/proof":
                return self.send_json(mine.add_proof(data), HTTPStatus.CREATED)
            if method == "POST" and path == "/api/studies":
                return self.send_json(mine.create_study(data), HTTPStatus.CREATED)
            if method == "POST" and path == "/api/sheets":
                return self.send_json(mine.create_sheet(data), HTTPStatus.CREATED)
            if method == "POST" and path == "/api/my-methods":
                return self.send_json(mine.create_method(data), HTTPStatus.CREATED)
            m = re.fullmatch(r"/api/mine/(translation|note|study|reconciliation|method)/(\d+)(?:/(delete|restore))?", path)
            if m:
                table, row_id, action = m.group(1), int(m.group(2)), m.group(3)
                if method == "PUT" and not action:
                    return self.send_json(mine.update(table, row_id, data))
                if method == "POST" and action == "delete":
                    return self.send_json(mine.delete(table, row_id, data))
                if method == "POST" and action == "restore":
                    return self.send_json(mine.restore(table, row_id, data))
            return self.not_found()
        except mywork.Conflict as e:
            return self.send_json({"error": "This text was changed somewhere else (another tab?) since you opened it. "
                                            "Nothing was saved over it; your text is still in the editor.",
                                   "current": e.current}, HTTPStatus.CONFLICT)
        except mywork.NotFound as e:
            return self.send_json({"error": f"not found: {e}"}, HTTPStatus.NOT_FOUND)
        except mywork.Invalid as e:
            return self.send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
        except sqlite3.Error as e:
            return self.send_json({"error": str(e)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_POST(self):
        self.write("POST")

    def do_PUT(self):
        self.write("PUT")

    def do_GET(self):
        url = urlparse(self.path)
        path = unquote(url.path)
        query = {k: v[-1] for k, v in parse_qs(url.query).items()}
        lib = self.library
        m = re.fullmatch(r"/api/(.*)", path)
        if m:
            parts = m.group(1).strip("/").split("/")
            try:
                if parts == ["works"]:
                    return self.send_json(lib.works())
                if parts == ["sources"]:
                    return self.send_json({"sources": lib.sources(), "build": lib.build_info()})
                if len(parts) == 2 and parts[0] == "work":
                    w = lib.work(parts[1])
                    return self.send_json(w) if w else self.not_found()
                if len(parts) == 2 and parts[0] == "whole":
                    w = lib.whole(parts[1])
                    return self.send_json(w) if w else self.not_found()
                if parts == ["commentaries"]:
                    return self.send_json(lib.all_commentaries())
                if len(parts) == 2 and parts[0] == "renderings":
                    return self.send_json(lib.renderings(greek.nfc(parts[1]), work=query.get("work") or None,
                                                         after=int(query.get("after") or 0), limit=int(query.get("limit") or 10)))
                if parts == ["concepts"]:
                    return self.send_json(lib.concepts())
                if len(parts) == 2 and parts[0] == "concept":
                    c = lib.concept(parts[1])
                    return self.send_json(c) if c else self.not_found()
                if parts == ["dossiers"]:
                    return self.send_json(lib.dossiers())
                if len(parts) == 2 and parts[0] == "dossier":
                    d = lib.dossier(parts[1])
                    return self.send_json(d) if d else self.not_found()
                if len(parts) == 3 and parts[0] == "dossier" and parts[2] == "md":
                    md = lib.dossier_markdown(parts[1])
                    return self.send_file(md.encode("utf-8"), "text/markdown; charset=utf-8", f"{parts[1]}.md") if md else self.not_found()
                if parts == ["corpus"]:
                    return self.send_json(lib.corpus())
                if len(parts) == 2 and parts[0] == "ancient":
                    t = lib.ancient(parts[1], query.get("at") or None)
                    return self.send_json(t) if t else self.not_found()
                if len(parts) == 3 and parts[0] == "page" and parts[2].isdigit():
                    p = lib.page(parts[1], int(parts[2]))
                    return self.send_json(p) if p else self.not_found()
                if len(parts) == 2 and parts[0] == "lookup":
                    return self.send_json(lib.lookup(parts[1]))
                if parts == ["search"]:
                    lst = lambda k: [x for x in query.get(k, "").split(",") if x] or None
                    try:
                        return self.send_json(lib.search.search(query.get("q", ""), query.get("by", "lemma"), works=lst("works"),
                                                                after=int(query.get("after") or 0), limit=int(query.get("limit") or search.PAGE),
                                                                exact_only=query.get("exact") == "1", terms=lst("terms")))
                    except (search.Invalid, ValueError) as e:
                        return self.send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
                if parts == ["find"]:
                    try:
                        return self.send_json(lib.find.find(query.get("q", "")))
                    except find.Invalid as e:
                        return self.send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
                if parts == ["reconcile"]:
                    return self.send_json(lib.reconciliations())
                if parts == ["methods"]:
                    return self.send_json({"library": lib.methods(), "mine": lib.mine.user_methods()})
                if len(parts) == 2 and parts[0] == "reconcile":
                    t = lib.reconciliation(parts[1])
                    return self.send_json(t) if t else self.not_found()
                if len(parts) == 3 and parts[0] == "applicable":
                    a = reconcile.applicable(lib.db, parts[1], parts[2])
                    return self.send_json(a) if a else self.not_found()
                if parts == ["sheets"]:
                    return self.send_json(lib.mine.sheets(query.get("tension") or None, include_deleted=query.get("deleted") == "1"))
                if parts == ["suggest"]:
                    return self.send_json(lib.search.suggest(query.get("q", "")))
                if len(parts) == 2 and parts[0] == "elsewhere":
                    return self.send_json(lib.search.elsewhere(greek.nfc(parts[1])))
                if parts == ["studies"]:
                    rows = lib.mine.studies(include_deleted=query.get("deleted") == "1")
                    return self.send_json(rows)
                if len(parts) == 2 and parts[0] == "commentary":
                    c = lib.commentary(parts[1], after=int(query.get("after") or 0), limit=min(500, int(query.get("limit") or 200)))
                    return self.send_json(c) if c else self.not_found()
                if len(parts) == 2 and parts[0] == "note" and parts[1].isdigit():
                    n = lib.note(int(parts[1]))
                    return self.send_json(n) if n else self.not_found()
                if parts == ["discussed"]:
                    return self.send_json(lib.discussed(work=query.get("work") or None, commentator=query.get("by") or None,
                                                        uncertain=query.get("uncertain") == "1", cross=query.get("cross") == "1",
                                                        limit=min(500, int(query.get("limit") or 100))))
                if len(parts) in (2, 3) and parts[0] == "cited":
                    # /api/cited/<work>/<ref>: notes citing a passage; /api/cited/<work>: notes naming the dialogue.
                    return self.send_json(lib.cited(parts[1], parts[2] if len(parts) == 3 else ""))
                if parts == ["lexica"]:
                    return self.send_json(lib.lexica())
                if len(parts) == 2 and parts[0] == "token" and parts[1].isdigit():
                    t = lib.token(int(parts[1]))
                    return self.send_json(t) if t else self.not_found()
                if parts == ["mine", "config"]:
                    return self.send_json({"span_units": mywork.SPAN_UNITS, "default_format": mywork.DEFAULT_FORMAT,
                                           "note_kinds": mywork.NOTE_KINDS, "formats": mywork.FORMATS})
                if parts == ["mine", "all"]:
                    return self.send_json(lib.mine_all())
                if parts == ["mine", "deleted"]:
                    return self.send_json(lib.mine.deleted())
                if len(parts) == 4 and parts[0] == "mine" and parts[3] == "history" and parts[2].isdigit():
                    row = lib.mine.get(parts[1], int(parts[2]))
                    return self.send_json({"item": row, "revisions": lib.mine.history(parts[1], int(parts[2]))})
                if len(parts) == 3 and parts[0] == "mine" and parts[2].isdigit():
                    return self.send_json(lib.mine.get(parts[1], int(parts[2])))
                if parts == ["export", "my-plato.md"]:
                    return self.send_file(lib.mine.export_markdown().encode("utf-8"), "text/markdown; charset=utf-8", "my-plato.md")
                if parts == ["export", "my-plato.json"]:
                    body = json.dumps(lib.mine.export_json(), ensure_ascii=False, indent=1).encode("utf-8")
                    return self.send_file(body, "application/json; charset=utf-8", "my-plato.json")
                if parts == ["export", "user.sqlite"]:
                    fd, tmp = tempfile.mkstemp(suffix=".sqlite")
                    os.close(fd)
                    try:
                        lib.mine.export_sqlite(tmp)
                        body = Path(tmp).read_bytes()
                    finally:
                        os.unlink(tmp)
                    return self.send_file(body, "application/vnd.sqlite3", "user.sqlite")
            except (mywork.NotFound, mywork.Invalid):
                return self.not_found()
            except sqlite3.Error as e:
                return self.send_json({"error": str(e)}, HTTPStatus.INTERNAL_SERVER_ERROR)
            return self.not_found()
        # Static files from reader/.
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        f = (READER / rel).resolve()
        if READER.resolve() not in f.parents or not f.is_file():
            return self.not_found()
        body = f.read_bytes()
        self.send_response(HTTPStatus.OK)
        ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("javascript"):
            ctype += "; charset=utf-8"
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def make_server(port=8800, host="127.0.0.1", verbose=False, library=None):
    Handler.library = library or Library()
    srv = ThreadingHTTPServer((host, port), Handler)
    srv.verbose = verbose
    return srv


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=8800)
    ap.add_argument("--verbose", action="store_true", help="log every request")
    args = ap.parse_args()
    build_db.ensure_user_db()
    srv = make_server(args.port, verbose=args.verbose)
    print(f"Platonic Workshop reader: http://localhost:{args.port}/   (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
