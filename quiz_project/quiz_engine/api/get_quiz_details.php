<?php
require_once '../session_utils.php';
require_once '../config.php';

header('Content-Type: application/json');

$session = SessionManager::getInstance();

if (!$session->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$user_id = $session->getUserId();
$quiz_id = intval($data['quiz_id'] ?? 0);

if ($quiz_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid quiz ID']);
    exit;
}

$sql = "SELECT id, quiz_name, quiz_data, total_questions, score, status, created_at 
        FROM quizzes WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $quiz_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $row['quiz_data'] = json_decode($row['quiz_data'], true);
    echo json_encode(['success' => true, 'quiz' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'Quiz not found']);
}
?>
