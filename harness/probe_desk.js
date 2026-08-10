#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE DESK — the mixer, driven on the GLASS.

       node harness/probe_desk.js

   WHY THIS EXISTS AND WHY IT DRIVES ELEMENTS. The last mixer defect in this
   project passed `probe_mixer.js` 4 of 4 while every fader, knob and meter on
   the panel was dead: the probe called `MK2.setMixer` and the panel called
   `window.Sound`, which is undefined because `Sound` is a `const`. A probe that
   reaches past the interface only ever proves the thing behind the interface.
   So everything here is a real pointer event on a real element.

   WHAT IT ASKS
     - a strip per part the song plays, and no others (derived, never listed)
     - a MASTER strip
     - every strip's colour IS that part's colour on the roll -- compared to
       `rollHues()` itself, not to a copy of its numbers
     - a part with no line on the roll (the record surface) gets a NEUTRAL
       rather than an invented hue
     - the master fader takes the whole output down, measured at the master meter
     - MUTE silences a part; SOLO silences the others; the silenced strip says so
     - the clear button drops every mute and solo

   `probe_deskgraph.js` is the companion and asks the narrower structural
   question -- what the graph is HOLDING after the glass has been driven.
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/home/user/DeckardsMusicBox/node_modules/playwright');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const F = 'file:///home/user/DeckardsMusicBox/Deckards Orchestrator MK2.html';
let pass=0, fail=0;
const check=(n,ok,d)=>{ console.log((ok?"  ✓ ":"  ✗ FAIL: ")+n+(d?"  ("+d+")":"")); ok?pass++:fail++; };
(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args:['--no-sandbox','--disable-gpu'] });
  const pg = await b.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e.message)));
  pg.on('console',m=>{ if(m.type()==='error') errs.push("CONSOLE: "+m.text()); });
  await pg.goto(F,{waitUntil:'load',timeout:60000});
  await pg.waitForFunction(()=>window.MK2,{timeout:20000});

  // 1. a strip per part the song plays, plus a master
  const s = await pg.evaluate(()=>{
    const strips=[...document.querySelectorAll(".mixch")].map(x=>x.dataset.role);
    const played=[...new Set(MK2.currentSong().perf.events.map(e=>e.role))];
    return {strips, played};
  });
  const parts = s.strips.filter(r=>r!=="__master");
  check("a strip for every part the song plays, and no others",
        parts.length===s.played.length && s.played.every(r=>parts.includes(r)),
        `strips ${parts.join(",")} · played ${s.played.join(",")}`);
  check("...and a MASTER strip", s.strips.includes("__master"), s.strips.join(" "));

  // 2. THE COLOURS ARE THE ROLL'S COLOURS -- the same function, checked as such
  const col = await pg.evaluate(()=>{
    const hues = rollHues(); const out=[];
    for(const st of document.querySelectorAll(".mixch")){
      const role=st.dataset.role; if(role==="__master") continue;
      const ink=getComputedStyle(st).getPropertyValue("--ink").trim();
      const m=ink.match(/hsl\(\s*([\d.]+)/);
      out.push({role, stripHue: m?+m[1]:null, rollHue: hues[role]==null?null:hues[role]});
    }
    return out;
  });
  const mismatched = col.filter(c=>c.rollHue!=null && c.stripHue!==c.rollHue);
  const neutral = col.filter(c=>c.rollHue==null);
  check("every strip's colour IS its colour on the roll",
        mismatched.length===0,
        mismatched.length ? mismatched.map(c=>`${c.role} strip ${c.stripHue} vs roll ${c.rollHue}`).join(" | ")
                          : col.filter(c=>c.rollHue!=null).map(c=>`${c.role} ${c.stripHue}`).join(" · "));
  check("...and a part with no line on the roll gets a neutral, not an invented hue",
        neutral.every(c=>c.stripHue===0 || c.stripHue===null),
        neutral.length? neutral.map(c=>c.role+" -> "+c.stripHue).join(" ") : "no such part in this song");

  // 3. PLAY, then drive the MASTER on the glass and play at the destination
  await pg.evaluate(()=>{ window.__tap = null; });
  await pg.evaluate(()=>document.getElementById("play").click());
  await pg.waitForTimeout(2500);

  const level = () => pg.evaluate(async ()=>{
    const lv = MK2.meterLevels(); return lv ? lv.__master : null;
  });
  async function dragFader(sel, dy){
    const box = await pg.evaluate((sel)=>{
      const f=document.querySelector(sel); if(!f) return null;
      f.scrollIntoView({block:"center"}); const r=f.getBoundingClientRect();
      return {x:r.x+r.width/2,y:r.y+r.height/2};
    }, sel);
    if(!box) return false;
    await pg.mouse.move(box.x, box.y); await pg.mouse.down();
    await pg.mouse.move(box.x, box.y+dy, {steps:6}); await pg.mouse.up();
    await pg.waitForTimeout(600); return true;
  }
  const peakOver = async (ms) => {
    let pk=0; const t0=Date.now();
    while(Date.now()-t0<ms){ const v=await level(); if(v!=null&&v>pk) pk=v; await pg.waitForTimeout(60); }
    return pk;
  };
  const before = await peakOver(1400);
  await dragFader(".mixmaster .mixfader", 120);         // pull the master DOWN
  const after = await peakOver(1400);
  const gotQuieter = before>0 && after < before*0.5;
  check("pulling the MASTER down on the glass makes the whole output quieter",
        gotQuieter,
        `master meter peak ${before.toFixed(4)} -> ${after.toFixed(4)}` +
        (before>0? ` (${(20*Math.log10(Math.max(1e-6,after)/before)).toFixed(1)} dB)`:""));
  await pg.evaluate(()=>{ delete MIXER_TRIM.__master; mixPush(); mixRefreshAll(); });
  await pg.waitForTimeout(500);

  // 4. MUTE and SOLO, clicked as buttons
  const roleToTest = parts.includes("drums") ? "drums" : parts[0];
  const st = await pg.evaluate((r)=>{
    const b=document.querySelector(`.mixch[data-role="${r}"] .mixmute`); if(!b) return null;
    b.click(); return { mute: !!(MIXER_TRIM[r]&&MIXER_TRIM[r].mute),
                        gain: MK2.soundState?1:1 };
  }, roleToTest);
  await pg.waitForTimeout(400);
  const muteAudio = await pg.evaluate((r)=>{
    const lv=MK2.meterLevels(); return lv? lv[r] : null;
  }, roleToTest);
  check(`MUTE on the glass silences that part (${roleToTest})`,
        st && st.mute && (muteAudio===0 || muteAudio<0.0005),
        `trim.mute=${st&&st.mute} · that channel's meter ${muteAudio}`);

  await pg.evaluate((r)=>{ document.querySelector(`.mixch[data-role="${r}"] .mixmute`).click(); }, roleToTest);
  const other = parts.find(r=>r!==roleToTest);
  await pg.evaluate((r)=>{ document.querySelector(`.mixch[data-role="${r}"] .mixsolo`).click(); }, roleToTest);
  await pg.waitForTimeout(700);
  const soloRes = await pg.evaluate(([r,o])=>{
    const lv=MK2.meterLevels();
    const st=document.querySelector(`.mixch[data-role="${o}"]`);
    return { soloed: lv?lv[r]:null, others: lv?lv[o]:null, otherShown: st?st.className:"" };
  }, [roleToTest, other]);
  check(`SOLO on the glass silences everything else (solo ${roleToTest}, play to ${other})`,
        soloRes.others===0 || soloRes.others<0.0005,
        `${roleToTest} ${soloRes.soloed} · ${other} ${soloRes.others}`);
  check("...and the silenced strip SAYS it is silenced",
        /silenced/.test(soloRes.otherShown), soloRes.otherShown);

  const cleared = await pg.evaluate(()=>{
    document.querySelector(".mixclear").click();
    return Object.keys(MIXER_TRIM).filter(r=>MIXER_TRIM[r].mute||MIXER_TRIM[r].solo);
  });
  check("the master's clear button drops every mute and solo", cleared.length===0, cleared.join(" "));

  check("no uncaught page errors", errs.length===0, errs.slice(0,3).join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
