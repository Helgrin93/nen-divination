// Compose ONLY the environment wings. No central runtime asset is rewritten.
// First generate/copy the approved room art to .verification/room-extension-source.png.
// Run with the local Vite server on port 5173. Reference/source files stay private.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const output='public/assets/room-v5';
await mkdir(output,{recursive:true});
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome'}:{});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/');
  const wings=await page.evaluate(async()=>{
    async function load(src){const img=new Image();img.src=src;await img.decode();return img;}
    const art=await load('/.verification/room-extension-source.png');
    const original=await load('/assets/scene-v3/unified-goblet-scene.png');
    const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
    const source=canvas(1536,1024),sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(original,0,0);
    const originalPixels=sc.getImageData(0,0,1536,1024).data;
    const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
    const W=512;
    return ['left','right'].map(side=>{
      const c=canvas(W,1024),ctx=c.getContext('2d',{willReadFrequently:true});
      const left=side==='left';
      // The side room's floor begins below the existing table's rear edge.
      // This lets the intact central table occlude skirting/floor at the join.
      const sx=left?0:1600,sw=left?350:281;
      ctx.drawImage(art,sx,0,sw,560,0,0,W,747);
      // Clean dark floor, sampled outside the source table and furniture.
      ctx.drawImage(art,left?0:1780,555,100,135,0,747,W,277);
      const pixels=ctx.getImageData(0,0,W,1024),p=pixels.data;
      // Local colour registration at the plaster boundary, preserving source
      // texture gradients; never blur or paint over any original scene pixel.
      const boundaryDeltas=[];
      for(let y=0;y<653;y++){
        const edgeX=left?0:1535,originalIndex=(y*1536+edgeX)*4;
        const sideIndex=(y*W+(left?W-1:0))*4;
        boundaryDeltas.push([0,1,2].map(k=>originalPixels[originalIndex+k]-p[sideIndex+k]));
      }
      for(let y=0;y<653;y++){
        const delta=boundaryDeltas[y],low=[0,0,0];
        let count=0;
        for(let yy=Math.max(0,y-28);yy<=Math.min(652,y+28);yy++){
          for(let k=0;k<3;k++)low[k]+=boundaryDeltas[yy][k];count++;
        }
        for(let k=0;k<3;k++)low[k]/=count;
        for(let x=0;x<W;x++){
          const d=left?W-1-x:x,weight=1-smooth(d/96),detail=Math.exp(-d/3),i=(y*W+x)*4;
          for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,p[i+k]+low[k]*weight+(delta[k]-low[k])*detail));
        }
      }
      ctx.putImageData(pixels,0,0);
      // A proper trapezoidal table: rear corners meet the existing x=0/1536,
      // y=653 edge; floor stays visible OUTSIDE the sloping side boundaries.
      ctx.save();ctx.beginPath();
      if(left){ctx.moveTo(W,653);ctx.lineTo(W,1024);ctx.lineTo(0,1024);}
      else{ctx.moveTo(0,653);ctx.lineTo(0,1024);ctx.lineTo(W,1024);}
      ctx.closePath();ctx.clip();
      // Extract ONLY empty tabletop from the generated background. Original
      // hands/glass never enter a side asset; register its colour at the join.
      ctx.drawImage(art,left?350:1214,573,314,263,0,653,W,371);
      const table=ctx.getImageData(0,653,W,371),t=table.data;
      // Register just the outer tabletop to the adjacent original edge. At the
      // join this is exact; away from it the source retains its wood texture.
      for(let y=0;y<371;y++){
        const boundary=(y*W+(left?W-1:0))*4;
        const target=((y+653)*1536+(left?0:1535))*4;
        const delta=[0,1,2].map(k=>originalPixels[target+k]-t[boundary+k]);
        for(let x=0;x<W;x++){
          const distance=left?W-1-x:x,weight=1-smooth(distance/64),i=(y*W+x)*4;
          for(let k=0;k<3;k++)t[i+k]=Math.max(0,Math.min(255,t[i+k]+delta[k]*weight));
        }
      }
      // putImageData ignores clipping: apply it on a separate clipped layer.
      const wood=canvas(W,371);wood.getContext('2d').putImageData(table,0,0);ctx.drawImage(wood,0,653);
      ctx.restore();
      ctx.lineWidth=1.8;ctx.strokeStyle='#72502d';ctx.beginPath();
      ctx.moveTo(left?W:0,653);ctx.lineTo(left?0:W,1024);ctx.stroke();
      ctx.lineWidth=.8;ctx.strokeStyle='#f6c36e';ctx.beginPath();
      ctx.moveTo(left?W-1:1,655);ctx.lineTo(left?0:W,1026);ctx.stroke();
      return {side,data:c.toDataURL('image/png')};
    });
  });
  for(const wing of wings){const file=`${output}/room-${wing.side}.png`;await writeFile(file,Buffer.from(wing.data.split(',')[1],'base64'));console.log(file);}
}finally{await browser.close();}
