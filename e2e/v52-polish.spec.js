import {test,expect} from '@playwright/test';

test('browser tab title stays distinct from the approved header through language and phase changes',async({page})=>{
 await page.goto('/');
 for(const lang of['it','en']){
  await page.locator(`[data-lang=${lang}]`).click();
  await expect(page).toHaveTitle('HxH - Nen Divination Test');
  await expect(page.locator('.brand-title')).toHaveText('Nen Divination Test');
 }
 await page.locator('[data-action=begin]').click();
 await expect(page).toHaveTitle('HxH - Nen Divination Test');
 await expect(page.locator('.brand-logo')).toHaveCount(1);
});

test('rim transmits the backdrop without a grey ellipse and preserves neutral glass ink',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {composeGlassRepair,glassRepairRegion:r}=await import('/src/components/GlassComposition.js');
  const make=(width,height)=>Object.assign(document.createElement('canvas'),{width,height});
  const original=make(1000,680),ctx=original.getContext('2d');ctx.fillStyle='rgb(232,160,64)';ctx.fillRect(0,0,1000,680);
  ctx.fillStyle='rgb(122,135,142)';ctx.fillRect(352,78,2,2);
  const white=make(1536,1024),wc=white.getContext('2d');wc.fillStyle='rgb(242,238,236)';wc.fillRect(0,0,1536,1024);
  const wing=new Image();wing.src=white.toDataURL();await wing.decode();
  const patch=composeGlassRepair(original,wing),pc=patch.getContext('2d');
  const at=(x,y)=>[...pc.getImageData(x-r.x,y-r.y,1,1).data];
  const neutral=at(352,78),outside=at(333,85);
  ctx.drawImage(patch,r.x,r.y);
  return {left:[...ctx.getImageData(350,75,1,1).data],right:[...ctx.getImageData(650,75,1,1).data],neutral,outside};
 });
 expect(result.left).toEqual([242,238,236,255]);
 expect(result.right).toEqual([242,238,236,255]);
 expect(result.neutral[3]).toBe(0);
 expect(result.outside[3]).toBe(0);
});
