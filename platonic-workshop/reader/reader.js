// Platonic Workshop reader (milestones 2 to 9). No libraries, no build step.
// Your translations and notes (milestone 4) are in mywork.js; the word search
// across Plato and your word studies (milestone 5) in search.js; the
// commentaries (milestone 7) in commentary.js; the citation web (milestone 8) in citations.js; the dialogue and the corpus as a whole (milestone 9) in whole.js;
// listening to the English read aloud (milestone 14) in listen.js; the key terms and the side panel's tabs (milestone 17) in terms.js.
"use strict";

// The work being read (a Perseus id, 'tlg031'). Changes when you open another dialogue.
let WORK = "tlg031";
const DEFAULT_WORK = "tlg031";
const state = { work: null, works: [], page: null, data: null, selected: null, target: null, token: null, dict: null, lexica: [], view: "read", pendingWord: null };
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STEPH = /^(\d{1,4})([a-e])?$/;  // four digits for Bekker pages (Aristotle, 980-1462)
// Milestone 23: the New Testament is cited by chapter and verse ('3:16', or '3.16' as typed); a chapter is its page.
const VERSE = /^(\d{1,3})[:.](\d{1,3})$/;
const isNT = (w) => !!w && w.corpus === "nt";
const isAR = (w) => !!w && w.corpus === "aristotle";
const isPlato = (w) => !!w && w.corpus !== "nt" && w.corpus !== "aristotle";
// The Loeb English of Plato and of Aristotle (Perseus), which carries its own notes and speakers.
const isLoebSource = (id) => id === "perseus-english-plato" || id === "perseus-english-aristotle";
// 'the Timaeus', but 'Matthew': the books of the New Testament take no article.
const theTitle = (w) => (isNT(w) ? "" : "the ") + ((w && w.title) || "");

async function api(path) {
  const r = await fetch("/api/" + path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

// ------------------------------------------------------------------ layers

const LAYERS = { grc: "no-grc", eng: "no-eng", notes: "no-notes", links: "no-links", mine: "no-mine", terms: "no-terms" };
function loadLayers() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("pw.layers") || "{}"); } catch (e) { /* private window */ }
  document.querySelectorAll("[data-layer]").forEach((box) => {
    const k = box.dataset.layer;
    if (k in saved) box.checked = saved[k];
    applyLayer(k, box.checked);
    box.addEventListener("change", () => {
      applyLayer(k, box.checked);
      saved[k] = box.checked;
      try { localStorage.setItem("pw.layers", JSON.stringify(saved)); } catch (e) { /* ignore */ }
    });
  });
}
function applyLayer(k, on) {
  if (k === "untagged") document.body.classList.toggle("show-untagged", on);
  else document.body.classList.toggle(LAYERS[k], !on);
}

// ------------------------------------------------------------------ navigation

function parseRef(s) {
  const v = VERSE.exec(String(s).trim().replace(/\s+/g, ""));
  if (v) return { page: +v[1], ref: +v[1] + ":" + +v[2] };
  const m = STEPH.exec(String(s).trim().toLowerCase().replace(/\s+/g, ""));
  if (!m) return null;
  return { page: +m[1], ref: m[2] ? m[1] + m[2] : null };
}

// A work named the way you might type it: its LSJ abbreviation (R., Ti., Alc. 1),
// its address-bar name (republic), the start of its title (rep, tim), or its Perseus id.
const squash = (s) => String(s || "").toLowerCase().replace(/[\s.]+/g, "");
function findWork(name) {
  const q = squash(name);
  if (!q) return null;
  // The works of the corpus being read come first: 'phil' is the Philebus in Plato, Philippians in the New Testament.
  const cur = workById(WORK);
  const ws = state.works.filter((w) => w.imported).sort((a, b) => (isNT(a) !== isNT(cur)) - (isNT(b) !== isNT(cur)));
  return ws.find((w) => w.id === q || squash(w.abbr) === q || w.slug.replace(/-/g, "") === q)
    || ws.find((w) => squash(w.title).startsWith(q) || w.slug.replace(/-/g, "").startsWith(q)) || null;
}
const workById = (id) => state.works.find((w) => w.id === id);
const workAbbr = (id) => (workById(id) || {}).abbr || id;

// 'Rep. 514a', 'Ti. 29e', 'phaedrus 246', or a reference in the work being read ('29e').
function parsePlace(s) {
  s = String(s || "").trim();
  const m = /^(.*?)[\s/]*(\d{1,3}\s*[:.]\s*\d{1,3}|\d{1,3}\s*[a-eA-E]?)$/.exec(s);
  if (!m) { const w = findWork(s); return w ? { work: w, ref: null, page: null } : null; }
  const p = parseRef(m[2]);
  if (!p) return null;
  const w = m[1].trim() ? findWork(m[1]) : workById(WORK);
  return w ? { work: w, ...p } : null;
}

function placeHash(workId, ref) {
  const w = workById(workId);
  return "#" + (w ? w.slug : workId) + (ref ? "/" + ref : "");
}

async function openWork(workId) {
  if (state.work && state.work.id === workId) return true;
  const w = workById(workId);
  if (!w || !w.imported) return false;
  $("#main").innerHTML = `<p class="loading">Opening ${esc(theTitle(w))}…</p>`;
  state.work = await api(`work/${workId}`);
  WORK = workId;
  state.page = null;
  state.data = null;
  closeInspector(true);
  const grc = state.work.editions.find((e) => e.lang === "grc");
  $("#work-sub").textContent = isNT(state.work)
    ? `The Greek New Testament · ${grc.label} with MorphGNT · ${state.work.counts.tokens.toLocaleString()} words`
    : isAR(state.work) ? `Aristotle · ${grc.printed} · ${state.work.counts.tokens.toLocaleString()} words · ${state.work.counts.notes} notes`
    : `${grc.printed} · ${state.work.counts.tokens.toLocaleString()} words · ${state.work.counts.notes} notes · ${state.work.counts.links_out} links`;
  const sel = $("#work-select");
  if (sel) sel.value = workId;
  // Milestone 23: the books of the New Testament have no page "as a whole".
  const wb = $("#whole-btn");
  if (wb) wb.style.display = isNT(state.work) || isAR(state.work) ? "none" : "";
  document.title = `${state.work.title} · Platonic Workshop`;
  return true;
}

// Go to a place: '29e', 'Rep. 514a', or {work, ref, page}. Returns false if there is no such place.
function go(place, push = true) {
  const p = typeof place === "string" ? parsePlace(place) : place;
  if (!p || !p.work) return false;
  const w = p.work;
  const first = w.first_ref ? parseRef(w.first_ref) : null;
  const target = p.page ? p : first;
  if (!target) return false;
  goTo(w.id, target.ref, target.page, push);
  return true;
}

