import { BLUEPRINT_DURATION, blueprintFrame } from '../src/blueprint-model.mjs';
import { CHARACTER_ART } from './character-art.mjs';
import { renderEncounterArena, renderEncounterEffects } from './encounter-view.mjs';

const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
const json = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const primitiveAttributes = (primitive, preview = false) => {
  const previewColors = {
    accent: 'var(--accent)',
    muted: 'var(--muted)',
    safe: '#b9e59f',
    signal: 'var(--signal)',
  };
  const previewOpacityFloor = {
    accent: 0.28,
    muted: 0.26,
    safe: 0.42,
    signal: 0.38,
  };
  const opacity =
    preview && primitive.opacity > 0
      ? Math.max(primitive.opacity, previewOpacityFloor[primitive.tone] ?? 0.28)
      : primitive.opacity;
  const strokeWidth =
    preview && primitive.width > 0
      ? Math.max(2, Math.min(8, primitive.width * 0.22))
      : primitive.width;
  const color = preview ? (previewColors[primitive.tone] ?? 'currentColor') : 'currentColor';
  const shared = `class="blueprint-tone--${escape(primitive.tone)}" opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${primitive.dash ? ` stroke-dasharray="${escape(primitive.dash)}"` : ''}`;
  const fill = primitive.fill ? `fill="${color}" fill-opacity="${primitive.fill}"` : 'fill="none"';
  if (primitive.type === 'circle')
    return `<circle ${shared} cx="${primitive.x}" cy="${primitive.y}" r="${primitive.radius}" ${fill} />`;
  if (primitive.type === 'line')
    return `<line ${shared} x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" fill="none" />`;
  if (primitive.type === 'rect')
    return `<rect ${shared} x="${primitive.x}" y="${primitive.y}" width="${primitive.rectWidth}" height="${primitive.rectHeight}" rx="8" ${fill} />`;
  return `<path ${shared} d="${escape(primitive.data)}" ${fill} />`;
};

const renderPrimitives = (primitives, dataAttribute = true, preview = false) =>
  primitives
    .map(
      (primitive, index) =>
        `<g${dataAttribute ? ` data-blueprint-primitive="${index}"` : ''}>${primitiveAttributes(primitive, preview)}</g>`,
    )
    .join('');

const PREVIEW_TIMES = Object.freeze({
  'landing-jump': 2.98,
  'single-shot': 3.02,
  crossfire: 3.06,
  'splitting-projectile': 3.22,
  'returning-projectile': 3.54,
  'orbiting-projectiles': 3.12,
  'pulse-beam': 3.06,
  'chain-explosions': 3.12,
  mine: 3.08,
  'moving-hazard': 3.12,
  'converging-threats': 3.25,
  pull: 3.12,
  'turret-deployment': 3.08,
  'threat-generator': 3.46,
  decoy: 3.22,
  'predictive-aiming': 3.04,
  'source-tracking': 2.96,
  'burst-fire': 3.12,
  volley: 2.82,
  'delayed-activation': 3.42,
  'speed-change': 3.15,
  'limited-spread': 3.12,
  'directional-shield': 2.05,
  'damage-type-resistance': 3.55,
  'situational-immunity': 3.55,
  'part-break': 3.78,
  'attack-reflection': 2.92,
  'counter-stance': 2.64,
  'absorption-power-up': 3.28,
  'interruptible-wind-up': 1.58,
  'loadout-adaptation': 3.52,
  'wind-up': 3.82,
  'attack-lock': 3.82,
  'active-phase': 1.88,
  recovery: 3.28,
  'survival-phase': 3.16,
  teleport: 2.52,
  'boundary-attack': 1.98,
  'forced-scrolling': 3.18,
  'chase-herding': 3.08,
  'escape-phase': 2.52,
  'relocated-arena': 2.82,
  'control-mode-shift': 2.62,
  'boss-as-terrain': 3.72,
  'cover-line-of-sight': 2.62,
  'forced-inertia': 2.42,
  'wraparound-projectile': 2.36,
  'beat-synced-attack': 2.3,
  'secondary-cues-invisibility': 2.86,
  'sound-detection': 2.98,
  'objective-linked-invulnerability': 3.46,
  'wave-clear-objective': 3.94,
  'environmental-weapon': 3.34,
  'encounter-specific-tool': 3.34,
  'player-controlled-boss': 3.78,
  'projectile-rally': 3.68,
  'baited-self-hit': 2.72,
  'posture-stagger-gauge': 2.82,
  'pacifist-resolution': 2.82,
  'persistent-progress': 3.55,
  'status-buildup': 2.8,
  'instant-kill': 3.08,
  'maximum-health-reduction': 3.62,
  'ability-lock': 3.22,
  'resource-steal': 3.72,
  'on-hit-healing': 2.88,
  'wide-swing': 2.82,
  lunge: 1.92,
  grab: 1.28,
  'burrow-and-emerge': 1.46,
  'ring-volley': 3.08,
  'spiral-barrage': 3.22,
  'ricochet-projectile': 3.34,
  'homing-projectile': 3.18,
  'straight-beam': 2.76,
  'scanning-beam': 3.31,
  'rotating-beams': 2.91,
  'marked-area-strike': 1.24,
  shockwave: 3.04,
  'lingering-hazard': 3.38,
  'hazard-trail': 3.32,
  'platform-destruction': 3.42,
  'shrinking-safe-area': 3.68,
  knockback: 2.79,
  'target-lock': 1.18,
  'attack-combination': 3.36,
  'weak-point': 2.87,
  telegraph: 1.26,
  'fight-phase': 3.44,
  enrage: 3.48,
});

