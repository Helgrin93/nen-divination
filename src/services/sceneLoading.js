// Shared decoding prevents a visible image and its canvas repair from racing.
const preparations=new WeakMap();
export function prepareImage(image,{timeout=45000}={}){
 if(preparations.has(image))return preparations.get(image);
 const promise=new Promise(resolve=>{
  let settled=false;
  const finish=ok=>{
   if(settled)return;settled=true;clearTimeout(timer);
   image.removeEventListener('error',failed);
   if(!ok)image.hidden=true;
   resolve(ok);
  };
  const failed=()=>finish(false),timer=setTimeout(failed,timeout);
  image.addEventListener('error',failed,{once:true});
  image.decode().then(()=>finish(Boolean(image.naturalWidth)),failed);
 });
 preparations.set(image,promise);return promise;
}

export async function revealInitialScene(experience,tasks){
 const results=await Promise.allSettled(tasks);
 const degraded=results.some(r=>r.status==='rejected'||r.value===false);
 experience.dataset.loading='ready';
 experience.dataset.loadingResult=degraded?'fallback':'complete';
 experience.removeAttribute('inert');experience.setAttribute('aria-busy','false');
 document.querySelector('.scene-loader')?.remove();
 return !degraded;
}
