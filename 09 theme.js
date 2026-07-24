"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE THEME  —  the song's protagonist. One motif, GENERATED per song, then
   TRANSFORMED as the story unfolds so every section shares a character.

   Grounded in:
   · project Theme file (Zelda main theme analysis): "each phrase takes the last
     piece of the melody and adds something to it or twists it in a new way" —
     step-by-step development, "without ever repeating an idea or figure
     exactly". Named moves in that analysis: flip the direction, fill the space
     with a scale run, swap the scale (major→minor), swap the rhythm (16ths→
     triplets), add a TURN that delays resolution to beat two (a surprise), and
     SEQUENCE — "taking a melodic idea and moving it down a scale in steps".
     Also: set up an expectation with two bars of sequence, then sucker-punch.
   · project Zelda file (ocarina melodies): melodies are a repeated short motif
     (a QUESTION) plus a longer ANSWER, and the answer moves CONTRARY to the
     question's trajectory — "questions that feature an upward trajectory
     resolve by falling back down, and the questions that trend downward are
     answered by figures that move up". Upward motion = energy/tension;
     downward = comfort/finality.
   · web research (Liszt/Berlioz/Wagner/Williams thematic transformation): the
     canonical operator set is permutation (transposition, inversion,
     retrograde), augmentation, diminution, fragmentation, and sequence.

   NOTHING is baked in: the theme itself is generated under constraints, and
   which transformation a chapter uses is weighted by what that chapter means
   (a climax wants augmentation/fortissimo; a drop wants fragmentation), never
   fixed. A different seed yields a different theme and a different journey.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = globalThis.__B || (typeof require!=="undefined" ? require("./02_engine_base.js") : null);
const { T, pc, pick, wpick, clamp } = B;

/* ── GENERATE THE THEME: a question motif + its answering motif. ──
   The question is a short rhythmic cell with a directional contour; the answer
   is longer and moves CONTRARY to it (the Zelda question/answer law). */
function makeTheme(rng){
  // the QUESTION: short, memorable — 2-4 notes (the ocarina melodies are built
  // from repeated three-note motifs "much easier to remember")
  const qLen = 2 + Math.floor(rng()*3);
  const qRhythm = genCell(rng, qLen, 8);
  const qDir = rng()<0.5 ? 1 : -1;                     // up = energy, down = comfort
  const qMoves = [];
  for(let i=1;i<qLen;i++){
    // mostly steps with an occasional dramatic leap (the Zelda pool favours the
    // octave and the tritone as attention-grabbers; here: 3rds/5ths)
    qMoves.push(qDir * wpick(rng, [[1,4],[2,3],[3,2],[4,1]]));
  }
  // the ANSWER: longer, contrary trajectory, resolving
  const aLen = qLen + 1 + Math.floor(rng()*2);
  const aRhythm = genCell(rng, aLen, 16);
  const aMoves = [];
  for(let i=1;i<aLen;i++){
    // contrary to the question overall, with a step-resolution at the end
    const last = (i===aLen-1);
    aMoves.push(last ? -qDir : (-qDir) * wpick(rng, [[1,5],[2,3],[3,1]]));
  }
  return {
    question: { rhythm:qRhythm, moves:qMoves, dir:qDir },
    answer:   { rhythm:aRhythm, moves:aMoves, dir:-qDir },
    // a stored ornament: the "turn" from the Theme file — up a step then back
    // down, which delays the resolution and surprises the ear
    turn: rng()<0.6,
  };
}

/* a rhythmic cell: n durations in 16ths, summing to at most `span`, with the
   remainder left as space. Generated, not chosen from a list. */
function genCell(rng, n, span){
  const DUR=[[1,1],[2,4],[3,2],[4,5],[6,2],[8,2]];
  const out=[]; let sum=0;
  for(let i=0;i<n;i++){
    const d=wpick(rng,DUR);
    if(sum+d>span) break;
    out.push(d); sum+=d;
  }
  while(out.length<2){ out.push(4); }
  return out;
}

