<?php
require_once '../session_utils.php';
require_once '../config.php';

header('Content-Type: application/json');

$session = SessionManager::getInstance();

if (!$session->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $session->getUserId();

$stmt = $conn->prepare("SELECT id, quiz_name, total_questions, created_at FROM quizzes WHERE user_id = ? AND status = 'completed' ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$quizzes = [];
while ($row = $result->fetch_assoc()) {
    $quizzes[] = $row;
}

echo json_encode(['success' => true, 'quizzes' => $quizzes]);
$stmt->close();
