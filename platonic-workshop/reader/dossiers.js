// Passage dossiers (#dossiers, #dossiers/divided-line): a famous passage gathered whole.
// What is written for a dossier (its stages, Plato's returns to it, the readers, the renderings,
// the diagram, the web pages) quotes the words it rests on, and says whether the build found them.
// Everything else (the text in every edition, the notes on it, the notes citing or naming it, its
// vocabulary, phrases it shares) is read from the library by rule, and says how.
"use strict";

const DOSS = { list: null, one: null, eds: null };
const DKIND = { image: "Image", myth: "Myth", argument: "Argument", scene: "Scene", method: "Method", doctrine: "Doctrine", saying: "Saying" };
const dossHash = (id, sec) => `#dossiers/${encodeURIComponent(id)}${sec ? "/" + sec : ""}`;
const grk = (s) => `<span lang="grc">${esc(s)}</span>`;

// A quotation of Burnet's Greek with its place, for the hand-written parts of a dossier.
function qPlato(work, ref, quote, ev) {
  const found = ev ? evFound(ev) : "";
  return `<span class="dq" lang="grc">“${esc(quote)}”</span> <a class="cite" href="${esc(placeHash(work, ref))}">${esc(workTitle(work))} ${esc(ref)}</a> ${found}`;
}

