import {
  ATTACK_DURATION,
  BOSS_LABEL_OFFSET_Y,
  PHASE_ENDS,
  PLAYER_RADIUS,
  chargeFrame,
  createChargePlan,
  distanceToSegment,
} from './charge-model.mjs';

const PLAYER_SPEED = 340;
const HIT_RADIUS = PLAYER_RADIUS + 48;
const ATTACK_RANGE = 135;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const originFor = (round) => ({ x: 280, y: round % 2 ? 805 : 155 });

function planFor(origin, player) {
  const dx = player.x - origin.x;
  const dy = player.y - origin.y;
  const length = Math.hypot(dx, dy);
  const hx = dx / length;
  const hy = dy / length;
  const horizontal = hx < 0 ? (origin.x - 76) / -hx : (484 - origin.x) / hx;
  const vertical = hy < 0 ? (origin.y - 76) / -hy : (884 - origin.y) / hy;
  return createChargePlan({
    origin,
    target: player,
    distance: Math.min(485, horizontal, vertical),
  });
}

export function createChargeGame() {
  const player = { x: 280, y: 480 };
  return {
    time: 0,
    round: 0,
    player,
    plan: planFor(originFor(0), player),
    playerHealth: 3,
    bossHealth: 3,
    hitThisRound: false,
    struckThisRound: false,
    moving: false,
    gait: 0,
    facing: -90,
    attackFlash: 0,
    hitFlash: 0,
    result: null,
  };
}

export function chargeGameFrame(game) {
  const frame = chargeFrame(game.time, game.plan);
  const nextOrigin = originFor(game.round + 1);
  const boss = frame.transitioning
    ? {
        x: game.plan.end.x + (nextOrigin.x - game.plan.end.x) * smooth(frame.transitionProgress),
        y: game.plan.end.y + (nextOrigin.y - game.plan.end.y) * smooth(frame.transitionProgress),
      }
    : frame.boss;
  const player = game.player;
  const clear = distanceToSegment(player, game.plan.origin, game.plan.end) > PLAYER_RADIUS + 49;
  return {
    ...frame,
    player,
    boss,
    bossLabel: { x: boss.x, y: boss.y + BOSS_LABEL_OFFSET_Y },
    target: frame.phase === 0 ? player : game.plan.target,
    clear,
    playerFacing: game.facing,
    playerMotion: {
      gait: game.gait,
      stride: game.moving ? 0.75 : 0,
      lean: game.moving ? 0.16 : 0,
      attack: game.attackFlash > 0 ? 1 : 0,
      impact: game.hitFlash > 0 ? 0.7 : 0,
    },
  };
}

/** Advance in short fixed slices so fast charges cannot pass through the player. */
export function advanceChargeGame(game, input, elapsed) {
  if (game.result) return game;
  let remaining = clamp(Number.isFinite(elapsed) ? elapsed : 0, 0, 0.1);
  let attack = Boolean(input.attack);
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    remaining -= dt;
    const previous = chargeGameFrame(game);
    const dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
    const dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
    const length = Math.hypot(dx, dy);
    game.moving = length > 0;
    if (length) {
      game.player = {
        x: clamp(game.player.x + (dx / length) * PLAYER_SPEED * dt, 120, 440),
        y: clamp(game.player.y + (dy / length) * PLAYER_SPEED * dt, 305, 655),
      };
      game.gait += (PLAYER_SPEED * dt) / 20;
      game.facing = (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    const oldTime = game.time;
    game.time += dt;
    game.attackFlash = Math.max(0, game.attackFlash - dt);
    game.hitFlash = Math.max(0, game.hitFlash - dt);
    if (oldTime < PHASE_ENDS[0] && game.time >= PHASE_ENDS[0]) {
      game.plan = planFor(originFor(game.round), game.player);
    } else if (game.time < PHASE_ENDS[0]) {
      game.plan = planFor(originFor(game.round), game.player);
    }
    const frame = chargeGameFrame(game);
    if (attack) {
      game.attackFlash = 0.18;
      game.facing =
        (Math.atan2(frame.boss.y - game.player.y, frame.boss.x - game.player.x) * 180) / Math.PI;
    }
    if (
      frame.chargeActive &&
      !game.hitThisRound &&
      distanceToSegment(game.player, previous.boss, frame.boss) < HIT_RADIUS
    ) {
      game.playerHealth--;
      game.hitThisRound = true;
      game.hitFlash = 0.28;
      if (game.playerHealth === 0) game.result = 'lost';
    }
    if (
      attack &&
      frame.recovering &&
      !game.struckThisRound &&
      Math.hypot(game.player.x - frame.boss.x, game.player.y - frame.boss.y) < ATTACK_RANGE
    ) {
      game.bossHealth--;
      game.struckThisRound = true;
      game.attackFlash = 0.23;
      if (game.bossHealth === 0) game.result = 'won';
    }
    attack = false;
    if (game.result) break;
    if (game.time >= ATTACK_DURATION) {
      game.time -= ATTACK_DURATION;
      game.round++;
      game.plan = planFor(originFor(game.round), game.player);
      game.hitThisRound = false;
      game.struckThisRound = false;
    }
  }
  return game;
}
