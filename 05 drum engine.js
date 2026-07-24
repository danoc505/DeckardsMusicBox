"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE DRUM ENGINE   (grounded in the project Drums transcript + GM map research)
   ---------------------------------------------------------------------------
   Structure (from the transcript, verbatim rules):
   · SPINE beat: kicks on strong beats, snare/clap on the BACKBEAT (2 & 4),
     closed hats on the OFFBEAT "and"s, GHOST notes (quiet, esp. snare) on the
     weak 16th "e/a"s. Weak-beat sounds mix LOW (toms) and HIGH (hats/perc)
     frequencies — "the best way to go."
   · PHRASING over 8 bars: A B A C  A A D  — A=core, B=one small change,
     C=bigger change, D=FILL or EMPTY. The phrase jumps to the length at which
     the listener recognises repetition.
   · FILL (bar 8, sometimes 4): extra syncopation, snares on weak beats, extra
     kicks on 8ths, and TOMS. EMPTY: subtract most/all elements (drop the kick)
     to decouple before the next downbeat.
   · Full GM kit incl. all toms; breakbeat genres use the probabilistic
     resequencer (schollz/amenbreak model: slices reordered & mangled by
     probability — stutter/reverse/gate/roll — placed a little "loose").

   Reads the listening layer: locks kick changes near chord/bass changes, and
   fits its density to how full the band already is.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = require("./02_engine_base.js");
const { T, pc, wpick, pick, clamp } = B;
const SPB = 16;

/* ---- FULL GM DRUM KIT (note numbers from GM map research) ----------------- */
const KIT = {
  kick:36, sideStick:37, snare:38, clap:39, snare2:40,
  lowFloorTom:41, closedHat:42, highFloorTom:43, pedalHat:44,
  lowTom:45, openHat:46, lowMidTom:47, hiMidTom:48, crash:49, highTom:50,
  ride:51, tambourine:54, cowbell:56, shaker:70,
};
// the tom set, low→high, for fills (transcript: high/mid/low toms)
const TOMS = [KIT.lowFloorTom, KIT.highFloorTom, KIT.lowTom, KIT.lowMidTom, KIT.hiMidTom, KIT.highTom];

/* ---- GROOVE FAMILIES — soft feel, NOT baked patterns. Each is a set of
   PROBABILITIES/placements the engine samples from, so the beat varies. ----- */
const FEELS = {
  // steady four-on-floor (house/techno)
  four: { kick:[0,4,8,12], snarePlaces:[4,12], hatStep:2, hatOffbeat:true, swing:0.08, ghost:0.3 },
  // backbeat with syncopated kick (hip-hop/lofi/boombap)
  boombap: { kick:[0,10], snarePlaces:[4,12], hatStep:2, hatOffbeat:false, swing:0.55, ghost:0.7 },
  // breakbeat (jungle/dnb) — uses the resequencer
  breaks: { kick:[0,7], snarePlaces:[4,12], hatStep:2, hatOffbeat:false, swing:0.15, ghost:0.6, resequence:true },
  // sparse/half-time (ambient/dungeon)
  sparse: { kick:[0], snarePlaces:[8], hatStep:8, hatOffbeat:false, swing:0, ghost:0.2 },
};

