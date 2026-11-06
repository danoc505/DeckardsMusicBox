// Milestone 25 in a real browser: the Neoplatonists' shelf, a text's contents, and reading a part,
// on the iPad's sizes. Run by tests/test_neoplatonists.py against a running tools/serve.py:
//   node tests/neo_browser.js <port>
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

async function run(b, viewport, touch) {
  const p = await b.newPage({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); } catch (e) { /* */ } });
  const tag = `${viewport.width}×${viewport.height}`;
  const wide = async (what) => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(w <= 1, `${tag}: ${what} fits the screen (${w}px over)`);
  };

  // The shelf in the Library.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-neo");
  const shelf = await p.$eval("#lib-neo", (e) => e.innerText);
  check(/Plotinus/.test(shelf) && /Damascius/.test(shelf) && /Hermias/.test(shelf) && /Olympiodorus/.test(shelf), `${tag}: the shelf lists the Neoplatonists`);
  check(/Not here yet/.test(shelf), `${tag}: the shelf says what is not here`);

  // A text's contents, with its edition and licence.
  await p.click('#lib-neo a[href="#neo/proclus-parmenides"]');
  await p.waitForSelector(".neo-contents");
  const head = await p.$eval(".neo-text", (e) => e.innerText);
  check(/Cousin/.test(head) && /Public Domain/i.test(head), `${tag}: the contents name the edition and quote its licence`);
  check(/OCR, as received/.test(head), `${tag}: the OCR is labelled as received`);
  await wide("the contents");

  // Reading a part: pages, a link to the scan, the three readings.
  await p.click(".neo-contents li:nth-child(5) a");
  await p.waitForSelector(".neo-page");
  check(await p.$$eval(".neo-page", (es) => es.length) >= 5, `${tag}: a part shows its pages`);
  check(await p.$eval(".neo-page-head a", (e) => /archive\.org\/details\//.test(e.href)), `${tag}: each page links to its scan`);
  check(await p.$eval("#toc", (e) => !!e.querySelector(".neo-toc li.on")), `${tag}: the contents column marks the part being read`);
  const shown = await p.$$eval(".neo-ocr", (es) => es.map((e) => e.textContent).join("\n").length);
  await p.click('[data-neo-mode="received"]');
  const received = await p.$$eval(".neo-ocr", (es) => es.map((e) => e.textContent).join("\n").length);
  check(received >= shown, `${tag}: the OCR as received has every line (${received} ≥ ${shown})`);
  await p.click('[data-neo-mode="corrected"]');
  check(await p.$$eval("ins.neo-corr", (es) => es.length) > 0, `${tag}: with corrections, the corrected words are marked`);
  check(await p.$(".neo-corrections td") !== null, `${tag}: the corrections are listed beside the page`);
  await p.click('[data-neo-mode="shown"]');
  check(await p.$$eval("ins.neo-corr", (es) => es.length) === 0, `${tag}: as shown, nothing is corrected`);
  await wide("a part");

  // Next part.
  await p.click(".neo-nav a:last-child");
  await p.waitForFunction(() => /#neo\/proclus-parmenides\/5$/.test(location.hash));
  check(true, `${tag}: next part`);

  // A corrected text: Plotinus, with a Greek word's meaning one tap away.
  await p.goto(base + "#neo/plotinus-enneads/53");
  await p.waitForSelector(".neo-unit");
  const pl = await p.$eval(".neo-read", (e) => e.innerText);
  check(/VI\.9\.1/.test(pl), `${tag}: the last treatise of the Enneads`);
  const box = await p.$eval(".neo-tei", (e) => { const r = e.getBoundingClientRect(); return { x: r.left + 20, y: r.top + 10 }; });
  await p.mouse.click(box.x, box.y);
  await p.waitForSelector(".gloss-pop", { timeout: 15000 }).then(() => check(true, `${tag}: tapping a Greek word opens its meaning`),
    () => check(false, `${tag}: tapping a Greek word opens its meaning`));
  await wide("Plotinus");
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
