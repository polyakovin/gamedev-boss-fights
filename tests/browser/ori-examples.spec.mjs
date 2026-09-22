import { test, expect } from '@playwright/test';

test('Ori examples remain usable on the published boundary lesson and mobile', async ({ page }) => {
  await page.goto('ru/mechanics/boundary-attack/');

  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(page.locator('.game-example__game')).toHaveText([
    'Ori and the Blind Forest',
    'Ori and the Will of the Wisps',
    'Final Fantasy XIV',
  ]);
  await expect(page.locator('.game-example__link')).toHaveCount(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.game-example')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('the Ginso Tree reference identifies the escape as a boss-like sequence', async ({ page }) => {
  await page.goto('en/mechanics/forced-scrolling/');

  await expect(page.locator('.wip-example-card')).toHaveCount(1);
  await expect(page.locator('.wip-example-card h3')).toHaveText('Ginso Tree escape');
  await expect(page.locator('.wip-example-card .eyebrow')).toHaveText('Boss-like escape sequence');
});
