// Source copies are retained in .verification/v51/original before any writes.
// AI output is restricted to the bottom sleeve strips; heads, skin and hands
// always come from the approved original pixels.
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
 const result=await page.evaluate(async()=>{
  const canvas=(w=1536,h=1024)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
  const load=async src=>{const img=new Image();img.src=src;await img.decode();const c=canvas(img.width,img.height),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);return {img,c,data:ctx.getImageData(0,0,c.width,c.height)};};
  const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
  const names=['neutral','smile','eyes-closed','gesture'];
  const sources=await Promise.all(names.map(n=>load(`/.verification/v51/original/wing-${n}.png`)));
  const metrics=[];
  async function repair(source,path,gesture){
   const generated=await load(path),g=generated.data.data,gd=generated.c;
   const src=source.data.data;
   // Register the generated crop against unchanged upper sleeve/torso pixels.
   const samples=[];
   for(let y=750;y<950;y+=22)for(let x=180;x<1350;x+=25){const i=(y*1536+x)*4;if(src[i+3]>245)samples.push([x,y,i]);}
   let best={error:Infinity};
   for(let scale=.66;scale<=.76;scale+=.002)for(let ox=-30;ox<=30;ox+=3)for(let oy=600;oy<=670;oy+=3){
    let error=0,count=0;
    for(const [x,y,i] of samples){const gx=Math.round((x-ox)/scale),gy=Math.round((y-oy)/scale);if(gx<0||gy<0||gx>=gd.width||gy>=gd.height)continue;const j=(gy*gd.width+gx)*4;if(g[j+3]<245)continue;for(let k=0;k<3;k++)error+=Math.min(900,(src[i+k]-g[j+k])**2);count++;}
    if(count>samples.length*.85&&error/count<best.error)best={error:error/count,scale,ox,oy};
   }
   if(!Number.isFinite(best.error))throw new Error('Generated sleeve crop could not be registered');
   const aligned=canvas(1536,1152),ac=aligned.getContext('2d');ac.drawImage(generated.img,best.ox,best.oy,gd.width*best.scale,gd.height*best.scale);
   // Determine the new silhouette's contact line, ignoring isolated alpha dust.
   const a=ac.getImageData(0,0,1536,1152).data;
   let bottom=1020;
   for(let y=1000;y<1120;y++){let count=0;for(let x=100;x<1400;x++){const i=(y*1536+x)*4;if(a[i+3]>230&&Math.abs(a[i]-a[i+2])<25)count++;}if(count>80)bottom=y;}
   const strip=canvas(),sc=strip.getContext('2d');
   sc.drawImage(aligned,0,960,1536,bottom-960+3,0,960,1536,64);
   const patch=sc.getImageData(0,0,1536,1024).data;
   const data=new ImageData(new Uint8ClampedArray(src),1536,1024);
   for(let y=960;y<1024;y++)for(let x=70;x<1430;x++){
    // Only sleeve cloth: never copy generated skin, arms, cuffs or torso.
    const leftEnd=gesture?302:365,rightStart=gesture?1130:1108;
    if(!(x<leftEnd||x>rightStart))continue;
    const i=(y*1536+x)*4;
    const skin=src[i]-src[i+2]>32&&src[i+3]>100;
    if(skin)continue;
    const w=smooth((y-960)/22);
    for(let k=0;k<4;k++)data.data[i+k]=src[i+k]*(1-w)+patch[i+k]*w;
   }
   const c=canvas();c.getContext('2d').putImageData(data,0,0);metrics.push({pose:gesture?'gesture':'neutral',registration:best,generatedContact:bottom,editedStrip:[960,1024]});
   return{c,data};
  }
  const body=await repair(sources[0],'/.verification/v51/elbow-edit-candidate.png',false);
  const gesture=await repair(sources[3],'/.verification/v51/elbow-gesture-candidate.png',true);
  const images=[];
  for(let n=0;n<4;n++){
   let data=n===3?gesture.data:new ImageData(new Uint8ClampedArray(body.data.data),1536,1024);
   if(n===1||n===2){
    // Preserve original eyes/brows/mouth; the approved neutral owns everything
    // else, including all transparent underarm holes and the entire shirt.
    const original=sources[n].data.data;
    for(const [left,top,width,height] of [[560,300,360,140],[670,475,145,55]]){
     for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++){
      const i=(y*1536+x)*4,w=smooth(Math.min(x-left,left+width-1-x,y-top,top+height-1-y)/9);
      for(let k=0;k<3;k++)data.data[i+k]=data.data[i+k]*(1-w)+original[i+k]*w;
     }
    }
   }
   const c=canvas();c.getContext('2d').putImageData(data,0,0);images.push({name:names[n],url:c.toDataURL()});
  }
  return{images,metrics};
 });
 for(const img of result.images)await writeFile(`public/assets/scene-v3/wing-${img.name}.png`,Buffer.from(img.url.split(',')[1],'base64'));
 await writeFile('.verification/v51/wing-repair.json',JSON.stringify(result.metrics,null,2));console.log(result.metrics);
}finally{await browser.close();}
