import { test, expect } from '@playwright/test';

const gapCenters = [280, 150, 410];

async function openVolley(page, locale = 'en') {
  await page.goto(`${locale}/mechanics/gap-volley/`);
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute('data-pattern-ready', 'true');
}

async function seek(page, milliseconds) {
  await page.locator('[data-pattern-timeline]').evaluate((timeline, value) => {
    timeline.value = String(value);
    timeline.dispatchEvent(new Event('input', { bubbles: true }));
  }, milliseconds);
}

test('gap volley: three announced gaps share stable projectile nodes and an eighteen-second timeline', async ({
  page,
}) => {
  await openVolley(page);
  await expect(page.locator('[data-pattern-timeline]')).toHaveAttribute('max', '18000');
  const states = await page.locator('[data-pattern-svg]').evaluate((svg) => {
    const timeline = document.querySelector('[data-pattern-timeline]');
    const volley = svg.querySelector('[data-pattern-volley]');
    const projectiles = [...svg.querySelectorAll('[data-volley-projectile]')];
    return [0, 1, 2].map((index) => {
      timeline.value = String(index * 6000 + 1200);
      timeline.dispatchEvent(new Event('input', { bubbles: true }));
      const gap = svg.querySelector('[data-volley-gap]');
      const left = Number(gap.getAttribute('x'));
      const width = Number(gap.getAttribute('width'));
      const lanes = [...svg.querySelectorAll('[data-volley-lane]')].map((lane) => ({
        x: lane.querySelector('path').getPointAtLength(0).x,
        occupied: Number(lane.getAttribute('opacity')) > 0,
      }));
      const warningOpacity = Number(
        svg.querySelector('[data-volley-warning]').getAttribute('opacity'),
      );
      timeline.value = String(index * 6000 + 2500);
      timeline.dispatchEvent(new Event('input', { bubbles: true }));
      const player = svg.querySelector('[data-pattern-player]');
      return {
        variant: volley.dataset.volleyVariant,
        center: left + width / 2,
        playerX: player.transform.baseVal.consolidate().matrix.e,
        warningOpacity,
        lanes,
        left,
        right: left + width,
        visibleShots: projectiles.filter((shot) => Number(shot.getAttribute('opacity')) > 0).length,
        nodesStable: [...svg.querySelectorAll('[data-volley-projectile]')].every(
          (shot, shotIndex) => shot === projectiles[shotIndex],
        ),
        projectileCount: projectiles.length,
      };
    });
  });
  for (const [index, state] of states.entries()) {
    expect(state.variant).toBe(String(index));
    expect(state.center).toBe(gapCenters[index]);
    expect(state.playerX).toBe(state.center);
    expect(state.warningOpacity, 'the new gap is announced before release').toBeGreaterThan(0);
    expect(state.lanes).toHaveLength(8);
    expect(state.lanes.filter((lane) => lane.occupied)).toHaveLength(6);
    for (const lane of state.lanes)
      expect(lane.occupied, 'warning lanes leave the same opening as the attack').toBe(
        lane.x < state.left || lane.x > state.right,
      );
    expect(state.projectileCount).toBe(24);
    expect(state.visibleShots, 'each of three rows omits both lanes inside the opening').toBe(18);
    expect(state.nodesStable, 'seeking updates existing SVG nodes').toBe(true);
  }
  await page.goto('en/mechanics/sweep/');
  await expect(page.locator('[data-pattern-timeline]')).toHaveAttribute('max', '6000');
});

test('gap volley: autoplay advances through all arrangements before restarting', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openVolley(page);
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute('data-pattern-playing', 'true');
  for (const [milliseconds, nextVariant] of [
    [5900, '1'],
    [11900, '2'],
    [17900, '0'],
  ]) {
    await seek(page, milliseconds);
    await expect(page.locator('[data-pattern-volley]')).toHaveAttribute(
      'data-volley-variant',
      nextVariant,
    );
  }
});

