"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE MELODY ENGINE  —  a VARIABLE ENSEMBLE, not "the lead."
   Handles everything pitched that isn't bass/drums/chords: one or more LEADS,
   COUNTER-lines, PADS, ARPs — any number, entering at different times.

   Grounded in:
   · project Melody file (10 tips): notes from chords → other chord tones →
     inversions → passing/neighbor/accented non-chord tones (resolve by step) →
     suspensions/anticipations/pedal tones → SEQUENCES (move a shape across the
     chords) → overall SHAPE/register arc → balance STEPS & LEAPS → keep RHYTHM
     independent of the chord changes → play with EXPECTATION.
   · project Melody_2 (form): sentence = 2-bar idea, repeat, CONTINUATION (more
     motion) → cadence. (period = idea / contrasting answer / return.)
   · project Melody_3: a melody IMPLIES harmony (leaps of 3rds spell chords;
     3 scale-steps imply the chord of that scale) — used when melody LEADS.
   · counterpoint research (Fux / Open Music Theory / davidhfriedman): keep
     voices within an octave; PREFER CONTRARY MOTION to keep lines independent;
     approach final by contrary step; propose-check-backtrack.
   · call & response (Toshi Clinch): the response needs SPACE after the call —
     "if there is no room, the countermelody doubles up… which is chaotic."
   ═══════════════════════════════════════════════════════════════════════════ */
const B = require("./02_engine_base.js");
const { T, pc, wpick, pick, clamp, HARD, SOFT } = B;
const L = require("./01_listening.js");
const SPB = 16;

/* the melody engine adds a VARIABLE set of voices. It decides the roster from
   the chart + what's already playing, then generates each voice reading the
   perception (harmony + the other pitched voices). */
function melodyEngine(chart, perception, rng){
  // read the harmony we must sing over. If nothing implies harmony yet, the
  // FIRST melodic voice LEADS and implies harmony itself (Melody_3).
  const harmonyKnown = perception && perception.harmony && perception.harmony.some(h=>h);
  const chords = harmonyKnown ? perception.harmony
                              : null;                    // will lead & imply

  // ── decide the ROSTER (how many voices, which kinds) ──
  const roster = decideRoster(chart, perception, rng);

  const parts = [];
  // if leading (no harmony to read), invent ONE hidden progression the whole
  // ensemble implies/sings over — so lead, counter, pad, arp all agree (else the
  // non-lead voices have no chords and were being silently dropped).
  const sharedChords = chords || impliedTargetHarmony(chart, rng);
  // we build voices one at a time, each reading the growing ensemble (so a 2nd
  // lead genuinely responds to the 1st — call & response, contrary motion).
  let working = perception ? perception.parts.slice() : [];
  for(const voice of roster){
    const localPerception = L.listen({ parts:working.slice(), nBars:chart.nBars,
                                       key:chart.key, phraseUnit:chart.phraseUnit });
    // pass the shared chords; flag whether the LEAD is implying harmony (cold)
    const part = buildVoice(voice, chart, localPerception, rng, sharedChords, chords===null);
    if(part && part.notes.length){ parts.push(part); working.push(part); }
  }
  // return a COMBINED part list; the pipeline treats each as its own track
  return parts;
}

/* ── ROSTER: a true COMBINATORIAL draw, not a one-of-each checklist. Any number
   of leads (duets), multiple arps (Glass-style swarms — each arp gets its own
   rate/direction so they interlock), counters, pads, and a rare second bass
   line ("lowline") dueling in the low-mid register. ── */
function decideRoster(chart, perception, rng){
  const present = new Set((perception?perception.parts:[]).map(p=>p.role));
  const unit = chart.phraseUnit || 8;
  const roster = [];
  roster.push({ kind:"lead", entry:0 });        // material from the top; the
                                               // arrangement decides when it enters
  // ensemble size: 1-6 voices, mid sizes favored
  const n = wpick(rng, [[1,2],[2,4],[3,4],[4,2],[5,1],[6,1]]);
  const POOL=[["lead2",2],["counter",3],["pad",2],["arp",3],["lowline",1]];
  const counts={};
  for(let i=1;i<n;i++){
    const kind=wpick(rng, POOL);
    counts[kind]=(counts[kind]||0)+1;
    const name = counts[kind]===1 ? kind : kind+counts[kind];   // arp, arp2, arp3…
    if(kind==="lead2" && counts[kind]>1) continue;              // at most one duet partner
    if(kind==="lowline" && counts[kind]>1) continue;            // one duel is enough
    const loop = chart.loopBars || unit;
    roster.push({ kind, name, entry: Math.min(pickEntrance(chart, rng, 0), loop) });
  }
  return roster;
}

