export const BLUEPRINT_DURATION = 6;
export const BLUEPRINT_PHASE_ENDS = Object.freeze([1.6, 4.3, BLUEPRINT_DURATION]);
export const BLUEPRINT_PLAYER_RADIUS = 24;
export const BLUEPRINT_BOSS_LABEL_OFFSET_Y = -104;

const SPECS = {
  'landing-jump': {
    mode: 'landing',
    boss: [155, 280],
    player: [365, 600],
    target: [470, 720],
    landing: [365, 600],
  },
  'single-shot': {
    mode: 'single-shot',
    boss: [165, 280],
    player: [385, 600],
    target: [500, 520],
    shotEnd: [572, 872],
  },
  crossfire: {
    mode: 'crossfire',
    boss: [280, 235],
    player: [280, 595],
    target: [445, 735],
    sources: [
      [90, 315],
      [470, 315],
    ],
    shotEnds: [
      [470, 840],
      [90, 840],
    ],
  },
  'splitting-projectile': {
    mode: 'splitting-projectile',
    boss: [155, 260],
    player: [380, 610],
    target: [505, 700],
    split: [300, 455],
    fragmentEnds: [
      [85, 850],
      [285, 885],
      [465, 850],
    ],
  },
  'returning-projectile': {
    mode: 'returning-projectile',
    boss: [155, 270],
    player: [370, 610],
    target: [95, 700],
    turn: [485, 455],
    returnControl: [430, 785],
  },
  'orbiting-projectiles': {
    mode: 'orbiting-projectiles',
    boss: [280, 420],
    player: [376, 651],
    target: [185, 480],
    orbitRadius: 170,
    projectileCount: 5,
    startAngle: 0.55,
    rotation: 1.4,
  },
  'pulse-beam': {
    mode: 'pulse-beam',
    boss: [150, 340],
    player: [455, 590],
    target: [270, 660],
    beamStart: [150, 340],
    beamEnd: [500, 700],
  },
  'chain-explosions': {
    mode: 'chain-explosions',
    boss: [280, 270],
    player: [500, 800],
    target: [185, 560],
    blastRadius: 58,
    blastCenters: [
      [455, 650],
      [365, 560],
      [275, 650],
      [185, 560],
      [95, 650],
    ],
  },
  mine: {
    mode: 'mine',
    boss: [170, 270],
    player: [455, 690],
    target: [170, 820],
    mine: [320, 610],
    triggerRadius: 96,
    safeRoute: [
      [455, 690],
      [500, 730],
      [470, 820],
      [330, 865],
      [170, 820],
    ],
  },
  'moving-hazard': {
    mode: 'moving-hazard',
    boss: [280, 260],
    player: [365, 690],
    target: [365, 455],
    hazardStart: [105, 620],
    hazardEnd: [485, 620],
    hazardRadius: 72,
  },
  'converging-threats': {
    mode: 'converging-threats',
    boss: [280, 260],
    player: [280, 655],
    target: [280, 455],
    arenaWidth: 560,
    threatTop: 535,
    threatHeight: 235,
    entryWidth: 90,
    convergence: 280,
  },
  pull: {
    mode: 'pull',
    boss: [280, 300],
    player: [350, 660],
    target: [480, 575],
    pullRadius: 445,
    dangerRadius: 82,
  },
  'turret-deployment': {
    mode: 'turret-deployment',
    boss: [145, 290],
    player: [430, 680],
    target: [225, 680],
    turret: [430, 480],
    beamEnd: [430, 870],
    beamHalfWidth: 17,
  },
  'threat-generator': {
    mode: 'threat-generator',
    boss: [145, 290],
    player: [430, 685],
    target: [195, 685],
    generator: [405, 455],
    shotEnds: [
      [410, 980],
      [480, 980],
      [325, 980],
    ],
    shotRadius: 19,
  },
  decoy: {
    mode: 'decoy',
    boss: [280, 350],
    player: [440, 690],
    target: [280, 535],
    real: [190, 425],
    mirror: [410, 425],
    contactRadius: 56,
  },
  'predictive-aiming': {
    mode: 'predictive-aim',
    boss: [155, 290],
    player: [340, 620],
    target: [300, 620],
    approachVelocity: 50,
    leadSeconds: 1.6,
    shotRadius: 22,
  },
  'source-tracking': {
    mode: 'source-track',
    boss: [280, 295],
    player: [400, 655],
    target: [420, 655],
    emitter: [282, 281],
    lock: [255, 655],
    beamLength: 640,
    beamHalfWidth: 18,
    maximumTurnRate: 0.6,
  },
  'burst-fire': {
    mode: 'burst-fire',
    boss: [170, 300],
    player: [385, 635],
    target: [500, 635],
    emitter: [183, 310],
    shotEnd: [515, 850],
    shotRadius: 20,
    releases: [1.9, 2.45, 3],
    flight: 1.25,
  },
  volley: {
    mode: 'volley',
    boss: [280, 285],
    player: [280, 630],
    target: [475, 630],
    lanes: [190, 280, 370],
    emitterY: 355,
    shotEndY: 870,
    shotRadius: 22,
    release: 2,
    flight: 1.5,
  },
  'delayed-activation': {
    mode: 'delayed-activation',
    boss: [155, 300],
    player: [350, 630],
    target: [485, 630],
    rune: [350, 630],
    radius: 82,
    activatesAt: 2.9,
    expiresAt: 4.0,
  },
  'speed-change': {
    mode: 'speed-change',
    boss: [140, 620],
    player: [405, 620],
    target: [405, 790],
    switchX: 260,
    finishX: 440,
    laneY: 620,
    collisionRadius: 57,
    switchAt: 2.8,
    finishAt: 3.45,
  },
  'limited-spread': {
    mode: 'limited-spread',
    boss: [280, 280],
    player: [280, 660],
    target: [465, 660],
    emitter: [280, 332],
    coneHalfAngle: 0.2,
    shotRadius: 18,
    releases: [1.85, 2.4, 2.95],
    offsets: [-0.15, 0.12, -0.04],
    flight: 1.3,
    shotLength: 590,
  },
  'directional-shield': {
    mode: 'directional-shield',
    boss: [280, 430],
    player: [280, 535],
    target: [390, 430],
    guardAngle: Math.PI / 2,
    guardHalfAngle: 0.9,
    guardEnd: 3.85,
    attackReach: 132,
    frontStrike: 2.05,
    sideStrike: 3.55,
  },
  'damage-type-resistance': {
    mode: 'damage-type-resistance',
    boss: [280, 430],
    player: [420, 430],
    target: [395, 430],
    slashStrike: 2.05,
    thrustStrike: 3.55,
    slashMultiplier: 0.2,
    baseDamage: 100,
  },
  'situational-immunity': {
    mode: 'situational-immunity',
    boss: [280, 430],
    player: [425, 430],
    target: [390, 430],
    ward: [410, 330],
    blockedStrike: 2.05,
    wardStrike: 2.8,
    openStrike: 3.55,
    shieldReturns: 4.3,
  },
  'part-break': {
    mode: 'part-break',
    boss: [280, 430],
    player: [475, 620],
    target: [415, 405],
    launcher: [347, 405],
    shotEnd: [548, 405],
    firstShot: [1.95, 2.2],
    breakAt: 2.88,
    secondAttempt: 3.78,
    repairStart: 4.95,
    repairEnd: 5.35,
    beamHalfWidth: 14,
  },
  'attack-reflection': {
    mode: 'attack-reflection',
    boss: [280, 430],
    player: [475, 405],
    target: [475, 550],
    mirror: [348, 405],
    swordBoltStart: [445, 405],
    outgoing: [1.72, 2.35],
    reflected: [2.35, 3.35],
    mirrorLowered: 4.3,
    meleeStrike: 4.72,
    mirrorRaised: 5.28,
    boltRadius: 13,
  },
  'counter-stance': {
    mode: 'counter-stance',
    boss: [280, 430],
    player: [435, 430],
    target: [475, 550],
    firstGuard: [0.62, 1.98],
    parriedStrike: 1.88,
    riposte: [2.43, 2.88],
    secondGuard: [3.48, 4.48],
    openStrike: 4.96,
    counterStart: [345, 421],
    counterEnd: [438, 421],
    counterHalfWidth: 19,
  },
  'absorption-power-up': {
    mode: 'absorption-power-up',
    boss: [280, 430],
    player: [450, 430],
    target: [510, 430],
    core: [310, 409],
    swordStart: [420, 407],
    firstPulse: [1.25, 1.65],
    secondPulse: [2.05, 2.45],
    chargeWindup: 2.95,
    shockwave: [3.55, 3.94],
    spentAt: 4.2,
    openStrike: 4.96,
    shockwaveRadius: 175,
  },
  'interruptible-wind-up': {
    mode: 'interruptible-wind-up',
    boss: [280, 430],
    player: [450, 430],
    target: [510, 430],
    interruptPosition: [365, 430],
    firstWindup: [0.72, 1.82],
    interruptAt: 1.58,
    staggerEnd: 2.55,
    secondWindup: [3.02, 4.18],
    release: [4.18, 4.56],
    recoveryEnd: 5.28,
    threatRadius: 150,
  },
  'loadout-adaptation': {
    mode: 'loadout-adaptation',
    boss: [280, 430],
    player: [450, 430],
    target: [485, 650],
    reachSnapshot: [0.62, 1.08],
    reachCopiedAt: 1.08,
    reachAttack: [1.66, 2.08],
    reachRecoveryEnd: 2.56,
    swapAt: 2.76,
    burstSnapshot: [3.02, 3.48],
    burstCopiedAt: 3.48,
    burstAttack: [4.18, 4.58],
    recoveryEnd: 5.3,
    reachEnd: [560, 430],
    reachHalfWidth: 18,
    burstRadius: 150,
  },
  'wind-up': {
    mode: 'wind-up',
    boss: [280, 430],
    player: [450, 430],
    target: [450, 320],
    firstWindup: [0.55, 1.6],
    firstRelease: [1.6, 1.98],
    firstRecoveryEnd: 2.42,
    secondWindup: [2.88, 4.3],
    heldFrom: 3.72,
    secondRelease: [4.3, 4.68],
    recoveryEnd: 5.35,
    laneEnd: [560, 430],
    laneHalfWidth: 22,
  },
  'attack-lock': {
    mode: 'attack-lock',
    boss: [280, 350],
    player: [430, 620],
    target: [70, 505],
    firstTrack: [0.42, 1.18],
    firstLock: 1.18,
    firstRelease: [1.72, 2.12],
    firstRecoveryEnd: 2.48,
    firstLockPoint: [390, 560],
    firstEscape: [500, 500],
    secondSetup: 2.68,
    secondTrack: [2.86, 3.58],
    secondLock: 3.58,
    secondRelease: [4.18, 4.58],
    recoveryEnd: 5.25,
    secondStart: [190, 620],
    secondLockPoint: [180, 560],
    secondEscape: [70, 505],
    laneLength: 500,
    laneHalfWidth: 18,
  },
  'active-phase': {
    mode: 'active-phase',
    boss: [240, 430],
    player: [460, 430],
    target: [345, 430],
    safePosition: [410, 300],
    startup: [0.55, 1.6],
    active: [1.6, 2.18],
    followThroughEnd: 2.92,
    punishAt: 3.28,
    recoveryEnd: 4.8,
    laneStart: [282, 430],
    laneEnd: [548, 430],
    laneHalfWidth: 24,
  },
  recovery: {
    mode: 'recovery',
    boss: [230, 430],
    player: [475, 430],
    target: [350, 430],
    safePosition: [430, 305],
    startup: [0.48, 1.28],
    active: [1.28, 1.74],
    recovery: [1.74, 4.58],
    punishAt: 3.48,
    resetAt: 4.92,
    laneStart: [274, 430],
    laneEnd: [548, 430],
    laneHalfWidth: 24,
    punishReach: 118,
  },
  'survival-phase': {
    mode: 'survival-phase',
    boss: [240, 430],
    player: [445, 650],
    target: [355, 430],
    survival: [0.55, 4.35],
    shieldDropsAt: 4.35,
    punishAt: 5.08,
    resetAt: 5.35,
    hazardRadius: 92,
    hazards: [
      { center: [445, 650], preview: [0.55, 1.15], active: [1.15, 1.48] },
      { center: [430, 330], preview: [1.48, 2.08], active: [2.08, 2.41] },
      { center: [145, 430], preview: [2.41, 3.01], active: [3.01, 3.34] },
      { center: [395, 655], preview: [3.34, 3.94], active: [3.94, 4.27] },
    ],
    safePositions: [
      [430, 330],
      [145, 430],
      [395, 655],
      [430, 380],
    ],
  },
  teleport: {
    mode: 'teleport',
    boss: [155, 360],
    player: [400, 640],
    target: [485, 520],
    destination: [390, 360],
    safePosition: [500, 560],
    departure: [0.55, 1.05],
    destinationPreview: [0.72, 1.7],
    absent: [1.05, 1.52],
    arrival: [1.52, 1.7],
    followUpPreview: [1.7, 2.36],
    active: [2.36, 2.72],
    punishAt: 3.55,
    recoveryEnd: 4.45,
    resetDeparture: [4.75, 5.15],
    resetAbsent: [5.15, 5.62],
    resetArrival: [5.62, 6],
    laneStart: [390, 408],
    laneEnd: [390, 790],
    laneHalfWidth: 28,
  },
  'boundary-attack': {
    mode: 'boundary-attack',
    boss: [-55, 610],
    player: [300, 610],
    target: [365, 610],
    safePosition: [300, 485],
    signal: [0.55, 1.72],
    active: [1.72, 2.28],
    impactAt: 2.28,
    punishAt: 3.15,
    openingEnd: 3.75,
    withdrawEnd: 4.15,
    outerRoute: [4.15, 5.85],
    laneStart: [0, 610],
    laneEnd: [560, 610],
    laneHalfWidth: 40,
    leftBoundary: 58,
    rightBoundary: 502,
    impactPosition: [460, 610],
  },
  'forced-scrolling': {
    mode: 'forced-scrolling',
    boss: [150, 724],
    player: [350, 650],
    target: [382, 632],
    safePosition: [420, 435],
    signal: [0.5, 1.25],
    active: [1.25, 4.25],
    bossAdvanceEnd: 4.72,
    punishAt: 5.05,
    resetAt: 5.35,
    hazardTop: 730,
    scrollDistance: 310,
    stopRune: [420, 405],
    bossOpening: [280, 665],
    route: [
      [350, 650],
      [420, 585],
      [300, 510],
      [420, 435],
    ],
    platforms: [
      [305, 690, 130],
      [380, 555, 120],
      [245, 425, 125],
      [405, 295, 115],
    ],
  },
  'chase-herding': {
    mode: 'chase-herding',
    boss: [170, 620],
    player: [92, 705],
    target: [392, 625],
    safePosition: [350, 500],
    signal: [0.5, 1.15],
    active: [1.15, 3.75],
    captureEnd: 4.45,
    punishAt: 4.72,
    resetAt: 5.15,
    distanceBand: [68, 185],
    captureZone: [445, 620],
    captureRadius: 52,
    bossRoute: [
      [170, 620],
      [275, 570],
      [365, 635],
      [445, 620],
    ],
    playerRoute: [
      [92, 705],
      [180, 690],
      [255, 520],
      [350, 500],
    ],
    checkpoints: [
      [275, 570],
      [365, 635],
      [445, 620],
    ],
  },
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
    target: [348, 568],
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
    target: [505, 770],
  },
  'fight-phase': {
    mode: 'phase',
    boss: [280, 350],
    player: [400, 650],
    target: [365, 750],
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
const PULSE_BEAM_WINDOWS = Object.freeze([
  [0.08, 0.24],
  [0.48, 0.64],
  [0.78, 0.92],
]);
const pulseBeamIndex = (action) =>
  PULSE_BEAM_WINDOWS.findIndex(([start, end]) => action >= start && action <= end);
const CHAIN_EXPLOSION_WINDOWS = Object.freeze([
  [0.04, 0.18],
  [0.22, 0.36],
  [0.4, 0.54],
  [0.58, 0.72],
  [0.76, 0.9],
]);
const GENERATOR_RELEASES = Object.freeze([1.86, 2.62, 3.38]);
const GENERATOR_FLIGHT = 0.85;
const generatorShots = (spec, time) =>
  GENERATOR_RELEASES.map((release, index) => {
    const progress = clamp((time - release) / GENERATOR_FLIGHT);
    const start = point(spec.generator);
    const end = point(spec.shotEnds[index]);
    return {
      x: mix(start.x, end.x, progress),
      y: mix(start.y + 32, end.y, progress),
      radius: spec.shotRadius,
      active: time >= release && time <= release + GENERATOR_FLIGHT,
    };
  });
const limitedSpreadShots = (spec, time) =>
  spec.releases.map((release, index) => {
    const angle = Math.PI / 2 + spec.offsets[index];
    const start = point(spec.emitter);
    const progress = clamp((time - release) / spec.flight);
    return {
      ...polar(start, spec.shotLength * progress, angle),
      radius: spec.shotRadius,
      active: time >= release && time < release + spec.flight,
    };
  });
const strikePulse = (time, event, width = 0.22) => Math.max(0, 1 - Math.abs(time - event) / width);
const chainExplosionIndex = (action) =>
  CHAIN_EXPLOSION_WINDOWS.findIndex(([start, end]) => action >= start && action <= end);
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
const circle = (x, y, radius, opacity = 1, tone = 'signal', width = 4, fill = 0, dash = '') => ({
  type: 'circle',
  x,
  y,
  radius,
  opacity,
  tone,
  width,
  fill,
  dash,
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
const spiralPoints = (center, amount) =>
  Array.from({ length: 34 }, (_, index) => {
    const t = index / 33;
    const angle = t * Math.PI * 4.5 + amount * Math.PI * 1.2;
    return polar(center, 22 + t * 260, angle);
  });
const spiralPath = (center, amount) => {
  const points = spiralPoints(center, amount);
  return points.map((item, index) => `${index ? 'L' : 'M'} ${item.x} ${item.y}`).join(' ');
};

const distanceToPolyline = (value, points) =>
  Math.min(...points.slice(1).map((end, index) => distanceToSegment(value, points[index], end)));

const angleDifference = (from, to) => Math.atan2(Math.sin(from - to), Math.cos(from - to));

export function directionalShieldOutcome(time, attacker) {
  const spec = SPECS['directional-shield'];
  const t = localTime(time);
  const boss = point(spec.boss);
  const distance = Math.hypot(attacker.x - boss.x, attacker.y - boss.y);
  if (distance > spec.attackReach) return 'out-of-range';
  const incomingAngle = Math.atan2(attacker.y - boss.y, attacker.x - boss.x);
  const guarded =
    t >= BLUEPRINT_PHASE_ENDS[0] &&
    t < spec.guardEnd &&
    Math.abs(angleDifference(incomingAngle, spec.guardAngle)) <= spec.guardHalfAngle;
  return guarded ? 'blocked' : 'hit';
}

export function damageTypeResistanceDamage(type, baseDamage = 100) {
  if (type !== 'slash' && type !== 'thrust') throw new Error(`Unknown damage type: ${type}`);
  return baseDamage * (type === 'slash' ? SPECS['damage-type-resistance'].slashMultiplier : 1);
}

export function situationalImmunityOutcome(time, target = 'boss') {
  const spec = SPECS['situational-immunity'];
  const t = localTime(time);
  if (target === 'ward') return t < spec.wardStrike ? 'breakable' : 'broken';
  if (target !== 'boss') throw new Error(`Unknown immunity target: ${target}`);
  return t < spec.wardStrike || t >= spec.shieldReturns ? 'immune' : 'vulnerable';
}

export function partBreakState(time) {
  const spec = SPECS['part-break'];
  const t = localTime(time);
  if (t < spec.breakAt || t >= spec.repairEnd) return 'attached';
  return t >= spec.repairStart ? 'repairing' : 'broken';
}

export function partBreakCanFire(time) {
  return partBreakState(time) === 'attached';
}

export function attackReflectionState(time) {
  const spec = SPECS['attack-reflection'];
  const t = localTime(time);
  if (t >= spec.reflected[0] && t < spec.reflected[1]) return 'reflected';
  if (t >= spec.mirrorLowered && t < spec.mirrorRaised) return 'open';
  if (t >= spec.mirrorRaised && t < spec.mirrorRaised + 0.35) return 'raising';
  return 'guarded';
}

export function counterStanceState(time) {
  const spec = SPECS['counter-stance'];
  const t = localTime(time);
  if (t >= spec.riposte[0] && t < spec.riposte[1]) return 'riposte';
  if (t >= spec.parriedStrike && t < spec.riposte[0]) return 'triggered';
  if (t >= spec.firstGuard[0] && t < spec.parriedStrike) return 'guarded';
  if (t >= spec.secondGuard[0] && t < spec.secondGuard[1]) return 'guarded-withheld';
  if (t >= spec.secondGuard[1] && t < spec.openStrike + 0.36) return 'open';
  return 'idle';
}

export function counterStanceOutcome(time, incomingAttack = false) {
  const spec = SPECS['counter-stance'];
  const t = localTime(time);
  if (!incomingAttack) return 'no-trigger';
  const guarded =
    (t >= spec.firstGuard[0] && t < spec.firstGuard[1]) ||
    (t >= spec.secondGuard[0] && t < spec.secondGuard[1]);
  return guarded ? 'parried-counter' : 'hit';
}

export function absorptionCharge(time) {
  const spec = SPECS['absorption-power-up'];
  const t = localTime(time);
  if (t >= spec.shockwave[0]) return 0;
  if (t >= spec.secondPulse[1]) return 2;
  if (t >= spec.firstPulse[1]) return 1;
  return 0;
}

export function absorptionOutcome(time, attackType = 'sword-pulse') {
  const spec = SPECS['absorption-power-up'];
  const t = localTime(time);
  if (attackType !== 'sword-pulse') return 'ordinary';
  if (t < 0.6 || t >= spec.chargeWindup) return 'ordinary';
  return absorptionCharge(t) < 2 ? 'absorbed' : 'at-cap';
}

export function interruptibleWindUpState(time) {
  const spec = SPECS['interruptible-wind-up'];
  const t = localTime(time);
  if (t >= spec.release[0] && t < spec.release[1]) return 'released';
  if (t >= spec.secondWindup[0] && t < spec.release[0]) return 'wind-up-open';
  if (t >= spec.interruptAt && t < spec.staggerEnd) return 'interrupted-open';
  if (t >= spec.firstWindup[0] && t < spec.interruptAt) return 'wind-up-open';
  if (t >= spec.release[1] && t < spec.recoveryEnd) return 'recovery';
  return 'idle';
}

export function interruptibleWindUpOutcome(time, impact = 1) {
  const spec = SPECS['interruptible-wind-up'];
  const t = localTime(time);
  const open =
    (t >= spec.firstWindup[0] && t < spec.firstWindup[1]) ||
    (t >= spec.secondWindup[0] && t < spec.secondWindup[1]);
  if (!open) return 'closed';
  return impact >= 1 ? 'interrupted' : 'insufficient-impact';
}

export function loadoutAdaptationPackage(loadout) {
  if (loadout === 'reach-rune') return 'reach-thrust';
  if (loadout === 'burst-rune') return 'burst-ring';
  return 'baseline';
}

export function loadoutAdaptationState(time) {
  const spec = SPECS['loadout-adaptation'];
  const t = localTime(time);
  if (t >= spec.reachSnapshot[0] && t < spec.reachCopiedAt) return 'reading-reach';
  if (t >= spec.reachCopiedAt && t < spec.reachAttack[0]) return 'copied-reach';
  if (t >= spec.reachAttack[0] && t < spec.reachAttack[1]) return 'reach-danger';
  if (t >= spec.reachAttack[1] && t < spec.swapAt) return 'reach-recovery';
  if (t >= spec.swapAt && t < spec.burstSnapshot[0]) return 'loadout-swapped';
  if (t >= spec.burstSnapshot[0] && t < spec.burstCopiedAt) return 'reading-burst';
  if (t >= spec.burstCopiedAt && t < spec.burstAttack[0]) return 'copied-burst';
  if (t >= spec.burstAttack[0] && t < spec.burstAttack[1]) return 'burst-danger';
  if (t >= spec.burstAttack[1] && t < spec.recoveryEnd) return 'burst-recovery';
  return 'idle';
}

export function windUpProgress(time) {
  const spec = SPECS['wind-up'];
  const t = localTime(time);
  if (t >= spec.firstWindup[0] && t < spec.firstRelease[0])
    return clamp((t - spec.firstWindup[0]) / (spec.firstRelease[0] - spec.firstWindup[0]));
  if (t >= spec.secondWindup[0] && t < spec.secondRelease[0])
    return clamp((t - spec.secondWindup[0]) / (spec.heldFrom - spec.secondWindup[0]));
  return 0;
}

export function windUpState(time) {
  const spec = SPECS['wind-up'];
  const t = localTime(time);
  if (t >= spec.firstWindup[0] && t < spec.firstRelease[0]) return 'short-wind-up';
  if (t >= spec.firstRelease[0] && t < spec.firstRelease[1]) return 'short-release';
  if (t >= spec.firstRelease[1] && t < spec.firstRecoveryEnd) return 'short-recovery';
  if (t >= spec.secondWindup[0] && t < spec.heldFrom) return 'held-wind-up';
  if (t >= spec.heldFrom && t < spec.secondRelease[0]) return 'held-ready';
  if (t >= spec.secondRelease[0] && t < spec.secondRelease[1]) return 'held-release';
  if (t >= spec.secondRelease[1] && t < spec.recoveryEnd) return 'held-recovery';
  return 'idle';
}

export function attackLockState(time) {
  const spec = SPECS['attack-lock'];
  const t = localTime(time);
  if (t >= spec.firstTrack[0] && t < spec.firstLock) return 'tracking-first';
  if (t >= spec.firstLock && t < spec.firstRelease[0]) return 'locked-first';
  if (t >= spec.firstRelease[0] && t < spec.firstRelease[1]) return 'released-first';
  if (t >= spec.firstRelease[1] && t < spec.firstRecoveryEnd) return 'recovery-first';
  if (t >= spec.secondTrack[0] && t < spec.secondLock) return 'tracking-second';
  if (t >= spec.secondLock && t < spec.secondRelease[0]) return 'locked-second';
  if (t >= spec.secondRelease[0] && t < spec.secondRelease[1]) return 'released-second';
  if (t >= spec.secondRelease[1] && t < spec.recoveryEnd) return 'recovery-second';
  return 'idle';
}

export function activePhaseState(time) {
  const spec = SPECS['active-phase'];
  const t = localTime(time);
  if (t >= spec.startup[0] && t < spec.active[0]) return 'startup';
  if (t >= spec.active[0] && t < spec.active[1]) return 'active';
  if (t >= spec.active[1] && t < spec.followThroughEnd) return 'follow-through';
  if (t >= spec.followThroughEnd && t < spec.recoveryEnd) return 'recovery';
  if (t >= spec.recoveryEnd) return 'reset';
  return 'idle';
}

export function recoveryState(time) {
  const spec = SPECS.recovery;
  const t = localTime(time);
  if (t >= spec.startup[0] && t < spec.active[0]) return 'startup';
  if (t >= spec.active[0] && t < spec.active[1]) return 'active';
  if (t >= spec.recovery[0] && t < spec.punishAt) return 'approach-window';
  if (t >= spec.punishAt && t < spec.recovery[1]) return 'punish-window';
  if (t >= spec.recovery[1] && t < spec.resetAt) return 'boss-ready';
  if (t >= spec.resetAt) return 'reset';
  return 'idle';
}

export function survivalPhaseState(time) {
  const spec = SPECS['survival-phase'];
  const t = localTime(time);
  if (t < spec.survival[0]) return 'idle';
  const activeIndex = spec.hazards.findIndex(({ active }) => t >= active[0] && t < active[1]);
  if (activeIndex >= 0) return `survive-${activeIndex + 1}`;
  if (t < spec.shieldDropsAt) return 'read-next';
  if (t < spec.punishAt) return 'survived';
  if (t < spec.resetAt) return 'opening';
  return 'reset';
}

export function teleportState(time) {
  const spec = SPECS.teleport;
  const t = localTime(time);
  if (t < spec.departure[0]) return 'idle';
  if (t < spec.absent[0]) return 'departing';
  if (t < spec.arrival[0]) return 'absent';
  if (t < spec.arrival[1]) return 'arriving';
  if (t < spec.active[0]) return 'follow-up-tell';
  if (t < spec.active[1]) return 'follow-up-danger';
  if (t < spec.recoveryEnd) return 'opening';
  return 'reset';
}

export function boundaryAttackState(time) {
  const spec = SPECS['boundary-attack'];
  const t = localTime(time);
  if (t < spec.signal[0]) return 'idle';
  if (t < spec.active[0]) return 'edge-signal';
  if (t < spec.active[1]) return 'boundary-crossing';
  if (t < spec.punishAt) return 'boundary-stagger';
  if (t < spec.openingEnd) return 'opening';
  return 'outer-reset';
}

export function forcedScrollingState(time) {
  const spec = SPECS['forced-scrolling'];
  const t = localTime(time);
  if (t < spec.signal[0]) return 'idle';
  if (t < spec.active[0]) return 'scroll-signal';
  if (t < spec.active[1]) return 'forced-scroll';
  if (t < spec.bossAdvanceEnd) return 'route-cleared';
  if (t < spec.resetAt) return 'opening';
  return 'reset';
}

export function forcedScrollingOffset(time) {
  const spec = SPECS['forced-scrolling'];
  const t = localTime(time);
  if (t < spec.active[0]) return 0;
  if (t < spec.active[1])
    return spec.scrollDistance * smooth((t - spec.active[0]) / (spec.active[1] - spec.active[0]));
  if (t < spec.resetAt) return spec.scrollDistance;
  return (
    spec.scrollDistance * (1 - smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt)))
  );
}

export function chaseHerdingState(time) {
  const spec = SPECS['chase-herding'];
  const t = localTime(time);
  if (t < spec.signal[0]) return 'idle';
  if (t < spec.active[0]) return 'route-signal';
  if (t < 2.55) return 'maintain-distance';
  if (t < spec.active[1]) return 'intercept';
  if (t < spec.captureEnd) return 'captured';
  if (t < spec.resetAt) return 'opening';
  return 'reset';
}

const pointInPolygon = (value, points) => {
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
    const start = points[index];
    const end = points[previous];
    if (
      start.y > value.y !== end.y > value.y &&
      value.x < ((end.x - start.x) * (value.y - start.y)) / (end.y - start.y) + start.x
    )
      inside = !inside;
  }
  return inside;
};
const quadraticPoint = (start, control, end, amount) => {
  const t = clamp(amount);
  const inverse = 1 - t;
  return {
    x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
  };
};
const pointAlongPolyline = (points, amount) => {
  const progress = clamp(amount) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(progress));
  const localProgress = progress - index;
  return {
    x: mix(points[index].x, points[index + 1].x, localProgress),
    y: mix(points[index].y, points[index + 1].y, localProgress),
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
  if (mode === 'delayed-activation') {
    const [x, y] = spec.rune;
    const countdown = clamp(
      (frame.time - BLUEPRINT_PHASE_ENDS[0]) / (spec.activatesAt - BLUEPRINT_PHASE_ENDS[0]),
    );
    const lit = frame.dangerActive;
    const visible = phase === 2 ? 1 - recover : phase === 0 ? 0.4 + 0.5 * prepare : 1;
    return [
      line(
        boss.x + 38,
        boss.y + 40,
        x,
        y,
        phase === 0 ? 0.28 + 0.48 * prepare : 0,
        'accent',
        4,
        '9 12',
      ),
      circle(x, y, spec.radius, visible, lit ? 'signal' : 'accent', lit ? 13 : 5, lit ? 0.4 : 0.05),
      circle(x, y, mix(118, spec.radius, countdown), phase === 1 && !lit ? 0.75 : 0, 'accent', 5),
      circle(x, y, 12, visible, lit ? 'signal' : 'accent', 5, lit ? 0.6 : 0.12),
      ...Array.from({ length: 8 }, (_, index) => {
        const angle = (index * Math.PI) / 4;
        return circle(
          x + Math.cos(angle) * 57,
          y + Math.sin(angle) * 57,
          5,
          visible * (lit ? 1 : 0.36 + countdown * 0.5),
          lit ? 'signal' : 'accent',
          3,
          lit ? 0.5 : 0,
        );
      }),
    ];
  }
  if (mode === 'speed-change') {
    const accelerating = frame.time >= spec.switchAt && frame.time < spec.finishAt;
    const moving = frame.time >= BLUEPRINT_PHASE_ENDS[0] && frame.time < spec.finishAt;
    const lane = phase === 0 ? 0.36 + prepare * 0.35 : moving ? 0.28 : 0;
    return [
      rect(
        73,
        spec.laneY - spec.collisionRadius,
        429,
        spec.collisionRadius * 2,
        lane,
        'accent',
        0.05,
      ),
      line(
        spec.boss[0],
        spec.laneY,
        spec.finishX,
        spec.laneY,
        phase === 0 ? 0.7 : moving ? 0.22 : 0,
        'accent',
        5,
        '14 12',
      ),
      path(
        `M ${spec.switchX - 18} ${spec.laneY - 80} L ${spec.switchX} ${spec.laneY - 98} L ${spec.switchX + 18} ${spec.laneY - 80} M ${spec.switchX - 18} ${spec.laneY + 80} L ${spec.switchX} ${spec.laneY + 98} L ${spec.switchX + 18} ${spec.laneY + 80}`,
        phase === 0 ? 0.45 + prepare * 0.32 : moving ? 0.84 : 0,
        accelerating ? 'signal' : 'accent',
        6,
      ),
      ...[-25, 0, 25].map((offset, index) =>
        line(
          boss.x - (accelerating ? 125 : 65) + index * 12,
          boss.y + offset,
          boss.x - 38,
          boss.y + offset,
          moving ? (accelerating ? 0.86 : 0.37) : 0,
          accelerating ? 'signal' : 'accent',
          accelerating ? 9 : 5,
        ),
      ),
    ];
  }
  if (mode === 'limited-spread') {
    const origin = point(spec.emitter);
    const edgeLength = 590;
    const left = polar(origin, edgeLength, Math.PI / 2 - spec.coneHalfAngle);
    const right = polar(origin, edgeLength, Math.PI / 2 + spec.coneHalfAngle);
    const warning = phase === 0 ? 0.35 + prepare * 0.4 : phase === 1 ? 0.27 : 0;
    const shots = limitedSpreadShots(spec, frame.time);
    return [
      path(
        `M ${origin.x} ${origin.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`,
        warning,
        'accent',
        3,
        0.07,
        '11 12',
      ),
      line(
        origin.x,
        origin.y,
        origin.x,
        origin.y + edgeLength,
        warning * 0.55,
        'accent',
        3,
        '8 12',
      ),
      circle(origin.x, origin.y, 21, phase === 2 ? 1 - recover : 0.85, 'accent', 5, 0.1),
      ...shots.map((shot) =>
        circle(shot.x, shot.y, shot.radius, shot.active ? 0.98 : 0, 'signal', 6, 0.45),
      ),
      circle(
        origin.x,
        origin.y,
        34,
        phase === 1
          ? Math.max(
              ...spec.releases.map((release) =>
                pulse(clamp(Math.abs(frame.time - release) / 0.16)),
              ),
            ) * 0.8
          : 0,
        'signal',
        7,
      ),
    ];
  }
  if (mode === 'directional-shield') {
    const guarded = frame.time >= BLUEPRINT_PHASE_ENDS[0] && frame.time < spec.guardEnd;
    const arcStart = spec.guardAngle - spec.guardHalfAngle;
    const arcEnd = spec.guardAngle + spec.guardHalfAngle;
    const frontFlash = strikePulse(frame.time, spec.frontStrike);
    const sideFlash = strikePulse(frame.time, spec.sideStrike);
    const leftEdge = polar(boss, 160, arcStart);
    const rightEdge = polar(boss, 160, arcEnd);
    return [
      path(
        `M ${boss.x} ${boss.y} L ${leftEdge.x} ${leftEdge.y} A 160 160 0 0 1 ${rightEdge.x} ${rightEdge.y} Z`,
        guarded ? 0.34 : phase === 0 ? 0.12 + prepare * 0.16 : 0,
        'accent',
        2,
        0.05,
        '9 11',
      ),
      path(
        arcPath(boss, 80, arcStart, arcEnd),
        guarded ? 0.98 : phase === 0 ? 0.3 + prepare * 0.5 : 0,
        'accent',
        11,
      ),
      path(
        `M ${boss.x - 37} ${boss.y + 12} Q ${boss.x} ${boss.y - 2} ${boss.x + 37} ${boss.y + 12} L ${boss.x + 31} ${boss.y + 61} Q ${boss.x} ${boss.y + 80} ${boss.x - 31} ${boss.y + 61} Z`,
        phase === 0 ? 0.45 + prepare * 0.42 : phase === 1 ? 0.9 : 0.55,
        'accent',
        5,
        0.36,
      ),
      line(player.x, player.y - 35, boss.x, boss.y + 60, frontFlash, 'signal', 6),
      circle(boss.x, boss.y + 60, 18 + frontFlash * 19, frontFlash, 'signal', 7),
      line(player.x - 35, player.y, boss.x + 47, boss.y, sideFlash, 'signal', 6),
      circle(boss.x + 47, boss.y, 14 + sideFlash * 19, sideFlash, 'signal', 7),
    ];
  }
  if (mode === 'damage-type-resistance') {
    const slashFlash = strikePulse(frame.time, spec.slashStrike);
    const thrustFlash = strikePulse(frame.time, spec.thrustStrike);
    const slashRecorded = frame.time >= spec.slashStrike ? 1 : 0;
    const thrustRecorded = frame.time >= spec.thrustStrike ? 1 : 0;
    return [
      circle(boss.x, boss.y, 79, 0.42 + 0.12 * Math.sin(frame.time * 2), 'accent', 4, 0, '7 8'),
      path(
        `M ${player.x - 10} ${player.y - 62} Q ${boss.x + 100} ${boss.y - 88} ${boss.x + 45} ${boss.y - 10}`,
        slashFlash,
        'accent',
        10,
      ),
      circle(boss.x + 45, boss.y - 10, 10 + slashFlash * 8, slashFlash, 'muted', 4),
      line(player.x - 28, player.y, boss.x + 45, boss.y - 10, thrustFlash, 'signal', 9),
      circle(boss.x + 45, boss.y - 10, 16 + thrustFlash * 20, thrustFlash, 'signal', 7),
      rect(350, 302, 100, 12, 0.36, 'muted', 0.06),
      rect(350, 302, 20 * slashRecorded, 12, slashRecorded, 'accent', 0.8),
      rect(350, 332, 100, 12, 0.36, 'muted', 0.06),
      rect(350, 332, 100 * thrustRecorded, 12, thrustRecorded, 'signal', 0.8),
      line(328, 301, 338, 315, 0.72, 'accent', 5),
      line(328, 338, 340, 338, 0.72, 'signal', 5),
    ];
  }
  if (mode === 'situational-immunity') {
    const protectedBoss = situationalImmunityOutcome(frame.time) === 'immune';
    const blockedFlash = strikePulse(frame.time, spec.blockedStrike);
    const wardFlash = strikePulse(frame.time, spec.wardStrike);
    const openFlash = strikePulse(frame.time, spec.openStrike);
    const ward = point(spec.ward);
    return [
      circle(boss.x, boss.y, 88, protectedBoss ? 0.8 : 0.08, 'accent', 9, 0.1, '9 8'),
      circle(ward.x, ward.y, 25, protectedBoss ? 0.8 : 0.18, 'accent', 5, 0.15),
      line(
        ward.x - 9,
        ward.y - 10,
        ward.x + 9,
        ward.y + 10,
        protectedBoss ? 0.9 : 0.16,
        'accent',
        6,
      ),
      line(
        ward.x + 9,
        ward.y - 10,
        ward.x - 9,
        ward.y + 10,
        protectedBoss ? 0.9 : 0.16,
        'accent',
        6,
      ),
      line(
        ward.x,
        ward.y + 25,
        boss.x + 64,
        boss.y - 35,
        protectedBoss ? 0.44 : 0.05,
        'accent',
        4,
        '7 8',
      ),
      line(player.x - 35, player.y - 12, boss.x + 80, boss.y - 12, blockedFlash, 'muted', 8),
      circle(boss.x + 80, boss.y - 12, 19 + blockedFlash * 15, blockedFlash, 'muted', 7),
      line(player.x - 23, player.y - 38, ward.x, ward.y, wardFlash, 'signal', 8),
      circle(ward.x, ward.y, 16 + wardFlash * 17, wardFlash, 'signal', 7),
      line(player.x - 35, player.y - 12, boss.x + 38, boss.y - 12, openFlash, 'signal', 8),
      circle(boss.x + 38, boss.y - 12, 18 + openFlash * 19, openFlash, 'signal', 7),
    ];
  }
  if (mode === 'part-break') {
    const launcher = point(spec.launcher);
    const detached = { x: 446, y: 560 };
    const falling = smooth((frame.time - spec.breakAt) / 0.42);
    const repairing = smooth((frame.time - spec.repairStart) / (spec.repairEnd - spec.repairStart));
    const part =
      frame.time < spec.breakAt
        ? launcher
        : frame.time < spec.repairStart
          ? { x: mix(launcher.x, detached.x, falling), y: mix(launcher.y, detached.y, falling) }
          : {
              x: mix(detached.x, launcher.x, repairing),
              y: mix(detached.y, launcher.y, repairing),
            };
    const liveShot = frame.time >= spec.firstShot[0] && frame.time < spec.firstShot[1];
    const breakFlash = strikePulse(frame.time, spec.breakAt);
    const failedShot = strikePulse(frame.time, spec.secondAttempt, 0.3);
    return [
      line(boss.x + 31, boss.y - 4, launcher.x, launcher.y, 0.75, 'muted', 8),
      circle(launcher.x, launcher.y, 17, partBreakCanFire(frame.time) ? 0.55 : 0.36, 'accent', 5),
      path(
        `M ${part.x - 20} ${part.y - 27} L ${part.x + 16} ${part.y - 24} L ${part.x + 28} ${part.y} L ${part.x + 14} ${part.y + 25} L ${part.x - 20} ${part.y + 24} L ${part.x - 28} ${part.y} Z`,
        0.94,
        partBreakCanFire(frame.time) ? 'accent' : 'muted',
        6,
        0.27,
      ),
      circle(part.x, part.y, 10, 0.9, partBreakCanFire(frame.time) ? 'signal' : 'muted', 4, 0.55),
      line(
        launcher.x + 28,
        launcher.y,
        spec.shotEnd[0],
        spec.shotEnd[1],
        frame.time < spec.firstShot[0] ? 0.16 + 0.3 * prepare : 0,
        'accent',
        5,
        '10 11',
      ),
      line(
        launcher.x + 28,
        launcher.y,
        spec.shotEnd[0],
        spec.shotEnd[1],
        liveShot ? 0.95 : 0,
        'signal',
        spec.beamHalfWidth * 2,
      ),
      line(player.x - 24, player.y - 34, launcher.x, launcher.y, breakFlash, 'signal', 8),
      circle(launcher.x, launcher.y, 19 + breakFlash * 20, breakFlash, 'signal', 7),
      circle(launcher.x, launcher.y, 14 + failedShot * 14, failedShot, 'muted', 5),
    ];
  }
  if (mode === 'attack-reflection') {
    const outgoing = frame.time >= spec.outgoing[0] && frame.time < spec.outgoing[1];
    const reflected = frame.time >= spec.reflected[0] && frame.time < spec.reflected[1];
    const outgoingProgress = clamp(
      (frame.time - spec.outgoing[0]) / (spec.outgoing[1] - spec.outgoing[0]),
    );
    const reflectedProgress = clamp(
      (frame.time - spec.reflected[0]) / (spec.reflected[1] - spec.reflected[0]),
    );
    const lower =
      smooth((frame.time - spec.mirrorLowered) / 0.25) *
      (1 - smooth((frame.time - spec.mirrorRaised) / 0.35));
    const mirror = { x: spec.mirror[0], y: spec.mirror[1] + 92 * lower };
    const returnedX = mix(spec.mirror[0], 545, reflectedProgress);
    const impact = strikePulse(frame.time, spec.outgoing[1], 0.24);
    const swordHit = strikePulse(frame.time, spec.meleeStrike, 0.3);
    return [
      line(
        spec.swordBoltStart[0],
        spec.swordBoltStart[1],
        mirror.x,
        spec.mirror[1],
        0.2,
        'accent',
        4,
        '8 12',
      ),
      path(
        `M ${mirror.x - 20} ${mirror.y - 37} L ${mirror.x + 15} ${mirror.y - 30} L ${mirror.x + 24} ${mirror.y} L ${mirror.x + 15} ${mirror.y + 30} L ${mirror.x - 20} ${mirror.y + 37} L ${mirror.x - 28} ${mirror.y} Z`,
        0.88,
        frame.time < spec.mirrorLowered || frame.time >= spec.mirrorRaised ? 'accent' : 'muted',
        7,
        0.26,
      ),
      circle(mirror.x, mirror.y, 13, 0.88, 'signal', 5, 0.27),
      circle(
        mix(spec.swordBoltStart[0], spec.mirror[0], outgoingProgress),
        spec.mirror[1],
        11,
        outgoing ? 0.95 : 0,
        'accent',
        6,
        0.33,
      ),
      circle(spec.mirror[0], spec.mirror[1], 20 + impact * 22, impact, 'signal', 6),
      line(
        spec.mirror[0],
        spec.mirror[1],
        returnedX,
        spec.mirror[1],
        reflected ? 0.55 : 0,
        'signal',
        6,
      ),
      circle(returnedX, spec.mirror[1], spec.boltRadius, reflected ? 0.97 : 0, 'signal', 6, 0.32),
      line(player.x - 25, player.y - 28, boss.x + 46, boss.y - 19, swordHit, 'accent', 8),
      circle(boss.x + 46, boss.y - 19, 17 + 16 * swordHit, swordHit, 'signal', 6),
    ];
  }
  if (mode === 'counter-stance') {
    const guarded =
      (frame.time >= spec.firstGuard[0] && frame.time < spec.firstGuard[1]) ||
      (frame.time >= spec.secondGuard[0] && frame.time < spec.secondGuard[1]);
    const firstRaised =
      smooth((frame.time - 0.42) / 0.3) * (1 - smooth((frame.time - spec.firstGuard[1]) / 0.24));
    const secondRaised =
      smooth((frame.time - 3.28) / 0.3) * (1 - smooth((frame.time - spec.secondGuard[1]) / 0.24));
    const guardOpacity = 0.28 + 0.66 * Math.max(firstRaised, secondRaised);
    const parryFlash = strikePulse(frame.time, spec.parriedStrike, 0.3);
    const counterPreview = frame.time >= spec.firstGuard[1] && frame.time < spec.riposte[0];
    const counterLive = frame.time >= spec.riposte[0] && frame.time < spec.riposte[1];
    const openHit = strikePulse(frame.time, spec.openStrike, 0.3);
    return [
      path(
        `M 328 375 L 355 388 L 360 425 L 346 454 L 324 443 L 336 420 Z`,
        guardOpacity,
        guarded ? 'accent' : 'muted',
        7,
        0.29,
      ),
      circle(344, 416, 14, guardOpacity, 'signal', 5, 0.25),
      line(player.x - 27, player.y - 30, 345, 421, parryFlash, 'accent', 8),
      circle(345, 421, 18 + 19 * parryFlash, parryFlash, 'signal', 6),
      line(
        spec.counterStart[0],
        spec.counterStart[1],
        spec.counterEnd[0],
        spec.counterEnd[1],
        counterPreview ? 0.45 : 0,
        'accent',
        5,
        '9 10',
      ),
      line(
        spec.counterStart[0],
        spec.counterStart[1],
        spec.counterEnd[0],
        spec.counterEnd[1],
        counterLive ? 0.92 : 0,
        'signal',
        spec.counterHalfWidth * 2,
      ),
      line(player.x - 28, player.y - 32, 344, 416, openHit, 'accent', 8),
      circle(344, 416, 17 + openHit * 17, openHit, 'signal', 6),
    ];
  }
  if (mode === 'absorption-power-up') {
    const core = point(spec.core);
    const charge = absorptionCharge(frame.time);
    const accepting = frame.time >= 0.6 && frame.time < spec.chargeWindup;
    const primed = frame.time >= spec.chargeWindup && frame.time < spec.spentAt;
    const firstTravel = frame.time >= spec.firstPulse[0] && frame.time < spec.firstPulse[1];
    const secondTravel = frame.time >= spec.secondPulse[0] && frame.time < spec.secondPulse[1];
    const firstProgress = smooth(
      (frame.time - spec.firstPulse[0]) / (spec.firstPulse[1] - spec.firstPulse[0]),
    );
    const secondProgress = smooth(
      (frame.time - spec.secondPulse[0]) / (spec.secondPulse[1] - spec.secondPulse[0]),
    );
    const absorbFlash = Math.max(
      strikePulse(frame.time, spec.firstPulse[1], 0.26),
      strikePulse(frame.time, spec.secondPulse[1], 0.26),
    );
    const preview = frame.time >= spec.chargeWindup && frame.time < spec.shockwave[0];
    const live = frame.dangerActive;
    const openHit = strikePulse(frame.time, spec.openStrike, 0.3);
    return [
      circle(
        core.x,
        core.y,
        30,
        accepting || primed ? 0.94 : 0.34,
        accepting || primed ? 'accent' : 'muted',
        6,
        0.1,
      ),
      circle(core.x - 10, core.y - 4, 6, charge >= 1 ? 0.96 : 0.25, 'signal', 3, 0.52),
      circle(core.x + 10, core.y - 4, 6, charge >= 2 ? 0.96 : 0.25, 'signal', 3, 0.52),
      line(
        spec.swordStart[0],
        spec.swordStart[1],
        core.x,
        core.y,
        firstTravel ? 0.3 : 0,
        'accent',
        3,
        '7 9',
      ),
      circle(
        mix(spec.swordStart[0], core.x, firstProgress),
        mix(spec.swordStart[1], core.y, firstProgress),
        10,
        firstTravel ? 0.96 : 0,
        'accent',
        4,
        0.3,
      ),
      line(
        spec.swordStart[0],
        spec.swordStart[1],
        core.x,
        core.y,
        secondTravel ? 0.3 : 0,
        'accent',
        3,
        '7 9',
      ),
      circle(
        mix(spec.swordStart[0], core.x, secondProgress),
        mix(spec.swordStart[1], core.y, secondProgress),
        10,
        secondTravel ? 0.96 : 0,
        'accent',
        4,
        0.3,
      ),
      circle(core.x, core.y, 30 + 19 * absorbFlash, absorbFlash, 'signal', 5),
      circle(boss.x, boss.y, spec.shockwaveRadius, preview ? 0.48 : 0, 'accent', 4, 0.08, '10 10'),
      circle(boss.x, boss.y, spec.shockwaveRadius, live ? 0.88 : 0, 'signal', 9, 0.16),
      line(player.x - 28, player.y - 31, core.x, core.y, openHit, 'accent', 8),
      circle(core.x, core.y, 17 + 17 * openHit, openHit, 'signal', 5),
    ];
  }
  if (mode === 'interruptible-wind-up') {
    const firstOpen = frame.time >= spec.firstWindup[0] && frame.time < spec.interruptAt;
    const secondOpen = frame.time >= spec.secondWindup[0] && frame.time < spec.release[0];
    const interrupted = frame.time >= spec.interruptAt && frame.time < spec.staggerEnd;
    const preview = firstOpen || secondOpen;
    const live = frame.dangerActive;
    const firstProgress = clamp(
      (frame.time - spec.firstWindup[0]) / (spec.firstWindup[1] - spec.firstWindup[0]),
    );
    const secondProgress = clamp(
      (frame.time - spec.secondWindup[0]) / (spec.release[0] - spec.secondWindup[0]),
    );
    const gaugeProgress = firstOpen ? firstProgress : secondOpen ? secondProgress : 0;
    const interruptFlash = strikePulse(frame.time, spec.interruptAt, 0.34);
    return [
      circle(boss.x, boss.y, spec.threatRadius, preview ? 0.5 : 0, 'accent', 4, 0.07, '10 10'),
      circle(boss.x, boss.y, spec.threatRadius, live ? 0.9 : 0, 'signal', 10, 0.17),
      rect(boss.x - 58, boss.y - 118, 116, 16, preview ? 0.88 : 0, 'muted', 0.14),
      rect(boss.x - 54, boss.y - 114, 108 * gaugeProgress, 8, preview ? 0.96 : 0, 'accent', 0.75),
      line(player.x - 28, player.y - 31, boss.x + 42, boss.y - 4, interruptFlash, 'accent', 9),
      circle(boss.x + 42, boss.y - 4, 17 + 21 * interruptFlash, interruptFlash, 'signal', 6),
      path(
        `M ${boss.x} ${boss.y - 88} L ${boss.x + 20} ${boss.y - 68} L ${boss.x} ${boss.y - 48} L ${boss.x - 20} ${boss.y - 68} Z M ${boss.x} ${boss.y - 82} L ${boss.x} ${boss.y - 54}`,
        preview ? 0.92 : 0,
        'accent',
        6,
      ),
      path(
        `M ${boss.x - 20} ${boss.y - 70} L ${boss.x + 20} ${boss.y - 30} M ${boss.x + 20} ${boss.y - 70} L ${boss.x - 20} ${boss.y - 30}`,
        interrupted ? 0.88 : 0,
        'safe',
        8,
      ),
    ];
  }
  if (mode === 'loadout-adaptation') {
    const reachEquipped = frame.time < spec.swapAt;
    const burstEquipped = frame.time >= spec.swapAt && frame.time < spec.recoveryEnd;
    const readingReach = frame.time >= spec.reachSnapshot[0] && frame.time < spec.reachSnapshot[1];
    const readingBurst = frame.time >= spec.burstSnapshot[0] && frame.time < spec.burstSnapshot[1];
    const reachCopied = frame.time >= spec.reachCopiedAt && frame.time < spec.reachRecoveryEnd;
    const burstCopied = frame.time >= spec.burstCopiedAt && frame.time < spec.recoveryEnd;
    const reachPreview = frame.time >= spec.reachCopiedAt && frame.time < spec.reachAttack[0];
    const burstPreview = frame.time >= spec.burstCopiedAt && frame.time < spec.burstAttack[0];
    const copyFlash = Math.max(
      strikePulse(frame.time, spec.reachCopiedAt, 0.34),
      strikePulse(frame.time, spec.burstCopiedAt, 0.34),
    );
    return [
      line(
        player.x,
        player.y - 30,
        boss.x,
        boss.y - 30,
        readingReach || readingBurst ? 0.82 : 0,
        'accent',
        5,
        '10 9',
      ),
      path(
        `M ${player.x - 30} ${player.y - 72} L ${player.x + 30} ${player.y - 72} M ${player.x + 12} ${player.y - 84} L ${player.x + 30} ${player.y - 72} L ${player.x + 12} ${player.y - 60}`,
        reachEquipped ? 0.88 : 0,
        'safe',
        6,
      ),
      path(
        `M ${boss.x - 34} ${boss.y - 65} L ${boss.x + 34} ${boss.y - 65} M ${boss.x + 14} ${boss.y - 79} L ${boss.x + 34} ${boss.y - 65} L ${boss.x + 14} ${boss.y - 51}`,
        reachCopied ? 0.9 : 0,
        'accent',
        7,
      ),
      line(
        boss.x + 38,
        boss.y,
        spec.reachEnd[0],
        spec.reachEnd[1],
        reachPreview ? 0.52 : 0,
        'accent',
        8,
        '12 10',
      ),
      line(
        boss.x + 38,
        boss.y,
        spec.reachEnd[0],
        spec.reachEnd[1],
        frame.reachDanger ? 0.94 : 0,
        'signal',
        spec.reachHalfWidth * 2,
      ),
      circle(player.x, player.y - 72, 24, burstEquipped ? 0.86 : 0, 'safe', 6, 0.08),
      circle(boss.x, boss.y - 65, 24, burstCopied ? 0.9 : 0, 'accent', 7, 0.12),
      circle(boss.x, boss.y, spec.burstRadius, burstPreview ? 0.5 : 0, 'accent', 4, 0.07, '10 10'),
      circle(boss.x, boss.y, spec.burstRadius, frame.burstDanger ? 0.9 : 0, 'signal', 10, 0.17),
      circle(boss.x, boss.y - 65, 27 + 18 * copyFlash, copyFlash, 'signal', 5),
    ];
  }
  if (mode === 'wind-up') {
    const state = windUpState(frame.time);
    const progress = windUpProgress(frame.time);
    const winding = state === 'short-wind-up' || state === 'held-wind-up' || state === 'held-ready';
    const ready = progress >= 1 || state === 'held-ready';
    const releaseFlash = Math.max(
      strikePulse(frame.time, spec.firstRelease[0], 0.34),
      strikePulse(frame.time, spec.secondRelease[0], 0.34),
    );
    const rune = (offset, threshold) => {
      const x = boss.x + offset;
      return path(
        `M ${x} ${boss.y - 92} L ${x + 11} ${boss.y - 79} L ${x} ${boss.y - 66} L ${x - 11} ${boss.y - 79} Z`,
        winding && progress >= threshold ? 0.92 : winding ? 0.2 : 0,
        progress >= threshold ? 'accent' : 'muted',
        5,
        progress >= threshold ? 0.2 : 0,
      );
    };
    return [
      line(
        boss.x + 38,
        boss.y,
        spec.laneEnd[0],
        spec.laneEnd[1],
        winding ? 0.5 : 0,
        'accent',
        7,
        '12 10',
      ),
      line(
        boss.x + 38,
        boss.y,
        spec.laneEnd[0],
        spec.laneEnd[1],
        frame.dangerActive ? 0.95 : 0,
        'signal',
        spec.laneHalfWidth * 2,
      ),
      rune(-34, 0.12),
      rune(0, 0.45),
      rune(34, 0.78),
      circle(boss.x, boss.y - 79, 57, ready ? 0.78 : 0, 'safe', 5, 0.04, '8 9'),
      circle(boss.x + 42, boss.y, 18 + releaseFlash * 24, releaseFlash, 'signal', 8),
      line(
        boss.x - 62,
        boss.y + 66,
        boss.x + 62,
        boss.y + 66,
        frame.dangerActive ? 0.78 : 0,
        'muted',
        8,
        '10 8',
      ),
    ];
  }
  if (mode === 'attack-lock') {
    const state = frame.attackLockState;
    const tracking = state === 'tracking-first' || state === 'tracking-second';
    const locked =
      state === 'locked-first' ||
      state === 'released-first' ||
      state === 'recovery-first' ||
      state === 'locked-second' ||
      state === 'released-second' ||
      state === 'recovery-second';
    const lockFlash = Math.max(
      strikePulse(frame.time, spec.firstLock, 0.34),
      strikePulse(frame.time, spec.secondLock, 0.34),
    );
    return [
      line(
        boss.x,
        boss.y,
        frame.attackLockEnd.x,
        frame.attackLockEnd.y,
        tracking ? 0.5 : 0,
        'accent',
        5,
        '8 10',
      ),
      line(
        boss.x,
        boss.y,
        frame.attackLockEnd.x,
        frame.attackLockEnd.y,
        locked && !frame.dangerActive ? 0.72 : 0,
        'safe',
        7,
        '14 8',
      ),
      line(
        boss.x,
        boss.y,
        frame.attackLockEnd.x,
        frame.attackLockEnd.y,
        frame.dangerActive ? 0.92 : 0,
        'signal',
        spec.laneHalfWidth * 2,
      ),
      circle(
        frame.attackLockTarget.x,
        frame.attackLockTarget.y,
        28,
        tracking ? 0.58 : locked ? 0.88 : 0,
        locked ? 'safe' : 'accent',
        5,
        0.05,
        tracking ? '7 8' : '',
      ),
      path(
        `M ${frame.attackLockTarget.x - 13} ${frame.attackLockTarget.y} L ${frame.attackLockTarget.x + 13} ${frame.attackLockTarget.y} M ${frame.attackLockTarget.x} ${frame.attackLockTarget.y - 13} L ${frame.attackLockTarget.x} ${frame.attackLockTarget.y + 13}`,
        tracking || locked ? 0.86 : 0,
        locked ? 'safe' : 'accent',
        5,
      ),
      circle(
        frame.attackLockTarget.x,
        frame.attackLockTarget.y,
        31 + lockFlash * 18,
        lockFlash,
        'signal',
        6,
      ),
      circle(boss.x, boss.y, 22, tracking || locked ? 0.88 : 0, 'accent', 5, 0.12),
    ];
  }
  if (mode === 'active-phase') {
    const state = frame.activePhaseState;
    const startup = state === 'startup';
    const activeWindow = state === 'active';
    const inactiveMotion = state === 'follow-through' || state === 'recovery';
    const activeFlash =
      frame.time >= spec.active[0] ? Math.max(0, 1 - (frame.time - spec.active[0]) / 0.3) : 0;
    const inactiveFlash =
      frame.time >= spec.active[1] ? Math.max(0, 1 - (frame.time - spec.active[1]) / 0.34) : 0;
    const laneWidth = spec.laneEnd[0] - spec.laneStart[0];
    return [
      path(
        `M ${spec.laneStart[0]} ${spec.laneStart[1] - spec.laneHalfWidth} H ${spec.laneEnd[0]} V ${spec.laneEnd[1] + spec.laneHalfWidth} H ${spec.laneStart[0]} Z`,
        startup ? 0.58 : 0,
        'accent',
        5,
        0.04,
        '12 10',
      ),
      rect(
        spec.laneStart[0],
        spec.laneStart[1] - spec.laneHalfWidth,
        laneWidth,
        spec.laneHalfWidth * 2,
        activeWindow ? 0.94 : 0,
        'signal',
        0.34,
      ),
      line(
        spec.laneStart[0],
        spec.laneStart[1],
        spec.laneEnd[0],
        spec.laneEnd[1],
        inactiveMotion ? 0.72 : 0,
        'safe',
        7,
        '15 9',
      ),
      line(
        spec.laneStart[0],
        spec.laneStart[1] - 44,
        spec.laneStart[0],
        spec.laneStart[1] + 44,
        startup || activeWindow ? 0.8 : 0,
        activeWindow ? 'signal' : 'accent',
        activeWindow ? 8 : 5,
      ),
      line(
        spec.laneEnd[0],
        spec.laneEnd[1] - 44,
        spec.laneEnd[0],
        spec.laneEnd[1] + 44,
        startup || activeWindow ? 0.8 : 0,
        activeWindow ? 'signal' : 'accent',
        activeWindow ? 8 : 5,
      ),
      circle(spec.laneStart[0], spec.laneStart[1], 18 + activeFlash * 24, activeFlash, 'signal', 7),
      circle(
        spec.laneEnd[0],
        spec.laneEnd[1],
        18 + inactiveFlash * 20,
        inactiveFlash,
        'safe',
        6,
        0,
        '7 7',
      ),
    ];
  }
  if (mode === 'recovery') {
    const state = frame.recoveryState;
    const startup = state === 'startup';
    const activeWindow = state === 'active';
    const recoveryOpen = state === 'approach-window' || state === 'punish-window';
    const laneWidth = spec.laneEnd[0] - spec.laneStart[0];
    const recoveryStartFlash =
      frame.time >= spec.recovery[0] ? Math.max(0, 1 - (frame.time - spec.recovery[0]) / 0.34) : 0;
    const readyFlash =
      frame.time >= spec.recovery[1] ? Math.max(0, 1 - (frame.time - spec.recovery[1]) / 0.34) : 0;
    const recoveryProgress = recoveryOpen
      ? clamp((frame.time - spec.recovery[0]) / (spec.recovery[1] - spec.recovery[0]))
      : state === 'boss-ready' || state === 'reset'
        ? 1
        : 0;
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    return [
      path(
        `M ${spec.laneStart[0]} ${spec.laneStart[1] - spec.laneHalfWidth} H ${spec.laneEnd[0]} V ${spec.laneEnd[1] + spec.laneHalfWidth} H ${spec.laneStart[0]} Z`,
        startup ? 0.58 : 0,
        'accent',
        5,
        0.04,
        '12 10',
      ),
      rect(
        spec.laneStart[0],
        spec.laneStart[1] - spec.laneHalfWidth,
        laneWidth,
        spec.laneHalfWidth * 2,
        activeWindow ? 0.94 : 0,
        'signal',
        0.34,
      ),
      circle(boss.x, boss.y, spec.punishReach, recoveryOpen ? 0.7 : 0, 'safe', 6, 0.04, '13 10'),
      circle(
        boss.x,
        boss.y,
        mix(86, 42, recoveryProgress),
        recoveryOpen ? 0.88 : 0,
        'accent',
        7,
        0.03,
        '10 8',
      ),
      circle(boss.x, boss.y, 45 + recoveryStartFlash * 25, recoveryStartFlash, 'safe', 7),
      circle(boss.x, boss.y, 45 + readyFlash * 25, readyFlash, 'signal', 7),
      line(frame.player.x, frame.player.y, boss.x, boss.y, strike, 'safe', 9),
      circle(boss.x + 35, boss.y - 4, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'survival-phase') {
    const survivalOpen = frame.time >= spec.survival[0] && frame.time < spec.shieldDropsAt;
    const survivalProgress = clamp(
      (frame.time - spec.survival[0]) / (spec.shieldDropsAt - spec.survival[0]),
    );
    const completionFlash =
      frame.time >= spec.shieldDropsAt
        ? Math.max(0, 1 - (frame.time - spec.shieldDropsAt) / 0.42)
        : 0;
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    return [
      circle(boss.x, boss.y, 76, survivalOpen ? 0.9 : 0, 'accent', 8, 0.08, '8 7'),
      circle(
        boss.x,
        boss.y,
        mix(118, 48, survivalProgress),
        survivalOpen ? 0.78 : 0,
        'safe',
        6,
        0.02,
        '12 9',
      ),
      ...spec.hazards.map(({ center, preview: previewWindow, active }) => {
        const previewing = frame.time >= previewWindow[0] && frame.time < active[0];
        const activeNow = frame.time >= active[0] && frame.time < active[1];
        const buildup = clamp((frame.time - previewWindow[0]) / (active[0] - previewWindow[0]));
        return circle(
          center[0],
          center[1],
          activeNow ? spec.hazardRadius : mix(38, spec.hazardRadius, buildup),
          activeNow ? 0.94 : previewing ? 0.68 : 0,
          activeNow ? 'signal' : 'accent',
          activeNow ? 12 : 5,
          activeNow ? 0.3 : 0.04,
          activeNow ? '' : '10 9',
        );
      }),
      circle(boss.x, boss.y, 58 + completionFlash * 34, completionFlash, 'safe', 8),
      line(frame.player.x, frame.player.y, boss.x, boss.y, strike, 'safe', 9),
      circle(boss.x + 35, boss.y - 4, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'teleport') {
    const origin = point(spec.boss);
    const destination = point(spec.destination);
    const departureProgress = clamp(
      (frame.time - spec.departure[0]) / (spec.departure[1] - spec.departure[0]),
    );
    const destinationProgress = clamp(
      (frame.time - spec.destinationPreview[0]) /
        (spec.destinationPreview[1] - spec.destinationPreview[0]),
    );
    const sourceVisible = frame.time >= spec.departure[0] && frame.time < spec.arrival[0];
    const destinationVisible =
      frame.time >= spec.destinationPreview[0] && frame.time < spec.recoveryEnd;
    const followUpVisible = frame.time >= spec.followUpPreview[0] && frame.time < spec.active[0];
    const activeWindow = frame.time >= spec.active[0] && frame.time < spec.active[1];
    const arrivalFlash = strikePulse(frame.time, spec.arrival[1], 0.34);
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    return [
      circle(
        origin.x,
        origin.y,
        mix(48, 94, departureProgress),
        sourceVisible ? 0.78 * (1 - departureProgress * 0.55) : 0,
        'accent',
        7,
        0.03,
        '10 8',
      ),
      circle(
        destination.x,
        destination.y,
        mix(112, 70, destinationProgress),
        destinationVisible ? 0.82 : 0,
        'safe',
        6,
        0.03,
        '12 9',
      ),
      circle(
        destination.x,
        destination.y,
        42,
        destinationVisible ? 0.44 + destinationProgress * 0.4 : 0,
        'accent',
        5,
        0.06,
      ),
      path(
        `M ${destination.x - 30} ${destination.y} L ${destination.x + 30} ${destination.y} M ${destination.x} ${destination.y - 30} L ${destination.x} ${destination.y + 30}`,
        destinationVisible ? 0.5 + destinationProgress * 0.38 : 0,
        'safe',
        6,
      ),
      rect(
        spec.laneStart[0] - spec.laneHalfWidth,
        spec.laneStart[1],
        spec.laneHalfWidth * 2,
        spec.laneEnd[1] - spec.laneStart[1],
        followUpVisible ? 0.68 : 0,
        'accent',
        0.08,
      ),
      rect(
        spec.laneStart[0] - spec.laneHalfWidth,
        spec.laneStart[1],
        spec.laneHalfWidth * 2,
        spec.laneEnd[1] - spec.laneStart[1],
        activeWindow ? 0.94 : 0,
        'signal',
        0.34,
      ),
      circle(destination.x, destination.y, 56 + arrivalFlash * 34, arrivalFlash, 'safe', 8),
      line(frame.player.x, frame.player.y, boss.x, boss.y, strike, 'safe', 9),
      circle(boss.x + 34, boss.y - 4, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'boundary-attack') {
    const signalProgress = clamp((frame.time - spec.signal[0]) / (spec.active[0] - spec.signal[0]));
    const signalVisible = frame.time >= spec.signal[0] && frame.time < spec.active[0];
    const activeWindow = frame.time >= spec.active[0] && frame.time < spec.active[1];
    const impact = strikePulse(frame.time, spec.impactAt, 0.34);
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    const resetVisible = frame.time >= spec.openingEnd;
    return [
      rect(
        spec.leftBoundary,
        400,
        spec.rightBoundary - spec.leftBoundary,
        380,
        0.45,
        'muted',
        0.02,
      ),
      circle(
        spec.leftBoundary,
        spec.laneStart[1],
        mix(34, 78, signalProgress),
        signalVisible ? 0.82 : activeWindow ? 0.34 : 0.16,
        activeWindow ? 'signal' : 'accent',
        activeWindow ? 10 : 6,
        0.04,
        signalVisible ? '10 8' : '',
      ),
      rect(
        spec.leftBoundary,
        spec.laneStart[1] - spec.laneHalfWidth,
        spec.rightBoundary - spec.leftBoundary,
        spec.laneHalfWidth * 2,
        signalVisible ? 0.68 : 0,
        'accent',
        0.08,
      ),
      rect(
        spec.laneStart[0],
        spec.laneStart[1] - spec.laneHalfWidth,
        spec.laneEnd[0] - spec.laneStart[0],
        spec.laneHalfWidth * 2,
        activeWindow ? 0.94 : 0,
        'signal',
        0.32,
      ),
      path(
        `M 18 ${spec.laneStart[1] - 54} L 46 ${spec.laneStart[1]} L 18 ${
          spec.laneStart[1] + 54
        } M 42 ${spec.laneStart[1] - 54} L 70 ${spec.laneStart[1]} L 42 ${spec.laneStart[1] + 54}`,
        signalVisible ? 0.48 + 0.42 * signalProgress : activeWindow ? 0.92 : 0,
        activeWindow ? 'signal' : 'accent',
        8,
      ),
      circle(spec.rightBoundary, spec.laneEnd[1], 42 + impact * 42, impact, 'signal', 9, 0.08),
      path(
        `M ${spec.rightBoundary} ${spec.laneEnd[1]} L 525 270 L 35 270 L ${
          spec.leftBoundary
        } ${spec.laneStart[1]}`,
        resetVisible ? 0.42 : 0,
        'muted',
        5,
        0,
        '12 12',
      ),
      line(frame.player.x, frame.player.y, boss.x, boss.y, strike, 'safe', 9),
      circle(boss.x - 34, boss.y - 4, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'forced-scrolling') {
    const signalProgress = clamp((frame.time - spec.signal[0]) / (spec.active[0] - spec.signal[0]));
    const signalVisible = frame.time >= spec.signal[0] && frame.time < spec.active[0];
    const scrolling = frame.time >= spec.active[0] && frame.time < spec.active[1];
    const offset = forcedScrollingOffset(frame.time);
    const resetProgress = smooth((frame.time - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    const platformY = (baseY) => {
      const wrapped = (((baseY - 380 + offset) % 520) + 520) % 520;
      return 380 + wrapped;
    };
    return [
      rect(58, 380, 444, 400, 0.45, 'muted', 0.02),
      circle(
        spec.stopRune[0],
        spec.stopRune[1],
        34 + 15 * Math.sin(frame.time * 3) ** 2,
        frame.time < spec.resetAt ? 0.78 : 0.78 * (1 - resetProgress),
        frame.time >= spec.active[1] ? 'safe' : 'accent',
        6,
        0.06,
        '9 8',
      ),
      rect(
        58,
        spec.hazardTop,
        444,
        50,
        signalVisible ? 0.54 + signalProgress * 0.24 : 0,
        'accent',
        0.08,
      ),
      rect(58, spec.hazardTop, 444, 50, scrolling ? 0.94 : 0, 'signal', 0.32),
      path(
        'M 92 690 L 92 640 M 74 658 L 92 640 L 110 658 M 468 690 L 468 640 M 450 658 L 468 640 L 486 658',
        signalVisible ? 0.45 + 0.45 * signalProgress : scrolling ? 0.9 : 0,
        scrolling ? 'signal' : 'accent',
        8,
      ),
      path(
        `M ${spec.route.map(([x, y]) => `${x} ${y}`).join(' L ')}`,
        frame.time < spec.active[1] ? 0.52 : 0.2,
        'accent',
        5,
        0,
        '11 10',
      ),
      ...spec.platforms.map(([x, y, width]) =>
        rect(x - width / 2, platformY(y), width, 18, scrolling ? 0.78 : 0.48, 'safe', 0.14),
      ),
      line(
        58,
        spec.hazardTop - 42,
        502,
        spec.hazardTop - 42,
        scrolling ? 0.52 : 0,
        'signal',
        4,
        '10 10',
      ),
      line(frame.player.x, frame.player.y, boss.x, boss.y, strike, 'safe', 9),
      circle(boss.x + 34, boss.y - 4, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'chase-herding') {
    const signalProgress = clamp((frame.time - spec.signal[0]) / (spec.active[0] - spec.signal[0]));
    const chaseProgress = clamp((frame.time - spec.active[0]) / (spec.active[1] - spec.active[0]));
    const signalVisible = frame.time >= spec.signal[0] && frame.time < spec.active[0];
    const chasing = frame.time >= spec.active[0] && frame.time < spec.active[1];
    const captured = frame.time >= spec.active[1] && frame.time < spec.resetAt;
    const strike = strikePulse(frame.time, spec.punishAt, 0.38);
    const capture = point(spec.captureZone);
    const innerOpacity = chasing ? 0.42 : signalVisible ? 0.28 + signalProgress * 0.2 : 0.12;
    const outerOpacity = chasing ? 0.72 : signalVisible ? 0.35 + signalProgress * 0.25 : 0.16;
    return [
      rect(58, 390, 444, 390, 0.45, 'muted', 0.02),
      path(
        `M ${spec.bossRoute.map(([x, y]) => `${x} ${y}`).join(' L ')}`,
        captured ? 0.22 : 0.58,
        'accent',
        6,
        0,
        '12 10',
      ),
      path(
        `M ${spec.playerRoute.map(([x, y]) => `${x} ${y}`).join(' L ')}`,
        chasing ? 0.5 : signalVisible ? 0.3 : 0.16,
        'safe',
        5,
        0,
        '10 10',
      ),
      path(
        `M ${capture.x - 56} ${capture.y - 48} L ${capture.x - 56} ${capture.y + 48} L ${
          capture.x + 56
        } ${capture.y + 48} L ${capture.x + 56} ${capture.y - 48}`,
        frame.time >= spec.signal[0] ? 0.78 : 0.2,
        captured ? 'safe' : 'accent',
        8,
      ),
      circle(
        capture.x,
        capture.y,
        spec.captureRadius,
        captured ? 0.9 : 0.48 + signalProgress * 0.25,
        captured ? 'safe' : 'accent',
        captured ? 9 : 6,
        captured ? 0.18 : 0.04,
        captured ? '' : '9 8',
      ),
      circle(frame.boss.x, frame.boss.y, spec.distanceBand[0], innerOpacity, 'signal', 4, 0, '8 8'),
      circle(
        frame.boss.x,
        frame.boss.y,
        spec.distanceBand[1],
        outerOpacity,
        'accent',
        5,
        0,
        '13 11',
      ),
      line(
        frame.player.x,
        frame.player.y,
        frame.boss.x,
        frame.boss.y,
        chasing ? 0.76 : signalVisible ? 0.45 : 0.2,
        frame.chaseInBand ? 'safe' : 'accent',
        5,
        '10 8',
      ),
      ...spec.checkpoints.map(([x, y], index) =>
        circle(
          x,
          y,
          13,
          signalVisible || chasing || captured ? 0.68 : 0.18,
          chaseProgress >= (index + 1) / spec.checkpoints.length ? 'safe' : 'accent',
          5,
          chaseProgress >= (index + 1) / spec.checkpoints.length ? 0.24 : 0.03,
        ),
      ),
      circle(spec.safePosition[0], spec.safePosition[1], 24, chasing ? 0.7 : 0.2, 'safe', 5, 0.06),
      line(frame.player.x, frame.player.y, frame.boss.x, frame.boss.y, strike, 'safe', 9),
      circle(frame.boss.x - 32, frame.boss.y - 5, 12 + strike * 24, strike, 'safe', 7, 0.12),
    ];
  }
  if (mode === 'landing') {
    const landing = point(spec.landing);
    const contact = phase === 1 ? clamp(1 - Math.abs(action - 0.52) / 0.2) : 0;
    return [
      path(
        `M ${spec.boss[0]} ${spec.boss[1]} Q 260 135 ${landing.x} ${landing.y}`,
        phase === 0 ? 0.32 + prepare * 0.28 : phase === 1 ? 0.24 * (1 - action) : 0,
        'accent',
        7,
        0,
        '12 12',
      ),
      circle(
        landing.x,
        landing.y,
        mix(46, 88, phase === 0 ? prepare : 1),
        phase === 0 ? 0.42 + prepare * 0.38 : phase === 1 ? 0.34 : 0,
        'accent',
        5,
        phase === 0 ? 0.06 : 0,
      ),
      circle(landing.x, landing.y, 88, contact, 'signal', 18, 0.24),
    ];
  }
  if (mode === 'single-shot') {
    const start = point(spec.boss);
    const end = point(spec.shotEnd);
    const head = {
      x: mix(start.x, end.x, action),
      y: mix(start.y, end.y, action),
    };
    return [
      line(
        start.x,
        start.y,
        end.x,
        end.y,
        phase === 0 ? 0.36 + prepare * 0.34 : phase === 1 ? 0.16 * (1 - action) : 0,
        'accent',
        7,
        '12 12',
      ),
      line(start.x, start.y, head.x, head.y, phase === 1 ? 0.42 : 0, 'signal', 8),
      circle(head.x, head.y, 20, phase === 1 ? 1 : 0, 'signal', 6, 0.48),
    ];
  }
  if (mode === 'crossfire') {
    const sources = spec.sources.map(point);
    const ends = spec.shotEnds.map(point);
    const heads = sources.map((source, index) => ({
      x: mix(source.x, ends[index].x, action),
      y: mix(source.y, ends[index].y, action),
    }));
    return [
      ...sources.map((source) =>
        circle(
          source.x,
          source.y,
          24,
          phase === 0 ? 0.45 + prepare * 0.4 : phase === 1 ? 0.34 : 0,
          'accent',
          5,
          0.14,
        ),
      ),
      ...sources.map((source, index) =>
        line(
          source.x,
          source.y,
          ends[index].x,
          ends[index].y,
          phase === 0 ? 0.28 + prepare * 0.42 : phase === 1 ? 0.12 * (1 - action) : 0,
          'accent',
          7,
          '12 12',
        ),
      ),
      ...heads.map((head) => circle(head.x, head.y, 19, phase === 1 ? 1 : 0, 'signal', 6, 0.48)),
    ];
  }
  if (mode === 'splitting-projectile') {
    const start = point(spec.boss);
    const split = point(spec.split);
    const fragmentEnds = spec.fragmentEnds.map(point);
    const splitAt = 0.42;
    const parentProgress = clamp(action / splitAt);
    const fragmentProgress = clamp((action - splitAt) / (1 - splitAt));
    const parent = {
      x: mix(start.x, split.x, parentProgress),
      y: mix(start.y, split.y, parentProgress),
    };
    const fragments = fragmentEnds.map((end) => ({
      x: mix(split.x, end.x, fragmentProgress),
      y: mix(split.y, end.y, fragmentProgress),
    }));
    const parentVisible = phase === 0 ? 0.72 : phase === 1 && action < splitAt ? 1 : 0;
    const fragmentsVisible = phase === 1 && action >= splitAt ? 1 : 0;
    return [
      line(
        start.x,
        start.y,
        split.x,
        split.y,
        phase === 0 ? 0.36 + prepare * 0.34 : phase === 1 ? 0.14 * (1 - parentProgress) : 0,
        'accent',
        7,
        '12 12',
      ),
      ...fragmentEnds.map((end) =>
        line(
          split.x,
          split.y,
          end.x,
          end.y,
          phase === 0 ? 0.22 + prepare * 0.34 : phase === 1 ? 0.1 * (1 - fragmentProgress) : 0,
          'accent',
          6,
          '10 12',
        ),
      ),
      circle(
        split.x,
        split.y,
        mix(26, 42, phase === 0 ? prepare : pulse(clamp((action - 0.3) / 0.24))),
        phase === 0 ? 0.5 + prepare * 0.34 : phase === 1 ? 0.65 * (1 - fragmentProgress) : 0,
        'safe',
        5,
        0.08,
      ),
      circle(parent.x, parent.y, 22, parentVisible, 'signal', 6, 0.48),
      ...fragments.map((fragment) =>
        circle(fragment.x, fragment.y, 16, fragmentsVisible, 'signal', 5, 0.42),
      ),
    ];
  }
  if (mode === 'returning-projectile') {
    const start = point(spec.boss);
    const turn = point(spec.turn);
    const returnControl = point(spec.returnControl);
    const turnAt = 0.52;
    const outgoingProgress = clamp(action / turnAt);
    const returnProgress = clamp((action - turnAt) / (1 - turnAt));
    const projectile =
      action < turnAt
        ? {
            x: mix(start.x, turn.x, outgoingProgress),
            y: mix(start.y, turn.y, outgoingProgress),
          }
        : quadraticPoint(turn, returnControl, start, returnProgress);
    return [
      line(
        start.x,
        start.y,
        turn.x,
        turn.y,
        phase === 0 ? 0.34 + prepare * 0.34 : phase === 1 ? 0.12 : 0,
        'accent',
        7,
        '12 12',
      ),
      path(
        `M ${turn.x} ${turn.y} Q ${returnControl.x} ${returnControl.y} ${start.x} ${start.y}`,
        phase === 0 ? 0.26 + prepare * 0.36 : phase === 1 ? 0.12 : 0,
        'safe',
        7,
        0,
        '10 12',
      ),
      circle(
        turn.x,
        turn.y,
        mix(24, 38, phase === 0 ? prepare : pulse(clamp((action - 0.42) / 0.2))),
        phase === 0 ? 0.46 + prepare * 0.34 : phase === 1 ? 0.58 * (1 - returnProgress) : 0,
        'safe',
        5,
        0.08,
      ),
      circle(projectile.x, projectile.y, 21, phase === 1 ? 1 : 0.7, 'signal', 6, 0.48),
    ];
  }
  if (mode === 'orbiting-projectiles') {
    const orbitRadius = phase === 2 ? mix(spec.orbitRadius, 78, recover) : spec.orbitRadius;
    const rotation = spec.startAngle + spec.rotation * action + (phase === 2 ? recover * 0.4 : 0);
    const orbitOpacity =
      phase === 0 ? 0.38 + prepare * 0.38 : phase === 1 ? 0.22 : 0.22 * (1 - recover);
    const projectileOpacity = phase === 0 ? 0.54 + prepare * 0.34 : phase === 1 ? 1 : 1 - recover;
    const projectiles = Array.from({ length: spec.projectileCount }, (_, index) =>
      polar(boss, orbitRadius, rotation + (index * Math.PI * 2) / spec.projectileCount),
    );
    return [
      circle(boss.x, boss.y, spec.orbitRadius, orbitOpacity, 'accent', 6, 0),
      path(
        arcPath(boss, spec.orbitRadius + 24, rotation - 0.55, rotation + 0.15),
        phase === 0 ? 0.5 + prepare * 0.34 : phase === 1 ? 0.24 : 0,
        'safe',
        6,
        0,
        '10 9',
      ),
      ...projectiles.map((projectile) =>
        circle(projectile.x, projectile.y, 18, projectileOpacity, 'signal', 6, 0.48),
      ),
    ];
  }
  if (mode === 'pulse-beam') {
    const beamStart = point(spec.beamStart);
    const beamEnd = point(spec.beamEnd);
    const activePulse = phase === 1 ? pulseBeamIndex(action) : -1;
    const beamOpacity = activePulse >= 0 ? 1 : 0;
    const guideOpacity =
      phase === 0 ? 0.35 + prepare * 0.5 : phase === 1 ? 0.24 : 0.24 * (1 - recover);
    return [
      line(beamStart.x, beamStart.y, beamEnd.x, beamEnd.y, guideOpacity, 'accent', 8, '13 11'),
      line(beamStart.x, beamStart.y, beamEnd.x, beamEnd.y, beamOpacity, 'signal', 34),
      circle(
        beamStart.x,
        beamStart.y,
        mix(28, 46, phase === 0 ? prepare : activePulse >= 0 ? 1 : 0.35),
        phase === 2 ? 1 - recover : 0.64 + beamOpacity * 0.3,
        activePulse >= 0 ? 'signal' : 'accent',
        7,
        activePulse >= 0 ? 0.34 : 0.08,
      ),
      ...PULSE_BEAM_WINDOWS.map(([start, end], index) => {
        const elapsed = phase === 1 && action > end;
        const current = index === activePulse;
        return circle(
          214 + index * 66,
          230,
          current ? 18 : 13,
          phase === 2 ? 0.28 * (1 - recover) : 0.46 + (current ? 0.5 : elapsed ? 0.22 : 0),
          current ? 'signal' : elapsed ? 'safe' : 'accent',
          5,
          current ? 0.42 : elapsed ? 0.18 : 0.06,
        );
      }),
    ];
  }
  if (mode === 'chain-explosions') {
    const centers = spec.blastCenters.map(point);
    const activeIndex = phase === 1 ? chainExplosionIndex(action) : -1;
    const pathOpacity =
      phase === 0 ? 0.34 + prepare * 0.46 : phase === 1 ? 0.3 : 0.3 * (1 - recover);
    const chainPath = centers
      .map((center, index) => `${index ? 'L' : 'M'} ${center.x} ${center.y}`)
      .join(' ');
    return [
      path(chainPath, pathOpacity, 'accent', 7, 0, '11 11'),
      ...centers.map((center, index) => {
        const elapsed = phase === 1 && action > CHAIN_EXPLOSION_WINDOWS[index][1];
        const current = index === activeIndex;
        const opacity =
          phase === 0
            ? 0.4 + prepare * 0.42
            : phase === 1
              ? current
                ? 1
                : elapsed
                  ? 0.42
                  : 0.58
              : 0.34 * (1 - recover);
        return circle(
          center.x,
          center.y,
          current ? spec.blastRadius + 12 * pulse(action * 7) : spec.blastRadius,
          opacity,
          current ? 'signal' : elapsed ? 'safe' : 'accent',
          current ? 16 : 6,
          current ? 0.34 : elapsed ? 0.08 : 0.04,
        );
      }),
      ...centers.map((center, index) => {
        const elapsed = phase === 1 && action > CHAIN_EXPLOSION_WINDOWS[index][1];
        const current = index === activeIndex;
        return circle(
          center.x,
          center.y,
          current ? 17 : 11,
          phase === 2 ? 0.24 * (1 - recover) : current ? 1 : 0.66,
          current ? 'signal' : elapsed ? 'safe' : 'accent',
          current ? 7 : 4,
          current ? 0.58 : 0.16,
        );
      }),
    ];
  }
  if (mode === 'mine') {
    const mine = point(spec.mine);
    const placementOpacity =
      phase === 0 ? 0.3 + prepare * 0.48 : phase === 1 ? 0.18 : 0.18 * (1 - recover);
    const routeOpacity = phase === 1 ? 0.48 : phase === 2 ? 0.28 * (1 - recover) : 0;
    const armedOpacity = phase === 1 ? 0.76 + 0.2 * pulse(action * 2) : 0;
    const deviceOpacity = phase === 2 ? 0.72 * (1 - recover) : 0.72 + prepare * 0.28;
    const routePath = spec.safeRoute
      .map(([x, y], index) => `${index ? 'L' : 'M'} ${x} ${y}`)
      .join(' ');
    return [
      path(
        `M ${spec.boss[0]} ${spec.boss[1]} Q 235 390 ${mine.x} ${mine.y}`,
        placementOpacity,
        'accent',
        7,
        0,
        '12 11',
      ),
      path(routePath, routeOpacity, 'safe', 8, 0, '12 12'),
      circle(
        mine.x,
        mine.y,
        spec.triggerRadius,
        phase === 0 ? 0.26 + prepare * 0.38 : phase === 1 ? armedOpacity : 0.32 * (1 - recover),
        phase === 1 ? 'signal' : phase === 2 ? 'safe' : 'accent',
        phase === 1 ? 9 : 6,
        phase === 1 ? 0.12 : 0.04,
      ),
      circle(
        mine.x,
        mine.y,
        27,
        deviceOpacity,
        phase === 1 ? 'signal' : phase === 2 ? 'safe' : 'accent',
        phase === 1 ? 8 : 6,
        phase === 1 ? 0.42 : 0.16,
      ),
      circle(
        mine.x,
        mine.y,
        12,
        deviceOpacity,
        phase === 1 ? 'signal' : phase === 2 ? 'safe' : 'accent',
        5,
        phase === 1 ? 0.64 : 0.26,
      ),
      line(mine.x - 17, mine.y, mine.x + 17, mine.y, deviceOpacity, 'accent', 5),
      line(mine.x, mine.y - 17, mine.x, mine.y + 17, deviceOpacity, 'accent', 5),
    ];
  }
  if (mode === 'moving-hazard') {
    const start = point(spec.hazardStart);
    const end = point(spec.hazardEnd);
    const travel = phase === 0 ? 0 : phase === 1 ? smooth(action) : 1;
    const center = { x: mix(start.x, end.x, travel), y: mix(start.y, end.y, travel) };
    const opacity = phase === 0 ? 0.42 + prepare * 0.3 : phase === 1 ? 0.93 : 0.68 * (1 - recover);
    const tone = phase === 1 ? 'signal' : phase === 2 ? 'safe' : 'accent';
    return [
      line(
        start.x,
        start.y,
        end.x,
        end.y,
        phase === 2 ? 0.25 * (1 - recover) : 0.48,
        'accent',
        7,
        '13 10',
      ),
      circle(
        center.x,
        center.y,
        spec.hazardRadius,
        opacity,
        tone,
        phase === 1 ? 12 : 7,
        phase === 1 ? 0.25 : 0.06,
      ),
      path(
        `M ${center.x - 42} ${center.y - 22} Q ${center.x - 15} ${center.y - 55} ${center.x + 27} ${center.y - 24}`,
        opacity,
        tone,
        8,
      ),
      path(
        `M ${center.x - 30} ${center.y + 21} Q ${center.x + 4} ${center.y - 12} ${center.x + 44} ${center.y + 17}`,
        opacity,
        tone,
        8,
      ),
      line(center.x + 49, center.y - 7, center.x + 64, center.y - 7, opacity, tone, 6),
    ];
  }
  if (mode === 'converging-threats') {
    const edge =
      phase === 0
        ? spec.entryWidth
        : phase === 1
          ? mix(spec.entryWidth, spec.convergence, smooth(action))
          : spec.convergence;
    const right = spec.arenaWidth - edge;
    const opacity = phase === 0 ? 0.38 + prepare * 0.32 : phase === 1 ? 0.94 : 0.6 * (1 - recover);
    const tone = phase === 1 ? 'signal' : phase === 2 ? 'safe' : 'accent';
    const mid = spec.threatTop + spec.threatHeight / 2;
    return [
      rect(0, spec.threatTop, edge, spec.threatHeight, opacity, tone, phase === 1 ? 0.28 : 0.07),
      rect(
        right,
        spec.threatTop,
        edge,
        spec.threatHeight,
        opacity,
        tone,
        phase === 1 ? 0.28 : 0.07,
      ),
      line(edge - 80, mid, edge - 25, mid, opacity, tone, 8),
      path(
        `M ${edge - 43} ${mid - 16} L ${edge - 25} ${mid} L ${edge - 43} ${mid + 16}`,
        opacity,
        tone,
        7,
      ),
      line(right + 80, mid, right + 25, mid, opacity, tone, 8),
      path(
        `M ${right + 43} ${mid - 16} L ${right + 25} ${mid} L ${right + 43} ${mid + 16}`,
        opacity,
        tone,
        7,
      ),
      line(
        280,
        655,
        280,
        455,
        phase === 0 ? 0.5 + prepare * 0.2 : phase === 1 ? 0.4 : 0,
        'safe',
        7,
        '12 10',
      ),
      circle(
        280,
        455,
        28,
        phase === 0 ? 0.48 + prepare * 0.2 : phase === 1 ? 0.62 : 0.3 * (1 - recover),
        'safe',
        6,
        0.08,
      ),
    ];
  }
  if (mode === 'pull') {
    const ringOpacity =
      phase === 0 ? 0.42 + prepare * 0.33 : phase === 1 ? 0.54 : 0.4 * (1 - recover);
    const forceOpacity =
      phase === 0 ? 0.25 + prepare * 0.28 : phase === 1 ? 0.82 : 0.35 * (1 - recover);
    const angleOffset = phase === 1 ? action * 0.42 : 0;
    const arrows = [0.32, 1.12, 1.92, 2.72].flatMap((angle) => {
      const outer = polar(boss, 255, angle + angleOffset);
      const inner = polar(boss, 178, angle + angleOffset);
      const wingA = polar(inner, 18, angle + angleOffset - 0.57);
      const wingB = polar(inner, 18, angle + angleOffset + 0.57);
      return [
        line(outer.x, outer.y, inner.x, inner.y, forceOpacity, 'accent', 7),
        path(
          `M ${wingA.x} ${wingA.y} L ${inner.x} ${inner.y} L ${wingB.x} ${wingB.y}`,
          forceOpacity,
          'accent',
          6,
        ),
      ];
    });
    return [
      circle(boss.x, boss.y, spec.pullRadius, ringOpacity * 0.65, 'accent', 5, 0),
      circle(
        boss.x,
        boss.y,
        spec.dangerRadius,
        phase === 1 ? 0.96 : ringOpacity,
        phase === 1 ? 'signal' : 'accent',
        phase === 1 ? 12 : 6,
        phase === 1 ? 0.35 : 0.08,
      ),
      circle(
        boss.x,
        boss.y,
        31,
        phase === 2 ? 0.65 * (1 - recover) : 0.9,
        phase === 1 ? 'signal' : 'accent',
        7,
        0.3,
      ),
      ...arrows,
      path(
        `M 350 660 Q 398 586 ${spec.target[0]} ${spec.target[1]}`,
        phase === 0 ? 0.32 + prepare * 0.25 : phase === 1 ? 0.54 : 0.2 * (1 - recover),
        'safe',
        6,
        0,
        '12 10',
      ),
      circle(
        spec.target[0],
        spec.target[1],
        27,
        phase === 0 ? 0.38 + prepare * 0.24 : phase === 1 ? 0.7 : 0.25 * (1 - recover),
        'safe',
        5,
        0.07,
      ),
    ];
  }
  if (mode === 'turret-deployment') {
    const turret = point(spec.turret);
    const end = point(spec.beamEnd);
    const deployed = phase !== 0 || prepare >= 0.7;
    const shellOpacity =
      phase === 2 ? 1 - recover : phase === 0 ? 0.18 + smooth((prepare - 0.7) / 0.3) * 0.74 : 0.92;
    const shotOpacity = frame.dangerActive ? 0.94 : 0;
    const travel = phase === 0 ? smooth(prepare / 0.7) : 1;
    const capsule = {
      x: mix(boss.x, turret.x, travel),
      y: mix(boss.y, turret.y, travel),
    };
    return [
      path(
        `M ${boss.x} ${boss.y} L ${turret.x} ${turret.y}`,
        phase === 0 ? 0.38 + prepare * 0.2 : 0,
        'accent',
        5,
        0,
        '10 12',
      ),
      circle(capsule.x, capsule.y, 17, phase === 0 ? 0.9 : 0, 'accent', 6, 0.18),
      circle(turret.x, turret.y, 39, shellOpacity, deployed ? 'accent' : 'safe', 7, 0.2),
      circle(turret.x, turret.y, 18, shellOpacity, 'signal', 6, 0.35),
      line(turret.x, turret.y + 24, turret.x, turret.y + 61, shellOpacity, 'accent', 13),
      path(
        `M ${turret.x - 12} ${turret.y - 22} L ${turret.x} ${turret.y - 34} L ${turret.x + 12} ${turret.y - 22}`,
        shellOpacity,
        'accent',
        5,
      ),
      line(
        turret.x,
        turret.y + 61,
        end.x,
        end.y,
        phase === 0 ? 0.3 + prepare * 0.3 : frame.dangerActive ? 0 : 0.1 * (1 - recover),
        'signal',
        spec.beamHalfWidth * 2,
        '15 11',
      ),
      line(turret.x, turret.y + 61, end.x, end.y, shotOpacity, 'signal', spec.beamHalfWidth * 2),
      line(
        spec.player[0],
        spec.player[1],
        spec.target[0],
        spec.target[1],
        phase === 0 ? 0.52 : phase === 1 ? 0.35 : 0.1 * (1 - recover),
        'safe',
        7,
        '12 10',
      ),
      circle(
        spec.target[0],
        spec.target[1],
        29,
        phase === 2 ? 0.3 * (1 - recover) : 0.65,
        'safe',
        6,
        0.06,
      ),
    ];
  }
  if (mode === 'threat-generator') {
    const generator = point(spec.generator);
    const placement = phase === 0 ? smooth(prepare / 0.72) : 1;
    const capsule = {
      x: mix(boss.x, generator.x, placement),
      y: mix(boss.y, generator.y, placement),
    };
    const sourceOpacity = phase === 2 ? 1 - recover : phase === 0 ? placement * 0.95 : 0.95;
    const charging = Math.max(
      0,
      ...GENERATOR_RELEASES.map((release) =>
        frame.time <= release ? 1 - clamp((release - frame.time) / 0.28) : 0,
      ),
    );
    return [
      path(
        `M ${boss.x} ${boss.y} L ${generator.x} ${generator.y}`,
        phase === 0 ? 0.35 + prepare * 0.3 : 0,
        'accent',
        5,
        0,
        '11 12',
      ),
      circle(capsule.x, capsule.y, 17, phase === 0 ? 0.9 : 0, 'accent', 6, 0.2),
      circle(boss.x, boss.y, 17, phase === 2 ? recover * 0.9 : 0, 'accent', 6, 0.2),
      circle(generator.x, generator.y, 37, sourceOpacity, 'accent', 7, 0.22),
      circle(
        generator.x,
        generator.y,
        16,
        sourceOpacity * (0.65 + 0.35 * charging),
        'signal',
        5,
        0.32,
      ),
      path(
        `M ${generator.x - 17} ${generator.y + 26} L ${generator.x} ${generator.y + 41} L ${generator.x + 17} ${generator.y + 26}`,
        sourceOpacity,
        'accent',
        5,
      ),
      ...spec.shotEnds.map(([x, y]) =>
        line(
          generator.x,
          generator.y + 32,
          x,
          y,
          phase === 0 ? 0.22 + prepare * 0.12 : phase === 1 ? 0.25 : 0,
          'signal',
          3,
          '10 14',
        ),
      ),
      ...generatorShots(spec, frame.time).map((shot) =>
        circle(shot.x, shot.y, shot.radius, shot.active ? 0.96 : 0, 'signal', 8, 0.45),
      ),
      line(
        spec.player[0],
        spec.player[1],
        spec.target[0],
        spec.target[1],
        phase === 0 ? 0.55 : phase === 1 ? 0.35 : 0,
        'safe',
        7,
        '12 10',
      ),
      circle(spec.target[0], spec.target[1], 29, phase === 2 ? 0 : 0.7, 'safe', 6, 0.1),
    ];
  }
  if (mode === 'decoy') {
    const mirror = frame.decoy;
    const split = phase === 0 ? prepare : 1;
    const decision = phase === 1 ? smooth((action - 0.3) / 0.45) : phase === 2 ? 1 - recover : 0;
    return [
      line(
        spec.boss[0],
        spec.boss[1],
        spec.real[0],
        spec.real[1],
        phase === 0 ? 0.3 + prepare * 0.38 : 0,
        'accent',
        5,
        '11 12',
      ),
      line(
        spec.boss[0],
        spec.boss[1],
        spec.mirror[0],
        spec.mirror[1],
        phase === 0 ? 0.3 + prepare * 0.38 : 0,
        'signal',
        5,
        '11 12',
      ),
      circle(
        boss.x,
        boss.y,
        spec.contactRadius,
        phase === 1 ? 0.48 : 0.14 * split,
        'signal',
        5,
        0.12,
      ),
      circle(boss.x, boss.y, 70, phase === 1 ? 0.76 : 0.24 * split, 'accent', 6),
      path(
        `M ${boss.x - 17} ${boss.y + 62} L ${boss.x} ${boss.y + 78} L ${boss.x + 17} ${boss.y + 62}`,
        phase === 1 ? 0.88 : 0.26 * split,
        'accent',
        5,
      ),
      circle(mirror.x, mirror.y, 70, mirror.opacity * 0.75, 'muted', 5, 0, '20 14'),
      path(
        `M ${mirror.x - 17} ${mirror.y + 62} L ${mirror.x - 4} ${mirror.y + 73} M ${mirror.x + 4} ${mirror.y + 73} L ${mirror.x + 17} ${mirror.y + 62}`,
        mirror.opacity * 0.85,
        'muted',
        5,
        0,
        '8 9',
      ),
      line(player.x, player.y - 22, boss.x + 35, boss.y + 45, decision * 0.7, 'safe', 6, '10 9'),
      circle(boss.x + 35, boss.y + 45, 23, decision * 0.8, 'safe', 5),
    ];
  }
  if (mode === 'predictive-aim') {
    const predicted = frame.predicted;
    const shotProgress = clamp((frame.time - 1.6) / 2.15);
    const shot = {
      x: mix(boss.x, predicted.x, shotProgress),
      y: mix(boss.y, predicted.y, shotProgress),
    };
    const live = phase === 1 && frame.time <= 3.75;
    return [
      line(player.x, player.y, predicted.x, predicted.y, phase === 0 ? 0.55 : 0, 'muted', 4, '8 9'),
      circle(predicted.x, predicted.y, 29, phase === 2 ? 0 : 0.72, 'signal', 5, 0, '11 8'),
      line(
        boss.x,
        boss.y,
        predicted.x,
        predicted.y,
        phase === 2 ? 0 : phase === 0 ? 0.36 : 0.55,
        'signal',
        5,
        '12 10',
      ),
      circle(shot.x, shot.y, spec.shotRadius, live ? 0.96 : 0, 'signal', 5, 0.3),
      circle(player.x, player.y, 31, phase === 0 ? 0.42 : 0, 'accent', 4),
    ];
  }
  if (mode === 'source-track') {
    const source = point(spec.emitter);
    const end = polar(source, spec.beamLength, frame.sourceAngle);
    const tip = polar(source, 42, frame.sourceAngle);
    const cue = phase === 0 ? 0.44 + prepare * 0.32 : frame.time < 2.4 ? 0.84 : 0;
    const beam = frame.dangerActive ? 0.96 : 0;
    return [
      circle(source.x, source.y, 21, 0.95, 'accent', 5, 0.16),
      line(source.x, source.y, tip.x, tip.y, 0.98, 'accent', 11),
      line(source.x, source.y, end.x, end.y, cue, 'accent', 5, '12 11'),
      line(source.x, source.y, end.x, end.y, beam, 'signal', spec.beamHalfWidth * 2),
      circle(source.x, source.y, 28, beam * 0.8, 'signal', 7),
    ];
  }
  if (mode === 'burst-fire') {
    const origin = point(spec.emitter);
    const end = point(spec.shotEnd);
    const shots = spec.releases.map((release) => {
      const elapsed = frame.time - release;
      const progress = clamp(elapsed / spec.flight);
      const visible = elapsed >= 0 && elapsed <= spec.flight;
      return circle(
        mix(origin.x, end.x, progress),
        mix(origin.y, end.y, progress),
        spec.shotRadius,
        visible ? 0.98 : 0,
        'signal',
        6,
        0.4,
      );
    });
    return [
      circle(origin.x, origin.y, 21, 0.95, 'accent', 5, 0.16),
      line(
        origin.x,
        origin.y,
        end.x,
        end.y,
        phase === 0 ? 0.35 + prepare * 0.4 : phase === 1 ? 0.2 : 0,
        'accent',
        5,
        '13 11',
      ),
      ...shots,
      circle(
        origin.x,
        origin.y,
        31,
        phase === 1
          ? Math.max(
              ...spec.releases.map((release) =>
                pulse(clamp(Math.abs(frame.time - release) / 0.16)),
              ),
            ) * 0.75
          : 0,
        'signal',
        7,
      ),
    ];
  }
  if (mode === 'volley') {
    const elapsed = frame.time - spec.release;
    const progress = clamp(elapsed / spec.flight);
    const visible = elapsed >= 0 && elapsed <= spec.flight;
    return [
      line(spec.lanes[0], spec.emitterY, spec.lanes[2], spec.emitterY, 0.72, 'accent', 5),
      ...spec.lanes.map((x) =>
        line(
          x,
          spec.emitterY,
          x,
          spec.shotEndY,
          phase === 0 ? 0.3 + prepare * 0.36 : phase === 1 ? 0.12 : 0,
          'accent',
          4,
          '13 12',
        ),
      ),
      ...spec.lanes.map((x) =>
        circle(x, spec.emitterY, 14, phase === 0 ? 0.65 + prepare * 0.28 : 0.35, 'accent', 4),
      ),
      ...spec.lanes.map((x) =>
        circle(
          x,
          mix(spec.emitterY, spec.shotEndY, progress),
          spec.shotRadius,
          visible ? 0.98 : 0,
          'signal',
          6,
          0.4,
        ),
      ),
      line(
        spec.lanes[0] - spec.shotRadius,
        spec.emitterY - 32,
        spec.lanes[2] + spec.shotRadius,
        spec.emitterY - 32,
        phase === 0 ? 0.4 + prepare * 0.48 : 0,
        'signal',
        5,
      ),
    ];
  }
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

function pointClearsThreat(spec, frame, value, radius = BLUEPRINT_PLAYER_RADIUS) {
  if (!frame.dangerActive) return true;
  const distanceFromBoss = Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y);
  const { mode } = spec;
  if (mode === 'landing') {
    const landing = point(spec.landing);
    return Math.hypot(value.x - landing.x, value.y - landing.y) > 88 + radius;
  }
  if (mode === 'single-shot') {
    const projectile = frame.primitives[2];
    return Math.hypot(value.x - projectile.x, value.y - projectile.y) > projectile.radius + radius;
  }
  if (mode === 'arc') return distanceFromBoss > 205 + radius;
  if (mode === 'lunge')
    return distanceToSegment(value, { x: 170, y: 290 }, { x: 430, y: 590 }) > 27 + radius;
  if (mode === 'grab') return Math.hypot(value.x - 390, value.y - 485) > 60 + radius;
  if (mode === 'burrow') return Math.hypot(value.x - 420, value.y - 590) > 78 + radius;
  if (mode === 'ring') {
    const ringRadius = mix(70, 390, frame.action);
    if (Math.abs(distanceFromBoss - ringRadius) > 9 + radius) return true;
    const gapCenter = Math.atan2(690 - frame.boss.y, 440 - frame.boss.x);
    const bodyHalfAngle = Math.asin(clamp(radius / Math.max(distanceFromBoss, radius), -1, 1));
    return (
      Math.abs(
        angleDifference(Math.atan2(value.y - frame.boss.y, value.x - frame.boss.x), gapCenter),
      ) +
        bodyHalfAngle <
      0.24
    );
  }
  if (mode === 'crossfire')
    return frame.primitives
      .slice(4)
      .every(
        (projectile) =>
          Math.hypot(value.x - projectile.x, value.y - projectile.y) > projectile.radius + radius,
      );
  if (mode === 'splitting-projectile')
    return frame.primitives
      .slice(5)
      .filter((projectile) => projectile.opacity > 0.15)
      .every(
        (projectile) =>
          Math.hypot(value.x - projectile.x, value.y - projectile.y) > projectile.radius + radius,
      );
  if (mode === 'returning-projectile') {
    const projectile = frame.primitives[3];
    return Math.hypot(value.x - projectile.x, value.y - projectile.y) > projectile.radius + radius;
  }
  if (mode === 'orbiting-projectiles')
    return frame.primitives
      .slice(2)
      .every(
        (projectile) =>
          Math.hypot(value.x - projectile.x, value.y - projectile.y) > projectile.radius + radius,
      );
  if (mode === 'pulse-beam')
    return distanceToSegment(value, point(spec.beamStart), point(spec.beamEnd)) > 17 + radius;
  if (mode === 'chain-explosions') {
    const activeIndex = frame.phase === 1 ? chainExplosionIndex(frame.action) : -1;
    if (activeIndex < 0) return true;
    const blast = point(spec.blastCenters[activeIndex]);
    return Math.hypot(value.x - blast.x, value.y - blast.y) > spec.blastRadius + radius;
  }
  if (mode === 'mine') {
    const mine = point(spec.mine);
    return Math.hypot(value.x - mine.x, value.y - mine.y) > spec.triggerRadius + radius;
  }
  if (mode === 'moving-hazard') {
    const hazard = frame.primitives[1];
    return Math.hypot(value.x - hazard.x, value.y - hazard.y) > hazard.radius + radius;
  }
  if (mode === 'converging-threats')
    return frame.primitives
      .slice(0, 2)
      .every(
        (threat) =>
          value.x + radius <= threat.x ||
          value.x - radius >= threat.x + threat.rectWidth ||
          value.y + radius <= threat.y ||
          value.y - radius >= threat.y + threat.rectHeight,
      );
  if (mode === 'pull')
    return Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y) > spec.dangerRadius + radius;
  if (mode === 'turret-deployment')
    return (
      distanceToSegment(value, { x: spec.turret[0], y: spec.turret[1] + 61 }, point(spec.beamEnd)) >
      spec.beamHalfWidth + radius
    );
  if (mode === 'threat-generator')
    return generatorShots(spec, frame.time).every(
      (shot) =>
        !shot.active || Math.hypot(value.x - shot.x, value.y - shot.y) > shot.radius + radius,
    );
  if (mode === 'decoy')
    return (
      frame.phase !== 1 ||
      Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y) > spec.contactRadius + radius
    );
  if (mode === 'predictive-aim') {
    const shot = frame.primitives[3];
    return (
      !frame.dangerActive ||
      Math.hypot(value.x - shot.x, value.y - shot.y) > spec.shotRadius + radius
    );
  }
  if (mode === 'source-track') {
    const beam = frame.primitives[3];
    return (
      distanceToSegment(value, { x: beam.x1, y: beam.y1 }, { x: beam.x2, y: beam.y2 }) >
      spec.beamHalfWidth + radius
    );
  }
  if (mode === 'burst-fire')
    return frame.primitives
      .slice(2, 5)
      .every(
        (shot) =>
          shot.opacity === 0 ||
          Math.hypot(value.x - shot.x, value.y - shot.y) > shot.radius + radius,
      );
  if (mode === 'volley')
    return frame.primitives
      .slice(7, 10)
      .every(
        (shot) =>
          shot.opacity === 0 ||
          Math.hypot(value.x - shot.x, value.y - shot.y) > shot.radius + radius,
      );
  if (mode === 'delayed-activation')
    return Math.hypot(value.x - spec.rune[0], value.y - spec.rune[1]) > spec.radius + radius;
  if (mode === 'speed-change') return distanceFromBoss > spec.collisionRadius + radius;
  if (mode === 'limited-spread')
    return limitedSpreadShots(spec, frame.time).every(
      (shot) =>
        !shot.active || Math.hypot(value.x - shot.x, value.y - shot.y) > shot.radius + radius,
    );
  if (mode === 'directional-shield') return true;
  if (mode === 'damage-type-resistance') return true;
  if (mode === 'situational-immunity') return true;
  if (mode === 'part-break')
    return (
      distanceToSegment(
        value,
        { x: spec.launcher[0] + 28, y: spec.launcher[1] },
        point(spec.shotEnd),
      ) >
      spec.beamHalfWidth + radius
    );
  if (mode === 'attack-reflection') {
    const shot = frame.primitives[6];
    return Math.hypot(value.x - shot.x, value.y - shot.y) > spec.boltRadius + radius;
  }
  if (mode === 'counter-stance')
    return (
      distanceToSegment(value, point(spec.counterStart), point(spec.counterEnd)) >
      spec.counterHalfWidth + radius
    );
  if (mode === 'absorption-power-up')
    return (
      Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y) > spec.shockwaveRadius + radius
    );
  if (mode === 'interruptible-wind-up')
    return (
      !frame.dangerActive ||
      Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y) > spec.threatRadius + radius
    );
  if (mode === 'loadout-adaptation') {
    if (frame.reachDanger)
      return (
        distanceToSegment(value, { x: frame.boss.x + 38, y: frame.boss.y }, point(spec.reachEnd)) >
        spec.reachHalfWidth + radius
      );
    if (frame.burstDanger)
      return Math.hypot(value.x - frame.boss.x, value.y - frame.boss.y) > spec.burstRadius + radius;
    return true;
  }
  if (mode === 'wind-up')
    return (
      !frame.dangerActive ||
      distanceToSegment(value, { x: frame.boss.x + 38, y: frame.boss.y }, point(spec.laneEnd)) >
        spec.laneHalfWidth + radius
    );
  if (mode === 'attack-lock')
    return (
      !frame.dangerActive ||
      distanceToSegment(value, frame.boss, frame.attackLockEnd) > spec.laneHalfWidth + radius
    );
  if (mode === 'active-phase')
    return (
      !frame.dangerActive ||
      value.x + radius < spec.laneStart[0] ||
      value.x - radius > spec.laneEnd[0] ||
      value.y + radius < spec.laneStart[1] - spec.laneHalfWidth ||
      value.y - radius > spec.laneStart[1] + spec.laneHalfWidth
    );
  if (mode === 'recovery')
    return (
      !frame.dangerActive ||
      value.x + radius < spec.laneStart[0] ||
      value.x - radius > spec.laneEnd[0] ||
      value.y + radius < spec.laneStart[1] - spec.laneHalfWidth ||
      value.y - radius > spec.laneStart[1] + spec.laneHalfWidth
    );
  if (mode === 'survival-phase') {
    const activeHazard = spec.hazards.find(
      ({ active }) => frame.time >= active[0] && frame.time < active[1],
    );
    if (!activeHazard) return true;
    const center = point(activeHazard.center);
    return Math.hypot(value.x - center.x, value.y - center.y) > spec.hazardRadius + radius;
  }
  if (mode === 'teleport')
    return (
      !frame.dangerActive ||
      distanceToSegment(value, point(spec.laneStart), point(spec.laneEnd)) >
        spec.laneHalfWidth + radius
    );
  if (mode === 'boundary-attack')
    return (
      !frame.dangerActive ||
      distanceToSegment(value, point(spec.laneStart), point(spec.laneEnd)) >
        spec.laneHalfWidth + radius
    );
  if (mode === 'forced-scrolling') return !frame.dangerActive || value.y + radius < spec.hazardTop;
  if (mode === 'chase-herding') return true;
  if (mode === 'spiral')
    return (
      distanceFromBoss > 52 + radius &&
      distanceToPolyline(value, spiralPoints(frame.boss, frame.action)) > 7 + radius
    );
  if (mode === 'ricochet')
    return (
      distanceToPolyline(value, [
        { x: 160, y: 250 },
        { x: 500, y: 420 },
        { x: 110, y: 610 },
        { x: 430, y: 790 },
      ]) >
      6 + radius
    );
  if (mode === 'homing') {
    const head = frame.primitives[2];
    return Math.hypot(value.x - head.x, value.y - head.y) > head.radius + radius;
  }
  if (mode === 'beam') return Math.abs(value.x - frame.boss.x) > 36 + radius;
  if (mode === 'scanning' || mode === 'rotating')
    return frame.primitives
      .filter((primitive) => primitive.type === 'line' && primitive.tone === 'signal')
      .every(
        (primitive) =>
          distanceToSegment(
            value,
            { x: primitive.x1, y: primitive.y1 },
            { x: primitive.x2, y: primitive.y2 },
          ) >
          primitive.width / 2 + radius,
      );
  if (mode === 'marked') return Math.hypot(value.x - 380, value.y - 620) > 58 + radius;
  if (mode === 'shockwave') {
    const wave = frame.primitives[0];
    return (
      Math.abs(Math.hypot(value.x - wave.x, value.y - wave.y) - wave.radius) >
      wave.width / 2 + radius
    );
  }
  if (mode === 'lingering') return Math.hypot(value.x - 360, value.y - 620) > 105 + radius;
  if (mode === 'trail')
    return frame.primitives
      .filter((primitive) => primitive.type === 'circle' && primitive.opacity > 0.15)
      .every(
        (primitive) =>
          Math.hypot(value.x - primitive.x, value.y - primitive.y) > primitive.radius + radius,
      );
  if (mode === 'platforms')
    return frame.primitives
      .filter((primitive) => primitive.type === 'rect' && primitive.tone === 'safe')
      .some(
        (platform) =>
          value.x - radius >= platform.x &&
          value.x + radius <= platform.x + platform.rectWidth &&
          value.y >= platform.y - 70 &&
          value.y <= platform.y + platform.rectHeight + radius,
      );
  if (mode === 'shrink') {
    const safeRadius = frame.primitives[1].radius;
    return Math.hypot(value.x - 280, value.y - 500) <= safeRadius - radius;
  }
  if (mode === 'knockback')
    return value.x >= 24 + radius && value.x <= 536 - radius && value.y <= 910 - radius;
  if (mode === 'target-lock') return Math.hypot(value.x - 390, value.y - 620) > 45 + radius;
  if (mode === 'combo') {
    const wave = frame.primitives[1];
    return (
      Math.abs(distanceFromBoss - 190) > 12.5 + radius &&
      Math.abs(distanceFromBoss - wave.radius) > wave.width / 2 + radius
    );
  }
  if (mode === 'weak-point')
    return Math.hypot(value.x - (frame.boss.x + 58), value.y - (frame.boss.y - 12)) <= 170;
  if (mode === 'telegraph') {
    const danger = [
      { x: 190, y: 270 },
      { x: 485, y: 690 },
      { x: 410, y: 735 },
    ];
    return (
      !pointInPolygon(value, danger) && distanceToPolyline(value, [...danger, danger[0]]) > radius
    );
  }
  if (mode === 'phase') {
    const boundary = frame.primitives[1];
    return (
      value.x + radius < boundary.x ||
      value.x - radius > boundary.x + boundary.rectWidth ||
      value.y + radius < boundary.y ||
      value.y - radius > boundary.y + boundary.rectHeight
    );
  }
  if (mode === 'enrage')
    return (
      distanceFromBoss > 90 + radius &&
      frame.primitives
        .filter((primitive) => primitive.type === 'line')
        .every(
          (primitive) =>
            distanceToSegment(
              value,
              { x: primitive.x1, y: primitive.y1 },
              { x: primitive.x2, y: primitive.y2 },
            ) >
            primitive.width / 2 + radius,
        )
    );
  throw new Error(`Missing safety rule for blueprint mode: ${mode}`);
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
  if (spec.mode === 'landing') {
    const landing = point(spec.landing);
    const control = { x: 260, y: 105 };
    const flight = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.52) : 1 - returnProgress;
    boss = quadraticPoint(startBoss, control, landing, flight);
  } else if (spec.mode === 'speed-change') {
    const x =
      phase === 0
        ? startBoss.x
        : t < spec.switchAt
          ? mix(
              startBoss.x,
              spec.switchX,
              (t - BLUEPRINT_PHASE_ENDS[0]) / (spec.switchAt - BLUEPRINT_PHASE_ENDS[0]),
            )
          : t < spec.finishAt
            ? mix(spec.switchX, spec.finishX, (t - spec.switchAt) / (spec.finishAt - spec.switchAt))
            : mix(spec.finishX, startBoss.x, returnProgress);
    boss = { x, y: spec.laneY };
  } else if (spec.mode === 'teleport') {
    boss = t >= spec.absent[0] && t < spec.resetAbsent[0] ? point(spec.destination) : startBoss;
  } else if (spec.mode === 'boundary-attack') {
    if (t < spec.active[0]) boss = startBoss;
    else if (t < spec.active[1]) {
      const crossing = smooth((t - spec.active[0]) / (spec.active[1] - spec.active[0]));
      boss = { x: mix(startBoss.x, spec.impactPosition[0], crossing), y: startBoss.y };
    } else if (t < spec.openingEnd) boss = point(spec.impactPosition);
    else if (t < spec.withdrawEnd) {
      const withdraw = smooth((t - spec.openingEnd) / (spec.withdrawEnd - spec.openingEnd));
      boss = { x: mix(spec.impactPosition[0], 640, withdraw), y: startBoss.y };
    } else if (t < 4.55) {
      const rise = smooth((t - spec.withdrawEnd) / (4.55 - spec.withdrawEnd));
      boss = { x: 640, y: mix(startBoss.y, 270, rise) };
    } else if (t < 5.35) {
      const traverse = smooth((t - 4.55) / 0.8);
      boss = { x: mix(640, -80, traverse), y: 270 };
    } else if (t < spec.outerRoute[1]) {
      const descend = smooth((t - 5.35) / (spec.outerRoute[1] - 5.35));
      boss = { x: mix(-80, startBoss.x, descend), y: mix(270, startBoss.y, descend) };
    }
  } else if (spec.mode === 'forced-scrolling') {
    const opening = point(spec.bossOpening);
    if (t < spec.active[1]) boss = startBoss;
    else if (t < spec.bossAdvanceEnd) {
      const advance = smooth((t - spec.active[1]) / (spec.bossAdvanceEnd - spec.active[1]));
      boss = { x: mix(startBoss.x, opening.x, advance), y: mix(startBoss.y, opening.y, advance) };
    } else if (t < spec.resetAt) boss = opening;
    else {
      const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
      boss = { x: mix(opening.x, startBoss.x, reset), y: mix(opening.y, startBoss.y, reset) };
    }
  } else if (spec.mode === 'chase-herding') {
    const capture = point(spec.captureZone);
    if (t < spec.active[0]) boss = startBoss;
    else if (t < spec.active[1]) {
      const chase = smooth((t - spec.active[0]) / (spec.active[1] - spec.active[0]));
      boss = pointAlongPolyline(spec.bossRoute.map(point), chase);
    } else if (t < spec.resetAt) boss = capture;
    else {
      const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
      boss = { x: mix(capture.x, startBoss.x, reset), y: mix(capture.y, startBoss.y, reset) };
    }
  } else if (spec.mode === 'lunge') {
    const travel = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.62) : 1 - recover;
    boss = { x: mix(170, 430, travel), y: mix(290, 590, travel) };
  } else if (spec.mode === 'burrow') {
    boss = phase === 0 ? startBoss : { x: 420, y: 590 };
  } else if (spec.mode === 'trail') {
    const travel = phase === 0 ? 0 : phase === 1 ? smooth(action) : 1 - returnProgress;
    boss = { x: mix(175, 410, travel), y: mix(260, 610, travel) };
  } else if (spec.mode === 'decoy') {
    const split = phase === 0 ? prepare : phase === 1 ? 1 : 1 - returnProgress;
    boss = {
      x: mix(startBoss.x, spec.real[0], split),
      y: mix(startBoss.y, spec.real[1], split),
    };
  }
  let responseProgress = response;
  if (spec.mode === 'landing')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.4) : 1;
  else if (spec.mode === 'single-shot')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.42) : 1;
  else if (spec.mode === 'crossfire')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.38) : 1;
  else if (spec.mode === 'splitting-projectile')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.24) / 0.34) : 1;
  else if (spec.mode === 'returning-projectile')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.2) / 0.34) : 1;
  else if (spec.mode === 'orbiting-projectiles')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.1) / 0.55) : 1;
  else if (spec.mode === 'pulse-beam')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.25) / 0.2) : 1;
  else if (spec.mode === 'chain-explosions')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.2) / 0.7) : 1;
  else if (spec.mode === 'mine')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.06) / 0.8) : 1;
  else if (spec.mode === 'moving-hazard')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.5) : 1;
  else if (spec.mode === 'converging-threats')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action / 0.53) : 1;
  else if (spec.mode === 'pull')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth((action - 0.15) / 0.77) : 1;
  else if (spec.mode === 'turret-deployment') responseProgress = smooth((t - 0.64) / 1.34);
  else if (spec.mode === 'threat-generator') responseProgress = smooth((t - 0.42) / 1.2);
  else if (spec.mode === 'decoy') responseProgress = smooth((t - 1.35) / 1.72);
  else if (spec.mode === 'predictive-aim') responseProgress = smooth((t - 1.6) / 1.05);
  else if (spec.mode === 'source-track') responseProgress = smooth((t - 1.6) / 0.84);
  else if (spec.mode === 'burst-fire') responseProgress = smooth((t - 1.6) / 0.75);
  else if (spec.mode === 'volley') responseProgress = smooth((t - 1.6) / 0.68);
  else if (spec.mode === 'delayed-activation') responseProgress = smooth((t - 1.7) / 0.9);
  else if (spec.mode === 'speed-change') responseProgress = smooth((t - 1.6) / 0.7);
  else if (spec.mode === 'limited-spread') responseProgress = smooth((t - 1.6) / 0.68);
  else if (spec.mode === 'directional-shield') responseProgress = smooth((t - 2.22) / 1.18);
  else if (spec.mode === 'damage-type-resistance') responseProgress = smooth((t - 1.6) / 0.42);
  else if (spec.mode === 'situational-immunity') responseProgress = smooth((t - 1.6) / 0.42);
  else if (spec.mode === 'part-break') responseProgress = smooth((t - 2.24) / 0.55);
  else if (spec.mode === 'attack-reflection') responseProgress = smooth((t - 2.55) / 0.62);
  else if (spec.mode === 'counter-stance') responseProgress = smooth((t - 1.92) / 0.48);
  else if (spec.mode === 'absorption-power-up')
    responseProgress = smooth((t - spec.chargeWindup) / 0.53);
  else if (spec.mode === 'interruptible-wind-up')
    responseProgress = smooth((t - spec.secondWindup[0]) / 0.64);
  else if (spec.mode === 'loadout-adaptation') responseProgress = 0;
  else if (spec.mode === 'wind-up') responseProgress = 0;
  else if (spec.mode === 'attack-lock') responseProgress = 0;
  else if (spec.mode === 'active-phase') responseProgress = 0;
  else if (spec.mode === 'recovery') responseProgress = 0;
  else if (spec.mode === 'survival-phase') responseProgress = 0;
  else if (spec.mode === 'teleport') responseProgress = 0;
  else if (spec.mode === 'boundary-attack') responseProgress = 0;
  else if (spec.mode === 'forced-scrolling') responseProgress = 0;
  else if (spec.mode === 'chase-herding') responseProgress = 0;
  else if (spec.mode === 'knockback')
    responseProgress = phase === 0 ? 0 : phase === 1 ? smooth(action) : 1;
  else if (spec.mode === 'target-lock')
    responseProgress = phase === 1 ? smooth(action / 0.45) : phase === 2 ? 1 : 0;
  else if (spec.mode === 'homing')
    responseProgress = phase === 1 ? smooth((action - 0.38) / 0.3) : phase === 2 ? 1 : 0;
  let player = {
    x: mix(mix(startPlayer.x, targetPlayer.x, responseProgress), startPlayer.x, returnProgress),
    y: mix(mix(startPlayer.y, targetPlayer.y, responseProgress), startPlayer.y, returnProgress),
  };
  if (spec.mode === 'pull' && phase === 1) {
    const dragged = smooth(action);
    player = {
      x:
        startPlayer.x +
        (spec.boss[0] - startPlayer.x) * 0.23 * dragged +
        (spec.target[0] - startPlayer.x + 16.1) * responseProgress,
      y:
        startPlayer.y +
        (spec.boss[1] - startPlayer.y) * 0.23 * dragged +
        (spec.target[1] - startPlayer.y + 82.8) * responseProgress,
    };
  }
  if (spec.mode === 'predictive-aim') {
    const lockX = startPlayer.x + spec.approachVelocity * 1.6;
    player = {
      x:
        phase === 0
          ? startPlayer.x + spec.approachVelocity * t
          : mix(mix(lockX, targetPlayer.x, responseProgress), startPlayer.x, returnProgress),
      y: startPlayer.y,
    };
  }
  if (spec.mode === 'source-track') {
    const lock = point(spec.lock);
    player =
      phase === 0
        ? { x: mix(startPlayer.x, lock.x, prepare), y: startPlayer.y }
        : {
            x: mix(mix(lock.x, targetPlayer.x, responseProgress), startPlayer.x, returnProgress),
            y: startPlayer.y,
          };
  }
  if (spec.mode === 'directional-shield') {
    const route = [startPlayer, { x: spec.target[0], y: startPlayer.y }, targetPlayer];
    const advanced = pointAlongPolyline(route, responseProgress);
    player = {
      x: mix(advanced.x, startPlayer.x, returnProgress),
      y: mix(advanced.y, startPlayer.y, returnProgress),
    };
  }
  if (spec.mode === 'attack-reflection' && t >= 4.12) {
    const approach = smooth((t - 4.12) / 0.5);
    const retreat = smooth((t - 5.17) / 0.65);
    player = {
      x: mix(mix(spec.target[0], 390, approach), startPlayer.x, retreat),
      y: mix(mix(spec.target[1], 405, approach), startPlayer.y, retreat),
    };
  }
  if (spec.mode === 'counter-stance') {
    const retreat = smooth((t - 1.92) / 0.48);
    const returnToGuard = smooth((t - 3.04) / 0.88);
    const openApproach = smooth((t - 4.54) / 0.38);
    const reset = smooth((t - 5.2) / 0.62);
    const afterRetreat = {
      x: mix(startPlayer.x, targetPlayer.x, retreat),
      y: mix(startPlayer.y, targetPlayer.y, retreat),
    };
    const afterReturn = {
      x: mix(afterRetreat.x, startPlayer.x, returnToGuard),
      y: mix(afterRetreat.y, startPlayer.y, returnToGuard),
    };
    player = {
      x: mix(mix(afterReturn.x, 405, openApproach), startPlayer.x, reset),
      y: mix(mix(afterReturn.y, 430, openApproach), startPlayer.y, reset),
    };
  }
  if (spec.mode === 'absorption-power-up') {
    const away = smooth((t - spec.chargeWindup) / 0.53);
    const approach = smooth((t - 4.24) / 0.45);
    const reset = smooth((t - 5.25) / 0.58);
    player = {
      x: mix(mix(mix(startPlayer.x, targetPlayer.x, away), 390, approach), startPlayer.x, reset),
      y: startPlayer.y,
    };
  }
  if (spec.mode === 'interruptible-wind-up') {
    const firstApproach = smooth((t - 0.92) / 0.5);
    const firstRetreat = smooth((t - 1.78) / 0.62);
    const clearRelease = smooth((t - spec.secondWindup[0]) / 0.64);
    const reset = smooth((t - spec.recoveryEnd) / 0.54);
    const closePosition = {
      x: mix(startPlayer.x, spec.interruptPosition[0], firstApproach),
      y: startPlayer.y,
    };
    const afterRetreat = {
      x: mix(closePosition.x, startPlayer.x, firstRetreat),
      y: startPlayer.y,
    };
    player = {
      x: mix(mix(afterRetreat.x, targetPlayer.x, clearRelease), startPlayer.x, reset),
      y: startPlayer.y,
    };
  }
  if (spec.mode === 'loadout-adaptation') {
    const clearReach = smooth((t - 1.18) / 0.38);
    const returnAfterReach = smooth((t - 2.16) / 0.42);
    const clearBurst = smooth((t - spec.burstCopiedAt) / 0.58);
    const reset = smooth((t - spec.recoveryEnd) / 0.52);
    const reachSafe = {
      x: startPlayer.x,
      y: mix(startPlayer.y, 540, clearReach),
    };
    const afterReach = {
      x: mix(reachSafe.x, startPlayer.x, returnAfterReach),
      y: mix(reachSafe.y, startPlayer.y, returnAfterReach),
    };
    player = {
      x: mix(mix(afterReach.x, targetPlayer.x, clearBurst), startPlayer.x, reset),
      y: mix(mix(afterReach.y, targetPlayer.y, clearBurst), startPlayer.y, reset),
    };
  }
  if (spec.mode === 'wind-up') {
    const clearShort = smooth((t - 0.84) / 0.46);
    const returnAfterShort = smooth((t - 2.12) / 0.42);
    const clearHeld = smooth((t - 3.16) / 0.5);
    const reset = smooth((t - spec.recoveryEnd) / 0.5);
    const shortSafe = {
      x: startPlayer.x,
      y: mix(startPlayer.y, 550, clearShort),
    };
    const afterShort = {
      x: mix(shortSafe.x, startPlayer.x, returnAfterShort),
      y: mix(shortSafe.y, startPlayer.y, returnAfterShort),
    };
    player = {
      x: mix(mix(afterShort.x, targetPlayer.x, clearHeld), startPlayer.x, reset),
      y: mix(mix(afterShort.y, targetPlayer.y, clearHeld), startPlayer.y, reset),
    };
  }
  if (spec.mode === 'attack-lock') {
    const firstTrack = smooth((t - spec.firstTrack[0]) / (spec.firstLock - spec.firstTrack[0]));
    const firstEscape = smooth((t - spec.firstLock) / 0.45);
    const secondSetup = smooth(
      (t - spec.firstRelease[1]) / (spec.secondSetup - spec.firstRelease[1]),
    );
    const secondTrack = smooth((t - spec.secondTrack[0]) / (spec.secondLock - spec.secondTrack[0]));
    const secondEscape = smooth((t - spec.secondLock) / 0.45);
    const reset = smooth((t - spec.recoveryEnd) / (BLUEPRINT_DURATION - spec.recoveryEnd));
    const atFirstLock = {
      x: mix(startPlayer.x, spec.firstLockPoint[0], firstTrack),
      y: mix(startPlayer.y, spec.firstLockPoint[1], firstTrack),
    };
    const afterFirstEscape = {
      x: mix(atFirstLock.x, spec.firstEscape[0], firstEscape),
      y: mix(atFirstLock.y, spec.firstEscape[1], firstEscape),
    };
    const atSecondStart = {
      x: mix(afterFirstEscape.x, spec.secondStart[0], secondSetup),
      y: mix(afterFirstEscape.y, spec.secondStart[1], secondSetup),
    };
    const atSecondLock = {
      x: mix(atSecondStart.x, spec.secondLockPoint[0], secondTrack),
      y: mix(atSecondStart.y, spec.secondLockPoint[1], secondTrack),
    };
    const afterSecondEscape = {
      x: mix(atSecondLock.x, spec.secondEscape[0], secondEscape),
      y: mix(atSecondLock.y, spec.secondEscape[1], secondEscape),
    };
    player = {
      x: mix(afterSecondEscape.x, startPlayer.x, reset),
      y: mix(afterSecondEscape.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'active-phase') {
    const escape = smooth((t - 0.72) / 0.68);
    const reenter = smooth((t - spec.active[1]) / (spec.followThroughEnd - spec.active[1]));
    const reset = smooth((t - spec.recoveryEnd) / (BLUEPRINT_DURATION - spec.recoveryEnd));
    const safe = {
      x: mix(startPlayer.x, spec.safePosition[0], escape),
      y: mix(startPlayer.y, spec.safePosition[1], escape),
    };
    const punish = {
      x: mix(safe.x, targetPlayer.x, reenter),
      y: mix(safe.y, targetPlayer.y, reenter),
    };
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'recovery') {
    const escape = smooth((t - 0.62) / 0.58);
    const approach = smooth((t - spec.recovery[0]) / 1.42);
    const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
    const safe = {
      x: mix(startPlayer.x, spec.safePosition[0], escape),
      y: mix(startPlayer.y, spec.safePosition[1], escape),
    };
    const punish = {
      x: mix(safe.x, targetPlayer.x, approach),
      y: mix(safe.y, targetPlayer.y, approach),
    };
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'survival-phase') {
    let current = startPlayer;
    for (let index = 0; index < spec.hazards.length; index += 1) {
      const hazard = spec.hazards[index];
      const destination = point(spec.safePositions[index]);
      const movement = smooth(
        (t - (hazard.preview[0] + 0.015)) / (hazard.active[0] - hazard.preview[0] - 0.03),
      );
      current = {
        x: mix(current.x, destination.x, movement),
        y: mix(current.y, destination.y, movement),
      };
    }
    const approach = smooth((t - spec.shieldDropsAt) / 0.58);
    const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
    const punish = {
      x: mix(current.x, targetPlayer.x, approach),
      y: mix(current.y, targetPlayer.y, approach),
    };
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'teleport') {
    const escape = smooth(
      (t - (spec.destinationPreview[0] + 0.08)) /
        (spec.active[0] - spec.destinationPreview[0] - 0.26),
    );
    const approach = smooth((t - spec.active[1]) / 0.64);
    const reset = smooth(
      (t - spec.resetDeparture[0]) / (BLUEPRINT_DURATION - spec.resetDeparture[0]),
    );
    const safe = {
      x: mix(startPlayer.x, spec.safePosition[0], escape),
      y: mix(startPlayer.y, spec.safePosition[1], escape),
    };
    const punish = {
      x: mix(safe.x, targetPlayer.x, approach),
      y: mix(safe.y, targetPlayer.y, approach),
    };
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'boundary-attack') {
    const escape = smooth((t - 0.72) / 0.72);
    const approach = smooth((t - spec.active[1]) / 0.62);
    const retreat = smooth((t - (spec.punishAt + 0.2)) / 0.46);
    const reset = smooth((t - 4.72) / 0.86);
    const safe = {
      x: mix(startPlayer.x, spec.safePosition[0], escape),
      y: mix(startPlayer.y, spec.safePosition[1], escape),
    };
    const punish = {
      x: mix(safe.x, targetPlayer.x, approach),
      y: mix(safe.y, targetPlayer.y, approach),
    };
    const withdrew = {
      x: mix(punish.x, safe.x, retreat),
      y: mix(punish.y, safe.y, retreat),
    };
    player = {
      x: mix(withdrew.x, startPlayer.x, reset),
      y: mix(withdrew.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'forced-scrolling') {
    const climb = smooth((t - 0.72) / (spec.active[1] - 0.72));
    const climbed = pointAlongPolyline(spec.route.map(point), climb);
    const approach = smooth((t - spec.active[1]) / 0.62);
    const punish = {
      x: mix(climbed.x, targetPlayer.x, approach),
      y: mix(climbed.y, targetPlayer.y, approach),
    };
    const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
  if (spec.mode === 'chase-herding') {
    const chase = smooth((t - 0.72) / (spec.active[1] - 0.72));
    const intercept = pointAlongPolyline(spec.playerRoute.map(point), chase);
    const approach = smooth((t - spec.active[1]) / 0.72);
    const punish = {
      x: mix(intercept.x, targetPlayer.x, approach),
      y: mix(intercept.y, targetPlayer.y, approach),
    };
    const reset = smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt));
    player = {
      x: mix(punish.x, startPlayer.x, reset),
      y: mix(punish.y, startPlayer.y, reset),
    };
  }
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
  } else if (spec.mode === 'orbiting-projectiles') {
    const gapOffset = Math.PI / spec.projectileCount;
    const finalAngle = spec.startAngle + spec.rotation + gapOffset;
    const finalPosition = polar(boss, 112, finalAngle);
    if (phase === 0) player = startPlayer;
    else if (phase === 1) {
      const angle = spec.startAngle + spec.rotation * action + gapOffset;
      player = polar(boss, mix(250, 112, responseProgress), angle);
    } else {
      player = {
        x: mix(finalPosition.x, startPlayer.x, returnProgress),
        y: mix(finalPosition.y, startPlayer.y, returnProgress),
      };
    }
  } else if (spec.mode === 'chain-explosions') {
    const wake = [startPlayer, ...spec.blastCenters.slice(0, -1).map(point)];
    const finalPosition = wake.at(-1);
    if (phase === 0) player = startPlayer;
    else if (phase === 1) player = pointAlongPolyline(wake, responseProgress);
    else {
      player = {
        x: mix(finalPosition.x, startPlayer.x, returnProgress),
        y: mix(finalPosition.y, startPlayer.y, returnProgress),
      };
    }
  } else if (spec.mode === 'mine') {
    const route = spec.safeRoute.map(point);
    const finalPosition = route.at(-1);
    if (phase === 0) player = startPlayer;
    else if (phase === 1) player = pointAlongPolyline(route, responseProgress);
    else {
      player = {
        x: mix(finalPosition.x, startPlayer.x, returnProgress),
        y: mix(finalPosition.y, startPlayer.y, returnProgress),
      };
    }
  }
  const route = Math.hypot(targetPlayer.x - startPlayer.x, targetPlayer.y - startPlayer.y);
  const stride =
    spec.mode === 'active-phase'
      ? Math.max(
          pulse(smooth((t - 0.72) / 0.68)),
          pulse(smooth((t - spec.active[1]) / (spec.followThroughEnd - spec.active[1]))),
          pulse(smooth((t - spec.recoveryEnd) / (BLUEPRINT_DURATION - spec.recoveryEnd))) * 0.8,
        )
      : spec.mode === 'recovery'
        ? Math.max(
            pulse(smooth((t - 0.62) / 0.58)),
            pulse(smooth((t - spec.recovery[0]) / 1.42)),
            pulse(smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt))) * 0.8,
          )
        : spec.mode === 'survival-phase'
          ? Math.max(
              ...spec.hazards.map(({ preview, active }) =>
                pulse(smooth((t - (preview[0] + 0.015)) / (active[0] - preview[0] - 0.03))),
              ),
              pulse(smooth((t - spec.shieldDropsAt) / 0.58)),
              pulse(smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt))) * 0.8,
            )
          : spec.mode === 'teleport'
            ? Math.max(
                pulse(
                  smooth(
                    (t - (spec.destinationPreview[0] + 0.08)) /
                      (spec.active[0] - spec.destinationPreview[0] - 0.26),
                  ),
                ),
                pulse(smooth((t - spec.active[1]) / 0.64)),
                pulse(
                  smooth(
                    (t - spec.resetDeparture[0]) / (BLUEPRINT_DURATION - spec.resetDeparture[0]),
                  ),
                ) * 0.8,
              )
            : spec.mode === 'boundary-attack'
              ? Math.max(
                  pulse(smooth((t - 0.72) / 0.72)),
                  pulse(smooth((t - spec.active[1]) / 0.62)),
                  pulse(smooth((t - (spec.punishAt + 0.2)) / 0.46)),
                  pulse(smooth((t - 4.72) / 0.86)) * 0.8,
                )
              : spec.mode === 'forced-scrolling'
                ? Math.max(
                    pulse(smooth((t - 0.72) / (spec.active[1] - 0.72))),
                    pulse(smooth((t - spec.active[1]) / 0.62)),
                    pulse(smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt))) * 0.8,
                  )
                : spec.mode === 'chase-herding'
                  ? Math.max(
                      pulse(smooth((t - 0.72) / (spec.active[1] - 0.72))),
                      pulse(smooth((t - spec.active[1]) / 0.72)),
                      pulse(smooth((t - spec.resetAt) / (BLUEPRINT_DURATION - spec.resetAt))) * 0.8,
                    )
                  : pulse(responseProgress) + pulse(returnProgress) * 0.8;
  const bossVisible =
    spec.mode === 'burrow' && phase === 1 && action < 0.68
      ? 0
      : spec.mode === 'teleport'
        ? t < spec.departure[0]
          ? 1
          : t < spec.absent[0]
            ? 1 - smooth((t - spec.departure[0]) / (spec.absent[0] - spec.departure[0]))
            : t < spec.arrival[0]
              ? 0
              : t < spec.arrival[1]
                ? smooth((t - spec.arrival[0]) / (spec.arrival[1] - spec.arrival[0]))
                : t < spec.resetDeparture[0]
                  ? 1
                  : t < spec.resetAbsent[0]
                    ? 1 -
                      smooth(
                        (t - spec.resetDeparture[0]) /
                          (spec.resetAbsent[0] - spec.resetDeparture[0]),
                      )
                    : t < spec.resetArrival[0]
                      ? 0
                      : smooth(
                          (t - spec.resetArrival[0]) /
                            (spec.resetArrival[1] - spec.resetArrival[0]),
                        )
        : 1;
  const decoy =
    spec.mode === 'decoy'
      ? {
          x: mix(startBoss.x, spec.mirror[0], phase === 0 ? prepare : 1),
          y: mix(startBoss.y, spec.mirror[1], phase === 0 ? prepare : 1),
          opacity: phase === 0 ? 0.12 + prepare * 0.53 : phase === 1 ? 0.65 : 0.65 * (1 - recover),
        }
      : null;
  const predicted =
    spec.mode === 'predictive-aim'
      ? {
          x:
            (phase === 0
              ? player.x
              : startPlayer.x + spec.approachVelocity * BLUEPRINT_PHASE_ENDS[0]) +
            spec.approachVelocity * spec.leadSeconds,
          y: startPlayer.y,
        }
      : null;
  const sourceAngle =
    spec.mode === 'source-track'
      ? Math.atan2(
          (phase === 0 ? player : point(spec.lock)).y - spec.emitter[1],
          (phase === 0 ? player : point(spec.lock)).x - spec.emitter[0],
        )
      : null;
  const committed = t >= BLUEPRINT_PHASE_ENDS[0];
  const dangerActive =
    spec.mode === 'landing'
      ? phase === 1 && action >= 0.32 && action <= 0.72
      : spec.mode === 'pulse-beam'
        ? phase === 1 && pulseBeamIndex(action) >= 0
        : spec.mode === 'chain-explosions'
          ? phase === 1 && chainExplosionIndex(action) >= 0
          : spec.mode === 'turret-deployment'
            ? phase === 1 && action >= 0.2 && action <= 0.88
            : spec.mode === 'threat-generator'
              ? GENERATOR_RELEASES.some(
                  (release) => t >= release && t <= release + GENERATOR_FLIGHT,
                )
              : spec.mode === 'predictive-aim'
                ? phase === 1 && t <= 3.75
                : spec.mode === 'source-track'
                  ? phase === 1 && t >= 2.4 && t <= 3.8
                  : spec.mode === 'burst-fire'
                    ? spec.releases.some((release) => t >= release && t <= release + spec.flight)
                    : spec.mode === 'volley'
                      ? t >= spec.release && t <= spec.release + spec.flight
                      : spec.mode === 'delayed-activation'
                        ? t >= spec.activatesAt && t < spec.expiresAt
                        : spec.mode === 'speed-change'
                          ? t >= BLUEPRINT_PHASE_ENDS[0] && t < spec.finishAt
                          : spec.mode === 'limited-spread'
                            ? spec.releases.some(
                                (release) => t >= release && t < release + spec.flight,
                              )
                            : spec.mode === 'directional-shield'
                              ? t >= BLUEPRINT_PHASE_ENDS[0] && t < spec.guardEnd
                              : spec.mode === 'damage-type-resistance' ||
                                  spec.mode === 'situational-immunity'
                                ? phase === 1
                                : spec.mode === 'part-break'
                                  ? t >= spec.firstShot[0] && t < spec.firstShot[1]
                                  : spec.mode === 'attack-reflection'
                                    ? t >= spec.reflected[0] && t < spec.reflected[1]
                                    : spec.mode === 'counter-stance'
                                      ? t >= spec.riposte[0] && t < spec.riposte[1]
                                      : spec.mode === 'absorption-power-up'
                                        ? t >= spec.shockwave[0] && t < spec.shockwave[1]
                                        : spec.mode === 'interruptible-wind-up'
                                          ? t >= spec.release[0] && t < spec.release[1]
                                          : spec.mode === 'loadout-adaptation'
                                            ? (t >= spec.reachAttack[0] &&
                                                t < spec.reachAttack[1]) ||
                                              (t >= spec.burstAttack[0] && t < spec.burstAttack[1])
                                            : spec.mode === 'wind-up'
                                              ? (t >= spec.firstRelease[0] &&
                                                  t < spec.firstRelease[1]) ||
                                                (t >= spec.secondRelease[0] &&
                                                  t < spec.secondRelease[1])
                                              : spec.mode === 'attack-lock'
                                                ? (t >= spec.firstRelease[0] &&
                                                    t < spec.firstRelease[1]) ||
                                                  (t >= spec.secondRelease[0] &&
                                                    t < spec.secondRelease[1])
                                                : spec.mode === 'active-phase'
                                                  ? t >= spec.active[0] && t < spec.active[1]
                                                  : spec.mode === 'recovery'
                                                    ? t >= spec.active[0] && t < spec.active[1]
                                                    : spec.mode === 'survival-phase'
                                                      ? spec.hazards.some(
                                                          ({ active }) =>
                                                            t >= active[0] && t < active[1],
                                                        )
                                                      : spec.mode === 'teleport'
                                                        ? t >= spec.active[0] && t < spec.active[1]
                                                        : spec.mode === 'boundary-attack'
                                                          ? t >= spec.active[0] &&
                                                            t < spec.active[1]
                                                          : spec.mode === 'forced-scrolling'
                                                            ? t >= spec.active[0] &&
                                                              t < spec.active[1]
                                                            : spec.mode === 'chase-herding'
                                                              ? false
                                                              : phase === 1;
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
    playerSafe: true,
    boss,
    player,
    decoy,
    predicted,
    sourceAngle,
    bossVisible,
    bossScale:
      spec.mode === 'phase'
        ? 1 + action * 0.12
        : spec.mode === 'enrage'
          ? phase === 0
            ? 1 + prepare * 0.1
            : 1.1
          : 1,
    bossFacing:
      spec.mode === 'landing'
        ? (Math.atan2(spec.landing[1] - spec.boss[1], spec.landing[0] - spec.boss[0]) * 180) /
          Math.PI
        : spec.mode === 'boundary-attack'
          ? t < spec.openingEnd
            ? 0
            : t < 4.55
              ? -90
              : t < 5.35
                ? 180
                : 90
          : spec.mode === 'forced-scrolling'
            ? -90
            : spec.mode === 'chase-herding'
              ? 90
              : 90,
    playerFacing:
      spec.mode === 'directional-shield'
        ? mix(-90, -180, smooth((t - 2.7) / 0.68)) * (1 - returnProgress) - 90 * returnProgress
        : spec.mode === 'active-phase'
          ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
          : spec.mode === 'recovery'
            ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
            : spec.mode === 'survival-phase'
              ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
              : spec.mode === 'teleport'
                ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
                : spec.mode === 'boundary-attack'
                  ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
                  : spec.mode === 'forced-scrolling'
                    ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
                    : spec.mode === 'chase-herding'
                      ? (Math.atan2(boss.y - player.y, boss.x - player.x) * 180) / Math.PI
                      : spec.mode === 'damage-type-resistance' ||
                          spec.mode === 'situational-immunity' ||
                          spec.mode === 'part-break' ||
                          spec.mode === 'attack-reflection' ||
                          spec.mode === 'counter-stance' ||
                          spec.mode === 'absorption-power-up' ||
                          spec.mode === 'interruptible-wind-up' ||
                          spec.mode === 'loadout-adaptation' ||
                          spec.mode === 'wind-up'
                        ? -180
                        : -90,
    bossMotion: motion({
      gait: spec.mode === 'chase-herding' ? t * 6 : 0,
      stride: spec.mode === 'chase-herding' && t >= spec.active[0] && t < spec.active[1] ? 0.72 : 0,
      lean:
        spec.mode === 'landing'
          ? phase === 0
            ? -0.3 * prepare
            : 0.36 * pulse(clamp(action / 0.52))
          : spec.mode === 'wind-up'
            ? -0.34 * windUpProgress(t) +
              0.46 *
                Math.max(
                  strikePulse(t, spec.firstRelease[0], 0.5),
                  strikePulse(t, spec.secondRelease[0], 0.5),
                )
            : spec.mode === 'active-phase'
              ? -0.28 * smooth((t - spec.startup[0]) / (spec.active[0] - spec.startup[0])) +
                0.5 *
                  smooth((t - spec.active[0]) / (spec.followThroughEnd - spec.active[0])) *
                  (1 - smooth((t - spec.followThroughEnd) / 0.68))
              : spec.mode === 'recovery'
                ? -0.28 * smooth((t - spec.startup[0]) / (spec.active[0] - spec.startup[0])) +
                  0.5 * strikePulse(t, spec.active[0], 0.72) +
                  0.24 *
                    smooth((t - spec.recovery[0]) / 0.34) *
                    (1 - smooth((t - spec.recovery[1]) / 0.34))
                : spec.mode === 'survival-phase'
                  ? 0.12 *
                    Math.max(...spec.hazards.map(({ active }) => strikePulse(t, active[0], 0.34)))
                  : spec.mode === 'teleport'
                    ? 0.46 * strikePulse(t, spec.active[0], 0.66)
                    : spec.mode === 'boundary-attack'
                      ? 0.38 * strikePulse(t, spec.active[0], 0.7) +
                        0.28 * strikePulse(t, spec.impactAt, 0.52)
                      : spec.mode === 'forced-scrolling'
                        ? -0.18 * smooth((t - spec.signal[0]) / 0.5) +
                          0.35 * strikePulse(t, spec.active[1], 0.62)
                        : spec.mode === 'chase-herding'
                          ? -0.28 *
                              smooth((t - spec.signal[0]) / 0.5) *
                              (1 - smooth((t - spec.active[1]) / 0.42)) +
                            0.32 * strikePulse(t, spec.active[1], 0.58)
                          : phase === 0
                            ? -0.22 * prepare
                            : 0.24 * pulse(action),
      crouch:
        spec.mode === 'landing'
          ? phase === 0
            ? 0.42 * prepare
            : 0
          : spec.mode === 'wind-up'
            ? 0.34 * windUpProgress(t)
            : spec.mode === 'recovery'
              ? 0.3 *
                smooth((t - spec.startup[0]) / (spec.active[0] - spec.startup[0])) *
                (1 - smooth((t - spec.recovery[1]) / 0.34))
              : spec.mode === 'survival-phase'
                ? 0.12 *
                  Math.max(...spec.hazards.map(({ active }) => strikePulse(t, active[0], 0.34)))
                : spec.mode === 'teleport'
                  ? 0.28 * strikePulse(t, spec.active[0], 0.66)
                  : spec.mode === 'boundary-attack'
                    ? 0.3 * strikePulse(t, spec.impactAt, 0.55)
                    : spec.mode === 'forced-scrolling'
                      ? 0.24 *
                        smooth((t - spec.signal[0]) / 0.5) *
                        (1 - smooth((t - spec.active[1]) / 0.45))
                      : spec.mode === 'chase-herding'
                        ? 0.18 *
                          smooth((t - spec.signal[0]) / 0.5) *
                          (1 - smooth((t - spec.active[1]) / 0.45))
                        : 0.2 * prepare,
      lift: spec.mode === 'landing' && phase === 1 ? pulse(clamp(action / 0.52)) : 0,
      attack:
        spec.mode === 'speed-change'
          ? dangerActive
            ? t >= spec.switchAt
              ? 1
              : 0.55
            : 0
          : spec.mode === 'volley' && phase === 1
            ? Math.max(0, 1 - Math.abs(t - spec.release) / 0.36)
            : spec.mode === 'limited-spread' && phase === 1
              ? Math.max(
                  ...spec.releases.map((release) => Math.max(0, 1 - Math.abs(t - release) / 0.3)),
                )
              : spec.mode === 'burst-fire' && phase === 1
                ? Math.max(
                    ...spec.releases.map((release) =>
                      Math.max(0, 1 - Math.abs(t - release) / 0.32),
                    ),
                  )
                : spec.mode === 'part-break'
                  ? Math.max(
                      strikePulse(t, spec.firstShot[0], 0.33),
                      strikePulse(t, spec.secondAttempt, 0.33),
                    )
                  : spec.mode === 'attack-reflection'
                    ? strikePulse(t, spec.outgoing[1], 0.38)
                    : spec.mode === 'counter-stance'
                      ? strikePulse(t, spec.riposte[0], 0.52)
                      : spec.mode === 'absorption-power-up'
                        ? strikePulse(t, spec.shockwave[0], 0.62)
                        : spec.mode === 'interruptible-wind-up'
                          ? Math.max(
                              strikePulse(t, spec.interruptAt - 0.28, 0.8),
                              strikePulse(t, spec.release[0], 0.72),
                            )
                          : spec.mode === 'loadout-adaptation'
                            ? Math.max(
                                strikePulse(t, spec.reachAttack[0], 0.64),
                                strikePulse(t, spec.burstAttack[0], 0.68),
                              )
                            : spec.mode === 'wind-up'
                              ? Math.max(
                                  strikePulse(t, spec.firstRelease[0], 0.62),
                                  strikePulse(t, spec.secondRelease[0], 0.62),
                                )
                              : spec.mode === 'attack-lock'
                                ? Math.max(
                                    strikePulse(t, spec.firstRelease[0], 0.6),
                                    strikePulse(t, spec.secondRelease[0], 0.6),
                                  )
                                : spec.mode === 'active-phase'
                                  ? smooth(
                                      (t - spec.startup[0]) / (spec.active[0] - spec.startup[0]),
                                    ) *
                                    (1 - smooth((t - spec.followThroughEnd) / 0.72))
                                  : spec.mode === 'recovery'
                                    ? smooth(
                                        (t - spec.startup[0]) / (spec.active[0] - spec.startup[0]),
                                      ) *
                                      (1 - smooth((t - spec.recovery[0]) / 0.4))
                                    : spec.mode === 'survival-phase'
                                      ? Math.max(
                                          ...spec.hazards.map(({ active }) =>
                                            strikePulse(t, active[0], 0.5),
                                          ),
                                        )
                                      : spec.mode === 'teleport'
                                        ? strikePulse(t, spec.active[0], 0.68)
                                        : spec.mode === 'boundary-attack'
                                          ? strikePulse(t, spec.active[0], 0.72)
                                          : spec.mode === 'forced-scrolling'
                                            ? smooth(
                                                (t - spec.signal[0]) /
                                                  (spec.active[0] - spec.signal[0]),
                                              ) *
                                              (1 - smooth((t - spec.active[1]) / 0.4))
                                            : phase === 1
                                              ? 0.75
                                              : prepare * 0.35,
      impact:
        spec.mode === 'landing'
          ? pulse(clamp((action - 0.42) / 0.22))
          : spec.mode === 'directional-shield'
            ? strikePulse(t, spec.sideStrike, 0.27)
            : spec.mode === 'damage-type-resistance'
              ? 0.18 * strikePulse(t, spec.slashStrike, 0.25) +
                0.9 * strikePulse(t, spec.thrustStrike, 0.28)
              : spec.mode === 'situational-immunity'
                ? 0.12 * strikePulse(t, spec.blockedStrike, 0.25) +
                  0.9 * strikePulse(t, spec.openStrike, 0.28)
                : spec.mode === 'part-break'
                  ? 0.75 * strikePulse(t, spec.breakAt, 0.26)
                  : spec.mode === 'attack-reflection'
                    ? 0.85 * strikePulse(t, spec.meleeStrike, 0.27)
                    : spec.mode === 'counter-stance'
                      ? 0.85 * strikePulse(t, spec.openStrike, 0.27)
                      : spec.mode === 'absorption-power-up'
                        ? 0.85 * strikePulse(t, spec.openStrike, 0.27)
                        : spec.mode === 'interruptible-wind-up'
                          ? 0.9 * strikePulse(t, spec.interruptAt, 0.3)
                          : spec.mode === 'wind-up'
                            ? 0.65 *
                              Math.max(
                                strikePulse(t, spec.firstRelease[0], 0.28),
                                strikePulse(t, spec.secondRelease[0], 0.28),
                              )
                            : spec.mode === 'attack-lock'
                              ? 0.55 *
                                Math.max(
                                  strikePulse(t, spec.firstRelease[0], 0.28),
                                  strikePulse(t, spec.secondRelease[0], 0.28),
                                )
                              : spec.mode === 'active-phase'
                                ? strikePulse(t, spec.active[0], 0.3)
                                : spec.mode === 'recovery'
                                  ? Math.max(
                                      0.55 * strikePulse(t, spec.active[0], 0.3),
                                      0.85 * strikePulse(t, spec.punishAt, 0.3),
                                    )
                                  : spec.mode === 'survival-phase'
                                    ? Math.max(
                                        ...spec.hazards.map(
                                          ({ active }) => 0.45 * strikePulse(t, active[0], 0.28),
                                        ),
                                        0.85 * strikePulse(t, spec.punishAt, 0.3),
                                      )
                                    : spec.mode === 'teleport'
                                      ? Math.max(
                                          0.6 * strikePulse(t, spec.active[0], 0.3),
                                          0.85 * strikePulse(t, spec.punishAt, 0.3),
                                        )
                                      : spec.mode === 'boundary-attack'
                                        ? Math.max(
                                            0.7 * strikePulse(t, spec.impactAt, 0.3),
                                            0.85 * strikePulse(t, spec.punishAt, 0.3),
                                          )
                                        : spec.mode === 'forced-scrolling'
                                          ? Math.max(
                                              0.55 * strikePulse(t, spec.active[1], 0.32),
                                              0.85 * strikePulse(t, spec.punishAt, 0.3),
                                            )
                                          : spec.mode === 'chase-herding'
                                            ? Math.max(
                                                0.55 * strikePulse(t, spec.active[1], 0.32),
                                                0.85 * strikePulse(t, spec.punishAt, 0.3),
                                              )
                                            : spec.mode === 'shockwave' || spec.mode === 'knockback'
                                              ? pulse(action * 3)
                                              : spec.mode === 'chain-explosions'
                                                ? pulse((action * 5) % 1)
                                                : 0,
    }),
    playerMotion: motion({
      gait:
        spec.mode === 'active-phase'
          ? t * 7 * stride
          : spec.mode === 'recovery'
            ? t * 7 * stride
            : spec.mode === 'survival-phase'
              ? t * 7 * stride
              : spec.mode === 'teleport'
                ? t * 7 * stride
                : spec.mode === 'boundary-attack'
                  ? t * 7 * stride
                  : spec.mode === 'forced-scrolling'
                    ? t * 7 * stride
                    : spec.mode === 'chase-herding'
                      ? t * 7 * stride
                      : (route * responseProgress + route * returnProgress) / 20,
      stride,
      lean: stride * 0.45,
      crouch: stride * 0.16,
      dodge: phase === 0 ? pulse(responseProgress) * 0.45 : 0,
      attack:
        spec.mode === 'directional-shield'
          ? Math.max(strikePulse(t, spec.frontStrike, 0.3), strikePulse(t, spec.sideStrike, 0.3))
          : spec.mode === 'damage-type-resistance'
            ? Math.max(
                strikePulse(t, spec.slashStrike, 0.3),
                strikePulse(t, spec.thrustStrike, 0.3),
              )
            : spec.mode === 'situational-immunity'
              ? Math.max(
                  strikePulse(t, spec.blockedStrike, 0.3),
                  strikePulse(t, spec.wardStrike, 0.3),
                  strikePulse(t, spec.openStrike, 0.3),
                )
              : spec.mode === 'part-break'
                ? strikePulse(t, spec.breakAt, 0.33)
                : spec.mode === 'attack-reflection'
                  ? Math.max(
                      strikePulse(t, spec.outgoing[0], 0.32),
                      strikePulse(t, spec.meleeStrike, 0.33),
                    )
                  : spec.mode === 'counter-stance'
                    ? Math.max(
                        strikePulse(t, spec.parriedStrike, 0.3),
                        strikePulse(t, spec.openStrike, 0.33),
                      )
                    : spec.mode === 'absorption-power-up'
                      ? Math.max(
                          strikePulse(t, spec.firstPulse[0], 0.32),
                          strikePulse(t, spec.secondPulse[0], 0.32),
                          strikePulse(t, spec.openStrike, 0.33),
                        )
                      : spec.mode === 'interruptible-wind-up'
                        ? strikePulse(t, spec.interruptAt, 0.38)
                        : spec.mode === 'loadout-adaptation'
                          ? strikePulse(t, spec.swapAt, 0.34)
                          : spec.mode === 'active-phase'
                            ? strikePulse(t, spec.punishAt, 0.38)
                            : spec.mode === 'recovery'
                              ? strikePulse(t, spec.punishAt, 0.38)
                              : spec.mode === 'survival-phase'
                                ? strikePulse(t, spec.punishAt, 0.38)
                                : spec.mode === 'teleport'
                                  ? strikePulse(t, spec.punishAt, 0.38)
                                  : spec.mode === 'boundary-attack'
                                    ? strikePulse(t, spec.punishAt, 0.38)
                                    : spec.mode === 'forced-scrolling'
                                      ? strikePulse(t, spec.punishAt, 0.38)
                                      : spec.mode === 'chase-herding'
                                        ? strikePulse(t, spec.punishAt, 0.38)
                                        : spec.mode === 'decoy' && phase === 1
                                          ? pulse(clamp((action - 0.52) / 0.3))
                                          : spec.mode === 'weak-point' && phase === 1
                                            ? pulse(action * 1.5)
                                            : 0,
    }),
  };
  if (spec.mode === 'directional-shield') {
    frame.frontStrike =
      strikePulse(t, spec.frontStrike) > 0.5 && directionalShieldOutcome(t, player) === 'blocked';
    frame.sideStrike =
      strikePulse(t, spec.sideStrike) > 0.5 && directionalShieldOutcome(t, player) === 'hit';
  }
  if (spec.mode === 'damage-type-resistance') {
    frame.resistedStrike = strikePulse(t, spec.slashStrike) > 0.5;
    frame.normalStrike = strikePulse(t, spec.thrustStrike) > 0.5;
    frame.damageComparison = {
      slash: damageTypeResistanceDamage('slash', spec.baseDamage),
      thrust: damageTypeResistanceDamage('thrust', spec.baseDamage),
    };
  }
  if (spec.mode === 'situational-immunity') {
    frame.immunity = situationalImmunityOutcome(t);
    frame.blockedStrike = strikePulse(t, spec.blockedStrike) > 0.5;
    frame.wardStrike = strikePulse(t, spec.wardStrike) > 0.5;
    frame.openStrike = strikePulse(t, spec.openStrike) > 0.5;
  }
  if (spec.mode === 'part-break') {
    frame.partState = partBreakState(t);
    frame.launcherCanFire = partBreakCanFire(t);
    frame.firstShot = dangerActive;
    frame.secondAttempt = strikePulse(t, spec.secondAttempt) > 0.5;
    frame.partStrike = strikePulse(t, spec.breakAt) > 0.5;
  }
  if (spec.mode === 'attack-reflection') {
    frame.reflectionState = attackReflectionState(t);
    frame.outgoingShot = t >= spec.outgoing[0] && t < spec.outgoing[1];
    frame.reflectedShot = dangerActive;
    frame.meleeStrike = strikePulse(t, spec.meleeStrike) > 0.5;
  }
  if (spec.mode === 'counter-stance') {
    frame.counterState = counterStanceState(t);
    frame.parriedStrike = strikePulse(t, spec.parriedStrike) > 0.5;
    frame.openStrike = strikePulse(t, spec.openStrike) > 0.5;
    frame.riposte = dangerActive;
  }
  if (spec.mode === 'absorption-power-up') {
    frame.absorptionCharge = absorptionCharge(t);
    frame.absorptionState = dangerActive
      ? 'empowered-release'
      : t >= spec.spentAt && t < spec.openStrike + 0.35
        ? 'spent-open'
        : t >= spec.chargeWindup && t < spec.spentAt
          ? 'charged'
          : t >= 0.6 && t < spec.chargeWindup
            ? 'accepting'
            : 'idle';
    frame.absorbedFirst = strikePulse(t, spec.firstPulse[1], 0.26) > 0.5;
    frame.absorbedSecond = strikePulse(t, spec.secondPulse[1], 0.26) > 0.5;
    frame.openStrike = strikePulse(t, spec.openStrike, 0.3) > 0.5;
  }
  if (spec.mode === 'interruptible-wind-up') {
    frame.windUpState = interruptibleWindUpState(t);
    frame.interruptHit = strikePulse(t, spec.interruptAt, 0.3) > 0.5;
    frame.threatReleased = dangerActive;
    frame.interruptible =
      (t >= spec.firstWindup[0] && t < spec.interruptAt) ||
      (t >= spec.secondWindup[0] && t < spec.release[0]);
  }
  if (spec.mode === 'loadout-adaptation') {
    frame.loadoutState = loadoutAdaptationState(t);
    frame.loadout = t < spec.swapAt ? 'reach-rune' : 'burst-rune';
    frame.adaptedPackage = loadoutAdaptationPackage(frame.loadout);
    frame.reachDanger = t >= spec.reachAttack[0] && t < spec.reachAttack[1];
    frame.burstDanger = t >= spec.burstAttack[0] && t < spec.burstAttack[1];
  }
  if (spec.mode === 'wind-up') {
    frame.windUpState = windUpState(t);
    frame.windUpProgress = windUpProgress(t);
    frame.windUpBeat = Math.min(3, Math.floor(frame.windUpProgress * 3 + 0.001));
    frame.windUpRelease = dangerActive;
  }
  if (spec.mode === 'attack-lock') {
    frame.attackLockState = attackLockState(t);
    const firstCycle = t < spec.secondSetup;
    const locked = firstCycle ? t >= spec.firstLock : t >= spec.secondLock;
    const captured = point(firstCycle ? spec.firstLockPoint : spec.secondLockPoint);
    frame.attackLockTarget = locked ? captured : player;
    const angle = Math.atan2(frame.attackLockTarget.y - boss.y, frame.attackLockTarget.x - boss.x);
    frame.attackLockEnd = polar(boss, spec.laneLength, angle);
    frame.attackLocked =
      (t >= spec.firstLock && t < spec.firstRecoveryEnd) ||
      (t >= spec.secondLock && t < spec.recoveryEnd);
    frame.attackLockRelease = dangerActive;
  }
  if (spec.mode === 'active-phase') {
    frame.activePhaseState = activePhaseState(t);
    frame.hitboxActive = dangerActive;
    frame.followThroughVisible = t >= spec.active[1] && t < spec.followThroughEnd;
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  if (spec.mode === 'forced-scrolling') {
    frame.forcedScrollingState = forcedScrollingState(t);
    frame.forcedScrollingActive = dangerActive;
    frame.forcedScrollingOffset = forcedScrollingOffset(t);
    frame.forcedScrollingRouteCleared = t >= spec.active[1] && t < spec.resetAt;
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  if (spec.mode === 'chase-herding') {
    frame.chaseHerdingState = chaseHerdingState(t);
    frame.chaseDistance = Math.hypot(player.x - boss.x, player.y - boss.y);
    frame.chaseInBand =
      frame.chaseDistance >= spec.distanceBand[0] && frame.chaseDistance <= spec.distanceBand[1];
    frame.chaseIntercepted = t >= 2.55 && t < spec.resetAt;
    frame.chaseCaptured = t >= spec.active[1] && t < spec.resetAt;
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  if (spec.mode === 'boundary-attack') {
    frame.boundaryAttackState = boundaryAttackState(t);
    frame.boundarySignalActive = t >= spec.signal[0] && t < spec.active[0];
    frame.boundaryCrossingActive = dangerActive;
    frame.boundarySourceOutside =
      t < spec.active[0] || t >= spec.openingEnd || boss.x < spec.leftBoundary;
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  if (spec.mode === 'teleport') {
    frame.teleportState = teleportState(t);
    frame.teleportAbsent =
      (t >= spec.absent[0] && t < spec.arrival[0]) ||
      (t >= spec.resetAbsent[0] && t < spec.resetArrival[0]);
    frame.teleportDestinationRevealed = t >= spec.destinationPreview[0] && t < spec.recoveryEnd;
    frame.teleportFollowUpActive = dangerActive;
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  if (spec.mode === 'recovery') {
    frame.recoveryState = recoveryState(t);
    frame.recoveryLocked = t >= spec.recovery[0] && t < spec.recovery[1];
    frame.bossReady = t >= spec.recovery[1];
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
    frame.withinPunishReach =
      Math.hypot(player.x - boss.x, player.y - boss.y) <=
      spec.punishReach + BLUEPRINT_PLAYER_RADIUS;
  }
  if (spec.mode === 'survival-phase') {
    frame.survivalPhaseState = survivalPhaseState(t);
    frame.survivalShielded = t >= spec.survival[0] && t < spec.shieldDropsAt;
    frame.survivalComplete = t >= spec.shieldDropsAt;
    frame.survivalHazardIndex = spec.hazards.findIndex(
      ({ active }) => t >= active[0] && t < active[1],
    );
    frame.survivalRemaining = clamp(
      1 - (t - spec.survival[0]) / (spec.shieldDropsAt - spec.survival[0]),
    );
    frame.punishStrike = strikePulse(t, spec.punishAt, 0.38) > 0.5;
  }
  frame.primitives = primitivesFor(spec, frame);
  frame.playerSafe = pointClearsThreat(spec, frame, player);
  frame.bossLabel = {
    x: boss.x,
    y: boss.y + BLUEPRINT_BOSS_LABEL_OFFSET_Y * frame.bossScale,
  };
  frame.playerLabel = {
    x: player.x,
    y:
      player.y +
      (spec.mode === 'directional-shield' ||
      spec.mode === 'damage-type-resistance' ||
      spec.mode === 'situational-immunity' ||
      spec.mode === 'part-break' ||
      spec.mode === 'attack-reflection' ||
      spec.mode === 'counter-stance' ||
      spec.mode === 'absorption-power-up' ||
      spec.mode === 'interruptible-wind-up' ||
      spec.mode === 'loadout-adaptation' ||
      spec.mode === 'wind-up' ||
      spec.mode === 'attack-lock' ||
      spec.mode === 'active-phase' ||
      spec.mode === 'recovery' ||
      spec.mode === 'survival-phase' ||
      spec.mode === 'teleport' ||
      spec.mode === 'boundary-attack' ||
      spec.mode === 'forced-scrolling' ||
      spec.mode === 'chase-herding'
        ? 92
        : -62),
  };
  return Object.freeze(frame);
}

export function blueprintPointSafe(id, time, value, radius = BLUEPRINT_PLAYER_RADIUS) {
  const frame = blueprintFrame(id, time);
  return pointClearsThreat(blueprintSpec(id), frame, value, radius);
}
