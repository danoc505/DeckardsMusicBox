// Milestone 12: the Workshop's frame. The primary navigation (Library | Reader | Dictionary |
// Concordance | Concepts | Reconciliations | My Translations), the one search box (#find?q=),
// the light and dark themes, the text size, and the panels you can resize.
// Loaded last; shares the globals of reader.js and the other files.
"use strict";

const SHELL = { lastRead: null, find: null };
const NAV = [
  ["start", "Start here", "#start", "What this is, where to begin, and how to read a page"],
  ["library", "Library", "#library", "The dialogues, the passage dossiers, the commentaries, the corpus map and the sources"],
  ["read", "Reader", null, "Back to the passage you were reading"],
  ["dictionary", "Dictionary", "#dictionary", "Look up a Greek word in Middle Liddell and LSJ"],
  ["concordance", "Concordance", "#search", "Every place a Greek word occurs in Plato, by dictionary form, exact form or letters"],
  ["concepts", "Concepts", "#concepts", "The great ideas across the dialogues, with what the later Platonists made of them"],
  ["glossary", "Glossary", "#glossary", "Taylor's explanations of the Platonic terms, and the Workshop's own words in plain English"],
  ["reconcile", "Reconciliations", "#reconcile", "Passages that seem to disagree, and the ways of reconciling them"],
  ["mine", "My Translations", "#mine", "Everything you have written: translations, notes, word studies, worksheets"],
];
const VIEW_CLASSES = ["searching", "discussing", "whole-view", "corpus-view", "concepts-view", "commentaries-view",
  "dossiers-view", "reconcile-view", "find-view", "library-view", "dict-view", "mine-view", "guide-view"];

function prefsGet(k, d) { try { return localStorage.getItem("pw." + k) ?? d; } catch (e) { return d; } }
function prefsSet(k, v) { try { localStorage.setItem("pw." + k, v); } catch (e) { /* private window */ } }

// ------------------------------------------------------------------ navigation

function renderNav() {
  const nav = $("#primary-nav");
  nav.innerHTML = NAV.map(([id, label, href, title]) =>
    `<a href="${href || "#"}" data-nav="${id}" title="${esc(title)}">${esc(label)}</a>`).join("");
  markNav();
}

function currentNav() {
  const h = location.hash.slice(1);
  if (h === "start") return "start";
  if (h.startsWith("glossary") || h.startsWith("words")) return "glossary";
  if (h.startsWith("taylor/")) return "library";
  if (h.startsWith("library") || h === "corpus" || h.startsWith("corpus?") || h === "commentaries" || h.startsWith("discussed") || h.startsWith("dossiers")) return "library";
  if (h.startsWith("dictionary")) return "dictionary";
  if (h.startsWith("search") || h.startsWith("renderings/")) return "concordance";
  if (h.startsWith("concepts")) return "concepts";
  if (h.startsWith("reconcile")) return "reconcile";
  if (h.startsWith("mine")) return "mine";
  if (h.startsWith("find")) return "find";
  return "read";
}

function markNav() {
  const cur = currentNav();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("on", a.dataset.nav === cur);
    if (a.dataset.nav === cur) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.body.classList.toggle("reading", cur === "read");
  if (cur === "read" && /^#[\w-]+\/\d/.test(location.hash)) {
    SHELL.lastRead = location.hash;
    prefsSet("lastRead", location.hash);
  }
  const r = $('[data-nav="read"]');
  if (r) r.href = SHELL.lastRead || prefsGet("lastRead", "") || "#alcibiades-1";
}
window.addEventListener("hashchange", markNav);

