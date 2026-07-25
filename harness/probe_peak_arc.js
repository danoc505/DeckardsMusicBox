// MEASURE the peak-first / story-arc properties the user asked for: the peak is the
// destination everything builds to and away from, foreshadowed at the start, with a
// breakdown that BELONGS to the song (not a foreign intro). Grounded in the
// peak-first-song-structure design workflow (see docs/ARRANGEMENT.md).
//
// The deep dive found the ARC was already largely right (recurrence + the shared theme
// give foreshadowing and a late climax); the real defect was the breakdown carrying
// none of the song's motif. This probe is the regression gate for all of it.
const B = require("./engine_bundle.js");
const { conduct, composeSong, makeRng } = B;
const pc = m => ((m % 12) + 12) % 12;

let n=0, peakIsMax=0, dipBefore=0, breakdownHasTune=0, brkN=0;
let posSum=0, overlapSum=0, ovN=0;
for (let s=1; s<=40; s++){
  const c=conduct(s); const r=composeSong(c, makeRng(s)); const arr=r.arrangement||[];
  const mi=arr.findIndex(x=>x.event==="moment");
  const lead=r.parts.find(p=>p.role==="lead");
  // breakdown carries a melodic voice (the song's DNA), not just chords holding
  for(const sec of arr){ if(sec.event==="drop"||sec.role==="bridge"){ brkN++;
    const roles=new Set(sec.activeRoles||[]); if(roles.has("lead")||roles.has("counter")||roles.has("arp")) breakdownHasTune++; break; } }
  if(mi<1) continue; n++;
  const E=arr.map(x=>x.energy||(x.activeRoles||[]).length);
  if(E[mi]>=Math.max(...E)-0.01) peakIsMax++;                       // the peak is the global max = the destination
  if(E[mi-1] <= Math.max(3, E[mi]-2)) dipBefore++;                  // a breath/contrast right before the payoff
  posSum += arr[mi].startBar / c.nBars;                             // where the peak sits in the song
  if(lead){                                                          // does the intro foreshadow the peak motif?
    const setIn=new Set(), setPk=new Set(), intro=arr[0], peak=arr[mi];
    for(const nt of lead.notes){ if(nt.midi==null)continue;
      if(nt.bar>=intro.startBar&&nt.bar<intro.endBar) setIn.add(pc(nt.midi));
      if(nt.bar>=peak.startBar&&nt.bar<peak.endBar) setPk.add(pc(nt.midi)); }
    if(setIn.size&&setPk.size){ const inter=[...setIn].filter(x=>setPk.has(x)).length, uni=new Set([...setIn,...setPk]).size; overlapSum+=inter/uni; ovN++; }
  }
}
const p=(a,b)=>a+"/"+b;
console.log("peak-first / story-arc properties over 40 seeds:");
console.log("  breakdown carries the tune (not a foreign chord-hold):", p(breakdownHasTune,brkN));
console.log("  the peak IS the global energy max (the destination):   ", p(peakIsMax,n));
console.log("  a breath/dip immediately precedes the peak:            ", p(dipBefore,n));
console.log("  intro<->peak lead pitch-class overlap (foreshadow):    ", (overlapSum/ovN).toFixed(2));
console.log("  average peak position (fraction of song, ~0.62 ideal): ", (posSum/n).toFixed(2));
