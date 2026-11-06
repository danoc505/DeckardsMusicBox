"""Tests for milestone 24: the Workshop's modern English of Taylor's General
Introduction and of Olympiodorus' Life of Plato (tools/modern.py), and your
marks on its sentences (tools/mywork.py, POST /api/modern-marks).

    python3 -m unittest tests.test_modern -v

The file tests and the marks in a temporary database always run. The server
test needs data/workshop.sqlite (python3 tools/build_db.py); the browser test
also needs Node and Playwright. Each is skipped without what it needs.
"""
import json
import shutil
import sqlite3
import subprocess
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
import modern  # noqa: E402
import mywork  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
TEXTS = ("general-introduction", "olympiodorus-life")


def load(text_id):
    return json.loads((MOD / f"{text_id}.json").read_text(encoding="utf-8"))


class Files(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.results = modern.build_all(write=False)

    def test_no_problems_and_the_json_is_up_to_date(self):
        for tid, (d, problems) in self.results.items():
            self.assertEqual(problems, [], tid)
            self.assertEqual(load(tid), json.loads(json.dumps(d, ensure_ascii=False)),
                             f"{tid}.json is out of date: run python3 tools/modern.py")

    def test_every_paragraph_of_taylor_has_a_modern_version_in_order(self):
        for tid in TEXTS:
            taylor = [s["id"] for s in modern.taylor_text(tid)["segments"] if s["part"] == "text"]
            d = load(tid)
            mine = [p["seg"] for p in d["paragraphs"] if not p.get("extra")]
            self.assertEqual(mine, taylor, tid)
            for p in d["paragraphs"]:
                self.assertTrue(p["modern"].strip(), p["seg"])

    def test_labelled_as_the_workshops_own_and_machine_assisted(self):
        for tid in TEXTS:
            d = load(tid)
            self.assertEqual(d["by"], "Workshop modern version")
            self.assertIs(d["machine_assisted"], True)
            self.assertIn("machine-assisted", d["label"])
            self.assertIn("not yet checked", d["label"])
        self.assertEqual(load("olympiodorus-life")["made_from"], "greek")
        self.assertEqual(load("general-introduction")["made_from"], "taylor")

    def test_every_section_has_a_summary_and_starts_at_a_paragraph(self):
        for tid in TEXTS:
            d = load(tid)
            ps = [p["p"] for p in d["paragraphs"]]
            self.assertGreater(len(d["sections"]), 2)
            self.assertEqual(d["sections"][0]["first"], ps[0])
            for s in d["sections"]:
                self.assertIn(s["first"], ps)
                self.assertGreater(len(s["summary"].split()), 15, s["id"])
                self.assertLess(len(s["summary"].split()), 100, s["id"])

    def test_flags_quote_taylor_word_for_word(self):
        n = 0
        for tid in TEXTS:
            taylor = {s["id"]: s["text"] for s in modern.taylor_text(tid)["segments"]}
            for p in load(tid)["paragraphs"]:
                for f in p.get("flags", []):
                    n += 1
                    self.assertTrue(f["why"].strip())
                    if not p.get("extra"):
                        self.assertIn(f["taylor"], taylor[p["seg"]])
        self.assertGreater(n, 40)

    def test_the_life_is_made_from_hermanns_greek(self):
        d = load("olympiodorus-life")
        life = modern.hermann_life()
        pos = 0
        for p in d["paragraphs"]:
            self.assertTrue(p.get("greek"), p["seg"])
            i = life.find(p["greek"], pos)
            self.assertGreaterEqual(i, 0, p["seg"])
            pos = i + len(p["greek"])
        # The Greek of the paragraphs, joined, is the whole Life: nothing skipped.
        self.assertEqual("".join(p["greek"] for p in d["paragraphs"]).replace(" ", ""), life.strip().replace(" ", ""))
        # The opening Taylor leaves out is there, marked as not in Taylor.
        x = d["paragraphs"][0]
        self.assertTrue(x.get("extra"))
        self.assertIn("Aristotle", x["modern"])
        self.assertTrue(any("Taylor leaves" in n for n in x.get("notes", [])))

    def test_key_words_are_rendered_the_same_way(self):
        t = modern.load_terms()
        known = modern.term_ids()
        for r in t["terms"]:
            if r.get("term"):
                self.assertIn(r["term"], known)
        gi = {p["p"]: p["modern"] for p in load("general-introduction")["paragraphs"]}
        taylor = {s["id"].rsplit(".", 1)[-1]: s["text"] for s in modern.taylor_text("general-introduction")["segments"]}
        # Taylor's "intellect" is never "mind"; his "ideas" are Forms, his "unities" henads, Jupiter is Zeus.
        self.assertFalse([k for k, v in gi.items() if "intellect" in taylor[k] and " mind " in v.replace("mind's eye", "")
                          and " mind " not in taylor[k]])
        self.assertIn("Forms", gi["p0060"])
        self.assertIn("henads", gi["p0023"])
        self.assertIn("Zeus", gi["p0036"])
        self.assertNotIn("Jupiter", " ".join(gi.values()))
        self.assertNotIn("Jove", " ".join(gi.values()))

    def test_sentences_split_alike_in_python_and_the_reader(self):
        js = (ROOT / "reader" / "modern.js").read_text(encoding="utf-8")
        self.assertIn('const MODERN_SENT = /([.!?]["”’)\\]]?)\\s+(?=["“‘(\\[]?[A-Z0-9])/;', js)
        self.assertEqual(modern.SENT.pattern, r'([.!?]["”’)\]]?)\s+(?=["“‘(\[]?[A-Z0-9])')
        s = modern.sentences('He said, "Know yourself." Then he left. Is it so? Yes.\nA line of verse,\nand another.')
        self.assertEqual(s, ['He said, "Know yourself."', "Then he left.", "Is it so?", "Yes.", "A line of verse,", "and another."])
        if shutil.which("node"):
            out = subprocess.run(["node", "-e", js.split('"use strict";', 1)[1].split("const rxModern", 1)[0]
                                  + "process.stdout.write(JSON.stringify(modernSentences(process.argv[1])));",
                                  'He said, "Know yourself." Then he left. Is it so? Yes.\nA line of verse,\nand another.'],
                                 capture_output=True, text=True, timeout=60)
            self.assertEqual(json.loads(out.stdout), s, out.stderr)

    def test_the_reader_loads_it_and_the_site_carries_it(self):
        page = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        self.assertIn('<script src="modern.js"></script>', page)
        self.assertIn('"modern-view"', (ROOT / "reader" / "shell.js").read_text(encoding="utf-8"))
        self.assertIn("showModernText", (ROOT / "reader" / "guide.js").read_text(encoding="utf-8"))
        for tid in TEXTS:
            self.assertLess((MOD / f"{tid}.json").stat().st_size, 2_000_000)   # small enough for the website's files.json


class Marks(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        lib = sqlite3.connect(":memory:")
        lib.execute("CREATE TABLE work (id TEXT, urn TEXT, title TEXT)")   # the exports list your work by dialogue
        self.mine = mywork.MyWork(Path(self.tmp.name) / "user.sqlite", lib)
        self.p = load("general-introduction")["paragraphs"][1]
        self.s = modern.sentences(self.p["modern"])[1]

    def tearDown(self):
        self.tmp.cleanup()

    def mark(self, **kw):
        data = {"text": "general-introduction", "para": self.p["seg"], "sentence": self.s, "kind": "reads badly"} | kw
        return self.mine.add_modern_mark(data)

    def test_a_mark_is_kept_and_the_newest_wins(self):
        r = self.mark(comment="too long")
        self.assertEqual([(m["kind"], m["comment"], m["changed"]) for m in r["marks"]], [("reads badly", "too long", False)])
        r = self.mark(kind="seems wrong")
        self.assertEqual([m["kind"] for m in r["marks"]], ["seems wrong"])
        r = self.mark(kind="withdrawn")
        self.assertEqual(r["marks"], [])
        # Every mark stays in the database: three rows.
        self.assertEqual(len(self.mine.all_modern_marks()), 3)

    def test_bad_marks_are_refused(self):
        for bad in ({"kind": "lovely"}, {"sentence": "Not a sentence of this paragraph."}, {"para": "p9999"},
                    {"text": "../etc/passwd"}, {"text": "republic"}, {"sentence": ""}):
            with self.assertRaises((mywork.Invalid, mywork.NotFound), msg=bad):
                self.mark(**bad)

    def test_marks_are_in_the_exports(self):
        self.mark(comment="say it plainly")
        self.assertEqual(len(self.mine.export_json()["modern_marks"]), 1)
        md = self.mine.export_markdown()
        self.assertIn("Sentences you marked in the modern English versions", md)
        self.assertIn(self.s, md)
        self.assertIn("say it plainly", md)

    def test_a_revised_sentence_is_shown_as_changed(self):
        self.mark()
        with self.mine.session() as db:
            db.execute("UPDATE modern_mark SET sentence = 'An older wording.'")
        self.assertTrue(self.mine.modern_marks("general-introduction")[0]["changed"])

    def test_an_older_database_gets_the_table(self):
        path = Path(self.tmp.name) / "old.sqlite"
        db = sqlite3.connect(path)
        db.executescript(mywork.USER_SCHEMA.read_text(encoding="utf-8").replace("'schema_version', '6'", "'schema_version', '5'")
                         .split("-- Your marks on the Workshop's modern English")[0]
                         + "INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '5');")
        db.close()
        mywork.ensure(path)
        db = sqlite3.connect(path)
        self.assertTrue(db.execute("SELECT 1 FROM sqlite_master WHERE name = 'modern_mark'").fetchone())
        self.assertEqual(db.execute("SELECT value FROM meta WHERE key = 'schema_version'").fetchone()[0], "6")
        db.close()


def has_library():
    return build_db.DB_PATH.exists()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import serve
        cls.tmp = tempfile.TemporaryDirectory()
        lib = serve.Library(user_path=Path(cls.tmp.name) / "user.sqlite")
        cls.httpd = serve.make_server(port=0, library=lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/{path}") as r:
            return json.loads(r.read())

    def post(self, path, data):
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/{path}", data=json.dumps(data).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())

    def test_the_texts_come_with_their_modern_versions(self):
        for tid in TEXTS:
            t = self.get(f"taylor/{tid}")
            self.assertEqual(t["modern"]["text"], tid)
            self.assertIsInstance(t["modern_marks"], list)
        self.assertEqual(self.get("taylor/general-introduction")["modern_marks"], [])
        self.assertNotIn("modern", self.get("taylor/platonic-terms"))

    def test_a_mark_is_saved_and_comes_back(self):
        p = load("olympiodorus-life")["paragraphs"][5]
        s = modern.sentences(p["modern"])[0]
        r = self.post("modern-marks", {"text": "olympiodorus-life", "para": p["seg"], "sentence": s, "kind": "seems wrong"})
        self.assertEqual(r["marks"][0]["sentence"], s)
        self.assertEqual(self.get("taylor/olympiodorus-life")["modern_marks"][0]["kind"], "seems wrong")
        with self.assertRaises(urllib.error.HTTPError) as e:
            self.post("modern-marks", {"text": "olympiodorus-life", "para": p["seg"], "sentence": "Made up.", "kind": "seems wrong"})
        self.assertEqual(e.exception.code, 400)


@unittest.skipUnless(has_library() and shutil.which("node"), "needs the library and Node")
class Browser(unittest.TestCase):
    def test_in_a_real_browser(self):
        try:
            subprocess.run(["node", "-e", "require('playwright')"], check=True, capture_output=True, timeout=60)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            self.skipTest("Playwright is not installed")
        import serve
        with tempfile.TemporaryDirectory() as tmp:
            lib = serve.Library(user_path=Path(tmp) / "user.sqlite")
            httpd = serve.make_server(port=0, library=lib)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                r = subprocess.run(["node", str(ROOT / "tests" / "modern_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
