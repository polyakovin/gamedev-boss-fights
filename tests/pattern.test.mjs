import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_LABEL_OFFSET_Y,
  patternFrame,
  patternPhaseAt,
  PATTERN_DURATION,
} from '../src/pattern-model.mjs';

const kinds = ['sweep', 'ground-slam', 'summon', 'gap-volley'];

test('shared pattern model gives every mechanic three moving phases', () => {
  assert.deepEqual([patternPhaseAt(0.5), patternPhaseAt(2.5), patternPhaseAt(5)], [0, 1, 2]);
  for (const kind of kinds) {
    for (const time of [0, 0.8, 2.5, 4.8, PATTERN_DURATION - 0.01]) {
      const frame = patternFrame(kind, time);
      assert.ok(
        [
          frame.player.x,
          frame.player.y,
          frame.boss.x,
          frame.boss.y,
          frame.sweepRotation,
          frame.slamRadius,
          frame.summonProgress,
          frame.volleyY,
        ].every(Number.isFinite),
      );
    }
  }
});

test('each pattern exposes only its own threat geometry', () => {
  const frames = Object.fromEntries(kinds.map((kind) => [kind, patternFrame(kind, 2.5)]));
  assert.ok(frames.sweep.sweepOpacity > 0);
  assert.ok(frames['ground-slam'].slamOpacity > 0);
  assert.ok(frames.summon.summonOpacity > 0);
  assert.ok(frames['gap-volley'].volleyOpacity > 0);
  assert.equal(frames.sweep.slamOpacity, 0);
  assert.equal(frames.summon.volleyOpacity, 0);
});

test('player and threat return smoothly before the loop repeats', () => {
  for (const kind of kinds) {
    const start = patternFrame(kind, 0);
    const end = patternFrame(kind, PATTERN_DURATION - 0.001);
    assert.ok(Math.abs(start.player.x - end.player.x) < 0.01);
    assert.ok(Math.abs(start.player.y - end.player.y) < 0.01);
    assert.ok(end.visibility < 0.01);
  }
});

test('the boss label stays above the boss throughout every pattern', () => {
  for (const kind of kinds) {
    for (let time = 0; time < PATTERN_DURATION; time += 0.025) {
      const frame = patternFrame(kind, time);
      assert.equal(frame.bossLabel.x, frame.boss.x);
      assert.equal(frame.bossLabel.y, frame.boss.y + frame.bossRock + BOSS_LABEL_OFFSET_Y);
      assert.ok(frame.bossLabel.y < frame.boss.y + frame.bossRock);
    }
  }
});
