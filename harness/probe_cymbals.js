/* THE CYMBAL IS HARSH AND ITS FADER DOES NOTHING.

   Two separate claims, and they get two separate measurements.

     1. DOES THE FADER REACH THE SOUND. For every drum, render one hit with its
        MIX fader at the top of its travel and again at the bottom, and report
        the level change in dB. A fader that does not move its own drum is the
        defect this project has a standing rule about -- a control that does
        nothing is a lie -- and it is worse on a fader than on a knob, because a
        fader is the one control a hand reaches for first.

     2. IS THE CYMBAL HARSH. Harshness is not loudness; it is energy in the
        2-6 kHz band where the owner is most sensitive, and a long tail that keeps
        it there. So: the spectral balance of each cymbal, and how long it
        holds. Reported next to the hats, which nobody has complained about, so
        there is something to compare against rather than a number in a vacuum.

     node harness/probe_cymbals.js
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
    const DRUMS = [
      ['a', 'crash',   'crash'],
      ['d', 'ride',    'ride'],
      ['h', 'hat',     'hat'],
      ['o', 'openhat', 'openhat'],
      ['s', 'snare',   'snare'],
      ['k', 'kick',    'kick'],
    ];
    /* ── RENDER IT THE WAY THE PROGRAM PLAYS IT ──────────────────────────────
       The first version called renderWav with no space and no motion plan. The
       per-voice chains are wired and their gains scheduled inside setSpace, so
       with no space argument setSpace never runs, every chain sits at its
       constructed default, and the MIX fader was reported dead on all ten
       drums. It is not the fader that was absent from that render -- it is the
       whole chain. Measuring a control on a graph that was never configured
       measures the graph.  */
    MK2.composeSong(1, 'draw', 'plastikman');
    const S = MK2.soundOf('plastikman');
    const motion = { lanes: {}, spb: 0.118, nBars: 4, seconds: 8, secFn: ['verse'],
                     secOcc: [1], drums: 'tr1000' };
    /* ── TWO QUESTIONS, TWO RENDERS ──────────────────────────────────────────
       The fader question needs the chain configured, which needs a space. The
       TONE question must not have one: with plastikman's room on, every tail in
       the table lengthened -- kick 0.25 s to 2.25 s -- and I nearly read a
       reverb as a change to the crash. The room is shared by every drum and is
       not what "this cymbal is harsh" is about. So the tone rows render DRY. */
    const meas = async (lane, voice, wet) => {
      const ev = [{ voice, lane, role: 'drums', tSec: 0.05, durSec: 0.4, gain: 0.9 }];
      const blob = wet
        ? await MK2.renderWav(ev, 3.0, 44100, S.space, S.kick, S.drumDrive, S.gate, motion, 0)
        : await MK2.renderWav(ev, 3.0, 44100);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      /* three one-pole bands, and the tail: how long it stays above -40 dB of
         its own peak */
      /* ── A BAND THAT CAN SEE THE THING BEING COMPLAINED ABOUT ──────────────
         The first split was low / 140 Hz-2 kHz / everything above. Cymbal
         harshness is specifically 2-6 kHz -- the owner's most sensitive region and
         where a sustained undamped partial becomes unpleasant -- and lumping
         2 kHz to 20 kHz into one "high" bucket cannot see it. Worse, when the
         mid dropped the high PERCENTAGE rose, which reads like it got brighter
         when the absolute energy fell. Four bands now, and HARSH is reported in
         absolute terms as well as as a share. */
      let lp = 0, mid = 0, harsh = 0, air = 0, tot = 0, peak = 0, last = 0;
      let l1 = 0, l2 = 0, l3 = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
        const a = Math.abs(v);
        if(a > peak) peak = a;
        l1 += (v - l1) * 0.02;            // ~140 Hz
        l2 += (v - l2) * 0.25;            // ~2 kHz
        l3 += (v - l3) * 0.58;            // ~6 kHz
        lp += l1*l1; mid += (l2-l1)*(l2-l1);
        harsh += (l3-l2)*(l3-l2);         // 2-6 kHz -- the harsh band
        air += (v-l3)*(v-l3);             // above 6 kHz -- sizzle, not harshness
        tot += v*v;
      }
      const hp = harsh;
      for(let i = n - 1; i > 0; i--){
        const a = Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768);
        if(a > peak * 0.01){ last = i / 44100; break; }
      }
      return { peak, tail: last, harshAbs: Math.sqrt(harsh / n),
               low: 100*lp/Math.max(1e-12, tot),
               mid: 100*mid/Math.max(1e-12, tot),
               high: 100*harsh/Math.max(1e-12, tot),
               air: 100*air/Math.max(1e-12, tot) };
    };
    const setP = (k, v) => { MK2.PARAMS['tr1000.' + k] = v; };
    const CT = k => MK2.CONTROL['tr1000.' + k];

    const rows = [];
    for(const [g, lane, voice] of DRUMS){
      const c = CT(g + 'Mix');
      /* the fader, top of travel against bottom */
      setP(g + 'Mix', c.max);
      const hi = await meas(lane, voice, true);
      setP(g + 'Mix', c.min);
      const lo = await meas(lane, voice, true);
      setP(g + 'Mix', c.def);
      const tone = await meas(lane, voice, false);      // the voice itself, dry
      rows.push({ lane, faderDb: 20 * Math.log10(Math.max(1e-9, lo.peak) / Math.max(1e-9, hi.peak)),
                  min: c.min, max: c.max, def: c.def, ...tone });
    }
    return rows;
  });

  console.log('\n=== 1. DOES THE MIX FADER REACH THE SOUND ===');
  console.log('  (level change from the TOP of the fader to the BOTTOM — a working fader is very negative)\n');
  console.log('  drum       fader range        top -> bottom');
  for(const r of out)
    console.log(`  ${r.lane.padEnd(10)} ${(r.min + '..' + r.max).padEnd(18)} ` +
                `${r.faderDb.toFixed(1).padStart(7)} dB` +
                (Math.abs(r.faderDb) < 1 ? '   <<< THE FADER DOES NOTHING' : ''));

  console.log('\n=== 2. IS THE CYMBAL HARSH ===');
  console.log('  (harshness lives in the 140 Hz - 2 kHz "mid" band and above; the tail keeps it there)\n');
  console.log('  drum         low%    mid%   HARSH%   air%   tail(s)   peak   harsh RMS');
  for(const r of out)
    console.log(`  ${r.lane.padEnd(10)} ${r.low.toFixed(1).padStart(6)}  ${r.mid.toFixed(1).padStart(6)}  ` +
                `${r.high.toFixed(1).padStart(6)}  ${r.air.toFixed(1).padStart(5)}   ` +
                `${r.tail.toFixed(2).padStart(6)}   ${r.peak.toFixed(3)}   ${r.harshAbs.toFixed(4)}`);
  console.log('\n  HARSH% is 2-6 kHz -- the band the owner finds unpleasant when it is sustained.');
  console.log('  harsh RMS is the same band in absolute terms, so a drop in share cannot hide a rise in level.');
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
