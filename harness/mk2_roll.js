#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE ROLL — print the NOTES.

       node harness/mk2_roll.js <seed> [rig] [--genre <name>] [--song] [--mid <file>]

   WHY THIS IS THE TEST THAT MATTERS.  I do not have ears.  Every audio number I
   can produce -- band balance, crest factor, spectral centroid -- describes a
   rendering of the music, not the music.  A mix can measure beautifully and be
   nonsense: a bassline that walks off a cliff, a "hook" that is four unrelated
   notes, a chord that never resolves, a fill that is not a pattern.  None of that
   moves a single dB.  All of it is obvious the moment you look at the notes.

   So this prints the notes, at three depths:

     THE MATERIALS   the four-bar loops A / B / C / Avar as a grid, plus every
                     note as a table.  This is where composition bugs live.
     THE DERIVATION  what B, C and Avar actually took from A -- stated as
                     measured relationships, because "derived from A" is a claim
                     and it should be checkable.
     THE POCKET      the micro-timing of one bar in MILLISECONDS, so the dilla
                     limp is a number rather than an adjective.
     --song          the arranged whole thing, section by section.

   And --mid writes the Standard MIDI File through the shipped MK2.toMidi, then
   PARSES IT BACK and checks it against the events, so "the export works" is a
   verified statement rather than a hope.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src + ";global.__T = { NOTE_NAMES, degMidi, MODES, pc, inKey, AMEN };");
const M = global.window.MK2, T = global.__T;

const argv = process.argv.slice(2);
const seed = parseInt(argv[0], 10) || 1;
const rig = ["band","sega","neon"].includes(argv[1]) ? argv[1] : undefined;
/* ── A BARE GENRE NAME IS THE MOST EXPENSIVE TYPO THIS TOOL ALLOWS ──────────
   `mk2_roll.js 1 acid` used to compose LOFI. The genre is a named flag and a
   positional argument that is not a rig was simply ignored, so the tool
   answered a different question than the one asked and said so only in a
   header line nobody re-reads.

   That produced a false "all seven genres print identical" claim on
   2026-08-04, from seven runs of the same genre. The conclusion happened to be
   right and the evidence was worth nothing.

   So it throws now. Only for names that are actually GENRES -- a rig this
   list has not heard of still passes through, because refusing something
   valid would be a worse tool than the one being fixed. */
for(const a of argv.slice(1)){
  if(a.startsWith("--")) break;
  if(M.genres().includes(a)){
    console.error(`\n  mk2_roll: "${a}" is a GENRE and it has to be passed as a flag.\n` +
                  `            Without it this composes ${M.genres()[0]} and tells you so\n` +
                  `            only in the header line.\n\n` +
                  `     you wrote:  node harness/mk2_roll.js ${argv.join(" ")}\n` +
                  `     you meant:  node harness/mk2_roll.js ${argv[0]} --genre ${a}\n`);
    process.exit(2);
  }
}
const gAt = argv.indexOf("--genre");
/* --blend lofi:50,jungle:50  -- the roll has to be able to read a blended song
   or the test that matters cannot see the feature at all. Percentages, because
   that is what the sliders show; they are normalised downstream anyway. */
const bAt = argv.indexOf("--blend");
const blend = bAt >= 0 ? (() => {
  const o = {};
  for(const part of argv[bAt + 1].split(",")){
    const [n, w] = part.split(":");
    o[n.trim()] = (w == null ? 1 : parseFloat(w)) / 100;
  }
  return o;
})() : null;
const genre = blend || (gAt >= 0 ? argv[gAt + 1] : undefined);
const wantSong = argv.includes("--song");
const midAt = argv.indexOf("--mid");
const midFile = midAt >= 0 ? argv[midAt + 1] : null;

/* --pins <file.json> composes with a programmed pattern in place, so the thing
   the front panel's grids write can be read here the same way everything else
   is. The file is the same shape as chart.pins: {"drums:A:0:kick":[ ...notes ]} */
const pinAt = argv.indexOf("--pins");
const pinsIn = pinAt >= 0 ? JSON.parse(fs.readFileSync(argv[pinAt + 1], "utf8")) : null;

