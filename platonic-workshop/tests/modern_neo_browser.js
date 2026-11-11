// Milestone 27 in a real browser: Plotinus in the Workshop's modern English, made from the Greek, with Taylor's
// English and the Greek a tap away, side by side, and a sentence marked, on the iPad's sizes.
// Run by tests/test_modern_neo.py against a running tools/serve.py:
//   node tests/modern_neo_browser.js <port> [screenshot.png]
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;
const shots = process.argv[3] || "";

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

async function run(b, viewport, touch, first) {
  const p = await b.newPage({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); localStorage.removeItem("pw.tgAll"); localStorage.removeItem("pw.tgMode"); } catch (e) { /* */ } });
  const tag = `${viewport.width}×${viewport.height}`;
  const wide = async (what) => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(w <= 1, `${tag}: ${what} fits the screen (${w}px over)`);
  };

  // The Library names the treatises in modern English under Taylor's Plotinus.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-taylor-greek");
  const shelf = await p.$eval("#lib-taylor-greek", (e) => e.innerText);
  check(/modern English/.test(shelf) && /I\.2 On the virtues/.test(shelf) && /I\.3 On dialectic/.test(shelf) && /VI\.9 On the good, or the One/.test(shelf), `${tag}: the Library lists the treatises in modern English`);
  await p.click('#lib-taylor-greek a[href="#neo-en/taylor-plotinus/0"]');
  await p.waitForSelector(".tg-mod");

  // Modern English by default, labelled, with a summary of the treatise and of each chapter.
  const head = await p.$eval(".tg-read", (e) => e.innerText);
  check(/Modern English, the Workshop's own/.test(head) && /machine-assisted/i.test(head) && /not yet checked by a scholar/.test(head), `${tag}: labelled as the Workshop's own and machine-assisted`);
  check(/The treatise in short/i.test(head), `${tag}: the treatise has a summary`);
  check(await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 7, `${tag}: each of the seven chapters has its gist`);
  check(await p.$eval("#mp-I\\.2\\.1\\.p1 .mp-text", (e) => /^Evils are here/.test(e.textContent)), `${tag}: the modern English of I.2.1`);
  check(await p.$eval('[data-tg-mode="modern"]', (e) => e.getAttribute("aria-pressed") === "true"), `${tag}: Modern English is chosen`);
  check(await p.$$eval(".tg-mod .mp-flag", (es) => es.length) >= 10, `${tag}: flags where Taylor and the Greek differ`);
  check(await p.$$eval(".tg-mod .tm-en", (es) => es.length) > 20, `${tag}: key words are underlined for the Term tab`);
  await wide("a treatise in modern English");

  // The Greek of a paragraph, its words tappable.
  await p.click("#mp-I\\.2\\.1\\.p1 .mp-greek summary");
  check(await p.$eval("#mp-I\\.2\\.1\\.p1 .mp-greek", (e) => e.open && /Ἐπειδὴ τὰ κακὰ/.test(e.textContent)), `${tag}: one tap opens the Greek of the paragraph`);
  const box = await p.$eval("#mp-I\\.2\\.1\\.p1 .mp-greek .neo-tei", (e) => { const r = e.getBoundingClientRect(); return { x: r.left + 20, y: r.top + 10 }; });
  await p.mouse.click(box.x, box.y);
  await p.waitForSelector(".gloss-pop", { timeout: 15000 }).then(() => check(true, `${tag}: a Greek word there opens its meaning`),
    () => check(false, `${tag}: a Greek word there opens its meaning`));
  await p.keyboard.press("Escape");

  // Taylor's English of the chapter, one tap away.
  await p.click("#tg-0 [data-tg-tay]");
  check(await p.$eval("#tg-0 .tg-tay-box", (e) => !e.hidden && /Since evils are here/.test(e.textContent)), `${tag}: one tap shows Taylor's English of the chapter`);
  // The Greek of the whole chapter, as in milestone 26.
  await p.click("#tg-0 [data-tg-greek]");
  check(await p.$eval("#tg-0 .tg-greek", (e) => !e.hidden && /Ἐπειδὴ τὰ κακὰ/.test(e.textContent)), `${tag}: and the Greek of the whole chapter`);

  // Side by side.
  await p.click('[data-tg-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(await p.$$eval(".tg-tcol", (es) => es.length) === 7, `${tag}: side by side, Taylor beside every chapter`);
  if (viewport.width >= 1024) {
    const cols = await p.$eval("#tg-0 .tg-cols", (e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    check(cols.length === 2 && cols[1] > cols[0] + 100, `${tag}: in two columns`);
  }
  await wide("side by side");
  if (shots && first) {
    await p.evaluate(() => { document.getElementById("tg-2").scrollIntoView(); window.scrollBy(0, -100); });
    await p.screenshot({ path: shots, fullPage: false });
  }
  // Taylor only, as before, saying the modern English is there.
  await p.click('[data-tg-mode="taylor"]');
  await p.waitForSelector(".tg-ch p");
  check(await p.$eval(".tg-ch p", (e) => /Since evils are here/.test(e.textContent)), `${tag}: Taylor only shows his English`);
  check(/also in modern English/.test(await p.$eval(".tg-read", (e) => e.innerText)), `${tag}: and says the modern English is there`);
  await p.click('[data-tg-mode="modern"]');
  await p.waitForSelector(".tg-mod");

  // Mark a sentence; it is listed in the contents column, and kept after a reload.
  if (first) {
    await p.click("#mp-I\\.2\\.2\\.p1 [data-mp-mark]");
    await p.click('#mp-I\\.2\\.2\\.p1 .ms[data-k="2"]');
    await p.fill("#mp-I\\.2\\.2\\.p1 .mk-comment", "say it more plainly");
    await p.click('#mp-I\\.2\\.2\\.p1 [data-mk-save="reads badly"]');
    await p.waitForSelector("#mp-I\\.2\\.2\\.p1 .ms-marked");
    check(/Your marks \(1\)/.test(await p.$eval("#toc", (e) => e.innerText)), `${tag}: the mark is listed in the contents column`);
    await p.reload();
    await p.waitForSelector(".tg-mod");
    check(await p.$$eval("#mp-I\\.2\\.2\\.p1 .ms-marked", (es) => es.length) === 1, `${tag}: the mark is kept`);
  }

  // From the Greek text to the modern English of a chapter.
  await p.goto(base + "#neo/plotinus-enneads/1");
  await p.waitForSelector(".tg-back a");
  const links = await p.$$eval("#neo-1\\.2\\.3 .tg-back a", (es) => es.map((e) => [e.textContent, e.getAttribute("href")]));
  check(links.some(([t, h]) => t === "I.2.3" && /^#neo-en\/taylor-plotinus\/0\/2$/.test(h)), `${tag}: the Greek links to the modern English of the chapter`);

  // On Dialectic.
  await p.goto(base + "#neo-en/taylor-plotinus/1");
  await p.waitForSelector(".tg-mod");
  check(await p.$eval(".tg-read h2", (e) => /Ennead I\.3/.test(e.textContent)) && await p.$$eval(".tg-mod", (es) => es.length) === 6, `${tag}: On Dialectic, six chapters`);
  // The last of Taylor's Plotinus, VI.9, in modern English too: eleven chapters, though the scan runs
  // Taylor's 7 and 8 together.
  await p.goto(base + "#neo-en/taylor-plotinus/14");
  await p.waitForSelector(".tg-mod");
  check(await p.$eval(".tg-read h2", (e) => /Ennead VI\.9/.test(e.textContent)) && await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 11, `${tag}: On the good, eleven chapters`);
  // A work with no modern English is Taylor's, as before.
  await p.goto(base + "#neo-en/taylor-mysteries/0");
  await p.waitForSelector(".tg-ch");
  check(await p.$$eval(".tg-mod", (es) => es.length) === 0 && await p.$$eval("[data-tg-mode]", (es) => es.length) === 0, `${tag}: a work with no modern English shows Taylor alone`);
  check(errors.length === 0, `${tag}: no script errors (${errors.join("; ")})`);
  await p.close();
}

(async () => {
  const b = await chromium.launch();
  try {
    const sizes = [[{ width: 1024, height: 768 }, true], [{ width: 768, height: 1024 }, true], [{ width: 1440, height: 900 }, false]];
    for (let i = 0; i < sizes.length; i++) await run(b, sizes[i][0], sizes[i][1], i === 0);
  } finally {
    await b.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
