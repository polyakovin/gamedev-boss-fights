import { test, expect } from '@playwright/test';

const promotedBlueprints = [
  'landing-jump',
  'single-shot',
  'crossfire',
  'splitting-projectile',
  'returning-projectile',
  'orbiting-projectiles',
  'pulse-beam',
  'chain-explosions',
  'mine',
  'moving-hazard',
  'converging-threats',
  'pull',
  'turret-deployment',
  'threat-generator',
  'decoy',
  'predictive-aiming',
  'source-tracking',
  'burst-fire',
  'wide-swing',
  'lunge',
  'grab',
  'burrow-and-emerge',
  'ring-volley',
  'spiral-barrage',
  'ricochet-projectile',
  'homing-projectile',
  'straight-beam',
  'scanning-beam',
  'rotating-beams',
  'marked-area-strike',
  'shockwave',
  'lingering-hazard',
  'hazard-trail',
  'platform-destruction',
  'shrinking-safe-area',
  'knockback',
  'target-lock',
  'attack-combination',
  'weak-point',
  'telegraph',
  'fight-phase',
  'enrage',
];

test('the catalog and builder do not expose the former top-30 ranking', async ({ page }) => {
  await page.goto('ru/');
  await expect(page.locator('.catalog-lesson .core-badge')).toHaveCount(0);

  await page.goto('ru/builder/');
  await expect(page.locator('.boss-builder-mechanic .core-badge')).toHaveCount(0);
});

test('a promoted mechanic uses the complete canonical lesson architecture', async ({ page }) => {
  await page.goto('en/mechanics/wide-swing/');

  await expect(page.locator('.lesson-title-line h1')).toHaveText('Wide swing');
  await expect(page.locator('.wip-badge, .draft-profile, .wip-mechanic-panel')).toHaveCount(0);
  await expect(page.locator('[data-blueprint-id="wide-swing"]')).toBeVisible();
  await expect(page.locator('.implementation-checklist')).toBeVisible();
  await expect(page.locator('.checklist-items').first().locator('.checklist-item')).toHaveCount(3);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(page.locator('.lens-chip')).toHaveCount(4);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('all 42 promoted blueprint mechanics expose a full lesson without WIP', async ({
  request,
}) => {
  const index = await request.get('en/');
  const catalog = await index.text();

  expect(promotedBlueprints).toHaveLength(42);
  for (const id of promotedBlueprints) {
    expect(catalog).toContain(`en/mechanics/${id}/`);
    const response = await request.get(`en/mechanics/${id}/`);
    expect(response.status(), id).toBe(200);
    const html = await response.text();
    expect(html, id).toContain('class="lesson-main"');
    expect(html, id).toContain(`data-blueprint-id="${id}"`);
    expect(html, id).toContain('class="implementation-checklist"');
    expect(html.match(/class="game-example"/g), id).toHaveLength(3);
    expect(html, id).not.toContain('class="wip-badge"');
    expect(html, id).not.toContain('class="draft-profile"');
    expect(html, id).not.toContain('core-badge');
  }
});

test('projectile fan is a published canonical lesson', async ({ page }) => {
  await page.goto('en/mechanics/projectile-fan/');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Projectile fan');
  await expect(page.locator('.lesson-title-line .wip-badge')).toHaveCount(0);
  await expect(page.locator('.implementation-checklist')).toBeVisible();
  await expect(page.locator('.checklist-items').first().locator('.checklist-item')).toHaveCount(3);
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(page.locator('.draft-profile, .wip-mechanic-panel')).toHaveCount(0);
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute(
    'data-pattern-kind',
    'projectile-fan',
  );
});

test('promoted lessons retain sourced Ori examples and new lessons use the full architecture', async ({
  page,
}) => {
  await page.goto('en/mechanics/platform-destruction/');
  await expect(page.locator('.game-example')).toHaveCount(3);
  await expect(page.locator('.game-example').first()).toContainText(
    'Ori and the Will of the Wisps',
  );
  await expect(page.locator('.wip-badge, .draft-profile')).toHaveCount(0);

  await page.goto('en/mechanics/landing-jump/');
  await expect(page.locator('.lesson-title-line h1')).toHaveText('Landing jump');
  await expect(page.locator('.wip-badge, .draft-profile, .wip-mechanic-panel')).toHaveCount(0);
  await expect(page.locator('[data-blueprint-id="landing-jump"]')).toBeVisible();
  await expect(page.locator('.implementation-checklist')).toBeVisible();
  await expect(page.locator('.game-example')).toHaveCount(3);
});
