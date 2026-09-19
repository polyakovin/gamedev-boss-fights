import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';
import { escape, jsonForHtml } from '../lib/html.mjs';
const source = await loadContent();
test('all eight published lessons have complete valid content', async () => {
  await validateContent(source);
  assert.equal(Object.keys(source.mechanics[0].translations).length, 8);
  assert.ok(Object.values(source.mechanics[0].translations).every((lesson) => !('quiz' in lesson)));
});
test('a missing published translation is rejected instead of silently showing English', async () => {
  const data = structuredClone(source);
  delete data.mechanics[0].translations.bn;
  await assert.rejects(validateContent(data), /missing published translation bn/);
});
test('an unfinished placeholder cannot publish', async () => {
  const data = structuredClone(source);
  data.mechanics[0].translations.ar.summary = 'TODO: summary';
  await assert.rejects(validateContent(data), /unresolved placeholder/);
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

test('the published lesson teaches design decisions rather than player execution', () => {
  const { en, ru } = source.mechanics[0].translations;
  assert.match(en.learning, /tune/i);
  assert.match(ru.learning, /настройте/i);
  assert.ok(ru.steps.every((step) => step.title.endsWith('?')));
});

test('published game references cover 2D and 3D with stable YouTube videos', async () => {
  const examples = source.mechanics[0].translations.en.examples;
  assert.equal(examples.length, 6);
  assert.deepEqual(new Set(examples.map((example) => example.dimension)), new Set(['2D', '3D']));
  assert.ok(examples.every((example) => new URL(example.video).hostname === 'www.youtube.com'));
  assert.ok(examples.every((example) => example.videoDurationSeconds > 0));
  assert.equal(examples.filter((example) => example.videoDurationSeconds <= 180).length, 5);
  assert.equal(new URL(examples[4].video).searchParams.get('t'), '265s');

  const data = structuredClone(source);
  data.mechanics[0].translations.ru.examples[0].video = 'https://vimeo.com/123456';
  data.mechanics[0].translations.bn.examples.pop();
  await assert.rejects(
    validateContent(data),
    (error) =>
      error.message.includes('example 1 differs from source') &&
      error.message.includes('needs a YouTube video') &&
      error.message.includes('examples length differs from source'),
  );
});

test('long boss references open at the exact mechanic instead of unrelated gameplay', async () => {
  const data = structuredClone(source);
  for (const lesson of Object.values(data.mechanics[0].translations))
    lesson.examples[4].video = 'https://www.youtube.com/watch?v=NwFX9I69uss';
  await assert.rejects(
    validateContent(data),
    /example 5 longer than 3 minutes needs an exact YouTube timestamp/,
  );
});
