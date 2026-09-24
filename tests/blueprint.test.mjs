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
  coverLineOfSightBlocked,
  coverLineOfSightState,
  chaseHerdingState,
  controlModeShiftState,
  escapePhaseState,
  relocatedArenaState,
  forcedScrollingOffset,
  forcedScrollingState,
  forcedInertiaState,
  wraparoundProjectileState,
  beatSyncedAttackState,
  secondaryCuesInvisibilityState,
  soundDetectionState,
  objectiveLinkedInvulnerabilityOutcome,
  objectiveLinkedInvulnerabilityState,
  waveClearObjectiveProgress,
  waveClearObjectiveState,
  environmentalWeaponState,
  encounterSpecificToolState,
  playerControlledBossState,
  projectileRallyState,
  baitedSelfHitState,
  postureStaggerGaugeState,
  pacifistResolutionState,
  pacifistResolutionOutcome,
  persistentProgressState,
  persistentProgressRestore,
  statusBuildupState,
  statusBuildupApply,
  instantKillState,
  instantKillResolve,
  maximumHealthReductionState,
  maximumHealthReductionResolve,
  abilityLockState,
  abilityLockResolve,
  resourceStealState,
  resourceStealResolve,
  onHitHealingState,
  onHitHealingResolve,
  selfHealCastState,
  selfHealCastResolve,
  externalHealingSourceState,
  externalHealingSourceResolve,
  damageRateCapState,
  damageRateCapResolve,
  loadoutMirrorState,
  loadoutMirrorSnapshot,
  movesetShapeshiftingState,
  movesetShapeshiftingResolve,
  allyTheftState,
  allyTheftTransfer,
  falseDeathState,
  falseDeathResolve,
  actionReactivePunishState,
  actionReactivePunishResolve,
  runHistoryManifestationState,
  runHistoryManifestationResolve,
  realTimeProgressionState,
  realTimeProgressionResolve,
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

test('all 100 promoted lesson animations have distinct rule modes and complete moving frames', () => {
  assert.equal(BLUEPRINT_MECHANIC_IDS.length, 100);
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
  assert.equal(modes.size, 100);
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
      id !== 'boss-as-terrain' &&
      id !== 'forced-inertia' &&
      id !== 'wraparound-projectile' &&
      id !== 'beat-synced-attack' &&
      id !== 'baited-self-hit' &&
      id !== 'posture-stagger-gauge' &&
      id !== 'pacifist-resolution' &&
      id !== 'persistent-progress' &&
      id !== 'status-buildup' &&
      id !== 'instant-kill' &&
      id !== 'maximum-health-reduction' &&
      id !== 'ability-lock' &&
      id !== 'resource-steal' &&
      id !== 'on-hit-healing' &&
      id !== 'self-heal-cast' &&
      id !== 'external-healing-source' &&
      id !== 'damage-rate-cap' &&
      id !== 'loadout-mirror' &&
      id !== 'moveset-shapeshifting' &&
      id !== 'false-death' &&
      id !== 'action-reactive-punish' &&
      id !== 'run-history-manifestation' &&
      id !== 'real-time-progression'
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
    'secondary-cues-invisibility': { x: 300, y: 625 },
    'sound-detection': { x: 380, y: 650 },
    'forced-scrolling': { x: 350, y: 750 },
    'control-mode-shift': { x: 120, y: 724 },
    'cover-line-of-sight': { x: 470, y: 850 },
    'wide-swing': { x: 280, y: 515 },
    lunge: { x: 300, y: 440 },
    grab: { x: 390, y: 485 },
    'burrow-and-emerge': { x: 420, y: 590 },
    'ring-volley': { x: 516, y: 400 },
    'spiral-barrage': { x: 280, y: 390 },
    'ricochet-projectile': null,
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
      id !== 'objective-linked-invulnerability' &&
      id !== 'wave-clear-objective' &&
      id !== 'environmental-weapon' &&
      id !== 'encounter-specific-tool' &&
      id !== 'player-controlled-boss' &&
      id !== 'projectile-rally' &&
      id !== 'baited-self-hit' &&
      id !== 'posture-stagger-gauge' &&
      id !== 'pacifist-resolution' &&
      id !== 'persistent-progress' &&
      id !== 'status-buildup' &&
      id !== 'instant-kill' &&
      id !== 'maximum-health-reduction' &&
      id !== 'ability-lock' &&
      id !== 'resource-steal' &&
      id !== 'on-hit-healing' &&
      id !== 'self-heal-cast' &&
      id !== 'external-healing-source' &&
      id !== 'damage-rate-cap' &&
      id !== 'loadout-mirror' &&
      id !== 'moveset-shapeshifting' &&
      id !== 'false-death' &&
      id !== 'action-reactive-punish' &&
      id !== 'run-history-manifestation' &&
      id !== 'real-time-progression' &&
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
      id !== 'boss-as-terrain' &&
      id !== 'forced-inertia' &&
      id !== 'wraparound-projectile' &&
      id !== 'beat-synced-attack',
  )) {
    const frame = blueprintFrame(id, 3);
    let point = unsafePoints[id];
    if (!point && id === 'homing-projectile') {
      const projectile = frame.primitives[1];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'ricochet-projectile') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'single-shot') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'speed-change') {
      point = frame.boss;
    } else if (!point && id === 'limited-spread') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'attack-reflection') {
      const projectile = frame.primitives[9];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'crossfire') {
      const projectile = frame.primitives[0];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'splitting-projectile') {
      const projectile = frame.primitives.find(
        (primitive) => primitive.type === 'path' && primitive.opacity > 0.15,
      );
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'returning-projectile') {
      const projectile = frame.primitives[0];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'orbiting-projectiles') {
      const projectile = frame.primitives[0];
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
    } else if (!point && id === 'ally-theft') {
      const shot = frame.allyTheftProjectiles[0];
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

  const platformFrame = blueprintFrame('platform-destruction', 3.4);
  const platforms = platformFrame.primitives;
  assert.ok(platforms[1].opacity < platforms[0].opacity);
  assert.ok(platforms[2].opacity < platforms[3].opacity);
  assert.equal(platforms[0].width, 0);
  assert.ok(platforms[5].opacity > 0);
  assert.ok(Math.abs(platformFrame.player.y - platforms[3].y) < 30);
  const recoveredPlatforms = blueprintFrame('platform-destruction', 5.2).primitives;
  assert.equal(recoveredPlatforms[1].opacity, 0);
  assert.equal(recoveredPlatforms[2].opacity, 0);

  const activeBeam = blueprintFrame('straight-beam', 3).primitives[1];
  const recoveredBeam = blueprintFrame('straight-beam', 5.95).primitives[1];
  assert.equal(blueprintFrame('straight-beam', 1.2).primitives[0].width, activeBeam.width);
  assert.equal(blueprintFrame('straight-beam', 1.2).primitives[0].dash, '');
  assert.ok(activeBeam.opacity > 0.9);
  assert.ok(recoveredBeam.opacity < 0.1);
});

test('rule-specific commitments stay visible through the response and recovery', () => {
  const ring = blueprintFrame('ring-volley', 3);
  assert.equal(ring.primitives[0].type, 'path');
  assert.equal(ring.primitives[1].tone, 'safe');
  assert.ok(ring.primitives[1].dash);

  const homing = blueprintFrame('homing-projectile', 4.15);
  const homingHead = homing.primitives[1];
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
  assert.equal(compressedArena[1].width, 0);

  const enragedRecovery = blueprintFrame('enrage', 5.2);
  assert.equal(enragedRecovery.bossScale, 1.1);
  assert.equal(enragedRecovery.primitives[2].opacity, 1);
  assert.equal(enragedRecovery.primitives[3].opacity, 1);
  assert.ok(enragedRecovery.primitives.slice(4).every((primitive) => primitive.opacity === 0));
});

test('rotating beams keep the full player inside the arena throughout the orbit', () => {
  for (let step = 0; step <= 600; step += 1) {
    const { player } = blueprintFrame('rotating-beams', step / 100);
    assert.ok(player.x >= 60 && player.x <= 500);
    assert.ok(player.y >= 180 && player.y <= 800);
  }
});

test('scanning beam leaves the player clear throughout its committed sweep', () => {
  for (let step = 160; step <= 430; step += 1) {
    const frame = blueprintFrame('scanning-beam', step / 100);
    assert.equal(frame.playerSafe, true, `player intersects the scan at ${step / 100}s`);
  }
  assert.equal(blueprintFrame('scanning-beam', 3.4).primitives[0].dash, '');
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
  assert.deepEqual(
    signal.primitives.map((projectile) => projectile.x),
    [90, 470],
  );
  const separation = (frame) => Math.abs(frame.primitives[0].x - frame.primitives[1].x);
  assert.ok(separation(intersection) < separation(beforeCross));
  assert.ok(separation(intersection) < separation(afterCross));
  assert.equal(
    blueprintPointSafe('crossfire', 3, {
      x: intersection.primitives[0].x,
      y: intersection.primitives[0].y,
    }),
    false,
  );
  assert.equal(intersection.playerSafe, true);
  for (let step = 160; step <= 430; step += 1) {
    const frame = blueprintFrame('crossfire', step / 100);
    assert.equal(frame.playerSafe, true, `player intersects a bolt at ${step / 100}s`);
    assert.ok(frame.player.x <= 500);
  }
});

test('splitting projectile commits one parent, one split point, and three fragment routes', () => {
  const signal = blueprintFrame('splitting-projectile', 1.59);
  const parentFlight = blueprintFrame('splitting-projectile', 2.3);
  const fragments = blueprintFrame('splitting-projectile', 3.7);

  assert.deepEqual(signal.player, blueprintFrame('splitting-projectile', 0).player);
  assert.equal(signal.primitives[0].type, 'path');
  assert.ok(parentFlight.primitives[0].opacity > 0.9);
  assert.ok(parentFlight.primitives.slice(1).every((projectile) => projectile.opacity === 0));
  assert.equal(fragments.primitives[0].opacity, 0);
  assert.ok(fragments.primitives.slice(1).every((projectile) => projectile.opacity > 0.9));
  assert.equal(new Set(fragments.primitives.slice(1).map((projectile) => projectile.x)).size, 3);
  assert.equal(
    blueprintPointSafe('splitting-projectile', 3.7, {
      x: fragments.primitives[2].x,
      y: fragments.primitives[2].y,
    }),
    false,
  );
  assert.equal(fragments.playerSafe, true);
});

test('ricochet damage follows the moving stone rather than its old route', () => {
  const firstBounce = blueprintFrame('ricochet-projectile', 2.5);
  const secondBounce = blueprintFrame('ricochet-projectile', 3.4);
  assert.equal(firstBounce.primitives[2].x, 500);
  assert.equal(firstBounce.primitives[2].y, 420);
  assert.equal(secondBounce.primitives[2].x, 110);
  assert.equal(secondBounce.primitives[2].y, 610);
  assert.equal(blueprintPointSafe('ricochet-projectile', 3, { x: 330, y: 335 }), true);
  for (let step = 160; step <= 430; step += 1) {
    assert.equal(blueprintFrame('ricochet-projectile', step / 100).playerSafe, true);
  }
});

test('spiral barrage emits discrete arms and leaves a complete safe route', () => {
  const early = blueprintFrame('spiral-barrage', 2);
  const mature = blueprintFrame('spiral-barrage', 3.2);
  const recovered = blueprintFrame('spiral-barrage', 5.99);
  assert.equal(early.primitives.filter((projectile) => projectile.opacity > 0).length, 6);
  assert.ok(mature.primitives.filter((projectile) => projectile.opacity > 0).length > 18);
  assert.ok(mature.primitives.every((projectile) => projectile.type === 'path'));
  assert.equal(recovered.primitives.filter((projectile) => projectile.opacity > 0).length, 0);
  for (let step = 160; step <= 599; step += 1) {
    const frame = blueprintFrame('spiral-barrage', step / 100);
    assert.equal(frame.playerSafe, true, `player intersects the barrage at ${step / 100}s`);
  }
});

