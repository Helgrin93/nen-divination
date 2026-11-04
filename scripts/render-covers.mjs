// Offline SoundFont rendering; authoring dependencies never enter the app bundle.
import {readFile, writeFile, mkdir, copyFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {coverScores, legendArrangement} from '../assets/audio/cover-score.mjs';
import {hyoriArrangement} from '../assets/audio/hyori-cover.mjs';

const root = new URL('../', import.meta.url), rate = 44100;
const require = createRequire(new URL('.verification/audio-tools/package.json', root));
const synthModule = require('js-synthesizer');
synthModule.Synthesizer.initializeWithFluidSynthModule(require('js-synthesizer/libfluidsynth'));
await synthModule.waitForReady();
const {Mp3Encoder} = await import(new URL('.verification/audio-tools/node_modules/@breezystack/lamejs/dist/lamejs.js', root));
const font = await readFile(new URL('.verification/audio/soundfonts/GeneralUser-GS.sf2', root));
const fontHash = createHash('sha256').update(font).digest('hex');
if (fontHash !== '9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe') {
  throw new Error('Expected GeneralUser GS 2.0.3; see src/assets/audio/README.md.');
}
const output = new URL('src/assets/audio/', root);
const manifestPath = new URL('manifest.json', output);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const requested = process.argv.slice(2);
const selected = requested.length === 0 ? coverScores : coverScores.filter(score => requested.includes(`--track=${score.id}`));
if ((requested.length > 0 && selected.length !== requested.length) || !selected.length) {
  throw new Error('Use no arguments or --track=intro-quiz / --track=divination / --track=result');
}
const backup = new URL(`.verification/audio/backups/${Date.now()}/`, root);
await mkdir(backup, {recursive: true});
for (const name of [...selected.map(score => `${score.id}.mp3`), 'manifest.json']) {
  await copyFile(new URL(name, output), new URL(name, backup));
}

async function render(arrangement) {
  if (arrangement.kind === 'isolated-instrumental') {
    const pcm = await Promise.all(arrangement.pcmFiles.map(async file => {
      const bytes = await readFile(new URL(file, root));
      if (bytes.length !== arrangement.duration * rate * 4) throw new Error('Invalid instrumental stem length');
      const channel = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
      if (!channel.every(Number.isFinite)) throw new Error('Invalid instrumental samples');
      return channel;
    }));
    return encode(pcm, arrangement);
  }
  const synth = new synthModule.Synthesizer();
  synth.init(rate, {initialGain: .55, polyphony: 256, chorusActive: false,
    reverbActive: true, reverbDamp: .35, reverbLevel: .35, reverbRoomSize: .55, reverbWidth: .8});
  try {
    const fontId = await synth.loadSFont(font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength));
    for (const p of arrangement.programs) {
      synth.midiProgramSelect(p.channel, fontId, p.bank || 0, p.program);
      synth.midiControl(p.channel, 7, p.volume);
      synth.midiControl(p.channel, 10, p.pan);
      synth.midiControl(p.channel, 91, p.channel === 0 ? 40 : 52);
    }
    const count = Math.round(arrangement.duration * rate);
    const pcm = [new Float32Array(count), new Float32Array(count)];
    const queue = [];
    // Render two cycles and retain the second: instrument/reverb tails wrap naturally.
    for (let repeat = 0; repeat < 2; repeat++) {
      const offset = repeat * count;
      for (const n of arrangement.events) {
        if (![n.start, n.duration, n.pitch, n.velocity].every(Number.isFinite) || n.duration <= 0) throw new Error('Invalid note');
        queue.push({frame: offset + Math.round(n.start * rate), type: 'on', ...n});
        queue.push({frame: offset + Math.round((n.start + n.duration) * rate), type: 'off', ...n});
      }
      for (const c of arrangement.controls) queue.push({frame: offset + Math.round(c.time * rate), type: 'cc', ...c});
    }
    queue.sort((a, b) => a.frame - b.frame || (a.type === 'off' ? -1 : b.type === 'off' ? 1 : 0));
    let cursor = 0, frame = 0;
    while (frame < count * 2) {
      while (cursor < queue.length && queue[cursor].frame <= frame) {
        const e = queue[cursor++];
        if (e.type === 'on') synth.midiNoteOn(e.channel, e.pitch, e.velocity);
        else if (e.type === 'off') synth.midiNoteOff(e.channel, e.pitch);
        else synth.midiControl(e.channel, e.controller, e.value);
      }
      const length = Math.min(4096, count * 2 - frame, (queue[cursor]?.frame ?? Infinity) - frame);
      const chunk = [new Float32Array(length), new Float32Array(length)];
      synth.render(chunk);
      if (frame + length > count) {
        const skip = Math.max(0, count - frame), destination = Math.max(0, frame - count);
        pcm[0].set(chunk[0].subarray(skip), destination);
        pcm[1].set(chunk[1].subarray(skip), destination);
      }
      frame += length;
    }
    return encode(pcm, arrangement);
  } finally {synth.close();}
}

