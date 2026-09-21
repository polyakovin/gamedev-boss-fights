import test from 'node:test';
import assert from 'node:assert/strict';
import { patternFrame } from '../src/pattern-model.mjs';
import {
  PROJECTILE_FAN_ANGLES,
  PROJECTILE_FAN_DURATION,
  PROJECTILE_FAN_ORIGIN,
  PROJECTILE_FAN_PLAYER_RADIUS,
  PROJECTILE_FAN_PLAYER_TARGET,
  PROJECTILE_FAN_PROJECTILE_RADIUS,
  PROJECTILE_FAN_RELEASE_TIME,
  projectileFanPlan,
  projectileFanPlayerIsClear,
} from '../src/projectile-fan-model.mjs';

const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

test('the complete fan is announced before all six angles lock at release', () => {
  const preview = projectileFanPlan(0.4);
  const release = projectileFanPlan(PROJECTILE_FAN_RELEASE_TIME);
  const active = projectileFanPlan(2.7);

  assert.deepEqual(
    preview.rays.map(({ angle }) => angle),
    PROJECTILE_FAN_ANGLES,
  );
  assert.deepEqual(
    active.rays.map(({ angle }) => angle),
    PROJECTILE_FAN_ANGLES,
  );
  assert.ok(preview.warningOpacity > 0.45);
  assert.ok(preview.safeGap.opacity > 0.5);
  assert.ok(preview.projectiles.every(({ active, opacity }) => !active && opacity === 0));
  assert.ok(
    release.projectiles.every((projectile) => distance(projectile, PROJECTILE_FAN_ORIGIN) < 1e-8),
  );
});

test('every projectile follows its previewed ray without late homing', () => {
  for (const time of [1.8, 2.4, 3.2, 4]) {
    const plan = projectileFanPlan(time);
    for (const projectile of plan.projectiles) {
      if (!projectile.active) continue;
      const angle = (projectile.angle * Math.PI) / 180;
      const dx = projectile.x - PROJECTILE_FAN_ORIGIN.x;
      const dy = projectile.y - PROJECTILE_FAN_ORIGIN.y;
      assert.ok(Math.abs(dx * Math.cos(angle) - dy * Math.sin(angle)) < 1e-8);
      assert.equal(projectile.rotation, -projectile.angle);
    }
  }
});

test('ordinary movement reaches a full-body gap before release and remains clear', () => {
  const waiting = patternFrame('projectile-fan', 0.35);
  const ready = patternFrame('projectile-fan', 1.3);
  assert.ok(distance(waiting.player, projectileFanPlan(0).playerStart) < 1e-8);
  assert.ok(distance(ready.player, PROJECTILE_FAN_PLAYER_TARGET) < 1e-8);

  for (let step = 0; step <= PROJECTILE_FAN_DURATION * 100; step += 1) {
    const time = step / 100;
    const frame = patternFrame('projectile-fan', time);
    const plan = projectileFanPlan(time);
    assert.deepEqual(frame.fan, plan);
    assert.equal(projectileFanPlayerIsClear(plan, frame.player), true, `clear at ${time}s`);
    for (const projectile of plan.projectiles.filter(({ active }) => active))
      assert.ok(
        distance(projectile, frame.player) >
          PROJECTILE_FAN_PLAYER_RADIUS + PROJECTILE_FAN_PROJECTILE_RADIUS,
      );
  }
});

test('the last projectile leaves the arena before recovery begins', () => {
  assert.ok(projectileFanPlan(4.05).projectiles.some(({ active }) => active));
  for (const time of [4.25, 4.8, 5.5])
    assert.ok(
      projectileFanPlan(time).projectiles.every(({ active, opacity }) => !active && !opacity),
    );
  assert.equal(patternFrame('projectile-fan', 4.25).phase, 2);
});

test('fan frames stay finite, continuous, and deterministic when seeking', () => {
  for (const time of [NaN, Infinity, -Infinity, -0.4, 0, 1.6, 4.25, 5.999, 6, 12.4]) {
    const plan = projectileFanPlan(time);
    projectileFanPlan(4.8);
    assert.deepEqual(projectileFanPlan(time), plan);
    assert.ok(plan.time >= 0 && plan.time < PROJECTILE_FAN_DURATION);
    for (const projectile of plan.projectiles)
      assert.ok(
        [projectile.x, projectile.y, projectile.rotation, projectile.opacity].every(
          Number.isFinite,
        ),
      );
  }
  for (const seam of [0, PROJECTILE_FAN_RELEASE_TIME, 4.25, PROJECTILE_FAN_DURATION]) {
    const before = patternFrame('projectile-fan', seam - 0.0001);
    const after = patternFrame('projectile-fan', seam + 0.0001);
    assert.ok(distance(before.player, after.player) < 0.01);
  }
  assert.deepEqual(projectileFanPlan(-0.4), projectileFanPlan(5.6));
  const repeated = projectileFanPlan(12.4);
  const base = projectileFanPlan(0.4);
  assert.ok(Math.abs(repeated.time - base.time) < 1e-12);
  repeated.projectiles.forEach((projectile, index) => {
    assert.ok(distance(projectile, base.projectiles[index]) < 1e-8);
    assert.equal(projectile.opacity, base.projectiles[index].opacity);
  });
});
