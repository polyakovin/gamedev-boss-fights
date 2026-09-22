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

test('catalog and builder reuse the 46 promoted rule-specific previews', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(46);
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
  await expect(page.locator('[data-blueprint-preview]')).toHaveCount(46);
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
