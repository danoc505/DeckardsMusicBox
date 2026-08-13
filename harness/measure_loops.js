#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE LOOP POINTS, MEASURED — and written back into the bank

       node harness/measure_loops.js          report only
       node harness/measure_loops.js --write  rewrite ERANG_INDEX in the HTML

   The encoder that built the bank wrote loop points by FORMULA: loopStart at a
   flat fraction of the file (0.4500 for every Erang family, 0.2200 for every
   Bard family) and loopEnd at the last sample. Not one of the sixty-nine was
   measured. Under the SFZ default rule -- "no_loop for samples WITHOUT loop
   metadata, loop_continuous for samples WITH defined loops" -- inventing that
   metadata is what turned sixty-nine one-shots into infinite loops.
   docs/genre-research/playing-a-sampled-instrument.md §1, §6.1

   This asks the audio instead, and it is allowed to answer NO.

   ── WHAT A LOOP HAS TO SURVIVE ─────────────────────────────────────────────
   THE REGION. Steady in level (RMS within 10% cell to cell) and steady in
   pitch (period within 2%), above a fifth of peak so it is not the tail. That
   is the "steady state" every source names and none of them measures for you.

   THE LENGTH. Sound On Sound: "it is best to make loop sections as long as you
   can, to minimise the impression that the sample consists of an intro portion
   and then the same few milliseconds of sound repeated ad infinitum." Their
   working figure is four seconds. This bank has nothing like that, so the
   floor here is 0.30 s AND at least six periods -- below either it is a
   stutter, and a stutter is the reported fault.

   THE JOIN. Web Audio's AudioBufferSourceNode does not crossfade a loop, so
   the two ends have to meet on their own. The loop length is snapped to a
   whole number of pitch periods, then both ends are walked +/- half a period
   to the pair that minimises the step AND the slope change across the join.
   Zero crossings alone are not enough -- a loop still clicks when the phase
   does not match, which is normal in any tone with several partials.

   THE JOIN, MEASURED AGAINST THE SIGNAL. The first version of this gated on
   nothing and handed back loops with a join step of 0.36 in a signal whose RMS
   is a fifth of that -- a bigger jump than the waveform itself, which is a
   click, not a loop. Vibrato is why: the phase drifts across a wide region and
   no alignment inside half a period can rescue it. So the join cost is divided
   by the region's own RMS and has to come in under 0.15, and a patch that
   cannot meet it is a one-shot however steady it looked.

   AND IT MAY REFINE OR WITHDRAW A LOOP, NEVER INVENT ONE. Run without that
   rule this pass handed a loop to `sfx_thunder_impact` and to six `Key`
   patches -- a thunderclap set to repeat for ever, and a struck keyboard note
   turned into a sustained one. Both are the original sin in the other
   direction: writing loop metadata onto a file because an algorithm liked the
   look of a quiet patch. A one-shot stays a one-shot. What this pass is for is
   the sixty-nine files that were declared loops without anybody listening.

   AN UNPITCHED PATCH (noise, sfx, atmosphere) has no period to align, so it
   gets the level test only -- but with a QUARTER-SECOND window and a 25% band,
   because noise is stochastic and never sits inside 10% cell to cell. The
   first version tested it like a flute and withdrew the loop from all five
   files the pack itself names `Noise_loopable_*`, which is the measurement
   being wrong rather than the pack. Floor of a second: these exist to be beds
   and a short noise loop is audible as a rhythm.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const HTML = path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const html = fs.readFileSync(HTML, "utf8");
const src = html.split("<script>")[1].split("</script>")[0];

/* the bank, decoded exactly as the program decodes it */
const B64 = /const ERANG_B64 *= *"([^"]*)"/.exec(src)[1];
const INDEX = /const ERANG_INDEX *= *"([^"]*)"/.exec(src)[1];
const RATE = +/const ERANG_RATE *= *([0-9]+)/.exec(src)[1];
const ADPCM_STEP = eval(/const ADPCM_STEP *= *(\[[^\]]*\])/.exec(src)[1]);
const ADPCM_IDX  = eval(/const ADPCM_IDX *= *(\[[^\]]*\])/.exec(src)[1]);
const bin = Buffer.from(B64, "base64").toString("binary");

