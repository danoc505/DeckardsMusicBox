"""Tests for milestone 26: the commentators' Greek beside Taylor's English (tools/taylor_greek.py,
GET /api/taylor-greek and /api/taylor-greek/<work>/<part>, reader/neo.js).

    python3 -m unittest tests.test_taylor_greek -v

Reading Taylor's English needs only the committed sources; the matching and the server need
data/workshop.sqlite (python3 tools/build_db.py); the browser test also needs Node and Playwright.
Each is skipped without what it needs.
"""
import json
import shutil
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
import taylor_greek as tg  # noqa: E402


def has_library():
    return build_db.DB_PATH.exists()


class Rules(unittest.TestCase):
    def test_chapter_numbers_as_the_ocr_prints_them(self):
        for printed, value in [("XII", 12), ("IIL", 3), ("XL", 11), ("XI L", 12), ("XXYI", 26), ("ΧΙΙ", 12), ("H", 2), ("XVIIL", 18)]:
            self.assertEqual(tg.ocr_roman(printed), value, printed)

    def test_a_lost_number_joins_two_chapters(self):
        items = [{"kind": "para", "text": t, "line": i, "page": 1} for i, t in enumerate(
            ["I. First chapter.", "More of it.", "II. Second.", "V. Fifth, the third and fourth lost.", "X. Sixth, misread."])]
        chs = tg.split_chapters(items)
        self.assertEqual([c["nums"] for c in chs], [[1], [2, 3, 4], [5], [6]])
        self.assertEqual(chs[1]["lost"], [3, 4])
        self.assertEqual(chs[3]["how"], "misread")

    def test_the_pronoun_is_not_a_chapter(self):
        items = [{"kind": "para", "text": t, "line": i, "page": 1} for i, t in enumerate(["I. One.", "I have followed Ficinus here."])]
        self.assertEqual(len(tg.split_chapters(items)), 1)

    def test_page_furniture(self):
        self.assertEqual(tg.furniture(["301"]), ("page", 301))
        self.assertEqual(tg.furniture(["Plot,"])[0], "head")
        self.assertIsNone(tg.furniture(["in  one."]))      # the end of a sentence on a line of its own

    def test_the_greek_of_taylors_terms(self):
        t = tg.statement_terms("Every soul is a medium between impartible natures")
        self.assertEqual(set(t), {"soul", "impartible", "medium", "natures"})
        self.assertEqual(tg.terms_found(t, "Πᾶσα ψυχὴ μέση τῶν ἀμερίστων ἐστὶ"), {"soul", "medium", "impartible"})

    def test_a_quotation_found_letters_only(self):
        hay = " ".join(tg.letters("Καὶ δὴ καὶ αἱ τῆς μήνιδος ἐξιλάσεις ἔσονται σαφεῖς").split())
        q = tg.note_quotes(["In the original, Και δη, και “ αι της µήνιδος εξιλασεις” εσονται σαφεις"])
        self.assertTrue(q)
        self.assertTrue(tg.find_quote(q[0][1], hay))


