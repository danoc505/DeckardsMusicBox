/* DOES THE MODDED-OUT SECTION DO ANYTHING. Ten controls went onto the 303's
   panel and four of them replaced constants that were already in the voice --
   so the risk is not that they do nothing, it is that they do nothing NEW.

   Each row renders the same two notes (one accented, one not) with a single knob
   moved from its default to an extreme, and reports how far the sound travelled:
   peak, brightness (zero crossings) and low-band energy. A knob whose row reads
   0.0 everywhere is a knob that is drawn and dead.

     node harness/probe_303.js
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
    /* a slid, accented note and a plain one -- between them they exercise every
       branch in the voice */
    /* ── AND A RUN OF ACCENTS, BECAUSE ONE ACCENT PROVES NOTHING ────────────
       SWEEP SPEED sets how much charge an accent leaves behind for the NEXT
       accent. With a single accented note in the take there is no next one, so
       every position of the switch produced an identical render and the probe
       called it dead -- the fourth measurement in this session that was wrong
       about the code rather than the other way round.

       A control with memory needs material with a sequence in it. Four accents
       in a row, then a plain slid note to hear what the charge left behind. */
    const ev = [{ voice:'acid303', lane:'bass', role:'bass', tSec:0.05, durSec:0.16,
                  gain:0.9, pitch:40, accent:true },
                { voice:'acid303', lane:'bass', role:'bass', tSec:0.25, durSec:0.16,
                  gain:0.9, pitch:40, accent:true },
                { voice:'acid303', lane:'bass', role:'bass', tSec:0.45, durSec:0.16,
                  gain:0.9, pitch:40, accent:true },
                { voice:'acid303', lane:'bass', role:'bass', tSec:0.65, durSec:0.16,
                  gain:0.9, pitch:40, accent:true },
                { voice:'acid303', lane:'bass', role:'bass', tSec:0.90, durSec:0.42,
                  gain:0.9, pitch:47, slide:7 }];
    /* every control the machine declares, so a new knob is covered the day it
       is added rather than the day somebody remembers this list exists */
    const KEYS = MK2.INSTRUMENTS.tb303.controls.map(c => c.k);
    const DEF = {};
    for(const k of KEYS) DEF[k] = MK2.CONTROL['tb303.' + k].def;
    const setAll = o => { for(const k of KEYS) MK2.PARAMS['tb303.' + k] = (k in o) ? o[k] : DEF[k]; };

    const meas = async o => {
      setAll(o);
      const blob = await MK2.renderWav(ev, 1.8, 44100);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      let peak = 0, zc = 0, prev = 0, sum = 0, lp = 0, low = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
        if(Math.abs(v) > peak) peak = Math.abs(v);
        if(Math.abs(v) > 0.001 && (v >= 0) !== (prev >= 0)) zc++;
        prev = v; sum += v*v;
        lp += (v - lp) * 0.02; low += lp*lp;
      }
      /* ── THE ATTACK, MEASURED WHERE THE ATTACK IS ────────────────────────
         SOFT ATTACK spans 0.3 to 30 ms. Thirty milliseconds is 1.7% of a 1.8 s
         render, so peak, RMS and zero-crossings over the whole take literally
         cannot see it -- the probe read -0.17 dB and called the knob dead. The
         fault was the summary statistic, not the knob: an average over 1.8
         seconds is the wrong instrument for a 30 ms event.
         So: how long the FIRST note takes to reach 90% of its own peak. */
      let firstPeak = 0;
      const w0 = Math.round(0.05 * 44100), w1 = Math.round(0.16 * 44100);
      for(let i = w0; i < Math.min(n, w1); i++)
        firstPeak = Math.max(firstPeak, Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768));
      let atk = 0;
      for(let i = w0; i < Math.min(n, w1); i++){
        if(Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768) >= 0.9 * firstPeak){
          atk = (i - w0) / 44100 * 1000; break;
        }
      }
      return { peak, zc, rms: Math.sqrt(sum/n), atk,
               lowPct: 100*low/Math.max(1e-12, sum) };
    };

    /* ── THE FILTER KNOBS ARE MEASURED WHERE THE FILTER LIVES ─────────────────
       The first version tested everything at the panel default of cutoff 520,
       and reported ACCENT SWEEP as dead. It is not: at 520 the envelope top is
       already 10450 Hz, and 10450 against 11000 on an 82 Hz saw is the same
       filter in the mix -- the knob had no room, because the filter was open past
       audibility before it was touched. At a cutoff where acid actually sits the
       same knob moves the top from 4019 to 7144 Hz.

       A measurement taken outside the instrument's working range measures the
       range, not the instrument. The filter-section knobs get 250. */
    /* ── AND THE TEST VALUES HAVE TO BE ON THE DIAL ──────────────────────────
       Third time in this session a measurement was wrong rather than the code.
       When the Devil Fish manual corrected the ranges, this file kept driving
       SOFT ATTACK to 0.20 s -- a dial that now stops at 0.030 -- and ACCENT
       SWEEP to 4, on a control that had become a three-position switch whose
       top position IS 2, the default. Both requests clamped to where they
       already were, so both rows read exactly 0.0 and the probe called them
       dead. They were not dead; they were never moved.

       A probe carries its own copy of the instrument's ranges, so it goes stale
       the moment the instrument changes. The values below are taken FROM the
       declarations rather than written down again: `hi` and `lo` ask the
       control what its ends are. */
    const ACIDCUT = { cutoff: 250 };
    const hi = k => MK2.CONTROL['tb303.' + k].max;
    const lo = k => MK2.CONTROL['tb303.' + k].min;
    const base = await meas({});
    const baseLow = await meas(ACIDCUT);
    const TESTS = [
      ['tune',       { tune: 7 }],
      ['softAtk',    { softAtk: hi('softAtk') }],
      ['vcaDecay',   { vcaDecay: 0.10 }],
      ['accDecay',   { accDecay: 1.20 }],
      ['track',      { track: hi('track') }],
      ['slideTime',  { slideTime: hi('slideTime') }],
      ['sweep',      { sweep: hi('sweep'), ...ACIDCUT }, true],
      /* the switch moves DOWN from its default: position 0 turns the sweep
         circuit off and doubles the resonance */
      ['accSweep→0', { accSweep: lo('accSweep'), ...ACIDCUT }, true],
      /* at cutoff 250 too -- it is a filter-section control, and the whole point
         of the low baseline is that a filter already open past audibility
         cannot show what a knob does to it */
      ['sweepSpeed', { sweepSpeed: lo('sweepSpeed'), ...ACIDCUT }, true],
      ['filterFM',   { filterFM: hi('filterFM') }],
      ['subOsc',     { subOsc: hi('subOsc') }],
      ['subLevel',   { subOsc: 0.7, subLevel: lo('subLevel') }],
      ['muffler',    { muffler: hi('muffler') }],
      ['volume',     { volume: hi('volume') }],
    ];
    const rows = [];
    for(const [name, o, lowCut] of TESTS){
      const m = await meas(o);
      const base2 = lowCut ? baseLow : base;
      rows.push({ name, at: lowCut ? ' @cut250' : '',
        dPeak: 100*(m.peak - base2.peak)/Math.max(1e-9, base2.peak),
        dBright: 100*(m.zc - base2.zc)/Math.max(1, base2.zc),
        dLow: m.lowPct - base2.lowPct, dAtk: m.atk - base2.atk,
        dRms: 20*Math.log10(m.rms/Math.max(1e-12, base2.rms)) });
    }
    setAll({});
    return { base, rows };
  });

  console.log('\n=== the 303, one knob at a time from default to extreme ===');
  console.log(`  baseline: peak ${out.base.peak.toFixed(3)} · ${out.base.zc} crossings · ${out.base.lowPct.toFixed(1)}% low\n`);
  console.log('  knob                 d peak%   d bright%   d low(pts)   d level(dB)   d attack(ms)');
  for(const r of out.rows){
    const dead = Math.abs(r.dPeak) < 0.5 && Math.abs(r.dBright) < 0.5 &&
                 Math.abs(r.dLow) < 0.5 && Math.abs(r.dRms) < 0.2 && Math.abs(r.dAtk) < 0.5;
    console.log(`  ${(r.name + r.at).padEnd(19)} ${r.dPeak.toFixed(1).padStart(8)}  ${r.dBright.toFixed(1).padStart(10)}  ` +
                `${r.dLow.toFixed(1).padStart(11)}  ${r.dRms.toFixed(2).padStart(12)}  ` +
                `${r.dAtk.toFixed(1).padStart(12)}${dead ? '   <<< DEAD' : ''}`);
  }
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
