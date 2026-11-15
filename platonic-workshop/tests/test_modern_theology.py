"""Tests for Proclus' Theology of Plato in modern English, made from Taylor's English (tools/modern_theology.py),
read at #neo-modern/proclus-theology (reader/neo.js), with marks on its sentences.

    python3 -m unittest tests.test_modern_theology -v

The file tests always run (Taylor's English is in the repository, sources/taylor-gutenberg/). The server test needs
data/workshop.sqlite (python3 tools/build_db.py); the browser test also needs Node and Playwright. Each is skipped
without what it needs.
"""
import copy
import json
import re
import shutil
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
import modern  # noqa: E402
import modern_theology as mt  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
BOOKS = mt.taylor()


def load():
    return json.loads((MOD / "proclus-theology.json").read_text(encoding="utf-8"))


class TaylorsText(unittest.TestCase):
    def test_six_books_of_proclus_and_taylors_seventh(self):
        self.assertEqual(list(BOOKS), ["I", "II", "III", "IV", "V", "VI", "VII"])
        self.assertEqual([c["n"] for c in BOOKS["I"]["chapters"]], list(range(1, 30)))   # Gutenberg's "CHAPTER Χ." has a Greek Chi
        self.assertEqual(len(BOOKS["II"]["chapters"]), 12)
        first = BOOKS["I"]["chapters"][0]["paras"][0]
        self.assertTrue(first["text"].startswith("O Pericles, to me the dearest of friends"))
        self.assertEqual(first["notes"], [{"n": 82, "text": "Meaning Plato."}])
        self.assertNotIn("[82]", first["text"])
        last = BOOKS["VI"]["chapters"][-1]["paras"][-1]["text"]
        self.assertTrue(last.endswith("[as we have there written]."), last[-80:])

    def test_book_three_is_divided_into_the_chapters_of_taylors_contents(self):
        # Taylor's printed text heads chapters I, II, III and then IX; SPLITS divides his paragraphs among 1-8.
        self.assertEqual([c["n"] for c in BOOKS["III"]["chapters"]], list(range(1, 29)))
        self.assertEqual([len(c["paras"]) for c in BOOKS["III"]["chapters"][:9]], [1, 5, 3, 1, 2, 7, 1, 2, 4])
        self.assertTrue(BOOKS["III"]["chapters"][1]["paras"][0]["text"].startswith("This therefore is I think prior"))
        self.assertTrue(BOOKS["III"]["chapters"][6]["paras"][0]["text"].startswith("Again therefore, the mystic doctrine"))
        self.assertTrue(all(c["head"] for c in BOOKS["III"]["chapters"]))

    def test_book_five_chapter_twenty_six_is_read_despite_its_greek_letters(self):
        # Gutenberg prints "CHAPTER ΧΧVῚ." with two Greek Chis and an Iota with varia.
        self.assertEqual([c["n"] for c in BOOKS["V"]["chapters"]], list(range(1, 40)))
        five = {c["n"]: c for c in BOOKS["V"]["chapters"]}
        self.assertEqual(len(five[25]["paras"]), 5)
        self.assertEqual(len(five[26]["paras"]), 2)
        self.assertTrue(five[26]["paras"][0]["text"].startswith("It will remain, therefore, that we should make mention of what is written in the Laws"))
        self.assertFalse(any("CHAPTER" in p["text"] for c in BOOKS["V"]["chapters"] for p in c["paras"]))

    def test_taylors_chapter_headings(self):
        heads = mt.chapter_heads()
        self.assertTrue(heads["I.1"].startswith("The Preface, in which the scope of the treatise is unfolded"))
        self.assertTrue(heads["I.8"].startswith("An enumeration of the different opinions concerning the Parmenides"))
        self.assertEqual(sum(1 for k in heads if k.startswith("I.")), 29)


class Files(unittest.TestCase):
    def test_no_problems_and_the_json_is_up_to_date(self):
        d, problems = mt.build(books=BOOKS)
        self.assertEqual(problems, [])
        self.assertEqual(load(), json.loads(json.dumps(d, ensure_ascii=False)))

    def test_labelled_as_the_workshops_own_machine_assisted_and_made_from_taylor(self):
        d = load()
        self.assertTrue(d["machine_assisted"])
        self.assertEqual(d["by"], "Workshop modern version")
        self.assertIn("not yet checked by a scholar", d["label"])
        self.assertEqual((d["kind"], d["made_from"]), ("theology", "taylor"))
        self.assertIn("Project Gutenberg", d["taylor_source"])
        self.assertIn("not yet on the site", d["about"])

    def test_books_one_and_two_and_book_three_chapters_one_to_eighteen_each_with_a_title_and_a_summary(self):
        d = load()
        self.assertEqual([c["id"] for c in d["chapters"]], [f"I.{n}" for n in range(1, 30)] + [f"II.{n}" for n in range(1, 13)] + [f"III.{n}" for n in range(1, 29)] + [f"IV.{n}" for n in range(1, 40)] + [f"V.{n}" for n in range(1, 12)])
        self.assertEqual([t["id"] for t in d["treatises"]], ["I", "II", "III", "IV", "V"])
        self.assertTrue(all(c["title"] and c["summary"] and c["taylor_head"] for c in d["chapters"]))
        self.assertEqual(len(d["paragraphs"]), 378)
        self.assertTrue(d["paragraphs"][0]["modern"].startswith("Pericles, dearest of my friends"))

    def test_every_paragraph_of_taylor_has_a_modern_version_in_order(self):
        d = load()
        for c in d["chapters"]:
            mine = [p["seg"] for p in d["paragraphs"] if p["chapter"] == c["id"]]
            self.assertEqual(mine, [f"{c['id']}.p{k}" for k in range(1, len(c["taylor"]) + 1)], c["id"])
            self.assertEqual([x["text"] for x in c["taylor"]],
                             [x["text"] for x in next(t for t in BOOKS[c["id"].split(".")[0]]["chapters"] if t["id"] == c["id"])["paras"]])

    def test_flags_quote_taylor_word_for_word_and_say_why(self):
        d = load()
        taylor = {f"{c['id']}.p{x['n']}": x["text"] for c in d["chapters"] for x in c["taylor"]}
        flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 180)
        for seg, f in flags:
            self.assertIn(f["taylor"], taylor[seg], seg)
            self.assertTrue(f["why"], seg)

    def test_the_contents_name_all_six_books_and_what_is_done(self):
        d = load()
        self.assertEqual([b["id"] for b in d["contents"]], ["I", "II", "III", "IV", "V", "VI"])
        done = [c["id"] for b in d["contents"] for c in b["chapters"] if c["done"]]
        self.assertEqual(done, [c["id"] for c in d["chapters"]])
        self.assertTrue(all(c["head"] for c in d["contents"][0]["chapters"]))


