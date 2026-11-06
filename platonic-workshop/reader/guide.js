// Milestone 13: the guide for a reader new to Plato. The order the dialogues are listed in
// (the Neoplatonic curriculum by default, or Albinus' or Thrasyllus'), Start here, Taylor's
// glossary of Platonic terms, and Taylor's prefatory texts read whole.
// Shares the globals of reader.js; shell.js routes #start, #glossary and #taylor/<id> here.
"use strict";

const GUIDE = { order: null, glossary: null, taylor: {} };
const ORDER_KEY = "order";

function orderPref() {
  const id = prefsGet(ORDER_KEY, "");
  const d = GUIDE.order;
  if (!d) return id || "iamblichus";
  return d.orders.some((o) => o.id === id) ? id : d.default;
}

async function loadOrder() {
  if (!GUIDE.order) {
    try { GUIDE.order = await api("reading-order"); } catch (e) { GUIDE.order = null; }
  }
  return GUIDE.order;
}

// The imported works in groups, in the chosen order: [{label, note, order, steps: [{work, role, n}]}].
function workGroups(orderId) {
  const d = GUIDE.order;
  // The dialogues only: the New Testament has its own shelf (nt.js).
  const works = state.works.filter((w) => w.imported && isPlato(w));
  const thrGroups = () => {
    const g = new Map();
    for (const w of works) {
      const k = w.tetralogy || 0;
      if (!g.has(k)) g.set(k, []);
      g.get(k).push({ work: w.id });
    }
    return [...g].map(([k, steps]) => ({ label: k ? "Tetralogy " + k : "Other", steps }));
  };
  if (!d) return thrGroups();
  const o = d.orders.find((x) => x.id === (orderId || orderPref())) || d.orders[0];
  if (o.tetralogies) return thrGroups();
  const seen = new Set();
  const out = [];
  let n = 0;
  for (const g of o.groups) {
    if (g.rest) {
      const steps = works.filter((w) => !seen.has(w.id)).map((w) => ({ work: w.id }));
      out.push({ label: g.label, note: g.note, evidence: g.evidence || [], rest: true, steps });
    } else {
      const steps = g.steps.filter((s) => workById(s.work)?.imported).map((s) => { seen.add(s.work); return { ...s, n: ++n }; });
      out.push({ label: g.label, steps });
    }
  }
  return out;
}

// The dialogue menu at the top left, in the chosen order (replaces reader.js's tetralogies).
function renderWorkSelect() {  // eslint-disable-line no-redeclare
  const sel = $("#work-select");
  const groups = workGroups();
  sel.innerHTML = groups.map((g) => `<optgroup label="${esc(g.label)}">${g.steps.map((s) =>
    `<option value="${s.work}">${s.n ? s.n + ". " : ""}${esc(workById(s.work).title)}</option>`).join("")}</optgroup>`).join("");
  sel.value = WORK;
  if (!sel.dataset.bound) {
    sel.dataset.bound = "1";
    sel.addEventListener("change", () => { go({ work: workById(sel.value), ref: null, page: null }); sel.blur(); });
  }
}

function orderPicker(id = "order-pick") {
  const d = GUIDE.order;
  if (!d) return "";
  const cur = orderPref();
  return `<label class="order-pick">List the dialogues in <select id="${id}" class="order-select">${d.orders.map((o) =>
    `<option value="${esc(o.id)}" ${o.id === cur ? "selected" : ""}>${esc(o.label)}${o.id === d.default ? " (the default)" : ""}</option>`).join("")}</select></label>`;
}

document.addEventListener("change", (ev) => {
  if (!ev.target.classList || !ev.target.classList.contains("order-select")) return;
  prefsSet(ORDER_KEY, ev.target.value);
  renderWorkSelect();
  route(false);
});

// One quotation: the words as printed, the Workshop's translation of Greek labelled as such,
// a modern scholar's words labelled as modern.
function guideQuote(e) {
  if (e.modern) {
    return `<blockquote class="gq modern"><span class="gq-tag" title="A modern scholar, not an ancient Platonist">Modern scholar</span> “${esc(e.quote)}”
      <cite><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.cited)}</a></cite></blockquote>`;
  }
  const doc = { "prolegomena-hermann": "Anonymous Prolegomena (Hermann's Greek)", "albinus-burges": "Albinus, Prologue (Burges' English, 1854)", "dl3-burges": "Diogenes Laertius III (Burges' English, 1854)" }[e.source] || e.source;
  const at = e.at ? `, p. ${esc(e.at)}` : "";
  const read = `<button type="button" class="link-btn" data-ancient="${esc(e.source)}" data-at="${esc(e.at || "")}">${esc(doc)}${at}</button>`;
  if (e.english) {
    return `<blockquote class="gq"><span lang="grc">${esc(e.quote)}</span><span class="gq-en">“${esc(e.english)}”
      <span class="gq-tag own" title="${esc(GUIDE.order?.workshop_translation || "")}">Workshop translation</span></span><cite>${read}</cite></blockquote>`;
  }
  return `<blockquote class="gq">“${esc(e.quote)}”<cite>${read}</cite></blockquote>`;
}

