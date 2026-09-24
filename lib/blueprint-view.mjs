import { BLUEPRINT_DURATION, blueprintFrame } from '../src/blueprint-model.mjs';
import { CHARACTER_ART } from './character-art.mjs';
import { renderEncounterArena, renderEncounterEffects } from './encounter-view.mjs';

const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
const json = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const primitiveAttributes = (primitive, preview = false) => {
  const previewColors = {
    accent: 'var(--accent)',
    muted: 'var(--muted)',
    safe: '#b9e59f',
    signal: 'var(--signal)',
  };
  const previewOpacityFloor = {
    accent: 0.28,
    muted: 0.26,
    safe: 0.42,
    signal: 0.38,
  };
  const opacity =
    preview && primitive.opacity > 0
      ? Math.max(primitive.opacity, previewOpacityFloor[primitive.tone] ?? 0.28)
      : primitive.opacity;
  const strokeWidth =
    preview && primitive.width > 0
      ? Math.max(2, Math.min(8, primitive.width * 0.22))
      : primitive.width;
  const color = preview ? (previewColors[primitive.tone] ?? 'currentColor') : 'currentColor';
  const shared = `class="blueprint-tone--${escape(primitive.tone)}" opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${primitive.dash ? ` stroke-dasharray="${escape(primitive.dash)}"` : ''}`;
  const fill = primitive.fill ? `fill="${color}" fill-opacity="${primitive.fill}"` : 'fill="none"';
  if (primitive.type === 'circle')
    return `<circle ${shared} cx="${primitive.x}" cy="${primitive.y}" r="${primitive.radius}" ${fill} />`;
  if (primitive.type === 'line')
    return `<line ${shared} x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" fill="none" />`;
  if (primitive.type === 'rect')
    return `<rect ${shared} x="${primitive.x}" y="${primitive.y}" width="${primitive.rectWidth}" height="${primitive.rectHeight}" rx="8" ${fill} />`;
  return `<path ${shared} d="${escape(primitive.data)}" ${fill} />`;
};

const renderPrimitives = (primitives, dataAttribute = true, preview = false, indexOffset = 0) =>
  primitives
    .map(
      (primitive, index) =>
        `<g${dataAttribute ? ` data-blueprint-primitive="${index + indexOffset}"` : ''}>${primitiveAttributes(primitive, preview)}</g>`,
    )
    .join('');

