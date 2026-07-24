"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE LISTENING LAYER  —  the shared "ears" of the whole program.
   ---------------------------------------------------------------------------
   This is the keystone. Every engine reads it to decide what to play; the
   conductor reads it to decide structure; the ghost reads it to judge and
   correct. There is ONE representation of "what is currently sounding," and
   everyone perceives the music the same way: by reading the NOTES.

   The model has no ears for TIMBRE (that lives in the synth/mix), but notes
   are data, and hearing the COMPOSITION is reading that data. This module is
   that reading, made shared and explicit.

   Input: the "session" so far — a set of PARTS, each part being notes on a
   grid (16 steps/bar). Output: a Perception object exposing the six things a
   musician actually listens for:
     (a) harmony  — the chord/scale the sounding notes imply, per bar
     (b) rhythm   — the accent map: where onsets land, where the pulse is
     (c) register — which pitch ranges are occupied (where the SPACE is)
     (d) phrase   — bar/phrase boundaries where entrances & changes belong
     (e) motifs   — short pitch/rhythm ideas a voice could echo or answer
     (f) density  — how full each moment is (room to play vs. wall of sound)
   ═══════════════════════════════════════════════════════════════════════════ */

// depends on T (theory). In the app both live in one scope; here we require it.
const T = (typeof module!=="undefined" && !globalThis.T)
  ? (function(){ const src=require("fs").readFileSync(__dirname+"/00_theory.js","utf8")
      .replace(/^const T=\(function/,"(function").replace(/\}\)\(\);?\s*$/,"})()");
      return eval(src); })()
  : globalThis.T;

const STEPS_PER_BAR = 16;
const pc = m => ((m%12)+12)%12;

/* ---- a PART is { name, role, notes:[{bar,step,midi,dur,vel}] } ------------
   role ∈ {harmony, bass, drums, lead, counter, pad, arp}  (drums use lane not midi) */

// gather every sounding pitch at an absolute 16th-step position across all parts
function soundingAt(parts, absStep){
  const out=[];
  for(const p of parts){ if(p.role==="drums") continue;
    for(const n of p.notes){ const start=n.bar*STEPS_PER_BAR+n.step;
      if(start<=absStep && start+(n.dur||1)>absStep && n.midi!=null)
        out.push({midi:n.midi, part:p.name, role:p.role, onset:start===absStep}); } }
  return out;
}

/* (a) HARMONY — infer the implied chord & scale for each bar from the notes
   that sound in it. Bass roots weight the root (research: bass implies harmony);
   the collected pitch-classes are matched to the nearest triad/7th. */
function inferHarmony(parts, nBars, key){
  const bars=[];
  for(let b=0;b<nBars;b++){
    const pcsWeighted={}; let bassPc=null, bassDownbeatStep=999, bassLow=999;
    for(const p of parts){ if(p.role==="drums") continue;
      for(const n of p.notes){ if(n.bar!==b || n.midi==null) continue;
        const strong=(n.step%4===0);
        const w=(strong?2:1)*(n.dur||1)/4 + (n.step===0?2:0);
        pcsWeighted[pc(n.midi)]=(pcsWeighted[pc(n.midi)]||0)+w;
        // the bass note that DEFINES the harmony is the earliest/downbeat one,
        // not merely the lowest-pitched (a mid-bar dip shouldn't rename the chord)
        if(p.role==="bass" && n.step<bassDownbeatStep){
          bassDownbeatStep=n.step; bassPc=pc(n.midi); bassLow=n.midi; } } }
    const present=Object.keys(pcsWeighted).map(Number);
    if(!present.length){ bars.push(null); continue; }
    // root: the bass pitch-class if we have one, else the heaviest pc
    const root = bassPc!=null ? bassPc
      : present.sort((x,y)=>pcsWeighted[y]-pcsWeighted[x])[0];
    // quality: does present set contain a minor or major 3rd, a 7th?
    const has=iv=>present.some(x=>pc(x-root)===iv);
    let quality = has(3)?"min" : has(4)?"maj" : has(7)?"5" : "?";
    const seventh = has(10)?"7" : has(11)?"maj7" : "";
    bars.push({ root, rootName:T.NOTE[root], quality, seventh,
      pcs:present, weight:pcsWeighted, bassPc });
  }
  return bars;
}