test('returning projectile announces an outbound leg and a distinct committed return leg', () => {
  const signal = blueprintFrame('returning-projectile', 1.59);
  const outgoing = blueprintFrame('returning-projectile', 2.35);
  const turn = blueprintFrame('returning-projectile', 3);
  const returning = blueprintFrame('returning-projectile', 3.75);
  const nearOwner = blueprintFrame('returning-projectile', 4.2);

  assert.deepEqual(signal.player, blueprintFrame('returning-projectile', 0).player);
  assert.equal(signal.primitives[0].type, 'path');
  assert.equal(signal.primitives[0].x, signal.boss.x);
  assert.ok(outgoing.primitives[0].x < turn.primitives[0].x);
  assert.ok(returning.primitives[0].y > turn.primitives[0].y);
  const distanceFromOwner = (frame) =>
    Math.hypot(frame.primitives[0].x - frame.boss.x, frame.primitives[0].y - frame.boss.y);
  assert.ok(distanceFromOwner(nearOwner) < distanceFromOwner(returning));
  assert.equal(
    blueprintPointSafe('returning-projectile', 3.75, {
      x: returning.primitives[0].x,
      y: returning.primitives[0].y,
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
  assert.ok(
    active.primitives.every((projectile) => projectile.type === 'path' && projectile.radius === 18),
  );
  for (const frame of [signal, early, active, late]) {
    const distances = frame.primitives.map((projectile) =>
      Math.hypot(projectile.x - frame.boss.x, projectile.y - frame.boss.y),
    );
    assert.ok(distances.every((distance) => Math.abs(distance - 170) < 0.001));
  }
  const angles = active.primitives.map((projectile) =>
    Math.atan2(projectile.y - active.boss.y, projectile.x - active.boss.x),
  );
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
  assert.equal(third.primitives[3].radius, blueprintSpec('chain-explosions').blastRadius);
  assert.equal(
    third.primitives.slice(1, 6).filter((primitive) => primitive.tone === 'signal').length,
    1,
  );
  assert.equal(blueprintPointSafe('chain-explosions', 3, { x: 275, y: 650 }), false);
  assert.equal(blueprintPointSafe('chain-explosions', 3, { x: 455, y: 650 }), true);
  assert.equal(third.playerSafe, true);
  assert.ok(third.player.x > third.primitives[3].x, 'player should trail the live blast');
});

test('marked area keeps its warned footprint through detonation', () => {
  const signal = blueprintFrame('marked-area-strike', 1.2);
  const strike = blueprintFrame('marked-area-strike', 3);
  assert.equal(signal.primitives[0].radius, 58);
  assert.equal(strike.primitives[0].radius, 58);
  assert.equal(blueprintPointSafe('marked-area-strike', 3, { x: 380, y: 620 }), false);
});

test('mine keeps one fixed radius, arms with collision, and lets the player route around it', () => {
  const signal = blueprintFrame('mine', 1.59);
  const armed = blueprintFrame('mine', 3);
  const recovery = blueprintFrame('mine', 5.2);
  const centers = [signal, armed, recovery].map((frame) => {
    const trigger = frame.primitives[0];
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
  assert.ok(armed.primitives[1].opacity > 0, 'armed mine should show its casing');
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
  assert.notEqual(early.primitives[2].data, middle.primitives[2].data);
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
    assert.equal(frame.primitives.length, 4);
    assert.equal(left.width, 0);
    assert.equal(right.width, 0);
    assert.equal(frame.primitives[2].type, 'path');
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
  assert.equal(action.primitives.length, 3);
  assert.equal(action.primitives[2].radius, blueprintSpec(id).contactRadius);
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

test('attack combination keeps a held hammer through both strikes and recovery', () => {
  const id = 'attack-combination';
  const frames = [0, 1.5, 2.3, 3.36, 4.8, 5.9].map((time) => blueprintFrame(id, time));
  for (const frame of frames) {
    assert.equal(frame.primitives[2].type, 'line');
    assert.ok(frame.primitives[2].opacity > 0);
    assert.equal(frame.primitives[3].type, 'path');
    assert.ok(frame.primitives[3].fill > 0);
  }
  assert.notEqual(frames[1].primitives[3].data, frames[2].primitives[3].data);
  assert.notEqual(frames[2].primitives[3].data, frames[3].primitives[3].data);
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
  assert.equal(blueprintFrame(id, 2.79).primitives[1].tone, 'accent');
  assert.equal(blueprintFrame(id, 2.8).primitives[1].tone, 'signal');
  assert.ok(blueprintFrame(id, 3.15).primitives[2].opacity > 0.8);
  assert.equal(blueprintFrame(id, 3.45).primitives[2].opacity, 0);
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
      .primitives.slice(2, 5)
      .every((shot) => shot.opacity === 0),
    true,
  );
  assert.ok(blueprintFrame(id, 2.28).player.x > 464);
  const shot = blueprintFrame(id, 3).primitives[2];
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x, y: shot.y }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x + 41, y: shot.y }), false);
  assert.equal(blueprintPointSafe(id, 3, { x: shot.x + 43, y: shot.y }), true);
  const shotPositions = [1.85, 2.4, 2.95].map((release, index) => {
    const shotAt = blueprintFrame(id, release + 0.5).primitives[2 + index];
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
  assert.ok(front.primitives[4].opacity > 0.9);
  assert.ok(front.primitives[7].opacity > 0);
  assert.ok(flank.primitives[9].opacity > 0);
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
  assert.equal(slash.primitives[5].x, thrust.primitives[7].x);
  assert.equal(slash.primitives[5].y, thrust.primitives[7].y);
  assert.ok(slash.primitives[5].opacity > 0);
  assert.ok(thrust.primitives[7].opacity > 0);
  assert.equal(slash.primitives[9].rectWidth, 20);
  assert.equal(slash.primitives[11].rectWidth, 0);
  assert.equal(thrust.primitives[9].rectWidth, 20);
  assert.equal(thrust.primitives[11].rectWidth, 100);
  assert.ok(blueprintFrame(id, 4.5).primitives[3].opacity > 0);
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
  assert.ok(blocked.primitives[3].opacity > 0.7);
  assert.ok(blocked.primitives[9].opacity > 0.7);
  assert.ok(ward.primitives[11].opacity > 0.7);
  assert.ok(exposed.primitives[3].opacity < 0.1);
  assert.ok(exposed.primitives[13].opacity > 0.7);
  assert.ok(restored.primitives[3].opacity > 0.7);
  assert.equal(exposed.primitives[13].x, spec.boss[0] + 38);
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
  assert.ok(first.primitives[8].opacity > 0.9);
  assert.equal(blueprintPointSafe(id, 2, { x: 415, y: 405 }), false);
  assert.equal(first.playerSafe, true);
  assert.equal(broken.partStrike, true);
  assert.ok(broken.primitives[10].opacity > 0.9);
  assert.equal(retry.secondAttempt, true);
  assert.equal(retry.launcherCanFire, false);
  assert.equal(retry.primitives[8].opacity, 0);
  assert.ok(retry.primitives[11].opacity > 0.9);
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
  assert.ok(outgoing.primitives[6].opacity > 0.9);
  assert.equal(outgoing.primitives[9].opacity, 0);
  assert.equal(contact.primitives[6].opacity, 0);
  assert.ok(contact.primitives[7].opacity > 0.9);
  assert.equal(returnShot.reflectedShot, true);
  assert.equal(returnShot.primitives[6].opacity, 0);
  assert.ok(returnShot.primitives[9].opacity > 0.9);
  assert.equal(blueprintPointSafe(id, 2.9, { x: returnShot.primitives[9].x, y: 405 }), false);
  assert.equal(returnShot.playerSafe, true);
  assert.ok(returnShot.player.y > 405 + spec.boltRadius + 24);
  assert.equal(open.reflectionState, 'open');
  assert.equal(open.meleeStrike, true);
  assert.ok(open.primitives[11].opacity > 0.9);
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
  assert.ok(parry.primitives[6].opacity > 0.9);
  assert.equal(riposte.riposte, true);
  assert.ok(riposte.primitives[8].opacity > 0.9, 'the counter is an independent attack');
  assert.equal(blueprintPointSafe(id, 2.62, { x: 390, y: 421 }), false);
  assert.equal(riposte.playerSafe, true);
  assert.ok(riposte.player.y > spec.counterStart[1] + spec.counterHalfWidth + 24);
  assert.equal(withheld.dangerActive, false);
  assert.ok(withheld.primitives[3].opacity > 0.9, 'the second guard is visible');
  assert.equal(withheld.primitives[8].opacity, 0, 'waiting does not create a counter');
  assert.equal(open.openStrike, true);
  assert.ok(open.primitives[10].opacity > 0.9);
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
  assert.ok(before.primitives[11].opacity > 0, 'the final radius is previewed');
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
    open.primitives[3].opacity > 0,
    'the final radius is previewed while interruption is open',
  );
  assert.ok(open.primitives[6].width > 0, 'the deadline gauge visibly advances');

  const interrupted = blueprintFrame(id, 1.58);
  assert.equal(interrupted.interruptHit, true);
  assert.equal(interrupted.windUpState, 'interrupted-open');
  assert.ok(interrupted.primitives[10].opacity > 0, 'the cancellation mark appears at contact');
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
  assert.ok(readingReach.primitives[5].opacity > 0, 'the snapshot beam links Tavi to Kern');
  assert.ok(readingReach.primitives[6].opacity > 0, 'the equipped reach rune remains visible');

  const copiedReach = blueprintFrame(id, 1.3);
  assert.ok(copiedReach.primitives[7].opacity > 0, 'Kern visibly copies the reach package');
  assert.ok(copiedReach.primitives[8].opacity > 0, 'the copied thrust lane is announced');

  const reachAttack = blueprintFrame(id, 1.85);
  assert.equal(reachAttack.reachDanger, true);
  assert.equal(reachAttack.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.85, { x: 450, y: 430 }), false);

  const readingBurst = blueprintFrame(id, 3.2);
  assert.equal(readingBurst.loadout, 'burst-rune');
  assert.equal(readingBurst.adaptedPackage, 'burst-ring');
  assert.ok(readingBurst.primitives[10].opacity > 0, 'the swapped burst rune remains visible');

  const copiedBurst = blueprintFrame(id, 3.6);
  assert.ok(copiedBurst.primitives[11].opacity > 0, 'Kern visibly copies the burst package');
  assert.ok(copiedBurst.primitives[12].opacity > 0, 'the copied ring is announced');

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
  assert.ok(building.primitives[2].opacity > 0, 'the lane is promised during preparation');
  assert.ok(building.primitives[6].opacity > 0, 'the third buildup rune appears before release');

  const firstRelease = blueprintFrame(id, 1.75);
  assert.equal(firstRelease.windUpState, 'short-release');
  assert.equal(firstRelease.windUpRelease, true);
  assert.equal(firstRelease.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.75, { x: 450, y: 430 }), false);
  assert.ok(firstRelease.primitives[3].opacity > 0, 'the promised lane becomes active');

  const held = blueprintFrame(id, 3.9);
  assert.equal(held.windUpState, 'held-ready');
  assert.equal(held.windUpProgress, 1);
  assert.equal(held.dangerActive, false);
  assert.ok(held.primitives[7].opacity > 0, 'the final pose remains visibly held');

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
  assert.ok(tracking.primitives[3].opacity > 0, 'the guide follows Tavi before lock');

  const firstLock = blueprintFrame(id, 1.3);
  assert.equal(firstLock.attackLocked, true);
  assert.deepEqual(firstLock.attackLockTarget, { x: 390, y: 560 });
  assert.ok(firstLock.primitives[4].opacity > 0, 'the captured ray replaces the tracking guide');
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
  assert.ok(startup.primitives[3].opacity > 0, 'startup previews the complete lane');
  assert.equal(startup.primitives[4].opacity, 0, 'startup does not expose the live hitbox');

  const active = blueprintFrame(id, 1.9);
  assert.equal(active.activePhaseState, 'active');
  assert.equal(active.hitboxActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.9, { x: 400, y: 430 }), false);
  assert.ok(active.primitives[4].opacity > 0, 'the active collision window is solid');
  assert.equal(active.primitives[9].opacity, 0, 'the end flash cannot precede the cutoff');

  const followThrough = blueprintFrame(id, 2.5);
  assert.equal(followThrough.activePhaseState, 'follow-through');
  assert.equal(followThrough.hitboxActive, false);
  assert.equal(blueprintPointSafe(id, 2.5, { x: 400, y: 430 }), true);
  assert.ok(followThrough.primitives[5].opacity > 0, 'harmless motion remains visible');
  assert.ok(blueprintFrame(id, 2.2).primitives[9].opacity > 0, 'the end flash follows the cutoff');

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
  assert.ok(startup.primitives[3].opacity > 0, 'startup previews the complete lane');
  assert.equal(startup.primitives[4].opacity, 0, 'the preview is not damaging');

  const active = blueprintFrame(id, 1.4);
  assert.equal(active.recoveryState, 'active');
  assert.equal(active.dangerActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.4, { x: 400, y: 430 }), false);
  assert.ok(active.primitives[4].opacity > 0, 'the damaging lane is solid');

  const opening = blueprintFrame(id, 1.8);
  assert.equal(opening.dangerActive, false);
  assert.equal(opening.recoveryLocked, true);
  assert.equal(opening.bossReady, false);
  assert.equal(blueprintPointSafe(id, 1.8, { x: 400, y: 430 }), true);
  assert.ok(opening.primitives[5].opacity > 0, 'sword reach is visible during recovery');
  assert.ok(opening.primitives[6].opacity > 0, 'the countdown is visible during recovery');
  assert.equal(opening.primitives[8].opacity, 0, 'the ready flash cannot appear early');

  const punish = blueprintFrame(id, 3.48);
  assert.equal(punish.recoveryLocked, true);
  assert.equal(punish.withinPunishReach, true);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[9].opacity > 0, 'the sword response reaches Kern');

  const ready = blueprintFrame(id, 4.6);
  assert.equal(ready.recoveryLocked, false);
  assert.equal(ready.bossReady, true);
  assert.ok(ready.primitives[8].opacity > 0, 'the ready flash follows the exact cutoff');
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
    signal.primitives[2].opacity > 0,
    'the shield is visible for the whole survival contract',
  );
  assert.ok(signal.primitives[5].opacity > 0, 'the first fixed circle previews before activation');

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
    const circle = active.primitives[5 + index];
    assert.equal(blueprintPointSafe(id, time, { x: circle.x, y: circle.y }), false);
  }

  const complete = blueprintFrame(id, 4.35);
  assert.equal(complete.survivalComplete, true);
  assert.equal(complete.survivalShielded, false);
  assert.equal(complete.dangerActive, false);
  assert.equal(complete.survivalRemaining, 0);
  assert.ok(complete.primitives[9].opacity > 0, 'one completion burst marks the handoff');

  const punish = blueprintFrame(id, 5.08);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[10].opacity > 0, 'the sword response appears only after completion');
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
  assert.ok(
    destinationTell.primitives[4].opacity > 0,
    'the exact destination rune is visible early',
  );

  const absent = blueprintFrame(id, 1.2);
  assert.equal(absent.teleportAbsent, true);
  assert.equal(absent.bossVisible, 0);
  assert.equal(absent.dangerActive, false);
  assert.equal(blueprintPointSafe(id, 1.2, { x: 270, y: 360 }), true);

  const followUpTell = blueprintFrame(id, 1.9);
  assert.equal(followUpTell.teleportState, 'follow-up-tell');
  assert.ok(followUpTell.primitives[5].opacity > 0, 'the stored follow-up lane previews');
  assert.equal(followUpTell.primitives[6].opacity, 0, 'preview geometry does not deal damage');

  const active = blueprintFrame(id, 2.5);
  assert.equal(active.teleportFollowUpActive, true);
  assert.equal(active.playerSafe, true);
  assert.ok(active.primitives[6].opacity > 0, 'the same fixed lane becomes solid');
  assert.equal(blueprintPointSafe(id, 2.5, { x: 390, y: 610 }), false);

  const punish = blueprintFrame(id, 3.55);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[8].opacity > 0, 'the sword response begins after danger ends');
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
  assert.ok(signal.primitives[5].opacity > 0, 'the lower current warns before scrolling');
  assert.equal(signal.primitives[6].opacity, 0, 'the warning has no active collision');

  const active = blueprintFrame(id, 2.75);
  assert.equal(active.forcedScrollingActive, true);
  assert.equal(active.playerSafe, true);
  assert.ok(active.forcedScrollingOffset > 100);
  assert.ok(active.primitives[6].opacity > 0.9, 'the fixed lower current becomes dangerous');
  assert.equal(blueprintPointSafe(id, 2.75, { x: 350, y: 750 }), false);
  assert.equal(blueprintPointSafe(id, 2.75, { x: 350, y: 620 }), true);

  const cleared = blueprintFrame(id, 4.4);
  assert.equal(cleared.forcedScrollingRouteCleared, true);
  assert.equal(cleared.dangerActive, false);
  assert.equal(cleared.primitives[6].opacity, 0, 'the lower current ends at the stop rune');

  const punish = blueprintFrame(id, 5.05);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[13].opacity > 0, 'the sword response follows route completion');
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
  assert.ok(signal.primitives[4].opacity > 0.7, 'the stone capture gate is visible before pursuit');
  assert.ok(signal.primitives[6].opacity > 0, 'the inner distance ring is visible');
  assert.ok(signal.primitives[7].opacity > 0, 'the outer distance ring is visible');

  const pursuit = blueprintFrame(id, 2.1);
  assert.equal(pursuit.chaseHerdingState, 'maintain-distance');
  assert.equal(pursuit.chaseInBand, true);
  assert.equal(pursuit.playerSafe, true);
  assert.equal(pursuit.dangerActive, false);
  assert.ok(pursuit.chaseDistance > 68 && pursuit.chaseDistance < 185);

  const intercept = blueprintFrame(id, 3.1);
  assert.equal(intercept.chaseIntercepted, true);
  assert.ok(intercept.primitives[11].opacity > 0.6, 'the stone shortcut stays visible');

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
  assert.ok(signal.primitives[8].opacity > 0.6, 'the gate rune lights before the run');
  assert.ok(signal.primitives[4].opacity > 0.7, 'the stone exit arch is explicit');

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
  assert.ok(interrupted.primitives[13].opacity > 0.6, 'the impact burst confirms interruption');

  const punish = blueprintFrame(id, 3.72);
  assert.equal(punish.escapePhaseState, 'opening');
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[14].opacity > 0, 'the sword response lands during the opening');
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
  assert.ok(preview.primitives[6].opacity > 0.4, 'the upper stone floor visibly cracks');

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
  assert.ok(punish.primitives[16].opacity > 0, 'the sword opening resumes in the lower room');

  const lift = blueprintFrame(id, 5.25);
  assert.equal(lift.relocatedArenaState, 'return-lift');
  assert.ok(lift.primitives[15].opacity > 0.8, 'the stone return lift is visible');
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
  assert.ok(preview.primitives[5].opacity > 0.4, 'the carved rune lights before remapping');

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
  assert.ok(jump.primitives[14].opacity > 0.8, 'the travelling ground spike remains visible');

  const punish = blueprintFrame(id, 3.85);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[15].opacity > 0, 'the sword response lands after the mode lesson');

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
  assert.ok(preview.primitives[3].opacity > 0.5, 'the first stone hold appears before mounting');

  const climbing = blueprintFrame(id, 1.5);
  assert.equal(climbing.bossAsTerrainMounted, true);
  assert.ok(climbing.player.y < preview.player.y, 'the player advances up the authored body route');

  const holding = blueprintFrame(id, 2.3);
  assert.equal(holding.bossAsTerrainState, 'hold-through-shake');
  assert.equal(holding.bossAsTerrainHolding, true);
  assert.equal(holding.dangerActive, true);
  assert.equal(holding.playerSafe, true);
  assert.ok(holding.bossAsTerrainGrip < 0.9 && holding.bossAsTerrainGrip > 0.58);
  assert.ok(holding.primitives[8].opacity > 0.8, 'stone chips announce the shake while holding');

  const opening = blueprintFrame(id, 3.72);
  assert.equal(opening.bossAsTerrainWeakPointOpen, true);
  assert.equal(opening.punishStrike, true);
  assert.ok(opening.primitives[11].opacity > 0.9, 'the sword reaches the opened weak point');

  const drop = blueprintFrame(id, 4.6);
  assert.equal(drop.bossAsTerrainSafeDrop, true);
  assert.ok(drop.primitives[9].opacity > 0.8, 'falling stone chips mark the dismount route');
  assert.ok(drop.primitives[10].opacity > 0.8, 'the stone landing ledge is visible');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-boss-as-terrain'),
    /data-blueprint-preview="boss-as-terrain"/,
  );
});

