// Milestone 24 in a real browser: the modern English beside Taylor's words, on the iPad's sizes.
// Run by tests/test_modern.py against a running tools/serve.py:  node tests/modern_browser.js <port>
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

async function run(b, viewport, touch, k) {
  const p = await b.newPage({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); } catch (e) { /* */ } });
  const tag = `${viewport.width}×${viewport.height}`;
  await p.goto(base + "#taylor/general-introduction");
  await p.waitForSelector(".modern-text .mp");

  const n = await p.$$eval(".modern-text .mp", (es) => es.length);
  check(n === 178, `${tag}: all 178 paragraphs of the Introduction in modern English (${n})`);
  const label = await p.$eval(".mod-label", (e) => e.innerText);
  check(/the Workshop's own/.test(label) && /machine-assisted/i.test(label) && /not yet checked/.test(label), `${tag}: labelled as the Workshop's own and machine-assisted`);
  const sum = await p.$eval(".ms-sum", (e) => e.innerText);
  check(/Hierocles/.test(sum), `${tag}: the first section opens with its summary`);
  const wide = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(wide <= 1, `${tag}: nothing wider than the screen (${wide}px over)`);

  // Taylor's words, one tap away.
  const first = ".modern-text .mp:nth-of-type(1)";
  check(!(await p.isVisible(`#mp-taylor1804\\.general-introduction\\.text\\.p0002 .mp-tay`)), `${tag}: Taylor's words are folded away at first`);
  await p.click(`#mp-taylor1804\\.general-introduction\\.text\\.p0002 [data-mp-taylor]`);
  const tay = await p.$eval(`#mp-taylor1804\\.general-introduction\\.text\\.p0002 .mp-tay`, (e) => getComputedStyle(e).display !== "none" && e.innerText);
  check(tay && /luminous pyramid/.test(tay), `${tag}: one tap shows Taylor's own words`);
  void first;

  // A key word opens the Term tab.
  const term = `#mp-taylor1804\\.general-introduction\\.text\\.p0007 .tm-en[data-term="intellect"]`;
  check(await p.$(term) !== null, `${tag}: "intellect" is underlined as a key term`);
  await p.click(term);
  await p.waitForFunction(() => !document.getElementById("pane-term").hidden && /ntellect/.test(document.getElementById("pane-term").innerText), null, { timeout: 15000 });
  const shown = await p.$eval("#inspector", (e) => getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 100);
  check(shown, `${tag}: tapping it opens the Term tab`);
  if (touch && viewport.width < 861) { await p.click("#panel-hide").catch(() => {}); }

  // A hard place carries a flag with Taylor's words.
  const flag = await p.$eval(`#mp-taylor1804\\.general-introduction\\.text\\.p0047 .mp-flag`, (e) => e.innerText);
  check(/Hard or disputed/.test(flag) && /Taylor's words/.test(flag), `${tag}: a disputed place is flagged with Taylor's words`);

  // Mark a sentence.
  const seg = ["p0003", "p0006", "p0011", "p0029", "p0040"][k];
  const blk = `#mp-taylor1804\\.general-introduction\\.text\\.${seg}`;
  await p.click(`${blk} [data-mp-mark]`);
  await p.click(`${blk} .ms[data-k="0"]`);
  check(await p.isVisible(`${blk} .mp-markbox`), `${tag}: tapping a sentence opens the mark box`);
  await p.fill(`${blk} .mk-comment`, "test mark");
  await p.click(`${blk} [data-mk-save="reads badly"]`);
  await p.waitForSelector(`${blk} .ms.ms-marked`);
  const toc = await p.$eval("#toc", (e) => e.innerText);
  check(/Your marks \(\d+\)/i.test(toc), `${tag}: the mark is listed in the contents column`);
  await p.reload();
  await p.waitForSelector(`${blk} .ms.ms-marked`, { timeout: 15000 }).then(() => check(true, `${tag}: the mark is kept`), () => check(false, `${tag}: the mark is kept`));

  // Side by side.
  await p.click('[data-mod-mode="both"]');
  const both = await p.$eval(`${blk} .mp-tay`, (e) => getComputedStyle(e).display !== "none");
  check(both, `${tag}: side by side shows Taylor's words under or beside every paragraph`);
  const wide2 = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(wide2 <= 1, `${tag}: side by side fits the screen (${wide2}px over)`);
  await p.click('[data-mod-mode="modern"]');

  // The Life, from the Greek.
  await p.goto(base + "#taylor/olympiodorus-life");
  await p.waitForSelector(".modern-text .mp.mp-extra");
  const ex = await p.$eval(".modern-text .mp.mp-extra", (e) => e.innerText);
  check(/Not in Taylor/i.test(ex) && /Aristotle/.test(ex), `${tag}: the Life opens with the paragraph Taylor leaves out, marked as not in Taylor`);
  const lab = await p.$eval(".mod-label", (e) => e.innerText);
  check(/Greek/.test(lab), `${tag}: the Life is labelled as made from the Greek`);
  check(errors.length === 0, `${tag}: no script errors (${errors.join("; ")})`);
  await p.close();
}

(async () => {
  const b = await chromium.launch();
  try {
    const sizes = [[{ width: 1024, height: 768 }, true], [{ width: 768, height: 1024 }, true], [{ width: 1180, height: 820 }, true],
      [{ width: 820, height: 1180 }, true], [{ width: 1440, height: 900 }, false]];
    for (let k = 0; k < sizes.length; k++) await run(b, sizes[k][0], sizes[k][1], k);
  } finally {
    await b.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
