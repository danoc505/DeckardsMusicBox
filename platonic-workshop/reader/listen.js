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
  const vs = (synth() ? synth().getVoices() : []).filter((v) => /^en([-_]|$)/i.test(v.lang) && !NOVELTY.has(v.name));
  // A stable order, so that the same person gets the same voice each time.
  return vs.sort((a, b) => (a.name + "|" + a.lang).localeCompare(b.name + "|" + b.lang));
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

function voiceFor(person) {
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

// The paragraphs of the page in the first English translation shown, from a section
// on: one unit per paragraph (a paragraph cut by a section number is read whole).
function buildQueue(fromRef, carried) {
  const d = state.data, w = state.work;
  const ed = shownEditions()[0];
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

function startListening() {
  if (!listenAvailable()) { alert("This browser cannot read aloud. Safari on the iPad, and Edge or Chrome on Windows, can."); return; }
  if (state.view !== "read" || !state.data) { alert("Open a dialogue to listen to it."); return; }
  LISTEN.queue = buildQueue(sectionInView(), false);
  if (!LISTEN.queue.length) { alert("There is no English on this page to read."); return; }
  prepareCast();
  LISTEN.on = true; LISTEN.paused = false; LISTEN.i = 0; LISTEN.part = 0;
  document.body.classList.add("listening");
  $("#listen-btn").textContent = "■ Stop";
  $("#listen-bar").hidden = false;
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
  synth().cancel();
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
  synth().speak(ut);
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
  if (LISTEN.paused) { LISTEN.gen++; synth().cancel(); } else speakNow();
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
  if (listenAvailable()) synth().cancel();
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

function showVoices() {
  if (!state.work) return;
  if (!LISTEN.persons_here) { LISTEN.queue = buildQueue(null, false); prepareCast(); }
  const voices = englishVoices();
  const cast = loadCast();
  const body = $("#voices-body");
  if (!voices.length) {
    body.innerHTML = `<p>This device has no English voices to choose from yet. On the iPad they are in Settings, Accessibility, Spoken Content, Voices.</p>`;
  } else {
    body.innerHTML = `<p class="meta">Each person keeps one voice in every dialogue. Choose another and it is remembered on this device.
      ${voices.length < LISTEN.persons_here.length ? `This device has ${voices.length} English voice${voices.length === 1 ? "" : "s"}, so some are used again, higher or lower.` : ""}</p>
      <table class="voices"><tbody>${LISTEN.persons_here.map((p) => {
        const a = cast[p] || {};
        const opts = voices.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === a.uri ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("");
        const pitch = VARIANTS.map((x, i) => `<option value="${i}" ${i === (a.variant || 0) ? "selected" : ""}>${["Natural", "Lower", "Higher", "Lowest", "Highest"][i]}</option>`).join("");
        return `<tr data-person="${esc(p)}"><th>${esc(p === NARRATOR ? "Narrator" : p)}</th>
          <td><select data-voice aria-label="Voice of ${esc(p)}">${opts}</select></td>
          <td><select data-variant aria-label="Pitch of ${esc(p)}">${pitch}</select></td>
          <td><button type="button" data-try class="link-btn">Try</button></td></tr>`;
      }).join("")}</tbody></table>
      <p class="meta">Who speaks is taken from the speakers named in the text. Where a narrator tells the whole dialogue (the Republic, told by Socrates; the Phaedo, told by Phaedo), the speeches inside the story are read in the narrator's voice, because the text does not mark who says them.</p>`;
  }
  $("#voices-dialog").showModal();
}

document.addEventListener("change", (ev) => {
  const row = ev.target.closest && ev.target.closest("#voices-body tr[data-person]");
  if (row) {
    const cast = loadCast();
    const sel = row.querySelector("[data-voice]");
    cast[row.dataset.person] = { uri: sel.value, name: sel.selectedOptions[0].textContent, variant: +row.querySelector("[data-variant]").value };
    saveCast(cast);
    return;
  }
  if (ev.target.id === "listen-rate") {
    try { localStorage.setItem("pw.listen.rate", ev.target.value); } catch (e) { /* ignore */ }
    if (LISTEN.on && !LISTEN.paused) speakNow();
  }
});

document.addEventListener("click", (ev) => {
  if (!ev.target.closest) return;
  if (ev.target.closest("#listen-btn")) { LISTEN.on ? stopListening() : startListening(); return; }
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
  if (t) {
    const p = t.closest("tr").dataset.person;
    if (LISTEN.on && !LISTEN.paused) togglePause();
    const v = voiceFor(p);
    synth().cancel();
    const ut = new SpeechSynthesisUtterance(p === NARRATOR ? "I am the narrator." : `I am ${p.replace(/ \(.*\)$/, "")}.`);
    if (v.voice) { ut.voice = v.voice; ut.lang = v.voice.lang; }
    ut.pitch = v.pitch; ut.rate = v.rate * speed();
    synth().speak(ut);
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
  if (!listenAvailable()) { const b = $("#listen-btn"); if (b) b.hidden = true; return; }
  synth().getVoices(); // Chrome and Edge load their voices after the first ask
  synth().addEventListener?.("voiceschanged", () => { if (LISTEN.persons_here) castWork(LISTEN.persons_here); });
  try { LISTEN.persons = await api("people"); } catch (e) { LISTEN.persons = {}; }
})();