class TaylorsEnglish(unittest.TestCase):
    def test_plotinus_fifteen_treatises_in_chapters(self):
        tr = tg.taylor_plotinus()
        self.assertEqual([t["enn"] for t, _ in tr], [x[1] for x in tg.PLOTINUS_TREATISES])
        for t, chs in tr:
            nums = [n for c in chs for n in c["nums"]]
            self.assertEqual(nums, list(range(1, len(nums) + 1)), t["enn"])     # every number, in order, once
        first = dict((t["enn"], chs) for t, chs in tr)["1.2"][0]
        self.assertTrue(first["paras"][0].startswith("Since evils are here"))

    def test_plotinus_list_is_quoted_from_taylors_introduction(self):
        text = " ".join(tg.PLOTINUS_TXT.read_text(encoding="utf-8").split())
        for head, enn, listed, note in tg.PLOTINUS_TREATISES:
            self.assertIn(" ".join(listed.split()), text, listed)

    def test_mysteries_ten_sections(self):
        secs = tg.taylor_mysteries()
        self.assertEqual([s for s, _ in secs], list(range(1, 11)))
        self.assertEqual([len(chs) for _, chs in secs], [21, 11, 31, 13, 26, 7, 5, 8, 10, 8])
        self.assertTrue(secs[0][1][0]["paras"][0].startswith("Hermes, the God who presides over language"))

    def test_elements_211_propositions(self):
        props = tg.taylor_elements()
        self.assertEqual([p["nums"][0] for p in props], list(range(1, 212)))
        self.assertTrue(props[0]["paras"][0].startswith("All multitude participates"))
        self.assertTrue(props[-1]["paras"][0].startswith("Every partial soul descending into generation"))


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import serve
        cls.tmp = tempfile.TemporaryDirectory()
        cls.lib = serve.Library(user_path=Path(cls.tmp.name) / "user.sqlite")
        if not cls.lib.has_taylor():
            raise unittest.SkipTest("the library was built without the Neoplatonists")
        cls.httpd = serve.make_server(port=0, library=cls.lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/{path}") as r:
            return json.loads(r.read())

    def test_the_three_works(self):
        d = self.get("taylor-greek")
        self.assertEqual([w["id"] for w in d["works"]], ["taylor-plotinus", "taylor-mysteries", "taylor-elements"])
        for w in d["works"]:
            self.assertEqual(len(w["parts"]), w["n_parts"])
            self.assertTrue(w["source"]["licence"])
        by = {w["id"]: w for w in d["works"]}
        self.assertEqual(by["taylor-plotinus"]["n_matched"], by["taylor-plotinus"]["n_chapters"])
        self.assertGreaterEqual(by["taylor-mysteries"]["n_matched"], by["taylor-mysteries"]["n_chapters"] - 2)

    def test_a_chapter_and_its_greek(self):
        p = self.get("taylor-greek/taylor-plotinus/0")
        c = p["chapters"][0]
        self.assertEqual(c["label"], "I.2.1")
        self.assertEqual(c["match_how"], "chapter number")
        self.assertTrue(c["greek"]["units"][0]["text"].startswith("Ἐπειδὴ τὰ κακὰ"))
        self.assertIn("ΑΡΕΤΩΝ", p["part"]["greek_label"])
        with self.assertRaises(urllib.error.HTTPError) as e:
            self.get("taylor-greek/taylor-plotinus/99")
        self.assertEqual(e.exception.code, 404)

    def test_the_lengths_agree_chapter_by_chapter(self):
        st = json.loads(self.lib.one("SELECT value FROM build WHERE key = 'taylor_greek_stats'")["value"])
        for w in st["works"]:
            if "ratio" in w:
                self.assertLessEqual(len(w["ratio"]["outliers"]), 0.04 * w["ratio"]["chapters"], w["id"])

    def test_the_elements_say_how(self):
        rows = self.lib.rows("SELECT match_how, match_note, greek_span FROM taylor_chapter WHERE work_id = 'taylor-elements' ORDER BY seq")
        self.assertEqual(len(rows), 211)
        hows = {r["match_how"] for r in rows}
        self.assertLessEqual(hows, {"found", "machine-matched", "not placed"})
        for r in rows:
            self.assertTrue(r["match_note"])
            span = json.loads(r["greek_span"])
            self.assertEqual(span["placed"], r["match_how"] != "not placed")
        # Creuzer's own numbers are found: Proposition 6 begins 'Πᾶν πλῆθος ἢ ἐξ ἡνωμένων'
        c = self.get("taylor-greek/taylor-elements/0")["chapters"][5]
        self.assertEqual(c["match_how"], "found")
        self.assertIn("ἐξ ἡνωμένων", c["greek"]["text"].split("\n")[0])

    def test_the_greek_links_back(self):
        u = self.get("neo/plotinus-enneads/1")["units"][0]
        self.assertEqual(u["taylor"][0]["work"], "taylor-plotinus")
        self.assertEqual(u["taylor"][0]["label"], "I.2.1")


class Reader(unittest.TestCase):
    def test_the_reader_routes_it(self):
        shell = (ROOT / "reader" / "shell.js").read_text(encoding="utf-8")
        self.assertIn("showTaylorGreek(", shell)
        neo = (ROOT / "reader" / "neo.js").read_text(encoding="utf-8")
        self.assertIn("taylor-greek", neo)


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
            if not lib.has_taylor():
                self.skipTest("the library was built without the Neoplatonists")
            httpd = serve.make_server(port=0, library=lib)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                r = subprocess.run(["node", str(ROOT / "tests" / "taylor_greek_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
