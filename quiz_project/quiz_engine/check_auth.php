<?php
// Suppress all error output to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

require_once 'session_utils.php';
require_once 'config.php';

$session = SessionManager::getInstance();

$isLoggedIn = false;
$username = null;
$userId = null;
$role = null;
$email = null;

if ($session->isLoggedIn()) {
    $userId = $session->getUserId();
    $username = $session->getUsername();
    $role = $session->getRole();

    if ($userId && $username) {
        try {
            $stmt = $conn->prepare("SELECT id, role, email FROM users WHERE id = ? AND username = ?");
            if ($stmt) {
                $stmt->bind_param("is", $userId, $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows === 1) {
                    $row = $result->fetch_assoc();
                    $isLoggedIn = true;
                    $role = $row['role'] ?? 'personal';
                    $email = $row['email'] ?? null;
                } else {
                    // User not found in database, invalidate session
                    $session->logout();
                    $isLoggedIn = false;
                    $username = null;
                    $userId = null;
                    $role = null;
                    $email = null;
                }
                $stmt->close();
            } else {
                // Database error, log out for security
                error_log('check_auth.php: Failed to prepare statement');
                $session->logout();
            }
        } catch (Exception $e) {
            // Database error, log and return logged out state
            error_log('check_auth.php: Database error - ' . $e->getMessage());
            $session->logout();
            $isLoggedIn = false;
            $username = null;
            $userId = null;
            $role = null;
            $email = null;
        }
    }
}

echo json_encode([
    'status' => 'success',
    'loggedIn' => $isLoggedIn,
    'username' => $isLoggedIn ? $username : null,
    'userId' => $isLoggedIn ? $userId : null,
    'role' => $isLoggedIn ? $role : null,
    'email' => $isLoggedIn ? $email : null
]);

exit;
?>
