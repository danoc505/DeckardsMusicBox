#!/usr/bin/env node
/* PROBE_JOURNEY — IS THE RIDE ACTUALLY CONDUCTING?

     node harness/probe_journey.js [seeds] [file.html]

   [owner] "The train ride is the conductor, it is what sets the pace, it is
   what tells the orchestra where it is, the orchestra waxes and wanes with the
   ride, the 20 min song is broken into 4 pieces dissected by the train stops."

   `makeJourney` is a SECOND form builder — not a mode of the grammar walk, not
   a phase list fed into it. A genre declaring `form.ride` skips the walk
   entirely. NOBODY DECLARES ONE YET, so this probe declares one itself, on a
   genre that has none, composes at five lengths, measures, and puts the table
   back. The same discipline `probe_tempo` works under and for the same reason:
   the last untested capability this repo shipped was a whole instrument that
   made no sound with a green battery behind it.

   SEVEN CLAIMS:

     INERT      a genre with no journey declared has no legs, no stops, and no
                section carrying one — the walk is untouched
     COUNT      the leg count follows the LENGTH, not a draw: five minutes is
                one leg, ten is two, twenty is four, forty is eight. That is
                the owner's arithmetic and it is the whole shape of the record.
     LENGTH     and the record still lands on the length it was asked for. This
                is the one that has already caught a real fault: the first
                build budgeted the legs and not the stops, and a twenty-minute
                record came out at 27:40.
     STOPS      there are exactly (legs - 1) of them — a stop divides two legs,
                so there is never one after the last
     CEREMONY   every stop runs solo X → the two of them → solo Y, in that
                order, with X the lead of the leg behind and Y the lead of the
                leg ahead
     HANDOVER   consecutive legs are led by DIFFERENT instruments, and the one
                the form named actually sounds in its own solo. Both halves
                matter: the second caught the handover naming a chair that the
                genre's roles did not put in the room, so the record announced
                a solo and the soloist was not playing.
     PACE       the tempo ramps ACROSS a leg — fastest in the middle, slower at
                both platforms — and is at its lowest while standing at a stop */
const fs = require("fs");
const path = require("path");
const HTML = process.argv[3] || path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const SEEDS = parseInt(process.argv[2], 10) || 8;
const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

