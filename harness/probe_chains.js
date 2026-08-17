/* DO THE PER-VOICE CHAINS DO ANYTHING. The TR-1000 exists here for one claim:
   each drum has its own filter, drive and sends, so each can have its own
   character and move on its own timescale. Being on the PER_SONG list proves
   only that a name was written down.

   Two measurements:
     1. ISOLATION -- moving ONE chain's filter must change that drum's sound and
        leave its neighbours alone. If closing the hat's filter darkens the kick,
        they are not separate chains.
     2. TRAVEL -- across a real song, each chain's lanes must move, and move on
        DIFFERENT schedules. Five knobs riding the same curve is one knob.

     node harness/probe_chains.js
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
    MK2.composeSong(1, 'draw', 'boxcarsynth');       // loads the TR-1000 panel
    const S = MK2.soundOf('boxcarsynth');
    const motion = { lanes: {}, spb: 0.118, nBars: 4, seconds: 8, secFn: ['verse'],
                     drums: 'tr1000' };

    /* ONE DRUM PER RENDER. Sharing a render is how the first two attempts went
       wrong: an 808 open hat at 0.42 s decay through a 3.2 s room does not
       finish before the next window starts, so the tom's window measured the
       open hat's tail and the tom's own filter appeared to do nothing at all
       (its whole row read 0.0, including its diagonal). Spacing the hits further
       apart shrank the artefact without removing it. Rendering each drum alone
       removes it by construction: whatever the number is, it is that drum. */
    const DRUMS = [
      ['k', 'kick',    { voice:'k808',   lane:'kick',    role:'drums', tSec:0.05, durSec:0.30, gain:1.0 }],
      ['s', 'snare',   { voice:'s808',   lane:'snare',   role:'drums', tSec:0.05, durSec:0.20, gain:0.9 }],
      ['h', 'hat',     { voice:'h808',   lane:'hat',     role:'drums', tSec:0.05, durSec:0.10, gain:0.8 }],
      ['o', 'openhat', { voice:'oh808',  lane:'openhat', role:'drums', tSec:0.05, durSec:0.40, gain:0.8 }],
      ['t', 'tom3',    { voice:'t808lo', lane:'tom3',    role:'drums', tSec:0.05, durSec:0.40, gain:0.9 }],
    ];
    const bright = async one => {
      const blob = await MK2.renderWav([one], 4.0, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, motion, 0);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      let zc = 0, prev = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
        if(Math.abs(v) > 0.0008 && (v >= 0) !== (prev >= 0)) zc++;
        prev = v;
      }
      return zc;
    };

    const OPEN = { kCut:12000, sCut:12000, hCut:12000, oCut:12000, tCut:12000 };
    const set = o => { for(const k in o) MK2.PARAMS['tr1000.' + k] = o[k]; };

    set(OPEN);
    const base = {};
    for(const [, name, one] of DRUMS) base[name] = await bright(one);

    const rows = [];
    for(const [grp, closedName] of DRUMS.map(d => [d[0], d[1]])){
      set(OPEN);
      MK2.PARAMS['tr1000.' + grp + 'Cut'] = 400;      // close this one hard
      const d = {};
      for(const [, name, one] of DRUMS){
        const z = await bright(one);
        d[name] = 100 * (z - base[name]) / Math.max(1, base[name]);
      }
      rows.push({ closed: closedName, d });
    }
    set(OPEN);

    /* 2. travel across a real song */
    const song = MK2.composeSong(1, 'draw', 'boxcarsynth');
    const travel = [];
    for(const key in song.motion.lanes){
      if(!/^tr1000\.[ksho t]/.test(key) && !/^tr1000\.[kshot](Cut|Drv|Echo|Verb)$/.test(key)) continue;
      const c = MK2.CONTROL[key]; if(!c) continue;
      const base2 = MK2.panelValue('tr1000', key.split('.')[1]);
      const v = [];
      for(let t = 0; t < song.perf.seconds; t += 1)
        v.push(base2 + MK2.motionAt(song.motion, key, { tSec: t }, 0));
      travel.push({ key, pct: 100*(Math.max(...v)-Math.min(...v))/(c.max-c.min),
                    first: v.slice(0, 60).map(x => Math.round(x)).join(',') });
    }
    return { rows, travel, drums: song.chart.picks.drums };
  });

  console.log('\n=== ISOLATION: close ONE chain\'s filter to 400 Hz, measure every drum ===');
  console.log('  (percent change in brightness; a real chain moves its own drum and no other)');
  console.log('  closed        kick    snare      hat  openhat     tom3');
  for(const r of out.rows)
    console.log(`  ${r.closed.padEnd(10)} ` +
      ['kick','snare','hat','openhat','tom3'].map(k => (r.d[k]).toFixed(1).padStart(8)).join(' '));

  console.log('\n=== TRAVEL: how far each chain lane moves across a real song ===');
  for(const t of out.travel.sort((a,c) => c.pct - a.pct))
    console.log(`  ${t.key.padEnd(16)} ${t.pct.toFixed(1).padStart(6)}% of its dial`);
  console.log(`\n  drums machine drawn: ${out.drums}`);
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
