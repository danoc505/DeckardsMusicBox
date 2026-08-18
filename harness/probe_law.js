#!/usr/bin/env node
/* PROBE_LAW — NOTHING REPEATS MORE THAN THREE TIMES WITHOUT A CHANGE
 *
 *     node harness/probe_law.js [seeds] [file.html]
 *     node harness/probe_law.js 1              <- prints the record, part by part
 *
 *   ── THE COMPLAINT ────────────────────────────────────────────────────────
 *   [owner] "The rule of three IS THE LAW! Nothing can repeat more than three
 *   times in a row without some kind of change — there are plenty of options
 *   for change. ... We can not swing from one extreme to the other, there is a
 *   middle ground."
 *
 *   ── AND IT IS A LAW ABOUT THE RECORD, NOT ABOUT THE MATERIAL ────────────
 *   `probe_motif.js` asks whether stage 3 COMPOSED an alternative third
 *   statement. It can be green while the record still repeats: the alternative
 *   exists for `lead` and is selected for `lead`, and every other part on the
 *   stave carries on exactly as it was. A material is four bars in an array; a
 *   repetition is a thing that happens IN TIME, so this measures the rendered
 *   performance and counts statements of the loop as a listener would.
 *
 *   ── QUANTISED TO THE WRITTEN GRID, AND THE FIRST CUT WAS NOT ────────────
 *   Measured raw, this reported ZERO violations on every seed — and was wrong.
 *   Performance events carry groove, swing and per-note humanisation, so two
 *   statements of the identical array print different `tSec` to fourteen
 *   decimal places and no two signatures ever match. A guard that cannot go red
 *   is not a guard. Every event is therefore snapped back to the sixteenth it
 *   was WRITTEN on before the signature is taken, which is the grid the
 *   composer worked in and the resolution a listener hears repetition at.
 *
 *   ── WHAT IS COUNTED, AND WHAT IS NOT ────────────────────────────────────
 *   The BAND is counted: lead, counter, keys, keys2, bass, ostinato, drums.
 *
 *   The RECORDINGS are not — tape, scene, weather, engine, pass, station. A
 *   level crossing is not a motif and a rainstorm does not owe anyone a
 *   variation; those lanes are the world the train is moving through and they
 *   are placed by the trip, not by the form.
 *
 *   And an UNPITCHED DRONE is not counted either, which is the one exemption
 *   that had to be argued rather than assumed. This genre declares
 *   `drone: { unpitched: true }` — "the written note only nudges its playback
 *   rate, because a train is in no key" — and the file already exempts it from
 *   the two counterpoint laws for the same reason ("asking a train whether it
 *   is in the key"). READ THE VOICE AND IT IS STRONGER THAN THAT: `V.trainbox`
 *   NEVER READS `ev.pitch` AT ALL. It once used it to choose between two run
 *   recordings, that line is now a hash of the event's own time, and nothing
 *   else in the function looks at the note. So this probe's signature — a set
 *   of (grid position, pitch) pairs — is hashing a number that reaches no
 *   loudspeaker, and the six "identical" drone statements it reported across 24
 *   seeds are identical only in a field the renderer discards. What actually
 *   sounds differs statement to statement by construction: a different one of
 *   the two run recordings, and the motion curve sampled along the event.
 *
 *   That is a blind spot in the MEASUREMENT, not a fault in the record, so the
 *   lane is skipped and PRINTED as skipped with its reason. A genre whose drone
 *   is a pitched instrument declares nothing and is measured like every other
 *   part. */
const fs = require("fs");
const path = require("path");
const SEEDS = parseInt(process.argv[2], 10) || 24;
const HTML = path.resolve(process.argv[3] || path.join(__dirname, "..", "Boxcar Synth.html"));
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

/* the world, not the band */
const WORLD = { tape:1, scene:1, weather:1, engine:1, pass:1, station:1 };
const NM = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

