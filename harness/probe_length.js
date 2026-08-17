#!/usr/bin/env node
/* PROBE_LENGTH — DOES A LONGER RECORD CONTAIN MORE MUSIC, OR JUST MORE PLAYING?

     node harness/probe_length.js [genre ...] [--seeds N]
     node harness/probe_length.js --all [--seeds N]

   WHY THIS EXISTS, and it is the guard this repo most obviously lacked.

   [owner, 2026-08-16: "The issue is STALE repetition! The problem is the same
   exact notes played for 20 mins is NOT music"; then, correctly, "I think the
   problem is fundamental to the architecture of the program, something deep
   inside is limiting what we can and can not do."]

   MEASURED, boxcar synth, before anything was done about it — distinct bars of
   note content per role against bars actually played:

       180s     36 played    20 distinct    x1.8
       360s     70 played    36 distinct    x1.9
       600s    124 played    39 distinct    x3.2
       900s    200 played    38 distinct    x5.3
      1200s    270 played    43 distinct    x6.2

   Playing time grows SEVEN AND A HALF TIMES; composed content is flat from six
   minutes and even falls (39 -> 38). A twenty-minute record held the same
   written music as a six-minute one.

   THE CAUSE was one line, `makePerformance`:

       const loopBar = (bar - sec.startBar) % materials.bars;

   There is no note-generating call in that stage at all — it replays frozen
   arrays — and `makeMaterials` returned a literal of five names while never
   being told how long the record was.

   WHY NO EXISTING PROBE COULD SEE IT. Every other probe in this harness
   measures ONE record and asks whether it is any good: probe_repetition counts
   what comes back, probe_theory counts wrong notes, probe_arc counts the build.
   All of them are right, and all of them are blind here, because the defect is
   not visible in any single record — a 3-minute boxcar record at x1.8 is
   perfectly healthy. It only appears as a RELATIONSHIP BETWEEN records of
   different lengths, and nothing was comparing those. That is the general
   lesson: a probe that samples one length cannot find a ceiling.

   WHAT THIS ASSERTS. Not a repetition figure — a SLOPE. Distinct composed bars
   must grow as the record grows. A genre may legitimately be repetitive (dungeon
   synth is, on purpose); what no genre may be is CAPPED, because a cap means
   the twentieth minute is the sixth minute again.

   The reference is each genre against ITSELF at two lengths, never against
   another genre, so a genre whose whole identity is a held cell is judged on
   whether it can fill a long record rather than on whether it is busy. */

const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const argv = process.argv.slice(2);
let N = 4;
const si = argv.indexOf("--seeds");
if(si >= 0){ N = parseInt(argv[si + 1], 10) || 4; argv.splice(si, 2); }
const GENRES = argv.includes("--all") ? M.genres()
             : (argv.filter(a => !a.startsWith("--")).length
                 ? argv.filter(a => !a.startsWith("--"))
                 : ["boxcarsynth"]);

/* the pitched parts that carry the loop. Drums are excluded from the headline
   for the same reason probe_repetition excludes them -- a kit repeating is not
   this complaint -- and drone/scene/weather hold one event for minutes. */
const ROLES = ["ostinato", "keys", "bass", "lead", "counter", "keys2"];
const LENGTHS = [180, 360, 600, 900, 1200];

/* one record -> per role { distinct, played } */
function read(song){
  const spb = (60 / song.chart.tempo) / 4;
  const barSec = 16 * spb, nBars = song.form.nBars;
  const cells = {};
  for(const e of song.perf.events){
    if(e.pitch == null || ROLES.indexOf(e.role) < 0) continue;
    const b = Math.floor(e.tSec / barSec);
    if(b < 0 || b >= nBars) continue;
    const step = Math.round((e.tSec - b * barSec) / spb);
    (cells[e.role + "|" + b] || (cells[e.role + "|" + b] = [])).push(step + ":" + e.pitch);
  }
  const per = {};
  for(const k of Object.keys(cells)){
    const r = k.slice(0, k.indexOf("|"));
    (per[r] || (per[r] = { set: new Set(), played: 0 }));
    per[r].set.add(cells[k].sort().join(","));
    per[r].played++;
  }
  return per;
}

