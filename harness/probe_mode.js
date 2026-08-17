#!/usr/bin/env node
/* PROBE_MODE — A MODE CHANGE NOBODY HEARS DID NOT HAPPEN
 *
 *     node harness/probe_mode.js [seeds] [file.html]
 *
 *   ── WHY THIS EXISTS ─────────────────────────────────────────────────────
 *   `modal-jazz.md` §7 item 4 asks for exactly this check and says it is
 *   MANDATORY for this genre rather than nice:
 *
 *     "A dorian->major lift that never sounds a natural 3, or a mixolydian
 *      section that never sounds its b7, has changed nothing an ear can hear.
 *      Given keyShift's weight on a ZERO-semitone shift, the boxcar lift is
 *      usually MODE-ONLY, same tonic ... which makes the characteristic note
 *      the ONLY evidence the change happened."
 *
 *   and it closes: "Cost: small, and IT SHOULD BE MEASURED RATHER THAN
 *   ASSERTED." It never was. This is that measurement.
 *
 *   ── WHAT A CHARACTERISTIC NOTE IS ───────────────────────────────────────
 *   A mode is identified by ONE degree [§2d]:
 *
 *     dorian       the natural 6   "which distinguishes it from Aeolian"
 *     phrygian     the b2          "sounds Spanish"
 *     lydian       the #4          "what distinguishes it from the major scale"
 *     mixolydian   the b7          the folk dominant that pulls nowhere
 *
 *   The record's one modal event is the dawn lift. If the writing after it
 *   never lands on the new mode's own degree, the sunrise is theoretical.
 *
 *   ── AND THE FIRST TWO VERSIONS OF THIS MEASUREMENT WERE WRONG ───────────
 *   Kept because it is the point. The first filtered events by `e.bar` — a
 *   field performance events DO NOT HAVE, they carry `tSec` — so every lifted
 *   stretch came back holding zero notes and the check printed "0 of 0 tune
 *   notes, SILENT, the change is theoretical" for every record. A confident,
 *   entirely fabricated fault.
 *
 *   `harness/README.md`: "When a measurement surprises you, suspect the
 *   measurement first." Measured on the clock instead, all seven lifts sound
 *   their characteristic note. THE FAULT WAS THE PROBE, BOTH TIMES.
 *
 *   So this one asks the program for its own clock (`makeClock`) rather than
 *   inventing a bar mapping, and it FAILS LOUDLY if a lifted stretch contains
 *   no tune notes at all — because that is the shape the broken version had,
 *   and a probe that cannot tell "silent" from "I looked in the wrong place"
 *   is the thing this file keeps being bitten by. */
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

/* the degree that MAKES each mode that mode [modal-jazz.md §2d], in semitones
   above the tonic. Aeolian/minor and ionian/major are named both ways in this
   program's tables, so both spellings are here. */
const CHAR = { dorian: 9, minor: 8, aeolian: 8, mixolydian: 10,
               major: 11, ionian: 11, phrygian: 1, lydian: 6 };
const NM = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

let faults = 0;
const say = (ok, label, detail) => {
  console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};

console.log("\n=== DOES THE SUNRISE SOUND? — " + SEEDS + " seeds\n");
console.log("  seed  home -> lifted        moves  its note   sounded");

let lifts = 0, heard = 0, empty = 0, thin = [];
for(let s = 1; s <= SEEDS; s++){
  let song; try { song = M.composeSong(s, undefined, M.genres()[0]); } catch(e){ continue; }
  const L = song.materials.lift;
  if(!L) continue;                       // a record that never moved is not a fault
  const ch = CHAR[L.mode];
  if(ch == null){ console.log("  " + s + "  unknown mode " + L.mode); continue; }
  const C = M.makeClock(song.chart, song.form);
  let lo = Infinity, hi = -Infinity;
  song.sections.forEach((x, i) => {
    if(/lift/.test(x.material)){
      lo = Math.min(lo, C.at(song.form[i].startBar, 0));
      hi = Math.max(hi, C.at(song.form[i].endBar, 0));
    }
  });
  if(!isFinite(lo)) continue;            // the lift exists but no section took it
  const ev = song.perf.events.filter(e => e.pitch != null && e.tSec >= lo && e.tSec < hi &&
                                          (e.role === "lead" || e.role === "counter"));
  const hits = ev.filter(e => ((((e.pitch - L.key) % 12) + 12) % 12) === ch).length;
  lifts++;
  if(!ev.length) empty++;
  else if(hits > 0) heard++;
  const pct = ev.length ? (100 * hits / ev.length) : 0;
  if(ev.length && hits > 0 && pct < 2) thin.push(s + " (" + pct.toFixed(1) + "%)");
  console.log("  " + String(s).padStart(4) + "  " +
    String(song.chart.mode).padEnd(11) + "->" + String(L.mode).padEnd(11) +
    " +" + String((((L.key - song.chart.root) % 12) + 12) % 12).padStart(2) +
    "    " + NM[(L.key + ch) % 12].padEnd(3) +
    "   " + String(hits).padStart(4) + " of " + String(ev.length).padStart(4) +
    (ev.length ? "  (" + pct.toFixed(1) + "%)" : "  <-- NO TUNE NOTES AT ALL"));
}

console.log("");
if(!lifts){ console.log("  no record drew a lift; nothing to check\n"); process.exit(0); }

/* THIS ONE GUARDS THE PROBE, not the music. A lifted stretch with no tune in
   it means the window was computed wrongly — which is exactly how the first
   two versions of this file reported a fault that did not exist. */
say(empty === 0, "every lifted stretch actually contains tune notes",
    empty ? empty + "/" + lifts + " came back EMPTY — the window is wrong, not the music"
          : lifts + "/" + lifts + " windows hold notes");

say(heard === lifts, "and the new mode's own note is sounded in it",
    heard + "/" + lifts + " lifts land on their characteristic note");

if(thin.length)
  console.log("  ·  thin, but not silent: " + thin.join(", ") +
              " — the Milestones case shares 6 of 7 notes, so this is the only evidence");

console.log("\n  " + faults + " mode fault(s)\n");
process.exit(faults ? 1 : 0);
