const { chromium } = require('/home/user/DeckardsMusicBox/node_modules/playwright');
const path=require('path'), fs=require('fs');
const OUT=process.argv[2], SEED=process.argv[3]||'7';
(async () => {
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--autoplay-policy=no-user-gesture-required','--no-sandbox','--disable-gpu']});
  const page=await b.newPage();
  await page.goto('file:///home/user/DeckardsMusicBox/Improv Machine playable_BETA 0.1.html',{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>typeof newSong==='function'&&typeof Synth==='object',{timeout:30000});
  await page.evaluate(s=>newSong(String(s)), SEED);
  const roles=await page.evaluate(()=>[...new Set(SESSION.events.map(e=>e.kind==='drum'?'drums':(e.role||e.kind)))]);
  console.log('roles: '+roles.join(', '));
  for(const r of roles.concat(['ALL'])){
    const b64=await page.evaluate(async (r)=>{
      const all=SESSION.events;
      if(r!=='ALL') SESSION.events=all.filter(e=>(e.kind==='drum'?'drums':(e.role||e.kind))===r);
      const buf=await Synth.renderOffline(24, t0=>scheduleAll(t0), 22050);
      SESSION.events=all;
      const ab=await (Synth.encodeWav(buf)).arrayBuffer();
      let s=''; const u=new Uint8Array(ab);
      for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
      return btoa(s);
    }, r);
    fs.writeFileSync(path.join(OUT,'stem_'+r+'.wav'), Buffer.from(b64,'base64'));
    console.log('  '+r);
  }
  await b.close();
})();