test('cover and line of sight derives safety from the blocker and ends the beam on its surface', () => {
  const id = 'cover-line-of-sight';
  assert.deepEqual([0, 0.6, 1.1, 1.8, 2.6, 3.5, 4.2, 5.5].map(coverLineOfSightState), [
    'open-arena',
    'source-locked',
    'moving-to-cover',
    'fully-covered',
    'beam-blocked',
    'safe-exit',
    'counter-window',
    'reset',
  ]);

  const preview = blueprintFrame(id, 1.1);
  assert.equal(preview.coverSourceLocked, true);
  assert.equal(preview.coverShadowVisible, true);
  assert.ok(preview.player.y > 610, 'the player is still moving toward the cover position');
  assert.ok(preview.primitives[5].opacity > 0.4, 'the safe shadow appears before commitment');
  assert.ok(preview.primitives[6].opacity > 0.6, 'the fixed source-to-target line remains visible');
  assert.equal(preview.primitives[6].x2, 470, 'the preview keeps the original target');
  assert.equal(preview.primitives[6].y2, 850, 'the preview does not follow the player');

  const blocked = blueprintFrame(id, 2.6);
  assert.equal(blocked.coverLineOfSightState, 'beam-blocked');
  assert.equal(blocked.coverOccupied, true);
  assert.equal(blocked.coverBeamActive, true);
  assert.equal(blocked.coverBeamBlocked, true);
  assert.equal(blocked.playerSafe, true);
  assert.equal(coverLineOfSightBlocked(2.6, { x: 470, y: 610 }), true);
  assert.equal(coverLineOfSightBlocked(2.6, { x: 470, y: 850 }), false);
  assert.equal(blueprintPointSafe(id, 2.6, { x: 470, y: 850 }), false);
  assert.ok(blocked.primitives[12].opacity > 0.9, 'the live beam is visible');
  assert.equal(blocked.primitives[12].x2, 285, 'the beam ends on the pillar face');
  assert.ok(
    Math.abs(
      (blocked.primitives[12].y2 - blocked.primitives[12].y1) /
        (blocked.primitives[12].x2 - blocked.primitives[12].x1) -
        (preview.primitives[6].y2 - preview.primitives[6].y1) /
          (preview.primitives[6].x2 - preview.primitives[6].x1),
    ) < 1e-9,
    'the beam follows the committed preview line',
  );
  assert.ok(blocked.primitives[14].opacity > 0.9, 'the blocked impact is explicit');

  const exit = blueprintFrame(id, 3.5);
  assert.equal(exit.coverExitOpen, true);
  assert.equal(exit.dangerActive, false);
  assert.ok(exit.player.x < 470 && exit.player.y < 610, 'the player leaves cover after the beam');

  const punish = blueprintFrame(id, 3.92);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[15].opacity > 0.9, 'the sword response lands after the beam ends');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-cover-line-of-sight'),
    /data-blueprint-preview="cover-line-of-sight"/,
  );
});

test('forced inertia preserves one committed vector until the authored braking patch', () => {
  const id = 'forced-inertia';
  assert.deepEqual([0, 0.6, 1, 1.5, 2.2, 3, 3.5, 4.1, 5.4].map(forcedInertiaState), [
    'stable-footing',
    'surface-freezing',
    'endpoint-preview',
    'direction-committed',
    'unsteerable-slide',
    'braking-zone',
    'control-restored',
    'counter-window',
    'reset',
  ]);

  const preview = blueprintFrame(id, 1.1);
  assert.equal(preview.forcedInertiaFrozen, true);
  assert.equal(preview.forcedInertiaVectorVisible, true);
  assert.equal(preview.forcedInertiaCommitted, false);
  assert.ok(preview.primitives[10].opacity > 0.5, 'the complete slide groove is visible');
  assert.ok(preview.primitives[11].opacity > 0.8, 'the braking stone is visible');

  const sliding = blueprintFrame(id, 2.2);
  assert.equal(sliding.forcedInertiaState, 'unsteerable-slide');
  assert.equal(sliding.forcedInertiaCommitted, true);
  assert.equal(sliding.forcedInertiaSliding, true);
  assert.equal(sliding.forcedInertiaSpeed, 1);
  assert.equal(sliding.dangerActive, true);
  assert.equal(sliding.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 2.2, { x: 492, y: 620 }), false);
  assert.ok(sliding.primitives[13].opacity > 0.7, 'the preserved momentum trail is visible');

  const braking = blueprintFrame(id, 3);
  assert.equal(braking.forcedInertiaBraking, true);
  assert.ok(braking.forcedInertiaSpeed > 0 && braking.forcedInertiaSpeed < 1);

  const restored = blueprintFrame(id, 3.5);
  assert.equal(restored.forcedInertiaControlRestored, true);
  assert.equal(restored.forcedInertiaSpeed, 0);
  assert.ok(restored.primitives[15].opacity > 0.7, 'control return is explicit');

  const punish = blueprintFrame(id, 3.72);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[16].opacity > 0.9, 'the sword response follows control return');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-forced-inertia'),
    /data-blueprint-preview="forced-inertia"/,
  );
});

test('wraparound projectile preserves one shot across linked boundaries before clearing the lane', () => {
  const id = 'wraparound-projectile';
  assert.deepEqual([0, 0.6, 1, 1.6, 2.3, 2.8, 3.8, 4.3, 5.4].map(wraparoundProjectileState), [
    'unlinked-boundaries',
    'boundary-link-signal',
    'route-preview',
    'first-pass',
    'boundary-crossing',
    'repeat-pass',
    'corridor-clear',
    'counter-window',
    'reset',
  ]);

  const preview = blueprintFrame(id, 1);
  assert.equal(preview.wraparoundBoundaryLinked, true);
  assert.equal(preview.wraparoundRouteVisible, true);
  assert.equal(preview.dangerActive, false);
  assert.ok(preview.primitives[6].opacity > 0.5, 'the floor groove previews the route');

  const first = blueprintFrame(id, 1.7);
  assert.equal(first.wraparoundFirstPass, true);
  assert.equal(first.wraparoundLap, 1);
  assert.equal(first.dangerActive, true);
  assert.equal(first.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.7, first.wraparoundProjectilePoint), false);
  assert.ok(first.primitives[11].opacity > 0.9, 'the original projectile is visible');

  const crossing = blueprintFrame(id, 2.3);
  assert.equal(crossing.wraparoundCrossing, true);
  assert.equal(crossing.wraparoundLap, 1);
  assert.equal(crossing.wraparoundProjectilePoints.length, 2);
  assert.ok(crossing.primitives[12].opacity > 0.7, 'the exit seam holds the same shot');
  assert.ok(crossing.primitives[13].opacity > 0.7, 'the linked entry announces re-entry');
  assert.equal(crossing.primitives[11].opacity, 0, 'no third projectile appears during crossing');

  const second = blueprintFrame(id, 2.8);
  assert.equal(second.wraparoundSecondPass, true);
  assert.equal(second.wraparoundLap, 2);
  assert.equal(second.dangerActive, true);
  assert.equal(blueprintPointSafe(id, 2.8, second.wraparoundProjectilePoint), false);

  const clear = blueprintFrame(id, 3.8);
  assert.equal(clear.wraparoundProjectileState, 'corridor-clear');
  assert.equal(clear.dangerActive, false);
  assert.equal(clear.wraparoundProjectilePoints.length, 0);

  const punish = blueprintFrame(id, 4.22);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[15].opacity > 0.9, 'the sword response follows the clear beat');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-wraparound-projectile'),
    /data-blueprint-preview="wraparound-projectile"/,
  );
});

test('beat-synced attack shares one clock across previews, lane hits, and the authored rest', () => {
  const id = 'beat-synced-attack';
  assert.deepEqual([0, 0.6, 1.3, 1.68, 2.3, 3.3, 4.2, 5.4].map(beatSyncedAttackState), [
    'silent-count',
    'tempo-count-in',
    'pattern-cued',
    'beat-strikes',
    'beat-strikes',
    'phrase-clear',
    'counter-window',
    'reset',
  ]);

  const preview = blueprintFrame(id, 1.3);
  assert.equal(preview.beatSyncedTelegraphIndex, 0);
  assert.equal(preview.beatSyncedTelegraphLane, 2);
  assert.equal(preview.dangerActive, false);
  assert.ok(preview.primitives[20].opacity > 0.5, 'the right lane is shown before its beat');

  const right = blueprintFrame(id, 1.68);
  assert.equal(right.beatSyncedAttackIndex, 0);
  assert.equal(right.beatSyncedAttackLane, 2);
  assert.equal(right.dangerActive, true);
  assert.equal(right.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 1.68, { x: 420, y: 700 }), false);
  assert.ok(right.primitives[20].opacity > 0.9, 'the first lane activates on the beat');

  const center = blueprintFrame(id, 2.28);
  assert.equal(center.beatSyncedAttackIndex, 1);
  assert.equal(center.beatSyncedAttackLane, 1);
  assert.equal(center.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 2.28, { x: 280, y: 700 }), false);

  const left = blueprintFrame(id, 2.88);
  assert.equal(left.beatSyncedAttackIndex, 2);
  assert.equal(left.beatSyncedAttackLane, 0);
  assert.equal(left.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 2.88, { x: 140, y: 700 }), false);

  const rest = blueprintFrame(id, 3.3);
  assert.equal(rest.beatSyncedPhraseComplete, true);
  assert.equal(rest.dangerActive, false);
  assert.equal(rest.beatSyncedAttackLane, -1);

  const punish = blueprintFrame(id, 4.18);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[21].opacity > 0.9, 'the sword response lands during the rest');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-beat-synced-attack'),
    /data-blueprint-preview="beat-synced-attack"/,
  );
});

test('invisibility preserves a continuous hidden body through bounded secondary cues', () => {
  const id = 'secondary-cues-invisibility';
  assert.deepEqual(
    [0, 0.7, 1.3, 2.4, 2.9, 3.2, 3.6, 4.2, 5.4].map(secondaryCuesInvisibilityState),
    [
      'visible-presence',
      'fading-body',
      'tracking-secondary-cues',
      'hidden-source-locked',
      'hidden-strike',
      'reveal-signal',
      'revealed-opening',
      'counter-window',
      'reset',
    ],
  );

  const tracking = blueprintFrame(id, 1.52);
  assert.equal(tracking.invisibilityHidden, true);
  assert.equal(tracking.invisibilityCueCount, 3);
  assert.equal(tracking.bossVisible, 0);
  assert.ok(tracking.primitives[13].opacity > 0.8, 'the newest footprint is strongly visible');

  const locked = blueprintFrame(id, 2.4);
  assert.equal(locked.invisibilitySourceLocked, true);
  assert.equal(locked.dangerActive, false);
  assert.ok(locked.primitives[18].opacity > 0.4, 'the floor previews its committed corridor');

  const active = blueprintFrame(id, 2.9);
  assert.equal(active.invisibilityAttackActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 2.9, { x: 300, y: 625 }), false);
  assert.equal(blueprintPointSafe(id, 2.9, { x: 470, y: 710 }), true);
  assert.ok(active.primitives[19].opacity > 0.8, 'the hidden strike activates only its lane');

  const reveal = blueprintFrame(id, 3.25);
  assert.equal(reveal.invisibilityRevealVisible, true);
  assert.ok(reveal.bossVisible > 0 && reveal.bossVisible < 1);
  assert.ok(reveal.primitives[20].opacity > 0.8, 'stone fragments announce the reveal');

  const punish = blueprintFrame(id, 4.18);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[21].opacity > 0.9, 'the sword response follows the reveal');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-secondary-cues-invisibility'),
    /data-blueprint-preview="secondary-cues-invisibility"/,
  );
});

