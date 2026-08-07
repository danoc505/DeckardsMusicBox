#!/usr/bin/env node
/* MK2 seam tests — the note-level battery, runnable in seconds without a browser.
   The output battery (rendered WAV assertions) is mk2_render.js + analysis; THIS
   file guards the composition contract on every change:

     node harness/mk2_test.js [nSeeds] [name-filter]

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
eval(src + ";global.__T = { degMidi, MODES, inKey, scaleStep, intoBand, GENRE };");
const M = global.window.MK2;
const T = global.__T;

const N = parseInt(process.argv[2], 10) || 300;

/* ── AN OPTIONAL NAME FILTER ────────────────────────────────────────────────
     node harness/mk2_test.js kit
     node harness/mk2_test.js 40 "picks a thing"

   Any argument that is not a number is a case-insensitive substring matched
   against the check's NAME. This exists because the battery is 130-odd checks
   and after a change to one seam I want the answer about that seam, not a wall
   I have to read carefully enough to spot one ✗ in.

   BE HONEST ABOUT WHAT IT DOES: it filters the ANSWER, not the WORK. The
   composition loops that feed the checks are shared and still run, so a
   filtered run costs what a full one costs. It buys legibility, not seconds.

   AND A FILTERED RUN IS NOT THE BATTERY. The summary says so and names the
   filter, because "0 failed" printed after a filtered run is exactly the kind
   of true-but-narrow sentence this repo has been burned by before (the
   snapshot that said IDENTICAL about one seventh of the program). Skipped
   checks are counted and reported so the number can never read as a total. */
const FILTER = process.argv.slice(2).find(a => a && !/^\d+$/.test(a) && !a.startsWith("--"));
const matches = name => !FILTER || name.toLowerCase().includes(FILTER.toLowerCase());

let pass = 0, fail = 0, skipped = 0;
const check = (name, ok, detail) => {
  if(!matches(name)){ skipped++; return; }
  console.log((ok ? "  ✓ " : "  ✗ FAIL: ") + name + (detail ? "  (" + detail + ")" : ""));
  ok ? pass++ : fail++;
};

/* ═══════════════════════════════════════════════════════════════════════════
   THE STAMP MUST MOVE WHEN THE PROGRAM MOVES.

   The artifact the user listens to was found to be exactly commit 0f3a0a9 while
   the repo was six commits on -- three of them program changes nobody had heard,
   because they were never in the file being played. What hid it was that BOTH
   FILES CARRIED THE STAMP `build 2026-07-29r`. The stamp exists to tell a stale
   page from a broken program and it had not been bumped for a day's work, so the
   one instrument that answers this question read the same on both.

   Nothing in this repo could catch that, which is the real defect: the stamp was
   a matter of discipline, and discipline is what had already failed. So it is a
   seam now. `harness/mk2_stamp.js` owns the logic and the explanation; this runs
   it inside the battery, because a guard nobody runs guards nothing.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  const { execFileSync } = require("child_process");
  let out = "", ok = true;
  try { out = execFileSync(process.execPath,
          [path.resolve(__dirname, "mk2_stamp.js"), "check"], { encoding: "utf8" }); }
  catch(e){ ok = false; out = (e.stdout || "") + (e.stderr || ""); }
  const first = out.split("\n").map(s => s.trim()).filter(Boolean)[0] || "no output";
  check("the build stamp identifies this build", ok,
        ok ? first.replace(/^✓ /, "") : "run: node harness/mk2_stamp.js check");
  if(!ok) console.log(out.split("\n").map(l => "      " + l).join("\n"));
}

const errors = [];
let dilla = 0, hookExact = 0, hookTotal = 0, forms = new Set(), nondet = 0, ruleOf3 = 0;
let dillaIdentical = 0, dillaChecked = 0;
let rigs = {}, rigSame = 0, rigChecked = 0, rigVoices = 0, unknownVoice = [];

/* EVERY VOICE AN EVENT NAMES MUST BE ONE THE PROGRAM CAN DISPATCH. This used to
   compare against a set of thirteen names typed into this file, which proved the
   copy was current and nothing else -- and it went stale the moment the RACK
   could name a voice (mellotron, k808, acid303) that no rig names. It now asks
   the shipped voice table directly, so a machine wired into a slot without a
   voice behind it fails here instead of throwing at the first note played. */
const RIG_NAMES = new Set(M.voiceNames());

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

/* ═══════════════════════════════════════════════════════════════════════════
   THE BLEND. A genre blend is an INPUT to stage 1 like the rig and the picks,
   so the seam checks apply to it exactly as they do to a plain genre -- a
   blended song either composes or it throws, and there is no third state.

   Two things get measured here and both were found the hard way. Averaging a
   field whose domain is INTEGERS produces values outside the domain: counter
   intervals are scale steps, and half a scale step indexes MODES[mode][3.5],
   gets undefined, and yields NaN. And drawing two fields independently that
   only mean something together -- the ostinato cell and the register set --
   gave 172 failures in 1890 blended songs until they were grouped.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  const gs = M.genres();
  let tot = 0, ok = 0; const why = {};
  for(let i = 0; i < gs.length; i++) for(let j = i + 1; j < gs.length; j++)
    for(const w of [0.25, 0.5, 0.75])
      for(let seed = 1; seed <= 8; seed++){
        tot++;
        try { M.composeSong(seed, undefined, { [gs[i]]: 1 - w, [gs[j]]: w }); ok++; }
        catch(e){ const k = e.message.replace(/\d+/g, "#").slice(0, 46); why[k] = (why[k] || 0) + 1; }
      }
  /* ── 100% NOW, AND THE 99% WAS COVERING FOR A BUG ──────────────────────────
     This tolerance used to read: "a blend CAN genuinely collide -- two register
     sets that each work alone can crowd one pitch -- and the seam check is
     right to throw." That was a reasonable-sounding story and it was wrong.
     Every failure it was absorbing was ONE defect: `keysA` is built once and
     used in both A and Avar, but was only ever shown `ostA`, so it could voice
     a chord onto a pitch the VARIED ostinato was about to take. The tell was
     sitting in the failure message the whole time -- the material was always
     Avar, never A, B or C.
     Fixed at its owner (the comp now avoids both ostinati), and with the cause
     gone the tolerance is a place for the next one to hide. 504/504. */
  check("blended genres compose", ok === tot,
        `${ok}/${tot} pairs at 25/50/75` +
        (Object.keys(why).length ? "  |  " + Object.keys(why).map(k => why[k] + "x " + k).join(" ") : ""));
  const nan = Object.keys(why).some(k => /NaN|undefined/.test(k));
  check("no blend produces a NaN or an undefined read", !nan,
        nan ? Object.keys(why).filter(k => /NaN|undefined/.test(k)).join(" | ") : "integer domains hold");
  /* all seven at once is the extreme the sliders allow */
  let all = 0;
  const seven = {}; for(const g of gs) seven[g] = 1 / gs.length;
  for(let seed = 1; seed <= 20; seed++){ try { M.composeSong(seed, undefined, seven); all++; } catch(e){} }
  check("every genre blended at once still composes", all >= 19, all + "/20");
  /* and a blend of ONE must be the plain genre, byte for byte, or the snapshot
     means nothing the moment anyone touches a slider */
  let same = 0;
  for(const g of gs) for(let seed = 1; seed <= 5; seed++){
    const a = JSON.stringify(M.composeSong(seed, "band", g).perf.events);
    const b = JSON.stringify(M.composeSong(seed, "band", { [g]: 1 }).perf.events);
    if(a === b) same++;
  }
  check("a blend of one genre IS that genre", same === gs.length * 5,
        same + "/" + (gs.length * 5) + " identical");
}

/* VARY(A) MUST VARY SOMETHING THE GENRE ACTUALLY PLAYS. Avar is the material
   the rule of three is answered with -- "start the same, go somewhere different
   halfway" -- and it redrew the LEAD and the counter, full stop. That is fine
   for five of the seven genres and a no-op for the two whose tune is not a lead:
   Plastikman's melodic content is its ostinato and jungle's is the break itself,
   and neither has a lead role in any section. So their Avar came out
   byte-identical to A in every role, and a form that alternates verse and
   instrumental specifically to satisfy the rule of three was stating the same
   music eleven times running. The section names passed the law; the notes
   defeated it. This check compares Avar to A across only the roles the genre is
   ever heard playing. */
{
  const dead = [], rows = [];
  for(const g of M.genres()){
    const song = M.composeSong(1, undefined, g), m = song.materials;
    const played = new Set();
    for(const e of song.perf.events) if(e.role !== "tape") played.add(e.role);
    const sig = x => JSON.stringify((x || []).map(n => [n.bar, n.step, n.pitch, n.lane, n.slice]));
    const useful = ["ostinato", "bass", "keys", "lead", "counter", "drums"]
      .filter(r => played.has(r) && sig(m.A[r]) !== sig(m.Avar[r]));
    rows.push(`${g} [${useful.join(",") || "NOTHING"}]`);
    if(!useful.length) dead.push(g);
  }
  check("vary(A) varies something the genre actually plays", dead.length === 0,
        rows.join("  "));
}

/* ── `leadChar` NAMES A VOICE THAT EXISTS, IN EVERY GENRE ──────────────────
   `V.lead` dispatches on `ev.timbre`: a name that resolves to a voice hands the
   note over, and anything else falls through to the house lead's own body. That
   fall-through is deliberate -- it is what `"synth"` means, and it is what
   keeps six genres byte-identical -- but it also means A TYPO IS SILENT. Write
   `"rhodez"` and lofi goes back to the sawtooth for good, with no error, no red
   check, and nothing on screen to say so. That is the exact shape of defect
   this file keeps finding: a lookup that misses and degrades politely.

   So: every genre must declare `leadChar`, and every value it can draw must be
   either the literal `"synth"` or the name of a real voice. Derived from the
   tables and from `voiceNames()`, so a voice renamed tomorrow fails here
   tomorrow. */
{
  const bad = [], rows = [];
  const voices = new Set(M.voiceNames());
  for(const g of M.genres()){
    const tbl = M.composeSong(1, "draw", g).chart.table;
    const lc = tbl.leadChar;
    if(!Array.isArray(lc) || !lc.length){ bad.push(`${g}: no leadChar`); continue; }
    const names = lc.map(p => p[0]);
    for(const n of names)
      if(n !== "synth" && !voices.has(n)) bad.push(`${g}: leadChar "${n}" is not a voice`);
    rows.push(`${g}[${names.join("/")}]`);
  }
  check("every genre says what its lead player is holding, and it exists",
        bad.length === 0, bad.length ? bad.join(" | ") : rows.join(" "));
}

