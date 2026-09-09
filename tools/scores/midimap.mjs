import { readFileSync } from "node:fs";
const b = readFileSync(process.argv[2]); let p = 0;
const u32 = () => (b[p++]<<24|b[p++]<<16|b[p++]<<8|b[p++])>>>0, u16 = () => (b[p++]<<8|b[p++]);
const vlq = () => { let v=0,c; do { c=b[p++]; v=(v<<7)|(c&127); } while (c&128); return v; };
p += 8; const fmt=u16(), ntr=u16(), ppq=u16();
let tempo=500000, num=4;
const tracks=[];
for (let t=0;t<ntr;t++){ p+=4; const len=u32(), end=p+len; let tick=0, run=0, name="", notes=[]; const on=new Map();
  while(p<end){ tick+=vlq(); let st=b[p]; if(st&128){p++; run=st;} else st=run;
    if(st===0xFF){ const ty=b[p++], l=vlq(); if(ty===3) name=b.slice(p,p+l).toString("latin1"); if(ty===0x51) tempo=(b[p]<<16|b[p+1]<<8|b[p+2]); if(ty===0x58) num=b[p]; p+=l; }
    else if(st===0xF0||st===0xF7){ p+=vlq(); }
    else { const hi=st&0xF0; if(hi===0x90||hi===0x80){ const k=b[p++], v=b[p++]; if(hi===0x90&&v>0) on.set(k,tick); else { const s=on.get(k); if(s!==undefined){ notes.push({k,s,e:tick}); on.delete(k);} } } else if(hi===0xC0||hi===0xD0) p+=1; else p+=2; } }
  tracks.push({name,notes}); }
const perBar=ppq*num; const last=Math.max(...tracks.flatMap(t=>t.notes.map(n=>n.e))); const bars=Math.ceil(last/perBar);
const bpm=60e6/tempo;
console.log(`${process.argv[2].split("/").pop()}  ${bpm.toFixed(0)} bpm  ${num}/4  ${bars} bars  ${(bars*num*60/bpm/60).toFixed(1)} min`);
console.log("track        notes  first bar  last bar  bars sounding   notes/bar   range");
const nm=k=>["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][k%12]+(Math.floor(k/12)-1);
for(const t of tracks){ if(!t.notes.length) continue; const rows=new Set(); for(const n of t.notes){ for(let x=Math.floor(n.s/perBar); x<=Math.floor((n.e-1)/perBar); x++) rows.add(x);} 
  const first=Math.min(...t.notes.map(n=>Math.floor(n.s/perBar))), lst=Math.max(...t.notes.map(n=>Math.floor(n.e/perBar)));
  const lo=Math.min(...t.notes.map(n=>n.k)), hi=Math.max(...t.notes.map(n=>n.k));
  console.log(`  ${t.name.padEnd(10)} ${String(t.notes.length).padStart(5)}   ${String(first).padStart(5)}    ${String(lst).padStart(6)}     ${String(Math.round(100*rows.size/bars)).padStart(4)}%        ${(t.notes.length/rows.size).toFixed(1).padStart(5)}    ${nm(lo)}–${nm(hi)}`); }
