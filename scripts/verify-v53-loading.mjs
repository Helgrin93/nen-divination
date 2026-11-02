import http from 'node:http';
import path from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium,webkit} from '@playwright/test';
const root=path.resolve('dist'),prefix='/nen-divination/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const filename=path.resolve(root,decodeURIComponent(pathname.slice(prefix.length))||'index.html');
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'public, max-age=3600'});res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const records=[];await mkdir('docs/v5.3/after',{recursive:true});
try{
 for(const [device,engine,viewport]of[['desktop',chromium,{width:1440,height:900}],['mobile',webkit,{width:390,height:844}]]){
  const browser=await engine.launch(engine===chromium&&process.platform==='win32'?{channel:'chrome'}:{});
  try{
   const page=await browser.newPage({viewport,isMobile:device==='mobile',hasTouch:device==='mobile'});
   await page.addInitScript(()=>{
    window.sceneShifts=0;
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.sceneShifts+=e.value;}).observe({type:'layout-shift',buffered:true});}catch{/* WebKit may not expose layout-shift. */}
   });
   let responses=[],errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
   page.on('requestfinished',r=>responses.push({url:r.url(),...r.timing()}));
   const url=`http://127.0.0.1:${server.address().port}${prefix}`;
   for(const mode of ['cold','reload','slow']){
    let session;
    if(mode==='slow'){
     if(engine===chromium){
      session=await page.context().newCDPSession(page);await session.send('Network.enable');await session.send('Network.clearBrowserCache');
      await session.send('Network.emulateNetworkConditions',{offline:false,downloadThroughput:1_600_000/8,uploadThroughput:750_000/8,latency:150});
     }else{
      // WebKit has no CDP bandwidth emulation. Delayed critical responses still
      // exercise the coordinated reveal independently of Chromium throttling.
      await page.route('**/assets/**/*.png',async route=>{await new Promise(resolve=>setTimeout(resolve,600));await route.continue();});
     }
    }
    responses=[];errors=[];
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#experience[data-loading=ready]').waitFor({timeout:55000});
    const record=await page.evaluate(()=>({result:document.querySelector('#experience').dataset.loadingResult,shift:window.sceneShifts,readyMs:performance.now(),readyImages:[...document.querySelectorAll('.quiz-scene-art img[src]:not([hidden])')].filter(i=>!i.matches('.wing-sprite:not(.is-active)')).every(i=>i.complete&&i.naturalWidth),hands:document.querySelector('.hands-motion').dataset.ready,glass:document.querySelector('.water-effects').dataset.glassPose}));
    await page.screenshot({path:`docs/v5.3/after/${device}-loading-${mode}.png`,animations:'disabled'});
    records.push({device,mode,...record,errors,requests:responses});
    if(record.result!=='complete'||!record.readyImages||record.hands!=='true'||record.glass!=='neutral'||errors.length)throw Error(`Incomplete ${device} ${mode}: ${JSON.stringify(record)} ${errors}`);
    if(session)await session.detach();
   }
  }finally{await browser.close();}
 }
 // The published site has its own read-only check in check-v53-published.mjs,
 // so local production verification remains independent of network access.
 await writeFile('docs/v5.3/loading-checks.json',JSON.stringify(records,null,2));
 console.log(JSON.stringify(records.map(({requests,...record})=>record),null,2));
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
