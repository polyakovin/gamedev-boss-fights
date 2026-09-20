export const GAP_VOLLEY_DURATION = 18;
export const GAP_VOLLEY_BEAT_DURATION = 6;
export const GAP_VOLLEY_LANES = Object.freeze([
  52.5, 117.5, 182.5, 247.5, 312.5, 377.5, 442.5, 507.5,
]);
export const GAP_VOLLEY_ROWS = 3;
export const GAP_VOLLEY_PLAYER_RADIUS = 56;
export const GAP_VOLLEY_PROJECTILE_RADIUS = 12;
export const GAP_VOLLEY_GAP_WIDTH = 140;

const gapCenters = Object.freeze([280, 150, 410]);
const releaseTime = 1.6;
const rowDelay = 0.2;
const fanDuration = 0.3;
const flightDuration = 2.05;
const origin = Object.freeze({ x: 280, y: 210 });
const finalY = 930;
const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/** One deterministic sequence; rows spread from the boss before holding their lanes. */
export function gapVolleyPlan(time) {
  const remainder = (Number.isFinite(time) ? time : 0) % GAP_VOLLEY_DURATION;
  const normalized = remainder < 0 ? remainder + GAP_VOLLEY_DURATION : remainder || 0;
  const index = Math.floor(normalized / GAP_VOLLEY_BEAT_DURATION);
  const localTime = normalized % GAP_VOLLEY_BEAT_DURATION;
  const centerX = gapCenters[index];
  const previousGap = gapCenters[(index + gapCenters.length - 1) % gapCenters.length];
  const nextGap = gapCenters[(index + 1) % gapCenters.length];
  const gap = {
    x: centerX - GAP_VOLLEY_GAP_WIDTH / 2,
    width: GAP_VOLLEY_GAP_WIDTH,
    centerX,
    opacity: 0.6 * (1 - smooth((localTime - 4.25) / 0.3)),
  };
  const lanes = GAP_VOLLEY_LANES.map((x) => ({
    x,
    occupied: Math.abs(x - centerX) >= GAP_VOLLEY_GAP_WIDTH / 2,
  }));
  const projectiles = Array.from({ length: GAP_VOLLEY_ROWS }, (_, row) =>
    lanes.map((lane, laneIndex) => {
      const age = localTime - releaseTime - row * rowDelay;
      const fan = clamp(age / fanDuration);
      const lateralSpeed = ((lane.x - origin.x) * 6 * fan * (1 - fan)) / fanDuration;
      const forwardSpeed = (finalY - origin.y) / flightDuration;
      return {
        id: `${row}-${laneIndex}`,
        x: origin.x + (lane.x - origin.x) * smooth(fan),
        y: origin.y + (finalY - origin.y) * clamp(age / flightDuration),
        rotation: (Math.atan2(forwardSpeed, lateralSpeed) * 180) / Math.PI - 90,
        opacity: lane.occupied
          ? smooth(age / 0.05) * (1 - smooth((age - (flightDuration - 0.08)) / 0.08))
          : 0,
        active: lane.occupied && age >= 0 && age < flightDuration,
      };
    }),
  ).flat();

  return {
    index,
    time: normalized,
    localTime,
    gap,
    warningOpacity:
      (0.45 + 0.4 * smooth(localTime / 0.25)) * (1 - smooth((localTime - releaseTime) / 0.25)),
    lanes,
    projectiles,
    playerStart: { x: (previousGap + centerX) / 2, y: 700 },
    playerTarget: { x: centerX, y: 760 },
    playerEnd: { x: (centerX + nextGap) / 2, y: 700 },
  };
}

/** Both the full player envelope and every currently active projectile must be clear. */
export function volleyPlayerIsClear(plan, player) {
  const inActivePhase = plan.localTime >= releaseTime && plan.localTime < 4.25;
  const insideGap =
    player.x - GAP_VOLLEY_PLAYER_RADIUS >= plan.gap.x &&
    player.x + GAP_VOLLEY_PLAYER_RADIUS <= plan.gap.x + plan.gap.width;
  return (
    (!inActivePhase || insideGap) &&
    plan.projectiles.every(
      (projectile) =>
        !projectile.active ||
        Math.hypot(player.x - projectile.x, player.y - projectile.y) >
          GAP_VOLLEY_PLAYER_RADIUS + GAP_VOLLEY_PROJECTILE_RADIUS,
    )
  );
}
