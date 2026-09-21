import { PROJECTILE_FAN_ORIGIN } from '../src/projectile-fan-model.mjs';
import { VOLLEY_PROJECTILE_ART } from './gap-volley-view.mjs';

export function renderProjectileFan(plan) {
  return /* HTML */ `<path
      data-projectile-fan-gap
      d="M ${PROJECTILE_FAN_ORIGIN.x} ${PROJECTILE_FAN_ORIGIN.y} L ${plan.safeGap.start.x} ${plan.safeGap.start.y} L ${plan.safeGap.end.x} ${plan.safeGap.end.y} Z"
      fill="var(--accent)"
      fill-opacity=".07"
      stroke="var(--accent)"
      stroke-opacity=".58"
      stroke-width="1.5"
      stroke-dasharray="7 12"
      opacity="${plan.safeGap.opacity}"
    />
    <g data-projectile-fan-warning opacity="${plan.warningOpacity}">
      ${plan.rays
        .map(
          (ray, index) => `<g data-projectile-fan-ray="${index}">
            <path
              d="M ${PROJECTILE_FAN_ORIGIN.x} ${PROJECTILE_FAN_ORIGIN.y} L ${ray.x} ${ray.y}"
              fill="none"
              stroke="var(--signal)"
              stroke-opacity=".32"
              stroke-width="2"
              stroke-dasharray="6 12"
            />
            <circle cx="${ray.x}" cy="${ray.y}" r="5" fill="var(--signal)" fill-opacity=".56" />
          </g>`,
        )
        .join('')}
      <circle
        cx="${PROJECTILE_FAN_ORIGIN.x}"
        cy="${PROJECTILE_FAN_ORIGIN.y}"
        r="28"
        fill="none"
        stroke="var(--signal)"
        stroke-width="3"
        stroke-opacity=".68"
      />
      <circle
        cx="${PROJECTILE_FAN_ORIGIN.x}"
        cy="${PROJECTILE_FAN_ORIGIN.y}"
        r="8"
        fill="var(--signal)"
        fill-opacity=".72"
      />
    </g>
    <g data-projectile-fan-projectiles>
      ${plan.projectiles
        .map(
          (projectile) =>
            `<g data-projectile-fan-projectile="${projectile.id}" transform="translate(${projectile.x} ${projectile.y}) rotate(${projectile.rotation})" opacity="${projectile.opacity}">${VOLLEY_PROJECTILE_ART}</g>`,
        )
        .join('')}
    </g>`;
}
