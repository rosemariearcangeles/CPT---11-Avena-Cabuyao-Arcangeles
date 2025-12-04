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
        // Generate quiz using AI (placeholder - integrate with your AI service)
        const quizData = await generateQuizFromText(window.fileContent, numQuestions, quizType);
        
        // Save quiz to database
        const saveResponse = await fetch('api/save_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quiz_name: title,
                quiz_data: quizData,
                total_questions: quizData.length,
                status: 'completed'
            })
        });
        
        const saveData = await saveResponse.json();
        
        if (saveData.success) {
            // Auto-assign to class
            const assignResponse = await fetch('api/assign_quiz.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

// Placeholder AI function - replace with your actual AI integration
async function generateQuizFromText(text, numQuestions, quizType) {
    // This should call your AI service
    // For now, return dummy data based on quiz type
    const questions = [];
    for (let i = 0; i < numQuestions; i++) {
        if (quizType === 'true-false') {
            questions.push({
                question: `Sample true/false question ${i + 1} from text`,
                options: ['True', 'False'],
                answer: 'True'
            });
        } else if (quizType === 'fill-blank') {
            questions.push({
                question: `Complete the sentence: Sample _____ question ${i + 1}`,
                options: ['blank', 'word', 'answer', 'text'],
                answer: 'blank'
            });
        } else if (quizType === 'mixed') {
            const types = ['multiple', 'true-false', 'fill-blank'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            if (randomType === 'true-false') {
                questions.push({
                    question: `Sample true/false question ${i + 1}`,
                    options: ['True', 'False'],
                    answer: 'True'
                });
            } else if (randomType === 'fill-blank') {
                questions.push({
                    question: `Complete: Sample _____ ${i + 1}`,
                    options: ['blank', 'word', 'answer', 'text'],
                    answer: 'blank'
                });
            } else {
                questions.push({
                    question: `Sample multiple choice question ${i + 1}`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    answer: 'Option A'
                });
            }
        } else {
            questions.push({
                question: `Sample question ${i + 1} from text`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                answer: 'Option A'
            });
        }
    }
    return questions;
}
