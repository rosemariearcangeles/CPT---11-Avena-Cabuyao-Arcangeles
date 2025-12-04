<?php
require_once '../session_utils.php';
require_once '../config.php';

header('Content-Type: application/json');

$session = SessionManager::getInstance();

if (!$session->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// CSRF protection for state-changing request
$csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
if (!$csrfHeader || !$session->validateCSRFToken($csrfHeader)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$user_id = $session->getUserId();
$quiz_id = intval($data['quiz_id'] ?? 0);
$score = intval($data['score'] ?? 0);

$sql = "UPDATE quizzes SET score = ?, status = 'completed' WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $score, $quiz_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
?>
