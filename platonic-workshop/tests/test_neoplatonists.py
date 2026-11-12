"""Tests for milestone 25: the rest of the Neoplatonists, read whole (tools/neoplatonists.py,
GET /api/neo and /api/neo/<text>/<part>, reader/neo.js).

    python3 -m unittest tests.test_neoplatonists -v

The rules (page numbers, specks, corrections) always run. Reading the editions needs the
sources (python3 tools/fetch_sources.py); the server tests need data/workshop.sqlite
(python3 tools/build_db.py); the browser test also needs Node and Playwright. Each is
skipped without what it needs.
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
import neoplatonists as neo  # noqa: E402

ROADMAP_TEXTS = {"plotinus-enneads", "proclus-alcibiades", "proclus-republic", "proclus-parmenides", "proclus-cratylus",
                 "proclus-elements", "damascius-principles", "hermias-phaedrus", "olympiodorus-alcibiades"}


class Rules(unittest.TestCase):
    def test_page_numbers_need_three_agreeing_heads(self):
        # Ten pages printed 41 to 50; the OCR reads five heads, one wrongly, and a footnote number.
        cands = [{41}, set(), {43, 7}, set(), {45}, {99}, set(), {48}, set(), set()]
        got = neo.number_pages(cands)
        self.assertEqual(got[0], (41, "read"))
        self.assertEqual(got[1], (42, "counted"))
        self.assertEqual(got[2], (43, "read"))
        self.assertEqual(got[5], (46, "counted"))       # the misread 99 is outvoted
        self.assertEqual(got[7], (48, "read"))
        self.assertEqual([g[0] for g in got], list(range(41, 51)))
        self.assertEqual(got[9][1], "counted")
        # Two numbers are not enough to believe.
        self.assertEqual(neo.number_pages([{12}, set(), {14}]), [(None, None)] * 3)

    def test_page_candidates_with_and_without_a_running_head(self):
        lines = ["( 45 )", "ΠΡΟΚΛΟΥ ΔΙΑΔΟΧΟΥ", "ὅτι μὲν οὖν", "καὶ τὰ λοιπά", "ἔτι δὲ", "τὸ ἓν", "ἐστιν", "[ 12 ]", "3"]
        self.assertEqual(neo.page_candidates(lines, r"\(\s*([0-9oO]{1,3})\s*[.,]?\s*[)}J]"), {45})
        self.assertIn(3, neo.page_candidates(lines))
        self.assertNotIn(12, neo.page_candidates(lines))   # numbers in square brackets are the other edition's

    def test_specks_are_hidden_and_put_back(self):
        self.assertTrue(neo.is_noise("· ' , ."))
        self.assertTrue(neo.is_noise("ἡ ' ."))
        self.assertFalse(neo.is_noise("καὶ τὸ ἀγαθόν"))
        u = {"lines": ["ὅτι μὲν οὖν", ". ' ,", "τὸ ἓν ἐστιν", "ι"]}
        shown = "\n".join(ln for ln in u["lines"] if not neo.is_noise(ln))
        self.assertEqual(shown, "ὅτι μὲν οὖν\nτὸ ἓν ἐστιν")
        self.assertEqual(neo.as_received(shown, neo.specks(u)), "\n".join(u["lines"]))
        self.assertEqual(neo.as_received("α β", None), "α β")

    def test_corrections_replace_whole_words_only(self):
        text = "χαὶ τὸ ἓν χαὶ\nχαὶρω xai"
        got, used = neo.apply_corrections(text, [{"ocr": "χαὶ", "read": "καὶ"}, {"ocr": "xai", "read": "καὶ"}])
        self.assertEqual(got, "καὶ τὸ ἓν καὶ\nχαὶρω καὶ")
        self.assertEqual(used, [("χαὶ", "καὶ", 2), ("xai", "καὶ", 1)])

    def test_the_corrections_file(self):
        d = json.loads(neo.CORRECTIONS.read_text(encoding="utf-8"))
        self.assertIn("never in the text", d["_about"])
        ids = {t["id"] for t in neo.TEXTS}
        for c in d["corrections"]:
            self.assertIn(c["text"], ids)
            # A page the scan lost (a blank leaf) is supplied whole from another scan: its OCR is empty, and it says so.
            self.assertTrue((c["ocr"] or c["why"].startswith("Supplied")) and c["read"] and c["why"].strip(), c)
            self.assertNotEqual(c["ocr"], c["read"])
            self.assertEqual([t for t in neo.TEXTS if t["id"] == c["text"]][0]["kind"], "ocr", "corrections are for the OCR")

    def test_every_text_names_its_edition_and_source(self):
        manifest = {s["id"]: s for s in json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]}
        self.assertTrue(ROADMAP_TEXTS <= {t["id"] for t in neo.TEXTS})
        self.assertTrue({t["group"] for t in neo.TEXTS} >= {"Plotinus", "Proclus", "Iamblichus", "Damascius"})
        for t in neo.TEXTS:
            self.assertTrue(t["edition"] and t["editor"] and t["year"] and t["about"], t["id"])
            srcs = [t["source"]] if t["kind"] == "tei" else [s for s, _, _ in t["ranges"]]
            for s in srcs:
                m = manifest[s]
                self.assertEqual(m["layer"], "neoplatonist")
                self.assertTrue(m["licence"].strip() and m["provenance"].strip(), s)
                self.assertTrue(int(t["year"]) < 1930 or "Creative Commons" in m["licence"], (s, t["year"]))
                if m["kind"] == "archive":
                    self.assertRegex(m["sha256"], r"^[0-9a-f]{64}$")
                    self.assertIn("public domain", m["licence"].lower())
        # What is not here says why.
        for what, why in neo.NOT_HERE:
            self.assertTrue(what and len(why) > 20)
        self.assertTrue(any("Gorgias" in w for w, _ in neo.NOT_HERE))
        self.assertTrue(any("Phaedo" in w for w, _ in neo.NOT_HERE))


class CommittedOCR(unittest.TestCase):
    def test_a_copy_of_every_scan_read(self):
        for src in neo.scan_ranges():
            pages = neo.scan_pages(src)          # refuses a copy of another download
            self.assertTrue(any(pages), src)

    @unittest.skipUnless(all((neo.RAW / s / "djvu.xml").exists() for s in neo.scan_ranges()), "python3 tools/fetch_sources.py --archive")
    def test_the_copy_is_the_download(self):
        import gzip
        import hashlib
        for src in neo.scan_ranges():
            self.assertEqual(hashlib.sha256((neo.RAW / src / "djvu.xml").read_bytes()).hexdigest(), neo.manifest_sha(src))
            got = json.loads(gzip.decompress((neo.OCR_COPY / f"{src}.json.gz").read_bytes()))
            self.assertEqual(got, json.loads(json.dumps(neo.extract(src), ensure_ascii=False)), f"{src}: run tools/neoplatonists.py --extract")


@unittest.skipUnless(neo.available(), "run python3 tools/fetch_sources.py first")
class Editions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.read = {t["id"]: (t, u, p) for t, u, p in neo.read_all()}

    def test_every_text_is_read_whole(self):
        least = {"plotinus-enneads": 200_000, "proclus-republic": 150_000, "proclus-parmenides": 150_000, "proclus-alcibiades": 50_000,
                 "iamblichus-mysteries": 40_000, "damascius-principles": 80_000, "hermias-phaedrus": 50_000}
        for tid, (t, units, parts) in self.read.items():
            n = sum(neo.words(u["text"]) for u in units)
            self.assertGreater(n, least.get(tid, 5_000), tid)
            self.assertTrue(parts, tid)
            self.assertEqual(sum(len(p["units"]) for p in parts), len(units), tid)

    def test_plotinus_by_ennead_treatise_and_chapter(self):
        t, units, parts = self.read["plotinus-enneads"]
        self.assertEqual(len(parts), 54)
        self.assertEqual(units[0]["label"], "I.1.1")
        self.assertTrue(any(u["label"].startswith("VI.9.") for u in units))

    def test_the_scans_have_the_editions_page_numbers(self):
        t, units, parts = self.read["proclus-parmenides"]
        read = [u for u in units if u["page_how"] == "read"]
        self.assertGreater(len(read), len(units) / 3)
        self.assertTrue(all(u["label"].startswith(("IV ", "V ", "VI ")) for u in units))
        # Pages counted are always between or next to pages read, so a page's number never runs backwards in a volume.
        for a, b in zip(units, units[1:]):
            if a["page"] and b["page"] and a["source"] == b["source"]:
                self.assertGreater(b["page"], a["page"], (a["n"], b["n"]))

    def test_latin_pages_are_marked(self):
        t, units, parts = self.read["proclus-elements"]
        self.assertTrue(any(u["lang"] == "lat" for u in units))
        self.assertTrue(any(u["lang"] == "grc" for u in units))


def has_library():
    return build_db.DB_PATH.exists()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import serve
        cls.tmp = tempfile.TemporaryDirectory()
        cls.lib = serve.Library(user_path=Path(cls.tmp.name) / "user.sqlite")
        if not cls.lib.has_neo():
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

    def test_the_shelf(self):
        d = self.get("neo")
        ids = [t["id"] for t in d["texts"]]
        self.assertEqual(ids, [t["id"] for t in neo.TEXTS])
        for t in d["texts"]:
            self.assertTrue(t["sources"], t["id"])
            self.assertTrue(all(s["licence"] for s in t["sources"]))
            self.assertEqual(len(t["parts"]), t["n_parts"])
        self.assertTrue(d["stats"]["not_here"])
        self.assertGreater(d["stats"]["words"], 1_000_000)

    def test_a_scanned_part_as_received_with_its_corrections(self):
        p = self.get("neo/hermias-phaedrus/3")
        self.assertEqual(p["text"]["kind"], "ocr")
        self.assertEqual(p["prev"]["seq"], 2)
        u = p["units"][0]
        self.assertTrue(u["scan"].startswith("https://archive.org/details/"))
        for u in p["units"]:
            self.assertGreaterEqual(len(u["raw"].split("\n")), len(u["text"].split("\n")) if u["text"] else 0)
            self.assertEqual(len(u["raw"].split("\n")) - (len(u["text"].split("\n")) if u["text"] else 0), u["hidden"])
        self.assertTrue(any(c["ocr"] == "χαὶ" for c in p["corrections"]))
        changed = [u for u in p["units"] if u["corrected"]]
        self.assertTrue(changed)
        self.assertIn("χαὶ", changed[0]["text"])              # the text shown is the OCR, as received
        self.assertNotIn("χαὶ", changed[0]["corrected"])

    def test_a_corrected_text_part(self):
        p = self.get("neo/plotinus-enneads/0")
        self.assertIsNone(p["prev"])
        self.assertEqual(p["next"]["seq"], 1)
        self.assertEqual(p["units"][0]["label"], "I.1.1")
        self.assertNotIn("scan", p["units"][0])
        last = self.get("neo/plotinus-enneads/53")
        self.assertIsNone(last["next"])
        with self.assertRaises(urllib.error.HTTPError) as e:
            self.get("neo/plotinus-enneads/54")
        self.assertEqual(e.exception.code, 404)
        with self.assertRaises(urllib.error.HTTPError) as e:
            self.get("neo/nobody/0")
        self.assertEqual(e.exception.code, 404)

    def test_a_neoplatonists_word_has_a_meaning(self):
        import gloss
        self.assertTrue(self.lib.one("SELECT 1 AS x FROM gloss_form WHERE form = 'ὑποστάσεων'") or
                        self.lib.one("SELECT 1 AS x FROM token WHERE form = 'ὑποστάσεων'"))
        self.assertTrue(gloss.gloss(self.lib, "ὑποστάσεων")["lemmas"])


class Reader(unittest.TestCase):
    def test_the_reader_loads_it(self):
        page = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        self.assertIn('<script src="neo.js"></script>', page)
        self.assertLess(page.index("neo.js"), page.index("shell.js"))
        shell = (ROOT / "reader" / "shell.js").read_text(encoding="utf-8")
        self.assertIn("showNeo(", shell)
        self.assertIn("neoShelf()", shell)


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
            if not lib.has_neo():
                self.skipTest("the library was built without the Neoplatonists")
            httpd = serve.make_server(port=0, library=lib)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                r = subprocess.run(["node", str(ROOT / "tests" / "neo_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