const PREVIEW_TIMES = Object.freeze({
  'landing-jump': 2.98,
  'single-shot': 3.02,
  crossfire: 3.06,
  'splitting-projectile': 3.22,
  'returning-projectile': 3.54,
  'orbiting-projectiles': 3.12,
  'pulse-beam': 3.06,
  'chain-explosions': 3.12,
  mine: 3.08,
  'moving-hazard': 3.12,
  'converging-threats': 3.25,
  pull: 3.12,
  'turret-deployment': 3.08,
  'threat-generator': 3.46,
  decoy: 3.22,
  'predictive-aiming': 3.04,
  'source-tracking': 2.96,
  'burst-fire': 3.12,
  volley: 2.82,
  'delayed-activation': 3.42,
  'speed-change': 3.15,
  'limited-spread': 3.12,
  'directional-shield': 2.05,
  'damage-type-resistance': 3.55,
  'situational-immunity': 3.55,
  'part-break': 3.78,
  'attack-reflection': 2.92,
  'counter-stance': 2.64,
  'absorption-power-up': 3.28,
  'interruptible-wind-up': 1.58,
  'loadout-adaptation': 3.52,
  'wind-up': 3.82,
  'attack-lock': 3.82,
  'active-phase': 1.88,
  recovery: 3.28,
  'survival-phase': 3.16,
  teleport: 2.52,
  'boundary-attack': 1.98,
  'forced-scrolling': 3.18,
  'chase-herding': 3.08,
  'escape-phase': 2.52,
  'relocated-arena': 2.82,
  'control-mode-shift': 2.62,
  'boss-as-terrain': 3.72,
  'cover-line-of-sight': 2.62,
  'forced-inertia': 2.42,
  'wraparound-projectile': 2.36,
  'beat-synced-attack': 2.3,
  'secondary-cues-invisibility': 2.86,
  'sound-detection': 2.98,
  'objective-linked-invulnerability': 3.46,
  'wave-clear-objective': 3.94,
  'environmental-weapon': 3.34,
  'encounter-specific-tool': 3.34,
  'player-controlled-boss': 3.78,
  'projectile-rally': 3.68,
  'baited-self-hit': 2.72,
  'posture-stagger-gauge': 2.82,
  'pacifist-resolution': 2.82,
  'persistent-progress': 3.55,
  'status-buildup': 2.8,
  'instant-kill': 3.08,
  'maximum-health-reduction': 3.62,
  'ability-lock': 3.22,
  'resource-steal': 3.72,
  'on-hit-healing': 2.88,
  'self-heal-cast': 3.74,
  'external-healing-source': 3.58,
  'damage-rate-cap': 3.18,
  'loadout-mirror': 3.62,
  'moveset-shapeshifting': 4.48,
  'ally-theft': 2.55,
  'false-death': 2.72,
  'action-reactive-punish': 1.5,
  'wide-swing': 2.82,
  lunge: 1.92,
  grab: 1.28,
  'burrow-and-emerge': 1.46,
  'ring-volley': 3.08,
  'spiral-barrage': 3.22,
  'ricochet-projectile': 3.34,
  'homing-projectile': 3.18,
  'straight-beam': 2.76,
  'scanning-beam': 3.31,
  'rotating-beams': 2.91,
  'marked-area-strike': 1.24,
  shockwave: 3.04,
  'lingering-hazard': 3.38,
  'hazard-trail': 3.32,
  'platform-destruction': 3.42,
  'shrinking-safe-area': 3.68,
  knockback: 2.79,
  'target-lock': 1.18,
  'attack-combination': 3.36,
  'weak-point': 2.87,
  telegraph: 1.26,
  'fight-phase': 3.44,
  enrage: 3.48,
});

const FULL_HEIGHT_SCENES = new Set([
  'action-reactive-punish',
  'false-death',
  'resource-steal',
  'ability-lock',
  'maximum-health-reduction',
  'instant-kill',
  'status-buildup',
  'persistent-progress',
  'pacifist-resolution',
  'posture-stagger-gauge',
  'baited-self-hit',
  'projectile-rally',
  'player-controlled-boss',
  'encounter-specific-tool',
  'environmental-weapon',
  'wave-clear-objective',
  'objective-linked-invulnerability',
  'sound-detection',
  'secondary-cues-invisibility',
  'beat-synced-attack',
  'wraparound-projectile',
  'forced-inertia',
  'cover-line-of-sight',
  'boss-as-terrain',
  'control-mode-shift',
  'relocated-arena',
  'escape-phase',
  'chase-herding',
  'forced-scrolling',
  'boundary-attack',
  'teleport',
  'survival-phase',
  'enrage',
  'fight-phase',
  'recovery',
  'active-phase',
  'attack-lock',
  'wind-up',
  'telegraph',
  'loadout-adaptation',
  'interruptible-wind-up',
  'absorption-power-up',
  'counter-stance',
  'attack-reflection',
  'part-break',
  'weak-point',
  'situational-immunity',
  'damage-type-resistance',
  'directional-shield',
  'limited-spread',
  'speed-change',
  'delayed-activation',
  'attack-combination',
  'volley',
  'burst-fire',
  'homing-projectile',
  'source-tracking',
  'predictive-aiming',
  'target-lock',
  'decoy',
  'threat-generator',
  'turret-deployment',
  'knockback',
  'pull',
  'shrinking-safe-area',
  'platform-destruction',
  'converging-threats',
]);

