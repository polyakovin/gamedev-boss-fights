import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';
import { escape, jsonForHtml } from '../lib/html.mjs';
import { lensVisualIds, renderLensVisual } from '../lib/lens-view.mjs';
const source = await loadContent();
test('all eight published lessons have complete valid content', async () => {
  await validateContent(source);
  assert.equal(Object.keys(source.mechanics[0].translations).length, 8);
  assert.equal(source.lenses.length, 6);
  assert.ok(source.lenses.every((lens) => Object.keys(lens.translations).length === 8));
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
    lenses: [],
  };
  draft.translations = { en: draft.translations.en };
  draft.translations.en.title = 'TODO: title';
  draft.translations.en.lensNotes = [];
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

test('every registered language has a distinct regional flag', async () => {
  assert.equal(new Set(source.locales.map((locale) => locale.flag)).size, source.locales.length);
  assert.ok(source.locales.every((locale) => /^\p{Regional_Indicator}{2}$/u.test(locale.flag)));
  const data = structuredClone(source);
  data.locales[0].flag = '';
  await assert.rejects(validateContent(data), /invalid or duplicate flag/);
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

test('each mechanic overview defines the rule and explains why it works', () => {
  for (const lesson of Object.values(source.mechanics[0].translations)) {
    assert.ok(lesson.overview.length > lesson.summary.length);
    assert.ok(lesson.overview.length < 350);
  }
  const { en, ru } = source.mechanics[0].translations;
  assert.match(en.overview, /locks its direction/i);
  assert.match(en.overview, /predictable/i);
  assert.match(en.overview, /response/i);
  assert.match(en.overview, /recovery/i);
  assert.match(ru.overview, /фиксирует направление/i);
  assert.match(ru.overview, /предсказуемой/i);
  assert.match(ru.overview, /ответ/i);
  assert.match(ru.overview, /восстановление/i);
});

test('design lenses stay complete and linkable across translations', async () => {
  const expected = [
    'telegraphing',
    'commitment',
    'threat-geometry',
    'counterplay',
    'risk-reward',
    'mastery-check',
  ];
  assert.deepEqual(source.mechanics[0].meta.lenses, expected);
  assert.deepEqual(
    source.lenses.map((lens) => lens.meta.id),
    expected,
  );
  assert.deepEqual(lensVisualIds, expected);
  for (const lens of source.lenses) {
    const markup = renderLensVisual(lens.meta.id, lens.translations.en);
    assert.match(markup, new RegExp(`data-lens-visual="${lens.meta.id}"`));
    assert.match(markup, /role="img"/);
    assert.ok(markup.includes(escape(lens.translations.en.summary)));
  }
  for (const lesson of Object.values(source.mechanics[0].translations))
    assert.deepEqual(
      lesson.lensNotes.map((note) => note.id),
      expected,
    );
  assert.ok(
    source.lenses.every((lens) =>
      Object.values(lens.translations).every(
        (translation) => translation.title.length > 0 && translation.summary.length > 0,
      ),
    ),
  );
  assert.doesNotMatch(
    source.lenses.map((lens) => lens.translations.en.summary).join(' '),
    /charge/i,
  );
  assert.doesNotMatch(
    source.lenses.map((lens) => lens.translations.ru.summary).join(' '),
    /таран/i,
  );

  const data = structuredClone(source);
  delete data.lenses[0].translations.ja;
  data.mechanics[0].meta.lenses[0] = 'missing-lens';
  await assert.rejects(
    validateContent(data),
    (error) =>
      error.message.includes('missing published translation ja') &&
      error.message.includes('invalid or unpublished lens missing-lens') &&
      error.message.includes('lens note 1 does not match mechanic lenses'),
  );
});

test('design lenses describe games generally instead of boss fights', () => {
  const specificEncounterTerms = {
    en: /\bboss(?:es)?\b|\bcharge\b|\bthis mechanic\b/i,
    ru: /босс|таран|эт(?:а|ой)\s+механик/i,
    'zh-Hans': /Boss|首领|冲锋|这项机制/i,
    hi: /बॉस|धावा|इस युक्ति/i,
    bn: /(?:^|\s)বস(?:\s|ের|কে|টি|$)|ধেয়ে আসা|এই মেকানিক/i,
    es: /\bjef(?:e|es)\b|embestida|esta mecánica/i,
    ar: /الزعيم|الزعماء|الاندفاع|هذه الآلية/i,
    ja: /ボス|突進|このメカニクス/,
  };
  for (const { code } of source.locales) {
    const lensText = source.lenses
      .map((lens) => `${lens.translations[code].title} ${lens.translations[code].summary}`)
      .join(' ');
    assert.doesNotMatch(
      lensText,
      specificEncounterTerms[code],
      `${code}: lens assumes an encounter`,
    );
    assert.doesNotMatch(
      `${source.ui[code].conceptsTitle} ${source.ui[code].conceptsIntro}`,
      specificEncounterTerms[code],
      `${code}: lens catalog assumes an encounter`,
    );
  }
});

test('draft lenses may land before translations are ready', async () => {
  const data = structuredClone(source);
  const draft = structuredClone(data.lenses[0]);
  draft.folder = 'draft-lens';
  draft.meta = {
    ...draft.meta,
    id: 'draft-lens',
    number: 7,
    published: false,
    related: [],
  };
  draft.translations = {
    en: {
      ...draft.translations.en,
      title: 'TODO: title',
      sourceVersion: 1,
    },
  };
  data.lenses.push(draft);
  await validateContent(data);
});

test('community review explicitly includes facts, concepts, examples, and translations', () => {
  assert.match(source.ui.en.reviewNote, /facts.*concepts.*examples.*translations/i);
  assert.match(source.ui.ru.reviewNote, /факты.*концепции.*примеры.*переводы/i);
  assert.match(source.ui.en.contributeNavText, /facts.*concepts.*examples.*translations/i);
  assert.match(source.ui.ru.contributeNavText, /факты.*концепции.*примеры.*переводы/i);
});

test('published game references cover 2D and 3D with screenshots and stable videos', async () => {
  const examples = source.mechanics[0].translations.en.examples;
  assert.equal(examples.length, 6);
  assert.deepEqual(new Set(examples.map((example) => example.dimension)), new Set(['2D', '3D']));
  assert.ok(examples.every((example) => new URL(example.video).hostname === 'www.youtube.com'));
  assert.ok(examples.every((example) => new URL(example.screenshot).protocol === 'https:'));
  assert.ok(examples.every((example) => new URL(example.screenshotSource).protocol === 'https:'));
  assert.equal(new Set(examples.map((example) => example.screenshot)).size, examples.length);
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

test('learning sources stay specific to the charge mechanic and prioritize practitioners', () => {
  const sources = source.mechanics[0].meta.sources;
  assert.equal(sources.length, 5);
  assert.deepEqual(
    new Set(sources.map((item) => new URL(item.url).hostname)),
    new Set([
      'www.gamedeveloper.com',
      'www.gdcvault.com',
      'gdn001.itch.io',
      'snoukdesignnotes.blog',
    ]),
  );
  const titles = sources.map((item) => item.title).join(' ');
  assert.match(titles, /Developer talk/);
  assert.match(titles, /Designer article/);
  assert.match(titles, /Developer devlog/);
  for (const source of sources) {
    assert.match(
      source.title,
      /charge|wind-up|telegraph|boss attack|warning area/i,
      `${source.title} must name the charge behavior it supports`,
    );
  }
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
