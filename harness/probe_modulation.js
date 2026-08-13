#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   MODULATION — is it general, and does any of it escape being periodic?

       node harness/probe_modulation.js [seeds]

   Built after this:

     "Adding LFO's should be able to used in all genres, not just for drones."

   Which was fair. The four kinds with MEMORY -- fm, sh, dejavu, bernoulli --
   went in as general machinery in the shared draw and were then DECLARED on
   one genre's pad and ostinato, so the only evidence that they were not a
   drone feature was my saying so. This probe is the evidence instead.

   ── WHAT IT ASKS ───────────────────────────────────────────────────────────

     GENERAL   every kind resolves on EVERY genre. Not "could in principle":
               the probe declares each kind on a control the genre actually has,
               composes, and reads the value back off the plan. A kind that
               throws, or that resolves to a flat line, fails here.

     REACHED   the kinds a genre declares in its own table produce a curve that
               actually moves. A declared modulator that resolves flat is the
               knob-that-does-nothing defect wearing a new hat, and this file
               has shipped that four times.

     FREE      of the lanes that move at all, how many never come round again?
               Measured as the best autocorrelation over every lag out to half
               the record. A 160-bar sine scores 1.0 -- it is LONG, not
               evolving, and the distinction is the whole point. Reported, not
               required: a genre is allowed to want everything periodic.

   AND IT IS NOT A TASTE CHECK. Nothing here says a genre should be more
   modulated than it is. It says the machinery is available everywhere and does
   what it claims where it is used.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
let src = html.split("<script>")[1].split("</script>")[0];
src += ";global.__motionAt = motionAt; global.__makeMotion = makeMotion;";
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2, motionAt = global.__motionAt;

const N = parseInt(process.argv[2], 10) || 3;
const KINDS = ["fm", "sh", "dejavu", "bernoulli"];
const bad = [], rows = [];

/* the four kinds, written against whatever control is handed in. Depths are
   deliberately large: this is a reachability test, not a mix. */
const specFor = (kind) => ({
  fm:        { kind: "fm", bars: [[8, 1]], depth: [0.4, 0.4], shape: "sin",
               by: { bars: [[24, 1]], rate: [0.6, 0.6], depth: [0.4, 0.4], shape: "sin" } },
  sh:        { kind: "sh", every: [[16, 1]], amt: [-0.4, 0.4], slew: [0, 0] },
  dejavu:    { kind: "dejavu", length: [[8, 1]], every: [[16, 1]], dejavu: [0.2, 0.2],
               amt: [-0.4, 0.4], spread: [0, 0] },
  bernoulli: { kind: "bernoulli", p: [0.5, 0.5], a: [-0.4, -0.4], b: [0.4, 0.4], every: [[16, 1]] },
}[kind]);

const swing = v => Math.max.apply(null, v) - Math.min.apply(null, v);
const comesRound = (v, nB, STEPS) => {
  const pb = [];
  for(let b = 0; b < nB; b++){
    let a = 0;
    for(let s = 0; s < STEPS; s++) a += v[b * STEPS + s];
    pb.push(a / STEPS);
  }
  const m = pb.reduce((x, y) => x + y, 0) / pb.length, d = pb.map(x => x - m);
  let e0 = 0; for(const x of d) e0 += x * x;
  if(e0 < 1e-12) return 1;
  let best = 0;
  for(let lag = 1; lag <= Math.floor(nB / 2); lag++){
    let n = 0, ea = 0, eb = 0;
    for(let i = 0; i + lag < d.length; i++){ n += d[i] * d[i + lag]; ea += d[i] * d[i]; eb += d[i + lag] * d[i + lag]; }
    const r = (ea > 1e-12 && eb > 1e-12) ? n / Math.sqrt(ea * eb) : 0;
    if(r > best) best = r;
  }
  return best;
};

for(const genre of M.genres()){
  const song = M.composeSong(1, null, genre);
  const plan = song.motion, STEPS = plan.steps || 16, nB = plan.nBars;

  /* ── GENERAL: every kind, on this genre, on a control this genre has ────── */
  const anyLane = Object.keys(plan.lanes)[0];
  for(const kind of KINDS){
    const key = anyLane;                       // a control the genre demonstrably owns
    let ok = false, why = "";
    try {
      const table = JSON.parse(JSON.stringify(song.chart.table));
      const [m, k] = key.split(".");
      table.motion = table.motion || {};
      table.motion[m] = table.motion[m] || {};
      table.motion[m][k] = [specFor(kind)];
      const chart2 = Object.assign({}, song.chart, { table });
      const p2 = global.__makeMotion(chart2, song.form, song.sections, song.materials);
      const lane = p2.lanes[key] || [];
      const v = [];
      for(let b = 0; b < nB; b++)
        for(let s = 0; s < STEPS; s++)
          v.push(motionAt(p2, key, { tSec: (b * STEPS + s) * p2.spb }));
      if(v.some(x => !isFinite(x))) why = "resolved to NaN";
      else if(!lane.some(x => x.kind === "curve")) why = "did not resolve to a curve";
      else if(swing(v) < 1e-6) why = "resolved flat — a modulator that does nothing";
      else ok = true;
    } catch(e){ why = "threw: " + e.message; }
    if(!ok) bad.push(`${genre}: ${kind} on ${key} — ${why}`);
  }

  /* ── REACHED and FREE, on what the genre's OWN table declares ───────────── */
  let moving = 0, free = 0, mem = 0, memFlat = 0;
  for(const key in plan.lanes){
    const v = [];
    for(let b = 0; b < nB; b++)
      for(let s = 0; s < STEPS; s++)
        v.push(motionAt(plan, key, { tSec: (b * STEPS + s) * plan.spb }));
    if(v.some(x => !isFinite(x))){ bad.push(`${genre}: ${key} reads NaN`); continue; }
    const hasCurve = plan.lanes[key].some(x => x.kind === "curve");
    if(hasCurve){
      mem++;
      /* the curve ON ITS OWN must move, or the declaration is decoration */
      for(const mv of plan.lanes[key]){
        if(mv.kind !== "curve") continue;
        const one = { lanes: { x: [mv] }, spb: plan.spb, steps: STEPS, nBars: nB, secFn: plan.secFn };
        const w = [];
        for(let b = 0; b < nB; b++)
          for(let s = 0; s < STEPS; s++) w.push(motionAt(one, "x", { tSec: (b * STEPS + s) * plan.spb }));
        if(swing(w) < 1e-6){ memFlat++; bad.push(`${genre}: ${key} declares a curve that resolves flat`); }
      }
    }
    if(swing(v) < 1e-9) continue;
    moving++;
    if(comesRound(v, nB, STEPS) < 0.60) free++;
  }
  rows.push({ genre, moving, free, mem });
}

console.log(`\n  ${M.genres().length} genres — every kind tried on every genre, then what each table asks for\n`);
console.log("    genre           lanes moving   never come round   lanes with memory");
for(const r of rows)
  console.log(`    ${r.genre.padEnd(14)}${String(r.moving).padStart(11)}` +
              `${String(r.free).padStart(19)}${String(r.mem).padStart(20)}`);

console.log("");
if(!bad.length){
  console.log("  fm, sh, dejavu and bernoulli resolve on all ten genres, and every curve a table\n" +
              "  declares actually moves.\n");
} else {
  for(const b of bad.slice(0, 20)) console.log("    " + b);
  if(bad.length > 20) console.log(`    ... and ${bad.length - 20} more`);
  console.log(`\n  ${bad.length} fault(s).\n`);
  process.exitCode = 1;
}
