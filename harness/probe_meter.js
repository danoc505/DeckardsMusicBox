#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE METRE — is the bar the length the genre says it is?

       node harness/probe_meter.js [songs]

   `docs/genre-research/lotr-themes-measured.md` §5.2, written when the
   transcriptions were finally read off the notation and then not acted on for
   two builds:

     "TWO OF THE FOUR ARE NOT IN 4/4. The Shire is 3/4 and Rohan is a 6/8 jig.
      The program's grid is sixteen steps to a bar -- a four-beat assumption
      baked so deep that 'the meter is 3' is not currently expressible."

   It was not one assumption. It was about fifty: `bar * 16 + step` is how every
   builder addresses the grid, `% 16` is how each one wraps it, `240 / tempo` is
   four-times-sixty in disguise, and `(60 / tempo) / 4` is "four sixteenths to a
   beat", which is true in every simple metre and false in every compound one.

   ── WHAT THIS CHECKS, AND WHY EACH ONE IS HERE ──────────────────────────────

     TABLES     every hierarchy row is as long as its metre's own bar, and its
                depths obey Lerdahl & Jackendoff's MWFR 4 -- strong beats two or
                three apart, never four
     THE JIG    6/8 does not read as three-in-a-bar. This is its own check
                because it is the single most likely way to get compound metre
                wrong, and the research says so in as many words: "If a 6/8
                table ever reads 1 at steps 4 and 8, the program is playing a
                waltz and calling it a jig."
     BITE       `METRE(0, m)` is flat for every metre and `METRE(1, m)` floors
                at zero for every metre. The second is the bug the research
                found before any ear did: the divisor was a hardcoded 4 while
                four of the six tables top out at 3, so the same declared
                number meant a different amount of accent in a different metre.
     REACH      the declaration actually reaches the music -- no composed note
                sits on a step its own metre does not have, and every accent
                row a genre declares is its bar's length
     CLOCK      bars and seconds agree in both directions, at the metre's own
                beat rate

   A GENRE THAT DECLARES NOTHING IS IN 4/4 AND MUST BE UNTOUCHED. That is the
   whole safety argument for this change and it is checked here rather than
   hoped for: nine genres declare no metre, and if any of them moves, the
   default is not a default.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 12;
const bad = [];
const note = (kind, what) => bad.push(`${kind.padEnd(7)} ${what}`);

/* ── TABLES ──────────────────────────────────────────────────────────────── */
for(const m in M.METRE_GRID){
  const d = M.METRE_DEPTH[m], g = M.METRE_GRID[m];
  if(!d){ note("TABLES", `${m} has a grid and no hierarchy`); continue; }
  if(d.length !== g.steps)
    note("TABLES", `${m} hierarchy is ${d.length} steps, its bar is ${g.steps}`);
  if(d[0] !== 0) note("TABLES", `${m} does not put its strongest weight on the downbeat`);
  if(g.steps % g.beats) note("TABLES", `${m}: ${g.steps} steps do not divide into ${g.beats} beats`);
  /* MWFR 4 -- "at each metrical level, strong beats are spaced two or three
     beats apart" (Lerdahl & Jackendoff 1983, 69). Read off the depths: at every
     level above the fastest, the gaps between consecutive beats of that level
     must all be equal and the level must divide the one below it by 2 or 3. */
  const maxD = Math.max.apply(null, d);
  for(let lvl = 0; lvl < maxD; lvl++){
    const at = [];
    for(let i = 0; i < d.length; i++) if(d[i] <= lvl) at.push(i);
    if(at.length < 2) continue;
    const gaps = new Set();
    for(let i = 1; i < at.length; i++) gaps.add(at[i] - at[i - 1]);
    gaps.add(d.length - at[at.length - 1] + at[0]);      // wrap to the next bar
    if(gaps.size !== 1)
      note("TABLES", `${m} level ${lvl} is unevenly spaced (${[...gaps].join("/")})`);
  }
}

