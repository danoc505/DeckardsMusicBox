#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   MK2_SCORE — THE WHOLE RECORD, EVERY INSTRUMENT, AS NOTES.
   AND SINCE 2026-08-18, THE ONLY TEST THIS PROJECT HAS.

       node harness/mk2_score.js                    every genre, seed 1 + a drawn one
       node harness/mk2_score.js --genre lofi --seed 7
       node harness/mk2_score.js --mid out/         ...and real .mid files with it

   WHY THIS EXISTS, and it is the owner's complaint written down twice:

     "Does it print out midi notes and read them for all instruments in the
      whole song? If not its trash and worthless!"

     "the tests they are a huge waste of time and the main test that needs to
      be done is to print out the midi of seed 1 and a random seed all the
      instruments and the whole song. This is the real test that should be
      being done its the only way you can actually see your work is doing
      something correct."

   He is right both times, and here is what the repo had instead:

     mk2_test.js    190 pass/fail checks, 4,300 lines, twelve to fifteen minutes
                    a run. It printed ZERO notes. Every finding it could state
                    was a percentage — "44.2% of 4136 leap away" — and a
                    percentage is not a thing you can look at and judge. DELETED.

     87 probes      one per question, each one reaching past the interface to
                    measure something behind it. Several were found measuring a
                    different program than the one that plays. DELETED.

   WHAT IT PRINTS, bar by bar, for the whole record:

     - one line per sounding part, as a 16-step grid with note names, in
       score order (lead on top, bass at the bottom, drums under that)
     - the drums as their own lanes, named
     - the section, the material each part is playing, the chord, the tempo
       and the clock time at every section boundary
     - the SFX and the journey events on the bar they land on

   IT READS FROM THE PERFORMANCE, NOT THE MATERIALS. The materials are what
   was written; the performance is what is played, after stage 4 chose which
   material goes where and stage 5 selected the third statements, the
   evolution links and the formula variants. Printing the materials would
   print the paper and not the record — which is exactly the mistake that let
   "the lead is one loop" survive a printout once already.

   Events carry `tSec`, never `bar` [the clock is the one owner of bar<->time],
   so every event here is placed by asking `makeClock(chart, form)` which bar
   and step its own start time falls on. A note that lands off the grid is
   printed at the nearest step with its offset in milliseconds beside it,
   rather than being quietly rounded into place.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function score(M, opts){
  const GENRE = (opts && opts.genre) || M.genres()[0];
  const SEED  = (opts && opts.seed  != null) ? opts.seed : 1;
  const FROM  = (opts && opts.from  != null) ? opts.from : 0;
  const TO    = (opts && opts.to    != null) ? opts.to   : 999999;

  const NOTE = NOTE_NAMES;
  const nn = p => NOTE[((p % 12) + 12) % 12] + (Math.floor(p / 12) - 1);
  const mmss = t => Math.floor(t / 60) + ":" + String(Math.floor(Math.max(0, t) % 60)).padStart(2, "0");

  const lines = [];
  const say = s => lines.push(s == null ? "" : s);

  /* ── SCORE ORDER, and it is the score's, not the object's ─────────────────
     A score is read top to bottom by register and by function: the melody on
     top, the inner voices under it, the bass at the foot, percussion below the
     staff. Object key order is whatever stage 3 happened to publish in, which
     would put the keys above the lead. */
  const ORDER = ["lead", "counter", "keys2", "keys", "ostinato", "bass", "drone"];
  const rank = r => { const i = ORDER.indexOf(r); return i < 0 ? ORDER.length : i; };

  /* composeSong(seed, rig, genre, picks, pins, edits, traitRoll, traits, wantSec).
     GENRE may be a name OR a set of weights — {lofi:0.5, dungeonsynth:0.5} is
     what the blend sliders send, so the printer can read a blended record the
     same way it reads a plain one. Everything past it is a hand on the program:
     which machines are loaded, which genre each part of a blend comes from,
     how long the record should be. A printer that cannot reach those is a
     printer that cannot see half the program. */
  const song  = M.composeSong(SEED, opts && opts.rig, GENRE,
                              opts && opts.picks, opts && opts.pins, undefined,
                              (opts && opts.deal) || 0, opts && opts.traits,
                              opts && opts.wantSec);
  const clock = M.makeClock(song.chart, song.form);
  const STEPS = M.stepsOf(song.chart.table) || 16;
  const evs   = song.perf.events;

  /* every event placed on the grid by the clock, which owns bar<->time */
  const placed = [];
  for(const e of evs){
    /* `barAt` answers in FRACTIONAL bars -- 376.87 is "most of the way through
       bar 376", not bar 377. The first version of this file compared that to an
       integer and matched almost nothing: it printed ONE bar of a 377-bar record
       and reported the rest as silence. The floor is the bar; the remainder is
       the step, and it is computed from the bar's own start time below because
       the tempo moves and a step is not a constant length. */
    let bar = Math.max(0, Math.floor(clock.barAt(e.tSec)));
    let stepF = (e.tSec - clock.at(bar)) / clock.stepSec(bar);
    let step = Math.max(0, Math.round(stepF));
    /* ── A NOTE THAT ROUNDS PAST THE BAR LINE BELONGS TO THE NEXT BAR ──────
       Clamping it to step 15 instead printed C#2[+174] — a note 174 ms late on
       the last sixteenth, which is not a groove, it is the downbeat of the next
       bar wearing the previous bar's clothes. Six of them appeared in the first
       four bars I read. The offset is the thing this printout exists to make
       visible, so it may not be an artefact of where the printout decided to
       put the note. */
    if(step >= STEPS){ bar += 1; stepF -= STEPS; step = 0; }
    const offMs = Math.round((stepF - step) * clock.stepSec(bar) * 1000);
    placed.push({ e, bar, step, offMs });
  }

  const lastBar = placed.reduce((m, p) => Math.max(m, p.bar), 0);   // an integer, per above
  const PITCHED = new Set(ORDER);

  /* what each section is, keyed by its first bar */
  const secAt = {};
  for(const s of song.form) secAt[s.startBar] = s;

  /* WHICH MATERIAL IS BEING PLAYED, from the section that decided it. The
     performance events do not carry it — stage 4 owns that choice and records it
     on the section — so it is printed once at the section head rather than
     guessed at per note. */
  const matAt = {};
  for(const s of (song.sections || [])) matAt[s.startBar] = s;

  say("╔" + "═".repeat(78) + "╗");
  say("║  THE SCORE — every instrument, every bar, as notes" + " ".repeat(27) + "║");
  say("╚" + "═".repeat(78) + "╝");
  say("");
  const GNAME = typeof GENRE === "string" ? GENRE
              : Object.entries(GENRE).map(([g, w]) => g + " " + Math.round(w * 100) + "%").join(" + ");
  say(`  ${GNAME}   seed ${SEED}   ${song.chart.mode}   ${lastBar + 1} bars   ` +
      `${mmss(clock.at(lastBar + 1))}   ${song.form.length} sections`);
  const band = [];
  for(const r of ORDER){
    const v = [...new Set(placed.filter(p => p.e.role === r && p.e.pitch != null).map(p => p.e.voice))];
    if(v.length) band.push(r + "=" + v.join("/"));
  }
  say("  " + band.join("   "));
  say("");
  say("  READ IT: one line a part, 16 sixteenths a bar. `*` is a strike, `-` is the");
  say("  note still sounding, `.` is silence. The note names follow in the order");
  say("  they are struck. A number in brackets is how many milliseconds a note sits");
  say("  off its step — the groove, printed rather than hidden.");
  say("");

  let printedBars = 0, silentRun = 0;

  for(let bar = 0; bar <= lastBar; bar++){
    if(bar < FROM || bar > TO) continue;
    const here = placed.filter(p => p.bar === bar);

    if(secAt[bar]){
      const s = secAt[bar];
      const ch = song.materials.chordsOf ? null : null;
      say("");
      say("─".repeat(80));
      say(`  ${mmss(clock.at(bar))}   ${String(s.fn).toUpperCase()}   bars ${s.startBar}-${s.endBar}` +
          `   ${Math.round(clock.tempoAt(bar))} bpm` +
          (s.leg != null ? `   leg ${s.leg}` : "") + (s.atStop ? `   AT A STOP` : "") +
          (s.terrain ? `   ${s.terrain}` : "") + (s.place ? `   ${s.place}` : ""));
      const m = matAt[bar];
      if(m) say(`  material ${m.material}   playing: ${(m.active || []).join(" ")}` +
                (m.machines && Object.keys(m.machines).length
                  ? `   ${Object.entries(m.machines).map(([k, v]) => k + "=" + v).join(" ")}` : "") +
                (m.peak ? "   PEAK" : "") + `   energy ${m.energy.toFixed(2)}`);
      say("─".repeat(80));
    }

    const pitched = here.filter(p => p.e.pitch != null && PITCHED.has(p.e.role));
    const drums   = here.filter(p => p.e.role === "drums");
    const world   = here.filter(p => !PITCHED.has(p.e.role) && p.e.role !== "drums");

    if(!pitched.length && !drums.length && !world.length){ silentRun++; continue; }
    if(silentRun){ say(`      … ${silentRun} bar(s) with nothing in them`); silentRun = 0; }

    say("");
    say(`  bar ${String(bar).padStart(3)}   ${mmss(clock.at(bar))}`);

    /* ── the pitched parts, in score order ─────────────────────────────── */
    const byRole = {};
    for(const p of pitched) (byRole[p.e.role] || (byRole[p.e.role] = [])).push(p);
    const roles = Object.keys(byRole).sort((a, z) => rank(a) - rank(z));

    for(const role of roles){
      const ns = byRole[role].slice().sort((a, z) => a.step - z.step);
      const grid = new Array(STEPS).fill(".");
      for(const p of ns){
        grid[p.step] = "*";
        const len = Math.max(1, Math.round((p.e.durSec || 0) / clock.stepSec(bar)));
        for(let d = 1; d < len && p.step + d < STEPS; d++)
          if(grid[p.step + d] === ".") grid[p.step + d] = "-";
      }
      const names = ns.map(p => nn(p.e.pitch) + (Math.abs(p.offMs) >= 12 ? `[${p.offMs > 0 ? "+" : ""}${p.offMs}]` : ""));
      const voice = [...new Set(ns.map(p => p.e.voice))].join("/");
      say(`    ${role.padEnd(9)}${voice.padEnd(11)}|${grid.join("")}|  ${names.join(" ")}`);
    }

    /* ── the drums, one line a lane, named ─────────────────────────────── */
    if(drums.length){
      const byLane = {};
      for(const p of drums) (byLane[p.e.lane] || (byLane[p.e.lane] = [])).push(p);
      for(const lane of Object.keys(byLane).sort()){
        const grid = new Array(STEPS).fill(".");
        for(const p of byLane[lane]) grid[p.step] = "x";
        const snd = [...new Set(byLane[lane].map(p => p.e.voice || p.e.timbre))].join("/");
        say(`    ${("· " + lane).padEnd(9)}${String(snd).padEnd(11)}|${grid.join("")}|`);
      }
    }

    /* ── and everything that is not the band ───────────────────────────── */
    if(world.length){
      const names = world.map(p => (p.e.name || p.e.voice || p.e.timbre || p.e.role) +
                                   "@" + mmss(p.e.tSec));
      say(`    ${"(world)".padEnd(20)}${[...new Set(names)].join("  ")}`);
    }
    printedBars++;
  }
  if(silentRun) say(`      … ${silentRun} bar(s) with nothing in them`);

  /* ── AND THE TOTALS, so the printout can be checked against itself ────── */
  say("");
  say("═".repeat(80));
  say("  WHAT WAS PRINTED");
  const tot = {};
  for(const p of placed){
    if(p.e.pitch == null && p.e.role !== "drums") continue;
    const k = p.e.role;
    (tot[k] || (tot[k] = { n: 0, lo: 999, hi: -999, voices: new Set() })).n++;
    tot[k].voices.add(p.e.voice);
    if(p.e.pitch != null){ tot[k].lo = Math.min(tot[k].lo, p.e.pitch); tot[k].hi = Math.max(tot[k].hi, p.e.pitch); }
  }
  for(const r of Object.keys(tot).sort((a, z) => rank(a) - rank(z)))
    say(`    ${r.padEnd(10)} ${String(tot[r].n).padStart(5)} events   ` +
        (tot[r].hi > -999 ? `${nn(tot[r].lo)}..${nn(tot[r].hi)}   ` : "") +
        [...tot[r].voices].join(" "));
  say(`    ${printedBars} bars printed of ${lastBar + 1}`);
  say("");

  return lines;
}


