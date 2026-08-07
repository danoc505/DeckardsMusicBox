#!/usr/bin/env node
/* PROBE_PALETTE — how much of the instrument the genre owns does it USE?

     node harness/probe_palette.js [genre] [songs]

   WHY THIS EXISTS. The complaint was "we still are not using enough
   instruments in a song", and every tool here answered a different question:
   which machine is in which slot, whether a machine is reachable, whether a
   voice works. None of them asked HOW MANY OF THE SOUNDS A GENRE OWNS ARE
   EVER HEARD -- and the answer for dungeon synth was four of fifty-five,
   because the genre wrote a patch number on the panel and every song it made
   got that number.

   So this walks the genre's own `params` and `machines` tables, asks the
   panel what each song actually loaded, and reports the SPREAD: how many
   distinct patches, stations and kits a run of songs touched against how many
   the machines have. A number that stays at 1 is a knob pretending to be a
   draw. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const GENRE = process.argv[2] || 'dungeonsynth';
const N     = parseInt(process.argv[3], 10) || 60;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  await pg.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await pg.evaluate(([GENRE, N]) => {
    if (!MK2.genres().includes(GENRE)) return { err: 'no such genre: ' + GENRE };
    /* the RESOLVED table off a chart, not a copy of the source -- a blended
       song has no name to look up and a probe holding its own table goes stale */
    const T = MK2.composeSong(1, undefined, GENRE).chart.table;
    /* every switch-kind knob this genre speaks for -- the ones that choose a
       SOUND rather than shape one. Derived from the tables, never listed. */
    const knobs = [];
    for (const m in (T.params || {}))
      for (const k in T.params[m]) {
        const c = MK2.CONTROL[m + '.' + k];
        if (c && c.kind === 'switch') knobs.push({ m, k, c, seen: new Set() });
      }
    /* and every machine any slot can draw, so "how many boxes" and "how many
       sounds inside them" are two separate numbers */
    const boxes = {};
    for (const slot in (T.machines || {}))
      boxes[slot] = { offered: T.machines[slot].map(x => x[0]), seen: {}, sections: {} };

    for (let s = 1; s <= N; s++) {
      const song = MK2.composeSong(s, undefined, GENRE);
      for (const q of knobs) q.seen.add(MK2.panelValue(q.m, q.k));
      for (const slot in boxes) {
        const own = song.chart.picks[slot];
        if (own) boxes[slot].seen[own] = (boxes[slot].seen[own] || 0) + 1;
        /* per-section swaps: the machine actually sounding in each section */
        for (const sec of song.sections) {
          const mm = sec.machines && sec.machines[slot];
          if (mm) boxes[slot].sections[mm] = (boxes[slot].sections[mm] || 0) + 1;
        }
      }
    }
    return {
      knobs: knobs.map(q => ({
        key: q.m + '.' + q.k, label: q.c.label,
        positions: Math.floor((q.c.max - q.c.min) / (q.c.step || 1) + 1e-9) + 1,
        used: q.seen.size, values: [...q.seen].sort((a, b) => a - b),
      })),
      boxes,
    };
  }, [GENRE, N]);

  if (out.err) { console.log('  ' + out.err); await b.close(); return; }
  console.log(`\n  ${GENRE} — ${N} songs, what the panel actually loaded\n`);
  console.log('  SOUND SWITCHES   (a knob that chooses WHICH sound, not how it sounds)');
  if (!out.knobs.length) console.log('    none: this genre sets no switch-kind control');
  for (const q of out.knobs)
    console.log('    ' + q.key.padEnd(20) + String(q.used).padStart(3) + ' of ' +
      String(q.positions).padEnd(4) + ' positions   ' + q.label);
  console.log('\n  MACHINES PER SLOT   (own = the song\'s, sections = what a section swapped to)');
  for (const slot in out.boxes) {
    const B = out.boxes[slot];
    const own = Object.entries(B.seen).sort((a, b) => b[1] - a[1]);
    const sec = Object.entries(B.sections).sort((a, b) => b[1] - a[1]);
    console.log('    ' + slot.padEnd(10) + own.length + '/' + B.offered.length + ' offered   own: ' +
      own.map(([k, v]) => k + ' ' + v).join(', '));
    if (sec.length) console.log('              '.padEnd(14) + '           sections: ' +
      sec.map(([k, v]) => k + ' ' + v).join(', '));
  }
  if (errs.length) console.log('\n  page errors: ' + errs.join(' | '));
  await b.close();
})();
