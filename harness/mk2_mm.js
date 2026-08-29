#!/usr/bin/env node
/* ══ THE MELODIC MATH PRINTOUT ═════════════════════════════════════════════
   docs/MELODIC-MATH-ENGINE.md

   Reads every motif in the owner's sheets and every motif measured out of the
   three songs, and prints what the program makes of each one.

   THE CHECK IS THE ROUND TRIP: write a motif, read it, write it back. If the
   two strings differ the notation has lost something, and the line that lost
   it is printed beside the two. Nothing else here is a pass or a fail -- the
   spans and the movements are printed so they can be read.

     node harness/mk2_mm.js
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const HTML = path.join(__dirname, "..", "Deckards Orchestrator MK2.html");

const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "",
                                             value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const MM = global.window.MK2.MM;

const SHEETS = [
  ["Final Countdown  A",   "1(i)1(i)4"],
  ["Final Countdown  A2",  "1(i)1(i)2(i)2"],
  ["Final Countdown  B",   "4(N)"],
  ["Final Countdown  B2",  "2(i)2"],
  ["Final Countdown  S",   "6"],
  ["Smoke on the Water A", "4(ii)4"],
  ["Smoke on the Water B", "6(N)"],
  ["Smoke on the Water C", "2(i)8"],
  ["Smoke, rhythm only A", "4+4"],
  ["Smoke, rhythm only C", "2+8"],
  ["Nobody Else mel  A",   "4+3+1+4"],
  ["Nobody Else mel  B",   "4"],
  ["Nobody Else bass A",   "1/1/1/1/2"],
  ["Nobody Else bass B",   "2/2"],
];
const SONGS = [
  ["Chop Suey  vox call",   "2(F1)2"],
  ["Chop Suey  vox answer", "2(N)2(N)2(N)2(N)2(N)2(N)2(N)2"],
  ["Chop Suey  vox grown",  "2(F1)4(E5)2(N)2(F12)2(N)2"],
  ["Chop Suey  vox 4th",    "2(F1)2(E1)2(N)2(N)2(N)2(N)2(N)2"],
  ["Chop Suey  outro E",    "4(F2)4(F1)8"],
  ["Chop Suey  outro E'",   "4(F2)2(F3)8"],
  ["Chop Suey  outro F",    "4(N)4(F1)4(E1)4"],
  ["Chop Suey  octave pair","3(N)3(N)2(E2)4(F2)2(F1)2"],
  ["Chop Suey  bass answer","2(F1)2(E1)2(F1)2(E1)2(F1)2(E1)2(F1)2"],
  ["Televators  25/31",     "6(N)4(E2)4"],
  ["Televators  26/32",     "4(E4)4(E1)2(F1)6"],
  ["Televators  42",        "4(E3)2(N)4(F3)2(E5)4"],
  ["Televators  45 (swap)", "2(E3)4(N)4(F3)2(E5)4"],
  ["Televators  18",        "12(F11)8"],
  ["Televators  bass cell", "12(F9)12"],
  ["Shine On   bass turn",  "2(E2)2(F2)2"],
  ["Shine On   held",       "20"],
];
const say = console.log;
say("");
say("█".repeat(78));
say("█  MELODIC MATH — the notation, read back");
say("█  reading: " + path.basename(HTML));
say("█".repeat(78));

let bad = 0, n = 0;
function block(title, rows){
  say("");
  say("─".repeat(78));
  say("  " + title);
  say("─".repeat(78));
  say("  " + "written".padEnd(38) + "span notes  read back");
  for(const [name, code] of rows){
    n++;
    let mo, back, err = null;
    try { mo = MM.parse(code); back = MM.print(mo); }
    catch(e){ err = e.message; }
    if(err){ bad++; say("  " + name.padEnd(24) + code.padEnd(14) + "  THREW: " + err); continue; }
    const ok = back === code;
    if(!ok) bad++;
    say("  " + name.padEnd(24) + code.padEnd(38).slice(0, 38) +
        String(mo.span).padStart(4) + String(mo.notes).padStart(6) + "  " +
        (ok ? "same" : "DIFFERENT -> " + back));
  }
}
block("THE SHEETS", SHEETS);
block("MEASURED OUT OF THE THREE SONGS", SONGS);

/* and what the movements actually say, since that is the part with two
   strengths and the part a reader has to trust */
say("");
say("─".repeat(78));
say("  WHAT EACH MOVEMENT MEANS");
say("─".repeat(78));
for(const code of ["4(ii)4", "4(E2)4", "4(F2)4", "4(N)4", "4+4"]){
  const mo = MM.parse(code), mv = mo.moves[0];
  say("  " + code.padEnd(10) + (
      mv == null      ? "nothing declared — the engine draws the whole move"
    : mv.dir === "N"  ? "do not move: the pitch repeats"
    : mv.dir          ? "move " + (mv.dir === "E" ? "up" : "down") + " " + mv.n + " — the motif decided"
    :                   "move by " + mv.n + ", DIRECTION FREE — the engine draws which way"));
}
say("");
say("═".repeat(78));
say("  " + n + " motifs read.  " + (bad ? bad + " DID NOT COME BACK THE SAME" :
    "every one came back the same string it went in as"));
say("═".repeat(78));
say("");
process.exit(bad ? 1 : 0);
