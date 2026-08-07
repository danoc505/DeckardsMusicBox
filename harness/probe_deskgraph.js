/* THIRD VERSION, and the two before it are the point.
     v1 closed the drums fader and watched the MASTER while the rest of the band
        played -- measured the band (-0.3 dB), said nothing about the sends.
     v2 soloed the drums first, which was right, but compared two peak windows
        at DIFFERENT SONG POSITIONS, so the music moved between the readings and
        the level went UP. An A/B whose two halves are not the same audio is not
        an A/B.
   So: ask the GRAPH what it is holding, driven from the GLASS. The panel is
   already proven to reach setMixer (probe_desk), so the remaining claim is
   narrow and structural -- "the kit's sends follow the drums fader" -- and that
   is a number, not a loudness. */
const { chromium } = require('/home/user/DeckardsMusicBox/node_modules/playwright');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const F = 'file:///home/user/DeckardsMusicBox/Deckards Orchestrator MK2.html';
let pass=0, fail=0;
const check=(n,ok,d)=>{ console.log((ok?"  ✓ ":"  ✗ FAIL: ")+n+(d?"  ("+d+")":"")); ok?pass++:fail++; };
const dbOf = v => v>0 ? (20*Math.log10(v)).toFixed(1)+" dB" : "-inf";
(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args:['--no-sandbox','--disable-gpu'] });
  const pg = await b.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e.message)));
  await pg.goto(F,{waitUntil:'load',timeout:60000});
  await pg.waitForFunction(()=>window.MK2,{timeout:20000});
  await pg.evaluate(()=>document.getElementById("play").click());
  await pg.waitForTimeout(2000);

  const S = () => pg.evaluate(()=>MK2.soundState());

  const rest = await S();
  check("AT REST every one of these is a wire (1.0), so an untouched program is the graph it always was",
        rest.master===1 && rest.dSend && rest.dSend.echo===1 && rest.dSend.verb===1 &&
        Object.values(rest.chan).every(v=>v===1),
        `master ${rest.master} · kit sends echo ${rest.dSend.echo} verb ${rest.dSend.verb} gate ${rest.dSend.gate} · channels ${[...new Set(Object.values(rest.chan))].join(",")}`);

  // drive the DRUMS fader on the glass
  const box = await pg.evaluate(()=>{
    const f=document.querySelector('.mixch[data-role="drums"] .mixfader');
    if(!f) return null; f.scrollIntoView({block:"center"});
    const r=f.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await pg.mouse.move(box.x,box.y); await pg.mouse.down();
  await pg.mouse.move(box.x, box.y+70,{steps:8}); await pg.mouse.up();
  await pg.waitForTimeout(500);

  const pulled = await S();
  const trim = await pg.evaluate(()=>MIXER_TRIM.drums.vol);
  check("pulling the DRUMS fader moves the drums channel",
        pulled.chan.drums < 0.999,
        `fader ${trim} dB -> channel gain ${pulled.chan.drums.toFixed(4)} (${dbOf(pulled.chan.drums)})`);
  check("...AND the kit's own echo / reverb / gate sends move WITH it",
        Math.abs(pulled.dSend.echo - pulled.chan.drums) < 1e-9 &&
        Math.abs(pulled.dSend.verb - pulled.chan.drums) < 1e-9 &&
        Math.abs(pulled.dSend.gate - pulled.chan.drums) < 1e-9,
        `channel ${pulled.chan.drums.toFixed(4)} · echo ${pulled.dSend.echo.toFixed(4)} · verb ${pulled.dSend.verb.toFixed(4)} · gate ${pulled.dSend.gate.toFixed(4)}`);
  check("...and no OTHER channel moved",
        Object.keys(pulled.chan).filter(r=>r!=="drums").every(r=>pulled.chan[r]===1),
        Object.entries(pulled.chan).map(([r,v])=>r+" "+v.toFixed(2)).join(" · "));

  // MUTE takes the sends too
  await pg.evaluate(()=>{ delete MIXER_TRIM.drums.vol; mixPush();
                          document.querySelector('.mixch[data-role="drums"] .mixmute').click(); });
  await pg.waitForTimeout(400);
  const muted = await S();
  check("MUTING the drums takes their sends with them, so a muted kit leaves no reverb behind",
        muted.chan.drums===0 && muted.dSend.echo===0 && muted.dSend.verb===0 && muted.dSend.gate===0,
        `channel ${muted.chan.drums} · echo ${muted.dSend.echo} · verb ${muted.dSend.verb} · gate ${muted.dSend.gate}`);

  // and the MASTER
  await pg.evaluate(()=>{ document.querySelector('.mixch[data-role="drums"] .mixmute').click(); });
  const mbox = await pg.evaluate(()=>{
    const f=document.querySelector('.mixmaster .mixfader'); f.scrollIntoView({block:"center"});
    const r=f.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await pg.mouse.move(mbox.x,mbox.y); await pg.mouse.down();
  await pg.mouse.move(mbox.x, mbox.y+60,{steps:8}); await pg.mouse.up();
  await pg.waitForTimeout(400);
  const m = await S();
  const mtrim = await pg.evaluate(()=>MIXER_TRIM.__master.vol);
  check("the MASTER fader moves the one gain every path has already reached",
        m.master < 0.999 && Math.abs(20*Math.log10(m.master) - mtrim) < 0.05,
        `fader ${mtrim} dB -> master gain ${m.master.toFixed(4)} (${dbOf(m.master)})`);

  check("no uncaught page errors", errs.length===0, errs.slice(0,3).join(" | "));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