/* ── THE JIG ─────────────────────────────────────────────────────────────── */
{
  const six = M.METRE_DEPTH["6/8"], three = M.METRE_DEPTH["3/4"];
  if(six && three){
    /* the beat level is depth 1: 6/8 has two of them, 3/4 has three */
    const beatsAt = d => d.map((x, i) => x <= 1 ? i : -1).filter(i => i >= 0);
    const s = beatsAt(six), t = beatsAt(three);
    if(s.join(",") !== "0,6")
      note("JIG", `6/8 puts its beats at ${s.join(",")} -- a jig has two, at 0 and 6`);
    if(t.join(",") !== "0,4,8")
      note("JIG", `3/4 puts its beats at ${t.join(",")} -- a waltz has three, at 0, 4 and 8`);
    if(six[4] <= 1 || six[8] <= 1)
      note("JIG", "6/8 reads a beat at step 4 or 8 -- that is a waltz calling itself a jig");
    /* Palmer & Krumhansl 1990 measured that the four-step periodicity does not
       appear in 6/8 at all. The tables must differ, and only here. */
    const diff = six.map((x, i) => x === three[i] ? null : i).filter(i => i != null);
    if(diff.join(",") !== "4,6,8")
      note("JIG", `6/8 and 3/4 differ at steps ${diff.join(",")}; they should differ at 4, 6 and 8 only`);
  }
}

/* ── BITE ────────────────────────────────────────────────────────────────── */
for(const m in M.METRE_DEPTH){
  const flat = M.METRE(0, m);
  if(flat.some(x => x !== 1)) note("BITE", `${m}: bite 0 is not flat`);
  const full = M.METRE(1, m);
  if(Math.min.apply(null, full) !== 0)
    note("BITE", `${m}: bite 1 floors at ${Math.min.apply(null, full)}, not 0 ` +
                 `-- the divisor is not this metre's own maximum depth`);
  if(full[0] !== 1) note("BITE", `${m}: bite 1 does not leave the downbeat at 1`);
}

/* ── REACH and CLOCK ─────────────────────────────────────────────────────── */
const seen = {};
for(const genre of M.genres()){
  const t = M.composeSong(1, null, genre).chart.table;
  const m = M.metreOf(t), steps = M.stepsOf(t), beats = M.beatsOf(t);
  seen[genre] = m;
  if(t.accent) for(const lane in t.accent){
    const row = t.accent[lane];
    if(Array.isArray(row) && row.length !== steps)
      note("REACH", `${genre} accent.${lane} is ${row.length} long, its ${m} bar is ${steps}`);
  }
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, null, genre);
    for(const k in song.materials){
      const mat = song.materials[k];
      if(!mat || typeof mat !== "object") continue;
      for(const role in mat){
        if(!Array.isArray(mat[role])) continue;
        for(const n of mat[role])
          if(n && n.step != null && (n.step < 0 || n.step >= steps)){
            note("REACH", `${genre} seed ${s} ${k}.${role}: step ${n.step} outside a ${m} bar (0-${steps - 1})`);
            s = N + 1; break;
          }
      }
    }
    /* the clock: a bar of this record, measured two ways */
    const spb = (60 / song.chart.tempo) / (steps / beats);
    const want = beats * 60 / song.chart.tempo;
    if(Math.abs(spb * steps - want) > 1e-9)
      note("CLOCK", `${genre}: a bar is ${(spb * steps).toFixed(4)}s by the grid and ${want.toFixed(4)}s by the beat`);
  }
}

const metres = {};
for(const g in seen) (metres[seen[g]] = metres[seen[g]] || []).push(g);

console.log(`\n  ${M.genres().length} genres x ${N} songs\n`);
for(const m of Object.keys(metres).sort())
  console.log(`    ${m.padEnd(5)} ${String(M.METRE_GRID[m].steps).padStart(2)} steps, ` +
              `${M.METRE_GRID[m].beats} beats   ${metres[m].join(" ")}`);
console.log("");
if(!bad.length){
  console.log("  every bar is the length its genre says it is.\n");
} else {
  for(const b of bad.slice(0, 24)) console.log("    " + b);
  if(bad.length > 24) console.log(`    ... and ${bad.length - 24} more`);
  console.log(`\n  ${bad.length} metre fault(s).\n`);
  process.exitCode = 1;
}
