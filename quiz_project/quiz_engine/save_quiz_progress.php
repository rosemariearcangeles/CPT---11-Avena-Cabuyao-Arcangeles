<?php
header('Content-Type: application/json');

require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();

// Only allow logged-in users to save progress
if (!$session->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit;
}

// Validate CSRF token for JSON requests
$csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_GET['csrf_token'] ?? null;
if (!$csrfToken || !$session->validateCSRFToken($csrfToken)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
    exit;
}

$user_id = $session->getUserId();

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['quizId']) || !isset($input['answers'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request data']);
    exit;
}

$quiz_id = trim($input['quizId']);
$answers = $input['answers'];
$current_index = isset($input['currentIndex']) ? (int)$input['currentIndex'] : 0;
$start_time = isset($input['startTime']) ? (int)$input['startTime'] : time() * 1000;
$last_saved = isset($input['lastSaved']) ? (int)$input['lastSaved'] : time() * 1000;

// Validate quiz_id format
if (!preg_match('/^quiz_\d+_[a-zA-Z0-9]+$/', $quiz_id)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid quiz ID format']);
    exit;
}

// Convert answers array to JSON for storage
$answers_json = json_encode($answers);

try {
    // Check if progress already exists for this quiz
    $stmt = $conn->prepare("SELECT id FROM quiz_progress WHERE user_id = ? AND quiz_id = ?");
    $stmt->bind_param("is", $user_id, $quiz_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Update existing progress
        $stmt = $conn->prepare("UPDATE quiz_progress SET answers = ?, current_index = ?, start_time = ?, last_saved = ? WHERE user_id = ? AND quiz_id = ?");
        $stmt->bind_param("siiiss", $answers_json, $current_index, $start_time, $last_saved, $user_id, $quiz_id);
    } else {
        // Insert new progress
        $stmt = $conn->prepare("INSERT INTO quiz_progress (user_id, quiz_id, answers, current_index, start_time, last_saved) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issiii", $user_id, $quiz_id, $answers_json, $current_index, $start_time, $last_saved);
    }

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Progress saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save progress']);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Error saving quiz progress: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
}
?>
