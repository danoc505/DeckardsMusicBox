// Platonic Workshop reader, milestone 7: the commentaries.
// Under each section, every commentator on it, side by side by commentator;
// the Greek words a note is on are dotted in the text and light up when you
// point at the note; the word box lists the notes on a word; introductions
// and whole commentaries can be read straight through; and every imported
// note can be marked as checked or corrected by you (kept in user.sqlite).
"use strict";

const COMM = { byToken: new Map(), tokensOf: new Map(), order: [] };

// Which commentaries are shown, remembered in the browser. All by default.
function commPrefs() {
  let p = {};
  try { p = JSON.parse(localStorage.getItem("pw.comm") || "{}"); } catch (e) { /* private window */ }
  return p;
}
function commShown(cid) { return commPrefs()[cid] !== false; }
function commList() {
  return (state.work && state.work.commentaries) || [];
}
// The order of the columns: the ancient commentary first, then Taylor's notes from it, then the modern.
const COMM_ORDER = ["proclus1820", "taylor1804-addnotes", "archerhind1888", "archerhind1883", "campbell1883",
  "campbell1867-tlg007", "campbell1867-tlg008", "adam1902", "burnet1911", "bury1909", "england1921"];
function commRank(cid) { const i = COMM_ORDER.indexOf(cid); return i < 0 ? 99 : i; }
function commInfo(cid) { return commList().find((c) => c.id === cid) || { label: cid }; }

// Token ids of the words each note on this page is on, and the notes on each word.
function indexCommentary(d) {
  COMM.byToken = new Map();
  COMM.tokensOf = new Map();
  if (!d.commentary) return;
  const seq = new Map(state.work.sections.map((r, i) => [r, i]));
  const key = (ref, n) => seq.get(ref) * 100000 + n;
  for (const n of d.commentary) {
    if (n.word_start == null || !commShown(n.commentary_id)) continue;
    const a = key(n.start_ref, n.word_start), b = key(n.word_end_ref || n.start_ref, n.word_end ?? n.word_start);
    const ids = d.tokens.filter((t) => { const k = key(t.section_ref, t.seq); return k >= a && k <= b; }).map((t) => t.id);
    COMM.tokensOf.set(n.id, ids);
    for (const t of ids) {
      if (!COMM.byToken.has(t)) COMM.byToken.set(t, []);
      COMM.byToken.get(t).push(n);
    }
  }
}
function commWordCls(tokId) { return COMM.byToken.has(tokId) ? " cm" : ""; }

function renderCommBar() {
  const cs = commList().filter((c) => c.kind !== "introduction");
  const intros = commList().filter((c) => c.kind === "introduction");
  if (!cs.length && !intros.length) return "";
  const p = commPrefs();
  return `<div class="trans-bar comm-bar" role="group" aria-label="Commentaries shown"><span class="tb-k">Commentary</span>${cs.sort((a, b) => commRank(a.id) - commRank(b.id)).map((c) =>
    `<label class="tb-chip" title="${esc(c.title + "\n" + c.printed + "\n\n" + c.anchoring + "\n\nProofreading: " + c.proof_status)}"><input type="checkbox" data-comm="${esc(c.id)}" ${p[c.id] !== false ? "checked" : ""}> ${esc(c.label)}</label>`).join("")}
    <button type="button" class="link-btn" id="comm-about">About the commentaries</button>${intros.length ? ` <button type="button" class="link-btn" id="comm-intros">Introductions</button>` : ""}</div>`;
}

function lemmaHtml(n) {
  if (!n.lemma_text) return "";
  const grc = /[Ͱ-Ͽἀ-῿]/.test(n.lemma_text);
  const words = COMM.tokensOf.get(n.id);
  return `<span class="cm-lemma${words && words.length ? " on-words" : ""}"${grc ? ' lang="grc"' : ""} data-cm-words="${n.id}" title="${esc(words && words.length ? "Show these words in the Greek" : "")}">${esc(n.lemma_text)}${grc ? "]" : ""}</span> `;
}

function proofLine(n) {
  const p = n.proof;
  let mark = `<span class="pf">${esc(n.proof_status)}</span>`;
  if (p) {
    const what = p.status === "checked" ? (p.corrected ? "corrected and checked by you" : "checked by you") : "marked by you as needing correction";
    mark = `<span class="pf yours${p.changed ? " warn" : ""}" title="${esc(p.comment || "")}">${what}, ${esc(p.saved_at.slice(0, 10))}${p.changed ? " · the imported text has changed since" : ""}</span>`;
  }
  return `${mark} <button type="button" class="link-btn" data-proof="${n.id}">Proofread</button>`;
}

