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


class Organon(unittest.TestCase):
    """Milestone A4: the six treatises of the Organon, Greek from First1KGreek and the Oxford English (1928)."""

    @classmethod
    def setUpClass(cls):
        import aristotle_organon
        cls.ao = aristotle_organon
        cls.texts = {w: json.loads((ROOT / "texts" / "aristotle" / slug / "oxford-1928.json").read_text(encoding="utf-8"))
                     for w, slug in (("ar006", "categories"), ("ar017", "on-interpretation"), ("ar001", "prior-analytics"),
                                     ("ar001p", "posterior-analytics"), ("ar044", "topics"), ("ar040", "sophistical-refutations"))}

    def test_the_scan_is_pinned_and_public_domain_in_the_us(self):
        src = MANIFEST["ia-oxford-organon-1928"]
        self.assertTrue(src["sha256"])
        self.assertIn("1928", src["licence"])
        self.assertIn("data/tlg0086/tlg006", MANIFEST["first1k-aristotle"]["paths"])

    def test_the_margin_is_read(self):
        self.assertEqual(self.ao.line_number("1o"), 10)
        self.assertEqual(self.ao.line_number("a5"), 25)
        self.assertIsNone(self.ao.line_number("7"))
        self.assertEqual(self.ao.column_mark("2°", 2), 2)
        self.assertEqual(self.ao.column_mark("1642", 164), 164)
        self.assertIsNone(self.ao.column_mark("15", 1))       # line 15, not column 1ᵇ
        self.assertEqual(self.ao.columns("23b", "25a"), ["23b", "24a", "24b", "25a"])

    def test_each_treatise_opens_with_its_first_column(self):
        self.assertTrue(self.texts["ar006"]["paragraphs"][0]["text"].startswith("THINGS are said to be named"))
        for w, first in (("ar006", "1a"), ("ar001", "24a")):
            self.assertEqual(self.texts[w]["paragraphs"][0]["marks"][0][1], first)

    def test_most_columns_are_placed_from_the_margin(self):
        for w, t in self.texts.items():
            s = t["stats"]
            self.assertGreater(s["line_numbers"], 80, w)
            self.assertGreater(s["columns_printed"] + s["columns_computed"], 0.7 * len(self.ao.columns(*self.ao.TREATISES[w][4:6])), w)

    def test_known_passages_fall_in_their_columns(self):
        import aristotle_trans
        for w, words, col in (("ar006", "Substance, in the truest", "2a"), ("ar006", "There are six sorts of movement", "15a"),
                              ("ar017", "Every proposition must contain a verb", "17a"),
                              ("ar001p", "primary premisses by induction", "100b"), ("ar044", "The best way to secure training", "163a"),
                              ("ar040", "Of arguments in dialogue form there are four", "165a")):
            paras = self.texts[w]["paragraphs"]
            pieces = aristotle_trans.place(paras, self.ao.columns(*self.ao.TREATISES[w][4:6]))
            got = [c for k, a, b, c, _ in pieces if words in paras[k]["text"][a:b]]
            self.assertEqual(got[:1], [col], (w, words))

    def test_the_greek_columns_carried_over_land_on_the_same_chapters(self):
        import aristotle_f1k
        w = aristotle_f1k.WORK_BY_ID["ar006"]
        paras, _ = aristotle_f1k.read_tei(w)
        pieces, cols, _, basis = aristotle_f1k.sections_of(paras, [], None, self.ao.carried_marks(w, paras))
        self.assertEqual(cols, self.ao.columns("1a", "15b"))
        self.assertIn("Oxford translation", basis)
        import unicodedata
        nfc = lambda t: unicodedata.normalize("NFC", t)
        got = [c for k, a, b, c in pieces if nfc("Οὐσία δέ ἐστιν ἡ κυριώτατά") in nfc(paras[k]["text"][a:b])]
        self.assertEqual(got[:1], ["2a"])

    def test_the_analytics_are_two_works_from_one_file(self):
        import aristotle_f1k
        pr, _ = aristotle_f1k.read_tei(aristotle_f1k.WORK_BY_ID["ar001"])
        po, _ = aristotle_f1k.read_tei(aristotle_f1k.WORK_BY_ID["ar001p"])
        self.assertTrue(po[0]["text"].startswith("Πᾶσα διδασκαλία"))
        self.assertNotIn("Πᾶσα διδασκαλία", " ".join(p["text"] for p in pr))


