import {test,expect} from '@playwright/test';
import {finishDialogue,finishRevelation} from './helpers/dialogue.js';

test('short comments last two seconds and preserve decoded Wing; important dialogue waits',async({page})=>{
  await page.goto('/');await page.locator('.wing-sprite[data-ready=true]').first().waitFor();
  await page.locator('[data-action=begin]').click();
  const seen=[];
  for(let n=0;n<4;n++){
    await finishDialogue(page);
    await expect(page.locator('.wing-reaction,.bonus-dialogue')).toHaveCount(0);
    await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
    if(n<3)await expect(page.locator('.interlude')).toHaveCount(0);
    if(n===3){
      const interlude=page.locator('[data-dialogue=short]');await expect(interlude).toBeVisible();
      await expect(interlude.locator('button')).toHaveCount(0);await expect(page.locator('.question-title,.answer')).toHaveCount(0);
      seen.push(await interlude.getAttribute('data-reaction'));
      await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-ready','true');
      await page.waitForTimeout(700);await expect(interlude).toBeVisible();
      await page.getByRole('button',{name:'English',exact:true}).click();
      await expect(interlude).toHaveCount(0,{timeout:2200});
      await page.getByRole('button',{name:'Italiano',exact:true}).click();
    }
  }
  expect(seen).toHaveLength(1);
  for(let n=4;n<9;n++){
    await finishDialogue(page);if(await page.locator('.hold-button').count())break;
    await page.locator('.answer').first().click();await page.locator('[data-action=next]').click();
    if(await page.locator('[data-dialogue=important]').count()){
      const kind=await page.locator('.interlude').getAttribute('data-kind');
      await page.waitForTimeout(3200);await expect(page.locator('.interlude')).toHaveAttribute('data-kind',kind);
    }
  }
  await finishDialogue(page);await expect(page.locator('.hold-button')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-action=reveal]').click();
  const conclusion=page.locator('[data-kind=revealed]');
  await expect(conclusion.locator('h2')).toHaveText('Ecco… La tua affinità Nen si è manifestata.');
  await expect(page.locator('.wing-sprite.is-active')).toHaveAttribute('data-pose','smile');
  await page.waitForTimeout(3200);await expect(conclusion).toBeVisible();
  await page.getByRole('button',{name:'English',exact:true}).click();
  await expect(conclusion.locator('h2')).toHaveText('There… Your Nen affinity has revealed itself.');
  await expect(conclusion.locator('.speech-bubble')).toHaveCSS('opacity','1');
  await expect(page.locator('.scene-effect-caption')).toBeEmpty();
  if(page.viewportSize().width<=700){
    const bubble=await conclusion.locator('.speech-bubble').boundingBox();
    const button=await conclusion.locator('button').boundingBox();
    const art=await page.locator('.unified-stage').boundingBox();
    expect(bubble.y).toBeGreaterThan(art.y+art.height);
    expect(button.y).toBeGreaterThan(bubble.y+bubble.height);
    expect(Math.abs(button.x+button.width/2-page.viewportSize().width/2)).toBeLessThan(1);
    expect(await conclusion.locator('h2').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
  }
  await expect(page.locator('.nen-title')).toHaveCount(0);
  await finishRevelation(page);await expect(page.locator('.nen-title')).toBeVisible();
});
