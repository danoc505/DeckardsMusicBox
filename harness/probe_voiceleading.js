// Measure harmony voice-leading: fraction of voice motions <=2 semitones (a step)
// between consecutive DISTINCT chord voicings. Reconstructed from harmony notes.
const B=require("./engine_bundle.js");
const {conduct,composeSong,makeRng}=B;
let step=0, tot=0;
for(let s=1;s<=40;s++){
  const song=composeSong(conduct(s),makeRng(s));
  const h=song.parts.find(p=>p.role==="harmony"); if(!h)continue;
  // voicing per bar = sorted distinct midis sounding in that bar
  const byBar={};
  for(const n of h.notes){ if(n.midi==null)continue; (byBar[n.bar]||(byBar[n.bar]=new Set())).add(n.midi); }
  const bars=Object.keys(byBar).map(Number).sort((a,b)=>a-b);
  let prev=null;
  for(const b of bars){
    const v=[...byBar[b]].sort((a,b)=>a-b);
    if(prev){
      const key=a=>a.join(","); 
      if(key(v)!==key(prev)){                        // only when the voicing changes
        const n=Math.min(v.length,prev.length);
        for(let k=0;k<n;k++){ tot++; if(Math.abs(v[k]-prev[k])<=2) step++; }
      }
    }
    prev=v;
  }
}
console.log("voice-leading stepwise share: "+(100*step/tot).toFixed(1)+"%  ("+step+"/"+tot+" voice motions)  [Bach measured 77.3%]");