const SCENE_BACKGROUND_COUNT = Object.freeze({
  'absorption-power-up': 3,
  'counter-stance': 3,
  'attack-reflection': 3,
  'part-break': 3,
  'weak-point': 3,
  'situational-immunity': 3,
  'damage-type-resistance': 3,
  'directional-shield': 3,
});

const scenePath = (data, opacity, tone, fill) => ({
  type: 'path',
  data,
  opacity,
  tone,
  width: 0,
  fill,
});

const STATIC_SCENE_BACKDROPS = Object.freeze({
  'converging-threats': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 281 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 349 H 56 Z M 431 117 H 504 V 349 H 431 Z M 145 119 H 415 V 153 H 145 Z M 68 493 L 280 465 L 492 493 V 526 L 280 496 L 68 526 Z M 70 824 L 280 790 L 490 824 V 853 L 280 818 L 70 853 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 74 601 H 156 L 169 621 H 84 Z M 404 601 H 486 L 476 621 H 391 Z',
      0.32,
      'muted',
      0.76,
    ),
  ],
  'platform-destruction': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 280 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 349 H 56 Z M 431 117 H 504 V 349 H 431 Z M 145 119 H 415 V 153 H 145 Z M 61 560 L 280 533 L 499 560 V 593 L 280 561 L 61 593 Z M 62 833 L 280 799 L 498 833 V 860 L 280 825 L 62 860 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 58 733 H 502 V 878 H 58 Z M 65 623 H 158 L 149 646 H 73 Z M 401 623 H 494 L 486 646 H 410 Z',
      0.33,
      'muted',
      0.72,
    ),
  ],
  'shrinking-safe-area': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 280 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 70 708 L 280 673 L 490 708 V 744 L 280 708 L 70 744 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 86 466 L 280 438 L 474 466 V 488 L 280 460 L 86 488 Z M 80 829 L 280 797 L 480 829 V 850 L 280 816 L 80 850 Z',
      0.33,
      'muted',
      0.75,
    ),
  ],
  pull: [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 281 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 349 H 56 Z M 431 117 H 504 V 349 H 431 Z M 145 119 H 415 V 153 H 145 Z M 69 499 L 280 471 L 491 499 V 535 L 280 502 L 69 535 Z M 72 743 L 280 707 L 488 743 V 780 L 280 744 L 72 780 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 80 830 L 280 797 L 480 830 V 850 L 280 816 L 80 850 Z M 80 601 H 166 L 180 619 H 91 Z M 394 601 H 480 L 469 619 H 380 Z',
      0.32,
      'muted',
      0.75,
    ),
  ],
  knockback: [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 280 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 69 500 L 280 472 L 491 500 V 534 L 280 503 L 69 534 Z M 72 730 L 280 695 L 488 730 V 767 L 280 729 L 72 767 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 61 839 L 280 803 L 499 839 V 878 H 61 Z M 81 608 H 175 L 187 626 H 92 Z M 379 608 H 473 L 462 626 H 367 Z',
      0.34,
      'muted',
      0.74,
    ),
  ],
  'turret-deployment': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 282 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 70 502 L 280 476 L 490 502 V 536 L 280 505 L 70 536 Z M 72 746 L 280 711 L 488 746 V 783 L 280 746 L 72 783 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 358 469 L 430 447 L 502 469 V 496 L 430 473 L 358 496 Z M 81 831 L 280 799 L 479 831 V 849 L 280 817 L 81 849 Z',
      0.35,
      'muted',
      0.72,
    ),
  ],
  'threat-generator': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 282 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 70 505 L 280 479 L 490 505 V 537 L 280 507 L 70 537 Z M 72 744 L 280 711 L 488 744 V 779 L 280 745 L 72 779 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 342 444 L 405 425 L 468 444 L 480 486 L 405 507 L 330 486 Z M 81 833 L 280 801 L 479 833 V 850 L 280 819 L 81 850 Z',
      0.35,
      'muted',
      0.72,
    ),
  ],
  decoy: [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 281 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 70 517 L 280 488 L 490 517 V 551 L 280 518 L 70 551 Z M 72 756 L 280 723 L 488 756 V 790 L 280 755 L 72 790 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 110 414 L 190 395 L 270 414 V 437 L 190 417 L 110 437 Z M 290 414 L 410 395 L 490 414 V 437 L 410 417 L 290 437 Z M 80 833 L 280 801 L 480 833 V 850 L 280 818 L 80 850 Z',
      0.31,
      'muted',
      0.74,
    ),
  ],
  'target-lock': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 280 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 349 H 56 Z M 431 117 H 504 V 349 H 431 Z M 145 119 H 415 V 153 H 145 Z M 69 493 L 280 466 L 491 493 V 527 L 280 498 L 69 527 Z M 72 744 L 280 710 L 488 744 V 781 L 280 744 L 72 781 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 325 600 L 390 581 L 455 600 L 465 650 L 390 669 L 315 650 Z M 80 832 L 280 800 L 480 832 V 850 L 280 818 L 80 850 Z',
      0.36,
      'muted',
      0.7,
    ),
  ],
  'predictive-aiming': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 280 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 349 H 56 Z M 431 117 H 504 V 349 H 431 Z M 145 119 H 415 V 153 H 145 Z M 68 489 L 280 463 L 492 489 V 522 L 280 495 L 68 522 Z M 71 746 L 280 712 L 489 746 V 782 L 280 745 L 71 782 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 82 831 L 280 799 L 478 831 V 849 L 280 818 L 82 849 Z M 86 595 H 171 L 180 614 H 95 Z M 389 595 H 474 L 465 614 H 380 Z',
      0.31,
      'muted',
      0.76,
    ),
  ],
  'source-tracking': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 57 283 H 503 V 878 H 57 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 130 V 350 H 56 Z M 430 117 H 504 V 350 H 430 Z M 145 119 H 415 V 154 H 145 Z M 66 481 L 280 454 L 494 481 V 514 L 280 483 L 66 514 Z M 72 745 L 280 712 L 488 745 V 782 L 280 747 L 72 782 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 80 830 L 280 798 L 480 830 V 850 L 280 816 L 80 850 Z M 81 596 H 166 L 178 614 H 90 Z M 394 596 H 479 L 470 614 H 382 Z',
      0.31,
      'muted',
      0.76,
    ),
  ],
  'homing-projectile': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 281 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 350 H 56 Z M 431 117 H 504 V 350 H 431 Z M 145 119 H 415 V 153 H 145 Z M 71 489 L 280 463 L 489 489 V 522 L 280 495 L 71 522 Z M 72 746 L 280 714 L 488 746 V 782 L 280 745 L 72 782 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 78 831 L 280 799 L 482 831 V 850 L 280 817 L 78 850 Z M 84 592 H 166 L 174 610 H 95 Z M 396 592 H 477 L 465 610 H 388 Z',
      0.31,
      'muted',
      0.76,
    ),
  ],
  'burst-fire': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 283 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 129 V 351 H 56 Z M 431 117 H 504 V 351 H 431 Z M 145 119 H 415 V 154 H 145 Z M 68 489 L 280 463 L 492 489 V 522 L 280 495 L 68 522 Z M 71 728 L 280 696 L 489 728 V 765 L 280 728 L 71 765 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 82 828 L 280 797 L 478 828 V 847 L 280 815 L 82 847 Z M 70 596 H 149 L 165 613 H 80 Z M 411 596 H 490 L 480 613 H 395 Z',
      0.31,
      'muted',
      0.76,
    ),
  ],
  volley: [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 283 H 502 V 878 H 58 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 130 V 351 H 56 Z M 430 117 H 504 V 351 H 430 Z M 144 120 H 416 V 155 H 144 Z M 111 332 H 449 V 375 H 111 Z M 74 739 L 280 706 L 486 739 V 777 L 280 739 L 74 777 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 80 504 L 280 478 L 480 504 V 525 L 280 496 L 80 525 Z M 82 836 L 280 802 L 478 836 V 852 L 280 819 L 82 852 Z',
      0.31,
      'muted',
      0.76,
    ),
  ],
  'attack-combination': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 57 276 H 503 V 878 H 57 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 57 116 H 132 V 346 H 57 Z M 428 116 H 503 V 346 H 428 Z M 148 119 H 412 V 154 H 148 Z M 69 491 L 280 467 L 491 491 V 522 L 280 495 L 69 522 Z M 70 754 L 280 726 L 490 754 V 784 L 280 753 L 70 784 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 109 832 L 280 807 L 451 832 V 846 L 280 823 L 109 846 Z M 93 566 L 190 546 L 185 556 L 93 577 Z M 367 546 L 463 566 V 577 L 372 556 Z',
      0.31,
      'muted',
      0.74,
    ),
  ],
  'delayed-activation': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 58 293 H 502 V 878 H 58 Z', 0.36, 'muted', 0.55),
    scenePath(
      'M 58 117 H 135 V 344 H 58 Z M 425 117 H 502 V 344 H 425 Z M 153 120 H 407 V 154 H 153 Z M 78 503 L 280 480 L 482 503 V 529 L 280 505 L 78 529 Z M 77 785 L 280 757 L 483 785 V 813 L 280 781 L 77 813 Z',
      0.42,
      'accent',
      0.55,
    ),
    scenePath(
      'M 255 549 L 350 528 L 445 549 L 466 630 L 445 711 L 350 732 L 255 711 L 234 630 Z M 91 853 L 280 824 L 469 853 V 866 L 280 839 L 91 866 Z',
      0.48,
      'muted',
      0.67,
    ),
  ],
  'speed-change': [
    scenePath('M 37 94 H 523 V 878 H 37 Z M 56 279 H 504 V 878 H 56 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 55 117 H 129 V 344 H 55 Z M 431 117 H 505 V 344 H 431 Z M 144 120 H 416 V 154 H 144 Z M 65 525 L 280 503 L 495 525 V 551 L 280 526 L 65 551 Z M 65 719 L 280 694 L 495 719 V 754 L 280 724 L 65 754 Z',
      0.4,
      'accent',
      0.56,
    ),
    scenePath(
      'M 70 560 H 495 V 573 H 70 Z M 70 667 H 495 V 681 H 70 Z M 73 826 L 280 796 L 487 826 V 843 L 280 812 L 73 843 Z',
      0.34,
      'muted',
      0.73,
    ),
  ],
  'limited-spread': [
    scenePath('M 38 94 H 522 V 878 H 38 Z M 57 281 H 503 V 878 H 57 Z', 0.37, 'muted', 0.56),
    scenePath(
      'M 56 117 H 130 V 335 H 56 Z M 430 117 H 504 V 335 H 430 Z M 145 120 H 415 V 153 H 145 Z M 63 498 L 280 471 L 497 498 V 533 L 280 503 L 63 533 Z M 63 693 L 280 660 L 497 693 V 733 L 280 698 L 63 733 Z',
      0.41,
      'accent',
      0.56,
    ),
    scenePath(
      'M 80 762 L 280 733 L 480 762 V 776 L 280 747 L 80 776 Z M 75 839 L 280 806 L 485 839 V 854 L 280 822 L 75 854 Z',
      0.34,
      'muted',
      0.74,
    ),
  ],
});

