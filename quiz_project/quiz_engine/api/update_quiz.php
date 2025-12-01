<?php
session_start();
header('Content-Type: application/json');

require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$user_id = $_SESSION['user_id'];
$quiz_id = $data['quiz_id'] ?? null;
$score = $data['score'] ?? null;
$status = $data['status'] ?? 'in_progress';

if (!$quiz_id) {
    echo json_encode(['success' => false, 'message' => 'Quiz ID required']);
    exit;
}

$sql = "UPDATE quizzes SET score = ?, status = ?, updated_at = NOW() 
        WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isii", $score, $status, $quiz_id, $user_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update quiz']);
}
?>