// The views of milestone 12 are routed here, before reader.js's own route().
const _route = route;
route = function (push) {  // eslint-disable-line no-global-assign
  const raw = location.hash.slice(1);
  document.body.classList.remove(...VIEW_CLASSES.filter((c) => c !== "searching"));
  markNav();
  if (raw === "reconcile" || raw.startsWith("reconcile/")) { showReconcile(raw.slice(10)); return; }
  if (raw.startsWith("find")) { showFind(new URLSearchParams(raw.slice(5)).get("q") || ""); return; }
  if (raw === "library") { showLibrary(); return; }
  if (raw === "start") { prefsSet("seenStart", "1"); showStart(); return; }
  if (raw === "glossary" || raw.startsWith("glossary/")) { showGlossary(decodeURIComponent(raw.slice(9))); return; }
  if (raw.startsWith("taylor/")) { showTaylorText(decodeURIComponent(raw.slice(7))); return; }
  // A first visit, with no address and nothing read yet, opens Start here.
  if (!raw && !prefsGet("seenStart", "") && !prefsGet("lastRead", "")) { history.replaceState(null, "", "#start"); markNav(); prefsSet("seenStart", "1"); showStart(); return; }
  if (raw === "dictionary" || raw.startsWith("dictionary/")) { showDictionaryPage(decodeURIComponent(raw.slice(11))); return; }
  if (raw === "mine") { showMinePage(); return; }
  _route(push);
};
const _setView = setView;
setView = function (cls) {  // eslint-disable-line no-global-assign
  document.body.classList.remove(...VIEW_CLASSES);
  _setView(cls);
};

// ------------------------------------------------------------------ the one search box

function highlight(s) {
  return esc(s).replace(/\[\[(.*?)\]\]/g, "<mark>$1</mark>");
}

async function showFind(q) {
  state.view = "find";
  setView("find-view");
  $("#find-q").value = q;
  document.title = (q ? q + " · " : "") + "Search · Platonic Workshop";
  $("#toc").innerHTML = findHelp();
  if (!q) { $("#main").innerHTML = `<div class="search find"><h2>Search the Workshop</h2>${findIntro()}</div>`; return; }
  $("#main").innerHTML = `<p class="loading">Searching for ${esc(q)}…</p>`;
  let r;
  try {
    const resp = await fetch("/api/find?q=" + encodeURIComponent(q));
    r = await resp.json();
    if (!resp.ok) throw new Error(r.error || resp.status);
  } catch (e) {
    $("#main").innerHTML = `<div class="search find"><h2>Search the Workshop</h2><p class="error">${esc(e.message)}</p>${findIntro()}</div>`;
    return;
  }
  SHELL.find = r;
  let h = `<div class="search find"><h2>${r.total ? `${r.total.toLocaleString()} result${r.total === 1 ? "" : "s"}` : "Nothing found"} for <q>${esc(q)}</q></h2>
    <p class="prov">Read as: ${r.understood.map(esc).join("; ")}. Every result says why it was returned; nothing is ranked by meaning.</p>
    ${r.groups.length ? `<p class="find-jump">${r.groups.map((g, i) => `<a href="#find-g${i}" data-scroll="find-g${i}">${esc(g.label)} <span class="meta">${g.total.toLocaleString()}</span></a>`).join(" · ")}</p>` : ""}`;
  r.groups.forEach((g, i) => {
    h += `<section class="find-group" id="find-g${i}"><h3>${esc(g.label)} <span class="meta">${g.total.toLocaleString()}${g.results.length < g.total ? `, the first ${g.results.length} shown` : ""}</span></h3>
      ${g.summary ? `<p class="meta">${esc(g.summary)}</p>` : ""}<ol class="find-results">`;
    for (const x of g.results) {
      const title = x.ancient !== undefined
        ? `<button type="button" class="link-btn" data-ancient="${esc(x.ancient)}" data-at="${esc(x.at || "")}">${esc(x.title)}</button>`
        : `<a href="${esc(x.href)}">${esc(x.title)}</a>`;
      h += `<li>${title}${x.note_id ? ` <button type="button" class="link-btn meta" data-note-full="${x.note_id}">the whole note</button>` : ""}
        ${x.snippet ? `<div class="snip"${x.lang === "grc" ? ' lang="grc"' : ""}>${highlight(x.snippet)}</div>` : ""}
        <div class="why"><span class="why-k">why</span> ${esc(x.why)}</div></li>`;
    }
    h += `</ol>${g.more ? `<p><a href="${esc(g.more)}">Every occurrence, in the concordance</a></p>` : ""}</section>`;
  });
  if (!r.groups.length) h += findIntro();
  $("#main").innerHTML = h + `</div>`;
  window.scrollTo(0, 0);
}

