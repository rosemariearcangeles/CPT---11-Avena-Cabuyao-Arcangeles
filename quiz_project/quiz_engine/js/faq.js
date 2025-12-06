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
// Accordion functionality
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    question.classList.toggle('active');
    const answer = question.nextElementSibling;
    if (answer.style.display === "block") {
      answer.style.display = "none";
    } else {
      answer.style.display = "block";
    }
  });
});

// FAQ Search
const searchInput = document.getElementById('faq-search');
const faqItems = document.querySelectorAll('.faq-item');

searchInput.addEventListener('keyup', () => {
  const searchText = searchInput.value.toLowerCase();
  faqItems.forEach(item => {
    const questionText = item.querySelector('.faq-text').innerText.toLowerCase();
    item.style.display = questionText.includes(searchText) ? 'block' : 'none';
  });
});
