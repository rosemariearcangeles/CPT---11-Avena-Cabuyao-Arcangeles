<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "config.php";

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
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Username or email already exists.'
    ]);
    exit;
}

// HASH PASSWORD
$hashed = password_hash($password, PASSWORD_DEFAULT);

// INSERT USER
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashed);

if (!$stmt->execute()) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database insert failed: ' . $stmt->error
    ]);
    exit;
}

// AUTO-LOGIN AFTER REGISTER
$user_id = $conn->insert_id;
$_SESSION['user_id'] = $user_id;
$_SESSION['username'] = $username;

// SUCCESS RESPONSE
echo json_encode([
    'status' => 'success',
    'message' => 'Registration successful.',
    'username' => $username
]);
exit;
?>
