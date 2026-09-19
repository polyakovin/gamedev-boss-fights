import { chargeFrame, DEFAULT_PLAN, DURATION, PHASE_TIMES, PREVIEW_TIME } from './charge-model.mjs';

for (const widget of document.querySelectorAll('[data-charge-demo]')) initializeCharge(widget);

export function initializeCharge(widget) {
  if (widget.dataset.chargeReady) return;
  const configElement = widget.querySelector('[data-charge-config]');
  if (!configElement) return;
  const text = JSON.parse(configElement.textContent);
  const find = (selector) => widget.querySelector(selector);
  const playButton = find('[data-charge-play]');
  const restartButton = find('[data-charge-restart]');
  const timeline = find('[data-charge-timeline]');
  const phaseButtons = [...widget.querySelectorAll('[data-charge-phase]')];
  const boss = find('[data-charge-boss]');
  const player = find('[data-charge-player]');
  const lane = find('[data-charge-lane]');
  const target = find('[data-charge-target]');
  const path = find('[data-charge-dodge]');
  const status = find('[data-charge-status] text');
  const statusBackground = find('[data-charge-status] rect');
  const description = find('[data-charge-description]');
  const bossLabel = find('[data-charge-boss-label]');
  const playerLabel = find('[data-charge-player-label]');
  const recovery = find('[data-charge-recovery]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const number = new Intl.NumberFormat(document.documentElement.lang || undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  let time = PREVIEW_TIME;
  let running = false;
  let playFromStart = true;
  let animationId = 0;
  let lastTimestamp;
  let announcedPhase = 1;

  function render() {
    const frame = chargeFrame(time);
    const angle = (Math.atan2(frame.heading.y, frame.heading.x) * 180) / Math.PI;
    widget.dataset.chargePhase = String(frame.phase);
    widget.dataset.chargeOutcome = frame.clear ? 'safe' : 'pending';
    boss.setAttribute('transform', `translate(${frame.boss.x} ${frame.boss.y}) rotate(${angle})`);
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    lane.setAttribute(
      'transform',
      `translate(${DEFAULT_PLAN.origin.x} ${DEFAULT_PLAN.origin.y}) rotate(${angle})`,
    );
    lane.setAttribute('opacity', frame.phase === 3 ? '.22' : frame.phase === 0 ? '.5' : '1');
    target.setAttribute('transform', `translate(${frame.target.x} ${frame.target.y})`);
    target.setAttribute('opacity', frame.phase === 3 ? '.2' : '.8');
    path.setAttribute('opacity', frame.phase === 1 ? '1' : frame.phase === 2 ? '.5' : '0');
    bossLabel.setAttribute('x', frame.boss.x);
    bossLabel.setAttribute('y', frame.boss.y + 72);
    playerLabel.setAttribute('x', frame.player.x);
    playerLabel.setAttribute('y', frame.player.y - 47);
    recovery.setAttribute('visibility', frame.phase === 3 ? 'visible' : 'hidden');
    status.textContent =
      frame.phase === 0
        ? text.danger
        : frame.phase === 1
          ? text.locked
          : frame.clear
            ? text.safe
            : text.path;
    const safeStatus = frame.phase >= 2 && frame.clear;
    statusBackground.setAttribute(
      'fill',
      safeStatus ? 'var(--diagram-status-safe)' : 'var(--diagram-status)',
    );
    status.setAttribute(
      'fill',
      safeStatus ? 'var(--diagram-status-safe-label)' : 'var(--diagram-status-label)',
    );
    for (const button of phaseButtons)
      button.setAttribute(
        'aria-pressed',
        String(Number(button.dataset.chargePhase) === frame.phase),
      );
    if (frame.phase !== announcedPhase) {
      const heading = document.createElement('strong');
      heading.textContent = `${text.phaseNames[frame.phase]}.`;
      description.replaceChildren(
        heading,
        document.createTextNode(` ${text.phaseDescriptions[frame.phase]}`),
      );
      announcedPhase = frame.phase;
    }
    timeline.value = String(Math.round(time * 1000));
    timeline.setAttribute(
      'aria-valuetext',
      `${text.phaseNames[frame.phase]} · ${number.format(time)} / ${number.format(DURATION)}`,
    );
    find('[data-charge-time]').textContent = `${number.format(time)} / ${number.format(DURATION)}`;
  }

  function setRunning(next) {
    running = next;
    playButton.querySelector('span').textContent = running ? text.pause : text.play;
    playButton.setAttribute('aria-label', running ? text.pause : text.play);
    playButton
      .querySelector('path')
      .setAttribute(
        'd',
        running ? 'M 4 3 H 7 V 15 H 4 Z M 11 3 H 14 V 15 H 11 Z' : 'M 5 3 L 14 9 L 5 15 Z',
      );
    widget.dataset.chargePlaying = String(running);
    cancelAnimationFrame(animationId);
    lastTimestamp = undefined;
    if (running) animationId = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    if (!running) return;
    if (lastTimestamp !== undefined)
      time = Math.min(DURATION, time + (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    render();
    if (time >= DURATION) setRunning(false);
    else animationId = requestAnimationFrame(tick);
  }

  playButton.addEventListener('click', () => {
    if (!running && (time >= DURATION || playFromStart)) time = 0;
    playFromStart = false;
    setRunning(!running);
    render();
  });
  restartButton.addEventListener('click', () => {
    setRunning(false);
    playFromStart = false;
    time = 0;
    render();
  });
  timeline.addEventListener('input', () => {
    setRunning(false);
    playFromStart = false;
    time = Number(timeline.value) / 1000;
    render();
  });
  for (const button of phaseButtons)
    button.addEventListener('click', () => {
      setRunning(false);
      playFromStart = false;
      time = PHASE_TIMES[Number(button.dataset.chargePhase)];
      render();
    });
  function showMotionPreference() {
    find('[data-charge-motion-note]').hidden = !reducedMotion.matches;
  }
  reducedMotion.addEventListener('change', showMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setRunning(false);
  });
  showMotionPreference();
  widget.dataset.chargeReady = 'true';
  setRunning(false);
  render();
}
