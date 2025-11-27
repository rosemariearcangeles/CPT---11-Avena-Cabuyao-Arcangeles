<?php
session_start();
header('Content-Type: application/json');

// Use the database connection from config.php
require_once "config.php";

// Get POST data
$username = trim($_POST['username']);
$password = $_POST['password'];

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$stmt->bind_result($id, $hashed);
$stmt->fetch();

// Verify password
if (!password_verify($password, $hashed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid password']);
    exit;
}

// Success → Set session
$_SESSION['user_id'] = $id;
$_SESSION['username'] = $username;

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'username' => $username
]);
?>
