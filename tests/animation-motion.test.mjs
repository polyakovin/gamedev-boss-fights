import test from 'node:test';
import assert from 'node:assert/strict';
import { ATTACK_DURATION, chargeFrame, DURATION, PHASE_ENDS } from '../src/charge-model.mjs';
import { patternFrame, patternDuration, PATTERN_PHASE_ENDS } from '../src/pattern-model.mjs';

const kinds = ['sweep', 'ground-slam', 'summon', 'gap-volley'];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('the charge releases continuously from its wind-up and leaves a planted recovery', () => {
  for (const offset of [0, ATTACK_DURATION]) {
    for (const boundary of PHASE_ENDS) {
      const before = chargeFrame(offset + boundary - 0.0001);
      const after = chargeFrame(offset + boundary + 0.0001);
      assert.ok(distance(before.boss, after.boss) < 0.01);
      assert.ok(distance(before.player, after.player) < 0.01);
    }
    const sprint = chargeFrame(offset + PHASE_ENDS[1] + 0.25);
    assert.equal(sprint.chargeActive, true);
    assert.ok(sprint.bossMotion.stride > 0.8);
    assert.equal(sprint.clear, true);
    const recovered = chargeFrame(offset + 2.95);
    const stopped = chargeFrame(offset + 2.45);
    assert.equal(recovered.recovering, true);
    assert.equal(recovered.chargeActive, false);
    assert.deepEqual(stopped.boss, recovered.boss);
    assert.equal(recovered.bossMotion.stride, 0);
    assert.ok(stopped.bossMotion.lean > recovered.bossMotion.lean);
  }
});

test('players plant their feet between the committed response and repositioning', () => {
  for (const offset of [0, ATTACK_DURATION]) {
    const response = chargeFrame(offset + 1.15);
    assert.ok(response.playerMotion.dodge > 0.9);
    assert.ok(response.playerMotion.stride > 0.8);
    const planted = chargeFrame(offset + 1.5);
    const waiting = chargeFrame(offset + 3.1);
    assert.deepEqual(planted.player, waiting.player);
    assert.equal(planted.playerMotion.stride, 0);
    assert.equal(waiting.playerMotion.stride, 0);
  }
  for (const kind of kinds) {
    assert.ok(patternFrame(kind, 0.75).playerMotion.stride > 0.8);
    const planted = patternFrame(kind, 1.3);
    const waiting = patternFrame(kind, 4.4);
    assert.deepEqual(planted.player, waiting.player);
    assert.equal(planted.playerMotion.stride, 0);
    assert.equal(waiting.playerMotion.stride, 0);
    assert.ok(patternFrame(kind, 5.1).playerMotion.stride > 0.8);
  }
});

test('sweep turns the attack around a planted boss instead of spinning its whole body', () => {
  const start = patternFrame('sweep', PATTERN_PHASE_ENDS[0]);
  const middle = patternFrame('sweep', (PATTERN_PHASE_ENDS[0] + PATTERN_PHASE_ENDS[1]) / 2);
  const end = patternFrame('sweep', PATTERN_PHASE_ENDS[1]);
  assert.equal(end.sweepRotation - start.sweepRotation, 262);
  assert.ok(end.bossFacing - start.bossFacing < 40);
  assert.ok(Math.abs(middle.sweepRotation - (start.sweepRotation + end.sweepRotation) / 2) < 1e-10);
  assert.deepEqual(start.boss, end.boss);
  assert.equal(middle.bossMotion.stride, 0);
});

test('slam weight drops before its shockwave travels away from the impact point', () => {
  const raised = patternFrame('ground-slam', 1.55);
  const landed = patternFrame('ground-slam', 1.87);
  const recovery = patternFrame('ground-slam', 2.8);
  assert.ok(raised.bossMotion.lift > 0.9);
  assert.equal(landed.bossMotion.lift, 0);
  assert.ok(landed.bossMotion.impact > 0.9);
  assert.ok(landed.slamRadius > raised.slamRadius);
  assert.equal(recovery.bossMotion.crouch, 0);
  assert.ok(recovery.slamRadius > landed.slamRadius);
});

test('scrubbing derives finite reproducible poses without advancing a separate animation clock', () => {
  const sample = (frame) => {
    assert.ok(Number.isFinite(frame.bossFacing));
    assert.ok(Number.isFinite(frame.playerFacing));
    for (const pose of [frame.bossMotion, frame.playerMotion]) {
      assert.ok(Number.isFinite(pose.gait));
      assert.ok(pose.lean >= -1 && pose.lean <= 1);
      for (const key of ['stride', 'crouch', 'lift', 'attack', 'impact', 'dodge']) {
        assert.ok(pose[key] >= 0 && pose[key] <= 1, `${key} stays within its pose weight`);
      }
    }
  };
  for (let time = 0; time <= DURATION; time += 0.017) sample(chargeFrame(time));
  for (const kind of kinds) {
    const expected = patternFrame(kind, 0.78);
    patternFrame(kind, 4.7);
    assert.deepEqual(patternFrame(kind, 0.78), expected);
    for (let time = 0; time <= patternDuration(kind); time += 0.017)
      sample(patternFrame(kind, time));
    for (const boundary of [...PATTERN_PHASE_ENDS, 0, patternDuration(kind)]) {
      const before = patternFrame(kind, boundary - 0.0001);
      const after = patternFrame(kind, boundary + 0.0001);
      assert.ok(distance(before.player, after.player) < 0.01);
      for (const key of ['stride', 'lean', 'crouch', 'lift', 'attack', 'impact', 'dodge']) {
        assert.ok(Math.abs(before.bossMotion[key] - after.bossMotion[key]) < 0.01);
      }
    }
  }
});
