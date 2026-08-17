#!/usr/bin/env node
/* DOES THE GRID ACTUALLY DISAGREE WITH ITSELF?
     node harness/probe_poly.js [seeds]

   The genre this was built for quoted Hawtin on the breakdown -- "all you've
   got is this polymeter and because it doesn't line up with the one people on
   the dance floor are going 'oh where was the one again'" -- and until
   `kit.poly` existed the engine could not produce one. Every drum lane was
   written against the bar, so the rimshot and the clap landed on the same
   sixteenth in every bar of the record.

   NOTHING DECLARES `kit.poly` TODAY. The mechanism is still in the engine and
   any genre may ask for it; this probe prints what it finds and says so when
   the answer is nothing, rather than failing on an empty subject.

   This reads the notes back and reconstructs each lane's PERIOD: the smallest
   p that explains every onset across the whole four-bar material. A lane lines
   up with the bar when its period divides 16 (it repeats inside a bar) or is a
   multiple of 16 (a two- or four-bar pattern). It is polymetric only when it is
   neither -- 7, 5, 11, 3.

   The blunter question, "does bar 2 look like bar 1", is also printed, but it
   is not the test: a ghost drawn per bar, a crash on bar 0 and an open hat on
   two bars out of four all make bars differ with no metre involved.

   [corpus:underdog -- Hawtin on the breakdown's polymeter]
   [corpus:notebook.zoeblade.com -- "changing the pattern length for only some
    parts while leaving most at the default bar-long 16 sixteenths"; Autechre's
    Windwind is that page's worked example]
   [corpus:soundonsound -- Sean Booth on cascading sequencers with different
    timings, "results that appear chaotic but follow quantifiable rules"] */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
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
    /* ── THE MATERIAL IS AS LONG AS THE MATERIAL, NOT ALWAYS FOUR BARS ───────
       This allocated exactly four bar-buckets, because a material was four bars
       for every genre. The first genre to declare `materialBars: 8` pushed onto
       `undefined` and the probe died -- reading like a broken probe, which it
       was not. Sized from the notes now. */
    const byLane = {}, nBars = Math.max(...notes.map(n => n.bar)) + 1;
    for(const n of notes)
      (byLane[n.lane] ||= Array.from({ length: nBars }, () => []))[n.bar].push(n.step);
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
              (pc > 40 ? "   <- bars do not repeat" : ""));
}

/* AND THE SPECIFIC CLAIM: the rimshot really runs at 7 and the clap at 5.
   Reconstruct each lane's period from the notes by finding the smallest p that
   explains every onset across the whole four-bar material. */
/* ask the TABLE, not a written-down list — the same rule the rest of the repo
   follows, and the only way this keeps working when a genre takes poly up */
const POLY = M.genres().filter(g => {
  const kit = (M.composeSong(1, undefined, g).chart.table || {}).kit;
  return !!(kit && kit.poly);
});
const SUBJ = POLY[0] || M.genres()[0];
console.log("\n  " + SUBJ + " — the period actually written into each lane:");
if(!POLY.length) console.log("  (no live genre declares kit.poly — the engine can still do it)");
const song = M.composeSong(1, undefined, SUBJ);
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
  /* lines up with the bar if it divides 16 (repeats inside a bar) or is a
     multiple of it (a two- or four-bar pattern). Polymetric only if neither. */
  const lines = period === 64 || 16 % period === 0 || period % 16 === 0;
  console.log(`    ${lane.padEnd(8)} ${String(on.length).padStart(2)} hits   ` +
              `period ${period === 64 ? "(none under 32)" : String(period).padStart(2)}` +
              (lines ? (period === 16 ? "   = the bar" : "") : "   <- never lines up with the bar"));
}
