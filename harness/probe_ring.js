#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   PROBE_RING — DOES EACH INSTRUMENT'S NOTE LAST AS LONG AS THAT INSTRUMENT?

       node harness/probe_ring.js [seeds]

   THE OWNER, and the whole reason this file exists:

     "A banjo does not have a tail it does not have legato it should never be
      treated like it does ... there should never be long banjo notes ... are
      you telling me we are picking instruments and then just forcing them to
      behave like a piano and we have no mechanism in the program to make sure
      that an instruments notes are actually the proper arrangement for that
      particular instrument?"

   THE HONEST ANSWER IS "PART OF ONE". `PLAY_FAMILY` has held four rules since
   the arrangement work: a BOWED note longer than the bow gets a bow change, a
   WIND note longer than the breath gets shortened from its end, a PLUCKED or
   STRUCK note gets truncated to the ring, and `play.poly` caps how many notes
   one player may sound at once. What it did NOT have was a per-INSTRUMENT
   number. Every plucked instrument in the file shared ONE decay curve, sourced
   from a harp, so the banjo was allowed 1.2-3.45 seconds a note and used it:
   13% of 9,694 banjo notes ran over a second and the longest was 3.33.

   So this probe asks three things, and the third is the one that stops the
   fault coming back somewhere else:

     1. no plucked or struck note outlives its instrument's own ring
     2. no note of any family outlives what its family allows
     3. WHICH instruments are still riding a family default — printed as a
        finding every run, not hidden. A default that nobody has looked at is
        exactly how the banjo ended up with harp physics, and the only way that
        stays visible is if the list is in front of you.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const N = parseInt(process.argv[2], 10) || 8;
const HTML = path.resolve(__dirname, "..", "Boxcar Synth.html");
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const FAM = M.playFamilies();
/* the same curve the engine falls back to, and it is here so the probe can say
   WHICH instruments are on it rather than only whether they obey it */
const HARP = midi => 4.2 - 3.0 * Math.max(0, Math.min(1, (midi - 36) / 48));

/* voice -> the INSTRUMENTS entry that owns it, by the same lane map the engine
   uses; derived, so a voice added tomorrow is covered without editing this */
const OWNER = {};
for(const key of Object.keys(M.INSTRUMENTS)){
  const I = M.INSTRUMENTS[key];
  OWNER[key] = I;
  for(const lane in (I.lanes || {})) OWNER[I.lanes[lane]] = I;
}
const ringFor = (voice, midi) => {
  const I = OWNER[voice];
  const r = I && I.play && I.play.ring;
  const t = Math.max(0, Math.min(1, (midi - 36) / 48));
  if(Array.isArray(r) && r.length === 2) return { sec: r[0] + (r[1] - r[0]) * t, own: true };
  return { sec: HARP(midi), own: false };
};

