let uploadedText = '';
let generatedQuestions = [];

const quizzes = {
  math: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    },
    {
      question: "What is 5 x 3?",
      options: ["8", "15", "10", "20"],
      answer: "15"
    }
  ],
  science: [
    {
      question: "What planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      answer: "Mars"
    },
    {
      question: "What is H2O?",
      options: ["Oxygen", "Hydrogen", "Water", "Helium"],
      answer: "Water"
    }
  ],
  history: [
    {
      question: "Who was the first President of the USA?",
      options: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"],
      answer: "George Washington"
    },
    {
      question: "In which year did World War II end?",
      options: ["1945", "1939", "1918", "1965"],
      answer: "1945"
    }
  ],
  english: [
    {
      question: "Which word is a noun?",
      options: ["Run", "Beautiful", "Cat", "Quickly"],
      answer: "Cat"
    },
    { 
      question: "What is the plural form of book?",
      options: ["Bookes", "Books", "Bookies", "Book"],
      answer: "Books"
    },
    {
      question: "Which word is an adjective?",
      options: ["Sing", "Tall", "Slowly", "Dance"],
      answer: "Tall"
    },
    {
      question: "What is the opposite of happy?",
      options: ["Sad", "Excited", "Good", "Tired"],
      answer: "Sad"
    },
    {
      question: "Choose the sentence that is correctly written.",
      options: ["she is my friend.", "She is my friend.", "she is My friend.", "She is My friend."],
      answer: "She is my friend."
    },
    {
      question: "Which sentence tells about the past?",
      options: ["I am eating lunch.", "I eat lunch everyday.", "I will eat lunch later.", "I ate lunch an hour ago."],
      answer: "I ate lunch an hour ago."
    },
    {
      question: "Which word rhymes with cake?",
      options: ["Cat", "Lake", "Car", "Book"],
      answer: "Lake"
    },
    {
      question: "Choose the correct word:The dog _______ in the yard.",
      options: ["run", "running", "runs", "runned"],
      answer: "runs"
    },
    {
      question: "What punctuation mark ends this sentence: Where are you going",
      options: [".", "?", "!", ","],
      answer: "?"
    },
    {
      question: "What is the correct order of these words to make a sentence?the / reading / girl / is / book",
      options: ["book is the girl reading", "is girl book the reading", "the girl is reading book", "the girl is reading the book"],
      answer: "the girl is reading the book"
    },
  ],
  "physical education": [
    {
      question: "What muscle is the most activated when doing planks?",
      options: ["Back muscles", "Arm muscles", "Core muscles", "Glutes"],
      answer: "Core muscles"
    },
    {
      question: "What skills you need to excel at for sprinting races?",
      options: ["Breathing", "Flexibility", "Explosiveness", "Coordination"],
      answer: "Explosiveness"
    },
    {
      question: "What exercise requires you to hang on a bar and reel yourself upwards? ",
      options: ["Push-ups", "Squats", "Planks", "Pull-ups"],
      answer: "Pull-ups"
    }
  ],
  filipino: [
    {
      question: "Sino ang Pambansang Bayani ng Pilipinas?",
      options: ["Lapu-lapu", "Ferdinand Marcos Sr.", "Jose Rizal", "Padre Damaso"],
      answer: "Jose Rizal"
    },
    {
      question: "Ano ang tagalog ng salitang 'Green'?",
      options: ["Pula", "Kahel", "Luntian", "Berde"],
      answer: "Luntian"
    },
    {
      question: "Alin dito ang salitang pangngalan",
      options: ["Tumatakbo", "Malawak", "Aso", "Lakad"],
      answer: "Aso"
    }
  ]
};

let currentQuiz = [];
let currentCategory = '';
let userAnswers = [];

