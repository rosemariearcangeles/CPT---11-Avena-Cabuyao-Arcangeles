// =====================
// Utility
// =====================
const $id = id => document.getElementById(id);

// =====================
// Global Variables
// =====================
let uploadedText = '';
let generatedQuestions = [];
let currentQuiz = [];
let currentCategory = '';
let userAnswers = [];
let quizTypeSelected = 'multiple';
let numQuestionsSelected = 5;

// =====================
// Predefined Quizzes
// =====================
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

// =====================
// Load Quiz from Category
// =====================
function loadQuiz(category) {
  if (!quizzes[category]) return alert(`Category "${category}" not found.`);

  currentQuiz = quizzes[category];
  currentCategory = category;
  userAnswers = [];

  $id('quiz-title').innerHTML = `Quiz: <span class="category-name">${capitalize(category)}</span>`;
  $id('quiz-section').style.display = 'block';
  $id('upload-section-main').style.display = 'none';
  $id('submit-btn').style.display = 'block';
  $id('quiz-result').innerHTML = '';

  renderQuestions();
}

// =====================
// Back Button
// =====================
$id('back-btn').addEventListener('click', () => {
  $id('quiz-section').style.display = 'none';
  $id('upload-section-main').style.display = 'block';
  $id('quiz-result').innerHTML = '';
  $id('submit-btn').style.display = 'none';
});

// =====================
// Render Questions
// =====================
function renderQuestions() {
  const quizQuestions = $id('quiz-questions');
  quizQuestions.innerHTML = '';

  currentQuiz.forEach((q, idx) => {
    let html = `<div class="question-block fade-in"><p class="question-text"><strong>Q${idx + 1}:</strong> ${q.question}</p>`;
    
    if (quizTypeSelected === 'fill-blank') {
      html += `<input type="text" name="q${idx}" placeholder="Your answer here" required />`;
    } else if (quizTypeSelected === 'true-false') {
      html += `
        <label class="option-label"><input type="radio" name="q${idx}" value="True" required> True</label>
        <label class="option-label"><input type="radio" name="q${idx}" value="False"> False</label>
      `;
    } else { // multiple choice
      html += q.options.map(opt => `
        <label class="option-label"><input type="radio" name="q${idx}" value="${opt}" required> ${opt}</label>
      `).join('');
    }

    html += '</div>';
    quizQuestions.innerHTML += html;
  });
}

// =====================
// Quiz Submission
// =====================
$id('quiz-form').addEventListener('submit', e => {
  e.preventDefault();
  userAnswers = currentQuiz.map((_, idx) => {
    const input = document.querySelector(`input[name="q${idx}"]:checked`) || document.querySelector(`input[name="q${idx}"]`);
    return input ? input.value : null;
  });
  showResult();
});

// =====================
// Show Results
// =====================
function showResult() {
  let score = 0;
  const total = currentQuiz.length;
  let feedback = '';

  currentQuiz.forEach((q, idx) => {
    const correct = userAnswers[idx] && userAnswers[idx].toLowerCase() === q.answer.toLowerCase();
    if (correct) score++;
    feedback += `
      <div class="result-item ${correct ? 'correct' : 'incorrect'}">
        ${correct ? '✅' : '❌'} <strong>Q${idx + 1}:</strong> ${q.question} 
        ${!correct ? `<span class="correct-answer">(Correct: ${q.answer})</span>` : ''}
      </div>
    `;
  });

  const percentage = Math.round((score / total) * 100);
  $id('quiz-result').innerHTML = `
    <h3 class="score">Your Score: ${score} / ${total} (${percentage}%)</h3>
    <div class="feedback">${feedback}</div>
    ${score < total ? `<button id="try-again-btn" class="btn-primary">🔄 Try Again</button>` : `<p class="perfect-score">🎉 Perfect Score!</p>`}
  `;

  const tryBtn = $id('try-again-btn');
  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      renderQuestions();
      $id('quiz-result').innerHTML = '';
      userAnswers = [];
    }, { once: true });
  }
}

