import { CHARGE_ART } from './charge-view.mjs';
import { PATTERN_DURATION } from '../src/pattern-model.mjs';

const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
const json = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const arena = (id) =>
  /* HTML */ ` <defs>
      <pattern id="pattern-grid-${escape(id)}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--diagram-grid)" stroke-width="1" />
      </pattern>
      <radialGradient id="pattern-danger-${escape(id)}">
        <stop offset="0" stop-color="var(--signal)" stop-opacity=".07" />
        <stop offset="1" stop-color="var(--signal)" stop-opacity=".35" />
      </radialGradient>
    </defs>
    <rect
      x="18"
      y="18"
      width="524"
      height="924"
      rx="22"
      fill="var(--diagram-arena)"
      stroke="var(--diagram-border)"
    />
    <rect x="19" y="19" width="522" height="922" rx="21" fill="url(#pattern-grid-${escape(id)})" />
    <path
      d="M 46 46 h 36 M 46 46 v 24 M 514 46 h -36 M 514 46 v 24 M 46 914 h 36 M 46 914 v -24 M 514 914 h -36 M 514 914 v -24"
      fill="none"
      stroke="var(--diagram-corners)"
      stroke-width="2"
    />`;

const sweepLayer = /* HTML */ `<g data-pattern-sweep opacity="0">
  <path
    d="M 280 275 L 492 142 A 250 250 0 0 1 506 394 Z"
    fill="var(--signal)"
    fill-opacity=".19"
    stroke="var(--signal)"
    stroke-width="3"
  />
  <path d="M 280 275 L 466 158" stroke="var(--paper)" stroke-width="10" stroke-linecap="round" />
  <path d="M 446 171 L 494 139 L 476 189 Z" fill="var(--signal)" />
</g>`;
const slamLayer = /* HTML */ `<g data-pattern-slam opacity="0">
  <circle
    data-pattern-slam-ring
    cx="280"
    cy="275"
    r="58"
    fill="none"
    stroke="var(--signal)"
    stroke-width="22"
    stroke-opacity=".34"
  />
  <circle
    data-pattern-slam-edge
    cx="280"
    cy="275"
    r="58"
    fill="none"
    stroke="var(--signal)"
    stroke-width="3"
  />
</g>`;
const summonLayer = /* HTML */ `<g data-pattern-summon opacity="0">
  <g fill="none" stroke="var(--signal)" stroke-width="3" stroke-dasharray="7 7">
    <ellipse cx="135" cy="465" rx="46" ry="18" /><ellipse
      cx="280"
      cy="515"
      rx="46"
      ry="18"
    /><ellipse cx="425" cy="465" rx="46" ry="18" />
  </g>
  <g data-pattern-minion="0"
    ><circle
      r="25"
      fill="var(--signal)"
      fill-opacity=".23"
      stroke="var(--signal)"
      stroke-width="2" /><path
      d="M -9 -3 l 6 -6 l 4 7 l 7 -6 M -10 8 h 20"
      fill="none"
      stroke="var(--signal)"
      stroke-width="3"
  /></g>
  <g data-pattern-minion="1"
    ><circle
      r="25"
      fill="var(--signal)"
      fill-opacity=".23"
      stroke="var(--signal)"
      stroke-width="2" /><path
      d="M -9 -3 l 6 -6 l 4 7 l 7 -6 M -10 8 h 20"
      fill="none"
      stroke="var(--signal)"
      stroke-width="3"
  /></g>
  <g data-pattern-minion="2"
    ><circle
      r="25"
      fill="var(--signal)"
      fill-opacity=".23"
      stroke="var(--signal)"
      stroke-width="2" /><path
      d="M -9 -3 l 6 -6 l 4 7 l 7 -6 M -10 8 h 20"
      fill="none"
      stroke="var(--signal)"
      stroke-width="3"
  /></g>
</g>`;
const projectile = (x, y) =>
  `<path transform="translate(${x} ${y})" d="M 0 -18 L 11 8 L 0 18 L -11 8 Z" fill="var(--signal)" stroke="var(--paper)" stroke-opacity=".45" />`;
const volleyLayer = /* HTML */ `<g data-pattern-volley opacity="0">
  <rect
    x="238"
    y="220"
    width="84"
    height="650"
    rx="18"
    fill="var(--accent)"
    fill-opacity=".07"
    stroke="var(--accent)"
    stroke-opacity=".45"
    stroke-dasharray="8 8"
  />
  <g data-pattern-projectiles
    >${[80, 160, 400, 480].flatMap((x) => [0, 120, 240].map((y) => projectile(x, y))).join('')}</g
  >
</g>`;