function loadQuiz(category) {
  currentQuiz = quizzes[category];
  currentCategory = category;
  userAnswers = [];
  document.getElementById('quiz-title').textContent = `Quiz: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  renderQuestions();
  document.getElementById('submit-btn').style.display = 'block';
  document.getElementById('quiz-result').innerHTML = '';
}

// Back to upload handler (non-destructive, safe)
const backBtn = document.getElementById('back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    const quizSection = document.getElementById('quiz-section');
    const uploadSection = document.querySelector('.upload-section');
    if (quizSection) quizSection.style.display = 'none';
    if (uploadSection) uploadSection.style.display = 'block';
    // clear result and hide submit
    const resultEl = document.getElementById('quiz-result');
    if (resultEl) resultEl.innerHTML = '';
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.style.display = 'none';
  });
}

function renderQuestions() {
  const quizQuestions = document.getElementById('quiz-questions');
  quizQuestions.innerHTML = '';
  currentQuiz.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
      <p><strong>Q${idx + 1}:</strong> ${q.question}</p>
      ${q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${idx}" value="${opt}" required>
          ${opt}
        </label><br>
      `).join('')}
    `;
    quizQuestions.appendChild(block);
  });
}

document.getElementById('quiz-form').addEventListener('submit', function(e) {
  e.preventDefault();
  userAnswers = [];
  currentQuiz.forEach((q, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    userAnswers.push(selected ? selected.value : null);
  });
  showResult();
});

function showResult() {
  let score = 0;
  let feedback = '';
  currentQuiz.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) {
      score++;
      feedback += `<p>Q${idx + 1}: Correct!</p>`;
    } else {
      feedback += `<p>Q${idx + 1}: Incorrect. Correct answer: <strong>${q.answer}</strong></p>`;
    }
  });
  document.getElementById('quiz-result').innerHTML = `
    <h3>Your Score: ${score} / ${currentQuiz.length}</h3>
    ${feedback}
  `;
  if (score < currentQuiz.length) {
    document.getElementById('quiz-result').innerHTML += `<button onclick="loadQuiz('${currentCategory}')">Try Again</button>`;
  }
}

// File upload and question generation handling
// Helper functions for question generation
function generateQuestionsFromText(text, numQuestions = 5, includeBlank = true) {
  if (!text || text.trim().length === 0) return [];
  
  // Basic sentence splitting
  const sentences = text.split(/[.!?][\s\n]+/).map(s => s.trim()).filter(s => s.length > 20);
  const candidates = sentences.slice(0, Math.max(numQuestions, sentences.length));
  
  // Simple word extraction
  const words = text.toLowerCase()
    .replace(/[\n\r]/g, ' ')
    .split(/[^a-z]+/)
    .filter(w => w.length > 3);
  
  const questions = [];
  for (let i = 0; i < Math.min(numQuestions, candidates.length); i++) {
    const sent = candidates[i];
    // Find the longest word as keyword (simple approach)
    const keyword = sent.split(/\s+/)
      .map(w => w.replace(/[^a-zA-Z]/g, ''))
      .filter(w => w.length > 3)
      .sort((a, b) => b.length - a.length)[0];
    
    if (!keyword) continue;
    
    const blankSentence = includeBlank 
      ? sent.replace(new RegExp(keyword, 'i'), '_____') 
      : sent;
    
    // Generate distractors from other words
    const otherWords = words.filter(w => w !== keyword.toLowerCase());
    const distractors = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    questions.push({
      question: `Fill in: ${blankSentence}`,
      options: shuffleArray([keyword, ...distractors]),
      answer: keyword
    });
  }
  
  return questions;
}

function renderGeneratedPreview(list) {
  const container = document.getElementById('generated-preview');
  const importBtn = document.getElementById('import-btn');
  container.innerHTML = '';
  
  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="preview-message">
        <p>No questions could be generated. Try uploading different text with more complete sentences.</p>
      </div>
    `;
    importBtn.style.display = 'none';
    return;
  }
  
  list.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'question-preview';
    div.innerHTML = `
      <h3>Question ${idx + 1}</h3>
      <p class="question-text">${q.question}</p>
      <div class="options-list">
        ${q.options.map(opt => `
          <div class="option-item">
            <span class="option-marker">•</span>
            ${opt}
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(div);
  });
  
  // Show import button with counter
  importBtn.style.display = 'block';
  importBtn.textContent = `Start Quiz (${list.length} questions)`;
  
  // Scroll preview into view
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.getElementById('generate-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('material-file');
  const generateBtn = document.getElementById('generate-btn');
  const num = parseInt(document.getElementById('num-questions').value || '5', 10);
  const includeBlank = document.getElementById('include-blank').checked;

  // Basic validation
  if (fileInput.files.length === 0) {
    alert('Please choose a .txt file with learning material.');
    return;
  }

  const file = fileInput.files[0];
  // Add file size check (1MB limit)
  if (file.size > 1024 * 1024) {
    alert('File is too large. Please choose a file under 1MB.');
    return;
  }

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = String(e.target.result || '');
      if (!text.trim()) {
        throw new Error('File appears to be empty.');
      }
      uploadedText = text;
      generatedQuestions = generateQuestionsFromText(uploadedText, num, includeBlank);
      renderGeneratedPreview(generatedQuestions);
    } catch (error) {
      alert(error.message || 'Failed to process file. Please try again.');
      document.getElementById('generated-preview').innerHTML = '';
    } finally {
      // Reset button state
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Questions';
    }
  };

  reader.onerror = () => {
    alert('Failed to read file. Please try again.');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Questions';
  };

  reader.readAsText(file);
});

// Handle importing generated questions into the quiz
document.getElementById('import-btn').addEventListener('click', () => {
  if (!generatedQuestions || generatedQuestions.length === 0) return;
  
  currentQuiz = generatedQuestions;
  currentCategory = 'Generated Quiz';
  userAnswers = [];
  
  document.getElementById('quiz-title').textContent = `Quiz: ${currentCategory}`;
  renderQuestions();
  document.getElementById('submit-btn').style.display = 'block';
  document.getElementById('quiz-result').innerHTML = '';
  
  // Clear preview and hide import button
  document.getElementById('generated-preview').innerHTML = '';
  document.getElementById('import-btn').style.display = 'none';
});

// added this for login modal function
function openLogin() {
  document.getElementById("loginModal").style.display = "block";
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("loginModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}