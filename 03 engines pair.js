"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   FIRST PROVABLE PAIR
   · BASS ENGINE can START from nothing (just the chart) — walks a line from
     hard constraints (in-key, register, stepwise-ish motion) shaped by soft
     tendencies (root-motion strength, land on tonic-ish at phrase ends).
   · HARMONY ENGINE READS the listening layer — takes the bass's implied roots
     and builds chords whose roots FOLLOW the bassline, voiced tightly (hard
     voice-spacing), keeping common tones (soft).
   This proves the core idea: an engine reading what another already played and
   responding to it. We SEE it in the printout.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = require("./02_engine_base.js");
const { T, pc, makeRng, pick, wpick, clamp, HARD, SOFT } = B;
const L = require("./01_listening.js");
const SPB = 16;

/* ---- BASS ENGINE — A REPEATING LOOP, not a walk. The rhythm motif is FIXED
   for the whole song (reference: "the A and B motifs always stay in the same
   rhythm... kept interesting by changing key"); the pitches follow the chords.
   The loop repeats across the song, varied per the Rule of 3 (a note taken
   out, an octave pop) so the 3rd+ hearing is never identical. --------------- */
function bassEngine(chart, perception, rng){
  const { root, scale } = chart.key;
  const nBars = chart.nBars, loop = chart.loopBars || 8;
  const LO=36, HI=48;                                 // floor C2 — below that is mud
  const heardHarmony = perception && perception.harmony && perception.harmony.some(h=>h);

  // THE RHYTHM MOTIF — one per song, busier shapes favored (a busy line can
  // carry an intro alone; a 2-note-per-bar line cannot).
  // a bassline shape from the corpus: step positions plus intervals from its
  // own root, so it transposes into this song's key by construction
  let corpusBass=null;
  {
    const C=(typeof globalThis!=="undefined" && globalThis.IMPROV_CORPUS) ||
            (typeof IMPROV_CORPUS!=="undefined" ? IMPROV_CORPUS : null);
    if(C && C.basses && C.basses.length &&
       !(typeof globalThis!=="undefined" && globalThis.IMPROV_HARVEST) && rng()<0.45){
      corpusBass = C.basses[Math.floor(rng()*C.basses.length)];
    }
  }
  const rhythm=[0];                                  // GENERATED, downbeat-anchored
  { const nHits=1+wpick(rng,[[1,1],[2,3],[3,4],[4,3],[5,2]]);
    const cands=[[2,1],[3,1],[4,4],[6,2],[8,4],[10,2],[11,1],[12,4],[14,2]];
    while(rhythm.length<nHits && cands.length){
      const c=wpick(rng,cands);
      if(rhythm.every(x=>Math.abs(x-c)>=2)) rhythm.push(c);
      const ci=cands.findIndex(x=>x[0]===c); if(ci>=0)cands.splice(ci,1);
    }
    rhythm.sort((a,b)=>a-b); }
  if(corpusBass && corpusBass.rhythm.length>=2){
    rhythm.length=0;
    for(const st of corpusBass.rhythm) if(st>=0 && st<16) rhythm.push(st);
    if(rhythm[0]!==0) rhythm.unshift(0);
  }
  // per-hit pitch roles: Root, fifth, octave, scale approach — fixed shape, like the rhythm
  const shape = rhythm.map((_,k)=> k===0 ? "R" : wpick(rng,[["R",4],["5",3],["R8",2],["APP",2]]));

  // the LOOP's roots: read the harmony if it exists, else generate a loop progression
  let loopRoots=[];
  if(chart._sampleCycle && chart._sampleCycle.length){
    for(let b=0;b<loop;b++) loopRoots.push(chart._sampleCycle[b % chart._sampleCycle.length]);
  } else if(heardHarmony){
    if(!chart._heardCycle){
      if(!chart._progLen) chart._progLen = wpick(rng,[[4,6],[3,2],[2,1]]);
      chart._heardCycle=[];
      for(let i=0;i<chart._progLen;i++){ const h=perception.harmony[i];
        chart._heardCycle.push(h?h.root:root); }
    }
    for(let b=0;b<loop;b++) loopRoots.push(chart._heardCycle[b % chart._heardCycle.length]);
  } else {
    if(!chart._progLen) chart._progLen = wpick(rng,[[4,6],[3,2],[2,1]]);
    const prog = generateProgression({ key:chart.key, nBars:chart._progLen, phraseUnit:chart._progLen }, rng);
    for(let b=0;b<loop;b++) loopRoots.push(prog[b % prog.length]);       // the cycle fills the loop
  }

  // a stored ALTERNATE second-half shape for the DEPART loops (Rule of 3 option 2:
  // "start the same but go somewhere different halfway through")
  let altShape = rhythm.map((_,k)=> k===0 ? "R" : wpick(rng,[["5",3],["R8",3],["APP",3],["R",1]]));
  // HARD: a departure must actually depart — if the draw matched the original
  // shape, flip a mid element so the 3rd loop genuinely goes somewhere different
  if(altShape.join()===shape.join() && altShape.length>1){
    const k=1+Math.floor(rng()*(altShape.length-1));
    altShape[k] = shape[k]==="5" ? "R8" : "5";
  }
  const notes=[];
  for(let b=0;b<nBars;b++){
    const lb=b%loop, loopIdx=Math.floor(b/loop);
    const mode=["state","repeat","depart","vary"][loopIdx%4];   // the development cycle
    const cycleIdx=Math.floor(loopIdx/4);                        // which time around
    const rpc=loopRoots[lb];
    const base=T.fold(36+((rpc%12)+12)%12, LO, HI);
    const inBackHalf = lb >= loop/2;
    const useAlt = (mode==="depart" && inBackHalf);             // diverge the 2nd half
    rhythm.forEach((st0,k)=>{
      let st=st0;
      if(mode==="vary" && k===rhythm.length-1 && rng()<0.6) return;  // "a note taken out"
      let m=base;
      const sel=(useAlt?altShape:shape)[k];
      if(sel==="5")       m=T.fold(base+7, LO, HI);
      else if(sel==="R8") m=Math.min(HI, base+12);
      else if(sel==="APP")m=T.fold(T.scaleStep(base, scale, root, (k%2?-1:1)), LO, HI);
      if(mode==="vary" && k===1 && rng()<0.4) m=Math.min(HI, m+12); // octave pop
      // returns are slightly changed, and the CHANGE ITSELF differs per cycle
      // (odd cycles lift a hit an octave; even cycles nudge its timing) so no
      // two returns are ever bit-identical, even with a 2-hit rhythm
      if(cycleIdx>0 && (mode==="state"||mode==="repeat")
         && k===1+(cycleIdx%(Math.max(1,rhythm.length-1)))){
        const nxG=rhythm[k+1]!=null?rhythm[k+1]:16;
        if(cycleIdx%2===1){ const m2=Math.min(HI, m+12);
          if(m2!==m) m=m2;
          else if(st+2<nxG-1) st=st+1;
          else return;                                 // last resort: the note taken out
        } else {
          if(st+2<nxG-1) st=st+1+(((cycleIdx/2)|0)%2);
          else return;                                 // last resort: the note taken out
        }
      }
      const nx=rhythm[k+1]!=null?rhythm[k+1]:16;
      notes.push({bar:b, step:st, midi:m, dur:Math.max(2,nx-st), vel: st===0?.9:.7});
    });
  }
  return { name:"bass", role:"bass", notes };
}

