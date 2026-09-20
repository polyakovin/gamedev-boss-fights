import {
  BOSS_DRAFT_STORAGE_KEY,
  bossSketchFilename,
  createBossSketch,
  normalizeBossDraft,
} from './boss-builder-model.mjs';

const builder = document.querySelector('[data-boss-builder]');

if (builder) {
  const configElement = builder.querySelector('[data-boss-builder-config]');
  const config = JSON.parse(configElement.textContent);
  const mechanicIds = config.mechanics.map(({ id }) => id);
  const name = builder.querySelector('[data-boss-name]');
  const description = builder.querySelector('[data-boss-description]');
  const mechanicInputs = [...builder.querySelectorAll('[data-boss-mechanic]')];
  const selected = builder.querySelector('[data-boss-selected]');
  const status = builder.querySelector('[data-boss-status]');
  const download = builder.querySelector('[data-boss-download]');
  const reset = builder.querySelector('[data-boss-reset]');

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

  const readControls = () =>
    normalizeBossDraft(
      {
        name: name.value,
        description: description.value,
        mechanics: mechanicInputs.filter((input) => input.checked).map(({ value }) => value),
      },
      mechanicIds,
    );

  const updateMeta = (draft = readControls()) => {
    selected.textContent = `${config.messages.selected}: ${draft.mechanics.length}`;
    reset.disabled = !draft.name && !draft.description && !draft.mechanics.length;
    builder.dataset.bossBuilderReady = 'true';
  };

  const apply = (draft) => {
    name.value = draft.name;
    description.value = draft.description;
    for (const input of mechanicInputs) input.checked = draft.mechanics.includes(input.value);
    updateMeta(draft);
  };

  const save = () => {
    const draft = readControls();
    try {
      localStorage.setItem(BOSS_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {}
    name.removeAttribute('aria-invalid');
    status.textContent = config.messages.saved;
    updateMeta(draft);
  };

  name.addEventListener('input', save);
  description.addEventListener('input', save);
  for (const input of mechanicInputs) input.addEventListener('change', save);

  reset.addEventListener('click', () => {
    const empty = normalizeBossDraft(null, mechanicIds);
    try {
      localStorage.removeItem(BOSS_DRAFT_STORAGE_KEY);
    } catch {}
    apply(empty);
    name.removeAttribute('aria-invalid');
    status.textContent = config.messages.cleared;
  });

  download.addEventListener('click', () => {
    const draft = readControls();
    if (!draft.name.trim()) {
      name.setAttribute('aria-invalid', 'true');
      status.textContent = config.messages.nameRequired;
      name.focus();
      return;
    }
    if (!draft.mechanics.length) {
      status.textContent = config.messages.mechanicRequired;
      mechanicInputs[0]?.focus();
      return;
    }
    const sketch = createBossSketch(draft, config.mechanics, config.locale);
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
    if (event.key === BOSS_DRAFT_STORAGE_KEY || event.key === null) apply(readStored());
  });

  apply(readStored());
}
