/* DOES THE KAOSS PAD MOVE AIR.

   Reported: "I've been unable to notice it work." The pad writes TRIM on
   echo.tone (X) and echo.fb (Y); busTouched rewrites the live curves. Every
   link in that chain can be true and the user can still be right, because the
   thing the pad modulates is the ECHO RETURN, whose level is the genre's
   `echo.send` (0.10-0.32) -- so this measures BOTH claims separately:

   1. LIVE -- the user's exact gesture. Play a song in a real browser, drag the
      pad with real pointer events to the top-right corner (tone max, fb max),
      then STOP. A delay at 0.85 feedback rings for seconds; at the genre's
      base it dies quickly. The stop-tail is pure echo, so the difference is
      the pad reaching the live sound, independent of what section is playing.

   2. AUDIBILITY, per genre -- offline A/B on the same excerpt: pad neutral vs
      the pad's corners, at the genre's own send level. RMS and high-band
      deltas say how LOUD the pad's whole range is on each genre, which is the
      honest answer to "why can't I hear it".

     node harness/probe_kaoss.js
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* ── PART 1: THE LIVE GESTURE, measured as a stop-tail ─────────────────── */
  console.log('\n=== 1. the pad, live: drag with a real pointer, then stop ===\n');

  const setGenre = g => page.evaluate(g => {
    const s = document.getElementById('genre');
    s.value = g; s.dispatchEvent(new Event('change', { bubbles: true }));
  }, g);

  /* the fx rack has to be ON SCREEN to be dragged -- go through the same door
     the user does */
  const openPad = async () => {
    await page.evaluate(() => { MK2.showRack('fx'); });
    await page.waitForSelector('.xypad', { timeout: 5000 });
  };

  const dragPadTo = async (fx, fy) => {   // fractions: fx right, fy up
    const pad = page.locator('.xypad').first();
    await pad.scrollIntoViewIfNeeded();
    const box = await pad.boundingBox();
    const x = box.x + box.width * fx, y = box.y + box.height * (1 - fy);
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(x, y, { steps: 5 });
    await page.mouse.up();
  };

  const stopTail = async label => {
    await page.click('#play');                         // stop
    const r = await page.evaluate(async () => {
      const out = [];
      const t0 = performance.now();
      while(performance.now() - t0 < 6000){
        const l = MK2.liveLevel();
        if(l) out.push({ t: (performance.now() - t0) / 1000, rms: l.rms });
        await new Promise(r => setTimeout(r, 200));
      }
      return out;
    });
    /* the LAST moment the tail is still above -50 dB (3.2e-3) -- first-crossing
       lied here once: the meter reads ~0 for an instant right at the stop */
    let died = 0;
    for(const p of r) if(p.rms >= 3.2e-3) died = p.t;
    const db = v => v > 1e-7 ? (20 * Math.log10(v)).toFixed(1) : '-inf';
    console.log(`  ${label.padEnd(34)} tail at +1s ${db(r[5] ? r[5].rms : 0).padStart(7)} dB` +
                `   below -50 dB after ${died == null ? '>6.0' : died.toFixed(1)} s`);
    return { died: died == null ? 6 : died, at1s: r[5] ? r[5].rms : 0 };
  };

  await setGenre('plastikman');            // the genre built on this echo
  await page.waitForTimeout(700);
  await openPad();

  /* baseline: play 8 s, hands off, stop */
  await page.click('#play');
  await page.waitForTimeout(8000);
  const base = await stopTail('hands off (genre base fb)');

  /* the gesture: play again, drag to top-right (tone max, fb max), stop */
  await page.click('#play');
  await page.waitForTimeout(4000);
  await dragPadTo(0.98, 0.98);
  const trim = await page.evaluate(() => ({
    tone: MK2.TRIM['echo.tone'], fb: MK2.TRIM['echo.fb'],
    toneNow: MK2.panelValue('echo', 'tone'), fbNow: MK2.panelValue('echo', 'fb'),
  }));
  const wrote = trim.tone != null && trim.fb != null;
  console.log(`  pad wrote: tone -> ${trim.toneNow} Hz (trim ${trim.tone > 0 ? '+' : ''}${trim.tone})` +
              `, fb -> ${trim.fbNow} (trim ${trim.fb > 0 ? '+' : ''}${trim.fb})` +
              (wrote ? '' : '   <<< THE DRAG WROTE NOTHING'));
  await page.waitForTimeout(4000);
  const wild = await stopTail('pad at top-right (fb max)');

  /* release the hand for part 2 -- double-click is the documented release,
     but TRIM is exported and this is between measurements, not a UI claim */
  await page.evaluate(() => {
    delete MK2.TRIM['echo.tone']; delete MK2.TRIM['echo.fb']; MK2.refreshBus();
  });

  const livePass = wrote && wild.died > base.died + 1.0;
  console.log(`\n  ${livePass ? 'THE PAD REACHES THE LIVE SOUND' : '<<< THE PAD DID NOT CHANGE THE LIVE SOUND'}` +
              ` -- fb-max tail ${wild.died.toFixed(1)} s vs base ${base.died.toFixed(1)} s`);

  /* ── PART 2: HOW LOUD IS THE PAD'S WHOLE RANGE, per genre ──────────────── */
  console.log('\n=== 2. audibility at the genre\'s own send: pad corners vs neutral (offline A/B) ===\n');
  console.log('  genre         send  feeds                added/removed audio vs the mix   verdict');

  const rows = await page.evaluate(async () => {
    const out = [];
    for(const g of MK2.genres()){
      /* load the genre's own bases the way the UI does */
      const s = document.getElementById('genre');
      s.value = g; s.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 60));
      const song = MK2.composeSong(11, undefined, g);
      const S = MK2.soundOf(g);
      /* a busy stretch from the middle of the song, 8 bars + room for tails */
      const spb = (60 / song.chart.tempo) / 4;
      const bars = song.chart.bars || 64;
      const b0 = Math.floor(bars * 0.5), b1 = b0 + 8;
      const t0 = b0 * 16 * spb, t1 = b1 * 16 * spb;
      const ev = [];
      for(const e of song.perf.events){
        if(e.voice === 'tape'){ ev.push(Object.assign({}, e, { tSec: 0, durSec: (t1 - t0) + 2 })); continue; }
        if(e.tSec >= t0 - 0.06 && e.tSec < t1) ev.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - t0) }));
      }
      const secs = (t1 - t0) + 2;

      const renderBuf = async trims => {
        for(const k in trims) MK2.TRIM[k] = trims[k];
        const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate,
                                         song.motion, t0);
        for(const k in trims) delete MK2.TRIM[k];
        return await blob.arrayBuffer();
      };
      /* THE DIFFERENCE SIGNAL. Total RMS lies here: a clearly audible echo
         laid over a full mix moves the total by tenths of a dB. The renders
         are deterministic and note-identical, so corner-minus-neutral IS the
         audio the pad's move added or removed, and its level RELATIVE to the
         mix is the audibility number. */
      const diffDb = (a, b2) => {
        const da = new DataView(a), db2 = new DataView(b2);
        const n = Math.min((a.byteLength - 44) / 2, (b2.byteLength - 44) / 2);
        let ref = 0, dif = 0;
        for(let i = 0; i < n; i++){
          const va = da.getInt16(44 + i * 2, true) / 32768;
          const vb = db2.getInt16(44 + i * 2, true) / 32768;
          ref += va * va; dif += (vb - va) * (vb - va);
        }
        return 10 * Math.log10((dif + 1e-20) / (ref + 1e-20));
      };

      /* corners of the pad, as TRIM offsets from the genre's own base --
         exactly what a hand at the corner writes */
      const tBase = MK2.panelValue('echo', 'tone'), fBase = MK2.panelValue('echo', 'fb');
      const neutral = await renderBuf({});
      const hotCorner = await renderBuf({ 'echo.tone': 9000 - tBase, 'echo.fb': 0.85 - fBase });
      const deadCorner = await renderBuf({ 'echo.tone': 300 - tBase, 'echo.fb': 0 - fBase });

      out.push({
        genre: g,
        send: MK2.panelValue('echo', 'send'),
        feeds: (S.space.echoFeeds || []).join('+') || '(none)',
        up: diffDb(neutral, hotCorner),
        dn: diffDb(neutral, deadCorner),
      });
    }
    return out;
  });

  /* ── PART 3: THE MATRIX GIVES THE PAD ITS VOICE ────────────────────────────
     Same excerpt, same corners, but with a hand on the matrix first: open
     drums into the echo and push the master send -- the "sends ridden on the
     mixer" half of the dub sentence. The pad's corners must now move real
     air on the genre that measured DEADEST above. */
  let anyDead = false;
  for(const r of rows){
    /* the added echo, relative to the mix it sits in: above -26 dB an added
       element is plainly there; below -40 dB it is gone under the band */
    const span = Math.max(r.up, r.dn);
    const verdict = span >= -26 ? 'audible' : span >= -34 ? 'FAINT' : '<<< INAUDIBLE';
    if(span < -26) anyDead = true;
    console.log(`  ${r.genre.padEnd(12)} ${r.send.toFixed(2)}  ${r.feeds.padEnd(20)}` +
                ` up ${r.up.toFixed(1).padStart(6)} dB   down ${r.dn.toFixed(1).padStart(6)} dB  ${verdict}`);
  }
  console.log('\n  (each number: the audio that corner ADDS/REMOVES, relative to the whole mix;');
  console.log('   "up" = tone-max/fb-max corner, "down" = tone-min/fb-zero corner)');
  if(anyDead) console.log('  At least one genre gives the pad little to work on at its own send level.');

  console.log('\n=== 3. the same pad, after a hand opens the matrix (lofi, drums -> echo, send up) ===\n');
  const m3 = await page.evaluate(async () => {
    const s = document.getElementById('genre');
    s.value = 'lofi'; s.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    const song = MK2.composeSong(11, undefined, 'lofi');
    const S = MK2.soundOf('lofi');
    const spb = (60 / song.chart.tempo) / 4;
    const bars = song.chart.bars || 64;
    const b0 = Math.floor(bars * 0.5), b1 = b0 + 8;
    const t0 = b0 * 16 * spb, t1 = b1 * 16 * spb;
    const ev = [];
    for(const e of song.perf.events){
      if(e.voice === 'tape'){ ev.push(Object.assign({}, e, { tSec: 0, durSec: (t1 - t0) + 2 })); continue; }
      if(e.tSec >= t0 - 0.06 && e.tSec < t1) ev.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - t0) }));
    }
    const secs = (t1 - t0) + 2;
    const renderBuf = async trims => {
      for(const k in trims) MK2.TRIM[k] = trims[k];
      const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate,
                                       song.motion, t0);
      for(const k in trims) delete MK2.TRIM[k];
      return await blob.arrayBuffer();
    };
    const diffDb = (a, b2) => {
      const da = new DataView(a), db2 = new DataView(b2);
      const n = Math.min((a.byteLength - 44) / 2, (b2.byteLength - 44) / 2);
      let ref = 0, dif = 0;
      for(let i = 0; i < n; i++){
        const va = da.getInt16(44 + i * 2, true) / 32768;
        const vb = db2.getInt16(44 + i * 2, true) / 32768;
        ref += va * va; dif += (vb - va) * (vb - va);
      }
      return 10 * Math.log10((dif + 1e-20) / (ref + 1e-20));
    };
    const HAND = { 'matrix.drumsEcho': 1, 'echo.send': 0.5 - MK2.panelValue('echo', 'send') };
    const tBase = MK2.panelValue('echo', 'tone'), fBase = MK2.panelValue('echo', 'fb');
    /* the matrix move itself, against hands-off -- the send being ridden */
    const handsOff = await renderBuf({});
    const neutral = await renderBuf(HAND);
    const hot  = await renderBuf(Object.assign({ 'echo.tone': 9000 - tBase, 'echo.fb': 0.85 - fBase }, HAND));
    const dead = await renderBuf(Object.assign({ 'echo.tone': 300 - tBase,  'echo.fb': 0 - fBase }, HAND));
    return { open: diffDb(handsOff, neutral), up: diffDb(neutral, hot), dn: diffDb(neutral, dead) };
  });
  const span3 = Math.max(m3.up, m3.dn);
  console.log(`  opening the matrix itself:  ${m3.open.toFixed(1).padStart(6)} dB of new audio vs hands-off`);
  console.log(`  then pad to the hot corner: ${m3.up.toFixed(1).padStart(6)} dB   pad to the dead corner: ${m3.dn.toFixed(1).padStart(6)} dB`);
  console.log(`  ${span3 >= -26 ? 'WITH THE MATRIX OPEN THE PAD IS AN INSTRUMENT' : '<<< STILL QUIET -- the matrix did not deliver'}`);

  if(!livePass) console.log('\n  LIVE PATH FAILED -- the gesture does not reach the playing song.');
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
