const Synth=(function(){
  let ctx=null,master=null,rev=null,analyser=null,pendingMaster=.7,toneLP=null,delaySend=null,convWet=null;
  function buildGraph(c){ ctx=c;
    master=ctx.createGain();master.gain.value=pendingMaster;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;
    // a master TONE lowpass — open by default; barber/Zelda pull it down for warmth
    toneLP=ctx.createBiquadFilter();toneLP.type="lowpass";toneLP.frequency.value=18000;
    rev=ctx.createConvolver();const len=ctx.sampleRate*1.6,buf=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);}
    rev.buffer=buf;const wet=ctx.createGain();wet.gain.value=.18;convWet=wet;
    analyser=ctx.createAnalyser();analyser.fftSize=1024;
    // the N64 "reverb" was a single stereo delay line — off unless Zelda mode asks
    delaySend=ctx.createGain();delaySend.gain.value=0;
    const dl=ctx.createDelay();dl.delayTime.value=0.13;const fb=ctx.createGain();fb.gain.value=0.32;
    master.connect(toneLP);toneLP.connect(comp);comp.connect(analyser);analyser.connect(ctx.destination);
    toneLP.connect(delaySend);delaySend.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(ctx.destination);
    master.connect(rev);rev.connect(wet);wet.connect(ctx.destination);
    applyTone(); pumpBus=null; miReverbNode=null; miWetNode=null;
    return ctx;}
  function ensure(){ if(ctx)return ctx;
    buildGraph(new (window.AudioContext||window.webkitAudioContext)());
    if(ctx.state==="suspended")ctx.resume(); return ctx;}

  /* ── OFFLINE RENDER → the song as audio. Also the honest way to VERIFY what
     the program actually sounds like: render it and measure the samples. ── */
  async function renderOffline(seconds, scheduleFn, sr){
    const saved=[ctx,master,rev,analyser,toneLP,delaySend,convWet,miReverbNode,miWetNode,pumpBus];
    const rate=sr||44100;
    const off=new OfflineAudioContext(2, Math.ceil(seconds*rate), rate);
    buildGraph(off); ensurePump();
    try{
      const url=URL.createObjectURL(new Blob([MI_REVERB_WORKLET],{type:"application/javascript"}));
      await off.audioWorklet.addModule(url);
      miReverbNode=new AudioWorkletNode(off,"mi-clouds-reverb",{outputChannelCount:[2]});
      const w=off.createGain(); w.gain.value=0.30;
      master.connect(miReverbNode); miReverbNode.connect(w); w.connect(off.destination);
      miReverbNode.port.postMessage({amount:1.0,time:0.75,lp:0.7,gain:0.2});
      if(convWet) convWet.gain.value=0;
      miWetNode=w;
    }catch(e){ /* no worklet available: the convolver send carries the space */ }
    try{ scheduleFn(0); }catch(e){}
    const buf=await off.startRendering();
    [ctx,master,rev,analyser,toneLP,delaySend,convWet,miReverbNode,miWetNode,pumpBus]=saved;
    return buf;
  }
  /* encode an AudioBuffer as a 16-bit PCM WAV blob */
  function encodeWav(buf){
    const ch=Math.min(2,buf.numberOfChannels), n=buf.length, rate=buf.sampleRate;
    const data=new DataView(new ArrayBuffer(44+n*ch*2));
    const ws=(o,s)=>{for(let i=0;i<s.length;i++)data.setUint8(o+i,s.charCodeAt(i));};
    ws(0,"RIFF"); data.setUint32(4,36+n*ch*2,true); ws(8,"WAVE"); ws(12,"fmt ");
    data.setUint32(16,16,true); data.setUint16(20,1,true); data.setUint16(22,ch,true);
    data.setUint32(24,rate,true); data.setUint32(28,rate*ch*2,true);
    data.setUint16(32,ch*2,true); data.setUint16(34,16,true); ws(36,"data");
    data.setUint32(40,n*ch*2,true);
    const chans=[]; for(let c=0;c<ch;c++) chans.push(buf.getChannelData(c));
    let o=44;
    for(let i=0;i<n;i++) for(let c=0;c<ch;c++){
      let v=Math.max(-1,Math.min(1,chans[c][i]));
      data.setInt16(o, v<0? v*0x8000 : v*0x7FFF, true); o+=2; }
    return new Blob([data],{type:"audio/wav"});
  }
  function setMaster(v){pendingMaster=v;if(master)master.gain.value=v;}
  // set the master tone: {lp: cutoff Hz, delay: 0..1 N64 delay-line send}.
  // Lazy — stored until the context exists, then applied (also re-applied in ensure).
  let pendingTone={};
  function applyTone(){ if(!toneLP)return; toneLP.frequency.value=pendingTone.lp||18000;
    if(delaySend)delaySend.gain.value=pendingTone.delay||0; }
  function setTone(o){ pendingTone=o||{}; if(ctx)applyTone(); }
  const f=m=>440*Math.pow(2,(m-69)/12);
  const OSC={rhodes:["sine","sine"],wurly:["sine","triangle"],pad:["sawtooth","sawtooth"],
    sub:["sine","triangle","sawtooth"],sine:["sine"],saw:["sawtooth"],
    pluck:["triangle"],choir:["sawtooth","sawtooth","sawtooth"],organ:["sine","sine","square"],flute:["sine"],bell:["sine","sine"],
    harp:["triangle"],marimba:["sine","sine"],sax:["sawtooth","square"],brass:["sawtooth","sawtooth"],strings:["sawtooth","sawtooth","sawtooth"]};
  // per-osc frequency multiples + gains — the SUB carries an octave triangle and a
  // sawtooth so the bass reads on small speakers (harmonics, not just fundamental)
  const FMUL={sub:[1,2,1],bell:[1,2.01],marimba:[1,2.01]};
  const OGAIN={sub:[1,.42,.26]};
  function voice(inst,midi,t,dur,vel){ ensure();
    const oscs=OSC[inst]||["sine"],g=ctx.createGain(),flt=ctx.createBiquadFilter();
    flt.type="lowpass";flt.frequency.value=inst==="pad"||inst==="choir"||inst==="strings"?1800:inst==="sub"?1600:inst==="sine"?600:inst==="sax"||inst==="brass"?3000:4200;
    const slow=inst==="pad"||inst==="choir"||inst==="strings"||inst==="brass";
    const a=slow?.25:inst==="sax"?.06:inst==="bell"||inst==="pluck"||inst==="harp"||inst==="marimba"?.005:inst==="wurly"?.008:.02;
    const rel=slow?.9:inst==="bell"||inst==="marimba"?dur*.9:inst==="sax"?.2:.18;
    const peak=vel*(inst==="sub"?.95:inst==="strings"||inst==="brass"?.22:inst==="sax"?.26:.32);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak*.8,t+Math.max(a,dur*.6));g.gain.exponentialRampToValueAtTime(.0005,t+dur+rel);
    const vib=(inst==="sax"||inst==="strings"||inst==="flute")?ctx.createOscillator():null,vibg=vib?ctx.createGain():null;
    if(vib){vib.frequency.value=5;vibg.gain.value=f(midi)*.006;vib.connect(vibg);vib.start(t);vib.stop(t+dur+rel+.05);}
    oscs.forEach((ty,i)=>{const o=ctx.createOscillator();o.type=ty;
      const fm=(FMUL[inst]||[])[i]||1;
      o.frequency.value=f(midi)*fm+(fm===1&&i?(i===1?f(midi)*.006:(Math.random()-.5)*3):0);
      if(inst==="wurly"&&i===1)o.frequency.value=f(midi)*2;
      if(vibg)vibg.connect(o.frequency);
      const og2=(OGAIN[inst]&&OGAIN[inst][i]!=null)?ctx.createGain():null;
      if(og2){og2.gain.value=OGAIN[inst][i];o.connect(og2);og2.connect(g);}else o.connect(g);
      o.start(t);o.stop(t+dur+rel+.05);});
    g.connect(flt);flt.connect((typeof PUMPED!=="undefined"&&PUMPED[inst]&&pumpBus)?pumpBus:master);}
  function noise(t,dur){const len=ctx.sampleRate*dur,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=buf;s.start(t);s.stop(t+dur);return s;}
  const TOMF={tomhi:260,tommid:180,tomlo:120,lowFloorTom:88,highFloorTom:108,lowTom:132,lowMidTom:158,hiMidTom:192,highTom:232};

  /* ── SEGA MODE: YM2612-style 4-op FM. TRUE frequency modulation in Web Audio
     (modulator oscillators drive the carrier's frequency), with chip-flavored
     ratios and snappy envelopes. Styled on the Mega Drive chip — the genuine
     cycle-accurate cores are open source (Nuked-OPN2, ym2612-js, ymfm-wasm)
     and are the drop-in path if we ever want the real ladder-effect grit. ── */
  const FMP={
    fmEP:   {ops:[[1,3.2,.003,.5],[14,1.1,.002,.06]], a:.004, rel:.45, peak:.3},
    fmBass: {ops:[[1,4.5,.002,.12],[2,2.0,.002,.05]], a:.003, rel:.12, peak:.5},
    fmLead: {ops:[[2,3.5,.004,.3],[3,1.2,.003,.1]],   a:.005, rel:.2,  peak:.3},
    fmBell: {ops:[[3.5,4.0,.002,.4],[7,1.5,.001,.15]],a:.002, rel:.6,  peak:.24},
    fmBrass:{ops:[[1,5.0,.06,.4],[2,1.5,.05,.2]],     a:.05,  rel:.25, peak:.26},
    fmPad:  {ops:[[2,2.0,.2,.9],[1,1.0,.25,.7]],      a:.22,  rel:.8,  peak:.2},
    fmPluck:{ops:[[1,5.0,.001,.06],[3,2.0,.001,.04]], a:.002, rel:.1,  peak:.3},
  };
  function fm(inst, midi, t, dur, vel){ ensure();
    const p=FMP[inst]||FMP.fmLead, f0=f(midi);
    const car=ctx.createOscillator(); car.type="sine"; car.frequency.value=f0;
    const amp=ctx.createGain();
    const peak=vel*p.peak;
    amp.gain.setValueAtTime(0,t); amp.gain.linearRampToValueAtTime(peak,t+p.a);
    amp.gain.setValueAtTime(peak*.8, t+Math.max(p.a,dur*.6));
    amp.gain.exponentialRampToValueAtTime(.0005, t+dur+p.rel);
    p.ops.forEach(o=>{ const [ratio,index,atk,dec]=o;
      const mo=ctx.createOscillator(); mo.type="sine"; mo.frequency.value=f0*ratio;
      const mg=ctx.createGain();
      mg.gain.setValueAtTime(0,t); mg.gain.linearRampToValueAtTime(f0*index, t+atk);
      mg.gain.exponentialRampToValueAtTime(Math.max(.5,f0*index*.06), t+atk+dec);
      mo.connect(mg); mg.connect(car.frequency); mo.start(t); mo.stop(t+dur+p.rel+.05); });
    car.connect(amp); amp.connect((PUMPED[inst]&&pumpBus)?pumpBus:master); car.start(t); car.stop(t+dur+p.rel+.05);
  }
  /* ── RINGS-STYLE MODAL VOICE (Mutable Instruments' Rings is open source; this
     is its core idea — a bank of tuned resonant bandpass filters pinged by a
     noise burst; the partial ratios are a struck-bar's modes). ── */
  function modal(midi, t, dur, vel){ ensure();
    const f0=f(midi), parts=[1,2.76,5.40,8.93];
    const exc=noise(t,.02);
    parts.forEach((r,i)=>{ if(f0*r>9000)return;
      const bp=ctx.createBiquadFilter(); bp.type="bandpass";
      bp.frequency.value=f0*r; bp.Q.value=60+i*30;
      const g=ctx.createGain();
      const pk=vel*.5/(i+1);
      g.gain.setValueAtTime(pk,t); g.gain.exponentialRampToValueAtTime(.0005, t+Math.min(dur+1.2, 2.2-i*.3));
      exc.connect(bp); bp.connect(g); g.connect(pumpBus||master); });
  }


  /* ── PRODUCTION LAYER, Mutable-Instruments-inspired (their code is open
     source, so true ports are a future path; these are the core ideas):
     · STREAMS → sidechain pump: sustained voices route through a duck bus
       that the kick compresses, recovering with a musical curve
     · TIDES/FRAMES → macro automation: slope the master filter over a span
       (the filtered-intro technique)
     · CLOUDS → granular-style transition textures: noise risers and
       reverse-wash swells into section seams ── */
  let pumpBus=null, pumpDepth=0;
  function ensurePump(){ if(pumpBus)return; ensure();
    pumpBus=ctx.createGain(); pumpBus.gain.value=1; pumpBus.connect(master); }
  function setPump(d){ pumpDepth=Math.max(0,Math.min(.8,d||0)); }
  function duck(t){ if(!pumpDepth||!pumpBus)return;
    const g=pumpBus.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value,t);
    g.linearRampToValueAtTime(1-pumpDepth, t+0.02);
    g.setTargetAtTime(1, t+0.05, 0.09); }
  const PUMPED={pad:1,rhodes:1,marimba:1,harp:1,modal:1,fmEP:1,fmPad:1,fmBell:1,strings:1,choir:1};
  function sweep(t0,t1,from,to){ ensure(); if(!toneLP)return;
    toneLP.frequency.cancelScheduledValues(t0);
    toneLP.frequency.setValueAtTime(from,t0);
    toneLP.frequency.exponentialRampToValueAtTime(Math.max(200,to), t1); }
  function riser(t, dur, kind){ ensure();
    const n=noise(t, dur+.05);
    const flt=ctx.createBiquadFilter(); const g=ctx.createGain();
    if(kind==="wash"){                       // reverse-reverb style swell into the seam
      flt.type="lowpass"; flt.frequency.value=2400;
      g.gain.setValueAtTime(.0008,t);
      g.gain.exponentialRampToValueAtTime(.34, t+dur*.96);
      g.gain.linearRampToValueAtTime(.0001, t+dur+.03);
    } else {                                  // rising bandpass riser
      flt.type="bandpass"; flt.Q.value=1.4;
      flt.frequency.setValueAtTime(300,t);
      flt.frequency.exponentialRampToValueAtTime(5200, t+dur);
      g.gain.setValueAtTime(.0008,t);
      g.gain.exponentialRampToValueAtTime(.26, t+dur*.9);
      g.gain.linearRampToValueAtTime(.0001, t+dur+.03);
    }
    n.connect(flt); flt.connect(g); g.connect(master);
  }


  const MI_REVERB_WORKLET = `
class MiCloudsReverb extends AudioWorkletProcessor {
  constructor(){ super();
    const R = sampleRate/32000;
    const L = [113,162,241,399,1653,2038,3411,1913,1663,4782].map(x=>Math.round(x*R));
    this.len=L;
    this.base=[]; let b=0; for(const l of L){ this.base.push(b); b+=l; }
    let sz=1; while(sz<b+8) sz<<=1;
    this.mask=sz-1; this.buf=new Float32Array(sz); this.w=0;
    this.acc=0; this.prev=0;
    this.lp1=0; this.lp2=0;
    this.kap=0.625; this.klp=0.7; this.krt=0.75; this.amount=0.18; this.gain=0.2;
    this.lfo1=0; this.lfo2=0;
    this.R=sampleRate/32000;                  // all sample-domain offsets scale by this
    this.lfo1inc=2*Math.PI*0.5/sampleRate;    // 0.5 Hz (Clouds: 0.5/32000 per sample)
    this.lfo2inc=2*Math.PI*0.3/sampleRate;
    this.port.onmessage=e=>{ const m=e.data||{};
      if(m.amount!=null)this.amount=m.amount; if(m.time!=null)this.krt=m.time;
      if(m.lp!=null)this.klp=m.lp; if(m.gain!=null)this.gain=m.gain; };
  }
  rd(i,off,scale){ const v=this.buf[(this.w+this.base[i]+off)&this.mask];
    this.prev=v; this.acc+=v*scale; }
  wr(i,scale){ this.buf[(this.w+this.base[i])&this.mask]=this.acc; this.acc*=scale; }
  wrAP(i,scale){ this.wr(i,scale); this.acc+=this.prev; }
  interp(i,off,lfo,amp,scale){ const o=off+Math.sin(lfo)*amp;
    const oi=o|0, fr=o-oi;
    const a=this.buf[(this.w+this.base[i]+oi)&this.mask];
    const b2=this.buf[(this.w+this.base[i]+oi+1)&this.mask];
    const v=a+(b2-a)*fr; this.prev=v; this.acc+=v*scale; }
  process(inputs,outputs){
    const inL=(inputs[0]&&inputs[0][0])||null, inR=(inputs[0]&&inputs[0][1])||inL;
    const outL=outputs[0][0], outR=outputs[0][1]||outputs[0][0];
    const n=outL.length, T=this.len, kap=this.kap, klp=this.klp, krt=this.krt;
    for(let s=0;s<n;s++){
      const l=inL?inL[s]:0, r=inR?inR[s]:0;
      this.w=(this.w-1)&this.mask;
      let wet=0;
      // smear AP1 in the loop (Clouds: Interpolate(ap1,10,LFO_1,60,1); Write(ap1,100,0))
      this.acc=0; this.interp(0,10*this.R,this.lfo1,60*this.R,1.0);
      this.buf[(this.w+this.base[0]+Math.min(Math.round(100*this.R),T[0]-2))&this.mask]=this.acc; this.acc=0;
      this.acc+=(l+r)*this.gain;
      this.rd(0,T[0]-1,kap); this.wrAP(0,-kap);
      this.rd(1,T[1]-1,kap); this.wrAP(1,-kap);
      this.rd(2,T[2]-1,kap); this.wrAP(2,-kap);
      this.rd(3,T[3]-1,kap); this.wrAP(3,-kap);
      const apout=this.acc;
      // main loop, left branch
      this.acc=apout;
      this.interp(9,4680*T[9]/4782,this.lfo2,100*T[9]/4782,krt);
      this.lp1+=klp*(this.acc-this.lp1); this.acc=this.lp1;
      this.rd(4,T[4]-1,-kap); this.wrAP(4,kap);
      this.rd(5,T[5]-1,kap);  this.wrAP(5,-kap);
      this.wr(6,2.0);
      wet=this.acc;
      outL[s]=l+(wet-l)*this.amount;
      // right branch
      this.acc=apout;
      this.rd(6,T[6]-1,krt);
      this.lp2+=klp*(this.acc-this.lp2); this.acc=this.lp2;
      this.rd(7,T[7]-1,kap);  this.wrAP(7,-kap);
      this.rd(8,T[8]-1,-kap); this.wrAP(8,kap);
      this.wr(9,2.0);
      wet=this.acc;
      outR[s]=r+(wet-r)*this.amount;
      this.lfo1+=this.lfo1inc; this.lfo2+=this.lfo2inc;
    }
    return true;
  }
}
registerProcessor("mi-clouds-reverb", MiCloudsReverb);`;
  let miReverbNode=null, miWetNode=null;
  function initMiReverb(){
    if(miReverbNode || !ctx || !ctx.audioWorklet || typeof AudioWorkletNode==="undefined") return;
    const url=URL.createObjectURL(new Blob([MI_REVERB_WORKLET],{type:"application/javascript"}));
    ctx.audioWorklet.addModule(url).then(()=>{
      miReverbNode=new AudioWorkletNode(ctx,"mi-clouds-reverb",{outputChannelCount:[2]});
      const miWet=ctx.createGain(); miWet.gain.value=0.30;
      master.connect(miReverbNode); miReverbNode.connect(miWet); miWet.connect(ctx.destination);
      // pure wet out of the node; it is a SEND, so amount=1
      miReverbNode.port.postMessage({amount:1.0, time:0.75, lp:0.7, gain:0.2});
      if(convWet) convWet.gain.value=0;            // retire the convolver: no stacking
      miWetNode=miWet;
    }).catch(()=>{});
  }

  function setReverb(o){ o=o||{};
    if(miReverbNode) miReverbNode.port.postMessage({time:o.time!=null?o.time:0.75, lp:o.lp!=null?o.lp:0.7});
    if(miWetNode && o.wet!=null) miWetNode.gain.value=o.wet;
    else if(convWet && o.wet!=null && !miWetNode) convWet.gain.value=o.wet; }

  /* ── THE SEGA VOICE: the verified Nuked-OPN2 in a worklet ── */
  let opn2Node=null, opn2Gain=null, opn2Ready=false;
  const opn2Free=[0,0,0,0,0,0], opn2Patched=[null,null,null,null,null,null];
  function initOPN2(){
    if(opn2Node || !ctx || !ctx.audioWorklet || typeof OPN2_WORKLET_SRC==="undefined") return;
    if(typeof AudioWorkletNode==="undefined") return;
    const url=URL.createObjectURL(new Blob([OPN2_WORKLET_SRC],{type:"application/javascript"}));
    ctx.audioWorklet.addModule(url).then(()=>{
      opn2Node=new AudioWorkletNode(ctx,"opn2-ym2612",{outputChannelCount:[2]});
      opn2Gain=ctx.createGain(); opn2Gain.gain.value=0.85;
      opn2Node.connect(opn2Gain); opn2Gain.connect(pumpBus||master);
      opn2Ready=true;
    }).catch(()=>{});
  }
  function opn2Alloc(when){
    for(let i=0;i<6;i++) if(opn2Free[i]<=when) return i;
    let best=0,bt=Infinity;
    for(let i=0;i<6;i++) if(opn2Free[i]<bt){bt=opn2Free[i];best=i;}
    return best;
  }
  /* schedule one note on the chip: patch (if the channel changed role),
     velocity as carrier total-level, frequency, then key on and key off */
  function opn2Note(role, midi, when, dur, vel){
    if(!opn2Ready || !opn2Node) return;
    const patch=(typeof OPN2_PATCHES!=="undefined" && OPN2_PATCHES[role]) ||
                (typeof OPN2_PATCHES!=="undefined" && OPN2_PATCHES.lead);
    if(!patch) return;
    const ch=opn2Alloc(when);
    const w=[];
    if(opn2Patched[ch]!==role){ opn2PatchWrites(ch,patch).forEach(x=>w.push(x)); opn2Patched[ch]=role; }
    opn2VelWrites(ch,patch,vel).forEach(x=>w.push(x));
    opn2FreqWrites(ch,midi).forEach(x=>w.push(x));
    opn2KeyWrites(ch,false).forEach(x=>w.push(x));
    const d=Math.max(0.04,dur);
    opn2Node.port.postMessage({type:"writes", when:Math.max(0,when-0.004), list:w});
    opn2Node.port.postMessage({type:"writes", when:when,   list:opn2KeyWrites(ch,true)});
    opn2Node.port.postMessage({type:"writes", when:when+d, list:opn2KeyWrites(ch,false)});
    opn2Free[ch]=when+d;
  }
  function opn2Reset(){ if(opn2Node){ opn2Node.port.postMessage({type:"reset"});
    for(let i=0;i<6;i++){opn2Free[i]=0;opn2Patched[i]=null;} } }

  /* play a slice of a loaded sample buffer (the chopper's voice) */
  function sampleVoice(buffer, offsetSec, durSec, t, vel, rate, hpHz){
    ensure();
    const src=ctx.createBufferSource(); src.buffer=buffer;
    if(rate && rate>0 && src.playbackRate) src.playbackRate.value=rate;
    const g=ctx.createGain();
    const v=Math.max(0,Math.min(1.4,vel));
    g.gain.setValueAtTime(v,t);
    const d=Math.max(0.02, Math.min(durSec, 2.0))/(rate&&rate>0?rate:1);
    g.gain.setValueAtTime(v, t+d*0.85);
    g.gain.linearRampToValueAtTime(0.0001, t+d);      // short fade: no clicks
    if(hpHz && hpHz>20){
      // a record is a whole band already; roll its low end off so OUR bass
      // has somewhere to live. This is the standard move, not a nicety.
      const hp=ctx.createBiquadFilter(); hp.type="highpass";
      hp.frequency.value=hpHz; hp.Q.value=0.7;
      src.connect(hp); hp.connect(g);
    } else src.connect(g);
    g.connect(pumpBus||master);
    try{ src.start(t, Math.max(0,offsetSec), d); }catch(e){}
    return src;
  }
  function drum(lane,t,vel){ ensure();const g=ctx.createGain();g.connect(master);
    if(lane==="kick"){const o=ctx.createOscillator();o.type="sine";o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(vel*.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);o.start(t);o.stop(t+.18);}
    else if(lane==="snare"){const n=noise(t,.2);const flt=ctx.createBiquadFilter();flt.type="highpass";flt.frequency.value=1200;g.gain.setValueAtTime(vel*.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);n.connect(flt);flt.connect(g);const o=ctx.createOscillator();o.type="triangle";o.frequency.value=180;const og=ctx.createGain();og.gain.setValueAtTime(vel*.3,t);og.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(og);og.connect(master);o.start(t);o.stop(t+.1);}
    else if(lane==="hat"){const n=noise(t,.05);const flt=ctx.createBiquadFilter();flt.type="highpass";flt.frequency.value=7000;g.gain.setValueAtTime(vel*.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);n.connect(flt);flt.connect(g);}
    else if(lane==="openhat"){const n=noise(t,.3);const flt=ctx.createBiquadFilter();flt.type="highpass";flt.frequency.value=6500;g.gain.setValueAtTime(vel*.24,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);n.connect(flt);flt.connect(g);}
    else if(lane==="ride"){const n=noise(t,.4);const flt=ctx.createBiquadFilter();flt.type="bandpass";flt.frequency.value=6000;flt.Q.value=2;g.gain.setValueAtTime(vel*.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);n.connect(flt);flt.connect(g);const o=ctx.createOscillator();o.type="square";o.frequency.value=520;const og=ctx.createGain();og.gain.setValueAtTime(vel*.05,t);og.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(og);og.connect(master);o.start(t);o.stop(t+.25);}
    else if(lane==="clap"){for(let k=0;k<3;k++){const n=noise(t+k*.012,.12);const flt=ctx.createBiquadFilter();flt.type="bandpass";flt.frequency.value=1400;flt.Q.value=1.2;const cg=ctx.createGain();cg.gain.setValueAtTime(vel*.32,t+k*.012);cg.gain.exponentialRampToValueAtTime(.001,t+k*.012+.1);n.connect(flt);flt.connect(cg);cg.connect(master);}}
    else if(lane==="rim"){const o=ctx.createOscillator();o.type="triangle";o.frequency.setValueAtTime(1700,t);o.frequency.exponentialRampToValueAtTime(400,t+.02);g.gain.setValueAtTime(vel*.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);o.connect(g);o.start(t);o.stop(t+.05);}
    else if(TOMF[lane]!=null){const base=TOMF[lane];const o=ctx.createOscillator();o.type="sine";o.frequency.setValueAtTime(base*1.2,t);o.frequency.exponentialRampToValueAtTime(base*.55,t+.26);g.gain.setValueAtTime(vel*.85,t);g.gain.setValueAtTime(vel*.7,t+.16);g.gain.linearRampToValueAtTime(.0001,t+.22);o.connect(g);o.start(t);o.stop(t+.24);if(vel>0.45){const nz=noise(t,.03);const nf=ctx.createBiquadFilter();nf.type="bandpass";nf.frequency.value=Math.min(6000,base*9);const ng=ctx.createGain();ng.gain.setValueAtTime(vel*.3,t);ng.gain.exponentialRampToValueAtTime(.001,t+.03);nz.connect(nf);nf.connect(ng);ng.connect(master);}}
  }
  return {ensure,voice,drum,fm,modal,sampleVoice,setPump,duck,sweep,riser,ensurePump,initMiReverb,setReverb,renderOffline,encodeWav,initOPN2,opn2Note,opn2Reset,isOPN2Ready:()=>opn2Ready,setMaster,setTone,now:()=>ctx?ctx.currentTime:0,analyser:()=>analyser,resume:()=>{if(ctx&&ctx.state==="suspended")return ctx.resume();}};
})();