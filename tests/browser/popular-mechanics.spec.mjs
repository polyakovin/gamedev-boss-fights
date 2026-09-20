import { test, expect } from '@playwright/test';

test('the catalog and builder identify exactly 30 core mechanics', async ({ page }) => {
  await page.goto('ru/');
  await expect(page.locator('.catalog-lesson .core-badge')).toHaveCount(30);

  await page.goto('ru/builder/');
  await expect(page.locator('.boss-builder-mechanic .core-badge')).toHaveCount(30);
});

test('an expanded draft teaches the complete mechanic blueprint', async ({ page }) => {
  await page.goto('en/mechanics/wide-swing/');

  await expect(page.locator('.wip-mechanic-title .core-badge')).toHaveText('Top 30 · 01');
  await expect(page.locator('.wip-badge')).toHaveText('WIP');
  await expect(page.locator('.draft-profile')).toBeVisible();
  await expect(page.locator('.draft-profile__card')).toHaveCount(5);
  await expect(page.locator('.draft-profile__card h3')).toHaveText([
    'Signal',
    'Player response',
    'Tuning',
    'Common failure',
    'Escalation',
  ]);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('expanded drafts can include sourced examples while other WIP pages stay compact', async ({
  page,
}) => {
  await page.goto('en/mechanics/platform-destruction/');
  await expect(page.locator('.draft-profile')).toBeVisible();
  await expect(page.locator('.wip-example-card__game')).toHaveText('Ori and the Will of the Wisps');

  await page.goto('en/mechanics/landing-jump/');
  await expect(page.locator('.draft-profile')).toHaveCount(0);
  await expect(page.locator('.wip-mechanic-panel')).toBeVisible();
});
