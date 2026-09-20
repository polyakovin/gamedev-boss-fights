import test from 'node:test';
import assert from 'node:assert/strict';
import { patternFrame } from '../src/pattern-model.mjs';
import {
  GAP_VOLLEY_DURATION,
  GAP_VOLLEY_BEAT_DURATION,
  GAP_VOLLEY_GAP_WIDTH,
  GAP_VOLLEY_LANES,
  GAP_VOLLEY_PLAYER_RADIUS,
  GAP_VOLLEY_PROJECTILE_RADIUS,
  GAP_VOLLEY_ROWS,
  gapVolleyPlan,
  volleyPlayerIsClear,
} from '../src/gap-volley-model.mjs';

const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

test('three committed volleys move the only full-width opening through the arena', () => {
  assert.equal(GAP_VOLLEY_DURATION, 3 * GAP_VOLLEY_BEAT_DURATION);
  const centers = [];
  for (let index = 0; index < 3; index += 1) {
    const preview = gapVolleyPlan(index * GAP_VOLLEY_BEAT_DURATION + 0.4);
    const active = gapVolleyPlan(index * GAP_VOLLEY_BEAT_DURATION + 3.2);
    centers.push(preview.gap.centerX);
    assert.equal(preview.index, index);
    assert.deepEqual(active.lanes, preview.lanes);
    assert.equal(active.gap.centerX, preview.gap.centerX);
    assert.equal(preview.gap.width, GAP_VOLLEY_GAP_WIDTH);
    assert.equal(preview.lanes.filter((lane) => lane.occupied).length, 6);
    assert.equal(preview.projectiles.length, GAP_VOLLEY_LANES.length * GAP_VOLLEY_ROWS);
    for (const lane of preview.lanes) {
      assert.equal(lane.occupied, Math.abs(lane.x - preview.gap.centerX) >= preview.gap.width / 2);
    }
    for (let lane = 1; lane < GAP_VOLLEY_LANES.length; lane += 1) {
      assert.ok(
        GAP_VOLLEY_LANES[lane] - GAP_VOLLEY_LANES[lane - 1] <
          2 * (GAP_VOLLEY_PLAYER_RADIUS + GAP_VOLLEY_PROJECTILE_RADIUS),
        'ordinary neighboring lanes cannot fit the full player',
      );
    }
  }
  assert.deepEqual(centers, [280, 150, 410]);
});

test('each arrangement is visible before the player begins its response', () => {
  for (let index = 0; index < 3; index += 1) {
    const offset = index * GAP_VOLLEY_BEAT_DURATION;
    for (const time of [0, 0.2, 0.4]) {
      const plan = gapVolleyPlan(offset + time);
      assert.ok(plan.warningOpacity >= 0.45);
      assert.ok(plan.gap.opacity >= 0.6);
      assert.ok(plan.projectiles.every((projectile) => !projectile.active && !projectile.opacity));
    }
    const waiting = patternFrame('gap-volley', offset + 0.35);
    const responding = patternFrame('gap-volley', offset + 0.75);
    assert.ok(distance(waiting.player, gapVolleyPlan(offset).playerStart) < 1e-8);
    assert.ok(distance(responding.player, waiting.player) > 10);
  }
});

test('every row is born at the boss and settles into its committed projectile lanes', () => {
  for (let index = 0; index < 3; index += 1) {
    for (let row = 0; row < GAP_VOLLEY_ROWS; row += 1) {
      const bornAt = index * GAP_VOLLEY_BEAT_DURATION + 1.6 + row * 0.2;
      const born = gapVolleyPlan(bornAt);
      const formed = gapVolleyPlan(bornAt + 0.31);
      for (let lane = 0; lane < GAP_VOLLEY_LANES.length; lane += 1) {
        const projectileIndex = row * GAP_VOLLEY_LANES.length + lane;
        const projectile = born.projectiles[projectileIndex];
        assert.equal(projectile.id, `${row}-${lane}`);
        assert.ok(distance(projectile, { x: 280, y: 210 }) < 1e-8);
        assert.ok(projectile.opacity < 1e-8);
        assert.equal(formed.projectiles[projectileIndex].x, GAP_VOLLEY_LANES[lane]);
        assert.equal(formed.projectiles[projectileIndex].rotation, 0);
        assert.equal(formed.projectiles[projectileIndex].active, formed.lanes[lane].occupied);
      }
    }
  }
});

test('projectile tips follow their velocity while spreading from the boss', () => {
  for (let index = 0; index < 3; index += 1) {
    const time = index * GAP_VOLLEY_BEAT_DURATION + 1.75;
    const before = gapVolleyPlan(time - 0.0001);
    const current = gapVolleyPlan(time);
    const after = gapVolleyPlan(time + 0.0001);
    current.projectiles.slice(0, GAP_VOLLEY_LANES.length).forEach((projectile, lane) => {
      if (!projectile.active) return;
      const dx = after.projectiles[lane].x - before.projectiles[lane].x;
      const dy = after.projectiles[lane].y - before.projectiles[lane].y;
      const angle = ((projectile.rotation + 90) * Math.PI) / 180;
      const alignment = (dx * Math.cos(angle) + dy * Math.sin(angle)) / Math.hypot(dx, dy);
      assert.ok(alignment > 0.99999);
    });
  }
});

