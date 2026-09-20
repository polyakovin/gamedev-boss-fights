export const PATTERN_DURATION = 6;
export const PATTERN_PHASE_ENDS = Object.freeze([1.6, 4.25, PATTERN_DURATION]);
export const BOSS_LABEL_OFFSET_Y = -104;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const pulse = (value) => Math.sin(clamp(value) * Math.PI);

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
  const action = smooth(
    (t - PATTERN_PHASE_ENDS[0]) / (PATTERN_PHASE_ENDS[1] - PATTERN_PHASE_ENDS[0]),
  );
  const recover = smooth((t - PATTERN_PHASE_ENDS[1]) / (PATTERN_DURATION - PATTERN_PHASE_ENDS[1]));
  const visibility = phase === 2 ? 1 - recover : phase === 0 ? prepare : 1;
  const boss = { x: 280, y: kind === 'gap-volley' ? 175 : kind === 'summon' ? 235 : 275 };
  const playerStart = kind === 'sweep' ? { x: 412, y: 525 } : { x: 390, y: 700 };
  const playerTarget =
    kind === 'sweep'
      ? { x: 300, y: 405 }
      : kind === 'ground-slam'
        ? { x: 280, y: 785 }
        : kind === 'summon'
          ? { x: 170, y: 720 }
          : { x: 280, y: 760 };
  const move = phase === 0 ? prepare : phase === 1 ? 1 : 1 - recover;
  const bossRock = phase === 0 ? -7 * pulse(prepare) : phase === 1 ? 8 * pulse(action) : 0;
  const player = {
    x: mix(playerStart.x, playerTarget.x, move),
    y: mix(playerStart.y, playerTarget.y, move),
  };

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
    sweepRotation: mix(-72, 190, action),
    sweepOpacity: kind === 'sweep' ? visibility : 0,
    slamRadius: mix(58, 390, action),
    slamOpacity: kind === 'ground-slam' ? visibility : 0,
    summonProgress: kind === 'summon' ? action : 0,
    summonOpacity: kind === 'summon' ? visibility : 0,
    volleyY: mix(0, 560, action),
    volleyOpacity: kind === 'gap-volley' ? visibility : 0,
    clear: phase > 0,
  });
}