function findIntro() {
  return `<p>One box for the whole library and your own work. Type a Greek word (<a href="#find?q=ἐπέκεινα">ἐπέκεινα</a>, or Beta Code <code>e)pe/keina</code>),
    English words (<a href="#find?q=${encodeURIComponent('"beyond being"')}">"beyond being"</a> in quotes for the exact phrase), a passage
    (<a href="#find?q=Rep.%20509b">Rep. 509b</a>), or a name (<a href="#find?q=Archer-Hind">Archer-Hind</a>). Narrow it with fields:</p>
    <table class="counts find-fields"><tbody>
    <tr><td><code>lemma:λόγος case:gen</code></td><td>a Greek word by its dictionary form (<a href="#words/lemma">lemma</a>), narrowed by its grammar (case, number, tense, mood, voice, person, gender, pos for part of speech, degree)</td></tr>
    <tr><td><code>form:λόγον</code> <code>plain:λογον</code></td><td>the exact form as printed, or the same letters with any accent</td></tr>
    <tr><td><code>english:</code> <code>greek:</code> <code>note:</code> <code>ancient:</code></td><td>only that text: the translations, Burnet's Greek, the commentary notes, the ancient texts</td></tr>
    <tr><td><code>in:Tim</code> <code>work:Republic</code></td><td>only in one dialogue</td></tr>
    <tr><td><code>by:Taylor</code> <code>translator:Jowett</code></td><td>only notes by that commentator, or English by that translator</td></tr>
    <tr><td><code>cites:Rep 509b</code></td><td>the notes anywhere that cite a passage (the citation web)</td></tr>
    <tr><td><code>concept:</code> <code>tension:</code> <code>method:allegorical</code></td><td>only the concept index, the reconciliation records, or the records reconciled by a method</td></tr>
    <tr><td><code>mine:</code></td><td>only your translations, notes, word studies and worksheets</td></tr></tbody></table>`;
}

function findHelp() {
  return `<h3>Search</h3><p class="meta">Fields narrow a search: <code>in:Rep</code>, <code>by:Proclus</code>, <code>lemma:ψυχή case:dat</code>, <code>cites:Tim 29e</code>, <code>mine:</code>.</p>
    <p class="meta">For every place a Greek word occurs, with counts per dialogue, use the <a href="#search">Concordance</a>.</p>`;
}

// ------------------------------------------------------------------ Library

async function showLibrary() {
  state.view = "library";
  setView("library-view");
  document.title = "Library · Platonic Workshop";
  await loadOrder();
  $("#toc").innerHTML = `<h3>Library</h3><ul class="books"><li><a href="#lib-dialogues" data-scroll="lib-dialogues"><span>The dialogues</span></a></li>
    <li><a href="#lib-shelf" data-scroll="lib-shelf"><span>Guides to Plato</span></a></li><li><a href="#corpus"><span>Corpus map</span></a></li><li><a href="#commentaries"><span>Commentaries</span></a></li>
    <li><a href="#dossiers"><span>Famous passages</span></a></li><li><a href="#discussed"><span>Most discussed passages</span></a></li><li><button type="button" class="link-btn" id="lib-sources">Sources</button></li></ul>`;
  const d = GUIDE.order;
  const o = d ? d.orders.find((x) => x.id === orderPref()) : null;
  let h = `<div class="search library"><h2>Library</h2>
    <p class="prov">The 36 works of Plato, in Burnet's Greek with the English translations and the commentaries the library holds. Open a dialogue to read it,
      or <em>about it</em> for what the tradition says of it as a whole.</p>
    <section id="lib-dialogues"><h3>The dialogues</h3>
    ${orderPicker()}${o ? `<p class="meta">${esc(o.plain)} <a href="#start">More in Start here.</a></p>` : ""}
    <div class="lib-grid">`;
  for (const g of workGroups()) {
    h += `<section><h4>${esc(g.label)}</h4>${g.note ? `<p class="meta">${esc(g.note)}</p>` : ""}<ul${g.rest ? "" : ' class="numbered"'}>${g.steps.map((s) => {
      const w = workById(s.work);
      return `<li>${s.n ? `<span class="meta">${s.n}.</span> ` : ""}<a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a>${s.role ? ` <span class="meta">${esc(s.role)}</span>` : ""}
        · <a href="#${esc(w.slug)}/whole" class="meta">about it</a></li>`;
    }).join("")}</ul></section>`;
  }
  h += `</div></section>
    <section id="lib-shelf"><h3>Guides to Plato</h3><p class="meta">Introductions written by Platonists, ancient and modern, to read whole.</p>${shelfList()}</section>
    <section><h3>More</h3><p><a class="btn" href="#corpus">Corpus map</a> <a class="btn" href="#dossiers">Famous passages</a> <a class="btn" href="#commentaries">Every commentary</a> <a class="btn" href="#discussed">The passages the notes cite most</a>
      <button type="button" class="btn" id="lib-sources2">Sources and licences</button></p></section>`;
  $("#main").innerHTML = h + `</div>`;
}

