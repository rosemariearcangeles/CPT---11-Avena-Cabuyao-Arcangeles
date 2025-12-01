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
$quiz_name = $data['quiz_name'] ?? 'Quiz ' . date('M d, Y');
$quiz_data = json_encode($data['quiz_data'] ?? []);
$total_questions = intval($data['total_questions'] ?? 0);

$sql = "INSERT INTO quizzes (user_id, quiz_name, quiz_data, total_questions, status) VALUES (?, ?, ?, ?, 'in_progress')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issi", $user_id, $quiz_name, $quiz_data, $total_questions);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'quiz_id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
?>
