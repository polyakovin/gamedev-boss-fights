/** Sample the simulation, not wall time, so pausing and scrubbing freeze every mote. */
export function createEncounterEffects(widget, frameAt) {
  const dust = Object.fromEntries(
    ['boss', 'player'].map((role) => [
      role,
      [...widget.querySelectorAll(`[data-encounter-dust="${role}"] ellipse`)],
    ]),
  );
  const impact = widget.querySelector('[data-encounter-impact]');
  return (time, frame) => {
    for (const role of ['boss', 'player']) {
      dust[role].forEach((particle, index) => {
        const age = 0.035 + index * 0.025;
        const previous = frameAt(Math.max(0, time - age));
        const strength = previous[`${role}Motion`]?.stride ?? 0;
        const spread = (index % 2 ? 1 : -1) * (5 + index * 1.8);
        particle.setAttribute('cx', previous[role].x + spread);
        particle.setAttribute('cy', previous[role].y + 36 - index * 0.8);
        particle.setAttribute('rx', 2 + index * 0.65);
        particle.setAttribute('ry', 1 + index * 0.28);
        particle.setAttribute('opacity', Math.max(0, strength - 0.3) * (1 - index / 10) * 0.42);
      });
    }
    const strength = frame.bossMotion?.impact ?? 0;
    impact.setAttribute('opacity', strength * 0.85);
    impact.setAttribute(
      'transform',
      `translate(${frame.boss.x} ${frame.boss.y + 35}) scale(${1.5 - strength * 0.5})`,
    );
  };
}
