  // script.js - restored carousel + upload + generation wiring
(() => {
  const $id = id => document.getElementById(id);

  // Globals
  window._uploadedText = "";
  let mode = "local";

  // DOM refs (initialized in init)
  let dragDropZone, fileInput, fileNameEl, quizOptions, browseBtn,
      presetFast, presetFull, genBtn, heroSlidesEl, heroDotsEl, heroSectionEl;

  // small helper
  const safeText = (s) => typeof s === 'string' ? s : '';

  // show/hide quiz options
  function setQuizOptionsVisible(visible) {
    if (!quizOptions) return;
    quizOptions.style.display = visible ? "flex" : "none";
    quizOptions.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  // show filename
  function showFileName(name) {
    if (!fileNameEl) return;
    fileNameEl.textContent = name || "";
  }

  // spinner helpers
  function showProcessingSpinner() {
    if (!dragDropZone) return;
    if (!dragDropZone.querySelector('.spinner')) {
      const s = document.createElement('div');
      s.className = 'spinner';
      // basic spinner styles in-case they're missing — unobtrusive
      s.style.width = '36px';
      s.style.height = '36px';
      s.style.border = '4px solid rgba(0,0,0,0.06)';
      s.style.borderTop = '4px solid var(--primary-color)';
      s.style.borderRadius = '50%';
      s.style.margin = '12px auto 0';
      s.style.animation = 'spin 1s linear infinite';
      dragDropZone.appendChild(s);
    }
    dragDropZone.classList.add('processing');
  }
  function clearProcessingSpinner() {
    if (!dragDropZone) return;
    const s = dragDropZone.querySelector('.spinner');
    if (s) s.remove();
    dragDropZone.classList.remove('processing');
  }

  // Debounce duplicates
  const DUP_WINDOW = 500;
  let lastProcessed = { name: null, time: 0 };

  function processFile(file) {
    if (!file) return;
    const now = Date.now();
    if (file.name === lastProcessed.name && (now - lastProcessed.time) < DUP_WINDOW) return;
    lastProcessed = { name: file.name, time: now };

    showProcessingSpinner();
    showFileName('Loading: ' + file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      window._uploadedText = e.target.result || "";
      setQuizOptionsVisible(true);
      showFileName(file.name);
      clearProcessingSpinner();
    };
    reader.onerror = () => {
      clearProcessingSpinner();
      alert('Failed to read file. Try again.');
      showFileName('');
      setQuizOptionsVisible(false);
    };
    reader.readAsText(file);
  }

  // Local question generator (kept from your logic)
  function shuffleArray(arr) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateLocalQuestions(text, count = 5, type = 'multiple', difficulty = 'medium') {
    const sentences = (text || "").split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean);
    // Deduplicate sentences to avoid duplicate questions
    const uniqueSentences = [...new Set(sentences)];
    // Shuffle to randomize selection
    const shuffledSentences = shuffleArray(uniqueSentences);
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'an', 'a', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    const allWords = (text || "").toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3 && w.length < 15 && !stopWords.has(w));
    const wordFreq = {};
    allWords.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
    const sortedWords = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
    const words = Array.from(new Set(allWords));
    const questions = [];
    const usedKeywords = new Set(); // Track used keywords to avoid repeats
    const usedQuestions = new Set(); // Track used question texts to prevent duplicates

    for (let i = 0; i < shuffledSentences.length && questions.length < count; i++) {
      const s = shuffledSentences[i];
      const sentenceWords = s.split(/\s+/).filter(w => w.length > 3);
      if (!sentenceWords.length || s.length < 30 || sentenceWords.length < 5) continue; // Skip short sentences or potential headings
      // Select keyword based on difficulty, avoiding used ones
      let candidateWords = sentenceWords.filter(w => words.includes(w.toLowerCase()) && !usedKeywords.has(w.toLowerCase()));
      if (!candidateWords.length) candidateWords = sentenceWords.filter(w => !usedKeywords.has(w.toLowerCase()));
      if (!candidateWords.length) continue; // Skip if no available words
      let keyword;
      if (difficulty === 'easy') {
        // Prefer high frequency words
        const freqSorted = candidateWords.sort((a, b) => (wordFreq[b.toLowerCase()] || 0) - (wordFreq[a.toLowerCase()] || 0));
        keyword = freqSorted[0] || candidateWords[0];
      } else if (difficulty === 'hard') {
        // Prefer low frequency words
        const freqSorted = candidateWords.sort((a, b) => (wordFreq[a.toLowerCase()] || 0) - (wordFreq[b.toLowerCase()] || 0));
        keyword = freqSorted[0] || candidateWords[0];
      } else {
        // Medium: random
        keyword = candidateWords[Math.floor(Math.random() * candidateWords.length)] || sentenceWords[Math.floor(Math.random() * sentenceWords.length)];
      }
      usedKeywords.add(keyword.toLowerCase());
      // Better distractors: select from words with similar frequency, not used
      const keywordFreq = wordFreq[keyword.toLowerCase()] || 1;
      const similarFreqWords = words.filter(w => w !== keyword.toLowerCase() && !usedKeywords.has(w) && Math.abs((wordFreq[w] || 1) - keywordFreq) <= 2);
      const distractors = shuffleArray(similarFreqWords.length ? similarFreqWords : words.filter(w => w !== keyword.toLowerCase() && !usedKeywords.has(w))).slice(0, 3);
      while (distractors.length < 3) distractors.push("Option1", "Option2", "Option3");

      let question, options, answer;
      if (type === 'fill-blank') {
        question = `Complete the sentence: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), "_____")}`;
        options = shuffleArray([keyword, ...distractors.slice(0, 3)]);
        answer = keyword;
      } else if (type === 'true-false') {
        const isTrue = Math.random() > 0.5;
        if (isTrue) {
          question = `True or False: ${s}`;
          answer = 'True';
        } else {
          // Modify sentence to make it false
          question = `True or False: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), distractors[0] || "something else")}`;
          answer = 'False';
        }
        options = ['True', 'False'];
      } else if (type === 'mixed') {
        const randType = ['multiple', 'fill-blank', 'true-false'][Math.floor(Math.random() * 3)];
        if (randType === 'fill-blank') {
          question = `Complete the sentence: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), "_____")}`;
          options = shuffleArray([keyword, ...distractors.slice(0, 3)]);
          answer = keyword;
        } else if (randType === 'true-false') {
          const isTrue = Math.random() > 0.5;
          if (isTrue) {
            question = `True or False: ${s}`;
            answer = 'True';
          } else {
            question = `True or False: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), distractors[0] || "something else")}`;
            answer = 'False';
          }
          options = ['True', 'False'];
        } else {
          const questionTypes = [
            `In the sentence "${s}", what is the key term?`,
            `In this sentence: "${s}", identify the main word.`,
            `In the sentence "${s}", which word is central?`
          ];
          question = questionTypes[Math.floor(Math.random() * questionTypes.length)];
          options = shuffleArray([keyword, ...distractors.slice(0, 3)]);
          answer = keyword;
        }
      } else {
        // multiple choice - varied questions
        const questionTypes = [
          `In the sentence "${s}", what is the key term?`,
          `In this sentence: "${s}", identify the main word.`,
          `In the sentence "${s}", which word is central?`,
          `In the sentence "${s}", what term best describes the focus?`
        ];
        question = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        options = shuffleArray([keyword, ...distractors.slice(0, 3)]);
        answer = keyword;
      }
      // Check for duplicate questions
      if (!usedQuestions.has(question)) {
        usedQuestions.add(question);
        questions.push({ question, options, answer });
      }
    }

    if (!questions.length && words.length) {
      for (let i = 0; i < Math.min(count, words.length); i++) {
        const keyword = words[i];
        const distractors = shuffleArray(words.filter(w => w !== keyword)).slice(0, 3);
        while (distractors.length < 3) distractors.push("Choice1", "Choice2", "Choice3");

        let question, options, answer;
        if (type === 'fill-blank') {
          question = `What word is this? _____`;
          options = shuffleArray([keyword, ...distractors]);
          answer = keyword;
        } else if (type === 'true-false') {
          question = `Is "${keyword}" a word?`;
          options = ['True', 'False'];
          answer = 'True';
        } else if (type === 'mixed') {
          const randType = ['multiple', 'fill-blank', 'true-false'][Math.floor(Math.random() * 3)];
          if (randType === 'fill-blank') {
            question = `What word is this? _____`;
            options = shuffleArray([keyword, ...distractors]);
            answer = keyword;
          } else if (randType === 'true-false') {
            question = `Is "${keyword}" a word?`;
            options = ['True', 'False'];
            answer = 'True';
          } else {
            question = `What is the word?`;
            options = shuffleArray([keyword, ...distractors]);
            answer = keyword;
          }
        } else {
          question = `What is the word?`;
          options = shuffleArray([keyword, ...distractors]);
          answer = keyword;
        }
        questions.push({ question, options, answer });
      }
    }

    return questions;
  }



  // Wire up after DOM ready
  function init() {
    // Safely get elements, they may not exist on all pages
    dragDropZone = $id('drag-drop-zone');
    fileInput = $id('file-input');
    fileNameEl = $id('file-name');
    quizOptions = $id('quiz-options');
    browseBtn = $id('browse-btn');
    presetFast = $id('preset-fast');
    presetFull = $id('preset-full');
    genBtn = $id('generate-quiz-ai');
    modeSelect = $id('generation-mode');
    // IMPORTANT: use the hero SECTION element that exists in your HTML
    heroSlidesEl = $id('hero-section'); // <- patched: previously looked for non-existent #hero-slides
    heroDotsEl = $id('hero-dots');
    heroSectionEl = $id('hero-section');

    // Add event listeners for login and register buttons, and close buttons
    document.querySelectorAll('.login-btn').forEach(btn => {
      btn.addEventListener('click', openLogin);
    });
    document.querySelectorAll('.register-btn').forEach(btn => {
      btn.addEventListener('click', openRegister);
    });
    document.querySelectorAll('.close-login').forEach(btn => {
      btn.addEventListener('click', closeLogin);
    });
    document.querySelectorAll('.close-register').forEach(btn => {
      btn.addEventListener('click', closeRegister);
    });

    // Optional: Close modals when clicking outside modal content
    window.addEventListener('click', (event) => {
      const loginModal = document.getElementById('loginModal');
      const registerModal = document.getElementById('registerModal');
      if (loginModal && event.target === loginModal) {
        closeLogin();
      }
      if (registerModal && event.target === registerModal) {
        closeRegister();
      }
    });

    // Optional: Close modals on Escape key press
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLogin();
        closeRegister();
      }
    });

    // mode select (keep in sync with generation cards if present)
    if (modeSelect) {
      mode = modeSelect.value || "local";
      modeSelect.addEventListener('change', () => {
        mode = modeSelect.value || "local";
        syncGenerationCards();
      });
    }

    // Presets - only if elements exist
    function bindPreset(btn, val) {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const el = $id('num-questions');
        if (el) el.value = val;
        setTimeout(() => btn.blur(), 40);
      });
      btn.addEventListener('mouseleave', () => btn.blur());
    }
    if (presetFast) bindPreset(presetFast, 5);
    if (presetFull) bindPreset(presetFull, 20);

    // generate button - only if exists
    if (genBtn) {
      genBtn.addEventListener('click', async () => {
        const numEl = $id('num-questions');
        const count = numEl ? (parseInt(numEl.value, 10) || 5) : 5;
        const typeEl = $id('quiz-type');
        const type = typeEl ? typeEl.value : 'multiple';
        const difficultyEl = $id('quiz-difficulty');
        const difficulty = difficultyEl ? difficultyEl.value : 'medium';
        const text = (window._uploadedText || "").trim();
        if (!text) {
          alert('Please upload a text file first.');
          return;
        }
        genBtn.disabled = true;
        const oldLabel = genBtn.textContent;
        genBtn.textContent = 'Generating...';
        try {
          const quiz = mode === 'ai' ? await generateAIQuestions(text, count, type) : generateLocalQuestions(text, count, type, difficulty);
          if (!quiz || !quiz.length) {
            alert('Could not generate questions from the uploaded text.');
            return;
          }
          localStorage.setItem('currentQuiz', JSON.stringify(quiz));
          window.location.href = 'quiz.html';
        } catch (err) {
          console.error(err);
          alert('Generation failed.');
        } finally {
          genBtn.disabled = false;
          genBtn.textContent = oldLabel;
        }
      });
    }

    // Upload handlers (click, browse, drag/drop) - only if dragDropZone exists
    if (dragDropZone) {
      // prevent browse btn click from bubbling
      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          fileInput.click();
        });
      }

      if (fileInput) {
        fileInput.addEventListener('change', (ev) => {
          const f = ev.target.files && ev.target.files[0];
          if (f) processFile(f);
          else {
            showFileName('');
            setQuizOptionsVisible(false);
          }
        });
      }

      dragDropZone.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
        dragDropZone.classList.add('dragover');
      });

      dragDropZone.addEventListener('dragleave', () => {
        dragDropZone.classList.remove('dragover');
      });

      dragDropZone.addEventListener('drop', (ev) => {
        ev.preventDefault();
        dragDropZone.classList.remove('dragover');
        const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (!f) return;
        if (fileInput) {
          const dt = new DataTransfer();
          dt.items.add(f);
          fileInput.files = dt.files;
          // trigger change event once
          const changeEv = new Event('change', { bubbles: true });
          fileInput.dispatchEvent(changeEv);
        } else {
          processFile(f);
        }
      });

      dragDropZone.addEventListener('click', (ev) => {
        if (ev.target && ev.target.closest && ev.target.closest('#browse-btn')) return;
        if (fileInput) fileInput.click();
      });

      // if user drops outside zone, prevent default and clear highlight
      window.addEventListener('drop', (ev) => {
        if (!ev.target || (dragDropZone && !dragDropZone.contains(ev.target))) {
          ev.preventDefault();
          dragDropZone.classList.remove('dragover');
        }
      });
    }

    // Wire generation cards (if present) for improved UI
    function syncGenerationCards() {
      const cards = Array.from(document.querySelectorAll('.gen-clean-option'));
      if (!cards || !cards.length) return;
      // remove selected from all, then set the one matching mode
      cards.forEach(c => {
        const m = (c.dataset.mode || '').toLowerCase();
        if (m === (mode || '').toLowerCase()) {
          c.classList.add('selected');
          c.setAttribute('aria-pressed', 'true');
        } else {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        }
      });
    }

    function bindGenerationCards() {
      const cards = Array.from(document.querySelectorAll('.gen-clean-option'));
      if (!cards || !cards.length) return;
      cards.forEach(card => {
        // ensure accessible focus
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        // set role for screen readers
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');

        const dataMode = (card.dataset.mode || card.getAttribute('data-mode') || card.getAttribute('data-value') || '').toLowerCase();
        const activate = (ev) => {
          ev && ev.preventDefault && ev.preventDefault();
          if (dataMode) {
            mode = dataMode;
            // update hidden select if exists
            if (modeSelect) {
              try {
                modeSelect.value = mode;
                // dispatch change for any listeners
                const ch = new Event('change', { bubbles: true });
                modeSelect.dispatchEvent(ch);
              } catch (e) { /* ignore */ }
            }
            syncGenerationCards();
          } else {
            // fallback: try to infer from text content
            const txt = (card.textContent || '').toLowerCase();
            if (txt.includes('ai')) {
              mode = 'ai';
            } else {
              mode = 'local';
            }
            if (modeSelect) {
              modeSelect.value = mode;
              modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            syncGenerationCards();
          }
          // small visual focus clear
          setTimeout(() => card.blur(), 60);
        };

        card.addEventListener('click', activate);

        // keyboard activation (Enter / Space)
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            activate(e);
          }
        });
      });

      // initialise selection based on current mode/select
      if (modeSelect && modeSelect.value) mode = modeSelect.value || mode;
      syncGenerationCards();
    }

    // Initialize hero carousel (only if hero elements exist)
    if (heroSlidesEl && heroDotsEl && heroSectionEl) {
      initHeroCarousel();
    }

    // Bind generation UI after DOM ready
    bindGenerationCards();
  } // end init()

  // HERO carousel implementation (robust image loading + fallback)
  function initHeroCarousel() {
    const slides = [
      { type: 'color', value: 'linear-gradient(135deg,#5A67D8,#805AD5)', ready: true },
      { type: 'image', value: 'images/mm.jpeg', ready: false },
      { type: 'image', value: 'images/nn.jpeg', ready: false },
      { type: 'image', value: 'images/oo.jpeg', ready: false }
    ];

    // preload images
    slides.forEach(s => {
      if (s.type === 'image') {
        const img = new Image();
        img.onload = () => s.ready = true;
        img.onerror = () => {
          s.ready = false;
          console.warn('Hero image failed to load:', s.value);
        };
        img.src = s.value;
      }
    });

    // build dots
    heroDotsEl.innerHTML = '';
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = (i === 0) ? 'dot active' : 'dot';
      btn.setAttribute('aria-label', 'Slide ' + (i + 1));
      btn.dataset.index = String(i);
      btn.addEventListener('click', () => goTo(i));
      heroDotsEl.appendChild(btn);
    });

    const dotButtons = Array.from(heroDotsEl.children);
    let index = 0;
    const INTERVAL = 4500;
    let timer = null;

    function render(i) {
      const s = slides[i];
      if (!s) return;
      if (s.type === 'image') {
        if (s.ready) {
          // apply image to hero SECTION element
          heroSectionEl.style.backgroundImage = `url('${s.value}')`;
          heroSectionEl.style.backgroundSize = 'cover';
          heroSectionEl.style.backgroundPosition = 'center';
          heroSectionEl.style.backgroundRepeat = 'no-repeat';
          heroSectionEl.style.backgroundColor = '';
        } else {
          // temporarily use first color slide as background
          heroSectionEl.style.backgroundImage = '';
          heroSectionEl.style.backgroundColor = slides[0] && slides[0].value ? '' : '#4b6cb7';
          // attempt to set image when it becomes ready (poll short times)
          const poll = setInterval(() => {
            if (s.ready) {
              heroSectionEl.style.backgroundImage = `url('${s.value}')`;
              heroSectionEl.style.backgroundSize = 'cover';
              heroSectionEl.style.backgroundPosition = 'center';
              heroSectionEl.style.backgroundRepeat = 'no-repeat';
              clearInterval(poll);
            }
          }, 300);
          // stop polling after a timeout to avoid runaway
          setTimeout(() => clearInterval(poll), 8000);
        }
      } else {
        heroSectionEl.style.backgroundImage = '';
        heroSectionEl.style.background = s.value;
      }

      // update dots
      dotButtons.forEach((d, j) => d.classList.toggle('active', j === i));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render(index);
      restartTimer();
    }

    function next() {
      index = (index + 1) % slides.length;
      render(index);
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(next, INTERVAL);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function restartTimer() {
      stopTimer();
      startTimer();
    }

    // pause/resume on hover/focus for accessibility
    heroSectionEl.addEventListener('mouseenter', stopTimer);
    heroSectionEl.addEventListener('mouseleave', startTimer);
    heroSectionEl.addEventListener('focusin', stopTimer);
    heroSectionEl.addEventListener('focusout', startTimer);

    // initial render + start
    render(index);
    startTimer();

    // expose small helpers
    window.setHeroSlide = goTo;
    window.pauseHero = stopTimer;
    window.resumeHero = startTimer;
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose helpers for dev/debug
  window._quizHelpers = {
    generateLocalQuestions,
    processFile
  };

/* ===============================
   LOGIN / REGISTER MODAL LOGIC (ENHANCED)
   =============================== */

// CSRF token management
let csrfToken = null;

async function getCSRFToken() {
  try {
    const response = await fetch('../csrf_token.php');
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
}

// Modal functions
function openModal(modal) {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  modal.setAttribute('aria-hidden', 'true');
  // Clear form errors
  clearFormErrors(modal);
}

function clearFormErrors(modal) {
  const errorMessages = modal.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.textContent = '');
  const inputs = modal.querySelectorAll('input');
  inputs.forEach(input => {
    input.classList.remove('error');
    input.setCustomValidity('');
  });
}

function openLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    openModal(modal);
  }
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    closeModal(modal);
  }
}

