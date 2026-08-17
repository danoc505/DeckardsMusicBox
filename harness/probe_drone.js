#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE DRONE — does anything move faster than a bar?

       node harness/probe_drone.js [seeds]

   Asked as a diagnosis, not a complaint. It is HALF right, and this probe's
   name overstates what it can see -- kept, with the correction attached, rather
   than renamed, because the measurement is sound and only the claim built on
   top of it was not. See docs/genre-research/how-a-drone-evolves.md:

     "Parameter locking cannot be a long-form evolution mechanism BY
      CONSTRUCTION -- a value stored against step 7 recurs on step 7 of every
      bar, so a mechanism with a period of exactly one bar carries no
      information at the 200-bar timescale."

   WHAT THIS PROBE MEASURES IS WITHIN-BAR DETAIL, and it says so in its own
   column heading. It does not and cannot measure evolution. A genre could score
   10% here and still be identical at bar 4 and bar 200. The four traditions
   that actually sustain ten to twenty minutes over a fixed foundation --
   gamelan, pibroch, alap, ground bass -- do it by DISCRETE COUNTABLE EVENTS,
   and no parameter was automated in Music for Airports at all.

   The diagnosis, verbatim:

     "The issue with drones is you cant figure out how to make something that
      goes on and on while also allowing it to have evolution, i think this is
      done with prameter locking and automitization but you seem to fail in
      implimenting this."

   THE MECHANISM WAS BUILT AND THEN NOT USED WHERE IT MATTERS. The note above
   `motionAt` has defined it since motion existed -- "Elektron's word for the
   first kind below is a PARAMETER LOCK: a knob value stored against a STEP, so
   step 7 has a different filter than step 6 and the difference repeats every
   bar until it stops sounding like a repeat and starts sounding like a part."
   Then dungeon synth and hobbit synth, the two genres in the file actually
   built on a drone, declared ZERO of them while the other eight declared one
   to four each.

   ── WHY COUNTING LANES DOES NOT ANSWER IT ───────────────────────────────────
   Hobbit synth has 121 live motion lanes. By any count of "is it automated"
   it is the second most automated genre in the file. It was still a drone,
   because every one of those lanes moved at the scale of a section or a whole
   record. So this probe does not count lanes. It samples every lane at every
   step of a whole record and splits the travel by TIMESCALE:

     WITHIN A BAR   the plock scale -- what makes this bar sound different
                    from the last one. The thing a repeat needs.
     BAR TO BAR     the LFO scale -- the slow filter nobody can point at.

   Measured before any of this was built:

                     within a bar     lanes flat inside every bar
       lofi              7.6%              17 of 165   (10%)
       progtechno        6.5%              36 of 63
       the densest        4.2%              14 of 77
       dungeon synth     1.1%              68 of 118   (58%)
       hobbit synth      1.1%              69 of 121   (57%)

   THE THRESHOLD IS DELIBERATELY LOW AND IS NOT A TASTE. It does not say a
   genre must be busy -- a genre may want to be still, and dungeon synth
   arguably does. It says that a genre whose knobs are FLAT inside every bar
   has no per-step mechanism at all, which is a different statement from
   choosing not to use one, and the two were indistinguishable until now.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
let src = html.split("<script>")[1].split("</script>")[0];
/* motionAt is stage 6's own reader and is not on window.MK2; a probe that
   re-implemented it would be measuring its own arithmetic rather than the
   program's, which is how probe_reachable first reported nine fake findings. */
src += ";global.__motionAt = motionAt;";
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2, motionAt = global.__motionAt;

const N = parseInt(process.argv[2], 10) || 3;
const rows = [];

