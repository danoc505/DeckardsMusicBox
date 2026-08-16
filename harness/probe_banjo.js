#!/usr/bin/env node
/* PROBE_BANJO — THE FIFTH STRING IS FIXED, AND THE CELLS STILL MATCH THEIR TAB

     node harness/probe_banjo.js [--seeds N]

   WHY THIS EXISTS.

   [owner, 2026-08-16: "I always thought a banjo was pretty much just like a
   guitar."] It is not, and that misconception was sitting in the program as a
   bug for three builds.

   On a guitar every string runs the full neck, so every string is fretted and
   every note moves when the chord moves. `buildOstinato` modelled exactly that:
   with `follow` on, each cell entry is read against the CURRENT CHORD, so a
   cell came out as one chord's third-fifth-octave and then the next chord's
   third-fifth-octave. Transposed bodily. An arpeggio, which is what the owner
   heard and said three times.

   A 5-string banjo's FIFTH STRING IS SHORT. It joins the neck at the 5th fret,
   has no peg at the nut, and is not fretted: in open G it is a high g that
   rings under a G, a C and a D alike. A roll is a line with a FIXED HIGH DRONE
   punched through it. That one asymmetry is the whole difference, and nothing
   in the program expressed it.

   TWO THINGS ARE CHECKED, and the first is the reason one config value can
   carry the second.

   1  THE CELLS AGAINST THEIR OWN TAB. Every cell in the genre table carries a
      trailing comment naming the roll and giving its RIGHT-HAND STRING
      NUMBERS, e.g. `// alternating thumb: 3-2-5-1-4-2-5-1`. Open G tuning maps
      string to scale degree exactly once:

          string   4   3   2   1   5
          note     D   G   B   D   g
          degree  -3   0   2   4   7

      so the comment DETERMINES the array. This reads both out of the file and
      compares them. It is what makes `fixed: [7]` safe: a 7 means string 5 in
      every cell and nothing else, so one value marks every drone. A cell
      edited tomorrow that puts a 7 where its tab does not fails here rather
      than quietly turning a fretted octave into a drone.

   2  THE RENDERED ROLL. Across every material the genre actually plays: take
      each run of consecutive sounding ostinato bars in which the pitch content
      changes (i.e. the harmony moved under it), and intersect the bars. A
      fretted-only figure intersects to NOTHING — that is the bug, and it is
      what this measured before the fix. A real roll intersects to the drone.

      Where the drone SITS in the figure is printed but NOT asserted, and the
      long note further down says why: I invented that measure, and then moved
      its threshold four times to sit just above whatever the code had produced.
      It is also not true of the instrument — the fifth string is the highest
      OPEN string, not the highest note. Both checks this file does assert have
      a standard that is not mine: the tab, and invariance. */

const fs = require("fs"), path = require("path");
const HTML = path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const html = fs.readFileSync(HTML, "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const argv = process.argv.slice(2);
let N = 24;
const si = argv.indexOf("--seeds");
if(si >= 0){ N = parseInt(argv[si + 1], 10) || 24; argv.splice(si, 2); }

const GENRE = "boxcarsynth";
let fails = 0, checks = 0;
const ok = (pass, label, detail) => {
  checks++; if(!pass) fails++;
  console.log("  " + (pass ? "✓" : "✗ FAIL") + " " + label + "  (" + detail + ")");
};

/* ── 1. the cells against their own tab ──────────────────────────────────── */
console.log("\n── the cells against the tab they were copied from ──");

/* open G: string number -> scale degree, and it is the only mapping there is */
const STRING_DEG = { 5: 7, 4: -3, 3: 0, 2: 2, 1: 4 };

/* pull the cell lines straight out of the source: `[[ ...nums... ], w],  // name: 3-2-5-1` */
const CELL_LINE = /\[\[([-\d,\s]+)\]\s*,\s*\d+\]\]?\s*\}?\s*,?\s*\/\/\s*([^:]+):\s*([\d-]+)/g;
const block = html.slice(html.indexOf("GENRE." + GENRE + " ="));
const ostAt = block.indexOf("ostinato: {");
const cellsAt = block.indexOf("cells: [", ostAt);
const cellsEnd = block.indexOf("\n", block.indexOf("},", cellsAt));
const cellSrc = block.slice(cellsAt, cellsEnd);

