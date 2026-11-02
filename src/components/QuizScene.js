// One photographic scene and one canvas persist from the quiz to the result.
import { wing } from '../data/wing.js';
import { wingOcclusionMask } from './sceneGeometry.js';
const base = import.meta.env.BASE_URL;

export function quizScene() {
  return `<div class="quiz-scene-art" aria-hidden="true">
    <div class="water-stage unified-stage" style='--wing-occlusion:${wingOcclusionMask}'>
      <img class="room-wing room-wing-left" src="${base}assets/room-v5/room-left.png" width="512" height="1024" alt="" decoding="async" fetchpriority="low">
      <img class="room-wing room-wing-right" src="${base}assets/room-v5/room-right.png" width="512" height="1024" alt="" decoding="async" fetchpriority="low">
      <img class="glass-plate room-backdrop" src="${base}assets/scene-v3/unified-goblet-scene.png" width="1536" height="1024" alt="" fetchpriority="high">
      <img class="rug-border-repair" src="${base}assets/divination/rug-border-repair.png" width="1536" height="1024" alt="">
      <canvas class="hands-motion" width="1536" height="512" hidden></canvas>
      <div class="scene-plate wing-plate">${Object.entries(wing.poses).map(([expression,src])=>`<img class="wing-sprite${expression==='neutral'?' is-active':''}" data-pose="${expression}" src="${base}${src}" alt="" ${expression==='neutral'?'fetchpriority="high"':''}>`).join('')}</div>
      <svg class="wing-table-contact" viewBox="0 0 1536 1024" aria-hidden="true"><defs>
        <clipPath id="elbow-contact"><path d="M331 607H515V640Q510 654 482 660Q420 665 363 659Q342 656 337 645ZM981 607H1168V645Q1162 656 1137 659Q1075 665 1015 660Q987 654 981 640Z"/></clipPath>
        <radialGradient id="elbow-shadow"><stop stop-color="#584128" stop-opacity=".28"/><stop offset="1" stop-color="#584128" stop-opacity="0"/></radialGradient>
        <linearGradient id="elbow-blend" x2="0" y1="607" y2="623" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white"/></linearGradient>
        <mask id="elbow-seam"><path fill="url(#elbow-blend)" d="M320 600H1180V670H320Z"/></mask>
      </defs><g fill="url(#elbow-shadow)"><ellipse cx="423" cy="662" rx="88" ry="9"/><ellipse cx="1075" cy="662" rx="88" ry="9"/></g><g clip-path="url(#elbow-contact)" mask="url(#elbow-seam)"><image class="wing-elbows" href="${base}${wing.poses.neutral}" x="276.48" y="-109" width="983.04" height="773.32" preserveAspectRatio="none"/></g></svg>
      <canvas class="water-effects" width="1536" height="1024"></canvas>
    </div>
  </div>`;
}

export function setupQuizScene(scene) {
  const sprites=[...scene.querySelectorAll('.wing-sprite')];
  const ready=new Set();
  let requested='neutral';
  function setExpression(expression){
    requested=expression;
    const pose=expression==='curious'?'gesture':expression==='thinking'?'eyesClosed':expression;
    const available=sprites.find(img=>img.dataset.pose===pose && ready.has(img))
      || sprites.find(img=>img.classList.contains('is-active') && ready.has(img))
      || sprites.find(img=>img.dataset.pose==='neutral' && ready.has(img))
      || sprites.find(img=>ready.has(img));
    scene.dataset.expression=expression;
    // Keep the current frame until the replacement has loaded AND decoded.
    if(!available){
      if(sprites.every(img=>img.hidden))scene.dataset.pose='unavailable';
      return;
    }
    scene.dataset.pose=available.dataset.pose;
    sprites.forEach(img=>img.classList.toggle('is-active',img===available));
    scene.querySelector('.wing-elbows')?.setAttribute('href',available.src);
  }
  sprites.forEach(img=>{
    async function decode(){
      try{
        await img.decode();
        if(!img.naturalWidth || img.hidden)return;
        ready.add(img);img.dataset.ready='true';setExpression(requested);
      }catch{ /* The current sprite remains visible if decoding fails. */ }
    }
    img.addEventListener('load',decode,{once:true});
    if(img.complete&&img.naturalWidth)decode();
  });
  scene.querySelectorAll('.quiz-scene-art img').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      if(img.matches('.room-wing'))return;
      ready.delete(img);
      if(img.matches('.wing-sprite')){
        setExpression(requested);
        if(scene.dataset.pose!=='unavailable')return;
      }
      scene.dataset.previewAsset = 'missing';
    }, { once: true });
  });
  return setExpression;
}
