import assert from 'node:assert/strict';
import test from 'node:test';
import { JOYSTICK_RADIUS, moveFloatingJoystick } from '../src/charge-joystick.mjs';
import { advanceChargeGame, createChargeGame } from '../src/charge-game.mjs';

test('floating joystick begins centered, scales movement, and follows an overshooting finger', () => {
  const center = { x: 60, y: 190 };
  const still = moveFloatingJoystick(center, center);
  assert.deepEqual(still.direction, { x: 0, y: 0 });
  assert.deepEqual(still.center, center);

  const half = moveFloatingJoystick(center, { x: 96, y: 190 });
  assert.deepEqual(half.direction, { x: 0.5, y: 0 });
  assert.deepEqual(half.center, center);

  const far = moveFloatingJoystick(center, { x: 780, y: 190 });
  assert.deepEqual(far.center, { x: 708, y: 190 });
  assert.deepEqual(far.offset, { x: JOYSTICK_RADIUS, y: 0 });
  assert.deepEqual(far.direction, { x: 1, y: 0 });

  const reverse = moveFloatingJoystick(far.center, { x: 672, y: 226 });
  assert.deepEqual(reverse.direction, { x: -0.5, y: 0.5 });
});

test('half joystick deflection moves at half speed while held and stops at center', () => {
  const game = createChargeGame();
  advanceChargeGame(game, { moveX: 0.5, moveY: 0 }, 0.1);
  assert.ok(Math.abs(game.player.x - 297) < 0.001);
  advanceChargeGame(game, { moveX: 0.5, moveY: 0 }, 0.1);
  assert.ok(Math.abs(game.player.x - 314) < 0.001);
  advanceChargeGame(game, { moveX: 0, moveY: 0 }, 0.1);
  assert.ok(Math.abs(game.player.x - 314) < 0.001);
  assert.equal(game.movementIntensity, 0);
});
