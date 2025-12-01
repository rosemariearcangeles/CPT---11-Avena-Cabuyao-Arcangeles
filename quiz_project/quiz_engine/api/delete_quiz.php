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

$sql = "DELETE FROM quizzes WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $quiz_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
?>
