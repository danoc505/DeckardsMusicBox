// Milestone 17: key terms linked in the text, opening beside it, and the side panel as one place with tabs:
// Word, Term, Notes, Links, Your work. A key term is underlined in Burnet's Greek where GLAUx's lemma is the
// term's (for a very common word, only as a name with the article: τὸ ἕν), and in the English only where the
// Greek of the same section has it, or where a fixed phrase is printed ("the Good"). Tap one: the Term tab says
// what it is (Taylor, the Workshop's plain meaning, the definitions), every place it is marked in Plato by
// dialogue in the Platonist order, with ‹ › to walk through them, the key passages and the Platonists' readings.
// Nothing leaves the page being read; the concept index and Taylor's glossary open inside the panel too.
// Shares the globals of reader.js and the other files; loaded after concepts.js and guide.js, before shell.js.
"use strict";

const PANEL = { pane: "word", ref: null, term: null, cache: new Map(), back: [], list: null, page: null };
const PANES = [
  ["word", "Word", "The Greek word you tapped: its dictionary form, grammar and dictionary entries"],
  ["term", "Term", "The key term you tapped: what it means, and everywhere it is used"],
  ["notes", "Notes", "The commentators' notes on this section"],
  ["links", "Links", "What this section's notes cite, and the notes elsewhere that cite it"],
  ["mine", "Your work", "Your translations and notes on this section"],
];

const paneEl = (name) => document.getElementById("pane-" + name);

// Show one tab of the panel (and the panel itself, on a narrow screen).
function showPane(name, open = true) {
  PANEL.pane = name;
  document.querySelectorAll("#panel-tabs [data-pane]").forEach((b) => {
    const on = b.dataset.pane === name;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", String(on));
  });
  PANES.forEach(([n]) => { const el = paneEl(n); if (el) el.hidden = n !== name; });
  if (open) document.body.classList.add("inspecting");
  if (name === "notes" || name === "links" || name === "mine") renderSectionPane(name);
  if (name === "term" && !PANEL.term && !PANEL.page) renderTermList();
  const box = $("#inspector");
  if (box) box.scrollTop = 0;
}

// ------------------------------------------------------------------ Notes, Links, Your work: one section

// The section the panel speaks of: the one last tapped, or the first one in view.
function panelSection() {
  const d = state.data;
  if (!d || state.view !== "read") return null;
  const refs = d.sections.map((s) => s.ref);
  if (PANEL.ref && refs.includes(PANEL.ref)) return d.sections.find((s) => s.ref === PANEL.ref);
  if (state.target && refs.includes(state.target)) return d.sections.find((s) => s.ref === state.target);
  const top = ($(".bar") || { offsetHeight: 0 }).offsetHeight;
  const el = [...document.querySelectorAll("#main .sec")].find((s) => s.getBoundingClientRect().bottom > top + 40);
  return el ? d.sections.find((s) => s.ref === el.dataset.ref) : d.sections[0];
}

