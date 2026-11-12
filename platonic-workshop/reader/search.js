// Platonic Workshop: word search across all of Plato, "this word elsewhere in
// Plato" in the word box, and your saved word studies (milestone 5).
// Loaded after reader.js and mywork.js; shares their globals (state, $, esc,
// api, send, md, go, goTo, placeHash, workById).
"use strict";

const SEARCH = { hash: null, q: "", by: "lemma", corpus: "plato", works: [], terms: null, result: null, hits: [], nextAfter: null, study: null, studies: [], showDeleted: false };
const BY_LABEL = { lemma: "dictionary form", form: "exact form", plain: "any accent" };
const fmt = (n) => Number(n || 0).toLocaleString();

// ------------------------------------------------------------------ the address bar

// Aristotle milestone A7: the three bodies of writing the concordance searches, each by itself.
function searchWhere(corpus) {
  const c = corpus || SEARCH.corpus;
  if (c === "nt") return { name: "the New Testament", all: "the New Testament", of: "the 27 books of the New Testament", button: "Search the New Testament" };
  if (c === "aristotle") {
    const n = typeof arWorks === "function" ? arWorks().length : 0;
    return { name: "Aristotle", all: "all of Aristotle", of: `the ${n} works of Aristotle`, button: "Search Aristotle" };
  }
  return { name: "Plato", all: "all of Plato", of: "36 works", button: "Search Plato" };
}

function searchHash(o) {
  const p = new URLSearchParams();
  p.set("q", o.q);
  p.set("by", o.by || "lemma");
  // Milestone 23: the New Testament is searched by itself, never mixed with Plato.
  if (o.corpus === "nt" || o.corpus === "aristotle") p.set("corpus", o.corpus);
  if (o.works && o.works.length) p.set("works", o.works.join(","));
  if (o.terms && o.terms.length) p.set("terms", o.terms.join(","));
  if (o.study) p.set("study", String(o.study));
  return "#search?" + p.toString();
}

function openSearch(q, by, extra = {}) {
  const o = { q: q ?? SEARCH.q, by: by || SEARCH.by, corpus: extra.corpus || SEARCH.corpus, works: extra.works || [], terms: extra.terms || null, study: extra.study || null };
  if (!o.q) { location.hash = o.corpus === "nt" || o.corpus === "aristotle" ? `#search?corpus=${o.corpus}` : "#search"; return; }
  const h = searchHash(o);
  if (location.hash === h) showSearchFromHash(h.slice(1));
  else location.hash = h;
}

async function showSearchFromHash(h) {
  const p = new URLSearchParams(h.replace(/^search\??/, ""));
  state.view = "search";
  document.body.classList.remove("whole-view", "corpus-view", "concepts-view", "commentaries-view");
  document.body.classList.add("searching");
  closeInspector();
  SEARCH.q = p.get("q") || "";
  SEARCH.by = BY_LABEL[p.get("by")] ? p.get("by") : "lemma";
  SEARCH.works = (p.get("works") || "").split(",").filter(Boolean);
  // A word study saved over the whole New Testament keeps all its books as its works.
  SEARCH.corpus = p.get("corpus") === "nt" || (SEARCH.works.length && SEARCH.works.every((w) => isNT(workById(w)))) ? "nt"
    : p.get("corpus") === "aristotle" || (SEARCH.works.length && SEARCH.works.every((w) => isAR(workById(w)))) ? "aristotle" : "plato";
  if (SEARCH.corpus === "nt" && SEARCH.works.length === ntCount()) SEARCH.works = [];
  SEARCH.terms = (p.get("terms") || "").split(",").filter(Boolean);
  if (!SEARCH.terms.length) SEARCH.terms = null;
  SEARCH.study = p.get("study") ? +p.get("study") : null;
  document.title = (SEARCH.q ? SEARCH.q + " · " : "") + searchWhere().button + " · Platonic Workshop";
  await loadStudies();
  if (!SEARCH.q) { SEARCH.result = null; SEARCH.hash = h; renderSearch(); return; }
  if (SEARCH.hash === h && SEARCH.result) { renderSearch(); return; }
  SEARCH.hash = h;
  renderSearch(true);
  try {
    SEARCH.result = await api(searchPath(0));
    SEARCH.hits = SEARCH.result.hits;
    SEARCH.nextAfter = SEARCH.result.next_after;
  } catch (e) {
    SEARCH.result = { error: e.message };
  }
  renderSearch();
}

