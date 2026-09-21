import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';

const source = await loadContent();

test('all 30 selected mechanics are complete published lessons', async () => {
  await validateContent(source);

  const selected = new Set(source.popularMechanics.mechanicIds);
  const lessons = source.mechanics.filter(({ meta }) => selected.has(meta.id));

  assert.equal(selected.size, 30);
  assert.equal(source.popularMechanics.profiles.length, 0);
  assert.equal(lessons.length, 30);
  assert.ok(lessons.every(({ meta }) => meta.published));
  assert.ok(lessons.every(({ translations }) => Object.keys(translations).length === 8));
  assert.equal(
    source.mechanics.find(({ meta }) => meta.id === 'projectile-fan').meta.published,
    true,
  );
});

test('each promoted lesson preserves the complete teaching contract', () => {
  for (const mechanic of source.mechanics) {
    assert.ok(mechanic.meta.animation, `${mechanic.meta.id} has no animation`);
    assert.ok(mechanic.meta.lenses.length >= 4, `${mechanic.meta.id} has too few lenses`);
    assert.ok(mechanic.meta.sources.length >= 1, `${mechanic.meta.id} has no sources`);
    for (const [locale, lesson] of Object.entries(mechanic.translations)) {
      assert.equal(lesson.steps.length, 3, `${mechanic.meta.id}.${locale} steps`);
      assert.ok(lesson.mistakes.length >= 2, `${mechanic.meta.id}.${locale} mistakes`);
      assert.ok(lesson.designNotes.length >= 3, `${mechanic.meta.id}.${locale} notes`);
      assert.ok(lesson.examples.length >= 3, `${mechanic.meta.id}.${locale} examples`);
      assert.doesNotMatch(JSON.stringify(lesson), /TODO:/);
    }
  }
});

test('the selected set rejects unknown ids and missing full lessons', async () => {
  const unknown = structuredClone(source);
  unknown.popularMechanics.mechanicIds[0] = 'not-in-the-index';
  await assert.rejects(validateContent(unknown), /unknown mechanic id not-in-the-index/);

  const missing = structuredClone(source);
  missing.mechanics = missing.mechanics.filter(({ meta }) => meta.id !== 'wide-swing');
  await assert.rejects(validateContent(missing), /wide-swing must have either one lesson/);
});
