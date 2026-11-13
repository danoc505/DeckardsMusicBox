// Platonic Workshop: Aristotle (Aristotle milestone A1), on his own shelf beside Plato.
// The works open in the same reader as the dialogues (reader.js): Ross's and Bywater's Greek with every word
// tapped for GLAUx's dictionary form and grammar, the Loeb English beside it, and the older translations
// (Ross 1908, Taylor 1801, Chase 1847) beside that, at Bekker's pages and columns (980a). Here: the shelf in
// the Library, the works in the picker, the head of a work, its contents column, and Aristotle's part of a term.
// Loaded after reader.js, search.js, terms.js and nt.js; shares their globals.
"use strict";

// The works in the Platonists' order of reading (AR_ORDER, below): logic, ethics, politics, physics, theology.
const arRank = (id) => { const i = AR_ORDER.flatMap((g) => g.works.map(([wid]) => wid)).indexOf(id); return i < 0 ? 99 : i; };
const arWorks = () => state.works.filter((w) => w.imported && isAR(w)).sort((a, b) => arRank(a.id) - arRank(b.id));
// Works whose Greek (Bekker's own text, in his Oxford reprint of 1837) does not print the Berlin columns: carried over from
// the Oxford translation's margin, chapter by chapter (tools/aristotle_organon.py).
const AR_CARRIED = new Set(["ar006", "ar017", "ar044", "ar040"]);
// Aristotle milestone A8d: the same Greek of the Parva Naturalia, its columns carried over word by word from the margin of Biehl's Greek
// (tools/aristotle_biehl.py); and of the History of Animals, from the margin of Thompson's Oxford translation, chapter by chapter.
const AR_CARRIED_BIEHL = new Set(["ar041", "ar024", "ar042", "ar016", "ar008", "ar020", "ar018", "ar037"]);
const AR_CARRIED_THOMPSON = new Set(["ar014"]);

const AR_ABOUT = `Aristotle studied in Plato's Academy for twenty years. The later Platonists put his works first in their
  course of reading, as the way up to Plato's, and Thomas Taylor translated all of them (1806–1812) with notes from the Greek
  commentators. Where Aristotle argues against the Forms, Taylor answers from Syrianus and Proclus: "Perhaps his design in this
  opposition was to lead the reader into all the mysteries of this doctrine" (Taylor, Introduction to the Metaphysics, 1801).`;

const AR_PLAIN = {
  ar006: "The ten kinds of thing that can be said: substance, quantity, quality, relation, place, time, position, state, action, affection; the primary substance, the individual man or horse, and the secondary, his species and genus.",
  ar017: "Words as symbols of thoughts, and thoughts as likenesses of things; the noun, the verb and the sentence; affirmation and denial, and whether there will be a sea-fight tomorrow (chapter 9).",
  ar001: "The syllogism: from two premisses something other than them follows of necessity; its three figures, necessary and possible premisses, and how syllogisms are found and reduced.",
  ar001p: "Demonstration: knowledge through causes from first principles that are true, primary and immediate; definition; and in the last chapter how the first principles are known by intellect (νοῦς).",
  ar044: "Dialectic: reasoning from reputable opinions; the four predicables (definition, property, genus, accident) and the places from which arguments about each are drawn.",
  ar040: "The fallacies of the sophists, those that depend on language and those that do not, and how each is solved.",
  ar025: "First philosophy: being as being, substance, actuality, and the unmoved mover, the intellect that thinks itself (Book Λ). Books Α, Μ and Ν argue against Plato's Forms and numbers; Taylor answers from Syrianus.",
  ar031: "Nature, the four causes, chance, motion, the infinite, place, the void and time; the eternal motion of the heavens, and the first mover, without parts or magnitude (Book VIII).",
  ar005: "The heavens: the fifth body that moves in a circle, ungenerated and eternal; the earth at the centre; the four elements and their weight and lightness.",
  ar002: "The soul as the first actuality of a natural body that has life: nutrition, sensation, imagination, and the intellect that makes all things, separable, impassive and unmixed (Book III, 5).",
  ar010: "The good for man, the virtues of character and of intellect, friendship, pleasure, and the life of contemplation as the most divine (Book X).",
  ar009: "The other Ethics: happiness, the virtues of character, the voluntary, friendship, and in the end the measure of every choice, the contemplation and service of God (Book VIII 3).",
  ar035: "The city, prior by nature to the household and the man; household rule and slavery; the constitutions, their kinds and changes; and the best city and the education of its citizens. Book II argues against Plato's Republic and Laws.",
  ar029: "The management of the household: husband and wife, slaves, and property; and in Book II the finances of kings and cities.",
  ar038: "Rhetoric, the counterpart of dialectic: the three kinds of oratory, proof by character, emotion and argument; the emotions one by one (Book II); style and the arrangement of a speech (Book III).",
  ar034: "Poetry as imitation; tragedy, its plot, character and the purgation (κάθαρσις) of pity and fear; and epic. An answer, in part, to Plato's banishing of the poets from the Republic.",
  ar022: "A shorter course of the ethics in two books, under Aristotle's name since antiquity: happiness, the virtues of character and of intellect, self-control, pleasure and friendship; whether it is his own or his school's is disputed.",
  ar013: "Coming to be and passing away, distinguished from alteration and growth; contact, action and passion, mixture; the four elements from the hot, cold, wet and dry, and their change into one another; the cycle of generation kept going by the sun's motion along the ecliptic (Book II 10).",
  ar026: "What happens in the region below the moon: shooting stars, comets and the Milky Way; rain, snow and dew; rivers and the sea, and why it is salt; winds, earthquakes, thunder, rainbows; and in Book IV the hot and the cold working on the homoeomerous bodies.",
  ar030: "The method of the study of nature: the final cause before the necessary, and the dignity of studying even the humblest animals, since in all of them there is something natural and beautiful (Book I 5); then the parts of animals, uniform and non-uniform, and what each is for.",
  ar015: "Why animals move as they do: the three dimensions of up and down, front and back, right and left, and why animals with blood walk on no more than four points; nature does nothing in vain.",
  ar021: "The common cause of animal motion: an unmoved point within the animal and an unmoved mover outside, as the first mover of the heaven (chapters 1-4); desire and thought as the movers of the animal, and the practical syllogism.",
  ar012: "How animals are generated: the male gives the form and the source of motion, the female the matter; the soul's powers in the embryo, and the intellect alone entering from outside (θύραθεν) as divine (Book II 3); then inheritance, and why offspring take after one parent or the other.",
  ar014: "The facts about animals before their causes: their parts, outward and inward, their ways of breeding, their lives and characters, from man to the sponge; Book X, on barrenness, is thought not to be Aristotle's.",
  ar041: "The first of the short treatises on what is common to soul and body: the five senses and their organs, colour, flavour and odour, and whether two things can be perceived at once by one sense.",
  ar024: "Memory is of the past and belongs to the part of the soul that imagines; no one thinks without an image; recollection, a search through a chain of movements, belongs to man alone.",
  ar042: "Sleep and waking as affections of the primary sense-organ; sleep is for the sake of waking, and is caused by the evaporation that rises from food and cools in the head.",
  ar016: "The dream belongs to the imagination, not to sense or opinion: the movements left by perceptions go on in sleep, and appear when the greater movements of waking are stilled.",
  ar008: "Whether dreams foretell: some are causes or signs of what follows, most are coincidences; they are not sent by God, since they come to ordinary men and to animals.",
  ar020: "Why some living things live longer than others: the long-lived are warm and moist, and the moist must not be easily dried.",
  ar018: "The nutritive soul has its seat in the heart, the source of natural heat; life is the keeping of that heat, and death its failing or its quenching.",
  ar037: "The earlier accounts of breathing (Anaxagoras, Diogenes, Democritus, Plato's Timaeus) examined; breathing, and the gills of fishes, are for cooling the heat about the heart.",
  ar023: "Mechanical problems: why a small force moves a great weight with the lever, traced to the circle, in which contraries meet; then the balance, the oar, the rudder, the wedge and the pulley. From Aristotle's school.",
  ar019: "Against the doctrine of the Academy that there are indivisible lines: its arguments set out and answered one by one from mathematics. From Aristotle's school.",
  ar047: "Three arguments about being set out and examined: Melissus' that what is is one, ungenerated and unmoved; Xenophanes' on God; and Gorgias' that nothing is, or if it is cannot be known, or if known cannot be told. Bekker titles it On Xenophanes, Zeno and Gorgias. From Aristotle's school.",
  ar007: "The simple colours of the elements, and the others as mixtures of them, of light and shade; the colours of plants, fruit, hair and feathers, and how they change as they grow. From Aristotle's school.",
  ar004: "How voices and sounds arise from the blows of the breath on the air, and why they differ, clear or muffled, rough or smooth, in men, animals and instruments. An extract from a work of Aristotle's school.",
  ar032: "How character is read from the body, since soul and body are affected together: from a man's likeness to an animal, from his people, and from the looks that go with each passion. From Aristotle's school.",
  ar039: "Whether plants have soul, desire and sensation; then their parts, their kinds, and how they grow, flower and bear fruit. Not Aristotle's: the treatise of Nicolaus of Damascus, come back into Greek from Latin, by way of Arabic.",
  ar027: "A collection of wonders, strange animals, springs, metals and peoples, from the far West to India, gathered from many writers in Aristotle's school and after it.",
  ar036: "Questions asked and answered under thirty-eight heads, medicine, sweat, wine, the voice, music, mathematics, justice and wisdom among them; gathered in Aristotle's school over many generations. Book XXX 1 asks why all who have been outstanding in philosophy, politics, poetry or the arts are melancholic.",
  ar046: "The winds, by the quarters of the sky they blow from, with the names each people gives them. A short extract under Aristotle's name.",
  ar043: "How the breath (πνεῦμα) inborn in animals is kept up and fed, and how it bears on breathing, the pulse and digestion; many questions are raised and left open. From Aristotle's school.",
  ar054: "Book VII of the Physics as some manuscripts give it, in a version that differs throughout from the common text, printed by Ross beside it: everything moved is moved by something, and there must be a first mover.",
  ar045: "The virtues and vices of each part of the soul, taken as three after Plato (reason, spirit, desire), each defined with what goes with it and follows from it. From Aristotle's school.",
  ar003: "The history of Athens' constitution in eleven changes, from the kings and Draco through Solon, Pisistratus, Cleisthenes and the democracy to the restoration of 403 (chapters 1-41); then the constitution of Aristotle's own day, its citizens, council, magistrates and law courts (42-69). Found on a papyrus in 1890; Aristotle's or his school's.",
  ar011: "Six short letters under Aristotle's name, to Philip, Alexander and Theophrastus, on kindness and the use of rule; the last, to Alexander, says his lectures are published and not published, for only his hearers understand them. Thought not to be his.",
  ar048: "Divisions of the goods, friendship, constitutions, justice, the sciences, medicine, law, speech and more, each into its kinds, of the kind Plato practised in the Academy; Diogenes Laertius gives them as Aristotle's account of Plato's divisions. Two texts of them, Diogenes' and a manuscript's, side by side.",
  ar052: "Passages of Book II of On the Soul (on nutrition, and on the senses) as one manuscript (E) gives them, in a version that differs from the common text; printed by Ross. The passages are not continuous, so only the columns they fall in are here.",
};
// Works in Greek only (Aristotle milestone A8c): no English is in the Workshop yet. Where the margin of the edition has lost a
// Bekker column, it is placed by length between the columns read either side (tools/aristotle_f1k.fill_gaps); listed here.
const AR_GREEK_ONLY = new Set(["ar022", "ar013", "ar026", "ar030", "ar015", "ar021", "ar012",
  "ar041", "ar024", "ar042", "ar016", "ar008", "ar020", "ar018", "ar037",
  "ar023", "ar019", "ar047", "ar007", "ar004", "ar032", "ar039", "ar027", "ar036", "ar046", "ar043", "ar054", "ar052",
  "ar045", "ar011", "ar048"]);
