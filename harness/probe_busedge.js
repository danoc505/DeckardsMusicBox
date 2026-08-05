#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   DOES AN EDGE IN THE PLAN SURVIVE THE BUS GRID?

       node harness/probe_busedge.js

   WHY IT EXISTS. `rideBus` samples the motion plan on a grid of one point per
   BEAT and joins the points with linear ramps. That is right for the section
   steps and slow LFOs it was built for, and wrong for the two kinds that are
   DEFINED by a discontinuity: `snap` (a mute -- "at bar B it jumps, holds, and
   jumps back, with no ramp at either edge, because the edge IS the gesture")
   and `throw` (a send that spikes and decays).

   MEASURED before the fix, on the two genres that declare a snap:
       jungle      the cut took 312 ms and began 285 ms BEFORE the bar line
       plastikman  415 ms, beginning 379 ms early
   A mute rendered as a third-of-a-second fade that starts early is not a mute.
   After: 0 ms, on the bar line.

   HOW IT MEASURES. It replays rideBus's own scheduling against a recording
   stub, reconstructs the curve WebAudio would produce from those events, and
   times the transition between 5% and 95% of the step. No audio is rendered,
   so it is fast and it isolates the automation from everything downstream.

   ONE SETUP TRAP, RECORDED BECAUSE THE FIRST VERSION FELL IN IT: a crossing
   whose BASE is 0 clamps the cut away at the control's minimum, so there is no
   step to find and the probe reports "no edge" on a program that plainly has
   one. Use the control's own default as the base.
   ═══════════════════════════════════════════════════════════════════════════ */

const fs=require("fs");const h=fs.readFileSync("/home/user/DeckardsMusicBox/Deckards Orchestrator MK2.html","utf8");
const src=h.split("<script>")[1].split("</script>")[0];
global.window={addEventListener(){},MK2:null};
global.document={getElementById:()=>({addEventListener(){},textContent:"",value:"1",innerHTML:""}),createElement:()=>({click(){}})};
eval(src);const M=global.window.MK2;

for(const [g,key] of [["jungle","matrix.echoFlange"],["plastikman","matrix.echoMix"]]){
  const song=M.composeSong(11,undefined,g), plan=song.motion;
  if(!plan.lanes[key]) { console.log(g,"no lane"); continue; }
  const spb=plan.spb, beat=spb*4, bar=spb*16;
  // replay rideBus by hand against a recording param
  const ev=[];
  const param={ value:0, cancelScheduledValues(){}, 
    setValueAtTime(v,t){ev.push({k:"set",v,t});},
    linearRampToValueAtTime(v,t){ev.push({k:"ramp",v,t});} };
  const c=M.CONTROL[key];
  /* the REAL base: a crossing sitting at 0 clamps the cut away and there is
     no edge to measure -- the first version of this check did that and
     reported 'no edge' on a program that plainly has one. */
  const base=(c&&c.def!=null)?(c.def||1):1, depth=1;
  const val=t=>{let x=base+depth*M.motionAt(plan,key,{tSec:t},0); return c?Math.max(c.min,Math.min(c.max,x)):x;};
  const step=beat, n=Math.ceil(plan.seconds/step);
  const EDGE=Math.max(1e-4, Math.abs(depth)*0.35);
  param.setValueAtTime(val(0),0);
  for(let i=1;i<=n;i++){
    const tP=(i-1)*step,tS=i*step, xP=val(tP), x=val(tS);
    if(Math.abs(x-xP)>EDGE){
      let lo=tP,hi=tS;
      for(let k=0;k<12&&hi-lo>0.001;k++){const m=(lo+hi)/2; if(Math.abs(val(m)-xP)>EDGE) hi=m; else lo=m;}
      param.linearRampToValueAtTime(xP,lo); param.setValueAtTime(val(hi),hi);
    }
    param.linearRampToValueAtTime(x,tS);
  }
  // reconstruct the curve WebAudio would produce from these events
  ev.sort((a,b)=>a.t-b.t);
  const curve=t=>{ let pv=ev[0].v, pt=ev[0].t;
    for(let i=0;i<ev.length;i++){ const e=ev[i];
      if(e.t<=t){ if(e.k==="set"){pv=e.v;pt=e.t;} else {pv=e.v;pt=e.t;} continue; }
      if(e.k==="set") return pv;
      const f=(t-pt)/(e.t-pt); return pv+(e.v-pv)*f; }
    return pv; };
  // find the first real edge in the PLAN and time the rendered transition
  let edgeT=null;
  for(let t=0;t<plan.seconds;t+=spb/8){ if(Math.abs(val(t)-val(t-spb/8))>EDGE && t>0){edgeT=t;break;} }
  if(edgeT==null){console.log(g,"no edge");continue;}
  const from=val(edgeT-spb/8), to=val(edgeT), span=Math.abs(to-from);
  let t5=null,t95=null;
  for(let k=0;k<=4000;k++){ const tt=edgeT-beat*1.3+(k/4000)*(2.6*beat); const p=Math.abs(curve(tt)-from)/span;
    if(t5===null&&p>=0.05)t5=tt; if(p>=0.95){t95=tt;break;} }
  console.log("\n"+g+"  "+key+"  ("+Math.round(song.chart.tempo)+" bpm, beat "+(beat*1000).toFixed(0)+" ms)");
  console.log("  plan edge at "+edgeT.toFixed(3)+"s, bar "+(edgeT/bar+1).toFixed(2));
  console.log("  AS RENDERED: transition "+((t95-t5)*1000).toFixed(0)+" ms, starting "+((edgeT-t5)*1000).toFixed(0)+" ms before the edge");
}
