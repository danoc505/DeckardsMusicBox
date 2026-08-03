/* I TURNED ALL THE FADERS DOWN AND I CAN STILL HEAR IT.

   The direct test of that sentence: render a real song with every TR-1000 MIX
   fader at the bottom of its travel, and measure what is left. If the kit is
   silent, the faders own the kit. If anything survives, something is reaching
   the output on a path the fader is not on -- and this measures which path by
   switching the candidates off one at a time.

   The candidates, from reading the graph:
     - the GATED REVERB send, which several voices connect to straight from
       their own gain rather than through the chain
     - the per-voice ECHO and VERB sends
     - the room's own tail

     node harness/probe_faders_down.js
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async () => {
    const LETTERS = ['k','s','t','m','r','c','h','o','a','d'];
    const song = MK2.composeSong(1, 'draw', 'synthwave');
    const S = MK2.soundOf('synthwave');
    /* DRUMS ONLY, so nothing else can be mistaken for the kit */
    const ev = song.perf.events.filter(e => e.role === 'drums' && e.tSec < 12);

    const meas = async label => {
      const blob = await MK2.renderWav(ev, 14, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, song.motion, 0);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      let peak = 0, sum = 0, l3 = 0, hi = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
        if(Math.abs(v) > peak) peak = Math.abs(v);
        sum += v*v;
        l3 += (v - l3) * 0.58;                       // ~6 kHz
        hi += (v - l3) * (v - l3);                   // the "white noise splash" band
      }
      return { label, peak, rms: Math.sqrt(sum/n), hiss: Math.sqrt(hi/n) };
    };
    const setAll = v => { for(const L of LETTERS) MK2.PARAMS['tr1000.' + L + 'Mix'] = v; };
    const rows = [];
    setAll(1.0);                       rows.push(await meas('faders at their default'));
    setAll(0);                         rows.push(await meas('EVERY fader at zero'));
    MK2.PARAMS['tr1000.gate'] = 0;     rows.push(await meas('...and the gated verb off'));
    for(const L of LETTERS){ MK2.PARAMS['tr1000.' + L + 'Verb'] = 0; MK2.PARAMS['tr1000.' + L + 'Echo'] = 0; }
    rows.push(await meas('...and every per-voice send off'));
    MK2.PARAMS['tr1000.revSend'] = 0; MK2.PARAMS['tr1000.dlySend'] = 0;
    rows.push(await meas('...and the kit sends off'));
    return rows;
  });

  console.log('\n=== WITH THE FADERS DOWN, WHAT IS STILL MAKING NOISE ===');
  console.log('  (drums only, synthwave seed 1, 12 seconds)\n');
  console.log('  state                                peak      rms     >6kHz hiss');
  const base = out[0];
  for(const r of out)
    console.log(`  ${r.label.padEnd(34)} ${r.peak.toFixed(4)}  ${r.rms.toFixed(5)}  ${r.hiss.toFixed(5)}` +
                (r === base ? '' : `   (${(20*Math.log10(Math.max(1e-9,r.rms)/Math.max(1e-9,base.rms))).toFixed(1)} dB)`));
  const down = out[1];
  console.log(`\n  the fader row alone takes the kit down ` +
              `${(20*Math.log10(Math.max(1e-9,down.rms)/Math.max(1e-9,base.rms))).toFixed(1)} dB` +
              (down.rms > base.rms * 0.02 ? '  <<< NOT SILENT — something bypasses the faders' : '  — silent'));
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
