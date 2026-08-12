#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE RACK — does the panel name a box you can actually hear?

       node harness/probe_rack.js [songs]

   Asked, in as many words: "Why in the hell would you put names we dont have
   that's idiotic isnt it?"  There is no answer. A rack that names a machine
   the record never plays is the oldest defect this file has a standing rule
   about -- the dropdown moves and the sound does not -- and it had survived in
   a new form, because a LADDERED lane has no single machine at all. It is
   re-scored section by section, which is the entire point of a ladder, so the
   stage-1 pick was never going to be the truth about it.

   Two attempts to make the PICK truer both failed, and the numbers are why
   this probe exists rather than another attempt:

     the pool's draw                 named a machine outside the genre's set
     an even draw from the rungs     named a rung 25 of 25 records never reached
     the ladder's bottom rung        named a voice 27 of 40 records never sound

   So the panel stopped asking the pick and started asking the PERFORMANCE.
   This checks that it is telling the truth, for every genre and every pitched
   lane, and it is deliberately blunt about the three outcomes:

     HEARD    the lane has notes and the panel names a box that played them
     SILENT   the lane has no notes at all -- there is nothing to name, and
              naming the pick is the only thing left to do
     WRONG    the lane has notes and the panel names something else entirely

   WRONG must be zero. SILENT is a different finding and is reported apart, so
   a lane that is composed and never sounds cannot hide inside a rack figure.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const songs = parseInt(process.argv[2], 10) || 40;
const LANES = ["keys", "lead", "keys2"];

let heard = 0, silent = 0, wrong = 0;
const wrongBy = {}, silentBy = {};

for(const genre of M.genres()){
  for(let seed = 1; seed <= songs; seed++){
    const song = M.composeSong(seed, null, genre);
    for(const lane of LANES){
      const shown = M.machineIn(song.chart, lane, song.perf);
      if(!shown || shown === "auto" || shown === "none" || !M.INSTRUMENTS[shown]) continue;
      const voices = {};
      for(const e of song.perf.events)
        if(e.role === lane && e.pitch != null && e.voice) voices[e.voice] = true;
      const names = Object.keys(voices);
      if(!names.length){
        silent++;
        silentBy[`${genre} ${lane}`] = (silentBy[`${genre} ${lane}`] || 0) + 1;
        continue;
      }
      /* the box the panel names -- does ANY of its lanes carry a voice that
         actually sounded on this lane? Asked through the machine's own table
         rather than by name, because a box and its voice do not have to share
         a name and several here do not. */
      const L = M.INSTRUMENTS[shown].lanes || {};
      const mine = Object.keys(L).map(k => L[k]);
      if(mine.some(v => voices[v])) heard++;
      else {
        wrong++;
        const k = `${genre} ${lane}: panel says ${shown}, heard ${names.join("/")}`;
        wrongBy[k] = (wrongBy[k] || 0) + 1;
      }
    }
  }
}

const total = heard + silent + wrong;
console.log(`\n  ${M.genres().length} genres x ${songs} songs x ${LANES.length} pitched lanes`);
console.log(`  ${total} racks drew a panel\n`);
console.log(`    HEARD   the panel names a box that played this lane   ${String(heard).padStart(5)}  ${(100*heard/total).toFixed(1)}%`);
console.log(`    SILENT  the lane has no notes at all                  ${String(silent).padStart(5)}  ${(100*silent/total).toFixed(1)}%`);
console.log(`    WRONG   the panel names a box never heard here        ${String(wrong).padStart(5)}  ${(100*wrong/total).toFixed(1)}%\n`);

if(wrong){
  console.log("  the rack is lying about:");
  for(const k of Object.keys(wrongBy).sort((a, b) => wrongBy[b] - wrongBy[a]).slice(0, 12))
    console.log(`    ${String(wrongBy[k]).padStart(4)}  ${k}`);
  console.log("");
  process.exitCode = 1;
} else {
  console.log("  every panel names a box that is heard on its lane.\n");
}

if(silent){
  /* NOT a rack fault, and reported anyway: a lane that is composed and never
     sounds is a finding of its own, and folding it into the figure above would
     be the same hiding this probe exists to stop. */
  console.log("  lanes composed and never sounding (a separate defect, not the rack's):");
  for(const k of Object.keys(silentBy).sort((a, b) => silentBy[b] - silentBy[a]).slice(0, 10))
    console.log(`    ${String(silentBy[k]).padStart(4)} / ${songs}  ${k}`);
  console.log("");
}
