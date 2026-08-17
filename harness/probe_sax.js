#!/usr/bin/env node
/* WHAT ARTICULATION IS THE HORN ACTUALLY PLAYING?
     node harness/probe_sax.js [seeds]

   The sax was reported as sounding bad, and the fix was not a timbre change --
   it was that every note was being tongued and scooped as if it were the first
   note of a phrase. This reads the notes back and asks whether the line now
   breathes in phrases:

     BREATH    the first note after a rest. Scoop, air, full attack.
     LEGATO    slurred from the note before. No attack, no breath, pitch glides.
     PORTATO   tongued across a leap. 25.5 ms of silence, then a clean start.
     STACCATO  released early -- 73% of its inter-onset interval.

   The number that matters is the SLUR SHARE. A wind line that is 0% legato is
   a line where every note is struck, which is the machine-gun sound this
   existed to remove; a line that is 100% legato never articulates at all.
   [corpus:PMC4097958 -- people playing it confuse legato with portato 25% of the time
    and staccato with neither <1%, so the gaps are what carry the instrument] */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 30;

const genres = M.genres();
console.log(`saxophone articulation — ${N} seeds a genre\n`);
console.log("  genre          lead notes   breath  legato portato staccato    vib   glides");

let tot = { breath: 0, legato: 0, portato: 0, staccato: 0, vib: 0, glide: 0, n: 0 };
for(const g of genres){
  const c = { breath: 0, legato: 0, portato: 0, staccato: 0, vib: 0, glide: 0, n: 0 };
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "band", g, { lead: "sax" });
    for(const e of song.perf.events){
      if(e.role !== "lead" || e.pitch == null) continue;
      c.n++;
      c[e.art || "breath"]++;
      if(e.vib) c.vib++;
      if(e.from != null) c.glide++;
    }
  }
  for(const k in c) tot[k] += c[k];
  const pc = k => c.n ? (100 * c[k] / c.n).toFixed(1).padStart(6) + "%" : "     --";
  console.log(`  ${g.padEnd(13)} ${String(c.n).padStart(10)}  ${pc("breath")} ${pc("legato")} ${pc("portato")} ${pc("staccato")} ${pc("vib")} ${pc("glide")}`);
}
const pc = k => tot.n ? (100 * tot[k] / tot.n).toFixed(1) + "%" : "--";
console.log(`\n  all genres: ${tot.n} lead notes`);
console.log(`    ${pc("breath")} start a phrase · ${pc("legato")} slurred · ${pc("portato")} tongued · ${pc("staccato")} detached`);
console.log(`    ${pc("vib")} carry vibrato · ${pc("glide")} glide from a named predecessor`);

/* THE ONE THING THAT WOULD MAKE ALL OF THE ABOVE A LIE: a slur that names a
   pitch it is not actually next to, or a glide of more than a step. `articulate`
   only slurs stepwise motion, so every `from` must be within two semitones. */
let bad = 0, far = 0;
for(const g of genres) for(let s = 1; s <= 12; s++){
  const song = M.composeSong(s, "band", g, { lead: "sax" });
  for(const e of song.perf.events){
    if(e.role !== "lead" || e.from == null) continue;
    if(e.art !== "legato") bad++;
    if(Math.abs(e.pitch - e.from) > 2) far++;
  }
}
console.log(`\n  ${bad === 0 ? "OK" : "BAD"}: every glide belongs to a slur          (${bad} exceptions)`);
console.log(`  ${far === 0 ? "OK" : "BAD"}: every slur is stepwise (<= 2 semitones) (${far} exceptions)`);
