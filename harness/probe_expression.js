/* THE 60%. The CS-80 reconstruction sheet says the static patch is about 40% of
   the Blade Runner sound and rates polyphonic aftertouch and the ribbon
   "Extremely high" among the rest. This measures whether either is real, and
   whether each has the RIGHT polarity -- which is the thing the program had
   backwards:

     the RIBBON is one hand on one strip, so simultaneous notes must bend
     TOGETHER, by the same interval, at the same instant;
     the AFTERTOUCH is per key, so simultaneous notes must move INDEPENDENTLY.

   Three claims, three numbers.

     node harness/probe_expression.js [nSeeds]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const N = Number(process.argv[2] || 40);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* ── 1 & 2: the event stream ─────────────────────────────────────────────── */
  const ev = await page.evaluate(({ n }) => {
    const out = {};
    for(const genre of MK2.genres()){
      let rib = 0, press = 0, notes = 0;
      /* group notes by the ABSOLUTE instant the ribbon lands on, across roles */
      let ribGroups = 0, ribAgree = 0, ribDisagree = 0;
      /* and chord-mates, to see whether their pressure differs */
      let chords = 0, pressSame = 0, pressDiff = 0;
      for(let seed = 1; seed <= n; seed++){
        const s = MK2.composeSong(seed, 'draw', genre);
        const byMoment = {};
        for(const e of s.perf.events){
          if(e.pitch == null) continue;
          if(e.role !== 'lead' && e.role !== 'keys') continue;
          notes++;
          if(e.ribbon) rib++;
          if(e.press) press++;
          if(e.ribbon){
            /* the instant the hand lands, in song time */
            const k = (e.tSec + e.ribbon.at).toFixed(4);
            (byMoment[k] = byMoment[k] || []).push(e);
          }
          /* CHORD-MATES, grouped to 30 ms rather than to the exact instant: keys
             notes are STRUMMED a few milliseconds apart by stage 5, so an exact
             tSec match finds almost no chords at all (it found 5 in 30 seeds of
             Vangelis, which is a measurement of the strum, not of the harmony) */
          if(e.press){
            const ck = 'c' + Math.round(e.tSec / 0.030);
            (byMoment[ck] = byMoment[ck] || []).push(e);
          }
        }
        for(const k in byMoment){
          const g = byMoment[k];
          if(k[0] === 'c'){
            if(g.length < 2) continue;
            chords++;
            const a = g[0].press;
            if(g.every(x => x.press && Math.abs(x.press.peak - a.peak) < 1e-9
                            && Math.abs(x.press.at - a.at) < 1e-9)) pressSame++;
            else pressDiff++;
          } else {
            if(g.length < 2) continue;
            ribGroups++;
            const a = g[0].ribbon;
            if(g.every(x => Math.abs(x.ribbon.by - a.by) < 1e-9
                            && Math.abs(x.ribbon.sec - a.sec) < 1e-9)) ribAgree++;
            else ribDisagree++;
          }
        }
      }
      out[genre] = { notes, rib, press, ribGroups, ribAgree, ribDisagree,
                     chords, pressSame, pressDiff };
    }
    return out;
  }, { n: N });

  console.log(`\n=== ribbon and pressure in the event stream (${N} seeds) ===`);
  console.log('  genre         lead/keys notes   with ribbon   with pressure');
  for(const g in ev){
    const r = ev[g];
    console.log(`  ${g.padEnd(12)} ${String(r.notes).padStart(14)}   ${String(r.rib).padStart(11)}   ${String(r.press).padStart(13)}`);
  }
  console.log('\n=== POLARITY: does each behave like the control it is named after? ===');
  console.log('  the ribbon is ONE hand -- simultaneous bends must AGREE');
  for(const g in ev){
    const r = ev[g];
    if(!r.ribGroups) continue;
    console.log(`    ${g.padEnd(12)} ${r.ribGroups} simultaneous groups: ${r.ribAgree} agree, ${r.ribDisagree} disagree`);
  }
  console.log('  aftertouch is PER KEY -- chord-mates must DIFFER');
  for(const g in ev){
    const r = ev[g];
    if(!r.chords) continue;
    console.log(`    ${g.padEnd(12)} ${r.chords} chords: ${r.pressDiff} move independently, ${r.pressSame} move as a block`);
  }

  /* ── 3: does pressure actually change the AUDIO ──────────────────────────── */
  const aud = await page.evaluate(async () => {
    const mk = press => ([{ voice: 'cs80', tSec: 0.05, durSec: 2.4, gain: 0.85,
                            pitch: 55, role: 'keys', press }]);
    const render = async (evs, at) => {
      for(const k of ['atBrill', 'atLevel', 'atVib']) MK2.PARAMS['cs80.' + k] = at[k];
      const blob = await MK2.renderWav(evs, 3.4, 44100);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2;
      /* brightness over time: zero-crossing rate per 0.2 s window on the left
         channel -- a crude spectral centroid that needs no FFT and is exactly
         what "does it get brighter" means */
      const win = Math.floor(0.2 * 44100), rows = [];
      for(let w = 0; (w + 1) * win * 2 < n; w++){
        let zc = 0, prev = 0, peak = 0;
        for(let i = 0; i < win; i++){
          const s = dv.getInt16(44 + ((w * win + i) * 2) * 2, true) / 32768;
          if((s >= 0) !== (prev >= 0)) zc++;
          if(Math.abs(s) > peak) peak = Math.abs(s);
          prev = s;
        }
        rows.push({ zc, peak });
      }
      return rows;
    };
    const AT = { atBrill: 0.80, atLevel: 0.20, atVib: 0.40 };
    const OFF = { atBrill: 0, atLevel: 0, atVib: 0 };
    /* the same note, with and without a finger on it */
    const P = { peak: 0.9, at: 1.5, rise: 0.4 };
    const withPress = await render(mk(P), AT);
    const noPress   = await render(mk(null), AT);
    const knobsOff  = await render(mk(P), OFF);
    return { withPress, noPress, knobsOff };
  });

  console.log('\n=== the same held note, with and without a finger (zero crossings per 0.2 s) ===');
  console.log('   t(s)   no pressure   with pressure   knobs at zero');
  const nrow = Math.min(aud.withPress.length, aud.noPress.length, aud.knobsOff.length);
  for(let i = 0; i < nrow; i++)
    console.log(`  ${(i * 0.2).toFixed(1)}   ${String(aud.noPress[i].zc).padStart(11)}   ` +
                `${String(aud.withPress[i].zc).padStart(13)}   ${String(aud.knobsOff[i].zc).padStart(13)}`);
  const sum = a => a.reduce((x, r) => x + r.zc, 0);
  console.log(`\n  totals: no pressure ${sum(aud.noPress)} · with pressure ${sum(aud.withPress)} ` +
              `· pressure but knobs at zero ${sum(aud.knobsOff)}`);
  console.log(`  the third column MUST equal the first: pressure with every AFTER knob at 0 has to be silent-as-a-change.`);
  if(errs.length) console.log('\nPAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
