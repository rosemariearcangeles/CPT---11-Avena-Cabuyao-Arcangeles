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

$input = json_decode(file_get_contents('php://input'), true);
$class_name = $input['class_name'] ?? '';
$description = $input['description'] ?? '';

if (empty($class_name)) {
    echo json_encode(['success' => false, 'message' => 'Class name required']);
    exit;
}

$class_code = strtoupper(substr(md5(uniqid()), 0, 6));

$stmt = $conn->prepare("INSERT INTO classes (teacher_id, class_name, class_code, description) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $user_id, $class_name, $class_code, $description);

if ($stmt->execute()) {
    $class_id = $conn->insert_id;
    echo json_encode(['success' => true, 'class_code' => $class_code, 'class_id' => $class_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
?>
