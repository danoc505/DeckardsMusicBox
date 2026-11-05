// Platonic Workshop reader (milestones 2 to 4). No libraries, no build step.
// Your translations and notes (milestone 4) are in mywork.js.
"use strict";

const WORK = "tlg031";
const state = { work: null, page: null, data: null, selected: null, target: null, token: null, dict: null, lexica: [] };
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

function renderChunkGreek(chunk, tokens, idx) {
  let out = "", pos = 0;
  const t = chunk.text;
  for (const tok of tokens) {
    out += esc(t.slice(pos, tok.start));
    const mine = idx ? mineWordAttrs(tok.id, idx) : { cls: "", after: "" };
    const cls = "w" + (tok.tagged ? "" : " untagged") + (state.selected === tok.id ? " sel" : "") + mine.cls;
    out += `<span class="${cls}" data-t="${tok.id}">${esc(t.slice(tok.start, tok.end))}</span>${mine.after}`;
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
  const idx = MINE.idx = mineIndex(d);
  let html = `<div class="page-head"><h1>${d.page}</h1><span>Stephanus page ${d.page}, sections ${esc(d.sections[0].ref)}–${esc(d.sections[d.sections.length - 1].ref)}</span></div>`;
  if (!d.mine.length) html += `<p class="page-note mine-note">Your work: select Greek words to translate them or write a footnote, or use <em>Write on</em> under a section for the whole of it.</p>`;
  html += `<div class="cols-head"><span></span><span>Greek · ${esc(grcEd.label)}</span><span class="eng-h">English · ${esc(engEd.label)}</span></div>`;

  for (const s of d.sections) {
    const g = d.chunks.filter((c) => c.lang === "grc" && c.section_ref === s.ref);
    const e = d.chunks.filter((c) => c.lang === "eng" && c.section_ref === s.ref);
    const para = (c, lang) => {
      const cont = lastPara[lang] === c.para;
      lastPara[lang] = c.para;
      return cont ? ' class="cont"' : "";
    };
    const grc = g.map((c) => `<p${para(c, "grc")}>${speakerLabel(c)}${renderChunkGreek(c, tokByChunk.get(c.id) || [], idx)}</p>`).join("");
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
  rows.push(renderMineRow(s, d));
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
  html += renderMineForWord(id);
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
  html += renderGrammar(t);
  html += `<div class="box dict" id="dict"></div>`;
  if (t.morph.length) {
    html += `<div class="box alts"><h3>Every possible parse <span class="badge warn">rule-based</span></h3><ol>${t.morph.map((m) =>
      `<li class="${m.matches_tag ? "agree" : ""}">${m.has_entry ? `<a class="l lk" lang="grc" data-lemma="${esc(m.lemma)}" title="Show the dictionary entry for ${esc(m.lemma)}">${esc(m.lemma)}</a>` : `<span class="l" lang="grc">${esc(m.lemma)}</span>`}${m.gloss ? ` <span class="g">${esc(m.gloss)}</span>` : ""}<br>${esc(m.parse)}${m.matches_tag ? ` <span class="agree-mark">· the tagger's choice</span>` : m.same_lemma_as_tag ? ` <span class="meta">· same lemma, other parse</span>` : ""}</li>`
    ).join("")}</ol><p class="prov">From the Morpheus analyser's table (key <code>${esc(t.morph_key)}</code>). No statistics: these are all the forms this spelling can be. Click a lemma for its dictionary entry.</p></div>`;
  } else {
    html += `<div class="box alts"><h3>Every possible parse</h3><p class="prov">Morpheus has no entry for this spelling.</p></div>`;
  }
  html += `<details class="prov"><summary>Sources for this word</summary>${
    ["glaux-plato", "morpheus-analyses", "middle-liddell", "lsj", "lsj-abbreviations", "smyth-grammar", "agdt-guidelines"].map((k) => t.sources[k]).filter(Boolean).map((s) =>
      `<p><strong>${esc(s.title)}</strong><br>${esc(s.provenance)}<br>Licence: ${esc(s.licence)} · ${/^[0-9a-f]{64}$/.test(s.commit_sha) ? "sha256" : "commit"} <code>${esc(s.commit_sha.slice(0, 10))}</code></p>`).join("")
  }</details>
    <p class="later">Every occurrence of this word across Plato arrives in milestone 5.</p>`;
  box.innerHTML = html;
  state.token = t;
  const first = t.lookup[0];
  if (first) showDict(first, true);
  else $("#dict").innerHTML = `<h3>Dictionary</h3><p class="prov">No tagged lemma to look up. Click a lemma under <em>Every possible parse</em>.</p>`;
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
      html += `<li><details><summary><b>${esc(lab && lab.name ? lab.name : r.code)}</b> <span class="meta">role in sentence · ${esc(r.code)}</span></summary>${
        lab ? `<p>${lab.definition_html}</p>` : `<p class="prov">The treebank guidelines do not describe the label ${esc(r.code)}; it is GLAUx's own.</p>`}${
        r.suffix ? `<p>${r.suffix.definition_html}</p>` : ""}<p class="prov">Ancient Greek Dependency Treebank guidelines 2.0, the scheme GLAUx follows. The role was assigned by the same statistical tagger as the parse.</p></details></li>`;
    }
    html += `</ul>`;
  }
  return html + `<p class="prov">The parse is the tagger's; each explanation is Smyth's own words, or the treebank guidelines'. Click a line to open it.</p></div>`;
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
      const warn = METHOD_NOTE[e.method];
      return `<article class="entry" data-entry="${e.id}">${warn ? `<p class="match-warn">${esc(warn)}</p>` : ""}${e.html}
        <p class="prov">${esc(lx.label)}, entry <code>${esc(e.key)}</code>${e.src_id ? ` (${esc(e.src_id)})` : ""}.</p></article>`;
    }).join("");
  }
  const expanded = p.expand !== false;
  box.innerHTML = `<h3>Dictionary <span class="badge quoted">printed</span></h3>
    <div class="dict-head"><span class="lemma" lang="grc">${esc(data.lemma)}</span>${isTagged ? ` <span class="meta">tagged lemma</span>` : state.token && state.token.lookup[0] ? ` <a class="back lk" data-lemma="${esc(state.token.lookup[0].lemma)}" data-tagged="1">back to the tagged lemma</a>` : ""}</div>
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

function closeInspector() {
  state.selected = null;
  MINE.editing = null;
  highlightSpan(null);
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  document.body.classList.remove("inspecting");
  $("#inspector").innerHTML = `<div class="inspector-empty"><p><strong>Click any Greek word</strong> for its lemma, parse, grammar notes and dictionary entry.</p></div>`;
}

// ------------------------------------------------------------------ sources dialog

async function showSources() {
  const d = await api("sources");
  const stats = JSON.parse(d.build.stats || "[]")[0] || {};
  let look = {};
  try { look = JSON.parse(d.build.lookup_stats || "{}"); } catch (e) { /* older build */ }
  $("#about-body").innerHTML = `<p class="meta">Library built ${esc(d.build.built_at)}. Timaeus: ${stats.sections} sections, ${stats.tokens} Greek words, ${stats.tagged} tagged, ${stats.notes} notes, ${stats.links} links.${look.lsj ? ` Dictionaries: ${look.lsj.entries} LSJ and ${look["middle-liddell"].entries} Middle Liddell entries for ${look.lemmas} lemmas; ${look.grammar_notes} Smyth notes; ${look.relation_labels} sentence roles.` : ""}</p>` +
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
  if (cite && cite.dataset.work === WORK && cite.dataset.ref) {
    if (cite.closest("#entry-dialog")) $("#entry-dialog").close();
    go(cite.dataset.ref);
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

document.addEventListener("change", (ev) => {
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
  try { state.lexica = await api("lexica"); } catch (e) { state.lexica = []; }
  const grc = state.work.editions.find((e) => e.lang === "grc");
  $("#work-title").textContent = state.work.title;
  $("#work-sub").textContent = `${grc.printed} · ${state.work.counts.notes} notes · ${state.work.counts.links_out} links`;
  document.title = `${state.work.title} · Platonic Workshop`;
  if (!go(location.hash.slice(1) || "17", false)) go("17", false);
})();
