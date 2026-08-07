#!/usr/bin/env node
/* A/B TWO BUILDS' RENDERED AUDIO — the only instrument that can say whether a
   graph change is audible with nobody touching anything.

     node harness/probe_render_ab.js <oldFile.html> <newFile.html> [genre] [seed] [secs]

   `probe_render_determinism` proves a build repeats ITSELF. This proves a build
   sounds like ANOTHER one, which is the question you have after moving a node.

   IT PINS THE SEED THROUGH THE FIELD, and that is not a detail. The first
   version clicked the "new song" button, which DRAWS A FRESH SEED -- so every
   render was a different record and the differences between two different songs
   were reported as a regression. I spent an hour chasing it. Fourth time on
   this project that a probe has measured its own setup, so it now ASSERTS that
   the seed and genre pinned and throws if they did not.

   IT REPORTS THE RMS OF THE DIFFERENCE, not the worst sample. A limiter turns a
   single sample into a scary number; what an ear hears is the energy. Below
   -80 dB is inaudible; the real defect this found read -48.6 dB across 36% of
   the samples. */
const path=require("path");
const {chromium}=require(path.resolve("/home/user/DeckardsMusicBox/node_modules/playwright"));
(async()=>{
  const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});
  const grab=async file=>{
    const pg=await b.newPage();
    const errs=[]; pg.on("pageerror",e=>errs.push(String(e)));
    await pg.goto("file://"+path.resolve(file),{waitUntil:"load"});
    await pg.waitForFunction(()=>window.MK2,{timeout:30000});
    const r=await pg.evaluate(async(a)=>{
      const [g,seed,secs]=a;
      /* THE SEED FIELD PINS; THE "NEW" BUTTON DRAWS A FRESH ONE. Clicking new
         made every render a different song, so the first version of this probe
         compared two DIFFERENT records and reported the difference as a
         regression. Fourth time on this project that a probe has measured its
         own setup. Set the genre, set the seed, fire the FIELD's handler. */
      const sel=document.getElementById("genre"); sel.value=g;
      sel.dispatchEvent(new Event("change",{bubbles:true}));
      await new Promise(r=>setTimeout(r,150));
      const sd=document.getElementById("seed"); sd.value=String(seed);
      sd.dispatchEvent(new Event("change",{bubbles:true}));
      await new Promise(r=>setTimeout(r,300));
      if(MK2.currentSong().chart.seed !== seed) throw new Error("seed did not pin: "+MK2.currentSong().chart.seed);
      if(MK2.currentSong().chart.genre !== g) throw new Error("genre did not pin");
      const song=MK2.currentSong();
      const S=soundNow();
      const blob=await MK2.renderWav(song.perf.events, secs, 44100,
                    S.space, S.kick, S.drumDrive, S.gate, S.motion);
      const dv=new DataView(await blob.arrayBuffer());
      const n=Math.min(dv.byteLength-44, 44100*2*2*secs);
      let sum=0,peak=0; const out=[];
      for(let i=44;i+1<44+n;i+=2){ const v=dv.getInt16(i,true)/32768; sum+=v*v; if(Math.abs(v)>peak)peak=Math.abs(v); out.push(v); }
      return { seed:MK2.currentSong().chart.seed, genre:MK2.currentSong().chart.genre, n:out.length, rms:Math.sqrt(sum/out.length), peak, head:out.slice(0,400000) };
    },[process.argv[4]||"lofi", +(process.argv[5]||1), +(process.argv[6]||12)]);
    await pg.close();
    if(errs.length) console.log("  page errors in "+file+":",errs.slice(0,2));
    return r;
  };
  const A=await grab(process.argv[2]), B=await grab(process.argv[3]);
  await b.close();
  console.log("song:",A.genre,"seed",A.seed,"vs",B.genre,"seed",B.seed);
  console.log("samples:",A.n,"vs",B.n);
  console.log("rms  :",A.rms.toFixed(6),"vs",B.rms.toFixed(6));
  console.log("peak :",A.peak.toFixed(6),"vs",B.peak.toFixed(6));
  const n=Math.min(A.head.length,B.head.length);
  let worst=0, over60=0, sum=0;
  for(let i=0;i<n;i++){const d=Math.abs(A.head[i]-B.head[i]); sum+=d*d; if(d>worst)worst=d; if(d>1e-3)over60++;}
  const db=worst>0?20*Math.log10(worst):-Infinity;
  const rmsDiff=Math.sqrt(sum/n), rdb=rmsDiff>0?20*Math.log10(rmsDiff):-Infinity;
  console.log("worst single sample :",db.toFixed(1),"dB");
  console.log("rms of the difference:",rdb.toFixed(1),"dB   (the number an ear hears)");
  console.log("samples differing >-60 dB:",over60,"of",n,"=",(100*over60/n).toFixed(4)+"%");
  console.log(rdb<-80?"INAUDIBLE — the difference is below any threshold"
    : rdb<-60?"a whisker: audible only as limiter dither, "+(rdb.toFixed(1))+" dB down"
    : "AUDIBLE DIFFERENCE — investigate");
})();
