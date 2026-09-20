import { test, expect } from '@playwright/test';

const visibleEquipment = '[data-sweep-equipment][visibility="visible"]';

async function openSweep(page, locale = 'en') {
  await page.goto(`${locale}/mechanics/sweep/`);
  await expect(page.locator('[data-pattern-demo]')).toHaveAttribute('data-pattern-ready', 'true');
}

async function seek(page, milliseconds) {
  await page.locator('[data-pattern-timeline]').evaluate((timeline, value) => {
    timeline.value = String(value);
    timeline.dispatchEvent(new Event('input', { bubbles: true }));
  }, milliseconds);
}

test('sweep: the two-handed weapon stays attached and continuous through the complete loop', async ({
  page,
}) => {
  await openSweep(page);
  const boss = page.locator('[data-pattern-boss]');
  await expect(boss.locator('[data-sweep-equipment]')).toHaveCount(1);
  await expect(boss.locator('[data-rig-part="arm-back"]')).toBeHidden();
  await expect(boss.locator('[data-rig-part="arm-front"]')).toBeHidden();
  expect(
    await boss.evaluate((actor) => {
      const body = actor.querySelector('[data-character-art="kern"]');
      const equipment = actor.querySelector('[data-sweep-equipment="front"]');
      const shaft = equipment.querySelector('[data-sweep-shaft]');
      const follows = (first, second) =>
        Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
      return (
        body.parentElement === actor &&
        equipment.parentElement === actor &&
        follows(body, equipment) &&
        [...equipment.querySelectorAll('[data-sweep-hand]')].every((hand) => follows(shaft, hand))
      );
    }),
    'the held weapon paints above the body, with both hands above the shaft',
  ).toBe(true);

  const result = await boss.evaluate((actor) => {
    const timeline = document.querySelector('[data-pattern-timeline]');
    let maximumGripError = 0;
    let maximumTipStep = 0;
    let invalidLayers = 0;
    let invalidTransforms = 0;
    let firstTip;
    let previousTip;
    const usedLayers = new Set();

    for (let milliseconds = 0; milliseconds <= 6000; milliseconds += 10) {
      timeline.value = String(milliseconds);
      timeline.dispatchEvent(new Event('input', { bubbles: true }));
      const layers = actor.querySelectorAll('[data-sweep-equipment][visibility="visible"]');
      if (layers.length !== 1) {
        invalidLayers += 1;
        continue;
      }
      const layer = layers[0];
      usedLayers.add(layer.dataset.sweepEquipment);
      const shaft = layer.querySelector('[data-sweep-shaft]');
      const transforms = shaft.transform.baseVal;
      // SVG_TRANSFORM_ROTATE = 4: neither facing nor compression may distort the weapon.
      if (transforms.numberOfItems !== 1 || transforms.getItem(0).type !== 4)
        invalidTransforms += 1;
      const shaftMatrix = shaft.getCTM();
      const hands = [...layer.querySelectorAll('[data-sweep-hand]')];
      if (hands.length !== 2) invalidLayers += 1;
      hands.forEach((hand, index) => {
        const grip = new DOMPoint(0, 0)
          .matrixTransform(hand.getCTM())
          .matrixTransform(shaftMatrix.inverse());
        maximumGripError = Math.max(maximumGripError, Math.hypot(grip.x - [18, 44][index], grip.y));
      });
      const tip = new DOMPoint(248, 0)
        .matrixTransform(shaftMatrix)
        .matrixTransform(actor.getCTM().inverse());
      if (!firstTip) firstTip = tip;
      if (previousTip)
        maximumTipStep = Math.max(
          maximumTipStep,
          Math.hypot(tip.x - previousTip.x, tip.y - previousTip.y),
        );
      previousTip = tip;
    }
    return {
      maximumGripError,
      maximumTipStep,
      invalidLayers,
      invalidTransforms,
      usedLayers: [...usedLayers].sort(),
      loopGap: Math.hypot(previousTip.x - firstTip.x, previousTip.y - firstTip.y),
    };
  });

  expect(result.invalidLayers, 'exactly one equipped pair of hands remains visible').toBe(0);
  expect(result.usedLayers, 'the two-handed grip remains continuously visible in front').toEqual([
    'front',
  ]);
  expect(result.invalidTransforms, 'the shaft rotates without stretching or shifting').toBe(0);
  expect(result.maximumGripError, 'both hand centers stay on the same shaft grips').toBeLessThan(
    0.001,
  );
  expect(result.maximumTipStep, 'no teleport at a phase or loop boundary').toBeLessThan(7);
  expect(result.maximumTipStep, 'the equipped weapon actually swings').toBeGreaterThan(1);
  expect(result.loopGap, 'the final orientation joins the ready pose').toBeLessThan(0.001);
});