for(const genre of M.genres()){
  let wbSum = 0, lanes = 0, flat = 0, plocks = 0, periodSum = 0, periodN = 0, periodFree = 0;
  for(let seed = 1; seed <= N; seed++){
    const song = M.composeSong(seed, null, genre);
    const plan = song.motion, spb = plan.spb, STEPS = plan.steps || 16, nB = plan.nBars;
    for(const key in plan.lanes){
      for(const mv of plan.lanes[key]) if(mv.kind === "plock") plocks++;
      const v = [];
      for(let b = 0; b < nB; b++)
        for(let st = 0; st < STEPS; st++)
          v.push(motionAt(plan, key, { tSec: (b * STEPS + st) * spb }));
      if(v.some(x => !isFinite(x))){
        rows.push({ genre, nan: true });          // a NaN knob, which the metre bug would have caused
        continue;
      }
      const span = Math.max.apply(null, v) - Math.min.apply(null, v);
      if(span < 1e-9) continue;                    // a lane that never moves at all is a different finding
      lanes++;
      /* ── AND DOES IT EVER COME ROUND AGAIN? ────────────────────────────────
         This probe's own header says it cannot measure evolution, and it was
         right: everything above is about the inside of a BAR. A lane can score
         well there and still be identical at bar 4 and bar 200, which is the
         complaint the whole thing started from.

         So: how PERIODIC is the lane? The best normalised autocorrelation over
         every lag from one bar to half the record. A closed-form LFO scores
         near 1 whatever its rate -- it is a sine, it comes round -- and that is
         the point: a 160-bar sine is LONG, not evolving. A sample and hold, a
         deja-vu loop above the notch, or an LFO whose rate is being driven do
         not come round, and score low.

         MEASURED AS A CEILING, not an average, because one strong period is
         enough to make a lane predictable. */
      const perBar = [];
      for(let b = 0; b < nB; b++){
        let a2 = 0;
        for(let st = 0; st < STEPS; st++) a2 += v[b * STEPS + st];
        perBar.push(a2 / STEPS);
      }
      const mean = perBar.reduce((x, y) => x + y, 0) / perBar.length;
      const dev = perBar.map(x => x - mean);
      let e0 = 0; for(const x of dev) e0 += x * x;
      let best = 0;
      if(e0 > 1e-12){
        for(let lag = 1; lag <= Math.floor(nB / 2); lag++){
          let num = 0, ea = 0, eb = 0;
          for(let i = 0; i + lag < dev.length; i++){ num += dev[i] * dev[i + lag]; ea += dev[i] * dev[i]; eb += dev[i + lag] * dev[i + lag]; }
          const r = (ea > 1e-12 && eb > 1e-12) ? num / Math.sqrt(ea * eb) : 0;
          if(r > best) best = r;
        }
      }
      periodSum += best; periodN++;
      if(best < 0.60) periodFree++;         // this lane never comes round
      let wb = 0;
      for(let b = 0; b < nB; b++){
        const bar = v.slice(b * STEPS, (b + 1) * STEPS);
        wb += Math.max.apply(null, bar) - Math.min.apply(null, bar);
      }
      wb /= nB;
      wbSum += wb / span;
      if(wb / span < 0.01) flat++;
    }
  }
  rows.push({ genre, lanes, plocks: plocks / N,
              within: lanes ? 100 * wbSum / lanes : 0,
              flatPct: lanes ? 100 * flat / lanes : 0,
              period: periodN ? 100 * periodSum / periodN : 0,
              free: periodN ? 100 * periodFree / periodN : 0, freeN: Math.round(periodFree / N) });
}

const nan = rows.filter(r => r.nan);
const good = rows.filter(r => !r.nan);
good.sort((a, z) => z.within - a.within);

console.log(`\n  ${M.genres().length} genres x ${N} seeds — how much of a knob's travel happens INSIDE a bar\n`);
console.log("    genre          lanes  plocks   within a bar   flat inside every bar   lanes that never come round");
for(const r of good)
  console.log(`    ${r.genre.padEnd(14)}${String(Math.round(r.lanes / N)).padStart(5)}` +
              `${String(Math.round(r.plocks)).padStart(8)}` +
              `${(r.within.toFixed(1) + "%").padStart(15)}` +
              `${(r.flatPct.toFixed(0) + "%").padStart(24)}` +
              `${(r.freeN + " of " + Math.round(r.lanes / N)).padStart(24)}`);

/* ── WHAT FAILS AND WHAT IS MERELY OPEN ──────────────────────────────────────
   These are two different findings and folding them together would make this
   probe useless in a battery, which is the mistake probe_reachable made once
   with its rare rows and probe_rack avoided with its SILENT column.

     FAILS   a genre DECLARES parameter locks and they do not reach. That is a
             broken mechanism and somebody's edit caused it.
     OPEN    a genre declares none at all. Nothing is broken; the genre has no
             per-step mechanism and never had one. It is a decision nobody has
             taken yet, and a battery that goes red for it would be red for
             weeks and would stop being read.

   A NaN is always a failure -- it means a bar's steps outran the amounts drawn
   for them, which is what the sixteen-step p-lock resolver would have done to
   any genre in 9/8 or 12/8. ─────────────────────────────────────────────── */
const bad = [], open = [];
for(const r of good){
  if(r.plocks < 1)
    open.push(`${r.genre}: not one parameter lock in the whole record — ` +
              `${r.within.toFixed(1)}% inside a bar, ${r.flatPct.toFixed(0)}% of lanes flat in every bar`);
  else if(r.within < 1.5)
    bad.push(`${r.genre}: declares ${Math.round(r.plocks)} plock(s) and still moves only ` +
             `${r.within.toFixed(1)}% inside a bar — they are not reaching`);
}
for(const r of nan) bad.push(`${r.genre}: a motion lane read NaN — a bar's steps outrun the amounts drawn for them`);

console.log("");
if(!bad.length){
  console.log("  every parameter lock a genre declares reaches the knob.\n");
} else {
  for(const b of bad) console.log("    " + b);
  console.log(`\n  ${bad.length} genre(s) whose declared locks do not reach.\n`);
  process.exitCode = 1;
}
if(open.length){
  console.log("  OPEN — genres with no per-step mechanism at all. Not a fault; a decision not taken.\n");
  for(const o of open) console.log("    " + o);
  console.log("");
}
