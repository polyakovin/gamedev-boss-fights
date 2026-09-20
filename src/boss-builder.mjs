import {
  BOSS_COMBO_IDS,
  BOSS_DRAFT_STORAGE_KEY,
  BOSS_PHASE_LIMIT,
  bossSketchFilename,
  createBossSketch,
  normalizeBossDraft,
} from './boss-builder-model.mjs';
import { mechanicRelationship, rankCompatibleMechanics } from './mechanic-relations.mjs';

const builder = document.querySelector('[data-boss-builder]');

if (builder) {
  const configElement = builder.querySelector('[data-boss-builder-config]');
  const config = JSON.parse(configElement.textContent);
  const mechanicIds = config.mechanics.map(({ id }) => id);
  const mechanicsById = new Map(config.mechanics.map((mechanic) => [mechanic.id, mechanic]));
  const name = builder.querySelector('[data-boss-name]');
  const description = builder.querySelector('[data-boss-description]');
  const mechanicSearch = builder.querySelector('[data-boss-mechanic-search]');
  const mechanicCards = [...builder.querySelectorAll('[data-boss-mechanic-card]')];
  const mechanicInputs = [...builder.querySelectorAll('[data-boss-mechanic]')];
  const filterInputs = [...builder.querySelectorAll('[data-boss-filter]')];
  const results = builder.querySelector('[data-boss-results]');
  const activePhase = builder.querySelector('[data-boss-active-phase]');
  const phases = builder.querySelector('[data-boss-phases]');
  const selected = builder.querySelector('[data-boss-selected]');
  const status = builder.querySelector('[data-boss-status]');
  const download = builder.querySelector('[data-boss-download]');
  const reset = builder.querySelector('[data-boss-reset]');
  const addPhase = builder.querySelector('[data-boss-add-phase]');
  const compatibleList = builder.querySelector('[data-boss-compatible]');
  const conflictList = builder.querySelector('[data-boss-conflicts]');
  const suggestionList = builder.querySelector('[data-boss-suggestions]');

  const readStored = () => {
    try {
      return normalizeBossDraft(
        JSON.parse(localStorage.getItem(BOSS_DRAFT_STORAGE_KEY)),
        mechanicIds,
      );
    } catch {
      return normalizeBossDraft(null, mechanicIds);
    }
  };

  let draft = readStored();
  let activePhaseId = draft.phases[0].id;

  const phaseLabel = (phase, index) => phase.name.trim() || `${config.messages.phase} ${index + 1}`;
  const comboLabels = {
    solo: config.messages.comboSolo,
    a: config.messages.comboA,
    b: config.messages.comboB,
    c: config.messages.comboC,
  };

  const updateMeta = () => {
    selected.textContent = `${config.messages.selected}: ${draft.assignments.length}`;
    reset.disabled =
      !draft.name &&
      !draft.description &&
      !draft.assignments.length &&
      draft.phases.length === 1 &&
      !draft.phases[0].name &&
      !draft.phases[0].goal;
    addPhase.disabled = draft.phases.length >= BOSS_PHASE_LIMIT;
    builder.dataset.bossBuilderReady = 'true';
  };

  const storeDraft = () => {
    draft = normalizeBossDraft(draft, mechanicIds);
    try {
      localStorage.setItem(BOSS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {}
    name.removeAttribute('aria-invalid');
    status.textContent = config.messages.saved;
    updateMeta();
  };

  const fillPhaseSelect = (select, selectedId) => {
    select.replaceChildren();
    draft.phases.forEach((phase, index) => {
      const option = document.createElement('option');
      option.value = phase.id;
      option.textContent = phaseLabel(phase, index);
      option.selected = phase.id === selectedId;
      select.append(option);
    });
  };

  const updatePhaseSelectors = () => {
    fillPhaseSelect(activePhase, activePhaseId);
    for (const select of phases.querySelectorAll('[data-assignment-phase]'))
      fillPhaseSelect(select, select.dataset.selectedPhase);
  };

  const makeButton = (label, dataName, value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset[dataName] = value;
    return button;
  };

  const renderPhases = () => {
    if (!draft.phases.some(({ id }) => id === activePhaseId)) activePhaseId = draft.phases[0].id;
    fillPhaseSelect(activePhase, activePhaseId);
    phases.replaceChildren();
    draft.phases.forEach((phase, index) => {
      const card = document.createElement('article');
      card.className = `boss-builder-phase${phase.id === activePhaseId ? ' boss-builder-phase--active' : ''}`;
      card.dataset.phaseId = phase.id;

      const header = document.createElement('header');
      const number = document.createElement('button');
      number.type = 'button';
      number.className = 'boss-builder-phase__number';
      number.dataset.activatePhase = phase.id;
      number.textContent = String(index + 1).padStart(2, '0');
      number.setAttribute(
        'aria-label',
        `${config.messages.activePhase}: ${phaseLabel(phase, index)}`,
      );
      const phaseName = document.createElement('input');
      phaseName.type = 'text';
      phaseName.maxLength = 80;
      phaseName.placeholder = `${config.messages.phaseName} ${index + 1}`;
      phaseName.value = phase.name;
      phaseName.dataset.phaseName = phase.id;
      header.append(number, phaseName);
      if (draft.phases.length > 1) {
        const remove = makeButton('×', 'removePhase', phase.id);
        remove.setAttribute('aria-label', config.messages.removePhase);
        header.append(remove);
      }

      const goal = document.createElement('textarea');
      goal.rows = 2;
      goal.maxLength = 280;
      goal.placeholder = config.messages.phaseGoalPlaceholder;
      goal.value = phase.goal;
      goal.dataset.phaseGoal = phase.id;

      const assignmentList = document.createElement('div');
      assignmentList.className = 'boss-builder-assignment-list';
      const phaseAssignments = draft.assignments.filter((item) => item.phaseId === phase.id);
      if (!phaseAssignments.length) {
        const empty = document.createElement('p');
        empty.className = 'boss-builder-empty';
        empty.textContent = config.messages.none;
        assignmentList.append(empty);
      }
      for (const assignment of phaseAssignments) {
        const mechanic = mechanicsById.get(assignment.mechanicId);
        const row = document.createElement('div');
        row.className = 'boss-builder-assignment';
        row.dataset.assignment = assignment.mechanicId;
        const title = document.createElement('strong');
        title.textContent = mechanic.title;
        const controls = document.createElement('div');
        controls.className = 'boss-builder-assignment__controls';

        const phaseSelect = document.createElement('select');
        phaseSelect.dataset.assignmentPhase = assignment.mechanicId;
        phaseSelect.dataset.selectedPhase = assignment.phaseId;
        phaseSelect.setAttribute('aria-label', config.messages.phase);
        fillPhaseSelect(phaseSelect, assignment.phaseId);

        const comboSelect = document.createElement('select');
        comboSelect.dataset.assignmentCombo = assignment.mechanicId;
        comboSelect.setAttribute('aria-label', config.messages.combo);
        for (const combo of BOSS_COMBO_IDS) {
          const option = document.createElement('option');
          option.value = combo;
          option.textContent = comboLabels[combo];
          option.selected = combo === assignment.combo;
          comboSelect.append(option);
        }
        const removeMechanic = makeButton('×', 'removeAssignment', assignment.mechanicId);
        removeMechanic.dataset.assignmentPhaseId = assignment.phaseId;
        removeMechanic.setAttribute('aria-label', config.messages.removeMechanic);
        controls.append(phaseSelect, comboSelect, removeMechanic);
        row.append(title, controls);
        assignmentList.append(row);
      }
      card.append(header, goal, assignmentList);
      phases.append(card);
    });
  };

  const appendEmpty = (list) => {
    const item = document.createElement('li');
    item.className = 'boss-builder-empty';
    item.textContent = config.messages.none;
    list.append(item);
  };

  const appendPair = (list, left, right, phase) => {
    const item = document.createElement('li');
    const names = document.createElement('strong');
    names.textContent = `${left.title} + ${right.title}`;
    const context = document.createElement('span');
    context.textContent = phase;
    item.append(names, context);
    list.append(item);
  };

  const renderRelations = () => {
    compatibleList.replaceChildren();
    conflictList.replaceChildren();
    suggestionList.replaceChildren();
    let compatibleCount = 0;
    let conflictCount = 0;
    for (const [phaseIndex, phase] of draft.phases.entries()) {
      const assigned = draft.assignments
        .filter((assignment) => assignment.phaseId === phase.id)
        .map((assignment) => mechanicsById.get(assignment.mechanicId));
      for (let leftIndex = 0; leftIndex < assigned.length; leftIndex += 1)
        for (let rightIndex = leftIndex + 1; rightIndex < assigned.length; rightIndex += 1) {
          const relation = mechanicRelationship(assigned[leftIndex], assigned[rightIndex]);
          if (relation === 'compatible') {
            appendPair(
              compatibleList,
              assigned[leftIndex],
              assigned[rightIndex],
              phaseLabel(phase, phaseIndex),
            );
            compatibleCount += 1;
          }
          if (relation === 'conflict') {
            appendPair(
              conflictList,
              assigned[leftIndex],
              assigned[rightIndex],
              phaseLabel(phase, phaseIndex),
            );
            conflictCount += 1;
          }
        }
    }
    if (!compatibleCount) appendEmpty(compatibleList);
    if (!conflictCount) appendEmpty(conflictList);

    const activeAssignments = draft.assignments.filter(
      (assignment) => assignment.phaseId === activePhaseId,
    );
    const selectedIds = activeAssignments.map(({ mechanicId }) => mechanicId);
    const suggestions = rankCompatibleMechanics(config.mechanics, selectedIds).slice(0, 4);
    if (!suggestions.length) appendEmpty(suggestionList);
    for (const { mechanic, score } of suggestions) {
      const item = document.createElement('li');
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = mechanic.title;
      const reason = document.createElement('small');
      reason.textContent = `${config.messages.compatibleTitle}: ${score}`;
      copy.append(title, reason);
      item.append(copy, makeButton(config.messages.addSuggestion, 'addSuggestion', mechanic.id));
      suggestionList.append(item);
    }

    for (const card of mechanicCards) {
      const mechanic = mechanicsById.get(card.dataset.mechanicId);
      const relations = activeAssignments.map(({ mechanicId }) =>
        mechanicRelationship(mechanicsById.get(mechanicId), mechanic),
      );
      card.classList.toggle('boss-builder-mechanic--conflict', relations.includes('conflict'));
      card.classList.toggle(
        'boss-builder-mechanic--compatible',
        !relations.includes('conflict') && relations.includes('compatible'),
      );
    }
  };

  const syncMechanicInputs = () => {
    const assigned = new Set(
      draft.assignments
        .filter((assignment) => assignment.phaseId === activePhaseId)
        .map(({ mechanicId }) => mechanicId),
    );
    for (const input of mechanicInputs) input.checked = assigned.has(input.value);
  };

  const renderDraft = () => {
    syncMechanicInputs();
    renderPhases();
    renderRelations();
    updateMeta();
  };

  const applyFilters = () => {
    const query = mechanicSearch.value.trim().toLocaleLowerCase(config.locale);
    const activeFilters = Object.fromEntries(
      filterInputs.map((input) => [input.dataset.bossFilter, input.value]),
    );
    let visible = 0;
    for (const card of mechanicCards) {
      const mechanic = mechanicsById.get(card.dataset.mechanicId);
      const textMatches =
        !query || card.textContent.toLocaleLowerCase(config.locale).includes(query);
      const filtersMatch = Object.entries(activeFilters).every(
        ([key, value]) => !value || mechanic.profile[key].includes(value),
      );
      card.hidden = !(textMatches && filtersMatch);
      if (!card.hidden) visible += 1;
    }
    results.textContent = config.messages.results.replace('{count}', String(visible));
  };

  name.addEventListener('input', () => {
    draft.name = name.value;
    storeDraft();
  });
  description.addEventListener('input', () => {
    draft.description = description.value;
    storeDraft();
  });
  for (const input of mechanicInputs)
    input.addEventListener('change', () => {
      if (input.checked) {
        if (
          !draft.assignments.some(
            ({ mechanicId, phaseId }) => mechanicId === input.value && phaseId === activePhaseId,
          )
        )
          draft.assignments.push({
            mechanicId: input.value,
            phaseId: activePhaseId,
            combo: 'solo',
          });
      } else {
        draft.assignments = draft.assignments.filter(
          ({ mechanicId, phaseId }) => mechanicId !== input.value || phaseId !== activePhaseId,
        );
      }
      storeDraft();
      renderDraft();
    });

  mechanicSearch.addEventListener('input', applyFilters);
  for (const input of filterInputs) input.addEventListener('change', applyFilters);
  builder.querySelector('[data-boss-reset-filters]').addEventListener('click', () => {
    mechanicSearch.value = '';
    for (const input of filterInputs) input.value = '';
    applyFilters();
    mechanicSearch.focus();
  });

  activePhase.addEventListener('change', () => {
    activePhaseId = activePhase.value;
    renderDraft();
  });

  addPhase.addEventListener('click', () => {
    if (draft.phases.length >= BOSS_PHASE_LIMIT) return;
    let number = draft.phases.length + 1;
    while (draft.phases.some(({ id }) => id === `phase-${number}`)) number += 1;
    const phase = { id: `phase-${number}`, name: '', goal: '' };
    draft.phases.push(phase);
    activePhaseId = phase.id;
    storeDraft();
    renderDraft();
  });

  phases.addEventListener('input', (event) => {
    const phase = draft.phases.find(
      ({ id }) => id === (event.target.dataset.phaseName || event.target.dataset.phaseGoal),
    );
    if (!phase) return;
    if (event.target.matches('[data-phase-name]')) phase.name = event.target.value;
    if (event.target.matches('[data-phase-goal]')) phase.goal = event.target.value;
    storeDraft();
    updatePhaseSelectors();
  });

  phases.addEventListener('change', (event) => {
    const assignment = draft.assignments.find(
      ({ mechanicId }) =>
        mechanicId ===
        (event.target.dataset.assignmentPhase || event.target.dataset.assignmentCombo),
    );
    if (!assignment) return;
    if (event.target.matches('[data-assignment-phase]')) assignment.phaseId = event.target.value;
    if (event.target.matches('[data-assignment-combo]')) assignment.combo = event.target.value;
    storeDraft();
    renderDraft();
  });

  phases.addEventListener('click', (event) => {
    const activate = event.target.closest('[data-activate-phase]');
    if (activate) {
      activePhaseId = activate.dataset.activatePhase;
      renderDraft();
      return;
    }
    const removeAssignment = event.target.closest('[data-remove-assignment]');
    if (removeAssignment) {
      draft.assignments = draft.assignments.filter(
        ({ mechanicId, phaseId }) =>
          mechanicId !== removeAssignment.dataset.removeAssignment ||
          phaseId !== removeAssignment.dataset.assignmentPhaseId,
      );
      storeDraft();
      renderDraft();
      return;
    }
    const removePhase = event.target.closest('[data-remove-phase]');
    if (removePhase && draft.phases.length > 1) {
      const fallback = draft.phases.find(({ id }) => id !== removePhase.dataset.removePhase);
      draft.assignments = draft.assignments.map((assignment) =>
        assignment.phaseId === removePhase.dataset.removePhase
          ? { ...assignment, phaseId: fallback.id }
          : assignment,
      );
      draft.phases = draft.phases.filter(({ id }) => id !== removePhase.dataset.removePhase);
      if (activePhaseId === removePhase.dataset.removePhase) activePhaseId = fallback.id;
      storeDraft();
      renderDraft();
    }
  });

  suggestionList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-suggestion]');
    if (!button) return;
    draft.assignments.push({
      mechanicId: button.dataset.addSuggestion,
      phaseId: activePhaseId,
      combo: 'solo',
    });
    storeDraft();
    renderDraft();
  });

  reset.addEventListener('click', () => {
    draft = normalizeBossDraft(null, mechanicIds);
    activePhaseId = draft.phases[0].id;
    try {
      localStorage.removeItem(BOSS_DRAFT_STORAGE_KEY);
    } catch {}
    name.value = '';
    description.value = '';
    name.removeAttribute('aria-invalid');
    status.textContent = config.messages.cleared;
    renderDraft();
  });

  download.addEventListener('click', () => {
    if (!draft.name.trim()) {
      name.setAttribute('aria-invalid', 'true');
      status.textContent = config.messages.nameRequired;
      name.focus();
      return;
    }
    if (!draft.assignments.length) {
      status.textContent = config.messages.mechanicRequired;
      mechanicInputs[0]?.focus();
      return;
    }
    const sketch = createBossSketch(draft, config.mechanics, config.locale, {
      phase: config.messages.phase,
      combos: comboLabels,
    });
    const blob = new Blob([`${JSON.stringify(sketch, null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = bossSketchFilename(sketch.name);
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== BOSS_DRAFT_STORAGE_KEY && event.key !== null) return;
    draft = readStored();
    activePhaseId = draft.phases[0].id;
    name.value = draft.name;
    description.value = draft.description;
    renderDraft();
  });

  name.value = draft.name;
  description.value = draft.description;
  renderDraft();
  applyFilters();
}
