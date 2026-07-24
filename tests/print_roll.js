/* Print a song's actual notes as a readable roll — the note reader IS the ears.
   Statistics say "96% in key"; only the roll says whether it is music. */
globalThis.__B=require("./02_engine_base.js");
const B=require("./02_engine_base.js");
const {conduct}=require("./07_conductor.js");
const {composeSong}=require("./04_pipeline.js");
const NOTE=["C ","C#","D ","D#","E ","F ","F#","G ","G#","A ","A#","B "];
const nn=m=>NOTE[((m%12)+12)%12].trim()+(Math.floor(m/12)-1);

const seed=parseInt(process.argv[2]||"11",10);
const bars=parseInt(process.argv[3]||"8",10);
const chart=conduct(seed);
const song=composeSong(chart,B.makeRng(seed));
console.log("═".repeat(78));
console.log(chart.genre+"  "+nn(chart.key.root+60).replace(/[0-9]/g,"")+" "+chart.key.scale+
            "  "+chart.tempo+"bpm  "+chart.form+"  "+chart.nBars+" bars");
console.log("story: "+song.arrangement.map(s=>s.event).join(" > "));
console.log("theme: "+(song.themeLog||[]).map(l=>l.op).join(" > "));
console.log("═".repeat(78));

const secAt=b=>song.arrangement.find(s=>b>=s.startBar&&b<s.endBar);
for(const p of song.parts){
  const entry=(song.entries||{})[p.name]??0;
  console.log("\n── "+p.name.toUpperCase()+" ("+p.role+")  enters bar "+(entry+1)+
              "  "+p.notes.length+" notes");
  for(let bar=0;bar<Math.min(bars,chart.nBars);bar++){
    const sec=secAt(bar);
    const muted = bar<entry || (sec && sec.activeRoles && !sec.activeRoles.includes(p.role));
    const ns=p.notes.filter(n=>n.bar===bar).sort((a,b)=>a.step-b.step);
    if(muted){ console.log("  bar"+String(bar+1).padStart(2)+" ·  (resting)"); continue; }
    if(p.role==="drums"){
      // drums read as LANES, like a real drum grid. Collapsing them into one
      // row hid stacked hits and made me misread a kick as absent.
      const lanes={};
      for(const n of ns){ const L=n.lane||"?";
        (lanes[L]=lanes[L]||new Array(16).fill("."))[
          Math.max(0,Math.min(15,Math.round(n.step+(n.micro||0))))] =
          (n.vel||0.5)>0.55?"O":(n.vel||0.5)>0.28?"o":"x"; }
      const order=["kick","snare","snare2","clap","closedHat","openHat","pedalHat","ride","crash"];
      const keys=Object.keys(lanes).sort((a,b)=>{
        const ia=order.indexOf(a), ib=order.indexOf(b);
        return (ia<0?99:ia)-(ib<0?99:ib); });
      console.log("  bar"+String(bar+1).padStart(2)+":");
      for(const k of keys) console.log("        "+k.padEnd(11)+lanes[k].join(""));
      continue;
    }
    // pitched: stack simultaneous notes
    const grid=new Array(16).fill(null);
    for(const n of ns){
      const st=Math.max(0,Math.min(15,Math.round(n.step+(n.micro||0))));
      (grid[st]=grid[st]||[]).push(nn(n.midi));
    }
    const cells=grid.map(c=>c? (c.length>1? c.length+"nt" : c[0].padEnd(3).slice(0,3)) : " . ");
    console.log("  bar"+String(bar+1).padStart(2)+" |"+cells.join("|")+"|"+
      (grid.some(c=>c&&c.length>1)? "   ("+grid.filter(c=>c&&c.length>1)
        .map(c=>c.join("+")).join(" ")+")" : ""));
  }
}
