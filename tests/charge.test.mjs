import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTACK_DURATION,
  ATTACK_PLANS,
  chargeFrame,
  createChargePlan,
  DEFAULT_PLAN,
  distanceToSegment,
  DURATION,
  LANE_HALF_WIDTH,
  PHASE_ENDS,
  PLAYER_RADIUS,
} from '../src/charge-model.mjs';
import { CHARGE_ART, renderCharge, renderChargeThumbnail } from '../lib/charge-view.mjs';

test('aim follows movement, then each attack locks its direction before the dodge', () => {
  assert.deepEqual(ATTACK_PLANS[0].heading, { x: 0, y: 1 });
  assert.deepEqual(ATTACK_PLANS[1].heading, { x: 0, y: -1 });
  for (const offset of [0, ATTACK_DURATION]) {
    const aim = chargeFrame(offset + 0.45);
    assert.equal(aim.phase, 0);
    assert.deepEqual(aim.target, aim.player);
    assert.notEqual(aim.heading.x, 0);
    const locked = chargeFrame(offset + 1.3);
    assert.equal(locked.phase, 1);
    assert.deepEqual(locked.heading, ATTACK_PLANS[locked.attackIndex].heading);
    assert.deepEqual(locked.target, ATTACK_PLANS[locked.attackIndex].target);
    assert.notDeepEqual(locked.player, locked.target);
  }
});

test('a captured plan owns its coordinates and preserves a diagonal heading', () => {
  const target = { x: 300, y: 400 };
  const plan = createChargePlan({ origin: { x: 0, y: 0 }, target, distance: 1000 });
  target.y = -900;
  assert.deepEqual(plan.heading, { x: 0.6, y: 0.8 });
  assert.deepEqual(plan.target, { x: 300, y: 400 });
  assert.deepEqual(plan.end, { x: 600, y: 800 });
  assert.ok(Object.isFrozen(plan.heading));
  assert.deepEqual(chargeFrame(1.8, plan).heading, { x: 0.6, y: 0.8 });
});

test('the sideways dodge clears the entire body before both charges', () => {
  for (const attackOffset of [0, ATTACK_DURATION]) {
    const firstChargeFrame = chargeFrame(attackOffset + PHASE_ENDS[1]);
    assert.ok(
      distanceToSegment(
        firstChargeFrame.player,
        firstChargeFrame.plan.origin,
        firstChargeFrame.plan.end,
      ) >
        LANE_HALF_WIDTH + PLAYER_RADIUS,
    );
    for (let localTime = PHASE_ENDS[1]; localTime < ATTACK_DURATION; localTime += 0.025)
      assert.equal(chargeFrame(attackOffset + localTime).clear, true);
  }
});

test('the loop alternates sides and every displayed phase contains motion', () => {
  const firstCharge = chargeFrame(2.4);
  const secondCharge = chargeFrame(ATTACK_DURATION + 2.4);
  assert.equal(firstCharge.attackIndex, 0);
  assert.equal(secondCharge.attackIndex, 1);
  assert.ok(firstCharge.boss.y > DEFAULT_PLAN.origin.y);
  assert.ok(secondCharge.boss.y < ATTACK_PLANS[1].origin.y);
  assert.notDeepEqual(chargeFrame(0.1).boss, chargeFrame(0.7).boss);
  assert.notDeepEqual(chargeFrame(1).player, chargeFrame(1.5).player);
  assert.notDeepEqual(chargeFrame(1.8).boss, chargeFrame(2.8).boss);
  assert.equal(chargeFrame(DURATION).attackIndex, 0);
  assert.equal(chargeFrame(DURATION).phase, 0);
  assert.equal(chargeFrame(DURATION).time, DURATION);
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
      'timeline',
      'step',
      'boss',
      'player',
      'danger',
      'locked',
      'safe',
      'reducedMotion',
      'diagramDescription',
    ].map((key) => [key, 'ساحة <b> & </script>']),
  );
  words.phaseNames = ['أ', 'ب', 'ج'];
  words.phaseDescriptions = ['١', '٢', '٣'];
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

test('the diagram reuses shared art and exposes only a slider plus phase tooltips', () => {
  const demo = {
    title: 'Charge',
    timeline: 'Timeline',
    step: 'Phases',
    boss: 'Boss',
    player: 'Player',
    danger: 'Danger',
    locked: 'Locked',
    safe: 'Safe',
    reducedMotion: 'Autoplay disabled',
    diagramDescription: 'Diagram',
    phaseNames: ['Aim', 'Lock & dodge', 'Charge'],
    phaseDescriptions: ['Aim', 'Lock', 'Charge'],
  };
  const markup = renderCharge(demo);
  const thumbnail = renderChargeThumbnail('charge');
  assert.ok(markup.includes(CHARGE_ART.tank));
  assert.ok(markup.includes(CHARGE_ART.monster));
  assert.ok(thumbnail.includes(CHARGE_ART.tank));
  assert.ok(thumbnail.includes(CHARGE_ART.monster));
  assert.match(thumbnail, /data-charge-preview-boss/);
  assert.match(thumbnail, /data-charge-preview-player/);
  assert.doesNotMatch(markup, /<button|data-charge-play(?:\s|=|>)|data-charge-restart/);
  assert.equal(markup.match(/class="charge-demo__phase-tooltip"/g)?.length, 3);
  assert.equal(markup.match(/type="range"/g)?.length, 1);
  assert.equal(markup.match(/data-charge-dodge/g)?.length, 1);
});