/* ---- HARMONY ENGINE — READS the perception, follows the bass. ------------
   If something already played (bass/other), harmony FOLLOWS its implied roots.
   If harmony starts COLD (nothing to read), it GENERATES a progression from
   constraints — root motion by soft weight, a cadence at the phrase end. */
function harmonyEngine(chart, perception, rng){
  const { root, scale } = chart.key;
  const nBars = chart.nBars;
  // REGISTER: the chord block lives ABOVE the bass (bass is ~A1-C3 / 33-48).
  // Center near middle C so the bottom voice lands ~C3-A3. The old code used
  // root+24 (a PITCH CLASS + 24 = subsonic) — chords were BELOW the bass in
  // every song. Absolute register is now fixed and tested.
  const center = 62;
  const notes=[];
  let prevVoicing = null;

  const somethingPlayed = perception.parts.some(p=>p.role!=="drums" && p.notes.length);
  if(!chart._progLen) chart._progLen = wpick(rng,[[4,6],[3,2],[2,1]]);   // the 4-chord norm (soft)
  // IF A RECORD IS LOADED AND THE BAND IS FOLLOWING IT, its chord progression
  // is the chart — the sampled harmony leads and everyone plays under it.
  // a real chorale progression, if the conductor drew one: scale degrees, so
  // it realises into this song's key by the same path our own degrees do
  // a real progression from the corpus: degree plus quality. The degree gives
  // the root; the quality tells the voicer whether it is a seventh chord.
  const realProg = chart._realProg || null;
  const bachRoots = realProg
    ? realProg.map(x=>pc(T.degToMidi(x.d, scale, root)))
    : null;
  const coldRoots = bachRoots ? bachRoots.slice()
    : chart._sampleCycle && chart._sampleCycle.length
    ? chart._sampleCycle.slice()
    : (somethingPlayed ? null
       : generateProgression({ key:chart.key, nBars:chart._progLen, phraseUnit:chart._progLen }, rng));

  // ═══ THE STORED CHORD TEXTURE (the reference image, generated not copied) ═══
  // Created ONCE per song from randomness, then REPEATED every bar with minor
  // variation — this is the pattern the listener locks onto:
  //  · staggered onsets: most voices do NOT start together (random offsets)
  //  · outer voices SUSTAIN the bar
  //  · one inner voice carries a small MOTIF — it re-articulates in a repeating
  //    rhythm with neighbor-note movement, varied slightly every other phrase
  if(!chart._chordTexture){
    const onsetPool=[0,1,2,3,4,6];
    const offsets=[0];                                   // bottom voice anchors the beat
    for(let i=1;i<6;i++) offsets.push(pick(rng,onsetPool));
    const motifRhythm=[];                                // inner re-articulation steps
    const cands=[4,6,8,10,12,14];
    const nHits=2+Math.floor(rng()*2);                   // 2-3 re-hits per bar
    while(motifRhythm.length<nHits && cands.length){
      const c=cands.splice(Math.floor(rng()*cands.length),1)[0]; motifRhythm.push(c); }
    motifRhythm.sort((a,b)=>a-b);
    // the ALTERNATE inner rhythm for depart loops (leave-and-return, ABA)
    const altRhythm = motifRhythm.map(x=>Math.min(15, x+2));
    chart._chordTexture={ offsets, motifRhythm, altRhythm, seventh: rng()<0.4,
      motifDir: rng()<0.5?1:-1,                          // neighbor direction
      varyBar: 2+Math.floor(rng()*2) };                  // vary every 3rd-4th bar (Rule of 3)
  }
  const TEX=chart._chordTexture;

  // two chords a bar when the harmonic rhythm says so: each bar is split into
  // as many chord slots as fit, and the progression advances per SLOT.
  const beatsPerChord = chart._chordBeats || 4;
  const slotsPerBar = Math.max(1, Math.round(4/beatsPerChord));
  const stepsPerSlot = Math.round(16/slotsPerBar);
  let slotIdx = 0;
  for(let b=0;b<nBars;b++){
   for(let slot=0; slot<slotsPerBar; slot++, slotIdx++){
    let rootPc;
    if(coldRoots){ rootPc = coldRoots[slotIdx % coldRoots.length]; }   // advance per slot
    else {
      if(!chart._heardCycle){
        if(!chart._progLen) chart._progLen = wpick(rng,[[4,6],[3,2],[2,1]]);
        chart._heardCycle=[];
        for(let i=0;i<chart._progLen;i++){ const h=perception.harmony[i];
          chart._heardCycle.push(h?h.root:root); }
      }
      rootPc = chart._heardCycle[b % chart._heardCycle.length];
    }
    const deg = nearestDegree(rootPc, root, scale);
    const rq = realProg ? (realProg[slotIdx % realProg.length]||{}).q : null;
    const wantSeventh = rq ? (rq==="min7"||rq==="dom7"||rq==="maj7") : TEX.seventh;
    const tones = T.chordTones(scale, deg, wantSeventh?4:3, root);
    const voiced = chooseVoicing(tones, prevVoicing, center, rng);
    prevVoicing = voiced;

    const rel=stepsPerSlot, base0=slot*stepsPerSlot;
    const v=voiced.slice().sort((a,x)=>a-x);
    const motifVoice = Math.max(1, Math.floor(v.length/2));   // an inner voice
    v.forEach((midi,i)=>{
      const onset = TEX.offsets[i]!=null ? TEX.offsets[i] : 0;
      if(i===motifVoice && v.length>=3){
        // THE INNER MOTIF: state the tone, then re-articulate on the stored
        // rhythm with neighbor movement — repeated every bar, varied slightly
        // on the vary-bar (Rule of 3: don't let the 3rd+ hearing be identical).
        const loopIdxT=Math.floor(b/(chart.loopBars||8));
        const RH=(loopIdxT%4===2)?(TEX.altRhythm||TEX.motifRhythm):TEX.motifRhythm;  // depart loops shift the motif
        notes.push({bar:b, step:base0+Math.min(onset,rel-1), midi,
                    dur:Math.max(2,Math.min(rel-onset,(RH[0]||8)-onset)), vel:.4});
        RH.forEach((s,k)=>{
          const vary = (b % (TEX.varyBar+1) === TEX.varyBar);
          let m = midi;
          if(k%2===0){                                     // alternate: neighbor move
            m = T.scaleStep(midi, scale, root, vary ? -TEX.motifDir : TEX.motifDir);
            if(m<=v[i-1]||m>=v[i+1]) m = midi;             // stay INSIDE the chord
            // and never a semitone from a voice that is still sounding: tonal,
            // judging what sounds together, could not name those (C Eb A Bb).
            for(const other of v){
              if(other!==midi && Math.abs(m-other)===1){ m = midi; break; }
            }
          }
          // GUARD EVERY motif note, not just the neighbour-move branch: a
          // texture drawn from the corpus can re-articulate on steps where a
          // sustained voice sits a semitone away, and tonal cannot name those.
          for(const other of v){
            if(other!==m && Math.abs(m-other)===1){ m = midi; break; }
          }
          const nx = RH[k+1] || rel;
          if(s>=rel) return;
          notes.push({bar:b, step:base0+s, midi:m, dur:Math.max(2,Math.min(rel-s,nx-s)), vel:.33});
        });
      } else {
        // outer & other voices: staggered start, SUSTAIN to the bar end
        notes.push({bar:b, step:base0+Math.min(onset,rel-1), midi,
                    dur:Math.max(2,rel-Math.min(onset,rel-1)), vel:(i===0?.42:.36)});
      }
    });
   }
  }
  return { name:"harmony", role:"harmony", notes };
}