const rows = INDEX.split(";").map(r => {
  const p = r.split(",");
  return { name: p[0], fam: p[1], off: +p[2], n: +p[3], root: +p[4], ls: +p[5], le: +p[6] };
});

function pcm(s){
  const out = new Float32Array(s.n);
  let pred = 0, index = 0;
  for(let i = 0; i < s.n; i++){
    const byte = bin.charCodeAt(s.off + (i >> 1));
    const code = (i & 1) === 0 ? (byte & 15) : (byte >> 4);
    const step = ADPCM_STEP[index];
    let delta = step >> 3;
    if(code & 4) delta += step;
    if(code & 2) delta += step >> 1;
    if(code & 1) delta += step >> 2;
    pred = (code & 8) ? pred - delta : pred + delta;
    if(pred > 32767) pred = 32767; else if(pred < -32768) pred = -32768;
    index += ADPCM_IDX[code];
    if(index < 0) index = 0; else if(index > 88) index = 88;
    out[i] = pred / 32768;
  }
  return out;
}

/* the pitch period in samples over [a,b), by autocorrelation. Searched around
   the patch's own declared root when it has one -- the root was hand-checked
   when the bank was built and is better evidence than a blind search. */
function periodAt(x, a, b, root){
  const lo = root > 0 ? Math.max(8, Math.floor(RATE / (root * 1.06)))
                      : Math.floor(RATE / 1200);
  const hi = root > 0 ? Math.min(Math.floor((b - a) / 3), Math.ceil(RATE / (root * 0.94)))
                      : Math.floor(RATE / 50);
  let best = 0, bestv = -Infinity;
  for(let p = lo; p <= hi; p++){
    let num = 0, e1 = 0, e2 = 0;
    for(let i = a; i + p < b; i++){ num += x[i] * x[i + p]; e1 += x[i] * x[i]; e2 += x[i + p] * x[i + p]; }
    const v = (e1 && e2) ? num / Math.sqrt(e1 * e2) : -1;
    if(v > bestv){ bestv = v; best = p; }
  }
  return { p: best, r: bestv };
}

const MIN_SEC_PITCHED = 0.30, MIN_PERIODS = 6;
const MIN_SEC_NOISE = 1.00, MAX_JOIN = 0.15;

