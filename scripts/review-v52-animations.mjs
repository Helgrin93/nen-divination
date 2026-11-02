// Inspect the current six animations. This does not modify their implementation.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {divinationEffects} from '../src/components/divinationTimeline.js';
const root='docs/v5.2/animations';await mkdir(root,{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{}),records=[];
try{
 for(const [device,viewport]of[['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  for(const type of Object.keys(divinationEffects)){
   const context=await browser.newContext({viewport,isMobile:device==='mobile',hasTouch:device==='mobile',locale:'it-IT',recordVideo:{dir:root,size:viewport}});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   if(device==='mobile'){const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
   await page.goto('http://127.0.0.1:5173/review/divination.html');
   await page.locator('.water-effects[data-ready=true]').waitFor();await page.locator('.wing-sprite[data-ready=true]').last().waitFor();
   await page.addStyleTag({content:'.review-controls{visibility:hidden}'});
   await page.evaluate(type=>{document.querySelector('[data-type]').value=type;window.divinationReview.play();window.divinationReview.water.pause();},type);
   const frames=[];
   for(const fraction of [0,.25,.5,.75,1]){
    const data=await page.evaluate(fraction=>{
     const w=window.divinationReview.water;w.seek(w.getState().duration*fraction);
     const water=document.querySelector('.water-effects'),original=document.querySelector('.glass-plate'),detail=Object.assign(document.createElement('canvas'),{width:600,height:860}),ctx=detail.getContext('2d');
     for(const image of[original,water])ctx.drawImage(image,620,570,300,430,0,0,600,860);
     return {detail:detail.toDataURL(),state:w.getState(),renderMs:Number(water.dataset.renderMs),droplets:Number(water.dataset.droplets),residues:Number(water.dataset.residues),pose:Number(water.dataset.leafPose),surfaceY:Number(water.dataset.surfaceY)};
    },fraction);
    const tag=String(fraction*100).padStart(3,'0');
    await page.screenshot({path:`${root}/${device}-${type}-${tag}.png`,animations:'disabled'});
    await writeFile(`${root}/${device}-${type}-${tag}-detail.png`,Buffer.from(data.detail.split(',')[1],'base64'));
    delete data.detail;frames.push({fraction,...data});
   }
   // Profile one real-time play without screenshot work in its frame loop.
   await page.evaluate(()=>{
    window.v52Samples=[];window.v52Recording=true;let last=performance.now();
    function record(now){if(!window.v52Recording)return;window.v52Samples.push({frameMs:now-last,renderMs:Number(document.querySelector('.water-effects').dataset.renderMs)});last=now;requestAnimationFrame(record);}
    window.divinationReview.play();requestAnimationFrame(record);
   });
   await page.waitForFunction(()=>window.divinationReview.water.getState().progress===1,null,{timeout:25000});
   const performanceData=await page.evaluate(()=>{
    window.v52Recording=false;
    const values=window.v52Samples.slice(2),quantile=(key,q)=>{const a=values.map(v=>v[key]).filter(Number.isFinite).sort((a,b)=>a-b);return a[Math.floor((a.length-1)*q)]||0;};
    return {samples:values.length,frameMedianMs:quantile('frameMs',.5),frameP95Ms:quantile('frameMs',.95),renderMedianMs:quantile('renderMs',.5),renderP95Ms:quantile('renderMs',.95),longFramesOver50Ms:values.filter(v=>v.frameMs>50).length};
   });
   const video=page.video();await context.close();await video.saveAs(`${root}/${device}-${type}.webm`);
   records.push({device,type,viewport,cpuThrottle:device==='mobile'?4:1,durationMs:divinationEffects[type].duration,frames,performance:performanceData,errors});
   await writeFile(`${root}/metrics.json`,JSON.stringify(records,null,2));
   console.log(`${device} ${type}: render p95 ${performanceData.renderP95Ms.toFixed(2)} ms, frame p95 ${performanceData.frameP95Ms.toFixed(1)} ms`);
  }
 }
}finally{await browser.close();}
