const languageMenu = document.querySelector('.language-menu');
const themeButtons = document.querySelectorAll('[data-theme-toggle]');

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

document.addEventListener('click', (event) => {
  if (languageMenu?.open && !languageMenu.contains(event.target)) languageMenu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu?.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});
