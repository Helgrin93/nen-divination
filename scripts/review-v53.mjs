import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const phase=process.argv.includes('--before')?'before':'after';
const url=process.env.NEN_REVIEW_URL||'http://127.0.0.1:5173/';
if(phase==='before'&&!process.env.NEN_REVIEW_URL){
 try{execFileSync('git',['diff','--quiet','--','src','index.html']);}
 catch{throw Error('Before screenshots require the unchanged baseline. Set NEN_REVIEW_URL to its isolated server; existing before evidence is preserved.');}
}
const root=`docs/v5.3/${phase}`;
await mkdir(root,{recursive:true});
const records=[];
for(const [device,engine,viewport] of [['desktop',chromium,{width:1440,height:900}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
 try{
  const page=await browser.newPage({viewport,isMobile:device==='mobile',hasTouch:device==='mobile',locale:'it-IT'});
  const requests=[];page.on('requestfinished',r=>requests.push({url:r.url().replace('http://127.0.0.1:5173',''),...r.timing()}));
  await page.goto(url);
  if(phase==='after')await page.locator('#experience[data-loading=ready]').waitFor();
  await page.locator('.water-effects[data-ready=true]').waitFor();
  await page.locator('.hands-motion[data-ready=true]').waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.wing-sprite')].every(i=>i.dataset.ready==='true'));
  await page.screenshot({path:`${root}/${device}-intro.png`,animations:'disabled'});
  await page.goto(new URL('review/divination.html',url).href);
  await page.locator('.water-effects[data-ready=true]').waitFor();
  await page.locator('[data-type]').selectOption('enhancement');
  await page.evaluate(()=>window.divinationReview.water.pause());
  for(const [name,p] of [['initial',0],['middle',.22],['rim',.40],['overflow',.67],['final',1]]){
   await page.evaluate(p=>{const w=window.divinationReview.water;w.seek(w.getState().duration*p);},p);
   await page.screenshot({path:`${root}/${device}-${name}.png`});
   const box=await page.locator('.water-stage').boundingBox();
   // Capture native screen pixels around the actual glass, independent of viewport.
   const clip={x:Math.max(0,box.x+box.width*650/1536),y:Math.max(0,box.y+box.height*580/1024),width:box.width*240/1536,height:box.height*340/1024};
   await page.screenshot({path:`${root}/${device}-${name}-detail.png`,clip});
   records.push({device,name,p,...await page.locator('.water-effects').evaluate(c=>({...c.dataset}))});
  }
  await page.evaluate(()=>window.divinationReview.water.reset());
  await page.screenshot({path:`${root}/${device}-reset.png`});
  await writeFile(`${root}/${device}-requests.json`,JSON.stringify(requests,null,2));
 }finally{await browser.close();}
}
await writeFile(`${root}/frames.json`,JSON.stringify(records,null,2));
console.log(`V5.3 ${phase} screenshots saved to ${root}`);