const FULL_HEIGHT_SCENES = new Set([
  'resource-steal',
  'ability-lock',
  'maximum-health-reduction',
  'instant-kill',
  'status-buildup',
  'persistent-progress',
  'pacifist-resolution',
  'posture-stagger-gauge',
  'baited-self-hit',
  'projectile-rally',
  'player-controlled-boss',
  'encounter-specific-tool',
  'environmental-weapon',
  'wave-clear-objective',
  'objective-linked-invulnerability',
  'sound-detection',
  'secondary-cues-invisibility',
  'beat-synced-attack',
  'wraparound-projectile',
  'forced-inertia',
]);

const PREVIEW_CAMERA = Object.freeze({ x: 34, y: 22, scaleX: 0.52, scaleY: 0.155 });

const previewPoint = ({ x, y }) => ({
  x: PREVIEW_CAMERA.x + x * PREVIEW_CAMERA.scaleX,
  y: PREVIEW_CAMERA.y + y * PREVIEW_CAMERA.scaleY,
});

export function blueprintPreviewLayout(mechanicId) {
  const time = PREVIEW_TIMES[mechanicId] ?? 2.75;
  const frame = blueprintFrame(mechanicId, time);
  return Object.freeze({
    time,
    frame,
    boss: previewPoint(frame.boss),
    player: previewPoint(frame.player),
    decoy: frame.decoy ? previewPoint(frame.decoy) : null,
    geometryTransform: `translate(${PREVIEW_CAMERA.x} ${PREVIEW_CAMERA.y}) scale(${PREVIEW_CAMERA.scaleX} ${PREVIEW_CAMERA.scaleY})`,
  });
}

