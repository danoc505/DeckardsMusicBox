// Milestone 14 in a real browser: the reader reads the English aloud, a voice per person.
// Run by tests/test_listen.py against a running tools/serve.py:  node tests/listen_browser.js <port>
// The browser's speech is replaced by a stand-in that records what it is asked to say,
// with six voices: four English, one of Apple's novelty voices, and one French.
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;

function stub() {
  const voices = [
    { name: "Daniel", lang: "en-GB", voiceURI: "v-daniel" },
    { name: "Karen", lang: "en-AU", voiceURI: "v-karen" },
    { name: "Moira", lang: "en-IE", voiceURI: "v-moira" },
    { name: "Samantha", lang: "en-US", voiceURI: "v-samantha" },
    { name: "Bells", lang: "en-US", voiceURI: "v-bells" },
    { name: "Thomas", lang: "fr-FR", voiceURI: "v-thomas" },
  ];
  window.__spoken = [];
  window.__auto = false;
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.pitch = 1; this.rate = 1; } };
  const s = {
    getVoices: () => voices,
    speak(u) {
      const who = document.querySelector("#listen-who").textContent;
      const p = document.querySelector("#main .speaking");
      window.__spoken.push({ text: u.text, voice: u.voice && u.voice.name, pitch: u.pitch, rate: u.rate, who, highlighted: !!p, page: document.querySelector("#jump-ref").value });
      if (window.__auto) setTimeout(() => u.onend && u.onend(), 0);
    },
    cancel() {}, pause() {}, resume() {}, addEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: s, configurable: true });
}

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

