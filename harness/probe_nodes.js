/* DOES THE AUDIO GRAPH GROW WHILE IT PLAYS.

   The user, 2026-08-05: "it is a runaway fx, like echo, reverb or something
   causeing a feedback loop that gets so large it bogs the program down to
   stuttering ... i hit stop and i hear an echo continue." And then, when asked
   whether it took a hand on the knobs: "Im not turning any knobs, it happens
   on its own."

   They were right that something accumulates and wrong about what. MEASURED
   here, acid, nobody touching anything:

       t=15s     825 nodes connected
       t=60s    3073
       t=120s   6923
       t=180s  10975          about 60 a second, in a straight line, never freed

   An acid record runs 6.3 minutes, so it ends with roughly 23 000 live audio
   nodes, every one of them processed on every render block. That is the bog.
   The LEVEL never runs away -- the same record measured flat at -10 to -12 dB
   rms for its whole length -- so it is not a feedback loop; it is the graph
   itself getting bigger until the audio thread cannot keep up.

   AND IT IS INVISIBLE TO EVERY OTHER TOOL HERE. `probe_mainthread` reads a
   steady 17 ms a frame throughout, because this is the AUDIO thread and not
   the main one; the level meter reads flat; the seam checks and the snapshot
   never build a graph at all. Nothing in this repo watched the size of the
   thing that makes the sound.

   HOW IT COUNTS. The AudioContext's factory methods are wrapped before the
   page loads, walking the whole prototype chain -- `createGain` and friends
   live on `BaseAudioContext.prototype`, two levels up, and the first version
   of this probe wrapped only the instance's own prototype and reported ZERO
   nodes on a page that was plainly making noise.

     node harness/probe_nodes.js [genre] [minutes]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML='file://' + path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME=process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const G=process.argv[2]||'boxcarsynth', MINS=Number(process.argv[3]||3);
(async()=>{
 const b=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required','--disable-gpu']});
 const page=await b.newPage();
 // count nodes CREATED and still CONNECTED, by wrapping the context's factories
 await page.addInitScript(()=>{
   const A=window.AudioContext||window.webkitAudioContext;
   window.__n={made:0,conn:0,byType:{}};
   const wrapCtx=c=>{
     const names=new Set();
     for(let p=Object.getPrototypeOf(c); p; p=Object.getPrototypeOf(p))
       for(const nm of Object.getOwnPropertyNames(p)) names.add(nm);
     for(const f of names){
       if(!/^create/.test(f)) continue;
       const o=c[f]; if(typeof o!=='function') continue;
       c[f]=function(...a){
         const n=o.apply(this,a);
         try{
           window.__n.made++;
           const t=f.replace('create','');
           window.__n.byType[t]=(window.__n.byType[t]||0)+1;
           const oc=n.connect, od=n.disconnect;
           let live=false;
           n.connect=function(...b){ if(!live){live=true;window.__n.conn++;} return oc.apply(this,b); };
           n.disconnect=function(...b){ if(live){live=false;window.__n.conn--;} return od.apply(this,b); };
         }catch(e){}
         return n; };
     }
     return c; };
   function W(...a){ return wrapCtx(new A(...a)); }
   W.prototype=A.prototype; window.AudioContext=W; window.webkitAudioContext=W;
 });
 await page.goto(HTML,{waitUntil:'load',timeout:60000});
 await page.waitForFunction(()=>window.MK2,{timeout:20000});
 await page.evaluate(g=>{const s=document.getElementById('genre');s.value=g;s.dispatchEvent(new Event('change',{bubbles:true}));},G);
 await page.waitForTimeout(500);
 await page.evaluate(()=>document.getElementById('play').click());
 console.log(`\n=== ${G}: audio nodes alive over ${MINS} min, nobody touching anything ===\n`);
 console.log('   t(s)   created total   still CONNECTED   frame p50');
 const N=Math.round(MINS*60/15);
 for(let i=0;i<=N;i++){
   const r=await page.evaluate(()=>new Promise(res=>{
     const n={...window.__n};
     const ts=[];let last=performance.now();const t0=last;
     function f(){const x=performance.now();ts.push(x-last);last=x;
       if(x-t0<900)requestAnimationFrame(f);else{ts.sort((a,b)=>a-b);res({n,p50:ts[Math.floor(ts.length/2)]});}}
     requestAnimationFrame(f);}));
   console.log(`  ${String(i*15).padStart(5)}   ${String(r.n.made).padStart(11)}   ${String(r.n.conn).padStart(15)}   ${r.p50.toFixed(0)} ms`);
   if(i<N) await page.waitForTimeout(14000);
 }
 const t=await page.evaluate(()=>window.__n.byType);
 console.log('\n  by type: '+Object.entries(t).sort((a,z)=>z[1]-a[1]).slice(0,8).map(([k,v])=>k+' '+v).join(' · '));
 await b.close();
})();
