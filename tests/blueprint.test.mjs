import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLUEPRINT_DURATION,
  BLUEPRINT_MECHANIC_IDS,
  absorptionCharge,
  absorptionOutcome,
  activePhaseState,
  attackLockState,
  attackReflectionState,
  boundaryAttackState,
  bossAsTerrainState,
  chaseHerdingState,
  controlModeShiftState,
  escapePhaseState,
  relocatedArenaState,
  forcedScrollingOffset,
  forcedScrollingState,
  counterStanceOutcome,
  counterStanceState,
  blueprintFrame,
  blueprintPhaseAt,
  blueprintPointSafe,
  blueprintSpec,
  damageTypeResistanceDamage,
  directionalShieldOutcome,
  interruptibleWindUpOutcome,
  interruptibleWindUpState,
  loadoutAdaptationPackage,
  loadoutAdaptationState,
  partBreakCanFire,
  partBreakState,
  recoveryState,
  situationalImmunityOutcome,
  survivalPhaseState,
  teleportState,
  windUpProgress,
  windUpState,
} from '../src/blueprint-model.mjs';
import {
  blueprintPreviewLayout,
  renderBlueprint,
  renderBlueprintThumbnail,
} from '../lib/blueprint-view.mjs';

test('all 68 promoted lesson animations have distinct rule modes and complete moving frames', () => {
  assert.equal(BLUEPRINT_MECHANIC_IDS.length, 68);
  const modes = new Set();
  for (const id of BLUEPRINT_MECHANIC_IDS) {
    for (let time = 0; time <= BLUEPRINT_DURATION; time += 0.1) {
      const frame = blueprintFrame(id, time);
      modes.add(frame.mode);
      for (const value of [
        frame.boss.x,
        frame.boss.y,
        frame.player.x,
        frame.player.y,
        frame.bossLabel.x,
        frame.bossLabel.y,
      ])
        assert.ok(Number.isFinite(value), `${id} has invalid geometry at ${time}`);
      assert.ok(frame.primitives.length > 0, `${id} has no visible rule geometry`);
      for (const primitive of frame.primitives)
        for (const value of Object.values(primitive).filter((item) => typeof item === 'number'))
          assert.ok(Number.isFinite(value), `${id} has an invalid ${primitive.type}`);
    }
  }
  assert.equal(modes.size, 68);
});

test('every blueprint exposes signal, committed action, and recovery without player teleports', () => {
  assert.equal(blueprintPhaseAt(0), 0);
  assert.equal(blueprintPhaseAt(1.6), 1);
  assert.equal(blueprintPhaseAt(4.3), 2);

  for (const id of BLUEPRINT_MECHANIC_IDS) {
    assert.equal(blueprintFrame(id, 1.59).committed, false, id);
    assert.equal(blueprintFrame(id, 1.6).committed, true, id);
    if (
      id !== 'part-break' &&
      id !== 'counter-stance' &&
      id !== 'absorption-power-up' &&
      id !== 'interruptible-wind-up' &&
      id !== 'loadout-adaptation' &&
      id !== 'wind-up' &&
      id !== 'attack-lock' &&
      id !== 'active-phase' &&
      id !== 'recovery' &&
      id !== 'survival-phase' &&
      id !== 'teleport' &&
      id !== 'boundary-attack' &&
      id !== 'chase-herding' &&
      id !== 'escape-phase' &&
      id !== 'relocated-arena' &&
      id !== 'boss-as-terrain'
    )
      assert.equal(blueprintFrame(id, 3).dangerActive, true, id);
    assert.equal(blueprintFrame(id, 3).playerSafe, true, id);
    let previous = blueprintFrame(id, 0).player;
    for (let time = 0.02; time < BLUEPRINT_DURATION; time += 0.02) {
      const player = blueprintFrame(id, time).player;
      assert.ok(Math.hypot(player.x - previous.x, player.y - previous.y) < 18, `${id} teleports`);
      previous = player;
    }
  }
});

test('every damaging promoted animation derives safety from its own active geometry', () => {
  const unsafePoints = {
    'landing-jump': { x: 365, y: 600 },
    'single-shot': null,
    crossfire: null,
    'splitting-projectile': null,
    'returning-projectile': null,
    'orbiting-projectiles': null,
    'pulse-beam': null,
    'chain-explosions': null,
    mine: { x: 320, y: 610 },
    'moving-hazard': null,
    'converging-threats': { x: 100, y: 650 },
    pull: { x: 280, y: 310 },
    'turret-deployment': { x: 430, y: 700 },
    'threat-generator': null,
    decoy: { x: 190, y: 425 },
    'predictive-aiming': null,
    'source-tracking': null,
    'burst-fire': null,
    volley: null,
    'delayed-activation': { x: 350, y: 630 },
    'speed-change': null,
    'limited-spread': null,
    'attack-reflection': null,
    'forced-scrolling': { x: 350, y: 750 },
    'control-mode-shift': { x: 120, y: 724 },
    'wide-swing': { x: 280, y: 515 },
    lunge: { x: 300, y: 440 },
    grab: { x: 390, y: 485 },
    'burrow-and-emerge': { x: 420, y: 590 },
    'ring-volley': { x: 516, y: 400 },
    'spiral-barrage': { x: 280, y: 390 },
    'ricochet-projectile': { x: 330, y: 335 },
    'homing-projectile': null,
    'straight-beam': { x: 280, y: 600 },
    'scanning-beam': null,
    'rotating-beams': null,
    'marked-area-strike': { x: 380, y: 620 },
    shockwave: null,
    'lingering-hazard': { x: 360, y: 620 },
    'hazard-trail': { x: 190, y: 290 },
    'platform-destruction': { x: 189, y: 690 },
    'shrinking-safe-area': { x: 520, y: 850 },
    knockback: { x: 530, y: 900 },
    'target-lock': { x: 390, y: 620 },
    'attack-combination': null,
    'weak-point': { x: 500, y: 800 },
    telegraph: { x: 300, y: 500 },
    'fight-phase': { x: 280, y: 695 },
    enrage: { x: 280, y: 350 },
  };

  for (const id of BLUEPRINT_MECHANIC_IDS.filter(
    (id) =>
      id !== 'directional-shield' &&
      id !== 'damage-type-resistance' &&
      id !== 'situational-immunity' &&
      id !== 'part-break' &&
      id !== 'counter-stance' &&
      id !== 'absorption-power-up' &&
      id !== 'interruptible-wind-up' &&
      id !== 'loadout-adaptation' &&
      id !== 'wind-up' &&
      id !== 'attack-lock' &&
      id !== 'active-phase' &&
      id !== 'recovery' &&
      id !== 'survival-phase' &&
      id !== 'teleport' &&
      id !== 'boundary-attack' &&
      id !== 'chase-herding' &&
      id !== 'escape-phase' &&
      id !== 'relocated-arena' &&
      id !== 'boss-as-terrain',
  )) {
    const frame = blueprintFrame(id, 3);
    let point = unsafePoints[id];
    if (!point && id === 'homing-projectile') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'single-shot') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'speed-change') {
      point = frame.boss;
    } else if (!point && id === 'limited-spread') {
      const projectile = frame.primitives[3];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'attack-reflection') {
      const projectile = frame.primitives[6];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'crossfire') {
      const projectile = frame.primitives[4];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'splitting-projectile') {
      const projectile = frame.primitives.find(
        (primitive, index) => index >= 5 && primitive.type === 'circle' && primitive.opacity > 0.15,
      );
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'returning-projectile') {
      const projectile = frame.primitives[3];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'orbiting-projectiles') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'pulse-beam') {
      const beam = frame.primitives[1];
      point = { x: (beam.x1 + beam.x2) / 2, y: (beam.y1 + beam.y2) / 2 };
    } else if (!point && id === 'chain-explosions') {
      const blast = frame.primitives.find(
        (primitive) => primitive.type === 'circle' && primitive.tone === 'signal',
      );
      point = { x: blast.x, y: blast.y };
    } else if (!point && id === 'moving-hazard') {
      const hazard = frame.primitives[1];
      point = { x: hazard.x, y: hazard.y };
    } else if (!point && ['scanning-beam', 'rotating-beams'].includes(id)) {
      const beam = frame.primitives.find(
        (primitive) => primitive.type === 'line' && primitive.tone === 'signal',
      );
      point = { x: (beam.x1 + beam.x2) / 2, y: (beam.y1 + beam.y2) / 2 };
    } else if (!point && id === 'shockwave') {
      const wave = frame.primitives[0];
      point = { x: wave.x + wave.radius, y: wave.y };
    } else if (!point && id === 'attack-combination') {
      const wave = frame.primitives[1];
      point = { x: frame.boss.x + wave.radius, y: frame.boss.y };
    } else if (!point && id === 'threat-generator') {
      const mote = frame.primitives.find(
        (primitive) =>
          primitive.type === 'circle' && primitive.radius === 19 && primitive.opacity > 0,
      );
      point = { x: mote.x, y: mote.y };
    } else if (!point && id === 'predictive-aiming') {
      const shot = frame.primitives[3];
      point = { x: shot.x, y: shot.y };
    } else if (!point && id === 'source-tracking') {
      const beam = frame.primitives[3];
      point = { x: (beam.x1 + beam.x2) / 2, y: (beam.y1 + beam.y2) / 2 };
    } else if (!point && id === 'burst-fire') {
      const shot = frame.primitives[2];
      point = { x: shot.x, y: shot.y };
    } else if (!point && id === 'volley') {
      const shot = frame.primitives[7];
      point = { x: shot.x, y: shot.y };
    }
    assert.equal(blueprintPointSafe(id, 3, point), false, `${id} accepts an unsafe point`);
    assert.equal(frame.playerSafe, true, `${id} does not clear its own active geometry`);
  }
});

test('lock, destruction, and recovery are expressed by their own geometry', () => {
  const lockStart = blueprintFrame('target-lock', 0.8);
  const lockAction = blueprintFrame('target-lock', 3);
  assert.equal(lockStart.primitives[0].x, lockAction.primitives[0].x);
  assert.equal(lockStart.primitives[0].y, lockAction.primitives[0].y);
  assert.notDeepEqual(lockStart.player, lockAction.player);

  const platforms = blueprintFrame('platform-destruction', 3.4).primitives;
  assert.ok(platforms[1].opacity < platforms[0].opacity);
  assert.ok(platforms[2].opacity < platforms[3].opacity);
  const recoveredPlatforms = blueprintFrame('platform-destruction', 5.2).primitives;
  assert.equal(recoveredPlatforms[1].opacity, 0);
  assert.equal(recoveredPlatforms[2].opacity, 0);

  const activeBeam = blueprintFrame('straight-beam', 3).primitives[1];
  const recoveredBeam = blueprintFrame('straight-beam', 5.95).primitives[1];
  assert.ok(activeBeam.opacity > 0.9);
  assert.ok(recoveredBeam.opacity < 0.1);
});