function openRegister() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    openModal(modal);
  }
}

function closeRegister() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    closeModal(modal);
  }
}

// Switch between login and register
function switchToRegister() {
  closeModal(document.getElementById('loginModal'));
  openModal(document.getElementById('registerModal'));
}

function switchToLogin() {
  closeModal(document.getElementById('registerModal'));
  openModal(document.getElementById('loginModal'));
}

/* ===============================
   SINGLE TOAST NOTIFICATION FUNCTION
   =============================== */

function showToast(message, success = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${success ? "toast-success" : "toast-error"}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => toast.classList.add("visible"), 30);

  // Fade out
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ===============================
   LOGIN HANDLER (AJAX → login.php)
   =============================== */

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showToast("Please enter username and password.", false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    if (csrfToken) {
      formData.append("csrf_token", csrfToken);
    }

    const baseUrl = window.location.origin;
    const res = await fetch(baseUrl + "/login.php", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      closeLogin();
      showToast(`Welcome back, ${data.username}!`);
      await updateLoginUI();
    } else {
      showToast(data.message || "Login failed.", false);
    }

  } catch {
    showToast("Server error. Try again.", false);
  }
}

/* ===============================
   REGISTER HANDLER (AJAX → register.php) - ENHANCED
   =============================== */

async function handleRegister(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('#register-submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.btn-spinner');

  // Show loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Creating Account...';
  spinner.style.display = 'block';

  // Clear previous errors
  clearFormErrors(form);

  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const pass = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm-password").value;

  // Client-side validation
  let hasError = false;
  if (!username) {
    document.getElementById('register-username-error').textContent = 'Username is required';
    document.getElementById('register-username').classList.add('error');
    hasError = true;
  }
  if (!email) {
    document.getElementById('register-email-error').textContent = 'Email is required';
    document.getElementById('register-email').classList.add('error');
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('register-email-error').textContent = 'Please enter a valid email';
    document.getElementById('register-email').classList.add('error');
    hasError = true;
  }
  if (!pass) {
    document.getElementById('register-password-error').textContent = 'Password is required';
    document.getElementById('register-password').classList.add('error');
    hasError = true;
  } else if (pass.length < 6) {
    document.getElementById('register-password-error').textContent = 'Password must be at least 6 characters';
    document.getElementById('register-password').classList.add('error');
    hasError = true;
  }
  if (!confirm) {
    document.getElementById('register-confirm-error').textContent = 'Please confirm your password';
    document.getElementById('register-confirm-password').classList.add('error');
    hasError = true;
  } else if (pass !== confirm) {
    document.getElementById('register-confirm-error').textContent = 'Passwords do not match';
    document.getElementById('register-confirm-password').classList.add('error');
    hasError = true;
  }

  if (hasError) {
    submitBtn.disabled = false;
    btnText.textContent = 'Create Account';
    spinner.style.display = 'none';
    return;
  }

  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", pass);
    formData.append("confirmPassword", confirm);
    if (csrfToken) {
      formData.append("csrf_token", csrfToken);
    }

    const baseUrl = window.location.origin;
    const res = await fetch(baseUrl + "/register.php", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      closeRegister();
      showToast(`Account created! Welcome, ${data.username}!`);
      await updateLoginUI();
    } else {
      showToast(data.message || "Registration failed.", false);
    }

  } catch (error) {
    console.error('Registration error:', error);
    showToast("Server error. Try again.", false);
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = 'Create Account';
    spinner.style.display = 'none';
  }
}

