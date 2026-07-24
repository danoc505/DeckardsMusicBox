"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE GROOVE LAYER — the difference between programmed and played.
   One pass over every part, adding: SWING (offbeats delayed), MICROTIMING
   (per-role push/pull against the grid), and VELOCITY PHRASING (accents).
   Stored as a fractional-step `micro` offset per note; the scheduler applies it.

   Grounded in research (groove/microtiming literature):
   · Swing ratio is the ratio of onbeat to offbeat duration. ~2.66 is typical
     for jazz; straight (1.0) for four-on-the-floor house; light swing between.
   · Microtiming deviations are small — roughly 5-20 ms. Snare LATE (+5..+15 ms)
     reads laid-back and soulful; snare EARLY (-5..-10 ms) reads urgent, and
     drum-and-bass styles rush elements 5-8 ms deliberately.
   · The asymmetry finding: early shifts are judged more harshly than equivalent
     late ones, and deviations on the SNARE are judged more harshly than on the
     kick. So: the kick may move more freely, the snare is treated gently, and
     pushes (early) stay smaller than drags (late).
   · Fully-quantized performances reduce listener entrainment relative to modest
     deviations, but large deviations reduce quality — the sweet spot is subtle.
     Hi-hat velocity variation of roughly 10-15% is the humanising range.

   Per the prime directive these are BOUNDS, not baked values: each song draws
   its own swing amount and per-role offsets from genre-appropriate ranges, so
   two songs in the same genre still feel different.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = globalThis.__B || (typeof require!=="undefined" ? require("./02_engine_base.js") : null);
const { pick, wpick, clamp } = B;

/* per-genre RANGES the seed draws inside: [swingLo, swingHi] as a swing ratio
   (1.0 = straight, 1.5 = light, 2.0 = triplet-ish, 2.66 = jazz), and the feel
   of the backbeat: "drag" (laid back), "push" (urgent), or "even". */
const GROOVE_BOUNDS = {
  house:   { swing:[1.00,1.10], feel:["even","push"] },
  jungle:  { swing:[1.00,1.20], feel:["push"] },
  lofi:    { swing:[1.35,1.75], feel:["drag"] },
  barber:  { swing:[1.40,1.90], feel:["drag","even"] },
  citypop: { swing:[1.05,1.30], feel:["even","drag"] },
  wise:    { swing:[1.15,1.55], feel:["drag","even"] },
  dungeon: { swing:[1.00,1.15], feel:["even"] },
  ambient: { swing:[1.00,1.10], feel:["even"] },
};

/* build this song's groove profile (drawn within the genre's bounds) */
function makeGroove(chart, rng){
  const G = GROOVE_BOUNDS[chart.genre] || { swing:[1.0,1.3], feel:["even"] };
  const swing = G.swing[0] + rng()*(G.swing[1]-G.swing[0]);
  const feel  = pick(rng, G.feel);
  const tempo = chart.tempo || 90;
  // ms → fractional 16th steps at this tempo (one 16th = 15000/tempo ms)
  const msToStep = ms => ms * tempo / 15000;

  // per-role push/pull, drawn inside the researched ranges. Late is safer than
  // early, and the snare gets the gentlest treatment of all.
  const drag = feel==="drag", push = feel==="push";
  const prof = {
    kick:     msToStep(rand(rng, -4, drag?6:2)),           // the anchor, freest
    snare:    msToStep(drag ? rand(rng,5,14) : push ? rand(rng,-8,-3) : rand(rng,-2,4)),
    hat:      msToStep(rand(rng,-3,5)),
    tom:      msToStep(rand(rng,0,8)),
    bass:     msToStep(drag ? rand(rng,2,10) : push ? rand(rng,-6,0) : rand(rng,-2,5)),
    harmony:  msToStep(rand(rng,0,9)),                     // chords sit back a touch
    lead:     msToStep(push ? rand(rng,-7,-1) : rand(rng,-4,6)),
    counter:  msToStep(rand(rng,-3,8)),
    pad:      msToStep(rand(rng,0,12)),                    // pads are hazy, latest
    arp:      msToStep(rand(rng,-3,4)),
    lowline:  msToStep(rand(rng,-4,6)),
  };
  return { swing, feel, prof, tempo,
           humanise: msToStep(rand(rng, 2, 6)) };          // per-note jitter magnitude
}
function rand(rng, lo, hi){ return lo + rng()*(hi-lo); }

/* apply the groove to every part in place. Each note gains `micro`, a signed
   offset in fractional 16th steps, plus velocity phrasing. */
function applyGroove(parts, chart, groove, rng){
  const swingOffset = (groove.swing - 1) * 0.5;    // how far the offbeat slides
  let touched = 0;
  for(const p of parts){
    const roleKey = p.role==="drums" ? null : (groove.prof[p.role]!=null ? p.role : "lead");
    for(const n of p.notes){
      let micro = 0;
      // ── SWING: offbeat 8ths (odd 8th positions) slide later ──
      const is8thOff = (n.step % 4 === 2);
      const is16thOff = (n.step % 2 === 1);
      const swingPart = is8thOff ? swingOffset : (is16thOff ? swingOffset*0.5 : 0);
      micro += swingPart;
      // ── MICROTIMING by role (drums are per-lane) ──
      if(p.role==="drums"){
        const lane = n.lane||"";
        if(lane==="kick") micro += groove.prof.kick;
        else if(lane.indexOf("snare")>=0 || lane==="clap") micro += groove.prof.snare;
        else if(lane.indexOf("Tom")>=0 || lane.indexOf("tom")>=0) micro += groove.prof.tom;
        else micro += groove.prof.hat;
      } else {
        micro += groove.prof[roleKey] || 0;
      }
      // ── HUMANISE: small per-note jitter so no two hits are machine-identical
      //    (kept subtle — large deviations measure worse than none) ──
      micro += (rng()*2-1) * groove.humanise;
      n.micro = (n.micro||0) + micro;
      n.microDev = (n.microDev||0) + (micro - swingPart);   // the humanising part alone

      // ── VELOCITY PHRASING: accent the downbeat, lighten the offbeats, and
      //    give hats the ~10-15% variation the research names ──
      if(n.vel!=null){
        const onBeat = (n.step % 4 === 0);
        const isHat = p.role==="drums" && (n.lane||"").toLowerCase().indexOf("hat")>=0;
        let v = n.vel;
        if(onBeat) v *= 1.06;
        else if(is8thOff) v *= 0.93;
        if(isHat) v *= 1 + (rng()*0.26 - 0.13);           // ±13%
        else v *= 1 + (rng()*0.10 - 0.05);                // ±5% elsewhere
        n.vel = clamp(v, 0.05, 1);
      }
      touched++;
    }
  }
  return { touched, swing:groove.swing, feel:groove.feel };
}

function describeGroove(g){
  const ms = s => Math.round(s * 15000 / (g.tempo||90));
  return `groove: swing ${g.swing.toFixed(2)} (${g.feel})  ·  kick ${ms(g.prof.kick)}ms  `+
         `snare ${ms(g.prof.snare)>0?"+":""}${ms(g.prof.snare)}ms  bass ${ms(g.prof.bass)>0?"+":""}${ms(g.prof.bass)}ms`;
}

if(typeof module!=="undefined") module.exports = { makeGroove, applyGroove, describeGroove, GROOVE_BOUNDS };
