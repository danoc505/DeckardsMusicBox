"""Tests for milestone 3: dictionaries, LSJ's abbreviations, and grammar notes.

    python3 -m unittest discover -s tests -v

These run on small hand-made pieces of TEI shaped like the real files, so
they need no downloads. The tests on the real sources are in test_reader.py,
which builds the library once for both milestones.
"""
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import grammar  # noqa: E402
import lexicon  # noqa: E402

FRONT = """<front>
<div1 n="1" type="frontmatter"><head>I. Authors and Works</head><p><list type="simple">
<item><hi rend="bold">Herodotus</hi> Historicus [Hdt.] <date>v B.C.</date> Ed. C. Hude, Oxford (OCT).</item>
<item><hi rend="bold">Novum Testamentum</hi>
   </item><item><title>Ev.Matt. = Evangelium secundum Matthaeum</title></item>
<item><hi rend="bold">Plato</hi> Philosophus [Pl.] <date>v/iv B.C.</date>
   Ed. J. Burnet, Oxford (OCT).
      </item><item><title>Hp.Ma., Mi. = Hippias Major, Minor</title>
      </item><item><title>Ion</title>
      </item><item><title>Ti. = Timaeus</title></item>
</list></p></div1>
<div1 n="2"><head>II.</head><list><item><title>IG = Inscriptiones Graecae,</title> Berlin 1873-.</item></list></div1>
<div1 n="3"><head>III.</head><list><item><title>POxy. = Oxyrhynchus Papyri,</title> London 1898-.</item></list></div1>
<div1 n="4"><head>IV.</head><list><item><title>AJP = American Journal of Philology,</title> 1880-.</item></list></div1>
<div1 n="5" type="frontmatter"><head>V. General List of Abbreviations</head><p><list type="simple">
<item>acc. = accusative</item>
<item>Adv., Advbs. = Adverb, Adverbs</item>
<item>c. gen. pers., etc. = cum genitivo
   personae, etc.</item>
<item>Ep. = Epice, in the Epic dialect</item>
<item>Ep. = Epistula</item>
<item>gen. <title>or</title> genit. = genitive</item>
<item>metaph. = metaphorically, metaphorical</item>
<item>Id. = Idem</item>
</list></p></div1>
</front>"""

ENTRY = """<entryFree key="dhmiourgo/s" id="n1" type="main"><orth extent="full" lang="greek">dhmiourgo/s</orth>,
<gen lang="greek">o(</gen>, <sense n="A" level="1"><tr>skilled workman</tr>, c. gen.,
<bibl n="urn:cts:greekLit:tlg0059.tlg031.perseus-grc1:29e"><author>Pl.</author> <title>Ti.</title> <biblScope>29e</biblScope></bibl>,
<bibl n="urn:cts:greekLit:tlg0059.tlg031:41a"><biblScope>41a</biblScope></bibl>; metaph., <foreign lang="greek">peiqou=s</foreign>
<bibl n="urn:cts:greekLit:tlg0016.tlg001:7:31"><author>Hdt.</author> <biblScope>7.31</biblScope></bibl>;
v. <xr><lbl>v.</lbl> <ref lang="greek">e)/rgon</ref></xr> <gram type="dialect">Ep.</gram></sense></entryFree>"""


class Abbreviations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ab = lexicon.abbreviations(ET.fromstring(FRONT))

    def test_authors_and_their_works(self):
        pl = self.ab["authors"]["Pl."]
        self.assertEqual((pl["name"], pl["epithet"], pl["date"]), ("Plato", "Philosophus", "v/iv B.C."))
        self.assertEqual(pl["works"]["Ti."], "Timaeus")
        self.assertEqual(pl["works"]["Hp.Mi."], "Hippias Minor")  # 'Hp.Ma., Mi.'
        self.assertEqual(pl["works"]["Ion"], "Ion")               # printed in full
        self.assertEqual(self.ab["unabbreviated"]["Novum Testamentum"]["works"]["Ev.Matt."], "Evangelium secundum Matthaeum")

    def test_general_list(self):
        g = self.ab["general"]
        self.assertEqual(g["acc."], "accusative")
        self.assertEqual((g["Adv."], g["Advbs."]), ("Adverb", "Adverbs"))
        self.assertEqual(g["c. gen. pers."], "cum genitivo personae")   # ', etc.' on both sides
        self.assertEqual(g["genit."], "genitive")                       # 'gen. or genit.'
        self.assertEqual(g["Ep."], "Epice, in the Epic dialect; or Epistula")  # both meanings kept
        self.assertEqual(g["c."], "cum")                                 # one word of the printed phrase
        self.assertIn("c.", self.ab["derived"])

    def test_publications(self):
        self.assertEqual(self.ab["publications"]["IG"][0], "II")
        self.assertEqual(self.ab["publications"]["POxy."][0], "III")


