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
    await expect(page.locator('.game-example')).toHaveCount(6);
    await expect(page.locator('.game-example a[href*="youtube.com/watch"]')).toHaveCount(6);
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
test('controls work by keyboard; play advances; seeking pauses; quiz explains feedback', async ({
  page,
}) => {
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
  await page.locator('.quiz button').click();
  await expect(page.locator('.quiz-feedback')).not.toBeEmpty();
  await page.locator('.quiz input[value="0"]').check();
  await page.locator('.quiz button').click();
  await expect(page.locator('.quiz-feedback')).toHaveAttribute('data-correct', 'false');
  await page.locator('.quiz input[value="1"]').check();
  await page.locator('.quiz button').click();
  await expect(page.locator('.quiz-feedback')).toHaveAttribute('data-correct', 'true');
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
  await page.locator('.quiz noscript details summary').click();
  await expect(page.locator('.quiz noscript details p')).toBeVisible();
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
});
