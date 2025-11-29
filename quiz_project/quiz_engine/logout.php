<?php
require_once "session_utils.php";

$session = SessionManager::getInstance();

// Validate CSRF token for logout
$session->requireCSRFToken();

// Use centralized logout method
$session->logout();

// Regenerate session ID after logout for security
session_start();
session_regenerate_id(true);

header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'Logged out successfully'
]);
?>
