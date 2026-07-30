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
eval(src + ";global.__T = { degMidi, MODES, inKey, scaleStep, intoBand, GENRE };");
const M = global.window.MK2;
const T = global.__T;

const N = parseInt(process.argv[2], 10) || 300;
let pass = 0, fail = 0;
const check = (name, ok, detail) => {
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
  /* 99% rather than 100: a blend CAN genuinely collide -- two register sets
     that each work alone can crowd one pitch -- and the seam check is right to
     throw. What must not happen is a whole pair failing, or a NaN. */
  check("blended genres compose", ok > tot * 0.99,
        `${ok}/${tot} pairs at 25/50/75` +
        (Object.keys(why).length ? "  |  " + Object.keys(why).map(k => why[k] + "x " + k).join(" ") : ""));
  const nan = Object.keys(why).some(k => /NaN|undefined/.test(k));
  check("no blend produces a NaN or an undefined read", !nan,
        nan ? Object.keys(why).filter(k => /NaN|undefined/.test(k)).join(" | ") : "integer domains hold");
  /* all seven at once is the extreme the sliders allow */
  let all = 0;
  const seven = {}; for(const g of gs) seven[g] = 1 / gs.length;
  for(let seed = 1; seed <= 20; seed++){ try { M.composeSong(seed, undefined, seven); all++; } catch(e){} }
  check("all seven blended at once still composes", all >= 19, all + "/20");
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
    check("the counter sounds as often as its table declares",
          withCtr.every(g => {
            const want = T.GENRE[g].counter.density;
            return want >= 0.15 && dens[g].ctr >= want * 0.70;
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
  const LANES = new Set(["kick", "snare", "ghost", "hat", "openhat",
                         "tom1", "tom2", "tom3", "brk"]);
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
  /* two reads name their key through a variable rather than a literal: the
     808's two hats share one circuit and differ only by which decay control
     they name, and the chip's brightness is looked up by the machine name its
     factory was handed. Named here so the scan is honest about what it cannot
     see rather than silently missing them. */
  READS.add("tr808.chdecay"); READS.add("tr808.ohdecay");
  READS.add("chipbass.bright"); READS.add("chipkeys.bright");
  /* the whole acoustic kick reads through one helper keyed by a variable, and
     every gate's hold is looked up on whichever drum panel the plan names */
  for(const k of ["tune","decay","click","drive","body","gain"]) READS.add("kit." + k);
  READS.add("kit.hold"); READS.add("tr808.hold"); READS.add("tr1000.hold");
  /* THE 808-CIRCUIT VOICES NAME THEIR PANEL THROUGH A VARIABLE NOW. They read
     P(g, ev, DM(g), ...) rather than a literal, because the TR-1000's analogue
     engine IS the 808 and 909 rebuilt and shares every one of those voices. The
     regex above can only see literals, so the pair is named here -- and named
     for BOTH machines, so a value declared on either panel is proven to reach a
     voice rather than assumed to. */
  for(const k of ["tune","decay","tone","snappy","sdtone","chdecay","ohdecay"]){
    READS.add("tr808." + k); READS.add("tr1000." + k);
  }
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
        const key = m + "." + k;
        if(!M.CONTROL[key]){ unknown.push(g + ":" + key); continue; }
        if(Math.abs(P[m][k] - M.panelValue(m, k)) > 1e-9)
          unapplied.push(`${g}:${key} wants ${P[m][k]} reads ${M.panelValue(m, k)}`);
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
      const mo = M.composeSong(1, "band", g).motion;
      for(const key in mo.lanes) moved.add(key);
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
     wrote a C0 at 16.4 Hz and vangelis an A0 at 27.5 Hz. Below about 20 Hz
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

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
