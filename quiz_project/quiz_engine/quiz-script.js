// =====================
// Utility
// =====================
const $id = (id) => document.getElementById(id);

// Get CSRF token from meta tag or cookie
function getCSRFToken() {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }
  
  // Fallback: try to get from cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  
  return '';
}

// =====================
// Global Variables
// =====================
let currentQuiz = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let quizProgress = {};

// =====================
// Generate Quiz ID
// =====================
function generateQuizId() {
  return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// =====================
// Save Quiz Progress
// =====================
function saveQuizProgress() {
  try {
    // Update current answers
    const selected = document.querySelector('input[name="q' + currentQuestionIndex + '"]:checked');
    userAnswers[currentQuestionIndex] = selected ? selected.value : null;

    quizProgress = {
      quizId: quizProgress.quizId || generateQuizId(),
      answers: [...userAnswers],
      currentIndex: currentQuestionIndex,
      startTime: quizProgress.startTime || Date.now(),
      lastSaved: Date.now()
    };

    // Save to localStorage
    localStorage.setItem('quizProgress', JSON.stringify(quizProgress));
    localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));

    // Save to server if user is logged in
    saveProgressToServer();

    console.log('Quiz progress saved');
  } catch (err) {
    console.error('Error saving quiz progress:', err);
  }
}

// =====================
// Load Quiz Progress
// =====================
function loadQuizProgress() {
  try {
    const progressData = localStorage.getItem('quizProgress');
    const quizData = localStorage.getItem('currentQuiz');

    if (progressData && quizData) {
      const progress = JSON.parse(progressData);
      currentQuiz = JSON.parse(quizData);

      if (currentQuiz && currentQuiz.length) {
        quizProgress = progress;
        userAnswers = [...progress.answers];
        currentQuestionIndex = progress.currentIndex || 0;
        quizStartTime = progress.startTime;

        return true; // Progress loaded successfully
      }
    }
    return false; // No progress found
  } catch (err) {
    console.error('Error loading quiz progress:', err);
    return false;
  }
}

// =====================
// Save Progress to Server (for logged-in users)
// =====================
async function saveProgressToServer() {
  try {
    // Check if user is logged in
    const sessionResponse = await fetch('session_check.php');
    const sessionData = await sessionResponse.json();

    if (!sessionData.loggedIn) return; // Don't save if not logged in

    // Get CSRF token
    const csrfToken = getCSRFToken();

    const response = await fetch('save_quiz_progress.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({
        quizId: quizProgress.quizId,
        quizData: currentQuiz,
        answers: userAnswers,
        currentIndex: currentQuestionIndex,
        startTime: quizProgress.startTime,
        lastSaved: quizProgress.lastSaved
      })
    });

    if (!response.ok) {
      console.warn('Failed to save progress to server');
    }
  } catch (err) {
    console.error('Error saving progress to server:', err);
  }
}

// =====================
// Load Quiz from localStorage or Server
// =====================
function loadQuiz() {
  try {
    // Clear any previous quiz data from localStorage if it exists
    const quizData = localStorage.getItem('currentQuiz');
    if (!quizData) {
      console.error('No quiz data found in localStorage');
      // If we somehow got here without the check in quiz.html, redirect
      window.location.href = 'index.html';
      return;
    }

    // Try to parse the quiz data
    try {
      currentQuiz = JSON.parse(quizData);
      if (!Array.isArray(currentQuiz) || currentQuiz.length === 0) {
        throw new Error('Invalid quiz data format');
      }
    } catch (e) {
      console.error('Error parsing quiz data:', e);
      localStorage.removeItem('currentQuiz');
      localStorage.removeItem('quizProgress');
      window.location.href = 'index.html';
      return;
    }

    // Initialize user answers array
    userAnswers = new Array(currentQuiz.length).fill(null);
    
    // Try to load saved progress
    const hasProgress = loadQuizProgress();
    
    // If no progress found, initialize a new quiz session
    if (!hasProgress) {
      quizProgress = {
        quizId: generateQuizId(),
        startTime: Date.now(),
        lastSaved: Date.now(),
        answers: [...userAnswers]
      };
      saveQuizProgress();
    }

    // Simulate loading progress
    simulateLoadingProgress(() => {
      const loadingEl = $id("quiz-loading");
      const formEl = $id("quiz-form");
      if (loadingEl) loadingEl.style.display = "none";
      if (formEl) formEl.style.display = "block";

      const totalEl = $id("total-questions");
      const totalEl2 = $id("total-questions-2");
      if (totalEl) totalEl.textContent = currentQuiz.length;
      if (totalEl2) totalEl2.textContent = currentQuiz.length;

      renderAllQuestions();
      showCurrentQuestion();
      updateProgress();

      // Auto-save progress every 30 seconds
      setInterval(saveQuizProgress, 30000);
    });
  } catch (err) {
    console.error('Error loading quiz:', err);
    alert('Error loading quiz. Please try again.');
    window.location.href = 'index.html';
  }
}