/* --picks drums=tr1000,lead=sax,keys2=wurly -- WHICH MACHINES ARE LOADED. The
   roll is "the test that matters" and it could not reach the rack at all: the
   picks argument was passed as null, so a sax lead and a second keyboard were
   unreadable by the one instrument this project trusts. A slot the roll cannot
   see is a slot nobody has read the notes of. */
const pkAt = argv.indexOf("--picks");
const picks = pkAt >= 0 ? Object.fromEntries(argv[pkAt + 1].split(",")
                            .map(x => x.split("=").map(y => y.trim()))) : null;

const song = M.composeSong(seed, rig, genre, picks, pinsIn);
const C = song.chart;
const nm = p => T.NOTE_NAMES[T.pc(p)] + (Math.floor(p / 12) - 1);   // midi 60 -> C4

/* ── the grid. 16 steps a bar, four bars across, one line per lane/role. ── */
/* WHICH PITCHED ROLES TO PRINT -- derived from the material, not listed here.
   This was the literal ["ostinato","bass","keys","lead","counter"], and the
   moment a second keyboard existed the roll printed every other part and left
   that one out entirely: 12 notes and 141 events, composed, scheduled, audible,
   and INVISIBLE to the one instrument this project says is its ears. A roll
   that cannot see a part is a part nobody has read the notes of. Ordered low to
   high so the page reads like a score; anything the material has and this list
   does not is appended rather than dropped. */
const ROLE_ORDER = ["ostinato", "bass", "keys2", "keys", "counter", "lead"];
const PITCHED_ROLES = (() => {
  const have = new Set();
  for(const m of ["A", "Avar", "B", "C"])
    for(const r in (song.materials[m] || {}))
      if(r !== "drums" && (song.materials[m][r] || []).length) have.add(r);
  const out = ROLE_ORDER.filter(r => have.has(r));
  for(const r of have) if(!out.includes(r)) out.push(r);
  return out;
})();

const RULER = "1e+a2e+a3e+a4e+a";
/* ── THE CHARACTER EACH DRUM LANE IS DRAWN WITH ────────────────────────────
   A display choice, so a small table is fine -- but it MUST NOT decide which
   lanes exist. Any lane with no character here still prints, as "*", so a lane
   added to the program can never again be silently missing from the page.
   See DRUM_LANES below for the list itself. */
const DRUM_CH = { kick: "K", snare: "S", ghost: "g", hat: "x", openhat: "O",
                  tom1: "1", tom2: "2", tom3: "3",
                  rim: "r", clap: "c", crash: "C", ride: "R",
                  /* the break lane exports too -- as whatever drum its source
                     slice actually strikes, so a chopped bar reads as the kit it
                     is made of. */
                  brk: "#" };
const drumChar = lane => DRUM_CH[lane] || "*";

/* ── WHICH LANES EXIST — ASKED OF THE PROGRAM, NEVER LISTED HERE ───────────
   This was a hand-written list of eight lanes and it had gone stale, in the
   file whose whole job is to show you the notes.

   MISSING: rim, clap, crash, ride. FOUND 2026-08-03 by exporting a .mid and
   reading it, which is the rule this repo has had since the day four lanes
   turned out to be missing from the EXPORTER. That was fixed there; this copy
   of the same list was not, so:

     - the printed grid has never shown a rimshot, a clap, a crash or a ride.
       lofi puts a rim on step 14 of every song. PLASTIKMAN'S POLYMETER LIVES
       ON THE RIM AND THE CLAP -- the handoff says so in as many words -- so
       the one tool this project trusts to read the notes was hiding that
       genre's identifying feature, in every song, for the life of the file.
     - and the .mid round-trip counter used the same table to decide which
       events OUGHT to be notes, so it reported "*** MISMATCH ***" and exited
       nonzero on a perfectly correct export: 1283 notes written against 1246
       "expected" on lofi seed 1. The export was right; the ruler was short.

   `MK2.gmDrum()` is the program's own map and is exported for exactly this.
   Order is kit order, low to high, so the grid reads like a kit. */
