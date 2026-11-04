// Verify the shipped MP3s, not synthetic fixtures, beneath the production base.
import {createServer} from 'node:http';
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium, expect} from '@playwright/test';
import {finishDialogue, finishRevelation} from '../e2e/helpers/dialogue.js';

const root = path.resolve('dist'), prefix = '/nen-divination/';
const manifest = JSON.parse(await readFile('src/assets/audio/manifest.json', 'utf8'));
const builtAssets = await readdir(path.join(root, 'assets'));
const bundled = [];
for (const track of manifest.tracks) {
  const file = builtAssets.find(name => name.startsWith(`${track.id}-`) && name.endsWith('.mp3'));
  assert.ok(file, `Missing production MP3 for ${track.id}`);
  const bytes = await readFile(path.join(root, 'assets', file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256);
  bundled.push({...track, url: `${prefix}assets/${file}`});
}
assert.ok(!builtAssets.some(name => /lamejs|original-score|audio-tools/.test(name)));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.mp3':'audio/mpeg', '.png':'image/png', '.svg':'image/svg+xml'};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) {res.writeHead(404).end(); return;}
    const filename = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!filename.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
    const bytes = await readFile(filename);
    const headers = {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream', 'Accept-Ranges':'bytes'};
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = Number(range[1]), end = Math.min(Number(range[2] || bytes.length - 1), bytes.length - 1);
      if (start > end) {res.writeHead(416, {'Content-Range':`bytes */${bytes.length}`}).end(); return;}
      res.writeHead(206, {...headers, 'Content-Length':end - start + 1, 'Content-Range':`bytes ${start}-${end}/${bytes.length}`}).end(bytes.subarray(start, end + 1));
    } else res.writeHead(200, {...headers, 'Content-Length':bytes.length}).end(bytes);
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch(process.platform === 'win32' ? {channel:'chrome'} : {});
  const page = await browser.newPage({viewport:{width:390,height:844}, locale:'it-IT', reducedMotion:'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    window.musicCalls = [];
    HTMLMediaElement.prototype.play = function () {
      window.musicElement = this; window.musicCalls.push(this.src);
      return play.call(this);
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`);
  await expect(page.locator('#experience')).toHaveAttribute('data-loading', 'ready');
  const decoded = await page.evaluate(async tracks => {
    const context = new AudioContext({sampleRate:44100}), results = [];
    try {
      for (const track of tracks) {
        const response = await fetch(track.url);
        if (!response.ok) throw new Error(`${response.status}: ${track.url}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        let peak = 0, sum = 0;
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const data = buffer.getChannelData(channel);
          for (const value of data) {peak = Math.max(peak, Math.abs(value)); sum += value * value;}
        }
        results.push({id:track.id, duration:buffer.duration, channels:buffer.numberOfChannels,
          peak, rms:Math.sqrt(sum / (buffer.length * buffer.numberOfChannels))});
      }
    } finally {await context.close();}
    return results;
  }, bundled);
  for (const [index, track] of decoded.entries()) {
    assert.equal(track.channels, 2);
    assert.ok(Math.abs(track.duration - bundled[index].durationSeconds) < .15);
    assert.ok(track.peak < 1 && track.peak > .2, `Invalid decoded peak: ${track.id}`);
    assert.ok(track.rms > .08 && track.rms < .2, `Invalid decoded RMS: ${track.id}`);
  }
  const control = page.locator('[data-audio]');
  async function playing(id) {
    await expect(control).toHaveAttribute('data-audio-state', 'playing');
    await expect.poll(() => page.evaluate(() => window.musicElement.src)).toContain(`/assets/${id}-`);
    assert.ok(await page.evaluate(() => !window.musicElement.paused && window.musicElement.loop));
  }
  await page.locator('[data-action=begin]').click(); await playing('intro-quiz');
  for (let i = 0; i < 12; i++) {
    await finishDialogue(page);
    if (await page.locator('.hold-button').count()) break;
    await page.locator('.answer').first().click(); await page.locator('[data-action=next]').click();
  }
  await expect(page.locator('.hold-button')).toBeVisible(); await playing('intro-quiz');
  await page.locator('[data-action=reveal]').click();
  await expect(page.locator('[data-kind=revealed]')).toBeVisible(); await playing('divination');
  await finishRevelation(page); await expect(page.locator('.nen-title')).toBeVisible(); await playing('result');
  // Exercise the actual MP3 loop near its end without waiting an entire minute.
  await expect.poll(() => page.evaluate(() => Number.isFinite(window.musicElement.duration))).toBe(true);
  await page.evaluate(() => {window.musicElement.currentTime = window.musicElement.duration - .12;});
  await expect.poll(() => page.evaluate(() => window.musicElement.currentTime)).toBeLessThan(2);
  await control.click(); await expect(control).toHaveAttribute('data-audio-state', 'off');
  await page.locator('[data-action=replay]').click(); await expect(control).toHaveAttribute('data-audio-state', 'off');
  await control.click(); await playing('intro-quiz');
  assert.deepEqual(errors, []);
  const calls = await page.evaluate(() => window.musicCalls);
  await mkdir('.verification/audio', {recursive:true});
  await writeFile('.verification/audio/production-check.json', JSON.stringify({basePath:prefix, decoded, calls, errors}, null, 2));
  console.log('Three production MP3s decoded in Chromium; intro → divination → result → mute/replay verified on mobile, including an actual loop.');
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve));
}
