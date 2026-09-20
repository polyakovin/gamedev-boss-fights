import { sweepWeaponPose, SWEEP_OUTER_RADIUS, SWEEP_PLAYER_RADIUS } from './sweep-weapon-model.mjs';

export const PATTERN_DURATION = 6;
export const PATTERN_PHASE_ENDS = Object.freeze([1.6, 4.25, PATTERN_DURATION]);
export const BOSS_LABEL_OFFSET_Y = -104;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const pulse = (value) => (value <= 0 || value >= 1 ? 0 : Math.sin(value * Math.PI));
const speed = (value) => {
  const t = clamp(value);
  return 6 * t * (1 - t);
};
const angleTo = (from, to) => (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
const turn = (from, to, amount) => from + (((((to - from) % 360) + 540) % 360) - 180) * amount;
/** Gait is a distance-driven angle in radians; the other pose weights are normalized. */
const motion = (pose = {}) => ({
  gait: 0,
  stride: 0,
  lean: 0,
  crouch: 0,
  lift: 0,
  attack: 0,
  impact: 0,
  dodge: 0,
  ...pose,
});

export function patternPhaseAt(time) {
  const t =
    (((Number.isFinite(time) ? time : 0) % PATTERN_DURATION) + PATTERN_DURATION) % PATTERN_DURATION;
  return t < PATTERN_PHASE_ENDS[0] ? 0 : t < PATTERN_PHASE_ENDS[1] ? 1 : 2;
}

/** A deterministic frame shared by browser animation and tests. */
export function patternFrame(kind, time) {
  const t =
    (((Number.isFinite(time) ? time : 0) % PATTERN_DURATION) + PATTERN_DURATION) % PATTERN_DURATION;
  const phase = patternPhaseAt(t);
  const prepare = smooth(t / PATTERN_PHASE_ENDS[0]);
  const action = clamp(
    (t - PATTERN_PHASE_ENDS[0]) / (PATTERN_PHASE_ENDS[1] - PATTERN_PHASE_ENDS[0]),
  );
  const recover = smooth((t - PATTERN_PHASE_ENDS[1]) / (PATTERN_DURATION - PATTERN_PHASE_ENDS[1]));
  const visibility = phase === 2 ? 1 - recover : phase === 0 ? prepare : 1;
  const boss = { x: 280, y: kind === 'gap-volley' ? 175 : kind === 'summon' ? 235 : 275 };
  const playerStart = kind === 'sweep' ? { x: 412, y: 525 } : { x: 390, y: 700 };
  const playerTarget =
    kind === 'sweep'
      ? { x: 440, y: 650 }
      : kind === 'ground-slam'
        ? { x: 280, y: 785 }
        : kind === 'summon'
          ? { x: 170, y: 720 }
          : { x: 280, y: 760 };
  // A brief reaction, a committed run, then planted feet while the threat passes.
  const responseTime = (t - 0.4) / 0.75;
  const returnTime = (t - 4.55) / 1.3;
  const response = smooth(responseTime);
  const returnProgress = smooth(returnTime);
  const move = response * (1 - returnProgress);
  const player = {
    x: mix(playerStart.x, playerTarget.x, move),
    y: mix(playerStart.y, playerTarget.y, move),
  };
  const windup = smooth((t - 0.2) / 1.1);
  const actionTime = t - PATTERN_PHASE_ENDS[0];
  const release = smooth(actionTime / 0.16);
  const followThrough = 1 - smooth((actionTime - 0.16) / 0.65);
  const chargePose = windup * (1 - recover);
  let bossMotion;
  if (kind === 'ground-slam') {
    bossMotion = motion({
      lean: 0.35 * pulse(actionTime / 0.65),
      crouch: 0.1 * windup * (1 - release) + 0.78 * pulse(actionTime / 0.42),
      lift: 0.92 * windup * (1 - release),
      attack: windup * (1 - smooth((actionTime - 0.12) / 0.38)),
      impact: pulse((actionTime - 0.11) / 0.3),
    });
  } else if (kind === 'sweep') {
    bossMotion = motion({
      lean: phase === 0 ? -0.24 * windup : mix(-0.24, 0.36, action) * (1 - recover),
      crouch: 0.18 * chargePose + 0.12 * pulse(action),
      attack: (0.25 * windup + 0.65 * pulse(action)) * (1 - recover),
    });
  } else if (kind === 'summon') {
    bossMotion = motion({
      lean: -0.12 * chargePose,
      crouch: 0.16 * chargePose,
      attack: 0.8 * chargePose,
      impact: 0.45 * pulse(actionTime / 0.36),
    });
  } else {
    bossMotion = motion({
      lean: -0.28 * windup * followThrough,
      crouch: 0.26 * windup * followThrough,
      attack: 0.72 * windup * followThrough,
      impact: 0.6 * pulse(actionTime / 0.28),
    });
  }
  const routeLength = Math.hypot(playerTarget.x - playerStart.x, playerTarget.y - playerStart.y);
  const responseStride = clamp(speed(responseTime));
  const returnStride = clamp(speed(returnTime) * 0.85);
  const playerMotion = motion({
    gait: (routeLength * (response + returnProgress)) / 20,
    stride: responseStride + returnStride,
    lean: 0.52 * responseStride + 0.25 * returnStride,
    crouch: 0.2 * responseStride,
    dodge: kind === 'sweep' ? 0.6 * pulse(responseTime) : 0,
  });
  const readyFacing = angleTo(player, boss);
  const outgoingFacing = turn(
    angleTo(playerStart, boss),
    angleTo(playerStart, playerTarget),
    smooth(responseTime / 0.25),
  );
  const playerFacing =
    returnTime > 0
      ? turn(angleTo(playerTarget, playerStart), readyFacing, smooth((returnTime - 0.8) / 0.2))
      : turn(outgoingFacing, readyFacing, smooth((responseTime - 0.8) / 0.4));
  const bossFacing = 90;
  // The blade leads the annular trail. Recovery finishes the turn to the ready
  // orientation instead of snapping a persistent weapon back at the loop seam.
  const sweepAngle =
    phase === 0
      ? mix(-14, -44, prepare)
      : phase === 1
        ? mix(-44, 218, action)
        : mix(218, 346, smooth((t - 4.55) / 1.45));
  const sweepWeapon = kind === 'sweep' ? sweepWeaponPose(sweepAngle, bossMotion) : null;
  const sweepClear =
    Math.hypot(player.x - boss.x, player.y - boss.y) - SWEEP_PLAYER_RADIUS > SWEEP_OUTER_RADIUS;
  // Preserve the label contract; rig lift and compression now own vertical articulation.
  const bossRock = 0;

  return Object.freeze({
    kind,
    time: t,
    phase,
    prepare,
    action,
    recover,
    visibility,
    boss,
    bossLabel: { x: boss.x, y: boss.y + bossRock + BOSS_LABEL_OFFSET_Y },
    player,
    bossRock,
    bossFacing,
    playerFacing,
    bossMotion,
    playerMotion,
    sweepWeapon,
    sweepRotation: sweepAngle - 28,
    sweepOpacity:
      kind === 'sweep'
        ? phase === 0
          ? prepare * 0.3
          : phase === 1
            ? 1
            : 1 - smooth((t - 4.25) / 0.22)
        : 0,
    slamRadius: mix(58, 390, clamp((actionTime - 0.16) / 2.49)),
    slamOpacity: kind === 'ground-slam' ? visibility : 0,
    summonProgress: kind === 'summon' ? action : 0,
    summonOpacity: kind === 'summon' ? visibility : 0,
    volleyY: mix(0, 560, action),
    volleyOpacity: kind === 'gap-volley' ? visibility : 0,
    clear: phase > 0 && (kind !== 'sweep' || phase === 2 || sweepClear),
  });
}
