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
$quiz_name = $data['quiz_name'] ?? 'Quiz ' . date('M d, Y');
$quiz_data = json_encode($data['quiz_data'] ?? []);
$total_questions = intval($data['total_questions'] ?? 0);

$sql = "INSERT INTO quizzes (user_id, quiz_name, quiz_data, total_questions, status) VALUES (?, ?, ?, ?, 'in_progress')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issi", $user_id, $quiz_name, $quiz_data, $total_questions);

if ($stmt->execute()) {
    $quiz_id = $stmt->insert_id;
    $stmt->close();
    echo json_encode(['success' => true, 'quiz_id' => $quiz_id]);
} else {
    $error = $stmt->error;
    $stmt->close();
    echo json_encode(['success' => false, 'message' => $error]);
}
?>
