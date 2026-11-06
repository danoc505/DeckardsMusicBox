// Milestone 14: listen to the dialogues. The English shown is read aloud with the
// browser's own speech (speechSynthesis: Safari on the iPad, Edge or Chrome on
// Windows), paragraph by paragraph, from the place in view, on across the pages.
// Each person has one voice, always the same, in every dialogue; a narrator reads
// what no speaker is named for. No libraries.
"use strict";

const LISTEN = {
  on: false, paused: false, queue: [], i: 0, part: 0, gen: 0, edition: null, advancing: false,
  persons: null, // sources/structure/people.json, through /api/people
};
const NARRATOR = "(narrator)";
const synth = () => window.speechSynthesis;

// ------------------------------------------------------------------ who is speaking

// The one name a person is known by in every dialogue. The speaker names come from
// the Perseus markup (or a translation's printed label); people.json says where two
// spellings are one man (Cephalos, Cephalus) or one spelling two men (Cleinias), and
// which names stand for nobody in particular ("Friend"), quoting the text for each.
function personOf(name, workId) {
  if (!name) return NARRATOR;
  name = String(name).split("#").map((x) => x.trim()).filter(Boolean).sort().join(" and ");
  const p = LISTEN.persons || {};
  for (const r of p.persons || []) {
    if ((r.names || []).includes(name) && (!r.works || r.works.includes(workId))) return r.person;
  }
  if ((p.anonymous || []).includes(name)) return `${name} (${workAbbr(workId)})`;
  return name;
}

// A translation's label ("SOC.", "YOUNG SOCRATES", "Clin.") read as one of the work's
// speakers: each word of the label begins the same word of exactly one speaker's name.
// Taylor renders the Stranger of the Sophist and Statesman, and the Athenian of the Laws,
// as "Guest" (both translate the Greek xenos). A label that names no speaker of the work
// (an OCR running head, "VOL.") is not a change of speaker: null.
const LABEL_ALIASES = { guest: ["Stranger", "Athenian"] };
function speakerFromLabel(label, names) {
  const words = (s) => String(s).toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  const lw = words(label);
  if (!lw.length) return null;
  const fits = (n) => { const nw = words(n); return nw.length === lw.length && lw.every((x, i) => nw[i].startsWith(x)); };
  const exact = names.filter((n) => words(n).join(" ") === lw.join(" "));
  if (exact.length) return exact[0];
  const hits = [...new Set(names.filter(fits))];
  if (hits.length === 1) return hits[0];
  const alias = (LABEL_ALIASES[lw.join(" ")] || []).filter((n) => names.includes(n));
  return alias.length === 1 ? alias[0] : null;
}

// ------------------------------------------------------------------ voices

// Apple's novelty voices (bells, whispers, robots) are left out.
const NOVELTY = new Set(["Albert", "Bad News", "Bahh", "Bells", "Boing", "Bubbles", "Cellos", "Deranged", "Good News",
  "Hysterical", "Jester", "Organ", "Pipe Organ", "Superstar", "Trinoids", "Whisper", "Wobble", "Zarvox"]);
