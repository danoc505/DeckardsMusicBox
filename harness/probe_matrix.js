/* EVERY CROSSING OF THE GRID MOVES AIR.

   A knob that does nothing is this file's cardinal sin, and a matrix mixer is
   fifteen knobs at once -- exactly the shape of thing that can look complete
   and be half wired. So: for each crossing, render the same bar twice, once
   with the crossing at its declared base and once with it driven to the other
   end of its travel, and measure the DIFFERENCE SIGNAL between the two.

   WHY A DIFFERENCE SIGNAL AND NOT AN RMS DELTA. An echo laid over a full band
   moves the total RMS by tenths of a dB while being plainly audible. The
   renders are deterministic (probe_render_determinism guards that), so
   changed-minus-unchanged IS the audio the knob added or removed, and its
   level relative to the mix is the honest measure of "can you hear it".

   The earlier version of this file measured a room->echo feedback governor.
   That crossing is gone -- it closed a cycle and cost the renderer its
   repeatability, which MATRIX.none records with the numbers.

     node harness/probe_matrix.js [genre]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GENRE = process.argv[2] || 'boxcarsynth';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async genre => {
    const song = MK2.composeSong(11, undefined, genre);
    const S = MK2.soundOf(genre);
    /* ── AN EXCERPT WHERE THE ROWS ACTUALLY PLAY ──────────────────────────
       The first version cut six bars from the middle and reported six dead
       crossings, which was the PROBE being wrong: a dense record is one that
       subtracts, and at that point it had no drums and no lead, so those rows
       had no signal to move. A crossing can only be tested where its source
       is sounding. So: scan candidate windows and take the one covering the
       most roles, then say plainly which rows this excerpt cannot speak for. */
    const spb = (60 / song.chart.tempo) / 4;
    const bars = song.chart.bars || 64;
    const cut = frac => {
      const q0 = Math.floor(bars * frac), q1 = q0 + 6;
      const a = q0 * 16 * spb, z = q1 * 16 * spb, list = [];
      for(const e of song.perf.events){
        if(e.voice === 'tape'){ list.push(Object.assign({}, e, { tSec: 0, durSec: (z - a) + 2 })); continue; }
        if(e.tSec >= a - 0.06 && e.tSec < z) list.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - a) }));
      }
      return { list, t0: a, secs: (z - a) + 2,
               roles: new Set(list.filter(e => e.voice !== 'tape').map(e => e.role)) };
    };
    let best = null;
    for(const f of [0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85])
      { const c = cut(f); if(!best || c.roles.size > best.roles.size) best = c; }
    const ev = best.list, t0 = best.t0, secs = best.secs;
    const render = async trims => {
      for(const k in trims) MK2.TRIM[k] = trims[k];
      const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate, song.motion, t0);
      for(const k in trims) delete MK2.TRIM[k];
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
      for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
      return a;
    };
    const diff = (A, B) => {
      let r = 0, q = 0;
      for(let i = 0; i < A.length; i++){ r += A[i] * A[i]; q += (B[i] - A[i]) * (B[i] - A[i]); }
      return 10 * Math.log10((q + 1e-30) / (r + 1e-30));
    };

    const base = await render({});
    const rows = [];
    for(const c of MK2.INSTRUMENTS.matrix.controls){
      const key = 'matrix.' + c.k;
      const at = MK2.panelValue('matrix', c.k);
      /* drive it to whichever end is further from where the song has it, so
         a crossing that is already open is tested by CLOSING it */
      const target = (at - c.min) > (c.max - at) ? c.min : c.max;
      const moved = await render({ [key]: target - at });
      /* ── THE ROW NAMES, DERIVED FROM THE GRID ITSELF ──────────────────
         Third time this exact bug: a hardcoded /(Mix|Echo|Room)$/ went stale
         when FLANGE arrived, and the replacement -- pulling column names out
         with /[A-Z][a-z]+/ -- went stale when DP4 arrived, because "DP4" has
         a digit in it. Stop guessing at the COLUMN end entirely: every source
         row has a `<row>Mix` crossing, so the row names ARE the Mix keys with
         "Mix" removed. Match the longest one that prefixes this key. Nothing
         to keep in step, whatever a column is called next. */
      const busNames = MK2.INSTRUMENTS.matrix.controls
        .map(x => x.k).filter(k => /Mix$/.test(k)).map(k => k.slice(0, -3))
        .sort((x, y) => y.length - x.length);
      const bus = busNames.find(n => c.k.startsWith(n)) || c.k;
      rows.push({ k: c.k, bus, from: at, to: target, db: diff(base, moved) });
    }
    /* ── THE DROP, MEASURED ─────────────────────────────────────────────────
       The headline gesture, and the one thing that would break silently if
       the sends were ever chained off the dry gain: close a row's MIX
       crossing while its ECHO crossing stays open, and the instrument must
       LEAVE THE MIX AND STILL BE HEARD through the delay. That is only true
       if the sends are pre-fader -- "a pre-fader Aux send is not influenced
       by channel-fader moves" [corpus:sweetwater]. Post-fader sends would
       take the echo down with the fader and the part would simply vanish,
       which is a mute, not a dub drop.
       Measured as: (dry killed, echo open) against (dry killed, echo shut).
       Whatever is left is the echo of a part that is no longer in the mix. */
    const drops = [];
    for(const bus of ['drums', 'bass', 'keys', 'lead']){
      const mixKey = 'matrix.' + bus + 'Mix', echoKey = 'matrix.' + bus + 'Echo';
      const mixAt = MK2.panelValue('matrix', bus + 'Mix');
      const echoAt = MK2.panelValue('matrix', bus + 'Echo');
      const gone   = await render({ [mixKey]: -mixAt, [echoKey]: 1 - echoAt });
      const silent = await render({ [mixKey]: -mixAt, [echoKey]: -echoAt });
      /* how loud the surviving echo is against the FULL mix, so the number
         means "you can still hear it in the record" */
      let ref = 0, q = 0;
      for(let i = 0; i < base.length; i++){ ref += base[i] * base[i];
        q += (gone[i] - silent[i]) * (gone[i] - silent[i]); }
      drops.push({ bus, db: 10 * Math.log10((q + 1e-30) / (ref + 1e-30)) });
    }

    /* ── WHICH BUSES ARE EVEN SOUNDING HERE, decided by measurement ──────────
       Not by reading event `role` tags: those are arrangement roles
       (`ostinato`, `pad`, ...) and several of them share one bus, so matching
       them against bus names marked live crossings dead. The MIX crossing
       already answers it exactly -- if closing a bus's fader changes nothing,
       that bus had nothing to close. Self-consistent, and it needs no table
       that could drift out of date. */
    const live = {};
    for(const r of rows) if(/Mix$/.test(r.k)) live[r.bus] = r.db > -60;
    /* ── AND THE SAME QUESTION AT THE OTHER END OF THE CROSSING ─────────────
       A send needs a live SOURCE and a live DESTINATION, and this only ever
       checked the source. Synthwave seats no DP/4, so leadDP4, echoDP4,
       roomDP4 and flangeDP4 all read -98 dB and got the file's harshest
       label -- "a knob that does nothing" -- for the entirely correct
       behaviour of feeding a unit this genre never loaded. Four false
       accusations, and the sort that trains a reader to skim the warnings.
       The destination's own Mix crossing already answers it, exactly as the
       source's does: if a column's return is silent, the column is not here.
       Column name = whatever follows the row name, lowercased, which lands
       on the return row's own bus name and needs no table. */
    for(const r of rows){
      const dest = r.k.slice(r.bus.length).toLowerCase();
      r.testable = live[r.bus] !== false && live[dest] !== false;
      r.why = live[r.bus] === false ? 'this bus is not playing here'
                                    : 'this genre seats no ' + dest;
    }
    return { rows, drops, present: Object.keys(live).filter(b => live[b]) };
  }, GENRE);

  console.log(`\n=== every crossing, on ${GENRE} (6 bars from the middle) ===\n`);
  console.log('  crossing        from    to     audio it adds/removes');
  let dead = 0, skipped = 0;
  for(const r of out.rows){
    /* -60 dB is a hundredth of a percent of the mix's energy: below that the
       crossing did nothing anyone could hear, whatever the panel says */
    const ok = r.db > -60;
    if(!r.testable){ skipped++; }
    else if(!ok) dead++;
    console.log(`  ${r.k.padEnd(14)} ${r.from.toFixed(2).padStart(5)}  ${r.to.toFixed(2).padStart(5)}   ` +
                `${r.db.toFixed(1).padStart(7)} dB  ` +
                (!r.testable ? '(' + r.why + ' — not testable)'
                             : ok ? '' : '<<< SILENT — a knob that does nothing'));
  }
  console.log('\n=== the drop: dry closed, send open — what is left is pure echo ===\n');
  for(const d of out.drops){
    const live = out.present.indexOf(d.bus) >= 0;
    console.log(`  ${d.bus.padEnd(6)} muted on the mix, still heard at ${d.db.toFixed(1).padStart(7)} dB  ` +
                (!live ? '(not playing here)' : d.db > -50 ? 'THE DROP WORKS — pre-fader'
                                                          : '<<< GONE — the send is following the fader'));
  }

  console.log('\n  buses with signal in this excerpt: ' + out.present.join(', '));
  if(skipped) console.log(`  ${skipped} crossing(s) untestable here; run another genre to cover them`);
  console.log(dead ? `  ${dead} crossing(s) changed nothing.`
                   : '  every crossing that could be tested changes the sound.');
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  process.exit(dead ? 1 : 0);
})();
