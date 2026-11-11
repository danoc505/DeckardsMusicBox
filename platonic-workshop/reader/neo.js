// Platonic Workshop: the rest of the Neoplatonists (milestone 25), read whole with contents.
// Plotinus, Proclus, Iamblichus, Damascius, Hermias and Olympiodorus, each in a named public-domain
// Greek edition with its licence quoted. Two kinds of text:
//   - corrected source texts (First1KGreek's TEI): read by their own divisions, with the
//     editor's notes and marginal numbers;
//   - scans of the Internet Archive: each page's OCR shown as received, the Latin pages of the
//     editions folded, the page image a click away, and the Workshop's corrections kept apart,
//     listed beside the page and applied only in a reading the reader chooses.
// Every Greek word can be tapped for its meaning (gloss.js). Loaded after guide.js; shares its globals.
"use strict";

const NEO = { data: null, asked: null, parts: new Map(), mode: "shown" };

function loadNeo() {
  if (!NEO.asked) NEO.asked = api("neo").then((d) => { NEO.data = d; return d; }).catch(() => { NEO.asked = null; return null; });
  return NEO.asked;
}

const neoTexts = () => (NEO.data && NEO.data.texts) || [];
const neoText = (id) => neoTexts().find((t) => t.id === id);
const neoOn = () => neoTexts().length > 0;

function neoGroups() {
  const out = [];
  for (const t of neoTexts()) {
    let last = out[out.length - 1];
    if (!last || last.label !== t.grp) out.push(last = { label: t.grp, texts: [] });
    last.texts.push(t);
  }
  return out;
}

const neoKind = (t) => t.kind === "ocr"
  ? `<span class="neo-kind ocr" title="The OCR of a scanned page, not proofread: shown as the Internet Archive gives it, with the Workshop's corrections kept apart">OCR, as received</span>`
  : `<span class="neo-kind tei" title="A corrected digital text of the edition, from First1KGreek">corrected text</span>`;

function neoEdition(t) {
  return `${esc(t.edition)}`;
}

// The licence as the source states it, quoted, with where the files came from.
function neoSources(t) {
  return (t.sources || []).map((s) => `<li><a href="${esc(s.repo || "")}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.commit_sha ? ` <span class="meta">at commit ${esc(s.commit_sha.slice(0, 10))}</span>` : ""}.
    <span class="meta">Licence:</span> <q>${esc(s.licence || "")}</q></li>`).join("");
}

// ------------------------------------------------------------------ the Library's shelf

function neoNotHere() {
  const nh = (NEO.data && NEO.data.stats && NEO.data.stats.not_here) || [];
  if (!nh.length) return "";
  return `<details class="neo-not-here"><summary>Not here yet, and why</summary><ul>${nh.map(([what, why]) =>
    `<li><b>${esc(what)}</b>: ${esc(why)}.</li>`).join("")}</ul></details>`;
}

function neoShelf() {
  if (!neoOn()) return "";
  const s = NEO.data.stats;
  return `<section id="lib-neo"><h3>The Neoplatonists</h3>
    <p class="meta">The rest of the Platonists' own writings, read whole: Plotinus, and the commentaries of the later school on the dialogues.
      Each is in a named public-domain Greek edition, with its licence quoted. Some are corrected digital texts; the others are the scans' OCR,
      shown as received and not proofread: the Workshop's corrections are kept apart, and each page links to its image.
      ${s ? `${s.words.toLocaleString()} Greek words in ${neoTexts().length} texts.` : ""}</p>
    <div class="lib-grid">${neoGroups().map((g) => `<section><h4>${esc(g.label)}</h4><ul>${g.texts.map((t) =>
      `<li><a href="#neo/${esc(t.id)}"><b>${esc(t.title)}</b></a> <span class="meta">${esc(t.editor)}, ${esc(String(t.year))}</span> ${neoKind(t)}</li>`).join("")}</ul></section>`).join("")}</div>
    ${neoNotHere()}</section>`;
}

// ------------------------------------------------------------------ a text's contents

