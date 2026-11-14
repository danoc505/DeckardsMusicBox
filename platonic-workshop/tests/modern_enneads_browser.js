// The Enneads milestones in a real browser: Plotinus in the Workshop's modern English, made from the Greek, with
// MacKenna's English and the Greek a tap away, side by side, the whole Enneads in Porphyry's order, and a sentence
// marked, on the iPad's sizes. Run by tests/test_modern_enneads.py against a running tools/serve.py:
//   node tests/modern_enneads_browser.js <port> [screenshot.png]
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

  // The Neoplatonists' shelf links to it, under Plotinus.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-neo");
  check(await p.$$eval('#lib-neo a[href="#neo-modern/enneads"]', (es) => es.length) === 1, `${tag}: the shelf links to the Enneads in modern English`);
  await p.click('#lib-neo a[href="#neo-modern/enneads"]');
  await p.waitForSelector(".modern-text .tg-mod");

  const head = await p.$eval(".tg-read", (e) => e.innerText);
  check(/Modern English, the Workshop's own/.test(head) && /machine-assisted/i.test(head) && /not yet checked by a scholar/.test(head), `${tag}: labelled as the Workshop's own and machine-assisted`);
  check(/checked against Stephen MacKenna's translation \(1917\)/.test(head), `${tag}: and as checked against MacKenna`);
  check(await p.$$eval(".tg-mod", (es) => es.length) === 79 && await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 79, `${tag}: the Life 1-12, I.1, I.4 to I.9, seventy-nine chapters, each with its gist`);
  // Porphyry's Life comes first (E5), with Volkmann's proofread Greek and MacKenna's flags.
  check(await p.$eval(".tg-mod", (e) => e.id) === "mc-Life.1", `${tag}: the Life comes first (E5)`);
  check(/Life, chapter 3\. /.test(await p.$eval("#mc-Life\\.3", (e) => e.textContent)), `${tag}: the Life's chapters are headed as such`);
  check(/MacKenna: “At twenty he was caught by the passion for philosophy/.test(await p.$eval("#mp-Life\\.3\\.p2", (e) => e.textContent)), `${tag}: the Life has its flags (E5)`);
  await p.click("#mp-Life\\.1\\.p1 .mp-greek summary");
  check(/Πλωτῖνος ὁ καθ’ ἡμᾶς/.test(await p.$eval("#mp-Life\\.1\\.p1 .mp-greek", (e) => e.textContent))
    && /Proofread from the page images: Volkmann's vol\. I, chapter 1, from p\. 3/.test(await p.$eval("#mp-Life\\.1\\.p1 .mp-greek", (e) => e.textContent))
    && await p.$$eval('#mp-Life\\.1\\.p1 .mp-greek a[href="#neo/porphyry-life-plotinus/0/ia-volkmann-t1%3A33"]', (es) => es.length) === 1,
    `${tag}: the Life's Greek is Volkmann's, proofread, linked to its page`);
  check(/I\.4\.8\. Pain, and the light in the lantern/.test(await p.$eval("#mc-I\\.4\\.8", (e) => e.textContent)), `${tag}: I.4 is here (E2)`);
  check(/MacKenna: “last year's morality/.test(await p.$eval("#mp-I\\.5\\.8\\.p1", (e) => e.textContent)), `${tag}: I.5 is here, with its flags (E2)`);
  check(/I\.6\.9\. Make yourself beautiful, and see/.test(await p.$eval("#mc-I\\.6\\.9", (e) => e.textContent)), `${tag}: I.6 is here (E3)`);
  check(/MacKenna: “try all you will to separate the light/.test(await p.$eval("#mp-I\\.7\\.1\\.p3", (e) => e.textContent)), `${tag}: I.7 is here, with its flags (E3)`);
  check(/I\.8\.15\. To deny evil is to deny the Good; the golden chains/.test(await p.$eval("#mc-I\\.8\\.15", (e) => e.textContent)), `${tag}: I.8 is here (E4)`);
  check(/MacKenna: “movements which it is unlawful to indulge/.test(await p.$eval("#mp-I\\.9\\.1\\.p2", (e) => e.textContent)), `${tag}: I.9 is here, with its flags (E4)`);
  check(/I\.1\.7\. The light of the soul/.test(await p.$eval("#mc-I\\.1\\.7", (e) => e.textContent)), `${tag}: chapters are headed by number and title`);
  check(/^Pleasures and pains, fears and boldness/.test(await p.$eval("#mp-I\\.1\\.1\\.p1 .mp-text", (e) => e.textContent)), `${tag}: the modern English of I.1.1`);
  check(await p.$$eval(".tg-mod .mp-flag", (es) => es.length) >= 10, `${tag}: flags where MacKenna and the Greek differ`);
  check(/MacKenna: “Compare the passage \(in Plato\)/.test(await p.$eval("#mp-I\\.1\\.4\\.p2", (e) => e.textContent)), `${tag}: a flag names MacKenna and quotes him`);
  check(await p.$$eval(".tg-mod .tm-en", (es) => es.length) > 20, `${tag}: key words are underlined for the Term tab`);

  // The contents column: all fifty-four in Porphyry's order; I.1 here, Taylor's fifteen to his English, the rest to come.
  const toc = await p.$eval("#toc", (e) => e.textContent);
  check(await p.$$eval("#toc .enn-contents li", (es) => es.length) === 55 && /Your marks/.test(toc), `${tag}: the contents column lists the Life and the fifty-four treatises`);
  check(/Before the Enneads/.test(toc) && await p.$$eval('#toc a[href="#neo-modern/enneads/Life.1"]', (es) => es.length) === 1 && /chapters 1-12 of 26 so far/.test(toc), `${tag}: the Life, before the Enneads, links here`);
  check(await p.$$eval('#toc a[href="#neo-modern/enneads/I.1.1"]', (es) => es.length) === 1, `${tag}: I.1 links here`);
  check(await p.$$eval('#toc a[href="#neo-en/taylor-plotinus/0"]', (es) => es.length) === 1 && await p.$$eval('#toc a[href="#neo-en/taylor-plotinus/14"]', (es) => es.length) === 1,
    `${tag}: Taylor's treatises link to his English with the modern beside it`);
  check(await p.$$eval("#toc .enn-later", (es) => es.length) === 32, `${tag}: the other thirty-two are to come`);
  await p.click(".enn-all summary");
  check(/to come, E7/.test(await p.$eval(".enn-all", (e) => e.textContent)), `${tag}: the whole Enneads names the milestone of each one to come`);
  await wide("the Enneads in modern English");

  // The Greek of a paragraph, linking to its chapter in Volkmann's text.
  await p.click("#mp-I\\.1\\.1\\.p1 .mp-greek summary");
  const g = await p.$eval("#mp-I\\.1\\.1\\.p1 .mp-greek", (e) => ({ open: e.open, text: e.textContent }));
  check(g.open && /Ἡδοναὶ καὶ λῦπαι/.test(g.text) && /Volkmann's text, from chapter I\.1\.1/.test(g.text), `${tag}: one tap opens the Greek, with its chapter`);
  check(await p.$$eval('#mp-I\\.1\\.1\\.p1 .mp-greek a[href="#neo/plotinus-enneads/0/1.1.1"]', (es) => es.length) === 1, `${tag}: the chapter links to the Greek text`);

  // MacKenna's chapter, one tap away.
  await p.click("#mc-I\\.1\\.1 [data-tg-tay]");
  check(await p.$eval("#mc-I\\.1\\.1 .tg-tay-box", (e) => !e.hidden && /Pleasure and distress, fear and courage/.test(e.textContent) && /MacKenna, I\.1, chapter 1 \(1917, p\. 29\)/.test(e.textContent)),
    `${tag}: one tap shows MacKenna's chapter, with its page`);
  check(/Hide MacKenna's words/.test(await p.$eval("#mc-I\\.1\\.1 [data-tg-tay]", (e) => e.textContent)), `${tag}: the button names MacKenna`);

  // Side by side.
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(await p.$$eval(".tg-tcol", (es) => es.length) === 79, `${tag}: side by side, MacKenna beside every chapter`);
  if (viewport.width >= 1024) {
    const cols = await p.$eval("#mc-I\\.1\\.3 .tg-cols", (e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    check(cols.length === 2 && cols[1] > cols[0] + 100, `${tag}: in two columns`);
  }
  await wide("side by side");
  if (shots && first) {
    await p.evaluate(() => { document.getElementById("mc-I.1.7").scrollIntoView(); window.scrollBy(0, -80); });
    await p.screenshot({ path: shots, fullPage: false });
  }
  await p.click('[data-nm-mode="modern"]');
  await p.waitForSelector(".mod-modern");

  // Mark a sentence; kept after a reload.
  if (first) {
    await p.click("#mp-I\\.1\\.2\\.p1 [data-mp-mark]");
    await p.click('#mp-I\\.1\\.2\\.p1 .ms[data-k="1"]');
    await p.fill("#mp-I\\.1\\.2\\.p1 .mk-comment", "plainer");
    await p.click('#mp-I\\.1\\.2\\.p1 [data-mk-save="reads badly"]');
    await p.waitForSelector("#mp-I\\.1\\.2\\.p1 .ms-marked");
    check(/Your marks \(1\)/.test(await p.$eval("#toc", (e) => e.textContent)), `${tag}: the mark is listed in the contents column`);
    await p.reload();
    await p.waitForSelector(".modern-text .tg-mod");
    check(await p.$$eval("#mp-I\\.1\\.2\\.p1 .ms-marked", (es) => es.length) === 1, `${tag}: the mark is kept`);
  }

  // A chapter by its address.
  await p.goto(base + "#neo-modern/enneads/I.1.12");
  await p.waitForSelector("#mc-I\\.1\\.12");
  check(await p.evaluate(() => Math.abs(document.getElementById("mc-I.1.12").getBoundingClientRect().top) < 200), `${tag}: a chapter opens at its place`);

  // The Greek text links to it: its own page, and each chapter of I.1.
  await p.goto(base + "#neo/plotinus-enneads");
  await p.waitForSelector(".neo-text");
  check(await p.$$eval('.neo-text a[href="#neo-modern/enneads"]', (es) => es.length) === 1, `${tag}: the Greek text's page links to the modern English`);
  await p.goto(base + "#neo/plotinus-enneads/0/1.1.5");
  await p.waitForSelector("#neo-1\\.1\\.5");
  check(await p.$$eval('#neo-1\\.1\\.5 a[href="#neo-modern/enneads/I.1.5"]', (es) => es.length) === 1, `${tag}: each chapter of the Greek links to its modern English`);
  // The Life on the shelf, and each of its proofread pages, link to it (E5).
  await p.goto(base + "#neo/porphyry-life-plotinus");
  await p.waitForSelector(".neo-text");
  check(await p.$$eval('.neo-text a[href="#neo-modern/enneads/Life.1"]', (es) => es.length) === 1, `${tag}: the Life's Greek links to its modern English`);
  await p.goto(base + "#neo/porphyry-life-plotinus/0");
  await p.waitForSelector(".neo-text");
  check(await p.$$eval('a[href="#neo-modern/enneads/Life.2"]', (es) => es.length) >= 1, `${tag}: its pages link to their chapters`);
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
