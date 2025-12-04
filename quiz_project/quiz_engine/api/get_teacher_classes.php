<?php
// Suppress all error output to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);

require_once '../session_utils.php';
require_once '../config.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$session = SessionManager::getInstance();

if (!$session->isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $session->getUserId();

$stmt = $conn->prepare("
    SELECT 
        c.id,
        c.class_name,
        c.description,
        c.class_code,
        c.created_at,
        COUNT(DISTINCT cm.user_id) as student_count
    FROM classes c
    LEFT JOIN class_members cm ON c.id = cm.class_id
    WHERE c.teacher_id = ?
    GROUP BY c.id
    ORDER BY c.created_at DESC
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$classes = [];
while ($row = $result->fetch_assoc()) {
    $classes[] = $row;
}

echo json_encode([
    'success' => true,
    'classes' => $classes
]);