const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
let fails = 0, checks = 0;
const ok = (pass, label, detail) => {
  checks++; if(!pass) fails++;
  console.log("  " + (pass ? "✓" : "✗ FAIL") + " " + label + "  (" + detail + ")");
};

for(const g of GENRES){
  console.log("\n=== " + g + " — " + N + " seeds a length ===");
  const table = {};                            /* length -> role -> {d, p} */
  for(const sec of LENGTHS){
    const runs = [];
    for(let s = 1; s <= N; s++)
      runs.push(read(M.composeSong(s, "draw", g, null, null, null, null, null, sec)));
    table[sec] = {};
    for(const r of ROLES)
      table[sec][r] = {
        d: mean(runs.map(o => o[r] ? o[r].set.size : 0)),
        p: mean(runs.map(o => o[r] ? o[r].played : 0)),
      };
  }

  console.log("  length   " + ROLES.map(r => r.padEnd(15)).join(""));
  for(const sec of LENGTHS)
    console.log("  " + (sec + "s").padStart(6) + "   " + ROLES.map(r => {
      const c = table[sec][r];
      if(!c.p) return "-".padEnd(15);
      return (c.d.toFixed(0) + "/" + c.p.toFixed(0) + " x" + (c.p / Math.max(1, c.d)).toFixed(1)).padEnd(15);
    }).join(""));

  /* THE ASSERTION: the slope, per role, between the shortest and longest
     record. A role that plays six times the bars and composes no more of them
     is capped, and capped is the defect. `1.5x` rather than `6x` deliberately:
     this is a floor under "grows at all", not a target -- a genre is allowed to
     repeat, it is not allowed to run out.

     ── AND IT BINDS ONLY WHERE THE FIX HAS LANDED, ON PURPOSE ────────────────
     The cap is the ENGINE's, not boxcar synth's: every genre in the file is
     built by the same frozen-material replay, and the first run of this probe
     measured dungeon synth's ostinato at 23 distinct bars for a 3-minute record
     and 31 for a 20-minute one -- x6.8 the playing, x1.3 the music. So a probe
     that asserted on all eleven would go red eleven times over for a defect
     nobody has been given the chance to fix yet, and a battery that is red by
     design is a battery people learn to ignore.

     So the assertion binds on any genre that declares `materialTakes`, and the
     rest are PRINTED with their slope and named as not-yet-fixed. That makes
     the guard self-extending: the moment a genre is given takes it comes under
     the assertion automatically, and nobody has to remember to add it here. */
  const SHORT = LENGTHS[0], LONG = LENGTHS[LENGTHS.length - 1];
  const TABLE = M.composeSong(1, "draw", g).chart.table;
  const BOUND = !!(TABLE.materialTakes && Object.keys(TABLE.materialTakes).length);
  const flat = [];
  for(const r of ROLES){
    const a = table[SHORT][r], b = table[LONG][r];
    if(!a.p || !b.p || a.d < 4) continue;              /* absent or too thin to judge */
    if(b.p / Math.max(1, a.p) < 2) continue;           /* the part did not get longer */
    const grew = b.d / Math.max(1, a.d);
    const detail = "played x" + (b.p / a.p).toFixed(1) + " over the range, distinct x"
      + grew.toFixed(1) + "  (" + a.d.toFixed(0) + " bars at " + SHORT + "s -> "
      + b.d.toFixed(0) + " at " + LONG + "s)";
    if(BOUND) ok(grew >= 1.5, g + "." + r + " composes more music for a longer record", detail);
    else if(grew < 1.5) flat.push("    · " + r + "  " + detail);
  }
  if(!BOUND){
    console.log("  (no `materialTakes` declared — not asserted, see the note in this file)");
    if(flat.length){
      console.log("  CAPPED, and it is the engine's cap rather than this genre's:");
      for(const l of flat) console.log(l);
    }
  }
}

console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
process.exit(fails ? 1 : 0);
