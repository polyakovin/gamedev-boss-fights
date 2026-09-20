import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';

const source = await loadContent();

test('the Boss Up adaptation is complete, attributed, and connected to lenses', async () => {
  await validateContent(source);
  const framework = source.bossUpFramework;
  assert.equal(framework.rules.length, 10);
  assert.equal(new Set(framework.rules.map((rule) => rule.id)).size, 10);
  assert.match(framework.source.url, /^https:\/\/www\.gdcvault\.com\//);
  assert.match(framework.source.slidesUrl, /^https:\/\/media\.gdcvault\.com\//);
  const lensIds = new Set(source.lenses.map((lens) => lens.meta.id));
  assert.ok(framework.rules.every((rule) => lensIds.has(rule.lensId)));
  for (const { code } of source.locales) {
    assert.ok(framework.translations[code].title.length > 0);
    assert.ok(
      framework.rules.every(
        (rule) => rule.translations[code].title && rule.translations[code].body,
      ),
    );
  }
});

test('the framework rejects missing translations and unknown lenses', async () => {
  const data = structuredClone(source);
  delete data.bossUpFramework.rules[0].translations.ja;
  data.bossUpFramework.rules[1].lensId = 'missing-lens';
  await assert.rejects(
    validateContent(data),
    (error) =>
      error.message.includes('required property') && error.message.includes('unknown lens id'),
  );
});
