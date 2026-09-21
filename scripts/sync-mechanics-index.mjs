import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUDIT = path.join(ROOT, 'docs/research/boss-mechanics-audit.md');
const OUTPUT = path.join(ROOT, 'content/mechanics-index.json');

const categoryEnglishTitles = [
  'Body and melee',
  'Projectiles',
  'Beams',
  'Zones and traps',
  'Arena',
  'Additional targets',
  'Targeting and rhythm',
  'Defense',
  'Structure and readability',
  'Space, movement, and perception',
  'Encounter goals and vulnerability',
  'States, resources, and scaling',
  'Multi-boss relationships',
  'Cooperative coordination',
];

const originalEnglishTitles = [
  'Wide swing',
  'Lunge',
  'Ground slam',
  'Landing jump',
  'Charge',
  'Grab',
  'Arc sweep',
  'Burrow and emerge',
  'Single shot',
  'Projectile fan',
  'Ring volley',
  'Spiral barrage',
  'Gap wall',
  'Crossfire',
  'Ricochet projectile',
  'Splitting projectile',
  'Returning projectile',
  'Orbiting projectiles',
  'Straight beam',
  'Scanning beam',
  'Rotating beams',
  'Pulse beam',
  'Marked-area strike',
  'Chain explosions',
  'Shockwave',
  'Lingering hazard',
  'Mine',
  'Hazard trail',
  'Moving hazard',
  'Converging threats',
  'Platform destruction',
  'Shrinking safe area',
  'Pull',
  'Knockback',
  'Summon reinforcements',
  'Turret deployment',
  'Threat generator',
  'Decoy',
  'Target lock',
  'Predictive aiming',
  'Source tracking',
  'Homing projectile',
  'Burst fire',
  'Volley',
  'Attack combination',
  'Delayed activation',
  'Speed change',
  'Limited spread',
  'Directional shield',
  'Damage-type resistance',
  'Situational immunity',
  'Weak point',
  'Part break',
  'Attack reflection',
  'Counter stance',
  'Absorption power-up',
  'Interruptible wind-up',
  'Loadout adaptation',
  'Telegraph',
  'Wind-up',
  'Attack lock',
  'Active phase',
  'Recovery',
  'Fight phase',
  'Enrage',
  'Survival phase',
];

const newIds = [
  'teleport',
  'boundary-attack',
  'forced-scrolling',
  'chase-herding',
  'escape-phase',
  'relocated-arena',
  'control-mode-shift',
  'boss-as-terrain',
  'cover-line-of-sight',
  'forced-inertia',
  'wraparound-projectile',
  'beat-synced-attack',
  'secondary-cues-invisibility',
  'sound-detection',
  'objective-linked-invulnerability',
  'wave-clear-objective',
  'environmental-weapon',
  'encounter-specific-tool',
  'player-controlled-boss',
  'projectile-rally',
  'baited-self-hit',
  'posture-stagger-gauge',
  'pacifist-resolution',
  'persistent-progress',
  'status-buildup',
  'instant-kill',
  'maximum-health-reduction',
  'ability-lock',
  'resource-steal',
  'on-hit-healing',
  'self-heal-cast',
  'external-healing-source',
  'damage-rate-cap',
  'loadout-mirror',
  'moveset-shapeshifting',
  'ally-theft',
  'false-death',
  'action-reactive-punish',
  'run-history-manifestation',
  'real-time-progression',
  'interface-interaction',
  'world-state-variant',
  'party-size-scaling',
  'partner-revival',
  'kill-order-inheritance',
  'shared-group-health',
  'coordinated-duo-attack',
  'stack-damage',
  'personal-spread',
  'tower-soak',
  'entity-tether',
  'gaze-check',
  'proximity-damage',
  'tank-swap',
  'debuff-handoff',
  'ordered-targets',
  'pairing-polarity',
  'party-split',
];

const publishedIdOverrides = new Map([
  ['Ground slam', 'ground-slam'],
  ['Charge', 'charge'],
  ['Arc sweep', 'sweep'],
  ['Gap wall', 'gap-volley'],
  ['Summon reinforcements', 'summon'],
]);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const genericSummary = (title) =>
  `Draft outline for the ${title.toLowerCase()} mechanic. Rules, tuning guidance, and examples are still in progress.`;

