/* THE MATRIX'S FEEDBACK CROSSING, GOVERNED BY MEASUREMENT.

   room -> echo closes a loop through two effects: echo -> WASH -> room ->
   back into the delay line, with the echo's own FDBK loop nested inside it.
   The eurorack sources that justify the crossing also warn about it:
   feedback "can quickly spiral exponentially into chaos". The old comment at
   the echo's construction refused this wire until "its own stability work"
   existed. This is that work:

   1. WORST CASE: every gain in the loop at its ceiling -- fb 0.85, WASH 1.0,
      send 1.0, a bus route wide open, room -> echo at the dial's max. ONE
      kick goes in at 0.1 s and nothing after it; the render runs 30 s. The
      tail must be DYING at the end: at least 20 dB below its own post-source
      peak, and still falling across the last third. A fixed floor (the first
      version asked for -60 dBFS) is the wrong test -- FDBK 0.85 is a
      deliberately enormous setting and its tail is still audible at 30 s
      even with this crossing severed. What must never happen is a tail that
      turns around and climbs, which is exactly what the pre-fix build did.

   2. THE CROSSING IS REAL: on plastikman (the genre that declares it,
      base 0.14) the crossing on vs off must change the rendered audio by a
      measurable difference signal -- a knob that survives the stability cap
      but moves nothing would be decoration.

     node harness/probe_matrix.js
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

  /* ── 1. the loop at every ceiling ── */
  const worst = await page.evaluate(async () => {
    const s = document.getElementById('genre');
    s.value = 'plastikman'; s.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    const S = MK2.soundOf('plastikman');
    /* ONE kick, then silence: an impulse into the loop. A four-second musical
       excerpt keeps FEEDING the loop, so a rising tail cannot be told from a
       source that is still playing. */
    const ref = MK2.referenceEvents(120);
    const kick = ref.find(e => e.voice === 'kick') || ref[0];
    const ev = [Object.assign({}, kick, { tSec: 0.1 })];
    const SECS = 30;
    const CAP = MK2.CONTROL['matrix.roomEcho'].max;      // the governor itself
    const T = {
      'matrix.roomEcho': CAP - (S.space.roomEcho || 0),  // dial max
      'matrix.drumsEcho': 1, 'matrix.drumsRoom': 1,      // a source wide open into both
    };
    /* absolute values for fb/verb/send: write them as TRIM from the genre base */
    T['echo.fb'] = 0.85 - MK2.panelValue('echo', 'fb');
    T['echo.verb'] = 1.0 - MK2.panelValue('echo', 'verb');
    T['echo.send'] = 1.0 - MK2.panelValue('echo', 'send');
    for(const k in T) MK2.TRIM[k] = T[k];
    const blob = await MK2.renderWav(ev, SECS, 44100, S.space, S.kick, S.drumDrive, S.gate, null, 0);
    for(const k in T) delete MK2.TRIM[k];
    const ab = await blob.arrayBuffer(), dv = new DataView(ab);
    const n = (ab.byteLength - 44) / 2, sr = 44100, ch = 2;
    /* RMS per 2-second window */
    const wins = [];
    const winN = 2 * sr;
    for(let w = 0; w * winN * ch < n; w++){
      let sum = 0, cnt = 0;
      for(let i = w * winN * ch; i < (w + 1) * winN * ch && i < n; i += ch){
        const v = dv.getInt16(44 + i * 2, true) / 32768; sum += v * v; cnt++;
      }
      wins.push(Math.sqrt(sum / Math.max(1, cnt)));
    }
    return wins;
  });

  const db = v => v > 1e-7 ? (20 * Math.log10(v)).toFixed(1) : '-inf';
  console.log('\n=== 1. worst case: fb 0.85, WASH 1.0, SEND 1.0, route open, room->echo at dial max ===\n');
  console.log('  2s window RMS: ' + worst.map(db).join('  '));
  /* window 0 holds the kick itself; the loop's own peak is from window 1 on */
  const peak = Math.max(...worst.slice(1));
  const final = worst[worst.length - 1];
  const third = Math.floor(worst.length * 2 / 3);
  const fallingLate = final < worst[third] * 0.98;
  const fellFar = final < peak * 0.1;                    // 20 dB below its own peak
  const stable = fallingLate && fellFar;
  console.log(`\n  post-source peak ${db(peak)} dBFS -> final ${db(final)} dBFS` +
              ` (${(20 * Math.log10(final / peak)).toFixed(1)} dB), ` +
              `last third ${fallingLate ? 'still falling' : 'NOT falling'}`);
  console.log(`  ${stable ? 'THE LOOP DIES ON ITS OWN -- the dial max is safe'
                          : '<<< THE LOOP DOES NOT DECAY -- lower the roomEcho max'}`);

  /* ── 2. the crossing is audible where its genre declares it ── */
  const aud = await page.evaluate(async () => {
    const song = MK2.composeSong(7, undefined, 'plastikman');
    const S = MK2.soundOf('plastikman');
    const spb = (60 / song.chart.tempo) / 4;
    const bars = song.chart.bars || 64;
    const b0 = Math.floor(bars * 0.55), b1 = b0 + 8;
    const t0 = b0 * 16 * spb, t1 = b1 * 16 * spb;
    const ev = [];
    for(const e of song.perf.events){
      if(e.voice === 'tape'){ ev.push(Object.assign({}, e, { tSec: 0, durSec: (t1 - t0) + 3 })); continue; }
      if(e.tSec >= t0 - 0.06 && e.tSec < t1) ev.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - t0) }));
    }
    const secs = (t1 - t0) + 3;
    const render = async trims => {
      for(const k in trims) MK2.TRIM[k] = trims[k];
      const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate, song.motion, t0);
      for(const k in trims) delete MK2.TRIM[k];
      return await blob.arrayBuffer();
    };
    const on  = await render({});                          // genre base 0.14 + its rides
    const off = await render({ 'matrix.roomEcho': -1 });   // clamped to 0: crossing severed
    const da = new DataView(on), db2 = new DataView(off);
    const n = Math.min((on.byteLength - 44) / 2, (off.byteLength - 44) / 2);
    let ref = 0, dif = 0;
    for(let i = 0; i < n; i++){
      const va = da.getInt16(44 + i * 2, true) / 32768;
      const vb = db2.getInt16(44 + i * 2, true) / 32768;
      ref += va * va; dif += (vb - va) * (vb - va);
    }
    return 10 * Math.log10((dif + 1e-20) / (ref + 1e-20));
  });

  console.log('\n=== 2. the crossing on plastikman (its declared base + rides) vs severed ===\n');
  console.log(`  difference signal: ${aud.toFixed(1)} dB relative to the mix` +
              `  ${aud > -40 ? '-- the crossing is real' : '<<< inaudible, the base is decoration'}`);
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
