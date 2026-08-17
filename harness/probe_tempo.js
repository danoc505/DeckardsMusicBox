#!/usr/bin/env node
/* PROBE_TEMPO — DOES THE RECORD ACTUALLY SPEED UP AND SLOW DOWN?

     node harness/probe_tempo.js [seeds] [file.html]

   Tempo was ONE NUMBER for a whole record. Every bars-to-seconds arithmetic in
   the program multiplied by `chart.tempo`, in nineteen hand-written copies in
   the performance stage alone, so a record could not accelerate out of a stop
   or brake into one — and adding that would have meant finding all nineteen.

   The clock owns that arithmetic now, and a genre may declare an arc:

       form.tempoArc: { by: { <section fn>: [start mult, end mult] }, ease }

   NOBODY DECLARES ONE YET, which is exactly why this file exists. A capability
   nothing switches on is a capability nobody has seen work, and the last time
   this repo shipped an untested one it shipped a silent instrument with a green
   battery behind it. So this probe DECLARES an arc itself, on a genre that has
   none, composes, and measures what came out — then takes it away and proves
   the record went back to the note it was on before.

   FIVE CLAIMS:

     INERT      with no arc declared, `form.tempo` is null and every event lands
                on exactly the second it landed on before — not "about", the
                same double. This is the one that matters most: the clock is a
                refactor of nineteen multiplications and it may not move a note.
     VARIES     with an arc declared, every record's map moves from bar to bar.
                The printed ratios are AFTER normalisation, so they are wider
                than the declared pair rather than equal to it — the multipliers
                are relative and the mean is pinned, which is the next claim
     RAMPS      the tempo moves GRADUALLY across the arc's section rather than
                stepping — a ramp is the thing being built, a step is what the
                program could already do by drawing a different number
     LENGTH     the record is the same length with the arc as without it, to
                within a step. An arc redistributes time; it does not add any,
                which is what keeps the length dial honest.
     NOTES MOVE and the notes actually followed it: a bar the map slows down
                takes longer to play than the same bar did without the arc.

   The arc is applied to whatever section function the genre uses most, so this
   names no genre and no section [Law 4] and keeps working when a table is
   rewritten. It writes to the live GENRE table and puts it back. */
const fs = require("fs");
const path = require("path");
const HTML = process.argv[3] || path.resolve(__dirname, "..", "Boxcar Synth.html");
const SEEDS = parseInt(process.argv[2], 10) || 12;
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

