// Print OUR songs in exactly the format harvest_ensemble.py --print uses for real ones,
// so the two can be read side by side.  node _grid.js [seed] [nbars] [startbar]
const B=require('./run/engine_bundle.js'); const {conduct, composeSong, makeRng}=B;
const MAP={drums:"drums",bass:"bass",harmony:"chords",lead:"lead",answer:"counter",ornament:"counter"};
const ORDER=["lead","counter","chords","bass","drums"];
const NOTE=["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const seeds=(process.argv[2]||"7").split(",").map(Number);
const nbars=+(process.argv[3]||8);

for(const s of seeds){
  const ch=conduct(s); ch._seed=s; const so=composeSong(ch,makeRng(s));
  const on={};
  for(const p of so.parts){ const r=MAP[p.role]; if(!r) continue;
    for(const n of p.notes) ((on[r]=on[r]||{})[n.bar]=on[r][n.bar]||[]).push(n); }
  const roles=ORDER.filter(r=>on[r]);
  const lo=process.argv[4]!=null?+process.argv[4]:Math.floor(ch.nBars/3);
  // which section are we in
  const secOf=b=>{ const a=so.arrangement||so.sections||[];
    for(const x of a) if(b>=(x.startBar!=null?x.startBar:x.start) && b<(x.startBar!=null?x.startBar:x.start)+(x.bars||x.len||0)) return (x.fn||x.name||"?");
    return "?"; };
  console.log("\n=== seed "+s+"  "+ch.genre+"  key "+(ch.keyName||ch.key)+" "+(ch.mode||"")+"  focal "+ch.focal);
  console.log("      0.2.4.6.8.a.c.e.   parts sounding / onsets");
  for(let b=lo;b<lo+nbars && b<ch.nBars;b++){
    let tot=0, live=0; const rows=[];
    for(const r of roles){
      const cells=new Array(16).fill(".");
      const hs=on[r][b]||[];
      for(const n of hs) cells[n.step%16] = cells[n.step%16]!=="." ? "#"
        : (r==="drums" ? "x" : NOTE[((n.midi%12)+12)%12][0]);
      if(hs.length){live++;tot+=hs.length;}
      rows.push([r,cells.join(""),hs.length]);
    }
    console.log("  bar "+b+"   ["+secOf(b)+"]");
    for(const [r,line,n] of rows) console.log("  "+r.padEnd(8)+line+"  "+(n||"-"));
    console.log("  "+" ".repeat(8)+" ".repeat(16)+"  = "+tot+" onsets across "+live+" parts");
  }
}