// choose an entrance bar quantised to a phrase boundary at/after `earliest`
// (soft EDM rule: 8-bar default, 4 softer; occasional off-boundary deviation).
// Always leaves at least `minPlay` bars to actually play, so late voices aren't
// scheduled past the end of a short song (which would produce zero notes).
function pickEntrance(chart, rng, earliest){
  const unit = chart.phraseUnit || 8;
  const n = chart.nBars;
  const minPlay = Math.max(2, Math.floor(n/4));         // must have room to be heard
  const latest = Math.max(0, n - minPlay);
  // clamp the requested earliest so it never exceeds the latest usable entrance
  earliest = Math.min(earliest, latest);
  const options = [];
  for(let b=0; b<=latest; b++){
    if(b<earliest) continue;
    let w = SOFT.entranceWeight(b, unit);
    if(b===earliest) w *= 1.5;
    options.push([b, w]);
  }
  if(!options.length) return Math.min(earliest, latest);
  return wpick(rng, options);
}

/* ── build ONE voice, reading the harmony + the ensemble ── */
function buildVoice(voice, chart, perception, rng, chords, isLeadingHarmony){
  switch(baseKind(voice.kind)){
    case "pad":    return buildPad(voice, chart, chords, perception, rng);
    case "arp":    return buildArp(voice, chart, chords, perception, rng);
    case "counter":return buildCounter(voice, chart, chords, perception, rng);
    case "lowline":return buildLowline(voice, chart, chords, perception, rng);
    default:       return buildLead(voice, chart, chords, perception, rng, !!isLeadingHarmony);
  }
}

/* register bands per voice kind (corpus-grounded: lead centre ≈ C#5/73) */
const BAND = { lead:[67,84], lead2:[64,81], counter:[57,72], pad:[52,67], arp:[64,84], lowline:[41,55] };
const baseKind = k => k.replace(/[0-9]+$/,"");

/* ── LEAD: THE MOTIF GRAMMAR (from the reference analyses).
   A motif = a RHYTHM (durations in 16ths) + a MELODIC MOVEMENT (scale steps),
   e.g. Smoke on the Water A=4(ii)4, B=6(N), Final Countdown A=1(i)1(i)4.
   The melody is a STRUCTURE of motifs per loop — A+B+A+C — REPEATED every loop
   (music is repeated patterns), varied per the Rule of 3: rhythmic acceleration
   (split the last note), "a note taken out", and S (silence) leaving room for
   call & response. Pitches realize against the looping chords. ── */
/* GENERATIVE rhythm: 2-6 notes from a musical duration set, sum ≤ 16; the
   remainder is a tail rest — space is part of the motif. Replaces the old
   baked-in RPOOL lookup (a prime-directive violation). */
function genRhythm(rng){
  const DUR=[[1,1],[2,5],[3,3],[4,6],[6,2],[8,3]];
  const nWant=2+Math.floor(rng()*5);
  const out=[]; let sum=0;
  for(let i=0;i<nWant;i++){
    const d=wpick(rng,DUR);
    if(sum+d>16) break;
    out.push(d); sum+=d;
    if(sum>=14 && rng()<0.5) break;          // leave a tail rest sometimes
  }
  if(out.length<2){ out.length=0; out.push(4,4); }
  return out;
}
/* GENERATIVE contour: per-note movement — runs, arches, zigzags, and leaps
   that resolve by step (the Melody file: balance steps & leaps). */
function genContour(rng, n){
  const kind=wpick(rng,[["run",3],["arch",3],["zigzag",3],["leap",2]]);
  const dir=rng()<0.5?1:-1, out=[];
  for(let i=1;i<n;i++){
    if(kind==="run")      out.push(dir*pick(rng,[1,1,2]));
    else if(kind==="arch")out.push((i<n/2?dir:-dir)*pick(rng,[1,2]));
    else if(kind==="zigzag")out.push((i%2?dir:-dir)*pick(rng,[1,2]));
    else out.push(i===1 ? dir*pick(rng,[3,4]) : -dir*1);   // leap, then resolve by step
  }
  return out;
}

