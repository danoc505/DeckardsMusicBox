#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE PALETTE — where does a genre collapse to a single value?

       node harness/probe_palette.js [songs]

   Asked, in as many words: "Music is NOT a single scale, no genre ever is a
   single scale. Every single fuck up like that i want identified RIGHT NOW."

   This is principle 1 -- CONSTRAINTS, NOT BAKED-IN VALUES -- turned into a
   measurement instead of a slogan. It is the fault this repo keeps committing
   in new costumes: a paper's "slow harmonic pace" became ONE CHORD; "virtuosity
   is not density" became ONE NOTE; one C-major transcription nearly became ONE
   SCALE; a substitution ladder had rungs that never sounded; a machine pool
   had rows that never won. Every one of those is the same shape -- a dimension
   that looks like a choice and has exactly one outcome.

   TWO SWEEPS, because there are two ways to be pinned.

   1. REALISED. Compose N songs and count DISTINCT outcomes per dimension. One
      distinct value over N songs is a constant wearing a table.

   2. DECLARED-BUT-DEAD. Walk the genre's own table for weighted alternative
      lists -- [[name, weight], ...] with two or more entries -- and check how
      many of those entries a run of N songs ever realises. A list of five that
      only ever answers two is three dead rows, and the table reads like a
      palette while the music is not one.

   A dimension a genre genuinely has only one of is NOT a fault -- a genre with
   one rig has one rig. So the report separates SINGLE (one outcome, and the
   table offered one) from PINNED (one outcome, and the table offered more).
   PINNED is the bug. SINGLE is a design statement, printed so it can be
   argued with rather than hidden.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Boxcar Synth.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const N = parseInt(process.argv[2], 10) || 40;

/* ── WHAT A SONG IS, AS FACTS ────────────────────────────────────────────────
   Each entry returns the value this song landed on for that dimension, and
   `offers` says how many the genre's table declared. `offers` null means the
   dimension is not a declared list and only the realised count is meaningful. */
const DIMS = {
  mode:        { of: s => s.chart.mode,  offers: t => (t.modes || []).length },
  key:         { of: s => s.chart.root,  offers: () => 12 },
  tempo:       { of: s => Math.round(s.chart.tempo),
                 offers: t => Array.isArray(t.tempo) ? (t.tempo[1] - t.tempo[0] + 1) : 1 },
  rig:         { of: s => s.chart.rig,   offers: t => Array.isArray(t.rig) ? t.rig.length : 1 },
  /* the field is `styles`, plural, and reading `style` gave every genre "?"
     and then filed the answer under "nothing declared more". Acid declares two
     groove styles and plays one; that is a dead row and the first version of
     this probe excused it. */
  "groove":    { of: s => (s.perf.groove && s.perf.groove.style) || "?",
                 offers: t => ((t.groove && t.groove.styles) || []).length },
  "form shape":{ of: s => s.sections.map(x => x.fn).join(">"), offers: () => null },
  "bars":      { of: s => s.sections.length ? s.sections[s.sections.length - 1].endBar : 0, offers: () => null },
  "chord degrees": { of: s => {
      const d = new Set();
      for(const k in s.materials.chordsOf)
        for(const c of s.materials.chordsOf[k]) d.add(c.degree);
      return [...d].sort((a, b) => a - b).join(",");
    }, offers: t => (t.progressions ? Object.keys(t.progressions).length : 0) },
  "keys pick": { of: s => s.chart.picks.keys,  offers: t => (t.machines && t.machines.keys || []).length },
  "lead pick": { of: s => s.chart.picks.lead,  offers: t => (t.machines && t.machines.lead || []).length },
  "bass pick": { of: s => s.chart.picks.bass,  offers: t => (t.machines && t.machines.bass || []).length },
  "drum pick": { of: s => s.chart.picks.drums, offers: t => (t.machines && t.machines.drums || []).length },
  "drum kit":  { of: s => (s.chart.picks.kit && s.chart.picks.kit.drums) || "-", offers: () => null },
};

/* which instruments actually SOUND, per lane -- the palette the ear gets */
function voicesOn(song, role){
  const v = new Set();
  for(const e of song.perf.events) if(e.role === role && e.voice) v.add(e.voice);
  return [...v].sort().join("+");
}

const genres = M.genres();
const rows = [];
for(const g of genres){
  const seen = {}, songs = [];
  for(const k in DIMS) seen[k] = new Set();
  const laneV = { keys: new Set(), lead: new Set(), keys2: new Set(), ostinato: new Set(), bass: new Set() };
  let table = null;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, null, g);
    table = song.chart.table;
    songs.push(song);
    for(const k in DIMS){ try { seen[k].add(DIMS[k].of(song)); } catch(e){ seen[k].add("ERR"); } }
    for(const role in laneV)
      for(const e of song.perf.events) if(e.role === role && e.voice) laneV[role].add(e.voice);
  }
  for(const k in DIMS){
    let offers = null;
    try { offers = DIMS[k].offers(table); } catch(e){ offers = null; }
    rows.push({ g, dim: k, got: seen[k].size, offers,
                only: seen[k].size === 1 ? [...seen[k]][0] : null });
  }
  for(const role in laneV)
    rows.push({ g, dim: "voices on " + role, got: laneV[role].size, offers: null,
                only: laneV[role].size === 1 ? [...laneV[role]][0] : null,
                skipEmpty: laneV[role].size === 0 });
}