test('sound detection commits to an audible event instead of the live player position', () => {
  const id = 'sound-detection';
  assert.deepEqual([0, 0.8, 1.4, 1.55, 2, 2.7, 3.05, 3.5, 4, 4.28, 5.3].map(soundDetectionState), [
    'unaware-patrol',
    'quiet-movement',
    'noise-emitted',
    'sound-registered',
    'investigating-last-heard',
    'stale-source-locked',
    'source-attack',
    'search-cooldown',
    'counter-approach',
    'counter-window',
    'reset',
  ]);

  const quiet = blueprintFrame(id, 0.8);
  assert.equal(quiet.soundDetectionQuietMove, true);
  assert.ok(quiet.soundDetectionNoiseLevel < 0.3);
  assert.ok(quiet.player.x < 260, 'quiet movement begins on the muffling mat');

  const emitted = blueprintFrame(id, 1.4);
  assert.equal(emitted.soundDetectionNoiseVisible, true);
  assert.equal(emitted.soundDetectionNoiseLevel, 1);
  assert.ok(emitted.primitives[8].opacity > 0, 'the emitted event expands from its source');

  const investigating = blueprintFrame(id, 2);
  assert.equal(investigating.soundDetectionHeard, true);
  assert.equal(investigating.soundDetectionBossHasLivePlayerPosition, false);
  assert.ok(investigating.primitives[10].opacity > 0, 'the boss reacts to the stored source');

  const locked = blueprintFrame(id, 2.7);
  assert.equal(locked.soundDetectionSourceLocked, true);
  assert.deepEqual(locked.player, { x: 480, y: 790 });

  const active = blueprintFrame(id, 3.05);
  assert.equal(active.soundDetectionAttackActive, true);
  assert.equal(active.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 3.05, { x: 380, y: 650 }), false);
  assert.equal(blueprintPointSafe(id, 3.05, { x: 480, y: 790 }), true);
  assert.ok(active.primitives[12].opacity > 0.8, 'the attack stays on the stale sound source');

  const punish = blueprintFrame(id, 4.28);
  assert.equal(punish.punishStrike, true);
  assert.ok(punish.primitives[14].opacity > 0.9, 'the sword response follows the search');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-sound-detection'),
    /data-blueprint-preview="sound-detection"/,
  );
});

test('objective-linked invulnerability opens only after every protection objective', () => {
  const id = 'objective-linked-invulnerability';
  assert.deepEqual(
    [0, 0.5, 0.9, 1.3, 2.1, 2.75, 2.95, 3.2, 3.5, 4.1, 4.5, 5.3].map(
      objectiveLinkedInvulnerabilityState,
    ),
    [
      'protected-objectives',
      'blocked-check',
      'approach-first-objective',
      'first-objective-cleared',
      'second-objective-cleared',
      'all-objectives-cleared',
      'protection-releasing',
      'vulnerability-window',
      'boss-hit',
      'window-closing',
      'protection-restored',
      'reset',
    ],
  );

  const blocked = blueprintFrame(id, 0.62);
  assert.equal(blocked.objectiveBlockedStrike, true);
  assert.equal(blocked.objectiveShielded, true);
  assert.equal(objectiveLinkedInvulnerabilityOutcome(0.62), 'immune');
  assert.ok(blocked.primitives[19].opacity > 0.8, 'the first sword strike visibly stops');

  const first = blueprintFrame(id, 1.3);
  assert.equal(first.objectiveCompletedCount, 1);
  assert.equal(objectiveLinkedInvulnerabilityOutcome(1.3, 'objective-1'), 'complete');
  assert.equal(first.primitives[4].opacity, 0, 'the completed pylon cuts its powered conduit');
  assert.equal(first.primitives[13].tone, 'muted', 'the crystal breaks after completion');

  const complete = blueprintFrame(id, 2.75);
  assert.equal(complete.objectiveCompletedCount, 3);
  assert.equal(complete.objectiveAllComplete, true);
  assert.equal(complete.objectiveShielded, true, 'completion precedes the release transition');

  const releasing = blueprintFrame(id, 2.95);
  assert.ok(releasing.objectiveShieldOpacity > 0 && releasing.objectiveShieldOpacity < 1);
  assert.ok(
    releasing.primitives[16].opacity > 0,
    'the shield plates remain visible as they release',
  );

  const vulnerable = blueprintFrame(id, 3.2);
  assert.equal(objectiveLinkedInvulnerabilityOutcome(3.2), 'vulnerable');
  assert.equal(vulnerable.objectiveShielded, false);
  assert.ok(vulnerable.objectiveWindowRemaining > 0);
  assert.ok(vulnerable.primitives[18].opacity > 0.7, 'the exposed core is readable');

  const hit = blueprintFrame(id, 3.46);
  assert.equal(hit.objectiveBossStrike, true);
  assert.ok(hit.primitives[24].opacity > 0.8, 'the sword crosses the boss during the window');
  assert.ok(hit.primitives[25].opacity > 0.8, 'the accepted hit confirms at the core');

  const closing = blueprintFrame(id, 4.1);
  assert.equal(closing.objectiveLinkedInvulnerabilityState, 'window-closing');
  assert.equal(objectiveLinkedInvulnerabilityOutcome(4.1), 'immune');
  assert.ok(closing.objectiveShieldOpacity > 0 && closing.objectiveShieldOpacity < 1);

  const restored = blueprintFrame(id, 4.5);
  assert.equal(restored.objectiveShielded, true);
  assert.equal(restored.objectiveCompletedCount, 3);

  const reset = blueprintFrame(id, 5.3);
  assert.equal(reset.objectiveCompletedCount, 0);
  assert.equal(reset.objectiveAllComplete, false);
  assert.equal(objectiveLinkedInvulnerabilityOutcome(5.3, 'objective-1'), 'active');

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-objective-linked-invulnerability'),
    /data-blueprint-preview="objective-linked-invulnerability"/,
  );
});

test('wave-clear objective advances only from sealed and empty enemy rosters', () => {
  const id = 'wave-clear-objective';
  assert.deepEqual(
    [0, 0.6, 1, 1.7, 2.4, 3.1, 3.8, 4.6, 4.8, 5.1, 5.4].map(waveClearObjectiveState),
    [
      'briefing',
      'wave-1-preview',
      'wave-1-active',
      'wave-1-cleared',
      'wave-2-active',
      'wave-2-cleared',
      'wave-3-active',
      'all-waves-cleared',
      'encounter-resolving',
      'reward-open',
      'reset',
    ],
  );

  const preview = waveClearObjectiveProgress(0.6);
  assert.equal(preview.wave, 1);
  assert.equal(preview.spawnQueueSealed, false);
  assert.equal(preview.rosterEmpty, true);

  const firstActive = blueprintFrame(id, 0.9);
  assert.equal(firstActive.waveClearWave, 1);
  assert.equal(firstActive.waveClearSpawnQueueSealed, true);
  assert.equal(firstActive.waveClearRemainingEnemies, 2);
  assert.equal(firstActive.waveClearRosterEmpty, false);
  assert.ok(firstActive.primitives[15].opacity > 0.8, 'the first stone creature is visible');

  const firstDefeat = blueprintFrame(id, 1.08);
  assert.equal(firstDefeat.waveClearHitIndex, 0);
  assert.ok(firstDefeat.primitives[24].opacity > 0.8, 'the sword connects to a roster target');
  const enemyPositions = [
    [
      [160, 620],
      [390, 620],
    ],
    [
      [420, 570],
      [280, 700],
      [140, 570],
    ],
    [
      [155, 650],
      [280, 600],
      [405, 650],
    ],
  ];
  const hitTimes = [
    [1.08, 1.38],
    [2.2, 2.48, 2.76],
    [3.62, 3.94, 4.28],
  ];
  for (const [waveIndex, times] of hitTimes.entries())
    for (const [enemyIndex, time] of times.entries()) {
      const player = blueprintFrame(id, time).player;
      const [x, y] = enemyPositions[waveIndex][enemyIndex];
      assert.ok(
        Math.hypot(player.x - x, player.y - y) < 80,
        `wave ${waveIndex + 1} hit stays near its target`,
      );
    }

  const firstEmpty = waveClearObjectiveProgress(1.45);
  assert.equal(firstEmpty.spawnQueueSealed, true);
  assert.equal(firstEmpty.remainingEnemies, 0);
  assert.equal(firstEmpty.rosterEmpty, true);
  assert.equal(firstEmpty.completedWaves, 0, 'the clear event follows the empty roster');

  const firstCleared = blueprintFrame(id, 1.65);
  assert.equal(firstCleared.waveClearCompletedWaves, 1);
  assert.equal(firstCleared.waveClearWave, 2);
  assert.ok(firstCleared.primitives[5].fill > 0.8, 'the first gate seal stays complete');

  const second = waveClearObjectiveProgress(2.4);
  assert.equal(second.wave, 2);
  assert.equal(second.completedWaves, 1);
  assert.equal(second.remainingEnemies, 2);

  const finalActive = blueprintFrame(id, 3.8);
  assert.equal(finalActive.waveClearWave, 3);
  assert.equal(finalActive.waveClearCompletedWaves, 2);
  assert.equal(finalActive.waveClearAllComplete, false);
  const headLeft = (primitive) => Number(primitive.data.match(/^M ([\d.]+)/)[1]);
  assert.ok(
    280 - headLeft(finalActive.primitives[19]) > 155 - headLeft(finalActive.primitives[18]),
    'the elite stone creature has a larger silhouette',
  );

  const resolved = blueprintFrame(id, 4.6);
  assert.equal(resolved.waveClearCompletedWaves, 3);
  assert.equal(resolved.waveClearAllComplete, true);
  assert.equal(resolved.waveClearRewardOpen, false);

  const reward = blueprintFrame(id, 5.1);
  assert.equal(reward.waveClearRewardOpen, true);
  assert.ok(reward.primitives[29].opacity > 0.8, 'the chest opens after final resolution');

  const reset = blueprintFrame(id, 5.4);
  assert.equal(reset.waveClearWave, 0);
  assert.equal(reset.waveClearCompletedWaves, 0);
  assert.equal(reset.waveClearAllComplete, false);

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-wave-clear-objective'),
    /data-blueprint-preview="wave-clear-objective"/,
  );
});

test('environmental weapon attributes boss progress to a prepared fixed device', () => {
  const id = 'environmental-weapon';
  assert.deepEqual(
    [0, 1, 1.4, 1.7, 2.5, 2.6, 2.9, 3.2, 3.55, 3.8, 4.8, 5.2].map(environmentalWeaponState),
    [
      'device-briefing',
      'reach-power-node',
      'prepare-power-node',
      'reach-device',
      'device-ready',
      'aim-preview',
      'aim-locked',
      'device-fired',
      'device-hit',
      'damage-window',
      'device-spent',
      'reset',
    ],
  );

  const powered = blueprintFrame(id, 1.6);
  assert.equal(powered.environmentalDevicePowered, true);
  assert.ok(powered.primitives[8].opacity > 0.8, 'the powered cable is readable');

  const reached = blueprintFrame(id, 2.5);
  assert.equal(reached.environmentalDeviceReached, true);
  assert.ok(Math.hypot(reached.player.x - 430, reached.player.y - 690) < 1);

  const preview = blueprintFrame(id, 2.7);
  assert.equal(preview.environmentalAimLocked, false);
  assert.ok(preview.primitives[17].opacity > 0.3, 'the device previews its line of fire');

  const locked = blueprintFrame(id, 2.95);
  assert.equal(locked.environmentalAimLocked, true);
  assert.ok(locked.primitives[20].opacity > 0.8, 'the boss receives a distinct lock marker');

  const fired = blueprintFrame(id, 3.25);
  assert.equal(fired.environmentalDeviceFired, true);
  assert.equal(fired.environmentalBossDamaged, false);
  assert.equal(fired.playerMotion.attack, 0, 'the sword never owns the device shot');
  assert.ok(fired.primitives[19].opacity > 0.9, 'the harpoon travels from the device');

  const hit = blueprintFrame(id, 3.55);
  assert.equal(hit.environmentalBossDamaged, true);
  assert.equal(hit.environmentalDamageSource, 'device');
  assert.equal(hit.primitives[1].rectWidth, 100);
  assert.ok(hit.primitives[21].opacity > 0.8, 'impact and health loss resolve together');

  const spent = blueprintFrame(id, 3.8);
  assert.equal(spent.environmentalDeviceSpent, true);
  assert.ok(spent.primitives[22].opacity > 0.7, 'the used device becomes visibly spent');

  assert.equal(blueprintPointSafe(id, 3.25, fired.player), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-environmental-weapon'),
    /data-blueprint-preview="environmental-weapon"/,
  );
});

test('encounter-specific tool moves with its owner and temporarily replaces the action package', () => {
  const id = 'encounter-specific-tool';
  assert.deepEqual(
    [0, 1, 1.35, 1.6, 2, 2.5, 3, 3.25, 3.6, 4.3, 4.8, 5.3].map(encounterSpecificToolState),
    [
      'tool-briefing',
      'reach-tool',
      'pickup',
      'tool-equipped',
      'carry-tool',
      'charge-tool',
      'tool-ready',
      'tool-fired',
      'tool-hit',
      'recovery',
      'tool-expired',
      'reset',
    ],
  );

  const pickup = blueprintFrame(id, 1.35);
  assert.equal(pickup.encounterToolReached, true);
  assert.equal(pickup.encounterToolActionPackage, 'sword');
  assert.ok(pickup.primitives[4].opacity > 0.9, 'the spear remains on its pedestal before equip');

  const equipped = blueprintFrame(id, 1.6);
  assert.equal(equipped.encounterToolEquipped, true);
  assert.equal(equipped.encounterToolActionPackage, 'rune-spear');
  assert.ok(equipped.primitives[6].opacity > 0.9, 'the spear follows its owner after equip');
  assert.equal(equipped.primitives[4].opacity, 0, 'the pedestal spear is removed on pickup');

  const charging = blueprintFrame(id, 2.5);
  assert.equal(charging.encounterToolCharging, true);
  assert.equal(charging.encounterToolCombatReached, true);
  assert.ok(charging.primitives[8].opacity > 0.3, 'the spear blade exposes charge progress');

  const ready = blueprintFrame(id, 3);
  assert.equal(ready.encounterToolReady, true);
  assert.ok(ready.primitives[9].opacity > 0.4, 'the spear previews its eligible target');

  const fired = blueprintFrame(id, 3.25);
  assert.equal(fired.encounterToolFired, true);
  assert.equal(fired.encounterToolBossDamaged, false);
  assert.equal(fired.playerMotion.attack, 0, 'the ordinary sword never owns the tool release');
  assert.ok(fired.primitives[11].opacity > 0.9, 'the rune bolt originates at the carried spear');

  const hit = blueprintFrame(id, 3.6);
  assert.equal(hit.encounterToolBossDamaged, true);
  assert.equal(hit.encounterToolDamageSource, 'encounter-tool');
  assert.equal(hit.primitives[1].rectWidth, 110);
  assert.ok(hit.primitives[12].opacity > 0.7, 'impact and health loss resolve together');

  const expired = blueprintFrame(id, 4.8);
  assert.equal(expired.encounterToolExpired, true);
  assert.equal(expired.encounterToolActionPackage, 'sword');
  assert.ok(expired.primitives[13].opacity > 0.5, 'expiry is visible before reset');

  assert.equal(blueprintPointSafe(id, 3.25, fired.player), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  const preview = renderBlueprintThumbnail(id, 'test-encounter-specific-tool');
  assert.match(preview, /data-blueprint-preview="encounter-specific-tool"/);
  assert.match(preview, /data-rig-part="weapon" opacity="0"/);
});

test('player-controlled boss preserves authored attacks through human and AI ownership', () => {
  const id = 'player-controlled-boss';
  assert.deepEqual(
    [0, 0.8, 1.3, 1.7, 2.1, 2.3, 2.8, 3.2, 3.7, 4.1, 4.6, 5.3].map(playerControlledBossState),
    [
      'matching',
      'candidate-found',
      'assigning-controller',
      'human-controlled',
      'action-queued',
      'attack-telegraph',
      'attack-active',
      'human-recovery',
      'connection-lost',
      'ai-takeover',
      'ai-controlled',
      'reset',
    ],
  );

  const assigned = blueprintFrame(id, 1.6);
  assert.equal(assigned.playerBossAssigned, true);
  assert.equal(assigned.playerBossController, 'human');
  assert.equal(assigned.playerBossHealthPreserved, true);

  const telegraph = blueprintFrame(id, 2.3);
  assert.equal(telegraph.playerBossCommandAccepted, true);
  assert.equal(telegraph.playerBossTelegraphVisible, true);
  assert.equal(telegraph.dangerActive, false);
  assert.ok(
    telegraph.primitives.some(
      (primitive) =>
        primitive.data === 'M 266 287 L 334 313 L 129 848 L 61 822 Z' && primitive.opacity > 0.5,
    ),
    'the authored lane is announced as a filled area',
  );

  const active = blueprintFrame(id, 2.8);
  assert.equal(active.playerBossAttackActive, true);
  assert.equal(active.dangerActive, true);
  assert.equal(active.playerSafe, true, 'Tavi clears the lane before it becomes active');
  assert.equal(blueprintPointSafe(id, 2.8, { x: 95, y: 720 }), false);

  const lost = blueprintFrame(id, 3.7);
  assert.equal(lost.playerBossHeartbeatLost, true);
  assert.equal(lost.playerBossFrozen, true);
  assert.equal(lost.playerBossController, 'none');

  const takeover = blueprintFrame(id, 4.1);
  assert.equal(takeover.playerBossAiTakeover, true);
  assert.equal(takeover.playerBossController, 'ai');
  assert.equal(takeover.playerBossHealthPreserved, true);
  assert.equal(takeover.playerBossRewardGrants, 0);

  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-player-controlled-boss'),
    /data-blueprint-preview="player-controlled-boss"/,
  );
});

