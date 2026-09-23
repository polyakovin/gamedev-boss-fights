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

test('threat generator releases independent motes and stops after the last flight', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/threat-generator/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const source = widget.locator('[data-blueprint-primitive="3"] circle');
  const secondMote = widget.locator('[data-blueprint-primitive="10"] circle');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-phase-name]')).toHaveText(
    'Release repeated threats',
  );
  await expect(source).toHaveAttribute('cx', '405');
  await expect(source).toHaveAttribute('cy', '455');
  await expect(secondMote).toHaveAttribute('opacity', '0.96');
  await timeline.evaluate((element) => {
    element.value = '5200';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(secondMote).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('decoy keeps only the real Kern solid and clears its mirror on recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/decoy/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const mirror = widget.locator('[data-blueprint-decoy]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Decoy');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await expect(mirror.locator('[data-character-art="kern-decoy"]')).toHaveCount(1);
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(mirror).toHaveAttribute('transform', 'translate(410 425)');
  await expect(mirror).toHaveAttribute('opacity', '0.65');
  await expect(widget.locator('[data-blueprint-boss]')).toHaveAttribute(
    'transform',
    'translate(190 425) scale(1)',
  );
  await expect(widget.locator('[data-blueprint-primitive="5"] circle')).toHaveAttribute(
    'stroke-dasharray',
    '20 14',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] path')).toHaveAttribute(
    'stroke-dasharray',
    '8 9',
  );
  await timeline.evaluate((element) => {
    element.value = '5900';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(Number(await mirror.getAttribute('opacity'))).toBeLessThan(0.01);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('predictive aiming freezes its forecast while the shot follows a fixed line', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/predictive-aiming/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Predictive aiming');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await timeline.evaluate((element) => {
    element.value = '3000';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="1"] circle')).toHaveAttribute(
    'cx',
    '500',
  );
  await expect(widget.locator('[data-blueprint-player]')).toHaveAttribute(
    'transform',
    'translate(300 620)',
  );
  const shotX = Number(
    await widget.locator('[data-blueprint-primitive="3"] circle').getAttribute('cx'),
  );
  expect(shotX).toBeGreaterThan(300);
  expect(shotX).toBeLessThan(500);
  await timeline.evaluate((element) => {
    element.value = '3800';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(widget.locator('[data-blueprint-primitive="3"] circle')).toHaveAttribute(
    'opacity',
    '0',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('source tracking shows a harmless moving guide and a fixed damaging beam', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/source-tracking/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const guide = widget.locator('[data-blueprint-primitive="2"] line');
  const beam = widget.locator('[data-blueprint-primitive="3"] line');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Source tracking');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await seek(600);
  const movingEnd = await guide.getAttribute('x2');
  await seek(1500);
  expect(await guide.getAttribute('x2')).not.toBe(movingEnd);
  await expect(beam).toHaveAttribute('opacity', '0');
  await seek(2350);
  const lockedEnd = await guide.getAttribute('x2');
  await expect(beam).toHaveAttribute('opacity', '0');
  await seek(3000);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(beam).toHaveAttribute('x2', lockedEnd);
  expect(Number(await beam.getAttribute('opacity'))).toBeGreaterThan(0.9);
  await seek(3900);
  await expect(beam).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('burst fire shows three separate shots from one locked source', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/burst-fire/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const shots = [2, 3, 4].map((index) =>
    widget.locator(`[data-blueprint-primitive="${index}"] circle`),
  );
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Burst fire');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(1850);
  for (const shot of shots) await expect(shot).toHaveAttribute('opacity', '0');
  await seek(2200);
  expect(Number(await shots[0].getAttribute('opacity'))).toBeGreaterThan(0.9);
  await expect(shots[1]).toHaveAttribute('opacity', '0');
  await expect(shots[2]).toHaveAttribute('opacity', '0');
  await seek(3050);
  for (const shot of shots) expect(Number(await shot.getAttribute('opacity'))).toBeGreaterThan(0.9);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await seek(4200);
  await expect(shots[0]).toHaveAttribute('opacity', '0');
  await expect(shots[1]).toHaveAttribute('opacity', '0');
  expect(Number(await shots[2].getAttribute('opacity'))).toBeGreaterThan(0.9);
  await seek(4300);
  for (const shot of shots) await expect(shot).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('volley releases three parallel bolts on one beat and clears its outside route', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/volley/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const shots = [7, 8, 9].map((index) =>
    widget.locator(`[data-blueprint-primitive="${index}"] circle`),
  );
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Volley');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(1950);
  for (const shot of shots) await expect(shot).toHaveAttribute('opacity', '0');
  await seek(2050);
  for (const shot of shots) expect(Number(await shot.getAttribute('opacity'))).toBeGreaterThan(0.9);
  await seek(2800);
  const positions = await Promise.all(
    shots.map(async (shot) => ({
      x: await shot.getAttribute('cx'),
      y: await shot.getAttribute('cy'),
    })),
  );
  expect(positions.map(({ x }) => x)).toEqual(['190', '280', '370']);
  expect(new Set(positions.map(({ y }) => y)).size).toBe(1);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await seek(3510);
  for (const shot of shots) await expect(shot).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('catalog and builder reuse the 71 promoted rule-specific previews', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(71);
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
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(71);
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

test('delayed rune warns harmlessly, ignites on its fixed beat, and extinguishes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/delayed-activation/');
  const widget = page.locator('[data-blueprint-demo]');
  const ring = widget.locator('[data-blueprint-primitive="1"] circle');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Delayed activation');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2800);
  await expect(ring).toHaveAttribute('cx', '350');
  await expect(ring).toHaveAttribute('cy', '630');
  await expect(ring).toHaveAttribute('r', '82');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  const warning = await ring.getAttribute('class');
  await seek(3000);
  await expect(ring).not.toHaveAttribute('class', warning);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await seek(4000);
  await expect(ring).toHaveAttribute('class', warning);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('speed change keeps its lane while the boss accelerates past a visible rune', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/speed-change/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const boss = widget.locator('[data-blueprint-boss]');
  const rune = widget.locator('[data-blueprint-primitive="2"] path');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2300);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  const slowBoss = await boss.getAttribute('transform');
  const quietRune = await rune.getAttribute('class');
  await seek(3100);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(boss).not.toHaveAttribute('transform', slowBoss);
  await expect(rune).not.toHaveAttribute('class', quietRune);
  await seek(3450);
  await expect(widget.locator('[data-blueprint-primitive="3"] line')).toHaveAttribute(
    'opacity',
    '0',
  );
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('limited spread keeps its previewed cone while distinct live shots remain inside it', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/limited-spread/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const cone = widget.locator('[data-blueprint-primitive="0"] path');
  const shots = [3, 4, 5].map((index) =>
    widget.locator(`[data-blueprint-primitive="${index}"] circle`),
  );
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Limited spread');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  const outline = await cone.getAttribute('d');
  await seek(3000);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget).toHaveAttribute('data-blueprint-phase', '1');
  await expect(cone).toHaveAttribute('d', outline);
  await expect(shots[0]).toHaveAttribute('opacity', '0.98');
  await expect(shots[1]).toHaveAttribute('opacity', '0.98');
  await expect(shots[2]).toHaveAttribute('opacity', '0.98');
  const slopes = await Promise.all(
    shots.map((shot) =>
      shot.evaluate(
        (node) => (Number(node.getAttribute('cx')) - 280) / (Number(node.getAttribute('cy')) - 332),
      ),
    ),
  );
  expect(new Set(slopes.map((slope) => slope.toFixed(3))).size).toBe(3);
  expect(slopes.every((slope) => Math.abs(Math.atan(slope)) <= 0.2)).toBe(true);
  await seek(4250);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  for (const shot of shots) await expect(shot).toHaveAttribute('opacity', '0');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('directional shield visibly blocks the front strike and opens a side hit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/directional-shield/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Directional shield');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2050);
  await expect(widget).toHaveAttribute('data-blueprint-guard', 'blocked');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  const frontHit = widget.locator('[data-blueprint-primitive="4"] circle');
  await expect(frontHit).not.toHaveAttribute('opacity', '0');
  await seek(3550);
  await expect(widget).toHaveAttribute('data-blueprint-guard', 'flank-hit');
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(3850);
  await expect(widget).toHaveAttribute('data-blueprint-guard', 'idle');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).toHaveAttribute(
    'opacity',
    '0',
  );
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('damage-type resistance shows two connected hits with unequal damage at one point', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/damage-type-resistance/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Damage-type resistance');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2050);
  await expect(widget).toHaveAttribute('data-blueprint-resistance', 'reduced');
  await expect(widget.locator('[data-blueprint-primitive="2"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] rect')).toHaveAttribute(
    'width',
    '20',
  );
  await expect(widget.locator('[data-blueprint-primitive="8"] rect')).toHaveAttribute('width', '0');
  await seek(3550);
  await expect(widget).toHaveAttribute('data-blueprint-resistance', 'normal');
  await expect(widget.locator('[data-blueprint-primitive="4"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] rect')).toHaveAttribute(
    'width',
    '20',
  );
  await expect(widget.locator('[data-blueprint-primitive="8"] rect')).toHaveAttribute(
    'width',
    '100',
  );
  await seek(4300);
  await expect(widget).toHaveAttribute('data-blueprint-resistance', 'idle');
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('situational immunity links its blocked hit, broken ward, open hit, and return', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/situational-immunity/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Situational immunity');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2050);
  await expect(widget).toHaveAttribute('data-blueprint-immunity', 'blocked');
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2800);
  await expect(widget).toHaveAttribute('data-blueprint-immunity', 'ward-broken');
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(3550);
  await expect(widget).toHaveAttribute('data-blueprint-immunity', 'boss-hit');
  await expect(widget.locator('[data-blueprint-primitive="10"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(4300);
  await expect(widget).toHaveAttribute('data-blueprint-immunity', 'immune');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('situational immunity keeps both actors and labels visible on dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/situational-immunity/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 2050, 2800, 3550, 4300]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(bounds.every(Boolean), `visible actor or label at ${milliseconds}ms`).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('part break removes the actual beam until the visible launcher repair', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/part-break/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Part break');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2000);
  await expect(widget).toHaveAttribute('data-blueprint-part', 'attached');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="5"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2880);
  await expect(widget).toHaveAttribute('data-blueprint-part', 'broken-now');
  await seek(3780);
  await expect(widget).toHaveAttribute('data-blueprint-part', 'attack-disabled');
  await expect(widget.locator('[data-blueprint-primitive="5"] line')).toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(5350);
  await expect(widget).toHaveAttribute('data-blueprint-part', 'attached');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('part break keeps its arm component and both actors visible on dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/part-break/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 2000, 2880, 3780, 5350]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="2"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(bounds.every(Boolean), `visible actor, label, or part at ${milliseconds}ms`).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('attack reflection replaces the sword pulse with one hostile return and opens for melee', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/attack-reflection/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Attack reflection');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(2050);
  await expect(widget).toHaveAttribute('data-blueprint-reflection', 'player-shot');
  await expect(widget.locator('[data-blueprint-primitive="3"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2350);
  await expect(widget).toHaveAttribute('data-blueprint-reflection', 'returning-danger');
  await expect(widget.locator('[data-blueprint-primitive="3"] circle')).toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2900);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await seek(4720);
  await expect(widget).toHaveAttribute('data-blueprint-reflection', 'open-hit');
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(5630);
  await expect(widget).toHaveAttribute('data-blueprint-reflection', 'guarded');
});

test('attack reflection keeps its mirror and actors in frame on dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/attack-reflection/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 2050, 2350, 2900, 4720, 5630]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="1"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(bounds.every(Boolean), `visible actors, labels, and mirror at ${milliseconds}ms`).toBe(
      true,
    );
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('counter stance distinguishes a parried hit, its riposte, withheld guard, and open hit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/counter-stance/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Counter stance');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(1400);
  await expect(widget).toHaveAttribute('data-blueprint-counter', 'guarded');
  await seek(1880);
  await expect(widget).toHaveAttribute('data-blueprint-counter', 'parried-hit');
  await expect(widget.locator('[data-blueprint-primitive="3"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2200);
  await expect(widget.locator('[data-blueprint-primitive="4"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(2620);
  await expect(widget).toHaveAttribute('data-blueprint-counter', 'riposte-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="5"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(4000);
  await expect(widget).toHaveAttribute('data-blueprint-counter', 'guarded-withheld');
  await expect(widget.locator('[data-blueprint-primitive="5"] line')).toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(4960);
  await expect(widget).toHaveAttribute('data-blueprint-counter', 'open-hit');
  await expect(widget.locator('[data-blueprint-primitive="7"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
});

test('counter stance keeps both actors and the guard visible on dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/counter-stance/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 1400, 1880, 2620, 4000, 4960]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(bounds.every(Boolean), `visible actors, labels, and guard at ${milliseconds}ms`).toBe(
      true,
    );
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('absorption visibly counts two sword pulses, announces a wide release, and spends the charge', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/absorption-power-up/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Absorption power-up');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');
  await seek(1400);
  await expect(widget).toHaveAttribute('data-blueprint-charge', '0');
  await expect(widget.locator('[data-blueprint-primitive="4"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(1650);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'first-absorbed');
  await expect(widget).toHaveAttribute('data-blueprint-charge', '1');
  await seek(2450);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'second-absorbed');
  await expect(widget).toHaveAttribute('data-blueprint-charge', '2');
  await seek(3280);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'charged');
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(3650);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'empowered-release');
  await expect(widget).toHaveAttribute('data-blueprint-charge', '0');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="9"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await seek(4500);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'spent-open');
  await seek(4960);
  await expect(widget).toHaveAttribute('data-blueprint-absorption', 'open-hit');
});

test('absorption keeps both actors, the core, and the wide preview inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/absorption-power-up/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 1400, 2450, 3280, 3650, 4960]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, labels, and core remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('interruptible wind-up cancels on one qualified sword hit and releases after a missed deadline', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/interruptible-wind-up/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Interruptible wind-up');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(1200);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'wind-up-open');
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).not.toHaveAttribute(
    'width',
    '0',
  );

  await seek(1580);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'interrupted-now');
  await expect(widget.locator('[data-blueprint-primitive="7"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="1"] circle')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3500);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'wind-up-open');
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4300);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'released-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="1"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4800);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'recovery');
});

test('interruptible wind-up keeps its actors, deadline gauge, and final ring inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/interruptible-wind-up/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 1200, 1580, 3500, 4300, 4800]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="2"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, labels, deadline gauge, and ring remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('loadout adaptation snapshots two equipped runes into two deterministic boss packages', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/loadout-adaptation/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Loadout adaptation');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(850);
  await expect(widget).toHaveAttribute('data-blueprint-loadout', 'reach-rune');
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'reading-reach');
  await expect(widget).toHaveAttribute('data-blueprint-package', 'reach-thrust');
  await expect(widget.locator('[data-blueprint-primitive="0"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1300);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'copied-reach');
  await expect(widget.locator('[data-blueprint-primitive="2"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="3"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1850);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'reach-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="4"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2850);
  await expect(widget).toHaveAttribute('data-blueprint-loadout', 'burst-rune');
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'loadout-swapped');
  await expect(widget).toHaveAttribute('data-blueprint-package', 'burst-ring');

  await seek(3200);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'reading-burst');
  await expect(widget.locator('[data-blueprint-primitive="5"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3600);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'copied-burst');
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="7"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4300);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'burst-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4800);
  await expect(widget).toHaveAttribute('data-blueprint-adaptation', 'burst-recovery');
});

test('loadout adaptation keeps both copied packages and actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/loadout-adaptation/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 850, 1300, 1850, 2850, 3200, 3600, 4300, 4800]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="1"]',
        '[data-blueprint-primitive="7"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, equipped rune, and copied burst remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('wind-up separates readable buildup beats, a held pose, release, and recovery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/wind-up/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Wind-up');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'short-wind-up');
  await expect(widget.locator('[data-blueprint-primitive="0"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="2"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1420);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up-beat', '2');
  await expect(widget.locator('[data-blueprint-primitive="4"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1750);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'released-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="1"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3200);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'held-wind-up');

  await seek(3800);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'held-ready');
  await expect(widget).toHaveAttribute('data-blueprint-wind-up-beat', '3');
  await expect(widget.locator('[data-blueprint-primitive="5"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="1"] line')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4450);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'released-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');

  await seek(4900);
  await expect(widget).toHaveAttribute('data-blueprint-wind-up', 'held-recovery');
});

