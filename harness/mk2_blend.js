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

  /* FULL PRECISION, rounded only when printed. This rounded to 4 digits on the
     way out, which was invisible while the shared-out remainder divided evenly
     -- 0.6 over six genres is 0.1 exactly. The eighth genre made it 0.6/7, the
     rounded copies summed to 0.9999, and the "exactly 1" check failed on the
     harness's own rounding while the program's total was exactly 1. Ask the
     thing, not a copy of the thing. */
  const W = () => pg.evaluate(()=>{ const o={}; for(const k in window.__B) o[k]=window.__B[k]; return o; });
  const show = w => JSON.stringify(Object.fromEntries(Object.entries(w).map(([k,v])=>[k,+v.toFixed(4)])));
  await pg.evaluate(()=>{ window.__B = BLEND; window.__L = BLEND_LOCK; window.__set = setBlend; window.__solo = soloBlend; });

  const sum = w => Object.values(w).reduce((a,b)=>a+b,0);
  let w = await W();
  check("starts as one genre at 100%", Math.abs(sum(w)-1)<1e-6 && Object.values(w).filter(x=>x>0.999).length===1,
        show(w));

  /* ── THE THREE SLIDERS ARE DRAWN FROM THE PROGRAM, NOT NAMED ───────────────
     This file used to name three specific genres in fourteen places. The
     simplex arithmetic does not care WHICH three sliders it moves -- it is
     about a sum staying at 1 while weights give way in proportion -- so naming
     them bought nothing and cost the usual thing: a second copy of the genre
     list, which goes stale. It nearly did. An eighth genre shipped without any
     document noticing (`dungeonsynth`, 2026-08-07), and the only reason this
     suite survived it was that its ROUNDING happened to be tested; had these
     three names been the ones that changed, the suite would have failed on the
     program being correct.

     X, Y and Z are now the first three the program declares. Same arithmetic,
     no list. And the count check below is the one that would have caught the
     eighth genre being missing from the panel -- which nothing did. */
  const GS = await pg.evaluate(()=>MK2.genres());
  const [X, Y, Z] = GS;
  check("the blend panel draws one slider per genre the program declares",
        Object.keys(w).length === GS.length &&
        GS.every(g => Object.prototype.hasOwnProperty.call(w, g)),
        `panel ${Object.keys(w).length} · program ${GS.length} (${GS.join(" ")})` +
        (GS.filter(g=>!(g in w)).length ? "  MISSING: " + GS.filter(g=>!(g in w)).join(" ") : ""));

  /* the exact scenario from the brief: 100 on X, add 25 of Y, then 25 of Z */
  await pg.evaluate(([X,Y])=>{ __solo(X); __set(Y,0.25); },[X,Y]);
  w = await W();
  check("100 on X, add 25% Y -> X falls to 75", Math.abs(w[X]-0.75)<1e-6 && Math.abs(w[Y]-0.25)<1e-6,
        `${X} ${w[X]} ${Y} ${w[Y]}`);
  await pg.evaluate((Z)=>{ __set(Z,0.25); },Z);
  w = await W();
  check("...then add 25% Z -> the other two give way in proportion",
        Math.abs(w[Z]-0.25)<1e-6 && Math.abs(w[X]-0.5625)<1e-6 && Math.abs(w[Y]-0.1875)<1e-6,
        `${X} ${w[X]} ${Y} ${w[Y]} ${Z} ${w[Z]}`);
  check("...and the total is still exactly 1", Math.abs(sum(w)-1)<1e-9, sum(w).toFixed(12));

  /* locks: the brief's second scenario */
  await pg.evaluate(([X,Y,Z])=>{ __solo(X); __set(Y,0.5); __L.add(X); __L.add(Y); __set(Z,0.25); },[X,Y,Z]);
  w = await W();
  check("with X and Y locked, Z can only take what is free",
        Math.abs(w[Z])<1e-9 && Math.abs(w[X]-0.5)<1e-6 && Math.abs(w[Y]-0.5)<1e-6,
        `${Z} clamped to ${w[Z]} because ${X}+${Y} are locked at 1.0`);
  await pg.evaluate(([X,Y,Z])=>{ __L.clear(); __solo(X); __set(Y,0.4); __L.add(Y); __set(Z,0.3); },[X,Y,Z]);
  w = await W();
  check("one lock: the locked share holds, the rest gives way",
        Math.abs(w[Y]-0.4)<1e-6 && Math.abs(w[Z]-0.3)<1e-6 && Math.abs(w[X]-0.3)<1e-6,
        `${X} ${w[X]} ${Y} ${w[Y]}(locked) ${Z} ${w[Z]}`);

  /* the edge case: everything else at zero */
  await pg.evaluate((X)=>{ __L.clear(); __solo(X); __set(X,0.4); },X);
  w = await W();
  check("dropping the only genre shares the remainder out", Math.abs(sum(w)-1)<1e-9 && w[X]>0.399 && w[X]<0.401,
        show(w));

  /* and it actually composes a blended song */
  await pg.evaluate(([X,Y])=>{ __L.clear(); __solo(X); __set(Y,0.5); },[X,Y]);
  await pg.evaluate(()=>newSong(1));
  const info = await pg.evaluate(()=>({ label: MK2.currentSong().chart.table.label,
                                        blend: MK2.currentSong().chart.blend,
                                        tempo: MK2.currentSong().chart.tempo,
                                        ev: MK2.currentSong().perf.events.length }));
  check("a 50/50 blend composes and names itself", info.ev>100 && /50%/.test(info.label),
        `${info.label} · ${info.tempo} bpm · ${info.ev} events`);

  /* soloing back gives the untouched genre */
  await pg.evaluate((X)=>{ __solo(X); newSong(1); },X);
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
  const plain = await pg.evaluate((X) =>
    MK2.composeSong(1, MK2.currentSong().chart.rig, X).perf.events.length, X);
  check("soloing gives the plain genre back, not a blend of one",
        solo.blend===null && solo.ev===plain,
        `${solo.label} · ${solo.ev} events (genre composes ${plain}) · blend ${solo.blend}`);

  /* ── AND EVERY GENRE CAN ACTUALLY BE CHOSEN, not just the three above ──────
     The panel having the right NUMBER of sliders does not prove each one
     reaches a genre that composes. This solos each in turn through the real
     handler and asks for a song. It is the check that would have told anyone
     that `dungeonsynth` existed. */
  const reach = [];
  for(const g of GS){
    const r = await pg.evaluate(async (g)=>{
      try{
        __L.clear(); __solo(g); newSong(1);
        const s = MK2.currentSong();
        return { g, ok: s.perf.events.length > 0, ev: s.perf.events.length,
                 named: s.chart.table.label, blend: s.chart.blend };
      }catch(e){ return { g, ok:false, err:String(e.message).slice(0,60) }; }
    }, g);
    reach.push(r);
  }
  const dead = reach.filter(r=>!r.ok);
  check("every genre the program declares composes from its own slider",
        dead.length===0,
        dead.length ? dead.map(r=>`${r.g}: ${r.err||"0 events"}`).join(" | ")
                    : reach.map(r=>`${r.g} ${r.ev}`).join(" · "));

  /* ── THE PANEL SAYS WHAT THE RECORD CAME OUT AS, AND THE BUTTON REDEALS IT ──
     Driven through the real element with a real click, because this file's own
     history says a probe that calls the function behind a control passes while
     every control on the glass is dead: probe_mixer scored 4 of 4 with every
     fader inert. So: read the panel's text, press the button the way a hand
     does, read it again. */
  await pg.evaluate(([X,Y])=>{ __solo(X); __set(Y,0.5); },[X,Y]);
  await pg.evaluate(()=>{ newSong(1); drawBlend(); });
  const madeText = () => pg.evaluate(()=>{
    const m = document.querySelector("#blend .blmade");
    return m ? m.innerText.replace(/\s+/g," ").trim() : "";
  });
  const before = await madeText();
  check("the blend panel says what this record was actually made of",
        /%/.test(before) && before.length > 40, before.slice(0,120));
  /* and it must not put a variable name on the glass -- the erangDrum rule */
  const keys = await pg.evaluate(()=>{
    const t = (SONG.chart.table.blendTraits||[]);
    return t.filter(x=>typeof x.name !== "string").map(x=>x.key);
  });
  check("...in words, with no variable name among them", keys.length===0, keys.join(", ") || "every element named");

  const btn = await pg.$("#blend .blmade .lk");
  check("the panel has a 'deal again' button", !!btn, btn ? "found" : "MISSING");
  if(btn){
    const seedBefore = await pg.evaluate(()=>SONG.chart.seed);
    await btn.click();
    const after = await madeText();
    const seedAfter = await pg.evaluate(()=>SONG.chart.seed);
    const rollAfter = await pg.evaluate(()=>SONG.chart.traitRoll);
    /* THE SHARE IS KEPT AND THE HALVES MOVE. A button that changed the share
       would be a second seed field; one that changed nothing would be dead. */
    const share = await pg.evaluate(()=>{
      const t = SONG.chart.table.blendTraits, by = {};
      for(const x of t) by[x.genre] = (by[x.genre]||0)+1;
      return Object.values(by).sort((a,b)=>b-a);
    });
    check("...and pressing it deals the same song a different hand",
          after !== before && seedAfter === seedBefore && rollAfter === 1,
          `seed ${seedBefore}->${seedAfter}, deal ${rollAfter}, split ${share.join("/")}`);
    check("...without moving what the sliders asked for",
          Math.abs(share[0] - share[share.length-1]) <= 1,
          `split ${share.join("/")} on a 50/50 fader`);
  }

  /* ── AND THE HAND CAN AIM ONE ELEMENT, THROUGH THE REAL CONTROL ────────────
     Driven by selecting on the actual element and firing a real change event,
     for the probe_mixer reason: the maths behind a control can be perfect while
     the control on the glass does nothing. */
  const traitRow = await pg.evaluate(()=>{
    const rows = [...document.querySelectorAll("#blend .bltrait")];
    if(!rows.length) return null;
    const r = rows.find(x => x.querySelector("select").options.length > 1) || rows[0];
    const sel = r.querySelector("select");
    return { label: r.querySelector("label").textContent,
             options: [...sel.options].map(o=>o.value) };
  });
  check("every element the record is made of has a control to aim it",
        traitRow && traitRow.options.length > 1,
        traitRow ? `${traitRow.label}: ${traitRow.options.join(" / ")}` : "no element rows drawn");
  if(traitRow && traitRow.options.length > 1){
    const want = traitRow.options.find(o=>o!=="auto");
    const got = await pg.evaluate((want)=>{
      const rows = [...document.querySelectorAll("#blend .bltrait")];
      const r = rows.find(x => [...x.querySelector("select").options].some(o=>o.value===want));
      const sel = r.querySelector("select");
      sel.value = want;
      sel.dispatchEvent(new Event("change", { bubbles:true }));
      const label = r.querySelector("label").textContent;
      const t = SONG.chart.table.blendTraits.find(x => (x.name||x.key) === label);
      return { label, genre: t && t.genre, asked: t && t.asked, stored: JSON.parse(JSON.stringify(TRAITS)) };
    }, want);
    check("...and choosing a genre on it makes that element come from that genre",
          got.genre === want && got.asked === true && got.stored[Object.keys(got.stored)[0]] === want,
          `${got.label} -> asked for ${want}, got ${got.genre}`);
    /* it must SURVIVE a reroll: a pin the deal can overwrite is not a pin */
    const held = await pg.evaluate((want)=>{
      TRAIT_ROLL += 3; newSong(SONG.chart.seed); drawBlend();
      const t = SONG.chart.table.blendTraits.find(x => x.asked);
      return t && t.genre === want;
    }, want);
    check("...and the reroll cannot take it back off them", held === true, held ? "held" : "the deal overwrote a pin");
    await pg.evaluate(()=>{ for(const k in TRAITS) delete TRAITS[k]; TRAIT_ROLL = 0; newSong(SONG.chart.seed); drawBlend(); });
  }

  check("no uncaught page errors", errs.length===0, errs.join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail?1:0);
})();
