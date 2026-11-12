"""Tests for Aristotle milestone A1: the Metaphysics and the Nicomachean Ethics (tools/aristotle.py,
tools/aristotle_ocr.py, reader/aristotle.js).

    python3 -m unittest discover -s tests -v

The source tests need tools/fetch_sources.py to have been run; the library tests need
data/workshop.sqlite built with Aristotle (python3 tools/build_db.py). Each is skipped without them.
"""
import json
import re
import sqlite3
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import aristotle  # noqa: E402
import aristotle_ocr  # noqa: E402
import build_db  # noqa: E402
import serve  # noqa: E402

PAGE = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
MANIFEST = {s["id"]: s for s in json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]}
TEXTS = ROOT / "texts" / "aristotle" / "metaphysics"


def has_aristotle():
    if not build_db.DB_PATH.exists():
        return False
    db = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    try:
        return db.execute("SELECT count(*) FROM work WHERE corpus = 'aristotle' AND imported = 1").fetchone()[0] == len(aristotle.WORKS)
    except sqlite3.OperationalError:
        return False
    finally:
        db.close()


class Sources(unittest.TestCase):
    def test_every_source_is_public_domain_or_free_and_quoted(self):
        for sid in ("perseus-greek-aristotle", "perseus-english-aristotle", "glaux-aristotle", "ia-ross-metaphysics-1908",
                    "ia-taylor-metaphysics-1801", "chase-1847"):
            self.assertIn(sid, MANIFEST)
            self.assertTrue(MANIFEST[sid]["licence"])
        self.assertIn("Public domain", MANIFEST["ia-ross-metaphysics-1908"]["licence"])
        self.assertIn("Public domain", MANIFEST["ia-taylor-metaphysics-1801"]["licence"])
        self.assertIn("CC BY-SA 4.0", MANIFEST["glaux-aristotle"]["licence"])

    def test_the_committed_ocr_is_of_the_pinned_download(self):
        for sid in ("ia-ross-metaphysics-1908", "ia-taylor-metaphysics-1801"):
            pages = aristotle_ocr.scan_pages(sid)   # raises if the sha256 differs
            self.assertGreater(len(pages), 300)

    def test_the_works_do_not_take_platos_ids_or_names(self):
        plato_ids = set(build_db.ALL_WORKS)
        for w in aristotle.WORKS:
            self.assertNotIn(w["id"], plato_ids)
            self.assertTrue(w["id"].startswith("ar"))
        self.assertEqual(len(aristotle.META_BOOKS), 14)

    def test_the_reader_loads_aristotle(self):
        self.assertIn('<script src="aristotle.js"></script>', PAGE)
        self.assertLess(PAGE.index("aristotle.js"), PAGE.index("shell.js"))


class CleanedTexts(unittest.TestCase):
    """The scans as cleaned by rule (texts/aristotle/metaphysics/)."""

    @classmethod
    def setUpClass(cls):
        cls.ross = json.loads((TEXTS / "ross-1908.json").read_text(encoding="utf-8"))
        cls.taylor = json.loads((TEXTS / "taylor-1801.json").read_text(encoding="utf-8"))

    def test_ross_opens_where_the_metaphysics_opens(self):
        p = self.ross["paragraphs"][0]
        self.assertTrue(p["text"].startswith("ALL men by nature desire to know."))
        self.assertEqual(p["marks"][0], [0, "980a"])

    def test_ross_prints_most_of_bekkers_columns(self):
        self.assertGreater(self.ross["stats"]["marks_read"], 150)
        refs = [m[1] for p in self.ross["paragraphs"] for m in p["marks"]]
        key = lambda r: (int(r[:-1]), r[-1])
        self.assertEqual(refs, sorted(refs, key=key), "the columns Ross prints are read in Bekker's order")
        self.assertEqual(len(refs), len(set(refs)))

    def test_ross_keeps_his_reference_to_the_gorgias(self):
        self.assertTrue(any("Gorgias, 448" in n["text"] for n in self.ross["notes"]))

    def test_taylor_has_his_fourteen_books_and_notes(self):
        tr = [p for p in self.taylor["paragraphs"] if p["part"] == "translation"]
        self.assertEqual(sorted({p["book"] for p in tr}), list(range(1, 15)))
        self.assertEqual(self.taylor["stats"]["chapters"]["5"], 30, "Book Δ: thirty chapters, as in Bekker")
        self.assertGreater(len(self.taylor["notes"]), 400)
        self.assertTrue(any("Syrianus" in n["text"] for n in self.taylor["notes"]))

    def test_the_long_s_is_read_as_s(self):
        first = next(p for p in self.taylor["paragraphs"] if p["part"] == "translation")
        self.assertIn("naturally desire to know", first["text"])
        self.assertIn("defire", first["raw"], "the OCR is kept as received beside the reading")

    def test_every_paragraph_keeps_its_ocr(self):
        for d in (self.ross, self.taylor):
            self.assertEqual(d["proof_status"], "OCR cleaned by rule")
            self.assertTrue(all(p["raw"] for p in d["paragraphs"]))

    def test_taylor_quoted_on_the_shelf_is_in_his_introduction(self):
        intro = json.loads((TEXTS / "taylor-introduction.json").read_text(encoding="utf-8"))
        text = " ".join(s["text"] for s in intro["segments"])
        quote = "Perhaps his design in this opposition was to lead the reader into all the mysteries of this doctrine"
        self.assertIn(quote, text)
        self.assertIn(quote, " ".join((ROOT / "reader" / "aristotle.js").read_text(encoding="utf-8").split()))

    def test_chase_has_ten_books(self):
        paras = aristotle.read_chase()
        self.assertEqual(sorted({p["book"] for p in paras}), list(range(1, 11)))
        self.assertTrue(paras[0]["text"].startswith("Every art, and every science"))