// A copy of what is printed under a section, without the ids the text itself uses.
const noIds = (h) => h.replace(/\sid="(cm|note|mine)-/g, ' data-copy-of="$1-');

function renderSectionPane(name) {
  const el = paneEl(name);
  if (!el) return;
  if (name === "mine" && MINE.editing) return;   // the editor is open there
  const s = panelSection();
  if (!s) { el.innerHTML = `<p class="meta">Open a dialogue in the Reader: this tab shows ${name === "notes" ? "the notes on" : name === "links" ? "the links of" : "your work on"} the section you are reading.</p>`; return; }
  const d = state.data;
  const refs = d.sections.map((x) => x.ref);
  const i = refs.indexOf(s.ref);
  const head = `<div class="pane-sec"><button type="button" class="link-btn" data-pane-sec="${esc(refs[i - 1] || "")}" ${i > 0 ? "" : "disabled"} aria-label="Previous section">‹</button>
    <b>${esc(state.work.title)} ${esc(s.ref)}</b>
    <button type="button" class="link-btn" data-pane-sec="${esc(refs[i + 1] || "")}" ${i + 1 < refs.length ? "" : "disabled"} aria-label="Next section">›</button>
    <span class="meta">${name === "notes" ? "the notes on this section" : name === "links" ? "what its notes cite, and what cites it" : "your work on this section"}</span></div>`;
  let body = "";
  if (name === "notes") {
    const numbers = new Map((d.shownNotes || d.notes).map((n, k) => [n.id, k + 1]));
    const loeb = (d.shownNotes || d.notes).filter((n) => n.start_ref === s.ref);
    body = (loeb.length ? `<h4 class="pane-h">Translators' notes</h4><ul class="notes">${loeb.map((n) => `<li><span class="n">${numbers.get(n.id)}</span>${n.body_html}
      <span class="meta"> · ${esc(n.commentator)}</span></li>`).join("")}</ul>` : "") + renderCommentaryRow(s, d);
    if (!body) body = `<p class="none-msg">No notes on ${esc(s.ref)}${commList().some((c) => !commShown(c.id)) ? " from the commentators shown (choose them above the text)" : ""}.</p>`;
  } else if (name === "links") {
    body = renderLinksOut(s, d) + renderLinksIn(s, d) || `<p class="none-msg">No note in the library cites ${esc(s.ref)}, and its notes cite nothing.</p>`;
  } else {
    body = renderMineRow(s, d);
  }
  el.innerHTML = head + `<div class="pane-body app">${noIds(body)}</div>`;
}

// ------------------------------------------------------------------ underlining (called by reader.js)

const termsOn = () => !document.body.classList.contains("no-terms");

// The class and attributes of a Greek word marked as a key term.
function termWordAttrs(tokId) {
  const ids = state.data && state.data.term_tokens && state.data.term_tokens[tokId];
  if (!ids) return "";
  const t = state.data.terms[ids[0]];
  return ` data-term="${esc(ids.join(" "))}" data-term-label="${esc(t ? t.label : ids[0])}"`;
}

const rxEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The English of a chunk with its key terms marked: the term's forms where the Greek beneath has it,
// and the fixed phrases anywhere, as printed.
function markEnglish(text, chunkId) {
  const d = state.data;
  if (!d || !d.terms || !text) return esc(text);
  const hits = [];
  const taken = (a, b) => hits.some((h) => a < h.end && b > h.start);
  for (const [phrase, id] of d.phrases || []) {
    const one = !/\s/.test(phrase);
    const rx = new RegExp(`(?<![\\p{L}\\p{N}])${rxEsc(phrase).replace(/ /g, "\\s+")}(?![\\p{L}\\p{N}])`, "gu");
    let m;
    while ((m = rx.exec(text))) {
      // A single capitalised word is a name only inside a sentence, not at its start.
      if (one && /(^|[.!?:;"“‘—]\s*)$/.test(text.slice(0, m.index))) continue;
      if (!taken(m.index, m.index + m[0].length)) hits.push({ start: m.index, end: m.index + m[0].length, id, how: "phrase" });
    }
  }
  const ids = (d.chunk_terms || {})[chunkId] || [];
  const forms = [];
  for (const id of ids) for (const f of (d.terms[id] || {}).forms || []) forms.push([f, id]);
  forms.sort((a, b) => b[0].length - a[0].length);
  if (forms.length) {
    const rx = new RegExp(`(?<![\\p{L}\\p{N}])(?:${forms.map(([f]) => rxEsc(f).replace(/ /g, "\\s+")).join("|")})(?:s|es)?(?![\\p{L}\\p{N}])`, "giu");
    let m;
    while ((m = rx.exec(text))) {
      const low = m[0].toLowerCase().replace(/\s+/g, " ");
      const hit = forms.find(([f]) => low === f || low === f + "s" || low === f + "es");
      if (hit && !taken(m.index, m.index + m[0].length)) hits.push({ start: m.index, end: m.index + m[0].length, id: hit[1], how: "form" });
    }
  }
  if (!hits.length) return esc(text);
  hits.sort((a, b) => a.start - b.start);
  let out = "", pos = 0;
  for (const h of hits) {
    const t = d.terms[h.id] || { label: h.id };
    out += esc(text.slice(pos, h.start)) + `<span class="tm-en" data-term="${esc(h.id)}" title="${esc(t.label || "")}: a key term${h.how === "form" ? " (the Greek of this passage has it)" : ""}. Tap for everywhere it is used">${esc(text.slice(h.start, h.end))}</span>`;
    pos = h.end;
  }
  return out + esc(text.slice(pos));
}

// ------------------------------------------------------------------ the Term tab

async function openTerm(id, opts = {}) {
  if (!opts.keepBack && PANEL.term && PANEL.term !== id) PANEL.back.push(PANEL.term);
  PANEL.term = id;
  PANEL.page = null;
  showPane("term");
  const el = paneEl("term");
  let t = PANEL.cache.get(id);
  if (!t) {
    el.innerHTML = `<p class="loading">…</p>`;
    try { t = await api(`term/${encodeURIComponent(id)}`); } catch (e) { el.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
    PANEL.cache.set(id, t);
  }
  if (PANEL.term !== id) return;
  renderTerm(t);
  if (opts.alsoIds && opts.alsoIds.length > 1) {
    const others = opts.alsoIds.filter((x) => x !== id);
    el.querySelector(".term-also").innerHTML = `This word is also marked as ${others.map((x) => `<button type="button" class="chip" data-term-open="${esc(x)}">${esc((state.data.terms[x] || {}).label || x)}</button>`).join(" ")}`;
  }
  markTermInText(id);
}

// The order the dialogues are read in (the Platonist order chosen in the Library), as work ids.
function readingOrder() {
  return workGroups().flatMap((g) => g.steps.map((s) => s.work));
}

// Every marked place, in the reading order: [[work, ref, n], ...].
function termPlaces(t) {
  const out = [];
  for (const w of readingOrder()) for (const [ref, n] of t.occurrences[w] || []) out.push([w, ref, n]);
  return out;
}

// Where the reader is now, as an index into the places: the last place at or before it, and the first after it.
function placeAround(places) {
  if (!state.work || state.view !== "read") return { prev: -1, next: places.length ? 0 : -1, here: -1 };
  const order = readingOrder();
  const wi = order.indexOf(WORK);
  const secs = state.work.sections;
  const cur = state.target || (state.data && state.data.sections[0].ref);
  const ci = secs.indexOf(cur);
  let prev = -1, next = -1, here = -1;
  places.forEach(([w, ref], k) => {
    const pw = order.indexOf(w);
    const cmp = pw !== wi ? pw - wi : secs.indexOf(ref) - ci;
    if (cmp === 0) here = k;
    if (cmp < 0) prev = k;
    if (cmp > 0 && next < 0) next = k;
  });
  return { prev, next, here };
}

function placeLabel(w, ref) {
  return `${w === WORK ? workAbbr(w) || workTitle(w) : workTitle(w)} ${ref}`;
}

function renderTerm(t) {
  const el = paneEl("term");
  const places = termPlaces(t);
  const at = placeAround(places);
  const step = (k, label, dir) => k >= 0
    ? `<a class="btn term-step" href="${esc(placeHash(places[k][0], places[k][1]))}" data-term-step="${esc(t.id)}" title="${dir} place it is used: ${esc(placeLabel(places[k][0], places[k][1]))}">${label} ${esc(placeLabel(places[k][0], places[k][1]))}</a>`
    : `<span class="btn term-step off">${label}</span>`;
  const glossary = (t.taylor || []).map((e) => `<blockquote class="gq">${esc(e.text)}${e.more && e.more.length ? e.more.map((m) => `<br>${esc(m)}`).join("") : ""}
      <cite>Taylor, <i>Explanation of Certain Platonic Terms</i> (1804), s.v. ${esc(e.head)}${e.source_title ? `, from ${esc(e.source_title)}` : ""}</cite></blockquote>`).join("");
  const c = t.concept;
  const rules = t.lemmas.map((l) => `<li><b lang="grc">${esc(l.lemma)}</b> ${l.rule === "all" ? `every word GLAUx tags with it` : l.rule === "with-article" ? `only as a name, neuter with the article (<span lang="grc">τὸ</span> …)` : `not underlined`}
      <span class="meta">(${(l.tagged || 0).toLocaleString()} in Plato)${l.why ? ": " + esc(l.why) : ""}</span></li>`).join("");
  const english = t.forms.filter((f) => f.kind === "english"), phrases = t.forms.filter((f) => f.kind === "phrase");
  const formSrc = (f) => `<li><b>${f.kind === "phrase" ? "“" + esc(f.form) + "”" : esc(f.form)}</b> ${f.auto ? `<span class="meta">(its name in the definition)</span>` : ""}
      <blockquote class="ev" lang="en">“${esc(f.quote)}” <span class="cite">${esc(f.cited_as || f.source_text)} ${f.found ? "" : `<span class="doubt-mark">not found</span>`}</span></blockquote></li>`;
  const order = readingOrder();
  const works = order.filter((w) => t.occurrences[w]);
  const occ = works.map((w) => {
    const refs = t.occurrences[w];
    const n = refs.reduce((a, [, k]) => a + k, 0);
    const cur = w === WORK && state.view === "read";
    const pageRefs = cur && state.data ? new Set(state.data.sections.map((s) => s.ref)) : new Set();
    return `<details class="term-work${cur ? " here" : ""}"${cur ? " open" : ""}><summary><b>${esc(workTitle(w))}</b> <span class="meta">${n.toLocaleString()} word${n === 1 ? "" : "s"} in ${refs.length} section${refs.length === 1 ? "" : "s"}</span></summary>
      <p class="term-refs">${refs.map(([ref, k]) => `<a href="${esc(placeHash(w, ref))}" data-term-step="${esc(t.id)}" class="${pageRefs.has(ref) ? "on-page" : ""}" title="${k} word${k === 1 ? "" : "s"}">${esc(ref)}</a>`).join(" ")}</p></details>`;
  }).join("");
  const passages = [
    ...(c ? c.passages.map((p) => ({ work: p.work_id, start: p.start_ref, end: p.end_ref, quote: p.quote, why: p.why, found: p.found })) : []),
    ...(t.extra.passages || []),
  ];
  const later = [...(c ? c.later : []).map((x) => ({ says: x.says, ev: x.evidence })), ...(t.extra.later || []).map((x) => ({ says: x.says, ev: [{ source_text: x.source, quote: x.quote, cited_as: x.cited_as, found: x.found, at: x.at, note_id: x.note_id }] }))];
  const allDefs = c ? c.definitions : [];
  const defs = t.plain ? allDefs : allDefs.slice(1);   // without a plain meaning, the first definition stands in its place
  const plainLabel = "The Workshop's plain meaning";
  el.innerHTML = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button>
    <div class="term-pane">
      ${PANEL.back.length ? `<button type="button" class="link-btn term-back" data-term-back>‹ ${esc(labelOf(PANEL.back[PANEL.back.length - 1]))}</button>` : ""}
      <h3 class="term-h">${esc(t.label)} ${t.greek ? `<span lang="grc" class="greek-name">${esc(t.greek)}</span>` : ""}</h3>
      <p class="term-also meta"></p>
      ${t.plain ? `<p class="term-plain"><span class="gq-tag own" title="Written for the Workshop, resting on the sources below">${plainLabel}</span> ${esc(t.plain)}</p>`
        : allDefs.length && allDefs[0].evidence.length ? `<p class="term-plain"><span class="gq-tag">Defined</span> “${esc(allDefs[0].evidence[0].quote)}” <span class="meta">${esc(allDefs[0].evidence[0].cited_as || allDefs[0].says)}</span></p>` : ""}
      ${glossary ? `<section><h4 class="pane-h">Taylor's explanation</h4>${glossary}<p class="meta"><button type="button" class="link-btn" data-panel-page="glossary" data-focus="${esc(t.glossary[0] || "")}">Taylor's whole glossary, here</button></p></section>` : ""}
      ${defs.length ? `<section><h4 class="pane-h">Definitions</h4>${defs.map((x) => `<div class="claim"><p>${esc(x.says)}</p>${x.evidence.map(conceptEv).join("")}</div>`).join("")}</section>` : ""}
      <section class="term-places"><h4 class="pane-h">Everywhere in Plato</h4>
        ${places.length ? `<p class="term-nav">${step(at.prev, "‹", "The previous")} ${step(at.next, "›", "The next")}</p>
          <p class="meta">${t.words.toLocaleString()} words marked in ${places.length.toLocaleString()} sections of ${works.length} ${works.length === 1 ? "dialogue" : "dialogues"}, listed in the order the dialogues are read
            (<a href="#library">${esc((GUIDE.order && (GUIDE.order.orders.find((o) => o.id === orderPref()) || {}).label) || "the Library's order")}</a>). ‹ › walk through them from where you are.</p>
          ${occ}` : `<p class="none-msg">${t.extra.not_underlined ? "Not underlined: " + esc(t.extra.not_underlined) + "." : t.key ? "No word of Plato's is marked as this term: it is the later Platonists' word." : "Not underlined in the text: only the Definitions define it."}</p>`}
        ${rules ? `<details><summary class="meta">Which words are marked</summary><ul class="term-rules">${rules}</ul>
          ${t.forms_marked.length ? `<p class="meta">Commonest forms: <span lang="grc">${t.forms_marked.map((f) => `${esc(f.form)} ${f.n}`).join(", ")}</span></p>` : ""}
          <p class="meta">In the English, the words below are underlined only where the Greek of the same passage has the term; the phrases in quotation marks wherever they are printed so.</p>
          ${english.length || phrases.length ? `<ul class="term-forms">${[...english, ...phrases].map(formSrc).join("")}</ul>` : ""}</details>` : ""}
      </section>
      ${passages.length ? `<section><h4 class="pane-h">Key passages</h4><ul class="concept-passages">${passages.map((p) => `<li><b>${esc(workTitle(p.work))}</b> ${refSpan(p.work, p.start, p.end)} ${esc(p.why)}
        <blockquote class="ev" lang="grc">“${esc(p.quote)}” ${p.found === false ? `<span class="doubt-mark">not found</span>` : ""}${enBtn(p.work, p.start)}</blockquote></li>`).join("")}</ul></section>` : ""}
      ${later.length ? `<section><h4 class="pane-h">What the Platonists say</h4>${later.map((x) => `<div class="claim"><p>${esc(x.says)}</p>${x.ev.map(conceptEv).join("")}</div>`).join("")}</section>` : ""}
      ${t.related_terms.length ? `<section><h4 class="pane-h">Related terms</h4><p class="chips">${t.related_terms.map((r) => `<button type="button" class="chip" data-term-open="${esc(r.id)}" title="${esc(r.why || "")}">${r.kind ? `<span class="meta">${esc(r.kind)}</span> ` : ""}${esc(r.label)}</button>`).join(" ")}</p></section>` : ""}
      ${t.shares_word.length ? `<p class="meta">Shares a Greek word with: ${t.shares_word.map((r) => `<button type="button" class="link-btn" data-term-open="${esc(r.id)}">${esc(r.label)}</button> (<span lang="grc">${esc(r.lemma)}</span>)`).join(", ")}</p>` : ""}
      <p class="meta term-foot">${c ? `<button type="button" class="link-btn" data-panel-page="concept" data-id="${esc(c.id)}">The whole entry in the concept index, here</button> · <a href="#concepts/${esc(c.id)}">as a page</a> · ` : ""}
        <button type="button" class="link-btn" data-term-list>All key terms</button> · Gathered from ${esc(t.origin.map((o) => ORIGIN[o] || o).join(", ") || "the term list")}.</p>
    </div>`;
}

function labelOf(id) {
  const t = PANEL.cache.get(id);
  return t ? t.label : id;
}

// Flash the words of the term on the page being read.
function markTermInText(id) {
  document.querySelectorAll(".tm-on").forEach((e) => e.classList.remove("tm-on"));
  if (!id) return;
  document.querySelectorAll(`#main [data-term]`).forEach((e) => { if (e.dataset.term.split(" ").includes(id)) e.classList.add("tm-on"); });
}

// The Term tab with no term chosen: the key terms on this page, and all of them.
async function renderTermList() {
  const el = paneEl("term");
  PANEL.term = null;
  PANEL.page = null;
  markTermInText(null);
  const d = state.data;
  const here = new Map();
  if (d && state.view === "read" && d.term_tokens) {
    for (const ids of Object.values(d.term_tokens)) for (const id of ids) here.set(id, (here.get(id) || 0) + 1);
  }
  el.innerHTML = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button><div class="term-pane">
    <h3 class="term-h">Key terms</h3>
    <p class="meta">The words of Plato and the Platonists that are underlined in the text. Tap one there, or here, to see what it means and every place it is used.</p>
    ${here.size ? `<h4 class="pane-h">On this page</h4><p class="chips">${[...here].sort((a, b) => b[1] - a[1]).map(([id, n]) => `<button type="button" class="chip" data-term-open="${esc(id)}">${esc((d.terms[id] || {}).label || id)} <span class="meta">${n}</span></button>`).join(" ")}</p>` : ""}
    <h4 class="pane-h">All key terms</h4><div id="term-all"><p class="loading">…</p></div></div>`;
  if (!PANEL.list) { try { PANEL.list = await api("terms"); } catch (e) { $("#term-all").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; } }
  const box = $("#term-all");
  if (!box) return;
  const key = PANEL.list.terms.filter((t) => t.key);
  box.innerHTML = `<p class="chips">${key.map((t) => `<button type="button" class="chip" data-term-open="${esc(t.id)}" title="${esc(t.plain || "")}">${esc(t.label)}${t.n ? ` <span class="meta">${t.n.toLocaleString()}</span>` : ""}</button>`).join(" ")}</p>
    <p class="meta">${PANEL.list.terms.length - key.length} more terms, those only the Definitions define (day, bone, festival), are not underlined; they open from the word box.
      The list and its sources: <code>sources/terms/terms.json</code>, <code>reports/terms.md</code>.</p>`;
}

// ------------------------------------------------------------------ full pages inside the panel

async function openPanelPage(kind, arg) {
  const el = paneEl("term");
  if (PANEL.term) PANEL.back.push(PANEL.term);
  PANEL.page = kind;
  showPane("term");
  el.innerHTML = `<p class="loading">…</p>`;
  const back = PANEL.term ? `<button type="button" class="link-btn term-back" data-term-back>‹ ${esc(labelOf(PANEL.term))}</button>` : "";
  try {
    if (kind === "concept") {
      const c = await api(`concept/${encodeURIComponent(arg)}`);
      el.innerHTML = `<button class="insp-close" aria-label="Close">×</button>${back}<div class="panel-page">${conceptHtml(c)}</div>`;
    } else if (kind === "glossary") {
      if (!GUIDE.glossary) GUIDE.glossary = await api("taylor/platonic-terms");
      el.innerHTML = `<button class="insp-close" aria-label="Close">×</button>${back}<div class="panel-page">${glossaryHtml(GUIDE.glossary)}</div>`;
      const f = arg && document.querySelector(`#pane-term [id="gl-${CSS.escape(arg)}"]`);
      if (f) { f.scrollIntoView({ block: "start" }); f.classList.add("flash"); }
    }
  } catch (e) {
    el.innerHTML = `${back}<p class="error">${esc(e.message)}</p>`;
  }
}

// ------------------------------------------------------------------ events

document.addEventListener("click", (ev) => {
  const tab = ev.target.closest("#panel-tabs [data-pane]");
  if (tab) { ev.preventDefault(); showPane(tab.dataset.pane); return; }
  const sec = ev.target.closest("[data-pane-sec]");
  if (sec) { if (sec.dataset.paneSec) { PANEL.ref = sec.dataset.paneSec; renderSectionPane(PANEL.pane); } return; }
  const en = ev.target.closest(".tm-en");
  if (en && termsOn() && !window.getSelection()?.toString()) {
    ev.preventDefault();
    const s = en.closest(".sec");
    if (s) PANEL.ref = s.dataset.ref;
    openTerm(en.dataset.term);
    return;
  }
  const op = ev.target.closest("[data-term-open]");
  if (op) { ev.preventDefault(); openTerm(op.dataset.termOpen); return; }
  if (ev.target.closest("[data-term-back]")) {
    const id = PANEL.back.pop();
    if (id) { PANEL.term = null; openTerm(id, { keepBack: true }); } else renderTermList();
    return;
  }
  if (ev.target.closest("[data-term-list]")) { PANEL.back = PANEL.term ? [...PANEL.back, PANEL.term] : PANEL.back; renderTermList(); return; }
  const pg = ev.target.closest("[data-panel-page]");
  if (pg) { ev.preventDefault(); openPanelPage(pg.dataset.panelPage, pg.dataset.id || pg.dataset.focus); return; }
  if (ev.target.closest("#pane-term a[href='#concepts']") && state.view === "read") { ev.preventDefault(); renderTermList(); return; }
  // Inside the panel, a concept or a glossary link opens there, not in place of the text.
  const a = ev.target.closest("#pane-term a[href^='#concepts/'], #pane-word a[href^='#concepts/']");
  if (a && state.view === "read") {
    ev.preventDefault();
    openTerm(decodeURIComponent(a.getAttribute("href").slice(10)));   // every concept of the index is a term
    return;
  }
  const gl = ev.target.closest("#pane-term [data-scroll]");
  if (gl) { ev.preventDefault(); document.getElementById(gl.dataset.scroll)?.scrollIntoView({ block: "start" }); }
});

// A tap on a section number makes it the panel's section.
document.addEventListener("click", (ev) => {
  const r = ev.target.closest("#main .ref");
  if (r) { PANEL.ref = r.closest(".sec").dataset.ref; if (["notes", "links", "mine"].includes(PANEL.pane)) renderSectionPane(PANEL.pane); }
});

// Moving within a page (a section, or the next place of a term on the same page) draws no new page:
// the panel follows the address instead.
window.addEventListener("hashchange", () => setTimeout(() => {
  if (state.view !== "read" || !state.data) return;
  if (state.target) PANEL.ref = state.target;
  if (PANEL.term && PANEL.cache.has(PANEL.term) && !PANEL.page) { renderTerm(PANEL.cache.get(PANEL.term)); markTermInText(PANEL.term); }
  if (["notes", "links", "mine"].includes(PANEL.pane)) renderSectionPane(PANEL.pane);
}, 60));

// After a page is drawn: the panel's section, the term's place in the walk, and its words on the page.
function panelAfterRender() {
  PANEL.ref = state.target || null;
  if (["notes", "links", "mine"].includes(PANEL.pane)) renderSectionPane(PANEL.pane);
  if (PANEL.term && PANEL.cache.has(PANEL.term) && !PANEL.page) { renderTerm(PANEL.cache.get(PANEL.term)); markTermInText(PANEL.term); }
  else if (PANEL.pane === "term" && !PANEL.term && !PANEL.page) renderTermList();
}
