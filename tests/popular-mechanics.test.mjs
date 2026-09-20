import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';

const source = await loadContent();

test('the core collection contains 30 detailed mechanics', async () => {
  await validateContent(source);

  const selected = new Set(source.popularMechanics.mechanicIds);
  const published = new Set(
    source.mechanics.filter(({ meta }) => meta.published).map(({ meta }) => meta.id),
  );
  const profiles = new Set(source.popularMechanics.profiles.map(({ id }) => id));

  assert.equal(selected.size, 30);
  assert.equal(profiles.size, 25);
  assert.equal([...selected].filter((id) => published.has(id)).length, 5);
  assert.deepEqual([...selected].filter((id) => !published.has(id)).sort(), [...profiles].sort());
});

test('each expanded draft explains signal, response, tuning, failure, and escalation', () => {
  const fields = ['overview', 'signal', 'response', 'tuning', 'pitfall', 'escalation'];

  for (const profile of source.popularMechanics.profiles)
    for (const locale of ['en', 'ru']) {
      const copy = profile.translations[locale];
      assert.ok(copy, `${profile.id} is missing ${locale}`);
      for (const field of fields) {
        assert.ok(copy[field].length >= 70, `${profile.id}.${locale}.${field} is too shallow`);
        assert.doesNotMatch(copy[field], /TODO:/);
      }
    }
});

test('popular mechanic profiles reject unknown or unselected ids', async () => {
  const unknown = structuredClone(source);
  unknown.popularMechanics.mechanicIds[0] = 'not-in-the-index';
  await assert.rejects(validateContent(unknown), /unknown mechanic id not-in-the-index/);

  const unselected = structuredClone(source);
  unselected.popularMechanics.profiles[0].id = 'landing-jump';
  await assert.rejects(validateContent(unselected), /is not in the top 30/);
});