// ------------------------------------------------------------------ Start here

async function showStart() {
  state.view = "start";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Start here · Platonic Workshop";
  await loadOrder();
  const d = GUIDE.order;
  const o = d ? d.orders.find((x) => x.id === orderPref()) : null;
  $("#toc").innerHTML = `<h3>Start here</h3><ul class="books">
    <li><a href="#start-order" data-scroll="start-order"><span>Where to begin</span></a></li>
    <li><a href="#start-page" data-scroll="start-page"><span>Reading a page</span></a></li>
    <li><a href="#start-tools" data-scroll="start-tools"><span>What else is here</span></a></li>
    <li><a href="#start-guides" data-scroll="start-guides"><span>The ancient guides</span></a></li></ul>`;
  let h = `<div class="search guide"><h2>Start here</h2>
    <p class="lead">This is a place to read Plato with everything that has been said about him close at hand: the Greek, several English translations,
      the old commentaries, a dictionary for every word, and the ancient Platonists who read him as a guide to the divine. Nothing here is made up
      by a computer: every explanation is quoted from a book or a dictionary, and says which one.</p>
    <p>You do not need to know Greek. The English is beside the Greek on every page, and any Greek word can be tapped for its meaning.</p>

    <section id="start-order"><h3>Where to begin: the order the Platonists taught</h3>`;
  if (o && !o.tetralogies) {
    h += `<p>${esc(o.plain)}</p><p class="meta">${esc(o.by)}.</p>${orderPicker("start-order-pick")}
      <ol class="path">`;
    for (const g of workGroups(o.id)) {
      if (g.rest) continue;
      h += `<li class="path-group"><h4>${esc(g.label)}</h4><ol class="path-steps">${g.steps.map((s) => {
        const w = workById(s.work);
        const ev = (o.groups.flatMap((x) => x.steps || []).find((x) => x.work === s.work) || {}).evidence || [];
        return `<li value="${s.n}"><div class="path-head"><a href="#${esc(w.slug)}"><b>${esc(w.title)}</b></a> <span class="path-role">${esc(s.role || "")}</span>
          ${s.modern_placement ? `<span class="gq-tag modern" title="The ancient text has a gap here; a modern editor supplies this dialogue">placed by a modern editor</span>` : ""}
          <span class="meta"><a href="#${esc(w.slug)}">read it</a> · <a href="#${esc(w.slug)}/whole">what it is about</a></span></div>
          <details class="why-here"><summary>Why here? The ancient words</summary>${ev.map(guideQuote).join("")}</details></li>`;
      }).join("")}</ol></li>`;
    }
    h += `</ol><p class="meta">After these, the other dialogues. The ancient source does not order them, so the menu lists them in Thrasyllus' order.</p>
      <details class="why-here"><summary>Where this order comes from</summary>${o.frame.map(guideQuote).join("")}
      <p class="meta">${esc(d.workshop_translation)}</p></details>`;
  } else if (o) {
    h += `<p>${esc(o.plain)}</p>${orderPicker("start-order-pick")}`;
  }
  h += `</section>
    <section id="start-page"><h3>Reading a page</h3>
    <ul class="howto">
      <li><b>Open a dialogue</b> from the menu at the top left, or from the list above. It opens at its first page.</li>
      <li><b>Turn pages</b> with ‹ and › (or swipe on the iPad). The numbers and letters in the margin (<span class="ref-sample">514a</span>) are
        <em>Stephanus numbers</em>: the page and part of the page in the edition of 1578. Every book on Plato uses them, so a passage can be found in any edition.</li>
      <li><b>Greek on the left, English on the right.</b> Choose which translations to see above the text. Untick <em>Greek</em> at the top to read the English alone.</li>
      <li><b>Tap any Greek word</b> to see what it means, its dictionary form, and its grammar, in plain words.</li>
      <li><b>Under each section</b> are the commentators' notes on it, and the other places that refer to it. Untick <em>Commentary</em> or <em>Links</em> to hide them.</li>
      <li><b>Select words</b> (press and drag) to write your own translation or note. It is kept on this device; <a href="#mine">My Translations</a> gathers it all.</li>
      <li><b>Not sure what something is for?</b> Tap <b>? Help</b> at the top of any page, or a small <span class="help-q" aria-hidden="true">?</span> beside a panel, for two sentences on what it does.
        On the iPad, <b>☰ Contents</b> at the top left opens the pages of the dialogue.</li>
      <li><b>A name you do not know</b> (Burnet, Loeb, LSJ, GLAUx, OCR, ≈…) is explained in plain English in <a href="#words">Words used in the Workshop</a>.</li>
    </ul></section>
    <section id="start-tools"><h3>What else is here</h3>
    <dl class="tools">
      <dt><a href="#glossary">Glossary</a></dt><dd>Thomas Taylor's explanations of the Platonic words his translations use: Demiurgus, dianoia, hyparxis, the intelligible and the rest.</dd>
      <dt><a href="#words">Words used in the Workshop</a></dt><dd>The names of the books and tools on these pages (Stephanus, Burnet, LSJ, scholia…) in plain English, each with its source.</dd>
      <dt><a href="#library">Library</a></dt><dd>Every dialogue, each with a page on the dialogue as a whole, and the books about Plato: Taylor's Introduction, the ancient lives and introductions, the commentaries.</dd>
      <dt><a href="#concepts">Concepts</a></dt><dd>The great ideas (the Good, the soul, the Forms, intellect…) with Plato's passages on each and what the later Platonists made of them.</dd>
      <dt><a href="#dossiers">Famous passages</a></dt><dd>The cave, the divided line, the charioteer, the ladder of love and seventy more, each gathered whole with every translation and note.</dd>
      <dt><a href="#dictionary">Dictionary</a></dt><dd>Look up a Greek word in the two great dictionaries (Liddell and Scott).</dd>
      <dt><a href="#search">Concordance</a></dt><dd>Every place a Greek word is used in Plato.</dd>
      <dt><a href="#reconcile">Reconciliations</a></dt><dd>Places where Plato seems to say two things that cannot both be true, and how readers have reconciled them.</dd>
      <dt>The search box</dt><dd>At the top of every page: type English or Greek words, a passage (Rep. 509b) or a name.</dd>
    </dl></section>
    <section id="start-guides"><h3>The ancient guides to Plato</h3>
    <p>The Platonists themselves wrote introductions for beginners. These are in the Library, to read whole:</p>
    ${shelfList()}</section>
    </div>`;
  $("#main").innerHTML = h;
  window.scrollTo(0, 0);
}

