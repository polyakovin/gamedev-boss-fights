import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_SKETCH_FORMAT,
  bossSketchFilename,
  createBossSketch,
  normalizeBossDraft,
} from '../src/boss-builder-model.mjs';

const mechanics = [
  {
    id: 'charge',
    title: 'Charge',
    category: 'Movement and space',
    summary: 'A fixed-direction rush.',
    url: 'https://example.com/en/mechanics/charge/',
  },
];

test('boss drafts keep safe local fields and published mechanic ids', () => {
  assert.deepEqual(
    normalizeBossDraft(
      {
        name: 'Gatekeeper',
        description: 'Guards the next area.',
        mechanics: ['charge', 'missing', 'charge', 42],
      },
      ['charge'],
    ),
    {
      version: 1,
      name: 'Gatekeeper',
      description: 'Guards the next area.',
      mechanics: ['charge'],
    },
  );
});

test('boss sketch exports a portable localized mechanic snapshot', () => {
  assert.deepEqual(
    createBossSketch(
      { name: ' Gatekeeper ', description: ' Guards the next area. ', mechanics: ['charge'] },
      mechanics,
      'en',
    ),
    {
      format: BOSS_SKETCH_FORMAT,
      version: 1,
      locale: 'en',
      name: 'Gatekeeper',
      description: 'Guards the next area.',
      mechanics,
    },
  );
  assert.throws(() => createBossSketch({ name: '', mechanics: ['charge'] }, mechanics, 'en'));
  assert.throws(() => createBossSketch({ name: 'Gatekeeper', mechanics: [] }, mechanics, 'en'));
});

test('boss sketch filenames stay readable and filesystem-safe', () => {
  assert.equal(bossSketchFilename(' Gate / Keeper '), 'Gate-Keeper.json');
  assert.equal(bossSketchFilename('Страж шлюза'), 'Страж-шлюза.json');
  assert.equal(bossSketchFilename('///'), 'boss-sketch.json');
});