test('rule-specific commitments stay visible through the response and recovery', () => {
  const ring = blueprintFrame('ring-volley', 3);
  assert.equal(ring.primitives[0].type, 'path');
  assert.equal(ring.primitives[1].tone, 'safe');
  assert.ok(ring.primitives[1].dash);

  const homing = blueprintFrame('homing-projectile', 4.15);
  const homingHead = homing.primitives[2];
  assert.ok(Math.hypot(homingHead.x - homing.player.x, homingHead.y - homing.player.y) > 80);
  assert.ok(homingHead.y > 650, 'homing projectile should continue straight after tracking ends');

  for (const time of [2, 3, 4]) {
    const rotating = blueprintFrame('rotating-beams', time);
    const arm = rotating.primitives[0];
    const armAngle = Math.atan2(arm.y2 - rotating.boss.y, arm.x2 - rotating.boss.x);
    const playerAngle = Math.atan2(
      rotating.player.y - rotating.boss.y,
      rotating.player.x - rotating.boss.x,
    );
    const wrappedOffset = Math.atan2(
      Math.sin(playerAngle - armAngle),
      Math.cos(playerAngle - armAngle),
    );
    assert.ok(Math.abs(wrappedOffset - Math.PI / 3) < 0.001);
  }

  const recoveringTrail = blueprintFrame('hazard-trail', 5.1).primitives.slice(1);
  assert.ok(recoveringTrail[0].opacity < recoveringTrail.at(-1).opacity);

  const compressedArena = blueprintFrame('shrinking-safe-area', 5.2).primitives;
  assert.equal(compressedArena[0].radius, 150);
  assert.equal(compressedArena[0].opacity, 1);

  const enragedRecovery = blueprintFrame('enrage', 5.2);
  assert.equal(enragedRecovery.bossScale, 1.1);
  assert.equal(enragedRecovery.primitives[0].opacity, 1);
  assert.ok(enragedRecovery.primitives.slice(1).every((primitive) => primitive.opacity === 0));
});

test('target lock commits before the marked player leaves', () => {
  const start = blueprintFrame('target-lock', 0);
  const beforeCommit = blueprintFrame('target-lock', 1.59);
  const afterCommit = blueprintFrame('target-lock', 2.8);
  assert.deepEqual(beforeCommit.player, start.player);
  assert.notDeepEqual(afterCommit.player, start.player);
  assert.equal(beforeCommit.primitives[0].x, afterCommit.primitives[0].x);
  assert.equal(beforeCommit.primitives[0].y, afterCommit.primitives[0].y);
});

test('landing jump locks its destination before takeoff and resolves the marked radius', () => {
  const signal = blueprintFrame('landing-jump', 1.4);
  const flight = blueprintFrame('landing-jump', 2.2);
  const impact = blueprintFrame('landing-jump', 3);
  const recovery = blueprintFrame('landing-jump', 4.8);

  assert.deepEqual(signal.player, blueprintFrame('landing-jump', 0).player);
  assert.equal(signal.primitives[1].x, impact.primitives[1].x);
  assert.equal(signal.primitives[1].y, impact.primitives[1].y);
  assert.ok(flight.bossMotion.lift > 0.5);
  assert.notDeepEqual(flight.boss, signal.boss);
  assert.equal(impact.dangerActive, true);
  assert.equal(blueprintPointSafe('landing-jump', 3, { x: 365, y: 600 }), false);
  assert.equal(impact.playerSafe, true);
  assert.equal(recovery.dangerActive, false);
  assert.ok(recovery.boss.x < impact.boss.x);
});

test('single shot locks one straight trajectory and lets the full player body sidestep it', () => {
  const signal = blueprintFrame('single-shot', 1.59);
  const release = blueprintFrame('single-shot', 1.6);
  const flight = blueprintFrame('single-shot', 3);
  const laterFlight = blueprintFrame('single-shot', 3.6);

  assert.deepEqual(signal.player, blueprintFrame('single-shot', 0).player);
  assert.deepEqual(release.player, signal.player);
  assert.equal(signal.primitives[0].x2, flight.primitives[0].x2);
  assert.equal(signal.primitives[0].y2, flight.primitives[0].y2);
  assert.ok(laterFlight.primitives[2].x > flight.primitives[2].x);
  assert.ok(laterFlight.primitives[2].y > flight.primitives[2].y);
  assert.equal(
    blueprintPointSafe('single-shot', 3, {
      x: flight.primitives[2].x,
      y: flight.primitives[2].y,
    }),
    false,
  );
  assert.equal(flight.playerSafe, true);
});

test('crossfire commits two opposing sources and clears their shared intersection', () => {
  const signal = blueprintFrame('crossfire', 1.59);
  const beforeCross = blueprintFrame('crossfire', 2.4);
  const intersection = blueprintFrame('crossfire', 3);
  const afterCross = blueprintFrame('crossfire', 3.6);

  assert.deepEqual(signal.player, blueprintFrame('crossfire', 0).player);
  assert.equal(signal.primitives[2].x2, intersection.primitives[2].x2);
  assert.equal(signal.primitives[3].x2, intersection.primitives[3].x2);
  const separation = (frame) => Math.abs(frame.primitives[4].x - frame.primitives[5].x);
  assert.ok(separation(intersection) < separation(beforeCross));
  assert.ok(separation(intersection) < separation(afterCross));
  assert.equal(
    blueprintPointSafe('crossfire', 3, {
      x: intersection.primitives[4].x,
      y: intersection.primitives[4].y,
    }),
    false,
  );
  assert.equal(intersection.playerSafe, true);
});

test('splitting projectile commits one parent, one split point, and three fragment routes', () => {
  const signal = blueprintFrame('splitting-projectile', 1.59);
  const parentFlight = blueprintFrame('splitting-projectile', 2.3);
  const split = blueprintFrame('splitting-projectile', 2.9);
  const fragments = blueprintFrame('splitting-projectile', 3.7);

  assert.deepEqual(signal.player, blueprintFrame('splitting-projectile', 0).player);
  assert.equal(signal.primitives[4].x, split.primitives[4].x);
  assert.equal(signal.primitives[4].y, split.primitives[4].y);
  assert.ok(parentFlight.primitives[5].opacity > 0.9);
  assert.ok(parentFlight.primitives.slice(6).every((projectile) => projectile.opacity === 0));
  assert.equal(fragments.primitives[5].opacity, 0);
  assert.ok(fragments.primitives.slice(6).every((projectile) => projectile.opacity > 0.9));
  assert.equal(new Set(fragments.primitives.slice(6).map((projectile) => projectile.x)).size, 3);
  assert.equal(
    blueprintPointSafe('splitting-projectile', 3.7, {
      x: fragments.primitives[7].x,
      y: fragments.primitives[7].y,
    }),
    false,
  );
  assert.equal(fragments.playerSafe, true);
});

test('returning projectile announces an outbound leg and a distinct committed return leg', () => {
  const signal = blueprintFrame('returning-projectile', 1.59);
  const outgoing = blueprintFrame('returning-projectile', 2.35);
  const turn = blueprintFrame('returning-projectile', 3);
  const returning = blueprintFrame('returning-projectile', 3.75);
  const nearOwner = blueprintFrame('returning-projectile', 4.2);

  assert.deepEqual(signal.player, blueprintFrame('returning-projectile', 0).player);
  assert.equal(signal.primitives[2].x, turn.primitives[2].x);
  assert.equal(signal.primitives[2].y, turn.primitives[2].y);
  assert.ok(outgoing.primitives[3].x < turn.primitives[3].x);
  assert.ok(returning.primitives[3].y > turn.primitives[3].y);
  const distanceFromOwner = (frame) =>
    Math.hypot(frame.primitives[3].x - frame.boss.x, frame.primitives[3].y - frame.boss.y);
  assert.ok(distanceFromOwner(nearOwner) < distanceFromOwner(returning));
  assert.equal(
    blueprintPointSafe('returning-projectile', 3.75, {
      x: returning.primitives[3].x,
      y: returning.primitives[3].y,
    }),
    false,
  );
  assert.equal(returning.playerSafe, true);
});

test('orbiting projectiles preserve radius, spacing, and a moving gap through commitment', () => {
  const signal = blueprintFrame('orbiting-projectiles', 1.59);
  const early = blueprintFrame('orbiting-projectiles', 2.2);
  const active = blueprintFrame('orbiting-projectiles', 3);
  const late = blueprintFrame('orbiting-projectiles', 4.1);

  assert.deepEqual(signal.player, blueprintFrame('orbiting-projectiles', 0).player);
  for (const frame of [signal, early, active, late]) {
    const distances = frame.primitives
      .slice(2)
      .map((projectile) => Math.hypot(projectile.x - frame.boss.x, projectile.y - frame.boss.y));
    assert.ok(distances.every((distance) => Math.abs(distance - 170) < 0.001));
  }
  const angles = active.primitives
    .slice(2)
    .map((projectile) => Math.atan2(projectile.y - active.boss.y, projectile.x - active.boss.x));
  const wrappedSteps = angles.map((angle, index) => {
    const next = angles[(index + 1) % angles.length];
    return (next - angle + Math.PI * 2) % (Math.PI * 2);
  });
  assert.ok(wrappedSteps.every((step) => Math.abs(step - (Math.PI * 2) / 5) < 0.001));
  assert.notDeepEqual(early.player, active.player);
  assert.equal(
    blueprintPointSafe('orbiting-projectiles', 3, {
      x: active.primitives[2].x,
      y: active.primitives[2].y,
    }),
    false,
  );
  assert.equal(active.playerSafe, true);
});

test('pulse beam keeps one lane, synchronizes collision, and crosses only during a pause', () => {
  const signal = blueprintFrame('pulse-beam', 1.59);
  const firstPulse = blueprintFrame('pulse-beam', 2);
  const pause = blueprintFrame('pulse-beam', 2.45);
  const secondPulse = blueprintFrame('pulse-beam', 3);
  const thirdPulse = blueprintFrame('pulse-beam', 3.85);

  assert.deepEqual(signal.player, blueprintFrame('pulse-beam', 0).player);
  for (const frame of [signal, firstPulse, pause, secondPulse, thirdPulse]) {
    assert.equal(frame.primitives[0].x1, 150);
    assert.equal(frame.primitives[0].y1, 340);
    assert.equal(frame.primitives[0].x2, 500);
    assert.equal(frame.primitives[0].y2, 700);
  }
  assert.equal(firstPulse.dangerActive, true);
  assert.equal(firstPulse.primitives[1].opacity, 1);
  assert.equal(pause.dangerActive, false);
  assert.equal(pause.primitives[1].opacity, 0);
  assert.notDeepEqual(pause.player, signal.player);
  assert.equal(secondPulse.dangerActive, true);
  assert.equal(secondPulse.primitives[1].opacity, 1);
  assert.equal(thirdPulse.dangerActive, true);
  assert.equal(blueprintPointSafe('pulse-beam', 3, { x: 325, y: 520 }), false);
  assert.equal(secondPulse.playerSafe, true);
});

test('chain explosions keep a fixed order, damage one live node, and let the player follow the wake', () => {
  const signal = blueprintFrame('chain-explosions', 1.59);
  const first = blueprintFrame('chain-explosions', 1.85);
  const gap = blueprintFrame('chain-explosions', 2.15);
  const third = blueprintFrame('chain-explosions', 3);
  const fifth = blueprintFrame('chain-explosions', 3.85);
  const expectedCenters = [
    [455, 650],
    [365, 560],
    [275, 650],
    [185, 560],
    [95, 650],
  ];

  assert.deepEqual(signal.player, blueprintFrame('chain-explosions', 0).player);
  for (const frame of [signal, first, gap, third, fifth])
    assert.deepEqual(
      frame.primitives.slice(1, 6).map(({ x, y }) => [x, y]),
      expectedCenters,
    );
  assert.equal(first.dangerActive, true);
  assert.equal(gap.dangerActive, false);
  assert.equal(third.dangerActive, true);
  assert.equal(
    third.primitives.slice(1, 6).filter((primitive) => primitive.tone === 'signal').length,
    1,
  );
  assert.equal(blueprintPointSafe('chain-explosions', 3, { x: 275, y: 650 }), false);
  assert.equal(blueprintPointSafe('chain-explosions', 3, { x: 455, y: 650 }), true);
  assert.equal(third.playerSafe, true);
  assert.ok(third.player.x > third.primitives[3].x, 'player should trail the live blast');
});

