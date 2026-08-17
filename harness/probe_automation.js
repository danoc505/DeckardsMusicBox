/* WHICH KNOBS ARE ACTUALLY RIDDEN, AND HOW FAR.

   A control can be in one of four states and only one of them is healthy:

     RIDDEN     it is a gesture/bus and some genre moves it
     PARKED     it is a gesture/bus and NO genre moves it -- a knob the program
                could be playing and never touches
     SET        it is a switch or a voicing; not moving it is correct
     OVERDRIVEN it moves so little that the movement is not audible

   The second one is the defect this looks for. "We have all these new knobs, we
   need to make sure we are using them" -- the only honest answer to that is a
   table of which ones are used, by whom, and by how much.

   TRAVEL is the peak-to-peak swing of the lane across a whole song, as a
   percentage of the control's own dial. A lane that moves 0.4% of its dial is
   automated on paper and static in the mix.

     node harness/probe_automation.js [machine]     # default: every machine
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const ONLY = process.argv[2] || null;
const SEEDS = [1, 2, 3, 4, 5];

/* every control the rack declares */
const controls = [];
for(const m in M.INSTRUMENTS)
  for(const c of M.INSTRUMENTS[m].controls)
    controls.push({ m, k: c.k, key: m + "." + c.k, kind: c.kind, min: c.min, max: c.max, cap: c.cap });

/* which genres move it, and how far, sampled bar by bar across real songs */
const found = {};
for(const g of M.genres()){
  for(const s of SEEDS){
    const song = M.composeSong(s, "draw", g);
    const plan = song.motion, nB = plan.nBars;
    for(const key in plan.lanes){
      const c = controls.find(x => x.key === key);
      if(!c) continue;
      let lo = Infinity, hi = -Infinity;
      for(let b = 0; b < nB; b++){
        for(const st of [0, 4, 8, 12]){
          const t = (b * 16 + st) * plan.spb;
          const d = M.motionAt(plan, key, { tSec: t }, 0);
          if(d < lo) lo = d; if(d > hi) hi = d;
        }
      }
      const pct = 100 * (hi - lo) / Math.max(1e-9, c.max - c.min);
      const f = (found[key] || (found[key] = {}));
      f[g] = Math.max(f[g] || 0, pct);
    }
  }
}

const machines = ONLY ? [ONLY] : [...new Set(controls.map(c => c.m))];
let parked = 0, ridden = 0, faint = 0;
for(const m of machines){
  const list = controls.filter(c => c.m === m);
  if(!list.length) continue;
  console.log(`\n=== ${m} ===`);
  console.log("  control          kind      travel   ridden by");
  for(const c of list){
    const f = found[c.key];
    const auto = c.kind === "gesture" || c.kind === "bus";
    if(!f){
      console.log(`  ${c.k.padEnd(15)} ${(c.kind || "?").padEnd(9)} ` +
                  `${"-".padStart(7)}   ${auto ? "*** PARKED — nothing rides it" : "(set per song, correct)"}`);
      if(auto) parked++;
      continue;
    }
    const best = Math.max(...Object.values(f));
    const who = Object.keys(f).sort((a, b) => f[b] - f[a])
                  .map(g => `${g} ${f[g].toFixed(0)}%`).join(", ");
    const weak = best < 3;
    if(weak) faint++; else ridden++;
    console.log(`  ${c.k.padEnd(15)} ${(c.kind || "?").padEnd(9)} ` +
                `${best.toFixed(1).padStart(6)}%   ${who}${weak ? "   <<< barely moves" : ""}`);
  }
}
console.log(`\n  ridden ${ridden} · barely moves ${faint} · PARKED ${parked}`);
