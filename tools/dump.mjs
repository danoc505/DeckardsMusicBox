#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE NOTE DUMPER — what a program actually writes, as text.

   Loads an Orchestrator HTML file in a headless browser, composes songs across
   a sweep of genres and seeds, and writes each one out as a TSV of note events
   plus a header describing the chart and the form.

   WHY TEXT AND NOT AUDIO. A record can only be judged by ear, and a .wav is
   opaque to anything that is not one. A note list is not: leaps against steps,
   distinct bars against total bars, which declared parts never sound, how long
   a figure survives unchanged — all of it is counting, and all of it is
   invisible in a rendered file. Write the .mid alongside (--mid) when somebody
   wants to listen; read the .tsv when something needs to be measured.

   NO AUDIO IS TOUCHED. `composeSong` is a pure function of its inputs and the
   AudioContext is created lazily elsewhere, so nothing here needs a sound card,
   a codec, or a render.

   The format is at tools/FORMAT.md.

   usage:
     node tools/dump.mjs                            # all genres, seeds 1-8
     node tools/dump.mjs --seeds 1-64
     node tools/dump.mjs --genres dungeonsynth,ds2 --rig draw
     node tools/dump.mjs --mid                      # also write .mid per song
     node tools/dump.mjs --file "Some Other.html" --out dumps/other
   ═══════════════════════════════════════════════════════════════════════════ */