/* ---- the DRUM ENGINE ------------------------------------------------------ */
function drumEngine(chart, perception, rng){
  const nBars = chart.nBars;
  const feelName = chart.feel || (chart.genre && GENRE_FEEL[chart.genre]) || "boombap";
  const feel = FEELS[feelName] || FEELS.boombap;
  feel._name = feelName;                     // so guards can compare by name
  const notes = [];

  // READ the band: how full is it? where are the harmonic changes (align kicks)?
  const density = perception ? perception.density : null;
  const changeBar = b => {                       // does harmony change at bar b?
    if(!perception || !perception.harmony) return false;
    const h=perception.harmony[b], p=perception.harmony[b-1];
    return h && p && h.root!==p.root;
  };

  // build ONE core "A" bar we vary against (spine + ghosts), as a placement set
  const A = buildBar(feel, rng, {fill:false, empty:false});

  // ABACAAD across 8-bar phrases (transcript's exact letter scheme)
  const SCHEME = ["A","B","A","C","A","A","D","A"];  // 8-bar; D at bar 7 (0-indexed 6)
  // a groove lifted from the corpus: lanes and steps only, so it fits any key.
  // Kept to the core (A) bars — fills and development stay engine-generated so
  // the loop still evolves.
  let CORPUS_GROOVE = null;
  {
    const C = (typeof globalThis!=="undefined" && globalThis.IMPROV_CORPUS) ||
              (typeof IMPROV_CORPUS!=="undefined" ? IMPROV_CORPUS : null);
    if(C && C.grooves && C.grooves.length && !(typeof globalThis!=="undefined" && globalThis.IMPROV_HARVEST)
       && rng() < 0.5){
      const sameFeel = C.grooves.filter(g=>g.feel===feelName);
      const pool = sameFeel.length ? sameFeel : C.grooves;
      CORPUS_GROOVE = pool[Math.floor(rng()*pool.length)];
    }
  }
  for(let b=0; b<nBars; b++){
    const slot = SCHEME[b % 8];
    const loopIdxD = Math.floor(b/8);
    const modeD = ["state","repeat","depart","vary"][loopIdxD%4];
    let bar;
    if(feel.resequence && slot!=="D"){
      bar = resequenceBreak(feel, rng, b);        // breakbeat resequencer
    } else if(slot==="A"){
      bar = cloneBar(A);
    } else if(slot==="B"){
      bar = varyBar(A, feel, rng, "small");       // one small change
    } else if(slot==="C"){
      bar = varyBar(A, feel, rng, "big");         // bigger change
    } else { // "D" — fill or empty
      const isLastOfPhrase = true;
      bar = (rng() < 0.85) ? fillBar(feel, rng) : emptyBar(feel, rng);
    }
    // a corpus groove replaces the core bars; everything else still develops
    if(CORPUS_GROOVE && slot==="A"){
      bar = CORPUS_GROOVE.hits.map(h=>({ step:h.step, lane:h.lane, vel:h.vel }));
    }
    // across-loop development: depart loops lift expression (open hats, extra
    // ghosts); vary loops do the kick edit at the loop seam (add/remove kicks
    // at the end of the 8 to signify change).
    if(modeD==="depart"){
      bar=bar.map(h=> h.lane==="closedHat" && rng()<0.3 ? {...h,lane:"openHat",vel:Math.min(1,h.vel*1.1)} : h);
      // a Phil-style gated TOM answer on the depart loops — never in breaks (amen turf)
      if(!(feel && feel._name==="breaks") && rng()<0.6){ const t0=pick(rng,[10,12]);
        pick(rng,[["hiMidTom","lowTom"],["highTom","lowMidTom"],["lowMidTom","lowFloorTom"]])
          .forEach((tk,ti)=>bar.push({step:t0+ti*2, lane:tk, vel:0.55}));
      } else bar.push({step:pick(rng,[3,7,11]), lane:"snare", vel:0.2, ghost:true});
    }
    if(modeD==="vary" && (b%8)===7){
      if(rng()<0.5) bar.push({step:pick(rng,[8,10,14]), lane:"kick", vel:0.7});
      else bar=bar.filter(h=>!(h.lane==="kick"&&h.step>0&&rng()<0.5));
    }
    // READ-response: if harmony changes here, reinforce the downbeat kick
    if(changeBar(b) && !bar.some(h=>h.step===0 && h.lane==="kick"))
      bar.push({step:0, lane:"kick", vel:0.95});
    // density response: if the band is very full, thin the ghosts
    if(density && density.normalized[b] > 0.7)
      bar = bar.filter(h => !(h.ghost && rng()<0.5));

    // emit with swing on the offbeat 16ths
    for(const h of bar){
      const micro = 0;    // swing/microtiming belongs to the GROOVE layer now
      notes.push({ bar:b, step:h.step, lane:laneName(h.lane), midi:KIT[h.lane], dur:1,
                   vel:h.vel, micro });
    }
  }
  return { name:"drums", role:"drums", notes, feel:feelName };
}

