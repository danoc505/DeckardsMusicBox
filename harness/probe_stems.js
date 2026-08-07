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
   uses, so what is measured is the signal chain a listener hears -- voice,
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
      let sum = 0, peak = 0;
      for (let i = 0; i < n; i++) {
        const l = dv.getInt16(44 + (i * 2) * 2, true) / 32768;
        const r = dv.getInt16(44 + (i * 2 + 1) * 2, true) / 32768;
        const m = (l + r) / 2;
        sum += m * m;
        const a = Math.abs(m); if (a > peak) peak = a;
      }
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
        env = a > env ? a : env * 0.9995;          // ~45 ms fall, an ear's window
        if (env < floorAmp) quiet++;
      }
      return { label, rms: Math.sqrt(sum / n), peak, n: list.length, gap: quiet / n };
    };
    const rows = [await meas(ev, 'ALL')];
    for (const r of [...new Set(ev.map(e => e.role))])
      rows.push(await meas(ev.filter(e => e.role === r), r));
    /* the individual drums, because "the war drum is barely audible" is a
       claim about one voice inside the drum bus and not about the bus */
    for (const v of [...new Set(ev.filter(e => e.role === 'drums').map(e => e.voice))])
      rows.push(await meas(ev.filter(e => e.voice === v), '  ↳ ' + v));
    return { rows: rows.filter(Boolean), picks: song.chart.picks,
             bars: song.form.nBars, secs: Math.round(song.perf.seconds) };
  }, [GENRE, SEED, SECS, FROM]);

  const db = v => v > 0 ? (20 * Math.log10(v)).toFixed(1) : '-inf';
  const all = out.rows.find(r => r.label === 'ALL');
  console.log(`\n  ${GENRE} seed ${SEED} — ${out.bars} bars / ${out.secs}s, ${FROM}-${FROM+SECS}s, each part rendered ALONE`);
  console.log(`  drums:${out.picks.drums}  keys:${out.picks.keys}  keys2:${out.picks.keys2}  lead:${out.picks.lead}\n`);
  console.log('  part               notes    RMS dB    peak dB   vs whole mix   crest    gap');
  for (const r of out.rows) {
    const rel = 20 * Math.log10(r.rms / all.rms);
    console.log('  ' + r.label.padEnd(18) + String(r.n).padStart(5) +
      db(r.rms).padStart(10) + db(r.peak).padStart(11) +
      (r.label === 'ALL' ? '' : (rel > 0 ? '+' : '') + rel.toFixed(1) + ' dB').padStart(14) +
      (20 * Math.log10(r.peak / r.rms)).toFixed(1).padStart(8) +
      (r.gap * 100).toFixed(0).padStart(6) + '%');
  }
  console.log('\n  crest = peak minus average, in dB: how much of this part is a HIT rather than a hum.');
  console.log('  gap   = share of the window more than 30 dB under its own peak: the silence between hits.');
  if (errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  await b.close();
})();