test('projectile rally preserves one orb through accelerating ownership transfers', () => {
  const id = 'projectile-rally';
  assert.deepEqual(
    [0, 0.6, 0.9, 1.6, 2.2, 2.6, 3, 3.3, 3.6, 4.1, 4.7, 5.3].map(projectileRallyState),
    [
      'briefing',
      'serve-wind-up',
      'boss-serve',
      'player-return-1',
      'boss-return-1',
      'player-return-2',
      'boss-return-2',
      'player-return-3',
      'boss-miss',
      'punished-opening',
      'recovery',
      'reset',
    ],
  );

  const serve = blueprintFrame(id, 0.9);
  const firstReturn = blueprintFrame(id, 1.6);
  const secondServe = blueprintFrame(id, 2.2);
  const finalReturn = blueprintFrame(id, 3.2);
  assert.equal(serve.projectileRallyProjectileId, 'rune-orb-1');
  assert.equal(firstReturn.projectileRallyProjectileId, serve.projectileRallyProjectileId);
  assert.equal(secondServe.projectileRallyProjectileId, serve.projectileRallyProjectileId);
  assert.equal(finalReturn.projectileRallyProjectileId, serve.projectileRallyProjectileId);
  assert.deepEqual(
    [
      serve.projectileRallyOwner,
      firstReturn.projectileRallyOwner,
      secondServe.projectileRallyOwner,
    ],
    ['boss', 'player', 'boss'],
  );
  assert.deepEqual(
    [
      serve.projectileRallySpeedTier,
      secondServe.projectileRallySpeedTier,
      finalReturn.projectileRallySpeedTier,
    ],
    [1, 2, 3],
  );
  assert.equal(finalReturn.projectileRallyExchangeCount, 5);
  assert.equal(blueprintPointSafe(id, 0.9, serve.projectileRallyOrb), false);
  assert.equal(serve.playerSafe, true);

  const miss = blueprintFrame(id, 3.6);
  assert.equal(miss.projectileRallyBossMiss, true);
  assert.equal(miss.projectileRallyVulnerable, true);
  assert.equal(miss.projectileRallyDamageSource, 'rally-orb');
  assert.ok(
    miss.primitives.some(
      (primitive) =>
        primitive.type === 'circle' &&
        primitive.x === 300 &&
        primitive.y === 400 &&
        primitive.radius === 42 &&
        primitive.opacity > 0.2,
    ),
    'the boss miss has a visible impact',
  );

  const punish = blueprintFrame(id, 4);
  assert.equal(punish.projectileRallyPunished, true);
  assert.equal(punish.projectileRallyVulnerable, true);
  assert.ok(punish.playerMotion.attack > 0.5, 'Tavi owns a separate sword punish');
  assert.ok(
    punish.primitives.some(
      (primitive) =>
        primitive.type === 'path' &&
        primitive.data.includes('M 283 303') &&
        primitive.opacity > 0.8,
    ),
    'the cracked chest core marks the opening',
  );

  const closed = blueprintFrame(id, 4.7);
  assert.equal(closed.projectileRallyVulnerable, false);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-projectile-rally'),
    /data-blueprint-preview="projectile-rally"/,
  );
});

test('baited self-hit requires an armed trap, a fixed boss path, and one owned resolution', () => {
  const id = 'baited-self-hit';
  assert.deepEqual([0, 0.5, 0.9, 1.2, 1.45, 1.8, 2.5, 2.7, 3.4, 4.5, 5.3].map(baitedSelfHitState), [
    'available',
    'arming',
    'armed',
    'target-acquired',
    'target-locked',
    'charging',
    'boss-contact',
    'self-hit-stagger',
    'punished-opening',
    'recovery',
    'reset',
  ]);

  const armed = blueprintFrame(id, 0.9);
  assert.equal(armed.baitTrapId, 'quarry-rune-1');
  assert.equal(armed.baitTrapArmed, true);
  assert.equal(armed.baitTargetAcquired, false);

  const locked = blueprintFrame(id, 1.45);
  assert.equal(locked.baitTargetAcquired, true);
  assert.equal(locked.baitTargetLocked, true);
  assert.equal(locked.baitChargeActive, false);

  const charging = blueprintFrame(id, 1.8);
  assert.equal(charging.baitChargeActive, true);
  assert.equal(charging.dangerActive, true);
  const corridor = charging.primitives.find(
    (primitive) => primitive.type === 'path' && primitive.data === 'M 260 295 H 340 V 790 H 260 Z',
  );
  assert.ok(corridor, 'the filled charge path matches the committed lane width');
  assert.equal(corridor.width, 0);
  assert.equal(blueprintPointSafe(id, 1.8, { x: 300, y: 760 }), false);

  const cleared = blueprintFrame(id, 2.2);
  assert.equal(cleared.baitPlayerClear, true);
  assert.equal(cleared.playerSafe, true);
  assert.equal(blueprintPointSafe(id, 2.2, { x: 300, y: 760 }), false);

  const contact = blueprintFrame(id, 2.5);
  assert.equal(contact.baitBossContact, true);
  assert.equal(contact.baitCollisionPair, 'kern|quarry-rune-1');
  assert.equal(contact.baitSelfHitResolved, false);

  const resolved = blueprintFrame(id, 2.7);
  assert.equal(resolved.baitTrapConsumed, true);
  assert.equal(resolved.baitSelfHitResolved, true);
  assert.equal(resolved.baitDamageSource, 'prepared-hazard');
  assert.equal(resolved.baitRewardGrants, 1);
  assert.equal(resolved.baitVulnerable, true);

  const punished = blueprintFrame(id, 3.3);
  assert.equal(punished.baitPunished, true);
  assert.equal(punished.baitRewardGrants, 1, 'the collision reward is not duplicated');
  assert.ok(punished.playerMotion.attack > 0.5, 'Tavi owns a separate sword punish');

  const closed = blueprintFrame(id, 4.5);
  assert.equal(closed.baitVulnerable, false);
  assert.equal(closed.baitRewardGrants, 1);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-baited-self-hit'),
    /data-blueprint-preview="baited-self-hit"/,
  );
});

test('posture break recovers under lost pressure and advances only through one finisher', () => {
  const id = 'posture-stagger-gauge';
  assert.deepEqual([0, 0.8, 1.2, 1.5, 2.7, 2.9, 3.5, 4.1, 5.3].map(postureStaggerGaugeState), [
    'ready',
    'pressure-started',
    'recovering-posture',
    'sustained-pressure',
    'posture-broken',
    'critical-ready',
    'finisher-consumed',
    'boss-recovery',
    'reset',
  ]);

  const firstHit = blueprintFrame(id, 0.8);
  assert.equal(firstHit.postureValue, 32);
  assert.equal(firstHit.postureHealthChanged, false);

  const recovering = blueprintFrame(id, 1.2);
  assert.equal(recovering.postureRecovering, true);
  assert.ok(recovering.postureValue < firstHit.postureValue);
  assert.ok(recovering.postureValue > 18);

  const broken = blueprintFrame(id, 2.7);
  assert.equal(broken.postureValue, 100);
  assert.equal(broken.postureBroken, true);
  assert.equal(broken.postureBreakId, 'posture-break-1');
  assert.equal(broken.postureRewardGrants, 0);
  assert.equal(broken.postureHealthChanged, false);
  const postureBar = broken.primitives.find(
    (primitive) =>
      primitive.type === 'path' &&
      primitive.data === 'M 120 71 H 440 V 91 H 120 Z' &&
      primitive.tone === 'signal',
  );
  assert.ok(postureBar, 'the filled posture gauge reaches its threshold');
  assert.equal(postureBar.width, 0);

  const ready = blueprintFrame(id, 2.9);
  assert.equal(ready.postureCriticalReady, true);
  assert.equal(ready.postureFinisherEligible, true);
  assert.equal(ready.posturePhaseTokens, 3);

  const consumed = blueprintFrame(id, 3.5);
  assert.equal(consumed.postureFinisherConsumed, true);
  assert.equal(consumed.postureCriticalReady, false);
  assert.equal(consumed.postureRewardGrants, 1);
  assert.equal(consumed.posturePhaseTokens, 2);
  assert.equal(consumed.postureHealthChanged, true);
  assert.ok(consumed.playerMotion.attack > 0.5);

  const recovery = blueprintFrame(id, 4.1);
  assert.equal(recovery.postureRewardGrants, 1, 'the finisher result is not duplicated');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.deepEqual(blueprintFrame(id, 0).boss, blueprintFrame(id, 6).boss);
  assert.match(
    renderBlueprintThumbnail(id, 'test-posture-stagger-gauge'),
    /data-blueprint-preview="posture-stagger-gauge"/,
  );
});

test('pacifist resolution keeps health intact and reserves one spared result', () => {
  const id = 'pacifist-resolution';
  assert.deepEqual(
    [0, 0.5, 0.8, 1, 1.5, 1.8, 2.3, 2.7, 2.9, 3.5, 4.2, 5.3].map(pacifistResolutionState),
    [
      'combat-ready',
      'weapon-sheathed',
      'restraint-tracking',
      'restraint-threat-1',
      'restraint-tracking',
      'restraint-threat-2',
      'restraint-threat-3',
      'condition-complete',
      'choice-offered',
      'spare-committed',
      'spared',
      'reset',
    ],
  );
  assert.equal(
    pacifistResolutionOutcome({ conditionComplete: false, action: 'spare' }),
    'ineligible',
  );
  assert.equal(
    pacifistResolutionOutcome({ conditionComplete: false, action: 'attack' }),
    'condition-reset',
  );
  assert.equal(
    pacifistResolutionOutcome({ conditionComplete: true, action: 'attack' }),
    'route-closed',
  );
  assert.equal(pacifistResolutionOutcome({ conditionComplete: true, action: 'spare' }), 'spared');

  for (const [time, unsafe, safe] of [
    [1, { x: 280, y: 660 }, { x: 180, y: 660 }],
    [1.8, { x: 390, y: 660 }, { x: 300, y: 660 }],
    [2.3, { x: 170, y: 660 }, { x: 420, y: 660 }],
  ]) {
    const frame = blueprintFrame(id, time);
    assert.equal(frame.dangerActive, true);
    assert.equal(blueprintPointSafe(id, time, unsafe), false);
    assert.equal(blueprintPointSafe(id, time, safe), true);
    assert.equal(frame.playerSafe, true);
    assert.equal(frame.pacifistBossHealth, 100);
    assert.equal(frame.pacifistOffensiveEvents, 0);
    assert.equal(frame.pacifistWeaponSheathed, true);
  }

  const eligible = blueprintFrame(id, 2.9);
  assert.equal(eligible.pacifistConditionComplete, true);
  assert.equal(eligible.pacifistChoiceOffered, true);
  assert.equal(eligible.pacifistSpared, false);
  assert.equal(eligible.pacifistDefeated, false);

  const committed = blueprintFrame(id, 3.5);
  assert.equal(committed.pacifistSpareCommitted, true);
  assert.equal(committed.pacifistResolutionId, 'pacifist-resolution-1');
  assert.equal(committed.pacifistRewardGrants, 0);

  const resolved = blueprintFrame(id, 4.2);
  assert.equal(resolved.pacifistSpared, true);
  assert.equal(resolved.pacifistDefeated, false);
  assert.equal(resolved.pacifistBossHealth, 100);
  assert.equal(resolved.pacifistRewardGrants, 1);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-pacifist-resolution'),
    /data-blueprint-preview="pacifist-resolution"/,
  );
  assert.match(
    renderBlueprintThumbnail(id, 'test-pacifist-resolution'),
    /data-rig-part="weapon" opacity="0"/,
  );
});

