#!/usr/bin/env node
/* WHAT SHAPE IS A SONG, PER GENRE?
     node harness/probe_form.js [seeds]

   Prints every section sequence for N seeds x 7 genres as one word per song,
   then three findings per run:

     distinct shapes    does the genre own an architecture, or do the dice?
                        (2026-08-02 baseline: 24-25 of 25 DISTINCT in every
                        genre -- no genre ever repeats a shape. The walk is a
                        Markov chain; position is unsayable in its language,
                        so ordering was 100% seed. probe_pull's `sections`
                        pull of 0.06-0.11 is this fact as a variance ratio.)

     after-peak wander  songs that keep going after their own flagged peak.
                        (Was 13/175, mean 63 wandering bars, worst 160 -- five
                        minutes of verses after the climax. Two causes, both
                        fixed 2026-08-02: no law steered a past-target walk
                        toward the payoff (H5 now does, by zeroing weights),
                        and the 10-section guard was ending records mid-
                        sentence -- 605/2100 songs were being cut short of
                        their genre's own declared length. NOW 0/175; if this
                        reads nonzero again, one of those two regressed.)

     cross-genre twins  identical whole-song shapes across two genres.
                        (Baseline: acid<->jungle share NINE of ~23 -- jungle's
                        form table is a near copy of acid's, so same seed,
                        same stream, same walk. Jungle's real architecture
                        has never been researched; see HANDOFF-MK2 §5.4.)

   A genre that declares `form.plan` should move all three: shapes collapse
   into a family (not to ONE -- principle 4, the seed still varies the shape),
   wander goes to whatever the plan INTENDS after the peak, and twins with
   other genres disappear. Hold the output to the plan, not to a number. */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src + ";global.__G = GENRE;");
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 25;
const GENRES = Object.keys(global.__G);

/* one letter per function so a whole song reads as a word */
const TOK = { intro: "I", verse: "V", prechorus: "p", chorus: "C", postchorus: "c",
              bridge: "B", instrumental: "N", outro: "O" };

const shapes = {};
let wander = 0, wanderBars = 0, total = 0, worst = null;
for(const g of GENRES){
  shapes[g] = [];
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "band", g);
    const f = song.form; total++;
    const word = f.map(sec => (TOK[sec.fn] || "?") + (sec.peak ? "^" : "")).join(" ");
    shapes[g].push({ word, n: f.length, bars: f.nBars });
    const peakI = f.findIndex(x => x.peak);
    if(peakI >= 0){
      const tail = f.slice(peakI + 1).filter(x => x.fn !== "postchorus" && x.fn !== "outro");
      if(tail.length){
        wander++;
        const tb = tail.reduce((a, x) => a + (x.endBar - x.startBar), 0);
        wanderBars += tb;
        if(!worst || tb > worst.tb) worst = { g, s, tb };
      }
    }
  }
}

for(const g of GENRES){
  console.log("\n== " + g + " ==");
  const count = {};
  for(const r of shapes[g]) count[r.word] = (count[r.word] || 0) + 1;
  const uniq = Object.entries(count).sort((a, b) => b[1] - a[1]);
  for(const [w, n] of uniq){
    const eg = shapes[g].find(r => r.word === w);
    console.log("  " + String(n).padStart(2) + "x  " + w + "   (" + eg.n + " sections, " + eg.bars + " bars)");
  }
  const secs = shapes[g].map(r => r.n);
  console.log("  distinct shapes: " + uniq.length + "/" + N +
              " · sections min " + Math.min(...secs) + " max " + Math.max(...secs));
}

console.log("\n== after-peak wander (sections after the flagged peak that are neither postchorus nor outro) ==");
console.log("  " + wander + "/" + total + " songs wander after their own peak" +
            (wander ? " · mean " + (wanderBars / wander).toFixed(1) + " bars · worst " +
                      worst.tb + " bars (" + worst.g + " seed " + worst.s + ")" : ""));

console.log("\n== cross-genre identity (same whole-song word, any seed, peak mark stripped) ==");
const strip = w => w.replace(/\^/g, "");
for(const a of GENRES){
  const setA = new Set(shapes[a].map(r => strip(r.word)));
  const twins = [];
  for(const b of GENRES){
    if(b === a) continue;
    const setB = new Set(shapes[b].map(r => strip(r.word)));
    const both = [...setA].filter(w => setB.has(w));
    if(both.length) twins.push(b + ":" + both.length);
  }
  console.log("  " + a.padEnd(12) + (twins.length ? twins.join("  ") : "no twins"));
}