function searchPath(after) {
  const p = new URLSearchParams({ q: SEARCH.q, by: SEARCH.by, after: String(after || 0), corpus: SEARCH.corpus });
  if (SEARCH.works.length) p.set("works", SEARCH.works.join(","));
  if (SEARCH.terms) p.set("terms", SEARCH.terms.join(","));
  return "search?" + p.toString();
}

async function moreHits() {
  if (!SEARCH.nextAfter) return;
  const btn = $("#more-hits");
  if (btn) { btn.disabled = true; btn.textContent = "Loading…"; }
  try {
    const r = await api(searchPath(SEARCH.nextAfter));
    SEARCH.hits = SEARCH.hits.concat(r.hits);
    SEARCH.nextAfter = r.next_after;
  } catch (e) {
    if (btn) btn.textContent = "Could not load more: " + e.message;
    return;
  }
  const list = $("#kwic");
  if (list) list.insertAdjacentHTML("beforeend", SEARCH.hits.slice(list.children.length).map(renderHit).join(""));
  const foot = $("#hits-foot");
  if (foot) foot.innerHTML = hitsFoot();
}

// ------------------------------------------------------------------ rendering

function renderSearch(loading) {
  const r = SEARCH.result;
  let html = `<div class="search">
    <form id="search-form" class="search-form" autocomplete="off">
      <label for="sq" class="sr">Word</label>
      <input id="sq" lang="grc" list="sq-list" value="${esc(SEARCH.q)}" placeholder="λόγος, lo/gos, λογ*" spellcheck="false">
      <datalist id="sq-list"></datalist>
      <span class="by">${Object.entries(BY_LABEL).map(([k, v]) =>
        `<label><input type="radio" name="by" value="${k}" ${SEARCH.by === k ? "checked" : ""}> ${esc(v)}</label>`).join("")}</span>
      <span class="by corpus" role="group" aria-label="Where to search">${[["plato", "Plato"], ["aristotle", "Aristotle"], ["nt", "New Testament"]].map(([k, v]) =>
        `<label><input type="radio" name="corpus" value="${k}" ${SEARCH.corpus === k ? "checked" : ""}> ${v}</label>`).join("")}</span>
      <button class="btn">${searchWhere().button}</button>
    </form>
    <p class="prov">Greek, or Beta Code (<code>lo/gos</code>). <b>Dictionary form</b> finds every form of the word
      (λόγος finds λόγου, λόγοις…); <b>exact form</b> the form as printed, accents included; <b>any accent</b> the letters only.
      End with <code>*</code> to search by beginning (<code>λογ*</code>).</p>`;
  if (loading) html += `<p class="loading">Searching ${searchWhere().all}…</p>`;
  else if (r && r.error) html += `<p class="error">${esc(r.error)}</p>`;
  else if (r) html += renderResult(r);
  else html += SEARCH.corpus === "aristotle"
    ? `<p class="page-note">Type a word to see every place it occurs in the works of Aristotle the Workshop has, with counts per work. Aristotle is searched by himself; the word box of a word in Plato says how often its dictionary form is in Aristotle too.</p>`
    : SEARCH.corpus === "nt"
    ? `<p class="page-note">Type a word to see every place it occurs in the 27 books of the Greek New Testament, with counts per book. The New Testament is searched by itself: it is another body of writing, four centuries after Plato.</p>`
    : `<p class="page-note">Type a word to see every place it occurs in the 36 works, with counts per dialogue.</p>`;
  html += `</div>`;
  $("#main").innerHTML = html;
  renderSearchToc();
  window.scrollTo(0, 0);
  const inp = $("#sq");
  if (!SEARCH.q) inp.focus();
}

