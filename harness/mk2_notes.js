#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   MK2_NOTES — THE RECORD, PRINTED.

       node harness/mk2_notes.js [--seeds 12] [--genre boxcarsynth] [--seed N]

   THIS IS THE ACCEPTANCE TEST FOR BOXCAR SYNTH V2, and it is built before the
   thing it judges. A probe reports whether a rule holds; this prints what the
   record actually IS, so a person can look at it and say whether it is music.

   It answers, per seed:

     THE JOURNEY   the legs, the stops, the terrain under each stretch, the
                   weather, and what passes
     THE PACE      the tempo bar by bar, as a trace — where the record
                   accelerates and where it brakes. A record at one tempo says
                   so in a line rather than drawing a flat graph.
     THE BAND      who is in which chair
     THE FORM      the sections, their lengths, and which leg they sit in
     THE ENSEMBLE  how many distinct instruments actually sound, section by
                   section — the number that says whether this is an orchestra
     THE TUNE      bar by bar, as a step grid with note names
     EVERYONE      every instrument that sounds, its note count and its range
     THE SFX       NAMED — the whistle, the brakes, the bell, the conductor,
                   the crowd, the birds, the weather, the engine. `mk2_roll.js`
                   filters `role === "tape"` and ignores the rest, so the whole
                   journey has always been invisible in a printout.
     EARLY / LATE  a bar from the first minute beside one from the last, so
                   "does it go anywhere" is something you look at rather than
                   something a number claims.

   DERIVE THE SET, NEVER DERIVE THE WORDS. The SFX list comes from the events;
   the English comes from a table. A sound with no entry prints its raw name
   rather than vanishing — a missing word is visible, which is the point. */

const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] != null ? argv[i + 1] : dflt;
};
const GENRE = argOf("--genre", "boxcarsynth");
const SEEDS = parseInt(argOf("--seeds", "12"), 10);
const ONE   = argv.indexOf("--seed") >= 0 ? parseInt(argOf("--seed", "1"), 10) : null;
const HTML  = argOf("--file", path.resolve(__dirname, "..", "Boxcar Synth.html"));

const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

/* ── names ───────────────────────────────────────────────────────────────── */
const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const nn = p => NOTE[((p % 12) + 12) % 12] + (Math.floor(p / 12) - 1);
const mmss = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");

/* the WORDS for a sound. The SET is derived from the events; this is only the
   English for it, and a bed with no entry here prints its own name so that the
   gap is visible instead of silent. */
const SOUND = {
  railWhistle: "the whistle, long",   railPeep:   "the whistle, short",
  railBell:    "the crossing bell",   railBrake:  "the brakes",
  railArrive:  "arriving",            railDepart: "pulling out",
  railCall:    "the conductor calls", railGuard:  "the guard",
  railDoors:   "the doors",           railCrowd:  "the platform crowd",
  railTown:    "the station",         railClank:  "couplings",
  railRun:     "the run",             railSteam:  "steam",
  railValve:   "the safety valve",    railPass0:  "a train passing",
  railPass1:   "a train passing",     railCbell:  "the bell, moving off",
  sceneDawn:   "dawn birds",          sceneRiver: "the river",
  sceneRiverside: "the riverside",    sceneBirds: "birds",
  sfx_wind:    "wind",                sfx_rain:   "rain",
  rain:        "rain",                blizzard:   "a blizzard",
  wind:        "wind",                clear:      "clear weather",
  sfx_thunder_impact: "thunder",
  /* the two that are not sounds in the world but layers over the whole record */
  tape:        "the tape (hiss)",     medium:     "the medium (the gramophone)",
};
const soundName = b => SOUND[b] || (b ? b + "  (no English name)" : "—");

/* ── a bar of a lane, as a step grid ─────────────────────────────────────── */
function gridOf(notes, bar, steps){
  const row = notes.filter(n => n.bar === bar).sort((a, z) => a.step - z.step);
  const g = Array(steps).fill(".");
  for(const n of row){
    if(n.step < 0 || n.step >= steps) continue;
    g[n.step] = "*";
    for(let k = 1; k < (n.dur || 1) && n.step + k < steps; k++) g[n.step + k] = "-";
  }
  return { grid: g.join(""), row };
}

