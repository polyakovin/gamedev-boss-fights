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

const primitiveAttributes = (primitive) => {
  const shared = `class="blueprint-tone--${escape(primitive.tone)}" opacity="${primitive.opacity}" stroke="currentColor" stroke-width="${primitive.width}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${primitive.dash ? ` stroke-dasharray="${escape(primitive.dash)}"` : ''}`;
  const fill = primitive.fill
    ? `fill="currentColor" fill-opacity="${primitive.fill}"`
    : 'fill="none"';
  if (primitive.type === 'circle')
    return `<circle ${shared} cx="${primitive.x}" cy="${primitive.y}" r="${primitive.radius}" ${fill} />`;
  if (primitive.type === 'line')
    return `<line ${shared} x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" fill="none" />`;
  if (primitive.type === 'rect')
    return `<rect ${shared} x="${primitive.x}" y="${primitive.y}" width="${primitive.rectWidth}" height="${primitive.rectHeight}" rx="8" ${fill} />`;
  return `<path ${shared} d="${escape(primitive.data)}" ${fill} />`;
};

const renderPrimitives = (primitives, dataAttribute = true) =>
  primitives
    .map(
      (primitive, index) =>
        `<g${dataAttribute ? ` data-blueprint-primitive="${index}"` : ''}>${primitiveAttributes(primitive)}</g>`,
    )
    .join('');

export function renderBlueprint(demo, mechanicId) {
  const initial = blueprintFrame(mechanicId, 0);
  return /* HTML */ `<section
    class="blueprint-demo"
    data-blueprint-demo
    data-blueprint-id="${escape(mechanicId)}"
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
        ${renderEncounterArena(`blueprint-${mechanicId}`)}
        <g data-blueprint-primitives aria-hidden="true">${renderPrimitives(initial.primitives)}</g>
        ${renderEncounterEffects()}
        <g data-blueprint-boss transform="translate(${initial.boss.x} ${initial.boss.y})">
          ${CHARACTER_ART.kern}
        </g>
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
          x="${initial.player.x}"
          y="${initial.player.y - 62}"
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
  const frame = blueprintFrame(mechanicId, 2.75);
  return /* HTML */ `<svg viewBox="0 0 360 160" data-blueprint-preview="${escape(mechanicId)}">
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
    <rect width="360" height="160" fill="url(#blueprint-preview-${escape(id)})" />
    <g
      clip-path="url(#blueprint-preview-clip-${escape(id)})"
      transform="translate(96 -24) scale(.3 .2)"
    >
      ${renderPrimitives(frame.primitives, false)}
    </g>
    <g data-character-art-preview="kern" transform="translate(92 70) scale(.52)">
      ${CHARACTER_ART.kern}
    </g>
    <g data-character-art-preview="tavi" transform="translate(270 112) scale(.68)">
      ${CHARACTER_ART.tavi}
    </g>
  </svg>`;
}
