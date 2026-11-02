import {test,expect} from '@playwright/test';

test('room art shares the original camera and never paints over its centre',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.wing-sprite[data-ready=true]')).toHaveCount(4);
  await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  await expect.poll(()=>page.locator('.room-panorama').evaluate(i=>i.complete&&i.naturalWidth===2560)).toBe(true);
  const camera=await page.locator('.unified-stage').boundingBox();
  const panorama=await page.locator('.room-panorama').boundingBox();
  expect(panorama.x+camera.width/3).toBeCloseTo(camera.x,1);
  expect(panorama.width).toBeCloseTo(camera.width*5/3,1);
  expect(panorama.height).toBeCloseTo(camera.height,1);
  const viewport=page.viewportSize();
  if(camera.x>0){expect(panorama.x).toBeLessThanOrEqual(0);expect(panorama.x+panorama.width).toBeGreaterThanOrEqual(viewport.width);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(viewport.width);
  const clip={x:Math.max(0,Math.ceil(camera.x))+1,y:Math.ceil(camera.y)+1,
    width:Math.min(viewport.width,Math.floor(camera.x+camera.width))-Math.max(0,Math.ceil(camera.x))-2,
    height:Math.min(viewport.height,Math.floor(camera.y+camera.height))-Math.ceil(camera.y)-2};
  // Compare actual browser pixels with and without the added environment,
  // including two expression changes and the shared glass underlay.
  for(const pose of ['neutral','smile','eyesClosed']){
    await page.evaluate(async pose=>{
      const {setupQuizScene}=await import('/src/components/QuizScene.js');
      window.roomReviewExpression??=setupQuizScene(document.querySelector('.scene'));
      window.roomReviewExpression(pose);
    },pose);
    await expect(page.locator('.scene')).toHaveAttribute('data-pose',pose);
    await expect(page.locator('.water-effects')).toHaveAttribute('data-glass-pose',pose);
    await page.locator('.room-panorama').evaluate(i=>i.style.visibility='visible');
    const withWings=await page.screenshot({clip,animations:'disabled'});
    await page.locator('.room-panorama').evaluate(i=>i.style.visibility='hidden');
    const original=await page.screenshot({clip,animations:'disabled'});
    const maxDelta=await page.evaluate(async({before,after})=>{
      async function pixels(url){const image=new Image();image.src=url;await image.decode();const c=Object.assign(document.createElement('canvas'),{width:image.width,height:image.height});const ctx=c.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,c.width,c.height).data;}
      const a=await pixels(before),b=await pixels(after);let delta=0;
      for(let i=0;i<a.length;i++)delta=Math.max(delta,Math.abs(a[i]-b[i]));
      return delta;
    },{before:`data:image/png;base64,${original.toString('base64')}`,after:`data:image/png;base64,${withWings.toString('base64')}`});
    // The browser can round translucent sprite edges one RGB level differently
    // when a compositing layer is hidden. No larger central change is allowed.
    expect(maxDelta,`Original centre changed for ${pose}`).toBeLessThanOrEqual(1);
  }
});

test('side art covers a wide short desktop and an ultrawide without moving the camera',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','Desktop width variants; mobile uses the unchanged crop.');
  for(const viewport of [{width:1920,height:1080},{width:1920,height:912},{width:3440,height:1440}]){
    await page.setViewportSize(viewport);await page.goto('/');
    const boxes=await page.evaluate(()=>{
      const box=s=>{const {left,right,width,height}=document.querySelector(s).getBoundingClientRect();return{left,right,width,height};};
      return {camera:box('.unified-stage'),panorama:box('.room-panorama'),overflow:document.documentElement.scrollWidth};
    });
    expect(boxes.camera.width).toBeCloseTo((viewport.height-64)*1.5,1);
    expect(boxes.panorama.left).toBeLessThanOrEqual(0);
    expect(boxes.panorama.right).toBeGreaterThanOrEqual(viewport.width);
    expect(boxes.overflow).toBe(viewport.width);
  }
});
