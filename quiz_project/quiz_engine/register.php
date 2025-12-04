<?php
header('Content-Type: application/json');

require_once "session_utils.php";
require_once "config.php";

$session = SessionManager::getInstance();

// Initialize CSRF token if not set
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Validate CSRF token
$session->requireCSRFToken();

if (!$conn) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed.'
    ]);
    exit;
}

// GET POST DATA SAFELY
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$email    = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirmPassword'] ?? '';
$role     = isset($_POST['role']) && in_array($_POST['role'], ['personal', 'student', 'teacher']) ? $_POST['role'] : 'personal';

// VALIDATION
if ($username === '' || $email === '' || $password === '' || $confirm === '') {
    echo json_encode([
        'status' => 'error',
        'message' => 'All fields are required.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email format.'
    ]);
    exit;
}

if ($password !== $confirm) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Passwords do not match.'
    ]);
    exit;
}

// CHECK IF USERNAME/EMAIL EXISTS
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
if (!$stmt) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database prepare failed for check.'
    ]);
    exit;
}
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();
    echo json_encode([
        'status' => 'error',
        'message' => 'Username or email already exists.'
    ]);
    exit;
}
$stmt->close();

// HASH PASSWORD
$hashed = password_hash($password, PASSWORD_DEFAULT);
if (!$hashed) {
    error_log("Password hash failed for user: $username");
    echo json_encode([
        'status' => 'error',
        'message' => 'Password hashing failed.'
    ]);
    exit;
}

// INSERT USER
$stmt = $conn->prepare("INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())");
if (!$stmt) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database prepare failed for insert.'
    ]);
    exit;
}
$stmt->bind_param("ssss", $username, $email, $hashed, $role);

if (!$stmt->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database insert failed: ' . $stmt->error
    ]);
    exit;
}

// SUCCESS RESPONSE with redirect URL
echo json_encode([
    'status' => 'success',
    'message' => 'Registration successful!',
    'username' => $username,
    'redirect' => 'login.php?registered=1'
]);
exit;
?>
