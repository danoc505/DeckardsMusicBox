// Milestone 16: plain words and help everywhere. A "?" on every view (top right) and on every
// panel says in two sentences what it is for and what to tap, with the Workshop's own words it
// uses, each linked to "Words used in the Workshop" (#words): the word in plain English, the
// scholar's name for it, and the source it rests on (sources/structure/workshop-words.json).
// Also the Contents button that opens the left column on a narrower screen (the iPad).
// Shares the globals of reader.js and shell.js; loaded after shell.js.
"use strict";

const HELP = { data: null };

async function loadWords() {
  if (!HELP.data) {
    try { HELP.data = await api("words"); } catch (e) { HELP.data = null; }
  }
  return HELP.data;
}

// A small "?" that opens the help of a view or panel.
function helpQ(key, label) {
  return `<button type="button" class="help-q" data-help="${esc(key)}" aria-label="${esc(label || "What is this?")}" title="${esc(label || "What is this?")}">?</button>`;
}

// The view the address shows, as a key of the help.
function helpKey() {
  const h = location.hash.slice(1);
  if (!h) return "read";
  if (h.endsWith("/whole")) return "whole";
  for (const [p, k] of [["start", "start"], ["library", "library"], ["corpus", "corpus"], ["commentaries", "commentaries"], ["dossiers", "dossiers"],
    ["discussed", "discussed"], ["dictionary", "dictionary"], ["search", "concordance"], ["renderings/", "renderings"], ["concepts", "concepts"],
    ["glossary", "glossary"], ["words", "words"], ["taylor/", "taylor"], ["reconcile", "reconcile"], ["find", "find"], ["mine", "mine"]]) {
    if (h.startsWith(p)) return k;
  }
  return "read";
}

async function openHelp(key) {
  const d = await loadWords();
  const dlg = $("#help-dialog");
  const x = d && d.help[key];
  if (!x) {
    $("#help-title").textContent = "Help";
    $("#help-body").innerHTML = `<p>See <a href="#start">Start here</a> for how to read a page, and <a href="#words">Words used in the Workshop</a>.</p>`;
  } else {
    const byId = Object.fromEntries(d.words.map((w) => [w.id, w]));
    const words = x.words.map((id) => byId[id]).filter(Boolean);
    $("#help-title").textContent = x.title;
    $("#help-body").innerHTML = `<p>${esc(x.what)}</p><p>${esc(x.tap)}</p>
      ${words.length ? `<h3>Words used here</h3><dl class="help-words">${words.map((w) =>
        `<dt><a href="#words/${esc(w.id)}">${esc(w.term)}</a></dt><dd>${esc(w.plain.split(/(?<=\.)\s/)[0])}</dd>`).join("")}</dl>` : ""}
      <p class="meta"><a href="#words">Every word the Workshop uses, in plain English</a> · <a href="#start">Start here</a></p>`;
  }
  if (!dlg.open) dlg.showModal();
}

// ------------------------------------------------------------------ Words used in the Workshop

function wordSource(s) {
  const q = `“${esc(s.quote)}”`;
  if (s.url) {
    const chk = s.found === true ? ` <span class="meta">(words found on the page, ${esc(s.checked)})</span>` : s.found === false ? ` <span class="doubt-mark">(not found on the page when last checked)</span>` : "";
    return `<blockquote class="gq modern">${q}<cite><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.cited)}</a>${chk}</cite></blockquote>`;
  }
  if (s.manifest) return `<blockquote class="gq">${q}<cite>${esc(s.cited)} <span class="meta">(the library's record of this source)</span></cite></blockquote>`;
  return `<blockquote class="gq">${q}<cite>${esc(s.cited)} <span class="meta"><code>${esc(s.file)}</code></span></cite></blockquote>`;
}

