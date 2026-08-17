#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE LADDER — does every rung actually get played?

       node harness/probe_ladder.js [genre] [songs]

   A genre may declare `ladder: { slot: [smallest, ..., biggest] }` and the
   arrangement picks a rung from the section's ENERGY.  That is only worth
   having if the energy arc REACHES the whole ladder.  If a genre's quietest
   section still sits at 0.6, the bottom two rungs are dead config -- they look
   like options and are not, which is the thing this repo keeps getting caught
   doing.

   So this counts, over N songs, how many sections land on each rung, and says
   plainly which rungs never sound.

   AND it counts LOCKSTEP -- how often two laddered slots change instrument at
   the same section boundary.  Rimsky-Korsakov is explicit that a crescendo
   brings its forces in by FAMILY, strings then winds then brass, which is a
   staggered entry; every slot stepping on the same bar is a volume knob with
   extra steps.  This does not fix that, it measures it.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const genre = process.argv[2] || "dungeonsynth";
const songs = parseInt(process.argv[3], 10) || 60;

const counts = {};      // slot -> rung index -> sections
const ladders = {};
let lowE = 1, highE = 0, sections = 0;

let boundaries = 0, movedAlone = 0, movedTogether = 0, peakArrivals = 0;

for(let seed = 1; seed <= songs; seed++){
  const song = M.composeSong(seed, null, genre);
  const LAD = song.chart.table.ladder;
  if(!LAD){ console.log(`${genre}: declares no ladder.`); process.exit(0); }
  for(const slot in LAD){ ladders[slot] = LAD[slot]; counts[slot] = counts[slot] || {}; }
  let prev = null;
  for(const sec of song.sections){
    sections++;
    const e = sec.energy == null ? 0.5 : sec.energy;
    if(e < lowE) lowE = e; if(e > highE) highE = e;
    const here = {};
    for(const slot in LAD){
      const want = sec.machines && sec.machines[slot];
      here[slot] = want;
      const idx  = ladders[slot].indexOf(want);
      if(idx >= 0) counts[slot][idx] = (counts[slot][idx] || 0) + 1;
    }
    if(prev){
      boundaries++;
      let moved = 0, n = 0;
      for(const slot in LAD){ n++; if(here[slot] !== prev[slot]) moved++; }
      /* the PEAK is allowed to move everything at once -- a tutti at the climax
         is orchestration, not lockstep. Rimsky-Korsakov's stagger is about the
         APPROACH to it. So a peak arrival is counted apart. */
      if(sec.peak) peakArrivals++;
      else if(moved === n && moved > 1) movedTogether++;
      else if(moved > 0) movedAlone++;
    }
    prev = here;
  }
}

console.log(`\n  ${genre} — ${songs} songs, ${sections} sections`);
console.log(`  energy arc reaches ${lowE.toFixed(2)} … ${highE.toFixed(2)}\n`);
let dead = 0;
for(const slot in ladders){
  console.log(`  ${slot}`);
  ladders[slot].forEach((name, i) => {
    const n = counts[slot][i] || 0;
    const pct = (100 * n / sections).toFixed(1);
    if(!n) dead++;
    console.log(`    ${i}  ${name.padEnd(14)} ${String(n).padStart(5)}  ${pct.padStart(5)}%  ${n ? "" : "<-- NEVER PLAYS"}`);
  });
  console.log("");
}
console.log(dead ? `  ${dead} rung(s) never sound. That is dead config, not a choice.\n`
                 : `  every rung sounds.\n`);

const changed = movedAlone + movedTogether;
const still  = boundaries - changed - peakArrivals;
console.log(`  section boundaries: ${boundaries}`);
console.log(`    nothing re-scored          ${String(still).padStart(5)}  ${(100*still/boundaries).toFixed(1)}%`);
console.log(`    arriving at the peak       ${String(peakArrivals).padStart(5)}  ${(100*peakArrivals/boundaries).toFixed(1)}%  (a tutti is allowed here)`);
console.log(`    part of the parts moved    ${String(movedAlone).padStart(5)}  ${(100*movedAlone/boundaries).toFixed(1)}%  <-- staggered`);
console.log(`    EVERY laddered part moved  ${String(movedTogether).padStart(5)}  ${(100*movedTogether/boundaries).toFixed(1)}%  <-- lockstep`);
console.log(changed
  ? `\n  ${(100*movedTogether/changed).toFixed(0)}% of re-scorings away from the peak move EVERY part at once.\n`
  + `  Rimsky-Korsakov brings a crescendo in by family, staggered.\n`
  : "\n  nothing ever re-scores.\n");
