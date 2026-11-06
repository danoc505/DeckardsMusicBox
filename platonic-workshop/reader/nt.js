// Platonic Workshop: the Greek New Testament (milestone 23), on its own shelf beside Plato.
// The books open in the same reader as the dialogues (reader.js): the Greek of the SBLGNT with
// every word tapped for MorphGNT's dictionary form and grammar, and the American Standard
// Version (1901) beside it. Here: the shelf in the Library, the books in the picker, the head
// of a book, its contents column, and the New Testament part of a word box and a term.
// Loaded after reader.js, search.js and terms.js; shares their globals.
"use strict";

const NT = { data: null, asked: null };

function loadNT() {
  if (!NT.asked) NT.asked = api("nt").then((d) => { NT.data = d; return d; }).catch(() => { NT.asked = null; return null; });
  return NT.asked;
}

const ntWorks = () => state.works.filter((w) => w.imported && isNT(w));
const ntCount = () => ntWorks().length;
const ntBook = (id) => ((NT.data && NT.data.books) || []).find((b) => b.work === id);

// The three groups of the shelf, in the order of the books. The build names each book's group;
// before it answers, the books are grouped by their place in the canon.
function ntGroups() {
  const out = [];
  for (const w of ntWorks()) {
    const n = parseInt(w.id.slice(2), 10);
    const g = (ntBook(w.id) || {}).group || (n <= 5 ? "Gospels and Acts" : n <= 18 ? "Paul's letters" : "Other letters and Revelation");
    let last = out[out.length - 1];
    if (!last || last.label !== g) out.push(last = { label: g, works: [] });
    last.works.push(w);
  }
  return out;
}

const NT_ABOUT = `The Greek New Testament is a different body of writing from Plato's: written about four hundred years after him,
  in the common Greek (Koine) of the Roman empire, by other hands and for other ends. It is here because the Platonists and the
  Christians read each other, and its words (λόγος, νοῦς, ψυχή) are Plato's words, though they need not mean the same thing.`;

function ntSources() {
  return `<p class="prov">Greek: <i>The SBL Greek New Testament</i>, ed. Michael W. Holmes (Society of Biblical Literature and Logos Bible Software, 2010),
    under the Creative Commons Attribution 4.0 licence. Scripture quotations marked SBLGNT are from the SBL Greek New Testament, copyright © 2010 Society of
    Biblical Literature and Logos Bible Software. Every word's dictionary form and grammar: MorphGNT (J. K. Tauber, ed., <i>MorphGNT: SBLGNT Edition</i>),
    under the Creative Commons Attribution-ShareAlike 3.0 licence. English: the American Standard Version (1901), public domain, as eBible.org prints it.
    The small marks of the SBLGNT's list of variant readings (⸀ ⸂ ⸃) are left out, since the list itself is not here.</p>`;
}

// ------------------------------------------------------------------ the Library's shelf

function ntShelf() {
  const groups = ntGroups();
  if (!groups.length) return "";
  const s = NT.data && NT.data.stats;
  return `<section id="lib-nt"><h3>The Greek New Testament</h3>
    <p class="meta">${NT_ABOUT}</p>
    <p class="meta">The Greek with the American Standard Version (1901) beside it, verse by verse. Tap any Greek word for its dictionary form,
      its grammar and its dictionary entries, as in Plato; the Platonists' key terms are underlined, and a term's panel shows it in Plato and here.
      ${s ? `${s.words.toLocaleString()} Greek words in ${s.verses.toLocaleString()} verses.` : ""}</p>
    <div class="lib-grid">${groups.map((g) => `<section><h4>${esc(g.label)}</h4><ul>${g.works.map((w) => {
      const b = ntBook(w.id);
      return `<li><a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a>${b ? ` <span class="meta">${esc(b.plain)}</span>` : ""}</li>`;
    }).join("")}</ul></section>`).join("")}</div>
    <p class="meta">Search a Greek word across the New Testament in the <a href="#search?q=%CE%BB%CF%8C%CE%B3%CE%BF%CF%82&by=lemma&corpus=nt">Concordance</a>
      (choose <em>New Testament</em> there).</p>
    ${ntSources()}</section>`;
}

// ------------------------------------------------------------------ the picker

function ntPicker(filter) {
  const q = (filter || "").trim().toLowerCase();
  const places = placesGet();
  let h = "";
  for (const g of ntGroups()) {
    const ws = g.works.filter((w) => !q || w.title.toLowerCase().includes(q) || (w.abbr || "").toLowerCase().includes(q) || g.label.toLowerCase().includes(q));
    if (!ws.length) continue;
    h += `<section class="tp-group"><h3>${esc(g.label)}</h3><div class="tp-works">${ws.map((w) => {
      const here = state.work && state.work.id === w.id;
      const at = places[w.id];
      return `<button type="button" class="tp-work${here ? " here" : ""}" data-open-work="${esc(w.id)}"${here ? ' aria-current="true"' : ""}>
        <b>${esc(w.title)}</b><span class="tp-at">${here ? "Reading now" : at ? `Go on from ${esc(at)}` : "From the start"}</span></button>`;
    }).join("")}</div></section>`;
  }
  return h ? `<section class="tp-dialogues tp-nt"><h3>The Greek New Testament</h3><p class="meta">A different corpus from Plato's, written four centuries later.</p>${h}</section>` : "";
}

