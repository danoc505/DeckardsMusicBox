/* DOES THE ECHO EVER STOP.

   Reported: "there is still a feedback, echo, stutter ... it starts to build and
   the program starts to stutter and glitch out even when you change the genre."

   The live graph is built ONCE per audio context and reused for every song, so
   the delay line, its feedback gain and the reverb all survive a stop and a
   genre change. That is a story. This measures it:

     1. play, and watch the output level for 12 s
     2. STOP, and keep watching for 10 s -- a delay at 0.85 feedback takes about
        seven seconds to fall 20 dB, and anything still moving after that is
        being fed by something
     3. switch genre and play again, watching whether the new song starts from
        silence or on top of whatever was left

   The number that matters is the level AFTER stop. A graph that cannot be
   silenced is a graph that accumulates.

     node harness/probe_echo_tail.js [genre]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GENRE = process.argv[2] || 'synthwave';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const sample = async (label, ms) => {
    const r = await page.evaluate(async ms => {
      const out = [];
      const t0 = performance.now();
      while(performance.now() - t0 < ms){
        const l = MK2.liveLevel();
        if(l) out.push(l.rms);
        await new Promise(r => setTimeout(r, 250));
      }
      return out;
    }, ms);
    const db = v => v > 1e-7 ? (20 * Math.log10(v)).toFixed(1) : "-inf";
    console.log(`  ${label.padEnd(28)} start ${db(r[0]).padStart(7)}  ` +
                `end ${db(r[r.length-1]).padStart(7)}  peak ${db(Math.max(...r)).padStart(7)} dB`);
    return r;
  };

  await page.evaluate(g => {
    const s = document.getElementById('genre');
    s.value = g; s.dispatchEvent(new Event('change', { bubbles: true }));
  }, GENRE);
  await page.waitForTimeout(900);

  console.log(`\n=== the echo tail, ${GENRE} ===\n`);
  await page.click('#play');
  await sample('playing', 12000);
  await page.click('#play');                      // stop
  const after = await sample('AFTER STOP', 10000);
  const quiet = after[after.length - 1];
  console.log(`\n  ten seconds after stop: ${quiet > 1e-7 ? (20*Math.log10(quiet)).toFixed(1) + ' dB' : 'silent'}` +
              (quiet > 3e-4 ? '   <<< STILL RINGING — the graph cannot be silenced' : '   — it decays'));

  /* and does a genre change start clean */
  await page.evaluate(() => {
    const s = document.getElementById('genre');
    s.value = 'plastikman'; s.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(700);
  await page.click('#play');
  await sample('after switching genre', 8000);
  await page.click('#play');
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
