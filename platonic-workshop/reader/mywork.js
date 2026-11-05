// Platonic Workshop, milestone 4: your translations and notes.
// Loaded after reader.js and shares its globals (state, $, esc, api, WORK).
// Writes go to /api/mine, which keeps every version (tools/mywork.py).
"use strict";

const MINE = { config: { span_units: "words", default_format: "markdown" }, editing: null, pendingSpan: null };
const KIND_LABEL = { translation: "Translation", footnote: "Footnote", note: "Note", alternative: "Alternative rendering" };

async function send(method, path, data) {
  const r = await fetch("/api/" + path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data || {}) });
  let body = {};
  try { body = await r.json(); } catch (e) { /* empty */ }
  if (!r.ok) { const err = new Error(body.error || `${r.status}`); err.status = r.status; err.body = body; throw err; }
  return body;
}

// ------------------------------------------------------------------ Markdown
// A small, safe subset: everything is escaped first, then marked up. Paragraphs,
// line breaks, # headings, > quotes, - and 1. lists, *italic*, **bold**, `code`,
// [links](https://…), and footnotes: [^1] in the text, "[^1]: note" on its own line.

function mdInline(s, fn) {
  const codes = [];
  s = esc(s).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[\^([^\]\s]+)\]/g, (m, id) => {
    if (!fn) return m;
    if (!fn.order.includes(id)) fn.order.push(id);
    const n = fn.order.indexOf(id) + 1;
    return `<sup class="md-fnref"><a href="#${fn.prefix}-${esc(id)}" data-fn="${fn.prefix}-${esc(id)}">${n}</a></sup>`;
  });
  s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|#)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*|__(?=\S)([\s\S]*?\S)__/g, (m, a, b) => `<strong>${a || b}</strong>`);
  s = s.replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?![\w])/g, "$1<em>$2</em>");
  s = s.replace(/\n/g, "<br>");
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[+i]}</code>`);
}

function mdBlocks(src, fn) {
  const blocks = src.split(/\n[ \t]*\n/).map((b) => b.replace(/^\n+|\n+$/g, "")).filter((b) => b.trim());
  return blocks.map((b) => {
    const lines = b.split("\n");
    let m;
    if (lines.length === 1 && (m = /^(#{1,6})\s+(.*)$/.exec(b))) {
      const lvl = Math.min(6, m[1].length + 3);
      return `<h${lvl}>${mdInline(m[2], fn)}</h${lvl}>`;
    }
    if (lines.every((l) => /^\s*>/.test(l))) return `<blockquote>${mdBlocks(lines.map((l) => l.replace(/^\s*>\s?/, "")).join("\n"), fn)}</blockquote>`;
    const list = (re, tag) => {
      if (!re.test(lines[0])) return null;
      const items = [];
      for (const l of lines) {
        if (re.test(l)) items.push(l.replace(re, ""));
        else if (items.length) items[items.length - 1] += "\n" + l.trim();
      }
      return `<${tag}>${items.map((i) => `<li>${mdInline(i, fn)}</li>`).join("")}</${tag}>`;
    };
    return list(/^\s*[-*+]\s+/, "ul") || list(/^\s*\d+[.)]\s+/, "ol") || `<p>${mdInline(b, fn)}</p>`;
  }).join("");
}

function md(src, prefix = "fn") {
  src = String(src || "").replace(/\r\n?/g, "\n");
  // Footnote definitions: "[^id]: text", continued by indented lines.
  const defs = new Map();
  const kept = [];
  let cur = null;
  for (const line of src.split("\n")) {
    const m = /^\[\^([^\]\s]+)\]:\s?(.*)$/.exec(line);
    if (m) { cur = m[1]; defs.set(cur, m[2]); continue; }
    if (cur && /^( {2,}|\t)\S/.test(line)) { defs.set(cur, defs.get(cur) + "\n" + line.trim()); continue; }
    cur = null;
    kept.push(line);
  }
  const fn = { prefix, order: [] };
  let html = mdBlocks(kept.join("\n"), fn);
  for (const id of defs.keys()) if (!fn.order.includes(id)) fn.order.push(id);  // defined but not referenced: still shown
  if (fn.order.length) {
    html += `<ol class="md-fns">${fn.order.map((id) => defs.has(id)
      ? `<li id="${prefix}-${esc(id)}">${mdInline(defs.get(id), null)}</li>`
      : `<li id="${prefix}-${esc(id)}" class="missing">[^${esc(id)}] is used but has no “[^${esc(id)}]: …” line.</li>`).join("")}</ol>`;
  }
  return html;
}

function renderBody(item, prefix) {
  return item.format === "plain" ? `<p>${esc(item.body).replace(/\n/g, "<br>")}</p>` : md(item.body, prefix);
}

// ------------------------------------------------------------------ where your work sits on the page

function spanLabel(a) {
  const { start_ref: s, end_ref: e, word_start: ws, word_end: we } = a;
  if (ws == null) return s === e ? s : `${s}–${e}`;
  if (s === e) return ws === we ? `${s} ${ws}` : `${s} ${ws}–${we}`;
  return `${s} ${ws} – ${e} ${we}`;
}

// Which of your items cover each word on the page, and which item ends on it.
function mineIndex(d) {
  const secOrder = new Map(state.work.sections.map((r, i) => [r, i]));
  const covers = new Map(), ends = new Map();
  // Your notes on words are lettered a, b, c … on each page, so they are not
  // confused with Bury's numbered notes or the numbered footnotes inside a translation.
  let num = 0;
  const letter = (n) => (n > 26 ? letter(Math.floor((n - 1) / 26)) : "") + String.fromCharCode(97 + ((n - 1) % 26));
  d.mine.forEach((m) => { m.num = m.kind === "translation" || m.word_start == null ? null : letter(++num); });
  for (const t of d.tokens) {
    const ti = secOrder.get(t.section_ref);
    for (const m of d.mine) {
      if (m.word_start == null) continue;  // whole sections are listed, not underlined
      const a = secOrder.get(m.start_ref), b = secOrder.get(m.end_ref);
      const after = ti > a || (ti === a && t.seq >= m.word_start);
      const before = ti < b || (ti === b && t.seq <= m.word_end);
      if (after && before) {
        if (!covers.has(t.id)) covers.set(t.id, []);
        covers.get(t.id).push(m);
        if (ti === b && t.seq === m.word_end && m.num) {
          if (!ends.has(t.id)) ends.set(t.id, []);
          ends.get(t.id).push(m);
        }
      }
    }
  }
  return { covers, ends };
}

function itemKey(m) { return `${m.table}-${m.id}`; }

// The apparatus row under a section: the items that start here, or (on the
// first section of the page) that started on an earlier page.
function renderMineRow(s, d) {
  const refs = d.sections.map((x) => x.ref);
  const here = d.mine.filter((m) => m.start_ref === s.ref || (s.ref === refs[0] && !refs.includes(m.start_ref)));
  const write = `<button class="link-btn mine-add" data-write-sec="${esc(s.ref)}" title="Translate or annotate the whole of ${esc(s.ref)}">Write on ${esc(s.ref)}</button>`;
  if (!here.length) return `<div class="app-row mine-row mine-row-empty"><div class="app-k">Your work</div><div class="app-v">${write}</div></div>`;
  const items = here.map((m) => {
    const cont = m.start_ref !== s.ref ? ` <span class="meta">(begins at ${esc(m.start_ref)})</span>` : "";
    const warn = m.anchor_ok ? "" : `<p class="match-warn">The Greek at this place is not what it was when you wrote this. You anchored it to: <span lang="grc">${esc(m.words || "")}</span></p>`;
    return `<div class="mine-item kind-${esc(m.kind)}" id="mine-${itemKey(m)}" data-item="${itemKey(m)}">
      <div class="mine-meta">${m.num ? `<span class="mine-num">${m.num}</span>` : ""}<b>${esc(KIND_LABEL[m.kind] || m.kind)}</b>${m.label ? ` · ${esc(m.label)}` : ""}
        · <span class="span-ref">${esc(spanLabel(m))}</span>${cont}${m.words && m.word_start != null ? ` <span lang="grc" class="mine-words">${esc(trimWords(m.words))}</span>` : ""}
        <span class="mine-actions"><button class="link-btn" data-edit="${itemKey(m)}">Edit</button> <button class="link-btn" data-history="${itemKey(m)}">History</button></span></div>
      ${warn}<div class="mine-body md">${renderBody(m, "fn-" + itemKey(m))}</div></div>`;
  }).join("");
  return `<div class="app-row mine-row"><div class="app-k">Your work</div><div class="app-v">${items}<div class="mine-foot">${write}</div></div></div>`;
}

function trimWords(w) {
  const ws = w.split(" ");
  return ws.length > 8 ? `${ws.slice(0, 4).join(" ")} … ${ws.slice(-3).join(" ")}` : w;
}

// Called from reader.js while it renders a Greek word.
function mineWordAttrs(tokId, idx) {
  const cov = idx.covers.get(tokId);
  if (!cov) return { cls: "", after: "" };
  const ends = idx.ends.get(tokId) || [];
  return {
    cls: " mine-a" + (cov.some((m) => m.kind === "translation") ? " mine-tr" : ""),
    after: ends.map((m) => `<sup class="mine-fn"><a href="#mine-${itemKey(m)}" data-jump="${itemKey(m)}" title="${esc(KIND_LABEL[m.kind])}">${m.num}</a></sup>`).join(""),
  };
}

// In the word box: your work on this word.
function renderMineForWord(tokId) {
  const d = state.data;
  if (!d || !MINE.idx) return "";
  const cov = MINE.idx.covers.get(tokId) || [];
  const tok = d.tokens.find((t) => t.id === tokId);
  const whole = tok ? d.mine.filter((m) => m.word_start == null && sectionIn(tok.section_ref, m)) : [];
  const all = [...cov, ...whole];
  const list = all.map((m) => `<li><a class="lk" data-edit="${itemKey(m)}">${esc(KIND_LABEL[m.kind])}${m.label ? " · " + esc(m.label) : ""}</a> <span class="meta">${esc(spanLabel(m))}</span></li>`).join("");
  return `<div class="box mine-box"><h3>Your work</h3>${all.length ? `<ul>${list}</ul>` : ""}
    <div class="mine-quick">${["translation", "footnote", "note", "alternative"].map((k) =>
      `<button class="chip" data-new-word="${k}">${esc(k === "alternative" ? "Alternative" : KIND_LABEL[k])}</button>`).join("")}</div>
    <p class="prov">For this word alone. To take in more words, select them in the text (or click one word, then Shift-click the last).</p></div>`;
}

function sectionIn(ref, m) {
  const o = new Map(state.work.sections.map((r, i) => [r, i]));
  return o.get(ref) >= o.get(m.start_ref) && o.get(ref) <= o.get(m.end_ref);
}

// ------------------------------------------------------------------ choosing words

function tokenById(id) { return state.data && state.data.tokens.find((t) => t.id === id); }

function spanFromTokens(a, b) {
  const o = new Map(state.work.sections.map((r, i) => [r, i]));
  let [x, y] = [a, b];
  if (o.get(x.section_ref) > o.get(y.section_ref) || (x.section_ref === y.section_ref && x.seq > y.seq)) [x, y] = [y, x];
  const span = { start_ref: x.section_ref, word_start: x.seq, end_ref: y.section_ref, word_end: y.seq };
  if (MINE.config.span_units === "sections") { span.word_start = null; span.word_end = null; }
  return span;
}

function spanWords(span) {
  const o = new Map(state.work.sections.map((r, i) => [r, i]));
  const a = o.get(span.start_ref), b = o.get(span.end_ref);
  return state.data.tokens.filter((t) => {
    const i = o.get(t.section_ref);
    if (i < a || i > b) return false;
    if (span.word_start != null && i === a && t.seq < span.word_start) return false;
    if (span.word_end != null && i === b && t.seq > span.word_end) return false;
    return true;
  }).map((t) => t.form).join(" ");
}

function selectionSpan() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const words = [...document.querySelectorAll("#main .grc .w")].filter((w) => range.intersectsNode(w) && w.textContent.trim());
  if (!words.length) return null;
  // A word only touched at its very edge is not part of the selection.
  const inside = words.filter((w) => {
    const r = document.createRange();
    r.selectNodeContents(w);
    return range.compareBoundaryPoints(Range.END_TO_START, r) < 0 && range.compareBoundaryPoints(Range.START_TO_END, r) > 0;
  });
  const use = inside.length ? inside : words;
  const a = tokenById(+use[0].dataset.t), b = tokenById(+use[use.length - 1].dataset.t);
  return a && b ? { span: spanFromTokens(a, b), rect: range.getBoundingClientRect() } : null;
}

function showSelBar(span, rect) {
  MINE.pendingSpan = span;
  const bar = $("#sel-bar");
  $("#sel-what").textContent = spanLabel(span);
  bar.hidden = false;
  const w = bar.offsetWidth, h = bar.offsetHeight;
  let top = rect.bottom + 8, left = rect.left + rect.width / 2 - w / 2;
  if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 8);
  left = Math.max(8, Math.min(left, document.documentElement.clientWidth - w - 8));
  bar.style.top = `${top}px`;
  bar.style.left = `${left}px`;
}
function hideSelBar() { $("#sel-bar").hidden = true; }

let selTimer = null;
document.addEventListener("selectionchange", () => {
  clearTimeout(selTimer);
  selTimer = setTimeout(() => {
    if (document.activeElement && document.activeElement.closest("#sel-bar")) return;
    const s = selectionSpan();
    if (s) showSelBar(s.span, s.rect);
    else if (!MINE.shiftSpan) hideSelBar();
  }, 180);
});

// ------------------------------------------------------------------ the editor (in the word box's column)

function draftKey(ed) { return "pw.draft." + (ed.item ? itemKey(ed.item) : `new-${ed.kind}-${spanLabel(ed.span)}`); }
function loadDraft(ed) { try { return JSON.parse(localStorage.getItem(draftKey(ed)) || "null"); } catch (e) { return null; } }
function saveDraft(ed, body, label) { try { localStorage.setItem(draftKey(ed), JSON.stringify({ body, label, at: Date.now() })); } catch (e) { /* private window */ } }
function clearDraft(ed) { try { localStorage.removeItem(draftKey(ed)); } catch (e) { /* ignore */ } }

function openEditor(ed) {
  // ed: { span, kind } for new work, or { item } to edit.
  hideSelBar();
  MINE.editing = ed;
  state.selected = null;
  document.querySelectorAll(".w.sel").forEach((e) => e.classList.remove("sel"));
  document.body.classList.add("inspecting");
  const item = ed.item;
  const span = item || ed.span;
  const kind = item ? item.kind : ed.kind;
  const words = item ? item.words : spanWords(span);
  const draft = loadDraft(ed);
  const body = draft ? draft.body : item ? item.body : "";
  const label = draft ? draft.label : item ? item.label || "" : "";
  const kinds = item ? (kind === "translation" ? ["translation"] : ["footnote", "note", "alternative"]) : ["translation", "footnote", "note", "alternative"];
  const fmt = item ? item.format : MINE.config.default_format;
  highlightSpan(span);
  $("#inspector").scrollTop = 0;
  $("#inspector").innerHTML = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button>
    <div class="editor">
      <h3 class="ed-h">${item ? "Edit" : "New"} · ${state.work.title} ${esc(spanLabel(span))}</h3>
      <blockquote class="ed-greek" lang="grc">${esc(words || "")}</blockquote>
      <div class="seg" role="radiogroup" aria-label="Kind">${kinds.map((k) =>
        `<label><input type="radio" name="ed-kind" value="${k}" ${k === kind ? "checked" : ""}> ${esc(KIND_LABEL[k])}</label>`).join("")}</div>
      <input id="ed-label" class="ed-label" maxlength="200" placeholder="Name (optional): literal, after Taylor…" value="${esc(label)}">
      <div class="ed-tabs"><button class="tab on" data-ed-tab="write">Write</button><button class="tab" data-ed-tab="preview">Preview</button>
        <span class="meta">${fmt === "markdown" ? "Markdown" : "Plain text"}</span></div>
      <textarea id="ed-body" class="ed-body" rows="9" spellcheck="true" placeholder="${kind === "translation" ? "Your translation of these words" : "Your note"}">${esc(body)}</textarea>
      <div id="ed-preview" class="ed-preview md" hidden></div>
      ${fmt === "markdown" ? `<details class="prov ed-help"><summary>Markdown</summary><p><code>*italic*</code> <code>**bold**</code> <code>&gt; quotation</code> <code>- list</code> <code>[link](https://…)</code> <code>\`code\`</code><br>
        A footnote in your text: <code>…the maker[^1] of…</code> and, on a line of its own, <code>[^1]: The note.</code> Footnotes are numbered for you.</p></details>` : ""}
      ${draft ? `<p class="ed-status warn">Unsaved text from ${new Date(draft.at).toLocaleString()} brought back. <button class="link-btn" id="ed-drop-draft">Use the saved text instead</button></p>` : ""}
      <div class="ed-actions"><button class="btn primary" id="ed-save">Save</button> <button class="btn" id="ed-cancel">Close</button>
        <span class="meta">Ctrl+Enter saves</span></div>
      <p class="ed-status" id="ed-status" role="status"></p>
      ${item ? `<p class="prov">Revision ${item.rev} · saved ${esc(item.updated_at)} · <button class="link-btn" data-history="${itemKey(item)}">History</button> · <button class="link-btn" id="ed-delete">Delete</button></p>` : ""}
      <p class="prov">Saved to data/user.sqlite. Every version is kept; nothing is written over.</p>
    </div>`;
  const ta = $("#ed-body");
  ta.addEventListener("input", () => saveDraft(ed, ta.value, $("#ed-label").value));
  $("#ed-label").addEventListener("input", () => saveDraft(ed, ta.value, $("#ed-label").value));
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}

