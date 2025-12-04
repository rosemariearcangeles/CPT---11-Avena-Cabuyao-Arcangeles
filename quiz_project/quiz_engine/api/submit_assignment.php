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
$input = json_decode(file_get_contents('php://input'), true);

$assignment_id = $input['assignment_id'] ?? null;
$answers = $input['answers'] ?? [];
$score = $input['score'] ?? 0;

if (!$assignment_id) {
    echo json_encode(['success' => false, 'message' => 'Assignment ID required']);
    exit;
}

$answers_json = json_encode($answers);

$stmt = $conn->prepare("INSERT INTO submissions (assignment_id, student_id, score, answers) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = ?, answers = ?");
$stmt->bind_param("iiisis", $assignment_id, $user_id, $score, $answers_json, $score, $answers_json);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