test('mine keeps one fixed radius, arms with collision, and lets the player route around it', () => {
  const signal = blueprintFrame('mine', 1.59);
  const armed = blueprintFrame('mine', 3);
  const recovery = blueprintFrame('mine', 5.2);
  const centers = [signal, armed, recovery].map((frame) => {
    const trigger = frame.primitives[2];
    return [trigger.x, trigger.y, trigger.radius];
  });

  assert.deepEqual(centers, [
    [320, 610, 96],
    [320, 610, 96],
    [320, 610, 96],
  ]);
  assert.equal(signal.dangerActive, false);
  assert.equal(blueprintPointSafe('mine', 1.59, { x: 320, y: 610 }), true);
  assert.equal(armed.dangerActive, true);
  assert.equal(blueprintPointSafe('mine', 3, { x: 320, y: 610 }), false);
  assert.equal(blueprintPointSafe('mine', 3, { x: 445, y: 610 }), true);
  assert.equal(armed.playerSafe, true);
  assert.equal(recovery.dangerActive, false);
  assert.equal(blueprintPointSafe('mine', 5.2, { x: 320, y: 610 }), true);
  assert.ok(armed.primitives[1].opacity > 0, 'armed mine should show the safe response route');
});

test('moving hazard carries its visible radius along a fixed lane while the player clears it', () => {
  const signal = blueprintFrame('moving-hazard', 1.59);
  const early = blueprintFrame('moving-hazard', 2.1);
  const middle = blueprintFrame('moving-hazard', 3);
  const late = blueprintFrame('moving-hazard', 3.9);
  const recovery = blueprintFrame('moving-hazard', 5.2);
  const circles = [signal, early, middle, late, recovery].map((frame) => frame.primitives[1]);

  assert.deepEqual(
    circles.map(({ radius }) => radius),
    [72, 72, 72, 72, 72],
  );
  assert.equal(circles[0].x, 105);
  assert.ok(circles[0].x < circles[1].x && circles[1].x < circles[2].x);
  assert.ok(circles[2].x < circles[3].x && circles[3].x <= circles[4].x);
  assert.ok(circles.every(({ y }) => y === 620));
  assert.equal(blueprintPointSafe('moving-hazard', 1.59, { x: 105, y: 620 }), true);
  assert.equal(blueprintPointSafe('moving-hazard', 3, { x: circles[2].x, y: 620 }), false);
  assert.equal(blueprintPointSafe('moving-hazard', 3, { x: circles[2].x, y: 503 }), true);
  assert.equal(middle.playerSafe, true);
  assert.equal(blueprintPointSafe('moving-hazard', 5.2, { x: 485, y: 620 }), true);
  assert.ok(middle.player.y < signal.player.y, 'player must move out of the moving lane');
});

test('two converging fronts close the lower corridor while the ordinary upper exit remains safe', () => {
  const signal = blueprintFrame('converging-threats', 1.59);
  const early = blueprintFrame('converging-threats', 2.1);
  const middle = blueprintFrame('converging-threats', 3);
  const late = blueprintFrame('converging-threats', 4.2);
  const recovery = blueprintFrame('converging-threats', 5.2);
  const widths = [signal, early, middle, late].map((frame) => frame.primitives[0].rectWidth);

  assert.equal(widths[0], 90);
  assert.ok(widths[0] < widths[1] && widths[1] < widths[2] && widths[2] < widths[3]);
  for (const frame of [signal, early, middle, late, recovery]) {
    const [left, right] = frame.primitives;
    assert.equal(left.x, 0);
    assert.equal(left.y, right.y);
    assert.equal(left.rectHeight, right.rectHeight);
    assert.equal(right.x + right.rectWidth, 560);
    assert.equal(right.x - left.rectWidth, 560 - left.rectWidth * 2);
    assert.ok(frame.primitives[2].x1 < frame.primitives[2].x2);
    assert.ok(frame.primitives[2].x2 < left.x + left.rectWidth);
    assert.ok(frame.primitives[4].x1 > frame.primitives[4].x2);
    assert.ok(frame.primitives[4].x2 > right.x);
  }
  assert.equal(blueprintPointSafe('converging-threats', 1.59, { x: 280, y: 650 }), true);
  assert.equal(blueprintPointSafe('converging-threats', 3, { x: 100, y: 650 }), false);
  assert.equal(blueprintPointSafe('converging-threats', 3, { x: 460, y: 650 }), false);
  assert.equal(blueprintPointSafe('converging-threats', 3, { x: 280, y: 650 }), true);
  assert.equal(blueprintPointSafe('converging-threats', 4.2, { x: 280, y: 650 }), false);
  assert.equal(blueprintPointSafe('converging-threats', 4.2, { x: 280, y: 455 }), true);
  assert.equal(late.playerSafe, true);
  assert.ok(late.player.y < signal.player.y);
  assert.equal(blueprintPointSafe('converging-threats', 5.2, { x: 280, y: 650 }), true);
});

test('pull displaces the player toward its source but only the visible core deals damage', () => {
  const signal = blueprintFrame('pull', 1.59);
  const early = blueprintFrame('pull', 2);
  const middle = blueprintFrame('pull', 3);
  const late = blueprintFrame('pull', 4.29);
  const recovery = blueprintFrame('pull', 5.2);
  assert.equal(signal.primitives[0].radius, 445);
  assert.equal(middle.primitives[0].fill, 0);
  assert.equal(middle.primitives[1].radius, 82);
  assert.equal(middle.primitives[1].tone, 'signal');
  assert.ok(early.player.y < signal.player.y, 'pull must visibly displace Tavi toward Kern');
  assert.ok(late.player.x > middle.player.x, 'ordinary lateral steering must remain useful');
  assert.equal(blueprintPointSafe('pull', 1.59, { x: 280, y: 300 }), true);
  assert.equal(blueprintPointSafe('pull', 3, { x: 280, y: 360 }), false);
  assert.equal(blueprintPointSafe('pull', 3, { x: 280, y: 420 }), true);
  assert.equal(blueprintPointSafe('pull', 3, { x: 280, y: 420 }, 60), false);
  assert.equal(middle.playerSafe, true);
  assert.equal(late.playerSafe, true);
  assert.equal(blueprintPointSafe('pull', 5.2, { x: 280, y: 300 }), true);
  assert.ok(recovery.primitives[1].opacity < late.primitives[1].opacity);
});

test('deployed turret stays fixed, announces its lane, and only fires while visibly active', () => {
  const placement = blueprintFrame('turret-deployment', 1.59);
  const warming = blueprintFrame('turret-deployment', 1.95);
  const firing = blueprintFrame('turret-deployment', 3);
  const ended = blueprintFrame('turret-deployment', 4.2);
  const recovery = blueprintFrame('turret-deployment', 5.2);
  for (const frame of [placement, warming, firing, ended]) {
    assert.equal(frame.primitives[2].x, 430);
    assert.equal(frame.primitives[2].y, 480);
    assert.equal(frame.primitives[7].x1, 430);
    assert.equal(frame.primitives[7].x2, 430);
  }
  assert.equal(placement.primitives[6].dash, '15 11');
  assert.equal(placement.primitives[7].opacity, 0);
  assert.equal(warming.dangerActive, false);
  assert.equal(firing.dangerActive, true);
  assert.equal(firing.primitives[7].opacity, 0.94);
  assert.equal(ended.dangerActive, false);
  assert.equal(ended.primitives[7].opacity, 0);
  assert.equal(blueprintPointSafe('turret-deployment', 1.59, { x: 430, y: 680 }), true);
  assert.equal(blueprintPointSafe('turret-deployment', 1.95, { x: 430, y: 680 }), true);
  assert.equal(blueprintPointSafe('turret-deployment', 3, { x: 430, y: 680 }), false);
  assert.equal(blueprintPointSafe('turret-deployment', 3, { x: 382, y: 680 }), true);
  assert.equal(blueprintPointSafe('turret-deployment', 3, { x: 382, y: 680 }, 40), false);
  assert.equal(firing.playerSafe, true);
  assert.ok(firing.player.x < placement.player.x);
  assert.equal(blueprintPointSafe('turret-deployment', 5.2, { x: 430, y: 680 }), true);
  assert.ok(recovery.primitives[2].opacity < firing.primitives[2].opacity);
});

test('threat generator announces a fixed source, emits separate motes, and ends cleanly', () => {
  const id = 'threat-generator';
  const motes = (time) =>
    blueprintFrame(id, time).primitives.filter(
      (primitive) =>
        primitive.type === 'circle' && primitive.radius === 19 && primitive.opacity > 0,
    );
  assert.equal(blueprintFrame(id, 1.59).dangerActive, false);
  assert.equal(motes(1.59).length, 0);
  assert.equal(motes(2).length, 1);
  assert.equal(motes(2.65).length, 2, 'overlapping flights must respect the live-object budget');
  assert.equal(motes(3).length, 1);
  assert.equal(motes(3.42).length, 2);
  assert.equal(motes(4.28).length, 0);
  assert.equal(blueprintFrame(id, 4.28).dangerActive, false);
  assert.equal(blueprintFrame(id, 5).dangerActive, false);
  assert.equal(blueprintPointSafe(id, 1.59, { x: 405, y: 487 }), true);
  const live = motes(3)[0];
  assert.equal(blueprintPointSafe(id, 3, { x: live.x, y: live.y }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: live.x - 44, y: live.y }), true);
  assert.equal(blueprintPointSafe(id, 3, { x: live.x - 44, y: live.y }, 26), false);
  for (let time = 1.86; time <= 4.23; time += 0.03)
    assert.equal(blueprintFrame(id, time).playerSafe, true, `player clips a mote at ${time}`);
  assert.deepEqual(blueprintFrame(id, 3), blueprintFrame(id, 3));
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
});

test('decoy separates identity from contact, lets Tavi choose the real body, and fades cleanly', () => {
  const id = 'decoy';
  const signal = blueprintFrame(id, 1.59);
  const action = blueprintFrame(id, 3);
  const recovery = blueprintFrame(id, 5.9);
  assert.equal(signal.dangerActive, false);
  assert.ok(signal.decoy.x > signal.boss.x + 200);
  assert.equal(action.boss.x, 190);
  assert.equal(action.boss.y, 425);
  assert.equal(action.decoy.x, 410);
  assert.equal(action.decoy.y, 425);
  assert.equal(action.decoy.opacity, 0.65);
  assert.equal(action.primitives[4].dash, '');
  assert.equal(action.primitives[5].dash, '20 14');
  assert.equal(action.primitives[6].dash, '8 9');
  assert.equal(blueprintPointSafe(id, 3, action.boss), false);
  assert.equal(blueprintPointSafe(id, 3, action.decoy), true);
  assert.equal(action.playerSafe, true);
  assert.ok(recovery.decoy.opacity < 0.01);
  assert.equal(recovery.dangerActive, false);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  const page = renderBlueprint(
    {
      title: 'Decoy',
      timeline: 'Timeline',
      phaseNames: ['Split', 'Choose', 'Recover'],
      phaseDescriptions: ['Split.', 'Choose.', 'Recover.'],
      boss: 'Boss',
      player: 'Player',
      reducedMotion: 'Scrub the timeline.',
      diagramDescription: 'The boss creates a decoy.',
    },
    id,
  );
  const preview = renderBlueprintThumbnail(id, 'test-decoy');
  assert.match(page, /data-blueprint-decoy/);
  assert.match(page, /data-character-art="kern-decoy"/);
  assert.match(preview, /data-character-art-preview="kern-decoy"/);
});

