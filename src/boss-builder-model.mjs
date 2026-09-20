export const BOSS_SKETCH_FORMAT = 'boss-fight-atlas/boss-sketch';
export const BOSS_SKETCH_VERSION = 1;
export const BOSS_DRAFT_STORAGE_KEY = 'boss-fight-atlas-boss-builder';

const text = (value, maxLength) => (typeof value === 'string' ? value : '').slice(0, maxLength);

export function normalizeBossDraft(value, validMechanicIds) {
  const allowed = new Set(validMechanicIds);
  const mechanics = Array.isArray(value?.mechanics)
    ? [...new Set(value.mechanics.filter((id) => typeof id === 'string' && allowed.has(id)))]
    : [];
  return {
    version: BOSS_SKETCH_VERSION,
    name: text(value?.name, 120),
    description: text(value?.description, 2000),
    mechanics,
  };
}

export function createBossSketch(draft, mechanics, locale) {
  const normalized = normalizeBossDraft(
    draft,
    mechanics.map(({ id }) => id),
  );
  const name = normalized.name.trim();
  if (!name) throw new Error('Boss name is required.');
  if (!normalized.mechanics.length) throw new Error('At least one mechanic is required.');
  const mechanicsById = new Map(mechanics.map((mechanic) => [mechanic.id, mechanic]));
  const sketch = {
    format: BOSS_SKETCH_FORMAT,
    version: BOSS_SKETCH_VERSION,
    locale,
    name,
  };
  const description = normalized.description.trim();
  if (description) sketch.description = description;
  sketch.mechanics = normalized.mechanics.map((id) => {
    const { title, category, summary, url } = mechanicsById.get(id);
    return { id, title, category, summary, url };
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
