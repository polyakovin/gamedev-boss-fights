import { chargeFrame, DURATION } from './charge-model.mjs';

for (const widget of document.querySelectorAll('[data-charge-demo]')) initializeCharge(widget);

export function initializeCharge(widget) {
  if (widget.dataset.chargeReady) return;
  const configElement = widget.querySelector('[data-charge-config]');
  if (!configElement) return;
  const text = JSON.parse(configElement.textContent);
  const find = (selector) => widget.querySelector(selector);
  const timeline = find('[data-charge-timeline]');
  const phaseLabels = [...widget.querySelectorAll('[data-charge-phase-label]')];
  const boss = find('[data-charge-boss]');
  const player = find('[data-charge-player]');
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
  let resumeAfterScrub = false;

  function render() {
    const frame = chargeFrame(time);
    const angle = (Math.atan2(frame.heading.y, frame.heading.x) * 180) / Math.PI;
    widget.dataset.chargePhase = String(frame.phase);
    widget.dataset.chargeAttack = String(frame.attackIndex);
    widget.dataset.chargeOutcome = frame.clear ? 'safe' : 'pending';
    boss.setAttribute('transform', `translate(${frame.boss.x} ${frame.boss.y}) rotate(${angle})`);
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    lane.setAttribute(
      'transform',
      `translate(${frame.plan.origin.x} ${frame.plan.origin.y}) rotate(${angle})`,
    );
    lane.setAttribute('opacity', frame.phase === 0 ? '.5' : '1');
    target.setAttribute('transform', `translate(${frame.target.x} ${frame.target.y})`);
    target.setAttribute('opacity', frame.phase === 2 ? '.35' : '.8');
    const dodgeDirection = Math.sign(frame.dodgeTarget.x - frame.plan.target.x) || 1;
    const arrowBase = frame.dodgeTarget.x - dodgeDirection * 11;
    path.setAttribute(
      'd',
      `M ${frame.plan.target.x} ${frame.plan.target.y} H ${frame.dodgeTarget.x} M ${arrowBase} ${frame.dodgeTarget.y - 8} L ${frame.dodgeTarget.x} ${frame.dodgeTarget.y} L ${arrowBase} ${frame.dodgeTarget.y + 8}`,
    );
    path.setAttribute('opacity', frame.phase === 1 ? '1' : frame.phase === 2 ? '.45' : '0');
    bossLabel.setAttribute('x', frame.boss.x);
    bossLabel.setAttribute('y', frame.boss.y + (frame.attackIndex === 0 ? 72 : -72));
    playerLabel.setAttribute('x', frame.player.x);
    playerLabel.setAttribute('y', frame.player.y - 47);
    for (const label of phaseLabels) {
      if (Number(label.dataset.chargePhaseLabel) === frame.phase)
        label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    }
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
    find('[data-charge-time]').textContent = `${number.format(time)} / ${number.format(DURATION)}`;
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

  function applyMotionPreference() {
    find('[data-charge-motion-note]').hidden = !reducedMotion.matches;
    setRunning(!reducedMotion.matches && !document.hidden);
  }
  reducedMotion.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', () => {
    setRunning(!document.hidden && !reducedMotion.matches);
  });
  widget.dataset.chargeReady = 'true';
  render();
  applyMotionPreference();
}
