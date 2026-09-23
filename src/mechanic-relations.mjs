export const MECHANIC_TAXONOMY = {
  geometry: ['line', 'arc', 'radial', 'zone', 'arena', 'target', 'entity'],
  signal: ['pose', 'marker', 'trajectory', 'rhythm', 'environment', 'state'],
  response: [
    'dodge',
    'reposition',
    'interrupt',
    'counter',
    'attack',
    'interact',
    'coordinate',
    'manage',
  ],
  dimension: ['2d', '3d'],
};

const CATEGORY_DEFAULTS = {
  'Body and melee': {
    geometry: ['arc'],
    signal: ['pose'],
    response: ['dodge', 'reposition'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'threat-geometry', 'counterplay', 'commitment'],
  },
  Projectiles: {
    geometry: ['line'],
    signal: ['trajectory'],
    response: ['dodge', 'reposition', 'counter'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'threat-geometry', 'counterplay'],
  },
  Beams: {
    geometry: ['line'],
    signal: ['marker', 'trajectory'],
    response: ['dodge', 'reposition'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'threat-geometry', 'progress-clarity'],
  },
  'Zones and traps': {
    geometry: ['zone'],
    signal: ['marker'],
    response: ['reposition'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'threat-geometry', 'counterplay'],
  },
  Arena: {
    geometry: ['arena'],
    signal: ['environment'],
    response: ['reposition', 'manage'],
    dimensions: ['2d', '3d'],
    lenses: ['threat-geometry', 'context-and-sequence', 'difficulty-rhythm'],
  },
  'Additional targets': {
    geometry: ['entity'],
    signal: ['state'],
    response: ['attack', 'manage'],
    dimensions: ['2d', '3d'],
    lenses: ['progress-clarity', 'player-expression', 'counterplay'],
  },
  'Targeting and rhythm': {
    geometry: ['target'],
    signal: ['marker', 'rhythm'],
    response: ['dodge', 'reposition'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'commitment', 'difficulty-rhythm'],
  },
  Defense: {
    geometry: ['target'],
    signal: ['state'],
    response: ['attack', 'interrupt', 'manage'],
    dimensions: ['2d', '3d'],
    lenses: ['progress-clarity', 'counterplay', 'risk-reward'],
  },
  'Structure and readability': {
    geometry: ['target'],
    signal: ['state', 'rhythm'],
    response: ['manage'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'progress-clarity', 'phase-structure', 'difficulty-rhythm'],
  },
  'Space, movement, and perception': {
    geometry: ['arena'],
    signal: ['environment'],
    response: ['reposition', 'interact'],
    dimensions: ['2d', '3d'],
    lenses: ['threat-geometry', 'context-and-sequence', 'rule-exception'],
  },
  'Encounter goals and vulnerability': {
    geometry: ['entity'],
    signal: ['state'],
    response: ['interact', 'attack'],
    dimensions: ['2d', '3d'],
    lenses: ['encounter-purpose', 'progress-clarity', 'player-expression', 'access-paths'],
  },
  'States, resources, and scaling': {
    geometry: ['target'],
    signal: ['state'],
    response: ['manage', 'interrupt'],
    dimensions: ['2d', '3d'],
    lenses: ['progress-clarity', 'risk-reward', 'rule-exception'],
  },
  'Multi-boss relationships': {
    geometry: ['entity'],
    signal: ['state'],
    response: ['attack', 'manage'],
    dimensions: ['2d', '3d'],
    lenses: ['progress-clarity', 'player-expression', 'phase-structure'],
  },
  'Cooperative coordination': {
    geometry: ['target'],
    signal: ['marker'],
    response: ['coordinate', 'reposition'],
    dimensions: ['2d', '3d'],
    lenses: ['telegraphing', 'threat-geometry', 'player-expression'],
  },
};

