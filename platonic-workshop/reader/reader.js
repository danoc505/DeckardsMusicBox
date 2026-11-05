// Platonic Workshop reader (milestone 2). No libraries, no build step.
"use strict";

const WORK = "tlg031";
const state = { work: null, page: null, data: null, selected: null, target: null };
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STEPH = /^(\d{1,3})([a-e])?$/;

async function api(path) {
  const r = await fetch("/api/" + path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

// ------------------------------------------------------------------ layers

const LAYERS = { eng: "no-eng", notes: "no-notes", links: "no-links", mine: "no-mine" };
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
  const m = STEPH.exec(String(s).trim().toLowerCase().replace(/\s+/g, ""));
  if (!m) return null;
  return { page: +m[1], ref: m[2] ? m[1] + m[2] : null };
}

function go(refOrPage, push = true) {
  const p = parseRef(refOrPage);
  if (!p || !state.work) return false;
  const ok = p.ref ? state.work.sections.includes(p.ref) : state.work.sections.some((r) => parseInt(r) === p.page);
  if (!ok) return false;
  const hash = "#" + (p.ref || String(p.page));
  if (push && location.hash !== hash) history.pushState(null, "", hash);
  state.target = p.ref;
  loadPage(p.page);
  return true;
}

async function loadPage(page) {
  if (state.page === page && state.data) { scrollToTarget(); return; }
  $("#main").innerHTML = `<p class="loading">Loading page ${page}…</p>`;
  try {
    state.data = await api(`page/${WORK}/${page}`);
    state.page = page;
    renderPage();
    renderToc();
    scrollToTarget();
  } catch (e) {
    $("#main").innerHTML = `<p class="error">Could not load page ${page}: ${esc(e.message)}</p>`;
  }
}

function scrollToTarget() {
  document.querySelectorAll(".sec.target").forEach((s) => s.classList.remove("target"));
  const id = state.target;
  const el = id && document.getElementById("s-" + id);
  if (el) { el.classList.add("target"); el.scrollIntoView({ block: "start" }); }
  else window.scrollTo(0, 0);
  $("#jump-ref").value = id || String(state.page);
  $("#prev").disabled = !state.data.prev;
  $("#next").disabled = !state.data.next;
}

// ------------------------------------------------------------------ rendering

function renderChunkGreek(chunk, tokens) {
  let out = "", pos = 0;
  const t = chunk.text;
  for (const tok of tokens) {
    out += esc(t.slice(pos, tok.start));
    const cls = "w" + (tok.tagged ? "" : " untagged") + (state.selected === tok.id ? " sel" : "");
    out += `<span class="${cls}" data-t="${tok.id}">${esc(t.slice(tok.start, tok.end))}</span>`;
    pos = tok.end;
  }
  return out + esc(t.slice(pos));
}

function renderChunkEnglish(chunk, notes, numbers) {
  // Note markers are placed at the character offset where the TEI printed them.
  const here = notes.filter((n) => n.chunk_id === chunk.id).sort((a, b) => a.offset - b.offset);
  let out = "", pos = 0;
  for (const n of here) {
    const at = Math.min(n.offset, chunk.text.length);
    out += esc(chunk.text.slice(pos, at)) + `<sup><a href="#note-${n.id}" data-note="${n.id}" title="${esc(n.commentator)}">${numbers.get(n.id)}</a></sup>`;
    pos = at;
  }
  return out + esc(chunk.text.slice(pos));
}

function speakerLabel(c) {
  return c.label ? `<span class="speaker" title="${esc(c.speaker || "")}">${esc(c.label)}</span>` : "";
}

function renderPage() {
  const d = state.data;
  const w = state.work;
  const grcEd = w.editions.find((e) => e.lang === "grc");
  const engEd = w.editions.find((e) => e.lang === "eng");
  const tokByChunk = new Map();
  for (const t of d.tokens) {
    if (!tokByChunk.has(t.chunk_id)) tokByChunk.set(t.chunk_id, []);
    tokByChunk.get(t.chunk_id).push(t);
  }
  const numbers = new Map(d.notes.map((n, i) => [n.id, i + 1]));
  const lastPara = {};
  let html = `<div class="page-head"><h1>${d.page}</h1><span>Stephanus page ${d.page}, sections ${esc(d.sections[0].ref)}–${esc(d.sections[d.sections.length - 1].ref)}</span></div>`;
  if (!d.mine.length) html += `<p class="page-note mine-note">Your work: nothing on this page yet. Writing translations and notes arrives in milestone 4, kept apart from the imported texts in data/user.sqlite.</p>`;
  html += `<div class="cols-head"><span></span><span>Greek · ${esc(grcEd.label)}</span><span class="eng-h">English · ${esc(engEd.label)}</span></div>`;

  for (const s of d.sections) {
    const g = d.chunks.filter((c) => c.lang === "grc" && c.section_ref === s.ref);
    const e = d.chunks.filter((c) => c.lang === "eng" && c.section_ref === s.ref);
    const para = (c, lang) => {
      const cont = lastPara[lang] === c.para;
      lastPara[lang] = c.para;
      return cont ? ' class="cont"' : "";
    };
    const grc = g.map((c) => `<p${para(c, "grc")}>${speakerLabel(c)}${renderChunkGreek(c, tokByChunk.get(c.id) || [])}</p>`).join("");
    const eng = e.map((c) => `<p${para(c, "eng")}>${speakerLabel(c)}${renderChunkEnglish(c, d.notes, numbers)}</p>`).join("");
    html += `<section class="sec" id="s-${s.ref}" data-ref="${s.ref}">
      <button class="ref" data-copy="${esc(s.urn)}" title="${esc(s.urn)} (click to copy)">${s.ref}</button>
      <div class="grc" lang="grc">${grc}</div>
      <div class="eng" lang="en">${eng}</div>
      <div class="app">${renderApparatus(s, d, numbers)}</div>
    </section>`;
  }
  html += `<div class="pager">${d.prev ? `<a href="#${d.prev}">‹ page ${d.prev}</a>` : "<span></span>"}${d.next ? `<a href="#${d.next}">page ${d.next} ›</a>` : "<span></span>"}</div>`;
  $("#main").innerHTML = html;
}

function linkChip(to_work, to_ref, label, imported, title) {
  if (to_work === WORK && imported) {
    return `<a class="chip" href="#${esc(to_ref)}" title="${esc(title)}">${esc(label)}</a>`;
  }
  return `<span class="chip off" title="${esc(title)} · not in the library yet (all of Plato arrives in milestone 5)">${esc(label)}</span>`;
}

function renderApparatus(s, d, numbers) {
  const rows = [];
  const notes = d.notes.filter((n) => n.start_ref === s.ref);
  if (notes.length) {
    const items = notes.map((n) => `<li id="note-${n.id}"><span class="n">${numbers.get(n.id)}</span>${n.body_html}
      <span class="meta"> · ${esc(n.commentator)} · anchored by ${esc(n.anchor_method)} · ${esc(n.proof_status)}</span></li>`).join("");
    rows.push(`<div class="app-row app-notes"><div class="app-k">Commentary</div><div class="app-v"><ul class="notes">${items}</ul></div></div>`);
  }
  const out = d.links_out.filter((l) => l.from_ref === s.ref);
  if (out.length) {
    const chips = out.map((l) => {
      const label = l.to_work === WORK ? `Tim. ${l.to_ref}` : `${l.to_title} ${l.to_ref}`;
      return linkChip(l.to_work, l.to_ref, label, l.to_imported, `“${l.raw}” in note ${numbers.get(l.note_id) ?? ""}, read by ${l.method}`);
    }).join("");
    rows.push(`<div class="app-row app-links"><div class="app-k">Points to</div><div class="app-v chips">${chips}</div></div>`);
  }
  const page = String(parseInt(s.ref));
  const inn = d.links_in.filter((l) => l.to_ref === s.ref || (l.to_ref === page && s.ref.endsWith("a")));
  if (inn.length) {
    const chips = inn.map((l) => linkChip(l.from_work, l.from_ref, `${l.from_work === WORK ? "Tim." : l.from_title} ${l.from_ref}`, true,
      `Bury's note at ${l.from_ref} cites “${l.raw}”`)).join("");
    rows.push(`<div class="app-row app-links"><div class="app-k">Cited from</div><div class="app-v chips">${chips}</div></div>`);
  }
  const mine = d.mine.filter((m) => m.start_ref === s.ref);
  if (mine.length) {
    rows.push(`<div class="app-row mine-row"><div class="app-k">Your work</div><div class="app-v">${
      mine.map((m) => `<div class="mine-item"><span class="meta">${esc(m.kind)}${m.words ? " on " + esc(m.words) : ""} · ${esc(m.updated_at)}</span><br>${esc(m.body)}</div>`).join("")
    }</div></div>`);
  }
  return rows.join("");
}

function renderToc() {
  const w = state.work;
  const pages = w.pages.map((p) => parseInt(p.start_ref));
  let html = `<h3>Stephanus pages</h3><div class="pages">${pages.map((p) => `<a href="#${p}" class="${p === state.page ? "here" : ""}">${p}</a>`).join("")}</div>`;
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
  html += `<h3>Who is speaking</h3><ul class="speeches">${merged.map((m) => {
    const here = cur.some((r) => seq.get(r) >= seq.get(m.start_ref) && seq.get(r) <= seq.get(m.end_ref));
    const label = m.labels.length > 2 ? "Dialogue" : m.labels.join(", ");
    return `<li class="${here ? "here" : ""}"><a href="#${m.start_ref}"><span>${esc(label)}</span><span>${m.start_ref === m.end_ref ? m.start_ref : m.start_ref + "–" + m.end_ref}</span></a></li>`;
  }).join("")}</ul><p class="note">From the speaker markup in the Perseus text. The parts of the argument and the dialogue's skopos are added in milestone 9.</p>`;
  $("#toc").innerHTML = html;
}

// ------------------------------------------------------------------ word inspector

async function inspect(id) {
  state.selected = id;
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  document.querySelectorAll(`.w[data-t="${id}"]`).forEach((e) => e.classList.add("sel"));
  document.body.classList.add("inspecting");
  const box = $("#inspector");
  box.innerHTML = `<p class="loading">…</p>`;
  let t;
  try { t = await api(`token/${id}`); } catch (e) { box.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  if (state.selected !== id) return;
  const g = t.sources["glaux-plato"], mo = t.sources["morpheus-analyses"];
  let html = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button>
    <div class="insp-form" lang="grc">${esc(t.form)}</div>
    <div class="insp-addr" title="CTS address of this word">${esc(t.address)}</div>`;
  if (t.tags.length) {
    const split = t.tags.length > 1;
    html += `<div class="box tagged"><h3>Tagged <span class="badge">machine</span></h3>`;
    for (const tag of t.tags) {
      html += `<div><span class="lemma" lang="grc">${esc(tag.lemma)}</span>${split ? ` <span class="meta">(part ${tag.part + 1}: <span lang="grc">${esc(tag.source_form)}</span>)</span>` : ""}</div>
        <dl class="feat">${tag.features.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}
        ${tag.relation ? `<dt>role in sentence</dt><dd>${esc(tag.relation)}</dd>` : ""}</dl>`;
    }
    const t0 = t.tags[0];
    html += `<p class="prov">GLAUx's single choice, made by a statistical tagger (${t0.analysis === "auto" ? "not hand-checked" : "hand-checked"}). Matched to this word by ${esc(t0.align_method)}.
      ${t.elsewhere_in_work ? `This lemma is tagged ${t.elsewhere_in_work}× in the Timaeus.` : ""}</p></div>`;
  } else {
    html += `<div class="box none"><h3>Not tagged</h3>GLAUx has no word that lines up with this one${/^\[|\]$/.test(t.form) ? "" : " (often a word Burnet brackets as spurious, which GLAUx leaves out)"}. The parses below are still every possibility.</div>`;
  }
  if (t.morph.length) {
    html += `<div class="box alts"><h3>Every possible parse <span class="badge warn">rule-based</span></h3><ol>${t.morph.map((m) =>
      `<li class="${m.matches_tag ? "agree" : ""}"><span class="l" lang="grc">${esc(m.lemma)}</span>${m.gloss ? ` <span class="g">${esc(m.gloss)}</span>` : ""}<br>${esc(m.parse)}${m.matches_tag ? ` <span class="agree-mark">· the tagger's choice</span>` : m.same_lemma_as_tag ? ` <span class="meta">· same lemma, other parse</span>` : ""}</li>`
    ).join("")}</ol><p class="prov">From the Morpheus analyser's table (key <code>${esc(t.morph_key)}</code>). No statistics: these are all the forms this spelling can be.</p></div>`;
  } else {
    html += `<div class="box alts"><h3>Every possible parse</h3><p class="prov">Morpheus has no entry for this spelling.</p></div>`;
  }
  html += `<details class="prov"><summary>Sources for this word</summary>
    <p><strong>${esc(g.title)}</strong><br>${esc(g.provenance)}<br>Licence: ${esc(g.licence)} · commit <code>${esc(g.commit_sha.slice(0, 10))}</code></p>
    <p><strong>${esc(mo.title)}</strong><br>${esc(mo.provenance)}<br>Licence: ${esc(mo.licence)} · commit <code>${esc(mo.commit_sha.slice(0, 10))}</code></p></details>
    <p class="later">Dictionary entries (Middle Liddell, LSJ) and plain-English grammar notes arrive in milestone 3; every occurrence across Plato in milestone 5.</p>`;
  box.innerHTML = html;
}

function closeInspector() {
  state.selected = null;
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  document.body.classList.remove("inspecting");
  $("#inspector").innerHTML = `<div class="inspector-empty"><p><strong>Click any Greek word</strong> for its tagged lemma and parse, with every other possible parse beside it.</p></div>`;
}

// ------------------------------------------------------------------ sources dialog

async function showSources() {
  const d = await api("sources");
  const stats = JSON.parse(d.build.stats || "[]")[0] || {};
  $("#about-body").innerHTML = `<p class="meta">Library built ${esc(d.build.built_at)}. Timaeus: ${stats.sections} sections, ${stats.tokens} Greek words, ${stats.tagged} tagged, ${stats.notes} notes, ${stats.links} links.</p>` +
    d.sources.map((s) => `<div class="src"><h4>${esc(s.title)}</h4>
      <div>${esc(s.provenance)}</div>
      <div class="meta">Layer: ${esc(s.layer)} · Licence: ${esc(s.licence)} · Status: ${esc(s.status)}${s.repo ? ` · <code>${esc(s.repo)}</code> @ <code>${esc((s.fetched_sha || s.commit_sha || "").slice(0, 10))}</code>` : ""}${s.path ? ` · <code>${esc(s.path)}</code>` : ""}</div></div>`).join("");
  $("#about").showModal();
}

// ------------------------------------------------------------------ events

document.addEventListener("click", (ev) => {
  const w = ev.target.closest(".w");
  if (w) { inspect(+w.dataset.t); return; }
  if (ev.target.closest(".insp-close")) { closeInspector(); return; }
  const ref = ev.target.closest(".ref");
  if (ref) {
    navigator.clipboard?.writeText(ref.dataset.copy).catch(() => {});
    const r = ref.closest(".sec").dataset.ref;
    history.replaceState(null, "", "#" + r);
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

$("#jump").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const inp = $("#jump-ref");
  const ok = go(inp.value);
  inp.classList.toggle("bad", !ok);
  if (ok) inp.blur();
});
$("#prev").addEventListener("click", () => state.data?.prev && go(state.data.prev));
$("#next").addEventListener("click", () => state.data?.next && go(state.data.next));
$("#about-btn").addEventListener("click", showSources);
window.addEventListener("hashchange", () => go(location.hash.slice(1) || "17", false));
document.addEventListener("keydown", (ev) => {
  if (ev.target.matches("input, textarea")) return;
  if (ev.key === "ArrowLeft" && state.data?.prev) go(state.data.prev);
  else if (ev.key === "ArrowRight" && state.data?.next) go(state.data.next);
  else if (ev.key === "g") { ev.preventDefault(); $("#jump-ref").select(); }
  else if (ev.key === "Escape") closeInspector();
});

(async function start() {
  loadLayers();
  try {
    state.work = await api(`work/${WORK}`);
  } catch (e) {
    $("#main").innerHTML = `<p class="error">The library is not built yet. Run <code>python3 tools/build_db.py</code>, then reload.</p>`;
    return;
  }
  const grc = state.work.editions.find((e) => e.lang === "grc");
  $("#work-title").textContent = state.work.title;
  $("#work-sub").textContent = `${grc.printed} · ${state.work.counts.notes} notes · ${state.work.counts.links_out} links`;
  document.title = `${state.work.title} · Platonic Workshop`;
  if (!go(location.hash.slice(1) || "17", false)) go("17", false);
})();
