#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE REPEATED NOTE — does any line ever play the same pitch twice in a row?

       node harness/probe_repeat.js [songs]

   Reported SIX times. The sixth was not a bug report:

     "I WANT IT OUT GONE OUT OUT OUT OUT GONE GONE GONE NO MORE DELTED! I DO
      NOT WANT THE STUPID REPEATING SHIT I KEEP TELLING YOU THE SAME THING AND
      YOU KEEP IGNORING ME YOU ARE WRONG WRONG WRONG WRONG! NO INSTRUMENT PLAYS
      LIKE THAT IT IS SHIT IT SOUNDS LIKE SHIT IT IS ANNOYING IT IS WRONG AND
      DONT TRY TO FIX IT TAKE IT OUT OUT OUT OUT OUT GONE GONE GONE NOW!"

   FIVE ANSWERS WERE WRONG BEFORE THIS ONE, and they were wrong in the same way
   every time -- each changed how the repeat was DRESSED and left the repeat:

     a slur                 tie the second note so it does not re-attack. The
                            sample still re-fires; a tie on a one-shot buffer
                            is a tie on nothing.
     a whistle cut          a 30 ms flick of the degree above, taking the
                            parent's first instant [Larsen]. Faithful to the
                            source and WORSE: a bare repeat became a decorated
                            one, and seed 1 came back 75-[76]-75, 80-81-80-[81]-80.
     round robins           real variation, on the DRUMS, where the machine-gun
                            effect is a different problem with the same name.
     `lines.repeat`         merge the pair into one long note -- but measured
                            ONSET distance, so a note that held a full second
                            and then repeated had a second between its starts,
                            no silence at all, and was waved through.
     the same, measured     silence, correctly measured, then merged. Right
                            about the acoustics and still an articulation: a
                            merged repeat is a tune sitting on one pitch for a
                            bar without re-striking while it does.

   AND THIS PROBE WAS PART OF THE FIFTH WRONG ANSWER. It asked whether a voice
   that DECLARED `lines.repeat` ever broke its own declaration -- so it was
   green while nine genres repeated freely, because none of their instruments
   had declared anything. A guard scoped to the one place the defect had been
   reported is a guard that certifies the other nine.

   ── WHAT IT ASKS NOW ────────────────────────────────────────────────────────
   Of every melodic line in every genre, composed and as it sounds: are there
   two notes of the same pitch with nothing between them?

   AND IT IS REQUIRED TO BE ZERO WHERE THE GENRE DECLARES `theme.noRepeat`,
   AND MERELY REPORTED EVERYWHERE ELSE. The first version of this required zero
   of all ten, which is a probe deciding a question of taste for nine genres
   nobody asked about -- and the code that made it pass did exactly that, moving
   eight genres' tunes to fix a fault reported in one. A repeated pitch is a
   legitimate melodic device; this genre has decided it does not want one. The
   column is printed for every genre so the decision stays visible and can be
   taken again later, by the owner, in a table.

     COMPOSED   stage 3's own output, lead and counter, in bar/step order. This
                is where the rule lives, so a failure here is the rule itself.
     SOUNDED    stage 5's events, per role AND per voice, in time order. A
                ladder swap puts a different instrument on the lane and that is
                two instruments, not a repeat; a doubling is a second voice at
                the same instant and is not a repeat either. Splitting by voice
                is what makes both of those true rather than assumed.

   AND IT COUNTS THE NOTES, because the cheap way to pass this is to delete
   things and "there are gaps with just silence" is a complaint this file has
   already been given once. The note count per genre is printed every run.
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
/* the lines a listener follows as a tune. The comp, the ostinato and the bass
   are figures -- a pedal, a vamp, a repeated cell -- and a repeated pitch is
   what several of them ARE, so holding them to this would be holding them to
   somebody else's rule. */