/* cold-start progression: choose a root per bar by soft root-motion weight,
   start on tonic, apply a soft cadence at the phrase end (research-grounded
   distribution: ~55% resolve to tonic, ~35% half/unresolved, ~8% deceptive). */
function generateProgression(chart, rng){
  const { root, scale } = chart.key;
  const nBars = chart.nBars;
  const degTones = T.semis(scale);
  const allowModal = /dorian|phrygian|lydian|mixolydian/.test(scale);
  const cadence = SOFT.cadenceKind(rng, allowModal);
  const roots=[];
  let prevPc = root;
  for(let b=0;b<nBars;b++){
    if(b===0){ roots.push(root); prevPc=root; continue; }
    const isLast = b===nBars-1, isPenult = b===nBars-2;
    // build weighted candidates by root-motion strength from previous
    let cands = degTones.map(off=>{
      const rpc = pc(root+off);
      return [rpc, SOFT.rootMotionWeight(prevPc, rpc)];
    });
    // soft cadence shaping at the phrase end
    if(isPenult){
      // predominant→dominant setup: favour IV/ii then V
      const domPc = pc(root+7), subPc = pc(root+5);
      cands = cands.map(([r,w])=>[r, r===subPc?w*3 : r===domPc?w*2 : w]);
    }
    if(isLast){
      const tonicPc=pc(root), domPc=pc(root+7), submediantPc=pc(root+ (/(minor|dorian|phrygian|aeolian)/.test(scale)?8:9));
      cands = cands.map(([r,w])=>{
        if(cadence==="authentic" && r===tonicPc) return [r, w*8];      // resolve home
        if(cadence==="half"      && r===domPc)   return [r, w*8];      // end unresolved on V
        if(cadence==="deceptive" && r===submediantPc) return [r, w*8]; // vi instead
        if(cadence==="none")     return [r, w];                        // modal: no pull
        return [r, w];
      });
    }
    const rpc = wpick(rng, cands);
    roots.push(rpc); prevPc=rpc;
  }
  return roots;
}

