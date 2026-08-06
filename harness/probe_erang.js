#!/usr/bin/env node
/* PROBE_ERANG — does the sample bank play the note it was given?

     node harness/probe_erang.js [midi,midi,...]

   THE ONE QUESTION A SAMPLER HAS TO ANSWER. Every pitched file in the Erang
   pack is named `_C` and the pack is not consistently tuned to one -- measured
   at encode time, the roots run from dead-on to 49 cents sharp, and
   `harness/erang_bank.py` stores what the AUDIO reads rather than what the
   filename claims. If that stored root is wrong the patch plays at the wrong
   pitch, and NOTHING ELSE IN THIS REPOSITORY WOULD NOTICE: the note list is
   identical either way, the seam battery reads notes, the snapshot hashes
   notes, and probe_voices only asks whether a voice made a sound at all.

   So this renders each patch at several notes and reads the pitch back out of
   the audio. It is the sampler's equivalent of the timpani measurement, and it
   carries the same octave guard for the same reason -- an autocorrelation
   reader that takes the strongest peak locks onto 2/f0 whenever the second
   harmonic is loud, which on these patches it often is.

   A patch is reported BAD if the pitch it renders is more than 55 cents from
   the note it was asked for. 55 because a quartertone is 50 and the bank's own
   roots are stored to better than a cent -- anything past that is a wrong
   sample or a wrong root, not tuning. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const NOTES = (process.argv[2] || '48,55,64').split(',').map(Number);

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async (NOTES) => {
    /* driven through PARAMS + renderWav, both of which the program already
       exports -- no probe-only door into the sampler, so what is measured here
       is the same path a song takes */
    const MACH = { erangStrings: 'keys', erangHarp: 'keys', erangLead: 'lead' };
    const rows = [];
    for(const mach in MACH){
      const slot = MACH[mach];
      const ctl = MK2.INSTRUMENTS[mach].controls.find(c => c.k === 'patch');
      for(let p = 0; p <= ctl.max; p++){
        /* PARAMS IS FLAT, keyed "machine.control" -- writing a nested object
           here silently changed nothing and every patch rendered identically,
           which the RMS matching to five decimals is what caught. */
        MK2.PARAMS[mach + '.patch'] = p;
        for(const midi of NOTES){
          const ev = { voice: mach, role: slot, lane: slot, pitch: midi,
                       gain: 0.9, tSec: 0.05, durSec: 1.6 };
          const blob = await MK2.renderWav([ev], 2.2, 44100);
          const ab = await blob.arrayBuffer(), dv = new DataView(ab);
          const n = (ab.byteLength - 44) / 4;
          const from = Math.floor(44100 * 0.30), to = Math.min(n, Math.floor(44100 * 1.30));
          const pcm = [];
          for(let i = from; i < to; i++){
            const l = dv.getInt16(44 + (i * 2) * 2, true) / 32768;
            const r = dv.getInt16(44 + (i * 2 + 1) * 2, true) / 32768;
            pcm.push((l + r) / 2);
          }
          rows.push({ mach, patch: p, midi,
                      want: 440 * Math.pow(2, (midi - 69) / 12), pcm });
        }
      }
    }
    return rows;
  }, NOTES);

  /* the pitch reader lives HERE rather than in the page: it is the instrument,
     and an instrument that shares a process with the thing it measures is one
     shared bug away from agreeing with it by construction */
  const f0 = (x, sr, lo, hi) => {
    let mean = 0; for(const v of x) mean += v; mean /= x.length;
    const s = x.map(v => v - mean);
    const loLag = Math.floor(sr / hi), hiLag = Math.min(Math.floor(sr / lo), s.length - 1);
    let best = 0; const ac = new Float64Array(hiLag + 1);
    for(let lag = loLag; lag <= hiLag; lag++){
      let a = 0; for(let i = 0; i + lag < s.length; i++) a += s[i] * s[i + lag];
      ac[lag] = a; if(a > best) best = a;
    }
    if(best <= 0) return 0;
    /* THE OCTAVE DECISION, made explicitly rather than by scan order. Take the
       strongest lag, then ask whether HALF of it (and a third) is also strong:
       if it is, the strong peak was a multiple of the real period and the
       shorter one is the truth. Scanning upward for "first lag over 90% of
       best" is not the same thing and it read every harp patch an octave low
       at midi 55 -- the sub-octave peak happened to clear the bar first. */
    let bestLag = loLag;
    for(let lag = loLag; lag <= hiLag; lag++) if(ac[lag] === best) { bestLag = lag; break; }
    /* 0.92 AND A LOCAL MAXIMUM. At 0.85 with no shape test this reader had an
       octave-UP bias and disagreed with the bank on three patches the bank had
       right -- two readers with opposite biases and neither able to referee
       the other. A true sub-multiple of the period is a genuine peak, so
       require it to be one. */
    for(const div of [4, 3, 2]){
      const l = Math.round(bestLag / div);
      if(l >= loLag + 1 && l + 1 <= hiLag && ac[l] >= 0.92 * best
         && ac[l] >= ac[l - 1] && ac[l] >= ac[l + 1]) return sr / l;
    }
    return sr / bestLag;
  };

  if(process.env.ERANG_DEBUG){
    for(const r of out){
      if(r.mach !== 'erangHarp' || r.midi !== 55) continue;
      let rms = 0; for(const v of r.pcm) rms += v*v;
      rms = Math.sqrt(rms / r.pcm.length);
      if(r.patch < 3) console.log('  debug ' + r.mach + '#' + r.patch + ' rms ' + rms.toFixed(5));
    }
  }
  let bad = [], n = 0, worst = 0, worstAt = '';
  for(const r of out){
    const got = f0(r.pcm, 44100, r.want / 2.6, r.want * 2.6);
    if(!got) continue;
    n++;
    const cents = 1200 * Math.log2(got / r.want);
    if(Math.abs(cents) > Math.abs(worst)){ worst = cents; worstAt = r.mach + '#' + r.patch + ' @' + r.midi; }
    if(Math.abs(cents) > 55)
      bad.push(`${r.mach}#${r.patch} @midi${r.midi}: wanted ${r.want.toFixed(1)}Hz got ${got.toFixed(1)}Hz (${cents > 0 ? '+' : ''}${cents.toFixed(0)}c)`);
  }
  console.log(`\n  readings: ${n} of ${out.length} (a reading needs a pitch to find)`);
  console.log(`  worst error: ${worst > 0 ? '+' : ''}${worst.toFixed(0)} cents on ${worstAt}`);
  if(bad.length){
    console.log(`\n  ✗ ${bad.length} OUT OF TUNE:`);
    for(const s of bad.slice(0, 25)) console.log('      ' + s);
  } else {
    console.log('\n  ✓ every patch plays the note it was given, within 55 cents');
  }
  if(errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  await b.close();
  process.exit(bad.length || errs.length ? 1 : 0);
})();
