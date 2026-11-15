"""Tests for the Enneads milestones (E1 onward): the Workshop's modern English of the treatises of Plotinus that Taylor did
not translate (tools/modern_enneads.py), checked against MacKenna's English (tools/mackenna.py), read with the page of
milestone 27 (reader/neo.js) at #neo-modern/enneads, with the contents of the whole Enneads in Porphyry's order.

    python3 -m unittest tests.test_modern_enneads -v

The file tests always run. The checks against the Greek need data/raw/ (python3 tools/fetch_sources.py); the server
test needs data/workshop.sqlite (python3 tools/build_db.py); the browser test also needs Node and Playwright.
"""
import json
import shutil
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
import mackenna  # noqa: E402
import modern_enneads  # noqa: E402
import modern_neo  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
F1K = ROOT / "data" / "raw" / "first1k-neoplatonists"


def load():
    return json.loads((MOD / "enneads.json").read_text(encoding="utf-8"))


def has_greek():
    return (F1K / "data" / "tlg2000").exists()


def has_library():
    return build_db.DB_PATH.exists()


class MacKenna(unittest.TestCase):
    """MacKenna's English, read from the OCR by rule."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "plotinus" / "mackenna-1917.json").read_text(encoding="utf-8"))

    def test_the_file_is_what_the_tool_makes(self):
        path, text = mackenna.write("mackenna-1917")
        self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_the_first_ennead_its_nine_treatises(self):
        # Porphyry's Life of Plotinus first (milestone E5), then the nine treatises.
        self.assertEqual([t["id"] for t in self.d["treatises"]], ["Life"] + [f"I.{n}" for n in range(1, 10)])
        self.assertEqual(self.d["treatises"][1]["title"], "The Animate and the Man")
        self.assertEqual(self.d["treatises"][9]["title"], "The Reasoned Dismissal")
        self.assertEqual([len(t["chapters"]) for t in self.d["treatises"]], [26, 13, 7, 6, 16, 10, 9, 3, 12, 1])

    def test_the_life_of_plotinus_its_twenty_six_chapters(self):
        life = self.d["treatises"][0]
        self.assertEqual(life["title"], "Porphyry: On the Life of Plotinus and the Arrangement of his Work")
        self.assertEqual([c["id"] for c in life["chapters"]], [f"Life.{n}" for n in range(1, 27)])
        self.assertEqual(life["page"], 1)
        ch = {c["id"]: c for c in life["chapters"]}
        self.assertTrue(ch["Life.1"]["paras"][0].startswith("Plotinus, the philosopher our contemporary, seemed ashamed"))
        self.assertIn("At twenty he was caught by the passion for philosophy", " ".join(ch["Life.3"]["paras"]))
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna", 1917))

    def test_running_heads_and_page_numbers_are_taken_out(self):
        text = " ".join(p for t in self.d["treatises"] for c in t["chapters"] for p in c["paras"])
        self.assertNotIn("PLOTINUS", text)
        self.assertNotIn("THE ANIMATE AND THE MAN", text)
        self.assertNotRegex(text, r"\] [A-Z]{4,}")
        ch = self.d["treatises"][1]["chapters"]
        self.assertEqual([c["page"] for c in ch[:4]], [29, 29, 31, 32])

    def test_broken_words_and_paragraphs_are_joined(self):
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        i3 = " ".join(ch["I.1.3"]["paras"])
        self.assertIn("using the body as an instrument, it does not follow", i3)       # "instru- / ment"
        self.assertIn("have Sense-Perception since its use", i3)                           # "Sense- / Perception" keeps its hyphen
        # A paragraph cut by the page break after p. 29 is one paragraph again.
        self.assertIn("between Soul and Essential Soul (between an individual Soul", " ".join(ch["I.1.2"]["paras"]))
        for c in ch.values():
            for p in c["paras"]:
                if c["id"] == "Life.22":
                    continue    # the oracle on Plotinus, in verse, its lines kept as MacKenna set them
                self.assertRegex(p, r"[.?!:;\"')—\]]$", c["id"])

    def test_chapters_open_with_macKennas_words(self):
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["I.1.1"]["paras"][0].startswith("Pleasure and distress, fear and courage"))
        self.assertTrue(ch["I.1.13"]["paras"][0].startswith("And the principle that reasons out these matters"))
        self.assertTrue(ch["I.9.1"]["paras"][0].startswith('" You will not dismiss your Soul'))


class MacKennaVolumeIII(unittest.TestCase):
    """MacKenna's vol. III (1924), brought in by milestone E15: the Fourth Ennead."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "plotinus" / "mackenna-1924.json").read_text(encoding="utf-8"))
        cls.t = {t["id"]: t for t in cls.d["treatises"]}

    def test_the_file_is_what_the_tool_makes(self):
        path, text = mackenna.write("mackenna-1924")
        self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_the_fourth_ennead(self):
        self.assertEqual([t["id"] for t in self.d["treatises"]], [f"IV.{n}" for n in range(1, 10)])
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna", 1924))
        self.assertEqual((self.t["IV.1"]["page"], self.t["IV.4"]["page"]), (1, 47))

    def test_iv_1_and_iv_4_their_chapters_and_pages(self):
        # IV.1 is one chapter, as Volkmann's. The OCR lost the numbers of IV.4's chapters 15, 17, 31, 38 and 41 (a blank
        # line where the scan prints them), so their text runs on in the chapter before.
        self.assertEqual([c["n"] for c in self.t["IV.1"]["chapters"]], [1])
        self.assertEqual([c["n"] for c in self.t["IV.4"]["chapters"]], [n for n in range(1, 46) if n not in (15, 17, 31, 38, 41)])
        self.assertEqual([c["page"] for c in self.t["IV.4"]["chapters"]][:15], [47, 49, 50, 51, 51, 53, 53, 54, 56, 57, 58, 59, 60, 62, 63])
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["IV.1.1"]["paras"][0].startswith("In the Intellectual Kosmos dwells Authentic Essence"))
        self.assertTrue(ch["IV.1.1"]["paras"][-1].endswith("it is divided as being effective in every part."))
        self.assertTrue(ch["IV.4.1"]["paras"][0].startswith("What, then, will be the Soul's discourse"))
        self.assertTrue(any(p.startswith("But there is a difficulty affecting this entire settlement") for p in ch["IV.4.14"]["paras"]))
        self.assertTrue(any(p.startswith("But how comes it that the intuitions") for p in ch["IV.4.16"]["paras"]))
        self.assertTrue(ch["IV.4.18"]["paras"][0].startswith("There remains the question whether the body"))
        text = " ".join(p for c in ch.values() for p in c["paras"])
        self.assertNotIn("ACKNOWLEDGEMENT", text)
        self.assertNotIn("SECOND TRACTATE", text)


class MacKennaVolumeIV(unittest.TestCase):
    """MacKenna's vol. IV (1926), brought in by milestone E20: the Fifth Ennead."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "plotinus" / "mackenna-1926.json").read_text(encoding="utf-8"))
        cls.t = {t["id"]: t for t in cls.d["treatises"]}

    def test_the_file_is_what_the_tool_makes(self):
        path, text = mackenna.write("mackenna-1926")
        self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_the_fifth_ennead(self):
        self.assertEqual([t["id"] for t in self.d["treatises"]], [f"V.{n}" for n in range(1, 10)])
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna", 1926))
        self.assertEqual((self.t["V.4"]["page"], self.t["V.5"]["page"]), (43, 47))
        # Titles over two lines are read whole, and "THE NINTH TRACTATE" begins a treatise as "NINTH TRACTATE" does.
        self.assertEqual(self.t["V.4"]["title"], "How THE SECONDARIES RISE FROM THE FIRST: AND ON THE ONE")
        self.assertTrue(self.t["V.5"]["title"].endswith("INTELLECTUAL-PRINCIPLE AND ON THE NATURE OF THE GOOD"))
        self.assertTrue(self.t["V.9"]["title"].endswith("THE AUTHENTIC EXISTENCE"))

    def test_v_4_and_v_5_their_chapters_and_pages(self):
        self.assertEqual([c["n"] for c in self.t["V.4"]["chapters"]], [1, 2])
        self.assertEqual([c["n"] for c in self.t["V.5"]["chapters"]], list(range(1, 14)))
        self.assertEqual([c["page"] for c in self.t["V.5"]["chapters"]], [47, 48, 50, 51, 53, 54, 55, 55, 57, 58, 59, 60, 62])
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["V.4.1"]["paras"][0].startswith("Anything existing after The First must necessarily arise"))
        self.assertTrue(ch["V.4.2"]["paras"][-1].endswith("is the universe of things."))
        self.assertTrue(ch["V.5.1"]["paras"][0].startswith("The Intellectual Principle, the veritably and essentially"))
        self.assertTrue(ch["V.5.8"]["paras"][0].startswith("so that we are left wondering whence it came"))
        self.assertTrue(ch["V.5.13"]["paras"][-1].endswith("must surpass the made."))
        text = " ".join(p for c in ch.values() for p in c["paras"])
        self.assertNotIn("ACKNOWLEDGEMENTS", text)
        self.assertNotIn("FIFTH TRACTATE", text)

    def test_v_7_and_v_8_their_chapters_and_pages(self):
        # V.7 in 3 chapters, as Volkmann's. The OCR lost MacKenna's number 13 of V.8 (two blank lines where the scan
        # prints it), so its text runs on in his 12. V.8 begins on p. 73, whose running head the OCR set before the title;
        # the next head, "74 PLOT1NUS", is read as p. 74 and taken out of the text, as are those of pp. 2, 18, 20, 24 and 32.
        self.assertEqual([c["n"] for c in self.t["V.7"]["chapters"]], [1, 2, 3])
        self.assertEqual([c["n"] for c in self.t["V.8"]["chapters"]], list(range(1, 13)))
        self.assertEqual((self.t["V.7"]["page"], self.t["V.8"]["page"]), (69, 73))
        self.assertEqual([c["page"] for c in self.t["V.8"]["chapters"]][:3], [73, 74, 76])
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["V.7.1"]["paras"][0].startswith("We have to examine the question whether there exists"))
        self.assertTrue(ch["V.8.1"]["paras"][0].startswith("It is a principle with us that one who has attained"))
        self.assertTrue(any(p.startswith("The God fettered (as in the Kronos Myth)") for p in ch["V.8.12"]["paras"]))
        self.assertTrue(ch["V.8.12"]["paras"][-1].endswith("must we make yet another attempt by another road ?"))
        text = " ".join(p for c in ch.values() for p in c["paras"])
        self.assertNotIn("PLOT1NUS", text)
        self.assertIn("V.8.13", mackenna.VOLUMES["mackenna-1926"]["lost"])


class MacKennaVolumeV(unittest.TestCase):
    """MacKenna's vol. V (1930), brought in by milestone E22: the Sixth Ennead."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "plotinus" / "mackenna-1930.json").read_text(encoding="utf-8"))
        cls.t = {t["id"]: t for t in cls.d["treatises"]}

    def test_the_file_is_what_the_tool_makes(self):
        path, text = mackenna.write("mackenna-1930")
        self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_the_sixth_ennead(self):
        # B. S. Page translated VI.1 to VI.3 for MacKenna's last volume, and revised the rest.
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna and B. S. Page", 1930))
        self.assertEqual(self.d["scan"], "https://archive.org/details/plotinusononegoo0005step")
        self.assertEqual(self.d["treatises"][0]["id"], "VI.1")
        self.assertEqual(self.t["VI.1"]["title"], "On THE KINDS OF BEING: FIRST TREATISE")
        self.assertEqual(self.t["VI.1"]["page"], 1)

    def test_vi_1_its_thirty_chapters_and_pages(self):
        # The OCR lost or misread most of VI.1's chapter numbers ("on" for 3, "a." for 7, none at all for 2 and 5); the
        # volume's "misread" and "unnumbered" lists put each chapter where the scan prints its number.
        self.assertEqual([c["n"] for c in self.t["VI.1"]["chapters"]], list(range(1, 31)))
        self.assertEqual([c["page"] for c in self.t["VI.1"]["chapters"]][:15], [1, 2, 3, 4, 6, 7, 8, 10, 11, 13, 15, 16, 19, 20, 21])
        ch = {c["id"]: c for c in self.t["VI.1"]["chapters"]}
        self.assertTrue(ch["VI.1.1"]["paras"][0].startswith("Philosophy at a very early stage investigated"))
        self.assertTrue(ch["VI.1.1"]["paras"][-1].endswith("the Supreme they overlooked."))
        self.assertTrue(ch["VI.1.2"]["paras"][0].startswith("But are we really obliged to posit"))
        self.assertTrue(ch["VI.1.3"]["paras"][0].startswith("But perhaps we should rather speak of some single category"))
        self.assertTrue(ch["VI.1.5"]["paras"][0].startswith("Speech, time, motion"))
        self.assertTrue(ch["VI.1.7"]["paras"][0].startswith("Now if we do not mean anything by Relation"))
        self.assertTrue(ch["VI.1.11"]["paras"][0].startswith("But if these considerations are sound"))
        self.assertTrue(ch["VI.1.13"]["paras"][0].startswith("With regard to Date"))
        self.assertTrue(ch["VI.1.15"]["paras"][-1].endswith("should not also constitute a distinct genus."))
        self.assertTrue(ch["VI.1.30"]["paras"][0].startswith("With regard to States"))
        # Running heads, the OCR's misread numbers and the printer's signatures are taken out.
        text = " ".join(p for c in ch.values() for p in c["paras"])
        for junk in ("PLOTINUS", "KINDS OF BEING", " ids ", " oy ", "2%:", "SECOND TRACTATE"):
            self.assertNotIn(junk, text)

    def test_vi_2_its_twenty_two_chapters_and_pages(self):
        # Milestone E24: the OCR misread eight of VI.2's chapter numbers ("of" for 5, "Io." for 10, "52:" for 12, "ai." for
        # 21) and lost one (2); its first number ("x.") under the title, a library's stamp and four signatures are taken out.
        self.assertEqual(self.t["VI.2"]["page"], 40)
        self.assertEqual([c["n"] for c in self.t["VI.2"]["chapters"]], list(range(1, 23)))
        self.assertEqual([c["page"] for c in self.t["VI.2"]["chapters"]],
                         [40, 41, 43, 44, 45, 46, 47, 49, 51, 53, 54, 56, 57, 58, 59, 60, 60, 61, 62, 63, 64, 66])
        ch = {c["id"]: c for c in self.t["VI.2"]["chapters"]}
        self.assertTrue(ch["VI.2.1"]["paras"][0].startswith("We have examined the proposed"))
        self.assertTrue(ch["VI.2.1"]["paras"][-1].endswith("on the nature of the world of Sense."))
        self.assertTrue(ch["VI.2.2"]["paras"][0].startswith("In asserting that Being is not a unity"))
        self.assertTrue(ch["VI.2.5"]["paras"][0].startswith("A first point demanding consideration"))
        self.assertTrue(ch["VI.2.9"]["paras"][0].startswith("The above considerations"))
        self.assertTrue(ch["VI.2.11"]["paras"][0].startswith("We are bound however to enquire"))
        self.assertTrue(ch["VI.2.12"]["paras"][0].startswith("Enough upon that side of the question"))
        self.assertTrue(ch["VI.2.21"]["paras"][0].startswith("How then does the universal Intellect"))
        self.assertTrue(ch["VI.2.22"]["paras"][-1].endswith("both coexist in the Intellectual realm."))
        text = " ".join(p for c in ch.values() for p in c["paras"])
        for junk in ("WITHDRAWN", "UNIVERSIT", "elements. G Suppose", "that H its", "which K produce", "x. We"):
            self.assertNotIn(junk, text)

    def test_vi_3_its_twenty_eight_chapters_and_pages(self):
        # Milestone E25: the OCR misread four of VI.3's first fourteen chapter numbers ("4. ." for 4, "ie" for 7, "Q." for
        # 9, "Iz." for 12) and lost two (3 and 5); "Te" under the title, a smudge, the signatures L and M and a ";" are
        # taken out. Milestone E26: it misread five more ("<7:" for 17, "IQ." for 19, "2." for 21, "223" for 22, "25. |"
        # for 25), and "ce)" inside 21 is taken out.
        self.assertEqual(self.t["VI.3"]["page"], 68)
        self.assertEqual([c["n"] for c in self.t["VI.3"]["chapters"]], list(range(1, 29)))
        self.assertEqual([c["page"] for c in self.t["VI.3"]["chapters"]],
                         [68, 69, 71, 72, 74, 75, 76, 78, 79, 81, 82, 83, 84, 85,
                          87, 88, 90, 91, 93, 94, 96, 98, 100, 101, 102, 103, 104, 106])
        ch = {c["id"]: c for c in self.t["VI.3"]["chapters"]}
        self.assertTrue(ch["VI.3.1"]["paras"][0].startswith("We have now explained our conception of Reality"))
        self.assertTrue(ch["VI.3.2"]["paras"][0].startswith("Our first observations must be directed"))
        self.assertTrue(ch["VI.3.3"]["paras"][0].startswith("How then do we go to work"))
        self.assertTrue(ch["VI.3.4"]["paras"][0].startswith("What, then, we have to ask, is the constant element"))
        self.assertTrue(ch["VI.3.5"]["paras"][0].startswith("These are incontrovertible facts"))
        self.assertTrue(ch["VI.3.7"]["paras"][0].startswith("But Matter, it may be contended"))
        self.assertTrue(ch["VI.3.9"]["paras"][0].startswith("So much for one of the genera"))
        self.assertTrue(ch["VI.3.12"]["paras"][0].startswith("It follows that we. must allow contrariety"))
        self.assertTrue(ch["VI.3.14"]["paras"][-1].endswith("classification of the magnitudes so differentiated."))
        text = " ".join(p for k in range(1, 15) for p in ch[f"VI.3.{k}"]["paras"])
        for junk in ("Te We", "eee", "to L which", "action. : ;", "the M qualification", "Body; the particular Form acts as a M"):
            self.assertNotIn(junk, text)
        self.assertIn("all other things proceed and to which they owe their existence", text)
        self.assertTrue(ch["VI.3.15"]["paras"][0].startswith("How far is it true that equality and inequality"))
        self.assertTrue(ch["VI.3.16"]["paras"][0].startswith("When each of the entities bound up with the pseudo-substance"))
        self.assertTrue(ch["VI.3.16"]["paras"][-1].endswith("no substance which is in any sense Intellectual."))
        self.assertTrue(ch["VI.3.17"]["paras"][0].startswith("This procedure, if approved"))
        self.assertTrue(ch["VI.3.19"]["paras"][0].startswith("With Quality we have undertaken to group"))
        self.assertTrue(ch["VI.3.21"]["paras"][0].startswith("The claim of Motion to be established as a genus"))
        self.assertTrue(ch["VI.3.22"]["paras"][0].startswith("But suppose that we identify alteration with Motion"))
        self.assertTrue(ch["VI.3.25"]["paras"][0].startswith("The nature of integration and disintegration"))
        self.assertTrue(ch["VI.3.27"]["paras"][0].startswith("What view are we to take of that which is opposed to Motion"))
        self.assertTrue(ch["VI.3.28"]["paras"][-1].endswith("Our investigation into the kinds of Being is now complete."))
        late = " ".join(p for k in range(15, 29) for p in ch[f"VI.3.{k}"]["paras"])
        for junk in ("<7:", "IQ.", "223", "25. |", "ce)"):
            self.assertNotIn(junk, late)
        self.assertIn("confused with becoming itself. Yet becoming", late)

    def test_vi_4_its_sixteen_chapters_and_pages(self):
        # Milestone E27: MacKenna's own English (Page did only VI.1 to VI.3). The OCR misread seven of VI.4's chapter
        # numbers ("Be" for 2, "ye" for 7, "Q." for 9, "10. ," for 10, "rt." for 11, "pier" for 12, "TS." for 15); the
        # signatures Q and R, which follow a line of text, are taken out; the heads of p. 117 ("oper") and p. 118
        # ("PLOTINUS*") are read as heads, so the pages after them are right.
        self.assertEqual(self.d["translator"], "Stephen MacKenna and B. S. Page")
        self.assertEqual(self.t["VI.4"]["page"], 106)
        self.assertEqual([c["n"] for c in self.t["VI.4"]["chapters"]], list(range(1, 17)))
        self.assertEqual([c["page"] for c in self.t["VI.4"]["chapters"]],
                         [106, 107, 109, 110, 112, 113, 113, 115, 116, 117, 118, 119, 121, 122, 123, 124])
        ch = {c["id"]: c for c in self.t["VI.4"]["chapters"]}
        self.assertTrue(ch["VI.4.1"]["paras"][0].startswith("How are we to explain the omnipresence of the soul?"))
        self.assertTrue(ch["VI.4.2"]["paras"][0].startswith("Side by side exist the Authentic All"))
        self.assertTrue(ch["VI.4.7"]["paras"][0].startswith("Let us consider once more"))
        self.assertTrue(ch["VI.4.9"]["paras"][0].startswith("If in such a partition of the unity"))
        self.assertTrue(ch["VI.4.10"]["paras"][0].startswith("We may be told that an image"))
        self.assertTrue(ch["VI.4.11"]["paras"][0].startswith("Still, this integral omnipresence admitted"))
        self.assertTrue(ch["VI.4.12"]["paras"][0].startswith("Think of a sound passing through the air"))
        self.assertTrue(ch["VI.4.15"]["paras"][0].startswith("But how did this intruder find entrance"))
        self.assertTrue(ch["VI.4.16"]["paras"][-1].endswith("But it is time to return to our main theme :—"))
        text = " ".join(p for k in range(1, 17) for p in ch[f"VI.4.{k}"]["paras"])
        for junk in ("variously Q placed", "point. R", "“e", "EXISTENT oper", " oper ", "PLOTINUS"):
            self.assertNotIn(junk, text)
        self.assertIn("variously placed entity", text)
        # VI.5 begins its own treatise on p. 125.
        self.assertEqual(self.t["VI.5"]["page"], 125)

    def test_vi_5_its_twelve_chapters_and_pages(self):
        # Milestone E28: MacKenna's own English. The OCR misread five of VI.5's chapter numbers ("Bi" for 2, "Fi" for 7,
        # "Q." for 9, "Tai" for 11, "52" for 12); the signature T at the end of VI.5.12, after a line of text, is taken
        # out; the head of p. 131 ("VI. 5. 8}") is read as a head.
        self.assertEqual(self.t["VI.5"]["page"], 125)
        self.assertEqual([c["n"] for c in self.t["VI.5"]["chapters"]], list(range(1, 13)))
        self.assertEqual([c["page"] for c in self.t["VI.5"]["chapters"]],
                         [125, 126, 127, 128, 129, 130, 130, 131, 132, 134, 135, 136])
        ch = {c["id"]: c for c in self.t["VI.5"]["chapters"]}
        self.assertTrue(ch["VI.5.1"]["paras"][0].startswith("The integral omnipresence of a unity numerically identical"))
        self.assertTrue(ch["VI.5.2"]["paras"][0].startswith("Now the reasoning faculty which undertakes this problem"))
        self.assertTrue(ch["VI.5.7"]["paras"][0].startswith("To Real Being we go back"))
        self.assertTrue(ch["VI.5.9"]["paras"][0].startswith("The elements in their totality"))
        self.assertTrue(ch["VI.5.11"]["paras"][0].startswith("But how can the unextended reach over"))
        self.assertTrue(ch["VI.5.12"]["paras"][0].startswith("To return : How is that Power present"))
        self.assertTrue(ch["VI.5.12"]["paras"][-1].endswith("by its very lack of extension is infinite."))
        text = " ".join(p for k in range(1, 13) for p in ch[f"VI.5.{k}"]["paras"])
        for junk in ("OMNIPRESENCE", "PLOTINUS", "VI. 5", "Ss ’", "infinite. T", " Bi ", " Fi ", " Tai "):
            self.assertNotIn(junk, text)
        # "not." at the end of a line of VI.5.4 is MacKenna's, the end of a sentence.
        self.assertIn("something exists in which it is not.", text)
        # VI.6 begins its own treatise on p. 138.
        self.assertEqual(self.t["VI.6"]["page"], 138)

    def test_vi_6_its_eighteen_chapters_and_pages(self):
        # Milestone E29: MacKenna's own English. VI.7's heading reads "SEVEN:EH, TRACTATE" in the OCR and is read as
        # "SEVENTH TRACTATE", so VI.7's chapters 3 to 6 (pp. 166-169) are no longer taken as VI.6's. The OCR misread six of
        # VI.6's chapter numbers ("3," for 3, "Ve" for 7, "Q." for 9, "iets" for 11, "ies" for 12, "17:" for 17) and lost
        # 5, which begins at its first words; p. 151's head ("t5t") is read, and "x" inside VI.6.14 is taken out.
        self.assertEqual(self.t["VI.6"]["page"], 138)
        self.assertEqual([c["n"] for c in self.t["VI.6"]["chapters"]], list(range(1, 19)))
        self.assertEqual([c["page"] for c in self.t["VI.6"]["chapters"]],
                         [138, 139, 139, 141, 142, 143, 144, 145, 146, 147, 149, 150, 151, 153, 155, 157, 158, 160])
        ch = {c["id"]: c for c in self.t["VI.6"]["chapters"]}
        self.assertTrue(ch["VI.6.1"]["paras"][0].startswith("It is suggested that multiplicity is a falling away"))
        self.assertTrue(ch["VI.6.3"]["paras"][0].startswith("And there is the question How can the infinite"))
        self.assertTrue(ch["VI.6.5"]["paras"][0].startswith("What then is the veritable nature of Number"))
        self.assertTrue(ch["VI.6.7"]["paras"][0].startswith("It is inevitably necessary to think of all"))
        self.assertTrue(ch["VI.6.9"]["paras"][0].startswith("It remains then to consider whether Being"))
        self.assertTrue(ch["VI.6.11"]["paras"][0].startswith("It may be suggested that the dekad"))
        self.assertTrue(ch["VI.6.12"]["paras"][0].startswith("We may be told that unity and monad"))
        self.assertTrue(ch["VI.6.17"]["paras"][0].startswith("But what of the Infinite Number"))
        # VI.6.18 runs past p. 161's last line ("For Being alone has Being in its own right.") onto the top of p. 162,
        # and ends as the Greek ends (τὸ δὲ εἶναι αὔταρκες ἑαυτῷ).
        text18 = " ".join(ch["VI.6.18"]["paras"])
        self.assertIn("For Being alone has Being in its own right.", text18)
        self.assertTrue(ch["VI.6.18"]["paras"][-1].endswith("but Being is sufficient to itself."))
        text = " ".join(p for k in range(1, 19) for p in ch[f"VI.6.{k}"]["paras"])
        for junk in ("ON NUMBERS", "PLOTINUS", "VI. 6", "SEVEN", "God, or some one of the gods", "share ; x", " Xi", " iets ", " ies "):
            self.assertNotIn(junk, text)
        # "Tests" and "fro ?" are lines of MacKenna's text in VI.6.3, and stay.
        self.assertIn("not fixed in Tests", text)
        self.assertIn("rocking to and fro ?", text)
        # VI.7 begins its own treatise on p. 162.
        self.assertEqual(self.t["VI.7"]["page"], 162)
        self.assertTrue(self.t["VI.7"]["title"].startswith("How THE MULTIPLICITY OF THE IDEAL-FORMS"))


    def test_vi_7_its_first_fourteen_chapters_and_pages(self):
        # Milestone E30: MacKenna's own English. The second line of VI.7's title, "Upon THE GoopD", is read as the
        # title's, so VI.7.1 begins with "God, or some one of the gods". The OCR misread five of the first fourteen
        # chapter numbers ("a" for 2, "We" for 7, "IO." for 10, "ris &" for 11, "12:" for 12) and lost 9, which begins
        # at its first words; p. 172's head ("172 BEOTINUS") is read, and the signatures "Z" and "2A" are taken out.
        self.assertEqual(self.t["VI.7"]["page"], 162)
        self.assertEqual(self.t["VI.7"]["title"], "How THE MULTIPLICITY OF THE IDEAL-FORMS CAME INTO BEING AND UPON THE GOOD")
        self.assertEqual([c["n"] for c in self.t["VI.7"]["chapters"]][:14], list(range(1, 15)))
        self.assertEqual([c["page"] for c in self.t["VI.7"]["chapters"]][:14],
                         [162, 164, 166, 167, 168, 169, 170, 171, 172, 174, 175, 177, 178, 180])
        ch = {c["id"]: c for c in self.t["VI.7"]["chapters"]}
        self.assertTrue(ch["VI.7.1"]["paras"][0].startswith("God, or some one of the gods, in sending the souls"))
        self.assertTrue(ch["VI.7.2"]["paras"][0].startswith("Thus we have even here the means of knowing"))
        self.assertTrue(ch["VI.7.7"]["paras"][0].startswith("But if it is by becoming evil and inferior"))
        self.assertTrue(ch["VI.7.9"]["paras"][0].startswith("Admitted, then—it will be said—for the nobler forms of life"))
        self.assertTrue(ch["VI.7.10"]["paras"][0].startswith("But failure There?"))
        self.assertTrue(ch["VI.7.11"]["paras"][0].startswith("The very heavens, patently multiple"))
        self.assertTrue(ch["VI.7.12"]["paras"][0].startswith("Or take it another way"))
        self.assertTrue(ch["VI.7.14"]["paras"][-1].endswith("that authentic Sympathy consists in all being a unity and never discriminate."))
        text = " ".join(p for k in range(1, 15) for p in ch[f"VI.7.{k}"]["paras"])
        for junk in ("GoopD", "Upon THE", "BEOTINUS", "PLOTINUS", "IDEAL-FORMS", " Z ", " 2A", "ris &", " IO. "):
            self.assertNotIn(junk, text)
        self.assertIn("it could not be thought of in order to be made", text)

