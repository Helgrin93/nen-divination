// Raster fallbacks come from the same editable vector used in browser tabs.
import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export async function prepareFavicon(){
 const svg=await readFile(new URL('../public/favicon.svg',import.meta.url),'utf8');
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
 try{
  const page=await browser.newPage();
  const images=await page.evaluate(async svg=>{
   const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);await image.decode();
   return [[16,'favicon-16.png'],[32,'favicon-32.png'],[180,'apple-touch-icon.png'],[192,'icon-192.png']].map(([size,name])=>{
    const canvas=Object.assign(document.createElement('canvas'),{width:size,height:size});
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,size,size);
    return {name,data:canvas.toDataURL('image/png').split(',')[1]};
   });
  },svg);
  for(const img of images)await writeFile(new URL('../public/'+img.name,import.meta.url),Buffer.from(img.data,'base64'));
 }finally{await browser.close();}
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)await prepareFavicon();
