// Milestone 24: the Workshop's own modern English of Taylor's General Introduction and of Olympiodorus'
// Life of Plato, beside the old text (sources/translations/modern, tools/modern.py). Each paragraph reads in
// short modern sentences, with a summary at the head of each section; Taylor's own words are one tap away,
// or side by side; the key words are underlined and open the Term tab. Every version is labelled as the
// Workshop's and machine-assisted, and a hard or disputed place carries a flag with Taylor's words.
// "Mark a sentence" keeps a sentence that reads badly or seems wrong in your own database, for revision.
// Shares the globals of reader.js and guide.js; terms.js opens the Term tab.
"use strict";

const MODERN = { t: null, marks: [], mode: null, marking: null, picked: null };
const MODERN_MODES = [["modern", "Modern English", "The modern version, with Taylor's words under each paragraph when you tap"],
  ["both", "Side by side", "The modern version and Taylor's words together, paragraph by paragraph"]];
// The sentences of a paragraph, split as tools/modern.py splits them (sentences()): after . ! ? and any
// closing quotation mark or bracket, before a capital or a figure; and at every line break (verse).
const MODERN_SENT = /([.!?]["”’)\]]?)\s+(?=["“‘(\[]?[A-Z0-9])/;

function modernSentences(text) {
  const out = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(MODERN_SENT);
    let cur = "";
    parts.forEach((x, k) => {
      cur += x;
      if (k % 2 === 1) { out.push(cur); cur = ""; }
    });
    if (cur.trim()) out.push(cur);
  }
  return out;
}

const rxModern = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The first place in a paragraph each linked key word is used: [start, end, term id], not overlapping.
function modernLinks(text, links) {
  const hits = [];
  for (const l of links) {
    for (const f of l.forms) {
      const m = new RegExp(`(^|[^\\w-])(${rxModern(f)}(?:s|es)?)(?![\\w-])`).exec(text);
      if (!m) continue;
      const a = m.index + m[1].length, b = a + m[2].length;
      if (!hits.some((h) => a < h[1] && b > h[0])) { hits.push([a, b, l.term]); break; }
    }
  }
  return hits.sort((x, y) => x[0] - y[0]);
}

function modernTermLabel(id) {
  const t = (PANEL.list && PANEL.list.terms.find((x) => x.id === id)) || null;
  return t ? t.label : id.replace(/-/g, " ");
}

// One sentence, with its key words underlined; `at` is where it starts in the paragraph.
function modernSentenceHtml(s, at, hits) {
  let h = "", pos = 0;
  for (const [a0, b0, id] of hits) {
    const a = a0 - at, b = b0 - at;
    if (a < pos || b > s.length) continue;
    h += esc(s.slice(pos, a)) + `<span class="tm-en" data-term="${esc(id)}" title="A key term: tap for what it means and everywhere it is used">${esc(s.slice(a, b))}</span>`;
    pos = b;
  }
  return h + esc(s.slice(pos));
}

function modernMarkOf(seg, sentence) {
  return MODERN.marks.find((m) => m.para === seg && m.sentence === sentence) || null;
}

function modernParaHtml(p) {
  const hits = modernLinks(p.modern, MODERN.t.modern.links || []);
  let pos = 0;
  const lines = p.modern.split("\n").length > 1;
  const sents = modernSentences(p.modern).map((s, k) => {
    const at = p.modern.indexOf(s, pos);
    pos = at + s.length;
    const mk = modernMarkOf(p.seg, s);
    const brk = lines && k > 0 && /\n\s*$/.test(p.modern.slice(0, at)) ? "<br>" : " ";
    return `${k ? brk : ""}<span class="ms${mk ? " ms-marked" : ""}" data-k="${k}"${mk ? ` title="You marked this: ${esc(mk.kind)}${mk.comment ? " (" + esc(mk.comment) + ")" : ""}"` : ""}>${modernSentenceHtml(s, at, hits)}</span>`;
  }).join("");
  return sents;
}

function modernTaylorHtml(s, notes, flags) {
  const tag = s.kind === "quotation" ? "blockquote" : s.kind === "table" ? "pre" : "p";
  let body = s.kind === "table" ? esc(s.text) : withNoteMarks(s, notes);
  for (const f of flags || []) {
    const w = esc(f.taylor);
    if (body.includes(w)) body = body.replace(w, `<mark class="mp-fl" title="${esc(f.why)}">${w}</mark>`);
  }
  let h = `<${tag} class="tt-${esc(s.kind)}">${body}</${tag}>`;
  const ns = (s.notes || []).map((x) => notes.get(x.note)).filter(Boolean);
  if (ns.length) {
    h += `<div class="tt-notes">${ns.map((n) => `<p class="tt-note" id="tn-${esc(n.id)}"><b>${esc(n.printed_number || "")}</b> ${esc(n.text)}
      ${greekOnly(n.text) ? `<span class="gq-tag" title="This note is in Greek; Taylor often gives his English of it in the paragraph above">Greek only</span>` : ""}</p>`).join("")}</div>`;
  }
  return h;
}

function modernGreekHtml(p) {
  if (!p.greek) return "";
  return `<details class="mp-greek"><summary>Olympiodorus' Greek</summary>
    <p lang="grc">${esc(p.greek)}</p>
    <p class="meta">${esc(MODERN.t.modern.greek_source)}: shown as the scan was read, page headings and misreadings included.</p></details>`;
}

function modernBlock(p, segs, notes) {
  const s = segs.get(p.seg);
  const flags = (p.flags || []).map((f) => `<div class="mp-flag"><b>⚑ ${p.extra ? "Note" : "Hard or disputed"}</b> ${esc(f.why)}
      ${p.extra ? "" : `<div class="meta">Taylor's words: “${esc(f.taylor)}”</div>`}</div>`).join("");
  const pnotes = (p.notes || []).map((n) => `<p class="meta mp-note">${esc(n)}</p>`).join("");
  const page = s && s.page_1804 ? `<span class="page-1804" title="Page of the 1804 edition">p. ${esc(s.page_1804)}</span> ` : "";
  const quote = s && s.kind === "quotation" ? " mp-quote" : "";
  return `<div class="mp${p.extra ? " mp-extra" : ""}" id="mp-${esc(p.seg)}" data-seg="${esc(p.seg)}">
    <div class="mp-mod${quote}">${p.extra ? `<span class="mp-tag">Not in Taylor</span> ` : ""}<p class="mp-text">${modernParaHtml(p)}</p>${flags}${pnotes}
      <div class="mp-tools">${s ? `<button type="button" class="link-btn mp-show" data-mp-taylor aria-expanded="false">Taylor's words</button>` : ""}
        <button type="button" class="link-btn" data-mp-mark>Mark a sentence</button></div>
      <div class="mp-markbox" hidden></div>
      ${p.extra ? modernGreekHtml(p) : ""}</div>
    ${s ? `<div class="mp-tay"><div class="mp-tay-h">${page}Taylor, 1804</div>${modernTaylorHtml(s, notes, p.flags)}${modernGreekHtml(p)}</div>` : ""}
  </div>`;
}

function modernTocHtml() {
  const t = MODERN.t, m = t.modern;
  const marks = MODERN.marks;
  return `<p><a href="#library">‹ Library</a></p><h3>${esc(t.title)}</h3>
    <p class="meta">${m.paragraphs.length} paragraphs, in modern English beside Taylor's.</p>
    <h4 class="pane-h">Sections</h4>
    <ol class="mod-secs">${m.sections.map((s) => `<li><a href="#ms-${esc(s.id)}" data-scroll="ms-${esc(s.id)}">${esc(s.title)}</a></li>`).join("")}</ol>
    <h4 class="pane-h">Your marks${marks.length ? ` (${marks.length})` : ""}</h4>
    ${marks.length ? `<ul class="mod-marks">${marks.map((mk) => `<li><a href="#mp-${esc(mk.para)}" data-scroll="mp-${esc(mk.para)}"><b>${esc(mk.kind)}</b></a>${mk.changed ? ` <span class="meta">(revised since)</span>` : ""}: ${esc(mk.sentence.length > 90 ? mk.sentence.slice(0, 88) + "…" : mk.sentence)}</li>`).join("")}</ul>
      <p class="meta">Kept in your own database for revision, and in the export of <a href="#mine">Your work</a>.</p>`
      : `<p class="meta">None yet. If a sentence reads badly or seems wrong, tap “Mark a sentence” under its paragraph.</p>`}`;
}

function modernRender() {
  const t = MODERN.t, m = t.modern;
  const notes = new Map(t.notes.map((n) => [n.id, n]));
  const segs = new Map(t.segments.filter((s) => s.part === "text").map((s) => [s.id, s]));
  const firsts = new Map(m.sections.map((s) => [s.first, s]));
  const mode = MODERN.mode;
  let h = `<div class="search guide taylor-text modern-text mod-${mode}"><h2>${esc(t.title)}</h2>
    <p class="lead">${esc(t.about)}</p>
    <div class="mod-label" role="note"><b>Modern English, the Workshop's own</b>
      <span class="mod-badge" title="Drafted with an AI model and not yet checked by a scholar">machine-assisted</span>
      <p>${esc(m.label)} ${m.made_from === "greek" ? "Made from Olympiodorus' Greek, checked against Taylor's translation." : "Made from Taylor's English."}
        Tap “Mark a sentence” under a paragraph if a sentence reads badly or seems wrong: your marks are kept for revision.</p>
      <details><summary>About this version</summary><p>${esc(m.about)}</p>
        <p class="meta">Master copy: <code>${esc(m.source)}</code>; the checks: <code>reports/modern.md</code>. Taylor's text: ${esc(t.edition)}, from <a href="${esc(t.source.url)}" target="_blank" rel="noopener">theosophylib.com</a>.</p></details>
      <div class="mod-modes" role="group" aria-label="What to show">${MODERN_MODES.map(([k, l, title]) => `<button type="button" class="chip${k === mode ? " on" : ""}" data-mod-mode="${k}" aria-pressed="${k === mode}" title="${esc(title)}">${esc(l)}</button>`).join("")}</div>
    </div>`;
  for (const p of m.paragraphs) {
    const sec = firsts.get(p.p) || firsts.get(p.seg);
    if (sec) h += `<h3 class="ms-h" id="ms-${esc(sec.id)}">${esc(sec.title)}</h3><div class="ms-sum"><b>In short</b> ${esc(sec.summary)}</div>`;
    h += modernBlock(p, segs, notes);
  }
  $("#main").innerHTML = h + `</div>`;
  $("#toc").innerHTML = modernTocHtml();
}

async function showModernText(id, t) {
  state.view = "taylor";
  setView("modern-view");
  document.body.classList.add("guide-view");
  MODERN.t = t;
  MODERN.toc = null;
  MODERN.marks = t.modern_marks || [];
  MODERN.mode = prefsGet("modernMode", "modern");
  if (!MODERN_MODES.some(([k]) => k === MODERN.mode)) MODERN.mode = "modern";
  document.title = `${t.title} · Platonic Workshop`;
  modernRender();
  window.scrollTo(0, 0);
  // The Term tab is where the underlined words open: have it ready, without opening the panel on a narrow screen.
  if (typeof showPane === "function" && PANEL.pane !== "term") showPane("term", false);
  if (!PANEL.list) { try { PANEL.list = await api("terms"); } catch (e) { /* the labels fall back to the ids */ } }
}

// ------------------------------------------------------------------ marking a sentence

function modernMarkBox(block, k) {
  const p = MODERN.t.modern.paragraphs.find((x) => x.seg === block.dataset.seg);
  const s = modernSentences(p.modern)[k];
  const mk = modernMarkOf(p.seg, s);
  MODERN.picked = { seg: p.seg, sentence: s };
  block.querySelectorAll(".ms").forEach((e) => e.classList.toggle("ms-picked", +e.dataset.k === k));
  const box = block.querySelector(".mp-markbox");
  box.hidden = false;
  box.innerHTML = `<p class="mk-q">“${esc(s)}”</p>
    ${mk ? `<p class="meta">You marked this ${esc(mk.saved_at.slice(0, 10))}: <b>${esc(mk.kind)}</b>${mk.comment ? ` (${esc(mk.comment)})` : ""}.</p>` : ""}
    <label class="mk-l">What is wrong with it? (optional)<input type="text" class="mk-comment" value="${esc((mk && mk.comment) || "")}" placeholder="A better wording, or what seems wrong"></label>
    <div class="mk-actions"><button type="button" class="chip" data-mk-save="reads badly">Reads badly</button>
      <button type="button" class="chip" data-mk-save="seems wrong">Seems wrong</button>
      ${mk ? `<button type="button" class="link-btn" data-mk-save="withdrawn">Take my mark back</button>` : ""}
      <button type="button" class="link-btn" data-mk-cancel>Cancel</button></div>`;
  box.querySelector(".mk-comment").focus({ preventScroll: true });
}

function modernStopMarking(block) {
  MODERN.marking = null;
  MODERN.picked = null;
  if (!block) return;
  block.classList.remove("marking");
  block.querySelectorAll(".ms-picked").forEach((e) => e.classList.remove("ms-picked"));
  const box = block.querySelector(".mp-markbox");
  box.hidden = true;
  box.innerHTML = "";
  const b = block.querySelector("[data-mp-mark]");
  if (b) b.textContent = "Mark a sentence";
}

async function modernSave(block, kind) {
  const pick = MODERN.picked;
  if (!pick) return;
  const comment = block.querySelector(".mk-comment")?.value || "";
  try {
    const r = await send("POST", "modern-marks", { text: MODERN.t.modern.text, para: pick.seg, sentence: pick.sentence, kind, comment });
    MODERN.marks = r.marks;
  } catch (e) {
    alert(`Not saved: ${e.message}`);
    return;
  }
  modernStopMarking(block);
  const p = MODERN.t.modern.paragraphs.find((x) => x.seg === pick.seg);
  block.querySelector(".mp-text").innerHTML = modernParaHtml(p);
  if (MODERN.toc) MODERN.toc(); else $("#toc").innerHTML = modernTocHtml();
  if (typeof toast === "function") toast(kind === "withdrawn" ? "Your mark is taken back." : "Marked, and kept for revision.");
}

document.addEventListener("click", (ev) => {
  // The modern versions: milestone 24's (the modern view) and milestone 27's, in the Neoplatonists' reader (neo.js).
  if (!MODERN.t || !ev.target.closest(".modern-text")) return;
  const t = ev.target;
  const mode = t.closest("[data-mod-mode]");
  if (mode) {
    MODERN.mode = mode.dataset.modMode;
    prefsSet("modernMode", MODERN.mode);
    const y = window.scrollY;
    modernRender();
    window.scrollTo(0, y);
    return;
  }
  const block = t.closest(".mp");
  if (!block) return;
  if (t.closest("[data-mp-taylor]")) {
    const b = t.closest("[data-mp-taylor]");
    const open = block.classList.toggle("open");
    b.setAttribute("aria-expanded", String(open));
    b.textContent = open ? "Hide Taylor's words" : "Taylor's words";
    return;
  }
  if (t.closest("[data-mp-mark]")) {
    const on = !block.classList.contains("marking");
    document.querySelectorAll(".mp.marking").forEach((b) => modernStopMarking(b));
    if (on) {
      block.classList.add("marking");
      MODERN.marking = block.dataset.seg;
      t.closest("[data-mp-mark]").textContent = "Tap the sentence (or here to stop)";
    }
    return;
  }
  const sv = t.closest("[data-mk-save]");
  if (sv) { modernSave(block, sv.dataset.mkSave); return; }
  if (t.closest("[data-mk-cancel]")) { modernStopMarking(block); return; }
  const s = t.closest(".marking .ms");
  if (s) { ev.preventDefault(); ev.stopPropagation(); modernMarkBox(block, +s.dataset.k); }
}, true);
