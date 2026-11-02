// One photographic scene and one canvas persist from the quiz to the result.
import { wing } from '../data/wing.js';
import { wingOcclusionMask } from './sceneGeometry.js';
import {prepareImage} from '../services/sceneLoading.js';
const base = import.meta.env.BASE_URL;

export function quizScene() {
  return `<div class="quiz-scene-art" aria-hidden="true">
    <div class="water-stage unified-stage" style='--wing-occlusion:${wingOcclusionMask}'>
      <img class="room-panorama" src="${base}assets/room-v5/room-panorama.png" width="2560" height="1024" alt="" decoding="async" fetchpriority="high">
      <img class="glass-plate room-backdrop" src="${base}assets/scene-v3/unified-goblet-scene.png" width="1536" height="1024" alt="" fetchpriority="high">
      <img class="rug-border-repair" src="${base}assets/divination/rug-border-repair.png" width="1536" height="1024" alt="">
      <canvas class="hands-motion" width="1536" height="512" hidden></canvas>
      <div class="scene-plate wing-plate">${Object.entries(wing.poses).map(([expression,src])=>`<img class="wing-sprite${expression==='neutral'?' is-active':''}" data-pose="${expression}" ${expression==='neutral'?'src':'data-src'}="${base}${src}" width="1536" height="1024" decoding="async" alt="" ${expression==='neutral'?'fetchpriority="high"':'fetchpriority="low"'}>`).join('')}</div>
      <svg class="wing-table-contact" viewBox="0 0 1536 1024" aria-hidden="true"><defs>
        <radialGradient id="elbow-shadow"><stop stop-color="#584128" stop-opacity=".22"/><stop offset="1" stop-color="#584128" stop-opacity="0"/></radialGradient>
      </defs><g fill="url(#elbow-shadow)"><ellipse cx="423" cy="655" rx="88" ry="4"/><ellipse cx="1075" cy="655" rx="88" ry="4"/></g></svg>
      <canvas class="water-effects" width="1536" height="1024"></canvas>
    </div>
  </div>`;
}

export function setupQuizScene(scene,{deferPoses=false}={}) {
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
  }
  const decodePose=img=>{
    async function decode(){
        if(!await prepareImage(img))return false;
        ready.add(img);img.dataset.ready='true';setExpression(requested);
        return true;
    }
    return decode();
  };
  setExpression.ready=decodePose(sprites.find(img=>img.dataset.pose==='neutral'));
  setExpression.preload=()=>Promise.all(sprites.filter(img=>img.dataset.src).map(img=>{
    img.src=img.dataset.src;delete img.dataset.src;return decodePose(img);
  }));
  if(!deferPoses)setExpression.preload();
  scene.querySelectorAll('.quiz-scene-art img').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      if(img.matches('.room-panorama'))return;
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