test('the full player stays in the announced gap while every projectile row passes', () => {
  for (let step = 0; step <= GAP_VOLLEY_DURATION * 100; step += 1) {
    const time = step / 100;
    const frame = patternFrame('gap-volley', time);
    const plan = gapVolleyPlan(time);
    assert.deepEqual(frame.volley, plan);
    assert.equal(volleyPlayerIsClear(plan, frame.player), true, `clear geometry at ${time}s`);
    for (const projectile of plan.projectiles.filter((item) => item.active)) {
      assert.ok(
        distance(projectile, frame.player) >
          GAP_VOLLEY_PLAYER_RADIUS + GAP_VOLLEY_PROJECTILE_RADIUS,
      );
    }
    if (frame.phase === 1) {
      assert.equal(frame.clear, true);
      assert.ok(frame.player.x - GAP_VOLLEY_PLAYER_RADIUS >= plan.gap.x);
      assert.ok(frame.player.x + GAP_VOLLEY_PLAYER_RADIUS <= plan.gap.x + plan.gap.width);
      assert.equal(frame.playerMotion.stride, 0);
    }
  }
});

test('clearance rejects both partial bodies outside the gap and projectile overlap', () => {
  const active = gapVolleyPlan(2.5);
  assert.equal(volleyPlayerIsClear(active, { x: 295, y: 760 }), false);
  assert.equal(volleyPlayerIsClear(active, { x: 280, y: 760 }), true);
  assert.equal(volleyPlayerIsClear(gapVolleyPlan(1.6), { x: 280, y: 210 }), false);
  const recovery = gapVolleyPlan(4.6);
  assert.equal(volleyPlayerIsClear(recovery, recovery.playerEnd), true);
});

test('the last row and its visual tail clear the whole player before recovery movement', () => {
  for (let index = 0; index < 3; index += 1) {
    const offset = index * GAP_VOLLEY_BEAT_DURATION;
    const fading = gapVolleyPlan(offset + 3.98);
    const lastRow = fading.projectiles.filter(
      (projectile) => projectile.id.startsWith('2-') && projectile.active,
    );
    assert.equal(lastRow.length, 6);
    assert.ok(lastRow.every((projectile) => projectile.y - 34 > 760 + GAP_VOLLEY_PLAYER_RADIUS));
    for (const time of [4.25, 4.55, 5.1]) {
      const plan = gapVolleyPlan(offset + time);
      assert.ok(plan.projectiles.every((projectile) => !projectile.active && !projectile.opacity));
    }
    assert.equal(gapVolleyPlan(offset + 4.55).gap.opacity, 0);
  }
});

test('all repeated phases and the complete sequence join without player teleports', () => {
  for (let index = 0; index < 3; index += 1) {
    const offset = index * GAP_VOLLEY_BEAT_DURATION;
    const plan = gapVolleyPlan(offset);
    const next = gapVolleyPlan(offset + GAP_VOLLEY_BEAT_DURATION);
    assert.deepEqual(plan.playerEnd, next.playerStart);
    for (const localTime of [0, 1.6, 4.25, 4.55, GAP_VOLLEY_BEAT_DURATION]) {
      const before = patternFrame('gap-volley', offset + localTime - 0.0001);
      const after = patternFrame('gap-volley', offset + localTime + 0.0001);
      assert.ok(distance(before.player, after.player) < 0.01);
      assert.ok(Math.abs(before.playerMotion.stride - after.playerMotion.stride) < 0.01);
    }
  }
});

test('projectile samples stay finite, bounded, and deterministic through backward seeking', () => {
  const ids = gapVolleyPlan(0).projectiles.map((projectile) => projectile.id);
  for (const time of [NaN, Infinity, -Infinity, -0.5, 0, 5.999, 6, 12, 17.999, 18, 36.5]) {
    const plan = gapVolleyPlan(time);
    gapVolleyPlan(11.8);
    assert.deepEqual(gapVolleyPlan(time), plan);
    assert.deepEqual(
      plan.projectiles.map((projectile) => projectile.id),
      ids,
    );
    assert.ok(plan.time >= 0 && plan.time < GAP_VOLLEY_DURATION);
    for (const projectile of plan.projectiles) {
      assert.ok(
        [projectile.x, projectile.y, projectile.rotation, projectile.opacity].every(
          Number.isFinite,
        ),
      );
      assert.ok(projectile.x >= GAP_VOLLEY_LANES[0] && projectile.x <= GAP_VOLLEY_LANES.at(-1));
      assert.ok(projectile.y >= 210 && projectile.y <= 930);
      assert.ok(projectile.opacity >= 0 && projectile.opacity <= 1);
    }
  }
  assert.deepEqual(gapVolleyPlan(-0.5), gapVolleyPlan(17.5));
  assert.deepEqual(gapVolleyPlan(-GAP_VOLLEY_DURATION), gapVolleyPlan(0));
  assert.deepEqual(gapVolleyPlan(36.5), gapVolleyPlan(0.5));
});