class FixedRenderings(unittest.TestCase):
    """Daniel: certain words demand certain translations. Taylor's words for them are fixed in terms.json."""

    def test_the_theologys_rules_cover_the_audits_gaps(self):
        rules = {f: r for r in mt.rules_for(mt.load_terms()) for f in r["taylor"]}
        for taylor, modern_word in [("essence", "being"), ("the one", "the One"), ("the good", "Good"), ("ideas", "Form"),
                                    ("participate", "shar"), ("progression", "procession"), ("unities", "henad"),
                                    ("productive principle", "forming principle"), ("regression", "return"),
                                    ("energy", "activ"), ("superessential", "beyond being"), ("demiurgus", "Craftsman"),
                                    ("Saturn", "Kronos")]:
            self.assertIn(modern_word, rules[taylor]["modern"], taylor)

    def test_never_essence_subsist_energy_or_felicity(self):
        for p in load()["paragraphs"]:
            self.assertIsNone(re.search(r"essence|subsist|energ|felicity", p["modern"], re.I), p["seg"])

    def test_the_rules_are_kept_and_a_miss_is_caught(self):
        d = load()
        self.assertIn("henads", d["paragraphs"][next(i for i, p in enumerate(d["paragraphs"]) if p["seg"] == "I.3.p3")]["modern"])
        terms = copy.deepcopy(mt.load_terms())
        terms["exceptions"]["proclus-theology"].pop("I.2.p3:the one")
        problems = mt.build(terms=terms, books=BOOKS)[1]
        self.assertTrue(any(x.startswith("I.2.p3: Taylor has 'the one'") for x in problems), problems)
        terms = copy.deepcopy(mt.load_terms())
        terms["forbidden"]["proclus-theology"].append("Pericles")
        problems = mt.build(terms=terms, books=BOOKS)[1]
        self.assertTrue(any(x.startswith("I.1.p1: the modern version uses 'Pericles'") for x in problems), problems)

    def test_the_theologys_rules_leave_the_introduction_and_the_life_alone(self):
        terms = modern.load_terms()
        for tid in modern.TEXTS:
            d, problems = modern.build(tid, terms)
            self.assertEqual(problems, [], tid)
            self.assertFalse(any(x["term"] == "logos" and "forming principle" in x["forms"] for x in d["links"]), tid)

    def test_sentences_can_be_marked(self):
        n = sum(len(modern.sentences(p["modern"])) for p in load()["paragraphs"])
        self.assertGreater(n, 250)


class Site(unittest.TestCase):
    def test_the_reader_and_the_site_carry_it(self):
        import build_site
        import serve
        self.assertIn("proclus-theology", serve.MODERN_NEO)
        self.assertIn(MOD / "proclus-theology.json", build_site.server_json())
        js = (ROOT / "reader" / "neo.js").read_text(encoding="utf-8")
        self.assertIn('#neo-modern/proclus-theology', js)
        self.assertIn('d.kind === "theology"', js)
        # The 2 MB cut that once hid the Metaphysics and the Enneads (PR 85): the modern English is sent whatever its size.
        self.assertLess((MOD / "proclus-theology.json").stat().st_size, 2_000_000 * 4)


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

    def test_it_is_served_with_your_marks(self):
        d = self.get("modern-neo/proclus-theology")
        self.assertEqual(d["kind"], "theology")
        self.assertEqual(d["marks"], [])
        self.assertEqual(d["chapters"][0]["taylor"][0]["notes"][0]["text"], "Meaning Plato.")
        sentence = modern.sentences(d["paragraphs"][0]["modern"])[0].strip()
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/modern-marks", method="POST",
                                     data=json.dumps({"text": "proclus-theology", "para": "I.1.p1", "sentence": sentence, "kind": "reads badly"}).encode(),
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as r:
            self.assertEqual(r.status, 201)
        self.assertEqual([m["para"] for m in self.get("modern-neo/proclus-theology")["marks"]], ["I.1.p1"])


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
                r = subprocess.run(["node", str(ROOT / "tests" / "modern_theology_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