test('persistent progress restores committed objectives while transient combat resets', () => {
  const id = 'persistent-progress';
  assert.deepEqual(
    [0, 0.8, 1.05, 1.2, 1.5, 1.9, 2.3, 2.56, 2.75, 3, 3.5, 4, 4.3, 5.5].map(
      persistentProgressState,
    ),
    [
      'attempt-1',
      'anchor-1-broken',
      'checkpoint-1',
      'defeat-1',
      'restore-1',
      'attempt-2',
      'anchor-2-broken',
      'checkpoint-2',
      'defeat-2',
      'restore-2',
      'core-open',
      'core-strike',
      'resolved',
      'reset',
    ],
  );

  assert.deepEqual(persistentProgressRestore({ completedObjectives: 1 }), {
    status: 'restored',
    completedObjectives: 1,
    remainingObjectives: 2,
    activeObjective: 'anchor-right',
    bossTransientHealth: 100,
    playerHealth: 100,
  });
  assert.deepEqual(persistentProgressRestore({ completedObjectives: 99 }), {
    status: 'restored',
    completedObjectives: 3,
    remainingObjectives: 0,
    activeObjective: 'complete',
    bossTransientHealth: 0,
    playerHealth: 100,
  });
  assert.equal(
    persistentProgressRestore({ completedObjectives: 2, snapshotVersion: 2 }).status,
    'unsupported-version',
  );

  const firstCommit = blueprintFrame(id, 1.05);
  assert.equal(firstCommit.persistentProgressCompletedObjectives, 1);
  assert.equal(firstCommit.persistentProgressRevision, 1);
  assert.equal(firstCommit.persistentProgressBossHealth, 100);
  const firstDefeat = blueprintFrame(id, 1.2);
  assert.equal(firstDefeat.dangerActive, true);
  assert.equal(firstDefeat.persistentProgressPlayerAlive, false);
  assert.equal(firstDefeat.playerSafe, false, 'the demonstration intentionally proves a retry');
  const hazard = firstDefeat.primitives.find(
    (primitive) => primitive.type === 'path' && primitive.data === 'M 80 506 H 520 V 574 H 80 Z',
  );
  assert.ok(hazard, 'the filled hazard matches the collision lane');
  assert.equal(hazard.width, 0);
  assert.equal(blueprintPointSafe(id, 1.2, { x: 300, y: 760 }), true);

  const secondAttempt = blueprintFrame(id, 1.9);
  assert.equal(secondAttempt.persistentProgressAttempt, 2);
  assert.equal(secondAttempt.persistentProgressRetryCount, 1);
  assert.equal(secondAttempt.persistentProgressCompletedObjectives, 1);
  assert.equal(secondAttempt.persistentProgressBossHealth, 100);
  const secondDefeat = blueprintFrame(id, 2.75);
  assert.equal(secondDefeat.persistentProgressCompletedObjectives, 2);
  assert.equal(secondDefeat.persistentProgressPlayerAlive, false);

  const thirdAttempt = blueprintFrame(id, 3.5);
  assert.equal(thirdAttempt.persistentProgressAttempt, 3);
  assert.equal(thirdAttempt.persistentProgressCompletedObjectives, 2);
  assert.equal(thirdAttempt.persistentProgressCoreOpen, true);
  const resolved = blueprintFrame(id, 4.3);
  assert.equal(resolved.persistentProgressCompletedObjectives, 3);
  assert.equal(resolved.persistentProgressResultId, 'persistent-progress-1');
  assert.equal(resolved.persistentProgressRewardGrants, 1);
  assert.equal(resolved.persistentProgressBossHealth, 0);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-persistent-progress'),
    /data-blueprint-preview="persistent-progress"/,
  );
});

test('status buildup decays partial exposure and emits one effect at the threshold', () => {
  const id = 'status-buildup';
  assert.deepEqual([0, 0.8, 1.2, 1.8, 2.2, 2.62, 2.8, 3.8, 4.6, 5.3].map(statusBuildupState), [
    'clear',
    'partial-buildup',
    'decaying',
    'partially-cleared',
    'chain-buildup',
    'threshold-reached',
    'status-active',
    'temporary-immunity',
    'clear',
    'reset',
  ]);
  assert.deepEqual(statusBuildupApply({ current: 70, amount: 40 }), {
    value: 100,
    triggered: true,
    effectCount: 1,
    ignored: false,
  });
  assert.deepEqual(statusBuildupApply({ current: 30, amount: 80, immune: true }), {
    value: 30,
    triggered: false,
    effectCount: 0,
    ignored: true,
  });

  const firstContact = blueprintFrame(id, 0.72);
  assert.equal(firstContact.statusBuildupValue, 38);
  assert.equal(firstContact.dangerActive, true);
  assert.equal(firstContact.playerSafe, false, 'the demonstration intentionally applies buildup');
  const field = firstContact.primitives.find(
    (primitive) =>
      primitive.type === 'circle' &&
      primitive.x === 280 &&
      primitive.y === 300 &&
      primitive.radius === 235,
  );
  assert.ok(field, 'the filled rune field matches the exposure radius');
  assert.equal(field.width, 0);
  assert.equal(blueprintPointSafe(id, 0.72, { x: 470, y: 780 }), true);
  assert.equal(Math.round(blueprintFrame(id, 1.72).statusBuildupValue), 14);
  assert.equal(Math.round(blueprintFrame(id, 2.2).statusBuildupValue), 55);

  const triggered = blueprintFrame(id, 2.8);
  assert.equal(triggered.statusBuildupValue, 100);
  assert.equal(triggered.statusBuildupThresholdReached, true);
  assert.equal(triggered.statusBuildupEffectActive, true);
  assert.equal(triggered.statusBuildupEffectCount, 1);
  assert.equal(triggered.statusBuildupEffectId, 'status-effect-1');

  const immune = blueprintFrame(id, 4.05);
  assert.equal(immune.statusBuildupValue, 0);
  assert.equal(immune.statusBuildupImmune, true);
  assert.equal(immune.statusBuildupIgnoredContacts, 1);
  assert.equal(immune.statusBuildupEffectCount, 1);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-status-buildup'),
    /data-blueprint-preview="status-buildup"/,
  );
});

test('instant kill resolves one terminal predicate without ordinary damage', () => {
  const id = 'instant-kill';
  assert.deepEqual([0, 0.5, 1, 1.4, 2, 2.65, 2.9, 3.2, 4.4, 4.8, 5.3].map(instantKillState), [
    'ready',
    'first-telegraph',
    'first-avoided',
    'repositioning',
    'second-telegraph',
    'condition-locked',
    'executing',
    'attempt-ended',
    'restoring',
    'ready',
    'reset',
  ]);
  assert.deepEqual(instantKillResolve({ conditionMet: false }), {
    outcome: 'avoided',
    resultCount: 0,
    damage: 0,
  });
  assert.deepEqual(instantKillResolve({ conditionMet: true }), {
    outcome: 'executed',
    resultCount: 1,
    damage: 0,
  });
  assert.equal(instantKillResolve({ conditionMet: true, resultReserved: true }).outcome, 'locked');

  const avoided = blueprintFrame(id, 1);
  assert.equal(avoided.instantKillFirstAvoided, true);
  assert.equal(avoided.instantKillResultCount, 0);
  assert.equal(avoided.instantKillHealthBefore, 100);
  const execution = blueprintFrame(id, 2.9);
  assert.equal(execution.dangerActive, true);
  assert.equal(execution.playerSafe, false);
  assert.equal(blueprintPointSafe(id, 2.9, { x: 450, y: 750 }), true);
  const trap = execution.primitives.find(
    (primitive) =>
      primitive.type === 'circle' &&
      primitive.x === 280 &&
      primitive.y === 660 &&
      primitive.radius === 92,
  );
  assert.ok(trap, 'the filled trap matches the execution condition');
  assert.equal(trap.width, 0);
  assert.equal(execution.instantKillExecuted, true);
  assert.equal(execution.instantKillDamageApplied, 0);
  assert.equal(execution.instantKillResultCount, 1);
  assert.equal(execution.instantKillResultId, 'instant-kill-1');
  assert.equal(execution.instantKillFirstAvoided, false);
  assert.equal(blueprintFrame(id, 3.2).instantKillAttemptEnded, true);
  assert.equal(blueprintFrame(id, 3.2).playerMotion.crouch, 0.85);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-instant-kill'),
    /data-blueprint-preview="instant-kill"/,
  );
});

test('maximum health reduction separates damage, the reduced cap, blocked healing, and cleanse', () => {
  const id = 'maximum-health-reduction';
  assert.deepEqual(
    [0, 0.5, 1.05, 1.4, 2, 2.8, 3.5, 3.9, 4.25, 4.6, 5.1, 5.5].map(maximumHealthReductionState),
    [
      'ready',
      'first-telegraph',
      'first-avoided',
      'repositioning',
      'second-telegraph',
      'cap-reduced',
      'healing-to-cap',
      'healing-blocked',
      'cleansing',
      'capacity-restored',
      'recovered',
      'reset',
    ],
  );
  assert.deepEqual(maximumHealthReductionResolve(), {
    currentBefore: 80,
    maximumBefore: 100,
    damage: 20,
    capLoss: 35,
    currentAfter: 60,
    maximumAfter: 65,
  });
  assert.deepEqual(
    maximumHealthReductionResolve({
      currentHealth: 20,
      maximumHealth: 30,
      damage: 5,
      capLoss: 40,
    }),
    {
      currentBefore: 20,
      maximumBefore: 30,
      damage: 5,
      capLoss: 29,
      currentAfter: 1,
      maximumAfter: 1,
    },
  );

  const avoided = blueprintFrame(id, 1.05);
  assert.equal(avoided.maximumHealthFirstAvoided, true);
  assert.equal(avoided.maximumHealthMaximum, 100);
  assert.equal(avoided.maximumHealthCapEventCount, 0);
  const hit = blueprintFrame(id, 2.68);
  assert.equal(hit.dangerActive, true);
  assert.equal(hit.playerSafe, false);
  assert.equal(blueprintPointSafe(id, 2.68, { x: 450, y: 750 }), true);
  const lane = hit.primitives.find(
    (primitive) =>
      primitive.type === 'path' && primitive.data.includes('M 232 300 H 368 V 830 H 232 Z'),
  );
  assert.ok(lane, 'the filled danger lane matches the collision width and reaches the far edge');
  assert.equal(lane.width, 0);
  const reduced = blueprintFrame(id, 3.1);
  assert.equal(reduced.maximumHealthCurrent, 60);
  assert.equal(reduced.maximumHealthMaximum, 65);
  assert.equal(reduced.maximumHealthDamageApplied, 20);
  assert.equal(reduced.maximumHealthCapEventCount, 1);
  const blocked = blueprintFrame(id, 3.72);
  assert.equal(blocked.maximumHealthCurrent, 65);
  assert.equal(blocked.maximumHealthMaximum, 65);
  assert.equal(blocked.maximumHealthHealRequested, 40);
  assert.equal(blocked.maximumHealthHealApplied, 5);
  assert.equal(blocked.maximumHealthHealBlocked, 35);
  assert.equal(blocked.maximumHealthHealingBlocked, true);
  const restored = blueprintFrame(id, 4.96);
  assert.equal(restored.maximumHealthCurrent, 100);
  assert.equal(restored.maximumHealthMaximum, 100);
  assert.equal(restored.maximumHealthRestored, true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-maximum-health-reduction'),
    /data-blueprint-preview="maximum-health-reduction"/,
  );
});

test('ability lock rejects healing only while preserving movement and attack', () => {
  const id = 'ability-lock';
  assert.deepEqual(
    [0, 0.5, 1, 1.2, 1.6, 2.1, 2.7, 3.2, 3.7, 4.1, 4.35, 4.6, 5.1, 5.5].map(abilityLockState),
    [
      'ready',
      'first-telegraph',
      'first-avoided',
      'healing-allowed',
      'repositioning',
      'second-telegraph',
      'healing-locked',
      'healing-rejected',
      'other-actions-available',
      'lock-countdown',
      'lock-expired',
      'healing-restored',
      'recovered',
      'reset',
    ],
  );
  assert.deepEqual(abilityLockResolve({ locked: true, ability: 'heal' }), {
    ability: 'heal',
    allowed: false,
    requestedAmount: 20,
    appliedAmount: 0,
    reason: 'healing-locked',
  });
  assert.equal(abilityLockResolve({ locked: true, ability: 'attack' }).allowed, true);
  assert.equal(abilityLockResolve({ locked: true, ability: 'move' }).allowed, true);
  assert.equal(abilityLockResolve({ locked: false, ability: 'heal' }).appliedAmount, 20);

  const avoided = blueprintFrame(id, 1.2);
  assert.equal(avoided.abilityLockFirstAvoided, true);
  assert.equal(avoided.abilityLockHealLocked, false);
  const hit = blueprintFrame(id, 2.66);
  assert.equal(hit.dangerActive, true);
  assert.equal(hit.playerSafe, false);
  assert.equal(blueprintPointSafe(id, 2.66, { x: 450, y: 750 }), true);
  assert.ok(
    hit.primitives.some(
      (primitive) =>
        primitive.type === 'circle' &&
        primitive.radius === 96 &&
        primitive.width === 0 &&
        primitive.opacity > 0,
    ),
  );
  const rejected = blueprintFrame(id, 3.2);
  assert.equal(rejected.abilityLockHealLocked, true);
  assert.equal(rejected.abilityLockCurrentHealth, 55);
  assert.equal(rejected.abilityLockHealRequested, 20);
  assert.equal(rejected.abilityLockHealApplied, 0);
  assert.equal(rejected.abilityLockRejectedInputs, 1);
  assert.equal(rejected.abilityLockStatusId, 'healing-lock-1');
  const attack = blueprintFrame(id, 3.7);
  assert.equal(attack.abilityLockAttackAvailable, true);
  assert.ok(attack.playerMotion.attack > 0);
  const restored = blueprintFrame(id, 4.86);
  assert.equal(restored.abilityLockHealLocked, false);
  assert.equal(restored.abilityLockCurrentHealth, 75);
  assert.equal(restored.abilityLockHealSuccessCount, 2);
  assert.equal(restored.abilityLockStatusId, 'none');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-ability-lock'),
    /data-blueprint-preview="ability-lock"/,
  );
});

test('resource steal conserves ownership through drop, reclaim, and boss capture', () => {
  const id = 'resource-steal';
  assert.deepEqual([0, 0.5, 1, 1.4, 2.1, 2.7, 3.2, 3.6, 4.1, 4.7, 5.5].map(resourceStealState), [
    'ready',
    'first-telegraph',
    'first-avoided',
    'repositioning',
    'second-telegraph',
    'resource-spilling',
    'player-reclaiming',
    'boss-capturing',
    'benefit-applied',
    'settled',
    'reset',
  ]);
  assert.deepEqual(resourceStealResolve(), {
    currentBefore: 6,
    dropped: 3,
    reclaimed: 1,
    captured: 2,
    world: 0,
    player: 4,
    conserved: true,
    dropEventCount: 1,
    benefitEventCount: 1,
  });
  assert.deepEqual(resourceStealResolve({ current: 2, drop: 9, reclaim: 9, bossCapture: 9 }), {
    currentBefore: 2,
    dropped: 2,
    reclaimed: 2,
    captured: 0,
    world: 0,
    player: 2,
    conserved: true,
    dropEventCount: 1,
    benefitEventCount: 0,
  });

  const avoided = blueprintFrame(id, 1.1);
  assert.equal(avoided.resourceStealFirstAvoided, true);
  assert.equal(avoided.resourceStealPlayerResource, 6);
  const hit = blueprintFrame(id, 2.64);
  assert.equal(hit.dangerActive, true);
  assert.equal(hit.playerSafe, false);
  assert.equal(blueprintPointSafe(id, 2.64, { x: 450, y: 750 }), true);
  assert.equal(hit.resourceStealDropped, 3);
  assert.equal(hit.resourceStealDropEventCount, 1);
  const reclaimed = blueprintFrame(id, 3.48);
  assert.equal(reclaimed.resourceStealPlayerResource, 4);
  assert.equal(reclaimed.resourceStealReclaimed, 1);
  assert.equal(reclaimed.resourceStealWorldResource, 2);
  const captured = blueprintFrame(id, 3.9);
  assert.equal(captured.resourceStealCaptured, 2);
  assert.equal(captured.resourceStealWorldResource, 0);
  assert.equal(captured.resourceStealBenefitEventCount, 1);
  assert.equal(captured.resourceStealConserved, true);
  assert.deepEqual(captured.resourceStealTokenOwners, ['player', 'boss', 'boss']);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-resource-steal'),
    /data-blueprint-preview="resource-steal"/,
  );
});

