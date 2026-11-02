import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('.verification/v51',{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
const page=await browser.newPage({viewport:{width:1920,height:1080}});await page.goto('http://127.0.0.1:5173/');
await page.locator('.water-effects[data-ready=true]').waitFor();
const outputs=await page.evaluate(async()=>{
 const load=async src=>{const i=new Image();i.src=src;await i.decode();return i;};
 const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
 const out=[];
 for(const name of ['neutral','smile','eyes-closed','gesture']){
   const img=await load(`/assets/scene-v3/wing-${name}.png`);
   const c=canvas(1536,1024),ctx=c.getContext('2d');ctx.fillStyle='#eaae4e';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);
   const crop=canvas(1536,300);crop.getContext('2d').drawImage(c,0,724,1536,300,0,0,1536,300);
   out.push({name:`body-${name}`,url:crop.toDataURL()});
 }
 const glass=canvas(480,260),gc=glass.getContext('2d');
 const scene=await load('/assets/scene-v3/unified-goblet-scene.png');
 gc.drawImage(scene,648,574,240,130,0,0,480,260);out.push({name:'glass-source',url:glass.toDataURL()});
 // Original PNG edge samples, including alpha, reveal asset versus CSS seams.
 const layers=[];
 for(const name of ['scene-v3/unified-goblet-scene','divination/rug-border-repair','room-v5/room-left','room-v5/room-right']){
   const img=await load(`/assets/${name}.png`),c=canvas(img.width,img.height),ctx=c.getContext('2d');ctx.drawImage(img,0,0);
   layers.push({name,width:img.width,height:img.height,samples:[0,1,img.width-2,img.width-1].map(x=>({x,pixels:[20,200,400,600,652,654,800,1000].map(y=>({y,rgba:[...ctx.getImageData(x,y,1,1).data]}))}))});
 }
 return {out,layers};
});
for(const o of outputs.out)await writeFile(`.verification/v51/${o.name}.png`,Buffer.from(o.url.split(',')[1],'base64'));
await writeFile('.verification/v51/layers.json',JSON.stringify(outputs.layers,null,2));
const shot=await page.screenshot();
const details=await page.evaluate(async url=>{
 const img=new Image();img.src=url;await img.decode();return [[460,640,350,110,'left-elbow'],[1120,640,300,110,'right-elbow'],[835,630,250,100,'glass-rendered'],[175,64,50,1016,'left-seam'],[1697,64,50,1016,'right-seam']].map(([x,y,w,h,name])=>{
   const c=Object.assign(document.createElement('canvas'),{width:w*2,height:h*2});c.getContext('2d').drawImage(img,x,y,w,h,0,0,w*2,h*2);return{name,url:c.toDataURL()};
 });
},`data:image/png;base64,${shot.toString('base64')}`);
for(const o of details)await writeFile(`.verification/v51/${o.name}.png`,Buffer.from(o.url.split(',')[1],'base64'));
}finally{await browser.close();}