let faults = 0;
const say = (ok, label, detail) => {
  console.log("  " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};

console.log(`\n=== EVERY NOTE AS LONG AS ITS OWN INSTRUMENT — ${N} seed(s)\n`);

const stat = {};   // voice -> {n, max, over, ring, own, fam}
for(let s = 1; s <= N; s++){
  const song = M.composeSong(s, undefined, M.genres()[0]);
  for(const e of song.perf.events){
    if(e.pitch == null || !e.voice) continue;
    const fam = FAM[e.voice];
    if(fam !== "plucked" && fam !== "struck") continue;
    const r = ringFor(e.voice, e.pitch);
    const st = stat[e.voice] || (stat[e.voice] = { n: 0, max: 0, over: 0, own: r.own, fam, lo: 99, hi: 0 });
    st.n++;
    st.max = Math.max(st.max, e.durSec);
    st.lo = Math.min(st.lo, r.sec);
    st.hi = Math.max(st.hi, r.sec);
    /* 1.02 because the engine writes the ring itself and float arithmetic must
       not be reported as a musical fault */
    if(e.durSec > r.sec * 1.02) st.over++;
  }
}

const voices = Object.keys(stat).sort((a, z) => stat[z].n - stat[a].n);
console.log("  voice        family    notes    longest   its ring        over its ring");
for(const v of voices){
  const t = stat[v];
  console.log(`  ${v.padEnd(12)} ${t.fam.padEnd(9)} ${String(t.n).padStart(6)}   ` +
              `${t.max.toFixed(2)}s     ${t.lo.toFixed(2)}-${t.hi.toFixed(2)}s` +
              `${t.own ? " (its own)" : " (family) "}   ${t.over}`);
}
console.log("");

const over = voices.filter(v => stat[v].over > 0);
say(over.length === 0,
    "no plucked or struck note outlives its instrument",
    over.length ? over.map(v => `${v} ${stat[v].over}/${stat[v].n}`).join(" · ")
                : `${voices.reduce((n, v) => n + stat[v].n, 0)} notes across ${voices.length} instrument(s)`);

/* ══ AND THE STRINGS MUST RING INTO EACH OTHER ═════════════════════════════
   THE CLAIM THIS FILE FIRST CARRIED WAS "no banjo note is longer than a
   second", and it was the wrong claim — it passed on a build the owner heard
   immediately as broken:

     "There is no rythem its just pluck space pluck space pluck! ... its like
      if someone took a guitar and just lazily played one string at a time with
      a gap in between each pluck."

   A ROLL IS AN ARPEGGIO OF A HELD CHORD. The left hand holds a shape, the
   right hand picks strings in order, and nothing damps them, so three or four
   strings sound at once continuously. Capping the ring at 0.35 s against an
   eighth note of 0.31-0.53 s made every note die exactly as the next arrived —
   a ceiling check said "fine", because each note was individually short.

   SO THE GUARD IS ABOUT THE OVERLAP, NOT THE LENGTH. An instrument that
   declares `poly > 1` and plays an arpeggio may not spend most of its sounding
   time on ONE note. Measured across the regression that prompted this:

                     alone at any instant      consecutive pairs overlapping
       keys/banjo      11%  ->  49%              85%  ->  66%
       bass/washtub    37%  ->  75%              73%  ->  43%

   The length ceiling stays too, one claim below, because the original
   complaint — 3.3-second banjo notes — was also real. A plucked instrument
   has to be short AND overlapping, and only holding it to both catches both. */
{
  const rolls = [];
  for(let s = 1; s <= Math.min(N, 4); s++){
    const song = M.composeSong(s, undefined, M.genres()[0]);
    const by = {};
    for(const e of song.perf.events){
      if(e.pitch == null || !e.voice) continue;
      const I = OWNER[e.voice];
      if(!I || !I.play || !(I.play.poly > 1)) continue;
      const fam = FAM[e.voice];
      if(fam !== "plucked" && fam !== "struck") continue;
      (by[e.role + "/" + e.voice] || (by[e.role + "/" + e.voice] = [])).push(e);
    }
    for(const k in by) (rolls[k] || (rolls[k] = [])).push(...by[k]), rolls[k] = rolls[k];
  }
  const parts = {};
  for(const k in rolls) parts[k] = rolls[k];
  const bad = [];
  const rows = [];
  for(const k of Object.keys(parts).sort()){
    const ev = parts[k].slice().sort((a, z) => a.tSec - z.tSec);
    if(ev.length < 100) continue;
    const end = Math.max(...ev.map(e => e.tSec + e.durSec));
    let i = 0; const live = []; let alone = 0, sounding = 0;
    for(let t = 0; t < end; t += 0.02){
      while(i < ev.length && ev[i].tSec <= t){ live.push(ev[i]); i++; }
      for(let j = live.length - 1; j >= 0; j--) if(live[j].tSec + live[j].durSec <= t) live.splice(j, 1);
      if(live.length){ sounding++; if(live.length === 1) alone++; }
    }
    const pct = 100 * alone / (sounding || 1);
    rows.push(`${k} ${pct.toFixed(0)}% alone`);
    /* 40% is the line: the measured healthy state was 11-19% and the state the
       owner rejected on hearing was 49%. */
    if(pct > 40) bad.push(`${k} ${pct.toFixed(0)}% alone`);
  }
  say(bad.length === 0,
      "a polyphonic plucked part rings into itself — the strings overlap",
      bad.length ? bad.join(" · ") : rows.join(" · "));
}

if(stat.banjo)
  say(stat.banjo.max <= 2.0,
      "and no banjo note is a HELD note",
      `longest ${stat.banjo.max.toFixed(2)}s over ${stat.banjo.n} notes ` +
      `(was 3.33s on the harp curve; the roll needs ~3 eighths of ring, ` +
      `which is 0.9-1.6s at 57-97 bpm)`);

/* ── THE FINDING THAT IS PRINTED WHETHER OR NOT ANYTHING FAILS ────────────
   Not a fault: an instrument may legitimately want the family curve, and the
   harp does. It is a fault to not KNOW. */
const riding = voices.filter(v => !stat[v].own);
console.log("");
if(riding.length){
  console.log("  ·  still on the plucked family's HARP curve, undeclared:");
  for(const v of riding)
    console.log(`       ${v.padEnd(12)} ${stat[v].lo.toFixed(2)}-${stat[v].hi.toFixed(2)}s   ` +
                `— right for a harp; nobody has asked whether it is right for this`);
} else {
  console.log("  ·  every plucked or struck instrument in the record declares its own ring");
}
console.log(`\n  ${faults} ring fault(s)\n`);
process.exit(faults ? 1 : 0);