function englishVoices() {
  const seen = new Set();
  const vs = (synth() ? synth().getVoices() || [] : []).filter((v) => /^en([-_]|$)/i.test(v.lang) && !NOVELTY.has(v.name.replace(/ \(.*\)$/, ""))
    && !seen.has(v.voiceURI) && seen.add(v.voiceURI));
  // A stable order, so that the same person gets the same voice each time.
  return vs.sort((a, b) => (a.name + "|" + a.lang).localeCompare(b.name + "|" + b.lang));
}
// Safari and Chrome hand over their voices a moment after the page opens (getVoices() is
// empty at first): wait for them, up to a few seconds, before saying there are none.
function whenVoices(ms = 4000) {
  if (!listenAvailable() || englishVoices().length) return Promise.resolve(englishVoices());
  return new Promise((ok) => {
    const t0 = Date.now();
    const tick = () => {
      if (englishVoices().length || Date.now() - t0 > ms) return ok(englishVoices());
      setTimeout(tick, 150);
    };
    tick();
  });
}
// The name a person sees for a voice: Apple's "Daniel (Enhanced)" kept, its language said plainly.
const LANGS = { "en-GB": "British", "en-US": "American", "en-AU": "Australian", "en-IE": "Irish", "en-IN": "Indian", "en-ZA": "South African", "en-NZ": "New Zealand", "en-SC": "Scottish", "en-CA": "Canadian" };
function voiceLabel(v) {
  const lang = LANGS[String(v.lang).replace("_", "-")] || v.lang;
  return `${v.name} · ${lang}`;
}
// When there are fewer voices than persons, the same voice is used again at another pitch and pace.
const VARIANTS = [{ pitch: 1, rate: 1 }, { pitch: 0.8, rate: 0.95 }, { pitch: 1.2, rate: 1.05 }, { pitch: 0.65, rate: 0.92 }, { pitch: 1.35, rate: 1.08 }];

function loadCast() {
  try { return JSON.parse(localStorage.getItem("pw.voices") || "{}"); } catch (e) { return {}; }
}
function saveCast(c) {
  try { localStorage.setItem("pw.voices", JSON.stringify(c)); } catch (e) { /* private window */ }
}
const castKey = (v, variant) => `${v ? v.voiceURI : ""}#${variant}`;

// Give a voice to each person of the work being read who has none yet, and keep
// every voice already given: Socrates keeps his in every dialogue. A new person
// takes the voice least used, and never one another person of this work has.
function castWork(persons) {
  const cast = loadCast();
  const voices = englishVoices();
  if (!voices.length) return cast;
  const byUri = new Map(voices.map((v) => [v.voiceURI, v]));
  const slots = [];
  VARIANTS.forEach((_, vi) => voices.forEach((v) => slots.push({ uri: v.voiceURI, variant: vi })));
  const used = new Map();
  for (const a of Object.values(cast)) if (byUri.has(a.uri)) used.set(castKey(byUri.get(a.uri), a.variant), (used.get(castKey(byUri.get(a.uri), a.variant)) || 0) + 1);
  const here = new Set(persons.filter((p) => cast[p] && byUri.has(cast[p].uri)).map((p) => castKey(byUri.get(cast[p].uri), cast[p].variant)));
  let changed = false;
  for (const p of persons) {
    if (cast[p] && byUri.has(cast[p].uri)) continue;
    // A voice chosen on another device is not here: keep the choice, use another voice for now.
    const free = slots.filter((s) => !here.has(castKey(byUri.get(s.uri), s.variant)));
    const pool = free.length ? free : slots;
    let best = pool[0];
    for (const s of pool) if ((used.get(castKey(byUri.get(s.uri), s.variant)) || 0) < (used.get(castKey(byUri.get(best.uri), best.variant)) || 0)) best = s;
    const k = castKey(byUri.get(best.uri), best.variant);
    used.set(k, (used.get(k) || 0) + 1);
    here.add(k);
    if (cast[p]) { LISTEN.stand = LISTEN.stand || {}; LISTEN.stand[p] = best; continue; }
    cast[p] = { uri: best.uri, name: byUri.get(best.uri).name, variant: best.variant };
    changed = true;
  }
  if (changed) saveCast(cast);
  return cast;
}

