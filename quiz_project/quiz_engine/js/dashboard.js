document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuth();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout
    setupLogout();
});

async function checkAuth() {
    try {
        const response = await fetch('check_auth.php');
        const data = await response.json();
        
        if (!data.loggedIn) {
            window.location.href = 'index.html';
            return;
        }
        
        // Update user info
        document.getElementById('userName').textContent = data.username;
        document.getElementById('userEmail').textContent = data.email || '';
        document.getElementById('welcomeName').textContent = data.username;
        document.getElementById('userAvatar').textContent = data.username.charAt(0).toUpperCase();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'index.html';
    }
}

async function loadDashboardData() {
    try {
        const response = await fetch('api/get_quizzes.php');
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.quizzes);
            displayQuizzes(data.quizzes);
        }
    } catch (error) {
        console.error('Failed to load quizzes:', error);
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
}

function displayQuizzes(quizzes) {
    const recentContainer = document.getElementById('recentQuizzes');
    const allContainer = document.getElementById('allQuizzes');
    
    if (quizzes.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">No quizzes yet. Create your first quiz!</p>';
        allContainer.innerHTML = '<p class="empty-state">No quizzes found.</p>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedQuizzes = [...quizzes].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    
    // Recent quizzes (last 5)
    const recentQuizzes = sortedQuizzes.slice(0, 5);
    recentContainer.innerHTML = recentQuizzes.map(quiz => createQuizCard(quiz)).join('');
    
    // All quizzes
    allContainer.innerHTML = sortedQuizzes.map(quiz => createQuizCard(quiz)).join('');
    
    // Add delete listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
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
    
    return `
        <div class="quiz-item">
            <div class="quiz-info">
                <h3>${quiz.quiz_name || 'Quiz #' + quiz.id}</h3>
                <div class="quiz-meta">
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-question-circle"></i> ${quiz.total_questions || 0} questions</span>
                    ${score !== null ? `<span class="score-badge ${scoreClass}">${score}%</span>` : '<span class="score-badge medium">In Progress</span>'}
                </div>
            </div>
            <div class="quiz-actions">
                ${quiz.status !== 'completed' ? `<a href="quiz.html?id=${quiz.id}" class="btn btn-primary btn-sm">Continue</a>` : ''}
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
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('logout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                sessionStorage.removeItem('authState');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }
}

function showToast(message, success = true) {
    const toast = document.createElement('div');
    toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
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
