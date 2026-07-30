/* THE STUTTER. WebAudio renders on its own thread, but every note this program
   plays is CONSTRUCTED on the main thread by the scheduler pump, and every knob,
   trigger lamp and readout is redrawn there too. A main thread that stalls
   cannot feed the audio thread, and what you hear is a glitch.

   Two things are watched:
     - LONG TASKS, anything over 50 ms. Over ~100 ms during playback is audible.
     - ANIMATION FRAME TIME, because refreshLive runs on every frame and the
       panel has grown from a handful of knobs to a ten-channel strip with
       faders, trigger lamps, readouts and a screen.

   Reported alongside how much work a frame is being asked to do, so a slow frame
   can be attributed rather than guessed at.

     node harness/probe_mainthread.js [genre] [seconds]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GENRE = process.argv[2] || 'synthwave';
const SECS = Number(process.argv[3] || 30);

(async () => {
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });
  await page.evaluate(g => {
    const s = document.getElementById('genre');
    s.value = g; s.dispatchEvent(new Event('change', { bubbles: true }));
  }, GENRE);
  /* the reported reproduction: a machine loaded into a slot while a genre plays */
  const MACH = process.argv[4];
  if(MACH){
    await page.selectOption('#mKeys', MACH);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    window.__long = [];
    try {
      new PerformanceObserver(list => {
        for(const e of list.getEntries()) window.__long.push(Math.round(e.duration));
      }).observe({ entryTypes: ['longtask'] });
    } catch(e){ window.__long = null; }
    window.__frames = [];
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      window.__frames.push(Math.round(now - last));
      last = now;
      window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
    document.getElementById('play').click();
  });

  console.log(`\nplaying ${GENRE} for ${SECS}s, watching the main thread...`);
  await page.waitForTimeout(SECS * 1000);

  const r = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    const f = window.__frames.slice(5).sort((a, b) => a - b);
    const pct = p => f[Math.min(f.length - 1, Math.floor(f.length * p))];
    const song = MK2.currentSong();
    return { long: window.__long, frames: f.length,
             p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), worst: f[f.length - 1],
             over50: f.filter(x => x > 50).length, over100: f.filter(x => x > 100).length,
             events: song.perf.events.length,
             lanes: Object.keys(song.motion.lanes).length,
             knobs: document.querySelectorAll('.kn').length,
             trigs: document.querySelectorAll('.trig').length,
             moving: document.querySelectorAll('.kn:not(.still)').length,
             late: MK2.lateDropped ? MK2.lateDropped() : -1 };
  });

  console.log(`\n=== ${GENRE}: the main thread during playback ===`);
  console.log(`  the work per frame: ${r.knobs} knobs (${r.moving} animated) · ${r.trigs} trigger lamps · ` +
              `${r.lanes} motion lanes · ${r.events} events in the song`);
  console.log(`  frames sampled ${r.frames}`);
  console.log(`  frame time   p50 ${r.p50} ms   p95 ${r.p95} ms   p99 ${r.p99} ms   worst ${r.worst} ms`);
  console.log(`  frames over 50 ms: ${r.over50}   over 100 ms: ${r.over100}`);
  console.log(`  notes the pump dropped for arriving late: ${r.late}`);
  if(r.long === null) console.log('  (longtask observer unavailable)');
  else console.log(`  long tasks (>50 ms): ${r.long.length}` +
                   (r.long.length ? ' — ' + r.long.slice(0, 12).join(', ') + ' ms' : ''));
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
