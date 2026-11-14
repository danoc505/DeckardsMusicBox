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
        self.assertEqual([t["id"] for t in self.d["treatises"]], [f"I.{n}" for n in range(1, 10)])
        self.assertEqual(self.d["treatises"][0]["title"], "The Animate and the Man")
        self.assertEqual(self.d["treatises"][8]["title"], "The Reasoned Dismissal")
        self.assertEqual([len(t["chapters"]) for t in self.d["treatises"]], [13, 7, 6, 16, 10, 9, 3, 12, 1])
        self.assertEqual((self.d["translator"], self.d["year"]), ("Stephen MacKenna", 1917))

    def test_running_heads_and_page_numbers_are_taken_out(self):
        text = " ".join(p for t in self.d["treatises"] for c in t["chapters"] for p in c["paras"])
        self.assertNotIn("PLOTINUS", text)
        self.assertNotIn("THE ANIMATE AND THE MAN", text)
        self.assertNotRegex(text, r"\] [A-Z]{4,}")
        ch = self.d["treatises"][0]["chapters"]
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
                self.assertRegex(p, r"[.?!:;\"')—\]]$", c["id"])

    def test_chapters_open_with_macKennas_words(self):
        ch = {c["id"]: c for t in self.d["treatises"] for c in t["chapters"]}
        self.assertTrue(ch["I.1.1"]["paras"][0].startswith("Pleasure and distress, fear and courage"))
        self.assertTrue(ch["I.1.13"]["paras"][0].startswith("And the principle that reasons out these matters"))
        self.assertTrue(ch["I.9.1"]["paras"][0].startswith('" You will not dismiss your Soul'))


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
        self.assertEqual(len(ids), 54)
        self.assertEqual(ids[:3], ["I.1", "I.2", "I.3"])
        self.assertEqual(ids[-1], "VI.9")
        self.assertEqual([sum(1 for i in ids if i.split(".")[0] == e) for e in ["I", "II", "III", "IV", "V", "VI"]], [9] * 6)
        taylor = [c["id"] for c in d["contents"] if c["status"] == "taylor"]
        self.assertEqual(sorted(taylor), sorted(modern_enneads.taylor_treatises()))
        self.assertEqual(len(taylor), 15)
        here = [c["id"] for c in d["contents"] if c["status"] == "here"]
        self.assertEqual(here, [t["id"] for t in d["treatises"]])
        for c in d["contents"]:
            if c["status"] == "to come":
                self.assertRegex(c["milestone"], r"^E\d+(-E\d+)?$", c["id"])

    def test_milestone_e1_the_first_treatise(self):
        d = load()
        self.assertEqual(d["treatises"][0]["id"], "I.1")
        self.assertEqual([c["id"] for c in d["chapters"] if c["treatise"] == "I.1"], [f"I.1.{n}" for n in range(1, 14)])
        for c in d["chapters"]:
            self.assertTrue(c["title"] and c["summary"], c["id"])
            self.assertTrue(c["older"], f"{c['id']}: MacKenna's chapter is shown with it")
            self.assertEqual(c["older"][0]["year"], 1917)
        first = d["paragraphs"][0]
        self.assertTrue(first["modern"].startswith("Pleasures and pains, fears and boldness"))
        self.assertTrue(first["greek"].startswith("Ἡδοναὶ καὶ λῦπαι"))

    def test_milestone_e2_on_happiness_and_time(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"]][:3], ["I.1", "I.4", "I.5"])
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
        self.assertEqual([t["id"] for t in d["treatises"]][:5], ["I.1", "I.4", "I.5", "I.6", "I.7"])
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
        self.assertEqual([t["id"] for t in d["treatises"]][:7], ["I.1", "I.4", "I.5", "I.6", "I.7", "I.8", "I.9"])
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
        units = modern_neo.greek_units("plotinus-enneads")
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
        self.assertEqual(t["modern"]["treatises"][0]["id"], "I.1")
        units = self.get("neo/plotinus-enneads/0")["units"]
        self.assertTrue(units and all(u.get("modern_enneads", {}).get("id") == u["label"] for u in units if u["label"].startswith("I.1.")))
        # Taylor's treatises keep their own link, to his English with the modern beside it.
        units = self.get("neo/plotinus-enneads/1")["units"]
        self.assertTrue(all(u.get("modern") and not u.get("modern_enneads") for u in units if u["label"].startswith("I.2.")))


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
