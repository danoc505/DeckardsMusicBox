#!/usr/bin/env node
/* PROBE_JOURNEY — boxcar synth's claims, each held to a measurement.

     node harness/probe_journey.js [seeds]

   A genre that says it is a journey has to be one, and every claim below was
   true the day it was built. This exists because "true the day it was built"
   is exactly the class of fact this program has watched go stale — the dead
   drone fader, the five-slot pick literal, the group meters. Each check here
   fails loudly if the genre stops doing what its research sheet says.

   THE CLAIMS [docs/genre-research/boxcar-synth.md]:

     1. THE TRAIN IS THE GROUND, AND IN TOWN IT STOPS. The `drone` role plays
        the running gear, so a town is a section that does not carry it — and
        NOT ONE SAMPLE of the run may sound inside one. §3.
     2. THE TRAIN IS THE DRUMMER TOO. Travel sections carry the track rhythm;
        town sections carry no drums, because the train is standing. §3.
     3. THE STOP IS A SCRIPT, AND IT RUNS IN ORDER. Arriving: the long blast,
        then the brakes, then the downbeat. Leaving: the conductor's call,
        the guard's whistle, the engine — all before the downbeat — and the
        conductor's bell AFTER it. §4.
     4. AND THE CONDUCTOR CALLS AT EVERY STOP. Not once a record: a conductor
        calls at every station. §4.
     5. DARK TO LIGHT. The key change fires at roughly its declared rate and
        most of it lands in a brighter mode than it left. §5.
     6. THE LANDSCAPE PASSES, AND ONLY WHILE MOVING. A standing train passes
        nothing. §8. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SEEDS = parseInt(process.argv[2], 10) || 25;

let pass = 0, fail = 0;
const check = (name, ok, note) => {
  console.log('  ' + (ok ? '✓' : '✗ FAIL:') + ' ' + name + (note ? '  (' + note + ')' : ''));
  ok ? pass++ : fail++;
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + HTML.replace(/ /g, '%20'));
  await pg.waitForTimeout(1200);

  const R = await pg.evaluate((SEEDS) => {
    const out = { townsWithDrums: [], travelNoDrums: 0, travelSecs: 0,
                  runInTown: [], towns: 0, runningTowns: 0,
                  movingSecs: 0, movingWithRun: 0, silentMoving: [],
                  arrivals: 0, arrivalsInOrder: 0, arrivalsBad: [],
                  departures: 0, departuresInOrder: 0, departuresBad: [],
                  callsWanted: 0, callsGot: 0,
                  lifted: 0, toBrighter: 0, passesInTown: 0, passesTravelling: 0,
                  records: 0 };
    /* how bright a mode is, for the dark-to-light claim: the third and the
       sixth are what a listener hears as light or dark, so a mode with a
       major third outranks one without. */
    const BRIGHT = { major: 3, lydian: 3, mixolydian: 2, dorian: 1, minor: 0,
                     phrygian: -1, locrian: -1 };
    /* the FIRST time a named bed speaks inside a window, or null */
    const firstIn = (list, re, a, b) => {
      let best = null;
      for(const e of list)
        if(re.test(e.bed || '') && e.tSec >= a && e.tSec < b && (best == null || e.tSec < best))
          best = e.tSec;
      return best;
    };
    for(let s = 1; s <= SEEDS; s++){
      const song = MK2.composeSong(s, undefined, 'boxcarsynth');
      out.records++;
      const T = song.chart.table;
      const PAY = (T.form && T.form.payoff) || 'chorus';
      const STEPS = 16, spb = (60 / song.chart.tempo) / 4, barSec = STEPS * spb;
      const secs = song.sections || [];
      const ev = song.perf.events;
      const scene = ev.filter(e => e.voice === 'atmos');
      const run = ev.filter(e => e.voice === 'trainbox');
      const lift = song.materials && song.materials.lift;
      if(lift){
        out.lifted++;
        const from = BRIGHT[song.chart.mode] == null ? 0 : BRIGHT[song.chart.mode];
        const to = BRIGHT[lift.mode] == null ? 0 : BRIGHT[lift.mode];
        if(to > from) out.toBrighter++;
      }
      for(let i = 0; i < secs.length; i++){
        const sec = secs[i], prev = secs[i - 1];
        const fn = sec.fn || sec.type;
        /* ── THE BOUNDARY IS EXCLUSIVE AT BOTH ENDS, AND THAT MATTERS ────────
           The first version counted a hit landing exactly on the NEXT
           section's downbeat as belonging to this one, and reported 541 drum
           hits inside towns that are in fact silent — every one of them at
           bar 12.00 of a 12-bar town, which is the next section's first
           instant. A probe that cannot tell a boundary from an interior
           invents defects; EPS is a hundredth of a bar. A section whose bars
           are not numbers is skipped rather than turned into NaN. */
        if(!Number.isFinite(sec.startBar) || !Number.isFinite(sec.endBar)) continue;
        const EPS = barSec * 0.01;
        const a = sec.startBar * barSec + EPS, b = sec.endBar * barSec - EPS;
        const drums = ev.filter(e => e.role === 'drums' && e.tSec >= a && e.tSec < b).length;
        if(fn === PAY){
          if(drums > 0) out.townsWithDrums.push(`seed ${s} bar ${sec.startBar}: ${drums} hits`);
          out.passesInTown += scene.filter(e => e.pass && e.tSec >= a && e.tSec < b).length;
        } else if(fn === "intro" || fn === "outro"){
          /* THE YARD AND THE ARRIVAL ARE NOT TRAVELLING. The train has not
             left yet, or it has stopped for good: both legitimately carry no
             track rhythm, and counting them as travel made the first run
             report 35 silent "travelling" sections that are nothing of the
             kind. The claim is about the sections where the train is MOVING. */
        } else {
          out.travelSecs++;
          if(drums === 0) out.travelNoDrums++;
          out.passesTravelling += scene.filter(e => e.pass && e.tSec >= a && e.tSec < b).length;
        }

        /* ══ 1. NOT ONE SAMPLE OF THE RUN INSIDE A TOWN ═══════════════════
           The claim the whole build exists for.

           ── AND THE FIRST VERSION OF THIS CHECK WAS CIRCULAR ──────────────
           It found towns by asking whether the section carried the `drone`
           role, then asked whether the run sounded in them — which is the
           same question twice, so it could not fail. Driven to failure on
           purpose (the train put back into the chorus, which is the exact
           defect this build removed) it reported "5 towns, 0 carrying the
           run": the defect had deleted the towns rather than been caught.

           A town is now the PAYOFF SECTION, which is what the form says a
           town is and is independent of the thing being tested. An event
           that merely ENDS on the town's downbeat is not in the town; one
           that spans any part of its interior is. */
        if(fn === PAY){
          out.towns++;
          const inside = run.filter(e => e.tSec + e.durSec > a && e.tSec < b);
          if(inside.length){
            out.runningTowns++;
            out.runInTown.push(`seed ${s} bar ${sec.startBar}: ${inside.length} run events`);
          }
        } else if(fn !== "intro"){
          /* AND THE REVERSE REGRESSION: a train that never runs would pass
             the claim above trivially. Everything that is not the yard and
             not a town has to carry it. */
          out.movingSecs++;
          if(run.some(e => e.tSec + e.durSec > a && e.tSec < b)) out.movingWithRun++;
          else out.silentMoving.push(`seed ${s} ${fn} bar ${sec.startBar}`);
        }

        /* ══ 3. THE SCRIPT, IN ORDER ══════════════════════════════════════ */
        const A = sec.startBar * barSec;
        if(prev && (prev.fn || prev.type) !== PAY && fn === PAY){
          out.arrivals++;
          /* ARRIVING: one long blast, then the brakes, then the downbeat. */
          const blast = firstIn(scene, /Whistle/, A - 40, A);
          const brake = firstIn(scene, /Arrive|Brake/, A - 40, A);
          if(blast != null && brake != null && blast < brake) out.arrivalsInOrder++;
          else out.arrivalsBad.push(`seed ${s} bar ${sec.startBar}: blast ${blast} brake ${brake}`);
        }
        if(prev && (prev.fn || prev.type) === PAY && fn !== PAY){
          out.departures++;
          /* LEAVING: the call, the guard, the engine — all before the
             downbeat, in that order — and the conductor's bell after it.
             This is the owner's "makes a call before and after the train
             starts again" written as an inequality. */
          /* ── AND THIS CHECK NAMED A SAMPLE THAT DOES TWO JOBS ──────────────
             `eng` used to be `firstIn(scene, /Depart|Peep/, A - 40, A)` — the
             FIRST thing matching those names in a FORTY-SECOND window. But
             `railPeep` is the departure engine AND the genre's grade-crossing
             `shortWhistle`, so a crossing anywhere in that window was picked
             up as the engine and reported out of order. Seed 2 read
             "engine 260.19" against a call at 280.4: the engine was exactly
             where the script puts it (A - 1.6) and the probe had found a
             crossing thirty seconds earlier instead.

             It went red when a terrain re-deal moved a crossing into the
             window, which means the check had been passing by luck rather
             than by construction. The engine is searched from THE GUARD
             ONWARDS, because that is where the script actually puts it —
             derive the window from the thing being checked, not from a round
             number. [harness/README.md: "Anything that LISTS what the program
             contains will go stale."] */
          const call  = firstIn(scene, /Call/,   A - 40, A);
          const guard = firstIn(scene, /Guard/,  A - 40, A);
          const eng   = guard == null ? null
                      : firstIn(scene, /Depart|Peep/, guard + 1e-6, A);
          const bell  = firstIn(scene, /Cbell/,  A, A + barSec * 4);
          if(call != null) out.callsGot++;
          out.callsWanted++;
          if(call != null && guard != null && eng != null && bell != null &&
             call < guard && guard < eng && eng <= A && bell > A)
            out.departuresInOrder++;
          else out.departuresBad.push(
            `seed ${s} bar ${sec.startBar}: call ${call} guard ${guard} engine ${eng} bell ${bell}`);
        }
      }
    }
    out.keyShiftDeclared = GENRE.boxcarsynth.keyShift.chance;
    return out;
  }, SEEDS);

  console.log(`\nPROBE_JOURNEY — boxcar synth, ${R.records} records\n`);

  /* THE ONE THE BUILD EXISTS FOR */
  check("the running sound STOPS in every town",
        R.towns > 0 && R.runningTowns === 0,
        R.runningTowns ? R.runInTown.slice(0, 3).join(" · ")
                       : `${R.towns} towns, not one carries a sample of the run`);
  check("...and it runs everywhere else — every travelling section carries it",
        R.movingSecs > 0 && R.movingWithRun === R.movingSecs,
        R.movingWithRun === R.movingSecs
          ? `${R.movingWithRun}/${R.movingSecs} moving sections carry the run`
          : R.silentMoving.slice(0, 3).join(" · "));
  check("a town has no drums — the train is standing",
        R.townsWithDrums.length === 0,
        R.townsWithDrums.length ? R.townsWithDrums.slice(0, 3).join(" · ")
                                : "every town silent, every time");
  check("...and a travelling section always has them",
        R.travelNoDrums === 0,
        `${R.travelSecs - R.travelNoDrums}/${R.travelSecs} travelling sections carry the track`);
  check("every arrival runs its script in order — the blast, then the brakes",
        R.arrivals > 0 && R.arrivalsInOrder === R.arrivals,
        R.arrivalsInOrder === R.arrivals ? `${R.arrivalsInOrder}/${R.arrivals}`
                                         : R.arrivalsBad.slice(0, 3).join(" · "));
  check("every departure runs its script in order — call, guard, engine, then the bell after",
        R.departures > 0 && R.departuresInOrder === R.departures,
        R.departuresInOrder === R.departures ? `${R.departuresInOrder}/${R.departures}`
                                             : R.departuresBad.slice(0, 3).join(" · "));
  check("the conductor calls at EVERY stop, not once a record",
        R.callsWanted > 0 && R.callsGot === R.callsWanted,
        `${R.callsGot}/${R.callsWanted} departures carry the call`);
  check("the landscape passes only while the train is moving",
        R.passesTravelling > 0 && R.passesInTown === 0,
        `${R.passesTravelling} passing while travelling, ${R.passesInTown} in a town`);
  /* the key change is a DRAW, so this is a band around the declared rate
     rather than an equality — a coin that lands 65% of the time over 25
     records is somewhere between 45% and 85% unless something is wrong */
  {
    const rate = R.lifted / R.records, want = R.keyShiftDeclared;
    check("the key changes at about the rate the genre declares",
          rate > want - 0.22 && rate < want + 0.22,
          `${R.lifted}/${R.records} = ${(rate*100).toFixed(0)}%, declared ${(want*100).toFixed(0)}%`);
  }
  check("...and the change mostly goes toward the light",
        R.lifted > 0 && R.toBrighter >= R.lifted * 0.5,
        `${R.toBrighter}/${R.lifted} records moved into a brighter mode`);
  check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