function renderResult(r) {
  const study = SEARCH.study && SEARCH.studies.find((s) => s.id === SEARCH.study);
  let html = "";
  if (study) html += renderStudyHead(study);
  if (!r.chosen.length) {
    html += `<p class="none-msg">Nothing in ${searchWhere().name} matches <span lang="grc">${esc(r.word)}</span> (${esc(r.how)}).</p>`;
    if (r.by !== "plain") html += `<p><button class="link-btn" data-research="plain">Try any accent</button>${r.by === "lemma" ? ` · <button class="link-btn" data-research="form">Try the exact form</button>` : ""}</p>`;
    return html;
  }
  const label = r.by === "lemma" ? (SEARCH.corpus === "nt" ? `<span class="badge quoted" title="MorphGNT, edited by scholars">edited</span>` : `<span class="badge">machine</span>`) : `<span class="badge quoted">printed</span>`;
  const what = r.chosen.length === 1 ? `<span lang="grc">${esc(r.chosen[0])}</span>` : `${r.chosen.length} ${r.by === "lemma" ? "dictionary forms" : "forms"}`;
  const filtered = SEARCH.works.length ? ` · <b>${fmt(r.total_in_filter)}</b> in ${SEARCH.works.map((w) => esc(workAbbr(w))).join(", ")} <button class="link-btn" data-clear-works>show all works</button>` : "";
  html += `<div class="res-head"><h2>${what} ${label}</h2>
    <p><b>${fmt(r.total)}</b> times in ${r.counts.length} of ${searchWhere().of}${filtered}.
    <span class="meta">By ${esc(BY_LABEL[r.by])}: ${esc(r.how)}.</span></p>
    ${r.by === "lemma" && SEARCH.corpus === "nt" ? `<p class="prov">Dictionary forms (lemmas) are MorphGNT's, given to every word of the SBL Greek New Testament and corrected by its editors over many years.
      They are not always spelt as GLAUx spells Plato's: search Plato for the same word to compare.</p>` : ""}
    ${r.by === "lemma" && SEARCH.corpus === "aristotle" ? `<p class="prov">Dictionary forms (lemmas) are those the GLAUx program chose for Aristotle's Greek, by machine and not checked by hand.</p>` : ""}
    ${r.by === "lemma" && SEARCH.corpus === "plato" ? `<p class="prov">Dictionary forms (lemmas) are those the GLAUx program chose (about 98.8% right); only the Euthyphro, Apology, Crito and Cleitophon are hand-checked. A word is counted once even when GLAUx splits it (οὐδέ as οὐ + δέ counts for both).</p>` : ""}
    ${study ? "" : `<p><button class="btn" id="save-study">Save as a word study</button></p><div id="study-new"></div>`}</div>`;
  if (r.terms.length > 1) {
    const on = new Set(r.chosen);
    html += `<div class="terms"><span class="meta">${r.truncated ? `The ${r.terms.length} most frequent of more ` : ""}${r.by === "lemma" ? "Dictionary forms" : "Forms"} found (tap to leave one out or bring it back):</span>
      ${r.terms.map((t) => `<button class="chip term${on.has(t.term) ? " on" : ""}" data-term="${esc(t.term)}" lang="grc">${esc(t.term)} <span class="n">${fmt(t.total)}</span></button>`).join("")}</div>`;
  }
  if (r.near && r.near.length) {
    html += `<p class="meta">Same letters, other ${r.by === "lemma" ? "dictionary forms" : "forms"}: ${r.near.map((t) =>
      `<a class="lk" lang="grc" data-research-q="${esc(t.term)}">${esc(t.term)}</a> (${fmt(t.total)})`).join(", ")}</p>`;
  }
  const max = Math.max(...r.counts.map((c) => c.per_10k || 0), 1);
  html += `<h3>Per work <span class="meta">click a work to see only its occurrences</span></h3>
    <table class="counts"><thead><tr><th>Work</th><th class="num">Times</th><th class="num" title="Occurrences per 10,000 words of the work">per 10,000 words</th><th></th></tr></thead><tbody>
    ${r.counts.map((c) => `<tr class="${SEARCH.works.includes(c.work_id) ? "on" : ""}" data-filter-work="${c.work_id}">
      <td>${esc(c.title)} <span class="meta">${esc(c.abbr || "")}</span></td><td class="num">${fmt(c.n)}</td><td class="num">${c.per_10k}</td>
      <td class="bar"><span style="width:${Math.max(2, Math.round(100 * c.per_10k / max))}%"></span></td></tr>`).join("")}</tbody></table>`;
  html += `<h3>Every occurrence <span class="meta">in reading order, work by work; tap the word for its dictionary form, grammar and dictionary entry, or the reference to read it in place</span></h3>
    <ol class="kwic" id="kwic">${SEARCH.hits.map(renderHit).join("")}</ol><div id="hits-foot">${hitsFoot()}</div>`;
  return html;
}

function hitsFoot() {
  const r = SEARCH.result;
  const of = SEARCH.works.length ? r.total_in_filter : r.total;
  return `<p class="meta">Showing ${fmt(SEARCH.hits.length)} of ${fmt(of)}.</p>${SEARCH.nextAfter ? `<p><button class="btn" id="more-hits">Show ${Math.min(100, of - SEARCH.hits.length)} more</button></p>` : ""}`;
}

function renderHit(h) {
  const parse = h.features.map((f) => sayParse(f)).filter(Boolean).join(" + ");
  return `<li><a class="kref" href="${esc(placeHash(h.work_id, h.ref))}" data-tok="${h.token_id}" title="${esc(h.title)} ${esc(h.ref)}, word ${h.word}${h.speaker ? " · " + esc(h.speaker) + " speaking" : ""}">${esc(h.abbr || h.title)} ${esc(h.ref)}</a>
    <span class="ctx" lang="grc"><span class="before">${esc(h.before)}</span> <span class="w hit" data-t="${h.token_id}">${esc(h.form)}</span> <span class="after">${esc(h.after)}</span></span>
    <span class="kmeta">${h.lemma ? `<span lang="grc">${esc(h.lemma)}</span>` : "not tagged"}${parse ? " · " + esc(parse) : ""}${h.hand_checked ? " · hand-checked" : ""}</span></li>`;
}

// ------------------------------------------------------------------ the left column: counts and word studies

async function loadStudies() {
  try { SEARCH.studies = await api("studies" + (SEARCH.showDeleted ? "?deleted=1" : "")); } catch (e) { SEARCH.studies = []; }
}

function renderSearchToc() {
  const live = SEARCH.studies.filter((s) => !s.deleted_at);
  const gone = SEARCH.studies.filter((s) => s.deleted_at);
  let html = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to ${esc(state.work ? theTitle(state.work) : "the text")}</a></p>
    <h3>Your word studies</h3>`;
  html += live.length ? `<ul class="studies">${live.map((s) => `<li class="${s.id === SEARCH.study ? "here" : ""}"><a href="${esc(searchHash({ ...s, study: s.id }))}">${esc(s.title)}</a>
      <span class="meta" lang="grc">${esc(s.query)}</span> <span class="meta">· ${esc(BY_LABEL[s.by])}</span></li>`).join("")}</ul>`
    : `<p class="note">None yet. Search a word, then <em>Save as a word study</em> to keep it with your notes.</p>`;
  html += `<p class="note"><label><input type="checkbox" id="show-deleted" ${SEARCH.showDeleted ? "checked" : ""}> Show deleted</label></p>`;
  if (SEARCH.showDeleted) {
    html += gone.length ? `<ul class="studies deleted">${gone.map((s) => `<li>${esc(s.title)} <span class="meta">deleted ${esc(s.deleted_at.slice(0, 10))}</span>
      <button class="link-btn" data-study-restore="${s.id}" data-base="${s.rev}">Restore</button></li>`).join("")}</ul>` : `<p class="note">Nothing deleted.</p>`;
  }
  html += `<p class="note">Studies are kept in <code>data/user.sqlite</code> with your translations, every version of the note included. The counts are worked out again from the library each time a study is opened.</p>`;
  $("#toc").innerHTML = html;
}

