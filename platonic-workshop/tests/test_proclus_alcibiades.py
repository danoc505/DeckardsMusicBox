"""Tests for milestone 27, session 3: Proclus' prologue to the First Alcibiades, proofread from the page images
(tools/proofread.py, sources/neoplatonists/proofread/) and put into the Workshop's modern English, checked against
Taylor's Introduction to the dialogue (tools/modern_neo.py), and shown in the reader (reader/neo.js, #neo-modern/).

    python3 -m unittest tests.test_proclus_alcibiades -v

The file tests always run; the server and browser tests need data/workshop.sqlite (python3 tools/build_db.py),
the browser test Node and Playwright too. Each is skipped without what it needs.
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
import neoplatonists  # noqa: E402
import proofread  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
TID = "proclus-alcibiades"

# Where Proclus quotes or recalls Plato, as the notes say: (paragraph, Plato's work, sections, words of the note,
# words of Proclus' proofread Greek, words of Burnet's Greek), Greek without accents.
PLATO = [
    ("Pr.1.p2", "tlg031", ["30a"], "Timaeus (30a)", "τω αριστω δραν αλλο τι πλην το καλλιστον", "τω αριστω δραν αλλο πλην το καλλιστον"),
    ("Pr.3.p2", "tlg004", ["85b"], "Phaedo (85b)", "των κυκνων ομοδουλοσ", "ομοδουλοσ τε ειναι των κυκνων"),
    ("Pr.4.p1", "tlg012", ["229e", "230a"], "Phaedrus (229e-230a)", "εμαυτον αγνοουντα", "αγνοουντα"),
    ("Pr.2.p2", "tlg024", ["98a"], "Meno (98a)", "τοισ τησ αιτιασ λογισμοισ", "αιτιασ λογισμω"),
    ("Pr.5.p3", "tlg004", ["99b"], "Phaedo (99b)", "ων ουκ ανευ", "ανευ ου"),
]


def load():
    return json.loads((MOD / f"{TID}.json").read_text(encoding="utf-8"))


class Proofreading(unittest.TestCase):
    def test_the_pages_of_the_prologue_in_order(self):
        pages = proofread.parse(TID)
        self.assertEqual(len(pages), 23)
        self.assertEqual(pages[0]["label"], "II p. 2")
        self.assertEqual(pages[-1]["label"], "II p. 46")
        nums = [int(p["label"].rsplit(" ", 1)[1]) for p in pages]
        self.assertEqual(nums, sorted(nums))
        # Cousin prints two pages of Greek, then two of his Latin: the Greek runs on from page to page.
        self.assertEqual(nums, [2] + [n for k in range(5, 46, 4) for n in (k, k + 1)])

    def test_the_rules_of_the_transcription(self):
        text = "\n".join(ln for p in proofread.parse(TID) for ln in p["lines"])
        # The ligatures are written out, ϑ is θ, and nothing is left in Latin letters.
        for bad in ("ϑ", "ȣ", "ϗ", "ς ", "ςι"):
            self.assertNotIn(bad, text.replace("ς ", "") if bad == "ς " else text)
        self.assertNotRegex(text, r"[A-Za-z]")
        self.assertIn("ΓΝΩΘΙ ΣΕΑΥΤΟΝ", text)

    def test_the_greek_reads_on_across_the_pages(self):
        g = proofread.joined(TID)
        self.assertTrue(g.startswith("ΠΡΟΚΛΟΥ ΔΙΑΔΟΧΟΥ ΕΙΣ ΤΟΝ ΠΛΑΤΩΝΟΣ ΠΡΩΤΟΝ ΑΛΚΙΒΙΑΔΗΝ. Τῶν Πλατωνικῶν διαλόγων"))
        self.assertTrue(g.endswith("τάχα ἂν τῆς τοῦ Πλάτωνος τυγχάνοιμεν διανοίας."))
        # Words broken across two pages are joined: πρω-|τίστης (pp. 2 and 5), τελειό-|τητα (pp. 6 and 9).
        for w in ("πρωτίστης", "τελειότητα τὴν αὐτὴν", "πρόγραμμα, μὴ χωρεῖν", "διαρθρώσεως, ἀλλὰ"):
            self.assertIn(w, g)
        self.assertNotIn("(*)", g)

    def test_the_corrections_are_written_and_kept_apart(self):
        d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
        mine = [c for c in d["corrections"] if c.get("proofread")]
        self.assertGreater(len(mine), 400)
        units = {p["unit"] for p in proofread.parse(TID)}
        for c in mine:
            self.assertEqual(c["text"], TID)
            self.assertIn(c["unit"], units, "a proofread correction holds for its page only")
            self.assertIn("Proofread from the page image", c["why"])
            self.assertNotEqual(c["ocr"], c["read"])
        # The common misreadings of the whole text stay as they were.
        self.assertTrue(any(c["text"] == TID and c["ocr"] == "χαὶ" and not c.get("unit") for c in d["corrections"]))

    def test_each_page_reads_as_proofread_with_its_corrections(self):
        if not all((neoplatonists.OCR_COPY / f"{s}.json.gz").exists() for s, _, _ in next(t for t in neoplatonists.TEXTS if t["id"] == TID)["ranges"]):
            self.skipTest("no OCR copy")
        corrs, problems = proofread.build(TID)
        self.assertEqual(problems, [])
        d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
        self.assertEqual([c for c in d["corrections"] if c.get("proofread")], corrs, "run python3 tools/proofread.py")
        t = next(x for x in neoplatonists.TEXTS if x["id"] == TID)
        units = {u["n"]: u for u in neoplatonists.read_ocr(t)[0]}
        for p in proofread.parse(TID):
            u = units[p["unit"]]
            here = [c for c in d["corrections"] if c["text"] == TID and c.get("unit") in (None, u["n"])]
            # The page's own corrections first, as the build applies them in the file's order: the line corrections
            # come after the word ones, so check the line corrections on the OCR as received.
            got, _ = neoplatonists.apply_corrections(u["text"], [c for c in here if c.get("proofread")])
            self.assertEqual(got.split("\n")[:len(p["lines"])], p["lines"], p["label"])

    def test_the_alignment_joins_stray_lines(self):
        ocr = ["ΒΞ ΤΠ wo", "τῶν ἀλόγων εἰδῶν", "/ ». M B / Ne", "καὶ οἰόμεθα", "(*) A. deest"]
        page = ["τῶν ἀλόγων εἰδῶν", "καὶ οἰόμεθα"]
        gs = proofread.groups(ocr, page)
        self.assertEqual(gs, [([0, 1, 2], [0]), ([3], [1])])   # the note at the foot is left alone


class ModernEnglish(unittest.TestCase):
    def test_labelled_as_the_workshops_own_machine_assisted_from_the_proofread_greek(self):
        d = load()
        self.assertEqual((d["by"], d["machine_assisted"], d["made_from"], d["kind"]), ("Workshop modern version", True, "greek", "proofread"))
        self.assertIn("not yet checked by a scholar", d["label"])
        self.assertIn("proofread from the page images", d["label"])
        self.assertEqual(d["greek_text"], TID)

    def test_the_prologue_whole_in_ten_sections(self):
        d = load()
        self.assertEqual([c["id"] for c in d["chapters"]], [f"Pr.{n}" for n in range(1, 11)])
        for c in d["treatises"] + d["chapters"]:
            self.assertGreater(len(c["summary"].split()), 15, c["id"])
        # The paragraphs hold all the proofread Greek, in order, after the title.
        g = proofread.joined(TID)
        joined = " ".join(p["greek"] for p in d["paragraphs"])
        self.assertEqual(g, "ΠΡΟΚΛΟΥ ΔΙΑΔΟΧΟΥ ΕΙΣ ΤΟΝ ΠΛΑΤΩΝΟΣ ΠΡΩΤΟΝ ΑΛΚΙΒΙΑΔΗΝ. " + joined)
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"].strip() and p["pages"], p["seg"])

    def test_no_problems_and_the_json_is_up_to_date(self):
        d, problems = modern_neo.build(TID)
        self.assertEqual(problems, [])
        self.assertEqual(load(), json.loads(json.dumps(d, ensure_ascii=False)), "run python3 tools/modern_neo.py")

    def test_flags_quote_taylors_introduction(self):
        tay = modern_neo.taylor_intro_alcibiades()
        d = load()
        chs = {c["id"]: c for c in d["chapters"]}
        n = 0
        for p in d["paragraphs"]:
            for f in p.get("flags", []):
                n += 1
                here = " ".join(tay[x["n"]] for x in chs[p["chapter"]]["taylor"])
                self.assertIn(modern_neo.norm(f["taylor"]), here, p["seg"])
        self.assertGreaterEqual(n, 15)
        # Taylor's paragraphs 2 to 6 and 8 are drawn from the prologue; 7 (Socrates' love) from later in the commentary.
        used = {x["n"] for c in d["chapters"] for x in c["taylor"]}
        self.assertEqual(used, {2, 3, 4, 5, 6, 8})

    def test_it_follows_the_greek_where_taylor_differs(self):
        p = {x["seg"]: x for x in load()["paragraphs"]}
        self.assertIn("ἁγιωτέρας", p["Pr.1.p2"]["greek"])
        self.assertIn("older and holier", p["Pr.1.p2"]["modern"])
        self.assertNotIn("unity", p["Pr.1.p2"]["modern"])
        self.assertNotIn("ineffable", p["Pr.1.p2"]["modern"])
        self.assertIn("παρά τισιν", p["Pr.6.p2"]["greek"])
        self.assertIn("what some call", p["Pr.6.p2"]["modern"])
        self.assertNotIn("rhetorician", p["Pr.6.p2"]["modern"])
        # Iamblichus' three parts.
        self.assertIn("These, then, are the three parts of this dialogue.", p["Pr.9.p2"]["modern"])
        text = " ".join(x["modern"] for x in p.values()).lower()
        for old in ("energ", "essence", "subsist", "physiolog", "felicity"):
            self.assertNotIn(old, text)

    def test_sentences_can_be_marked(self):
        with tempfile.TemporaryDirectory() as tmp:
            lib = sqlite3.connect(":memory:")
            lib.execute("CREATE TABLE work (id TEXT, urn TEXT, title TEXT)")
            mine = mywork.MyWork(Path(tmp) / "user.sqlite", lib)
            p = load()["paragraphs"][0]
            s = modern.sentences(p["modern"])[1]
            r = mine.add_modern_mark({"text": TID, "para": p["seg"], "sentence": s, "kind": "seems wrong"})
            self.assertEqual(r["marks"][0]["para"], "Pr.1.p1")

    def test_small_enough_for_the_website(self):
        self.assertLess((MOD / f"{TID}.json").stat().st_size, 2_000_000)


def has_library():
    return build_db.DB_PATH.exists()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class PlatosPlaces(unittest.TestCase):
    def test_the_notes_name_the_places_proclus_recalls(self):
        db = sqlite3.connect(build_db.DB_PATH)
        paras = {p["seg"]: p for p in load()["paragraphs"]}
        for seg, work, refs, note, mine, plato in PLATO:
            self.assertIn(mine, modern_neo.fold(paras[seg]["greek"]), seg)
            text = " ".join(r[0] for r in db.execute(
                f"SELECT text FROM chunk WHERE work_id = ? AND edition_id LIKE '%grc%' AND section_ref IN ({','.join('?' * len(refs))})", (work, *refs)))
            self.assertIn(plato, modern_neo.fold(text), f"{seg}: {work} {refs}")
            self.assertTrue(any(note in n for n in paras[seg].get("notes", [])), f"{seg}: a note names {note}")
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

    def test_the_modern_english_with_its_pages(self):
        d = self.get(f"modern-neo/{TID}")
        self.assertEqual(d["marks"], [])
        self.assertEqual(d["greek_info"]["editor"], "Victor Cousin")
        pg = d["paragraphs"][0]["pages"][0]
        self.assertEqual((pg["label"], pg["part"]), ("II p. 2", 0))
        self.assertTrue(pg["scan"].startswith("https://archive.org/details/"))
        with self.assertRaises(urllib.error.HTTPError):
            self.get("modern-neo/plotinus")      # Plotinus is read beside Taylor's chapters, not here

    def test_the_shelf_and_the_scan_link_to_it(self):
        t = next(t for t in self.get("neo")["texts"] if t["id"] == TID)
        self.assertEqual((t["modern"]["text"], t["modern"]["pages"]), (TID, 23))
        part = self.get(f"neo/{TID}/0")
        u = next(u for u in part["units"] if u["label"] == "II p. 2")
        self.assertEqual(u["modern_section"], {"text": TID, "id": "Pr.1"})
        self.assertIn("Τῶν Πλατωνικῶν διαλόγων", u["corrected"])
        self.assertTrue(any(c["unit_n"] == u["n"] and c["applied"] == 1 for c in part["corrections"]))


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
                r = subprocess.run(["node", str(ROOT / "tests" / "proclus_alcibiades_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
