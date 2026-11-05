// Milestone 9: each dialogue as a whole (#timaeus/whole), and the corpus as a whole (#corpus).
// Everything shown here is a claim the library holds with its source: the words it rests on are
// one click away, and a quotation that was not found in its text says so.
"use strict";

const WHOLE = { data: null, corpus: null, overlay: "thrasyllus", pick: "" };

const evFound = (e) => e.found === null ? `<span class="meta" title="This work is not in the build, so the words were not checked">not checked</span>`
  : e.found ? "" : `<span class="doubt-mark" title="These words were not found in the text named">not found</span>`;

// One quotation, with where it is and a button to read the passage it is from.
function evidenceHtml(e) {
  const lang = /[Ͱ-Ͽἀ-῿]/.test(e.quote) ? "grc" : "en";
  let where;
  if (e.source_text === "plato") where = `<a href="${esc(placeHash(e.work_id, e.at))}">${esc(workTitle(e.work_id))} ${esc(e.at)}</a> (Burnet)`;
  else where = `<button type="button" class="link-btn" data-ancient="${esc(e.source_text)}" data-at="${esc(e.at || "")}" title="Read the passage">${esc(e.cited_as)}</button>`;
  return `<blockquote class="ev" lang="${lang}">“${esc(e.quote)}” <span class="cite">${where} ${evFound(e)}</span></blockquote>`;
}
const evidenceList = (evs) => (evs || []).map(evidenceHtml).join("");
const workTitle = (id) => (workById(id) || {}).title || id;
const wholeHash = (id) => { const w = workById(id); return "#" + (w ? w.slug : id) + "/whole"; };
const refSpan = (w, a, b) => `<a href="${esc(placeHash(w, a))}">${esc(a)}</a>${b && b !== a ? `–<a href="${esc(placeHash(w, b))}">${esc(b)}</a>` : ""}`;

function setView(cls) {
  document.body.classList.remove("searching", "discussing", "whole-view", "corpus-view", "concepts-view");
  if (cls) document.body.classList.add(cls);
  closeInspector();
}

// ------------------------------------------------------------------ one dialogue as a whole