// Aristotle milestone A8e: the minor works GLAUx has not tagged. Their words carry Morpheus's possible parses only, not one chosen by machine.
const AR_NO_GLAUX = new Set(["ar004", "ar019", "ar046"]);
const AR_BY_LENGTH = {
  ar022: ["1183a", "1187a", "1193b", "1197b", "1199b", "1203a", "1210a"],
  ar013: ["319b", "323a", "327b", "329a", "333a", "336b"],
  ar026: ["360b", "364b", "370b", "389b", "390a"],
  ar030: ["692a", "692b", "693a", "693b", "694a", "694b", "695a"],
  ar021: ["703a"],
  ar041: ["437a", "437b", "438b", "439b", "441a", "441b", "443b", "444a", "444b", "445b", "447b", "449b"],
  ar024: ["451b", "453b"],
  ar042: ["454a", "455a", "456a"],
  ar016: ["459b"],
  ar008: ["463a", "464b"],
  ar020: ["465a", "465b"],
  ar018: ["468b"],
  ar043: ["486a", "486b"],
  ar037: ["471b", "474b", "475b", "477a", "477b", "478b", "479b"],
  ar014: ["522b", "604b", "607b", "608a", "614b", "634a", "634b", "635a", "635b", "636a", "636b", "637a", "637b", "638a", "638b"],
};

// Aristotle milestone A8f: the works not on Bekker's pages (he did not print them), each cited by its own numbers
// (tools/aristotle_cited.py). A section is "chapter:number", as the New Testament's chapter and verse, and a page is the chapter:
// the Constitution of the Athenians by chapter and section (42:1 is 42.1); the Letters by letter (3:1 is the third letter,
// whole); the Divisions by Mutschmann's numbers in his two texts, Diogenes Laertius' (page 1) and the codex Marcianus' (page 2).
const AR_CITED = {
  ar003: { scheme: "chapter", page: (n) => `chapter ${n}`, ref: (a, b) => `${a}.${b}`,
    about: "Cited by chapter and section, as every edition numbers them: 42.1 is chapter 42, section 1. Bekker's edition of Aristotle (1831) has no Bekker numbers for it: the papyrus it is known from was found in 1890." },
  ar011: { scheme: "letter", page: (n) => `letter ${n}`, ref: (a) => `Letter ${a}`,
    about: "Cited by letter, as Hercher numbers them (Epistolographi Graeci, 1873). They are not in Bekker's edition, so have no Bekker numbers." },
  ar048: { scheme: "division", page: (n) => (n === 1 ? "Diogenes' text" : "the Marcianus' text"), ref: (a, b) => `${a === 1 ? "Diogenes" : "Marcianus"} ${b}`,
    about: "Mutschmann (1906) prints two texts of the Divisions side by side and numbers the divisions of each: Diogenes Laertius' (Lives III 80-109), on the first page here, and the codex Marcianus', on the second. They are cited by his numbers: Diogenes 5, Marcianus 58. They are not in Bekker's edition, so have no Bekker numbers." },
};
const arCited = (w) => (w && AR_CITED[w.id]) || null;
const arSplit = (ref) => String(ref).split(":").map(Number);
function arRefLabel(w, ref) { const c = arCited(w); const [a, b] = arSplit(ref); return c ? c.ref(a, b) : ref; }
function arPageName(w, n) { const c = arCited(w); const s = c ? c.page(+n) : `page ${n}`; return s.charAt(0).toUpperCase() + s.slice(1); }
function arRefTitle(w, ref) {
  const c = arCited(w);
  const [a, b] = arSplit(ref);
  const what = c.scheme === "chapter" ? `chapter ${a}, section ${b}` : c.scheme === "letter" ? `letter ${a}, whole` : `division ${b} of ${a === 1 ? "Diogenes Laertius'" : "the codex Marcianus'"} text, in Mutschmann's numbering`;
  return `${w.title} ${arRefLabel(w, ref)}: ${what}`;
}
// The head of a page of such a work.
function arCitedHead(w, d) {
  const refs = d.sections.map((s) => s.ref);
  const first = arRefLabel(w, refs[0]), last = arRefLabel(w, refs[refs.length - 1]);
  const c = arCited(w);
  const where = c.scheme === "chapter" ? `<span class="term" title="${esc(c.about)}">Chapter</span> ${d.page}, sections ${esc(first)}–${esc(last)}`
    : c.scheme === "letter" ? `<span class="term" title="${esc(c.about)}">Letter</span> ${d.page} · <span lang="grc">${esc(arWhere(w, refs[0]).split(": ").slice(1).join(": "))}</span>`
    : `<span class="term" title="${esc(c.about)}">${d.page === 1 ? "Diogenes Laertius' text" : "The codex Marcianus' text"}</span>, divisions ${esc(refs[0].split(":")[1])}–${esc(refs[refs.length - 1].split(":")[1])}`;
  return where;
}
// The contents column's list of pages for such a work.
function arCitedPages(w, pages) {
  const c = arCited(w);
  if (c.scheme === "division") return "";      // the two texts head their lists of divisions (renderTocAR)
  return `<h3 title="${esc(c.about)}">${c.scheme === "chapter" ? "Chapters" : "Letters"}</h3><div class="pages">${pages.map((p) =>
    `<a href="${placeHash(WORK, String(p))}" class="${p === state.page ? "here" : ""}">${p}</a>`).join("")}</div>`;
}