test('on-hit healing resolves from qualified contact even when damage is blocked', () => {
  const id = 'on-hit-healing';
  assert.deepEqual(
    [0, 0.5, 1, 1.4, 2.1, 2.7, 3.2, 3.6, 4.08, 4.4, 4.8, 5.5].map(onHitHealingState),
    [
      'ready',
      'first-telegraph',
      'first-missed',
      'repositioning',
      'second-telegraph',
      'blocked-contact-healing',
      'healed',
      'third-telegraph',
      'third-missed',
      'counter-approach',
      'recovery',
      'reset',
    ],
  );
  assert.deepEqual(onHitHealingResolve({ qualifyingContact: true, damageApplied: 0 }), {
    healthBefore: 48,
    healthAfter: 64,
    requested: 16,
    applied: 16,
    damageApplied: 0,
    contactQualified: true,
    eventCount: 1,
    resultId: 'on-hit-heal-1',
  });
  assert.equal(onHitHealingResolve({ qualifyingContact: false }).eventCount, 0);
  assert.equal(
    onHitHealingResolve({ currentHealth: 95, qualifyingContact: true, healAmount: 16 }).applied,
    5,
  );
  assert.equal(
    onHitHealingResolve({ qualifyingContact: true, alreadyResolved: true }).eventCount,
    0,
  );

  const missed = blueprintFrame(id, 1.1);
  assert.equal(missed.onHitHealingFirstMissed, true);
  assert.equal(missed.onHitHealingBossHealth, 48);
  const blocked = blueprintFrame(id, 2.8);
  assert.equal(blocked.onHitHealingBlockedContact, true);
  assert.equal(blocked.onHitHealingDamageApplied, 0);
  assert.equal(blocked.onHitHealingEventCount, 1);
  assert.ok(blocked.onHitHealingBossHealth > 48);
  const healed = blueprintFrame(id, 3.1);
  assert.equal(healed.onHitHealingBossHealth, 64);
  assert.equal(healed.onHitHealingResultId, 'on-hit-heal-1');
  const thirdMiss = blueprintFrame(id, 4.08);
  assert.equal(thirdMiss.onHitHealingThirdMissed, true);
  assert.equal(thirdMiss.onHitHealingEventCount, 1);
  assert.equal(blueprintPointSafe(id, 4.04, { x: 455, y: 720 }), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-on-hit-healing'),
    /data-blueprint-preview="on-hit-healing"/,
  );
});

test('self-heal cast distinguishes an interruption from one completed heal', () => {
  const id = 'self-heal-cast';
  assert.deepEqual([0, 0.5, 0.9, 1.5, 2.1, 2.7, 3.4, 4.25, 4.8, 5.2, 5.5].map(selfHealCastState), [
    'ready',
    'first-telegraph',
    'first-channel',
    'interrupted',
    'repositioning',
    'second-telegraph',
    'second-channel',
    'healing',
    'healed',
    'recovery',
    'reset',
  ]);
  assert.deepEqual(selfHealCastResolve({ castCompleted: true }), {
    healthBefore: 38,
    healthAfter: 62,
    requested: 24,
    applied: 24,
    castCompleted: true,
    interrupted: false,
    eventCount: 1,
    resultId: 'self-heal-cast-1',
  });
  assert.equal(selfHealCastResolve({ castCompleted: true, interrupted: true }).eventCount, 0);
  assert.equal(selfHealCastResolve({ castCompleted: false }).applied, 0);
  assert.equal(
    selfHealCastResolve({ currentHealth: 94, castCompleted: true, healAmount: 24 }).applied,
    6,
  );
  assert.equal(selfHealCastResolve({ castCompleted: true, alreadyResolved: true }).eventCount, 0);

  const interrupted = blueprintFrame(id, 1.55);
  assert.equal(interrupted.selfHealCastFirstInterrupted, true);
  assert.equal(interrupted.selfHealCastBossHealth, 38);
  assert.equal(interrupted.selfHealCastEventCount, 0);
  assert.equal(interrupted.selfHealCastInterruptCount, 1);
  const channeling = blueprintFrame(id, 3.5);
  assert.equal(channeling.selfHealCastChannelActive, true);
  assert.ok(channeling.selfHealCastChannelProgress > 0);
  const healing = blueprintFrame(id, 4.35);
  assert.equal(healing.selfHealCastCompleted, true);
  assert.equal(healing.selfHealCastEventCount, 1);
  assert.ok(healing.selfHealCastBossHealth > 38);
  const healed = blueprintFrame(id, 4.7);
  assert.equal(healed.selfHealCastBossHealth, 62);
  assert.equal(healed.selfHealCastResultId, 'self-heal-cast-1');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-self-heal-cast'),
    /data-blueprint-preview="self-heal-cast"/,
  );
});

test('external healing sources separate interception from one delivered heal', () => {
  const id = 'external-healing-source';
  assert.deepEqual(
    [0, 0.5, 0.9, 1.55, 2.1, 2.6, 3.5, 4.2, 4.7, 5.2, 5.5].map(externalHealingSourceState),
    [
      'ready',
      'sources-signaled',
      'first-packet-travelling',
      'first-source-destroyed',
      'repositioning',
      'second-source-signaled',
      'second-packet-travelling',
      'packet-delivered',
      'boss-healed',
      'recovery',
      'reset',
    ],
  );
  assert.deepEqual(externalHealingSourceResolve({ sourceActive: true, packetArrived: true }), {
    healthBefore: 42,
    healthAfter: 60,
    requested: 18,
    applied: 18,
    sourceActive: true,
    packetArrived: true,
    sourceId: 'healing-source-2',
    eventCount: 1,
    resultId: 'external-heal-healing-source-2',
  });
  assert.equal(
    externalHealingSourceResolve({ sourceActive: false, packetArrived: true }).applied,
    0,
  );
  assert.equal(
    externalHealingSourceResolve({ sourceActive: true, packetArrived: false }).eventCount,
    0,
  );
  assert.equal(
    externalHealingSourceResolve({
      currentHealth: 94,
      healAmount: 18,
      sourceActive: true,
      packetArrived: true,
    }).applied,
    6,
  );
  assert.equal(
    externalHealingSourceResolve({
      sourceActive: true,
      packetArrived: true,
      alreadyResolved: true,
    }).eventCount,
    0,
  );

  const intercepted = blueprintFrame(id, 1.55);
  assert.equal(intercepted.externalHealingSourceFirstDestroyed, true);
  assert.equal(intercepted.externalHealingSourceFirstPacketCancelled, true);
  assert.equal(intercepted.externalHealingSourceBossHealth, 42);
  assert.equal(intercepted.externalHealingSourceEventCount, 0);
  assert.equal(intercepted.externalHealingSourceActiveCount, 1);
  const travelling = blueprintFrame(id, 3.5);
  assert.equal(travelling.externalHealingSourceSecondPacketActive, true);
  assert.equal(travelling.externalHealingSourceDelivered, false);
  const healing = blueprintFrame(id, 4.25);
  assert.equal(healing.externalHealingSourceDelivered, true);
  assert.equal(healing.externalHealingSourceHealing, true);
  assert.equal(healing.externalHealingSourceEventCount, 1);
  assert.ok(healing.externalHealingSourceBossHealth > 42);
  const healed = blueprintFrame(id, 4.7);
  assert.equal(healed.externalHealingSourceBossHealth, 60);
  assert.equal(healed.externalHealingSourceSourceId, 'healing-source-2');
  assert.equal(healed.externalHealingSourceResultId, 'external-heal-healing-source-2');
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-external-healing-source'),
    /data-blueprint-preview="external-healing-source"/,
  );
});

test('damage-rate cap attenuates a burst and restores full damage after decay', () => {
  const id = 'damage-rate-cap';
  assert.deepEqual([0, 0.5, 0.95, 1.75, 1.9, 2.2, 3.6, 4.6, 5, 5.38, 5.5].map(damageRateCapState), [
    'ready',
    'isolated-signal',
    'isolated-hit',
    'window-cleared',
    'burst-signal',
    'burst-attenuating',
    'window-decaying',
    'recovered-signal',
    'recovered-hit',
    'recovery',
    'reset',
  ]);
  assert.deepEqual(damageRateCapResolve({ hitId: 'isolated-1' }), {
    rawDamage: 18,
    recentDamage: 0,
    threshold: 18,
    multiplier: 1,
    appliedDamage: 18,
    preventedDamage: 0,
    eventCount: 1,
    hitId: 'isolated-1',
  });
  assert.equal(damageRateCapResolve({ recentDamage: 18 }).appliedDamage, 9);
  assert.equal(damageRateCapResolve({ recentDamage: 36 }).appliedDamage, 6);
  assert.equal(damageRateCapResolve({ recentDamage: 54 }).appliedDamage, 5);
  assert.equal(damageRateCapResolve({ recentDamage: 54 }).multiplier, 0.25);
  assert.equal(damageRateCapResolve({ alreadyResolved: true }).eventCount, 0);

  const isolated = blueprintFrame(id, 0.95);
  assert.equal(isolated.damageRateCapHitCount, 1);
  assert.equal(isolated.damageRateCapBossHealth, 82);
  assert.equal(isolated.damageRateCapAppliedDamage, 18);
  const burst = blueprintFrame(id, 3.2);
  assert.equal(burst.damageRateCapBurstActive, true);
  assert.equal(burst.damageRateCapHitCount, 5);
  assert.equal(burst.damageRateCapBossHealth, 44);
  assert.equal(burst.damageRateCapAppliedDamage, 5);
  assert.equal(burst.damageRateCapPreventedDamage, 13);
  assert.equal(burst.damageRateCapMultiplier, 0.25);
  const recovered = blueprintFrame(id, 4.6);
  assert.equal(recovered.damageRateCapWindowRecovered, true);
  assert.equal(recovered.damageRateCapRecentDamage, 0);
  assert.equal(recovered.damageRateCapMultiplier, 1);
  const finalHit = blueprintFrame(id, 5);
  assert.equal(finalHit.damageRateCapHitCount, 6);
  assert.equal(finalHit.damageRateCapBossHealth, 26);
  assert.equal(finalHit.damageRateCapAppliedDamage, 18);
  assert.equal(finalHit.damageRateCapLastHitId, 'recovered-1');
  assert.equal(blueprintPointSafe(id, 3.13, { x: 300, y: 660 }), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-damage-rate-cap'),
    /data-blueprint-preview="damage-rate-cap"/,
  );
});

test('loadout mirror captures once and keeps the copied package after the player swaps', () => {
  const id = 'loadout-mirror';
  assert.deepEqual([0, 0.5, 1.2, 2.3, 2.8, 3.6, 4.4, 5.32, 5.5].map(loadoutMirrorState), [
    'ready',
    'scanning',
    'snapshot-captured',
    'copy-locked',
    'player-loadout-changed',
    'copied-package-active',
    'snapshot-stable',
    'recovery',
    'reset',
  ]);
  assert.deepEqual(loadoutMirrorSnapshot(), {
    snapshotId: 'loadout-snapshot-1',
    equippedIds: ['sword', 'ward', 'ember'],
    copiedIds: ['sword', 'ward', 'ember'],
    captured: true,
    eventCount: 1,
  });
  assert.deepEqual(
    loadoutMirrorSnapshot({
      equippedIds: ['bow', 'dash', 'frost'],
      existingCopiedIds: ['sword', 'ward', 'ember'],
      alreadyCaptured: true,
    }),
    {
      snapshotId: 'loadout-snapshot-1',
      equippedIds: ['bow', 'dash', 'frost'],
      copiedIds: ['sword', 'ward', 'ember'],
      captured: false,
      eventCount: 0,
    },
  );

  const captured = blueprintFrame(id, 1.3);
  assert.equal(captured.loadoutMirrorSnapshotCaptured, true);
  assert.equal(captured.loadoutMirrorSnapshotEventCount, 1);
  assert.deepEqual(captured.loadoutMirrorCopiedLoadoutIds, ['sword', 'ward', 'ember']);
  const swapped = blueprintFrame(id, 2.8);
  assert.equal(swapped.loadoutMirrorPlayerChanged, true);
  assert.deepEqual(swapped.loadoutMirrorPlayerLoadoutIds, ['bow', 'dash', 'frost']);
  assert.deepEqual(swapped.loadoutMirrorCopiedLoadoutIds, ['sword', 'ward', 'ember']);
  assert.equal(swapped.loadoutMirrorLiveResnapshotCount, 0);
  const used = blueprintFrame(id, 3.6);
  assert.equal(used.loadoutMirrorBossUsedCopiedAttack, true);
  assert.equal(used.loadoutMirrorBossPackage, 'sword+ward+ember');
  assert.equal(used.loadoutMirrorCopyMatchesSnapshot, true);
  assert.equal(blueprintPointSafe(id, 3.6, used.player), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-loadout-mirror'),
    /data-blueprint-preview="loadout-mirror"/,
  );
});

test('moveset shapeshifting hands off three complete packages in order', () => {
  const id = 'moveset-shapeshifting';
  assert.deepEqual(
    [0, 0.3, 0.8, 1.5, 1.8, 2.2, 2.6, 3.3, 3.6, 3.9, 4.4, 5.1, 5.35, 5.5].map(
      movesetShapeshiftingState,
    ),
    [
      'colossus-ready',
      'colossus-signal',
      'colossus-active',
      'colossus-recovery',
      'change-to-serpent',
      'serpent-signal',
      'serpent-active',
      'serpent-recovery',
      'change-to-oracle',
      'oracle-signal',
      'oracle-active',
      'oracle-recovery',
      'sequence-complete',
      'reset',
    ],
  );
  assert.deepEqual(movesetShapeshiftingResolve(), {
    currentForm: 'colossus',
    requestedForm: 'serpent',
    nextForm: 'serpent',
    accepted: true,
    rejected: false,
    changeId: 'moveset-change-1',
    eventCount: 1,
    allowedForms: ['colossus', 'serpent', 'oracle'],
  });
  assert.equal(movesetShapeshiftingResolve({ requestedForm: 'unknown' }).rejected, true);
  assert.equal(movesetShapeshiftingResolve({ alreadyApplied: true }).eventCount, 0);

  const colossus = blueprintFrame(id, 0.8);
  assert.equal(colossus.movesetShapeshiftingForm, 'colossus');
  assert.equal(colossus.movesetShapeshiftingPackageId, 'colossus-slam');
  assert.equal(colossus.movesetShapeshiftingPackageAttackActive, true);
  const serpent = blueprintFrame(id, 2.6);
  assert.equal(serpent.movesetShapeshiftingForm, 'serpent');
  assert.equal(serpent.movesetShapeshiftingPackageId, 'serpent-lane');
  assert.equal(serpent.movesetShapeshiftingChangeCount, 1);
  const oracle = blueprintFrame(id, 4.4);
  assert.equal(oracle.movesetShapeshiftingForm, 'oracle');
  assert.equal(oracle.movesetShapeshiftingPackageId, 'oracle-fan');
  assert.equal(oracle.movesetShapeshiftingChangeCount, 2);
  assert.equal(oracle.movesetShapeshiftingEventCount, 2);
  assert.equal(oracle.movesetShapeshiftingPackageScope, 3);
  assert.equal(blueprintPointSafe(id, 4.4, oracle.player), true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-moveset-shapeshifting'),
    /data-blueprint-preview="moveset-shapeshifting"/,
  );
});

