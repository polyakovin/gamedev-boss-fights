import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const registry = JSON.parse(
  await fs.readFile(new URL('../../locales/registry.json', import.meta.url)),
);
for (const locale of registry) {
  test(`${locale.code}: page, language links and mobile layout`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${locale.code}/mechanics/charge/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute('data-charge-ready', 'true');
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute(
      'data-charge-playing',
      'false',
    );
    await expect(page.locator('[data-charge-motion-note]')).toBeVisible();
    await expect(page.locator('.concept-card')).toHaveCount(6);
    await expect(page.locator('.game-example')).toHaveCount(6);
    await expect(page.locator('.sources li a')).toHaveCount(7);
    await expect(page.locator('.review-note')).toBeVisible();
    await expect(page.locator('#quiz, .quiz, [data-quiz]')).toHaveCount(0);
    await expect(page.locator('.game-example a[href*="youtube.com/watch"]')).toHaveCount(6);
    const videos = await page
      .locator('.game-example a')
      .evaluateAll((links) => links.map((link) => link.href));
    expect(videos[1]).toBe('https://www.youtube.com/watch?v=VaYY2fauQNo');
    expect(videos[4]).toBe('https://www.youtube.com/watch?v=NwFX9I69uss&t=265s');
    expect(videos[5]).toBe('https://www.youtube.com/watch?v=gzwO84ERsb8');
    await expect(page.locator('.game-example a').first()).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    await page.locator('.language-menu summary').click();
    await expect(page.locator('.language-menu nav a')).toHaveCount(8);
    const links = await page
      .locator('.language-menu nav a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(links.every((l) => l.endsWith('/mechanics/charge/'))).toBe(true);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 375, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator('[data-charge-phase="3"]').click();
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute('data-charge-outcome', 'safe');
    await page.locator('[data-charge-scenario][value="retreat"]').check();
    await page.locator('[data-charge-phase="3"]').click();
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute('data-charge-outcome', 'hit');
    expect(errors).toEqual([]);
  });
}
test('controls work by keyboard; play advances; seeking pauses', async ({ page }) => {
  await page.goto('ru/mechanics/charge/');
  await expect(page.locator('.lesson-sidebar')).toHaveCount(0);
  await expect(
    page.locator(
      '.charge-demo__heading, .charge-demo__legend, .charge-demo__note, [data-charge-speed]',
    ),
  ).toHaveCount(0);
  const heroBox = await page.locator('.lesson-hero').boundingBox();
  const simulationBox = await page.locator('.simulation-section').boundingBox();
  expect(simulationBox.x).toBeGreaterThan(heroBox.x + heroBox.width);
  expect(Math.abs(simulationBox.y - heroBox.y)).toBeLessThan(2);
  expect(Math.max(heroBox.y + heroBox.height, simulationBox.y + simulationBox.height)).toBeLessThan(
    900,
  );
  const demo = page.locator('[data-charge-demo]');
  await page.locator('[data-charge-play]').click();
  await expect
    .poll(async () => Number(await page.locator('[data-charge-timeline]').inputValue()))
    .toBeLessThan(1500);
  await page.locator('[data-charge-restart]').click();
  await page.locator('[data-charge-play]').focus();
  await page.keyboard.press('Space');
  await expect(demo).toHaveAttribute('data-charge-playing', 'true');
  await expect
    .poll(async () => Number(await page.locator('[data-charge-timeline]').inputValue()))
    .toBeGreaterThan(150);
  await page.locator('[data-charge-timeline]').focus();
  await page.keyboard.press('End');
  await expect(demo).toHaveAttribute('data-charge-playing', 'false');
  await expect(demo).toHaveAttribute('data-charge-phase', '3');
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileHeroBox = await page.locator('.lesson-hero').boundingBox();
  const mobileSimulationBox = await page.locator('.simulation-section').boundingBox();
  expect(mobileSimulationBox.y).toBeGreaterThan(mobileHeroBox.y + mobileHeroBox.height);
});
test('the lesson and language navigation work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/gamedev-boss-fights/ar/mechanics/charge/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-charge-svg]')).toBeVisible();
  await expect(page.locator('#quiz, .quiz, [data-quiz]')).toHaveCount(0);
  await page.locator('.language-menu summary').click();
  await page.locator('.language-menu a[lang="ja"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await context.close();
});
test('catalog and language gateway point to real pages', async ({ page, request }) => {
  await page.goto('./');
  await expect(page.locator('.language-choices a')).toHaveCount(8);
  for (const locale of registry) {
    const response = await request.get(`${locale.code}/`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(`${locale.code}/mechanics/charge/`);
  }
  await page.goto('ru/');
  await expect(page.locator('.catalog-hero h1')).toHaveText('Как устроены бои с боссами');
  await expect(page.locator('.atlas-map__link')).toHaveCount(6);
  expect(
    await page.locator('.atlas-map__link').evaluateAll((links) => links.map((a) => a.href)),
  ).toEqual([
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/#mechanics',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#simulation',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#concepts',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#examples',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#sources',
    'https://github.com/polyakovin/gamedev-boss-fights/blob/main/CONTRIBUTING.md',
  ]);
  await expect(page.locator('.card-diagram [data-charge-art="tank"]')).toHaveCount(1);
  await expect(page.locator('.card-diagram [data-charge-art="monster"]')).toHaveCount(1);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('homepages fit their core content on a laptop and reflow on mobile', async ({ page }) => {
  for (const locale of registry) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${locale.code}/`);
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    for (const selector of ['.catalog-hero', '.mechanic-card', '.atlas-map']) {
      const box = await page.locator(selector).boundingBox();
      expect(box.y, `${locale.code}: ${selector} starts on screen`).toBeGreaterThanOrEqual(0);
      expect(
        box.y + box.height,
        `${locale.code}: ${selector} fits the first screen`,
      ).toBeLessThanOrEqual(720);
    }
    expect(await page.locator('.atlas-map__count').allTextContents()).toEqual([
      '1',
      '1',
      '6',
      '6',
      '7',
      '+',
    ]);
    await page.setViewportSize({ width: 375, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const card = await page.locator('.mechanic-card').boundingBox();
    const navigation = await page.locator('.atlas-map').boundingBox();
    expect(navigation.y).toBeGreaterThan(card.y + card.height);
    await expect(page.locator('.card-learning')).toBeVisible();
    await expect(page.locator('.atlas-map__link')).toHaveCount(6);
  }
});
