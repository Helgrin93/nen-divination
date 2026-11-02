import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root='docs/v5-polish';
const before=JSON.parse(await readFile(`${root}/before/geometry.json`));
const after=JSON.parse(await readFile(`${root}/after/geometry.json`));
if(JSON.stringify(before)!==JSON.stringify(after))throw Error('The original camera or interactive layout moved.');
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
const report={layoutUnchanged:true,centralPixelComparisons:[],originalAssets:[]};
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
  for(const record of before)for(const state of ['intro','quiz','last-answer']){
    const difference=await page.evaluate(async({name,state,stage})=>{
      const load=async phase=>{const i=new Image();i.src=`/docs/v5-polish/${phase}/${name}-${state}.png`;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{c,p:ctx.getImageData(0,0,c.width,c.height).data};};
      const a=await load('before'),b=await load('after');
      let changed=0,changedOverOne=0,maxDelta=0,compared=0;
      // Exclude the single resampling pixel at the boundary of the old camera.
      for(let y=Math.ceil(stage.y)+1;y<Math.min(a.c.height,Math.floor(stage.bottom))-1;y++)
        for(let x=Math.max(0,Math.ceil(stage.x))+1;x<Math.min(a.c.width,Math.floor(stage.x+stage.width))-1;x++){
          const i=(y*a.c.width+x)*4;let delta=0;
          for(let k=0;k<4;k++)delta=Math.max(delta,Math.abs(a.p[i+k]-b.p[i+k]));
          if(delta)changed++;if(delta>1)changedOverOne++;maxDelta=Math.max(maxDelta,delta);compared++;
        }
      return{compared,changed,changedOverOne,maxDelta};
    },{name:record.name,state,stage:record.stage});
    report.centralPixelComparisons.push({viewport:record.viewport,state,...difference});
  }
  const files=execFileSync('git',['ls-files','public/assets/scene-v3','public/assets/divination'],{encoding:'utf8'}).trim().split(/\r?\n/);
  for(const file of files){
    const original=execFileSync('git',['show',`HEAD:${file}`],{maxBuffer:25*1024*1024});
    const current=await readFile(file),unchanged=original.equals(current);
    report.originalAssets.push({file,unchanged,sha256:createHash('sha256').update(current).digest('hex')});
  }
  // Same visual state as the user's wide, shorter screenshot; the side art is
  // temporarily hidden for its local comparison, with the actual app intact.
  await page.setViewportSize({width:1920,height:912});await page.goto('http://127.0.0.1:5173/');
  await page.locator('.water-effects[data-ready=true]').waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.quiz-scene-art img')].every(i=>i.complete&&i.naturalWidth));
  await page.screenshot({path:`${root}/after/desktop-reference-intro.png`,animations:'disabled'});
  await page.locator('.room-wing').evaluateAll(images=>images.forEach(i=>i.style.visibility='hidden'));
  await page.screenshot({path:`${root}/before/desktop-reference-intro.png`,animations:'disabled'});
  report.originalAssetsUnchanged=report.originalAssets.every(a=>a.unchanged);
  report.centralPixelsUnchanged=report.centralPixelComparisons.every(a=>a.changed===0);
  report.centralPixelsWithinOneLevel=report.centralPixelComparisons.every(a=>a.changedOverOne===0);
  await writeFile(`${root}/preservation.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({layoutUnchanged:report.layoutUnchanged,centralComparisons:report.centralPixelComparisons.length,exactComparisons:report.centralPixelComparisons.filter(a=>a.changed===0).length,centralPixelsWithinOneLevel:report.centralPixelsWithinOneLevel,originalAssets:files.length,originalAssetsUnchanged:report.originalAssetsUnchanged}));
  if(!report.originalAssetsUnchanged||!report.centralPixelsWithinOneLevel)throw Error('Preservation check failed; inspect preservation.json.');
}finally{await browser.close();}