function highlightSpan(span) {
  document.querySelectorAll(".w.mine-hi").forEach((e) => e.classList.remove("mine-hi"));
  if (!span || !state.data) return;
  const o = new Map(state.work.sections.map((r, i) => [r, i]));
  const a = o.get(span.start_ref), b = o.get(span.end_ref);
  for (const t of state.data.tokens) {
    const i = o.get(t.section_ref);
    const inside = i >= a && i <= b && !(span.word_start != null && i === a && t.seq < span.word_start) && !(span.word_end != null && i === b && t.seq > span.word_end);
    if (inside) document.querySelectorAll(`.w[data-t="${t.id}"]`).forEach((e) => e.classList.add("mine-hi"));
  }
}

function edStatus(msg, cls = "") {
  const el = $("#ed-status");
  if (el) { el.className = "ed-status " + cls; el.innerHTML = msg; }
}

async function saveEditor(force) {
  const ed = MINE.editing;
  if (!ed) return;
  const body = $("#ed-body").value;
  const label = $("#ed-label").value;
  const kind = (document.querySelector('input[name="ed-kind"]:checked') || {}).value || "note";
  if (!body.trim()) { edStatus("Nothing to save yet.", "warn"); return; }
  $("#ed-save").disabled = true;
  edStatus("Saving…");
  try {
    let saved;
    if (ed.item) {
      saved = await send("PUT", `mine/${ed.item.table}/${ed.item.id}`, { body, label, kind, base_rev: force ? force.rev : ed.item.rev });
    } else {
      saved = await send("POST", "mine", { table: kind === "translation" ? "translation" : "note", kind: kind === "translation" ? undefined : kind,
        work: WORK, ...ed.span, body, label, format: MINE.config.default_format });
    }
    clearDraft(ed);
    if (!ed.item) clearDraft({ span: ed.span, kind });
    MINE.editing = { item: saved };
    await refreshPage();
    openEditor({ item: saved });
    edStatus(`Saved as revision ${saved.rev}.`, "ok");
  } catch (e) {
    if (e.status === 409) {
      const cur = e.body.current;
      edStatus(`${esc(e.message)}<div class="conflict"><p class="meta">The saved text (revision ${cur.rev}, ${esc(cur.updated_at)}):</p><div class="md">${renderBody(cur, "fn-conflict")}</div>
        <button class="btn" id="ed-force">Save mine as the newest version</button> <span class="meta">The other stays in the history.</span></div>`, "warn");
      MINE.conflict = cur;
    } else edStatus(`Not saved: ${esc(e.message)}. Your text is still here.`, "warn");
  } finally {
    const b = $("#ed-save");
    if (b) b.disabled = false;
  }
}