test('predictive aiming commits an observable forecast and only its travelling shot can hit', () => {
  const id = 'predictive-aiming';
  const start = blueprintFrame(id, 0);
  const sample = blueprintFrame(id, 1.59);
  const lock = blueprintFrame(id, 1.6);
  const action = blueprintFrame(id, 3);
  const cleared = blueprintFrame(id, 3.8);
  assert.equal(start.predicted.x - start.player.x, 80);
  assert.equal(sample.predicted.x - sample.player.x, 80);
  assert.equal(lock.predicted.x, 500);
  assert.equal(action.predicted.x, lock.predicted.x);
  assert.equal(action.player.x, 300);
  assert.ok(action.primitives[3].x < action.predicted.x);
  assert.equal(blueprintPointSafe(id, 0, start.predicted), true);
  assert.equal(blueprintPointSafe(id, 3, action.predicted), true);
  assert.equal(blueprintPointSafe(id, 3, action.primitives[3]), false);
  assert.equal(action.playerSafe, true);
  assert.equal(cleared.primitives[3].opacity, 0);
  assert.equal(cleared.dangerActive, false);
  assert.deepEqual(start.player, blueprintFrame(id, 6).player);
  const page = renderBlueprint(
    {
      title: 'Predictive aiming',
      timeline: 'Timeline',
      phaseNames: ['Sample', 'Commit', 'Clear'],
      phaseDescriptions: ['Sample.', 'Commit.', 'Clear.'],
      boss: 'Boss',
      player: 'Player',
      reducedMotion: 'Scrub the timeline.',
      diagramDescription: 'The boss commits one shot to a forecast.',
    },
    id,
  );
  const preview = renderBlueprintThumbnail(id, 'test-predictive-aiming');
  assert.match(page, /data-blueprint-id="predictive-aiming"/);
  assert.match(page, /data-character-art="kern"/);
  assert.match(preview, /data-character-art-preview="tavi"/);
});

test('source tracking turns its emitter before lock and keeps the damaging beam fixed', () => {
  const id = 'source-tracking';
  const spec = blueprintSpec(id);
  const start = blueprintFrame(id, 0);
  const lock = blueprintFrame(id, 1.6);
  const cue = blueprintFrame(id, 2.35);
  const active = blueprintFrame(id, 3);
  const end = blueprintFrame(id, 3.81);
  assert.ok(lock.sourceAngle > start.sourceAngle);
  for (let time = 0.02; time <= 1.6; time += 0.02) {
    const previous = blueprintFrame(id, time - 0.02);
    const current = blueprintFrame(id, time);
    assert.ok(
      (current.sourceAngle - previous.sourceAngle) / 0.02 <= spec.maximumTurnRate + 0.01,
      `emitter exceeds its turn speed at ${time}`,
    );
  }
  assert.equal(cue.sourceAngle, lock.sourceAngle);
  assert.equal(active.sourceAngle, lock.sourceAngle);
  assert.equal(cue.primitives[3].opacity, 0);
  assert.ok(active.primitives[3].opacity > 0.9);
  assert.equal(end.primitives[3].opacity, 0);
  assert.equal(blueprintPointSafe(id, 1.3, blueprintFrame(id, 1.3).player), true);
  const beam = active.primitives[3];
  assert.equal(
    blueprintPointSafe(id, 3, { x: (beam.x1 + beam.x2) / 2, y: (beam.y1 + beam.y2) / 2 }),
    false,
  );
  assert.equal(active.playerSafe, true);
  assert.deepEqual(start.player, blueprintFrame(id, 6).player);
  assert.equal(start.sourceAngle, blueprintFrame(id, 6).sourceAngle);
});

test('burst fire emits three separate fixed-lane shots and remains unsafe until the last exits', () => {
  const id = 'burst-fire';
  const spec = blueprintSpec(id);
  const before = blueprintFrame(id, 1.89);
  const first = blueprintFrame(id, 1.91);
  const between = blueprintFrame(id, 2.3);
  const second = blueprintFrame(id, 2.46);
  const third = blueprintFrame(id, 3.01);
  const lastFlight = blueprintFrame(id, 4.2);
  const recovered = blueprintFrame(id, 4.3);
  assert.equal(before.primitives.slice(2, 5).filter((shot) => shot.opacity > 0).length, 0);
  assert.equal(first.primitives.slice(2, 5).filter((shot) => shot.opacity > 0).length, 1);
  assert.equal(between.primitives.slice(2, 5).filter((shot) => shot.opacity > 0).length, 1);
  assert.equal(second.primitives.slice(2, 5).filter((shot) => shot.opacity > 0).length, 2);
  assert.equal(third.primitives.slice(2, 5).filter((shot) => shot.opacity > 0).length, 3);
  assert.ok(third.primitives[2].y > third.primitives[3].y);
  assert.ok(third.primitives[3].y > third.primitives[4].y);
  assert.equal(lastFlight.primitives[4].opacity > 0, true);
  assert.equal(
    recovered.primitives.slice(2, 5).every((shot) => shot.opacity === 0),
    true,
  );
  assert.equal(lastFlight.dangerActive, true);
  assert.equal(recovered.dangerActive, false);
  for (const time of [1.91, 2.46, 3.01, 3.6, 4.2]) {
    const frame = blueprintFrame(id, time);
    assert.equal(frame.playerSafe, true);
    for (const shot of frame.primitives
      .slice(2, 5)
      .filter((projectile) => projectile.opacity > 0)) {
      assert.equal(blueprintPointSafe(id, time, shot), false);
      const lineProgress = (shot.y - spec.emitter[1]) / (spec.shotEnd[1] - spec.emitter[1]);
      assert.ok(
        Math.abs(shot.x - (spec.emitter[0] + lineProgress * (spec.shotEnd[0] - spec.emitter[0]))) <
          0.001,
      );
    }
  }
  assert.equal(blueprintPointSafe(id, 1.89, { x: spec.emitter[0], y: spec.emitter[1] }), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-burst-fire'),
    /data-blueprint-preview="burst-fire"/,
  );
});

test('volley launches three parallel bolts together with a reachable outer edge', () => {
  const id = 'volley';
  const spec = blueprintSpec(id);
  const shotsAt = (time) => blueprintFrame(id, time).primitives.slice(7, 10);
  assert.equal(shotsAt(1.99).filter((shot) => shot.opacity > 0).length, 0);
  assert.equal(shotsAt(2.01).filter((shot) => shot.opacity > 0).length, 3);
  for (const time of [2.01, 2.8, 3.49]) {
    const frame = blueprintFrame(id, time);
    const shots = shotsAt(time);
    assert.deepEqual(
      shots.map((shot) => shot.x),
      spec.lanes,
    );
    assert.equal(new Set(shots.map((shot) => shot.y)).size, 1);
    assert.equal(frame.playerSafe, true);
    assert.equal(frame.dangerActive, true);
    for (const shot of shots) {
      assert.ok(shot.opacity > 0.9);
      assert.equal(blueprintPointSafe(id, time, shot), false);
    }
  }
  const crossingY = shotsAt(2.8)[0].y;
  assert.equal(blueprintPointSafe(id, 2.8, { x: 235, y: crossingY }), false);
  assert.equal(blueprintPointSafe(id, 2.8, { x: 475, y: crossingY }), true);
  assert.equal(blueprintFrame(id, 3.51).dangerActive, false);
  assert.equal(shotsAt(3.51).filter((shot) => shot.opacity > 0).length, 0);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(renderBlueprintThumbnail(id, 'test-volley'), /data-blueprint-preview="volley"/);
});

test('delayed rune remains safe through its countdown, then activates at its fixed center', () => {
  const id = 'delayed-activation';
  const rune = { x: 350, y: 630 };
  const spec = blueprintSpec(id);
  assert.equal(spec.radius, 82);
  assert.equal(spec.activatesAt, 2.9);
  assert.equal(spec.expiresAt, 4);
  for (const time of [0, 1.59, 1.6, 2.89, 2.9, 3.4, 3.99, 4, 4.3, 5.9]) {
    const frame = blueprintFrame(id, time);
    const lit = time >= 2.9 && time < 4;
    assert.equal(frame.dangerActive, lit, `danger at ${time}`);
    assert.equal(blueprintPointSafe(id, time, rune), !lit, `rune center at ${time}`);
    assert.equal(frame.primitives[1].x, rune.x);
    assert.equal(frame.primitives[1].y, rune.y);
    assert.equal(frame.primitives[1].radius, 82);
    assert.equal(frame.playerSafe, true, `player collision at ${time}`);
  }
  assert.equal(blueprintFrame(id, 1.6).player.x, 350);
  assert.ok(blueprintFrame(id, 2.89).player.x > 456);
  assert.equal(blueprintPointSafe(id, 3, { x: 456, y: 630 }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: 457, y: 630 }), true);
  assert.equal(blueprintFrame(id, 3.4).primitives[1].tone, 'signal');
  assert.equal(blueprintFrame(id, 2.7).primitives[1].tone, 'accent');
  for (let time = 0; time < 6; time += 0.02)
    assert.equal(blueprintFrame(id, time).playerSafe, true, `full-body clearance at ${time}`);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-delayed-activation'),
    /data-blueprint-preview="delayed-activation"/,
  );
});

test('speed change keeps one route, accelerates at its rune, and clears the whole player', () => {
  const id = 'speed-change';
  const spec = blueprintSpec(id);
  assert.equal(spec.switchX, 260);
  assert.equal(spec.switchAt, 2.8);
  assert.equal(spec.finishAt, 3.45);
  assert.equal(blueprintFrame(id, 1.6).boss.x, 140);
  assert.equal(blueprintFrame(id, 2.8).boss.x, 260);
  assert.equal(blueprintFrame(id, 3.45).boss.x, 440);
  const slowDistance = blueprintFrame(id, 2.4).boss.x - blueprintFrame(id, 2.3).boss.x;
  const fastDistance = blueprintFrame(id, 3.1).boss.x - blueprintFrame(id, 3).boss.x;
  assert.ok(fastDistance > slowDistance * 2.7);
  for (const time of [0, 1.59, 1.6, 2.79, 2.8, 3.44, 3.45, 4.3, 5.8]) {
    const frame = blueprintFrame(id, time);
    assert.equal(frame.boss.y, spec.laneY);
    assert.equal(frame.dangerActive, time >= 1.6 && time < 3.45);
    assert.equal(frame.playerSafe, true);
    assert.equal(blueprintPointSafe(id, time, frame.boss), !frame.dangerActive);
    assert.equal(frame.primitives[0].rectHeight, 114);
  }
  assert.equal(blueprintFrame(id, 2.79).primitives[2].tone, 'accent');
  assert.equal(blueprintFrame(id, 2.8).primitives[2].tone, 'signal');
  assert.ok(blueprintFrame(id, 3.15).primitives[3].opacity > 0.8);
  assert.equal(blueprintFrame(id, 3.45).primitives[3].opacity, 0);
  const bossX = blueprintFrame(id, 3.1).boss.x;
  assert.equal(blueprintPointSafe(id, 3.1, { x: bossX, y: 700 }), false);
  assert.equal(blueprintPointSafe(id, 3.1, { x: bossX, y: 703 }), true);
  for (let time = 0; time < 6; time += 0.02)
    assert.equal(blueprintFrame(id, time).playerSafe, true, `full-body clearance at ${time}`);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-speed-change'),
    /data-blueprint-preview="speed-change"/,
  );
});

