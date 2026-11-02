import {test,expect} from '@playwright/test';
import {finishDialogue,finishRevelation} from './helpers/dialogue.js';

// Original synthetic test tone, generated only in test memory. No music asset
// is added to the app or distributed with production.
function tone(frequency){
 const rate=8000,n=4000,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
 for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.sin(i*frequency*Math.PI*2/rate)*1600),44+i*2);
 return `data:audio/wav;base64,${b.toString('base64')}`;
}
async function configuredMusic(page,{blocked=false,missing=false,simulateTransport=false}={}){
 const tracks=Object.fromEntries(['intro','divination','result'].map((key,i)=>[key,{src:missing?null:tone(220+i*110),loop:true}]));
 await page.route('**/src/audio/tracks.js',route=>route.fulfill({contentType:'application/javascript',body:`export const musicTracks=${JSON.stringify(tracks)};export const musicSettings={volume:.22,fadeMs:80};`}));
 await page.addInitScript(({blocked,simulateTransport})=>{
  const play=HTMLMediaElement.prototype.play;
  window.musicCalls=[];window.allowTestAudio=!blocked;
  if(simulateTransport){
   // Playwright WebKit on Windows reports WAV support but has no functional
   // audio decoder/backend. Exercise controller/UI there with a transport
   // double; Chromium below also exercises actual media playback.
   Object.defineProperty(HTMLMediaElement.prototype,'src',{configurable:true,get(){return this.__testSrc||'';},set(value){this.__testSrc=value;}});
   Object.defineProperty(HTMLMediaElement.prototype,'paused',{configurable:true,get(){return !this.__testPlaying;}});
   HTMLMediaElement.prototype.pause=function(){this.__testPlaying=false;this.dispatchEvent(new Event('pause'));};
  }
  HTMLMediaElement.prototype.play=function(){
   window.musicElement=this;
   window.musicCalls.push(this.src);
   if(!window.allowTestAudio)return Promise.reject(new DOMException('User gesture required','NotAllowedError'));
   if(simulateTransport){this.__testPlaying=true;this.dispatchEvent(new Event('playing'));return Promise.resolve();}
   return play.call(this);
  };
 },{blocked,simulateTransport});
}
async function ready(page){await expect(page.locator('#experience')).toHaveAttribute('data-loading','ready');}
async function concentration(page){
 await page.locator('[data-action=begin]').click();
 for(let i=0;i<15;i++){
  await finishDialogue(page);if(await page.locator('.hold-button').count())return;
  await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
 }
 throw Error('Concentration not reached');
}

