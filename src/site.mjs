for (const form of document.querySelectorAll('[data-quiz]')) {
  const copy = JSON.parse(form.querySelector('.quiz-data').textContent);
  const feedback = form.querySelector('.quiz-feedback');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = new FormData(form).get('answer');
    if (answer === null) {
      feedback.textContent = copy.choose;
      return;
    }
    const correct = Number(answer) === copy.correctIndex;
    feedback.dataset.correct = String(correct);
    feedback.textContent = (correct ? copy.correct : copy.incorrect) + ' ' + copy.explanation;
  });
}
const languageMenu = document.querySelector('.language-menu');
document.addEventListener('click', (event) => {
  if (languageMenu?.open && !languageMenu.contains(event.target)) languageMenu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu?.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});