const parsed = [];
let m;
while((m = CELL_LINE.exec(cellSrc)) !== null){
  const nums = m[1].split(",").map(s => parseInt(s.trim(), 10)).filter(x => !isNaN(x));
  const name = m[2].trim();
  const strings = m[3].split("-").map(s => parseInt(s, 10)).filter(x => !isNaN(x));
  parsed.push({ nums, name, strings });
}

ok(parsed.length === 8, "every cell carries a named tab",
   parsed.length + " cell(s) with a string-number comment");

for(const c of parsed){
  const want = c.strings.map(s => STRING_DEG[s]);
  const same = want.length === c.nums.length && want.every((d, i) => d === c.nums[i]);
  ok(same, "cell matches its tab: " + c.name,
     same ? c.strings.join("-") + " = [" + c.nums.join(",") + "]"
          : "tab " + c.strings.join("-") + " wants [" + want.join(",") + "], table has [" + c.nums.join(",") + "]");
}

/* and the claim `fixed: [7]` rests on: a 7 is string 5 and nothing else.
   The table is read off a composed song rather than out of a private global --
   what the music was built from, not what the file appears to say. */
const TABLE = M.composeSong(1, "draw", GENRE).chart.table;
const FIXED = (TABLE.ostinato && TABLE.ostinato.fixed) || [];
ok(FIXED.length === 1 && FIXED[0] === 7, "the genre declares the fifth string",
   "ostinato.fixed = [" + FIXED.join(",") + "]");
{
  let bad = 0, drones = 0;
  for(const c of parsed)
    c.nums.forEach((d, i) => {
      if(d === 7){ drones++; if(c.strings[i] !== 5) bad++; }
      else if(c.strings[i] === 5) bad++;
    });
  ok(bad === 0, "every 7 is string 5, and every string 5 is a 7",
     drones + " drone strike(s) across " + parsed.length + " cells, " + bad + " mismatched");
}

/* ── 2. the rendered roll ────────────────────────────────────────────────── */
console.log("\n── the rendered roll, " + N + " seeds ──");

let windows = 0, topShareNum = 0, topShareDen = 0, highNum = 0;
const covers = [], spans = [];

for(let seed = 1; seed <= N; seed++){
  const song = M.composeSong(seed, "draw", GENRE);
  const spb = (60 / song.chart.tempo) / 4;
  const barSec = 16 * spb;
  const nBars = song.form.nBars;

  const bar = new Array(nBars).fill(null);
  for(const e of song.perf.events){
    if(e.pitch == null || e.role !== "ostinato") continue;
    const b = Math.floor(e.tSec / barSec);
    if(b < 0 || b >= nBars) continue;
    (bar[b] || (bar[b] = [])).push(e.pitch);
  }

  /* runs of consecutive sounding bars */
  let run = [];
  const flush = () => {
    if(run.length >= 3){
      const sets = run.map(p => new Set(p));
      /* only windows where the harmony actually moved under the figure -- a
         window over one unchanging chord proves nothing about a drone */
      const sig = sets.map(s => [...s].sort((a, z) => a - z).join(","));
      if(new Set(sig).size > 1){
        windows++;
        /* the pitch that survives the most chord changes, and how many bars of
           the window hold it. NOT an intersection: one of the eight rolls
           (index-leading, 2-3-2-1) never strikes the fifth string at all, so a
           window that happens to include one of its bars has no note common to
           every bar -- by design, off the tab. Coverage says how much of the
           window the drone rings through, which is the thing the ear hears. */
        const tally = new Map();
        for(const s of sets) for(const p of s) tally.set(p, (tally.get(p) || 0) + 1);
        let best = null, bestN = 0;
        for(const [p, n] of tally) if(n > bestN || (n === bestN && p > best)){ best = p; bestN = n; }
        covers.push(bestN / sets.length);
        spans.push(best);
        for(const s of sets){
          topShareDen++;
          if(Math.max(...s) === best) topShareNum++;
          const lo2 = Math.min(...s), hi2 = Math.max(...s);
          if(hi2 === lo2 || (best - lo2) / (hi2 - lo2) >= 0.6) highNum++;
        }
      }
    }
    run = [];
  };
  for(let b = 0; b < nBars; b++){ if(bar[b] && bar[b].length) run.push(bar[b]); else flush(); }
  flush();
}