function renderStudyHead(s) {
  return `<div class="study-head box mine-box">
    <h2>${esc(s.title)} <span class="meta">word study · revision ${s.rev}, ${esc(s.updated_at.slice(0, 10))}</span></h2>
    <div class="md">${s.body.trim() ? md(s.body, "fn-study-" + s.id) : `<p class="meta">No notes yet.</p>`}</div>
    <p><button class="btn" data-study-edit="${s.id}">Edit the title and notes</button>
      <button class="link-btn" data-study-history="${s.id}">Every version</button> ·
      <button class="link-btn" data-study-delete="${s.id}">Delete</button></p><div id="study-edit"></div></div>`;
}

function studyForm(s) {
  return `<form class="study-form" id="study-form" data-id="${s ? s.id : ""}" data-base="${s ? s.rev : ""}">
    <label>Title <input name="title" required maxlength="200" value="${esc(s ? s.title : `${(SEARCH.result && SEARCH.result.word) || SEARCH.q} (${BY_LABEL[SEARCH.by]})`)}"></label>
    <label>Your notes <span class="meta">(Markdown; optional)</span><textarea name="body" rows="6">${esc(s ? s.body : "")}</textarea></label>
    <p><button class="btn">Save</button> <button type="button" class="link-btn" data-study-cancel>Cancel</button> <span class="ed-status" id="study-status"></span></p></form>`;
}