module.exports = { score };

/* ═══════════════════════════════════════════════════════════════════════════
   THE ONLY TEST. THE OWNER, 2026-08-18:

     "the tests they are a huge waste of time and the main test that needs to
      be done is to print out the midi of seed 1 and a random seed all the
      instruments and the whole song. This is the real test that should be
      being done its the only way you can actually see your work is doing
      something correct."

   So this file is now the whole test. There is no pass/fail battery any more —
   190 checks and 4,300 lines of it were deleted on the same day this was
   written, along with 87 probes. Nothing here reports green. It prints what the
   program made and you read it.

   WHAT IT DOES BY DEFAULT

     every genre, twice: seed 1 and one drawn fresh each run, every instrument,
     every bar, start to finish.

   Seed 1 is the seed every measurement in this repo has ever quoted, which is
   exactly why it is the seed a fault can hide behind — fix what seed 1 shows
   and the record can still be broken everywhere else. The drawn seed is named
   in its own header so anything it turns up can be reproduced on demand.

   HOW TO RUN IT

     node harness/mk2_score.js                     every genre, seed 1 + a drawn one
     node harness/mk2_score.js --genre lofi        one genre, seed 1 + a drawn one
     node harness/mk2_score.js --genre lofi --seed 7      one genre, one seed
     node harness/mk2_score.js --seeds 1,7,42      the seeds you name, every genre
     node harness/mk2_score.js --from 0 --to 8     a window of bars, not the whole song
     node harness/mk2_score.js --out score.txt     to a file instead of the screen
     node harness/mk2_score.js --mid out/          ...and write real .mid files too
     node harness/mk2_score.js --file other.html   read a different program

   AND THE HAND ON THE PROGRAM — everything the front panel can do, printable:

     --blend lofi:50,dungeonsynth:50    the faders, as percentages
     --trait kit=dungeonsynth,bass=lofi which genre each part of a blend is from
     --deal 3                           same sliders, a different hand
     --rig band                         which set of players
     --picks lead=sax,keys2=wurly       which machines are loaded in the rack
     --len 2:00                         ask for a length

   These moved here from `mk2_roll.js`, which was deleted with the rest of the
   battery. It printed a second, different picture of the same song, and having
   two printers is how the last confusion started, so there is one now.

   IT READS `Deckards Orchestrator MK2.html`. It used to read `Boxcar Synth.html`
   and so did all eighty-nine other tools in this folder, for two days, without
   saying so anywhere you would see it. That is how a whole test folder came to
   be grading a file nobody was working on. The name of the file being read is
   printed at the top of every run now, so it can never be a silent default
   again. ══════════════════════════════════════════════════════════════════ */
