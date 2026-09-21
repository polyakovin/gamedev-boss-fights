import { test, expect } from '@playwright/test';

test('a reduced-motion blueprint stays still and remains fully seekable', async ({ page }) => {
  await page.goto('en/mechanics/target-lock/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');

  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await expect(widget.locator('[data-blueprint-motion-note]')).toBeVisible();

  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(widget).toHaveAttribute('data-blueprint-committed', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText('Player response');
  await expect(timeline).toHaveAttribute('aria-valuetext', 'Player response');
});

test('blueprints autoplay only when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('en/mechanics/wide-swing/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');

  await expect(widget).toHaveAttribute('data-blueprint-playing', 'true');
  await expect
    .poll(async () => Number(await timeline.inputValue()), { timeout: 3000 })
    .toBeGreaterThan(150);
});

test('catalog and builder reuse the 25 rule-specific previews', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(25);

  await page.goto('en/builder/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(25);
});
