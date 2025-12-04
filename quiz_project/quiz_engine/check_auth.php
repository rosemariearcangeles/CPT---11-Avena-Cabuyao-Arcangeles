<?php
// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

require_once 'session_utils.php';
require_once 'config.php';

$session = SessionManager::getInstance();

// Check if user is logged in and the session is still valid
$isLoggedIn = false;
$username = null;
$userId = null;
$role = null;

if ($session->isLoggedIn()) {
    // Verify the user still exists in the database
    $userId = $session->getUserId();
    $username = $session->getUsername();

    if ($userId && $username) {
        $stmt = $conn->prepare("SELECT id, role FROM users WHERE id = ? AND username = ?");
        if ($stmt) {
            $stmt->bind_param("is", $userId, $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                $row = $result->fetch_assoc();
                $isLoggedIn = true;
                $role = $row['role'];
            } else {
                $session->logout();
            }
            $stmt->close();
        }
    }
}

// Return the authentication status
echo json_encode([
    'status' => 'success',
    'loggedIn' => $isLoggedIn,
    'username' => $isLoggedIn ? $username : null,
    'userId' => $isLoggedIn ? $userId : null,
    'role' => $isLoggedIn ? $role : null
]);

exit;
?>
