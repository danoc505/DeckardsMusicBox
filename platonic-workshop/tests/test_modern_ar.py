"""Tests for milestone 35: the Workshop's modern English of Aristotle (tools/modern_ar.py), read with the page of
milestone 27 (reader/neo.js) at #neo-modern/aristotle-<work>, linked from the Aristotle shelf and the work.

    python3 -m unittest tests.test_modern_ar -v

The file tests always run. The checks against the Greek need data/raw/ (python3 tools/fetch_sources.py); the server
test needs data/workshop.sqlite (python3 tools/build_db.py); the browser test also needs Node and Playwright.
"""
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
import modern_ar  # noqa: E402
from modern_neo import norm  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
FIRST1K = ROOT / "data" / "raw" / "first1k-aristotle"


def load(text="aristotle-categories"):
    return json.loads((MOD / f"{text}.json").read_text(encoding="utf-8"))


def has_library():
    return build_db.DB_PATH.exists()


class Files(unittest.TestCase):
    def test_labelled_as_the_workshops_own_and_machine_assisted(self):
        d = load()
        self.assertEqual((d["by"], d["kind"], d["work"], d["work_slug"]), ("Workshop modern version", "aristotle", "ar006", "categories"))
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("machine-assisted", d["label"])
        self.assertIn("not yet checked", d["label"])
        self.assertIn("modernises the public-domain English", d["about"])

    def test_every_chapter_of_the_categories_with_a_title_a_summary_and_taylor(self):
        d = load()
        self.assertEqual([c["id"] for c in d["chapters"]], [f"Cat.{n}" for n in range(1, 16)])
        self.assertEqual(d["treatises"][0]["chapters"], [c["id"] for c in d["chapters"]])
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"], c["id"])
            self.assertTrue(c["taylor"], f"{c['id']}: Taylor's chapter is shown with it")
        # Taylor prints the list of the ten categories (Greek chapter 4) in his chapter 3.
        self.assertEqual([x["n"] for x in d["chapters"][3]["taylor"]], [3])
        for c in d["chapters"]:
            self.assertTrue(any(p["chapter"] == c["id"] for p in d["paragraphs"]), c["id"])

    def test_paragraphs_have_their_greek_and_bekker_columns(self):
        d = load()
        cols = [c for p in d["paragraphs"] for c in p["cols"]]
        self.assertEqual(cols[0], "1a")
        self.assertEqual(cols[-1], "15b")
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"] and p["greek"] and p["cols"], p["seg"])
            for c in p["cols"]:
                self.assertRegex(c, r"^\d{1,2}[ab]$")
        # The columns run in Bekker's order.
        keys = [(int(c[:-1]), c[-1]) for c in cols]
        self.assertEqual(keys, sorted(keys))
        self.assertIn("ὉΜΩΝΥΜΑ λέγεται", d["paragraphs"][0]["greek"])
        self.assertIn("Things are called homonymous", d["paragraphs"][0]["modern"])

    def test_flags_quote_an_older_english_word_for_word(self):
        d = load()
        eng = modern_ar.english(modern_ar.TEXTS["aristotle-categories"])
        labels = {lab: whole for lab, _, whole, _ in eng.values()}
        flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 10)
        for seg, f in flags:
            self.assertIn(f["in"], labels, seg)
            self.assertIn(norm(f["taylor"]), labels[f["in"]], seg)
            self.assertTrue(f["why"], seg)
        # The place where Taylor's English, as scanned, says the opposite of the Greek (5, 2a12).
        self.assertTrue(any(seg == "Cat.5.p1" and f["taylor"] == "nor is any subject" for seg, f in flags))

    def test_the_key_words_keep_their_renderings(self):
        d = load()
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertIn("soul", para["Cat.2.p2"]["modern"])           # ψυχή
        self.assertIn("virtue", para["Cat.11.p4"]["modern"])        # ἀρετή
        self.assertIn("privation", para["Cat.10.p1"]["modern"])     # στέρησις
        self.assertIn("justice", para["Cat.8.p7"]["modern"])        # δικαιοσύνη

    def test_every_sentence_can_be_marked(self):
        d = load()
        for p in d["paragraphs"]:
            self.assertTrue(modern.sentences(p["modern"]), p["seg"])

    def test_the_reader_and_the_server_know_it(self):
        js = (ROOT / "reader" / "aristotle.js").read_text(encoding="utf-8")
        found = dict(re.findall(r'(ar\d+\w*): "(aristotle-[\w-]+)"', js[js.index("const AR_MODERN"):js.index("};", js.index("const AR_MODERN"))]))
        self.assertEqual(found, {t["work"]: tid for tid, t in modern_ar.TEXTS.items()})
        import serve
        for tid in modern_ar.TEXTS:
            self.assertIn(tid, serve.MODERN_NEO)
            self.assertTrue((MOD / f"{tid}.json").exists(), tid)