test('limited spread varies shot directions inside a fixed visible cone and clears the whole player', () => {
  const id = 'limited-spread';
  const spec = blueprintSpec(id);
  assert.equal(spec.coneHalfAngle, 0.2);
  assert.deepEqual(spec.releases, [1.85, 2.4, 2.95]);
  assert.ok(spec.offsets.every((offset) => Math.abs(offset) <= spec.coneHalfAngle));
  assert.deepEqual(
    blueprintFrame(id, 0).primitives[0].data,
    blueprintFrame(id, 2.8).primitives[0].data,
  );
  assert.ok(blueprintFrame(id, 1.59).primitives[0].opacity > 0.7);
  assert.equal(blueprintFrame(id, 1.84).dangerActive, false);
  assert.equal(blueprintFrame(id, 1.85).dangerActive, true);
  assert.equal(blueprintFrame(id, 4.24).dangerActive, true);
  assert.equal(blueprintFrame(id, 4.25).dangerActive, false);
  assert.equal(
    blueprintFrame(id, 4.25)
      .primitives.slice(3, 6)
      .every((shot) => shot.opacity === 0),
    true,
  );
  assert.ok(blueprintFrame(id, 2.28).player.x > 464);
  const shot = blueprintFrame(id, 3).primitives[3];
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x, y: shot.y }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x + 41, y: shot.y }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x + 43, y: shot.y }), true);
  const shotPositions = [1.85, 2.4, 2.95].map((release, index) => {
    const shotAt = blueprintFrame(id, release + 0.5).primitives[3 + index];
    return (shotAt.x - spec.emitter[0]) / (shotAt.y - spec.emitter[1]);
  });
  assert.ok(new Set(shotPositions.map((angle) => angle.toFixed(3))).size === 3);
  assert.ok(shotPositions.every((slope) => Math.abs(Math.atan(slope)) <= spec.coneHalfAngle));
  for (let time = 0; time < 6; time += 0.02)
    assert.equal(blueprintFrame(id, time).playerSafe, true, `full-body clearance at ${time}`);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-limited-spread'),
    /data-blueprint-preview="limited-spread"/,
  );
});

test('directional shield blocks its marked front arc but permits a reachable flank', () => {
  const id = 'directional-shield';
  const spec = blueprintSpec(id);
  assert.equal(spec.guardHalfAngle, 0.9);
  assert.equal(directionalShieldOutcome(2.05, { x: 280, y: 535 }), 'blocked');
  assert.equal(directionalShieldOutcome(2.05, { x: 390, y: 430 }), 'hit');
  assert.equal(directionalShieldOutcome(2.05, { x: 500, y: 430 }), 'out-of-range');
  assert.equal(directionalShieldOutcome(3.84, { x: 280, y: 535 }), 'blocked');
  assert.equal(directionalShieldOutcome(3.85, { x: 280, y: 535 }), 'hit');
  const front = blueprintFrame(id, 2.05);
  const flank = blueprintFrame(id, 3.55);
  assert.equal(front.frontStrike, true);
  assert.equal(front.sideStrike, false);
  assert.equal(flank.frontStrike, false);
  assert.equal(flank.sideStrike, true);
  assert.ok(front.primitives[1].opacity > 0.9);
  assert.ok(front.primitives[4].opacity > 0);
  assert.ok(flank.primitives[6].opacity > 0);
  assert.ok(flank.player.x > front.player.x + 90);
  assert.ok(flank.player.y < front.player.y - 90);
  assert.equal(blueprintFrame(id, 3.84).dangerActive, true);
  assert.equal(blueprintFrame(id, 3.85).dangerActive, false);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-directional-shield'),
    /data-blueprint-preview="directional-shield"/,
  );
});

test('damage-type resistance reduces a connected slash without changing the target', () => {
  const id = 'damage-type-resistance';
  const spec = blueprintSpec(id);
  assert.equal(damageTypeResistanceDamage('slash'), 20);
  assert.equal(damageTypeResistanceDamage('thrust'), 100);
  assert.throws(() => damageTypeResistanceDamage('fire'), /unknown damage type/i);
  const slash = blueprintFrame(id, spec.slashStrike);
  const thrust = blueprintFrame(id, spec.thrustStrike);
  assert.equal(slash.resistedStrike, true);
  assert.equal(slash.normalStrike, false);
  assert.equal(thrust.resistedStrike, false);
  assert.equal(thrust.normalStrike, true);
  assert.deepEqual(slash.damageComparison, { slash: 20, thrust: 100 });
  assert.equal(slash.primitives[2].x, thrust.primitives[4].x);
  assert.equal(slash.primitives[2].y, thrust.primitives[4].y);
  assert.ok(slash.primitives[2].opacity > 0);
  assert.ok(thrust.primitives[4].opacity > 0);
  assert.equal(slash.primitives[6].rectWidth, 20);
  assert.equal(slash.primitives[8].rectWidth, 0);
  assert.equal(thrust.primitives[6].rectWidth, 20);
  assert.equal(thrust.primitives[8].rectWidth, 100);
  assert.ok(blueprintFrame(id, 4.5).primitives[0].opacity > 0);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-damage-type-resistance'),
    /data-blueprint-preview="damage-type-resistance"/,
  );
});

test('situational immunity blocks the whole boss until the linked ward is cut', () => {
  const id = 'situational-immunity';
  const spec = blueprintSpec(id);
  assert.equal(situationalImmunityOutcome(0), 'immune');
  assert.equal(situationalImmunityOutcome(2.05), 'immune');
  assert.equal(situationalImmunityOutcome(2.79, 'ward'), 'breakable');
  assert.equal(situationalImmunityOutcome(2.8, 'ward'), 'broken');
  assert.equal(situationalImmunityOutcome(2.8), 'vulnerable');
  assert.equal(situationalImmunityOutcome(4.29), 'vulnerable');
  assert.equal(situationalImmunityOutcome(4.3), 'immune');
  assert.throws(() => situationalImmunityOutcome(2.8, 'head'), /unknown immunity target/i);
  const blocked = blueprintFrame(id, spec.blockedStrike);
  const ward = blueprintFrame(id, spec.wardStrike);
  const exposed = blueprintFrame(id, spec.openStrike);
  const restored = blueprintFrame(id, spec.shieldReturns);
  assert.equal(blocked.blockedStrike, true);
  assert.equal(ward.wardStrike, true);
  assert.equal(exposed.openStrike, true);
  assert.ok(blocked.primitives[0].opacity > 0.7);
  assert.ok(blocked.primitives[6].opacity > 0.7);
  assert.ok(ward.primitives[8].opacity > 0.7);
  assert.ok(exposed.primitives[0].opacity < 0.1);
  assert.ok(exposed.primitives[10].opacity > 0.7);
  assert.ok(restored.primitives[0].opacity > 0.7);
  assert.equal(exposed.primitives[10].x, spec.boss[0] + 38);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-situational-immunity'),
    /data-blueprint-preview="situational-immunity"/,
  );
});

test('breaking the arm launcher removes its exact attack until a visible repair', () => {
  const id = 'part-break';
  const spec = blueprintSpec(id);
  assert.equal(partBreakState(0), 'attached');
  assert.equal(partBreakState(2.87), 'attached');
  assert.equal(partBreakState(2.88), 'broken');
  assert.equal(partBreakState(4.94), 'broken');
  assert.equal(partBreakState(4.95), 'repairing');
  assert.equal(partBreakState(5.35), 'attached');
  assert.equal(partBreakCanFire(2.87), true);
  assert.equal(partBreakCanFire(2.88), false);
  assert.equal(partBreakCanFire(5.35), true);
  const first = blueprintFrame(id, 2);
  const broken = blueprintFrame(id, spec.breakAt);
  const retry = blueprintFrame(id, spec.secondAttempt);
  const repaired = blueprintFrame(id, spec.repairEnd);
  assert.equal(first.dangerActive, true);
  assert.ok(first.primitives[5].opacity > 0.9);
  assert.equal(blueprintPointSafe(id, 2, { x: 415, y: 405 }), false);
  assert.equal(first.playerSafe, true);
  assert.equal(broken.partStrike, true);
  assert.ok(broken.primitives[7].opacity > 0.9);
  assert.equal(retry.secondAttempt, true);
  assert.equal(retry.launcherCanFire, false);
  assert.equal(retry.primitives[5].opacity, 0);
  assert.ok(retry.primitives[8].opacity > 0.9);
  assert.equal(blueprintPointSafe(id, spec.secondAttempt, { x: 415, y: 405 }), true);
  assert.deepEqual(retry.player, { x: 415, y: 405 });
  assert.equal(repaired.launcherCanFire, true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-part-break'),
    /data-blueprint-preview="part-break"/,
  );
});

test('reflection transfers one sword pulse into a dodgeable hostile return', () => {
  const id = 'attack-reflection';
  const spec = blueprintSpec(id);
  assert.equal(attackReflectionState(2.34), 'guarded');
  assert.equal(attackReflectionState(2.35), 'reflected');
  assert.equal(attackReflectionState(3.35), 'guarded');
  assert.equal(attackReflectionState(4.3), 'open');
  assert.equal(attackReflectionState(5.28), 'raising');
  assert.equal(attackReflectionState(5.63), 'guarded');
  const outgoing = blueprintFrame(id, 2.05);
  const contact = blueprintFrame(id, spec.reflected[0]);
  const returnShot = blueprintFrame(id, 2.9);
  const open = blueprintFrame(id, spec.meleeStrike);
  assert.equal(outgoing.outgoingShot, true);
  assert.equal(outgoing.dangerActive, false);
  assert.ok(outgoing.primitives[3].opacity > 0.9);
  assert.equal(outgoing.primitives[6].opacity, 0);
  assert.equal(contact.primitives[3].opacity, 0);
  assert.ok(contact.primitives[4].opacity > 0.9);
  assert.equal(returnShot.reflectedShot, true);
  assert.equal(returnShot.primitives[3].opacity, 0);
  assert.ok(returnShot.primitives[6].opacity > 0.9);
  assert.equal(blueprintPointSafe(id, 2.9, { x: returnShot.primitives[6].x, y: 405 }), false);
  assert.equal(returnShot.playerSafe, true);
  assert.ok(returnShot.player.y > 405 + spec.boltRadius + 24);
  assert.equal(open.reflectionState, 'open');
  assert.equal(open.meleeStrike, true);
  assert.ok(open.primitives[8].opacity > 0.9);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-attack-reflection'),
    /data-blueprint-preview="attack-reflection"/,
  );
});

test('counter stance ripostes only after a guarded sword hit and leaves an untriggered opening', () => {
  const id = 'counter-stance';
  const spec = blueprintSpec(id);
  assert.equal(counterStanceOutcome(1.88, true), 'parried-counter');
  assert.equal(counterStanceOutcome(4.0, false), 'no-trigger');
  assert.equal(counterStanceOutcome(4.96, true), 'hit');
  assert.equal(counterStanceState(1.4), 'guarded');
  assert.equal(counterStanceState(2.5), 'riposte');
  assert.equal(counterStanceState(4), 'guarded-withheld');
  assert.equal(counterStanceState(4.6), 'open');
  const parry = blueprintFrame(id, spec.parriedStrike);
  const riposte = blueprintFrame(id, 2.62);
  const withheld = blueprintFrame(id, 4);
  const open = blueprintFrame(id, spec.openStrike);
  assert.equal(parry.parriedStrike, true);
  assert.ok(parry.primitives[3].opacity > 0.9);
  assert.equal(riposte.riposte, true);
  assert.ok(riposte.primitives[5].opacity > 0.9, 'the counter is an independent attack');
  assert.equal(blueprintPointSafe(id, 2.62, { x: 390, y: 421 }), false);
  assert.equal(riposte.playerSafe, true);
  assert.ok(riposte.player.y > spec.counterStart[1] + spec.counterHalfWidth + 24);
  assert.equal(withheld.dangerActive, false);
  assert.ok(withheld.primitives[0].opacity > 0.9, 'the second guard is visible');
  assert.equal(withheld.primitives[5].opacity, 0, 'waiting does not create a counter');
  assert.equal(open.openStrike, true);
  assert.ok(open.primitives[7].opacity > 0.9);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-counter-stance'),
    /data-blueprint-preview="counter-stance"/,
  );
});