async function showNeo(raw) {
  const [id, part, unitN] = raw.split("/");
  state.view = "neo";
  setView("library-view");
  document.body.classList.add("guide-view");
  $("#main").innerHTML = `<p class="loading">Opening…</p>`;
  await loadNeo();
  if (!NEO.prefRead) { NEO.prefRead = true; NEO.mode = prefsGet("neoMode", "shown"); }
  const t = neoText(decodeURIComponent(id || ""));
  if (!t) { $("#main").innerHTML = `<p class="error">Not found: ${esc(id || "")}. <a href="#library">The Library</a></p>`; return; }
  if (part !== undefined && /^\d+$/.test(part)) return showNeoPart(t, parseInt(part, 10), unitN === undefined ? null : decodeURIComponent(unitN));
  document.title = `${t.title} · Platonic Workshop`;
  $("#toc").innerHTML = neoToc(t, null);
  const unit = t.kind === "ocr" ? "pages" : t.unit_name === "page" ? "pages of the edition" : "sections";
  let h = `<div class="search guide neo-text"><p class="meta">${esc(t.author)}</p><h2>${esc(t.title)}</h2>
    <p class="neo-greek" lang="grc">${esc(t.greek)}</p>
    <p class="lead">${esc(t.about)}</p>
    <p class="meta">${neoKind(t)} ${esc(t.edition)}. ${t.n_units.toLocaleString()} ${unit}, ${t.words.toLocaleString()} Greek words${t.latin_units ? `; ${t.latin_units} pages in Latin (the editor's preface, translation or notes), folded when read` : ""}.
      Cited as ${esc(t.cite)}.</p>
    <h3>Source and licence</h3><ul class="neo-sources">${neoSources(t)}</ul>
    ${t.kind === "ocr" ? `<p class="meta">The text is the OCR as the Internet Archive gives it. Lines that are only specks of the scan are hidden from the page and shown in <em>the OCR as received</em>.
      ${t.corrections ? `The Workshop's ${t.corrections} correction${t.corrections === 1 ? "" : "s"} of common misreadings are kept apart, listed with each part, and applied only when you choose <em>with corrections</em>.` : ""}
      Page numbers are the edition's, read from its running heads; where a head could not be read the number is counted from the pages around it, and marked so.</p>` : ""}
    <h3>Contents</h3><ol class="neo-contents">${t.parts.map((p) => `<li><a href="#neo/${esc(t.id)}/${p.seq}">${esc(p.label)}</a> <span class="meta">${p.words.toLocaleString()} words</span></li>`).join("")}</ol></div>`;
  $("#main").innerHTML = h;
  window.scrollTo(0, 0);
}

function neoToc(t, cur) {
  return `<p><a href="#library">‹ Library</a></p><h3><a href="#neo/${esc(t.id)}">${esc(t.title)}</a></h3>
    <p class="meta">${esc(t.editor)}, ${esc(String(t.year))}</p>
    <ul class="books neo-toc">${t.parts.map((p) => `<li${p.seq === cur ? ' class="on"' : ""}><a href="#neo/${esc(t.id)}/${p.seq}"${p.seq === cur ? ' aria-current="page"' : ""}><span>${esc(p.label)}</span></a></li>`).join("")}</ul>`;
}

// ------------------------------------------------------------------ reading a part

async function showNeoPart(t, seq, unit) {
  const key = `${t.id}/${seq}`;
  let d = NEO.parts.get(key);
  if (!d) {
    try { d = await api(`neo/${encodeURIComponent(t.id)}/${seq}`); } catch (e) { $("#main").innerHTML = `<p class="error">Not found: ${esc(key)}</p>`; return; }
    NEO.parts.set(key, d);
  }
  document.title = `${d.part.label} · ${t.title} · Platonic Workshop`;
  $("#toc").innerHTML = neoToc(t, seq);
  $("#toc").querySelector(".on")?.scrollIntoView({ block: "center" });
  renderNeoPart(t, d);
  const el = unit ? document.getElementById(`neo-${unit}`) : null;
  if (el) { if (el.tagName === "DETAILS") el.open = true; el.scrollIntoView({ block: "start" }); el.classList.add("neo-here"); } else window.scrollTo(0, 0);
}

// Milestone 26: where Taylor translated this unit, a link to his English.
function neoTaylorLinks(u) {
  if (!u.taylor || !u.taylor.length) return "";
  return `<p class="tg-back meta">Taylor's English: ${u.taylor.map((c) => `<a href="#neo-en/${esc(c.work)}/${c.part}/${c.seq}">${esc(c.label)}</a>`).join(", ")}</p>`;
}

// The corrections that apply to this part: those for the whole text, and those for one of its pages.
function neoCorrectionsHere(d) {
  const ns = new Set(d.units.map((u) => u.n));
  return d.corrections.filter((c) => !c.unit_n || ns.has(c.unit_n));
}

function neoUnitText(u, mode) {
  if (mode === "received" && u.raw != null) return u.raw;
  if (mode === "corrected" && u.corrected) return u.corrected;
  return u.text;
}

function renderNeoPart(t, d) {
  const ocr = t.kind === "ocr";
  const mode = ocr ? NEO.mode : "shown";
  const corr = neoCorrectionsHere(d);
  const nav = `<p class="neo-nav">${d.prev ? `<a class="btn" href="#neo/${esc(t.id)}/${d.prev.seq}">‹ ${esc(d.prev.label)}</a>` : ""}
    <a class="btn" href="#neo/${esc(t.id)}">Contents</a>
    ${d.next ? `<a class="btn" href="#neo/${esc(t.id)}/${d.next.seq}">${esc(d.next.label)} ›</a>` : ""}</p>`;
  let h = `<div class="search guide neo-text neo-read"><p class="meta"><a href="#neo/${esc(t.id)}">${esc(t.author)}, ${esc(t.title)}</a></p>
    <h2>${esc(d.part.label)}</h2>
    <p class="meta">${neoKind(t)} ${esc(t.edition)}.</p>`;
  if (ocr) {
    const opts = [["shown", "As shown", "The OCR with the lines that are only specks of the scan hidden"],
      ["received", "The OCR as received", "Every line exactly as the Internet Archive's OCR gives it"],
      ["corrected", "With corrections", "The OCR with the Workshop's corrections applied, marked"]];
    h += `<div class="neo-modes" role="radiogroup" aria-label="Which text">${opts.map(([k, l, ti]) =>
      `<button type="button" class="chip${mode === k ? " on" : ""}" role="radio" aria-checked="${mode === k}" data-neo-mode="${k}" title="${esc(ti)}">${esc(l)}</button>`).join(" ")}</div>`;
  }
  h += nav;
  for (const u of d.units) {
    const text = neoUnitText(u, mode);
    const body = mode === "corrected" && u.corrected ? neoMarkCorrections(u.text, u.corrected) : esc(text);
    if (ocr) {
      const how = u.page_how === "counted" ? ` <span class="meta" title="This page's running head could not be read; its number is counted from the pages around it">(counted)</span>` : "";
      const head = `<div class="neo-page-head"><span class="neo-page-n">${esc(u.label)}</span>${how}
        ${u.scan ? `<a class="meta" href="${esc(u.scan)}" target="_blank" rel="noopener">See the scan</a>` : ""}
        ${u.hidden && mode === "shown" ? `<span class="meta" title="Lines of specks hidden; see the OCR as received">${u.hidden} speck line${u.hidden === 1 ? "" : "s"} hidden</span>` : ""}</div>`;
      if (u.lang === "lat") {
        h += `<details class="neo-page neo-latin" id="neo-${esc(u.n)}"><summary>${esc(u.label)}: a page in Latin <span class="meta">(the editor's preface, translation or notes)</span></summary>${head}<div class="neo-ocr">${body}</div></details>`;
      } else {
        h += `<section class="neo-page" id="neo-${esc(u.n)}">${head}${neoTaylorLinks(u)}<div class="neo-ocr" lang="grc">${body}</div></section>`;
      }
    } else {
      h += `<section class="neo-unit" id="neo-${esc(u.n)}"><h4 class="neo-unit-n">${esc(u.label)}</h4>${neoTaylorLinks(u)}
        ${u.margin.length ? `<p class="neo-margin meta" title="In the margin of the edition">${u.margin.map(esc).join(" · ")}</p>` : ""}
        <div class="neo-tei" lang="grc">${body}</div>
        ${u.notes.length ? `<ol class="neo-notes meta">${u.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ol>` : ""}</section>`;
    }
  }
  if (corr.length) {
    h += `<section class="neo-corrections"><h3>The Workshop's corrections</h3>
      <p class="meta">Kept apart from the OCR, which is shown as received. Each replaces a whole word wherever it is printed so${mode === "corrected" ? "; the replaced words are marked above" : ". Choose <em>With corrections</em> to read with them"}.</p>
      <table class="counts"><thead><tr><th>The OCR prints</th><th>Read</th><th>Why</th><th>In the whole text</th></tr></thead><tbody>${corr.map((c) =>
        `<tr><td lang="grc">${esc(c.ocr)}</td><td lang="grc">${esc(c.read)}</td><td>${esc(c.why)}${c.unit_n ? ` <span class="meta">(this page only)</span>` : ""}</td><td>${c.applied.toLocaleString()}×</td></tr>`).join("")}</tbody></table></section>`;
  }
  h += nav + `<ul class="neo-sources meta">${neoSources(t)}</ul>`;
  $("#main").innerHTML = h + `</div>`;
}

// The corrected text, with each replaced word marked and the OCR's word in its title.
function neoMarkCorrections(ocr, corrected) {
  const a = ocr.split(/(\s+)/), b = corrected.split(/(\s+)/);
  if (a.length !== b.length) return esc(corrected);
  return b.map((w, i) => w === a[i] ? esc(w) : `<ins class="neo-corr" title="The OCR prints ${esc(a[i])}">${esc(w)}</ins>`).join("");
}

document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-neo-mode]");
  if (!b) return;
  NEO.mode = b.dataset.neoMode;
  prefsSet("neoMode", NEO.mode);
  const m = location.hash.match(/^#neo\/([^/]+)\/(\d+)$/);
  const t = m && neoText(decodeURIComponent(m[1]));
  const d = m && NEO.parts.get(`${t && t.id}/${m[2]}`);
  if (t && d) { const y = window.scrollY; renderNeoPart(t, d); window.scrollTo(0, y); }
});

// ------------------------------------------------------------------ milestone 26: Taylor's English beside the Greek
// Taylor translated three of these texts: fifteen treatises of Plotinus, Iamblichus On the Mysteries, and Proclus'
// Elements of Theology. Each of his chapters (a proposition, in the Elements) is matched to the Greek above, and the
// Greek is one tap from the English (the "Greek" button under a chapter), its words tappable as everywhere. Every match
// says how it was made: by Taylor's chapter number (Plotinus, Iamblichus); by Creuzer's printed number, or by machine
// and checked by Taylor's terms (the Elements); or not placed, with the stretch of the Greek it lies in.

const TG = { data: null, asked: null, parts: new Map(), all: false };

function loadTaylorGreek() {
  if (!TG.asked) TG.asked = api("taylor-greek").then((d) => { TG.data = d; return d; }).catch(() => { TG.asked = null; return null; });
  return TG.asked;
}

const tgWorks = () => (TG.data && TG.data.works) || [];
const tgWork = (id) => tgWorks().find((w) => w.id === id);

// The Library's list, under the Neoplatonists' shelf.
function taylorGreekShelf() {
  if (!tgWorks().length) return "";
  return `<section id="lib-taylor-greek"><h4>Taylor's English beside the Greek</h4>
    <p class="meta">Thomas Taylor translated three of these texts. Read his English chapter by chapter, with the Greek of the edition above one tap away (and back from the Greek).
      Taylor's English is the OCR of his printed books (the Elements, Project Gutenberg's transcription), not proofread.</p>
    <ul>${tgWorks().map((w) => `<li><a href="#neo-en/${esc(w.id)}"><b>${esc(w.author)}, ${esc(w.title)}</b></a>
      <span class="meta">Taylor, ${esc(String(w.year))}; ${w.n_chapters.toLocaleString()} ${esc(w.unit_name)}s, ${w.n_matched.toLocaleString()} with the Greek</span>
      ${w.modern ? `<br><span class="meta">In modern English from the Greek, the Workshop's own:</span> ${w.modern.treatises.filter((t) => t.seq !== null).map((t) =>
        `<a href="#neo-en/${esc(w.id)}/${t.seq}">${esc(t.id)} ${esc(t.title)}</a>`).join(", ")}` : ""}</li>`).join("")}</ul></section>`;
}

const _neoShelf = neoShelf;
neoShelf = function () {  // eslint-disable-line no-global-assign
  const h = _neoShelf();
  return h ? h.replace(/<\/section>$/, `${taylorGreekShelf()}</section>`) : h;
};
const _loadNeo = loadNeo;
loadNeo = function () {  // eslint-disable-line no-global-assign
  return Promise.all([_loadNeo(), loadTaylorGreek()]).then(([d]) => d);
};

// How a chapter was matched, as a small label.
function tgHow(c) {
  const t = {
    "chapter number": ["by number", "Taylor's chapter number is the Greek edition's"],
    "found": ["number found", "Creuzer prints this proposition's number and title here"],
    "machine-matched": ["machine-matched", "Placed by machine, by length, and checked: Taylor's terms have their Greek in its first lines"],
    "not placed": ["not placed", "Its start could not be found in the OCR with confidence"],
    "no Greek": ["no Greek", "The Greek file has no chapter of this number"],
  }[c.match_how] || [c.match_how, ""];
  return `<span class="tg-how tg-${esc(c.match_how.replace(/\s+/g, "-"))}" title="${esc(t[1])}">${esc(t[0])}</span>`;
}

async function showTaylorGreek(raw) {
  const [id, part, ch] = raw.split("/");
  state.view = "neo";
  setView("library-view");
  document.body.classList.add("guide-view");
  $("#main").innerHTML = `<p class="loading">Opening…</p>`;
  await loadNeo();
  if (!TG.prefRead) { TG.prefRead = true; TG.all = prefsGet("tgAll", "") === "1"; }
  const w = tgWork(decodeURIComponent(id || ""));
  if (!w) { $("#main").innerHTML = `<p class="error">Not found: ${esc(id || "")}. <a href="#library">The Library</a></p>`; return; }
  if (part !== undefined && /^\d+$/.test(part)) return showTaylorGreekPart(w, parseInt(part, 10), ch !== undefined && /^\d+$/.test(ch) ? parseInt(ch, 10) : null);
  document.title = `Taylor's ${w.title} · Platonic Workshop`;
  $("#toc").innerHTML = tgToc(w, null);
  const st = ((TG.data.stats || {}).works || []).find((x) => x.id === w.id) || {};
  const how = Object.entries(st.how || {}).map(([k, v]) => `${v.toLocaleString()} ${esc(k)}`).join(", ");
  const g = w.greek || {};
  $("#main").innerHTML = `<div class="search guide neo-text"><p class="meta">${esc(w.author)}, in Taylor's English</p><h2>${esc(w.title)}</h2>
    <p class="lead">${esc(w.about)}</p>
    <p class="meta">${esc(w.edition)}: ${esc(w.text_how)}. ${w.n_chapters.toLocaleString()} ${esc(w.unit_name)}s, ${w.words.toLocaleString()} words.
      The Greek: <a href="#neo/${esc(g.id || "")}">${esc(g.title || "")}</a>, ${esc(g.edition || "")}.</p>
    <h3>How each ${esc(w.unit_name)} is matched to the Greek</h3>
    <p>${w.id === "taylor-elements"
      ? `Creuzer's Greek is the OCR of a scan, and most propositions are not numbered in it. A proposition's start is <em>found</em> where Creuzer prints its number and title
         (in the Greek, or in his Latin on the facing page); otherwise it is <em>machine-matched</em>: placed by its length against Taylor's, and kept only where the Greek of
         most of the terms of Taylor's statement (<em>soul</em> ψυχή, <em>intellect</em> νοῦς, <em>participates</em> μετέχει ...) is in its first lines. The rest are
         <em>not placed</em>: for those the reader shows the pages between the placed propositions before and after.`
      : `Taylor numbers his chapters as the Greek editions do, so his chapter n is the Greek chapter n. The numbers are read from the OCR in order;
         where the OCR garbled a number it is read from its place, and where it lost one the passage holds two chapters and says so.
         The check: chapter by chapter, Taylor's English is about the same multiple of the Greek.`} ${how ? `<span class="meta">Here: ${how}.</span>` : ""}
</p>
    <h3>Contents</h3><ol class="neo-contents">${w.parts.map((p) => `<li><a href="#neo-en/${esc(w.id)}/${p.seq}">${esc(p.label)}</a>
      ${p.greek_label ? `<span class="meta" lang="grc">${esc(p.greek_label)}</span>` : ""}</li>`).join("")}</ol>
    <h3>Source and licence</h3><ul class="neo-sources">${w.source ? `<li>${esc(w.source.title)}. <span class="meta">Licence:</span> <q>${esc(w.source.licence || "")}</q></li>` : ""}</ul></div>`;
  window.scrollTo(0, 0);
}

function tgToc(w, cur) {
  return `<p><a href="#library">‹ Library</a></p><h3><a href="#neo-en/${esc(w.id)}">${esc(w.title)}</a></h3>
    <p class="meta">${esc(w.author)}, tr. Taylor, ${esc(String(w.year))}</p>
    <ul class="books neo-toc">${w.parts.map((p) => `<li${p.seq === cur ? ' class="on"' : ""}><a href="#neo-en/${esc(w.id)}/${p.seq}"${p.seq === cur ? ' aria-current="page"' : ""}><span>${esc(p.label)}</span></a></li>`).join("")}</ul>`;
}

async function showTaylorGreekPart(w, seq, chapter) {
  const key = `${w.id}/${seq}`;
  let d = TG.parts.get(key);
  if (!d) {
    try { d = await api(`taylor-greek/${encodeURIComponent(w.id)}/${seq}`); } catch (e) { $("#main").innerHTML = `<p class="error">Not found: ${esc(key)}</p>`; return; }
    TG.parts.set(key, d);
  }
  document.title = `${d.part.label} · Taylor's ${w.title} · Platonic Workshop`;
  $("#toc").innerHTML = tgToc(w, seq);
  $("#toc").querySelector(".on")?.scrollIntoView({ block: "center" });
  renderTaylorGreekPart(w, d, chapter);
  if (chapter !== null) {
    const el = document.getElementById(`tg-${chapter}`);
    if (el) { el.querySelector(".tg-greek")?.removeAttribute("hidden"); el.querySelector("[data-tg-greek]")?.setAttribute("aria-expanded", "true"); el.scrollIntoView({ block: "start" }); return; }
  }
  window.scrollTo(0, 0);
}

function tgGreekBlock(w, d, c) {
  const g = c.greek;
  const gid = d.greek_text.id;
  if (!g) return `<p class="meta">${esc(c.match_note || "No Greek is matched to this chapter.")}</p>`;
  if (g.units) {
    return g.units.map((u) => `<div class="tg-gunit"><p class="neo-unit-n"><a href="#neo/${esc(gid)}/${u.part}/${esc(u.n)}" title="Read it in the Greek text">${esc(u.label)}</a></p>
      <div class="neo-tei" lang="grc">${esc(u.text)}</div>
      ${u.notes.length ? `<details class="meta"><summary>The editor's notes</summary><ol class="neo-notes">${u.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ol></details>` : ""}</div>`).join("");
  }
  const pages = `<p class="meta">On the scan's ${g.pages.length === 1 ? "page" : "pages"}: ${g.pages.map((p) => `<a href="#neo/${esc(gid)}/${p.part}/${esc(p.n)}">${esc(p.label)}</a>`).join(", ")}.</p>`;
  if (!g.placed) return `<p class="meta">This proposition's start could not be found in the OCR with confidence: ${esc(c.match_note || "")}. Its Greek is on these pages.</p>${pages}`;
  return `<div class="neo-ocr" lang="grc">${esc(g.text || "")}</div>${pages}`;
}

function renderTaylorGreekPart(w, d, chapter) {
  const nav = `<p class="neo-nav">${d.prev ? `<a class="btn" href="#neo-en/${esc(w.id)}/${d.prev.seq}">‹ ${esc(d.prev.label)}</a>` : ""}
    <a class="btn" href="#neo-en/${esc(w.id)}">Contents</a>
    ${d.next ? `<a class="btn" href="#neo-en/${esc(w.id)}/${d.next.seq}">${esc(d.next.label)} ›</a>` : ""}</p>`;
  const ev = d.part.evidence || {};
  let h = `<div class="search guide neo-text neo-read tg-read"><p class="meta"><a href="#neo-en/${esc(w.id)}">${esc(w.author)}, ${esc(w.title)}</a>, in Taylor's English</p>
    <h2>${esc(d.part.label)}</h2>
    ${d.part.greek_label ? `<p class="neo-greek" lang="grc">${esc(d.part.greek_label)}</p>` : ""}
    <p class="meta">${esc(w.edition)}: ${esc(w.text_how)}. The Greek: <a href="#neo/${esc(d.greek_text.id)}">${esc(d.greek_text.edition)}</a>.</p>`;
  if (ev.listed) {
    h += `<details class="meta tg-evidence"><summary>Which treatise of the Enneads this is, and how we know</summary>
      <p>Taylor's heading: <q>${esc(ev.heading)}</q>. His list of Plotinus' books (in his Introduction, after Porphyry): <q>${esc(ev.listed)}</q>.
      The Greek heading in Volkmann: <q lang="grc">${esc(ev.greek_heading || "")}</q>.${ev.note ? ` ${esc(ev.note[0].toUpperCase() + ev.note.slice(1))}.` : ""}</p></details>`;
  }
  h += `<div class="neo-modes"><button type="button" class="chip${TG.all ? " on" : ""}" data-tg-all="1" aria-pressed="${TG.all}" title="Show the Greek under every chapter">All the Greek</button></div>`;
  h += nav;
  for (const c of d.chapters) {
    const open = TG.all || c.seq === chapter;
    h += `<section class="tg-ch" id="tg-${c.seq}"><h4 class="neo-unit-n">${esc(c.label)} ${tgHow(c)}${c.page ? ` <span class="meta">Taylor p. ${c.page}</span>` : ""}</h4>
      ${c.paras.map((p) => `<p>${esc(p)}</p>`).join("")}
      ${c.match_note && c.match_how !== "not placed" ? `<p class="meta tg-note">${esc(c.match_note[0].toUpperCase() + c.match_note.slice(1))}.</p>` : ""}
      <p><button type="button" class="btn tg-btn" data-tg-greek="${c.seq}" aria-expanded="${open}">Greek</button></p>
      <div class="tg-greek"${open ? "" : " hidden"}>${tgGreekBlock(w, d, c)}</div>
      ${c.notes.length ? `<details class="meta"><summary>Taylor's notes (${c.notes.length})</summary><ol class="neo-notes">${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ol>
        ${c.checks.length ? `<p>The Greek he quotes, looked for in the Greek matched: ${c.checks.map((q) => `<span lang="grc">${esc(q.quote.slice(0, 60))}</span> <b>${q.found === "here" ? "found here" : q.found ? "found at " + esc(q.found) : "not found"}</b>`).join("; ")}.</p>` : ""}</details>` : ""}
    </section>`;
  }
  h += nav;
  $("#main").innerHTML = h + `</div>`;
}

document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-tg-greek]");
  if (b) {
    const box = b.closest(".tg-ch").querySelector(".tg-greek");
    const open = box.hasAttribute("hidden");
    box.toggleAttribute("hidden", !open);
    b.setAttribute("aria-expanded", String(open));
    return;
  }
  const a = ev.target.closest("[data-tg-all]");
  if (a) {
    TG.all = !TG.all;
    prefsSet("tgAll", TG.all ? "1" : "");
    a.classList.toggle("on", TG.all);
    a.setAttribute("aria-pressed", String(TG.all));
    document.querySelectorAll(".tg-ch").forEach((s) => {
      s.querySelector(".tg-greek").toggleAttribute("hidden", !TG.all);
      s.querySelector("[data-tg-greek]").setAttribute("aria-expanded", String(TG.all));
    });
  }
});

