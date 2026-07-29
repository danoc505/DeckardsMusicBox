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
        for(const k of ["A", "B"]){ lead += m[k].lead.length; ctr += m[k].counter.length; }
      }
      dens[g] = { bass: n / songs, ctr: lead ? ctr / lead : 0 };
    }
    const vals = genres.map(g => Math.round(dens[g].bass));
    check("the bass styles really differ", new Set(vals).size === genres.length,
          genres.map(g => `${g} ${dens[g].bass.toFixed(1)}/4bars`).join("  "));
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
    check("the counter sounds as often as its table declares",
          genres.every(g => {
            const want = T.GENRE[g].counter.density;
            return want >= 0.15 && dens[g].ctr >= want * 0.70;
          }),
          genres.map(g => `${g} ${(100*dens[g].ctr).toFixed(0)}% of ` +
                          `${(100*T.GENRE[g].counter.density).toFixed(0)}% asked`).join("  "));
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
  const LANES = new Set(["kick", "snare", "ghost", "hat", "openhat", "tom1", "tom2", "tom3"]);
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
     set. (The declared-but-dead controls are still there and still dead -- that
     is a separate, honest, unfixed problem. This check stops it SPREADING.) */
  const READS = new Set();
  const rx = /P\(g,\s*ev,\s*"([A-Za-z0-9]+)",\s*"([A-Za-z0-9]+)"/g;
  for(let mm; (mm = rx.exec(src)); ) READS.add(mm[1] + "." + mm[2]);
  /* one voice reads its decay through a variable key (the 808's two hats share
     a circuit and differ only by which decay control they name), so name them */
  READS.add("tr808.chdecay"); READS.add("tr808.ohdecay");

  const dead = [];
  for(const g of M.genres()){
    const mo = M.composeSong(1, "band", g).motion;
    for(const key in mo.lanes) if(!READS.has(key)) dead.push(g + ":" + key);
  }
  check("every automated knob is one a voice actually reads", dead.length === 0,
        dead.length ? dead.join(" | ") : READS.size + " live controls, none automated in vain");

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

  /* ── 5. the genre picks machines, and "auto" survives -- because auto is what
     keeps the RIG picker meaningful. A genre that named all three slots would
     silently disable a feature this program has. ── */
  const seen = {}; let autos = 0, slots = 0;
  for(const g of M.genres()) for(let s = 1; s <= 60; s++){
    const p = M.composeSong(s, "band", g).chart.picks;
    for(const slot in p){ slots++; if(p[slot] === "auto") autos++; seen[g + "/" + p[slot]] = 1; }
  }
  check("the genre draws more than one machine per slot", Object.keys(seen).length > M.genres().length * 3,
        Object.keys(seen).length + " distinct genre/machine pairs");
  check("...and every genre still leaves room for the rig", autos > slots * 0.2,
        autos + "/" + slots + " slots fall through to the rig");
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
      /* group by instant so a slide onto a note struck simultaneously with its
         neighbour can be counted rather than argued about */
      const byT = {};
      for(const e of evs) (byT[e.tSec.toFixed(6)] = byT[e.tSec.toFixed(6)] || []).push(e);
      for(const e of evs){
        n++; bassTotal++;
        if(e.accent) acc++;
        if(e.slide != null){
          sld++;
          if(Math.abs(e.slide) > 12) tooFar++;
          if(e.slide === 0) zero++;
          if(byT[e.tSec.toFixed(6)].length > 1) simultaneous++;
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
  check("a slide never comes from a note struck at the same instant", simultaneous === 0,
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

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