test('critical images stay concealed until decoded; later sprites never hold the initial reveal',async({page,browserName},testInfo)=>{
 let releasePanorama,releaseEffects;
 const panorama=new Promise(resolve=>releasePanorama=resolve),effects=new Promise(resolve=>releaseEffects=resolve);
 await page.route('**/room-panorama.png',async route=>{await panorama;await route.continue();});
 await page.route('**/leaf-flex-atlas-v3.png',async route=>{await effects;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#experience')).toHaveAttribute('data-loading','loading');
  await expect(page.locator('#experience')).toHaveAttribute('inert','');
  await expect(page.locator('.scene')).toBeHidden();await expect(page.locator('.scene-loader')).toBeVisible();
  // Windows WebKit's screenshot call waits for pending image preloads. The
  // visibility/inert assertions above still verify its unrevealed state.
  if(browserName!=='webkit')await page.screenshot({path:`.verification/v53/${testInfo.project.name}-loading.png`});
  releasePanorama();await ready(page);
  expect(await page.locator('.quiz-scene-art img[src]:not([hidden])').evaluateAll(imgs=>imgs.filter(img=>!img.matches('.wing-sprite:not(.is-active)')).every(img=>img.complete&&img.naturalWidth))).toBe(true);
  await expect(page.locator('.hands-motion')).toHaveAttribute('data-ready','true');
  await expect(page.locator('.water-effects')).toHaveAttribute('data-glass-pose','neutral');
  await expect(page.locator('.water-effects')).not.toHaveAttribute('data-ready','true');
  await expect(page.locator('.scene-loader')).toHaveCount(0);
  await page.locator('[data-action=begin]').click();await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
  await expect(page.locator('.scene-loader')).toHaveCount(0);await ready(page);
 }finally{releasePanorama();releaseEffects();}
});

test('a failed critical asset falls back without blocking quiz or showing broken images',async({page})=>{
 await page.route('**/room-panorama.png',route=>route.abort());
 await page.route('**/wing-neutral.png',route=>route.abort());
 await page.goto('/');await ready(page);
 await expect(page.locator('#experience')).toHaveAttribute('data-loading-result','fallback');
 await expect(page.locator('.room-panorama')).toBeHidden();
 await page.locator('[data-action=begin]').click();await expect(page.locator('.answer')).toHaveCount(4);
});

test('a stalled critical image times out, stays hidden if it arrives later, and releases the loader',async({page})=>{
 await page.clock.install();let release;const stalled=new Promise(resolve=>release=resolve);
 await page.route('**/room-panorama.png',async route=>{await stalled;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#experience')).toHaveAttribute('data-loading','loading');
  await page.clock.fastForward(45050);await ready(page);release();
  await expect(page.locator('.room-panorama')).toBeHidden();await page.locator('[data-action=begin]').click();await expect(page.locator('.answer')).toHaveCount(4);
 }finally{release();}
});

test('absent audio requests no media and the 44px header control fits beside IT/EN',async({page})=>{
 const media=[];page.on('request',r=>{if(r.resourceType()==='media')media.push(r.url());});
 await page.goto('/');await ready(page);
 const audio=page.locator('[data-audio]');await expect(audio).toHaveAttribute('data-audio-state','unavailable');
 const box=await audio.boundingBox(),language=await page.locator('.language-switch').boundingBox(),brand=await page.locator('.brand').boundingBox();
 expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);expect(box.x).toBeGreaterThanOrEqual(brand.x+brand.width);expect(box.x+box.width).toBeLessThanOrEqual(language.x);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await audio.click();await expect(audio).toHaveAttribute('data-audio-state','off');await page.reload();await ready(page);await expect(audio).toHaveAttribute('data-audio-state','off');
 await page.locator('[data-lang=en]').click();await expect(audio).toHaveAccessibleName('Turn music on');expect(media).toEqual([]);
});

test('blocked autoplay stays honest, explicit activation plays audio, mute persists and restores the current phase',async({page,browserName})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await configuredMusic(page,{blocked:true,simulateTransport:browserName==='webkit'&&process.platform==='win32'});
 await page.goto('/');await ready(page);const audio=page.locator('[data-audio]');
 await expect(audio).toHaveAttribute('data-audio-state','blocked');await expect(audio).toHaveAttribute('aria-pressed','false');
 await page.locator('[data-lang=en]').click();await page.locator('[data-lang=it]').click();expect(await page.evaluate(()=>window.musicCalls.length)).toBe(1);
 await page.evaluate(()=>window.allowTestAudio=true);await page.locator('[data-action=begin]').click();await expect(audio).toHaveAttribute('aria-pressed','true');
 await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();expect(await page.evaluate(()=>window.musicCalls.length)).toBe(2);
 await audio.click();await expect(audio).toHaveAttribute('data-audio-state','off');await page.reload();await ready(page);await expect(audio).toHaveAttribute('data-audio-state','off');
 expect(await page.evaluate(()=>window.musicCalls.length)).toBe(0);
 await page.evaluate(()=>window.allowTestAudio=true);await audio.click();await expect(audio).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
});

test('three music phases follow actual concentration, wait for Wing, and restore intro on replay',async({page,browserName})=>{
 await configuredMusic(page,{simulateTransport:browserName==='webkit'&&process.platform==='win32'});await page.goto('/');await ready(page);
 const audio=page.locator('[data-audio]');
 if(await audio.getAttribute('data-audio-state')==='blocked')await audio.click();
 await concentration(page);await expect(audio).toHaveAttribute('aria-pressed','true');
 const initialCalls=await page.evaluate(()=>window.musicCalls.length);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[data-action=reveal]').click();
 await expect(page.locator('[data-kind=revealed]')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.musicCalls.length)).toBe(initialCalls+1);
 const before=await page.evaluate(()=>window.musicCalls.at(-1));
 await page.locator('[data-lang=en]').click();expect(await page.evaluate(()=>window.musicCalls.at(-1))).toBe(before);
 await finishRevelation(page);await expect.poll(()=>page.evaluate(()=>window.musicCalls.length)).toBe(initialCalls+2);
 await audio.click();await page.locator('[data-action=replay]').click();await expect(audio).toHaveAttribute('data-audio-state','off');expect(await page.evaluate(()=>window.musicCalls.length)).toBe(initialCalls+2);
 await audio.click();await expect.poll(()=>page.evaluate(()=>window.musicCalls.length)).toBe(initialCalls+3);
 const calls=await page.evaluate(()=>window.musicCalls);expect(calls[initialCalls-1]).not.toBe(calls[initialCalls]);expect(calls[initialCalls]).not.toBe(calls[initialCalls+1]);expect(calls[initialCalls-1]).toBe(calls[initialCalls+2]);
});