// ------------------------------------------------------------------ milestone 27: modern English of the Neoplatonists
// The Workshop's own modern English, made from the Greek and checked against Taylor (tools/modern_neo.py), read
// in place of Taylor's English where it exists: chapter by chapter, each with a short title and its gist, every
// paragraph with its Greek one tap away and Taylor's English of the chapter one tap away (or side by side).
// Labelled as the Workshop's own and machine-assisted; a flag shows where Taylor and the Greek differ. "Mark a
// sentence" works as in milestone 24 (modern.js), and the marks are kept in your own database for revision.

const TG_MODES = [["modern", "Modern English", "The Workshop's modern English, made from the Greek, with Taylor's words a tap away"],
  ["both", "Side by side", "The modern English and Taylor's together, chapter by chapter"],
  ["taylor", "Taylor only", "Taylor's English of 1817 as before, with the Greek a tap away"]];

function tgModernPara(p) {
  const flags = (p.flags || []).map((f) => `<div class="mp-flag"><b>⚑ Hard, or Taylor differs</b> ${esc(f.why)}
      <div class="meta">Taylor's words: “${esc(f.taylor)}”</div></div>`).join("");
  const notes = (p.notes || []).map((n) => `<p class="meta mp-note">${esc(n)}</p>`).join("");
  return `<div class="mp" id="mp-${esc(p.seg)}" data-seg="${esc(p.seg)}"><div class="mp-mod">
    <p class="mp-text">${modernParaHtml(p)}</p>${flags}${notes}
    <div class="mp-tools"><button type="button" class="link-btn" data-mp-mark>Mark a sentence</button></div>
    <div class="mp-markbox" hidden></div>
    <details class="mp-greek"><summary>The Greek of this paragraph</summary><div class="neo-tei" lang="grc">${esc(p.greek)}</div></details></div></div>`;
}