// =====================
// Simulate Loading Progress
// =====================
function simulateLoadingProgress(callback) {
  const progressFill = $id("progress-fill");
  let progress = 0;
  const steps = [
    { percent: 25, delay: 500 }, // Loading data
    { percent: 50, delay: 1000 }, // Parsing questions
    { percent: 75, delay: 1500 }, // Rendering UI
    { percent: 100, delay: 2000 } // Finalizing
  ];

  steps.forEach((step, index) => {
    setTimeout(() => {
      progress = step.percent;
      if (progressFill) {
        progressFill.style.width = progress + "%";
      }
      if (index === steps.length - 1) {
        setTimeout(callback, 500); // Small delay before hiding loading
      }
    }, step.delay);
  });
}

// =====================
// Escape HTML
// =====================
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =====================
// Render All Questions Statically
// =====================
function renderAllQuestions() {
  const container = $id("quiz-questions");
  if (!container) return;

  let html = '';
  currentQuiz.forEach((q, qIndex) => {
    html += `<div class="question-slide" id="question-${qIndex}" style="display: none;">
      <div class="question-card">
        <div class="question-text">${escapeHtml(q.question)}</div>
        <div class="options-grid">`;

    q.options.forEach((opt, optIndex) => {
      const letter = String.fromCharCode(65 + optIndex);
      html += `<div class="option-item">
        <input type="radio" id="q${qIndex}opt${optIndex}" name="q${qIndex}" value="${optIndex}" required>
        <label for="q${qIndex}opt${optIndex}" class="option-label">
          <span class="option-letter">${letter}</span>
          ${escapeHtml(opt)}
        </label>
      </div>`;
    });

    html += `</div></div></div>`;
  });

  container.innerHTML = html;

  // Restore saved answers
  currentQuiz.forEach((_, qIndex) => {
    const savedAnswer = userAnswers[qIndex];
    if (savedAnswer !== null && savedAnswer !== undefined) {
      const radio = document.querySelector(`input[name="q${qIndex}"][value="${savedAnswer}"]`);
      if (radio) radio.checked = true;
    }
  });
}

// =====================
// Show Current Question (Toggle Visibility)
// =====================
function showCurrentQuestion() {
  const slides = document.querySelectorAll('.question-slide');
  slides.forEach((slide, index) => {
    slide.style.display = index === currentQuestionIndex ? 'block' : 'none';
  });

  const headerQ = $id("question-text");
  if (headerQ && currentQuiz[currentQuestionIndex]) {
    headerQ.textContent = currentQuiz[currentQuestionIndex].question;
  }

  updateNavigationButtons();
}

// =====================
// Update Progress Bar
// =====================
function updateProgress() {
  const progressCircle = $id("progress-circle-fill");
  if (progressCircle) {
    const circumference = 283; // 2 * pi * 45
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * circumference;
    progressCircle.style.strokeDashoffset = circumference - progress;
  }

  const progressPercent = $id("progress-percentage");
  if (progressPercent) {
    const pct = Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100);
    progressPercent.textContent = pct + "%";
  }

  const currentQEl = $id("current-question");
  if (currentQEl) currentQEl.textContent = currentQuestionIndex + 1;

  const remainingEl = $id("remaining");
  if (remainingEl) remainingEl.textContent = Math.max(0, currentQuiz.length - (currentQuestionIndex + 1));
}

// =====================
// Update Navigation Buttons
// =====================
function updateNavigationButtons() {
  const prevBtn = $id("prev-btn");
  const nextBtn = $id("next-btn");
  const submitBtn = $id("submit-btn");

  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
  if (nextBtn) nextBtn.style.display = currentQuestionIndex === currentQuiz.length - 1 ? "none" : "inline-flex";
  if (submitBtn) submitBtn.style.display = currentQuestionIndex === currentQuiz.length - 1 ? "inline-flex" : "none";
}

// =====================
// Navigation Handlers
// =====================
function nextQuestion() {
  const selected = document.querySelector('input[name="q' + currentQuestionIndex + '"]:checked');
  userAnswers[currentQuestionIndex] = selected ? selected.value : null;

  if (currentQuestionIndex < currentQuiz.length - 1) {
    currentQuestionIndex++;
    showCurrentQuestion();
    updateProgress();
    saveQuizProgress();
  }
}