function encode(pcm, arrangement) {
    const count = Math.round(arrangement.duration * rate);
    let peak = 0, squares = 0;
    for (const channel of pcm) for (const sample of channel) {peak = Math.max(peak, Math.abs(sample)); squares += sample * sample;}
    if (peak === 0 || !Number.isFinite(peak)) throw new Error('Silent or invalid render');
    const gain = Math.min(.80 / peak, .13 / Math.sqrt(squares / (count * 2)));
    const rampIn = Math.max(176, Math.round((arrangement.fadeInSeconds || 0) * rate));
    const rampOut = Math.max(176, Math.round((arrangement.fadeOutSeconds || 0) * rate));
    const int16 = pcm.map(channel => Int16Array.from(channel, (sample, i) => {
      const ramp = Math.min(1, i / rampIn, (count - 1 - i) / rampOut);
      return Math.round(sample * gain * ramp * 32767);
    }));
    const encoder = new Mp3Encoder(2, rate, 160), chunks = [];
    for (let i = 0; i < count; i += 1152) chunks.push(Buffer.from(encoder.encodeBuffer(int16[0].subarray(i, i + 1152), int16[1].subarray(i, i + 1152))));
    chunks.push(Buffer.from(encoder.flush()));
    return {bytes: Buffer.concat(chunks), analysis: {durationSeconds: count / rate, sampleRate: rate, channels: 2,
      peakDbFS: 20 * Math.log10(peak * gain), rmsDbFS: 10 * Math.log10(squares / (count * 2) * gain * gain), events: arrangement.events.length}};
}

// Finish selected renders before replacing the working tracks.
const renders = [];
for (const score of selected) {
  const arrangement = score.id === 'intro-quiz'
    ? JSON.parse(await readFile(new URL('assets/audio/world-cover.json', root), 'utf8'))
    : score.id === 'divination' ? legendArrangement() : hyoriArrangement();
  const rendered = await render(arrangement);
  renders.push({score, ...rendered});
  console.log(`${score.title}: ${rendered.analysis.durationSeconds.toFixed(2)} s; peak ${rendered.analysis.peakDbFS.toFixed(1)} dBFS; RMS ${rendered.analysis.rmsDbFS.toFixed(1)} dBFS`);
}
for (const {score, bytes, analysis} of renders) {
  const file = `${score.id}.mp3`;
  await writeFile(new URL(file, output), bytes);
  const track = {id: score.id, title: score.title, file, bpm: score.bpm, kind: score.kind,
    composer: score.composer, ...(score.artist ? {artist:score.artist} : {}), credit: score.credit, sourceUrl: score.sourceUrl,
    ...analysis, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')};
  manifest.tracks[manifest.tracks.findIndex(t => t.id === score.id)] = track;
}
manifest.version = 5;
manifest.provenance = 'Two sampled instrumental covers of Yoshihisa Hirano themes. Result: a 60-second excerpt of the user-selected Yuzu recording with vocals removed; not a newly performed cover.';
manifest.soundfont = {name: 'GeneralUser GS', version: '2.0.3', author: 'S. Christian Collins', sha256: fontHash};
const finalTrack = manifest.tracks.find(t => t.id === 'result');
if (selected.some(score => score.id === 'result')) {
  finalTrack.referenceSegment = {url:'https://www.youtube.com/watch?v=ZV9jaHMnaUI', startSeconds:0, endSeconds:60};
  finalTrack.transcription = 'No symbolic transcription: stereo accompaniment isolated from the selected recording with UVR-MDX-NET-Voc_FT. Vocal residue and separation artifacts may remain.';
  finalTrack.method = 'vocal-removal';
  finalTrack.containsSourceRecording = true;
  finalTrack.soundfontUsed = false;
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