function findLoop(s){
  const x = pcm(s);
  const pitched = s.root > 0;
  const CELL = Math.round((pitched ? 0.05 : 0.25) * RATE);
  const BAND = pitched ? 0.10 : 0.25;
  const cells = Math.floor(s.n / CELL);
  if(cells < 4) return null;
  const rms = [], per = [];
  for(let k = 0; k < cells; k++){
    let a = 0;
    for(let i = k * CELL; i < (k + 1) * CELL; i++) a += x[i] * x[i];
    rms.push(Math.sqrt(a / CELL));
    per.push(s.root > 0 ? periodAt(x, k * CELL, (k + 1) * CELL, s.root).p : 0);
  }
  const peak = Math.max.apply(null, rms);
  if(peak <= 0) return null;
  /* the longest run of cells steady in level, and in pitch when there is one */
  let bestA = -1, bestLen = 0, runA = 0, run = 0;
  for(let k = 1; k < cells; k++){
    const lvl = Math.abs(rms[k] - rms[k - 1]) / peak < BAND && rms[k] > 0.20 * peak;
    const pit = s.root <= 0 || (per[k - 1] > 0 && Math.abs(per[k] - per[k - 1]) / per[k - 1] < 0.02);
    if(lvl && pit){ if(run === 0) runA = k - 1; run++; }
    else run = 0;
    if(run > bestLen){ bestLen = run; bestA = runA; }
  }
  if(bestA < 0) return null;
  let a = bestA * CELL, b = Math.min(s.n, (bestA + bestLen + 1) * CELL);
  const span = (b - a) / RATE;

  if(s.root <= 0){
    /* unpitched: no phase to match, and a long floor because these are beds */
    if(span < MIN_SEC_NOISE) return null;
    return { ls: a, le: b - 1, why: `noise bed, ${span.toFixed(2)}s steady` };
  }
  const { p, r } = periodAt(x, a, b, s.root);
  if(!p || r < 0.5) return null;                    // not periodic enough to loop
  const laps = Math.floor((b - a) / p);
  if(laps < MIN_PERIODS || (laps * p) / RATE < MIN_SEC_PITCHED) return null;

  /* whole periods, then walk both ends half a period for the cleanest join:
     the step across the seam AND the change of slope, because a matched level
     with a mismatched direction still clicks */
  let L = laps * p, bestS = a, bestE = a + L, bestCost = Infinity;
  const W = Math.max(2, Math.floor(p / 2));
  for(let ds = -W; ds <= W; ds++){
    const s0 = a + ds;
    if(s0 < 1 || s0 + L + 1 >= s.n) continue;
    const e0 = s0 + L;
    const step = Math.abs(x[e0] - x[s0]);
    const slope = Math.abs((x[e0] - x[e0 - 1]) - (x[s0 + 1] - x[s0]));
    const cost = step + 0.5 * slope;
    if(cost < bestCost){ bestCost = cost; bestS = s0; bestE = e0; }
  }
  /* and the join is judged against the signal it has to disappear into */
  let e = 0;
  for(let i = bestS; i < bestE; i++) e += x[i] * x[i];
  const regionRms = Math.sqrt(e / (bestE - bestS));
  const rel = regionRms > 0 ? bestCost / regionRms : Infinity;
  if(rel > MAX_JOIN) return null;
  return { ls: bestS, le: bestE,
           why: `${laps} periods of ${(p / RATE * 1000).toFixed(1)}ms, ` +
                `${(L / RATE).toFixed(2)}s, join ${(100 * rel).toFixed(1)}% of signal` };
}

const out = [], report = [];
let kept = 0, dropped = 0, gained = 0;
for(const s of rows){
  const had = s.ls >= 0;
  const found = had ? findLoop(s) : null;      // refine or withdraw; never invent
  if(found){ s.ls = found.ls; s.le = found.le; kept++; }
  else { if(had) dropped++; s.ls = -1; s.le = -1; }
  report.push({ name: s.name, fam: s.fam, had, now: !!found,
                secs: s.n / RATE, why: found ? found.why : "no steady region a loop could live in" });
  out.push([s.name, s.fam, s.off, s.n, s.root, s.ls, s.le].join(","));
}

const byFam = {};
for(const r of report) (byFam[r.fam] = byFam[r.fam] || []).push(r);
console.log(`\n  ${rows.length} patches — loop points asked of the audio instead of a formula\n`);
for(const f in byFam){
  const g = byFam[f];
  console.log(`  ${f}  (${g.filter(r => r.now).length} of ${g.length} can be looped)`);
  for(const r of g)
    console.log(`     ${r.name.padEnd(22)}${r.secs.toFixed(2)}s  ` +
                `${(r.had ? "was looped" : "was one-shot").padEnd(14)}` +
                `${(r.now ? "LOOP" : "one-shot").padEnd(10)}${r.why}`);
  console.log("");
}
console.log(`  ${kept} loops kept and re-pointed at a region that is really there · ` +
            `${dropped} withdrawn — files that were being looped with nothing to loop\n`);

if(process.argv.includes("--write")){
  const next = html.replace(INDEX, out.join(";"));
  if(next === html) throw new Error("the index did not change — refusing to write");
  fs.writeFileSync(HTML, next);
  console.log("  ERANG_INDEX rewritten in the HTML.\n");
}
