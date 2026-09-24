import { test, expect } from '@playwright/test';

const lessons = [
  'charge',
  'landing-jump',
  'attack-lock',
  'boundary-attack',
  'cover-line-of-sight',
  'decoy',
  'summon',
  'gap-volley',
];
const familyOf = (id) =>
  id === 'charge' ? 'charge' : id === 'summon' || id === 'gap-volley' ? 'pattern' : 'blueprint';

async function seek(page, family, seconds) {
  await page.locator(`[data-${family}-timeline]`).evaluate((input, milliseconds) => {
    input.value = String(milliseconds);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, seconds * 1000);
}

test('landing jump leaves its shadow on the floor and hits only after contact', async ({
  page,
}) => {
  await page.goto('en/mechanics/landing-jump/');
  const boss = page.locator('[data-blueprint-boss]');
  const widget = page.locator('[data-blueprint-demo]');
  await expect(widget).toHaveAttribute('data-blueprint-ready', 'true');

  await seek(page, 'blueprint', 2.2);
  const airborne = await boss.evaluate((node) => {
    const body = node.querySelector('[data-rig-part="facing"]').getBoundingClientRect();
    const shadow = node.querySelector('[data-rig-part="shadow"]').getBoundingClientRect();
    return shadow.top - body.bottom;
  });
  expect(airborne).toBeGreaterThan(60);

  await seek(page, 'blueprint', 3);
  await expect(widget).toHaveAttribute('data-blueprint-outcome', 'safe');
  const planted = await boss.evaluate((node) => {
    const body = node.querySelector('[data-rig-part="facing"]').getBoundingClientRect();
    const shadow = node.querySelector('[data-rig-part="shadow"]').getBoundingClientRect();
    return shadow.top - body.bottom;
  });
  expect(planted).toBeLessThan(20);

  await seek(page, 'blueprint', 4.8);
  const walking = await boss.locator('[data-rig-part="foot-front"]').getAttribute('transform');
  await seek(page, 'blueprint', 5.9);
  expect(await boss.locator('[data-rig-part="foot-front"]').getAttribute('transform')).not.toBe(
    walking,
  );
  await seek(page, 'blueprint', 6);
  expect(await boss.getAttribute('transform')).toBe('translate(155 280) scale(1)');
});

test('all eight reworked scenes fit their actors on dark RTL mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  for (const id of lessons) {
    const family = familyOf(id);
    await page.goto(`ar/mechanics/${id}/`);
    await expect(page.locator(`[data-${family}-demo]`)).toHaveAttribute(
      `data-${family}-ready`,
      'true',
    );
    await seek(page, family, 2.2);
    const bounds = await page.locator(`[data-${family}-svg]`).evaluate((svg, actorFamily) => {
      const viewport = svg.getBoundingClientRect();
      return ['boss', 'player'].map((name) => {
        const actor = svg.querySelector(`[data-${actorFamily}-${name}]`);
        const box = actor.getBoundingClientRect();
        return {
          left: box.left - viewport.left,
          right: viewport.right - box.right,
          top: box.top - viewport.top,
          bottom: viewport.bottom - box.bottom,
        };
      });
    }, family);
    for (const edge of bounds) {
      expect(edge.left, `${id} left`).toBeGreaterThanOrEqual(-1);
      expect(edge.right, `${id} right`).toBeGreaterThanOrEqual(-1);
      expect(edge.top, `${id} top`).toBeGreaterThanOrEqual(-1);
      expect(edge.bottom, `${id} bottom`).toBeGreaterThanOrEqual(-1);
    }
  }
});