const DRUM_LANES = (() => {
  const known = Object.keys(M.gmDrum ? M.gmDrum() : {}).concat(["brk"]);
  const order = ["kick", "snare", "ghost", "rim", "clap",
                 "tom1", "tom2", "tom3", "hat", "openhat", "crash", "ride", "brk"];
  const seen = new Set();
  return order.filter(l => known.includes(l) && !seen.has(l) && seen.add(l))
              .concat(known.filter(l => !order.includes(l)));   // anything new, at the end
})();

function gridLine(notes, bars, pick){
  const out = [];
  for(let b = 0; b < bars; b++){
    const row = ".".repeat(16).split("");
    for(const n of notes){
      if(n.bar !== b) continue;
      const ch = pick(n);
      if(!ch) continue;
      row[n.step] = ch;
      /* sustain: fill the steps the note actually holds, without stamping over
         another onset -- a held chord that reads as a single blip is a lie */
      for(let s = n.step + 1; s < Math.min(16, n.step + n.dur); s++)
        if(row[s] === ".") row[s] = "-";
    }
    out.push(row.join(""));
  }
  return out.join(" ");
}

/* WHICH PATTERN EACH MATERIAL PLAYS, so a pinned bar can be named. A, Avar and
   B deliberately SHARE one drum pattern and one bass line -- that sharing is the
   point of the family -- so the pin lives on the pattern, not on the material. */
const PIN_PAT = { A:    { drums: "A", bass: "A" },
                  Avar: { drums: "A", bass: "A" },
                  B:    { drums: "B", bass: "A" },
                  C:    { drums: "C", bass: "C" },
                  fill: { drums: "fill" } };
const PINS = song.chart.pins || {};
const pinnedAt = (role, pat, bar, lane) =>
  PINS[[role, pat, bar, lane].filter(x => x != null).join(":")] != null;

