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
const html = fs.readFileSync(path.resolve(__dirname, '..', 'Boxcar Synth.html'), 'utf8');
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
      reduced at each step to its TOP note, which is the line the line follows
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
let FAULTS = 0;
const rows = [];
for(const g of genres){
  const tot = {}; let pairCount = 0;
  const floorTot = {};
  /* ── AND THE SAME NUMBERS PER PAIR, because the average hides the finding ──
     The row this probe prints is every pair of parts averaged together, and
     that average has already cost this project a build: a parallel-perfect
     cost was written for the lead<->counter pair and reverted as useless,
     because the pair actually at fault was keys<->bass and nothing here could
     say so (counterpoint-measured.md §4, §5). A number that cannot point at
     the part it is complaining about is a number you cannot act on.
     `BACKLOG.md` §6.6 asks for exactly this, ranked. ── */
  const byPair = {}, byPairFloor = {};
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
      const key = roles[i] + '<->' + roles[j];
      add(byPair[key] = byPair[key] || {}, m);
      /* FLOOR: the same rhythm, the pitches shuffled inside each part */
      const fl = pairMotions(shuffled(A, s * 7919 + i), shuffled(B, s * 104729 + j));
      add(floorTot, fl);
      add(byPairFloor[key] = byPairFloor[key] || {}, fl);
    }
  }
  rows.push({ g, tot, floorTot, pairCount, byPair, byPairFloor });
  const t = tot, st = t.steps || 0;
  console.log(`  ${g.padEnd(12)} ${String(pairCount).padStart(5)} ${String(st).padStart(7)}   ` +
    `${pctOf(t.contrary, st)}%  ${pctOf(t.oblique, st)}%  ${pctOf(t.similar, st)}%  ${pctOf(t.parallel, st)}%   ` +
    `${pctOf(t.parPerf, st)}%    ${pctOf(floorTot.parPerf, floorTot.steps)}%`);
}

/* ── WHICH PAIR, RANKED. Only pairs with enough steps to mean anything, and
      each against ITS OWN shuffle floor rather than the genre's -- a pair of
      slow parts and a pair of busy ones do not have the same chance rate. The
      deliberate octave double is marked rather than filtered: it belongs at
      the top of its genre's list and it is not a defect, and hiding it would
      leave the reader wondering where it went. ── */
console.log('\n  WHICH PAIR — parallel perfects per pair of parts, worst first');
console.log('  (pairs with at least 100 shared steps; each against its own shuffle floor)\n');
for(const r of rows){
  const dbl = (() => { const t = M.composeSong(1, 'draw', r.g).chart.table;
                       return t && t.counter && t.counter.style === 'double'; })();
  const list = Object.keys(r.byPair)
    .filter(k => (r.byPair[k].steps || 0) >= 100)
    .map(k => ({ k, st: r.byPair[k].steps, pp: 100 * (r.byPair[k].parPerf || 0) / r.byPair[k].steps,
                 fl: r.byPairFloor[k] && r.byPairFloor[k].steps
                     ? 100 * (r.byPairFloor[k].parPerf || 0) / r.byPairFloor[k].steps : 0 }))
    .sort((a, z) => z.pp - a.pp);
  if(!list.length){ console.log(`  ${r.g.padEnd(12)} — no pair reaches 100 shared steps`); continue; }
  console.log(`  ${r.g}`);
  for(const p of list.slice(0, 4)){
    const isDouble = dbl && p.k === 'counter<->lead';
    console.log(`      ${p.k.padEnd(22)} ${p.pp.toFixed(1).padStart(5)}%  of ${String(p.st).padStart(6)} steps` +
                `   (chance ${p.fl.toFixed(1)}%)   ${p.pp > 3 * p.fl && p.pp > 3
                  ? (isDouble ? '<- the DELIBERATE octave double, not a defect' : '<- WELL above chance') : ''}`);
  }
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
/* ══ AND WHERE THE SECOND VOICE STRIKES ═════════════════════════════════════
   A `line` counter derives its pitches from the tune's notes, so without a rule
   about TIME it strikes on every one of them and the two parts are one part
   with two pitches. `counter.answer` is the declared share that steps off the
   onset, and it was declared and not delivered: measured at answer 0.7, 62% of
   counter notes still attacked on the same step as a lead attack, because the
   displacement moved them one step past the end of the lead note and a legato
   tune's next note begins exactly there.

   THE TWO CASES ARE NOT THE SAME. A counter note sounding while the lead HOLDS
   is two independent lines and is the point. A counter note striking ON the
   lead's attack is a chord, whatever pitch it takes. So this counts onsets
   against onsets and asks only about the strike. */
console.log('\n  ── WHERE THE SECOND VOICE STRIKES, against the tune\'s attacks:\n');
for(const g of genres){
  const tbl = M.composeSong(1, 'draw', g).chart.table;
  if(!tbl || !tbl.counter || tbl.counter.style === 'double') continue;
  const want = tbl.counter.answer || 0;
  let hit = 0, ring = 0, free = 0;
  for(let s = 1; s <= SEEDS; s++){
    const song = M.composeSong(s, 'draw', g);
    for(const nm of Object.keys(song.materials)){
      const A = song.materials[nm];
      if(!A || typeof A !== 'object' || Array.isArray(A)) continue;
      const L = A.lead, C = A.counter;
      if(!Array.isArray(L) || !Array.isArray(C) || !L.length || !C.length) continue;
      const att = new Set(), sus = new Set();
      for(const n of L){
        if(n.pitch == null) continue;
        att.add(n.bar * 16 + n.step);
        for(let d = 1; d < Math.max(1, n.dur || 1); d++) sus.add(n.bar * 16 + n.step + d);
      }
      for(const c of C){
        if(c.pitch == null) continue;
        const k = c.bar * 16 + c.step;
        if(att.has(k)) hit++; else if(sus.has(k)) ring++; else free++;
      }
    }
  }
  const tot = hit + ring + free;
  if(!tot){ console.log(`     ${g}: the counter writes no notes`); continue; }
  const share = hit / tot;
  console.log(`     ${g} (counter.answer ${want}): ${tot} notes — ` +
              `${(100*hit/tot).toFixed(0)}% on a lead ATTACK, ` +
              `${(100*ring/tot).toFixed(0)}% under a SUSTAIN, ` +
              `${(100*free/tot).toFixed(0)}% in SILENCE`);
  /* the declaration is the budget: a genre asking for `answer` 0.9 may not
     leave more than about (1 - 0.9) of its notes welded, with a little room
     for the bars that genuinely offer nowhere to go. */
  const ceiling = Math.min(1, (1 - want) + 0.15);
  if(share > ceiling){
    console.log(`       ✗ FAIL: declared answer ${want} allows at most ` +
                `${(100*ceiling).toFixed(0)}% struck with the tune, measured ${(100*share).toFixed(0)}%`);
    FAULTS++;
  } else {
    console.log(`       ✓ within what the declaration allows (ceiling ${(100*ceiling).toFixed(0)}%)`);
  }
}

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
  console.log('       Whether that is wanted is an TASTE question; it is recorded, not judged.');
}
if(!checked) console.log('     no genre currently declares counter.style "double" — control could not run.');
console.log('');

console.log('  ' + FAULTS + ' counterpoint fault(s)\n');
process.exit(FAULTS ? 1 : 0);