function buildLead(voice, chart, chords, perception, rng, implyHarmony){
  const { root, scale } = chart.key;
  const nBars = chart.nBars, loop = chart.loopBars || 8;
  const [LO,HI] = BAND[baseKind(voice.kind)] || BAND.lead;
  const entry = voice.entry||0;
  const notes=[];

  // build the song's motifs ONCE (rhythm sums ≤16; remainder is rest/space)
  const mkMotif=()=>{ const rhythm=genRhythm(rng);
    return { rhythm, moves: genContour(rng, rhythm.length) }; };
  // THE THEME is the lead's material: its question becomes motif A, its answer
  // becomes motif B (already contrary by construction — the Zelda law).
  const TH_ = chart._theme;
  const A = TH_ ? { rhythm:TH_.question.rhythm.slice(), moves:TH_.question.moves.slice() } : mkMotif();
  const B = TH_ ? { rhythm:TH_.answer.rhythm.slice(),   moves:TH_.answer.moves.slice()   } : mkMotif();
  const D=mkMotif();                                        // the DEPARTURE idea (Rule of 3)
  const Bsilent = rng()<0.35;                               // S: B is silence (call&response room)
  // structure per loop (one motif per bar): 8 → A B A C A B A C
  const STRUCT=[]; for(let i=0;i<loop;i++) STRUCT.push(i%4===1?"B":(i%4===3?"C":"A"));

  let prev=null;
  for(let bar=entry; bar<nBars; bar++){
    const lb=(bar-entry)%loop, loopIdx=Math.floor((bar-entry)/loop);
    const slot=STRUCT[lb];
    const chord=chords[bar % chords.length] || {root};
    const tones=chordToneMidis(chord, root, scale, LO, HI);
    if(slot==="B" && Bsilent){ prev=null; continue; }       // the S motif — real space
    // ── the DEVELOPMENT CYCLE (Rule of 3, complete): state · repeat · DEPART ·
    //    return-varied. On depart loops the SECOND HALF of the loop swaps A for
    //    the departure motif D ("start the same but go somewhere different"). ──
    const mode=["state","repeat","depart","vary"][loopIdx%4];
    const cycleIdx=Math.floor(loopIdx/4);
    let M = slot==="B" ? B : A;
    if(mode==="depart" && lb>=loop/2 && slot!=="B") M=D;    // the back half departs
    let rhythm=M.rhythm.slice();
    if(mode==="vary" && rhythm[rhythm.length-1]>=4){        // rhythmic acceleration (A2)
      const last=rhythm.pop(); rhythm.push(last/2, last/2);
    }
    const dropIdx = (mode==="vary" && rhythm.length>2) ? 1 : -1;   // "a note taken out"
    // realize: start on a chord tone near the previous pitch; move by the motif's
    // movement; strong beats snap to chord tones; C-slot ends long on a chord tone
    let m = nearestTone(prev!=null?prev:tones[Math.floor(tones.length/2)], tones);
    let step=0;
    rhythm.forEach((dur,k)=>{
      if(k===dropIdx){ step+=dur; return; }
      if(k>0){ m = T.scaleStep2(m, scale, root, (M.moves&&M.moves[k-1])||1); }
      if(step%4===0) m = nearestTone(m, tones);             // chord tone on the strong beat
      m = clamp(T.fold(m, LO, HI), LO, HI);
      const isCadence = (slot==="C" && k===rhythm.length-1);
      // returns slightly changed (Björk): cycle 2+ displaces one note by a 16th,
      // a different note each cycle — familiar, but never bit-exact again
      let st2=step;
      if(cycleIdx>0 && (mode==="state"||mode==="repeat")
         && k===(cycleIdx%rhythm.length) && step+1<16) st2=step+1;
      notes.push({bar, step:st2, midi:(isCadence?nearestTone(m,tones):m),
                  dur:(isCadence?16-st2:dur), vel: st2===0?.58:.48});
      prev=m; step+=dur;
      if(step>=16) return;
    });
  }
  return { name:(voice.name||voice.kind),
           role: baseKind(voice.kind)==="lead2" ? "lead" : baseKind(voice.kind), notes };
}

