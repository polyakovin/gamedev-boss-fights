export const BLUEPRINT_DURATION = 6;
export const BLUEPRINT_PHASE_ENDS = Object.freeze([1.6, 4.3, BLUEPRINT_DURATION]);
export const BLUEPRINT_PLAYER_RADIUS = 24;
export const BLUEPRINT_BOSS_LABEL_OFFSET_Y = -104;

const SPECS = {
  'wide-swing': { mode: 'arc', boss: [280, 310], player: [410, 470], target: [470, 650] },
  lunge: { mode: 'lunge', boss: [170, 290], player: [390, 590], target: [470, 660] },
  grab: { mode: 'grab', boss: [280, 300], player: [390, 485], target: [470, 610] },
  'burrow-and-emerge': {
    mode: 'burrow',
    boss: [190, 300],
    player: [380, 590],
    target: [455, 700],
  },
  'ring-volley': { mode: 'ring', boss: [280, 400], player: [280, 690], target: [440, 690] },
  'spiral-barrage': {
    mode: 'spiral',
    boss: [280, 390],
    player: [410, 650],
    target: [455, 760],
  },
  'ricochet-projectile': {
    mode: 'ricochet',
    boss: [160, 250],
    player: [400, 650],
    target: [265, 760],
  },
  'homing-projectile': {
    mode: 'homing',
    boss: [180, 260],
    player: [400, 650],
    target: [205, 730],
  },
  'straight-beam': { mode: 'beam', boss: [280, 210], player: [280, 690], target: [450, 690] },
  'scanning-beam': {
    mode: 'scanning',
    boss: [280, 250],
    player: [415, 670],
    target: [175, 720],
  },
  'rotating-beams': {
    mode: 'rotating',
    boss: [280, 430],
    player: [430, 650],
    target: [390, 730],
  },
  'marked-area-strike': {
    mode: 'marked',
    boss: [190, 260],
    player: [380, 620],
    target: [470, 735],
  },
  shockwave: {
    mode: 'shockwave',
    boss: [280, 300],
    player: [280, 690],
    target: [280, 785],
  },
  'lingering-hazard': {
    mode: 'lingering',
    boss: [185, 270],
    player: [360, 620],
    target: [465, 730],
  },
  'hazard-trail': {
    mode: 'trail',
    boss: [175, 260],
    player: [360, 650],
    target: [450, 760],
  },
  'platform-destruction': {
    mode: 'platforms',
    boss: [280, 200],
    player: [145, 690],
    target: [410, 690],
  },
  'shrinking-safe-area': {
    mode: 'shrink',
    boss: [280, 390],
    player: [430, 650],
    target: [350, 570],
  },
  knockback: {
    mode: 'knockback',
    boss: [215, 350],
    player: [330, 510],
    target: [430, 680],
  },
  'target-lock': {
    mode: 'target-lock',
    boss: [180, 250],
    player: [390, 620],
    target: [465, 735],
  },
  'attack-combination': {
    mode: 'combo',
    boss: [280, 310],
    player: [400, 530],
    target: [455, 720],
  },
  'weak-point': {
    mode: 'weak-point',
    boss: [280, 350],
    player: [440, 570],
    target: [385, 485],
  },
  telegraph: {
    mode: 'telegraph',
    boss: [190, 270],
    player: [390, 630],
    target: [470, 720],
  },
  'fight-phase': {
    mode: 'phase',
    boss: [280, 350],
    player: [400, 650],
    target: [365, 720],
  },
  enrage: { mode: 'enrage', boss: [280, 350], player: [400, 650], target: [455, 735] },
};