async function goTo(workId, ref, page, push = true) {
  try {
    if (!(await openWork(workId))) return false;
  } catch (e) {
    $("#main").innerHTML = `<div class="load-failed"><p class="error">The ${isNT(workById(workId)) ? "book" : "dialogue"} did not open (${esc(e.message)}). This is usually a dropped connection.</p>
      <p><button type="button" class="btn" id="retry-work">Try again</button></p></div>`;
    $("#retry-work").addEventListener("click", () => goTo(workId, ref, page, false));
    return false;
  }
  const ok = ref ? state.work.sections.includes(ref) : state.work.sections.some((r) => parseInt(r) === page);
  if (!ok) {
    $("#main").innerHTML = `<p class="error">${esc(theTitle(state.work).replace(/^t/, "T"))} has no ${isNT(state.work) ? (ref ? "verse" : "chapter") : "section"} ${esc(ref || page)}. It runs from ${esc(state.work.sections[0])} to ${esc(state.work.sections[state.work.sections.length - 1])}.</p>`;
    return false;
  }
  const hash = placeHash(workId, ref || String(page));
  if (push && location.hash !== hash) history.pushState(null, "", hash);
  state.view = "read";
  document.body.classList.remove("searching");
  state.target = ref;
  await loadPage(page);
  return true;
}

// Only the last page asked for is shown: a slower answer for a page left behind, or
// its failure, never replaces it. A page that fails to load is tried once more by
// itself, then says so with a Try again button (on the iPad a dropped connection is
// usually back a moment later).
let pageAsk = 0;
async function loadPage(page) {
  if (state.page === page && state.data && state.data.work_id === WORK && $("#main .sec")) { scrollToTarget(); return; }
  const ask = ++pageAsk;
  $("#main").innerHTML = `<p class="loading">Loading ${isNT(state.work) ? "chapter" : "page"} ${page}…</p>`;
  let data = null, err = null;
  for (let tries = 0; tries < 2 && !data; tries++) {
    if (tries) await new Promise((ok) => setTimeout(ok, 1200));
    if (ask !== pageAsk) return;
    try { data = await api(`page/${WORK}/${page}`); } catch (e) { err = e; }
  }
  if (ask !== pageAsk) return;
  if (!data) {
    $("#main").innerHTML = `<div class="load-failed"><p class="error">${isNT(state.work) ? "Chapter" : "Page"} ${page} did not load (${esc(err && err.message)}). This is usually a dropped connection.</p>
      <p><button type="button" class="btn" id="retry-page">Try again</button></p></div>`;
    $("#retry-page").addEventListener("click", () => loadPage(page));
    return;
  }
  state.data = data;
  state.page = page;
  renderPage();
  renderToc();
  scrollToTarget();
}

function scrollToTarget() {
  document.querySelectorAll(".sec.target").forEach((s) => s.classList.remove("target"));
  const id = state.target;
  const el = id && document.getElementById("s-" + id);
  if (el) { el.classList.add("target"); el.scrollIntoView({ block: "start" }); }
  else window.scrollTo(0, 0);
  if (state.pendingWord) {
    const t = state.pendingWord;
    state.pendingWord = null;
    const w = document.querySelector(`.w[data-t="${t}"]`);
    if (w) { w.scrollIntoView({ block: "center" }); inspect(t); }
  }
  $("#jump-ref").value = id || String(state.page);
  $("#prev").disabled = !state.data.prev;
  $("#next").disabled = !state.data.next;
}

// ------------------------------------------------------------------ rendering

function renderChunkGreek(chunk, tokens, idx) {
  let out = "", pos = 0;
  const t = chunk.text;
  for (const tok of tokens) {
    out += esc(t.slice(pos, tok.start));
    const mine = idx ? mineWordAttrs(tok.id, idx) : { cls: "", after: "" };
    const cls = "w" + (tok.tagged ? "" : " untagged") + (state.selected === tok.id ? " sel" : "") + mine.cls + commWordCls(tok.id);
    const term = typeof termWordAttrs === "function" ? termWordAttrs(tok.id) : "";
    out += `<span class="${cls}${term ? " tm" : ""}" data-t="${tok.id}"${term}>${esc(t.slice(tok.start, tok.end))}</span>${mine.after}`;
    pos = tok.end;
  }
  return out + esc(t.slice(pos));
}

function renderChunkEnglish(chunk, notes, numbers) {
  // Note markers are placed at the character offset where the TEI printed them.
  // Milestone 17: the key terms are marked in the text between them (terms.js).
  const mark = (s) => typeof markEnglish === "function" ? markEnglish(s, chunk.id) : esc(s);
  const here = notes.filter((n) => n.chunk_id === chunk.id).sort((a, b) => a.offset - b.offset);
  let out = "", pos = 0;
  for (const n of here) {
    const at = Math.min(n.offset ?? chunk.text.length, chunk.text.length);
    out += mark(chunk.text.slice(pos, at)) + `<sup><a href="#note-${n.id}" data-note="${n.id}" title="${esc(n.commentator)}">${numbers.get(n.id)}</a></sup>`;
    pos = at;
  }
  return out + mark(chunk.text.slice(pos));
}

function speakerLabel(c) {
  if (!c.label) return "";
  // Milestone 15: a Greek label (ΣΩ.) has the speaker's English name beside it, not only on hover.
  const en = c.speaker && /[Ͱ-Ͽἀ-῿]/.test(c.label) ? `<span class="speaker-en" lang="en">${esc(c.speaker)}</span>` : "";
  return `<span class="speaker" title="${esc(c.speaker || "")}">${esc(c.label)}</span>${en}`;
}

// ------------------------------------------------------------------ translations (milestone 6)