const PREVIEW_CAMERA = Object.freeze({ x: 34, y: 22, scaleX: 0.52, scaleY: 0.155 });

const previewPoint = ({ x, y }) => ({
  x: PREVIEW_CAMERA.x + x * PREVIEW_CAMERA.scaleX,
  y: PREVIEW_CAMERA.y + y * PREVIEW_CAMERA.scaleY,
});

export function blueprintPreviewLayout(mechanicId) {
  const time = PREVIEW_TIMES[mechanicId] ?? 2.75;
  const frame = blueprintFrame(mechanicId, time);
  return Object.freeze({
    time,
    frame,
    boss: previewPoint(frame.boss),
    player: previewPoint(frame.player),
    decoy: frame.decoy ? previewPoint(frame.decoy) : null,
    geometryTransform: `translate(${PREVIEW_CAMERA.x} ${PREVIEW_CAMERA.y}) scale(${PREVIEW_CAMERA.scaleX} ${PREVIEW_CAMERA.scaleY})`,
  });
}

export function renderBlueprint(demo, mechanicId) {
  const initial = blueprintFrame(mechanicId, 0);
  const staticScene = STATIC_SCENE_BACKDROPS[mechanicId] ?? [];
  const staticSceneLayer = staticScene.length
    ? `<g aria-hidden="true">${renderPrimitives(staticScene, false)}</g>`
    : '';
  const backgroundCount = SCENE_BACKGROUND_COUNT[mechanicId] ?? 0;
  const backgroundLayer = backgroundCount
    ? `<g aria-hidden="true">${renderPrimitives(initial.primitives.slice(0, backgroundCount))}</g>`
    : '';
  const primitiveLayer = `<g data-blueprint-primitives aria-hidden="true">${renderPrimitives(initial.primitives.slice(backgroundCount), true, false, backgroundCount)}</g>`;
  const sourceInFront =
    mechanicId === 'burst-fire' ||
    mechanicId === 'volley' ||
    mechanicId === 'limited-spread' ||
    mechanicId === 'directional-shield' ||
    mechanicId === 'damage-type-resistance' ||
    mechanicId === 'situational-immunity' ||
    mechanicId === 'part-break' ||
    mechanicId === 'weak-point' ||
    mechanicId === 'attack-reflection' ||
    mechanicId === 'counter-stance' ||
    mechanicId === 'absorption-power-up' ||
    mechanicId === 'boundary-attack' ||
    mechanicId === 'boss-as-terrain' ||
    mechanicId === 'cover-line-of-sight' ||
    mechanicId === 'player-controlled-boss' ||
    mechanicId === 'encounter-specific-tool' ||
    mechanicId === 'environmental-weapon' ||
    mechanicId === 'objective-linked-invulnerability' ||
    mechanicId === 'projectile-rally' ||
    mechanicId === 'baited-self-hit' ||
    mechanicId === 'posture-stagger-gauge' ||
    mechanicId === 'pacifist-resolution' ||
    mechanicId === 'persistent-progress' ||
    mechanicId === 'status-buildup' ||
    mechanicId === 'instant-kill' ||
    mechanicId === 'maximum-health-reduction' ||
    mechanicId === 'ability-lock' ||
    mechanicId === 'resource-steal' ||
    mechanicId === 'on-hit-healing' ||
    mechanicId === 'self-heal-cast' ||
    mechanicId === 'external-healing-source' ||
    mechanicId === 'damage-rate-cap' ||
    mechanicId === 'loadout-mirror' ||
    mechanicId === 'moveset-shapeshifting' ||
    mechanicId === 'ally-theft' ||
    mechanicId === 'false-death' ||
    mechanicId === 'action-reactive-punish';
  return /* HTML */ `<section
    class="blueprint-demo"
    data-blueprint-demo
    data-blueprint-id="${escape(mechanicId)}"
    data-blueprint-full-height="${FULL_HEIGHT_SCENES.has(mechanicId)}"
    aria-label="${escape(demo.title)}"
    ${demo.fallbackAttributes ?? ''}
  >
    <div class="blueprint-demo__canvas">
      <div class="blueprint-demo__scene-timeline">
        <span
          class="blueprint-demo__phase-label"
          data-blueprint-current-phase
          tabindex="0"
          aria-current="step"
          aria-describedby="blueprint-phase-tooltip-${escape(mechanicId)}"
          ><span data-blueprint-phase-name>${escape(demo.phaseNames[0])}</span
          ><span
            class="blueprint-demo__phase-tooltip"
            id="blueprint-phase-tooltip-${escape(mechanicId)}"
            data-blueprint-phase-tooltip
            role="tooltip"
            >${escape(demo.phaseDescriptions[0])}</span
          ></span
        >
        <label class="blueprint-demo__timeline"
          ><span class="blueprint-demo__visually-hidden">${escape(demo.timeline)}</span
          ><input
            type="range"
            data-blueprint-timeline
            min="0"
            max="${BLUEPRINT_DURATION * 1000}"
            step="10"
            value="0"
        /></label>
      </div>
      <svg
        class="blueprint-demo__svg"
        data-blueprint-svg
        viewBox="0 0 560 960"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="${escape(demo.diagramDescription)}"
        direction="ltr"
      >
        <title>${escape(demo.title)}</title>
        <desc>${escape(demo.diagramDescription)}</desc>
        ${renderEncounterArena(`blueprint-${mechanicId}`, { minimal: FULL_HEIGHT_SCENES.has(mechanicId) })}
        ${staticSceneLayer} ${backgroundLayer} ${sourceInFront ? '' : primitiveLayer}
        ${renderEncounterEffects()}
        ${
          initial.decoy
            ? `<g data-blueprint-decoy transform="translate(${initial.decoy.x} ${initial.decoy.y})" opacity="${initial.decoy.opacity}" aria-hidden="true">${CHARACTER_ART.kern.replace('data-character-art="kern"', 'data-character-art="kern-decoy"')}</g>`
            : ''
        }
        <g data-blueprint-boss transform="translate(${initial.boss.x} ${initial.boss.y})">
          ${CHARACTER_ART.kern}
        </g>
        ${sourceInFront ? primitiveLayer : ''}
        <g data-blueprint-player transform="translate(${initial.player.x} ${initial.player.y})">
          ${CHARACTER_ART.tavi}
        </g>
        <text
          data-blueprint-boss-label
          x="${initial.bossLabel.x}"
          y="${initial.bossLabel.y}"
          text-anchor="middle"
          class="blueprint-demo__entity-label"
        >
          ${escape(demo.boss)}
        </text>
        <text
          data-blueprint-player-label
          x="${initial.playerLabel.x}"
          y="${initial.playerLabel.y}"
          text-anchor="middle"
          class="blueprint-demo__entity-label blueprint-demo__entity-label--player"
        >
          ${escape(demo.player)}
        </text>
      </svg>
    </div>
    <p
      class="blueprint-demo__visually-hidden"
      data-blueprint-status
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      ${escape(demo.phaseDescriptions[0])}
    </p>
    <p class="blueprint-demo__motion-note" data-blueprint-motion-note hidden>
      ${escape(demo.reducedMotion)}
    </p>
    <script type="application/json" data-blueprint-config>
      ${json(demo)}
    </script>
  </section>`;
}

