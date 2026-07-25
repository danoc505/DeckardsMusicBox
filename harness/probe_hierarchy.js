// Is there a LEADER? Measure the prominence hierarchy the mix actually has today.
// For each role, average onset velocity and register centre, across 40 seeds. The
// research says: ONE foreground leader (melody), everyone else ranked below it
// (melody-dominated homophony). If the lead is not clearly on top in level and/or
// the mid voices sit at the same level, there is no leader -- just a flat stack.
const B=require("./engine_bundle.js");
const {conduct,composeSong,makeRng}=B;
const acc={};
for(let s=1;s<=40;s++){
  const song=composeSong(conduct(s),makeRng(s));
  for(const p of song.parts){
    if(p.role==="drums") continue;
    const a=acc[p.role]||(acc[p.role]={n:0,vel:0,midi:0,songs:new Set()});
    for(const nt of p.notes){ if(nt.midi==null)continue; a.n++; a.vel+=(nt.vel||0); a.midi+=nt.midi; }
    if(p.notes.length) a.songs.add(s);
  }
}
const order=["lead","lead2","counter","arp","harmony","pad","bass"];
console.log("role      avgVel  avgMidi  songs   notes");
for(const r of order){ const a=acc[r]; if(!a)continue;
  console.log(r.padEnd(9), (a.vel/a.n).toFixed(3).padStart(6),
    (a.midi/a.n).toFixed(1).padStart(8), String(a.songs.size).padStart(6), String(a.n).padStart(7)); }
// leader check: is the lead's avg velocity the highest among pitched melodic voices?
const mel=["lead","lead2","counter","arp"].map(r=>acc[r]?[r,acc[r].vel/acc[r].n]:null).filter(Boolean);
mel.sort((a,b)=>b[1]-a[1]);
console.log("\nloudest pitched melodic voice:", mel[0][0], "("+mel[0][1].toFixed(3)+")",
            mel[0][0]==="lead"?"<- lead leads (good)":"<- LEAD IS NOT ON TOP");
