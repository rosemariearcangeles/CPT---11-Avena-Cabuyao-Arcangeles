let assignment = null;
let questions = [];
let currentQuestion = 0;
let answers = {};

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignment');
  
  if (!assignmentId) {
    alert('No assignment specified');
    window.history.back();
    return;
  }
  
  await loadAssignment(assignmentId);
  renderQuestion();
  
  document.getElementById('nextBtn').onclick = nextQuestion;
  document.getElementById('prevBtn').onclick = prevQuestion;
  document.getElementById('submitBtn').onclick = submitQuiz;
});

async function loadAssignment(assignmentId) {
  try {
    const response = await fetch('api/get_class_assignments.php?class_id=' + sessionStorage.getItem('currentClassId'));
    const data = await response.json();
    
    if (data.success) {
      assignment = data.assignments.find(a => a.id == assignmentId);
      if (assignment && assignment.quiz_data) {
        questions = JSON.parse(assignment.quiz_data);
        document.getElementById('quizTitle').textContent = assignment.title || assignment.quiz_name;
      }
    }
  } catch (error) {
    console.error('Failed to load assignment:', error);
  }
}

function renderQuestion() {
  if (!questions.length) return;
  
  const q = questions[currentQuestion];
  const content = document.getElementById('quizContent');
  
  content.innerHTML = `
    <div class="question-card">
      <h2>Question ${currentQuestion + 1}</h2>
      <p class="question-text">${q.question}</p>
      <div class="options">
        ${q.options.map((opt, i) => `
          <label class="option-label">
            <input type="radio" name="answer" value="${i}" ${answers[currentQuestion] == i ? 'checked' : ''}>
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  
  document.querySelectorAll('input[name="answer"]').forEach(input => {
    input.onchange = () => answers[currentQuestion] = parseInt(input.value);
  });
  
  document.getElementById('questionCounter').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  document.getElementById('prevBtn').style.display = currentQuestion > 0 ? 'block' : 'none';
  document.getElementById('nextBtn').style.display = currentQuestion < questions.length - 1 ? 'block' : 'none';
  document.getElementById('submitBtn').style.display = currentQuestion === questions.length - 1 ? 'block' : 'none';
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

async function submitQuiz() {
  if (Object.keys(answers).length < questions.length) {
    if (!confirm('You have unanswered questions. Submit anyway?')) return;
  }
  
  let score = 0;
  questions.forEach((q, i) => {
    const correctIndex = q.options.indexOf(q.answer);
    if (answers[i] === correctIndex) score++;
  });
  
  try {
    const response = await fetch('api/submit_assignment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignment_id: assignment.id,
        answers: answers,
        score: score
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`Quiz submitted! Score: ${score}/${questions.length}`);
      window.location.href = 'class_dashboard.html?id=' + sessionStorage.getItem('currentClassId');
    } else {
      alert('Failed to submit: ' + data.message);
    }
  } catch (error) {
    console.error('Submit failed:', error);
    alert('Error submitting quiz');
  }
}