test('ally theft transfers one familiar, bounds its commands, and restores ownership', () => {
  const id = 'ally-theft';
  assert.deepEqual([0, 0.8, 1.3, 2.1, 3.8, 4.3, 4.9, 5.35, 5.5].map(allyTheftState), [
    'ally-friendly',
    'ally-marked',
    'ownership-transferring',
    'hostile-command',
    'control-breaking',
    'ally-returning',
    'ally-restored',
    'recapture-grace',
    'reset',
  ]);
  assert.deepEqual(allyTheftTransfer(), {
    selectedAllyId: 'rune-familiar-1',
    currentOwner: 'player',
    requestedOwner: 'boss',
    nextOwner: 'boss',
    captureId: 'ally-capture-1',
    accepted: true,
    rejected: false,
    eventCount: 1,
    eligibleAllyIds: ['rune-familiar-1'],
  });
  assert.equal(allyTheftTransfer({ selectedAllyId: 'quest-companion' }).rejected, true);
  assert.equal(allyTheftTransfer({ allyAlive: false }).accepted, false);
  assert.equal(allyTheftTransfer({ alreadyApplied: true }).eventCount, 0);

  const marked = blueprintFrame(id, 0.8);
  assert.equal(marked.allyTheftOwnerId, 'player');
  assert.equal(marked.allyTheftMarked, true);
  assert.equal(marked.allyTheftOwnershipEventCount, 0);
  const captured = blueprintFrame(id, 1.4);
  assert.equal(captured.allyTheftOwnerId, 'boss');
  assert.equal(captured.allyTheftCaptureId, 'ally-capture-1');
  assert.equal(captured.allyTheftOwnershipEventCount, 1);
  const hostile = blueprintFrame(id, 2.4);
  assert.equal(hostile.allyTheftHostile, true);
  assert.equal(hostile.allyTheftCommandCount, 2);
  assert.equal(hostile.allyTheftProjectiles.length, 1);
  assert.equal(blueprintPointSafe(id, 2.4, hostile.player), true);
  assert.equal(blueprintPointSafe(id, 2.4, hostile.allyTheftProjectiles[0]), false);
  const released = blueprintFrame(id, 3.8);
  assert.equal(released.allyTheftOwnerId, 'neutral');
  assert.equal(released.allyTheftReleaseReason, 'duration-complete');
  const restored = blueprintFrame(id, 4.9);
  assert.equal(restored.allyTheftOwnerId, 'player');
  assert.equal(restored.allyTheftOwnershipEventCount, 2);
  assert.equal(restored.allyTheftRecaptureBlocked, true);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-ally-theft'),
    /data-blueprint-preview="ally-theft"/,
  );
});

test('false death keeps completion pending, revives once, and preserves final authority', () => {
  const id = 'false-death';
  assert.deepEqual([0, 0.9, 1.6, 2.5, 3.5, 4.2, 4.8, 5.5].map(falseDeathState), [
    'phase-one-active',
    'phase-one-depleted',
    'completion-pending',
    'revival-building',
    'phase-two-signaled',
    'phase-two-active',
    'phase-two-stable',
    'reset',
  ]);
  assert.deepEqual(falseDeathResolve(), {
    depletionId: 'phase-1-depletion-1',
    currentPhase: 1,
    nextPhase: 2,
    phaseHealthDepleted: true,
    revived: true,
    revivalCount: 1,
    encounterComplete: false,
    rewardUnlocked: false,
    exitUnlocked: false,
    eventCount: 1,
  });
  assert.equal(falseDeathResolve({ alreadyApplied: true }).eventCount, 0);
  assert.deepEqual(falseDeathResolve({ currentPhase: 2, finalPhase: true }), {
    depletionId: 'phase-1-depletion-1',
    currentPhase: 2,
    nextPhase: 2,
    phaseHealthDepleted: true,
    revived: false,
    revivalCount: 0,
    encounterComplete: true,
    rewardUnlocked: true,
    exitUnlocked: true,
    eventCount: 1,
  });

  const depleted = blueprintFrame(id, 0.9);
  assert.equal(depleted.falseDeathBossHealth, 0);
  assert.equal(depleted.falseDeathCompletionPending, true);
  assert.equal(depleted.falseDeathRewardLocked, true);
  assert.equal(depleted.falseDeathEncounterComplete, false);
  const rebuilding = blueprintFrame(id, 2.5);
  assert.equal(rebuilding.falseDeathRebuildActive, true);
  assert.equal(rebuilding.falseDeathRevivalCount, 0);
  const revived = blueprintFrame(id, 3.5);
  assert.equal(revived.falseDeathCurrentPhase, 2);
  assert.equal(revived.falseDeathBossHealth, 68);
  assert.equal(revived.falseDeathRevivalId, 'false-death-revival-1');
  assert.equal(revived.falseDeathEventCount, 2);
  assert.equal(revived.falseDeathExitLocked, true);
  const active = blueprintFrame(id, 4.2);
  assert.equal(active.falseDeathSecondAttackActive, true);
  assert.equal(blueprintPointSafe(id, 4.2, active.player), true);
  assert.equal(blueprintPointSafe(id, 4.2, active.boss), false);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-false-death'),
    /data-blueprint-preview="false-death"/,
  );
});

test('action-reactive punish observes committed state once and preserves a boss-created opening', () => {
  const id = 'action-reactive-punish';
  assert.deepEqual(
    [0.2, 0.55, 0.9, 1.5, 2.1, 2.8, 3.3, 3.6, 4.2, 4.8, 5.25, 5.5].map(actionReactivePunishState),
    [
      'neutral',
      'action-started',
      'response-signaled',
      'response-resolving',
      'response-recovery',
      'boss-committed',
      'ordinary-attack',
      'boss-recovery',
      'protected-opening',
      'opening-resolved',
      'cooldown',
      'reset',
    ],
  );
  assert.deepEqual(actionReactivePunishResolve(), {
    actionId: 'heal-1',
    actionType: 'heal',
    observed: true,
    accepted: true,
    responseId: 'action-response-1',
    responseType: 'rune-dart',
    rejectionReason: 'none',
    eventCount: 1,
    eligibleActionTypes: ['heal', 'item', 'cast'],
  });
  assert.equal(actionReactivePunishResolve({ alreadyApplied: true }).eventCount, 0);
  assert.equal(
    actionReactivePunishResolve({ alreadyApplied: true }).rejectionReason,
    'duplicate-event',
  );
  assert.equal(actionReactivePunishResolve({ bossAvailable: false }).rejectionReason, 'boss-busy');

  const observed = blueprintFrame(id, 0.9);
  assert.equal(observed.actionReactivePunishObserved, true);
  assert.equal(observed.actionReactivePunishResponseQueued, true);
  assert.equal(observed.actionReactivePunishEventCount, 1);
  const projectile = blueprintFrame(id, 1.55);
  assert.equal(projectile.actionReactivePunishProjectileActive, true);
  assert.equal(projectile.actionReactivePunishCommitted, true);
  assert.equal(blueprintPointSafe(id, 1.55, projectile.player), true);
  assert.equal(blueprintPointSafe(id, 1.55, projectile.actionReactivePunishProjectile), false);
  const opening = blueprintFrame(id, 4.2);
  assert.equal(opening.actionReactivePunishSafeWindow, true);
  assert.equal(opening.actionReactivePunishSafeActionActive, true);
  assert.equal(opening.actionReactivePunishBossAvailable, false);
  assert.equal(opening.actionReactivePunishRejectionReason, 'boss-busy');
  assert.equal(opening.actionReactivePunishResponseCount, 1);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-action-reactive-punish'),
    /data-blueprint-preview="action-reactive-punish"/,
  );
});

test('run-history manifestation freezes one entry journal through the encounter retry', () => {
  const id = 'run-history-manifestation';
  assert.deepEqual([0.5, 1.5, 2, 2.55, 3, 3.45, 4.1, 4.9, 5.5].map(runHistoryManifestationState), [
    'history-visible',
    'manifest-captured',
    'echo-signaled',
    'echo-active',
    'relic-signaled',
    'relic-active',
    'history-opening',
    'retry-stable',
    'reset',
  ]);
  assert.deepEqual(runHistoryManifestationResolve(), {
    encounterId: 'kern-memory-vault-1',
    entryId: 'vault-entry-1',
    historyVersion: 1,
    history: {
      defeatedSentinel: true,
      rescuedGuide: true,
      claimedRelic: true,
    },
    manifestId: 'run-manifest-echo-ward-relic-1',
    hostileEchoIds: ['sentinel-echo-1'],
    supportIds: ['guide-ward-1'],
    bossModifierIds: ['relic-ring-1'],
    accepted: true,
    eventCount: 1,
  });
  assert.equal(runHistoryManifestationResolve({ alreadyCaptured: true }).eventCount, 0);
  assert.deepEqual(
    runHistoryManifestationResolve({
      history: { defeatedSentinel: false, rescuedGuide: false, claimedRelic: false },
    }),
    {
      encounterId: 'kern-memory-vault-1',
      entryId: 'vault-entry-1',
      historyVersion: 1,
      history: {
        defeatedSentinel: false,
        rescuedGuide: false,
        claimedRelic: false,
      },
      manifestId: 'run-manifest-no-echo-no-ward-no-relic-1',
      hostileEchoIds: [],
      supportIds: [],
      bossModifierIds: [],
      accepted: true,
      eventCount: 1,
    },
  );

  const captured = blueprintFrame(id, 1.55);
  assert.equal(captured.runHistoryManifestationCaptured, true);
  assert.equal(captured.runHistoryManifestationManifestId, 'run-manifest-echo-ward-relic-1');
  assert.equal(captured.runHistoryManifestationHistoryCount, 3);
  assert.equal(captured.runHistoryManifestationEchoCount, 1);
  assert.equal(captured.runHistoryManifestationSupportCount, 1);
  assert.equal(captured.runHistoryManifestationModifierCount, 1);
  assert.equal(captured.runHistoryManifestationCaptureEvents, 1);
  assert.equal(captured.runHistoryManifestationLiveResnapshots, 0);
  const echo = blueprintFrame(id, 2.55);
  assert.equal(echo.runHistoryManifestationEchoActive, true);
  assert.equal(blueprintPointSafe(id, 2.55, echo.player), true);
  assert.equal(blueprintPointSafe(id, 2.55, echo.runHistoryManifestationProjectile), false);
  const relic = blueprintFrame(id, 3.45);
  assert.equal(relic.runHistoryManifestationRelicActive, true);
  assert.equal(relic.runHistoryManifestationWardProtecting, true);
  assert.equal(blueprintPointSafe(id, 3.45, relic.player), true);
  const retry = blueprintFrame(id, 4.95);
  assert.equal(retry.runHistoryManifestationRetryStable, true);
  assert.equal(retry.runHistoryManifestationManifestUnchanged, true);
  assert.equal(retry.runHistoryManifestationManifestId, captured.runHistoryManifestationManifestId);
  assert.equal(retry.runHistoryManifestationLiveResnapshots, 0);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-run-history-manifestation'),
    /data-blueprint-preview="run-history-manifestation"/,
  );
});

test('real-time progression applies one bounded reconciliation before combat resumes', () => {
  const id = 'real-time-progression';
  assert.deepEqual(
    [0.4, 0.85, 1.4, 2.1, 2.6, 3.1, 3.5, 4.1, 4.9, 5.5].map(realTimeProgressionState),
    [
      'encounter-active',
      'checkpoint-saved',
      'game-closed',
      'time-reconciling',
      'return-summary',
      'progression-signaled',
      'progression-active',
      'progression-opening',
      'retry-stable',
      'reset',
    ],
  );
  assert.deepEqual(realTimeProgressionResolve(), {
    checkpointId: 'kern-clock-vault-1',
    reconciliationId: 'offline-reconcile-1',
    authority: 'trusted-server',
    stateVersion: 1,
    savedAtMs: 43_200_000,
    nowMs: 68_400_000,
    elapsedMs: 25_200_000,
    maxOfflineMs: 21_600_000,
    appliedElapsedMs: 21_600_000,
    progressionUnits: 6,
    bossTier: 2,
    capped: true,
    clockRollback: false,
    accepted: true,
    rejectionReason: 'none',
    eventCount: 1,
  });
  const duplicate = realTimeProgressionResolve({ alreadyApplied: true });
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.appliedElapsedMs, 0);
  assert.equal(duplicate.rejectionReason, 'duplicate-reconciliation');
  assert.equal(duplicate.eventCount, 0);
  const rollback = realTimeProgressionResolve({ savedAtMs: 20_000, nowMs: 10_000 });
  assert.equal(rollback.clockRollback, true);
  assert.equal(rollback.accepted, false);
  assert.equal(rollback.elapsedMs, 0);
  assert.equal(rollback.rejectionReason, 'clock-rollback');

  const closed = blueprintFrame(id, 1.4);
  assert.equal(closed.realTimeProgressionClosed, true);
  assert.equal(closed.realTimeProgressionReconciled, false);
  const reconciled = blueprintFrame(id, 2.1);
  assert.equal(reconciled.realTimeProgressionCheckpointId, 'kern-clock-vault-1');
  assert.equal(reconciled.realTimeProgressionReconciliationId, 'offline-reconcile-1');
  assert.equal(reconciled.realTimeProgressionAuthority, 'trusted-server');
  assert.equal(reconciled.realTimeProgressionElapsedHours, 7);
  assert.equal(reconciled.realTimeProgressionAppliedHours, 6);
  assert.equal(reconciled.realTimeProgressionCapped, true);
  assert.equal(reconciled.realTimeProgressionEventCount, 1);
  assert.equal(reconciled.realTimeProgressionLiveTicks, 0);
  assert.equal(reconciled.realTimeProgressionBossTier, 2);
  assert.equal(reconciled.realTimeProgressionOfflineHazardCount, 2);
  const active = blueprintFrame(id, 3.5);
  assert.equal(active.realTimeProgressionAttackActive, true);
  assert.equal(blueprintPointSafe(id, 3.5, active.player), true);
  assert.equal(blueprintPointSafe(id, 3.5, { x: active.boss.x + 225, y: active.boss.y }), false);
  const retry = blueprintFrame(id, 4.95);
  assert.equal(retry.realTimeProgressionRetryStable, true);
  assert.equal(retry.realTimeProgressionProgressionUnchanged, true);
  assert.equal(retry.realTimeProgressionEventCount, 1);
  assert.equal(retry.realTimeProgressionLiveTicks, 0);
  assert.deepEqual(blueprintFrame(id, 0).player, blueprintFrame(id, 6).player);
  assert.match(
    renderBlueprintThumbnail(id, 'test-real-time-progression'),
    /data-blueprint-preview="real-time-progression"/,
  );
});
