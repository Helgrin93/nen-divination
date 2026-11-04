import {cp,mkdir,readFile,writeFile,readdir,unlink} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'vite';
// Isolated source copy: synthetic fixtures never enter src/ or production dist/.
const fixtureRoot=path.resolve('.verification/v53-audio-build');
await mkdir(fixtureRoot,{recursive:true});await cp('src',path.join(fixtureRoot,'src'),{recursive:true});
await writeFile(path.join(fixtureRoot,'index.html'),await readFile('index.html'));
for(const file of ['questions_scoring.json','score_calibration.json'])await cp(file,path.join(fixtureRoot,file));
const audioDirectory=path.join(fixtureRoot,'src/assets/audio');await mkdir(audioDirectory,{recursive:true});
// Original MP3s must not compete with the WAV fixtures in this isolated copy.
for(const name of await readdir(audioDirectory)){
 if(/^(intro-quiz|divination|result)\.(mp3|m4a|ogg|wav)$/.test(name))await unlink(path.join(audioDirectory,name));
}
for(const [index,name]of ['intro-quiz','divination','result'].entries()){
 const rate=8000,n=4000,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
 for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.sin(i*(220+index*110)*Math.PI*2/rate)*1600),44+i*2);
 await writeFile(path.join(audioDirectory,`${name}.wav`),b);
}
await build({configFile:path.resolve('vite.config.js'),root:fixtureRoot,logLevel:'error',build:{outDir:path.join(fixtureRoot,'dist'),emptyOutDir:true}});
const assets=path.join(fixtureRoot,'dist/assets'),names=await readdir(assets);
const javascript=(await Promise.all(names.filter(n=>n.endsWith('.js')).map(n=>readFile(path.join(assets,n),'utf8')))).join('\n');
const tracks=[];
for(const name of ['intro-quiz','divination','result']){
 const file=names.find(n=>n.startsWith(`${name}-`)&&n.endsWith('.wav'));
 if(!file||!javascript.includes(`/nen-divination/assets/${file}`))throw Error(`Missing or incorrectly prefixed audio: ${name}`);
 tracks.push({name,file,basePathCorrect:true});
}
const productionAudioFiles=(await readdir('src/assets/audio')).filter(name=>/\.(mp3|m4a|ogg|wav)$/.test(name));
await writeFile(path.join(fixtureRoot,'audio-build-check.json'),JSON.stringify({isolatedFixtures:true,productionAudioFiles,tracks},null,2));
console.log('All three optional audio files are discovered, hashed and prefixed correctly in an isolated production build.');
