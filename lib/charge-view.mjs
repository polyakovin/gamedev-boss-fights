import { DURATION, PREVIEW_TIME } from '../src/charge-model.mjs';

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
      <svg
        class="charge-demo__svg"
        data-charge-svg
        viewBox="0 0 960 410"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        <defs>
          <pattern id="charge-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dfd9cb" stroke-width="1" />
          </pattern>
          <pattern
            id="charge-hatch"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <line x1="0" x2="0" y1="0" y2="14" stroke="#bd6553" stroke-width="3" opacity=".18" />
          </pattern>
        </defs>
        <rect x="18" y="18" width="924" height="374" rx="22" fill="#f6f1e7" stroke="#d8d0c2" />
        <rect x="19" y="19" width="922" height="372" rx="21" fill="url(#charge-grid)" />
        <path
          d="M 52 48 h 42 M 52 48 v 24 M 908 48 h -42 M 908 48 v 24 M 52 362 h 42 M 52 362 v -24 M 908 362 h -42 M 908 362 v -24"
          fill="none"
          stroke="#c6beae"
          stroke-width="2"
        />
        <g data-charge-lane transform="translate(180 240)">
          <rect
            x="0"
            y="-49"
            width="640"
            height="98"
            rx="18"
            fill="#bf624c"
            fill-opacity=".13"
            stroke="#b75e4b"
            stroke-opacity=".42"
            stroke-width="2"
            stroke-dasharray="8 7"
          />
          <rect x="0" y="-49" width="640" height="98" rx="18" fill="url(#charge-hatch)" />
          <path
            d="M 105 0 H 598 M 577 -11 L 598 0 L 577 11"
            fill="none"
            stroke="#b45d49"
            stroke-width="2.5"
            stroke-dasharray="6 7"
          />
        </g>
        <g
          data-charge-target
          transform="translate(610 240)"
          fill="none"
          stroke="#ac5646"
          stroke-width="1.8"
          opacity=".8"
        >
          <circle r="24" />
          <path d="M -34 0 h 18 M 16 0 h 18 M 0 -34 v 18 M 0 16 v 18" />
        </g>
        <path
          data-charge-dodge
          d="M 610 218 V 154 M 602 165 L 610 154 L 618 165"
          fill="none"
          stroke="#27786d"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="5 7"
        />
        <g data-charge-boss transform="translate(180 240)">
          ${CHARGE_ART.tank}
          <g
            data-charge-recovery
            visibility="hidden"
            fill="none"
            stroke="#a67742"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M -26 -67 l 7 -10 M -4 -67 v -13 M 18 -66 l 7 -9" />
            <path d="M -43 -67 q -8 -14 0 -22 M 39 -66 q 10 -14 0 -21" opacity=".5" />
          </g>
        </g>
        <g data-charge-player transform="translate(610 114)">
          ${CHARGE_ART.monster}
          <g data-charge-impact visibility="hidden" fill="none" stroke="#ae5140" stroke-width="3">
            <circle r="45" stroke-dasharray="5 9" />
            <path d="M -7 -46 l 8 -9 l 4 9" />
          </g>
        </g>
        <text
          data-charge-boss-label
          x="180"
          y="327"
          text-anchor="middle"
          class="charge-demo__entity-label"
        >
          ${escape(demo.boss)}
        </text>
        <text
          data-charge-player-label
          x="610"
          y="68"
          text-anchor="middle"
          class="charge-demo__entity-label charge-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
        <g data-charge-status transform="translate(458 346)">
          <rect x="-126" y="-17" width="252" height="34" rx="17" fill="#f2e2d7" />
          <text y="5" text-anchor="middle" class="charge-demo__status-label">
            ${escape(demo.locked)}
          </text>
        </g>
      </svg>
    </div>
    <div class="charge-demo__interaction">
      <fieldset class="charge-demo__scenarios">
        <legend class="charge-demo__visually-hidden">${escape(demo.scenario)}</legend>
        <label
          ><input
            type="radio"
            data-charge-scenario
            name="charge-scenario"
            value="sidestep"
            checked
          /><span>${escape(demo.sidestep)}</span></label
        ><label
          ><input type="radio" data-charge-scenario name="charge-scenario" value="retreat" /><span
            >${escape(demo.retreat)}</span
          ></label
        >
      </fieldset>
      <div class="charge-demo__phase-buttons" role="group" aria-label="${escape(demo.step)}">
        ${demo.phaseNames.map((name, index) => `<button type="button" data-charge-phase="${index}" aria-pressed="${index === 1}">${escape(name)}</button>`).join('')}
      </div>
      <p
        class="charge-demo__description"
        data-charge-description
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>${escape(demo.phaseNames[1])}.</strong> ${escape(demo.phaseDescriptions[1])}
      </p>
      <div class="charge-demo__transport">
        <button type="button" class="charge-demo__play" data-charge-play>
          <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M 5 3 L 14 9 L 5 15 Z" /></svg
          ><span>${escape(demo.play)}</span></button
        ><button
          type="button"
          class="charge-demo__restart"
          data-charge-restart
          aria-label="${escape(demo.restart)}"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M 4 6 A 7 7 0 1 1 3 12 M 4 2 V 7 H 9" /></svg
          ><span class="charge-demo__visually-hidden">${escape(demo.restart)}</span></button
        ><label class="charge-demo__timeline"
          ><span class="charge-demo__visually-hidden">${escape(demo.timeline)}</span
          ><input
            type="range"
            data-charge-timeline
            min="0"
            max="${DURATION * 1000}"
            step="10"
            value="${PREVIEW_TIME * 1000}"
          /><output data-charge-time dir="ltr">3.5 / 7.0</output></label
        >
      </div>
      <p class="charge-demo__motion-note" data-charge-motion-note hidden>
        ${escape(demo.reducedMotion)}
      </p>
    </div>
    <script type="application/json" data-charge-config>
      ${json(demo)}
    </script>
  </section>`;
}

export function renderChargeThumbnail(id) {
  return /* HTML */ `<svg viewBox="0 0 360 160">
    <defs>
      <pattern id="g-${escape(id)}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#dbe3dd" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="360" height="160" fill="url(#g-${escape(id)})" />
    <rect x="56" y="59" width="248" height="54" rx="12" fill="#bf624c" fill-opacity=".13" />
    <path d="M 105 86 H 298" stroke="#b45d49" stroke-width="2" stroke-dasharray="6 6" />
    <path
      d="M 250 88 V 65 M 243 72 L 250 65 L 257 72"
      fill="none"
      stroke="#27786d"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dasharray="4 5"
    />
    <g data-charge-preview-boss transform="translate(90 86) scale(.62)">${CHARGE_ART.tank}</g>
    <g data-charge-preview-player transform="translate(250 35) scale(.78)">${CHARGE_ART.monster}</g>
  </svg>`;
}
