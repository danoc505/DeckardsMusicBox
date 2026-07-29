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
    const ev = [{ voice:'acid303', lane:'bass', role:'bass', tSec:0.05, durSec:0.42,
                  gain:0.9, pitch:40, accent:true },
                { voice:'acid303', lane:'bass', role:'bass', tSec:0.70, durSec:0.42,
                  gain:0.9, pitch:47, slide:7 }];
    const DEF = {}, KEYS = ['cutoff','res','envmod','decay','accent','drive','wave',
                            'tune','softAtk','accDecay','track','slideTime','sweep',
                            'accSweep','filterFM','subOsc','muffler'];
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
      return { peak, zc, rms: Math.sqrt(sum/n), lowPct: 100*low/Math.max(1e-12, sum) };
    };

    /* ── THE FILTER KNOBS ARE MEASURED WHERE THE FILTER LIVES ─────────────────
       The first version tested everything at the panel default of cutoff 520,
       and reported ACCENT SWEEP as dead. It is not: at 520 the envelope top is
       already 10450 Hz, and 10450 against 11000 on an 82 Hz saw is the same
       filter to an ear -- the knob had no room, because the filter was open past
       audibility before it was touched. At a cutoff where acid actually sits the
       same knob moves the top from 4019 to 7144 Hz.

       A measurement taken outside the instrument's working range measures the
       range, not the instrument. The filter-section knobs get 250. */
    const ACIDCUT = { cutoff: 250 };
    const base = await meas({});
    const baseLow = await meas(ACIDCUT);
    const TESTS = [
      ['tune',      { tune: 7 }],
      ['softAtk',   { softAtk: 0.20 }],
      ['accDecay',  { accDecay: 1.20 }],
      ['track',     { track: 1 }],
      ['slideTime', { slideTime: 0.30 }],
      ['sweep',     { sweep: 24, ...ACIDCUT }, true],
      ['accSweep',  { accSweep: 4, ...ACIDCUT }, true],
      ['filterFM',  { filterFM: 1 }],
      ['subOsc',    { subOsc: 1 }],
      ['muffler',   { muffler: 1 }],
    ];
    const rows = [];
    for(const [name, o, lowCut] of TESTS){
      const m = await meas(o);
      const base2 = lowCut ? baseLow : base;
      rows.push({ name, at: lowCut ? ' @cut250' : '',
        dPeak: 100*(m.peak - base2.peak)/Math.max(1e-9, base2.peak),
        dBright: 100*(m.zc - base2.zc)/Math.max(1, base2.zc),
        dLow: m.lowPct - base2.lowPct,
        dRms: 20*Math.log10(m.rms/Math.max(1e-12, base2.rms)) });
    }
    setAll({});
    return { base, rows };
  });

  console.log('\n=== the 303, one knob at a time from default to extreme ===');
  console.log(`  baseline: peak ${out.base.peak.toFixed(3)} · ${out.base.zc} crossings · ${out.base.lowPct.toFixed(1)}% low\n`);
  console.log('  knob                 d peak%   d bright%   d low(pts)   d level(dB)');
  for(const r of out.rows){
    const dead = Math.abs(r.dPeak) < 0.5 && Math.abs(r.dBright) < 0.5 &&
                 Math.abs(r.dLow) < 0.5 && Math.abs(r.dRms) < 0.2;
    console.log(`  ${(r.name + r.at).padEnd(19)} ${r.dPeak.toFixed(1).padStart(8)}  ${r.dBright.toFixed(1).padStart(10)}  ` +
                `${r.dLow.toFixed(1).padStart(11)}  ${r.dRms.toFixed(2).padStart(12)}${dead ? '   <<< DEAD' : ''}`);
  }
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
