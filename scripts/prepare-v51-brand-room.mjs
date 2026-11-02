// Lossless composition of supplied art. No generated room or invented branding.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {prepareFavicon} from './prepare-favicon.mjs';
await mkdir('public/assets/brand',{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
 const outputs=await page.evaluate(async()=>{
   const load=async src=>{const i=new Image();i.src=src;await i.decode();return i;};
   const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
   const original=await load('/assets/scene-v3/unified-goblet-scene.png');
   const left=await load('/assets/room-v5/room-left.png'),right=await load('/assets/room-v5/room-right.png');
   const panorama=canvas(2560,1024),pc=panorama.getContext('2d');pc.drawImage(left,0,0);pc.drawImage(original,512,0);pc.drawImage(right,2048,0);
   const comparison=await load('/NEN_DIVINATION_V5_CODEX/references/13_LOGHI_CONFRONTO_UTENTE.png');
   // The left logo in reference 13 is complete; reference 14 clips its right edge.
   const logo=canvas(944,440),lc=logo.getContext('2d');lc.drawImage(comparison,44,110,944,440,0,0,944,440);
   const sample=[...lc.getImageData(0,0,1,1).data];
   // This source already has transparency: retain its black linework and alpha.
   const small=canvas(236,110);small.getContext('2d').drawImage(logo,0,0,236,110);
   return {sample,images:[['public/assets/room-v5/room-panorama.png',panorama],['public/assets/brand/hunter-logo.png',small]].map(([path,c])=>({path,url:c.toDataURL()}))};
 });
 console.log('Logo source corner RGBA:',outputs.sample);
 for(const o of outputs.images){await writeFile(o.path,Buffer.from(o.url.split(',')[1],'base64'));console.log(o.path);}
}finally{await browser.close();}
// Keep the user's current tab symbol when preparing room/header art again.
await prepareFavicon();
