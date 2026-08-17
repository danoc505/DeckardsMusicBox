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
/* ── AND IT COULD NOT BE POINTED AT THIS PROJECT AT ALL ────────────────────
   The path was hardcoded to the six-genre program, so running it against
   `Boxcar Synth.html` silently measured a DIFFERENT FILE and printed "lofi" as
   the genre under test. Two stale references in one guard — the file and the
   genre — and between them it could report a clean bill of health for a build
   it had never opened. Takes a path, defaults to the project. */
const HTML = path.resolve(process.argv[2] || path.join(__dirname, '..', 'Boxcar Synth.html'));
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async () => {
    const LETTERS = ['k','s','t','m','r','c','h','o','a','d'];
    /* ── IT NAMED A GENRE, AND THE GENRE WAS DELETED ──────────────────────
       This composed `synthwave`, which no longer exists in this file, so it
       fell through to a table that is also gone, rendered an empty record and
       reported that the fader row takes the kit down 153.8 dB "silent". GREEN
       BECAUSE IT WAS MEASURING NOTHING — the exact failure mode this probe was
       written to catch, in the probe itself.
       It asks the program which genres there are now. [Law 4] */
    const GEN = MK2.genres()[0];
    const song = MK2.composeSong(1, 'draw', GEN);
    const S = MK2.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);
    /* DRUMS ONLY, so nothing else can be mistaken for the kit */
    /* ── AND AT A MOMENT THE KIT IS ACTUALLY PLAYING ──────────────────────
       This took the first twelve seconds flat. On a genre whose record OPENS
       IN A RAIL YARD WITH THE TRAIN STANDING there are no drums there at all,
       so it rendered silence and then proudly reported that pulling the faders
       down made it silent — 0.0 dB of "the fader row takes the kit down".
       Three stale assumptions in one guard: the file, the genre, and now the
       window. Ask the record where its drums are. */
    const all = song.perf.events.filter(e => e.role === 'drums').sort((a, z) => a.tSec - z.tSec);
    let FROM = 0, bestN = 0;
    for(const e of all){
      const n = all.filter(x => x.tSec >= e.tSec && x.tSec < e.tSec + 12).length;
      if(n > bestN){ bestN = n; FROM = e.tSec; }
    }
    const ev = all.filter(e => e.tSec >= FROM && e.tSec < FROM + 12)
                  .map(e => Object.assign({}, e, { tSec: e.tSec - FROM }));

    const meas = async label => {
      const blob = await MK2.renderWav(ev, 14, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, song.motion, FROM);
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
    return { rows, genre: GEN, from: FROM };
  });

  console.log('\n=== WITH THE FADERS DOWN, WHAT IS STILL MAKING NOISE ===');
  console.log('  (drums only, ' + out.genre + ' seed 1, 12 seconds from ' +
              Math.floor(out.from / 60) + ':' + String(Math.round(out.from % 60)).padStart(2, '0') + ')\n');
  console.log('  state                                peak      rms     >6kHz hiss');
  const base = out.rows[0];
  for(const r of out.rows)
    console.log(`  ${r.label.padEnd(34)} ${r.peak.toFixed(4)}  ${r.rms.toFixed(5)}  ${r.hiss.toFixed(5)}` +
                (r === base ? '' : `   (${(20*Math.log10(Math.max(1e-9,r.rms)/Math.max(1e-9,base.rms))).toFixed(1)} dB)`));
  const down = out.rows[1];
  console.log(`\n  the fader row alone takes the kit down ` +
              `${(20*Math.log10(Math.max(1e-9,down.rms)/Math.max(1e-9,base.rms))).toFixed(1)} dB` +
              (down.rms > base.rms * 0.02 ? '  <<< NOT SILENT — something bypasses the faders' : '  — silent'));
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
