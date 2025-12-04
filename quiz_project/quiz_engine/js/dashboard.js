document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard initializing...');
    await checkAuth();
    await loadDashboardData();
    setupNavigation();
    setupLogout();
});

async function checkAuth() {
    try {
        const response = await fetch('check_auth.php', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        console.log('Auth check:', data);
        
        if (!data.loggedIn) {
            console.warn('User not logged in, redirecting...');
            window.location.href = 'index.html';
            return;
        }
        
        // Personal dashboard only for personal users
        if (data.role === 'student' || data.role === 'teacher') {
            console.warn('Education user accessing personal dashboard, redirecting...');
            window.location.href = 'education_dashboard.html';
            return;
        }
        
        if (document.getElementById('userName')) document.getElementById('userName').textContent = data.username;
        if (document.getElementById('userEmail')) document.getElementById('userEmail').textContent = data.email || '';
        if (document.getElementById('welcomeName')) document.getElementById('welcomeName').textContent = data.username;
        if (document.getElementById('userAvatar')) document.getElementById('userAvatar').textContent = data.username.charAt(0).toUpperCase();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'index.html';
    }
}

async function loadDashboardData() {
    console.log('Loading dashboard data...');
    try {
        const response = await fetch('api/get_quizzes.php', {
            credentials: 'same-origin'
        });
        console.log('API response status:', response.status);
        
        const data = await response.json();
        console.log('API data:', data);
        
        if (data.success && data.quizzes) {
            console.log('Found', data.quizzes.length, 'quizzes');
            updateStats(data.quizzes);
            displayQuizzes(data.quizzes);
        } else {
            console.warn('No quizzes or API error:', data);
            updateStats([]);
            displayQuizzes([]);
            
            // Show helpful message if table doesn't exist
            if (data.message && data.message.includes('Table')) {
                showToast('Database table not created. Run database_setup.sql', false);
            }
        }
    } catch (error) {
        console.error('Failed to load quizzes:', error);
        updateStats([]);
        displayQuizzes([]);
        showToast('Failed to load quizzes. Check console for details.', false);
    }
}

function updateStats(quizzes) {
    const total = quizzes.length;
    const completed = quizzes.filter(q => q.status === 'completed').length;
    
    let totalScore = 0;
    let scoreCount = 0;
    
    quizzes.forEach(quiz => {
        if (quiz.score !== null && quiz.total_questions > 0) {
            totalScore += (quiz.score / quiz.total_questions) * 100;
            scoreCount++;
        }
    });
    
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    
    document.getElementById('totalQuizzes').textContent = total;
    document.getElementById('completedQuizzes').textContent = completed;
    document.getElementById('avgScore').textContent = avgScore + '%';
    
    console.log('Stats updated:', { total, completed, avgScore });
}

function displayQuizzes(quizzes) {
    const recentContainer = document.getElementById('recentQuizzes');
    const allContainer = document.getElementById('allQuizzes');
    
    if (quizzes.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">No quizzes yet. Create your first quiz!</p>';
        allContainer.innerHTML = '<p class="empty-state">No quizzes found.</p>';
        return;
    }
    
    const sortedQuizzes = [...quizzes].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    
    const recentQuizzes = sortedQuizzes.slice(0, 5);
    recentContainer.innerHTML = recentQuizzes.map(quiz => createQuizCard(quiz)).join('');
    allContainer.innerHTML = sortedQuizzes.map(quiz => createQuizCard(quiz)).join('');
    
    // Add click handlers for viewing quiz results
    document.querySelectorAll('.quiz-item.clickable').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-delete')) {
                const quizId = item.dataset.quizId;
                viewQuizResults(quizId);
            }
        });
    });
    
    // Add delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const quizId = e.target.closest('.btn-delete').dataset.id;
            deleteQuiz(quizId);
        });
    });
}

function createQuizCard(quiz) {
    const date = new Date(quiz.created_at).toLocaleDateString();
    const score = quiz.score !== null && quiz.total_questions > 0 
        ? Math.round((quiz.score / quiz.total_questions) * 100) 
        : null;
    
    let scoreClass = '';
    if (score !== null) {
        if (score >= 80) scoreClass = 'high';
        else if (score >= 60) scoreClass = 'medium';
        else scoreClass = 'low';
    }
    
    const isCompleted = (quiz.status === 'completed' && score !== null) || (quiz.total_questions > 0);
    
    return `
        <div class="quiz-item ${isCompleted ? 'clickable' : ''}" data-quiz-id="${quiz.id}" data-status="${quiz.status}">
            <div class="quiz-info">
                <h3>${quiz.quiz_name || 'Quiz #' + quiz.id}</h3>
                <div class="quiz-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-question-circle"></i> ${quiz.total_questions || 0} questions</span>
                    ${score !== null ? `<span class="score-badge ${scoreClass}">${score}%</span>` : '<span class="score-badge medium">In Progress</span>'}
                </div>
                ${isCompleted ? '<p class="view-hint"><i class="fas fa-eye"></i> Click to view results</p>' : ''}
            </div>
            <div class="quiz-actions">
                <button class="btn btn-danger btn-sm btn-delete" data-id="${quiz.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

async function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
        const response = await fetch('api/delete_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ quiz_id: quizId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Quiz deleted successfully', true);
            await loadDashboardData();
        } else {
            showToast('Failed to delete quiz', false);
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showToast('Error deleting quiz', false);
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = item.dataset.section;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

function setupLogout() {
    // Logout handled by navbar, Back to Home is just a link
}

async function viewQuizResults(quizId) {
    try {
        const response = await fetch('api/get_quiz_details.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ quiz_id: quizId })
        });
        
        const data = await response.json();
        
        if (data.success && data.quiz) {
            showQuizResultsModal(data.quiz);
        } else {
            showToast('Failed to load quiz details', false);
        }
    } catch (error) {
        console.error('Error loading quiz:', error);
        showToast('Error loading quiz details', false);
    }
}

function showQuizResultsModal(quiz) {
    const score = quiz.score || 0;
    const total = quiz.total_questions || 0;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    
    let resultsHTML = '';
    if (quiz.quiz_data && Array.isArray(quiz.quiz_data)) {
        resultsHTML = '<div class="results-list">';
        quiz.quiz_data.forEach((q, i) => {
            resultsHTML += `
                <div class="result-item-modal">
                    <h4>Question ${i + 1}</h4>
                    <p class="question-text">${escapeHtml(q.question)}</p>
                    <div class="options-list">
                        ${q.options.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isCorrect = q.answer === opt || q.options.indexOf(q.answer) === idx;
                            return `<div class="option-display ${isCorrect ? 'correct-option' : ''}">
                                <span class="option-letter">${letter}</span> ${escapeHtml(opt)}
                                ${isCorrect ? '<i class="fas fa-check-circle"></i>' : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        resultsHTML += '</div>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'quiz-results-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content-large">
            <button class="modal-close" onclick="this.closest('.quiz-results-modal').remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-header-results">
                <h2>${quiz.quiz_name}</h2>
                <div class="score-display-large">
                    <div class="score-circle-large">${percentage}%</div>
                    <p>Score: ${score} / ${total}</p>
                </div>
            </div>
            <div class="modal-body-results">
                ${resultsHTML || '<p>No quiz data available</p>'}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, success = true) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${success ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
