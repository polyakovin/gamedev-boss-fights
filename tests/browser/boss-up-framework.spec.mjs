import { test, expect } from '@playwright/test';

test('lens catalog presents the attributed Boss Up framework and all lenses', async ({ page }) => {
  await page.goto('en/lenses/');
  const framework = page.locator('.source-framework');
  await expect(
    framework.getByRole('heading', { name: 'Boss Up: 10 checks for an encounter' }),
  ).toBeVisible();
  await expect(framework.locator('.source-framework__rules > li')).toHaveCount(10);
  await expect(framework.getByRole('link', { name: /Watch the talk/ })).toHaveAttribute(
    'href',
    'https://www.gdcvault.com/play/1024921/Boss-Up-Boss-Battle-Design',
  );
  await expect(page.locator('.lens-card')).toHaveCount(15);
  await expect(page.locator('[data-lens-visual="difficulty-rhythm"]')).toHaveCount(1);
});

test('a new source-backed lens has a visual, practical check, and references', async ({ page }) => {
  await page.goto('en/lenses/phase-structure/');
  await expect(page.locator('.lens-page__hero h1')).toHaveText('Phase structure');
  await expect(page.locator('[data-lens-visual="phase-structure"]')).toBeVisible();
  await expect(page.locator('.lens-page__framework h3')).toHaveText('Change phase with purpose');
  await expect(page.locator('.lens-page__sources a')).toHaveCount(2);
});