test('wind-up keeps both release reads and actors inside dark RTL mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/wind-up/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 800, 1420, 1750, 2400, 3200, 3800, 4450, 4900]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="5"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, promised lane, and buildup runes remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('attack lock follows Tavi before capture and preserves two committed rays', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/attack-lock/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Attack lock');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'tracking-first');
  await expect(widget).toHaveAttribute('data-blueprint-aim-locked', 'false');
  await expect(widget.locator('[data-blueprint-primitive="0"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1300);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'locked-first');
  await expect(widget).toHaveAttribute('data-blueprint-aim-locked', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-aim-x', '390.0');
  await expect(widget).toHaveAttribute('data-blueprint-aim-y', '560.0');
  await expect(widget.locator('[data-blueprint-primitive="1"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1900);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'released-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="2"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3150);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'tracking-second');
  await expect(widget).toHaveAttribute('data-blueprint-aim-locked', 'false');

  await seek(3800);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'locked-second');
  await expect(widget).toHaveAttribute('data-blueprint-aim-x', '180.0');
  await expect(widget).toHaveAttribute('data-blueprint-aim-y', '560.0');

  await seek(4350);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'released-danger');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');

  await seek(4900);
  await expect(widget).toHaveAttribute('data-blueprint-attack-lock', 'recovery-second');
});

