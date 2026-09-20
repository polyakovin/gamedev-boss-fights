/** The lesson's deterministic simulation, shared by the browser and Node tests. */
export const PHASE_ENDS = Object.freeze([0.95, 1.65, 3.2]);
export const ATTACK_DURATION = PHASE_ENDS[2];
export const DURATION = ATTACK_DURATION * 2;
export const PLAYER_RADIUS = 34;
export const LANE_HALF_WIDTH = 49;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const point = (x, y) => Object.freeze({ x, y });

/** Snapshot the target when aiming ends. Later player movement cannot steer it. */
export function createChargePlan({
  origin = { x: 280, y: 155 },
  target = { x: 280, y: 350 },
  distance = 390,
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

export const ATTACK_PLANS = Object.freeze([
  createChargePlan(),
  createChargePlan({ origin: { x: 280, y: 545 }, target: { x: 280, y: 350 } }),
]);
export const DEFAULT_PLAN = ATTACK_PLANS[0];

function sequenceAt(time) {
  const t = clamp(Number.isFinite(time) ? time : 0, 0, DURATION);
  const sequenceTime = t === DURATION ? 0 : t;
  const attackIndex = Math.floor(sequenceTime / ATTACK_DURATION);
  return {
    time: t,
    attackIndex,
    localTime: sequenceTime - attackIndex * ATTACK_DURATION,
  };
}

export function phaseAt(time) {
  const { localTime } = sequenceAt(time);
  return localTime < PHASE_ENDS[0] ? 0 : localTime < PHASE_ENDS[1] ? 1 : 2;
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

/** The player stays near center while aiming, then clears the locked lane sideways. */
export function playerPosition(localTime, plan = DEFAULT_PLAN) {
  if (localTime < PHASE_ENDS[0]) {
    const sway = 14 * Math.sin((Math.PI * localTime) / PHASE_ENDS[0]);
    return {
      x: plan.target.x - plan.heading.y * sway,
      y: plan.target.y + plan.heading.x * sway,
    };
  }
  const progress = smooth((localTime - PHASE_ENDS[0]) / (PHASE_ENDS[1] - PHASE_ENDS[0]));
  const offset = { x: -plan.heading.y * 126, y: plan.heading.x * 126 };
  return {
    x: plan.target.x + offset.x * progress,
    y: plan.target.y + offset.y * progress,
  };
}

export function chargeFrame(time, explicitPlan) {
  const sequence = sequenceAt(time);
  const plan = explicitPlan ?? ATTACK_PLANS[sequence.attackIndex];
  const localTime = explicitPlan
    ? sequence.time === DURATION
      ? 0
      : sequence.time % ATTACK_DURATION
    : sequence.localTime;
  const phase = localTime < PHASE_ENDS[0] ? 0 : localTime < PHASE_ENDS[1] ? 1 : 2;
  const player = playerPosition(localTime, plan);
  const chargeProgress = smooth((localTime - PHASE_ENDS[1]) / (ATTACK_DURATION - PHASE_ENDS[1]));
  let boss;
  if (phase === 0) {
    const preparation = 14 * Math.sin((Math.PI * localTime) / PHASE_ENDS[0]);
    boss = {
      x: plan.origin.x + plan.heading.x * preparation,
      y: plan.origin.y + plan.heading.y * preparation,
    };
  } else if (phase === 1) {
    const recoil = 10 * smooth((localTime - PHASE_ENDS[0]) / 0.35);
    boss = {
      x: plan.origin.x - plan.heading.x * recoil,
      y: plan.origin.y - plan.heading.y * recoil,
    };
  } else {
    boss = {
      x: lerp(plan.origin.x, plan.end.x, chargeProgress),
      y: lerp(plan.origin.y, plan.end.y, chargeProgress),
    };
  }
  const target = phase === 0 ? player : plan.target;
  const targetLength = Math.hypot(target.x - plan.origin.x, target.y - plan.origin.y);
  const heading =
    phase === 0
      ? {
          x: (target.x - plan.origin.x) / targetLength,
          y: (target.y - plan.origin.y) / targetLength,
        }
      : plan.heading;
  const clear = distanceToSegment(player, plan.origin, plan.end) > LANE_HALF_WIDTH + PLAYER_RADIUS;
  const dodgeTarget = {
    x: plan.target.x - plan.heading.y * 126,
    y: plan.target.y + plan.heading.x * 126,
  };
  return {
    time: sequence.time,
    localTime,
    attackIndex: explicitPlan ? 0 : sequence.attackIndex,
    phase,
    plan,
    player,
    boss,
    heading,
    target,
    dodgeTarget,
    clear,
    chargeProgress,
  };
}
