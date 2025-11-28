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
    'recent_attempts' => []
];

// Total attempts and average score
$stmt = $conn->prepare("SELECT COUNT(*) as total, AVG(score) as avg_score, MAX(score) as best FROM quiz_attempts WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($stats['total_attempts'], $stats['average_score'], $stats['best_score']);
$stmt->fetch();
$stmt->close();

$stats['average_score'] = $stats['average_score'] ? round($stats['average_score'], 2) : 0;
$stats['best_score'] = $stats['best_score'] ? $stats['best_score'] : 0;

// Recent quiz attempts (last 5)
$stmt = $conn->prepare("SELECT quiz_id, score, total_questions, completed_at FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $stats['recent_attempts'][] = $row;
}
$stmt->close();

// Get quiz progress (in-progress quizzes)
$stmt = $conn->prepare("SELECT quiz_id, current_index, last_saved FROM quiz_progress WHERE user_id = ? ORDER BY last_saved DESC LIMIT 5");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$in_progress = [];
while ($row = $result->fetch_assoc()) {
    $in_progress[] = $row;
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="">
    <title>Dashboard - Online Quiz Engine</title>
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <h3>Member Since</h3>
                        <p class="stat-value"><?= date('M d, Y', strtotime($created_at)) ?></p>
                    </div>
                </div>
            </div>

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
});
</script>

</body>
</html>