class MacKennaVolumeII(unittest.TestCase):
    """MacKenna's vol. II (1921), brought in by milestone E7: the Third Ennead, then the Second."""

    @classmethod
    def setUpClass(cls):
        cls.d = json.loads((ROOT / "texts" / "plotinus" / "mackenna-1921.json").read_text(encoding="utf-8"))
        cls.t = {t["id"]: t for t in cls.d["treatises"]}

    def test_the_file_is_what_the_tool_makes(self):
        path, text = mackenna.write("mackenna-1921")
        self.assertEqual(path.read_text(encoding="utf-8"), text)

    def test_the_third_ennead_then_the_second(self):
        self.assertEqual([t["id"] for t in self.d["treatises"]],
                         [f"III.{n}" for n in range(1, 10)] + [f"II.{n}" for n in range(1, 10)])
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna", 1921))
        self.assertEqual(self.t["III.1"]["page"], 1)

    def test_ii_1_and_ii_2_their_chapters_and_pages(self):
        # As Volkmann's: II.1 in 8 chapters ("6-," is the OCR's 6), II.2 in 3. II.1 begins on p. 143, which prints no
        # page number; II.2 begins part way down p. 154.
        self.assertEqual(self.t["II.1"]["title"], "On the Kosmos or on the Heavenly System")
        self.assertEqual(self.t["II.2"]["title"], "The Heavenly Circuit")
        self.assertEqual([c["n"] for c in self.t["II.1"]["chapters"]], list(range(1, 9)))
        self.assertEqual([c["n"] for c in self.t["II.2"]["chapters"]], [1, 2, 3])
        self.assertEqual([c["page"] for c in self.t["II.1"]["chapters"]], [143, 144, 145, 146, 148, 149, 151, 153])
        self.assertEqual((self.t["II.1"]["page"], self.t["II.2"]["page"]), (143, 154))
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["II.1.1"]["paras"][0].startswith("We hold that the ordered universe, in its material mass"))
        self.assertTrue(ch["II.1.6"]["paras"][0].startswith("We may now consider the question whether fire"))
        self.assertTrue(ch["II.2.1"]["paras"][0].startswith("But whence that circular movement ?"))
        self.assertTrue(ch["II.2.3"]["paras"][-1].startswith("And this is why the All, circling as it does"))
        text = " ".join(p for c in ch.values() for p in c["paras"])
        self.assertNotIn("PLOTINUS", text)
        self.assertNotIn("THE KOSMOS", text)
        self.assertNotIn("NOTE ON THE ORDER", text)


