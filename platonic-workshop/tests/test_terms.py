"""Tests for milestone 17: key terms linked in the text, opening beside it.

    python3 -m unittest discover -s tests -v

The file tests read what is committed. The library tests need data/workshop.sqlite
(python3 tools/build_db.py); the browser test also needs Node and Playwright. Each
is skipped without what it needs.
"""
import json
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import serve  # noqa: E402
import terms  # noqa: E402

TERMS = json.loads((ROOT / "sources" / "terms" / "terms.json").read_text(encoding="utf-8"))
PAGE = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
SOURCES = {"taylor-terms", "taylor-introduction", "translation", "plato", "note",
           "plotinus-taylor-1817", "proclus-theology-taylor-1816", "iamblichus-taylor-1821"}
# The Neoplatonic vocabulary the roadmap names.
ROADMAP = ["the-one", "the-good", "intellect", "soul", "being", "forms", "demiurge", "intelligible-world", "emanation", "return"]


def has_terms():
    if not build_db.DB_PATH.exists():
        return False
    db = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    try:
        return db.execute("SELECT count(*) FROM term").fetchone()[0] > 0
    except sqlite3.OperationalError:
        return False
    finally:
        db.close()


class TermList(unittest.TestCase):
    def test_every_entry_is_well_formed(self):
        ids = [t["id"] for t in TERMS["terms"]]
        self.assertEqual(len(ids), len(set(ids)))
        for t in TERMS["terms"]:
            for x in t.get("lemmas", []):
                rule = x["rule"] if isinstance(x, dict) else "all"
                self.assertIn(rule, terms.RULES, t["id"])
            for kind, key in (("english", "form"), ("phrases", "phrase")):
                for e in t.get(kind, []):
                    self.assertTrue(e[key] and e["quote"], t["id"])
                    self.assertIn(e["source"], SOURCES, (t["id"], e))
                    if e["source"] == "translation":
                        self.assertTrue(e["edition"].startswith(e["work"] + "."), (t["id"], e))
                    self.assertIn(e[key].lower() if kind == "english" else e[key],
                                  e["quote"].lower() if kind == "english" else e["quote"], (t["id"], e[key]))
            if t.get("plain"):
                self.assertNotIn("\n", t["plain"])

    def test_the_neoplatonic_vocabulary_has_a_plain_meaning(self):
        by = {t["id"]: t for t in TERMS["terms"]}
        for i in ROADMAP:
            self.assertIn(i, by, i)
            self.assertTrue(by[i].get("plain"), i)
        self.assertTrue(all(t.get("plain") for t in TERMS["terms"] if t.get("neoplatonic")))

    def test_the_reader_has_the_panel_tabs_and_the_switch(self):
        for pane in ("word", "term", "notes", "links", "mine"):
            self.assertIn(f'data-pane="{pane}"', PAGE)
            self.assertIn(f'id="pane-{pane}"', PAGE)
        self.assertIn('data-layer="terms"', PAGE)
        self.assertLess(PAGE.index('src="concepts.js"'), PAGE.index('src="terms.js"'))
        self.assertLess(PAGE.index('src="guide.js"'), PAGE.index('src="terms.js"'))
        self.assertLess(PAGE.index('src="terms.js"'), PAGE.index('src="shell.js"'))


class Articular(unittest.TestCase):
    """The rule for a common word: neuter, with the article before it in the same case and number."""

    def tag(self, lemma, postag, form=""):
        return {"lemma": lemma, "postag": postag, "form": form}

    def test_to_hen_is_marked_and_heis_is_not(self):
        art = self.tag("ὁ", "l-s---nn-", "τὸ")
        self.assertTrue(terms.articular([art], self.tag("εἷς", "a-s---nn-")))
        self.assertTrue(terms.articular([art, self.tag("δέ", "d--------")], self.tag("εἷς", "a-s---nn-")))
        self.assertFalse(terms.articular([], self.tag("εἷς", "a-s---nn-")))
        self.assertFalse(terms.articular([self.tag("ὁ", "l-s---mn-")], self.tag("εἷς", "a-s---mn-")))   # masculine: one man
        self.assertFalse(terms.articular([self.tag("ὁ", "l-s---ng-")], self.tag("εἷς", "a-s---nn-")))   # cases differ

    def test_to_onti_in_reality_is_not_being(self):
        dat = self.tag("ὁ", "l-s---nd-", "τῷ")
        self.assertFalse(terms.articular([dat], self.tag("εἰμί", "v-sppand-"), "ὄντι", ("τῷ ὄντι",)))
        self.assertTrue(terms.articular([self.tag("ὁ", "l-s---nn-", "τὸ")], self.tag("εἰμί", "v-sppann-"), "ὄν", ("τῷ ὄντι",)))