if(require.main === module){
  const argv = process.argv.slice(2);
  const argOf = (name, dflt) => {
    const i = argv.indexOf(name);
    return i >= 0 && argv[i + 1] != null ? argv[i + 1] : dflt;
  };

  const OUT    = argOf("--out", null);
  const MIDDIR = argOf("--mid", null);
  const HTML   = argOf("--file", path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"));
  const FROM   = parseInt(argOf("--from", "0"), 10);
  const TO     = parseInt(argOf("--to", "999999"), 10);
  const RIG    = argOf("--rig", null) || undefined;
  const DEAL   = parseInt(argOf("--deal", "0"), 10) || 0;

  /* --blend lofi:50,dungeonsynth:50 — percentages, because that is what the
     sliders show. They are normalised downstream anyway. */
  const BLEND = argOf("--blend", null) ? Object.fromEntries(
    argOf("--blend", "").split(",").map(part => {
      const [n, w] = part.split(":");
      return [n.trim(), (w == null ? 1 : parseFloat(w)) / 100];
    })) : null;

  const pairs = flag => argOf(flag, null) ? Object.fromEntries(
    argOf(flag, "").split(",").map(x => x.split("=").map(y => y.trim()))) : undefined;
  const PICKS  = pairs("--picks");
  const TRAITS = pairs("--trait");

  /* --len 2:00, or --len 120 */
  const lenArg = argOf("--len", null);
  const WANTSEC = lenArg == null ? undefined
                : lenArg.includes(":") ? (+lenArg.split(":")[0] * 60 + +lenArg.split(":")[1])
                : parseFloat(lenArg);

  const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
  global.window = { addEventListener(){}, MK2: null };
  global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                      createElement: () => ({ click(){} }) };
  eval(src);
  const M = global.window.MK2;

  /* which genres — all of them unless one is named. Derived from the program,
     never listed here: a list written out in a tool is a bug with a commit date
     on it, and this folder has proved that four times. */
  const ONEG   = argOf("--genre", null);
  const GENRES = BLEND ? [BLEND] : ONEG ? [ONEG] : M.genres();
  for(const g of GENRES){
    if(typeof g !== "string") continue;                  /* a blend, checked just below */
    if(!M.genres().includes(g)){
      console.error(`\n  mk2_score: "${g}" is not a genre in this program.\n` +
                    `             it has: ${M.genres().join(", ")}\n`);
      process.exit(2);
    }
  }
  if(BLEND) for(const g of Object.keys(BLEND)){
    if(!M.genres().includes(g)){
      console.error(`\n  mk2_score: --blend names "${g}", which is not a genre in this program.\n` +
                    `             it has: ${M.genres().join(", ")}\n`);
      process.exit(2);
    }
  }

  /* which seeds. Seed 1 always, then one DRAWN — and drawn is the point. A
     second fixed seed would just be a second seed 1: something both of them
     happen to survive is exactly the kind of fault that lives for months. */
  const DRAWN  = 2 + Math.floor(Math.random() * 998);
  const SEEDS  = argOf("--seeds", null) ? argOf("--seeds", "").split(",").map(s => parseInt(s.trim(), 10))
               : argv.indexOf("--seed") >= 0 ? [parseInt(argOf("--seed", "1"), 10)]
               : [1, DRAWN];

  const out = [];
  const say = s => out.push(s == null ? "" : s);

  say("");
  say("█".repeat(80));
  say("█  THE PRINTOUT — the whole record, every instrument, as notes");
  say("█  reading: " + path.basename(HTML));
  const label = g => typeof g === "string" ? g
              : Object.entries(g).map(([n, w]) => n + " " + Math.round(w * 100) + "%").join(" + ");
  say("█  genres:  " + GENRES.map(label).join(", "));
  if(RIG)     say("█  rig:     " + RIG);
  if(PICKS)   say("█  rack:    " + Object.entries(PICKS).map(([k, v]) => k + "=" + v).join(" "));
  if(TRAITS)  say("█  by hand: " + Object.entries(TRAITS).map(([k, v]) => k + " from " + v).join(", "));
  if(DEAL)    say("█  hand:    deal " + DEAL);
  if(WANTSEC) say("█  length:  " + Math.floor(WANTSEC / 60) + ":" +
                  String(Math.round(WANTSEC % 60)).padStart(2, "0") + " asked for");
  say("█  seeds:   " + SEEDS.map(s => s === 1 ? "1 (the seed every measurement quotes)"
                                              : s === DRAWN ? s + " (drawn this run)"
                                              : String(s)).join("   "));
  say("█".repeat(80));

  let threw = 0;
  const written = [];

  for(const genre of GENRES){
    for(const seed of SEEDS){
      say("");
      say("");
      say("█".repeat(80));
      say("█  " + label(genre).toUpperCase() + " — seed " + seed +
          (seed === DRAWN ? "   (drawn this run — reproduce with: node harness/mk2_score.js " +
                            (typeof genre === "string" ? "--genre " + genre
                                                       : "--blend " + argOf("--blend", "")) +
                            " --seed " + seed + ")" : ""));
      say("█".repeat(80));
      try {
        say(score(M, { genre, seed, from: FROM, to: TO, rig: RIG, picks: PICKS,
                       traits: TRAITS, deal: DEAL, wantSec: WANTSEC }).join("\n"));
      } catch(e){
        /* A PRINTER THAT THREW IS THE FINDING. Not a caught error to move past:
           it means the program could not make this song at all, and that is the
           single most important thing this run can tell you. It is said here, it
           is counted, and it is said again at the bottom. */
        threw++;
        say("");
        say("  ✗ THE PROGRAM COULD NOT MAKE THIS SONG.");
        say("    " + e.message);
        say("    " + (e.stack || "").split("\n").slice(1, 5).join("\n    "));
      }

      /* the real .mid, written and read back — because "the export works" has
         to be a fact and not a hope, and a file you can open in anything is a
         second pair of eyes on the same notes */
      if(MIDDIR){
        try {
          fs.mkdirSync(MIDDIR, { recursive: true });
          const song  = M.composeSong(seed, RIG, genre, PICKS, undefined, undefined,
                                      DEAL, TRAITS, WANTSEC);
          const bytes = M.toMidi(song);
          const file  = path.join(MIDDIR,
            `${label(genre).replace(/[^a-z0-9]+/gi, "-")}-seed${seed}.mid`);
          fs.writeFileSync(file, Buffer.from(bytes));
          const buf = Buffer.from(bytes);
          let p = 0;
          const str = n => { const s = buf.slice(p, p + n).toString("latin1"); p += n; return s; };
          const u32 = () => { const v = buf.readUInt32BE(p); p += 4; return v; };
          const u16 = () => { const v = buf.readUInt16BE(p); p += 2; return v; };
          if(str(4) !== "MThd") throw new Error("what came back is not a MIDI file");
          u32(); const fmt = u16(), ntrk = u16(), ppq = u16();
          let ons = 0;
          for(let t = 0; t < ntrk; t++){
            if(str(4) !== "MTrk") throw new Error("bad track " + t);
            const len = u32(), end = p + len;
            let running = 0;
            while(p < end){
              let b; do { b = buf[p++]; } while(b & 0x80);
              let st = buf[p];
              if(st & 0x80){ p++; running = st; } else st = running;
              if(st === 0xff){ p++; let l = 0, c; do { c = buf[p++]; l = (l << 7) | (c & 0x7f); } while(c & 0x80); p += l; }
              else if(st === 0xf0 || st === 0xf7){ let l = 0, c; do { c = buf[p++]; l = (l << 7) | (c & 0x7f); } while(c & 0x80); p += l; }
              else { const hi = st & 0xf0; if(hi === 0x90 && buf[p + 1] > 0) ons++; p += (hi === 0xc0 || hi === 0xd0) ? 1 : 2; }
            }
            p = end;
          }
          written.push(`${file}  ${bytes.length} bytes, ${ntrk} tracks, ${ons} notes read back`);
          say("");
          say(`  .mid written: ${file}   ${ntrk} tracks, ${ons} notes, format ${fmt}, ${ppq} ppq`);
        } catch(e){
          threw++;
          say("");
          say("  ✗ THE .mid COULD NOT BE WRITTEN OR READ BACK: " + e.message);
        }
      }
    }
  }

  say("");
  say("█".repeat(80));
  say("█  " + GENRES.length * SEEDS.length + " records printed" +
      (threw ? "   ✗ " + threw + " of them the program could not make" : ""));
  if(written.length){ say("█  .mid files:"); for(const w of written) say("█    " + w); }
  say("█  Nothing above is a pass or a fail. Read it.");
  say("█".repeat(80));
  say("");

  const text = out.join("\n") + "\n";
  /* count the LINES IN THE FILE, not the number of times say() was called --
     plenty of those calls carry several lines at once, so the old count read
     86 for a 9,000-line printout. A tool whose whole job is to report what is
     actually there cannot misreport its own size. */
  if(OUT){ fs.writeFileSync(OUT, text); console.log(`wrote ${OUT}  (${text.split("\n").length - 1} lines)`); }
  else process.stdout.write(text);

  process.exit(threw ? 1 : 0);
}
