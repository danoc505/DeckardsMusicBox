// Milestone 27, session 3 in a real browser: Proclus' prologue to the First Alcibiades, proofread from the page
// images and in the Workshop's modern English, with the Greek, its pages and Taylor's Introduction a tap away,
// on the iPad's sizes. Run by tests/test_proclus_alcibiades.py against a running tools/serve.py:
//   node tests/proclus_alcibiades_browser.js <port> [screenshot.png]
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

  // The Library's shelf of the Neoplatonists links to it.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-neo");
  check(await p.$$eval('#lib-neo a[href="#neo-modern/proclus-alcibiades"]', (es) => es.length) === 1, `${tag}: the Library links to Proclus in modern English`);
  await p.click('#lib-neo a[href="#neo-modern/proclus-alcibiades"]');
  await p.waitForSelector(".modern-text .tg-mod");

  const head = await p.$eval(".tg-read", (e) => e.innerText);
  check(/Modern English, the Workshop's own/.test(head) && /machine-assisted/i.test(head) && /not yet checked by a scholar/.test(head), `${tag}: labelled as the Workshop's own and machine-assisted`);
  check(/proofread from the page images/.test(head), `${tag}: and as made from the proofread Greek`);
  check(await p.$$eval(".tg-mod", (es) => es.length) === 23 && await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 23, `${tag}: twenty-three sections, each with its gist`);
  check(await p.$eval("#mp-Pr\\.1\\.p1 .mp-text", (e) => e.textContent.length > 100), `${tag}: the modern English of the first paragraph`);
  check(await p.$$eval(".tg-mod .mp-flag", (es) => es.length) >= 10, `${tag}: flags where Taylor and the Greek differ`);
  check(/Your marks/.test(await p.$eval("#toc", (e) => e.textContent)) && await p.$$eval("#toc .mod-secs li", (es) => es.length) === 23, `${tag}: the contents column lists the sections`);
  await wide("Proclus in modern English");

  // The Greek of a paragraph, with its pages and their scans.
  await p.click("#mp-Pr\\.1\\.p1 .mp-greek summary");
  const g = await p.$eval("#mp-Pr\\.1\\.p1 .mp-greek", (e) => ({ open: e.open, text: e.textContent }));
  check(g.open && /Τῶν Πλατωνικῶν διαλόγων/.test(g.text) && /Proofread from the page images: Cousin's II p\. 2/.test(g.text), `${tag}: one tap opens the proofread Greek, with its page`);
  check(await p.$$eval('#mp-Pr\\.1\\.p1 .mp-greek a[href^="https://archive.org/"]', (es) => es.length) >= 1, `${tag}: and its page image`);

  // Taylor's Introduction, one tap away; none for a section he does not draw on.
  await p.click("#mc-Pr\\.1 [data-tg-tay]");
  check(await p.$eval("#mc-Pr\\.1 .tg-tay-box", (e) => !e.hidden && /Introduction, paragraph 2/.test(e.textContent)), `${tag}: one tap shows Taylor's Introduction`);
  check(await p.$$eval("#mc-Pr\\.9 [data-tg-tay]", (es) => es.length) === 0, `${tag}: no Taylor button where he draws nothing`);

  // Side by side.
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(await p.$$eval(".tg-tcol", (es) => es.length) === 23, `${tag}: side by side, Taylor beside every section`);
  check(/draw nothing/.test(await p.$eval("#mc-Pr\\.9 .tg-tcol", (e) => e.textContent)), `${tag}: saying where he draws nothing`);
  check(/Additional note on 103a/.test(await p.$eval("#mc-103a\\.1 .tg-tcol", (e) => e.textContent)), `${tag}: Taylor's note on the preface beside the first lemma`);
  if (viewport.width >= 1024) {
    const cols = await p.$eval("#mc-Pr\\.1 .tg-cols", (e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    check(cols.length === 2 && cols[1] > cols[0] + 100, `${tag}: in two columns`);
  }
  await wide("side by side");
  if (shots && first) {
    await p.evaluate(() => { document.getElementById("mc-Pr.3").scrollIntoView(); window.scrollBy(0, -100); });
    await p.screenshot({ path: shots, fullPage: false });
  }
  await p.click('[data-nm-mode="modern"]');
  await p.waitForSelector(".mod-modern");

  // Mark a sentence; kept after a reload.
  if (first) {
    await p.click("#mp-Pr\\.2\\.p1 [data-mp-mark]");
    await p.click('#mp-Pr\\.2\\.p1 .ms[data-k="1"]');
    await p.fill("#mp-Pr\\.2\\.p1 .mk-comment", "plainer");
    await p.click('#mp-Pr\\.2\\.p1 [data-mk-save="reads badly"]');
    await p.waitForSelector("#mp-Pr\\.2\\.p1 .ms-marked");
    check(/Your marks \(1\)/.test(await p.$eval("#toc", (e) => e.textContent)), `${tag}: the mark is listed in the contents column`);
    await p.reload();
    await p.waitForSelector(".modern-text .tg-mod");
    check(await p.$$eval("#mp-Pr\\.2\\.p1 .ms-marked", (es) => es.length) === 1, `${tag}: the mark is kept`);
  }

  // The first lemma: its section, with the pages of its Greek.
  const lem = await p.$eval("#mp-103a\\.1\\.p1", (e) => e.textContent);
  check(/Son of Cleinias, I think you wonder/.test(lem) && /II p\. 49/.test(lem), `${tag}: the first lemma, with its page`);

  // A section by its address.
  await p.goto(base + "#neo-modern/proclus-alcibiades/Pr.9");
  await p.waitForSelector("#mc-Pr\\.9");
  check(await p.evaluate(() => Math.abs(document.getElementById("mc-Pr.9").getBoundingClientRect().top) < 200), `${tag}: a section opens at its place`);

  // From the scanned page to its section, and the page reads as proofread with the corrections.
  await p.goto(base + "#neo/proclus-alcibiades/0");
  await p.waitForSelector(".tg-back a");
  const links = await p.$$eval(".tg-back a", (es) => es.map((e) => e.getAttribute("href")));
  check(links.includes("#neo-modern/proclus-alcibiades/Pr.1"), `${tag}: the scanned page links to its section in modern English`);
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
