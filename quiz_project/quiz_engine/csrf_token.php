<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

require_once "session_utils.php";

$session = SessionManager::getInstance();
$token = $session->generateCSRFToken();

echo json_encode([
    'token' => $token
]);
?>
