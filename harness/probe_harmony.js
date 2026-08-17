/* WHAT HARMONIC VOCABULARY DOES THIS PROGRAM ACTUALLY HAVE.

   Before proposing that anything be added, measure what is there. The claim
   under test is the project's own design theory -- "music theory as a physics
   engine": HARD constraints reject, SOFT tendencies weight, and the seed
   explores the space that leaves. A physics engine is judged by the size and
   shape of the space it permits, so:

     1. HOW MANY distinct progressions can each genre actually produce, against
        how many its table could in principle produce
     2. ROOT MOTION -- the interval between consecutive chord roots. Descending
        fifths are the strongest tonal motion in common practice; a program that
        never makes them is not using the circle of fifths, whatever its tables
        say. Reported as a histogram.
     3. CHROMATICISM -- any chord whose root is not in the key. Secondary
        dominants, borrowed chords, chromatic mediants: the moves that make
        harmony feel like it is GOING somewhere rather than circling.
     4. MODULATION -- does the key ever change inside a song
     5. VOICE LEADING -- mean semitone distance between consecutive chord
        voicings. Parsimonious motion (1-2 semitones) is what makes a
        progression sound composed rather than transposed.

     node harness/probe_harmony.js [nSeeds]
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 120;

const IVL = { 0: "same", 1: "up m2", 2: "up M2", 3: "up m3", 4: "up M3", 5: "up 4th (down 5th)",
              6: "tritone", 7: "up 5th (down 4th)", 8: "down M3", 9: "down m3",
              10: "down M2", 11: "down m2" };

console.log(`\n=== the harmonic space, ${N} seeds per genre ===\n`);
console.log("  genre        distinct progs   distinct chord sets   modulates   chromatic roots   mean VL (semitones)");
const rootMotion = {};
for(const g of M.genres()){
  const progs = new Set(), sets = new Set();
  let mod = 0, songs = 0, chrom = 0, chords = 0, vlSum = 0, vlN = 0;
  const rm = {};
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    songs++;
    /* the progression as scale degrees, and the SET of degrees used */
    /* the chords live on MATERIALS, not on the chart -- the first version of
       this read song.chart.progression, which does not exist, and dutifully
       reported "0 distinct progressions" for every genre. A measurement that
       reads a field that is not there measures the field name. */
    const cs = song.materials.chords || [];
    const deg = cs.map(c => c.degree);
    if(deg.length){ progs.add(deg.join("-")); sets.add([...new Set(deg)].sort().join(",")); }

    /* root motion, read off whatever the materials actually used */
    const roots = cs.map(c => c.rootMidi).filter(x => x != null);
    for(let i = 1; i < roots.length; i++){
      const d = ((roots[i] - roots[i - 1]) % 12 + 12) % 12;
      rm[d] = (rm[d] || 0) + 1;
    }
    /* chromatic roots: a chord root outside the song's scale */
    const MODES = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10],
                    phrygian:[0,1,3,5,7,8,10], lydian:[0,2,4,6,7,9,11], mixolydian:[0,2,4,5,7,9,10],
                    aeolian:[0,2,3,5,7,8,10], locrian:[0,1,3,5,6,8,10] };
    const scale = MODES[song.chart.mode] || MODES.minor;
    for(const r of roots){
      chords++;
      if(!scale.includes(((r - song.chart.root) % 12 + 12) % 12)) chrom++;
    }
    /* does the key move inside the song -- bridge included */
    /* the bridge is the only sanctioned departure -- does it actually leave?
       Compare the SET of degrees, since a bridge on the same degrees is the
       same harmony in a different order. */
    const bs = (song.materials.bridgeChords || []).map(c => c.degree);
    const a1 = [...new Set(deg)].sort().join(","), b1 = [...new Set(bs)].sort().join(",");
    if(bs.length && a1 !== b1) mod++;

    /* voice leading between consecutive keys strikes */
    const keys = (song.perf.events || []).filter(e => e.role === "keys" && e.pitch != null);
    const byT = {};
    for(const e of keys) (byT[e.tSec.toFixed(4)] || (byT[e.tSec.toFixed(4)] = [])).push(e.pitch);
    const times = Object.keys(byT).sort((a, b) => a - b);
    for(let i = 1; i < Math.min(times.length, 40); i++){
      const a = byT[times[i - 1]].slice().sort((x, y) => x - y);
      const b = byT[times[i]].slice().sort((x, y) => x - y);
      if(a.length !== b.length) continue;
      let d = 0;
      for(let k = 0; k < a.length; k++) d += Math.abs(a[k] - b[k]);
      if(a.join() !== b.join()){ vlSum += d / a.length; vlN++; }
    }
  }
  rootMotion[g] = rm;
  console.log(`  ${g.padEnd(12)} ${String(progs.size).padStart(9)}      ${String(sets.size).padStart(9)}       ` +
              `${(100 * mod / songs).toFixed(0).padStart(5)}%   ${(100 * chrom / Math.max(1, chords)).toFixed(1).padStart(9)}%   ` +
              `${vlN ? (vlSum / vlN).toFixed(2) : "-"}`);
}

console.log("\n=== ROOT MOTION — which intervals the harmony actually walks ===");
console.log("  (descending fifth = 'up 4th' here; it is the strongest tonal move there is)\n");
for(const g in rootMotion){
  const rm = rootMotion[g], tot = Object.values(rm).reduce((a, b) => a + b, 0);
  if(!tot) { console.log(`  ${g.padEnd(12)} (no chord roots read)`); continue; }
  const top = Object.keys(rm).sort((a, b) => rm[b] - rm[a]).slice(0, 5)
    .map(k => `${IVL[k]} ${(100 * rm[k] / tot).toFixed(0)}%`).join(" · ");
  console.log(`  ${g.padEnd(12)} ${top}`);
}