/* (b) RHYTHM — the accent/onset map: for each 16th position across a bar-cycle,
   how many onsets land there and how hard. This is the groove everyone locks to. */
function readRhythm(parts, nBars){
  const grid=new Array(STEPS_PER_BAR).fill(0);       // onset weight per 16th (bar-folded)
  const kick=new Array(STEPS_PER_BAR).fill(0), snare=new Array(STEPS_PER_BAR).fill(0);
  for(const p of parts){
    for(const n of p.notes){
      const s=n.step%STEPS_PER_BAR;
      if(p.role==="drums"){ if(n.lane==="kick")kick[s]++; if(n.lane==="snare")snare[s]++; grid[s]+=0.5; }
      else if(n.midi!=null) grid[s]+=(n.vel||0.5);
    }
  }
  // where are the strong accents? (peaks in the onset map)
  const peak=Math.max(...grid,0.001);
  const accents=grid.map((v,i)=>({step:i, strong:v>=peak*0.6}));
  return { onsetMap:grid, kick, snare, accents,
    pulse: kick.some(v=>v>0)?"kick-driven":"even" };
}

/* (c) REGISTER — which MIDI ranges are occupied right now, so a new voice can
   find empty space (research: enter where there's room, avoid masking). */
function readRegister(parts){
  const occupied=[]; let lo=127, hi=0;
  const byRole={};
  for(const p of parts){ if(p.role==="drums") continue;
    let plo=127, phi=0;
    for(const n of p.notes){ if(n.midi==null) continue;
      lo=Math.min(lo,n.midi); hi=Math.max(hi,n.midi);
      plo=Math.min(plo,n.midi); phi=Math.max(phi,n.midi); }
    if(phi>=plo) byRole[p.role]=[plo,phi];
  }
  // find the biggest empty gap between occupied bands (that's where space is)
  const bands=Object.values(byRole).sort((a,b)=>a[0]-b[0]);
  let gaps=[];
  for(let i=1;i<bands.length;i++){ const g=bands[i][0]-bands[i-1][1];
    if(g>4) gaps.push({from:bands[i-1][1], to:bands[i][0], size:g}); }
  // also the wide-open spaces above and below everything
  if(lo<127 && lo>36) gaps.push({from:24, to:lo, size:lo-24, edge:"below"});
  if(hi>0 && hi<96) gaps.push({from:hi, to:108, size:108-hi, edge:"above"});
  gaps.sort((a,b)=>b.size-a.size);
  return { low:lo<128?lo:null, high:hi>0?hi:null, byRole, gaps,
    biggestSpace: gaps[0]||null };
}

/* (d) PHRASE — the boundary grid. Entrances & changes belong on these (soft
   EDM rule: 8-bar default, also 4/16). Reports the next boundary from any bar. */
function readPhrase(nBars, unit){
  unit = unit || 8;
  const boundaries=[]; for(let b=0;b<=nBars;b+=unit) boundaries.push(b);
  return { unit, boundaries,
    isBoundary: b => b%unit===0,
    nextBoundary: b => boundaries.find(x=>x>b) ?? nBars,
    // half-boundaries (4-bar) are softer entrance points
    softBoundary: b => b%(unit/2)===0 };
}

/* (e) MOTIFS — extract the short pitch+rhythm ideas currently in play, so a
   voice can echo, answer, or contrast them (the core of call-and-response). */
