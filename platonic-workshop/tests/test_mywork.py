"""Tests for milestone 4: your translations and notes (tools/mywork.py) and
the reader's write API.

    python3 -m unittest discover -s tests -v

The migration and helper tests always run. The rest build the Timaeus into a
temporary folder and are skipped if tools/fetch_sources.py has not been run.
"""
import json
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import mywork  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()

V1_SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE translation (id INTEGER PRIMARY KEY, work_urn TEXT NOT NULL, start_ref TEXT NOT NULL, end_ref TEXT NOT NULL,
    body TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE user_note (id INTEGER PRIMARY KEY, work_urn TEXT NOT NULL, start_ref TEXT NOT NULL, end_ref TEXT NOT NULL,
    word_start INTEGER, word_end INTEGER, words TEXT, kind TEXT NOT NULL DEFAULT 'note', body TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE revision (id INTEGER PRIMARY KEY, table_name TEXT NOT NULL, row_id INTEGER NOT NULL, body TEXT NOT NULL, saved_at TEXT NOT NULL);
INSERT INTO meta VALUES ('schema_version', '1');
INSERT INTO translation VALUES (1, 'urn:cts:greekLit:tlg0059.tlg031', '29e', '29e', 'second version', '2026-01-01', '2026-01-02');
INSERT INTO revision VALUES (1, 'translation', 1, 'first version', '2026-01-01');
INSERT INTO user_note VALUES (1, 'urn:cts:greekLit:tlg0059.tlg031', '29e', '29e', 1, 2, 'Λέγωμεν δὴ', 'footnote', 'a note', '2026-01-01', '2026-01-01');
"""


class Migration(unittest.TestCase):
    def test_version_1_is_upgraded_without_losing_anything(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "user.sqlite"
            db = sqlite3.connect(path)
            db.executescript(V1_SCHEMA)
            db.close()
            mywork.ensure(path)
            mywork.ensure(path)  # a second run changes nothing
            db = sqlite3.connect(path)
            self.assertEqual(db.execute("SELECT value FROM meta WHERE key = 'schema_version'").fetchone()[0], "4")
            self.assertEqual(db.execute("SELECT body, rev, format, deleted_at, word_start FROM translation").fetchall(),
                             [("second version", 2, "markdown", None, None)])
            self.assertEqual(db.execute("SELECT rev, event, body FROM revision WHERE table_name = 'translation' ORDER BY rev").fetchall(),
                             [(1, "create", "first version"), (2, "edit", "second version")])
            self.assertEqual(db.execute("SELECT body, kind, rev FROM user_note").fetchall(), [("a note", "footnote", 1)])
            db.close()
            backups = list((Path(tmp) / "backups").glob("user-*-before-schema-4.sqlite"))
            self.assertEqual(len(backups), 1)
            old = sqlite3.connect(backups[0])
            self.assertEqual(old.execute("SELECT body FROM translation").fetchall(), [("second version",)])
            old.close()

    def test_fresh_file_needs_no_backup(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "user.sqlite"
            mywork.ensure(path)
            self.assertFalse((Path(tmp) / "backups").exists())

    def test_helpers(self):
        r = {"start_ref": "29e", "end_ref": "30a", "word_start": 3, "word_end": 4}
        self.assertEqual(mywork.span_label(r), "29e 3 – 30a 4")
        self.assertEqual(mywork.span_label({**r, "end_ref": "29e"}), "29e 3–4")
        self.assertEqual(mywork.span_label({**r, "word_start": None, "word_end": None}), "29e–30a")
        self.assertEqual(mywork.prefix_footnotes("x[^1] y\n\n[^1]: n", "t3-"), "x[^t3-1] y\n\n[^t3-1]: n")


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Work(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(["tlg031"], db_path=cls.db_path)
        cls.lib = sqlite3.connect(f"file:{cls.db_path}?mode=ro", uri=True, check_same_thread=False)

    @classmethod
    def tearDownClass(cls):
        cls.lib.close()
        cls.tmp.cleanup()

    def setUp(self):
        self.user_path = Path(self.tmp.name) / f"user-{self.id().rsplit('.', 1)[-1]}.sqlite"
        self.mw = mywork.MyWork(self.user_path, self.lib)

    def new(self, **kw):
        data = {"table": "translation", "work": "tlg031", "start_ref": "29e", "word_start": 1, "end_ref": "29e", "word_end": 4,
                "body": "Let us say, then,"}
        data.update(kw)
        return self.mw.create(data)

    def test_span_of_words_keeps_the_greek(self):
        t = self.new()
        self.assertEqual(t["words"], "τόδε ὁ συνιστὰς συνέστησεν")
        self.assertEqual((t["rev"], t["format"], t["kind"]), (1, "markdown", "translation"))
        across = self.new(start_ref="29e", word_start=20, end_ref="30a", word_end=3)
        self.assertTrue(across["words"].split()[-1])
        whole = self.new(word_start=None, word_end=None, end_ref="29e")
        self.assertEqual(len(whole["words"].split()), self.lib.execute(
            "SELECT count(*) FROM token t JOIN edition e ON e.id = t.edition_id WHERE e.lang = 'grc' AND t.section_ref = '29e'").fetchone()[0])

    def test_bad_anchors_are_refused(self):
        for bad in ({"start_ref": "93a"}, {"word_start": 4, "word_end": 1}, {"word_end": None},
                    {"start_ref": "30a", "end_ref": "29e"}, {"word_end": 9999}, {"body": "  "}, {"work": "tlg999"},
                    {"table": "nope"}, {"table": "note", "kind": "rant"}, {"format": "html"}):
            with self.assertRaises(mywork.Invalid, msg=bad):
                self.new(**bad)

    def test_edits_keep_every_version(self):
        t = self.new()
        t2 = self.mw.update("translation", t["id"], {"body": "Let us state, then,", "base_rev": 1})
        t3 = self.mw.update("translation", t["id"], {"body": "Let us state, then,", "label": "literal", "base_rev": 2})
        self.assertEqual((t2["rev"], t3["rev"], t3["label"]), (2, 3, "literal"))
        same = self.mw.update("translation", t["id"], {"body": "Let us state, then,", "label": "literal", "base_rev": 3})
        self.assertEqual(same["rev"], 3)  # nothing changed, nothing recorded
        hist = self.mw.history("translation", t["id"])
        self.assertEqual([(h["rev"], h["event"], h["body"]) for h in hist],
                         [(1, "create", "Let us say, then,"), (2, "edit", "Let us state, then,"), (3, "edit", "Let us state, then,")])

    def test_stale_edit_is_refused_and_nothing_is_lost(self):
        t = self.new()
        self.mw.update("translation", t["id"], {"body": "from tab one", "base_rev": 1})
        with self.assertRaises(mywork.Conflict) as c:
            self.mw.update("translation", t["id"], {"body": "from tab two", "base_rev": 1})
        self.assertEqual(c.exception.current["body"], "from tab one")
        self.assertEqual([h["body"] for h in self.mw.history("translation", t["id"])], ["Let us say, then,", "from tab one"])
        with self.assertRaises(mywork.Invalid):
            self.mw.update("translation", t["id"], {"body": "no base"})

    def test_delete_and_restore(self):
        n = self.new(table="note", kind="footnote", body="On *δι᾽ ἥντινα*: see [^1].\n\n[^1]: Proclus, *In Tim.* I 359.")
        self.assertEqual([r["id"] for r in self.mw.rows_for_sections("tlg031", ["29e"])], [n["id"]])
        d = self.mw.delete("note", n["id"], {"base_rev": 1})
        self.assertTrue(d["deleted_at"])
        self.assertEqual(self.mw.rows_for_sections("tlg031", ["29e"]), [])
        with self.assertRaises(mywork.Invalid):
            self.mw.update("note", n["id"], {"body": "x", "base_rev": 2})
        r = self.mw.restore("note", n["id"], {"base_rev": 2})
        self.assertIsNone(r["deleted_at"])
        self.assertEqual(r["body"], n["body"])
        self.mw.update("note", n["id"], {"body": "changed", "kind": "note", "base_rev": 3})
        back = self.mw.restore("note", n["id"], {"base_rev": 4, "rev": 1})
        self.assertEqual((back["rev"], back["body"], back["kind"]), (5, n["body"], "footnote"))
        self.assertEqual([h["event"] for h in self.mw.history("note", n["id"])], ["create", "delete", "restore", "edit", "restore"])

    def test_rows_overlapping_a_page(self):
        a = self.new(start_ref="28c", word_start=1, end_ref="29a", word_end=2)  # starts on page 28
        self.new(start_ref="31a", word_start=1, end_ref="31a", word_end=2)
        rows = self.mw.rows_for_sections("tlg031", ["29a", "29b", "29c", "29d", "29e"])
        self.assertEqual([r["id"] for r in rows], [a["id"]])
        self.assertTrue(rows[0]["anchor_ok"])

    def test_changed_text_is_flagged_not_rewritten(self):
        t = self.new()
        db = sqlite3.connect(self.user_path)
        db.execute("UPDATE translation SET words = 'something else' WHERE id = ?", (t["id"],))
        db.commit()
        db.close()
        row = self.mw.rows_for_sections("tlg031", ["29e"])[0]
        self.assertFalse(row["anchor_ok"])
        self.assertEqual(row["words"], "something else")

    def test_exports(self):
        self.new(body="Let us say[^a].\n\n[^a]: why he made it.", label="literal")
        self.new(table="note", kind="footnote", body="A *footnote*.", word_start=2, word_end=2)
        gone = self.new(body="deleted one")
        self.mw.delete("translation", gone["id"], {"base_rev": 1})
        md = self.mw.export_markdown()
        self.assertIn("## Timaeus", md)
        self.assertIn("### 29e 1–4", md)
        self.assertIn("> τόδε ὁ συνιστὰς συνέστησεν", md)
        self.assertIn("[^t1-a]", md)
        self.assertIn("**Translation** · literal", md)
        self.assertIn("**Footnote**", md)
        self.assertNotIn("deleted one", md)
        js = self.mw.export_json()
        items = js["works"][0]["items"]
        self.assertEqual(len(items), 3)
        self.assertTrue(all(i["revisions"] for i in items))
        out = Path(self.tmp.name) / "copy.sqlite"
        self.mw.export_sqlite(out)
        self.assertEqual(sqlite3.connect(out).execute("SELECT count(*) FROM translation").fetchone()[0], 2)

    def test_rebuild_leaves_your_work_alone(self):
        t = self.new()
        build_db.ensure_user_db(self.user_path)
        self.assertEqual(self.mw.get("translation", t["id"])["body"], t["body"])


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Api(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(["tlg031"], db_path=db_path)
        cls.lib = serve.Library(db_path, Path(cls.tmp.name) / "user.sqlite")
        cls.srv = serve.make_server(port=0, library=cls.lib)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()
        cls.lib.db.close()
        cls.tmp.cleanup()

    def call(self, method, path, data=None, headers=None):
        h = {"Content-Type": "application/json"}
        h.update(headers or {})
        req = urllib.request.Request(self.base + path, method=method, headers=h,
                                     data=None if data is None else json.dumps(data).encode())
        try:
            with urllib.request.urlopen(req) as r:
                body = r.read()
                return r.status, (json.loads(body) if r.headers.get_content_type() == "application/json" else body.decode())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read())

    def test_write_read_export(self):
        s, t = self.call("POST", "/api/mine", {"table": "translation", "work": "tlg031", "start_ref": "29e", "word_start": 1,
                                                "end_ref": "29e", "word_end": 2, "body": "Let us *say*"})
        self.assertEqual(s, 201)
        s, p = self.call("GET", "/api/page/tlg031/29")
        self.assertEqual([m["id"] for m in p["mine"]], [t["id"]])
        s, t2 = self.call("PUT", f"/api/mine/translation/{t['id']}", {"body": "Let us state", "base_rev": 1})
        self.assertEqual((s, t2["rev"]), (200, 2))
        s, err = self.call("PUT", f"/api/mine/translation/{t['id']}", {"body": "stale", "base_rev": 1})
        self.assertEqual(s, 409)
        self.assertEqual(err["current"]["body"], "Let us state")
        s, h = self.call("GET", f"/api/mine/translation/{t['id']}/history")
        self.assertEqual([r["body"] for r in h["revisions"]], ["Let us *say*", "Let us state"])
        s, md = self.call("GET", "/api/export/my-plato.md")
        self.assertIn("Let us state", md)
        s, cfg = self.call("GET", "/api/mine/config")
        self.assertEqual((cfg["span_units"], cfg["default_format"]), ("words", "markdown"))
        s, err = self.call("POST", "/api/mine", {"table": "translation", "work": "tlg031", "start_ref": "99z", "body": "x"})
        self.assertEqual(s, 400)

    def test_writes_from_other_sites_are_refused(self):
        data = {"table": "translation", "work": "tlg031", "start_ref": "29e", "body": "x"}
        self.assertEqual(self.call("POST", "/api/mine", data, {"Origin": "https://example.com"})[0], 403)
        self.assertEqual(self.call("POST", "/api/mine", data, {"Content-Type": "text/plain"})[0], 403)
        self.assertEqual(self.call("POST", "/api/mine", data, {"Host": "evil.example:80"})[0], 403)


if __name__ == "__main__":
    unittest.main()
