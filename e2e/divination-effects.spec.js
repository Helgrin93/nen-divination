import { test,expect } from '@playwright/test';
import { divinationEffects } from '../src/components/divinationTimeline.js';

for(const type of Object.keys(divinationEffects))test(`${type}: starts, pauses, seeks, persists and replays`,async({page})=>{
  await page.clock.install();await page.clock.pauseAt(new Date());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/review/divination.html');
  const canvas=page.locator('.water-effects');await expect(canvas).toHaveAttribute('data-ready','true');
  await page.locator('[data-type]').selectOption(type);
  await expect(canvas).toHaveAttribute('data-rendered-effect',type);
  if(type==='transmutation')await expect(page.locator('[data-dialogue]')).not.toContainText('dolce');
  await page.clock.runFor(160);
  expect(Number(await canvas.getAttribute('data-effect-progress'))).toBeGreaterThan(0);
  await page.locator('[data-pause]').click();
  const frozen=await canvas.evaluate(c=>c.toDataURL());
  const pausedProgress=Number(await canvas.getAttribute('data-effect-progress'));
  await page.clock.fastForward(1000);expect(await canvas.evaluate((c,frozen)=>c.toDataURL()===frozen,frozen)).toBe(true);
  await expect(canvas).toHaveAttribute('data-paused','true');
  await page.locator('[data-pause]').click();await page.clock.runFor(160);
  expect(Number(await canvas.getAttribute('data-effect-progress'))).toBeGreaterThan(pausedProgress);
  const middle=await page.evaluate(()=>{const w=window.divinationReview.water;w.pause();w.seek(w.getState().duration*.5);return document.querySelector('.water-effects').toDataURL();});
  const final=await page.evaluate(()=>{const w=window.divinationReview.water;w.seek(w.getState().duration);return document.querySelector('.water-effects').toDataURL();});
  if(type!=='transmutation')expect(final!==middle).toBe(true);
  if(type==='transmutation')await expect(page.locator('[data-dialogue]')).toContainText('dolce');
  await expect(canvas).toHaveAttribute('data-effect-progress','1');
  if(type==='enhancement')await expect(canvas).toHaveAttribute('data-droplets','0');
  const registration=await page.evaluate(()=>{
    const c=document.querySelector('.water-effects'),r=document.querySelector('.glass-plate'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let outside=0;for(let y=0;y<c.height;y+=3)for(const x of [20,250,600,940,1250,1500])outside+=d[(y*c.width+x)*4+3];
    return {registered:JSON.stringify(c.getBoundingClientRect().toJSON())===JSON.stringify(r.getBoundingClientRect().toJSON()),outside};
  });
  expect(registration).toEqual({registered:true,outside:0});
  await page.locator('[data-language]').selectOption('en');
  if(type==='transmutation')await expect(page.locator('[data-dialogue]')).toContainText('sweet');
  if(type==='specialization'){await expect(page.locator('[data-dialogue]')).not.toContainText('Neferpitou');await expect(page.locator('[data-dialogue]')).toHaveText('The leaf is withering… A truly unusual reaction.');}
  await page.locator('[data-view]').selectOption('result');await page.clock.fastForward(1500);
  expect(await canvas.evaluate((c,final)=>c.toDataURL()===final,final)).toBe(true);
  await page.locator('[data-play]').click();await page.clock.runFor(100);
  expect(Number(await canvas.getAttribute('data-effect-progress'))).toBeLessThan(.1);
  expect(errors).toEqual([]);
});

test('hidden scenes resume without skipping the transformation; motion reduction completes it',async({page})=>{
  await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('/review/divination.html');
  const canvas=page.locator('.water-effects');await expect(canvas).toHaveAttribute('data-ready','true');
  await page.locator('[data-type]').selectOption('specialization');await page.clock.runFor(500);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  const progress=await canvas.getAttribute('data-effect-progress');await page.clock.fastForward(10000);
  expect(await canvas.getAttribute('data-effect-progress')).toBe(progress);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(200);expect(Number(await canvas.getAttribute('data-effect-progress'))).toBeGreaterThan(Number(progress));
  await page.emulateMedia({reducedMotion:'reduce'});await expect(canvas).toHaveAttribute('data-effect-progress','1');
});

test('Wing announces sweet water at 90 percent in both languages',async({page})=>{
  await page.goto('/review/divination.html');await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  await page.locator('[data-type]').selectOption('transmutation');
  await page.evaluate(()=>window.divinationReview.water.pause());
  for(const [language,sweet] of [['it','dolce'],['en','sweet']]){
    await page.locator('[data-language]').selectOption(language);
    await page.evaluate(()=>{const w=window.divinationReview.water;w.seek(w.getState().duration*.899);});
    await expect(page.locator('[data-dialogue]')).not.toContainText(sweet);
    await page.evaluate(()=>{const w=window.divinationReview.water;w.seek(w.getState().duration*.90);});
    await expect(page.locator('[data-dialogue]')).toContainText(sweet);
    await expect(page.locator('.water-effects')).toHaveAttribute('data-stage','sweet');
  }
});