export function renderBlueprint(demo, mechanicId) {
  const initial = blueprintFrame(mechanicId, 0);
  const primitiveLayer = `<g data-blueprint-primitives aria-hidden="true">${renderPrimitives(initial.primitives)}</g>`;
  const sourceInFront =
    mechanicId === 'source-tracking' ||
    mechanicId === 'burst-fire' ||
    mechanicId === 'volley' ||
    mechanicId === 'limited-spread' ||
    mechanicId === 'directional-shield' ||
    mechanicId === 'damage-type-resistance' ||
    mechanicId === 'situational-immunity' ||
    mechanicId === 'part-break' ||
    mechanicId === 'attack-reflection' ||
    mechanicId === 'counter-stance' ||
    mechanicId === 'absorption-power-up' ||
    mechanicId === 'interruptible-wind-up' ||
    mechanicId === 'loadout-adaptation' ||
    mechanicId === 'wind-up' ||
    mechanicId === 'attack-lock' ||
    mechanicId === 'active-phase' ||
    mechanicId === 'recovery' ||
    mechanicId === 'survival-phase' ||
    mechanicId === 'teleport' ||
    mechanicId === 'boundary-attack' ||
    mechanicId === 'boss-as-terrain' ||
    mechanicId === 'cover-line-of-sight' ||
    mechanicId === 'player-controlled-boss' ||
    mechanicId === 'encounter-specific-tool' ||
    mechanicId === 'environmental-weapon' ||
    mechanicId === 'objective-linked-invulnerability' ||
    mechanicId === 'projectile-rally' ||
    mechanicId === 'baited-self-hit' ||
    mechanicId === 'posture-stagger-gauge' ||
    mechanicId === 'pacifist-resolution' ||
    mechanicId === 'persistent-progress' ||
    mechanicId === 'status-buildup' ||
    mechanicId === 'instant-kill' ||
    mechanicId === 'maximum-health-reduction' ||
    mechanicId === 'ability-lock' ||
    mechanicId === 'resource-steal' ||
    mechanicId === 'on-hit-healing';
  return /* HTML */ `<section
    class="blueprint-demo"
    data-blueprint-demo
    data-blueprint-id="${escape(mechanicId)}"
    data-blueprint-full-height="${FULL_HEIGHT_SCENES.has(mechanicId)}"
    aria-label="${escape(demo.title)}"
    ${demo.fallbackAttributes ?? ''}
  >
    <div class="blueprint-demo__canvas">
      <div class="blueprint-demo__scene-timeline">
        <span
          class="blueprint-demo__phase-label"
          data-blueprint-current-phase
          tabindex="0"
          aria-current="step"
          aria-describedby="blueprint-phase-tooltip-${escape(mechanicId)}"
          ><span data-blueprint-phase-name>${escape(demo.phaseNames[0])}</span
          ><span
            class="blueprint-demo__phase-tooltip"
            id="blueprint-phase-tooltip-${escape(mechanicId)}"
            data-blueprint-phase-tooltip
            role="tooltip"
            >${escape(demo.phaseDescriptions[0])}</span
          ></span
        >
        <label class="blueprint-demo__timeline"
          ><span class="blueprint-demo__visually-hidden">${escape(demo.timeline)}</span
          ><input
            type="range"
            data-blueprint-timeline
            min="0"
            max="${BLUEPRINT_DURATION * 1000}"
            step="10"
            value="0"
        /></label>
      </div>
      <svg
        class="blueprint-demo__svg"
        data-blueprint-svg
        viewBox="0 0 560 960"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        ${renderEncounterArena(`blueprint-${mechanicId}`, { minimal: FULL_HEIGHT_SCENES.has(mechanicId) })}
        ${sourceInFront ? '' : primitiveLayer} ${renderEncounterEffects()}
        ${
          initial.decoy
            ? `<g data-blueprint-decoy transform="translate(${initial.decoy.x} ${initial.decoy.y})" opacity="${initial.decoy.opacity}" aria-hidden="true">${CHARACTER_ART.kern.replace('data-character-art="kern"', 'data-character-art="kern-decoy"')}</g>`
            : ''
        }
        <g data-blueprint-boss transform="translate(${initial.boss.x} ${initial.boss.y})">
          ${CHARACTER_ART.kern}
        </g>
        ${sourceInFront ? primitiveLayer : ''}
        <g data-blueprint-player transform="translate(${initial.player.x} ${initial.player.y})">
          ${CHARACTER_ART.tavi}
        </g>
        <text
          data-blueprint-boss-label
          x="${initial.bossLabel.x}"
          y="${initial.bossLabel.y}"
          text-anchor="middle"
          class="blueprint-demo__entity-label"
        >
          ${escape(demo.boss)}
        </text>
        <text
          data-blueprint-player-label
          x="${initial.playerLabel.x}"
          y="${initial.playerLabel.y}"
          text-anchor="middle"
          class="blueprint-demo__entity-label blueprint-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
      </svg>
    </div>
    <p
      class="blueprint-demo__visually-hidden"
      data-blueprint-status
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      ${escape(demo.phaseDescriptions[0])}
    </p>
    <p class="blueprint-demo__motion-note" data-blueprint-motion-note hidden>
      ${escape(demo.reducedMotion)}
    </p>
    <script type="application/json" data-blueprint-config>
      ${json(demo)}
    </script>
  </section>`;
}

