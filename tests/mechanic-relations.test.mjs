import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../lib/content.mjs';
import {
  MECHANIC_TAXONOMY,
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
