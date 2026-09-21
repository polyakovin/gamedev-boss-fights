import { test, expect } from '@playwright/test';

async function openFan(page, locale = 'en') {
  await page.goto(`${locale}/mechanics/projectile-fan/`);
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute('data-pattern-ready', 'true');
}

async function seek(page, milliseconds) {
  await page.locator('[data-pattern-timeline]').evaluate((timeline, value) => {
    timeline.value = String(value);
    timeline.dispatchEvent(new Event('input', { bubbles: true }));
  }, milliseconds);
}

test('projectile fan previews six stable rays and launches six stable projectile nodes', async ({
  page,
}) => {
  await openFan(page);
  await expect(page.locator('[data-pattern-timeline]')).toHaveAttribute('max', '6000');
  await expect(page.locator('[data-projectile-fan-ray]')).toHaveCount(6);
  await expect(page.locator('[data-projectile-fan-projectile]')).toHaveCount(6);

  const result = await page.locator('[data-pattern-projectile-fan]').evaluate((fan) => {
    const timeline = document.querySelector('[data-pattern-timeline]');
    const shots = [...fan.querySelectorAll('[data-projectile-fan-projectile]')];
    const sample = (milliseconds) => {
      timeline.value = String(milliseconds);
      timeline.dispatchEvent(new Event('input', { bubbles: true }));
      return shots.map((shot) => {
        const matrix = shot.transform.baseVal.consolidate().matrix;
        return { x: matrix.e, y: matrix.f, opacity: Number(shot.getAttribute('opacity')) };
      });
    };
    return {
      previewOpacity: Number(
        fan.querySelector('[data-projectile-fan-warning]').getAttribute('opacity'),
      ),
      launch: sample(1600),
      flight: sample(2500),
      recovered: sample(4250),
      nodesStable: [...fan.querySelectorAll('[data-projectile-fan-projectile]')].every(
        (shot, index) => shot === shots[index],
      ),
    };
  });

  expect(result.previewOpacity).toBeGreaterThan(0);
  expect(result.nodesStable).toBe(true);
  for (const shot of result.launch) {
    expect(shot.x).toBeCloseTo(280, 5);
    expect(shot.y).toBeCloseTo(200, 5);
  }
  expect(result.flight.every((shot) => shot.opacity > 0)).toBe(true);
  expect(result.flight.some((shot) => shot.x < 280)).toBe(true);
  expect(result.flight.some((shot) => shot.x > 280)).toBe(true);
  expect(result.recovered.every((shot) => shot.opacity === 0)).toBe(true);
});

test('projectile fan supports reduced motion, backward seeking, and canonical lesson content', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFan(page, 'ru');
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute(
    'data-pattern-playing',
    'false',
  );
  await seek(page, 3000);
  const frozen = await page.locator('[data-pattern-svg]').innerHTML();
  await page.waitForTimeout(100);
  expect(await page.locator('[data-pattern-svg]').innerHTML()).toBe(frozen);
  await seek(page, 0);
  await seek(page, 3000);
  expect(await page.locator('[data-pattern-svg]').innerHTML()).toBe(frozen);

  await expect(page.locator('.lesson-title-line .wip-badge')).toHaveText('WIP');
  await expect(page.locator('.lens-chip')).toHaveCount(4);
  await expect(page.locator('.checklist-items').first().locator('.checklist-item')).toHaveCount(3);
  await expect(page.locator('.example-grid .game-example')).toHaveCount(3);
  await expect(page.locator('.sources li')).toHaveCount(2);
});

test('projectile fan keeps its complete preview readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/projectile-fan/');
  await expect(page.locator('[data-pattern-demo]')).toBeVisible();
  await expect(page.locator('[data-projectile-fan-ray]')).toHaveCount(6);
  await expect(page.locator('[data-pattern-boss] [data-character-art="kern"]')).toHaveCount(1);
  await expect(page.locator('[data-pattern-player] [data-character-art="tavi"]')).toHaveCount(1);
  await expect(page.locator('.implementation-checklist')).toBeVisible();
  await context.close();
});

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
]) {
  test(`projectile fan keeps the canonical page and arena usable at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openFan(page, 'ru');
    await expect(page.locator('.lesson-hero')).toBeVisible();
    await expect(page.locator('.simulation-section')).toBeVisible();
    await expect(page.locator('.implementation-checklist')).toBeVisible();
    await expect(page.locator('.examples-section')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