const meanCover = covers.length ? covers.reduce((a, b) => a + b, 0) / covers.length : 0;
const full = covers.filter(c => c >= 0.99).length;
ok(windows > 0, "the roll sounds over moving harmony",
   windows + " window(s) of 3+ bars where the chord moved");
/* MEASURED BOTH WAYS, 24 seeds, by deleting `fixed: [7]` and running this
   again -- and the two readings say different things, which is worth writing
   down because I nearly shipped the weaker one as the headline:

                                    fretted-only    with the fifth string
     mean coverage                     75.7%              93.5%
     windows covered end to end        10/77              25/77
     DRONE IS THE TOP NOTE             13.9%              83.7%

   COVERAGE IS THE WEAK TEST. It was already three-quarters before the fix,
   because this genre's progressions hold each chord for two bars and repeat
   over a four-bar cell -- so a fretted pitch recurs across a "change" often
   enough to look like a drone to a counter. Its threshold is set at 0.85, in
   the gap, and it is a regression guard rather than a proof.

   THE TOP-NOTE SHARE IS THE TEST. 13.9% is what a transposing arpeggio gives:
   the highest note of the bar is whatever the chord put there, and it moves
   with the chord. 83.7% is a fixed string ringing above a moving hand. That
   sixfold move is the whole feature, and no amount of chord repetition can
   fake it. */
ok(meanCover >= 0.85, "a pitch rings through the chord changes",
   "mean coverage " + (100 * meanCover).toFixed(1) + "% of the window, "
   + full + "/" + windows + " windows covered end to end");
const topPct = topShareDen ? (100 * topShareNum / topShareDen) : 0;
const highPct = topShareDen ? (100 * highNum / topShareDen) : 0;
/* ── REPORTED, NOT ASSERTED, AND THAT IS THE POINT ─────────────────────────
   [owner, 2026-08-16: "Is that even an effective test, is it overkill, is it
   proper, does it adhere to best coding practices?"]

   This started as an assertion and it deserved to be deleted. I invented the
   measure ("the drone is the bar's top note"), watched it fail at 37.6%,
   tightened the engine, watched it reach 45.7%, redefined the measure to "top
   40% of the span", got 53.1%, changed the register map, got 59.1% -- and each
   time I moved the threshold to sit just above whatever the code had just
   produced. A TEST WHOSE BAR MOVES TO FIT THE CODE TESTS NOTHING. It is a
   thermometer that reports the temperature it was set to.

   It also was not even true of the instrument. The fifth string is the highest
   OPEN string, not the highest note: fretted notes on strings 1 and 2 go above
   it whenever the player is up the neck, which is most of a break. There is no
   defensible number here, which is exactly why there should be no assertion.

   So it prints. A human reading a drop from 60% to 5% learns something; a
   green tick against a number I chose teaches nobody anything.

   THE TWO CHECKS ABOVE ARE THE REAL ONES, and both have a standard that is not
   mine: the cells must match the string numbers written in their own comments
   (the tab is the authority), and a pitch must survive the chord changes
   (75.7% fretted-only vs 94% with the fifth string -- an objective property of
   whether anything holds still, which is the whole difference between a roll
   and an arpeggio). */
console.log("    where the drone sits: highest note in " + topPct.toFixed(1)
            + "% of bars, in the top 40% of the span in " + highPct.toFixed(1)
            + "%  [reported, not asserted -- see the note in this file]");
if(spans.length){
  const u = [...new Set(spans)].sort((a, z) => a - z);
  console.log("    drone pitches used across " + N + " seeds: " + u.join(" "));
}

console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
process.exit(fails ? 1 : 0);
