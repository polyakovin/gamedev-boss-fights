export const SWEEP_INNER_RADIUS = 180;
export const SWEEP_OUTER_RADIUS = 250;
// Conservatively includes the player's head, boots, and carried sword.
export const SWEEP_PLAYER_RADIUS = 56;

const point = (radius, angle) => ({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
const number = (value) => Math.round(value * 1000) / 1000;

/** A planted, two-handed grip; equipment rotates independently of sprite facing. */
export function sweepWeaponPose(angle, motion = {}) {
  const radians = (angle * Math.PI) / 180;
  const lean = motion.lean ?? 0;
  const crouch = motion.crouch ?? 0;
  const arms = [-1, 1].map((side, index) => {
    const shoulder = { x: side * 27 + lean * 7, y: -25 + crouch * 7 };
    const hand = point(index === 0 ? 18 : 44, radians);
    const elbow = {
      x: shoulder.x * 0.55 + hand.x * 0.45 + side * 13,
      y: shoulder.y * 0.35 + hand.y * 0.65 + 15,
    };
    return {
      hand,
      path: `M ${number(shoulder.x)} ${number(shoulder.y)} L ${number(elbow.x)} ${number(elbow.y)} L ${number(hand.x)} ${number(hand.y)}`,
    };
  });
  return {
    angle,
    shaftTransform: `rotate(${number(angle)})`,
    arms,
  };
}