@unittest.skipUnless(has_aristotle(), "build the library with Aristotle first (python3 tools/build_db.py)")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lib = serve.Library(build_db.DB_PATH)

    def test_the_metaphysics_opens_at_980a_with_greek_and_four_englishes(self):
        w = self.lib.work("ar025")
        self.assertEqual(w["corpus"], "aristotle")
        self.assertEqual(w["sections"][0], "980a")
        labels = [e["label"] for e in w["editions"] if e["lang"] == "eng"]
        self.assertEqual(len(labels), 3, labels)
        self.assertTrue(any("Ross (1908)" == l for l in labels))
        self.assertTrue(any("Taylor (1801)" == l for l in labels))
        self.assertEqual(len([b for b in w["books"] if b["kind"] == "book"]), 14)
        self.assertGreater(len(w["ar_chapters"]), 140)
        p = self.lib.page("ar025", 980)
        grc = " ".join(c["text"] for c in p["chunks"] if c["lang"] == "grc")
        self.assertIn("πάντες ἄνθρωποι τοῦ εἰδέναι ὀρέγονται φύσει", grc)

    def test_the_greek_is_tagged(self):
        db = self.lib.db
        n, tagged = db.execute("SELECT count(*), count(g.token_id) FROM token t JOIN edition e ON e.id = t.edition_id "
                               "LEFT JOIN tag g ON g.token_id = t.id AND g.part = 0 WHERE e.work_id = 'ar025'").fetchone()
        self.assertGreater(n, 75000)
        self.assertGreater(tagged / n, 0.97)

    def test_a_word_of_aristotle_opens_the_word_box(self):
        tid = self.lib.db.execute("SELECT t.id FROM token t JOIN edition e ON e.id = t.edition_id WHERE e.work_id = 'ar025' "
                                  "AND t.form = 'ἄνθρωποι' ORDER BY t.id LIMIT 1").fetchone()[0]
        t = self.lib.token(tid)
        self.assertEqual(t["corpus"], "aristotle")
        self.assertEqual(t["tags"][0]["lemma"], "ἄνθρωπος")
        self.assertIn("glaux-aristotle", t["sources"])
        self.assertTrue(t["lookup"] and t["lookup"][0])

    def test_rosss_printed_columns_are_where_he_prints_them(self):
        db = self.lib.db
        n = db.execute("SELECT count(*) FROM chunk WHERE edition_id = 'ar025.ross1908' AND align_method = 'printed'").fetchone()[0]
        self.assertGreater(n, 150)
        first = db.execute("SELECT section_ref, text FROM chunk WHERE edition_id = 'ar025.ross1908' ORDER BY seq LIMIT 1").fetchone()
        self.assertEqual(first[0], "980a")

    def test_lambda_seven_is_where_every_translation_puts_it(self):
        # Metaph. Λ 7, 1072b: the life of God, "the actuality of thought is life".
        db = self.lib.db
        refs = {r[0] for r in db.execute("SELECT section_ref FROM chunk WHERE edition_id = 'ar025.ross1908' AND text LIKE '%actuality of thought is life%'")}
        self.assertTrue(refs & {"1072b"}, refs)

    def test_taylors_notes_are_under_the_text(self):
        n = self.lib.db.execute("SELECT count(*) FROM note WHERE work_id = 'ar025' AND commentator LIKE 'Taylor (1801)%'").fetchone()[0]
        self.assertGreater(n, 400)
        s = self.lib.db.execute("SELECT count(*) FROM note WHERE work_id = 'ar025' AND commentator LIKE '%Syrianus%'").fetchone()[0]
        self.assertGreater(s, 20)

    def test_key_terms_are_marked_apart_from_platos(self):
        db = self.lib.db
        self.assertGreater(db.execute("SELECT count(*) FROM ar_term_hit WHERE work_id = 'ar025'").fetchone()[0], 1000)
        self.assertEqual(db.execute("SELECT count(*) FROM term_hit WHERE work_id LIKE 'ar%'").fetchone()[0], 0)
        tid = db.execute("SELECT term_id FROM ar_term_hit GROUP BY term_id ORDER BY count(*) DESC LIMIT 1").fetchone()[0]
        t = self.lib.term(tid)
        self.assertGreater(t["aristotle"]["words"], 0)

    def test_platos_counts_are_platos(self):
        db = self.lib.db
        self.assertEqual(db.execute("SELECT count(*) FROM lemma_count WHERE work_id LIKE 'ar%'").fetchone()[0], 0)

    def test_taylors_introduction_reads_whole(self):
        t = self.lib.taylor("metaphysics-introduction")
        self.assertGreater(len(t["segments"]), 30)
        self.assertTrue(self.lib.taylor("metaphysics-additional-notes")["segments"])

    def test_the_ethics_has_rackham_and_chase(self):
        w = self.lib.work("ar010")
        labels = [e["label"] for e in w["editions"] if e["lang"] == "eng"]
        self.assertIn("Chase (1847)", labels)
        self.assertEqual(w["sections"][0], "1094a")


if __name__ == "__main__":
    unittest.main()
