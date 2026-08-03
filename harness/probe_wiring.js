/* IS ANY OF IT ACTUALLY CONNECTED?

   Things were added fast: a flanger, a DP/4, a stereo stage, a stage-per-
   section, a snap, a new room. Each was measured ALONE at the moment it
   landed. Nothing has ever asked the whole question: for each genre, WHICH of
   these capabilities does it actually use, and which are present but unreached?

   A capability nobody uses is not a feature, it is a knob that does nothing
   wearing a bigger coat -- and the battery cannot catch that, because the
   battery only asks whether SOME genre uses each control.

     node harness/probe_wiring.js
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

  const res = await page.evaluate(() => {
    const out = [];
    for(const g of MK2.genres()){
      const song = MK2.composeSong(11, undefined, g);
      const S = MK2.soundOf(g), sp = S.space || {};
      const lanes = Object.keys(song.motion.lanes);
      const has = re => lanes.some(k => re.test(k));
      /* a snap is a KIND, not a key -- look inside */
      let snap = false;
      for(const k in song.motion.lanes)
        for(const mv of song.motion.lanes[k]) if(mv.kind === "snap") snap = true;
      /* ── THE FX COLUMNS COME FROM THE GRID, NOT FROM A LIST HERE ──────────
         `flange` and `dp4` were written out by hand, and the barberpole
         landed a build later without a column in this table -- the exact
         staleness this file exists to catch, in this file. Every return
         column declares `<name>Feeds`, so ask MATRIX which columns exist
         and read the matching list. A new effect needs no edit here. */
      /* ── AND WHETHER A COLUMN IS REACHED IS ASKED OF THE CROSSINGS ────────
         Reading the genre's `<name>Feeds` list looks like the answer and is
         not: the ROOM column arrives open for keys and lead whatever the
         genre declares, so counting `space.feeds` reported the room as used
         by two genres when all seven use it. A column is reached when some
         crossing into it has a non-zero base, which is true by construction
         for the defaults and for the declared lists alike. */
      const row = { genre: g, pan: has(/\.pan$/) };
      for(const o of MK2.MATRIX.outs) if(o.feeds)
        row[o.k] = Object.keys(MK2.PARAMS).some(k =>
          k.indexOf("matrix.") === 0 && k.slice(-o.k.length) === o.k && MK2.PARAMS[k] > 0);
      out.push(Object.assign(row, {
        stage:  !!(MK2.INSTRUMENTS && song.chart.table ? song.chart.table.stage : null) ||
                has(/^(?!matrix)[a-z0-9]+\.pan$/) && !!(song.chart.table && song.chart.table.stage),
        kitPan: !!sp.kitPan,
        width:  (MK2.PARAMS["echo.width"] || 0) > 0 || has(/echo\.width/),
        spread: sp.spread != null,
        preDly: sp.preDelay != null,
        cuts:   snap,
      }));
    }
    return { rows: out, fx: MK2.MATRIX.outs.filter(o => o.feeds).map(o => o.k) };
  });

  const cols = res.fx.concat(["pan", "kitPan", "width", "spread", "preDly", "cuts"]);
  const rows = res.rows;
  console.log("\n=== which genre uses what was added ===\n");
  console.log("  genre        " + cols.map(c => c.padEnd(8)).join(""));
  const tally = {};
  for(const r of rows){
    console.log("  " + r.genre.padEnd(12) +
      cols.map(c => (r[c] ? "yes" : "-").padEnd(8)).join(""));
    for(const c of cols) tally[c] = (tally[c] || 0) + (r[c] ? 1 : 0);
  }
  console.log("\n  genres using each, of 7:");
  for(const c of cols)
    console.log("    " + c.padEnd(9) + String(tally[c]).padStart(2) +
      (tally[c] === 0 ? "   <<< NOBODY USES THIS" : tally[c] === 1 ? "   (one genre only)" : ""));
  if(errs.length) console.log("PAGE ERRORS: " + errs.slice(0, 2).join(" | "));
  await b.close();
})();