// =====================
// Generate Questions from Text
// =====================
function generateQuestionsFromText(text, numQuestions = 5, type='multiple') {
  if (!text.trim()) return [];
  const sentences = text.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 20);
  const words = Array.from(new Set(text.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3)));
  const questions = [];

  for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
    const sent = sentences[i];
    const keyword = sent.split(/\s+/)
                        .filter(w => !['the','this','that','with','from','have','and','for'].includes(w.toLowerCase()))
                        .sort((a,b) => b.length - a.length)[0];
    if (!keyword) continue;

    let questionText = '';
    let options = [];
    if (type === 'fill-blank') {
      questionText = `Fill in: ${sent.replace(new RegExp(keyword, 'i'), '_____')}`;
      options = [keyword, ...shuffleArray(words.filter(w => w !== keyword.toLowerCase())).slice(0,3)];
    } else if (type === 'true-false') {
      questionText = `True or False: ${sent}`;
      options = ['True', 'False'];
    } else { // multiple choice
      questionText = sent;
      options = shuffleArray([keyword, ...shuffleArray(words.filter(w => w !== keyword.toLowerCase())).slice(0,3)]);
    }

    questions.push({ question: questionText, options: options, answer: keyword });
  }

  return questions;
}

// =====================
// Shuffle Utility
// =====================
function shuffleArray(arr) {
  const array = [...arr];
  for (let i=array.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// =====================
// Drag & Drop + File Upload
// =====================
const dragDropZone = $id('drag-drop-zone');
const fileInput = $id('file-input');
const browseBtn = $id('browse-btn');
const fileName = $id('file-name');
const numInput = $id('num-questions');
const quizTypeSelect = $id('quiz-type');

browseBtn.addEventListener('click', () => fileInput.click());

function handleFile(file) {
  if (!file || file.type !== "text/plain") {
    alert("Please upload a valid .txt file.");
    return;
  }

  fileName.textContent = `✅ ${file.name} uploaded successfully.`;

  const reader = new FileReader();
  reader.onload = e => {
    uploadedText = e.target.result;
    numQuestionsSelected = parseInt(numInput.value) || 5;
    quizTypeSelected = quizTypeSelect.value;
    generatedQuestions = generateQuestionsFromText(uploadedText, numQuestionsSelected, quizTypeSelected);
    renderGeneratedPreview(generatedQuestions);
  };
  reader.readAsText(file);
}

dragDropZone.addEventListener('dragover', e => { e.preventDefault(); dragDropZone.classList.add('dragover'); });
dragDropZone.addEventListener('dragleave', () => dragDropZone.classList.remove('dragover'));
dragDropZone.addEventListener('drop', e => {
  e.preventDefault();
  dragDropZone.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

// =====================
// Generate Quiz Button
// =====================
$id('generate-quiz-ai').addEventListener('click', () => {
  if (!fileInput.files.length) return alert('Choose a .txt file first');
  handleFile(fileInput.files[0]);
});

// =====================
// Import Generated Quiz
// =====================
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

// =====================
// Login Modal
// =====================
function openLogin() { $id('loginModal').classList.add('show'); }
function closeLogin() { $id('loginModal').classList.remove('show'); }
window.onclick = e => { if (e.target === $id('loginModal')) closeLogin(); };

// =====================
// Helpers
// =====================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =====================
// Render Preview of Generated Questions
// =====================
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
    div.className = 'question-preview card-glass fade-in';
    div.innerHTML = `
      <h3>Q${idx+1}</h3>
      <p>${q.question}</p>
      <div class="options-preview">${q.options.join(', ')}</div>
    `;
    container.appendChild(div);
  });

  importBtn.textContent = `Start Quiz (${list.length})`;
  importBtn.style.display = 'block';
}
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.carousel-track');
  if (track) {
    // Duplicate cards so there’s always content flowing in
    track.innerHTML += track.innerHTML;
  }
});
document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('active');
      });
    });
