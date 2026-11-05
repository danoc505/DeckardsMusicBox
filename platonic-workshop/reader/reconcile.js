// Milestone 12: reconciling passages of Plato that seem to disagree (#reconcile).
//   #reconcile                      the recorded tensions, and your worksheets
//   #reconcile/<id>                 one tension: passages, words, commentary, readings, methods
//   #reconcile/sheet/<n>            your worksheet; #reconcile/new?tension=<id> starts one
//   #reconcile/compare/<id>         the readings of a tension and your worksheets side by side
//   #reconcile/methods[/<id>]       the methods database, with your own methods
// Every reading is labelled: "established" when its holder is quoted giving it, "proposed" when it is
// the Workshop's suggestion, "yours" for your worksheets. None is shown as the only reading.
"use strict";

const REC = { list: null, one: null, methods: null, sheet: null, dirty: false };
const STATUS_LABEL = {
  established: ["established", "Held by the reader named, in the words quoted under it."],
  proposed: ["proposed", "A suggestion of the Workshop's, not a reading found in the sources. Weigh it as a proposal."],
  yours: ["yours", "Your own reading, from your worksheet."],
};
const statusBadge = (s) => `<span class="rstatus rstatus-${esc(s)}" title="${esc(STATUS_LABEL[s][1])}">${esc(STATUS_LABEL[s][0])}</span>`;
const editorial = (t) => `<span class="editorial" title="Written for the Workshop in plain English: a summary, not a quotation">${esc(t)}</span>`;
const SHEET_STEPS = [
  ["passages", "The passages", "The passages that seem to disagree. Start from a recorded tension, or choose your own."],
  ["contradiction", "The contradiction", "What exactly seems to conflict, in your words: which claim, in which sense of which word."],
  ["dictionary", "Dictionary evidence", "What the words at issue can mean (LSJ and Middle Liddell are shown on the right of each word)."],
  ["commentary", "Commentary", "What the commentators and later Platonists say, and where. The record lists the quotations it rests on."],
  ["methods", "Methods", "The interpretive methods you use: the library's, with their grounds, or your own."],
  ["interpretation", "Your interpretation", "How the passages fit together on your reading, and why."],
  ["rendering", "Your reconciled translation", "Your translation of the passages as you now read them."],
  ["references", "References", "Your sources, as you would cite them."],
  ["status", "Status", "A worksheet in progress, or your proposal. Either way it is one reading beside the others."],
];

// A quotation: Burnet, a translation, a web page, a book, or a note.
function recEv(e) {
  if (e.source_text === "web") {
    return `<blockquote class="ev" lang="en">“${esc(e.quote)}” <span class="cite"><a href="${esc(e.at)}" target="_blank" rel="noopener">${esc(e.cited_as)}</a> ${evFound(e)}
      <span class="meta" title="Checked against the page as fetched by tools/reconcile.py --web">· checked on the page</span></span></blockquote>`;
  }
  if (e.source_text === "translation") {
    return `<blockquote class="ev" lang="en">“${esc(e.quote)}” <span class="cite"><a href="${esc(placeHash(e.work_id, e.at))}">${esc(e.cited_as)}</a> ${evFound(e)}</span></blockquote>`;
  }
  if (/-gutenberg$/.test(e.source_text)) {
    return `<blockquote class="ev" lang="en">“${esc(e.quote)}” <span class="cite">${esc(e.cited_as)} ${evFound(e)}</span></blockquote>`;
  }
  return conceptEv(e);
}
const recEvs = (evs) => (evs || []).map(recEv).join("");