import { createRequire } from "node:module";
import { readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

/* ── FINDING PLAYWRIGHT ────────────────────────────────────────────────────
   It may be a local dependency or a global install, and a tool that only
   works in one of those is a tool somebody has to fix before using. Each
   candidate is tried and the first that resolves wins; if none does, the
   error says what to install rather than an ERR_MODULE_NOT_FOUND. */
function loadPlaywright(){
  const bases = [
    join(ROOT, "node_modules") + "/",
    "/opt/node22/lib/node_modules/",
    "/usr/lib/node_modules/",
    "/usr/local/lib/node_modules/",
  ];
  for(const b of bases){
    try { return createRequire(b)("playwright"); } catch(e){ /* next */ }
  }
  throw new Error("playwright not found — `npm i -D playwright` (Chromium is already at " +
                  (process.env.PLAYWRIGHT_BROWSERS_PATH || "the default path") + ")");
}

/* ── ARGUMENTS ───────────────────────────────────────────────────────────── */
function parseArgs(argv){
  const o = { file: null, out: null, genres: null, seeds: "1-8", rig: "draw",
              len: null, mid: false, quiet: false, jobs: 1 };
  for(let i = 0; i < argv.length; i++){
    const a = argv[i];
    const next = () => argv[++i];
    if(a === "--file") o.file = next();
    else if(a === "--out") o.out = next();
    else if(a === "--genres") o.genres = next().split(",").map(s => s.trim()).filter(Boolean);
    else if(a === "--seeds") o.seeds = next();
    else if(a === "--rig") o.rig = next();
    else if(a === "--len") o.len = +next();
    else if(a === "--mid") o.mid = true;
    else if(a === "--quiet") o.quiet = true;
    else if(a === "-h" || a === "--help"){ usage(); process.exit(0); }
    else throw new Error("unknown argument: " + a);
  }
  return o;
}
function usage(){
  console.log(`node tools/dump.mjs [options]

  --file <path>     the program to dump (default: the single .html in the repo root)
  --out <dir>       where to write (default: dumps/<file stem>)
  --genres a,b,c    which genres (default: every genre the program declares)
  --seeds 1-8       a range, or a comma list, or both: 1-8,42,101
  --rig <name>      rig to force, or "draw" to let the genre draw it (default: draw)
  --len <seconds>   ask for a length; omit to let the genre decide
  --mid             also write a .mid beside each .tsv (for ears, not for diffing)
  --quiet           only print the summary line`);
}

/* "1-8,42,101-103" -> [1..8, 42, 101, 102, 103] */
function parseSeeds(spec){
  const out = [];
  for(const part of String(spec).split(",")){
    const s = part.trim();
    if(!s) continue;
    const m = /^(-?\d+)-(-?\d+)$/.exec(s);
    if(m){
      const a = +m[1], b = +m[2];
      for(let i = Math.min(a, b); i <= Math.max(a, b); i++) out.push(i);
    } else if(/^-?\d+$/.test(s)) out.push(+s);
    else throw new Error("bad seed spec: " + s);
  }
  if(!out.length) throw new Error("no seeds");
  return out;
}

/* the program to dump, if nobody said: the one .html sitting in the repo root.
   Guessing is only safe when there is exactly one candidate, so more than one
   is an error that names them rather than a coin toss. */
function findProgram(){
  const html = readdirSync(ROOT).filter(f => f.toLowerCase().endsWith(".html"));
  if(html.length === 1) return join(ROOT, html[0]);
  if(!html.length) throw new Error("no .html in " + ROOT + " — pass --file");
  throw new Error("several .html files in the repo root, pass --file:\n  " + html.join("\n  "));
}

const pad = (n, w) => String(n).padStart(w, "0");
const stem = p => p.split("/").pop().replace(/\.html?$/i, "");
const slug = s => String(s).replace(/[^A-Za-z0-9._-]+/g, "_");

/* ═══════════════════════════════════════════════════════════════════════════
   THE EXTRACTOR — runs INSIDE the page.

   It builds the whole TSV in the browser and hands back a string. Returning
   the song object instead would serialise every frozen material, every motion
   lane and every chord set across the bridge for each seed, which is megabytes
   of structure nobody reads. What leaves the page is what gets written.
   ═══════════════════════════════════════════════════════════════════════════ */
const EXTRACT = ({ seed, rig, genre, wantSec, wantMid }) => {
  const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const r4 = n => (Math.round(n * 1e4) / 1e4).toFixed(4);
  const r3 = n => (Math.round(n * 1e3) / 1e3).toFixed(3);
  const r2 = n => (Math.round(n * 1e2) / 1e2).toFixed(2);

  /* the picks/pins/edits an untouched program composes with — the defaults
     from the UI's own globals, not a guess at them */
  const PICKS = { drums: "auto", bass: "auto", keys: "auto",
                  kit: {}, lane: {}, stack: [] };

  let song;
  try {
    song = composeSong(seed, rig, genre, PICKS, {}, [], 0, {},
                       wantSec == null ? null : wantSec);
  } catch(err){
    return { ok: false, error: String((err && err.message) || err) };
  }

  const C = song.chart, F = song.form, P = song.perf, M = song.motion;
  const CLK = M && M.clock;
  const steps = (M && M.steps) || 16;
  const barAt = t => CLK ? CLK.barAt(t) : (t / ((M ? M.spb : 0.125) * steps));

  /* the chords, named the way the readout names them, so the header can be
     read against the program's own display without a translation step */
  const chordName = ch => {
    const root = ch.tri ? ch.tri.pc : ((ch.rootMidi % 12) + 12) % 12;
    const third = ch.tones.length > 1 ? (((ch.tones[1] - ch.tones[0]) % 12) + 12) % 12 : 4;
    const q = third === 3 ? "m" : third === 4 ? "" : "sus";
    return NOTE[root] + q + (ch.tones.length > 3 ? "7" : "");
  };

  const L = [];
  L.push("#format\tdeckard-events\t1");
  L.push("#program\t" + (document.title || location.pathname.split("/").pop()));
  L.push("#genre\t" + genre);
  L.push("#label\t" + (C.table.label || genre));
  L.push("#seed\t" + seed);
  L.push("#rig\t" + rig + "\t" + (C.rig || ""));
  L.push("#key\t" + NOTE[((C.root % 12) + 12) % 12]);
  L.push("#mode\t" + C.mode);
  L.push("#tempo\t" + r2(C.tempo));
  L.push("#bars\t" + F.nBars);
  L.push("#steps_per_bar\t" + steps);
  L.push("#seconds\t" + r2(P.seconds));
  L.push("#tempo_varies\t" + (CLK && CLK.varies ? "yes" : "no"));
  L.push("#events\t" + P.events.length);
  if(wantSec != null) L.push("#asked_seconds\t" + wantSec);

  const MT = song.materials;
  if(MT && MT.chords) L.push("#chords_A\t" + MT.chords.map(chordName).join(" "));
  if(MT && MT.chorusChords && MT.chorusChords !== MT.chords)
    L.push("#chords_B\t" + MT.chorusChords.map(chordName).join(" "));
  if(MT && MT.bridgeChords) L.push("#chords_C\t" + MT.bridgeChords.map(chordName).join(" "));

  /* the form, one line per section: what stage 4 decided before a note sounded */
  L.push("#section_cols\ti\tfn\tstartBar\tendBar\tmaterial\tenergy\tocc\tflags");
  song.sections.forEach((s, i) => {
    const flags = [];
    if(s.peak) flags.push("peak");
    if(s.fillInto) flags.push("fill");
    if(s.emptyLastBar) flags.push("empty:" + (s.emptySize || "bar"));
    if(s.stripHalf) flags.push("strip");
    if(s.mv) flags.push("mv:" + s.mv);
    if(s.drumLevel) flags.push("arc:" + s.drumLevel);
    if(s.duel) flags.push("duel");
    if(s.chaseTurn) flags.push("chase:" + s.chaseTurn);
    L.push("#section\t" + [i, s.fn, s.startBar, s.endBar, s.material,
                           r2(s.energy == null ? 0.5 : s.energy),
                           s.occurrence == null ? "" : s.occurrence,
                           flags.join(",") || "."].join("\t"));
  });

  /* which parts are on the record at all, and how many notes each has --
     a part reading 0 is a part that was declared and never sounded, which is
     the single most common defect this project has found in itself */
  const byRole = {};
  for(const e of P.events){
    const k = e.role || "?";
    byRole[k] = (byRole[k] || 0) + 1;
  }
  for(const k of Object.keys(byRole).sort()) L.push("#role\t" + k + "\t" + byRole[k]);
  if(P.stackRefused) for(const m of P.stackRefused) L.push("#refused\t" + m);

  /* ── THE EVENTS ─────────────────────────────────────────────────────────
     Sorted by time, then by role and pitch, so two runs of the same seed
     produce byte-identical files and a diff shows music rather than ordering.
     `bar` and `step` are the program's own grid coordinates, carried beside
     the seconds because a note's position in a bar is the thing to compare and
     seconds move when the tempo does. */
  const evs = P.events.slice().sort((a, b) =>
    (a.tSec - b.tSec) ||
    String(a.role).localeCompare(String(b.role)) ||
    String(a.lane || "").localeCompare(String(b.lane || "")) ||
    ((a.pitch == null ? -1 : a.pitch) - (b.pitch == null ? -1 : b.pitch)) ||
    String(a.voice || "").localeCompare(String(b.voice || "")));

  L.push("tSec\tbar\tstep\trole\tlane\tvoice\tpitch\tnote\tdurSec\tgain\tflags");
  /* WHERE A NOTE SITS ON THE GRID. Micro-timing puts events a few milliseconds
     either side of their written step, so a note pushed early off bar 0 lands
     at bar -1 step 15.9996 and prints as "step 16.00" -- a position that does
     not exist. Normalised: a step that rounds up to a whole bar IS the next
     bar's downbeat. `grid` is the same position rounded to the written step,
     which is what "the same pattern" has to be measured against; the printed
     `step` keeps the real fractional position, because the lean and the swing
     are the music and rounding them away would hide them. */
  const posOf = t => {
    const b = barAt(t);
    let bar = Math.floor(b + 1e-9);
    let st = (b - bar) * steps;
    if(st >= steps - 5e-3){ bar += 1; st = 0; }
    if(st < 0){ st = 0; }
    return { bar, st, grid: Math.round(st) % steps };
  };

  for(const e of evs){
    const { bar, st } = posOf(e.tSec);
    const p = e.pitch;
    const flags = [];
    /* everything a later stage attached that changes how the note is played.
       Listed explicitly rather than dumped wholesale: a spread of every key on
       the object would make the format depend on internals nobody promised. */
    if(e.art) flags.push(e.art);
    if(e.tied) flags.push("tied");
    if(e.vib) flags.push("vib");
    if(e.tail) flags.push("tail:" + e.tail);
    if(e.stack) flags.push("stack");
    if(e.halt) flags.push("halt");
    if(e.from != null) flags.push("from:" + e.from);
    if(e.holdSec != null) flags.push("hold:" + r2(e.holdSec));
    if(e.timbre) flags.push("timbre:" + e.timbre);
    if(e.kind != null) flags.push("kind:" + e.kind);
    if(e.slice != null) flags.push("slice:" + e.slice);
    if(e.rev) flags.push("rev");
    L.push([r4(e.tSec), bar, r2(st), e.role || ".", e.lane || ".", e.voice || ".",
            p == null ? "." : p,
            p == null ? "." : NOTE[((p % 12) + 12) % 12] + (Math.floor(p / 12) - 1),
            r4(e.durSec == null ? 0 : e.durSec),
            r3(e.gain == null ? 0 : e.gain),
            flags.join(",") || "."].join("\t"));
  }

  /* ── THE ONE-LINE SUMMARY, computed here because this is where the song is.
     Nothing derived: counts, and the three ratios that decide whether a line
     is a line — how often it leaps, how often it steps, how often it simply
     plays the same note again. Those are the numbers MKII's own comments
     argued from, so they are the numbers a comparison has to be able to show. */
  const motionOf = role => {
    const ns = evs.filter(e => e.role === role && e.pitch != null)
                  .sort((a, b) => a.tSec - b.tSec);
    let leap = 0, step = 0, same = 0;
    for(let i = 1; i < ns.length; i++){
      const d = Math.abs(ns[i].pitch - ns[i - 1].pitch);
      if(d === 0) same++; else if(d <= 2) step++; else leap++;
    }
    const tot = leap + step + same;
    return { n: ns.length, leap, step, same, tot };
  };
  const pitched = [...new Set(evs.filter(e => e.pitch != null).map(e => e.role))].sort();
  const stats = {};
  for(const r of pitched) stats[r] = motionOf(r);

  /* ── HOW MANY DISTINCT BARS, PER ROLE: the measure that answers "is this a
     loop". A bar is its own set of (written step, pitch or lane).

     ⚠ ON THE WRITTEN STEP, NOT THE PLAYED ONE. The first version keyed this on
     the fractional position and every role came back 100% distinct — 70 of 70
     bars of drums, 69 of 69 of comp — which is nonsense for a program whose
     drums are explicitly thinned on the MATERIAL's bar so the figure repeats.
     What it was counting was the seeded jitter: micro-timing gives every hit a
     different offset in every bar, so two identical bars differ in the fourth
     decimal and the measure reported a record with no repetition at all.
     Quantising to the written step is the fix — the question is whether the
     same NOTES are played, and the timing is a separate question with its own
     column. */
  const distinct = {};
  for(const r of Object.keys(byRole)){
    const seen = new Set();
    const bars = new Map();
    for(const e of evs){
      if(e.role !== r) continue;
      const { bar, grid } = posOf(e.tSec);
      if(!bars.has(bar)) bars.set(bar, []);
      bars.get(bar).push(grid + ":" + (e.pitch == null ? (e.lane || "") : e.pitch));
    }
    for(const [, v] of bars) seen.add(v.sort().join("|"));
    distinct[r] = { bars: bars.size, distinct: seen.size };
  }
  for(const r of Object.keys(distinct).sort())
    L.push("#bars_distinct\t" + r + "\t" + distinct[r].distinct + "\t" + distinct[r].bars);
  for(const r of pitched){
    const s = stats[r];
    if(!s.tot) continue;
    L.push("#motion\t" + r + "\t" + s.n + "\t" +
           r3(s.leap / s.tot) + "\t" + r3(s.step / s.tot) + "\t" + r3(s.same / s.tot));
  }

  let mid = null;
  if(wantMid){
    try {
      const u8 = MK2.toMidi(song);
      let s = "";
      for(let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
      mid = btoa(s);
    } catch(e){ /* a song that will not export is still a song that dumped */ }
  }

  return {
    ok: true,
    tsv: L.join("\n") + "\n",
    mid,
    summary: {
      genre, seed,
      key: NOTE[((C.root % 12) + 12) % 12], mode: C.mode,
      tempo: +r2(C.tempo), bars: F.nBars, seconds: +r2(P.seconds),
      sections: song.sections.length,
      events: P.events.length,
      roles: byRole, distinct, motion: stats,
    },
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
   THE SWEEP
   ═══════════════════════════════════════════════════════════════════════════ */
async function main(){
  const o = parseArgs(process.argv.slice(2));
  const file = resolve(o.file || findProgram());
  if(!existsSync(file)) throw new Error("no such file: " + file);
  const out = resolve(o.out || join(ROOT, "dumps", slug(stem(file))));
  const seeds = parseSeeds(o.seeds);

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  /* a page error is a defect in the program, not in this tool, so it is
     reported and the sweep carries on -- a program that boots badly still
     composes, and a dump that refuses to run tells you less than one that
     runs and says what went wrong */
  const pageErrors = [];
  page.on("pageerror", e => pageErrors.push(String(e && e.message || e)));
  page.on("console", m => { if(m.type() === "error") pageErrors.push("console: " + m.text()); });

  if(!o.quiet) console.error("loading " + file);
  await page.goto(pathToFileURL(file).href, { waitUntil: "load", timeout: 120000 });
  /* boot() runs on script arrival and composes seed 1; waiting for that is
     waiting for the program to be ready rather than for a fixed number of ms */
  await page.waitForFunction(
    () => typeof composeSong === "function" && typeof MK2 !== "undefined" && MK2.currentSong(),
    null, { timeout: 120000 });

  const genres = o.genres || await page.evaluate(() => MK2.genres());
  if(!o.quiet) console.error("genres: " + genres.join(", ") +
                             "   seeds: " + seeds.length + "   rig: " + o.rig);

  mkdirSync(out, { recursive: true });
  const rows = [], failures = [];

  for(const genre of genres){
    const dir = join(out, slug(genre));
    mkdirSync(dir, { recursive: true });
    for(const seed of seeds){
      const res = await page.evaluate(EXTRACT, {
        seed, rig: o.rig, genre,
        wantSec: Number.isFinite(o.len) ? o.len : null,
        wantMid: o.mid,
      });
      const base = join(dir, "seed-" + pad(seed, 4));
      if(!res.ok){
        failures.push({ genre, seed, error: res.error });
        writeFileSync(base + ".error.txt", res.error + "\n");
        if(!o.quiet) console.error("  " + genre + " seed " + seed + "  FAILED: " + res.error);
        continue;
      }
      writeFileSync(base + ".tsv", res.tsv);
      if(res.mid) writeFileSync(base + ".mid", Buffer.from(res.mid, "base64"));
      rows.push(res.summary);
      if(!o.quiet){
        const s = res.summary;
        console.error("  " + genre.padEnd(14) + " seed " + String(seed).padStart(4) +
          "  " + s.key + " " + s.mode.padEnd(10) +
          String(s.tempo).padStart(6) + " bpm  " +
          String(s.bars).padStart(4) + " bars  " +
          /* "sec" here meant SECTIONS and read as seconds, next to a column of
             minutes. Both are printed and both are named. */
          String(s.sections).padStart(3) + " sect  " +
          (Math.floor(s.seconds / 60) + ":" +
           String(Math.floor(s.seconds % 60)).padStart(2, "0")).padStart(6) + "  " +
          String(s.events).padStart(6) + " ev");
      }
    }
  }

  /* ── THE SUMMARY TABLE ────────────────────────────────────────────────────
     One row per song, so a whole sweep can be read, sorted and diffed without
     opening a single dump. The columns are the questions this project keeps
     asking: how long, how many parts, how much of it repeats, and does the
     tune move by step or by leap. */
  const roleSet = [...new Set(rows.flatMap(r => Object.keys(r.roles)))].sort();
  const head = ["genre", "seed", "key", "mode", "tempo", "bars", "seconds",
                "sections", "events"]
    .concat(roleSet.map(r => "n_" + r))
    .concat(roleSet.map(r => "uniqbars_" + r))
    .concat(["lead_leap", "lead_step", "lead_same", "bass_leap", "bass_step", "bass_same"]);
  const lines = [head.join("\t")];
  for(const r of rows){
    const m = n => (r.motion[n] && r.motion[n].tot)
      ? [r.motion[n].leap, r.motion[n].step, r.motion[n].same]
          .map(x => (x / r.motion[n].tot).toFixed(3))
      : [".", ".", "."];
    lines.push([r.genre, r.seed, r.key, r.mode, r.tempo, r.bars, r.seconds,
                r.sections, r.events]
      .concat(roleSet.map(x => r.roles[x] || 0))
      .concat(roleSet.map(x => r.distinct[x] ? r.distinct[x].distinct + "/" + r.distinct[x].bars : "."))
      .concat(m("lead"), m("bass"))
      .join("\t"));
  }
  writeFileSync(join(out, "summary.tsv"), lines.join("\n") + "\n");

  if(pageErrors.length){
    writeFileSync(join(out, "page-errors.txt"), [...new Set(pageErrors)].join("\n") + "\n");
  }

  await browser.close();

  console.error("");
  console.error(rows.length + " songs written to " + out);
  if(failures.length) console.error(failures.length + " failed to compose (see *.error.txt)");
  if(pageErrors.length) console.error(new Set(pageErrors).size +
    " distinct page errors (see page-errors.txt) — these are the PROGRAM's, not the dumper's");
  console.error("summary: " + join(out, "summary.tsv"));
}

main().catch(e => { console.error(String(e && e.stack || e)); process.exit(1); });
