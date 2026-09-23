import { BOSS_LABEL_OFFSET_Y, DEFAULT_PLAN, DURATION } from '../src/charge-model.mjs';
import { CHARACTER_ART } from './character-art.mjs';
import { renderEncounterArena, renderEncounterEffects } from './encounter-view.mjs';

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

/** All visible words come from the page's locale; this is useful without JS. */
export function renderCharge(demo) {
  return /* HTML */ `<section
    class="charge-demo"
    data-charge-demo
    aria-label="${escape(demo.title)}"
    tabindex="0"
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
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        <defs>
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
        ${renderEncounterArena('charge')}
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
        ${renderEncounterEffects()}
        <circle
          data-charge-contact
          r="82"
          fill="var(--signal)"
          fill-opacity=".12"
          stroke="var(--signal)"
          stroke-opacity=".7"
          stroke-width="2"
          opacity="0"
          pointer-events="none"
        />
        <g data-charge-strike opacity="0" pointer-events="none">
          <circle
            r="135"
            fill="none"
            stroke="var(--accent)"
            stroke-width="4"
            stroke-dasharray="46 15"
          />
        </g>
        <g data-charge-hit opacity="0" pointer-events="none">
          <circle r="47" fill="none" stroke="var(--signal)" stroke-width="5" />
        </g>
        <g data-charge-boss transform="translate(280 155)">${CHARACTER_ART.kern}</g>
        <g data-charge-player transform="translate(280 480)">${CHARACTER_ART.tavi}</g>
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
          y="418"
          text-anchor="middle"
          class="charge-demo__entity-label charge-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
      </svg>
      <div class="charge-demo__joystick" data-charge-joystick aria-hidden="true" hidden>
        <span class="charge-demo__joystick-track"></span>
        <span class="charge-demo__joystick-handle" data-charge-joystick-handle></span>
      </div>
      <button class="charge-demo__touch-attack" type="button" data-charge-touch-attack>
        ${escape(demo.gameTouchAttack ?? '')}
      </button>
    </div>
    <div class="charge-demo__game-bar">
      <p data-charge-game-message>${escape(demo.gamePrompt ?? '')}</p>
      <p data-charge-game-controls>
        <span class="charge-demo__keyboard-copy">${escape(demo.gameControls ?? '')}</span>
        <span class="charge-demo__touch-copy">${escape(demo.gameTouchControls ?? '')}</span>
      </p>
      <div class="charge-demo__game-score" data-charge-game-score hidden>
        <span
          >${escape(demo.gamePlayerHealth ?? '')}:
          <strong data-charge-player-health>3</strong></span
        >
        <span
          >${escape(demo.gameBossHealth ?? '')}: <strong data-charge-boss-health>3</strong></span
        >
      </div>
      <button type="button" data-charge-touch-toggle>${escape(demo.gameTouchStart ?? '')}</button>
      <button type="button" data-charge-restart hidden>${escape(demo.gameRestart ?? '')}</button>
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
    <g data-charge-preview-boss transform="translate(90 86) scale(.62)">${CHARACTER_ART.kern}</g>
    <g data-charge-preview-player transform="translate(250 35) scale(.78)">${CHARACTER_ART.tavi}</g>
  </svg>`;
}
