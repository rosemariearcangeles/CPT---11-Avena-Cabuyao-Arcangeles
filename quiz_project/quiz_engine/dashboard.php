<?php
require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();
if (!$session->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$user_id = $session->getUserId();
$username = $session->getUsername();

// Generate CSRF token for the dashboard
$csrfToken = $session->generateCSRFToken();

// Read the HTML file and replace placeholders
$html = file_get_contents('dashboard.html');
$html = str_replace('<meta csrf-token content=""', '<meta name="csrf-token" content="' . htmlspecialchars($csrfToken) . '"', $html);

// Replace user data placeholders
$userData = [
    'username' => htmlspecialchars($username),
    'userId' => $user_id,
    'csrfToken' => htmlspecialchars($csrfToken)
];

foreach ($userData as $key => $value) {
    $html = str_replace("{{{$key}}}", $value, $html);
}

echo $html;
exit;
?>