let faults = 0;
const say = (ok, label, detail) => {
  console.log("     " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
  if(!ok) faults++;
};
const mm = t => Math.floor(t / 60) + ":" + String(Math.round(t % 60)).padStart(2, "0");

console.log("\n=== THE JOURNEY — " + SEEDS + " seeds\n");

/* ── 1. INERT ────────────────────────────────────────────────────────────────
   Asked of every genre before anything is declared. The snapshot proves no note
   moved; this proves no genre grew a leg it did not ask for. */
{
  const grew = [];
  for(const g of M.genres()){
    /* asked only of the genres that did NOT ask for a journey — a genre that
       declares `form.ride` is supposed to have legs, and checking that it has
       none would be checking the feature is switched off */
    if(M.GENRE[g] && M.GENRE[g].form && M.GENRE[g].form.ride) continue;
    let song; try { song = M.composeSong(1, undefined, g); } catch(e){ continue; }
    if(song.form.legs != null || song.form.some(s => s.leg != null || s.atStop != null))
      grew.push(g);
  }
  console.log("  every genre, as it ships");
  say(grew.length === 0, "a genre that declares no journey has no legs and no stops",
      grew.length ? grew.join(", ") + " grew one" : M.genres().length + " genres, none of them a journey");
}

/* ── 2. NOW DECLARE ONE ──────────────────────────────────────────────────────
   Built out of the genre's OWN section functions, so its roles, lengths and
   energies already exist and this probe is testing the journey rather than a
   half-written table. Which functions those are is read off the genre rather
   than named here [Law 4]. */
/* the genre has to have somewhere to hand the lead FROM: a handover between
   two of the same instrument is not a handover, and a probe that passed on a
   genre with no pool would be reporting on nothing. Derived by asking each
   table what machines it has, never by naming one here [Law 4]. */
const poolOf = T => {
  const seen = [];
  for(const slot of Object.keys(T.machines || {})){
    const list = T.machines[slot];
    if(!Array.isArray(list)) continue;          // some slots carry an object, not a pool
    for(const e of list){
      const m = Array.isArray(e) ? e[0] : e;
      if(m && typeof m === "string" && m !== "auto" && !seen.includes(m)) seen.push(m);
    }
  }
  return seen;
};
const G0 = M.genres().find(g => {
  const T = M.GENRE[g];
  return T && T.form && T.form.lengths && T.form.roles && !T.form.ride &&
         poolOf(T).length >= 2;
});
if(!G0){ console.log("\n  no genre with a machine pool to hand over between\n");
         process.exit(faults ? 1 : 0); }
const T = M.GENRE[G0];
const FNS = Object.keys(T.form.lengths).filter(f => T.form.roles[f]);
const pick = (...want) => { for(const w of want) if(FNS.includes(w)) return w; return FNS[0]; };
const CRUISE = FNS.filter(f => f !== "intro" && f !== "outro").slice(0, 3);
const LEADS = poolOf(T).slice(0, 5);

const kept = T.form.ride;
T.form.ride = {
  legSec: [290, 310], maxLegs: 12, defaultSec: 1200,
  leads: LEADS,
  terrain: [["open", 3], ["woods", 2]],
  character: ["dawn", "midday", "dusk", "night"],
  leg:  { open: CRUISE[0], cruise: CRUISE.length ? CRUISE : ["verse"], close: pick("bridge", "outro") },
  stop: { solo: pick("intro"), dance: pick("chorus", "instrumental"), out: pick("intro") },
  depart: pick("intro"), arrive: pick("outro"),
  handover: { chair: "lead", second: "counter" },
  tempo: { out: 0.78, cruise: 1.0, into: 0.74, stop: 0.60 },
  energy: { stop: 0.15, cruise: 0.95, edge: 0.40 },
};

try {
  console.log("\n  " + G0 + ", with a journey declared on it" +
              (LEADS.length ? "   leads: " + LEADS.join(" ") : "   (no lead pool)"));

  /* COUNT and LENGTH, over the lengths the owner's arithmetic names */
  const WANT = [300, 600, 1200, 2400];
  const rows = [], badCount = [], badLen = [];
  for(const sec of WANT){
    const legs = [], errs = [];
    for(let s = 1; s <= SEEDS; s++){
      let song;
      try { song = M.composeSong(s, undefined, G0, undefined, undefined, undefined, undefined, undefined, sec); }
      catch(e){ badCount.push(mm(sec) + " seed " + s + " threw: " + e.message); continue; }
      const C = M.makeClock(song.chart, song.form);
      legs.push(song.form.legs);
      errs.push(Math.abs(C.at(song.form.nBars, 0) - sec) / sec);
    }
    if(!legs.length) continue;
    const want = Math.max(1, Math.round(sec / 300));
    if(legs.some(n => n !== want)) badCount.push(mm(sec) + " wanted " + want + ", got " + legs.join("/"));
    const worst = Math.max.apply(null, errs);
    /* 6%, and the number is the error floor rather than a taste: a leg is built
       out of WHOLE sections, so it lands within half a section of its share and
       never on it. Measured, the honest build's worst is 4% (at five minutes,
       where one section is a bigger slice of the record); a build that fills
       past its budget reads 8% and one that forgets the stops reads 24%. */
    if(worst > 0.06) badLen.push(mm(sec) + " off by " + (worst * 100).toFixed(0) + "%");
    rows.push(mm(sec) + "→" + legs[0] + " leg" + (legs[0] === 1 ? "" : "s") +
              " ±" + (worst * 100).toFixed(0) + "%");
  }
  say(badCount.length === 0, "the leg count is the record's LENGTH, not a draw",
      badCount.length ? badCount.join(" | ") : rows.join("   "));
  say(badLen.length === 0, "and the record still lands on the length it was asked for",
      badLen.length ? badLen.join(" | ") : "every length within 6%, worst " +
        rows.map(r => r.split("±")[1]).sort((a, z) => parseFloat(z) - parseFloat(a))[0]);

  /* STOPS, CEREMONY, HANDOVER, PACE — measured on the twenty-minute record,
     which is the one the owner described */
  let badStops = [], badCer = [], badSame = [], badSilent = [], badPace = [], n = 0;
  for(let s = 1; s <= SEEDS; s++){
    let song;
    try { song = M.composeSong(s, undefined, G0, undefined, undefined, undefined, undefined, undefined, 1200); }
    catch(e){ continue; }
    n++;
    const F = song.form, legs = F.legs;
    const stops = [...new Set(F.filter(x => x.atStop != null).map(x => x.atStop))];
    if(stops.length !== legs - 1)
      badStops.push("seed " + s + ": " + legs + " legs, " + stops.length + " stops");
    for(const k of stops){
      const block = F.filter(x => x.atStop === k);
      const solos = block.filter(x => x.soloOf);
      const dance = block.find(x => x.hand && x.hand.lead && x.hand.counter);
      const leadOf = L => { const a = F.find(x => x.leg === L && x.hand); return a && a.hand.lead; };
      const X = leadOf(k), Y = leadOf(k + 1);
      /* the ceremony, IN ORDER: X alone, the two of them, Y alone */
      if(solos.length !== 2 || !dance ||
         solos[0].soloOf !== X || solos[1].soloOf !== Y ||
         F.indexOf(solos[0]) > F.indexOf(dance) || F.indexOf(dance) > F.indexOf(solos[1]))
        badCer.push("seed " + s + " stop " + k);
      if(X && Y && X === Y) badSame.push("seed " + s + " stop " + k + ": both " + X);
      /* AND THE SOLOIST SOUNDS. This is the half that caught a real fault: the
         chair was handed an instrument the genre's roles did not seat. */
      for(const so of solos){
        const sec = song.sections[F.indexOf(so)];
        if(sec && !(sec.active || []).includes("lead"))
          badSilent.push("seed " + s + " stop " + k + ": " + so.soloOf + " is not in the room");
      }
    }
    /* THE PACE: fastest in the middle of a leg, slower at both platforms, and
       slowest of all while standing. Read off the map rather than the table. */
    const map = F.tempo;
    if(!map){ badPace.push("seed " + s + ": no tempo map"); continue; }
    const stopT = [], midT = [], edgeT = [];
    for(const x of F)
      for(let b = x.startBar; b < x.endBar && b < map.length; b++){
        if(x.atStop != null) stopT.push(map[b]);
        else if(F.ridePos && F.ridePos[b] >= 0){
          const r = F.ridePos[b];
          (r > 0.35 && r < 0.65 ? midT : (r < 0.12 || r > 0.88) ? edgeT : []).push(map[b]);
        }
      }
    const mean = a => a.length ? a.reduce((t, v) => t + v, 0) / a.length : null;
    const mS = mean(stopT), mM = mean(midT), mE = mean(edgeT);
    if(!(mM > mE + 1 && (mS == null || mS < mE)))
      badPace.push("seed " + s + ": stop " + (mS && mS.toFixed(1)) +
                   " edge " + (mE && mE.toFixed(1)) + " middle " + (mM && mM.toFixed(1)));
  }
  say(badStops.length === 0, "a stop divides two legs, so there are one fewer than the legs",
      badStops.length ? badStops.join(" | ") : n + " records, every stop between two legs");
  say(badCer.length === 0, "and each one runs solo X → the two of them → solo Y",
      badCer.length ? badCer.length + " out of order: " + badCer.slice(0, 3).join(", ")
                    : "the ceremony is in order at every station");
  say(badSame.length === 0, "the leg ahead is led by a different instrument from the leg behind",
      badSame.length ? badSame.slice(0, 3).join(" | ") : "no station hands over to the same player");
  say(badSilent.length === 0, "and the instrument the form named is actually in the room",
      badSilent.length ? badSilent.slice(0, 3).join(" | ") : "every soloist plays its own solo");
  say(badPace.length === 0, "the pace rises across a leg and falls at the platform",
      badPace.length ? badPace.slice(0, 3).join(" | ")
                     : "fastest mid-leg, slower at both ends, slowest standing");
} finally {
  if(kept === undefined) delete T.form.ride; else T.form.ride = kept;
}

console.log("\n  " + faults + " journey fault(s)\n");
process.exit(faults ? 1 : 0);