/* ── COUNTER: a fixed ANSWER motif in the lead's rest slots (call & response),
   the same every loop — a repeated pattern, not wandering. ── */
function buildCounter(voice, chart, chords, perception, rng){
  const { root, scale } = chart.key;
  const nBars=chart.nBars, loop=chart.loopBars||8;
  const [LO,HI]=BAND.counter;
  const entry=voice.entry||0;
  const lead=(perception.parts||[]).find(p=>p.role==="lead");
  // find the lead's quiet bars in ONE loop — those are the answer slots
  const slots=[];
  for(let lb=0; lb<loop; lb++){
    const busy = lead ? lead.notes.filter(n=>n.bar%loop===lb).length/ Math.max(1,Math.ceil(nBars/loop)) : 0;
    if(busy<1.5) slots.push(lb);
  }
  if(!slots.length) slots.push(loop-1);
  const answer={ rhythm: pick(rng,[[2,2,12],[4,4,8],[2,2,4,8]]),
                 move: wpick(rng,[[1,3],[-1,3],[2,2],[-2,2]]) };
  const notes=[];
  for(let bar=entry; bar<nBars; bar++){
    const lb=(bar-entry)%loop;
    if(!slots.includes(lb)) continue;
    const chord=chords[bar%chords.length]||{root};
    const tones=chordToneMidis(chord, root, scale, LO, HI);
    let m=nearestTone(tones[Math.floor(tones.length/2)], tones), step=0;
    answer.rhythm.forEach((dur,k)=>{
      if(k>0) m=T.scaleStep2(m, scale, root, answer.move);
      if(step%4===0) m=nearestTone(m,tones);
      m=clamp(T.fold(m,LO,HI),LO,HI);
      notes.push({bar, step, midi:m, dur, vel:.42});
      step+=dur;
    });
  }
  return { name:(voice.name||"counter"), role:"counter", notes };
}

/* ── PAD: sustained air. Holds chord tones, wide, low commitment. ── */
function buildPad(voice, chart, chords, perception, rng){
  const { root, scale } = chart.key;
  const [LO,HI] = BAND.pad;
  const entry = voice.entry||0;
  const notes=[];
  for(let bar=entry; bar<chart.nBars; bar++){
    const chord = chords[bar % chords.length] || {root};
    const tones = chordToneMidis(chord, root, scale, LO, HI);
    // hold 2-3 chord tones for the whole bar (sustained)
    const chosen = tones.slice(0, Math.min(3, tones.length));
    for(const m of chosen) notes.push({bar, step:0, midi:m, dur:16, vel:0.26});
  }
  return { name:(voice.name||"pad"), role:"pad", notes };
}

/* ── ARP: harmony in motion. Broken chord, steady subdivision. ── */
function buildArp(voice, chart, chords, perception, rng){
  const { root, scale } = chart.key;
  const [LO,HI] = BAND.arp;
  const entry = voice.entry||0;
  const notes=[];
  const stepN = pick(rng,[2,2,4]);                       // 16ths or 8ths
  const dir = pick(rng,["up","down","updown"]);
  for(let bar=entry; bar<chart.nBars; bar++){
    const chord = chords[bar % chords.length] || {root};
    let tones = chordToneMidis(chord, root, scale, LO, HI);
    let seq = tones.concat(tones.map(m=>m+12)).filter(m=>m<=HI);
    if(dir==="down") seq=seq.slice().reverse();
    else if(dir==="updown") seq=seq.concat(seq.slice(1,-1).reverse());
    let i=0;
    for(let s=0;s<SPB;s+=stepN){ notes.push({bar, step:s, midi:seq[i%seq.length], dur:stepN, vel:0.4}); i++; }
  }
  return { name:(voice.name||"arp"), role:"arp", notes };
}

/* ── LOWLINE: the dueling second bass — an off-beat answer in the low-mid
   register, chord-locked, loop-repeating (it duels the bass, not the lead). ── */