test('gap volley: each row spreads from the boss and then holds its announced lanes', async ({
  page,
}) => {
  await openVolley(page);
  const samples = await page.locator('[data-pattern-svg]').evaluate((svg) => {
    const timeline = document.querySelector('[data-pattern-timeline]');
    const shotPositions = (milliseconds, row) => {
      timeline.value = String(milliseconds);
      timeline.dispatchEvent(new Event('input', { bubbles: true }));
      return [...svg.querySelectorAll(`[data-volley-projectile^="${row}-"]`)].map((shot) => {
        const matrix = shot.transform.baseVal.consolidate().matrix;
        return {
          x: matrix.e,
          y: matrix.f,
          opacity: Number(shot.getAttribute('opacity')),
          rotation: Math.atan2(matrix.b, matrix.a),
        };
      });
    };
    return [0, 1, 2].flatMap((index) =>
      [0, 1, 2].map((row) => {
        const release = index * 6000 + 1600 + row * 200;
        return {
          launch: shotPositions(release, row),
          spread: shotPositions(release + 100, row),
          settled: shotPositions(release + 350, row),
          flight: shotPositions(release + 600, row),
        };
      }),
    );
  });
  for (const sample of samples) {
    for (const shot of sample.launch) {
      expect(
        shot.x,
        'a row originates at the boss rather than appearing in distant lanes',
      ).toBeCloseTo(280, 5);
      expect(shot.y).toBeCloseTo(210, 5);
    }
    const activeLanes = sample.spread
      .map((shot, index) => (shot.opacity > 0 ? index : -1))
      .filter((index) => index >= 0);
    expect(activeLanes).toHaveLength(6);
    for (const index of activeLanes) {
      const spread = sample.spread[index];
      const settled = sample.settled[index];
      const flight = sample.flight[index];
      expect(Math.abs(spread.x - 280)).toBeLessThan(Math.abs(settled.x - 280));
      expect(spread.y).toBeGreaterThan(210);
      expect(flight.x, 'the committed projectile no longer steers sideways').toBeCloseTo(
        settled.x,
        5,
      );
      expect(flight.y).toBeGreaterThan(settled.y);
      expect(flight.rotation).toBeCloseTo(0, 5);
    }
  }
});

test('gap volley: reduced motion freezes every variant and keyboard seeking covers the complete sequence', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openVolley(page);
  const timeline = page.locator('[data-pattern-timeline]');
  const svg = page.locator('[data-pattern-svg]');
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute(
    'data-pattern-playing',
    'false',
  );
  for (const milliseconds of [2500, 8500, 14500]) {
    await seek(page, milliseconds);
    const frame = await svg.innerHTML();
    await page.waitForTimeout(100);
    await expect(timeline).toHaveValue(String(milliseconds));
    expect(await svg.innerHTML(), 'bodies, projectiles, cues, and effects freeze together').toBe(
      frame,
    );
    await seek(page, 0);
    await seek(page, milliseconds);
    expect(await svg.innerHTML(), 'backward seeking restores the complete frame').toBe(frame);
  }
  await timeline.focus();
  await timeline.press('End');
  await expect(timeline).toHaveValue('18000');
  await expect(page.locator('[data-pattern-volley]')).toHaveAttribute('data-volley-variant', '0');
  await timeline.press('ArrowLeft');
  await expect(timeline).toHaveValue('17990');
  await expect(page.locator('[data-pattern-volley]')).toHaveAttribute('data-volley-variant', '2');
  await timeline.press('Home');
  await expect(timeline).toHaveValue('0');
});

