import { BOSS_LABEL_OFFSET_Y, DEFAULT_PLAN, DURATION } from '../src/charge-model.mjs';

const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
const json = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

// The lesson and its catalog preview insert these exact SVG fragments.
export const CHARGE_ART = Object.freeze({
  tank: /* HTML */ `<g data-charge-art="tank">
    <ellipse cx="0" cy="14" rx="81" ry="49" fill="#a7855d" opacity=".18" />
    <g fill="#635f56" stroke="#484940" stroke-width="2">
      <rect x="-64" y="-46" width="125" height="26" rx="12" />
      <rect x="-64" y="22" width="125" height="26" rx="12" />
    </g>
    <path
      d="M -49 -44 v 20 M -28 -44 v 20 M -7 -44 v 20 M 14 -44 v 20 M 35 -44 v 20 M -49 24 v 20 M -28 24 v 20 M -7 24 v 20 M 14 24 v 20 M 35 24 v 20"
      stroke="#a69b83"
      stroke-width="3"
    />
    <path
      d="M -54 -25 Q -54 -33 -42 -33 H 42 L 65 -15 V 20 L 44 34 H -43 Q -54 34 -54 25 Z"
      fill="#c88e51"
      stroke="#886143"
      stroke-width="2.5"
    />
    <path d="M -45 -24 H 36 L 51 -12 H -45 Z" fill="#e3b477" />
    <rect
      x="-29"
      y="-25"
      width="60"
      height="50"
      rx="19"
      fill="#db9b56"
      stroke="#8b6342"
      stroke-width="2.5"
    />
    <path d="M 17 -8 H 82 V 9 H 17" fill="#827563" stroke="#5c584c" stroke-width="2.5" />
    <path d="M 74 -12 H 89 V 13 H 74 Z" fill="#5f6357" stroke="#484f44" stroke-width="2" />
    <ellipse cx="-9" cy="-13" rx="17" ry="14" fill="#625e4c" />
    <path
      d="M -24 -10 Q -23 -29 -10 -30 Q 6 -30 7 -11"
      fill="#6c7766"
      stroke="#454f45"
      stroke-width="2"
    />
    <path d="M -20 -18 Q -9 -23 2 -18 L 0 -9 Q -9 -2 -18 -9 Z" fill="#e7c9a0" />
    <path d="M -20 -18 H 2" stroke="#4c564c" stroke-width="4" />
    <circle cx="-34" cy="16" r="3" fill="#f3d799" />
    <circle cx="41" cy="19" r="3" fill="#f3d799" />
  </g>`,
  monster: /* HTML */ `<g data-charge-art="monster">
    <ellipse cx="0" cy="26" rx="33" ry="11" fill="#266e66" opacity=".16" />
    <path
      d="M -22 1 L -34 17 L -31 23 L -17 15 M 22 1 L 34 17 L 31 23 L 17 15"
      fill="#28766a"
      stroke="#205e55"
      stroke-width="2"
    />
    <path
      d="M -21 10 L -24 29 Q -15 35 -5 28 L -4 13 M 21 10 L 24 29 Q 15 35 5 28 L 4 13"
      fill="#24685f"
      stroke="#205e55"
      stroke-width="2"
    />
    <path
      d="M -22 -15 L -32 -26 L -28 -5 L -23 3 Q -20 20 0 22 Q 20 20 23 3 L 28 -5 L 32 -26 L 22 -15 L 15 -25 L 10 -17 L 0 -26 L -10 -17 L -15 -25 Z"
      fill="#438c7b"
      stroke="#205e55"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path d="M -13 -5 Q 0 4 13 -5 L 9 7 Q 0 15 -9 7 Z" fill="#70aa91" />
    <path d="M -17 -10 L -4 -6 L -11 -1 Z M 17 -10 L 4 -6 L 11 -1 Z" fill="#faf0cc" />
    <circle cx="-9" cy="-6" r="2" fill="#254f48" />
    <circle cx="9" cy="-6" r="2" fill="#254f48" />
    <path d="M -8 12 L -5 6 L -2 12 M 8 12 L 5 6 L 2 12" fill="#f3e9c6" />
  </g>`,
});

