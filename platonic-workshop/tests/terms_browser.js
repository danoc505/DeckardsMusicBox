// Milestone 17 in a real browser: key terms underlined in the text, opening beside it in the Term tab.
// Run by tests/test_terms.py against a running tools/serve.py:  node tests/terms_browser.js <port>
"use strict";
const { chromium } = require("playwright");

const port = process.argv[2];
const base = `http://127.0.0.1:${port}/`;

function check(ok, what) {
  if (!ok) { console.error("FAIL: " + what); process.exitCode = 1; } else console.log("ok: " + what);
}

async function run(viewport, touch) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport, hasTouch: touch, isMobile: touch });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.addInitScript(() => { try { localStorage.setItem("pw.seenStart", "1"); } catch (e) { /* */ } });
  await p.goto(base + "#republic/509b");
  await p.waitForSelector("#s-509b .grc .w");
  const tag = `${viewport.width}×${viewport.height}`;

  // The Greek: ἀγαθοῦ is marked as the Good; the English only above the Greek that has the term.
  const good = await p.$$eval("#s-509b .grc .w.tm", (ws) => ws.filter((w) => w.dataset.term.split(" ").includes("the-good")).map((w) => w.textContent));
  check(good.length > 0 && good.every((f) => /ἀγαθ/.test(f)), `${tag}: ἀγαθοῦ at 509b is underlined as the Good (${good.join(", ")})`);
  const bad = await p.$$eval("#main .sec", (secs) => {
    const out = [];
    for (const s of secs) {
      const greek = new Set([...s.querySelectorAll(".grc .w[data-term]")].flatMap((w) => w.dataset.term.split(" ")));
      for (const e of s.querySelectorAll('.eng[data-ed$="perseus-eng2"] .tm-en')) {
        if (/the Greek of this passage has it/.test(e.title) && !greek.has(e.dataset.term)) out.push(s.dataset.ref + " " + e.textContent);
      }
    }
    return out;
  });
  check(bad.length === 0, `${tag}: an English word is underlined only where the Greek of its section has the term (${bad.slice(0, 3).join("; ")})`);
  const eng = await p.$$eval('#s-509b .eng .tm-en[data-term="the-good"]', (es) => es.map((e) => e.textContent));
  check(eng.some((x) => /good/i.test(x)), `${tag}: "the good" in the English of 509b is underlined (${eng.join(", ")})`);

  // Tap it: the Term tab, with every place in Plato in the reading order, and the Republic open.
  await p.click('#s-509b .grc .w.tm[data-term~="the-good"]');
  await p.waitForSelector("#pane-term .term-h");
  check(await p.isVisible("#pane-term .term-h"), `${tag}: the Term tab opens beside the text`);
  check((await p.textContent("#pane-term .term-h")).includes("The Good"), `${tag}: it is the Good`);
  check(await p.$eval('#panel-tabs [data-pane="term"]', (b) => b.classList.contains("on")), `${tag}: the Term tab is the one shown`);
  const works = await p.$$eval("#pane-term .term-work summary b", (bs) => bs.map((x) => x.textContent));
  check(works.length > 20 && works[0] === "Alcibiades 1", `${tag}: every dialogue it is in, in the Platonist order (${works.slice(0, 3).join(", ")}…)`);
  check(await p.$eval("#pane-term .term-work.here", (d) => d.open && d.textContent.includes("Republic")), `${tag}: the Republic, being read, is open`);
  check(await p.$("#pane-term .term-plain .gq-tag.own") !== null, `${tag}: the plain meaning is labelled as the Workshop's`);
  check((await p.textContent("#pane-term")).includes("Key passages"), `${tag}: the key passages`);
  check(await p.$$eval("#main .tm-on", (x) => x.length) > 0, `${tag}: its words on the page light up`);
  check((await p.evaluate(() => location.hash)) === "#republic/509b", `${tag}: nothing left the page being read`);

  // Walk to the next place it is used.
  const next = await p.$("#pane-term .term-nav a:last-of-type");
  const label = await next.textContent();
  await next.click();
  await p.waitForFunction(() => location.hash !== "#republic/509b");
  await p.waitForTimeout(400);
  const hash = await p.evaluate(() => location.hash);
  const ref = hash.split("/")[1];
  check(label.includes(ref), `${tag}: › goes to the next place (${label.trim()} → ${hash})`);
  check(await p.$$eval(`#s-${ref} .w.tm-on`, (x) => x.length) > 0, `${tag}: and the term's word there is lit`);
  check(await p.isVisible("#pane-term .term-h"), `${tag}: the Term tab stays open`);

  // The other tabs speak of the section being read.
  for (const [tab, want] of [["notes", "the notes on this section"], ["links", "what its notes cite"], ["mine", "your work on this section"]]) {
    await p.click(`#panel-tabs [data-pane="${tab}"]`);
    check((await p.textContent(`#pane-${tab}`)).includes(want), `${tag}: the ${tab} tab shows ${want}`);
  }
  await p.click('#panel-tabs [data-pane="term"]');
  await p.click('[data-panel-page="concept"]');
  await p.waitForSelector("#pane-term .panel-page .concept");
  check(await p.isVisible("#pane-term .panel-page"), `${tag}: the concept index's page opens inside the panel`);

  // The switch: no underlines, and a tap on the word gives its grammar.
  await p.click("#show-menu summary");   // the switches are in the Show menu
  await p.click('input[data-layer="terms"]');
  await p.click("#show-menu summary");
  const line = await p.$eval('#main .w.tm', (w) => getComputedStyle(w).backgroundImage);
  check(line === "none", `${tag}: Key terms off takes the underlines away`);
  await p.click('#main .w.tm');
  await p.waitForSelector("#pane-word .insp-form");
  check(await p.isVisible("#pane-word .insp-form"), `${tag}: and a tap on the word opens its grammar`);
  await p.click("#show-menu summary");
  await p.click('input[data-layer="terms"]');
  await p.click("#show-menu summary");

  check(errors.length === 0, `${tag}: no errors in the page (${errors.join("; ")})`);
  await b.close();
}

(async () => {
  await run({ width: 1400, height: 900 }, false);
  await run({ width: 768, height: 1024 }, true);
  await run({ width: 1024, height: 768 }, true);
})().catch((e) => { console.error(e); process.exitCode = 1; });