const PROFILE_OVERRIDES = {
  'wide-swing': { geometry: ['arc'], signal: ['pose'], response: ['dodge', 'reposition'] },
  lunge: { geometry: ['line'], signal: ['pose', 'trajectory'] },
  'ground-slam': { geometry: ['radial'], signal: ['pose', 'environment'] },
  'landing-jump': { geometry: ['radial', 'zone'], signal: ['pose', 'marker'] },
  charge: { geometry: ['line'], signal: ['pose', 'trajectory'] },
  grab: { geometry: ['target'], response: ['dodge', 'interrupt'] },
  sweep: { geometry: ['arc'], signal: ['pose', 'trajectory'] },
  'burrow-and-emerge': { geometry: ['zone'], signal: ['marker', 'environment'] },
  'projectile-fan': { geometry: ['arc', 'line'] },
  'ring-volley': { geometry: ['radial'] },
  'spiral-barrage': { geometry: ['radial'], signal: ['trajectory', 'rhythm'] },
  'gap-volley': { geometry: ['line', 'zone'] },
  crossfire: { geometry: ['line', 'arena'] },
  'orbiting-projectiles': { geometry: ['radial', 'zone'] },
  'rotating-beams': { geometry: ['radial', 'line'], signal: ['trajectory', 'rhythm'] },
  'pulse-beam': { geometry: ['line'], signal: ['rhythm', 'marker'] },
  'chain-explosions': { geometry: ['zone', 'line'], signal: ['marker', 'rhythm'] },
  shockwave: { geometry: ['radial', 'line'], signal: ['pose', 'environment'] },
  mine: { geometry: ['zone'], signal: ['environment', 'state'] },
  'hazard-trail': { geometry: ['line', 'zone'], signal: ['trajectory', 'environment'] },
  pull: { geometry: ['radial', 'arena'] },
  knockback: { geometry: ['line', 'arena'] },
  summon: { geometry: ['entity'], signal: ['state', 'environment'] },
  decoy: { geometry: ['entity', 'target'], response: ['attack', 'manage'] },
  'target-lock': { geometry: ['target'], signal: ['marker'], response: ['reposition'] },
  'predictive-aiming': { geometry: ['line'], signal: ['trajectory'], response: ['dodge'] },
  'homing-projectile': { geometry: ['target', 'line'], signal: ['trajectory'] },
  'attack-combination': { geometry: ['arena'], signal: ['rhythm'], response: ['manage'] },
  'directional-shield': {
    geometry: ['arc'],
    signal: ['state'],
    response: ['reposition', 'attack'],
  },
  'weak-point': { geometry: ['target'], signal: ['marker', 'state'], response: ['attack'] },
  'attack-reflection': { geometry: ['line'], signal: ['state'], response: ['counter'] },
  'counter-stance': { geometry: ['target'], signal: ['pose', 'state'], response: ['manage'] },
  'interruptible-wind-up': {
    geometry: ['target'],
    signal: ['pose', 'state'],
    response: ['interrupt'],
  },
  telegraph: { geometry: ['target'], signal: ['pose', 'marker'], response: ['manage'] },
  'wind-up': { geometry: ['target'], signal: ['pose'], response: ['interrupt', 'manage'] },
  'attack-lock': { geometry: ['target'], signal: ['state'], response: ['dodge', 'reposition'] },
  recovery: { geometry: ['target'], signal: ['state'], response: ['attack'] },
  'fight-phase': { geometry: ['arena'], signal: ['state', 'rhythm'] },
  enrage: { geometry: ['arena'], signal: ['state', 'rhythm'], response: ['attack', 'manage'] },
  'survival-phase': { geometry: ['arena'], response: ['dodge', 'reposition', 'manage'] },
  teleport: { geometry: ['target', 'arena'], signal: ['marker', 'environment'] },
  'forced-scrolling': {
    geometry: ['arena'],
    dimensions: ['2d', '3d'],
    signal: ['environment', 'rhythm'],
    response: ['reposition', 'manage'],
  },
  'chase-herding': {
    geometry: ['entity', 'arena'],
    dimensions: ['2d', '3d'],
    signal: ['marker', 'trajectory'],
    response: ['reposition', 'attack'],
  },
  'relocated-arena': { geometry: ['arena'], signal: ['environment', 'state'] },
  'boss-as-terrain': { geometry: ['entity', 'arena'], dimensions: ['2d', '3d'] },
  'cover-line-of-sight': {
    geometry: ['line', 'arena'],
    dimensions: ['3d'],
    response: ['reposition', 'interact'],
  },
  'wraparound-projectile': { geometry: ['line', 'arena'], dimensions: ['2d'] },
  'beat-synced-attack': { geometry: ['arena'], signal: ['rhythm'], response: ['dodge', 'manage'] },
  'secondary-cues-invisibility': {
    geometry: ['target'],
    signal: ['environment'],
    response: ['reposition', 'manage'],
  },
  'sound-detection': {
    geometry: ['arena'],
    signal: ['environment', 'state'],
    response: ['manage'],
  },
  'objective-linked-invulnerability': { geometry: ['entity'], response: ['interact', 'attack'] },
  'wave-clear-objective': { geometry: ['entity', 'arena'], response: ['attack', 'manage'] },
  'environmental-weapon': { geometry: ['entity', 'line'], response: ['interact', 'attack'] },
  'projectile-rally': {
    geometry: ['line'],
    signal: ['trajectory', 'rhythm'],
    response: ['counter'],
  },
  'baited-self-hit': { geometry: ['line', 'zone'], response: ['reposition', 'counter'] },
  'posture-stagger-gauge': {
    geometry: ['target'],
    signal: ['state'],
    response: ['attack', 'manage'],
  },
  'pacifist-resolution': { geometry: ['target'], response: ['interact', 'manage'] },
  'status-buildup': { geometry: ['target'], signal: ['state'], response: ['manage'] },
  'instant-kill': {
    geometry: ['target'],
    signal: ['marker', 'state'],
    response: ['dodge', 'manage'],
  },
  'external-healing-source': { geometry: ['entity'], response: ['attack', 'interrupt'] },
  'false-death': { geometry: ['target'], signal: ['state'], response: ['manage'] },
  'interface-interaction': { geometry: ['target'], signal: ['state'], response: ['interact'] },
  'partner-revival': { geometry: ['entity'], response: ['attack', 'interrupt'] },
  'coordinated-duo-attack': { geometry: ['entity', 'arena'], signal: ['pose', 'rhythm'] },
  'stack-damage': { geometry: ['target', 'zone'], response: ['coordinate', 'reposition'] },
  'personal-spread': { geometry: ['target', 'zone'], response: ['coordinate', 'reposition'] },
  'tower-soak': { geometry: ['zone'], response: ['coordinate', 'reposition'] },
  'entity-tether': { geometry: ['line'], response: ['coordinate', 'reposition'] },
  'gaze-check': { geometry: ['arena'], dimensions: ['3d'], response: ['coordinate', 'manage'] },
  'proximity-damage': { geometry: ['radial'], response: ['coordinate', 'reposition'] },
  'party-split': { geometry: ['arena'], response: ['coordinate', 'reposition', 'manage'] },
};