function printMaterial(key, mat, bars){
  console.log(`\n── MATERIAL ${key} ${"─".repeat(62 - key.length)}`);
  console.log("        " + Array.from({ length: bars }, (_, i) => RULER).join(" "));
  const pat = PIN_PAT[key] || {};
  /* A PINNED BAR IS MARKED, PER BAR, right under the ruler. A user-typed pattern
     is not a seed-derived one and this grid must never let the two be confused
     -- the whole reason pins are an INPUT to stage 1 rather than an edit applied
     afterwards is so that this line can be true. */
  const pinRow = (role, lane) => {
    let s = "", anyPin = false;
    for(let b = 0; b < bars; b++){
      const p = pat[role] && pinnedAt(role, pat[role], b, lane);
      if(p) anyPin = true;
      s += (p ? "PINNED".padEnd(16, "·") : " ".repeat(16)) + " ";
    }
    return anyPin ? s : null;
  };
  /* THE BREAK LANE, first, because in a genre that chops one it IS the drums and
     everything else is decoration. Two rows: where the chops land, and WHICH
     SLICE of the source each one plays -- because "the chopper ran" and "the
     chopper rearranged anything" are different claims and only the second row
     can tell them apart. A slice is printed in a 64-character alphabet so all
     64 of them fit in ONE column -- base 36 did not, and slices 36 and up
     printed two characters each, which silently knocked every row after them
     out of alignment with the step grid above. */
  const B64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
  {
    const ns = (mat.drums || []).filter(n => n.lane === "brk");
    if(ns.length){
      console.log("break   " + gridLine(ns, bars, n => n.rev ? "<" : "#"));
      console.log("slice   " + gridLine(ns, bars, n => B64[n.slice] || "?"));
      /* and what that slice actually IS in the source, so a reader can see
         whether a chop landed on a snare or on a pickup */
      const AM = T.AMEN;
      const what = sl => {
        const row = AM.grid[Math.floor(sl / 16) % AM.bars], st = sl % 16;
        for(const [lane, ch] of [["snare","S"],["kick","K"],["ghost","g"],["openhat","O"],["ride","-"]])
          if((row[lane] || []).includes(st)) return ch;
        return ".";
      };
      console.log("source  " + gridLine(ns, bars, n => what(n.slice)));
    }
  }
  for(const lane of DRUM_LANES){
    if(lane === "brk") continue;                 // the break has its own rows above
    const ns = (mat.drums || []).filter(n => n.lane === lane);
    if(!ns.length && !(pat.drums && [0,1,2,3].some(b => pinnedAt("drums", pat.drums, b, lane)))) continue;
    console.log(lane.padEnd(8) + gridLine(ns, bars, () => drumChar(lane)));
    const pr = pinRow("drums", lane);
    if(pr) console.log("  ↑pin  " + pr);
  }
  for(const role of PITCHED_ROLES){
    const ns = mat[role] || [];
    if(!ns.length) continue;
    /* one char per note: the scale DEGREE it sits on, so a line's shape and its
       relationship to the key are both visible at a glance. "?" means out of key,
       which should be impossible and is worth seeing instantly if it happens. */
    console.log(role.padEnd(8) + gridLine(ns, bars, n => {
      if(!T.inKey(C.root, C.mode, n.pitch)) return "?";
      const sc = T.MODES[C.mode], d = sc.indexOf(T.pc(n.pitch - C.root));
      return d < 0 ? "?" : String(d + 1);
    }));
    if(role === "bass"){ const pr = pinRow("bass", null); if(pr) console.log("  ↑pin  " + pr); }
  }
  /* the notes themselves, because a grid cannot show octave or velocity */
  for(const role of PITCHED_ROLES){
    const ns = (mat[role] || []).slice().sort((a, z) => a.bar - z.bar || a.step - z.step || a.pitch - z.pitch);
    if(!ns.length) continue;
    const parts = ns.map(n => `${n.bar + 1}.${String(n.step).padStart(2)} ${nm(n.pitch).padEnd(4)}` +
                              `${String(n.dur).padStart(2)}s v${n.vel.toFixed(2)}` +
                              /* ACCENT AND SLIDE, printed, because they are the two
                                 things that make a bass line a 303 line and an
                                 unreadable property is one nobody checks */
                              (n.accent ? " >" : "  ") +
                              (n.slide ? (n.slide > 0 ? "/" : "\\") + String(Math.abs(n.slide)).padStart(2) : "   "));
    console.log(`\n  ${role} (${ns.length} notes` +
                (role === "bass"
                  ? `, ${ns.filter(n => n.accent).length} accented, ${ns.filter(n => n.slide).length} sliding` +
                    `   > accent · /n slide up n · \\n slide down n`
                  : "") + `)`);
    for(let i = 0; i < parts.length; i += 3) console.log("    " + parts.slice(i, i + 3).join("  |  "));
  }
  /* the acid row: the bass line as a 303 SEQUENCER shows it -- one column per
     step, accent and slide on their own lines under the notes. This is the same
     data the 303's front panel grid displays, printed. */
  const bl = mat.bass || [];
  if(bl.some(n => n.accent || n.slide)){
    const acc = gridLine(bl.filter(n => n.accent), bars, () => ">");
    const sld = gridLine(bl.filter(n => n.slide),  bars, n => n.slide > 0 ? "/" : "\\");
    console.log("\n  the 303 view of that bass line");
    console.log("        " + Array.from({ length: bars }, (_, i) => RULER).join(" "));
    console.log("accent  " + acc.replace(/-/g, "."));
    console.log("slide   " + sld.replace(/-/g, "."));
  }
}

/* ── header ── */
console.log("═".repeat(78));
console.log(`SEED ${C.seed} · ${C.table.label} · ${T.NOTE_NAMES[C.root]} ${C.mode} · ${C.tempo} bpm · ` +
            `rig ${C.rig} · keys ${C.keysChar} · ${song.form.nBars} bars · ` +
            `${song.perf.events.length} events`);
console.log(`GROOVE  ${song.perf.groove.style}` +
  (song.perf.groove.style === "dilla"
    ? `  snare ${(song.perf.groove.snareEarly * 100).toFixed(0)}% of a 16th EARLY, ` +
      `kick +${(song.perf.groove.kickLate * 100).toFixed(0)}% LATE`
    : ""));
