#!/usr/bin/env node
/* PROBE_MOTIF — DOES THE LOOP REPEAT THREE TIMES AND THEN EVOLVE?
 *
 *     node harness/probe_motif.js [seeds] [file.html]
 *
 *   ── THE COMPLAINT ────────────────────────────────────────────────────────
 *   [owner] "We need LOOPS that repeat three times and then evolve this is the
 *   basis of ALL MUSIC! We need a motif! ... its all just random notes NOT
 *   MUSIC!"
 *
 *   ── AND THE REPO HAD ALREADY WRITTEN THE ANSWER DOWN, TWICE ─────────────
 *   `docs/LOOP_TO_SONG.md` §6, from ten practitioner transcripts:
 *
 *     "Once = intriguing, but not yet memorable. Twice = reinforced; the person
 *      playing it can now sing it back. THREE TIMES = the brain begins to tune
 *      it out. So on the third pass you must do one of two things: go somewhere
 *      different, or START THE SAME, THEN DIVERGE partway through."
 *
 *   and §1, the headline finding of that whole research pass:
 *
 *     "A song is not made by generating different material for each section. It
 *      is made by taking ONE loop, spreading it across the whole timeline, and
 *      then SUBTRACTING. ... The engine has been doing the opposite."
 *
 *   Nothing implemented either. `probe_rule_of_three.js` has the right name and
 *   measures AUTOMATION KNOBS — it reports 0.0 lanes for every section function
 *   of this genre and passes anyway, because a knob that does not move is not
 *   what that file calls a fault. A guard on the notes has never existed.
 *
 *   ── THE THREE CLAIMS ────────────────────────────────────────────────────
 *     LOOP       the loop is short enough to hold in a head. `boxcar-the-
 *                missing-hook.md` §1 measured one statement at 27.1 SECONDS —
 *                three times longer than any other genre in the file — and
 *                named it the reason the record has no hook.
 *     THREE      hearings 1 and 2 of a loop are identical, and hearing 3 shares
 *                its opening and then departs. Both halves are the claim: a
 *                third statement that is wholly new has not "started the same",
 *                and one that is identical has not diverged.
 *     HOLD       and something in the record is heard often enough to be worth
 *                remembering, measured as the most-repeated 4-note figure's
 *                share of the line, against the reference numbers §4 of the
 *                same sheet already published for the other genres.
 */
const fs = require("fs");
const path = require("path");

const SEEDS = parseInt(process.argv[2], 10) || 12;
const HTML = path.resolve(process.argv[3] || path.join(__dirname, "..", "Boxcar Synth.html"));
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

let faults = 0;
const say = (ok, label, detail) => {
  console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};

console.log("\n=== THE LOOP, THE THIRD TIME — " + SEEDS + " seeds\n");

const g0 = M.genres()[0];
let loopSec = 0, recs = 0, thirds = 0, same = 0, diverged = 0, missing = 0;
let figShare = 0, figN = 0, devs = {};
const rows = [];

for(let s = 1; s <= SEEDS; s++){
  let song; try { song = M.composeSong(s, undefined, g0); } catch(e){ console.log("  seed " + s + " THREW: " + e.message); faults++; continue; }
  const T = song.chart.table;
  const bars = song.materials.bars;
  const spb = 60 / song.chart.tempo;
  const beats = (T.metre && T.metre.beats) || 4;
  const sec = bars * beats * spb;
  loopSec += sec; recs++;

  /* ── THREE: hearing 1 == hearing 2, and hearing 3 starts the same then
     departs. Asked of the composed material rather than of the render,
     because the render's octave doublings and arc thinning would make two
     identical statements print differently for reasons that are not the
     tune. `materials.third` is what stage 5 selects on the third hearing. */
  const third = song.materials.third || {};
  for(const k of Object.keys(third)){
    const [mat, role] = k.split("|");
    const base = (song.materials[mat] || {})[role];
    const alt = third[k];
    if(!base || !alt) continue;
    thirds++;
    devs[song.materials.thirdDev[k]] = (devs[song.materials.thirdDev[k]] || 0) + 1;
    const half = Math.floor(bars / 2);
    const sig = ns => ns.slice().sort((a, z) => (a.bar - z.bar) || (a.step - z.step) || (a.pitch - z.pitch))
                        .map(n => n.bar + ":" + n.step + ":" + n.pitch).join("|");
    const headB = sig(base.filter(n => n.bar < half)), headA = sig(alt.filter(n => n.bar < half));
    const tailB = sig(base.filter(n => n.bar >= half)), tailA = sig(alt.filter(n => n.bar >= half));
    if(headB !== headA) missing++;                 // it did not start the same
    else if(tailB === tailA) same++;               // it did not diverge
    else diverged++;
  }

  /* ── HOLD ── */
  const ev = song.perf.events.filter(e => e.role === "lead" && e.pitch != null)
                             .sort((a, z) => a.tSec - z.tSec);
  const fig = {};
  for(let i = 0; i + 4 <= ev.length; i++){
    const k2 = ev.slice(i, i + 4).map(x => x.pitch).join(",");
    fig[k2] = (fig[k2] || 0) + 1;
  }
  const vals = Object.values(fig).sort((a, z) => z - a);
  const share = ev.length > 4 ? 100 * (vals[0] || 0) / (ev.length - 3) : 0;
  figShare += share; figN++;
  rows.push([s, song.chart.tempo, bars, sec, Object.keys(fig).length, share]);
}

