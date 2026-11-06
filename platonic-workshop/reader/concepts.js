// Milestone 10: the concept index across the dialogues (#concepts, #concepts/the-good).
// Every link here rests on quoted words, shown with where they are and whether the build found them.
// The words a concept is indexed under are shown as words (where they occur), never as links between
// the places they occur; notes that name a concept on its passages are marked as found by rule.
"use strict";

const CONCEPTS = { list: null, one: null };
const LAYER = {
  "plato": ["Plato", "Plato names it and argues about it in the dialogues."],
  "plato-later": ["Plato, systematised later", "Plato names it; its place in an ordered system of principles is the later Platonists'."],
  "later": ["Later Platonist", "A doctrine or term of the later Platonists. Plato does not name it: the passages are those the later readers read it in, and say who reads them so."],
  "academy": ["Plato's school", "Defined in the Definitions, the collection from Plato's school printed with his works; not a dialogue."],
};
const ORIGIN = { "index": "written for the index", "Definitions": "the Definitions", "Taylor's terms": "Taylor's Platonic terms", "later Platonists": "the later Platonists", "Alcinous": "Alcinous' handbook", "scholia": "the Greek scholia" };
const CFILTER = { q: "", layer: "" };
const layerBadge = (l) => `<span class="layer layer-${esc(l)}" title="${esc(LAYER[l][1])}">${esc(LAYER[l][0])}</span>`;

// One quotation: Burnet's Greek, an ancient text, Taylor's Platonic terms, or a note in the library.
function conceptEv(e) {
  if (e.source_text === "note") {
    const lang = /[Ͱ-Ͽἀ-῿]/.test(e.quote) ? "grc" : "en";
    const where = e.note_id ? `<button type="button" class="link-btn" data-note-full="${e.note_id}" title="Read the whole note">${esc(e.cited_as)}</button>` : esc(e.cited_as);
    return `<blockquote class="ev" lang="${lang}">“${esc(e.quote)}” <span class="cite">${where} ${evFound(e)}</span></blockquote>`;
  }
  if (e.source_text === "taylor-terms" || /-taylor-18/.test(e.source_text)) {
    return `<blockquote class="ev" lang="en">“${esc(e.quote)}” <span class="cite">${esc(e.cited_as)} ${evFound(e)}</span></blockquote>`;
  }
  return evidenceHtml(e);
}