@unittest.skipUnless(has_terms(), "run python3 tools/build_db.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.lib = serve.Library(build_db.DB_PATH, Path(cls.tmp.name) / "user.sqlite")
        cls.db = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.tmp.cleanup()

    def test_every_concept_is_a_term_and_the_roadmap_terms_are_underlined(self):
        concepts = {r[0] for r in self.db.execute("SELECT id FROM concept")}
        term_ids = {r[0]: r[1] for r in self.db.execute("SELECT id, key FROM term")}
        self.assertLessEqual(concepts, set(term_ids))
        for i in ROADMAP:
            self.assertEqual(term_ids[i], 1, i)

    def test_every_quotation_was_found(self):
        stats = json.loads(self.db.execute("SELECT value FROM build WHERE key = 'term_stats'").fetchone()[0])
        self.assertEqual(stats.get("not found", []), [])
        self.assertEqual(stats["quotations found"], stats["quotations"])
        self.assertEqual(stats["lemmas of terms.json not tagged in this build"], [])

    def test_the_one_is_only_to_hen(self):
        rows = self.db.execute("SELECT h.token_id FROM term_hit h WHERE h.term_id = 'the-one'").fetchall()
        self.assertGreater(len(rows), 100)
        for (tid,) in rows[:300]:
            prev = self.db.execute("SELECT g.lemma FROM token k JOIN tag g ON g.token_id = k.id WHERE k.id < ? AND k.id >= ? - 3 "
                                   "ORDER BY k.id DESC", (tid, tid)).fetchall()
            self.assertIn("ὁ", [p[0] for p in prev], tid)
        n_heis = self.db.execute("SELECT sum(n) FROM lemma_count WHERE lemma = 'εἷς'").fetchone()[0]
        self.assertLess(len(rows), n_heis / 2)

    def test_being_leaves_out_to_onti(self):
        n = self.db.execute("SELECT count(*) FROM term_hit h JOIN token k ON k.id = h.token_id JOIN token p ON p.id = k.id - 1 "
                            "WHERE h.term_id = 'being' AND k.form = 'ὄντι' AND p.form = 'τῷ'").fetchone()[0]
        self.assertEqual(n, 0)

    def test_the_page_says_what_to_underline(self):
        d = self.lib.page("tlg030", 509)
        good = [t["id"] for t in d["tokens"] if t["section_ref"] == "509b" and t["form"].startswith("ἀγαθ")]
        self.assertTrue(good)
        self.assertTrue(all("the-good" in d["term_tokens"][t] for t in good))
        loeb = [c for c in d["chunks"] if c["edition_id"] == "tlg030.perseus-eng2" and c["section_ref"] == "509b"]
        self.assertTrue(all("the-good" in d["chunk_terms"][c["id"]] for c in loeb))
        self.assertIn("good", d["terms"]["the-good"]["forms"])
        self.assertIn("the Good", [p[0] for p in d["phrases"]])
        # A paragraph's terms are those of the Greek beneath it, and no other.
        greek = {}
        for t in d["tokens"]:
            for x in d["term_tokens"].get(t["id"], []):
                greek.setdefault(t["section_ref"], set()).add(x)
        for c in loeb:
            self.assertLessEqual(set(d["chunk_terms"].get(c["id"], [])), greek.get("509b", set()))

    def test_the_term_tab_has_everything_it_needs(self):
        t = self.lib.term("the-good")
        self.assertTrue(t["plain"])
        self.assertIn("tlg030", t["occurrences"])
        self.assertIn("509b", [r for r, _ in t["occurrences"]["tlg030"]])
        self.assertEqual(t["words"], self.db.execute("SELECT count(*) FROM term_hit WHERE term_id = 'the-good'").fetchone()[0])
        self.assertTrue(t["concept"]["passages"] and t["concept"]["later"])
        self.assertIn("the-one", [r["id"] for r in t["related_terms"]])
        # Taylor's own explanation, where he gives one.
        i = self.lib.term("intellect")
        self.assertTrue(any(e["head"] == "Intellect" for e in i["taylor"]))
        one = self.lib.term("the-one")
        self.assertTrue(all(p["found"] for p in one["extra"]["passages"]))
        self.assertIsNone(self.lib.term("no-such-term"))

    def test_the_word_box_names_the_term(self):
        d = self.lib.page("tlg030", 509)
        tok = next(t for t in d["tokens"] if t["section_ref"] == "509b" and t["form"].startswith("ἀγαθ"))
        w = self.lib.token(tok["id"])
        self.assertIn("the-good", [x["id"] for x in w["terms"] if x["marked"]])

    def test_the_report_is_written(self):
        report = (ROOT / "reports" / "terms.md").read_text(encoding="utf-8")
        self.assertIn("# Key terms in the text", report)
        self.assertIn("| The One (`the-one`)", report)


@unittest.skipUnless(has_terms() and shutil.which("node"), "needs the library and Node")
class Browser(unittest.TestCase):
    def test_in_a_real_browser(self):
        try:
            subprocess.run(["node", "-e", "require('playwright')"], check=True, capture_output=True, timeout=60)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            self.skipTest("Playwright is not installed")
        with tempfile.TemporaryDirectory() as tmp:
            lib = serve.Library(build_db.DB_PATH, Path(tmp) / "user.sqlite")
            httpd = serve.make_server(0, library=lib)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                r = subprocess.run(["node", str(ROOT / "tests" / "terms_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
