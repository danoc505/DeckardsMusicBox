/* DOES THE DESK MOVE AIR. Being on the PER_SONG list proves only that a name was
   written down. This renders the same bar through the same graph with the desk
   at unity and then with one band killed, and reports the energy in each band.

   It also proves the thing that made shelves-and-a-bell the right build instead
   of a three-way crossover: at 0 dB the desk has to be TRANSPARENT, because
   every genre has it in the path whether it rides it or not.

     node harness/probe_desk.js
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
    /* the reference bar: one fixed piece of music with content in all three
       bands, so a change in the numbers can only be the desk */
    const ev = MK2.referenceEvents(120);
    const secs = 2 * 16 * ((60 / 120) / 4) + 1.0;

    const render = async settings => {
      for(const k in settings) MK2.PARAMS['desk.' + k] = settings[k];
      const blob = await MK2.renderWav(ev, secs, 44100);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2, ch = 2;
      const N = 1 << 14;
      const x = new Float64Array(N);
      /* one window from the middle, mono-summed */
      const start = Math.floor((n / ch) * 0.4);
      for(let i = 0; i < N && (start + i) * ch < n; i++)
        x[i] = (dv.getInt16(44 + ((start + i) * ch) * 2, true) / 32768) *
               (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));      // hann
      /* a direct DFT at a handful of band centres is enough and needs no FFT */
      const band = (f0, f1) => {
        let e = 0;
        for(let f = f0; f < f1; f *= 1.06){
          let re = 0, im = 0;
          const w = 2 * Math.PI * f / 44100;
          for(let i = 0; i < N; i++){ re += x[i] * Math.cos(w * i); im += x[i] * Math.sin(w * i); }
          e += (re * re + im * im) / (N * N);
        }
        return 10 * Math.log10(e + 1e-20);
      };
      /* also the raw samples, so "transparent" can be checked as identity and
         not merely as a small number */
      let sum = 0; for(let i = 0; i < N; i++) sum += x[i] * x[i];
      return { low: band(45, 180), mid: band(400, 2000), high: band(4000, 12000),
               rms: Math.sqrt(sum / N), samples: Array.from(x.slice(0, 256)) };
    };

    const NEUTRAL = { low: 0, mid: 0, high: 0, lowF: 200, midF: 1000, highF: 4000 };
    const base = await render(NEUTRAL);
    const killLow  = await render(Object.assign({}, NEUTRAL, { low: -30 }));
    const killHigh = await render(Object.assign({}, NEUTRAL, { high: -30 }));
    const cutMid   = await render(Object.assign({}, NEUTRAL, { mid: -30 }));
    const again    = await render(NEUTRAL);

    /* transparency: neutral rendered twice must be identical, and that is the
       weaker claim. The real one is that neutral is the same audio the program
       made before the desk existed -- which the 300-seed snapshot covers, since
       events do not change and 0 dB shelves are unity gain. */
    let maxDiff = 0;
    for(let i = 0; i < base.samples.length; i++)
      maxDiff = Math.max(maxDiff, Math.abs(base.samples[i] - again.samples[i]));

    return { base, killLow, killHigh, cutMid, maxDiff };
  });

  const d = (a, b2) => (b2 - a).toFixed(2).padStart(7);
  console.log('\n=== the desk, on the reference bar (dB per band) ===');
  console.log('  setting          low      mid     high');
  const row = (n, r) => console.log(`  ${n.padEnd(14)} ${r.low.toFixed(2).padStart(7)}  ${r.mid.toFixed(2).padStart(7)}  ${r.high.toFixed(2).padStart(7)}`);
  row('neutral', out.base);
  row('low killed', out.killLow);
  row('mid cut', out.cutMid);
  row('high killed', out.killHigh);
  console.log('\n=== what each kill actually did (dB change from neutral) ===');
  console.log(`  kill LOW  -> low ${d(out.base.low, out.killLow.low)}   mid ${d(out.base.mid, out.killLow.mid)}   high ${d(out.base.high, out.killLow.high)}`);
  console.log(`  cut  MID  -> low ${d(out.base.low, out.cutMid.low)}   mid ${d(out.base.mid, out.cutMid.mid)}   high ${d(out.base.high, out.cutMid.high)}`);
  console.log(`  kill HIGH -> low ${d(out.base.low, out.killHigh.low)}   mid ${d(out.base.mid, out.killHigh.mid)}   high ${d(out.base.high, out.killHigh.high)}`);
  console.log(`\n  neutral is repeatable to ${out.maxDiff.toExponential(2)} (sample-for-sample)`);
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