async function showWords(id) {
  state.view = "words";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Words used in the Workshop · Platonic Workshop";
  const d = await loadWords();
  if (!d) { $("#main").innerHTML = `<p class="error">The list of words could not be loaded.</p>`; return; }
  const ws = [...d.words].sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
  $("#toc").innerHTML = `<h3>Words used here</h3><ul class="books">${ws.map((w) => `<li><a href="#words/${esc(w.id)}"><span>${esc(w.term)}</span></a></li>`).join("")}</ul>
    <p class="meta"><a href="#glossary">Plato's own terms</a> are in Taylor's glossary.</p>`;
  $("#main").innerHTML = `<div class="search guide words-page"><h2>Words used in the Workshop ${helpQ("words")}</h2>
    <p class="lead">The names of books, tools and ideas the Workshop's pages use, in plain English. For the words of Plato and the Platonists
      (soul, intellect, the One…), see <a href="#glossary">Taylor's glossary</a>.</p>
    <p class="meta">Each explanation is the Workshop's own (<span class="gq-tag own">${esc(d.plain_label)}</span>); under it, the sources it rests on, quoted.
      Where scholars use another name, it is given too.</p>
    ${ws.map((w) => `<section class="word-entry${w.id === id ? " target" : ""}" id="word-${esc(w.id)}"><h3>${esc(w.term)}${w.scholarly && w.scholarly !== w.term ? ` <span class="meta">scholars say: ${esc(w.scholarly)}</span>` : ""}</h3>
      <p>${esc(w.plain)}</p><details class="why-here"><summary>Sources</summary>${w.sources.map(wordSource).join("")}</details></section>`).join("")}</div>`;
  const el = id && document.getElementById("word-" + id);
  if (el) { el.scrollIntoView({ block: "start" }); el.querySelector("details").open = true; } else window.scrollTo(0, 0);
}

// The routes of milestone 16, before shell.js's.
const _routeM16 = route;
route = function (push) {  // eslint-disable-line no-global-assign
  const raw = location.hash.slice(1);
  closeContents();
  if (raw === "words" || raw.startsWith("words/")) {
    document.body.classList.remove(...VIEW_CLASSES);
    markNav();
    showWords(decodeURIComponent(raw.slice(6)));
    return;
  }
  _routeM16(push);
};

// ------------------------------------------------------------------ the "?" on every panel

// Panels drawn by the other files get their "?" here, on the first of each kind on the page,
// so that a page of thirty sections does not carry thirty of them.
const PANEL_HELP = [
  ["#main .trans-bar:not(.comm-bar) .tb-k", "translations"],
  ["#main .comm-bar .tb-k", "commentary"],
  ["#main .cm-row .app-k", "commentary"],
  ["#main .app-links .app-k", "links"],
  ["#main .mine-row .app-k", "mywork"],
  ["#inspector .insp-form", "word"],
  ["#dict > h3", "dict"],
  ["#toc > h3", "contents"],
  [".gloss-body > p:first-child", "gloss"],
];
let helpBusy = false;
function addPanelHelp() {
  if (helpBusy) return;
  helpBusy = true;
  for (const [sel, key] of PANEL_HELP) {
    if (key === "contents" && state.view !== "read") continue;
    const el = document.querySelector(sel);
    if (el && !el.querySelector(".help-q")) el.insertAdjacentHTML("beforeend", " " + helpQ(key));
  }
  helpBusy = false;
}
const helpObserver = new MutationObserver(() => { if (!helpBusy) requestAnimationFrame(addPanelHelp); });
helpObserver.observe(document.body, { childList: true, subtree: true });

// ------------------------------------------------------------------ Contents on a narrower screen

function closeContents() { document.body.classList.remove("toc-open"); $("#toc-btn")?.setAttribute("aria-expanded", "false"); }

document.addEventListener("click", (ev) => {
  const q = ev.target.closest("[data-help]");
  if (q) { ev.preventDefault(); ev.stopPropagation(); openHelp(q.dataset.help); return; }
  if (ev.target.closest("#help-btn")) { openHelp(helpKey()); return; }
  if (ev.target.closest("#help-dialog a")) { $("#help-dialog").close(); return; }
  if (ev.target.closest("#toc-btn")) {
    const open = document.body.classList.toggle("toc-open");
    $("#toc-btn").setAttribute("aria-expanded", String(open));
    if (open && !$("#toc .toc-close")) $("#toc").insertAdjacentHTML("afterbegin", `<button type="button" class="toc-close">× Close</button>`);
    return;
  }
  if (document.body.classList.contains("toc-open") && (ev.target.closest("#toc a") || ev.target.closest(".toc-scrim") || ev.target.closest(".toc-close"))) closeContents();
}, true);
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") closeContents();
  if (ev.key === "?" && !ev.target.matches("input, textarea, select")) { ev.preventDefault(); openHelp(helpKey()); }
});
