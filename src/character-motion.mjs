/** Articulated, time-independent poses shared by all lesson players. */
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const finite = (value, fallback = 0) => (Number.isFinite(value) ? value : fallback);
const number = (value) => Math.round(value * 1000) / 1000;
const translate = (x, y) => `translate(${number(x)} ${number(y)})`;
const rotate = (angle, x, y) => `rotate(${number(angle)} ${x} ${y})`;

/**
 * Gait is distance-derived radians; the other channels are normalized pose weights.
 * Ground-plane movement belongs to the controller. Facing mirrors this sprite only:
 * a character travelling up the arena stays upright instead of rotating like a token.
 */
export function createCharacterAnimator(element, kind = 'tavi') {
  const boss = kind === 'kern' || kind === 'boss';
  const parts = Object.fromEntries(
    Array.from(element.querySelectorAll('[data-rig-part]'), (part) => [part.dataset.rigPart, part]),
  );
  const transform = (name, value) => parts[name]?.setAttribute('transform', value);

  return function render(motion = {}, facing = 0) {
    const gait = finite(motion.gait);
    const stride = clamp(finite(motion.stride), 0, 1);
    const lean = clamp(finite(motion.lean), -1, 1);
    const crouch = clamp(finite(motion.crouch), 0, 1);
    const lift = clamp(finite(motion.lift), 0, 1);
    const altitude = clamp(finite(motion.altitude), 0, 300);
    const attack = clamp(finite(motion.attack), 0, 1);
    const impact = clamp(finite(motion.impact), 0, 1);
    const dodge = clamp(finite(motion.dodge), 0, 1);
    const angle = ((((finite(facing) + 180) % 360) + 360) % 360) - 180;
    const radians = (angle * Math.PI) / 180;
    const rearProgress = clamp((-Math.sin(radians) - 0.4) / 0.45, 0, 1);
    const rear = rearProgress * rearProgress * (3 - 2 * rearProgress);
    const orientation = Math.abs(angle) > 100 ? -1 : 1;
    const width = 0.9 + 0.1 * Math.abs(Math.cos(radians));
    const step = Math.sin(gait) * stride;
    const counterStep = Math.sin(gait + Math.PI) * stride;
    const bob = (1 - Math.cos(gait * 2)) * stride * (boss ? 1.25 : 1.7);
    const compression = crouch * (boss ? 7 : 5) + impact * (boss ? 6 : 4);
    const tilt = lean * (boss ? 9 : 12) + dodge * 15 - impact * 5;
    const elevation = lift * (boss ? 28 : 23);
    const reach = boss ? 8 : 10;
    const stepX = Math.cos(radians) * orientation * reach;
    const stepY = Math.sin(radians) * reach * 0.65;
    const swing = step * (boss ? 12 : 20);
    const recoil = attack * (boss ? -46 : -64) + impact * (boss ? 51 : 32);

    // Cross-fade the back of the armor/hood as the actor turns up the arena.
    // All layers retain their neutral opacity in the static shared fragments.
    for (const name of ['front-face', 'front-core']) {
      parts[name]?.setAttribute('opacity', String(number(1 - rear)));
    }
    for (const name of ['back-head', 'back-torso', 'rear-cape']) {
      parts[name]?.setAttribute('opacity', String(number(rear)));
    }
    transform('facing', `scale(${number(orientation * width)} 1)`);
    transform('elevation', translate(0, -elevation - altitude));
    transform(
      'shadow',
      `translate(0 ${number(36 * lift * 0.12)}) scale(${number(1 - lift * 0.12 - altitude * 0.0015)} ${number(1 - lift * 0.12 - altitude * 0.0015)})`,
    );
    parts.shadow?.setAttribute('opacity', String(number(1 - lift * 0.32 - altitude * 0.002)));
    transform(
      'body',
      `${translate(lean * 3 + dodge * 3, compression - bob)} ${rotate(tilt, 0, 24)} scale(1 ${number(1 - crouch * 0.055 - impact * 0.04)})`,
    );
    transform(
      'foot-back',
      `${translate(counterStep * stepX - crouch * 2, counterStep * stepY - Math.max(0, counterStep) * (boss ? 5 : 7))} ${rotate(counterStep * 10 + dodge * 8, -12, 22)}`,
    );
    transform(
      'foot-front',
      `${translate(step * stepX + crouch * 2, step * stepY - Math.max(0, step) * (boss ? 5 : 7))} ${rotate(step * 10 - dodge * 13, 12, 22)}`,
    );
    transform('torso', rotate(-attack * 4 + impact * 5, 0, 12));
    transform(
      'head',
      `${translate(attack * 2, Math.sin(radians) * 1.3 + crouch)} ${rotate(-tilt * 0.55 - attack * 7, 0, boss ? -35 : -15)}`,
    );
    transform(
      'arm-back',
      rotate(swing + attack * (boss ? -35 : 25) - dodge * 26, boss ? -31 : -13, boss ? -27 : -7),
    );
    transform('arm-front', rotate(-swing + recoil + dodge * 24, boss ? 31 : 13, boss ? -26 : -7));
    transform('weapon', rotate(-attack * 26 + impact * 18 - dodge * 12, 23, 14));
    transform(
      'cape',
      `${translate(-stride * 2 - dodge * 3, 0)} ${rotate(stride * 9 + step * 4 + dodge * 18 + lean * 5, -13, -15)}`,
    );
    transform(
      'rear-cape',
      `${translate(-stride - dodge * 2, -bob * 0.25)} ${rotate(step * 3 + dodge * 7 + lean * 2, 0, -12)}`,
    );
  };
}
