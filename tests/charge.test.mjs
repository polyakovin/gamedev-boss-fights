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
import { renderCharge } from '../lib/charge-view.mjs';

test('aim follows movement, then the target and direction stay frozen while the player sidesteps', () => {
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
  for (const scenario of ['sidestep', 'retreat']) {
    assert.deepEqual(chargeFrame(5, scenario, plan).heading, { x: 0.6, y: 0.8 });
  }
});

test('sidestep clears the entire body before charge and remains safe throughout the sweep', () => {
  const locked = chargeFrame(PREVIEW_TIME, 'sidestep');
  assert.ok(
    distanceToSegment(locked.player, DEFAULT_PLAN.origin, DEFAULT_PLAN.end) >
      LANE_HALF_WIDTH + PLAYER_RADIUS,
  );
  assert.equal(locked.clear, true);
  for (let time = PHASE_ENDS[1]; time <= DURATION; time += 0.025)
    assert.equal(chargeFrame(time, 'sidestep').hit, false);
  assert.equal(chargeFrame(DURATION, 'sidestep').hit, false);
});

test('retreat along the lane is caught, including a seek that skips the impact frame', () => {
  assert.equal(chargeFrame(PREVIEW_TIME, 'retreat').clear, false);
  assert.equal(chargeFrame(PHASE_ENDS[1], 'retreat').hit, false);
  assert.equal(chargeFrame(4.95, 'retreat').hit, true);
  assert.equal(chargeFrame(DURATION, 'retreat').hit, true);
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
      'intro',
      'play',
      'pause',
      'restart',
      'timeline',
      'speed',
      'step',
      'scenario',
      'sidestep',
      'retreat',
      'boss',
      'player',
      'danger',
      'path',
      'locked',
      'safe',
      'hit',
      'reducedMotion',
      'diagramDescription',
      'overlayNote',
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

test('the charge diagram keeps the tank and monster illustrations', () => {
  const demo = {
    title: 'Charge',
    intro: 'Test',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    timeline: 'Timeline',
    speed: 'Speed',
    step: 'Phases',
    scenario: 'Path',
    sidestep: 'Side',
    retreat: 'Straight',
    boss: 'Boss',
    player: 'Player',
    danger: 'Danger',
    path: 'Path',
    locked: 'Locked',
    safe: 'Safe',
    hit: 'Hit',
    reducedMotion: 'Paused',
    diagramDescription: 'Diagram',
    overlayNote: 'Overlay',
    phaseNames: ['Aim', 'Lock', 'Charge', 'Recover'],
    phaseDescriptions: ['Aim', 'Lock', 'Charge', 'Recover'],
  };
  const markup = renderCharge(demo);
  assert.match(markup, /data-charge-boss data-charge-art="tank"/);
  assert.match(markup, /data-charge-player data-charge-art="monster"/);
});
