// Deterministic local evidence for the bounded V5.1 corrections.
import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv.includes('--before')?'before':'after';
const root=`docs/v5.1/${phase}`;
const baseURL=process.env.V51_REVIEW_URL||'http://127.0.0.1:5173/';
await mkdir(root,{recursive:true});
const records=[];
for(const [name,engine,viewport] of [
  ['1920x1080',chromium,{width:1920,height:1080}],
  ['1440x900',chromium,{width:1440,height:900}],
  ['390x844',webkit,{width:390,height:844}],
  ['375x667',webkit,{width:375,height:667}],
]){
  const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
  try{
    const page=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700,locale:'it-IT'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{
      let seed=56;Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
      let visual=0;crypto.getRandomValues=arr=>{arr[0]=[.12,.83,.37,.61,.2,.94][visual++%6]*4294967295;return arr;};
    });
    await page.goto(baseURL);
    await page.locator('.water-effects[data-ready=true]').waitFor();
    await page.waitForFunction(()=>[...document.querySelectorAll('.wing-sprite')].every(img=>img.dataset.ready==='true'));
    const shot=async(state,fullPage=false)=>{await page.screenshot({path:`${root}/${name}-${state}.png`,animations:'disabled',fullPage});};
    await shot('intro');
    // Inspect every decoded pose in the identical camera and lighting.
    for(const pose of ['neutral','smile','eyesClosed','gesture']){
      await page.evaluate(pose=>{
        document.querySelectorAll('.wing-sprite').forEach(img=>img.classList.toggle('is-active',img.dataset.pose===pose));
        document.querySelector('.wing-elbows')?.setAttribute('href',document.querySelector(`.wing-sprite[data-pose="${pose}"]`).src);
      },pose);
      await page.waitForTimeout(80);await shot(`pose-${pose}`);
    }
    await page.locator('[data-action=begin]').click();await shot('quiz');
    for(let n=0;n<15;n++){
      if(await page.locator('[data-dialogue=short]').count()){
        await shot('comment');await page.locator('[data-dialogue=short]').waitFor({state:'detached',timeout:6000});
      }
      if(await page.locator('[data-kind=focus]').count())await shot('transition');
      if(await page.locator('[data-dialogue=important]').count())await page.locator('[data-action=resume]').click();
      if(await page.locator('.hold-button').count())break;
      await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
    }
    await shot('concentration');
    await page.locator('[data-action=reveal]').click();await shot('revelation');
    await page.locator('[data-kind=revealed]').waitFor({timeout:45000});await shot('conclusion');
    await page.locator('[data-action=resume]').click();
    const portraits=()=>page.locator('.character-card img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode().catch(()=>{});})));
    await portraits();await shot('result-it',true);
    await page.locator('[data-lang=en]').click();await portraits();await shot('result-en',true);
    records.push({name,viewport,errors,...await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,title:document.querySelector('.brand').textContent,radarSymbols:[...document.querySelectorAll('.radar-axis')].map(el=>({type:el.dataset.nen,value:el.dataset.value,symbol:el.querySelector('.radar-kanji')?.textContent}))}))});
    console.log(`${phase}: ${name}`);
  }finally{await browser.close();}
}
await writeFile(`${root}/checks.json`,JSON.stringify(records,null,2));