test('attack lock keeps tracking, captured rays, and actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/attack-lock/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 800, 1300, 1900, 2450, 3150, 3800, 4350, 4900]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="3"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, aim marker, and committed ray remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('active phase separates startup, live collision, harmless follow-through, and recovery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/active-phase/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Active phase');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-active-phase', 'startup');
  await expect(widget).toHaveAttribute('data-blueprint-hitbox-active', 'false');
  await expect(widget.locator('[data-blueprint-primitive="0"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1900);
  await expect(widget).toHaveAttribute('data-blueprint-active-phase', 'active');
  await expect(widget).toHaveAttribute('data-blueprint-hitbox-active', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="1"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2500);
  await expect(widget).toHaveAttribute('data-blueprint-active-phase', 'follow-through');
  await expect(widget).toHaveAttribute('data-blueprint-hitbox-active', 'false');
  await expect(widget).toHaveAttribute('data-blueprint-follow-through', 'true');
  await expect(widget.locator('[data-blueprint-primitive="2"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3280);
  await expect(widget).toHaveAttribute('data-blueprint-active-phase', 'recovery');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');

  await seek(5100);
  await expect(widget).toHaveAttribute('data-blueprint-active-phase', 'reset');
});

test('active phase keeps lane boundaries and both actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/active-phase/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 900, 1600, 1900, 2180, 2500, 3280, 4500, 5100]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="4"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors and active lane boundaries remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('recovery separates the last active instant, approach budget, punish, and ready event', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/recovery/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Recovery');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-recovery', 'startup');
  await expect(widget.locator('[data-blueprint-primitive="0"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1400);
  await expect(widget).toHaveAttribute('data-blueprint-recovery', 'active');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="1"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1800);
  await expect(widget).toHaveAttribute('data-blueprint-recovery', 'approach-window');
  await expect(widget).toHaveAttribute('data-blueprint-recovery-locked', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-boss-ready', 'false');
  await expect(widget.locator('[data-blueprint-primitive="2"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3480);
  await expect(widget).toHaveAttribute('data-blueprint-recovery', 'punish-window');
  await expect(widget).toHaveAttribute('data-blueprint-within-punish-reach', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="6"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4600);
  await expect(widget).toHaveAttribute('data-blueprint-recovery', 'boss-ready');
  await expect(widget).toHaveAttribute('data-blueprint-recovery-locked', 'false');
  await expect(widget).toHaveAttribute('data-blueprint-boss-ready', 'true');
  await expect(widget.locator('[data-blueprint-primitive="5"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
});

test('recovery keeps the attack lane, countdown, and actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/recovery/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 900, 1280, 1400, 1740, 2400, 3480, 4580, 5200]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="3"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, lane, and recovery countdown remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('survival phase keeps damage irrelevant until all four timed pulses are cleared', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/survival-phase/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Survival phase');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-survival-phase', 'read-next');
  await expect(widget).toHaveAttribute('data-blueprint-survival-shielded', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-survival-complete', 'false');
  await expect(widget.locator('[data-blueprint-primitive="0"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="2"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  for (const [milliseconds, state, hazard] of [
    [1200, 'survive-1', '0'],
    [2200, 'survive-2', '1'],
    [3150, 'survive-3', '2'],
    [4100, 'survive-4', '3'],
  ]) {
    await seek(milliseconds);
    await expect(widget).toHaveAttribute('data-blueprint-survival-phase', state);
    await expect(widget).toHaveAttribute('data-blueprint-survival-hazard', hazard);
    await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
    await expect(
      widget.locator(`[data-blueprint-primitive="${2 + Number(hazard)}"] circle`),
    ).not.toHaveAttribute('opacity', '0');
  }

  await seek(4350);
  await expect(widget).toHaveAttribute('data-blueprint-survival-phase', 'survived');
  await expect(widget).toHaveAttribute('data-blueprint-survival-shielded', 'false');
  await expect(widget).toHaveAttribute('data-blueprint-survival-complete', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-survival-remaining', '0.000');
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(5080);
  await expect(widget).toHaveAttribute('data-blueprint-survival-phase', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="7"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
});

test('survival phase keeps its timer, pulses, and actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/survival-phase/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 800, 1200, 2200, 3150, 4100, 4350, 5080, 5700]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="0"]',
        '[data-blueprint-primitive="1"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(
      bounds.every(Boolean),
      `actors, shield, and survival timer remain in frame at ${milliseconds}ms`,
    ).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('teleport exposes its destination before absence and activates only the fixed follow-up lane', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/teleport/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Teleport');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-teleport', 'departing');
  await expect(widget).toHaveAttribute('data-blueprint-teleport-destination', 'true');
  await expect(widget.locator('[data-blueprint-primitive="1"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1200);
  await expect(widget).toHaveAttribute('data-blueprint-teleport', 'absent');
  await expect(widget).toHaveAttribute('data-blueprint-teleport-absent', 'true');
  await expect(widget.locator('[data-blueprint-boss]')).toHaveAttribute('opacity', '0');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');

  await seek(1900);
  await expect(widget).toHaveAttribute('data-blueprint-teleport', 'follow-up-tell');
  await expect(widget.locator('[data-blueprint-primitive="4"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="5"] rect')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2500);
  await expect(widget).toHaveAttribute('data-blueprint-teleport', 'follow-up-danger');
  await expect(widget).toHaveAttribute('data-blueprint-teleport-follow-up', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="5"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3550);
  await expect(widget).toHaveAttribute('data-blueprint-teleport', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="7"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );
});

test('teleport keeps both endpoints, the fixed lane, and actors inside dark RTL mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('ar/mechanics/teleport/');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const timeline = widget.locator('[data-blueprint-timeline]');
  for (const milliseconds of [0, 900, 1200, 1600, 1900, 2500, 3550, 5000, 5750]) {
    await timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);
    const bounds = await widget.evaluate((element) => {
      const svg = element.querySelector('svg').getBoundingClientRect();
      return [
        '[data-blueprint-boss]',
        '[data-blueprint-player]',
        '[data-blueprint-boss-label]',
        '[data-blueprint-player-label]',
        '[data-blueprint-primitive="1"]',
        '[data-blueprint-primitive="4"]',
      ].map((selector) => {
        const rect = element.querySelector(selector).getBoundingClientRect();
        return (
          rect.left >= svg.left - 2 &&
          rect.right <= svg.right + 2 &&
          rect.top >= svg.top - 2 &&
          rect.bottom <= svg.bottom + 2
        );
      });
    });
    expect(bounds.every(Boolean), `teleport geometry remains in frame at ${milliseconds}ms`).toBe(
      true,
    );
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('boundary attack signals one edge before its fixed crossing and visible outer reset', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/boundary-attack/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Boundary attack');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-boundary-attack', 'edge-signal');
  await expect(widget).toHaveAttribute('data-blueprint-boundary-signal', 'true');
  await expect(widget.locator('[data-blueprint-primitive="2"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1950);
  await expect(widget).toHaveAttribute('data-blueprint-boundary-attack', 'boundary-crossing');
  await expect(widget).toHaveAttribute('data-blueprint-boundary-crossing', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3150);
  await expect(widget).toHaveAttribute('data-blueprint-boundary-attack', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="7"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4800);
  await expect(widget).toHaveAttribute('data-blueprint-boundary-attack', 'outer-reset');
  await expect(widget).toHaveAttribute('data-blueprint-boundary-source-outside', 'true');
  await expect(widget.locator('[data-blueprint-primitive="6"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('forced scrolling exposes its fixed pace, lower failure edge, and route-complete opening', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/forced-scrolling/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Forced scrolling');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling', 'scroll-signal');
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling-active', 'false');
  await expect(widget.locator('[data-blueprint-primitive="2"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2750);
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling', 'forced-scroll');
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling-active', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  expect(
    Number(await widget.getAttribute('data-blueprint-forced-scrolling-offset')),
  ).toBeGreaterThan(100);
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4400);
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling', 'route-cleared');
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling-cleared', 'true');
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(5050);
  await expect(widget).toHaveAttribute('data-blueprint-forced-scrolling', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="11"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('chase herding exposes the pressure band, authored intercept, capture, and delayed opening', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/chase-herding/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Chase herding');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(900);
  await expect(widget).toHaveAttribute('data-blueprint-chase-herding', 'route-signal');
  await expect(widget).toHaveAttribute('data-blueprint-chase-captured', 'false');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="4"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2100);
  await expect(widget).toHaveAttribute('data-blueprint-chase-herding', 'maintain-distance');
  await expect(widget).toHaveAttribute('data-blueprint-chase-in-band', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="5"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="6"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3100);
  await expect(widget).toHaveAttribute('data-blueprint-chase-herding', 'intercept');
  await expect(widget).toHaveAttribute('data-blueprint-chase-intercepted', 'true');
  await expect(widget.locator('[data-blueprint-primitive="11"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3900);
  await expect(widget).toHaveAttribute('data-blueprint-chase-herding', 'captured');
  await expect(widget).toHaveAttribute('data-blueprint-chase-captured', 'true');

  await seek(4720);
  await expect(widget).toHaveAttribute('data-blueprint-chase-herding', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="12"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('escape phase exposes its exit tell, progress limit, interruption, and punish opening', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/escape-phase/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Escape phase');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-escape-phase', 'exit-signal');
  await expect(widget).toHaveAttribute('data-blueprint-escape-active', 'false');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="3"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2100);
  await expect(widget).toHaveAttribute('data-blueprint-escape-phase', 'escape-run');
  await expect(widget).toHaveAttribute('data-blueprint-escape-active', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-escape-succeeded', 'false');
  expect(Number(await widget.getAttribute('data-blueprint-escape-progress'))).toBeGreaterThan(0);

  await seek(2850);
  await expect(widget).toHaveAttribute('data-blueprint-escape-phase', 'interrupted');
  await expect(widget).toHaveAttribute('data-blueprint-escape-interrupted', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-escape-interrupt-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="9"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3720);
  await expect(widget).toHaveAttribute('data-blueprint-escape-phase', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="10"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('relocated arena previews its destination and preserves encounter state across geometry', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/relocated-arena/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Nested / relocated arena');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-relocated-arena', 'destination-preview');
  await expect(widget).toHaveAttribute('data-blueprint-relocation-destination', 'true');
  await expect(widget.locator('[data-blueprint-primitive="2"] rect')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1700);
  await expect(widget).toHaveAttribute('data-blueprint-relocated-arena', 'transfer');
  await expect(widget).toHaveAttribute('data-blueprint-relocation-active', 'true');

  await seek(2800);
  await expect(widget).toHaveAttribute('data-blueprint-relocated-arena', 'lower-entry');
  await expect(widget).toHaveAttribute('data-blueprint-relocation-lower-active', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-relocation-state-retained', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-relocation-progress', '0.62');

  await seek(3850);
  await expect(widget).toHaveAttribute('data-blueprint-relocated-arena', 'lower-combat');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="15"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(5250);
  await expect(widget).toHaveAttribute('data-blueprint-relocated-arena', 'return-lift');
  await expect(widget.locator('[data-blueprint-primitive="13"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('control mode shift visibly hands free movement to a taught jump contract', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/control-mode-shift/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Control mode shift');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-shift', 'mode-preview');
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-previewed', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-active', 'false');

  await seek(1350);
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-shift', 'control-handoff');
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-mapping', 'free-movement');

  await seek(2600);
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-shift', 'jump-mode');
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-active', 'true');
  await expect(widget).toHaveAttribute(
    'data-blueprint-control-mode-mapping',
    'horizontal-and-jump',
  );
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-wave', 'true');
  await expect(widget.locator('[data-blueprint-primitive="13"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3850);
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-shift', 'opening');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');

  await seek(5200);
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-shift', 'free-mode-return');
  await expect(widget).toHaveAttribute('data-blueprint-control-mode-return', 'true');

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('boss as terrain keeps the climb, hold, weak point, and dismount explicit', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/boss-as-terrain/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Boss as terrain');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(800);
  await expect(widget).toHaveAttribute('data-blueprint-boss-as-terrain', 'route-revealed');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-route', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-mounted', 'false');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1500);
  await expect(widget).toHaveAttribute('data-blueprint-boss-as-terrain', 'climbing');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-mounted', 'true');

  await seek(2300);
  await expect(widget).toHaveAttribute('data-blueprint-boss-as-terrain', 'hold-through-shake');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-holding', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  expect(Number(await widget.getAttribute('data-blueprint-terrain-grip'))).toBeLessThan(0.9);
  await expect(widget.locator('[data-blueprint-primitive="7"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3720);
  await expect(widget).toHaveAttribute('data-blueprint-boss-as-terrain', 'weak-point-opening');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-weak-point', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="12"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(4600);
  await expect(widget).toHaveAttribute('data-blueprint-boss-as-terrain', 'safe-drop');
  await expect(widget).toHaveAttribute('data-blueprint-terrain-safe-drop', 'true');
  await expect(widget.locator('[data-blueprint-primitive="10"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="11"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('cover and line of sight visibly stops the beam on the pillar before the counter', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/cover-line-of-sight/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Cover and line of sight');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(1100);
  await expect(widget).toHaveAttribute('data-blueprint-cover-line-of-sight', 'moving-to-cover');
  await expect(widget).toHaveAttribute('data-blueprint-cover-source-locked', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-cover-shadow', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-cover-occupied', 'false');
  await expect(widget.locator('[data-blueprint-primitive="1"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1800);
  await expect(widget).toHaveAttribute('data-blueprint-cover-line-of-sight', 'fully-covered');
  await expect(widget).toHaveAttribute('data-blueprint-cover-occupied', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-cover-beam', 'false');

  await seek(2600);
  await expect(widget).toHaveAttribute('data-blueprint-cover-line-of-sight', 'beam-blocked');
  await expect(widget).toHaveAttribute('data-blueprint-cover-beam', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-cover-blocked', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="8"] line')).toHaveAttribute('x2', '285');
  await expect(widget.locator('[data-blueprint-primitive="10"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3500);
  await expect(widget).toHaveAttribute('data-blueprint-cover-line-of-sight', 'safe-exit');
  await expect(widget).toHaveAttribute('data-blueprint-cover-beam', 'false');
  await expect(widget).toHaveAttribute('data-blueprint-cover-exit', 'true');
  await expect(widget.locator('[data-blueprint-primitive="14"] path')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3920);
  await expect(widget).toHaveAttribute('data-blueprint-cover-line-of-sight', 'counter-window');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="12"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('forced inertia previews one endpoint, preserves the slide, and restores control before the counter', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/forced-inertia/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Forced inertia');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(1100);
  await expect(widget).toHaveAttribute('data-blueprint-forced-inertia', 'endpoint-preview');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-frozen', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-vector', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-committed', 'false');
  await expect(widget.locator('[data-blueprint-primitive="3"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2200);
  await expect(widget).toHaveAttribute('data-blueprint-forced-inertia', 'unsteerable-slide');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-committed', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-sliding', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-speed', '1.000');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="7"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3000);
  await expect(widget).toHaveAttribute('data-blueprint-forced-inertia', 'braking-zone');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-braking', 'true');
  expect(Number(await widget.getAttribute('data-blueprint-inertia-speed'))).toBeGreaterThan(0);
  expect(Number(await widget.getAttribute('data-blueprint-inertia-speed'))).toBeLessThan(1);

  await seek(3500);
  await expect(widget).toHaveAttribute('data-blueprint-forced-inertia', 'control-restored');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-control', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-inertia-speed', '0.000');
  await expect(widget.locator('[data-blueprint-primitive="16"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(3720);
  await expect(widget).toHaveAttribute('data-blueprint-forced-inertia', 'counter-window');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="12"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('wraparound projectile signals its linked seams, preserves one shot, and clears before the counter', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/mechanics/wraparound-projectile/');
  const widget = page.locator('[data-blueprint-demo]');
  const timeline = widget.locator('[data-blueprint-timeline]');
  const seek = (milliseconds) =>
    timeline.evaluate((element, value) => {
      element.value = String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, milliseconds);

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Wraparound projectile');
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(widget).toHaveAttribute('data-blueprint-playing', 'false');

  await seek(1000);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'route-preview');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-boundary', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-route', 'true');
  await expect(widget.locator('[data-blueprint-primitive="4"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(1700);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'first-pass');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-first-pass', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-lap', '1');
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  await expect(widget.locator('[data-blueprint-primitive="7"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2300);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'boundary-crossing');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-crossing', 'true');
  await expect(widget.locator('[data-blueprint-primitive="8"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );
  await expect(widget.locator('[data-blueprint-primitive="9"] circle')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await seek(2800);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'repeat-pass');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-second-pass', 'true');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-lap', '2');

  await seek(3800);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'corridor-clear');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-first-pass', 'false');
  await expect(widget).toHaveAttribute('data-blueprint-wrap-second-pass', 'false');

  await seek(4220);
  await expect(widget).toHaveAttribute('data-blueprint-wraparound-projectile', 'counter-window');
  await expect(widget).toHaveAttribute('data-blueprint-punish-strike', 'true');
  await expect(widget.locator('[data-blueprint-primitive="12"] line')).not.toHaveAttribute(
    'opacity',
    '0',
  );

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
