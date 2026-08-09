#!/usr/bin/env node
/* PROBE_DRUMARC — does the drum part have a SHAPE across the record, or is it
   one loop wearing a section list?

     node harness/probe_drumarc.js [seeds]

   WHY THIS EXISTS. The owner, 2026-08-08: "there is meant to be a sections type
   pattern with the last section having the most change, and other sections
   taking away something or adding or altering. But that is only one section --
   we never have fills or solos or drum rolls! It's often just one single drum
   loop the whole song." The fill half of that was one condition and was fixed
   at `2026-08-08r`. The sectional half had never been measured at all, so there
   was no number to argue with -- only an impression, which this project has
   been wrong about in both directions.

   It asks three things, all off the PERFORMED events rather than the tables,
   because the tables cannot see arrival, rest, thinning or the fill:

     HOW MANY DRUM MATERIALS a record actually plays, against how many sections
       it has drums in. A record with nine drum sections and three materials is
       repeating one of them four times, and that is the complaint said in
       numbers.
     WHICH DRUMS play at all in a section, compared pairwise. This is the
       add / take-away axis: 100% means no section ever gains or loses a drum.
     WHICH HITS land where, ignoring which bar of the loop they are in. This is
       the alter axis.

   And then the one the request turns on: IS THE LAST SECTION'S DRUM PART ONE
   THE LISTENER HAS ALREADY HEARD. "The last section having the most change"
   cannot be true of a record whose closing drums are a rerun.

   THE WINDOW IS THE FIRST FOUR BARS OF EACH SECTION, deliberately. Compared
   over whole sections, a 16-bar section collects more distinct hits than a
   4-bar one and reads as "different" for no musical reason -- the first version
   of this probe did exactly that and made synthwave look like the genre with
   the most drum variety, when what it has is the most varied section LENGTHS.
   Equal windows, or the ruler is measuring itself. */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 20;
const WIN = 4;

/* how much of two sets is shared, 1 = identical */
const share = (a, b) => {
  if(!a.size && !b.size) return 1;
  let hit = 0; for(const x of a) if(b.has(x)) hit++;
  return hit / (a.size + b.size - hit);
};

console.log(`\n=== the drums across the record — ${N} seeds a genre, first ${WIN} bars of each section ===\n`);
console.log("  genre         sections  drum       most-played  same DRUMS  same HITS  closing drums");
console.log("                w/ drums  materials  material     pair:pair   pair:pair  heard before");
for(const g of M.genres()){
  let songs = 0, sec = 0, mats = 0, rep = 0, sl = 0, sh = 0, seen = 0;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    const spb = (60 / song.chart.tempo) / 4, barSec = 16 * spb;
    const S = song.sections, nS = S.length;
    const lanes = [], hits = [];
    for(let i = 0; i < nS; i++){ lanes.push(new Set()); hits.push(new Set()); }
    for(const e of song.perf.events){
      if(e.role !== "drums") continue;
      const bar = Math.floor(e.tSec / barSec + 1e-9);
      const step = Math.round((e.tSec - bar * barSec) / spb) % 16;
      for(let i = 0; i < nS; i++)
        if(bar >= S[i].startBar && bar < S[i].endBar){
          const off = bar - S[i].startBar;
          if(off < WIN){ lanes[i].add(e.lane); hits[i].add(e.lane + "@" + step + "@" + off); }
          break;
        }
    }
    const idx = []; for(let i = 0; i < nS; i++) if(lanes[i].size) idx.push(i);
    if(idx.length < 2) continue;
    songs++; sec += idx.length;
    /* WHICH DRUM PART EACH SECTION PLAYS, ASKED BY CONTENT AND NOT BY NAME.
       This read `S[i].material` and that stopped being the right question the
       moment the sectional arc existed: the arc gives a section its own private
       copy, so every section carries a distinct material NAME (`A@2`, `A@5`)
       whether or not the drums inside them differ by a single hit. Counting
       names reported "6.5 sections, 6.5 drum parts, most-played 1.0" on a
       record where half the sections were byte-identical -- a probe measuring
       its own bookkeeping. The drum part itself is what a listener hears. */
    const drumKey = m => {
      const d = (song.materials[m] && song.materials[m].drums) || [];
      return d.map(n => n.bar + ":" + n.step + ":" + n.lane + ":" + (n.vel || 0)).join(",");
    };
    const used = idx.map(i => drumKey(S[i].material));
    const c = {}; for(const m of used) c[m] = (c[m] || 0) + 1;
    mats += Object.keys(c).length;
    rep  += Math.max.apply(null, Object.values(c));
    let a1 = 0, h1 = 0, p = 0;
    for(let a = 0; a < idx.length; a++) for(let b = a + 1; b < idx.length; b++){
      a1 += share(lanes[idx[a]], lanes[idx[b]]);
      h1 += share(hits[idx[a]],  hits[idx[b]]); p++;
    }
    sl += a1 / p; sh += h1 / p;
    /* HAS THE CLOSING SECTION'S DRUM PART BEEN PLAYED BEFORE — asked of the
       MATERIAL, not of the exact hits. The first version compared hit pictures
       and reported 0% for four genres that in fact end on a rerun: two sections
       playing the same material land on different bars of its four-bar loop, so
       the pictures differ while the drum part does not. The question is "is the
       closing drum part one the listener already knows", and the material is
       what answers it. */
    seen += used.slice(0, -1).includes(used[used.length - 1]) ? 1 : 0;
  }
  if(!songs){ console.log("  " + g.padEnd(14) + "  — this genre has no drums —"); continue; }
  console.log("  " + g.padEnd(14)
    + (sec/songs).toFixed(1).padStart(5)
    + (mats/songs).toFixed(1).padStart(11)
    + (rep/songs).toFixed(1).padStart(12)
    + ((100*sl/songs).toFixed(0) + "%").padStart(13)
    + ((100*sh/songs).toFixed(0) + "%").padStart(11)
    + ((100*seen/songs).toFixed(0) + "%").padStart(14));
}
console.log("\n  same DRUMS 100% = no section ever gains or loses a drum.");
console.log("  closing drums heard before 100% = the record ends on a drum part already played.\n");
