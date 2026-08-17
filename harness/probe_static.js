#!/usr/bin/env node
/* PROBE_STATIC — how much does the record actually change, and how many parts
   are playing while it does?

     node harness/probe_static.js [genre] [songs]

   WHY THIS EXISTS. Two complaints arrived together and neither had a number
   attached to it: "it's too static for far too long" and "we still only have
   4 things going -- look at that one image, it's 8 tracks not 4". Both are
   claims about the WHOLE RECORD over time, and every tool here measured
   either one material (the roll) or one 70-second window (the stems probe).
   Neither can see a ten-minute song repeating itself.

   So this walks the song bar by bar and asks two things:

     HOW MANY PARTS  sound in each bar, and how that is spread. The ten
                     canonical records this genre was measured against run 4-6
                     at once; four was the reported floor and the complaint.
     HOW MANY PICTURES  the record has. A "picture" is one bar reduced to
                     WHICH PARTS ARE PLAYING + WHICH CHORD IS UNDER THEM +
                     WHICH BAR OF ITS OWN LOOP EACH PART IS ON. Two bars with
                     the same picture sound the same. The count of distinct
                     ones, and the longest run of a single one, is what
                     "static" means said in numbers. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const GENRE = process.argv[2] || 'dungeonsynth';
const N     = parseInt(process.argv[3], 10) || 24;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await pg.evaluate(([GENRE, N]) => {
    const rows = [];
    for (let s = 1; s <= N; s++) {
      const song = MK2.composeSong(s, undefined, GENRE);
      /* which parts are in each bar, taken from the EVENTS -- the performance
         is the only place that knows about rests, arrivals and thinning */
      const spb = (60 / song.chart.tempo) / 4, barSec = 16 * spb;
      /* A HELD NOTE IS SOUNDING IN EVERY BAR IT CROSSES, and counting only the
         bar it STARTS in was this probe's own first answer -- which reported a
         sixteen-bar drone as one bar of bass and fifteen of silence. What is
         being asked is what the person playing it hears at a given moment, so an event
         counts for every bar between its onset and its end. */
      const inBar = [];
      for (const e of song.perf.events) {
        if (e.role === 'tape') continue;
        const b0 = Math.floor(e.tSec / barSec);
        const b1 = Math.floor((e.tSec + Math.max(0, e.durSec || 0) - 1e-6) / barSec);
        for (let bar = b0; bar <= b1 && bar < song.form.nBars; bar++)
          (inBar[bar] || (inBar[bar] = new Set())).add(e.role);
      }
      const counts = [];
      for (let i = 0; i < song.form.nBars; i++) counts.push(inBar[i] ? inBar[i].size : 0);
      /* the picture: cast + chord + where each part is in its own loop */
      const secOf = [], matOf = [], startOf = [];
      for (const sec of song.sections)
        for (let i = sec.startBar; i < sec.endBar; i++) {
          secOf[i] = sec.fn; matOf[i] = sec.material; startOf[i] = sec.startBar;
        }
      const pics = [], seen = new Map();
      for (let i = 0; i < song.form.nBars; i++) {
        const cast = inBar[i] ? [...inBar[i]].sort().join(',') : '';
        const ch = (song.materials.chordsOf && song.materials.chordsOf[matOf[i]]) || song.materials.chords;
        const loopBar = (i - (startOf[i] || 0)) % song.materials.bars;
        const cycle = Math.floor((i - (startOf[i] || 0)) / song.materials.bars);
        const key = cast + '|' + matOf[i] + '|' + loopBar + '|' + (cycle % 2) + '|' +
                    (ch[loopBar % ch.length] || {}).degree;
        pics.push(key);
        seen.set(key, (seen.get(key) || 0) + 1);
      }
      let run = 1, worst = 1;
      for (let i = 1; i < pics.length; i++) {
        if (pics[i] === pics[i - 1]) run++; else run = 1;
        if (run > worst) worst = run;
      }
      /* how much of the record the single commonest picture covers */
      let top = 0; for (const v of seen.values()) if (v > top) top = v;
      const sorted = counts.slice().sort((x, y) => x - y);
      rows.push({
        bars: song.form.nBars,
        mean: counts.reduce((a, c) => a + c, 0) / counts.length,
        lo: sorted[Math.floor(counts.length * 0.1)],
        hi: sorted[Math.floor(counts.length * 0.9)],
        pics: seen.size, worstRun: worst, topShare: top / counts.length,
        chorusMoves: song.materials.chorusChords !== song.materials.chords,
      });
    }
    return rows;
  }, [GENRE, N]);

  const avg = k => out.reduce((a, r) => a + r[k], 0) / out.length;
  console.log(`\n  ${GENRE} — ${out.length} songs\n`);
  console.log(`  PARTS SOUNDING AT ONCE   mean ${avg('mean').toFixed(2)}` +
              `   10th pct ${avg('lo').toFixed(1)}   90th pct ${avg('hi').toFixed(1)}`);
  console.log(`  HOW MANY DIFFERENT BARS  ${avg('pics').toFixed(1)} distinct pictures` +
              ` in ${avg('bars').toFixed(0)} bars`);
  console.log(`  LONGEST UNCHANGING RUN   ${avg('worstRun').toFixed(1)} bars` +
              `   ·   commonest bar is ${(avg('topShare') * 100).toFixed(0)}% of the record`);
  console.log(`  CHORUS HAS ITS OWN CHANGES  ${out.filter(r => r.chorusMoves).length}/${out.length} songs`);
  if (errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  await b.close();
})();
