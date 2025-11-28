<?php
require_once "session_utils.php";

$session = SessionManager::getInstance();
$csrfToken = $session->generateCSRFToken();

// Read the HTML file and replace the CSRF token placeholder
$html = file_get_contents('index.html');
$html = str_replace('content=""', 'content="' . htmlspecialchars($csrfToken) . '"', $html);

echo $html;
?>
