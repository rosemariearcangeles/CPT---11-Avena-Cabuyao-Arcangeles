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

$stmt = $conn->prepare("
    SELECT c.*, u.username as teacher_name 
    FROM classes c 
    JOIN class_members cm ON c.id = cm.class_id 
    JOIN users u ON c.teacher_id = u.id 
    WHERE cm.student_id = ? 
    ORDER BY cm.joined_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$classes = [];
while ($row = $result->fetch_assoc()) {
    $classes[] = $row;
}

echo json_encode(['success' => true, 'classes' => $classes]);
$stmt->close();
?>
