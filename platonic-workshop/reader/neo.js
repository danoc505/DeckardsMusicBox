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
  const [id, part] = raw.split("/");
  state.view = "neo";
  setView("library-view");
  document.body.classList.add("guide-view");
  $("#main").innerHTML = `<p class="loading">Opening…</p>`;
  await loadNeo();
  if (!NEO.prefRead) { NEO.prefRead = true; NEO.mode = prefsGet("neoMode", "shown"); }
  const t = neoText(decodeURIComponent(id || ""));
  if (!t) { $("#main").innerHTML = `<p class="error">Not found: ${esc(id || "")}. <a href="#library">The Library</a></p>`; return; }
  if (part !== undefined && /^\d+$/.test(part)) return showNeoPart(t, parseInt(part, 10));
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

async function showNeoPart(t, seq) {
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
  window.scrollTo(0, 0);
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
        h += `<section class="neo-page" id="neo-${esc(u.n)}">${head}<div class="neo-ocr" lang="grc">${body}</div></section>`;
      }
    } else {
      h += `<section class="neo-unit" id="neo-${esc(u.n)}"><h4 class="neo-unit-n">${esc(u.label)}</h4>
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
