import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_SKETCH_FORMAT,
  bossSketchFilename,
  createBossSketch,
  normalizeBossDraft,
  setBossDraftMechanic,
} from '../src/boss-builder-model.mjs';

const mechanics = [
  {
    id: 'charge',
    title: 'Charge',
    category: 'Movement and space',
    summary: 'A fixed-direction rush.',
    url: 'https://example.com/en/mechanics/charge/',
    profile: {
      geometry: ['line'],
      signal: ['pose', 'trajectory'],
      response: ['dodge', 'reposition'],
      dimensions: ['2d', '3d'],
      lenses: ['telegraphing'],
    },
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
      version: 2,
      name: 'Gatekeeper',
      description: 'Guards the next area.',
      phases: [{ id: 'phase-1', name: '', goal: '' }],
      assignments: [{ mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo' }],
    },
  );
});

test('boss drafts normalize phase ids, assignments, and combinations', () => {
  assert.deepEqual(
    normalizeBossDraft(
      {
        phases: [
          { id: 'phase-opening', name: ' Opening ', goal: 'Teach the lane.' },
          { id: 'invalid', name: 'Finale' },
        ],
        assignments: [
          { mechanicId: 'charge', phaseId: 'missing', combo: 'unknown' },
          { mechanicId: 'charge', phaseId: 'phase-opening', combo: 'a' },
          { mechanicId: 'charge', phaseId: 'phase-2', combo: 'a' },
        ],
      },
      ['charge'],
    ),
    {
      version: 2,
      name: '',
      description: '',
      phases: [
        { id: 'phase-opening', name: ' Opening ', goal: 'Teach the lane.' },
        { id: 'phase-2', name: 'Finale', goal: '' },
      ],
      assignments: [
        { mechanicId: 'charge', phaseId: 'phase-opening', combo: 'solo' },
        { mechanicId: 'charge', phaseId: 'phase-2', combo: 'a' },
      ],
    },
  );
});

test('a mechanic page adds to the first phase and can remove the mechanic again', () => {
  const draft = {
    version: 2,
    name: 'Gatekeeper',
    description: '',
    phases: [
      { id: 'phase-1', name: '', goal: '' },
      { id: 'phase-2', name: 'Finale', goal: '' },
    ],
    assignments: [{ mechanicId: 'teleport', phaseId: 'phase-1', combo: 'a' }],
  };

  const selected = setBossDraftMechanic(draft, 'charge', true);
  assert.deepEqual(selected.assignments, [
    { mechanicId: 'teleport', phaseId: 'phase-1', combo: 'a' },
    { mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo' },
  ]);
  assert.deepEqual(setBossDraftMechanic(selected, 'charge', false).assignments, [
    { mechanicId: 'teleport', phaseId: 'phase-1', combo: 'a' },
  ]);
});

test('boss sketch exports a portable localized mechanic snapshot', () => {
  assert.deepEqual(
    createBossSketch(
      {
        name: ' Gatekeeper ',
        description: ' Guards the next area. ',
        phases: [{ id: 'phase-1', name: 'Opening', goal: 'Teach the lane.' }],
        assignments: [{ mechanicId: 'charge', phaseId: 'phase-1', combo: 'a' }],
      },
      mechanics,
      'en',
      { phase: 'Phase', combos: { solo: 'Solo', a: 'Combination A' } },
    ),
    {
      format: BOSS_SKETCH_FORMAT,
      version: 2,
      locale: 'en',
      name: 'Gatekeeper',
      description: 'Guards the next area.',
      mechanics,
      phases: [
        {
          id: 'phase-1',
          name: 'Opening',
          goal: 'Teach the lane.',
          combinations: [
            {
              id: 'a',
              name: 'Combination A',
              mechanics,
            },
          ],
        },
      ],
    },
  );
  assert.throws(() => createBossSketch({ name: '', mechanics: ['charge'] }, mechanics, 'en'));
  assert.throws(() => createBossSketch({ name: 'Gatekeeper', mechanics: [] }, mechanics, 'en'));
});

test('boss sketch filenames stay readable and filesystem-safe', () => {
  assert.equal(bossSketchFilename(' Gate / Keeper '), 'Gate-Keeper.json');
  assert.equal(
    bossSketchFilename('\u0421\u0442\u0440\u0430\u0436 \u0448\u043b\u044e\u0437\u0430'),
    '\u0421\u0442\u0440\u0430\u0436-\u0448\u043b\u044e\u0437\u0430.json',
  );
  assert.equal(bossSketchFilename('///'), 'boss-sketch.json');
});
