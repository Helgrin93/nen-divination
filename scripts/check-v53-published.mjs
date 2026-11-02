import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('docs/v5.3/after',{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),requests=[];
 page.on('requestfinished',r=>requests.push({url:r.url(),...r.timing()}));
 await page.goto('https://helgrin93.github.io/nen-divination/',{waitUntil:'load',timeout:30000});
 await page.screenshot({path:'docs/v5.3/after/published-current.png'});
 const report={url:page.url(),title:await page.title(),images:await page.locator('img').evaluateAll(images=>images.map(i=>({src:i.src,loaded:i.complete&&Boolean(i.naturalWidth),loading:i.loading}))),requests};
 await writeFile('docs/v5.3/published-check.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({url:report.url,title:report.title,images:report.images}));
}finally{await browser.close();}