let faults = 0;
const say = (ok, label, detail) => {
  console.log("     " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};

/* THE ARC THIS PROBE DECLARES. Steep on purpose — a real genre's would be
   gentler, and a gentle one is harder to tell from arithmetic noise. */
const LO = 0.55, HI = 1.25;

console.log("\n=== THE TEMPO MAP — " + SEEDS + " seeds a genre\n");

for(const g of M.genres()){
  const G = M.GENRE[g];
  if(!G || !G.form) continue;
  /* A GENRE THAT DECLARES A RIDE IS NOT INERT AND MUST NOT BE ASKED TO BE.
     Its tempo map comes from where the train is, per bar, and `journeyTempo`
     owns it — so `form.tempoArc` is not the mechanism under test there and
     the arc this probe declares would be ignored. `probe_journey` checks that
     genre's pace instead, against the thing that actually decides it. */
  if(G.form.ride){ console.log("  " + g + "\n     — declares a ride; its pace is probe_journey's"); continue; }

  /* ── 1. INERT: nothing declared, nothing moved ────────────────────────────
     Compared against the arithmetic the clock replaced, recomputed here from
     the chart rather than read from the program — a check that asked the
     program for both halves would be comparing a number with itself. */
  const STEPS = M.stepsOf(G), PB = M.perBeatOf(G);
  let inert = 0, inertBad = null, nullMap = true;
  const BEFORE = {};
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    if(song.form.tempo != null) nullMap = false;
    const spb = (60 / song.chart.tempo) / PB;
    const ev = song.perf.events.filter(e => e.pitch != null);
    BEFORE[s] = ev.map(e => e.tSec);
    /* the clock's own answer for a bar, against the multiplication */
    const C = M.makeClock(song.chart, song.form);
    for(let b = 0; b <= song.form.nBars; b++){
      const want = b * STEPS * spb;
      if(C.at(b, 0) !== want){ inertBad = g + " seed " + s + " bar " + b; break; }
    }
    if(inertBad) break;
    inert += ev.length;
  }
  if(!Object.keys(BEFORE).length) continue;

  console.log("  " + g);
  say(nullMap && !inertBad, "no arc declared, so the clock is the multiplication it replaced",
      inertBad ? "differs at " + inertBad
               : nullMap ? inert + " notes, every bar boundary bit-identical"
                         : "a map exists with no arc declared");

  /* ── 2. NOW DECLARE ONE, on the function this genre uses most ─────────────*/
  const seen = {};
  for(let s = 1; s <= SEEDS; s++){
    let song; try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    for(const sec of song.form) seen[sec.fn] = (seen[sec.fn] || 0) + 1;
  }
  const FN = Object.keys(seen).sort((a, z) => seen[z] - seen[a])[0];
  const kept = G.form.tempoArc;
  G.form.tempoArc = { by: { [FN]: [LO, HI] }, ease: "cos" };

  let varies = 0, steps = 0, ramps = 0, worstLen = 0, slower = 0, faster = 0, n = 0;
  let range = [Infinity, -Infinity];
  try {
    for(let s = 1; s <= SEEDS; s++){
      let song; try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
      const map = song.form.tempo;
      if(!map){ continue; }
      n++;
      const base = song.chart.tempo;
      let lo = Infinity, hi = -Infinity;
      for(const t of map){ if(t < lo) lo = t; if(t > hi) hi = t; }
      if(hi - lo > 1e-6) varies++;
      range = [Math.min(range[0], lo / base), Math.max(range[1], hi / base)];
      /* A RAMP, NOT A STEP: inside the declared function, consecutive bars
         differ by a little and the whole span differs by a lot. Measured on
         the longest instance of the function so a two-bar section cannot make
         a step look like a ramp. */
      const inst = song.form.filter(x => x.fn === FN)
                            .sort((a, z) => (z.endBar - z.startBar) - (a.endBar - a.startBar))[0];
      if(inst && inst.endBar - inst.startBar >= 4){
        let biggest = 0;
        for(let b = inst.startBar + 1; b < inst.endBar; b++)
          biggest = Math.max(biggest, Math.abs(map[b] - map[b - 1]));
        const across = Math.abs(map[inst.endBar - 1] - map[inst.startBar]);
        if(across > 4 * biggest) ramps++; else steps++;
      }
      /* LENGTH: the arc redistributes, it does not add */
      const C = M.makeClock(song.chart, song.form);
      const flat = song.form.nBars * STEPS * (60 / base) / PB;
      worstLen = Math.max(worstLen, Math.abs(C.at(song.form.nBars, 0) - flat));
      /* NOTES MOVED, and in the direction the map says. The bar whose tempo is
         lowest must take longer than a flat bar; the highest, shorter. */
      let bLo = 0, bHi = 0;
      for(let b = 0; b < map.length; b++){ if(map[b] < map[bLo]) bLo = b; if(map[b] > map[bHi]) bHi = b; }
      const flatBar = STEPS * (60 / base) / PB;
      if(C.barSec(bLo) > flatBar + 1e-9) slower++;
      if(C.barSec(bHi) < flatBar - 1e-9) faster++;
    }
  } finally {
    if(kept === undefined) delete G.form.tempoArc; else G.form.tempoArc = kept;
  }

  say(n > 0 && varies === n, "a declared arc gives every record a per-bar tempo that moves",
      varies + "/" + n + " on `" + FN + "`, " +
      (isFinite(range[0]) ? range[0].toFixed(2) + "x .. " + range[1].toFixed(2) + "x of the drawn tempo"
                          : "no map"));
  say(steps === 0 && ramps > 0, "and it RAMPS across the section rather than stepping into it",
      ramps + " ramped, " + steps + " stepped");
  say(worstLen < 1.0, "the record is the same length with the arc as without it",
      "worst difference " + worstLen.toFixed(3) + " s over the whole record");
  say(n > 0 && slower === n && faster === n, "and the bars themselves take the time the map says",
      slower + "/" + n + " slowest bar longer, " + faster + "/" + n + " fastest bar shorter");

  /* ── 3. AND PUT IT BACK: every note where it was ──────────────────────────*/
  let back = true, bad = null;
  for(let s = 1; s <= SEEDS; s++){
    let song; try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    const now = song.perf.events.filter(e => e.pitch != null).map(e => e.tSec);
    const was = BEFORE[s];
    if(!was) continue;
    if(now.length !== was.length){ back = false; bad = "seed " + s + ": " + was.length + " -> " + now.length; break; }
    for(let i = 0; i < now.length; i++)
      if(now[i] !== was[i]){ back = false; bad = "seed " + s + " note " + i; break; }
    if(!back) break;
  }
  say(back, "and with the arc removed every note is back on its own second",
      bad || "identical across " + Object.keys(BEFORE).length + " seeds");
}

console.log("\n  " + faults + " tempo fault(s)\n");
process.exit(faults ? 1 : 0);
