"""Tests for milestone 5: all of Plato, the word search and word studies.

    python3 -m unittest discover -s tests -v

Builds four works into a temporary folder (the Euthyphro, the Republic, the
Timaeus and the Letters: the first work, the two with books or letters, and
the pilot), about 40 seconds. Skipped if tools/fetch_sources.py has not been run.
"""
import json
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import greek  # noqa: E402
import mywork  # noqa: E402
import search  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()
WORKS = ["tlg001", "tlg030", "tlg031", "tlg036"]


class Helpers(unittest.TestCase):
    def test_normalise(self):
        self.assertEqual(search.normalise("lo/gos"), ("λόγος", False))
        self.assertEqual(search.normalise(" λογ* "), ("λογ", True))
        with self.assertRaises(search.Invalid):
            search.normalise("two words")
        with self.assertRaises(search.Invalid):
            search.normalise("*")

    def test_plain(self):
        self.assertEqual(search.plain("Λόγος"), "λογοσ")
        self.assertEqual(search.plain("δ’"), "δ")

    def test_slug(self):
        self.assertEqual(build_db.slug("Alcibiades 1"), "alcibiades-1")
        self.assertEqual(build_db.slug("Greater Hippias"), "greater-hippias")

    def test_bare_references_go_to_the_notes_own_work(self):
        import xml.etree.ElementTree as ET
        el = ET.fromstring('<note xmlns="http://www.tei-c.org/ns/1.0">cf. 509 B and 31 B, and <title>Tim.</title> 29 E</note>')
        got = [(w, r) for w, r, _ in build_db.note_links(el, "514a", "tlg030", (327, 621))]
        self.assertEqual(got, [("tlg030", "509b"), ("tlg031", "29e")])  # 31 B is not a page of the Republic

    def test_work_ids_and_abbreviations(self):
        self.assertEqual(build_db.ALL_WORKS[0], "tlg001")
        self.assertEqual(len(build_db.ALL_WORKS), 36)
        self.assertEqual(set(build_db.WORK_ABBR), set(build_db.ALL_WORKS))