const GENRE_FEEL = { house:"four", techno:"four", lofi:"boombap", citypop:"boombap",
  barber:"boombap", wise:"boombap", jungle:"breaks", ambient:"sparse", dungeon:"sparse" };

function laneName(k){ return k; }  // keep the lane key as-is (kick/snare/…)

/* build one bar's placement set from a feel (spine + hats + ghosts) --------- */
function buildBar(feel, rng, opts){
  const bar=[];
  // SPINE: kicks
  for(const s of feel.kick) bar.push({step:s, lane:"kick", vel:0.95});
  // BACKBEAT: snare/clap on 2 & 4 (steps 4 & 12)
  for(const s of feel.snarePlaces) bar.push({step:s, lane:"snare", vel:0.85});
  // HATS: on the grid; offbeat placement pushes to the "and"s
  for(let s=0; s<SPB; s+=feel.hatStep){
    const onOff = feel.hatOffbeat ? (s+2) : s;
    if(onOff<SPB) bar.push({step:onOff, lane:"closedHat", vel: (onOff%4===0?0.5:0.38)});
  }
  // GHOST NOTES on weak 16ths (e/a) — quiet. Transcript: "a quieter version of
  // the same drums... most common is the snare." Ghosts are snare & hat, mixing
  // the high frequencies; TOMS are reserved for fills (not sprinkled on the core).
  const weak=[1,2,3,5,6,7,9,10,11,13,14,15].filter(s=>!feel.kick.includes(s)&&!feel.snarePlaces.includes(s));
  for(const s of weak){
    if(rng() < feel.ghost*0.35){
      const r=rng();
      const lane = (feel && feel._name==="breaks") ? (r<0.6?"snare":"closedHat")   // jungle: amen only, no toms
                 : r<0.45 ? "snare" : r<0.75 ? "closedHat"
                 : pick(rng,["lowTom","lowFloorTom","highFloorTom"]);   // the LOW half of the mix
      bar.push({step:s, lane, vel: lane.indexOf("Tom")>=0?0.22:0.18, ghost:true});
    }
  }
  return bar;
}
function cloneBar(bar){ return bar.map(h=>({...h})); }

/* vary a bar: B = one small change; C = a bigger one (transcript) ----------- */
function varyBar(A, feel, rng, size){
  let bar = cloneBar(A);
  const nChanges = size==="small" ? 1 : (2 + Math.floor(rng()*2));
  for(let i=0;i<nChanges;i++){
    const kind = wpick(rng, [["add",3],["subtract",2],["substitute",2],["move",2]]);
    if(kind==="add"){ const s=Math.floor(rng()*SPB);
      bar.push({step:s, lane: rng()<0.5?"closedHat":"kick", vel:0.4, ghost:true}); }
    else if(kind==="subtract" && bar.length>4){ bar.splice(Math.floor(rng()*bar.length),1); }
    else if(kind==="substitute"){ const h=pick(rng,bar);
      if(h && h.lane==="closedHat") h.lane="openHat"; }
    else if(kind==="move"){ const h=pick(rng,bar.filter(x=>x.ghost));
      if(h) h.step=clamp(h.step + (rng()<0.5?1:-1),0,SPB-1); }
  }
  return bar;
}

