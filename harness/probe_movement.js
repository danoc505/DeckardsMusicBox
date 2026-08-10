/* IS ANYTHING CHANGING. "I judged over a min of drums and no changes to the
   soundscape... it's all slow swells of changing effects, this is how you can get
   away with repeating something so long."

   Two measurements, because "nothing is changing" has two possible causes and
   they need different fixes:

     1. THE DIAL. For every motion lane, how far does the knob actually travel
        inside the first N seconds, as a fraction of its own range? A lane on a
        96-bar free-phase LFO at 126 bpm has a period near three minutes -- it is
        automated on paper and static in the mix for the whole opening.

     2. THE AIR. Render the opening in windows and measure band energy and
        brightness per window. A soundscape that is changing has numbers that
        move; one that is not, does not.

     node harness/probe_movement.js [genre] [seconds] [seed]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const GENRE = process.argv[2] || 'plastikman';
const SECS  = Number(process.argv[3] || 90);
const SEED  = Number(process.argv[4] || 1);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async ({ genre, secs, seed }) => {
    const song = MK2.composeSong(seed, 'draw', genre);
    const plan = song.motion;

    /* ── 1. the dials ── */
    const lanes = [];
    for(const key in plan.lanes){
      const c = MK2.CONTROL[key];
      if(!c) continue;
      const base = MK2.panelValue(key.split('.')[0], key.split('.')[1]);
      let lo = Infinity, hi = -Infinity, loAll = Infinity, hiAll = -Infinity;
      for(let t = 0; t < plan.seconds; t += 0.25){
        const v = base + MK2.motionAt(plan, key, { tSec: t }, 0);
        if(t < secs){ if(v < lo) lo = v; if(v > hi) hi = v; }
        if(v < loAll) loAll = v; if(v > hiAll) hiAll = v;
      }
      const span = Math.max(1e-9, c.max - c.min);
      lanes.push({ key, openPct: 100 * (hi - lo) / span, wholePct: 100 * (hiAll - loAll) / span });
    }
    lanes.sort((a, c) => a.openPct - c.openPct);

    /* ── 2. the air ── */
    const S = MK2.soundOf(song.chart.genre);
    const WIN = 10, rows = [];
    for(let a = 0; a < secs; a += WIN){
      const bEnd = Math.min(a + WIN, secs);
      const evs = song.perf.events.filter(e => e.tSec >= a && e.tSec < bEnd)
                      .map(e => Object.assign({}, e, { tSec: e.tSec - a }));
      const blob = await MK2.renderWav(evs, bEnd - a, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, plan, a);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2;
      let zc = 0, prev = 0, sum = 0, lowE = 0, hiE = 0, peak = 0;
      /* zero crossings = brightness; a one-pole split gives crude band energy */
      let lp = 0;
      for(let i = 0; i < n; i += 2){
        const s = dv.getInt16(44 + i * 2, true) / 32768;
        if((s >= 0) !== (prev >= 0)) zc++;
        prev = s; sum += s * s;
        lp += (s - lp) * 0.02;                 // ~140 Hz one-pole
        lowE += lp * lp; hiE += (s - lp) * (s - lp);
        if(Math.abs(s) > peak) peak = Math.abs(s);
      }
      const N = n / 2;
      rows.push({ a, rms: Math.sqrt(sum / N), zc, peak,
                  lowPct: 100 * lowE / Math.max(1e-12, lowE + hiE),
                  nev: evs.length,
                  roles: [...new Set(evs.map(e => e.role))].sort().join("+") });
    }
    return { lanes, rows, tempo: song.chart.tempo, seconds: song.perf.seconds,
             nBars: song.form.nBars };
  }, { genre: GENRE, secs: SECS, seed: SEED });

  console.log(`\n=== ${GENRE} seed ${SEED} · ${out.seconds.toFixed(0)}s · ${out.nBars} bars @ ${out.tempo}bpm ===`);
  console.log(`\n--- how far each knob travels in the first ${SECS}s, vs across the whole record ---`);
  console.log('  lane                first ' + SECS + 's     whole record');
  for(const l of out.lanes){
    const flag = l.openPct < 3 ? '   <<< static in the mix' : '';
    console.log(`  ${l.key.padEnd(18)} ${l.openPct.toFixed(1).padStart(8)}%   ${l.wholePct.toFixed(1).padStart(10)}%${flag}`);
  }
  console.log(`\n--- and what the air actually does, per 10 s ---`);
  console.log('    t     rms      bright(zc)   low%    peak   nev  roles');
  for(const r of out.rows)
    console.log(`  ${String(r.a).padStart(3)}   ${r.rms.toFixed(4)}   ${String(r.zc).padStart(8)}   ${r.lowPct.toFixed(1).padStart(5)}  ${r.peak.toFixed(3)}  ${String(r.nev).padStart(4)}  ${r.roles}`);
  const zs = out.rows.map(r => r.zc), rs = out.rows.map(r => r.rms);
  const spread = (a) => (Math.max(...a) - Math.min(...a)) / Math.max(1e-9, Math.max(...a));
  console.log(`\n  brightness varies by ${(100*spread(zs)).toFixed(1)}% across the opening; loudness by ${(100*spread(rs)).toFixed(1)}%`);
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
