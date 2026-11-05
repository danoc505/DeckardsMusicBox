// Platonic Workshop: the citation web (milestone 8). What each passage cites and
// what cites it, from every note in the library, and the most discussed passages.
// Loaded after reader.js; shares its globals (state, $, esc, api, placeHash, workById, workAbbr, closeInspector).
"use strict";

const CITE = { hash: null, work: "", by: "", uncertain: false, cross: false, data: null };

// ------------------------------------------------------------------ chips under each section

function citeTitle(l, side) {
  const who = l.commentator || "a note";
  const where = side === "out" ? "" : ` on ${l.from_title} ${l.from_ref}`;
  let t = `“${l.raw}” in ${who}${where}, read by ${l.rule || l.method}`;
  if (l.computed) t += " (the note's own place is computed ≈)";
  if (l.certainty !== "certain") t += ` · ${l.certainty}: ${l.doubt || ""}`;
  if (l.excerpt) t += `\n\n${l.excerpt}`;
  return t;
}

function citeMark(l) {
  return l.certainty === "certain" ? "" : `<span class="doubt-mark" aria-label="${esc(l.certainty)}">?</span>`;
}

function renderLinksOut(s, d) {
  const out = d.links_out.filter((l) => l.from_ref === s.ref);
  if (!out.length) return "";
  const chips = out.map((l) => {
    const label = !l.to_ref ? `the ${l.to_title}` : l.to_work === WORK ? `${workAbbr(WORK)} ${l.to_ref}` : `${l.to_title} ${l.to_ref}`;
    const cls = l.certainty === "certain" ? "" : " doubt";
    if (l.certainty === "unresolved" || !l.to_imported) {
      return `<span class="chip off${cls}" title="${esc(citeTitle(l, "out"))}${l.certainty === "unresolved" ? " · not followable" : ""}">${esc(label)}${citeMark(l)}</span>`;
    }
    return `<a class="chip${l.to_work === WORK ? "" : " other"}${cls}" href="${esc(placeHash(l.to_work, l.to_ref))}" title="${esc(citeTitle(l, "out"))}">${esc(label)}${citeMark(l)}<span class="who">${esc(shortWho(l.commentator))}</span></a>`;
  }).join("");
  return `<div class="app-row app-links"><div class="app-k">Cites</div><div class="app-v chips">${chips}</div></div>`;
}

function renderLinksIn(s, d) {
  const page = String(parseInt(s.ref));
  const inn = d.links_in.filter((l) => l.to_ref === s.ref || (l.to_ref === page && s.ref.endsWith("a")));
  if (!inn.length) return "";
  const notes = new Set(inn.map((l) => l.note_id)).size;
  const chips = inn.map((l) => `<a class="chip${l.from_work === WORK ? "" : " other"}${l.certainty === "certain" ? "" : " doubt"}" href="${esc(placeHash(l.from_work, l.from_ref))}"
    title="${esc(citeTitle(l, "in"))}">${esc(l.from_work === WORK ? workAbbr(WORK) : l.from_title)} ${esc(l.from_ref)}${citeMark(l)}<span class="who">${esc(shortWho(l.commentator))}</span></a>`).join("");
  const ref = inn.every((l) => l.to_ref === page) ? page : s.ref;
  return `<div class="app-row app-links"><div class="app-k">Cited by</div><div class="app-v chips">${chips}
    <button type="button" class="link-btn cite-all" data-cited="${esc(WORK)}/${esc(ref)}">${notes === 1 ? "read the note" : `read the ${notes} notes`}</button></div></div>`;
}

