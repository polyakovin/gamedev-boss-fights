export const BOSS_SKETCH_FORMAT = 'boss-fight-atlas/boss-sketch';
export const BOSS_SKETCH_VERSION = 2;
export const BOSS_DRAFT_STORAGE_KEY = 'boss-fight-atlas-boss-builder';
export const BOSS_PHASE_LIMIT = 6;
export const BOSS_COMBO_IDS = ['solo'];

const text = (value, maxLength) => (typeof value === 'string' ? value : '').slice(0, maxLength);
const phaseId = (value, fallback) =>
  typeof value === 'string' && /^phase-[a-z0-9-]+$/.test(value) ? value : fallback;
const healthPercent = (value, fallback) => (Number.isFinite(value) ? Math.round(value) : fallback);

function normalizePhaseHealth(phases) {
  let previousPercent = 101;
  return phases.map((phase, index) => {
    const remainingPhases = phases.length - index - 1;
    const defaultPercent = Math.round((100 * (phases.length - index)) / phases.length);
    const maxPercent = previousPercent - 1;
    const activationHealthPercent =
      index === 0
        ? 100
        : Math.min(
            maxPercent,
            Math.max(remainingPhases, healthPercent(phase.activationHealthPercent, defaultPercent)),
          );
    previousPercent = activationHealthPercent;
    return { ...phase, activationHealthPercent };
  });
}

export function normalizeBossDraft(value, validMechanicIds) {
  const allowed = new Set(validMechanicIds);
  const sourcePhases = Array.isArray(value?.phases) ? value.phases.slice(0, BOSS_PHASE_LIMIT) : [];
  const usedPhaseIds = new Set();
  let phases = sourcePhases.map((phase, index) => {
    let id = phaseId(phase?.id, `phase-${index + 1}`);
    if (usedPhaseIds.has(id)) id = `phase-${index + 1}`;
    usedPhaseIds.add(id);
    return {
      id,
      name: text(phase?.name, 80),
      goal: text(phase?.goal, 280),
      activationHealthPercent: phase?.activationHealthPercent,
    };
  });
  if (!phases.length)
    phases.push({ id: 'phase-1', name: '', goal: '', activationHealthPercent: 100 });
  phases = normalizePhaseHealth(phases);
  const validPhaseIds = new Set(phases.map(({ id }) => id));
  const seenAssignments = new Set();
  const assignments = [];
  if (Array.isArray(value?.assignments))
    for (const assignment of value.assignments) {
      const targetPhaseId = validPhaseIds.has(assignment?.phaseId)
        ? assignment.phaseId
        : phases[0].id;
      const assignmentKey = `${assignment?.mechanicId}|${targetPhaseId}`;
      if (
        !assignment ||
        typeof assignment.mechanicId !== 'string' ||
        !allowed.has(assignment.mechanicId) ||
        seenAssignments.has(assignmentKey)
      )
        continue;
      assignments.push({
        mechanicId: assignment.mechanicId,
        phaseId: targetPhaseId,
        combo: BOSS_COMBO_IDS.includes(assignment.combo) ? assignment.combo : 'solo',
        implementation: text(assignment.implementation, 500),
      });
      seenAssignments.add(assignmentKey);
    }
  if (!assignments.length && Array.isArray(value?.mechanics))
    for (const mechanicId of value.mechanics) {
      const assignmentKey = `${mechanicId}|${phases[0].id}`;
      if (
        typeof mechanicId !== 'string' ||
        !allowed.has(mechanicId) ||
        seenAssignments.has(assignmentKey)
      )
        continue;
      assignments.push({
        mechanicId,
        phaseId: phases[0].id,
        combo: 'solo',
        implementation: '',
      });
      seenAssignments.add(assignmentKey);
    }
  return {
    version: BOSS_SKETCH_VERSION,
    name: text(value?.name, 120),
    description: text(value?.description, 2000),
    phases,
    assignments,
  };
}

function localMechanicIds(value, mechanicId) {
  const ids = new Set([mechanicId]);
  if (Array.isArray(value?.mechanics))
    for (const id of value.mechanics) if (typeof id === 'string') ids.add(id);
  if (Array.isArray(value?.assignments))
    for (const assignment of value.assignments)
      if (typeof assignment?.mechanicId === 'string') ids.add(assignment.mechanicId);
  return [...ids];
}

export function setBossDraftMechanic(value, mechanicId, selected) {
  const draft = normalizeBossDraft(value, localMechanicIds(value, mechanicId));
  draft.assignments = draft.assignments.filter(
    (assignment) => assignment.mechanicId !== mechanicId,
  );
  if (selected) {
    draft.assignments.push({
      mechanicId,
      phaseId: draft.phases[0].id,
      combo: 'solo',
      implementation: '',
    });
  }
  return draft;
}

export function createBossSketch(draft, mechanics, locale, labels = {}) {
  const normalized = normalizeBossDraft(
    draft,
    mechanics.map(({ id }) => id),
  );
  const name = normalized.name.trim();
  if (!name) throw new Error('Boss name is required.');
  if (!normalized.assignments.length) throw new Error('At least one mechanic is required.');
  const mechanicsById = new Map(mechanics.map((mechanic) => [mechanic.id, mechanic]));
  const snapshotsById = new Map(
    normalized.assignments.map(({ mechanicId }) => {
      const { id, title, category, summary, url, profile } = mechanicsById.get(mechanicId);
      return [id, { id, title, category, summary, url, profile }];
    }),
  );
  const sketch = {
    format: BOSS_SKETCH_FORMAT,
    version: BOSS_SKETCH_VERSION,
    locale,
    name,
  };
  const description = normalized.description.trim();
  if (description) sketch.description = description;
  sketch.mechanics = [...snapshotsById.values()];
  sketch.phases = normalized.phases.map((phase, index) => {
    const assignments = normalized.assignments.filter((item) => item.phaseId === phase.id);
    const combinations = BOSS_COMBO_IDS.map((combo) => {
      const comboMechanics = assignments
        .filter((assignment) => assignment.combo === combo)
        .map((assignment) => {
          const mechanic = snapshotsById.get(assignment.mechanicId);
          const implementation = assignment.implementation.trim();
          return implementation ? { ...mechanic, implementation } : mechanic;
        });
      if (!comboMechanics.length) return null;
      return {
        id: combo,
        name: labels.combos?.[combo] ?? combo,
        mechanics: comboMechanics,
      };
    }).filter(Boolean);
    const result = {
      id: phase.id,
      name: phase.name.trim() || `${labels.phase ?? 'Phase'} ${index + 1}`,
      activationHealthPercent: phase.activationHealthPercent,
      healthRange: {
        minPercent: normalized.phases[index + 1]?.activationHealthPercent + 1 || 0,
        maxPercent: phase.activationHealthPercent,
      },
      combinations,
    };
    if (phase.goal.trim()) result.goal = phase.goal.trim();
    return result;
  });
  return sketch;
}

export function bossSketchFilename(name) {
  const base = text(name, 120)
    .trim()
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\-\s]+|[.\-\s]+$/g, '')
    .slice(0, 80);
  return `${base || 'boss-sketch'}.json`;
}
