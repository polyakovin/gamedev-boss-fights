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
      phases: [{ id: 'phase-1', name: '', goal: '', activationHealthPercent: 100 }],
      assignments: [
        { mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo', implementation: '' },
      ],
    },
  );
});

test('boss drafts normalize phase ids and assignments', () => {
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
        {
          id: 'phase-opening',
          name: ' Opening ',
          goal: 'Teach the lane.',
          activationHealthPercent: 100,
        },
        { id: 'phase-2', name: 'Finale', goal: '', activationHealthPercent: 50 },
      ],
      assignments: [
        {
          mechanicId: 'charge',
          phaseId: 'phase-opening',
          combo: 'solo',
          implementation: '',
        },
        { mechanicId: 'charge', phaseId: 'phase-2', combo: 'solo', implementation: '' },
      ],
    },
  );
});

test('phase health thresholds stay ordered and produce non-overlapping ranges', () => {
  const draft = normalizeBossDraft(
    {
      phases: [
        { id: 'phase-1', activationHealthPercent: 80 },
        { id: 'phase-2', activationHealthPercent: 60 },
        { id: 'phase-3', activationHealthPercent: 75 },
      ],
    },
    ['charge'],
  );
  assert.deepEqual(
    draft.phases.map(({ activationHealthPercent }) => activationHealthPercent),
    [100, 60, 59],
  );
  const sketch = createBossSketch(
    {
      ...draft,
      name: 'Gatekeeper',
      assignments: [{ mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo' }],
    },
    mechanics,
    'en',
  );
  assert.deepEqual(
    sketch.phases.map(({ activationHealthPercent, healthRange }) => ({
      activationHealthPercent,
      healthRange,
    })),
    [
      { activationHealthPercent: 100, healthRange: { minPercent: 61, maxPercent: 100 } },
      { activationHealthPercent: 60, healthRange: { minPercent: 60, maxPercent: 60 } },
      { activationHealthPercent: 59, healthRange: { minPercent: 0, maxPercent: 59 } },
    ],
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
    { mechanicId: 'teleport', phaseId: 'phase-1', combo: 'solo', implementation: '' },
    { mechanicId: 'charge', phaseId: 'phase-1', combo: 'solo', implementation: '' },
  ]);
  assert.deepEqual(setBossDraftMechanic(selected, 'charge', false).assignments, [
    { mechanicId: 'teleport', phaseId: 'phase-1', combo: 'solo', implementation: '' },
  ]);
});

test('boss sketch exports a portable localized mechanic snapshot', () => {
  assert.deepEqual(
    createBossSketch(
      {
        name: ' Gatekeeper ',
        description: ' Guards the next area. ',
        phases: [{ id: 'phase-1', name: 'Opening', goal: 'Teach the lane.' }],
        assignments: [
          {
            mechanicId: 'charge',
            phaseId: 'phase-1',
            combo: 'a',
            implementation: 'A two-handed gate axe.',
          },
        ],
      },
      mechanics,
      'en',
      { phase: 'Phase', combos: { solo: 'Solo' } },
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
          activationHealthPercent: 100,
          healthRange: { minPercent: 0, maxPercent: 100 },
          combinations: [
            {
              id: 'solo',
              name: 'Solo',
              mechanics: [{ ...mechanics[0], implementation: 'A two-handed gate axe.' }],
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
