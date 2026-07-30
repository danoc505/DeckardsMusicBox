/* DOES EVERY CONTROL ON EVERY PANEL REACH THE SOUND.

   This session found five separate controls that did not, and every one was
   found by the user hearing it rather than by anything here:

     dacHit     threw a ReferenceError on every SEGA kick and snare
     muffler    was a lowpass where the instrument has a soft clipper
     the faders lost their first hit to a note landing before t0
     the gate   fed the reverb in FRONT of the channel fader
     the gate   again -- driving it from 0 to 0.9 changes nothing at all

   That is a class of bug, not five accidents, and a class of bug deserves a
   sweep rather than five investigations. The rule this project already has is
   "a knob that does nothing is a lie"; this is the measurement that enforces it.

   METHOD. For every machine in the rack and every control it declares: put the
   machine in its slot, render one note of its own voice with the control at the
   BOTTOM of its travel, render the same note again at the TOP, and compare.
   Four ways, because a control can change any of them: peak, loudness,
   brightness and tail length.

   Rendered the way the program PLAYS -- with the genre's space, kick, drive,
   gate and motion plan -- because the last two bugs here were both invisible to
   a bare render. A control measured on a graph that was never configured
   measures the graph.

   WHAT A FAILURE MEANS. Not every control must move a single note:

     `switch` and `pick`   choose a voice or a kit; they change what plays, and
                           a one-note test with a fixed voice cannot see it
     `bus` controls        are scheduled onto the graph, so they need the motion
                           plan -- which is passed
     sends                 need something to send to, so they are rendered with
                           the genre's real space

   Anything left over is a control that is drawn, documented, automated, and
   silent. Those are listed at the end and are the point of the file.

     node harness/probe_controls.js [machine]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ONLY = process.argv[2] || null;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async ONLY => {
    /* a genre that actually loads the machine, so the graph is the real one */
    const HOST = { drums: 'synthwave', bass: 'acid', keys: 'vangelis', space: 'plastikman', desk: 'plastikman' };
    const rows = [];

    const analyse = (ab) => {
      const dv = new DataView(ab), n = (ab.byteLength - 44) / 4;
      let peak = 0, sum = 0, zc = 0, prev = 0, last = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
        if(Math.abs(v) > peak) peak = Math.abs(v);
        sum += v*v;
        if(Math.abs(v) > 0.001 && (v >= 0) !== (prev >= 0)) zc++;
        prev = v;
      }
      for(let i = n - 1; i > 0; i--)
        if(Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768) > peak * 0.02){ last = i / 44100; break; }
      return { peak, rms: Math.sqrt(sum / Math.max(1, n)), zc, tail: last };
    };

    const PICK0 = { drums: MK2.PICK.drums, bass: MK2.PICK.bass, keys: MK2.PICK.keys };
    for(const m of Object.keys(MK2.INSTRUMENTS)){
      if(ONLY && m !== ONLY) continue;
      const M = MK2.INSTRUMENTS[m];
      if(M.legacy) continue;
      const genre = HOST[M.slot] || 'synthwave';
      /* ── PUT THE MACHINE IN THE SLOT ────────────────────────────────────────
         The first run set MK2.PARAMS for the machine under test but never
         PICKed it, so the graph loaded whatever the genre draws and read ITS
         controls instead. Seventeen controls came back "silent" and most of
         them were simply not in the circuit -- kit.bus, tr808.gate, rhodes.wow,
         all measured while a different machine was in the slot.

         That is the same mistake this session has now made five times in five
         different probes: measuring a control on a graph that was never set up
         to contain it. Setting the PICK is the whole fix. */
      if(['drums','bass','keys'].includes(M.slot)) MK2.PICK[M.slot] = m;
      /* ...and PICK has to be HANDED to composeSong. Setting MK2.PICK alone did
         nothing: the picks are an argument, not a global the composer reads, and
         a three-argument call takes the genre's own draw every time. That is the
         same mistake twice in one probe -- the machine was still not in the slot
         after the fix that was supposed to put it there. */
      const song = MK2.composeSong(1, 'draw', genre, MK2.PICK);
      const S = MK2.soundOf(genre);

      /* ── EVERY LANE THE MACHINE HAS, NOT JUST THE FIRST ────────────────────
         The first version rendered one note on the machine's first lane, and
         then reported tr808's SNAPPY, SDTONE, CHDECAY and OHDECAY dead. They
         are the snare and hat controls; the note was a kick. A drum machine's
         controls belong to different drums, so the test has to strike all of
         them. */
      /* THE TR-1000 DECLARES `kits`, NOT `lanes` -- one box with four voice sets
         behind its KIT key -- so a probe that only looks at `lanes` skipped the
         only drum machine anybody actually plays and then reported it clean.
         Seventh time this session a measurement measured its own setup. */
      const lanes = M.lanes || (M.kits && M.kits[Object.keys(M.kits)[0]]) || {};
      const laneNames = Object.keys(lanes);
      if(!laneNames.length) continue;
      const role = (M.slot === 'drums') ? 'drums' : M.slot;
      /* TWO notes, and the first is ACCENTED and LONG. An accent knob cannot be
         seen on an unaccented note; a tape-end switch cannot be seen on a note
         shorter than the tape; a release cannot be seen on a note that never
         gets to release. The first run tested one short unaccented note and
         then reported tb303.accent and mellotron.tapeEnd dead. */
      const ev = [];
      let at = 0.3;
      for(const ln of laneNames){
        /* long and accented, then short and plain: a release, a tape end and an
           accent knob each need a note that reaches them */
        ev.push({ voice: lanes[ln], lane: ln, role, tSec: at, durSec: 3.0,
                  gain: 0.9, pitch: 45, accent: true, slice: 0 });
        ev.push({ voice: lanes[ln], lane: ln, role, tSec: at + 3.4, durSec: 0.4,
                  gain: 0.7, pitch: 45, slice: 0 });
        at += 4.2;
      }

      const render = async () => {
        const blob = await MK2.renderWav(ev, at + 3, 44100, S.space, S.kick, S.drumDrive,
                                         S.gate, song.motion, 0);
        return analyse(await blob.arrayBuffer());
      };

      for(const c of M.controls){
        const key = m + '.' + c.k;
        /* MOVE THE HAND, not the stored value. Two controls -- the kit drive and
           the gated-verb send -- take their base from the genre and add the
           user's TRIM, which is exactly what a hand on the panel writes. A probe
           that only sets PARAMS cannot see them, and would call them dead. */
        const saveP = MK2.PARAMS[key], saveT = MK2.TRIM[key];
        const setTo = v => { MK2.PARAMS[key] = v; MK2.TRIM[key] = v - (saveP == null ? c.def : saveP); };
        setTo(c.min);
        const lo = await render();
        setTo(c.max);
        const hi = await render();
        MK2.PARAMS[key] = saveP;
        if(saveT === undefined) delete MK2.TRIM[key]; else MK2.TRIM[key] = saveT;
        const d = {
          peak: Math.abs(hi.peak - lo.peak) / Math.max(1e-6, lo.peak),
          rms:  Math.abs(20 * Math.log10(Math.max(1e-9, hi.rms) / Math.max(1e-9, lo.rms))),
          zc:   Math.abs(hi.zc - lo.zc) / Math.max(1, lo.zc),
          tail: Math.abs(hi.tail - lo.tail),
        };
        const moved = d.peak > 0.01 || d.rms > 0.1 || d.zc > 0.01 || d.tail > 0.01;
        rows.push({ m, k: c.k, kind: c.kind || '?', moved, ...d });
      }
    }
    MK2.PICK.drums = PICK0.drums; MK2.PICK.bass = PICK0.bass; MK2.PICK.keys = PICK0.keys;
    return rows;
  }, ONLY);

  const byM = {};
  for(const r of out) (byM[r.m] || (byM[r.m] = [])).push(r);
  const dead = [];
  for(const m of Object.keys(byM)){
    console.log(`\n=== ${m} ===`);
    console.log('  control          kind      d peak   d level   d bright   d tail');
    for(const r of byM[m]){
      console.log(`  ${r.k.padEnd(15)} ${r.kind.padEnd(9)} ${(100*r.peak).toFixed(1).padStart(6)}%  ` +
                  `${r.rms.toFixed(2).padStart(6)}dB  ${(100*r.zc).toFixed(1).padStart(7)}%  ` +
                  `${r.tail.toFixed(3).padStart(6)}s${r.moved ? '' : '   <<< SILENT'}`);
      if(!r.moved) dead.push(`${r.m}.${r.k} (${r.kind})`);
    }
  }
  console.log(`\n=== ${dead.length} controls move the sound in no way at all ===`);
  for(const d of dead) console.log('  ' + d);
  console.log('\n  A `switch` or `pick` here is usually fine -- it chooses a voice or a kit,');
  console.log('  which one note with a fixed voice cannot show. A `gesture` or a `bus` is not.');
  if(errs.length) console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' | '));
  await b.close();
})();