function printSeed(seed){
  let song;
  try { song = M.composeSong(seed, "band", GENRE); }
  catch(e){ console.log("\nSEED " + seed + " — THREW: " + e.message); return; }

  const c = song.chart, picks = c.picks || {}, form = song.form;
  const STEPS = M.stepsOf(c.table);
  /* THE CLOCK, NOT A MULTIPLICATION. A record may change tempo, so "the second
     bar 40 starts on" is a question with an owner; asking it here rather than
     multiplying is also what makes the leg arc visible in this printout at
     all. On a record at one tempo it is the same arithmetic. */
  const CLK = M.makeClock(c, form);
  const barSec = b => CLK.barSec(b);
  const tOf = b => CLK.at(b, 0);
  const total = tOf(form[form.length - 1].endBar);
  const ev = song.perf.events;

  console.log("\n" + "═".repeat(78));
  console.log("SEED " + seed + "   " + GENRE + "   " + (c.mode || "?") +
              "   " + (form.tempo
                  ? Math.round(Math.min.apply(null, form.tempo)) + "-" +
                    Math.round(Math.max.apply(null, form.tempo)) + " bpm"
                  : c.tempo + " bpm") + "   " + mmss(total) +
              "   " + form.length + " sections" +
              (c.clock ? "   departs " + (Math.floor(c.clock.hour0) % 24) + ":00" +
                         (c.clock.night ? ", into the night" : ", toward the light") : ""));
  console.log("═".repeat(78));

  /* ══ THE JOURNEY ═══════════════════════════════════════════════════════
     Reconstructed from the events rather than read off a table, because the
     events are what actually happens. */
  const scenes  = ev.filter(e => e.role === "scene").sort((a, z) => a.tSec - z.tSec);
  const stations= ev.filter(e => e.role === "station").sort((a, z) => a.tSec - z.tSec);
  const engine  = ev.filter(e => e.role === "engine").sort((a, z) => a.tSec - z.tSec);
  const passes  = ev.filter(e => e.role === "pass").sort((a, z) => a.tSec - z.tSec);
  const weather = ev.filter(e => e.role === "weather").sort((a, z) => a.tSec - z.tSec);
  const drones  = ev.filter(e => e.role === "drone").sort((a, z) => a.tSec - z.tSec);

  console.log("\nTHE JOURNEY");
  /* THE LEGS AND THE STOPS BETWEEN THEM. A journey's form declares them on the
     section; a song-shaped record has none and says so rather than printing an
     empty table. Each leg is read for the things the ride decides — who is
     carrying it, what is under the train, and what time of day it is. */
  const legs = [...new Set(form.map(s => s.leg).filter(x => x != null))].sort((a, z) => a - z);
  if(!legs.length){
    console.log("  legs: none declared — this build has no leg structure");
  } else {
    console.log("  legs: " + legs.length + ", " +
      (form.filter(s => s.atStop != null).length ? new Set(form.filter(s => s.atStop != null)
        .map(s => s.atStop)).size + " stops between them" : "no stops"));
    for(const L of legs){
      const ss = form.filter(s => s.leg === L);
      const a = ss[0], z = ss[ss.length - 1];
      console.log("   leg " + L + "  " + mmss(tOf(a.startBar)).padStart(6) + "–" +
        mmss(tOf(z.endBar)).padEnd(6) +
        "  led by " + String(a.hand && a.hand.lead || "—").padEnd(12) +
        String(a.terrain || "—").padEnd(8) + String(a.character || "") +
        "   " + ss.length + " sections");
      /* THE HANDOVER, printed as the ceremony it is: X alone, the two of them,
         then Y alone. Read off the sections rather than off the leads list, so
         what prints is what the record does. */
      const stop = form.filter(s => s.atStop === L);
      if(stop.length){
        const moves = stop.map(s => {
          const h = s.hand || {};
          const pair = [h.lead, h.counter].filter(Boolean);
          return s.soloOf ? "solo " + s.soloOf
               : pair.length > 1 ? "the dance: " + pair.join(" + ")
               : "pulling out" + (pair.length ? " behind " + pair[0] : "");
        });
        console.log("      the stop  " + mmss(tOf(stop[0].startBar)).padStart(6) + "–" +
          mmss(tOf(stop[stop.length - 1].endBar)).padEnd(6) + "  " + moves.join("  →  "));
      }
    }
  }

  /* a timeline strip, one row a minute */
  const mins = Math.ceil(total / 60);
  console.log("  minute  terrain / what is happening");
  for(let m = 0; m < mins; m++){
    const t0 = m * 60, t1 = t0 + 60;
    const here = [];
    const sc = scenes.filter(e => e.tSec < t1 && e.tSec + e.durSec > t0);
    for(const s of sc) if(!here.includes(soundName(s.bed))) here.push(soundName(s.bed));
    const st = stations.filter(e => e.tSec >= t0 && e.tSec < t1);
    const wx = weather.filter(e => e.tSec < t1 && e.tSec + e.durSec > t0);
    const ps = passes.filter(e => e.tSec >= t0 && e.tSec < t1);
    const en = engine.filter(e => e.tSec >= t0 && e.tSec < t1);
    const bits = [];
    if(here.length) bits.push(here.join(" + "));
    if(wx.length)   bits.push("[" + [...new Set(wx.map(w => w.kind || soundName(w.bed)))].join(",") + "]");
    /* ARRIVING or LEAVING, read off the beds rather than labelled "STOP" for
       both — the station role covers a train coming in and a train pulling out,
       and calling a departure a stop is the printer lying about the journey. */
    if(st.length){
      /* the CROSSING bell is a road crossing out on the line, not a platform.
         It rides the station role, so it is split out here rather than filed
         under a stop the train never made. */
      const beds  = st.map(x => x.bed).filter(b => b !== "railBell");
      const cross = st.length - beds.length;
      if(beds.length){
        const inbound  = beds.some(b => /Arrive|Brake|Town|Crowd/.test(b));
        const outbound = beds.some(b => /Call|Guard|Depart|Cbell/.test(b));
        const label = inbound && outbound ? "AT THE PLATFORM"
                    : inbound ? "ARRIVING" : outbound ? "PULLING OUT" : "THE STATION";
        bits.push(label + ": " + beds.map(soundName).join(", "));
      }
      if(cross) bits.push(cross + "× a level crossing");
    }
    if(en.length)   bits.push(en.map(x => soundName(x.bed)).join(", "));
    if(ps.length)   bits.push(ps.length + "× passing");
    console.log("   " + String(m).padStart(4) + "    " + (bits.join("   ") || "—"));
  }

  /* ══ AND HOW FAST, ALL THE WAY ALONG ═══════════════════════════════════
     The ride sets the pace, so the pace is something you have to be able to
     look at. One column a bar, coarse on purpose: a trace with a number for
     every bar of a twenty-minute record is a wall, and what a reader needs to
     see is the SHAPE — where it accelerates and where it brakes. A record at
     one tempo says so in one line rather than drawing a flat graph. */
  if(form.tempo){
    const map = form.tempo;
    const lo = Math.min.apply(null, map), hi = Math.max.apply(null, map);
    const RAMP = " ▁▂▃▄▅▆▇█";
    const COLS = 72, per = map.length / COLS;
    let bar = "";
    for(let i = 0; i < COLS; i++){
      const b = Math.min(map.length - 1, Math.floor(i * per));
      bar += RAMP[Math.max(0, Math.min(8, Math.round(8 * (map[b] - lo) / Math.max(1e-9, hi - lo))))];
    }
    console.log("\n  THE PACE  " + lo.toFixed(1) + " to " + hi.toFixed(1) + " bpm");
    console.log("   " + bar);
    console.log("   " + mmss(0).padEnd(36) + mmss(total).padStart(36));
  } else {
    console.log("\n  THE PACE  " + c.tempo + " bpm from the first bar to the last — no arc declared");
  }

  /* ══ THE BAND ══════════════════════════════════════════════════════════ */
  console.log("\nTHE BAND");
  const chairs = ["lead","counter","keys","keys2","bass","ostinato","drums","drone"];
  console.log("  " + chairs.map(k => k + "=" + (picks[k] || "—")).join("  "));

  /* ══ THE FORM, AND HOW MANY PLAY IN IT ═════════════════════════════════ */
  console.log("\nTHE FORM  —  and how many instruments actually sound in each");
  let sum = 0;
  for(const s of form){
    const t0 = tOf(s.startBar), t1 = tOf(s.endBar);
    const vs = [...new Set(ev.filter(e => e.pitch != null && e.tSec >= t0 && e.tSec < t1)
                             .map(e => e.voice))];
    sum += vs.size || vs.length;
    console.log("   " + mmss(t0).padStart(6) + "  " + s.fn.padEnd(13) +
      String(s.endBar - s.startBar).padStart(3) + " bars" +
      (s.extended ? " (+" + s.extended + ")" : "     ") +
      (s.atStop != null ? "  STOP " + s.atStop
                        : s.leg != null ? "  leg " + s.leg : "       ") +
      /* AND HOW FAST IT IS HERE — the number the whole leg structure turns on.
         A record at one tempo prints nothing extra. */
      (form.tempo ? "  " + String(Math.round(form.tempo[s.startBar])).padStart(3) + "→" +
                    String(Math.round(form.tempo[Math.max(s.startBar, s.endBar - 1)])).padStart(3) + "bpm"
                  : "") +
      "   " + String(vs.length).padStart(2) + " playing:  " + vs.join(" "));
  }
  console.log("   MEAN " + (sum / form.length).toFixed(1) + " instruments a section");

  /* ══ THE TUNE ══════════════════════════════════════════════════════════ */
  const A = (song.materials.A || {}).lead || [];
  const MB = c.table.materialBars || 4;
  if(A.length){
    const uniq = new Set(A.map(n => n.pitch)).size;
    console.log("\nTHE TUNE  —  material A, " + MB + " bars, " + A.length +
                " notes, " + uniq + " distinct pitches");
    for(let b = 0; b < MB; b++){
      const { grid, row } = gridOf(A, b, STEPS);
      console.log("   " + String(b + 1).padStart(2) + " |" + grid + "|  " +
                  row.map(n => nn(n.pitch)).join(" "));
    }
  }

  /* ══ EVERY INSTRUMENT THAT SOUNDS ══════════════════════════════════════ */
  console.log("\nEVERY INSTRUMENT THAT SOUNDS");
  const byVoice = {};
  for(const e of ev){
    if(e.pitch == null) continue;
    (byVoice[e.voice] = byVoice[e.voice] || []).push(e);
  }
  const names = Object.keys(byVoice).sort((a, z) => byVoice[z].length - byVoice[a].length);
  for(const v of names){
    const l = byVoice[v];
    const lo = Math.min(...l.map(e => e.pitch)), hi = Math.max(...l.map(e => e.pitch));
    console.log("   " + v.padEnd(16) + String(l.length).padStart(5) + " notes   " +
                nn(lo) + ".." + nn(hi) + "   " +
                [...new Set(l.map(e => e.role))].join(","));
  }
  const drum = ev.filter(e => e.role === "drums");
  if(drum.length){
    const lanes = {};
    for(const e of drum) lanes[e.lane] = (lanes[e.lane] || 0) + 1;
    console.log("   drums            " + String(drum.length).padStart(5) + " hits    " +
      Object.keys(lanes).sort((a, z) => lanes[z] - lanes[a])
            .map(k => k + ":" + lanes[k]).join("  "));
  }

  /* ══ THE SFX, NAMED ════════════════════════════════════════════════════ */
  console.log("\nTHE SFX  —  named, with when they happen");
  const sfx = ev.filter(e => e.pitch == null && e.role !== "drums")
                .sort((a, z) => a.tSec - z.tSec);
  if(!sfx.length) console.log("   none");
  const seen = {};
  for(const e of sfx){
    const key = (e.bed || e.kind || e.voice || e.role);
    (seen[key] = seen[key] || []).push(e);
  }
  for(const k of Object.keys(seen).sort((a, z) => seen[a][0].tSec - seen[z][0].tSec)){
    const l = seen[k];
    console.log("   " + soundName(k).padEnd(24) + l[0].role.padEnd(9) +
                String(l.length).padStart(3) + "×   " +
                l.slice(0, 8).map(e => mmss(e.tSec)).join(" ") + (l.length > 8 ? " …" : ""));
  }
  for(const d of drones)
    console.log("   " + ("the train (" + (d.voice || "drone") + ")").padEnd(24) +
                "drone    " + "  1×   " + mmss(d.tSec) + " for " + mmss(d.durSec));

  /* ══ EARLY AND LATE ════════════════════════════════════════════════════
     The same lane, a bar from the first minute and a bar from the last. If the
     record goes anywhere, this is where you see it. */
  console.log("\nEARLY AND LATE  —  the lead lane, one bar from each end");
  const lead = ev.filter(e => e.role === "lead" && e.pitch != null).sort((a, z) => a.tSec - z.tSec);
  if(lead.length > 4){
    const barAt = t => Math.floor(CLK.barAt(t));
    const show = (label, list) => {
      const b0 = barAt(list[0].tSec);
      const g = Array(STEPS).fill(".");
      for(const e of list){
        const st = Math.round((e.tSec - tOf(b0)) / CLK.stepSec(b0));
        if(st >= 0 && st < STEPS) g[st] = "*";
      }
      console.log("   " + label.padEnd(7) + "bar " + String(b0 + 1).padStart(4) +
                  "  |" + g.join("") + "|  " + list.map(e => nn(e.pitch)).join(" "));
    };
    const firstBar = barAt(lead[0].tSec);
    const lastBar  = barAt(lead[lead.length - 1].tSec);
    show("early", lead.filter(e => barAt(e.tSec) === firstBar));
    show("late",  lead.filter(e => barAt(e.tSec) === lastBar));
  }
}

console.log("╔" + "═".repeat(76) + "╗");
console.log("║  THE RECORD, PRINTED — " + GENRE.padEnd(51) + "║");
console.log("╚" + "═".repeat(76) + "╝");
if(ONE != null) printSeed(ONE);
else for(let s = 1; s <= SEEDS; s++) printSeed(s);
console.log("");