function noteBody(n) {
  const p = n.proof;
  if (p && p.corrected) {
    return `<div class="cm-body corrected">${p.corrected.split(/\n\s*\n/).map((x) => `<p>${esc(x)}</p>`).join("")}</div>
      <details class="raw-in"><summary>As imported</summary>${n.body_html}</details>`;
  }
  return `<div class="cm-body">${n.body_html}${n.long ? `<button type="button" class="link-btn more" data-cm-more="${n.id}">Read the whole note (${Math.round(n.chars / 1000)}k characters)</button>` : ""}</div>`;
}

function renderNote(n, d) {
  const range = n.end_ref && n.end_ref !== n.start_ref ? `${n.start_ref}–${n.end_ref}` : n.start_ref;
  const approx = n.computed ? `<span class="approx" title="Placed by computation">≈</span> ` : "";
  const foot = (d.commentary || []).filter((f) => f.parent_id === n.id);
  return `<li class="cm-note" id="cm-${n.id}" data-cm="${n.id}">
    <div class="cm-head">${approx}${lemmaHtml(n)}<span class="cm-where">${esc(range)}</span></div>
    ${noteBody(n)}
    ${foot.length ? `<ul class="cm-foot">${foot.map((f) => `<li>${f.body_html} <span class="meta">(Taylor's footnote)</span></li>`).join("")}</ul>` : ""}
    <div class="meta">${esc(n.printed_at || "")} · <span class="cm-how" title="${esc(n.anchor_detail || "")}">placed by ${esc(n.anchor_method)}${n.word_method ? ", " + esc(n.word_method) : ""}</span> · ${proofLine(n)}</div>
  </li>`;
}

// The commentary row under a section: one group per commentator.
function renderCommentaryRow(s, d) {
  const here = (d.commentary || []).filter((n) => n.start_ref === s.ref && n.kind !== "footnote" && commShown(n.commentary_id));
  if (!here.length) return "";
  const groups = new Map();
  for (const n of here) {
    if (!groups.has(n.commentary_id)) groups.set(n.commentary_id, []);
    groups.get(n.commentary_id).push(n);
  }
  const cols = [...groups].sort((a, b) => commRank(a[0]) - commRank(b[0])).map(([cid, ns]) => {
    const c = commInfo(cid);
    return `<div class="cm-group"><h4 title="${esc(c.printed + "\n" + c.anchoring)}">${esc(c.label)} <span class="meta">${ns.length} note${ns.length > 1 ? "s" : ""}</span></h4><ul class="cm-notes">${ns.map((n) => renderNote(n, d)).join("")}</ul></div>`;
  }).join("");
  return `<div class="app-row app-notes cm-row"><div class="app-k">Commentators</div><div class="app-v cm-cols">${cols}</div></div>`;
}

// The word box: the notes on this word.
function commForWord(tokId) {
  const ns = COMM.byToken.get(tokId);
  if (!ns || !ns.length) return "";
  return `<div class="box cm-box"><h3>Commentary on this word</h3><ul>${ns.map((n) =>
    `<li><a href="#cm-${n.id}" data-cm-go="${n.id}">${esc(commInfo(n.commentary_id).label)}</a> on <span lang="grc">${esc(n.lemma_text || "")}</span>${n.computed ? ` <span class="approx" title="Placed by computation">≈</span>` : ""}</li>`).join("")}</ul></div>`;
}

function highlightNote(id, on) {
  const ids = COMM.tokensOf.get(+id) || [];
  for (const t of ids) document.querySelectorAll(`.w[data-t="${t}"]`).forEach((e) => e.classList.toggle("cm-hl", on));
}

// ------------------------------------------------------------------ reading straight through

