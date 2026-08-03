/* FIRE EVERY VOICE ONCE. This exists because a voice threw on every note for
   several commits and nothing in the project noticed.

   `dacHit` -- the SEGA rig's kick and snare -- was reading `ev.lane` from an
   `ev` it had never been passed, left behind when per-drum chains made the
   output destination depend on the lane. Every DAC hit was a ReferenceError,
   which in WebAudio does not degrade: it takes the whole render down from that
   note on. It survived 88 seam checks, 21 UI checks, 10 blend checks and a
   2100-line composition snapshot, because not one of them CONSTRUCTS A SOUND.
   The snapshot hashes notes; the seam checks read tables; the UI checks read
   the DOM. There was no measurement standing between "the voice exists in V"
   and "the voice makes a noise".

   This is that measurement, and it is deliberately dumb: build one event per
   voice in Sound's own table, render it alone, and report the ones that throw
   or come out silent. A voice that produces nothing is not always a bug -- a
   pitched voice handed no pitch legitimately declines -- so the report names
   what it saw and lets a reader judge, except for THROWS, which are never fine.

     node harness/probe_voices.js
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
    /* the lane a drum voice expects, so it routes into a real chain rather than
       a fallback -- a voice tested off its own lane is a voice half-tested */
    const LANE = { k:'kick', s:'snare', g:'ghost', h:'hat', o:'openhat', c:'clap', r:'rim',
                   t:'tom3', m:'tom1', a:'crash', d:'ride' };
    const laneOf = name => {
      const n = name.toLowerCase();
      for(const k of ['kick','snare','ghost','openhat','hat','clap','rim','crash','ride'])
        if(n.includes(k)) return k === 'hat' && n.includes('open') ? 'openhat' : k;
      if(n.includes('tom')) return n.includes('lo') ? 'tom3' : 'tom1';
      if(/^k/.test(n)) return 'kick'; if(/^s/.test(n)) return 'snare';
      if(/^oh/.test(n)) return 'openhat'; if(/^h/.test(n)) return 'hat';
      if(/^t/.test(n)) return 'tom3'; if(/^cp|^cl/.test(n)) return 'clap';
      return null;
    };
    const DRUMISH = /kick|snare|ghost|hat|clap|rim|tom|crash|ride|^k|^s|^h|^o|^t|^c|^r|^d/i;

    const rows = [];
    for(const v of MK2.voiceNames()){
      const lane = laneOf(v);
      const drum = lane != null;
      const ev = { voice: v, role: drum ? 'drums' : 'bass', lane: lane || 'bass',
                   tSec: 0.05, durSec: 0.40, gain: 0.9,
                   /* a pitched voice gets a pitch; a drum gets one too, because a
                      drum voice that reads pitch should not care that it is there */
                   pitch: 45,
                   /* THE CHOPPER GETS ITS SLICE. V.brk reads ev.slice to find its
                      offset into the break, and the composer never omits it -- a
                      synthetic event without it produces a NaN offset and a throw
                      that says nothing about the voice. Handing it the field its
                      own builder hands it is the difference between testing the
                      voice and testing my event literal. It is NOT defended
                      inside the voice on purpose: a brk event that reaches sound
                      with no slice is a real defect upstream, and a `|| 0` there
                      would turn it into a quiet wrong note. */
                   slice: 0 };
      let peak = 0, err = null;
      try {
        const blob = await MK2.renderWav([ev], 1.6, 44100);
        const ab = await blob.arrayBuffer(), dv = new DataView(ab);
        const n = (ab.byteLength - 44) / 4;
        for(let i = 0; i < n; i++){
          const s = Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768);
          if(s > peak) peak = s;
        }
      } catch(e){ err = String(e && e.message || e); }
      rows.push({ v, lane: lane || '-', peak, err });
    }
    return rows;
  });

  const threw  = out.filter(r => r.err);
  const silent = out.filter(r => !r.err && r.peak < 1e-4);
  console.log(`\n=== every voice, fired once (${out.length} voices) ===`);
  for(const r of out)
    console.log(`  ${r.v.padEnd(14)} ${r.lane.padEnd(9)} ` +
      (r.err ? 'THREW: ' + r.err : r.peak < 1e-4 ? 'silent' : 'peak ' + r.peak.toFixed(3)));
  console.log(`\n  threw: ${threw.length}${threw.length ? ' — ' + threw.map(r => r.v).join(', ') : ''}`);
  console.log(`  silent: ${silent.length}${silent.length ? ' — ' + silent.map(r => r.v).join(', ') : ''}`);
  /* page errors are collected separately because WebAudio swallows some of them
     into the console rather than the promise */
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 6).join(' | '));
  await b.close();
  process.exitCode = threw.length ? 1 : 0;
})();
