#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   REACHABLE — does every name the config mentions ever actually happen?

       node harness/probe_reachable.js [songs]

   Asked, and it is the right question rather than a complaint: "why is that
   even a thing, what is wrong fundamentally that we are writing things for
   things that do not exist and worse yet things we then ignore and fail to
   build if they are needed?"

   THE ANSWER IS THAT NOTHING IN THIS PROGRAM EVER RECONCILED A DECLARATION
   WITH ITS OWN REACHABILITY. Writing a table entry is cheap and looks like the
   work; making the entry reachable and then proving it fires is the work. Every
   defect of this family lived in that gap, and every one was found late, one at
   a time, by ear or by a probe built for something else:

     the bridge          declared in `lengths`, offered in `transitions`, given
                         a whole third theme, nineteen automation lanes and its
                         own harmony -- and unreachable in 40 of 40 records for
                         THREE independent reasons at once
     the ladder rungs    ordered smallest to largest, two of them never sounding
     the machine pools   fifteen weighted rows that never won a lane
     the rack            naming a box the record never played
     `ev.tied`           computed in stage 5, carried to stage 6, dropped

   So this is the general form of all of them, and it is deliberately blunt: A
   NAME THE CONFIG MENTIONS MUST HAPPEN. It does not care what the name means.
   Four sweeps, all per genre, all over real composed records:

     SECTIONS   every section in `form.lengths`, every `to` in
                `form.transitions` with a weight above zero, and every entry of
                every `plan` pool must occur in the genre's records
     AUTOMATION every section key inside any `by: {...}` block in `motion` or
                `matrixDraw` must be a section that occurs
     LADDER     every rung of every `ladder` slot must be played
     POOLS      every row of `machines[slot]` must win that slot at least once,
                unless the slot is laddered (a ladder outranks the pool, and
                that is stated where the pool is)

   A finding here is not a style note. It means the file says a thing exists and
   the music says it does not, and one of the two has to change.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 40;

/* Every section name mentioned in a `by: {...}` block -- and ONLY from blocks
   that are keyed by section. `kind: "section"` reads `by[secFn]`; `kind:
   "phrase"` reads the DRUM PHRASE letter A/B/C/D, a different namespace that
   happens to have the identical shape. The first run of this probe reported
   nine dead sections called "B", "C" and "D" because it could not tell them
   apart, which is the same conflation it exists to catch. */
function byKeys(node, out){
  if(!node || typeof node !== "object") return out;
  if(Array.isArray(node)){ for(const x of node) byKeys(x, out); return out; }
  if(node.kind === "section" && node.by && typeof node.by === "object")
    for(const s in node.by) out.add(s);
  for(const k in node) byKeys(node[k], out);
  return out;
}

const findings = [], unsampled = [];
function dead(genre, kind, what, detail){ findings.push({ genre, kind, what, detail }); }