async function showCommentary(cid, title, work, info) {
  // From the list of all commentaries (milestone 11) a commentary on another dialogue can be read.
  const W = work || WORK;
  const dlg = $("#comm-dialog");
  $("#comm-title").textContent = title || commInfo(cid).label;
  const body = $("#comm-body");
  body.innerHTML = `<p class="loading">…</p>`;
  dlg.showModal();
  let after = 0, html = "";
  const c0 = info || commInfo(cid);
  html += `<p class="meta">${esc(c0.printed || "")}. ${esc(c0.anchoring || "")} Proofreading: ${esc(c0.proof_status || "")}.</p>`;
  for (let k = 0; k < 20; k++) {
    const c = await api(`commentary/${encodeURIComponent(cid)}?after=${after}&limit=300`);
    for (const n of c.notes) {
      if (n.kind === "footnote") continue;
      const where = n.kind === "introduction" ? "" : `<a class="chip" href="${esc(placeHash(W, n.start_ref))}" data-close-comm>${esc(workAbbr(W))} ${esc(n.start_ref)}${n.end_ref !== n.start_ref ? "–" + esc(n.end_ref) : ""}</a> ${n.computed ? '<span class="approx">≈</span> ' : ""}`;
      html += `<div class="cm-read" id="cm-${n.id}">${where}${n.lemma_text ? `<span class="cm-lemma"${/[Ͱ-Ͽἀ-῿]/.test(n.lemma_text) ? ' lang="grc"' : ""}>${esc(n.lemma_text)}</span>` : ""}${n.kind === "introduction" ? "" : enBtn(W, n.start_ref)}${noteBody(n)}</div>`;
      after = Math.max(after, n.seq);
    }
    if (!c.more) break;
  }
  body.innerHTML = html;
}

function showIntroductions() {
  const intros = commList().filter((c) => c.kind === "introduction");
  const pre = commList().find((c) => c.id === "proclus1820");
  $("#about").querySelector("h2").textContent = `Introductions to the ${state.work.title}`;
  $("#about-body").innerHTML = `<p class="meta">Each is on the whole dialogue, so it is read here rather than at a passage.</p>` +
    intros.map((c) => `<div class="src"><h4><button type="button" class="link-btn" data-comm-read="${esc(c.id)}">${esc(c.label)}</button></h4><div>${esc(c.title)}. ${esc(c.printed)}</div><div class="meta">${c.n_notes} paragraphs · ${esc(c.proof_status)}</div></div>`).join("") +
    (pre ? `<div class="src"><h4><button type="button" class="link-btn" data-comm-read="proclus1820" data-comm-title="Proclus, the preface and the whole commentary">Proclus, preface</button></h4><div>Proclus opens his commentary with the scope (skopos) of the dialogue, before the first lemma. It is the first item of the commentary read straight through.</div></div>` : "");
  $("#about").showModal();
}

function showCommAbout() {
  const cs = commList();
  $("#about").querySelector("h2").textContent = "Commentaries";
  $("#about-body").innerHTML = `<p class="meta">The commentaries on the ${esc(state.work.title)} in this library, how each note is placed at its passage, and how much of each is placed on the Greek words themselves. ≈ marks a place that is computed rather than printed. Figures in reports/commentaries.md (the Timaeus: reports/commentary_timaeus.md). Every commentary in the library: <a href="#commentaries">Commentaries</a>.</p>` +
    cs.map((c) => {
      const placed = (c.placed || []).map((r) => `${r.n} by ${r.anchor_method}${r.on_words ? ", on the Greek words" : ""}${r.computed ? " (≈)" : ""}`).join("; ");
      return `<div class="src"><h4>${esc(c.label)}</h4><div>${esc(c.title)}. ${esc(c.printed)}</div><div>${esc(c.anchoring)}</div>
        <div class="meta">${c.n_notes} notes: ${esc(placed)}. Proofreading: ${esc(c.proof_status)} · <code>${esc(c.file)}</code></div>
        <div><button type="button" class="link-btn" data-comm-read="${esc(c.id)}">Read it straight through</button></div></div>`;
    }).join("");
  $("#about").showModal();
}

// ------------------------------------------------------------------ proofreading