async function showConcepts(id) {
  state.view = "concepts";
  setView("concepts-view");
  if (!CONCEPTS.list) {
    $("#main").innerHTML = `<p class="loading">Opening the concept index…</p>`;
    try { CONCEPTS.list = await api("concepts"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  if (id) {
    $("#main").innerHTML = `<p class="loading">…</p>`;
    try { CONCEPTS.one = await api(`concept/${encodeURIComponent(id)}`); } catch (e) { $("#main").innerHTML = `<p class="error">No concept “${esc(id)}” in the index.</p>`; return; }
    document.title = `${CONCEPTS.one.label} · Concepts · Platonic Workshop`;
    renderConcept();
  } else {
    document.title = "Concepts · Platonic Workshop";
    renderConceptIndex();
  }
  renderConceptToc(id);
  window.scrollTo(0, 0);
}

function renderConceptIndex() {
  const { concepts, stats } = CONCEPTS.list;
  const label = new Map(concepts.map((c) => [c.id, c.label]));
  const { words, categories } = CONCEPTS.list;
  const from = (o) => o.map((x) => ORIGIN[x] || x).join(", ");
  let h = `<div class="search concepts">
    <h2>Concepts across the dialogues</h2>
    <p class="prov">${concepts.length} concepts: the foundational ones written for the index, each gathered from the places it is argued, and every term the sources themselves define,
      the Definitions of Plato's school (in Hermann's Greek and Burges' English) and Taylor's Platonic terms, with the readings of the later Platonists (Alcinous, Plotinus, Proclus, Iamblichus, Taylor).
      Every link rests on quoted words, shown with where they are; nothing is linked because two places share a word.
      ${stats ? `${(stats["quotations found"] || 0).toLocaleString()} of ${(stats.quotations || 0).toLocaleString()} quotations were found in the texts they are said to be in (<code>reports/concepts.md</code>).` : ""}</p>
    <p class="meta">${Object.entries(LAYER).map(([k, [, about]]) => `${layerBadge(k)} ${esc(about)}`).join("<br>")}</p>
    <form class="concept-filter" onsubmit="return false"><label>Find <input type="search" id="concept-q" value="${esc(CFILTER.q)}" placeholder="name, Greek or English"></label>
      <label title="Scholars: layer">Whose idea <select id="concept-layer"><option value="">all</option>${Object.entries(LAYER).map(([k, [n]]) => `<option value="${k}" ${CFILTER.layer === k ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label></form>
    <table class="counts concept-table"><thead><tr><th>Concept</th><th>Greek</th><th title="Whose idea it is: Plato's own, systematised later, a later doctrine, or defined in his school (scholars: layer)">Whose idea</th><th title="The Greek words it is indexed under, by dictionary form">Greek words</th><th class="num">Definitions</th><th class="num">Passages</th><th class="num">Later readings</th><th class="num">Related</th></tr></thead><tbody>`;
  const q = CFILTER.q.toLowerCase();
  const plainGk = (x) => (x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const c of concepts) {
    if (CFILTER.layer && c.layer !== CFILTER.layer) continue;
    if (q && !(c.label.toLowerCase().includes(q) || plainGk(c.greek).includes(plainGk(q)) || c.terms.some((t) => plainGk(t.lemma).includes(plainGk(q))))) continue;
    h += `<tr><td><a href="#concepts/${esc(c.id)}"><b>${esc(c.label)}</b></a></td><td lang="grc">${esc(c.greek)}</td><td>${layerBadge(c.layer)}</td>
      <td lang="grc">${c.terms.map((t) => esc(t.lemma)).join(", ") || `<span class="meta">no word of Plato's</span>`}</td>
      <td class="num">${c.definitions}</td><td class="num" title="${esc(c.works.map((w) => w.title).join(", "))}">${c.passages}</td><td class="num">${c.later}</td>
      <td class="num" title="${esc(c.related.map((r) => r.kind + " " + (label.get(r.other_id) || r.other_id)).join("; "))}">${c.related.length}</td></tr>`;
  }
  h += `</tbody></table>
    <section><h3>Words across the translators</h3><p class="prov">${esc("How each translator renders a word, passage by passage: every place the word is tagged, with the Greek and each English translation of that section. The English is not aligned word by word, so the whole passage is shown.")}
      The six the build prompt names come first.</p>
      <p>${words.map((w) => `<a href="#renderings/${encodeURIComponent(w.lemma)}" lang="grc" class="${w.named ? "named-word" : ""}">${esc(w.lemma)}</a> <span class="meta">${(w.n || 0).toLocaleString()}</span>`).join(" · ")}</p></section>
    <section><h3>Kinds of relation</h3><table class="counts"><tbody>${categories.map((k) => `<tr><td><b>${esc(k.name)}</b></td><td class="meta">${esc(k.about)}</td><td class="num">${k.n}</td></tr>`).join("")}</tbody></table></section></div>`;
  $("#main").innerHTML = h;
}

function termHtml(t) {
  const max = Math.max(1, ...t.by_work.map((w) => w.n));
  const rows = t.by_work.map((w) => `<tr><td><a href="#search?q=${encodeURIComponent(t.lemma)}&by=lemma&works=${esc(w.work_id)}">${esc(w.title)}</a></td>
    <td class="num">${w.n}</td><td class="bar-cell"><span class="bar" style="width:${Math.max(2, Math.round(100 * w.n / max))}%"></span></td></tr>`).join("");
  return `<div class="claim"><p><b lang="grc">${esc(t.lemma)}</b> <span class="meta">${t.occurrences.toLocaleString()} words in ${t.works} works${t.broad ? "; mostly the ordinary word" : ""}</span>
      <a href="#search?q=${encodeURIComponent(t.lemma)}&by=lemma">Every occurrence</a></p>
    ${t.note ? `<p class="meta">${esc(t.note)}</p>` : ""}
    <p><a href="#renderings/${encodeURIComponent(t.lemma)}">How the translators render it, passage by passage</a></p>
    <details><summary class="meta">Where the word occurs, by dialogue</summary><table class="counts dist"><tbody>${rows}</tbody></table></details>
    ${lsjHtml(t)}</div>`;
}

// LSJ's own citations of Plato for the word: its sense, its English, the place and the Greek it quotes there.
// LSJ often adapts a quotation (case, order, a word left out), so "word for word" is checked, not assumed.
function lsjHtml(t) {
  const xs = t.lsj || [];
  const full = `<details class="lsj-full" data-lemma="${esc(t.lemma)}"><summary class="meta">The whole entry in LSJ and Middle Liddell</summary><div class="dict-body"></div></details>`;
  if (!xs.length) return full;
  const exact = xs.filter((x) => x.found === 1).length, quoted = xs.filter((x) => x.quote).length;
  const mark = (x) => x.found === 1 ? `<span class="ok" title="Word for word in Burnet at the place, or the next two sections">✓</span>`
    : x.found === 0 ? `<span class="meta" title="Not word for word in Burnet there: LSJ adapts its quotations">(adapted)</span>` : "";
  let last = null;
  const li = xs.map((x) => {
    const head = x.sense !== last ? `<li class="lsj-sense"><b>${esc(x.sense || "—")}</b> ${esc(x.gloss)}</li>` : "";
    last = x.sense;
    return head + `<li><a href="${esc(placeHash(x.work_id, x.ref))}">${esc(x.title)} ${esc(x.ref)}</a>${x.quote ? ` <span lang="grc">${esc(x.quote)}</span> ${mark(x)}${enBtn(x.work_id, x.ref)}` : ""}</li>`;
  }).join("");
  return `<details><summary class="meta">LSJ cites ${xs.length} places of Plato for it (${quoted} quoted, ${exact} word for word in Burnet)</summary>
    <p class="prov">From LSJ's entry, as printed: its sense numbers, its English, the places it cites. Nothing added.</p><ul class="lsj-cites">${li}</ul></details>${full}`;
}

document.addEventListener("toggle", async (ev) => {
  const d = ev.target;
  if (!d.classList || !d.classList.contains("lsj-full") || !d.open || d.dataset.loaded) return;
  d.dataset.loaded = "1";
  const data = await api(`lookup/${encodeURIComponent(d.dataset.lemma)}`);
  const lx = await api("lexica");
  d.querySelector(".dict-body").innerHTML = lx.map((l) => (data.entries[l.id] || []).map((e) => `<div class="entry"><p class="meta">${esc(l.label)}</p>${e.html}</div>`).join("")).join("")
    || `<p class="none-msg">No entry found.</p>`;
}, true);

function citeHtml(x) {
  return `<div class="claim"><p>${esc(x.says)}</p>${x.evidence.map(conceptEv).join("")}</div>`;
}

function passageHtml(p, c) {
  return `<li><b>${esc(p.title)}</b> ${refSpan(p.work_id, p.start_ref, p.end_ref)} <span class="meta" title="Where it ends is chosen by hand">(end by hand)</span> ${esc(p.why)}
    ${evidenceHtml({ source_text: "plato", work_id: p.work_id, at: p.start_ref, quote: p.quote, found: p.found })}
    ${p.read_by ? `<p class="meta">A later reading of the passage, as read by:</p>${p.read_by_evidence.map(conceptEv).join("")}` : ""}
    ${p.named.length ? `<details><summary class="meta">Notes on the passage naming it (${p.named.length}, found by rule: a note placed here that uses one of the words “${esc([...(c.keywords.en || []), ...(c.keywords.grc || [])].join("”, “"))}”)</summary>
      <ul>${p.named.map((n) => `<li><button type="button" class="link-btn" data-note-full="${n.note_id}">${esc(shortWho(n.commentator))} ${esc(n.start_ref)}</button> <span class="meta">(“${esc(n.word)}”)</span> ${esc(n.excerpt)}</li>`).join("")}</ul></details>` : ""}</li>`;
}

function renderConcept() {
  $("#main").innerHTML = conceptHtml(CONCEPTS.one);
}

// One concept's page, as HTML: in place of the text (#concepts/the-good), or inside the side panel (terms.js).
function conceptHtml(c) {
  let h = `<div class="search concepts concept">
    <p class="meta"><a href="#concepts">‹ All concepts</a></p>
    <h2>${esc(c.label)} <span lang="grc" class="greek-name">${esc(c.greek)}</span></h2>
    <p>${layerBadge(c.layer)} <span class="meta">${esc(LAYER[c.layer][1])} Gathered from ${esc(c.origin.map((x) => ORIGIN[x] || x).join(", "))}.</span></p>
    <p class="prov"><b>The index's note</b> (the Workshop's own words, saying what is gathered here; not a definition): ${esc(c.note)}</p>`;
  h += `<section><h3>Indexed under</h3><p class="meta">Lexical evidence: the words, and where GLAUx tags them. A word in two places does not link the places.</p>
    ${c.terms.length ? c.terms.map(termHtml).join("") : ""}
    ${c.untagged.length ? `<p class="meta">Not found as a dictionary form anywhere in Plato (a later word, or one the GLAUx program files otherwise): <span lang="grc">${c.untagged.map(esc).join(", ")}</span>.</p>`
      : !c.terms.length ? `<p class="none-msg">No word of Plato's${c.greek ? ` (<span lang="grc">${esc(c.greek)}</span> is the later word)` : ""}.</p>` : ""}</section>`;
  if (c.definitions.length) h += `<section><h3>Definitions</h3>${c.definitions.map(citeHtml).join("")}</section>`;
  if (c.passages.length) h += `<section><h3>${c.layer === "later" ? "The passages it is read in" : "In Plato"}</h3><ul class="concept-passages">${c.passages.map((p) => passageHtml(p, c)).join("")}</ul></section>`;
  if (c.later.length) h += `<section><h3>In the later Platonists</h3>${c.later.map(citeHtml).join("")}</section>`;
  if (c.related.length || c.related_from.length) {
    h += `<section><h3>Related concepts</h3>${c.related.map((r) => `<div class="claim"><p><span class="rel-cat">${esc(r.category)}</span> <b>${esc(r.kind)}</b> <a href="#concepts/${esc(r.other_id)}">${esc(r.other_label)}</a>: ${esc(r.why)}</p>${r.evidence.map(conceptEv).join("")}</div>`).join("")}
      ${c.related_from.length ? `<p class="meta">Stated from the other side (the words are on their pages): ${c.related_from.map((r) => `<a href="#concepts/${esc(r.concept_id)}">${esc(r.label)}</a> ${esc(r.kind)} this (${esc(r.category)})`).join("; ")}.</p>` : ""}</section>`;
  }
  return h + `</div>`;
}

function renderConceptToc(id) {
  const list = CONCEPTS.list.concepts;
  $("#toc").innerHTML = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to the ${esc(state.work ? state.work.title : "text")}</a></p>
    <h3>Concepts</h3><ul class="studies">${list.map((c) => `<li class="${c.id === id ? "here" : ""}"><a href="#concepts/${esc(c.id)}">${esc(c.label)}</a></li>`).join("")}</ul>`;
}

// In the word inspector: the key terms this word is marked as (milestone 17), and the concepts indexed under its lemma.
function renderConceptsForWord(t) {
  const marked = (t.terms || []).filter((x) => x.marked);
  const terms = marked.length ? `<div class="box concepts-box"><h3>A key term here</h3><p>${marked.map((x) => `<button type="button" class="chip" data-term-open="${esc(x.id)}">${esc(x.label)}</button>`).join(" ")}</p>
    <p class="prov">Underlined in the text. Tap for what it means and every place it is used (the Term tab).</p></div>` : "";
  if (!t.concepts || !t.concepts.length) return terms;
  return terms + `<div class="box concepts-box"><h3>In the concept index</h3><p>${t.concepts.map((c) => `<a href="#concepts/${esc(c.id)}" title="Opens in the Term tab">${esc(c.label)}</a>`).join(", ")}</p>
    <p class="prov">The index lists <span lang="grc">${esc(t.concepts[0].lemma)}</span> among the words of ${t.concepts.length > 1 ? "these concepts" : "this concept"}. That is the word, not this place: this occurrence may be the ordinary sense${t.concepts.some((c) => c.broad) ? " (most are)" : ""}.</p></div>`;
}

// In "where you are in the whole": the concept passages on this page.
function renderTocConcepts(w, inside) {
  const cs = (w.concepts || []).filter((c) => inside(c.start_ref, c.end_ref));
  return cs.map((c) => `<p class="note">Concept: <a href="#concepts/${esc(c.id)}">${esc(c.label)}</a> (${esc(c.start_ref)}${c.end_ref !== c.start_ref ? "–" + esc(c.end_ref) : ""})${c.read_by ? ` <span class="meta">as read later</span>` : ""}</p>`).join("");
}

document.addEventListener("click", (ev) => {
  if (ev.target.closest("#concepts-btn")) location.hash = "concepts";
});

// How the translators render a word (#renderings/ψυχή, #renderings/ψυχή?work=tlg004).
async function showRenderings(hash) {
  state.view = "concepts";
  setView("concepts-view");
  const [lemma, qs] = hash.split("?");
  const p = new URLSearchParams(qs || "");
  const work = p.get("work") || "";
  CONCEPTS.lemma = lemma;
  const after = +(p.get("after") || 0);
  $("#main").innerHTML = `<p class="loading">Gathering the translations…</p>`;
  let r;
  try { r = await api(`renderings/${encodeURIComponent(lemma)}?after=${after}&limit=10` + (work ? `&work=${work}` : "")); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  document.title = `${lemma} in the translators · Platonic Workshop`;
  const link = (o) => `#renderings/${encodeURIComponent(lemma)}?` + new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();
  const mark = (g, forms) => forms.reduce((acc, f) => acc.split(f).join(`\u0001${f}\u0002`), g);
  let h = `<div class="search concepts renderings"><p class="meta"><a href="#concepts">‹ All concepts</a></p>
    <h2>How the translators render <span lang="grc">${esc(lemma)}</span></h2>
    <p class="prov">Every place GLAUx tags the word (${r.words.toLocaleString()} words in ${r.works} ${r.works === 1 ? "work" : "works"}), with the Greek section and each English translation of it.
      Passage by passage: the English is not aligned to the Greek word by word, so read the whole passage to see how each translator renders the word. Where a translation's sections are computed, it says so.
      ${r.concepts.length ? `In the concept index: ${r.concepts.map((c) => `<a href="#concepts/${esc(c.id)}">${esc(c.label)}</a>`).join(", ")}.` : ""}</p>
    <form onsubmit="return false"><label>Dialogue <select id="rend-work">${[`<option value="">all</option>`, ...r.by_work.map((w) => `<option value="${esc(w.work_id)}" ${w.work_id === work ? "selected" : ""}>${esc(w.title)} (${w.n})</option>`)].join("")}</select></label></form>`;
  for (const pl of r.places) {
    const g = esc(mark(pl.greek, pl.forms)).replace(/\u0001/g, "<mark>").replace(/\u0002/g, "</mark>");
    h += `<div class="claim rendering"><p><b>${esc(pl.title)} <a href="${esc(placeHash(pl.work_id, pl.ref))}">${esc(pl.ref)}</a></b> <span class="meta" lang="grc">${pl.forms.map(esc).join(", ")}</span></p>
      <p lang="grc" class="rend-greek">${g}</p>
      ${pl.english.length ? pl.english.map((e) => `<div class="rend-eng"><p class="meta"><b>${esc(e.translator || e.responsible || e.label)}</b>, ${esc(e.label)}${e.section_ref !== pl.ref || e.end_ref ? ` · passage ${esc(e.section_ref)}${e.end_ref ? "–" + esc(e.end_ref) : ""}` : ""}${e.align_method && e.align_method !== "printed" ? ` · <span title="How this translation's Stephanus sections were found">${esc(e.align_method)}</span>` : ""}</p><p lang="en">${esc(e.text)}</p></div>`).join("")
        : `<p class="none-msg">No English translation of this section in the library.</p>`}</div>`;
  }
  h += `<p>${after ? `<a href="${esc(link({ work, after: Math.max(0, after - 10) }))}">‹ Earlier places</a>` : ""} ${r.next !== null ? `<a href="${esc(link({ work, after: r.next }))}">Later places ›</a>` : ""}</p></div>`;
  $("#main").innerHTML = h;
  if (!CONCEPTS.list) { try { CONCEPTS.list = await api("concepts"); } catch (e) { return; } }
  renderConceptToc(null);
  window.scrollTo(0, 0);
}

document.addEventListener("input", (ev) => {
  if (ev.target.id === "concept-q") { CFILTER.q = ev.target.value; const pos = ev.target.selectionStart; renderConceptIndex(); const i = $("#concept-q"); i.focus(); i.setSelectionRange(pos, pos); }
});
document.addEventListener("change", (ev) => {
  if (ev.target.id === "concept-layer") { CFILTER.layer = ev.target.value; renderConceptIndex(); }
  else if (ev.target.id === "rend-work") location.hash = `renderings/${encodeURIComponent(CONCEPTS.lemma)}` + (ev.target.value ? `?work=${ev.target.value}` : "");
});