test('enhancement replaces the actual painted waterline and resets',async({page},testInfo)=>{
 await page.goto('/review/divination.html');const canvas=page.locator('.water-effects');await expect(canvas).toHaveAttribute('data-ready','true');
 await page.locator('[data-type]').selectOption('enhancement');
 const values=[];
 for(const p of [0,.22,.30,.40,.67,1]){
  await page.evaluate(p=>{const w=window.divinationReview.water;w.pause();w.seek(w.getState().duration*p);},p);
  values.push(Number(await canvas.getAttribute('data-surface-y')));
  await page.screenshot({path:`.verification/v53/${testInfo.project.name}-water-${p}.png`});
 }
 expect(values[0]).toBeGreaterThan(values[1]);expect(values[1]).toBeGreaterThan(values[2]);expect(values[2]).toBeGreaterThanOrEqual(values[3]);expect(values[3]).toBe(values[4]);expect(values[4]).toBe(values[5]);
 const check=await canvas.evaluate(c=>{
  const plate=document.querySelector('.glass-plate'),a=Object.assign(document.createElement('canvas'),{width:c.width,height:c.height}),ctx=a.getContext('2d');ctx.drawImage(plate,0,0);
  // Measure the former front waterline at local y=145, not the moving leaf or
  // synthetic metadata. It must actually be replaced by new liquid pixels.
  const x=Math.round(443+440*.65),y=Math.round(560+145*.65),w=75,h=4;
  const before=ctx.getImageData(x,y,w,h).data;ctx.drawImage(c,0,0);const after=ctx.getImageData(x,y,w,h).data;
  return [...before].reduce((n,v,i)=>n+Math.abs(v-after[i]),0);
 });
 expect(check).toBeGreaterThan(3000);
 await page.evaluate(()=>window.divinationReview.water.reset());await expect(canvas).toHaveAttribute('data-rendered-effect','none');
});

test('permitted autoplay uses real media and a transient media error stays recoverable',async({playwright},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Actual permitted autoplay uses a dedicated Chromium policy context.');
 const browser=await playwright.chromium.launch({...process.platform==='win32'?{channel:'chrome'}:{},args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage({locale:'it-IT'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await configuredMusic(page);await page.goto('http://127.0.0.1:5173/');await ready(page);
  const control=page.locator('[data-audio]');await expect(control).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.evaluate(()=>window.musicElement.volume)).toBe(.22);
  expect(await page.evaluate(()=>({calls:window.musicCalls.length,paused:window.musicElement.paused}))).toEqual({calls:1,paused:false});
  await page.evaluate(()=>window.musicElement.dispatchEvent(new Event('error')));
  await expect(control).toHaveAttribute('data-audio-state','unavailable');await expect(control).toHaveAttribute('aria-pressed','false');
  await control.click();await control.click();await expect(control).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
 }finally{await browser.close();}
});

test('failed effect sprites keep the quiz usable through result and replay',async({page})=>{
 await page.route('**/leaf-flex-atlas-v3.png',route=>route.abort());
 await page.goto('/');await ready(page);await concentration(page);
 await page.locator('[data-action=reveal]').click();await finishRevelation(page);
 await expect(page.locator('.nen-title')).toBeVisible();
 await page.locator('[data-action=replay]').click();await ready(page);
 await expect(page.locator('[data-action=begin]')).toBeVisible();await expect(page.locator('.scene-loader')).toHaveCount(0);
});