/* ...AND THE CHART ACTUALLY CARRIES IT. The draw is on its own substream
   (`stream(seed, "leadchar")`) precisely so that adding it moved no note; the
   cost of that is that nothing downstream would notice if the draw were
   dropped, because every genre but one declares the value it already had. */
{
  const missing = [];
  for(const g of M.genres()) for(const s of [1, 2, 3]){
    const song = M.composeSong(s, "draw", g);
    if(!song.chart.leadChar) missing.push(`${g}/${s}`);
    const lead = song.perf.events.find(e => e.role === "lead" || e.role === "counter");
    if(lead && lead.timbre !== song.chart.leadChar)
      missing.push(`${g}/${s}: event says "${lead.timbre}", chart says "${song.chart.leadChar}"`);
  }
  check("...and every lead note carries it out of stage 5",
        missing.length === 0, missing.slice(0, 3).join(" | "));
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
  /* ── ASK THE GENRES THAT HAVE A COUNTER, NOT WHICHEVER IS FIRST ───────────
     This composed `composeSong(s, "band")` -- no genre argument, so the DEFAULT
     genre -- and measured its counter. That silently made the whole check a
     statement about lofi, and the day lofi declared `counter: null` it reported
     `contrary NaN% vs parallel NaN%`: a green check turned into a nonsense one
     because the subject walked away. The property is about any genre with a
     LINE counter (a "double" is deliberate parallel octaves and would fail by
     design), so the genres are derived from the tables. The drum half of this
     loop still wants one genre with a full kit, and keeps the default. */
  const LINE = M.genres().filter(g => {
    const c = T.GENRE[g] && T.GENRE[g].counter;
    return c && c.style === "line";
  });
  for(let s = 1; s <= 120; s++){
    const m = M.composeSong(s, "band").materials;
    songs++;
    if(sig(m.A.drums) === sig(m.C.drums)) bridgeSame++;
    if(sig(m.A.drums) === sig(m.B.drums)) chorusSame++;
    /* the fourth bar must answer the first three, at least in the hats */
    const hb = b => m.A.drums.filter(n => n.lane === "hat" && n.bar === b).map(n => n.step).join(",");
    if(hb(3) !== hb(0)) flourish++;
    /* the counter half reads the genres that HAVE one, at the same seed */
    const pairs = [];
    for(const g of LINE){
      const mg = M.composeSong(s, undefined, g).materials;
      pairs.push([mg.A.lead, mg.A.counter], [mg.B.lead, mg.B.counter]);
    }
    for(const [lead, ctr] of pairs){
      if(!ctr || !ctr.length) continue;
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

/* EVERY GENRE, not just the one that shipped first. Law 4 says a genre is
   parameter tables only -- so the way to test that claim is to run the same
   laws against every table in the file and let the seam checks throw. */
{
  const genres = M.genres();
  for(const g of genres){
    const errs = [];
    let hookExact = 0, r3 = 0, forms = new Set(), nondet = 0;
    for(let s = 1; s <= 120; s++){
      let song;
      try{ song = M.composeSong(s, undefined, g); }
      catch(e){ if(errs.length < 3) errs.push(s + ": " + e.message); continue; }
      forms.add(song.form.map(x => x.fn).join(","));
      const B = song.materials.B.lead;
      const sig = b => B.filter(n => n.bar === b).map(n => n.step + "/" + n.pitch).join(",");
      if(sig(0) === sig(2) && sig(1) === sig(3)) hookExact++;
      for(let i = 2; i < song.form.length; i++)
        if(song.form[i].fn === song.form[i-1].fn && song.form[i].fn === song.form[i-2].fn) r3++;
      if(s <= 10 && JSON.stringify(song.perf.events) !==
                    JSON.stringify(M.composeSong(s, undefined, g).perf.events)) nondet++;
    }
    check(`[${g}] every seed composes and passes its own seam checks`, errs.length === 0,
          errs.length ? errs.join(" | ") : "120 seeds");
    check(`[${g}] same seed, same events`, nondet === 0, nondet + " mismatches in 10");
    check(`[${g}] the hook restates itself exactly`, hookExact === 120, hookExact + "/120");
    check(`[${g}] no function three times in a row`, r3 === 0, r3 + " violations");
    check(`[${g}] forms genuinely vary`, forms.size > 20, forms.size + " distinct in 120");
  }
  /* ...and the genres must not all be the same song in a hat */
  const fp = g => {
    const x = M.composeSong(7, undefined, g);
    return [x.chart.tempo, x.materials.pocket.join("/"), x.perf.groove.style,
            x.materials.A.drums.length, x.form.nBars].join(" ");
  };
  const seen = new Map();
  for(const g of genres) seen.set(g, fp(g));
  /* the bass STYLES have to produce different behaviour, not just different
     numbers in a table. A pedal, a pocket-follower and an eighth-note sequencer
     are three instruments; if they converge, a table entry is doing nothing.
     Measured when this landed: lofi 10.6 notes per 4 bars, synthwave 30.8,
     dkc 7.3 -- and the counter sounding on 63% / 90% / 45% of the tune. */
  {
    const dens = {};
    for(const g of genres){
      let n = 0, songs = 0, lead = 0, ctr = 0;
      for(let s = 1; s <= 60; s++){
        const m = M.composeSong(s, undefined, g).materials;
        n += m.A.bass.length; songs++;
        for(const k of ["A", "B"]){ lead += m[k].lead.length; ctr += (m[k].counter || []).length; }
      }
      dens[g] = { bass: n / songs, ctr: lead ? ctr / lead : 0 };
    }
    /* THE BUILDER MUST DO WHAT ITS OWN TABLE ASKS. Two thresholds have been
       tried here and both were wrong. The first required every GENRE's bass
       density to be distinct, which broke when two genres shared a style. The
       second required a style's density to be TIGHT across the genres sharing
       it -- and that broke the moment the two acid genres wanted different
       lines, which is the entire point of having an `acidLine` table: acid
       house is 9-13 notes of 16 and Plastikman is 5-8 of the 12 the kick leaves
       open, same builder, different music.

       What is actually checkable is the builder against its own parameters. An
       acid line's note count is its declared density; a pulse's is its
       division. Predict from the table, compare to the notes, and a table entry
       that does nothing shows up immediately as a prediction that does not
       move. */
    const bad = [];
    for(const g of genres){
      const G2 = T.GENRE[g], got = dens[g].bass;
      let want = null;
      if(G2.bassStyle === "acid"){
        const d = G2.acidLine.density;
        want = ((d[0] + d[1]) / 2) * 4;                 // per bar x 4 bars
      } else if(G2.bassStyle === "pulse"){
        const P2 = G2.bassPulse;
        want = (16 / P2.unit) * 4 * (1 - P2.restChance * 0.9);
      } else if(G2.bassStyle === "riff"){
        /* the riff is a CELL of `notes` notes spanning `bars` bars, restated
           until the material runs out -- so a 4-bar material plays it 4/bars
           times. Predicting it is the point of this check: a style with no
           prediction cannot be told apart from a broken one, which is what the
           `pred` fallback below says in its own comment. */
        const F2 = G2.bassRiff;
        want = ((F2.notes[0] + F2.notes[1]) / 2) * (4 / F2.bars);
      }
      if(want != null && Math.abs(got - want) > Math.max(2, want * 0.18))
        bad.push(`${g} writes ${got.toFixed(1)}, its table asks for ~${want.toFixed(1)}`);
    }
    /* ...and the styles must still be telling different instruments apart.

       THIS USED TO AVERAGE THE GENRES INSIDE EACH STYLE and compare the means,
       which is the same mistake the comment at the top of this check describes
       and then walks away from. Acid house writes 44 notes and Plastikman 18 --
       deliberately, that is the whole reason `acidLine` is a table -- and their
       MEAN is 31, which collided with pulse's 31 the moment Plastikman was made
       sparser. The check went red for a change that was correct, and it would
       have gone green again for any change that happened to move the average
       back, which is worse.

       A style is not a number, so do not reduce it to one. The real property is
       pairwise: two genres on DIFFERENT builders should not land on the same
       note count unless their own tables asked them to. That compares each
       genre against its own declaration, which is the axis the rest of this
       check already uses. */
    const byStyle = {};
    for(const g of genres) (byStyle[T.GENRE[g].bassStyle] ||= []).push(dens[g].bass);
    const collisions = [];
    for(let i = 0; i < genres.length; i++) for(let j = i + 1; j < genres.length; j++){
      const a = genres[i], b2 = genres[j];
      if(T.GENRE[a].bassStyle === T.GENRE[b2].bassStyle) continue;
      if(Math.abs(dens[a].bass - dens[b2].bass) > 2) continue;      // clearly different
      /* same output from different builders is only honest if both tables asked
         for it -- predict for each, and if either has no prediction we cannot
         tell, so say so rather than pass silently */
      const pred = gg => {
        const G3 = T.GENRE[gg];
        if(G3.bassStyle === "acid") return ((G3.acidLine.density[0] + G3.acidLine.density[1]) / 2) * 4;
        if(G3.bassStyle === "pulse") return (16 / G3.bassPulse.unit) * 4 * (1 - G3.bassPulse.restChance * 0.9);
        if(G3.bassStyle === "riff")
          return ((G3.bassRiff.notes[0] + G3.bassRiff.notes[1]) / 2) * (4 / G3.bassRiff.bars);
        return null;
      };
      const pa = pred(a), pb = pred(b2);
      if(pa == null || pb == null) continue;
      if(Math.abs(pa - pb) > 2)
        collisions.push(`${a}(${T.GENRE[a].bassStyle}) and ${b2}(${T.GENRE[b2].bassStyle}) ` +
                        `both write ~${dens[a].bass.toFixed(0)} but their tables ask for ${pa.toFixed(0)} vs ${pb.toFixed(0)}`);
    }
    check("each bass builder writes what its own table asks for",
          bad.length === 0 && collisions.length === 0,
          (bad.concat(collisions).join(" | ") || "predictions hold") + "  |  " +
          Object.keys(byStyle).map(k => `${k} ${byStyle[k].map(x => x.toFixed(0)).join("/")}`).join("  "));
    /* THE COUNTER SOUNDS AS OFTEN AS ITS TABLE SAYS IT DOES. This used to be a
       flat "more than 30% of the tune's notes" -- which is synthwave's octave
       double wearing the name of a law, and it failed the moment three genres
       arrived whose second voice is deliberately sparse: Vangelis answers on
       roughly one note in four ("call-and-response between Rhodes and CS-80"),
       Plastikman's is a delay tail at 0.22, acid's second 303 at 0.35. A flat
       threshold cannot tell "the genre wants little" from "the code delivers
       nothing", so it now checks the genre's own declared density -- the table
       is the contract, and the floor stops a genre buying a pass by declaring
       zero. Measured when this landed: every genre delivers 92-99% of what it
       declared. */
    /* A GENRE MAY DECLARE NO COUNTER AT ALL. This read `.counter.density`
       unconditionally, which was safe only while every genre had a table --
       including the three that declared one and never let the arrangement play
       it. The moment those said `counter: null` honestly, the harness itself
       threw. A genre with no counter is not a genre failing this check; it is a
       genre this check does not apply to. */
    const withCtr = genres.filter(g => T.GENRE[g].counter);
    /* ── AND THE FLOOR WAS DOING A JOB THE `null` PATH ALREADY DOES ──────────
       This required a declared density of at least 0.15, "so the floor stops a
       genre buying a pass by declaring zero". That guard predates the note
       directly above it: a genre with no counter now says `counter: null` and
       is excluded from this check entirely, so the zero-declaration dodge is
       already closed by a different and better door.

       What the 0.15 floor did instead was make a SPARSE counter illegal, and
       there is a sourced reason to want one -- an ornament that "doubles only
       the beginning of the main melody line" and is marked "touches", "not too
       loud" [Alan Belkin, Artistic Orchestration]. Dungeon synth declares 0.10
       and delivers 9%, which is the contract being kept, not dodged.

       0.06 is roughly one note in sixteen: the sparsest a line can be and
       still be a line rather than an accident. THE RATIO IS THE REAL CHECK and
       it is untouched -- a genre still has to deliver 70% of whatever it asks
       for, and this was driven to failure at 0.06 before it was believed. */
    /* ── AND A PART THE GENRE NAMES MUST ACTUALLY BE HEARD ───────────────────
       THE CHECK ABOVE READS `materials` -- what the BUILDER WROTE -- and not
       `perf.events`, what the song plays. That is a legitimate thing to check
       and its name oversells it, but the gap matters: with `counter` deleted
       from every one of dungeon synth's sections, so that no part of any song
       could possibly play it, the check above still reported a happy 9%.

       That is the same shape as the defect that hid the timpani for a week --
       `procession` carried a `legacy` flag, no song could select it, and every
       check in this file stayed green because they all asked whether a thing
       WORKS and none asked whether anything CALLS it.

       So: for every role a genre's own `form.roles` names, that role must reach
       the PERFORMANCE in a decent share of songs. THIS IS AN ABSENCE CHECK, not
       a rarity one -- 15% is deliberately far below every real figure so that
       it catches ZERO and never argues with a genre about taste. Measured when
       it landed: acid's keys 29% is the lowest anything real sits at, dungeon
       synth's ornamental counter 71%, and everything else 75-100%. Driven to
       failure before it was believed, by composing a declared role away. */
    {
      const bad = [];
      for(const g of genres){
        const named = new Set();
        for(const list of Object.values(T.GENRE[g].form.roles || {}))
          for(const r of list) named.add(r);
        const hit = {}, N = 16;
        for(let s = 1; s <= N; s++){
          const roles = new Set(M.composeSong(s, "band", g).perf.events.map(e => e.role));
          for(const r of named) if(roles.has(r)) hit[r] = (hit[r] || 0) + 1;
        }
        for(const r of named)
          if((hit[r] || 0) / N < 0.15) bad.push(`${g}.${r} ${Math.round(100*(hit[r]||0)/N)}%`);
      }
      check("every part a genre's own roles table names is actually heard",
            bad.length === 0,
            bad.length ? "declared and silent: " + bad.join(", ")
                       : `${genres.length} genres, every named role reaches the performance`);
    }
    check("the counter sounds as often as its table declares",
          withCtr.every(g => {
            const want = T.GENRE[g].counter.density;
            return want >= 0.06 && dens[g].ctr >= want * 0.70;
          }),
          withCtr.map(g => `${g} ${(100*dens[g].ctr).toFixed(0)}% of ` +
                          `${(100*T.GENRE[g].counter.density).toFixed(0)}% asked`).join("  ") +
          `  ·  no counter: ${genres.filter(g => !T.GENRE[g].counter).join(",") || "none"}`);
  }
  /* THE DRUMMER HAS TO ACTUALLY USE THE TOMS. A kit with three tom voices that
     nothing ever strikes is three dead voices and a fill that is a snare roll.
     Measured when this landed: synthwave 12.9 hits a song in 111/120 songs,
     lofi 3.7 in 49/120, dkc 3.8 in 81/120 -- a genre may want few, but a genre
     that declares toms must play them. */
  {
    const rows = [];
    let anyGenreUses = 0;
    for(const g of genres){
      let hits = 0, songs = 0, withToms = 0;
      for(let s = 1; s <= 60; s++){
        const ev = M.composeSong(s, undefined, g).perf.events;
        const n = ev.filter(e => /^tom/.test(e.lane || "")).length;
        hits += n; songs++; if(n > 0) withToms++;
      }
      /* A GENRE THAT DECLARES TOMS MUST PLAY THEM -- AND ONE THAT DOES NOT MUST
         NOT. The first version of this asserted every genre reaches for the
         toms, which is synthwave's drummer imposed on everybody, and it broke
         the moment a genre arrived with no drum kit at all: there is no kit
         anywhere in the Blade Runner score, acid house's fill is a filter rather
         than a drum, and a Plastikman bar that answers itself with a tom roll is
         the exact gesture that music refuses. So the check reads the genre's own
         `kit.toms.use` and holds it to it in BOTH directions -- which is what
         stops a genre buying a pass by simply declaring nothing. */
      const want = T.GENRE[g].kit.toms.use;
      const rate = withToms / songs;
      rows.push(`${g} wants ${want} -> ${(hits/songs).toFixed(1)}/song in ${withToms}/${songs}`);
      if(want >= 0.25 ? rate > 0.25 : rate < 0.35) anyGenreUses++;
    }
    check("the toms are played exactly as much as each genre asks",
          anyGenreUses === genres.length, rows.join("  |  "));
  }
  check("the genres are actually different music", new Set(seen.values()).size === genres.length,
        [...seen].map(([g, v]) => `${g}: ${v}`).join("  |  "));
}

/* THE MIDI EXPORT MUST CARRY EVERY NOTE. MIDI_TRACK is a table keyed by role, and
   a role with no entry is dropped in total silence -- which is what happened when
   the ostinato arrived: 1520 of DKC's 3009 notes never reached the file, i.e. the
   entire identity of the genre, missing from the artefact a musician opens. The
   .mid is the deliverable the author cannot hear, so it gets checked like one. */
{
  const parse = bytes => {
    const b = Buffer.from(bytes);
    let p = 0, ons = 0;
    const str = n => { const v = b.slice(p, p + n).toString("latin1"); p += n; return v; };
    const u32 = () => { const v = b.readUInt32BE(p); p += 4; return v; };
    const u16 = () => { const v = b.readUInt16BE(p); p += 2; return v; };
    if(str(4) !== "MThd") throw new Error("not a MIDI file");
    u32(); u16(); const ntrk = u16(); u16();
    for(let t = 0; t < ntrk; t++){
      if(str(4) !== "MTrk") throw new Error("bad track");
      const len = u32(), end = p + len;   // u32() advances p, so read it FIRST
      let running = 0;
      while(p < end){
        let c; do { c = b[p++]; } while(c & 0x80);       // delta time
        let st = b[p];
        if(st & 0x80){ p++; running = st; } else st = running;
        if(st === 0xff){ p++; let l = 0, k; do { k = b[p++]; l = (l << 7) | (k & 0x7f); } while(k & 0x80); p += l; }
        else if(st === 0xf0 || st === 0xf7){ let l = 0, k; do { k = b[p++]; l = (l << 7) | (k & 0x7f); } while(k & 0x80); p += l; }
        else { const hi = st & 0xf0; if(hi === 0x90 && b[p + 1] > 0) ons++; p += (hi === 0xc0 || hi === 0xd0) ? 1 : 2; }
      }
      p = end;
    }
    return ons;
  };
  /* every drum lane the exporter can write, INCLUDING the break -- a chopped
     bar exports as whatever drums its source slices strike, so it is notes
     like any other lane and has to be counted like any other lane. */
  /* ── ASK THE PROGRAM WHICH LANES IT CAN EXPORT, DO NOT COPY THE LIST ────────
     This was a hand-written set, and it was missing rim, clap, crash and ride
     -- the same four GM_DRUM was missing. A check whose lane list is copied
     from the table it is checking agrees with it by construction and proves
     nothing: four lanes were being dropped from every .mid and this check was
     green throughout, because it had been told not to look at them.

     It bit when minimal techno put its polymeter on the rim and the clap: the
     two sequencers the genre is built on exported as silence.

     Derived now, so the next lane to gain a voice is covered without anyone
     remembering to come back here. */
  const LANES = new Set(Object.keys(M.gmDrum()).concat(["brk"]));
  let bad = [];
  for(const g of M.genres()) for(const seed of [1, 2, 3]){
    const song = M.composeSong(seed, undefined, g);
    const want = song.perf.events.filter(e => e.role !== "tape" &&
      (e.role === "drums" ? LANES.has(e.lane) : e.pitch != null)).length;
    const got = parse(M.toMidi(song));
    if(got !== want) bad.push(`${g}/${seed}: ${got} of ${want}`);
  }
  check("the .mid carries every note of every genre", bad.length === 0,
        bad.length ? bad.join(" | ") : M.genres().length * 3 + " songs round-trip exactly");
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE RACK AND THE MOTION. Six checks over the two things the conductor now
   owns that it did not before: WHICH machine plays a slot, and how its knobs
   move while it does.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  /* ── 1. A GENRE MUST NOT AUTOMATE A KNOB NO VOICE READS. This is the check
     that matters most here, and it exists because the failure it catches was
     found by hand in this codebase: `cs80`, `subbass`, `chipbass` and
     `chipkeys` all DECLARE controls that no voice ever reads, so their sliders
     move and nothing happens. A panel knob that does nothing is a lie the user
     cannot detect by listening. Automating one would be the same lie with a
     composer behind it. So: scan the shipped source for the knob reads the
     voices actually perform, and require every automated control to be in that
     set. The four that WERE dead -- subbass.cut, subbass.drive, chipbass.bright
     and chipkeys.bright -- are wired now, and check 1b below is what stops any
     new one being declared. */
  const READS = new Set();
  const rx = /P\(g,\s*ev,\s*"([A-Za-z0-9]+)",\s*"([A-Za-z0-9]+)"/g;
  for(let mm; (mm = rx.exec(src)); ) READS.add(mm[1] + "." + mm[2]);
  /* ── A SHARED STAGE READS THE SAME CONTROL ON MANY MACHINES ───────────────
     `stereoOut` is one helper that every panned voice routes through, so it
     reads P(g, ev, m, "pan") with the MACHINE AS A VARIABLE. A scanner looking
     for a literal machine name cannot see that, and reported nine live knobs
     as dead. The honest generalisation, not an exemption: a P() call whose
     machine is a variable and whose control is a literal reads that control on
     EVERY machine that declares it -- which is exactly what such a helper
     does. Derived from the source, so a new shared stage is picked up without
     touching this list. */
  /* ...and the machine may be a CALL, not just a name. `DM(g)` -- "whichever
     drum panel this graph is on" -- is the same idea as a bare variable and the
     pattern could not see it, so every control the 808-circuit voices read had
     to be hand-listed below. That list went stale the first time a control was
     added to those voices (`punch`), which is this repo's fifth instance of
     "anything that LISTS what the program contains will go stale". Widened to
     allow one call, so the reads are DERIVED and the list is gone. */
  /* ...and it may be a PROPERTY, `g.drumMachine` — "whichever drum machine this
     song loaded". Same idea again, and the pattern could not see it because it
     allowed a bare name or a call but not a dot, while the SUFFIX pattern below
     has allowed any expression (`[^,]+`) all along. Two scanners over the same
     source disagreeing about what a machine expression looks like.

     It went red on six live controls: the dungeon kit's `ring`, `pSet`, `pTune`,
     `pAtk`, `pRel` and `pTone`, which a kit brings onto the TR-1000 and whose
     voices read `P(g, ev, g.drumMachine, "ring", 1)`. VERIFIED BEFORE WIDENING,
     rather than widened to make a red line go green — with the genre loaded the
     way the page loads it, every one of the six reads the genre's own value off
     the machine that is playing:

       panelValue(tr1000.ring) = 1.05   declared 1.05
       panelValue(tr1000.pTune) = 1     declared 1
       panelValue(tr1000.pAtk) = 0.003  declared 0.003   …and so on

     So the reads are real and the pattern was blind. Widened to allow a dotted
     expression, which is what its sibling already allowed. */
  const rxv = /P\(g,\s*ev,\s*[A-Za-z_$][A-Za-z0-9_$.]*(?:\([^()]*\))?,\s*"([A-Za-z0-9]+)"/g;
  const viaHelper = new Set();
  for(let mm; (mm = rxv.exec(src)); ) viaHelper.add(mm[1]);
  for(const m in M.INSTRUMENTS)
    for(const c of M.INSTRUMENTS[m].controls)
      if(viaHelper.has(c.k)) READS.add(m + "." + c.k);
  /* ── AND A KEY MAY BE BUILT, NOT WRITTEN ──────────────────────────────────
     `chTune` and `chDecay` read `P(g, ev, g.drumMachine, grp + "Tune", 0)`:
     the machine is a variable AND the key is a variable plus a literal suffix,
     so the pattern above sees neither half. Twenty controls per drum machine
     -- every channel's TUNE and DECAY -- were read at every note and invisible
     to this scan.

     They were passing anyway, and that is the part worth recording: they were
     DECLARED `kind:"bus"`, which drops them into PER_SONG below, which is the
     "ridden by setSpace" list. Nothing rides them. A wrong label on the
     declaration was standing in for a scanner that could not see the read, and
     the two errors cancelled to a green check. It went red the moment the
     label was corrected to `gesture`, which is the check doing its job.

     So the suffix is scanned too, and which prefixes it applies to is DERIVED
     FROM THE MACHINE: a chain letter is a prefix for which the machine
     declares the whole six-knob channel (Tune, Decay, Mix, Verb, Echo, Cut).
     That is what the chain block IS, so a machine that adopts it is covered
     the day it does, and a lone `fooDecay` on some other panel is not swept up
     by the suffix. */
  const CHAIN_SUFFIX = ["Tune", "Decay", "Mix", "Verb", "Echo", "Cut"];
  const rxb = /P\(\s*g,\s*ev,\s*[^,]+,\s*[A-Za-z_$][A-Za-z0-9_$]*\s*\+\s*"([A-Za-z0-9]+)"/g;
  const builtSuffix = new Set();
  for(let mm; (mm = rxb.exec(src)); ) builtSuffix.add(mm[1]);
  for(const m in M.INSTRUMENTS){
    const keys = new Set((M.INSTRUMENTS[m].controls || []).map(c => c.k));
    const letters = new Set();
    for(const k of keys){
      for(const suf of CHAIN_SUFFIX){
        if(!k.endsWith(suf)) continue;
        const p = k.slice(0, -suf.length);
        if(p && CHAIN_SUFFIX.every(s => keys.has(p + s))) letters.add(p);
      }
    }
    for(const p of letters) for(const suf of builtSuffix)
      if(keys.has(p + suf)) READS.add(m + "." + p + suf);
  }

  /* two reads name their key through a variable rather than a literal: the
     808's two hats share one circuit and differ only by which decay control
     they name, and the chip's brightness is looked up by the machine name its
     factory was handed. Named here so the scan is honest about what it cannot
     see rather than silently missing them. */
  /* the two hat decays name their KEY through a variable -- the closed and open
     hat are one circuit at two decays and the voice is handed which one to read
     -- so no scanner can see them whatever it does about the machine. Which
     MACHINES have them is still derived, from the declarations, so a third
     machine with a hat circuit is covered the day it is declared. */
  for(const m in M.INSTRUMENTS)
    for(const k of ["chdecay", "ohdecay"])
      if((M.INSTRUMENTS[m].controls || []).some(c => c.k === k)) READS.add(m + "." + k);
  READS.add("chipbass.bright"); READS.add("chipkeys.bright");
  /* the whole acoustic kick reads through one helper keyed by a variable, and
     every gate's hold is looked up on whichever drum panel the plan names */
  for(const k of ["tune","decay","click","drive","body","gain"]) READS.add("kit." + k);
  READS.add("kit.hold"); READS.add("tr808.hold"); READS.add("tr1000.hold");
  /* THE 808-CIRCUIT VOICES NAME THEIR PANEL THROUGH A VARIABLE -- they read
     P(g, ev, DM(g), ...) rather than a literal, because the TR-1000's analogue
     engine IS the 808 and 909 rebuilt and shares every one of those voices.
     There used to be a hand-written list of those seven control keys here. It
     is gone: `rxv` above now reads a call as well as a name, so every control
     any such voice reads is derived from the shipped source and a new one is
     picked up the day it is written instead of the day someone remembers. */
  /* THE BUS GAINS are the only controls no voice reads at a note, because they
     are gain NODES the whole kit passes through rather than anything a note can
     ask about. They are not frozen -- setSpace writes an automation curve on
     them across the song -- so they are automatable, just not per note. That is
     what kind:"bus" now means. */
  const PER_SONG = new Set(["kit.bus","kit.gate","tr808.bus","tr808.gate",
    "segakit.bus","segakit.gate","amen.bus","tr1000.bus","tr1000.gate",
    /* the space: a delay division and five gain/filter nodes the whole mix
       passes through. setSpace reads them; rideBus rides five of them. */
    "echo.div","echo.fb","echo.tone","echo.hp","echo.send","echo.verb",
    /* the DP/4's four ALGO switches: which effect a unit IS, read once per
       song by setSpace and used to CONNECT the chosen algorithm, exactly as
       `echo.div` is read to set the delay time. A switch is never automated,
       so it can never appear in a motion lane -- but it does reach the sound,
       and this list is where that fact is stated. */
    "dp4.aAlgo","dp4.bAlgo","dp4.cAlgo","dp4.dAlgo",
    /* which way the pole's stripes climb: read once per song and applied as
       the SIGN of the sweep ramp, same shape as the DP/4's algo switches */
    "barber.dir",
    /* the desk: three shelf/bell gains the whole mix passes through, plus the
       three crossovers that place them */
    "desk.low","desk.mid","desk.high","desk.lowF","desk.midF","desk.highF",
    ]);
  /* ── THE PER-VOICE CHAINS, DERIVED, NOT LISTED ──────────────────────────────
     These were twenty names typed in for tr1000 alone. Then the acoustic kit and
     the 808 adopted the same block -- "reverb and delay aren't just spatial
     effects, they're arrangement tools" is a claim about techno in general, not
     about one Roland box -- and the list went stale the same afternoon it was
     written. It is now read off the rack, so a machine that adopts the chains
     is covered the moment it does.

     Being on this list is not proof of audibility. probe_chains measures that
     each chain moves its own drum and no other; this only asserts that a
     bus-kind control is ridden per song rather than read at a note. */
  /* DERIVED FROM `kind`, not from a name pattern. This matched
     /^[kshot](Cut|Drv|Echo|Verb|Mix)$/ -- which covered the chains and went stale
     the moment the TR-1000's top strip added revSend, dlySend and fxFilter. The
     declaration already says what these are: kind:"bus" MEANS a node the whole
     machine passes through, ridden per song rather than read at a note. Ask the
     declaration instead of guessing from the spelling. */
  for(const m in M.INSTRUMENTS)
    for(const c of M.INSTRUMENTS[m].controls)
      if(c.kind === "bus") PER_SONG.add(m + "." + c.k);


  const dead = [];
  for(const g of M.genres()){
    const mo = M.composeSong(1, "band", g).motion;
    /* a bus gain is automated by rideBus writing a curve on the node, not by a
       voice reading it at a note -- so PER_SONG counts as reached here too */
    for(const key in mo.lanes)
      if(!READS.has(key) && !PER_SONG.has(key)) dead.push(g + ":" + key);
  }
  check("every automated knob reaches the sound, at the note or on the bus", dead.length === 0,
        dead.length ? dead.join(" | ") : READS.size + " live controls, none automated in vain");

  /* ── 1b. NO KNOB ON ANY PANEL IS A LIE. Every control a machine declares must
     reach the sound somehow -- per note through P(), or per song through
     setSpace. Four of them did not for as long as the rack existed: they were
     drawn, they moved, and nothing happened. That is worse than a missing
     feature because a listener cannot detect it by listening. */
  {
    const unread = [];
    for(const m in M.INSTRUMENTS)
      for(const c of M.INSTRUMENTS[m].controls){
        const key = m + "." + c.k;
        /* a control marked `pick` is an INPUT to stage 1 -- it decides which
           voice a note calls, and is drawn as a select that recomposes. There is
           nothing for a voice to read, so demanding one would be wrong. */
        if(c.pick) continue;
        if(!READS.has(key) && !PER_SONG.has(key)) unread.push(key);
      }
    check("every knob on every panel reaches the sound", unread.length === 0,
          unread.length ? unread.join(" | ") : "all controls wired");
  }

  /* ── 1b-ii. WHAT THE GENRE SAYS MUST REACH THE PANEL. The check above proves
     a knob is wired to a voice; this proves the GENRE's setting for it is
     actually loaded, which is a different claim and was false for four genres.
     applyRack walked the three slots and skipped any set to "auto" -- and
     "auto" means "whatever the rig names", which is most machines. So every
     value a genre declared for a machine it reaches through the rig was thrown
     away: 69 of them, including Vangelis's cs80.initBend, the one control that
     makes that score identifiable. Nothing failed, nothing threw, and the
     panel showed a plausible factory default. This is the check that names it. */
  {
    const unapplied = [], unknown = [];
    for(const g of M.genres()){
      const song = M.composeSong(1, undefined, g);
      const P = (T.GENRE[g].params || {});
      for(const m in P) for(const k in P[m]){
        const key = m + "." + k, want = P[m][k], c = M.CONTROL[key];
        if(!c){ unknown.push(g + ":" + key); continue; }
        /* a DRAWN knob ("any", or a weighted table) has no single right answer.
           What it must still do is land on the dial: inside the ends and on a
           real step, because a patch switch handed 2.5 is a patch nobody has. */
        if(want === "any" || Array.isArray(want)){
          const v = M.panelValue(m, k), st = c.step || 1;
          const onStep = Math.abs((v - c.min) / st - Math.round((v - c.min) / st)) < 1e-6;
          if(!(v >= c.min - 1e-9 && v <= c.max + 1e-9 && onStep))
            unapplied.push(`${g}:${key} drew ${v}, off the dial [${c.min}..${c.max}/${st}]`);
          continue;
        }
        if(Math.abs(want - M.panelValue(m, k)) > 1e-9)
          unapplied.push(`${g}:${key} wants ${want} reads ${M.panelValue(m, k)}`);
      }
    }
    check("a genre's params name controls that exist", unknown.length === 0,
          unknown.length ? unknown.join(" | ") : "no phantom parameters");
    /* ...AND NO GENRE INHERITS THE LAST ONE'S SETTINGS. PARAMS is one global
       table, so a machine a genre says nothing about keeps whatever was loaded
       before it. Measured before the fix: composing Vangelis and then synthwave
       left the CS-80 holding a 1.0 initial pitch bend -- the Blade Runner scoop
       -- on every note of a genre that never asks for one. The check is
       decisive and cheap: composing A then B must leave the panel exactly where
       composing B alone does. */
    {
      const gs = M.genres(), leak = [];
      for(const b2 of gs){
        M.composeSong(1, undefined, b2);
        const alone = {};
        for(const m in M.INSTRUMENTS) for(const c of M.INSTRUMENTS[m].controls)
          alone[m + "." + c.k] = M.panelValue(m, c.k);
        for(const a2 of gs){
          if(a2 === b2) continue;
          M.composeSong(1, undefined, a2);
          M.composeSong(1, undefined, b2);
          for(const key in alone){
            const [m, k] = key.split(".");
            if(Math.abs(alone[key] - M.panelValue(m, k)) > 1e-9)
              leak.push(`${a2}->${b2} ${key}`);
          }
        }
      }
      check("no genre inherits the previous genre's panel", leak.length === 0,
            leak.length ? [...new Set(leak)].slice(0, 6).join(" | ") +
              (leak.length > 6 ? ` (+${leak.length - 6} more)` : "")
            : gs.length + " genres, every order gives the same panel");
    }

    check("every value a genre declares actually reaches the panel", unapplied.length === 0,
          unapplied.length ? unapplied.slice(0, 6).join(" | ") +
            (unapplied.length > 6 ? ` (+${unapplied.length - 6} more)` : "")
          : "all genre parameters loaded");

    /* ── ...AND A KNOB THE GENRE DREW IS ACTUALLY DIFFERENT ON A DIFFERENT SONG.
       This is the check the whole mechanism needs, because the failure mode is
       silent and familiar: `applyRack` skips a reload when the tag has not
       changed, so a draw made on the first song of a genre would have been
       frozen into every song after it -- a table pretending to be a draw,
       which is exactly the defect the draw was added to remove. It also pins
       the other half: THE SAME SEED IS THE SAME SONG, so a re-compose of one
       seed must return the identical knob. [Law 3] */
    {
      const drawn = [], stuck = [], unstable = [];
      for(const g of M.genres()){
        const P = (T.GENRE[g].params || {});
        for(const m in P) for(const k in P[m]){
          const want = P[m][k];
          if(want !== "any" && !Array.isArray(want)) continue;
          const c = M.CONTROL[m + "." + k];
          const seen = new Set();
          let first = null;
          for(const s of [1, 2, 3, 4, 5, 6, 7, 8, 11, 17, 23, 41]){
            M.composeSong(s, undefined, g);
            const v = M.panelValue(m, k);
            seen.add(v);
            if(s === 1) first = v;
          }
          M.composeSong(1, undefined, g);
          if(M.panelValue(m, k) !== first) unstable.push(g + ":" + m + "." + k);
          /* a dial with one position cannot vary and must not be reported as
             stuck -- the claim is about the draw, not about the machine */
          const positions = Math.floor((c.max - c.min) / (c.step || 1) + 1e-9) + 1;
          drawn.push(`${m}.${k} ${seen.size}/${Math.min(positions, 12)}`);
          if(positions > 1 && seen.size < 2) stuck.push(g + ":" + m + "." + k);
        }
      }
      check("a knob a genre draws is a different knob on a different song",
            stuck.length === 0 && unstable.length === 0,
            stuck.length ? "frozen: " + stuck.join(" | ")
            : unstable.length ? "not deterministic: " + unstable.join(" | ")
            : drawn.length ? drawn.join(" · ") + "  (distinct values in 12 seeds / positions on the dial)"
            : "no genre draws a knob");
    }
  }

  /* ── 1c. THE CONDUCTOR'S CONTRACT, and the answer to "how should the program
     decide what to do?". Every control declares its KIND, and the kind decides
     who may touch it:

       switch    a discrete choice -- the 303's waveform, the Mellotron's tape
                 set. Moving it mid-song is a different instrument, not a
                 gesture. Set per song; NEVER automated.
       voicing   what the instrument IS -- the kick's tuning, the tremolo rate,
                 the CS-80's initial bend. Automating it makes the instrument
                 wander instead of the performance moving. Set per song.
       bus       a graph-level number setSpace hands over once, before anything
                 is scheduled. Structurally cannot be per-note.
       gesture   what a player's hand is actually on -- cutoff, resonance,
                 brightness, decay, ensemble. THIS is what motion is for.

     Two checks fall straight out of that, and together they close the loop:
     a gesture nobody rides is a knob the conductor is not using, and a switch
     somebody rides is a category error. Measured before this landed: TEN
     gesture controls on hosted machines that no genre had ever moved. */
  {
    const moved = new Set(), hosted = {};
    for(const g of M.genres()){
      /* ── THE SAME TWELVE SEEDS BOTH HALVES ──────────────────────────────
         This half sampled ONE seed while the hosting half below samples
         twelve, and that asymmetry was a latent bug: a lane that exists only
         when a machine is DRAWN is invisible at seed 1 whenever that draw
         went the other way. It surfaced when a genre started seating its
         stage over the instruments a chart actually loaded (GENRE.x.stage) --
         rhodes.pan read as idle purely because seed 1's keys draw landed on
         the Wurly. Sampling the same twelve seeds for both halves is what the
         check always meant. */
      for(let sd = 1; sd <= 12; sd++)
        for(const key in M.composeSong(sd, "band", g).motion.lanes) moved.add(key);
      const mo = M.composeSong(1, "band", g).motion;
      /* a machine is HOSTED by a genre if a voice of one of its lanes actually
         sounds -- measured from the events, not read off the machines table,
         because "auto" resolves through the rig and the keys lane dispatches on
         the chart's own draw */
      const heard = new Set();
      for(let s = 1; s <= 12; s++)
        for(const e of M.composeSong(s, undefined, g).perf.events) heard.add(e.voice);
      for(const m in M.INSTRUMENTS){
        const lanes = Object.values(M.INSTRUMENTS[m].lanes);
        /* V.keys dispatches to V.rhodes or V.wurly on the chart's timbre draw,
           so those two machines are reachable through the "keys" voice too */
        const extra = (m === "rhodes" || m === "wurly") ? ["keys"] : [];
        /* a `fixed` machine is not an instrument and has no lanes -- the space
           is not something a genre chooses, it is something every genre has. It
           would otherwise be silently exempt from the "must be ridden" rule for
           want of a voice to be heard playing, which is the exact hole that
           lets a panel grow knobs nobody uses. */
        if(M.INSTRUMENTS[m].fixed || lanes.concat(extra).some(v => heard.has(v)))
          hosted[m] = true;
      }
    }
    const idle = [], wrong = [];
    for(const m in M.INSTRUMENTS)
      for(const c of M.INSTRUMENTS[m].controls){
        const key = m + "." + c.k;
        if(!c.kind) wrong.push(key + " declares no kind");
        /* a gesture is ridden at the note; a bus is ridden as a curve on its
           gain node. Both are things the conductor moves, so both must be moved
           by some genre that hosts the machine. */
        else if(c.kind === "gesture" || c.kind === "bus"){
          if(hosted[m] && !moved.has(key)) idle.push(key);
        }
        else if(moved.has(key)) wrong.push(key + " is a " + c.kind + " and is automated");
      }
    check("every knob the conductor can move is one some genre moves", idle.length === 0,
          idle.length ? idle.join(" | ") : moved.size + " controls ridden across the genres");
    check("no switch or voicing control is automated", wrong.length === 0,
          wrong.length ? wrong.join(" | ") : "kinds respected");
  }

  /* ── 2. determinism, both directions ── */
  const J = m => JSON.stringify(m.lanes);
  let same = 0, diff = 0, n = 0;
  for(const g of M.genres()) for(let s = 1; s <= 20; s++){
    n++;
    if(J(M.composeSong(s, "band", g).motion) === J(M.composeSong(s, "band", g).motion)) same++;
    if(J(M.composeSong(s, "band", g).motion) !== J(M.composeSong(s + 500, "band", g).motion)) diff++;
  }
  check("same seed, same movement", same === n, same + "/" + n + " plans reproduce");
  check("...and a different seed moves differently", diff > n * 0.9,
        diff + "/" + n + " plans differ from a distant seed");

  /* ── 3. the movement STAYS ON THE DIAL. Four kinds stack; three of them can
     be at their extreme at once, and a filter that resolves past its own range
     is a number, not a sound. The clamp is in P(); this proves it holds over
     every sixteenth of every song rather than over the one case I thought of. */
  let off = [];
  for(const g of M.genres()) for(let s = 1; s <= 8 && off.length < 3; s++){
    const song = M.composeSong(s, "band", g), mo = song.motion;
    for(const key in mo.lanes){
      const [mach, k] = key.split(".");
      const c = M.CONTROL[key];
      for(let st = 0; st < mo.nBars * 16; st += 3){
        const v = M.panelValue(mach, k) + M.motionAt(mo, key, { tSec: st * mo.spb });
        const clamped = Math.max(c.min, Math.min(c.max, v));
        if(clamped < c.min - 1e-9 || clamped > c.max + 1e-9){ off.push(g + ":" + key); break; }
      }
    }
  }
  check("the movement never leaves the dial", off.length === 0,
        off.length ? off.join(" | ") : "every sixteenth of 24 songs inside its range");

  /* ── 4. it actually MOVES. A plan that resolves to zero everywhere would pass
     every check above and change nothing, which is the exact shape of the false
     "done" this project has been bitten by. So measure the swing. ── */
  let moved = 0, lanes = 0;
  for(const g of M.genres()){
    const song = M.composeSong(1, "band", g), mo = song.motion;
    for(const key in mo.lanes){
      lanes++;
      const vals = [];
      for(let st = 0; st < mo.nBars * 16; st++)
        vals.push(M.motionAt(mo, key, { tSec: st * mo.spb }));
      if(Math.max(...vals) - Math.min(...vals) > 1e-6) moved++;
    }
  }
  check("every declared motion lane actually swings", moved === lanes,
        moved + "/" + lanes + " lanes move at seed 1");

  /* ── NO MOTION TABLE NAMES A MACHINE TWICE ────────────────────────────────
     A duplicate key in an object literal does not merge, it REPLACES -- so a
     second `tr1000:` in one genre's motion block silently deletes the first,
     and the table that was deleted goes on looking perfectly correct in the
     source. It has happened three times in this file. The most recent: a whole
     block of per-voice chain automation was added to lofi and dkc, both genres
     already had a second tr1000 key further down, and the new work was gone
     before it ever ran. A probe measured zero and was right.

     Source text is the only place this is visible -- by the time the object
     exists the loser is gone without a trace -- so this check reads the file.
     Braces are matched rather than regexed line-by-line, so a nested object
     inside a machine block cannot be mistaken for a machine. */
  {
    /* `html` is the shipped file, already read at the top of this harness.

       THE FIRST VERSION OF THIS CHECK WAS TOO WEAK AND SAID ZERO. It walked
       lines carrying a running depth counter, which loses its place on any
       line that opens and closes braces unevenly -- so it caught the two
       duplicate MACHINE keys and missed four duplicate CONTROL keys, including
       three created in the same sitting and one (lofi's Rhodes tone) that had
       been silently dead for who knows how long.

       This one matches braces properly and checks BOTH levels: a machine
       declared twice in one motion table, and a control declared twice in one
       machine block. Same defect, one level apart. */
    const L = html.split("\n");
    const endOf = i => {                       // line closing the block opened at i
      let d = 0;
      for(let j = i; j < L.length; j++){
        for(const ch of L[j]){
          if(ch === "{") d++;
          else if(ch === "}" && --d === 0) return j;
        }
      }
      return L.length - 1;
    };
    const dupes = [];
    let genre = null;
    for(let i = 0; i < L.length; i++){
      const g = /^  (\w+): \{/.exec(L[i]);
      if(g && M.genres().includes(g[1])) genre = g[1];
      if(!genre || L[i].trim() !== "motion: {") continue;
      const mEnd = endOf(i);
      const seenM = {};
      for(let j = i + 1; j < mEnd; j++){
        const mm = /^      (\w+): \{/.exec(L[j]);
        if(!mm) continue;
        if(seenM[mm[1]]) dupes.push(`${genre}.${mm[1]} (machine, lines ${seenM[mm[1]]},${j + 1})`);
        seenM[mm[1]] = j + 1;
        const bEnd = endOf(j), seenC = {};
        for(let k = j + 1; k < bEnd; k++){
          const ck = /^        (\w+):/.exec(L[k]);
          if(!ck) continue;
          if(seenC[ck[1]]) dupes.push(`${genre}.${mm[1]}.${ck[1]} (control, lines ${seenC[ck[1]]},${k + 1})`);
          seenC[ck[1]] = k + 1;
        }
        j = bEnd;
      }
    }
    check("no motion table declares a machine or a control twice",
          dupes.length === 0, dupes.length ? dupes.join(" | ") : "0 duplicate keys, both levels");
  }

  /* ── NOTHING IS WRITTEN BELOW HEARING ─────────────────────────────────────
     The drone's octave-down sub was guarded by `low >= R.bass[0] - 12`, which
     permits a full octave UNDER the register the genre declared -- so jungle
     wrote a C0 at 16.4 Hz and bladerunner an A0 at 27.5 Hz. Below about 20 Hz
     there is no pitch to hear and no system reproduces it; the energy is spent
     on excursion and headroom the rest of the mix then works under.

     MIDI 24 is C1, 32.7 Hz -- the bottom of a five-string bass. A genre may sit
     as high as it likes above that; nothing may go below it. */
  {
    const SUB_FLOOR = 24;
    const low = [];
    for(const g of M.genres()){
      let lo = 999;
      for(let s = 1; s <= 30; s++)
        for(const e of M.composeSong(s, "draw", g).perf.events)
          if(e.pitch != null && e.pitch < lo) lo = e.pitch;
      if(lo < SUB_FLOOR) low.push(`${g} midi ${lo} (${(440 * Math.pow(2, (lo - 69) / 12)).toFixed(1)} Hz)`);
    }
    check("no genre writes a pitch below hearing (midi 24 / 32.7 Hz)",
          low.length === 0, low.length ? low.join(", ") : "30 seeds x every genre");
  }

  /* ── A PART THAT IS BUILT MUST BE ABLE TO PLAY ────────────────────────────
     MEASURED: dkc, acid, plastikman and jungle each declared a `counter` table
     -- density, interval pool, the lot -- and the role appeared in NO section's
     active list. So the second line was composed every song and thrown away
     before it reached the performance. Reading the roll cannot catch this: the
     roll prints MATERIAL, so the counter row is right there on the page looking
     like music that plays.

     Either a genre wants a part or it does not. Declaring a table and never
     activating the role is the silent third state, and this is the check that
     removes it. Same test for the ostinato, which has the same shape. */
  {
    const orphan = [];
    for(const g of M.genres()){
      const song = M.composeSong(1, "draw", g);
      const T = song.chart.table;
      for(const role of ["counter", "ostinato"]){
        if(!T[role]) continue;                       // declared null: fine
        const active = song.sections.some(s => s.active.includes(role));
        if(!active) orphan.push(`${g}.${role} declared but never active`);
      }
    }
    check("no genre composes a part the arrangement never plays",
          orphan.length === 0, orphan.length ? orphan.join(", ") : "counter + ostinato, every genre");
  }

  /* ── THE CHIP'S POLYPHONY IS PHYSICS, NOT TASTE ───────────────────────────
     Six FM channels, and the sixth is traded away whenever the DAC plays a
     sample: "a game can trade that FM voice for drums, speech or other
     digitised sounds. It does not gain a seventh channel." Three PSG squares
     alongside. Measured before the budget existed: peak 8 simultaneous FM
     voices on a chip that has six.
     [corpus:wikipedia YM2612, corpus:consolemods] */
  {
    const FM = new Set(["chipBass", "chipKeys", "chipLead", "chipCounter"]);
    const PSG = new Set(["psgHat", "psgOpenhat"]);
    const DAC = new Set(["dacKick", "dacSnare", "dacGhost"]);
    let worstFM = 0, worstPSG = 0, at = "";
    for(let s = 1; s <= 20; s++){
      const song = M.composeSong(s, "sega", "dkc"), spb = song.motion.spb;
      for(let t = 0; t < Math.min(song.perf.seconds, 90); t += spb){
        let f = 0, p = 0, d = 0;
        for(const e of song.perf.events){
          if(e.tSec > t) break;
          if(e.tSec + e.durSec <= t) continue;
          if(FM.has(e.voice)) f++; else if(PSG.has(e.voice)) p++; else if(DAC.has(e.voice)) d++;
        }
        const used = f + (d > 0 ? 1 : 0);
        if(used > worstFM){ worstFM = used; at = `seed ${s} @${t.toFixed(1)}s`; }
        if(p > worstPSG) worstPSG = p;
      }
    }
    check("the SEGA rig never asks the chip for more voices than it has",
          worstFM <= 6 && worstPSG <= 3,
          `peak ${worstFM}/6 FM+DAC, ${worstPSG}/3 PSG over 20 seeds` + (worstFM > 6 ? " — " + at : ""));
  }

  /* ── 5. the genre picks machines, and "auto" survives -- because auto is what
     keeps the RIG picker meaningful. A genre that named all three slots would
     silently disable a feature this program has. ── */
  const seen = {}; let autos = 0, slots = 0;
  for(const g of M.genres()) for(let s = 1; s <= 60; s++){
    const p = M.composeSong(s, "band", g).chart.picks;
    for(const slot in p){ slots++; if(p[slot] === "auto") autos++; seen[g + "/" + p[slot]] = 1; }
  }
  /* the threshold used to be "more than three pairs per genre", which quietly
     required EVERY genre to offer an alternative in some slot -- and that is
     not a law. Jungle names no alternatives at all, on purpose: its kit is a
     break and there is no second break to swap in. What must be true is that
     the feature is exercised somewhere, so: count the distinct NAMED machines
     drawn across all genres. */
  const named = new Set(Object.keys(seen).map(k => k.split("/")[1]).filter(x => x !== "auto"));
  check("the genres really do draw alternative machines", named.size >= 4,
        named.size + " named machines drawn (" + [...named].join(", ") + ") over " +
        Object.keys(seen).length + " genre/machine pairs");
  check("...and every genre still leaves room for the rig", autos > slots * 0.2,
        autos + "/" + slots + " slots fall through to the rig");

  /* ── 6. EVERY RIG CAN ACTUALLY BE PINNED. makeChart's guard read
     `rigChoice === "band" || rigChoice === "sega"` while RIG held seven rigs, so
     five of them were silently unpinnable: the argument was discarded and the
     genre's own draw answered instead. The UI offered exactly the same two, so
     the two agreed with each other and nothing anywhere looked wrong -- the
     same shape as the `"auto"` bug in applyRack, a hand-copied subset drifting
     behind its table. This asks the RIG table what rigs exist rather than
     naming any, so it cannot go stale the way the guard did. ── */
  const RIGS = Object.keys(M.ym.rigs);
  {
    /* the invariant that makes offering every rig SAFE: a lane a rig does not
       name reaches dispatch() as undefined and throws. Ask the union of every
       lane any rig names, not one rig's keys, or a rig missing a lane the
       others have is exactly what slips through. */
    const lanes = new Set();
    for(const r of RIGS) for(const l in M.ym.rigs[r]) lanes.add(l);
    const voices = new Set(M.voiceNames());
    const holes = [];
    for(const r of RIGS) for(const l of lanes){
      const v = M.ym.rigs[r][l];
      if(v === undefined) holes.push(r + "." + l + " undefined");
      else if(!voices.has(v)) holes.push(r + "." + l + " -> " + v + " not a voice");
    }
    check("every rig names every lane, with a voice that exists", holes.length === 0,
          holes.length ? holes.slice(0, 4).join("; ") :
          RIGS.length + " rigs x " + lanes.size + " lanes, all dispatchable");

    let ignored = [];
    for(const r of RIGS) for(const g of M.genres()) for(const s of [1, 7, 42]){
      const got = M.composeSong(s, r, g).chart.rig;
      if(got !== r) ignored.push(`${g}/${r} seed ${s} -> ${got}`);
    }
    check("...and pinning a rig actually pins it", ignored.length === 0,
          ignored.length ? `${ignored.length} pins ignored: ` + ignored.slice(0, 3).join("; ")
                         : `${RIGS.length * M.genres().length * 3} genre x rig x seed pins all honoured`);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCENT AND SLIDE — the two things V.acid303 has always read and nothing ever
   wrote. Four checks, one of which encodes a defect this pass actually made.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  let rates = [];
  let simultaneous = 0, tooFar = 0, zero = 0, bassTotal = 0;
  for(const g of M.genres()){
    let acc = 0, sld = 0, n = 0;
    for(let s = 1; s <= 30; s++){
      const evs = M.composeSong(s, "band", g).perf.events.filter(e => e.role === "bass");
      /* ── WHAT THIS ACTUALLY HAS TO PROVE ─────────────────────────────────
         A slide is a glide FROM the note before it, so the invariant is that a
         sliding note has a strictly EARLIER predecessor whose pitch the slide
         distance matches. That is what the builder enforces (`prevAt < at`).

         This used to test something narrower and differently shaped: that no
         other note shares the sliding note's instant. Those coincided only by
         accident. The timing jitter was keyed on PITCH, so an octave double --
         two notes written to sound together -- was split by a few milliseconds
         and never shared an instant, and this passed. Fixing that flam (it was
         the "stuttering", measured at 0.3 to 25 ms across three genres) locked
         the pair back together and this went red on 41 slides whose sources were
         all strictly earlier and entirely correct.

         A check that goes red when a real defect is FIXED is measuring the
         symptom of the defect. So it now tests the claim in its own name. */
      const sorted = evs.slice().sort((a, b2) => a.tSec - b2.tSec);
      for(let i = 0; i < sorted.length; i++){
        const e = sorted[i];
        n++; bassTotal++;
        if(e.accent) acc++;
        if(e.slide != null){
          sld++;
          if(Math.abs(e.slide) > 12) tooFar++;
          if(e.slide === 0) zero++;
          /* the nearest STRICTLY earlier note, which is what it glides from */
          let j = i - 1;
          while(j >= 0 && sorted[j].tSec >= e.tSec - 1e-9) j--;
          if(j < 0) simultaneous++;                       // nothing before it at all
          else if(e.pitch - sorted[j].pitch !== e.slide){
            /* the octave partner may be the nearer of the two -- accept either
               member of that earlier instant, and only then call it wrong */
            const t0 = sorted[j].tSec;
            let ok = false;
            for(let k = j; k >= 0 && sorted[k].tSec >= t0 - 1e-9; k--)
              if(e.pitch - sorted[k].pitch === e.slide) ok = true;
            if(!ok) simultaneous++;
          }
        }
      }
    }
    rates.push(`${g} ${(100*acc/n).toFixed(0)}%acc ${(100*sld/n).toFixed(0)}%slide`);
  }
  check("the composer writes accent and slide onto the bass", bassTotal > 0 && rates.length === M.genres().length,
        rates.join("  |  "));
  check("no slide travels more than an octave", tooFar === 0, tooFar + " slides over 12 semitones");
  check("no slide is a slide to nowhere", zero === 0, zero + " zero-distance slides");
  /* THE ONE THAT CAUGHT A REAL DEFECT. DKC's bass is a pedal that strikes its
     root and its octave double on the SAME instant. Read naively, the octave
     looked like a twelve-semitone slide into a note it is actually a chord
     with -- an octave siren on every downbeat, and it was most of DKC's slides
     until the builder was made to require a strictly earlier predecessor.
     Measured before: mean slide 10.8 semitones. After: 4.7. */
  check("every slide glides from a strictly earlier note", simultaneous === 0,
        simultaneous + " slides from a simultaneous note");
}

/* ═══════════════════════════════════════════════════════════════════════════
   PINNED PATTERNS — what the machines' own grids write. The property under test
   is not "editing works": it is that an edit is an INPUT, that it is surgical,
   and that a song nobody has edited is bit-identical to one that never could be.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  const four = [0, 4, 8, 12].map(s =>
    ({ bar: 0, step: s, dur: 1, lane: "kick", vel: s === 0 ? 1.0 : 0.9, role: "drums" }));
  const evKey = e => [e.tSec.toFixed(9), e.durSec.toFixed(9), e.voice, e.role,
                      e.lane || "", e.gain.toFixed(9), e.pitch == null ? "" : e.pitch].join("|");

  /* 1. no pins changes nothing -- the seam that matters most, because every
        existing song in the world goes through this code path now */
  let untouched = 0, n = 0;
  for(const g of M.genres()) for(let s = 1; s <= 10; s++){
    n++;
    const a = M.composeSong(s, "band", g).perf.events.map(evKey).join("\n");
    const b = M.composeSong(s, "band", g, null, {}).perf.events.map(evKey).join("\n");
    if(a === b) untouched++;
  }
  check("an empty pin set composes the identical song", untouched === n, untouched + "/" + n + " songs");

  /* 2. a pin reaches the performance */
  const base = M.composeSong(1, "band", "lofi");
  const pinned = M.composeSong(1, "band", "lofi", null, { "drums:A:0:kick": four });
  const kicksIn = song => song.materials.A.drums.filter(x => x.lane === "kick" && x.bar === 0)
                              .map(x => x.step).join(",");
  check("a pinned lane replaces the composed one", kicksIn(pinned) === "0,4,8,12",
        `[${kicksIn(base)}] -> [${kicksIn(pinned)}]`);
  check("...and it reaches the events", base.perf.events.filter(e => e.lane === "kick").length
        !== pinned.perf.events.filter(e => e.lane === "kick").length,
        base.perf.events.filter(e => e.lane === "kick").length + " -> " +
        pinned.perf.events.filter(e => e.lane === "kick").length + " kick events");

  /* 3. and it is SURGICAL -- one lane of one bar of one pattern. If pinning the
        kick quietly rewrote the hats, the grid would be lying about its scope. */
  const untouchedLanes = ["snare", "hat", "ghost", "openhat"].every(l =>
    JSON.stringify(base.materials.A.drums.filter(x => x.lane === l)) ===
    JSON.stringify(pinned.materials.A.drums.filter(x => x.lane === l)));
  const otherBars = JSON.stringify(base.materials.A.drums.filter(x => x.lane === "kick" && x.bar > 0)) ===
                    JSON.stringify(pinned.materials.A.drums.filter(x => x.lane === "kick" && x.bar > 0));
  const otherPats = JSON.stringify(base.materials.C.drums) === JSON.stringify(pinned.materials.C.drums);
  check("a pin touches only its own lane, bar and pattern",
        untouchedLanes && otherBars && otherPats,
        `other lanes ${untouchedLanes} · other bars ${otherBars} · other patterns ${otherPats}`);

  /* 4. the pin is frozen into the chart, and a malformed one is DROPPED rather
        than carried -- a pin nothing can apply is a silent no-op */
  check("pins are frozen into the chart", Object.isFrozen(pinned.chart.pins),
        "chart.pins frozen");
  const junk = M.composeSong(1, "band", "lofi", null,
    { "drums:Z:0:kick": four, "drums:A:9:kick": four, "bass:A:0:kick": four, "drums:A:0": four });
  check("a pin that names nothing real is dropped", Object.keys(junk.chart.pins).length === 0,
        Object.keys(junk.chart.pins).length + " of 4 bad pins survived");

  /* 5. a pinned song still PROVES ITSELF. Every seam check runs over pinned
        material exactly as over drawn material -- that is the point of making a
        pin an input to stage 1 rather than an edit applied afterwards. */
  let threw = 0, built = 0;
  for(const g of M.genres()) for(let s = 1; s <= 10; s++){
    try { M.composeSong(s, "band", g, null, { "drums:A:0:kick": four, "drums:B:1:snare":
      [{ bar: 1, step: 4, dur: 1, lane: "snare", vel: 1, role: "drums" }] }); built++; }
    catch(e){ threw++; }
  }
  check("a pinned song still passes its own seam checks", threw === 0,
        built + " pinned songs composed, " + threw + " threw");
}

/* ── A DISSONANCE STILL HAS TO STEP ─────────────────────────────────────────
   This law was documented from the beginning, was dead code in MK1, and went
   unenforced in MK2 until it was measured: a third of the non-chord tones in
   the lead and the counter leapt away instead of resolving. It is now a
   constraint inside buildTheme and deriveCounter, and a constraint that nothing
   watches is one refactor away from being a comment again.

   A THRESHOLD, not a zero. An escape tone and a free appoggiatura are real
   writing, and a line with no unresolved dissonance left in it has had
   something taken out of it. 30.8% was the defect; 12.7% is where the
   constraint leaves it; 20% is the line past which something has broken. The
   full picture, per genre and with the phrase-ending column beside it, is
   `harness/probe_theory.js` -- this is only the guard.

   The dissonance must be STILL SOUNDING when the next note arrives. Counting
   the ones that had already died away was measuring phrase endings: 81% of
   Vangelis's original figure was that, and nothing else. */
{
  let nct = 0, bad = 0;
  for(const g of M.genres()) for(let s = 1; s <= 6; s++){
    const song = M.composeSong(s, "draw", g);
    const ev = song.perf.events.filter(e => e.pitch != null).sort((a, z) => a.tSec - z.tSec);
    const byRole = {};
    for(const e of ev) (byRole[e.role] || (byRole[e.role] = [])).push(e);
    const keys = byRole.keys || byRole.harmony || [];
    for(const role of ["lead", "counter"]){
      const line = byRole[role] || [];
      for(let i = 0; i < line.length - 1; i++){
        const e = line[i], nx = line[i + 1], under = new Set();
        for(const k of keys){
          if(k.tSec > e.tSec + 1e-6) break;
          if(k.tSec + k.durSec > e.tSec + 1e-6) under.add(((k.pitch % 12) + 12) % 12);
        }
        if(!under.size) continue;
        if(under.has(((e.pitch % 12) + 12) % 12)) continue;          // a chord tone
        if(nx.tSec > e.tSec + e.durSec + song.motion.spb + 1e-6) continue;  // died away
        nct++;
        if(Math.abs(nx.pitch - e.pitch) > 2) bad++;
      }
    }
  }
  const rate = nct ? 100 * bad / nct : 0;
  check("a non-chord tone that is still sounding resolves by step", rate < 20,
        rate.toFixed(1) + "% of " + nct + " leap away (was 30.8% unconstrained)");
}

/* ── ...AND IT HAS TO BE ARRIVED AT ─────────────────────────────────────────
   The other half of the same law, written 2026-08-05 and guarded here for the
   same reason the departure half is: a constraint nothing watches is one
   refactor away from being a comment again.

   The taxonomy admits eight figures and SEVEN of them are approached by step
   or by repetition; the eighth is the appoggiatura, which leaps in on the
   condition that it steps out [corpus:musictheory.pugetsound Table 10.1.1;
   corpus:openmusictheory; corpus:ars-nova "No leap to dissonance"].
   docs/genre-research/the-arrival-of-a-dissonance.md

   IT ASKS THE EXACT POPULATION THE LAW GOVERNS, AND TWO EARLIER VERSIONS OF
   THIS CHECK WERE WRONG. That is worth the lines, because both failed in the
   way this file keeps warning about.

     1. A THRESHOLD ON THE WHOLE POPULATION. The law fires only on a bar's
        LAST onset, so across every dissonance its effect is 16.5% -> 14.3%
        of arrivals by leap. No line can be drawn through a two-point gap
        without measuring the seed draw instead of the constraint.
     2. COMPARING BAR-FINAL ARRIVALS TO MID-BAR ONES. At 20 seeds this looked
        beautiful -- the law appeared to FLIP which position was riskier,
        9.5% vs 7.0% becoming 4.8% vs 6.8%. At the 8 seeds this check actually
        runs, the unconstrained build reads 7.1% vs 10.3%, the other way
        round. The direction was sample noise and the check PASSED WITH THE
        LAW REMOVED. It was watched failing to fail, which is the only reason
        it is not in this file.

   What is left is structural rather than statistical: a bar-final onset that
   lands on a dissonance, whose predecessor in the same bar was CONSONANT --
   so the departure law was not the one in charge -- and which was reached by
   more than a step. That is precisely what the arrival law forbids, and the
   populations are the same size either way, so it is not a selection effect:

     without the constraint   34 of 287   11.8%
     with it                   7 of 277    2.5%     (the residue is the
                                                     derivation following its
                                                     DNA and the phrase pickup)

   Read off the MATERIAL, because that is where the law operates; the
   performance's figures are in probe_arrival.js. Cost of the constraint,
   measured the same way: 6342 lead notes to 6315, 0.43% fewer. */
{
  const pcOf = p => ((p % 12) + 12) % 12;
  let pop = 0, leaptOn = 0;
  for(const g of M.genres()) for(let s = 1; s <= 8; s++){
    const song = M.composeSong(s, "draw", g);
    const mats = song.materials || {}, BARS = mats.bars || 4, SPAN = BARS * 16;
    for(const k of ["A", "Avar", "B", "Bvar", "C"]){
      const mat = mats[k];
      if(!mat || !mat.lead || !mat.lead.length) continue;
      /* the comp as it RINGS, the same map buildTheme itself lays out */
      const ring = new Array(SPAN).fill(null);
      for(const c of (mat.keys || [])){
        if(c.pitch == null) continue;
        const from = (c.bar % BARS) * 16 + c.step;
        for(let d = 0; d < Math.max(1, c.dur || 1); d++){
          const at = (from + d) % SPAN;
          (ring[at] || (ring[at] = new Set())).add(pcOf(c.pitch));
        }
      }
      /* is this pitch outside what the comp is SOUNDING here? null = nothing
         sounding, so there is nothing to be outside of */
      const nct = (bar, st, p) => {
        const u = ring[((bar % BARS) * 16 + st) % SPAN];
        return (u && u.size) ? !u.has(pcOf(p)) : null;
      };
      const line = mat.lead.filter(x => x.pitch != null)
                           .slice().sort((a, z) => (a.bar - z.bar) || (a.step - z.step));
      const lastOfBar = {};
      for(const x of line) lastOfBar[x.bar] = Math.max(lastOfBar[x.bar] ?? -1, x.step);
      for(let i = 1; i < line.length; i++){
        const prev = line[i - 1], e = line[i];
        if(prev.bar !== e.bar) continue;                 // needs a predecessor in its own bar
        if(e.step !== lastOfBar[e.bar]) continue;        // the exposed slot only
        if(nct(e.bar, e.step, e.pitch) !== true) continue;
        if(nct(prev.bar, prev.step, prev.pitch) === true) continue;  // departure law's case
        pop++;
        if(Math.abs(e.pitch - prev.pitch) > 2) leaptOn++;
      }
    }
  }
  const rate = pop ? 100 * leaptOn / pop : 0;
  check("...and a dissonance in the bar's exposed last slot is not LEAPT onto",
        pop > 60 && rate < 6,
        rate.toFixed(1) + "% of " + pop + " leapt onto (unconstrained: 11.8% of 287)");
}

/* ── THE SECOND KEYBOARD DOES NOT SHADOW THE FIRST ──────────────────────────
   Found 2026-08-05 by teaching probe_counterpoint to report per PAIR: the two
   keyboards moved in parallel perfect intervals 8.9% of the time on
   bladerunner against a 0.9% shuffle floor and 4.2% against 1.1% on lofi --
   the worst ratio in the file, on both of the only two genres that have a
   second keyboard. Parallel perfects "reduce the texture from N to N-1 voices
   perceptually" [corpus:schoolofcomposition], so a pad doing that is not a
   layer, it is a chorus on the comp.
   docs/genre-research/the-second-keyboard.md

   MEASURED ON THE MATERIAL, bar to bar, between the two parts' top voices --
   which is the granularity the cost in buildKeys actually governs, and is
   therefore the honest thing to guard. The performance figure moved much less
   and that gap is recorded as open in §6 of that sheet rather than papered
   over here.

   THE THRESHOLD WAS DRIVEN BOTH WAYS BEFORE IT WAS BELIEVED, at the seed
   count this check runs and one above it -- because twice already this
   session a threshold looked decisive at 45 seeds and could not separate the
   builds at 8:

     with the cost      8 seeds 3.4%    12 seeds 2.9%
     without it         8 seeds 8.0%    12 seeds 6.4%

   5% sits in the gap at both. A THRESHOLD, not a zero: two parts sharing a
   chord will sometimes move alike and a pad forbidden ever to do so would be
   contorted rather than independent. */
{
  const pcOf = p => ((p % 12) + 12) % 12;
  const topPerBar = arr => {
    const o = {};
    for(const n of arr){ if(n.pitch == null) continue;
      if(o[n.bar] == null || n.pitch > o[n.bar]) o[n.bar] = n.pitch; }
    return o;
  };
  /* TWO POPULATIONS, split by the genre's own declaration. `parallels: 1` in a
     genre table says parallel perfects are the sound it came for -- organum,
     "parallel fifths and open fifth/octave intervals for medieval color"
     [corpus:melodigging] -- and buildKeys scales the shadow cost away for it.
     So the law is guarded where it APPLIES, and the appetite is guarded where
     it is declared: a dungeon-synth build whose two keyboards stopped moving
     in fifths would have lost the genre's identifying feature and nothing
     else would notice. MEASURED at 8 and at 12 seeds before the thresholds
     were believed: constrained 3.4% / 2.9%, declared 40.0% / 32.7%.

     ── AND THE INTERVAL WAS MEASURED WRONG HERE FOR A DAY. ──────────────────
     This read `pcOf(A - B)`. The COST it guards reads `Math.abs(A - B) % 12`.
     Those disagree whenever the first keyboard is the LOWER of the two: two
     parts a fifth apart are 7 to the cost and 5 to this check, so every
     parallel fifth with the comp underneath the pad was invisible. Dungeon
     synth's pad sits ABOVE its comp, which is to say this check was blind to
     precisely the case it was written for -- and reported 32.7% while the
     honest figure under the same build was 29.1%.

     A CHECK MUST ASK ITS QUESTION THE WAY THE CODE ANSWERS IT. Same class as
     the lane list copied out of the table it was checking. Fixed here. */
  const ivOf = (a, b) => Math.abs(a - b) % 12;
  const rateFor = (g, seeds) => {
    let steps = 0, par = 0;
    for(let s = 1; s <= seeds; s++){
      const mats = M.composeSong(s, "draw", g).materials || {};
      for(const k of ["A", "Avar", "B", "Bvar", "C"]){
        const m = mats[k];
        if(!m || !m.keys || !m.keys2 || !m.keys2.length) continue;
        const A = topPerBar(m.keys), B = topPerBar(m.keys2);
        const bars = Object.keys(A).map(Number).filter(b => B[b] != null).sort((x, y) => x - y);
        for(let i = 1; i < bars.length; i++){
          const p = bars[i - 1], q = bars[i];
          if(q !== p + 1) continue;                     // not consecutive: not a step
          const da = A[q] - A[p], db = B[q] - B[p];
          if(da === 0 && db === 0) continue;            // nobody moved
          steps++;
          const iv = ivOf(A[p], B[p]);
          if(da !== 0 && da === db && (iv === 0 || iv === 7)) par++;
        }
      }
    }
    return { steps, par };
  };
  let steps = 0, par = 0;
  const declaring = [];
  for(const g of M.genres()){
    if((((T.GENRE[g] || {}).parallels) || 0) >= 0.5){ declaring.push(g); continue; }
    const r = rateFor(g, 12); steps += r.steps; par += r.par;
  }
  const kr = steps ? 100 * par / steps : 0;
  check("the second keyboard does not shadow the first in parallel perfects",
        steps > 100 && kr < 5,
        kr.toFixed(1) + "% of " + steps + " bar-to-bar steps (unconstrained: 6.4%)");

  /* ── AND THE APPETITE DIAL REACHES THE MUSIC. ─────────────────────────────
     A/B, NOT A THRESHOLD, and the difference matters. The threshold that stood
     here for a day wanted the declaring genre above 15%, which it cleared only
     because the ROLLED voicing was manufacturing parallels -- blocking the
     chords at 2026-08-06c dropped the same genre to 3.9%, and the dial's own
     contribution is 3.9 points (0.0% with the cost on, 3.9% with it off, 12
     seeds). Two events out of 51. There is no honest threshold to draw across
     a gap that size, and inventing a looser one to make today's build pass is
     the "check that cannot fail" this file has already shipped twice.

     So ask the question directly instead: turn the genre's own dial off,
     recompose, and require that THE MUSIC ACTUALLY MOVED. That is falsifiable
     by construction -- if buildKeys ever stops reading `parallels`, the two
     builds become identical and this goes red on the spot, whatever the rate
     happens to be. It also costs nothing in seeds.
     docs/genre-research/dungeon-synth.md ss4. */
  const abBad = [];
  for(const g of declaring){
    const tbl = T.GENRE[g], had = tbl.parallels;
    const sig = () => JSON.stringify([1, 2, 3, 4, 5, 6].map(s =>
      JSON.stringify((M.composeSong(s, "draw", g).materials || {}).A || {})));
    const on = sig();
    tbl.parallels = 0;
    const off = sig();
    tbl.parallels = had;                                 // put it back, always
    if(on === off) abBad.push(g + ": the dial changes nothing");
    else {
      const rOn = rateFor(g, 12);
      tbl.parallels = 0; const rOff = rateFor(g, 12); tbl.parallels = had;
      if(rOn.par < rOff.par) abBad.push(g + ": declaring it gave FEWER parallels");
    }
  }
  check("...and a genre's declared appetite for them reaches the music",
        abBad.length === 0,
        abBad.length ? abBad.join(" | ")
          : declaring.length ? declaring.join(",") + ": dial off changes the material"
                             : "no genre declares the appetite");
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE NEW RACKS. Both checks below exist because reading the roll found the
   defect, and both are here rather than in a probe because every bug this file
   finds becomes a permanent test -- a throwaway check lets the regression back.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  /* A WIND INSTRUMENT CANNOT PLAY ABOVE ITS TOP NOTE. Measured before the fix,
     40 seeds x 7 genres with a sax loaded: the lead reached G#6 (92) on
     bladerunner, G6 (91) on synthwave, E6 (88) on DKC and C6 (84) on lofi,
     against an alto's concert ceiling of about A5 (81). The tune's register
     came from the genre's themeA/B/C bands and nothing asked what was holding
     the lane. This holds the program to whatever range the loaded machine
     DECLARES, so it covers the next sampled instrument too. */
  let worst = 0, worstAt = "", n = 0, over = 0;
  for(const g of M.genres()) for(let s = 1; s <= 20; s++){
    const song = M.composeSong(s, undefined, g, { lead: "sax" });
    const r = (M.INSTRUMENTS[song.chart.picks.lead] || {}).range;
    if(!r) continue;
    for(const m of ["A", "Avar", "B", "C"])
      for(const nt of (song.materials[m].lead || [])){
        n++;
        if(nt.pitch > r[1] || nt.pitch < r[0]){
          over++;
          const d = Math.max(nt.pitch - r[1], r[0] - nt.pitch);
          if(d > worst){ worst = d; worstAt = `${g}/${s} ${m} ${nt.bar}:${nt.step} midi ${nt.pitch}`; }
        }
      }
  }
  check("the tune stays inside the range of whatever is playing it", over === 0,
        over === 0 ? `0 of ${n} lead notes out of range`
                   : `${over} of ${n} out by up to ${worst} st — worst ${worstAt}`);
}
{
  /* ── A WIND LINE BREATHES IN PHRASES ────────────────────────────────────────
     Reported: "the sax sounds bad." MEASURED before the fix: 0% of lead notes
     were slurred, because there was no articulation model at all -- every note
     got the scoop, the breath transient and the full attack that belong to the
     FIRST note of a phrase. A player tonguing every note that hard does not
     exist, and it is audible long before the timbre is.

     Listeners confuse legato with portato about 25% of the time and staccato
     with either <1% of the time [corpus:PMC4097958], which says the ear reads a
     wind instrument through its GAPS. So this is not a cosmetic check: the slur
     share is the property that makes the lane sound like it is being played.

     Two floors, both deliberately loose. Below 20% slurred the line is being
     struck note by note again; above 90% it never articulates at all and the
     tongue has gone missing. The real regression this catches is the pass being
     dropped or silently not reaching the events -- either way it goes to 0. */
  let n = 0, art = { breath: 0, legato: 0, portato: 0, staccato: 0 }, orphan = 0, wide = 0;
  for(const g of M.genres()) for(let s = 1; s <= 12; s++){
    const song = M.composeSong(s, "band", g, { lead: "sax" });
    for(const e of song.perf.events){
      if(e.role !== "lead" || e.pitch == null) continue;
      n++; art[e.art || "breath"]++;
      /* a glide that is not a slur, or a slur that leaps, would mean the pass
         and the voice disagree about what `from` means */
      if(e.from != null && e.art !== "legato") orphan++;
      if(e.from != null && Math.abs(e.pitch - e.from) > 2) wide++;
    }
  }
  const slur = n ? art.legato / n : 0;
  check("the horn slurs, tongues and detaches instead of striking every note",
        n > 0 && slur >= 0.20 && slur <= 0.90 && orphan === 0 && wide === 0,
        `${(100 * slur).toFixed(1)}% slurred · ${(100 * art.portato / n).toFixed(1)}% tongued · ` +
        `${(100 * art.staccato / n).toFixed(1)}% detached · ${(100 * art.breath / n).toFixed(1)}% phrase starts` +
        (orphan || wide ? ` — ${orphan} orphan glides, ${wide} non-stepwise slurs` : ""));
}
{
  /* THE LOW INTERVAL LIMIT. Two notes closer than a major third below C3 stop
     reading as two notes and start reading as mud. Measured before the fix,
     stacks narrower than a major third below MIDI 48: jungle 29, lofi 15,
     DKC 8, bladerunner 2, synthwave 1. It never bit while the comp was the
     only keyboard -- the second keyboard's allocator prefers the octave BELOW
     it, which is exactly where the limit lives. Checked over BOTH keyboards,
     because the law is about the register and not about which part it is. */
  let bad = 0, tot = 0, worstAt = "";
  for(const g of M.genres()) for(let s = 1; s <= 20; s++){
    const song = M.composeSong(s, undefined, g, { keys2: "wurly" });
    for(const m of ["A", "Avar", "B", "C"])
      for(const role of ["keys", "keys2"]){
        const at = {};
        for(const nt of (song.materials[m][role] || []))
          (at[nt.bar + ":" + nt.step] = at[nt.bar + ":" + nt.step] || []).push(nt.pitch);
        for(const k in at){
          const v = at[k].sort((x, y) => x - y);
          for(let i = 1; i < v.length; i++){
            tot++;
            if(v[i - 1] < 48 && v[i] - v[i - 1] < 4){
              bad++;
              if(!worstAt) worstAt = `${g}/${s} ${m} ${role} ${k} ${v[i-1]}+${v[i]}`;
            }
          }
        }
      }
  }
  check("no voicing muddies below C3 (the low interval limit)", bad === 0,
        bad === 0 ? `0 of ${tot} adjacent pairs` : `${bad} of ${tot} — e.g. ${worstAt}`);
}

{
  /* A MACHINE YOU LOADED HAS TO MAKE A SOUND. Both new slots shipped able to
     compose a full part and emit ZERO events: the sax was silent in plastikman
     and jungle on 30 of 30 songs each, because `lead` appears in none of those
     genres' section role lists, and the pad was composed-and-silent on acid
     19/30, plastikman 17/30 and bladerunner 10/30. A picker that loads an
     instrument you cannot hear is worse than no picker. Held at 90% rather than
     100 because the register allocator is still allowed to decline honestly --
     what must not happen is composing a part and then dropping it. */
  let bad = [], tot = 0, ok = 0;
  for(const g of M.genres()) for(const slot of ["lead", "keys2"]){
    const mach = slot === "lead" ? "sax" : "wurly";
    let silent = 0, n = 0;
    for(let s = 1; s <= 15; s++){
      const song = M.composeSong(s, undefined, g, { [slot]: mach });
      /* ONLY THE MATERIALS THE SONG ACTUALLY PLAYS. The first version of this
         check asked whether ANY material had the part, and went red on
         plastikman 2/15 -- both of which composed a pad into material C, the
         bridge, in a song whose form never draws a bridge. A part written for a
         section that does not occur is not a dropped part, and counting it as
         one would have had me "fix" a program that was right. First suspect the
         measurement. */
      const played = new Set(song.sections.map(x => x.material));
      const composed = [...played].some(m => (song.materials[m][slot] || []).length);
      if(!composed) continue;
      n++; tot++;
      if(song.perf.events.some(e => e.role === slot)) ok++; else silent++;
    }
    if(silent > n * 0.10) bad.push(`${g}/${slot} ${silent}/${n}`);
  }
  check("a machine you load into a slot is heard", bad.length === 0,
        bad.length ? "composed and silent: " + bad.join(", ")
                   : `${ok}/${tot} composed parts reach the performance`);
}
{
  /* ── AN EMPTY RACK PLAYS NOTHING, AND TAKES NOTHING ELSE WITH IT ────────────
     "None could be an option." Two halves, and the second is the one that would
     break quietly: emptying the bass must silence the bass and must not move a
     single hat. voiceFor returns null for a rack set to "none" and stage 5 drops
     the note, so the failure mode if that ever regresses is either a rack that
     will not empty or an event with no voice reaching dispatch and throwing. */
  const roles = ["drums", "bass", "keys", "lead"];
  const bad = [];
  for(const g of M.genres()) for(const slot of roles){
    for(let s = 1; s <= 4; s++){
      const on  = M.composeSong(s, "band", g);
      const off = M.composeSong(s, "band", g, { [slot]: "none" });
      const mine = e => e.role === slot;
      if(off.perf.events.some(mine)) bad.push(`${g}/${slot}: still sounds`);
      /* everything that is NOT this rack must be byte-identical -- emptying one
         box is not licence to recompose the record around it */
      const rest = x => JSON.stringify(x.perf.events.filter(e => !mine(e)));
      if(rest(on) !== rest(off)) bad.push(`${g}/${slot}: moved other roles`);
      if(off.perf.events.some(e => e.voice == null)) bad.push(`${g}/${slot}: voiceless event`);
    }
  }
  check("a rack set to none plays nothing, and moves nothing else", bad.length === 0,
        bad.length ? bad.slice(0, 4).join(" | ")
                   : `${roles.length * M.genres().length} rack/genre pairs empty cleanly`);
}
{
  /* ── EVERY BOX THE PICKER OFFERS ACTUALLY PLAYS WHERE IT IS OFFERED ─────────
     The rack row now offers the other racks' machines wherever that means
     something -- a Rhodes or a 303 on the tune. That is only true if voiceFor
     can resolve a machine into a lane its own `lanes` table does not name, and
     before this it could not: the dropdown moved and the sound did not.

     canFill is the one owner of "can this box go in this rack", and it answers
     for the picker AND for resolvePicks. So this walks what canFill offers and
     requires the pick to survive into the chart and reach the events with the
     machine's own voice -- which is the whole claim, checked rather than
     asserted. */
  const bad = [];
  let pairs = 0, heard = 0;
  for(const slot of M.rackSlots()){
    if(slot === "fx") continue;                 // the space is not on a lane; checked above by wet=0
    for(const k of Object.keys(M.INSTRUMENTS)){
      if(!M.canFill(slot, k)) continue;
      pairs++;
      /* a genre that actually plays this role, so "silent" means the pick
         failed rather than that the arrangement never asked for the part */
      let sounded = false;
      for(const g of M.genres()){
        for(let s = 1; s <= 3 && !sounded; s++){
          const song = M.composeSong(s, "band", g, { [slot]: k });
          if(song.chart.picks[slot] !== k){ bad.push(`${slot}/${k}: pick dropped`); sounded = true; break; }
          const want = M.INSTRUMENTS[k].lanes[Object.keys(M.INSTRUMENTS[k].lanes)[0]];
          if(song.perf.events.some(e => e.role === slot && (e.voice === want ||
              e.voice === M.INSTRUMENTS[k].lanes[e.lane]))) sounded = true;
        }
        if(sounded) break;
      }
      if(sounded) heard++; else bad.push(`${slot}/${k}: offered but never sounds`);
    }
  }
  check("every box the picker offers into a rack actually plays there",
        bad.length === 0,
        bad.length ? bad.slice(0, 5).join(" | ")
                   : `${heard}/${pairs} rack/machine pairs reach the performance`);
}
{
  /* ── THE POLYMETER PLASTIKMAN'S TABLE HAS ALWAYS CLAIMED ────────────────────
     That entry has quoted Hawtin on the breakdown since the day it was written
     -- "all you've got is this polymeter and because it doesn't line up with
     the one people on the dance floor are going 'oh where was the one again'"
     [corpus:underdog] -- and the engine could not produce one. Every drum lane
     was written against the bar, so the rimshot and the clap landed on the same
     sixteenth in every bar of the record. MEASURED before `kit.poly` existed:
     0.0% of this genre's drum lanes differed bar to bar. The quote described
     something the code did not do.

     A lane declared at length 7, 5 or 11 against a 16-step bar CANNOT repeat
     bar to bar; if it does, the poly block has stopped being read and the genre
     is back to a four-to-the-floor with two fixed off-beats.

     Measured off the MATERIAL and not the performance, because the arc thins
     and the arrangement gates, and both would produce bar-to-bar difference
     that has nothing to do with metre.

     ACID IS THE CONTROL, and it is the right one: an 808 and a 303 like this
     genre, the same tempo range, built the ordinary way against the bar. If the
     mechanism ever leaks into the shared engine, acid moves off zero and says
     so. [corpus:underdog, corpus:modwiggler -- see probe_poly.js] */
  /* THE PERIOD OF A LANE, RECONSTRUCTED FROM ITS NOTES -- the smallest p that
     explains every onset across the whole four-bar material. Deliberately not
     "do the bars differ": a ghost drawn per bar, a crash on bar 0 and an open
     hat on two bars out of four all make bars differ without any metre being
     involved, which is why the control genre reads 15.7% on that measure and
     0 on this one. A period is the claim itself. */
  /* ══ THE POLYMETRE IS DECLARED, SO IT IS CHECKED AGAINST THE DECLARATION ══
     This used to INFER a period for every lane -- the smallest p for which the
     lane's onsets are exactly one residue class mod p over 64 steps -- and then
     assert that minimal techno has lanes whose p neither divides 16 nor is
     divisible by it, while the control genre has none.

     That inference cannot survive the drums being phrased. A lane with one hit
     added in bar two has no single period at all, so the check lost the real
     polymetres and found spurious ones instead; testing only the unphrased bars
     made it worse, because a shorter window matches a short period by accident
     (172 false positives, then 128).

     The genre DECLARES its polymetre -- `kit.poly` names the lane, the sequencer
     length and which step of it fires -- so the honest question is whether that
     declaration reaches the music, not whether a period can be reverse-engineered
     from the result. Same shape as every other check here that stopped guessing
     and read the program: the declared lengths must be lengths that do not line
     up with the bar, the named lanes must actually sound, and a genre that
     declares nothing must have nothing on those lanes. */
  {
    const declared = g => {
      return ((T.GENRE[g].kit || {}).poly || []).map(r => ({ lane: r.lane, len: r.len }));
    };
    const odd = rows => rows.filter(r => 16 % r.len !== 0 && r.len % 16 !== 0);
    const heardOn = (g, lanes) => {
      let n = 0;
      for(let s = 1; s <= 6; s++){
        const ev = M.composeSong(s, undefined, g).perf.events;
        for(const e of ev) if(e.role === "drums" && lanes.indexOf(e.lane) >= 0) n++;
      }
      return n;
    };
    const pm = declared("plastikman"), ctl = declared("acid");
    const pmOdd = odd(pm), ctlOdd = odd(ctl);
    const pmHeard = heardOn("plastikman", pmOdd.map(r => r.lane));
    check("minimal techno's polymeter is real, not a comment",
          pmOdd.length > 0 && ctlOdd.length === 0 && pmHeard > 0,
          `plastikman declares ${pmOdd.map(r => r.lane + "/" + r.len).join(" ")} — ` +
          `lengths that never line up with a 16-step bar — and they sound ` +
          `${pmHeard} times over 6 songs · acid declares ${ctl.length} poly lanes ` +
          `(the control: 808 + 303, ordinary grid)`);
  }
}
{
  /* ══ THE PART THAT LISTENS ══════════════════════════════════════════════════
     `kit.listen` is the only thing in this builder that READS the pattern and
     answers it. Four things have to be true or it is decoration, and the fourth
     is the one that matters.

     LZ76 complexity, normalised against two controls built at the lane's OWN
     density -- its first bar looped (0.00) and a seeded shuffle (1.00). Full
     instrument and its provenance in harness/probe_novelty.js. */
  const LEN = 64;
  const lz76 = s => {
    const n = s.length; if(!n) return 0;
    let c = 1, l = 1, i = 0, k = 1, kmax = 1;
    for(;;){
      if(l + k > n){ c++; break; }
      if(s[i + k - 1] === s[l + k - 1]) k++;
      else { if(k > kmax) kmax = k; i++;
             if(i === l){ c++; l += kmax; if(l >= n) break; i = 0; k = 1; kmax = 1; } else k = 1; }
    }
    return c;
  };
  const loopOf = b => Array.from({ length: LEN }, (_, i) => b[i % 16]);
  const shuffleOf = (b, tag) => {
    const k = b.reduce((x, y) => x + y, 0);
    const rng = T.stream ? T.stream(1, "seam:" + tag + ":" + k) : null;
    const idx = Array.from({ length: LEN }, (_, i) => i);
    let s = 0;
    for(let i = LEN - 1; i > 0; i--){
      const r = rng ? rng() : ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      const j = Math.floor(r * (i + 1)) % (i + 1);
      const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    const out = new Array(LEN).fill(0);
    for(let i = 0; i < k; i++) out[idx[i]] = 1;
    return out;
  };
  const lanesOfSong = song => {
    const per = {};
    for(const m of ["A", "Avar", "B", "C"]){
      const notes = (song.materials[m] || {}).drums;
      if(!notes) continue;
      const by = {};
      for(const n of notes){
        const at = n.bar * 16 + n.step;
        if(at < 0 || at >= LEN) continue;
        (by[n.lane] = by[n.lane] || new Array(LEN).fill(0))[at] = 1;
      }
      for(const lane in by) (per[lane] = per[lane] || []).push(by[lane]);
    }
    return per;
  };

  /* 1. IT FIRES, AND THE NOTES REACH THE PERFORMANCE. A rule that writes into a
        lane the arrangement never plays is a rule nobody hears. */
  let heardEv = 0, madeNotes = 0;
  for(let s = 1; s <= 20; s++){
    const song = M.composeSong(s, "band", "plastikman");
    for(const m of ["A", "Avar", "B", "C"])
      for(const n of ((song.materials[m] || {}).drums) || [])
        if(n.lane === "ghost") madeNotes++;
    heardEv += song.perf.events.filter(e => e.lane === "ghost").length;
  }
  check("the listener fires, and what it writes is played",
        madeNotes > 0 && heardEv > 0,
        `${madeNotes} listener notes composed over 20 seeds, ${heardEv} reach the performance`);

  /* 2. IT IS NOT A SHUFFLE. This is the null hypothesis and it is the whole
        point: "deterministic rules watching the pattern" and "random notes" are
        trivially confusable by ear, so the claim is only worth making if it can
        be separated from a dice roll. Measured, the listener's own lane sits at
        ~0.56 against a shuffle at 1.00 and a loop at 0.00. Bounds are loose --
        what this catches is degeneration to either end, which is what a broken
        or bypassed mechanism actually looks like. */
  let nov = 0, nn = 0;
  for(let s = 1; s <= 12; s++){
    const per = lanesOfSong(M.composeSong(s, "band", "plastikman"));
    for(const bits of (per.ghost || [])){
      const k = bits.reduce((x, y) => x + y, 0);
      if(k < 4 || k > LEN - 4) continue;
      const a = lz76(bits), lo = lz76(loopOf(bits)), hi = lz76(shuffleOf(bits, "ghost"));
      if(hi - lo < 1) continue;
      nov += (a - lo) / (hi - lo); nn++;
    }
  }
  const score = nn ? nov / nn : -1;
  check("...and what it writes is neither a loop nor a shuffle",
        nn > 0 && score > 0.15 && score < 0.90,
        `listener lane scores ${score.toFixed(3)}  (0.00 = its own first bar looped, 1.00 = a random ` +
        `sprinkle at the same density; ${nn} samples)`);

  /* 3. IT CANNOT RUN AWAY. A listener firing on every Nth hit of its watch set
        has density at most density(watch)/N, so a chain of them is strictly
        contracting. That is arithmetic rather than tuning, and this is the
        assertion of it: the second generation must not be denser than the
        first, over every seed. */
  /* THE BOUND, AS STATED AND NOT AS HOPED. A listener firing on every Nth time
     it hears something writes at most |watch set| / N notes. That is the only
     runaway guarantee the mechanism has, and it is the one worth asserting:
     the tidier "each generation is smaller than the last" was written into the
     source as true, this check disproved it (generation two watches the dense
     hat as well as generation one, and legitimately writes more), and the
     comment now says so. The union over-counts, because `alone`/`both` modes
     and the notOn guard both narrow it further -- so a violation here is a real
     arithmetic failure and not a boundary case. */
  const RULES = (T.GENRE.plastikman.kit.listen) || [];
  let over = 0, mats = 0, worst = "";
  for(let s = 1; s <= 20; s++){
    const song = M.composeSong(s, "band", "plastikman");
    for(const m of ["A", "Avar", "B", "C"]){
      const notes = ((song.materials[m] || {}).drums) || [];
      if(!notes.length) continue;
      mats++;
      RULES.forEach((rule, i) => {
        const gen = i + 1;
        const mine = notes.filter(n => n.heard === gen).length;
        const union = new Set();
        for(const n of notes)
          if(rule.watch.includes(n.lane)) union.add(n.bar * 16 + n.step);
        const bound = Math.ceil(union.size / (rule.every > 0 ? rule.every : 1));
        if(mine > bound){ over++; worst = `gen${gen} wrote ${mine} > bound ${bound}`; }
      });
    }
  }
  check("...and no listener writes more than its own arithmetic allows", over === 0,
        over ? worst : `${mats} materials x ${RULES.length} listeners, every one inside ` +
                       `|watch| / every`);

  /* 4. A GENRE THAT DECLARES NO LISTENERS IS UNTOUCHED. The pass makes no random
        draws at all -- not "the draws run unconditionally", none -- so this is
        true by inspection. It is checked anyway, because that is the claim the
        snapshot rests on. */
  const bare = M.genres().filter(g => g !== "plastikman");
  let moved = 0;
  for(const g of bare) for(let s = 1; s <= 6; s++){
    const song = M.composeSong(s, "band", g);
    for(const m of ["A", "Avar", "B", "C"]){
      const notes = ((song.materials[m] || {}).drums) || [];
      /* nothing in these genres declares `listen`, so any note on a lane no
         table of theirs writes would be the pass leaking */
      if(notes.some(n => n.lane === "ghost" && (T.GENRE[g].kit || {}).ghostChance === 0)) moved++;
    }
  }
  check("a genre that declares no listener gets none", moved === 0,
        `${bare.length} genres x 6 seeds, ${moved} leaked notes`);

  /* 5. THE ONE SURVIVES IT. Longuet-Higgins & Lee: a note followed by a rest of
        GREATER metric weight is a syncopation, scored by the weight difference.
        Beat-tapping error tracks this index at r = .82, so it is the measure of
        how hard a pattern is to find the downbeat in.

        MEASURED ON THE UNION, WHICH IS THE ONLY HONEST PLACE FOR IT HERE. Per
        lane the index is misleading on anything sparse: a lone note at step 3
        of an empty bar scores 15, the maximum, because every strong beat after
        it is a rest. The listener's own lane reads 13.1 for exactly that
        reason and it means nothing. What a listener actually hears is the kit,
        and the kit has a four-on-the-floor kick on every strong beat.

        A syncopation ceiling was built into the mechanism on the strength of
        the per-lane number and removed on the strength of this one -- see the
        note in `hear`. This is the assertion that keeps the removal honest: if
        a future rule ever does put the downbeat at risk, the union stops being
        zero and this goes red. */
  const W = [0, -4, -3, -4, -2, -4, -3, -4, -1, -4, -3, -4, -2, -4, -3, -4];
  const lhl = bar => {
    let t = 0;
    for(let i = 0; i < 16; i++){
      if(bar[i]) continue;
      let j = -1;
      for(let k = 1; k < 16; k++){ const q = (i - k + 16) % 16; if(bar[q]){ j = q; break; } }
      if(j >= 0 && W[i] > W[j]) t += W[i] - W[j];
    }
    return t;
  };
  /* validated on known figures so the check cannot pass by being broken:
     four-on-the-floor 0, straight sixteenths 0, son clave 4, offbeats 7 */
  const P = a => { const b = new Array(16).fill(0); a.forEach(i => b[i] = 1); return b; };
  const sane = lhl(P([0, 4, 8, 12])) === 0 && lhl(P([0, 3, 6, 10, 12])) === 4 &&
               lhl(P([2, 6, 10, 14])) === 7;
  let worstBar = 0, bars = 0;
  for(let s = 1; s <= 20; s++){
    const song = M.composeSong(s, "band", "plastikman");
    for(const m of ["A", "Avar", "B", "C"]){
      const notes = ((song.materials[m] || {}).drums) || [];
      if(!notes.length) continue;
      /* ── AND A D BAR IS EXEMPT, BECAUSE AN EMPTY IS THE POINT OF IT ──────
         This holds the kit to a kick on every strong beat, which is right for
         the bars that keep time and wrong for the one bar whose job is to take
         it away: "the most basic form of this is DROPPING THE KICK DRUM OUT on
         the last measure of an eight-bar phrase, which destabilises the low end
         and creates a vacuum that the listener will anticipate coming back"
         [Red Means Recording], and "bar 31: mute the kick" [myloops.net].
         `materials.drumPhrase` is what lets this be exempted by NAME rather
         than by loosening the threshold for everyone. */
      const LP = (song.materials.drumPhrase || {})[m] || ["A", "A", "A", "A"];
      const per = [0, 1, 2, 3].map(() => new Array(16).fill(0));
      for(const n of notes) if(n.bar >= 0 && n.bar < 4) per[n.bar][n.step] = 1;
      for(let bi = 0; bi < per.length; bi++){
        if(LP[bi] === "D") continue;
        const b = per[bi];
        if(!b.some(x => x)) continue;
        bars++; worstBar = Math.max(worstBar, lhl(b));
      }
    }
  }
  /* 6. THE SAME RULES MUST NOT WRITE THE SAME FIGURE EVERY SONG. A listener is
        a deterministic function of what it watches, so if everything it watches
        is seed-fixed it is seed-fixed too -- perfectly reproducible AND
        perfectly identical, which derives novelty against a loop but not
        against the next record.
        MEASURED before `poly.phase` existed: over 60 seeds, material A had FOUR
        distinct listener outputs and material C had ONE. Giving each sequencer
        a per-song starting phase took those to 43 and 11. This is the assertion
        that the mechanism generates a RECORD rather than a fixture. */
  const forms = mat => {
    const seen = new Set();
    for(let s = 1; s <= 40; s++){
      const notes = ((M.composeSong(s, "band", "plastikman").materials[mat] || {}).drums) || [];
      seen.add(JSON.stringify(notes.filter(n => n.heard)
        .map(n => [n.heard, n.bar, n.step, n.lane]).sort()));
    }
    return seen.size;
  };
  const fA = forms("A"), fB = forms("B");
  check("...and it does not write the same figure into every song",
        fA >= 10 && fB >= 5,
        `${fA} distinct listener figures in material A over 40 seeds, ${fB} in B ` +
        `(4 and 3 before the sequencers got a per-song phase)`);

  /* ── THE DRUMS ARE PHRASED, NOT FOUR COPIES OF ONE BAR ────────────────────
     Reported as "the drums on all genres are stale and bad", and the cause was
     structural: the builder wrote four bars, each the pocket plus a couple of
     independent per-bar coins, so bar two had no RELATIONSHIP to bar one. A
     listener hears repetition and variation; independent randomness is neither.

     What the shape claims, and therefore what is measured:
       an A bar and a B bar DIFFER, and by roughly one hit -- "one small change"
       a C bar differs by more than a B bar does, over a run of songs
       a D bar is a FILL (more hits) or an EMPTY (far fewer), never a shrug
       a genre that declares repetition is left alone, four A bars, no change
     docs/genre-research/rhythm-phrasing.md */
  {
    const hits = (notes, b) => notes.filter(n => n.bar === b)
                                    .map(n => n.step + ":" + n.lane).sort().join(",");
    const dist = (notes, x, y) => {
      const a = new Set(hits(notes, x).split(",")), z = new Set(hits(notes, y).split(","));
      let d = 0;
      for(const k of a) if(!z.has(k)) d++;
      for(const k of z) if(!a.has(k)) d++;
      return d;
    };
    let bDiff = 0, cDiff = 0, n = 0, dFills = 0, dEmpties = 0, dFlat = 0, still = 0, stillN = 0;
    const phrased = [], flat = [];
    for(const g of M.genres()){
      let sumB = 0, sumC = 0, k = 0, isFlat = true;
      for(let s = 1; s <= 12; s++){
        const song = M.composeSong(s, "band", g);
        const A = (song.materials.A || {}).drums || [];
        const V = (song.materials.Avar || {}).drums || [];
        const P = song.materials.drumPhrase;
        if(!A.length || !P) continue;
        k++;
        sumB += dist(A, 0, 1); sumC += dist(A, 0, 3);
        if(P.A.join("") !== "AAAA") isFlat = false;
        /* ── THE D BAR AGAINST ITS OWN CORE BAR, not against the other copy ──
           This compared the variant's last bar with the MAIN copy's last bar,
           which is a C bar drawn on a different stream -- two things that differ
           for reasons that have nothing to do with D. And it compared hit
           COUNTS, so a fill that happened to land on the same total as whatever
           it was measured against read as "did nothing".
           A phrase ending is a statement about the bars around it in ITS OWN
           sentence, so it is measured against bar zero of the same material,
           by content first and then by size. */
        if(P.Avar[3] === "D"){
          const core = hits(V, 0), end = hits(V, 3);
          const cn = core.split(",").filter(Boolean).length;
          const en = end.split(",").filter(Boolean).length;
          if(end === core) dFlat++;
          else if(en > cn) dFills++;
          else dEmpties++;
        }
      }
      if(!k) continue;
      n += k;
      bDiff += sumB; cDiff += sumC;
      if(isFlat){ flat.push(g); stillN += k; }
      else phrased.push(g + ":" + (sumB / k).toFixed(1) + "/" + (sumC / k).toFixed(1));
    }
    /* ── AND THE FLAT GENRES ARE CHECKED BY THEIR LETTERS, NOT BY DISTANCE ──
       The first version asserted that a repetition genre's bars are IDENTICAL,
       and it failed at 418 hits moved -- because those genres' bars were never
       identical. Their kits have always had per-bar draws (a ghost coin, a
       listener watching two sequencers) that predate any of this. Measuring
       distance there proves nothing about whether the PHRASE touched them. The
       claim that can be checked is the one actually being made: their phrase is
       four A bars, so the mechanism is not applied at all. */
    /* ── AND "C MOVES MORE THAN B" IS NOT MEASURABLE FROM HERE ────────────
       It was asserted and it failed on two genres, and the assertion was the
       wrong one rather than the program: this measures bar N against bar ONE,
       which includes every per-bar draw the kit already had -- dungeon synth
       puts a kettle run in bars two and four by its own table, jungle rechops
       the break. Those swamp a one-hit change. What IS provable from here is
       that the phrase HAPPENS (the bars are not copies), that a D bar always
       fills or empties, and that the genres declaring repetition are left at
       four A bars. The size ordering of B against C is visible in the printed
       per-genre figures and is not asserted. */
    check("the drums are phrased: the bars differ, D always fills or empties",
          bDiff / n > 0.3 && cDiff / n > 0.3 && (dFills + dEmpties) > 0 &&
          dFlat === 0 && flat.length === 0,
          `B moves ${(bDiff / n).toFixed(2)} hits a bar against bar one, C moves ` +
          `${(cDiff / n).toFixed(2)} · D bars: ${dFills} fills, ${dEmpties} empties, ` +
          `${dFlat} that did nothing · phrased: ${phrased.join(" ")} · ` +
          `unphrased genres: ${flat.join(",") || "none — every genre is phrased"}`);
  }

  /* 7. THE ROLL. Booth's sentence has three nouns -- it counts, it counts A
        ROLL, and it does THIS -- and the listener had one and a half of them:
        it could only count single hits and could only answer with one note.
        `roll` gives it the answer and `figure:"run"` gives it the count.

        Adjacent same-lane sixteenths are the thing to measure, because a roll
        IS adjacency: nothing else in this genre writes two rim hits in a row
        (a length-7 sequencer cannot). The control is the rest of the file --
        no other genre declares a roll, so no other genre should have any. */
  let two = 0, three = 0, songs = 0, ctlAdj = 0;
  for(let s = 1; s <= 20; s++){
    songs++;
    const notes = ((M.composeSong(s, "band", "plastikman").materials.A || {}).drums) || [];
    const rim = new Array(64).fill(0);
    for(const n of notes) if(n.lane === "rim") rim[n.bar * 16 + n.step] = 1;
    for(let i = 0; i < 63; i++) if(rim[i] && rim[i + 1]) two++;
    for(let i = 0; i < 62; i++) if(rim[i] && rim[i + 1] && rim[i + 2]) three++;
    for(const g of ["acid", "lofi"]){
      const cn = ((M.composeSong(s, "band", g).materials.A || {}).drums) || [];
      const lane = new Array(64).fill(0);
      for(const n of cn) if(n.lane === "rim") lane[n.bar * 16 + n.step] = 1;
      for(let i = 0; i < 63; i++) if(lane[i] && lane[i + 1]) ctlAdj++;
    }
  }
  check("...and it can answer with a roll, not only a hit",
        two > songs && three > 0 && ctlAdj === 0,
        `${(two / songs).toFixed(1)} two-stroke rolls a song and ${(three / songs).toFixed(1)} ` +
        `three-stroke (grown by the rule that counts rolls) · control genres ${ctlAdj}`);

  check("...and the kit as heard still has the one", sane && worstBar === 0,
        sane ? `union syncopation 0 across ${bars} bars (worst ${worstBar}); the kick holds every strong beat`
             : "the syncopation index itself failed its own validation figures");
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE PLAN — a genre may own its architecture (form.plan, stage 2).

   No shipped genre declares a plan yet, so the battery is what draws the
   mechanism [the coltraneCycle rule: built-and-drawn-by-nobody is not
   "works"]. A synthetic genre is registered, composed, and removed; the
   checks hold the OUTPUT to the plan's own claims, phase by phase, because a
   plan that is not realised in the section sequence is a comment with syntax.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  const clone = JSON.parse(JSON.stringify(T.GENRE.lofi));
  clone.label = "plan test";
  clone.form.coldOpen = 0;            // deterministic frame: always intro...outro
  clone.form.plan = [
    { name: "open",  pool: ["verse"],                 bars: [16, 1, 8] },
    { name: "build", pool: ["verse", "instrumental"], bars: [16, 2, 8], endOn: "instrumental" },
    { name: "pay",   pool: ["verse", "chorus"],       bars: [16, 2, 8], endOn: "chorus" },
  ];
  T.GENRE.__plantest = clone;
  let composed = 0, threw = 0, frame = 0, realised = 0, endsOnPay = 0, shapes = new Set();
  const SEEDS = 30;
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, "band", "__plantest"); composed++; }
    catch(e){ threw++; continue; }
    const seq = song.form.map(x => x.fn);
    shapes.add(seq.join(" "));
    if(seq[0] === "intro" && seq[seq.length - 1] === "outro") frame++;
    /* the middle must decompose into the three phases IN ORDER: the sequence
       walks each pool left to right and may never step backwards */
    const mid = seq.slice(1, -1);
    let phase = 0, ok = mid.length > 0;
    for(const f of mid){
      while(phase < clone.form.plan.length && !clone.form.plan[phase].pool.includes(f)) phase++;
      if(phase >= clone.form.plan.length){ ok = false; break; }
    }
    if(ok) realised++;
    if(mid[mid.length - 1] === "chorus") endsOnPay++;
  }
  delete T.GENRE.__plantest;
  check("a declared plan composes, and its seam checks still hold",
        composed === SEEDS && threw === 0, composed + "/" + SEEDS + " composed, " + threw + " threw");
  /* `composed > 0 &&` because 0 === 0: on the battery's first run these two
     passed while every seed THREW. A check over a set must refuse the empty set. */
  check("...and the sequence realises the phases in the plan's order",
        composed > 0 && realised === composed, realised + "/" + composed + " decompose into open->build->pay");
  check("...and the record ends on the last phase's declared exit",
        composed > 0 && endsOnPay === composed, endsOnPay + "/" + composed + " end their middle on the payoff");
  check("...and the plan still leaves the seed room to vary the shape",
        shapes.size > 1, shapes.size + " distinct shapes in " + SEEDS + " seeds");
  /* dkc, not lofi: lofi got the first real plan at 2026-08-02c, so it stopped
     being the planless control the moment this label was written */
  check("...and a planless genre was untouched by the mechanism existing",
        (() => { try { return M.composeSong(1, "band", "dkc").form.length > 0; } catch(e){ return false; } })(),
        "dkc still composes (the snapshot is the real proof for every planless genre)");
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE SAX ENGINE — the breath is the unit (docs/genre-research/sax-engine.md).
   Stage 5 attaches each phrase to its opening event; members are marked and
   the dispatcher renders each breath once. These checks hold the OUTPUT to
   that claim: the partition must be exact, the members must match their
   events one for one, and every genre must be able to draw the horn.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  let saxN = 0, headN = 0, memberN = 0, covered = 0, mismatch = 0;
  for(let s = 1; s <= 10; s++){
    const song = M.composeSong(s, "band", "bladerunner", { lead: "sax" });
    const sax = song.perf.events.filter(e => e.role === "lead" && e.voice === "sax");
    saxN += sax.length;
    let k = 0, head = null;
    for(const e of sax){
      if(e.phrase){ headN++; head = e; k = 0; }
      else if(e.inPhrase) memberN++;
      const m = head && head.phrase[k];
      if(!m || m.pitch !== e.pitch || Math.abs((head.tSec + m.dt) - e.tSec) > 1e-9) mismatch++;
      covered++; k++;
    }
  }
  check("every sax event is a phrase head or a marked member",
        saxN > 0 && headN + memberN === saxN, headN + " heads + " + memberN + " members = " + saxN);
  check("...and each phrase's members match the events, note for note",
        covered === saxN && mismatch === 0, covered + "/" + saxN + " matched, " + mismatch + " mismatches");
  /* PARKED per the user, 2026-08-02: "Can you pull the sax out for now."
     The LAW while parked: the horn stays pickable by hand everywhere (the
     rack), and NO genre draws it from the conductor. The handoff's parked
     entry names the terms for un-parking; restoring any draw weight before
     the ear passes the sound is a violation of this check. */
  const drawn = Object.keys(T.GENRE).filter(g =>
    (((T.GENRE[g].machines || {}).lead) || []).some(p => p[0] === "sax"));
  check("the horn is pickable by hand, drawn nowhere while parked",
        M.canFill("lead", "sax") && drawn.length === 0,
        "canFill true · drawn by: " + (drawn.join(",") || "nobody") + " (want nobody)");

  /* ── A SWITCH THAT PICKS A THING HAS AS MANY POSITIONS AS THERE ARE THINGS
     ────────────────────────────────────────────────────────────────────────
     The TR-1000's KIT control declared 0..3 while the machine carried five
     kits: the sampled Gretsch was added later and nothing joined the two up.
     It was invisible from the glass, because the SELECT that draws KIT
     enumerates the kits themselves and so listed all five over a control that
     only reached four. Found by `probe_rack`.

     Derived rather than pinned to the number 5: the check asks each `pick`
     switch how many things it picks and holds its declared travel to that, so
     a sixth kit -- or a pick switch on some other machine -- is covered
     without editing this. */
  {
    const bad = [];
    for(const m in M.INSTRUMENTS){
      const MM = M.INSTRUMENTS[m];
      for(const c of (MM.controls || [])){
        if(!c.pick) continue;
        /* what does it pick? the one collection on the machine whose name the
           control shares -- `kit` picks `kits`. */
        const coll = MM[c.k + "s"] || MM[c.k];
        if(!coll || typeof coll !== "object") continue;
        const n = Object.keys(coll).length;
        const declared = Math.round((c.max - c.min) / (c.step || 1)) + 1;
        if(declared !== n) bad.push(m + "." + c.k + " declares " + declared + " for " + n);
      }
    }
    check("a switch that picks a thing has one position per thing",
          bad.length === 0, bad.length ? bad.join(" · ") : "every pick switch matches its collection");
  }

  /* ══ ...AND TURNING IT CHANGES WHAT PLAYS ═══════════════════════════════════
     THIS CHECK EXISTS BECAUSE OF A DEFECT THAT SHIPPED. `2026-08-07h` folded
     the dungeon synth drums into the TR-1000 as kits and wrote the genre's
     choice into `params.tr1000.kit` — the machine's own KIT switch — which
     NOTHING READ. The kit came only from `machines.drumKit`, so the genre fell
     through to the machine's default lanes and played an 808. Measured over 12
     seeds: k808 4554, s808 1566, h808 1361, and the war drum, the timpani and
     the Erang percussion heard ZERO times, on the one genre whose identity is
     those drums. It was live on the published artifact for a day.

     THE BATTERY WAS GREEN THE WHOLE TIME. The check above asks that the switch
     has the right number of positions; another asks that a drawn value lands on
     its dial. Both were true. Neither asks the only question that matters about
     a switch: does turning it do anything.

     So: drive every `pick` switch to every position and demand the set of
     voices heard is not the same set. This is the "compare a thing to another
     thing" rule — a check that compares a switch to a number cannot see that
     two positions are the same sound. */
  {
    const bad = [], seen = [];
    for(const m in M.INSTRUMENTS){
      const MM = M.INSTRUMENTS[m];
      for(const c of (MM.controls || [])){
        if(!c.pick) continue;
        const coll = MM[c.k + "s"] || MM[c.k];
        if(!coll || typeof coll !== "object") continue;
        const names = Object.keys(coll);
        if(names.length < 2) continue;
        /* a genre that hosts this machine, found by asking rather than named */
        const genre = M.genres().find(g => {
          for(let s = 1; s <= 4; s++){
            const song = M.composeSong(s, undefined, g);
            if(song.chart.picks && song.chart.picks[MM.slot] === m) return true;
          }
          return false;
        });
        if(!genre){ seen.push(m + "." + c.k + ": no genre hosts it"); continue; }
        const voicesFor = name => {
          const set = new Set();
          for(let s = 1; s <= 3; s++){
            const song = M.composeSong(s, undefined, genre, { [c.k === "kit" ? "drumKit" : c.k]: name });
            for(const e of song.perf.events) if(e.role === MM.slot) set.add(e.voice);
          }
          return [...set].sort().join(",");
        };
        const heard = {};
        for(const n of names) heard[n] = voicesFor(n);
        /* every position must differ from at least one other; two positions
           producing an identical voice set means one of them is not reachable */
        const same = [];
        for(let i = 0; i < names.length; i++)
          for(let j = i + 1; j < names.length; j++)
            if(heard[names[i]] === heard[names[j]]) same.push(names[i] + "=" + names[j]);
        if(same.length) bad.push(m + "." + c.k + " positions play the same thing: " + same.join(" "));
        else seen.push(m + "." + c.k + " " + names.length + " positions, all distinct (on " + genre + ")");
      }
    }
    check("...and turning it changes what plays",
          bad.length === 0, bad.length ? bad.join(" · ") : seen.join(" · "));
  }
}

/* ═══ A HAND CAN LOAD A SOUND INTO A DRUM CHANNEL ═════════════════════════
   The user's framing of the drum rack: a kit is "a starting point you edit",
   and an unused strip is "an empty slot you can drop a sound into". This is
   the check on that, and it is written the way the LAST drum defect taught:
   `2026-08-07h` shipped a kit choice written into a key NOTHING READ, the
   battery stayed green because every check asked whether the switch was drawn
   and none asked whether turning it changed the sound, and dungeon synth
   played an 808 on the published artifact.

   So this asks the only question that matters -- DOES THE SOUND CHANGE -- on
   every genre, and it asks the three questions around it that would let a
   silent version pass:

     · the loaded voice is what is heard on that lane, and ONLY that voice;
     · a lane nobody declares and a voice nothing can play are REFUSED, so a
       stale pick cannot write a `voice` dispatch is unable to fire;
     · an empty load leaves the song byte-identical, so the feature costs
       nothing to anyone who never touches it.

   The lists come from `MK2.drumLoad()`, the same derivation the panel draws
   from. A check that built its own list of drum voices would be asserting
   against its own copy. */
{
  const D = M.drumLoad();
  const bad = [], seen = [];
  /* a voice no genre reaches by default, so "it changed" cannot be luck */
  const LOAD = "wardrum";
  if(!D.voices.includes(LOAD)) bad.push("the derived voice list has no " + LOAD);
  for(const g of M.genres()){
    /* which drum lane does this genre actually play? asked, not assumed --
       bladerunner has no kit at all and jungle plays one chopped break */
    const plain = M.composeSong(3, undefined, g);
    const lanes = [...new Set(plain.perf.events.filter(e => e.role === "drums").map(e => e.lane))];
    const lane = lanes.find(l => D.lanes.includes(l));
    if(!lane){ seen.push(g + ": no drum lane"); continue; }
    const was = [...new Set(plain.perf.events.filter(e => e.lane === lane).map(e => e.voice))];
    const after = M.composeSong(3, undefined, g, { lane: { [lane]: LOAD } });
    const now = [...new Set(after.perf.events.filter(e => e.lane === lane).map(e => e.voice))];
    if(now.length !== 1 || now[0] !== LOAD)
      bad.push(`${g}.${lane} loaded ${LOAD} and plays ${now.join(",") || "nothing"}`);
    else if(was.length === 1 && was[0] === LOAD)
      seen.push(`${g}.${lane} already ${LOAD}`);   /* dungeon synth: true, not a pass by luck */
    else seen.push(`${g}.${lane} ${was.join(",")}→${LOAD}`);
    /* and every OTHER lane is untouched -- loading one channel is loading one
       channel, not swapping the kit */
    const others = after.perf.events.filter(e => e.role === "drums" && e.lane !== lane);
    const before = plain.perf.events.filter(e => e.role === "drums" && e.lane !== lane);
    if(others.map(e => e.voice).join(",") !== before.map(e => e.voice).join(","))
      bad.push(g + ": loading " + lane + " moved another lane's voice");
  }
  check("a hand can load a sound into a drum channel, and it is heard",
        bad.length === 0, bad.length ? bad.join(" · ") : seen.join(" · "));

  /* the two refusals, and the no-op */
  {
    const junk = M.composeSong(3, undefined, "lofi",
      { lane: { notalane: "k808", kick: "notavoice" } });
    const kept = Object.keys(junk.chart.picks.lane || {});
    check("...and a lane or a voice that does not exist is refused at the gate",
          kept.length === 0, kept.length ? "kept " + kept.join(",") : "both dropped");

    const a = M.composeSong(7, undefined, "lofi");
    const b = M.composeSong(7, undefined, "lofi", { lane: {} });
    const ev = s => s.perf.events.map(e => e.lane + ":" + e.voice + ":" + e.t).join("|");
    check("...and loading nothing changes nothing",
          ev(a) === ev(b), a.perf.events.length + " events, identical");
  }
}

if(FILTER && pass + fail === 0){
  console.log("\nno check's name contains \"" + FILTER + "\" — " + skipped + " were skipped, none run");
  process.exit(2);
}
console.log("\n" + pass + " passed, " + fail + " failed" +
  (FILTER ? "  — FILTERED to names containing \"" + FILTER + "\"; " + skipped +
            " other checks were skipped, so this is not the battery" : ""));
process.exit(fail ? 1 : 0);
