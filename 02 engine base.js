"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   ENGINE FOUNDATION  —  the two-tier constraint system every engine uses.
   HARD constraints REJECT (physics of music theory). SOFT tendencies WEIGHT
   the randomness (conventions — "often" not "always"). An engine proposes
   random material and keeps only what passes HARD, chosen by SOFT weight.
   ═══════════════════════════════════════════════════════════════════════════ */
const T = globalThis.T || (function(){
  const src=require("fs").readFileSync(__dirname+"/00_theory.js","utf8")
    .replace(/^const T=\(function/,"(function").replace(/\}\)\(\);?\s*$/,"})()");
  return eval(src); })();
const pc = m => ((m%12)+12)%12;

// seeded RNG so sessions are reproducible
function makeRng(seed){ let a=(seed>>>0)||1;
  return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const pick   = (rng,arr)=>arr[Math.floor(rng()*arr.length)];
// weighted pick: arr of [value, weight]
const wpick  = (rng,pairs)=>{ const tot=pairs.reduce((s,p)=>s+p[1],0); let r=rng()*tot;
  for(const [v,w] of pairs){ if((r-=w)<=0) return v; } return pairs[pairs.length-1][0]; };
const clamp  = (v,lo,hi)=>v<lo?lo:v>hi?hi:v;

/* HARD constraints for a chord voicing — physics, non-negotiable. Return true
   if the voicing is physically valid. These are what REJECT bad material. */
const HARD = {
  // no voice more than an octave above the one below it (no lonely strays)
  voiceSpacing(voicing){ const v=voicing.slice().sort((a,b)=>a-b);
    for(let i=1;i<v.length;i++) if(v[i]-v[i-1]>12) return false; return true; },
  // a chord must actually contain its defining tones (it IS the chord)
  isChord(voicing, tones){ const have=new Set(voicing.map(pc));
    return tones.every(t=>have.has(pc(t))); },
  // total span within reason (a real close-ish voicing, not 3 octaves)
  spanOk(voicing, maxSpan){ const v=voicing.slice().sort((a,b)=>a-b);
    return (v[v.length-1]-v[0])<=(maxSpan||19); },
  // a non-chord melodic tone must resolve by step (checked over a line)
  resolvesByStep(prevMidi, midi, nextMidi, tones){
    if(tones.some(t=>pc(t)===pc(midi))) return true;           // chord tone, fine
    return nextMidi!=null && Math.abs(nextMidi-midi)<=2;       // else must step out
  },
};

/* SOFT tendencies — conventions expressed as WEIGHTS, grounded in the research.
   These bias the dice; they never force. */
const SOFT = {
  // cadence distribution measured from corpora (Haydn 122 PAC / 84 HC / 19 DC)
  // → resolve-to-tonic ~55%, half/unresolved ~35%, deceptive ~8%, modal-never ~2%
  cadenceKind(rng, allowModal){
    return wpick(rng, [
      ["authentic", 55], ["half", 35], ["deceptive", 8],
      ...(allowModal ? [["none", 12]] : []),
    ]);
  },
  // functional root motion strength: 4th/5th strongest, then step, then third
  rootMotionWeight(fromPc, toPc){
    const iv=((toPc-fromPc)+12)%12;
    return ({7:5, 5:5, 2:3, 10:3, 3:2, 9:2, 4:2, 8:2}[iv]) || 1;
  },
  // keep common tones between chords when you can (soft — weights, not forced)
  commonToneBonus(prevVoicing, tones){
    if(!prevVoicing) return 0;
    const prev=new Set(prevVoicing.map(pc));
    return tones.filter(t=>prev.has(pc(t))).length;
  },
  // EDM entrance rule: entrances land on phrase boundaries (8-bar), 4 softer
  entranceWeight(bar, unit){
    if(bar % unit === 0) return 5;
    if(bar % (unit/2) === 0) return 2;
    return 0.2;
  },
};

module.exports = { T, pc, makeRng, pick, wpick, clamp, HARD, SOFT };
