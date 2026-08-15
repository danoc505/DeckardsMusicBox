#!/usr/bin/env node
/* PROBE_JOURNEY — boxcar synth's four claims, each held to a measurement.

     node harness/probe_journey.js [seeds]

   A genre that says it is a journey has to be one, and every claim below was
   true the day it was built. This exists because "true the day it was built"
   is exactly the class of fact this program has watched go stale — the dead
   drone fader, the five-slot pick literal, the group meters. Each check here
   fails loudly if the genre stops doing what its research sheet says.

   THE FOUR CLAIMS [docs/genre-research/boxcar-synth.md]:

     1. THE TRAIN IS THE DRUMMER, AND IN TOWN IT STANDS STILL. Travel
        sections carry the track rhythm; town sections are the train stopped,
        so they carry no drums. §3.
     2. THE JOURNEY IS ANNOUNCED. Every arrival in a town is preceded by
        brakes; every departure by the guard's whistle or the engine. §4.
     3. DARK TO LIGHT. The key change fires at roughly its declared rate and
        most of it lands in a brighter mode than it left. §5.
     4. THE LANDSCAPE PASSES, AND ONLY WHILE MOVING. Passing sounds happen in
        travelling sections and never in a town — a standing train passes
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
                  arrivalsAnnounced: 0, arrivals: 0,
                  departuresAnnounced: 0, departures: 0,
                  lifted: 0, toBrighter: 0, passesInTown: 0, passesTravelling: 0,
                  callRecords: 0, records: 0 };
    /* how bright a mode is, for the dark-to-light claim: the third and the
       sixth are what a listener hears as light or dark, so a mode with a
       major third outranks one without. */
    const BRIGHT = { major: 3, lydian: 3, mixolydian: 2, dorian: 1, minor: 0,
                     phrygian: -1, locrian: -1 };
    for(let s = 1; s <= SEEDS; s++){
      const song = MK2.composeSong(s, undefined, 'boxcarsynth');
      out.records++;
      const T = song.chart.table;
      const PAY = (T.form && T.form.payoff) || 'chorus';
      const STEPS = 16, spb = (60 / song.chart.tempo) / 4, barSec = STEPS * spb;
      const secs = song.sections || [];
      const ev = song.perf.events;
      const scene = ev.filter(e => e.voice === 'atmos');
      if(scene.some(e => e.bed === 'railCall')) out.callRecords++;
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
        const inHere = scene.filter(e => e.tSec >= a - 6 && e.tSec < b);
        if(fn === PAY){
          if(drums > 0) out.townsWithDrums.push(`seed ${s} bar ${sec.startBar}: ${drums} hits`);
          out.passesInTown += scene.filter(e => e.pass && e.tSec >= a && e.tSec < b).length;
          if(!prev || (prev.fn || prev.type) !== PAY){
            out.arrivals++;
            /* the brakes land BEFORE the downbeat and run into it */
            if(scene.some(e => /Arrive|Brake/.test(e.bed || '') &&
                          e.tSec < a && e.tSec > a - 20)) out.arrivalsAnnounced++;
          }
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
          if(prev && (prev.fn || prev.type) === PAY){
            out.departures++;
            if(scene.some(e => /Depart|Guard|Peep|Cbell/.test(e.bed || '') &&
                          e.tSec < a && e.tSec > a - 12)) out.departuresAnnounced++;
          }
        }
      }
    }
    out.keyShiftDeclared = GENRE.boxcarsynth.keyShift.chance;
    return out;
  }, SEEDS);

  console.log(`\nPROBE_JOURNEY — boxcar synth, ${R.records} records\n`);

  check("a town has no drums — the train is standing",
        R.townsWithDrums.length === 0,
        R.townsWithDrums.length ? R.townsWithDrums.slice(0, 3).join(" · ")
                                : "every town silent, every time");
  check("...and a travelling section always has them",
        R.travelNoDrums === 0,
        `${R.travelSecs - R.travelNoDrums}/${R.travelSecs} travelling sections carry the track`);
  check("every arrival in a town is announced by the brakes",
        R.arrivals > 0 && R.arrivalsAnnounced === R.arrivals,
        `${R.arrivalsAnnounced}/${R.arrivals}`);
  check("every departure is announced by the whistle or the bell",
        R.departures > 0 && R.departuresAnnounced === R.departures,
        `${R.departuresAnnounced}/${R.departures}`);
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
  check("the conductor calls, but not on every record",
        R.callRecords > 0 && R.callRecords < R.records,
        `${R.callRecords}/${R.records} records carry the call`);
  check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