function arSources() {
  return `<p class="prov">Greek: Ross's Metaphysics (Oxford, 1924) and Bywater's Nicomachean Ethics (Oxford, 1894), as the Perseus Digital Library
    encodes them (CC BY-SA 4.0), with Bekker's pages and columns. Every word's dictionary form and grammar: the GLAUx corpus (Keersmaekers, 2021;
    CC BY-SA 4.0), tagged by machine. English: the Loeb translations of the same Perseus files (Tredennick, 1933–35; Rackham, 1926), at Bekker's
    columns; W. D. Ross's Oxford translation (1908) and Thomas Taylor's (1801) from the Internet Archive's scans, cleaned by rule and not proofread,
    Ross where he prints Bekker's columns and the rest placed by the Workshop's alignment (≈); D. P. Chase's Ethics (1847) from Project Gutenberg (≈).</p>
    <p class="prov">The Physics, On the Heavens and On the Soul: the Greek of First1KGreek (Ross's Physics, Oxford, 1960 printing, and On the Soul, 1956; Prantl's
    On the Heavens, 1881; CC BY-SA 4.0), Bekker's columns from GLAUx or from the margin of the TEI. English from the Internet Archive's scans,
    cleaned by rule and not proofread: Hardie and Gaye's Physics (Oxford, 1930) and Stocks's On the Heavens (Oxford, 1922), where they print
    Bekker's columns in the margin; Hicks's On the Soul (Cambridge, 1907), at the Bekker lines that head each page; between two printed
    columns the rest shared out by length (≈). Taylor's own versions of these three (1806–1808) have not been found as complete scans.</p>
    <p class="prov">In Greek only, from First1KGreek (CC BY-SA 4.0), with no English yet: Susemihl's Magna Moralia (Leipzig, 1883), Prantl's
    Generation and Corruption (Leipzig, 1881), Fobes's Meteorology (Cambridge, Mass., 1919), Jaeger's Progression and Movement of Animals (Leipzig,
    1913), with Bekker's columns read from their margins (a column the margin has lost is placed by length, ≈); Langkavel's Parts of Animals
    (Leipzig, 1868) and Bekker's Generation of Animals (Berlin, 1829), with Bekker's columns from GLAUx (where GLAUx marks none, placed by length, ≈).</p>
    <p class="prov">The minor works, most of them written in Aristotle's school rather than by him, in Greek only, from First1KGreek (CC BY-SA 4.0), with no
    English yet: Bekker's own text (Oxford, 1837) of the Mechanics, On Indivisible Lines, On Melissus, Xenophanes and Gorgias, On Colours, On Things Heard,
    the Physiognomics, On Plants (without the prologue of its Byzantine translator, which is not on Bekker's Berlin pages) and On Marvellous Things Heard,
    and the Situations and Names of Winds, at the Berlin columns First1KGreek marks in it; the Problems (Ruelle, Knoellinger and Klek, Leipzig, 1922), the same;
    Jaeger's On Breath (Leipzig, 1913) and Ross's other versions of Physics VII and of passages of On the Soul II, with the columns in their margins
    (a column the margin has lost is placed by length, ≈). GLAUx has not tagged On Things Heard, On Indivisible Lines or the Winds; their words carry
    Morpheus's parses.</p>
    <p class="prov">On Virtues and Vices, in Greek only: Bekker's text (Berlin, 1831) as the Perseus Digital Library encodes it (CC BY-SA 4.0), at his columns.
    Not on Bekker's pages, each cited by its own numbers: the Constitution of the Athenians in Kenyon's Greek (Oxford Classical Texts, 1920), as Perseus
    encodes it, by chapter and section, with Kenyon's English (first published 1891; Project Gutenberg's text), each chapter at its first section and the
    sections within it shared out by length (≈); the four fragments of its lost beginning are left out. The Letters in Hercher's Greek (Epistolographi Graeci,
    Paris, 1873) and the Divisions in Mutschmann's (Leipzig, 1906), both from First1KGreek (CC BY-SA 4.0), in Greek only: the Divisions in both his texts,
    Diogenes Laertius' and the codex Marcianus', by his numbers. GLAUx tags all four; it has twenty-one of the Divisions, and the rest carry Morpheus's parses.</p>
    <p class="prov">The Parva Naturalia and the History of Animals: Bekker's own text, from First1KGreek (CC BY-SA 4.0), in his Oxford reprint (1837),
    which does not print the Berlin columns. For the Parva Naturalia they are carried over from the margin of Biehl's Greek (Leipzig: Teubner, 1898),
    whose words the Internet Archive's scan gives and the Workshop pairs one by one with Bekker's (≈, to the line); for the History of Animals, from
    the margin of D'Arcy Thompson's Oxford translation (1910), chapter by chapter (≈); a column neither gives is placed by length (≈). Thompson's
    English is beside the Greek, cleaned by rule from the scan and not proofread; he leaves out Book X.</p>
    <p class="prov">The Organon: the Greek of First1KGreek (CC BY-SA 4.0), Ross's Analytics (Oxford, 1964), with Bekker's columns in the margin, and
    Bekker's own text of the Categories, On Interpretation, Topics and Sophistical Refutations (in his Oxford reprint, 1837), which does not print
    the Berlin columns: these are carried over from the English, chapter by chapter (≈). English: the Oxford translation (1928; Edghill, Jenkinson,
    Mure, Pickard-Cambridge) from the Internet Archive's scan, cleaned by rule and not proofread, at the columns and line numbers printed in its
    margin; where the scan loses a column's mark, it is placed where the line numbers start again (≈).</p>
    <p class="prov">A second English of the Organon: Octavius Freire Owen's (Bohn's Classical Library, 1853, two volumes; public domain), from
    the Internet Archive's scans, cleaned by rule and not proofread, with his footnotes and the side-notes the scans could read. Owen prints no
    Bekker columns: they are carried over from the Oxford translation, chapter by chapter (≈).</p>
    <p class="prov">Porphyry's Introduction: Owen's English (The Organon, vol. II, London: Bohn, 1853, pp. 609–633; public domain) from the Internet
    Archive's scan, cleaned by rule and not proofread, with his footnotes and the side-notes the scan could read; the Greek is Busse's
    (Commentaria in Aristotelem Graeca IV.1, Berlin, 1887) in First1KGreek's TEI (CC BY-SA 4.0).</p>
    <p class="prov">The Greek commentators: the Commentaria in Aristotelem Graeca (Berlin: Reimer, 1882–1909) and Alexander's On the Soul with its
    Mantissa (Supplementum Aristotelicum II.1, 1887), in First1KGreek's TEI (CC BY-SA 4.0), read by the Berlin pages. A page is linked to a column of
    Aristotle where the editor prints its Bekker reference in the margin, or where the page repeats at least two runs of five words that stand in that
    column only (≈).</p>`;
}

// ------------------------------------------------------------------ the Library's shelf

function arShelf() {
  const ws = arWorks();
  if (!ws.length) return "";
  return `<section id="lib-ar"><h3>Aristotle</h3>
    <p class="meta">${AR_ABOUT}</p>
    <p class="meta">The Greek with the translations side by side, at Bekker's pages and columns (980a: page 980, left column), as every book on
      Aristotle cites him. Tap any Greek word for its dictionary form, its grammar and its dictionary entries, as in Plato; the Platonists' key
      terms are underlined, and a term's panel shows it in Plato and in Aristotle.</p>
    <p><a href="#aristotle-plato"><b>Aristotle on Plato</b></a> <span class="meta">Every place he names a dialogue, or a translator's note cites one, linked both ways.</span>
      · <a href="#ar-reconcile"><b>Plato and Aristotle reconciled</b></a> <span class="meta">The commentators on where the two agree, in their Greek.</span>
      · <a href="#search?corpus=aristotle"><b>Search Aristotle</b></a> <span class="meta">The concordance across his works.</span></p>
    <p><a href="#aristotle"><b>Start here: Aristotle as the Platonists read him</b></a> <span class="meta">The order they read his works in, the end they lead to, and where he agrees with Plato, each in Taylor's words.</span></p>
    <ul class="studies">${ws.map((w) => `<li><a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a> <span class="meta">${esc(AR_PLAIN[w.id] || "")}</span></li>`).join("")}</ul>
    <h4>The door to the logic</h4>
    <ul class="studies">
      <li><a href="#taylor/porphyry-introduction"><b>Porphyry's Introduction (Isagoge)</b></a> (Owen's English, 1853) <span class="meta">The five words the Categories takes for granted: genus, species, difference, property, accident. The Platonists read it before any Aristotle. The Greek (Busse, 1887) is <a href="#neo/porphyry-isagoge">on the Neoplatonists' shelf</a>.</span></li>
    </ul>
    ${arCommentatorsShelf()}
    <h4>Taylor on Aristotle</h4>
    <ul class="studies">
      <li><a href="#taylor/aristotle-dissertation"><b>Taylor's Dissertation on the Philosophy of Aristotle</b></a> (1812) <span class="meta">Four books: the division of his works and the end they lead to, his agreement with Plato, and his physical and metaphysical doctrines in his own words, with the Greek commentators on them.</span></li>
      <li><a href="#taylor/metaphysics-introduction"><b>Taylor's Introduction to the Metaphysics</b></a> (1801) <span class="meta">Why the Metaphysics is the summit of Aristotle's works, and how to read it with the Platonists.</span></li>
      <li><a href="#taylor/metaphysics-additional-notes"><b>Taylor's Additional Notes</b></a> (1801) <span class="meta">"To illustrate the Platonic doctrine concerning Ideas and the principle of the universe", from Syrianus, Proclus and Damascius.</span></li>
    </ul>
    <p class="meta">Taylor's notes on each passage (from Alexander, Syrianus and the others) are under the text when his translation is shown.</p>
    ${arSources()}</section>`;
}