async function refreshPage() {
  const y = window.scrollY;
  state.data = await api(`page/${WORK}/${state.page}`);
  renderPage();
  window.scrollTo(0, y);
}

function findItem(key) {
  const [table, id] = key.split("-");
  return state.data.mine.find((m) => m.table === table && m.id === +id);
}

async function showHistory(key) {
  const [table, id] = key.split("-");
  const box = $("#inspector");
  document.body.classList.add("inspecting");
  box.innerHTML = `<p class="loading">…</p>`;
  let h;
  try { h = await api(`mine/${table}/${id}/history`); } catch (e) { box.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  const item = h.item;
  MINE.editing = null;
  highlightSpan(item);
  box.scrollTop = 0;
  box.innerHTML = `<button class="insp-close" aria-label="Close" title="Close (Esc)">×</button>
    <div class="editor"><h3 class="ed-h">History · ${esc(KIND_LABEL[item.kind])} · ${esc(spanLabel(item))}</h3>
    <blockquote class="ed-greek" lang="grc">${esc(item.words || "")}</blockquote>
    ${item.deleted_at ? `<p class="ed-status warn">Deleted ${esc(item.deleted_at)}. <button class="btn" data-restore="${key}" data-base="${item.rev}">Restore it</button></p>` : `<p><button class="btn" data-edit-fresh="${key}">Edit the current text</button></p>`}
    <ol class="revs" reversed>${h.revisions.slice().reverse().map((r) => `<li class="rev">
      <div class="meta"><b>Revision ${r.rev}</b> · ${esc(r.event)} · ${esc(r.saved_at)}${r.label ? ` · ${esc(r.label)}` : ""}${r.kind && r.kind !== item.kind ? ` · as ${esc(KIND_LABEL[r.kind])}` : ""}
      ${r.rev === item.rev ? " · <b>current</b>" : !item.deleted_at && r.body !== item.body ? ` · <button class="link-btn" data-restore="${key}" data-rev="${r.rev}" data-base="${item.rev}">Bring this version back</button>` : ""}</div>
      <div class="md">${renderBody({ ...item, body: r.body }, `fn-${key}-r${r.rev}`)}</div></li>`).join("")}</ol>
    <p class="prov">Bringing a version back saves it as a new revision; the versions after it stay here.</p></div>`;
}

async function restoreItem(key, rev, base) {
  const [table, id] = key.split("-");
  try {
    await send("POST", `mine/${table}/${id}/restore`, { base_rev: +base, rev: rev == null ? undefined : +rev });
    await refreshPage();
    await showHistory(key);
  } catch (e) {
    alert(`Not restored: ${e.message}`);
  }
}

async function deleteItem() {
  const it = MINE.editing && MINE.editing.item;
  if (!it || !confirm(`Delete this ${KIND_LABEL[it.kind].toLowerCase()}? It is kept, with its history, and can be restored from History or the Your work window.`)) return;
  try {
    const d = await send("POST", `mine/${it.table}/${it.id}/delete`, { base_rev: it.rev });
    clearDraft({ item: it });
    await refreshPage();
    $("#inspector").innerHTML = `<button class="insp-close" aria-label="Close">×</button><div class="editor"><p class="ed-status">Deleted. <button class="btn" data-restore="${itemKey(d)}" data-base="${d.rev}">Undo</button></p></div>`;
    MINE.editing = null;
  } catch (e) {
    edStatus(`Not deleted: ${esc(e.message)}`, "warn");
  }
}

// ------------------------------------------------------------------ your work window: export and deleted items

async function showMineDialog() {
  let deleted = [];
  try { deleted = await api("mine/deleted"); } catch (e) { /* older server */ }
  let all = { works: [] };
  try { const r = await fetch("/api/export/my-plato.json"); all = await r.json(); } catch (e) { /* ignore */ }
  const items = all.works.flatMap((w) => w.items);
  const live = items.filter((i) => !i.deleted_at);
  const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  $("#mine-body").innerHTML = `<p>${count(live.filter((i) => i.table === "translation").length, "translation", "translations")} and ${count(live.filter((i) => i.table === "note").length, "note", "notes")},
    ${count(items.reduce((n, i) => n + (i.revisions || []).length, 0), "saved version", "saved versions")} in all. They live in <code>data/user.sqlite</code>, apart from the library; a rebuild never writes to it.</p>
    <h3>Export</h3>
    <ul class="exports">
      <li><a href="/api/export/my-plato.md" download>Markdown</a> <span class="meta">· everything current, in Stephanus order, with the Greek of each span and your footnotes. Opens in any editor; Pandoc turns it into Word or PDF.</span></li>
      <li><a href="/api/export/my-plato.json" download>JSON</a> <span class="meta">· everything, deleted items and every earlier version included.</span></li>
      <li><a href="/api/export/user.sqlite" download>A copy of the database</a> <span class="meta">· the whole of data/user.sqlite, for a backup.</span></li>
    </ul>
    <h3>Deleted</h3>
    ${deleted.length ? `<ul class="deleted">${deleted.map((d) => `<li>${esc(KIND_LABEL[d.kind])}${d.label ? " · " + esc(d.label) : ""} · ${esc(d.title)} ${esc(spanLabel(d))} <span class="meta">deleted ${esc(d.deleted_at)}</span>
      <div class="md">${renderBody(d, "fn-del-" + itemKey(d))}</div><button class="btn" data-restore="${itemKey(d)}" data-base="${d.rev}">Restore</button></li>`).join("")}</ul>` : `<p class="meta">Nothing deleted.</p>`}`;
  $("#mine-dialog").showModal();
}

// ------------------------------------------------------------------ events

document.addEventListener("click", async (ev) => {
  const t = ev.target;
  const bar = t.closest("[data-sel-kind]");
  if (bar && MINE.pendingSpan) {
    const span = MINE.pendingSpan;
    window.getSelection().removeAllRanges();
    MINE.shiftSpan = null;
    openEditor({ span, kind: bar.dataset.selKind });
    return;
  }
  if (t.closest("#sel-close")) { hideSelBar(); MINE.shiftSpan = null; window.getSelection().removeAllRanges(); return; }
  const sec = t.closest("[data-write-sec]");
  if (sec) {
    const r = sec.dataset.writeSec;
    openEditor({ span: { start_ref: r, end_ref: r, word_start: null, word_end: null }, kind: "translation" });
    return;
  }
  const nw = t.closest("[data-new-word]");
  if (nw && state.token) {
    const tok = tokenById(state.token.id) || { section_ref: state.token.section_ref, seq: state.token.seq };
    openEditor({ span: spanFromTokens(tok, tok), kind: nw.dataset.newWord });
    return;
  }
  const ed = t.closest("[data-edit]");
  if (ed) { ev.preventDefault(); const it = findItem(ed.dataset.edit); if (it) openEditor({ item: it }); return; }
  const fresh = t.closest("[data-edit-fresh]");
  if (fresh) { const it = findItem(fresh.dataset.editFresh); if (it) openEditor({ item: it }); return; }
  const hi = t.closest("[data-history]");
  if (hi) { showHistory(hi.dataset.history); return; }
  const rs = t.closest("[data-restore]");
  if (rs) {
    if (rs.closest("#mine-dialog")) $("#mine-dialog").close();
    restoreItem(rs.dataset.restore, rs.dataset.rev, rs.dataset.base);
    return;
  }
  const jump = t.closest("[data-jump]");
  if (jump) {
    ev.preventDefault();
    const el = document.getElementById("mine-" + jump.dataset.jump);
    if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1200); }
    return;
  }
  const fnl = t.closest("[data-fn]");
  if (fnl) {
    ev.preventDefault();
    const el = document.getElementById(fnl.dataset.fn);
    if (el) { el.scrollIntoView({ block: "nearest" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1200); }
    return;
  }
  if (t.id === "ed-save") { saveEditor(); return; }
  if (t.id === "ed-force" && MINE.conflict) { saveEditor(MINE.conflict); return; }
  if (t.id === "ed-cancel") { MINE.editing = null; highlightSpan(null); closeInspector(); return; }
  if (t.id === "ed-delete") { deleteItem(); return; }
  if (t.id === "ed-drop-draft" && MINE.editing) {
    const e2 = MINE.editing;
    clearDraft(e2);
    openEditor(e2);
    return;
  }
  const tab = t.closest("[data-ed-tab]");
  if (tab) {
    const prev = tab.dataset.edTab === "preview";
    document.querySelectorAll("[data-ed-tab]").forEach((b) => b.classList.toggle("on", b === tab));
    $("#ed-body").hidden = prev;
    const pv = $("#ed-preview");
    pv.hidden = !prev;
    if (prev) pv.innerHTML = renderBody({ body: $("#ed-body").value, format: MINE.editing && MINE.editing.item ? MINE.editing.item.format : MINE.config.default_format }, "fn-preview") || `<p class="meta">Nothing written yet.</p>`;
    return;
  }
  if (t.closest("#mine-btn")) { showMineDialog(); }
}, true);

