import {test,expect} from '@playwright/test';

test('approved branding fits the header and all favicon formats decode',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.brand-title')).toHaveText('Nen Divination Test');
  await expect(page.locator('.brand-logo')).toHaveCount(1);
  const layout=await page.evaluate(async()=>{
    const logo=document.querySelector('.brand-logo');await logo.decode();
    const a=logo.getBoundingClientRect(),b=document.querySelector('.brand-title').getBoundingClientRect(),c=document.querySelector('.language-switch').getBoundingClientRect();
    return {ready:logo.naturalWidth===236,overlap:a.right>b.left||b.right>c.left,overflow:document.documentElement.scrollWidth>innerWidth,height:document.querySelector('.site-header').offsetHeight};
  });
  expect(layout.ready).toBe(true);expect(layout.overlap).toBe(false);expect(layout.overflow).toBe(false);expect(layout.height).toBeLessThanOrEqual(64);
  for(const selector of ['link[rel=icon][type="image/svg+xml"]','link[rel=icon][sizes="32x32"]','link[rel=icon][sizes="192x192"]','link[rel=apple-touch-icon]']){
    const icon=await page.locator(selector).evaluate(async link=>{const img=new Image();img.src=link.href;await img.decode();return{width:img.naturalWidth,height:img.naturalHeight};});
    expect(icon.width).toBeGreaterThanOrEqual(32);expect(icon.width).toBe(icon.height);
  }
  await page.locator('[data-lang=en]').click();await expect(page.locator('[data-action=begin]')).toHaveText(/Start/);
  await page.locator('[data-lang=it]').click();await expect(page.locator('[data-action=begin]')).toHaveText(/Inizia/);
});

test('sleeves and underarm alpha stay identical across the three clasped-hands expressions',async({page})=>{
  await page.goto('/');await expect(page.locator('.wing-sprite[data-ready=true]')).toHaveCount(4);
  const changes=await page.evaluate(()=>{
    const pixels=pose=>{const c=Object.assign(document.createElement('canvas'),{width:1536,height:1024}),ctx=c.getContext('2d');ctx.drawImage(document.querySelector(`.wing-sprite[data-pose="${pose}"]`),0,0);return ctx.getImageData(0,550,1536,474).data;};
    const neutral=pixels('neutral');return ['smile','eyesClosed'].map(pose=>({pose,changed:pixels(pose).reduce((n,value,i)=>n+Number(value!==neutral[i]),0)}));
  });
  expect(changes.map(r=>r.changed)).toEqual([0,0]);
  await expect(page.locator('.wing-table-contact image')).toHaveCount(0);
});

test('glass correction never paints rectangular tabs outside the approved silhouette',async({page})=>{
  await page.goto('/review/divination.html');await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  const bad=await page.evaluate(async()=>{
    const {composeGlassRepair,glassRepairRegion:r}=await import('/src/components/GlassComposition.js');
    const {glassOutline,waterRegion}=await import('/src/components/sceneGeometry.js');
    const c=Object.assign(document.createElement('canvas'),{width:1000,height:680}),ctx=c.getContext('2d');
    ctx.drawImage(document.querySelector('.glass-plate'),waterRegion.x,waterRegion.y,waterRegion.width,waterRegion.height,0,0,1000,680);
    const outline=new Path2D(glassOutline);let bad=0;
    for(const img of document.querySelectorAll('.wing-sprite')){
      const data=composeGlassRepair(c,img).getContext('2d').getImageData(0,0,r.width,r.height).data;
      for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){
        // Includes the original raster's small antialias fringe, corrected in V5.2.
        const px=x+r.x,py=y+r.y,outer=((px-500)/163)**2+((py-91)/56)**2;
        if(outer>=1&&!ctx.isPointInPath(outline,px,py)&&data[(y*r.width+x)*4+3])bad++;
      }
    }return bad;
  });expect(bad).toBe(0);
});

test('results retain approved kanji as vectors and remove only the two indicated lines in IT and EN',async({page})=>{
  await page.goto('/review/results.html?type=conjuration');await page.waitForFunction(()=>window.resultsReview);
  for(const lang of ['it','en']){
    await page.locator(`[data-lang=${lang}]`).click();
    await expect(page.locator('.story-hint,.quiz-disclaimer')).toHaveCount(0);
    expect(await page.locator('.radar-kanji title').allTextContents()).toEqual(['強','変','具','特','操','放']);
    await expect(page.locator('.radar-kanji path')).toHaveCount(6);
    await expect(page.locator('.character-grid').first().locator('.character-card')).toHaveCount(3);
    await expect(page.locator('.power-description')).not.toBeEmpty();
    await expect(page.locator('[data-action=save],[data-action=share],[data-action=story],[data-action=copy-link]')).toHaveCount(4);
  }
});