async function openProof(id) {
  const n = await api(`note/${id}`);
  const dlg = $("#proof-dialog");
  const cur = n.proof && n.proof.corrected ? n.proof.corrected : n.body;
  $("#proof-body").innerHTML = `<p class="meta">${esc(n.commentator)} · ${esc(n.printed_at || "")} · ${esc(n.note_key)}. The imported text is never changed: what you write is kept in your own database, beside it, with every earlier mark.</p>
    ${n.lemma_text ? `<p><span class="cm-lemma"${/[Ͱ-Ͽἀ-῿]/.test(n.lemma_text) ? ' lang="grc"' : ""}>${esc(n.lemma_text)}</span></p>` : ""}
    <label class="pf-l">The note, as it should read<textarea id="proof-text" rows="14">${esc(cur)}</textarea></label>
    <label class="pf-l">Comment (optional)<input id="proof-comment" value="${esc((n.proof && n.proof.comment) || "")}"></label>
    <div class="pf-actions"><button type="button" data-proof-save="checked">Save as checked</button> <button type="button" data-proof-save="needs correction">Save as needing correction</button></div>
    <details><summary>The OCR as received</summary><pre class="raw-pre">${esc(n.raw || "")}</pre></details>
    <details><summary>How it is placed</summary><p>${esc(n.anchor_detail || n.anchor_method)}</p></details>
    ${n.proof_history.length ? `<details><summary>Your earlier marks (${n.proof_history.length})</summary><ul>${n.proof_history.map((h) => `<li>${esc(h.saved_at)} · ${esc(h.status)}${h.corrected ? " · with a correction" : ""}${h.comment ? " · " + esc(h.comment) : ""}</li>`).join("")}</ul></details>` : ""}`;
  dlg.dataset.key = n.note_key;
  dlg.dataset.id = id;
  dlg.showModal();
}

async function saveProof(status) {
  const dlg = $("#proof-dialog");
  const r = await fetch("/api/proof", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note_key: dlg.dataset.key, status, corrected: $("#proof-text").value, comment: $("#proof-comment").value }),
  });
  const out = await r.json();
  if (!r.ok) { alert(out.error || "Not saved"); return; }
  dlg.close();
  const n = (state.data.commentary || []).find((x) => x.id === +dlg.dataset.id);
  if (n) { n.proof = out; renderPage(); scrollToNote(n.id); }
}

function scrollToNote(id) {
  const li = document.getElementById("cm-" + id);
  if (li) { li.scrollIntoView({ block: "center" }); li.classList.add("flash"); setTimeout(() => li.classList.remove("flash"), 1200); }
}

// ------------------------------------------------------------------ events

document.addEventListener("click", async (ev) => {
  const more = ev.target.closest("[data-cm-more]");
  if (more) {
    const n = await api(`note/${more.dataset.cmMore}`);
    more.parentElement.innerHTML = n.body_html;
    return;
  }
  const lem = ev.target.closest("[data-cm-words]");
  if (lem && lem.closest("#main")) {
    const ids = COMM.tokensOf.get(+lem.dataset.cmWords) || [];
    const w = ids.length && document.querySelector(`.w[data-t="${ids[0]}"]`);
    if (w) { w.scrollIntoView({ block: "center" }); highlightNote(lem.dataset.cmWords, true); setTimeout(() => highlightNote(lem.dataset.cmWords, false), 1500); }
    return;
  }
  const go = ev.target.closest("[data-cm-go]");
  if (go) { ev.preventDefault(); scrollToNote(go.dataset.cmGo); return; }
  const pf = ev.target.closest("[data-proof]");
  if (pf) { openProof(pf.dataset.proof); return; }
  const save = ev.target.closest("[data-proof-save]");
  if (save) { saveProof(save.dataset.proofSave); return; }
  if (ev.target.closest("#comm-about")) { showCommAbout(); return; }
  if (ev.target.closest("#comm-intros")) { showIntroductions(); return; }
  const rd = ev.target.closest("[data-comm-read]");
  if (rd) { $("#about").close(); showCommentary(rd.dataset.commRead, rd.dataset.commTitle); return; }
  if (ev.target.closest("[data-close-comm]")) { $("#comm-dialog").close(); }
});

document.addEventListener("change", (ev) => {
  if (ev.target.dataset && ev.target.dataset.comm) {
    const p = commPrefs();
    p[ev.target.dataset.comm] = ev.target.checked;
    try { localStorage.setItem("pw.comm", JSON.stringify(p)); } catch (e) { /* ignore */ }
    if (state.data) { renderPage(); scrollToTarget(); }
  }
});

document.addEventListener("mouseover", (ev) => {
  const li = ev.target.closest(".cm-note");
  if (li) highlightNote(li.dataset.cm, true);
});
document.addEventListener("mouseout", (ev) => {
  const li = ev.target.closest(".cm-note");
  if (li && !li.contains(ev.relatedTarget)) highlightNote(li.dataset.cm, false);
});