for (const { viewport, theme, locale } of [
  { viewport: { width: 375, height: 812 }, theme: 'light', locale: 'en' },
  { viewport: { width: 375, height: 812 }, theme: 'dark', locale: 'ar' },
  { viewport: { width: 1280, height: 720 }, theme: 'dark', locale: 'en' },
  { viewport: { width: 1280, height: 720 }, theme: 'light', locale: 'ar' },
]) {
  test(`gap volley: ${viewport.width}px, ${theme}, ${locale} keeps every route in frame and all passing shots clear`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await openVolley(page, locale);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    const result = await page.locator('[data-pattern-svg]').evaluate((svg) => {
      const timeline = document.querySelector('[data-pattern-timeline]');
      const violations = [];
      const crossingCounts = [0, 0, 0];
      const contained = (inner, outer) =>
        inner.left >= outer.left &&
        inner.right <= outer.right &&
        inner.top >= outer.top &&
        inner.bottom <= outer.bottom;
      for (let milliseconds = 0; milliseconds <= 18000; milliseconds += 100) {
        timeline.value = String(milliseconds);
        timeline.dispatchEvent(new Event('input', { bubbles: true }));
        const scene = svg.getBoundingClientRect();
        for (const selector of [
          '[data-pattern-boss] [data-character-art]',
          '[data-pattern-player] [data-character-art]',
          '[data-pattern-boss-label]',
          '[data-pattern-player-label]',
          '[data-volley-gap]',
        ]) {
          if (!contained(svg.querySelector(selector).getBoundingClientRect(), scene))
            violations.push(`${selector} leaves the scene at ${milliseconds}ms`);
        }
        const player = svg
          .querySelector('[data-pattern-player] [data-character-art]')
          .getBoundingClientRect();
        const localTime = milliseconds % 6000;
        const variant = Number(svg.querySelector('[data-pattern-volley]').dataset.volleyVariant);
        for (const projectile of svg.querySelectorAll('[data-volley-projectile]')) {
          if (Number(projectile.getAttribute('opacity')) <= 0) continue;
          const shot = projectile.getBoundingClientRect();
          if (!contained(shot, scene))
            violations.push(`projectile leaves the scene at ${milliseconds}ms`);
          if (localTime < 3000 || localTime > 4100) continue;
          if (shot.bottom < player.top || shot.top > player.bottom) continue;
          crossingCounts[variant] += 1;
          if (!(shot.right < player.left || shot.left > player.right))
            violations.push(
              `projectile ${projectile.dataset.volleyProjectile} overlaps player art at ${milliseconds}ms`,
            );
        }
      }
      return {
        violations,
        crossingCounts,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(
      result.violations,
      'rendered bounds, including the complete player rig, remain safe',
    ).toEqual([]);
    for (const count of result.crossingCounts)
      expect(count, 'each variant was sampled while rows passed the player').toBeGreaterThan(0);
    expect(result.overflow).toBe(false);
  });
}

test('gap volley: catalog and builder reuse the lesson projectile artwork', async ({ page }) => {
  await openVolley(page);
  const artwork = await page.locator('[data-volley-projectile-art]').first().innerHTML();
  for (const route of ['en/', 'en/builder/']) {
    await page.goto(route);
    const preview = page.locator('[data-pattern-preview="gap-volley"]');
    await expect(preview).toHaveCount(1);
    const instances = await preview
      .locator('[data-volley-projectile-art]')
      .evaluateAll((shots) => shots.map((shot) => shot.innerHTML));
    expect(instances.length).toBeGreaterThan(0);
    for (const instance of instances) expect(instance).toBe(artwork);
  }
});

test('gap volley: the server-rendered opening remains understandable without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(new URL('ar/mechanics/gap-volley/', baseURL).href);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('[data-pattern-svg]')).toBeVisible();
    await expect(page.locator('[data-pattern-timeline]')).toHaveAttribute('max', '18000');
    for (const selector of [
      '[data-pattern-volley]',
      '[data-volley-warning]',
      '[data-volley-gap]',
    ]) {
      expect(
        Number(await page.locator(selector).getAttribute('opacity')),
        `${selector} is visible in the static scene`,
      ).toBeGreaterThan(0);
    }
    expect(
      await page
        .locator('[data-volley-gap]')
        .evaluate((gap) => Number(gap.getAttribute('x')) + Number(gap.getAttribute('width')) / 2),
    ).toBe(280);
    await expect(page.locator('[data-volley-lane][opacity="1"]')).toHaveCount(6);
    for (const role of ['boss', 'player'])
      await expect(page.locator(`[data-pattern-${role}] [data-character-art]`)).toBeVisible();
  } finally {
    await context.close();
  }
});
