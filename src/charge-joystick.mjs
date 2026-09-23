export const JOYSTICK_RADIUS = 72;

export function moveFloatingJoystick(center, finger, radius = JOYSTICK_RADIUS) {
  const dx = finger.x - center.x;
  const dy = finger.y - center.y;
  const distance = Math.hypot(dx, dy);
  const scale = distance > radius ? radius / distance : 1;
  const offset = { x: dx * scale, y: dy * scale };
  return {
    center: distance > radius ? { x: finger.x - offset.x, y: finger.y - offset.y } : { ...center },
    offset,
    direction: { x: offset.x / radius, y: offset.y / radius },
  };
}
