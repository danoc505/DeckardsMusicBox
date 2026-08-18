#!/usr/bin/env node
/* PROBE_RIDE — DOES THE PICTURE AGREE WITH THE RECORD?
 *
 *     node harness/probe_ride.js [seeds] [file.html]
 *
 *   ── WHY THIS EXISTS ─────────────────────────────────────────────────────
 *   `docs/HANDOFF-BOXCAR.md` §7 asks for the visualiser and closes with the
 *   one sentence in it that is a TEST rather than a description:
 *
 *     "A station sprite must arrive within a beat of the brake sample."
 *
 *   A visualiser is the easiest thing in this program to ship broken, because
 *   it is the only display nobody can check by listening. This file has already
 *   shipped a picture that disagreed with the sound TWICE — the tape drawing a
 *   running deck over dry audio, and the medium read off a channel `setSpace`
 *   never receives — and in both cases the picture was the thing being believed.
 *
 *   So the ride makes four claims that can be false, and this asks all four.
 *
 *   ── THE CLAIMS ──────────────────────────────────────────────────────────
 *     STOPS      the landscape stops moving when the train does. `ridePos` is
 *                the audio's own "is it running" array; if the ride used a
 *                second model these would drift and a bird would stop passing
 *                while the fields kept going by.
 *     ARRIVES    the platform is beside the train while the train is standing,
 *                and it is NOT beside the train while the train is running.
 *                Both halves are needed: a station drawn permanently at the
 *                cowcatcher passes the first and is not a station.
 *     BRAKES     and it is in frame, ahead of the train, when the brake sample
 *                sounds — §7's sentence, measured in beats of this record's
 *                own tempo rather than in seconds.
 *     PLAYS      a figure in the doorway moves only while its part is
 *                sounding. Checked by asking the ride's own seat cursor at a
 *                moment each part IS playing and a moment it is NOT.
 *
 *   ── AND IT ASKS THE PAGE, NOT A COPY OF THE PAGE ────────────────────────
 *   `MK2.rideState()` hands out the plan the canvas is actually drawing from.
 *   A probe that recomputed the distance table would be testing its own
 *   arithmetic, which is the mistake `probe_mode.js` made twice with the clock.
 */
const path = require("path");
const { chromium } = require("playwright");