// 'Archer-Hind (1888)' -> 'Archer-Hind'; 'Shorey (Loeb, 1930)' -> 'Shorey'
function shortWho(c) {
  return String(c || "").replace(/\s*\(.*$/, "");
}

// The left column: this dialogue in the rest of Plato.
function renderTocCitations(w) {
  const c = w.counts || {};
  if (!c.cited_from_others && !c.named_by_others) return "";
  return `<h3>In the rest of Plato</h3><p class="note">
    ${c.cited_from_others ? `<a href="${esc(discussedHash({ work: w.id, cross: true }))}">${c.cited_from_others.toLocaleString()} note${c.cited_from_others === 1 ? "" : "s"}</a> on other dialogues cite passages of the ${esc(w.title)}.` : ""}
    ${c.named_by_others ? `<button type="button" class="link-btn" data-cited="${esc(w.id)}/">${c.named_by_others.toLocaleString()} note${c.named_by_others === 1 ? "" : "s"}</button> name it without a page.` : ""}
    <a href="${esc(discussedHash({ work: w.id }))}">Its most discussed passages</a>.</p>`;
}

// ------------------------------------------------------------------ every note citing one passage

async function openCited(work, ref) {
  const dlg = $("#comm-dialog");
  const w = workById(work);
  $("#comm-title").textContent = ref ? `Notes citing ${w ? w.title : work} ${ref}` : `Notes naming the ${w ? w.title : work}`;
  const body = $("#comm-body");
  body.innerHTML = `<p class="loading">…</p>`;
  if (!dlg.open) dlg.showModal();
  let rows;
  try { rows = await api(`cited/${work}/${encodeURIComponent(ref)}`); } catch (e) { body.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  const seen = new Set();
  rows = rows.filter((r) => r.certainty !== "unresolved" && !seen.has(r.note_id) && seen.add(r.note_id));
  body.innerHTML = `<p class="meta">${rows.length} note${rows.length === 1 ? "" : "s"}. Each reference was read from the note by pattern;
    the words it was read from are marked. <span class="doubt-mark">?</span> marks a reading with a doubt, said beside it.
    <a href="${esc(placeHash(work, ref || null))}" data-close-comm>${ref ? `Read ${esc(ref)}` : `Open the ${esc(w ? w.title : work)}`}</a></p>
    <ul class="cited">${rows.map(citedItem).join("")}</ul>`;
}

function citedItem(r) {
  const ex = esc(r.excerpt).replace(esc(r.raw.replace(/\s+/g, " ")), `<mark>${esc(r.raw.replace(/\s+/g, " "))}</mark>`);
  const doubt = r.certainty === "certain" ? "" : `<div class="doubt-why"><span class="doubt-mark">?</span> ${esc(r.certainty)}: ${esc(r.doubt || "")}</div>`;
  const kind = r.note_kind === "introduction" ? "introduction" : r.note_kind === "footnote" ? "footnote" : "note";
  return `<li class="${r.certainty === "certain" ? "" : "doubt"}">
    <div class="cited-head"><b>${esc(r.commentator)}</b>, ${kind} ${r.note_kind === "introduction" ? `to the ${esc(r.from_title)}` : `on <a href="${esc(placeHash(r.from_work, r.from_ref))}" data-close-comm>${esc(r.from_title)} ${esc(r.from_ref)}</a>${r.computed ? ` <span class="approx" title="The note's place is computed">≈</span>` : ""}`}</div>
    <div class="cited-ex">${ex}</div>${doubt}
    <div class="meta">read by ${esc(r.rule || r.method)} · ${esc(r.proof_status)} · <button type="button" class="link-btn" data-note-full="${r.note_id}">the whole note</button></div>
    <div class="cited-full" id="cited-full-${r.note_id}" hidden></div></li>`;
}

async function showFullNote(id) {
  const box = $(`#cited-full-${id}`);
  if (!box) return;
  if (!box.hidden) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<p class="loading">…</p>`;
  try {
    const n = await api(`note/${id}`);
    box.innerHTML = `<div class="cm-read">${n.body_html || esc(n.body)}</div>`;
  } catch (e) { box.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

// ------------------------------------------------------------------ the most discussed passages

function discussedHash(o) {
  const p = new URLSearchParams();
  if (o.work) p.set("work", o.work);
  if (o.by) p.set("by", o.by);
  if (o.uncertain) p.set("uncertain", "1");
  if (o.cross) p.set("cross", "1");
  const q = p.toString();
  return "#discussed" + (q ? "?" + q : "");
}

async function showDiscussedFromHash(h) {
  const p = new URLSearchParams(h.replace(/^discussed\??/, ""));
  state.view = "discussed";
  document.body.classList.remove("searching");
  document.body.classList.add("discussing");
  closeInspector();
  Object.assign(CITE, { work: p.get("work") || "", by: p.get("by") || "", uncertain: p.get("uncertain") === "1", cross: p.get("cross") === "1" });
  document.title = "Most discussed passages · Platonic Workshop";
  if (CITE.hash !== h || !CITE.data) {
    CITE.hash = h;
    $("#main").innerHTML = `<p class="loading">Counting the citations…</p>`;
    const q = new URLSearchParams({ limit: "150" });
    if (CITE.work) q.set("work", CITE.work);
    if (CITE.by) q.set("by", CITE.by);
    if (CITE.uncertain) q.set("uncertain", "1");
    if (CITE.cross) q.set("cross", "1");
    try { CITE.data = await api("discussed?" + q.toString()); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  renderDiscussed();
}

function renderDiscussed() {
  const d = CITE.data;
  const works = state.works.filter((w) => w.imported);
  const max = Math.max(1, ...d.rows.map((r) => r.citations));
  const t = d.totals || {};
  let html = `<div class="search discussed">
    <h2>The most discussed passages</h2>
    <p class="prov">Every note in the library, from the Loeb translators' footnotes to Proclus and Archer-Hind, read for the passages of Plato
      it cites. A passage is ranked by how many notes cite it; each note counts once. ${(t.certain || 0).toLocaleString()} certain links,
      ${(t.uncertain || 0).toLocaleString()} uncertain, ${(t.unresolved || 0).toLocaleString()} unresolved (the work is named but has no such page).</p>
    <form class="disc-form" id="disc-form">
      <label>Passages in <select name="work"><option value="">all of Plato</option>${works.map((w) => `<option value="${w.id}" ${CITE.work === w.id ? "selected" : ""}>${esc(w.title)}</option>`).join("")}</select></label>
      <label>cited by <select name="by"><option value="">every commentator</option>${d.commentators.map((c) => `<option ${CITE.by === c.commentator ? "selected" : ""}>${esc(c.commentator)}</option>`).join("")}</select></label>
      <label><input type="checkbox" name="cross" ${CITE.cross ? "checked" : ""}> only from notes on other dialogues</label>
      <label><input type="checkbox" name="uncertain" ${CITE.uncertain ? "checked" : ""}> count uncertain readings too</label>
    </form>`;
  if (!d.rows.length) html += `<p class="none-msg">No passage is cited with these choices.</p>`;
  else {
    html += `<table class="counts disc"><thead><tr><th class="num">#</th><th>Passage</th><th class="num" title="Notes that cite the passage">Notes citing it</th><th></th>
      <th class="num" title="Different commentators among them">Commentators</th><th class="num" title="Dialogues the citing notes are on">From dialogues</th>
      <th class="num" title="Notes written on the passage itself">Notes on it</th><th>By</th></tr></thead><tbody>
      ${d.rows.map((r, i) => `<tr><td class="num">${i + 1}</td>
        <td><a href="${esc(placeHash(r.to_work, r.to_ref))}">${esc(r.to_title)} ${esc(r.to_ref)}</a>${/^\d+$/.test(r.to_ref) ? ` <span class="meta">(the page)</span>` : ""}${r.uncertain ? ` <span class="doubt-mark" title="${r.uncertain} of these readings are uncertain">?</span>` : ""}</td>
        <td class="num"><button type="button" class="link-btn" data-cited="${esc(r.to_work)}/${esc(r.to_ref)}">${r.citations}</button></td>
        <td class="bar-cell"><span class="bar" style="width:${(100 * r.citations / max).toFixed(1)}%"></span></td>
        <td class="num">${r.commentators}</td><td class="num">${r.dialogues}</td><td class="num">${r.notes_here}</td>
        <td class="meta">${r.who.map((w) => esc(shortWho(w))).join(", ")}</td></tr>`).join("")}</tbody></table>
      <p class="meta">Click a count to read the notes. The figures are worked out from the library each time; how each reference was read, and every doubt, is in <code>reports/citations.md</code>.</p>`;
  }
  html += `</div>`;
  $("#main").innerHTML = html;
  $("#toc").innerHTML = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to the ${esc(state.work ? state.work.title : "text")}</a></p>
    <h3>Commentators</h3><ul class="studies">${d.commentators.map((c) => `<li class="${CITE.by === c.commentator ? "here" : ""}"><a href="${esc(discussedHash({ ...CITE, by: c.commentator }))}">${esc(c.commentator)}</a> <span class="meta">${c.n.toLocaleString()} links</span></li>`).join("")}</ul>
    <p class="note">Under every section of the text, <b>Cites</b> lists what its notes cite and <b>Cited by</b> the notes elsewhere that cite it. Hover a chip for the words it was read from.</p>`;
  window.scrollTo(0, 0);
}

document.addEventListener("change", (ev) => {
  const f = ev.target.closest("#disc-form");
  if (!f) return;
  const o = { work: f.work.value, by: f.by.value, uncertain: f.uncertain.checked, cross: f.cross.checked };
  location.hash = discussedHash(o);
});

document.addEventListener("click", (ev) => {
  const c = ev.target.closest("[data-cited]");
  if (c) {
    ev.preventDefault();
    const [w, r] = c.dataset.cited.split("/");
    openCited(w, r);
    return;
  }
  const n = ev.target.closest("[data-note-full]");
  if (n) { showFullNote(n.dataset.noteFull); return; }
  if (ev.target.closest("#discussed-btn")) location.hash = discussedHash({});
});
