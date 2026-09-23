import { BLUEPRINT_DURATION, blueprintFrame } from './blueprint-model.mjs';
import { createCharacterAnimator } from './character-motion.mjs';
import { createEncounterEffects } from './encounter-effects.mjs';

const set = (node, name, value) => node.setAttribute(name, String(value));

function updatePrimitive(group, primitive) {
  const node = group.firstElementChild;
  node.setAttribute('class', `blueprint-tone--${primitive.tone}`);
  set(node, 'opacity', primitive.opacity);
  set(node, 'stroke-width', primitive.width);
  if (primitive.dash) set(node, 'stroke-dasharray', primitive.dash);
  else node.removeAttribute('stroke-dasharray');
  node.setAttribute('fill', primitive.fill ? 'currentColor' : 'none');
  if (primitive.fill) set(node, 'fill-opacity', primitive.fill);
  else node.removeAttribute('fill-opacity');
  if (primitive.type === 'circle') {
    set(node, 'cx', primitive.x);
    set(node, 'cy', primitive.y);
    set(node, 'r', primitive.radius);
  } else if (primitive.type === 'line') {
    set(node, 'x1', primitive.x1);
    set(node, 'y1', primitive.y1);
    set(node, 'x2', primitive.x2);
    set(node, 'y2', primitive.y2);
  } else if (primitive.type === 'rect') {
    set(node, 'x', primitive.x);
    set(node, 'y', primitive.y);
    set(node, 'width', primitive.rectWidth);
    set(node, 'height', primitive.rectHeight);
  } else set(node, 'd', primitive.data);
}

