// Utility for getting element by ID
function $id(id) {
  return document.getElementById(id);
}

// Global variables
let uploadedText = '';
let generatedQuestions = [];
let currentQuiz = [];
let currentCategory = '';
let userAnswers = [];

// Predefined quizzes
const quizzes = {
  math: [
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "What is 5 x 3?", options: ["8", "15", "10", "20"], answer: "15" }
  ],
  science: [
    { question: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars" },
    { question: "What is H2O?", options: ["Oxygen", "Hydrogen", "Water", "Helium"], answer: "Water" }
  ],
  history: [
    { question: "Who was the first President of the USA?", options: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"], answer: "George Washington" },
    { question: "In which year did World War II end?", options: ["1945", "1939", "1918", "1965"], answer: "1945" }
  ],
  english: [
    { question: "Which word is a noun?", options: ["Run", "Beautiful", "Cat", "Quickly"], answer: "Cat" },
    { question: "What is the plural form of book?", options: ["Bookes", "Books", "Bookies", "Book"], answer: "Books" }
  ],
  "physical education": [
    { question: "What muscle is the most activated when doing planks?", options: ["Back muscles", "Arm muscles", "Core muscles", "Glutes"], answer: "Core muscles" }
  ],
  filipino: [
    { question: "Sino ang Pambansang Bayani ng Pilipinas?", options: ["Lapu-lapu", "Ferdinand Marcos Sr.", "Jose Rizal", "Padre Damaso"], answer: "Jose Rizal" }
  ]
};

// Load quiz by category
function loadQuiz(category) {
  if (!quizzes[category]) return alert(`Category "${category}" not found.`);

  currentQuiz = quizzes[category];
  currentCategory = category;
  userAnswers = [];

  $id('quiz-title').textContent = `Quiz: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  $id('quiz-section').style.display = 'block';
  $id('upload-section-main').style.display = 'none';
  $id('submit-btn').style.display = 'block';
  $id('quiz-result').innerHTML = '';

  renderQuestions();
}

// Back to upload section
$id('back-btn').addEventListener('click', () => {
  $id('quiz-section').style.display = 'none';
  $id('upload-section-main').style.display = 'block';
  $id('quiz-result').innerHTML = '';
  $id('submit-btn').style.display = 'none';
});

// Render quiz questions
function renderQuestions() {
  const quizQuestions = $id('quiz-questions');
  quizQuestions.innerHTML = '';
  currentQuiz.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
      <p><strong>Q${idx + 1}:</strong> ${q.question}</p>
      ${q.options.map(opt => `
        <label>
          <input type="radio" name="q${idx}" value="${opt}" required> ${opt}
        </label>
      `).join('')}
    `;
    quizQuestions.appendChild(block);
  });
}

// Handle quiz submission
$id('quiz-form').addEventListener('submit', e => {
  e.preventDefault();
  userAnswers = currentQuiz.map((_, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    return selected ? selected.value : null;
  });
  showResult();
});

// Show quiz results
function showResult() {
  let score = 0;
  let feedback = '';

  currentQuiz.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) {
      score++;
      feedback += `<p>✓ Q${idx + 1}: Correct!</p>`;
    } else {
      feedback += `<p>✗ Q${idx + 1}: Incorrect. Correct: <strong>${q.answer}</strong></p>`;
    }
  });

  const percentage = Math.round((score / currentQuiz.length) * 100);
  $id('quiz-result').innerHTML = `
    <h3>Your Score: ${score} / ${currentQuiz.length} (${percentage}%)</h3>
    ${feedback}
    ${score < currentQuiz.length ? `<button id="try-again-btn">🔄 Try Again</button>` : `<p style="color:green; font-weight:bold;">🎉 Perfect Score!</p>`}
  `;

  $id('try-again-btn')?.addEventListener('click', () => {
    renderQuestions();
    $id('quiz-result').innerHTML = '';
    userAnswers = [];
  });
}

// Generate questions from uploaded text
function generateQuestionsFromText(text, numQuestions = 5, includeBlank = true) {
  if (!text.trim()) return [];
  const sentences = text.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 20);
  const words = Array.from(new Set(text.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3)));
  const questions = [];
  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    const sent = sentences[i];
    const keyword = sent.split(/\s+/).sort((a,b) => b.length - a.length)[0];
    if (!keyword) continue;
    const blankSentence = includeBlank ? sent.replace(new RegExp(keyword, 'i'), '_____') : sent;
    const distractors = shuffleArray(words.filter(w => w !== keyword.toLowerCase())).slice(0,3);
    questions.push({ question: `Fill in: ${blankSentence}`, options: shuffleArray([keyword, ...distractors]), answer: keyword });
  }
  return questions;
}

// Shuffle utility
function shuffleArray(arr) {
  const array = [...arr];
  for (let i=array.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Render generated preview
function renderGeneratedPreview(list) {
  const container = $id('generated-preview-main');
  const importBtn = $id('import-btn-main');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = `<p>No questions generated.</p>`;
    importBtn.style.display = 'none';
    return;
  }
  list.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'question-preview';
    div.innerHTML = `<h3>Q${idx+1}</h3><p>${q.question}</p><div>${q.options.join(', ')}</div>`;
    container.appendChild(div);
  });
  importBtn.style.display = 'block';
  importBtn.textContent = `Start Quiz (${list.length})`;
}

// Generate button event
$id('generate-btn-main').addEventListener('click', () => {
  const fileInput = $id('material-file-main');
  const num = parseInt($id('num-questions-main').value, 10);
  const includeBlank = $id('include-blank-main').checked;
  if (!fileInput.files.length) return alert('Choose a .txt file');
  const reader = new FileReader();
  reader.onload = e => {
    uploadedText = e.target.result;
    generatedQuestions = generateQuestionsFromText(uploadedText, num, includeBlank);
    renderGeneratedPreview(generatedQuestions);
  };
  reader.readAsText(fileInput.files[0]);
});

// Import button event
$id('import-btn-main').addEventListener('click', () => {
  if (!generatedQuestions.length) return;
  currentQuiz = generatedQuestions;
  currentCategory = 'Generated Quiz';
  userAnswers = [];
  $id('quiz-title').textContent = `Quiz: ${currentCategory}`;
  renderQuestions();
  $id('quiz-section').style.display = 'block';
  $id('upload-section-main').style.display = 'none';
  $id('submit-btn').style.display = 'block';
  $id('generated-preview-main').innerHTML = '';
  $id('import-btn-main').style.display = 'none';
});

// Login modal
function openLogin() { $id('loginModal').style.display = 'block'; }
function closeLogin() { $id('loginModal').style.display = 'none'; }
window.onclick = e => { if (e.target === $id('loginModal')) closeLogin(); };