export const BLUEPRINT_MECHANIC_IDS = Object.freeze(Object.keys(SPECS));

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const pulse = (value) => (value <= 0 || value >= 1 ? 0 : Math.sin(value * Math.PI));
const localTime = (time) => {
  const remainder = (Number.isFinite(time) ? time : 0) % BLUEPRINT_DURATION;
  return remainder < 0 ? remainder + BLUEPRINT_DURATION : remainder;
};
const point = ([x, y]) => ({ x, y });
const polar = (center, radius, angle) => ({
  x: center.x + Math.cos(angle) * radius,
  y: center.y + Math.sin(angle) * radius,
});
const distanceToSegment = (pointValue, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const amount = lengthSquared
    ? clamp(((pointValue.x - start.x) * dx + (pointValue.y - start.y) * dy) / lengthSquared)
    : 0;
  return Math.hypot(
    pointValue.x - mix(start.x, end.x, amount),
    pointValue.y - mix(start.y, end.y, amount),
  );
};
const motion = (values = {}) => ({
  gait: 0,
  stride: 0,
  lean: 0,
  crouch: 0,
  lift: 0,
  attack: 0,
  impact: 0,
  dodge: 0,
  ...values,
});
const circle = (x, y, radius, opacity = 1, tone = 'signal', width = 4, fill = 0) => ({
  type: 'circle',
  x,
  y,
  radius,
  opacity,
  tone,
  width,
  fill,
});
const line = (x1, y1, x2, y2, opacity = 1, tone = 'signal', width = 5, dash = '') => ({
  type: 'line',
  x1,
  y1,
  x2,
  y2,
  opacity,
  tone,
  width,
  dash,
});
const rect = (x, y, width, height, opacity = 1, tone = 'signal', fill = 0.15) => ({
  type: 'rect',
  x,
  y,
  rectWidth: width,
  rectHeight: height,
  opacity,
  tone,
  width: 3,
  fill,
});
const path = (data, opacity = 1, tone = 'signal', width = 5, fill = 0, dash = '') => ({
  type: 'path',
  data,
  opacity,
  tone,
  width,
  fill,
  dash,
});
const arcPath = (center, radius, from, to) => {
  const start = polar(center, radius, from);
  const end = polar(center, radius, to);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${Math.abs(to - from) > Math.PI ? 1 : 0} 1 ${end.x} ${end.y}`;
};
const spiralPath = (center, amount) => {
  const points = Array.from({ length: 34 }, (_, index) => {
    const t = index / 33;
    const angle = t * Math.PI * 4.5 + amount * Math.PI * 1.2;
    return polar(center, 22 + t * 260, angle);
  });
  return points.map((item, index) => `${index ? 'L' : 'M'} ${item.x} ${item.y}`).join(' ');
};
const quadraticPoint = (start, control, end, amount) => {
  const t = clamp(amount);
  const inverse = 1 - t;
  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
};
const projectileLines = (boss, count, spread, length, opacity, offset = 0) =>
  Array.from({ length: count }, (_, index) => {
    const amount = count === 1 ? 0.5 : index / (count - 1);
    const angle = Math.PI / 2 + mix(-spread, spread, amount) + offset;
    const end = polar(boss, length, angle);
    return line(boss.x, boss.y, end.x, end.y, opacity, 'signal', 7);
  });

function primitivesFor(spec, frame) {
  const { mode } = spec;
  const { boss, player, prepare, action, recover, phase } = frame;
  const active = phase === 1 ? 1 : phase === 0 ? 0.22 + prepare * 0.28 : 1 - recover;
  const preview = phase === 0 ? 0.28 + prepare * 0.3 : phase === 1 ? 0.08 : 0;
  if (mode === 'arc')
    return [
      path(arcPath(boss, 205, -1.15, 2.25), preview, 'accent', 20, 0, '12 10'),
      path(arcPath(boss, 205, -1.15, mix(-1.15, 2.25, action)), active, 'signal', 30),
    ];
  if (mode === 'lunge')
    return [
      line(170, 290, 430, 590, preview, 'accent', 38, '14 12'),
      line(170, 290, boss.x, boss.y, active, 'signal', 54),
    ];
  if (mode === 'grab')
    return [
      circle(390, 485, mix(30, 58, prepare), preview, 'accent', 4, 0.06),
      line(boss.x, boss.y, 390, 485, active, 'signal', 32),
    ];
  if (mode === 'burrow')
    return [
      circle(190, 320, 48, phase === 0 ? 1 - prepare : 0, 'muted', 4, 0.08),
      path(
        'M 190 320 Q 250 430 360 520 T 420 590',
        phase === 1 ? 0.7 : preview,
        'accent',
        12,
        0,
        '9 11',
      ),
      circle(420, 590, mix(34, 78, prepare), phase === 1 ? active : preview, 'signal', 5, 0.12),
    ];
  if (mode === 'fan') return projectileLines(boss, 7, 0.78, 610 * action, active);
  if (mode === 'ring') {
    const radius = mix(70, 390, action);
    const gapCenter = Math.atan2(690 - boss.y, 440 - boss.x);
    const gapHalfAngle = 0.24;
    return [
      path(
        arcPath(boss, radius, gapCenter + gapHalfAngle, gapCenter - gapHalfAngle + Math.PI * 2),
        active,
        'signal',
        18,
      ),
      path(
        arcPath(boss, radius, gapCenter - gapHalfAngle, gapCenter + gapHalfAngle),
        active,
        'safe',
        5,
        0,
        '8 8',
      ),
    ];
  }
  if (mode === 'spiral')
    return [
      path(spiralPath(boss, action), active, 'signal', 14),
      circle(boss.x, boss.y, 52, active, 'accent', 4, 0.08),
    ];
  if (mode === 'ricochet')
    return [
      path('M 160 250 L 500 420 L 110 610 L 430 790', preview, 'accent', 9, 0, '15 12'),
      path(
        `M 160 250 L ${mix(160, 500, clamp(action * 3))} ${mix(250, 420, clamp(action * 3))} L ${mix(500, 110, clamp(action * 3 - 1))} ${mix(420, 610, clamp(action * 3 - 1))} L ${mix(110, 430, clamp(action * 3 - 2))} ${mix(610, 790, clamp(action * 3 - 2))}`,
        active,
        'signal',
        12,
      ),
    ];
  if (mode === 'homing') {
    const lockedTarget = { x: 400, y: 650 };
    const control = { x: 500, y: 350 };
    const cutoff = 0.72;
    const trackedProgress = clamp(action / cutoff);
    const trackedHead = quadraticPoint(boss, control, lockedTarget, trackedProgress);
    const overshoot = clamp((action - cutoff) / (1 - cutoff));
    const head = {
      x: trackedHead.x - overshoot * 62,
      y: trackedHead.y + overshoot * 178,
    };
    return [
      path('M 180 260 Q 500 350 400 650 L 338 828', preview, 'accent', 8, 0, '12 10'),
      path(
        `M 180 260 Q 500 350 400 650${overshoot ? ` L ${head.x} ${head.y}` : ''}`,
        phase === 1 ? 0.45 : active * 0.25,
        'signal',
        7,
      ),
      circle(head.x, head.y, 16, active, 'signal', 5, 0.45),
    ];
  }
  if (mode === 'beam')
    return [
      line(boss.x, boss.y, boss.x, 900, preview, 'accent', 34, '12 10'),
      line(boss.x, boss.y, boss.x, 900, active, 'signal', 72),
    ];
  if (mode === 'scanning') {
    const angle = mix(0.85, 2.3, action);
    const end = polar(boss, 720, angle);
    const previewEnd = polar(boss, 720, 0.85);
    return [
      line(boss.x, boss.y, previewEnd.x, previewEnd.y, preview, 'accent', 24, '12 10'),
      line(boss.x, boss.y, end.x, end.y, active, 'signal', 48),
    ];
  }
  if (mode === 'rotating')
    return Array.from({ length: 3 }, (_, index) => {
      const angle = action * Math.PI * 1.25 + (index * Math.PI * 2) / 3;
      const end = polar(boss, 430, angle);
      return line(boss.x, boss.y, end.x, end.y, active, 'signal', 28);
    });
  if (mode === 'marked')
    return [
      circle(
        380,
        620,
        mix(82, 58, prepare),
        phase === 0 ? 0.75 : active,
        'signal',
        5,
        phase === 1 ? 0.28 : 0.04,
      ),
      line(330, 620, 430, 620, preview, 'accent', 3),
      line(380, 570, 380, 670, preview, 'accent', 3),
    ];
  if (mode === 'shockwave')
    return [
      circle(boss.x, boss.y + 30, mix(50, 440, action), active, 'signal', 24),
      circle(boss.x, boss.y + 30, mix(35, 425, action), active, 'accent', 3),
    ];
  if (mode === 'lingering')
    return [
      circle(
        360,
        620,
        mix(26, 105, phase === 0 ? prepare : 1),
        phase === 2 ? 1 - recover : active,
        'signal',
        6,
        0.26,
      ),
      circle(360, 620, 76 + Math.sin(action * Math.PI * 6) * 8, active, 'accent', 3),
    ];
  if (mode === 'trail') {
    const trailPoints = [
      [190, 290],
      [225, 350],
      [265, 415],
      [310, 475],
      [355, 540],
      [400, 600],
    ];
    return [
      path('M 175 280 Q 230 410 330 500 T 410 610', preview, 'accent', 5, 0, '10 10'),
      ...trailPoints.map(([x, y], index) => {
        const placed = clamp(action * trailPoints.length - index);
        const expiresOldestFirst = clamp(1 - recover * trailPoints.length + index);
        const opacity = phase === 0 ? 0 : phase === 1 ? placed : expiresOldestFirst;
        return circle(x, y, 34, opacity, 'signal', 5, 0.24);
      }),
    ];
  }
  if (mode === 'platforms')
    return [0, 1, 2, 3, 4].map((index) =>
      rect(
        45 + index * 103,
        700 - (index % 2) * 55,
        82,
        28,
        index === 1 || index === 2 ? (phase === 0 ? 1 : phase === 1 ? 1 - action : 0) : 1,
        index === 1 || index === 2 ? 'signal' : 'safe',
        0.18,
      ),
    );
  if (mode === 'shrink')
    return [
      circle(280, 500, mix(320, 150, action), phase === 2 ? 1 : active, 'signal', 28),
      circle(280, 500, mix(292, 122, action), phase === 2 ? 1 : active, 'safe', 3, 0.04),
    ];
  if (mode === 'knockback')
    return [
      line(boss.x, boss.y, player.x, player.y, active, 'signal', 18),
      path(
        `M ${player.x - 45} ${player.y - 45} L ${player.x} ${player.y} L ${player.x - 60} ${player.y - 5}`,
        active,
        'accent',
        7,
      ),
    ];
  if (mode === 'target-lock')
    return [
      circle(390, 620, mix(78, 38, prepare), phase === 0 ? 0.8 : active, 'signal', 5),
      line(boss.x, boss.y, 390, 620, phase === 0 ? preview : active, 'accent', 5, '10 10'),
      circle(390, 620, 12, active, 'signal', 8, phase === 1 ? 0.3 : 0),
    ];
  if (mode === 'combo')
    return [
      path(arcPath(boss, 190, -1.15, mix(-1.15, 2.1, clamp(action * 1.7))), active, 'signal', 25),
      circle(boss.x, boss.y, mix(40, 380, clamp(action * 1.7 - 0.7)), active, 'accent', 16),
    ];
  if (mode === 'weak-point')
    return [
      circle(
        boss.x + 58,
        boss.y - 12,
        mix(12, 25, phase === 1 ? pulse(action) : prepare),
        active,
        'safe',
        6,
        0.35,
      ),
      line(
        player.x,
        player.y,
        boss.x + 58,
        boss.y - 12,
        phase === 1 ? pulse(action * 1.5) : 0,
        'accent',
        8,
      ),
    ];
  if (mode === 'telegraph')
    return [
      path(
        'M 190 270 L 485 690 L 410 735 Z',
        phase === 0 ? 0.45 + prepare * 0.25 : active,
        phase === 0 ? 'accent' : 'signal',
        phase === 0 ? 5 : 12,
        phase === 0 ? 0.06 : 0.22,
      ),
      circle(boss.x, boss.y, 55 + prepare * 22, phase === 0 ? 0.8 : 0, 'accent', 5),
    ];
  if (mode === 'phase')
    return [
      circle(
        280,
        500,
        phase === 0 ? 310 : mix(310, 230, action),
        0.7,
        phase === 0 ? 'accent' : 'signal',
        16,
      ),
      rect(55, 680, 450, 30, phase === 1 ? active : 0.25, 'signal', phase === 1 ? 0.3 : 0.05),
      circle(boss.x, boss.y, 65 + pulse(action * 2) * 35, active, 'accent', 6),
    ];
  const enragedState = phase === 0 ? 0.3 + prepare * 0.7 : 1;
  const enragedAttack = phase === 1 ? 1 : 0;
  return [
    circle(boss.x, boss.y, 90 + pulse(action * 4) * 30, enragedState, 'signal', 13),
    ...projectileLines(boss, 5, 1, mix(150, 610, action), enragedAttack, action * 0.8),
  ];
}

export function blueprintPhaseAt(time) {
  const value = localTime(time);
  return value < BLUEPRINT_PHASE_ENDS[0] ? 0 : value < BLUEPRINT_PHASE_ENDS[1] ? 1 : 2;
}

export function blueprintSpec(id) {
  const spec = SPECS[id];
  if (!spec) throw new Error(`Unknown blueprint mechanic: ${id}`);
  return Object.freeze({ id, ...spec });
}

export function blueprintFrame(id, time) {
  const spec = blueprintSpec(id);
  const t = localTime(time);
  const phase = blueprintPhaseAt(t);
  const prepare = smooth(t / BLUEPRINT_PHASE_ENDS[0]);
  const action = clamp(
    (t - BLUEPRINT_PHASE_ENDS[0]) / (BLUEPRINT_PHASE_ENDS[1] - BLUEPRINT_PHASE_ENDS[0]),
  );
  const recover = smooth(
    (t - BLUEPRINT_PHASE_ENDS[1]) / (BLUEPRINT_DURATION - BLUEPRINT_PHASE_ENDS[1]),
  );
  const startBoss = point(spec.boss);
  const startPlayer = point(spec.player);
  const targetPlayer = point(spec.target);
  const response = smooth((t - 0.42) / 0.92);
  const returnProgress = smooth((t - 4.65) / 1.2);
  let boss = startBoss;
  if (spec.mode === 'lunge') {
    const travel = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.62) : 1 - recover;
    boss = { x: mix(170, 430, travel), y: mix(290, 590, travel) };
  } else if (spec.mode === 'burrow') {
    boss = phase === 0 ? startBoss : { x: 420, y: 590 };
  } else if (spec.mode === 'trail') {
    const travel = phase === 0 ? 0 : phase === 1 ? smooth(action) : 1 - returnProgress;
    boss = { x: mix(175, 410, travel), y: mix(260, 610, travel) };
  }
  let responseProgress = response;
  if (spec.mode === 'knockback')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action) : 1;
  else if (spec.mode === 'target-lock')
    responseProgress = phase === 1 ? smooth(action / 0.45) : phase === 2 ? 1 : 0;
  else if (spec.mode === 'homing')
    responseProgress = phase === 1 ? smooth((action - 0.38) / 0.3) : phase === 2 ? 1 : 0;
  let player = {
    x: mix(mix(startPlayer.x, targetPlayer.x, responseProgress), startPlayer.x, returnProgress),
    y: mix(mix(startPlayer.y, targetPlayer.y, responseProgress), startPlayer.y, returnProgress),
  };
  if (spec.mode === 'rotating' && phase === 0) {
    const initialPosition = polar(boss, 255, Math.PI / 3);
    player = {
      x: mix(startPlayer.x, initialPosition.x, prepare),
      y: mix(startPlayer.y, initialPosition.y, prepare),
    };
  } else if (spec.mode === 'rotating' && phase === 1) {
    const safeSector = action * Math.PI * 1.25 + Math.PI / 3;
    player = polar(boss, 255, safeSector);
  } else if (spec.mode === 'rotating' && phase === 2) {
    const finalSector = Math.PI * 1.25 + Math.PI / 3;
    const finalPosition = polar(boss, 255, finalSector);
    player = {
      x: mix(finalPosition.x, startPlayer.x, returnProgress),
      y: mix(finalPosition.y, startPlayer.y, returnProgress),
    };
  }
  const route = Math.hypot(targetPlayer.x - startPlayer.x, targetPlayer.y - startPlayer.y);
  const stride = pulse(responseProgress) + pulse(returnProgress) * 0.8;
  const bossVisible = spec.mode === 'burrow' && phase === 1 && action < 0.68 ? 0 : 1;
  const committed = t >= BLUEPRINT_PHASE_ENDS[0];
  const dangerActive = phase === 1;
  const safeChecks = {
    arc: Math.hypot(player.x - boss.x, player.y - boss.y) > 205 + BLUEPRINT_PLAYER_RADIUS,
    lunge:
      distanceToSegment(player, { x: 170, y: 290 }, { x: 430, y: 590 }) >
      27 + BLUEPRINT_PLAYER_RADIUS,
    grab: Math.hypot(player.x - 390, player.y - 485) > 60 + BLUEPRINT_PLAYER_RADIUS,
    beam: Math.abs(player.x - boss.x) > 36 + BLUEPRINT_PLAYER_RADIUS,
    marked: Math.hypot(player.x - 380, player.y - 620) > 58 + BLUEPRINT_PLAYER_RADIUS,
    lingering: Math.hypot(player.x - 360, player.y - 620) > 105 + BLUEPRINT_PLAYER_RADIUS,
    'target-lock': Math.hypot(player.x - 390, player.y - 620) > 45 + BLUEPRINT_PLAYER_RADIUS,
    telegraph: player.x > 430,
  };
  const playerSafe = !dangerActive || safeChecks[spec.mode] !== false;
  const frame = {
    id,
    mode: spec.mode,
    time: t,
    phase,
    prepare,
    action,
    recover,
    committed,
    dangerActive,
    playerSafe,
    boss,
    player,
    bossVisible,
    bossScale:
      spec.mode === 'phase'
        ? 1 + action * 0.12
        : spec.mode === 'enrage'
          ? phase === 0
            ? 1 + prepare * 0.1
            : 1.1
          : 1,
    bossFacing: 90,
    playerFacing: -90,
    bossMotion: motion({
      lean: phase === 0 ? -0.22 * prepare : 0.24 * pulse(action),
      crouch: 0.2 * prepare,
      attack: phase === 1 ? 0.75 : prepare * 0.35,
      impact: spec.mode === 'shockwave' || spec.mode === 'knockback' ? pulse(action * 3) : 0,
    }),
    playerMotion: motion({
      gait: (route * responseProgress + route * returnProgress) / 20,
      stride,
      lean: stride * 0.45,
      crouch: stride * 0.16,
      dodge: phase === 0 ? pulse(responseProgress) * 0.45 : 0,
      attack: spec.mode === 'weak-point' && phase === 1 ? pulse(action * 1.5) : 0,
    }),
  };
  frame.primitives = primitivesFor(spec, frame);
  frame.bossLabel = {
    x: boss.x,
    y: boss.y + BLUEPRINT_BOSS_LABEL_OFFSET_Y * frame.bossScale,
  };
  return Object.freeze(frame);
}
