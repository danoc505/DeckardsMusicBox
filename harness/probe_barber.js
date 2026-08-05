/* DOES THE BARBERPOLE STILL EXIST AT THE END OF THE SONG?

   The pole is the one unit in the rack that is supposed to do the SAME thing
   forever -- notches climbing and never arriving. That makes it the one unit
   whose failure is invisible from a single render's total level: it does not
   go wrong, it goes ABSENT, and a wash that quietly stops is a wash nobody
   notices stopping.

   It had. Chrome's `Biquad::SetNotchParams` does `q = max(0, q)` and at q == 0
   installs all-zero coefficients, so a notch whose Q touches zero mutes
   everything downstream of it. The window rode Q, its two legs were ridden
   with the same number, and the Q therefore swung symmetrically about zero:
   from the first trough on, at least one of the six notches was always muting.
   Permanently silent from 6.5 s into every playback, on both genres that
   feed it.

   HOW THIS MEASURES IT. Render the same excerpt twice, once with the pole's
   return open and once with it shut, and take the difference signal -- that
   difference IS the pole, isolated from the mix it sits in (the renders are
   deterministic; probe_render_determinism guards that). Then bucket it over
   time. A working pole is a roughly steady band with the sweep's own slow
   undulation in it. A dead one falls off a cliff and stays there.

   TWO SETUP TRAPS, both fallen into and both recorded:

     - NORMALISE BY THE WHOLE RENDER, NOT BY THE BUCKET. A bucket where the
       music is nearly silent makes one LSB of int16 rounding read as -50 dB
       of signal, which is how two seeds first looked like they had no defect.

     - RENDER LONG ENOUGH FOR THE CASCADE TO MEAN ANYTHING. The default CLIMB
       is 0.09 Hz -- one sweep every eleven seconds. A four-second excerpt
       cannot tell a pole that has died from a pole at the quiet end of its
       own window.

   SIXTEEN SECONDS AND ONE SEED by default, because each row is TWO full
   offline renders of the whole rack and they are minutes apiece on four
   cores. Sixteen seconds is two and a half times the 6.5 s at which the unit
   used to die, and a sweep and a half at the default CLIMB -- long enough to
   answer the question, short enough to finish. `MK2_SEEDS=11,3,7` widens it,
   `MK2_GENRE` picks one genre, and `MK2_HTML` points it at another copy of
   the program, which is how the before/after below was measured with THIS
   probe rather than against a memory of one.

   RUN IT ALONE. Four of these at once on a four-core box makes all four
   slower than running them one after another, and the first attempt at the
   before/after did exactly that and finished none of them.

     node harness/probe_barber.js [seconds]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = process.env.MK2_HTML || path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SECS = Number(process.argv[2] || 16);
const SEEDS = (process.env.MK2_SEEDS || "11").split(",").map(Number);

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* WHICH GENRES -- asked of the tables. A probe that names them goes stale
     the day a third genre declares `barberFeeds`. */
  let genres = await page.evaluate(() => MK2.genres().filter(g => {
    const sp = MK2.soundOf(g).space || {};
    return (sp.barberFeeds || []).length > 0;
  }));
  if(process.env.MK2_GENRE) genres = genres.filter(g => g === process.env.MK2_GENRE);
  console.log("\nfeeding the pole: " + genres.join(", ") + "\n");

  for(const genre of genres){
    for(const seed of SEEDS){
      const r = await page.evaluate(async ([genre, seed, SECS]) => {
        MK2.loadParams(genre);
        const song = MK2.composeSong(seed, undefined, genre);
        const S = MK2.soundOf(genre);
        const ev = song.perf.events.filter(e => e.voice === 'tape' || e.tSec < SECS)
          .map(e => e.voice === 'tape' ? Object.assign({}, e, { tSec: 0, durSec: SECS + 2 }) : e);
        const render = async trims => {
          for(const k in trims) MK2.TRIM[k] = trims[k];
          const blob = await MK2.renderWav(ev, SECS, 44100, S.space, S.kick, S.drumDrive,
                                           S.gate, song.motion, 0);
          for(const k in trims) delete MK2.TRIM[k];
          const ab = await blob.arrayBuffer(), dv = new DataView(ab);
          const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
          for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
          return a;
        };
        const cMix = MK2.CONTROL["barber.mix"], atMix = MK2.panelValue("barber", "mix");
        const open = await render({});
        const shut = await render({ "barber.mix": cMix.min - atMix });

        /* the difference IS the pole */
        const n = Math.min(open.length, shut.length);
        let mix = 0;
        for(let i = 0; i < n; i++) mix += open[i] * open[i];
        mix = Math.sqrt(mix / n);
        const BUCKET = Math.round(44100 * 0.5) * 2;      // half a second, stereo interleaved
        const buckets = [];
        for(let s = 0; s + BUCKET <= n; s += BUCKET){
          let q = 0;
          for(let i = s; i < s + BUCKET; i++){ const d = open[i] - shut[i]; q += d * d; }
          buckets.push(20 * Math.log10(Math.sqrt(q / BUCKET) / (mix + 1e-30) + 1e-30));
        }
        /* and whether the pole's own output ever goes exactly, digitally zero:
           the mute this probe exists for is not a fade, it is all-zero
           coefficients, so it shows as a run of identical samples in `open`
           where `shut` is also identical -- i.e. the difference is bit-zero. */
        let zero = 0, run = 0, longest = 0;
        for(let i = 0; i < n; i++){
          if(open[i] === shut[i]){ zero++; run++; if(run > longest) longest = run; }
          else run = 0;
        }
        return { buckets, zeroPct: 100 * zero / n, longest: longest / 2 / 44100 };
      }, [genre, seed, SECS]);

      const b0 = r.buckets;
      const first = b0.slice(0, 6), last = b0.slice(-6);
      const avg = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
      /* where it dies, if it does: the first bucket after which nothing ever
         comes back above 20 dB under the opening level */
      const floor = avg(first) - 20;
      let died = null;
      for(let i = 0; i < b0.length; i++)
        if(b0.slice(i).every(v => v < floor)){ died = i * 0.5; break; }
      console.log("  " + genre.padEnd(11) + "seed " + String(seed).padStart(2) +
        "   pole vs mix: first 3 s " + avg(first).toFixed(1).padStart(6) +
        " dB, last 3 s " + avg(last).toFixed(1).padStart(6) + " dB" +
        "   silent samples " + r.zeroPct.toFixed(2) + "%" +
        (died != null ? "   <<< DIES AT " + died.toFixed(1) + " s" : ""));
    }
  }
  if(errs.length) console.log("\nPAGE ERRORS: " + errs.slice(0, 3).join(" | "));
  await b.close();
})();