@unittest.skipUnless(has_aristotle(), "build the library with Aristotle first (python3 tools/build_db.py)")
class OrganonInTheLibrary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lib = serve.Library(build_db.DB_PATH)

    def test_every_treatise_has_greek_and_english_at_every_column(self):
        for wid, first in (("ar006", "1a"), ("ar017", "16a"), ("ar001", "24a"), ("ar001p", "71a"), ("ar044", "100a"), ("ar040", "164a")):
            w = self.lib.work(wid)
            self.assertEqual(w["sections"][0], first, wid)
            self.assertIn(f"{wid}.oxford1928", [e["id"] for e in w["editions"]])
            self.assertIn(f"{wid}.owen1853", [e["id"] for e in w["editions"]])
            n = self.lib.db.execute("SELECT count(DISTINCT section_ref) FROM chunk WHERE edition_id = ?", (f"{wid}.owen1853",)).fetchone()[0]
            self.assertEqual(n, len(w["sections"]), wid)
            n = self.lib.db.execute("SELECT count(DISTINCT section_ref) FROM chunk WHERE edition_id = ?", (f"{wid}.oxford1928",)).fetchone()[0]
            self.assertEqual(n, len(w["sections"]), wid)

    def test_the_greek_is_tagged(self):
        for wid in ("ar006", "ar017", "ar001", "ar001p", "ar044", "ar040"):
            n, tagged = self.lib.db.execute(
                "SELECT count(*), count(g.token_id) FROM token t JOIN edition e ON e.id = t.edition_id "
                "LEFT JOIN tag g ON g.token_id = t.id AND g.part = 0 WHERE e.work_id = ? AND e.lang = 'grc'", (wid,)).fetchone()
            self.assertGreater(tagged / n, 0.85, wid)


