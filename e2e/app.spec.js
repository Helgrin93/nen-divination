import {finishDialogue,finishRevelation} from './helpers/dialogue.js';
import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { questions,types } from '../src/data/questions.js';

async function toConcentration(page){
  await page.getByRole('button',{name:'Inizia',exact:true}).click();
  for(let n=0;n<9;n++){
    await finishDialogue(page);
    if(await page.locator('.hold-button').count())break;
    await page.locator('.answer').first().click();
    await page.getByRole('button',{name:'Continua',exact:true}).click();
    if(n===3){await expect(page.locator('.interlude h2')).toHaveText(/^(Oh, interessante…|Mh, capisco…|Una risposta particolare…|Mh, curioso…|Molto bene\.)$/);}
  }
  await finishDialogue(page);await expect(page.locator('.hold-button')).toBeVisible();
}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}

test('complete quiz, stable navigation/localization, concentration, PNG and replay',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await noOverflow(page);
  await page.screenshot({path:`.verification/${testInfo.project.name}-intro.png`,fullPage:true});
  await page.getByRole('button',{name:'Inizia',exact:true}).click();
  const ids=await page.locator('.answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.option));
  const question=await page.locator('.question-title').innerText();
  await page.locator('.answer').first().click();await page.getByRole('button',{name:'Continua',exact:true}).click();
  await page.getByRole('button',{name:'Indietro',exact:true}).click();
  await expect(page.locator('.question-title')).toHaveText(question);
  await expect(page.locator('.answer').first()).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'English',exact:true}).click();
  expect(await page.locator('.answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.option))).toEqual(ids);
  await expect(page.locator('.answer').first()).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Italiano',exact:true}).click();
  await page.screenshot({path:`.verification/${testInfo.project.name}-quiz.png`,fullPage:true});
  await noOverflow(page);
  for(let n=0;n<9;n++){
    await finishDialogue(page);
    if(await page.locator('.hold-button').count())break;
    await page.locator('.answer').first().click();await page.getByRole('button',{name:'Continua',exact:true}).click();
  }
  await finishDialogue(page);await expect(page.locator('.hold-button')).toBeVisible();
  await page.screenshot({path:`.verification/${testInfo.project.name}-hold.png`,fullPage:true});
  const hold=page.locator('.hold-button');await hold.focus();
  await expect(page.locator('.hands-motion')).toHaveAttribute('data-pose','approach');
  await page.keyboard.down('Space');await page.waitForTimeout(1600);
  await expect(page.locator('.hands-motion')).toBeVisible();
  const handPixels=await page.locator('.hands-motion').evaluate(canvas=>{
    const after=canvas.getContext('2d').getImageData(0,0,1536,512).data;
    let left=0,right=0,glass=0;
    for(let y=60;y<480;y+=3)for(let x=250;x<1286;x+=3){
      const alpha=after[(y*1536+x)*4+3];
      if(x<590)left+=alpha;else if(x>946)right+=alpha;else if(x>700&&x<835)glass+=alpha;
    }
    return {left,right,glass};
  });
  expect(handPixels.left).toBeGreaterThan(1000);expect(handPixels.right).toBeGreaterThan(1000);expect(handPixels.glass).toBe(0);
  expect(Number(await page.locator('.water-effects').getAttribute('data-concentration'))).toBeGreaterThan(.1);
  await expect(page.locator('.hands-motion')).toHaveAttribute('data-pose','concentration');
  await page.keyboard.up('Space');
  await expect(page.locator('.hands-motion')).toHaveAttribute('data-pose','approach');
  await expect(page.locator('.hold-progress')).toHaveAttribute('aria-valuenow','0');
  await expect(page.locator('body')).toHaveAttribute('data-phase','concentration');
  await hold.focus();await page.keyboard.down('Space');await page.waitForTimeout(4700);await page.keyboard.up('Space');
  await expect(page.locator('body')).toHaveAttribute('data-phase','waterEffect');
  const effect=await page.locator('.scene').getAttribute('data-effect');expect(effect).not.toBe('none');
  await finishRevelation(page);await expect(page.locator('.nen-title')).toBeVisible({timeout:10000});
  await expect(page.locator('.scene')).toHaveAttribute('data-effect',effect);
  await expect(page.locator('.character-card:visible')).toHaveCount(3);await noOverflow(page);
  await page.screenshot({path:`.verification/${testInfo.project.name}-result.png`,fullPage:true});
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Salva risultato',exact:true}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/^nen-divination-.*\.png$/);
  await download.saveAs(`.verification/${testInfo.project.name}-card.png`);
  const png=await readFile(`.verification/${testInfo.project.name}-card.png`);
  expect(png.readUInt32BE(16)).toBe(1080);expect(png.readUInt32BE(20)).toBe(1350);
  await page.getByRole('button',{name:'English',exact:true}).click();await expect(page.locator('.nen-title')).toHaveText(new RegExp(effect,'i'));
  await page.getByRole('button',{name:'Retake quiz'}).click();await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('all six completed reactions persist and all results export offline',async({page,context},testInfo)=>{
  test.setTimeout(150000);
  test.skip(testInfo.project.name!=='desktop','The full responsive flow is covered separately.');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    let seed=56;
    Math.random=()=>{seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
  });
  for(const type of types){
    await page.goto('/');
    await expect(page.locator('.water-effects')).toHaveAttribute('data-ready','true');
    const water=await page.locator('.water-effects').elementHandle();
    await water.evaluate(canvas=>{
      window.initialWater=new Uint8ClampedArray(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
      window.initialGlassCorrection=new Uint8Array(canvas.width*canvas.height);
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(window.initialWater[(y*canvas.width+x)*4+3])
        for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<canvas.width&&y+dy>=0&&y+dy<canvas.height)window.initialGlassCorrection[(y+dy)*canvas.width+x+dx]=1;
    });
    await context.setOffline(true);
    await page.getByRole('button',{name:'Inizia',exact:true}).click();
    const scene=await page.locator('.scene').elementHandle();
    for(let n=0;n<9;n++){
      await finishDialogue(page);
      if(await page.locator('.hold-button').count())break;
      const ids=await page.locator('.answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.option));
      const q=questions.find(q=>q.options.some(o=>o.id===ids[0]));
      const best=[...q.options].sort((a,b)=>b.weights[type]-a.weights[type])[0];
      await page.locator(`[data-option="${best.id}"]`).click();
      await page.getByRole('button',{name:'Continua',exact:true}).click();
    }
    await finishDialogue(page);await page.getByRole('button',{name:'Rivela senza tenere premuto'}).click();await finishRevelation(page);
    await expect(page.locator('.scene')).toHaveAttribute('data-effect',type);
    await expect(page.locator('.nen-title')).toHaveText(new RegExp(type,'i'));
    expect(await scene.evaluate(el=>el===document.querySelector('.scene'))).toBe(true);
    await page.screenshot({path:`.verification/effect-${type}.png`,fullPage:true});
    await expect(page.locator('.water-effects')).toHaveAttribute('data-effect-progress','1');
    const changes=await water.evaluate((canvas,type)=>{
      const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      let glass=0,hands=0,leafGreenBefore=0,leafGreenAfter=0;
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        const delta=Math.abs(pixels[i]-window.initialWater[i])+Math.abs(pixels[i+1]-window.initialWater[i+1])+Math.abs(pixels[i+2]-window.initialWater[i+2]);
        // Wing's reaction changes the common transmitted shirt pixels; only
        // the liquid itself must remain identical during Transmutation.
        if(x>650&&x<890&&y>580&&y<900&&!(type==='transmutation'&&window.initialGlassCorrection[y*canvas.width+x]))glass+=delta;
        if(x<620||x>920)hands+=delta;
        // The leaf disappears into warm, brighter water in the unified scene.
        // Measure its green tint relative to red, not absolute brightness.
        if(x>739&&x<794&&y>624&&y<635){leafGreenBefore+=window.initialWater[i+1]-window.initialWater[i];leafGreenAfter+=pixels[i+1]-pixels[i];}
      }
      return {glass,hands,leafGreenBefore,leafGreenAfter};
    },type);
    if(type!=='transmutation')expect(changes.glass).toBeGreaterThan(1000);
    else {
      expect(changes.glass).toBe(0);
      await expect(page.locator('.water-effects')).toHaveAttribute('data-stage','sweet');
    }
    expect(changes.hands).toBe(0);
    if(type==='transmutation')await expect(page.locator('.scene-effect-caption')).toContainText('dolce');
    const finalPixels=await water.evaluate(canvas=>canvas.toDataURL());
    await page.getByRole('button',{name:'English',exact:true}).click();
    expect(await water.evaluate(canvas=>canvas===document.querySelector('.water-effects'))).toBe(true);
    expect(await water.evaluate(canvas=>canvas.toDataURL())).toBe(finalPixels);
    await page.getByRole('button',{name:'Italiano',exact:true}).click();
    expect(await page.locator('.nen-title').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.evaluate(type=>{
      if(type==='emission'){
        Object.defineProperty(navigator,'share',{value:async()=>{},configurable:true});
        Object.defineProperty(navigator,'canShare',{value:()=>{throw new Error('Sharing unavailable');},configurable:true});
      }else Object.defineProperty(navigator,'share',{value:undefined,configurable:true});
    },type);
    const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Condividi',exact:true}).click();
    expect((await downloaded).suggestedFilename()).toBe(`nen-divination-${type}.png`);
    await page.getByRole('button',{name:'Riprova il quiz',exact:true}).click();
    expect(await water.evaluate(canvas=>{
      const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      return pixels.every((value,i)=>value===window.initialWater[i]);
    })).toBe(true);
    await context.setOffline(false);
  }
});

test('pointer cancellation, right button, blur, and reduced-motion alternative',async({page})=>{
  await page.goto('/');await toConcentration(page);
  const hold=page.locator('.hold-button');
  await hold.dispatchEvent('pointerdown',{button:2,isPrimary:true,pointerId:1});
  await expect(page.locator('.scene')).not.toHaveClass(/is-holding/);
  await hold.dispatchEvent('pointerdown',{button:0,isPrimary:true,pointerId:2});await page.waitForTimeout(250);
  await hold.dispatchEvent('pointercancel',{pointerId:2});
  await expect(page.locator('.hold-progress')).toHaveAttribute('aria-valuenow','0');
  await hold.focus();await page.keyboard.down('Enter');await page.waitForTimeout(250);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.up('Enter');
  await expect(page.locator('.hold-progress')).toHaveAttribute('aria-valuenow','0');
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Rivela senza tenere premuto'}).click();await finishRevelation(page);
  await expect(page.locator('.nen-title')).toBeVisible({timeout:10000});await noOverflow(page);
});

test('native mouse or touch hold completes only after 4.5 seconds',async({page,browserName},testInfo)=>{
  await page.goto('/');await toConcentration(page);
  const hold=page.locator('.hold-button');await hold.scrollIntoViewIfNeeded();
  const box=await hold.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
  const touch=browserName==='chromium'&&testInfo.project.name.includes('mobile');
  const session=touch?await page.context().newCDPSession(page):null;
  if(touch)await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  else{await page.mouse.move(x,y);await page.mouse.down();}
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).toHaveAttribute('data-phase','concentration');
  expect(Number(await page.locator('.hold-progress').getAttribute('aria-valuenow'))).toBeGreaterThan(10);
  await page.waitForTimeout(3700);
  if(touch)await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
  await expect(page.locator('body')).toHaveAttribute('data-phase','waterEffect');
  await finishRevelation(page);await expect(page.locator('.nen-title')).toBeVisible({timeout:10000});
});
