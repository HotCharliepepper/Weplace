/* R4 public illustration only. No network, booking, account or persistence. */
(function () {
  'use strict';
  const root = document.querySelector('.home-r4');
  if (!root) return;
  const questionGroup = root.querySelector('.store-questions');
  if (!questionGroup) return;
  const buttons = Array.from(questionGroup.querySelectorAll('[data-store-question]'));
  const answers = Array.from(questionGroup.querySelectorAll('[data-store-answer]'));
  function choose(button, focus, fromUser = false) {
    const value = button.dataset.storeQuestion;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    answers.forEach(item => { item.hidden = item.dataset.storeAnswer !== value; });
    if (focus) button.focus();
    questionGroup.dispatchEvent(new CustomEvent('weplace:storequestion', { bubbles: true, detail: { value, fromUser } }));
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => choose(button, false, true));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % buttons.length :
        event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length :
        event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
      if (next !== null) { event.preventDefault(); choose(buttons[next], true, true); }
    });
  });
  // Static HTML holds every answer; only this completed enhancement hides alternatives.
  choose(buttons[0], false);
  questionGroup.classList.add('store-demo-ready');
  const disclosure = root.querySelector('.store-booking-explainer');
  root.addEventListener('weplace:tabchange', event => {
    if (event.detail?.kind !== 'change') return;
    // A changed view never inherits an open simulated booking step.
    if (disclosure) disclosure.open = false;
    choose(buttons[0], false);
  });
})();
