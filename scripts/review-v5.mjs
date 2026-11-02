// Local, deterministic visual evidence; never included in the production bundle.
import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv.includes('--before')?'before':'after';
const root=`docs/v5-polish/${phase}`;
await mkdir(root,{recursive:true});
const records=[];
for(const [name,engine,viewport] of [
  ['desktop-wide',chromium,{width:1920,height:1080}],
  ['desktop',chromium,{width:1440,height:900}],
  ['iphone',webkit,{width:390,height:844}],
  ['iphone-small',webkit,{width:375,height:667}],
  ['android',chromium,{width:412,height:915}],
]){
  const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
  try{
    const page=await browser.newPage({viewport,isMobile:name.startsWith('iphone')||name==='android',hasTouch:!name.startsWith('desktop'),locale:'it-IT'});
    await page.addInitScript(()=>{
      let seed=56;
      Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
      // Presentation RNG only, independent of the seeded questionnaire.
      let visual=0;crypto.getRandomValues=arr=>{arr[0]=[.12,.83,.37,.61,.2,.94][visual++%6]*4294967295;return arr;};
    });
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('.water-effects[data-ready=true]').waitFor();
    await page.waitForFunction(()=>[...document.querySelectorAll('.wing-sprite')].every(img=>img.dataset.ready==='true'));
    const shot=async state=>{await page.screenshot({path:`${root}/${name}-${state}.png`,animations:'disabled'});};
    await shot('intro');
    await page.locator('[data-action=begin]').click();
    await shot('quiz');
    records.push({name,viewport,...await page.evaluate(()=>{
      const box=s=>{const {x,y,width,height,bottom}=document.querySelector(s).getBoundingClientRect();return{x,y,width,height,bottom};};
      return{stage:box('.unified-stage'),bubble:box('.speech-bubble'),answers:box('.answers'),navigation:box('.question-navigation'),documentWidth:document.documentElement.scrollWidth};
    })});
    await page.locator('.answer').last().scrollIntoViewIfNeeded();await shot('last-answer');
    for(let n=0;n<12;n++){
      if(await page.locator('[data-dialogue=short]').count()){
        await shot('interlude');await page.locator('[data-dialogue=short]').waitFor({state:'detached',timeout:5000});
      }
      if(await page.locator('[data-kind=focus]').count())await shot('pre-concentration');
      if(await page.locator('[data-dialogue=important]').count())await page.locator('[data-action=resume]').click();
      if(await page.locator('.hold-button').count())break;
      if(n===1||n===2)await shot(`expression-${n}`);
      await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
    }
    await shot('concentration');
    if(phase==='after'){
      await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-action=reveal]').click();
      await page.locator('[data-kind=revealed]').waitFor();await shot('conclusion-it');
      await page.locator('[data-lang=en]').click();await shot('conclusion-en');
      await page.locator('[data-action=resume]').click();await page.screenshot({path:`${root}/${name}-result.png`,fullPage:true});
    }
    console.log(`${phase}: ${name}`);
  }finally{await browser.close();}
}
await writeFile(`${root}/geometry.json`,JSON.stringify(records,null,2));
