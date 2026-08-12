#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE REPEATED NOTE — does a sampled voice ever fire the same pitch twice?

       node harness/probe_repeat.js [songs]

   Reported FIVE times, the last two in these words:

     "I WANT THE FUCKED UP REPEATING NOTES GONE!"
     "WHY IS THE INSTRUMENT STILL REPEATING ON THE SEED ONE WHY WHY WHY I KEEP
      ASKING FOR ONE FUCKING THING TO BE DONE GIT RIDE OF THE FUCKING ECHOING
      THE REPEATING IT GOES AND GOES AND GOES AND YOU IGNORE ME!"

   FOUR ANSWERS WERE WRONG BEFORE THIS EXISTED, and they were wrong in the same
   way each time -- each changed how the repeat was DRESSED and left the repeat:

     a slur                 tie the second note so it does not re-attack. The
                            sample still re-fires; a tie on a one-shot buffer
                            is a tie on nothing.
     a whistle cut          a 30 ms flick of the degree above, taking the
                            parent's first instant [Larsen]. Faithful to the
                            source and WORSE: a bare repeat became a decorated
                            one, and seed 1 came back 75-[76]-75, 80-81-80-[81]-80.
     round robins           real variation, on the DRUMS, where the machine-gun
                            effect is a different problem with the same name.
     `lines.repeat`         the right idea, measuring the wrong thing -- ONSET
                            distance. A note that holds a full second and then
                            repeats has a second between its starts and NO
                            silence at all. It waved through the exact case
                            being complained about.

   So this asks the only question that matters, of the SOUND rather than of the
   grid: on a voice that declares it cannot re-articulate, are there ever two
   notes of the SAME PITCH with less than that voice's own silence between them?

   IT MUST BE ZERO. Not low. Zero -- because the instrument's declaration says
   the second one is not a note, and one that gets through is an echo.

   AND IT COUNTS THE NOTES TOO, because the cheap way to pass this is to delete
   things. A merge makes one longer note out of two; it does not leave a hole,
   and "there are gaps with just silence" is a complaint this file has already
   been given once. If NOTES falls while MERGED rises one-for-one, that is the
   rule working. If NOTES falls further than that, something is dropping.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 20;

/* which voices declare a limit, asked of the instruments rather than named
   here -- the hardcoded `{ bardFlute: 1, bardWind: 1 }` in the old cut was
   itself the standing fault: a fact about an instrument, written where the
   instrument cannot see it. */
const LIMIT = {};
for(const k in M.INSTRUMENTS){
  const L = M.INSTRUMENTS[k].lines;
  if(!L || !L.repeat) continue;
  for(const lane in (M.INSTRUMENTS[k].lanes || {})) LIMIT[M.INSTRUMENTS[k].lanes[lane]] = L.repeat;
}
if(!Object.keys(LIMIT).length){
  console.log("\n  no voice declares `lines.repeat`. Nothing to check.\n");
  process.exit(0);
}

let notes = 0, pairs = 0;
const bad = [];
for(const genre of M.genres()){
  for(let seed = 1; seed <= N; seed++){
    const song = M.composeSong(seed, null, genre);
    const byLane = {};
    for(const e of song.perf.events){
      if(e.pitch == null || !e.voice || !LIMIT[e.voice]) continue;
      notes++;
      (byLane[e.role + ":" + e.voice] = byLane[e.role + ":" + e.voice] || []).push(e);
    }
    for(const k in byLane){
      const list = byLane[k].sort((a, z) => a.tSec - z.tSec);
      for(let i = 1; i < list.length; i++){
        const a = list[i - 1], b = list[i];
        if(a.pitch !== b.pitch) continue;
        pairs++;
        const gap = b.tSec - (a.tSec + a.durSec);
        if(gap >= LIMIT[b.voice]) continue;          // it really stopped: two notes
        bad.push(`${genre} seed ${seed} ${k} midi ${b.pitch} at ${b.tSec.toFixed(3)}` +
                 ` — ${(gap * 1000).toFixed(0)} ms of silence, needs ${(LIMIT[b.voice] * 1000).toFixed(0)}`);
      }
    }
  }
}

console.log(`\n  ${M.genres().length} genres x ${N} songs`);
console.log(`  voices bound by a repeat limit: ${Object.keys(LIMIT).map(v => v + " " + LIMIT[v] + "s").join(", ")}`);
console.log(`  ${notes} notes on them, ${pairs} same-pitch pairs anywhere in the line\n`);
if(!bad.length){
  console.log("  no sampled voice ever re-fires a pitch it has not stopped sounding.\n");
} else {
  for(const b of bad.slice(0, 25)) console.log("    " + b);
  if(bad.length > 25) console.log(`    ... and ${bad.length - 25} more`);
  console.log(`\n  ${bad.length} repeated note(s) the instrument says it cannot play.\n`);
  process.exitCode = 1;
}