async function saveStudy(form) {
  const data = { title: form.title.value, body: form.body.value };
  const status = $("#study-status");
  try {
    let saved;
    if (form.dataset.id) {
      saved = await send("PUT", `mine/study/${form.dataset.id}`, { ...data, base_rev: +form.dataset.base });
    } else {
      // A study of the whole New Testament is saved with all its books as its works, so that it reopens there.
      const works = SEARCH.corpus === "nt" && !SEARCH.works.length ? ntWorks().map((w) => w.id)
        : SEARCH.corpus === "aristotle" && !SEARCH.works.length ? arWorks().map((w) => w.id) : SEARCH.works;
      saved = await send("POST", "studies", { ...data, query: SEARCH.q, by: SEARCH.by, works, terms: SEARCH.terms });
    }
    await loadStudies();
    SEARCH.hash = null;  // the address changes to the study's own
    const h = searchHash({ q: saved.query, by: saved.by, works: saved.works || [], terms: saved.terms, study: saved.id });
    if (location.hash === h) { SEARCH.study = saved.id; renderSearch(); } else location.hash = h;
  } catch (e) {
    status.textContent = e.status === 409 ? "Changed in another tab since you opened it; nothing was saved over it. Reload to see it." : "Not saved: " + e.message;
    status.className = "ed-status warn";
  }
}

async function studyHistory(id) {
  const s = SEARCH.studies.find((x) => x.id === id);
  const h = await api(`mine/study/${id}/history`);
  $("#mine-body").innerHTML = `<h3>${esc(s.title)}</h3>${h.revisions.slice().reverse().map((r) => `<div class="rev"><div class="meta">Revision ${r.rev} · ${esc(r.event)} · ${esc(r.saved_at)} · ${esc(r.label || "")}${
    r.rev === s.rev ? " · <b>current</b>" : ` · <button class="link-btn" data-study-restore="${id}" data-rev="${r.rev}" data-base="${s.rev}">Bring this version back</button>`}</div>
    <div class="md">${r.body.trim() ? md(r.body, "fn-sr-" + r.rev) : `<p class="meta">(no notes)</p>`}</div></div>`).join("")}`;
  $("#mine-dialog").showModal();
}

// ------------------------------------------------------------------ the word box: this word elsewhere in Plato

