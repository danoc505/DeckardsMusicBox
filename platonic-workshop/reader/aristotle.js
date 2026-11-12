// Platonic Workshop: Aristotle (Aristotle milestone A1), on his own shelf beside Plato.
// The works open in the same reader as the dialogues (reader.js): Ross's and Bywater's Greek with every word
// tapped for GLAUx's dictionary form and grammar, the Loeb English beside it, and the older translations
// (Ross 1908, Taylor 1801, Chase 1847) beside that, at Bekker's pages and columns (980a). Here: the shelf in
// the Library, the works in the picker, the head of a work, its contents column, and Aristotle's part of a term.
// Loaded after reader.js, search.js, terms.js and nt.js; shares their globals.
"use strict";

const arWorks = () => state.works.filter((w) => w.imported && isAR(w));

const AR_ABOUT = `Aristotle studied in Plato's Academy for twenty years. The later Platonists put his works first in their
  course of reading, as the way up to Plato's, and Thomas Taylor translated all of them (1806–1812) with notes from the Greek
  commentators. Where Aristotle argues against the Forms, Taylor answers from Syrianus and Proclus: "Perhaps his design in this
  opposition was to lead the reader into all the mysteries of this doctrine" (Taylor, Introduction to the Metaphysics, 1801).`;

const AR_PLAIN = {
  ar025: "First philosophy: being as being, substance, actuality, and the unmoved mover, the intellect that thinks itself (Book Λ). Books Α, Μ and Ν argue against Plato's Forms and numbers; Taylor answers from Syrianus.",
  ar010: "The good for man, the virtues of character and of intellect, friendship, pleasure, and the life of contemplation as the most divine (Book X).",
};

function arSources() {
  return `<p class="prov">Greek: Ross's Metaphysics (Oxford, 1924) and Bywater's Nicomachean Ethics (Oxford, 1894), as the Perseus Digital Library
    encodes them (CC BY-SA 4.0), with Bekker's pages and columns. Every word's dictionary form and grammar: the GLAUx corpus (Keersmaekers, 2021;
    CC BY-SA 4.0), tagged by machine. English: the Loeb translations of the same Perseus files (Tredennick, 1933–35; Rackham, 1926), at Bekker's
    columns; W. D. Ross's Oxford translation (1908) and Thomas Taylor's (1801) from the Internet Archive's scans, cleaned by rule and not proofread,
    Ross where he prints Bekker's columns and the rest placed by the Workshop's alignment (≈); D. P. Chase's Ethics (1847) from Project Gutenberg (≈).</p>`;
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
    <ul class="studies">${ws.map((w) => `<li><a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a> <span class="meta">${esc(AR_PLAIN[w.id] || "")}</span></li>`).join("")}</ul>
    <h4>Taylor on the Metaphysics</h4>
    <ul class="studies">
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
    const b = c.label.split(", chapter")[0];
    if (!byBook.has(b)) byBook.set(b, []);
    byBook.get(b).push(c);
  }
  let h = `<h3>Chapters</h3>`;
  for (const [b, cs] of byBook) {
    const open = cs.some(inside);
    h += `<details class="ar-book"${open ? " open" : ""}><summary>${esc(b)}</summary><ul class="books">${cs.map((c) =>
      `<li class="${inside(c) ? "here" : ""}"><a href="${esc(placeHash(WORK, c.start_ref))}" title="${esc(c.basis)}"><span>ch. ${esc(c.label.split("chapter ")[1])}</span><span>${esc(c.start_ref)}–${esc(c.end_ref)}</span></a></li>`).join("")}</ul></details>`;
  }
  h += `<h3>Aristotle</h3><ul class="books">${arWorks().map((x) =>
    `<li class="${x.id === w.id ? "here" : ""}"><a href="#${esc(x.slug)}"><span>${esc(x.title)}</span></a></li>`).join("")}</ul>
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
