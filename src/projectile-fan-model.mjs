export const PROJECTILE_FAN_DURATION = 6;
export const PROJECTILE_FAN_ANGLES = Object.freeze([-38, -23, -8, 8, 23, 38]);
export const PROJECTILE_FAN_PLAYER_RADIUS = 46;
export const PROJECTILE_FAN_PROJECTILE_RADIUS = 12;
export const PROJECTILE_FAN_RELEASE_TIME = 1.6;
export const PROJECTILE_FAN_SPEED = 290;
export const PROJECTILE_FAN_ORIGIN = Object.freeze({ x: 280, y: 200 });

const arena = Object.freeze({ left: 24, right: 536, bottom: 910 });
const safeAngles = Object.freeze([8, 23]);
const playerY = 720;
const playerTargetAngle = (safeAngles[0] + safeAngles[1]) / 2;
const radians = (degrees) => (degrees * Math.PI) / 180;
const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const rayDistanceToEdge = (angle) => {
  const angleRadians = radians(angle);
  const dx = Math.sin(angleRadians);
  const dy = Math.cos(angleRadians);
  const horizontal =
    dx < 0
      ? (arena.left - PROJECTILE_FAN_ORIGIN.x) / dx
      : (arena.right - PROJECTILE_FAN_ORIGIN.x) / dx;
  const vertical = (arena.bottom - PROJECTILE_FAN_ORIGIN.y) / dy;
  return Math.min(horizontal, vertical);
};

const pointOnRay = (angle, distance) => {
  const angleRadians = radians(angle);
  return {
    x: PROJECTILE_FAN_ORIGIN.x + Math.sin(angleRadians) * distance,
    y: PROJECTILE_FAN_ORIGIN.y + Math.cos(angleRadians) * distance,
  };
};

export const PROJECTILE_FAN_PLAYER_TARGET = Object.freeze({
  x:
    PROJECTILE_FAN_ORIGIN.x +
    Math.tan(radians(playerTargetAngle)) * (playerY - PROJECTILE_FAN_ORIGIN.y),
  y: playerY,
});

/** A deterministic fan: every projectile remains on its announced ray after release. */
export function projectileFanPlan(time) {
  const remainder = (Number.isFinite(time) ? time : 0) % PROJECTILE_FAN_DURATION;
  const localTime = remainder < 0 ? remainder + PROJECTILE_FAN_DURATION : remainder || 0;
  const age = localTime - PROJECTILE_FAN_RELEASE_TIME;
  const rays = PROJECTILE_FAN_ANGLES.map((angle) => {
    const distance = rayDistanceToEdge(angle);
    return { angle, distance, ...pointOnRay(angle, distance) };
  });
  const projectiles = rays.map((ray, index) => {
    const distance = Math.min(ray.distance, Math.max(0, age * PROJECTILE_FAN_SPEED));
    const position = pointOnRay(ray.angle, distance);
    const active = age >= 0 && distance < ray.distance;
    return {
      id: String(index),
      angle: ray.angle,
      ...position,
      rotation: -ray.angle,
      opacity: active
        ? smooth(age / 0.08) *
          (1 - smooth((distance - (ray.distance - 34)) / Math.min(34, ray.distance)))
        : 0,
      active,
    };
  });
  const safeDistance = 620;
  return Object.freeze({
    time: localTime,
    localTime,
    rays,
    projectiles,
    safeGap: {
      start: pointOnRay(safeAngles[0], safeDistance),
      end: pointOnRay(safeAngles[1], safeDistance),
      opacity: 0.58 * (1 - smooth((localTime - PROJECTILE_FAN_RELEASE_TIME) / 0.25)),
    },
    warningOpacity:
      (0.48 + 0.42 * smooth(localTime / 0.28)) *
      (1 - smooth((localTime - PROJECTILE_FAN_RELEASE_TIME) / 0.22)),
    playerStart: { x: 330, y: playerY },
    playerTarget: PROJECTILE_FAN_PLAYER_TARGET,
    playerEnd: { x: 330, y: playerY },
  });
}

/** Clearance uses the full player and projectile radii, not only their center lines. */
export function projectileFanPlayerIsClear(plan, player) {
  return plan.projectiles.every(
    (projectile) =>
      !projectile.active ||
      Math.hypot(player.x - projectile.x, player.y - projectile.y) >
        PROJECTILE_FAN_PLAYER_RADIUS + PROJECTILE_FAN_PROJECTILE_RADIUS,
  );
}
