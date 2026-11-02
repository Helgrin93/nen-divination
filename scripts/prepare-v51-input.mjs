import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
 const pose=process.argv.includes('--gesture')?'gesture':'neutral';
 const png=await page.evaluate(async pose=>{
   const img=new Image();img.src=`/assets/scene-v3/wing-${pose}.png`;await img.decode();
   const c=Object.assign(document.createElement('canvas'),{width:1536,height:352});
   c.getContext('2d').drawImage(img,0,704,1536,320,0,0,1536,320);return c.toDataURL();
 },pose);
 await writeFile(`.verification/v51/elbow-${pose}-input.png`,Buffer.from(png.split(',')[1],'base64'));
}finally{await browser.close();}