function prevQuestion() {
  const selected = document.querySelector('input[name="q' + currentQuestionIndex + '"]:checked');
  userAnswers[currentQuestionIndex] = selected ? selected.value : null;

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showCurrentQuestion();
    updateProgress();
    saveQuizProgress();
  }
}

// =====================
// Submit Quiz
// =====================
const quizForm = $id("quiz-form");
if (quizForm) {
  quizForm.addEventListener("submit", e => {
    e.preventDefault();
    // Save the current question's answer before submitting
    const selected = document.querySelector('input[name="q' + currentQuestionIndex + '"]:checked');
    userAnswers[currentQuestionIndex] = selected ? selected.value : null;
    showResult();
  });
}

// =====================
// Show Results (keep back button)
// =====================
function showResult() {
  let score = 0;
  let html = "";

  currentQuiz.forEach((q, i) => {
    const userAnswerIndex = userAnswers[i];
    let correctIndex = null;
    if (typeof q.answer === 'number' || /^\d+$/.test(String(q.answer))) {
      correctIndex = Number(q.answer);
    } else {
      correctIndex = q.options.indexOf(q.answer);
    }

    const correct = userAnswerIndex !== null && Number(userAnswerIndex) === correctIndex;
    if (correct) score++;

    const userAnswerText = userAnswerIndex !== null ? q.options[Number(userAnswerIndex)] : 'No answer';
    const correctAnswerText = q.options[correctIndex];

    html += '<div class="result-item ' + (correct ? "correct" : "incorrect") + '">' +
      (correct ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>') + ' Q' + (i + 1) + ': ' + escapeHtml(q.question) +
      '<div class="user-answer">Your answer: ' + escapeHtml(userAnswerText) + '</div>' +
      (correct ? "" : '<div class="correct-answer">Correct: ' + escapeHtml(correctAnswerText) + '</div>') +
      '</div>';
  });

  // Update quiz score in database
  updateQuizScore(score, currentQuiz.length);

  const quizFormEl = $id("quiz-form");
  if (quizFormEl) quizFormEl.style.display = "none";

  const quizResultEl = $id("quiz-result");
  if (!quizResultEl) {
    alert('Quiz finished. Your score: ' + score + '/' + currentQuiz.length);
    return;
  }

  quizResultEl.style.display = "block";

  const scoreText = $id("score-text");
  if (scoreText) scoreText.textContent = `Your Score: ${score}/${currentQuiz.length}`;

  const scorePercent = $id("score-percentage");
  if (scorePercent) {
    const pct = Math.round((score / currentQuiz.length) * 100);
    scorePercent.textContent = pct + "%";
  }

  const breakdown = $id("results-breakdown");
  if (breakdown) {
    breakdown.innerHTML = html;
  } else {
    const fallback = document.createElement("div");
    fallback.innerHTML = '<h3>Your Score: ' + score + '/' + currentQuiz.length + '</h3>' + html;
    quizResultEl.insertBefore(fallback, quizResultEl.firstChild);
  }

  const back = $id("back-btn");
  if (back) {
    back.onclick = () => {
      localStorage.removeItem('quizProgress');
      localStorage.removeItem('currentQuiz');
      localStorage.removeItem('current_quiz_id');
      window.location.href = "index.html";
    };
  }

  // Clear saved progress after quiz completion
  localStorage.removeItem('quizProgress');
  localStorage.removeItem('currentQuiz');
  quizProgress = {};
  
  // Clear uploaded text if not logged in
  if (window._uploadedText) {
    window._uploadedText = '';
  }
}

// =====================
// Navigation Button Event Listeners
// =====================
const prevBtn = $id("prev-btn");
const nextBtn = $id("next-btn");

if (prevBtn) {
  prevBtn.addEventListener("click", prevQuestion);
}

if (nextBtn) {
  nextBtn.addEventListener("click", nextQuestion);
}

// =====================
// Parse Quiz from Text
// =====================
function parseQuizFromText(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentQuestion = null;
  let options = [];
  let answer = null;

  for (const line of lines) {
    if (line.startsWith('Question:')) {
      if (currentQuestion) {
        questions.push({ question: currentQuestion, options, answer });
      }
      currentQuestion = line.substring(9).trim();
      options = [];
      answer = null;
    } else if (line.match(/^[A-D]\)/)) {
      const optionText = line.substring(2).trim();
      options.push(optionText);
    } else if (line.startsWith('Answer:')) {
      answer = line.substring(7).trim();
    }
  }

  if (currentQuestion) {
    questions.push({ question: currentQuestion, options, answer });
  }

  return questions;
}

// =====================
// Initialize
// =====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadQuiz);
} else {
  loadQuiz();
}

