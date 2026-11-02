import {describe,it,expect,vi} from 'vitest';
import {createMusic,MUSIC_PREFERENCE} from '../services/music.js';
class FakeAudio extends EventTarget{
 paused=true;volume=0;src='';plays=[];fail=null;
 play(){this.plays.push(this.src);if(this.fail)return Promise.reject(this.fail);this.paused=false;this.dispatchEvent(new Event('playing'));return Promise.resolve();}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
 removeAttribute(){}load(){}
}
const tracks={intro:{src:'intro.mp3',loop:true},divination:{src:'divination.mp3',loop:true},result:{src:'result.mp3',loop:true}};
function harness(options={}){
 const audio=new FakeAudio(),storage={getItem:vi.fn(()=>null),setItem:vi.fn()},factory=vi.fn(()=>audio);
 const music=createMusic({tracks,storage,audioFactory:factory,fadeMs:0,raf:fn=>setTimeout(fn,16),caf:clearTimeout,now:Date.now,contextFactory:()=>null,...options});
 return {audio,storage,factory,music};
}
describe('persistent music controller',()=>{
 it('uses one element and leaves an unchanged phase playing without restarting',async()=>{
  const {music,audio,factory}=harness();await music.start();
  for(let n=0;n<10;n++)await music.setPhase('intro');
  expect(audio.plays).toEqual(['intro.mp3']);expect(audio.volume).toBe(.22);
  await music.setPhase('divination');await music.setPhase('result');await music.setPhase('intro');
  expect(factory).toHaveBeenCalledTimes(1);expect(audio.plays).toEqual(['intro.mp3','divination.mp3','result.mp3','intro.mp3']);
 });
 it('handles autoplay rejection and retries only on explicit interaction',async()=>{
  const {music,audio}=harness();audio.fail={name:'NotAllowedError'};await music.start();
  expect(music.getState()).toMatchObject({status:'blocked',playing:false,enabled:true});
  await music.setPhase('intro');expect(audio.plays).toHaveLength(1);
  audio.fail=null;await music.interact();expect(music.getState().playing).toBe(true);
 });
 it('persists mute and resumes the current phase when enabled',async()=>{
  const {music,audio,storage}=harness();await music.start();await music.toggle();
  expect(storage.setItem).toHaveBeenLastCalledWith(MUSIC_PREFERENCE,'false');
  await music.setPhase('result');await music.interact();expect(audio.paused).toBe(true);expect(audio.plays).toHaveLength(1);
  await music.toggle();expect(audio.plays.at(-1)).toBe('result.mp3');expect(storage.setItem).toHaveBeenLastCalledWith(MUSIC_PREFERENCE,'true');
 });
 it('never constructs media or requests absent files, including partially configured phases',async()=>{
  const {music,factory}=harness({tracks:{intro:{src:null},divination:tracks.divination,result:{src:null}}});
  await music.start();expect(factory).not.toHaveBeenCalled();expect(music.getState().status).toBe('unavailable');
  await music.setPhase('divination');await music.setPhase('result');expect(music.getState().playing).toBe(false);
 });
 it('respects stored off state and tolerates unavailable storage',async()=>{
  const off=harness({storage:{getItem:()=> 'false',setItem:()=>{}}});await off.music.start();await off.music.setPhase('result');expect(off.factory).not.toHaveBeenCalled();
  const denied=harness({storage:{getItem:()=>{throw Error();},setItem:()=>{throw Error();}}});await denied.music.start();await denied.music.toggle();expect(denied.music.getState().status).toBe('off');
 });
 it('does not resurrect a pending play promise after mute',async()=>{
  const {music,audio}=harness();let resolve;
  audio.play=()=>new Promise(r=>{resolve=r;});const pending=music.start();await music.toggle();resolve();await pending;
  expect(audio.paused).toBe(true);expect(music.getState()).toMatchObject({enabled:false,playing:false,status:'off'});
 });
 it('stops cleanly on network/decode errors and permits a manual retry',async()=>{
  const {music,audio}=harness();await music.start();audio.dispatchEvent(new Event('error'));
  expect(music.getState()).toMatchObject({status:'unavailable',playing:false});expect(audio.paused).toBe(true);
  await music.toggle();await music.toggle();expect(music.getState().playing).toBe(true);
 });
 it('cancels obsolete fades before switching sources under rapid navigation',async()=>{
  vi.useFakeTimers();try{
   const {music,audio}=harness({fadeMs:100});const start=music.start();await vi.advanceTimersByTimeAsync(120);await start;
   const first=music.setPhase('divination'),last=music.setPhase('result');await vi.advanceTimersByTimeAsync(300);await Promise.all([first,last]);
   expect(audio.plays).toEqual(['intro.mp3','result.mp3']);expect(audio.volume).toBe(.22);expect(music.getState().phase).toBe('result');
  }finally{vi.useRealTimers();}
 });
});
