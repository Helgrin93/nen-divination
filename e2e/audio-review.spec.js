import {test, expect} from '@playwright/test';

test('audio studio previews the real tracks separately without autoplay or overlap', async ({page, browserName}, testInfo) => {
  test.skip(browserName === 'webkit' && process.platform === 'win32', 'Windows WebKit has no working media decoder; real MP3 playback is covered by Chromium.');
  const media = [];
  page.on('request', request => {if(request.resourceType() === 'media') media.push(request.url());});
  await page.goto('/review/audio.html');
  const players = page.locator('audio');
  await expect(players).toHaveCount(3);
  expect(media).toEqual([]);
  expect(await players.evaluateAll(all => all.every(player => player.paused && player.loop && player.preload === 'none' && player.volume === .22))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (let index = 0; index < 3; index++) {
    // A real gesture on the media control enables actual browser playback.
    await players.nth(index).click({position:{x:20,y:22}});
    await expect(page.locator(`article[data-track]`).nth(index)).toHaveAttribute('data-playing', 'true');
    await expect.poll(() => players.evaluateAll(all => all.filter(player => !player.paused).length)).toBe(1);
    await expect.poll(() => players.nth(index).evaluate(player => player.currentTime)).toBeGreaterThan(0);
  }
  await expect(page.getByRole('link', {name:'Scarica il brano'})).toHaveCount(3);
  await page.screenshot({path:`.verification/audio/${testInfo.project.name}-studio.png`,fullPage:true});
});
