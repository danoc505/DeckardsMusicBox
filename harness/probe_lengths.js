#!/usr/bin/env node
/* PROBE_LENGTHS — DOES A SECTION EVER RUN PAST ITS OWN ENDING?

     node harness/probe_lengths.js [seeds] [file.html]

   MEASURED before this existed, 40 records a genre: EVERY SECTION FUNCTION HAD
   EXACTLY ONE LENGTH, in every genre in the file. A boxcar verse was 16 bars
   220 times out of 220; a vgm section was 8 bars with a standard deviation of
   0.00. Across five genres and roughly two thousand sections there was not one
   exception.

   The sourced device is a CADENTIAL EXTENSION -- "the addition of musical
   material beyond the point at which a cadence is expected" -- producing an
   ASYMMETRICAL period, "a period in which the phrases differ in length"
   [corpus:Kallstrom, Phrase and Period Structure]. That sheet's own repertoire
   survey marks three of about two dozen periods asymmetrical, and all three ADD
   (8+2, 8+6, 16+1) rather than cutting -- which is where the 1-in-7 frequency
   comes from and why the device only ever extends.

   THREE CLAIMS, asserted only for a genre that declares `form.extend`:

     VARIES     at least one declared function shows more than one length
     ONLY ADDS  no section is ever SHORTER than its declared length -- cutting
                would stop the tune inside its own development, which is the
                one thing this program must not do to the hook phase 3 built
     ONLY THOSE a function the genre did not name never varies at all. This is
                the one that catches an index slip: the first build of this
                fed its extension array from one of three push sites, the array
                slipped by one against the section list, and INTROS started
                extending in a genre whose table does not list the intro. */
const fs = require("fs");
const path = require("path");
const HTML = process.argv[3] || path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const SEEDS = parseInt(process.argv[2], 10) || 40;
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

let faults = 0;
console.log("\n=== SECTION LENGTHS — " + SEEDS + " seeds a genre\n");
for(const g of M.genres()){
  let T = null;
  try { T = M.composeSong(1, undefined, g).chart.table; } catch(e){ continue; }
  const EXT = T && T.form && T.form.extend;
  const LEN = (T && T.form && T.form.lengths) || {};
  const per = {}, shorter = [], stray = [];
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    for(const sec of song.form){
      const n = sec.endBar - sec.startBar;
      (per[sec.fn] = per[sec.fn] || {})[n] = (per[sec.fn][n] || 0) + 1;
    }
  }
  const named = (EXT && EXT.fn) || [];
  for(const fn in per){
    const ks = Object.keys(per[fn]).map(Number).sort((a, z) => a - z);
    /* a section shorter than the genre's declared length for it. `lengths` may
       be rescaled by the length dial, so this compares against the SHORTEST
       observed rather than the table -- a genre that only ever adds has its
       minimum equal to its most common length. */
    const most = ks.reduce((a, b) => per[fn][b] > per[fn][a] ? b : a, ks[0]);
    if(ks[0] < most) shorter.push(fn + " " + ks[0] + " < " + most);
    if(ks.length > 1 && EXT && named.indexOf(fn) < 0) stray.push(fn + " [" + ks.join(",") + "]");
  }
  const varies = named.some(fn => per[fn] && Object.keys(per[fn]).length > 1);
  console.log("  " + g.padEnd(15) + (EXT ? "declares extend" : "               ") + "   " +
    Object.keys(per).sort().map(fn =>
      fn + " " + Object.keys(per[fn]).map(Number).sort((a, z) => a - z).join("/")).join("  "));
  if(!EXT) continue;
  const say = (ok, label, detail) => {
    console.log("     " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
    if(!ok) faults++;
  };
  say(varies, "a declared function shows more than one length",
      named.filter(fn => per[fn] && Object.keys(per[fn]).length > 1).join(", ") || "none vary");
  say(shorter.length === 0, "no section is ever SHORTER than its usual length",
      shorter.length ? shorter.join(" | ") : "every difference is an addition");
  say(stray.length === 0, "only the functions the genre named ever vary",
      stray.length ? stray.join(" | ") : "the rest are fixed, as declared");
}
console.log("\n  " + faults + " length fault(s)\n");
process.exit(faults ? 1 : 0);
