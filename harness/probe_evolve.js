#!/usr/bin/env node
/* PROBE_EVOLVE — DOES THE LOOP EVOLVE, OR ONLY VARY?
 *
 *     node harness/probe_evolve.js [seeds] [file.html]
 *
 *   ── THE COMPLAINT ────────────────────────────────────────────────────────
 *   [owner] "Why cant you create an evolving loop, what fundimentally are you
 *   doing wrong?"
 *
 *   ── AND WHY EVERY COUNT THIS REPO HAS USED IS BLIND TO IT ────────────────
 *   Every measure written before this one is a SCALAR at one scale: how many
 *   distinct materials, how many distinct realisations, the longest run of
 *   identical statements. Each has exactly two ends, and hill-climbing any of
 *   them lands at an end:
 *
 *     optimise "nothing repeats"  ->  32 distinct realisations  ->  RANDOM NOTES
 *     optimise "one loop"         ->  1 tune                    ->  A SINGLE LOOP
 *
 *   Both shipped. Both scored WELL on the number being held at the time. The
 *   owner named both in the same words — "youve swung to the opposite extreme"
 *   — and he was describing this mechanism, not a taste disagreement.
 *
 *   ── SO THIS MEASURES A CURVE, NOT A COUNT ────────────────────────────────
 *   For every pair of statements of the loop, the DISTANCE between them (share
 *   of positions whose pitch differs), plotted against how far apart they are
 *   IN TIME. The shape is the answer, and the three cases are different shapes
 *   rather than different numbers:
 *
 *     RANDOM        flat and HIGH     — statement 2 is as far from statement 1
 *                                       as from statement 40. Nothing is a
 *                                       repeat, so nothing is a return.
 *     A SINGLE LOOP flat and ZERO     — no pair differs at any distance.
 *     EVOLVING      RISES with time   — near pairs are near (you recognise it),
 *                                       far pairs are far (it has travelled).
 *
 *   THE CLAIMS, in that order:
 *     NEAR   adjacent statements are close — there is a loop to recognise
 *     FAR    distant statements are further than adjacent ones — it travelled
 *     SLOPE  and the rise is monotonic enough to be a walk rather than a jump
 *
 *   WATCHED FAILING on the build before the chain landed: FAR was 0.20 against
 *   NEAR 0.19 — a flat line, which is the fan `S(n) = f(S0, n)` drawn as a
 *   graph. Nothing carried forward, so distance could not grow with time. */
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

/* the distance between two statements: the share of grid positions at which
   they do not agree. Quantised to the WRITTEN grid, because groove and
   humanisation would otherwise make every pair maximally distant — the fault
   the first cut of probe_law shipped with. */
/* ── AND THE TWO KINDS OF DIFFERENCE ARE MEASURED APART ────────────────────
   The first cut counted any disagreement at any grid position as distance, and
   that conflates two things the sources say are opposites.

   `docs/genre-research/melodic-math.md`: a motif is recognised by its RHYTHM —
   "the A and B motifs always stay in the same rhythm, thus giving them a strong
   hook" — and it is varied by TURNING SLOTS OFF: "A+a+B / A+A+B / A+a+B /
   A+a+b, upper case turned ON, lower case turned OFF". So when a statement
   drops its second motif, EVERY POSITION IN THAT MOTIF reads as "different"
   to a naive comparison, and the number says the tune changed when what
   actually happened is that a motif rested. Measured that way, the structural
   formula landing took adjacent statements from 0.29 to 0.55 and the guard went
   red on a build that had just become more faithful to the sources, not less.

   So:
     PITCH distance     over the positions BOTH statements sound — did the TUNE
                        move? This is the one that must stay low nearby and grow
                        with time, because it is the thing a listener follows.
     PRESENCE distance  positions sounding in one and not the other — how much
                        the formula is muting. Reported, and asserted non-zero,
                        because a formula that never turns anything off is a
                        formula that is not running.

   This is not a loosened guard. It is two claims where there was one, and the
   pitch claim is STRICTER than the old combined number: a tune whose pitches
   drifted while its motifs stayed present used to be able to hide inside the
   same average. */
const dist = (a, b) => {
  const A = new Map(a), B = new Map(b);
  let both = 0, diff = 0;
  for(const [k, v] of A) if(B.has(k)){ both++; if(B.get(k) !== v) diff++; }
  return both ? diff / both : null;
};
const presence = (a, b) => {
  const A = new Map(a), B = new Map(b);
  const keys = new Set([...A.keys(), ...B.keys()]);
  if(!keys.size) return null;
  let only = 0;
  for(const k of keys) if(A.has(k) !== B.has(k)) only++;
  return only / keys.size;
};

