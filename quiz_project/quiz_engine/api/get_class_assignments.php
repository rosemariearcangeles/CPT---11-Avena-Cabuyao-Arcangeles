<?php
require_once '../session_utils.php';
require_once '../config.php';

header('Content-Type: application/json');

$session = SessionManager::getInstance();

if (!$session->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$class_id = $_GET['class_id'] ?? null;

if (!$class_id) {
    echo json_encode(['success' => false, 'message' => 'Class ID required']);
    exit;
}

$user_id = $session->getUserId();
$stmt = $conn->prepare("\n    SELECT a.*, q.quiz_name, q.total_questions, q.quiz_data, s.id AS submission_id, s.score AS submission_score, s.submitted_at\n    FROM assignments a\n    JOIN quizzes q ON a.quiz_id = q.id\n    LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?\n    WHERE a.class_id = ?\n    ORDER BY a.created_at DESC\n");
$stmt->bind_param("ii", $user_id, $class_id);
$stmt->execute();
$result = $stmt->get_result();

$assignments = [];
while ($row = $result->fetch_assoc()) {
    $row['submitted'] = isset($row['submission_id']) && $row['submission_id'] ? true : false;
    $assignments[] = $row;
}

echo json_encode(['success' => true, 'assignments' => $assignments]);
$stmt->close();
