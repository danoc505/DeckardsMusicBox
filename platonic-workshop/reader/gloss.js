// Milestone 15: English for every piece of Greek.
//
// 1. Tap any Greek word anywhere (a note, the scholia, an ancient introduction, Taylor's
//    footnotes, a dictionary entry, a quotation) for a small box with its meaning: the
//    dictionary form from GLAUx and Morpheus, Morpheus' short English, and the English
//    the dictionary prints for it (Middle Liddell, or LSJ), named. Burnet's own words
//    keep the word box.
// 2. Under a quotation of Burnet's Greek away from the reader, "English" opens the
//    English of that section in each translation (the Loeb first).
// Every meaning is a dictionary's or a translator's words, named; nothing is written here.

const GREEK_CH = /[Ͱ-Ͽἀ-῿]/;
const GREEK_WORD = /[Ͱ-Ͽἀ-῿̀-ͯ]+/g;
const GLOSS = { cache: new Map(), pop: null };

// The Greek word at a point on the screen, or null.
function greekWordAt(x, y) {
  let node, off;
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    node = p.offsetNode; off = p.offset;
  } else if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (!r) return null;
    node = r.startContainer; off = r.startOffset;
  } else return null;
  if (!node || node.nodeType !== 3) return null;
  const text = node.textContent;
  GREEK_WORD.lastIndex = 0;
  let m;
  while ((m = GREEK_WORD.exec(text))) {
    if (m.index <= off && off <= m.index + m[0].length && GREEK_CH.test(m[0])) return m[0];
    if (m.index > off) break;
  }
  return null;
}

function closeGloss() {
  if (GLOSS.pop) { GLOSS.pop.remove(); GLOSS.pop = null; }
}

function glossHtml(g) {
  if (!g.lemmas.length && !g.meaning) {
    return `<p><b lang="grc">${esc(g.form)}</b></p><p class="meta">No dictionary form is known for this word: it may be a name, a word the scan has misread,
      or one the dictionaries file under another form. <a href="https://logeion.uchicago.edu/${encodeURIComponent(g.form)}" target="_blank" rel="noopener">Try Logeion</a>.</p>`;
  }
  let h = `<p><b lang="grc">${esc(g.form)}</b>`;
  const ls = g.lemmas.filter((l) => l.lemma !== g.form);
  if (ls.length) h += ` <span class="meta">from</span> ${ls.map((l) => `<span lang="grc">${esc(l.lemma)}</span>${l.gloss ? ` <span class="meta">“${esc(l.gloss)}”</span>` : ""}`).join(" <span class=\"meta\">or</span> ")}`;
  h += `</p>`;
  if (g.letters_only) h += `<p class="meta doubt-mark">Printed without accents: matched by its letters only, so check it is the same word.</p>`;
  const m = g.meaning;
  if (m) {
    const senses = m.senses && m.senses.length ? m.senses.join("; ") : m.text;
    h += `<p class="gloss-mean">${esc(senses)}</p>
      <p class="meta">${esc(m.lexicon)}, under <span lang="grc">${esc(m.headword)}</span>${m.method && m.method !== "same-spelling" && m.method !== "capital-lowered" ? " (matched by its letters: check it is the same word)" : ""}.
      <button type="button" class="link-btn" data-gloss-entry="${esc(m.lemma)}">The whole entry</button></p>`;
  } else {
    h += `<p class="meta">Neither dictionary has an entry for it.</p>`;
  }
  const first = g.lemmas[0];
  if (first) {
    const by = g.lemmas.flatMap((l) => l.by).filter((v, i, a) => a.indexOf(v) === i);
    const parse = first.parses && first.parses.length ? `: ${first.parses.slice(0, 2).join("; ")}` : "";
    const inPlato = first.by.some((b) => b.startsWith("GLAUx"));
    h += `<p class="meta">Dictionary form from ${esc(by.join(" and "))}${esc(parse)}.${inPlato ? ` <a href="#search?q=${encodeURIComponent(first.lemma)}&by=lemma">Every place in Plato</a>` : ""}</p>`;
  }
  return h;
}

