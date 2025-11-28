<?php
header('Content-Type: application/json');

require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();

// Validate CSRF token
$session->requireCSRFToken();

// Validate POST fields
if (!isset($_POST['username']) || !isset($_POST['password'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields.'
    ]);
    exit;
}

$username = trim($_POST['username']);
$password = $_POST['password'];

if ($username === "" || $password === "") {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required.'
    ]);
    exit;
}

// Prepare SQL
$stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not found.'
    ]);
    exit;
}

$stmt->bind_result($user_id, $hashed);
$stmt->fetch();

// Password verify
if (!password_verify($password, $hashed)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid password.'
    ]);
    exit;
}

// Successful login → set session
$session->login($user_id, $username);

echo json_encode([
    'status' => 'success',
    'message' => 'Login successful',
    'username' => $username
]);
exit;
?>