test('blueprint pages and previews reuse Tavi and Kern with accessible localized data', () => {
  const demo = {
    title: 'Wide swing rule',
    timeline: 'Timeline',
    phaseNames: ['Signal', 'Response', 'Recovery'],
    phaseDescriptions: ['Read the arc.', 'Leave the arc.', 'Use the safe side.'],
    boss: 'Boss',
    player: 'Player',
    reducedMotion: 'Use the timeline.',
    diagramDescription: 'A boss signals a wide arc and the player leaves it.',
  };
  const page = renderBlueprint(demo, 'wide-swing');
  const preview = renderBlueprintThumbnail('wide-swing', 'test-wide-swing');
  assert.match(page, /data-blueprint-id="wide-swing"/);
  assert.match(page, /data-character-art="kern"/);
  assert.match(page, /data-character-art="tavi"/);
  assert.match(page, /A boss signals a wide arc/);
  assert.match(preview, /data-blueprint-preview="wide-swing"/);
  assert.match(preview, /data-character-art-preview="kern"/);
  assert.match(preview, /data-character-art-preview="tavi"/);
  assert.match(preview, /stroke="var\(--signal\)"/);
  assert.match(preview, /clip-path="[^"]+">\s*<g transform="translate/);
  assert.doesNotMatch(preview, /clip-path="[^"]+"\s+transform=/);
});

test('blueprint previews use mechanic-specific keyframes and modeled actor placement', () => {
  const layouts = BLUEPRINT_MECHANIC_IDS.map((id) => [id, blueprintPreviewLayout(id)]);
  const relativePlacements = new Set();
  const keyframes = new Set();

  for (const [id, layout] of layouts) {
    const { frame, boss, player, time } = layout;
    keyframes.add(time);
    relativePlacements.add(`${Math.round(player.x - boss.x)}:${Math.round(player.y - boss.y)}`);
    assert.ok(boss.x > 0 && boss.x < 360, `${id} boss leaves the preview`);
    assert.ok(boss.y > 0 && boss.y < 160, `${id} boss leaves the preview`);
    assert.ok(player.x > 0 && player.x < 360, `${id} player leaves the preview`);
    assert.ok(player.y > 0 && player.y < 160, `${id} player leaves the preview`);
    assert.equal(Math.sign(player.x - boss.x), Math.sign(frame.player.x - frame.boss.x), id);
    assert.equal(Math.sign(player.y - boss.y), Math.sign(frame.player.y - frame.boss.y), id);

    const preview = renderBlueprintThumbnail(id, `test-${id}`);
    assert.match(preview, new RegExp(`data-blueprint-preview-time="${time}"`));
    assert.match(preview, new RegExp(`translate\\(${boss.x} ${boss.y}\\)`));
    assert.match(preview, new RegExp(`translate\\(${player.x} ${player.y}\\)`));
  }

  assert.ok(keyframes.size >= 18, 'previews should not all sample the same moment');
  assert.ok(relativePlacements.size >= 18, 'previews should not repeat one actor composition');
});

test('absorption stores two eligible hits, spends the charge on one marked ring, and opens afterward', () => {
  const id = 'absorption-power-up';
  assert.equal(absorptionOutcome(1.4, 'sword-pulse'), 'absorbed');
  assert.equal(absorptionOutcome(1.4, 'melee'), 'ordinary');
  assert.equal(absorptionOutcome(2.4, 'sword-pulse'), 'absorbed');
  assert.equal(absorptionOutcome(2.6, 'sword-pulse'), 'at-cap');
  assert.equal(absorptionOutcome(5, 'sword-pulse'), 'ordinary');
  assert.deepEqual([0, 1.8, 2.6, 3.4, 3.7, 5].map(absorptionCharge), [0, 1, 2, 2, 0, 0]);
  const before = blueprintFrame(id, 3.3);
  assert.equal(before.absorptionState, 'charged');
  assert.equal(before.absorptionCharge, 2);
  assert.ok(before.primitives[8].opacity > 0, 'the final radius is previewed');
  for (let time = 3.55; time < 3.94; time += 0.025) {
    const frame = blueprintFrame(id, time);
    assert.equal(frame.dangerActive, true);
    assert.equal(frame.playerSafe, true, `the full player body clears the ring at ${time}`);
    assert.equal(blueprintPointSafe(id, time, frame.boss), false);
  }
  assert.equal(blueprintFrame(id, 4.5).absorptionState, 'spent-open');
  assert.equal(blueprintFrame(id, 4.96).openStrike, true);
  assert.match(
    renderBlueprintThumbnail(id, 'test-absorption'),
    /data-blueprint-preview="absorption-power-up"/,
  );
});

test('interruptible wind-up accepts one qualified hit before the deadline and releases when missed', () => {
  const id = 'interruptible-wind-up';
  assert.equal(interruptibleWindUpOutcome(0.6), 'closed');
  assert.equal(interruptibleWindUpOutcome(1.2, 0.5), 'insufficient-impact');
  assert.equal(interruptibleWindUpOutcome(1.2, 1), 'interrupted');
  assert.equal(interruptibleWindUpOutcome(1.7, 1), 'interrupted');
  assert.equal(interruptibleWindUpOutcome(1.82, 1), 'closed');
  assert.equal(interruptibleWindUpOutcome(3.5, 1), 'interrupted');
  assert.equal(interruptibleWindUpOutcome(4.18, 1), 'closed');
  assert.deepEqual([0, 1, 1.8, 2.2, 3.5, 4.3, 4.8].map(interruptibleWindUpState), [
    'idle',
    'wind-up-open',
    'interrupted-open',
    'interrupted-open',
    'wind-up-open',
    'released',
    'recovery',
  ]);

  const open = blueprintFrame(id, 1.3);
  assert.equal(open.windUpState, 'wind-up-open');
  assert.equal(open.interruptible, true);
  assert.ok(
    open.primitives[0].opacity > 0,
    'the final radius is previewed while interruption is open',
  );
  assert.ok(open.primitives[3].width > 0, 'the deadline gauge visibly advances');

  const interrupted = blueprintFrame(id, 1.58);
  assert.equal(interrupted.interruptHit, true);
  assert.equal(interrupted.windUpState, 'interrupted-open');
  assert.ok(interrupted.primitives[7].opacity > 0, 'the cancellation mark appears at contact');
  assert.equal(interrupted.dangerActive, false);

  const released = blueprintFrame(id, 4.3);
  assert.equal(released.windUpState, 'released');
  assert.equal(released.threatReleased, true);
  assert.equal(released.dangerActive, true);
  assert.equal(released.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 4.3, released.boss), false);
  assert.equal(blueprintFrame(id, 4.8).windUpState, 'recovery');
  assert.match(
    renderBlueprintThumbnail(id, 'test-interruptible-wind-up'),
    /data-blueprint-preview="interruptible-wind-up"/,
  );
});

test('loadout adaptation snapshots one equipped rune into a deterministic visible package', () => {
  const id = 'loadout-adaptation';
  assert.equal(loadoutAdaptationPackage('reach-rune'), 'reach-thrust');
  assert.equal(loadoutAdaptationPackage('burst-rune'), 'burst-ring');
  assert.equal(loadoutAdaptationPackage('unknown-rune'), 'baseline');
  assert.deepEqual(
    [0, 0.8, 1.3, 1.8, 2.3, 2.85, 3.2, 3.6, 4.3, 4.8, 5.5].map(loadoutAdaptationState),
    [
      'idle',
      'reading-reach',
      'copied-reach',
      'reach-danger',
      'reach-recovery',
      'loadout-swapped',
      'reading-burst',
      'copied-burst',
      'burst-danger',
      'burst-recovery',
      'idle',
    ],
  );

  const readingReach = blueprintFrame(id, 0.85);
  assert.equal(readingReach.loadout, 'reach-rune');
  assert.equal(readingReach.adaptedPackage, 'reach-thrust');
  assert.ok(readingReach.primitives[0].opacity > 0, 'the snapshot beam links Tavi to Kern');
  assert.ok(readingReach.primitives[1].opacity > 0, 'the equipped reach rune remains visible');

  const copiedReach = blueprintFrame(id, 1.3);
  assert.ok(copiedReach.primitives[2].opacity > 0, 'Kern visibly copies the reach package');
  assert.ok(copiedReach.primitives[3].opacity > 0, 'the copied thrust lane is announced');

  const reachAttack = blueprintFrame(id, 1.85);
  assert.equal(reachAttack.reachDanger, true);
  assert.equal(reachAttack.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.85, { x: 450, y: 430 }), false);

  const readingBurst = blueprintFrame(id, 3.2);
  assert.equal(readingBurst.loadout, 'burst-rune');
  assert.equal(readingBurst.adaptedPackage, 'burst-ring');
  assert.ok(readingBurst.primitives[5].opacity > 0, 'the swapped burst rune remains visible');

  const copiedBurst = blueprintFrame(id, 3.6);
  assert.ok(copiedBurst.primitives[6].opacity > 0, 'Kern visibly copies the burst package');
  assert.ok(copiedBurst.primitives[7].opacity > 0, 'the copied ring is announced');

  const burstAttack = blueprintFrame(id, 4.3);
  assert.equal(burstAttack.burstDanger, true);
  assert.equal(burstAttack.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 4.3, burstAttack.boss), false);
  assert.match(
    renderBlueprintThumbnail(id, 'test-loadout-adaptation'),
    /data-blueprint-preview="loadout-adaptation"/,
  );
});

test('wind-up exposes readable buildup beats before both fixed release windows', () => {
  const id = 'wind-up';
  assert.deepEqual([0, 0.8, 1.3, 1.7, 2.2, 3.1, 3.8, 4.4, 4.9, 5.6].map(windUpState), [
    'idle',
    'short-wind-up',
    'short-wind-up',
    'short-release',
    'short-recovery',
    'held-wind-up',
    'held-ready',
    'held-release',
    'held-recovery',
    'idle',
  ]);
  assert.ok(windUpProgress(0.8) > 0 && windUpProgress(0.8) < 1);
  assert.equal(windUpProgress(3.8), 1);

  const building = blueprintFrame(id, 1.42);
  assert.equal(building.windUpState, 'short-wind-up');
  assert.equal(building.dangerActive, false);
  assert.ok(building.windUpBeat >= 2);
  assert.ok(building.primitives[0].opacity > 0, 'the lane is promised during preparation');
  assert.ok(building.primitives[4].opacity > 0, 'the third buildup rune appears before release');

  const firstRelease = blueprintFrame(id, 1.75);
  assert.equal(firstRelease.windUpState, 'short-release');
  assert.equal(firstRelease.windUpRelease, true);
  assert.equal(firstRelease.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.75, { x: 450, y: 430 }), false);
  assert.ok(firstRelease.primitives[1].opacity > 0, 'the promised lane becomes active');

  const held = blueprintFrame(id, 3.9);
  assert.equal(held.windUpState, 'held-ready');
  assert.equal(held.windUpProgress, 1);
  assert.equal(held.dangerActive, false);
  assert.ok(held.primitives[5].opacity > 0, 'the final pose remains visibly held');

  const secondRelease = blueprintFrame(id, 4.45);
  assert.equal(secondRelease.windUpState, 'held-release');
  assert.equal(secondRelease.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 4.45, { x: 450, y: 430 }), false);
  assert.match(renderBlueprintThumbnail(id, 'test-wind-up'), /data-blueprint-preview="wind-up"/);
});

