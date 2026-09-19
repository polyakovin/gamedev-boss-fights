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

/** All visible words come from the page's locale; this is useful without JS. */
export function renderCharge(demo) {
  return /* HTML */ `<section
    class="charge-demo"
    data-charge-demo
    aria-label="${escape(demo.title)}"
  >
    <div class="charge-demo__heading">
      <span class="charge-demo__eyebrow" aria-hidden="true">01 — 04</span>
      <h2>${escape(demo.title)}</h2>
      <p>${escape(demo.intro)}</p>
    </div>
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
          <circle r="48" fill="#c88e51" stroke="#7d5838" stroke-width="4" />
          <path
            d="M -12 -20 L 11 0 L -12 20 M 10 -20 L 33 0 L 10 20"
            fill="none"
            stroke="#fff4d8"
            stroke-width="7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
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
          <circle r="31" fill="#438c7b" stroke="#205e55" stroke-width="4" />
          <circle r="11" fill="#f3f6e9" />
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
      <div class="charge-demo__legend" aria-hidden="true">
        <span><i class="charge-demo__key charge-demo__key--boss"></i>${escape(demo.boss)}</span
        ><span><i class="charge-demo__key charge-demo__key--player"></i>${escape(demo.player)}</span
        ><span
          ><i class="charge-demo__key charge-demo__key--danger"></i>${escape(demo.danger)}</span
        >
      </div>
    </div>
    <div class="charge-demo__interaction">
      <fieldset class="charge-demo__scenarios">
        <legend>${escape(demo.scenario)}</legend>
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
        ${demo.phaseNames.map((name, index) => `<button type="button" data-charge-phase="${index}" aria-pressed="${index === 1}"><span aria-hidden="true">0${index + 1}</span>${escape(name)}</button>`).join('')}
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
          ><span>${escape(demo.restart)}</span></button
        ><label class="charge-demo__speed"
          >${escape(demo.speed)}<input
            type="range"
            data-charge-speed
            min="0.5"
            max="1.5"
            step="0.25"
            value="1"
          /><output data-charge-speed-value dir="ltr">1×</output></label
        >
      </div>
      <label class="charge-demo__timeline"
        ><span>${escape(demo.timeline)}</span
        ><input
          type="range"
          data-charge-timeline
          min="0"
          max="${DURATION * 1000}"
          step="10"
          value="${PREVIEW_TIME * 1000}"
        /><output data-charge-time dir="ltr">3.5 / 7.0</output></label
      >
      <p class="charge-demo__note">${escape(demo.overlayNote)}</p>
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
    <rect x="75" y="63" width="230" height="38" rx="8" fill="#f2d5c6" />
    <path d="M100 82H302" stroke="#b45436" stroke-width="2" stroke-dasharray="6 6" />
    <path d="M205 81V29m-8 8 8-8 8 8" fill="none" stroke="#17756b" stroke-width="3" />
    <circle cx="90" cy="82" r="28" fill="#c48440" stroke="#7d5838" stroke-width="3" />
    <path
      d="M82 70l14 12-14 12m13-24 14 12-14 12"
      fill="none"
      stroke="#fff4d8"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="205" cy="31" r="16" fill="#17756b" />
    <circle cx="205" cy="31" r="6" fill="#eef4e9" />
  </svg>`;
}