// The Neoplatonist shelf: Taylor's prefatory texts and the ancient introductions.
function shelfList() {
  return `<ul class="shelf">
    <li><a href="#taylor/general-introduction"><b>Taylor's General Introduction</b></a> (1804) <span class="meta">Platonism as the later Platonists taught it; the place to start for the Neoplatonic reading. In modern English, the Workshop's own, with Taylor's words beside.</span></li>
    <li><a href="#glossary"><b>Taylor's Platonic terms</b></a> <span class="meta">The glossary, A to Z.</span></li>
    <li><a href="#taylor/olympiodorus-life"><b>Olympiodorus, Life of Plato</b></a> (6th century) <span class="meta">In modern English from the Greek, the Workshop's own, with Taylor's translation beside.</span></li>
    <li><button type="button" class="link-btn" data-ancient="albinus-burges" data-at=""><b>Albinus, Prologue to Plato</b></button> (2nd century, Burges' translation) <span class="meta">How to begin reading Plato.</span></li>
    <li><button type="button" class="link-btn" data-ancient="dl3-burges" data-at=""><b>Diogenes Laertius, Life of Plato</b></button> (Book III, Burges' translation)</li>
    <li><button type="button" class="link-btn" data-ancient="prolegomena-hermann" data-at=""><b>Anonymous Prolegomena to Platonic Philosophy</b></button> (6th century) <span class="meta">Greek only: no free English translation exists. The reading-order passage is translated on this page.</span></li>
  </ul>`;
}

// ------------------------------------------------------------------ Taylor's glossary