const pairKey = (left, right) => [left, right].sort().join('|');

const COMPATIBLE_PAIRS = new Set(
  [
    ['attack-lock', 'charge'],
    ['attack-lock', 'lunge'],
    ['target-lock', 'marked-area-strike'],
    ['telegraph', 'delayed-activation'],
    ['wind-up', 'interruptible-wind-up'],
    ['recovery', 'weak-point'],
    ['weak-point', 'part-break'],
    ['fight-phase', 'relocated-arena'],
    ['fight-phase', 'false-death'],
    ['projectile-rally', 'projectile-fan'],
    ['projectile-rally', 'gap-volley'],
    ['projectile-rally', 'homing-projectile'],
    ['cover-line-of-sight', 'straight-beam'],
    ['cover-line-of-sight', 'scanning-beam'],
    ['summon', 'external-healing-source'],
    ['objective-linked-invulnerability', 'environmental-weapon'],
    ['baited-self-hit', 'charge'],
    ['baited-self-hit', 'lunge'],
    ['partner-revival', 'kill-order-inheritance'],
    ['shared-group-health', 'coordinated-duo-attack'],
    ['target-lock', 'personal-spread'],
    ['beat-synced-attack', 'attack-combination'],
    ['chase-herding', 'target-lock'],
    ['chase-herding', 'baited-self-hit'],
    ['debuff-handoff', 'ordered-targets'],
  ].map(([left, right]) => pairKey(left, right)),
);

