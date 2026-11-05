"""Tests for the passage dossiers: Plato's famous passages gathered whole.

    python3 -m unittest discover -s tests -v

The file tests read what is committed (sources/dossiers/). The library tests
build all 36 works into a temporary folder (a few minutes) and are skipped if
tools/fetch_sources.py has not been run.
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
import dossiers  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()
# The example Daniel gave, and the famous passages that must be there.
EXPECTED = ["divided-line", "cave", "sun", "er", "charioteer", "ladder-of-love", "meno-geometry", "world-soul", "angler",
            "apology-unexamined", "seventh-letter", "euthyphro-dilemma", "third-man", "death-of-socrates"]


def quotations(x):
    """Every (where, dict with ref and quote) a dossier offers from Plato or another text."""
    p = x["passage"]
    yield "start", {"work": p["work"], "ref": p["start"], "quote": p["start_quote"]}
    yield "end", {"work": p["work"], "ref": p["end"], "quote": p["end_quote"]}
    for q in x.get("parts", []):
        yield "part", dict(q, work=p["work"])
    for q in x.get("echoes", []):
        yield "echo", q
    for r in x.get("related", []):
        for e in r["evidence"]:
            yield "related", e


class Files(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = dossiers.load()
        cls.ids = [x["id"] for x in cls.d["dossiers"]]
        cls.checks = json.loads(dossiers.CHECKS.read_text(encoding="utf-8"))["pages"]

    def test_many_dossiers_not_only_the_example(self):
        self.assertGreater(len(self.ids), 60)
        for i in EXPECTED:
            self.assertIn(i, self.ids)
        self.assertGreater(len({x["passage"]["work"] for x in self.d["dossiers"]}), 15)

    def test_every_record_is_complete(self):
        self.assertEqual(len(self.ids), len(set(self.ids)))
        groups = set(self.d["groups"])
        for x in self.d["dossiers"]:
            for k in ("id", "label", "greek", "kind", "group", "about", "passage"):
                self.assertTrue(x.get(k), (x["id"], k))
            self.assertIn(x["kind"], dossiers.KINDS, x["id"])
            self.assertIn(x["group"], groups, x["id"])
            self.assertTrue(x["parts"], x["id"])
            for r in x.get("related", []):
                self.assertIn(r["dossier"], self.ids, x["id"])
                self.assertTrue(r["evidence"], (x["id"], r["dossier"]))
            if x.get("diagram"):
                self.assertIn(x["diagram"]["kind"], dossiers.DIAGRAMS, x["id"])

    def test_every_quotation_says_where_it_is(self):
        for x in self.d["dossiers"]:
            for where, q in quotations(x):
                self.assertTrue(q.get("ref") or q.get("source") not in (None, "plato"), (x["id"], where))
                self.assertTrue(q.get("quote", "").strip(), (x["id"], where))

    def test_every_web_link_was_checked_and_quotes_its_page(self):
        n = 0
        for x in self.d["dossiers"]:
            for w in x.get("web", []):
                self.assertTrue(w["url"].startswith("https://"), w["url"])
                page = self.checks.get(w["url"])
                self.assertIsNotNone(page, w["url"])
                self.assertEqual(page["status"], 200, w["url"])
                self.assertIs(page["quotes"].get(w["quote"]), True, (x["id"], w["url"], w["quote"]))
                n += 1
        self.assertGreater(n, 70)

    def test_keywords_are_phrases_not_common_words(self):
        common = {"the line", "line", "division", "eternity", "horse", "river", "mirror", "wax", "oracle", "birds", "holy"}
        for x in self.d["dossiers"]:
            for w in x.get("keywords", {}).get("en", []):
                self.assertNotIn(w.lower(), common, x["id"])


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(build_db.ALL_WORKS, db_path=cls.db_path)
        cls.db = sqlite3.connect(cls.db_path)
        cls.lib = serve.Library(cls.db_path, Path(cls.tmp.name) / "user.sqlite")
        cls.srv = serve.make_server(port=0, library=cls.lib)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()
        cls.lib.db.close()
        cls.db.close()
        cls.tmp.cleanup()

    def get(self, path, raw=False):
        with urllib.request.urlopen(self.base + path) as r:
            b = r.read()
            return b.decode() if raw else json.loads(b)

    def q(self, sql, *a):
        return self.db.execute(sql, a).fetchall()

    def test_every_quotation_found(self):
        stats = json.loads(self.q("SELECT value FROM build WHERE key = 'dossier_stats'")[0][0])
        self.assertEqual(stats["not found"], [])
        self.assertEqual(stats["web not found"], [])
        self.assertEqual(stats["quotations"], stats["quotations found"])
        self.assertEqual(stats["renderings"], stats["renderings found"])
        self.assertGreater(stats["quotations"], 700)
        self.assertEqual(self.q("SELECT count(*) FROM evidence WHERE owner LIKE 'dossier:%' AND found IS NOT 1")[0][0], 0)

    def test_named_notes_use_the_word(self):
        rows = self.q("SELECT dn.word, n.body FROM dossier_named dn JOIN note n ON n.id = dn.note_id")
        self.assertGreater(len(rows), 300)
        for word, body in rows[:2000]:
            self.assertTrue(word.lower() in body.lower() or dossiers.concepts.grc(word) in dossiers.concepts.grc(body), word)

    def test_vocabulary_is_rare_here(self):
        rows = self.q("SELECT lemma, here, plato FROM dossier_vocab WHERE dossier_id = 'divided-line'")
        self.assertTrue(rows)
        for lemma, here, plato in rows:
            self.assertLessEqual(here, plato, lemma)

    def test_api(self):
        idx = self.get("/api/dossiers")
        self.assertEqual(len(idx["dossiers"]), len(dossiers.load()["dossiers"]))
        line = self.get("/api/dossier/divided-line")
        self.assertEqual((line["work_id"], line["start_ref"], line["end_ref"]), ("tlg030", "509d", "511e"))
        self.assertEqual(line["diagram"]["kind"], "line")
        self.assertGreaterEqual(len(line["editions"]), 2)
        self.assertTrue(line["notes"])
        self.assertTrue(line["cited_by"])
        self.assertTrue(any(r["dossier"] == "cave" for r in line["related"]))
        self.assertTrue(line["related_from"])
        md = self.get("/api/dossier/divided-line/md", raw=True)
        self.assertIn("# The divided line", md)
        with self.assertRaises(urllib.error.HTTPError):
            self.get("/api/dossier/no-such-thing")
        w = self.get("/api/work/tlg031")
        self.assertTrue(any(d["id"] == "world-soul" for d in w["dossiers"]))


if __name__ == "__main__":
    unittest.main()
