import { BOSS_DRAFT_STORAGE_KEY, setBossDraftMechanic } from './boss-builder-model.mjs';

const actions = [...document.querySelectorAll('[data-mechanic-builder-action]')];

const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(BOSS_DRAFT_STORAGE_KEY));
  } catch {
    return null;
  }
};

const includesMechanic = (draft, mechanicId) =>
  (Array.isArray(draft?.assignments) &&
    draft.assignments.some((assignment) => assignment?.mechanicId === mechanicId)) ||
  (Array.isArray(draft?.mechanics) && draft.mechanics.includes(mechanicId));

for (const action of actions) {
  const mechanicId = action.dataset.mechanicId;
  const input = action.querySelector('[data-mechanic-builder-toggle]');
  const status = action.querySelector('[data-mechanic-builder-status]');

  const update = () => {
    input.checked = includesMechanic(readDraft(), mechanicId);
    action.dataset.mechanicBuilderReady = 'true';
  };

  input.addEventListener('change', () => {
    const draft = setBossDraftMechanic(readDraft(), mechanicId, input.checked);
    let saved = false;
    try {
      localStorage.setItem(BOSS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      saved = true;
    } catch {}
    if (saved) status.textContent = action.dataset.savedLabel;
    update();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === BOSS_DRAFT_STORAGE_KEY || event.key === null) update();
  });

  update();
}
