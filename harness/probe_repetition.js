#!/usr/bin/env node
/* PROBE_REPETITION — WHAT ACTUALLY COMES BACK, AND DOES THE RECORD BUILD

     node harness/probe_repetition.js [genre ...] [--seeds N]
     node harness/probe_repetition.js --all [--seeds N]

   WHY THIS EXISTS, AND IT IS A CORRECTION OF `probe_static.js`.

   The owner listened to boxcar synth at build `2026-08-16a` and reported four
   things at once: the harmony never moves, THE SAME LOOP KEEPS RETURNING, it
   does not build to anything, and the town does not feel like arriving.

   `probe_static.js` was asked the second question and answered the opposite —
   "123.8 distinct pictures in 178 bars", "longest unchanging run 1.0 bars".
   That reading is worthless, and the reason is worth writing down because it
   is a whole class of measurement error:

       ITS "PICTURE" INCLUDES THE CAST.

   `cast + material + loopBar + cycle%2 + degree`, where `cast` is the set of
   roles sounding in the bar. On a record whose parts thin, rest and drop by
   design, the cast changes almost every bar — so a four-bar cell played
   forty-two times reports as a hundred and twenty-four different bars. It was
   measuring INSTRUMENTATION CHURN and reporting it as musical variety. The
   ear was right and the probe was answering a different question.

   So this one never looks at the cast. It asks each part, on its own:

     THE CELL           `materials.bars` and how many times it goes round in
                        the record. This is the ceiling on everything below —
                        a four-bar cell in a 168-bar record is 42 repetitions,
                        and no amount of dropout changes that number.
     PER-ROLE BARS      for each role, the bar's note content hashed as
                        (pitch, step-within-bar) over its ONSETS, with gain and
                        duration deliberately excluded — those are performance
                        nuance, not different music. Distinct / sounding, the
                        commonest bar's share, and the longest identical run.
     THE VOCABULARY     how many DISTINCT chords the whole record contains,
                        across every material it holds — the main changes, the
                        chorus's, the bridge's and the key-lifted copy's.
     THE ARC            the declared `section.energy` curve against the
                        MEASURED density and level per section. A record that
                        declares an arc and plays a flat one is the "it does
                        not build" complaint, and the two columns are the only
                        way to tell a missing arc from an ignored one.

   Read against a reference genre, always. A number like "8 distinct bars" is
   meaningless until dungeon synth's is beside it. */

const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
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
const GENRES = argv.includes("--all") ? M.genres()
             : (argv.filter(a => !a.startsWith("--")).length
                 ? argv.filter(a => !a.startsWith("--"))
                 : ["boxcarsynth", "dungeonsynth", "lofi"]);

/* the parts that CARRY the loop. Drums and tape are excluded from the headline
   because a kit repeating is not the complaint, and `drone`/`scene`/`weather`
   hold one event for minutes at a time so a per-bar reading of them says
   nothing. Everything pitched is still reported in the per-role table. */
const PITCHED = ["bass", "keys", "keys2", "ostinato", "lead", "counter"];
const CORE    = ["ostinato", "keys", "bass"];   /* the ground the ear learns */

const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const f1 = x => x.toFixed(1);

/* ── one record ─────────────────────────────────────────────────────────── */
function readSong(song){
  const spb = (60 / song.chart.tempo) / 4;        /* seconds per 16th step */
  const STEPS = 16, barSec = STEPS * spb;
  const nBars = song.form.nBars;

  /* a bar's content, per role, from ONSETS. A note belongs to the bar it
     starts in — that is what "what is played here" means, and counting held
     notes into every bar they cross (which `probe_static` had to do for its
     own question) would make a whole-note pedal look like fresh material in
     every bar it sustains through. */
  const bars = {};                                 /* role -> [ hash | null ] */
  for(const r of PITCHED) bars[r] = new Array(nBars).fill(null);
  const cells = {};
  for(const e of song.perf.events){
    if(e.pitch == null || !bars[e.role]) continue;
    const b = Math.floor(e.tSec / barSec);
    if(b < 0 || b >= nBars) continue;
    const step = Math.round((e.tSec - b * barSec) / spb);
    (cells[e.role + "|" + b] || (cells[e.role + "|" + b] = [])).push(step + ":" + e.pitch);
  }
  for(const k of Object.keys(cells)){
    const [r, b] = k.split("|");
    bars[r][+b] = cells[k].sort().join(",");
  }

  /* per role: distinct, top share, longest identical run */
  const roleRows = {};
  for(const r of PITCHED){
    const seq = bars[r];
    const live = seq.filter(x => x !== null);
    const seen = new Map();
    for(const h of live) seen.set(h, (seen.get(h) || 0) + 1);
    let run = 0, worst = 0;
    for(let i = 0; i < seq.length; i++){
      if(seq[i] !== null && i > 0 && seq[i] === seq[i - 1]) run++; else run = seq[i] !== null ? 1 : 0;
      if(run > worst) worst = run;
    }
    let top = 0; for(const v of seen.values()) if(v > top) top = v;
    roleRows[r] = { sounding: live.length, distinct: seen.size,
                    topShare: live.length ? top / live.length : 0, run: worst };
  }

  /* the CORE ground taken together — the thing the ear actually learns */
  const coreSeq = [];
  for(let i = 0; i < nBars; i++){
    const h = CORE.map(r => bars[r][i] || "-").join("/");
    if(h !== CORE.map(() => "-").join("/")) coreSeq.push(h);
  }
  const coreSeen = new Set(coreSeq);

  /* the harmonic vocabulary of the WHOLE record, every material it holds.
     A chord is its scale degree in its own key — two chords are the same
     chord only if they are the same degree of the same key. */
  const chordSets = [song.materials.chords, song.materials.chorusChords,
                     song.materials.bridgeChords, song.materials.liftChords];
  if(song.materials.chordsOf)
    for(const k of Object.keys(song.materials.chordsOf)) chordSets.push(song.materials.chordsOf[k]);
  const chordVocab = new Set(), mainVocab = new Set();
  for(const set of chordSets)
    if(Array.isArray(set)) for(const c of set) if(c) chordVocab.add(c.key + ":" + c.degree + ":" + c.mode);
  for(const c of (song.materials.chords || [])) if(c) mainVocab.add(c.key + ":" + c.degree + ":" + c.mode);

  /* THE ARC: declared against measured, per section */
  const arc = [];
  for(const sec of song.sections){
    const t0 = sec.startBar * barSec, t1 = sec.endBar * barSec;
    const inSec = song.perf.events.filter(e => e.tSec >= t0 && e.tSec < t1);
    const pitched = inSec.filter(e => e.pitch != null && PITCHED.includes(e.role));
    const nb = Math.max(1, sec.endBar - sec.startBar);
    arc.push({
      fn: sec.fn, material: sec.material, bars: nb,
      energy: sec.energy != null ? sec.energy : 0,
      notesPerBar: pitched.length / nb,
      level: mean(inSec.filter(e => e.gain != null).map(e => e.gain)),
      roles: new Set(inSec.map(e => e.role)).size,
    });
  }

  return {
    nBars, cellBars: song.materials.bars,
    cycles: song.materials.bars ? nBars / song.materials.bars : 0,
    roleRows, coreSounding: coreSeq.length, coreDistinct: coreSeen.size,
    chordVocab: chordVocab.size, mainVocab: mainVocab.size,
    chorusMoves: song.materials.chorusChords !== song.materials.chords,
    lifted: !!(song.materials.lift && song.materials.Alift),
    arc,
  };
}

