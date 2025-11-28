<?php
header('Content-Type: application/json');

require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();

// Check if user is logged in
if (!$session->isLoggedIn()) {
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in'
    ]);
    exit;
}

$userId = $session->getUserId();

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['quizId']) || !isset($data['quizData']) || !isset($data['answers'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data provided'
    ]);
    exit;
}

$quizId = $data['quizId'];
$quizData = json_encode($data['quizData']);
$answers = json_encode($data['answers']);
$currentIndex = isset($data['currentIndex']) ? (int)$data['currentIndex'] : 0;
$startTime = isset($data['startTime']) ? (int)$data['startTime'] : time() * 1000;
$lastSaved = isset($data['lastSaved']) ? (int)$data['lastSaved'] : time() * 1000;

// Insert or update quiz progress
$stmt = $conn->prepare("INSERT INTO quiz_progress (user_id, quiz_id, quiz_data, answers, current_index, start_time, last_saved)
                       VALUES (?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE
                       answers = VALUES(answers),
                       current_index = VALUES(current_index),
                       last_saved = VALUES(last_saved)");

$stmt->bind_param("isssiii", $userId, $quizId, $quizData, $answers, $currentIndex, $startTime, $lastSaved);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Progress saved successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save progress: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>
