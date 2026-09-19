import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';
import { escape, jsonForHtml } from '../lib/html.mjs';
const source = await loadContent();
test('all eight published lessons have complete valid content', async () => {
  await validateContent(source);
  assert.equal(Object.keys(source.mechanics[0].translations).length, 8);
});
test('a missing published translation is rejected instead of silently showing English', async () => {
  const data = structuredClone(source);
  delete data.mechanics[0].translations.bn;
  await assert.rejects(validateContent(data), /missing published translation bn/);
});
test('a mistranslated quiz answer and unfinished placeholder cannot publish', async () => {
  const data = structuredClone(source);
  data.mechanics[0].translations.ar.quiz.correctIndex = 0;
  data.mechanics[0].translations.ar.summary = 'TODO: summary';
  await assert.rejects(
    validateContent(data),
    (error) =>
      error.message.includes('quiz answer differs') &&
      error.message.includes('unresolved placeholder'),
  );
});
test('unknown lesson keys and unsafe source URLs fail validation', async () => {
  const data = structuredClone(source);
  data.mechanics[0].translations.en.typo = 'bad';
  data.mechanics[0].meta.sources[0].url = 'javascript:alert(1)';
  await assert.rejects(
    validateContent(data),
    (error) =>
      error.message.includes('additional properties') && error.message.includes('https-url'),
  );
});
test('drafts may land before translations and animation are ready', async () => {
  const data = structuredClone(source);
  const draft = structuredClone(data.mechanics[0]);
  draft.folder = 'draft-mechanic';
  draft.meta = {
    ...draft.meta,
    id: 'draft-mechanic',
    number: 2,
    published: false,
    animation: null,
  };
  draft.translations = { en: draft.translations.en };
  draft.translations.en.title = 'TODO: title';
  data.mechanics.push(draft);
  await validateContent(data);
});
test('content is escaped both in markup and script data', () => {
  assert.equal(escape('<img a="x">&'), '&lt;img a=&quot;x&quot;&gt;&amp;');
  const value = { message: '</script><script>alert(1)</script>' };
  const json = jsonForHtml(value);
  assert.ok(!json.includes('<'));
  assert.deepEqual(JSON.parse(json), value);
});
test('translated teaching steps cannot silently disappear', async () => {
  const data = structuredClone(source);
  data.mechanics[0].translations.ja.steps.pop();
  await assert.rejects(validateContent(data), /steps length differs from source/);
});
test('the registry cannot duplicate a language', async () => {
  const data = structuredClone(source);
  data.locales.push({ ...data.locales[0] });
  await assert.rejects(validateContent(data), /exactly once/);
});

test('published translations cannot lag behind the current source version', async () => {
  const data = structuredClone(source);
  data.mechanics[0].meta.contentVersion += 1;
  await assert.rejects(validateContent(data), /sourceVersion is stale/);
});

test('published diagrams use only generic boss and player labels', () => {
  for (const lesson of Object.values(source.mechanics[0].translations)) {
    assert.ok(!lesson.demo.boss.includes('·'));
    assert.ok(!lesson.demo.player.includes('·'));
  }
});
