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

test.describe('phone controls', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('floating joystick moves continuously and a second finger can attack', async ({ page }) => {
    await page.goto('en/mechanics/charge/');
    const demo = page.locator('[data-charge-demo]');
    const canvas = page.locator('.charge-demo__canvas');
    const stick = page.locator('[data-charge-joystick]');
    const toggle = page.locator('[data-charge-touch-toggle]');
    await expect(toggle).toBeVisible();
    await expect(page.locator('[data-charge-game-message]')).toContainText('Tap');
    await expect(canvas).toHaveCSS('touch-action', 'auto');
    await toggle.tap();
    await expect(demo).toHaveAttribute('data-charge-mode', 'game');
    await expect(canvas).toHaveCSS('touch-action', 'none');
    await expect(page.locator('[data-charge-touch-attack]')).toBeVisible();
    await canvas.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo(0, top);
    });

    const box = await canvas.boundingBox();
    const center = { x: box.x + 64, y: box.y + box.height * 0.55 };
    const session = await page.context().newCDPSession(page);
    const touch = (id, x, y) => ({ id, x, y });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [touch(1, center.x, center.y)],
    });
    await expect(stick).toBeVisible();
    const player = page.locator('[data-charge-player]');
    const initial = await player.getAttribute('transform');
    await page.waitForTimeout(100);
    await expect(player).toHaveAttribute('transform', initial);

    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [touch(1, center.x + 36, center.y)],
    });
    await expect.poll(() => player.getAttribute('transform')).not.toBe(initial);
    const moved = await player.getAttribute('transform');
    await page.waitForTimeout(120);
    await expect(player).not.toHaveAttribute('transform', moved);

    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [touch(1, center.x + 160, center.y)],
    });
    await expect
      .poll(() =>
        stick.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue('--charge-stick-x')),
        ),
      )
      .toBeGreaterThan(70);
    const attack = await page.locator('[data-charge-touch-attack]').boundingBox();
    const attackPoint = { x: attack.x + attack.width / 2, y: attack.y + attack.height / 2 };
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [touch(1, center.x + 160, center.y), touch(2, attackPoint.x, attackPoint.y)],
    });
    await expect
      .poll(() => page.locator('[data-charge-strike]').getAttribute('opacity'), {
        intervals: [10, 20, 50],
        timeout: 1000,
      })
      .not.toBe('0');
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [touch(2, attackPoint.x, attackPoint.y)],
    });
    await expect(stick).toBeVisible();
    const beforeSecondFinger = await player.getAttribute('transform');
    await page.waitForTimeout(120);
    await expect(player).not.toHaveAttribute('transform', beforeSecondFinger);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [touch(1, center.x + 160, center.y)],
    });
    await expect(stick).toBeHidden();
    const stopped = await player.getAttribute('transform');
    await page.waitForTimeout(120);
    await expect(player).toHaveAttribute('transform', stopped);
    await toggle.tap();
    await expect(demo).toHaveAttribute('data-charge-mode', 'demo');
  });
});