/* NAME THE CHORD THE NOTES ACTUALLY SPELL. This read the chord's nearest SCALE
   DEGREE, which was exactly true while every chord was diatonic and became a
   lie the moment one was not: with chromatic harmony a transformation lands on
   a triad whose nearest degree names a different chord, and seed 13 bladerunner
   printed "B B G B" for a progression that plays Bm B G#m B. The roll is the
   test that matters in this repo; a roll that misnames the harmony sends the
   next person looking for a bug in the notes. Read the tones. */
const chName = ch => {
  const r = ch.tri ? ch.tri.pc : T.pc(T.degMidi(C.root, C.mode, ch.degree));
  const third = ch.tones && ch.tones.length > 1 ? T.pc(ch.tones[1] - r) : 4;
  const q = third === 3 ? "m" : third === 4 ? "" : "sus";
  const outside = (ch.tones || []).some(t => !T.MODES[C.mode].includes(T.pc(t - C.root)));
  return T.NOTE_NAMES[r] + q + (ch.tones && ch.tones.length > 3 ? "7" : "") + (outside ? "*" : "");
};
console.log(`CHORDS  ${song.materials.chords.map(chName).join("  ")}` +
            `      bridge: ${song.materials.bridgeChords.map(chName).join("  ")}`);
console.log(`POCKET  [${song.materials.pocket.join(", ")}]  (kick placements, 16ths)`);
console.log(`FORM    ${song.sections.map(s => s.fn + (s.peak ? "^" : "") + "[" + s.material +
            (s.stripHalf ? "*" : "") + "]").join(" → ")}`);

/* ── WHICH MATERIALS TO PRINT — ASKED OF THE SONG, NEVER LISTED HERE ────────
   This was the literal ["A","B","C","Avar"], and the moment a Bvar existed the
   roll printed every other material and left the new one out entirely -- the
   same defect as the drum-lane list above, created fresh, in the same file,
   one commit later. A material the roll cannot show is a material nobody has
   read the notes of.
   Ordered so a variant follows the thing it varies; anything the song has and
   this order does not is appended rather than dropped. */
const MAT_ORDER = ["A", "Avar", "B", "Bvar", "C", "Cvar"];
const MATS = (() => {
  const have = Object.keys(song.materials)
    .filter(k => song.materials[k] && typeof song.materials[k] === "object"
                 && !Array.isArray(song.materials[k]) && song.materials[k].drums !== undefined);
  return MAT_ORDER.filter(k => have.includes(k))
         .concat(have.filter(k => !MAT_ORDER.includes(k)));
})();
for(const k of MATS) printMaterial(k, song.materials[k], song.materials.bars);
printMaterial("fill", { drums: song.materials.fill }, 1);
printMaterial("ending", { bass: song.materials.ending.filter(n => n.role === "bass"),
                          keys: song.materials.ending.filter(n => n.role === "keys") }, 1);

/* ── THE DERIVATION. "B is derived from A" is a claim; these are the numbers
   that make it checkable. ── */
console.log(`\n── DERIVATION ${"─".repeat(64)}`);
const sig = ns => ns.map(n => n.bar + ":" + n.step + ":" + n.pitch).join(",");
const rhythm = ns => ns.map(n => n.bar + ":" + n.step).join(",");
const A = song.materials.A, B = song.materials.B, Cm = song.materials.C, V = song.materials.Avar;
const same = (x, y) => x === y ? "IDENTICAL" : "different";
console.log(`  B keeps A's bass?      ${same(sig(A.bass), sig(B.bass))}`);
console.log(`  B keeps A's drums?     ${same(sig(A.drums), sig(B.drums))}`);
console.log(`  B's keys vs A's:       ${same(sig(A.keys), sig(B.keys))}  (chorus comps harder)`);
const bar = (ns, b) => ns.filter(n => n.bar === b).map(n => n.step + "/" + n.pitch).join(",");
console.log(`  B's hook restates:     bars 1-2 vs 3-4 ${bar(B.lead,0) === bar(B.lead,2) &&
                                                        bar(B.lead,1) === bar(B.lead,3) ? "EXACT" : "NOT EXACT ***"}`);
console.log(`  C leaves the changes?  ${same(song.materials.chords.map(c=>c.degree).join(),
                                              song.materials.bridgeChords.map(c=>c.degree).join())}`);
