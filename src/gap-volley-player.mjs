export function createGapVolleyAnimator(element) {
  const gap = element.querySelector('[data-volley-gap]');
  const warning = element.querySelector('[data-volley-warning]');
  const lanes = [...element.querySelectorAll('[data-volley-lane]')];
  const projectiles = new Map(
    [...element.querySelectorAll('[data-volley-projectile]')].map((projectile) => [
      projectile.dataset.volleyProjectile,
      projectile,
    ]),
  );
  return (plan) => {
    if (!plan) return;
    element.dataset.volleyVariant = String(plan.index);
    gap.setAttribute('x', plan.gap.x);
    gap.setAttribute('width', plan.gap.width);
    gap.setAttribute('opacity', plan.gap.opacity);
    warning.setAttribute('opacity', plan.warningOpacity);
    lanes.forEach((lane, index) =>
      lane.setAttribute('opacity', plan.lanes[index].occupied ? 1 : 0),
    );
    for (const shot of plan.projectiles) {
      const projectile = projectiles.get(shot.id);
      projectile.setAttribute(
        'transform',
        `translate(${shot.x} ${shot.y}) rotate(${shot.rotation})`,
      );
      projectile.setAttribute('opacity', shot.opacity);
    }
  };
}
