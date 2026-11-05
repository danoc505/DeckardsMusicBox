"""Tests for milestone 11: the commentaries across Plato.

    python3 -m unittest discover -s tests -v

The reading tests check the committed texts/commentary/<dialogue>/ files and
the rules that made them. The library tests build the Phaedo and the Gorgias
into a temporary folder and are skipped if tools/fetch_sources.py has not been run.
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
import commentary_corpus as cc  # noqa: E402
import commentary_db  # noqa: E402
import serve  # noqa: E402

TEXTS = ROOT / "texts" / "commentary"
RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()


def doc(path):
    return json.loads((TEXTS / f"{path}.json").read_text(encoding="utf-8"))


def book_docs():
    """Every file milestone 11 wrote: one per book and dialogue, and Jowett's Introductions."""
    out = []
    for b in cc.BOOKS:
        out += [json.loads(p.read_text(encoding="utf-8")) for p in TEXTS.glob(f"*/{b['id']}*.json")]
    return out


class Reading(unittest.TestCase):
    def test_every_book_is_read_and_from_a_listed_source(self):
        manifest = {s["id"]: s for s in json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]}
        docs = book_docs()
        self.assertEqual({d["id"].split("-tlg")[0] for d in docs}, {b["id"] for b in cc.BOOKS})
        for d in docs:
            self.assertEqual(d["schema"], "platonic-workshop/commentary-v1")
            self.assertTrue(d["printed"] and d["anchoring"] and d["proof_status"], d["id"])
            src = manifest[d["source"]["manifest_id"]]
            self.assertEqual(src["kind"], "local")
            self.assertTrue(src["licence"].startswith("Public domain"), d["id"])
            for f in [d["source"]["file"]] if isinstance(d["source"]["file"], str) else d["source"]["file"]:
                self.assertTrue((ROOT / f).exists(), f)
            ids = [n["id"] for n in d["notes"]]
            self.assertEqual(len(ids), len(set(ids)), d["id"])
            self.assertGreater(len(ids), 100, d["id"])
            for n in d["notes"]:
                self.assertIn("raw", n)        # the OCR as received is kept beside every note
                self.assertEqual(n["work"], d["work"])

    def test_steph_heads_are_pages_of_the_dialogue_and_say_how(self):
        for d in book_docs():
            if d.get("place_by") != "steph":
                continue
            lo, hi = cc.PAGES[d["work"]]
            for n in d["notes"]:
                page = int(n["steph"][:-1])
                self.assertTrue(lo <= page <= hi and n["steph"][-1] in "abcde", n["id"])
                self.assertTrue(n["steph_how"], n["id"])

    def test_england_first_notes(self):
        d = doc("laws/england1921")
        first = d["notes"][0]
        self.assertEqual((first["steph"], first["printed_line"], first["steph_how"]), ("624a", 3, "printed with an earlier note"))
        self.assertEqual(first["lemma"], "ὥς γε τὸ δικαιότατον εἰπεῖν")
        self.assertIn("most decidedly", first["text"])
        self.assertGreater(len(d["notes"]), 3000)
        self.assertEqual(d["notes"][-1]["steph"][:3], "969")

    def test_bracket_and_colon_lemmata(self):
        a = doc("phaedo/archerhind1883")["notes"][0]
        self.assertEqual((a["lemma"], a["printed_line"]), ("αὐτός", 1))
        self.assertTrue(a["text"].startswith("Echekrates merely desires"))
        g = doc("gorgias/lodge1896")["notes"][0]
        self.assertEqual((g["lemma"], g["printed_line"]), ("τὸ λεγόμενον", 3))

    def test_head_rules(self):
        m = cc.HEAD.match("659a1. τὸν διαφέροντα : whereas those")
        self.assertEqual((m["page"], m["let"], m["line"]), ("659", "a", "1"))
        self.assertEqual(cc.letter_of("ἃ", 2), "d")       # ἃ after a c is d
        self.assertEqual(cc.letter_of("ἃ", 0), "a")
        self.assertEqual(cc.letter_of("Ὁ", 1), "b")
        self.assertEqual(cc.split_lemma("ἀκήρυκτον: not here = ἄσπονδος")[0], "ἀκήρυκτον")
        self.assertIsNone(cc.split_lemma("Some editions read ἡμῖν here")[0])
        self.assertEqual(commentary_db.steph_lemma("Φάναι δὴ κτλ. The"), "Φάναι δὴ")
        self.assertEqual(commentary_db.steph_lemma("περιτρέχων ὅπῃ τύχοιμι, ἐ.6. with"), "περιτρέχων ὅπῃ τύχοιμι")
        self.assertTrue(cc.COLON_HEAD.match("26. δόξα ψευδής : the force of οἶμαι"))

    def test_jowett_introductions(self):
        docs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in TEXTS.glob("*/jowett1892-intro-tlg*.json")}
        # Every dialogue Jowett translated himself has its Introduction (the Timaeus' was read in milestone 7).
        cfg = json.loads((ROOT / "sources" / "jowett-gutenberg" / "ebooks.json").read_text(encoding="utf-8"))["ebooks"]
        mine = {w["work"] for e in cfg for w in e["works"] if w["work"] and w["translator"] == "Benjamin Jowett"} - {"tlg031"}
        self.assertEqual({d["work"] for d in docs.values()}, mine)
        apology = docs["jowett1892-intro-tlg002"]
        self.assertFalse(any("Sidenote" in n["text"] for n in apology["notes"]))
        # The Apology's Introduction stops before the Apology itself.
        self.assertFalse(any("Socrates begs to be allowed" in n["text"] for n in apology["notes"]))
        self.assertTrue(all(n["kind"] == "introduction" for d in docs.values() for n in d["notes"]))


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(["tlg004", "tlg023"], db_path=cls.db_path)
        cls.db = sqlite3.connect(cls.db_path)
        cls.lib = serve.Library(cls.db_path, Path(cls.tmp.name) / "user.sqlite")

    @classmethod
    def tearDownClass(cls):
        cls.lib.db.close()
        cls.db.close()
        cls.tmp.cleanup()

    def q(self, sql, *args):
        return self.db.execute(sql, args).fetchall()

    def test_every_note_is_placed_and_says_how(self):
        for cid, work in (("burnet1911", "tlg004"), ("archerhind1883", "tlg004"), ("lodge1896", "tlg023"),
                          ("jowett1892-intro-tlg004", "tlg004")):
            n, missing = self.q("SELECT count(*), sum(anchor_detail IS NULL OR start_ref IS NULL) FROM note WHERE commentary_id = ?", cid)[0]
            self.assertEqual(missing, 0, cid)
            self.assertEqual(n, len(next(d for d in commentary_db.load(work) if d["id"] == cid)["notes"]), cid)

    def test_printed_heads_confirmed_by_the_greek(self):
        # Of Burnet's notes on Greek words, the words are those of the section the note is at.
        rows = self.q("SELECT start_ref, word_end_ref FROM note WHERE commentary_id = 'burnet1911' AND word_start IS NOT NULL")
        self.assertGreater(len(rows), 250)
        # A place resting on a counted page that the Greek did not confirm is marked computed.
        self.assertEqual(self.q("SELECT count(*) FROM note WHERE commentary_id = 'burnet1911' AND computed = 0 "
                                "AND word_start IS NULL AND anchor_detail LIKE '%counted%'"), [(0,)])

    def test_words_found_are_the_words_quoted(self):
        for key, ref in self.q("SELECT note_key, start_ref FROM note WHERE commentary_id = 'archerhind1883' AND word_start IS NOT NULL LIMIT 1"):
            self.assertEqual((key, ref), ("archerhind1883.0001", "57a"))
        (ws, we, computed), = self.q("SELECT word_start, word_end, computed FROM note WHERE note_key = 'archerhind1883.0001'")
        form = self.q("SELECT t.form FROM token t JOIN edition e ON e.id = t.edition_id WHERE e.work_id = 'tlg004' AND e.lang = 'grc' "
                      "AND t.section_ref = '57a' AND t.seq = ?", ws)[0][0]
        self.assertEqual((form.lower(), computed), ("αὐτός", 0))
        on, total = self.q("SELECT sum(word_start IS NOT NULL), count(*) FROM note WHERE commentary_id = 'lodge1896'")[0]
        self.assertGreater(on / total, 0.6)

    def test_the_list_of_all_commentaries(self):
        out = self.lib.all_commentaries()
        ids = {c["id"] for c in out["commentaries"]}
        self.assertTrue({"burnet1911", "archerhind1883", "lodge1896", "jowett1892-intro-tlg023"} <= ids)
        b = next(c for c in out["commentaries"] if c["id"] == "burnet1911")
        self.assertEqual(b["work_title"], "Phaedo")
        self.assertGreater(b["on_words"], 250)
        self.assertGreater(b["sections"], 100)

    def test_notes_reach_the_reader_and_the_citation_web(self):
        p = self.lib.page("tlg004", 57)
        self.assertIn("Burnet (1911)", {n["commentator"] for n in p["commentary"]})
        (n,), = self.q("SELECT count(*) FROM link l JOIN note n ON n.id = l.note_id WHERE n.commentary_id = 'burnet1911'")
        self.assertGreater(n, 100)


if __name__ == "__main__":
    unittest.main()
