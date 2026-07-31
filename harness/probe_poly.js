#!/usr/bin/env node
/* DOES THE GRID ACTUALLY DISAGREE WITH ITSELF?
     node harness/probe_poly.js [seeds]

   A genre can declare `kit.poly` and still come out sounding like every other
   four-to-the-floor record, because a table is a claim and the notes are the
   evidence. This reads the notes back and asks the one question that separates
   polymetre from decoration:

     DOES BAR 2 LOOK LIKE BAR 1?

   In a 16-step-per-lane genre it does, exactly -- that is what a bar IS. In a
   genre with sequencers of 7, 5 and 11 steps running against it, it cannot:
   the hat lands on different steps in every bar of the loop, and the four bars
   only agree again when the loop comes round.

   [corpus:notebook.zoeblade.com -- "changing the pattern length for only some
    parts while leaving most at the default bar-long 16 sixteenths"; Autechre's
    Windwind is that page's worked example]
   [corpus:soundonsound -- Sean Booth on cascading sequencers with different
    timings, "results that appear chaotic but follow quantifiable rules"] */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 20;

/* the share of a genre's four-bar drum loop whose bars are NOT all identical.
   Read off the MATERIAL, not the performance -- the arrangement thins and the
   arc gates, and both of those would produce bar-to-bar difference that has
   nothing to do with the metre. */
function barsDiffer(song){
  let lanes = 0, differing = 0;
  for(const m of ["A", "Avar", "B", "C"]){
    const notes = (song.materials[m] || {}).drums;
    if(!notes) continue;
    const byLane = {};
    for(const n of notes) (byLane[n.lane] ||= [[], [], [], []])[n.bar].push(n.step);
    for(const lane in byLane){
      const bars = byLane[lane].map(a => a.slice().sort((x, y) => x - y).join(","));
      const present = bars.filter(b => b.length);
      if(present.length < 2) continue;
      lanes++;
      if(new Set(present).size > 1) differing++;
    }
  }
  return { lanes, differing };
}

const genres = M.genres();
console.log(`does bar 2 look like bar 1? — ${N} seeds a genre\n`);
console.log("  genre          drum lanes   lanes whose bars differ");
for(const g of genres){
  let L = 0, D = 0;
  for(let s = 1; s <= N; s++){ const r = barsDiffer(M.composeSong(s, undefined, g)); L += r.lanes; D += r.differing; }
  const pc = L ? (100 * D / L) : 0;
  console.log(`  ${g.padEnd(13)} ${String(L).padStart(10)}   ${pc.toFixed(1).padStart(6)}%` +
              (pc > 40 ? "   <- polymetric" : ""));
}

/* AND THE SPECIFIC CLAIM: the three declared sequencers really are 7, 5 and 11
   long. Reconstruct each lane's period from the notes by finding the smallest p
   that explains every onset across the whole four-bar material. */
console.log("\n  autechre — the period actually written into each lane:");
const song = M.composeSong(1, undefined, "autechre");
const notes = song.materials.A.drums;
const byLane = {};
for(const n of notes) (byLane[n.lane] ||= new Set()).add(n.bar * 16 + n.step);
for(const lane of Object.keys(byLane).sort()){
  const on = [...byLane[lane]].sort((a, b) => a - b);
  let period = 64;
  for(let p = 2; p <= 32; p++){
    const cls = new Set(on.map(x => x % p));
    /* p explains the lane if every step congruent to a used class is present */
    let ok = true;
    for(let x = 0; x < 64 && ok; x++)
      if(cls.has(x % p) !== on.includes(x)) ok = false;
    if(ok){ period = p; break; }
  }
  console.log(`    ${lane.padEnd(8)} ${on.length} hits   period ${period === 64 ? "(none under 32)" : period}` +
              (period === 16 ? "  = the bar" : period < 16 ? "  <- shorter than the bar" : ""));
}
