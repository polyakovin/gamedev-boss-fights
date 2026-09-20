import { chargeFrame, DURATION } from './charge-model.mjs';
import { createCharacterAnimator } from './character-motion.mjs';
import { createEncounterEffects } from './encounter-effects.mjs';

for (const widget of document.querySelectorAll('[data-charge-demo]')) initializeCharge(widget);

export function initializeCharge(widget) {
  if (widget.dataset.chargeReady) return;
  const configElement = widget.querySelector('[data-charge-config]');
  if (!configElement) return;
  const text = JSON.parse(configElement.textContent);
  const find = (selector) => widget.querySelector(selector);
  const timeline = find('[data-charge-timeline]');
  const currentPhase = find('[data-charge-current-phase]');
  const phaseName = find('[data-charge-phase-name]');
  const phaseTooltip = find('[data-charge-phase-tooltip]');
  const boss = find('[data-charge-boss]');
  const player = find('[data-charge-player]');
  const animateBoss = createCharacterAnimator(boss, 'kern');
  const animatePlayer = createCharacterAnimator(player, 'tavi');
  const animateEffects = createEncounterEffects(widget, chargeFrame);
  const lane = find('[data-charge-lane]');
  const target = find('[data-charge-target]');
  const path = find('[data-charge-dodge]');
  const status = find('[data-charge-status]');
  const bossLabel = find('[data-charge-boss-label]');
  const playerLabel = find('[data-charge-player-label]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const number = new Intl.NumberFormat(document.documentElement.lang || undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  let time = 0;
  let running = false;
  let animationId = 0;
  let lastTimestamp;
  let announcedState = '';
  let scrubbing = false;
  let phaseHovered = false;

  function render() {
    const frame = chargeFrame(time);
    const angle = frame.rotation ?? (Math.atan2(frame.heading.y, frame.heading.x) * 180) / Math.PI;
    widget.dataset.chargePhase = String(frame.phase);
    widget.dataset.chargeAttack = String(frame.attackIndex);
    widget.dataset.chargeOutcome = frame.clear ? 'safe' : 'pending';
    widget.dataset.chargeTransition = String(frame.transitioning);
    boss.setAttribute('transform', `translate(${frame.boss.x} ${frame.boss.y})`);
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    animateBoss(frame.bossMotion, frame.bossFacing);
    animatePlayer(frame.playerMotion, frame.playerFacing);
    animateEffects(time, frame);
    const laneAngle = frame.transitioning
      ? (Math.atan2(frame.plan.heading.y, frame.plan.heading.x) * 180) / Math.PI
      : angle;
    lane.setAttribute(
      'transform',
      `translate(${frame.plan.origin.x} ${frame.plan.origin.y}) rotate(${laneAngle})`,
    );
    lane.setAttribute(
      'opacity',
      String((frame.phase === 0 ? 0.45 : frame.phase === 1 ? 1 : 0.3) * frame.overlayOpacity),
    );
    target.setAttribute('transform', `translate(${frame.target.x} ${frame.target.y})`);
    target.setAttribute('opacity', String((frame.phase === 2 ? 0.35 : 0.8) * frame.overlayOpacity));
    const dodgeDirection = Math.sign(frame.dodgeTarget.x - frame.plan.target.x) || 1;
    const arrowBase = frame.dodgeTarget.x - dodgeDirection * 11;
    path.setAttribute(
      'd',
      `M ${frame.plan.target.x} ${frame.plan.target.y} H ${frame.dodgeTarget.x} M ${arrowBase} ${frame.dodgeTarget.y - 8} L ${frame.dodgeTarget.x} ${frame.dodgeTarget.y} L ${arrowBase} ${frame.dodgeTarget.y + 8}`,
    );
    const pathOpacity = frame.phase === 1 ? 1 : frame.phase === 2 ? 0.45 : 0;
    path.setAttribute('opacity', String(pathOpacity * frame.overlayOpacity));
    bossLabel.setAttribute('x', frame.bossLabel.x);
    bossLabel.setAttribute('y', frame.bossLabel.y);
    playerLabel.setAttribute('x', frame.player.x);
    playerLabel.setAttribute('y', frame.player.y - 62);
    currentPhase.dataset.chargePhase = String(frame.phase);
    phaseName.textContent = text.phaseNames[frame.phase];
    phaseTooltip.textContent = text.phaseDescriptions[frame.phase];
    const state = `${frame.attackIndex}:${frame.phase}`;
    if (state !== announcedState) {
      status.textContent =
        frame.phase === 0 ? text.danger : frame.phase === 1 ? text.locked : text.safe;
      announcedState = state;
    }
    timeline.value = String(Math.round(time * 1000));
    widget.style.setProperty('--charge-progress', `${(time / DURATION) * 100}%`);
    timeline.setAttribute(
      'aria-valuetext',
      `${text.phaseNames[frame.phase]} · ${number.format(time)} / ${number.format(DURATION)}`,
    );
  }

  function setRunning(next) {
    running = next;
    widget.dataset.chargePlaying = String(running);
    cancelAnimationFrame(animationId);
    lastTimestamp = undefined;
    if (running) animationId = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    if (!running) return;
    if (lastTimestamp !== undefined) time = (time + (timestamp - lastTimestamp) / 1000) % DURATION;
    lastTimestamp = timestamp;
    render();
    animationId = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    setRunning(!reducedMotion.matches && !document.hidden && !scrubbing && !phaseHovered);
  }

  timeline.addEventListener('pointerdown', () => {
    scrubbing = true;
    updatePlayback();
  });
  timeline.addEventListener('input', () => {
    time = Number(timeline.value) / 1000;
    render();
  });
  const finishScrub = () => {
    scrubbing = false;
    updatePlayback();
  };
  timeline.addEventListener('pointerup', finishScrub);
  timeline.addEventListener('pointercancel', finishScrub);
  timeline.addEventListener('change', finishScrub);
  currentPhase.addEventListener('pointerenter', () => {
    phaseHovered = true;
    updatePlayback();
  });
  currentPhase.addEventListener('pointerleave', () => {
    phaseHovered = false;
    updatePlayback();
  });

  function applyMotionPreference() {
    find('[data-charge-motion-note]').hidden = !reducedMotion.matches;
    updatePlayback();
  }
  reducedMotion.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', updatePlayback);
  widget.dataset.chargeReady = 'true';
  render();
  applyMotionPreference();
}