const LINES = { lead: 1, counter: 1 };
/* which genres have decided it, asked of the tables rather than named here */
const BOUND = {};
for(const g of M.genres()){
  const t = M.composeSong(1, null, g).chart.table;
  BOUND[g] = !!(t && t.theme && t.theme.noRepeat);
}

const bad = [], rows = [];
for(const genre of M.genres()){
  let comp = 0, snd = 0, cBad = 0, sBad = 0;
  for(let seed = 1; seed <= N; seed++){
    const song = M.composeSong(seed, null, genre);
    /* ── COMPOSED ─────────────────────────────────────────────────────────── */
    for(const k in song.materials){
      const mat = song.materials[k];
      if(!mat || typeof mat !== "object") continue;
      for(const role in mat){
        if(!LINES[role] || !Array.isArray(mat[role])) continue;
        const seq = mat[role].slice().sort((a, z) => (a.bar - z.bar) || (a.step - z.step));
        comp += seq.length;
        for(let i = 1; i < seq.length; i++){
          if(seq[i].pitch !== seq[i - 1].pitch) continue;
          cBad++;
          if(BOUND[genre] && bad.length < 400)
            bad.push(`COMPOSED ${genre} seed ${seed} ${k}.${role}: midi ${seq[i].pitch} at ` +
                     `bar ${seq[i - 1].bar} step ${seq[i - 1].step} and bar ${seq[i].bar} step ${seq[i].step}`);
        }
      }
    }
    /* ── SOUNDED ──────────────────────────────────────────────────────────── */
    const byVoice = {};
    for(const e of song.perf.events){
      if(e.pitch == null || !LINES[e.role]) continue;
      snd++;
      (byVoice[e.role + " " + (e.voice || "?")] = byVoice[e.role + " " + (e.voice || "?")] || []).push(e);
    }
    for(const k in byVoice){
      const list = byVoice[k].sort((a, z) => a.tSec - z.tSec || a.pitch - z.pitch);
      for(let i = 1; i < list.length; i++){
        const a = list[i - 1], b = list[i];
        if(a.pitch !== b.pitch) continue;
        /* two events at the same instant on one voice and one pitch is a stack
           collapsing onto itself, which probe_stack owns; it is not a repeat */
        if(b.tSec - a.tSec < 1e-6) continue;
        sBad++;
        if(BOUND[genre] && bad.length < 400)
          bad.push(`SOUNDED  ${genre} seed ${seed} ${k}: midi ${b.pitch} at ${a.tSec.toFixed(3)} ` +
                   `and again at ${b.tSec.toFixed(3)} (${((b.tSec - a.tSec - a.durSec) * 1000).toFixed(0)} ms apart)`);
      }
    }
  }
  rows.push({ genre, comp: comp / N, snd: snd / N, cBad, sBad });
}

console.log(`\n  ${M.genres().length} genres x ${N} songs — lead and counter, composed and as they sound\n`);
console.log("    genre           notes/song  composed repeats   sounded repeats   bound?");
for(const r of rows)
  console.log(`    ${r.genre.padEnd(14)}${String(Math.round(r.comp)).padStart(8)}` +
              `${String(r.cBad).padStart(18)}${String(r.sBad).padStart(18)}` +
              `   ${BOUND[r.genre] ? "declares noRepeat" : "-"}`);

console.log("");
const boundList = Object.keys(BOUND).filter(g => BOUND[g]);
if(!bad.length){
  console.log(`  ${boundList.join(", ") || "no genre"} declares noRepeat, and no line of ` +
              `${boundList.length === 1 ? "its" : "theirs"} plays the same pitch twice in a row.\n`);
} else {
  for(const b of bad.slice(0, 25)) console.log("    " + b);
  if(bad.length > 25) console.log(`    ... and ${bad.length - 25} more`);
  console.log(`\n  ${bad.length} repeated note(s) in a genre that declares it will not. Zero is the only pass.\n`);
  process.exitCode = 1;
}