// ------------------------------------------------------------------ the picker

function arPicker(filter) {
  const q = (filter || "").trim().toLowerCase();
  const places = placesGet();
  const ws = arWorks().filter((w) => !q || w.title.toLowerCase().includes(q) || (w.abbr || "").toLowerCase().includes(q) || "aristotle".includes(q));
  if (!ws.length) return "";
  return `<section class="tp-dialogues tp-ar"><h3>Aristotle</h3><p class="meta">Plato's pupil, read by the Platonists as the way up to Plato.</p>
    <section class="tp-group"><div class="tp-works">${ws.map((w) => {
      const here = state.work && state.work.id === w.id;
      const at = places[w.id];
      return `<button type="button" class="tp-work${here ? " here" : ""}" data-open-work="${esc(w.id)}"${here ? ' aria-current="true"' : ""}>
        <b>${esc(w.title)}</b><span class="tp-at">${here ? "Reading now" : at ? `Go on from ${esc(at)}` : "From the start"}</span></button>`;
    }).join("")}</div></section></section>`;
}

// ------------------------------------------------------------------ in the reader

// At the head of a work's first page: what it is, and how to read it.
function arHead(w) {
  return `<div class="nt-head page-note"><p><b>${esc(w.title)}.</b> ${esc(AR_PLAIN[w.id] || "")}</p>
    ${AR_CARRIED.has(w.id) ? `<p class="meta">This Greek (Bekker's text, in his Oxford reprint of 1837) does not print the Berlin columns: they are
      carried over from the margin of the Oxford translation (1928), chapter by chapter, and may be a few lines out (≈).</p>` : ""}
    ${AR_CARRIED_BIEHL.has(w.id) ? `<p class="meta">This Greek (Bekker's text, in his Oxford reprint of 1837) does not print the Berlin columns: they are
      carried over from the margin of Biehl's Greek (Leipzig, 1898), word by word, each to the first word of the line beside which Biehl prints
      it, and may be a word or two out (≈).</p>` : ""}
    ${AR_CARRIED_THOMPSON.has(w.id) ? `<p class="meta">This Greek (Bekker's text, in his Oxford reprint of 1837) does not print the Berlin columns: they are
      carried over from the margin of Thompson's Oxford translation (1910), chapter by chapter, and may be a few lines out (≈). Thompson does not
      translate Book X, which is thought not to be Aristotle's.${AR_BY_LENGTH[w.id] ? ` Bekker's columns ${esc(AR_BY_LENGTH[w.id].join(", "))} are
      given by neither: each is placed by the length of the text between the columns either side (≈).` : ""}</p>` : ""}
    ${AR_GREEK_ONLY.has(w.id) ? `<p class="meta">The Greek only: no English translation of this work is in the Workshop yet. The word box gives every
      word's dictionary form, grammar and dictionary entries.${AR_BY_LENGTH[w.id] ? ` Bekker's column${AR_BY_LENGTH[w.id].length === 1 ? "" : "s"} ${esc(AR_BY_LENGTH[w.id].join(", "))}
      ${AR_BY_LENGTH[w.id].length === 1 ? "is" : "are"} not marked in this Greek's source: each is placed by the length of the text between the columns either side, and may be a few lines out (≈).` : ""}</p>` : ""}
    ${AR_NO_GLAUX.has(w.id) ? `<p class="meta">GLAUx has not tagged this work, so no one dictionary form and grammar is chosen for each word: the word box
      gives every parse Morpheus allows for the form, and the dictionary entries.</p>` : ""}
    <p class="meta">${arCited(w) ? esc(arCited(w).about) : "Bekker's numbers: 980a is page 980 of Bekker's Berlin edition (1831), left column; every book on Aristotle cites him so."}
      Tap a Greek word for its dictionary form and grammar (from GLAUx, by machine) and its dictionary entries. Underlined words are the
      Platonists' key terms: tap one to see where Plato uses it too. Choose the translations beside the Greek with <em>Reading</em>; Taylor's
      notes from the Greek commentators come with his.</p></div>`;
}

// The book and chapter a column is in (for the page head).
function arWhere(w, ref) {
  const seq = new Map(w.sections.map((r, i) => [r, i]));
  const i = seq.get(ref);
  const ch = (w.ar_chapters || []).filter((c) => seq.get(c.start_ref) <= i && seq.get(c.end_ref) >= i);
  return ch.map((c) => c.label).join("; ");
}

// The contents column of a work: its books and chapters, the other works, and the sources.
function renderTocAR(w) {
  const seq = new Map(w.sections.map((r, i) => [r, i]));
  const cur = state.data ? state.data.sections.map((s) => seq.get(s.ref)) : [];
  const inside = (c) => cur.some((i) => i >= seq.get(c.start_ref) && i <= seq.get(c.end_ref));
  const byBook = new Map();
  for (const c of w.ar_chapters || []) {
    const b = c.label.includes(", chapter") ? c.label.split(", chapter")[0] : w.title;   // a work in one book: its chapters together
    if (!byBook.has(b)) byBook.set(b, []);
    byBook.get(b).push(c);
  }
  let h = arCited(w) || !(w.ar_chapters || []).length ? "" : `<h3>Chapters</h3>`;
  if (arCited(w) && (w.ar_chapters || []).length) {
    // The letters by their addressees, the divisions by their headings (Aristotle milestone A8f).
    const lists = arCited(w).scheme === "division" ? [1, 2].map((p) => [arPageName(w, p), w.ar_chapters.filter((c) => arSplit(c.start_ref)[0] === p)])
      : [["Letters", w.ar_chapters]];
    for (const [title, cs] of lists) {
      h += `<details class="ar-book"${cs.some(inside) ? " open" : ""}><summary>${esc(title)}</summary><ul class="books">${cs.map((c) =>
        `<li class="${inside(c) ? "here" : ""}"><a href="${esc(placeHash(WORK, c.start_ref))}" title="${esc(c.basis)}"><span lang="grc">${esc(c.label.split(": ").slice(1).join(": "))}</span><span>${esc(arRefLabel(w, c.start_ref))}</span></a></li>`).join("")}</ul></details>`;
    }
  }
  for (const [b, cs] of arCited(w) ? [] : byBook) {
    const open = cs.some(inside);
    h += `<details class="ar-book"${open ? " open" : ""}><summary>${esc(b)}</summary><ul class="books">${cs.map((c) =>
      `<li class="${inside(c) ? "here" : ""}"><a href="${esc(placeHash(WORK, c.start_ref))}" title="${esc(c.basis)}"><span>ch. ${esc((c.label.match(/chapter (\S+)$/i) || ["", ""])[1])}</span><span>${esc(c.start_ref)}–${esc(c.end_ref)}</span></a></li>`).join("")}</ul></details>`;
  }
  h += `<h3>Aristotle</h3><ul class="books">${arWorks().map((x) =>
    `<li class="${x.id === w.id ? "here" : ""}"><a href="#${esc(x.slug)}"><span>${esc(x.title)}</span></a></li>`).join("")}</ul>
    <p class="note"><a href="#aristotle">Start here for Aristotle</a> · <a href="#taylor/aristotle-dissertation">Taylor's Dissertation</a></p>
    ${["ar006", "ar017", "ar001", "ar001p", "ar044", "ar040"].includes(w.id) ? `<p class="note"><a href="#taylor/porphyry-introduction">Porphyry's Introduction</a>, the door to the logic</p>` : ""}
    ${w.id === "ar025" ? `<p class="note"><a href="#taylor/metaphysics-introduction">Taylor's Introduction</a> · <a href="#taylor/metaphysics-additional-notes">his Additional Notes</a></p>` : ""}
    <p class="note"><a href="#library">The Library</a></p>
    <details class="note"><summary>About this text</summary>${arSources()}</details>`;
  return h;
}

// ------------------------------------------------------------------ the term

// Aristotle's part of a term's panel (terms.js).
function arTermSection(t) {
  const n = t.aristotle;
  if (!n || !n.words) return "";
  return `<section class="term-places term-ar"><h4 class="pane-h">In Aristotle</h4>
    <p class="meta">${n.words.toLocaleString()} words marked. ${esc(n.about)}</p>
    ${n.works.map((b) => {
      const refs = n.occurrences[b.work_id] || [];
      const cur = b.work_id === WORK && state.view === "read";
      return `<details class="term-work${cur ? " here" : ""}"${cur ? " open" : ""}><summary><b>${esc(b.title)}</b> <span class="meta">${b.n.toLocaleString()} word${b.n === 1 ? "" : "s"} in ${refs.length} ${arCited(workById(b.work_id)) ? "section" : "column"}${refs.length === 1 ? "" : "s"}</span></summary>
        <p class="term-refs">${refs.map(([ref, k]) => `<a href="${esc(placeHash(b.work_id, ref))}" data-term-step="${esc(t.id)}" title="${k} word${k === 1 ? "" : "s"}">${esc(arRefLabel(workById(b.work_id), ref))}</a>`).join(" ")}</p></details>`;
    }).join("")}
    ${n.forms_marked.length ? `<p class="meta">Commonest forms there: <span lang="grc">${n.forms_marked.map((f) => `${esc(f.form)} ${f.n}`).join(", ")}</span></p>` : ""}</section>`;
}

// ------------------------------------------------------------------ Start here (Aristotle milestone A2)

// The Platonists' course through Aristotle, as Marinus tells it of Proclus (in Taylor's translation): logic, ethics,
// politics, physics, theology, and then Plato. The works of each step, by their TLG numbers (ar + number); a work not yet
// in the Workshop is listed without a link. Taylor's division (1812, Book I ch. 1) puts the Rhetoric with the logic.
const AR_ORDER = [
  { step: "Logic", taylor: "instrumental", note: "The tools of demonstration, read first, after Porphyry's Introduction.", door: true,
    works: [["ar006", "Categories"], ["ar017", "On Interpretation"], ["ar001", "Prior Analytics"], ["ar001p", "Posterior Analytics"], ["ar044", "Topics"], ["ar040", "Sophistical Refutations"], ["ar038", "Rhetoric"], ["ar034", "Poetics"]] },
  { step: "Ethics", taylor: "practical: moral", note: "\"That we may become virtuous\".",
    works: [["ar010", "Nicomachean Ethics"], ["ar009", "Eudemian Ethics"], ["ar022", "Great Morals (Magna Moralia)"], ["ar045", "On Virtues and Vices"]] },
  { step: "Politics", taylor: "practical: economical and political", note: "",
    works: [["ar035", "Politics"], ["ar029", "Economics"], ["ar003", "Constitution of the Athenians"]] },
  { step: "Physics", taylor: "theoretic: physical", note: "\"The knowledge of natural things\", ending in the soul and the short treatises on what is common to soul and body (the Parva Naturalia).",
    works: [["ar031", "Physics"], ["ar054", "Physics VII, the other version"], ["ar047", "On Melissus, Xenophanes and Gorgias"], ["ar005", "On the Heavens"], ["ar013", "On Generation and Corruption"], ["ar026", "Meteorology"], ["ar014", "History of Animals"], ["ar030", "Parts of Animals"], ["ar015", "Progression of Animals"], ["ar021", "Movement of Animals"], ["ar012", "Generation of Animals"], ["ar002", "On the Soul"], ["ar052", "On the Soul II, the other version"],
      ["ar041", "On Sense"], ["ar024", "On Memory"], ["ar042", "On Sleep"], ["ar016", "On Dreams"], ["ar008", "On Divination in Sleep"],
      ["ar020", "On Length of Life"], ["ar018", "On Youth and Old Age"], ["ar037", "On Respiration"], ["ar043", "On Breath"],
      ["ar007", "On Colours"], ["ar004", "On Things Heard"], ["ar032", "Physiognomics"], ["ar039", "On Plants"], ["ar027", "On Marvellous Things Heard"],
      ["ar046", "Situations and Names of Winds"], ["ar036", "Problems"]] },
  { step: "Mathematics", taylor: "theoretic: mathematical", note: "\"Such as his Mechanical Problems, and his treatise On Indivisible Lines\".",
    works: [["ar023", "Mechanics"], ["ar019", "On Indivisible Lines"]] },
  { step: "Theology", taylor: "theoretic: theological", note: "\"Those luminous beings, which have a supernatural subsistence\".",
    works: [["ar025", "Metaphysics"]] },
  { step: "Beside the course", taylor: "", note: "Not named in Taylor's division of his works: letters under his name, and the divisions Diogenes Laertius gives as his account of Plato's.",
    works: [["ar011", "Letters"], ["ar048", "Divisions"]] },
];

// Each quotation as Taylor printed it, checked against the scan; "at" is words of the paragraph it is in, to open it there.
const AR_DISS = "aristotle-dissertation";
const AR_ISAGOGE = "porphyry-introduction";
const AR_QUOTES = {
  marinus: { text: `In less than two whole years therefore, Proclus read with Syrianus all the works of Aristotle, viz. his logic, ethics, politics, physics, and theological science. And being sufficiently instructed in these as in certain proteleia, or things preparatory to initiation, and lesser mysteries, Syrianus led him to the mystic discipline of Plato, in an orderly progression, and not according to the Chaldean oracle with a transcendent foot.`,
    src: `Marinus, Life of Proclus, in Taylor's translation (in his Proclus On the Theology of Plato, 1816; Project Gutenberg's text).` },
  plan: { at: "As preparatory however to the developement", text: `As preparatory however to the developement of his principal dogmas, it will be requisite to present the reader with a division of his works; to show what the end is of his philosophy, and which of his writings lead us to this end: what kind of diction he employs; why he designedly wrote with such obscurity; and to evince that his principal doctrines are conformable to those of Plato, and that he differs from his divine master in appearance only, and not in reality.`, page: 2 },
  division: { at: "Of his remaining works, therefore", text: `Of his remaining works, therefore, some are theoretic, others practical, and others instrumental. Likewise of those treatises which are entirely theoretic or contemplative, some are theological, as his Metaphysics; others physical, as his eight books inscribed Physical Ausculation; and the books consequent to these, such as those On the Heavens, On Generation and Corruption, &c.; and others again are mathematical, such as his Mechanical Problems, and his treatise On Indivisible Lines.`, page: 2 },
  end: { at: "moral philosophy is perfection", text: `In the second place, the end of Aristotle's moral philosophy is perfection through the virtues, and the end of his contemplative Philosophy, an union with the one principle of all things … All the works of the Philosopher lead us to the attainment of this end. For some of them unfold to us the art of demonstration; others that we may become virtuous, instruct us in morals; and lastly, others lead us to the knowledge of natural things, and afterwards to those luminous beings, which have a supernatural subsistence.`, page: 3 },
  diction: { at: "theology physically", text: `This, too, is peculiar to Aristotle, that he was never willing to depart from nature, but even contemplated things which transcend nature through a natural habit and knowledge; just as, on the contrary, the divine Plato, after the manner of the Pythagoreans, contemplated whatever is natural, so far as it partakes of that which is divine and above nature. Hence the former considered theology physically, and the latter physics theologically.`, page: 4 },
  ideas: { at: "with such apparent violence opposes", text: `In the next place, it is requisite to observe, that though Aristotle with such apparent violence opposes Plato's doctrine of ideas, yet he in reality accords with this doctrine. For that he was not an enemy to the dogma, that in the intellect of the fabricator of all things there are forms or ideas, which pre-subsist as paradigms, and as the productive principles of whatever has a perpetual subsistence in the universe, is evident from hence, that in the twelfth book of the Metaphysics, he asserts that there is a twofold order, one in the world, and another in the cause of the world, just as we say that there is one order in an army, and another in the commander of the army.`, page: 11 },
  hostility: { at: "apparent hostility", text: `Aristotle, therefore, was in general averse to causes receiving the same appellations with their sensible effects; and this was the peculiarity of his philosophy, and the reason why he opposes with such apparent hostility the friends of ideas.`, page: 12 },
  names: { at: "in names only", text: `It is evident, therefore, that here also the difference between the two philosophers is in names only, and not in things.`, page: 13 },
};

function arQuote(k) {
  const q = AR_QUOTES[k];
  const where = q.at ? `Taylor, <a href="#taylor/${AR_DISS}@${encodeURIComponent(q.at)}">A Dissertation on the Philosophy of Aristotle</a> (1812), Book I, p. ${q.page}.` : esc(q.src);
  return `<blockquote>${esc(q.text)}</blockquote><p class="ar-src">${where}</p>`;
}

function showArStart() {
  state.view = "ar-start";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Start here: Aristotle · Platonic Workshop";
  const have = new Map(arWorks().map((w) => [w.id, w]));
  $("#toc").innerHTML = `<p><a href="#library">‹ Library</a></p><h3>Aristotle</h3>
    <ul class="books"><li><a href="#ar-why" data-scroll="ar-why"><span>Why Aristotle first</span></a></li>
      <li><a href="#ar-order" data-scroll="ar-order"><span>The order of reading</span></a></li>
      <li><a href="#ar-way" data-scroll="ar-way"><span>How he writes</span></a></li>
      <li><a href="#ar-plato" data-scroll="ar-plato"><span>Aristotle and Plato</span></a></li></ul>
    <p class="note"><a href="#taylor/${AR_DISS}">Taylor's Dissertation, whole</a></p>`;
  $("#main").innerHTML = `<div class="search guide ar-start"><h2>Start here: Aristotle as the Platonists read him</h2>
    <p class="lead">The last Platonist schools read all of Aristotle before Plato: his logic, ethics, politics, physics and theology,
      as the lesser mysteries before the greater. Thomas Taylor, who translated the whole of Aristotle (1806–1812), set out their
      reading of him in his Dissertation on the Philosophy of Aristotle (1812). This page is in their words, each passage quoted
      and checked against the printed page.</p>
    <h3 id="ar-why">Why Aristotle first</h3>
    ${arQuote("marinus")}
    ${arQuote("plan")}
    <h3 id="ar-order">The order of reading</h3>
    ${arQuote("division")}
    ${arQuote("end")}
    <p>So the course runs as Marinus gives it, from logic to theology. The works of each step, in the Workshop where a link is given:</p>
    <ol class="ar-order">${AR_ORDER.map((g) => `<li><b>${esc(g.step)}</b> <span class="meta">${g.taylor ? `(Taylor's ${esc(g.taylor)})` : ""}${g.note ? " " + esc(g.note) : ""}</span><br>
      ${g.door ? `<a href="#taylor/${AR_ISAGOGE}">Porphyry's Introduction</a> <span class="meta">(Owen, 1853; the Greek is <a href="#neo/porphyry-isagoge">here</a>)</span> → ` : ""}${g.works.map(([id, title]) => have.has(id) ? `<a href="#${esc(have.get(id).slug)}">${esc(title)}</a>` : `<span class="ar-later" title="Not yet in the Workshop">${esc(title)}</span>`).join(" · ")}</li>`).join("")}
      <li><b>Plato</b> <span class="meta">The greater mysteries:</span> <a href="#start">Start here for Plato</a>, the dialogues in the order of Iamblichus.</li></ol>
    <h3 id="ar-way">How he writes</h3>
    ${arQuote("diction")}
    <h3 id="ar-plato">Aristotle and Plato</h3>
    ${arQuote("ideas")}
    ${arQuote("hostility")}
    ${arQuote("names")}
    <p class="meta">The Greek commentators say the same, in their own words: <a href="#ar-reconcile">Plato and Aristotle reconciled</a>.</p>
    <p class="meta">Where Aristotle argues against the Forms in the Metaphysics, Taylor's notes under his translation answer from Syrianus;
      show <em>Taylor (1801)</em> beside the Greek of <a href="#metaphysics/987a">Book Α</a> or <a href="#metaphysics/1076a">Book Μ</a>.</p>
    <p class="prov">Taylor's Dissertation is read from the Internet Archive's scan of the Harvard copy (public domain), its OCR cleaned by rule
      and not proofread; the passages above were checked by eye against the scan. Marinus from Project Gutenberg's text of Taylor's 1816 volume.</p>
  </div>`;
  window.scrollTo(0, 0);
}

// ------------------------------------------------------------------ the Greek commentators (Aristotle milestone A5)

// The commentaries are stored and read with the Neoplatonists (neo.js, #neo/<id>), on their own shelf. Each page is
// linked to the columns of Aristotle it comments on: printed (the editor gives the Bekker reference in the margin) or
// quoted (the page repeats runs of words found in that column only, ≈).
const AR_COMM_HOW = {
  printed: "The editor of the Berlin edition prints this column's reference in the margin, beside the lemma",
  quoted: "The page repeats at least two runs of five words found in this column of Aristotle's Greek and in no other column of the work: a lemma or a quotation (≈)",
};

function arCommentatorsShelf() {
  if (typeof neoShelfTexts !== "function") return "";
  const ts = neoShelfTexts("commentators");
  if (!ts.length) return "";
  const words = ts.reduce((a, t) => a + t.words, 0);
  return `<h4 id="lib-ar-comm">The Greek commentators</h4>
    <p class="meta">The Berlin Academy's <i>Commentaria in Aristotelem Graeca</i> (1882–1909), in First1KGreek's corrected Greek (CC BY-SA 4.0):
      the school's lectures on Aristotle, from Alexander of Aphrodisias to Olympiodorus and his pupils, read by the pages of the Berlin edition as every book
      cites them. ${ts.length} texts, ${words.toLocaleString()} Greek words. Each page links to the columns of Aristotle it comments on, and each column
      of Aristotle lists the commentators' pages on it.</p>
    <div class="lib-grid">${neoGroups("commentators").map((g) => `<section><h4>${esc(g.label)}</h4><ul>${g.texts.map((t) =>
      `<li><a href="#neo/${esc(t.id)}"><b>${esc(t.author)}</b>, ${esc(t.title)}</a> <span class="meta">${esc(t.editor)}, ${esc(String(t.year))}</span></li>`).join("")}</ul></section>`).join("")}</div>`;
}

// A link to a column of Aristotle (or a page of Porphyry's Introduction).
function arColLink(work, col, how, what) {
  const approx = how === "quoted" ? ` <span class="approx" title="${esc(AR_COMM_HOW.quoted)}">≈</span>` : "";
  const title = how === "printed" ? `${AR_COMM_HOW.printed}: ${what}` : `${AR_COMM_HOW.quoted}: ${what}`;
  if (work === "isagoge") return `<a href="#neo/porphyry-isagoge/0/${esc(col)}" title="${esc(title)}">Isag. p. ${esc(col.split(".")[1] || col)}</a>${approx}`;
  const w = workById(work);
  return `<a href="${esc(placeHash(work, col))}" title="${esc(title)}">${esc(w ? w.abbr || w.title : work)} ${esc(col)}</a>${approx}`;
}

// On a commentator's page: the columns it comments on.
function arColsOfUnit(u) {
  if (!u.ar_cols || !u.ar_cols.length) return "";
  return `<p class="tg-back meta">On ${u.ar_cols.map((c) => arColLink(c.work_id, c.col, c.how, c.what)).join(", ")}</p>`;
}

// At the head of a commentary: the work it comments on, and how its pages are linked.
function arCommentsOn(t) {
  if ((t.shelf || "neo") !== "commentators") return "";
  const w = t.on_work && t.on_work !== "isagoge" ? workById(t.on_work) : null;
  const on = t.on_work === "isagoge" ? `<a href="#neo/porphyry-isagoge">Porphyry's Introduction</a> (Busse's Greek; Owen's English <a href="#taylor/porphyry-introduction">here</a>)`
    : w ? `<a href="#${esc(w.slug)}">${esc(w.title)}</a>` : "";
  return `<p class="meta">${on ? `On ${on}: each page names the ${t.on_work === "isagoge" ? "pages" : "Bekker columns"} it comments on, printed in the editor's margin, or found by the
    words it quotes (≈). ` : /^Introductions/.test(t.grp) ? "An introduction to philosophy and to Aristotle as a whole, read before the Categories. " : "The Workshop does not have the work commented on yet. "}<a href="#library">The Library</a>.</p>`;
}

// Under a column of Aristotle: the commentators' pages on it.
function renderArCommentRow(s, d) {
  const here = (d.ar_comments || []).filter((c) => c.col === s.ref);
  if (!here.length) return "";
  const by = new Map();
  for (const c of here) {
    if (!by.has(c.text_id)) by.set(c.text_id, { author: c.author, title: c.title, pages: [] });
    by.get(c.text_id).pages.push(c);
  }
  const items = [...by].map(([tid, g]) => `<li><b>${esc(g.author)}</b>, ${esc(g.title)}: ${g.pages.map((c) =>
    `<a href="#neo/${esc(tid)}/${c.part}/${encodeURIComponent(c.n)}" title="${esc(c.how === "printed" ? `${AR_COMM_HOW.printed}: ${c.what}` : `${AR_COMM_HOW.quoted}: ${c.what}`)}">${esc(c.label)}</a>${c.how === "quoted" ? `<span class="approx">≈</span>` : ""}`).join(", ")}</li>`).join("");
  return `<div class="app-row app-notes ar-comm-row"><div class="app-k">Greek commentators</div><div class="app-v"><ul class="ar-comm">${items}</ul>
    <p class="meta">The pages of the <i>Commentaria in Aristotelem Graeca</i> on this column: given by the editor in the margin, or (≈) found by the words they quote.</p></div></div>`;
}

// ------------------------------------------------------------------ Plato and Aristotle together (Aristotle milestone A7)

const AR_PLATO_HOW = {
  named: "Aristotle's own Greek names the dialogue (or Plato) here",
  note: "A translator's note on this column cites the passage, read by the rules of the citation web and checked against Burnet's sections",
};

// The word box: this dictionary form in the other philosopher.
function renderArOtherCorpus(t, isAr) {
  const list = isAr ? t.elsewhere : t.elsewhere_ar;
  if (!list || !list.some((e) => e.total)) return "";
  const n = arWorks().length;
  return `<div class="box elsewhere other-corpus"><h3>${isAr ? "In Plato" : "In Aristotle"} <span class="badge" title="Another body of writing">another corpus</span></h3>${list.filter((e) => e.total).map((e) => {
    const top = e.counts.slice(0, 5);
    return `<p><span class="lemma" lang="grc">${esc(e.lemma)}</span>: <b>${fmt(e.total)}</b>× in ${e.works} ${isAr ? "of the 36 works of Plato" : `of the ${n} works of Aristotle here`}${e.matched && e.matched !== "same spelling" ? ` <span class="meta">(matched by ${esc(e.matched)})</span>` : ""}.
      <button class="link-btn" data-search-q="${esc(e.lemma)}" data-search-by="lemma" data-search-corpus="${isAr ? "plato" : "aristotle"}">Every occurrence</button></p>
      <p class="meta">${top.map((c) => `${esc(c.title)} ${fmt(c.n)}`).join(" · ")}</p>`;
  }).join("")}<p class="prov">Counted from GLAUx's dictionary forms, given by machine to both.</p></div>`;
}

function arPlatoChip(l) {
  if (l.to_work === "plato") return `<span class="chip off" title="${esc(AR_PLATO_HOW.named)}">Plato named: <span lang="grc">${esc(l.raw)}</span></span>`;
  const w = workById(l.to_work);
  const label = `${w ? w.abbr || w.title : l.to_work}${l.to_ref ? " " + l.to_ref : ""}`;
  const title = `${AR_PLATO_HOW[l.how]}${l.who ? ` (${l.who})` : ""}: ${l.raw}${l.doubt ? ". " + l.doubt : ""}`;
  const named = l.how === "named" ? ` <span class="meta" lang="grc">${esc(l.raw)}</span>` : "";
  return `<a class="chip other" href="${esc(placeHash(l.to_work, l.to_ref || null))}" title="${esc(title)}">${esc(label)}${l.certainty === "uncertain" ? "?" : ""}</a>${named}`;
}

// Under a column of Aristotle: the Plato it names or cites. Under a section of Plato: where Aristotle discusses it.
function renderArPlatoRow(s, d) {
  if (isAR(state.work)) {
    const here = (d.ar_plato_out || []).filter((l) => l.from_ref === s.ref);
    if (!here.length) return "";
    return `<div class="app-row app-links ar-plato-row"><div class="app-k">Plato</div><div class="app-v">${here.map(arPlatoChip).join(" ")}
      <p class="meta"><a href="#aristotle-plato">Every place Aristotle names or cites Plato</a></p></div></div>`;
  }
  const here = (d.ar_plato_in || []).filter((l) => l.to_ref === s.ref || (l.to_ref === String(d.page) && s === d.sections[0]));
  if (!here.length) return "";
  return `<div class="app-row app-links ar-plato-row"><div class="app-k">Aristotle</div><div class="app-v">${here.map((l) =>
    `<a class="chip other" href="${esc(placeHash(l.from_work, l.from_ref))}" title="${esc(`${AR_PLATO_HOW[l.how]}${l.who ? ` (${l.who})` : ""}: ${l.raw}`)}">${esc(l.from_title)} ${esc(l.from_ref)}</a>`).join(" ")}
    <p class="meta">Where Aristotle discusses this passage: cited in a translator's note on his text. <a href="#aristotle-plato">Every place Aristotle names or cites Plato</a></p></div></div>`;
}

// The page #aristotle-plato: every place in Aristotle that names or cites Plato, by dialogue.
async function showArPlato() {
  state.view = "ar-plato";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Aristotle on Plato · Platonic Workshop";
  $("#main").innerHTML = `<p class="loading">Opening…</p>`;
  let d;
  try { d = await api("aristotle-plato"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  const by = new Map();
  for (const l of d.links) {
    const k = l.to_work;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(l);
  }
  const keys = [...by.keys()].sort((a, b) => (a === "plato") - (b === "plato") || by.get(b).length - by.get(a).length);
  const title = (k) => k === "plato" ? "Plato named, no dialogue" : (by.get(k)[0].to_title || k);
  $("#toc").innerHTML = `<p><a href="#library">‹ Library</a></p><h3>Aristotle on Plato</h3><ul class="books">${keys.map((k, i) =>
    `<li><a href="#arp-${i}" data-scroll="arp-${i}"><span>${esc(title(k))}</span><span>${by.get(k).length}</span></a></li>`).join("")}</ul>
    <p class="note"><a href="#aristotle">Start here for Aristotle</a></p>`;
  const st = d.stats;
  $("#main").innerHTML = `<div class="search guide ar-plato"><h2>Aristotle on Plato</h2>
    <p class="lead">Every place in the works of Aristotle the Workshop has where his Greek names a dialogue or Plato himself, or a translator's note on the
      column cites a passage of Plato. Each links both ways: the column of Aristotle shows the Plato, and the passage of Plato shows the Aristotle.</p>
    <p class="meta">Read by rule, nothing guessed. <b>Named</b>: Aristotle's Greek names the dialogue (ἐν τῷ Τιμαίῳ, ἐν δὲ τῷ Φαίδωνι, ὁ ἐν τῷ Μένωνι λόγος), linked to the dialogue
      as a whole. <b>Note</b>: a translator's note (Tredennick, Ross, Rackham, Taylor, the Oxford translators, Owen) cites the dialogue by title and page,
      read as the citation web reads Plato's own notes and checked against Burnet's sections; a doubtful reading is marked ?.
      ${st ? `${d.links.length} places, ${st.dialogues} dialogues, ${st.sections_cited} passages of Plato.` : ""}</p>
    ${keys.map((k, i) => `<section id="arp-${i}"><h3>${k === "plato" ? esc(title(k)) : `<a href="#${esc(by.get(k)[0].to_slug || "")}">${esc(title(k))}</a>`} <span class="meta">${by.get(k).length}</span></h3>
      <ul class="ar-plato-list">${by.get(k).map((l) => `<li><a href="${esc(placeHash(l.from_work, l.from_ref))}">${esc(l.from_title)} ${esc(l.from_ref)}</a>
        ${l.to_ref ? `→ <a href="${esc(placeHash(l.to_work, l.to_ref))}">${esc(l.to_ref)}</a>` : ""}
        <span class="meta">${l.how === "named" ? `named in the Greek: <span lang="grc">${esc(l.raw)}</span>` : `${esc(l.who || "a note")}: “${esc(l.raw)}”`}${l.certainty === "uncertain" ? ` (${esc(l.doubt || "uncertain")})` : ""}</span></li>`).join("")}</ul></section>`).join("")}
  </div>`;
  window.scrollTo(0, 0);
}

// ------------------------------------------------------------------ Reconciliations (Aristotle milestone A7)

// Where the Greek commentators say that Aristotle and Plato agree, in their own Greek, quoted from the page as the Workshop has it
// (tests/test_aristotle.py checks every quotation against the page, and every column against the links of milestone A5).
// src: [text, page, part]; on: the column of Aristotle the page is linked to (A5), or the lemma the editor prints; the English is the
// Workshop's own, labelled so.
const AR_RECON = [
  { topic: "The rule: agreement in the sense, not the wording", id: "rule",
    items: [
      { who: "Simplicius", src: ["simplicius-categories", "7", 0], on: null, where: "the prologue to his commentary on the Categories, on what the reader of Aristotle needs",
        grc: `δεῖ δὲ οἶμαι καὶ τῶν πρὸς Πλάτωνα λεγομένων αὐτῷ μὴ πρὸς τὴν λέξιν ἀποβλέποντα μόνον διαφωνίαν τῶν φιλοσόφων καταψηφίζεσθαι, ἀλλ᾿ εἰς τὸν νοῦν ἀφορῶντα τὴν ἐν τοῖς πλείστοις συμφωνίαν αὐτῶν ἀνιχνεύειν.`, en: `And I think that, with what he says against Plato too, one must not look only to the wording and condemn the philosophers for disagreeing, but look to the sense and track down their agreement in most things.` },
    ] },
  { topic: "The Forms", id: "forms",
    items: [
      { who: "Asclepius", src: ["asclepius-metaphysics", "75", 3], on: ["ar025", "990b"], where: "on the third man, Metaphysics Α 9",
        grc: `ἀπολογούμεθα τοίνυν ἡμεῖς ὑπὲρ τοῦ Πλάτωνος τοῦτον τὸν τρόπον, φάσκοντες ὅτι ἡ ὁμοιότης ἐν τοῖς στοιχείοις θεωρεῖται, τουτέστιν ἐν τοῖς καθ’ ἕκαστα αἰσθητοῖς. ἡ γὰρ ἰδέα οὐκ ἔστιν ὁμοία τῷ αἰσθητῷ, εἴ γε τὸ μὲν αἰσθητόν ἐστι, τὸ δὲ λόγος ἐξῃρημένος τοῦ αἰσθητοῦ.`, en: `We therefore defend Plato in this way, saying that likeness is seen in the elements, that is, in the particular things of sense. For the Form is not like the thing of sense, since the one is sensible and the other a reason-principle exempt from the sensible.` },
      { who: "Asclepius", src: ["asclepius-metaphysics", "88", 4], on: ["ar025", "991a"], lemma: ["asclepius-metaphysics", "87", "p. 991a20"], where: "on the Forms as \"paradigms\" and \"poetic metaphors\", Metaphysics Α 9 (the lemma 991a20, printed on p. 87)",
        grc: `φαμὲν οὗν πρὸς τοῦτο ὅτι ὁ δημιουργὸς ἀποβλέπων πρὸς τὰς ἰδέας, καὶ ἡ φύσις οὕτως παράγει ἃ παράγει· … τὸ δὲ κεχρῆσθαι μεταφοραῖς καὶ κλεῖν αὐτὰ παραδείγματα οὐδέν ἐστιν ἄτοπον, ἐπειδὴ πρὸς αὐτὰ ἀποβλέπων ὁ δημιουργὸς οὕτως παράγει· ὥστε ἐκεῖ μὲν παραδείγματα, ἐνταῦθα δὲ εἰκόνες.`, en: `To this we say that it is by looking to the Forms that the Demiurge, and so nature, brings forth what it brings forth … And there is nothing out of place in using metaphors and calling them paradigms, since it is by looking to them that the Demiurge brings forth; so that there they are paradigms, and here images.` },
      { who: "Asclepius", src: ["asclepius-metaphysics", "183", 10], on: ["ar025", "999a"], where: "on the separate principle, Metaphysics Β",
        grc: `καὶ δεῖ σημειώσασθαι ὅτι φησὶ ῾δεῖ τὴν ἀρχὴν τὴν παρακτικὴν κεχωρίσθαι τῶν πραγμάτων, ὧν ἐστιν ἀρχή᾿· ὥστε οἶδε καὶ αὐτὸς τὰς ἰδέας καὶ τοὺς λόγους τοὺς δημιουργικοὺς τῶν πραγμάτων ἐξῃρημένους καὶ χωριστοὺς ὄντας.`, en: `And one should note that he says "the principle that brings things forth must be separate from the things of which it is the principle"; so he too knows the Forms, and the demiurgic reason-principles of things, as exempt and separate.` },
    ] },
  { topic: "The soul", id: "soul",
    items: [
      { who: "Philoponus", src: ["philoponus-de-anima", "581", 30], on: ["ar002", "432b"], where: "on what moves the living thing in place, On the Soul III 9-10 (the third book is printed under Philoponus' name)",
        grc: `ἰστέον δὲ ὅτι οὐ διαφωνεῖ Πλάτων Ἀριστοτέλει. ὁ μὲν γὰρ Πλάτων τὸ ποιητικὸν αἴτιον εἶπεν, ὁ δὲ Ἀριστοτέλης τὸ τελικόν, εἰπὼν τὴν ὄρεξιν.`, en: `One should know that Plato does not disagree with Aristotle. For Plato named the efficient cause, and Aristotle the final, in naming desire.` },
    ] },
  { topic: "The eternity of the world", id: "eternity",
    items: [
      { who: "Simplicius", src: ["simplicius-de-caelo", "296", 14], on: ["ar005", "279b"], where: "on those who make the world generated but indestructible, On the Heavens I 10 (\"among them the theologians and Plato, as Alexander says\")",
        grc: `ἰστέον δέ, ὅτι ὁ μὲν Ἀριστοτέλης κατὰ παλαιὰν συνήθειαν πρὸς τὸ φαινόμενον ἐνίσταται πολλάκις, ὅταν τοῦτο προχειρότερον ἐκληφθὲν μὴ συμφωνῇ τῇ ἀληθείᾳ· ποιεῖ δὲ τοῦτο βοηθῶν τοῖς ἐπιπολαιότερον τῶν παλαιῶν λόγων ἀκροωμένοις … οὐχ οὕτως οὖν γενητὸν ὡς ἀπὸ χρόνου τινὸς γενόμενον·`, en: `One should know that Aristotle, by an old custom, often objects to what a saying appears to mean, when that, taken too readily, does not agree with the truth; and he does this to help those who hear the ancients' words too superficially … [Plato calls the world] generated, then, not as having come to be from some point in time.` },
    ] },
  { topic: "God as maker, and the unmoved mover", id: "mover",
    items: [
      { who: "Simplicius", src: ["simplicius-physics", "1363", 59], on: ["ar031", "267b"], lemma: ["simplicius-physics", "1357", "p. 267b17"], where: "at the end of the Physics (the lemma 267b17 to the end, printed on p. 1357)",
        grc: `γέγραπται δὲ βιβλίον ὅλον Ἀμμωνίῳ τῷ ἐμῷ καθηγεμόνι, πολλὰς πίστεις παρεχόμενον τοῦ καὶ ποικτικὸν αἴτιον ἡγεῖσθαι τὸν θεὸν τοῦ παντὸς κόσμου τὸν Ἀριστοτέλη … εἰ δέ τις ζητεῖ, τί δήποτε ὁ Ἀριστοτέλης οὐχ οὕτως φανερῶς ποιητικὸν αἴτιον τὸν θεὸν εἶπεν ὡς τελικόν, τὸν περὶ τοῦ γενητοῦ ῥηθέντα πρότερον καὶ νῦν ἐρῶ λόγον.`, en: `A whole book was written by Ammonius, my teacher, offering many proofs that Aristotle holds God to be the efficient cause [the file prints ποικτικὸν, for ποιητικὸν] of the whole world as well … And if anyone asks why Aristotle did not call God the efficient cause as plainly as the final, I shall give now the account given before about the generated.` },
    ] },
];

function showArReconcile() {
  state.view = "ar-reconcile";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Plato and Aristotle reconciled · Platonic Workshop";
  const ar = arWorks();
  const colLink = (on) => {
    if (!on) return "";
    const w = ar.find((x) => x.id === on[0]);
    return w ? ` <a class="chip other" href="${esc(placeHash(w.id, on[1]))}">${esc(w.title)} ${esc(on[1])}</a>` : "";
  };
  $("#toc").innerHTML = `<p><a href="#library">‹ Library</a></p><h3>Plato and Aristotle reconciled</h3><ul class="books">${AR_RECON.map((g) =>
    `<li><a href="#arr-${g.id}" data-scroll="arr-${g.id}"><span>${esc(g.topic)}</span><span>${g.items.length}</span></a></li>`).join("")}
    <li><a href="#arr-taylor" data-scroll="arr-taylor"><span>Taylor</span></a></li></ul>
    <p class="note"><a href="#aristotle-plato">Aristotle on Plato</a></p>`;
  $("#main").innerHTML = `<div class="search guide ar-reconcile"><h2>Plato and Aristotle reconciled</h2>
    <p class="lead">The Platonist commentators read Aristotle as agreeing with Plato in the sense where he seems to oppose him in the words.
      Here they say so, in their own Greek, on the topics where the two seem furthest apart: the Forms, the soul, the eternity of the world,
      and God as maker. Each passage is quoted from the page of the Berlin edition as the Workshop has it, with the column of Aristotle it is on.</p>
    <p class="mod-label"><b>The English is the Workshop's own translation</b>, made for this page from the Greek quoted; it is not a published translation.</p>
    ${AR_RECON.map((g) => `<section id="arr-${g.id}"><h3>${esc(g.topic)}</h3>${g.items.map((it) => {
      const [tid, n, part] = it.src;
      return `<div class="ar-recon"><p><b>${esc(it.who)}</b>, <a href="#neo/${esc(tid)}/${part}/${encodeURIComponent(n)}">p. ${esc(n)}</a>,
        <span class="meta">${esc(it.where)}</span>${colLink(it.on)}</p>
        <blockquote lang="grc">${esc(it.grc)}</blockquote>
        <blockquote class="workshop-en">${esc(it.en)}</blockquote></div>`;
    }).join("")}</section>`).join("")}
    <section id="arr-taylor"><h3>Taylor</h3><p>Thomas Taylor sets out the same reading in his Dissertation on the Philosophy of Aristotle (1812):
      that Aristotle "differs from his divine master in appearance only, and not in reality". His passages on the Forms are on
      <a href="#aristotle">Start here for Aristotle</a>.</p></section>
    <p class="prov">The Greek from First1KGreek's text of the <i>Commentaria in Aristotelem Graeca</i> (CC BY-SA 4.0), as printed there
      (an editor's † or a misprint is kept and noted). A column given here is one the page is linked to by milestone A5, or the lemma the editor prints.</p>
  </div>`;
  window.scrollTo(0, 0);
}