// Which English translations are shown, by kind, remembered in the browser.
const TRANS_DEFAULT = { loeb: true, taylor: true, jowett: false, ross: true, chase: true };
function transKind(ed) {
  if (isLoebSource(ed.source_id)) return "loeb";
  if (ed.id.endsWith(".jowett")) return "jowett";
  if (ed.id.endsWith(".taylor1804") || ed.id.endsWith(".taylor1801")) return "taylor";
  if (ed.id.endsWith(".ross1908")) return "ross";
  if (ed.id.endsWith(".chase1847")) return "chase";
  return ed.id;
}
function transPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem("pw.trans") || "{}"); } catch (e) { /* private window */ }
  return { ...TRANS_DEFAULT, ...p };
}
function englishEditions() {
  const order = { loeb: 0, ross: 1, chase: 1, taylor: 2, jowett: 3 };
  return state.work.editions.filter((e) => e.lang === "eng").sort((a, b) => (order[transKind(a)] ?? 9) - (order[transKind(b)] ?? 9));
}
function shownEditions() {
  const p = transPrefs();
  const eds = englishEditions().filter((e) => p[transKind(e)]);
  return eds.length ? eds : englishEditions().slice(0, 1);
}
function pct(x) { return (100 * x).toFixed(0) + "%"; }
// What the reader is told about a translation's placement.
function placementNote(ed) {
  // Aristotle milestone A1: each translation says how it is placed at Bekker's columns (tools/aristotle.py).
  if (isAR(state.work)) return ed.align_method === "printed" && !ed.translator_note ? "At Bekker's columns as Perseus marks them." : (ed.translator_note || "");
  const chk = state.work.alignment_check;
  const rows = (chk && chk.rows) || [];
  const tot = (rs, k) => { const n = rs.reduce((a, r) => a + r.units, 0); return n ? rs.reduce((a, r) => a + r[k] * r.units, 0) / n : null; };
  const t = rows.filter((r) => r.level === "section" && r.translation.includes("1804"));
  const j = rows.filter((r) => r.level === "section" && !r.translation.includes("1804"));
  const pg = rows.filter((r) => r.level === "page");
  const tested = (rs, what) => rs.length && tot(rs, "exact") !== null
    ? ` Tested where the numbers are printed (${what}): the right section for ${pct(tot(rs, "exact"))} of sentences, within one section for ${pct(tot(rs, "within_one"))}.` : "";
  if (ed.align_method === "computed") {
    const rs = transKind(ed) === "taylor" ? t : j;
    return "No Stephanus numbers are printed in this text: each paragraph is placed by computation against the Loeb English (tools/align.py), marked ≈." +
      tested(rs.length ? rs : t.concat(j), transKind(ed) === "taylor" ? "Taylor's Republic and First Alcibiades" : "Jowett's Republic") +
      " A paragraph that runs on is shown where it starts, with → and the section where it ends.";
  }
  if (ed.align_method === "printed page, section computed") {
    return "The Stephanus page is printed in the margin; the section within the page is computed (tools/align.py), marked ≈." +
      (pg.length ? ` Without the printed pages the computation puts ${pct(tot(pg, "exact"))} of sentences on the right page.` : "");
  }
  if (ed.align_method === "printed") return "Stephanus sections as printed: " + (ed.translator_note || "");
  return "Stephanus sections as printed in the Perseus text.";
}
function editionTitle(ed) {
  return [ed.responsible ? "Translator: " + ed.responsible : "", ed.printed || "", ed.translator_note && ed.align_method !== "printed" ? ed.translator_note : "",
    placementNote(ed), "Proofreading: " + ed.proof_status].filter(Boolean).join("\n");
}
function renderTransBar() {
  const p = transPrefs();
  const eds = englishEditions();
  if (eds.length < 2) return "";
  return `<div class="trans-bar" role="group" aria-label="Translations shown"><span class="tb-k">Translations</span>${eds.map((e) => {
    const k = transKind(e);
    const approx = e.align_method && e.align_method !== "printed" ? ` <span class="approx" aria-hidden="true">≈</span>` : "";
    return `<label class="tb-chip" title="${esc(editionTitle(e))}"><input type="checkbox" data-trans="${esc(k)}" ${p[k] ? "checked" : ""}> ${esc(e.label)}${approx}</label>`;
  }).join("")}<button type="button" class="link-btn" id="trans-about">About these translations</button></div>`;
}
function showTransAbout() {
  const eds = englishEditions();
  $("#about-body").innerHTML = `<p class="meta">The English translations of the ${esc(state.work.title)} in this library, and how each is placed at the Stephanus sections.</p>` +
    eds.map((e) => `<div class="src"><h4>${esc(e.label)}${e.responsible ? ` · ${esc(e.responsible)}` : ""}</h4>
      <div>${esc(e.printed || "")}</div>
      ${e.translator_note ? `<div>${esc(e.translator_note)}</div>` : ""}
      <div>${esc(placementNote(e))}</div>
      <div class="meta">Proofreading: ${esc(e.proof_status)} · ${e.sections} of ${state.work.sections.length} sections · <code>${esc(e.file || "")}</code></div></div>`).join("") +
    `<p class="meta">Taylor's volume I (First Alcibiades, Republic) is the corrected text of theosophylib.com; volumes II to V are the OCR of the 1804 printing, cleaned by rule (reports/taylor_ocr.md), and each paragraph keeps the OCR as received: tick <em>Show the OCR</em> to see it under the text. How often computed placements are right: reports/alignment.md.</p>`;
  $("#about").querySelector("h2").textContent = "Translations";
  $("#about").showModal();
}
function renderTransChunk(c, d, numbers, cont) {
  const ed = state.work.editions.find((e) => e.id === c.edition_id);
  const approx = c.align_method && c.align_method !== "printed";
  const pre = cont ? `<span class="runs" title="Continued from ${esc(c.section_ref)}">from ${esc(c.section_ref)} · </span>` : "";
  const mark = approx && !cont ? `<span class="approx" title="Placed by computation: ${esc(c.align_method)}">≈</span> ` : "";
  const runs = !cont && c.end_ref && c.end_ref !== c.section_ref ? ` <span class="runs" title="This paragraph runs on to ${esc(c.end_ref)}">→ ${esc(c.end_ref)}</span>` : "";
  const who = ed && ed.responsible && ed.responsible.includes(" and ") && c.translator ? ` <span class="runs">(${esc(c.translator.split(" ").pop())})</span>` : "";
  const raw = c.raw ? `<details class="raw"><summary>OCR as received${c.printed_at ? ", " + esc(c.printed_at) : ""}</summary><pre>${esc(c.raw)}</pre></details>` : "";
  return `<p data-c="${c.id}">${pre}${mark}${speakerLabel(c)}${renderChunkEnglish(c, d.notes, numbers)}${runs}${who}</p>${raw}`;
}

