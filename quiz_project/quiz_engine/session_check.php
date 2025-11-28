<?php
header('Content-Type: application/json');

require_once "session_utils.php";

$session = SessionManager::getInstance();

echo json_encode([
    'loggedIn' => $session->isLoggedIn(),
    'userId' => $session->isLoggedIn() ? $session->getUserId() : null,
    'username' => $session->isLoggedIn() ? $session->getUsername() : null
]);
?>
