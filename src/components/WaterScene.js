// One compositor owns the registered liquid; illustrated atlases supply complex shapes.
import { createWaterArtPass } from './WaterArtPass.js';
import {composeGlassRepair,glassRepairRegion} from './GlassComposition.js';
import { waterRegion as region } from './sceneGeometry.js';
import { divinationEffects, sampleDivination, clamp, smooth } from './divinationTimeline.js';
import {prepareImage} from '../services/sceneLoading.js';
const W=1000,H=680;
const leafOutline='M416 109 Q439 98 462 91 Q507 80 552 95 L588 105 L588 109 L568 110 Q535 128 485 122 Q450 122 416 109 Z';
const liquidOutline='M364 104 Q500 58 636 104 C638 217 615 334 511 363 C413 365 365 265 364 104Z';
const frontHighlights='M373 111 Q386 115 402 118 C391 231 416 321 454 344 L435 337 C393 302 374 216 373 111Z M612 114 L631 106 C637 225 610 312 566 341 L554 345 C599 295 616 216 612 114Z';
const makeCanvas=(w=W,h=H)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
export function mountWaterScene(scene,{deferEffects=false,poseReady=Promise.resolve()}={}){
  const canvas=scene.querySelector('.water-effects'),image=scene.querySelector('.glass-plate');
  if(!canvas||!image)throw new Error('The registered canvas and original scene are required.');
  const ctx=canvas.getContext('2d',{willReadFrequently:true}),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let leafMask=new Path2D(leafOutline);
  const interior=new Path2D(liquidOutline),highlights=new Path2D(frontHighlights),assets={};
  let art,original,base,leaf,glassRepair,preparedWing,loaded=false,frame=0,last=0,elapsed=0,holdTime=0,concentration=0;
  let effect='none',holding=false,paused=false,active=true,ready=false,completed=false,fragments=[];
  function crop(source,...rect){const c=makeCanvas(rect[2],rect[3]);c.getContext('2d').drawImage(source,...rect,0,0,c.width,c.height);return c;}
  function preparePlate(){
    original=makeCanvas();original.getContext('2d').drawImage(image,region.x,region.y,region.width,region.height,0,0,W,H);
    preparedWing=scene.querySelector('.wing-sprite.is-active[data-ready=true]');
    glassRepair=composeGlassRepair(original,preparedWing);
    original.getContext('2d').drawImage(glassRepair,glassRepairRegion.x,glassRepairRegion.y);
  }
  function drawInitial(){
    ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.setTransform(region.width/W,0,0,region.height/H,region.x,region.y);
    ctx.drawImage(glassRepair,glassRepairRegion.x,glassRepairRegion.y);
    canvas.dataset.glassPose=preparedWing?.dataset.pose||'unavailable';
  }
  function prepare(){
    if(!active||!loaded)return;
    preparePlate();
    base=makeCanvas();const bc=base.getContext('2d',{willReadFrequently:true});bc.drawImage(original,0,0);
    // Infer a precise matte from the green blade in the approved raster.
    const src=bc.getImageData(0,0,W,H).data;
    // Derive the footprint from the actual approved raster, including its
    // upper edge and stem, rather than an approximate hand-authored outline.
    leafMask=new Path2D();
    for(let y=80;y<126;y++){
      let left=600,right=400;
      for(let x=405;x<600;x++){
        const i=(y*W+x)*4;
        if(src[i+1]-src[i]>12&&src[i+1]-src[i+2]>35){left=Math.min(left,x);right=Math.max(right,x);}
      }
      if(right>=left)leafMask.rect(left-1,y-1,right-left+3,3);
    }
    // A local alpha repair reconstructed from adjacent original pixels avoids
    // the leaf-shaped amber ghost in the AI clean plate. No other scene pixel
    // can be replaced by this 240 x 60 registered patch.
    bc.drawImage(assets.clean,(650-region.x)/.65,(600-region.y)/.65,240/.65,60/.65);
    leaf=makeCanvas();const lc=leaf.getContext('2d');lc.clip(leafMask);lc.drawImage(original,0,0);
    fragments=[[954,627,82,58],[1065,598,51,42],[1161,620,46,38],[1009,686,64,41],[1112,699,48,36],[1180,672,64,57],[1265,649,38,38]].map(r=>crop(assets.leaves,...r));
    art=createWaterArtPass({original,base,leaf,assets});
    ready=true;scene.dataset.waterAsset='ready';canvas.dataset.ready='true';draw();
    canvas.dataset.glassPose=preparedWing?.dataset.pose||'unavailable';
    if((holding||(effect!=='none'&&!completed))&&!reduced.matches)schedule(true);else finishIfNeeded();
  }
  function sprite(source,x,y,w,h,alpha=1){if(alpha<=0)return;ctx.save();ctx.globalAlpha=clamp(alpha);ctx.drawImage(source,x,y,w,h);ctx.restore();}
  function atlas(rect,dest,alpha=1,source=assets.overflow){if(alpha<=0)return;ctx.save();ctx.globalAlpha=clamp(alpha);ctx.drawImage(source,...rect,...dest);ctx.restore();}
  function ripples(y,strength,cx=500){
    if(strength<.001)return;
    ctx.save();ctx.beginPath();ctx.ellipse(500,y,139,22,0,0,Math.PI*2);ctx.clip();
    for(let i=0;i<3;i++){
      const phase=(elapsed/1450+i/3)%1,r=14+phase*135,alpha=Math.sin(phase*Math.PI)*strength;
      for(const [offset,color] of [[1,'rgba(64,77,68,'],[0,'rgba(247,245,222,']]){
        ctx.strokeStyle=color+(alpha*.27)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(cx,y+offset,r,r*.155,0,0,Math.PI*2);ctx.stroke();
      }
    }ctx.restore();
  }
  function drawLeaf(x=500,y=105,angle=0,alpha=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
    // Rotation in the water plane followed by its perspective compression.
    ctx.scale(1,.24);ctx.rotate(angle);ctx.scale(1,1/.24);ctx.translate(-500,-105);ctx.drawImage(leaf,0,0);ctx.restore();
  }
  function drawWithering(f){
    const q=f.wither*5,index=Math.min(5,Math.floor(q)),mix=smooth(q-index),residual=1-smooth((f.progress-.70)/.23);
    const rects=[[19,146,409,151],[461,146,410,151],[903,146,410,151],[1346,146,410,151],[19,586,409,158],[461,586,410,158]];
    const replace=smooth((f.progress-.08)/.14);drawLeaf(500,105,0,1-replace);
    atlas(rects[index],[416,85,172,40],replace*residual*(1-mix),assets.leaves);
    if(index<5)atlas(rects[index+1],[416,85,172,40],replace*residual*mix,assets.leaves);
    ctx.save();ctx.clip(interior);
    for(let i=0;i<23;i++){
      const birth=.58+i%8*.025,age=clamp((f.progress-birth)/(1-birth));if(!age)continue;
      const x=433+(i*41)%132+Math.sin(i*1.7)*age*15,sink=i%3!==0,y=103+Math.sin(i)*4+(sink?age*age*(94+i%5*19):age*9),size=4+i%4*1.6;
      ctx.save();ctx.translate(x,y);ctx.rotate(age*(i%2?1:-1)*1.8);
      sprite(fragments[i%fragments.length],-size/2,-size/3,size,size*.65,smooth(age/.16)*(sink?.60:.85));ctx.restore();
    }ctx.restore();
  }
  function draw(){
    if(!ready)return;
    if(scene.querySelector('.wing-sprite.is-active[data-ready=true]')!==preparedWing){prepare();return;}
    const drawingStarted=performance.now();
    const f=sampleDivination(effect,elapsed),special=effect==='specialization';
    ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(region.width/W,0,0,region.height/H,region.x,region.y);
    ctx.drawImage(glassRepair,glassRepairRegion.x,glassRepairRegion.y);
    let surfaceY=105;
    if(effect!=='none'&&!special){
      const state=art.draw(ctx,effect,f);surfaceY=state.surfaceY;
      canvas.dataset.droplets=String(state.droplets||0);
      canvas.dataset.leafPose=String(state.pose||0);
      canvas.dataset.leafX=String(state.leafX||500);canvas.dataset.leafY=String(state.leafY||105);
      canvas.dataset.residues=String(state.residues||0);canvas.dataset.artPass='3';
    }else{
      // Approved Specialization and concentration preserve their exact raster
      // order, texture sampling and timing; the new art does not touch them.
      const altered=concentration>0||special;
      if(altered)ctx.drawImage(assets.clean,(650-region.x)/.65,(600-region.y)/.65,240/.65,60/.65);
      ripples(105,concentration*.68,500);
      if(special)drawWithering(f);
      else if(altered)drawLeaf(500,105+Math.sin(elapsed/500)*.40*concentration,Math.sin(elapsed/680)*.006*concentration);
      if(special){ctx.save();ctx.clip(highlights);ctx.drawImage(original,0,0);ctx.restore();}
      canvas.dataset.droplets='0';
    }
    const stageChanged=canvas.dataset.stage!==f.stage||canvas.dataset.renderedEffect!==effect;
    Object.assign(canvas.dataset,{renderedEffect:effect,effectProgress:String(f.progress),concentration:concentration.toFixed(3),surfaceY:(region.y+surfaceY*region.height/H).toFixed(2),stage:f.stage,paused:String(paused),elapsed:String(elapsed),duration:String(f.duration)});
    scene.dataset.effectStage=f.stage;
    canvas.dataset.renderMs=(performance.now()-drawingStarted).toFixed(3);
    if(stageChanged)scene.dispatchEvent(new CustomEvent('divinationstage',{detail:{effect,stage:f.stage}}));
    // Stage listeners can change Wing synchronously (the sweet-water reaction).
    // Commit that pose's transmitted colour before returning the rendered frame.
    if(scene.querySelector('.wing-sprite.is-active[data-ready=true]')!==preparedWing)prepare();
  }
  function finishIfNeeded(){if(ready&&effect!=='none'&&elapsed>=divinationEffects[effect].duration&&!completed){completed=true;scene.dispatchEvent(new CustomEvent('divinationcomplete',{detail:{effect}}));}}
  function schedule(fresh=false){if(ready&&!frame&&active&&!paused&&!document.hidden){if(fresh)last=performance.now();frame=requestAnimationFrame(tick);}}
  function tick(now){
    frame=0;const dt=Math.max(0,now-last);last=now;
    elapsed=effect==='none'?elapsed+dt:Math.min(divinationEffects[effect].duration,elapsed+dt);
    if(holding){holdTime+=dt;concentration=smooth((holdTime/4500-.10)/.90);}else concentration*=Math.exp(-dt/190);
    if(concentration<.001)concentration=0;draw();finishIfNeeded();
    if(!reduced.matches&&(holding||concentration>0||(effect!=='none'&&!completed)))schedule();
  }
  function setConcentration(value){if(holding===value)return;holding=value;if(value){preload();holdTime=0;concentration=0;elapsed=0;}if(reduced.matches){concentration=0;draw();}else schedule(true);}
  function setEffect(next,{restart=false}={}){
    if(next!=='none'&&!Object.hasOwn(divinationEffects,next))throw new RangeError(`Unknown Nen effect: ${next}`);
    if(effect===next&&!restart)return;
    cancelAnimationFrame(frame);frame=0;effect=next;holding=false;concentration=0;completed=false;paused=false;
    elapsed=reduced.matches&&next!=='none'?divinationEffects[next].duration:0;draw();finishIfNeeded();if(next!=='none'&&!reduced.matches)schedule(true);
    if(next!=='none')preload().then(ok=>{
      if(!ok&&active&&effect===next&&!completed){completed=true;scene.dispatchEvent(new CustomEvent('divinationcomplete',{detail:{effect}}));}
    });
  }
  function pause(){paused=true;cancelAnimationFrame(frame);frame=0;draw();}
  function resume(){if(!paused)return;paused=false;draw();if(effect!=='none'&&!completed)schedule(true);}
  function seek(ms){if(effect==='none')return;elapsed=Math.max(0,Math.min(divinationEffects[effect].duration,Number(ms)||0));completed=elapsed>=divinationEffects[effect].duration;draw();}
  function reset(){cancelAnimationFrame(frame);frame=0;holding=false;concentration=0;effect='none';elapsed=0;holdTime=0;paused=false;completed=false;draw();}
  function motionChange(){if(reduced.matches){cancelAnimationFrame(frame);frame=0;concentration=0;elapsed=effect==='none'?0:divinationEffects[effect].duration;draw();finishIfNeeded();}else if(effect!=='none'&&!completed)schedule(true);}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;holding=false;concentration=0;draw();}else if(!paused&&(concentration>0||(effect!=='none'&&!completed)))schedule(true);}
  const initialReady=Promise.all([prepareImage(image),poseReady]).then(([ok])=>{
    if(!ok||!active)return false;preparePlate();drawInitial();return true;
  });
  let resourcePromise;
  function preload(){
    return resourcePromise??=load();
  }
  async function load(){
    try{
      if(!await initialReady)throw new Error('Scene unavailable');
      const results=await Promise.all(Object.entries({leaves:'leaf-states-atlas.png',overflow:'overflow-atlas.png',clean:'water-surface-clean.png',flex:'leaf-flex-atlas-v3.png',flow:'overflow-ink-atlas-v3.png',residues:'sediment-atlas-v3.png',diffusion:'diffusion-mattes-v3.png'}).map(async([name,path])=>{
        const asset=new Image();asset.fetchPriority='low';asset.src=import.meta.env.BASE_URL+'assets/divination/'+path;
        const ok=await prepareImage(asset);if(ok)assets[name]=asset;return ok;
      }));
      if(!results.every(Boolean))throw new Error('Divination sprites unavailable');
      loaded=true;prepare();return true;
    }catch(error){if(active){scene.dataset.waterAsset='missing';scene.dispatchEvent(new CustomEvent('divinationerror',{detail:{message:error.message}}));}return false;}
  }
  const wingObserver=new MutationObserver(()=>{
    if(!original||scene.querySelector('.wing-sprite.is-active[data-ready=true]')===preparedWing)return;
    if(loaded)prepare();else{preparePlate();drawInitial();}
  });
  const wingPlate=scene.querySelector('.wing-plate');if(wingPlate)wingObserver.observe(wingPlate,{subtree:true,attributes:true,attributeFilter:['class','data-ready','hidden']});
  reduced.addEventListener('change',motionChange);document.addEventListener('visibilitychange',visibility);if(!deferEffects)preload();
  return {initialReady,preload,setEffect,setConcentration,pause,resume,seek,reset,getState:()=>({effect,elapsed,paused,ready,...sampleDivination(effect,elapsed)}),destroy(){active=false;wingObserver.disconnect();cancelAnimationFrame(frame);reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',visibility);}};
}
