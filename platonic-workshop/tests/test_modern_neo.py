"""Tests for milestone 27: the Workshop's modern English of the Neoplatonists, made from the Greek
(tools/modern_neo.py), shown beside Taylor's English (reader/neo.js), with marks on its sentences.

    python3 -m unittest tests.test_modern_neo -v

The file tests always run. The check against the Greek needs data/raw/ (python3 tools/fetch_sources.py);
the server test and the check of Plato's places need data/workshop.sqlite (python3 tools/build_db.py);
the browser test also needs Node and Playwright. Each is skipped without what it needs.
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
import modern  # noqa: E402
import modern_neo  # noqa: E402
import mywork  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
FIRST1K = ROOT / "data" / "raw" / "first1k-neoplatonists"

# Where Plotinus quotes Plato, as the notes say: (paragraph, Plato's work, its sections, words of Plotinus' Greek,
# words of Burnet's Greek), both without accents. The notes name the place; this checks it.
PLATO = [
    ("I.2.1.p1", "tlg006", ["176a", "176b"], "μετα φρονησεωσ", "μετα φρονησεωσ"),
    ("I.2.3.p1", "tlg004", ["69b", "69c"], "καθαρσεισ", "καθαρσισ"),
    ("I.2.3.p1", "tlg004", ["82a", "82b"], "πολιτικασ", "πολιτικην αρετην"),
    ("I.3.1.p2", "tlg012", ["248d"], "εισ γονην ανδροσ", "εισ γονην ανδροσ"),
    ("I.3.4.p2", "tlg012", ["248b"], "αληθειασ πεδιω", "αληθειασ ιδειν πεδιον"),
    ("I.3.5.p1", "tlg010", ["58d"], "νου και φρονησεωσ", "καθαρον νου τε και φρονησεωσ"),
]


def load():
    return json.loads((MOD / "plotinus.json").read_text(encoding="utf-8"))


class Files(unittest.TestCase):
    def test_labelled_as_the_workshops_own_machine_assisted_and_made_from_the_greek(self):
        d = load()
        self.assertEqual(d["by"], "Workshop modern version")
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("machine-assisted", d["label"])
        self.assertIn("not yet checked", d["label"])
        self.assertEqual(d["made_from"], "greek")
        self.assertEqual((d["greek_text"], d["taylor_work"]), ("plotinus-enneads", "taylor-plotinus"))

    def test_the_first_treatises_every_chapter_with_a_title_and_a_summary(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"]], ["I.2", "I.3"])
        self.assertEqual([c["id"] for c in d["chapters"]], [f"I.2.{n}" for n in range(1, 8)] + [f"I.3.{n}" for n in range(1, 7)])
        for x in d["treatises"] + d["chapters"]:
            self.assertGreater(len(x["summary"].split()), 15, x["id"])
            self.assertLess(len(x["summary"].split()), 110, x["id"])
        chs = {c["id"] for c in d["chapters"]}
        for p in d["paragraphs"]:
            self.assertIn(p["chapter"], chs)
            self.assertTrue(p["modern"].strip() and p["greek"].strip(), p["seg"])

    def test_the_greek_of_the_paragraphs_runs_on_without_a_gap(self):
        # Each paragraph's Greek begins where the one before ends: the first begins its chapter.
        d = load()
        for c in d["chapters"]:
            ps = [p for p in d["paragraphs"] if p["chapter"] == c["id"]]
            self.assertTrue(ps, c["id"])
            self.assertTrue(ps[0]["seg"].endswith(".p1"))

    def test_flags_quote_taylor_and_say_why(self):
        tay = modern_neo.taylor_chapters("taylor-plotinus")
        n = 0
        for p in load()["paragraphs"]:
            for f in p.get("flags", []):
                n += 1
                self.assertTrue(f["why"].strip())
                self.assertIn(modern_neo.norm(f["taylor"]), tay[p["chapter"]]["text"], p["seg"])
        self.assertGreater(n, 15)

    def test_key_words_are_rendered_the_same_way(self):
        d = load()
        known = modern.term_ids()
        terms = json.loads((MOD / "terms-greek.json").read_text(encoding="utf-8"))
        for r in terms["terms"]:
            if r.get("term"):
                self.assertIn(r["term"], known)
        text = " ".join(p["modern"] for p in d["paragraphs"])
        # Taylor's oddities are not inherited: no "energize", "similitude", "fortitude", "temperance" or "prudence".
        for old in ("energiz", "similitude", "fortitude", "temperance", "prudence", "assimilat", "connascent"):
            self.assertNotIn(old, text.lower())
        self.assertIn("intellect", text)
        self.assertIn("self-control", text)
        self.assertIn("civic virtue", text)

    def test_it_does_not_follow_taylor_where_the_greek_differs(self):
        p = {x["seg"]: x for x in load()["paragraphs"]}
        # I.2.7: Volkmann's ταυτότης is "sameness", where Taylor has "immateriality".
        self.assertIn("ταυτότης", p["I.2.7.p1"]["greek"])
        self.assertIn("sameness", p["I.2.7.p1"]["modern"])
        self.assertNotIn("immateriality", p["I.2.7.p1"]["modern"])
        # I.2.4: the Greek asks a question, which Taylor makes a statement.
        self.assertTrue(p["I.2.4.p2"]["modern"].startswith("Did the soul not have these things already"))

    def test_sentences_can_be_marked(self):
        tmp = tempfile.TemporaryDirectory()
        try:
            lib = sqlite3.connect(":memory:")
            lib.execute("CREATE TABLE work (id TEXT, urn TEXT, title TEXT)")
            mine = mywork.MyWork(Path(tmp.name) / "user.sqlite", lib)
            p = load()["paragraphs"][0]
            s = modern.sentences(p["modern"])[2]
            r = mine.add_modern_mark({"text": "plotinus", "para": p["seg"], "sentence": s, "kind": "reads badly", "comment": "plainer"})
            self.assertEqual(r["marks"][0]["para"], "I.2.1.p1")
            self.assertIn(f"plotinus I.2.1.p1", mine.export_markdown())
            with self.assertRaises(mywork.Invalid):
                mine.add_modern_mark({"text": "plotinus", "para": p["seg"], "sentence": "Not in it.", "kind": "reads badly"})
        finally:
            tmp.cleanup()

    def test_the_reader_and_the_site_carry_it(self):
        js = (ROOT / "reader" / "neo.js").read_text(encoding="utf-8")
        self.assertIn("TG_MODES", js)
        self.assertIn('"plotinus"', (ROOT / "tools" / "serve.py").read_text(encoding="utf-8"))
        self.assertLess((MOD / "plotinus.json").stat().st_size, 2_000_000)   # small enough for the website's files.json


@unittest.skipUnless(FIRST1K.exists(), "run python3 tools/fetch_sources.py first")
class AgainstTheGreek(unittest.TestCase):
    def test_no_problems_and_the_json_is_up_to_date(self):
        res = modern_neo.build_all(write=False)
        d, problems = res["plotinus"]
        self.assertEqual(problems, [])
        self.assertEqual(load(), json.loads(json.dumps(d, ensure_ascii=False)), "plotinus.json is out of date: run python3 tools/modern_neo.py")

    def test_the_paragraphs_hold_all_the_greek_of_each_chapter(self):
        units = modern_neo.greek_units("plotinus-enneads")
        d = load()
        for c in d["chapters"]:
            joined = " ".join(p["greek"] for p in d["paragraphs"] if p["chapter"] == c["id"])
            self.assertEqual(joined.replace(" ", ""), modern_neo.norm(units[c["id"]]["text"]).replace(" ", ""), c["id"])

    def test_a_wrong_greek_start_or_flag_is_caught(self):
        src = (MOD / "plotinus.txt").read_text(encoding="utf-8")
        bad = (src.replace("@greek τί ποτε οὖν ἐστιν ἡ ἀρετὴ", "@greek τί ποτε οὖν ἐστιν ἡ κακία")
               .replace("!flag For rumor also says", "!flag For rumour also says"))
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, "plotinus.txt").write_text(bad, encoding="utf-8")
            old = modern_neo.MODERN
            modern_neo.MODERN = Path(tmp)
            try:
                _, problems = modern_neo.build("plotinus")
            finally:
                modern_neo.MODERN = old
        self.assertTrue(any("Greek start not found" in x for x in problems))
        self.assertTrue(any("flagged words not in Taylor" in x for x in problems))


def has_library():
    return build_db.DB_PATH.exists()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class PlatosPlaces(unittest.TestCase):
    def test_the_notes_name_the_places_plotinus_quotes(self):
        db = sqlite3.connect(build_db.DB_PATH)
        paras = {p["seg"]: p for p in load()["paragraphs"]}
        for seg, work, refs, mine, plato in PLATO:
            self.assertIn(mine, modern_neo.fold(paras[seg]["greek"]), seg)
            text = " ".join(r[0] for r in db.execute(
                f"SELECT text FROM chunk WHERE work_id = ? AND edition_id LIKE '%grc%' AND section_ref IN ({','.join('?' * len(refs))})", (work, *refs)))
            self.assertIn(plato, modern_neo.fold(text), f"{seg}: {work} {refs}")
            first = refs[0].rstrip("abcde")
            self.assertTrue(any(first in n for n in paras[seg].get("notes", [])), f"{seg}: a note names {work} {refs[0]}")
        db.close()


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

    def test_taylors_chapters_come_with_the_modern_english(self):
        d = self.get("taylor-greek/taylor-plotinus/0")
        self.assertEqual(d["modern"]["text"], "plotinus")
        self.assertEqual(d["modern"]["treatise"]["id"], "I.2")
        self.assertEqual(d["modern"]["marks"], [])
        self.assertEqual([c["modern"][0]["id"] for c in d["chapters"]], [f"I.2.{n}" for n in range(1, 8)])
        self.assertIn("Evils are here", d["chapters"][0]["modern"][0]["paragraphs"][0]["modern"])
        # A treatise not yet in modern English has none.
        self.assertIsNone(self.get("taylor-greek/taylor-plotinus/2")["modern"])
        self.assertIsNone(self.get("taylor-greek/taylor-mysteries/0")["modern"])

    def test_the_library_and_the_greek_link_to_it(self):
        w = next(w for w in self.get("taylor-greek")["works"] if w["id"] == "taylor-plotinus")
        self.assertEqual([(t["id"], t["seq"]) for t in w["modern"]["treatises"]], [("I.2", 0), ("I.3", 1)])
        units = self.get("neo/plotinus-enneads/1")["units"]
        self.assertTrue(all(u.get("modern") for u in units if u["label"].startswith("I.2.")))


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
                r = subprocess.run(["node", str(ROOT / "tests" / "modern_neo_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