function buildLowline(voice, chart, chords, perception, rng){
  const { root, scale } = chart.key;
  const [LO,HI]=BAND.lowline;
  const nBars=chart.nBars, loop=chart.loopBars||8;
  const entry=voice.entry||0;
  const rhythm=pick(rng,[[2,6,10,14],[4,12],[2,8,10],[6,14]]);   // off the bass's downbeat
  const roles=rhythm.map(()=>wpick(rng,[["R",3],["5",3],["3rd",2]]));
  const notes=[];
  for(let bar=entry; bar<nBars; bar++){
    const chord=chords[bar%chords.length]||{root};
    const tones=chordToneMidis(chord, root, scale, LO, HI);
    rhythm.forEach((st,k)=>{
      let mm=tones[0];
      if(roles[k]==="5") mm=tones[Math.min(1,tones.length-1)];
      else if(roles[k]==="3rd") mm=tones[Math.min(2,tones.length-1)];
      notes.push({bar, step:st, midi:clamp(mm,LO,HI), dur:2, vel:.5});
    });
  }
  return { name:(voice.name||"lowline"), role:"lowline", notes };
}

/* ═══════════ melodic building blocks (the 10-tips vocabulary) ═══════════ */

// a 2-bar basic idea: a short contour of chord tones + a passing tone, with rhythm

// plan whether this phrase is sentence-like or period-like (Melody_2)

// render one bar according to its motif-role, over the given chord tones

// ensure the very last note approaches by step onto a chord tone (soft ending)

/* ═══════════ helpers ═══════════ */

// get chord-tone MIDIs for a perceived-or-generated chord, in a register band
function chordToneMidis(chord, root, scale, LO, HI){
  let pcs;
  if(chord.pcs) pcs = chord.pcs;                          // from the listening layer
  else {
    const deg = nearestDegreeLocal(chord.root!=null?chord.root:pc(root), root, scale);
    pcs = T.chordTones(scale, deg, chord.seventh?4:3, root).map(pc);
  }
  // realise those pitch-classes into the band
  const out=[];
  for(const p of pcs){ let m = Math.round(((LO+HI)/2)/12)*12 + p;
    while(m<LO) m+=12; while(m>HI) m-=12;
    out.push(m); }
  return [...new Set(out)].sort((a,b)=>a-b);
}
function nearestDegreeLocal(targetPc, root, scale){
  const a=T.semis(scale); let best=0,bd=99;
  a.forEach((off,i)=>{ const d=Math.min(((pc(root+off)-targetPc)+12)%12,((targetPc-pc(root+off))+12)%12);
    if(d<bd){bd=d;best=i;} }); return best;
}
function nearestTone(target, tones){
  let best=target, bd=1e9;
  for(const t of tones){ const p=pc(t), c=Math.round((target-p)/12)*12+p, d=Math.abs(c-target);
    if(d<bd){bd=d;best=c;} } return best;
}
function nearestByStep(leadNotes, step){
  let best=leadNotes[0].midi, bd=99;
  for(const n of leadNotes){ const d=Math.abs(n.step-step); if(d<bd){bd=d;best=n.midi;} }
  return best;
}
// choose a chord tone moving contrary to the lead's direction (Fux independence)
function chooseContrary(tones, prev, leadDir, LO, HI, scale, root){
  if(prev==null) return tones[Math.floor(tones.length/2)];
  const want = leadDir>0 ? -1 : leadDir<0 ? 1 : (Math.random()<0.5?1:-1);
  // step from prev in the contrary direction, then snap to a chord tone
  let m = T.scaleStep(prev, scale, root, want);
  m = nearestTone(m, tones);
  return clamp(T.fold(m, LO, HI), LO, HI);
}

// when the melody LEADS, invent a target harmony for it to IMPLY (Melody_3):
// a simple functional progression it will spell with leaps of 3rds / scale runs
function impliedTargetHarmony(chart, rng){
  const { root, scale } = chart.key;
  const roots = SOFT ? null : null;
  const degs = [0, pick(rng,[5,3]), pick(rng,[4,3]), 0];  // e.g. i - iv/VI - v/III - i
  return degs.map(d=>{ const rpc = pc(T.degToMidi(d, scale, root));
    return { root:rpc, pcs: T.chordTones(scale, d, 3, root).map(pc) }; });
}

module.exports = { melodyEngine, decideRoster, buildLead, buildCounter, buildPad, buildArp,
                   BAND, chordToneMidis };
