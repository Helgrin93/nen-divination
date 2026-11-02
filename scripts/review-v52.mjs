// Capture the unchanged V5.1 baseline or the V5.2 objective fixes.
import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const before=process.argv.includes('--before'),phase=before?'before':'after',url=before?'http://127.0.0.1:5174/':'http://127.0.0.1:5173/';
const root=`docs/v5.2/${phase}`;await mkdir(root,{recursive:true});
const records=[];
for(const [name,engine,viewport]of[
 ['1920x1080',chromium,{width:1920,height:1080}],['1440x900',chromium,{width:1440,height:900}],['390x844',webkit,{width:390,height:844}],['375x667',webkit,{width:375,height:667}],
]){
 const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
 try{
  const page=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700,locale:'it-IT'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{let seed=56;Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};let visual=0;crypto.getRandomValues=a=>{a[0]=[.12,.83,.37,.61,.2,.94][visual++%6]*4294967295;return a;};});
  await page.goto(url);await page.locator('.water-effects[data-ready=true]').waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('.wing-sprite')].every(i=>i.dataset.ready==='true'));
  const shot=async state=>{await page.screenshot({path:`${root}/${name}-${state}.png`,animations:'disabled'});};
  await shot('intro');
  for(const pose of['neutral','smile','eyesClosed','gesture']){
   await page.evaluate(async pose=>{const {setupQuizScene}=await import('/src/components/QuizScene.js');window.v52Expression??=setupQuizScene(document.querySelector('.scene'));window.v52Expression(pose);},pose);
   await page.waitForTimeout(50);await shot(`pose-${pose}`);
  }
  await page.locator('[data-action=begin]').click();await shot('quiz');
  let observedComment=null;
  for(let n=0;n<15;n++){
   const comment=page.locator('[data-dialogue=short]');if(await comment.count()){
    const started=Date.now();await shot('comment');await comment.waitFor({state:'detached',timeout:5000});observedComment={remainingMs:Date.now()-started};
   }
   if(await page.locator('[data-kind=focus]').count())await shot('transition');
   if(await page.locator('[data-dialogue=important]').count())await page.locator('[data-action=resume]').click();
   if(await page.locator('.hold-button').count())break;
   await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
  }
  await shot('concentration');
  records.push({name,errors,observedComment,...await page.evaluate(()=>({title:document.title,header:document.querySelector('.brand-title').textContent,width:document.documentElement.scrollWidth,focusText:document.querySelector('.focus-card').textContent}))});
  console.log(`${phase}: ${name}`);
 }finally{await browser.close();}
}
await writeFile(`${root}/checks.json`,JSON.stringify(records,null,2));
