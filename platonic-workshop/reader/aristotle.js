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
};

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
    (Commentaria in Aristotelem Graeca IV.1, Berlin, 1887) in First1KGreek's TEI (CC BY-SA 4.0).</p>`;
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
    <p><a href="#aristotle"><b>Start here: Aristotle as the Platonists read him</b></a> <span class="meta">The order they read his works in, the end they lead to, and where he agrees with Plato, each in Taylor's words.</span></p>
    <ul class="studies">${ws.map((w) => `<li><a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a> <span class="meta">${esc(AR_PLAIN[w.id] || "")}</span></li>`).join("")}</ul>
    <h4>The door to the logic</h4>
    <ul class="studies">
      <li><a href="#taylor/porphyry-introduction"><b>Porphyry's Introduction (Isagoge)</b></a> (Owen's English, 1853) <span class="meta">The five words the Categories takes for granted: genus, species, difference, property, accident. The Platonists read it before any Aristotle. The Greek (Busse, 1887) is <a href="#neo/porphyry-isagoge">on the Neoplatonists' shelf</a>.</span></li>
    </ul>
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
    <p class="meta">Bekker's numbers: 980a is page 980 of Bekker's Berlin edition (1831), left column; every book on Aristotle cites him so.
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
  let h = `<h3>Chapters</h3>`;
  for (const [b, cs] of byBook) {
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
      return `<details class="term-work${cur ? " here" : ""}"${cur ? " open" : ""}><summary><b>${esc(b.title)}</b> <span class="meta">${b.n.toLocaleString()} word${b.n === 1 ? "" : "s"} in ${refs.length} column${refs.length === 1 ? "" : "s"}</span></summary>
        <p class="term-refs">${refs.map(([ref, k]) => `<a href="${esc(placeHash(b.work_id, ref))}" data-term-step="${esc(t.id)}" title="${k} word${k === 1 ? "" : "s"}">${esc(ref)}</a>`).join(" ")}</p></details>`;
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
  { step: "Physics", taylor: "theoretic: physical", note: "\"The knowledge of natural things\", ending in the soul.",
    works: [["ar031", "Physics"], ["ar005", "On the Heavens"], ["ar013", "On Generation and Corruption"], ["ar026", "Meteorology"], ["ar002", "On the Soul"]] },
  { step: "Theology", taylor: "theoretic: theological", note: "\"Those luminous beings, which have a supernatural subsistence\".",
    works: [["ar025", "Metaphysics"]] },
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
    <ol class="ar-order">${AR_ORDER.map((g) => `<li><b>${esc(g.step)}</b> <span class="meta">(Taylor's ${esc(g.taylor)})${g.note ? " " + esc(g.note) : ""}</span><br>
      ${g.door ? `<a href="#taylor/${AR_ISAGOGE}">Porphyry's Introduction</a> <span class="meta">(Owen, 1853; the Greek is <a href="#neo/porphyry-isagoge">here</a>)</span> → ` : ""}${g.works.map(([id, title]) => have.has(id) ? `<a href="#${esc(have.get(id).slug)}">${esc(title)}</a>` : `<span class="ar-later" title="Not yet in the Workshop">${esc(title)}</span>`).join(" · ")}</li>`).join("")}
      <li><b>Plato</b> <span class="meta">The greater mysteries:</span> <a href="#start">Start here for Plato</a>, the dialogues in the order of Iamblichus.</li></ol>
    <h3 id="ar-way">How he writes</h3>
    ${arQuote("diction")}
    <h3 id="ar-plato">Aristotle and Plato</h3>
    ${arQuote("ideas")}
    ${arQuote("hostility")}
    ${arQuote("names")}
    <p class="meta">Where Aristotle argues against the Forms in the Metaphysics, Taylor's notes under his translation answer from Syrianus;
      show <em>Taylor (1801)</em> beside the Greek of <a href="#metaphysics/987a">Book Α</a> or <a href="#metaphysics/1076a">Book Μ</a>.</p>
    <p class="prov">Taylor's Dissertation is read from the Internet Archive's scan of the Harvard copy (public domain), its OCR cleaned by rule
      and not proofread; the passages above were checked by eye against the scan. Marinus from Project Gutenberg's text of Taylor's 1816 volume.</p>
  </div>`;
  window.scrollTo(0, 0);
}
