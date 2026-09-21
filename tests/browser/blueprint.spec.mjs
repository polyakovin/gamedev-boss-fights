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
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText('Response');
  await expect(timeline).toHaveAttribute('aria-valuetext', 'Response');
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

test('mine arms its visible circle, keeps the player safe, and fits on mobile', async ({ page }) => {
  await page.goto('en/mechanics/mine/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Mine');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(page.locator('.game-example')).toHaveCount(3);

  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText(
    'Respect the armed radius',
  );
  await expect(widget.locator('[data-blueprint-primitive="2"] circle')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('catalog and builder reuse the 33 promoted rule-specific previews', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(33);
  const catalogLayouts = await page.locator('[data-blueprint-preview]').evaluateAll((previews) =>
    previews.map((preview) => {
      const boss = preview.querySelector('[data-character-art-preview="kern"]');
      const player = preview.querySelector('[data-character-art-preview="tavi"]');
      const primitiveShapes = [...preview.querySelectorAll('g[clip-path] > g > g > *')];
      return {
        layout: `${preview.dataset.blueprintPreviewTime}|${boss?.getAttribute('transform')}|${player?.getAttribute('transform')}`,
        visibleGeometry: primitiveShapes.some((shape) => {
          const bounds = shape.getBoundingClientRect();
          const stroke = getComputedStyle(shape).stroke;
          return (
            Number(shape.getAttribute('opacity')) > 0.05 &&
            Math.max(bounds.width, bounds.height) > 5 &&
            stroke !== 'none'
          );
        }),
      };
    }),
  );
  expect(catalogLayouts.every(({ visibleGeometry }) => visibleGeometry)).toBe(true);
  expect(new Set(catalogLayouts.map(({ layout }) => layout)).size).toBeGreaterThanOrEqual(18);

  await page.goto('en/builder/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(33);
  const builderLayouts = await page.locator('[data-blueprint-preview]').evaluateAll((previews) =>
    previews.map((preview) => {
      const boss = preview.querySelector('[data-character-art-preview="kern"]');
      const player = preview.querySelector('[data-character-art-preview="tavi"]');
      const primitiveShapes = [...preview.querySelectorAll('g[clip-path] > g > g > *')];
      return {
        layout: `${preview.dataset.blueprintPreviewTime}|${boss?.getAttribute('transform')}|${player?.getAttribute('transform')}`,
        visibleGeometry: primitiveShapes.some((shape) => {
          const bounds = shape.getBoundingClientRect();
          const stroke = getComputedStyle(shape).stroke;
          return (
            Number(shape.getAttribute('opacity')) > 0.05 &&
            Math.max(bounds.width, bounds.height) > 5 &&
            stroke !== 'none'
          );
        }),
      };
    }),
  );
  expect(builderLayouts).toEqual(catalogLayouts);
});