const parseOriginal = (source) => {
  const entries = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\d+\. \*\*(.+?):\*\* (.+)\.$/);
    if (!match) continue;
    const [, category, terms] = match;
    for (const title of terms.split(', ')) entries.push({ category, title });
  }
  return entries;
};

const parseAdditions = (source) => {
  const entries = [];
  let inAdditions = false;
  let category = '';
  for (const line of source.split(/\r?\n/)) {
    if (line === '## Added mechanics: 58 terms') {
      inAdditions = true;
      continue;
    }
    if (line.startsWith('## Candidates that did not become new mechanics')) break;
    if (!inAdditions) continue;
    if (entries.length === 58) break;
    if (line.startsWith('### ')) {
      category = line.slice(4);
      continue;
    }
    const match = line.match(/^\| \*\*(.+?)\*\*(?: · (.+?))?\s+\| (.+?)\s+\|/);
    if (!match) continue;
    const [, title, alternateTitle, summary] = match;
    entries.push({ category, title, alternateTitle, summary });
  }
  return entries;
};

const [auditSource, existingIndexSource] = await Promise.all([
  fs.readFile(AUDIT, 'utf8'),
  fs.readFile(OUTPUT, 'utf8'),
]);
const existingIndex = JSON.parse(existingIndexSource);
const russianById = new Map(
  existingIndex.mechanics.map((mechanic) => [mechanic.id, mechanic.translations.ru]),
);
const original = parseOriginal(auditSource);
const additions = parseAdditions(auditSource);

if (original.length !== 66 || originalEnglishTitles.length !== 66) {
  throw new Error(`Expected 66 original mechanics; found ${original.length}.`);
}
if (additions.length !== 58 || newIds.length !== 58) {
  throw new Error(`Expected 58 additional mechanics; found ${additions.length}.`);
}
const sourceCategoryNames = [
  ...new Set([...original, ...additions].map(({ category }) => category)),
];
if (sourceCategoryNames.length !== categoryEnglishTitles.length) {
  throw new Error(`Expected 14 mechanic categories; found ${sourceCategoryNames.length}.`);
}
const categoryEnglish = new Map(
  sourceCategoryNames.map((category, index) => [category, categoryEnglishTitles[index]]),
);

const localizedRussian = (id) => {
  const translation = russianById.get(id);
  if (!translation) throw new Error(`Missing Russian index translation for ${id}.`);
  return translation;
};

const mechanics = [
  ...originalEnglishTitles.map((titleEn, index) => {
    const sourceEntry = original[index];
    const id = publishedIdOverrides.get(titleEn) ?? slugify(titleEn);
    return {
      id,
      number: index + 1,
      translations: {
        en: {
          title: titleEn,
          category: categoryEnglish.get(sourceEntry.category),
          summary: genericSummary(titleEn),
        },
        ru: localizedRussian(id),
      },
    };
  }),
  ...additions.map((sourceEntry, index) => {
    const compactTitleEn = sourceEntry.title.split(' / ')[0].trim();
    const id = newIds[index];
    return {
      id,
      number: original.length + index + 1,
      translations: {
        en: {
          title: compactTitleEn,
          category: categoryEnglish.get(sourceEntry.category),
          summary: genericSummary(compactTitleEn),
        },
        ru: localizedRussian(id),
      },
    };
  }),
];

const ids = new Set(mechanics.map(({ id }) => id));
if (mechanics.length !== 124 || ids.size !== 124) {
  throw new Error(`Mechanic index must contain 124 unique entries, found ${ids.size}.`);
}

await fs.writeFile(
  OUTPUT,
  `${JSON.stringify(
    {
      version: 1,
      source: 'docs/research/boss-mechanics-audit.md',
      mechanics,
    },
    null,
    2,
  )}\n`,
);
console.log(`Wrote ${mechanics.length} mechanics to ${path.relative(ROOT, OUTPUT)}.`);
