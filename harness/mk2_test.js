#!/usr/bin/env node
/* MK2 seam tests — the note-level battery, runnable in seconds without a browser.
   The output battery (rendered WAV assertions) is mk2_render.js + analysis; THIS
   file guards the composition contract on every change:

     node harness/mk2_test.js [nSeeds]

   Exits non-zero on any failure. The checks are the LAWS, not taste:
   valid by construction, deterministic, rule of three, hook exactness,
   dilla offsets identical bar to bar. */
const fs = require("fs"), path = require("path");

/* load the shipped file's script with browser stubs — no build step, no copy */
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 300;
let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log((ok ? "  ✓ " : "  ✗ FAIL: ") + name + (detail ? "  (" + detail + ")" : ""));
  ok ? pass++ : fail++;
};

const errors = [];
let dilla = 0, hookExact = 0, hookTotal = 0, forms = new Set(), nondet = 0, ruleOf3 = 0;
let dillaIdentical = 0, dillaChecked = 0;
let rigs = {}, rigSame = 0, rigChecked = 0, rigVoices = 0, unknownVoice = [];

/* the rig table is the ONLY thing a rig changes; every voice it names must exist */
const RIG_NAMES = new Set(["kick","snare","ghost","hat","openhat","bass","keys","lead","counter",
  "dacKick","dacSnare","dacGhost","psgHat","psgOpenhat",
  "chipBass","chipKeys","chipLead","chipCounter","tape"]);

for(let s = 1; s <= N; s++){
  let song;
  try{ song = M.composeSong(s); }
  catch(e){ errors.push(s + ": " + e.message); continue; }

  forms.add(song.form.map(x => x.fn).join(","));
  rigs[song.chart.rig] = (rigs[song.chart.rig] || 0) + 1;
  for(const e of song.perf.events)
    if(!RIG_NAMES.has(e.voice) && unknownVoice.length < 3) unknownVoice.push(s + ":" + e.voice);

  /* the rig changes WHO plays, never WHAT is played: strip `voice` and the two
     performances must be byte-identical. This is the law that makes a rig a
     lookup table instead of a second engine. */
  if(s <= 40){
    rigChecked++;
    const strip = x => JSON.stringify(x.perf.events.map(e => { const { voice, ...rest } = e; return rest; }));
    const b = M.composeSong(s, "band"), g = M.composeSong(s, "sega");
    if(strip(b) === strip(g)) rigSame++;
    if(JSON.stringify(b.perf.events.map(e => e.voice)) !==
       JSON.stringify(g.perf.events.map(e => e.voice))) rigVoices++;
  }

  /* determinism (a sample — full JSON compare is heavy at N=300) */
  if(s <= 40){
    const j = x => JSON.stringify(x.perf.events);
    if(j(song) !== j(M.composeSong(s))) nondet++;
  }

  /* the hook restates itself exactly */
  const B = song.materials.B.lead;
  const sig = b => B.filter(n => n.bar === b).map(n => n.step + "/" + n.pitch).join(",");
  hookTotal++;
  if(sig(0) === sig(2) && sig(1) === sig(3)) hookExact++;

  /* rule of three at the section level */
  for(let i = 2; i < song.form.length; i++)
    if(song.form[i].fn === song.form[i-1].fn && song.form[i].fn === song.form[i-2].fn) ruleOf3++;

  /* dilla: the offsets must repeat identically (±2 ms dust), never wander */
  if(song.perf.groove.style === "dilla"){
    dilla++;
    const spb = (60 / song.chart.tempo) / 4;
    const offs = song.perf.events.filter(e => e.lane === "snare")
      .map(e => { const st = e.tSec / spb; return st - Math.round(st); });
    if(offs.length > 4){
      dillaChecked++;
      const spread = Math.max(...offs) - Math.min(...offs);
      if(spread < 0.06) dillaIdentical++;         // < ~5 ms at lofi tempi
    }
  }
}

check("every seed composes and passes its own seam checks", errors.length === 0,
      errors.length ? errors.slice(0, 3).join(" | ") : N + " seeds");
check("same seed, same events", nondet === 0, nondet + " mismatches in 40");
check("the hook restates itself exactly", hookExact === hookTotal, hookExact + "/" + hookTotal);
check("no function three times in a row", ruleOf3 === 0, ruleOf3 + " violations");
check("dilla offsets repeat identically bar to bar", dillaChecked > 0 && dillaIdentical === dillaChecked,
      dillaIdentical + "/" + dillaChecked + " songs");
check("forms genuinely vary", forms.size > N / 4, forms.size + " distinct in " + N);
check("both grooves get drawn", dilla > N * 0.3 && dilla < N * 0.9, "dilla " + dilla + "/" + N);
check("the rig changes who plays, never what is played", rigChecked > 0 && rigSame === rigChecked,
      rigSame + "/" + rigChecked + " seeds identical apart from `voice`");
check("...and it really does change who plays", rigVoices === rigChecked,
      rigVoices + "/" + rigChecked + " seeds swap their voice names");
check("every voice a rig names exists", unknownVoice.length === 0, unknownVoice.join(" | "));
check("both rigs get drawn", (rigs.band || 0) > N * 0.4 && (rigs.sega || 0) > N * 0.1,
      "band " + (rigs.band || 0) + " / sega " + (rigs.sega || 0));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
