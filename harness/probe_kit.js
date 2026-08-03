// Render EACH KIT VOICE ON ITS OWN, so the kit can be judged voice by voice instead of
// as a lump.  node kit.js <outdir>
const { chromium } = require('/home/user/DeckardsMusicBox/node_modules/playwright');
const path=require('path'), fs=require('fs');
const OUT=process.argv[2];
const LANES=["kick","snare","hat","openhat","ride","clap","rim","tomhi","tommid","tomlo"];
(async () => {
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--autoplay-policy=no-user-gesture-required','--no-sandbox']});
  const page=await b.newPage();
  await page.goto('file://'+path.resolve(__dirname+'/../Improv Machine playable_BETA 0.1.html'));
  await page.waitForSelector('#play',{timeout:30000});
  await page.waitForTimeout(2000);
  for(const lane of LANES){
    const b64=await page.evaluate(async (lane)=>{
      const buf=await Synth.renderOffline(1.2, t0=>{ Synth.drum(lane, t0+0.05, 0.8); }, 44100);
      const ab=await (Synth.encodeWav(buf)).arrayBuffer();
      let s=''; const u=new Uint8Array(ab);
      for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
      return btoa(s);
    }, lane);
    fs.writeFileSync(path.join(OUT,lane+'.wav'), Buffer.from(b64,'base64'));
  }
  console.log('rendered '+LANES.length+' lanes -> '+OUT);
  await b.close();
})();
