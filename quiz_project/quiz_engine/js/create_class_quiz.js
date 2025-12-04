const classId = sessionStorage.getItem('currentClassId');
const className = sessionStorage.getItem('currentClassName');

if (!classId) {
    alert('No class selected');
    window.history.back();
}

document.getElementById('className').textContent = className || 'Class';

// Preset buttons
document.getElementById('preset-fast').onclick = () => {
    document.getElementById('num-questions').value = 5;
    document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
    document.getElementById('preset-fast').classList.add('active');
};

document.getElementById('preset-full').onclick = () => {
    document.getElementById('num-questions').value = 20;
    document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
    document.getElementById('preset-full').classList.add('active');
};

// File upload
const dropZone = document.getElementById('drag-drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');

browseBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
};

dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#6366f1';
};

dropZone.ondragleave = () => {
    dropZone.style.borderColor = '#e2e8f0';
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e2e8f0';
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
};

function handleFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('Please upload a .txt file');
        return;
    }
    
    document.getElementById('file-name').textContent = `Selected: ${file.name}`;
    document.getElementById('quiz-options').style.display = 'block';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        window.fileContent = e.target.result;
    };
    reader.readAsText(file);
}

// Generate quiz
document.getElementById('generate-quiz-btn').onclick = async () => {
    if (!window.fileContent) {
        alert('Please upload a file first');
        return;
    }
    
    const title = document.getElementById('quiz-title').value.trim();
    if (!title) {
        alert('Please enter a quiz title');
        return;
    }
    
    const numQuestions = parseInt(document.getElementById('num-questions').value);
    const quizType = document.getElementById('quiz-type').value;
    
    const btn = document.getElementById('generate-quiz-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    
    try {
        const quizData = generateLocalQuestions(window.fileContent || '', numQuestions, quizType, 'medium');

        // Save quiz to database with CSRF protection
        const csrfToken = await getCSRFToken();
        const saveResponse = await fetch('api/save_quiz.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                quiz_name: title,
                quiz_data: quizData,
                total_questions: quizData.length,
                status: 'completed'
            })
        });
        
        const saveData = await saveResponse.json();
        
            if (saveData.success) {
                // Auto-assign to class with CSRF protection
                const assignResponse = await fetch('api/assign_quiz.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        class_id: classId,
                        quiz_id: saveData.quiz_id,
                        title: title
                    })
                });
            
            const assignData = await assignResponse.json();
            
            if (assignData.success) {
                alert('Quiz created and assigned successfully!');
                window.location.href = `class_dashboard.html?id=${classId}`;
            } else {
                alert('Quiz created but failed to assign: ' + assignData.message);
            }
        } else {
            alert('Failed to create quiz: ' + saveData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create quiz');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate & Assign Quiz';
    }
};

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
    const uniqueSentences = [...new Set(sentences)];
    const shuffledSentences = shuffleArray(uniqueSentences);
    const stopWords = new Set(['the','and','or','but','in','on','at','to','for','of','with','by','an','a','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them']);
    const allWords = (text || "").toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3 && w.length < 15 && !stopWords.has(w));
    const wordFreq = {};
    allWords.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
    const words = Array.from(new Set(allWords));
    const questions = [];
    const usedKeywords = new Set();
    const usedQuestions = new Set();
    const usedSentences = new Set();

    for (let i = 0; i < shuffledSentences.length && questions.length < count; i++) {
        const s = shuffledSentences[i];
        const sNorm = s.toLowerCase().trim();
        if (usedSentences.has(sNorm)) continue;
        const sentenceWords = s.split(/\s+/).filter(w => w.length > 3);
        if (!sentenceWords.length || s.length < 30 || sentenceWords.length < 5) continue;
        let candidateWords = sentenceWords.filter(w => words.includes(w.toLowerCase()) && !usedKeywords.has(w.toLowerCase()));
        if (!candidateWords.length) candidateWords = sentenceWords.filter(w => !usedKeywords.has(w.toLowerCase()));
        if (!candidateWords.length) continue;
        let keyword;
        if (difficulty === 'easy') {
            const freqSorted = candidateWords.sort((a, b) => (wordFreq[b.toLowerCase()] || 0) - (wordFreq[a.toLowerCase()] || 0));
            keyword = freqSorted[0] || candidateWords[0];
        } else if (difficulty === 'hard') {
            const freqSorted = candidateWords.sort((a, b) => (wordFreq[a.toLowerCase()] || 0) - (wordFreq[b.toLowerCase()] || 0));
            keyword = freqSorted[0] || candidateWords[0];
        } else {
            keyword = candidateWords[Math.floor(Math.random() * candidateWords.length)] || sentenceWords[Math.floor(Math.random() * sentenceWords.length)];
        }
        const keywordLower = keyword.toLowerCase();
        usedKeywords.add(keywordLower);
        const keywordFreq = wordFreq[keywordLower] || 1;
        const similarFreqWords = words.filter(w => w !== keywordLower && !usedKeywords.has(w) && Math.abs((wordFreq[w] || 1) - keywordFreq) <= 2);
        const distractors = shuffleArray(similarFreqWords.length ? similarFreqWords : words.filter(w => w !== keywordLower && !usedKeywords.has(w))).slice(0, 3);
        while (distractors.length < 3) distractors.push("Option" + (distractors.length + 1));

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
                question = `True or False: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), distractors[0] || "something else")}`;
                answer = 'False';
            }
            options = ['True','False'];
        } else if (type === 'mixed') {
            const randType = ['multiple','fill-blank','true-false'][Math.floor(Math.random() * 3)];
            if (randType === 'fill-blank') {
                question = `Complete the sentence: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), "_____")}`;
                options = shuffleArray([keyword, ...distractors.slice(0, 3)]);
                answer = keyword;
            } else if (randType === 'true-false') {
                const isTrue2 = Math.random() > 0.5;
                if (isTrue2) {
                    question = `True or False: ${s}`;
                    answer = 'True';
                } else {
                    question = `True or False: ${s.replace(new RegExp(`\\b${keyword}\\b`, 'i'), distractors[0] || "something else")}`;
                    answer = 'False';
                }
                options = ['True','False'];
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
        const qNorm = question.toLowerCase().replace(/\s+/g, ' ').trim();
        if (!usedQuestions.has(qNorm)) {
            usedQuestions.add(qNorm);
            usedSentences.add(sNorm);
            questions.push({ question, options, answer });
        }
    }

    if (!questions.length && words.length) {
        const shuffledWords = shuffleArray(words);
        for (let i = 0; i < Math.min(count, shuffledWords.length); i++) {
            const keyword = shuffledWords[i];
            if (usedKeywords.has(keyword)) continue;
            usedKeywords.add(keyword);
            const distractors = shuffleArray(words.filter(w => w !== keyword && !usedKeywords.has(w))).slice(0, 3);
            while (distractors.length < 3) distractors.push("Choice" + (distractors.length + 1));

            let question, options, answer;
            if (type === 'fill-blank') {
                question = `What word is this? _____`;
                options = shuffleArray([keyword, ...distractors]);
                answer = keyword;
            } else if (type === 'true-false') {
                question = `Is "${keyword}" a word?`;
                options = ['True','False'];
                answer = 'True';
            } else if (type === 'mixed') {
                const randType2 = ['multiple','fill-blank','true-false'][Math.floor(Math.random() * 3)];
                if (randType2 === 'fill-blank') {
                    question = `What word is this? _____`;
                    options = shuffleArray([keyword, ...distractors]);
                    answer = keyword;
                } else if (randType2 === 'true-false') {
                    question = `Is "${keyword}" a word?`;
                    options = ['True','False'];
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
