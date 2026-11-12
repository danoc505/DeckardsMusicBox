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
        return db.execute("SELECT count(*) FROM work WHERE corpus = 'aristotle' AND imported = 1").fetchone()[0] >= len(aristotle.WORKS)
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


class Dissertation(unittest.TestCase):
    """Aristotle milestone A2: Taylor's Dissertation (1812) and Start here for Aristotle."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "aristotle" / "dissertation" / "taylor-1812.json").read_text(encoding="utf-8"))
        cls.js = (ROOT / "reader" / "aristotle.js").read_text(encoding="utf-8")

    def test_the_source_is_pinned_and_public_domain(self):
        self.assertIn("Public domain", MANIFEST["ia-taylor-dissertation-1812"]["licence"])
        self.assertGreater(len(aristotle_ocr.scan_pages("ia-taylor-dissertation-1812")), 600)

    def test_four_books_with_their_chapters(self):
        self.assertEqual(self.d["stats"]["chapters"], {"1": 18, "2": 14, "3": 6, "4": 12})
        heads = [s["text"] for s in self.d["segments"] if s["kind"] == "heading"]
        self.assertEqual(heads[0], "Book I, chapter 1")
        self.assertGreater(len(self.d["notes"]), 150)
        self.assertGreater(sum(s["kind"] == "quotation" for s in self.d["segments"]), 150)
        self.assertTrue(all(s["raw"] for s in self.d["segments"]))

    def test_every_quotation_on_start_here_is_in_the_dissertation(self):
        import difflib
        quotes = re.findall(r'(\w+): \{ at: "([^"]+)", text: `([^`]+)`', self.js)
        self.assertGreaterEqual(len(quotes), 7)
        words = lambda t: re.findall(r"[a-z]+", t.lower())
        for key, at, text in quotes:
            seg = next((s for s in self.d["segments"] if " ".join(at.lower().split()) in " ".join(s["text"].lower().split())), None)
            self.assertIsNotNone(seg, f"{key}: no paragraph with {at!r}")
            q = words(text.replace("…", " "))
            ocr = words(seg["text"])
            m = difflib.SequenceMatcher(None, ocr, q, autojunk=False)
            matched = sum(b.size for b in m.get_matching_blocks())
            self.assertGreater(matched / len(q), 0.85, f"{key}: the quotation and the scan's text differ")

    def test_marinus_is_quoted_from_taylors_translation(self):
        m = re.search(r"marinus: \{ text: `([^`]+)`", self.js).group(1)
        src = " ".join((ROOT / "sources" / "taylor-gutenberg" / "pg77393.txt").read_text(encoding="utf-8").replace("_", "").split())
        self.assertIn(" ".join(m.split()), src)

    def test_the_library_serves_it(self):
        t = serve.Library.taylor(None, "aristotle-dissertation")
        self.assertEqual(t["title"], "A Dissertation on the Philosophy of Aristotle")
        self.assertIn("about", t)


class NaturalWorks(unittest.TestCase):
    """Milestone A3: the Physics, On the Heavens and On the Soul, from First1KGreek, with English from scans."""

    @classmethod
    def setUpClass(cls):
        base = ROOT / "texts" / "aristotle"
        cls.texts = {k: json.loads((base / f).read_text(encoding="utf-8")) for k, f in
                     (("physics", "physics/hardie-gaye-1930.json"), ("caelo", "on-the-heavens/stocks-1922.json"),
                      ("anima", "on-the-soul/hicks-1907.json"))}

    def test_the_sources_are_pinned_and_free(self):
        for sid in ("first1k-aristotle", "ia-hardie-gaye-physics-1930", "ia-stocks-de-caelo-1922", "ia-hicks-de-anima-1907"):
            self.assertIn(sid, MANIFEST)
            self.assertTrue(MANIFEST[sid].get("licence") or MANIFEST[sid].get("license"), sid)
        for sid in ("ia-hardie-gaye-physics-1930", "ia-stocks-de-caelo-1922", "ia-hicks-de-anima-1907"):
            self.assertTrue(MANIFEST[sid].get("sha256"), sid)

    def test_each_translation_opens_where_the_work_opens(self):
        self.assertTrue(self.texts["physics"]["paragraphs"][0]["text"].startswith("WHEN the ob"))
        self.assertEqual(self.texts["physics"]["paragraphs"][0]["marks"][0], [0, "184a"])
        self.assertTrue(self.texts["caelo"]["paragraphs"][0]["text"].startswith("THE science which has to do with nature"))
        self.assertTrue(self.texts["anima"]["paragraphs"][0]["text"].startswith("Cognition is in our eyes a thing of beauty"))

    def test_most_columns_are_read_from_the_scans(self):
        self.assertGreater(self.texts["physics"]["stats"]["marks_read"], 140)
        self.assertGreater(self.texts["caelo"]["stats"]["marks_read"], 60)
        self.assertGreater(self.texts["anima"]["stats"]["heads_read"], 60)

    def test_hicks_leaves_out_his_greek_apparatus_and_side_notes(self):
        text = " ".join(p["text"] for p in self.texts["anima"]["paragraphs"])
        for word in ("||", " codd", "Torst.", "Biehl", "coni."):
            self.assertNotIn(word, text)
        self.assertIn("It has hearing in order that information may be conveyed to it", text)
        self.assertGreater(len(text.split()), 28000)

    def test_the_place_of_a_piece_is_printed_or_computed(self):
        import aristotle_trans
        order = ["1a", "1b", "2a", "2b", "3a"]
        paras = [{"text": "One. Two. Three. Four. Five. Six.", "marks": [[0, "1a"]]},
                 {"text": "Seven. Eight. Nine.", "marks": [[7, "3a"]]}]
        pieces = aristotle_trans.place(paras, order)
        cols = [c for _, _, _, c, _ in pieces]
        self.assertEqual(sorted(set(cols), key=cols.index), ["1a", "1b", "2a", "2b", "3a"])
        self.assertEqual(cols, sorted(cols, key=order.index))
        self.assertEqual(pieces[0][4], "printed")
        self.assertEqual(pieces[-1][4], "printed")
        self.assertEqual(pieces[1][4], "computed")


@unittest.skipUnless(has_aristotle(), "build the library with Aristotle first (python3 tools/build_db.py)")
class NaturalWorksInTheLibrary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lib = serve.Library(build_db.DB_PATH)

    def test_each_work_opens_at_its_first_column_with_its_english(self):
        for wid, first, n, ed in (("ar031", "184a", 167, "ar031.hardie1930"), ("ar005", "268a", 91, "ar005.stocks1922"),
                                  ("ar002", "402a", 64, "ar002.hicks1907")):
            w = self.lib.work(wid)
            self.assertEqual(w["corpus"], "aristotle")
            self.assertEqual(w["sections"][0], first)
            self.assertGreaterEqual(len(w["sections"]), n)
            self.assertIn(ed, [e["id"] for e in w["editions"] if e["lang"] == "eng"])
            chunks = self.lib.db.execute("SELECT count(DISTINCT section_ref) FROM chunk WHERE edition_id = ?", (ed,)).fetchone()[0]
            self.assertEqual(chunks, len(w["sections"]), wid)

    def test_the_greek_is_tagged(self):
        for wid in ("ar031", "ar005", "ar002"):
            n, tagged = self.lib.db.execute(
                "SELECT count(*), count(g.token_id) FROM token t JOIN edition e ON e.id = t.edition_id "
                "LEFT JOIN tag g ON g.token_id = t.id AND g.part = 0 WHERE e.work_id = ? AND e.lang = 'grc'", (wid,)).fetchone()
            self.assertGreater(n, 10000, wid)
            self.assertGreater(tagged / n, 0.9, wid)

    def test_famous_passages_are_at_their_columns(self):
        db = self.lib.db
        def refs(ed, words):
            return {r[0] for r in db.execute("SELECT section_ref FROM chunk WHERE edition_id = ? AND text LIKE ?", (ed, f"%{words}%"))}
        # Phys. II 1, 192b21: nature a source of being moved and of being at rest.
        self.assertTrue(refs("ar031.hardie1930", "source or cause of being moved") & {"192b", "193a"})
        # De An. III 5, 430a: the intellect that makes all things.
        self.assertTrue(refs("ar002.hicks1907", "separable, impassive") & {"430a", "429b", "430b"} or
                        refs("ar002.hicks1907", "impassive and unmixed") & {"430a", "429b"})


if __name__ == "__main__":
    unittest.main()
