import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent } from '../lib/content.mjs';
import { generateBossName } from '../src/boss-name.mjs';

const { locales, ui } = await loadContent();

test('every language has enough distinct boss words for at least 1024 names', () => {
  for (const { code } of locales) {
    const parts = ui[code].builderConnections.randomNames;
    const { adjectives, nouns } = parts;
    assert.equal(adjectives.length, 32, code);
    assert.equal(nouns.length, 32, code);
    assert.equal(new Set(adjectives).size, 32, code);
    assert.equal(new Set(nouns).size, 32, code);
    const names = new Set();
    for (let adjectiveIndex = 0; adjectiveIndex < 32; adjectiveIndex += 1)
      for (let nounIndex = 0; nounIndex < 32; nounIndex += 1) {
        let draw = 0;
        const name = generateBossName(parts, () => [adjectiveIndex / 32, nounIndex / 32][draw++]);
        assert.ok(name.length <= 120, code);
        names.add(name);
      }
    assert.equal(names.size, 1024, code);
  }
});

test('name generation chooses each word independently and follows locale word order', () => {
  const english = ui.en.builderConnections.randomNames;
  const arabic = ui.ar.builderConnections.randomNames;
  const japanese = ui.ja.builderConnections.randomNames;
  let calls = 0;
  assert.equal(
    generateBossName(english, () => [0, 0.5][calls++]),
    'Ashen Ravager',
  );
  assert.equal(calls, 2);
  assert.equal(
    generateBossName(arabic, () => 0),
    `${arabic.nouns[0]} ${arabic.adjectives[0]}`,
  );
  assert.equal(
    generateBossName(japanese, () => 0),
    `${japanese.adjectives[0]}${japanese.nouns[0]}`,
  );
});
