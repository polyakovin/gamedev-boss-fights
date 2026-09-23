import { test, expect } from '@playwright/test';

test('movement keys switch the charge demo into a playable battle', async ({ page }) => {
  await page.goto('ru/mechanics/charge/');
  const demo = page.locator('[data-charge-demo]');
  await expect(demo).toHaveAttribute('data-charge-mode', 'demo');
  await demo.scrollIntoViewIfNeeded();
  await page.locator('[data-charge-timeline]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(demo).toHaveAttribute('data-charge-mode', 'demo');

  await demo.focus();
  await page.keyboard.down('KeyD');
  await expect(demo).toHaveAttribute('data-charge-mode', 'game');
  await expect(page.locator('[data-charge-game-score]')).toBeVisible();
  await expect(page.locator('[data-charge-timeline]')).toBeHidden();
  await expect(page.locator('[data-charge-player]')).not.toHaveAttribute(
    'transform',
    'translate(280 480)',
  );
  await page.keyboard.up('KeyD');
  await page.keyboard.press('Space');
  await expect(page.locator('[data-charge-strike]')).not.toHaveAttribute('opacity', '0');

  await page.keyboard.press('Escape');
  await expect(demo).toHaveAttribute('data-charge-mode', 'demo');
  await expect(page.locator('[data-charge-timeline]')).toBeVisible();
  await expect(page.locator('[data-charge-game-score]')).toBeHidden();
});

test('an idle player loses after three charges and can restart', async ({ page }) => {
  await page.goto('en/mechanics/charge/');
  const demo = page.locator('[data-charge-demo]');
  await demo.scrollIntoViewIfNeeded();
  await demo.focus();
  await page.keyboard.press('ArrowUp');
  await expect(demo).toHaveAttribute('data-charge-mode', 'game');
  await expect(demo).toHaveAttribute('data-charge-mode', 'lost', { timeout: 15000 });
  await expect(page.locator('[data-charge-player-health]')).toHaveText('0');
  await page.locator('[data-charge-restart]').click();
  await expect(demo).toHaveAttribute('data-charge-mode', 'game');
  await expect(page.locator('[data-charge-player-health]')).toHaveText('3');
});