test('attack lock captures a moving aim point and preserves it through each release', () => {
  const id = 'attack-lock';
  assert.deepEqual([0, 0.8, 1.3, 1.9, 2.3, 3.1, 3.8, 4.35, 4.9, 5.6].map(attackLockState), [
    'idle',
    'tracking-first',
    'locked-first',
    'released-first',
    'recovery-first',
    'tracking-second',
    'locked-second',
    'released-second',
    'recovery-second',
    'idle',
  ]);

  const tracking = blueprintFrame(id, 0.8);
  assert.equal(tracking.attackLocked, false);
  assert.deepEqual(tracking.attackLockTarget, tracking.player);
  assert.ok(tracking.primitives[0].opacity > 0, 'the guide follows Tavi before lock');

  const firstLock = blueprintFrame(id, 1.3);
  assert.equal(firstLock.attackLocked, true);
  assert.deepEqual(firstLock.attackLockTarget, { x: 390, y: 560 });
  assert.ok(firstLock.primitives[1].opacity > 0, 'the captured ray replaces the tracking guide');
  assert.deepEqual(firstLock.attackLockEnd, blueprintFrame(id, 1.6).attackLockEnd);
  assert.notDeepEqual(firstLock.player, blueprintFrame(id, 1.6).player);

  const firstRelease = blueprintFrame(id, 1.9);
  assert.equal(firstRelease.attackLockRelease, true);
  assert.equal(firstRelease.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.9, firstRelease.attackLockTarget), false);

  const secondLock = blueprintFrame(id, 3.8);
  assert.deepEqual(secondLock.attackLockTarget, { x: 180, y: 560 });
  assert.deepEqual(secondLock.attackLockEnd, blueprintFrame(id, 4.1).attackLockEnd);
  assert.notDeepEqual(firstLock.attackLockEnd, secondLock.attackLockEnd);

  const secondRelease = blueprintFrame(id, 4.35);
  assert.equal(secondRelease.attackLockState, 'released-second');
  assert.equal(secondRelease.playerSafe, true);
  assert.match(
    renderBlueprintThumbnail(id, 'test-attack-lock'),
    /data-blueprint-preview="attack-lock"/,
  );
});

test('active phase is dangerous only inside its explicit collision window', () => {
  const id = 'active-phase';
  assert.deepEqual([0, 0.8, 1.9, 2.5, 3.2, 4.5, 5.2].map(activePhaseState), [
    'idle',
    'startup',
    'active',
    'follow-through',
    'recovery',
    'recovery',
    'reset',
  ]);

  const startup = blueprintFrame(id, 0.9);
  assert.equal(startup.dangerActive, false);
  assert.equal(startup.hitboxActive, false);
  assert.ok(startup.primitives[0].opacity > 0, 'startup previews the complete lane');
  assert.equal(startup.primitives[1].opacity, 0, 'startup does not expose the live hitbox');

  const active = blueprintFrame(id, 1.9);
  assert.equal(active.activePhaseState, 'active');
  assert.equal(active.hitboxActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.9, { x: 400, y: 430 }), false);
  assert.ok(active.primitives[1].opacity > 0, 'the active collision window is solid');
  assert.equal(active.primitives[6].opacity, 0, 'the end flash cannot precede the cutoff');

  const followThrough = blueprintFrame(id, 2.5);
  assert.equal(followThrough.activePhaseState, 'follow-through');
  assert.equal(followThrough.hitboxActive, false);
  assert.equal(blueprintPointSafe(id, 2.5, { x: 400, y: 430 }), true);
  assert.ok(followThrough.primitives[2].opacity > 0, 'harmless motion remains visible');
  assert.ok(blueprintFrame(id, 2.2).primitives[6].opacity > 0, 'the end flash follows the cutoff');

  const punish = blueprintFrame(id, 3.28);
  assert.equal(punish.activePhaseState, 'recovery');
  assert.equal(punish.punishStrike, true);
  assert.equal(punish.playerSafe, true);
  assert.match(
    renderBlueprintThumbnail(id, 'test-active-phase'),
    /data-blueprint-preview="active-phase"/,
  );
});

test('recovery locks the boss long enough for a measured approach and sword punish', () => {
  const id = 'recovery';
  assert.deepEqual([0, 0.8, 1.4, 1.8, 3.48, 4.6, 5.2].map(recoveryState), [
    'idle',
    'startup',
    'active',
    'approach-window',
    'punish-window',
    'boss-ready',
    'reset',
  ]);

  const startup = blueprintFrame(id, 0.9);
  assert.equal(startup.dangerActive, false);
  assert.ok(startup.primitives[0].opacity > 0, 'startup previews the complete lane');
  assert.equal(startup.primitives[1].opacity, 0, 'the preview is not damaging');

  const active = blueprintFrame(id, 1.4);
  assert.equal(active.recoveryState, 'active');
  assert.equal(active.dangerActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.4, { x: 400, y: 430 }), false);
  assert.ok(active.primitives[1].opacity > 0, 'the damaging lane is solid');

  const opening = blueprintFrame(id, 1.8);
  assert.equal(opening.dangerActive, false);
  assert.equal(opening.recoveryLocked, true);
  assert.equal(opening.bossReady, false);
  assert.equal(blueprintPointSafe(id, 1.8, { x: 400, y: 430 }), true);
  assert.ok(opening.primitives[2].opacity > 0, 'sword reach is visible during recovery');
  assert.ok(opening.primitives[3].opacity > 0, 'the countdown is visible during recovery');
  assert.equal(opening.primitives[5].opacity, 0, 'the ready flash cannot appear early');

  const punish = blueprintFrame(id, 3.48);
  assert.equal(punish.recoveryLocked, true);
  assert.equal(punish.withinPunishReach, true);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[6].opacity > 0, 'the sword response reaches Kern');

  const ready = blueprintFrame(id, 4.6);
  assert.equal(ready.recoveryLocked, false);
  assert.equal(ready.bossReady, true);
  assert.ok(ready.primitives[5].opacity > 0, 'the ready flash follows the exact cutoff');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(renderBlueprintThumbnail(id, 'test-recovery'), /data-blueprint-preview="recovery"/);
});

test('survival phase advances on elapsed survival, clears each pulse, then restores damage', () => {
  const id = 'survival-phase';
  assert.deepEqual([0, 0.7, 1.2, 1.6, 2.2, 3.15, 4.1, 4.35, 5.08, 5.5].map(survivalPhaseState), [
    'idle',
    'read-next',
    'survive-1',
    'read-next',
    'survive-2',
    'survive-3',
    'survive-4',
    'survived',
    'opening',
    'reset',
  ]);

  const signal = blueprintFrame(id, 0.8);
  assert.equal(signal.survivalShielded, true);
  assert.equal(signal.dangerActive, false);
  assert.ok(
    signal.primitives[0].opacity > 0,
    'the shield is visible for the whole survival contract',
  );
  assert.ok(signal.primitives[2].opacity > 0, 'the first fixed circle previews before activation');

  for (const [time, index] of [
    [1.2, 0],
    [2.2, 1],
    [3.15, 2],
    [4.1, 3],
  ]) {
    const active = blueprintFrame(id, time);
    assert.equal(active.survivalHazardIndex, index);
    assert.equal(active.dangerActive, true);
    assert.equal(active.playerSafe, true, `Tavi clears pulse ${index + 1}`);
    const circle = active.primitives[2 + index];
    assert.equal(blueprintPointSafe(id, time, { x: circle.x, y: circle.y }), false);
  }

  const complete = blueprintFrame(id, 4.35);
  assert.equal(complete.survivalComplete, true);
  assert.equal(complete.survivalShielded, false);
  assert.equal(complete.dangerActive, false);
  assert.equal(complete.survivalRemaining, 0);
  assert.ok(complete.primitives[6].opacity > 0, 'one completion flash marks the handoff');

  const punish = blueprintFrame(id, 5.08);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[7].opacity > 0, 'the sword response appears only after completion');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-survival-phase'),
    /data-blueprint-preview="survival-phase"/,
  );
});

test('teleport reveals one destination, removes transit collision, and fixes its follow-up lane', () => {
  const id = 'teleport';
  assert.deepEqual([0, 0.7, 1.2, 1.6, 1.9, 2.5, 3.55, 4.6].map(teleportState), [
    'idle',
    'departing',
    'absent',
    'arriving',
    'follow-up-tell',
    'follow-up-danger',
    'opening',
    'reset',
  ]);

  const destinationTell = blueprintFrame(id, 0.9);
  assert.equal(destinationTell.teleportDestinationRevealed, true);
  assert.equal(destinationTell.teleportAbsent, false);
  assert.equal(destinationTell.dangerActive, false);
  assert.ok(destinationTell.primitives[1].opacity > 0, 'the exact destination is visible early');

  const absent = blueprintFrame(id, 1.2);
  assert.equal(absent.teleportAbsent, true);
  assert.equal(absent.bossVisible, 0);
  assert.equal(absent.dangerActive, false);
  assert.equal(blueprintPointSafe(id, 1.2, { x: 270, y: 360 }), true);

  const followUpTell = blueprintFrame(id, 1.9);
  assert.equal(followUpTell.teleportState, 'follow-up-tell');
  assert.ok(followUpTell.primitives[4].opacity > 0, 'the stored follow-up lane previews');
  assert.equal(followUpTell.primitives[5].opacity, 0, 'preview geometry does not deal damage');

  const active = blueprintFrame(id, 2.5);
  assert.equal(active.teleportFollowUpActive, true);
  assert.equal(active.playerSafe, true);
  assert.ok(active.primitives[5].opacity > 0, 'the same fixed lane becomes solid');
  assert.equal(blueprintPointSafe(id, 2.5, { x: 390, y: 610 }), false);

  const punish = blueprintFrame(id, 3.55);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[7].opacity > 0, 'the sword response begins after danger ends');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(renderBlueprintThumbnail(id, 'test-teleport'), /data-blueprint-preview="teleport"/);
});

test('boundary attack names one edge, crosses its fixed lane, and returns outside the arena', () => {
  const id = 'boundary-attack';
  assert.deepEqual([0, 0.8, 1.9, 2.5, 3.15, 4.5].map(boundaryAttackState), [
    'idle',
    'edge-signal',
    'boundary-crossing',
    'boundary-stagger',
    'opening',
    'outer-reset',
  ]);

  const signal = blueprintFrame(id, 0.9);
  assert.equal(signal.boundarySignalActive, true);
  assert.equal(signal.dangerActive, false);
  assert.ok(signal.primitives[1].opacity > 0, 'the exact boundary source is visible early');
  assert.ok(signal.primitives[2].opacity > 0, 'the stored crossing lane previews');
  assert.equal(signal.primitives[3].opacity, 0, 'preview geometry is not active collision');

  const active = blueprintFrame(id, 1.95);
  assert.equal(active.boundaryCrossingActive, true);
  assert.equal(active.playerSafe, true);
  assert.ok(active.primitives[3].opacity > 0.9, 'the same fixed lane becomes solid');
  assert.equal(blueprintPointSafe(id, 1.95, { x: 300, y: 610 }), false);

  const impact = blueprintFrame(id, 2.28);
  assert.equal(impact.dangerActive, false);
  assert.ok(impact.primitives[5].opacity > 0.9, 'wall impact visibly ends the crossing');

  const punish = blueprintFrame(id, 3.15);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[7].opacity > 0, 'the sword response begins after danger ends');

  const outerRoute = blueprintFrame(id, 4.8);
  assert.equal(outerRoute.boundarySourceOutside, true);
  assert.equal(outerRoute.dangerActive, false);
  assert.ok(outerRoute.primitives[6].opacity > 0, 'the non-damaging outer return is visible');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-boundary-attack'),
    /data-blueprint-preview="boundary-attack"/,
  );
});