for(const genre of M.genres()){
  const seenFn = new Set(), rungSeen = {}, pickSeen = {};
  let table = null;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, null, genre);
    table = song.chart.table;
    for(const sec of song.sections){
      seenFn.add(sec.fn);
      if(sec.machines) for(const slot in sec.machines)
        (rungSeen[slot] = rungSeen[slot] || new Set()).add(sec.machines[slot]);
    }
    for(const slot of ["drums", "bass", "keys", "lead", "keys2"])
      (pickSeen[slot] = pickSeen[slot] || new Set()).add(song.chart.picks[slot]);
  }
  const F = table.form || {};

  /* ── SECTIONS ─────────────────────────────────────────────────────────── */
  const named = new Set();
  for(const fn in (F.lengths || {})) named.add(fn);
  for(const cur in (F.transitions || {}))
    for(const [to, w] of F.transitions[cur]) if(w > 0) named.add(to);
  for(const ph of (F.plan || [])) for(const fn of (ph.pool || [])) named.add(fn);
  for(const fn of named)
    if(!seenFn.has(fn)) dead(genre, "SECTION", fn, "named in form, never occurs");

  /* ── AUTOMATION ───────────────────────────────────────────────────────── */
  const keys = byKeys(table.motion || {}, byKeys(table.matrixDraw || {}, new Set()));
  for(const fn of keys)
    if(!seenFn.has(fn)) dead(genre, "AUTOMATION", fn, "a lane moves on a section that never occurs");

  /* ── LADDER ───────────────────────────────────────────────────────────── */
  for(const slot in (table.ladder || {})){
    const rung = table.ladder[slot];
    if(!Array.isArray(rung) || rung.length < 2) continue;
    for(const m of rung)
      if(!(rungSeen[slot] && rungSeen[slot].has(m)))
        dead(genre, "LADDER", `${slot}:${m}`, "a rung that never plays");
  }

  /* ── POOLS ────────────────────────────────────────────────────────────────
     AND A RARE ROW IS NOT A DEAD ROW. The first run of this called dungeon
     synth's `keys2:erangHarp` dead on 40 songs; over 400 it wins 26 times, and
     its first win is at SEED 104. A probe that cannot tell "never happens"
     from "did not happen this time" manufactures exactly the false certainty
     this file keeps being burned by.

     THE THRESHOLD IS 12 EXPECTED, NOT 3, AND THE REASON IS MULTIPLE
     COMPARISONS. At 3 expected a live row still reads zero 5% of the time; the
     battery checks roughly fifty rows, so a threshold of 3 raises a false
     failure on about one run in six. A check that cries wolf that often is
     worse than no check, because the response to it becomes "run it again".
     At 12 expected a live row reads zero about six times in a million, which
     across fifty rows is a false failure in one run in three thousand.

     The cost is honest and stated: rows thinner than 12 expected are NOT
     proven either way here. They print under UNSAMPLED so the thinness is
     visible rather than silent, and `probe_reachable.js 400` settles them.

     AND THE SEED-104 DRY SPELL IS NOT A BUG, which I checked before writing it
     off. The rack stream's first four draws are uniform by decile over seeds
     1-100 and over seeds 301-400, so the generator is fine. The dry spell is a
     POST-HOC pick: about a hundred row-and-slot combinations were scanned and
     the unluckiest one reported, which is exactly the shape that makes a
     one-in-a-thousand run look like evidence. It is not. */
  for(const slot in (table.machines || {})){
    if(table.ladder && table.ladder[slot]) continue;      // a ladder outranks the pool
    const pool = table.machines[slot];
    if(!Array.isArray(pool) || pool.length < 2) continue;
    const sum = pool.reduce((a, [, w]) => a + w, 0);
    for(const [m, w] of pool){
      if(pickSeen[slot] && pickSeen[slot].has(m)) continue;
      const expect = N * w / sum;
      if(expect >= 12) dead(genre, "POOL", `${slot}:${m}`,
        `a weighted row that never wins (expected ${expect.toFixed(1)} in ${N})`);
      else unsampled.push(`${genre} ${slot}:${m} — weight ${w}/${sum}, expected only ${expect.toFixed(1)} in ${N} songs`);
    }
  }
}

console.log(`\n  ${M.genres().length} genres x ${N} songs\n`);
if(!findings.length){
  console.log("  every name the config mentions happens.\n");
} else {
  const byGenre = {};
  for(const f of findings) (byGenre[f.genre] = byGenre[f.genre] || []).push(f);
  for(const g of Object.keys(byGenre)){
    console.log(`  ${g}`);
    for(const f of byGenre[g])
      console.log(`    ${f.kind.padEnd(11)} ${String(f.what).padEnd(26)} ${f.detail}`);
    console.log("");
  }
  console.log(`  ${findings.length} declaration(s) the music never reaches.`);
  console.log("  The file says these exist. The music says they do not.\n");
  process.exitCode = 1;
}
if(unsampled.length){
  console.log("  UNSAMPLED — too rare for this run to prove either way. Raise N.\n");
  for(const u of unsampled) console.log(`    ${u}`);
  console.log("");
}
