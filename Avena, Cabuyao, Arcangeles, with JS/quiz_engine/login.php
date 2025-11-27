<?php
session_start();
header('Content-Type: application/json');

// Load database configuration from environment variables
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: 3306;
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$dbname = getenv('DB_NAME') ?: 'quiz_engine';

// Connect to MySQL
$conn = new mysqli($host, $user, $pass, $dbname, $port);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$username = trim($_POST['username']);
$password = $_POST['password'];

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

if (!password_verify($password, $hashed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid password']);
    exit;
}

// Success → Set session variables
$_SESSION['user_id'] = $id;
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'message' => 'Login successful', 'username' => $username]);
?>
