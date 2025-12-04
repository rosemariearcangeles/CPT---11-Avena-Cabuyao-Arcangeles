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
$class_id = $_GET['class_id'] ?? null;

if (!$class_id) {
    echo json_encode(['success' => false, 'message' => 'Class ID required']);
    exit;
}

$stmt = $conn->prepare("
    SELECT s.*, a.title, q.quiz_name, q.total_questions, a.due_date
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE s.student_id = ? AND a.class_id = ?
    ORDER BY s.submitted_at DESC
");
$stmt->bind_param("ii", $user_id, $class_id);
$stmt->execute();
$result = $stmt->get_result();

$grades = [];
while ($row = $result->fetch_assoc()) {
    $grades[] = $row;
}

echo json_encode(['success' => true, 'grades' => $grades]);
$stmt->close();