async function showGloss(word, x, y, host) {
  closeGloss();
  const pop = document.createElement("div");
  pop.className = "gloss-pop";
  pop.setAttribute("role", "dialog");
  pop.innerHTML = `<button type="button" class="gloss-x" aria-label="Close">×</button><div class="gloss-body"><p class="loading">…</p></div>`;
  // Inside an open dialog the box must be in the dialog, or the dialog would cover it.
  (host || document.body).appendChild(pop);
  GLOSS.pop = pop;
  const w = Math.min(340, window.innerWidth - 24);
  pop.style.width = w + "px";
  pop.style.left = Math.max(12, Math.min(x - w / 2, window.innerWidth - w - 12)) + "px";
  pop.style.top = y + 14 + "px";
  let g = GLOSS.cache.get(word);
  try {
    if (!g) { g = await api(`gloss/${encodeURIComponent(word)}`); GLOSS.cache.set(word, g); }
  } catch (e) { pop.querySelector(".gloss-body").innerHTML = `<p class="error">${esc(e.message)}</p>`; return; }
  if (GLOSS.pop !== pop) return;
  pop.querySelector(".gloss-body").innerHTML = glossHtml(g);
  // Keep it on the screen: above the word if there is no room below.
  const r = pop.getBoundingClientRect();
  if (r.bottom > window.innerHeight - 8 && y - r.height - 14 > 8) pop.style.top = y - r.height - 14 + "px";
}

document.addEventListener("click", (ev) => {
  if (ev.target.closest(".gloss-x")) { closeGloss(); return; }
  const ent = ev.target.closest("[data-gloss-entry]");
  if (ent) { closeGloss(); showDictionaryDialog(ent.dataset.glossEntry); return; }
  if (ev.target.closest(".gloss-pop")) return;
  // Burnet's words have the word box; links, buttons and form fields do what they do.
  if (ev.target.closest("a, button, input, select, textarea, summary, label, .w, [data-t], svg, #listen-bar")) { closeGloss(); return; }
  const sel = window.getSelection && window.getSelection();
  if (sel && !sel.isCollapsed && String(sel).trim()) return;
  const word = greekWordAt(ev.clientX, ev.clientY);
  if (!word) { closeGloss(); return; }
  showGloss(word, ev.clientX, ev.clientY, ev.target.closest("dialog[open]"));
});
window.addEventListener("scroll", closeGloss, { passive: true });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeGloss(); });
window.addEventListener("hashchange", closeGloss);

// ------------------------------------------------------------------ the English of a quoted passage

// A button that opens, under a quotation of Burnet's Greek, the English of its section.
const enBtn = (work, ref) => work && ref
  ? ` <button type="button" class="link-btn en-btn" data-en-work="${esc(work)}" data-en-ref="${esc(ref)}" title="The English of this passage in each translation">English</button>` : "";

function englishHtml(d) {
  if (!d.editions.length) return `<p class="meta">No English translation in the library has this section.</p>`;
  const one = (e) => `<p class="en-quote-by"><span class="gq-tag">${esc(e.translator || e.label)}</span>${e.computed ? ` <span class="approx" title="This translation's sections are computed, not printed">≈</span>` : ""}
    <span class="meta">${e.translator && e.translator !== e.label ? esc(e.label) + ", " : ""}the paragraph holding ${esc(d.ref)}</span></p>${e.text.map((t) => `<p>${esc(t)}</p>`).join("")}`;
  const [first, ...rest] = d.editions;
  return one(first) + (rest.length ? `<details><summary class="meta">The other translations (${rest.length})</summary>${rest.map(one).join("")}</details>` : "");
}

document.addEventListener("click", async (ev) => {
  const b = ev.target.closest(".en-btn");
  if (!b) return;
  ev.preventDefault();
  const next = b.nextElementSibling;
  if (next && next.classList.contains("en-quote")) { next.remove(); b.classList.remove("open"); return; }
  const box = document.createElement("div");
  box.className = "en-quote";
  box.lang = "en";
  box.innerHTML = `<p class="loading">…</p>`;
  b.after(box);
  b.classList.add("open");
  try { box.innerHTML = englishHtml(await api(`english/${encodeURIComponent(b.dataset.enWork)}/${encodeURIComponent(b.dataset.enRef)}`)); }
  catch (e) { box.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
});