console.log(`  C's tune vs A's:       ${Cm.lead.length} notes vs ${A.lead.length} ` +
            `(augmentation doubles durations; it halves density only when A fills the loop)`);
console.log(`  Avar first half:       ${same(rhythm(A.lead.filter(n=>n.bar<2)), rhythm(V.lead.filter(n=>n.bar<2)))}`);
console.log(`  Avar second half:      ${same(rhythm(A.lead.filter(n=>n.bar>=2)), rhythm(V.lead.filter(n=>n.bar>=2)))}`);
const iv = ns => { const s = ns.slice().sort((a,z)=>a.bar-z.bar||a.step-z.step); const o=[];
                   for(let i=1;i<Math.min(5,s.length);i++) o.push(s[i].pitch - s[i-1].pitch); return o; };
console.log(`  A's opening intervals: [${iv(A.lead).join(", ")}]`);
console.log(`  B's opening intervals: [${iv(B.lead).join(", ")}]   (hook is built from A inverted)`);

/* ── THE POCKET, in milliseconds. The dilla claim, as a number. ── */
console.log(`\n── THE POCKET, one bar in ms ${"─".repeat(49)}`);
const spb = (60 / C.tempo) / 4;
const firstFull = song.sections.find(s => s.active.includes("drums"));
if(firstFull){
  const b0 = firstFull.startBar + 1;
  const evs = song.perf.events
    .filter(e => e.role === "drums" && e.tSec >= b0 * 16 * spb && e.tSec < (b0 + 1) * 16 * spb)
    .sort((a, z) => a.tSec - z.tSec);
  console.log("   lane      step   grid ms    actual ms    offset");
  for(const e of evs){
    const rel = e.tSec - b0 * 16 * spb, step = Math.round(rel / spb);
    const off = (rel - step * spb) * 1000;
    console.log(`   ${e.lane.padEnd(9)} ${String(step).padStart(3)}` +
                `${(step * spb * 1000).toFixed(1).padStart(10)}` +
                `${(rel * 1000).toFixed(1).padStart(13)}` +
                `${(off >= 0 ? "+" : "") + off.toFixed(1)}`.padStart(10) + " ms");
  }
}

/* ── the arranged song ── */
if(wantSong){
  console.log(`\n── THE SONG, section by section ${"─".repeat(46)}`);
  for(const s of song.sections){
    const evs = song.perf.events.filter(e => e.tSec >= s.startBar * 16 * spb &&
                                             e.tSec < s.endBar * 16 * spb && e.role !== "tape");
    const byRole = {};
    for(const e of evs) byRole[e.role] = (byRole[e.role] || 0) + 1;
    console.log(`  bars ${String(s.startBar).padStart(3)}-${String(s.endBar).padStart(3)}  ` +
                `${(s.fn + (s.peak ? "^" : "")).padEnd(13)} ${("[" + s.material + "]").padEnd(7)} ` +
                `energy ${s.energy.toFixed(2)}  ` +
                Object.entries(byRole).map(([r, n]) => `${r}:${n}`).join(" "));
  }
}

