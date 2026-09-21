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

test('mine arms its visible circle, keeps the player safe, and fits on mobile', async ({
  page,
}) => {
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

test('moving hazard travels with its visible footprint and leaves a clear wake', async ({
  page,
}) => {
  await page.goto('en/mechanics/moving-hazard/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Moving hazard');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(page.locator('.game-example')).toHaveCount(3);

  const circle = widget.locator('[data-blueprint-primitive="1"] circle');
  const initialX = Number(await circle.getAttribute('cx'));
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText(
    'Track the live footprint',
  );
  expect(Number(await circle.getAttribute('cx'))).toBeGreaterThan(initialX + 100);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('converging fronts visibly close both sides while the player exits above', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/converging-threats/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Converging threats');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(page.locator('.game-example')).toHaveCount(3);
  const left = widget.locator('[data-blueprint-primitive="0"] rect');
  const right = widget.locator('[data-blueprint-primitive="1"] rect');
  const initialWidth = Number(await left.getAttribute('width'));
  const initialRight = Number(await right.getAttribute('x'));

  await timeline.evaluate((element) => {
    element.value = '3850';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText(
    'Leave before the corridor closes',
  );
  expect(Number(await left.getAttribute('width'))).toBeGreaterThan(initialWidth + 120);
  expect(Number(await right.getAttribute('x'))).toBeLessThan(initialRight - 120);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('pull separates a wide force cue from its dangerous core and keeps lateral control', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/pull/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Pull');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).toHaveAttribute('r', '445');
  await expect(widget.locator('[data-blueprint-primitive="1"] circle')).toHaveAttribute('r', '82');
  const player = widget.locator('[data-blueprint-player]');
  const start = await player.getAttribute('transform');
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText(
    'Steer across the current',
  );
  expect(await player.getAttribute('transform')).not.toBe(start);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('turret deployment is seekable, shows its fixed beam, and clears after firing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/turret-deployment/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const beam = widget.locator('[data-blueprint-primitive="7"] line');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText('Clear its firing lane');
  await expect(beam).toHaveAttribute('x1', '430');
  await expect(beam).toHaveAttribute('x2', '430');
  await expect(beam).toHaveAttribute('opacity', '0.94');
  await timeline.evaluate((element) => {
    element.value = '5200';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(beam).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('catalog and builder reuse the 37 promoted rule-specific previews', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(37);
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
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(37);
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