class Rendering(unittest.TestCase):
    def setUp(self):
        self.r = lexicon.Renderer("lsj", lexicon.abbreviations(ET.fromstring(FRONT)))
        self.html = self.r.render(ET.fromstring(ENTRY))

    def test_greek_letters(self):
        self.assertIn('<b class="hw" lang="grc">δημιουργός</b>', self.html)
        self.assertIn("πειθοῦς", self.html)

    def test_author_and_title_expanded_from_list_one(self):
        self.assertIn('data-x="Plato" data-d="Philosophus, v/iv B.C."', self.html)
        self.assertIn('data-x="Timaeus"', self.html)
        self.assertIn('data-x="Herodotus"', self.html)

    def test_general_abbreviations_in_running_text(self):
        self.assertIn('data-x="metaphorically, metaphorical"', self.html)
        self.assertIn('data-x="cum"', self.html)
        self.assertIn('data-x="genitive"', self.html)

    def test_ambiguous_abbreviation_is_marked(self):
        self.assertIn('class="ab gen amb"', self.html)

    def test_plato_citations_carry_work_and_reference(self):
        self.assertIn('data-work="tlg031" data-ref="29e"', self.html)
        self.assertIn('data-work="tlg031" data-ref="41a"', self.html)

    def test_cross_reference(self):
        self.assertIn('data-lemma="ἔργον"', self.html)

    def test_no_raw_markup_leaks(self):
        self.assertNotIn("<script", self.html)
        self.assertNotIn("TEIform", self.html)


class Keys(unittest.TestCase):
    def test_keys(self):
        self.assertEqual(lexicon.entry_key("a)/n1"), "a)/n")
        self.assertEqual(lexicon.entry_key("yu_xh/"), "yuxh/")
        self.assertEqual(lexicon.lemma_keys("Ἀθηναῖος"), ["*)aqhnai=os", "a)qhnai=os"])
        self.assertEqual(lexicon.unaccented_key("ei(/s"), lexicon.unaccented_key("ei(=s"))
        self.assertNotEqual(lexicon.unaccented_key("ei)s"), lexicon.unaccented_key("ei(=s"))
        self.assertEqual(lexicon.accentless_key("ei)s"), lexicon.accentless_key("ei(=s"))


class Grammar(unittest.TestCase):
    def test_smyth_sections_rule_and_full(self):
        xml = """<TEI.2><text><body><div1><head>AORIST INDICATIVE</head>
          <milestone unit="smythp" id="s1923" n="1923" /><p>The aorist expresses the mere occurrence of an action in the past.
          <foreign lang="greek">e)ni/khsan</foreign> <gloss>they won</gloss> (<ref target="s1924">1924</ref>).</p>
          <p><emph rend="bold">a.</emph> A note.</p>
          <milestone unit="smythp" id="s1924" n="1924" /><p>Next.</p></div1></body></text></TEI.2>"""
        with tempfile.NamedTemporaryFile("w", suffix=".xml", delete=False, encoding="utf-8") as f:
            f.write(xml)
        secs = grammar.smyth_sections(f.name, {"1923"})
        Path(f.name).unlink()
        s = secs["1923"]
        self.assertEqual(s["heading"], "AORIST INDICATIVE")
        self.assertIn("mere occurrence", s["rule_html"])
        self.assertIn('<span lang="grc">ἐνίκησαν</span>', s["rule_html"])
        self.assertIn("smythp=1924", s["rule_html"])
        self.assertNotIn("A note", s["rule_html"])
        self.assertIn("A note", s["full_html"])
        self.assertNotIn("Next", s["full_html"])

    def test_agdt_labels(self):
        md = """<h4>3.2 SBJ</h4>
<p>The SBJ ("subject") label is attached to every subject (SG <a href="x">927</a>) in a sentence (<a href="t">tree1</a>).</p>
<h4>3.20 Suffixes</h4><p>Each syntactic label can be specified by a suffix.</p>
<h3>4</h3>"""
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
            f.write(md)
        labels = grammar.agdt_labels(f.name)
        Path(f.name).unlink()
        self.assertEqual(labels["SBJ"]["name"], "subject")
        self.assertEqual(labels["SBJ"]["definition"], 'The SBJ ("subject") label is attached to every subject (SG 927) in a sentence.')

    def test_section_map_is_well_formed(self):
        m = grammar.section_map()["sections"]
        self.assertEqual(m["tense"]["aorist"][0][0], "1923")
        for cat in m.values():
            for secs in cat.values():
                for n, reason in secs:
                    self.assertRegex(n, r"^\d+$")
                    self.assertTrue(reason)


if __name__ == "__main__":
    unittest.main()
