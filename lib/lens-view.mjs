import { escape as e } from './html.mjs';

const FRAME = /* HTML */ `<rect
  class="lens-visual__frame"
  x="1"
  y="1"
  width="638"
  height="358"
  rx="28"
/>`;

const diagrams = {
  telegraphing: /* HTML */ ` ${FRAME}
    <g class="lens-visual__grid">
      <path d="M 74 88 H 566 M 74 180 H 566 M 74 272 H 566" />
      <path d="M 160 56 V 304 M 320 56 V 304 M 480 56 V 304" />
    </g>
    <g class="lens-visual__pulse" transform="translate(104 180)">
      <circle class="lens-visual__signal-fill" r="25" />
      <circle class="lens-visual__signal-line" r="43" />
      <circle class="lens-visual__signal-line lens-visual__pulse-ring" r="64" />
      <path class="lens-visual__ink-line" d="M -8 -3 H 8 M 0 -11 V 5" />
    </g>
    <path class="lens-visual__muted-line" d="M 176 180 H 514" />
    <path class="lens-visual__accent-line lens-visual__timeline-fill" d="M 176 180 H 514" />
    <g class="lens-visual__beats">
      <circle cx="238" cy="180" r="8" />
      <circle cx="332" cy="180" r="8" />
      <circle cx="426" cy="180" r="8" />
    </g>
    <g class="lens-visual__result" transform="translate(548 180)">
      <path class="lens-visual__signal-fill" d="M -37 -42 H 37 V 42 H -37 Z" />
      <path class="lens-visual__signal-line" d="M -24 -28 L 24 28 M 24 -28 L -24 28" />
    </g>`,
  commitment: /* HTML */ ` ${FRAME}
    <g class="lens-visual__grid">
      <path d="M 74 88 H 566 M 74 180 H 566 M 74 272 H 566" />
      <path d="M 160 56 V 304 M 320 56 V 304 M 480 56 V 304" />
    </g>
    <circle class="lens-visual__node" cx="92" cy="180" r="26" />
    <path class="lens-visual__muted-line" d="M 118 180 C 214 180 210 88 304 88 H 540" />
    <path class="lens-visual__muted-line" d="M 118 180 H 540" />
    <path class="lens-visual__muted-line" d="M 118 180 C 214 180 210 272 304 272 H 540" />
    <g class="lens-visual__unused-options">
      <circle class="lens-visual__node" cx="552" cy="88" r="19" />
      <circle class="lens-visual__node" cx="552" cy="272" r="19" />
    </g>
    <path class="lens-visual__accent-line lens-visual__chosen-path" d="M 118 180 H 540" />
    <g class="lens-visual__lock" transform="translate(320 180)">
      <rect class="lens-visual__accent-fill" x="-26" y="-20" width="52" height="43" rx="8" />
      <path class="lens-visual__accent-line" d="M -14 -20 V -34 A 14 14 0 0 1 14 -34 V -20" />
      <circle class="lens-visual__paper-fill" cy="1" r="5" />
    </g>
    <circle
      class="lens-visual__signal-fill lens-visual__committed-result"
      cx="552"
      cy="180"
      r="25"
    />`,
  'threat-geometry': /* HTML */ ` ${FRAME}
    <rect class="lens-visual__arena" x="67" y="50" width="506" height="260" rx="22" />
    <g class="lens-visual__grid lens-visual__grid--arena">
      <path d="M 151 50 V 310 M 235 50 V 310 M 319 50 V 310 M 403 50 V 310 M 487 50 V 310" />
      <path d="M 67 115 H 573 M 67 180 H 573 M 67 245 H 573" />
    </g>
    <path
      class="lens-visual__safe-zone"
      d="M 86 69 H 205 V 291 H 86 Z M 435 69 H 554 V 291 H 435 Z"
    />
    <g class="lens-visual__threat-band">
      <rect class="lens-visual__signal-fill" x="217" y="51" width="206" height="258" rx="16" />
      <path
        class="lens-visual__signal-line"
        d="M 243 75 L 397 285 M 289 75 L 423 258 M 217 130 L 335 291"
      />
    </g>
    <g transform="translate(320 180)">
      <g class="lens-visual__player-footprint">
        <circle class="lens-visual__paper-fill" r="30" />
        <circle class="lens-visual__accent-line" r="42" />
        <path class="lens-visual__ink-line" d="M -9 0 H 9 M 0 -9 V 9" />
      </g>
    </g>
    <path class="lens-visual__escape-arrow" d="M 278 180 H 143 M 160 162 L 142 180 L 160 198" />`,
  counterplay: /* HTML */ ` ${FRAME}
    <g class="lens-visual__grid">
      <path d="M 74 88 H 566 M 74 180 H 566 M 74 272 H 566" />
      <path d="M 160 56 V 304 M 320 56 V 304 M 480 56 V 304" />
    </g>
    <g transform="translate(92 180)">
      <circle class="lens-visual__accent-fill" r="26" />
      <path class="lens-visual__paper-line" d="M -9 0 H 9 M 0 -9 V 9" />
    </g>
    <g class="lens-visual__challenge" transform="translate(320 180)">
      <path
        class="lens-visual__signal-fill"
        d="M -38 -54 H 38 L 50 -30 V 30 L 38 54 H -38 L -50 30 V -30 Z"
      />
      <path class="lens-visual__signal-line" d="M 0 -28 V 10 M 0 27 V 29" />
    </g>
    <path
      class="lens-visual__response-path lens-visual__response-path--top"
      d="M 118 180 C 180 180 204 88 286 88 C 408 88 412 180 522 180"
    />
    <path
      class="lens-visual__response-path lens-visual__response-path--bottom"
      d="M 118 180 C 180 180 204 272 286 272 C 408 272 412 180 522 180"
    />
    <g class="lens-visual__tool" transform="translate(263 91)">
      <path class="lens-visual__accent-line" d="M -14 7 L 0 -11 L 14 7 M 0 -11 V 14" />
    </g>
    <g class="lens-visual__tool" transform="translate(263 269)">
      <path class="lens-visual__accent-line" d="M -16 -12 H 16 V 12 H -16 Z M -8 -4 H 8" />
    </g>
    <g transform="translate(548 180)">
      <circle class="lens-visual__node" r="28" />
      <path class="lens-visual__accent-line" d="M -13 1 L -3 12 L 15 -12" />
    </g>`,
  'risk-reward': /* HTML */ ` ${FRAME}
    <g class="lens-visual__grid">
      <path d="M 74 88 H 566 M 74 180 H 566 M 74 272 H 566" />
      <path d="M 160 56 V 304 M 320 56 V 304 M 480 56 V 304" />
    </g>
    <path class="lens-visual__muted-line" d="M 320 89 V 144 M 320 216 V 271" />
    <g transform="translate(320 180)">
      <g class="lens-visual__scale">
        <path class="lens-visual__ink-line lens-visual__scale-beam" d="M -184 -23 L 184 23" />
        <path class="lens-visual__ink-fill" d="M -12 -4 H 12 L 27 72 H -27 Z" />
        <circle class="lens-visual__accent-fill" r="15" />
        <g transform="translate(-174 -23)">
          <path class="lens-visual__signal-line" d="M -50 10 H 50 L 35 48 H -35 Z M 0 -37 V 10" />
          <circle class="lens-visual__signal-fill" cy="-53" r="20" />
        </g>
        <g transform="translate(174 23)">
          <path class="lens-visual__accent-line" d="M -50 10 H 50 L 35 48 H -35 Z M 0 -37 V 10" />
          <path class="lens-visual__accent-fill" d="M 0 -69 L 15 -54 L 0 -39 L -15 -54 Z" />
          <path
            class="lens-visual__accent-fill"
            d="M -26 -58 L -17 -49 L -26 -40 L -35 -49 Z M 26 -58 L 35 -49 L 26 -40 L 17 -49 Z"
          />
        </g>
      </g>
    </g>
    <g class="lens-visual__trade-arrows">
      <path class="lens-visual__signal-line" d="M 118 103 H 207 M 190 87 L 207 103 L 190 119" />
      <path class="lens-visual__accent-line" d="M 522 257 H 433 M 450 241 L 433 257 L 450 273" />
    </g>`,
  'mastery-check': /* HTML */ ` ${FRAME}
    <g class="lens-visual__grid">
      <path d="M 74 88 H 566 M 74 180 H 566 M 74 272 H 566" />
      <path d="M 160 56 V 304 M 320 56 V 304 M 480 56 V 304" />
    </g>
    <path class="lens-visual__muted-line" d="M 104 180 H 536" />
    <path class="lens-visual__accent-line lens-visual__learning-progress" d="M 104 180 H 536" />
    <g transform="translate(104 180)">
      <circle class="lens-visual__node" r="34" />
      <circle class="lens-visual__accent-fill" r="12" />
    </g>
    <g transform="translate(248 180)">
      <circle class="lens-visual__node" r="34" />
      <path class="lens-visual__accent-line" d="M -14 8 L 0 -14 L 14 8 Z" />
    </g>
    <g transform="translate(392 180)">
      <circle class="lens-visual__node" r="34" />
      <circle class="lens-visual__accent-line" cx="-9" r="13" />
      <path class="lens-visual__accent-line" d="M 1 -13 L 17 0 L 1 13 Z" />
    </g>
    <g class="lens-visual__test-node" transform="translate(536 180)">
      <circle class="lens-visual__signal-fill" r="40" />
      <path class="lens-visual__signal-line" d="M -18 1 L -5 16 L 20 -18" />
    </g>
    <g class="lens-visual__practice-loop">
      <path class="lens-visual__muted-line" d="M 210 140 C 225 101 271 101 286 140" />
      <path class="lens-visual__muted-line" d="M 275 124 L 287 140 L 267 142" />
    </g>`,
};

export const lensVisualIds = Object.freeze(Object.keys(diagrams));

export function renderLensVisual(id, content, { compact = false } = {}) {
  const diagram = diagrams[id];
  if (!diagram) throw new Error(`Unknown lens visual: ${id}`);
  const label = `${content.title}. ${content.summary}`;
  return /* HTML */ `<figure
    class="lens-visual lens-visual--${id}${compact ? ' lens-visual--compact' : ''}"
    data-lens-visual="${id}"
  >
    <svg
      class="lens-visual__svg"
      viewBox="0 0 640 360"
      ${compact ? 'aria-hidden="true"' : `role="img" aria-label="${e(label)}"`}
      focusable="false"
    >
      ${diagram}
    </svg>
  </figure>`;
}