/* ═══════════ THE TRANSFORMATIONS (the canonical operator set) ═══════════ */

// SEQUENCE — restate the motif shifted by `steps` scale degrees. The classical
// move; the Zelda theme walks its figure down the minor scale in steps.
function sequence(motif, steps){
  return { ...motif, transpose:(motif.transpose||0)+steps };
}
// INVERSION — flip the contour; ascending intervals become descending.
function inversion(motif){
  return { ...motif, moves: motif.moves.map(m=>-m), dir:-(motif.dir||1) };
}
// RETROGRADE — state it backwards in time.
function retrograde(motif){
  return { ...motif, rhythm: motif.rhythm.slice().reverse(),
                     moves: motif.moves.slice().reverse().map(m=>-m) };
}
// AUGMENTATION — lengthen the note values (slower, weightier: the climax move).
function augmentation(motif){
  return { ...motif, rhythm: motif.rhythm.map(d=>Math.min(16, d*2)) };
}
// DIMINUTION — shorten them (faster, more urgent; "supports intensified
// excitement that can lead up to a climax").
function diminution(motif){
  return { ...motif, rhythm: motif.rhythm.map(d=>Math.max(1, Math.round(d/2))) };
}
// FRAGMENTATION — keep only a piece of the idea (the drop: the theme reduced to
// its bones, still recognisable).
function fragmentation(motif, rng){
  const keep = Math.max(2, Math.ceil(motif.rhythm.length/2));
  return { ...motif, rhythm: motif.rhythm.slice(0,keep),
                     moves: motif.moves.slice(0,Math.max(1,keep-1)) };
}
// ORNAMENT — the Theme file's "turn": add a step up and back, which pushes the
// resolution off the downbeat. A small surprise, not a new idea.
function ornament(motif){
  const r=motif.rhythm.slice(), m=motif.moves.slice();
  if(r.length<2) return motif;
  const last=r.pop();
  if(last>=2){ r.push(Math.ceil(last/2), Math.floor(last/2)); m.push(-(m[m.length-1]||1)); }
  else r.push(last);
  return { ...motif, rhythm:r, moves:m };
}

const OPS = { sequence, inversion, retrograde, augmentation, diminution, fragmentation, ornament };

/* ── WHICH TRANSFORMATION FOR THIS CHAPTER — weighted by what the chapter
   MEANS in the story, never fixed. The story engine's events are:
   open · build · peak · drop · rebuild · moment · out ── */
function transformFor(event, motif, rng, cycleIdx){
  switch(event){
    case "open":                                   // state the theme plainly
      return { motif, label:"stated" };
    case "build": {                                // urgency: diminution or sequence up
      const op = wpick(rng, [["diminution",3],["sequence",3],["ornament",2]]);
      const m = op==="sequence" ? sequence(motif, pick(rng,[1,2])) : OPS[op](motif, rng);
      return { motif:m, label:op };
    }
    case "peak": {                                 // vary without losing the thread
      const op = wpick(rng, [["ornament",3],["sequence",3],["inversion",2]]);
      const m = op==="sequence" ? sequence(motif, pick(rng,[-1,1,2])) : OPS[op](motif, rng);
      return { motif:m, label:op };
    }
    case "drop":                                   // reduced to its bones
      return { motif: fragmentation(motif, rng), label:"fragmentation" };
    case "rebuild": {                              // climbing back: sequence upward
      return { motif: sequence(motif, pick(rng,[1,2,3])), label:"sequence up" };
    }
    case "moment":                                 // THE PAYOFF: broad and heroic
      return { motif: augmentation(motif), label:"augmentation" };
    case "out":                                    // farewell: inverted/settling
      return { motif: rng()<0.5 ? inversion(motif) : fragmentation(motif, rng),
               label:"closing" };
    default:
      return { motif, label:"stated" };
  }
}

