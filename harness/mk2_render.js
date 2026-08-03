#!/usr/bin/env node
/* Render MK2 output for measurement — the reference bar (M0 gate) and songs.
     node harness/mk2_render.js <outdir> ref            # the M0 ear-gate bar
     node harness/mk2_render.js <outdir> songs 1,2,3    # full songs by seed
     node harness/mk2_render.js <outdir> songs 1 sega   # ...pinned to a rig
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path'), fs = require('fs');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const OUT = process.argv[2], MODE = process.argv[3] || 'ref';
const SEEDS = (process.argv[4] || '1').split(',').map(Number);
const RIG = process.argv[5] || 'draw';        // 'band' | 'sega' | 'neon' | 'draw'
const GENRE = process.argv[6] || undefined;  // which genre's tables build the song
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  async function save(name, b64){
    fs.writeFileSync(path.join(OUT, name), Buffer.from(b64, 'base64'));
    console.log('  wrote ' + name);
  }
  const toB64 = `async blob => {
    const ab = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(ab);
    for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  }`;

  if(MODE === 'ref'){
    const r = await page.evaluate(async () => {
      const ev = MK2.referenceEvents(84);
      const blob = await MK2.renderWav(ev, (2 * 16) * ((60/84)/4) + 1.5, 44100);
      const ab = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(ab);
      for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    });
    await save('mk2_reference_bar.wav', r);
  } else {
    for(const seed of SEEDS){
      const r = await page.evaluate(async ({ seed, rig, genre }) => {
        const song = MK2.composeSong(seed, rig, genre);
        // determinism proof: compose twice, compare event JSON
        const song2 = MK2.composeSong(seed, rig, genre);
        /* the genre's OWN sound -- kit, room and gate. Rendering a song with the
           default settings would produce a file no listener could get from the
           program itself. */
        const S = MK2.soundOf(song.chart.genre);
        const j = s => JSON.stringify(s.perf.events);
        const det = j(song) === j(song2);
        const blob = await MK2.renderWav(song.perf.events, song.perf.seconds, 44100,
                                         S.space, S.kick, S.drumDrive, S.gate);
        const ab = await blob.arrayBuffer(); let s2 = ''; const u = new Uint8Array(ab);
        for(let i = 0; i < u.length; i += 0x8000) s2 += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return { b64: btoa(s2), det, tempo: song.chart.tempo, mode: song.chart.mode, rig: song.chart.rig,
                 genre: song.chart.genre,
                 nBars: song.form.nBars, events: song.perf.events.length };
      }, { seed, rig: RIG, genre: GENRE });
      console.log(`  seed ${seed}: ${r.genre} · ${r.rig} · ${r.mode} ${r.tempo}bpm ` +
                  `${r.nBars} bars ${r.events} events deterministic=${r.det}`);
      await save(`mk2_${r.genre}_seed${seed}_${r.rig}.wav`, r.b64);
    }
  }
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
