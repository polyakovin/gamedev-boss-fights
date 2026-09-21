import { test, expect } from '@playwright/test';

test('the catalog and builder do not expose the former top-30 ranking', async ({ page }) => {
  await page.goto('ru/');
  await expect(page.locator('.catalog-lesson .core-badge')).toHaveCount(0);

  await page.goto('ru/builder/');
  await expect(page.locator('.boss-builder-mechanic .core-badge')).toHaveCount(0);
});

test('an expanded draft teaches the complete mechanic blueprint', async ({ page }) => {
  await page.goto('en/mechanics/wide-swing/');

  await expect(page.locator('.wip-mechanic-title .core-badge')).toHaveCount(0);
  await expect(page.locator('.wip-badge')).toHaveText('WIP');
  await expect(page.locator('.draft-profile')).toBeVisible();
  await expect(page.locator('.draft-profile__card')).toHaveCount(6);
  await expect(page.locator('.draft-profile__card h3')).toHaveText([
    'Signal',
    'Player response',
    'Recovery',
    'Tuning',
    'Common failure',
    'Escalation',
  ]);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('all 25 selected WIP mechanics expose their complete blueprint', async ({ request }) => {
  const index = await request.get('en/');
  const catalog = await index.text();
  const selectedDrafts = [
    'wide-swing',
    'lunge',
    'grab',
    'burrow-and-emerge',
    'projectile-fan',
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

  expect(selectedDrafts).toHaveLength(25);
  for (const id of selectedDrafts) {
    expect(catalog).toContain(`en/mechanics/${id}/`);
    const response = await request.get(`en/mechanics/${id}/`);
    expect(response.status(), id).toBe(200);
    const html = await response.text();
    expect(html, id).toContain('class="draft-profile"');
    expect(html.match(/class="draft-profile__card"/g), id).toHaveLength(6);
    expect(html, id).toContain(`data-blueprint-id="${id}"`);
    expect(html, id).toContain('class="wip-badge"');
    expect(html, id).not.toContain('core-badge');
  }
});

test('expanded drafts can include sourced examples while other WIP pages stay compact', async ({
  page,
}) => {
  await page.goto('en/mechanics/platform-destruction/');
  await expect(page.locator('.draft-profile')).toBeVisible();
  await expect(page.locator('.wip-example-card__game')).toHaveText('Ori and the Will of the Wisps');

  await page.goto('en/mechanics/landing-jump/');
  await expect(page.locator('.draft-profile')).toHaveCount(0);
  await expect(page.locator('.wip-mechanic-panel')).toBeVisible();
});
