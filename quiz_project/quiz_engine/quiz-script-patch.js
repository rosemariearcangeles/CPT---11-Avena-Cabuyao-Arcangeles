// Add this to the end of your quiz-script.js file, or replace the showResult function

// UPDATED showResult function with database save
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

  // Save score to database
  if (typeof updateQuizScore === 'function') {
    updateQuizScore(score, currentQuiz.length);
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
