const languageMenu = document.querySelector('.language-menu');
const themeButtons = document.querySelectorAll('[data-theme-toggle]');
const checklistStoragePrefix = 'boss-fight-atlas-checklist:';

function currentTheme() {
  return (
    document.documentElement.dataset.theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

function updateThemeButtons() {
  const isDark = currentTheme() === 'dark';
  for (const button of themeButtons) {
    const label = isDark ? button.dataset.labelLight : button.dataset.labelDark;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(isDark));
  }
}

for (const button of themeButtons) {
  button.addEventListener('click', () => {
    const theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('boss-fight-atlas-theme', theme);
    } catch {}
    updateThemeButtons();
  });
}
updateThemeButtons();

for (const checklist of document.querySelectorAll('[data-checklist-id]')) {
  const checkboxes = [...checklist.querySelectorAll('[data-checklist-checkbox]')];
  const reset = checklist.querySelector('[data-checklist-reset]');
  const storageKey = `${checklistStoragePrefix}${checklist.dataset.checklistId}`;

  const readChecked = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      return new Set(
        Array.isArray(saved) ? saved.filter((value) => typeof value === 'string') : [],
      );
    } catch {
      return new Set();
    }
  };

  const update = (checked = readChecked()) => {
    for (const checkbox of checkboxes) checkbox.checked = checked.has(checkbox.value);
    const completed = checkboxes.filter((checkbox) => checkbox.checked).length;
    reset.disabled = completed === 0;
    checklist.dataset.checklistComplete = String(completed);
    checklist.dataset.checklistReady = 'true';
  };

  const save = () => {
    const checked = checkboxes.filter((checkbox) => checkbox.checked).map(({ value }) => value);
    try {
      if (checked.length) localStorage.setItem(storageKey, JSON.stringify(checked));
      else localStorage.removeItem(storageKey);
    } catch {}
    update(new Set(checked));
  };

  for (const checkbox of checkboxes) checkbox.addEventListener('change', save);
  reset.addEventListener('click', () => {
    for (const checkbox of checkboxes) checkbox.checked = false;
    save();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) update();
  });
  update();
}

document.addEventListener('click', (event) => {
  if (languageMenu?.open && !languageMenu.contains(event.target)) languageMenu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu?.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});
