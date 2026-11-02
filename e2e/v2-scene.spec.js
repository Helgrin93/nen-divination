import {finishDialogue,finishRevelation} from './helpers/dialogue.js';
import { test, expect } from '@playwright/test';

test('V2 keeps the scene, selection and scroll stable with four accessible answers', async ({ page }, testInfo) => {
  if(testInfo.project.name==='small-mobile')await page.setViewportSize({width:320,height:700});
  await page.addInitScript(() => {
    // Presentation randomness is independent of the seeded quiz. Exercise all
    // Silent expressions are scheduled on Q3/Q7; the only comment follows Q4.
    const visualChoices=[.5,.1,.99,.99,0,.5];
    crypto.getRandomValues=buffer=>{buffer[0]=Math.floor((visualChoices.shift() ?? 0)*4294967296);return buffer;};
    let seed=56;
    Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
  });
  await page.goto('/');
  await expect(page.locator('.journey')).toHaveCount(0);
  await expect(page.locator('.site-header')).toHaveText(/Nen Divination Test\s*IT\s*\/\s*EN/);
  const plate=page.locator('.wing-plate');
  const imageBox=await plate.boundingBox();
  await expect(page.locator('.room-backdrop')).toHaveAttribute('src',/unified-goblet-scene\.png$/);
  await expect(page.locator('.room-band,.table-band')).toHaveCount(0);
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','neutral');
  await expect(page.locator('.wing-sprite')).toHaveCount(4);
  expect(await page.locator('.quiz-scene-art img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
  await page.screenshot({path:`.verification/v2/${testInfo.project.name}-intro.png`});
  await page.getByRole('button',{name:'Inizia',exact:true}).click();
  await expect(page.locator('.scene #content .question-title')).toBeVisible();
  expect(await plate.boundingBox()).toEqual(imageBox);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight)).toBe(true);
  const last=page.locator('.answer').last();
  await last.scrollIntoViewIfNeeded();
  await last.click();
  await expect(last).toHaveAttribute('aria-pressed','true');
  const scroll=await page.locator('.answers').evaluate(el=>el.scrollTop);
  const ids=await page.locator('.answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.option));
  await page.getByRole('button',{name:'English',exact:true}).click();
  expect(await page.locator('.answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.option))).toEqual(ids);
  await expect(last).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>scrollY)).toBe(0);
  // Text may have a different height, but the selected answer remains reachable.
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  await page.getByRole('button',{name:'Italiano',exact:true}).click();
  await page.locator('.answers').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:`.verification/v2/${testInfo.project.name}-quiz.png`});
  expect(scroll).toBeGreaterThanOrEqual(0);
  for(let i=0;i<4;i++){
    if(i===2){
      await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','eyesClosed');
      await expect(page.locator('.wing-sprite.is-active')).toHaveCSS('opacity','1');
    }
    await finishDialogue(page);
    await page.locator('.answer').first().click();
    await page.getByRole('button',{name:'Continua',exact:true}).click();
  }
  await expect(page.locator('.interlude h2')).toHaveText(/^(Oh, interessante…|Capisco…|Vediamo…|Mh, curioso…|Molto bene\.)$/);
  const reaction=await page.locator('.interlude').getAttribute('data-reaction');
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','smile');
  await expect(page.locator('.wing-sprite.is-active')).toHaveCSS('opacity','1');
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(page.locator('.interlude')).toHaveAttribute('data-reaction',reaction);
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','smile');
  await page.getByRole('button',{name:'Italiano',exact:true}).click();
  expect(await plate.boundingBox()).toEqual(imageBox);
  await page.screenshot({path:`.verification/v2/${testInfo.project.name}-reaction.png`});
  await finishDialogue(page);
  for(let i=0;i<2;i++){
    await page.locator('.answer').first().click();
    await page.getByRole('button',{name:'Continua',exact:true}).click();
  }
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','gesture');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.locator('.wing-sprite.is-active').evaluate(img=>parseFloat(getComputedStyle(img).transitionDuration))).toBeLessThanOrEqual(.000001);
  await finishDialogue(page);
  await page.getByRole('button',{name:'Indietro',exact:true}).click();
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','neutral');
  await page.getByRole('button',{name:'Continua',exact:true}).click();
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','gesture');
  expect(await plate.boundingBox()).toEqual(imageBox);
});

test('an unavailable expression keeps the neutral Wing visible',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Asset fallback is shared across viewports');
  await page.route('**/wing-eyes-closed.png',route=>route.abort());
  await page.addInitScript(()=>{
    const choices=[.5,.99,.99];
    crypto.getRandomValues=buffer=>{buffer[0]=Math.floor((choices.shift()??.99)*4294967296);return buffer;};
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Inizia',exact:true}).click();
  for(let i=0;i<2;i++){
    await page.locator('.answer').first().click();
    await page.getByRole('button',{name:'Continua',exact:true}).click();
  }
  await expect(page.locator('.scene')).toHaveAttribute('data-expression','eyesClosed');
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','neutral');
  await expect(page.locator('.wing-sprite.is-active')).toHaveCSS('opacity','1');
  await expect(page.locator('.wing-sprite.is-active')).toBeVisible();
});
