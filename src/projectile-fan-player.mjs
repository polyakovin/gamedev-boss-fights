export function createProjectileFanAnimator(element) {
  const warning = element.querySelector('[data-projectile-fan-warning]');
  const gap = element.querySelector('[data-projectile-fan-gap]');
  const projectiles = new Map(
    [...element.querySelectorAll('[data-projectile-fan-projectile]')].map((projectile) => [
      projectile.dataset.projectileFanProjectile,
      projectile,
    ]),
  );
  return (plan) => {
    if (!plan) return;
    warning.setAttribute('opacity', plan.warningOpacity);
    gap.setAttribute('opacity', plan.safeGap.opacity);
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
