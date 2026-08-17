#!/usr/bin/env node
/* HOW THE COMP IS VOICED — read off the notes, per genre.
     node harness/probe_comp.js [seeds]

   Asked for directly: the chords should be "chords in which the notes start at
   different times with an inner melody that is repeated with slight
   alterations", against a reference photograph of a BAD comp beside a GOOD one.
   The bad one is few long notes with every voice changing together at the bar
   line. The good one is many shorter notes, voices re-articulating at different
   offsets, and an inner line moving while the outer voices hold.

   Those are measurable, so they are measured rather than admired:

     SIMULTANEOUS  share of comp notes that begin at an instant where another
                   comp note also begins. A block chord is 100%. A rolled or
                   staggered voicing is well under it.
     ONSETS/BAR    how many distinct instants the comp speaks at.
     VOICES/ONSET  how many notes arrive together when it does speak.
     INNER MOVE    share of consecutive onsets INSIDE a bar where at least one
                   voice changes pitch while another holds. This is the "inner
                   melody" number: a comp that restrikes the identical voicing
                   scores 0 however many times it strikes.
     BAR REPEAT    share of adjacent bar pairs whose onset pattern is identical.
                   Wanted HIGH but not 100 -- "repeated with slight alterations"
                   is neither a new bar every time nor the same bar forever.

   Rates, never a pass/fail on one song, and some of them SHOULD be non-zero:
   a genre whose comp is a held pad (a bridge pad, the drone genres) is
   supposed to sit at one onset a bar, and reading it as a defect would be the
   flat-threshold mistake this repo has already made twice. */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 20;
const MATS = ["A", "Avar", "B", "C", "fill", "ending"];

console.log("comp voicing, " + N + " seeds a genre");
console.log("  a block chord is SIMULTANEOUS 100 / INNER 0 — the 'bad' photograph\n");
console.log("  genre        simul%  onsets/bar  voices/onset  inner move%  bar repeat%  span");

const rows = [];
for(const g of M.genres()){
  let sim = 0, tot = 0, onsets = 0, bars = 0, voices = 0, onsetN = 0;
  let innerYes = 0, innerN = 0, rep = 0, repN = 0, spanSum = 0, spanN = 0;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "band", g);
    /* MATERIAL, not the arrangement: this is a question about how the part is
       WRITTEN, and the arrangement only decides which bars of it get played. */
    /* materials is keyed by NAME and also carries bars/pocket/chords, which are
       not materials -- a material is the object with role arrays on it */
    for(const matName of MATS){
      const mat = song.materials[matName];
      const keys = (mat && mat.keys) || [];
      if(!keys.length) continue;
      /* group by bar -> step */
      const byBar = {};
      for(const n of keys){
        (byBar[n.bar] = byBar[n.bar] || {});
        (byBar[n.bar][n.step] = byBar[n.bar][n.step] || []).push(n.pitch);
      }
      for(const b in byBar){
        const steps = Object.keys(byBar[b]).map(Number).sort((a, z) => a - z);
        bars++; onsets += steps.length;
        /* THE SPAN of the bar's frame, bottom voice to top, in semitones. The
           reference photograph's frame is B3/B4/D5/C6/F6 -- thirty semitones,
           an octave between the bottom two. A close voicing folded into one
           register sits under twelve. This is the number that says which of the
           two the program is writing, and it was missing from this probe while
           the code that changes it was already being edited. */
        const inBar = keys.filter(n => n.bar === +b).map(n => n.pitch);
        if(inBar.length > 1){ spanSum += Math.max(...inBar) - Math.min(...inBar); spanN++; }
        for(const st of steps){ voices += byBar[b][st].length; onsetN++;
          tot += byBar[b][st].length;
          if(byBar[b][st].length > 1) sim += byBar[b][st].length;
        }
        /* INNER MOVEMENT — and the first version of this measured the wrong
           thing entirely. It asked whether a later onset RESTRUCK a pitch the
           earlier onset also struck, and scored 0.0% against a comp that had
           just been rebuilt to do this properly. The reason is that the good
           behaviour is precisely NOT restriking: the outer voices are left
           ringing and only the inner voice speaks again, so a held voice never
           appears in a later onset's pitch set and "held" could never be
           non-zero. The metric could only ever have rewarded the block chord it
           was written to detect.

           What actually has to be true is the photograph: at this onset, is
           something still SOUNDING from before, and is the note arriving a
           different pitch from it? That is "something holds while something
           moves", and it needs the durations, not just the onsets. */
        for(let i = 1; i < steps.length; i++){
          const st = steps[i];
          const sustaining = keys.filter(n => n.bar === +b && n.step < st && n.step + n.dur > st);
          const arriving = byBar[b][st];
          innerN++;
          if(sustaining.length && arriving.some(p => !sustaining.some(s => s.pitch === p))) innerYes++;
        }
      }
      /* bar to bar: same onset pattern? */
      const barIdx = Object.keys(byBar).map(Number).sort((a, z) => a - z);
      for(let i = 1; i < barIdx.length; i++){
        const p = Object.keys(byBar[barIdx[i - 1]]).sort().join(",");
        const q = Object.keys(byBar[barIdx[i]]).sort().join(",");
        repN++; if(p === q) rep++;
      }
    }
  }
  const pct = (a, b) => b ? (100 * a / b).toFixed(1) : "  -";
  rows.push({ g, sim: pct(sim, tot), ob: bars ? (onsets / bars).toFixed(2) : "-",
              vo: onsetN ? (voices / onsetN).toFixed(2) : "-",
              inner: pct(innerYes, innerN), rep: pct(rep, repN),
              span: spanN ? (spanSum / spanN).toFixed(1) : "-" });
  const r = rows[rows.length - 1];
  console.log(`  ${g.padEnd(12)} ${r.sim.padStart(5)}   ${r.ob.padStart(6)}      ${r.vo.padStart(6)}       ${r.inner.padStart(6)}      ${r.rep.padStart(6)}   ${r.span.padStart(5)}`);
}

/* and PRINT ONE, because a table is not the notes */
console.log("\n" + "─".repeat(72));
console.log("seed 1 lofi, material A comp — the actual grid, voice by voice");
{
  const song = M.composeSong(1, "band", "lofi");
  const keys = song.materials.A.keys || [];
  const pitches = [...new Set(keys.map(n => n.pitch))].sort((a, z) => z - a);
  const NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const nm = p => NAMES[((p % 12) + 12) % 12] + (Math.floor(p / 12) - 1);
  const bars = Math.max(...keys.map(n => n.bar)) + 1;
  console.log("        " + Array.from({length: bars}, () => "1e+a2e+a3e+a4e+a").join(" "));
  for(const p of pitches){
    let row = "";
    for(let b = 0; b < bars; b++){
      for(let st = 0; st < 16; st++){
        const on = keys.find(n => n.pitch === p && n.bar === b && n.step === st);
        if(on) row += "#";
        else {
          const held = keys.find(n => n.pitch === p && n.bar === b && n.step < st && n.step + n.dur > st);
          row += held ? "-" : ".";
        }
      }
      row += " ";
    }
    console.log(nm(p).padEnd(7) + " " + row);
  }
  console.log("\n  # = a note begins   - = still sounding   . = silent");
  console.log("  every column with more than one # is voices arriving together.");
}