class StudyMigration(unittest.TestCase):
    def test_version_2_gains_word_studies_and_keeps_everything(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "user.sqlite"
            db = sqlite3.connect(path)
            schema_v2 = (ROOT / "db" / "user_schema.sql").read_text(encoding="utf-8")
            schema_v2 = schema_v2[:schema_v2.index("CREATE TABLE IF NOT EXISTS word_study")] + schema_v2[schema_v2.index("-- Every version of a translation"):]
            schema_v2 = schema_v2[:schema_v2.index("-- Your proofreading")] + schema_v2[schema_v2.index("INSERT OR IGNORE INTO meta"):]
            db.executescript(schema_v2.replace(f"'schema_version', '{mywork.SCHEMA_VERSION}'", "'schema_version', '2'"))
            db.execute("INSERT INTO translation (work_urn, start_ref, end_ref, body, rev, created_at, updated_at) VALUES ('u', '29e', '29e', 'mine', 1, 't', 't')")
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, body, saved_at) VALUES ('translation', 1, 1, 'create', 'mine', 't')")
            db.commit()
            db.close()
            mywork.ensure(path)
            db = sqlite3.connect(path)
            self.assertEqual(db.execute("SELECT value FROM meta WHERE key = 'schema_version'").fetchone()[0], str(mywork.SCHEMA_VERSION))
            self.assertEqual(db.execute("SELECT count(*) FROM revision").fetchone()[0], 1)  # nothing re-numbered or added
            self.assertEqual(db.execute("SELECT count(*) FROM word_study").fetchone()[0], 0)
            self.assertEqual(db.execute("SELECT count(*) FROM proofreading").fetchone()[0], 0)   # milestone 7
            db.close()
            self.assertEqual(len(list((Path(tmp) / "backups").glob(f"user-*-before-schema-{mywork.SCHEMA_VERSION}.sqlite"))), 1)


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Corpus(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        cls.user_path = Path(cls.tmp.name) / "user.sqlite"
        stats = build_db.build(WORKS, db_path=cls.db_path)
        cls.stats = {s["work"]: s for s in stats[:-1]}
        build_db.ensure_user_db(cls.user_path)
        cls.db = sqlite3.connect(cls.db_path)
        cls.db.row_factory = sqlite3.Row
        cls.search = search.Search(cls.db)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.tmp.cleanup()

    def q(self, sql, *args):
        return [tuple(r) for r in self.db.execute(sql, args).fetchall()]

    # ------------------------------------------------------------ the import

    def test_every_work_is_whole(self):
        for w in WORKS:
            s = self.stats[w]
            self.assertEqual(s["english_sections_missing"], [], w)
            self.assertGreater(s["tagged"] / s["tokens"], 0.98, w)
            n = self.q("SELECT count(*) FROM chunk WHERE work_id = ? AND edition_id LIKE '%grc%'", w)[0][0]
            self.assertGreater(n, 0)
        self.assertEqual(self.q("SELECT count(*) FROM work WHERE imported = 1")[0][0], len(WORKS))
        self.assertEqual(self.q("SELECT count(*) FROM work")[0][0], 36)

    def test_token_ids_run_work_by_work(self):
        rows = self.q("SELECT id, first_token, last_token, n_tokens FROM work WHERE imported = 1 ORDER BY id")
        for (w, lo, hi, n), (_, nxt, _, _) in zip(rows, rows[1:] + [(None, None, None, None)]):
            self.assertEqual(hi - lo + 1, n, w)
            self.assertEqual(n, self.stats[w]["tokens"])
            if nxt:
                self.assertEqual(nxt, hi + 1)

    def test_books_and_letters(self):
        self.assertEqual(self.q("SELECT label, start_ref, end_ref FROM division WHERE work_id = 'tlg030' AND kind = 'book' ORDER BY id")[:2],
                         [("Book 1", "327a", "354c"), ("Book 2", "357a", "383c")])
        letters = self.q("SELECT label, start_ref FROM division WHERE work_id = 'tlg036' AND kind = 'letter' ORDER BY id")
        self.assertEqual(len(letters), 13)
        self.assertEqual(letters[6], ("Letter 7", "323d"))

    def test_speakers_have_english_names(self):
        self.assertEqual(self.stats["tlg001"]["speaker_names"], {"Σωκράτης": "Socrates", "Εὐθύφρων": "Euthyphro"})
        self.assertEqual({r[0] for r in self.q("SELECT DISTINCT label FROM division WHERE work_id = 'tlg001' AND kind = 'speech'")},
                         {"Socrates", "Euthyphro"})

    def test_republic_links(self):
        # Shorey's bare 'cf. 509 B' is the Republic, not the Timaeus.
        bad = self.q("SELECT count(*) FROM link WHERE from_work = 'tlg030' AND to_work = 'tlg031' AND raw NOT LIKE 'Tim%'")[0][0]
        self.assertEqual(bad, 0)
        self.assertGreater(self.q("SELECT count(*) FROM link WHERE from_work = 'tlg030' AND to_work = 'tlg030'")[0][0], 1000)

    def test_abbreviations_are_lsjs(self):
        lsj = {r[0] for r in self.q("SELECT abbr FROM abbreviation WHERE list = 'I work' AND author_abbr = 'Pl.'")}
        self.assertEqual({a for a in build_db.WORK_ABBR.values() if a not in lsj}, set())

    def test_lsj_cites_other_dialogues(self):
        n = self.q("SELECT count(*) FROM lex_entry WHERE html LIKE '%class=\"bibl plato\" data-work=\"tlg030\" data-ref=\"___%'")[0][0]
        self.assertGreater(n, 100)

    # ------------------------------------------------------------ counts

    def test_counts_match_the_text(self):
        for lemma in ("λόγος", "ψυχή", "καί"):
            direct = self.q("SELECT e.work_id, count(DISTINCT g.token_id) FROM tag g JOIN token t ON t.id = g.token_id "
                            "JOIN edition e ON e.id = t.edition_id WHERE g.lemma = ? GROUP BY e.work_id ORDER BY e.work_id", lemma)
            self.assertEqual(self.q("SELECT work_id, n FROM lemma_count WHERE lemma = ? ORDER BY work_id", lemma), direct)
        total = self.q("SELECT sum(n) FROM form_count")[0][0]
        self.assertEqual(total, sum(self.stats[w]["tokens"] for w in WORKS))

    # ------------------------------------------------------------ search

    def test_lemma_search(self):
        r = self.search.search("λόγος")
        self.assertEqual(r["chosen"], ["λόγος"])
        self.assertEqual(r["total"], self.q("SELECT sum(n) FROM lemma_count WHERE lemma = 'λόγος'")[0][0])
        self.assertEqual([c["work_id"] for c in r["counts"]], WORKS)
        h = r["hits"][0]
        self.assertEqual(h["lemma"], "λόγος")
        self.assertEqual(greek.strip_accents(h["form"])[:3], "λογ")
        self.assertTrue(h["before"] or h["after"])
        self.assertEqual(self.search.search("lo/gos")["total"], r["total"])  # Beta Code

    def test_paging_is_complete_and_in_order(self):
        r = self.search.search("ψυχή", works=["tlg031"], limit=50)
        seen = [h["token_id"] for h in r["hits"]]
        while r["next_after"]:
            r = self.search.search("ψυχή", works=["tlg031"], limit=50, after=r["next_after"])
            seen += [h["token_id"] for h in r["hits"]]
        self.assertEqual(len(seen), r["total_in_filter"])
        self.assertEqual(seen, sorted(set(seen)))
        self.assertTrue(all(self.q("SELECT 1 FROM token WHERE id = ? AND id BETWEEN (SELECT first_token FROM work WHERE id = 'tlg031') "
                                   "AND (SELECT last_token FROM work WHERE id = 'tlg031')", t) for t in seen[:5]))

    def test_form_plain_and_wildcard(self):
        exact = self.search.search("ψυχήν", "form")
        self.assertEqual(exact["chosen"], ["ψυχήν"])
        self.assertTrue(all(h["form"] == "ψυχήν" for h in exact["hits"]))
        plain = self.search.search("ψυχην", "plain")
        self.assertGreaterEqual(plain["total"], exact["total"])
        self.assertTrue(all(search.plain(t) == "ψυχην" for t in plain["chosen"]))
        wild = self.search.search("ψυχ*", "lemma")
        self.assertIn("ψυχή", wild["chosen"])
        self.assertTrue(all(search.plain(t).startswith("ψυχ") for t in wild["chosen"]))
        narrowed = self.search.search("ψυχ*", "lemma", terms=["ψυχή"])
        self.assertEqual(narrowed["chosen"], ["ψυχή"])

    def test_accentless_lemma_falls_back_to_the_letters(self):
        r = self.search.search("ιδεα")
        self.assertEqual(r["chosen"], ["ἰδέα"])
        self.assertIn("no lemma is spelt exactly", r["how"])

    def test_elsewhere(self):
        e = self.search.elsewhere("λόγος")
        self.assertEqual(e["works"], 4)
        self.assertEqual(e["counts"][0]["work_id"], "tlg030")  # the Republic has the most

    # ------------------------------------------------------------ the server

    def test_api(self):
        lib = serve.Library(self.db_path, self.user_path)
        srv = serve.make_server(port=0, library=lib)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{srv.server_address[1]}"

        def call(method, path, data=None):
            req = urllib.request.Request(base + path, method=method, data=json.dumps(data).encode() if data is not None else None,
                                         headers={"Content-Type": "application/json"} if data is not None else {})
            with urllib.request.urlopen(req) as r:
                body = r.read()
                return json.loads(body) if r.headers.get("Content-Type", "").startswith("application/json") else body.decode()
        get = lambda p: call("GET", p)
        try:
            works = get("/api/works")
            self.assertEqual(len(works), 36)
            rep = next(w for w in works if w["id"] == "tlg030")
            self.assertEqual((rep["slug"], rep["abbr"], rep["first_ref"], rep["tetralogy"]), ("republic", "R.", "327a", 8))
            w = get("/api/work/tlg030")
            self.assertEqual(len(w["books"]), 10)
            self.assertEqual(w["counts"]["tokens"], self.stats["tlg030"]["tokens"])
            self.assertEqual(w["counts"]["tagged"], self.stats["tlg030"]["tagged"])
            p = get("/api/page/tlg030/514")
            self.assertEqual(p["sections"][0]["ref"], "514a")
            tok = next(t for t in p["tokens"] if t["form"] == "σπηλαιώδει")
            t = get(f"/api/token/{tok['id']}")
            self.assertEqual(t["work_id"], "tlg030")
            self.assertTrue(t["elsewhere"] and t["elsewhere"][0]["total"] >= 1)
            self.assertGreaterEqual(t["form_in_plato"], 1)
            s = get("/api/search?" + urllib.parse.urlencode({"q": "ψυχή", "by": "lemma", "works": "tlg031,tlg001"}))
            self.assertEqual(s["works_filter"], ["tlg031", "tlg001"])
            self.assertTrue({h["work_id"] for h in s["hits"]} <= {"tlg031", "tlg001"})
            with self.assertRaises(urllib.error.HTTPError) as bad:
                get("/api/search?q=" + urllib.parse.quote("two words"))
            self.assertEqual(bad.exception.code, 400)
            sug = get("/api/suggest?q=" + urllib.parse.quote("ψυχ"))
            self.assertEqual(sug["lemmas"][0]["term"], "ψυχή")
            # Word studies: create, edit, history, delete, restore, export.
            st = call("POST", "/api/studies", {"title": "Soul", "query": "ψυχή", "by": "lemma", "works": ["tlg031"], "body": "first"})
            self.assertEqual((st["rev"], st["works"], st["terms"]), (1, ["tlg031"], None))
            st2 = call("PUT", f"/api/mine/study/{st['id']}", {"title": "Soul in the Timaeus", "body": "second", "base_rev": 1})
            self.assertEqual((st2["rev"], st2["title"], st2["query"]), (2, "Soul in the Timaeus", "ψυχή"))
            with self.assertRaises(urllib.error.HTTPError) as conflict:
                call("PUT", f"/api/mine/study/{st['id']}", {"title": "x", "body": "y", "base_rev": 1})
            self.assertEqual(conflict.exception.code, 409)
            hist = get(f"/api/mine/study/{st['id']}/history")["revisions"]
            self.assertEqual([(r["rev"], r["label"], r["body"]) for r in hist], [(1, "Soul", "first"), (2, "Soul in the Timaeus", "second")])
            call("POST", f"/api/mine/study/{st['id']}/delete", {"base_rev": 2})
            self.assertEqual(get("/api/studies"), [])
            self.assertEqual(len(get("/api/studies?deleted=1")), 1)
            back = call("POST", f"/api/mine/study/{st['id']}/restore", {"base_rev": 3, "rev": 1})
            self.assertEqual((back["deleted_at"], back["title"], back["body"], back["rev"]), (None, "Soul", "first", 4))
            ex = get("/api/export/my-plato.json")
            self.assertEqual(ex["word_studies"][0]["title"], "Soul")
            self.assertEqual(len(ex["word_studies"][0]["revisions"]), 4)
            self.assertIn("## Word studies", get("/api/export/my-plato.md"))
            with self.assertRaises(urllib.error.HTTPError):
                call("POST", "/api/studies", {"title": "", "query": "ψυχή"})
            with self.assertRaises(urllib.error.HTTPError):
                call("POST", "/api/studies", {"title": "x", "query": "ψυχή", "works": ["tlg999"]})
        finally:
            srv.shutdown()
            srv.server_close()
            lib.db.close()


if __name__ == "__main__":
    unittest.main()
