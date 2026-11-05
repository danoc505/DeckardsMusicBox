"""Tests for the import of Taylor's vol. I from theosophylib.com.

    python3 -m unittest discover -s tests -v

These use only the committed HTML in sources/taylor-1804-vol1-theosophylib/
(no network). The comparison with Burnet's Greek runs only if
tools/fetch_sources.py has fetched perseus-greek-plato.
"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import import_taylor_vol1 as tv  # noqa: E402
import verify_sources as vs  # noqa: E402

HAVE_GREEK = (ROOT / "data" / "raw" / "perseus-greek-plato").exists()


def snippet(html):
    root = tv.parse('<div class="nv-content-wrap entry-content">' + html + "<!--[googlesitekit-end-of-content]-->")
    return tv.render(root.children[0])


class InlineRendering(unittest.TestCase):
    def test_markers_leave_text_and_keep_offsets(self):
        r = snippet('<p>justice, [331c] <em>the good</em> itself<a class="sdendnoteanc" '
                    'href="#sdendnote7sym" name="sdendnote7anc"><sup>3</sup></a> and [p. iv] more</p>')
        self.assertEqual(r["text"], "justice, the good itself and more")
        self.assertEqual(r["stephanus"], [{"section": "331c", "at": 9}])
        self.assertEqual(r["pages"], [{"page": "iv", "at": 29}])
        italic = r["marks"][0]
        self.assertEqual(r["text"][italic["start"]:italic["end"]], "the good")
        self.assertEqual(r["notes"], [{"key": "sdendnote7", "at": 24, "printed": "3"}])

    def test_small_caps_and_line_breaks(self):
        r = snippet('<p>S<span style="font-size: small;">OCRATES</span>:   Son of\n Clinias!<br />Next line</p>')
        self.assertEqual(r["text"], "SOCRATES: Son of Clinias!\nNext line")

    def test_editorial_brackets_are_not_markers(self):
        r = snippet("<p>Ahura Mazda [Ormazd] and [Ed.] remain</p>")
        self.assertEqual(r["text"], "Ahura Mazda [Ormazd] and [Ed.] remain")
        self.assertEqual(r["stephanus"], [])


class ImportedVolume(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.docs, cls.problems = {}, {}
        for page, doc, problems in tv.import_all():
            cls.docs[page["work"]] = doc
            cls.problems[page["work"]] = problems

    def test_committed_texts_match_a_fresh_import(self):
        for work, doc in self.docs.items():
            committed = (tv.OUT / f"{work}.json").read_text(encoding="utf-8")
            self.assertEqual(committed, tv.dump(doc), f"texts/taylor-1804/vol1/{work}.json is stale: rerun the importer")

    def test_no_unresolved_problems(self):
        for work, problems in self.problems.items():
            self.assertEqual(problems, [], work)

    def test_ids_are_unique(self):
        for doc in self.docs.values():
            ids = [s["id"] for s in doc["segments"]] + [n["id"] for n in doc["notes"]]
            self.assertEqual(len(ids), len(set(ids)), doc["id"])

    def test_offsets_are_inside_their_text(self):
        for doc in self.docs.values():
            for rec in doc["segments"] + doc["notes"]:
                n = len(rec.get("text") or "")
                for m in rec.get("marks", []):
                    self.assertTrue(0 <= m["start"] < m["end"] <= n, rec["id"])
                for ref in rec.get("notes", []):
                    self.assertTrue(0 <= ref["at"] <= n, rec["id"])

    def test_every_note_is_linked_both_ways(self):
        for doc in self.docs.values():
            owners = {r["id"] for r in doc["segments"] + doc["notes"]}
            notes = {n["id"]: n for n in doc["notes"]}
            for rec in doc["segments"] + doc["notes"]:
                for ref in rec.get("notes", []):
                    self.assertIn(ref["note"], notes, rec["id"])
            for n in doc["notes"]:
                if n["type"] == "footnote":
                    self.assertTrue(n["text"], n["id"])
                    self.assertTrue(n["anchors"], n["id"])
                for a in n.get("anchors", []):
                    self.assertIn(a["in"], owners, n["id"])

    def test_alcibiades_sections_and_corrections(self):
        doc = self.docs["alcibiades-1"]
        order = self.section_order(doc)
        self.assertEqual((len(order), order[0], order[-1]), (162, "103a", "135e"))
        self.assertEqual(vs.sequence_problems(order), [])
        fixed = [s for s in doc["segments"] if s.get("stephanus_printed")]
        self.assertEqual({(s["stephanus_printed"], s["stephanus"]) for s in fixed}, {("131c", "131e")})

    def test_republic_sections(self):
        order = self.section_order(self.docs["republic"])
        self.assertEqual((len(order), order[0], order[-1]), (1354, "327a", "621d"))
        breaks = vs.sequence_problems(order)
        # Book divisions, plus 560d, for which the site has no marker.
        self.assertEqual(breaks, ["354c -> 357a", "383c -> 386a", "417b -> 419a", "445e -> 449a", "480a -> 484a",
                                  "511e -> 514a", "541b -> 543a", "560c -> 560e", "569c -> 571a", "592b -> 595a"])

    def test_additional_notes_are_placed(self):
        alc = [n for n in self.docs["alcibiades-1"]["notes"] if n["type"] == "additional"]
        self.assertEqual(len(alc), 19)
        self.assertTrue(all(n["stephanus"] for n in alc))
        self.assertEqual(alc[0]["stephanus"], "103a")
        rep = {n["page_1804"]: n for n in self.docs["republic"]["notes"] if n["type"] == "additional" and n.get("page_1804")}
        self.assertEqual(rep["113"]["stephanus"], "336b")  # "Thrasymachus.": the hit nearest p. 113
        self.assertEqual(rep["105"]["on_footnote"], "taylor1804.republic.n004")
        book4 = [n for n in self.docs["republic"]["notes"] if n["type"] == "additional" and n["lemma"] is None]
        self.assertEqual([n["scope"] for n in book4], ["book 4"])

    def test_translators_and_signatures(self):
        alc = self.docs["alcibiades-1"]
        self.assertTrue(alc["translator"].startswith("Floyer Sydenham"))
        signed = [n["signed"] for n in alc["notes"] if n["type"] == "footnote"]
        self.assertEqual((signed.count("Sydenham"), signed.count("Taylor")), (70, 9))

    def test_glossary_terms(self):
        terms = [s for s in self.docs["platonic-terms"]["segments"] if s["kind"] == "term"]
        self.assertEqual(len(terms), 63)
        self.assertEqual((terms[0]["term"], terms[0]["cited_from"]), ("Alliation", ["Procl. Comm. Timæus."]))

    @unittest.skipUnless(HAVE_GREEK, "run tools/fetch_sources.py perseus-greek-plato first")
    def test_sections_against_burnet(self):
        for work, missing in (("alcibiades-1", []), ("republic", ["560d"])):
            doc = self.docs[work]
            greek = tv.perseus_sections(doc["perseus_work"].rsplit(".", 1)[1])
            order = self.section_order(doc)
            self.assertEqual([x for x in greek if x not in order], missing, work)
            self.assertEqual([x for x in order if x not in greek], [], work)

    @staticmethod
    def section_order(doc):
        order = []
        for s in doc["segments"]:
            if s["part"] == "translation" and s.get("stephanus") and (not order or order[-1] != s["stephanus"]):
                order.append(s["stephanus"])
        return order


if __name__ == "__main__":
    unittest.main()
