// Milestone 35a in a real browser: Aristotle's Categories in the Workshop's modern English, with the Greek of each
// paragraph and its Bekker columns, and Taylor's chapter, a tap away; Modern / Side by side; Mark a sentence; linked
// from the Library's Aristotle shelf and from the work. On the iPad's sizes. Run by tests/test_modern_ar.py:
//   node tests/modern_ar_browser.js <port> [screenshot.png]
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

  // The Library's Aristotle shelf links to it.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-ar");
  check(await p.$$eval('#lib-ar a[href="#neo-modern/aristotle-categories"]', (es) => es.length) === 1, `${tag}: the Aristotle shelf links to the Categories in modern English`);
  await p.click('#lib-ar a[href="#neo-modern/aristotle-categories"]');
  await p.waitForSelector(".modern-text .tg-mod");

  const head = await p.$eval(".tg-read", (e) => e.innerText);
  check(/Modern English, the Workshop's own/.test(head) && /machine-assisted/i.test(head) && /not yet checked by a scholar/.test(head), `${tag}: labelled as the Workshop's own and machine-assisted`);
  check(/Modernised from the public-domain English/.test(head) && /Edghill/.test(head), `${tag}: and as modernised from the old English, checked against the Greek`);
  check(await p.$$eval(".tg-mod", (es) => es.length) === 15 && await p.$$eval(".tg-mod .ms-sum", (es) => es.length) === 15, `${tag}: fifteen chapters, each with its gist`);
  check(/Chapter 5\. Substance/.test(await p.$eval("#mc-Cat\\.5", (e) => e.textContent)), `${tag}: chapters are headed by number and title`);
  check(await p.$$eval(".tg-mod .mp-flag", (es) => es.length) >= 10, `${tag}: flags where an older English and the Greek differ`);
  check(/Taylor \(1812\): “nor is any subject”/.test(await p.$eval("#mp-Cat\\.5\\.p1", (e) => e.textContent)), `${tag}: a flag names the English it quotes`);
  check(await p.$$eval("#toc .mod-secs li", (es) => es.length) === 15 && /Your marks/.test(await p.$eval("#toc", (e) => e.textContent)), `${tag}: the contents column lists the chapters`);
  await wide("the Categories in modern English");

  // The Greek of a paragraph, with its Bekker column linking to the work.
  await p.click("#mp-Cat\\.1\\.p1 .mp-greek summary");
  const g = await p.$eval("#mp-Cat\\.1\\.p1 .mp-greek", (e) => ({ open: e.open, text: e.textContent }));
  check(g.open && /ὉΜΩΝΥΜΑ/.test(g.text) && /Bekker's column 1a/.test(g.text), `${tag}: one tap opens the Greek, with its Bekker column`);
  check(await p.$$eval('#mp-Cat\\.1\\.p1 .mp-greek a[href="#categories/1a"]', (es) => es.length) === 1, `${tag}: the column links to the work`);

  // Taylor's chapter, one tap away.
  await p.click("#mc-Cat\\.1 [data-tg-tay]");
  check(await p.$eval("#mc-Cat\\.1 .tg-tay-box", (e) => !e.hidden && /homonymous/.test(e.textContent) && /Taylor, The Categories \(1812\)/.test(e.textContent)), `${tag}: one tap shows Taylor's chapter`);

  // Side by side.
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(await p.$$eval(".tg-tcol", (es) => es.length) === 15, `${tag}: side by side, Taylor beside every chapter`);
  if (viewport.width >= 1024) {
    const cols = await p.$eval("#mc-Cat\\.2 .tg-cols", (e) => [...e.children].map((c) => Math.round(c.getBoundingClientRect().left)));
    check(cols.length === 2 && cols[1] > cols[0] + 100, `${tag}: in two columns`);
  }
  await wide("side by side");
  if (shots && first) {
    await p.evaluate(() => { document.getElementById("mc-Cat.5").scrollIntoView(); window.scrollBy(0, -80); });
    await p.screenshot({ path: shots, fullPage: false });
  }
  await p.click('[data-nm-mode="modern"]');
  await p.waitForSelector(".mod-modern");

  // Mark a sentence; kept after a reload.
  if (first) {
    await p.click("#mp-Cat\\.2\\.p1 [data-mp-mark]");
    await p.click('#mp-Cat\\.2\\.p1 .ms[data-k="1"]');
    await p.fill("#mp-Cat\\.2\\.p1 .mk-comment", "plainer");
    await p.click('#mp-Cat\\.2\\.p1 [data-mk-save="reads badly"]');
    await p.waitForSelector("#mp-Cat\\.2\\.p1 .ms-marked");
    check(/Your marks \(1\)/.test(await p.$eval("#toc", (e) => e.textContent)), `${tag}: the mark is listed in the contents column`);
    await p.reload();
    await p.waitForSelector(".modern-text .tg-mod");
    check(await p.$$eval("#mp-Cat\\.2\\.p1 .ms-marked", (es) => es.length) === 1, `${tag}: the mark is kept`);
  }

  // A chapter by its address.
  await p.goto(base + "#neo-modern/aristotle-categories/Cat.10");
  await p.waitForSelector("#mc-Cat\\.10");
  check(await p.evaluate(() => Math.abs(document.getElementById("mc-Cat.10").getBoundingClientRect().top) < 200), `${tag}: a chapter opens at its place`);

  // The work's page links to it.
  await p.goto(base + "#categories/1a");
  await p.waitForSelector("#toc a[href=\"#neo-modern/aristotle-categories\"]", { state: "attached" });
  check(true, `${tag}: the work's contents column links to the modern English`);

  // Milestone 35b: On Interpretation, from the shelf, with its flags, Greek and Taylor.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-ar");
  check(await p.$$eval('#lib-ar a[href="#neo-modern/aristotle-on-interpretation"]', (es) => es.length) === 1, `${tag}: the Aristotle shelf links to On Interpretation in modern English`);
  await p.goto(base + "#neo-modern/aristotle-on-interpretation/Int.9");
  await p.waitForSelector("#mc-Int\\.9");
  check(await p.$$eval(".tg-mod", (es) => es.length) === 14 && /machine-assisted/i.test(await p.$eval(".tg-read", (e) => e.innerText)), `${tag}: On Interpretation, fourteen chapters, labelled machine-assisted`);
  check(/Chapter 9\. Statements about the future/.test(await p.$eval("#mc-Int\\.9", (e) => e.textContent)) && /not yet true or false/.test(await p.$eval("#mp-Int\\.9\\.p6", (e) => e.textContent)), `${tag}: the sea battle chapter`);
  check(/Edghill, Oxford \(1928\): “but it cannot be either actually true or actually false”/.test(await p.$eval("#mp-Int\\.9\\.p6", (e) => e.textContent)), `${tag}: a flag on Edghill's English`);
  await p.click("#mp-Int\\.1\\.p1 .mp-greek summary");
  check(await p.$$eval('#mp-Int\\.1\\.p1 .mp-greek a[href="#on-interpretation/16a"]', (es) => es.length) === 1, `${tag}: the Greek of a paragraph links to its Bekker column`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, On Interpretation \(1812\)/.test(await p.$eval("#mc-Int\\.1 .tg-tcol", (e) => e.textContent)), `${tag}: side by side with Taylor`);
  await wide("On Interpretation side by side");
  await p.click('[data-nm-mode="modern"]');
  await p.goto(base + "#on-interpretation/16a");
  await p.waitForSelector("#toc a[href=\"#neo-modern/aristotle-on-interpretation\"]", { state: "attached" });
  check(true, `${tag}: On Interpretation's contents column links to the modern English`);

  // Milestone 35c: the Prior Analytics, in two books, with Taylor's own numbering of Book II.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-ar");
  check(await p.$$eval('#lib-ar a[href="#neo-modern/aristotle-prior-analytics"]', (es) => es.length) === 1, `${tag}: the Aristotle shelf links to the Prior Analytics in modern English`);
  await p.goto(base + "#neo-modern/aristotle-prior-analytics/APr.II.25");
  await p.waitForSelector("#mc-APr\\.II\\.25");
  check(await p.$$eval(".tg-mod", (es) => es.length) === 73 && /machine-assisted/i.test(await p.$eval(".tg-read", (e) => e.innerText)), `${tag}: the Prior Analytics, seventy-three chapters, labelled machine-assisted`);
  check(/Book II, chapter 25\. Reduction/.test(await p.$eval("#mc-APr\\.II\\.25", (e) => e.textContent)) && /Book I, chapter 1\./.test(await p.$eval("#mc-APr\\.I\\.1", (e) => e.textContent)), `${tag}: chapters are headed by book`);
  check(/Taylor \(1812\): “Abduction, however, is, when it is evident that the first”/.test(await p.$eval("#mp-APr\\.II\\.25\\.p1", (e) => e.textContent)), `${tag}: a flag on Taylor's "abduction"`);
  await p.click("#mp-APr\\.I\\.1\\.p1 .mp-greek summary");
  check(await p.$$eval('#mp-APr\\.I\\.1\\.p1 .mp-greek a[href="#prior-analytics/24a"]', (es) => es.length) === 1, `${tag}: the Greek of a paragraph links to its Bekker column`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Prior Analytics \(1812\), book ii, chapter 1/.test(await p.$eval("#mc-APr\\.II\\.2 .tg-tcol", (e) => e.textContent)), `${tag}: side by side with Taylor's own chapter`);
  await wide("Prior Analytics side by side");
  await p.click('[data-nm-mode="modern"]');
  await p.goto(base + "#prior-analytics/24a");
  await p.waitForSelector("#toc a[href=\"#neo-modern/aristotle-prior-analytics\"]", { state: "attached" });
  check(true, `${tag}: the Prior Analytics' contents column links to the modern English`);

  // Milestone 35m1: the Metaphysics, Books Α and α so far, from Perseus' Greek, with Taylor's own chapters of Book Α.
  await p.goto(base + "#library");
  await p.waitForSelector("#lib-ar");
  check(await p.$$eval('#lib-ar a[href="#neo-modern/aristotle-metaphysics"]', (es) => es.length) === 1, `${tag}: the Aristotle shelf links to the Metaphysics in modern English`);
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.I.9");
  await p.waitForSelector("#mc-Metaph\\.I\\.9");
  check(await p.$$eval(".tg-mod", (es) => es.length) === 116 && /so far Books Α, α, Β, Γ, Δ, Ε, Ζ, Η, Θ, Ι and Κ/.test(await p.$eval(".tg-read", (e) => e.textContent)), `${tag}: the Metaphysics, a hundred and sixteen chapters so far, saying which books`);
  check(/Book Α \(I\), chapter 9\. Against the Forms/.test(await p.$eval("#mc-Metaph\\.I\\.9", (e) => e.textContent)) && /Book α \(II\), chapter 1\./.test(await p.$eval("#mc-Metaph\\.II\\.1", (e) => e.textContent)), `${tag}: chapters are headed by the book's letter`);
  check(/Ross, Oxford \(1908\): “so is the reason in our soul to the things”/.test(await p.$eval("#mp-Metaph\\.II\\.1\\.p1", (e) => e.textContent)), `${tag}: a flag on Ross's "reason" for νοῦς`);
  await p.click("#mp-Metaph\\.I\\.1\\.p1 .mp-greek summary");
  check(await p.$$eval('#mp-Metaph\\.I\\.1\\.p1 .mp-greek a[href="#metaphysics/980a"]', (es) => es.length) === 1, `${tag}: the Greek of a paragraph links to its Bekker column`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book i, chapter 7/.test(await p.$eval("#mc-Metaph\\.I\\.9 .tg-tcol", (e) => e.textContent)), `${tag}: side by side with Taylor's own chapter`);
  await wide("Metaphysics side by side");
  await p.click('[data-nm-mode="modern"]');
  // Milestone 35m2: Books Β and Γ, the puzzles and the principle of non-contradiction, with Taylor's own chapters of Book Γ.
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.IV.3");
  await p.waitForSelector("#mc-Metaph\\.IV\\.3");
  check(/Book Β \(III\), chapter 1\./.test(await p.$eval("#mc-Metaph\\.III\\.1", (e) => e.textContent)) && /Book Γ \(IV\), chapter 3\./.test(await p.$eval("#mc-Metaph\\.IV\\.3", (e) => e.textContent)), `${tag}: Books Β and Γ are headed by their letters`);
  check(/cannot at the same time belong and not belong/.test(await p.$eval("#mp-Metaph\\.IV\\.3\\.p2", (e) => e.textContent)), `${tag}: the principle of non-contradiction in modern English`);
  check(/Ross, Oxford \(1908\): “The school of Hesiod and all the mythologists”/.test(await p.$eval("#mp-Metaph\\.III\\.4\\.p5", (e) => e.textContent)), `${tag}: a flag on Ross's "mythologists" for θεολόγοι`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book iv, chapter 2/.test(await p.$eval("#mc-Metaph\\.IV\\.3 .tg-tcol", (e) => e.textContent)), `${tag}: Book Γ side by side with Taylor's own chapter`);
  await p.click('[data-nm-mode="modern"]');
  // Milestone 35m3: Book Δ, the lexicon, thirty chapters, each with Taylor's chapter of the same number.
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.V.6");
  await p.waitForSelector("#mc-Metaph\\.V\\.6");
  check(/Book Δ \(V\), chapter 6\. One/.test(await p.$eval("#mc-Metaph\\.V\\.6", (e) => e.textContent)) && /Book Δ \(V\), chapter 30\. Accident/.test(await p.$eval("#mc-Metaph\\.V\\.30", (e) => e.textContent)), `${tag}: Book Δ is headed by its letter, thirty chapters`);
  check(/To be one is to be a principle of number/.test(await p.$eval("#mp-Metaph\\.V\\.6\\.p6", (e) => e.textContent)), `${tag}: the one as the principle of number in modern English`);
  check(/Ross, Oxford \(1908\): “and the prime mover also is a beginning absolutely”/.test(await p.$eval("#mp-Metaph\\.V\\.11\\.p1", (e) => e.textContent)), `${tag}: a flag on Ross's "prime mover" in Book Δ`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book v, chapter 6/.test(await p.$eval("#mc-Metaph\\.V\\.6 .tg-tcol", (e) => e.textContent)), `${tag}: Book Δ side by side with Taylor's own chapter`);
  await p.click('[data-nm-mode="modern"]');
  // Milestone 35m4: Books Ε and Ζ, the three theoretical sciences and the inquiry into substance; Taylor's Ζ has sixteen chapters.
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.VII.13");
  await p.waitForSelector("#mc-Metaph\\.VII\\.13");
  check(/Book Ε \(VI\), chapter 1\./.test(await p.$eval("#mc-Metaph\\.VI\\.1", (e) => e.textContent)) && /Book Ζ \(VII\), chapter 13\. No universal is substance/.test(await p.$eval("#mc-Metaph\\.VII\\.13", (e) => e.textContent)), `${tag}: Books Ε and Ζ are headed by their letters`);
  check(/three theoretical philosophies, mathematics, natural science and theology/.test(await p.$eval("#mp-Metaph\\.VI\\.1\\.p4", (e) => e.textContent)), `${tag}: the three theoretical philosophies in modern English`);
  check(/Ross, Oxford \(1908\): “what we may call theology”/.test(await p.$eval("#mp-Metaph\\.VI\\.1\\.p4", (e) => e.textContent)), `${tag}: a flag on Ross's "what we may call theology"`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book vii, chapter 12/.test(await p.$eval("#mc-Metaph\\.VII\\.13 .tg-tcol", (e) => e.textContent)), `${tag}: Book Ζ side by side with Taylor's own chapter`);
  await p.click('[data-nm-mode="modern"]');
  // Milestone 35m5: Books Η and Θ, matter and form, potency and actuality; Taylor's chapters are Bekker's.
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.IX.6");
  await p.waitForSelector("#mc-Metaph\\.IX\\.6");
  check(/Book Η \(VIII\), chapter 6\. What makes the definition/.test(await p.$eval("#mc-Metaph\\.VIII\\.6", (e) => e.textContent)) && /Book Θ \(IX\), chapter 6\. What actuality is/.test(await p.$eval("#mc-Metaph\\.IX\\.6", (e) => e.textContent)), `${tag}: Books Η and Θ are headed by their letters`);
  check(/At the same time one sees and has seen/.test(await p.$eval("#mp-Metaph\\.IX\\.6\\.p4", (e) => e.textContent)), `${tag}: actuality and motion in modern English`);
  check(/Ross, Oxford \(1908\): “more scientific than the Idea of science”/.test(await p.$eval("#mp-Metaph\\.IX\\.8\\.p5", (e) => e.textContent)), `${tag}: a flag on Ross's "the Idea of science"`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book ix, chapter 6/.test(await p.$eval("#mc-Metaph\\.IX\\.6 .tg-tcol", (e) => e.textContent)), `${tag}: Book Θ side by side with Taylor's own chapter`);
  await p.click('[data-nm-mode="modern"]');
  // Milestone 35m6: Books Ι and Κ, the one and the many, and the summary of Β, Γ, Ε and of the Physics; Taylor's chapters are Bekker's.
  await p.goto(base + "#neo-modern/aristotle-metaphysics/Metaph.XI.7");
  await p.waitForSelector("#mc-Metaph\\.XI\\.7");
  check(/Book Ι \(X\), chapter 4\. Contrariety, the complete difference/.test(await p.$eval("#mc-Metaph\\.X\\.4", (e) => e.textContent)) && /Book Κ \(XI\), chapter 7\. The three theoretical sciences/.test(await p.$eval("#mc-Metaph\\.XI\\.7", (e) => e.textContent)), `${tag}: Books Ι and Κ are headed by their letters`);
  check(/physics, mathematics, theology/.test(await p.$eval("#mp-Metaph\\.XI\\.7\\.p2", (e) => e.textContent)), `${tag}: the three theoretical sciences in modern English`);
  check(/Ross, Oxford \(1908\): “though there is proof ad hominem”/.test(await p.$eval("#mp-Metaph\\.XI\\.5\\.p1", (e) => e.textContent)), `${tag}: a flag on Ross's "ad hominem"`);
  await p.click('[data-nm-mode="both"]');
  await p.waitForSelector(".mod-both .tg-tcol");
  check(/Taylor, The Metaphysics \(1801\), book xi, chapter 7/.test(await p.$eval("#mc-Metaph\\.XI\\.7 .tg-tcol", (e) => e.textContent)), `${tag}: Book Κ side by side with Taylor's own chapter`);
  await p.click('[data-nm-mode="modern"]');
  await p.goto(base + "#metaphysics/980a");
  await p.waitForSelector("#toc a[href=\"#neo-modern/aristotle-metaphysics\"]", { state: "attached" });
  check(true, `${tag}: the Metaphysics' contents column links to the modern English`);
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