// ------------------------------------------------------------------ in the reader

// At the head of a book's first chapter: what it is, and how to read it.
function ntHead(w) {
  const b = ntBook(w.id);
  return `<div class="nt-head page-note"><p><b>${esc(b ? b.plain : w.title)}.</b> ${NT_ABOUT}</p>
    <p class="meta">Tap a Greek word for its dictionary form and grammar (from MorphGNT, edited by scholars) and its dictionary entries.
      Underlined words are the Platonists' key terms: tap one to see where Plato uses it too. Select Greek words to write your own translation, as in Plato.</p></div>`;
}

// The contents column of a book: its chapters (reader.js), the other books, and the sources.
function renderTocNT(w) {
  const groups = ntGroups();
  return `<h3>The books</h3>${groups.map((g) => `<p class="meta">${esc(g.label)}</p><ul class="books">${g.works.map((x) =>
    `<li class="${x.id === w.id ? "here" : ""}"><a href="#${esc(x.slug)}"><span>${esc(x.title)}</span></a></li>`).join("")}</ul>`).join("")}
    <p class="note"><a href="#library">The Library</a> · <a href="${esc(`#search?q=&by=lemma&corpus=nt`)}">Search the New Testament</a></p>
    <details class="note"><summary>About this text</summary>${ntSources()}</details>`;
}

// ------------------------------------------------------------------ the word box and the term

// "In the New Testament" in a word box of Plato's, or "In Plato" in one of the New Testament's: the other corpus.
function renderOtherCorpus(t) {
  const list = t.corpus === "nt" ? t.elsewhere : t.elsewhere_nt;
  if (!list || !list.length || !list.some((e) => e.total)) return "";
  const toNT = t.corpus !== "nt";
  return `<div class="box elsewhere other-corpus"><h3>${toNT ? "In the New Testament" : "In Plato"} <span class="badge" title="Another body of writing">another corpus</span></h3>${list.filter((e) => e.total).map((e) => {
    const top = e.counts.slice(0, 5);
    return `<p><span class="lemma" lang="grc">${esc(e.lemma)}</span>: <b>${fmt(e.total)}</b>× in ${e.works} ${toNT ? `of the 27 books of the New Testament` : `of the 36 works of Plato`}${e.matched && e.matched !== "same spelling" ? ` <span class="meta">(matched by ${esc(e.matched)})</span>` : ""}.
      <button class="link-btn" data-search-q="${esc(e.lemma)}" data-search-by="lemma" data-search-corpus="${toNT ? "nt" : "plato"}">Every occurrence</button></p>
      <p class="meta">${top.map((c) => `${esc(c.title)} ${fmt(c.n)}`).join(" · ")}</p>`;
  }).join("")}<p class="prov">${toNT ? "Counted from MorphGNT's dictionary forms." : "Counted from GLAUx's dictionary forms."}
    ${toNT ? "The New Testament was written four centuries after Plato, in the common Greek; the same word need not mean the same thing." : "Plato wrote four centuries before the New Testament; the same word need not mean the same thing."}</p></div>`;
}

// The New Testament part of a term's panel (terms.js).
function ntTermSection(t) {
  const n = t.nt;
  if (!n || !n.words) return "";
  const books = n.books.slice().sort((a, b) => a.work_id.localeCompare(b.work_id));
  return `<section class="term-places term-nt"><h4 class="pane-h">In the New Testament <span class="badge" title="Another body of writing">another corpus</span></h4>
    <p class="meta">${n.words.toLocaleString()} words marked in ${books.length} of the 27 books. ${esc(n.about)}</p>
    ${books.map((b) => {
      const refs = n.occurrences[b.work_id] || [];
      const cur = b.work_id === WORK && state.view === "read";
      return `<details class="term-work${cur ? " here" : ""}"${cur ? " open" : ""}><summary><b>${esc(b.title)}</b> <span class="meta">${b.n.toLocaleString()} word${b.n === 1 ? "" : "s"} in ${refs.length} verse${refs.length === 1 ? "" : "s"}</span></summary>
        <p class="term-refs">${refs.map(([ref, k]) => `<a href="${esc(placeHash(b.work_id, ref))}" data-term-step="${esc(t.id)}" title="${k} word${k === 1 ? "" : "s"}">${esc(ref)}</a>`).join(" ")}</p></details>`;
    }).join("")}
    ${n.forms_marked.length ? `<p class="meta">Commonest forms there: <span lang="grc">${n.forms_marked.map((f) => `${esc(f.form)} ${f.n}`).join(", ")}</span></p>` : ""}</section>`;
}

loadNT();