test('sweep: reduced motion freezes the weapon and seeking restores both attack and recovery poses', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openSweep(page);
  const demo = page.locator('[data-pattern-demo]');
  const boss = page.locator('[data-pattern-boss]');
  await expect(demo).toHaveAttribute('data-pattern-playing', 'false');

  for (const milliseconds of [2300, 4800, 5200, 5700]) {
    await seek(page, milliseconds);
    const pose = await boss.innerHTML();
    await expect(boss.locator(`${visibleEquipment} [data-weapon-blade]`)).toBeVisible();
    await page.waitForTimeout(100);
    await expect(page.locator('[data-pattern-timeline]')).toHaveValue(String(milliseconds));
    expect(await boss.innerHTML(), 'equipment and arms freeze with playback').toBe(pose);
    await seek(page, 0);
    await seek(page, milliseconds);
    expect(await boss.innerHTML(), 'backward seeking reproduces the exact equipped pose').toBe(
      pose,
    );
  }
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 375, height: 812 },
]) {
  for (const theme of ['light', 'dark']) {
    for (const locale of ['en', 'ar']) {
      test(`sweep: ${viewport.width}px, ${theme}, ${locale} keeps the blade visible and clear of the player`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await openSweep(page, locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');

        const samples = await page.locator('[data-pattern-svg]').evaluate((svg) => {
          const timeline = document.querySelector('[data-pattern-timeline]');
          const demo = document.querySelector('[data-pattern-demo]');
          const frames = [];
          for (let milliseconds = 0; milliseconds <= 6000; milliseconds += 100) {
            timeline.value = String(milliseconds);
            timeline.dispatchEvent(new Event('input', { bubbles: true }));
            const blade = svg.querySelector(
              '[data-pattern-boss] [data-sweep-equipment][visibility="visible"] [data-weapon-blade]',
            );
            const bounds = blade.getBoundingClientRect();
            const scene = svg.getBoundingClientRect();
            const player = svg
              .querySelector('[data-pattern-player] [data-character-art="tavi"]')
              .getBoundingClientRect();
            frames.push({
              milliseconds,
              active: demo.dataset.patternPhase === '1',
              safe: demo.dataset.patternOutcome === 'safe',
              visible: getComputedStyle(blade).visibility === 'visible',
              width: bounds.width,
              height: bounds.height,
              inside:
                bounds.left >= scene.left &&
                bounds.right <= scene.right &&
                bounds.top >= scene.top &&
                bounds.bottom <= scene.bottom,
              clear:
                bounds.right < player.left ||
                bounds.left > player.right ||
                bounds.bottom < player.top ||
                bounds.top > player.bottom,
            });
          }
          return frames;
        });
        for (const frame of samples) {
          expect(frame.visible, `blade remains visible at ${frame.milliseconds}ms`).toBe(true);
          expect(frame.width, 'blade has a readable silhouette').toBeGreaterThan(8);
          expect(frame.height, 'blade has a readable silhouette').toBeGreaterThan(8);
          expect(frame.inside, `blade stays in frame at ${frame.milliseconds}ms`).toBe(true);
          if (frame.active) {
            expect(frame.safe, 'the active example reports a safe response').toBe(true);
            expect(
              frame.clear,
              `the blade cannot overlap any player art at ${frame.milliseconds}ms`,
            ).toBe(true);
          }
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          'the equipped scene does not cause horizontal page overflow',
        ).toBe(true);
      });
    }
  }
}

test('sweep: catalog and builder previews reuse the lesson weapon without equipping other mechanics', async ({
  page,
}) => {
  await openSweep(page);
  const lessonArt = await page
    .locator(`[data-pattern-boss] ${visibleEquipment} [data-weapon-art="sweep-glaive"]`)
    .innerHTML();
  for (const route of ['en/', 'en/builder/']) {
    await page.goto(route);
    const preview = page.locator('[data-pattern-preview="sweep"]');
    await expect(preview).toHaveCount(1);
    await expect(
      preview.locator(`${visibleEquipment} [data-weapon-art="sweep-glaive"]`),
    ).toBeVisible();
    const previewArt = await preview
      .locator('[data-weapon-art="sweep-glaive"]')
      .evaluateAll((weapons) => weapons.map((weapon) => weapon.innerHTML));
    expect(previewArt).toEqual([lessonArt]);
    await expect(
      page.locator('[data-pattern-preview]:not([data-pattern-preview="sweep"]) [data-weapon-art]'),
    ).toHaveCount(0);
    await expect(page.locator('[data-charge-preview] [data-weapon-art]')).toHaveCount(0);
  }
});

test('sweep: the server-rendered boss visibly holds the same weapon without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(new URL('ar/mechanics/sweep/', baseURL).href);
    const boss = page.locator('[data-pattern-boss]');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(boss.locator(visibleEquipment)).toHaveCount(1);
    await expect(boss.locator(`${visibleEquipment} [data-weapon-blade]`)).toBeVisible();
    await expect(boss.locator(`${visibleEquipment} [data-sweep-hand]`)).toHaveCount(2);
    await expect(boss.locator('[data-rig-part="arm-back"]')).toBeHidden();
    await expect(boss.locator('[data-rig-part="arm-front"]')).toBeHidden();
  } finally {
    await context.close();
  }
});