export function renderBlueprintThumbnail(mechanicId, id) {
  const preview = blueprintPreviewLayout(mechanicId);
  const { frame } = preview;
  const staticScene = STATIC_SCENE_BACKDROPS[mechanicId] ?? [];
  const staticSceneLayer = staticScene.length
    ? `<g clip-path="url(#blueprint-preview-clip-${escape(id)})"><g transform="${preview.geometryTransform}">${renderPrimitives(staticScene, false, true)}</g></g>`
    : '';
  const backgroundCount = SCENE_BACKGROUND_COUNT[mechanicId] ?? 0;
  const backgroundGeometryLayer = backgroundCount
    ? `<g clip-path="url(#blueprint-preview-clip-${escape(id)})"><g transform="${preview.geometryTransform}">${renderPrimitives(frame.primitives.slice(0, backgroundCount), false, true)}</g></g>`
    : '';
  const geometryLayer = `<g clip-path="url(#blueprint-preview-clip-${escape(id)})"><g transform="${preview.geometryTransform}">${renderPrimitives(frame.primitives.slice(backgroundCount), false, true)}</g></g>`;
  const sourceInFront =
    mechanicId === 'burst-fire' ||
    mechanicId === 'volley' ||
    mechanicId === 'limited-spread' ||
    mechanicId === 'directional-shield' ||
    mechanicId === 'damage-type-resistance' ||
    mechanicId === 'situational-immunity' ||
    mechanicId === 'part-break' ||
    mechanicId === 'weak-point' ||
    mechanicId === 'attack-reflection' ||
    mechanicId === 'counter-stance' ||
    mechanicId === 'absorption-power-up' ||
    mechanicId === 'boundary-attack' ||
    mechanicId === 'boss-as-terrain' ||
    mechanicId === 'cover-line-of-sight' ||
    mechanicId === 'player-controlled-boss' ||
    mechanicId === 'encounter-specific-tool' ||
    mechanicId === 'environmental-weapon' ||
    mechanicId === 'objective-linked-invulnerability' ||
    mechanicId === 'projectile-rally' ||
    mechanicId === 'baited-self-hit' ||
    mechanicId === 'posture-stagger-gauge' ||
    mechanicId === 'pacifist-resolution' ||
    mechanicId === 'persistent-progress' ||
    mechanicId === 'status-buildup' ||
    mechanicId === 'instant-kill' ||
    mechanicId === 'maximum-health-reduction' ||
    mechanicId === 'ability-lock' ||
    mechanicId === 'resource-steal' ||
    mechanicId === 'on-hit-healing' ||
    mechanicId === 'self-heal-cast' ||
    mechanicId === 'external-healing-source' ||
    mechanicId === 'damage-rate-cap' ||
    mechanicId === 'loadout-mirror' ||
    mechanicId === 'moveset-shapeshifting' ||
    mechanicId === 'ally-theft' ||
    mechanicId === 'false-death' ||
    mechanicId === 'action-reactive-punish';
  return /* HTML */ `<svg
    viewBox="0 0 360 160"
    data-blueprint-preview="${escape(mechanicId)}"
    data-blueprint-preview-time="${preview.time}"
  >
    <defs>
      <pattern
        id="blueprint-preview-${escape(id)}"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
      >
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--diagram-preview-grid)" />
      </pattern>
      <clipPath id="blueprint-preview-clip-${escape(id)}">
        <rect width="360" height="160" />
      </clipPath>
    </defs>
    <rect
      width="360"
      height="160"
      fill="${FULL_HEIGHT_SCENES.has(mechanicId) ? '#263434' : `url(#blueprint-preview-${escape(id)})`}"
    />
    ${staticSceneLayer} ${backgroundGeometryLayer} ${sourceInFront ? '' : geometryLayer}
    <g
      data-character-art-preview="kern"
      transform="translate(${preview.boss.x} ${preview.boss.y}) scale(${0.52 * frame.bossScale})"
      opacity="${frame.bossVisible}"
    >
      ${CHARACTER_ART.kern}
    </g>
    ${sourceInFront ? geometryLayer : ''}
    ${
      frame.decoy
        ? `<g data-character-art-preview="kern-decoy" transform="translate(${preview.decoy.x} ${preview.decoy.y}) scale(.52)" opacity="${frame.decoy.opacity}">${CHARACTER_ART.kern.replace('data-character-art="kern"', 'data-character-art="kern-decoy"')}</g>`
        : ''
    }
    <g
      data-character-art-preview="tavi"
      transform="translate(${preview.player.x} ${preview.player.y}) scale(.68)"
    >
      ${
        (mechanicId === 'pacifist-resolution' && frame.pacifistWeaponSheathed) ||
        (mechanicId === 'encounter-specific-tool' && frame.encounterToolEquipped)
          ? CHARACTER_ART.tavi.replace(
              'data-rig-part="weapon"',
              'data-rig-part="weapon" opacity="0"',
            )
          : CHARACTER_ART.tavi
      }
    </g>
  </svg>`;
}