function renderPage() {
  const d = state.data;
  const w = state.work;
  const grcEd = w.editions.find((e) => e.lang === "grc");
  const eds = shownEditions();
  const shown = new Set(eds.map((e) => e.id));
  const tokByChunk = new Map();
  for (const t of d.tokens) {
    if (!tokByChunk.has(t.chunk_id)) tokByChunk.set(t.chunk_id, []);
    tokByChunk.get(t.chunk_id).push(t);
  }
  // Notes of translations not shown are left out, and the rest numbered in order.
  d.shownNotes = d.notes.filter((n) => !n.edition_id || shown.has(n.edition_id) || !englishEditions().some((e) => e.id === n.edition_id));
  const numbers = new Map(d.shownNotes.map((n, i) => [n.id, i + 1]));
  const lastPara = {};
  const idx = MINE.idx = mineIndex(d);
  indexCommentary(d);
  const nt = isNT(w);
  let html = nt
    ? `<div class="page-head"><h1>${d.page}</h1><span>${esc(w.title)}, <span class="term" title="The chapters and verses every Bible uses (chapters from the 13th century, verses from 1551)">chapter</span> ${d.page}, verses ${esc(d.sections[0].ref.split(":")[1])}–${esc(d.sections[d.sections.length - 1].ref.split(":")[1])}</span></div>
      ${d.page === 1 ? ntHead(w) : ""}`
    : isAR(w) ? `<div class="page-head"><h1>${d.page}</h1><span><span class="term" title="Bekker numbers: the page and column of Bekker's Berlin edition of Aristotle (1831), used by every book on Aristotle">Bekker page</span> ${d.page}, columns ${esc(d.sections.map((s) => s.ref).join(", "))} · ${esc(arWhere(w, d.sections[0].ref))}</span></div>
      ${d.prev ? "" : arHead(w)}`
    : `<div class="page-head"><h1>${d.page}</h1><span><span class="term" title="Stephanus numbers: the page and part of the page in the edition of Plato printed in 1578, used by every book on Plato">Stephanus page</span> ${d.page}, sections ${esc(d.sections[0].ref)}–${esc(d.sections[d.sections.length - 1].ref)}</span></div>`;
  html += renderTransBar();
  html += renderCommBar();
  if (!d.mine.length) html += `<p class="page-note mine-note">Your work: select Greek words to translate them or write a footnote, or use <em>Write on</em> under a section for the whole of it.</p>`;
  $("#main").style.setProperty("--n", eds.length);
  html += `<div class="cols-head"><span></span><span class="grc-h">Greek · ${esc(grcEd.label)}</span>${eds.map((e) =>
    `<span class="eng-h" title="${esc(editionTitle(e))}">${esc(e.label)}${e.align_method && e.align_method !== "printed" ? ` <span class="approx">≈</span>` : ""}${d.chunks.some((c) => c.edition_id === e.id && c.raw) ? ` <label class="raw-toggle"><input type="checkbox" data-raw> Show the OCR</label>` : ""}</span>`).join("")}</div>`;

  d.sections.forEach((s, i) => {
    const g = d.chunks.filter((c) => c.lang === "grc" && c.section_ref === s.ref && !c.continued);
    const para = (c, lang) => {
      const cont = lastPara[lang] === c.para;
      lastPara[lang] = c.para;
      return cont ? ' class="cont"' : "";
    };
    const grc = g.map((c) => `<p${para(c, "grc")}>${speakerLabel(c)}${renderChunkGreek(c, tokByChunk.get(c.id) || [], idx)}</p>`).join("");
    const eng = eds.map((e) => {
      const before = i === 0 ? d.chunks.filter((c) => c.continued && c.edition_id === e.id).map((c) => renderTransChunk(c, d, numbers, true)).join("") : "";
      const here = d.chunks.filter((c) => !c.continued && c.edition_id === e.id && c.section_ref === s.ref);
      const body = isLoebSource(e.source_id)
        ? here.map((c) => `<p${para(c, e.id)} data-c="${c.id}">${speakerLabel(c)}${renderChunkEnglish(c, d.shownNotes, numbers)}</p>`).join("")
        : here.map((c) => renderTransChunk(c, { ...d, notes: d.shownNotes }, numbers, false)).join("");
      return `<div class="eng" lang="en" data-ed="${esc(e.id)}" data-label="${esc(e.label)}">${before}${body}</div>`;
    }).join("");
    html += `<section class="sec" id="s-${s.ref}" data-ref="${s.ref}">
      <button class="ref" data-copy="${esc(s.urn)}" title="${nt ? `${esc(w.title)} ${s.ref}: chapter ${s.ref.replace(":", ", verse ")}` : isAR(w) ? `Bekker ${s.ref}: page ${s.ref.slice(0, -1)}, ${s.ref.endsWith("a") ? "left" : "right"} column of Bekker's Berlin edition (1831)` : `Section ${s.ref}: a Stephanus number, the page and part of the page in the 1578 edition`}. Tap to copy its full address (${esc(s.urn)})">${s.ref}</button>
      <div class="grc" lang="grc">${grc}</div>
      ${eng}
      <div class="app">${renderApparatus(s, d, numbers)}</div>
    </section>`;
  });
  const pg = nt ? "chapter" : "page";
  html += `<div class="pager">${d.prev ? `<a href="${placeHash(WORK, String(d.prev))}">‹ ${pg} ${d.prev}</a>` : "<span></span>"}${d.next ? `<a href="${placeHash(WORK, String(d.next))}">${pg} ${d.next} ›</a>` : "<span></span>"}</div>`;
  $("#main").innerHTML = html;
  if (typeof panelAfterRender === "function") panelAfterRender();
}

function linkChip(to_work, to_ref, label, imported, title) {
  if (imported) {
    return `<a class="chip${to_work === WORK ? "" : " other"}" href="${esc(placeHash(to_work, to_ref))}" title="${esc(title)}">${esc(label)}</a>`;
  }
  return `<span class="chip off" title="${esc(title)} · this work is not in the library">${esc(label)}</span>`;
}

function renderApparatus(s, d, numbers) {
  const rows = [];
  const notes = (d.shownNotes || d.notes).filter((n) => n.start_ref === s.ref);
  if (notes.length) {
    const items = notes.map((n) => `<li id="note-${n.id}"><span class="n">${numbers.get(n.id)}</span>${n.body_html}
      <span class="meta"> · ${esc(n.commentator)} · anchored by ${esc(n.anchor_method)} · ${esc(n.proof_status)}</span></li>`).join("");
    rows.push(`<div class="app-row app-notes"><div class="app-k">Notes</div><div class="app-v"><ul class="notes">${items}</ul></div></div>`);
  }
  rows.push(renderCommentaryRow(s, d));
  // Milestone 8: what this section's notes cite, and the notes anywhere in Plato that cite it (citations.js).
  rows.push(renderLinksOut(s, d));
  rows.push(renderLinksIn(s, d));
  rows.push(renderMineRow(s, d));
  // Milestone 12: the recorded tensions this section begins a passage of (reconcile.js).
  if (typeof renderTensionRow === "function") rows.push(renderTensionRow(s));
  return rows.join("");
}

function renderToc() {
  const w = state.work;
  const pages = w.pages.map((p) => parseInt(p.start_ref));
  const seqOf = new Map(w.sections.map((r, i) => [r, i]));
  const curRefs = state.data ? state.data.sections.map((s) => s.ref) : [];
  let html = "";
  if (w.books && w.books.length) {
    html += `<h3>${w.books[0].kind === "letter" ? "Letters" : "Books"}</h3><ul class="books">${w.books.map((b) => {
      const here = curRefs.some((r) => seqOf.get(r) >= seqOf.get(b.start_ref) && seqOf.get(r) <= seqOf.get(b.end_ref));
      return `<li class="${here ? "here" : ""}"><a href="${esc(placeHash(WORK, b.start_ref))}" title="${esc(b.basis)}"><span>${esc(b.label)}</span><span>${esc(b.start_ref)}–${esc(b.end_ref)}</span></a></li>`;
    }).join("")}</ul>`;
  }
  if (isAR(w)) {
    html += `<h3 title="Bekker's pages: the pages of his Berlin edition of Aristotle (1831), which every book on Aristotle uses">Bekker pages</h3><div class="pages">${pages.map((p) => `<a href="${placeHash(WORK, String(p))}" class="${p === state.page ? "here" : ""}">${p}</a>`).join("")}</div>`;
    $("#toc").innerHTML = html + renderTocAR(w);
    return;
  }
  html += isNT(w) ? `<h3 title="The chapters every Bible uses">Chapters</h3><div class="pages">` : `<h3 title="Stephanus pages: the pages of the 1578 edition of Plato, which every book on Plato uses">Pages</h3><div class="pages">${pages.map((p) => `<a href="${placeHash(WORK, String(p))}" class="${p === state.page ? "here" : ""}">${p}</a>`).join("")}</div>`;
  // Speeches: collapse the opening exchanges into one line per long speech.
  const seq = new Map(w.sections.map((r, i) => [r, i]));
  const merged = [];
  for (const s of w.speeches) {
    const last = merged[merged.length - 1];
    if (last && seq.get(s.start_ref) - seq.get(last.end_ref) <= 1 && (seq.get(s.end_ref) - seq.get(s.start_ref) < 2) && (seq.get(last.end_ref) - seq.get(last.start_ref) < 2)) {
      last.end_ref = s.end_ref;
      if (!last.labels.includes(s.label)) last.labels.push(s.label);
    } else merged.push({ start_ref: s.start_ref, end_ref: s.end_ref, labels: [s.label] });
  }
  const cur = state.data ? state.data.sections.map((s) => s.ref) : [];
  if (isNT(w)) {
    html += renderTocNT(w);
    $("#toc").innerHTML = html;
    return;
  }
  html += `<h3>Who is speaking</h3><ul class="speeches">${merged.map((m) => {
    const here = cur.some((r) => seq.get(r) >= seq.get(m.start_ref) && seq.get(r) <= seq.get(m.end_ref));
    const label = m.labels.length > 2 ? "Dialogue" : m.labels.join(", ");
    return `<li class="${here ? "here" : ""}"><a href="${esc(placeHash(WORK, m.start_ref))}"><span>${esc(label)}</span><span>${m.start_ref === m.end_ref ? m.start_ref : m.start_ref + "–" + m.end_ref}</span></a></li>`;
  }).join("")}</ul><p class="note">From the speaker markup in the Perseus text.</p>`;
  html += renderTocWhole(w, cur);
  html += renderTocCitations(w);
  $("#toc").innerHTML = html;
}

// ------------------------------------------------------------------ word inspector

// The word box, in the panel's Word tab (milestone 17: the panel has tabs; pane says which to show).
async function inspect(id, pane = "word") {
  state.selected = id;
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  document.querySelectorAll(`.w[data-t="${id}"]`).forEach((e) => e.classList.add("sel"));
  const w = document.querySelector(`#main .w[data-t="${id}"]`);
  if (w && w.closest(".sec") && typeof PANEL !== "undefined") PANEL.ref = w.closest(".sec").dataset.ref;
  if (typeof showPane === "function" && pane) showPane(pane);
  document.body.classList.add("inspecting");
  const box = $("#pane-word") || $("#inspector");
  box.innerHTML = `<p class="loading">…</p>`;
  let t;
  try { t = await api(`token/${id}`); } catch (e) { box.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  if (state.selected !== id) return;
  const g = t.sources[t.corpus === "aristotle" ? "glaux-aristotle" : "glaux-plato"], mo = t.sources["morpheus-analyses"];
  let html = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button>
    <div class="insp-form" lang="grc">${esc(t.form)}</div>
    <div class="insp-addr" title="This word's address in the Perseus catalogue of texts (a CTS address)">${esc(t.address)}</div>`;
  if (state.view === "read") html += renderMineForWord(id) + commForWord(id);
  if (t.tags.length) {
    const split = t.tags.length > 1;
    html += t.tags[0].source_id === "morphgnt-sblgnt"
      ? `<div class="box tagged"><h3><span title="Scholars: the lemma and parse">Dictionary form and grammar</span> <span class="badge quoted" title="From MorphGNT, edited by scholars over many years">edited</span></h3>`
      : `<div class="box tagged"><h3><span title="Scholars: the lemma and parse">Dictionary form and grammar</span> <span class="badge" title="Chosen by a computer program (GLAUx), not checked by hand">machine</span></h3>`;
    for (const tag of t.tags) {
      html += `<div><span class="lemma" lang="grc" title="Dictionary form (scholars: lemma)">${esc(tag.lemma)}</span>${split ? ` <span class="meta">(part ${tag.part + 1}: <span lang="grc">${esc(tag.source_form)}</span>)</span>` : ""}</div>
        <dl class="feat">${tag.features.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}
        ${tag.relation ? `<dt>role in sentence</dt><dd>${esc(tag.relation)}</dd>` : ""}</dl>`;
    }
    const t0 = t.tags[0];
    const here = t.elsewhere_in_work ? `This dictionary form occurs ${t.elsewhere_in_work}× in ${esc(theTitle(workById(t.work_id)))}.` : "";
    html += t0.source_id === "morphgnt-sblgnt"
      ? `<p class="prov">From MorphGNT, which gives every word of the Greek New Testament its dictionary form and grammar: begun as the CCAT analysis (University of Pennsylvania) and corrected by its editors since; its own code is <code>${esc(t0.source_word_id.split(" ").slice(1).join(" "))}</code>. ${here}</p></div>`
      : `<p class="prov">The single choice of GLAUx, a computer program that marks every word's dictionary form and grammar (${t0.analysis === "auto" ? "not checked by hand" : "checked by hand"}). Matched to this word by ${esc(t0.align_method)}.
      ${here}</p></div>`;
  } else {
    html += `<div class="box none"><h3 title="Scholars: not tagged">No grammar marked</h3>The GLAUx program has no word that lines up with this one${/^\[|\]$/.test(t.form) ? "" : " (often a word Burnet brackets as not Plato's, which GLAUx leaves out)"}. The list below still gives every grammar this spelling could have.</div>`;
  }
  html += renderElsewhere(t);
  html += renderConceptsForWord(t);
  html += renderGrammar(t);
  html += `<div class="box dict" id="dict"></div>`;
  if (t.morph.length) {
    html += `<div class="box alts"><h3><span title="Scholars: every possible parse">Every possible grammar of this spelling</span> <span class="badge warn" title="Listed by fixed rules (the Morpheus program), not by a choice">rule-based</span></h3><ol>${t.morph.map((m) =>
      `<li class="${m.matches_tag ? "agree" : ""}">${m.has_entry ? `<a class="l lk" lang="grc" data-lemma="${esc(m.lemma)}" title="The dictionary entry for ${esc(m.lemma)}">${esc(m.lemma)}</a>` : `<span class="l" lang="grc">${esc(m.lemma)}</span>`}${m.gloss ? ` <span class="g">${esc(m.gloss)}</span>` : ""}<br>${esc(m.parse)}${m.matches_tag ? ` <span class="agree-mark">· the tagger's choice</span>` : m.same_lemma_as_tag ? ` <span class="meta">· same lemma, other parse</span>` : ""}</li>`
    ).join("")}</ol><p class="prov">From the table of the Morpheus program, which lists by rule every form a spelling can be (key <code>${esc(t.morph_key)}</code>). Tap a dictionary form for its entry.</p></div>`;
  } else {
    html += `<div class="box alts"><h3 title="Scholars: every possible parse">Every possible grammar of this spelling</h3><p class="prov">The Morpheus program has no entry for this spelling.</p></div>`;
  }
  html += `<details class="prov"><summary>Sources for this word</summary>${
    [t.corpus === "nt" ? "morphgnt-sblgnt" : t.corpus === "aristotle" ? "glaux-aristotle" : "glaux-plato", t.corpus === "aristotle" ? "perseus-greek-aristotle" : null, "morpheus-analyses", "middle-liddell", "lsj", "lsj-abbreviations", "smyth-grammar", t.corpus === "nt" ? null : "agdt-guidelines"].filter(Boolean).map((k) => t.sources[k]).filter(Boolean).map((s) =>
      `<p><strong>${esc(s.title)}</strong><br>${esc(s.provenance)}<br>Licence: ${esc(s.licence)} · ${/^[0-9a-f]{64}$/.test(s.commit_sha) ? "sha256" : "commit"} <code>${esc(s.commit_sha.slice(0, 10))}</code></p>`).join("")
  }</details>`;
  box.innerHTML = html;
  state.token = t;
  const first = t.lookup[0];
  if (first) showDict(first, true);
  else $("#dict").innerHTML = `<h3>Dictionary</h3><p class="prov">No dictionary form was chosen for this word. Tap one under <em>Every possible grammar</em>.</p>`;
}

// ------------------------------------------------------------------ grammar notes

// The order a reader says a parse in: person and number, then tense, mood, voice, then gender, case, degree.
const SAY = ["person", "number", "tense", "mood", "voice", "gender", "case", "degree"];
function sayParse(features) {
  const f = Object.fromEntries(features);
  const pos = f["part of speech"] || "";
  const words = SAY.filter((k) => f[k]).map((k) => f[k]);
  return (pos ? pos + (words.length ? ": " : "") : "") + words.join(" ");
}

function renderGrammar(t) {
  if (!t.grammar.length) return "";
  let html = `<div class="box grammar"><h3>Grammar <span class="badge quoted">quoted</span></h3>`;
  for (const g of t.grammar) {
    const tag = t.tags.find((x) => x.part === g.part);
    if (t.grammar.length > 1) html += `<div class="g-part"><span lang="grc">${esc(tag.source_form)}</span></div>`;
    html += `<p class="say">${esc(sayParse(tag.features))}</p><ul class="g-notes">`;
    for (const n of g.notes) {
      if (!n.smyth.length) continue;  // person, number, gender: the line above says them, and Smyth has no note to add
      html += `<li><details><summary><b>${esc(n.value)}</b> <span class="meta">${esc(n.category)} · Smyth ${n.smyth.map((x) => "§" + esc(x.section)).join(", ")}</span></summary>${
        n.smyth.map((x) => `<div class="smyth-note"><div class="rule">${x.rule_html}</div>${x.full_html.length > x.rule_html.length + 20 ? `<details class="more"><summary>The whole of §${esc(x.section)}</summary>${x.full_html}</details>` : ""}
          <p class="prov">Smyth, <i>Greek Grammar</i> (1920) §${esc(x.section)}${x.heading ? `, under “${esc(x.heading)}”` : ""} · <a href="${esc(x.url)}" target="_blank" rel="noopener">on Perseus</a> · shown here as ${esc(x.reason)}.</p></div>`).join("")
      }</details></li>`;
    }
    if (g.role) {
      const r = g.role, lab = r.label;
      html += `<li><details><summary><b>${esc(lab && lab.name ? lab.name : r.code)}</b> <span class="meta">role in the sentence · ${esc(r.code)}</span></summary>${
        lab ? `<p>${lab.definition_html}</p>` : `<p class="prov">The treebank guidelines do not describe the label ${esc(r.code)}; it is GLAUx's own.</p>`}${
        r.suffix ? `<p>${r.suffix.definition_html}</p>` : ""}<p class="prov">Ancient Greek Dependency Treebank guidelines 2.0, the scheme GLAUx follows. The role was chosen by the same program as the grammar.</p></details></li>`;
    }
    html += `</ul>`;
  }
  return html + `<p class="prov">The grammar is the GLAUx program's choice; each explanation is in Smyth's own words, or the treebank guidelines'. Tap a line to open it.</p></div>`;
}

// ------------------------------------------------------------------ dictionary

function prefs() {
  try { return JSON.parse(localStorage.getItem("pw.dict") || "{}"); } catch (e) { return {}; }
}
function savePrefs(p) {
  try { localStorage.setItem("pw.dict", JSON.stringify({ ...prefs(), ...p })); } catch (e) { /* private window */ }
}

const METHOD_NOTE = {
  "same-spelling": "",
  "capital-lowered": "Filed under the same word in lower case.",
  "accent-differs": "No entry has exactly this spelling; this one has the same letters and breathing with a different accent. Check that it is the same word.",
  "letters-only": "No entry has exactly this spelling; this one has the same letters with a different breathing or accent. Check that it is the same word.",
};

function showDict(data, isTagged, forceLex) {
  const box = $("#dict");
  if (!box) return;
  const p = prefs();
  // The dictionary chosen last (Middle Liddell at first); if it has no entry and the other does, the other.
  const want = p.lex && data.entries[p.lex] ? p.lex : "middle-liddell";
  const has = (id) => (data.entries[id] || []).length > 0;
  const fallback = !has(want) && state.lexica.find((l) => has(l.id));
  const lex = forceLex || (fallback ? fallback.id : want);
  state.dict = { data, lex, isTagged };
  const tabs = state.lexica.map((l) => {
    const n = (data.entries[l.id] || []).length;
    return `<button class="tab${l.id === lex ? " on" : ""}" data-lex="${esc(l.id)}" ${n ? "" : 'title="No entry"'}>${esc(l.label)}${n ? "" : " ·"}</button>`;
  }).join("");
  const entries = data.entries[lex] || [];
  const switched = fallback && lex !== want ? `<p class="prov">${esc((state.lexica.find((l) => l.id === want) || {}).label)} has no entry under this word; showing ${esc(fallback.label)}.</p>` : "";
  const lx = state.lexica.find((l) => l.id === lex) || {};
  let body;
  if (!entries.length) {
    const other = state.lexica.find((l) => l.id !== lex && (data.entries[l.id] || []).length);
    body = `<p class="none-msg">${esc(lx.label)} has no entry under <span lang="grc">${esc(data.lemma)}</span>.${other ? ` ${esc(other.label)} has.` : ""}
      Dictionaries often file a word under a related headword (an adverb under its adjective, a deponent under its active form).</p>
      <p class="prov">Look it up elsewhere: <a href="https://logeion.uchicago.edu/${encodeURIComponent(data.lemma)}" target="_blank" rel="noopener">Logeion</a>.</p>`;
  } else {
    body = entries.map((e) => {
      // Milestone 23: a word of the New Testament filed under another headword says which ('under γιγνώσκω: the Attic spelling of γινώσκω').
      const warn = METHOD_NOTE[e.method] ?? (/^under /.test(e.method || "") ? `Filed ${e.method}.` : "");
      return `<article class="entry" data-entry="${e.id}">${warn ? `<p class="match-warn">${esc(warn)}</p>` : ""}${e.html}
        <p class="prov">${esc(lx.label)}, entry <code>${esc(e.key)}</code>${e.src_id ? ` (${esc(e.src_id)})` : ""}.</p></article>`;
    }).join("");
  }
  const expanded = p.expand !== false;
  box.innerHTML = `<h3>Dictionary <span class="badge quoted">printed</span></h3>
    <div class="dict-head"><span class="lemma" lang="grc">${esc(data.lemma)}</span>${isTagged ? ` <span class="meta" title="Scholars: the tagged lemma">the dictionary form chosen</span>` : state.token && state.token.lookup[0] ? ` <a class="back lk" data-lemma="${esc(state.token.lookup[0].lemma)}" data-tagged="1">back to the dictionary form chosen</a>` : ""}</div>
    <div class="tabs">${tabs}</div>
    <label class="ab-toggle"><input type="checkbox" id="ab-expand" ${expanded ? "checked" : ""}> Expand abbreviations</label>
    ${switched}<div class="entries${expanded ? " expanded" : ""}">${body}</div>
    <p class="prov">${esc(lx.printed || "")}. ${esc(lx.abbr_note || "")} ${entries.length ? `<button class="link-btn" id="dict-wide">Wide view</button>` : ""}</p>`;
  applyAbbr(box.querySelector(".entries"), expanded);
}

function applyAbbr(container, expanded) {
  container.classList.toggle("expanded", expanded);
  container.querySelectorAll("abbr.ab:not(.amb)").forEach((a) => {
    if (!a.dataset.o) a.dataset.o = a.textContent;
    a.textContent = expanded ? a.dataset.x : a.dataset.o;
    const detail = a.dataset.d ? ` (${a.dataset.d})` : "";
    a.title = expanded ? `printed: ${a.dataset.o}${detail}` : a.dataset.x + detail;
  });
}

async function lookupLemma(lemma, isTagged) {
  const box = $("#dict");
  if (!box) return;
  box.classList.add("busy");
  try {
    const data = (state.token && state.token.lookup.find((l) => l.lemma === lemma)) || await api(`lookup/${encodeURIComponent(lemma)}`);
    showDict(data, isTagged);
    box.scrollIntoView({ block: "nearest" });
  } catch (e) {
    box.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  } finally {
    box.classList.remove("busy");
  }
}

// Close the panel. soft (opening another dialogue): only the word goes; a term followed across the dialogues stays open.
function closeInspector(soft) {
  state.selected = null;
  const editing = MINE.editing;
  MINE.editing = null;
  highlightSpan(null);
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  const pane = typeof PANEL !== "undefined" ? PANEL.pane : "word";
  if (!(soft && pane === "term")) document.body.classList.remove("inspecting");
  const word = $("#pane-word") || $("#inspector");
  word.innerHTML = `<div class="inspector-empty"><p><strong>Tap any Greek word</strong> for its dictionary form, its grammar in plain English and its dictionary entry.
    <strong>Underlined words</strong> are key terms: tap one for what it means and everywhere it is used (the <em>Term</em> tab).</p></div>`;
  if (editing && typeof renderSectionPane === "function") renderSectionPane("mine");
  if (!soft && typeof showPane === "function" && pane !== "word" && pane !== "term") showPane("word", false);
}

// ------------------------------------------------------------------ sources dialog

async function showSources() {
  const d = await api("sources");
  $("#about").querySelector("h2").textContent = "Sources in this library";
  const all = JSON.parse(d.build.stats || "[]");
  const sum = (k) => all.reduce((n, s) => n + (s[k] || 0), 0);
  const stats = { sections: sum("sections"), tokens: sum("tokens").toLocaleString(), tagged: sum("tagged").toLocaleString(), notes: sum("notes"), links: sum("links") };
  let look = {};
  try { look = JSON.parse(d.build.lookup_stats || "{}"); } catch (e) { /* older build */ }
  $("#about-body").innerHTML = `<p class="meta">Library built ${esc(d.build.built_at)}. ${all.length} works: ${stats.sections} sections, ${stats.tokens} Greek words, ${stats.tagged} tagged, ${stats.notes} notes, ${stats.links} links.${look.lsj ? ` Dictionaries: ${look.lsj.entries} LSJ and ${look["middle-liddell"].entries} Middle Liddell entries for ${look.lemmas} lemmas; ${look.grammar_notes} Smyth notes; ${look.relation_labels} sentence roles.` : ""}</p>` +
    d.sources.map((s) => `<div class="src"><h4>${esc(s.title)}</h4>
      <div>${esc(s.provenance)}</div>
      <div class="meta">Layer: ${esc(s.layer)} · Licence: ${esc(s.licence)} · Status: ${esc(s.status)}${s.repo ? ` · <code>${esc(s.repo)}</code> @ <code>${esc((s.fetched_sha || s.commit_sha || "").slice(0, 10))}</code>` : ""}${s.path ? ` · <code>${esc(s.path)}</code>` : ""}</div></div>`).join("");
  $("#about").showModal();
}

// ------------------------------------------------------------------ events

document.addEventListener("click", (ev) => {
  const w = ev.target.closest(".w");
  // Milestone 17: a word marked as a key term opens the Term tab; its grammar is ready in the Word tab.
  if (w && w.dataset.term && typeof openTerm === "function" && termsOn() && !ev.shiftKey) {
    const ids = w.dataset.term.split(" ");
    inspect(+w.dataset.t, null);
    openTerm(ids[0], { alsoIds: ids });
    return;
  }
  if (w) { inspect(+w.dataset.t); return; }
  if (ev.target.closest(".insp-close")) { closeInspector(); return; }
  if (ev.target.closest("#trans-about")) { showTransAbout(); return; }
  const lk = ev.target.closest("[data-lemma]");
  if (lk) {
    ev.preventDefault();
    if (lk.closest("#entry-dialog")) $("#entry-dialog").close();
    lookupLemma(lk.dataset.lemma, !!lk.dataset.tagged);
    return;
  }
  const tab = ev.target.closest("[data-lex]");
  if (tab && state.dict) { savePrefs({ lex: tab.dataset.lex }); showDict(state.dict.data, state.dict.isTagged, tab.dataset.lex); return; }
  const cite = ev.target.closest(".bibl.plato");
  if (cite && cite.dataset.ref && workById(cite.dataset.work) && workById(cite.dataset.work).imported) {
    if (cite.closest("#entry-dialog")) $("#entry-dialog").close();
    const p = parseRef(cite.dataset.ref);
    goTo(cite.dataset.work, p.ref, p.page);
    return;
  }
  if (ev.target.closest("#dict-wide") && state.dict) {
    const src = $("#dict .entries");
    $("#entry-body").innerHTML = `<div class="entries">${src.innerHTML}</div>`;
    $("#entry-title").textContent = state.dict.data.lemma;
    applyAbbr($("#entry-body .entries"), src.classList.contains("expanded"));
    $("#entry-dialog").showModal();
    return;
  }
  const ref = ev.target.closest(".ref");
  if (ref) {
    navigator.clipboard?.writeText(ref.dataset.copy).catch(() => {});
    const r = ref.closest(".sec").dataset.ref;
    history.replaceState(null, "", placeHash(WORK, r));
    state.target = r;
    scrollToTarget();
    return;
  }
  const n = ev.target.closest("[data-note]");
  if (n) {
    const li = document.getElementById("note-" + n.dataset.note);
    if (li) { ev.preventDefault(); li.scrollIntoView({ block: "center" }); li.classList.add("flash"); setTimeout(() => li.classList.remove("flash"), 1200); }
  }
});

document.addEventListener("change", (ev) => {
  if (ev.target.dataset && ev.target.dataset.trans) {
    const p = transPrefs();
    p[ev.target.dataset.trans] = ev.target.checked;
    try { localStorage.setItem("pw.trans", JSON.stringify(p)); } catch (e) { /* ignore */ }
    if (state.data) { renderPage(); scrollToTarget(); }
    return;
  }
  if (ev.target.matches && ev.target.matches("[data-raw]")) {
    document.body.classList.toggle("show-raw", ev.target.checked);
    document.querySelectorAll("[data-raw]").forEach((x) => { x.checked = ev.target.checked; });
    return;
  }
  if (ev.target.id === "ab-expand") {
    savePrefs({ expand: ev.target.checked });
    applyAbbr($("#dict .entries"), ev.target.checked);
  }
});

$("#jump").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const inp = $("#jump-ref");
  const ok = go(inp.value);
  inp.classList.toggle("bad", !ok);
  if (ok) inp.blur();
});
const goPage = (p) => goTo(WORK, null, p);
$("#prev").addEventListener("click", () => state.data?.prev && goPage(state.data.prev));
$("#next").addEventListener("click", () => state.data?.next && goPage(state.data.next));
$("#about-btn")?.addEventListener("click", showSources);
window.addEventListener("hashchange", () => route(false));
document.addEventListener("keydown", (ev) => {
  if (ev.target.matches("input, textarea")) return;
  if (ev.key === "ArrowLeft" && state.view === "read" && state.data?.prev) goPage(state.data.prev);
  else if (ev.key === "ArrowRight" && state.view === "read" && state.data?.next) goPage(state.data.next);
  else if (ev.key === "g") { ev.preventDefault(); $("#jump-ref").select(); }
  else if (ev.key === "/") { ev.preventDefault(); openSearch(); }
  else if (ev.key === "Escape") closeInspector();
});

// The address bar: #timaeus/29e, #republic/514 (a page), #search?q=λόγος&by=lemma.
// A bare #29e (milestones 2 to 4) is the Timaeus.
function route(push) {
  const raw = location.hash.slice(1);
  if (raw.startsWith("search")) { showSearchFromHash(raw); return; }  // its parameters are decoded there
  document.body.classList.remove("discussing", "whole-view", "corpus-view", "concepts-view", "commentaries-view", "dossiers-view");
  // Milestone 11: #commentaries.
  if (raw === "commentaries") { showCommentaryLibrary(); return; }
  // Milestone 10: #concepts, #concepts/the-good.
  if (raw === "concepts" || raw.startsWith("concepts/")) { showConcepts(decodeURIComponent(raw.slice(9)) || null); return; }
  if (raw.startsWith("renderings/")) { showRenderings(decodeURIComponent(raw.slice(11))); return; }
  // Passage dossiers: #dossiers, #dossiers/divided-line, #dossiers/divided-line/notes.
  if (raw === "dossiers" || raw.startsWith("dossiers/")) { showDossiers(decodeURIComponent(raw.slice(9))); return; }
  if (raw.startsWith("discussed")) { showDiscussedFromHash(raw); return; }
  if (raw === "corpus" || raw.startsWith("corpus?")) { showCorpusFromHash(raw); return; }
  const h = decodeURIComponent(raw);
  // Milestone 9: #timaeus/whole, any of the 36 works (those not yet imported too).
  if (h.endsWith("/whole")) {
    const w = state.works.find((x) => x.slug === h.slice(0, -6) || x.id === h.slice(0, -6));
    if (w) { showWhole(w.id); return; }
  }
  const slash = h.indexOf("/");
  let p = null;
  if (slash > 0) {
    const w = state.works.find((x) => x.slug === h.slice(0, slash) || x.id === h.slice(0, slash));
    const r = parseRef(h.slice(slash + 1));
    if (w && r) p = { work: w, ...r };
  } else if (h) {
    const w = state.works.find((x) => x.slug === h);
    p = w ? { work: w, ref: null, page: null } : (parseRef(h) ? { work: workById(WORK), ...parseRef(h) } : parsePlace(h));
  }
  if (!p || !go(p, push)) go({ work: workById(WORK), ref: null, page: null }, false);
}

function renderWorkSelect() {
  const groups = new Map();
  for (const w of state.works.filter((x) => x.imported)) {
    const k = isNT(w) ? "nt" : isAR(w) ? "aristotle" : w.tetralogy || 0;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(w);
  }
  const sel = $("#work-select");
  sel.innerHTML = [...groups].map(([k, ws]) => `<optgroup label="${k === "nt" ? "The Greek New Testament" : k === "aristotle" ? "Aristotle" : k ? "Tetralogy " + k : "Other"}">${ws.map((w) =>
    `<option value="${w.id}">${esc(w.title)}</option>`).join("")}</optgroup>`).join("");
  sel.value = WORK;
  sel.addEventListener("change", () => { go({ work: workById(sel.value), ref: null, page: null }); sel.blur(); });
}

(async function start() {
  loadLayers();
  try {
    state.works = await api("works");
    if (!state.works.some((w) => w.imported)) throw new Error("empty");
  } catch (e) {
    // On the website the library is always built: a failure there is the connection.
    $("#main").innerHTML = document.querySelector('script[src$="standalone.js"]')
      ? `<div class="load-failed"><p class="error">The library did not open. This is usually a dropped connection.</p><p><button type="button" class="btn" onclick="location.reload()">Try again</button></p></div>`
      : `<p class="error">The library is not built yet. Run <code>python3 tools/build_db.py</code>, then reload.</p>`;
    return;
  }
  try { state.lexica = await api("lexica"); } catch (e) { state.lexica = []; }
  if (!workById(DEFAULT_WORK)?.imported) WORK = state.works.find((w) => w.imported).id;
  if (typeof loadOrder === "function") await loadOrder();   // the order of the dialogue menu (guide.js)
  renderWorkSelect();
  route(false);
})();