const BUCKETS = [[1, 1], [2, 3], [4, 7], [8, 15], [16, 31], [32, 999]];
const sum = BUCKETS.map(() => ({ n: 0, d: 0 }));
const inLink = { n: 0, d: 0 }, xLink = { n: 0, d: 0 };
const pres = { n: 0, d: 0 };
const grid = { stmts: 0, offGrid: 0 };
let recs = 0;

for(let s = 1; s <= SEEDS; s++){
  let g; try { g = M.composeSong(s, undefined, M.genres()[0]); } catch(e){ continue; }
  const C = M.makeClock(g.chart, g.form), B = g.materials.bars;
  const nStmt = Math.ceil(g.form.nBars / B);
  const ev = g.perf.events.filter(e => e.role === "lead" && e.pitch != null);
  const st = [];
  for(let k = 0; k < nStmt; k++){
    const t0 = C.at(k * B, 0), t1 = C.at((k + 1) * B, 0), span = (t1 - t0) / (B * 16);
    const here = ev.filter(e => e.tSec >= t0 - 1e-6 && e.tSec < t1 - 1e-6)
                   .map(e => [Math.round((e.tSec - t0) / span), e.pitch]);
    st.push(here.length ? here : null);
  }
  /* WHICH MATERIAL EACH STATEMENT IS, and which LINK of the chain it fell on.
     Both are needed and for different reasons. */
  const matOf = k => { const b = k * B;
    for(const x of g.sections) if(b >= x.startBar && b < x.endBar) return x.material; return "-"; };
  const linkOf = k => g.materials.evoEvery ? Math.floor(k / g.materials.evoEvery) : 0;
  /* ── THE RHYTHM IS THE INVARIANT, AND IT IS ASKED OF WHAT WAS WRITTEN ───
     `melodic-math.md` §1, the load-bearing claim of the whole sheet: "the A and
     B motifs ALWAYS STAY IN THE SAME RHYTHM, thus giving them a strong hook and
     quickly establishes into your mind". A motif is recognised by its
     DURATIONS; its pitches are free. So every device downstream may mute a slot
     or move a pitch level, and none may put a note where the motif has none.

     ASKED OF THE COMPOSED ARRAYS, NOT OF THE RENDER, and that is the whole
     difference between a guard and a wrong number. Read off rendered `tSec` it
     reported 27 of 402 statements off-grid, and printing them showed positions
     31 and 38 against a motif holding 32 and 39 — ONE STEP EARLY, which is the
     humanisation doing its job and the probe's rounding turning a few
     milliseconds of feel into a rhythmic fault. probe_law learned the same
     lesson from the other side and wrote it down: the render carries groove,
     swing and per-note jitter, and a claim about what was WRITTEN has to be
     asked of what was written. Every variant stage 3 builds is right here. */
  {
    /* ── AND THE CLAIM IS THE SPAN, NOT EVERY DURATION ────────────────────
       The first cut demanded every note sit on an onset the motif already has.
       That was §1 of the sheet taken too strictly, and the SECOND set of
       diagrams corrects it [melodic-math.md §0b-iii, Europe "The Final
       Countdown"]: "'A2' has the last note SPLIT INTO 2, still taking up the
       same amount of space, but allowing for an extra key change — we can call
       this RHYTHMIC ACCELERATION. A subtle yet welcome variation."

         A = 1(i)1(i)4   ->   A2 = 1(i)1(i)2(i)2

       So a note may subdivide INSIDE ITS OWN SPAN, and the invariant is that
       the motif keeps its length and its attacks land within notes it already
       had. A note starting where the motif is silent is still a fault; a note
       starting halfway through a note the motif holds is the device.

       This is the guard following a correction to the sheet, and the sheet
       carries the quote that forced it — not a threshold moved to make a build
       green. The strict form would now fail `A2`, which the source names and
       welcomes. */
    const A = (g.materials.A || {}).lead || [];
    const BARSN = g.materials.bars;
    const spans = A.map(n => { const at = (n.bar % BARSN) * 16 + n.step;
                               return [at, at + Math.max(1, n.dur || 1)]; });
    const inside = pos => spans.some(([a, b]) => pos >= a && pos < b);
    const check = arr => {
      if(!arr || !arr.length) return;
      grid.stmts++;
      if(arr.some(n => !inside((n.bar % BARSN) * 16 + n.step))) grid.offGrid++;
    };
    (g.materials.evo || []).forEach(check);                    // the chain
    (g.materials.evoThird || []).forEach(check);               // each link's third
    (g.materials.form || []).forEach(row => row.forEach(check));// every formula variant
    check((g.materials.third || {})["A|lead"]);
  }
  recs++;
  for(let i = 0; i < st.length; i++){
    if(!st[i]) continue;
    for(let j = i + 1; j < st.length; j++){
      if(!st[j]) continue;
      /* ── ONLY PAIRS OF THE SAME MATERIAL ────────────────────────────────
         The first cut compared every statement with every other, and the
         numbers it produced were dominated by the FORM: a verse against a
         chorus differs because it is a chorus, not because anything evolved.
         Adjacent statements read 0.450 — 45% of positions differing between
         two hearings a loop apart — which is not a fact about the tune, it is
         the boundary between two sections landing inside the bucket.
         Asked of one material at a time, "how far has THIS tune moved" is a
         question about the tune. */
      if(matOf(i) !== matOf(j)) continue;
      const pz = presence(st[i], st[j]);
      if(pz != null){ pres.n++; pres.d += pz; }
      const d = dist(st[i], st[j]);
      if(d == null) continue;
      const gap = j - i;
      for(let b = 0; b < BUCKETS.length; b++)
        if(gap >= BUCKETS[b][0] && gap <= BUCKETS[b][1]){ sum[b].n++; sum[b].d += d; break; }
      /* and the direct test of the CHAIN: same material, same link, against
         same material, different link */
      if(linkOf(i) === linkOf(j)){ inLink.n++; inLink.d += d; }
      else { xLink.n++; xLink.d += d; }
    }
  }
}