const CONFLICT_PAIRS = new Set(
  [
    ['stack-damage', 'personal-spread'],
    ['stack-damage', 'party-split'],
    ['tower-soak', 'personal-spread'],
    ['tower-soak', 'party-split'],
    ['forced-scrolling', 'cover-line-of-sight'],
    ['chase-herding', 'forced-scrolling'],
    ['forced-inertia', 'marked-area-strike'],
    ['shrinking-safe-area', 'platform-destruction'],
    ['gaze-check', 'secondary-cues-invisibility'],
    ['damage-rate-cap', 'enrage'],
    ['pacifist-resolution', 'on-hit-healing'],
  ].map(([left, right]) => pairKey(left, right)),
);

const unique = (values) => [...new Set(values)];
const overlap = (left, right) => left.some((value) => right.includes(value));

export function createMechanicProfile({ id, category, lenses = [] }) {
  const defaults = CATEGORY_DEFAULTS[category];
  if (!defaults) throw new Error(`Unknown mechanic category: ${category}`);
  const override = PROFILE_OVERRIDES[id] ?? {};
  return {
    geometry: unique(override.geometry ?? defaults.geometry),
    signal: unique(override.signal ?? defaults.signal),
    response: unique(override.response ?? defaults.response),
    dimensions: unique(override.dimensions ?? defaults.dimensions),
    lenses: unique([...(override.lenses ?? defaults.lenses), ...lenses]),
  };
}

export function mechanicRelationship(left, right) {
  if (!left || !right || left.id === right.id) return 'neutral';
  const key = pairKey(left.id, right.id);
  if (CONFLICT_PAIRS.has(key)) return 'conflict';
  if (COMPATIBLE_PAIRS.has(key)) return 'compatible';
  const sameSignal = overlap(left.profile.signal, right.profile.signal);
  const differentGeometry = !overlap(left.profile.geometry, right.profile.geometry);
  const differentResponse = !overlap(left.profile.response, right.profile.response);
  const differentCategory = left.categoryKey !== right.categoryKey;
  return sameSignal && differentGeometry && differentResponse && differentCategory
    ? 'compatible'
    : 'neutral';
}

export function rankCompatibleMechanics(mechanics, selectedIds) {
  const selected = mechanics.filter(({ id }) => selectedIds.includes(id));
  if (!selected.length) return [];
  return mechanics
    .filter(({ id }) => !selectedIds.includes(id))
    .map((candidate) => {
      const relations = selected.map((mechanic) => mechanicRelationship(mechanic, candidate));
      return {
        mechanic: candidate,
        score: relations.filter((relation) => relation === 'compatible').length,
        conflict: relations.includes('conflict'),
      };
    })
    .filter(({ score, conflict }) => score > 0 && !conflict)
    .sort(
      (left, right) => right.score - left.score || left.mechanic.number - right.mechanic.number,
    );
}

const pickIndex = (length, random) => {
  const sample = Number(random());
  const normalized = Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 0.999999999999) : 0;
  return Math.floor(normalized * length);
};

export function buildRandomMechanicSet(mechanics, { count = 5, random = Math.random } = {}) {
  const targetCount = Math.min(
    mechanics.length,
    Math.max(0, Number.isFinite(count) ? Math.trunc(count) : 0),
  );
  if (!targetCount) return [];

  const remaining = [...mechanics];
  const selected = [remaining.splice(pickIndex(remaining.length, random), 1)[0]];

  while (selected.length < targetCount && remaining.length) {
    const candidates = remaining
      .map((mechanic, index) => {
        const relations = selected.map((item) => mechanicRelationship(item, mechanic));
        const knownGeometry = new Set(selected.flatMap((item) => item.profile.geometry));
        const knownResponses = new Set(selected.flatMap((item) => item.profile.response));
        const score =
          relations.filter((relation) => relation === 'compatible').length * 10 +
          Number(!selected.some((item) => item.categoryKey === mechanic.categoryKey)) * 2 +
          Number(mechanic.profile.geometry.some((value) => !knownGeometry.has(value))) +
          Number(mechanic.profile.response.some((value) => !knownResponses.has(value)));
        return { mechanic, index, score, conflict: relations.includes('conflict') };
      })
      .filter(({ conflict }) => !conflict);
    if (!candidates.length) break;
    const bestScore = Math.max(...candidates.map(({ score }) => score));
    const best = candidates.filter(({ score }) => score === bestScore);
    const chosen = best[pickIndex(best.length, random)];
    selected.push(chosen.mechanic);
    remaining.splice(chosen.index, 1);
  }

  return selected;
}