async function showWhole(workId) {
  state.view = "whole";
  setView("whole-view");
  $("#main").innerHTML = `<p class="loading">Gathering what is said of the ${esc(workTitle(workId))} as a whole…</p>`;
  try { WHOLE.data = await api(`whole/${workId}`); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  document.title = `${WHOLE.data.title} as a whole · Platonic Workshop`;
  const sel = $("#work-select");
  if (sel && workById(workId)?.imported) sel.value = workId;
  renderWhole();
}

function renderWhole() {
  const w = WHOLE.data;
  const thr = (w.orders.find((o) => o.id === "thrasyllus") || { items: [] }).items.find((i) => i.work_id === w.id);
  const claims = (k) => w.claims.filter((c) => c.kind === k);
  let h = `<div class="search whole">
    <h2>The ${esc(w.title)} as a whole</h2>
    <p class="prov">What the ancient readers, the commentators and the translators say of the dialogue as one thing: its persons and scene, its scope (skopos),
      its parts, and its place among the others. Every line names its source; the words it rests on are quoted, and a quotation the build could not find in its text is marked.</p>`;
  if (thr) {
    h += `<section><h3>In Thrasyllus' order</h3><p><b>${esc(thr.grp)}</b>, ${thr.pos} of 36: <i>${esc(thr.name)}</i>${thr.subtitle ? `, or <i>${esc(thr.subtitle)}</i>` : ""}${thr.character ? `; its character <b>${esc(thr.character)}</b>` : ""}.</p>${evidenceList(thr.evidence)}</section>`;
  }
  // Persons, scene, frame.
  const persons = claims("persons"), scene = claims("scene"), frame = claims("frame");
  h += `<section><h3>Persons and scene</h3>`;
  if (!persons.length && !scene.length) h += `<p class="none-msg">Neither Jowett nor Taylor prints the persons of this dialogue in a form the build could read.</p>`;
  h += persons.map((c) => `<p><b>Persons</b>, ${esc(c.cited_as)}: ${esc(c.value)}</p>`).join("");
  h += scene.map((c) => `<p><b>Scene</b>, ${esc(c.cited_as)}: ${esc(c.value)}</p>`).join("");
  h += frame.map((c) => `<p><b>The frame</b>, ${esc(c.cited_as)}: ${esc(c.value)}</p>`).join("");
  if (w.speakers.length) h += `<p class="meta">Speaking in the Greek (the speeches marked in the Perseus text${w.speakers.length === 1 ? "; in a narrated dialogue the narrator speaks throughout" : ""}): ${w.speakers.map((s) => `${esc(s.name)} ${s.speeches}`).join(", ")}.</p>`;
  h += `<p class="meta">As printed at the head of each translation; Taylor's are from the 1804 OCR, cleaned by rule, and keep its misreadings.</p></section>`;
  // Skopos.
  const sk = claims("skopos");
  const chosen = sk.filter((c) => c.method === "chosen by hand"), found = sk.filter((c) => c.method !== "chosen by hand");
  h += `<section><h3>Its scope (skopos)</h3>`;
  if (!sk.length) h += `<p class="none-msg">No statement of this dialogue's scope is in the library yet.</p>`;
  if (chosen.length) h += `<h4>The Anonymous Prolegomena (6th century), in Greek</h4>` + chosen.map((c) =>
    `<div class="claim"><span class="stance ${esc(c.stance)}">${c.stance === "accepted" ? "the Prolegomena's view" : "a view it rejects"}</span>${evidenceHtml({ source_text: c.text_id, at: c.at, quote: c.quote, found: c.found, cited_as: c.cited_as })}</div>`).join("");
  if (found.length) h += `<h4>Found by rule in the Introductions</h4><p class="meta">Every sentence of Taylor's Introduction${w.id === "tlg031" ? " and Proclus' preface" : ""} that says “scope” or “design” of the dialogue: candidates found by their words, not chosen. Read each in its note.</p>` +
    found.map((c) => `<div class="claim"><blockquote class="ev">“${esc(c.quote)}” <span class="cite">${esc(c.cited_as)} · <button type="button" class="link-btn" data-note-full="${c.note_id}">the whole note</button></span></blockquote></div>`).join("");
  h += `</section>`;
  // Divisions.
  if (w.chapters.length) {
    const basis = w.chapters[0].basis.split(" Span:")[0];
    h += `<section><h3>Archer-Hind's chapters</h3><p class="meta">${esc(basis)}</p><ol class="chapters">${w.chapters.map((c) => {
      const read = /Span: (.*)\.$/.exec(c.basis);
      return `<li><span class="span">${esc(c.label)}, ${refSpan(w.id, c.start_ref, c.end_ref)}</span> ${esc(c.detail)}${/[.:;?]$/.test(c.detail) ? "" : ` <span class="meta" title="The summary runs in the margin; the OCR breaks it at the next page, and only the first part is kept">[…]</span>`}
        ${read ? `<span class="meta" title="How the span was read from the OCR">(${esc(read[1])})</span>` : ""}</li>`;
    }).join("")}</ol></section>`;
  }
  if (w.sidenotes.length) {
    h += `<section><h3>Jowett's marginal analysis</h3><p class="meta">${esc(w.sidenote_basis)} ${w.sidenotes[0].precision === "page" ? "Placed by page, so each runs at least over its page." : ""}</p>
      <details${w.sidenotes.length < 80 ? " open" : ""}><summary>${w.sidenotes.length} sidenotes</summary><ul class="sidenotes">${w.sidenotes.map((s) =>
        `<li><span class="span">${refSpan(w.id, s.start_ref, s.end_ref)}</span> ${esc(s.label)}</li>`).join("")}</ul></details></section>`;
  }
  if (w.introductions.length) {
    h += `<section><h3>Introductions on the whole dialogue</h3><ul class="studies">${w.introductions.map((c) =>
      `<li><button type="button" class="link-btn" data-comm-read="${esc(c.id)}">${esc(c.label)}</button>: ${esc(c.title)}, ${c.notes} paragraphs <span class="meta">${esc(c.printed)}</span></li>`).join("")}</ul></section>`;
  }
  // Place in the corpus.
  const others = w.orders.filter((o) => o.id !== "thrasyllus");
  if (others.length) {
    h += `<section><h3>In the ancient orders of reading</h3>${others.map((o) => {
      const items = o.items.filter((i) => i.work_id === w.id);
      return `<div class="claim"><p><b>${esc(o.label)}</b> <span class="meta">${esc(o.cited)}</span>: ${items.map((i) =>
        `${i.grp ? esc(i.grp) : ""}${i.pos && o.kind === "sequence" ? ` (${i.pos} of ${o.items.length})` : ""}${i.doubt ? ` <span class="doubt-mark" title="${esc(i.doubt)}">?</span>` : ""}`).join("; ") || "named"}.
        <a href="#corpus?show=${esc(o.id)}">On the map</a></p>${items.map((i) => evidenceList(i.evidence)).join("")}</div>`;
    }).join("")}</section>`;
  }
  if (w.sequences.length) {
    h += `<section><h3>Dramatic sequences</h3>${w.sequences.map((s) => `<div class="claim"><p><b>${esc(s.label)}</b> <a href="#corpus?show=seq:${esc(s.id)}">On the map</a></p><ol>${s.steps.map((st) =>
      `<li><a href="${esc(placeHash(st.work_id, st.ref))}">${esc(st.title)} ${esc(st.ref)}</a>: ${esc(st.says)}${evidenceList(st.evidence)}</li>`).join("")}</ol>
      ${s.testimony.length ? `<p class="meta">Ancient testimony:</p>${evidenceList(s.testimony)}` : ""}</div>`).join("")}</section>`;
  }
  if (w.themes.length) {
    h += `<section><h3>Myths and images</h3>${w.themes.map((t) => themeHtml(t, w.id)).join("")}</section>`;
  }
  if (w.cites.length || w.cited_by.length) {
    const row = (r) => `<a href="${esc(wholeHash(r.id))}">${esc(r.title)}</a> ${r.notes}`;
    h += `<section><h3>The citation web</h3>
      ${w.cites.length ? `<p>Notes on the ${esc(w.title)} cite: ${w.cites.map(row).join(", ")}.</p>` : ""}
      ${w.cited_by.length ? `<p>Notes on other dialogues citing the ${esc(w.title)}: ${w.cited_by.map(row).join(", ")}.</p>` : ""}
      <p class="meta">Counted in notes, from the links of milestone 8 (certain and uncertain readings). <a href="${esc(discussedHash({ work: w.id, cross: true }))}">The passages they cite</a>.</p></section>`;
  }
  h += `</div>`;
  $("#main").innerHTML = h;
  renderWholeToc(w);
  window.scrollTo(0, 0);
}

function themeHtml(t, here) {
  return `<div class="claim"><p><b>${esc(t.label)}</b> <span class="meta">${esc(t.kind)}${t.group ? `, one of ${esc(t.group.label.toLowerCase())}` : ""}</span> <a href="#corpus?show=theme:${esc(t.id)}">On the map</a></p>
    <ul>${t.passages.map((p) => `<li>${p.work_id === here ? "" : esc(p.title) + " "}${refSpan(p.work_id, p.start_ref, p.end_ref)} <span class="meta" title="Where it ends is chosen by hand">(end by hand)</span>
      ${evidenceHtml({ source_text: "plato", work_id: p.work_id, at: p.start_ref, quote: p.quote, found: p.found })}
      ${p.named.length ? `<span class="meta">Notes in the passage naming it (“${esc(t.keywords.join("”, “"))}”):</span> ${p.named.map((n) => `<button type="button" class="link-btn" data-note-full="${n.id}">${esc(shortWho(n.commentator))} ${esc(n.start_ref)}</button>`).join(", ")}` : ""}</li>`).join("")}</ul>
    ${t.links.length ? `<p class="meta">Notes linking its passages${t.group ? " or those of the group" : ""}: ${t.links.map((l) => `<button type="button" class="link-btn" data-note-full="${l.note_id}" title="${esc(l.raw)}">${esc(shortWho(l.commentator))}, ${esc(workAbbr(l.from_work))} ${esc(l.from_ref)} → ${esc(workAbbr(l.to_work))} ${esc(l.to_ref)}</button>`).join(", ")}</p>` : ""}</div>`;
}

function renderWholeToc(w) {
  const back = workById(w.id)?.imported ? `<p><a href="${esc(placeHash(w.id))}" class="back-read">‹ Read the ${esc(w.title)}</a></p>` : "";
  $("#toc").innerHTML = `${back}<p><a href="#corpus" class="back-read">The corpus map</a></p>
    <h3>All the dialogues</h3><ul class="studies">${state.works.map((x) => `<li class="${x.id === w.id ? "here" : ""}"><a href="${esc(wholeHash(x.id))}">${esc(x.title)}</a></li>`).join("")}</ul>`;
}

// ------------------------------------------------------------------ the corpus map

async function showCorpusFromHash(h) {
  state.view = "corpus";
  setView("corpus-view");
  const p = new URLSearchParams(h.replace(/^corpus\??/, ""));
  WHOLE.overlay = p.get("show") || "thrasyllus";
  document.title = "The corpus as a whole · Platonic Workshop";
  if (!WHOLE.corpus) {
    $("#main").innerHTML = `<p class="loading">Drawing the corpus…</p>`;
    try { WHOLE.corpus = await api("corpus"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  renderCorpus();
}

// The overlays, each with what it highlights, the lines it draws, and the sources it rests on.
function overlays(c) {
  const out = [];
  for (const o of c.orders) out.push({ id: o.id, group: "Reading orders and classes", label: o.label, order: o });
  for (const s of c.sequences) out.push({ id: "seq:" + s.id, group: "Dramatic sequences", label: s.label, seq: s });
  const groups = new Set();
  for (const t of c.themes) {
    if (t.group && !groups.has(t.group.id)) { groups.add(t.group.id); out.push({ id: "group:" + t.group.id, group: "Myths and images", label: t.group.label, themes: c.themes.filter((x) => x.group_id === t.group.id) }); }
    out.push({ id: "theme:" + t.id, group: "Myths and images", label: t.label, themes: [t] });
  }
  out.push({ id: "themes", group: "Myths and images", label: "Every myth and image", themes: c.themes });
  out.push({ id: "citations", group: "The citation web", label: "Notes on one dialogue citing another" });
  out.push({ id: "speakers", group: "Shared characters", label: "Who speaks where" });
  return out;
}

function renderCorpus() {
  const c = WHOLE.corpus;
  const ovs = overlays(c);
  const ov = ovs.find((o) => o.id === WHOLE.overlay) || ovs[0];
  // Nine tetralogies of four, in Thrasyllus' order (Perseus tlg001-tlg036).
  const W = 980, colW = W / 9, rowH = 62, top = 34, H = top + 4 * rowH + 16;
  const pos = new Map();
  c.works.forEach((w, i) => pos.set(w.id, { x: colW * Math.floor(i / 4) + colW / 2, y: top + rowH * (i % 4) + rowH / 2 }));
  const mark = new Map();   // work -> text shown in its box (position, group)
  const lines = [];         // [from, to, weight, title]
  let listHtml = "", speakerSel = "";
  if (ov.order) {
    const o = ov.order;
    o.items.forEach((i) => { if (i.work_id) mark.set(i.work_id, [mark.get(i.work_id), o.kind === "sequence" || o.kind === "groups" ? i.pos : i.grp].filter(Boolean).join("; ")); });
    if (o.kind === "sequence") for (let k = 1; k < o.items.length; k++) if (o.items[k - 1].work_id && o.items[k].work_id) lines.push([o.items[k - 1].work_id, o.items[k].work_id, 2, `${k} → ${k + 1}`, true]);
    if (o.kind === "groups" && o.id !== "thrasyllus") {
      const by = new Map();
      o.items.forEach((i) => { if (i.work_id) { if (!by.has(i.grp)) by.set(i.grp, []); by.get(i.grp).push(i.work_id); } });
      for (const [g, ws] of by) for (let k = 1; k < ws.length; k++) lines.push([ws[k - 1], ws[k], 2, g]);
    }
    listHtml = `<h3>${esc(o.label)}</h3><p class="meta">${esc(o.by)}; ${esc(o.cited)}. ${esc(o.about || "")}</p>${evidenceList(o.frame)}
      <table class="counts"><thead><tr><th>${o.kind === "classes" ? "Class" : "Place"}</th><th>Dialogue</th><th>The words</th></tr></thead><tbody>${o.items.map((i) =>
        `<tr><td>${esc([i.grp, o.kind === "sequence" ? i.pos : ""].filter(Boolean).join(" "))}</td><td>${i.work_id ? `<a href="${esc(wholeHash(i.work_id))}">${esc(i.title)}</a>` : `<span class="meta">${esc(i.name || "not one dialogue")}</span>`}${i.subtitle ? `, <i>${esc(i.subtitle)}</i>` : ""}${i.character ? ` <span class="meta">${esc(i.character)}</span>` : ""}${i.doubt ? ` <span class="doubt-mark" title="${esc(i.doubt)}">?</span>` : ""}</td>
        <td>${evidenceList(i.evidence)}</td></tr>`).join("")}</tbody></table>`;
  } else if (ov.seq) {
    const s = ov.seq;
    s.works.forEach((w, k) => mark.set(w, String(k + 1)));
    for (let k = 1; k < s.works.length; k++) lines.push([s.works[k - 1], s.works[k], 2, "", true]);
    listHtml = `<h3>${esc(s.label)}</h3><ol>${s.steps.map((st) => `<li><a href="${esc(placeHash(st.work_id, st.ref))}">${esc(st.title)} ${esc(st.ref)}</a>: ${esc(st.says)}${evidenceList(st.evidence)}</li>`).join("")}</ol>
      ${s.testimony.length ? `<p class="meta">Ancient testimony:</p>${evidenceList(s.testimony)}` : ""}`;
  } else if (ov.themes) {
    for (const t of ov.themes) {
      const ws = [...new Set(t.passages.map((p) => p.work_id))];
      ws.forEach((w) => mark.set(w, [mark.get(w), ov.themes.length > 1 ? "" : t.passages.filter((p) => p.work_id === w).map((p) => p.start_ref).join(", ")].filter(Boolean).join("; ") || "●"));
      for (const l of t.links) if (l.from_work !== l.to_work) lines.push([l.from_work, l.to_work, 1.5, `${shortWho(l.commentator)}: ${l.raw}`]);
    }
    listHtml = ov.themes.length > 1 && ov.id === "themes"
      ? `<h3>Every myth and image</h3><table class="counts"><thead><tr><th>Myth or image</th><th>Passages</th><th class="num">Notes naming it</th></tr></thead><tbody>${ov.themes.map((t) =>
        `<tr><td><a href="#corpus?show=theme:${esc(t.id)}">${esc(t.label)}</a></td><td>${t.passages.map((p) => `${esc(p.title)} ${refSpan(p.work_id, p.start_ref, p.end_ref)}`).join("; ")}</td><td class="num">${t.passages.reduce((n, p) => n + p.named.length, 0)}</td></tr>`).join("")}</tbody></table>
        <p class="meta">Each passage begins at a quotation of Burnet's Greek, checked by the build; where it ends is chosen by hand.</p>`
      : ov.themes.map((t) => themeHtml(t, null)).join("");
  } else if (ov.id === "citations") {
    const pair = new Map();
    for (const r of c.citations) {
      const k = [r.from_work, r.to_work].sort().join("|");
      pair.set(k, (pair.get(k) || 0) + r.notes);
    }
    const min = +(WHOLE.pick || 20);
    for (const [k, n] of pair) if (n >= min) { const [a, b] = k.split("|"); lines.push([a, b, Math.min(6, 0.6 + Math.log2(n)), `${workTitle(a)} and ${workTitle(b)}: ${n} notes`]); }
    const tot = new Map();
    for (const r of c.citations) { tot.set(r.from_work, (tot.get(r.from_work) || 0) + r.notes); tot.set(r.to_work, (tot.get(r.to_work) || 0) + r.notes); }
    for (const [w, n] of tot) mark.set(w, String(n));
    const top = [...pair].sort((a, b) => b[1] - a[1]).slice(0, 15);
    speakerSel = `<label>Draw pairs with at least <select id="corpus-pick">${[1, 2, 5, 10, 20, 50].map((n) => `<option ${n === min ? "selected" : ""}>${n}</option>`).join("")}</select> notes</label>`;
    listHtml = `<h3>Notes on one dialogue citing another</h3><p class="meta">From the citation web of milestone 8: the notes on either dialogue that cite a passage of the other, both ways, certain and uncertain readings (not the unresolved). The number in each box is all such notes it takes part in. A line's thickness grows with the count.</p>
      <table class="counts"><thead><tr><th>Pair</th><th class="num">Notes</th></tr></thead><tbody>${top.map(([k, n]) => { const [a, b] = k.split("|"); return `<tr><td><a href="${esc(wholeHash(a))}">${esc(workTitle(a))}</a> and <a href="${esc(wholeHash(b))}">${esc(workTitle(b))}</a></td><td class="num">${n}</td></tr>`; }).join("")}</tbody></table>`;
  } else if (ov.id === "speakers") {
    const names = new Map();
    for (const [w, ss] of Object.entries(c.speakers)) for (const s of ss) { if (!names.has(s.name)) names.set(s.name, []); names.get(s.name).push([w, s.speeches]); }
    const shared = [...names].filter(([, ws]) => ws.length > 1).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    const pick = WHOLE.pick && names.has(WHOLE.pick) ? WHOLE.pick : (shared.find(([n]) => n !== "Socrates") || shared[0] || [""])[0];
    for (const [w, n] of names.get(pick) || []) mark.set(w, String(n));
    speakerSel = `<label>Speaker <select id="corpus-pick">${shared.map(([n, ws]) => `<option value="${esc(n)}" ${n === pick ? "selected" : ""}>${esc(n)} (${ws.length} dialogues)</option>`).join("")}</select></label>`;
    listHtml = `<h3>${esc(pick)}</h3><p class="meta">The speakers as the Perseus text marks the speeches (<code>&lt;said who&gt;</code>); the number is the speeches. In a narrated dialogue (the Republic, the Symposium, the Charmides…) only the narrator is marked, so the people he reports are not counted here: see each dialogue's persons as the translators print them.</p>
      <table class="counts"><thead><tr><th>Speaks in</th><th class="num">Speeches</th></tr></thead><tbody>${(names.get(pick) || []).map(([w, n]) => `<tr><td><a href="${esc(wholeHash(w))}">${esc(workTitle(w))}</a></td><td class="num">${n}</td></tr>`).join("")}</tbody></table>`;
  }
  // The SVG.
  let svg = `<svg class="corpus-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="The 36 works in Thrasyllus' nine tetralogies; ${esc(ov.label)} highlighted">`;
  for (let t = 0; t < 9; t++) svg += `<text class="tet" x="${colW * t + colW / 2}" y="20">Tetralogy ${t + 1}</text>`;
  svg += `<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="arrowhead"/></marker></defs>`;
  for (const [a, b, wt, title, arrow] of lines) {
    const p = pos.get(a), q = pos.get(b);
    if (!p || !q) continue;
    const bend = p.x === q.x ? 28 : (Math.abs(p.y - q.y) < 1 ? -18 : 0);
    const mx = (p.x + q.x) / 2 + bend, my = (p.y + q.y) / 2 + (p.x === q.x ? 0 : bend);
    svg += `<path class="link" d="M${p.x},${p.y} Q${mx},${my} ${q.x},${q.y}" stroke-width="${wt}" ${arrow ? 'marker-end="url(#arrow)"' : ""}><title>${esc(title)}</title></path>`;
  }
  for (const w of c.works) {
    const p = pos.get(w.id), m = mark.get(w.id);
    const bw = colW - 12, bh = rowH - 14;
    svg += `<a href="${esc(wholeHash(w.id))}" class="node${m !== undefined ? " on" : ""}"><title>${esc(w.title)}${m ? ": " + esc(m) : ""} (the dialogue as a whole)</title>
      <rect x="${p.x - bw / 2}" y="${p.y - bh / 2}" width="${bw}" height="${bh}" rx="5"/>
      <text x="${p.x}" y="${p.y - 3}" class="name">${esc(w.title.length > 15 ? (w.abbr || w.title.slice(0, 14)) : w.title)}</text>
      ${m ? `<text x="${p.x}" y="${p.y + 13}" class="mk">${esc(String(m).length > 18 ? String(m).slice(0, 17) + "…" : m)}</text>` : ""}</a>`;
  }
  svg += `</svg>`;
  const byGroup = new Map();
  ovs.forEach((o) => { if (!byGroup.has(o.group)) byGroup.set(o.group, []); byGroup.get(o.group).push(o); });
  $("#main").innerHTML = `<div class="search corpus">
    <h2>The corpus as a whole</h2>
    <p class="prov">The 36 works in the nine tetralogies of Thrasyllus, as Diogenes Laertius reports them (the order of the Perseus text). Choose what to draw over them;
      a highlighted box is a dialogue the overlay names, and its label says how. Click a box for that dialogue as a whole.</p>
    <form class="disc-form" id="corpus-form"><label>Show <select id="corpus-ov">${[...byGroup].map(([g, os]) => `<optgroup label="${esc(g)}">${os.map((o) =>
      `<option value="${esc(o.id)}" ${o.id === ov.id ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</optgroup>`).join("")}</select></label> ${speakerSel}</form>
    <div class="map-wrap">${svg}</div>
    <div class="overlay-list">${listHtml}</div></div>`;
  $("#toc").innerHTML = `<p><a href="${esc(placeHash(WORK, state.page ? String(state.page) : null))}" class="back-read">‹ Back to the ${esc(state.work ? state.work.title : "text")}</a></p>
    <h3>The ancient introductions</h3><ul class="studies">${c.ancient.map((t) => `<li><button type="button" class="link-btn" data-ancient="${esc(t.id)}" data-at="">${esc(t.title)}</button> <span class="meta">${esc(t.translator || "Greek")} · ${esc(t.proof_status)}</span></li>`).join("")}</ul>
    ${c.stats ? `<p class="note">${(c.stats["quotations found"] || 0).toLocaleString()} of ${(c.stats.quotations || 0).toLocaleString()} quotations found in the texts they are said to be in. The figures and every doubt are in <code>reports/structure.md</code>.</p>` : ""}`;
  window.scrollTo(0, 0);
}

// ------------------------------------------------------------------ reading an ancient text

async function openAncient(id, at) {
  const dlg = $("#comm-dialog");
  const body = $("#comm-body");
  body.innerHTML = `<p class="loading">…</p>`;
  if (!dlg.open) dlg.showModal();
  let t;
  try { t = await api(`ancient/${id}` + (at ? `?at=${encodeURIComponent(at)}` : "")); } catch (e) { body.innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  const unit = { sections: "§", chapters: "ch.", pages: "p." }[t.numbering];
  $("#comm-title").textContent = `${t.cite}${at ? ` ${unit} ${at}` : ""}: ${t.title}`;
  body.innerHTML = `<p class="meta">${esc(t.printed)}${t.translator ? `, translated by ${esc(t.translator)}` : ""} · ${esc(t.proof_status)}</p>` +
    t.sections.map((s) => `<div class="ancient-sec" lang="${t.lang === "grc" ? "grc" : "en"}"><h4>${unit} ${esc(s.n)}${s.pages && t.numbering !== "pages" ? ` <span class="meta">p. ${esc(s.pages)}</span>` : ""}${s.number_read ? ` <span class="doubt-mark" title="The OCR prints ${esc(s.number_read)}: read as the next number due">?</span>` : ""}</h4>
      <p>${esc(s.text)}</p>${s.raw ? `<details><summary class="meta">The OCR as received</summary><pre>${esc(s.raw)}</pre></details>` : ""}</div>`).join("");
}

document.addEventListener("click", (ev) => {
  const a = ev.target.closest("[data-ancient]");
  if (a) { ev.preventDefault(); openAncient(a.dataset.ancient, a.dataset.at); return; }
  if (ev.target.closest("#whole-btn")) location.hash = wholeHash(WORK).slice(1);
  if (ev.target.closest("#corpus-btn")) location.hash = "corpus";
});

document.addEventListener("change", (ev) => {
  if (ev.target.id === "corpus-ov") { WHOLE.pick = ""; location.hash = "corpus?show=" + encodeURIComponent(ev.target.value); }
  else if (ev.target.id === "corpus-pick") { WHOLE.pick = ev.target.value; renderCorpus(); }
});

// "Where you are in the whole", for the contents beside the text: the chapter, the marginal note and the myth or image the page is in.
function renderTocWhole(w, curRefs) {
  const seq = new Map(w.sections.map((r, i) => [r, i]));
  const inside = (a, b) => curRefs.some((r) => seq.get(r) >= seq.get(a) && seq.get(r) <= seq.get(b));
  const ch = (w.chapters || []).filter((c) => inside(c.start_ref, c.end_ref));
  const sn = (w.sidenotes || []).filter((c) => inside(c.start_ref, c.end_ref));
  const th = (w.themes || []).filter((c) => inside(c.start_ref, c.end_ref));
  let h = `<h3>Where you are in the whole</h3>`;
  const cs = renderTocConcepts(w, inside);
  if (!ch.length && !sn.length && !th.length && !cs) h += `<p class="note">No printed division, myth or concept passage is marked on this page.</p>`;
  h += ch.map((c) => `<p class="note"><b>${esc(c.author)}, ${esc(c.label)}</b> (${esc(c.start_ref)}–${esc(c.end_ref)}): ${esc(c.detail.length > 220 ? c.detail.slice(0, 219) + "…" : c.detail)}</p>`).join("");
  h += sn.length ? `<ul class="note sidenotes">${sn.slice(0, 8).map((s) => `<li>${esc(s.label)} <span class="meta">Jowett, ${esc(s.start_ref)}</span></li>`).join("")}</ul>` : "";
  h += th.map((t) => `<p class="note">${esc(t.kind === "myth" ? "Myth" : "Image")}: <a href="#corpus?show=theme:${esc(t.id)}">${esc(t.label)}</a> (${esc(t.start_ref)}–${esc(t.end_ref)})</p>`).join("");
  h += cs;
  h += `<p class="note"><a href="${esc(wholeHash(w.id))}">The ${esc(w.title)} as a whole</a> · <a href="#corpus">the corpus map</a></p>`;
  return h;
}
