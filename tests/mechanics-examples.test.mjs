import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lib/content.mjs';

const source = await loadContent();

test('Ori references cover both games and only indexed mechanics', async () => {
  await validateContent(source);
  const examples = source.mechanicsExamples.examples;
  const indexedIds = new Set(source.mechanicsIndex.mechanics.map(({ id }) => id));

  assert.equal(examples.length, 14);
  assert.deepEqual([...new Set(examples.map(({ game }) => game))].sort(), [
    'Ori and the Blind Forest',
    'Ori and the Will of the Wisps',
  ]);
  assert.ok(examples.every(({ mechanicId }) => indexedIds.has(mechanicId)));
  assert.ok(examples.every(({ translations }) => translations.en && translations.ru));
  assert.ok(examples.every(({ sourceUrl }) => sourceUrl.startsWith('https://')));
  assert.ok(
    examples
      .filter(({ videoUrl }) => videoUrl)
      .every(({ videoUrl }) => /youtube\.com\/watch\?.*\bt=\d+s/.test(videoUrl)),
  );
});

test('Ori references reject unknown mechanics and duplicate encounters', async () => {
  const unknown = structuredClone(source);
  unknown.mechanicsExamples.examples[0].mechanicId = 'not-in-the-index';
  await assert.rejects(validateContent(unknown), /unknown mechanic id not-in-the-index/);

  const duplicate = structuredClone(source);
  duplicate.mechanicsExamples.examples.push(
    structuredClone(duplicate.mechanicsExamples.examples[0]),
  );
  await assert.rejects(validateContent(duplicate), /duplicate example/);
});