const pinned = rows.filter(r => r.got === 1 && r.offers != null && r.offers > 1);
const single = rows.filter(r => r.got === 1 && (r.offers == null || r.offers <= 1) && !r.skipEmpty);

console.log(`\n  ${genres.length} genres x ${N} songs\n`);
console.log("  ══ PINNED — the table offers a choice and the music never takes it ══\n");
if(!pinned.length) console.log("    none\n");
for(const r of pinned)
  console.log(`    ${r.g.padEnd(13)} ${r.dim.padEnd(16)} 1 of ${String(r.offers).padStart(3)} declared   always: ${r.only}`);

console.log("\n  ══ SINGLE — one outcome, and nothing declared more. A statement, not a bug ══\n");
const byG = {};
for(const r of single) (byG[r.g] = byG[r.g] || []).push(`${r.dim}=${r.only}`);
for(const g of Object.keys(byG)) console.log(`    ${g.padEnd(13)} ${byG[g].join("  ·  ")}`);

/* ── AND THE SPREAD, for every dimension that is NOT pinned, so a dimension
   with two outcomes out of nine cannot hide behind "more than one". ── */
console.log("\n  ══ THIN — more than one outcome, but under a third of what was declared ══\n");
const thin = rows.filter(r => r.got > 1 && r.offers != null && r.offers >= 3 && r.got / r.offers < 0.34);
if(!thin.length) console.log("    none");
for(const r of thin)
  console.log(`    ${r.g.padEnd(13)} ${r.dim.padEnd(16)} ${String(r.got).padStart(2)} of ${String(r.offers).padStart(3)} declared`);

/* ═══ AND THE TWO SWEEPS THAT NEED NO SONGS AT ALL ═══════════════════════════
   The three above ask what the MUSIC did. These two ask what the TABLE says,
   and they catch the fault one step earlier -- before a note is composed. They
   are generic: they walk every genre's table and know nothing about what any
   field means, so a dimension nobody thought to list above is still swept. */
const isWeighted = v => Array.isArray(v) && v.length > 0 &&
  v.every(x => Array.isArray(x) && x.length === 2 && typeof x[1] === "number");
/* NOT every [thing, number] pair is a palette. An LFO's `bars: [[52, 1]]` is a
   period and a phase; a tom shape is [step, lane]; a range is [lo, hi]. These
   are pairs that mean something other than "option, weight", and counting them
   as one-colour palettes buried the real findings under 40 rows of noise the
   first time this was run. Excluded by the field they sit in, because that is
   what actually distinguishes them -- their SHAPE is identical. */
const NOT_A_PALETTE = new Set(["bars", "shapes", "range", "count", "octaves",
                               "intervals", "cell", "cells", "pool", "onsetPool"]);
const lastKey = p => { const s = p.replace(/\[\]$/, "").split("."); return s[s.length - 1]; };
const skip = p => NOT_A_PALETTE.has(lastKey(p));

const oneColour = [];      // a weighted list with exactly ONE option in it
const shape = {};          // path -> { drawn: Set(genre), pinned: Set(genre) }

function walk(node, p, g){
  if(!node || typeof node !== "object") return;
  if(isWeighted(node) && !skip(p)){
    (shape[p] = shape[p] || { drawn: new Set(), pinned: new Set() }).drawn.add(g);
    if(node.length === 1) oneColour.push({ g, p, only: JSON.stringify(node[0][0]) });
    for(const [v] of node) walk(v, p + "[]", g);
    return;
  }
  if(Array.isArray(node)){ for(const x of node) walk(x, p + "[]", g); return; }
  for(const k in node) walk(node[k], p ? p + "." + k : k, g);
}
const tables = {};
for(const g of genres){ tables[g] = M.composeSong(1, null, g).chart.table; walk(tables[g], "", g); }
/* second pass: for every path SOME genre draws, which genres hold a bare value
   there instead? Reading a scalar where a sibling genre reads a list is the
   clearest possible statement that the dimension is a choice and this genre
   declined to have one. */
const at = (o, p) => p.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
for(const p in shape)
  for(const g of genres){
    if(shape[p].drawn.has(g) || p.includes("[]")) continue;
    const v = at(tables[g], p);
    if(v === undefined || v === null) continue;
    if(!isWeighted(v)) shape[p].pinned.add(g);
  }

console.log("\n  ══ ONE COLOUR — a weighted list of alternatives with ONE entry in it ══");
console.log("     a palette shaped like a choice, holding a constant\n");
if(!oneColour.length) console.log("    none");
const byPath = {};
for(const r of oneColour) (byPath[r.p + " = " + r.only] = byPath[r.p + " = " + r.only] || []).push(r.g);
for(const k of Object.keys(byPath).sort())
  console.log(`    ${k.padEnd(46)} ${byPath[k].length === genres.length ? "EVERY GENRE" : byPath[k].join(" ")}`);

console.log("\n  ══ PINNED WHERE OTHERS DRAW — a scalar in one genre, a list in another ══\n");
let any = false;
for(const p of Object.keys(shape).sort()){
  const s = shape[p];
  if(!s.pinned.size || !s.drawn.size) continue;
  any = true;
  console.log(`    ${p}`);
  console.log(`        draws: ${[...s.drawn].join(" ")}`);
  console.log(`        pinned: ${[...s.pinned].map(g => g + "=" + JSON.stringify(at(tables[g], p))).join("  ")}`);
}
if(!any) console.log("    none");
console.log("");
