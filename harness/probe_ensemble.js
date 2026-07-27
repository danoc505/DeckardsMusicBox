// OUR band, measured on exactly the axes harvest_ensemble.py measures Lakh's.
// Our roles mapped onto the corpus's: harmony->chords, answer+ornament->counter.
const B=require('./run/engine_bundle.js'); const {conduct, composeSong, makeRng}=B;
const SKIP={wise:1,ambient:1};
const MAP={drums:"drums",bass:"bass",harmony:"chords",lead:"lead",answer:"counter",ornament:"counter"};
const q=(a,f)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.floor(f*(a.length-1))];};
const med=a=>q(a,.5);

let agg={}, share={}, present={}, pairs={}, corr=[], songs=0;
const push=(k,v)=>((agg[k]=agg[k]||[]).push(v));

for(let s=1;s<=200 && songs<40;s++){
  const ch=conduct(s); if(SKIP[ch.genre]) continue; ch._seed=s; songs++;
  const so=composeSong(ch,makeRng(s));
  // role -> bar -> step -> count
  const on={};
  for(const p of so.parts){
    const r=MAP[p.role]; if(!r) continue;
    const o=on[r]=on[r]||{};
    for(const n of p.notes){ (o[n.bar]=o[n.bar]||{})[n.step]=((o[n.bar]||{})[n.step]||0)+1; }
  }
  const roles=Object.keys(on);
  const all=[...new Set(roles.flatMap(r=>Object.keys(on[r]).map(Number)))].sort((a,b)=>a-b);
  if(all.length<16) continue;
  const lo=all[Math.floor(all.length/6)], hi=all[all.length-1-Math.floor(all.length/6)];
  const bars=all.filter(b=>b>=lo&&b<=hi);
  const cnt=(r,b)=>Object.values(on[r][b]||{}).reduce((a,x)=>a+x,0);

  for(const r of roles){ present[r]=(present[r]||0)+1;
    share[r]=(share[r]||0)+bars.reduce((a,b)=>a+cnt(r,b),0); }

  push("band_per_bar", med(bars.map(b=>roles.reduce((a,r)=>a+cnt(r,b),0))));
  const pit=roles.filter(r=>r!=="drums");
  push("pitched_per_bar", med(bars.map(b=>pit.reduce((a,r)=>a+cnt(r,b),0))));
  push("parts_live", med(bars.map(b=>roles.filter(r=>cnt(r,b)).length)));
  push("parts_total", roles.length);
  push("parts_live_frac", med(bars.map(b=>roles.filter(r=>cnt(r,b)).length))/roles.length);

  for(const r of roles){
    push("rest:"+r, bars.filter(b=>!cnt(r,b)).length/bars.length);
    let run=0,best=0; for(const b of bars){ run=cnt(r,b)?0:run+1; best=Math.max(best,run); }
    push("restrun:"+r, best);
  }
  for(const a of pit) for(const c of pit){ if(a>=c) continue;
    let hit=0,sh=0;
    for(const b of bars){ const sa=Object.keys(on[a][b]||{}), sc=new Set(Object.keys(on[c][b]||{}));
      if(!sa.length||!sc.size) continue; hit+=sa.length; sh+=sa.filter(x=>sc.has(x)).length; }
    if(hit){ const k=a+"|"+c; pairs[k]=pairs[k]||[0,0]; pairs[k][0]+=sh; pairs[k][1]+=hit; }
  }
  if(on.lead&&on.chords){
    const x=bars.map(b=>cnt("lead",b)), y=bars.map(b=>cnt("chords",b));
    const mx=x.reduce((a,b)=>a+b,0)/x.length, my=y.reduce((a,b)=>a+b,0)/y.length;
    const num=x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0);
    const den=Math.sqrt(x.reduce((a,v)=>a+(v-mx)**2,0)*y.reduce((a,v)=>a+(v-my)**2,0));
    if(den>0) corr.push(num/den);
  }
  // what a chord strike looks like: notes per (bar,step) it lands on
  const hp=so.parts.find(p=>p.role==="harmony");
  if(hp){ const c={}; for(const n of hp.notes) c[n.bar+"/"+n.step]=(c[n.bar+"/"+n.step]||0)+1;
    const v=Object.values(c); push("chord_stack", v.reduce((a,x)=>a+x,0)/v.length);
    push("chord_dur", med(hp.notes.map(n=>n.dur||1))); }
  for(const [r,k] of [["lead","lead_dur"],["bass","bass_dur"]]){
    const p=so.parts.find(p=>p.role===r); if(p) push(k, med(p.notes.map(n=>n.dur||1)));
  }
}

const f=(k,d=1)=>agg[k]?med(agg[k]).toFixed(d):"-";
console.log("OURS: "+songs+" songs (wise/ambient skipped)\n");
console.log("HOW MUCH IS GOING ON AT ONCE (per bar, median across songs)");
console.log("  onsets from the whole band      5th "+q(agg.band_per_bar,.05).toFixed(1).padStart(5)
  +"   median "+f("band_per_bar").padStart(5)+"   95th "+q(agg.band_per_bar,.95).toFixed(1).padStart(5));
console.log("  onsets from the PITCHED parts   5th "+q(agg.pitched_per_bar,.05).toFixed(1).padStart(5)
  +"   median "+f("pitched_per_bar").padStart(5)+"   95th "+q(agg.pitched_per_bar,.95).toFixed(1).padStart(5));
console.log("  parts in the arrangement        median "+f("parts_total"));
console.log("  parts PLAYING in a given bar    median "+f("parts_live")
  +"   ("+(100*med(agg.parts_live_frac)).toFixed(0)+"% of the ones that exist)");
console.log("\nDOES ANYBODY SHUT UP (share of bars with no onset at all)");
for(const r of ["lead","counter","chords","bass","drums"]) if(agg["rest:"+r])
  console.log("  "+r.padEnd(8)+" rests in "+(100*med(agg["rest:"+r])).toFixed(0).padStart(4)
    +"% of bars   longest silence "+f("restrun:"+r,0)+" bars   (present in "+present[r]+" songs)");
console.log("\nSHARE OF ALL ONSETS, by role");
const tot=Object.values(share).reduce((a,b)=>a+b,0);
for(const [r,v] of Object.entries(share).sort((a,b)=>b[1]-a[1]))
  console.log("  "+r.padEnd(8)+" "+(100*v/tot).toFixed(1).padStart(5)+"%");
console.log("\nDO TWO PARTS LAND TOGETHER OR TAKE TURNS");
for(const [k,[s,h]] of Object.entries(pairs).sort((a,b)=>b[1][1]-a[1][1])){
  const [a,c]=k.split("|");
  console.log("  "+a.padEnd(8)+" vs "+c.padEnd(8)+" "+(100*s/h).toFixed(1).padStart(5)+"%");
}
if(corr.length){
  const m=corr.reduce((a,b)=>a+b,0)/corr.length;
  console.log("\nWHEN THE TUNE IS BUSY, THE COMP IS: correlation "+(m>=0?"+":"")+m.toFixed(3)
    +"   (median "+med(corr).toFixed(3)+", n="+corr.length+")");
  console.log("  "+(100*corr.filter(c=>c<0).length/corr.length).toFixed(0)+"% of songs have a NEGATIVE lead/chord density correlation");
}
console.log("\nWHAT EACH PART'S NOTES LOOK LIKE");
console.log("  chord part stacks               median "+f("chord_stack",2)+" notes per strike");
for(const r of ["chord","lead","bass"]) if(agg[r+"_dur"])
  console.log("  "+r.padEnd(8)+" note length (16ths)     median "+f(r+"_dur",0));