/* ===============================
   UPDATE NAVBAR AFTER LOGIN
   =============================== */

async function updateLoginUI() {
  try {
    const baseUrl = window.location.origin;
    const res = await fetch(baseUrl + "/session_check.php");
    const data = await res.json();

    const loginBtn = document.querySelector(".login-btn");
    const regBtn = document.querySelector(".register-btn");
    const profileDash = document.getElementById("nav-profile-dashboard");
    const profileName = document.getElementById("profile-username");

    if (data.loggedIn) {
      if (loginBtn) loginBtn.style.display = "none";
      if (regBtn) regBtn.style.display = "none";

      if (profileDash) profileDash.style.display = "inline-flex";
      if (profileName) profileName.textContent = data.username;
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (regBtn) regBtn.style.display = "inline-block";

      if (profileDash) profileDash.style.display = "none";
    }

  } catch {
    console.error("Login UI update failed");
  }
}

/* ===============================
   LOGOUT HANDLER
   =============================== */

async function handleLogout() {
  try {
    const baseUrl = window.location.origin;
    const res = await fetch(baseUrl + "/logout.php", { method: "POST" });
    const data = await res.json();

    if (data.success) {
      showToast("Logged out successfully.");
      await updateLoginUI();
    }
  } catch {
    showToast("Logout failed.", false);
  }
}

/* ===============================
   EVENT LISTENERS - ENHANCED
   =============================== */

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize CSRF tokens
  csrfToken = await getCSRFToken();
  if (csrfToken) {
    const loginCsrf = document.getElementById('login-csrf');
    const registerCsrf = document.getElementById('register-csrf');
    if (loginCsrf) loginCsrf.value = csrfToken;
    if (registerCsrf) registerCsrf.value = csrfToken;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("nav-logout-btn");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  updateLoginUI();
});


// Scroll animation for "How It Works" section
document.addEventListener('DOMContentLoaded', () => {
  const howItWorksSection = document.getElementById('how-it-works');
  if (!howItWorksSection) return;

  // Create observer
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        howItWorksSection.classList.add('animate'); // Add class to trigger CSS animation
        obs.unobserve(howItWorksSection); // Trigger only once
      }
    });
  }, { threshold: 0.3 }); // Trigger when 30% visible

  observer.observe(howItWorksSection);
});

})();