// Shift-click: from the word in the word box to this one.
document.addEventListener("click", (ev) => {
  const w = ev.target.closest(".w");
  if (!w || !ev.shiftKey || !state.selected) return;
  const a = tokenById(state.selected), b = tokenById(+w.dataset.t);
  if (!a || !b) return;
  ev.stopImmediatePropagation();
  ev.preventDefault();
  window.getSelection().removeAllRanges();
  const span = spanFromTokens(a, b);
  MINE.shiftSpan = span;
  highlightSpan(span);
  showSelBar(span, w.getBoundingClientRect());
}, true);

document.addEventListener("mouseover", (ev) => {
  const it = ev.target.closest(".mine-item");
  if (it && !MINE.editing) { const m = findItem(it.dataset.item); if (m && m.word_start != null) highlightSpan(m); }
});
document.addEventListener("mouseout", (ev) => {
  const it = ev.target.closest(".mine-item");
  if (it && !MINE.editing && !it.contains(ev.relatedTarget)) highlightSpan(null);
});

document.addEventListener("keydown", (ev) => {
  if (ev.target.id === "ed-body" || ev.target.id === "ed-label") {
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); saveEditor(); }
    ev.stopPropagation();
  }
}, true);

window.addEventListener("beforeunload", (ev) => {
  const ta = $("#ed-body");
  const ed = MINE.editing;
  if (ta && ed && ta.value !== (ed.item ? ed.item.body : "") && ta.value.trim()) { ev.preventDefault(); ev.returnValue = ""; }
});

api("mine/config").then((c) => { MINE.config = c; }).catch(() => {});
