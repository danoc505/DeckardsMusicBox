"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE SYMBOLIC FLIP — sampling as a method, applied to notes.

   The chopper takes a record, cuts it into pads and plays them back in a new
   order. This does the same to real music we are free to use — but at the NOTE
   level, where the two things that make audio sampling hard simply vanish:

     · key correction is exact. A phrase from a tune in G becomes a phrase in
       F# by moving scale degrees, not by detuning anything.
     · harmonic clash is fixable. A borrowed note that fights the chord under
       it can be nudged to the nearest chord tone; you cannot do that to a
       waveform without destroying it.

   So: take actual phrases from public-domain music, cut them into pads,
   rearrange the pads, transpose the whole thing into the song's key, and snap
   what lands on strong beats to the chord of the moment. Pastiche by
   construction — the source's contour and rhythm survive, the order and the
   harmony are ours.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = globalThis.__B || (typeof require!=="undefined" ? require("./02_engine_base.js") : null);
const { T, pc, pick, wpick, clamp } = B;

/* cut a phrase (rhythm + scale-step moves) into pads of 1-2 notes each */
function phraseToPads(phrase, padSize){
  const n = phrase.rhythm.length;
  const size = padSize || (n >= 6 ? 2 : 1);
  const pads = [];
  const mv = phrase.moves || [];
  for(let i = 0; i < n; i += size){
    const rhythm = phrase.rhythm.slice(i, i+size);
    if(!rhythm.length) continue;
    // Each pad remembers the move that led INTO it as well as the moves inside
    // it. Without the entry move a one-note pad carries no motion at all, and
    // a rearranged bank just repeats a pitch — which is what happened first.
    const entry = i > 0 ? (mv[i-1] || 0) : (mv[0] || 1);
    const moves = mv.slice(i, i + rhythm.length - 1);
    pads.push({ rhythm, moves, entry });
  }
  return pads;
}

/* rearrange pads into a new order — the flip. Keeps pad 0 first so the source
   is still recognisable, then walks, repeats and jumps like a played bank. */
function flipPads(pads, steps, rng){
  const n = pads.length;
  if(!n) return [];
  const order = [];
  let cur = 0;
  for(let i = 0; i < steps; i++){
    if(i === 0) cur = 0;
    else {
      const roll = rng();
      if(roll < 0.34) cur = (cur + 1) % n;          // carry on
      else if(roll < 0.55) { /* hold: repeat the pad */ }
      else if(roll < 0.72) cur = (cur + n - 1) % n; // step back
      else cur = Math.floor(rng()*n);               // jump
    }
    order.push(cur);
  }
  return order;
}

/* realise a flipped phrase into actual notes in THIS song's key and chords.
   `chordAt(bar)` returns the pitch classes sounding under that bar. */
function realiseFlip(pads, order, opts){
  const { scale, root, LO, HI, nBars, startBar, chordAt, rng } = opts;
  const notes = [];
  let bar = startBar || 0;
  let step = 0;
  // start somewhere sensible in the register, on a chord tone
  let cur = Math.round((LO + HI) / 2);
  cur = snapToScale(cur, scale, root);

  for(const idx of order){
    const pad = pads[idx];
    if(!pad) continue;
    for(let k = 0; k < pad.rhythm.length; k++){
      if(bar >= nBars) return notes;
      const dur = Math.max(1, Math.min(8, pad.rhythm[k]));
      // move by the source's own intervals — this is what keeps its contour
      if(k === 0){
        // the entry move, so a rearranged bank still travels
        let e = pad.entry || 0;
        if(e === 0) e = (rng && rng() < 0.5) ? 1 : -1;   // never stand still
        cur = T.scaleStep2(cur, scale, root, e);
      } else if(pad.moves[k-1] != null){
        cur = T.scaleStep2(cur, scale, root, pad.moves[k-1]);
      }
      cur = clamp(T.fold(cur, LO, HI), LO, HI);
      // HARMONIC CORRECTION: on a strong beat the note must belong to the
      // chord; off the beat it may pass through. This is the thing audio
      // sampling cannot do.
      let midi = cur;
      if(step % 4 === 0){
        const pcs = chordAt ? chordAt(bar) : null;
        if(pcs && pcs.length) midi = nearestWithPc(cur, pcs);
      }
      notes.push({ bar, step, midi, dur, vel: step===0 ? 0.58 : 0.46 });
      cur = midi;
      step += dur;
      while(step >= 16){ step -= 16; bar++; }
    }
  }
  return notes;
}

function snapToScale(m, scale, root){
  const semis = T.semis(scale).map(o=>pc(root+o));
  for(let d=0; d<=6; d++){
    if(semis.includes(pc(m+d))) return m+d;
    if(semis.includes(pc(m-d))) return m-d;
  }
  return m;
}
function nearestWithPc(target, pcs){
  let best = target, bd = 1e9;
  for(const p of pcs){
    const cand = Math.round((target - p)/12)*12 + p;
    for(const c of [cand-12, cand, cand+12]){
      const d = Math.abs(c - target);
      if(d < bd){ bd = d; best = c; }
    }
  }
  return best;
}

