import { escape } from './html.mjs';

/** A quiet game floor keeps the attack geometry legible without a diagram grid. */
export function renderEncounterArena(id, { minimal = false } = {}) {
  const key = escape(id);
  const stones = Array.from({ length: 14 }, (_, row) =>
    Array.from({ length: 6 }, (_, column) => {
      const x = column * 104 - (row % 2) * 52;
      const y = row * 68;
      return `<rect x="${x + 3}" y="${y + 3}" width="98" height="62" rx="5" fill="${(row + column) % 3 === 0 ? '#354443' : '#2d3b3b'}"${minimal ? '' : ' stroke="#465350" stroke-opacity=".32"'} />`;
    }).join(''),
  ).join('');
  return /* HTML */ `<defs>
      <radialGradient id="encounter-light-${key}" cx="50%" cy="43%" r="68%">
        <stop offset="0" stop-color="#203b36" stop-opacity="0" />
        <stop offset="1" stop-color="#071315" stop-opacity=".92" />
      </radialGradient>
      <clipPath id="encounter-floor-${key}"><rect width="560" height="960" rx="20" /></clipPath>
    </defs>
    <g aria-hidden="true" clip-path="url(#encounter-floor-${key})">
      <rect width="560" height="960" fill="#263434" />
      <g opacity=".65">${stones}</g>
      ${
        minimal
          ? ''
          : `<g fill="none" stroke="#8b9c82" opacity=".1">
        <circle cx="280" cy="475" r="205" stroke-width="3" />
        <circle cx="280" cy="475" r="192" />
        <path d="M 280 258 V 280 M 280 670 V 692 M 66 475 H 86 M 474 475 H 496" stroke-width="4" />
      </g>`
      }
      ${
        minimal
          ? ''
          : `<path
        d="M 52 169 l 18 12 -5 19 12 8 M 469 326 l -20 16 7 19 -13 13 M 75 739 l 17 -10 -3 -20 M 458 796 l -12 -15 8 -18"
        fill="none"
        stroke="#142322"
        stroke-width="3"
      />`
      }
      <rect width="560" height="960" fill="url(#encounter-light-${key})" />
      ${
        minimal
          ? ''
          : `<path d="M 15 104 V 856 M 545 104 V 856" stroke="#81988d" stroke-width="2" opacity=".15" />
      <g fill="#b9ddc6" opacity=".48">
        <path
          d="M 15 253 l 4 7 -4 7 -4 -7 Z M 545 253 l 4 7 -4 7 -4 -7 Z M 15 693 l 4 7 -4 7 -4 -7 Z M 545 693 l 4 7 -4 7 -4 -7 Z"
        />
      </g>`
      }
    </g>`;
}

export function renderEncounterEffects() {
  return /* HTML */ `<g data-encounter-effects aria-hidden="true" pointer-events="none">
    ${['boss', 'player'].map((role) => `<g data-encounter-dust="${role}" fill="#c1b99a">${Array.from({ length: 10 }, () => '<ellipse rx="4" ry="2" opacity="0" />').join('')}</g>`).join('')}
    <g data-encounter-impact opacity="0" fill="none" stroke="#f9d3a1" stroke-linecap="round">
      <ellipse rx="52" ry="18" stroke-width="3" />
      <path
        d="M -23 -12 l -16 -14 M 23 -12 l 16 -14 M -39 1 l -22 -2 M 39 1 l 22 -2 M -26 14 l -14 9 M 26 14 l 14 9"
        stroke-width="4"
      />
    </g>
  </g>`;
}
