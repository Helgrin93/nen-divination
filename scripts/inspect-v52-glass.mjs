import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const before=process.argv.includes('--before'),root=`docs/v5.2/${before?'before':'after'}`,url=before?'http://127.0.0.1:5174/':'http://127.0.0.1:5173/';
await mkdir(root,{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage({viewport:{width:1920,height:912}});await page.goto(url);
 await page.locator('.water-effects[data-ready=true]').waitFor();
 const outputs=await page.evaluate(async()=>{
   const {composeGlassRepair,glassRepairRegion}=await import('/src/components/GlassComposition.js');
   const original=Object.assign(document.createElement('canvas'),{width:1000,height:680}),ctx=original.getContext('2d');
   ctx.drawImage(document.querySelector('.glass-plate'),443,560,650,442,0,0,1000,680);
   const patches=[];
   const crop=(source,x,y,w,h)=>{const c=Object.assign(document.createElement('canvas'),{width:w*3,height:h*3});c.getContext('2d').drawImage(source,x,y,w,h,0,0,c.width,c.height);return c.toDataURL();};
   for(const img of document.querySelectorAll('.wing-sprite')){
     await img.decode();const patch=composeGlassRepair(original,img);
     const under=Object.assign(document.createElement('canvas'),{width:1000,height:680}),uc=under.getContext('2d');
     uc.drawImage(document.querySelector('.glass-plate'),443,560,650,442,0,0,1000,680);
     uc.setTransform(1/.65,0,0,1/.65,-443/.65,-560/.65);uc.drawImage(img,1536*.18,0,1536*.64,1024*.64);uc.resetTransform();
     // Same masked sprite as the app, with the approved glass on top.
     const composed=Object.assign(document.createElement('canvas'),{width:1000,height:680}),cc=composed.getContext('2d');cc.drawImage(original,0,0);cc.drawImage(patch,glassRepairRegion.x,glassRepairRegion.y);
     patches.push({name:`${img.dataset.pose}-repair`,url:crop(patch,0,0,334,116)});
     patches.push({name:`${img.dataset.pose}-original`,url:crop(original,330,32,340,140)});
     patches.push({name:`${img.dataset.pose}-composed`,url:crop(composed,330,32,340,140)});
   }return patches;
 });
 for(const o of outputs)await writeFile(`${root}/glass-${o.name}.png`,Buffer.from(o.url.split(',')[1],'base64'));
 await page.screenshot({path:`${root}/1920x912-intro.png`});
 const source=await page.screenshot();
 const detail=await page.evaluate(async url=>{
   const img=new Image();img.src=url;await img.decode();
   const stage=document.querySelector('.unified-stage').getBoundingClientRect(),scale=stage.width/1536;
   const c=Object.assign(document.createElement('canvas'),{width:960,height:480});
   c.getContext('2d').drawImage(img,stage.x+650*scale,stage.y+575*scale,240*scale,120*scale,0,0,960,480);return c.toDataURL();
 },`data:image/png;base64,${source.toString('base64')}`);
 await writeFile(`${root}/glass-rendered.png`,Buffer.from(detail.split(',')[1],'base64'));
}finally{await browser.close();}
