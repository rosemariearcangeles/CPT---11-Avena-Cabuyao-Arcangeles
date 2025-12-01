// faq.js - simple FAQ toggle handlers
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.toggle-icon');

    if (!question || !answer) return;

    // Accessibility helpers
    if (!question.hasAttribute('role')) question.setAttribute('role', 'button');
    if (!question.hasAttribute('tabindex')) question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');

    function open() {
      answer.classList.add('show');
      if (icon) icon.classList.add('rotate');
      question.setAttribute('aria-expanded', 'true');
    }

    function close() {
      answer.classList.remove('show');
      if (icon) icon.classList.remove('rotate');
      question.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (answer.classList.contains('show')) {
        close();
      } else {
        open();
      }
    }

    question.addEventListener('click', (e) => {
      toggle();
    });

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle();
      }
    });
  });
});
