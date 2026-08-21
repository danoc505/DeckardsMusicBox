#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE ONE-SECOND CHECK: does the page's script PARSE?

       node harness/mk2_syntax.js [--file <path>]

   WHY IT EXISTS, and it is a fault this repo has now hit twice in one hour.
   The AudioWorklet processors live inside TEMPLATE LITERALS -- `RACK_DSP` and
   `ROOM_FDN` are strings of JavaScript handed to `addModule` as data: URLs. A
   bare backtick written in a COMMENT inside one of those strings ends the
   literal, and the whole file then fails to parse with an error pointing at
   whatever identifier happens to follow:

       SyntaxError: Unexpected identifier 'recov'

   Nothing in that message says "you wrote a backtick in a worklet comment".
   The room's own note records the same class of trap one layer along: btoa
   threw on a box-drawing character in a worklet comment, the catch swallowed
   it, and the reverb silently fell back to a convolver for an unknown number
   of builds.

   THE RENDER BATTERY DOES CATCH IT -- by hanging for three minutes waiting for
   `window.MK2` that will never arrive. This says the same thing in a second,
   with a line number, and it needs no browser.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const argOf = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const HTML = argOf("--file", path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"));
const src = fs.readFileSync(HTML, "utf8");

/* the biggest <script> block is the program; the rest are shims */
let i = src.indexOf("<script"), best = null;
while(i >= 0){
  const j = src.indexOf(">", i), k = src.indexOf("</script>", j);
  if(k > 0 && (!best || k - j > best[1] - best[0])) best = [j + 1, k];
  i = src.indexOf("<script", k > 0 ? k : src.length);
}
if(!best){ console.error("no <script> block in " + HTML); process.exit(2); }
const head = src.slice(0, best[0]).split("\n").length - 1;
const body = "\n".repeat(head) + src.slice(best[0], best[1]);

const vm = require("vm");
try {
  new vm.Script(body, { filename: path.basename(HTML) });
} catch(e){
  console.error("PARSE FAILED  " + path.basename(HTML));
  console.error("  " + String(e.message));
  const m = /:(\d+)/.exec(String(e.stack || "").split("\n")[0] || "");
  if(m) console.error("  near line " + m[1]);
  console.error("\n  If the line is inside RACK_DSP or ROOM_FDN, look for a bare");
  console.error("  backtick in a comment: it ends the template literal.");
  process.exit(1);
}

/* and the specific trap, named rather than left to the parser */
let bad = 0;
for(const name of ["RACK_DSP", "ROOM_FDN"]){
  const a = src.indexOf("const " + name + " = `");
  if(a < 0) continue;
  const from = a + ("const " + name + " = `").length;
  const b = src.indexOf("`;", from);
  const blk = src.slice(from, b);
  let n = 0;
  for(let q = 0; q < blk.length; q++)
    if(blk[q] === "`" && blk[q - 1] !== "\\") n++;
  if(n){ console.error(name + ": " + n + " unescaped backtick(s) inside the worklet source"); bad++; }
}
if(bad) process.exit(1);
console.log("parses clean  " + path.basename(HTML) +
            "   (" + (body.split("\n").length) + " lines of script)");
