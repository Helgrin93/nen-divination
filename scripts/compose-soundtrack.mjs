// Offline, deterministic additive synthesis. Requires only Node for WAV output.
// MP3 encoding is an optional authoring tool, never a runtime dependency:
// npm install --prefix .verification/audio-tools --no-save @breezystack/lamejs@1.2.7
// npm run assets:audio:originals -- --mp3
import {mkdir, writeFile, readdir, unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {scores} from '../assets/audio/original-score.mjs';

const root = new URL('../', import.meta.url);
// Preserve the current covers when revisiting the rejected original sketches.
const output = new URL('.verification/audio/originals/', root);
const rate = 44100;
const mp3 = process.argv.includes('--mp3');
const wav = process.argv.includes('--wav');
if (mp3 === wav) throw new Error('Choose --mp3 or --wav explicitly; existing tracks with the same name will be replaced.');
let Mp3Encoder;
if (mp3) {
  try {
    ({Mp3Encoder} = await import(new URL('.verification/audio-tools/node_modules/@breezystack/lamejs/dist/lamejs.js', root)));
  } catch {
    throw new Error('Install the optional MP3 authoring tool: npm install --prefix .verification/audio-tools --no-save @breezystack/lamejs@1.2.7');
  }
}

const tau = Math.PI * 2;
const table = Float32Array.from({length: 65536}, (_, i) => Math.sin(tau * i / 65536));
const sin = phase => table[(phase * 65536 & 65535)];
function random(seed) {
  return () => {seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296;};
}
function midi(note) {
  const match = /^([A-G])(#?)(-?\d+)$/.exec(note);
  if (!match) throw new Error(`Invalid note: ${note}`);
  return (Number(match[3]) + 1) * 12 + {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]] + Number(Boolean(match[2]));
}
const frequency = note => 440 * 2 ** ((midi(note) - 69) / 12);
const cache = new Map();
function voice(instrument, pitch, duration) {
  const key = `${instrument}:${pitch}:${duration.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);
  const hz = frequency(pitch), rng = random(1811 + midi(pitch) * 37);
  const sustained = ['strings', 'flute', 'bass'].includes(instrument);
  const release = instrument === 'strings' ? .85 : instrument === 'flute' ? .3 : sustained ? .4 : 1.5;
  const length = Math.ceil((duration + release) * rate), samples = new Float32Array(length);
  const attack = instrument === 'strings' ? .48 : instrument === 'flute' ? .12 : instrument === 'bass' ? .08 : .006;
  const partials = {
    strings: [[1,.68],[2,.18],[3,.11],[4,.045],[5,.022],[6,.012]],
    flute: [[1,.86],[2,.065],[3,.13],[4,.023],[5,.012]],
    bass: [[1,.86],[2,.15],[3,.06]],
    piano: [[1,.65],[2,.24],[3,.13],[4,.075],[5,.025],[7,.01]],
    harp: [[1,.71],[2,.22],[3,.12],[4,.045],[5,.02]],
    glass: [[1,.64],[2.71,.12],[4.03,.045],[5.39,.016]],
    celesta: [[1,.7],[2,.17],[3.98,.055],[5.01,.014]],
  }[instrument];
  if (!partials) throw new Error(`Unknown instrument: ${instrument}`);
  let phase = 0, breath = 0;
  const decays = partials.map(([ratio]) => Math.exp(-1 / (rate * (instrument === 'glass' ? 2.4 : instrument === 'piano' ? 1.7 : 1.1) / Math.sqrt(ratio))));
  const amplitudes = partials.map(([, amplitude]) => amplitude);
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    const env = Math.min(1, t / attack) * (t < duration ? 1 : Math.max(0, 1 - (t - duration) / release) ** 2);
    const vibrato = instrument === 'strings' ? .0019 * sin(t * 4.8) : instrument === 'flute' ? .0022 * sin(t * 4.6) * Math.min(1, t / .5) : 0;
    phase += hz / rate * (1 + vibrato);
    let sample = 0;
    for (let p = 0; p < partials.length; p++) {
      const ratio = partials[p][0];
      const detune = instrument === 'piano' ? 1 + p * p * .00013 : 1;
      let harmonic = sin(phase * ratio * detune);
      if (instrument === 'strings') harmonic = (harmonic + .36 * sin(phase * ratio * 1.0018 + .19) + .36 * sin(phase * ratio * .9985 + .53)) / 1.72;
      sample += harmonic * amplitudes[p];
      if (!sustained) amplitudes[p] *= decays[p];
    }
    if (instrument === 'flute') {
      breath += .18 * ((rng() * 2 - 1) - breath);
      sample += breath * .04;
    }
    samples[i] = sample * env;
  }
  cache.set(key, samples);
  return samples;
}

function percussion(kind, rng) {
  const length = Math.ceil(rate * (kind === 'pulse' ? .85 : .12));
  const samples = new Float32Array(length);
  let phase = 0, low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / rate, noise = rng() * 2 - 1;
    low += .12 * (noise - low);
    if (kind === 'pulse') {
      phase += (53 + 46 * Math.exp(-t * 28)) / rate;
      samples[i] = (.82 * sin(phase) * Math.exp(-t * 8) + .12 * low * Math.exp(-t * 18)) * Math.min(1, t / .005);
    } else samples[i] = (noise - low) * Math.exp(-t * 58) * Math.min(1, t / .004) * .22;
  }
  return samples;
}

function arrange(score) {
  const events = [], beat = 60 / score.bpm, rng = random(score.seed);
  function add(instrument, pitch, bar, offset, duration, level, pan = 0) {
    events.push({instrument, pitch, start: (bar * 4 + offset) * beat + (rng() - .5) * .012,
      duration: duration * beat, level: level * (.95 + rng() * .1), pan});
  }
  for (let bar = 0; bar < score.bars; bar++) {
    const [bass, chord] = score.harmony[bar % score.harmony.length];
    const ritual = score.arrangement === 'ritual', journey = score.arrangement === 'journey';
    const swell = Math.sin(Math.PI * (bar + .5) / score.bars) ** 2;
    chord.forEach((pitch, i) => add('strings', pitch, bar, 0, 4, ritual ? .046 : .039 + swell * .015, (i / (chord.length - 1) - .5) * .9));
    add('bass', bass, bar, 0, 3.7, ritual ? .10 : .12, -.05);
    if (journey) {
      const pattern = [0,2,1,3,2,4,1,3];
      pattern.forEach((index, i) => add('harp', chord[index], bar, i * .5, .8, .075, i % 2 ? .32 : -.32));
      add('harp', bass, bar, 0, 1, .09, -.12);
      add('pulse', bass, bar, 0, 1, .16);
      add('pulse', bass, bar, 2, 1, .095);
      for (const offset of [.5,1.5,2.5,3.5]) add('brush', bass, bar, offset, .1, .07, .35);
    } else if (ritual) {
      add('glass', chord[2], bar, .12, 3.1, .09, -.32);
      if (bar % 2 === 0) add('glass', chord.at(-1), bar, 2.4, 2.8, .055, .4);
      add('pulse', bass, bar, 0, 1, .085);
      if (bar % 2) add('pulse', bass, bar, 2.5, 1, .05);
      add('harp', chord[1], bar, 1.5, 1.7, .055, .28);
    } else {
      for (const [i, offset] of [0,.75,1.5,2,2.75,3.5].entries()) add('piano', chord[[0,2,3,1,4,2][i]], bar, offset, 1.4, .095, (i % 3 - 1) * .28);
      add('piano', bass, bar, 0, 2.8, .11, -.2);
      if (bar % 2 === 0) add('celesta', chord.at(-1), bar, 0, 2.8, .055, .35);
    }
    const section = Math.floor(bar / 8) % score.melodies.length;
    let offset = 0;
    for (const token of score.melodies[section][bar % 8].split(' ')) {
      const [pitch, value] = token.split(':'), duration = Number(value);
      if (pitch !== '-') {
        const instrument = ritual || journey ? 'flute' : 'piano';
        add(instrument, pitch, bar, offset, duration * .87, ritual ? .16 : journey ? .17 : .22, journey ? -.12 : .08);
        if (!ritual && !journey && bar >= 8) add('flute', pitch, bar, offset, duration * .83, .065, -.18);
      }
      offset += duration;
    }
    if (Math.abs(offset - 4) > .001) throw new Error(`Melody bar must contain 4 beats: ${score.id}, ${bar}`);
  }
  return events;
}

// Four damped combs and two allpasses. A warm-up traversal makes the room
// periodic, so reverb carries across the loop boundary instead of being cut.
function reverb(left, right, decay) {
  const count = left.length, input = Float32Array.from(left, (value, i) => (value + right[i]) * .5);
  for (const [channel, shifts] of [[left,[.0297,.0371,.0411,.0437]], [right,[.0307,.0383,.0427,.0451]]]) {
    const wet = new Float32Array(count);
    for (const delay of shifts) {
      const line = new Float32Array(Math.round(delay * rate)), feedback = 10 ** (-3 * delay / decay);
      let cursor = 0, damped = 0;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < count; i++) {
          const echo = line[cursor];
          damped += .26 * (echo - damped);
          line[cursor] = input[i] + damped * feedback;
          if (pass) wet[i] += echo * .25;
          if (++cursor === line.length) cursor = 0;
        }
      }
    }
    for (const delay of [.005,.0017]) {
      const line = new Float32Array(Math.round(delay * rate));
      let cursor = 0;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < count; i++) {
          const incoming = wet[i], echo = line[cursor];
          const value = echo - incoming * .5;
          line[cursor] = incoming + value * .5;
          if (pass) wet[i] = value;
          if (++cursor === line.length) cursor = 0;
        }
      }
    }
    for (let i = 0; i < count; i++) channel[i] += wet[i] * .23;
  }
}

function render(score) {
  cache.clear();
  const count = Math.round(score.bars * 4 * 60 / score.bpm * rate);
  const left = new Float32Array(count), right = new Float32Array(count), rng = random(score.seed);
  const events = arrange(score);
  for (const event of events) {
    const samples = ['pulse','brush'].includes(event.instrument) ? percussion(event.instrument, rng) : voice(event.instrument, event.pitch, event.duration);
    const start = Math.round(event.start * rate), angle = (event.pan + 1) * Math.PI / 4;
    const l = Math.cos(angle) * event.level, r = Math.sin(angle) * event.level;
    // Notes extending past the end wrap to the beginning of the loop.
    for (let i = 0; i < samples.length; i++) {
      const index = ((start + i) % count + count) % count;
      left[index] += samples[i] * l; right[index] += samples[i] * r;
    }
  }
  reverb(left, right, score.arrangement === 'ritual' ? 2.6 : 1.8);
  const means = [left, right].map(channel => channel.reduce((sum, value) => sum + value, 0) / count);
  let peak = 0, square = 0;
  for (const [index, channel] of [left, right].entries()) {
    for (let i = 0; i < count; i++) {
      channel[i] -= means[index];
      peak = Math.max(peak, Math.abs(channel[i])); square += channel[i] ** 2;
    }
  }
  const gain = Math.min(.79 / peak, .15 / Math.sqrt(square / (count * 2)));
  const pcm = [new Int16Array(count), new Int16Array(count)];
  let masteredPeak = 0, masteredSquare = 0;
  for (const [index, channel] of [left, right].entries()) {
    // Tiny edge ramps prevent codec/device discontinuities without a gap.
    const ramp = Math.round(rate * .004);
    for (let i = 0; i < count; i++) {
      const envelope = Math.min(1, i / ramp, (count - 1 - i) / ramp);
      const value = channel[i] * gain * envelope;
      masteredPeak = Math.max(masteredPeak, Math.abs(value)); masteredSquare += value ** 2;
      pcm[index][i] = Math.round(value * 32767);
    }
  }
  return {pcm, analysis: {durationSeconds: count / rate, sampleRate: rate, channels: 2,
    peakDbFS: 20 * Math.log10(masteredPeak), rmsDbFS: 10 * Math.log10(masteredSquare / (count * 2)), events: events.length}};
}

function encodeWav([left, right]) {
  const data = Buffer.alloc(44 + left.length * 4);
  data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(left.length * 4, 40);
  for (let i = 0; i < left.length; i++) {data.writeInt16LE(left[i], 44 + i * 4); data.writeInt16LE(right[i], 46 + i * 4);}
  return data;
}
function encodeMp3([left, right]) {
  const encoder = new Mp3Encoder(2, rate, 160), chunks = [];
  for (let i = 0; i < left.length; i += 1152) chunks.push(Buffer.from(encoder.encodeBuffer(left.subarray(i, i + 1152), right.subarray(i, i + 1152))));
  chunks.push(Buffer.from(encoder.flush()));
  return Buffer.concat(chunks);
}

await mkdir(output, {recursive: true});
const manifest = {version: 1, provenance: 'Original project compositions, synthesized from the score without third-party samples.', format: mp3 ? 'mp3' : 'wav', tracks: []};
for (const score of scores) {
  const {pcm, analysis} = render(score);
  const bytes = mp3 ? encodeMp3(pcm) : encodeWav(pcm);
  const filename = `${score.id}.${manifest.format}`;
  await writeFile(new URL(filename, output), bytes);
  // Keep a single format per stem, including after a WAV/MP3 authoring switch.
  for (const previous of await readdir(output)) {
    if (previous !== filename && new RegExp(`^${score.id}\\.(mp3|m4a|ogg|wav)$`).test(previous)) await unlink(new URL(previous, output));
  }
  manifest.tracks.push({id: score.id, title: score.title, file: filename, bpm: score.bpm, bars: score.bars,
    ...analysis, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')});
  console.log(`${score.title}: ${analysis.durationSeconds.toFixed(1)}s, ${(bytes.length / 1024).toFixed(0)} KiB, peak ${analysis.peakDbFS.toFixed(1)} dBFS`);
}
await writeFile(new URL('manifest.json', output), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Soundtrack written to ${fileURLToPath(output)}`);