async function showGlossary(focus) {
  state.view = "glossary";
  setView("library-view");
  document.body.classList.add("guide-view");
  document.title = "Glossary · Platonic Workshop";
  $("#main").innerHTML = `<p class="loading">Opening Taylor's glossary…</p>`;
  if (!GUIDE.glossary) {
    try { GUIDE.glossary = await api("taylor/platonic-terms"); } catch (e) { $("#main").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  }
  const t = GUIDE.glossary;
  const g = t.glossary;
  const letters = [...new Set(g.map((e) => e.head[0].toUpperCase()))];
  const intro = t.segments.find((s) => s.part === "text" && s.kind === "paragraph");
  $("#toc").innerHTML = `<h3>Glossary</h3><p class="letters">${letters.map((l) => `<a href="#gl-${l}" data-scroll="gl-${l}">${l}</a>`).join(" ")}</p>
    <p class="meta">${g.length} entries. The books Taylor took them from are named under each.</p>
    <p class="meta">The Workshop's own words (Stephanus, LSJ, OCR…): <a href="#words">Words used in the Workshop</a>.</p>`;
  $("#main").innerHTML = glossaryHtml(t);
  if (focus) document.getElementById("gl-" + focus)?.scrollIntoView({ block: "start" });
  else window.scrollTo(0, 0);
}

// Taylor's glossary, as HTML: in place of the text (#glossary), or inside the side panel (terms.js).
function glossaryHtml(t) {
  const g = t.glossary;
  const letters = [...new Set(g.map((e) => e.head[0].toUpperCase()))];
  const intro = t.segments.find((s) => s.part === "text" && s.kind === "paragraph");
  let h = `<div class="search guide glossary"><h2>Glossary of Platonic terms</h2>
    <p class="lead">${esc(t.about)}</p>
    <p class="meta">Looking for a name the Workshop uses, such as Stephanus, Burnet or LSJ? See <a href="#words">Words used in the Workshop</a>.</p>
    <details><summary>Taylor's own preface to it</summary><p>${esc(intro ? intro.text : "")}</p></details>
    <p class="meta">From ${esc(t.edition)}, as compiled by <a href="${esc(t.source.url)}" target="_blank" rel="noopener">theosophylib.com</a>, which adds the entries
      Taylor gives in two later books. Taylor prints Greek without accents, as here; the English word at the head of each entry is his translation of it.</p>
    <p class="letters">${letters.map((l) => `<a href="#gl-${l}" data-scroll="gl-${l}">${l}</a>`).join(" ")}</p>
    <label class="gl-filter">Find a term <input type="search" id="gl-q" placeholder="soul, intellect, monad…" autocomplete="off"></label>
    <div id="gl-list">`;
  let last = "";
  for (const e of g) {
    const l = e.head[0].toUpperCase();
    if (l !== last) { h += `<h3 class="gl-letter" id="gl-${l}">${l}</h3>`; last = l; }
    h += `<div class="gl-entry" id="gl-${esc(e.id)}" data-text="${esc((e.text + " " + e.more.join(" ")).toLowerCase())}">
      <p>${e.text.startsWith(e.head) ? `<b class="gl-head">${esc(e.head)}</b>${esc(e.text.slice(e.head.length))}` : `<b class="gl-head">${esc(e.head)}</b> ${esc(e.text)}`}
      ${e.see ? `<a href="#" data-gl-see="${esc(e.see)}">see ${esc(e.see)}</a>` : ""}</p>
      ${e.more.map((m) => `<blockquote>${esc(m)}</blockquote>`).join("")}
      ${e.source || e.more_source ? `<p class="meta">Taylor, ${esc(e.source_title || srcTitle(e.source || e.more_source, t))}</p>` : ""}</div>`;
  }
  return h + `</div></div>`;
}

function srcTitle(key, t) {
  const g = t.glossary.find((e) => e.source === key && e.source_title);
  return g ? g.source_title : key;
}

document.addEventListener("input", (ev) => {
  if (ev.target.id !== "gl-q") return;
  const q = ev.target.value.trim().toLowerCase();
  document.querySelectorAll(".gl-entry").forEach((el) => { el.hidden = q && !el.dataset.text.includes(q); });
  document.querySelectorAll(".gl-letter").forEach((el) => { el.hidden = !!q; });
});
document.addEventListener("click", (ev) => {
  const s = ev.target.closest("[data-gl-see]");
  if (!s) return;
  ev.preventDefault();
  const e = (GUIDE.glossary?.glossary || []).find((x) => x.head === s.dataset.glSee);
  if (e) document.getElementById("gl-" + e.id)?.scrollIntoView({ block: "start" });
});

// ------------------------------------------------------------------ Taylor's prefatory texts, read whole

async function showTaylorText(id) {
  state.view = "taylor";
  setView("library-view");
  document.body.classList.add("guide-view");
  if (id === "platonic-terms") { location.replace("#glossary"); return; }
  $("#main").innerHTML = `<p class="loading">Opening…</p>`;
  let t = GUIDE.taylor[id];
  if (!t) {
    try { t = GUIDE.taylor[id] = await api(`taylor/${encodeURIComponent(id)}`); } catch (e) { $("#main").innerHTML = `<p class="error">Not found: ${esc(id)}</p>`; return; }
  }
  // Milestone 24: a text with the Workshop's modern English opens in it, Taylor's words beside (modern.js).
  if (t.modern && typeof showModernText === "function") { showModernText(id, t); return; }
  document.title = `${t.title} · Platonic Workshop`;
  const notes = new Map(t.notes.map((n) => [n.id, n]));
  const segs = t.segments.filter((s) => s.part !== "site");
  // A contents list by the 1804 pages, every tenth paragraph or so, for a long text.
  const pages = [];
  for (const s of segs) if (s.page_1804 && !pages.some((p) => p.page === s.page_1804)) pages.push({ page: s.page_1804, id: s.id });
  $("#toc").innerHTML = `<p><a href="#library">‹ Library</a></p><h3>${esc(t.title)}</h3>
    <p class="meta">${segs.length} paragraphs${t.notes.length ? `, ${t.notes.length} notes` : ""}.</p>
    ${pages.length ? `<p class="meta">Pages of 1804:</p><p class="letters">${pages.map((p) => `<a href="#tp-${esc(p.id)}" data-scroll="tp-${esc(p.id)}">${esc(p.page)}</a>`).join(" ")}</p>` : ""}`;
  let h = `<div class="search guide taylor-text"><h2>${esc(t.title)}</h2>
    <p class="lead">${esc(t.about)}</p>
    <p class="meta">${esc(t.author)}${t.translator ? `, translated by ${esc(t.translator)}` : ""}. ${esc(t.edition)}. Text from <a href="${esc(t.source.url)}" target="_blank" rel="noopener">theosophylib.com</a>.
      Taylor prints Greek without accents; where he quotes Greek he gives his English beside it or just before. Untranslated Greek in the notes is marked.</p>`;
  for (const s of segs) {
    const tag = s.kind === "quotation" ? "blockquote" : s.kind === "table" ? "pre" : "p";
    const body = s.kind === "table" ? esc(s.text) : withNoteMarks(s, notes);
    h += `<${tag} class="tt-${esc(s.kind)}" id="tp-${esc(s.id)}">${s.page_1804 && pages.some((p) => p.id === s.id) ? `<span class="page-1804" title="Page of the 1804 edition">p. ${esc(s.page_1804)}</span> ` : ""}${body}</${tag}>`;
    const ns = (s.notes || []).map((x) => notes.get(x.note)).filter(Boolean);
    if (ns.length) {
      h += `<div class="tt-notes">${ns.map((n) => `<p class="tt-note" id="tn-${esc(n.id)}"><b>${esc(n.printed_number || "")}</b> ${esc(n.text)}
        ${greekOnly(n.text) ? `<span class="gq-tag" title="This note is in Greek. Taylor often gives his English of it in the paragraph above; an English version of every Greek note is planned (milestone 15)">Greek only</span>` : ""}</p>`).join("")}</div>`;
    }
  }
  $("#main").innerHTML = h + `</div>`;
  window.scrollTo(0, 0);
}

// The note numbers placed in a paragraph, as superscripts.
function withNoteMarks(s, notes) {
  const marks = (s.notes || []).filter((x) => notes.has(x.note)).sort((a, b) => b.at - a.at);
  let text = s.text;
  const parts = [];
  for (const m of marks) {
    parts.unshift(`<sup class="tt-ref"><a href="#tn-${esc(m.note)}" data-scroll="tn-${esc(m.note)}">${esc(notes.get(m.note).printed_number || "*")}</a></sup>` + esc(text.slice(m.at)));
    text = text.slice(0, m.at);
  }
  return esc(text) + parts.join("");
}

// Mostly Greek letters, with little English: a quotation left untranslated.
function greekOnly(s) {
  const g = (s.match(/[Ͱ-Ͽἀ-῿]/g) || []).length;
  const l = (s.match(/[A-Za-z]/g) || []).length;
  return g > 40 && g > l;
}
