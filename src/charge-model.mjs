/** The lesson's deterministic simulation, shared by the browser and Node tests. */
export const PHASE_ENDS = Object.freeze([2.4, 3.6, 5.2, 7]);
export const DURATION = PHASE_ENDS[3];
export const PREVIEW_TIME = 3.45;
export const PHASE_TIMES = Object.freeze([1.2, PREVIEW_TIME, 4.4, 6.1]);
export const PLAYER_RADIUS = 34;
export const LANE_HALF_WIDTH = 49;
const BOSS_RADIUS = 52;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const point = (x, y) => Object.freeze({ x, y });

/** Snapshot the target when aiming ends. Later player movement cannot steer it. */
export function createChargePlan({
  origin = { x: 180, y: 240 },
  target = { x: 610, y: 240 },
  distance = 640,
} = {}) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const length = Math.hypot(dx, dy);
  if (
    ![origin.x, origin.y, target.x, target.y, distance].every(Number.isFinite) ||
    length === 0 ||
    distance <= 0
  ) {
    throw new RangeError(
      'A charge needs finite positions, distinct points, and a positive distance.',
    );
  }
  const heading = point(dx / length, dy / length);
  return Object.freeze({
    origin: point(origin.x, origin.y),
    target: point(target.x, target.y),
    heading,
    end: point(origin.x + heading.x * distance, origin.y + heading.y * distance),
    distance,
  });
}

export const DEFAULT_PLAN = createChargePlan();

export function phaseAt(time) {
  const t = clamp(Number.isFinite(time) ? time : 0, 0, DURATION);
  return t < PHASE_ENDS[0] ? 0 : t < PHASE_ENDS[1] ? 1 : t < PHASE_ENDS[2] ? 2 : 3;
}

export function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const along = lengthSquared
    ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared, 0, 1)
    : 0;
  return Math.hypot(p.x - a.x - along * dx, p.y - a.y - along * dy);
}

/** Both choices move after lock. The sidestep clears the entire body and lane. */
export function playerPosition(time, scenario = 'sidestep', plan = DEFAULT_PLAN) {
  if (scenario !== 'sidestep' && scenario !== 'retreat')
    throw new RangeError('Unknown charge scenario.');
  const t = clamp(Number.isFinite(time) ? time : 0, 0, DURATION);
  if (t < PHASE_ENDS[0]) {
    // A small pre-lock movement makes the tracking / locked distinction visible.
    const sway = 14 * Math.sin((Math.PI * t) / PHASE_ENDS[0]);
    return { x: plan.target.x - plan.heading.y * sway, y: plan.target.y + plan.heading.x * sway };
  }
  const progress = smooth((t - PHASE_ENDS[0]) / 0.85);
  const offset =
    scenario === 'sidestep'
      ? { x: plan.heading.y * 126, y: -plan.heading.x * 126 }
      : { x: plan.heading.x * 170, y: plan.heading.y * 170 };
  return { x: plan.target.x + offset.x * progress, y: plan.target.y + offset.y * progress };
}

export function chargeFrame(time, scenario = 'sidestep', plan = DEFAULT_PLAN) {
  const t = clamp(Number.isFinite(time) ? time : 0, 0, DURATION);
  const phase = phaseAt(t);
  const player = playerPosition(t, scenario, plan);
  const chargeProgress = clamp((t - PHASE_ENDS[1]) / (PHASE_ENDS[2] - PHASE_ENDS[1]), 0, 1);
  const boss = {
    x: lerp(plan.origin.x, plan.end.x, chargeProgress),
    y: lerp(plan.origin.y, plan.end.y, chargeProgress),
  };
  const target = phase === 0 ? player : plan.target;
  const targetLength = Math.hypot(target.x - plan.origin.x, target.y - plan.origin.y);
  const heading =
    phase === 0
      ? {
          x: (target.x - plan.origin.x) / targetLength,
          y: (target.y - plan.origin.y) / targetLength,
        }
      : plan.heading;
  // The player finishes the dodge during lock; a swept circle catches collision
  // even when a seek or a slow frame skips straight past the point of impact.
  const hit =
    phase >= 2 && distanceToSegment(player, plan.origin, boss) <= BOSS_RADIUS + PLAYER_RADIUS;
  const clear = distanceToSegment(player, plan.origin, plan.end) > LANE_HALF_WIDTH + PLAYER_RADIUS;
  return {
    time: t,
    phase,
    player,
    boss,
    heading,
    target,
    hit,
    clear,
    chargeProgress,
    finished: t === DURATION,
  };
}
