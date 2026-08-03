#!/usr/bin/env node
/* THE BLEND SLIDERS, driven in a real browser.
     node harness/mk2_blend.js

   The simplex maths is easy to get subtly wrong -- a sum that drifts off 1,
   a lock that silently refuses instead of clamping, a remainder with nowhere
   to go when every other genre is at zero -- and none of it is visible from
   the note grid, because it happens before a note exists. So it is driven
   here through the actual DOM handlers, not by calling the maths directly. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass=0, fail=0;
const check=(n,ok,d)=>{ console.log((ok?"  ✓ ":"  ✗ FAIL: ")+n+(d?"  ("+d+")":"")); ok?pass++:fail++; };
(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args:['--no-sandbox','--disable-gpu'] });
  const pg = await b.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e.message)));
  pg.on('console',m=>{ if(m.type()==='error') errs.push("CONSOLE: "+m.text()); });
  await pg.goto('file://' + require('path').resolve(__dirname, '..', 'Deckards Orchestrator MK2.html'),{waitUntil:'load',timeout:60000});
  await pg.waitForFunction(()=>window.MK2,{timeout:20000});

  const W = () => pg.evaluate(()=>{ const o={}; for(const k in window.__B) o[k]=+window.__B[k].toFixed(4); return o; });
  await pg.evaluate(()=>{ window.__B = BLEND; window.__L = BLEND_LOCK; window.__set = setBlend; window.__solo = soloBlend; });

  const sum = w => Object.values(w).reduce((a,b)=>a+b,0);
  let w = await W();
  check("starts as one genre at 100%", Math.abs(sum(w)-1)<1e-6 && Object.values(w).filter(x=>x>0.999).length===1,
        JSON.stringify(w));

  /* the exact scenario from the brief: 100 on X, add 25 of Y, then 25 of Z */
  await pg.evaluate(()=>{ __solo("lofi"); __set("jungle",0.25); });
  w = await W();
  check("100 on X, add 25% Y -> X falls to 75", Math.abs(w.lofi-0.75)<1e-6 && Math.abs(w.jungle-0.25)<1e-6,
        `lofi ${w.lofi} jungle ${w.jungle}`);
  await pg.evaluate(()=>{ __set("acid",0.25); });
  w = await W();
  check("...then add 25% Z -> the other two give way in proportion",
        Math.abs(w.acid-0.25)<1e-6 && Math.abs(w.lofi-0.5625)<1e-6 && Math.abs(w.jungle-0.1875)<1e-6,
        `lofi ${w.lofi} jungle ${w.jungle} acid ${w.acid}`);
  check("...and the total is still exactly 1", Math.abs(sum(w)-1)<1e-9, sum(w).toFixed(12));

  /* locks: the brief's second scenario */
  await pg.evaluate(()=>{ __solo("lofi"); __set("jungle",0.5); __L.add("lofi"); __L.add("jungle"); __set("acid",0.25); });
  w = await W();
  check("with X and Y locked, Z can only take what is free",
        Math.abs(w.acid)<1e-9 && Math.abs(w.lofi-0.5)<1e-6 && Math.abs(w.jungle-0.5)<1e-6,
        `acid clamped to ${w.acid} because lofi+jungle are locked at 1.0`);
  await pg.evaluate(()=>{ __L.clear(); __solo("lofi"); __set("jungle",0.4); __L.add("jungle"); __set("acid",0.3); });
  w = await W();
  check("one lock: the locked share holds, the rest gives way",
        Math.abs(w.jungle-0.4)<1e-6 && Math.abs(w.acid-0.3)<1e-6 && Math.abs(w.lofi-0.3)<1e-6,
        `lofi ${w.lofi} jungle ${w.jungle}(locked) acid ${w.acid}`);

  /* the edge case: everything else at zero */
  await pg.evaluate(()=>{ __L.clear(); __solo("lofi"); __set("lofi",0.4); });
  w = await W();
  check("dropping the only genre shares the remainder out", Math.abs(sum(w)-1)<1e-9 && w.lofi>0.399 && w.lofi<0.401,
        JSON.stringify(w));

  /* and it actually composes a blended song */
  await pg.evaluate(()=>{ __L.clear(); __solo("lofi"); __set("jungle",0.5); });
  await pg.evaluate(()=>newSong(1));
  const info = await pg.evaluate(()=>({ label: MK2.currentSong().chart.table.label,
                                        blend: MK2.currentSong().chart.blend,
                                        tempo: MK2.currentSong().chart.tempo,
                                        ev: MK2.currentSong().perf.events.length }));
  check("a 50/50 blend composes and names itself", info.ev>100 && /50%/.test(info.label),
        `${info.label} · ${info.tempo} bpm · ${info.ev} events`);

  /* soloing back gives the untouched genre */
  await pg.evaluate(()=>{ __solo("lofi"); newSong(1); });
  const solo = await pg.evaluate(()=>({ label: MK2.currentSong().chart.table.label,
                                        blend: MK2.currentSong().chart.blend,
                                        ev: MK2.currentSong().perf.events.length }));
  /* ── COMPARED AGAINST THE GENRE, NOT AGAINST A MAGIC NUMBER ────────────────
     This asserted solo.ev === 1383, which is what lofi happened to compose the
     day it was written. It went red the moment lofi gained a rim shot and a
     crash -- for a change that was correct, and it would have gone green again
     for any change that happened to land back on 1383.

     The claim is "soloing gives the PLAIN GENRE back", so ask the plain genre.
     A number typed into a test is a second copy of the program that nobody
     updates. */
  const plain = await pg.evaluate(() =>
    MK2.composeSong(1, MK2.currentSong().chart.rig, "lofi").perf.events.length);
  check("soloing gives the plain genre back, not a blend of one",
        solo.blend===null && solo.ev===plain,
        `${solo.label} · ${solo.ev} events (genre composes ${plain}) · blend ${solo.blend}`);

  check("no uncaught page errors", errs.length===0, errs.join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail?1:0);
})();
