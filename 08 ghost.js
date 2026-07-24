"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE GHOST — the correcting critic. Runs after EVERY engine entry.
   It READS THE NOTES (the same ears as everyone: the note data itself) and
   CORRECTS real violations between engines, logging each correction so the
   loading screen can show the actual work, not narration:
     · register: pitched voices that sank into the bass's territory → lifted
     · bass ceiling: bass wandering above its register → brought down
     · out-of-key notes that do NOT resolve by step → snapped to the scale
       (approach tones that resolve by step are legal physics and left alone)
     · unison collisions: two parts hitting the SAME pitch at the SAME moment
       (masking) → the later voice displaced an octave
   Every correction mutates the actual parts and is counted. No violation type
   it enforces may survive a pass — that is tested.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = require("./02_engine_base.js");
const { T } = B;
const pcg = m => ((m%12)+12)%12;

const FLOORS = { harmony:50, lead:60, lead2:58, counter:55, pad:50, arp:58, lowline:41 };
const BASS_CEIL = 50;

function ghostPass(parts, chart){
  const corrections=[];
  const scaleSet = new Set(T.semis(chart.key.scale).map(o=>pcg(chart.key.root+o)));

  // 1) REGISTER: no pitched voice below its floor (the bass's territory)
  let n=0;
  for(const p of parts){ if(p.role==="drums"||p.role==="bass")continue;
    const floor=FLOORS[p.role]||50;
    for(const nt of p.notes){ if(nt.midi==null)continue;
      while(nt.midi<floor){ nt.midi+=12; n++; } } }
  if(n)corrections.push({kind:"register lift", count:n});

  // 2) BASS CEILING: the bass stays low
  n=0;
  for(const p of parts){ if(p.role!=="bass")continue;
    for(const nt of p.notes){ if(nt.midi==null)continue;
      while(nt.midi>BASS_CEIL){ nt.midi-=12; n++; } } }
  if(n)corrections.push({kind:"bass ceiling", count:n});

  // 3) OUT-OF-KEY notes that don't resolve by step → snap to the nearest scale
  //    tone. (A non-scale tone stepping out is a legal approach tone — physics.)
  n=0;
  for(const p of parts){ if(p.role==="drums")continue;
    const ns=p.notes.filter(x=>x.midi!=null)
      .sort((a,b)=>(a.bar*16+a.step)-(b.bar*16+b.step));
    for(let i=0;i<ns.length;i++){ const nt=ns[i];
      if(scaleSet.has(pcg(nt.midi)))continue;
      const nxt=ns[i+1];
      const resolves = nxt && Math.abs(nxt.midi-nt.midi)<=2;
      if(!resolves){
        let best=nt.midi, bd=99;
        for(let d=-2;d<=2;d++) if(scaleSet.has(pcg(nt.midi+d)) && Math.abs(d)<bd){ bd=Math.abs(d); best=nt.midi+d; }
        if(best!==nt.midi){ nt.midi=best; n++; }
      } } }
  if(n)corrections.push({kind:"out-of-key snap", count:n});

  // 4) UNISON COLLISIONS: same pitch, same absolute moment, different parts →
  //    the later voice is displaced up an octave (independence, no masking)
  n=0; let dropped=0;
  const seen={};
  // HARMONY and BASS claim their pitches first — their voicings are structural
  // and must not be torn apart; melodic voices are the ones that move or get cut.
  const orderP=parts.slice().sort((a,b)=>{
    const w=r=>r==="harmony"?0:r==="bass"?1:2; return w(a.role)-w(b.role); });
  for(const p of orderP){ if(p.role==="drums")continue;
    const structural=(p.role==="harmony"||p.role==="bass");
    if(structural){ for(const nt of p.notes){ if(nt.midi==null)continue;
        seen[(nt.bar*16+nt.step)+":"+nt.midi]=p.name; } continue; }
    for(const nt of p.notes){ if(nt.midi==null)continue;
      let k=(nt.bar*16+nt.step)+":"+nt.midi, tries=0;
      while(seen[k] && seen[k]!==p.name && tries<3){ nt.midi+=12; tries++;
        k=(nt.bar*16+nt.step)+":"+nt.midi; }
      if(seen[k] && seen[k]!==p.name){ nt._drop=true; dropped++; }   // true duplicate: cut it
      else { seen[k]=p.name; if(tries)n++; } } }
  for(const p of orderP){ if(p.role==="drums")continue;
    p.notes=p.notes.filter(nt=>!nt._drop); }
  if(n)corrections.push({kind:"collision", count:n});
  if(dropped)corrections.push({kind:"masked-note cut", count:dropped});

  return corrections;
}

if(typeof module!=="undefined") module.exports = { ghostPass, FLOORS };
