// Milestone 26 in a real browser: Taylor's English with the Greek one tap away, and back from the Greek,
// on the iPad's sizes. Run by tests/test_taylor_greek.py against a running tools/serve.py:
//   node tests/taylor_greek_browser.js <port>
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;
const shots = process.argv[3] || "";

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

async function run(b, viewport, touch) {
  const p = await b.newPage({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); localStorage.removeItem("pw.tgAll"); localStorage.setItem("pw.tgMode", "taylor"); } catch (e) { /* */ } });
  const tag = `${viewport.width}×${viewport.height}`;
  const wide = async (what) => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(w <= 1, `${tag}: ${what} fits the screen (${w}px over)`);
  };

  // The Library lists Taylor's three translations under the Neoplatonists.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-taylor-greek");
  const shelf = await p.$eval("#lib-taylor-greek", (e) => e.innerText);
  check(/Plotinus/.test(shelf) && /Mysteries/.test(shelf) && /Elements of Theology/.test(shelf), `${tag}: the Library lists Taylor's three translations`);

  // Plotinus: contents, with how the matching was made.
  await p.click('#lib-taylor-greek a[href="#neo-en/taylor-plotinus"]');
  await p.waitForSelector(".neo-contents");
  const head = await p.$eval(".neo-text", (e) => e.innerText);
  check(/chapter n is the Greek chapter n/.test(head) && /Volkmann/.test(head), `${tag}: the contents say how the chapters are matched`);
  await wide("the contents");

  // A treatise: Taylor's English, and the Greek one tap away, with a word's meaning one more tap away.
  await p.click(".neo-contents li:nth-child(1) a");
  await p.waitForSelector(".tg-ch");
  check(await p.$eval(".tg-read h2", (e) => /Ennead I\.2/.test(e.textContent)), `${tag}: On the Virtues is Ennead I.2`);
  check(await p.$eval(".tg-ch p", (e) => /Since evils are here/.test(e.textContent)), `${tag}: Taylor's English of the first chapter`);
  check(await p.$eval(".tg-ch .tg-greek", (e) => e.hidden), `${tag}: the Greek is folded until asked for`);
  await p.click(".tg-ch [data-tg-greek]");
  check(await p.$eval(".tg-ch .tg-greek", (e) => !e.hidden && /Ἐπειδὴ τὰ κακὰ/.test(e.textContent)), `${tag}: one tap opens the Greek of the chapter`);
  check(await p.$eval(".tg-ch [data-tg-greek]", (e) => e.getAttribute("aria-expanded") === "true"), `${tag}: the button says the Greek is open`);
  const box = await p.$eval(".tg-ch .tg-greek .neo-tei", (e) => { const r = e.getBoundingClientRect(); return { x: r.left + 20, y: r.top + 10 }; });
  await p.mouse.click(box.x, box.y);
  await p.waitForSelector(".gloss-pop", { timeout: 15000 }).then(() => check(true, `${tag}: a Greek word there opens its meaning`),
    () => check(false, `${tag}: a Greek word there opens its meaning`));
  await p.keyboard.press("Escape");
  await p.click(".tg-read [data-tg-all]");
  check(await p.$$eval(".tg-greek", (es) => es.every((e) => !e.hidden)), `${tag}: All the Greek opens it under every chapter`);
  await p.click(".tg-read [data-tg-all]");
  check(await p.$$eval(".tg-greek", (es) => es.every((e) => e.hidden)), `${tag}: and folds it again`);
  check(/Ϊ, 2|I\. ?2/.test(await p.$eval(".tg-evidence", (e) => e.textContent)), `${tag}: the treatise's evidence quotes Taylor's list`);
  await wide("a treatise");
  if (shots && viewport.width === 1024) {
    await p.click(".tg-ch:nth-of-type(2) [data-tg-greek]").catch(() => {});
    await p.screenshot({ path: shots, fullPage: false });
  }

  // From the Greek, back to Taylor's English.
  await p.goto(base + "#neo/plotinus-enneads/1");
  await p.waitForSelector(".tg-back a");
  await p.click(".tg-back a");
  await p.waitForSelector(".tg-ch");
  check(/#neo-en\/taylor-plotinus\/0\/0$/.test(await p.evaluate(() => location.hash)), `${tag}: the Greek links to Taylor's English of the same chapter`);
  check(await p.$eval("#tg-0 .tg-greek", (e) => !e.hidden), `${tag}: and opens it with the Greek beside`);
  // ... and from Taylor's chapter to its place in the Greek text.
  await p.click("#tg-0 .tg-greek .neo-unit-n a");
  await p.waitForSelector(".neo-here");
  check(await p.$eval(".neo-here", (e) => e.id === "neo-1.2.1"), `${tag}: the Greek's label opens the Greek text at the chapter`);

  // On the Mysteries: section and chapter.
  await p.goto(base + "#neo-en/taylor-mysteries/2");
  await p.waitForSelector(".tg-ch");
  check(await p.$eval(".tg-read h2", (e) => /Section III/.test(e.textContent)), `${tag}: On the Mysteries, Section III`);
  check(await p.$$eval(".tg-ch", (es) => es.length) >= 29, `${tag}: its chapters`);

  // The Elements: the labels, and a proposition not placed shows the pages it lies on.
  await p.goto(base + "#neo-en/taylor-elements/0");
  await p.waitForSelector(".tg-ch");
  const labels = await p.$$eval(".tg-how", (es) => es.map((e) => e.textContent));
  check(labels.includes("number found") && labels.includes("machine-matched") && labels.includes("not placed"), `${tag}: each proposition says how it was matched`);
  await p.click("#tg-1 [data-tg-greek]");
  check(await p.$eval("#tg-1 .tg-greek", (e) => /could not be found/.test(e.textContent) && !!e.querySelector('a[href^="#neo/proclus-elements/"]')),
    `${tag}: a proposition not placed links the pages it lies on`);
  await p.click("#tg-5 [data-tg-greek]");
  check(await p.$eval("#tg-5 .tg-greek", (e) => /Πᾶν πλῆϑος ἢ ἐξ ἡνωμένων/.test(e.textContent)), `${tag}: Proposition 6, found by Creuzer's number, shows its Greek`);
  await wide("the Elements");
  check(errors.length === 0, `${tag}: no script errors (${errors.join("; ")})`);
  await p.close();
}

(async () => {
  const b = await chromium.launch();
  try {
    const sizes = [[{ width: 1024, height: 768 }, true], [{ width: 768, height: 1024 }, true], [{ width: 1440, height: 900 }, false]];
    for (const [v, t] of sizes) await run(b, v, t);
  } finally {
    await b.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
