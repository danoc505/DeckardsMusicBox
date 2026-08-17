#!/usr/bin/env node
/* PROBE_ARRANGE — TWO OF RIMSKY-KORSAKOV'S RULES, ASKED OF THE NOTES

     node harness/probe_arrange.js [seeds] [file.html]

   `score-craft.md` carries 56 sections and the program cites about eleven of
   them. These are two that were sourced, prescriptive, and entirely unbuilt --
   and both are ARRANGEMENT rules rather than mixing ones, which is the answer
   to "is orchestration more than doubling".

   §8 — THE RE-ENTRY, and he says the wider application himself:

     "After a long rest the re-entry of the horns, trombones and tuba should
      coincide with some characteristic intensity of tone, either PP OR FF;
      piano and forte re-entries are less successful, while re-introducing
      these instruments MEZZO-FORTE OR MEZZO-PIANO produces a colourless and
      common-place effect. THIS REMARK IS CAPABLE OF WIDER APPLICATION. For the
      same reasons it is not good to commence or finish any piece of music
      either mf or mp."

   §7 — THE COLOUR:

     "the harmonic basis should differ from the melody not only in fullness and
      intensity of tone, but ALSO IN COLOUR."

   ASSERTED ONLY WHERE THE GENRE DECLARES THE RULE (`entry`, `colour`), and
   reported everywhere else. A wind consort playing wind harmony is not failing
   §7, it is a different ensemble -- and applying §7 file-wide was tried, moved
   56 dungeon synth records into a monoculture, and was reverted. */
const fs = require("fs");
const path = require("path");
const HTML = process.argv[3] || path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const SEEDS = parseInt(process.argv[2], 10) || 30;
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const ROLES = ["lead", "counter", "keys", "keys2", "bass", "ostinato"];

let faults = 0;
const rows = [];
for(const g of M.genres()){
  let T = null;
  try { T = M.composeSong(1, undefined, g).chart.table; } catch(e){ continue; }
  const E = T && T.entry, wantsColour = !!(T && T.colour);
  const midLo = (E && E.midLow) || 0.30, midHi = (E && E.midHigh) || 0.72;
  const restBars = (E && E.restBars) || 4;
  let re = 0, mid = 0, songs = 0, beginMid = 0, endMid = 0, both = 0, clash = 0;
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    const ev = song.perf.events.filter(e => e.pitch != null).sort((a, z) => a.tSec - z.tSec);
    if(!ev.length) continue;
    songs++;
    const restSec = (60 / song.chart.tempo) * 4 * restBars;
    for(const r of ROLES){
      const rs = ev.filter(e => e.role === r);
      for(let i = 1; i < rs.length; i++){
        if(rs[i].tSec - (rs[i - 1].tSec + rs[i - 1].durSec) < restSec) continue;
        re++;
        if(rs[i].gain > midLo && rs[i].gain < midHi) mid++;
      }
    }
    if(ev[0].gain > midLo && ev[0].gain < midHi) beginMid++;
    const last = ev[ev.length - 1];
    if(last.gain > midLo && last.gain < midHi) endMid++;
    /* §7, asked of the picks */
    const p = song.chart.picks || {};
    const famOf = m => { const X = m && m !== "auto" && M.INSTRUMENTS[m]; return (X && X.family) || null; };
    const a = famOf(p.lead), b = famOf(p.keys);
    if(a && b){ both++; if(a === b) clash++; }
  }
  rows.push({ g, E: !!E, wantsColour, re, mid, songs, beginMid, endMid, both, clash });
  if(E){
    if(mid !== 0) faults++;
    if(beginMid !== 0) faults++;
    if(endMid !== 0) faults++;
  }
  if(wantsColour && clash !== 0) faults++;
}

console.log("\n=== RIMSKY §8, THE RE-ENTRY — " + SEEDS + " seeds a genre\n");
console.log("  genre           declares   re-entries   MEZZO (colourless)   begins mezzo   ends mezzo");
for(const r of rows)
  console.log("  " + r.g.padEnd(15) + (r.E ? "  yes   " : "   -    ") +
              String(r.re).padStart(11) +
              (r.mid + " (" + (r.re ? Math.round(100 * r.mid / r.re) : 0) + "%)").padStart(21) +
              (r.beginMid + "/" + r.songs).padStart(15) + (r.endMid + "/" + r.songs).padStart
              (13) + (r.E ? "" : "   (reported)"));
console.log("\n=== RIMSKY §7, THE COLOUR OF THE HARMONY\n");
console.log("  genre           declares   tune+comp both named   SAME COLOUR");
for(const r of rows)
  console.log("  " + r.g.padEnd(15) + (r.wantsColour ? "  yes   " : "   -    ") +
              String(r.both).padStart(20) + String(r.clash).padStart(14) +
              (r.wantsColour ? "" : "   (reported)"));
console.log("");
for(const r of rows){
  const say = (ok, label, detail) => console.log("  " + (ok ? "✓" : "✗ FAIL:") + " [" + r.g + "] " + label + "  (" + detail + ")");
  if(r.E){
    say(r.mid === 0, "no part comes back from a long rest at mezzo", r.mid + " of " + r.re);
    say(r.beginMid === 0, "no record begins mezzo", r.beginMid + " of " + r.songs);
    say(r.endMid === 0, "no record ends mezzo", r.endMid + " of " + r.songs);
  }
  if(r.wantsColour)
    say(r.clash === 0, "the tune and the chords are never the same colour", r.clash + " of " + r.both);
}
console.log("\n  " + faults + " arrangement fault(s)\n");
process.exit(faults ? 1 : 0);