/* FILL: extra syncopation + snares on weak beats + extra 8th kicks + TOMS ---- */
function fillBar(feel, rng){
  if(feel && feel._name==="breaks"){         // jungle: snare-stutter fill, amen style
    const bar=[]; const start=pick(rng,[8,10,12]);
    for(let s=start;s<16;s++) if(rng()<0.8) bar.push({step:s, lane:"snare", vel:0.3+ (s-start)*0.07});
    bar.push({step:0, lane:"kick", vel:0.85});
    return bar;
  }
  const bar=[];
  // keep a skeletal pulse early, then break into a tom/snare fill in the 2nd half
  bar.push({step:0, lane:"kick", vel:0.9});
  if(rng()<0.5) bar.push({step:4, lane:"snare", vel:0.7});
  // extra 8th-note kicks (transcript)
  for(const s of [2,6]) if(rng()<0.5) bar.push({step:s, lane:"kick", vel:0.6});
  // TOM FILL descending or ascending through the toms in the last beat(s)
  const start = rng()<0.5 ? 8 : 10;
  const ascending = rng()<0.5;
  const seq = ascending ? TOMS.slice() : TOMS.slice().reverse();
  let ti=0;
  for(let s=start; s<SPB; s++){
    if(rng()<0.7){
      const tomKey = Object.keys(KIT).find(k=>KIT[k]===seq[ti%seq.length]);
      bar.push({step:s, lane:tomKey, vel:0.6 + (s-start)*0.03});
      ti++;
    }
  }
  // extra snare hits for anticipation
  for(const s of [13,15]) if(rng()<0.6) bar.push({step:s, lane:"snare", vel:0.55});
  // a crash lands on the NEXT downbeat implicitly (we mark step 0 next bar via caller? keep simple)
  return bar;
}

/* EMPTY: subtract most/all elements (the decoupling) ------------------------ */
function emptyBar(feel, rng){
  const bar=[];
  // simplest: drop the kick; maybe leave a hat or a single anticipation snare
  if(rng()<0.5) bar.push({step:0, lane:"closedHat", vel:0.3});
  if(rng()<0.4) bar.push({step:14, lane:"snare", vel:0.5});   // tiny anticipation
  // sometimes truly empty (the vacuum)
  return bar;
}

/* ---- PROBABILISTIC BREAKBEAT RESEQUENCER ---------------------------------
   (schollz/amenbreak model: slices reordered & mangled by probability, with
   stutter/reverse/gate/roll, placed a little "loose" for groove.)
   We don't slice a WAV — we resequence an 8-slot grid of KIT hits. ---------- */
function resequenceBreak(feel, rng, bar){
  // a canonical amen-ish 8-slice skeleton (kick/snare/hat/ride roles per slice)
  const SLICES = [
    ["kick",0.95], ["closedHat",0.4], ["snare",0.85], ["closedHat",0.4],
    ["kick",0.9],  ["snare",0.8],     ["ride",0.5],   ["snare",0.7],
  ];
  // reorder by probability (a few swaps — "loose" not random chaos)
  const order = SLICES.map((_,i)=>i);
  const swaps = 1 + Math.floor(rng()*3);
  for(let k=0;k<swaps;k++){ const i=Math.floor(rng()*8), j=Math.floor(rng()*8);
    [order[i],order[j]]=[order[j],order[i]]; }
  const out=[];
  order.forEach((sliceIdx, pos)=>{
    const [lane, vel] = SLICES[sliceIdx];
    const step = pos*2;
    // "loose" placement: occasionally nudge ±1 for groove (forum wisdom)
    const loose = rng()<0.25 ? (rng()<0.5?1:-1) : 0;
    out.push({step: clamp(step+loose,0,SPB-1), lane, vel: vel*(0.85+rng()*0.3)});
    // STUTTER/ROLL effect (probabilistic, amenbreak-style)
    if(rng()<0.2) out.push({step: clamp(step+1,0,SPB-1), lane:"closedHat", vel:0.3, ghost:true});
    // GATE (drop a hit entirely) — handled by the probability of pushing above
  });
  // occasional snare ROLL in the last beat
  if(rng()<0.3){ for(let s=12;s<SPB;s++) if(rng()<0.5) out.push({step:s, lane:"snare", vel:0.3+(s-12)*0.08, ghost:true}); }
  return out;
}

module.exports = { drumEngine, KIT, TOMS, FEELS, buildBar, fillBar, resequenceBreak };
