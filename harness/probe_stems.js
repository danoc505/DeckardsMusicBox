#!/usr/bin/env node
/* PROBE_STEMS — how loud is each part, in the actual audio?

     node harness/probe_stems.js [genre] [seed] [seconds]

   WHY THIS EXISTS, and it is the most expensive lesson in this file.

   The user reported "the chord track is too loud, I can't hear the drums" and
   "a war drum is big, it's barely audible right now". Every response to that
   measured NOTE COUNTS -- how many events each role writes -- because that is
   what every other tool here reports. Note counts are not loudness. A part can
   write a tenth of the notes and be twice as loud; a struck drum writes one
   event a bar and either fills the room or does not, and nothing about the
   event says which.

   So this renders each role ALONE through the real graph and measures it:
   RMS, peak, and its level relative to the full mix. That is the number the
   complaint is actually about, and until this existed there was no way to
   answer it except by guessing at gain constants.

   Roles are rendered through `MK2.renderWav`, the same door the WAV export
   uses, so what is measured is the signal chain the person playing it hears -- voice,
   per-lane chain, bus, sends, master -- and not a voice in isolation. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const GENRE = process.argv[2] || 'dungeonsynth';
const SEED  = parseInt(process.argv[3], 10) || 7;
const SECS  = parseInt(process.argv[4], 10) || 70;
const FROM  = parseInt(process.argv[5], 10) || 0;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await pg.evaluate(async ([GENRE, SEED, SECS, FROM]) => {
    /* ── AND RMS IS NOT LOUDNESS ────────────────────────────────────────────
       An verdict is not a power meter. At 40 Hz it needs roughly 45 dB more level
       than at 1 kHz to hear the same loudness, so a part living in the bottom
       octave can carry most of the ENERGY in a mix -- eating the headroom, and
       the limiter, that everything else has to share -- while being close to
       inaudible. Every number this probe printed before now was unweighted,
       which means it could not tell "enormous" from "loud", and those are the
       two different things the report "it's eating everything" and the report
       "it's not even there" were describing at once.

       A-WEIGHTING is the standard answer: the IEC 61672 curve. It is BUILT here
       from the standard's own pole/zero definition rather than pasted as a list
       of sixth-order coefficients -- the first attempt did that from memory,
       the filter diverged, and every reading came back -inf. A published
       constant you cannot check is a constant you cannot trust, so this
       constructs the filter and then CHECKS IT against three points of the
       published curve before it is used on anything.

         H(s) = K s^4 / ((s+w1)^2 (s+w2) (s+w3) (s+w4)^2)
         f1 20.598997   f2 107.65265   f3 737.86223   f4 12194.217   Hz

       Six first-order sections, each bilinear-transformed: four highpasses
       give the s^4, two lowpasses at f4 close the top. K is found by measuring
       the filter's own response at 1 kHz, where the curve is 0 dB by
       definition -- so the normalisation is measured rather than asserted. */
    const AW_HZ = [20.598997, 20.598997, 107.65265, 737.86223];   // highpass poles
    const AW_LP = [12194.217, 12194.217];                          // lowpass poles
    const SR = 44100, C2 = 2 * SR;
    const sections = [];
    /* NOT PREWARPED, and that is a decision rather than an oversight. Warping
       each section individually was tried and made it worse at the top (8 kHz
       went from -1.8 to -0.3 against a target of -1.1, and 4 kHz drifted out
       with it) because it is the CASCADE's combined response that has to land
       on the curve, not each pole separately. Plain bilinear is the standard
       digital A-weighting and its known cost is a fraction of a dB above about
       5 kHz. That is charged against a question about whether a 44 Hz drum can
       be heard, so it is charged where it does not matter -- and the check
       below is tight where it does and honest about where it is not. */
    const warp = f => 2 * Math.PI * f;
    for (const f of AW_HZ) {
      const w = warp(f), d = C2 + w;
      sections.push({ b0: C2 / d, b1: -C2 / d, a1: (w - C2) / d });
    }
    for (const f of AW_LP) {
      const w = warp(f), d = C2 + w;
      sections.push({ b0: w / d, b1: w / d, a1: (w - C2) / d });
    }
    const runFilter = (samples, k) => {
      const x1 = new Float64Array(sections.length), y1 = new Float64Array(sections.length);
      const out = new Float64Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        let v = samples[i];
        for (let s = 0; s < sections.length; s++) {
          const S = sections[s];
          const y = S.b0 * v + S.b1 * x1[s] - S.a1 * y1[s];
          x1[s] = v; y1[s] = y; v = y;
        }
        out[i] = v * k;
      }
      return out;
    };
    /* the filter's gain at a frequency, measured by running a sine through it */
    const gainAt = (hz, k) => {
      const N = SR;                                  // one second, so a whole number of cycles
      const sig = new Float64Array(N);
      for (let i = 0; i < N; i++) sig[i] = Math.sin(2 * Math.PI * hz * i / SR);
      const y = runFilter(sig, k);
      let s = 0; for (let i = N >> 1; i < N; i++) s += y[i] * y[i];   // second half: settled
      return Math.sqrt(s / (N - (N >> 1))) * Math.SQRT2;
    };
    const AW_K = 1 / gainAt(1000, 1);
    /* ── AND THE INSTRUMENT CHECKS ITSELF ────────────────────────────────────
       IEC 61672 table 3, to the tenth of a dB. If this does not match, every
       number below it is meaningless and it says so instead of printing them. */
    const awCheck = [[31.5, -39.4, 0.3], [125, -16.1, 0.3], [1000, 0.0, 0.1],
                     [4000, 1.0, 0.3], [8000, -1.1, 1.0]]
      .map(([hz, want, tol]) => {
        const got = 20 * Math.log10(gainAt(hz, AW_K));
        return { hz, want, got, tol, ok: Math.abs(got - want) <= tol };
      });
    const aWeightBlock = samples => runFilter(samples, AW_K);
    const song = MK2.composeSong(SEED, 'band', GENRE);
    /* a window, because the balance in an intro is not the balance in a
       full section and averaging the two hides both */
    const ev = song.perf.events.filter(e => e.tSec >= FROM && e.tSec < FROM + SECS && e.role !== 'tape')
                   .map(e => Object.assign({}, e, { tSec: e.tSec - FROM }));
    /* ── AND IT MUST BE RENDERED WITH THE SONG'S OWN SOUND ────────────────
       This called `renderWav(list, SECS, 44100)` and stopped there, so every
       measurement it has ever printed was made on a graph with NO space, NO
       kick voicing, NO drum drive and NO motion -- the factory defaults, not
       the song. It mattered most for exactly the part the probe exists to
       answer questions about: `chTune` returns 1 flat when the graph has no
       drum machine on it, so the war drum's tuning and decay were switched off
       in every reading. A whole round of drum-voicing changes came back
       "identical to the decimal" because of this line, which is the tool
       lying rather than the change failing. */
    const S = MK2.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);
    const meas = async (list, label) => {
      if (!list.length) return null;
      const blob = await MK2.renderWav(list, SECS, 44100, S.space, S.kick,
                                       S.drumDrive, S.gate, song.motion, FROM);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      let sum = 0, peak = 0, aSum = 0;
      const mono = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const l = dv.getInt16(44 + (i * 2) * 2, true) / 32768;
        const r = dv.getInt16(44 + (i * 2 + 1) * 2, true) / 32768;
        const m = (l + r) / 2;
        mono[i] = m;
        sum += m * m;
        const a = Math.abs(m); if (a > peak) peak = a;
      }
      { const w = aWeightBlock(mono); for (let i = 0; i < n; i++) aSum += w[i] * w[i]; }
      /* ── AND HOW MUCH OF IT IS A HIT RATHER THAN A HUM ─────────────────────
         Level answers "can I hear it" and says nothing about "does it punch".
         Two numbers do:
           CREST  peak minus RMS. A struck drum is mostly silence with a spike
                  in it, so its crest is high; a drum whose decay runs into the
                  next strike averages up and its crest COLLAPSES. This is the
                  standard measure of transient life and it is the one that
                  goes the wrong way when a drum is made "bigger" by lengthening
                  it.
           GAP    the share of the window sitting more than 30 dB under the
                  peak -- literally, how much silence there is between the
                  hits. A march has gaps. A drone does not. */
      let quiet = 0;
      const floorAmp = peak * 0.0316;             // -30 dB from this part's peak
      let env = 0;
      for (let i = 0; i < n; i++) {
        const l = dv.getInt16(44 + (i * 2) * 2, true) / 32768;
        const r = dv.getInt16(44 + (i * 2 + 1) * 2, true) / 32768;
        const a = Math.abs((l + r) / 2);
        env = a > env ? a : env * 0.9995;          // ~45 ms fall, a verdict's window
        if (env < floorAmp) quiet++;
      }
      return { label, rms: Math.sqrt(sum / n), arms: Math.sqrt(aSum / n), peak, n: list.length, gap: quiet / n };
    };
    const rows = [await meas(ev, 'ALL')];
    /* ── AND SOLO IS NOT THE SAME QUESTION AS AUDIBLE ─────────────────────
       "vs whole mix" above compares a part rendered ALONE against the full
       render, and that comparison flatters every part that is rendered alone:
       the master chain ends in a soft clip and a 12:1 limiter at -6 dB, and a
       lone drum barely touches either while the full mix sits on both. So a
       drum can measure LOUDER THAN THE MIX on its own and still be squashed
       flat the moment the pads are there holding the limiter down. Low
       frequencies make it worse, because they carry the most amplitude for the
       least loudness and therefore eat the most headroom.

       LEAVE-ONE-OUT is the honest question, and it is the user's question:
       take this part OUT of the full mix and see whether the mix changes. If
       removing a part moves the level by a tenth of a dB then that part is not
       in the record, whatever it measures alone. Reported as "missed": how much
       quieter the whole mix gets without it. */
    const withoutOf = {};
    for (const r of [...new Set(ev.map(e => e.role))]) {
      rows.push(await meas(ev.filter(e => e.role === r), r));
      const w = await meas(ev.filter(e => e.role !== r), 'no ' + r);
      withoutOf[r] = w ? { rms: w.rms, arms: w.arms } : null;
    }
    /* the individual drums, because "the war drum is barely audible" is a
       claim about one voice inside the drum bus and not about the bus */
    for (const v of [...new Set(ev.filter(e => e.role === 'drums').map(e => e.voice))])
      rows.push(await meas(ev.filter(e => e.voice === v), '  ↳ ' + v));
    return { rows: rows.filter(Boolean), picks: song.chart.picks, withoutOf, awCheck,
             bars: song.form.nBars, secs: Math.round(song.perf.seconds) };
  }, [GENRE, SEED, SECS, FROM]);

  const db = v => v > 0 ? (20 * Math.log10(v)).toFixed(1) : '-inf';
  const all = out.rows.find(r => r.label === 'ALL');
  console.log(`\n  ${GENRE} seed ${SEED} — ${out.bars} bars / ${out.secs}s, ${FROM}-${FROM+SECS}s, each part rendered ALONE`);
  console.log(`  drums:${out.picks.drums}  keys:${out.picks.keys}  keys2:${out.picks.keys2}  lead:${out.picks.lead}\n`);
  console.log('  A-weighting filter self-check (IEC 61672 table 3):');
  console.log('    ' + out.awCheck.map(c => `${c.hz}Hz want ${c.want.toFixed(1)} got ${c.got.toFixed(1)}` +
                                            (c.ok ? '' : '  <-- WRONG')).join('\n    '));
  if (out.awCheck.some(c => !c.ok)) console.log('\n  A-WEIGHTED COLUMNS ARE NOT TRUSTWORTHY.');
  console.log('');
  console.log('  part               notes   RMS dB   A-wt dB  crest   gap   MISSED   MISSED(A)');
  for (const r of out.rows) {
    const wo = out.withoutOf[r.label];
    const missed = (r.label === 'ALL' || !wo) ? ''
                 : (20 * Math.log10(all.rms / wo.rms)).toFixed(2) + ' dB';
    const missedA = (r.label === 'ALL' || !wo) ? ''
                 : (20 * Math.log10(all.arms / wo.arms)).toFixed(2) + ' dB';
    console.log('  ' + r.label.padEnd(18) + String(r.n).padStart(5) +
      db(r.rms).padStart(9) + db(r.arms).padStart(10) +
      (20 * Math.log10(r.peak / r.rms)).toFixed(1).padStart(7) +
      (r.gap * 100).toFixed(0).padStart(5) + '%' + missed.padStart(9) + missedA.padStart(11));
  }
  console.log('\n  crest  = peak minus average, in dB: how much of this part is a HIT rather than a hum.');
  console.log('  gap    = share of the window more than 30 dB under its own peak: silence between hits.');
  console.log('  A-wt   = the same signal through the IEC 61672 A curve: how loud it IS, not how much');
  console.log('           power it carries. The gap between RMS and A-wt is how much of a part lives');
  console.log('           below where hearing does.');
  console.log('  MISSED = how much QUIETER the whole mix gets when this part is removed from it,');
  console.log('           unweighted and A-weighted. A part with a big MISSED and a small MISSED(A)');
  console.log('           is eating the headroom of a record it cannot be heard in.');
  console.log('           This is the only column that answers "is it actually there". A part can be');
  console.log('           louder than the mix rendered alone and still miss by a tenth of a dB, because');
  console.log('           soloing dodges the master limiter that the full mix is sitting on.');
  if (errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  await b.close();
})();
