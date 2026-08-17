#!/usr/bin/env node
/* PROBE_DEVELOP — DOES THE HOOK COME BACK, AND DOES IT COME BACK CHANGED?

     node harness/probe_develop.js [seeds]

   THE MEASURE THAT DIAGNOSED THE FAULT WOULD HAVE SCORED THE FIX AS A FAILURE,
   and that is the reason this file exists rather than a threshold in an
   existing one.

   `docs/genre-research/boxcar-the-missing-hook.md` measured the verse with a
   function that asked: IS THIS MATERIAL PERFECTLY PERIODIC — does some cell
   shorter than the material repeat all the way to the end? It answered "no, 0
   of 12" and it was right, and the fault it named was real: the tune wandered
   for 27 seconds and never said anything twice.

   But that one number cannot tell three different things apart:

     a wandering tune     not periodic   nothing returns    <- the old fault
     a loop               PERIODIC       everything returns <- the new fault
     a developed hook     not periodic   something returns  <- what is wanted

   The wandering tune and the developed hook score IDENTICALLY on it. Fixing
   `verseHook` moved the verse from the first row to the second, and a session
   that watched only that number would have called it done — the file's own
   history says so: 38 of 60 records were perfectly periodic afterwards and
   nothing reported it.

   So this asks the two questions separately, and a hook has to answer both:

     RETURN   a cell shorter than the material comes back EXACTLY at least
              once. Without this there is nothing to recognise -- "motifs are
              recognizable through their repetition" [Webern, corpus:wikipedia]
     VARY     the material is NOT perfectly periodic. With it, the return is a
              loop -- "too much repetition can become monotonous, which is why
              variation often accompanies it" [corpus:vaia], and modal jazz's
              own prescription is a sentence that "breathes, REPEATS, VARIES,
              and resolves" [corpus:newyorkjazzworkshop, modal-jazz.md §10]

   And one more, because a variation that is not recognisable is just a
   different tune:

     KEEP     the developed return holds the CONTOUR of the idea it develops --
              the same up/down shape, note for note.

   Asserted only for genres that DECLARE `theme.develop`. Every other genre is
   REPORTED, because a genre with no hook at all is not failing this test, it
   is not taking it. */
const fs = require("fs");
const path = require("path");
const HTML = process.argv[3] || path.resolve(__dirname, "..", "Boxcar Synth.html");
const SEEDS = parseInt(process.argv[2], 10) || 60;
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const barSig = (ns, b) => ns.filter(n => n.bar === b).sort((a, z) => a.step - z.step)
                            .map(n => n.step + "/" + n.pitch).join(",");
const contour = (ns, b) => {
  const s = ns.filter(n => n.bar === b).sort((a, z) => a.step - z.step);
  return s.map((n, i) => i ? Math.sign(n.pitch - s[i - 1].pitch) : "").join("");
};

const rows = [];
let failed = 0;
for(const g of M.genres()){
  let table = null;
  try { table = M.composeSong(1, undefined, g).chart.table; } catch(e){ continue; }
  const TH = table && table.theme;
  const declares = !!(TH && TH.develop);
  const at = (TH && TH.develop && TH.develop.at) || 4;
  let tot = 0, ret = 0, periodic = 0, kept = 0;
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, undefined, g); } catch(e){ continue; }
    const A = (song.materials.A || {}).lead || [];
    const MB = song.chart.table.materialBars || 4;
    if(A.length < 3 || MB < 4) continue;
    tot++;
    /* RETURN: bars 0..1 restated at 2..3 */
    if(barSig(A, 0) === barSig(A, 2) && barSig(A, 1) === barSig(A, 3)) ret++;
    /* VARY: is the whole material a loop? */
    let per = false;
    for(let p = 1; p < MB; p++){
      if(MB % p) continue;
      let all = true;
      for(let b = p; b < MB; b++) if(barSig(A, b) !== barSig(A, b - p)){ all = false; break; }
      if(all){ per = true; break; }
    }
    if(per) periodic++;
    /* KEEP: the developed return holds the idea's shape */
    if(MB > at && contour(A, at) === contour(A, 0)) kept++;
  }
  if(!tot) continue;
  rows.push({ g, declares, tot, ret, periodic, kept });
  if(declares){
    /* the three claims, and they are only claims for a genre that asked */
    if(ret !== tot) failed++;
    if(periodic !== 0) failed++;
    if(kept < Math.round(tot * 0.75)) failed++;
  }
}

console.log("\n=== DOES THE HOOK RETURN, AND DOES IT RETURN CHANGED? — " + SEEDS + " seeds a genre\n");
console.log("  genre           develops   returns exactly   a plain LOOP   keeps the shape");
for(const r of rows)
  console.log("  " + r.g.padEnd(15) + (r.declares ? "  yes    " : "   -     ") +
              (r.ret + "/" + r.tot).padStart(12) +
              (r.periodic + "/" + r.tot).padStart(15) +
              (r.kept + "/" + r.tot).padStart(18) +
              (r.declares ? "" : "   (reported, not asserted)"));
console.log("");
for(const r of rows.filter(x => x.declares)){
  const say = (ok, label, detail) => console.log("  " + (ok ? "✓" : "✗ FAIL:") + " [" + r.g + "] " + label + "  (" + detail + ")");
  say(r.ret === r.tot, "the hook returns exactly, so there is something to recognise", r.ret + "/" + r.tot);
  say(r.periodic === 0, "and the material is not a plain loop", r.periodic + "/" + r.tot + " perfectly periodic");
  say(r.kept >= Math.round(r.tot * 0.75), "and the developed return still holds the idea's shape",
      r.kept + "/" + r.tot + " keep the contour");
}
console.log("\n  " + failed + " development fault(s)\n");
process.exit(failed ? 1 : 0);
