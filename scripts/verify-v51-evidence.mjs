import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
await mkdir('docs/v5.1',{recursive:true});
const hash=data=>createHash('sha256').update(data).digest('hex');
const protectedFiles=['public/assets/scene-v3/unified-goblet-scene.png','public/assets/divination/rug-border-repair.png','src/game/scoring.js','src/game/stateMachine.js','src/data/questions.js','src/data/nenTypes.js','src/components/divinationTimeline.js','src/components/WaterArtPass.js','src/components/WaterScene.js','src/components/CharacterCards.js'];
for(const name of ['leaf-states-atlas.png','leaf-flex-atlas-v3.png','overflow-atlas.png','overflow-ink-atlas-v3.png','diffusion-mattes-v3.png','sediment-atlas-v3.png','water-surface-clean.png'])protectedFiles.push('public/assets/divination/'+name);
const preserved=[];
for(const path of protectedFiles){
 const before=execFileSync('git',['show',`HEAD:${path}`],{maxBuffer:8*1024*1024}),after=await readFile(path);
 const normalize=buffer=>path.endsWith('.js')?buffer.toString('utf8').replaceAll('\r\n','\n'):buffer;
 preserved.push({path,unchanged:hash(normalize(before))===hash(normalize(after)),exactBytesUnchanged:hash(before)===hash(after),sha256:hash(after)});
}
if(preserved.some(p=>!p.unchanged))throw new Error('Protected file changed: '+preserved.filter(p=>!p.unchanged).map(p=>p.path).join(', '));
const before=JSON.parse(await readFile('docs/v5.1/before/checks.json')),after=JSON.parse(await readFile('docs/v5.1/after/checks.json'));
const radarUnchanged=before.every((r,i)=>JSON.stringify(r.radarSymbols)===JSON.stringify(after[i].radarSymbols));
if(!radarUnchanged)throw new Error('Radar data changed');
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
 const results=await page.evaluate(async()=>{
   const load=async src=>{const i=new Image();i.src=src;await i.decode();const c=Object.assign(document.createElement('canvas'),{width:i.width,height:i.height}),ctx=c.getContext('2d');ctx.drawImage(i,0,0);return {c,ctx,p:ctx.getImageData(0,0,c.width,c.height).data};};
   const spriteChecks=[];
   for(const name of ['neutral','smile','eyes-closed','gesture']){
     const a=await load(`/.verification/v51/original/wing-${name}.png`),b=await load(`/assets/scene-v3/wing-${name}.png`);
     let protectedHeadChanged=0,protectedSkinChanged=0,changed=0,left=1536,top=1024,right=0,bottom=0;
     for(let y=0;y<1024;y++)for(let x=0;x<1536;x++){
       const i=(y*1536+x)*4,diff=[0,1,2,3].some(k=>a.p[i+k]!==b.p[i+k]);
       if(!diff)continue;changed++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
       if((name==='neutral'||name==='gesture')&&y<960)protectedHeadChanged++;
       if((name==='neutral'||name==='gesture')&&y>=960&&a.p[i+3]>100&&a.p[i]-a.p[i+2]>32)protectedSkinChanged++;
     }
     const originalProtected=name==='neutral'||name==='gesture';
     spriteChecks.push({name,changed,bounds:{left,top,right,bottom},protectedHeadChanged:originalProtected?protectedHeadChanged:null,protectedSkinChanged:originalProtected?protectedSkinChanged:null});
   }
   const panorama=await load('/assets/room-v5/room-panorama.png'),original=await load('/assets/scene-v3/unified-goblet-scene.png');
   let centralPixelsChanged=0;for(let y=0;y<1024;y++)for(let x=0;x<1536;x++)for(let k=0;k<4;k++)if(panorama.p[(y*2560+x+512)*4+k]!==original.p[(y*1536+x)*4+k])centralPixelsChanged++;
   const sheets=[];
   for(const name of ['1920x1080','1440x900','390x844','375x667']){
     const mobile=name.startsWith('3'),width=mobile?300:640,height=mobile?680:390;
     const stages=['intro','quiz','comment','transition','concentration','revelation','conclusion','pose-neutral','pose-smile','pose-eyesClosed','pose-gesture','result-it'];
     const sheet=Object.assign(document.createElement('canvas'),{width:width*3,height:(height+32)*4}),ctx=sheet.getContext('2d');ctx.fillStyle='#182125';ctx.fillRect(0,0,sheet.width,sheet.height);
     for(let i=0;i<stages.length;i++){
       const {c}=await load(`/docs/v5.1/after/${name}-${stages[i]}.png`),x=(i%3)*width,y=Math.floor(i/3)*(height+32),s=Math.min(width/c.width,height/c.height);
       ctx.fillStyle='#fff';ctx.font='16px Arial';ctx.fillText(`${name} — ${stages[i]}`,x+8,y+22);ctx.drawImage(c,x,y+32,c.width*s,c.height*s);
     }sheets.push({name,url:sheet.toDataURL()});
   }
   return {spriteChecks,centralPixelsChanged,sheets};
 });
 if(results.centralPixelsChanged||results.spriteChecks.some(p=>p.protectedHeadChanged||p.protectedSkinChanged))throw new Error('Protected artwork pixels changed');
 for(const sheet of results.sheets)await writeFile(`docs/v5.1/after/${sheet.name}-contact-sheet.png`,Buffer.from(sheet.url.split(',')[1],'base64'));
 const report={baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),preserved,radarUnchanged,spriteChecks:results.spriteChecks,panoramaCentralChannelsChanged:results.centralPixelsChanged,viewports:after.map(r=>({name:r.name,errors:r.errors,documentWidth:r.documentWidth}))};
 await writeFile('docs/v5.1/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,preserved:preserved.length},null,2));
 await page.goto('http://127.0.0.1:5173/docs/v5.1/confronto.html');
 for(const viewport of ['1920x1080','1440x900','390x844','375x667'])for(const state of ['intro','quiz','comment','transition','concentration','revelation','conclusion','pose-neutral','pose-smile','pose-eyesClosed','pose-gesture','result-it','result-en']){
   await page.locator('#screen').selectOption(viewport);await page.locator('#state').selectOption(state);
   await page.waitForFunction(()=>[...document.querySelectorAll('.frame img')].every(img=>img.complete&&img.naturalWidth>0));
 }
 console.log('Confronto HTML: 104 screenshots decoded.');
}finally{await browser.close();}
