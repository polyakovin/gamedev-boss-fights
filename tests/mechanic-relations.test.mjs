import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../lib/content.mjs';
import {
  MECHANIC_TAXONOMY,
  buildRandomMechanicSet,
  createMechanicProfile,
  mechanicRelationship,
  rankCompatibleMechanics,
} from '../src/mechanic-relations.mjs';

const source = await loadContent();
const publishedById = new Map(source.mechanics.map((mechanic) => [mechanic.meta.id, mechanic]));
const mechanics = source.mechanicsIndex.mechanics.map((mechanic) => {
  const published = publishedById.get(mechanic.id);
  return {
    id: mechanic.id,
    number: mechanic.number,
    categoryKey: mechanic.translations.en.category,
    profile: createMechanicProfile({
      id: mechanic.id,
      category: mechanic.translations.en.category,
      lenses: published?.meta.lenses ?? [],
    }),
  };
});
const byId = new Map(mechanics.map((mechanic) => [mechanic.id, mechanic]));

test('all 124 mechanics have complete filter profiles', () => {
  assert.equal(mechanics.length, 124);
  for (const mechanic of mechanics) {
    for (const key of ['geometry', 'signal', 'response']) {
      assert.ok(mechanic.profile[key].length > 0, `${mechanic.id}: missing ${key}`);
      assert.ok(
        mechanic.profile[key].every((value) => MECHANIC_TAXONOMY[key].includes(value)),
        `${mechanic.id}: unknown ${key}`,
      );
    }
    assert.ok(mechanic.profile.dimensions.length > 0, `${mechanic.id}: missing dimensions`);
    assert.ok(
      mechanic.profile.dimensions.every((value) => MECHANIC_TAXONOMY.dimension.includes(value)),
      `${mechanic.id}: unknown dimension`,
    );
    assert.ok(mechanic.profile.lenses.length > 0, `${mechanic.id}: missing lenses`);
  }
});

test('curated relationships identify useful combinations and response conflicts', () => {
  assert.equal(mechanicRelationship(byId.get('attack-lock'), byId.get('charge')), 'compatible');
  assert.equal(
    mechanicRelationship(byId.get('stack-damage'), byId.get('personal-spread')),
    'conflict',
  );
  assert.equal(mechanicRelationship(byId.get('charge'), byId.get('charge')), 'neutral');
  const suggestions = rankCompatibleMechanics(mechanics, ['attack-lock']);
  assert.ok(suggestions.some(({ mechanic }) => mechanic.id === 'charge'));
  assert.ok(suggestions.every(({ mechanic }) => mechanic.id !== 'attack-lock'));
});

test('random mechanic sets are varied, unique, and free of known conflicts', () => {
  const samples = [0.37, 0.12, 0.82, 0.44, 0.63, 0.21];
  let sample = 0;
  const selection = buildRandomMechanicSet(mechanics, {
    count: 5,
    random: () => samples[sample++ % samples.length],
  });

  assert.equal(selection.length, 5);
  assert.equal(new Set(selection.map(({ id }) => id)).size, 5);
  assert.ok(new Set(selection.map(({ categoryKey }) => categoryKey)).size > 1);
  for (let left = 0; left < selection.length; left += 1)
    for (let right = left + 1; right < selection.length; right += 1)
      assert.notEqual(mechanicRelationship(selection[left], selection[right]), 'conflict');
});

test('random mechanic set handles empty and invalid sizes', () => {
  assert.deepEqual(buildRandomMechanicSet([], { count: 5, random: () => 0 }), []);
  assert.deepEqual(buildRandomMechanicSet(mechanics, { count: -1, random: () => 0 }), []);
});
