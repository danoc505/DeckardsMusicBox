#!/usr/bin/env node
/* TESTS THAT RUN ON THE OUTPUT.
 *
 * Every test in tests.js runs on NOTE DATA -- bar/step/midi/vel -- and the whole
 * history of this project is bugs that lived downstream of the notes: a master
 * lowpass that ran for 71 seconds, hats highpassed into inaudibility, a kick
 * carrying a second kick, an amen break pasted over the boombap spine. Not one of
 * those could ever have failed a note-level test. The user's standing instruction
 * is that the only test that matters is what comes out of the speakers; this is
 * the closest a script can get -- render the song and assert on the WAVEFORM.
 *
 *   node harness/test_output.js [outdir]     # renders one song per genre
 *   python3 harness/test_output.py [outdir]  # asserts on the renders
 *
 * Renders SECONDS_PER_SONG seconds of one song per genre at 22050 Hz through the
 * same scheduleAll() the export button uses, so what is judged is the shipped
 * performance: groove, pump, buses, master chain and all.
 */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path'), fs = require('fs');

const HTML = path.resolve(__dirname, '..', 'Improv Machine playable_BETA 0.1.html');
const OUT = process.argv[2] || path.join(__dirname, 'output_renders');
const SECONDS_PER_SONG = 30;
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof newSong === 'function' && typeof Synth === 'object', { timeout: 30000 });

  // one seed per genre, found deterministically
  const seedByGenre = await page.evaluate(() => {
    const found = {};
    for (let s = 1; s <= 400 && Object.keys(found).length < 9; s++) {
      const g = conduct(s).genre;
      if (!(g in found)) found[g] = s;
    }
    return found;
  });

  const manifest = [];
  for (const [genre, seed] of Object.entries(seedByGenre)) {
    const r = await page.evaluate(async ({ seed, secs }) => {
      try {
        newSong(String(seed));
        // determinism at the EVENT level: build the same seed twice, hash all events
        const h = ev => ev.map(e => [e.step, e.kind, e.lane || '', e.midi || 0,
          (e.vel || 0).toFixed(4), (e.micro || 0).toFixed(4)].join(',')).join('|');
        const h1 = h(SESSION.events);
        newSong(String(seed));
        const h2 = h(SESSION.events);
        const buf = await Synth.renderOffline(secs, t0 => scheduleAll(t0), 22050);
        const ab = await (Synth.encodeWav(buf)).arrayBuffer();
        let s2 = ''; const u = new Uint8Array(ab);
        for (let i = 0; i < u.length; i += 0x8000)
          s2 += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return { ok: 1, deterministic: h1 === h2, nEvents: SESSION.events.length, b64: btoa(s2) };
      } catch (e) { return { ok: 0, err: String(e) + '\n' + (e.stack || '') }; }
    }, { seed, secs: SECONDS_PER_SONG });
    if (!r.ok) {
      manifest.push({ genre, seed, error: r.err });
      console.log(`  ${genre} seed ${seed}: RENDER FAILED  ${r.err.split('\n')[0]}`);
      continue;
    }
    const f = path.join(OUT, `${genre}_seed${seed}.wav`);
    fs.writeFileSync(f, Buffer.from(r.b64, 'base64'));
    manifest.push({ genre, seed, file: f, deterministic: r.deterministic, nEvents: r.nEvents });
    console.log(`  ${genre} seed ${seed}: rendered  (${r.nEvents} events, deterministic=${r.deterministic})`);
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'),
    JSON.stringify({ manifest, pageErrors }, null, 1));
  await browser.close();
  console.log('wrote ' + path.join(OUT, 'manifest.json'));
})();
