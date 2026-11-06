// The Workshop made easier to use on the iPad (and everywhere): choosing what to read,
// the Show menu, side columns that fold away, and short notes on screen in place of alerts.
// Loaded last; shares the globals of reader.js, shell.js, guide.js and listen.js.
"use strict";

// ------------------------------------------------------------------ short notes on screen

// A note at the foot of the screen that goes by itself (in place of alert(), which stops the page).
function toast(msg, ms = 4000) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    t.addEventListener("click", () => t.classList.remove("on"));
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("on"), ms);
}

// ------------------------------------------------------------------ where you were in each dialogue

function placesGet() {
  try { return JSON.parse(localStorage.getItem("pw.places") || "{}"); } catch (e) { return {}; }
}
function rememberPlace() {
  const m = /^#([\w-]+)\/(\d{1,3}[a-e]?|\d{1,3}:\d{1,3})$/.exec(decodeURIComponent(location.hash));
  if (!m || typeof state === "undefined") return;
  const w = state.works.find((x) => x.slug === m[1] || x.id === m[1]);
  if (!w) return;
  const p = placesGet();
  p[w.id] = m[2];
  try { localStorage.setItem("pw.places", JSON.stringify(p)); } catch (e) { /* private window */ }
}
window.addEventListener("hashchange", rememberPlace);

// ------------------------------------------------------------------ choosing what to read

function updateTextBtn() {
  const t = document.getElementById("text-btn-title");
  if (t && state.work) t.textContent = state.work.title;
}
const _openWorkUx = openWork;
openWork = async function (workId) {  // eslint-disable-line no-global-assign
  const r = await _openWorkUx(workId);
  updateTextBtn();
  if (typeof renderListenEd === "function") renderListenEd();
  return r;
};

function openTextPicker() {
  renderTextPicker();
  const d = $("#text-dialog");
  if (!d.open) d.showModal();
  const f = $("#tp-filter");
  // On the iPad a box that takes the focus opens the keyboard over the list: only on a laptop.
  if (f && !matchMedia("(pointer: coarse)").matches) f.focus();
}

