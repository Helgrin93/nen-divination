import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const hash=b=>createHash('sha256').update(b).digest('hex'),baseline='.verification/v52/baseline/';
async function files(dir){const found=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${e.name}`;if(e.isDirectory())found.push(...await files(path));else found.push(path);}return found;}
const protectedFiles=[];
for(const path of[...await files('public'),...await files('src'),...await files('review')]){
 if(path==='src/main.js'||path==='src/components/GlassComposition.js')continue;
 const before=await readFile(baseline+path),after=await readFile(path);if(hash(before)!==hash(after))throw new Error('Unexpected V5.2 change: '+path);
 protectedFiles.push({path,sha256:hash(after)});
}
for(const path of['index.html','src/main.js']){
 const before=await readFile(baseline+path,'utf8'),after=await readFile(path,'utf8');
 const expected=path==='index.html'?before.replace('<title>Nen Divination Test</title>','<title>HxH - Nen Divination Test</title>'):before.replace("document.title='Nen Divination Test'","document.title='HxH - Nen Divination Test'");
 if(after!==expected)throw new Error('Unexpected change beyond browser title: '+path);
}
const before=JSON.parse(await readFile('docs/v5.2/before/checks.json')),after=JSON.parse(await readFile('docs/v5.2/after/checks.json'));
for(const [i,record]of after.entries()){
 if(record.errors.length||record.width!==Number(record.name.split('x')[0]))throw new Error('Viewport regression');
 if(record.title!=='HxH - Nen Divination Test'||record.header!=='Nen Divination Test')throw new Error('Title mismatch');
 if(record.focusText!==before[i].focusText)throw new Error('Unapproved dialogue change');
}
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/docs/v5.2/confronto.html');
 for(const viewport of['1920x1080','1440x900','390x844','375x667'])for(const state of['glass-rendered','intro','quiz','comment','transition','concentration','pose-neutral','pose-smile','pose-eyesClosed','pose-gesture']){
  await page.locator('#screen').selectOption(viewport);await page.locator('#state').selectOption(state);await page.waitForFunction(()=>[...document.querySelectorAll('.frame img')].every(i=>i.complete&&i.naturalWidth));
 }
 await page.goto('http://127.0.0.1:5173/docs/v5.2/animations.html');
 for(const type of['enhancement','emission','transmutation','conjuration','manipulation','specialization'])for(const device of['desktop','mobile']){
  await page.locator('#type').selectOption(type);await page.locator('#device').selectOption(device);
  await page.waitForFunction(()=>document.querySelector('video').readyState>=1&&[...document.querySelectorAll('.frames img')].every(i=>i.complete&&i.naturalWidth));
 }
 if(errors.length)throw new Error(errors.join('\n'));
 await writeFile('docs/v5.2/preservation.json',JSON.stringify({protectedFiles,assetsChanged:0,unapprovedDialogueOrAnimationChanges:0,mainChanges:'browser title only',viewports:after,comparisonAndAnimationGalleryVerified:true},null,2));
 console.log(`${protectedFiles.length} files unchanged from V5.1; browser title is the only main.js change; all four viewports and both galleries verified.`);
}finally{await browser.close();}
