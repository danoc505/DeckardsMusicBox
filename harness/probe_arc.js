/* DOES THE SONG BUILD. The arc claims a shape: a low opening, one or two
   lesser highs, a dip, and the main peak about two thirds through. That is a
   claim about numbers, so it is checkable.

   Per genre, over N seeds, this prints:
     - where the apex actually falls, as a fraction of the record
     - the arc's own value at the open, at the apex, and at the end
     - NOTES PER BAR in the first eighth of the song against the eighth around
       the apex -- the thing the arc is supposed to be doing to the material
     - the loudest bar, to check it is the apex and not the last bar

   The last one is the point. Before this existed the loudest moment of every
   song was wherever the final chorus landed, which is not a shape.

     node harness/probe_arc.js [nSeeds]
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 40;

console.log(`\n=== the arc, ${N} seeds per genre ===\n`);
console.log("  genre        apex at   arc open/apex/end    ev/bar open -> apex   loudest bar at");
for(const g of M.genres()){
  let apexAt = 0, aOpen = 0, aApex = 0, aEnd = 0, dOpen = 0, dApex = 0, loud = 0, n = 0;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    const arc = song.form.arc;
    if(!arc) continue;
    const nB = arc.length;
    const apex = song.form.apexBar;
    apexAt += apex / Math.max(1, nB - 1);
    aOpen += arc[0]; aApex += arc[Math.min(nB - 1, apex)]; aEnd += arc[nB - 1];

    /* events per bar in the first eighth against the eighth around the apex --
       the material the arc is letting through, not the volume it is at */
    const spb = song.motion.spb, barSec = 16 * spb;
    const w = Math.max(1, Math.round(nB / 8));
    const inWin = (a, b) => song.perf.events.filter(e =>
      e.role !== "tape" && e.tSec >= a * barSec && e.tSec < b * barSec).length;
    dOpen += inWin(0, w) / w;
    dApex += inWin(Math.max(0, apex - w / 2), Math.min(nB, apex + w / 2)) / w;

    /* which bar carries the most energy -- sum of gain, which is what the person playing it
       hears as "the big bit" */
    const per = new Array(nB).fill(0);
    for(const e of song.perf.events){
      if(e.role === "tape") continue;
      const b = Math.min(nB - 1, Math.floor(e.tSec / barSec));
      per[b] += e.gain;
    }
    loud += per.indexOf(Math.max(...per)) / Math.max(1, nB - 1);
    n++;
  }
  if(!n){ console.log(`  ${g.padEnd(12)} (no arc)`); continue; }
  const f = x => (x / n).toFixed(2);
  console.log(`  ${g.padEnd(12)} ${f(apexAt).padStart(6)}    ` +
    `${f(aOpen)} / ${f(aApex)} / ${f(aEnd)}      ` +
    `${(dOpen / n).toFixed(1).padStart(5)} -> ${(dApex / n).toFixed(1).padEnd(6)}` +
    `      ${f(loud)}`);
}

/* ── AND THE NOTES THEMSELVES ───────────────────────────────────────────────
   Asked directly, and it was a fair question: the measurements above are
   numbers about music, and numbers about music are not music. This prints the
   actual bass line of one song, bar by bar, so the build can be READ rather
   than inferred from a column of averages. `.` is a rest, `o` a note, `>` an
   accented note, `/` a slide into one. */
const SEED = parseInt(process.argv[3], 10) || 1;
const GEN = process.argv[4] || "boxcarsynth";
const song = M.composeSong(SEED, "draw", GEN);
const spb = song.motion.spb, barSec = 16 * spb, nB = song.form.arc.length;
console.log(`\n=== ${GEN}, seed ${SEED} — the bass, bar by bar ===`);
console.log(`    ${song.form.nBars} bars · apex at bar ${song.form.apexBar} of ${nB}\n`);
const rows = [];
for(let b = 0; b < nB; b++){
  const cells = new Array(16).fill(".");
  for(const e of song.perf.events){
    if(e.role !== "bass") continue;
    const bb = Math.floor(e.tSec / barSec);
    if(bb !== b) continue;
    const st = Math.round((e.tSec - bb * barSec) / spb);
    if(st >= 0 && st < 16) cells[st] = e.slide != null ? "/" : e.accent ? ">" : "o";
  }
  const arcV = song.form.arc[b];
  const bars = "#".repeat(Math.round(arcV * 20));
  rows.push(`  ${String(b).padStart(3)} |${cells.join("")}|  ${arcV.toFixed(2)} ${bars}` +
            (b === song.form.apexBar ? "  <-- APEX" : ""));
}
console.log(rows.join("\n"));