class Files(unittest.TestCase):
    def test_labelled_as_the_workshops_own_and_machine_assisted(self):
        d = load()
        self.assertEqual((d["by"], d["kind"], d["text"], d["greek_text"]), ("Workshop modern version", "enneads", "enneads", "plotinus-enneads"))
        self.assertIs(d["machine_assisted"], True)
        self.assertIn("machine-assisted", d["label"])
        self.assertIn("not yet checked by a scholar", d["label"])
        self.assertIn("MacKenna", d["about"])
        self.assertEqual(d["older"]["translator"], "Stephen MacKenna")

    def test_the_contents_are_the_fifty_four_in_porphyrys_order(self):
        d = load()
        ids = [c["id"] for c in d["contents"]]
        # Porphyry's Life of Plotinus, before the Enneads (milestones E5-E6), then the fifty-four.
        self.assertEqual(ids[0], "Life")
        ids = ids[1:]
        self.assertEqual(len(ids), 54)
        self.assertEqual(ids[:3], ["I.1", "I.2", "I.3"])
        self.assertEqual(ids[-1], "VI.9")
        self.assertEqual([sum(1 for i in ids if i.split(".")[0] == e) for e in ["I", "II", "III", "IV", "V", "VI"]], [9] * 6)
        taylor = [c["id"] for c in d["contents"] if c["status"] == "taylor"]
        self.assertEqual(sorted(taylor), sorted(modern_enneads.taylor_treatises()))
        self.assertEqual(len(taylor), 15)
        here = [c["id"] for c in d["contents"] if c["status"] == "here"]
        self.assertEqual(d["contents"][0]["status"], "here")
        self.assertEqual(here, [t["id"] for t in d["treatises"]])
        for c in d["contents"]:
            if c["status"] == "to come":
                self.assertRegex(c["milestone"], r"^E\d+(-E\d+)?$", c["id"])

    def test_milestone_e1_the_first_treatise(self):
        d = load()
        self.assertEqual(d["treatises"][1]["id"], "I.1")
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.1"], [f"I.1.{n}" for n in range(1, 14)])
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"], c["id"])
            self.assertTrue(c["older"], f"{c['id']}: MacKenna's chapter is shown with it")
            # MacKenna's vol. I (1917) for the Life and Ennead I, vol. II (1921) for Enneads II and III (E7 onward),
            # vol. III (1924) for Ennead IV (E15 onward), vol. IV (1926) for Ennead V (E20 onward), vol. V (1930) for
            # Ennead VI (E22 onward).
            self.assertEqual(c["older"][0]["year"], 1930 if c["treatise"].startswith("VI.") else
                             1926 if c["treatise"].startswith("V.") else
                             1924 if c["treatise"].startswith("IV.") else
                             1921 if c["treatise"].startswith(("II.", "III.")) else 1917)
        first = next(p for p in d["paragraphs"] if p["seg"] == "I.1.1.p1")
        self.assertTrue(first["modern"].startswith("Pleasures and pains, fears and boldness"))
        self.assertTrue(first["greek"].startswith("Ἡδοναὶ καὶ λῦπαι"))

    def test_milestone_e2_on_happiness_and_time(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][:3], ["I.1", "I.4", "I.5"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.4"], [f"I.4.{n}" for n in range(1, 17)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.5"], [f"I.5.{n}" for n in range(1, 11)])
        first = next(p for p in d["paragraphs"] if p["seg"] == "I.4.1.p1")
        self.assertTrue(first["modern"].startswith("If we take living well and being happy to be the same thing"))
        self.assertTrue(first["greek"].startswith("Τὸ εὖ ζῆν καὶ τὸ εὐδαιμονεῖν"))
        # The lantern in the storm (I.4.8), and time as the image of eternity (I.5.7, the Timaeus).
        self.assertIn("like the light in a lantern", next(p for p in d["paragraphs"] if p["seg"] == "I.4.8.p1")["modern"])
        flags = {p["seg"]: p.get("flags", []) for p in d["paragraphs"]}
        self.assertIn("Timaeus", flags["I.5.7.p1"][0]["why"])
        # MacKenna's "last year's morality" is the Greek's wisdom (φρόνησις).
        self.assertTrue(any("wisdom" in f["why"] for f in flags["I.5.8.p1"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("I.4.", "I.5."))), 15)

    def test_milestone_e3_on_beauty_and_the_first_good(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][:5], ["I.1", "I.4", "I.5", "I.6", "I.7"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.6"], [f"I.6.{n}" for n in range(1, 10)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.7"], [f"I.7.{n}" for n in range(1, 4)])
        first = next(p for p in d["paragraphs"] if p["seg"] == "I.6.1.p1")
        self.assertTrue(first["modern"].startswith("Beauty is found mostly in what we see"))
        self.assertTrue(first["greek"].startswith("Τὸ καλόν ἐστι μὲν ἐν ὄψει"))
        # The sculptor and his statue (I.6.9), and the light that is towards the sun (I.7.1).
        self.assertIn("fashioning your own statue", next(p for p in d["paragraphs"] if p["seg"] == "I.6.9.p1")["modern"])
        flags = {p["seg"]: p.get("flags", []) for p in d["paragraphs"]}
        # MacKenna's "perfect goodness" is the Phaedrus' self-control on its holy pedestal.
        self.assertTrue(any("Phaedrus" in f["why"] for f in flags["I.6.9.p1"]))
        self.assertTrue(any("towards the sun" in f["why"] for f in flags["I.7.1.p3"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("I.6.", "I.7."))), 20)

    def test_milestone_e4_evils_and_going_out_of_life(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][:7], ["I.1", "I.4", "I.5", "I.6", "I.7", "I.8", "I.9"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.8"], [f"I.8.{n}" for n in range(1, 16)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.9"], ["I.9.1"])
        # MacKenna's I.8 has 12 chapters for Volkmann's 15: his 10 holds 10 to 13, his 11 and 12 are 14 and 15.
        older = {c["id"]: [o["n"] for o in c["older"]] for c in d["chapters"] if c["treatise"] == "I.8"}
        self.assertEqual([older[f"I.8.{n}"] for n in range(9, 16)], [[9], [10], [10], [10], [10], [11], [12]])
        first = next(p for p in d["paragraphs"] if p["seg"] == "I.8.1.p1")
        self.assertTrue(first["modern"].startswith("Those who ask where evils come from"))
        self.assertTrue(first["greek"].startswith("Οἱ ζητοῦντες πόθεν τὰ κακά"))
        # The golden chains (I.8.15), and the oracle that opens I.9.
        self.assertIn("bound in gold", next(p for p in d["paragraphs"] if p["seg"] == "I.8.15.p3")["modern"])
        self.assertTrue(next(p for p in d["paragraphs"] if p["seg"] == "I.9.1.p1")["modern"].startswith('"You shall not lead it out'))
        flags = {p["seg"]: p.get("flags", []) for p in d["paragraphs"]}
        # MacKenna gives the first activity to the Good; the Greek gives it to intellect.
        self.assertTrue(any("intellect" in f["why"] for f in flags["I.8.2.p2"]))
        self.assertTrue(any("assents" in f["why"] for f in flags["I.8.14.p1"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("I.8.", "I.9."))), 25)

    def test_milestone_e5_porphyrys_life_chapters_1_to_12(self):
        d = load()
        self.assertEqual(d["treatises"][0]["id"], "Life")
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "Life"][:12], [f"Life.{n}" for n in range(1, 13)])
        life = d["contents"][0]
        self.assertEqual((life["status"], life["first"]), ("here", "Life.1"))
        # The Greek is Volkmann's own, proofread from the scan: chapter 1 on p. 3, chapter 12 on p. 18.
        ch = {c["id"]: c for c in d["chapters"]}
        self.assertEqual((ch["Life.1"]["greek_text"], ch["Life.1"]["greek_label"]), ("porphyry-life-plotinus", "p. 3"))
        self.assertEqual(ch["Life.12"]["greek_pages"][-1], "ia-volkmann-t1:48")
        first = next(p for p in d["paragraphs"] if p["seg"] == "Life.1.p1")
        self.assertTrue(first["greek"].startswith("Πλωτῖνος ὁ καθ’ ἡμᾶς γεγονὼς φιλόσοφος"))
        self.assertIn("ashamed", first["modern"])
        # The order of the books: twenty-one before Porphyry came, twenty-four in his six years, five and four after.
        lists = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"] in ("Life.4", "Life.5", "Life.6"))
        for n in ("1", "21", "22-23", "45", "46", "50", "51", "54"):
            self.assertIn(f"[{n}, ", lists)
        flags = {p["seg"]: p.get("flags", []) for p in d["paragraphs"]}
        # MacKenna drops the eight from Plotinus' twenty-eighth year.
        self.assertTrue(any("twenty-eighth" in f["why"] for f in flags["Life.3.p2"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith("Life.")), 15)

    def test_milestone_e6_porphyrys_life_chapters_13_to_26(self):
        d = load()
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "Life"], [f"Life.{n}" for n in range(1, 27)])
        life = d["contents"][0]
        self.assertNotIn("chapters_done", life)    # the whole Life is done
        # The rest of p. 18 and pp. 19-36 proofread: chapter 13 begins on p. 18, chapter 26 ends on p. 36.
        ch = {c["id"]: c for c in d["chapters"]}
        self.assertEqual(ch["Life.13"]["greek_label"], "p. 18")
        self.assertEqual(ch["Life.26"]["greek_pages"][-1], "ia-volkmann-t1:66")
        self.assertEqual([o["n"] for o in ch["Life.22"]["older"]], [22, 23])    # MacKenna's 23 begins inside the oracle
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["Life.13.p1"]["greek"].startswith("γέγονε δ’ ἐν ταῖς συνουσίαις"))
        self.assertTrue(para["Life.26.p2"]["greek"].endswith("αὐτὸ σημανεῖ τὸ ἔργον."))
        # The oracle, in Volkmann's lines, and Porphyry's list of the Enneads, each book with its place.
        self.assertIn("ἄμβροτα φορμίζειν ἀναβάλλομαι", para["Life.22.p2"]["greek"])
        lists = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"] in ("Life.24", "Life.25", "Life.26"))
        for e in ("I.1", "II.9", "III.9", "IV.9", "V.9", "VI.9"):
            self.assertIn(f"[{e}]", lists)
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna: "I put faith in Plotinus' writings", where Porphyry was entrusted with them.
        self.assertTrue(any("entrusted" in f["why"] for f in flags["Life.18.p2"]))
        self.assertTrue(any("opposite" in f["why"] for f in flags["Life.20.p7"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(tuple(f"Life.{n}." for n in range(13, 27)))), 30)

    def test_milestone_e7_on_the_heaven_and_its_movement(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][6:9], ["I.9", "II.1", "II.2"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "II.1"], [f"II.1.{n}" for n in range(1, 9)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "II.2"], ["II.2.1", "II.2.2", "II.2.3"])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. II beside them, his chapters the Greek's.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["II.1.1"]["older"]], [(1, 1921, 143)])
        self.assertIn({"file": "texts/plotinus/mackenna-1921.json", "year": 1921}, d["older"]["volumes"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["II.1.1.p1"]["greek"].startswith("Τὸν κόσμον ἀεὶ λέγοντες"))
        self.assertTrue(para["II.2.1.p1"]["modern"].startswith("Why does it move in a circle? Because it imitates intellect."))
        self.assertTrue(para["II.2.3.p2"]["greek"].endswith("ἅμα καὶ ἕστηκεν."))
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has the heaven not reach down to the moon, where the Greek says it ends there; a common centre
        # for the stars, where the Greek gives each its own; the soul for "what is spherical in us".
        self.assertTrue(any("ends at the moon" in f["why"] for f in flags["II.1.5.p2"]))
        self.assertTrue(any("own centre" in f["why"] for f in flags["II.2.2.p3"]))
        self.assertTrue(any("head" in f["why"] for f in flags["II.2.2.p3"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("II.1.", "II.2."))), 25)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("II.1.", "II.2.")) for n in p.get("notes", []))
        for place in ("Republic VII (530a-b)", "Timaeus (41a-b)", "On the Heavens II.1, 284a", "Iliad 16.192"):
            self.assertIn(place, notes)

    def test_milestone_e8_whether_the_stars_are_causes(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][7:10], ["II.1", "II.2", "II.3"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "II.3"], [f"II.3.{n}" for n in range(1, 19)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. II beside it, his eighteen chapters Volkmann's.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["II.3.1"]["older"]], [(1, 1921, 159)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["II.3.18"]["older"]], [(18, 177)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["II.3.1.p1"]["greek"].startswith("Ὅτι ἡ τῶν ἄστρων φορὰ σημαίνει"))
        self.assertTrue(para["II.3.7.p1"]["modern"].startswith("But if they signify what will be"))
        self.assertIn("like letters always being written in the heaven", para["II.3.7.p1"]["modern"])
        self.assertIn("an image always being imaged", para["II.3.18.p2"]["modern"])
        self.assertTrue(para["II.3.18.p2"]["greek"].endswith("πάντα τὰ ἀπ’ αὐτοῦ φῶτα."))
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has the cold star opposed to the cold where the Greek says to the hot; "virtue the unconquerable"
        # for Plato's virtue with no master; a mighty "spirit" for the Symposium's great daemon; the star's will passed
        # on through the body where the Greek has it look to the best; a gap in the text where Volkmann has none.
        self.assertTrue(any("to the hot" in f["why"] for f in flags["II.3.5.p1"]))
        self.assertTrue(any("617e" in f["why"] for f in flags["II.3.9.p2"]))
        self.assertTrue(any("Symposium" in f["why"] for f in flags["II.3.9.p5"]))
        self.assertTrue(any("look to the best" in f["why"] for f in flags["II.3.9.p4"]))
        self.assertTrue(any("no gap" in f["why"] or "has none" in f["why"] for f in flags["II.3.11.p1"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith("II.3.")), 40)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("II.3.") for n in p.get("notes", []))
        for place in ("Republic X, 616c-617d", "Timaeus (41c-d, 42a)", "Phaedrus (246e-247a)", "Physics (II.2, 194b13)",
                      "Menexenus (246e-247a)", "Tetrabiblos III.10", "On nourishment (23)"):
            self.assertIn(place, notes)

    def test_milestone_e9_potential_quality_blending_and_sight(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][9:14], ["II.3", "II.5", "II.6", "II.7", "II.8"])
        for t, n in (("II.5", 5), ("II.6", 3), ("II.7", 3), ("II.8", 2)):
            self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == t], [f"{t}.{k}" for k in range(1, n + 1)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. II beside them, his chapters Volkmann's.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["II.5.1"]["older"]], [(1, 1921, 196)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["II.8.2"]["older"]], [(2, 214)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["II.5.1.p1"]["greek"].startswith("Λέγεται τὸ μὲν δυνάμει"))
        self.assertIn("courage and acting bravely", para["II.5.2.p2"]["modern"])
        self.assertTrue(para["II.6.1.p1"]["modern"].startswith("Is being different from substance?"))
        self.assertIn("a trace only, a shadow and an image", para["II.6.3.p1"]["modern"])
        self.assertTrue(para["II.7.3.p1"]["greek"].endswith("ἀλλὰ ταῦτα ἄλλοθι."))
        self.assertTrue(para["II.8.2.p1"]["greek"].endswith("πῶς ἂν ἐλάττωσιν γωνίας αἰτιῷτο;"))
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has matter unable to annex "a visible outline" where the Greek says it cannot even be coloured; a
        # "temperament" for Aristotle's settled state; "lighting" for whitening; "matter" received where the Greek has
        # body give and take; "salience and recession" for sight going over the parts.
        self.assertTrue(any("coloured" in f["why"] for f in flags["II.5.5.p1"]))
        self.assertTrue(any("settled state" in f["why"] for f in flags["II.5.2.p2"]))
        self.assertTrue(any("whitening" in f["why"] for f in flags["II.6.2.p2"]))
        self.assertTrue(any("not matter received" in f["why"] for f in flags["II.7.2.p2"]))
        self.assertTrue(any("going through it" in f["why"] for f in flags["II.8.1.p1"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("II.5.", "II.6.", "II.7.", "II.8."))), 35)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("II.5.", "II.6.", "II.7.", "II.8."))
                         for n in p.get("notes", []))
        for place in ("Timaeus (58d-59c)", "Metaphysics XII.7, 1072b26-30", "Sophist (254b-255e)", "Categories 8, 8b26-9a13",
                      "Diogenes Laertius VII.151", "On Generation and Corruption I.10, 328a23-28", "Euclid's Optics"):
            self.assertIn(place, notes)

    def test_milestone_e10_on_destiny(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][13:15], ["II.8", "III.1"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.1"], [f"III.1.{k}" for k in range(1, 11)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. II prints the Third Ennead first; his chapters of III.1 are Volkmann's.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["III.1.1"]["older"]], [(1, 1921, 1)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.1.10"]["older"]], [(10, 10)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["III.1.1.p1"]["greek"].startswith("Ἅπαντα τὰ γινόμενα"))
        self.assertTrue(para["III.1.10.p1"]["greek"].endswith("μόνον δὲ οὐ κωλυθέντας."))
        self.assertIn("empty swerves", para["III.1.1.p2"]["modern"])
        self.assertIn("\"what is up to us\" will be only a name", para["III.1.7.p2"]["modern"])
        self.assertIn("we are of this nature when we are alone", para["III.1.10.p1"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has "evil" where the Greek has choice blended with chance; "the philosophic life" for being wise;
        # vengeance for a star "afflicted"; a "personal action" for what is up to us; the augur for the star-readers.
        self.assertTrue(any("choice" in f["why"] and "not evil" in f["why"] for f in flags["III.1.9.p1"]))
        self.assertTrue(any("another will be wise" in f["why"] for f in flags["III.1.3.p2"]))
        self.assertTrue(any("afflicted" in f["why"] for f in flags["III.1.6.p1"]))
        self.assertTrue(any("what is up to us" in f["why"] for f in flags["III.1.7.p2"]))
        self.assertTrue(any("grammar" in f["why"] for f in flags["III.1.6.p2"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith("III.1.")), 25)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("III.1.") for n in p.get("notes", []))
        for place in ("On the nature of things II.216-293", "Aetius I.28.4", "Diogenes Laertius VII.136",
                      "Airs, waters, places 12-24", "On fate 42-43", "Nicomachean Ethics III.1-5", "VI.9.11"):
            self.assertIn(place, notes)

    def test_milestone_e11_on_providence_first_part(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][14:16], ["III.1", "III.2"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.2"], [f"III.2.{k}" for k in range(1, 19)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters of III.2 are Volkmann's (vol. II, pp. 11-35).
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["III.2.1"]["older"]], [(1, 1921, 11)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.2.18"]["older"]], [(18, 35)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["III.2.1.p1"]["greek"].startswith("Τὸ μὲν τῷ αὐτομάτῳ καὶ τύχῃ"))
        self.assertTrue(para["III.2.18.p3"]["greek"].endswith("τοῦ παντὸς ψυχῆς τινος ὄντος;"))
        self.assertIn("its being according to intellect", para["III.2.1.p2"]["modern"])
        self.assertIn("the undeclared war", para["III.2.15.p2"]["modern"])
        self.assertIn("the soul is the actor", para["III.2.17.p4"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has "divine Reason" for intellect beside necessity; a "lesson in right doing" for a pattern of justice;
        # "executive power" for craft; a "bandit war" for the undeclared one; "furnaces" for Hephaestus' art.
        self.assertTrue(any("intellect and necessity" in f["why"] for f in flags["III.2.2.p3"]))
        self.assertTrue(any("pattern of justice" in f["why"] for f in flags["III.2.5.p1"]))
        self.assertTrue(any("craft" in f["why"] for f in flags["III.2.9.p3"]))
        self.assertTrue(any("undeclared war" in f["why"] for f in flags["III.2.15.p2"]))
        self.assertTrue(any("Hephaestus" in f["why"] for f in flags["III.2.14.p2"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith("III.2.")), 45)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("III.2.") for n in p.get("notes", []))
        for place in ("Timaeus 47e-48a", "Republic X 617e", "Theaetetus 176a", "Laws IX 872d-873a", "Phaedrus 248c",
                      "Laws I 626a", "Laws VII 803c-804b", "fr. B51", "Iliad XVIII.417-420"):
            self.assertIn(place, notes)

    def test_milestone_e12_on_providence_second_part_and_the_daemon(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][15:18], ["III.2", "III.3", "III.4"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.3"], [f"III.3.{k}" for k in range(1, 8)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.4"], [f"III.4.{k}" for k in range(1, 7)])
        ch = {c["id"]: c for c in d["chapters"]}
        # The scan's OCR lost MacKenna's numbers 5 to 7 of III.3, so his chapter 4 (p. 39) holds the Greek's 4 to 7.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["III.3.1"]["older"]], [(1, 1921, 36)])
        self.assertEqual([[o["n"] for o in ch[f"III.3.{k}"]["older"]] for k in range(4, 8)], [[4], [4], [4], [4]])
        # His six chapters of III.4 are Volkmann's (pp. 46-50).
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.4.1"]["older"]], [(1, 46)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.4.6"]["older"]], [(6, 50)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["III.3.1.p1"]["greek"].startswith("Τί τοίνυν δοκεῖ περὶ τούτων"))
        self.assertTrue(para["III.3.7.p3"]["greek"].endswith("ἐκ τῶν αὐτῶν ὁρμηθέντες πεποιηκότων."))
        self.assertTrue(para["III.4.1.p1"]["greek"].startswith("Τῶν μὲν αἱ ὑποστάσεις"))
        self.assertTrue(para["III.4.6.p5"]["greek"].endswith("τοιοῦτον γὰρ ἡ εἱμαρμένη."))
        self.assertIn("not an episode added to the All", para["III.3.3.p1"]["modern"])
        self.assertIn("destiny begins from the worse", para["III.3.5.p2"]["modern"])
        self.assertIn("each of us is an intelligible world", para["III.4.3.p3"]["modern"])
        self.assertIn("For such is destiny.", para["III.4.6.p5"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has the higher "dependent upon the World of Sense" where it is not cut off from the lower; "Universal
        # interdependence, there could not be" where all things must not be cut off; "spirit" for the daemon; the spirit
        # paying the penalty where the man does; "the Divine Intellect" for the intelligible; "sample lives" for patterns.
        self.assertTrue(any("not cut off" in f["why"] for f in flags["III.3.4.p1"]))
        self.assertTrue(any("cut off from one another" in f["why"] for f in flags["III.3.6.p4"]))
        self.assertTrue(any("daemon" in f["why"] for f in flags["III.4.3.p1"]))
        self.assertTrue(any("not the daemon that is punished" in f["why"] for f in flags["III.4.3.p2"]))
        self.assertTrue(any("intelligible world" in f["why"] for f in flags["III.4.3.p3"]))
        self.assertTrue(any("patterns of lives" in f["why"] for f in flags["III.4.5.p2"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("III.3.", "III.4."))), 45)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("III.3.", "III.4.")) for n in p.get("notes", []))
        for place in ("Poetics 9", "Metaphysics XII.10", "Iliad III.230-233", "Timaeus 31c-32a", "Phaedrus 246b",
                      "Phaedo 81e-82b", "Phaedo 107d", "Republic X 617e", "Timaeus 90a", "Republic X 616c-617d"):
            self.assertIn(place, notes)

    def test_milestone_e13_on_love(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][17:19], ["III.4", "III.5"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.5"], [f"III.5.{k}" for k in range(1, 10)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna has ten chapters for Volkmann's nine: his chapter 10 (p. 66) begins at the Greek's "myths must divide
        # into times", within chapter 9, so the Greek's chapter 9 is shown with his 9 and 10; his 1 to 8 are Volkmann's.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["III.5.1"]["older"]], [(1, 1921, 53)])
        self.assertEqual([[o["n"] for o in ch[f"III.5.{k}"]["older"]] for k in range(1, 9)], [[k] for k in range(1, 9)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.5.9"]["older"]], [(9, 65), (10, 66)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["III.5.1.p1"]["greek"].startswith("Περὶ ἔρωτος, πότερα θεός τις ἢ δαίμων"))
        self.assertTrue(para["III.5.9.p3"]["greek"].startswith("δεῖ δὲ τοὺς μύθους"))
        self.assertTrue(para["III.5.9.p5"]["greek"].endswith("ἐφίεται δέ, γεγενημένος."))
        self.assertIn("is it a god, or a daemon, or a passion of the soul?", para["III.5.1.p1"]["modern"])
        self.assertIn("He is the eye of the one who longs", para["III.5.2.p3"]["modern"])
        self.assertIn("love is like a gadfly", para["III.5.7.p2"]["modern"])
        self.assertIn("And Poverty is matter", para["III.5.9.p5"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has "Celestial Spirit" and "Supernals" for the daemon; "minister of beautiful children" for the overseer of
        # beautiful boys; "Possession" for Resource; "the consistent total" for the Pythagorean column; a triangle "made up
        # of two right angles"; and soul "breaking away" from intellect where it has its reality from it.
        self.assertTrue(any("daemon" in f["why"] for f in flags["III.5.1.p1"]))
        self.assertTrue(any("overseer of beautiful boys" in f["why"] for f in flags["III.5.2.p1"]))
        self.assertTrue(any("resource" in f["why"] for f in flags["III.5.2.p1"]))
        self.assertTrue(any("Pythagorean" in f["why"] for f in flags["III.5.1.p3"]))
        self.assertTrue(any("two right angles" in f["why"] for f in flags["III.5.7.p6"]))
        self.assertTrue(any("from intellect" in f["why"] for f in flags["III.5.9.p3"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith("III.5.")), 35)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("III.5.") for n in p.get("notes", []))
        for place in ("Symposium 203b-c", "Symposium 180d-181c", "Phaedrus 265c", "Metaphysics I.5, 986a22-26",
                      "Theogony 188-200", "Cratylus (396b)", "Philebus 30d", "Phaedrus 246e", "374c-d", "392a27-28"):
            self.assertIn(place, notes)

    def test_milestone_e14_on_nature_contemplation_and_the_one_and_various_considerations(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][18:21], ["III.5", "III.8", "III.9"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.8"], [f"III.8.{k}" for k in range(1, 12)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "III.9"], [f"III.9.{k}" for k in range(1, 4)])
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna has ten chapters of III.8 for Volkmann's eleven: his tenth (p. 133) runs on through the Greek's eleventh
        # ("Another approach"), so the eleventh is shown with his 10. The Greek of III.9 has three chapters, as he has.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["III.8.1"]["older"]], [(1, 1921, 119)])
        self.assertEqual([[o["n"] for o in ch[f"III.8.{k}"]["older"]] for k in range(1, 11)], [[k] for k in range(1, 11)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["III.8.11"]["older"]], [(10, 133)])
        self.assertEqual([[(o["n"], o["page"]) for o in ch[f"III.9.{k}"]["older"]] for k in (1, 3)], [[(1, 136)], [(3, 139)]])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["III.8.1.p1"]["greek"].startswith("Παίζοντες δὴ τὴν πρώτην"))
        self.assertTrue(para["III.8.11.p3"]["greek"].endswith("ἢ οὐκ ἂν τὸ ἀγαθὸν ἦν."))
        self.assertTrue(para["III.9.3.p7"]["greek"].endswith("ἀφαίρεσιν καὶ ἔλλειψιν ποιεῖ."))
        self.assertIn("all things long for contemplation", para["III.8.1.p1"]["modern"])
        self.assertIn("You ought not to ask, but to understand, you too, in silence", para["III.8.4.p1"]["modern"])
        self.assertIn("Think of a spring that has no other beginning", para["III.8.10.p1"]["modern"])
        self.assertIn("a beautiful boy, and a fullness that came from him", para["III.8.11.p3"]["modern"])
        self.assertIn("the body is in it", para["III.9.2.p2"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna's "the Highest" for intellect that began as one; "pregnant" for weighed down; the living principle as
        # brother of the dead one; "lovely abundance" for the boy who is fullness (Kronos); and the thinking of the Good
        # denied majesty where the Greek grants it.
        self.assertTrue(any("subject" in f["why"] and "intellect" in f["why"] for f in flags["III.8.8.p3"]))
        self.assertTrue(any("weighed down" in f["why"] for f in flags["III.8.8.p3"]))
        self.assertTrue(any("brother" in f["why"] for f in flags["III.8.2.p2"]))
        self.assertTrue(any("Kronos" in f["why"] for f in flags["III.8.11.p3"]))
        self.assertTrue(any("reverses" in f["why"] for f in flags["III.9.3.p6"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("III.8.", "III.9."))), 60)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("III.8.", "III.9.")) for n in p.get("notes", []))
        for place in ("Laws VII 803c-804b", "Phaedrus (246a-254e)", "fragment B3", "Republic VI 509b", "Cratylus etymologises",
                      "Timaeus 39e", "Second Letter", "Timaeus 34b", "Sophist (254d)", "1072a26-b4"):
            self.assertIn(place, notes)

    def test_milestone_e15_on_the_being_of_the_soul_and_difficulties_about_the_soul_chapters_1_to_17(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][20:23], ["III.9", "IV.1", "IV.4"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.1"], ["IV.1.1"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.4"][:17], [f"IV.4.{k}" for k in range(1, 18)])
        # IV.4 is done over E15 to E17: complete since E17 (E16 brought 18-31, E17 32-45).
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["IV.4"])
        self.assertNotIn("chapters_done", t["IV.1"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["IV.4"]["status"], "here")
        self.assertNotIn("chapters_done", c["IV.4"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. III beside them. The Greek's seventh chapter begins with the last two sentences of his sixth;
        # the OCR lost his numbers 15 and 17, whose text runs on in his 14 and 16.
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["IV.1.1"]["older"]], [(1, 1924, 1)])
        self.assertEqual([(o["n"], o["year"], o["page"]) for o in ch["IV.4.1"]["older"]], [(1, 1924, 47)])
        self.assertEqual([o["n"] for o in ch["IV.4.7"]["older"]], [6, 7])
        self.assertEqual([o["n"] for o in ch["IV.4.15"]["older"]], [14])
        self.assertEqual([o["n"] for o in ch["IV.4.17"]["older"]], [16])
        self.assertIn({"file": "texts/plotinus/mackenna-1924.json", "year": 1924}, d["older"]["volumes"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["IV.1.1.p1"]["greek"].startswith("ἐν τῷ κόσμῳ τῷ νοητῷ ἡ ἀληθινὴ οὐσία"))
        self.assertTrue(para["IV.1.1.p3"]["greek"].endswith("τῷ ἐν παντὶ εἶναι μεμέρισται."))
        self.assertTrue(para["IV.4.1.p1"]["greek"].startswith("Τί οὖν ἐρεῖ, καὶ τίνων τὴν μνήμην"))
        self.assertTrue(para["IV.4.17.p4"]["greek"].endswith("ταῦτα μὲν οὖν ταύτῃ."))
        self.assertIn("like a line from a centre", para["IV.1.1.p3"]["modern"])
        self.assertIn("what it remembers, that it is and becomes", para["IV.4.3.p2"]["modern"])
        self.assertIn("like strings in a lyre moved in sympathy", para["IV.4.8.p6"]["modern"])
        self.assertIn("as he is the wisest craftsman", para["IV.4.9.p1"]["modern"])
        self.assertIn("as if in thick wax an impression", para["IV.4.13.p1"]["modern"])
        self.assertIn("soul longs for what is beyond being", para["IV.4.16.p3"]["modern"])
        self.assertIn("the best of the counsellors speaks and does not prevail", para["IV.4.17.p3"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna has the soul come down to the heaven where the Greek has it go up from here; eternity for "always";
        # the lyre strings struck where they are moved in sympathy; nature acting on soul where it acts on matter;
        # intellect possessing what is beyond being; and he leaves out the last sentence of the Greek's chapter 17.
        self.assertTrue(any("from here" in f["why"] for f in flags["IV.4.5.p2"]))
        self.assertTrue(any("always" in f["why"] for f in flags["IV.4.7.p2"]))
        self.assertTrue(any("sympathy" in f["why"] for f in flags["IV.4.8.p6"]))
        self.assertTrue(any("matter" in f["why"] for f in flags["IV.4.13.p3"]))
        self.assertTrue(any("beyond being" in f["why"] for f in flags["IV.4.16.p3"]))
        self.assertTrue(any("leaving out" in f["why"] for f in flags["IV.4.17.p4"]))
        self.assertGreaterEqual(sum(len(flags[s]) for s in flags if s.startswith(("IV.1.", "IV.4."))), 45)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("IV.1.", "IV.4.")) for n in p.get("notes", []))
        for place in ("Timaeus (35a)", "Republic VII 515e-516b", "Timaeus 40c", "Philebus (30d)", "Physics II.8", "Theaetetus 191c-e",
                      "Physics IV.12", "Republic VI 509b", "Republic VI 492b-c", "IX 592b"):
            self.assertIn(place, notes)

    def test_milestone_e16_difficulties_about_the_soul_chapters_18_to_31(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][20:23], ["III.9", "IV.1", "IV.4"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.4"][:31], [f"IV.4.{k}" for k in range(1, 32)])
        # IV.4 is done over E15 to E17, complete since E17; VI.8 is still E33's.
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["IV.4"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["IV.4"]["status"], "here")
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters are the Greek's from 18 to 30; the OCR lost his number 31, whose text runs on in his 30.
        for k in range(18, 31):
            self.assertEqual([o["n"] for o in ch[f"IV.4.{k}"]["older"]], [k])
        self.assertEqual([o["n"] for o in ch["IV.4.31"]["older"]], [30])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["IV.4.18.p1"]["greek"].startswith("περὶ δὲ τοῦ εἰ ἐφ̓ ἑαυτοῦ τι ἔχει τὸ σῶμα"))
        self.assertTrue(para["IV.4.31.p5"]["greek"].endswith("οὐδ’ ἡτισοῦν ὠφέλεια ἂν γένοιτο."))
        self.assertIn("like air that has been warmed", para["IV.4.18.p1"]["modern"])
        self.assertIn("an affected messenger", para["IV.4.19.p3"]["modern"])
        self.assertIn("like a mother, guessing as it were at the wishes", para["IV.4.20.p3"]["modern"])
        self.assertIn("the ruler, joining the straight in the soul and the straight in the wood", para["IV.4.23.p3"]["modern"])
        self.assertIn("which men call Hestia and Demeter", para["IV.4.27.p2"]["modern"])
        self.assertIn("takes as its ally this spirited part", para["IV.4.28.p4"]["modern"])
        self.assertIn("we see by convention", para["IV.4.29.p3"]["modern"])
        self.assertIn("bewitched by men's daring and art", para["IV.4.30.p3"]["modern"])
        self.assertIn("thieves, others kidnappers", para["IV.4.31.p5"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna makes the body we sink into "the true man" where Plotinus blames the mistake; "fair" for grey-eyed;
        # flesh and blood to the earth; the earth as the moving region seen by the "stationary"; "the spiritual order" for
        # pneuma; outside combinations for the beasts' temperaments; a law of our nature for Democritus' convention; and a
        # memory given to Demeter and Hestia that the Greek never gave them.
        self.assertTrue(any("mistake" in f["why"] for f in flags["IV.4.18.p1"]))
        self.assertTrue(any("grey-eyed" in f["why"] for f in flags["IV.4.19.p2"]))
        self.assertTrue(any("fiery stars" in f["why"] for f in flags["IV.4.22.p2"]))
        self.assertTrue(any("unwandering" in f["why"] for f in flags["IV.4.24.p3"]))
        self.assertTrue(any("pneuma" in f["why"] for f in flags["IV.4.26.p3"]))
        self.assertTrue(any("temperaments" in f["why"] for f in flags["IV.4.28.p3"]))
        self.assertTrue(any("Democritus" in f["why"] for f in flags["IV.4.29.p3"]))
        self.assertTrue(any("no memory" in f["why"] for f in flags["IV.4.30.p2"]))
        late = [s for s in flags if s.startswith("IV.4.") and int(s.split(".")[2]) >= 18]
        self.assertGreaterEqual(sum(len(flags[s]) for s in late), 24)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("IV.4.") and int(p["chapter"].split(".")[2]) >= 18
                         for n in p.get("notes", []))
        for place in ("Timaeus 34b", "Timaeus 40c", "Timaeus 33c", "(31c-32a)", "418b9-11", "Phaedrus 247a", "Cratylus",
                      "Republic (IV 439e-441c)", "14b33-15a7", "λόγοι σπερματικοί", "Tetrabiblos I.4", "Phaedrus' word for rhetoric"):
            self.assertIn(place, notes)

    def test_milestone_e17_difficulties_about_the_soul_chapters_32_to_45(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][20:23], ["III.9", "IV.1", "IV.4"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.4"], [f"IV.4.{k}" for k in range(1, 46)])
        # IV.4 is complete: no chapters_done; its summary no longer says that chapters are to come; VI.8 is still E33's.
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["IV.4"])
        self.assertNotIn("to come", t["IV.4"]["summary"])
        self.assertIn("sympathy of the All", t["IV.4"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["IV.4"]["status"], "here")
        self.assertNotIn("chapters_done", c["IV.4"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters are the Greek's, but his 37 runs on into the Greek's 38 and his 40 into the Greek's 41.
        for k in (32, 33, 34, 35, 36, 37, 39, 40, 42, 43, 44, 45):
            self.assertEqual([o["n"] for o in ch[f"IV.4.{k}"]["older"]], [k])
        self.assertEqual([o["n"] for o in ch["IV.4.38"]["older"]], [37])
        self.assertEqual([o["n"] for o in ch["IV.4.41"]["older"]], [40])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["IV.4.32.p1"]["greek"].startswith("εἰ οὖν μήτε σωματικαῖς αἰτίαις"))
        self.assertTrue(para["IV.4.45.p5"]["greek"].endswith("οὗ δὲ μὴ νοσήσει τιθεμένου."))
        self.assertIn("which has its remaining in being moved", para["IV.4.32.p4"]["modern"])
        self.assertIn("as of those who make one dance in a varied choral dance", para["IV.4.33.p1"]["modern"])
        self.assertIn("itself seeks the Good, or rather looks at it", para["IV.4.35.p3"]["modern"])
        self.assertIn("but virtue has no master", para["IV.4.38.p3"]["modern"])
        self.assertIn("like one who sets the order of a city by reason", para["IV.4.39.p1"]["modern"])
        self.assertIn("the true magic is the love in the All, and the strife too", para["IV.4.40.p1"]["modern"])
        self.assertIn("as on one stretched string", para["IV.4.41.p1"]["modern"])
        self.assertIn("For fair of face is the people of great-hearted Erechtheus", para["IV.4.43.p3"]["modern"])
        self.assertIn("contemplation alone as unbewitched", para["IV.4.44.p1"]["modern"])
        self.assertIn("is of good hope that he will be with gods", para["IV.4.45.p3"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna keeps the figure the same where the Greek makes it another; reads ἄλογον for ἀνάλογον; makes justice
        # not follow where the Greek says it does; misses Empedocles' love and strife, the Lachesis of Republic X, the
        # premises of the affection; adds Plato's next words to the line on Erechtheus; and has the pure soul come down.
        self.assertTrue(any("opposite" in f["why"] for f in flags["IV.4.34.p3"]))
        self.assertTrue(any("ἄλογον" in f["why"] for f in flags["IV.4.37.p2"]))
        self.assertTrue(any("Lachesis" in f["why"] for f in flags["IV.4.38.p3"]))
        self.assertTrue(any("Empedocles" in f["why"] for f in flags["IV.4.40.p1"]))
        self.assertTrue(any("justice follows him" in f["why"] for f in flags["IV.4.42.p2"]))
        self.assertTrue(any("next words" in f["why"] for f in flags["IV.4.43.p3"]))
        self.assertTrue(any("premises" in f["why"] for f in flags["IV.4.44.p1"]))
        self.assertTrue(any("goes up from here" in f["why"] for f in flags["IV.4.45.p4"]))
        self.assertTrue(any("runs on" in f["why"] for f in flags["IV.4.38.p1"]))
        self.assertTrue(any("runs on" in f["why"] for f in flags["IV.4.41.p1"]))
        late = [s for s in flags if s.startswith("IV.4.") and int(s.split(".")[2]) >= 32]
        self.assertGreaterEqual(sum(len(flags[s]) for s in late), 40)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("IV.4.") and int(p["chapter"].split(".")[2]) >= 32
                         for n in p.get("notes", []))
        for place in ("Laws X 903b-d", "Sophist 247d-e", "Republic X 617e", "fragment B17", "Alcibiades I (132a)",
                      "Trojan Women (887-888)", "Laws (I 644d-645a)", "Gorgias 478d-480b", "Life 10"):
            self.assertIn(place, notes)

    def test_milestone_e18_on_sight_and_on_perception_and_memory(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][20:25], ["III.9", "IV.1", "IV.4", "IV.5", "IV.6"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.5"], [f"IV.5.{k}" for k in range(1, 9)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.6"], ["IV.6.1", "IV.6.2", "IV.6.3"])
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["IV.5"])
        self.assertNotIn("chapters_done", t["IV.6"])
        self.assertIn("sympathy of the All", t["IV.5"]["summary"])
        self.assertIn("not imprints", t["IV.6"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual((c["IV.5"]["status"], c["IV.6"]["status"]), ("here", "here"))
        self.assertEqual(c["IV.7"]["status"], "taylor")
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters are the Greek's in both treatises (vol. III).
        for cid in [f"IV.5.{k}" for k in range(1, 9)] + ["IV.6.1", "IV.6.2", "IV.6.3"]:
            self.assertEqual([o["n"] for o in ch[cid]["older"]], [int(cid.split(".")[2])])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["IV.5.1.p1"]["greek"].startswith("Ἐπεὶ δὲ ὑπερεθέμεθα"))
        self.assertTrue(para["IV.5.8.p4"]["greek"].endswith("τὸ ὑποτεθὲν ἐν αὑτῷ ἀναιρεῖν."))
        self.assertTrue(para["IV.6.1.p1"]["greek"].startswith("Τὰς αἰσθήσεις οὐ τυπώσεις"))
        self.assertTrue(para["IV.6.3.p8"]["greek"].endswith("οὔτε οἱ ἀσώματον."))
        self.assertIn("the fisherman, they say, is numbed", para["IV.5.1.p3"]["modern"])
        self.assertIn("for the rush upward comes from the logs too", para["IV.5.2.p4"]["modern"])
        self.assertIn("each bit of the air holds the whole of the face that is seen", para["IV.5.3.p4"]["modern"])
        self.assertIn("needs light like a staff", para["IV.5.4.p5"]["modern"])
        self.assertIn("Bronze sounds one way against bronze", para["IV.5.5.p2"]["modern"])
        self.assertIn("the activity is from a subject, not into a subject", para["IV.5.6.p3"]["modern"])
        self.assertIn("an image of the shining; it is simply no longer there", para["IV.5.7.p5"]["modern"])
        self.assertIn("an All and not an All", para["IV.5.8.p4"]["modern"])
        self.assertIn("there must be two, the seer and the seen", para["IV.6.1.p4"]["modern"])
        self.assertIn("reads, as it were, the imprints written in the air", para["IV.6.2.p2"]["modern"])
        self.assertIn("and being them, more dimly", para["IV.6.3.p1"]["modern"])
        self.assertIn("So perception and memory are both a kind of strength", para["IV.6.3.p6"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna puts the man who also sees on the far side, trees for the logs of a fire, "no reason for the
        # existence of light", understanding for the light in the eye, light that "would vanish" where the Greek says it
        # would stay, light in circuit, the soul "more radiant" where the Greek says more dimly, and mind for soul.
        self.assertTrue(any("in front of us" in f["why"] for f in flags["IV.5.1.p3"]))
        self.assertTrue(any("logs of a fire" in f["why"] for f in flags["IV.5.2.p4"]))
        self.assertTrue(any("no need of light" in f["why"] for f in flags["IV.5.2.p5"]))
        self.assertTrue(any("light inside the eye" in f["why"] for f in flags["IV.5.4.p2"]))
        self.assertTrue(any("would have had to stay" in f["why"] for f in flags["IV.5.6.p2"]))
        self.assertTrue(any("if light did flow" in f["why"] for f in flags["IV.5.7.p1"]))
        self.assertTrue(any("soul and not soul" in f["why"] for f in flags["IV.5.8.p4"]))
        self.assertTrue(any("more dimly" in f["why"] for f in flags["IV.6.3.p1"]))
        self.assertTrue(any("is itself each of them" in f["why"] for f in flags["IV.6.2.p3"]))
        ours = [s for s in flags if s.startswith(("IV.5.", "IV.6."))]
        self.assertEqual(len(ours), 48)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 40)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("IV.5.", "IV.6.")) for n in p.get("notes", []))
        for place in ("On the soul II.7", "Meno 80a-c", "Diogenes Laertius VII.157", "Physics IV.8", "Timaeus 33c",
                      "Theaetetus 191c-196c", "On memory 449b6-8", "beyond the heaven (247b-c)", "Republic VII 515a-c", "V.4.2"):
            self.assertIn(place, notes)

    def test_milestone_e19_on_the_descent_of_the_soul_and_whether_all_souls_are_one(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][25:27], ["IV.8", "IV.9"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.8"], [f"IV.8.{k}" for k in range(1, 9)])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "IV.9"], [f"IV.9.{k}" for k in range(1, 6)])
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["IV.8"])
        self.assertNotIn("chapters_done", t["IV.9"])
        self.assertIn("not all of our soul comes down", t["IV.8"]["summary"])
        self.assertIn("a science is whole in each of its theorems", t["IV.9"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual((c["IV.8"]["status"], c["IV.9"]["status"]), ("here", "here"))
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters are the Greek's in both treatises (vol. III).
        for cid in [f"IV.8.{k}" for k in range(1, 9)] + [f"IV.9.{k}" for k in range(1, 6)]:
            self.assertEqual([o["n"] for o in ch[cid]["older"]], [int(cid.split(".")[2])])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["IV.8.1.p1"]["greek"].startswith("Πολλάκις ἐγειρόμενος εἰς ἐμαυτὸν"))
        self.assertTrue(para["IV.8.8.p3"]["greek"].endswith("ἡ δὲ διαγωγὴ ὁμοία."))
        self.assertTrue(para["IV.9.1.p1"]["greek"].startswith("Ἆῤ ὥσπερ ψυχὴν ἑκάστου"))
        self.assertTrue(para["IV.9.5.p4"]["greek"].endswith("φανὰ πάντα καὶ ἕκαστον."))
        self.assertIn("Often I wake up out of the body into myself", para["IV.8.1.p1"]["modern"])
        self.assertIn("an exile from the gods, trusting in raging strife", para["IV.8.1.p2"]["modern"])
        self.assertIn("with a kingly oversight that does no labour", para["IV.8.2.p3"]["modern"])
        self.assertIn("it did not remain intellect", para["IV.8.3.p3"]["modern"])
        self.assertIn("They become, then, amphibians", para["IV.8.4.p4"]["modern"])
        self.assertIn("by a self-determined inclination", para["IV.8.5.p4"]["modern"])
        self.assertIn("as if fencing it round out of grudging", para["IV.8.6.p1"]["modern"])
        self.assertIn("by knowledge before experience", para["IV.8.7.p2"]["modern"])
        self.assertIn("not even our soul has sunk entire", para["IV.8.8.p1"]["modern"])
        self.assertIn("as the man in me, when I move", para["IV.9.2.p1"]["modern"])
        self.assertIn("perhaps that is why there is love", para["IV.9.3.p1"]["modern"])
        self.assertIn("as if many waxes took the same imprint from one ring", para["IV.9.4.p3"]["modern"])
        self.assertIn("there all things are clear, and each", para["IV.9.5.p4"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna lifts where Plotinus wakes, makes Empedocles a slave of strife, keeps the soul intellect where the
        # Greek says it did not remain so, loses the amphibians, reads an "external" law for an everlasting one, brings
        # in Tolma, makes discursive thought "choice", and turns the hypothesis that soul is a body into a supposition.
        self.assertTrue(any("waking up" in f["why"] for f in flags["IV.8.1.p1"]))
        self.assertTrue(any("trusting in raging strife" in f["why"] for f in flags["IV.8.1.p2"]))
        self.assertTrue(any("did not remain intellect" in f["why"] for f in flags["IV.8.3.p3"]))
        self.assertTrue(any("amphibians" in f["why"] for f in flags["IV.8.4.p4"]))
        self.assertTrue(any("everlasting law" in f["why"] for f in flags["IV.8.5.p2"]))
        self.assertTrue(any("V.1.1" in f["why"] for f in flags["IV.8.5.p3"]))
        self.assertTrue(any("discursive thought" in f["why"] for f in flags["IV.8.8.p1"]))
        self.assertTrue(any("hypothesis" in f["why"] for f in flags["IV.9.4.p2"]))
        ours = [s for s in flags if s.startswith(("IV.8.", "IV.9."))]
        self.assertEqual(len(ours), 45)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 35)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("IV.8.", "IV.9.")) for n in p.get("notes", []))
        for place in ("Life 23", "Phaedo 62b", "Republic VII 514a-517b", "Timaeus 41d-42a", "Phaedrus 246c",
                      "Elements of Theology 211", "Physics II.8", "Timaeus 35a", "On the soul II.12", "Pappus"):
            self.assertIn(place, notes)

    def test_milestone_e20_how_what_comes_after_the_first_and_the_intelligibles_in_intellect(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][27:29], ["V.4", "V.5"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "V.4"], ["V.4.1", "V.4.2"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "V.5"], [f"V.5.{k}" for k in range(1, 14)])
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["V.4"])
        self.assertNotIn("chapters_done", t["V.5"])
        self.assertIn("double activity", t["V.4"]["summary"])
        self.assertIn("Porphyry had argued that the intelligible exists outside intellect", t["V.5"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual((c["V.4"]["status"], c["V.5"]["status"]), ("here", "here"))
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. IV (1926), the first of the Fifth Ennead: his chapters are the Greek's in both treatises.
        for cid in ["V.4.1", "V.4.2"] + [f"V.5.{k}" for k in range(1, 14)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1926)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["V.4.1"]["older"]], [(1, 43)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["V.5.1"]["older"]], [(1, 47)])
        self.assertIn({"file": "texts/plotinus/mackenna-1926.json", "year": 1926}, d["older"]["volumes"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["V.4.1.p1"]["greek"].startswith("Εἴ τι ἔστι μετὰ τὸ πρῶτον"))
        self.assertTrue(para["V.4.2.p4"]["greek"].endswith("τῶν ἄνευ ὕλης τὰ πράγματα."))
        self.assertTrue(para["V.5.1.p1"]["greek"].startswith("Τὸν νοῦν, τὸν ἀληθῆ νοῦν"))
        self.assertTrue(para["V.5.13.p4"]["greek"].endswith("τελειότερον γάρ."))
        self.assertIn("of which it is false even to say that it is one", para["V.4.1.p2"]["modern"])
        self.assertIn("as if it grudged itself, or were powerless", para["V.4.1.p4"]["modern"])
        self.assertIn("by a kind of co-perception, in everlasting rest", para["V.4.2.p2"]["modern"])
        self.assertIn("a heat that fills up its substance", para["V.4.2.p3"]["modern"])
        self.assertIn("For being is not a corpse", para["V.4.2.p4"]["modern"])
        self.assertIn("it will have falsehoods, and nothing true", para["V.5.1.p6"]["modern"])
        self.assertIn("agrees not with another, but with itself", para["V.5.2.p3"]["modern"])
        self.assertIn("the great king himself suddenly appears", para["V.5.3.p1"]["modern"])
        self.assertIn("so that being is a trace of the one", para["V.5.5.p2"]["modern"])
        self.assertIn("as Apollo, by denial of the many", para["V.5.6.p3"]["modern"])
        self.assertIn("For then, not seeing, it sees", para["V.5.7.p3"]["modern"])
        self.assertIn("but came as not coming", para["V.5.8.p2"]["modern"])
        self.assertIn("being nowhere, it will be everywhere", para["V.5.9.p3"]["modern"])
        self.assertIn("else you will be an intellect thinking", para["V.5.10.p2"]["modern"])
        self.assertIn("fall asleep again", para["V.5.11.p3"]["modern"])
        self.assertIn("pleasure mixed with pain", para["V.5.12.p4"]["modern"])
        self.assertIn("lets the \"is\" stand", para["V.5.13.p2"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna lets "beyond being" be the one thing said of the first, reads "service" for goodness, puts the other
        # intelligible below intellect, makes the first "the sum of being" and "the potentiality of the All", puns where
        # the Greek gives a reason, says thinking would reach the One where the Greek says it loses it, and adds
        # "goodness" where the Greek forbids adding beauty to the Good.
        self.assertTrue(any("false even to say" in f["why"] for f in flags["V.4.1.p2"]))
        self.assertTrue(any("everlastingness and goodness" in f["why"] for f in flags["V.4.1.p4"]))
        self.assertTrue(any("below intellect" in f["why"] for f in flags["V.4.2.p1"]))
        self.assertTrue(any("most of all what it is" in f["why"] for f in flags["V.4.2.p2"]))
        self.assertTrue(any("potentiality" in f["why"] for f in flags["V.4.2.p3"]))
        self.assertTrue(any("receptive" in f["why"] for f in flags["V.5.1.p6"]))
        self.assertTrue(any("sayables" in f["why"] for f in flags["V.5.1.p5"]))
        self.assertTrue(any("loses it" in f["why"] for f in flags["V.5.10.p2"]))
        self.assertTrue(any("beauty" in f["why"] for f in flags["V.5.13.p2"]))
        ours = [s for s in flags if s.startswith(("V.4.", "V.5."))]
        self.assertEqual(len(ours), 58)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 48)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("V.4.", "V.5.")) for n in p.get("notes", []))
        for place in ("Republic VI (509b)", "Parmenides (142a)", "Timaeus", "Metaphysics A.6", "Sophist (248e-249a)",
                      "Life 18", "Cratylus", "On the E at Delphi", "On sense and the sensible", "Iliad VII.421-422",
                      "Republic VI 505d-e", "Phaedrus (251a-252b)", "Symposium (198d-199a)"):
            self.assertIn(place, notes)

    def test_milestone_e21_forms_of_individuals_and_intelligible_beauty(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][29:31], ["V.7", "V.8"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "V.7"], ["V.7.1", "V.7.2", "V.7.3"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "V.8"], [f"V.8.{k}" for k in range(1, 14)])
        t = {t["id"]: t for t in d["treatises"]}
        self.assertNotIn("chapters_done", t["V.7"])
        self.assertNotIn("chapters_done", t["V.8"])
        self.assertIn("eighteenth in Porphyry's list", t["V.7"]["summary"])
        self.assertIn("transparent sphere", t["V.8"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual((c["V.7"]["status"], c["V.8"]["status"]), ("here", "here"))
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's chapters are the Greek's, except that the OCR lost his number 13 of V.8, whose text runs on in his 12.
        for cid in [f"V.7.{k}" for k in range(1, 4)] + [f"V.8.{k}" for k in range(1, 13)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1926)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["V.8.13"]["older"]], [(12, 87)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["V.7.1"]["older"]], [(1, 69)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["V.8.1"]["older"]], [(1, 73)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["V.7.1.p1"]["greek"].startswith("Εἰ καὶ τοῦ καθέκαστόν ἐστιν ἰδέα"))
        self.assertTrue(para["V.7.3.p4"]["greek"].endswith("τῶν ἐκεῖ προχείρων."))
        self.assertTrue(para["V.8.1.p1"]["greek"].startswith("Ἐπειδή φαμεν τὸν ἐν θέᾳ"))
        self.assertTrue(para["V.8.13.p2"]["greek"].endswith("πάλιν αὖ δεῖ ἐπελθεῖν ὧδε;"))
        self.assertIn("there will be a Socrates himself there", para["V.7.1.p1"]["modern"])
        self.assertIn("all of it is in what has no parts", para["V.7.1.p4"]["modern"])
        self.assertIn("Each gave the whole, and it lies in the child", para["V.7.2.p2"]["modern"])
        self.assertIn("it is we who cannot grasp the difference", para["V.7.3.p2"]["modern"])
        self.assertIn("only so far as the stone gave way to the art", para["V.8.1.p2"]["modern"])
        self.assertIn("Phidias made his Zeus after nothing perceptible", para["V.8.1.p4"]["modern"])
        self.assertIn("But if you too have seen yourself beautiful, recollect", para["V.8.2.p5"]["modern"])
        self.assertIn("as one takes a piece of gold as a sample of all gold", para["V.8.3.p2"]["modern"])
        self.assertIn("for light is clear to light", para["V.8.4.p1"]["modern"])
        self.assertIn("statues not painted, but real", para["V.8.5.p4"]["modern"])
        self.assertIn("carved in their temples one image for each thing", para["V.8.6.p1"]["modern"])
        self.assertIn("as if the conclusion came before the syllogism", para["V.8.7.p5"]["modern"])
        self.assertIn("he admired it, and wished to make it still more like the pattern", para["V.8.8.p2"]["modern"])
        self.assertIn("the shining image of a sphere", para["V.8.9.p1"]["modern"])
        self.assertIn("drunk through and through and filled with the nectar", para["V.8.10.p5"]["modern"])
        self.assertIn("we understand ourselves best of all", para["V.8.11.p5"]["modern"])
        self.assertIn("a god in labour with a beautiful offspring", para["V.8.12.p1"]["modern"])
        self.assertIn("between a better father and a lesser son", para["V.8.13.p1"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna makes the period a "soul-period", brings number into the infinity without parts, reads evil for
        # ugliness, gives the craftsman a model, takes the stones for "the realm of magnitudes", puts the stone in the
        # craftsman's hands, hides self-control under "Moral Wisdom", takes rest for a state, makes the human maker make
        # nothing, runs the Greek's thirteenth chapter on in his twelfth, and calls soul intellect's image, not its trace.
        self.assertTrue(any("whole period" in f["why"] for f in flags["V.7.1.p4"]))
        self.assertTrue(any("number" in f["why"] for f in flags["V.7.1.p4"]))
        self.assertTrue(any("ugliness" in f["why"] for f in flags["V.7.2.p3"]))
        self.assertTrue(any("no model" in f["why"] for f in flags["V.7.3.p2"]))
        self.assertTrue(any("two blocks of stone" in f["why"] for f in flags["V.8.1.p2"]))
        self.assertTrue(any("self-control" in f["why"] for f in flags["V.8.10.p2"]))
        self.assertTrue(any("rest" in f["why"] for f in flags["V.8.9.p2"]))
        self.assertTrue(any("into a denial" in f["why"] for f in flags["V.8.7.p4"]))
        self.assertTrue(any("lost his number 13" in f["why"] for f in flags["V.8.13.p1"]))
        self.assertTrue(any("trace" in f["why"] for f in flags["V.8.13.p2"]))
        ours = [s for s in flags if s.startswith(("V.7.", "V.8."))]
        self.assertEqual(len(ours), 63)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 50)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith(("V.7.", "V.8.")) for n in p.get("notes", []))
        for place in ("Metaphysics (B.2", "Nemesius", "Generation of animals", "Airs, waters, places", "Monadology 9",
                      "Letter VI (323d)", "Orator 8-9", "Iliad III.156-158", "Phaedrus 247d-e", "Pindar, Nemean X.61-63",
                      "Works and Days 256-259", "On Isis and Osiris", "Timaeus 37c-d", "Phaedrus 246e-247a",
                      "Theogony 453-500", "Cratylus (396b)", "Symposium (210e)"):
            self.assertIn(place, notes)

    def test_milestone_e22_on_the_kinds_of_being_chapters_1_to_15(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:32], ["VI.1"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.1"][:15], [f"VI.1.{k}" for k in range(1, 16)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.1 is done over E22 and E23: chapters 1 to 15 here, complete since E23.
        self.assertNotIn("chapters_done", t["VI.1"])
        self.assertIn("forty-second treatise in the order of writing", t["VI.1"]["summary"])
        self.assertIn("the Stoics' four kinds", t["VI.1"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.1"]["status"], "here")
        self.assertNotIn("chapters_done", c["VI.1"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's vol. V (1930), the first of the Sixth Ennead: his chapters are the Greek's.
        for cid in [f"VI.1.{k}" for k in range(1, 16)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.1.1"]["older"]], [(1, 1)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.1.15"]["older"]], [(15, 21)])
        self.assertIn({"file": "texts/plotinus/mackenna-1930.json", "year": 1930}, d["older"]["volumes"])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.1.1.p1"]["greek"].startswith("Περὶ τῶν ὄντων πόσα καὶ τίνα"))
        self.assertTrue(para["VI.1.15.p3"]["greek"].endswith("ἓν γένος;"))
        self.assertIn("they have left out the things that most are", para["VI.1.1.p4"]["modern"])
        self.assertIn("the family of the Heraclids is one", para["VI.1.3.p1"]["modern"])
        self.assertIn("\"three oxen\" are already two categories", para["VI.1.4.p3"]["modern"])
        self.assertIn("either soul or the now", para["VI.1.5.p3"]["modern"])
        self.assertIn("the comparison is ours, not in them", para["VI.1.6.p5"]["modern"])
        self.assertIn("they come into being at once", para["VI.1.7.p4"]["modern"])
        self.assertIn("the double itself is the cause", para["VI.1.9.p2"]["modern"])
        self.assertIn("an image of it, and like it", para["VI.1.10.p7"]["modern"])
        self.assertIn("motion is one kind of the things that are", para["VI.1.15.p2"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna makes the things that most are "the Supreme", turns the numbers' measuring round, has the soul measure
        # "the total figure", reads "posterior" and "prior" for the relatives named second and first, puts depravity for
        # ugliness, writes "Quantities" for qualities, takes affection for experience, and "Date" for the when.
        self.assertTrue(any("intelligibles, not the One" in f["why"] for f in flags["VI.1.1.p4"]))
        self.assertTrue(any("turns the comparison round" in f["why"] for f in flags["VI.1.4.p4"]))
        self.assertTrue(any("total figure" in f["why"] for f in flags["VI.1.4.p6"]))
        self.assertTrue(any("named second" in f["why"] for f in flags["VI.1.6.p1"]))
        self.assertTrue(any("not of vice" in f["why"] for f in flags["VI.1.9.p3"]))
        self.assertTrue(any("is a slip" in f["why"] for f in flags["VI.1.10.p6"]))
        self.assertTrue(any("from an affection" in f["why"] for f in flags["VI.1.11.p3"]))
        self.assertTrue(any("the when" in f["why"] for f in flags["VI.1.13.p1"]))
        ours = [s for s in flags if s.startswith("VI.1.") and int(s.split(".")[2]) <= 15]
        self.assertEqual(len(ours), 76)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 31)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.1.") for n in p.get("notes", []))
        for place in ("Categories 4, 1b25-2a4", "Physics I.2", "Metaphysics B.3", "Metaphysics Γ.2", "Categories 5, 4a10-11",
                      "Categories 6, 5b14-29", "On the soul II.8", "Physics IV.14", "Categories 7, 7b15-22", "Phaedo 100c-101c",
                      "Categories 8, 8b26-10a16", "Republic IV, 436a-441c", "Physics IV.3", "Sophist (254d)"):
            self.assertIn(place, notes)

    def test_milestone_e23_on_the_kinds_of_being_chapters_16_to_30(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:32], ["VI.1"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.1"], [f"VI.1.{k}" for k in range(1, 31)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.1 is complete: no chapters_done; the summary already covered chapters 16 to 30; VI.8 is still E33's.
        self.assertNotIn("chapters_done", t["VI.1"])
        self.assertIn("(chapters 25 to 30)", t["VI.1"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.1"]["status"], "here")
        self.assertNotIn("chapters_done", c["VI.1"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # Page's chapters in MacKenna's vol. V (1930) are the Greek's.
        for cid in [f"VI.1.{k}" for k in range(16, 31)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.1.30"]["older"]], [(30, 38)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.1.16.p1"]["greek"].startswith("εἰ δέ τις λέγοι τὴν κίνησιν ἀτελῆ ἐνέργειαν"))
        self.assertTrue(para["VI.1.30.p5"]["greek"].endswith("πρὸς τὰς δόξας αὐτῶν εἰρημένα."))
        self.assertIn("the one who is cutting has already cut", para["VI.1.16.p2"]["modern"])
        self.assertIn("as if change did not also happen all at once", para["VI.1.16.p5"]["modern"])
        self.assertIn("divide being moved, as one, in two", para["VI.1.17.p3"]["modern"])
        self.assertIn("thinking is relative to the intelligible", para["VI.1.18.p2"]["modern"])
        self.assertIn("nothing like pain", para["VI.1.19.p6"]["modern"])
        self.assertIn("the forming principle of the swan whitens", para["VI.1.20.p4"]["modern"])
        self.assertIn("as tin does", para["VI.1.20.p5"]["modern"])
        self.assertIn("those that follow intellect actions", para["VI.1.21.p4"]["modern"])
        self.assertIn("\"the drug acted\"", para["VI.1.22.p5"]["modern"])
        self.assertIn("a cloak lies on a couch", para["VI.1.23.p2"]["modern"])
        self.assertIn("\"lies back\" is nothing but \"lies up\"", para["VI.1.24.p2"]["modern"])
        self.assertIn("this \"something\" of theirs makes no sense", para["VI.1.25.p1"]["modern"])
        self.assertIn("matter does not beget form", para["VI.1.26.p1"]["modern"])
        self.assertIn("like one who makes himself everything in the dance", para["VI.1.27.p3"]["modern"])
        self.assertIn("perception became their guide", para["VI.1.28.p1"]["modern"])
        self.assertIn("Who, then, says this? Not matter itself, surely.", para["VI.1.29.p5"]["modern"])
        self.assertIn("there must first be one and two", para["VI.1.30.p4"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # Page drops the perfect of "has already cut", gives the analogy to a critic, divides motion for "being moved",
        # makes thought a faculty, pain an emotion, an agent of the one who means to hurt, and the thing bettered an
        # agent; he keeps MacKenna's "Reason-Principle" and writes "rational law" and "Seminal Principles" for the forming
        # principle, "Possession" and "Situation" for having and lying, "aimless" for free-standing; the scan reads
        # "wails" for his "walks".
        self.assertTrue(any("already cut" in f["why"] for f in flags["VI.1.16.p2"]))
        self.assertTrue(any("names no critic" in f["why"] for f in flags["VI.1.16.p3"]))
        self.assertTrue(any("being moved" in f["why"] for f in flags["VI.1.17.p3"]))
        self.assertTrue(any("not a faculty" in f["why"] for f in flags["VI.1.18.p2"]))
        self.assertTrue(any("not an emotion" in f["why"] for f in flags["VI.1.19.p4"]))
        self.assertTrue(any("means to hurt" in f["why"] for f in flags["VI.1.19.p9"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.1.20.p4"]))
        self.assertTrue(any("became better" in f["why"] for f in flags["VI.1.21.p1"]))
        self.assertTrue(any("free-standing" in f["why"] for f in flags["VI.1.22.p1"]))
        self.assertTrue(any("walks" in f["why"] for f in flags["VI.1.22.p5"]))
        self.assertTrue(any("having" in f["why"] for f in flags["VI.1.23.p1"]))
        self.assertTrue(any("lying" in f["why"] for f in flags["VI.1.24.p1"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.1.26.p2"]))
        self.assertTrue(any("seminal principles" in f["why"] for f in flags["VI.1.29.p3"]))
        # The forming principle keeps its one name in VI.1: no "reason-principle" or "rational principle" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.1."))
        self.assertIn("forming principle", mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|rational law")
        ours = [s for s in flags if s.startswith("VI.1.") and int(s.split(".")[2]) >= 16]
        self.assertEqual(len(ours), 72)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 23)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.1.") and int(p["chapter"].split(".")[2]) >= 16
                         for n in p.get("notes", []))
        for place in ("Physics III.2, 201b31-33", "Physics I.3, 186a15-16", "Categories 7, 6b2-6", "Physics III.3",
                      "Nicomachean Ethics I.7", "Physics V.2", "On the soul III.10", "Categories 15, 15b17-32",
                      "Categories 7, 6b11-14", "Simplicius, On the Categories", "Topics I.5", "Metaphysics Θ.8",
                      "Diogenes Laertius VII.134", "III.6, On the impassibility", "Categories 4, 1b28-29"):
            self.assertIn(place, notes)

    def test_milestone_e24_on_the_kinds_of_being_second_part(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:33], ["VI.1", "VI.2"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.2"], [f"VI.2.{k}" for k in range(1, 23)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.2 is done in one milestone: no chapters_done. Its summary names Plotinus' own five kinds, after the Sophist.
        self.assertNotIn("chapters_done", t["VI.2"])
        self.assertEqual(t["VI.2"]["title"], "On the kinds of being, second part")
        self.assertIn("forty-third treatise in the order of writing", t["VI.2"]["summary"])
        self.assertIn("being, motion, rest, sameness and otherness", t["VI.2"]["summary"])
        self.assertIn("Sophist (254d-255e)", t["VI.2"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.2"]["status"], "here")
        self.assertNotIn("chapters_done", c["VI.2"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # Page's chapters in MacKenna's vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.2.{k}" for k in range(1, 23)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.2.1"]["older"]], [(1, 40)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.2.22"]["older"]], [(22, 66)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.2.1.p1"]["greek"].startswith("Ἐπεὶ δὲ περὶ τῶν λεγομένων δέκα γενῶν"))
        self.assertTrue(para["VI.2.22.p7"]["greek"].endswith("ἄλλως ἑκάτερον καὶ ἄμφω ἐν νοητῷ."))
        self.assertIn("as if one were to put Socrates under the same kind as his portrait", para["VI.2.1.p5"]["modern"])
        self.assertIn("unless someone chops it up like a magnitude", para["VI.2.2.p5"]["modern"])
        self.assertIn("as they hasten to one another", para["VI.2.3.p4"]["modern"])
        self.assertIn("say a stone", para["VI.2.4.p1"]["modern"])
        self.assertIn("so soul is a one that is many", para["VI.2.5.p2"]["modern"])
        self.assertIn("as if being could not bear to be one", para["VI.2.6.p3"]["modern"])
        self.assertIn("what is common to all life, motion, as one kind", para["VI.2.7.p1"]["modern"])
        self.assertIn("You see the hearth of substance, and a sleepless light in it", para["VI.2.8.p2"]["modern"])
        self.assertIn("set them apart in otherness", para["VI.2.8.p5"]["modern"])
        self.assertIn("all the kinds come to five in all", para["VI.2.8.p6"]["modern"])
        self.assertIn("not willing to be divided, nor wishing to be a kind", para["VI.2.9.p8"]["modern"])
        self.assertIn("as an army or a chorus is", para["VI.2.10.p1"]["modern"])
        self.assertIn("looks rather to the good", para["VI.2.11.p4"]["modern"])
        self.assertIn("one as a whole in many", para["VI.2.12.p2"]["modern"])
        self.assertIn("the line a sort of two, and the plane three", para["VI.2.13.p2"]["modern"])
        self.assertIn("as he is already a living being before reaching the rational", para["VI.2.14.p3"]["modern"])
        self.assertIn("if many, there is otherness too, and if one many, sameness too", para["VI.2.15.p2"]["modern"])
        self.assertIn("Relation, which is like an offshoot", para["VI.2.16.p1"]["modern"])
        self.assertIn("its act according to nature toward the One", para["VI.2.17.p4"]["modern"])
        self.assertIn("Knowledge too is self-motion", para["VI.2.18.p2"]["modern"])
        self.assertIn("using it as a kind of pattern", para["VI.2.19.p3"]["modern"])
        self.assertIn("as a certain knowledge holds knowledge", para["VI.2.20.p2"]["modern"])
        self.assertIn("not of many words but of much intellect", para["VI.2.21.p1"]["modern"])
        self.assertIn("it is a complete living being and what living being is", para["VI.2.21.p8"]["modern"])
        self.assertIn("like the images in mirrors", para["VI.2.22.p6"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # Page makes the substrate "pseudosubstance" and soul "continuous", has being "contain" its one kind, calls the
        # other and the same "Difference" and "Identity", reverses the kinds' standing to being, makes the one and the good
        # identical, puts "a standard of perfection" for the good, and "Being has so created Intellect" for the intellect
        # that seems to have reasoned; he keeps MacKenna's "Reason-Principle" for the forming principle.
        self.assertTrue(any("loosely" in f["why"] for f in flags["VI.2.4.p1"]))
        self.assertTrue(any("a word for bodies" in f["why"] for f in flags["VI.2.4.p3"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.2.5.p3"]))
        self.assertTrue(any("itself the kind" in f["why"] for f in flags["VI.2.7.p3"]))
        self.assertTrue(any("Parmenides" in f["why"] for f in flags["VI.2.7.p3"]))
        self.assertTrue(any("otherness" in f["why"] for f in flags["VI.2.8.p5"]))
        self.assertTrue(any("sameness" in f["why"] for f in flags["VI.2.8.p5"]))
        self.assertTrue(any("reverses" in f["why"] for f in flags["VI.2.8.p7"]))
        self.assertTrue(any("sixth kind" in f["why"] for f in flags["VI.2.9.p5"]))
        self.assertTrue(any("looks to the good" in f["why"] for f in flags["VI.2.11.p4"]))
        self.assertTrue(any("identical" in f["why"] for f in flags["VI.2.11.p5"]))
        self.assertTrue(any("by analogy" in f["why"] for f in flags["VI.2.14.p3"]))
        self.assertTrue(any("probably not there" in f["why"] for f in flags["VI.2.16.p1"]))
        self.assertTrue(any("if you like" in f["why"] for f in flags["VI.2.18.p2"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.2.21.p1"]))
        self.assertTrue(any("not the maker of intellect" in f["why"] for f in flags["VI.2.21.p5"]))
        self.assertTrue(any("the nature of the other" in f["why"] for f in flags["VI.2.22.p2"]))
        # The forming principle keeps its one name, and the five kinds theirs: no "reason-principle", "stability",
        # "identity" of our own, and "otherness" for ἑτερότης.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.2."))
        self.assertIn("forming principle", mod)
        for kind in ("motion", "rest", "sameness", "otherness", "the same and the other"):
            self.assertIn(kind, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|stability|identity")
        ours = [s for s in flags if s.startswith("VI.2.")]
        self.assertEqual(len(ours), 105)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 59)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.2.") for n in p.get("notes", []))
        for place in ("Timaeus (27d-28a)", "Sophist (244b-245e)", "On generation and corruption I.10", "Metaphysics B.3, 998b22-27",
                      "Republic (VI 509b)", "On the soul III.4, 429b10-22", "Sophist (248e-249a)", "Parmenides' second hypothesis",
                      "Phaedo 78c-d", "On the soul III.4, 430a2-5", "Phaedrus 247a", "Cratylus (401c-d)", "Sophist (254e-255e)",
                      "N.1, 1088a4-8", "Seneca, Letters 102.6", "Nicomachean Ethics I.6, 1096a21-22", "Republic (VI 509a)",
                      "Euclid, Elements VII", "Timaeus (39e)", "Philebus (16e)", "Parmenides (144b-e)"):
            self.assertIn(place, notes)

    def test_milestone_e25_on_the_kinds_of_being_third_part_chapters_1_to_14(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:34], ["VI.1", "VI.2", "VI.3"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.3"][:14], [f"VI.3.{k}" for k in range(1, 15)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.3 is done over E25 and E26, complete since E26: no chapters_done. Its summary covers the whole treatise.
        self.assertNotIn("chapters_done", t["VI.3"])
        self.assertEqual(t["VI.3"]["title"], "On the kinds of being, third part")
        self.assertIn("forty-fourth treatise in the order of writing", t["VI.3"]["summary"])
        self.assertIn("a painting on a shadow", t["VI.3"]["summary"])
        self.assertIn("(chapters 21 to 28)", t["VI.3"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.3"]["status"], "here")
        self.assertNotIn("chapters_done", c["VI.3"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # Page's chapters in MacKenna's vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.3.{k}" for k in range(1, 15)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.3.1"]["older"]], [(1, 68)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.3.14"]["older"]], [(14, 85)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.3.1.p1"]["greek"].startswith("Περὶ μὲν τῆς οὐσίας ὅπῃ δοκεῖ"))
        self.assertTrue(para["VI.3.14.p4"]["greek"].endswith("μεγέθη διάφορα ἐν εἴδεσιν αὐτῶν τακτέον."))
        self.assertIn("by their property ratings, say, or their crafts", para["VI.3.1.p3"]["modern"])
        self.assertIn("we would be beginning from syllables", para["VI.3.2.p2"]["modern"])
        self.assertIn("matter's not going out of itself stands for rest", para["VI.3.2.p3"]["modern"])
        self.assertIn("Or these too go into relation, for it is more inclusive", para["VI.3.3.p4"]["modern"])
        self.assertIn("Or is it what is not said to be of another?", para["VI.3.4.p2"]["modern"])
        self.assertIn("nor is man in Socrates, since he is part of Socrates", para["VI.3.5.p2"]["modern"])
        self.assertIn("By what, then? By being.", para["VI.3.6.p1"]["modern"])
        self.assertIn("a shadow of forming principle and a falling-away from forming principle", para["VI.3.7.p1"]["modern"])
        self.assertIn("like a fired pot", para["VI.3.7.p4"]["modern"])
        self.assertIn("upon what is itself a shadow there is a painting, and the appearing", para["VI.3.8.p4"]["modern"])
        self.assertIn("man gave it to Socrates", para["VI.3.9.p4"]["modern"])
        self.assertIn("by hot and dry, dry and cold, cold and wet", para["VI.3.10.p1"]["modern"])
        self.assertIn("is a mountain small, and a millet seed big?", para["VI.3.11.p2"]["modern"])
        self.assertIn("\"The most beautiful of apes\", he says", para["VI.3.11.p3"]["modern"])
        self.assertIn("there is no down in the All", para["VI.3.12.p3"]["modern"])
        self.assertIn("the first, the second and the third increase", para["VI.3.13.p2"]["modern"])
        self.assertIn("geometry would be concerned not with magnitudes but with quality", para["VI.3.14.p3"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # Page makes vocal sound "speech", the shared name "analogy", the syllables "compounds", substance's not being of
        # another "not predicated", substance here "pseudo-substance", matter's falling-away from forming principle "a
        # vain attempt", the five horses' quantities "qualities", the third increase a "dimension"; he keeps "Stability",
        # "Identity", "Difference" and "Reason-Principle" for rest, the same, the other and the forming principle.
        self.assertTrue(any("vocal sound" in f["why"] for f in flags["VI.3.1.p2"]))
        self.assertTrue(any("homonymous" in f["why"] for f in flags["VI.3.1.p3"]))
        self.assertTrue(any("not by analogy" in f["why"] for f in flags["VI.3.2.p1"]))
        self.assertTrue(any("syllables" in f["why"] for f in flags["VI.3.2.p2"]))
        self.assertTrue(any("Stability" in f["why"] for f in flags["VI.3.2.p3"]))
        self.assertTrue(any("sameness" in f["why"] and "otherness" in f["why"] for f in flags["VI.3.2.p3"]))
        self.assertTrue(any("Reason-Principle" in f["why"] for f in flags["VI.3.3.p2"]))
        self.assertTrue(any("not being predicated" in f["why"] for f in flags["VI.3.4.p2"]))
        self.assertTrue(any("pseudo-substance" in f["why"] for f in flags["VI.3.5.p1"]))
        self.assertTrue(any("containing body" in f["why"] for f in flags["VI.3.5.p4"]))
        self.assertTrue(any("not its whiteness" in f["why"] for f in flags["VI.3.6.p4"]))
        self.assertTrue(any("falling-away" in f["why"] for f in flags["VI.3.7.p1"]))
        self.assertTrue(any("a certain white and white" in f["why"] for f in flags["VI.3.9.p3"]))
        self.assertTrue(any("more substance" in f["why"] for f in flags["VI.3.9.p4"]))
        self.assertTrue(any("the account, the definition" in f["why"] for f in flags["VI.3.9.p5"]))
        self.assertTrue(any("is a slip" in f["why"] for f in flags["VI.3.11.p1"]))
        self.assertTrue(any("Absolute Great" in f["why"] for f in flags["VI.3.11.p3"]))
        self.assertTrue(any("no down in the All" in f["why"] for f in flags["VI.3.12.p3"]))
        self.assertTrue(any("arithmeticians" in f["why"] for f in flags["VI.3.13.p1"]))
        self.assertTrue(any("increase" in f["why"] for f in flags["VI.3.13.p2"]))
        # The fixed names: "forming principle" for λόγος, "otherness" for ἑτερότης, "the same and the other", "rest"; no
        # "reason-principle", "stability" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.3."))
        for word in ("forming principle", "otherness", "the same and the other", "rest", "becoming", "not in a subject"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|stability|identity")
        ours = [s for s in flags if s.startswith("VI.3.") and int(s.split(".")[2]) <= 14]
        self.assertEqual(len(ours), 55)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 39)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.3.") for n in p.get("notes", []))
        for place in ("Timaeus 27d-28a", "Philebus (17b, 18b-d)", "Categories 1, 1a1-12", "Sophist (254d-255e)",
                      "Metaphysics Z.6", "Categories 2, 1a24-25", "Categories 5 (3a21-28)", "Physics IV.4", "Metaphysics Γ.2",
                      "Phaedo (100c-e)", "On the soul II.2-3", "Timaeus gives four kinds of living beings",
                      "Categories 5, 2a11-19", "Physics I.1", "On generation and corruption II.3", "Categories 6, 5b14-29",
                      "Heraclitus (fragment B82 Diels-Kranz)", "Hippias Major (289a-b)", "Timaeus (62c-63e)",
                      "Republic (VII 528a-b)", "Categories 8, 10a11-16"):
            self.assertIn(place, notes)

    def test_milestone_e26_on_the_kinds_of_being_third_part_chapters_15_to_28(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:34], ["VI.1", "VI.2", "VI.3"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.3"], [f"VI.3.{k}" for k in range(1, 29)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.3 is complete: no chapters_done; the summary already covered chapters 15 to 28; VI.8 is still E33's.
        self.assertNotIn("chapters_done", t["VI.3"])
        self.assertIn("(chapters 15 to 20)", t["VI.3"]["summary"])
        self.assertIn("(chapters 21 to 28)", t["VI.3"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.3"]["status"], "here")
        self.assertNotIn("chapters_done", c["VI.3"])
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # Page's chapters in MacKenna's vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.3.{k}" for k in range(15, 29)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.3.15"]["older"]], [(15, 87)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.3.28"]["older"]], [(28, 106)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.3.15.p1"]["greek"].startswith("ἀλλὰ πῶς ἴδιον τοῦ ποσοῦ τὸ ἴσον καὶ ἄνισον;"))
        self.assertTrue(para["VI.3.28.p2"]["greek"].endswith("καὶ περὶ μὲν τούτων τῶν γενῶν ταῦτα."))
        self.assertIn("it is not the perceptible Socrates that should be called Socrates", para["VI.3.15.p4"]["modern"])
        self.assertIn("since they belong to a soul that bends downwards", para["VI.3.16.p5"]["modern"])
        self.assertIn("one draws the sight together and another parts it", para["VI.3.17.p3"]["modern"])
        self.assertIn("as with leek-green against pale yellow", para["VI.3.18.p1"]["modern"])
        self.assertIn("an otherness that separates the one from the other", para["VI.3.18.p2"]["modern"])
        self.assertIn("one about getting in the harvest and another about spending", para["VI.3.18.p6"]["modern"])
        self.assertIn("rather in some way disposed", para["VI.3.19.p3"]["modern"])
        self.assertIn("health and sickness, at any rate, have nothing that has fallen between them", para["VI.3.20.p3"]["modern"])
        self.assertIn("compared with the cubit's length", para["VI.3.21.p2"]["modern"])
        self.assertIn("being a motion that displaces", para["VI.3.21.p5"]["modern"])
        self.assertIn("the way from potency into that which a thing is said to be able for", para["VI.3.22.p1"]["modern"])
        self.assertIn("a waking form", para["VI.3.22.p2"]["modern"])
        self.assertIn("the life of bodies, he would not be absurd either", para["VI.3.22.p2"]["modern"])
        self.assertIn("is always otherness", para["VI.3.22.p5"]["modern"])
        self.assertIn("like a breath into something else", para["VI.3.23.p3"]["modern"])
        self.assertIn("the difference is perhaps from outside things", para["VI.3.24.p2"]["modern"])
        self.assertIn("and bring alteration back to them?", para["VI.3.25.p4"]["modern"])
        self.assertIn("some are by nature, some by art, some by choice", para["VI.3.26.p2"]["modern"])
        self.assertIn("give rest to the things there, and to look for stillness here", para["VI.3.27.p1"]["modern"])
        self.assertIn("is still by an absence", para["VI.3.27.p5"]["modern"])
        self.assertIn("as the ancients divided them", para["VI.3.28.p2"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # Page makes the perceptible Socrates the one called Socrates, the soul's bending down "apostasy", leek-green and
        # pale yellow two greens, the otherness in intellect "diversity", the virtues' objects vices, the "disposed"
        # "states", the cubit a yard, the life of bodies "unwarrantable", the difference of change of place its own, the
        # combinations "integration", alteration added to them where it is brought back to them; he keeps "Stability",
        # "Identity", "Difference" and "Reason-Principle" for rest, the same, the other and the forming principle.
        self.assertTrue(any("Aristotle" in f["why"] for f in flags["VI.3.15.p1"]))
        self.assertTrue(any("not the perceptible Socrates" in f["why"] for f in flags["VI.3.15.p4"]))
        self.assertTrue(any("Reason-Principle" in f["why"] for f in flags["VI.3.15.p4"]))
        self.assertTrue(any("apostasy" in f["why"] for f in flags["VI.3.16.p5"]))
        self.assertTrue(any("makings of bodies" in f["why"] for f in flags["VI.3.16.p7"]))
        self.assertTrue(any("draws together" in f["why"] for f in flags["VI.3.17.p3"]))
        self.assertTrue(any("leek-green" in f["why"] for f in flags["VI.3.18.p1"]))
        self.assertTrue(any("otherness" in f["why"] for f in flags["VI.3.18.p2"]))
        self.assertTrue(any("no vice is named" in f["why"] for f in flags["VI.3.18.p6"]))
        self.assertTrue(any("in some way disposed" in f["why"] for f in flags["VI.3.19.p3"]))
        self.assertTrue(any("does not assert it" in f["why"] for f in flags["VI.3.19.p5"]))
        self.assertTrue(any("latitude" in f["why"] for f in flags["VI.3.20.p6"]))
        self.assertTrue(any("cubit" in f["why"] for f in flags["VI.3.21.p2"]))
        self.assertTrue(any("learning and playing the lyre" in f["why"] for f in flags["VI.3.21.p5"]))
        self.assertTrue(any("he would not be absurd either" in f["why"] for f in flags["VI.3.22.p2"]))
        self.assertTrue(any("Identity" in f["why"] and "Difference" in f["why"] for f in flags["VI.3.22.p5"]))
        self.assertTrue(any("measure of motion" in f["why"] for f in flags["VI.3.22.p5"]))
        self.assertTrue(any("sameness" in f["why"] for f in flags["VI.3.23.p1"]))
        self.assertTrue(any("diminution" in f["why"] for f in flags["VI.3.23.p4"]))
        self.assertTrue(any("from outside things" in f["why"] for f in flags["VI.3.24.p2"]))
        self.assertTrue(any("integration" in f["why"] for f in flags["VI.3.25.p1"]))
        self.assertTrue(any("bring alteration back to them" in f["why"] for f in flags["VI.3.25.p4"]))
        self.assertTrue(any("ensouled" in f["why"] for f in flags["VI.3.26.p1"]))
        self.assertTrue(any("Stability" in f["why"] and "stillness" in f["why"] for f in flags["VI.3.27.p1"]))
        self.assertTrue(any("rest has taken hold of it" in f["why"] for f in flags["VI.3.27.p5"]))
        self.assertTrue(any("kinds of the perceptible" in f["why"] for f in flags["VI.3.28.p2"]))
        # The fixed names: "forming principle" for λόγος, "otherness" for ἑτερότης, "sameness", "rest" for στάσις and
        # "stillness" for ἠρεμία; no "reason-principle", "stability" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"] in [f"VI.3.{k}" for k in range(15, 29)])
        for word in ("forming principle", "otherness", "sameness", "rest", "stillness", "combination and separation"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|stability|identity")
        ours = [s for s in flags if s.startswith("VI.3.") and int(s.split(".")[2]) >= 15]
        self.assertEqual(len(ours), 65)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 60)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"] in [f"VI.3.{k}" for k in range(15, 29)]
                         for n in p.get("notes", []))
        for place in ("Categories 6, 6a26-35", "Categories 8, 11a15-19", "Republic (VII 525b-531c)", "Philebus (56d-57a)",
                      "Timaeus (67d-e)", "Metaphysics Ι.7 (1057b8-9)", "Republic (V 477c-d)", "On the soul II.4",
                      "On sense and the sensibles 3", "Theophrastus, On the senses 65-67", "Categories 8 (9b19-33)",
                      "Categories 10 (11b38-12a25)", "Metaphysics Ι.4 (1055a3-33)", "Physics V.1 (225a20-b9)",
                      "Physics IV.12, 221b3", "Physics III.1 (201a10-11)", "Physics VIII.1, 250b14-15",
                      "Physics IV.11, 219b1-2", "Sophist (256a-b)", "Physics III.3 (202a13-b22)", "Categories 14",
                      "On the heavens I.2", "Laws X 893c-d", "On generation and corruption I.10",
                      "Physics IV.9", "Physics II.1, 192b13-23", "Physics V.2, 226b12-16", "Theaetetus (152d-e, 181c-183b)",
                      "Physics V.6", "Metaphysics Δ.15"):
            self.assertIn(place, notes)

    def test_milestone_e27_that_being_one_and_the_same_is_everywhere_whole_first_part(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:35], ["VI.1", "VI.2", "VI.3", "VI.4"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.4"], [f"VI.4.{k}" for k in range(1, 17)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.4 is done whole in E27, under its own @treatise block; VI.5, its second part, was done in E28.
        self.assertNotIn("chapters_done", t["VI.4"])
        self.assertIn("The twenty-second treatise in the order of writing", t["VI.4"]["summary"])
        self.assertIn("VI.5, the twenty-third, is its second part", t["VI.4"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.4"]["status"], "here")
        self.assertEqual(c["VI.5"]["status"], "here")
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's own chapters in his vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.4.{k}" for k in range(1, 17)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.4.1"]["older"]], [(1, 106)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.4.16"]["older"]], [(16, 124)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.4.1.p1"]["greek"].startswith("Ἆρά γε ἡ ψυχὴ πανταχοῦ τῷ παντὶ πάρεστιν"))
        self.assertTrue(para["VI.4.16.p6"]["greek"].endswith("ἀρχῆς λόγον λέγωμεν."))
        self.assertIn("the same in number, as our perceptions show", para["VI.4.1.p2"]["modern"])
        self.assertIn("the imitation of the All, the nature of this visible world", para["VI.4.2.p1"]["modern"])
        self.assertIn("souls are like darts thrown out", para["VI.4.3.p1"]["modern"])
        self.assertIn("being too is many by otherness, not by place", para["VI.4.4.p4"]["modern"])
        self.assertIn("the art of medicine was smaller than the doctor's body", para["VI.4.5.p2"]["modern"])
        self.assertIn("a pleasure in the finger and a pain in the head", para["VI.4.6.p2"]["modern"])
        self.assertIn("a larger spherical transparent body", para["VI.4.7.p3"]["modern"])
        self.assertIn("fastening the affection of the many on that one", para["VI.4.8.p3"]["modern"])
        self.assertIn("power there is reality and substance, or greater than substance", para["VI.4.9.p2"]["modern"])
        self.assertIn("the placing of the colours just so", para["VI.4.10.p1"]["modern"])
        self.assertIn("To the clouded the sharing is otherwise", para["VI.4.11.p1"]["modern"])
        self.assertIn("the forming principle is one and many", para["VI.4.11.p3"]["modern"])
        self.assertIn("does not have sameness with what it is taken to show", para["VI.4.12.p4"]["modern"])
        self.assertIn("the two-cubit does not become three-cubit", para["VI.4.13.p2"]["modern"])
        self.assertIn("we were there, other men, some of us even gods", para["VI.4.14.p2"]["modern"])
        self.assertIn("we have become the pair", para["VI.4.14.p3"]["modern"])
        self.assertIn("a disorderly people wanting food", para["VI.4.15.p3"]["modern"])
        self.assertIn("as if a fire that could burn everything were made to burn some small thing", para["VI.4.16.p4"]["modern"])
        self.assertIn("if philosophy has set it wholly free", para["VI.4.16.p5"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna translated VI.4 himself, so the flags are his: the white the Form White, the world and its original
        # "side by side", place an "envelope", the clouded "opaque", the obstacles to the sun's light "refraction", the
        # image in mirrors denied, the trace of soul "soul entire", and "the All-Soul"; he keeps "differentiation" for
        # otherness and "Reason-Principle" for the forming principle.
        self.assertTrue(any("same in form" in f["why"] for f in flags["VI.4.1.p2"]))
        self.assertTrue(any("imitation of the All" in f["why"] for f in flags["VI.4.2.p1"]))
        self.assertTrue(any("limit of the surrounding body" in f["why"] for f in flags["VI.4.2.p1"]))
        self.assertTrue(any("emanant" in f["why"] for f in flags["VI.4.3.p1"]))
        self.assertTrue(any("otherness" in f["why"] for f in flags["VI.4.4.p4"]))
        self.assertTrue(any("additions" in f["why"] for f in flags["VI.4.6.p1"]))
        self.assertTrue(any("luminous body" in f["why"] for f in flags["VI.4.7.p3"]))
        self.assertTrue(any("no refraction" in f["why"] for f in flags["VI.4.7.p4"]))
        self.assertTrue(any("like it, not identical" in f["why"] for f in flags["VI.4.9.p1"]))
        self.assertTrue(any("consciousness" in f["why"] for f in flags["VI.4.9.p4"]))
        self.assertTrue(any("water and mirrors" in f["why"] for f in flags["VI.4.10.p2"]))
        self.assertTrue(any("not the opaque" in f["why"] for f in flags["VI.4.11.p1"]))
        self.assertTrue(any("Reason-Principle" in f["why"] for f in flags["VI.4.11.p3"]))
        self.assertTrue(any("otherness" in f["why"] for f in flags["VI.4.11.p3"]))
        self.assertTrue(any("no silent one" in f["why"] for f in flags["VI.4.12.p4"]))
        self.assertTrue(any("the pair" in f["why"] for f in flags["VI.4.14.p3"]))
        self.assertTrue(any("trace of soul" in f["why"] for f in flags["VI.4.15.p2"]))
        self.assertTrue(any("All-Soul" in f["why"] for f in flags["VI.4.16.p4"]))
        self.assertTrue(any("no choice" in f["why"] for f in flags["VI.4.16.p6"]))
        whys = " ".join(f["why"] for s in flags if s.startswith("VI.4.") for f in flags[s])
        self.assertIn("MacKenna", whys)
        self.assertNotIn("Page", whys)
        # The fixed names: "forming principle" for λόγος, "otherness" for ἑτερότης, "sameness" for ταυτότης; no
        # "reason-principle", "differentiation" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.4."))
        for word in ("forming principle", "otherness", "sameness", "intelligible", "intellect"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|differentiation|identity")
        ours = [s for s in flags if s.startswith("VI.4.")]
        self.assertEqual(len(ours), 64)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 60)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.4.") for n in p.get("notes", []))
        for place in ("Timaeus 35a", "Parmenides (131a-c)", "Topics I.7", "Physics IV.4", "Timaeus (30c-31b, 92c)",
                      "Sophist's (248e-249a)", "Parmenides (B8.25)", "Theaetetus (184b-186a)", "On the soul III.2",
                      "Republic VI 509b", "Republic X (596e-598b)", "Sophist (256d-259b)", "On the soul II.7",
                      "Phaedo (96d-97b, 100e-101c)", "Physics VI.1", "Alcibiades I (129e-130c)", "Timaeus (67b)",
                      "IX (588c-589b)", "Phaedrus (248c-249b)", "Phaedo (64c, 67a-d)", "Cratylus (403a)", "Odyssey XI"):
            self.assertIn(place, notes)

    def test_milestone_e28_that_being_one_and_the_same_is_everywhere_whole_second_part(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:36], ["VI.1", "VI.2", "VI.3", "VI.4", "VI.5"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.5"], [f"VI.5.{k}" for k in range(1, 13)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.5 is done whole in E28, under its own @treatise block; VI.6 was done in E29.
        self.assertNotIn("chapters_done", t["VI.5"])
        self.assertIn("The twenty-third treatise in the order of writing", t["VI.5"]["summary"])
        self.assertIn("taken up again from the beginning", t["VI.5"]["summary"])
        self.assertIn("(Life 5)", t["VI.5"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.5"]["status"], "here")
        self.assertEqual(c["VI.6"]["status"], "here")
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's own chapters in his vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.5.{k}" for k in range(1, 13)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.5.1"]["older"]], [(1, 125)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.5.12"]["older"]], [(12, 136)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.5.1.p1"]["greek"].startswith("Τὸ ἓν καὶ ταὐτὸ ἀριθμῷ πανταχοῦ ἅμα ὅλον εἶναι"))
        self.assertTrue(para["VI.5.12.p5"]["greek"].endswith("εἰς ἓν ἰόντα ἀμεγέθει τῷ ἀπείρῳ."))
        self.assertIn("speak of the god in each of us as one and the same", para["VI.5.1.p1"]["modern"])
        self.assertIn("nor, again, has it stood away from us", para["VI.5.1.p3"]["modern"])
        self.assertIn("making likely reasonings through likely things", para["VI.5.2.p2"]["modern"])
        self.assertIn("as far as it is possible for them to be present to it", para["VI.5.3.p1"]["modern"])
        self.assertIn("hung, as it were, from one centre of one sphere", para["VI.5.4.p4"]["modern"])
        self.assertIn("the lines not begetting them but showing them", para["VI.5.5.p3"]["modern"])
        self.assertIn("as it were stamped like a seal in many", para["VI.5.6.p2"]["modern"])
        self.assertIn("like many faces that face outward", para["VI.5.7.p2"]["modern"])
        self.assertIn("being well known from its patterns", para["VI.5.8.p2"]["modern"])
        self.assertIn("a number that increases itself", para["VI.5.9.p2"]["modern"])
        self.assertIn("having one forming principle that holds itself in", para["VI.5.9.p4"]["modern"])
        self.assertIn("this is Love who sleeps out at the door", para["VI.5.10.p1"]["modern"])
        self.assertIn("which is why wisdom is common", para["VI.5.10.p2"]["modern"])
        self.assertIn("hung from a point and running about it", para["VI.5.11.p2"]["modern"])
        self.assertIn("as the immaterial triangle itself", para["VI.5.11.p4"]["modern"])
        self.assertIn("letting go of the \"so much\", you have become all", para["VI.5.12.p3"]["modern"])
        self.assertIn("you turned to the contrary", para["VI.5.12.p4"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna translated VI.5 himself, so the flags are his: "Reason-Principle" for the forming principle, sharing
        # called "obvious" where the Greek says it would have been, time a "radial line" where it circles a point, the
        # beautiful made "The Good", "the virtue of soul" for its power, and "the lesser gods" for the other gods.
        self.assertTrue(any("would be true if" in f["why"] for f in flags["VI.5.1.p1"]))
        self.assertTrue(any("nor again has it" in f["why"] for f in flags["VI.5.1.p3"]))
        self.assertTrue(any("becoming, not substance" in f["why"] for f in flags["VI.5.2.p2"]))
        self.assertTrue(any("present to it, not it to them" in f["why"] for f in flags["VI.5.3.p1"]))
        self.assertTrue(any("emanant" in f["why"] for f in flags["VI.5.3.p3"]))
        self.assertTrue(any("every man who believes in a god" in f["why"] for f in flags["VI.5.4.p3"]))
        self.assertTrue(any("without extension" in f["why"] for f in flags["VI.5.5.p1"]))
        self.assertTrue(any("nothing is absorbed" in f["why"] for f in flags["VI.5.6.p3"]))
        self.assertTrue(any("a head with many faces" in f["why"] for f in flags["VI.5.7.p2"]))
        self.assertTrue(any("is unreal" in f["why"] for f in flags["VI.5.8.p2"]))
        self.assertTrue(any("not virtue" in f["why"] for f in flags["VI.5.9.p2"]))
        self.assertTrue(any("Reason-Principle" in f["why"] for f in flags["VI.5.9.p4"]))
        self.assertTrue(any("the beautiful, not the Good" in f["why"] for f in flags["VI.5.10.p2"]))
        self.assertTrue(any("more absurd" in f["why"] for f in flags["VI.5.10.p5"]))
        self.assertTrue(any("not a radius running out" in f["why"] for f in flags["VI.5.11.p2"]))
        self.assertTrue(any("present to all" in f["why"] for f in flags["VI.5.11.p4"]))
        self.assertTrue(any("giving up" in f["why"] for f in flags["VI.5.12.p2"]))
        self.assertTrue(any("the other gods" in f["why"] for f in flags["VI.5.12.p5"]))
        whys = " ".join(f["why"] for s in flags if s.startswith("VI.5.") for f in flags[s])
        self.assertIn("MacKenna", whys)
        self.assertNotIn("Page", whys)
        # The fixed names: "forming principle" for λόγος, "substance" for οὐσία, "intelligible" for νοητός; no
        # "reason-principle", "differentiation" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.5."))
        for word in ("forming principle", "substance", "intelligible", "intellect", "self-controlled", "eternity"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|differentiation|identity")
        ours = [s for s in flags if s.startswith("VI.5.")]
        self.assertEqual(len(ours), 46)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 70)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.5.") for n in p.get("notes", []))
        for place in ("Timaeus (90a)", "Nicomachean Ethics (I.1, 1094a2-3)", "Timaeus (27d-28a)", "On the soul I.1",
                      "Parmenides (138a-b)", "Second Letter (312e)", "Republic X (596a)", "Theaetetus (191c-d)",
                      "Iliad I 194-200", "Timaeus (50c)", "Timaeus (51b-e)", "Republic X (597c)", "On the soul I.2",
                      "Parmenides' second hypothesis", "Symposium (203c-d)", "fragment B113", "Politics III.11",
                      "Phaedo (70b, 115d)", "Timaeus (37d)", "Timaeus (53c-55c)", "Odyssey XVII (485-487)"):
            self.assertIn(place, notes)

    def test_milestone_e29_on_numbers(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:37], ["VI.1", "VI.2", "VI.3", "VI.4", "VI.5", "VI.6"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.6"], [f"VI.6.{k}" for k in range(1, 19)])
        t = {t["id"]: t for t in d["treatises"]}
        # VI.6 is done whole in E29, under its own @treatise block; VI.7 is done over E30 to E32.
        self.assertNotIn("chapters_done", t["VI.6"])
        self.assertIn("The thirty-fourth treatise in the order of writing", t["VI.6"]["summary"])
        self.assertIn("(Life 5)", t["VI.6"]["summary"])
        self.assertIn("the substantial number", t["VI.6"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual(c["VI.6"]["status"], "here")
        self.assertEqual((c["VI.7"]["status"], c["VI.7"]["chapters_done"]), ("here", 14))
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's own chapters in his vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.6.{k}" for k in range(1, 19)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.6.1"]["older"]], [(1, 138)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.6.5"]["older"]], [(5, 142)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.6.18"]["older"]], [(18, 160)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.6.1.p1"]["greek"].startswith("Ἆῤ ἐστὶ τὸ πλῆθος ἀπόστασις τοῦ ἑνός"))
        self.assertTrue(para["VI.6.18.p5"]["greek"].endswith("τὸ δὲ εἶναι αὔταρκες ἑαυτῷ."))
        self.assertIn("Is multitude a standing away from the one", para["VI.6.1.p1"]["modern"])
        self.assertIn("as we multiply a town that does not exist", para["VI.6.2.p2"]["modern"])
        self.assertIn("like a net, you will have it slipping away", para["VI.6.3.p4"]["modern"])
        self.assertIn("giving the thought of it to the otherness of things", para["VI.6.4.p2"]["modern"])
        self.assertIn("I mean not that one which we say is beyond being", para["VI.6.5.p3"]["modern"])
        self.assertIn("it is like a statue in intellect", para["VI.6.6.p5"]["modern"])
        self.assertIn("true substance has stripped these off", para["VI.6.8.p2"]["modern"])
        self.assertIn("the beings number unrolled, and intellect number moving in itself", para["VI.6.9.p3"]["modern"])
        self.assertIn("And this is the substantial number", para["VI.6.9.p4"]["modern"])
        self.assertIn("I want so great a multitude of gold", para["VI.6.10.p1"]["modern"])
        self.assertIn("without number and without forming principle", para["VI.6.11.p3"]["modern"])
        self.assertIn("an affection of the soul toward each of the beings", para["VI.6.12.p1"]["modern"])
        self.assertIn("so it knew it before", para["VI.6.13.p4"]["modern"])
        self.assertIn("one by the presence of the one, and two by the presence of the dyad", para["VI.6.14.p3"]["modern"])
        self.assertIn("intellect's justice and self-control and the other virtues", para["VI.6.15.p2"]["modern"])
        self.assertIn("living being and rational", para["VI.6.16.p3"]["modern"])
        self.assertIn("the unlimited is at war with number", para["VI.6.17.p1"]["modern"])
        self.assertIn("the pyramid there, if you like, to the fire there", para["VI.6.17.p3"]["modern"])
        self.assertIn("Parmenides was right to say that being is one", para["VI.6.18.p4"]["modern"])
        self.assertIn("but being is sufficient to itself", para["VI.6.18.p5"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna translated VI.6 himself, so the flags are his: "Matter" where the Greek has the unlimited, "Henads"
        # for units, the infinite line in the intelligible given as Plotinus' view where the Greek asks it, the line there
        # "not quantitative" where the Greek says it would be, and "Reason" for the forming principle.
        self.assertTrue(any("asks a question" in f["why"] for f in flags["VI.6.1.p1"]))
        self.assertTrue(any("leaves out the town" in f["why"] for f in flags["VI.6.2.p2"]))
        self.assertTrue(any("does not say \"evil\"" in f["why"] for f in flags["VI.6.3.p1"]))
        self.assertTrue(any("\"Matter\" is MacKenna's" in f["why"] for f in flags["VI.6.3.p4"]))
        self.assertTrue(any("otherness" in f["why"] for f in flags["VI.6.4.p2"]))
        self.assertTrue(any("statue" in f["why"] for f in flags["VI.6.6.p5"]))
        self.assertTrue(any("units" in f["why"] for f in flags["VI.6.9.p3"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.6.11.p3"]))
        self.assertTrue(any("Stoics" in f["why"] for f in flags["VI.6.12.p2"]))
        self.assertTrue(any("self-control" in f["why"] for f in flags["VI.6.15.p2"]))
        self.assertTrue(any("not given as Plotinus' view" in f["why"] for f in flags["VI.6.17.p2"]))
        self.assertTrue(any("reverses the first clause" in f["why"] for f in flags["VI.6.17.p2"]))
        self.assertTrue(any("after this seek the good" in f["why"] for f in flags["VI.6.18.p5"]))
        whys = " ".join(f["why"] for s in flags if s.startswith("VI.6.") for f in flags[s])
        self.assertIn("MacKenna", whys)
        self.assertNotIn("Page", whys)
        # The fixed names: "forming principle" for λόγος, "substance" for οὐσία, "intelligible" for νοητός, "otherness"
        # and "sameness"; no "reason-principle", "differentiation" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.6."))
        for word in ("forming principle", "substance", "intelligible", "intellect", "otherness", "sameness",
                     "self-control", "virtue", "wisdom", "eternity"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|differentiation|identity")
        ours = [s for s in flags if s.startswith("VI.6.")]
        self.assertEqual(len(ours), 72)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 150)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.6.") for n in p.get("notes", []))
        for place in ("Metaphysics A.5, 986a22-26", "Philebus (24a-25b)", "Physics III.6", "Epinomis (978b-979a)",
                      "Republic VII (529d)", "Phaedo (100d)", "On the soul III.4", "Nicomachean Ethics V.1 (1129b28-29)",
                      "Timaeus (30c-31b, 39e)", "Metaphysics M.6", "Golden Verses", "Theaetetus (198a-199b)",
                      "Metaphysics M.7", "SVF I.65", "Phaedo 74a-75a", "Phaedo (96e-97b, 101b-c)", "Categories 6",
                      "Timaeus (36e-37a)", "Republic IV (427e-434d)", "Timaeus (55d-56b)", "Timaeus (39e)",
                      "Philebus (64d-65a)", "fragment B8"):
            self.assertIn(place, notes)

    def test_milestone_e30_how_the_many_forms_came_to_be_chapters_1_to_14(self):
        import modern_enneads
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][31:], ["VI.1", "VI.2", "VI.3", "VI.4", "VI.5", "VI.6", "VI.7"])
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "VI.7"], [f"VI.7.{k}" for k in range(1, 15)])
        # VI.7 is done over E30 to E32 (the plan's milestone), so it keeps chapters_done until E32. Its @treatise block
        # summarizes the whole treatise.
        self.assertEqual(dict((x[0], x[2]) for x in modern_enneads.PLAN)["VI.7"], "E30-E32")
        t = {t["id"]: t for t in d["treatises"]}
        self.assertEqual((t["VI.7"]["chapters_done"], t["VI.7"]["chapters_all"]), (14, 42))
        self.assertEqual(t["VI.7"]["title"], "How the many forms came to be, and on the Good")
        self.assertIn("The thirty-eighth treatise in the order of writing", t["VI.7"]["summary"])
        self.assertIn("(Life 5)", t["VI.7"]["summary"])
        self.assertIn("the plain of truth", t["VI.7"]["summary"])
        self.assertIn("(chapters 37 to 42)", t["VI.7"]["summary"])
        c = {c["id"]: c for c in d["contents"]}
        self.assertEqual((c["VI.7"]["status"], c["VI.7"]["chapters_done"], c["VI.7"]["chapters_all"]), ("here", 14, 42))
        self.assertEqual(c["VI.8"]["status"], "to come")
        self.assertEqual(c["VI.8"]["milestone"], "E33")
        ch = {c["id"]: c for c in d["chapters"]}
        # MacKenna's own chapters in his vol. V (1930) are the Greek's, once their numbers are read (tools/mackenna.py).
        for cid in [f"VI.7.{k}" for k in range(1, 15)]:
            self.assertEqual([(o["n"], o["year"]) for o in ch[cid]["older"]], [(int(cid.split(".")[2]), 1930)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.7.1"]["older"]], [(1, 162)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.7.9"]["older"]], [(9, 172)])
        self.assertEqual([(o["n"], o["page"]) for o in ch["VI.7.14"]["older"]], [(14, 180)])
        para = {p["seg"]: p for p in d["paragraphs"]}
        self.assertTrue(para["VI.7.1.p1"]["greek"].startswith("Εἰς γένεσιν πέμπων ὁ θεὸς ἢ θεός τις"))
        self.assertTrue(para["VI.7.14.p3"]["greek"].endswith("διακρίνεσθαι δέ φησι τὸ ἐν τῷδε τῷ οὐρανῷ."))
        self.assertIn("he set light-bearing eyes about the face", para["VI.7.1.p1"]["modern"])
        self.assertIn("this is god's reasoning, and reasoning altogether", para["VI.7.1.p2"]["modern"])
        self.assertIn("being all together, it is all \"this\"", para["VI.7.1.p6"]["modern"])
        self.assertIn("the thing and the why of the thing are the same", para["VI.7.2.p1"]["modern"])
        self.assertIn("And why eyebrows? So that it may be all.", para["VI.7.3.p2"]["modern"])
        self.assertIn("Man, then, is rational life.", para["VI.7.4.p5"]["modern"])
        self.assertIn("as a painter too will make of this one again a still lesser man", para["VI.7.5.p2"]["modern"])
        self.assertIn("a daemon is an imitation of a god, hanging on a god, as a man on a man", para["VI.7.6.p4"]["modern"])
        self.assertIn("as the one in a dance shapes himself to the drama given him", para["VI.7.7.p2"]["modern"])
        self.assertIn("these perceptions are dim thoughts, and the thoughts there bright perceptions", para["VI.7.7.p4"]["modern"])
        self.assertIn("a power able both to stay and to go forth", para["VI.7.8.p1"]["modern"])
        self.assertIn("the thought of a horse was intellect", para["VI.7.9.p3"]["modern"])
        self.assertIn("a nail appeared, and the hooked claw", para["VI.7.9.p5"]["modern"])
        self.assertIn("For what are horns for there, for defence?", para["VI.7.10.p1"]["modern"])
        self.assertIn("earth itself, and earth first", para["VI.7.11.p4"]["modern"])
        self.assertIn("all things are filled with life and as it were boiling", para["VI.7.12.p3"]["modern"])
        self.assertIn("its wandering is in the plain of truth", para["VI.7.13.p4"]["modern"])
        self.assertIn("where it will stop at an indivisible form", para["VI.7.14.p2"]["modern"])
        self.assertIn("the true friendship is that all should be one and never be separated", para["VI.7.14.p3"]["modern"])
        flags = {s: p.get("flags", []) for s, p in para.items()}
        # MacKenna translated VI.7 himself, so the flags are his: the eyes that catch the light, the providence that holds
        # the souls to their disaster, the cut stone that suffers no hurt, "(the stars)" for the living beings of air,
        # the Meadow of Truth, "Sympathy" for friendship, and the last sentence of chapter 14 left out.
        self.assertTrue(any("light-bearing eyes" in f["why"] for f in flags["VI.7.1.p1"]))
        self.assertTrue(any("kept safe in evil" in f["why"] for f in flags["VI.7.1.p2"]))
        self.assertTrue(any("not πρόνοια" in f["why"] for f in flags["VI.7.1.p4"]))
        self.assertTrue(any("statue" in f["why"] for f in flags["VI.7.2.p1"]))
        self.assertTrue(any("beautiful" in f["why"] for f in flags["VI.7.3.p2"]))
        self.assertTrue(any("forming principle" in f["why"] for f in flags["VI.7.4.p2"]))
        self.assertTrue(any("painter" in f["why"] for f in flags["VI.7.5.p2"]))
        self.assertTrue(any("daemon" in f["why"] for f in flags["VI.7.6.p4"]))
        self.assertTrue(any("complete living being" in f["why"] for f in flags["VI.7.8.p3"]))
        self.assertTrue(any("suffer no hurt" in f["why"] for f in flags["VI.7.11.p3"]))
        self.assertTrue(any("daemons" in f["why"] for f in flags["VI.7.11.p6"]))
        self.assertTrue(any("Poverty" in f["why"] for f in flags["VI.7.12.p3"]))
        self.assertTrue(any("plain of truth" in f["why"] for f in flags["VI.7.13.p4"]))
        self.assertTrue(any("MacKenna ends here" in f["why"] for f in flags["VI.7.14.p3"]))
        whys = " ".join(f["why"] for s in flags if s.startswith("VI.7.") for f in flags[s])
        self.assertIn("MacKenna", whys)
        self.assertNotIn("Page", whys)
        # The fixed names: "forming principle" for λόγος, "substance" for οὐσία, "intelligible" for νοητός, "otherness"
        # and "sameness", "daemon", "pattern" for παράδειγμα, "the unlimited"; no "reason-principle", "essence",
        # "differentiation" or "identity" of our own.
        mod = " ".join(p["modern"] for p in d["paragraphs"] if p["chapter"].startswith("VI.7."))
        for word in ("forming principle", "substance", "intelligible", "intellect", "otherness", "sameness", "daemon",
                     "pattern", "the unlimited", "virtue", "what it was to be"):
            self.assertIn(word, mod)
        self.assertNotRegex(mod.lower(), r"reason-principle|rational principle|essence|differentiation|identity")
        ours = [s for s in flags if s.startswith("VI.7.")]
        self.assertEqual(len(ours), 59)
        self.assertGreaterEqual(sum(len(flags[s]) for s in ours), 130)
        notes = " ".join(n for p in d["paragraphs"] if p["chapter"].startswith("VI.7.") for n in p.get("notes", []))
        for place in ("Timaeus (45b)", "On the soul III.12", "Posterior Analytics II.2 (90a14-23)", "fragment B8",
                      "Phaedo (100c-e)", "Memorabilia (I.4.6)", "On the heavens I.10", "Alcibiades (129e-130c)",
                      "Metaphysics B.2 (997b8-10)", "Republic X (597e-598b)", "SVF II.1027", "Symposium (202d-203a)",
                      "Republic X (620a-d)", "Parmenides (130c-d)", "Sophist (248e-249a)", "Protagoras (320d-321c)",
                      "IV.4.27", "Epinomis (984d-985b)", "Timaeus (39e-40a)", "Symposium (203b-c)",
                      "Phaedrus (248b-c)", "Phaedrus (277b)", "fragments B17 and B26"):
            self.assertIn(place, notes)

    def test_the_life_greek_is_proofread(self):
        rows = [ln for ln in (ROOT / "sources" / "neoplatonists" / "proofread" / "porphyry-life-plotinus.txt").read_text(encoding="utf-8").splitlines()
                if ln.startswith("@page ")]
        self.assertEqual(len(rows), 34)    # pp. 3-18 (E5) and 19-36 (E6): the whole Life
        self.assertTrue(rows[0].startswith("@page ia-volkmann-t1:33 | p. 3"))
        self.assertTrue(rows[-1].startswith("@page ia-volkmann-t1:66 | p. 36"))
        if not (ROOT / "sources" / "neoplatonists" / "ocr" / "ia-volkmann-t1.json.gz").exists():
            self.skipTest("no OCR copy")
        import neoplatonists
        import proofread
        corrs, problems = proofread.build("porphyry-life-plotinus")
        self.assertEqual(problems, [])
        d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
        self.assertEqual([c for c in d["corrections"] if c.get("proofread") and c["text"] == "porphyry-life-plotinus"], corrs,
                         "run python3 tools/proofread.py")
        self.assertGreater(len(corrs), 700)
        self.assertTrue(all("Volkmann's" in c["why"] for c in corrs if not c["why"].startswith("Supplied")))

    def test_flags_quote_macKenna_word_for_word(self):
        d = load()
        older = mackenna.chapters()
        # MacKenna's chapters shown with each chapter (in I.8 his numbers are not Volkmann's).
        shown = {c["id"]: " ".join(older[f"{c['treatise']}.{o['n']}"]["text"] for o in c["older"]) for c in d["chapters"]}
        flags = [(p, f) for p in d["paragraphs"] for f in p.get("flags", [])]
        self.assertGreaterEqual(len(flags), 10)
        for p, f in flags:
            self.assertIn(modern_neo.norm(f["taylor"]), shown[p["chapter"]], p["seg"])
            self.assertEqual(f["in"], "MacKenna")
            self.assertTrue(f["why"])
        # MacKenna puts the soul that weaves in Plato; it is Aristotle's (On the Soul 408b).
        weave = next(f for p, f in flags if "the Soul weaves" in f["taylor"])
        self.assertIn("Aristotle", weave["why"])

    def test_notes_name_the_places_plotinus_uses(self):
        notes = " ".join(n for p in load()["paragraphs"] for n in p.get("notes", []))
        for place in ("408b11-15", "412b12", "588c-590b", "35a", "611c-612a", "Odyssey",
                      "1100a5-9", "505a", "77e", "176a-b", "37d", "1153a14-15",
                      "69b-c", "211a-e", "254b", "508b", "1129b28-29", "Iliad (2.140", "1094a2-3",
                      "176a-b", "312e", "258b", "47e-48a", "273d", "534c-d", "246b-c", "Oedipus at Colonus", "61c-62c"):
            self.assertIn(place, notes)

    def test_the_tool_finds_no_problems(self):
        if not has_greek():
            self.skipTest("run python3 tools/fetch_sources.py first")
        d, problems = modern_enneads.build()
        self.assertEqual(problems, [])
        self.assertEqual(json.loads(json.dumps(d, ensure_ascii=False)), load())


@unittest.skipUnless(has_greek(), "run python3 tools/fetch_sources.py first")
class AgainstTheGreek(unittest.TestCase):
    def test_the_paragraphs_hold_all_the_greek_of_each_chapter(self):
        units = {**modern_neo.greek_units("plotinus-enneads"), **modern_enneads.life_units()}
        d = load()
        for c in d["chapters"]:
            joined = " ".join(p["greek"] for p in d["paragraphs"] if p["chapter"] == c["id"])
            self.assertEqual(joined.replace(" ", ""), modern_neo.norm(units[c["id"]]["text"]).replace(" ", ""), c["id"])
            self.assertEqual((c["greek_unit"], c["greek_part"]), (units[c["id"]]["n"], units[c["id"]]["part"]))

    def test_a_wrong_greek_start_flag_or_order_is_caught(self):
        src = (MOD / "enneads.txt").read_text(encoding="utf-8")
        bad = (src.replace("@greek πῶς οὖν κοινὰ ταῦτα", "@greek πῶς οὖν ἴδια ταῦτα")
               .replace("!flag they are its repugnances, desires, sympathies", "!flag they are its repugnances, wishes, sympathies"))
        taylor = modern_enneads.taylor_treatises()     # read from the real plotinus.txt
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, "enneads.txt").write_text(bad, encoding="utf-8")
            old = modern_enneads.MODERN
            modern_enneads.MODERN = Path(tmp)
            try:
                _, problems = modern_enneads.build(taylor_done=taylor)
            finally:
                modern_enneads.MODERN = old
        self.assertTrue(any("Greek start not found" in x for x in problems), problems)
        self.assertTrue(any("flagged words not in MacKenna" in x for x in problems), problems)

    def test_one_of_taylors_treatises_is_refused(self):
        src = (MOD / "enneads.txt").read_text(encoding="utf-8").replace("@treatise I.1 |", "@treatise I.2 |")
        taylor = modern_enneads.taylor_treatises()
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, "enneads.txt").write_text(src, encoding="utf-8")
            old = modern_enneads.MODERN
            modern_enneads.MODERN = Path(tmp)
            try:
                _, problems = modern_enneads.build(taylor_done=taylor)
            finally:
                modern_enneads.MODERN = old
        self.assertTrue(any("one of Taylor's treatises" in x for x in problems), problems)


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

    def test_the_modern_english_with_the_greek_and_taylors_parts(self):
        d = self.get("modern-neo/enneads")
        self.assertEqual(d["kind"], "enneads")
        self.assertEqual(d["marks"], [])
        self.assertEqual(d["greek_info"]["id"], "plotinus-enneads")
        parts = {c["id"]: c.get("taylor_part") for c in d["contents"] if c["status"] == "taylor"}
        self.assertEqual((parts["I.2"], parts["I.3"], parts["VI.9"]), (0, 1, 14))

    def test_the_shelf_and_the_greek_link_to_it(self):
        t = next(t for t in self.get("neo")["texts"] if t["id"] == "plotinus-enneads")
        self.assertEqual((t["modern"]["kind"], t["modern"]["text"], t["modern"]["beside_taylor"]), ("enneads", "enneads", 15))
        self.assertEqual([x["id"] for x in t["modern"]["treatises"]][:2], ["Life", "I.1"])
        units = self.get("neo/plotinus-enneads/0")["units"]
        self.assertTrue(units and all(u.get("modern_enneads", {}).get("id") == u["label"] for u in units if u["label"].startswith("I.1.")))
        # Taylor's treatises keep their own link, to his English with the modern beside it.
        units = self.get("neo/plotinus-enneads/1")["units"]
        self.assertTrue(all(u.get("modern") and not u.get("modern_enneads") for u in units if u["label"].startswith("I.2.")))

    def test_the_life_on_the_shelf_links_to_it(self):
        # Milestone E5: Porphyry's Life, proofread from Volkmann's scan, and its pages, link to the modern English.
        t = next(t for t in self.get("neo")["texts"] if t["id"] == "porphyry-life-plotinus")
        self.assertEqual((t["modern"]["text"], t["modern"]["first"], t["modern"]["pages"]), ("enneads", "Life.1", 34))
        self.assertEqual([x["id"] for x in t["modern"]["treatises"]], ["Life"])
        units = self.get("neo/porphyry-life-plotinus/0")["units"]
        on = {u["label"]: u.get("modern_section", {}).get("id") for u in units}
        self.assertEqual((on.get("p. 3"), on.get("p. 5")), ("Life.1", "Life.2"))


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
                r = subprocess.run(["node", str(ROOT / "tests" / "modern_enneads_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
