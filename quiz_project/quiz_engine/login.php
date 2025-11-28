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
$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid username or password.'
    ]);
    exit;
}

$stmt->bind_result($user_id, $db_username, $hashed);
$stmt->fetch();

// Password verify
if (!password_verify($password, $hashed)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid username or password.'
    ]);
    exit;
}

// Successful login → set session
$session->login($user_id, $db_username);

// Prepare response
$response = [
    'status' => 'success',
    'message' => 'Login successful',
    'username' => $db_username
];

// Add redirect URL if needed
if (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'login') === false) {
    $response['redirect'] = $_SERVER['HTTP_REFERER'];
} else {
    $response['redirect'] = 'dashboard.html';
}

echo json_encode($response);
exit;
?>