function renderElsewhere(t) {
  // Milestone 23: a word of the New Testament is counted in the New Testament first; the other corpus follows (nt.js).
  const nt = t.corpus === "nt";
  // Aristotle milestone A7: a word of Aristotle's is counted in Aristotle first.
  const ar = t.corpus === "aristotle" && !!t.elsewhere_ar;
  const list = nt ? t.elsewhere_nt : ar ? t.elsewhere_ar : t.elsewhere;
  const formN = nt ? t.form_in_nt : ar ? t.form_in_ar : t.form_in_plato;
  const where = nt ? "the New Testament" : ar ? "Aristotle" : "Plato";
  const corpus = nt ? "nt" : ar ? "aristotle" : "plato";
  const other = (typeof renderOtherCorpus === "function" ? renderOtherCorpus(t) : "") + (typeof renderArOtherCorpus === "function" ? renderArOtherCorpus(t, ar) : "");
  if (!list || !list.length) {
    return (formN ? `<div class="box elsewhere"><h3>Elsewhere in ${where}</h3><p>This form occurs ${fmt(formN)}× in ${where}.
      <button class="link-btn" data-search-q="${esc(t.form)}" data-search-by="form" data-search-corpus="${corpus}">Every occurrence</button></p></div>` : "") + other;
  }
  return `<div class="box elsewhere"><h3>Elsewhere in ${where} ${nt ? "" : `<span class="badge">machine</span>`}</h3>${list.map((e) => {
    const top = e.counts.slice(0, 6);
    const max = Math.max(...top.map((c) => c.n), 1);
    return `<p><span class="lemma" lang="grc">${esc(e.lemma)}</span>: <b>${fmt(e.total)}</b>× in ${e.works} of ${nt ? "27 books" : ar ? `${typeof arWorks === "function" ? arWorks().length : ""} works` : "36 works"}.
      <button class="link-btn" data-search-q="${esc(e.lemma)}" data-search-by="lemma" data-search-corpus="${corpus}">Every occurrence</button></p>
      <table class="mini-counts">${top.map((c) => `<tr class="${c.work_id === t.work_id ? "here" : ""}"><td>${esc(c.title)}</td><td class="num">${fmt(c.n)}</td>
        <td class="bar"><span style="width:${Math.round(100 * c.n / max)}%"></span></td></tr>`).join("")}</table>`;
  }).join("")}<p class="prov">Counted from ${nt ? "MorphGNT's" : "GLAUx's tagged"} lemmas. This exact form, <span lang="grc">${esc(t.form)}</span>, occurs ${fmt(formN)}×:
    <button class="link-btn" data-search-q="${esc(t.form)}" data-search-by="form" data-search-corpus="${corpus}">every occurrence of the form</button>.</p></div>` + other;
}

// ------------------------------------------------------------------ events

let suggestTimer = null;
document.addEventListener("input", (ev) => {
  if (ev.target.id !== "sq") return;
  clearTimeout(suggestTimer);
  const q = ev.target.value.trim();
  if (q.length < 2 || q.endsWith("*")) return;
  suggestTimer = setTimeout(async () => {
    try {
      const s = await api("suggest?q=" + encodeURIComponent(q) + "&corpus=" + SEARCH.corpus);
      const list = SEARCH.by === "lemma" ? s.lemmas : s.forms;
      const dl = $("#sq-list");
      if (dl) dl.innerHTML = list.map((x) => `<option value="${esc(x.term)}">${esc(x.term)} · ${fmt(x.total)}</option>`).join("");
    } catch (e) { /* no suggestions */ }
  }, 200);
});

document.addEventListener("submit", (ev) => {
  if (ev.target.id === "search-form") {
    ev.preventDefault();
    const by = ev.target.querySelector("input[name=by]:checked").value;
    SEARCH.hash = null;
    const corpus = (ev.target.querySelector("input[name=corpus]:checked") || {}).value || "plato";
    openSearch(ev.target.querySelector("#sq").value.trim(), by, { corpus });
  } else if (ev.target.id === "study-form") {
    ev.preventDefault();
    saveStudy(ev.target);
  }
});

document.addEventListener("change", async (ev) => {
  if (ev.target.name === "by" && ev.target.closest("#search-form")) SEARCH.by = ev.target.value;
  if (ev.target.name === "corpus" && ev.target.closest("#search-form")) {
    SEARCH.hash = null;
    openSearch(($("#sq") || {}).value || SEARCH.q, SEARCH.by, { corpus: ev.target.value });
  }
  if (ev.target.id === "show-deleted") {
    SEARCH.showDeleted = ev.target.checked;
    await loadStudies();
    renderSearchToc();
  }
});

