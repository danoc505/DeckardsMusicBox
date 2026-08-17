/* A SECTION-KEYED MOVE ON A BUS THAT IS SILENT THERE IS A KNOB THAT DOES
   NOTHING, WITH A SCHEDULE.

   Found 2026-08-03 while preparing a taste check: lofi's "Tubby pair"
   (matrix.leadMix + matrix.leadEcho, keyed to the outro -- the record was
   meant to end by receding) is keyed to a section whose role list has never
   included the lead, so the move automates an empty bus. Jungle's bridge
   drum-drop (drumsMix cut, drumsEcho rise) is the same: its bridge plays
   ["bass","keys"], so the engineer's move fires after the arrangement has
   already removed the drums. Both were written against the arrangement the
   comment IMAGINED, not the one the roles table produces -- and no check
   compared the two, which is the same silence that let the polymeter be
   decoration (HANDOFF §0).

   Role lists cannot answer this from the table side: roles share buses
   (a bridge that plays only the ostinato still has its keys bus LIVE
   there at -3 dB, so keysMix's bridge cut is real). So MEASURE, the way
   probe_matrix does: for every kind:"section" move on a matrix crossing or
   an echo dial, cut the section's own bars from a real song, render twice --
   the control at the song's value and driven to the far end of its dial --
   and the difference signal says what that control could possibly change
   there. Below -60 dB the move is INERT: it is automation of nothing.

   A probe, not a pass/fail: some INERT rows may be defended (a move whose
   other section keys are live is half-alive, and an LFO underneath the
   section move can carry the lane elsewhere). The table is the finding;
   what to do with each row is a decision to make on the record.

     node harness/probe_section_motion.js            (~5-10 min, all genres)
     node harness/probe_section_motion.js jungle     (one genre)
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ONLY = process.argv[2];

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const rows = await page.evaluate(async ONLY => {
    const res = [];
    for(const g of MK2.genres()){
      if(ONLY && g !== ONLY) continue;
      /* ── the section moves, read off the COMPILED plan, not the table ──
         probe_wiring's lesson: ask the thing, not the declaration. A lane
         is measured only where a move names a section, and only lanes that
         ride the GRAPH (matrix crossings and the echo's dials) -- a section
         move on a per-note gesture is a different question, answered by
         whether the machine's own notes play, which probe_matrix covers. */
      const probe = MK2.composeSong(11, undefined, g);
      const cases = [];                             /* {lane, fn} */
      for(const k in probe.motion.lanes){
        if(!/^(matrix|echo)\./.test(k)) continue;
        for(const mv of probe.motion.lanes[k])
          if(mv.kind === 'section' && mv.by)
            for(const fn of Object.keys(mv.by))
              cases.push({ lane: k, fn });
      }
      if(!cases.length) continue;

      /* ── one seed per section function: seed 11 if its form has it, else
         the first of 1..40 that does. A section absent from forty songs is
         reported as such rather than guessed at. ── */
      const fns = [...new Set(cases.map(c => c.fn))];
      const seedFor = {}, songs = {};
      for(const fn of fns){
        if(probe.sections.some(s => s.fn === fn)){ seedFor[fn] = 11; songs[11] = probe; continue; }
        for(let s = 1; s <= 40; s++){
          const sg = songs[s] || (songs[s] = MK2.composeSong(s, undefined, g));
          if(sg.sections.some(x => x.fn === fn)){ seedFor[fn] = s; break; }
        }
      }

      const S = MK2.soundOf(g);
      const windows = {};                            /* fn -> rendered base + events */
      const render = async (win, trims) => {
        for(const k in trims) MK2.TRIM[k] = trims[k];
        const blob = await MK2.renderWav(win.ev, win.secs, 44100, S.space, S.kick,
                                         S.drumDrive, S.gate, win.song.motion, win.t0);
        for(const k in trims) delete MK2.TRIM[k];
        const ab = await blob.arrayBuffer(), dv = new DataView(ab);
        const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
        for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
        return a;
      };
      for(const fn of fns){
        const seed = seedFor[fn];
        if(seed == null){ windows[fn] = { missing: true }; continue; }
        const song = songs[seed];
        /* ── the occurrence with the most notes in it, not the first ──
           probe_matrix's lesson, re-learned here on the first run: a
           recurring function whose content grows across the record (a
           an instrumental at bar 0 may have no drums; at bar 200 it
           has all of them) read INERT when only its first statement was
           measured. Measure the fullest statement; a bus silent in THAT
           is silent in the section as this song plays it. */
        const spbT = (60 / song.chart.tempo) / 4;
        let sec = null, most = -1;
        for(const x of song.sections.filter(x => x.fn === fn)){
          const a0 = x.startBar * 16 * spbT, z0 = Math.min(x.endBar, x.startBar + 8) * 16 * spbT;
          const n = song.perf.events.filter(e => e.voice !== 'tape' && e.tSec >= a0 && e.tSec < z0).length;
          if(n > most){ most = n; sec = x; }
        }
        const spb = spbT;
        const b0 = sec.startBar, b1 = Math.min(sec.endBar, b0 + 8);
        const a = b0 * 16 * spb, z = b1 * 16 * spb, secs = (z - a) + 2;
        const ev = [];
        for(const e of song.perf.events){
          if(e.voice === 'tape'){ ev.push(Object.assign({}, e, { tSec: 0, durSec: secs })); continue; }
          if(e.tSec >= a - 0.06 && e.tSec < z) ev.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - a) }));
        }
        const win = { song, ev, secs, t0: a, seed, bars: b0 + '-' + b1 };
        win.base = await render(win, {});
        windows[fn] = win;
      }

      for(const c of cases){
        const win = windows[c.fn];
        if(win.missing){ res.push({ genre: g, lane: c.lane, fn: c.fn, note: 'no seed 1-40 grows this section' }); continue; }
        const [m, k] = c.lane.split('.');
        const ctl = (MK2.INSTRUMENTS[m].controls || []).find(x => x.k === k);
        const at = MK2.panelValue(m, k);
        const target = (at - ctl.min) > (ctl.max - at) ? ctl.min : ctl.max;
        const moved = await render(win, { [c.lane]: target - at });
        let r = 0, q = 0;
        for(let i = 0; i < win.base.length; i++){ r += win.base[i] * win.base[i];
          q += (moved[i] - win.base[i]) * (moved[i] - win.base[i]); }
        res.push({ genre: g, lane: c.lane, fn: c.fn, seed: win.seed, bars: win.bars,
                   db: +(10 * Math.log10((q + 1e-30) / (r + 1e-30))).toFixed(1) });
      }
    }
    return res;
  }, ONLY || null);

  console.log('\n=== every section-keyed matrix/echo move, measured in its own section ===');
  console.log('    (the control driven end-to-end inside the section it is keyed to;');
  console.log('     below -60 dB the bus is silent there and the move is INERT)\n');
  let inert = 0;
  for(const r of rows){
    if(r.note){ console.log(`  ${r.genre.padEnd(12)} ${r.lane.padEnd(20)} ${r.fn.padEnd(13)} ${r.note}`); continue; }
    const bad = r.db <= -60;
    if(bad) inert++;
    console.log(`  ${r.genre.padEnd(12)} ${r.lane.padEnd(20)} ${r.fn.padEnd(13)} seed ${String(r.seed).padEnd(3)} bars ${r.bars.padEnd(9)} ${String(r.db).padStart(7)} dB  ${bad ? 'INERT' : 'live'}`);
  }
  console.log(`\n  ${rows.filter(r => !r.note).length} section moves measured, ${inert} INERT`);
  if(errs.length) console.log('\n  PAGE ERRORS:', errs.join(' | '));
  await b.close();
})();
