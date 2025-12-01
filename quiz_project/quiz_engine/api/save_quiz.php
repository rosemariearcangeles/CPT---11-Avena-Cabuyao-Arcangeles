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
$quiz_name = $data['quiz_name'] ?? 'Quiz ' . date('M d, Y');
$quiz_data = json_encode($data['quiz_data'] ?? []);
$total_questions = $data['total_questions'] ?? 0;
$score = $data['score'] ?? null;
$status = $data['status'] ?? 'in_progress';

$sql = "INSERT INTO quizzes (user_id, quiz_name, quiz_data, total_questions, score, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssis", $user_id, $quiz_name, $quiz_data, $total_questions, $score, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'quiz_id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save quiz']);
}
?>
