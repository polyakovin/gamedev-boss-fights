import { test, expect } from '@playwright/test';

test('lens catalog presents all lenses without the Boss Up framework panel', async ({ page }) => {
  await page.goto('en/lenses/');
  await expect(page.locator('.source-framework')).toHaveCount(0);
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