// "One voice for everyone": every person is read in the narrator's voice.
function oneVoice() {
  try { return localStorage.getItem("pw.listen.one") === "1"; } catch (e) { return false; }
}
function voiceFor(person) {
  if (oneVoice() && person !== NARRATOR) return voiceFor(NARRATOR);
  const cast = loadCast();
  const voices = englishVoices();
  if (!cast[person] && voices.length && LISTEN.persons_here) Object.assign(cast, castWork([...new Set([...LISTEN.persons_here, person])]));
  let a = cast[person];
  let v = a && voices.find((x) => x.voiceURI === a.uri);
  if (!v && LISTEN.stand && LISTEN.stand[person]) { a = LISTEN.stand[person]; v = voices.find((x) => x.voiceURI === a.uri); }
  return { voice: v || null, ...(VARIANTS[(a && a.variant) || 0] || VARIANTS[0]) };
}

function speed() {
  let r = 1;
  try { r = parseFloat(localStorage.getItem("pw.listen.rate") || "1") || 1; } catch (e) { /* ignore */ }
  return Math.min(2, Math.max(0.5, r));
}

// ------------------------------------------------------------------ what is read

// Which translation is read aloud: the one chosen (by kind: loeb, taylor, jowett) if this
// dialogue has it, else the first one shown. One chosen that is not shown is put on the page,
// so that the paragraph being read can be seen.
function listenKind() {
  try { return localStorage.getItem("pw.listen.ed") || ""; } catch (e) { return ""; }
}
function listenEdition() {
  if (!state.work) return null;
  const want = listenKind();
  return (want && englishEditions().find((e) => transKind(e) === want)) || shownEditions()[0] || null;
}
function chooseListenEdition(kind) {
  try { localStorage.setItem("pw.listen.ed", kind); } catch (e) { /* private window */ }
  const p = transPrefs();
  if (state.work && englishEditions().some((e) => transKind(e) === kind) && !p[kind]) {
    p[kind] = true;
    try { localStorage.setItem("pw.trans", JSON.stringify(p)); } catch (e) { /* ignore */ }
    if (state.data && state.view === "read") { renderPage(); }
  }
  if (document.body.classList.contains("no-eng")) {
    const box = document.querySelector('[data-layer="eng"]');
    if (box) { box.checked = true; box.dispatchEvent(new Event("change", { bubbles: true })); }
  }
  renderListenEd();
  // Reading already: go on in the other translation from the section being read.
  if (LISTEN.on) {
    const u = LISTEN.queue[LISTEN.i];
    LISTEN.queue = buildQueue(u ? u.ref : sectionInView(), false);
    LISTEN.i = 0; LISTEN.part = 0;
    prepareCast();
    if (!LISTEN.paused) speakNow();
  }
}
function renderListenEd() {
  const sel = $("#listen-ed");
  if (!sel || !state.work) return;
  const eds = englishEditions();
  const cur = listenEdition();
  sel.innerHTML = eds.map((e) => `<option value="${esc(transKind(e))}" ${cur && cur.id === e.id ? "selected" : ""}>${esc(e.label)}</option>`).join("");
  sel.closest("label").hidden = eds.length < 2;
}

// The paragraphs of the page in the translation read aloud, from a section
// on: one unit per paragraph (a paragraph cut by a section number is read whole).
function buildQueue(fromRef, carried) {
  const d = state.data, w = state.work;
  const ed = listenEdition();
  if (!d || !ed) return [];
  LISTEN.edition = ed.id;
  LISTEN.page = state.page;
  const other = ((LISTEN.persons || {}).persons || []).filter((r) => !r.works || r.works.includes(WORK)).flatMap((r) => r.names);
  const names = [...new Set(d.chunks.filter((c) => c.speaker).map((c) => c.speaker).concat((w.speakers || []).map((s) => s.name), other))];
  const order = new Map(d.sections.map((s, i) => [s.ref, i]));
  const from = order.has(fromRef) ? order.get(fromRef) : 0;
  const chunks = d.chunks.filter((c) => c.edition_id === ed.id && (c.continued ? !carried && from === 0 : order.get(c.section_ref) >= from));
  // Continued paragraphs come first on the page.
  chunks.sort((a, b) => (b.continued ? 1 : 0) - (a.continued ? 1 : 0));
  const units = [];
  let lastSpeaker = null;
  for (const c of chunks) {
    const last = units[units.length - 1];
    let who = c.speaker;
    if (ed.source_id !== "perseus-english-plato") {
      // A translation prints its label on a speech's first paragraph only.
      who = (c.label && speakerFromLabel(c.label, names)) || lastSpeaker;
    }
    lastSpeaker = who;
    const person = personOf(who, WORK);
    if (last && last.para === c.para && last.person === person) {
      last.ids.push(c.id);
      last.text += " " + c.text;
    } else units.push({ ids: [c.id], para: c.para, person, ref: c.section_ref, text: c.text });
  }
  for (const u of units) u.parts = sentences(u.text);
  return units;
}

