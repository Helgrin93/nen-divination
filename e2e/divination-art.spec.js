import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const approved=JSON.parse(await readFile(new URL('./fixtures/specialization-approved.json',import.meta.url),'utf8'));

test('Specialization preserves its animation with smoother leaf edges and shared water tint',async({page,browserName})=>{
  test.skip(browserName!=='chromium','PNG golden uses the Chromium encoder; WebKit is covered by lifecycle and seek tests.');
  await page.goto('/review/divination.html');
  await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  for(const frame of approved.frames){
    const difference=await page.evaluate(async fraction=>{
      const c=document.querySelector('.water-effects'),ctx=c.getContext('2d'),w=window.divinationReview.water;
      w.reset();const repair=ctx.getImageData(0,0,c.width,c.height).data,mask=new Uint8Array(c.width*c.height);
      // Exclude the shared static glass repair and liquid tint, including
      // their two-pixel resampling fringe. Keep the existing animation golden.
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(repair[(y*c.width+x)*4+3])
        for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<c.width&&y+dy>=0&&y+dy<c.height)mask[(y+dy)*c.width+x+dx]=1;
      const image=new Image();image.src='/e2e/fixtures/specialization-approved-'+String(Math.round(fraction*100)).padStart(3,'0')+'.png';await image.decode();
      const reference=Object.assign(document.createElement('canvas'),{width:c.width,height:c.height}),rc=reference.getContext('2d');rc.drawImage(image,0,0);
      const before=rc.getImageData(0,0,c.width,c.height).data;
      w.setEffect('specialization',{restart:true});w.pause();w.seek(w.getState().duration*fraction);
      const after=ctx.getImageData(0,0,c.width,c.height).data;let changed=0,leafDelta=0;
      for(let i=0;i<before.length;i++)if(!mask[i>>2]&&before[i]!==after[i]){
        const x=(i>>2)%c.width,y=Math.floor((i>>2)/c.width);
        // The same leaf atlas now uses high-quality downsampling. Allow a
        // bounded colour difference only within its registered 112x28 area;
        // fragments, timing and every pixel outside that area stay exact.
        if(x>=713&&x<825&&y>=614&&y<642)leafDelta+=Math.abs(before[i]-after[i]);
        else changed++;
      }
      return {changed,leafMeanDelta:leafDelta/(112*28*4)};
    },frame.fraction);
    expect(difference.changed).toBe(0);
    expect(difference.leafMeanDelta).toBeLessThan(6);
  }
});

test('all six effects seek backward without accumulation and respect the glass registration',async({page})=>{
  await page.goto('/review/divination.html');await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  const failures=await page.evaluate(()=>{
    const {water}=window.divinationReview,c=document.querySelector('.water-effects'),failures=[];
    for(const type of ['manipulation','enhancement','emission','conjuration','transmutation','specialization']){
      water.setEffect(type,{restart:true});water.pause();const duration=water.getState().duration;
      water.seek(duration*.25);const first=c.toDataURL();water.seek(duration*.75);water.seek(duration*.25);
      if(first!==c.toDataURL())failures.push(type);
    }return failures;
  });expect(failures).toEqual([]);
});

test('Manipulation changes registered flex poses while the leaf stays on the surface',async({page})=>{
  await page.goto('/review/divination.html');await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
  const poses=await page.evaluate(()=>{
    const {water}=window.divinationReview,c=document.querySelector('.water-effects'),frames=[];water.setEffect('manipulation');water.pause();
    for(const p of [.1,.2,.3,.4,.5,.6,.7,.8,.9,1]){
      water.seek(water.getState().duration*p);const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let outside=0,green=0;
      for(let y=590;y<665;y++)for(let x=650;x<890;x++){
        const i=(y*c.width+x)*4;if(pixels[i+3]<190||pixels[i+1]-pixels[i]<12||pixels[i+1]-pixels[i+2]<35)continue;green++;
        const localX=(x-443)/.65,localY=(y-560)/.65;
        if(((localX-500)/143)**2+((localY-105)/25)**2>1.05)outside++;
      }
      frames.push({pose:Number(c.dataset.leafPose),x:Number(c.dataset.leafX),y:Number(c.dataset.leafY),green,outside});
    }return frames;
  });
  expect(new Set(poses.map(p=>p.pose)).size).toBe(10);
  expect(Math.max(...poses.map(p=>p.x))-Math.min(...poses.map(p=>p.x))).toBeGreaterThan(70);
  for(const frame of poses){expect(frame.green).toBeGreaterThan(700);expect(frame.outside).toBe(0);expect(frame.x).toBeGreaterThan(450);expect(frame.x).toBeLessThan(550);}
});
