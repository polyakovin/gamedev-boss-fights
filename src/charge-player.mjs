import { chargeFrame, DEFAULT_PLAN, DURATION, PHASE_TIMES, PREVIEW_TIME } from './charge-model.mjs';

let instance = 0;
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
  const speedInput = find('[data-charge-speed]');
  const phaseButtons = [...widget.querySelectorAll('[data-charge-phase]')];
  const scenarioInputs = [...widget.querySelectorAll('[data-charge-scenario]')];
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
  const impact = find('[data-charge-impact]');
  const recovery = find('[data-charge-recovery]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const number = new Intl.NumberFormat(document.documentElement.lang || undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const rateNumber = new Intl.NumberFormat(document.documentElement.lang || undefined, {
    maximumFractionDigits: 2,
  });
  let time = PREVIEW_TIME;
  let speed = 1;
  let scenario = 'sidestep';
  let running = false;
  let playFromStart = true;
  let animationId = 0;
  let lastTimestamp;
  let announcedPhase = 1;

  // Radios within this widget share a name, without affecting a second lesson.
  const radioGroup = `charge-scenario-${++instance}`;
  for (const input of scenarioInputs) input.name = radioGroup;

  function render() {
    const frame = chargeFrame(time, scenario);
    const angle = (Math.atan2(frame.heading.y, frame.heading.x) * 180) / Math.PI;
    widget.dataset.chargePhase = String(frame.phase);
    widget.dataset.chargeOutcome = frame.hit ? 'hit' : frame.clear ? 'safe' : 'pending';
    boss.setAttribute('transform', `translate(${frame.boss.x} ${frame.boss.y}) rotate(${angle})`);
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    lane.setAttribute(
      'transform',
      `translate(${DEFAULT_PLAN.origin.x} ${DEFAULT_PLAN.origin.y}) rotate(${angle})`,
    );
    lane.setAttribute('opacity', frame.phase === 3 ? '.22' : frame.phase === 0 ? '.5' : '1');
    target.setAttribute('transform', `translate(${frame.target.x} ${frame.target.y})`);
    target.setAttribute('opacity', frame.phase === 3 ? '.2' : '.8');
    path.setAttribute(
      'd',
      scenario === 'sidestep'
        ? 'M 610 218 V 154 M 602 165 L 610 154 L 618 165'
        : 'M 645 240 H 733 M 721 232 L 733 240 L 721 248',
    );
    path.setAttribute('stroke', scenario === 'sidestep' ? '#27786d' : '#ac5646');
    path.setAttribute('opacity', frame.phase === 1 ? '1' : frame.phase === 2 ? '.5' : '0');
    bossLabel.setAttribute('x', frame.boss.x);
    playerLabel.setAttribute('x', frame.player.x);
    playerLabel.setAttribute('y', frame.player.y - 47);
    impact.setAttribute('visibility', frame.hit ? 'visible' : 'hidden');
    recovery.setAttribute('visibility', frame.phase === 3 ? 'visible' : 'hidden');
    status.textContent =
      frame.phase === 0
        ? text.danger
        : frame.phase === 1
          ? text.locked
          : frame.hit
            ? text.hit
            : frame.clear
              ? text.safe
              : text.path;
    statusBackground.setAttribute('fill', frame.phase >= 2 && frame.clear ? '#dcebe1' : '#f2e2d7');
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
      time = Math.min(DURATION, time + ((timestamp - lastTimestamp) * speed) / 1000);
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
  speedInput.addEventListener('input', () => {
    speed = Number(speedInput.value);
    find('[data-charge-speed-value]').textContent = `${rateNumber.format(speed)}×`;
    speedInput.setAttribute('aria-valuetext', `${rateNumber.format(speed)}×`);
  });
  for (const button of phaseButtons)
    button.addEventListener('click', () => {
      setRunning(false);
      playFromStart = false;
      time = PHASE_TIMES[Number(button.dataset.chargePhase)];
      render();
    });
  for (const input of scenarioInputs)
    input.addEventListener('change', () => {
      if (!input.checked) return;
      setRunning(false);
      scenario = input.value;
      playFromStart = true;
      time = PREVIEW_TIME;
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