async function showReconcile(rest) {
  state.view = "reconcile";
  setView("reconcile-view");
  const [what, arg] = rest.split("/");
  try {
    if (!what) await renderTensionList();
    else if (what === "methods") await renderMethods(arg ? decodeURIComponent(arg) : null);
    else if (what === "sheet") await openSheet(+arg);
    else if (what.startsWith("new")) await newSheet(new URLSearchParams(rest.split("?")[1] || "").get("tension"));
    else if (what === "compare") await renderCompare(decodeURIComponent(arg));
    else await renderTension(decodeURIComponent(what));
  } catch (e) {
    $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
  renderReconcileToc();
  window.scrollTo(0, 0);
}

function renderReconcileToc() {
  const L = REC.list;
  $("#toc").innerHTML = `<h3>Reconciliations</h3><ul class="books">
    <li><a href="#reconcile"><span>All tensions</span></a></li>
    <li><a href="#reconcile/methods"><span>Methods</span></a></li>
    <li><a href="#reconcile/new"><span>New worksheet</span></a></li></ul>
    ${L ? `<h3>Tensions</h3><ul class="speeches">${L.tensions.map((t) => `<li class="${REC.one && REC.one.id === t.id ? "here" : ""}"><a href="#reconcile/${esc(t.id)}"><span>${esc(t.title)}</span></a></li>`).join("")}</ul>` : ""}`;
}

async function loadList() {
  REC.list = await api("reconcile");
  return REC.list;
}

async function renderTensionList() {
  document.title = "Reconciliations · Platonic Workshop";
  REC.one = null;
  const L = await loadList();
  const st = L.stats || {};
  let h = `<div class="search reconcile">
    <h2>Reconciliations</h2>
    <p class="prov">Places where Plato seems to say two things that cannot both be true. Each record gives the passages in Burnet's Greek with an English translation,
      the words at issue with their dictionary entries, the commentators who see the tension, and the ways of reconciling it: the <b>established</b> readings,
      quoted from those who hold them, and the Workshop's <b>proposed</b> readings, marked as proposals. None is offered as the only reading.
      Then work it through yourself on a worksheet, and compare your reading with the others.
      ${st.quotations ? `${st["quotations found"]} of ${st.quotations} quotations were found in the texts and pages they are said to be in (<code>reports/reconcile.md</code>).` : ""}</p>
    <p><a class="btn" href="#reconcile/new">New worksheet on passages of your choice</a> <a class="btn" href="#reconcile/methods">The methods database</a></p>
    <table class="counts rec-table"><thead><tr><th>Tension</th><th>Passages</th><th>Kind</th><th class="num" title="Readings quoted from those who hold them">Established</th>
      <th class="num" title="The Workshop's proposals">Proposed</th><th class="num">Your worksheets</th></tr></thead><tbody>`;
  for (const t of L.tensions) {
    h += `<tr><td><a href="#reconcile/${esc(t.id)}"><b>${esc(t.title)}</b></a></td>
      <td>${t.passages.map((p) => `${esc(p.title)} ${esc(p.start_ref)}`).join("; ")}</td><td class="meta">${esc(t.category)}</td>
      <td class="num">${t.readings.filter((r) => r.status === "established").length}</td><td class="num">${t.readings.filter((r) => r.status === "proposed").length}</td>
      <td class="num">${t.sheets || ""}</td></tr>`;
  }
  h += `</tbody></table>`;
  if (L.own_sheets.length) {
    h += `<section><h3>Your worksheets on passages of your choice</h3><ul>${L.own_sheets.map((s) => `<li><a href="#reconcile/sheet/${s.id}">${esc(s.title)}</a>
      ${statusBadge("yours")} <span class="meta">${esc(s.status === "proposal" ? "your proposal" : "in progress")} · revision ${s.rev}, ${esc(s.updated_at.slice(0, 10))}</span></li>`).join("")}</ul></section>`;
  }
  $("#main").innerHTML = h + `</div>`;
}

function passageHead(p) {
  return `<a href="${esc(placeHash(p.work_id, p.start_ref))}"><b>${esc(p.title)} ${esc(p.start_ref)}${p.end_ref !== p.start_ref ? "–" + esc(p.end_ref) : ""}</b></a>`;
}

function wordHtml(w) {
  const lx = (id) => (state.lexica.find((x) => x.id === id) || {}).label || id;
  const dict = w.dictionary.map((d) => `<div class="dict-ev"><span class="meta">${esc(lx(d.lexicon))}:</span> ${d.glosses.map((g) => `<i>${esc(g)}</i>`).join("; ") || "<span class='meta'>no sense marked</span>"}
    ${d.cites_here.length ? `<span class="badge quoted" title="The dictionary cites this very passage for the word">cites ${esc(d.cites_here.join(", "))}</span>` : ""}</div>`).join("");
  return `<li><button type="button" class="link-btn" lang="grc" data-lookup="${esc(w.lemma)}" title="Open the dictionary entries">${esc(w.lemma)}</button> ${editorial(w.why)}
    <span class="meta">· ${w.tagged ? `${w.tagged} word${w.tagged === 1 ? "" : "s"} of the passage tagged with it (GLAUx)` : "not tagged in the passage"}</span>${dict}</li>`;
}

async function renderTension(id) {
  if (!REC.list) await loadList();
  const t = REC.one = await api(`reconcile/${encodeURIComponent(id)}`);
  document.title = `${t.title} · Reconciliations · Platonic Workshop`;
  const byN = new Map(t.passages.map((p) => [p.n, p]));
  let h = `<div class="search reconcile one">
    <p class="meta"><a href="#reconcile">Reconciliations</a> · ${esc(t.category)}</p>
    <h2>${esc(t.title)}</h2>
    <p class="question">${editorial(t.question)}</p>
    <section><h3>The nature of the contradiction</h3><p>${editorial(t.nature)}</p>
      <h4>Who sees the tension</h4>${recEvs(t.documented)}</section>
    <section><h3>The passages</h3>`;
  for (const p of t.passages) {
    const notes = p.notes.length ? `<details class="rec-notes"><summary>${p.notes.length} note${p.notes.length === 1 ? "" : "s"} on the passage</summary><ul>${p.notes.map((n) =>
      `<li><b>${esc(n.commentator)}</b> on ${esc(n.start_ref)}: ${esc(n.opening.replace(/<[^>]+>/g, " ").slice(0, 300))}${n.chars > 300 ? "…" : ""}
        <button type="button" class="link-btn" data-note-full="${n.id}">the whole note</button></li>`).join("")}</ul></details>` : `<p class="meta">No commentary note in the library is printed on these sections.</p>`;
    h += `<div class="rec-passage"><h4><span class="side">${p.side === "more" ? "and" : esc(p.side.toUpperCase())}</span> ${passageHead(p)}</h4>
      <p>${editorial(p.says)}</p>${recEvs(p.evidence)}
      ${p.words.length ? `<h5>The words at issue</h5><ul class="rec-words">${p.words.map(wordHtml).join("")}</ul>` : ""}
      ${notes}</div>`;
  }
  h += `</section>`;
  if (t.cites.length) {
    h += `<section><h3>Notes on one passage that cite another</h3><p class="prov">From the citation web (milestone 8): each note below is printed on one passage of this tension and cites another of them.</p><ul>${t.cites.map((c) =>
      `<li><b>${esc(c.commentator)}</b> on ${esc(workTitle(c.work_id))} ${esc(c.start_ref)} cites ${byN.get(c.to_n) ? passageHead(byN.get(c.to_n)) : ""}:
        ${esc(c.opening.replace(/<[^>]+>/g, " ").slice(0, 260))}… <button type="button" class="link-btn" data-note-full="${c.note_id}">the whole note</button></li>`).join("")}</ul></section>`;
  }
  h += `<section><h3>Concepts</h3><p>${t.concepts.map((c) => `<a href="#concepts/${esc(c.id)}">${esc(c.label)}</a>`).join(" · ")}</p></section>
    <section><h3>Ways of reconciling it</h3><p class="prov">Each reading names its method and who holds it. Established readings are quoted from their holders; proposed ones are the Workshop's suggestions.</p>`;
  for (const r of t.readings) {
    h += `<div class="reading">${statusBadge(r.status)} <a href="#reconcile/methods/${esc(r.method_id)}"><b>${esc(r.method_name)}</b></a> <span class="meta">· ${esc(r.by)}</span>
      <p>${editorial(r.summary)}</p>${recEvs(r.evidence) || `<p class="meta">No quotation: a proposal for you to test.</p>`}</div>`;
  }
  h += `</section><section><h3>Methods retrieved for this tension</h3><p class="prov">From the methods database: a method is retrieved when a reading above uses it, or when it belongs with a concept this tension is about.</p><ul>`;
  for (const m of t.methods.filter((m) => m.retrieved)) h += `<li><a href="#reconcile/methods/${esc(m.id)}"><b>${esc(m.name)}</b></a>: ${m.because.map(esc).join("; ")}</li>`;
  for (const m of t.my_methods.filter((m) => m.retrieved)) h += `<li><b>${esc(m.title)}</b> ${statusBadge("yours")}: ${m.because.map(esc).join("; ")}</li>`;
  h += `</ul></section><section><h3>Your worksheets on it</h3>
    ${t.sheets.length ? `<ul>${t.sheets.map((s) => `<li><a href="#reconcile/sheet/${s.id}">${esc(s.title)}</a> ${statusBadge("yours")} <span class="meta">${esc(s.status === "proposal" ? "your proposal" : "in progress")} · revision ${s.rev}</span></li>`).join("")}</ul>` : `<p class="meta">None yet.</p>`}
    <p><a class="btn" href="#reconcile/new?tension=${esc(t.id)}">Work it through on a worksheet</a> <a class="btn" href="#reconcile/compare/${esc(t.id)}">Compare the readings${t.sheets.length ? " and your worksheets" : ""}</a></p></section></div>`;
  $("#main").innerHTML = h;
}

// ------------------------------------------------------------------ the methods database

async function renderMethods(id) {
  REC.methods = await api("methods");
  if (!REC.list) await loadList();
  const { library, mine } = REC.methods;
  document.title = "Methods · Reconciliations · Platonic Workshop";
  let concepts = [];
  try { concepts = (CONCEPTS.list || (CONCEPTS.list = await api("concepts"))).concepts; } catch (e) { /* the form still works without */ }
  let h = `<div class="search reconcile methods"><p class="meta"><a href="#reconcile">Reconciliations</a></p><h2>Interpretive methods</h2>
    <p class="prov">The ways of reading that reconcile apparent contradictions. Each is grounded in quoted words: where Plato or the later Platonists use or describe it.
      The library's methods live in <code>sources/reconcile/methods.json</code>, an editable file: change it and run <code>python3 tools/reconcile.py</code> (seconds) to rebuild
      them, and every quotation is checked again. Your own methods, below, are kept with your work and need a citation.</p>`;
  for (const m of library) {
    h += `<div class="method${m.id === id ? " flash" : ""}" id="m-${esc(m.id)}"><h3>${esc(m.name)} ${m.greek ? `<span lang="grc" class="meta">${esc(m.greek)}</span>` : ""}</h3>
      <p>${editorial(m.plain)}</p><h5>Grounds</h5>${recEvs(m.grounds)}
      <p class="meta">${m.concepts.length ? `Retrieved for passages of the concepts: ${m.concepts.map((c) => `<a href="#concepts/${esc(c.id)}">${esc(c.label)}</a>`).join(", ")}.` : "Placed with no concept: retrieved only where a reading uses it."}
      ${m.used.length ? ` Used for: ${m.used.map((u) => `<a href="#reconcile/${esc(u.tension_id)}">${esc(u.title)}</a> (${esc(u.status)})`).join("; ")}.` : ""}</p></div>`;
  }
  h += `<section id="my-methods"><h3>Your own methods</h3>${mine.length ? mine.map((m) => `<div class="method mine-method"><h4>${esc(m.title)} ${statusBadge("yours")}</h4>
      <div class="md">${md(m.plain, "fn-m" + m.id)}</div><p class="meta">Citation: ${esc(m.citation)}${m.concepts.length ? ` · concepts: ${m.concepts.map(esc).join(", ")}` : ""} · revision ${m.rev}</p>
      <button type="button" class="btn" data-edit-method="${m.id}">Edit</button> <button type="button" class="btn" data-del-method="${m.id}" data-base="${m.rev}">Delete</button></div>`).join("") : `<p class="meta">None yet.</p>`}
    <form class="method-form" id="method-form"><h4 id="method-form-h">Add a method</h4><input type="hidden" name="id"><input type="hidden" name="base_rev">
      <label>Name <input name="title" required maxlength="200"></label>
      <label>What it is <textarea name="plain" rows="3"></textarea></label>
      <label>Citation (required): who uses or describes it, and where <input name="citation" required></label>
      <label>Concepts it belongs with <select name="concepts" multiple size="5">${concepts.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("")}</select></label>
      <button class="btn" type="submit">Save the method</button> <span class="meta" id="method-msg"></span></form></section></div>`;
  $("#main").innerHTML = h;
  if (id) document.getElementById("m-" + id)?.scrollIntoView({ block: "start" });
}

async function saveMethod(form) {
  const f = new FormData(form);
  const data = { title: f.get("title"), plain: f.get("plain"), citation: f.get("citation"), concepts: f.getAll("concepts") };
  try {
    if (f.get("id")) await send("PUT", `mine/method/${f.get("id")}`, { ...data, base_rev: +f.get("base_rev") });
    else await send("POST", "my-methods", data);
    await renderMethods(null);
    document.getElementById("my-methods")?.scrollIntoView();
  } catch (e) { $("#method-msg").textContent = e.message; }
}

// ------------------------------------------------------------------ the worksheet

function blankSheet(t) {
  return {
    id: null, rev: null, title: t ? `My reading: ${t.title}` : "My reconciliation", tension_id: t ? t.id : null,
    sheet: {
      passages: t ? t.passages.map((p) => ({ work: p.work_id, start_ref: p.start_ref, end_ref: p.end_ref })) : [],
      methods: [], contradiction: "", dictionary: "", commentary: "", interpretation: "", rendering: "", references: "", status: "working",
    },
  };
}

async function newSheet(tid) {
  if (!REC.list) await loadList();
  REC.one = tid ? await api(`reconcile/${encodeURIComponent(tid)}`) : null;
  REC.sheet = blankSheet(REC.one);
  await renderSheet();
}

async function openSheet(n) {
  if (!REC.list) await loadList();
  const s = await api(`mine/reconciliation/${n}`);
  REC.one = s.tension_id ? await api(`reconcile/${encodeURIComponent(s.tension_id)}`) : null;
  REC.sheet = s;
  await renderSheet();
}

function sheetAside(key) {
  const t = REC.one;
  if (!t) return "";
  if (key === "contradiction") return `<p>${editorial(t.nature)}</p>${recEvs(t.documented)}`;
  if (key === "dictionary") return t.passages.map((p) => p.words.length ? `<p>${passageHead(p)}</p><ul class="rec-words">${p.words.map(wordHtml).join("")}</ul>` : "").join("");
  if (key === "commentary") return t.passages.map((p) => `<p>${passageHead(p)}: ${p.notes.length} note${p.notes.length === 1 ? "" : "s"} in the library</p>`).join("")
    + t.readings.filter((r) => r.evidence.length).map((r) => `<p class="meta">${esc(r.by)}:</p>${recEvs(r.evidence)}`).join("");
  if (key === "rendering") return t.passages.map((p) => `<p>${passageHead(p)}</p>${recEvs(p.evidence)}`).join("");
  return "";
}

async function renderSheet() {
  const s = REC.sheet, sh = s.sheet, t = REC.one;
  if (!REC.methods) REC.methods = await api("methods");
  document.title = `${s.title} · Worksheet · Platonic Workshop`;
  const retrieved = new Map((t ? t.methods : []).filter((m) => m.retrieved).map((m) => [m.id, m.because]));
  const lib = [...REC.methods.library].sort((a, b) => (retrieved.has(b.id) - retrieved.has(a.id)));
  const workOpts = (sel) => state.works.filter((w) => w.imported).map((w) => `<option value="${w.id}" ${w.id === sel ? "selected" : ""}>${esc(w.title)}</option>`).join("");
  let h = `<div class="search reconcile sheet"><p class="meta"><a href="#reconcile">Reconciliations</a>${t ? ` · <a href="#reconcile/${esc(t.id)}">${esc(t.title)}</a>` : ""}</p>
    <h2>Worksheet ${statusBadge("yours")}</h2>
    <p class="prov">Your reading is kept in <code>data/user.sqlite</code> with every version. It is one reading beside the others: the comparison page sets it next to the established and proposed readings.</p>
    <form id="sheet-form" class="sheet-form">
    <label class="sheet-title">Title <input name="title" value="${esc(s.title)}" required maxlength="200"></label>
    <label>On the tension <select name="tension_id"><option value="">none: passages of your choice</option>${REC.list.tensions.map((x) => `<option value="${esc(x.id)}" ${x.id === s.tension_id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select></label>`;
  SHEET_STEPS.forEach(([key, head, help], i) => {
    h += `<fieldset class="step" data-step="${key}"><legend>${i + 1}. ${esc(head)}</legend><p class="meta">${esc(help)}</p><div class="step-body">`;
    if (key === "passages") {
      h += `<ul class="sheet-passages">${sh.passages.map((p, j) => `<li data-j="${j}"><select name="p-work">${workOpts(p.work)}</select>
        <input name="p-start" value="${esc(p.start_ref)}" size="6" aria-label="first section"> – <input name="p-end" value="${esc(p.end_ref)}" size="6" aria-label="last section">
        <a href="${esc(placeHash(p.work, p.start_ref))}" title="Read it">read</a> <button type="button" class="link-btn" data-drop-passage="${j}">remove</button></li>`).join("")}</ul>
        <button type="button" class="btn" id="add-passage">Add a passage</button>`;
    } else if (key === "methods") {
      h += `<ul class="sheet-methods">${lib.map((m) => `<li><label><input type="checkbox" name="method" value="${esc(m.id)}" ${sh.methods.includes(m.id) ? "checked" : ""}> <b>${esc(m.name)}</b></label>
        <a href="#reconcile/methods/${esc(m.id)}" class="meta">grounds</a>${retrieved.has(m.id) ? ` <span class="meta">· retrieved: ${retrieved.get(m.id).map(esc).join("; ")}</span>` : ""}</li>`).join("")}
        ${REC.methods.mine.map((m) => `<li><label><input type="checkbox" name="method" value="${esc(m.id_ref)}" ${sh.methods.includes(m.id_ref) ? "checked" : ""}> <b>${esc(m.title)}</b></label> ${statusBadge("yours")} <span class="meta">${esc(m.citation)}</span></li>`).join("")}</ul>
        <a href="#reconcile/methods" class="meta">Add your own method</a>`;
    } else if (key === "status") {
      h += `<label><input type="radio" name="status" value="working" ${sh.status !== "proposal" ? "checked" : ""}> In progress</label>
        <label><input type="radio" name="status" value="proposal" ${sh.status === "proposal" ? "checked" : ""}> My proposal</label>`;
    } else {
      h += `<div class="step-cols"><textarea name="${key}" rows="${key === "interpretation" || key === "rendering" ? 8 : 4}" placeholder="Markdown: *italic*, **bold**, > quotation, [^1] footnotes">${esc(sh[key] || "")}</textarea>
        ${sheetAside(key) ? `<div class="step-aside">${sheetAside(key)}</div>` : ""}</div>`;
    }
    h += `</div></fieldset>`;
  });
  h += `<div class="sheet-actions"><button class="btn primary" type="submit">Save</button> <span class="meta" id="sheet-msg">${s.id ? `revision ${s.rev}, saved ${esc(s.updated_at)}` : "not saved yet"}</span>
    ${s.id ? `<button type="button" class="btn" id="sheet-copy">Copy as Markdown</button> <button type="button" class="btn" id="sheet-history">Earlier versions</button>
    ${s.deleted_at ? `<button type="button" class="btn" id="sheet-restore">Restore</button>` : `<button type="button" class="btn" id="sheet-delete">Delete</button>`}` : ""}
    ${s.tension_id ? `<a class="btn" href="#reconcile/compare/${esc(s.tension_id)}">Compare with the other readings</a>` : ""}</div>
    <div id="sheet-revs"></div></form></div>`;
  $("#main").innerHTML = h;
  REC.dirty = false;
}

function readSheetForm() {
  const f = $("#sheet-form");
  const fd = new FormData(f);
  const passages = [...f.querySelectorAll(".sheet-passages li")].map((li) => ({
    work: $("[name=p-work]", li).value, start_ref: $("[name=p-start]", li).value.trim(), end_ref: $("[name=p-end]", li).value.trim() || $("[name=p-start]", li).value.trim() }));
  const out = { title: fd.get("title"), tension_id: fd.get("tension_id") || null, passages, methods: fd.getAll("method"), status: fd.get("status") || "working" };
  for (const k of ["contradiction", "dictionary", "commentary", "interpretation", "rendering", "references"]) out[k] = fd.get(k) || "";
  return out;
}

async function saveSheet() {
  const data = readSheetForm();
  const s = REC.sheet;
  try {
    const saved = s.id ? await send("PUT", `mine/reconciliation/${s.id}`, { ...data, base_rev: s.rev }) : await send("POST", "sheets", data);
    REC.list = null;
    REC.dirty = false;
    if (!s.id) { history.replaceState(null, "", `#reconcile/sheet/${saved.id}`); }
    REC.sheet = saved;
    if (saved.tension_id !== (REC.one && REC.one.id)) REC.one = saved.tension_id ? await api(`reconcile/${encodeURIComponent(saved.tension_id)}`) : null;
    if (!REC.list) await loadList();
    await renderSheet();
    $("#sheet-msg").textContent = `Saved: revision ${saved.rev}.`;
  } catch (e) {
    $("#sheet-msg").textContent = e.status === 409 ? e.message + " Open the worksheet again to see the other version; your text is still here." : e.message;
  }
}

async function sheetHistory() {
  const r = await api(`mine/reconciliation/${REC.sheet.id}/history`);
  $("#sheet-revs").innerHTML = `<h3>Earlier versions</h3><ol class="revs">${r.revisions.map((v) => {
    let sh = {};
    try { sh = JSON.parse(v.body); } catch (e) { /* ignore */ }
    return `<li>revision ${v.rev} · ${esc(v.event)} · ${esc(v.saved_at)} · <b>${esc(v.label)}</b>
      <div class="meta">${esc((sh.interpretation || sh.rendering || "").slice(0, 200))}</div>
      ${v.rev !== r.item.rev ? `<button type="button" class="btn" data-sheet-rev="${v.rev}">Bring back this version</button>` : "<span class='meta'>current</span>"}</li>`;
  }).join("")}</ol>`;
}

async function sheetAction(path, data) {
  try {
    REC.sheet = await send("POST", `mine/reconciliation/${REC.sheet.id}/${path}`, { base_rev: REC.sheet.rev, ...data });
    REC.list = null;
    await loadList();
    await renderSheet();
  } catch (e) { $("#sheet-msg").textContent = e.message; }
}

function sheetMarkdown(s) {
  const titles = new Map(state.works.map((w) => [w.id, w.title]));
  const names = new Map([...REC.methods.library.map((m) => [m.id, m.name]), ...REC.methods.mine.map((m) => [m.id_ref, m.title])]);
  const sh = s.sheet;
  let out = `## ${s.title}\n\n${sh.status === "proposal" ? "My proposal" : "Work in progress"}, revision ${s.rev}\n\n`;
  if (sh.passages.length) out += "Passages: " + sh.passages.map((p) => `${titles.get(p.work) || p.work} ${p.start_ref}${p.end_ref !== p.start_ref ? "–" + p.end_ref : ""}`).join("; ") + "\n\n";
  if (sh.methods.length) out += "Methods: " + sh.methods.map((m) => names.get(m) || m).join(", ") + "\n\n";
  for (const [k, head] of SHEET_STEPS.filter(([k]) => typeof sh[k] === "string" && k !== "status" && sh[k].trim())) out += `**${head}**\n\n${sh[k].trim()}\n\n`;
  return out;
}

// ------------------------------------------------------------------ comparing readings

async function renderCompare(tid) {
  if (!REC.list) await loadList();
  const t = REC.one = await api(`reconcile/${encodeURIComponent(tid)}`);
  if (!REC.methods) REC.methods = await api("methods");
  const names = new Map([...REC.methods.library.map((m) => [m.id, m.name]), ...REC.methods.mine.map((m) => [m.id_ref, m.title])]);
  document.title = `Compare: ${t.title} · Platonic Workshop`;
  const cols = [
    ...t.readings.map((r) => ({ head: `${statusBadge(r.status)} ${esc(r.by)}`, methods: [r.method_id], text: editorial(r.summary), rendering: "", evidence: recEvs(r.evidence) })),
    ...t.sheets.map((s) => ({ head: `${statusBadge("yours")} <a href="#reconcile/sheet/${s.id}">${esc(s.title)}</a>${s.status === "proposal" ? " <span class='meta'>(your proposal)</span>" : ""}`,
      methods: s.sheet.methods, text: s.sheet.interpretation ? `<div class="md">${md(s.sheet.interpretation, "fn-c" + s.id)}</div>` : "<span class='meta'>no interpretation yet</span>",
      rendering: s.sheet.rendering ? `<div class="md">${md(s.sheet.rendering, "fn-cr" + s.id)}</div>` : "", evidence: "" })),
  ];
  let h = `<div class="search reconcile compare"><p class="meta"><a href="#reconcile">Reconciliations</a> · <a href="#reconcile/${esc(t.id)}">${esc(t.title)}</a></p>
    <h2>Compare the readings</h2><p class="question">${editorial(t.question)}</p>
    <p class="prov">Every reading of this tension side by side: those quoted from their holders (established), the Workshop's proposals, and your worksheets. They are set out to be weighed, not ranked.</p>
    <div class="compare-wrap"><table class="compare"><thead><tr><th></th>${cols.map((c) => `<th>${c.head}</th>`).join("")}</tr></thead><tbody>
    <tr><th>Method</th>${cols.map((c) => `<td>${c.methods.map((m) => esc(names.get(m) || m)).join(", ") || "<span class='meta'>none named</span>"}</td>`).join("")}</tr>
    <tr><th>Reading</th>${cols.map((c) => `<td>${c.text}</td>`).join("")}</tr>
    <tr><th>Translation</th>${cols.map((c) => `<td>${c.rendering || "<span class='meta'>—</span>"}</td>`).join("")}</tr>
    <tr><th>Rests on</th>${cols.map((c) => `<td>${c.evidence || "<span class='meta'>—</span>"}</td>`).join("")}</tr>
    </tbody></table></div>
    <p><a class="btn" href="#reconcile/new?tension=${esc(t.id)}">Add your own reading</a></p></div>`;
  $("#main").innerHTML = h;
}

// ------------------------------------------------------------------ in the reader: the tensions a section belongs to

function renderTensionRow(s) {
  const w = state.work;
  if (!w || !w.tensions || !w.tensions.length) return "";
  const seq = new Map(w.sections.map((r, i) => [r, i]));
  const at = seq.get(s.ref);
  const here = w.tensions.filter((x) => seq.get(x.start_ref) <= at && at <= seq.get(x.end_ref) && x.start_ref === s.ref);
  if (!here.length) return "";
  return `<div class="app-row app-tension"><div class="app-k" title="This section begins a passage of a recorded tension: Plato seems to say something else elsewhere">Tension</div><div class="app-v">${here.map((x) =>
    `<a href="#reconcile/${esc(x.id)}">${esc(x.title)}</a> <span class="meta">(passage ${esc(x.start_ref)}${x.end_ref !== x.start_ref ? "–" + esc(x.end_ref) : ""})</span>`).join("<br>")}</div></div>`;
}

// ------------------------------------------------------------------ events

document.addEventListener("click", async (ev) => {
  const t = ev.target;
  if (t.closest("#add-passage")) {
    const f = readSheetForm();
    REC.sheet.sheet = { ...REC.sheet.sheet, ...f, passages: [...f.passages, { work: WORK, start_ref: (state.data && state.data.sections[0].ref) || (workById(WORK) || {}).first_ref || "", end_ref: "" }] };
    REC.sheet.title = f.title;
    await renderSheet();
    REC.dirty = true;
    return;
  }
  const drop = t.closest("[data-drop-passage]");
  if (drop) {
    const f = readSheetForm();
    f.passages.splice(+drop.dataset.dropPassage, 1);
    REC.sheet.sheet = { ...REC.sheet.sheet, ...f };
    REC.sheet.title = f.title;
    await renderSheet();
    REC.dirty = true;
    return;
  }
  if (t.closest("#sheet-history")) { sheetHistory(); return; }
  if (t.closest("#sheet-delete")) { if (confirm("Delete this worksheet? It stays restorable, with every version.")) sheetAction("delete", {}); return; }
  if (t.closest("#sheet-restore")) { sheetAction("restore", {}); return; }
  const rv = t.closest("[data-sheet-rev]");
  if (rv) { sheetAction("restore", { rev: +rv.dataset.sheetRev }); return; }
  if (t.closest("#sheet-copy")) {
    navigator.clipboard?.writeText(sheetMarkdown(REC.sheet)).then(() => { $("#sheet-msg").textContent = "Copied as Markdown."; }).catch(() => {});
    return;
  }
  const lk = t.closest("[data-lookup]");
  if (lk && typeof showDictionaryDialog === "function") { showDictionaryDialog(lk.dataset.lookup); return; }
  const em = t.closest("[data-edit-method]");
  if (em) {
    const m = REC.methods.mine.find((x) => x.id === +em.dataset.editMethod);
    const f = $("#method-form");
    f.id.value = m.id; f.base_rev.value = m.rev; f.title.value = m.title; f.plain.value = m.plain; f.citation.value = m.citation;
    [...f.concepts.options].forEach((o) => { o.selected = m.concepts.includes(o.value); });
    $("#method-form-h").textContent = `Edit “${m.title}”`;
    f.scrollIntoView({ block: "center" });
    return;
  }
  const dm = t.closest("[data-del-method]");
  if (dm) {
    try { await send("POST", `mine/method/${dm.dataset.delMethod}/delete`, { base_rev: +dm.dataset.base }); } catch (e) { alert(e.message); }
    renderMethods(null);
  }
});

document.addEventListener("submit", (ev) => {
  if (ev.target.id === "sheet-form") { ev.preventDefault(); saveSheet(); }
  if (ev.target.id === "method-form") { ev.preventDefault(); saveMethod(ev.target); }
});
document.addEventListener("input", (ev) => { if (ev.target.closest("#sheet-form")) REC.dirty = true; });
window.addEventListener("beforeunload", (ev) => { if (state.view === "reconcile" && REC.dirty) { ev.preventDefault(); ev.returnValue = ""; } });
