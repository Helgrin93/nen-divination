import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createAttempt,selectAnswer,advance} from '../src/game/stateMachine.js';
import {seededRandom} from '../src/game/questionPicker.js';
import {divinationEffects} from '../src/components/divinationTimeline.js';
const approved=JSON.parse(readFileSync(new URL('./fixtures/wing-dialogues-approved.json',import.meta.url),'utf8'));
const paths=new Map(),types=new Map();
for(let seed=0;seed<1000&&(paths.size<3||types.size<6);seed++){
 const random=seededRandom(seed),state=createAttempt(random),answers=[];state.phase='quiz';
 while(['quiz','bonus'].includes(state.phase)){
  state.pause=false;const q=state.questions[state.index],answer=q.options[Math.floor(random()*4)];answers.push(answer.id);selectAnswer(state,answer.id);advance(state);
 }
 const plan={seed,answers,type:state.result.primary};
 if(!paths.has(answers.length))paths.set(answers.length,plan);
 if(!types.has(plan.type))types.set(plan.type,plan);
}

async function setup(page,plan,lang='it',chance=.01){
 await page.clock.install();await page.clock.pauseAt(new Date());
 await page.addInitScript(({seed,lang,chance})=>{
  localStorage.setItem('lang',lang);Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
  crypto.getRandomValues=a=>{a[0]=Math.floor(chance*4294967296);return a;};
 },{seed:plan.seed,lang,chance});
 await page.goto('/');await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
 await page.locator('[data-action=begin]').click();
}
async function answer(page,plan){
 for(const id of plan.answers){
  if(await page.locator('[data-dialogue=short]').count())await page.clock.fastForward(2000);
  if(await page.locator('[data-dialogue=important]').count())await page.locator('[data-action=resume]').click();
  await page.locator(`[data-option="${id}"]`).click();await page.locator('[data-action=next]').click();
 }
}

for(const lang of['it','en'])for(const count of[7,8,9])test(`${count} questions / ${lang}: exactly one approved introduction then controls without another vignette`,async({page},info)=>{
 const plan=paths.get(count);expect(plan).toBeTruthy();await setup(page,plan,lang);await answer(page,plan);
 const intro=page.locator('[data-kind=divinationIntro]');await expect(intro).toHaveCount(1);await expect(intro.locator('h2')).toHaveText(approved[lang][10]);
 await expect(page.locator('[data-kind=focus],.focus-card,.hold-button')).toHaveCount(0);
 await expect(intro.locator('.speech-bubble')).toHaveCSS('border-radius',page.viewportSize().width<=600?'24px':'30px');
 const button=await intro.locator('button').boundingBox();expect(Math.abs(button.x+button.width/2-page.viewportSize().width/2)).toBeLessThan(1);
 await page.clock.fastForward(1000);
 await page.screenshot({path:`.verification/${info.project.name}-${lang}-${count}-approved-intro.png`,animations:'disabled'});
 await page.locator('[data-action=resume]').click();
 await expect(page.locator('.speech-bubble,[data-kind=divinationIntro]')).toHaveCount(0);
 await expect(page.locator('.hold-button span')).toHaveText(lang==='it'?'Tieni premuto':'Press and hold');
 await page.locator(`[data-lang=${lang==='it'?'en':'it'}]`).click();await page.locator(`[data-lang=${lang}]`).click();
 await expect(page.locator('.speech-bubble')).toHaveCount(0);
 await page.screenshot({path:`.verification/${info.project.name}-${lang}-${count}-approved-hold.png`,animations:'disabled'});
 await page.locator('.hold-button').focus();await page.keyboard.down('Space');await page.clock.fastForward(4490);
 await expect(page.locator('body')).toHaveAttribute('data-phase','concentration');
 await expect(page.locator('.hold-button span')).toHaveText(lang==='it'?'Tieni premuto':'Press and hold');
 await page.clock.runFor(40);await page.keyboard.up('Space');await expect(page.locator('body')).toHaveAttribute('data-phase','waterEffect');
 await page.clock.fastForward(divinationEffects[plan.type].duration+100);
 await expect(page.locator('[data-kind=revealed] h2')).toHaveText(approved[lang][19]);
 await page.locator('[data-action=resume]').click();await expect(page.locator('.nen-title')).toHaveText(new RegExp(plan.type,'i'));
});

for(const [index,n]of [2,3,4,5,6].entries())test(`reaction ${n} lasts exactly 2000 ms, also when language changes`,async({page})=>{
 const plan=paths.get(7);
  await setup(page,plan,'it',(index+.1)/5);
  for(const id of plan.answers.slice(0,4)){await page.locator(`[data-option="${id}"]`).click();await page.locator('[data-action=next]').click();}
  const comment=page.locator('[data-dialogue=short]');await expect(comment.locator('h2')).toHaveText(approved.it[n]);
  await page.clock.fastForward(1000);await page.locator('[data-lang=en]').click();await expect(comment.locator('h2')).toHaveText(approved.en[n]);
  await page.clock.fastForward(999);await expect(comment).toHaveCount(1);
  await page.clock.fastForward(1);await expect(comment).toHaveCount(0);
});

for(const [type,plan]of types)test(`${type}: approved observations follow the real animation in both languages`,async({page})=>{
 await setup(page,plan);await answer(page,plan);await page.locator('[data-action=resume]').click();await page.locator('[data-action=reveal]').click();
 const line=page.locator('.revelation-card p'),numbers={enhancement:12,emission:13,transmutation:15,conjuration:16,manipulation:17,specialization:18};
 await page.clock.runFor(80);
 if(type==='transmutation'){
  await expect(line).toHaveText(approved.it[14]);await page.clock.runFor(1850);await expect(line).toHaveText(approved.it[14]);await page.clock.runFor(150);
 }else{
  if(type!=='manipulation')await expect(line).toBeEmpty();
  await page.clock.runFor(divinationEffects[type].duration*.11+80);
 }
 await expect(line).toHaveText(approved.it[numbers[type]]);
 await page.locator('[data-lang=en]').click();await expect(line).toHaveText(approved.en[numbers[type]]);
 await expect(page.locator('.revelation-card')).not.toContainText(new RegExp(Object.keys(divinationEffects).join('|'),'i'));
});
