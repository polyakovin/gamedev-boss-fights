export const BOSS_SKETCH_FORMAT = 'boss-fight-atlas/boss-sketch';
export const BOSS_SKETCH_VERSION = 2;
export const BOSS_DRAFT_STORAGE_KEY = 'boss-fight-atlas-boss-builder';
export const BOSS_PHASE_LIMIT = 6;
export const BOSS_COMBO_IDS = ['solo', 'a', 'b', 'c'];

const text = (value, maxLength) => (typeof value === 'string' ? value : '').slice(0, maxLength);
const phaseId = (value, fallback) =>
  typeof value === 'string' && /^phase-[a-z0-9-]+$/.test(value) ? value : fallback;

export function normalizeBossDraft(value, validMechanicIds) {
  const allowed = new Set(validMechanicIds);
  const sourcePhases = Array.isArray(value?.phases) ? value.phases.slice(0, BOSS_PHASE_LIMIT) : [];
  const usedPhaseIds = new Set();
  const phases = sourcePhases.map((phase, index) => {
    let id = phaseId(phase?.id, `phase-${index + 1}`);
    if (usedPhaseIds.has(id)) id = `phase-${index + 1}`;
    usedPhaseIds.add(id);
    return {
      id,
      name: text(phase?.name, 80),
      goal: text(phase?.goal, 280),
    };
  });
  if (!phases.length) phases.push({ id: 'phase-1', name: '', goal: '' });
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
      assignments.push({ mechanicId, phaseId: phases[0].id, combo: 'solo' });
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
        .map((assignment) => snapshotsById.get(assignment.mechanicId));
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
