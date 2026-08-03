/* DOES THE THIRD TIME SOUND DIFFERENT.

   Stage 2 emits a `vary` demand on the third statement of a function, and until
   now only the MATERIAL could answer it -- by rewriting notes. For music whose
   changes are meant to be timbral that is the wrong instrument, and the sources
   agree: "filter sweeps, delay throws and reverb sends replacing chord changes
   and new melodic ideas -- this is how a four-bar loop stays interesting for
   eight minutes."

   So `occurrence` moves were added. This checks they do something, and it does
   NOT check by reading the table:

     1. find every section function stated three or more times
     2. for each statement, read every automated lane at the same offset INTO
        the section -- so the comparison is like for like, first bar against
        first bar
     3. report how far the knobs have travelled by the third hearing

   A genre whose third statement reads 0.0 has a rule of three that only the
   notes can satisfy.

     node harness/probe_rule_of_three.js [nSeeds]
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 20;

console.log(`\n=== the third statement, against the first (${N} seeds per genre) ===`);
console.log("  a knob that has not moved by the third hearing cannot answer a vary demand\n");
console.log("  genre        fn            DESIGNED (keyed to the hearing)   drift (free LFOs)");
for(const g of M.genres()){
  const agg = {};
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    const plan = song.motion, spb = plan.spb;
    /* group this song's sections by function */
    const byFn = {};
    for(const sec of song.sections) (byFn[sec.fn] || (byFn[sec.fn] = [])).push(sec);
    for(const fn in byFn){
      const list = byFn[fn].sort((a, b) => a.occurrence - b.occurrence);
      if(list.length < 3) continue;
      const first = list[0], third = list[2];
      /* the same offset into each statement: like for like */
      /* ── DESIGNED DIFFERENCE, NOT DRIFT ────────────────────────────────────
         The first version of this reported that every genre's third statement
         differs, with the biggest movers being mellotron.wow, reese.detune and
         tb303.softAtk -- all of which are FREE-RUNNING LFOs. A free LFO is at a
         different phase two minutes later whether or not anyone intended it, so
         that column was measuring drift and calling it variation.

         Drift is not an answer to a vary demand. It is not repeatable, it is
         not keyed to the hearing, and a listener has no way to connect it to
         "this is the third time". So the two are separated: DRIFT is what the
         free-running lanes happen to be doing, DESIGNED is what the lanes keyed
         to the statement are doing on purpose. Only the second column is the
         claim being made. */
      const OFF = [0, 1, 2, 3];
      let moved = 0, sum = 0, bestK = null, best = 0, n = 0;
      let dsgMoved = 0, dsgBest = 0, dsgK = null;
      for(const key in plan.lanes){
        const c = M.CONTROL[key]; if(!c) continue;
        const hasOcc = plan.lanes[key].some(mv => mv.kind === "occurrence");
        let d = 0;
        for(const o of OFF){
          const t1 = (first.startBar + o) * 16 * spb;
          const t3 = (third.startBar + o) * 16 * spb;
          d = Math.max(d, Math.abs(M.motionAt(plan, key, { tSec: t3 }, 0) -
                                   M.motionAt(plan, key, { tSec: t1 }, 0)));
        }
        const pct = 100 * d / Math.max(1e-9, c.max - c.min);
        n++;
        if(pct > 1) moved++;
        sum += pct;
        if(pct > best){ best = pct; bestK = key; }
        if(hasOcc){
          /* the occurrence term alone: step x (occurrence - 1), capped */
          const mv = plan.lanes[key].find(x => x.kind === "occurrence");
          const o1 = mv.step * Math.min((first.occurrence || 1) - 1, mv.cap);
          const o3 = mv.step * Math.min((third.occurrence || 1) - 1, mv.cap);
          const dp = 100 * Math.abs(o3 - o1) / Math.max(1e-9, c.max - c.min);
          if(dp > 1) dsgMoved++;
          if(dp > dsgBest){ dsgBest = dp; dsgK = key; }
        }
      }
      const a = (agg[fn] || (agg[fn] = { moved: 0, mean: 0, best: 0, bestK: "", n: 0,
                                         dsg: 0, dsgBest: 0, dsgK: "" }));
      a.moved += moved; a.mean += n ? sum / n : 0; a.n++;
      a.dsg += dsgMoved;
      if(best > a.best){ a.best = best; a.bestK = bestK; }
      if(dsgBest > a.dsgBest){ a.dsgBest = dsgBest; a.dsgK = dsgK; }
    }
  }
  const fns = Object.keys(agg);
  if(!fns.length){ console.log(`  ${g.padEnd(12)} (no function stated three times)`); continue; }
  for(const fn of fns){
    const a = agg[fn];
    console.log(`  ${g.padEnd(12)} ${fn.padEnd(13)} ` +
                `${(a.dsg / a.n).toFixed(1).padStart(5)} lanes  ` +
                `${(a.dsgK ? a.dsgK + " " + a.dsgBest.toFixed(0) + "%" : "*** NONE").padEnd(22)}  ` +
                `${(a.moved / a.n).toFixed(0).padStart(4)} lanes`);
  }
}