// nearest scale degree whose pitch-class matches (or is closest to) a target pc
function nearestDegree(targetPc, root, scale){
  const a=T.semis(scale); let best=0,bd=99;
  a.forEach((off,i)=>{ const d=Math.min(((pc(root+off)-targetPc)+12)%12, ((targetPc-pc(root+off))+12)%12);
    if(d<bd){bd=d;best=i;} });
  return best;
}

/* constraint-satisfaction voicing: try many placements, keep HARD-valid, pick by SOFT */
/* how far voices should move between chords. Measured from 6,910 motions in
   Bach's chorales: 77.3% are stepwise (a tone or less). Our chooser previously
   had no opinion at all, so voices could leap freely between chords. */
const VL_STEPWISE_TARGET = (function(){
  try{
    const bc = (typeof globalThis!=="undefined" && globalThis.BACH_CORPUS) ||
               (typeof require!=="undefined" ? require("./bach_corpus.json") : null);
    return (bc && bc.voiceLeading && bc.voiceLeading.stepwiseShare) || 0.77;
  }catch(e){ return 0.77; }
})();

function chooseVoicing(tones, prevVoicing, center, rng){
  const FLOOR = 50;                                     // HARD: above the bass register (bass tops at 48)
  const candidates=[];
  // generate close-position stacks anchored at a range of low notes
  for(let lowAnchor=center-12; lowAnchor<=center-2; lowAnchor++){
    const v=closeStack(tones, lowAnchor);
    if(v[0]<FLOOR) continue;                            // REJECT: below the bass's territory
    if(!HARD.voiceSpacing(v)) continue;                 // REJECT strays
    // REJECT semitone clusters. Tonal, used as an independent judge, could not
    // name 14% of our chords; every failure had two adjacent voices a semitone
    // apart in the upper structure (Ab C D Eb). A semitone is fine as a spread
    // extension, but adjacent it is a cluster, not a chord.
    let cluster=false;
    for(let i=1;i<v.length;i++) if(v[i]-v[i-1] === 1){ cluster=true; break; }
    if(cluster) continue;
    // REQUIRE THE THIRD. A voicing of root, fifth and seventh has no quality —
    // tonal cannot name it, and the ear cannot tell major from minor. This is
    // what the corpus textures exposed: with a seventh in play the stack could
    // drop the one note that says what the chord IS.
    if(tones.length >= 3){
      const thirdPc = pc(tones[1]);
      if(!v.some(m => pc(m) === thirdPc)) continue;
    }
    if(!HARD.isChord(v, tones)) continue;               // REJECT non-chords
    if(!HARD.spanOk(v, 16)) continue;                   // REJECT 2-octave spreads
    // SOFT score: prefer common tones with previous + top voice near center
    const common = SOFT.commonToneBonus(prevVoicing, tones);
    const topCloseness = -Math.abs(v[v.length-1]-(center+3));
    let motion=0;
    if(prevVoicing){ const n=Math.min(v.length,prevVoicing.length);
      for(let k=0;k<n;k++) motion -= Math.abs(v[v.length-1-k]-prevVoicing[prevVoicing.length-1-k]); }
    candidates.push([v, common*3 + topCloseness + motion*0.5]);
  }
  if(!candidates.length){ let f=closeStack(tones, center-6); while(f[0]<50)f=f.map(m=>m+12); return f; } // fallback obeys the floor
  // prefer the voicing whose voices move by step from the last chord, in the
  // proportion Bach actually used — smooth motion, not leaping blocks
  if(prevVoicing && prevVoicing.length){
    // candidates are [voicing, weight] pairs
    for(const cand of candidates){
      const v = cand[0];
      let stepwise=0, n=0;
      for(let i=0;i<Math.min(v.length, prevVoicing.length);i++){
        n++; if(Math.abs(v[i]-prevVoicing[i]) <= 2) stepwise++;
      }
      const share = n ? stepwise/n : 0;
      // reward landing near the measured share rather than maximising it:
      // all-stepwise would be as unlike Bach as all-leaps
      const bonus = 1 - Math.abs(share - VL_STEPWISE_TARGET);
      cand[1] = cand[1] * (0.5 + 1.6*Math.max(0, bonus));
    }
  }
  // choose among the top few by weight (soft randomness, not always the max)
  candidates.sort((a,b)=>b[1]-a[1]);
  const top=candidates.slice(0, Math.min(4,candidates.length));
  return wpick(rng, top.map((c,i)=>[c[0], top.length-i]));
}

// build a tight close-position chord stacking upward from a low anchor
function closeStack(tones, lowAnchor){
  const pcs=[...new Set(tones.map(pc))];
  const v=[]; 
  for(let i=0;i<pcs.length;i++){
    if(i===0){ let m=Math.round(lowAnchor/12)*12+pcs[0];
      while(m<lowAnchor-6)m+=12; while(m>lowAnchor+6)m-=12; v.push(m); }
    else { let m=Math.round(v[i-1]/12)*12+pcs[i];
      while(m<=v[i-1])m+=12; while(m>v[i-1]+12)m-=12; v.push(m); }
  }
  return v.sort((a,b)=>a-b);
}

module.exports = { bassEngine, harmonyEngine, closeStack, chooseVoicing };