// ------------------------------------------------------------------ Dictionary

async function showDictionaryPage(word) {
  state.view = "dictionary";
  setView("dict-view");
  document.title = (word ? word + " · " : "") + "Dictionary · Platonic Workshop";
  $("#toc").innerHTML = `<h3>Dictionary</h3><p class="meta">The two Greek-English dictionaries, as printed: <a href="#words/middle-liddell">Middle Liddell</a> (1889, short entries) and <a href="#words/lsj">LSJ</a> (1940, full entries). A word is matched by its dictionary form; a form as printed in the text is matched by its letters.</p>`;
  $("#main").innerHTML = `<div class="search dictionary"><h2>Dictionary</h2>
    <form id="dict-form" class="dict-form"><label>Greek word or Beta Code <input id="dict-q" value="${esc(word)}" placeholder="λόγος or lo/gos" lang="grc" autocomplete="off"></label>
      <button class="btn" type="submit">Look up</button></form>
    <div class="box" id="dict">${word ? `<p class="loading">Looking up ${esc(word)}…</p>` : `<p class="meta">Type a word. In the Reader, tap any Greek word for its grammar with its entries beside it.</p>`}</div>
    <div id="dict-elsewhere"></div></div>`;
  if (!word) return;
  let w = word;
  if (/[A-Za-z]/.test(w)) {
    try { const s = await api(`suggest?q=${encodeURIComponent(w)}`); if (s.lemmas[0]) w = s.lemmas[0].term; } catch (e) { /* keep what was typed */ }
  }
  try {
    showDict(await api(`lookup/${encodeURIComponent(w)}`), false);
    const e = await api(`elsewhere/${encodeURIComponent(w)}`);
    if (e.total) $("#dict-elsewhere").innerHTML = `<p class="meta">${e.total.toLocaleString()} words in ${e.works} works of Plato have the dictionary form <span lang="grc">${esc(e.lemma)}</span> (as GLAUx marks them): <a href="#search?q=${encodeURIComponent(e.lemma)}&by=lemma">every one, in the concordance</a>.</p>`;
  } catch (e) { $("#dict").innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

// The dictionary entries of a word, over whatever page is open (the reconciliation records use it).
async function showDictionaryDialog(lemma) {
  $("#entry-title").textContent = lemma;
  $("#entry-body").innerHTML = `<div class="box" id="dict"><p class="loading">…</p></div>`;
  $("#entry-dialog").showModal();
  try { showDict(await api(`lookup/${encodeURIComponent(lemma)}`), true); } catch (e) { $("#dict").innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
document.getElementById("entry-dialog")?.addEventListener("close", () => { if (state.view !== "read") $("#entry-body").innerHTML = ""; });

// ------------------------------------------------------------------ My Translations

async function showMinePage() {
  state.view = "mine";
  setView("mine-view");
  document.title = "My Translations · Platonic Workshop";
  $("#main").innerHTML = `<p class="loading">Gathering your work…</p>`;
  let r;
  try { r = await api("mine/all"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  const n = r.works.reduce((a, w) => a + w.items.length, 0);
  $("#toc").innerHTML = `<h3>My Translations</h3><ul class="books">${r.works.map((w) => `<li><a href="#mine-${esc(w.id)}" data-scroll="mine-${esc(w.id)}"><span>${esc(w.title)}</span><span>${w.items.length}</span></a></li>`).join("")}
    ${r.studies.length ? `<li><a href="#mine-studies" data-scroll="mine-studies"><span>Word studies</span><span>${r.studies.length}</span></a></li>` : ""}
    ${r.sheets.length ? `<li><a href="#mine-sheets" data-scroll="mine-sheets"><span>Reconciliations</span><span>${r.sheets.length}</span></a></li>` : ""}</ul>`;
  let h = `<div class="search mine-page"><h2>My Translations</h2>
    <p class="prov">Everything you have written, kept in <code>data/user.sqlite</code> with every version. A rebuild of the library never touches it.
      ${n} translation${n === 1 ? "" : "s"} and notes, ${r.studies.length} word stud${r.studies.length === 1 ? "y" : "ies"}, ${r.sheets.length} reconciliation worksheet${r.sheets.length === 1 ? "" : "s"}, ${r.methods.length} method${r.methods.length === 1 ? "" : "s"} of your own.</p>
    <p><a class="btn" href="/api/export/my-plato.md" download>Export as Markdown</a> <a class="btn" href="/api/export/my-plato.json" download>Export as JSON (every version)</a>
      <a class="btn" href="/api/export/user.sqlite" download>Copy of the database</a> <button type="button" class="btn" id="mine-btn">Restore deleted translations and notes</button></p>`;
  if (!n && !r.studies.length && !r.sheets.length) h += `<p class="none-msg">Nothing yet. In the Reader, select Greek words to translate them or write a note; in Reconciliations, start a worksheet.</p>`;
  for (const w of r.works) {
    h += `<section id="mine-${esc(w.id)}"><h3><a href="#${esc(w.slug)}">${esc(w.title)}</a></h3><ul class="mine-list">${w.items.map((i) =>
      `<li><a href="#${esc(w.slug)}/${esc(i.start_ref)}"><b>${esc(KIND_LABEL[i.kind] || i.kind)}</b> ${esc(spanLabel(i))}</a>${i.label ? " · " + esc(i.label) : ""}
        <span class="meta">revision ${i.rev}, ${esc(i.updated_at.slice(0, 10))}</span>${i.words ? `<div lang="grc" class="meta">${esc(i.words.slice(0, 160))}</div>` : ""}
        <div class="md">${renderBody(i, "fn-mp-" + itemKey(i))}</div></li>`).join("")}</ul></section>`;
  }
  if (r.studies.length) h += `<section id="mine-studies"><h3>Word studies</h3><ul>${r.studies.map((s) => `<li><a href="#search?q=${encodeURIComponent(s.query)}&by=${esc(s.by)}&study=${s.id}">${esc(s.title)}</a> <span class="meta" lang="grc">${esc(s.query)}</span></li>`).join("")}</ul></section>`;
  if (r.sheets.length || r.deleted_sheets.length) {
    h += `<section id="mine-sheets"><h3>Reconciliation worksheets</h3><ul>${r.sheets.map((s) => `<li><a href="#reconcile/sheet/${s.id}">${esc(s.title)}</a> <span class="meta">${s.sheet.status === "proposal" ? "your proposal" : "in progress"} · revision ${s.rev}</span></li>`).join("")}
      ${r.deleted_sheets.map((s) => `<li class="meta"><a href="#reconcile/sheet/${s.id}">${esc(s.title)}</a> · deleted ${esc(s.deleted_at)}: open it to restore</li>`).join("")}</ul></section>`;
  }
  $("#main").innerHTML = h + `</div>`;
}

// ------------------------------------------------------------------ theme, text size, panels

function applyTheme(t) {
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  const b = $("#theme-btn");
  if (b) {
    b.textContent = { light: "Light", dark: "Dark" }[t] || "Auto";
    b.title = `Theme: ${{ light: "light", dark: "dark" }[t] || "as your system (auto)"}. Click for ${{ light: "dark", dark: "auto" }[t] || "light"}.`;
    b.setAttribute("aria-label", b.title);
  }
}
function applyScale(s) {
  s = Math.min(1.6, Math.max(0.8, +s || 1));
  document.documentElement.style.setProperty("--scale", s);
  const out = $("#size-val");
  if (out) out.textContent = Math.round(s * 100) + "%";
  return s;
}
function applyPanels() {
  const toc = +prefsGet("tocW", 0), insp = +prefsGet("inspW", 0);
  if (toc) document.documentElement.style.setProperty("--toc-w", toc + "px");
  if (insp) document.documentElement.style.setProperty("--insp-w", insp + "px");
}

function startResize(ev, which) {
  ev.preventDefault();
  const x0 = ev.clientX;
  const el = which === "toc" ? $("#toc") : $("#inspector");
  const w0 = el.getBoundingClientRect().width;
  document.body.classList.add("resizing");
  const move = (e) => {
    const w = Math.round(Math.min(700, Math.max(which === "toc" ? 110 : 240, w0 + (which === "toc" ? e.clientX - x0 : x0 - e.clientX))));
    document.documentElement.style.setProperty(which === "toc" ? "--toc-w" : "--insp-w", w + "px");
    prefsSet(which === "toc" ? "tocW" : "inspW", String(w));
  };
  const up = () => { document.body.classList.remove("resizing"); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

document.addEventListener("pointerdown", (ev) => {
  const h = ev.target.closest("[data-resize]");
  if (h) startResize(ev, h.dataset.resize);
});
document.addEventListener("keydown", (ev) => {
  const h = ev.target.closest && ev.target.closest("[data-resize]");
  if (!h || (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight")) return;
  ev.preventDefault();
  const which = h.dataset.resize;
  const el = which === "toc" ? $("#toc") : $("#inspector");
  const sign = (ev.key === "ArrowRight") === (which === "toc") ? 1 : -1;
  const w = Math.round(Math.min(700, Math.max(110, el.getBoundingClientRect().width + 20 * sign)));
  document.documentElement.style.setProperty(which === "toc" ? "--toc-w" : "--insp-w", w + "px");
  prefsSet(which === "toc" ? "tocW" : "inspW", String(w));
});

document.addEventListener("click", (ev) => {
  const t = ev.target;
  if (t.closest("#theme-btn")) {
    const next = { auto: "light", light: "dark", dark: "auto" }[prefsGet("theme", "auto")] || "light";
    prefsSet("theme", next);
    applyTheme(next);
    return;
  }
  const sz = t.closest("[data-size]");
  if (sz) {
    const cur = +prefsGet("scale", 1) || 1;
    const s = applyScale(sz.dataset.size === "reset" ? 1 : cur + (sz.dataset.size === "up" ? 0.1 : -0.1));
    prefsSet("scale", String(s));
    return;
  }
  if (t.closest("#lib-sources, #lib-sources2")) { showSources(); return; }
  const sc = t.closest("[data-scroll]");
  if (sc) { ev.preventDefault(); document.getElementById(sc.dataset.scroll)?.scrollIntoView({ block: "start" }); }
});

document.addEventListener("submit", (ev) => {
  if (ev.target.id === "find-form") {
    ev.preventDefault();
    const q = $("#find-q").value.trim();
    const h = "#find?q=" + encodeURIComponent(q);
    if (location.hash === h) showFind(q); else location.hash = h;
  }
  if (ev.target.id === "dict-form") {
    ev.preventDefault();
    location.hash = "#dictionary/" + encodeURIComponent($("#dict-q").value.trim());
  }
});
document.addEventListener("keydown", (ev) => {
  if (ev.target.matches("input, textarea, select")) return;
  if (ev.key === "f" && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); $("#find-q").select(); }
});

// The sticky panels sit under the bar, whose height changes with the view and the window.
const barObserver = new ResizeObserver(() => {
  document.documentElement.style.setProperty("--bar-h", Math.round($(".bar").getBoundingClientRect().height) + "px");
});
barObserver.observe($(".bar"));

applyTheme(prefsGet("theme", "auto"));
applyScale(prefsGet("scale", 1));
applyPanels();
renderNav();
