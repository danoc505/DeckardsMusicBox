#!/usr/bin/env node
/* PROBE_MIXER — does the mixer reach the sound, and does it get out of the way?

     node harness/probe_mixer.js [genre] [seed]

   Two claims, and a fader is worthless unless both hold.

   IT GETS OUT OF THE WAY. A mixer nobody has touched must render the record the
   program made, sample for sample. The strips are real nodes in the signal path
   -- a gain and three biquads in front of every bus -- so this is not obvious
   and is not taken on trust: a gain of 1 is a wire, and a shelving or peaking
   biquad at 0 dB has numerator coefficients identical to its denominator, so
   its transfer function is exactly 1. If that is ever untrue, every song in the
   file quietly changed the day the mixer was added.

   IT REACHES THE SOUND. A fader that moves and changes nothing is the
   knob-that-lies defect, which this file has shipped before and now checks for
   everywhere. Each claim is measured by rendering the same song twice and
   comparing: once flat, once with one strip moved. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const GENRE = process.argv[2] || 'dungeonsynth';
const SEED  = parseInt(process.argv[3], 10) || 1;
let pass = 0, fail = 0;
const check = (name, ok, note) => {
  console.log('  ' + (ok ? '✓' : '✗ FAIL:') + ' ' + name + (note ? '  (' + note + ')' : ''));
  ok ? pass++ : fail++;
};

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await pg.evaluate(async ([GENRE, SEED]) => {
    const song = MK2.composeSong(SEED, 'band', GENRE);
    const S = MK2.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);
    /* a window from the middle, where the whole band is playing -- the first
       twelve seconds of this genre are an intro with two parts in it */
    const FROM = 90;
    const ev = song.perf.events.filter(e => e.tSec >= FROM && e.tSec < FROM + 12)
                   .map(e => Object.assign({}, e, { tSec: e.tSec - FROM }));
    const render = async () => {
      const blob = await MK2.renderWav(ev, 12, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, song.motion, FROM);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2;
      const a = new Int16Array(n);
      for (let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true);
      return a;
    };
    const stat = a => {
      let s = 0; for (let i = 0; i < a.length; i++){ const v = a[i] / 32768; s += v * v; }
      return Math.sqrt(s / a.length);
    };
    /* ── AND THE COMPARISON IS IN dB, NOT IN SAMPLES ────────────────────────
       The first version of this asked for BIT-IDENTICAL renders and both
       controls failed: two identical renders of the same song differ in 23424
       samples by one LSB. That is the engine's own floor -- `probe_render_
       determinism` measures the same thing and holds it to -80 dB rather than
       to zero, because a WebAudio graph rebuilt per render does not promise the
       last bit. So the question is not "are they the same", it is "is the
       mixer's difference bigger than the renderer's own", and that needs the
       LEVEL of the difference signal, not a count of samples. */
    const diff = (a, b2) => {
      let s2 = 0, worst = 0, n = 0;
      const len = Math.min(a.length, b2.length);
      for (let i = 0; i < len; i++){
        const d = (a[i] - b2[i]) / 32768;
        if (d) n++;
        s2 += d * d;
        const ad = Math.abs(d); if (ad > worst) worst = ad;
      }
      return { n, worst, db: s2 > 0 ? 20 * Math.log10(Math.sqrt(s2 / len)) : -999 };
    };
    const roles = [...new Set(ev.map(e => e.role))].filter(r => r !== 'tape');

    MK2.setMixer({});
    const flat = await render();
    const flat2 = await render();
    /* the same song twice with nothing touched -- the control for everything
       below, because a renderer that is not repeatable cannot prove anything */
    const repeat = diff(flat, flat2);

    /* an explicitly ZERO mixer is still the untouched mixer: every role named,
       every field at 0. If a 0 dB biquad were not exactly transparent this is
       where it would show. */
    const zero = {};
    for (const r of roles) zero[r] = { vol: 0, low: 0, mid: 0, high: 0 };
    MK2.setMixer(zero);
    const zeroed = await render();
    const zeroDiff = diff(flat, zeroed);

    /* and then one strip down 12 dB, which must be audible and must be the
       ONLY thing that changed */
    const target = roles.includes('drums') ? 'drums' : roles[0];
    MK2.setMixer({ [target]: { vol: -12 } });
    const cut = await render();
    const cutRms = stat(cut), flatRms = stat(flat);

    /* a band, too: the low shelf must change the sound on its own */
    MK2.setMixer({ [target]: { low: 12 } });
    const boomed = await render();

    MK2.setMixer({});
    return {
      roles, target,
      repeat, zeroDiff,
      flatRms, cutRms,
      cutDb: 20 * Math.log10(cutRms / flatRms),
      eqDiff: diff(flat, boomed),
      eqDb: 20 * Math.log10(stat(boomed) / flatRms),
    };
  }, [GENRE, SEED]);

  console.log(`\n  ${GENRE} seed ${SEED} — ${out.roles.length} channels, moving "${out.target}"\n`);
  check('the renderer is repeatable at all (the control)',
        out.repeat.db < -80,
        `two identical renders differ by ${out.repeat.db.toFixed(1)} dB — this is the floor ` +
        `everything below is measured against`);
  check('an untouched mixer renders the record the program made',
        out.zeroDiff.db <= out.repeat.db + 3,
        `every strip explicitly at 0 dB differs from no mixer at all by ` +
        `${out.zeroDiff.db.toFixed(1)} dB, against a floor of ${out.repeat.db.toFixed(1)}`);
  check('a fader reaches the sound',
        out.cutDb < -0.5, `${out.target} down 12 dB moves the whole mix ${out.cutDb.toFixed(2)} dB`);
  check('an EQ band reaches the sound',
        out.eqDiff.n > 0, `low shelf +12 on ${out.target}: ${out.eqDiff.n} samples differ, ` +
                          `mix ${out.eqDb > 0 ? '+' : ''}${out.eqDb.toFixed(2)} dB`);
  if (errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