/** All visible words come from the page's locale; this is useful without JS. */
export function renderCharge(demo) {
  return /* HTML */ `<section
    class="charge-demo"
    data-charge-demo
    aria-label="${escape(demo.title)}"
  >
    <div class="charge-demo__canvas">
      <div class="charge-demo__scene-timeline">
        <span
          class="charge-demo__phase-label"
          data-charge-current-phase
          tabindex="0"
          aria-current="step"
          aria-describedby="charge-phase-tooltip"
          ><span data-charge-phase-name>${escape(demo.phaseNames[0])}</span
          ><span
            class="charge-demo__phase-tooltip"
            id="charge-phase-tooltip"
            data-charge-phase-tooltip
            role="tooltip"
            >${escape(demo.phaseDescriptions[0])}</span
          ></span
        >
        <label class="charge-demo__timeline"
          ><span class="charge-demo__visually-hidden">${escape(demo.timeline)}</span
          ><input
            type="range"
            data-charge-timeline
            min="0"
            max="${DURATION * 1000}"
            step="10"
            value="0"
        /></label>
      </div>
      <svg
        class="charge-demo__svg"
        data-charge-svg
        viewBox="0 0 560 960"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        <defs>
          <pattern id="charge-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--diagram-grid)" stroke-width="1" />
          </pattern>
          <pattern
            id="charge-hatch"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line
              x1="0"
              x2="0"
              y1="0"
              y2="14"
              stroke="var(--signal)"
              stroke-width="3"
              opacity=".18"
            />
          </pattern>
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
        <rect x="19" y="19" width="522" height="922" rx="21" fill="url(#charge-grid)" />
        <path
          d="M 46 46 h 36 M 46 46 v 24 M 514 46 h -36 M 514 46 v 24 M 46 914 h 36 M 46 914 v -24 M 514 914 h -36 M 514 914 v -24"
          fill="none"
          stroke="var(--diagram-corners)"
          stroke-width="2"
        />
        <g data-charge-lane transform="translate(280 155) rotate(90)">
          <rect
            x="0"
            y="-49"
            width="${DEFAULT_PLAN.distance}"
            height="98"
            rx="18"
            fill="var(--signal)"
            fill-opacity=".13"
            stroke="var(--signal)"
            stroke-opacity=".42"
            stroke-width="2"
            stroke-dasharray="8 7"
          />
          <rect
            x="0"
            y="-49"
            width="${DEFAULT_PLAN.distance}"
            height="98"
            rx="18"
            fill="url(#charge-hatch)"
          />
          <path
            d="M 65 0 H ${DEFAULT_PLAN.distance - 25} M ${DEFAULT_PLAN.distance - 44} -11 L ${DEFAULT_PLAN.distance - 25} 0 L ${DEFAULT_PLAN.distance - 44} 11"
            fill="none"
            stroke="var(--signal)"
            stroke-width="2.5"
            stroke-dasharray="6 7"
          />
        </g>
        <g
          data-charge-target
          transform="translate(280 480)"
          fill="none"
          stroke="var(--signal)"
          stroke-width="1.8"
          opacity=".8"
        >
          <circle r="24" />
          <path d="M -34 0 h 18 M 16 0 h 18 M 0 -34 v 18 M 0 16 v 18" />
        </g>
        <path
          data-charge-dodge
          d="M 280 480 H 154 M 165 472 L 154 480 L 165 488"
          fill="none"
          stroke="var(--accent)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="5 7"
        />
        <g data-charge-boss transform="translate(280 155) rotate(90)">${CHARGE_ART.tank}</g>
        <g data-charge-player transform="translate(280 480)">${CHARGE_ART.monster}</g>
        <text
          data-charge-boss-label
          x="280"
          y="${155 + BOSS_LABEL_OFFSET_Y}"
          text-anchor="middle"
          class="charge-demo__entity-label"
        >
          ${escape(demo.boss)}
        </text>
        <text
          data-charge-player-label
          x="280"
          y="433"
          text-anchor="middle"
          class="charge-demo__entity-label charge-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
      </svg>
    </div>
    <p
      class="charge-demo__visually-hidden"
      data-charge-status
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      ${escape(demo.danger)}
    </p>
    <p class="charge-demo__motion-note" data-charge-motion-note hidden>
      ${escape(demo.reducedMotion)}
    </p>
    <script type="application/json" data-charge-config>
      ${json(demo)}
    </script>
  </section>`;
}

export function renderChargeThumbnail(id) {
  return /* HTML */ `<svg viewBox="0 0 360 160">
    <defs>
      <pattern id="g-${escape(id)}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M 24 0 L 0 0 0 24"
          fill="none"
          stroke="var(--diagram-preview-grid)"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect width="360" height="160" fill="url(#g-${escape(id)})" />
    <rect x="56" y="59" width="248" height="54" rx="12" fill="var(--signal)" fill-opacity=".13" />
    <path d="M 105 86 H 298" stroke="var(--signal)" stroke-width="2" stroke-dasharray="6 6" />
    <path
      d="M 250 88 V 65 M 243 72 L 250 65 L 257 72"
      fill="none"
      stroke="var(--accent)"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dasharray="4 5"
    />
    <g data-charge-preview-boss transform="translate(90 86) scale(.62)">${CHARGE_ART.tank}</g>
    <g data-charge-preview-player transform="translate(250 35) scale(.78)">${CHARGE_ART.monster}</g>
  </svg>`;
}
