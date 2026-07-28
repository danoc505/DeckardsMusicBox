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
/* the theory helpers are module-locals in the shipped file; append an export so
   the battery can test the LAWS directly and not only their downstream effects */
eval(src + ";global.__T = { degMidi, MODES, inKey, scaleStep, intoBand };");
const M = global.window.MK2;
const T = global.__T;

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

/* scaleStep(…, 0) means "keep this note". It has to be an identity on every
   in-key pitch, at every root, in every mode. A bounded nearest-degree search
   silently failed this above its ceiling and moved 24% of the notes it was
   told to leave alone. */
{
  let moved = 0, tried = 0, ex = "";
  for(let root = 0; root < 12; root++) for(const mode in T.MODES)
    for(let m = 21; m <= 108; m++){
      if(!T.inKey(root, mode, m)) continue;
      tried++;
      const r = T.scaleStep(root, mode, m, 0);
      if(r !== m){ moved++; if(!ex) ex = `root ${root} ${mode} ${m} -> ${r}`; }
    }
  check("scaleStep keeps a note it is told to keep", moved === 0,
        moved ? moved + "/" + tried + " moved, e.g. " + ex : tried + " in-key pitches, all identity");
  /* ...and one step really is one scale degree, never a fifth of one */
  let bad = 0;
  for(let root = 0; root < 12; root++) for(const mode in T.MODES)
    for(let m = 36; m <= 84; m++){
      if(!T.inKey(root, mode, m)) continue;
      const up = T.scaleStep(root, mode, m, 1), dn = T.scaleStep(root, mode, m, -1);
      if(up - m < 1 || up - m > 3 || m - dn < 1 || m - dn > 3) bad++;
    }
  check("one scale step moves 1-3 semitones", bad === 0, bad + " out of range");
}

/* the comp must really invert. When the inversion search was a no-op the keys
   sat in one octave at the bottom of their band and voice-leading was dead
   code — silent, and only visible as "the chords never move". */
{
  const pitches = new Set();
  let span = 0;
  for(let s = 1; s <= 60; s++){
    const ks = M.composeSong(s).materials.A.keys.map(n => n.pitch);
    for(const p of ks) pitches.add(p);
    span = Math.max(span, Math.max(...ks) - Math.min(...ks));
  }
  const lo = Math.min(...pitches), hi = Math.max(...pitches);
check("the comp uses its whole register, not one octave", hi - lo > 12,
        "keys span " + lo + ".." + hi + " (" + (hi - lo) + " semitones), widest single song " + span);
}

/* The three things reading the ROLL exposed that no audio measurement could.
   A second line that moves in parallel with the tune on every note is a
   harmoniser; a bridge with the verse's exact kit is not a departure; and
   four identical bars of eighth-note hats is a metronome. All three were true
   and all three were invisible in a spectrum. */
{
  let contrary = 0, parallel = 0, oblique = 0, sounded = 0, total = 0;
  let bridgeSame = 0, chorusSame = 0, songs = 0, flourish = 0;
  const sig = ns => ns.map(n => n.bar + ":" + n.step + ":" + n.lane).sort().join(",");
  for(let s = 1; s <= 120; s++){
    const m = M.composeSong(s, "band").materials;
    songs++;
    if(sig(m.A.drums) === sig(m.C.drums)) bridgeSame++;
    if(sig(m.A.drums) === sig(m.B.drums)) chorusSame++;
    /* the fourth bar must answer the first three, at least in the hats */
    const hb = b => m.A.drums.filter(n => n.lane === "hat" && n.bar === b).map(n => n.step).join(",");
    if(hb(3) !== hb(0)) flourish++;
    for(const [lead, ctr] of [[m.A.lead, m.A.counter], [m.B.lead, m.B.counter]]){
      if(!ctr.length) continue;
      total += lead.length; sounded += ctr.length;
      const at = new Map(); for(const n of ctr) at.set(n.bar + ":" + n.step, n.pitch);
      const L = lead.slice().sort((a, z) => a.bar - z.bar || a.step - z.step);
      let pl = null, pc = null;
      for(const n of L){
        const c = at.get(n.bar + ":" + n.step);
        if(c == null){ pl = n.pitch; continue; }
        if(pl != null && pc != null){
          const lm = n.pitch - pl, cm = c - pc;
          if(lm === 0 || cm === 0) oblique++;
          else if((lm > 0) !== (cm > 0)) contrary++;
          else parallel++;
        }
        pl = n.pitch; pc = c;
      }
    }
  }
  const tot = contrary + parallel + oblique;
  check("the counter-line is a LINE, not a harmoniser", contrary > parallel,
        `contrary ${(100*contrary/tot).toFixed(0)}% vs parallel ${(100*parallel/tot).toFixed(0)}% (oblique ${(100*oblique/tot).toFixed(0)}%)`);
  check("the counter has its own rhythm", sounded / total < 0.8,
        `sounds on ${(100*sounded/total).toFixed(0)}% of the tune's notes`);
  check("the bridge is a departure, not the verse's kit", bridgeSame === 0,
        bridgeSame + "/" + songs + " bridges share the verse's drums");
  check("the chorus changes the kit", chorusSame === 0,
        chorusSame + "/" + songs + " choruses share the verse's drums");
  check("the fourth bar answers the first three", flourish > songs * 0.5,
        flourish + "/" + songs + " loops vary their last bar's hats");
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
