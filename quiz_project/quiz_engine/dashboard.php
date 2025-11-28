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

// Get recent attempts for quiz history
$stmt = $conn->prepare("
    SELECT quiz_id, score, total_questions, completed_at
    FROM quiz_attempts
    WHERE user_id = ?
    ORDER BY completed_at DESC
    LIMIT 10
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $stats['recent_attempts'][] = $row;
}
$stmt->close();

// Get in-progress quizzes (saved but not completed)
$in_progress = [];
$stmt = $conn->prepare("
    SELECT quiz_id, current_index, last_saved
    FROM quiz_progress
    WHERE user_id = ? AND completed = 0
    ORDER BY last_saved DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $in_progress[] = $row;
}
$stmt->close();

// Redirect to home page or another appropriate location
header("Location: index.php");
exit;
?>
