<?php
require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();
if (!$session->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$user_id = $session->getUserId();
$username = $session->getUsername();

// Fetch user stats
$stmt = $conn->prepare("SELECT email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($email, $created_at);
$stmt->fetch();
$stmt->close();

// Get quiz statistics
$stats = [
    'total_attempts' => 0,
    'average_score' => 0,
    'best_score' => 0,
    'total_questions' => 0,
    'total_time' => 0,
    'study_streak' => 0,
    'recent_attempts' => [],
    'performance_trend' => [],
    'category_stats' => []
];

// Total attempts and average score
$stmt = $conn->prepare("SELECT COUNT(*) as total, AVG(score) as avg_score, MAX(score) as best, SUM(total_questions) as total_q FROM quiz_attempts WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($stats['total_attempts'], $stats['average_score'], $stats['best_score'], $stats['total_questions']);
$stmt->fetch();
$stmt->close();

$stats['average_score'] = $stats['average_score'] ? round($stats['average_score'], 2) : 0;
$stats['best_score'] = $stats['best_score'] ? $stats['best_score'] : 0;
$stats['total_questions'] = $stats['total_questions'] ? $stats['total_questions'] : 0;

// Calculate study streak (consecutive days with quiz attempts)
$stmt = $conn->prepare("
    SELECT DISTINCT DATE(completed_at) as quiz_date
    FROM quiz_attempts
    WHERE user_id = ?
    ORDER BY quiz_date DESC
    LIMIT 30
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$dates = [];
while ($row = $result->fetch_assoc()) {
    $dates[] = $row['quiz_date'];
}
$stmt->close();

$current_date = date('Y-m-d');
$streak = 0;
$check_date = $current_date;

foreach ($dates as $date) {
    if ($date === $check_date) {
        $streak++;
        $check_date = date('Y-m-d', strtotime($check_date . ' -1 day'));
    } elseif ($date === date('Y-m-d', strtotime($check_date . ' -1 day'))) {
        $streak++;
        $check_date = date('Y-m-d', strtotime($check_date . ' -1 day'));
    } else {
        break;
    }
}
$stats['study_streak'] = $streak;

// Get performance trend (last 7 days)
$stmt = $conn->prepare("
    SELECT DATE(completed_at) as date, AVG((score/total_questions)*100) as avg_score
    FROM quiz_attempts
    WHERE user_id = ? AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(completed_at)
    ORDER BY date
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $stats['performance_trend'][] = $row;
}
$stmt->close();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo htmlspecialchars($session->generateCSRFToken()); ?>">
    <title>Dashboard - Online Quiz Engine</title>
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<?php include "navbar.php"; ?>

<div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar">
        <div class="user-profile">
            <div class="avatar">
                <?= strtoupper(substr($username, 0, 1)) ?>
            </div>
            <h3><?= htmlspecialchars($username) ?></h3>
            <p class="email"><?= htmlspecialchars($email) ?></p>
        </div>

        <nav class="dashboard-nav">
            <a href="#overview" class="nav-link active" data-section="overview">
                <span class="icon">📊</span> Overview
            </a>
            <a href="#quiz-history" class="nav-link" data-section="quiz-history">
                <span class="icon">📝</span> Quiz History
            </a>
            <a href="#in-progress" class="nav-link" data-section="in-progress">
                <span class="icon">⏳</span> In Progress
            </a>
            <a href="#settings" class="nav-link" data-section="settings">
                <span class="icon">⚙️</span> Settings
            </a>
        </nav>

        <div class="sidebar-footer">
            <a href="profile.php" class="btn btn-secondary">Edit Profile</a>
            <button id="logoutBtn" class="btn btn-danger">Logout</button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
        <!-- Overview Section -->
        <section id="overview" class="dashboard-section active">
            <h1>Welcome back, <?= htmlspecialchars($username) ?>!</h1>
            <p class="section-subtitle">Here's your learning progress at a glance</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-content">
                        <h3>Total Quizzes</h3>
                        <p class="stat-value"><?= $stats['total_attempts'] ?></p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <h3>Average Score</h3>
                        <p class="stat-value"><?= $stats['average_score'] ?>%</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-content">
                        <h3>Best Score</h3>
                        <p class="stat-value"><?= $stats['best_score'] ?>%</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <h3>Study Streak</h3>
                        <p class="stat-value"><?= $stats['study_streak'] ?> days</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-content">
                        <h3>Questions Answered</h3>
                        <p class="stat-value"><?= number_format($stats['total_questions']) ?></p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <h3>Member Since</h3>
                        <p class="stat-value"><?= date('M d, Y', strtotime($created_at)) ?></p>
                    </div>
                </div>
            </div>

            <?php if (!empty($stats['performance_trend'])): ?>
            <div class="chart-container">
                <h2>Performance Trend (Last 7 Days)</h2>
                <div class="chart-wrapper">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($in_progress)): ?>
            <div class="quick-actions">
                <h2>Continue Learning</h2>
                <div class="action-cards">
                    <?php foreach ($in_progress as $quiz): ?>
                    <div class="action-card">
                        <h3><?= htmlspecialchars($quiz['quiz_id']) ?></h3>
                        <p>Question <?= $quiz['current_index'] + 1 ?></p>
                        <a href="quiz.html?resume=<?= urlencode($quiz['quiz_id']) ?>" class="btn btn-primary btn-sm">Resume</a>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </section>

        <!-- Quiz History Section -->
        <section id="quiz-history" class="dashboard-section">
            <h2>Quiz History</h2>
            <p class="section-subtitle">Your completed quizzes and scores</p>

            <?php if (!empty($stats['recent_attempts'])): ?>
            <div class="table-container">
                <table class="quiz-table">
                    <thead>
                        <tr>
                            <th>Quiz ID</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($stats['recent_attempts'] as $attempt): ?>
                        <tr>
                            <td><?= htmlspecialchars($attempt['quiz_id']) ?></td>
                            <td><?= $attempt['score'] ?> / <?= $attempt['total_questions'] ?></td>
                            <td>
                                <div class="score-bar">
                                    <div class="score-fill" style="width: <?= ($attempt['score'] / $attempt['total_questions'] * 100) ?>%"></div>
                                </div>
                                <?= round(($attempt['score'] / $attempt['total_questions'] * 100), 1) ?>%
                            </td>
                            <td><?= date('M d, Y', strtotime($attempt['completed_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php else: ?>
            <div class="empty-state">
                <p>No completed quizzes yet. Start a quiz to see your history!</p>
                <a href="index.html" class="btn btn-primary">Generate Quiz</a>
            </div>
            <?php endif; ?>
        </section>

        <!-- In Progress Section -->
        <section id="in-progress" class="dashboard-section">
            <h2>In Progress</h2>
            <p class="section-subtitle">Quizzes you haven't completed yet</p>

            <?php if (!empty($in_progress)): ?>
            <div class="progress-cards">
                <?php foreach ($in_progress as $quiz): ?>
                <div class="progress-card">
                    <h3><?= htmlspecialchars($quiz['quiz_id']) ?></h3>
                    <p>Question <?= $quiz['current_index'] + 1 ?></p>
                    <p class="last-saved">Last saved: <?= date('M d, Y H:i', $quiz['last_saved'] / 1000) ?></p>
                    <a href="quiz.html?resume=<?= urlencode($quiz['quiz_id']) ?>" class="btn btn-primary">Continue</a>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="empty-state">
                <p>No quizzes in progress. Start a new quiz!</p>
                <a href="index.html" class="btn btn-primary">Generate Quiz</a>
            </div>
            <?php endif; ?>
        </section>

        <!-- Settings Section -->
        <section id="settings" class="dashboard-section">
            <h2>Settings</h2>
            <p class="section-subtitle">Manage your account and preferences</p>

            <div class="settings-group">
                <h3>Account</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Edit Profile</h4>
                        <p>Update your username and email</p>
                    </div>
                    <a href="profile.php" class="btn btn-secondary btn-sm">Edit</a>
                </div>
            </div>

            <div class="settings-group">
                <h3>Security</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Change Password</h4>
                        <p>Update your password regularly for security</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="alert('Password change feature coming soon!')">Change</button>
                </div>
            </div>

            <div class="settings-group danger">
                <h3>Danger Zone</h3>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Delete Account</h4>
                        <p>Permanently delete your account and all data</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="if(confirm('Are you sure? This cannot be undone.')) { alert('Account deletion coming soon!'); }">Delete</button>
                </div>
            </div>
        </section>
    </main>
</div>

<script src="js/auth.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Navigation between sections
    const navLinks = document.querySelectorAll('.dashboard-nav .nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked
            link.classList.add('active');
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Performance Chart
    const chartCanvas = document.getElementById('performanceChart');
    if (chartCanvas) {
        const performanceData = <?php echo json_encode($stats['performance_trend']); ?>;

        if (performanceData.length > 0) {
            const labels = performanceData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });

            const scores = performanceData.map(item => parseFloat(item.avg_score).toFixed(1));

            new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Average Score (%)',
                        data: scores,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return `Score: ${context.parsed.y}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverBorderWidth: 3
                        }
                    }
                }
            });
        }
    }
});
</script>

</body>
</html>
