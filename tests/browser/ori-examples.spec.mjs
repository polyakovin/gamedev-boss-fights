import { test, expect } from '@playwright/test';

test('Ori examples appear on WIP mechanics and remain usable on mobile', async ({ page }) => {
  await page.goto('ru/mechanics/boundary-attack/');

  await expect(page.locator('.wip-badge')).toHaveText('WIP');
  await expect(page.locator('.wip-examples')).toBeVisible();
  await expect(page.locator('.wip-example-card')).toHaveCount(2);
  await expect(page.locator('.wip-example-card__game')).toHaveText([
    'Ori and the Blind Forest',
    'Ori and the Will of the Wisps',
  ]);
  await expect(page.locator('.wip-example-card footer a')).toHaveCount(4);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator('.wip-example-grid')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
  ).toBe(1);
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
