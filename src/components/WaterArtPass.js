// Registered cel materials: no scene-wide filter and no runtime leaf rotation.
import {clamp,smooth} from './divinationTimeline.js';
import {artData} from './divinationArtData.js';
import {createRisingWater} from './EnhancementWater.js';
const make=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const waterMaterials=new WeakMap();
// Keep the illustrated spill silhouettes and ink, but give their translucent
// body the same transmitted colour as the liquid already in this scene.
function matchWaterMaterial(source,colour){
 const c=make(source.width,source.height),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,c.width,c.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){
  if(!d[i+3])continue;
  const light=(d[i]+d[i+1]+d[i+2])/3,highlight=smooth((light-218)/33),ink=1-smooth((light-68)/104);
  for(let k=0;k<3;k++)d[i+k]=colour[k]*(1-ink*.42)*(1-highlight*.84)+[249,247,232][k]*highlight*.84;
  d[i+3]*=.80+highlight*.16+ink*.04;
 }ctx.putImageData(pixels,0,0);return c;
}
const path=new Path2D('M364 104 Q500 58 636 104 C638 217 615 334 511 363 C413 365 365 265 364 104Z');
const surfacePath=new Path2D();surfacePath.ellipse(500,105,141,24,0,0,Math.PI*2);
const times=[0,.12,.25,.43,.61,.79,.90,1];
const positions=[[500,105],[498,105],[526,102],[544,101],[528,104],[468,108],[458,108],[464,106]];
// Smooth cubic tangents express a push, inertia, turn and final damping.
export function floatingLeafAt(p){
 let i=0;while(i<times.length-2&&p>times[i+1])i++;
 const t=clamp((p-times[i])/(times[i+1]-times[i])),h=times[i+1]-times[i],a=positions[i],b=positions[i+1];
 const coord=k=>{const prev=Math.max(0,i-1),next=Math.min(positions.length-1,i+2);const m0=i<2?0:(b[k]-positions[prev][k])/(times[i+1]-times[prev]);const m1=i>=times.length-3?0:(positions[next][k]-a[k])/(times[next]-times[i]);return (2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*m0*h+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*m1*h;};
 return {x:coord(0),y:coord(1),pose:Math.round(clamp(p)*80)};
}
function random(seed){return()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export function createSediment(){
 const rng=random(0x4e454e33),items=[];
 for(let i=0;i<62;i++){
  let x,y;do{const cluster=rng()<.42;x=cluster?434+(rng()-.5)*83:387+rng()*225;y=cluster?183+(rng()-.5)*78:135+rng()*152;}while(((x-500)/(135-(y-105)*.18))**2>1);
  const depth=rng(),family=Math.floor(rng()*5),sink=rng()<.45;
  items.push({x,y,depth,family,variant:Math.floor(rng()*3),birth:.10+rng()*.60,drift:(rng()-.5)*9,fall:sink?25+rng()*68:rng()*5,turn:(rng()-.5)*.8,angle:(rng()-.5)*2,size:(family===3?7:3.8)+rng()*3.4,opacity:.48+rng()*.35});
 }
 return items.sort((a,b)=>b.depth-a.depth);
}
export function createWaterArtPass({original,base,leaf,assets}){
 const originalCtx=original.getContext('2d',{willReadFrequently:true});
 const coloured=make(290,310),cc=coloured.getContext('2d',{willReadFrequently:true});cc.drawImage(base,355,75,290,310,0,0,290,310);
 const pixels=cc.getImageData(0,0,290,310);
 for(let y=0;y<310;y++)for(let x=0;x<290;x++){
  const k=(y*290+x)*4;if(!originalCtx.isPointInPath(path,x+355,y+75)){pixels.data[k+3]=0;continue;}
  const r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2],reflection=smooth((Math.min(r,g,b)-206)/36);
  pixels.data[k]=r+(Math.min(255,r*.97+12)*.93-r)*(1-reflection);
  pixels.data[k+1]=g+((g*.73+8)*.93-g)*(1-reflection);
  pixels.data[k+2]=b+((b*.72+9)*.93-b)*(1-reflection);
 }cc.putImageData(pixels,0,0);
 const reflections=make(290,310),rc=reflections.getContext('2d',{willReadFrequently:true});rc.drawImage(original,355,75,290,310,0,0,290,310);
 const rd=rc.getImageData(0,0,290,310);
 for(let y=0;y<310;y++)for(let x=0;x<290;x++){
  const k=(y*290+x)*4,lo=Math.min(rd.data[k],rd.data[k+1],rd.data[k+2]),hi=Math.max(rd.data[k],rd.data[k+1],rd.data[k+2]);
  rd.data[k+3]=originalCtx.isPointInPath(path,x+355,y+75)?255*smooth((lo-171)/47)*(1-smooth((hi-lo-24)/45)):0;
 }rc.putImageData(rd,0,0);
 const diffusion=Array.from({length:8},(_,f)=>{const c=make(256,320),cx=c.getContext('2d');cx.filter='blur(5px)';cx.drawImage(assets.diffusion,f%4*256,Math.floor(f/4)*320,256,320,0,0,256,320);return c;});
 const wash=make(290,310),wc=wash.getContext('2d');
 const particles=createSediment();
 const residueSprites=Array.from({length:15},(_,i)=>{
  const c=make(64,64),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(assets.residues,i%5*64,Math.floor(i/5)*64,64,64,0,0,64,64);
  x.getImageData(0,0,64,64);return c;
 });
 const risingWater=createRisingWater({original,base});
 const restoreRim=new Path2D();restoreRim.ellipse(500,92,157,48,0,0,Math.PI*2);restoreRim.ellipse(500,89,146,39,0,0,Math.PI*2);
 const front=new Path2D('M373 111 Q386 115 402 118 C391 231 416 321 454 344 L435 337 C393 302 374 216 373 111Z M612 114 L631 106 C637 225 610 312 566 341 L554 345 C599 295 616 216 612 114Z');
 let spills=waterMaterials.get(assets.flow);
 if(!spills){
  const sample=originalCtx.getImageData(480,155,40,45).data,colour=[0,0,0];
  for(let i=0;i<sample.length;i+=4)for(let k=0;k<3;k++)colour[k]+=sample[i+k]/(sample.length/4);
  const rawDrop=make(48,80);rawDrop.getContext('2d').drawImage(assets.overflow,1096,602,83,175,0,0,48,80);
  const impactRects=[[869,802,168,140],[1054,806,177,139],[1230,838,222,110]];
  spills={flow:matchWaterMaterial(assets.flow,colour),drop:matchWaterMaterial(rawDrop,colour),impacts:impactRects.map(rect=>{
   const c=make(rect[2],rect[3]);c.getContext('2d').drawImage(assets.overflow,...rect,0,0,c.width,c.height);return matchWaterMaterial(c,colour);
  })};waterMaterials.set(assets.flow,spills);
 }
 // Keep the illustrated puddle silhouette, but darken the actual wood grain
 // beneath it so the table reads as damp rather than a faint glass highlight.
 const wetRect={x:320,y:556,width:360,height:80};
 const wetTable=make(wetRect.width,wetRect.height),wt=wetTable.getContext('2d',{willReadFrequently:true});
 wt.drawImage(original,wetRect.x,wetRect.y,wetRect.width,wetRect.height,0,0,wetRect.width,wetRect.height);
 const wood=wt.getImageData(0,0,wetRect.width,wetRect.height),mask=make(wetRect.width,wetRect.height),mc=mask.getContext('2d',{willReadFrequently:true});
 mc.drawImage(assets.overflow,90,786,653,139,0,0,wetRect.width,wetRect.height);
 const wetAlpha=mc.getImageData(0,0,wetRect.width,wetRect.height).data;
 for(let i=0;i<wood.data.length;i+=4){wood.data[i]*=.76;wood.data[i+1]*=.76;wood.data[i+2]*=.76;wood.data[i+3]=wetAlpha[i+3]*.90;}
 wt.putImageData(wood,0,0);
 function clean(ctx){ctx.drawImage(assets.clean,(650-443)/.65,(600-560)/.65,240/.65,60/.65);}
 function originalLeaf(ctx,x=500,y=105){ctx.drawImage(leaf,x-500,y-105);}
 function restoreGlass(ctx,rim=false){ctx.drawImage(reflections,355,75);ctx.save();ctx.clip(front);ctx.drawImage(original,0,0);ctx.restore();if(rim){ctx.save();ctx.clip(restoreRim,'evenodd');ctx.drawImage(original,0,0);ctx.restore();}}
 function arc(ctx,x,y,age,energy,direction=0){
  if(age<0||age>1)return;
  const radius=9+age*73,alpha=(1-age)**2*energy;
  for(const [dy,color]of[[.7,`rgba(62,76,65,${alpha*.22})`],[0,`rgba(247,240,213,${alpha*.27})`]]){
   ctx.strokeStyle=color;ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(x,y+dy,radius,radius*.145,direction,Math.PI*.13,Math.PI*1.05);ctx.stroke();
   ctx.beginPath();ctx.ellipse(x+1,y+dy,radius*.92,radius*.135,direction,Math.PI*1.19,Math.PI*1.86);ctx.stroke();
  }
 }
 function manipulation(ctx,p){
  if(!p)return {surfaceY:105,pose:0};clean(ctx);
  const position=floatingLeafAt(p);ctx.save();ctx.clip(surfacePath);
  for(const birth of [.10,.20,.30,.42,.54,.65,.76,.87]){
   const q=floatingLeafAt(birth),before=floatingLeafAt(Math.max(0,birth-.015)),velocity=Math.hypot(q.x-before.x,(q.y-before.y)*4);
   arc(ctx,q.x-58,q.y+2,(p-birth)/.23,Math.min(1,.3+velocity*.24));
  }
  const f=position.pose;ctx.drawImage(assets.flex,f%9*336,Math.floor(f/9)*128,336,128,position.x-112,position.y-64/1.5,224,128/1.5);ctx.restore();
  return {surfaceY:105,pose:f,leafX:position.x,leafY:position.y};
 }
 function emission(ctx,p){
  if(p<=.08)return {surfaceY:105};
  const t=smooth((p-.08)/.86)*7,i=Math.min(6,Math.floor(t)),mix=t-i;
  wc.clearRect(0,0,290,310);wc.globalCompositeOperation='source-over';wc.globalAlpha=(1-mix)*smooth((p-.08)/.12);wc.drawImage(diffusion[i],0,0,290,310);
  wc.globalCompositeOperation='lighter';wc.globalAlpha=mix;wc.drawImage(diffusion[i+1],0,0,290,310);
  wc.globalAlpha=1;wc.globalCompositeOperation='source-in';wc.drawImage(coloured,0,0);wc.globalCompositeOperation='source-over';
  clean(ctx);ctx.drawImage(wash,355,75);originalLeaf(ctx);restoreGlass(ctx,true);return {surfaceY:105,diffusion:t};
 }
 function conjuration(ctx,p){
  // Fix the resampling mode across different depth scales and timeline seeks.
  ctx.save();ctx.clip(path);ctx.imageSmoothingQuality='high';let count=0;
  for(const item of particles){
   const age=(p-item.birth)/(1-item.birth);if(age<=0)continue;count++;
   const drag=1-Math.exp(-age*3),fall=smooth(age)*item.fall;
   const x=item.x+item.drift*drag*(1-item.depth*.3),y=item.y+fall,size=item.size*2.25*(1-item.depth*.18);
   ctx.save();ctx.translate(x,y);ctx.rotate(item.angle+item.turn*drag);ctx.globalAlpha=smooth(age/.18)*Math.min(.98,item.opacity+.20)*(1-item.depth*.18);
   const width=item.family===3?size*1.5:size,height=item.family===3?size*.5:size*.8;
   ctx.drawImage(residueSprites[item.variant*5+item.family],-width/2,-height/2,width,height);ctx.restore();
  }ctx.restore();restoreGlass(ctx);return {surfaceY:105,residues:count};
 }
 function flowPose(p,side){
  const phase=clamp((p-.41-side*.035)/(.54-side*.035))*7,index=Math.min(7,Math.floor(phase)),next=Math.min(7,index+1),mix=smooth(phase-index);
  const a=artData.overflow.flowTips[index*2+side],b=artData.overflow.flowTips[next*2+side];
  return {index,next,mix,x:(side?655:343)-artData.overflow.pivot[0]+a.x+(b.x-a.x)*mix,y:(side?86:81)-artData.overflow.pivot[1]+a.y+(b.y-a.y)*mix};
 }
 function enhancement(ctx,p){
  if(!p)return {surfaceY:105,droplets:0};clean(ctx);
  const water=risingWater(ctx,p);
  ctx.save();ctx.beginPath();ctx.ellipse(500,water.surfaceY,145,34,0,0,Math.PI*2);ctx.clip();arc(ctx,491,water.surfaceY,(p-.04)/.33,.28);ctx.restore();
  originalLeaf(ctx,500,water.leafY);water.restoreRim();
  if(p>.41&&p<.99){
   const fade=smooth((p-.41)/.045)*(1-smooth((p-.94)/.05));
   for(let side=0;side<2;side++){
    const [w,h]=artData.overflow.cell,f=flowPose(p,side),x=(side?655:343)-artData.overflow.pivot[0],y=(side?86:81)-artData.overflow.pivot[1];
    ctx.save();ctx.globalAlpha=fade*(1-f.mix)*.94;ctx.drawImage(spills.flow,f.index*w,side*h,w,h,x,y,w,h);
    ctx.globalAlpha=fade*f.mix*.94;ctx.drawImage(spills.flow,f.next*w,side*h,w,h,x,y,w,h);ctx.restore();
   }
  }
  let drops=0;
  for(const [birth,side]of[[.60,0],[.665,0],[.70,1],[.735,0],[.77,1]]){
   const age=(p-birth)/.155;if(age<0||age>1.14)continue;
   const origin=flowPose(birth,side),land=610+(side?3:0),x=origin.x+(side?-1:1)*age*3;
   if(age<1){drops++;ctx.save();ctx.globalAlpha=.85;ctx.drawImage(spills.drop,x-3.1,origin.y+(land-origin.y)*age*age,6.2,8+age*5);ctx.restore();}
   else{const q=(age-1)/.14,step=Math.min(2,Math.floor(q*3));ctx.save();ctx.globalAlpha=(1-q)*.45;ctx.drawImage(spills.impacts[step],x-15,land-8,30,13);ctx.restore();}
  }
  const wet=smooth((p-.75)/.20);
  if(wet){
   ctx.save();ctx.beginPath();ctx.rect(0,0,1000,680);ctx.moveTo(626,565);ctx.ellipse(500,565,126,45,0,0,Math.PI*2);ctx.closePath();ctx.clip('evenodd');
   ctx.globalAlpha=wet;ctx.drawImage(wetTable,wetRect.x,wetRect.y);
   ctx.globalAlpha=.16*wet;ctx.drawImage(assets.overflow,90,786,653,139,wetRect.x,wetRect.y,wetRect.width,wetRect.height);ctx.restore();
  }
  return {surfaceY:water.surfaceY,droplets:drops};
 }
 function transmutation(ctx,p){
  // One initial impulse, then a genuine quiet interval before Wing's reply.
  ctx.save();ctx.clip(surfacePath);arc(ctx,493,106,p/.24,.17);ctx.restore();return {surfaceY:105};
 }
 return {draw(ctx,effect,f){
  const p=f.progress;
  if(effect==='manipulation')return manipulation(ctx,p);
  if(effect==='emission')return emission(ctx,p);
  if(effect==='conjuration')return conjuration(ctx,p);
  if(effect==='enhancement')return enhancement(ctx,p,f.rise);
  return transmutation(ctx,p);
 }};
}
