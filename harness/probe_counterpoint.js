/* TWO LINES AT ONCE — what the parts do RELATIVE TO EACH OTHER.

   Nothing in this program has ever measured the relationship between two
   parts. Verified 2026-08-03: grep for "parallel fifth", "parallel octave",
   "similar motion", "oblique", "voice cross" over the whole HTML returns ZERO
   hits, in code AND in comments. The only cross-part constraint that exists is
   a `reserved` set banning two parts from striking the same absolute pitch at
   the same instant -- the degenerate case -- plus the counter's single
   contrary-motion preference against the lead (a flat +100 cost).

   So this reads the notes and asks the horizontal question, per genre:

     - the four MOTIONS between every pair of parts that move together
       (parallel / similar / oblique / contrary), as shares
     - PARALLEL PERFECTS: both parts move the same direction by the same
       number of semitones, and the interval is a unison, 5th or octave
       BOTH before and after. This is the one the sources call a defect
       (docs/genre-research/counterpoint.md ss1)
     - the harmonic INTERVAL census: perfect / imperfect / dissonant

   TWO CONTROLS, because a rate with nothing to compare it to says nothing --
   this repo's own probe_novelty lesson, applied to a different question:

     CEILING  a genre whose counter style is "double" is parallel octaves BY
              DESIGN (synthwave). Its lead<->counter pair should read near
              100% parallel perfect. If it does not, this probe is wrong
              before any finding it reports is worth reading.
     FLOOR    the same pitches, shuffled within each part on the same rhythm,
              seeded. That is the rate you get by chance. A measured rate at
              or below chance is evidence of nothing.

   The null was written down before the mechanism exists, so it cannot be
   chosen later to flatter one.

     node harness/probe_counterpoint.js [seeds]
*/
const fs = require('fs'), path = require('path');
/* the engine, loaded exactly the way probe_theory.js loads it -- same idiom, so
   there is one way this repo evals the composer out of the page, not two */
