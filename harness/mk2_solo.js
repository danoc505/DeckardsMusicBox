#!/usr/bin/env node
/* SOLO PROBE — render ONE voice at a time and measure it. The seam battery proves
   the notes are lawful; this proves the notes make SOUND, which is a different
   claim and the only one the owner cares about.

     node harness/mk2_solo.js <outdir> [voice,voice,...]

   Every voice gets the same four events (two pitches x two gains) so the numbers
   are comparable across the palette. A voice that renders silence, clips, or
   sits 20 dB off its neighbours is a bug you can see before you hear it. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path'), fs = require('fs');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const OUT = process.argv[2];
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const PITCHED = ["keys","rhodes","bass","lead","counter","cs80",
                 "chipKeys","chipBass","chipLead","chipCounter"];
const PERC    = ["kick","snare","ghost","hat","openhat",
                 "dacKick","dacSnare","psgHat","psgOpenhat"];
const VOICES = (process.argv[3] || PITCHED.concat(PERC).join(",")).split(",");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  for(const voice of VOICES){
    const r = await page.evaluate(async ({ voice, pitched }) => {
      const evs = [];
      const at = [0.2, 1.4, 2.6, 3.8], pitches = [40, 52, 64, 76], gains = [1.0, 0.55, 1.0, 0.55];
      for(let i = 0; i < 4; i++){
        const e = { tSec: at[i], durSec: 0.8, voice, role: "solo", lane: voice, gain: gains[i] };
        if(pitched) e.pitch = pitches[i];
        evs.push(e);
      }
      let err = null, b64 = null;
      try{
        const blob = await MK2.renderWav(evs, 5.4, 44100);
        const ab = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(ab);
        for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        b64 = btoa(s);
      }catch(e){ err = String(e && e.message || e); }
      return { b64, err };
    }, { voice, pitched: PITCHED.includes(voice) });
    if(r.err){ console.log(`  ${voice}: THREW ${r.err}`); continue; }
    fs.writeFileSync(path.join(OUT, `solo_${voice}.wav`), Buffer.from(r.b64, 'base64'));
    console.log(`  wrote solo_${voice}.wav`);
  }
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
