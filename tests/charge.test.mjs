import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chargeFrame,
  createChargePlan,
  DEFAULT_PLAN,
  distanceToSegment,
  DURATION,
  LANE_HALF_WIDTH,
  PHASE_ENDS,
  PLAYER_RADIUS,
  PREVIEW_TIME,
} from '../src/charge-model.mjs';
import { CHARGE_ART, renderCharge, renderChargeThumbnail } from '../lib/charge-view.mjs';

test('aim follows movement, then the target and direction stay frozen while the player sidesteps', () => {
  assert.deepEqual(DEFAULT_PLAN.heading, { x: 0, y: -1 });
  const aim = chargeFrame(1.2);
  assert.notEqual(aim.heading.y, 0);
  assert.deepEqual(aim.target, aim.player);
  for (const time of [2.4, PREVIEW_TIME, 4.5, DURATION]) {
    const frame = chargeFrame(time);
    assert.deepEqual(frame.heading, DEFAULT_PLAN.heading);
    assert.deepEqual(frame.target, DEFAULT_PLAN.target);
  }
  const locked = chargeFrame(PREVIEW_TIME);
  assert.notDeepEqual(locked.player, locked.target);
  assert.equal(locked.phase, 1);
});

test('a captured plan owns its coordinates and preserves a diagonal heading', () => {
  const target = { x: 300, y: 400 };
  const plan = createChargePlan({ origin: { x: 0, y: 0 }, target, distance: 1000 });
  target.y = -900;
  assert.deepEqual(plan.heading, { x: 0.6, y: 0.8 });
  assert.deepEqual(plan.target, { x: 300, y: 400 });
  assert.deepEqual(plan.end, { x: 600, y: 800 });
  assert.ok(Object.isFrozen(plan.heading));
  assert.deepEqual(chargeFrame(5, plan).heading, { x: 0.6, y: 0.8 });
});

test('the sideways dodge clears the entire body before charge and remains clear', () => {
  const locked = chargeFrame(PREVIEW_TIME);
  assert.ok(
    distanceToSegment(locked.player, DEFAULT_PLAN.origin, DEFAULT_PLAN.end) >
      LANE_HALF_WIDTH + PLAYER_RADIUS,
  );
  assert.equal(locked.clear, true);
  for (let time = PHASE_ENDS[1]; time <= DURATION; time += 0.025)
    assert.equal(chargeFrame(time).clear, true);
});

test('boss stops at its endpoint and remains still during recovery', () => {
  for (const time of [PHASE_ENDS[2], 6, DURATION, 500]) {
    const frame = chargeFrame(time);
    assert.equal(frame.phase, 3);
    assert.deepEqual(frame.boss, DEFAULT_PLAN.end);
  }
  assert.equal(chargeFrame(500).time, DURATION);
  assert.equal(chargeFrame(-100).time, 0);
});

test('invalid charge plans cannot produce NaN geometry', () => {
  assert.throws(
    () => createChargePlan({ origin: { x: 1, y: 1 }, target: { x: 1, y: 1 } }),
    RangeError,
  );
  assert.throws(() => createChargePlan({ distance: Infinity }), RangeError);
  assert.throws(() => createChargePlan({ distance: -1 }), RangeError);
});

test('localized markup escapes HTML and script closers while preserving JSON content', () => {
  const words = Object.fromEntries(
    [
      'title',
      'play',
      'pause',
      'restart',
      'timeline',
      'step',
      'boss',
      'player',
      'danger',
      'path',
      'locked',
      'safe',
      'reducedMotion',
      'diagramDescription',
    ].map((key) => [key, 'ساحة <b> & </script>']),
  );
  words.phaseNames = ['أ', 'ب', 'ج', 'د'];
  words.phaseDescriptions = ['١', '٢', '٣', '٤'];
  const markup = renderCharge(words);
  assert.ok(markup.includes('&lt;b&gt; &amp; &lt;/script&gt;'));
  assert.equal(markup.match(/<script/g)?.length, 1);
  assert.equal(markup.match(/<\/script>/g)?.length, 1);
  const embedded = markup.match(
    /<script type="application\/json" data-charge-config>(.*?)<\/script>/s,
  )[1];
  assert.deepEqual(JSON.parse(embedded), words);
  assert.ok(markup.includes('direction="ltr"'));
});

test('the charge diagram and catalog preview reuse the same tank and monster assets', () => {
  const demo = {
    title: 'Charge',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    timeline: 'Timeline',
    step: 'Phases',
    boss: 'Boss',
    player: 'Player',
    danger: 'Danger',
    path: 'Path',
    locked: 'Locked',
    safe: 'Safe',
    reducedMotion: 'Paused',
    diagramDescription: 'Diagram',
    phaseNames: ['Aim', 'Lock', 'Charge', 'Recover'],
    phaseDescriptions: ['Aim', 'Lock', 'Charge', 'Recover'],
  };
  const markup = renderCharge(demo);
  const thumbnail = renderChargeThumbnail('charge');
  assert.ok(markup.includes(CHARGE_ART.tank));
  assert.ok(markup.includes(CHARGE_ART.monster));
  assert.ok(thumbnail.includes(CHARGE_ART.tank));
  assert.ok(thumbnail.includes(CHARGE_ART.monster));
  assert.match(thumbnail, /data-charge-preview-boss/);
  assert.match(thumbnail, /data-charge-preview-player/);
  assert.doesNotMatch(markup, /charge-demo__heading|charge-demo__legend|data-charge-speed/);
  assert.doesNotMatch(markup, /data-charge-scenario|charge-demo__scenarios/);
  assert.match(
    markup,
    /charge-demo__canvas">\s*<div class="charge-demo__scene-timeline">[\s\S]*data-charge-timeline/,
  );
  assert.doesNotMatch(markup, /data-charge-status transform|charge-demo__status-label/);
  assert.equal(markup.match(/data-charge-dodge/g)?.length, 1);
});