/* realise a motif into notes at a given bar, over given chord tones.
   `anchor` is the previous pitch (for continuity); returns {notes, last}. */
function realise(motif, bar, tones, scale, root, LO, HI, anchor, startStep, velBase, T_, nearestTone){
  const notes=[];
  let m = nearestTone(anchor!=null?anchor:tones[Math.floor(tones.length/2)], tones);
  if(motif.transpose) m = T_.scaleStep2(m, scale, root, motif.transpose);
  let step = startStep||0;
  motif.rhythm.forEach((dur,k)=>{
    if(k>0) m = T_.scaleStep2(m, scale, root, (motif.moves&&motif.moves[k-1])||1);
    if(step%4===0) m = nearestTone(m, tones);          // chord tone on strong beats
    m = clamp(T_.fold(m, LO, HI), LO, HI);
    if(step>=16) return;
    notes.push({ bar, step, midi:m, dur:Math.min(dur,16-step),
                 vel:(step===0?velBase:velBase*0.85) });
    step += dur;
  });
  return { notes, last:m };
}


/* ═══════════════════════════════════════════════════════════════════════════
   THE DEVELOPMENT PASS — the story transforms the theme.
   Runs after the arrangement is known: for each section, the chapter's meaning
   selects a transformation, and it is applied to the LEAD's notes in that
   section. This is what makes the sections share a protagonist — "each phrase
   takes the last piece of the melody and twists it in a new way".
   Operations act on the note list, so they compose with whatever the engine
   generated; pitches are snapped back into the key afterwards.
   ═══════════════════════════════════════════════════════════════════════════ */
function developTheme(parts, arrangement, chart, rng){
  const leads = parts.filter(p=>p.role==="lead");
  if(!leads.length) return [];
  const scaleSemis = T.semis(chart.key.scale).map(o=>pc(chart.key.root+o));
  const log=[];
  // THE RULE OF 3 COUNTS HEARINGS OF THE LOOP, not sections: the theme is
  // stated and reinforced for two full loops from the lead's entry, and only
  // then developed. (Sections can be 4 bars — the intro — so counting sections
  // would cut a transformation into the middle of a loop.)
  const loopBars = chart.loopBars || 8;
  const leadEntry = Math.min(...leads.map(l=> l.notes.length ? Math.min(...l.notes.map(n=>n.bar)) : 0));
  // Two statements is the ideal (state + reinforce). If the lead entered late
  // there may not be room for two before the song ends, so the count drops to
  // one rather than letting a song pass with no development at all — the
  // statement stays LOOP-ALIGNED either way so repetition is never cut mid-loop.
  // Two statements, always: the Rule of 3 says play it, repeat it ONCE, and
  // only then depart. Shortening that to one statement would break the law the
  // whole program is built on, so the fix for "no room to develop" belongs in
  // the arrangement (the lead entering earlier), not here.
  const developFrom = leadEntry + 2*loopBars;
  for(const sec of arrangement){
    // the chapter chooses the transformation (weighted by meaning, not fixed)
    // THE RULE OF 3 AT SONG SCALE: state it, reinforce it, THEN develop. The
    // first two sections carry the theme unchanged so the ear can learn it —
    // transformation begins only once it has been heard twice.
    if(sec.endBar<=developFrom){ log.push({section:sec.name, event:sec.event, op:"stated"}); continue; }
    const choice = transformFor(sec.event, {rhythm:[4],moves:[]}, rng, 0);
    const op = choice.label;
    if(op==="stated"){ log.push({section:sec.name, event:sec.event, op:"stated"}); continue; }
    // "start the same but go somewhere different halfway through": gradual
    // chapters transform only the BACK HALF; the dramatic chapters (drop,
    // rebuild, moment, out) recast the whole section.
    const wholeSection = ["fragmentation","sequence up","augmentation","closing"].includes(op);
    let from = wholeSection ? sec.startBar
                            : sec.startBar + Math.floor((sec.endBar-sec.startBar)/2);
    from = Math.max(from, developFrom);            // never reach back into the statement
    for(const lead of leads){
      for(let bar=from; bar<sec.endBar; bar++){
        const inBar = lead.notes.filter(n=>n.bar===bar).sort((a,b)=>a.step-b.step);
        if(inBar.length<2) continue;
        applyOp(op, inBar, lead, bar, scaleSemis, rng);
      }
    }
    log.push({section:sec.name, event:sec.event, op});
  }
  return log;
}

