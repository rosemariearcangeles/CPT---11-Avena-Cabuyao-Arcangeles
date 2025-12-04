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

$stmt = $conn->prepare("
    SELECT a.*, q.quiz_name, q.total_questions, q.quiz_data
    FROM assignments a
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE a.class_id = ?
    ORDER BY a.created_at DESC
");
$stmt->bind_param("i", $class_id);
$stmt->execute();
$result = $stmt->get_result();

$assignments = [];
while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

echo json_encode(['success' => true, 'assignments' => $assignments]);
$stmt->close();
