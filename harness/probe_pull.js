#!/usr/bin/env node
/* DOES THE GENRE PULL HARDER THAN THE SEED?
     node harness/probe_pull.js [seeds]

   Asked directly: "it feels like the genre should have more pull on the song
   than the seed." That is not a taste question, it is a variance question, and
   it has a number.

   For each measurable feature of a song, two variances:

     BETWEEN  how much the SEVEN GENRE MEANS differ from each other
     WITHIN   how much seeds of the SAME genre differ from their own mean

   Their ratio is the pull. Above 1, the genre decides that feature more than
   the seed does; below 1, two lofi songs differ from each other more than lofi
   differs from jungle, which is the complaint stated arithmetically.

   This is a one-way ANOVA F in all but name, and it is deliberately reported
   PER FEATURE rather than as one score. A single number would hide the actual
   finding, which is that the answer is different for different properties of
   the music -- tempo is dictated by the table, and what the notes DO may not
   be. The features the genre already owns should score high; the interesting
   ones are the features nobody has assigned to anybody. */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 25;

/* one row of numbers per song. Everything here is read off the OUTPUT, never
   off the genre table -- asking the table how different the genres are would
   measure the table, not the music. */
function features(song){
  const ev = song.perf.events.filter(e => e.role !== "tape");
  const bars = song.form.nBars || 1;
  const pitched = ev.filter(e => e.pitch != null);
  const byRole = r => ev.filter(e => e.role === r);
  const drums = byRole("drums");
  const lane = l => drums.filter(e => e.lane === l).length;
  const pitches = pitched.map(e => e.pitch);
  const durs = ev.map(e => e.durSec).filter(x => x > 0);
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  return {
    tempo:        song.chart.tempo,
    evPerBar:     ev.length / bars,
    pctDrums:     drums.length / Math.max(1, ev.length),
    meanPitch:    mean(pitches),
    pitchSpan:    pitches.length ? Math.max(...pitches) - Math.min(...pitches) : 0,
    pcClasses:    new Set(pitches.map(p => ((p % 12) + 12) % 12)).size,
    kickPerBar:   lane("kick") / bars,
    hatPerBar:    lane("hat") / bars,
    snarePerBar:  lane("snare") / bars,
    bassPerBar:   byRole("bass").length / bars,
    keysPerBar:   byRole("keys").length / bars,
    leadPerBar:   byRole("lead").length / bars,
    meanDurSec:   mean(durs),
    sections:     song.sections.length,
    barsTotal:    bars,
    meanGain:     mean(ev.map(e => e.gain)),
  };
}

const genres = M.genres();
const rows = {};
for(const g of genres){
  rows[g] = [];
  for(let s = 1; s <= N; s++) rows[g].push(features(M.composeSong(s, "band", g)));
}
const keys = Object.keys(rows[genres[0]][0]);
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const vari = a => { const m = mean(a); return mean(a.map(x => (x - m) * (x - m))); };

const out = [];
for(const k of keys){
  const perGenre = genres.map(g => rows[g].map(r => r[k]));
  const genreMeans = perGenre.map(mean);
  const between = vari(genreMeans);                 // spread of the genre means
  const within = mean(perGenre.map(vari));          // spread inside a genre
  out.push({ k, between, within, pull: within > 1e-12 ? between / within : Infinity });
}
out.sort((a, b) => b.pull - a.pull);

console.log(`genre pull vs seed pull — ${N} seeds a genre, ${genres.length} genres\n`);
console.log("  pull > 1  the GENRE decides this feature");
console.log("  pull < 1  the SEED decides it — two songs of one genre differ more");
console.log("            than the genres differ from each other\n");
console.log("  feature        pull    between-genre var   within-genre var");
for(const r of out){
  const flag = r.pull >= 3 ? "  GENRE" : r.pull >= 1 ? "  genre" : r.pull >= 0.4 ? "  seed" : "  SEED";
  console.log(`  ${r.k.padEnd(13)} ${(isFinite(r.pull) ? r.pull.toFixed(2) : "inf").padStart(6)}` +
              `   ${r.between.toFixed(3).padStart(14)}   ${r.within.toFixed(3).padStart(14)}${flag}`);
}
const finite = out.filter(r => isFinite(r.pull));
console.log(`\n  features the genre owns (pull >= 1): ${finite.filter(r => r.pull >= 1).length}/${finite.length}`);
console.log(`  features the seed owns  (pull <  1): ${finite.filter(r => r.pull < 1).length}/${finite.length}`);
console.log(`  median pull: ${finite.map(r => r.pull).sort((a, b) => a - b)[Math.floor(finite.length / 2)].toFixed(2)}`);
