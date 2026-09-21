import { test, expect } from '@playwright/test';

test('mechanic pages add to the current boss draft', async ({ page }) => {
  await page.goto('en/builder/');
  await page.locator('[data-boss-name]').fill('Gate Warden');

  await page.goto('en/mechanics/charge/');
  const action = page.locator('[data-mechanic-builder-action]');
  const toggle = action.locator('[data-mechanic-builder-toggle]');
  await expect(action).toHaveAttribute('data-mechanic-builder-ready', 'true');
  await expect(action).toContainText('Use for current boss');
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();
  await expect(action.locator('[data-mechanic-builder-status]')).toHaveText('Saved locally');
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('boss-fight-atlas-boss-builder')).assignments,
    ),
  ).toContainEqual({ mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo' });

  await page.reload();
  await expect(toggle).toBeChecked();
  await action.getByRole('link', { name: 'Open boss builder' }).click();
  await expect(page).toHaveURL(/\/en\/builder\/$/);
  await expect(page.locator('[data-boss-name]')).toHaveValue('Gate Warden');
  await expect(page.locator('[data-boss-mechanic][value="charge"]')).toBeChecked();

  await page.goto('en/mechanics/charge/');
  await page.locator('[data-mechanic-builder-toggle]').uncheck();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('boss-fight-atlas-boss-builder')).assignments,
    ),
  ).not.toContainEqual(expect.objectContaining({ mechanicId: 'charge' }));
});

test('WIP mechanic pages expose the same current-boss control', async ({ page }) => {
  await page.goto('en/mechanics/boundary-attack/');
  const action = page.locator('[data-mechanic-builder-action]');
  await expect(action).toContainText('Use for current boss');
  await action.locator('[data-mechanic-builder-toggle]').check();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('boss-fight-atlas-boss-builder')).assignments,
    ),
  ).toContainEqual({ mechanicId: 'boundary-attack', phaseId: 'phase-1', combo: 'solo' });
});
