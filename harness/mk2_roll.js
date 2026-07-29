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
eval(src + ";global.__T = { NOTE_NAMES, degMidi, MODES, pc, inKey };");
const M = global.window.MK2, T = global.__T;

const argv = process.argv.slice(2);
const seed = parseInt(argv[0], 10) || 1;
const rig = ["band","sega","neon"].includes(argv[1]) ? argv[1] : undefined;
const gAt = argv.indexOf("--genre");
const genre = gAt >= 0 ? argv[gAt + 1] : undefined;
const wantSong = argv.includes("--song");
const midAt = argv.indexOf("--mid");
const midFile = midAt >= 0 ? argv[midAt + 1] : null;

const song = M.composeSong(seed, rig, genre);
const C = song.chart;
const nm = p => T.NOTE_NAMES[T.pc(p)] + (Math.floor(p / 12) - 1);   // midi 60 -> C4

/* ── the grid. 16 steps a bar, four bars across, one line per lane/role. ── */
const RULER = "1e+a2e+a3e+a4e+a";
const DRUM_CH = { kick: "K", snare: "S", ghost: "g", hat: "x", openhat: "O",
                  tom1: "1", tom2: "2", tom3: "3" };

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

function printMaterial(key, mat, bars){
  console.log(`\n── MATERIAL ${key} ${"─".repeat(62 - key.length)}`);
  console.log("        " + Array.from({ length: bars }, (_, i) => RULER).join(" "));
  const lanes = ["kick", "snare", "ghost", "tom1", "tom2", "tom3", "hat", "openhat"];
  for(const lane of lanes){
    const ns = (mat.drums || []).filter(n => n.lane === lane);
    if(!ns.length) continue;
    console.log(lane.padEnd(8) + gridLine(ns, bars, () => DRUM_CH[lane]));
  }
  for(const role of ["ostinato", "bass", "keys", "lead", "counter"]){
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
  }
  /* the notes themselves, because a grid cannot show octave or velocity */
  for(const role of ["ostinato", "bass", "keys", "lead", "counter"]){
    const ns = (mat[role] || []).slice().sort((a, z) => a.bar - z.bar || a.step - z.step || a.pitch - z.pitch);
    if(!ns.length) continue;
    const parts = ns.map(n => `${n.bar + 1}.${String(n.step).padStart(2)} ${nm(n.pitch).padEnd(4)}` +
                              `${String(n.dur).padStart(2)}s v${n.vel.toFixed(2)}`);
    console.log(`\n  ${role} (${ns.length} notes)`);
    for(let i = 0; i < parts.length; i += 4) console.log("    " + parts.slice(i, i + 4).join("  |  "));
  }
}

/* ── header ── */
console.log("═".repeat(78));
console.log(`SEED ${C.seed} · ${C.genre} · ${T.NOTE_NAMES[C.root]} ${C.mode} · ${C.tempo} bpm · ` +
            `rig ${C.rig} · keys ${C.keysChar} · ${song.form.nBars} bars · ` +
            `${song.perf.events.length} events`);
console.log(`GROOVE  ${song.perf.groove.style}` +
  (song.perf.groove.style === "dilla"
    ? `  snare ${(song.perf.groove.snareEarly * 100).toFixed(0)}% of a 16th EARLY, ` +
      `kick +${(song.perf.groove.kickLate * 100).toFixed(0)}% LATE`
    : ""));
const chName = ch => T.NOTE_NAMES[T.pc(T.degMidi(C.root, C.mode, ch.degree))] + (ch.seventh ? "7" : "");
console.log(`CHORDS  ${song.materials.chords.map(chName).join("  ")}` +
            `      bridge: ${song.materials.bridgeChords.map(chName).join("  ")}`);
console.log(`POCKET  [${song.materials.pocket.join(", ")}]  (kick placements, 16ths)`);
console.log(`FORM    ${song.sections.map(s => s.fn + (s.peak ? "^" : "") + "[" + s.material +
            (s.stripHalf ? "*" : "") + "]").join(" → ")}`);

for(const k of ["A", "B", "C", "Avar"]) printMaterial(k, song.materials[k], song.materials.bars);
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
  const expect = song.perf.events.filter(e => e.role !== "tape" &&
                  (e.role === "drums" ? DRUM_CH[e.lane] != null : e.pitch != null)).length;
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
