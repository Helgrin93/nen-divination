export const MUSIC_PREFERENCE='nen-music-enabled';

// One persistent media element, one source at a time. A generation invalidates
// pending play promises and fades when the user mutes or changes phase quickly.
export function createMusic({tracks,storage,audioFactory=()=>new Audio(),volume=.22,fadeMs=280,onChange=()=>{},raf=requestAnimationFrame,caf=cancelAnimationFrame,now=()=>performance.now(),contextFactory=()=>{
 const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
 return AudioContext?new AudioContext():null;
}}){
 let enabled=true;try{enabled=storage?.getItem(MUSIC_PREFERENCE)!=='false';}catch{/* optional */}
 let phase='intro',status=enabled?'idle':'off',audio=null,source=null,generation=0,frame=0,finishFade;
 let context,gain,mediaSource,destroyed=false;
 const failed=new Set();
 const current=()=>tracks[phase];
 const available=()=>Boolean(current()?.src&&!failed.has(current().src));
 const snapshot=()=>({enabled,phase,status,available:available(),playing:status==='playing'});
 const notify=()=>onChange(snapshot());
 const gainValue=()=>gain?gain.gain.value:audio?.volume??0;
 function setGain(value){if(gain)gain.gain.value=value;else if(audio)audio.volume=value;}
 function cancelFade(){if(frame)caf(frame);frame=0;finishFade?.();finishFade=null;}
 function fade(target,token){
  cancelFade();
  const from=gainValue(),started=now();
  return new Promise(resolve=>{
   finishFade=resolve;
   function tick(){
    frame=0;if(token!==generation){finishFade=null;resolve();return;}
    const p=fadeMs?Math.min(1,(now()-started)/fadeMs):1;
    setGain(from+(target-from)*p);
    if(p<1)frame=raf(tick);else{finishFade=null;resolve();}
   }tick();
  });
 }
 function media(){
  if(audio)return audio;
  audio=audioFactory();audio.preload='none';audio.volume=0;
  audio.addEventListener('error',()=>{
   if(!source)return;
   failed.add(source);generation++;cancelFade();audio.pause();setGain(0);status=enabled?'unavailable':'off';notify();
  });
  audio.addEventListener('waiting',()=>{if(enabled&&status==='playing'){status='loading';notify();}});
  audio.addEventListener('playing',()=>{
   if(enabled&&source===current()?.src){status='playing';notify();}
   else audio.pause();
  });
  audio.addEventListener('pause',()=>{if(status==='playing'){status=enabled?'idle':'off';notify();}});
  return audio;
 }
 function unlockContext(){
  // GainNode also provides a moderate volume on iOS, where media.volume may
  // remain under hardware control. Creation/resume happens inside a gesture.
  try{
   if(context===undefined){
    context=contextFactory();
    if(context){gain=context.createGain();gain.gain.value=audio?.volume??0;mediaSource=context.createMediaElementSource(media());mediaSource.connect(gain);gain.connect(context.destination);audio.volume=1;}
   }
   if(context?.state==='suspended')return context.resume().catch(()=>{});
  }catch{context=null;gain=null;}
  return Promise.resolve();
 }
 async function sync({gesture=false}={}){
  if(destroyed)return;
  const token=++generation;cancelFade();
  if(!enabled){audio?.pause();setGain(0);status='off';notify();return;}
  if(!available()){
   audio?.pause();setGain(0);status='unavailable';notify();return;
  }
  const element=media();
  if(gesture){failed.delete(current().src);void unlockContext();}
  if(source!==current().src){
   if(!element.paused)await fade(0,token);
   if(token!==generation)return;
   element.pause();source=current().src;element.src=source;element.loop=current().loop??true;
   setGain(0);
  }else if(!element.paused&&status==='playing'){notify();return;}
  status='loading';notify();
  try{
   // A real audible play attempt respects the browser's autoplay policy.
   // Starting at zero volume could be treated as silent autoplay by Chrome.
   setGain(volume);await element.play();
   if(token!==generation){if(!enabled)element.pause();return;}
   if(element.paused)return;
   status='playing';setGain(0);notify();await fade(volume,token);
  }catch(error){
   if(token!==generation)return;
   element.pause();setGain(0);
   if(error?.name==='NotAllowedError')status='blocked';
   else if(error?.name==='AbortError')status='idle';
   else {failed.add(source);status='unavailable';}
   notify();
  }
 }
 return {
  getState:snapshot,
  start:()=>sync(),
  setPhase(next,{gesture=false}={}){
   if(!Object.hasOwn(tracks,next))return;
   if(phase===next){if(gesture&&enabled&&status!=='playing')return sync({gesture:true});return;}
   phase=next;return sync({gesture});
  },
  interact(){if(!enabled||!available())return;if(status==='playing'){void unlockContext();return;}return sync({gesture:true});},
  toggle(){
   // A blocked/paused track needs an explicit play gesture, not a mute cycle.
   if(enabled&&['blocked','idle'].includes(status))return sync({gesture:true});
   enabled=!enabled;try{storage?.setItem(MUSIC_PREFERENCE,String(enabled));}catch{/* optional */}
   if(enabled&&current()?.src)failed.delete(current().src);
   return sync({gesture:enabled});
  },
  destroy(){destroyed=true;generation++;cancelFade();audio?.pause();if(audio){audio.removeAttribute('src');audio.load();}void context?.close();},
 };
}