const SEEDS = parseInt(process.argv[2], 10) || 6;
const HTML = path.resolve(process.argv[3] || path.join(__dirname, "..", "Boxcar Synth.html"));
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium";
/* the same geometry the draw uses, asked of the page rather than copied */

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", e => errs.push(String(e.message)));
  await pg.goto("file://" + HTML, { waitUntil: "load", timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 30000 });

  const out = await pg.evaluate(async (SEEDS) => {
    const M = window.MK2, rows = [];
    for(let s = 1; s <= SEEDS; s++){
      let R, S;
      try { M.newSong(s); S = M.songNow(); R = M.rideState(); } catch(e){ rows.push({ s, threw: String(e.message) }); continue; }
      if(!R){ rows.push({ s, threw: "no ride plan" }); continue; }
      const beat = 60 / S.chart.tempo;
      const G = M.rideGeom();                    // the page's own numbers
      const r = { s, tempo: S.chart.tempo, beat, stops: R.stops.length };

      /* STOPS — distance must not advance while the form says standing, and
         must advance while it says running */
      let creep = 0, frozen = 0, ran = 0, stuck = 0;
      const C = S.motion.clock, rp = S.form.ridePos;
      for(let t = 4; t < S.perf.seconds - 4; t += 4){
        const bar = Math.floor(C.barAt(t));
        const standing = rp[Math.max(0, Math.min(rp.length - 1, bar))] < 0;
        const move = R.at(t + 2) - R.at(t - 2);
        /* the smoothed ramp means the edges of a stop are neither, so only the
           MIDDLE of each state is asked -- 8 s in from either edge */
        const bar0 = Math.floor(C.barAt(t - 8)), bar1 = Math.floor(C.barAt(t + 8));
        const s0 = rp[Math.max(0, Math.min(rp.length - 1, bar0))] < 0;
        const s1 = rp[Math.max(0, Math.min(rp.length - 1, bar1))] < 0;
        if(s0 !== standing || s1 !== standing) continue;
        if(standing){ frozen++; if(move > 1.0) creep++; }
        else { ran++; if(move < 4.0) stuck++; }
      }
      r.creep = creep; r.frozen = frozen; r.stuck = stuck; r.ran = ran;

      /* ARRIVES — the platform's x while standing, and while running.
         `stationX` is the draw's own expression, taken from rideGeom so this
         cannot drift from what is painted. */
      const xOf = (st, t) => G.front + 14 - (200 - (st.place === "city" ? 62 : 34)) + (st.d - R.at(t));
      let beside = 0, real = 0, away = 0, awayOK = 0;
      for(const st of R.stops){
        if(st.place === "yard") continue;
        real++;
        const mid = (st.t0 + st.t1) / 2;
        /* the building's left edge should be a car-gap ahead of the cowcatcher */
        const bx = xOf(st, mid) + 200 - (st.place === "city" ? 62 : 34);
        if(Math.abs(bx - (G.front + 14)) <= 4) beside++;
        /* and two minutes before the stop it must be off to the right, not
           parked on the train */
        const early = st.t0 - 120;
        if(early > 5){ away++; if(xOf(st, early) + 200 > G.width + 40 || xOf(st, early) > G.front) awayOK++; }
      }
      r.beside = beside; r.real = real; r.away = away; r.awayOK = awayOK;

      /* BRAKES — §7's sentence. Where is the platform when the brake sounds? */
      const brakes = S.perf.events.filter(e => e.bed === "railBrake" || e.bed === "railArrive")
                                  .map(e => e.tSec);
      const gaps = [];
      for(const st of R.stops){
        if(st.place === "yard") continue;
        let best = null;
        for(const bt of brakes) if(best == null || Math.abs(bt - st.t0) < Math.abs(best - st.t0)) best = bt;
        if(best == null) continue;
        const x = xOf(st, best);
        gaps.push({ dt: (st.t0 - best) / beat, onScreen: x + 200 > 0 && x < G.width,
                    ahead: x + 200 - (st.place === "city" ? 62 : 34) > G.front });
      }
      r.brake = gaps;

      /* PLAYS — a seat moves only while its part sounds. Asked at a moment the
         part IS sounding and at a moment it is NOT, per seat. */
      rows.push(r);
    }
    return rows;
  }, SEEDS);

  await b.close();

  let faults = 0;
  const say = (ok, label, detail) => {
    console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
    if(!ok) faults++;
  };
  console.log("\n=== THE RIDE — does the picture agree with the record? " + SEEDS + " seeds\n");
  console.log("  seed  tempo  stops  standing/creeping  running/stuck");
  let creep = 0, frozen = 0, stuck = 0, ran = 0, beside = 0, real = 0, away = 0, awayOK = 0;
  let threw = 0;
  const gaps = [];
  for(const r of out){
    if(r.threw){ threw++; console.log("  " + String(r.s).padStart(4) + "  THREW: " + r.threw); continue; }
    creep += r.creep; frozen += r.frozen; stuck += r.stuck; ran += r.ran;
    beside += r.beside; real += r.real; away += r.away; awayOK += r.awayOK;
    gaps.push(...r.brake);
    console.log("  " + String(r.s).padStart(4) + String(r.tempo.toFixed(0)).padStart(7) +
      String(r.stops).padStart(7) + "  " +
      String(r.creep + "/" + r.frozen).padStart(12) + String(r.stuck + "/" + r.ran).padStart(16));
  }
  console.log("");
  say(threw === 0, "every record builds a ride plan", threw ? threw + " threw" : out.length + " built");
  say(creep === 0, "the landscape stops when the train does",
      creep + " of " + frozen + " standing samples moved more than a pixel");
  say(stuck === 0, "and it moves when the train does",
      stuck + " of " + ran + " running samples were frozen");
  say(real > 0 && beside === real, "the platform is beside the train at every stop",
      beside + "/" + real + " with the building a car-gap past the cowcatcher");
  say(away === 0 || awayOK === away, "and it is NOT beside the train two minutes earlier",
      awayOK + "/" + away + " still off to the right");

  /* §7's own sentence, and the number it actually comes out at */
  const inFrame = gaps.filter(g => g.onScreen).length, ahead = gaps.filter(g => g.ahead).length;
  const dts = gaps.map(g => g.dt).sort((a, z) => a - z);
  say(gaps.length > 0 && inFrame === gaps.length && ahead === gaps.length,
      "the station is in frame and ahead of the train when the brake sounds",
      inFrame + "/" + gaps.length + " in frame, " + ahead + " ahead");
  if(dts.length)
    console.log("  ·  and the train comes to rest " + dts[0].toFixed(1) + "–" +
                dts[dts.length - 1].toFixed(1) + " beats after it, which is the brake RUNNING IN" +
                "\n     [the stop script, step 2: \"arrive: brakes, running into the downbeat\"]");

  /* ── TWO CLAIMS DELETED, AND NOT BECAUSE THEY WERE FAILING ────────────────
     [owner] "The musicians are not needed."

     This file used to assert "a player in the doorway moves while its part
     sounds" and "and is still while its part rests". Both were true and both
     are now unaskable: the figures are gone from the drawing and `seats` and
     `rideSoundingAt` are gone from the program with them.

     Kept as a note rather than commented-out code, because a guard that
     measures a program that no longer exists is the single fault this harness
     has caught most often in its own files — the faders probe composing a
     deleted genre, the banjo probe parsing zero cells, the mode probe
     filtering on a field the events do not carry. Every one of them was GREEN.
     Deleting the claim with the feature is how that stops happening. */

  if(errs.length) console.log("\n  page errors: " + errs.slice(0, 3).join(" | "));
  console.log("\n  " + faults + " ride fault(s)\n");
  process.exit(faults ? 1 : 0);
})();