function tgTaylorWords(w, d, c) {
  return `<div class="tg-tay"><div class="mp-tay-h">Taylor, ${esc(String(w.year))}${c.page ? `, p. ${esc(String(c.page))}` : ""}</div>
    ${c.paras.map((x) => `<p>${esc(x)}</p>`).join("")}
    ${c.notes.length ? `<details class="meta"><summary>Taylor's notes (${c.notes.length})</summary><ol class="neo-notes">${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ol></details>` : ""}</div>`;
}

function tgModernChapter(w, d, c, mode) {
  const open = TG.all;
  const mods = c.modern.map((m) => `<h4 class="neo-unit-n" id="mc-${esc(m.id)}">${esc(m.id)}: ${esc(m.title)}</h4>
      <div class="ms-sum"><b>In short</b> ${esc(m.summary)}</div>
      ${m.paragraphs.map(tgModernPara).join("")}`).join("");
  const tay = tgTaylorWords(w, d, c);
  return `<section class="tg-ch tg-mod tg-mode-${mode}" id="tg-${c.seq}">
    <p class="meta tg-mlab">${esc(c.label)} ${tgHow(c)}</p>
    <div class="tg-cols"><div class="tg-mcol">${mods}</div>
      ${mode === "both" ? `<div class="tg-tcol">${tay}</div>` : ""}</div>
    <p class="mp-tools">${mode === "both" ? "" : `<button type="button" class="link-btn" data-tg-tay aria-expanded="false">Taylor's words</button>`}
      <button type="button" class="link-btn" data-tg-greek="${c.seq}" aria-expanded="${open}">The Greek of the chapter</button></p>
    ${mode === "both" ? "" : `<div class="tg-tay-box" hidden>${tay}</div>`}
    <div class="tg-greek"${open ? "" : " hidden"}>${tgGreekBlock(w, d, c)}</div>
  </section>`;
}

function tgModernToc(w, d, cur) {
  const m = d.modern, marks = (MODERN.marks || []).filter((x) => d.chapters.some((c) => (c.modern || []).some((mc) => x.para.startsWith(mc.id + "."))));
  const chs = d.chapters.flatMap((c) => c.modern || []);
  return tgToc(w, cur).replace(/<ul class="books neo-toc">/, `<h4 class="pane-h">In modern English</h4>
    <ol class="mod-secs">${chs.map((c) => `<li><a href="#mc-${esc(c.id)}" data-scroll="mc-${esc(c.id)}">${esc(c.id)}: ${esc(c.title)}</a></li>`).join("")}</ol>
    <h4 class="pane-h">Your marks${marks.length ? ` (${marks.length})` : ""}</h4>
    ${marks.length ? `<ul class="mod-marks">${marks.map((mk) => `<li><a href="#mp-${esc(mk.para)}" data-scroll="mp-${esc(mk.para)}"><b>${esc(mk.kind)}</b></a>${mk.changed ? ` <span class="meta">(revised since)</span>` : ""}: ${esc(mk.sentence.length > 90 ? mk.sentence.slice(0, 88) + "…" : mk.sentence)}</li>`).join("")}</ul>`
      : `<p class="meta">None yet. If a sentence reads badly or seems wrong, tap “Mark a sentence” under its paragraph.</p>`}
    <h4 class="pane-h">Taylor's parts</h4><ul class="books neo-toc">`);
}

