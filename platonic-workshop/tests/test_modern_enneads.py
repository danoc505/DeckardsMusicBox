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
            # MacKenna's vol. I (1917) for the Life and Ennead I, vol. II (1921) for Enneads II and III (E7 onward).
            self.assertEqual(c["older"][0]["year"], 1921 if c["treatise"].startswith(("II.", "III.")) else 1917)
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
        self.assertEqual([t["id"] for t in d["treatises"] if t["id"] != "Life"][15:], ["III.2", "III.3", "III.4"])
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
