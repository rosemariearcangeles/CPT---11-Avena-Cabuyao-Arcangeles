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
$quiz_data = json_encode($data['quiz_data'] ?? []);
$quiz_hash = md5($quiz_data);

$sql = "SELECT id, quiz_name, score, total_questions, created_at 
        FROM quizzes 
        WHERE user_id = ? AND MD5(quiz_data) = ? 
        ORDER BY created_at DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $user_id, $quiz_hash);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        'success' => true, 
        'duplicate' => true,
        'quiz' => $row
    ]);
} else {
    echo json_encode(['success' => true, 'duplicate' => false]);
}
?>
