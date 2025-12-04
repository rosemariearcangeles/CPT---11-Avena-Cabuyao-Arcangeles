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

$input = json_decode(file_get_contents('php://input'), true);
$class_id = $input['class_id'] ?? null;
$quiz_id = $input['quiz_id'] ?? null;
$title = $input['title'] ?? '';
$due_date = $input['due_date'] ?? null;

if (!$class_id || !$quiz_id) {
    echo json_encode(['success' => false, 'message' => 'Class ID and Quiz ID required']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO assignments (class_id, quiz_id, title, due_date) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $class_id, $quiz_id, $title, $due_date);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'assignment_id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
