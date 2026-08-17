/* WHAT IS ACTUALLY EATING THE MAIN THREAD — a CPU profile, by function.

   `probe_mainthread.js` says the frame is slow and how slow. It cannot say
   WHICH CODE made it slow, and this project has twice paid for the difference:
   both previous "it stutters" reports were diagnosed by theory first and both
   theories were wrong (HANDOFF §6 — the echo tail was decaying, the main thread
   was at p50 17 ms). The rule that came out of it is "do not start editing
   until you have the number", and this is the tool that gets the number.

   It runs Chrome's own sampling profiler over live playback and adds up SELF
   time per function, so the answer is a name and a line rather than a guess.

   USE IT IN PAIRS. A single genre's profile tells you where its time goes; the
   finding is always in the DIFFERENCE between a genre that stutters and one
   that does not, because every genre pays the same fixed costs for the page.

   ── WHAT IT FOUND, 2026-08-05, and the route matters more than the answer ──
   The user: "it is noticeable on acid and synthwave the worst." Measured, p50
   frame time: synthwave 41 ms, acid 28 ms, lofi 18 ms — the report reproduced
   exactly, and synthwave was dropping to 24 frames a second.

   FOUR THEORIES DIED TO MEASUREMENTS, in this order, which is why the tool
   exists rather than a patch:

     1. "It is the note count."  the densest genre has MORE events than either (6068
        against 5598) and 6 long tasks against synthwave's 100. Refuted.
     2. "It is our JavaScript."  86% of the main thread was `(program)` —
        native, no JS frame. refreshLive measured 2–4 ms a call and 12% of
        wall clock in EVERY genre, fast ones included. Refuted.
     3. "It is the size of the DOM."  jungle carries 19 337 nodes and runs at
        21 ms; lofi carries 7 751 and runs at 18. Refuted.
     4. "It is the CSS animations, or the field."  Disabling every animation
        moved synthwave 36 ms -> 37 ms; hiding the field, 37 ms. Refuted.

   THE A/B THAT FOUND IT. Hiding the ROLL took synthwave to 17 ms — and hiding
   the PANELS did exactly the same. Neither alone is the cost: the panels
   INVALIDATE and the roll makes the invalidation expensive. Every frame,
   `knobEl`'s refresh wrote `val.textContent` for all 143–169 knobs whether or
   not the number had changed, and a text change dirties layout — so the whole
   document was relaid out sixty times a second, over a roll holding one
   element per note. Dense genre, big roll, slow frame.

   FIXED by writing only what changed (see knobEl in the HTML). After:
   every genre 17 ms, the dance genres 0 long tasks, synthwave 100 -> 4.

   AND ONE CHANGE WAS REVERTED FOR MEASURING NOTHING. The playhead is moved by
   writing `left` as a percentage every frame, which is a layout property and
   looks exactly like the same defect. Rewriting it as a compositor transform
   changed the frame time by nothing, and layout still ran at ~60/s either way
   (5.9% of wall clock against 6.2%). It was the obvious second fix and it was
   not a fix, so it did not ship.

     node harness/probe_stutter.js <genre> [seconds]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GENRE = process.argv[2] || 'synthwave';
const SECS = Number(process.argv[3] || 15);

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
  await page.waitForTimeout(500);
  await page.evaluate(() => document.getElementById('play').click());
  await page.waitForTimeout(1200);                 // let the graph settle first

  const cdp = await page.context().newCDPSession(page);
  /* ── SCRIPT vs STYLE vs LAYOUT, before anything else ──────────────────────
     The first run of this probe reported 86% of the main thread as
     `(program)` — native time with no JS frame to attribute it to — which
     says the answer is NOT in our JavaScript and says nothing about where it
     IS. Chrome keeps the split itself, so ask it rather than inferring: these
     counters are cumulative, so they are read either side of the window and
     subtracted. ── */
  await cdp.send('Performance.enable');
  const readMetrics = async () => {
    const { metrics } = await cdp.send('Performance.getMetrics');
    const m = {}; for(const x of metrics) m[x.name] = x.value; return m;
  };
  const m0 = await readMetrics();
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 100 });   // microseconds
  await cdp.send('Profiler.start');
  console.log(`\nprofiling ${GENRE} for ${SECS}s of live playback...\n`);
  await page.waitForTimeout(SECS * 1000);
  const { profile } = await cdp.send('Profiler.stop');
  const m1 = await readMetrics();
  const d = k => ((m1[k] || 0) - (m0[k] || 0));
  const secs = d('Timestamp') || SECS;
  const share = v => (100 * v / secs).toFixed(1).padStart(5) + '%';
  console.log(`=== ${GENRE}: the browser's own split, over ${secs.toFixed(1)}s of wall clock ===\n`);
  console.log(`  script      ${d('ScriptDuration').toFixed(2).padStart(6)}s   ${share(d('ScriptDuration'))} of wall clock`);
  console.log(`  style       ${d('RecalcStyleDuration').toFixed(2).padStart(6)}s   ${share(d('RecalcStyleDuration'))}`);
  console.log(`  layout      ${d('LayoutDuration').toFixed(2).padStart(6)}s   ${share(d('LayoutDuration'))}`);
  console.log(`  all tasks   ${d('TaskDuration').toFixed(2).padStart(6)}s   ${share(d('TaskDuration'))}`);
  console.log(`  style recalcs ${d('RecalcStyleCount')} · layouts ${d('LayoutCount')} · nodes now ${m1.Nodes} · JS heap ${(m1.JSHeapUsedSize / 1e6).toFixed(0)} MB\n`);

  /* self time per node: the profiler gives samples + deltas, so the honest
     aggregation is to add each sample's own delta to the node it landed in */
  const byId = new Map(profile.nodes.map(n => [n.id, n]));
  const self = new Map();
  const deltas = profile.timeDeltas || [];
  const samples = profile.samples || [];
  let total = 0;
  for(let i = 0; i < samples.length; i++){
    const d = deltas[i] || 0; if(d < 0) continue;
    total += d;
    const n = byId.get(samples[i]); if(!n) continue;
    const f = n.callFrame || {};
    const name = (f.functionName || '(anonymous)') +
                 (f.lineNumber != null ? ':' + (f.lineNumber + 1) : '');
    self.set(name, (self.get(name) || 0) + d);
  }
  const rows = [...self.entries()].sort((a, z) => z[1] - a[1]);
  const ms = us => (us / 1000).toFixed(0).padStart(6);
  const pct = us => total ? (100 * us / total).toFixed(1).padStart(5) + '%' : '   --';

  console.log(`=== ${GENRE}: where the main thread went (${(total / 1e6).toFixed(1)}s of samples) ===\n`);
  console.log('    self ms    share   function');
  for(const [name, us] of rows.slice(0, 18))
    console.log(`  ${ms(us)}    ${pct(us)}   ${name}`);
  const idle = self.get('(program)') || 0, gc = self.get('(garbage collector)') || 0;
  console.log(`\n  idle/native ${pct(idle)} · garbage collector ${pct(gc)}`);
  if(errs.length) console.log('\n  PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