/* ── report ─────────────────────────────────────────────────────────────── */
console.log(`\n=== WHAT COMES BACK — ${N} seeds a genre ===`);
console.log(`(cast is deliberately ignored; see the header for why probe_static disagrees)`);

const arcsFor = {};
for(const g of GENRES){
  const rows = [];
  for(let s = 1; s <= N; s++) rows.push(readSong(M.composeSong(s, "draw", g)));
  arcsFor[g] = rows[0].arc;

  console.log(`\n\n  ${g.toUpperCase()}\n`);
  console.log(`  THE CELL        ${f1(mean(rows.map(r => r.cellBars)))} bars long,` +
              ` in a ${f1(mean(rows.map(r => r.nBars)))}-bar record` +
              `  =  ${f1(mean(rows.map(r => r.cycles)))} TIMES ROUND`);
  console.log(`  THE GROUND      ${f1(mean(rows.map(r => r.coreDistinct)))} distinct bars` +
              ` of ${f1(mean(rows.map(r => r.coreSounding)))} sounding` +
              `   (${CORE.join("+")} taken together)`);
  console.log(`  THE HARMONY     ${f1(mean(rows.map(r => r.mainVocab)))} distinct chords in the main changes,` +
              ` ${f1(mean(rows.map(r => r.chordVocab)))} in the WHOLE record`);
  console.log(`  chorus has its own changes  ${rows.filter(r => r.chorusMoves).length}/${rows.length}` +
              `   ·   key lift built  ${rows.filter(r => r.lifted).length}/${rows.length}`);

  /* HEARD is the headline. distinct bars is an abstraction; "every bar of this
     part is played seven times" is the complaint said back in numbers. */
  console.log(`\n    role        sounding   distinct   EACH HEARD   commonest bar   longest run`);
  for(const r of PITCHED){
    const rr = rows.map(x => x.roleRows[r]);
    const sounding = mean(rr.map(x => x.sounding));
    if(sounding < 0.5){ console.log(`    ${r.padEnd(12)}  (never sounds)`); continue; }
    const distinct = mean(rr.map(x => x.distinct));
    console.log(`    ${r.padEnd(12)}${f1(sounding).padStart(7)}` +
                `${f1(distinct).padStart(11)}` +
                `${(distinct ? "x" + f1(sounding / distinct) : "-").padStart(13)}` +
                `${(mean(rr.map(x => x.topShare)) * 100).toFixed(0).padStart(13)}%` +
                `${f1(mean(rr.map(x => x.run))).padStart(14)}`);
  }
}

/* the arc, printed for ONE seed so the shape is readable rather than averaged
   into a straight line — an average over 24 different forms IS flat, which
   would be the measurement making the complaint look true by construction */
for(const g of GENRES){
  console.log(`\n\n  DOES IT BUILD — ${g}, seed 1, declared energy against what was played\n`);
  console.log(`    section        bars   declared   notes/bar   mean level   roles`);
  for(const a of arcsFor[g])
    console.log(`    ${(a.fn + "[" + a.material + "]").padEnd(15)}${String(a.bars).padStart(4)}` +
                `${a.energy.toFixed(2).padStart(11)}${f1(a.notesPerBar).padStart(12)}` +
                `${a.level.toFixed(3).padStart(13)}${String(a.roles).padStart(8)}`);
}
console.log("");
