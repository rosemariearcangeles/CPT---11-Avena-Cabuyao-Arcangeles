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

$user_id = $session->getUserId();
$input = json_decode(file_get_contents('php://input'), true);

$assignment_id = $input['assignment_id'] ?? null;
$score = $input['score'] ?? 0;

if (!$assignment_id) {
    echo json_encode(['success' => false, 'message' => 'Assignment ID required']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO submissions (assignment_id, student_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?, submitted_at = CURRENT_TIMESTAMP");
$stmt->bind_param("iiii", $assignment_id, $user_id, $score, $score);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
