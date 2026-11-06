"""Tests for milestone 23: the Greek New Testament.

    python3 -m unittest discover -s tests -v

The source tests need tools/fetch_sources.py to have been run; the library tests
need data/workshop.sqlite built with the New Testament (python3 tools/build_db.py).
Each is skipped without what it needs.
"""
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import greek  # noqa: E402
import mywork  # noqa: E402
import nt  # noqa: E402
import serve  # noqa: E402

HAVE_SOURCE = (nt.RAW / "61-Mt-morphgnt.txt").exists()
PAGE = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")


def has_nt():
    if not build_db.DB_PATH.exists():
        return False
    db = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    try:
        return db.execute("SELECT count(*) FROM work WHERE corpus = 'nt'").fetchone()[0] == 27
    except sqlite3.OperationalError:
        return False
    finally:
        db.close()


class Tags(unittest.TestCase):
    def test_morphgnt_codes_become_the_tag_the_reader_decodes(self):
        self.assertEqual(nt.postag("V-", "3AAI-S--"), "v3saia---")
        self.assertEqual(nt.postag("N-", "----NSF-"), "n-s---fn-")
        self.assertEqual(nt.postag("RA", "----GSM-"), "l-s---mg-")
        self.assertEqual(nt.postag("A-", "----NSMC"), "a-s---mnc")
        self.assertEqual(nt.postag("V-", "-PAN----"), "v--pna---")
        self.assertEqual(nt.postag("V-", "-XAPNSM-"), "v-srpamn-")
        self.assertEqual(dict(greek.decode_postag(nt.postag("V-", "2AAD-P--"))),
                         {"part of speech": "verb", "person": "2nd person", "number": "plural", "tense": "aorist",
                          "mood": "imperative", "voice": "active"})

    def test_every_book_is_named_once(self):
        self.assertEqual(len(nt.BOOKS), 27)
        self.assertEqual(len({nt.slug(b[2]) for b in nt.BOOKS}), 27)
        self.assertEqual(nt.slug("1 Corinthians"), "1-corinthians")

    def test_the_asv_is_kept_as_received(self):
        import hashlib
        f = json.loads((ROOT / "sources" / "asv-1901" / "fetched.json").read_text(encoding="utf-8"))
        self.assertEqual(hashlib.sha256(nt.ASV.read_bytes()).hexdigest(), f["kept_sha256"])
        asv = nt.read_asv()
        self.assertEqual(asv["JOH"][(1, 1)], "In the beginning was the Word, and the Word was with God, and the Word was God.")
        self.assertEqual(asv["MAT"][(17, 21)], "")

    def test_licences_are_quoted(self):
        m = {s["id"]: s for s in json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]}
        self.assertIn("CC BY 4.0", m["morphgnt-sblgnt"]["licence"])
        self.assertIn("CC BY-SA 3.0", m["morphgnt-sblgnt"]["licence"])
        self.assertIn("Public domain", m["asv-1901"]["licence"])

    def test_the_reader_loads_the_new_testament(self):
        self.assertIn('<script src="nt.js"></script>', PAGE)


@unittest.skipUnless(HAVE_SOURCE, "run tools/fetch_sources.py first")
class Source(unittest.TestCase):
    def test_john_opens_with_the_word(self):
        verses = nt.read_morphgnt("64-Jn")
        c, v, words = verses[0]
        self.assertEqual((c, v), (1, 1))
        text, spans = nt.greek_verse(words)
        self.assertTrue(text.startswith("Ἐν ἀρχῇ ἦν ὁ λόγος"))
        self.assertEqual([text[a:b] for a, b in spans][:5], ["Ἐν", "ἀρχῇ", "ἦν", "ὁ", "λόγος"])
        self.assertEqual(words[4]["lemma"], "λόγος")

    def test_apparatus_marks_are_left_out(self):
        for code, *_ in nt.BOOKS:
            for c, v, words in nt.read_morphgnt(code):
                text, _ = nt.greek_verse(words)
                self.assertFalse(nt.APPARATUS.search(text), (code, c, v))


