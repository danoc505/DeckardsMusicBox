#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   DOES AN EDGE IN THE PLAN SURVIVE THE BUS GRID?

       node harness/probe_busedge.js

   WHY IT EXISTS. `rideBus` samples the motion plan on a grid and joins the
   points with linear ramps. That is right for the section steps and slow LFOs
   it was built for, and wrong for the kinds that are DEFINED by a
   discontinuity: `snap` (a mute -- "at bar B it jumps, holds, and jumps back,
   with no ramp at either edge, because the edge IS the gesture") and `throw`
   (a send that spikes and decays).

   TWO FAULTS, FOUND IN THAT ORDER, both now fixed:
     1. the grid smoothed the step. jungle's cut took 312 ms and began 285 ms
        BEFORE the bar line; the other 415 ms, 379 ms early.
     2. the grid MISSED the step. A beat is four times coarser than the plan,
        and a throw at `at: 0.8` or `0.875` lives entirely between two beat
        points -- rendered as nothing at all, on three lanes across three
        genres. And the size threshold that decided "is this a step" read the
        fader-law factor instead of the lane's depth, so it sat at a flat 0.35
        against declared throws of 0.10-0.34: 1 of 38 hard steps written on
        the busiest genre, and 0 of 6 / 0 of 40 / 0 of 42 elsewhere.

   SO IT ASKS EVERY LANE, NOT TWO. Every genre, every lane that carries an
   edge-marked movement, every step in it: how much of the planned excursion
   actually reaches the parameter, and how long the transition takes. Nothing
   here names a genre or a key.

   AND IT CALLS THE REAL SCHEDULER. The first version reimplemented rideBus's
   body line for line, which meant it could only ever confirm that its own copy
   agreed with itself -- and it went stale the day the threshold changed.
   `MK2.rideBus` is exported for this.

   TWO SETUP TRAPS, RECORDED BECAUSE BOTH WERE FALLEN INTO:

     - THE BASE. A crossing sitting at its control's MINIMUM clamps the whole
       excursion away and the probe reports "no edge" on a program that plainly
       has one; a crossing sitting at its MAXIMUM does the same to an upward
       throw, which is how a rewrite of this file reported three genres as
       having no edges at all. The base is put a quarter of the travel inside
       each end, so there is room to move either way.

     - WHAT COUNTS AS A STEP. `motionAt` quantises to the sixteenth, so EVERY
       kind on the lane -- an LFO included -- changes in steps of a sixteenth.
       Counting those as edges reported 4094 "steps" on one lane and a 554 ms
       rise, which is the LFO's own stair being timed. The planned jump is
       measured from a copy of the lane carrying ONLY the edge-marked
       movements; the rendered jump is measured on the real curve.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
/* MK2_HTML points this at another copy of the program, which is how the
   before/after in the header was measured against the same probe rather than
   against a memory of one. */
const HTML = process.env.MK2_HTML ||
             require("path").resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const SEED = 11;
let tot = 0, hit = 0, worstEarly = 0, worstRise = 0, dead = [];

for(const g of M.genres()){
  const song = M.composeSong(SEED, undefined, g), plan = song.motion;
  const spb = plan.spb, beat = spb * 4, bar = spb * 16;
  /* WHICH LANES -- asked of the plan, so a new edge kind or a new genre needs
     no edit here */
  const keys = Object.keys(plan.lanes)
    .filter(k => plan.lanes[k].some(mv => mv && mv.edge));
  if(!keys.length) continue;
  const lines = [];
  for(const key of keys){
    const c = M.CONTROL[key];
    /* a quarter of the travel inside each end -- see the setup traps above */
    const base = c ? Math.max(c.min + (c.max - c.min) * 0.25,
                     Math.min(c.max - (c.max - c.min) * 0.25, c.def)) : 1;

    /* the same lane with ONLY the movements that are defined by an edge */
    const ePlan = Object.assign({}, plan, { lanes: Object.assign({}, plan.lanes,
      { [key]: plan.lanes[key].filter(mv => mv && mv.edge) }) });
    const eAt = t => M.motionAt(ePlan, key, { tSec: t }, 0);
    /* the edge-only lane says WHERE a step is; the whole lane, clamped exactly
       as rideBus clamps it, says HOW FAR it is allowed to go. Measuring the
       reach against the raw declared amount instead reported 25% on a `snap`
       whose `to` of -1 can only take a base of 0.25 down to the control's
       floor -- the plan asking for more than the control has, which is the
       control working, not the scheduler failing. */
    const val = t => { const x = base + M.motionAt(plan, key, { tSec: t }, 0);
                       return c ? Math.max(c.min, Math.min(c.max, x)) : x; };

    /* record what the real rideBus schedules */
    const ev = [];
    const param = { value: 0, cancelScheduledValues(){},
      setValueAtTime(v, t){ ev.push({ k: "set", v, t }); },
      linearRampToValueAtTime(v, t){ ev.push({ k: "ramp", v, t }); } };
    M.rideBus(plan, param, key, base, 0);
    ev.sort((a, b) => a.t - b.t);
    /* the curve WebAudio produces from those events */
    const curve = t => { let pv = ev[0].v, pt = ev[0].t;
      for(let i = 0; i < ev.length; i++){ const e = ev[i];
        if(e.t <= t){ pv = e.v; pt = e.t; continue; }
        if(e.k === "set") return pv;
        return pv + (e.v - pv) * ((t - pt) / (e.t - pt)); }
      return pv; };

    /* EVERY jump the edge kinds make, on the plan's own grid */
    const steps = [];
    for(let s = 1; s * spb < plan.seconds; s++){
      const t = s * spb, d = eAt(t) - eAt(t - spb);
      if(Math.abs(d) > 1e-6 && Math.abs(val(t) - val(t - spb)) > 1e-9) steps.push({ t });
    }
    if(!steps.length) continue;
    let got = 0, early = 0, rise = 0, none = 0;
    for(const st of steps){
      const span = Math.abs(val(st.t) - val(st.t - spb));
      /* how much of it arrives AS A JUMP, either side of the step line. Three
         milliseconds, not one: the scheduler this replaced located its edges by
         bisection to a tolerance of 1 ms, so a window of 1 ms scored its
         successes as failures and made the before/after look better than it
         was. Three is still two orders of magnitude inside a sixteenth. */
      const before = curve(st.t - 0.003), after = curve(st.t + 0.003);
      const reach = Math.abs(after - before) / span;
      /* HALF the planned jump, arriving as a jump, is the bar. Counting
         "reach > 2%" instead said 631 of 1227 steps arrived on a build whose
         per-lane average reach was 0-5%: a scheduler delivering a twentieth of
         a mute scored as delivering it. */
      if(reach < 0.5) none++;
      got += Math.min(1.5, reach);
      /* HOW EARLY it starts: the last moment in the sixteenth BEFORE the line
         at which the parameter still holds its pre-step value. A ramped step
         leaves that value at the start of the interval; a held one leaves it
         at the line. Measured this way rather than as "when did it first cross
         5%" because on a lane that also carries an LFO the 5% of a small throw
         is crossed by the LFO's own drift, and the probe times the LFO.
         HOW LONG it takes: from there to within 5% of the arrival value. */
      let t5 = st.t, t95 = null;
      for(let k = 0; k <= 1200; k++){
        const tt = st.t - spb + (k / 1200) * spb;
        if(Math.abs(curve(tt) - before) <= 0.02 * span) t5 = tt;
      }
      for(let k = 0; k <= 1200; k++){
        const tt = t5 + (k / 1200) * (2 * spb);
        if(Math.abs(curve(tt) - after) <= 0.05 * span){ t95 = tt; break; }
      }
      early = Math.max(early, st.t - t5);
      if(t95 !== null) rise = Math.max(rise, Math.max(0, t95 - t5));
    }
    tot += steps.length; hit += steps.length - none;
    worstEarly = Math.max(worstEarly, early); worstRise = Math.max(worstRise, rise);
    if(none) dead.push(g + " " + key + "  " + none + "/" + steps.length);
    lines.push("    " + key.padEnd(22) + String(steps.length).padStart(4) + " steps  " +
      "reached " + (100 * got / steps.length).toFixed(0).padStart(3) + "%   " +
      "rise " + (rise * 1000).toFixed(0).padStart(4) + " ms   " +
      "early " + (early * 1000).toFixed(0).padStart(4) + " ms" +
      (none ? "   <<< " + none + " NEVER ARRIVE" : ""));
  }
  console.log("\n" + g + "   " + Math.round(song.chart.tempo) + " bpm, beat " +
              (beat * 1000).toFixed(0) + " ms, sixteenth " + (spb * 1000).toFixed(0) + " ms");
  for(const l of lines) console.log(l);
}

console.log("\n  " + hit + " of " + tot + " planned steps reach the parameter" +
            (hit === tot ? "" : "   <<< " + (tot - hit) + " ERASED"));
console.log("  worst rise " + (worstRise * 1000).toFixed(0) + " ms, worst early start " +
            (worstEarly * 1000).toFixed(0) + " ms");
for(const d of dead) console.log("    erased: " + d);