export function renderBlueprintThumbnail(mechanicId, id) {
  const preview = blueprintPreviewLayout(mechanicId);
  const { frame } = preview;
  const geometryLayer = `<g clip-path="url(#blueprint-preview-clip-${escape(id)})"><g transform="${preview.geometryTransform}">${renderPrimitives(frame.primitives, false, true)}</g></g>`;
  const sourceInFront =
    mechanicId === 'source-tracking' ||
    mechanicId === 'burst-fire' ||
    mechanicId === 'volley' ||
    mechanicId === 'limited-spread' ||
    mechanicId === 'directional-shield' ||
    mechanicId === 'damage-type-resistance' ||
    mechanicId === 'situational-immunity' ||
    mechanicId === 'part-break' ||
    mechanicId === 'attack-reflection' ||
    mechanicId === 'counter-stance' ||
    mechanicId === 'absorption-power-up' ||
    mechanicId === 'interruptible-wind-up' ||
    mechanicId === 'loadout-adaptation' ||
    mechanicId === 'wind-up' ||
    mechanicId === 'attack-lock' ||
    mechanicId === 'active-phase' ||
    mechanicId === 'teleport' ||
    mechanicId === 'boundary-attack' ||
    mechanicId === 'boss-as-terrain' ||
    mechanicId === 'cover-line-of-sight' ||
    mechanicId === 'player-controlled-boss' ||
    mechanicId === 'encounter-specific-tool' ||
    mechanicId === 'environmental-weapon' ||
    mechanicId === 'objective-linked-invulnerability' ||
    mechanicId === 'projectile-rally' ||
    mechanicId === 'baited-self-hit' ||
    mechanicId === 'posture-stagger-gauge' ||
    mechanicId === 'pacifist-resolution' ||
    mechanicId === 'persistent-progress' ||
    mechanicId === 'status-buildup' ||
    mechanicId === 'instant-kill' ||
    mechanicId === 'maximum-health-reduction' ||
    mechanicId === 'ability-lock' ||
    mechanicId === 'resource-steal' ||
    mechanicId === 'on-hit-healing';
  return /* HTML */ `<svg
    viewBox="0 0 360 160"
    data-blueprint-preview="${escape(mechanicId)}"
    data-blueprint-preview-time="${preview.time}"
  >
    <defs>
      <pattern
        id="blueprint-preview-${escape(id)}"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--diagram-preview-grid)" />
      </pattern>
      <clipPath id="blueprint-preview-clip-${escape(id)}">
        <rect width="360" height="160" />
      </clipPath>
    </defs>
    <rect
      width="360"
      height="160"
      fill="${FULL_HEIGHT_SCENES.has(mechanicId) ? '#263434' : `url(#blueprint-preview-${escape(id)})`}"
    />
    ${sourceInFront ? '' : geometryLayer}
    <g
      data-character-art-preview="kern"
      transform="translate(${preview.boss.x} ${preview.boss.y}) scale(${0.52 * frame.bossScale})"
      opacity="${frame.bossVisible}"
    >
      ${CHARACTER_ART.kern}
    </g>
    ${sourceInFront ? geometryLayer : ''}
    ${
      frame.decoy
        ? `<g data-character-art-preview="kern-decoy" transform="translate(${preview.decoy.x} ${preview.decoy.y}) scale(.52)" opacity="${frame.decoy.opacity}">${CHARACTER_ART.kern.replace('data-character-art="kern"', 'data-character-art="kern-decoy"')}</g>`
        : ''
    }
    <g
      data-character-art-preview="tavi"
      transform="translate(${preview.player.x} ${preview.player.y}) scale(.68)"
    >
      ${
        (mechanicId === 'pacifist-resolution' && frame.pacifistWeaponSheathed) ||
        (mechanicId === 'encounter-specific-tool' && frame.encounterToolEquipped)
          ? CHARACTER_ART.tavi.replace(
              'data-rig-part="weapon"',
              'data-rig-part="weapon" opacity="0"',
            )
          : CHARACTER_ART.tavi
      }
    </g>
  </svg>`;
}