class Isagoge(unittest.TestCase):
    """Aristotle milestone A4b: Porphyry's Introduction, the door to the Organon: Owen's English (1853), Busse's Greek (1887)."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "aristotle" / "porphyry" / "owen-1853.json").read_text(encoding="utf-8"))
        cls.js = (ROOT / "reader" / "aristotle.js").read_text(encoding="utf-8")

    def test_the_sources_are_pinned_and_free(self):
        m = MANIFEST["ia-owen-organon-1853"]
        self.assertEqual(m["item"], "organonorlogica04porpgoog")
        self.assertIn("Public domain", m["licence"])
        self.assertTrue(set(range(264, 289)) <= set(aristotle_ocr.scan_pages("ia-owen-organon-1853")))
        self.assertIn("data/tlg2034/tlg006", MANIFEST["first1k-neoplatonists"]["paths"])
        self.assertNotIn("data/tlg2034/tlg006", MANIFEST["first1k-aristotle"]["paths"])
        self.assertIn("CC BY-SA", MANIFEST["first1k-neoplatonists"]["licence"])

    def test_seventeen_chapters_in_order(self):
        heads = [s for s in self.d["segments"] if s["kind"] == "heading"]
        self.assertEqual(heads[0]["text"], "The Introduction of Porphyry")
        self.assertEqual([s["chapter"] for s in heads[1:]], list(range(1, 18)))
        self.assertEqual(heads[2]["text"], "Chapter II: Of the Nature of Genus and Species.")
        self.assertEqual(heads[5]["text"], "Chapter V: Of Accident.")

    def test_the_text_is_owens_and_the_notes_are_apart(self):
        segs = [s for s in self.d["segments"] if s["kind"] == "paragraph"]
        self.assertTrue(segs[0]["text"].startswith("SINCE it is necessary, Chrysaorius, both to the doctrine of Aristotle’s Categories"))
        # The famous question Porphyry sets aside: the universals.
        self.assertIn("as to whether they subsist (in the nature of things) or in mere conceptions only", segs[0]["text"])
        self.assertTrue(segs[-1]["text"].endswith("the setting forth of their agreement.”"))
        self.assertTrue(all(s["raw"] for s in self.d["segments"]))
        whole = " ".join(s["text"] for s in segs)
        for foot in ("At the request of Chrysaorius", "Ammonius remarks that", "Whately observes"):
            self.assertNotIn(foot, whole)
            self.assertTrue(any(n["text"].startswith(foot) for n in self.d["notes"] if n["type"] == "footnote"), foot)
        self.assertNotIn("Or the principle of the generation of every one", whole)
        self.assertTrue(any("Or the principle of the generation of every one" in n["text"] for n in self.d["notes"] if n["type"] == "sidenote"))
        self.assertGreaterEqual(self.d["stats"]["notes"], 35)
        for s in self.d["segments"]:
            for x in s["notes"]:
                self.assertLessEqual(x["at"], len(s["text"]))

    def test_the_greek_is_on_the_neoplatonists_shelf(self):
        import neoplatonists
        t = next(x for x in neoplatonists.TEXTS if x["id"] == "porphyry-isagoge")
        self.assertEqual((t["source"], t["unit"], t["year"]), ("first1k-neoplatonists", "page", 1887))
        if not (neoplatonists.F1K / "tlg2034").exists():
            self.skipTest("run tools/fetch_sources.py first")
        units, parts = neoplatonists.read_tei(t)
        self.assertEqual(len(units), 22)
        import unicodedata
        self.assertIn(unicodedata.normalize("NFC", "Χρυσαόριε"), unicodedata.normalize("NFC", units[0]["text"]))

    def test_the_reader_opens_it_before_the_logic(self):
        self.assertIn('#taylor/porphyry-introduction', self.js)
        self.assertIn('#neo/porphyry-isagoge', self.js)
        t = serve.Library.taylor(None, "porphyry-introduction")
        self.assertEqual(t["translator"], "Octavius Freire Owen")
        self.assertIn("about", t)


class OwenOrganon(unittest.TestCase):
    """Aristotle milestone A4c: Owen's Organon (1853), a second English, at the Oxford's columns carried over (≈)."""
    SLUGS = {"ar006": "categories", "ar017": "on-interpretation", "ar001": "prior-analytics", "ar001p": "posterior-analytics",
             "ar044": "topics", "ar040": "sophistical-refutations"}

    @classmethod
    def setUpClass(cls):
        cls.d = {w: json.loads((ROOT / "texts" / "aristotle" / s / "owen-1853.json").read_text(encoding="utf-8")) for w, s in cls.SLUGS.items()}

    def test_both_volumes_are_pinned_and_public_domain(self):
        self.assertEqual(MANIFEST["ia-owen-organon-1853-v1"]["item"], "organonorlogicalt01aris")
        for sid in ("ia-owen-organon-1853-v1", "ia-owen-organon-1853"):
            self.assertIn("Public domain", MANIFEST[sid]["licence"])
        self.assertIn(13, aristotle_ocr.scan_pages("ia-owen-organon-1853-v1"))
        self.assertIn(12, aristotle_ocr.scan_pages("ia-owen-organon-1853"))

    def test_each_treatise_opens_with_its_first_words(self):
        first = {"ar017": "We must first determine what a noun", "ar001": "It is first requisite to say what is the subject",
                 "ar044": "THE purpose of this treatise is to discover", "ar040": "CONCERNING sophistical elenchi"}
        for w, words in first.items():
            self.assertTrue(any(p["text"].startswith(words) or (" " + words) in p["text"][:200] for p in self.d[w]["paragraphs"][:2]), w)

    def test_every_column_is_carried_over(self):
        import aristotle_organon
        import aristotle_trans
        for w, d in self.d.items():
            c0, c1 = aristotle_organon.TREATISES[w][4:6]
            order = aristotle_organon.columns(c0, c1)
            cols = {c for p in d["paragraphs"] for _, c, how in p["marks"]}
            self.assertEqual(cols, set(order), w)
            self.assertTrue(all(how == "computed" for p in d["paragraphs"] for _, _, how in p["marks"]), w)
            pieces = aristotle_trans.place(d["paragraphs"], order)
            self.assertEqual([c for c in order if c in {x[3] for x in pieces}], order, w)

    def test_known_passages_fall_near_their_columns(self):
        import aristotle_organon
        import aristotle_trans
        for w, words, near in (("ar006", "Of things incomplex enunciated", "1b"), ("ar017", "are symbols of the passions", "16a"),
                               ("ar001p", "pre-existent knowledge", "71a"), ("ar044", "purpose of this treatise", "100a"),
                               ("ar040", "sophistical elenchi, and such", "164a")):
            d = self.d[w]["paragraphs"]
            c0, c1 = aristotle_organon.TREATISES[w][4:6]
            order = aristotle_organon.columns(c0, c1)
            col = next(c for k, a, b, c, _ in aristotle_trans.place(d, order) if words in d[k]["text"][a:b])
            self.assertLessEqual(abs(order.index(col) - order.index(near)), 1, (w, col, near))

    def test_notes_are_kept_apart(self):
        for w, d in self.d.items():
            self.assertGreater(len(d["notes"]), 50, w)
            self.assertTrue(all(0 <= n["para"] < len(d["paragraphs"]) for n in d["notes"]), w)
        self.assertTrue(any(n["text"].startswith("In the margin: ") for n in self.d["ar044"]["notes"]))

    def test_it_is_a_translation_of_each_logical_work(self):
        import aristotle_trans
        for w in self.SLUGS:
            self.assertIn("owen1853", [t[1] for t in aristotle_trans.TRANSLATIONS[w]])
        js = (ROOT / "reader" / "reader.js").read_text(encoding="utf-8")
        self.assertIn('".owen1853"', js)


COMMENTATORS = ROOT / "data" / "raw" / "first1k-commentators" / "data"


@unittest.skipUnless(COMMENTATORS.exists(), "fetch the commentators first (python3 tools/fetch_sources.py first1k-commentators)")
class Commentators(unittest.TestCase):
    """Aristotle milestone A5: the Greek commentators (CAG) from First1KGreek, read by the Berlin pages."""

    @classmethod
    def setUpClass(cls):
        import aristotle_commentators
        cls.ac = aristotle_commentators
        cls.t = {t["id"]: t for t in aristotle_commentators.TEXTS}

    def test_the_source_is_pinned_and_licensed(self):
        m = MANIFEST["first1k-commentators"]
        self.assertEqual(m["commit"], MANIFEST["first1k-neoplatonists"]["commit"])
        self.assertIn("CC BY-SA 4.0", m["licence"])
        for t in self.ac.TEXTS:
            self.assertTrue(any(t["file"].startswith(p[len("data/"):] + "/") for p in m["paths"]), t["id"])
            self.assertTrue((COMMENTATORS / t["file"]).exists(), t["id"])

    def test_they_are_on_their_own_shelf_after_the_neoplatonists(self):
        import neoplatonists
        shelves = [t.get("shelf", "neo") for t in neoplatonists.TEXTS]
        self.assertEqual(shelves, sorted(shelves, key=lambda x: x != "neo"))
        self.assertEqual(shelves.count("commentators"), len(self.ac.TEXTS))
        self.assertEqual(len({t["id"] for t in neoplatonists.TEXTS}), len(neoplatonists.TEXTS))

    def test_a_commentary_is_read_by_the_berlin_pages(self):
        units, parts = self.ac.read(self.t["syrianus-metaphysics"])
        self.assertEqual(units[0]["label"], "p. 1")
        self.assertEqual(len(units), 195)
        self.assertEqual([p["label"] for p in parts][:1], ["Book Β, pp. 1–20"])
        self.assertTrue(any(p["label"].startswith("Books Μ and Ν") for p in parts))
        # Syrianus' famous defence of the Forms in Book M: the Greek is there, page by page.
        self.assertTrue(any("ἰδέ" in u["text"] for u in units if u["page"] > 80))

    def test_a_misprinted_page_number_is_read_between_its_neighbours(self):
        self.assertEqual(self.ac.page_numbers(["322", "393", "324"]), [(322, None), (323, "the file prints 393"), (324, None)])
        units, _ = self.ac.read(self.t["alexander-metaphysics"])
        self.assertEqual([u["page"] for u in units if 321 <= u["page"] <= 325], [321, 322, 323, 324, 325])

    def test_the_bekker_references_in_the_margin_are_read(self):
        t = self.t["alexander-metaphysics"]
        self.assertEqual(self.ac.printed_refs(t, {"margin": ["3", "p. 980a21"], "divs": []}), [("980a", "p. 980a21")])
        self.assertEqual(self.ac.printed_refs(t, {"margin": ["p. 130 b 28"], "divs": []}), [("130b", "p. 130 b 28")])
        isag = self.t["ammonius-isagoge"]
        self.assertEqual(self.ac.printed_refs(isag, {"margin": ["p. 5, 17"], "divs": []}), [("1.5", "p. 5, 17")])

    def test_the_indices_are_left_out(self):
        units, _ = self.ac.read(self.t["ammonius-categories"])
        self.assertGreater(self.t["ammonius-categories"]["_stats"]["pages_left_out"], 30)
        self.assertLess(max(u["page"] for u in units), 110)


@unittest.skipUnless(has_aristotle(), "build the library with Aristotle first (python3 tools/build_db.py)")
class CommentatorsInTheLibrary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lib = serve.Library(build_db.DB_PATH)
        if not cls.lib.one("SELECT name FROM sqlite_master WHERE name = 'ar_comment'"):
            raise unittest.SkipTest("built without the commentators")

    def test_the_shelf_lists_them_apart(self):
        texts = self.lib.neo()["texts"]
        com = [t for t in texts if t["shelf"] == "commentators"]
        self.assertGreaterEqual(len(com), 30)
        self.assertEqual(next(t for t in com if t["id"] == "simplicius-physics")["on_work"], "ar031")
        self.assertTrue(all(t["shelf"] == "neo" for t in texts if t["id"].startswith(("plotinus", "proclus"))))

    def test_alexander_on_metaphysics_alpha_is_linked_to_its_first_column(self):
        d = self.lib.page("ar025", 980)
        here = [c for c in d["ar_comments"] if c["col"] == "980a" and c["text_id"] == "alexander-metaphysics"]
        self.assertTrue(here)
        self.assertIn("printed", {c["how"] for c in here})
        self.assertIn("p. 2", {c["label"] for c in here})

    def test_every_commentary_on_a_work_here_is_linked(self):
        for t in self.lib.neo()["texts"]:
            if t["shelf"] == "commentators" and t["on_work"] and not t["id"].startswith("alexander-de-anima") and t["id"] != "alexander-mantissa":
                n = self.lib.one("SELECT count(DISTINCT unit_seq) n FROM ar_comment WHERE text_id = ?", t["id"])["n"]
                self.assertGreater(n, t["n_units"] // 5, t["id"])

    def test_a_page_names_the_columns_it_comments_on(self):
        d = self.lib.neo_part("syrianus-metaphysics", 5)
        self.assertTrue(any(u.get("ar_cols") for u in d["units"]))
        self.assertTrue(all(c["work_id"] == "ar025" for u in d["units"] for c in u.get("ar_cols", [])))

    def test_the_reader_shows_them(self):
        js = (ROOT / "reader" / "aristotle.js").read_text(encoding="utf-8")
        for f in ("function renderArCommentRow", "function arCommentatorsShelf", "function arColsOfUnit"):
            self.assertIn(f, js)
        self.assertIn("renderArCommentRow", (ROOT / "reader" / "reader.js").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