async function showDossiers(path) {
  state.view = "dossiers";
  setView("dossiers-view");
  const [id, sec] = (path || "").split("/");
  if (!DOSS.list) {
    $("#main").innerHTML = `<p class="loading">Opening the dossiers…</p>`;
    try { DOSS.list = await api("dossiers"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  if (id) {
    if (!DOSS.one || DOSS.one.id !== id) {
      $("#main").innerHTML = `<p class="loading">Gathering everything on this passage…</p>`;
      try { DOSS.one = await api(`dossier/${encodeURIComponent(id)}`); } catch (e) { $("#main").innerHTML = `<p class="error">No dossier “${esc(id)}”.</p>`; return; }
    }
    document.title = `${DOSS.one.label} · Dossiers · Platonic Workshop`;
    renderDossier();
    renderDossierToc(id);
    const el = sec && document.getElementById("d-" + sec);
    if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
  } else {
    document.title = "Dossiers · Platonic Workshop";
    renderDossierIndex();
    renderDossierToc(null);
    window.scrollTo(0, 0);
  }
}

function renderDossierIndex() {
  const { dossiers, stats, groups, kinds } = DOSS.list;
  const byGroup = new Map();
  for (const d of dossiers) {
    const g = d.grp || "";
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(d);
  }
  let h = `<div class="search dossiers">
    <h2>Dossiers: Plato's famous passages, gathered whole</h2>
    <p class="prov">Each dossier gathers one passage: the Greek and every translation, its stages, a drawing made from its words where it has one,
      how each translator renders its key words, every note on it, every place Plato returns to it, the ancient and later readers,
      the notes anywhere that cite or name it, its vocabulary, and open resources on the web. What is written by hand quotes the words it rests on;
      what the library finds by rule says so.
      ${stats ? `${(stats["quotations found"] || 0).toLocaleString()} of ${(stats.quotations || 0).toLocaleString()} quotations found in their texts;
      ${stats["renderings found"] || 0} of ${stats.renderings || 0} renderings found in their translations;
      ${stats["web quotations found"] || 0} of ${stats["web links"] || 0} web pages hold the words quoted from them (<code>reports/dossiers.md</code>).` : ""}</p>
    <p class="meta">${Object.entries(kinds).map(([k, v]) => `<b>${esc(DKIND[k] || k)}</b>: ${esc(v)}`).join(" · ")}</p>`;
  for (const [g, ds] of byGroup) {
    h += `<section><h3>${esc(groups[g] || "Other passages")}</h3><div class="doss-cards">`;
    for (const d of ds) {
      h += `<a class="doss-card" href="${dossHash(d.id)}"><span class="kind">${esc(DKIND[d.kind] || d.kind)}${d.diagram ? " · drawn" : ""}</span>
        <b>${esc(d.label)}</b> ${d.greek ? `<span lang="grc" class="greek-name">${esc(d.greek)}</span>` : ""}
        <span class="where">${esc(d.title)} ${esc(d.start_ref)}–${esc(d.end_ref)}</span>
        <span class="about">${esc(d.about || "")}</span></a>`;
    }
    h += `</div></section>`;
  }
  $("#main").innerHTML = h + `</div>`;
}

const DOSS_SECTIONS = [
  ["passage", "The passage"], ["diagram", "Drawn from the text"], ["text", "Greek and translations"], ["renderings", "Key words, translator by translator"],
  ["notes", "Notes on it"], ["echoes", "Where Plato returns to it"], ["readers", "Ancient and later readers"], ["cited", "Cited elsewhere"],
  ["named", "Named elsewhere"], ["context", "Concepts, myths, divisions"], ["vocab", "Its vocabulary"], ["web", "Open resources"], ["mine", "Your work on it"],
];

function renderDossierToc(id) {
  const list = DOSS.list.dossiers;
  let h = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to the ${esc(state.work ? state.work.title : "text")}</a></p>`;
  if (id && DOSS.one) {
    h += `<h3>In this dossier</h3><ul class="studies">${DOSS_SECTIONS.map(([k, l]) => `<li><a href="${dossHash(id, k)}">${esc(l)}</a></li>`).join("")}</ul>`;
  }
  h += `<h3>Dossiers</h3><ul class="studies">${list.map((d) => `<li class="${d.id === id ? "here" : ""}"><a href="${dossHash(d.id)}">${esc(d.label)}</a></li>`).join("")}</ul>`;
  $("#toc").innerHTML = h;
}

function dsec(key, title, body, note) {
  return `<section class="doss-sec" id="d-${key}"><h3>${esc(title)}</h3>${note ? `<p class="meta">${note}</p>` : ""}${body}</section>`;
}

function renderDossier() {
  const d = DOSS.one;
  const w = d.work_id;
  let h = `<div class="search dossier">
    <p class="meta"><a href="#dossiers">‹ All dossiers</a> · <a href="/api/dossier/${encodeURIComponent(d.id)}/md" download>Export as Markdown</a></p>
    <h2>${esc(d.label)} ${d.greek ? `<span lang="grc" class="greek-name">${esc(d.greek)}</span>` : ""}</h2>
    <p><span class="layer">${esc(DKIND[d.kind] || d.kind)}</span> <b>${esc(d.title)} ${refSpan(w, d.start_ref, d.end_ref)}</b>
      · <a href="${esc(placeHash(w, d.start_ref))}">Read it in place</a></p>
    <p class="prov"><b>The dossier's note</b> (the Workshop's own words on what is gathered here, not a reading of it): ${esc(d.about)}</p>`;
  // The passage: where it begins and ends, and its stages.
  let p = `<p class="meta">Where it begins and where it ends, in Burnet's Greek (where it ends is chosen by hand):</p>
    ${d.passage_evidence.map(evidenceHtml).join("")}`;
  if (d.parts?.length) p += `<ol class="doss-parts">${d.parts.map((x) => `<li><b>${esc(x.label)}</b> · ${qPlato(w, x.ref, x.quote, x.evidence)}</li>`).join("")}</ol>`;
  if (d.related?.length || d.related_from?.length) {
    p += `<h4>Tied to other dossiers</h4>${(d.related || []).map((r) => `<div class="claim"><p><a href="${dossHash(r.dossier)}"><b>${esc(r.label)}</b></a>: ${esc(r.why)}</p>${r.evidence.map(conceptEv).join("")}</div>`).join("")}
      ${d.related_from?.length ? `<p class="meta">Tied to this one from theirs: ${d.related_from.map((r) => `<a href="${dossHash(r.dossier)}">${esc(r.label)}</a> (${esc(r.why)})`).join("; ")}</p>` : ""}`;
  }
  h += dsec("passage", "The passage", p);
  if (d.diagram) h += dsec("diagram", d.diagram.title || "Drawn from the text", `<p class="prov">${esc(d.diagram.about || "")}</p><div class="doss-diagram">${drawDiagram(d.diagram, w)}</div>`,
    "Every label is Plato's word at the section named: point at it for the Greek, click to read it in place. A label the build could not find in the text is marked.");
  h += dsec("text", "Greek and translations", renderDossText(d), "Section by section, from the library. Tick the editions to read side by side. ≈ marks a translation whose sections were computed, not printed (see <em>About these translations</em> in the reader).");
  if (d.renderings?.length) h += dsec("renderings", "Key words, translator by translator", renderRenderings(d),
    "The Greek at the section named, and the English each translation has there: both looked for in the texts by the build. ≈: found in the next section, where a computed placement put it.");
  h += dsec("notes", `Notes on it (${d.notes.length})`, renderDossNotes(d), "Every note placed on a section of the passage: the translators' notes, the commentaries and the scholia in the library. Commentaries added to the library later appear here by themselves.");
  h += dsec("echoes", "Where Plato returns to it", renderEchoes(d), "");
  h += dsec("readers", "Ancient and later readers", (d.testimonia || []).map((t) => `<div class="claim"><p>${esc(t.says)}</p>${conceptEv(t.evidence)}</div>`).join("") || `<p class="none-msg">None quoted yet.</p>`,
    "Chosen by hand, each a quotation found in the text it is said to be in.");
  h += dsec("cited", "Cited elsewhere", renderCited(d), "Notes anywhere in the library that cite a section of the passage, or one of its pages (the citation web).");
  h += dsec("named", "Named elsewhere", renderNamed(d), d.keywords ? `Found by rule: notes that use one of the words “${esc([...(d.keywords.en || []), ...(d.keywords.grc || [])].join("”, “"))}”. Read each: a word can be used of something else.` : "");
  h += dsec("context", "Concepts, myths and printed divisions", renderContext(d), "");
  h += dsec("vocab", "Its vocabulary", renderVocab(d), "GLAUx's lemmas (machine-tagged). Words that occur only here in all of Plato, and words far more frequent here than in Plato as a whole.");
  h += dsec("web", "Open resources", renderWeb(d), "Each page was fetched by <code>tools/webcheck.py</code> and the words quoted from it looked for on it; the date is when.");
  h += dsec("mine", "Your work on it", renderDossMine(d), "");
  $("#main").innerHTML = h + `</div>`;
  bindDiagram();
}

// ------------------------------------------------------------------ the text, every edition

function dossEdPrefs(d) {
  if (!DOSS.eds) { try { DOSS.eds = JSON.parse(localStorage.getItem("pw.dossier.eds") || "null"); } catch (e) { DOSS.eds = null; } }
  const p = DOSS.eds || {};
  return d.editions.filter((e) => e.chunks.length).map((e) => ({ ...e, on: p[e.id.split(".")[1]] ?? (e.lang === "grc" || /perseus-eng/.test(e.id)) }));
}

function renderDossText(d) {
  const eds = dossEdPrefs(d);
  const on = eds.filter((e) => e.on);
  let h = `<p class="doss-eds">${eds.map((e) => `<label><input type="checkbox" data-doss-ed="${esc(e.id.split(".")[1])}" ${e.on ? "checked" : ""}> ${esc(e.label)}${e.align_method && /computed/.test(e.align_method) ? " ≈" : ""}</label>`).join(" ")}</p>`;
  h += `<div class="doss-text" style="--cols:${Math.max(1, on.length)}">`;
  h += on.map((e) => `<div class="hd">${esc(e.label)}</div>`).join("");
  for (const r of d.refs) {
    for (const e of on) {
      const cs = e.chunks.filter((c) => c.section_ref === r || (c.continued && r === d.refs[0]));
      h += `<div class="cell" ${e.lang === "grc" ? 'lang="grc"' : ""}><a class="ref" href="${esc(placeHash(d.work_id, r))}">${esc(r)}</a>
        ${cs.map((c) => `<p class="${c.continued ? "cont" : ""}" title="${esc(c.align_method || "")}">${c.continued ? `<span class="meta">(from ${esc(c.section_ref)}) </span>` : ""}${c.label ? `<b>${esc(c.label)}</b> ` : ""}${esc(c.text)}${c.end_ref && c.end_ref !== c.section_ref ? ` <span class="meta">→ ${esc(c.end_ref)}</span>` : ""}</p>`).join("")}</div>`;
    }
  }
  return h + `</div>`;
}

function renderRenderings(d) {
  const eds = Object.values(d.renderings[0].found_in);
  let h = `<table class="counts renderings"><thead><tr><th>Greek</th>${eds.map((e) => `<th>${esc(e.label)}</th>`).join("")}</tr></thead><tbody>`;
  for (const r of d.renderings) {
    h += `<tr><td>${grk(r.term)}<br><span class="meta">${qPlato(d.work_id, r.ref, r.grc, r.evidence)}</span></td>`;
    h += Object.values(r.found_in).map((v) => `<td>${v.found ? "" : `<span class="doubt-mark" title="Not found in this translation at ${esc(r.ref)}">not found</span> `}${esc(v.words)}${v.near ? ` <span class="meta" title="Found at ${esc(v.at)}, the next section">≈ ${esc(v.at)}</span>` : ""}</td>`).join("");
    h += `</tr>`;
  }
  return h + `</tbody></table>`;
}

function renderDossNotes(d) {
  if (!d.notes.length) return `<p class="none-msg">No note in the library is placed on this passage.</p>`;
  const by = new Map();
  for (const n of d.notes) { if (!by.has(n.who)) by.set(n.who, []); by.get(n.who).push(n); }
  return [...by].map(([who, ns]) => `<details class="doss-notes" ${by.size <= 3 ? "open" : ""}><summary><b>${esc(who)}</b> <span class="meta">${ns.length} note${ns.length > 1 ? "s" : ""}</span></summary>
    ${ns.map((n) => `<div class="cnote"><span class="meta"><a href="${esc(placeHash(d.work_id, n.start_ref))}">${esc(n.start_ref)}</a>${n.computed ? " ≈" : ""}${n.lemma_text ? ` · <span lang="grc">${esc(n.lemma_text)}</span>` : ""}</span>
      <div class="body">${n.body_html || ""}</div>${n.long ? `<button type="button" class="link-btn" data-note-full="${n.id}">Read the whole note</button>` : ""}</div>`).join("")}</details>`).join("");
}

function renderEchoes(d) {
  let h = "";
  if (d.echoes?.length) h += `<p class="meta">Chosen by hand: places where Plato himself returns to the passage, each with his words there.</p><ul class="doss-echoes">${d.echoes.map((e) =>
    `<li><b>${esc(e.title)} ${esc(e.ref)}${e.end ? "–" + esc(e.end) : ""}</b>: ${esc(e.why)}<br>${qPlato(e.work, e.ref, e.quote, e.evidence)}</li>`).join("")}</ul>`;
  if (d.shared?.length) h += `<h4>Phrases it shares with other passages</h4><p class="meta">Found by rule: three words in a row with the same lemmas in the same order, at least two of them rare in Plato, found in at most four other places. An echo, a formula or chance: read them.</p>
    <ul class="doss-echoes">${d.shared.map((s) => `<li>${esc(s.ref)} <span lang="grc">${esc(s.words)}</span> = ${s.elsewhere.map((p) => `<a href="${esc(placeHash(p.work_id, p.ref))}">${esc(p.title)} ${esc(p.ref)}</a> <span lang="grc">${esc(p.words)}</span>`).join("; ")}</li>`).join("")}</ul>`;
  return h || `<p class="none-msg">None recorded.</p>`;
}

function renderCited(d) {
  const out = d.cited_by.filter((l) => !l.inside);
  const inside = d.cited_by.length - out.length;
  if (!out.length) return `<p class="none-msg">No note on another passage cites it.</p>`;
  const by = new Map();
  for (const l of out) { const k = l.from_title; if (!by.has(k)) by.set(k, []); by.get(k).push(l); }
  return `<p class="meta">${out.length} citation${out.length > 1 ? "s" : ""} from notes on ${by.size} dialogue${by.size > 1 ? "s" : ""}${inside ? `; ${inside} more from notes inside the passage` : ""}. Hover for how it was read.</p>` +
    [...by].map(([t, ls]) => `<details class="doss-notes" ${by.size <= 4 ? "open" : ""}><summary><b>${esc(t)}</b> <span class="meta">${ls.length}</span></summary><ul class="cited-list">${ls.map((l) =>
      `<li><a href="${esc(placeHash(l.from_work, l.from_ref))}">${esc(l.from_ref)}</a> · ${esc(shortWho(l.commentator))} → ${esc(l.to_ref)}${l.page_only ? ` <span class="meta" title="The note cites the page, not a section">(the page)</span>` : ""}${l.certainty === "uncertain" ? ` <span class="doubt-mark" title="${esc(l.doubt || "")}">?</span>` : ""}
        <span class="excerpt" title="${esc(l.rule || "")}">${esc(l.excerpt)}</span> <button type="button" class="link-btn" data-note-full="${l.note_id}">the note</button></li>`).join("")}</ul></details>`).join("");
}

function renderNamed(d) {
  const el = d.named.filter((n) => n.placed === "elsewhere");
  const on = d.named.filter((n) => n.placed === "on");
  if (!d.named.length) return `<p class="none-msg">${d.keywords ? "No note names it by these words." : "No keywords are given for this dossier."}</p>`;
  const li = (n) => `<li><a href="${esc(placeHash(n.work_id, n.start_ref))}">${esc(n.title)} ${esc(n.start_ref)}</a> · ${esc(shortWho(n.commentator))}${n.note_kind === "introduction" ? " (introduction)" : ""}
    <span class="meta">(“${esc(n.word)}”)</span> <span class="excerpt">${esc(n.excerpt)}</span> <button type="button" class="link-btn" data-note-full="${n.note_id}">the note</button></li>`;
  return (el.length ? `<h4>In notes on other passages (${el.length})</h4><ul class="cited-list">${el.map(li).join("")}</ul>` : "") +
    (on.length ? `<details><summary class="meta">In notes on the passage itself (${on.length})</summary><ul class="cited-list">${on.map(li).join("")}</ul></details>` : "");
}

function renderContext(d) {
  let h = "";
  if (d.concepts?.length) h += `<p><b>Concepts</b> whose passages overlap it: ${d.concepts.map((c) => `<a href="#concepts/${esc(c.id)}">${esc(c.label)}</a> <span class="meta">(${esc(c.start_ref)}${c.end_ref !== c.start_ref ? "–" + esc(c.end_ref) : ""})</span>`).join(", ")}</p>`;
  if (d.themes?.length) h += `<p><b>Myths and images</b> (the corpus map): ${d.themes.map((t) => `<a href="#corpus?show=theme:${esc(t.id)}">${esc(t.label)}</a>`).join(", ")}</p>`;
  if (d.divisions?.length) h += `<p><b>Printed divisions</b> over it:</p><ul class="note sidenotes">${d.divisions.map((x) => `<li>${esc(x.author)}${x.kind === "chapter" ? ", " + esc(x.label) : ""} (${esc(x.start_ref)}–${esc(x.end_ref)}): ${esc(x.kind === "chapter" ? (x.detail || "").slice(0, 300) : x.label)}</li>`).join("")}</ul>`;
  return h || `<p class="none-msg">None.</p>`;
}

function renderVocab(d) {
  const only = d.vocab.filter((v) => v.kind === "only here");
  const dist = d.vocab.filter((v) => v.kind !== "only here");
  const link = (v) => `<a href="#search?q=${encodeURIComponent(v.lemma)}&by=lemma" lang="grc">${esc(v.lemma)}</a>`;
  return `<p><b>Only here in Plato</b>: ${only.length ? only.map((v) => `${link(v)}${v.here > 1 ? ` <span class="meta">×${v.here}</span>` : ""}`).join(", ") : "none"}.</p>
    <p><b>Far more frequent here</b>: ${dist.length ? dist.map((v) => `${link(v)} <span class="meta" title="${v.here} of its ${v.plato} occurrences in Plato are here; ${esc(v.kind)} its rate in Plato">${v.here}/${v.plato}, ${esc(v.kind)}</span>`).join(", ") : "none"}.</p>`;
}

function renderWeb(d) {
  return `<ul class="doss-web">${d.web.map((x) => `<li><a href="${esc(x.url)}" rel="noopener" target="_blank"><b>${esc(x.site)}</b>: ${esc(x.title)}</a>
    <blockquote class="ev" lang="${/[Ͱ-Ͽἀ-῿]/.test(x.quote) ? "grc" : "en"}">“${esc(x.quote)}” <span class="cite">${x.found ? `found on the page, ${esc(x.checked)}` : `<span class="doubt-mark">not found when checked${x.checked ? ", " + esc(x.checked) : ""}</span>`}</span></blockquote></li>`).join("")}</ul>`;
}

function renderDossMine(d) {
  const items = d.mine || [];
  return `${items.length ? `<ul>${items.map((m) => `<li><b>${esc(KIND_LABEL[m.kind] || m.kind || "Your work")}</b> ${esc(spanLabel(m))}${m.label ? ` “${esc(m.label)}”` : ""}: <div class="mine-body">${renderBody(m, "d" + m.id)}</div></li>`).join("")}</ul>` : `<p class="none-msg">You have not written on this passage yet.</p>`}
    <p><a href="${esc(placeHash(d.work_id, d.start_ref))}">Open it in the reader</a> to translate it or write a note: select the Greek, or use <em>Write on</em> under a section.</p>`;
}

// ------------------------------------------------------------------ diagrams drawn from the text

function lab(x, w, text) {
  const t = text ?? x.label;
  const tip = `${x.quote} (${workTitle(x.work || w)} ${x.ref})${x.found === false ? " — not found in the text" : ""}`;
  return `<a class="dlab${x.found === false ? " nf" : ""}" href="${esc(placeHash(x.work || w, x.ref))}" title="${esc(tip)}">${esc(t)}</a>`;
}
function svgLab(x, w, X, Y, text, anchor = "start", cls = "") {
  return `<a href="${esc(placeHash(x.work || w, x.ref))}"><text x="${X}" y="${Y}" text-anchor="${anchor}" class="${cls}${x.found === false ? " nf" : ""}"><title>${esc(x.quote)} (${esc(x.ref)})</title>${esc(text ?? x.label)}</text></a>`;
}

function drawDiagram(g, w) {
  const fn = { line: drawLine, cave: drawCave, analogy: drawTable, table: drawTable, steps: drawSteps, tree: drawTree, rings: drawRings, lambda: drawLambda, square: drawSquare, figure: drawFigure }[g.kind];
  return fn ? fn(g, w) : drawFigure(g, w);
}

function drawLine(g, w) {
  return `<div class="line-dia" data-line='${esc(JSON.stringify({ w }))}'>
    <label>Ratio of the cut: <input type="range" min="15" max="85" value="38" id="line-ratio"> <span id="line-ratio-v"></span></label>
    <div id="line-svg"></div>
    <p class="meta">The cut: ${lab(g.cut, w, "“" + g.cut.quote + "”")}; the proportion: ${lab(g.proportion, w, "“" + g.proportion.quote + "”")}.</p></div>`;
}
function lineSvg(g, w, r) {
  const H = 420, top = 20, x = 150;
  const s = g.sections;   // bottom to top
  const len = [r * r, r * (1 - r), (1 - r) * r, (1 - r) * (1 - r)];
  let y = top + H, out = `<svg viewBox="0 0 640 ${H + 50}" class="dia" role="img" aria-label="The divided line">`;
  const ys = [y];
  len.forEach((l) => { y -= l * H; ys.push(y); });
  out += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + H}" class="stroke"/>`;
  ys.forEach((yy, i) => { out += `<line x1="${x - (i === 2 ? 18 : 10)}" x2="${x + (i === 2 ? 18 : 10)}" y1="${yy}" y2="${yy}" class="stroke"/>`; });
  // halves
  out += `<text x="${x - 30}" y="${(ys[0] + ys[2]) / 2}" text-anchor="end" class="half">${esc(g.halves[0].label)}</text>`;
  out += `<text x="${x - 30}" y="${(ys[2] + ys[4]) / 2}" text-anchor="end" class="half">${esc(g.halves[1].label)}</text>`;
  s.forEach((sec, i) => {
    const mid = (ys[i] + ys[i + 1]) / 2;
    out += svgLab({ ref: sec.state_ref, quote: sec.state_quote, found: sec.found }, w, x + 26, mid - 4, `${sec.state} · ${sec.state_en}`, "start", "state");
    out += svgLab(sec, w, x + 26, mid + 14, sec.objects, "start", "obj");
    out += `<text x="${x - 12}" y="${mid + 4}" text-anchor="end" class="len">${(len[i] * 100).toFixed(1)}</text>`;
  });
  return out + `</svg>`;
}

function drawCave(g, w) {
  const it = Object.fromEntries(g.items.map((x) => [x.key, x]));
  const L = (k, X, Y, a) => it[k] ? svgLab(it[k], w, X, Y, it[k].label, a || "middle", "obj") : "";
  const man = (x, y, face) => `<circle cx="${x}" cy="${y}" r="9"/><path d="M${x} ${y + 9} l0 30 m0 -18 l${face * 16} 6 m${-face * 16} 12 l${face * 14} 14"/>`;
  return `<svg viewBox="0 0 800 390" class="dia cave" role="img" aria-label="The cave">
    <path d="M20 330 L20 60 L600 60 L780 20 L780 70 L620 130 L620 330 Z" class="rock"/>
    <rect x="20" y="60" width="14" height="270" class="wall"/>
    <g class="shadow"><rect x="24" y="190" width="7" height="20"/><rect x="24" y="225" width="7" height="18"/></g>
    <g class="figure">${man(130, 282, -1)}${man(175, 282, -1)}${man(220, 282, -1)}</g>
    <path d="M115 330 L235 330" class="chain"/>
    <rect x="300" y="262" width="18" height="68" class="parapet"/>
    <g class="figure">${man(370, 240, 0)}${man(420, 240, 0)}</g>
    <rect x="362" y="196" width="16" height="22" class="obj-shape"/><rect x="412" y="200" width="16" height="18" class="obj-shape"/>
    <path d="M330 330 L470 330" class="road"/>
    <path d="M530 215 q12 -34 0 -58 q24 22 12 58 z" class="fire"/>
    <line x1="532" y1="200" x2="30" y2="215" class="ray"/>
    <path d="M620 330 L620 130 M600 60 L780 20" class="passage"/>
    <circle cx="772" cy="8" r="22" class="sun"/>
    ${L("wall", 44, 90, "start")}${L("prisoners", 175, 352)}${L("parapet", 309, 372)}${L("carriers", 395, 180)}${L("road", 430, 352, "start")}${L("fire", 536, 140)}${L("entrance", 700, 110)}${L("sun", 772, 64, "end")}
  </svg>`;
}

function drawTable(g, w) {
  return `<table class="counts dia-table"><thead><tr><th></th>${g.columns.map((c) => `<th>${c.ref ? lab(c, w, c.head) : esc(c.head)}</th>`).join("")}</tr></thead>
    <tbody>${g.rows.map((r) => `<tr><th>${r.ref ? lab(r, w, r.head) : esc(r.head)}</th>${r.cells.map((c) => `<td>${lab(c, w, c.text)}<br><span lang="grc" class="meta">${esc(c.quote)}</span></td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function drawSteps(g, w) {
  const steps = g.steps;
  return `<ol class="dia-steps" ${g.upward ? 'reversed' : ""}>${(g.upward ? [...steps].reverse() : steps).map((s) =>
    `<li><b>${lab(s, w, s.label)}</b><br><span lang="grc" class="meta">${esc(s.quote)}</span> <span class="meta">${esc(s.ref)}</span></li>`).join("")}</ol>`;
}

function drawTree(g, w) {
  const node = (n) => `<li class="${n.chosen ? "chosen" : ""}">${lab(n, w, n.label)} <span lang="grc" class="meta">${esc(n.quote)}</span> <span class="meta">${esc(n.ref)}</span>
    ${n.children?.length ? `<ul>${n.children.map(node).join("")}</ul>` : ""}</li>`;
  return `<ul class="dia-tree">${node(g.root)}</ul>${g.result ? `<p><b>Result</b>: ${lab(g.result, w, g.result.label)} <span lang="grc" class="meta">${esc(g.result.quote)}</span></p>` : ""}`;
}

function drawRings(g, w) {
  const n = g.rings.length;
  let svg = `<svg viewBox="0 0 360 360" class="dia" role="img" aria-label="${esc(g.title || "")}">`;
  g.rings.forEach((r, i) => {
    const R = 170 - i * (150 / n);
    svg += `<circle cx="180" cy="180" r="${R}" class="ring" style="stroke-width:${2 + (n - (r.width_rank || n)) * 1.6}px"><title>${esc(r.label)}</title></circle>`;
  });
  svg += `<circle cx="180" cy="180" r="4" class="stroke"/></svg>`;
  const cols = g.columns || [];
  return `<div class="dia-split">${svg}<table class="counts dia-table"><thead><tr><th>Whorl</th>${cols.map((c) => `<th>${esc(c.head)}</th>`).join("")}</tr></thead><tbody>
    ${g.rings.map((r) => `<tr><th>${esc(r.label)}</th>${cols.map((c) => { const v = r[c.key]; return `<td>${v ? lab(v, w, v.text) : ""}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function drawLambda(g, w) {
  const L = g.left, R = g.right;
  let svg = `<svg viewBox="0 0 340 260" class="dia" role="img" aria-label="The two series">`;
  const top = [170, 30];
  svg += `<text x="${top[0]}" y="${top[1]}" text-anchor="middle" class="num">1</text>`;
  L.slice(1).forEach((x, i) => { svg += svgLab(x, w, 170 - (i + 1) * 45, 30 + (i + 1) * 65, x.label, "middle", "num"); });
  R.slice(1).forEach((x, i) => { svg += svgLab(x, w, 170 + (i + 1) * 45, 30 + (i + 1) * 65, x.label, "middle", "num"); });
  svg += `<path d="M160 40 L40 220 M180 40 L300 220" class="stroke faint"/></svg>`;
  return `<div class="dia-split">${svg}<div>${(g.notes || []).map((n) => `<p>${lab(n, w, n.label)}<br><span lang="grc" class="meta">${esc(n.quote)}</span> <span class="meta">${esc(n.ref)}</span></p>`).join("")}</div></div>`;
}

function drawSquare(g, w) {
  const steps = g.steps;
  return `<div class="dia-split"><svg viewBox="0 0 300 300" class="dia" role="img" aria-label="The squares of the Meno">
    <rect x="30" y="30" width="240" height="240" class="faint-fill stroke"/>
    <line x1="150" y1="30" x2="150" y2="270" class="stroke faint"/><line x1="30" y1="150" x2="270" y2="150" class="stroke faint"/>
    <rect x="30" y="150" width="120" height="120" class="base-fill stroke"/>
    <path d="M150 30 L270 150 L150 270 L30 150 Z" class="diag stroke"/>
    <text x="90" y="215" text-anchor="middle" class="num">2×2 = 4</text>
    <text x="150" y="155" text-anchor="middle" class="num">8</text>
    <text x="250" y="60" text-anchor="middle" class="num">16</text></svg>
    <ol class="dia-steps">${steps.map((s) => `<li>${lab(s, w, s.label)}<br><span lang="grc" class="meta">${esc(s.quote)}</span> <span class="meta">${esc(s.ref)}</span></li>`).join("")}</ol></div>`;
}

function drawFigure(g, w) {
  return `<ul class="dia-steps">${(g.items || []).map((s) => `<li><b>${lab(s, w, s.label)}</b><br><span lang="grc" class="meta">${esc(s.quote)}</span> <span class="meta">${esc(s.ref)}</span></li>`).join("")}</ul>`;
}

function bindDiagram() {
  const box = $(".line-dia");
  if (!box) return;
  const g = DOSS.one.diagram, w = DOSS.one.work_id;
  const draw = () => {
    const r = Number($("#line-ratio").value) / 100;
    $("#line-ratio-v").textContent = `${(r * 100).toFixed(0)} : ${((1 - r) * 100).toFixed(0)}`;
    $("#line-svg").innerHTML = lineSvg(g, w, r);
  };
  $("#line-ratio").addEventListener("input", draw);
  draw();
}

// ------------------------------------------------------------------ in the reader

// "Where you are in the whole": the dossiers whose passage is on this page.
function renderTocDossiers(w, inside) {
  const ds = (w.dossiers || []).filter((d) => inside(d.start_ref, d.end_ref));
  return ds.map((d) => `<p class="note doss-here">Dossier: <a href="${dossHash(d.id)}"><b>${esc(d.label)}</b></a> (${esc(d.start_ref)}–${esc(d.end_ref)})</p>`).join("");
}

document.addEventListener("click", (ev) => {
  if (ev.target.closest("#dossiers-btn")) location.hash = "dossiers";
});
document.addEventListener("change", (ev) => {
  const k = ev.target.dataset?.dossEd;
  if (!k || !DOSS.one) return;
  const p = Object.fromEntries(dossEdPrefs(DOSS.one).map((e) => [e.id.split(".")[1], e.on]));
  p[k] = ev.target.checked;
  DOSS.eds = p;
  try { localStorage.setItem("pw.dossier.eds", JSON.stringify(p)); } catch (e) { /* ignore */ }
  $("#d-text").outerHTML = dsec("text", "Greek and translations", renderDossText(DOSS.one), "Section by section, from the library. Tick the editions to read side by side. ≈ marks a translation whose sections were computed, not printed.");
});
