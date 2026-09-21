import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';

const russianUi = JSON.parse(
  await fs.readFile(new URL('../../locales/ru.json', import.meta.url), 'utf8'),
);

const DOWNLOAD_COUNT_STORAGE_KEY = 'boss-fight-atlas-boss-builder-download-count';
const ENGLISH_SUPPORT_URL =
  'https://boosty.to/polyakovin/posts/6207f647-55a4-4a30-accd-d52d0f1097a6?locale=en_US';
const RUSSIAN_SUPPORT_URL =
  'https://boosty.to/polyakovin/posts/ae29ea63-2930-4aa9-8ff8-fab08219ffa8';

async function downloadSketch(page) {
  const download = page.waitForEvent('download');
  await page.locator('[data-boss-download]').click();
  await download;
}

async function prepareSketch(page, locale) {
  await page.goto(`${locale}/builder/`);
  await page.locator('[data-boss-name]').fill('Gate Warden');
  await page.locator('[data-boss-mechanic][value="charge"]').check();
}

test('the third successful JSON download offers project support once', async ({ page }) => {
  await page.goto('en/builder/');
  await page.locator('[data-boss-download]').click();
  expect(await page.evaluate((key) => localStorage.getItem(key), DOWNLOAD_COUNT_STORAGE_KEY)).toBe(
    null,
  );

  await page.locator('[data-boss-name]').fill('Gate Warden');
  await page.locator('[data-boss-mechanic][value="charge"]').check();
  const prompt = page.locator('[data-boss-support]');

  await downloadSketch(page);
  await expect(prompt).toBeHidden();
  await downloadSketch(page);
  await expect(prompt).toBeHidden();
  await downloadSketch(page);

  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveAttribute('open', '');
  await expect(prompt.locator('h2')).toHaveText('Help keep Boss Fight Atlas growing');
  await expect(page.locator('[data-boss-support-link]')).toHaveAttribute(
    'href',
    ENGLISH_SUPPORT_URL,
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), DOWNLOAD_COUNT_STORAGE_KEY)).toBe(
    '3',
  );

  await prompt.locator('button[value="cancel"]').click();
  await expect(prompt).toBeHidden();
  await downloadSketch(page);
  await expect(prompt).toBeHidden();
  expect(await page.evaluate((key) => localStorage.getItem(key), DOWNLOAD_COUNT_STORAGE_KEY)).toBe(
    '4',
  );
});

test('the Russian builder uses the Russian Boosty post', async ({ page }) => {
  await prepareSketch(page, 'ru');
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [DOWNLOAD_COUNT_STORAGE_KEY, '2'],
  );
  await page.reload();
  await downloadSketch(page);

  const prompt = page.locator('[data-boss-support]');
  await expect(prompt).toBeVisible();
  await expect(prompt.locator('h2')).toHaveText(russianUi.builderSupportTitle);
  await expect(page.locator('[data-boss-support-link]')).toHaveAttribute(
    'href',
    RUSSIAN_SUPPORT_URL,
  );
});
