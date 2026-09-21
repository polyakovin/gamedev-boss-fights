import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLUEPRINT_DURATION,
  BLUEPRINT_MECHANIC_IDS,
  blueprintFrame,
  blueprintPhaseAt,
  blueprintPointSafe,
} from '../src/blueprint-model.mjs';
import {
  blueprintPreviewLayout,
  renderBlueprint,
  renderBlueprintThumbnail,
} from '../lib/blueprint-view.mjs';

test('all 30 promoted lesson animations have distinct rule modes and complete moving frames', () => {
  assert.equal(BLUEPRINT_MECHANIC_IDS.length, 30);
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
  assert.equal(modes.size, 30);
});

test('every blueprint exposes signal, committed action, and recovery without player teleports', () => {
  assert.equal(blueprintPhaseAt(0), 0);
  assert.equal(blueprintPhaseAt(1.6), 1);
  assert.equal(blueprintPhaseAt(4.3), 2);

  for (const id of BLUEPRINT_MECHANIC_IDS) {
    assert.equal(blueprintFrame(id, 1.59).committed, false, id);
    assert.equal(blueprintFrame(id, 1.6).committed, true, id);
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

test('every promoted animation derives safety from its own active geometry', () => {
  const unsafePoints = {
    'landing-jump': { x: 365, y: 600 },
    'single-shot': null,
    crossfire: null,
    'splitting-projectile': null,
    'returning-projectile': null,
    'orbiting-projectiles': null,
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

  for (const id of BLUEPRINT_MECHANIC_IDS) {
    const frame = blueprintFrame(id, 3);
    let point = unsafePoints[id];
    if (!point && id === 'homing-projectile') {
      const projectile = frame.primitives[2];
      point = { x: projectile.x, y: projectile.y };
    } else if (!point && id === 'single-shot') {
      const projectile = frame.primitives[2];
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