const html = fs.readFileSync(path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html'), 'utf8');
const src = html.split('<script>')[1].split('</script>')[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: '', value: '1', innerHTML: '' }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const SEEDS = parseInt(process.argv[2], 10) || 20;

/* ── the pitched parts. Drums have no pitch relationship to measure, and the
      tape bed is not a part. Derived from the events, not listed. ── */
const PITCHED = ev => ev.role && ev.pitch != null && ev.role !== 'tape';

/* ── TWO CORRECTIONS THE CEILING CONTROL FORCED, both recorded because they
      are the two ways this measurement goes wrong ────────────────────────────

   1. JOIN ON THE STEP, NOT ON THE SECOND. The first version matched onsets
      within a millisecond of each other. But stage 5 displaces each lane
      independently -- groove swing, dilla lean, per-lane push -- so two parts
      written on the SAME sixteenth arrive tens of milliseconds apart. Measured
      on synthwave seed 1: only 51.0% of counter notes land within 1 ms of a
      lead onset, and 65.7% within 25 ms, against a sixteenth of 131 ms. So the
      strict version was silently discarding half the material and the half it
      kept was the half the groove happened not to move. Events carry no step
      field, so the step is derived: round(tSec / secondsPerSixteenth) from the
      song's own tempo. That is what "moving together" means in a program whose
      every other reader is a step grid.

   2. A CHORD IS NOT A LINE. `keys` carries more than one pitch on 12.2% of its
      instants, and the first version took whichever pitch happened to sit
      first in the event array -- an arbitrary inner voice. Each role is now
      reduced at each step to its TOP note, which is the line the ear follows
      and the one buildKeys itself weights x2 for that reason. STATED LIMIT:
      the comp's inner voices are therefore NOT measured here, so a parallel
      fifth buried inside a voicing is invisible to this probe. It sees outer
      voices, which is where the sources put the concern, and it does not
      pretend to see more. */
function partSteps(events, spb){
  const top = new Map();                    /* step -> highest pitch at that step */
  for(const e of events){
    const st = Math.round(e.tSec / spb);
    const cur = top.get(st);
    if(cur == null || e.pitch > cur) top.set(st, e.pitch);
  }
  return [...top.entries()].sort((a, z) => a[0] - z[0]).map(([t, pitch]) => ({ t, pitch }));
}

const PERF = new Set([0, 7]);              /* unison/octave (0) and fifth (7), mod 12 */
const IMPERF = new Set([3, 4, 8, 9]);      /* thirds and sixths */

/* ── the shared engine: given two parts as [{t, pitch}] sorted by time, walk
      the instants where BOTH have a note sounding and classify each step. ── */
function pairMotions(A, B){
  /* an instant belongs to the pair only if both parts strike ON THE SAME STEP
     -- "moving together" is what the four motions are defined over, and the
     step is the unit this program composes in (see the note above). */
  const bStep = new Map(B.map(b => [b.t, b.pitch]));
  const joint = [];
  for(const a of A) if(bStep.has(a.t)) joint.push({ t: a.t, a: a.pitch, b: bStep.get(a.t) });
  const out = { steps: 0, parallel: 0, similar: 0, oblique: 0, contrary: 0,
                parPerf: 0, perf: 0, imperf: 0, diss: 0 };
  for(const s of joint){
    const iv = Math.abs(s.a - s.b) % 12;
    if(PERF.has(iv)) out.perf++; else if(IMPERF.has(iv)) out.imperf++; else out.diss++;
  }
  for(let i = 1; i < joint.length; i++){
    const p = joint[i - 1], q = joint[i];
    const da = q.a - p.a, db = q.b - p.b;
    if(da === 0 && db === 0) continue;               /* nobody moved: not a step */
    out.steps++;
    if(da === 0 || db === 0){ out.oblique++; continue; }
    if((da > 0) !== (db > 0)){ out.contrary++; continue; }
    if(da === db){
      out.parallel++;
      /* a PARALLEL PERFECT: same direction, same distance, and the interval is
         perfect on BOTH sides. Same distance makes the second condition follow
         from the first, but both are checked so the definition is readable and
         so a future change to `parallel` cannot silently widen this. */
      const before = Math.abs(p.a - p.b) % 12, after = Math.abs(q.a - q.b) % 12;
      if(PERF.has(before) && PERF.has(after)) out.parPerf++;
    } else out.similar++;
  }
  return out;
}

/* a seeded shuffle, so the FLOOR control is reproducible run to run */
function shuffled(part, seed){
  let s = seed >>> 0 || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pitches = part.map(p => p.pitch);
  for(let i = pitches.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    [pitches[i], pitches[j]] = [pitches[j], pitches[i]];
  }
  return part.map((p, i) => ({ t: p.t, pitch: pitches[i] }));
}

const add = (into, from) => { for(const k in from) into[k] = (into[k] || 0) + from[k]; return into; };
const pctOf = (n, d) => d ? (100 * n / d).toFixed(1).padStart(5) : '    -';

console.log(`\n=== two lines at once: what the parts do relative to each other (${SEEDS} seeds a genre) ===\n`);
console.log('  For each genre, every pair of pitched parts that strike together.');
console.log('  PAR.PERF is the one the sources call a defect: same direction, same distance,');
console.log('  a unison/5th/octave on both sides. counterpoint.md §1.\n');
console.log('  genre         pairs   steps   contrary  oblique  similar  parallel   PAR.PERF   (chance)');

const genres = M.genres();
const rows = [];
for(const g of genres){
  const tot = {}; let pairCount = 0;
  const floorTot = {};
  for(let s = 1; s <= SEEDS; s++){
    const song = M.composeSong(s, 'draw', g);
    const spb = (60 / song.chart.tempo) / 4;
    const raw = {};
    for(const e of song.perf.events){
      if(!PITCHED(e)) continue;
      (raw[e.role] = raw[e.role] || []).push(e);
    }
    const byRole = {};
    for(const r in raw) byRole[r] = partSteps(raw[r], spb);
    const roles = Object.keys(byRole).filter(r => byRole[r].length > 3).sort();
    for(let i = 0; i < roles.length; i++) for(let j = i + 1; j < roles.length; j++){
      const A = byRole[roles[i]], B = byRole[roles[j]];
      const m = pairMotions(A, B);
      if(!m.steps) continue;
      pairCount++;
      add(tot, m);
      /* FLOOR: the same rhythm, the pitches shuffled inside each part */
      add(floorTot, pairMotions(shuffled(A, s * 7919 + i), shuffled(B, s * 104729 + j)));
    }
  }
  rows.push({ g, tot, floorTot, pairCount });
  const t = tot, st = t.steps || 0;
  console.log(`  ${g.padEnd(12)} ${String(pairCount).padStart(5)} ${String(st).padStart(7)}   ` +
    `${pctOf(t.contrary, st)}%  ${pctOf(t.oblique, st)}%  ${pctOf(t.similar, st)}%  ${pctOf(t.parallel, st)}%   ` +
    `${pctOf(t.parPerf, st)}%    ${pctOf(floorTot.parPerf, floorTot.steps)}%`);
}

console.log('\n  the harmonic interval census, over every instant two parts sound together:\n');
console.log('  genre         perfect(1,5,8)  imperfect(3,6)  dissonant');
for(const { g, tot } of rows){
  const n = (tot.perf || 0) + (tot.imperf || 0) + (tot.diss || 0);
  console.log(`  ${g.padEnd(12)} ${pctOf(tot.perf, n)}%          ${pctOf(tot.imperf, n)}%         ${pctOf(tot.diss, n)}%`);
}

/* ── THE CEILING CONTROL, checked rather than assumed ──────────────────────
   A genre declaring counter.style "double" is an octave double by design, so
   this probe must be able to see that.

   THE CONTROL'S FIRST VERSION ASKED THE WRONG QUESTION AND SAID SO LOUDLY,
   which is the only reason the two bugs above were found. It demanded >80%
   PARALLEL PERFECT MOTION and read 72.9%. The interval turned out to be a
   perfect octave on 100% of shared onsets -- the definitional claim -- while
   the MOTION was not always parallel, because `octaves: [-12, 12]` lets the
   double sit above OR below and it takes whichever fits the band unreserved.
   Measured on synthwave, seeds 1-8: 77.6% at -12 and 22.4% at +12. Every flip
   is a 24-semitone leap in the counter against a stepping lead, which breaks
   parallel motion while remaining a perfect octave throughout.

   So the control asks the definitional question -- IS THE INTERVAL A PERFECT
   OCTAVE -- and the flip rate is reported beside it as a finding in its own
   right rather than as a failure. */
console.log('\n  ── the CEILING control: a genre whose counter is a deliberate octave double');
console.log('     must read ~100% PERFECT INTERVAL on its lead<->counter pair, or this probe');
console.log('     is broken before any finding above means anything.\n');
let checked = 0;
for(const g of genres){
  const tbl = M.composeSong(1, 'draw', g).chart.table;
  if(!tbl || !tbl.counter || tbl.counter.style !== 'double') continue;
  checked++;
  const tot = {}; const offs = {};
  for(let s = 1; s <= SEEDS; s++){
    const song = M.composeSong(s, 'draw', g);
    const spb = (60 / song.chart.tempo) / 4;
    const raw = { lead: [], counter: [] };
    for(const e of song.perf.events)
      if(e.pitch != null && raw[e.role]) raw[e.role].push(e);
    const L = partSteps(raw.lead, spb), C = partSteps(raw.counter, spb);
    if(L.length > 3 && C.length > 3){
      add(tot, pairMotions(L, C));
      const cm = new Map(C.map(c => [c.t, c.pitch]));
      for(const l of L) if(cm.has(l.t)){ const d = cm.get(l.t) - l.pitch; offs[d] = (offs[d] || 0) + 1; }
    }
  }
  const n = (tot.perf || 0) + (tot.imperf || 0) + (tot.diss || 0);
  const ivShare = n ? 100 * tot.perf / n : 0;
  const parShare = tot.steps ? 100 * tot.parPerf / tot.steps : 0;
  console.log(`     ${g} (counter.style "double"): ${ivShare.toFixed(1)}% perfect interval over ${n} shared onsets` +
              `  ${ivShare > 95 ? '— CONTROL HOLDS' : '— ** CONTROL FAILED: fix the probe, do not trust the table above **'}`);
  console.log(`       …of which parallel MOTION: ${parShare.toFixed(1)}% of ${tot.steps || 0} steps.` +
              ` The gap is the octave FLIP:`);
  const tot2 = Object.values(offs).reduce((a, b) => a + b, 0);
  for(const d of Object.keys(offs).map(Number).sort((a, z) => a - z))
    console.log(`         ${String(d).padStart(4)} semitones: ${String(offs[d]).padStart(5)}  (${(100 * offs[d] / tot2).toFixed(1)}%)`);
  console.log('       Each flip is a two-octave leap in the counter against a stepping lead.');
  console.log('       Whether that is wanted is an EAR question; it is recorded, not judged.');
}
if(!checked) console.log('     no genre currently declares counter.style "double" — control could not run.');
console.log('');