console.log("  seed  bpm  loop bars  one statement  distinct 4-note figures  top figure");
for(const r of rows)
  console.log("  " + String(r[0]).padStart(4) + String(r[1].toFixed(0)).padStart(5) +
              String(r[2]).padStart(11) + String(r[3].toFixed(1) + "s").padStart(15) +
              String(r[4]).padStart(25) + String(r[5].toFixed(1) + "%").padStart(12));
console.log("");

/* A HOOK IS A THING YOU CAN HOLD IN YOUR HEAD — "a bar or two, a few seconds"
   [boxcar-the-missing-hook.md §1, which measured 27.1 s and called it the
   cause]. The other genres in that table ran 8.7-15.1 s. */
const mean = loopSec / Math.max(1, recs);
say(mean <= 16, "one statement of the loop is short enough to hold in a head",
    mean.toFixed(1) + "s mean, against 8.7-15.1s for the genres §1 compared and 27.1s before this");

say(thirds > 0, "the record composes a third statement at all",
    thirds + " built across " + recs + " records");
/* ── AND THESE TWO CARRY `thirds > 0` BECAUSE 0/0 IS NOT A PASS ────────────
   Watched failing with the declaration removed, both of these printed
   "✓ 0/0" and only the claim above went red. A check whose population is empty
   is not satisfied, it is unasked — and this file's own history is three
   guards that were green because they were measuring nothing: the faders probe
   composing a deleted genre, the banjo probe parsing zero cells, the mode probe
   filtering on a field the events do not have. */
say(thirds > 0 && missing === 0, "and it STARTS THE SAME as the first two hearings",
    !thirds ? "NO THIRD STATEMENTS AT ALL — nothing to ask"
            : missing ? missing + "/" + thirds + " changed their opening — that is not a divergence, it is a new tune"
                      : (thirds - missing) + "/" + thirds + " keep the opening exactly");
say(thirds > 0 && same === 0, "and then DIVERGES",
    !thirds ? "NO THIRD STATEMENTS AT ALL — nothing to ask"
            : same ? same + "/" + thirds + " are identical to the loop — nothing evolved"
                   : diverged + "/" + thirds + " depart at the halfway bar");
console.log("     devices used: " + Object.keys(devs).sort((a, z) => devs[z] - devs[a])
                                          .map(d => d + " " + devs[d]).join(", "));

/* ── AND THIS ONE IS REPORTED, NOT ASSERTED ─────────────────────────────────
   The reference is dungeon synth at 12.2%, from a table this repo published
   when five genres existed. Four of them have since been deleted, so there is
   no live population to set a threshold against and a number chosen from one
   surviving genre would be this file's own reflection. It prints, it moves,
   and it is the number to watch. */
const fs2 = figShare / Math.max(1, figN);
console.log("\n  ·  the most-repeated 4-note figure is " + fs2.toFixed(1) + "% of the line" +
            "\n     [reference, boxcar-the-missing-hook.md §4: dungeon synth 12.2%, lofi 7.2%," +
            "\n      synthwave 6.4%, vgm 5.3%, and boxcar 5.1% when that sheet was written]");

console.log("\n  " + faults + " motif fault(s)\n");
process.exit(faults ? 1 : 0);