const _renderTaylorGreekPart = renderTaylorGreekPart;
renderTaylorGreekPart = function (w, d, chapter) {  // eslint-disable-line no-global-assign
  TG.cur = { w, d, chapter };
  if (!d.modern) { document.body.classList.remove("modern-text-on"); return _renderTaylorGreekPart(w, d, chapter); }
  if (!TG.modeRead) { TG.modeRead = true; TG.mode = prefsGet("tgMode", "modern"); }
  if (!TG_MODES.some(([k]) => k === TG.mode)) TG.mode = "modern";
  MODERN.t = { modern: { ...d.modern, paragraphs: d.chapters.flatMap((c) => (c.modern || []).flatMap((m) => m.paragraphs)) } };
  MODERN.marks = d.modern.marks || [];
  MODERN.toc = () => { $("#toc").innerHTML = tgModernToc(w, d, d.part.seq); };
  const modes = `<div class="mod-modes" role="group" aria-label="Which English">${TG_MODES.map(([k, l, title]) =>
    `<button type="button" class="chip${k === TG.mode ? " on" : ""}" data-tg-mode="${k}" aria-pressed="${k === TG.mode}" title="${esc(title)}">${esc(l)}</button>`).join("")}</div>`;
  if (TG.mode === "taylor") {
    _renderTaylorGreekPart(w, d, chapter);
    $("#main .tg-read h2").insertAdjacentHTML("afterend", `<div class="mod-label" role="note"><b>This treatise is also in modern English, the Workshop's own.</b>${modes}</div>`);
    MODERN.toc();
    return;
  }
  const m = d.modern, tr = m.treatise || {};
  const nav = `<p class="neo-nav">${d.prev ? `<a class="btn" href="#neo-en/${esc(w.id)}/${d.prev.seq}">‹ ${esc(d.prev.label)}</a>` : ""}
    <a class="btn" href="#neo-en/${esc(w.id)}">Contents</a>
    ${d.next ? `<a class="btn" href="#neo-en/${esc(w.id)}/${d.next.seq}">${esc(d.next.label)} ›</a>` : ""}</p>`;
  let h = `<div class="search guide neo-text neo-read tg-read modern-text mod-${TG.mode}"><p class="meta"><a href="#neo-en/${esc(w.id)}">${esc(w.author)}, ${esc(w.title)}</a>, in modern English beside Taylor's</p>
    <h2>${esc(d.part.label)}</h2>
    ${d.part.greek_label ? `<p class="neo-greek" lang="grc">${esc(d.part.greek_label)}</p>` : ""}
    ${tr.summary ? `<div class="ms-sum"><b>The treatise in short</b> ${esc(tr.summary)}</div>` : ""}
    <div class="mod-label" role="note"><b>Modern English, the Workshop's own</b>
      <span class="mod-badge" title="Drafted with an AI model and not yet checked by a scholar">machine-assisted</span>
      <p>${esc(m.label)} Made from the Greek of ${esc(d.greek_text.edition)}, checked against Taylor's translation (${esc(String(w.year))}).
        Tap “Mark a sentence” under a paragraph if a sentence reads badly or seems wrong: your marks are kept for revision.</p>
      <details><summary>About this version</summary><p>${esc(m.about)}</p>
        <p class="meta">Master copy: <code>${esc(m.source)}</code>; the checks: <code>reports/modern_neo.md</code>. Taylor's English: ${esc(w.edition)}, ${esc(w.text_how)}.</p></details>
      ${modes}</div>`;
  h += nav;
  for (const c of d.chapters) {
    h += c.modern ? tgModernChapter(w, d, c, TG.mode)
      : `<section class="tg-ch" id="tg-${c.seq}"><h4 class="neo-unit-n">${esc(c.label)} ${tgHow(c)}</h4>${c.paras.map((p) => `<p>${esc(p)}</p>`).join("")}
         <p><button type="button" class="btn tg-btn" data-tg-greek="${c.seq}" aria-expanded="${TG.all}">Greek</button></p>
         <div class="tg-greek"${TG.all ? "" : " hidden"}>${tgGreekBlock(w, d, c)}</div></section>`;
  }
  h += nav;
  $("#main").innerHTML = h + `</div>`;
  MODERN.toc();
  if (typeof showPane === "function" && PANEL.pane !== "term") showPane("term", false);
  if (!PANEL.list) api("terms").then((x) => { PANEL.list = x; }).catch(() => {});
};

document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-tg-mode]");
  if (b && TG.cur) {
    TG.mode = b.dataset.tgMode;
    prefsSet("tgMode", TG.mode);
    const y = window.scrollY;
    renderTaylorGreekPart(TG.cur.w, TG.cur.d, TG.cur.chapter);
    window.scrollTo(0, y);
    return;
  }
  const t = ev.target.closest("[data-tg-tay]");
  if (t) {
    const box = t.closest(".tg-ch").querySelector(".tg-tay-box");
    const open = box.hasAttribute("hidden");
    box.toggleAttribute("hidden", !open);
    t.setAttribute("aria-expanded", String(open));
    t.textContent = open ? "Hide Taylor's words" : "Taylor's words";
  }
});

// The Greek text links to the modern English of each chapter that has it.
const _neoTaylorLinks = neoTaylorLinks;
neoTaylorLinks = function (u) {  // eslint-disable-line no-global-assign
  const h = _neoTaylorLinks(u);
  if (!u.modern || !u.taylor || !u.taylor.length) return h;
  const c = u.taylor[0];
  return h + `<p class="tg-back meta">In modern English, the Workshop's own: <a href="#neo-en/${esc(c.work)}/${c.part}/${c.seq}">${esc(u.label)}</a></p>`;
};
