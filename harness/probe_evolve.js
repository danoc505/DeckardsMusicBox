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
const dist = (a, b) => {
  const A = new Map(a), B = new Map(b);
  const keys = new Set([...A.keys(), ...B.keys()]);
  if(!keys.size) return null;
  let diff = 0;
  for(const k of keys) if(A.get(k) !== B.get(k)) diff++;
  return diff / keys.size;
};

const BUCKETS = [[1, 1], [2, 3], [4, 7], [8, 15], [16, 31], [32, 999]];
const sum = BUCKETS.map(() => ({ n: 0, d: 0 }));
const inLink = { n: 0, d: 0 }, xLink = { n: 0, d: 0 };
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
say(near != null && near <= 0.45, "adjacent statements are CLOSE — there is a loop to recognise",
    near == null ? "no adjacent pairs" : near.toFixed(3) + " of positions differ");
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
console.log("\n  " + faults + " evolution fault(s)\n");
process.exit(faults ? 1 : 0);
