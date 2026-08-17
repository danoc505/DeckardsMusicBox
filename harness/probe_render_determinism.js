/* SAME SEED, SAME SAMPLES — the law, checked on the RENDER.

   Law 7 says a seed reproduces a song exactly, and the 2100-seed snapshot
   proves it for the EVENTS. Nothing proved it for the AUDIO, and that gap hid
   a real regression: adding a room->echo crossing to the matrix closed a cycle
   (the echo already feeds the room), and with that cycle present Chromium
   renders the same song differently every time -- the reference bar went from
   -115 dB between repeat renders to -35 dB, which is audible. It fired even
   with the crossing's gain at ZERO; the connection alone was enough.

   It was found by accident, while trying to prove something else, and only
   because the control was run -- the same build against itself. That control
   is this probe. It is cheap, it is absolute, and it is the difference between
   "the measurements say X" and "the measurements mean anything at all".

   WHAT IT DOES: renders the same events three times in one page and compares
   the samples. Twice per genre's own space, so a genre that wires its effects
   into a loop is caught by its own settings.

   THE FLOOR: repeat renders are not bit-identical even when everything is
   right -- float accumulation through the convolver leaves -92 to -106 dB
   across the seven genres, which is 15+ bits down and inaudible. A cycle
   takes it to -35 dB. The threshold sits in the gap, far from both.

     node harness/probe_render_determinism.js
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* dB. MEASURED both ends: with everything right the seven genres land between
   -92 and -106 (float accumulation through the convolver, 15+ bits down,
   inaudible); with a cycle in the graph they land at -35. The threshold sits
   in the 45 dB gap between those, near neither, so it neither flakes on the
   floor's own wobble nor lets a real cycle through. */
const LIMIT = -80;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const rows = await page.evaluate(async () => {
    const out = [];
    for(const g of MK2.genres()){
      /* composeSong applies the rack itself -- driving the genre <select> and
         waiting on it races the UI's own recompose, which is its own way to
         measure noise instead of the program */
      const song = MK2.composeSong(11, undefined, g);
      const S = MK2.soundOf(g);
      const ev = MK2.referenceEvents(120);
      const render = async () => {
        const blob = await MK2.renderWav(ev, 6, 44100, S.space, S.kick, S.drumDrive, S.gate, null, 0);
        const ab = await blob.arrayBuffer(), dv = new DataView(ab);
        const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
        for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
        return a;
      };
      const d = (X, Y) => {
        let r = 0, q = 0;
        for(let i = 0; i < X.length; i++){ r += X[i] * X[i]; q += (Y[i] - X[i]) * (Y[i] - X[i]); }
        return 10 * Math.log10((q + 1e-30) / (r + 1e-30));
      };
      const A = await render(), B = await render(), C = await render();
      out.push({ genre: g, worst: Math.max(d(A, B), d(A, C), d(B, C)) });
    }
    return out;
  });

  console.log('\n=== same events, rendered three times, per genre ===\n');
  let bad = 0;
  for(const r of rows){
    const ok = r.worst <= LIMIT;
    if(!ok) bad++;
    console.log(`  ${r.genre.padEnd(12)} worst repeat difference ${r.worst.toFixed(1).padStart(8)} dB   ` +
                (ok ? 'repeatable' : '<<< NOT REPEATABLE'));
  }
  console.log(`\n  threshold ${LIMIT} dB` +
              (bad ? `\n  ${bad} genre(s) do not render the same twice — look for a CYCLE in the graph`
                   : '\n  every genre renders the same samples every time'));
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  process.exit(bad ? 1 : 0);
})();
