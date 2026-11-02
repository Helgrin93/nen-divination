// Lossless PNG recompression only. Verify every reconstructed byte before
// accepting a smaller stream; dimensions, colour chunks and RGBA stay intact.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {inflateSync,deflateSync,constants} from 'node:zlib';
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){const c=Buffer.alloc(data.length+12);c.writeUInt32BE(data.length);c.write(type,4);data.copy(c,8);c.writeUInt32BE(crc(c.subarray(4,-4)),c.length-4);return c;}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
function predictor(f,a,b,c){return f===0?0:f===1?a:f===2?b:f===3?(a+b)>>>1:paeth(a,b,c);}
function decode(filtered,stride,bpp,height){const raw=Buffer.alloc(stride*height);for(let y=0;y<height;y++){const f=filtered[y*(stride+1)];for(let x=0;x<stride;x++){const i=y*stride+x;raw[i]=(filtered[y*(stride+1)+1+x]+predictor(f,x>=bpp?raw[i-bpp]:0,y?raw[i-stride]:0,y&&x>=bpp?raw[i-stride-bpp]:0))&255;}}return raw;}
const files=['room-v5/room-panorama.png','scene-v3/unified-goblet-scene.png','scene-v3/wing-neutral.png','scene-v3/wing-smile.png','scene-v3/wing-eyes-closed.png','scene-v3/wing-gesture.png','divination/table-clean.png','divination/hands-poses.png','divination/rug-border-repair.png'];
const report=[];
for(const file of files){
 const path=`public/assets/${file}`,input=await readFile(path),chunks=[];
 for(let offset=8;offset<input.length;){const n=input.readUInt32BE(offset),type=input.toString('ascii',offset+4,offset+8);chunks.push({type,data:input.subarray(offset+8,offset+8+n),bytes:input.subarray(offset,offset+n+12)});offset+=n+12;}
 const header=chunks.find(c=>c.type==='IHDR').data,width=header.readUInt32BE(),height=header.readUInt32BE(4),bpp=header[9]===6?4:header[9]===2?3:0;
 if(header[8]!==8||header[12]||!bpp)throw new Error(`Unsupported PNG: ${file}`);
 const filtered=inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))),stride=width*bpp,raw=decode(filtered,stride,bpp,height);
 const refiltered=Buffer.alloc(filtered.length);
 for(let y=0;y<height;y++){
  let bestScore=Infinity,best;
  for(let f=0;f<5;f++){
   const row=Buffer.alloc(stride+1);row[0]=f;let score=0;
   for(let x=0;x<stride;x++){const i=y*stride+x,v=(raw[i]-predictor(f,x>=bpp?raw[i-bpp]:0,y?raw[i-stride]:0,y&&x>=bpp?raw[i-stride-bpp]:0))&255;row[x+1]=v;score+=Math.min(v,256-v);}
   if(score<bestScore){bestScore=score;best=row;}
  }best.copy(refiltered,y*(stride+1));
 }
 let best;
 for(const data of [filtered,refiltered])for(const strategy of [constants.Z_DEFAULT_STRATEGY,constants.Z_FILTERED]){
  const compressed=deflateSync(data,{level:9,strategy});if(!best||compressed.length<best.length)best=compressed;
 }
 if(!decode(inflateSync(best),stride,bpp,height).equals(raw))throw new Error(`Pixel mismatch: ${file}`);
 let inserted=false;const output=Buffer.concat([input.subarray(0,8),...chunks.flatMap(c=>c.type!=='IDAT'?[c.bytes]:inserted?[]:(inserted=true,[chunk('IDAT',best)]))]);
 if(output.length<input.length)await writeFile(path,output);
 report.push({file,before:input.length,after:Math.min(input.length,output.length),identicalPixels:true});
}
await mkdir('docs/v5.3',{recursive:true});await writeFile('docs/v5.3/png-optimization.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({before:report.reduce((n,r)=>n+r.before,0),after:report.reduce((n,r)=>n+r.after,0),identicalPixels:true}));
