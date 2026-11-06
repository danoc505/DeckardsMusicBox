"""Tests for milestone 14: listening to the dialogues.

    python3 -m unittest discover -s tests -v

The file tests read what is committed. The server tests need data/workshop.sqlite
(python3 tools/build_db.py). The browser test also needs Node and Playwright
(tests/listen_browser.js); each is skipped without what it needs.
"""
import json
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import serve  # noqa: E402

PEOPLE = json.loads((ROOT / "sources" / "structure" / "people.json").read_text(encoding="utf-8"))


class Files(unittest.TestCase):
    def test_reader_loads_listen(self):
        page = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        self.assertLess(page.index('src="listen.js"'), page.index('src="shell.js"'))
        for id_ in ("listen-btn", "listen-bar", "listen-pause", "listen-rate", "voices-dialog"):
            self.assertIn(f'id="{id_}"', page)
        js = (ROOT / "reader" / "listen.js").read_text(encoding="utf-8")
        for f in ("startListening", "togglePause", "skip", "castWork", "personOf", "speakerFromLabel", "nextPage"):
            self.assertIn(f"function {f}", js)
        self.assertIn("speechSynthesis", js)

    def test_every_person_rule_has_its_quotation(self):
        for r in PEOPLE["persons"]:
            self.assertTrue(r["person"] and r["names"] and r["works"] and r["why"], r)
            self.assertTrue(r["evidence"], r["person"])
            for e in r["evidence"]:
                self.assertIn(e["work"], r["works"])

    def test_a_name_is_one_person_in_each_work(self):
        seen = {}
        for r in PEOPLE["persons"]:
            for w in r["works"]:
                for n in r["names"]:
                    self.assertNotIn((w, n), seen, f"{n} in {w} is both {seen.get((w, n))} and {r['person']}")
                    seen[(w, n)] = r["person"]


@unittest.skipUnless(build_db.DB_PATH.exists(), "run python3 tools/build_db.py first")
class Data(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = sqlite3.connect(build_db.DB_PATH)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def loeb(self, work, ref):
        return " ".join(t for (t,) in self.db.execute(
            "SELECT c.text FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE e.source_id = 'perseus-english-plato' "
            "AND c.work_id = ? AND c.section_ref = ? ORDER BY c.seq", (work, ref)))

    def speakers(self, work):
        return {s for (s,) in self.db.execute(
            "SELECT DISTINCT c.speaker FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE e.source_id = 'perseus-english-plato' "
            "AND c.work_id = ? AND c.speaker IS NOT NULL", (work,))}

    def test_quotations_are_in_the_loeb_english(self):
        for r in PEOPLE["persons"]:
            for e in r["evidence"]:
                self.assertIn(e["quote"], self.loeb(e["work"], e["ref"]), (r["person"], e))

    def test_rules_name_speakers_the_markup_has(self):
        for r in PEOPLE["persons"]:
            for w in r["works"]:
                self.assertTrue(set(r["names"]) & self.speakers(w), (r["person"], w))
        for n in PEOPLE["anonymous"]:
            self.assertGreaterEqual(sum(n in self.speakers(w) for (w,) in self.db.execute("SELECT id FROM work WHERE imported = 1")), 2, n)

    def test_socrates_is_one_name_everywhere(self):
        works = [w for (w,) in self.db.execute("SELECT id FROM work WHERE imported = 1") if "Socrates" in self.speakers(w)]
        self.assertGreaterEqual(len(works), 25)
        self.assertFalse(any("Socrates" in r["names"] for r in PEOPLE["persons"]))


@unittest.skipUnless(build_db.DB_PATH.exists(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        lib = serve.Library(build_db.DB_PATH, Path(cls.tmp.name) / "user.sqlite")
        cls.httpd = serve.make_server(0, library=lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def test_people(self):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/people") as r:
            self.assertEqual(json.loads(r.read())["persons"], PEOPLE["persons"])

    def test_english_paragraphs_carry_their_id(self):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/reader.js") as r:
            js = r.read().decode("utf-8")
        self.assertEqual(js.count('data-c="${c.id}"'), 2)

    @unittest.skipUnless(shutil.which("node"), "Node is not installed")
    def test_in_a_browser(self):
        try:
            subprocess.run(["node", "-e", "require('playwright')"], check=True, capture_output=True, timeout=60)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            self.skipTest("Playwright is not installed for Node")
        r = subprocess.run(["node", str(ROOT / "tests" / "listen_browser.js"), str(self.port)],
                           capture_output=True, text=True, timeout=600)
        print(r.stdout)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
