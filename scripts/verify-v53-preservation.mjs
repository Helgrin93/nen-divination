import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from '@playwright/test';
const directory='.verification/v53-baseline';await mkdir(directory,{recursive:true});
const baselineRef=process.env.NEN_V53_BASELINE||'931197701d5e9b00f5b1b97ae09c06253630f420';
// Compare the five untouched reactions with the exact pre-change compositor,
// not with assertions that duplicate the new drawing code.
for(const name of ['WaterScene','WaterArtPass']){
 let text=execFileSync('git',['show',`${baselineRef}:src/components/${name}.js`],{encoding:'utf8'});
 text=text.replaceAll(/from '\.\/([^']+)'/g,(_,file)=>`from '${file==='WaterArtPass.js'?'/.verification/v53-baseline/WaterArtPass.js':`/src/components/${file}`}'`);
 await writeFile(`${directory}/${name}.js`,text);
}
const records=[];
for(const [device,engine,viewport]of[['desktop',chromium,{width:1440,height:900}],['mobile',webkit,{width:390,height:844}]]){
 const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
 try{
  const page=await browser.newPage({viewport});await page.goto('http://127.0.0.1:5173/review/divination.html');
  await page.locator('.water-effects[data-ready=true]').waitFor();
  const result=await page.evaluate(async()=>{
   await Promise.all([...document.querySelectorAll('.wing-sprite')].map(img=>img.decode()));
   const {mountWaterScene}=await import('/.verification/v53-baseline/WaterScene.js');
   const clone=document.querySelector('.scene').cloneNode(true);clone.style.display='none';document.body.append(clone);
   const baseline=mountWaterScene(clone),current=window.divinationReview.water;
   await new Promise((resolve,reject)=>{const started=performance.now();const check=()=>{if(baseline.getState().ready)resolve();else if(performance.now()-started>10000)reject(Error('Baseline load timed out'));else setTimeout(check,10);};check();});
   const results=[];
   for(const effect of ['emission','transmutation','conjuration','manipulation','specialization']){
    current.setEffect(effect);current.pause();baseline.setEffect(effect);baseline.pause();
    for(const p of [0,.25,.50,.75,1]){
     current.seek(current.getState().duration*p);
     // The review UI changes Wing on transmutation stage events. Give the
     // baseline the same pose before comparing transmitted shirt pixels.
     for(const img of clone.querySelectorAll('.wing-sprite'))img.className=document.querySelector(`.scene .wing-sprite[data-pose="${img.dataset.pose}"]`).className;
     baseline.seek(baseline.getState().duration*p);
     const a=document.querySelector('.scene .water-effects'),b=clone.querySelector('.water-effects');
     results.push({effect,p,identical:a.toDataURL()===b.toDataURL()});
    }
   }baseline.destroy();clone.remove();return results;
  });
  records.push({device,sourceRevision:baselineRef,frames:result});
 }finally{await browser.close();}
}
await writeFile('docs/v5.3/preservation.json',JSON.stringify(records,null,2));
if(records.some(record=>record.frames.some(frame=>!frame.identical)))throw Error('An untouched reaction changed');
console.log('50 frames of the other five Nen reactions match the pre-change canvas exactly.');