test('forced scrolling keeps one authored pace, a fixed failure edge, and a visible stop', () => {
  const id = 'forced-scrolling';
  assert.deepEqual([0, 0.8, 2.5, 4.4, 5.05, 5.6].map(forcedScrollingState), [
    'idle',
    'scroll-signal',
    'forced-scroll',
    'route-cleared',
    'opening',
    'reset',
  ]);
  assert.equal(forcedScrollingOffset(1.24), 0);
  assert.ok(forcedScrollingOffset(2.75) > 100);
  assert.ok(forcedScrollingOffset(4.24) > forcedScrollingOffset(2.75));

  const signal = blueprintFrame(id, 0.9);
  assert.equal(signal.forcedScrollingActive, false);
  assert.ok(signal.primitives[2].opacity > 0, 'the lower failure edge warns before scrolling');
  assert.equal(signal.primitives[3].opacity, 0, 'the warning has no active collision');

  const active = blueprintFrame(id, 2.75);
  assert.equal(active.forcedScrollingActive, true);
  assert.equal(active.playerSafe, true);
  assert.ok(active.forcedScrollingOffset > 100);
  assert.ok(active.primitives[3].opacity > 0.9, 'the fixed lower edge becomes solid');
  assert.equal(blueprintPointSafe(id, 2.75, { x: 350, y: 750 }), false);
  assert.equal(blueprintPointSafe(id, 2.75, { x: 350, y: 620 }), true);

  const cleared = blueprintFrame(id, 4.4);
  assert.equal(cleared.forcedScrollingRouteCleared, true);
  assert.equal(cleared.dangerActive, false);
  assert.equal(cleared.primitives[3].opacity, 0, 'the danger edge ends at the stop rune');

  const punish = blueprintFrame(id, 5.05);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[11].opacity > 0, 'the sword response follows route completion');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-forced-scrolling'),
    /data-blueprint-preview="forced-scrolling"/,
  );
});

test('chase herding keeps a readable distance band, a bounded intercept, and a captured opening', () => {
  const id = 'chase-herding';
  assert.deepEqual([0, 0.8, 1.8, 3, 3.9, 4.8, 5.4].map(chaseHerdingState), [
    'idle',
    'route-signal',
    'maintain-distance',
    'intercept',
    'captured',
    'opening',
    'reset',
  ]);

  const signal = blueprintFrame(id, 0.9);
  assert.equal(signal.dangerActive, false);
  assert.ok(signal.primitives[3].opacity > 0.7, 'the destination is visible before pursuit');
  assert.ok(signal.primitives[5].opacity > 0, 'the inner distance ring is visible');
  assert.ok(signal.primitives[6].opacity > 0, 'the outer distance ring is visible');

  const pursuit = blueprintFrame(id, 2.1);
  assert.equal(pursuit.chaseHerdingState, 'maintain-distance');
  assert.equal(pursuit.chaseInBand, true);
  assert.equal(pursuit.playerSafe, true);
  assert.equal(pursuit.dangerActive, false);
  assert.ok(pursuit.chaseDistance > 68 && pursuit.chaseDistance < 185);

  const intercept = blueprintFrame(id, 3.1);
  assert.equal(intercept.chaseIntercepted, true);
  assert.ok(intercept.primitives[11].opacity > 0.6, 'the authored inside waypoint stays visible');

  const captured = blueprintFrame(id, 3.9);
  assert.equal(captured.chaseCaptured, true);
  assert.equal(captured.dangerActive, false);
  assert.ok(captured.primitives[4].opacity > 0.8, 'the capture rune changes state');

  const punish = blueprintFrame(id, 4.72);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[12].opacity > 0, 'the sword opens only after capture');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-chase-herding'),
    /data-blueprint-preview="chase-herding"/,
  );
});

test('escape phase signals a finite route, supports interruption, and resolves into an opening', () => {
  const id = 'escape-phase';
  assert.deepEqual([0, 0.8, 1.8, 3, 3.7, 5.4].map(escapePhaseState), [
    'combat',
    'exit-signal',
    'escape-run',
    'interrupted',
    'opening',
    'reset',
  ]);

  const signal = blueprintFrame(id, 0.8);
  assert.equal(signal.escapeActive, false);
  assert.equal(signal.escapeInterrupted, false);
  assert.ok(signal.primitives[1].opacity > 0.6, 'the exit route appears before the run');
  assert.ok(signal.primitives[3].opacity > 0.7, 'the exit gate is explicit');

  const escape = blueprintFrame(id, 2.1);
  assert.equal(escape.escapePhaseState, 'escape-run');
  assert.equal(escape.escapeActive, true);
  assert.equal(escape.escapeSucceeded, false);
  assert.ok(escape.escapeProgress > 0 && escape.escapeProgress < 0.72);
  assert.ok(escape.bossMotion.stride > 0.7);
  assert.equal(escape.playerSafe, true);

  const interrupted = blueprintFrame(id, 2.85);
  assert.equal(interrupted.escapePhaseState, 'interrupted');
  assert.equal(interrupted.escapeInterrupted, true);
  assert.equal(interrupted.escapeInterruptStrike, true);
  assert.equal(interrupted.escapeProgress, 0.72);
  assert.ok(interrupted.primitives[9].opacity > 0.6, 'the interrupt ripple confirms success');

  const punish = blueprintFrame(id, 3.72);
  assert.equal(punish.escapePhaseState, 'opening');
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[10].opacity > 0, 'the sword response lands during the opening');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-escape-phase'),
    /data-blueprint-preview="escape-phase"/,
  );
});

test('relocated arena previews a destination, hands off retained state, and resumes in new geometry', () => {
  const id = 'relocated-arena';
  assert.deepEqual([0, 0.8, 1.7, 2.6, 3.6, 5.2].map(relocatedArenaState), [
    'upper-combat',
    'destination-preview',
    'transfer',
    'lower-entry',
    'lower-combat',
    'return-lift',
  ]);

  const preview = blueprintFrame(id, 0.8);
  assert.equal(preview.relocatedDestinationRevealed, true);
  assert.equal(preview.relocatedTransferActive, false);
  assert.ok(
    preview.primitives[2].opacity > 0.2,
    'the lower chamber appears before control is lost',
  );
  assert.ok(preview.primitives[5].opacity > 0.4, 'the upper floor visibly cracks');

  const transfer = blueprintFrame(id, 1.7);
  assert.equal(transfer.relocatedArenaState, 'transfer');
  assert.equal(transfer.relocatedTransferActive, true);
  assert.equal(transfer.dangerActive, false);
  assert.ok(transfer.boss.y > preview.boss.y);
  assert.ok(transfer.player.y > preview.player.y);

  const lower = blueprintFrame(id, 2.8);
  assert.equal(lower.relocatedLowerActive, true);
  assert.equal(lower.relocatedStateRetained, true);
  assert.equal(lower.relocatedProgress, 0.62);
  assert.deepEqual(lower.boss, { x: 250, y: 720 });
  assert.deepEqual(lower.player, { x: 390, y: 755 });
  assert.ok(lower.primitives[12].opacity > 0.8, 'retained encounter progress stays visible');

  const punish = blueprintFrame(id, 3.85);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[15].opacity > 0, 'the sword opening resumes in the lower room');

  const lift = blueprintFrame(id, 5.25);
  assert.equal(lift.relocatedArenaState, 'return-lift');
  assert.ok(lift.primitives[13].opacity > 0.8, 'the return lift is visible');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-relocated-arena'),
    /data-blueprint-preview="relocated-arena"/,
  );
});

test('control mode shift previews the remap, teaches its jump response, and restores free movement', () => {
  const id = 'control-mode-shift';
  assert.deepEqual([0, 0.8, 1.35, 2.6, 3.85, 5.2].map(controlModeShiftState), [
    'free-movement',
    'mode-preview',
    'control-handoff',
    'jump-mode',
    'opening',
    'free-mode-return',
  ]);

  const preview = blueprintFrame(id, 0.8);
  assert.equal(preview.controlModePreviewed, true);
  assert.equal(preview.controlModeActive, false);
  assert.equal(preview.controlModeMapping, 'free-movement');
  assert.ok(preview.primitives[6].opacity > 0.4, 'the handoff rune appears before remapping');

  const handoff = blueprintFrame(id, 1.35);
  assert.equal(handoff.controlModeShiftState, 'control-handoff');
  assert.equal(handoff.dangerActive, false);
  assert.ok(handoff.player.y > preview.player.y, 'the player settles before danger resumes');

  const jump = blueprintFrame(id, 2.6);
  assert.equal(jump.controlModeActive, true);
  assert.equal(jump.controlModeMapping, 'horizontal-and-jump');
  assert.equal(jump.controlModeWaveActive, true);
  assert.equal(jump.playerSafe, true);
  assert.ok(jump.player.y < 650, 'the remapped jump clears the grounded wave');
  assert.ok(jump.primitives[13].opacity > 0.8, 'the active grounded wave remains visible');

  const punish = blueprintFrame(id, 3.85);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[17].opacity > 0, 'the sword response lands after the mode lesson');

  const returning = blueprintFrame(id, 5.2);
  assert.equal(returning.controlModeReturnVisible, true);
  assert.equal(returning.controlModeShiftState, 'free-mode-return');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-control-mode-shift'),
    /data-blueprint-preview="control-mode-shift"/,
  );
});

test('boss as terrain exposes a stable route, holds through motion, and validates the dismount', () => {
  const id = 'boss-as-terrain';
  assert.deepEqual([0, 0.8, 1.5, 2.3, 3.5, 4.6, 5.5].map(bossAsTerrainState), [
    'grounded',
    'route-revealed',
    'climbing',
    'hold-through-shake',
    'weak-point-opening',
    'safe-drop',
    'reset',
  ]);

  const preview = blueprintFrame(id, 0.8);
  assert.equal(preview.bossAsTerrainRouteRevealed, true);
  assert.equal(preview.bossAsTerrainMounted, false);
  assert.ok(preview.primitives[1].opacity > 0.5, 'the connected climb appears before mounting');

  const climbing = blueprintFrame(id, 1.5);
  assert.equal(climbing.bossAsTerrainMounted, true);
  assert.ok(climbing.player.y < preview.player.y, 'the player advances up the authored body route');

  const holding = blueprintFrame(id, 2.3);
  assert.equal(holding.bossAsTerrainState, 'hold-through-shake');
  assert.equal(holding.bossAsTerrainHolding, true);
  assert.equal(holding.dangerActive, true);
  assert.equal(holding.playerSafe, true);
  assert.ok(holding.bossAsTerrainGrip < 0.9 && holding.bossAsTerrainGrip > 0.58);
  assert.ok(holding.primitives[7].opacity > 0.8, 'shake arcs remain visible while holding');

  const opening = blueprintFrame(id, 3.72);
  assert.equal(opening.bossAsTerrainWeakPointOpen, true);
  assert.equal(opening.punishStrike, true);
  assert.ok(opening.primitives[12].opacity > 0.9, 'the sword reaches the opened weak point');

  const drop = blueprintFrame(id, 4.6);
  assert.equal(drop.bossAsTerrainSafeDrop, true);
  assert.ok(drop.primitives[10].opacity > 0.8, 'the dismount route is visible');
  assert.ok(drop.primitives[11].opacity > 0.8, 'the validated landing point is visible');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-boss-as-terrain'),
    /data-blueprint-preview="boss-as-terrain"/,
  );
});