function readMotifs(parts){
  const motifs=[];
  for(const p of parts){ if(p.role==="drums"||p.role==="pad") continue;
    const ns=p.notes.filter(n=>n.midi!=null).sort((a,b)=>
      (a.bar*STEPS_PER_BAR+a.step)-(b.bar*STEPS_PER_BAR+b.step));
    if(ns.length<2) continue;
    // a motif = the first 2-4 notes of each phrase (contour + rhythm)
    const cell=ns.slice(0,4);
    const intervals=[]; for(let i=1;i<cell.length;i++) intervals.push(cell[i].midi-cell[i-1].midi);
    const rhythm=cell.map(n=>n.bar*STEPS_PER_BAR+n.step);
    const rel=rhythm.map(t=>t-rhythm[0]);
    motifs.push({ part:p.name, role:p.role, pitches:cell.map(n=>n.midi),
      intervals, rhythm:rel, contour: intervals.reduce((a,b)=>a+b,0)>=0?"up":"down" });
  }
  return motifs;
}

/* (f) DENSITY — how full each bar is (onsets across all parts / capacity), so a
   voice knows whether to add or lay out, and the ghost can see walls of sound. */
function readDensity(parts, nBars){
  const perBar=new Array(nBars).fill(0);
  for(const p of parts) for(const n of p.notes)
    if(n.bar<nBars) perBar[n.bar]++;
  const cap=STEPS_PER_BAR* Math.max(1,parts.length);
  return { perBar, normalized: perBar.map(x=>Math.min(1,x/cap)),
    busiest: perBar.indexOf(Math.max(...perBar)),
    emptiest: perBar.indexOf(Math.min(...perBar)),
    activeParts: parts.length };
}

/* THE PERCEPTION — the one shared object everyone reads. */
function listen(session){
  const parts = session.parts||[];
  const nBars = session.nBars||8;
  const key   = session.key||{root:0,scale:"minor"};
  return {
    nBars, key, parts,
    harmony:  inferHarmony(parts, nBars, key),   // (a)
    rhythm:   readRhythm(parts, nBars),          // (b)
    register: readRegister(parts),               // (c)
    phrase:   readPhrase(nBars, session.phraseUnit), // (d)
    motifs:   readMotifs(parts),                 // (e)
    density:  readDensity(parts, nBars),         // (f)
    // convenience: what roles are already present?
    has: role => parts.some(p=>p.role===role),
    partCount: parts.length,
  };
}

/* A readable text PRINTOUT of the perception — this is how a person (or the
   model) SEES what the program is hearing. The shared ears, made legible. */
function describePerception(P){
  const L=[];
  L.push(`LISTENING  ·  ${P.partCount} part(s): ${P.parts.map(p=>p.role).join(", ")||"(silence)"}`);
  L.push(`  key: ${T.NOTE[P.key.root]} ${P.key.scale}   phrase unit: ${P.phrase.unit} bars`);
  // harmony line
  const h=P.harmony.map(b=>b?`${b.rootName}${b.quality==="min"?"m":b.quality==="maj"?"":b.quality}${b.seventh}`:"·").join(" ");
  L.push(`  harmony implied: ${h}`);
  // register / space
  if(P.register.low!=null){
    L.push(`  register: ${T.nn(P.register.low)}–${T.nn(P.register.high)} occupied`);
    if(P.register.biggestSpace){ const s=P.register.biggestSpace;
      L.push(`  biggest SPACE: ${T.nn(s.from)}–${T.nn(s.to)} (${s.size}st${s.edge?", "+s.edge:""})`); }
  } else L.push(`  register: (nothing pitched yet)`);
  // rhythm
  const acc=P.rhythm.accents.filter(a=>a.strong).map(a=>a.step).join(",");
  L.push(`  groove accents on steps: [${acc}]   pulse: ${P.rhythm.pulse}`);
  // motifs
  if(P.motifs.length) P.motifs.forEach(m=>
    L.push(`  motif (${m.role}): intervals [${m.intervals.join(",")}] rhythm [${m.rhythm.join(",")}] ${m.contour}`));
  else L.push(`  motifs: (none yet)`);
  // density
  L.push(`  density/bar: [${P.density.normalized.map(x=>x.toFixed(1)).join(" ")}]  fullest bar ${P.density.busiest}`);
  return L.join("\n");
}

if(typeof module!=="undefined") module.exports={
  listen, describePerception, STEPS_PER_BAR,
  inferHarmony, readRhythm, readRegister, readPhrase, readMotifs, readDensity,
  soundingAt,
};
