// Milestone 10: the concept index across the dialogues (#concepts, #concepts/the-good).
// Every link here rests on quoted words, shown with where they are and whether the build found them.
// The words a concept is indexed under are shown as words (where they occur), never as links between
// the places they occur; notes that name a concept on its passages are marked as found by rule.
"use strict";

const CONCEPTS = { list: null, one: null };
const LAYER = {
  "plato": ["Plato", "Plato names it and argues about it in the dialogues."],
  "plato-later": ["Plato, systematised later", "Plato names it; its place in an ordered system of principles is the later Platonists'."],
  "later": ["Later Platonist", "A doctrine of the later Platonists. Plato does not name it: the passages are those the later readers read it in, and say who reads them so."],
};
const layerBadge = (l) => `<span class="layer layer-${esc(l)}" title="${esc(LAYER[l][1])}">${esc(LAYER[l][0])}</span>`;

// One quotation: Burnet's Greek, an ancient text, Taylor's Platonic terms, or a note in the library.
function conceptEv(e) {
  if (e.source_text === "note") {
    const lang = /[Ͱ-Ͽἀ-῿]/.test(e.quote) ? "grc" : "en";
    const where = e.note_id ? `<button type="button" class="link-btn" data-note-full="${e.note_id}" title="Read the whole note">${esc(e.cited_as)}</button>` : esc(e.cited_as);
    return `<blockquote class="ev" lang="${lang}">“${esc(e.quote)}” <span class="cite">${where} ${evFound(e)}</span></blockquote>`;
  }
  if (e.source_text === "taylor-terms") {
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
  let h = `<div class="search concepts">
    <h2>Concepts across the dialogues</h2>
    <p class="prov">Twenty-five Platonic concepts, each gathered from the places it is argued, the ancient definitions, the later Platonists' readings, and the other concepts it stands in relation to.
      Every link rests on quoted words, shown with where they are; nothing is linked because two places share a word.
      ${stats ? `${(stats["quotations found"] || 0).toLocaleString()} of ${(stats.quotations || 0).toLocaleString()} quotations were found in the texts they are said to be in (<code>reports/concepts.md</code>).` : ""}</p>
    <p class="meta">${Object.entries(LAYER).map(([k, [, about]]) => `${layerBadge(k)} ${esc(about)}`).join("<br>")}</p>
    <table class="counts concept-table"><thead><tr><th>Concept</th><th>Greek</th><th>Layer</th><th>Indexed under</th><th class="num">Passages</th><th>In</th><th>Related</th></tr></thead><tbody>`;
  for (const c of concepts) {
    h += `<tr><td><a href="#concepts/${esc(c.id)}"><b>${esc(c.label)}</b></a></td><td lang="grc">${esc(c.greek)}</td><td>${layerBadge(c.layer)}</td>
      <td lang="grc">${c.terms.map((t) => esc(t.lemma)).join(", ") || `<span class="meta">no word of Plato's</span>`}</td>
      <td class="num">${c.passages}</td><td class="meta">${c.works.map((w) => esc(w.title)).join(", ")}</td>
      <td class="meta">${c.related.map((r) => `${esc(r.kind)} <a href="#concepts/${esc(r.other_id)}">${esc(label.get(r.other_id))}</a>`).join("; ")}</td></tr>`;
  }
  $("#main").innerHTML = h + `</tbody></table></div>`;
}

function termHtml(t) {
  const max = Math.max(1, ...t.by_work.map((w) => w.n));
  const rows = t.by_work.map((w) => `<tr><td><a href="#search?q=${encodeURIComponent(t.lemma)}&by=lemma&works=${esc(w.work_id)}">${esc(w.title)}</a></td>
    <td class="num">${w.n}</td><td class="bar-cell"><span class="bar" style="width:${Math.max(2, Math.round(100 * w.n / max))}%"></span></td></tr>`).join("");
  return `<div class="claim"><p><b lang="grc">${esc(t.lemma)}</b> <span class="meta">${t.occurrences.toLocaleString()} words in ${t.works} works${t.broad ? "; mostly the ordinary word" : ""}</span>
      <a href="#search?q=${encodeURIComponent(t.lemma)}&by=lemma">Every occurrence</a></p>
    ${t.note ? `<p class="meta">${esc(t.note)}</p>` : ""}
    <details><summary class="meta">Where the word occurs, by dialogue</summary><table class="counts dist"><tbody>${rows}</tbody></table></details></div>`;
}

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
  const c = CONCEPTS.one;
  let h = `<div class="search concepts concept">
    <p class="meta"><a href="#concepts">‹ All concepts</a></p>
    <h2>${esc(c.label)} <span lang="grc" class="greek-name">${esc(c.greek)}</span></h2>
    <p>${layerBadge(c.layer)} <span class="meta">${esc(LAYER[c.layer][1])}</span></p>
    <p class="prov"><b>The index's note</b> (the Workshop's own words, saying what is gathered here; not a definition): ${esc(c.note)}</p>`;
  h += `<section><h3>Indexed under</h3><p class="meta">Lexical evidence: the words, and where GLAUx tags them. A word in two places does not link the places.</p>
    ${c.terms.length ? c.terms.map(termHtml).join("") : `<p class="none-msg">No word of Plato's: this is a later doctrine, and its later word (<span lang="grc">${esc(c.greek)}</span>) is not Plato's.</p>`}</section>`;
  if (c.definitions.length) h += `<section><h3>Definitions</h3>${c.definitions.map(citeHtml).join("")}</section>`;
  h += `<section><h3>${c.layer === "later" ? "The passages it is read in" : "In Plato"}</h3><ul class="concept-passages">${c.passages.map((p) => passageHtml(p, c)).join("")}</ul></section>`;
  if (c.later.length) h += `<section><h3>In the later Platonists</h3>${c.later.map(citeHtml).join("")}</section>`;
  if (c.related.length || c.related_from.length) {
    h += `<section><h3>Related concepts</h3>${c.related.map((r) => `<div class="claim"><p><b>${esc(r.kind)}</b> <a href="#concepts/${esc(r.other_id)}">${esc(r.other_label)}</a>: ${esc(r.why)}</p>${r.evidence.map(conceptEv).join("")}</div>`).join("")}
      ${c.related_from.length ? `<p class="meta">Stated from the other side (the words are on their pages): ${c.related_from.map((r) => `<a href="#concepts/${esc(r.concept_id)}">${esc(r.label)}</a> ${esc(r.kind)} this`).join("; ")}.</p>` : ""}</section>`;
  }
  $("#main").innerHTML = h + `</div>`;
}

function renderConceptToc(id) {
  const list = CONCEPTS.list.concepts;
  $("#toc").innerHTML = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to the ${esc(state.work ? state.work.title : "text")}</a></p>
    <h3>Concepts</h3><ul class="studies">${list.map((c) => `<li class="${c.id === id ? "here" : ""}"><a href="#concepts/${esc(c.id)}">${esc(c.label)}</a></li>`).join("")}</ul>`;
}

// In the word inspector: the concepts indexed under this word's lemma.
function renderConceptsForWord(t) {
  if (!t.concepts || !t.concepts.length) return "";
  return `<div class="box concepts-box"><h3>In the concept index</h3><p>${t.concepts.map((c) => `<a href="#concepts/${esc(c.id)}">${esc(c.label)}</a>`).join(", ")}</p>
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
