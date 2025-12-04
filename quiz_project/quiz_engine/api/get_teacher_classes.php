<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

require_once '../db_connection.php';

$user_id = $_SESSION['user_id'];

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
