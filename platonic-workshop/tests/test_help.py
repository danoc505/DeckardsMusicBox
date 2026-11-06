"""Tests for milestone 16: plain words and help everywhere.

    python3 -m unittest discover -s tests -v

The file tests read what is committed. The server test needs data/workshop.sqlite
(python3 tools/build_db.py) and is skipped without it.
"""
import json
import re
import sys
import threading
import unittest
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import serve  # noqa: E402

WORDS = json.loads((ROOT / "sources" / "structure" / "workshop-words.json").read_text(encoding="utf-8"))
CHECKS = json.loads((ROOT / "sources" / "structure" / "workshop-words-checks.json").read_text(encoding="utf-8"))
MANIFEST = {m["id"]: m for m in json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]}
HELP_JS = (ROOT / "reader" / "help.js").read_text(encoding="utf-8")
PAGE = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
READER_JS = "".join(p.read_text(encoding="utf-8") for p in sorted((ROOT / "reader").glob("*.js")))

# The views of the Workshop (shell.js's routes and reader.js's) and the panels of a page.
VIEWS = {"start", "library", "read", "whole", "corpus", "commentaries", "dossiers", "discussed", "dictionary", "concordance",
         "renderings", "concepts", "glossary", "words", "taylor", "reconcile", "find", "mine"}
PANELS = {"word", "dict", "gloss", "translations", "commentary", "links", "mywork", "contents", "show", "listen", "select"}


def norm(s):
    s = unicodedata.normalize("NFC", s).replace("ſ", "s")
    s = s.translate(str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-"}))
    return re.sub(r"\s+", " ", s).strip().lower()


class Words(unittest.TestCase):
    def test_every_word_has_a_plain_explanation_and_a_quoted_source(self):
        ids = [w["id"] for w in WORDS["words"]]
        self.assertEqual(len(ids), len(set(ids)))
        for w in WORDS["words"]:
            self.assertTrue(w["term"] and w["plain"] and w["sources"], w["id"])
            for s in w["sources"]:
                self.assertTrue(s["quote"], w["id"])
                self.assertEqual(sum(bool(s.get(k)) for k in ("file", "manifest", "url")), 1, (w["id"], s))

    def test_quotations_of_files_are_in_the_files(self):
        for w in WORDS["words"]:
            for s in w["sources"]:
                if s.get("file"):
                    text = norm((ROOT / s["file"]).read_text(encoding="utf-8"))
                    if s["file"].endswith(".json"):   # quotations inside JSON strings
                        text += " " + norm(json.dumps(json.loads((ROOT / s["file"]).read_text(encoding="utf-8")), ensure_ascii=False))
                    self.assertIn(norm(s["quote"]), text, (w["id"], s["file"]))

    def test_quotations_of_the_manifest_are_in_its_records(self):
        for w in WORDS["words"]:
            for s in w["sources"]:
                if s.get("manifest"):
                    m = MANIFEST[s["manifest"]]
                    self.assertIn(s["quote"], m["title"] + " " + m.get("provenance", "") + " " + m.get("licence", ""), w["id"])

    def test_quotations_of_web_pages_were_found_there(self):
        for w in WORDS["words"]:
            for s in w["sources"]:
                if s.get("url"):
                    self.assertIn(s["url"], CHECKS["pages"], "run python3 tools/webcheck.py --words")
                    self.assertIs(CHECKS["pages"][s["url"]]["quotes"].get(s["quote"]), True, (w["id"], s["quote"]))

    def test_the_words_the_roadmap_names_are_there(self):
        ids = {w["id"] for w in WORDS["words"]}
        for x in ["stephanus", "burnet", "loeb", "lsj", "middle-liddell", "glaux", "morpheus", "skopos", "scholia", "tetralogy", "ocr", "approx"]:
            self.assertIn(x, ids)


class Help(unittest.TestCase):
    def test_every_view_and_panel_has_two_sentences_of_help(self):
        self.assertEqual(VIEWS | PANELS, set(WORDS["help"]))
        ids = {w["id"] for w in WORDS["words"]}
        for k, h in WORDS["help"].items():
            self.assertTrue(h["title"] and h["what"] and h["tap"], k)
            self.assertLessEqual(set(h["words"]), ids, k)

    def test_every_help_key_is_reachable(self):
        for k in VIEWS:
            self.assertIn(f'"{k}"', HELP_JS.split("function helpKey")[1].split("async function")[0], f"helpKey() never returns {k}")
        for k in PANELS:
            self.assertTrue(f'data-help="{k}"' in PAGE or f'"{k}"]' in HELP_JS or f'helpQ("{k}")' in READER_JS, f"no ? opens {k}")

    def test_the_page_has_help_and_contents_buttons(self):
        self.assertIn('id="help-btn"', PAGE)
        self.assertIn('id="help-dialog"', PAGE)
        self.assertIn('id="toc-btn"', PAGE)
        self.assertLess(PAGE.index('src="shell.js"'), PAGE.index('src="help.js"'))

    def test_jargon_is_renamed_with_the_scholarly_name_kept_on_hover(self):
        # The roadmap's renames: lemma, parse, layers, Stephanus.
        self.assertNotIn(">Every possible parse<", READER_JS)
        self.assertNotIn("Mark untagged words", PAGE)
        self.assertIn("Every possible grammar", READER_JS)
        self.assertIn('title="Scholars: every possible parse"', READER_JS)
        self.assertIn('title="Dictionary form (scholars: lemma)"', READER_JS)
        self.assertIn('aria-label="Show"', PAGE)
        self.assertIn("(scholars: layers)", PAGE)
        self.assertIn("1578", PAGE)   # Stephanus explained on hover in the reference box


@unittest.skipUnless(build_db.DB_PATH.exists(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import tempfile
        cls.tmp = tempfile.TemporaryDirectory()
        lib = serve.Library(build_db.DB_PATH, Path(cls.tmp.name) / "user.sqlite")
        cls.httpd = serve.make_server(0, library=lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def test_words(self):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/words") as r:
            d = json.loads(r.read())
        st = next(w for w in d["words"] if w["id"] == "stephanus")
        self.assertTrue(all(s["found"] for s in st["sources"]))
        b = next(w for w in d["words"] if w["id"] == "burnet")
        self.assertIn("Burnet", b["sources"][0]["cited"])


if __name__ == "__main__":
    unittest.main()
