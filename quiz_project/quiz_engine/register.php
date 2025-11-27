<?php
session_start();
header('Content-Type: application/json');

// Use DB connection from config.php
require_once "config.php";

$username = trim($_POST['username']);
$email = trim($_POST['email']);
$password = $_POST['password'];
$confirm = $_POST['confirmPassword'];

if (!$username || !$email || !$password || !$confirm) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email.']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

// Check if username or email already exist
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit;
}

// Insert new user
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashed);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Database insert failed: ' . $stmt->error]);
    exit;
}

$user_id = $conn->insert_id;

// Auto-login after registration
$_SESSION['user_id'] = $user_id;
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'message' => 'Registration successful', 'username' => $username]);
?>
