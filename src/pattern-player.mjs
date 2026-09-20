import { patternFrame, PATTERN_DURATION } from './pattern-model.mjs';

for (const widget of document.querySelectorAll('[data-pattern-demo]')) initializePattern(widget);

export function initializePattern(widget) {
  if (widget.dataset.patternReady) return;
  const find = (selector) => widget.querySelector(selector);
  const config = JSON.parse(find('[data-pattern-config]').textContent);
  const kind = widget.dataset.patternKind;
  const timeline = find('[data-pattern-timeline]');
  const phaseName = find('[data-pattern-phase-name]');
  const phaseTooltip = find('[data-pattern-phase-tooltip]');
  const boss = find('[data-pattern-boss]');
  const player = find('[data-pattern-player]');
  const bossLabel = find('[data-pattern-boss-label]');
  const playerLabel = find('[data-pattern-player-label]');
  const sweep = find('[data-pattern-sweep]');
  const slam = find('[data-pattern-slam]');
  const slamRing = find('[data-pattern-slam-ring]');
  const slamEdge = find('[data-pattern-slam-edge]');
  const summon = find('[data-pattern-summon]');
  const minions = [...widget.querySelectorAll('[data-pattern-minion]')];
  const volley = find('[data-pattern-volley]');
  const projectiles = find('[data-pattern-projectiles]');
  const status = find('[data-pattern-status]');
  const motionNote = find('[data-pattern-motion-note]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let time = 0;
  let running = false;
  let animationId = 0;
  let lastTimestamp;
  let announcedPhase = -1;
  let resumeAfterScrub = false;

  function render() {
    const frame = patternFrame(kind, time);
    widget.dataset.patternPhase = String(frame.phase);
    widget.dataset.patternOutcome = frame.clear ? 'safe' : 'pending';
    const bossRotation = kind === 'sweep' ? frame.sweepRotation - 32 : 90;
    boss.setAttribute(
      'transform',
      `translate(${frame.boss.x} ${frame.boss.y + frame.bossRock}) rotate(${bossRotation})`,
    );
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    bossLabel.setAttribute('x', frame.bossLabel.x);
    bossLabel.setAttribute('y', frame.bossLabel.y);
    playerLabel.setAttribute('x', frame.player.x);
    playerLabel.setAttribute('y', frame.player.y - 48);
    sweep.setAttribute('opacity', String(frame.sweepOpacity));
    sweep.setAttribute('transform', `rotate(${frame.sweepRotation} 280 275)`);
    slam.setAttribute('opacity', String(frame.slamOpacity));
    slamRing.setAttribute('r', frame.slamRadius);
    slamEdge.setAttribute('r', frame.slamRadius);
    summon.setAttribute('opacity', String(frame.summonOpacity));
    const starts = [
      [135, 465],
      [280, 515],
      [425, 465],
    ];
    const ends = [
      [175, 650],
      [300, 680],
      [420, 610],
    ];
    minions.forEach((minion, index) => {
      const progress = Math.max(0, Math.min(1, frame.summonProgress * 1.35 - index * 0.18));
      const x = starts[index][0] + (ends[index][0] - starts[index][0]) * progress;
      const y = starts[index][1] + (ends[index][1] - starts[index][1]) * progress;
      minion.setAttribute('transform', `translate(${x} ${y}) scale(${0.55 + progress * 0.45})`);
    });
    volley.setAttribute('opacity', String(frame.volleyOpacity));
    projectiles.setAttribute('transform', `translate(0 ${frame.volleyY})`);
    phaseName.textContent = config.phaseNames[frame.phase];
    phaseTooltip.textContent = config.phaseDescriptions[frame.phase];
    if (announcedPhase !== frame.phase) {
      status.textContent =
        frame.phase === 0 ? config.danger : frame.phase === 1 ? config.locked : config.safe;
      announcedPhase = frame.phase;
    }
    timeline.value = String(Math.round(time * 1000));
    timeline.setAttribute('aria-valuetext', config.phaseNames[frame.phase]);
    widget.style.setProperty('--pattern-progress', `${(time / PATTERN_DURATION) * 100}%`);
  }

  function setRunning(next) {
    running = next;
    widget.dataset.patternPlaying = String(next);
    cancelAnimationFrame(animationId);
    lastTimestamp = undefined;
    if (running) animationId = requestAnimationFrame(tick);
  }
  function tick(timestamp) {
    if (!running) return;
    if (lastTimestamp !== undefined)
      time = (time + (timestamp - lastTimestamp) / 1000) % PATTERN_DURATION;
    lastTimestamp = timestamp;
    render();
    animationId = requestAnimationFrame(tick);
  }
  timeline.addEventListener('pointerdown', () => {
    resumeAfterScrub = running;
    setRunning(false);
  });
  timeline.addEventListener('input', () => {
    time = Number(timeline.value) / 1000;
    render();
  });
  const finishScrub = () => {
    if (resumeAfterScrub && !reducedMotion.matches && !document.hidden) setRunning(true);
    resumeAfterScrub = false;
  };
  timeline.addEventListener('pointerup', finishScrub);
  timeline.addEventListener('pointercancel', finishScrub);
  timeline.addEventListener('change', finishScrub);
  const applyMotionPreference = () => {
    motionNote.hidden = !reducedMotion.matches;
    setRunning(!reducedMotion.matches && !document.hidden);
  };
  reducedMotion.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', applyMotionPreference);
  widget.dataset.patternReady = 'true';
  render();
  applyMotionPreference();
}