export function initializeBlueprint(widget) {
  if (widget.dataset.blueprintReady) return;
  const find = (selector) => widget.querySelector(selector);
  const config = JSON.parse(find('[data-blueprint-config]').textContent);
  const mechanicId = widget.dataset.blueprintId;
  const timeline = find('[data-blueprint-timeline]');
  const currentPhase = find('[data-blueprint-current-phase]');
  const phaseName = find('[data-blueprint-phase-name]');
  const phaseTooltip = find('[data-blueprint-phase-tooltip]');
  const boss = find('[data-blueprint-boss]');
  const decoy = find('[data-blueprint-decoy]');
  const player = find('[data-blueprint-player]');
  const animateBoss = createCharacterAnimator(boss, 'kern');
  const animateDecoy = decoy ? createCharacterAnimator(decoy, 'kern') : null;
  const animatePlayer = createCharacterAnimator(player, 'tavi');
  const animateEffects = createEncounterEffects(widget, (time) => blueprintFrame(mechanicId, time));
  const bossLabel = find('[data-blueprint-boss-label]');
  const playerLabel = find('[data-blueprint-player-label]');
  const primitives = [...widget.querySelectorAll('[data-blueprint-primitive]')];
  const status = find('[data-blueprint-status]');
  const motionNote = find('[data-blueprint-motion-note]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let time = 0;
  let running = false;
  let animationId = 0;
  let lastTimestamp;
  let announcedPhase = -1;
  let scrubbing = false;
  let phaseHovered = false;

  function render() {
    const frame = blueprintFrame(mechanicId, time);
    widget.dataset.blueprintPhase = String(frame.phase);
    widget.dataset.blueprintCommitted = String(frame.committed);
    widget.dataset.blueprintOutcome = frame.playerSafe ? 'safe' : 'danger';
    if (mechanicId === 'directional-shield')
      widget.dataset.blueprintGuard = frame.frontStrike
        ? 'blocked'
        : frame.sideStrike
          ? 'flank-hit'
          : 'idle';
    if (mechanicId === 'damage-type-resistance')
      widget.dataset.blueprintResistance = frame.resistedStrike
        ? 'reduced'
        : frame.normalStrike
          ? 'normal'
          : 'idle';
    if (mechanicId === 'situational-immunity')
      widget.dataset.blueprintImmunity = frame.blockedStrike
        ? 'blocked'
        : frame.wardStrike
          ? 'ward-broken'
          : frame.openStrike
            ? 'boss-hit'
            : frame.immunity;
    if (mechanicId === 'part-break')
      widget.dataset.blueprintPart = frame.partStrike
        ? 'broken-now'
        : frame.secondAttempt
          ? 'attack-disabled'
          : frame.partState;
    if (mechanicId === 'attack-reflection')
      widget.dataset.blueprintReflection = frame.meleeStrike
        ? 'open-hit'
        : frame.reflectedShot
          ? 'returning-danger'
          : frame.outgoingShot
            ? 'player-shot'
            : frame.reflectionState;
    if (mechanicId === 'counter-stance')
      widget.dataset.blueprintCounter = frame.parriedStrike
        ? 'parried-hit'
        : frame.riposte
          ? 'riposte-danger'
          : frame.openStrike
            ? 'open-hit'
            : frame.counterState;
    if (mechanicId === 'absorption-power-up') {
      widget.dataset.blueprintAbsorption = frame.openStrike
        ? 'open-hit'
        : frame.absorbedSecond
          ? 'second-absorbed'
          : frame.absorbedFirst
            ? 'first-absorbed'
            : frame.absorptionState;
      widget.dataset.blueprintCharge = String(frame.absorptionCharge);
    }
    if (mechanicId === 'interruptible-wind-up')
      widget.dataset.blueprintWindUp = frame.interruptHit
        ? 'interrupted-now'
        : frame.threatReleased
          ? 'released-danger'
          : frame.windUpState;
    if (mechanicId === 'loadout-adaptation') {
      widget.dataset.blueprintLoadout = frame.loadout;
      widget.dataset.blueprintAdaptation = frame.loadoutState;
      widget.dataset.blueprintPackage = frame.adaptedPackage;
    }
    if (mechanicId === 'wind-up') {
      widget.dataset.blueprintWindUp = frame.windUpRelease ? 'released-danger' : frame.windUpState;
      widget.dataset.blueprintWindUpBeat = String(frame.windUpBeat);
      widget.dataset.blueprintWindUpProgress = frame.windUpProgress.toFixed(3);
    }
    if (mechanicId === 'attack-lock') {
      widget.dataset.blueprintAttackLock = frame.attackLockRelease
        ? 'released-danger'
        : frame.attackLockState;
      widget.dataset.blueprintAimLocked = String(frame.attackLocked);
      widget.dataset.blueprintAimX = frame.attackLockTarget.x.toFixed(1);
      widget.dataset.blueprintAimY = frame.attackLockTarget.y.toFixed(1);
    }
    if (mechanicId === 'active-phase') {
      widget.dataset.blueprintActivePhase = frame.activePhaseState;
      widget.dataset.blueprintHitboxActive = String(frame.hitboxActive);
      widget.dataset.blueprintFollowThrough = String(frame.followThroughVisible);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'recovery') {
      widget.dataset.blueprintRecovery = frame.recoveryState;
      widget.dataset.blueprintRecoveryLocked = String(frame.recoveryLocked);
      widget.dataset.blueprintBossReady = String(frame.bossReady);
      widget.dataset.blueprintWithinPunishReach = String(frame.withinPunishReach);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'survival-phase') {
      widget.dataset.blueprintSurvivalPhase = frame.survivalPhaseState;
      widget.dataset.blueprintSurvivalShielded = String(frame.survivalShielded);
      widget.dataset.blueprintSurvivalComplete = String(frame.survivalComplete);
      widget.dataset.blueprintSurvivalHazard = String(frame.survivalHazardIndex);
      widget.dataset.blueprintSurvivalRemaining = frame.survivalRemaining.toFixed(3);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'teleport') {
      widget.dataset.blueprintTeleport = frame.teleportState;
      widget.dataset.blueprintTeleportAbsent = String(frame.teleportAbsent);
      widget.dataset.blueprintTeleportDestination = String(frame.teleportDestinationRevealed);
      widget.dataset.blueprintTeleportFollowUp = String(frame.teleportFollowUpActive);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'boundary-attack') {
      widget.dataset.blueprintBoundaryAttack = frame.boundaryAttackState;
      widget.dataset.blueprintBoundarySignal = String(frame.boundarySignalActive);
      widget.dataset.blueprintBoundaryCrossing = String(frame.boundaryCrossingActive);
      widget.dataset.blueprintBoundarySourceOutside = String(frame.boundarySourceOutside);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'forced-scrolling') {
      widget.dataset.blueprintForcedScrolling = frame.forcedScrollingState;
      widget.dataset.blueprintForcedScrollingActive = String(frame.forcedScrollingActive);
      widget.dataset.blueprintForcedScrollingOffset = frame.forcedScrollingOffset.toFixed(1);
      widget.dataset.blueprintForcedScrollingCleared = String(frame.forcedScrollingRouteCleared);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'chase-herding') {
      widget.dataset.blueprintChaseHerding = frame.chaseHerdingState;
      widget.dataset.blueprintChaseDistance = frame.chaseDistance.toFixed(1);
      widget.dataset.blueprintChaseInBand = String(frame.chaseInBand);
      widget.dataset.blueprintChaseIntercepted = String(frame.chaseIntercepted);
      widget.dataset.blueprintChaseCaptured = String(frame.chaseCaptured);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'escape-phase') {
      widget.dataset.blueprintEscapePhase = frame.escapePhaseState;
      widget.dataset.blueprintEscapeProgress = frame.escapeProgress.toFixed(3);
      widget.dataset.blueprintEscapeActive = String(frame.escapeActive);
      widget.dataset.blueprintEscapeInterrupted = String(frame.escapeInterrupted);
      widget.dataset.blueprintEscapeSucceeded = String(frame.escapeSucceeded);
      widget.dataset.blueprintEscapeInterruptStrike = String(frame.escapeInterruptStrike);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'relocated-arena') {
      widget.dataset.blueprintRelocatedArena = frame.relocatedArenaState;
      widget.dataset.blueprintRelocationDestination = String(frame.relocatedDestinationRevealed);
      widget.dataset.blueprintRelocationActive = String(frame.relocatedTransferActive);
      widget.dataset.blueprintRelocationLowerActive = String(frame.relocatedLowerActive);
      widget.dataset.blueprintRelocationStateRetained = String(frame.relocatedStateRetained);
      widget.dataset.blueprintRelocationProgress = frame.relocatedProgress.toFixed(2);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'control-mode-shift') {
      widget.dataset.blueprintControlModeShift = frame.controlModeShiftState;
      widget.dataset.blueprintControlModePreviewed = String(frame.controlModePreviewed);
      widget.dataset.blueprintControlModeActive = String(frame.controlModeActive);
      widget.dataset.blueprintControlModeMapping = frame.controlModeMapping;
      widget.dataset.blueprintControlModeWave = String(frame.controlModeWaveActive);
      widget.dataset.blueprintControlModeReturn = String(frame.controlModeReturnVisible);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'boss-as-terrain') {
      widget.dataset.blueprintBossAsTerrain = frame.bossAsTerrainState;
      widget.dataset.blueprintTerrainRoute = String(frame.bossAsTerrainRouteRevealed);
      widget.dataset.blueprintTerrainMounted = String(frame.bossAsTerrainMounted);
      widget.dataset.blueprintTerrainHolding = String(frame.bossAsTerrainHolding);
      widget.dataset.blueprintTerrainGrip = frame.bossAsTerrainGrip.toFixed(3);
      widget.dataset.blueprintTerrainWeakPoint = String(frame.bossAsTerrainWeakPointOpen);
      widget.dataset.blueprintTerrainSafeDrop = String(frame.bossAsTerrainSafeDrop);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'cover-line-of-sight') {
      widget.dataset.blueprintCoverLineOfSight = frame.coverLineOfSightState;
      widget.dataset.blueprintCoverSourceLocked = String(frame.coverSourceLocked);
      widget.dataset.blueprintCoverShadow = String(frame.coverShadowVisible);
      widget.dataset.blueprintCoverOccupied = String(frame.coverOccupied);
      widget.dataset.blueprintCoverBeam = String(frame.coverBeamActive);
      widget.dataset.blueprintCoverBlocked = String(frame.coverBeamBlocked);
      widget.dataset.blueprintCoverExit = String(frame.coverExitOpen);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'forced-inertia') {
      widget.dataset.blueprintForcedInertia = frame.forcedInertiaState;
      widget.dataset.blueprintInertiaFrozen = String(frame.forcedInertiaFrozen);
      widget.dataset.blueprintInertiaVector = String(frame.forcedInertiaVectorVisible);
      widget.dataset.blueprintInertiaCommitted = String(frame.forcedInertiaCommitted);
      widget.dataset.blueprintInertiaSliding = String(frame.forcedInertiaSliding);
      widget.dataset.blueprintInertiaBraking = String(frame.forcedInertiaBraking);
      widget.dataset.blueprintInertiaControl = String(frame.forcedInertiaControlRestored);
      widget.dataset.blueprintInertiaSpeed = frame.forcedInertiaSpeed.toFixed(3);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'wraparound-projectile') {
      widget.dataset.blueprintWraparoundProjectile = frame.wraparoundProjectileState;
      widget.dataset.blueprintWrapBoundary = String(frame.wraparoundBoundaryLinked);
      widget.dataset.blueprintWrapRoute = String(frame.wraparoundRouteVisible);
      widget.dataset.blueprintWrapFirstPass = String(frame.wraparoundFirstPass);
      widget.dataset.blueprintWrapCrossing = String(frame.wraparoundCrossing);
      widget.dataset.blueprintWrapSecondPass = String(frame.wraparoundSecondPass);
      widget.dataset.blueprintWrapLap = String(frame.wraparoundLap);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'beat-synced-attack') {
      widget.dataset.blueprintBeatSyncedAttack = frame.beatSyncedAttackState;
      widget.dataset.blueprintBeatSlot = String(frame.beatSyncedBeatSlot + 1);
      widget.dataset.blueprintBeatPulse = frame.beatSyncedBeatPulse.toFixed(3);
      widget.dataset.blueprintBeatAttack = String(frame.beatSyncedAttackIndex + 1);
      widget.dataset.blueprintBeatAttackLane = String(frame.beatSyncedAttackLane);
      widget.dataset.blueprintBeatTelegraph = String(frame.beatSyncedTelegraphIndex + 1);
      widget.dataset.blueprintBeatTelegraphLane = String(frame.beatSyncedTelegraphLane);
      widget.dataset.blueprintBeatPhraseComplete = String(frame.beatSyncedPhraseComplete);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'secondary-cues-invisibility') {
      widget.dataset.blueprintSecondaryCuesInvisibility = frame.secondaryCuesInvisibilityState;
      widget.dataset.blueprintInvisibilityHidden = String(frame.invisibilityHidden);
      widget.dataset.blueprintInvisibilityCueCount = String(frame.invisibilityCueCount);
      widget.dataset.blueprintInvisibilitySourceLocked = String(frame.invisibilitySourceLocked);
      widget.dataset.blueprintInvisibilityAttack = String(frame.invisibilityAttackActive);
      widget.dataset.blueprintInvisibilityReveal = String(frame.invisibilityRevealVisible);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'sound-detection') {
      widget.dataset.blueprintSoundDetection = frame.soundDetectionState;
      widget.dataset.blueprintSoundHeard = String(frame.soundDetectionHeard);
      widget.dataset.blueprintSoundNoiseVisible = String(frame.soundDetectionNoiseVisible);
      widget.dataset.blueprintSoundSourceLocked = String(frame.soundDetectionSourceLocked);
      widget.dataset.blueprintSoundAttack = String(frame.soundDetectionAttackActive);
      widget.dataset.blueprintSoundLivePosition = String(
        frame.soundDetectionBossHasLivePlayerPosition,
      );
      widget.dataset.blueprintSoundNoiseLevel = frame.soundDetectionNoiseLevel.toFixed(3);
      widget.dataset.blueprintPunishStrike = String(frame.punishStrike);
    }
    if (mechanicId === 'objective-linked-invulnerability') {
      widget.dataset.blueprintObjectiveLinkedInvulnerability =
        frame.objectiveLinkedInvulnerabilityState;
      widget.dataset.blueprintObjectiveCount = String(frame.objectiveCompletedCount);
      widget.dataset.blueprintObjectiveShielded = String(frame.objectiveShielded);
      widget.dataset.blueprintObjectiveVulnerable = String(frame.objectiveVulnerable);
      widget.dataset.blueprintObjectiveBlocked = String(frame.objectiveBlockedStrike);
      widget.dataset.blueprintObjectiveBossHit = String(frame.objectiveBossStrike);
      widget.dataset.blueprintObjectiveAllComplete = String(frame.objectiveAllComplete);
      widget.dataset.blueprintObjectiveWindow = frame.objectiveWindowRemaining.toFixed(3);
    }
    if (mechanicId === 'wave-clear-objective') {
      widget.dataset.blueprintWaveClear = frame.waveClearState;
      widget.dataset.blueprintWave = String(frame.waveClearWave);
      widget.dataset.blueprintWavesComplete = String(frame.waveClearCompletedWaves);
      widget.dataset.blueprintWaveRemaining = String(frame.waveClearRemainingEnemies);
      widget.dataset.blueprintWaveQueueSealed = String(frame.waveClearSpawnQueueSealed);
      widget.dataset.blueprintWaveRosterEmpty = String(frame.waveClearRosterEmpty);
      widget.dataset.blueprintWaveAllComplete = String(frame.waveClearAllComplete);
      widget.dataset.blueprintWaveRewardOpen = String(frame.waveClearRewardOpen);
    }
    if (mechanicId === 'environmental-weapon') {
      widget.dataset.blueprintEnvironmentalWeapon = frame.environmentalWeaponState;
      widget.dataset.blueprintEnvironmentalPowered = String(frame.environmentalDevicePowered);
      widget.dataset.blueprintEnvironmentalReached = String(frame.environmentalDeviceReached);
      widget.dataset.blueprintEnvironmentalAimLocked = String(frame.environmentalAimLocked);
      widget.dataset.blueprintEnvironmentalFired = String(frame.environmentalDeviceFired);
      widget.dataset.blueprintEnvironmentalBossDamaged = String(frame.environmentalBossDamaged);
      widget.dataset.blueprintEnvironmentalSpent = String(frame.environmentalDeviceSpent);
      widget.dataset.blueprintEnvironmentalDamageSource = frame.environmentalDamageSource;
    }
    if (mechanicId === 'encounter-specific-tool') {
      widget.dataset.blueprintEncounterTool = frame.encounterSpecificToolState;
      widget.dataset.blueprintEncounterToolReached = String(frame.encounterToolReached);
      widget.dataset.blueprintEncounterToolEquipped = String(frame.encounterToolEquipped);
      widget.dataset.blueprintEncounterToolCombatReached = String(frame.encounterToolCombatReached);
      widget.dataset.blueprintEncounterToolCharging = String(frame.encounterToolCharging);
      widget.dataset.blueprintEncounterToolReady = String(frame.encounterToolReady);
      widget.dataset.blueprintEncounterToolFired = String(frame.encounterToolFired);
      widget.dataset.blueprintEncounterToolBossDamaged = String(frame.encounterToolBossDamaged);
      widget.dataset.blueprintEncounterToolExpired = String(frame.encounterToolExpired);
      widget.dataset.blueprintEncounterToolPackage = frame.encounterToolActionPackage;
      widget.dataset.blueprintEncounterToolDamageSource = frame.encounterToolDamageSource;
    }
    boss.setAttribute(
      'transform',
      `translate(${frame.boss.x} ${frame.boss.y}) scale(${frame.bossScale})`,
    );
    boss.setAttribute('opacity', String(frame.bossVisible));
    if (decoy && frame.decoy) {
      decoy.setAttribute('transform', `translate(${frame.decoy.x} ${frame.decoy.y})`);
      decoy.setAttribute('opacity', String(frame.decoy.opacity));
      animateDecoy(frame.bossMotion, frame.bossFacing);
    }
    player.setAttribute('transform', `translate(${frame.player.x} ${frame.player.y})`);
    animateBoss(frame.bossMotion, frame.bossFacing);
    animatePlayer(frame.playerMotion, frame.playerFacing);
    animateEffects(time, frame);
    bossLabel.setAttribute('x', frame.bossLabel.x);
    bossLabel.setAttribute('y', frame.bossLabel.y);
    bossLabel.setAttribute('opacity', String(frame.bossVisible));
    playerLabel.setAttribute('x', frame.playerLabel.x);
    playerLabel.setAttribute('y', frame.playerLabel.y);
    primitives.forEach((primitive, index) => updatePrimitive(primitive, frame.primitives[index]));
    phaseName.textContent = config.phaseNames[frame.phase];
    phaseTooltip.textContent = config.phaseDescriptions[frame.phase];
    if (announcedPhase !== frame.phase) {
      status.textContent = config.phaseDescriptions[frame.phase];
      announcedPhase = frame.phase;
    }
    timeline.value = String(Math.round(time * 1000));
    timeline.setAttribute('aria-valuetext', config.phaseNames[frame.phase]);
    widget.style.setProperty('--blueprint-progress', `${(time / BLUEPRINT_DURATION) * 100}%`);
  }

  function setRunning(next) {
    running = next;
    widget.dataset.blueprintPlaying = String(next);
    cancelAnimationFrame(animationId);
    lastTimestamp = undefined;
    if (running) animationId = requestAnimationFrame(tick);
  }
  function tick(timestamp) {
    if (!running) return;
    if (lastTimestamp !== undefined)
      time = (time + (timestamp - lastTimestamp) / 1000) % BLUEPRINT_DURATION;
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
  const applyMotionPreference = () => {
    motionNote.hidden = !reducedMotion.matches;
    updatePlayback();
  };
  reducedMotion.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', updatePlayback);
  widget.dataset.blueprintReady = 'true';
  render();
  applyMotionPreference();
}

for (const widget of document.querySelectorAll('[data-blueprint-demo]'))
  initializeBlueprint(widget);