document.addEventListener("click", async (ev) => {
  const t = ev.target;
  const sq = t.closest("[data-search-q]");
  if (sq) { ev.preventDefault(); SEARCH.hash = null; openSearch(sq.dataset.searchQ, sq.dataset.searchBy, { corpus: sq.dataset.searchCorpus || (state.work && state.view === "read" ? (isNT(state.work) ? "nt" : isAR(state.work) ? "aristotle" : "plato") : "plato") }); return; }
  if (t.closest("#search-btn")) { openSearch(SEARCH.q || "", SEARCH.by); return; }
  if (state.view !== "search" && !t.closest("#mine-dialog")) return;
  const kref = t.closest(".kref");
  if (kref) {
    ev.preventDefault();
    state.pendingWord = +kref.dataset.tok;
    location.hash = kref.getAttribute("href");
    return;
  }
  const row = t.closest("[data-filter-work]");
  if (row) {
    const w = row.dataset.filterWork;
    const works = SEARCH.works.includes(w) ? SEARCH.works.filter((x) => x !== w) : [...SEARCH.works, w];
    openSearch(SEARCH.q, SEARCH.by, { works, terms: SEARCH.terms, study: SEARCH.study });
    return;
  }
  if (t.closest("[data-clear-works]")) { openSearch(SEARCH.q, SEARCH.by, { terms: SEARCH.terms, study: SEARCH.study }); return; }
  const term = t.closest("[data-term]");
  if (term && SEARCH.result) {
    const all = SEARCH.result.terms.map((x) => x.term);
    const on = new Set(SEARCH.result.chosen);
    if (on.has(term.dataset.term)) on.delete(term.dataset.term); else on.add(term.dataset.term);
    if (!on.size) return;
    const terms = on.size === all.length ? null : all.filter((x) => on.has(x));
    openSearch(SEARCH.q, SEARCH.by, { works: SEARCH.works, terms, study: SEARCH.study });
    return;
  }
  const rq = t.closest("[data-research-q]");
  if (rq) { openSearch(rq.dataset.researchQ, SEARCH.by); return; }
  const rb = t.closest("[data-research]");
  if (rb) { openSearch(SEARCH.q, rb.dataset.research); return; }
  if (t.closest("#more-hits")) { moreHits(); return; }
  if (t.closest("#save-study")) { $("#study-new").innerHTML = studyForm(null); $("#study-form").title.select(); return; }
  if (t.closest("[data-study-cancel]")) { t.closest("form").remove(); return; }
  const ed = t.closest("[data-study-edit]");
  if (ed) { $("#study-edit").innerHTML = studyForm(SEARCH.studies.find((s) => s.id === +ed.dataset.studyEdit)); return; }
  const hi = t.closest("[data-study-history]");
  if (hi) { studyHistory(+hi.dataset.studyHistory); return; }
  const del = t.closest("[data-study-delete]");
  if (del) {
    const s = SEARCH.studies.find((x) => x.id === +del.dataset.studyDelete);
    if (!confirm(`Delete the word study “${s.title}”? It can be restored from “Show deleted”.`)) return;
    try { await send("POST", `mine/study/${s.id}/delete`, { base_rev: s.rev }); } catch (e) { alert("Not deleted: " + e.message); return; }
    await loadStudies();
    openSearch(s.query, s.by, { works: s.works || [], terms: s.terms });
    return;
  }
  const rs = t.closest("[data-study-restore]");
  if (rs) {
    const body = { base_rev: +rs.dataset.base };
    if (rs.dataset.rev) body.rev = +rs.dataset.rev;
    try { await send("POST", `mine/study/${rs.dataset.studyRestore}/restore`, body); } catch (e) { alert("Not restored: " + e.message); return; }
    if ($("#mine-dialog").open) $("#mine-dialog").close();
    await loadStudies();
    renderSearch();
  }
});
