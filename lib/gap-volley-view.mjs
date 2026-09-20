// Original projectile artwork shared by the lesson and its catalog preview.
// The leading point is +y; the model supplies the travel rotation.
export const VOLLEY_PROJECTILE_ART = /* HTML */ `<g data-volley-projectile-art>
  <path d="M 0 -34 L 8 0 L 0 11 L -8 0 Z" fill="var(--signal)" opacity=".24" />
  <circle r="10" fill="var(--signal)" opacity=".18" />
  <path d="M 0 -9 L 6 1 L 0 9 L -6 1 Z" fill="#ffe6bd" />
</g>`;

export function renderGapVolley(plan) {
  return /* HTML */ `<g data-volley-warning opacity="${plan.warningOpacity}">
      ${plan.lanes
        .map(
          (lane, index) => `<g data-volley-lane="${index}" opacity="${lane.occupied ? 1 : 0}">
            <path d="M ${lane.x} 260 V 870" fill="none" stroke="var(--signal)" stroke-opacity=".2" stroke-width="1.5" stroke-dasharray="5 13" />
            <path d="M ${lane.x - 11} 254 V 262 H ${lane.x + 11} V 254" fill="none" stroke="var(--signal)" stroke-opacity=".6" stroke-width="2" stroke-linecap="round" />
          </g>`,
        )
        .join('')}
    </g>
    <rect
      data-volley-gap
      x="${plan.gap.x}"
      y="260"
      width="${plan.gap.width}"
      height="610"
      rx="14"
      fill="var(--accent)"
      fill-opacity=".025"
      stroke="var(--accent)"
      stroke-opacity=".4"
      stroke-width="1.5"
      stroke-dasharray="7 12"
      opacity="${plan.gap.opacity}"
    />
    <g data-pattern-projectiles>
      ${plan.projectiles
        .map(
          (projectile) =>
            `<g data-volley-projectile="${projectile.id}" transform="translate(${projectile.x} ${projectile.y}) rotate(${projectile.rotation})" opacity="${projectile.opacity}">${VOLLEY_PROJECTILE_ART}</g>`,
        )
        .join('')}
    </g>`;
}
