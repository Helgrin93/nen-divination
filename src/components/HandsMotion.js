// Dedicated anatomical drawings, not a deformation of the tabletop painting.
import {prepareImage} from '../services/sceneLoading.js';
const WIDTH=1536,HEIGHT=512;
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
const poses=[
  {top:0,bottom:416,scale:.90,left:140},
  {top:420,bottom:798,scale:1.05,left:44},
  {top:805,bottom:1234,scale:1.05,left:44},
];
export function mountHandsMotion(scene){
  const canvas=scene.querySelector('.hands-motion');
  if(!canvas)return {setActive(){},setPhase(){},destroy(){}};
  const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clean=new Image(),atlas=new Image();
  let ready=false,failed=false,phase='intro',holding=false,amount=0,target=0,frame=0,last=0,elapsed=0;
  let travelFrom=0,travelStart=0,travelDuration=900;
  function drawPose(index,weight,travel){
    if(weight<=0)return;
    const pose=poses[index],half=atlas.naturalWidth/2;
    // One atlas has three separately drawn poses with individually registered
    // wrists. Small offsets describe an arm lifting, never a rotated flat hand.
    const lift=-Math.sin(travel*Math.PI)*12;
    const breathe=holding&&!reduced.matches?Math.sin(elapsed*1.8)*.48:0;
    for(const side of [-1,1]){
      const width=half*pose.scale,height=(pose.bottom-pose.top)*pose.scale;
      const x=side===-1?pose.left:WIDTH-pose.left-width;
      const approach=(travel-index)*17;
      ctx.save();ctx.globalAlpha=weight;
      // Keep the forearm roots below the frame while the wrists lift. The
      // small vertical follow-through must never expose a cut-off arm edge.
      ctx.drawImage(atlas,side===-1?0:half,pose.top,half,pose.bottom-pose.top,
        x-side*approach,HEIGHT-height+lift+breathe,width,height-lift+4-breathe);
      ctx.restore();
    }
  }
  function draw(){
    if(!ready)return;
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    // Restore only the two old hand/shadow footprints; Wing, rug, glass and
    // the rest of the room continue to use the original untouched illustration.
    ctx.save();ctx.beginPath();ctx.rect(0,232,650,280);ctx.rect(886,232,650,280);ctx.clip();
    ctx.drawImage(clean,0,512,1536,512,0,0,WIDTH,HEIGHT);ctx.restore();
    // Local air displacement: sample a few narrow strips immediately beside
    // each palm, with a soft spatial envelope and < 1 source pixel amplitude.
    if(holding&&!reduced.matches&&amount>1.6){
      for(const side of [-1,1]){
        const x=side===-1?640:876;
        for(let row=150;row<290;row+=3){
          const envelope=Math.sin((row-150)/140*Math.PI);
          const dx=Math.sin(row*.11-elapsed*2.1)*envelope*.65;
          ctx.globalAlpha=.30*envelope;
          ctx.drawImage(clean,x,512+row,20,3,x+dx,row,20,3);
        }
      }
      ctx.globalAlpha=1;
    }
    // These are different anatomical drawings, not registered video frames.
    // Blending them produced two translucent palms/finger sets mid-travel.
    // Keep a single opaque drawing while the wrist travel stays continuous.
    drawPose(Math.min(2,Math.round(amount)),1,amount);
    canvas.hidden=false;canvas.dataset.ready='true';canvas.dataset.approach=amount.toFixed(3);
    canvas.dataset.pose=amount<.4?'rest':amount<1.6?'approach':'concentration';
  }
  function schedule(){if(ready&&!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;const dt=Math.min(50,now-last||16);last=now;elapsed+=dt/1000;
    const t=smooth((now-travelStart)/travelDuration);
    amount=travelFrom+(target-travelFrom)*t;
    if(t===1)amount=target;
    draw();
    if(amount!==target||(holding&&!reduced.matches))schedule();
  }
  function update(){
    const next=['concentration','waterEffect'].includes(phase)?(holding||phase==='waterEffect'?2:1):0;
    if(next===target)return;
    target=next;travelFrom=amount;travelStart=performance.now();travelDuration=target===0?950:holding?650:1100;
    if(reduced.matches){amount=target;draw();}else schedule();
  }
  function setPhase(value){phase=value;update();}
  function setActive(value){holding=value;update();if(value)schedule();}
  function loaded(){
    if(failed||!clean.complete||!clean.naturalWidth||!atlas.complete||!atlas.naturalWidth)return;
    ready=true;amount=target;draw();
  }
  function assetError(){failed=true;ready=false;cancelAnimationFrame(frame);frame=0;canvas.hidden=true;canvas.dataset.ready='false';scene.dataset.handsAsset='missing';}
  function motionChange(){cancelAnimationFrame(frame);frame=0;amount=target;draw();if(!reduced.matches&&holding)schedule();}
  function visibility(){
    if(document.hidden){cancelAnimationFrame(frame);frame=0;holding=false;update();}
    else {amount=target;draw();if(holding)schedule();}
  }
  clean.fetchPriority=atlas.fetchPriority='high';
  clean.src=import.meta.env.BASE_URL+'assets/divination/table-clean.png';
  atlas.src=import.meta.env.BASE_URL+'assets/divination/hands-poses.png';
  const preparation=Promise.all([prepareImage(clean),prepareImage(atlas)]).then(results=>{
    if(results.every(Boolean)){loaded();return true;}assetError();return false;
  });
  reduced.addEventListener('change',motionChange);document.addEventListener('visibilitychange',visibility);
  return {ready:preparation,setActive,setPhase,destroy(){cancelAnimationFrame(frame);reduced.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',visibility);}};
}