export function renderPattern(demo, kind) {
  const id = `full-${kind}`;
  return /* HTML */ `<section
    class="pattern-demo"
    data-pattern-demo
    data-pattern-kind="${escape(kind)}"
    aria-label="${escape(demo.title)}"
  >
    <div class="pattern-demo__canvas">
      <div class="pattern-demo__scene-timeline">
        <span
          class="pattern-demo__phase-label"
          data-pattern-current-phase
          tabindex="0"
          aria-current="step"
          aria-describedby="pattern-phase-tooltip-${escape(kind)}"
          ><span data-pattern-phase-name>${escape(demo.phaseNames[0])}</span
          ><span
            class="pattern-demo__phase-tooltip"
            id="pattern-phase-tooltip-${escape(kind)}"
            data-pattern-phase-tooltip
            role="tooltip"
            >${escape(demo.phaseDescriptions[0])}</span
          ></span
        >
        <label class="pattern-demo__timeline"
          ><span class="pattern-demo__visually-hidden">${escape(demo.timeline)}</span
          ><input
            type="range"
            data-pattern-timeline
            min="0"
            max="${PATTERN_DURATION * 1000}"
            step="10"
            value="0"
        /></label>
      </div>
      <svg
        class="pattern-demo__svg"
        data-pattern-svg
        viewBox="0 0 560 960"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        ${arena(id)}${sweepLayer}${slamLayer}${summonLayer}${volleyLayer}
        <g data-pattern-boss transform="translate(280 275)">${CHARGE_ART.tank}</g>
        <g data-pattern-player transform="translate(390 700)">${CHARGE_ART.monster}</g>
        <text
          data-pattern-boss-label
          x="280"
          y="355"
          text-anchor="middle"
          class="pattern-demo__entity-label"
        >
          ${escape(demo.boss)}
        </text>
        <text
          data-pattern-player-label
          x="390"
          y="650"
          text-anchor="middle"
          class="pattern-demo__entity-label pattern-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
      </svg>
    </div>
    <p
      class="pattern-demo__visually-hidden"
      data-pattern-status
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      ${escape(demo.danger)}
    </p>
    <p class="pattern-demo__motion-note" data-pattern-motion-note hidden>
      ${escape(demo.reducedMotion)}
    </p>
    <script type="application/json" data-pattern-config>
      ${json(demo)}
    </script>
  </section>`;
}

export function renderPatternThumbnail(kind, id) {
  const layer =
    kind === 'sweep'
      ? `<path d="M 103 79 L 217 24 A 126 126 0 0 1 230 119 Z" fill="var(--signal)" fill-opacity=".2" stroke="var(--signal)" stroke-width="2" />`
      : kind === 'ground-slam'
        ? `<circle cx="108" cy="80" r="62" fill="none" stroke="var(--signal)" stroke-opacity=".35" stroke-width="13" /><circle cx="108" cy="80" r="62" fill="none" stroke="var(--signal)" stroke-width="2" />`
        : kind === 'summon'
          ? `<g fill="var(--signal)" fill-opacity=".24" stroke="var(--signal)"><circle cx="205" cy="45" r="14"/><circle cx="250" cy="89" r="14"/><circle cx="205" cy="130" r="14"/></g>`
          : `<path d="M 195 15 V 145 M 285 15 V 145" stroke="var(--accent)" stroke-opacity=".35" stroke-dasharray="5 5" />${[175, 305].flatMap((x) => [30, 70, 110].map((y) => `<circle cx="${x}" cy="${y}" r="7" fill="var(--signal)" />`)).join('')}`;
  return /* HTML */ `<svg viewBox="0 0 360 160" data-pattern-preview="${escape(kind)}">
    <defs>
      <pattern
        id="pattern-preview-${escape(id)}"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 24 0 L 0 0 0 24"
          fill="none"
          stroke="var(--diagram-preview-grid)"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect width="360" height="160" fill="url(#pattern-preview-${escape(id)})" />
    ${layer}
    <g data-charge-art-preview="tank" transform="translate(105 80) scale(.55)">
      ${CHARGE_ART.tank}
    </g>
    <g data-charge-art-preview="monster" transform="translate(270 116) scale(.7)">
      ${CHARGE_ART.monster}
    </g>
  </svg>`;
}
