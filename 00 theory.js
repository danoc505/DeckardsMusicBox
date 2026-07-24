const T=(function(){
  const mod=(n,m)=>((n%m)+m)%m;
  const NOTE=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const SCALES={major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],
    lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],minor:[0,2,3,5,7,8,10],
    harmonicMinor:[0,2,3,5,7,8,11],majPentatonic:[0,2,4,7,9],minPentatonic:[0,3,5,7,10]};
  const PULL={0:[0,1,1,3,3,2,.5],1:[.5,0,.5,1,3,.5,1],2:[.5,1,0,2,1,3,.5],3:[3,1,.5,0,3,1,.5],4:[4,.5,.5,1,0,2,.5],5:[1,2,.5,2,2,0,.5],6:[4,.5,1,.5,1,.5,0]};
  const pc=m=>mod(m,12), nn=m=>NOTE[pc(m)]+(Math.floor(m/12)-1);
  const semis=s=>SCALES[s]||SCALES.minor;
  const degToOffset=(s,d)=>{const a=semis(s),n=a.length;return a[mod(d,n)]+12*Math.floor(d/n);};
  const degToMidi=(d,s,root)=>root+degToOffset(s,d);
  const snap=(m,s,root)=>{const a=semis(s),rel=m-root,base=Math.floor(rel/12)*12,sm=mod(rel,12);
    let b=a[0],bd=99;for(const x of a){const d=Math.abs(x-sm);if(d<bd){bd=d;b=x;}}
    const up=a[0]+12,du=Math.abs(up-sm);if(du<bd){bd=du;b=up;}
    const dn=a[a.length-1]-12,dd=Math.abs(dn-sm);if(dd<bd){bd=dd;b=dn;}
    return root+base+b;};
  const scaleStep=(m,s,root,dir)=>{const cur=snap(m,s,root);let c=cur+dir;
    for(let i=0;i<3;i++){const sn=snap(c,s,root);if(sn!==cur)return sn;c+=dir;}return cur+dir*2;};
  const scaleStep2=(m,s,root,n)=>{let cur=snap(m,s,root);if(!n)return cur;
    const dir=n>0?1:-1;for(let i=0;i<Math.abs(n);i++)cur=scaleStep(cur,s,root,dir);return cur;};
  const QUALITY={maj:[0,4,7],min:[0,3,7],dom7:[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],
    m9:[0,3,7,10,14],maj9:[0,4,7,11,14],"6/9":[0,4,7,9,14],m11:[0,3,7,10,14,17],
    "maj7#11":[0,4,7,11,18],m6:[0,3,7,9],sus2:[0,2,7],sus4:[0,5,7],dim7:[0,3,6,9]};
  const specTones=(root,offPc,q)=>(QUALITY[q]||QUALITY.maj).map(i=>root+offPc+i);
  function chordTones(scale,deg,size,root,alt){
    const a=semis(scale),o=[];
    for(let i=0;i<size;i++){let d=deg+i*2,off=degToOffset(scale,d);
      if(mod(deg,7)===4&&mod(d,7)===6&&a[6]===10&&(!alt||alt.dom!==false))off+=1;
      o.push(root+off);}
    if(alt&&alt.sus)o[1]=root+degToOffset(scale,deg+(alt.sus===2?1:3));
    if(alt&&alt.ext){const add=st=>o.push(root+degToOffset(scale,deg+st));
      if(alt.ext==="6"){if(size>=4)o[3]=root+degToOffset(scale,deg+5);else add(5);}
      else if(alt.ext==="6/9"){if(size>=4)o[3]=root+degToOffset(scale,deg+5);else add(5);add(8);}
      else if(alt.ext==="add9"||alt.ext==="9")add(8);
      else if(alt.ext==="11"){add(8);add(10);}
      else if(alt.ext==="13"){add(8);add(12);}}
    if(alt&&alt.fifths)return[o[0],o[0]+7];
    return o;}
  // build a CLOSE-POSITION chord: stack the tones upward from a low anchor so
  // every voice sits within one octave of the one below it. No strays, ever.
  function closeStack(tones,lowAnchor){
    const pcs=[...new Set(tones.map(pc))];
    const v=[];let m=lowAnchor;
    // first (lowest) voice: the given anchor's pitch-class nearest lowAnchor
    for(let i=0;i<pcs.length;i++){
      if(i===0){m=Math.round(lowAnchor/12)*12+pcs[0];
        while(m<lowAnchor-6)m+=12;while(m>lowAnchor+6)m-=12;}
      else{let n=Math.round(v[i-1]/12)*12+pcs[i];   // next voice just ABOVE previous
        while(n<=v[i-1])n+=12;while(n>v[i-1]+12)n-=12;   // within an octave of it
        m=n;}
      v.push(m);}
    return v.sort((x,y)=>x-y);}
  // legacy signature kept for callers: center-anchored close stack
  function voiceChord(tones,prev,center){
    return closeStack(tones,(center||60)-6);}
  const isAvoid=(m,tones)=>tones.some(t=>pc(m-t)===1);
  const nearestTone=(target,tones)=>{let best=target,bd=1e9;
    for(const t of tones){const p=pc(t),c=Math.round((target-p)/12)*12+p,d=Math.abs(c-target);
      if(d<bd){bd=d;best=c;}}return best;};
  const fold=(m,lo,hi)=>{while(m<lo)m+=12;while(m>hi)m-=12;return m;};
  const degOf=(m,root,scale)=>{const a=semis(scale),rel=mod(m-root,12);let best=0,bd=99;
    a.forEach((x,i)=>{const d=Math.abs(x-rel);if(d<bd){bd=d;best=i;}});return best;};
  const strongestPullTo=to=>{let best=mod(to-1,7),bv=-1;
    for(let d=0;d<7;d++){if(d===mod(to,7))continue;const v=PULL[d][mod(to,7)];if(v>bv){bv=v;best=d;}}return best;};
  const ROMAN_N=["I","II","III","IV","V","VI","VII"];
  const romanOf=(deg,scale)=>{const a=semis(scale),d=mod(deg,7),n=a.length;
    const r=a[d],t3=mod(a[mod(d+2,n)]+(d+2>=n?12:0)-r,12),t5=mod(a[mod(d+4,n)]+(d+4>=n?12:0)-r,12);
    let num=ROMAN_N[d];
    if(t3===3&&t5===7)return num.toLowerCase();
    if(t3===4&&t5===7)return num;
    if(t3===3&&t5===6)return num.toLowerCase()+"°";
    if(t3===4&&t5===8)return num+"+";
    return t3===3?num.toLowerCase():num;};
  const smoothestTo=(from,cands,root,scale)=>{if(from==null)return cands[0];
    let best=cands[0],bd=1e9,bp=-1;
    for(const c of cands){const d=Math.abs(c-from);
      const vp=PULL[mod(degOf(from,root,scale),7)][mod(degOf(c,root,scale),7)]||0;
      if(d<bd-.5||(Math.abs(d-bd)<=.5&&vp>bp)){bd=d;bp=vp;best=c;}}
    return best;};
  const quartalVoicing=(rootMidi,scale,root,n)=>{const out=[rootMidi];let m=rootMidi;
    const penta=(SCALES[scale]&&SCALES[scale].length<=5), su=penta?2:3;
    for(let i=1;i<(n||4);i++){m=scaleStep2(m,scale,root,su);out.push(m);}return out;};
  /* ── SHARED PERFORMER PHYSICS (one implementation, everyone uses it) ── */
  // fit a note to the bar's chord: strong beats step-snap to chord tones; avoid
  // notes resolve; weak notes stay free unless marked _noSnap.
  const fitNote=(m,strong,tones,scale,root,prev)=>{
    if(strong&&!tones.some(t=>pc(t)===pc(m))){
      const octs=[m-12,m,m+12],cands=[];
      tones.forEach(t=>octs.forEach(o=>cands.push(nearestTone(o,[t]))));
      const near=cands.filter(c=>Math.abs(c-m)<=2);
      if(near.length)return prev!=null?smoothestTo(prev,near,root,scale):nearestTone(m,tones);
      const ct=nearestTone(m,tones);return Math.abs(ct-m)<=2?ct:m;}
    if(isAvoid(m,tones))return nearestTone(m,tones);
    return m;};
  // gap-fill over a note list in place: any leap > a 3rd turns back by step.
  const gapFillPass=(notes,scale,root,lo,hi)=>{
    for(let i=1;i<notes.length-1;i++){const d=notes[i].midi-notes[i-1].midi;
      if(Math.abs(d)>5){const nx=notes[i+1];
        if(Math.sign(nx.midi-notes[i].midi)===Math.sign(d)||Math.abs(nx.midi-notes[i].midi)>4){
          nx.midi=fold(scaleStep(notes[i].midi,scale,root,d>0?-1:1),lo,hi);nx._noSnap=true;}}}
    return notes;};
  return{mod,NOTE,SCALES,PULL,pc,nn,semis,degToOffset,degToMidi,snap,scaleStep,scaleStep2,
    chordTones,specTones,QUALITY,voiceChord,closeStack,isAvoid,nearestTone,fold,degOf,strongestPullTo,
    romanOf,smoothestTo,quartalVoicing,fitNote,gapFillPass};
})();