// Long paragraphs are spoken a few sentences at a time: some browsers stop a long utterance part way.
function sentences(text) {
  const out = [];
  const bits = String(text).replace(/\s+/g, " ").trim().match(/[^.!?;:]+[.!?;:]+["'’”)\]]*\s*|[^.!?;:]+$/g) || [];
  let cur = "";
  for (const b of bits) {
    if (cur && (cur + b).length > 220) { out.push(cur.trim()); cur = ""; }
    cur += b;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function sectionInView() {
  const top = ($(".bar") ? $(".bar").getBoundingClientRect().bottom : 0) + 8;
  for (const s of document.querySelectorAll("#main .sec")) {
    if (s.getBoundingClientRect().bottom > top + 30) return s.dataset.ref;
  }
  return null;
}

// ------------------------------------------------------------------ playing

function listenAvailable() { return "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function"; }

// Say an utterance now. What is being said is stopped first, but only if something is:
// Safari can drop a new utterance spoken straight after a needless cancel(). The utterance
// is kept, or Safari and Chrome may forget it and never say that it ended.
function say(ut) {
  const s = synth();
  if (s.speaking || s.pending) s.cancel();
  if (s.paused && s.resume) s.resume();
  LISTEN.current = ut;
  s.speak(ut);
}
function hush() {
  const s = synth();
  if (s && (s.speaking || s.pending || s.paused)) s.cancel();
}

function startListening() {
  const tell = (m) => (typeof toast === "function" ? toast(m) : alert(m));
  if (!listenAvailable()) { tell("This browser cannot read aloud. Safari on the iPad, and Edge or Chrome on Windows, can."); return; }
  if (state.view !== "read" || !state.data) { tell("Open a dialogue to listen to it."); return; }
  LISTEN.queue = buildQueue(sectionInView(), false);
  if (!LISTEN.queue.length) { tell("There is no English on this page to read."); return; }
  prepareCast();
  LISTEN.on = true; LISTEN.paused = false; LISTEN.i = 0; LISTEN.part = 0;
  document.body.classList.add("listening");
  $("#listen-btn").textContent = "■ Stop";
  $("#listen-bar").hidden = false;
  renderListenEd();
  speakNow(); // inside the tap: the iPad speaks only when a tap starts it
}

function prepareCast() {
  const persons = [NARRATOR];
  for (const s of (state.work.speakers || []).slice().sort((a, b) => b.speeches - a.speeches)) persons.push(personOf(s.name, WORK));
  for (const u of LISTEN.queue) if (!persons.includes(u.person)) persons.push(u.person);
  LISTEN.persons_here = [...new Set(persons)];
  castWork(LISTEN.persons_here);
}

function speakNow() {
  if (state.page !== LISTEN.page || state.view !== "read") return stopListening();
  const gen = ++LISTEN.gen;
  LISTEN.trying = null;
  const u = LISTEN.queue[LISTEN.i];
  if (!u) return nextPage();
  listenHighlight(u);
  const v = voiceFor(u.person);
  const ut = new SpeechSynthesisUtterance(u.parts[LISTEN.part] || "");
  if (v.voice) { ut.voice = v.voice; ut.lang = v.voice.lang; } else ut.lang = "en-GB";
  ut.pitch = v.pitch;
  ut.rate = Math.min(2, v.rate * speed());
  ut.onend = () => { if (gen === LISTEN.gen && LISTEN.on && !LISTEN.paused) advance(); };
  ut.onerror = (e) => { if (gen === LISTEN.gen && LISTEN.on && !LISTEN.paused && e.error !== "interrupted" && e.error !== "canceled") advance(); };
  showWho(u, v);
  say(ut);
}

function advance() {
  const u = LISTEN.queue[LISTEN.i];
  if (u && LISTEN.part + 1 < u.parts.length) LISTEN.part++;
  else { LISTEN.i++; LISTEN.part = 0; }
  speakNow();
}

// At the end of a page, the next page is opened and the reading goes on.
async function nextPage() {
  const d = state.data;
  if (!d || !d.next) return stopListening();
  LISTEN.advancing = true;
  const gen = LISTEN.gen;
  try { await goTo(WORK, null, d.next); } finally { LISTEN.advancing = false; }
  if (!LISTEN.on || gen !== LISTEN.gen || state.page !== d.next) return;
  LISTEN.queue = buildQueue(null, true);
  LISTEN.i = 0; LISTEN.part = 0;
  prepareCast();
  speakNow();
}

function skip(by) {
  if (!LISTEN.on) return;
  LISTEN.i = Math.max(0, Math.min(LISTEN.queue.length, LISTEN.i + by));
  LISTEN.part = 0;
  if (LISTEN.paused) { LISTEN.paused = false; pauseLabel(); }
  speakNow();
}

// Pausing stops the speech and resuming starts the sentence again: the browsers' own pause is unreliable.
function togglePause() {
  if (!LISTEN.on) return;
  LISTEN.paused = !LISTEN.paused;
  if (LISTEN.paused) { LISTEN.gen++; hush(); } else speakNow();
  pauseLabel();
}
function pauseLabel() {
  const b = $("#listen-pause");
  b.textContent = LISTEN.paused ? "Resume" : "Pause";
  b.setAttribute("aria-label", b.textContent);
  b.title = b.textContent;
}

function stopListening() {
  LISTEN.on = false; LISTEN.paused = false; LISTEN.gen++;
  if (listenAvailable()) hush();
  document.querySelectorAll("#main .speaking").forEach((e) => e.classList.remove("speaking"));
  document.body.classList.remove("listening");
  $("#listen-btn").textContent = "▶ Listen";
  $("#listen-bar").hidden = true;
  pauseLabel();
}

function listenHighlight(u) {
  document.querySelectorAll("#main .speaking").forEach((e) => e.classList.remove("speaking"));
  const els = u.ids.flatMap((id) => [...document.querySelectorAll(`#main .eng[data-ed="${CSS.escape(LISTEN.edition)}"] p[data-c="${id}"]`)]);
  els.forEach((e) => e.classList.add("speaking"));
  const first = els[0];
  if (first && LISTEN.part === 0) {
    const r = first.getBoundingClientRect();
    const top = $(".bar") ? $(".bar").getBoundingClientRect().bottom : 0;
    const bar = $("#listen-bar").getBoundingClientRect();
    if (r.top < top || r.bottom > Math.min(window.innerHeight, bar.top || window.innerHeight)) first.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function showWho(u, v) {
  const name = u.person === NARRATOR ? "Narrator" : u.person;
  $("#listen-who").textContent = `${u.ref} · ${name}`;
  $("#listen-who").title = v.voice ? `Voice: ${v.voice.name} (${v.voice.lang})${v.pitch !== 1 ? ", pitch " + v.pitch : ""}` : "The device's own voice";
}

// ------------------------------------------------------------------ choosing voices

// The voices can be chosen at any time, not only while reading: open from the Voices
// button by Listen, or from the player. Picking a voice says a line in it at once; Try
// says it again. A line the person really speaks on this page is used where there is one.
const PITCH_NAMES = ["Natural", "Lower", "Higher", "Lowest", "Highest"];
function personsForVoices() {
  if (state.work && state.data && state.view === "read") {
    if (!LISTEN.on || !LISTEN.persons_here) { LISTEN.queue = LISTEN.on ? LISTEN.queue : buildQueue(null, false); prepareCast(); }
    return LISTEN.persons_here;
  }
  return [...new Set([NARRATOR, ...Object.keys(loadCast())])];
}

function sampleFor(person) {
  const units = (LISTEN.on && LISTEN.queue.length ? LISTEN.queue : (state.data && state.view === "read" ? buildQueue(null, false) : []));
  const u = units.find((x) => x.person === person && x.parts && x.parts[0] && x.parts[0].length > 20);
  const name = person === NARRATOR ? "the narrator" : person.replace(/ \(.*\)$/, "");
  if (!u) return `This is the voice of ${name}.`;
  let line = u.parts[0];
  if (line.length > 180) line = line.slice(0, 180).replace(/\s+\S*$/, "") + "…";
  return line;
}

async function showVoices() {
  const body = $("#voices-body");
  const dlg = $("#voices-dialog");
  if (!listenAvailable()) {
    body.innerHTML = `<p>This browser cannot read aloud. Safari on the iPad, and Edge or Chrome on Windows, can.</p>`;
    if (!dlg.open) dlg.showModal();
    return;
  }
  if (!englishVoices().length) {
    body.innerHTML = `<p class="loading">Finding the voices on this device…</p>`;
    if (!dlg.open) dlg.showModal();
    await whenVoices();
  }
  renderVoices();
  if (!dlg.open) dlg.showModal();
}

function renderVoices() {
  const body = $("#voices-body");
  const voices = englishVoices();
  const persons = personsForVoices();
  const cast = castWork(persons);
  const one = oneVoice();
  const eds = state.work && state.view === "read" ? englishEditions() : [];
  const cur = listenEdition();
  const rates = [...document.querySelectorAll("#listen-rate option")].map((o) => [o.value, o.textContent]);
  const top = `<div class="voices-top">
    ${eds.length > 1 ? `<label>Read aloud <select data-listen-ed aria-label="Translation read aloud">${eds.map((e) => `<option value="${esc(transKind(e))}" ${cur && cur.id === e.id ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></label>` : ""}
    <label>Speed <select id="voices-rate" aria-label="Speed">${rates.map(([v, t]) => `<option value="${v}" ${+v === speed() ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
    <label class="voices-one"><input type="checkbox" id="voices-one" ${one ? "checked" : ""}> One voice for everyone</label>
  </div>`;
  if (!voices.length) {
    body.innerHTML = top + `<p>This device has not offered any English voices. On the iPad they are in Settings › Accessibility › Spoken Content › Voices › English: download one or two (the “Enhanced” ones sound best), then come back and open Voices again.</p>
      <p><button type="button" class="btn" id="voices-again">Look again</button></p>`;
    return;
  }
  const row = (p) => {
    const a = cast[p] || {};
    const opts = voices.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === a.uri ? "selected" : ""}>${esc(voiceLabel(v))}</option>`).join("");
    const pitch = VARIANTS.map((x, i) => `<option value="${i}" ${i === (a.variant || 0) ? "selected" : ""}>${PITCH_NAMES[i]}</option>`).join("");
    const label = p === NARRATOR ? (one ? "Everyone" : "Narrator") : p;
    return `<tr data-person="${esc(p)}"${LISTEN.trying === p ? ' class="trying"' : ""}><th scope="row">${esc(label)}</th>
      <td><select data-voice aria-label="Voice of ${esc(label)}">${opts}</select></td>
      <td><select data-variant aria-label="Pitch of ${esc(label)}">${pitch}</select></td>
      <td><button type="button" data-try class="btn try-btn" aria-label="Try the voice of ${esc(label)}">${LISTEN.trying === p ? "■ Stop" : "▶ Try"}</button></td></tr>`;
  };
  const shown = one ? [NARRATOR] : persons;
  body.innerHTML = top + `<p class="meta">${one ? "Every person is read in this one voice." : "Each person keeps one voice in every dialogue."} Pick a voice and you hear it at once; it is remembered on this device.
      ${!one && voices.length < persons.length ? `This device has ${voices.length} English voice${voices.length === 1 ? "" : "s"}, so some are used again, higher or lower.` : ""}</p>
    <div class="voices-scroll"><table class="voices"><thead><tr><th>Who</th><th>Voice</th><th>Pitch</th><th></th></tr></thead><tbody>${shown.map(row).join("")}</tbody></table></div>
    <p class="meta">More voices: on the iPad, Settings › Accessibility › Spoken Content › Voices › English (the “Enhanced” and “Premium” ones sound best).
      <button type="button" class="link-btn" id="voices-reset">Give everyone new voices</button></p>
    <p class="meta">Who speaks is taken from the speakers named in the text. Where a narrator tells the whole dialogue (the Republic, told by Socrates; the Phaedo, told by Phaedo), the speeches inside the story are read in the narrator's voice, because the text does not mark who says them.</p>`;
}

// Say a line in a person's voice. Reading aloud is paused meanwhile, and goes on when the
// Voices window is closed.
function tryVoice(p) {
  if (LISTEN.trying === p) { LISTEN.trying = null; hush(); markTrying(); return; }
  if (LISTEN.on && !LISTEN.paused) { LISTEN.paused = true; LISTEN.gen++; LISTEN.resumeAfterVoices = true; pauseLabel(); }
  const v = voiceFor(p);
  const ut = new SpeechSynthesisUtterance(sampleFor(p));
  if (v.voice) { ut.voice = v.voice; ut.lang = v.voice.lang; } else ut.lang = "en-GB";
  ut.pitch = v.pitch;
  ut.rate = Math.min(2, v.rate * speed());
  LISTEN.trying = p;
  const done = () => { if (LISTEN.trying === p && LISTEN.current === ut) { LISTEN.trying = null; markTrying(); } };
  ut.onend = done;
  ut.onerror = done;
  say(ut);
  markTrying();
}
function markTrying() {
  document.querySelectorAll("#voices-body tr[data-person]").forEach((tr) => {
    const on = tr.dataset.person === LISTEN.trying;
    tr.classList.toggle("trying", on);
    const b = tr.querySelector("[data-try]");
    if (b) b.textContent = on ? "■ Stop" : "▶ Try";
  });
}

document.getElementById("voices-dialog")?.addEventListener("close", () => {
  if (LISTEN.trying) { LISTEN.trying = null; hush(); }
  if (LISTEN.resumeAfterVoices) {
    LISTEN.resumeAfterVoices = false;
    if (LISTEN.on && LISTEN.paused) { LISTEN.paused = false; pauseLabel(); speakNow(); }
  }
});

function setSpeed(v) {
  try { localStorage.setItem("pw.listen.rate", v); } catch (e) { /* ignore */ }
  const r = $("#listen-rate");
  if (r) r.value = String(speed());
  if (LISTEN.on && !LISTEN.paused) speakNow();
}

document.addEventListener("change", (ev) => {
  const t = ev.target;
  const row = t.closest && t.closest("#voices-body tr[data-person]");
  if (row) {
    const cast = loadCast();
    const sel = row.querySelector("[data-voice]");
    const p = row.dataset.person;
    cast[p] = { uri: sel.value, name: (englishVoices().find((v) => v.voiceURI === sel.value) || {}).name || sel.selectedOptions[0].textContent, variant: +row.querySelector("[data-variant]").value };
    saveCast(cast);
    if (LISTEN.stand) delete LISTEN.stand[p];
    // Hear it at once: in the reading if this person is speaking now, else in a line of theirs.
    const u = LISTEN.on && !LISTEN.paused && LISTEN.queue[LISTEN.i];
    if (u && (u.person === p || (oneVoice() && p === NARRATOR))) speakNow();
    else tryVoice(p);
    return;
  }
  if (t.id === "listen-rate" || t.id === "voices-rate") { setSpeed(t.value); return; }
  if (t.id === "voices-one") {
    try { localStorage.setItem("pw.listen.one", t.checked ? "1" : "0"); } catch (e) { /* ignore */ }
    renderVoices();
    if (LISTEN.on && !LISTEN.paused) speakNow();
    return;
  }
  if (t.matches && (t.matches("[data-listen-ed]") || t.id === "listen-ed")) { chooseListenEdition(t.value); if (t.matches("[data-listen-ed]")) renderVoices(); }
});

document.addEventListener("click", (ev) => {
  if (!ev.target.closest) return;
  if (ev.target.closest("#listen-btn")) { LISTEN.on ? stopListening() : startListening(); return; }
  if (ev.target.closest("#voices-btn")) { showVoices(); return; }
  const b = ev.target.closest("[data-listen]");
  if (b) {
    const k = b.dataset.listen;
    if (k === "pause") togglePause();
    else if (k === "next") skip(1);
    else if (k === "prev") skip(LISTEN.part > 0 ? 0 : -1);
    else if (k === "stop") stopListening();
    else if (k === "voices") showVoices();
    return;
  }
  const t = ev.target.closest("#voices-body [data-try]");
  if (t) { tryVoice(t.closest("tr").dataset.person); return; }
  if (ev.target.closest("#voices-reset")) { saveCast({}); LISTEN.stand = null; renderVoices(); return; }
  if (ev.target.closest("#voices-again")) { showVoices(); return; }
  // While reading, a tap on a paragraph of the translation being read goes on from there.
  if (LISTEN.on && !ev.target.closest("a, button, sup, .tm-en, input, select, label, summary, details.raw")) {
    const para = ev.target.closest(`#main .eng p[data-c]`);
    const sel = window.getSelection && window.getSelection();
    if (para && (!sel || sel.isCollapsed)) {
      const id = para.dataset.c;
      const i = LISTEN.queue.findIndex((u) => u.ids.some((x) => String(x) === id));
      if (i >= 0) { LISTEN.i = i; LISTEN.part = 0; if (LISTEN.paused) { LISTEN.paused = false; pauseLabel(); } speakNow(); }
    }
  }
});

// Going somewhere else stops the reading, unless the reading itself turned the page.
window.addEventListener("hashchange", () => { if (LISTEN.on && !LISTEN.advancing) stopListening(); });
document.addEventListener("change", (ev) => {
  if (LISTEN.on && ev.target.matches && ev.target.matches("[data-trans]")) stopListening();
});
document.addEventListener("keydown", (ev) => {
  if (!LISTEN.on || ev.target.closest("input, textarea, select, [contenteditable]")) return;
  if (ev.key === " " && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); togglePause(); }
});

(async function initListen() {
  const rate = $("#listen-rate");
  if (rate) rate.value = String(speed());
  if (!listenAvailable()) { const b = $("#listen-btn"); if (b) b.hidden = true; const v = $("#voices-btn"); if (v) v.hidden = true; return; }
  synth().getVoices(); // Chrome and Edge load their voices after the first ask
  synth().addEventListener?.("voiceschanged", () => {
    if (LISTEN.persons_here) castWork(LISTEN.persons_here);
    if ($("#voices-dialog")?.open && !LISTEN.trying) renderVoices();
  });
  try { LISTEN.persons = await api("people"); } catch (e) { LISTEN.persons = {}; }
})();