/* the operators, acting on one bar's worth of notes (in place on the part) */
function applyOp(op, inBar, part, bar, scaleSemis, rng){
  const snap = m => {
    for(let d=0; d<=2; d++){
      if(scaleSemis.includes(pc(m+d))) return m+d;
      if(scaleSemis.includes(pc(m-d))) return m-d;
    }
    return m;
  };
  if(op==="augmentation"){
    // lengthen: the theme broadens — every other note, doubled in length
    const keep = inBar.filter((_,i)=>i%2===0);
    const drop = inBar.filter((_,i)=>i%2===1);
    part.notes = part.notes.filter(n=>!drop.includes(n));
    keep.forEach((n,i)=>{
      const next = keep[i+1];
      n.dur = Math.max(2, (next? next.step : 16) - n.step);
      n.vel = Math.min(1, n.vel*1.12);                 // broad and heroic
    });
  } else if(op==="diminution"){
    // shorten: urgency — halve durations and pull the tail forward
    inBar.forEach(n=>{ n.dur=Math.max(1, Math.round(n.dur/2)); });
    inBar.forEach((n,i)=>{ if(i>0){ const prev=inBar[i-1];
      n.step = Math.min(15, prev.step + prev.dur); } });
  } else if(op==="inversion"){
    // mirror the contour around the bar's first pitch
    const pivot = inBar[0].midi;
    inBar.forEach((n,i)=>{ if(i>0) n.midi = snap(2*pivot - n.midi); });
  } else if(op==="retrograde"){
    // reverse the pitch order, keep the rhythm (the shape crashes inward)
    const pitches = inBar.map(n=>n.midi).reverse();
    inBar.forEach((n,i)=>{ n.midi = pitches[i]; });
  } else if(op==="fragmentation"){
    // reduce to its bones: keep the opening cell, leave the rest as space
    const keep = Math.max(1, Math.ceil(inBar.length/2));
    const drop = inBar.slice(keep);
    part.notes = part.notes.filter(n=>!drop.includes(n));
  } else if(op==="sequence" || op==="sequence up"){
    // restate the whole bar shifted through the scale (the classical move)
    const steps = (op==="sequence up") ? 2 : (rng()<0.5 ? 2 : -2);
    inBar.forEach(n=>{ n.midi = snap(n.midi + steps); });
  } else if(op==="ornament"){
    // the TURN: split the last note, stepping away and back — the resolution
    // arrives late, which is the surprise the Theme file singles out
    const last = inBar[inBar.length-1];
    if(last.dur>=2){
      const half = Math.floor(last.dur/2);
      last.dur = half;
      const away = snap(last.midi + (rng()<0.5?1:-1)*2);
      part.notes.push({ bar, step: Math.min(15,last.step+half), midi: away,
                        dur: Math.max(1,last.dur), vel: last.vel*0.9 });
    }
  } else if(op==="closing"){
    // settle: the final statement drifts downward (downward = final)
    inBar.forEach((n,i)=>{ if(i>0) n.midi = snap(n.midi-2); n.vel*=0.9; });
  }
}

if(typeof module!=="undefined") module.exports = {
  makeTheme, transformFor, realise, developTheme, OPS,
  sequence, inversion, retrograde, augmentation, diminution, fragmentation, ornament
};