const mean = b => sum[b].n ? sum[b].d / sum[b].n : null;
console.log("\n=== HOW FAR APART ARE TWO HEARINGS OF THE LOOP? — " + recs + " records\n");
console.log("  statements apart      pairs     mean distance");
const bar = v => "█".repeat(Math.round(v * 40));
for(let b = 0; b < BUCKETS.length; b++){
  const m = mean(b);
  const lab = BUCKETS[b][0] === BUCKETS[b][1] ? String(BUCKETS[b][0])
            : BUCKETS[b][1] > 900 ? BUCKETS[b][0] + "+" : BUCKETS[b][0] + "-" + BUCKETS[b][1];
  console.log("  " + lab.padStart(16) + String(sum[b].n).padStart(11) + "  " +
              (m == null ? "   —" : m.toFixed(3).padStart(8) + "  " + bar(m)));
}

let faults = 0;
const say = (ok, label, detail) => {
  console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};
console.log("");
const near = mean(0), far = mean(5) != null ? mean(5) : mean(4);
say(near != null && near <= 0.45, "adjacent statements are CLOSE IN PITCH — there is a loop to recognise",
    near == null ? "no adjacent pairs" : near.toFixed(3) + " of SHARED positions differ in pitch");
say(near != null && far != null && far >= near + 0.10,
    "and distant statements are FURTHER — the tune travelled",
    near == null || far == null ? "not enough pairs"
      : "near " + near.toFixed(3) + " -> far " + far.toFixed(3) +
        " (+" + (far - near).toFixed(3) + ")");
/* ── AND THE THIRD CLAIM IS NOT "THE CURVE IS MONOTONIC" ────────────────────
   That was the first cut and it is WRONG ABOUT MUSIC, not merely strict: a
   record that returns to its opening material must dip at the distance the
   return sits at, and this genre's legs recur by design, so the 16-31 bucket
   reading below 8-15 is a RECAPITULATION and not a fault. A guard that fails
   every record with a return would be measuring form and calling it evolution.

   Replaced with the direct test of the mechanism, which is a STRONGER claim
   and not a looser one: statements that fall inside ONE LINK of the chain are
   closer to each other than statements that fall in DIFFERENT links. A fan —
   `S(n) = f(S0, n)`, which is what this engine was — cannot satisfy it at any
   weighting, because in a fan the link a statement falls in carries no
   information. Only something that carries state forward can. */
const inM = inLink.n ? inLink.d / inLink.n : null;
const xM  = xLink.n ? xLink.d / xLink.n : null;
say(inM != null && xM != null && xM >= inM + 0.05,
    "and two hearings in the SAME link are closer than two across links — the chain carries",
    inM == null || xM == null ? "not enough pairs"
      : "within a link " + inM.toFixed(3) + ", across links " + xM.toFixed(3) +
        " (+" + (xM - inM).toFixed(3) + ", over " + (inLink.n + xLink.n) + " pairs)");
const pm = pres.n ? pres.d / pres.n : null;
say(pm != null && pm >= 0.05, "and the structural formula is turning motifs OFF",
    pm == null ? "no pairs" : (100 * pm).toFixed(1) + "% of grid positions sound in one statement and not the other" +
      " — the lower-case slots of the formula [melodic-math.md \u00a73]");
say(grid.stmts > 0 && grid.offGrid === 0,
    "and the RHYTHM holds — every note starts inside a note the motif already has",
    !grid.stmts ? "no statements" :
      grid.offGrid ? grid.offGrid + "/" + grid.stmts + " variants put a note where the motif is silent"
                   : grid.stmts + " composed variants, every note inside the motif's own span" +
                     " — subdivision allowed, the edge is not [melodic-math.md \u00a71, \u00a70b-iii]");
console.log("\n  " + faults + " evolution fault(s)\n");
process.exit(faults ? 1 : 0);