let bad = 0, parts = 0, skipped = 0, worstEver = 0;
const rows = [];

for(const g0 of M.genres()){
  for(let s = 1; s <= SEEDS; s++){
    let g; try { g = M.composeSong(s, undefined, g0); } catch(e){ continue; }
    const C = M.makeClock(g.chart, g.form), B = g.materials.bars;
    const nStmt = Math.ceil(g.form.nBars / B);
    const T = g.chart.table;
    const DUMB = !!(T.drone && T.drone.unpitched);
    const roles = [...new Set(g.perf.events.map(e => e.role))].filter(r => r && !WORLD[r]);
    const matAt = b => { for(const x of g.sections) if(b >= x.startBar && b < x.endBar) return x.material; return "-"; };

    if(SEEDS === 1)
      console.log("\n══ " + g0 + " SEED " + s + " — " + NM[g.chart.root % 12] + " " + g.chart.mode + " " +
                  g.chart.tempo.toFixed(0) + " bpm · loop " + B + " bars · " + g.form.nBars + " bars\n" +
                  "\n  part        statements  distinct  longest identical run   >3?");

    for(const r of roles){
      const ev = g.perf.events.filter(e => e.role === r);
      if(!ev.length) continue;
      if(r === "drone" && DUMB){ skipped++;
        if(SEEDS === 1) console.log("  " + r.padEnd(11) + "        (skipped — drone.unpitched: V.trainbox never reads ev.pitch)");
        continue; }
      const sig = [];
      for(let k = 0; k < nStmt; k++){
        const t0 = C.at(k * B, 0), t1 = C.at((k + 1) * B, 0), span = (t1 - t0) / (B * 16);
        sig.push(ev.filter(e => e.tSec >= t0 - 1e-6 && e.tSec < t1 - 1e-6)
                   .map(e => Math.round((e.tSec - t0) / span) + ":" +
                             (e.pitch != null ? e.pitch : (e.lane || "x"))).sort().join(","));
      }
      const live = sig.filter(x => x);
      let cur = 1, worst = 1, over = 0, at = 0, wAt = 0;
      for(let i = 1; i <= sig.length; i++){
        if(i < sig.length && sig[i] && sig[i] === sig[i - 1]) cur++;
        else { if(cur > 3){ over++; rows.push([g0, s, r, cur, at * B, matAt(at * B)]); }
               if(cur > worst){ worst = cur; wAt = at; } cur = 1; at = i; }
      }
      parts++;
      if(over) bad++;
      if(worst > worstEver) worstEver = worst;
      if(SEEDS === 1)
        console.log("  " + r.padEnd(11) + String(live.length).padStart(9) + String(new Set(live).size).padStart(10) +
                    String(worst).padStart(19) + " (bar " + String(wAt * B).padStart(3) + ")" +
                    (over ? "   " + String(over).padStart(2) + " ✗" : "    -"));
    }
  }
}

console.log("\n=== THE RULE OF THREE, IN THE RENDERED RECORD — " + SEEDS + " seed(s) a genre\n");
if(rows.length){
  console.log("  genre           seed  part        run  from bar  material");
  for(const r of rows.slice(0, 40))
    console.log("  " + r[0].padEnd(15) + String(r[1]).padStart(4) + "  " + r[2].padEnd(11) +
                String(r[3]).padStart(4) + String(r[4]).padStart(10) + "  " + r[5]);
  if(rows.length > 40) console.log("  ... and " + (rows.length - 40) + " more");
  console.log("");
}
const say = (ok, label, detail) => console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
say(bad === 0, "no part of the band repeats a statement of the loop more than three times running",
    bad + " part(s) over the line across " + parts + " measured, longest run " + worstEver +
    (skipped ? ", " + skipped + " unpitched drone lane(s) skipped" : ""));
console.log("\n  " + (bad ? 1 : 0) + " law fault(s)\n");
process.exit(bad ? 1 : 0);
