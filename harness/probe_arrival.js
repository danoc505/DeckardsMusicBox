/* HOW A DISSONANCE IS ARRIVED AT — the other half of the law this program has.

   `probe_theory.js` measures how a non-chord tone LEAVES: the departure law,
   built 2026-07-30, holds it to a step. Nothing has ever measured how one is
   ARRIVED AT, and the repo's own corpus work says the arrival is the stricter
   of the two: on 382 Bach chorales, soprano against bass, a clash is approached
   by step 96.8% of the time and left by step 91.3%
   [docs/genre-research/counterpoint-measured.md §3].

   The classical taxonomy sorts every figure by its APPROACH, and the split is
   the whole reason this probe has three columns rather than two
   [corpus:musictheory.pugetsound Table 10.1.1]:

     approached by STEP    passing, neighbour, escape tone, anticipation
     approached by REPEAT  suspension, retardation, pedal point
     approached by LEAP    the appoggiatura, and ONLY the appoggiatura --
                           and it is defined by stepping back the OTHER WAY

   So a leap onto a dissonance is not automatically wrong; it is one named
   figure with one obligation -- and the sources DISAGREE about what that
   obligation is, so the leaps are split three ways rather than two:

     [corpus:openmusictheory] the appoggiatura is "approached by leap (usually
       up), and followed by step (usually down, but ALWAYS IN THE OPPOSITE
       DIRECTION of the preceding leap)"
     [corpus:musictheory.pugetsound Appoggiatura] "the leap to and step away
       from any appoggiatura CAN BE FROM ANY DIRECTION", with a Mozart example
       resolving upward after an upward leap

   Both are respectable and they cannot both be the law. The columns therefore
   report the step-out and the direction SEPARATELY, so whoever writes the law
   can see what each reading would cost before choosing one. What neither
   source permits is the third column: a leap onto a dissonance that then does
   not step out at all.

   WHAT COUNTS AS AN APPROACH. After a rest, there is no approach — a phrase
   starts where it starts, and measuring the interval across a silence measures
   phrase spacing rather than voice leading. This is the same trap probe_theory
   documents in the other direction, where 81% of one genre's "unresolved"
   dissonances turned out to be phrase endings. So a note is only counted when
   its predecessor was still sounding, or ended within a sixteenth of it.

   The chord under a note is read from what the KEYS are actually sounding at
   that instant, exactly as probe_theory reads it, so the two probes agree
   about which notes are dissonances and disagree only about which side of
   them they look at.

     node harness/probe_arrival.js [nSeeds]
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 20;

const PITCHED = new Set(["lead", "counter"]);
const pc = p => ((p % 12) + 12) % 12;

console.log(`\n=== how a dissonance is ARRIVED at (${N} seeds per genre) ===\n`);
console.log("  Bach, 382 chorales: 96.8% of clashes approached by step  [counterpoint-measured.md §3]\n");
console.log("  genre          dissonances   by step   by repeat   by leap   of the leaps, how they LEAVE:");
console.log("                 (approached)                              step back  step on  LEAPT  (phr.end)");

const TOT = { n: 0, step: 0, rep: 0, leap: 0, app: 0, same: 0, bare: 0, end: 0 };

for(const g of M.genres()){
  let n = 0, step = 0, rep = 0, leap = 0, app = 0, same = 0, bare = 0, end = 0;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    const ev = song.perf.events.filter(e => e.pitch != null).sort((a, b) => a.tSec - b.tSec);
    const byRole = {};
    for(const e of ev) (byRole[e.role] || (byRole[e.role] = [])).push(e);
    const keys = byRole.keys || byRole.harmony || [];
    const spb = song.motion.spb;

    for(const role of PITCHED){
      const line = byRole[role] || [];
      for(let i = 1; i < line.length; i++){
        const prev = line[i - 1], e = line[i], nx = line[i + 1];
        /* no approach across a silence */
        if(prev.tSec + prev.durSec + spb + 1e-6 < e.tSec) continue;
        /* is this note a dissonance against what is actually ringing? */
        const under = new Set();
        for(const k of keys){
          if(k.tSec > e.tSec + 1e-6) break;
          if(k.tSec + k.durSec > e.tSec + 1e-6) under.add(pc(k.pitch));
        }
        if(!under.size) continue;
        if(under.has(pc(e.pitch))) continue;             // a chord tone
        n++;
        const inv = e.pitch - prev.pitch;                // how it was arrived at
        if(inv === 0){ rep++; continue; }
        if(Math.abs(inv) <= 2){ step++; continue; }
        leap++;
        /* an appoggiatura leaps IN and steps OUT. Whether the step has to
           reverse the leap is exactly what the two sources disagree about, so
           the two cases are counted apart rather than merged.

           ── AND A DISSONANCE THAT ENDS THE PHRASE HAS NOT FAILED TO STEP ────
           The first version of this probe had four columns and put "followed
           by a rest" in with "leapt away", which is precisely the trap
           probe_theory documents in the other direction -- 81% of one genre's
           "unresolved" dissonances turned out to be phrase endings. It read
           48.1% of leaps as never stepping out, and about half of that was
           phrase ends. A note that has died away is not hanging, and the
           departure law deliberately DECLINES to play a resolution that would
           itself leap, which shows up here as a silence and not as a defect.
           So the ending is its own column and it is not counted against
           anything. ── */
        if(nx && nx.tSec <= e.tSec + e.durSec + spb + 1e-6){
          const out = nx.pitch - e.pitch;
          if(out !== 0 && Math.abs(out) <= 2)
            (Math.sign(out) === -Math.sign(inv)) ? app++ : same++;
          else bare++;
        } else end++;
      }
    }
  }
  const p = (x) => n ? (100 * x / n).toFixed(1).padStart(5) + "%" : "    -- ";
  const q = (x) => leap ? (100 * x / leap).toFixed(1).padStart(5) + "%" : "    -- ";
  console.log(`  ${g.padEnd(13)}${String(n).padStart(8)}     ${p(step)}     ${p(rep)}    ${p(leap)}     ${q(app)}  ${q(same)} ${q(bare)}  ${q(end)}`);
  /* ── A ZERO HAS TO SAY WHICH ZERO IT IS ─────────────────────────────────
     Three genres read 0 and a bare "--" looks like a broken probe, which is
     this repo's most expensive failure mode. So the reason is derived from
     the song rather than asserted: either the genre writes no line the law
     is addressed to, or it writes one with no comp for it to be outside of.
     Both are facts about the genre. ── */
  if(!n){
    const s1 = M.composeSong(1, "draw", g);
    const has = r => s1.perf.events.some(e => e.pitch != null && e.role === r);
    const lines = [...PITCHED].filter(has);
    console.log(`                 ^ ${lines.length ? `writes ${lines.join("+")}, but no comp sounds under it`
                                                  : `writes no lead and no counter — the law has nothing to address`}`);
  }
  TOT.n += n; TOT.step += step; TOT.rep += rep; TOT.leap += leap;
  TOT.app += app; TOT.same += same; TOT.bare += bare; TOT.end += end;
}

const p = x => TOT.n ? (100 * x / TOT.n).toFixed(1).padStart(5) + "%" : "--";
const q = x => TOT.leap ? (100 * x / TOT.leap).toFixed(1).padStart(5) + "%" : "--";
console.log(`  ${"TOTAL".padEnd(13)}${String(TOT.n).padStart(8)}     ${p(TOT.step)}     ${p(TOT.rep)}    ${p(TOT.leap)}     ${q(TOT.app)}  ${q(TOT.same)} ${q(TOT.bare)}  ${q(TOT.end)}`);
console.log(`
  READ IT THIS WAY. "by step" and "by repeat" are the seven figures the
  taxonomy admits without argument. Of the leaps, "step back" is an
  appoggiatura under BOTH readings and "step on" is one under the looser
  reading only -- so the two together are the cost of the strict law and
  "step back" alone is the cost of the loose one.

  "no step" is the column no source permits under any reading: a jump onto a
  note outside the chord that then does not step out at all. That share of the
  whole, not the leap share, is the defect.

  Percentages of the leaps are of that genre's leap count, so they read across
  a row rather than down a column.
`);