@unittest.skipUnless(has_nt(), "build the library with the New Testament first (python3 tools/build_db.py)")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.lib = serve.Library(build_db.DB_PATH, Path(cls.tmp.name) / "user.sqlite")

    @classmethod
    def tearDownClass(cls):
        cls.lib.db.close()
        cls.tmp.cleanup()

    def test_27_books_on_their_own_shelf(self):
        works = self.lib.works()
        books = [w for w in works if w["corpus"] == "nt"]
        self.assertEqual(len(books), 27)
        self.assertEqual(len([w for w in works if w["corpus"] == "plato"]), 36)
        self.assertEqual(books[3]["slug"], "john")
        self.assertEqual(books[3]["first_ref"], "1:1")
        shelf = self.lib.nt()
        self.assertEqual([b["title"] for b in shelf["books"]][:4], ["Matthew", "Mark", "Luke", "John"])
        self.assertGreater(shelf["stats"]["words"], 137000)

    def test_a_chapter_is_a_page_with_greek_and_english(self):
        p = self.lib.page("nt04", 1)
        self.assertEqual(p["sections"][0]["ref"], "1:1")
        grc = [c for c in p["chunks"] if c["lang"] == "grc" and c["section_ref"] == "1:1"][0]
        eng = [c for c in p["chunks"] if c["lang"] == "eng" and c["section_ref"] == "1:1"][0]
        self.assertTrue(grc["text"].startswith("Ἐν ἀρχῇ ἦν ὁ λόγος"))
        self.assertTrue(eng["text"].startswith("In the beginning was the Word"))
        self.assertEqual((p["prev"], p["next"]), (None, 2))
        self.assertEqual(p["phrases"], [], "Plato's fixed phrases are not marked in the New Testament")
        # The verses only the ASV has (John 7:53 to 8:11) are there, with no Greek.
        p8 = self.lib.page("nt04", 8)
        self.assertIn("8:1", [s["ref"] for s in p8["sections"]])
        self.assertFalse([c for c in p8["chunks"] if c["lang"] == "grc" and c["section_ref"] == "8:1"])

    def test_the_word_box(self):
        p = self.lib.page("nt04", 1)
        logos = next(t for t in p["tokens"] if t["form"] == "λόγος")
        t = self.lib.token(logos["id"])
        self.assertEqual(t["corpus"], "nt")
        self.assertEqual(t["tags"][0]["lemma"], "λόγος")
        self.assertEqual(t["tags"][0]["source_id"], "morphgnt-sblgnt")
        feats = dict(t["tags"][0]["features"])
        self.assertEqual((feats["part of speech"], feats["case"], feats["number"]), ("noun", "nominative", "singular"))
        self.assertTrue(t["lookup"][0]["entries"]["lsj"], "LSJ's entry for λόγος")
        self.assertTrue(t["morph"], "Morpheus's every possible grammar")
        self.assertGreater(t["elsewhere_nt"][0]["total"], 300)
        self.assertGreater(t["elsewhere"][0]["total"], 1000, "λόγος in Plato, the other corpus")
        self.assertTrue(t["address"].startswith("urn:cts:greekLit:tlg0031.tlg004:1.1@λόγος"))
        # A relative pronoun is named as MorphGNT names it.
        rel = next(x for x in p["tokens"] if x["section_ref"] == "1:3" and x["form"] == "ὃ")
        self.assertEqual(dict(self.lib.token(rel["id"])["tags"][0]["features"])["part of speech"], "relative pronoun")

    def test_a_word_of_plato_shows_the_new_testament(self):
        p = self.lib.page("tlg031", 29)
        tok = next(t for t in p["tokens"] if t["form"] == "ἀγαθὸς")
        t = self.lib.token(tok["id"])
        self.assertEqual(t["corpus"], "plato")
        self.assertGreater(t["elsewhere_nt"][0]["total"], 50)

    def test_search_keeps_the_corpora_apart(self):
        old = self.lib.search.search("λόγος", "lemma")
        new = self.lib.search.search("λόγος", "lemma", corpus="nt")
        self.assertTrue(all(c["work_id"].startswith("tlg") for c in old["counts"]))
        self.assertTrue(all(h["work_id"].startswith("tlg") for h in old["hits"]))
        self.assertEqual(len(new["counts"]), self.lib.db.execute("SELECT count(*) FROM nt_lemma_count WHERE lemma = 'λόγος'").fetchone()[0])
        self.assertGreater(len(new["counts"]), 20)
        self.assertTrue(all(c["work_id"].startswith("nt") for c in new["counts"]))
        self.assertTrue(all(h["work_id"].startswith("nt") for h in new["hits"]))
        self.assertEqual(new["hits"][0]["title"], "Matthew")
        self.assertIn("Λόγος", self.lib.search.search("λογος", "plain", corpus="nt")["chosen"])
        self.assertIn("λόγος", [x["term"] for x in self.lib.search.suggest("λογ", corpus="nt")["lemmas"]])

    def test_plato_is_counted_as_before(self):
        db = self.lib.db
        self.assertEqual(db.execute("SELECT count(*) FROM lemma_count WHERE work_id LIKE 'nt%'").fetchone()[0], 0)
        self.assertEqual(db.execute("SELECT count(*) FROM term_hit WHERE work_id LIKE 'nt%'").fetchone()[0], 0)
        self.assertEqual(self.lib.terms()["stats"]["words marked (key terms)"],
                         db.execute("SELECT count(*) FROM term_hit h JOIN term t ON t.id = h.term_id WHERE t.key = 1").fetchone()[0])

    def test_key_terms_are_marked_and_the_term_tab_shows_them(self):
        p = self.lib.page("nt04", 1)
        logos = next(t for t in p["tokens"] if t["form"] == "λόγος")
        self.assertIn(str(logos["id"]), {str(k) for k in p["term_tokens"]})
        term_id = p["term_tokens"].get(logos["id"]) or p["term_tokens"].get(str(logos["id"]))
        t = self.lib.term(term_id[0])
        self.assertGreater(t["nt"]["words"], 100)
        self.assertIn("nt04", t["nt"]["occurrences"])
        self.assertTrue(all(w.startswith("tlg") for w in t["occurrences"]), "the Plato list stays Plato's")

    def test_your_translation_of_a_verse(self):
        mw = mywork.MyWork(Path(self.tmp.name) / "mine.sqlite", self.lib.db)
        t = mw.create({"table": "translation", "work": "nt04", "start_ref": "1:1", "word_start": 1, "end_ref": "1:1", "word_end": 5,
                       "body": "In the beginning was the Reason"})
        self.assertEqual(t["words"], "Ἐν ἀρχῇ ἦν ὁ λόγος")
        rows = mw.rows_for_sections("nt04", ["1:1", "1:2"])
        self.assertEqual([r["id"] for r in rows], [t["id"]])


if __name__ == "__main__":
    unittest.main()