/* the whole move: pick a real phrase, chop it, flip it, put it in our key */
function flipRealPhrase(corpusPhrases, opts){
  const { rng, mode } = opts;
  if(!corpusPhrases || !corpusPhrases.length) return null;
  const want = (mode === "major" || mode === "lydian" || mode === "mixolydian") ? "major" : "minor";
  const pool = corpusPhrases.filter(p => p.m === want);
  const use = pool.length ? pool : corpusPhrases;
  const src = use[Math.floor(rng()*use.length)];
  const phrase = { rhythm: src.r.slice(), moves: src.v.slice() };
  const pads = phraseToPads(phrase, rng() < 0.5 ? 1 : 2);
  if(!pads.length) return null;
  const steps = Math.max(4, Math.min(16, pads.length * (rng() < 0.5 ? 2 : 3)));
  const order = flipPads(pads, steps, rng);
  return { notes: realiseFlip(pads, order, opts), pads: pads.length, order };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CROSS-SOURCE RECOMBINATION — the harmony of one piece, the rhythm of
   another, the melodic shape of a third.

   Chopping one phrase and rearranging it (above) only ever gives back what
   that phrase already contained. The stronger move is to separate the
   dimensions and take each from somewhere else: WHEN notes happen has nothing
   to do with WHICH WAY the pitch moves, so a rhythm from a folk jig can carry
   a contour from a Bach chorale over a progression from a jazz standard. None
   of the sources contained the result.

   This is only possible on notes. You cannot lift the rhythm of a recording
   away from its pitch — but a list of durations separates cleanly from a list
   of intervals, and both can then be corrected to fit a key and a chord.
   ═══════════════════════════════════════════════════════════════════════════ */

/* fit a contour to a rhythm of a different length: cycle it if short, trim if
   long. A shape does not have to be the same length as the rhythm carrying it. */
function fitContour(moves, needed){
  if(!moves.length) return new Array(needed).fill(1);
  const out = [];
  for(let i=0;i<needed;i++) out.push(moves[i % moves.length]);
  return out;
}

/* draw each dimension from a DIFFERENT source and put them together */
function recombine(dims, opts){
  const { rng, mode, scale, root, LO, HI, nBars, startBar, chordAt, want } = opts;
  if(!dims || !dims.rhythms || !dims.contours) return null;

  const modeOk = e => !e.modes || e.modes.any || e.modes[mode==="major"?"major":"minor"] ||
                      Object.keys(e.modes||{}).length===0;
  // a rhythm, characterised so a genre can ask for the density it wants
  let rPool = dims.rhythms;
  if(want && want.density != null){
    const scored = rPool.map(x=>({ x, d: Math.abs((x.c?x.c.d:0.5) - want.density) }));
    scored.sort((a,b)=>a.d-b.d);
    rPool = scored.slice(0, Math.max(24, Math.floor(scored.length*0.35))).map(s=>s.x);
  }
  const rEntry = rPool[Math.floor(rng()*rPool.length)];
  if(!rEntry) return null;
  const rhythm = rEntry.r.slice();

  // a contour from a DIFFERENT source where possible — that is the whole point.
  // If a voice ROLE is asked for, prefer lines that actually did that job:
  // a chorale bass line knows how a bass moves.
  let cPool = dims.contours.filter(c => c.s !== rEntry.s);
  if(want && want.role){
    const byRole = dims.contours.filter(c => c.role === want.role);
    if(byRole.length >= 8) cPool = byRole;
  }
  if(cPool.length < 8) cPool = dims.contours;
  if(want && want.leap != null){
    const scored = cPool.map(x=>({ x, d: Math.abs((x.c?x.c.lp:0.2) - want.leap) }));
    scored.sort((a,b)=>a.d-b.d);
    cPool = scored.slice(0, Math.max(24, Math.floor(scored.length*0.4))).map(s=>s.x);
  }
  const cEntry = cPool[Math.floor(rng()*cPool.length)];
  if(!cEntry) return null;
  const moves = fitContour(cEntry.v, Math.max(1, rhythm.length-1));

  // realise: the combined phrase, repeated to fill the span, corrected to key
  // and chord exactly as a flipped phrase is
  const pads = [{ rhythm, moves, entry: moves[0] || 1 }];
  const reps = Math.max(2, Math.ceil((nBars*16) / Math.max(4, rhythm.reduce((a,b)=>a+b,0))));
  const order = new Array(Math.min(reps, 24)).fill(0);
  const notes = realiseFlip(pads, order, { scale, root, LO, HI, nBars, startBar, chordAt, rng });
  return { notes, rhythmFrom: rEntry.s, contourFrom: cEntry.s,
           rhythm, moves };
}

if(typeof module!=="undefined") module.exports = {
  phraseToPads, flipPads, realiseFlip, flipRealPhrase, snapToScale, nearestWithPc,
  recombine, fitContour
};
