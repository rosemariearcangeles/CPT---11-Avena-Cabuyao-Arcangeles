// faq.js - simple FAQ toggle handlers
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    // Accessibility helpers
    if (!question.hasAttribute('role')) question.setAttribute('role', 'button');
    if (!question.hasAttribute('tabindex')) question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');

    function toggle() {
      const isActive = item.classList.contains('active');
      
      if (isActive) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    }

    question.addEventListener('click', toggle);

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle();
      }
    });
  });
});
