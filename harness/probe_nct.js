// MEASURE the unenforced HARD law: "non-chord tones resolve by step".
// Across 40 seeds, classify every melodic note vs the sounding chord and check resolution.
const B=require("./engine_bundle.js");
const {conduct,composeSong,makeRng,T}=B;
const pc=m=>((m%12)+12)%12;
const MEL=new Set(["lead","lead2","counter","arp","lowline"]);
let nctTotal=0, nctLeap=0, oorTotal=0, notes=0;
const perGenre={};
for(let s=1;s<=40;s++){
  const chart=conduct(s); const song=composeSong(chart, makeRng(s));
  const scale=new Set(T.semis(chart.key.scale).map(o=>pc(chart.key.root+o)));
  const harm=song.parts.find(p=>p.role==="harmony");
  // chord pitch-classes per bar (union of harmony pcs sounding in that bar)
  const chordByBar={};
  if(harm) for(const n of harm.notes){ (chordByBar[n.bar]=chordByBar[n.bar]||new Set()).add(pc(n.midi)); }
  for(const p of song.parts){
    if(!MEL.has(p.role)) continue;
    const ns=p.notes.slice().sort((a,b)=> a.bar-b.bar || a.step-b.step);
    for(let i=0;i<ns.length;i++){
      const n=ns[i]; notes++;
      const chord=chordByBar[n.bar];
      if(!chord||chord.size===0) continue;
      const inKey=scale.has(pc(n.midi));
      if(!inKey){ oorTotal++; continue; }
      if(chord.has(pc(n.midi))) continue;   // chord tone, fine
      // in-key non-chord tone: does it resolve by step to the next note?
      nctTotal++;
      const nx=ns[i+1];
      const resolves = nx && Math.abs(nx.midi-n.midi)<=2;
      if(!resolves){ nctLeap++; (perGenre[chart.genre]=perGenre[chart.genre]||[0,0]); perGenre[chart.genre][0]++; }
      else (perGenre[chart.genre]=perGenre[chart.genre]||[0,0]);
      if(perGenre[chart.genre]) perGenre[chart.genre][1]++;
    }
  }
}
console.log("melodic notes examined:", notes);
console.log("out-of-key melodic notes:", oorTotal, "("+(100*oorTotal/notes).toFixed(2)+"%)");
console.log("in-key NON-chord tones:", nctTotal, "("+(100*nctTotal/notes).toFixed(2)+"% of melodic notes)");
console.log("  of those, LEAP away unresolved (>2st):", nctLeap, "("+(nctTotal?(100*nctLeap/nctTotal).toFixed(1):0)+"% of NCTs)");
console.log("  => unresolved-NCT share of ALL melodic notes:", (100*nctLeap/notes).toFixed(2)+"%");
console.log("per-genre [unresolvedLeaps/totalNCTs]:");
for(const g of Object.keys(perGenre).sort()) console.log("   "+g+": "+perGenre[g][0]+"/"+perGenre[g][1]);