/* ── MIDI, written and then read back ── */
if(midFile){
  const bytes = M.toMidi(song);
  fs.writeFileSync(midFile, Buffer.from(bytes));
  /* parse it back: the only way "the export works" is a fact and not a hope */
  const buf = Buffer.from(bytes);
  let p = 0;
  const str = n => { const s = buf.slice(p, p + n).toString("latin1"); p += n; return s; };
  const u32 = () => { const v = buf.readUInt32BE(p); p += 4; return v; };
  const u16 = () => { const v = buf.readUInt16BE(p); p += 2; return v; };
  if(str(4) !== "MThd") throw new Error("not a MIDI file");
  u32(); const fmt = u16(), ntrk = u16(), ppq = u16();
  let onCount = 0, maxTick = 0, chans = new Set();
  for(let t = 0; t < ntrk; t++){
    if(str(4) !== "MTrk") throw new Error("bad track " + t);
    const len = u32(), end = p + len;
    let tick = 0, running = 0;
    while(p < end){
      let d = 0, b;
      do { b = buf[p++]; d = (d << 7) | (b & 0x7f); } while(b & 0x80);
      tick += d;
      let st = buf[p];
      if(st & 0x80){ p++; running = st; } else st = running;
      if(st === 0xff){ const ty = buf[p++]; let l = 0, c; do { c = buf[p++]; l = (l << 7) | (c & 0x7f); } while(c & 0x80); p += l; }
      else if(st === 0xf0 || st === 0xf7){ let l = 0, c; do { c = buf[p++]; l = (l << 7) | (c & 0x7f); } while(c & 0x80); p += l; }
      else {
        const hi = st & 0xf0;
        const n = (hi === 0xc0 || hi === 0xd0) ? 1 : 2;
        if(hi === 0x90 && buf[p + 1] > 0){ onCount++; chans.add(st & 0x0f); maxTick = Math.max(maxTick, tick); }
        p += n;
      }
    }
    p = end;
  }
  /* THE TOMS WERE MISSING FROM THIS LIST and had been since the tom kit landed,
     so this check reported "*** MISMATCH ***" on every song with a tom in it --
     11 of them on lofi seed 1, which is exactly the discrepancy it printed. The
     .mid was correct the whole time; the expectation was stale. Worth naming,
     because a round-trip check that cries wolf is one nobody reads, and this
     particular check is the one that caught 1520 genuinely missing notes once.
     The lane list now matches MIDI_MAP -- the same table the exporter writes
     through -- so it cannot fall behind a new lane again. */
  /* which events OUGHT to be notes -- asked of the program's own drum map, not
     of this file's display table. See DRUM_LANES: the two drifted apart and the
     check cried wolf on a correct export. */
  const GM = M.gmDrum ? M.gmDrum() : {};
  const expect = song.perf.events.filter(e => e.role !== "tape" &&
                  (e.role === "drums" ? (e.lane === "brk" || GM[e.lane] != null)
                                      : e.pitch != null)).length;
  const lastSec = maxTick / ppq * 60 / C.tempo;
  const songSec = song.form.nBars * 16 * spb;
  console.log(`\n── MIDI ${"─".repeat(70)}`);
  console.log(`  wrote ${midFile}  (${bytes.length} bytes, format ${fmt}, ${ntrk} tracks, ${ppq} ppq)`);
  console.log(`  note-ons parsed back: ${onCount}   events that should be notes: ${expect}   ` +
              (onCount === expect ? "MATCH" : "*** MISMATCH ***"));
  console.log(`  channels used: ${[...chans].sort((a,z)=>a-z).join(", ")}  (9 = GM drums)`);
  console.log(`  last note at ${lastSec.toFixed(1)}s of a ${songSec.toFixed(1)}s song`);
  if(onCount !== expect) process.exitCode = 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   --dump / --vs : WHAT CHANGED BETWEEN TWO BUILDS

       node harness/mk2_roll.js 1 --genre lofi --dump /tmp/before.json
       ...change the program...
       node harness/mk2_roll.js 1 --genre lofi --vs   /tmp/before.json

   WHY. BACKLOG §7 and HANDOFF §9.6: "the roll shows one song and cannot
   compare two. The interesting question about [eleven] unheard builds is what
   CHANGED, and the display answers 'what is there'." The glass got a GHOST for
   that; this is the same question asked of the PRINTOUT, where the answer can
   be counted instead of looked at.

   It compares the PERFORMED events -- what a listener would hear -- keyed by
   (role, bar, step, pitch/lane). So it reports notes that appeared, notes that
   vanished, and the bars they are in, per part. A change that moves no note
   says so in one line, which is the answer this session needed eleven times.

   IT DELIBERATELY IGNORES tSec. Two builds at different tempo place every note
   at a different second while playing the identical part -- exactly what lofi's
   84 -> 78 bpm change did -- so a time-keyed diff would report every note as
   moved and drown the one that really was. Bar and step are the musical
   position; seconds are a consequence of the tempo. The tempo change is
   reported separately, on its own line, where it can be read rather than
   mistaken for a thousand moved notes.
   ═══════════════════════════════════════════════════════════════════════════ */
{
  const dumpAt = argv.indexOf("--dump"), vsAt = argv.indexOf("--vs");
  const keyOf = e => [e.role, Math.floor(e.tSec / (16 * spb)),
                      Math.round((e.tSec / spb) % 16),
                      e.role === "drums" ? e.lane : e.pitch].join(":");
  const shape = () => ({
    genre: C.genre, seed: C.seed, tempo: C.tempo, bars: song.form.nBars,
    notes: song.perf.events.filter(e => e.role !== "tape").map(keyOf),
  });
  if(dumpAt >= 0){
    fs.writeFileSync(argv[dumpAt + 1], JSON.stringify(shape()));
    console.log(`\n── DUMP ${"─".repeat(70)}`);
    console.log(`  wrote ${argv[dumpAt + 1]}  (${shape().notes.length} performed notes, ` +
                `${C.genre} seed ${C.seed} at ${Math.round(C.tempo)} bpm)`);
  }
  if(vsAt >= 0){
    const ref = JSON.parse(fs.readFileSync(argv[vsAt + 1], "utf8"));
    const now = shape();
    console.log(`\n── VS ${argv[vsAt + 1]} ${"─".repeat(58)}`);
    if(ref.genre !== now.genre || ref.seed !== now.seed)
      console.log(`  ⚠ DIFFERENT SONG: reference is ${ref.genre} seed ${ref.seed}, ` +
                  `this is ${now.genre} seed ${now.seed}. Comparing anyway.`);
    if(Math.round(ref.tempo) !== Math.round(now.tempo))
      console.log(`  tempo ${Math.round(ref.tempo)} -> ${Math.round(now.tempo)} bpm ` +
                  `(every note lands at a different SECOND; the diff below is by BAR)`);
    if(ref.bars !== now.bars) console.log(`  length ${ref.bars} -> ${now.bars} bars`);
    const A = new Map(), B = new Map();
    for(const k of ref.notes) A.set(k, (A.get(k) || 0) + 1);
    for(const k of now.notes) B.set(k, (B.get(k) || 0) + 1);
    const roles = [...new Set([...ref.notes, ...now.notes].map(k => k.split(":")[0]))].sort();
    const gone = {}, came = {}, same = {};
    for(const r of roles){ gone[r] = 0; came[r] = 0; same[r] = 0; }
    for(const [k, n] of A){ const r = k.split(":")[0], b = B.get(k) || 0;
                            same[r] += Math.min(n, b); gone[r] += Math.max(0, n - b); }
    for(const [k, n] of B){ const r = k.split(":")[0], a = A.get(k) || 0;
                            came[r] += Math.max(0, n - a); }
    const tg = roles.reduce((s, r) => s + gone[r], 0), tc = roles.reduce((s, r) => s + came[r], 0);
    if(tg === 0 && tc === 0){
      console.log(`  NOT ONE NOTE MOVED  (${now.notes.length} performed notes, identical by bar and step)`);
    } else {
      console.log(`  part        gone   came   unchanged`);
      for(const r of roles){
        if(!gone[r] && !came[r] && !same[r]) continue;
        const mark = (gone[r] || came[r]) ? "  <--" : "";
        console.log(`  ${r.padEnd(10)} ${String(gone[r]).padStart(5)} ${String(came[r]).padStart(6)} ` +
                    `${String(same[r]).padStart(11)}${mark}`);
      }
      console.log(`  ${"total".padEnd(10)} ${String(tg).padStart(5)} ${String(tc).padStart(6)} ` +
                  `${String(roles.reduce((s, r) => s + same[r], 0)).padStart(11)}`);
      /* WHICH BARS, because "43 notes moved" does not tell you where to look */
      const bars = new Set();
      for(const [k, n] of A) if((B.get(k) || 0) < n) bars.add(+k.split(":")[1]);
      for(const [k, n] of B) if((A.get(k) || 0) < n) bars.add(+k.split(":")[1]);
      const list = [...bars].sort((a, z) => a - z);
      console.log(`  bars touched: ${list.length} of ${now.bars}` +
                  (list.length && list.length <= 24 ? "  [" + list.map(b => b + 1).join(" ") + "]" : ""));
    }
  }
}