const person = (r) => r.who.split(" · ")[1];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => check(false, "no script error: " + e.message));
  await page.addInitScript(stub);
  await page.goto(base + "#euthyphro/2a");
  await page.waitForSelector("#main .sec");
  await page.evaluate(() => { localStorage.removeItem("pw.voices"); localStorage.removeItem("pw.listen.rate"); });
  await page.waitForTimeout(300);

  await page.click("#listen-btn");
  let sp = await page.evaluate(() => window.__spoken);
  check(sp.length === 1, "one tap starts the speech at once (the iPad rule)");
  check(sp[0].highlighted, "the paragraph being read is highlighted");
  check(await page.isVisible("#listen-bar"), "the player shows Pause, Back, Next and Speed");

  // Pause stops; Resume says the sentence again.
  await page.click("#listen-pause");
  check((await page.textContent("#listen-pause")).trim() === "Resume", "Pause becomes Resume");
  await page.click("#listen-pause");
  sp = await page.evaluate(() => window.__spoken);
  check(sp.length === 2 && sp[1].text === sp[0].text, "Resume starts the same sentence again");
  await page.click('[data-listen="next"]');
  sp = await page.evaluate(() => window.__spoken);
  check(sp.length === 3 && sp[2].text !== sp[1].text, "Next skips to the next paragraph");
  await page.click('[data-listen="prev"]');
  sp = await page.evaluate(() => window.__spoken);
  check(sp[3].text === sp[1].text, "Back goes to the paragraph before");

  // Speed.
  await page.selectOption("#listen-rate", "1.5");
  sp = await page.evaluate(() => window.__spoken);
  const last = sp[sp.length - 1];
  check(Math.abs(last.rate / sp[0].rate - 1.5) < 0.01, "Speed 1.5× speaks half as fast again");
  await page.selectOption("#listen-rate", "1");

  // Read on through the pages.
  await page.evaluate(() => { window.__auto = true; window.__spoken = []; });
  await page.click('[data-listen="next"]');
  await page.waitForFunction(() => window.__spoken.length > 150 || !document.body.classList.contains("listening"), null, { timeout: 60000 });
  sp = await page.evaluate(() => window.__spoken);
  await page.click('[data-listen="stop"]').catch(() => {});
  const pages = new Set(sp.map((r) => r.page));
  check(pages.size > 1, `it carries on across Stephanus pages (${[...pages].join(", ")})`);
  check(sp.every((r) => r.highlighted), "every paragraph is highlighted as it is read");

  const voiceOf = (rows) => {
    const m = new Map();
    for (const r of rows) {
      const k = `${r.voice}/${r.pitch}`;
      if (!m.has(person(r))) m.set(person(r), new Set());
      m.get(person(r)).add(k);
    }
    return m;
  };
  const euth = voiceOf(sp);
  check(euth.has("Socrates") && euth.has("Euthyphro"), "Socrates and Euthyphro are both heard");
  check([...euth.values()].every((s) => s.size === 1), "each person keeps one voice all through");
  const soc = [...euth.get("Socrates")][0];
  check(soc !== [...euth.get("Euthyphro")][0], "Socrates and Euthyphro have different voices");
  check(sp.every((r) => r.voice && r.voice !== "Bells" && r.voice !== "Thomas"), "only ordinary English voices are used");

  // Another dialogue: Socrates has the same voice.
  await page.evaluate(() => { location.hash = "#crito/43a"; });
  await page.waitForFunction(() => document.querySelector("#work-select").value === "tlg003" && document.querySelector("#main .sec"));
  check(!(await page.evaluate(() => document.body.classList.contains("listening"))), "going elsewhere stops the reading");
  await page.evaluate(() => { window.__spoken = []; });
  await page.click("#listen-btn");
  await page.waitForFunction(() => window.__spoken.length > 40 || !document.body.classList.contains("listening"), null, { timeout: 60000 });
  sp = await page.evaluate(() => window.__spoken);
  await page.click('[data-listen="stop"]').catch(() => {});
  const crito = voiceOf(sp);
  check(crito.has("Socrates") && [...crito.get("Socrates")][0] === soc, "Socrates has the same voice in the Crito as in the Euthyphro");
  check(crito.has("Crito") && [...crito.get("Crito")][0] !== soc, "Crito's voice is not Socrates'");

  // Choosing a voice is remembered.
  await page.evaluate(() => { window.__auto = false; });
  await page.click("#listen-btn");
  await page.click('[data-listen="voices"]');
  const row = page.locator('#voices-body tr[data-person="Socrates"]');
  await row.locator("[data-voice]").selectOption("v-moira");
  await row.locator("[data-variant]").selectOption("1");
  await page.evaluate(() => document.querySelector("#voices-dialog").close());
  await page.evaluate(() => { window.__spoken = []; window.__auto = true; });
  await page.click('[data-listen="next"]');
  await page.waitForFunction(() => window.__spoken.length > 30 || !document.body.classList.contains("listening"), null, { timeout: 60000 });
  sp = await page.evaluate(() => window.__spoken);
  await page.click('[data-listen="stop"]').catch(() => {});
  const chosen = sp.filter((r) => person(r) === "Socrates");
  check(chosen.length && chosen.every((r) => r.voice === "Moira" && r.pitch === 0.8), "a voice chosen for Socrates is used and remembered");

  // A narrated dialogue: the Republic is told by Socrates.
  await page.evaluate(() => { location.hash = "#republic/327a"; window.__spoken = []; window.__auto = false; });
  await page.waitForFunction(() => document.querySelector("#work-select").value === "tlg030" && document.querySelector("#main .sec"));
  await page.click("#listen-btn");
  sp = await page.evaluate(() => window.__spoken);
  check(sp.length === 1 && person(sp[0]) === "Socrates", "the Republic is read in Socrates' voice, its narrator");
  await page.click('[data-listen="stop"]');

  // Who is speaking, in the other translations' labels and across the dialogues.
  const r = await page.evaluate(() => {
    const st = ["Socrates", "Stranger", "Theodorus", "Younger Socrates"];
    return {
      young: speakerFromLabel("YOUNG SOCRATES", st), soc: speakerFromLabel("Soc.", st), guest: speakerFromLabel("Guest", st),
      vol: speakerFromLabel("VOL", ["Athenian", "Clinias", "Megillus", "Cleinias"]),
      laws: personOf(speakerFromLabel("CLEINIAS", ["Athenian", "Clinias", "Megillus", "Cleinias"]), "tlg034"),
      epin: personOf("Cleinias", "tlg035"), euthd: personOf("Cleinias", "tlg021"),
      pair: personOf("Lysis #Menexenus", "tlg020") === personOf("Menexenus #Lysis", "tlg020"),
      friends: personOf("Friend", "tlg015") !== personOf("Friend", "tlg022"),
      parm: personOf("Cephalos", "tlg009") === personOf("Cephalus", "tlg009"),
    };
  });
  check(r.young === "Younger Socrates" && r.soc === "Socrates" && r.guest === "Stranger", "Jowett's and Taylor's labels are read as the Loeb's speakers");
  check(r.vol === null, "a label that names no speaker (an OCR running head) is not a new voice");
  check(r.laws === "Clinias of Crete" && r.epin === "Clinias of Crete" && r.euthd === "Cleinias, son of Axiochus", "the Cretan Clinias is one person in the Laws and Epinomis, and not the Cleinias of the Euthydemus");
  check(r.pair && r.friends && r.parm, "joint speakers, unnamed friends and the two spellings of Cephalus");

  // One voice on the device: the persons are told apart by pitch and pace.
  const few = await page.evaluate(() => {
    localStorage.removeItem("pw.voices");
    const v = [{ name: "Daniel", lang: "en-GB", voiceURI: "v-daniel" }];
    speechSynthesis.getVoices = () => v;
    const c = castWork(["(narrator)", "A", "B", "C"]);
    return ["(narrator)", "A", "B", "C"].map((p) => `${c[p].uri}#${c[p].variant}`);
  });
  check(new Set(few).size === 4, "with one voice, four persons still sound different (" + few.join(", ") + ")");

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
