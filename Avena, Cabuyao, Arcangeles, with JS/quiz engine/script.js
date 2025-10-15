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