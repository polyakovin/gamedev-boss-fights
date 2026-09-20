export function createSweepWeaponAnimator(element) {
  const layer = element.querySelector('[data-sweep-equipment]');
  if (!layer) return () => {};
  const shaft = layer.querySelector('[data-sweep-shaft]');
  const outlines = [...layer.querySelectorAll('[data-sweep-arm-outline]')];
  const arms = [...layer.querySelectorAll('[data-sweep-arm]')];
  const hands = [...layer.querySelectorAll('[data-sweep-hand]')];
  return (pose) => {
    if (!pose) return;
    shaft.setAttribute('transform', pose.shaftTransform);
    pose.arms.forEach((arm, index) => {
      outlines[index].setAttribute('d', arm.path);
      arms[index].setAttribute('d', arm.path);
      hands[index].setAttribute(
        'transform',
        `translate(${arm.hand.x} ${arm.hand.y}) rotate(${pose.angle})`,
      );
    });
  };
}
