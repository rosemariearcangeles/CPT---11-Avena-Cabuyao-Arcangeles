document.addEventListener('DOMContentLoaded', function() {
    // Navigation between sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    // Fetch user data and populate dashboard
    fetchDashboardData();

    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('logout.php', {
                method: 'POST',
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'index.php';
                }
            });
        });
    }
});

// Fetch dashboard data from the server
function fetchDashboardData() {
    fetch('api/dashboard_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateDashboardUI(data.data);
            } else {
                console.error('Failed to load dashboard data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

// Update the UI with dashboard data
function updateDashboardUI(data) {
    // Update user info
    const { user, stats, recent_attempts, in_progress, performance_trend } = data;
    
    // Set user info
    document.getElementById('userInitial').textContent = user.username.charAt(0).toUpperCase();
    document.getElementById('username').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('welcomeUsername').textContent = user.username;

    // Update stats grid
    updateStatsGrid(stats);
    
    // Update quiz history
    updateQuizHistory(recent_attempts);
    
    // Update in-progress quizzes
    updateInProgressQuizzes(in_progress);
    
    // Initialize performance chart
    if (performance_trend && performance_trend.length > 0) {
        initPerformanceChart(performance_trend);
    } else {
        document.querySelector('.chart-container').style.display = 'none';
    }
}

// Update the stats grid
function updateStatsGrid(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const statsHTML = `
        <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
                <h3>Total Quizzes</h3>
                <p class="stat-value">${stats.total_attempts || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
                <h3>Average Score</h3>
                <p class="stat-value">${stats.average_score || 0}%</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
                <h3>Best Score</h3>
                <p class="stat-value">${stats.best_score || 0}%</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
                <h3>Study Streak</h3>
                <p class="stat-value">${stats.study_streak || 0} days</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">❓</div>
            <div class="stat-content">
                <h3>Questions Answered</h3>
                <p class="stat-value">${stats.total_questions || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
                <h3>Member Since</h3>
                <p class="stat-value">${new Date(stats.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </div>
    `;
    
    statsGrid.innerHTML = statsHTML;
}

// Update quiz history table
function updateQuizHistory(attempts) {
    const tbody = document.querySelector('#quizHistoryTable tbody');
    if (!tbody) return;
    
    if (!attempts || attempts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No quiz history available</td></tr>';
        return;
    }
    
    const rows = attempts.map(attempt => {
        const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
        const date = new Date(attempt.completed_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <tr>
                <td>${attempt.quiz_id || 'N/A'}</td>
                <td>${attempt.score} / ${attempt.total_questions}</td>
                <td>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${percentage}%"></div>
                    </div>
                    ${percentage}%
                </td>
                <td>${formattedDate}</td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// Update in-progress quizzes
function updateInProgressQuizzes(quizzes) {
    const inProgressSection = document.getElementById('inProgressSection');
    const inProgressQuizzes = document.getElementById('inProgressQuizzes');
    
    if (!quizzes || quizzes.length === 0) {
        if (inProgressSection) {
            inProgressSection.innerHTML = `
                <div class="empty-state">
                    <p>No quizzes in progress. Start a new quiz!</p>
                    <a href="index.html" class="btn btn-primary">Generate Quiz</a>
                </div>
            `;
        }
        if (inProgressQuizzes) {
            inProgressQuizzes.closest('.quick-actions').style.display = 'none';
        }
        return;
    }
    
    const quizCards = quizzes.map(quiz => {
        const lastSaved = new Date(parseInt(quiz.last_saved));
        const formattedDate = lastSaved.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="progress-card">
                <h3>${quiz.quiz_id || 'Untitled Quiz'}</h3>
                <p>Question ${(quiz.current_index || 0) + 1}</p>
                <p class="last-saved">Last saved: ${formattedDate}</p>
                <a href="quiz.html?resume=${encodeURIComponent(quiz.quiz_id)}" class="btn btn-primary">Continue</a>
            </div>
        `;
    }).join('');
    
    if (inProgressSection) {
        inProgressSection.innerHTML = `
            <div class="progress-cards">
                ${quizCards}
            </div>
        `;
    }
    
    if (inProgressQuizzes) {
        inProgressQuizzes.innerHTML = quizCards;
    }
}

// Initialize performance chart
function initPerformanceChart(performanceData) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    const labels = performanceData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const scores = performanceData.map(item => Math.round(item.avg_score * 100) / 100);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Score (%)',
                data: scores,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Handle change password
const changePasswordBtn = document.getElementById('changePasswordBtn');
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', function() {
        // Implement password change functionality
        const newPassword = prompt('Enter your new password:');
        if (newPassword) {
            // Send password change request to the server
            fetch('api/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Password changed successfully!');
                } else {
                    alert('Failed to change password: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error changing password:', error);
                alert('An error occurred while changing your password.');
            });
        }
    });
}

// Handle account deletion
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            fetch('api/delete_account.php', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Your account has been deleted successfully.');
                    window.location.href = 'index.php';
                } else {
                    alert('Failed to delete account: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error deleting account:', error);
                alert('An error occurred while deleting your account.');
            });
        }
    });
}
