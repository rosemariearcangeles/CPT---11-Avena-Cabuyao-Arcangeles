<?php
// Suppress all error output to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);

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
$class_code = strtoupper($input['class_code'] ?? '');

if (empty($class_code)) {
    echo json_encode(['success' => false, 'message' => 'Class code required']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM classes WHERE class_code = ?");
$stmt->bind_param("s", $class_code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid class code']);
    $stmt->close();
    exit;
}

$class = $result->fetch_assoc();
$class_id = $class['id'];
$stmt->close();

// education_mode.sql defines class_members.student_id, not user_id
$stmt = $conn->prepare("INSERT INTO class_members (class_id, student_id) VALUES (?, ?)");

if ($stmt) {
    $stmt->bind_param("ii", $class_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        if ($stmt->errno === 1062) {
            echo json_encode(['success' => false, 'message' => 'Already joined this class']);
        } else {
            echo json_encode(['success' => false, 'message' => $stmt->error]);
        }
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare join_class statement.']);
}
?>
