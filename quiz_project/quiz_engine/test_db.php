<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

$response = ['tests' => []];

// Test 1: Check if user is logged in
$response['tests']['session'] = [
    'logged_in' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? null,
    'username' => $_SESSION['username'] ?? null
];

// Test 2: Check if quizzes table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'quizzes'");
$response['tests']['table_exists'] = $tableCheck->num_rows > 0;

// Test 3: If table exists, count quizzes
if ($response['tests']['table_exists']) {
    $countResult = $conn->query("SELECT COUNT(*) as total FROM quizzes");
    $countRow = $countResult->fetch_assoc();
    $response['tests']['total_quizzes_in_db'] = $countRow['total'];
    
    // Test 4: Count user's quizzes
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM quizzes WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $response['tests']['user_quizzes'] = $row['total'];
        
        // Test 5: Get sample quiz
        $stmt = $conn->prepare("SELECT * FROM quizzes WHERE user_id = ? LIMIT 1");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $response['tests']['sample_quiz'] = $result->fetch_assoc();
    }
} else {
    $response['tests']['error'] = 'Quizzes table does not exist. Run database_setup.sql';
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