function renderTextPicker(filter = "") {
  const places = placesGet();
  const q = filter.trim().toLowerCase();
  const groups = workGroups();
  let list = "";
  for (const g of groups) {
    const steps = g.steps.filter((s) => {
      const w = workById(s.work);
      return !q || w.title.toLowerCase().includes(q) || (s.role || "").toLowerCase().includes(q) || (w.abbr || "").toLowerCase().includes(q);
    });
    if (!steps.length) continue;
    list += `<section class="tp-group"><h3>${esc(g.label)}</h3><div class="tp-works">${steps.map((s) => {
      const w = workById(s.work);
      const here = state.work && state.work.id === w.id;
      const at = places[w.id];
      return `<button type="button" class="tp-work${here ? " here" : ""}" data-open-work="${esc(w.id)}"${here ? ' aria-current="true"' : ""}>
        <b>${s.n ? `<span class="tp-n">${s.n}.</span> ` : ""}${esc(w.title)}</b>
        ${s.role ? `<span class="tp-role">${esc(s.role)}</span>` : ""}
        <span class="tp-at">${here ? "Reading now" : at ? `Go on from ${esc(at)}` : "From the start"}</span></button>`;
    }).join("")}</div></section>`;
  }
  if (!list) list = `<p class="meta">No dialogue has that name. Try part of a title: <em>rep</em>, <em>tim</em>, <em>symp</em>.</p>`;

  // On the page: the translations beside the Greek, and the one read aloud.
  let page = "";
  if (state.work && state.view === "read") {
    const eds = englishEditions();
    const p = transPrefs();
    const layerOn = (k) => { const b = document.querySelector(`[data-layer="${k}"]`); return b ? b.checked : true; };
    const ed = typeof listenEdition === "function" ? listenEdition() : null;
    page = `<section class="tp-page"><h3>On the page of ${esc(theTitle(state.work))}</h3>
      <div class="tp-chips">
        <label class="tp-chip"><input type="checkbox" data-tp-layer="grc" ${layerOn("grc") ? "checked" : ""}> Greek <small>${isNT(state.work) ? "SBLGNT" : "Burnet"}</small></label>
        ${eds.map((e) => `<label class="tp-chip"><input type="checkbox" data-trans="${esc(transKind(e))}" ${p[transKind(e)] ? "checked" : ""} ${layerOn("eng") ? "" : "disabled"}> ${esc(e.label)}${e.responsible ? ` <small>${esc(e.responsible)}</small>` : ""}</label>`).join("")}
      </div>
      ${eds.length > 1 && typeof listenKind === "function" ? `<label class="tp-listen">Read aloud <select data-listen-ed aria-label="Translation read aloud">${eds.map((e) => `<option value="${esc(transKind(e))}" ${ed && ed.id === e.id ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></label>` : ""}
      ${layerOn("eng") ? "" : `<p class="meta">The English is turned off under Show. <button type="button" class="link-btn" data-tp-layer-on="eng">Turn it on</button></p>`}
    </section>`;
  }
  const body = $("#text-body");
  const keep = $("#tp-filter") && document.activeElement === $("#tp-filter");
  body.innerHTML = `${page}
    <section class="tp-dialogues"><h3>Dialogues</h3>
      <div class="tp-tools"><input type="search" id="tp-filter" placeholder="Find a dialogue" value="${esc(filter)}" aria-label="Find a dialogue" autocomplete="off" spellcheck="false">${typeof orderPicker === "function" ? orderPicker("tp-order") : ""}</div>
      ${list}
    </section>
    ${typeof ntPicker === "function" ? ntPicker(filter) : ""}
    <p class="meta">Each dialogue opens where you last were in it. <a href="#library">The Library</a> has the guides to Plato and the commentaries too.</p>`;
  if (keep) { const f = $("#tp-filter"); f.focus(); f.setSelectionRange(f.value.length, f.value.length); }
}

document.addEventListener("input", (ev) => {
  if (ev.target.id === "tp-filter") renderTextPicker(ev.target.value);
});
document.addEventListener("change", (ev) => {
  const t = ev.target;
  if (!t.closest || !t.closest("#text-dialog")) return;
  if (t.dataset.tpLayer) {
    const box = document.querySelector(`[data-layer="${t.dataset.tpLayer}"]`);
    if (box) { box.checked = t.checked; box.dispatchEvent(new Event("change", { bubbles: true })); }
  }
  if (t.classList.contains("order-select")) setTimeout(() => renderTextPicker($("#tp-filter")?.value || ""), 0);
});

function openWorkFromPicker(id) {
  $("#text-dialog").close();
  const w = workById(id);
  if (!w) return;
  if (state.work && state.work.id === id && state.view === "read") return;
  const at = placesGet()[id];
  location.hash = "#" + w.slug + (at ? "/" + at : "");
}

// ------------------------------------------------------------------ the Show menu

function closeShowMenu() { const m = $("#show-menu"); if (m) m.open = false; }
function setLayers(on) {
  document.querySelectorAll("[data-layer]").forEach((box) => {
    const want = on[box.dataset.layer];
    if (want !== undefined && box.checked !== want) { box.checked = want; box.dispatchEvent(new Event("change", { bubbles: true })); }
  });
}

// ------------------------------------------------------------------ side columns that fold away

// On a wide screen the contents (left) and the side panel (right) are columns beside the text:
// each folds away with the tab on its edge, and the choice is remembered. A tap on a Greek word
// or a key term opens the panel again, since that is where its answer is. On a narrow screen
// the panel is a sheet over the foot of the page, and Hide closes it.
const wideToc = () => matchMedia("(min-width: 1151px)").matches;
const widePanel = () => matchMedia("(min-width: 861px)").matches;
function sideState() {
  const toc = prefsGet("tocHidden", "") === "1", insp = prefsGet("panelHidden", "") === "1";
  document.body.classList.toggle("toc-hidden", toc);
  document.body.classList.toggle("panel-hidden", insp);
  const tt = $("#toc-tab"), it = $("#insp-tab");
  if (tt) { tt.textContent = toc ? "Contents ›" : "‹"; tt.title = toc ? "Show the contents column" : "Hide the contents column"; tt.setAttribute("aria-expanded", String(!toc)); tt.setAttribute("aria-label", tt.title); }
  if (it) { it.textContent = insp ? "‹ Panel" : "›"; it.title = insp ? "Show the side panel (words, terms, notes)" : "Hide the side panel"; it.setAttribute("aria-expanded", String(!insp)); it.setAttribute("aria-label", it.title); }
}
function setSide(which, hidden) {
  prefsSet(which === "toc" ? "tocHidden" : "panelHidden", hidden ? "1" : "");
  sideState();
}
// A tap that fills the panel unfolds it.
function showPanelIfHidden() { if (document.body.classList.contains("panel-hidden")) setSide("insp", false); }
const _inspectUx = inspect;
inspect = function (...a) {  // eslint-disable-line no-global-assign
  showPanelIfHidden();
  return _inspectUx(...a);
};
if (typeof openTerm === "function") {
  const _openTermUx = openTerm;
  openTerm = function (...a) {  // eslint-disable-line no-global-assign
    showPanelIfHidden();
    return _openTermUx(...a);
  };
}

// ------------------------------------------------------------------ events

document.addEventListener("click", (ev) => {
  const t = ev.target;
  if (!t.closest) return;
  if (t.closest("#text-btn")) { openTextPicker(); return; }
  const ow = t.closest("[data-open-work]");
  if (ow) { openWorkFromPicker(ow.dataset.openWork); return; }
  const lo = t.closest("[data-tp-layer-on]");
  if (lo) { setLayers({ [lo.dataset.tpLayerOn]: true }); renderTextPicker($("#tp-filter")?.value || ""); return; }
  if (t.closest("#text-dialog a")) { $("#text-dialog").close(); return; }
  if (t.closest("#show-simple")) { setLayers({ grc: true, eng: true, notes: false, links: false, mine: false, terms: true, untagged: false }); closeShowMenu(); toast("Just the Greek and the English. Show brings back the notes."); return; }
  if (t.closest("#show-all")) { setLayers({ grc: true, eng: true, notes: true, links: true, mine: true, terms: true }); closeShowMenu(); return; }
  if (!t.closest("#show-menu")) closeShowMenu();
  if (t.closest("#toc-tab")) { setSide("toc", !document.body.classList.contains("toc-hidden")); return; }
  if (t.closest("#insp-tab")) { setSide("insp", !document.body.classList.contains("panel-hidden")); return; }
  if (t.closest("#panel-hide")) {
    if (widePanel()) setSide("insp", true);
    else closeInspector();
  }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") closeShowMenu();
  if (ev.target.matches && ev.target.matches("input, textarea, select")) return;
  if (ev.key === "o" && !ev.ctrlKey && !ev.metaKey && document.body.classList.contains("reading")) { ev.preventDefault(); openTextPicker(); }
});

(function initUx() {
  sideState();
  updateTextBtn();
  rememberPlace();
  // The work menu is filled after the library answers; the button follows it.
  const sel = $("#work-select");
  if (sel) sel.addEventListener("change", updateTextBtn);
})();
