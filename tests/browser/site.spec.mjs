import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const registry = JSON.parse(
  await fs.readFile(new URL('../../locales/registry.json', import.meta.url)),
);
const scriptFontFamilies = {
  'zh-Hans': 'Noto+Sans+SC',
  hi: 'Noto+Sans+Devanagari',
  bn: 'Noto+Sans+Bengali',
  ar: 'Noto+Sans+Arabic',
  ja: 'Noto+Sans+JP',
};
for (const locale of registry) {
  test(`${locale.code}: page, language links and mobile layout`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (new URL(r.url()).hostname === '127.0.0.1' && r.status() >= 400)
        errors.push(`${r.status()} ${r.url()}`);
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${locale.code}/mechanics/charge/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    const fontStylesheet = page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    await expect(fontStylesheet).toHaveCount(1);
    if (scriptFontFamilies[locale.code])
      expect(await fontStylesheet.getAttribute('href')).toContain(scriptFontFamilies[locale.code]);
    expect(
      await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain('Inter');
    expect(
      await page
        .locator('.lesson-hero h1')
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain('Manrope');
    expect(
      await page
        .locator('.eyebrow')
        .first()
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain('IBM Plex Mono');
    await expect(page.locator('[data-theme-toggle]')).toHaveCount(1);
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute('data-charge-ready', 'true');
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute(
      'data-charge-playing',
      'false',
    );
    expect(
      await page
        .locator('[data-charge-demo]')
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--charge-progress-direction').trim(),
        ),
    ).toBe(locale.dir === 'rtl' ? 'to left' : 'to right');
    await expect(page.locator('[data-charge-motion-note]')).toBeVisible();
    await expect(page.locator('.charge-demo__phase-label')).toHaveCount(3);
    await expect(page.locator('.charge-demo__phase-tooltip')).toHaveCount(3);
    await expect(page.locator('.charge-demo button')).toHaveCount(0);
    await expect(page.locator('.charge-demo input')).toHaveCount(1);
    await expect(page.locator('.charge-demo input')).toHaveAttribute('type', 'range');
    await expect(page.locator('.lesson-category')).toHaveAttribute(
      'href',
      `/gamedev-boss-fights/${locale.code}/#mechanics`,
    );
    expect(
      await page
        .locator('.lesson-category')
        .evaluate((element) => getComputedStyle(element).textAlign),
    ).toBe('right');
    await expect(page.locator('.lesson-title-line .lens-chip')).toHaveCount(6);
    await expect(page.locator('.lesson-title-line [role="tooltip"]')).toHaveCount(6);
    await expect(page.locator('.mechanic-overview')).toHaveCount(1);
    await expect(
      page.locator('.hero-subtitle, .lesson-hero > .variant, .lesson-hero > .summary'),
    ).toHaveCount(0);
    await expect(page.locator('.game-example')).toHaveCount(6);
    await expect(page.locator('.game-example__media img')).toHaveCount(6);
    await expect(page.locator('.game-example__source')).toHaveCount(6);
    await expect(page.locator('.game-example__media img').first()).toHaveAttribute(
      'alt',
      'Chub — The Binding of Isaac: Rebirth',
    );
    await expect(page.locator('.game-example__media img').first()).toHaveAttribute(
      'loading',
      'lazy',
    );
    await expect(page.locator('.sources li a')).toHaveCount(7);
    await expect(page.locator('.review-note')).toBeVisible();
    await expect(page.locator('.implementation-checklist')).toBeVisible();
    await expect(page.locator('.checklist-group')).toHaveCount(2);
    await expect(page.locator('.checklist-item')).toHaveCount(11);
    await expect(page.locator('#playbook, #design')).toHaveCount(0);
    const checklistBox = await page.locator('.implementation-checklist').boundingBox();
    expect(
      checklistBox.y + checklistBox.height,
      `${locale.code}: checklist fits first screen`,
    ).toBeLessThanOrEqual(1000);
    await expect(page.locator('#quiz, .quiz, [data-quiz]')).toHaveCount(0);
    await expect(page.locator('.game-example__video[href*="youtube.com/watch"]')).toHaveCount(6);
    const videos = await page
      .locator('.game-example__video')
      .evaluateAll((links) => links.map((link) => link.href));
    expect(videos[1]).toBe('https://www.youtube.com/watch?v=VaYY2fauQNo');
    expect(videos[4]).toBe('https://www.youtube.com/watch?v=NwFX9I69uss&t=265s');
    expect(videos[5]).toBe('https://www.youtube.com/watch?v=gzwO84ERsb8');
    await expect(page.locator('.game-example__video').first()).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    await expect(page.locator('.language-menu summary .language-flag')).toHaveText(locale.flag);
    await page.locator('.language-menu summary').click();
    await expect(page.locator('.language-menu nav a')).toHaveCount(8);
    await expect(page.locator('.language-menu nav .language-flag')).toHaveText(
      registry.map((entry) => entry.flag),
    );
    const links = await page
      .locator('.language-menu nav a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(links.every((l) => l.endsWith('/mechanics/charge/'))).toBe(true);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 375, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator('[data-charge-timeline]').evaluate((element) => {
      element.value = '2400';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('[data-charge-demo]')).toHaveAttribute('data-charge-outcome', 'safe');
    await expect(page.locator('[data-charge-scenario], .charge-demo__scenarios')).toHaveCount(0);
    await expect(page.locator('[data-charge-dodge]')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
test('the loop autoplays, alternates sides, shows phase tooltips, and keeps only the slider', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('ru/mechanics/charge/');
  await expect(page.locator('.lesson-sidebar')).toHaveCount(0);
  await expect(
    page.locator('.lesson-toolbar, .back-link, .lesson-edit, .lesson-topline, .title-index'),
  ).toHaveCount(0);
  await expect(page.locator('.lesson-hero h1')).toHaveText('Таран');
  await expect(page.locator('.lesson-category')).toHaveText('Движение и пространство');
  await page.locator('.lesson-category').click();
  await expect(page).toHaveURL(/\/ru\/#mechanics$/);
  await expect(page.locator('#mechanics')).toBeVisible();
  await page.goto('ru/mechanics/charge/');
  await expect(page.locator('.mechanic-overview')).toHaveText(
    'Таран — скоростная атака: босс целится, фиксирует направление и мчится вперёд без возможности повернуть. Механика работает хорошо, когда фиксация делает траекторию предсказуемой, боковое движение даёт доступный ответ, а восстановление создаёт окно для контратаки.',
  );
  await expect(page.locator('.implementation-checklist > div > h2')).toHaveText(
    'Чеклист внедрения',
  );
  await expect(page.locator('.checklist-item summary').first()).toContainText(
    'Когда прекращается слежение?',
  );
  await expect(page.locator('.lesson-hero')).not.toContainText('3 мин · урок по дизайну');
  await expect(page.locator('.lesson-hero')).not.toContainText('МЕХАНИКА 01');
  await expect(
    page.locator(
      '.charge-demo__heading, .charge-demo__legend, .charge-demo__note, [data-charge-speed]',
    ),
  ).toHaveCount(0);
  const heroBox = await page.locator('.lesson-hero').boundingBox();
  const simulationBox = await page.locator('.simulation-section').boundingBox();
  const diagramBox = await page.locator('[data-charge-svg]').boundingBox();
  const sceneTimelineBox = await page.locator('.charge-demo__scene-timeline').boundingBox();
  expect(simulationBox.x).toBeGreaterThan(heroBox.x + heroBox.width);
  expect(simulationBox.width).toBeLessThanOrEqual(400);
  expect(diagramBox.height).toBeGreaterThan(diagramBox.width);
  expect(sceneTimelineBox.y).toBeGreaterThanOrEqual(diagramBox.y);
  expect(sceneTimelineBox.y + sceneTimelineBox.height).toBeLessThan(
    diagramBox.y + diagramBox.height,
  );
  await expect(page.locator('.charge-demo__phase-label')).toHaveText([
    /Прицеливание/,
    /Фиксация и уклонение/,
    /Таран/,
  ]);
  await expect(page.locator('.charge-demo__description')).toHaveCount(0);
  await expect(page.locator('.charge-demo button')).toHaveCount(0);
  await expect(page.locator('.charge-demo input[type="range"]')).toHaveCount(1);
  const lockTooltip = page.locator('.charge-demo__phase-label').nth(1).locator('[role="tooltip"]');
  await expect(lockTooltip).toBeHidden();
  await page.locator('.charge-demo__phase-label').nth(1).hover();
  await expect(lockTooltip).toBeVisible();
  await expect(lockTooltip).toHaveText(
    'Направление фиксируется, и игрок выходит из полосы обычным боковым движением.',
  );
  expect(Math.abs(simulationBox.y - heroBox.y)).toBeLessThan(2);
  expect(Math.max(heroBox.y + heroBox.height, simulationBox.y + simulationBox.height)).toBeLessThan(
    1000,
  );
  await page.locator('.checklist-item summary').first().click();
  await expect(page.locator('.checklist-item').first().locator('p')).toHaveText(
    'Выберите точный момент. Обозначьте его позой, звуком или эффектом.',
  );
  const demo = page.locator('[data-charge-demo]');
  await expect(demo).toHaveAttribute('data-charge-playing', 'true');
  await expect
    .poll(async () => Number(await page.locator('[data-charge-timeline]').inputValue()))
    .toBeGreaterThan(200);
  const timeline = page.locator('[data-charge-timeline]');
  await timeline.evaluate((element) => {
    element.value = '2400';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(demo).toHaveAttribute('data-charge-attack', '0');
  await expect(demo).toHaveAttribute('data-charge-phase', '2');
  await expect(demo).toHaveAttribute('data-charge-outcome', 'safe');
  await timeline.evaluate((element) => {
    element.value = '5600';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(demo).toHaveAttribute('data-charge-attack', '1');
  await expect(demo).toHaveAttribute('data-charge-phase', '2');
  await timeline.evaluate((element) => {
    element.value = '6300';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(async () => Number(await timeline.inputValue())).toBeLessThan(1000);
  await expect(demo).toHaveAttribute('data-charge-playing', 'true');
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileHeroBox = await page.locator('.lesson-hero').boundingBox();
  const mobileSimulationBox = await page.locator('.simulation-section').boundingBox();
  expect(mobileSimulationBox.y).toBeGreaterThan(mobileHeroBox.y + mobileHeroBox.height);
});
test('the lesson and language navigation work with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/gamedev-boss-fights/ar/mechanics/charge/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-charge-svg]')).toBeVisible();
  await expect(page.locator('#quiz, .quiz, [data-quiz]')).toHaveCount(0);
  await page.locator('.language-menu summary').click();
  await page.locator('.language-menu a[lang="ja"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await context.close();
});

test('lens chips show explanations and open localized lens pages', async ({ page, request }) => {
  await page.goto('ru/mechanics/charge/');
  const chips = page.locator('.lesson-title-line .lens-chip');
  await expect(chips).toHaveText([
    'ТелеграфированиеПоза, звук или эффект сообщают и о будущем таране, и о точном моменте остановки слежения. Сигнал должен совпадать с правилом.',
    'Фиксация решенияПосле фиксации босс отказывается от поворота в обмен на скорость и дальность. Это обязательство делает атаку предсказуемой.',
    'Геометрия угрозыАтака создаёт опасную полосу, а не точку. Сопоставьте её ширину с полным коллайдером игрока, ареной и камерой.',
    'КонтриграХотя бы один ответ должен быть доступен с уже имеющимся движением. Дополнительные навыки расширяют выбор, но не становятся скрытым требованием.',
    'Риск и наградаЧем сильнее и длиннее таран, тем яснее нужен сигнал и тем полезнее окно восстановления. Угроза и возможность настраиваются вместе.',
    'Проверка освоенных навыковБосс проверяет движение и чтение сигналов, которым игра уже обучила. Улучшения меняют пространство решений, но не отменяют механику.',
  ]);
  const firstTooltip = chips.first().locator('[role="tooltip"]');
  await expect(firstTooltip).toBeHidden();
  await chips.first().focus();
  await expect(firstTooltip).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(firstTooltip).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 720 });
  await chips.first().click();
  await expect(page).toHaveURL(/\/ru\/lenses\/telegraphing\/$/);
  await expect(page.locator('.lens-page__hero h1')).toHaveText('Телеграфирование');
  await expect(page.locator('.lens-page__hero p')).toHaveText(
    'Игра сообщает о предстоящем действии, смене состояния или правила визуальным, звуковым или тактильным сигналом. Сигнал, тайминг и результат должны совпадать.',
  );
  await expect(page.locator('.lens-page__hero')).not.toContainText(/босс|таран/i);
  await expect(page.locator('.lens-mechanic-card')).toHaveCount(1);
  await expect(page.locator('.lens-mechanic-card h2')).toContainText('Таран');
  await page.locator('.language-menu summary').click();
  const languageLinks = await page
    .locator('.language-menu nav a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(languageLinks.every((href) => href.endsWith('/lenses/telegraphing/'))).toBe(true);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('ru/lenses/');
  await expect(page.locator('.lens-card')).toHaveCount(6);
  await expect(page.locator('.lens-catalog-hero p')).toHaveText(
    'Эти практические призмы помогают анализировать решения, обратную связь, испытания, пространство и обучение в любых играх. Это рабочие инструменты, а не универсальная классификация.',
  );
  await expect(page.locator('.lens-catalog-main')).not.toContainText(/босс|таран/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const firstCard = await page.locator('.lens-card').first().boundingBox();
  const secondCard = await page.locator('.lens-card').nth(1).boundingBox();
  expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height);
  for (const locale of registry) {
    expect((await request.get(`${locale.code}/lenses/`)).status()).toBe(200);
    expect((await request.get(`${locale.code}/lenses/telegraphing/`)).status()).toBe(200);
  }
});

test('theme follows the system and a saved choice persists across pages', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  const base = 'http://127.0.0.1:4173/gamedev-boss-fights/';
  await page.goto(`${base}ru/`);
  await expect(page.locator('link[href*="site.css"]')).toHaveAttribute(
    'href',
    /assets\/site\.css\?v=[0-9a-f]{10}$/,
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'aria-label',
    'Включить светлую тему',
  );
  const darkBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'aria-label',
    'Включить тёмную тему',
  );
  const lightBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(lightBackground).not.toBe(darkBackground);
  await page.goto(base);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute(
    'aria-label',
    'Switch to dark theme',
  );
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await context.close();
});
test('catalog and language gateway point to real pages', async ({ page, request }) => {
  await page.goto('./');
  await expect(page.locator('.language-choices a')).toHaveCount(8);
  await expect(page.locator('.language-choice .language-flag')).toHaveText(
    registry.map((locale) => locale.flag),
  );
  for (const locale of registry) {
    const response = await request.get(`${locale.code}/`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(`${locale.code}/mechanics/charge/`);
  }
  await page.goto('ru/');
  await expect(page.locator('.catalog-hero h1')).toHaveText('Как устроены бои с боссами');
  await expect(page.locator('.atlas-map__link')).toHaveCount(6);
  expect(
    await page.locator('.atlas-map__link').evaluateAll((links) => links.map((a) => a.href)),
  ).toEqual([
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/#mechanics',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#simulation',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/lenses/',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#examples',
    'http://127.0.0.1:4173/gamedev-boss-fights/ru/mechanics/charge/#sources',
    'https://github.com/polyakovin/gamedev-boss-fights/blob/main/CONTRIBUTING.md',
  ]);
  await expect(page.locator('.card-diagram [data-charge-art="tank"]')).toHaveCount(1);
  await expect(page.locator('.card-diagram [data-charge-art="monster"]')).toHaveCount(1);
  await expect(page.locator('.card-number')).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('homepages fit their core content on a laptop and reflow on mobile', async ({ page }) => {
  for (const locale of registry) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${locale.code}/`);
    await expect(page.locator('html')).toHaveAttribute('dir', locale.dir);
    for (const selector of ['.catalog-hero', '.mechanic-card', '.atlas-map']) {
      const box = await page.locator(selector).boundingBox();
      expect(box.y, `${locale.code}: ${selector} starts on screen`).toBeGreaterThanOrEqual(0);
      expect(
        box.y + box.height,
        `${locale.code}: ${selector} fits the first screen`,
      ).toBeLessThanOrEqual(720);
    }
    expect(await page.locator('.atlas-map__count').allTextContents()).toEqual([
      '1',
      '1',
      '6',
      '6',
      '7',
      '+',
    ]);
    await page.setViewportSize({ width: 375, height: 812 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const card = await page.locator('.mechanic-card').boundingBox();
    const navigation = await page.locator('.atlas-map').boundingBox();
    expect(navigation.y).toBeGreaterThan(card.y + card.height);
    await expect(page.locator('.card-learning')).toBeVisible();
    await expect(page.locator('.atlas-map__link')).toHaveCount(6);
  }
});
