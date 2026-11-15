// Proclus' Theology of Plato in a real browser: the Workshop's modern English, made from Taylor's English, with his
// English a tap away or side by side, the contents of all six books, and a sentence marked, on the iPad's sizes.
// Run by tests/test_modern_theology.py against a running tools/serve.py:
//   node tests/modern_theology_browser.js <port> [screenshot.png]
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
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); localStorage.removeItem("pw.nmMode"); } catch (e) { /* */ } });
  const tag = `${viewport.width}×${viewport.height}`;
  const wide = async (what) => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(w <= 1, `${tag}: ${what} fits the screen (${w}px over)`);
  };

  // The Library links to it, on the Neoplatonists' shelf.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-theology");
  check(/Theology of Plato/.test(await p.$eval("#lib-theology", (e) => e.innerText)), `${tag}: the Library names the Theology of Plato`);
  await p.click('#lib-theology a[href="#neo-modern/proclus-theology"]');
  await p.waitForSelector(".tg-mod");

  // Modern English, labelled, with a summary of the book and of each chapter, and no Greek (there is none yet).
  const head = await p.$eval(".tg-read", (e) => e.innerText);
  check(/Modern English, the Workshop's own/.test(head) && /machine-assisted/i.test(head) && /not yet checked by a scholar/.test(head), `${tag}: labelled as the Workshop's own and machine-assisted`);
  check(/Made from Thomas Taylor's translation \(1816\)/.test(head), `${tag}: says it is made from Taylor's English`);
  check(await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 108, `${tag}: each of the hundred and eight chapters has its gist`);
  check(await p.$eval("#mc-I\\.1 h4", (e) => /^Book I, chapter 1\./.test(e.textContent)), `${tag}: chapters are named by book and chapter`);
  check(await p.$eval("#mp-I\\.1\\.p1 .mp-text", (e) => /^Pericles, dearest of my friends/.test(e.textContent)), `${tag}: the modern English of I.1`);
  check(await p.$$eval(".tg-mod .mp-greek", (es) => es.length) === 0, `${tag}: no Greek box, since there is no Greek yet`);
  check(await p.$$eval(".tg-mod .mp-flag", (es) => es.length) >= 160, `${tag}: flags quoting Taylor`);
  check(await p.$$eval(".tg-mod .tm-en", (es) => es.length) > 20, `${tag}: key words are underlined for the Term tab`);
  check(/henads/.test(await p.$eval("#mp-I\\.3\\.p3", (e) => e.textContent)), `${tag}: Taylor's "unities" are henads`);
  await wide("the Theology in modern English");

  // The contents of all six books, those to come named by Taylor's headings.
  check(/Book VI/.test(await p.$eval("#toc", (e) => e.innerText)), `${tag}: the contents column lists all six books`);
  check(await p.$$eval(".enn-all .enn-here", (es) => es.length) === 108 && await p.$$eval(".enn-all .enn-later", (es) => es.length) === 61, `${tag}: all six books, Books I-IV done (61 chapters to come)`);

  // Taylor's English of a chapter, one tap away, with his notes.
  await p.click("#mc-I\\.1 [data-tg-tay]");
  check(await p.$eval("#mc-I\\.1 .tg-tay-box", (e) => !e.hidden && /O Pericles, to me the dearest of friends/.test(e.textContent) && /Taylor's notes \(3\)/.test(e.textContent)),
    `${tag}: one tap shows Taylor's English of the chapter, with his notes`);

  // Side by side.
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(await p.$$eval(".tg-tcol", (es) => es.length) === 108, `${tag}: side by side, Taylor beside every chapter`);
  if (viewport.width >= 1024) {
    const cols = await p.$eval("#mc-I\\.1 .tg-cols", (e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    check(cols.length === 2 && cols[1] > cols[0] + 100, `${tag}: in two columns`);
  }
  await wide("side by side");
  if (shots && first) {
    await p.evaluate(() => { document.getElementById("mc-I.3").scrollIntoView(); window.scrollBy(0, -80); });
    await p.screenshot({ path: shots, fullPage: false });
  }
  await p.click('[data-nm-mode="modern"]');
  await p.waitForSelector(".mod-modern");

  // Mark a sentence; it is listed in the contents column, and kept after a reload.
  if (first) {
    await p.click("#mp-I\\.2\\.p1 [data-mp-mark]");
    await p.click('#mp-I\\.2\\.p1 .ms[data-k="1"]');
    await p.click('#mp-I\\.2\\.p1 [data-mk-save="reads badly"]');
    await p.waitForSelector("#mp-I\\.2\\.p1 .ms-marked");
    check(/Your marks \(1\)/i.test(await p.$eval("#toc", (e) => e.textContent)), `${tag}: the mark is listed in the contents column`);
    await p.reload();
    await p.waitForSelector(".tg-mod");
    check(await p.$$eval("#mp-I\\.2\\.p1 .ms-marked", (es) => es.length) === 1, `${tag}: the mark is kept`);
  }

  // A chapter opens at its place.
  await p.goto(base + "#neo-modern/proclus-theology/I.7");
  await p.waitForSelector("#mc-I\\.7");
  check(await p.$eval("#mc-I\\.7", (e) => Math.abs(e.getBoundingClientRect().top) < 200), `${tag}: a chapter's link opens at the chapter`);
  check(errors.length === 0, `${tag}: no errors on the page (${errors.join("; ")})`);
  await p.close();
}

(async () => {
  const b = await chromium.launch();
  try {
    await run(b, { width: 1180, height: 820 }, true, true);     // iPad Air, landscape
    await run(b, { width: 820, height: 1180 }, true, false);    // iPad Air, portrait
    await run(b, { width: 390, height: 844 }, true, false);     // a phone
  } finally {
    await b.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
