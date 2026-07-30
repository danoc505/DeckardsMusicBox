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

    /* ── ONE WINDOW PER LANE, NOT ONE NUMBER PER RENDER ──────────────────────
       The first version took peak, level, brightness and tail across the WHOLE
       file and then reported nine of the TR-1000's per-drum chain controls
       dead: rCut, the whole clap channel, two hat sends, the crash echo.

       They are not dead. They are QUIET. The render is twelve lanes over
       fifty-five seconds, and moving the rimshot's filter from bottom to top
       changes two hits out of twenty-four; against the kick and the snare in
       the same file that is well under a tenth of a decibel of global level,
       so the test could not see it. Every control it called dead belonged to
       one of the quiet drums, which is the signature of an insensitive metric
       rather than of a broken circuit.

       So the file is cut into one window per lane -- the schedule already puts
       each lane in its own 4.2 s slot -- each window measured on its own, and a
       control counts as moving if it moves ANY of them. A rim filter now gets
       compared against the rim alone.

       Ninth setup error, same shape as the other eight. */
    const analyse = (ab, wins) => {
      const dv = new DataView(ab), n = (ab.byteLength - 44) / 4, SR = 44100;
      const w = [];
      for(const win of wins){
        const a = Math.min(n, Math.round(win[0] * SR));
        const b = Math.min(n, Math.round(win[1] * SR));
        let peak = 0, sum = 0, zc = 0, prev = 0, last = 0;
        for(let i = a; i < b; i++){
          const v = dv.getInt16(44 + (i*2)*2, true) / 32768;
          if(Math.abs(v) > peak) peak = Math.abs(v);
          sum += v*v;
          if(Math.abs(v) > 0.001 && (v >= 0) !== (prev >= 0)) zc++;
          prev = v;
        }
        for(let i = b - 1; i > a; i--)
          if(Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768) > peak * 0.02){ last = (i - a) / SR; break; }
        w.push({ peak, rms: Math.sqrt(sum / Math.max(1, b - a)), zc, tail: last });
      }
      return w;
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
      /* WHAT THE PERFORMANCE STAGE PUTS ON A NOTE, put on these notes too. A
         hand-built event is not a real one: stage 5 attaches `timbre` and `wow`
         to every keys note, and the Rhodes scales its wow BY the chart's drawn
         depth -- `(ev.wow || 0) * (knob / default)` -- so a note with no `wow`
         field makes the wow knob multiply zero and the probe calls it dead. It
         did. That is the eighth time in this file a measurement measured its
         own setup, and the fix is the same every time: build the thing the way
         the program builds it. */
      const keys = (role === 'keys')
        ? { timbre: song.chart.keysChar, wow: song.chart.tape.wow } : {};
      /* ── AND THE PRESSURE, for a machine that has aftertouch ────────────────
         The CS-80's three aftertouch controls -- atBrill, atLevel, atVib -- all
         read `ev.press`, a shape stage 5 attaches to any note long enough to
         lean on. A synthetic note has none, so all three multiplied nothing and
         the sweep called them dead. Twelfth setup error, and the same one as
         the Rhodes' wow: an event field the program writes and the probe did
         not. The values are the ones stage 5 draws -- a peak partway through a
         long note, with a rise. */
      const press = M.controls.some(c => /^at/.test(c.k))
        ? { press: { peak: 0.8, at: 1.2, rise: 0.35 } } : {};
      Object.assign(keys, press);
      /* A NOTE LONG ENOUGH TO REACH THE END OF THE TAPE. A Mellotron strip is
         about eight seconds and then it STOPS -- that is what tapeEnd switches
         -- so a three-second note can never see the control and the probe
         called it dead. A machine that declares it gets a note that outlives
         its tape. */
      const LONG = M.controls.some(c => c.k === 'tapeEnd') ? 9.0 : 3.0;
      const WIN = LONG + 2.4;
      for(const ln of laneNames){
        /* FOUR KINDS OF NOTE, because four different kinds of control need one.

           long and ACCENTED   a release, a tape end, an accent knob
           short and PLAIN     the un-accented path. Making this one accented
                               too -- which an earlier version did -- hid
                               tb303.decay completely, because an accented 303
                               note takes accDecay and never reads decay at all
           SLID INTO           `slide` is an event field no synthetic note had,
                               so slideTime was measured on a line with no
                               slides in it
           a RUN of accents    a control with MEMORY cannot be seen on a single
                               hit. The 303's accent sweep is an accumulator
                               that charges across consecutive accents and cools
                               between them, so sweepSpeed -- the rate it
                               charges at -- is invisible until something makes
                               it charge. */
        ev.push({ voice: lanes[ln], lane: ln, role, tSec: at, durSec: LONG,
                  gain: 0.9, pitch: 45, accent: true, slice: 0, ...keys });
        ev.push({ voice: lanes[ln], lane: ln, role, tSec: at + LONG + 0.4, durSec: 0.4,
                  gain: 0.7, pitch: 50, slide: 45, slice: 0, ...keys });
        for(let r = 0; r < 6; r++)
          ev.push({ voice: lanes[ln], lane: ln, role, tSec: at + LONG + 1.0 + r * 0.12,
                    durSec: 0.10, gain: 0.95, pitch: 45 + (r % 2) * 3, accent: true,
                    slice: 0, ...keys });
        at += WIN;
      }

      /* THREE WINDOWS A LANE, at two time scales. The lane's whole block, and
         then sixty milliseconds at each of its two onsets -- because an ATTACK
         control is a thirty-millisecond difference and a 4.2-second average
         cannot see one. tb303.softAtk read as dead for exactly that reason:
         the knob works, the ruler was a kilometre long. */
      const wins = [], winLane = [];
      for(let i = 0; i < laneNames.length; i++){
        const t0 = 0.3 + i * WIN;
        wins.push([i * WIN, (i + 1) * WIN]);       winLane.push(laneNames[i]);
        wins.push([t0, t0 + 0.06]);                winLane.push(laneNames[i] + ' onset');
        wins.push([t0 + LONG + 0.4, t0 + LONG + 0.46]); winLane.push(laneNames[i] + ' onset2');
        /* the accent run gets its own window, and it is the LAST hits of it that
           carry the accumulator -- the first one has nothing charged yet */
        wins.push([t0 + LONG + 1.3, t0 + LONG + 1.9]); winLane.push(laneNames[i] + ' accent run');
      }
      const nWin = wins.length;
      const render = async () => {
        const blob = await MK2.renderWav(ev, at + 3, 44100, S.space, S.kick, S.drumDrive,
                                         S.gate, song.motion, 0);
        return analyse(await blob.arrayBuffer(), wins);
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
        /* the biggest move over any single lane's window, and the lane it
           happened on -- which is also the most useful thing to print, because
           it says WHICH drum a control turned out to belong to */
        let d = { peak: 0, rms: 0, zc: 0, tail: 0 }, on = '-', best = -1;
        for(let w = 0; w < nWin; w++){
          const D = {
            peak: Math.abs(hi[w].peak - lo[w].peak) / Math.max(1e-6, lo[w].peak),
            rms:  Math.abs(20 * Math.log10(Math.max(1e-9, hi[w].rms) / Math.max(1e-9, lo[w].rms))),
            zc:   Math.abs(hi[w].zc - lo[w].zc) / Math.max(1, lo[w].zc),
            tail: Math.abs(hi[w].tail - lo[w].tail),
          };
          const score = D.peak / 0.01 + D.rms / 0.1 + D.zc / 0.01 + D.tail / 0.01;
          if(score > best){ best = score; d = D; on = winLane[w]; }
        }
        let moved = d.peak > 0.01 || d.rms > 0.1 || d.zc > 0.01 || d.tail > 0.01;
        let note = '';
        /* ── A CONTROL CAN LIVE INSIDE ANOTHER CONTROL'S CONDITION ───────────
           subbass.fall only exists while `env` is above zero; tb303.subLevel
           scales `subOsc`, which defaults to nothing; tb303.sweepSpeed is the
           rate of an accumulator that only charges under accents. Every one of
           them read as dead against a genre that happened to leave the control
           they depend on at its default -- which is a fact about the genre, not
           about the wiring.

           So a control that moved nothing gets ONE more try with the whole
           machine wide open: every other control pushed to the top of its
           travel, so anything it might be gated behind is on. If it moves then,
           it is conditional and says so. If it still does not, nothing it
           depends on can rescue it and it is simply not connected. */
        if(!moved){
          const saved = {};
          for(const o of M.controls) if(o.k !== c.k){
            saved[o.k] = [MK2.PARAMS[m + '.' + o.k], MK2.TRIM[m + '.' + o.k]];
            MK2.PARAMS[m + '.' + o.k] = o.max;
            MK2.TRIM[m + '.' + o.k] = o.max - (saved[o.k][0] == null ? o.def : saved[o.k][0]);
          }
          setTo(c.min); const lo2 = await render();
          setTo(c.max); const hi2 = await render();
          for(const o of M.controls) if(o.k !== c.k){
            const [pv, tv] = saved[o.k];
            MK2.PARAMS[m + '.' + o.k] = pv;
            if(tv === undefined) delete MK2.TRIM[m + '.' + o.k]; else MK2.TRIM[m + '.' + o.k] = tv;
          }
          for(let w = 0; w < nWin; w++){
            const D = {
              peak: Math.abs(hi2[w].peak - lo2[w].peak) / Math.max(1e-6, lo2[w].peak),
              rms:  Math.abs(20 * Math.log10(Math.max(1e-9, hi2[w].rms) / Math.max(1e-9, lo2[w].rms))),
              zc:   Math.abs(hi2[w].zc - lo2[w].zc) / Math.max(1, lo2[w].zc),
              tail: Math.abs(hi2[w].tail - lo2[w].tail),
            };
            if(D.peak > 0.01 || D.rms > 0.1 || D.zc > 0.01 || D.tail > 0.01){
              moved = true; d = D; on = winLane[w]; note = 'only with the machine open';
              break;
            }
          }
        }
        MK2.PARAMS[key] = saveP;
        if(saveT === undefined) delete MK2.TRIM[key]; else MK2.TRIM[key] = saveT;
        rows.push({ m, k: c.k, kind: c.kind || '?', moved, on, note, ...d });
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
    console.log('  control          kind      d peak   d level   d bright   d tail  on');
    for(const r of byM[m]){
      console.log(`  ${r.k.padEnd(15)} ${r.kind.padEnd(9)} ${(100*r.peak).toFixed(1).padStart(6)}%  ` +
                  `${r.rms.toFixed(2).padStart(6)}dB  ${(100*r.zc).toFixed(1).padStart(7)}%  ` +
                  `${r.tail.toFixed(3).padStart(6)}s  ${(r.moved ? r.on : '').padEnd(14)}` +
                  `${r.moved ? r.note : '<<< SILENT'}`);
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