class OnInterpretation(unittest.TestCase):
    """Milestone 35b: On Interpretation, with the same tooling and page as the Categories."""

    def test_labelled_and_every_chapter_with_a_title_a_summary_and_taylor(self):
        d = load("aristotle-on-interpretation")
        self.assertEqual((d["by"], d["kind"], d["work"], d["work_slug"]), ("Workshop modern version", "aristotle", "ar017", "on-interpretation"))
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("not yet checked", d["label"])
        self.assertIn("modernises the public-domain English", d["about"])
        self.assertEqual([c["id"] for c in d["chapters"]], [f"Int.{n}" for n in range(1, 15)])
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"] and c["taylor"], c["id"])
            self.assertTrue(any(p["chapter"] == c["id"] for p in d["paragraphs"]), c["id"])
        # The beginning of chapter 5 is in Taylor's chapter 4, as the scan gives it.
        self.assertEqual([x["n"] for x in d["chapters"][4]["taylor"]], [4, 5])

    def test_paragraphs_have_their_greek_and_bekker_columns(self):
        d = load("aristotle-on-interpretation")
        cols = [c for p in d["paragraphs"] for c in p["cols"]]
        self.assertEqual((cols[0], cols[-1]), ("16a", "24b"))
        keys = [(int(c[:-1]), c[-1]) for c in cols]
        self.assertEqual(keys, sorted(keys))
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"] and p["greek"] and p["cols"], p["seg"])
            self.assertTrue(modern.sentences(p["modern"]), p["seg"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertIn("ΠΡΩΤΟΝ δεῖ θέσθαι", para["Int.1.p1"]["greek"])
        self.assertIn("sea battle", para["Int.9.p6"]["modern"])
        self.assertIn("soul", para["Int.1.p1"]["modern"])           # ψυχή
        self.assertIn("privation", para["Int.10.p2"]["modern"])     # στέρησις

    def test_flags_quote_an_older_english_word_for_word(self):
        d = load("aristotle-on-interpretation")
        eng = modern_ar.english(modern_ar.TEXTS["aristotle-on-interpretation"])
        labels = {lab: whole for lab, _, whole, _ in eng.values()}
        flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 10)
        for seg, f in flags:
            self.assertIn(norm(f["taylor"]), labels[f["in"]], seg)
            self.assertTrue(f["why"], seg)
        # Edghill's "primary substances" for the first, always actual substances (13, 23a23).
        self.assertTrue(any(seg == "Int.13.p6" and "primary substances" in f["taylor"] and f["in"].startswith("Edghill") for seg, f in flags))
        # Edghill's "actually true" where the Greek says "not yet true" (9, 19a39).
        self.assertTrue(any(seg == "Int.9.p6" and "actually true" in f["taylor"] for seg, f in flags))


class PriorAnalytics(unittest.TestCase):
    """Milestone 35c: the Prior Analytics, the first work in two books, with Taylor's own numbering of Book II."""

    def test_labelled_two_books_and_every_chapter_with_a_title_a_summary_and_taylor(self):
        d = load("aristotle-prior-analytics")
        self.assertEqual((d["by"], d["kind"], d["work"], d["work_slug"]), ("Workshop modern version", "aristotle", "ar001", "prior-analytics"))
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("not yet checked", d["label"])
        self.assertIn("modernises the public-domain English", d["about"])
        self.assertEqual([t["id"] for t in d["treatises"]], ["APr.I", "APr.II"])
        ids = [f"APr.I.{n}" for n in range(1, 47)] + [f"APr.II.{n}" for n in range(1, 28)]
        self.assertEqual([c["id"] for c in d["chapters"]], ids)
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"] and c["taylor"], c["id"])
            self.assertEqual(c["treatise"], c["id"].rsplit(".", 1)[0])
            self.assertTrue(any(p["chapter"] == c["id"] for p in d["paragraphs"]), c["id"])
        tay = {c["id"]: [x["label"] for x in c["taylor"]] for c in d["chapters"]}
        # Taylor folds I.27 into his 26, and numbers Book II his own way.
        self.assertEqual(tay["APr.I.27"], ["Book I, Chapter 26"])
        self.assertEqual(tay["APr.II.2"], ["Book II, Chapter 1"])
        self.assertEqual(tay["APr.II.16"], ["Book II, Chapter 14"])
        self.assertEqual(tay["APr.II.27"], ["Book II, Chapter 25"])

    def test_paragraphs_have_their_greek_and_bekker_columns(self):
        d = load("aristotle-prior-analytics")
        cols = [c for p in d["paragraphs"] for c in p["cols"]]
        self.assertEqual((cols[0], cols[-1]), ("24a", "70b"))
        keys = [(int(c[:-1]), c[-1]) for c in cols]
        self.assertEqual(keys, sorted(keys))
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"] and p["greek"] and p["cols"], p["seg"])
            self.assertTrue(modern.sentences(p["modern"]), p["seg"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertIn("syllogism", para["APr.I.1.p2"]["modern"])
        self.assertIn("induction", para["APr.II.23.p1"]["modern"])
        self.assertIn("pattern", para["APr.II.24.p1"]["modern"])     # παράδειγμα
        self.assertIn("justice", para["APr.II.25.p1"]["modern"])     # δικαιοσύνη

    def test_flags_quote_an_older_english_word_for_word(self):
        d = load("aristotle-prior-analytics")
        eng = modern_ar.english(modern_ar.TEXTS["aristotle-prior-analytics"])
        labels = {lab: whole for lab, _, whole, _ in eng.values()}
        flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 15)
        for seg, f in flags:
            self.assertIn(norm(f["taylor"]), labels[f["in"]], seg)
            self.assertTrue(f["why"], seg)
        # Taylor's "abduction" for ἀπαγωγή (II.25), and his "consentaneous" for εἰκός (II.27).
        self.assertTrue(any(seg == "APr.II.25.p1" and "Abduction" in f["taylor"] and f["in"].startswith("Taylor") for seg, f in flags))
        self.assertTrue(any(seg == "APr.II.27.p1" and "consentaneous" in f["taylor"] for seg, f in flags))
        # Jenkinson's "perfect" where this version says "complete" (I.1).
        self.assertTrue(any(seg == "APr.I.1.p2" and "perfect syllogism" in f["taylor"] and f["in"].startswith("Jenkinson") for seg, f in flags))


class Metaphysics(unittest.TestCase):
    """Milestone 35m1: the Metaphysics, Books Α and α (I and II), the first books of a work done a few books at a time,
    from Perseus' Greek (Ross 1924), with Taylor's own chapters of Book Α."""

    def test_labelled_the_books_done_so_far_and_every_chapter_with_a_title_a_summary_and_taylor(self):
        d = load("aristotle-metaphysics")
        self.assertEqual((d["by"], d["kind"], d["work"], d["work_slug"]), ("Workshop modern version", "aristotle", "ar025", "metaphysics"))
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("not yet checked", d["label"])
        self.assertIn("so far Books Α and α", d["about"])
        self.assertEqual(d["greek_info"]["edition"], "Ross, Oxford, 1924 (Perseus)")
        self.assertEqual(modern_ar.TEXTS["aristotle-metaphysics"]["done_books"], [1, 2])
        self.assertEqual([t["id"] for t in d["treatises"]], ["Metaph.I", "Metaph.II"])
        ids = [f"Metaph.I.{n}" for n in range(1, 11)] + [f"Metaph.II.{n}" for n in range(1, 4)]
        self.assertEqual([c["id"] for c in d["chapters"]], ids)
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"] and c["taylor"], c["id"])
            self.assertTrue(any(p["chapter"] == c["id"] for p in d["paragraphs"]), c["id"])
        tay = {c["id"]: [x["label"] for x in c["taylor"]] for c in d["chapters"]}
        # Taylor's Book I has seven chapters: his 6 holds Bekker's 6-7, his 7 holds 8-10.
        self.assertEqual(tay["Metaph.I.5"], ["Book I, Chapter 5"])
        self.assertEqual(tay["Metaph.I.7"], ["Book I, Chapter 6"])
        self.assertEqual(tay["Metaph.I.9"], ["Book I, Chapter 7"])
        self.assertEqual(tay["Metaph.II.2"], ["Book II, Chapter 2"])

    def test_paragraphs_have_their_greek_and_bekker_columns(self):
        d = load("aristotle-metaphysics")
        cols = [c for p in d["paragraphs"] for c in p["cols"]]
        self.assertEqual((cols[0], cols[-1]), ("980a", "995a"))
        keys = [(int(c[:-1]), c[-1]) for c in cols]
        self.assertEqual(keys, sorted(keys))
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"] and p["greek"] and p["cols"], p["seg"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["Metaph.I.1.p1"]["modern"].startswith("All human beings by nature desire to know."))
        self.assertTrue(para["Metaph.I.1.p1"]["greek"].startswith("πάντες ἄνθρωποι τοῦ εἰδέναι ὀρέγονται φύσει."))
        self.assertIn("intellect", para["Metaph.I.3.p6"]["modern"])        # Anaxagoras' νοῦς
        self.assertIn("what it is to be", para["Metaph.I.3.p1"]["modern"])  # τὸ τί ἦν εἶναι
        self.assertIn("eyes of bats", para["Metaph.II.1.p1"]["modern"])

    def test_flags_quote_an_older_english_word_for_word(self):
        d = load("aristotle-metaphysics")
        eng = modern_ar.english(modern_ar.TEXTS["aristotle-metaphysics"])
        labels = {lab: whole for lab, _, whole, _ in eng.values()}
        flags = [(p["seg"], f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 12)
        for seg, f in flags:
            self.assertIn(norm(f["taylor"]), labels[f["in"]], seg)
            self.assertTrue(f["why"], seg)
        # Ross's "reason" for νοῦς, and his "essence" for τὸ τί ἦν εἶναι; Taylor's "species of matter".
        self.assertTrue(any(seg == "Metaph.II.1.p1" and "reason in our soul" in f["taylor"] and f["in"].startswith("Ross") for seg, f in flags))
        self.assertTrue(any(seg == "Metaph.I.3.p1" and "the essence" in f["taylor"] for seg, f in flags))
        self.assertTrue(any(seg == "Metaph.I.3.p2" and "species of matter" in f["taylor"] and f["in"].startswith("Taylor") for seg, f in flags))

    def test_only_the_books_done_are_wanted(self):
        meta = modern_ar.TEXTS["aristotle-metaphysics"]
        g = {(1, 1): {"text": "x", "cols": []}, (3, 1): {"text": "y", "cols": []}}
        meta2 = dict(meta, done_books=[1])
        old = modern_ar.TEXTS["aristotle-metaphysics"]
        modern_ar.TEXTS["aristotle-metaphysics"] = meta2
        try:
            _, problems = modern_ar.build("aristotle-metaphysics", greek_chs=g, eng=modern_ar.english(meta))
        finally:
            modern_ar.TEXTS["aristotle-metaphysics"] = old
        self.assertTrue(any("the chapters are" in x and "(3, 1)" not in x.split("the Greek has")[1] for x in problems), problems)


@unittest.skipUnless(FIRST1K.exists(), "run python3 tools/fetch_sources.py first")
class AgainstTheGreek(unittest.TestCase):
    def test_built_with_no_problems_and_up_to_date(self):
        res = modern_ar.build_all(write=False)
        for tid, (d, problems) in res.items():
            self.assertEqual(problems, [], tid)
            self.assertEqual(load(tid), json.loads(json.dumps(d, ensure_ascii=False)), f"{tid}.json is out of date: run python3 tools/modern_ar.py")

    def test_the_paragraphs_cover_all_the_greek(self):
        for tid, meta in modern_ar.TEXTS.items():
            d = load(tid)
            g = modern_ar.greek_chapters(meta["work"])
            for c in d["chapters"]:
                joined = " ".join(p["greek"] for p in d["paragraphs"] if p["chapter"] == c["id"])
                self.assertEqual(joined.replace(" ", ""), g[modern_ar.chapter_key(c["id"])]["text"].replace(" ", ""), c["id"])

    def test_a_flag_not_in_any_english_is_caught(self):
        src = (MOD / "aristotle-categories.txt").read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "aristotle-categories.txt").write_text(
                src.replace("!flag nor is any subject |", "!flag words no translator wrote |"), encoding="utf-8")
            old = modern_ar.MODERN
            modern_ar.MODERN = Path(tmp)
            try:
                _, problems = modern_ar.build("aristotle-categories")
            finally:
                modern_ar.MODERN = old
        self.assertTrue(any("words no translator wrote" in x for x in problems), problems)


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

    def test_the_modern_version_is_served_with_your_marks(self):
        d = self.get("modern-neo/aristotle-categories")
        self.assertEqual(d["kind"], "aristotle")
        self.assertEqual(d["marks"], [])
        self.assertEqual(len(d["chapters"]), 15)
        self.assertEqual(d["paragraphs"][0]["cols"], ["1a"])
        d = self.get("modern-neo/aristotle-on-interpretation")
        self.assertEqual((d["kind"], d["marks"], len(d["chapters"])), ("aristotle", [], 14))
        self.assertEqual(d["paragraphs"][0]["cols"], ["16a"])
        d = self.get("modern-neo/aristotle-prior-analytics")
        self.assertEqual((d["kind"], d["marks"], len(d["chapters"])), ("aristotle", [], 73))
        self.assertEqual(d["paragraphs"][0]["cols"], ["24a", "24b"])
        d = self.get("modern-neo/aristotle-metaphysics")
        self.assertEqual((d["kind"], d["marks"], len(d["chapters"])), ("aristotle", [], 13))
        self.assertEqual(d["paragraphs"][0]["cols"], ["980a"])


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
                r = subprocess.run(["node", str(ROOT / "tests" / "modern_ar_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
