<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "quiz_engine");

if ($conn->connect_error) {
    echo json_encode(['success'=>false,'message'=>'Database connection failed']);
    exit;
}

$username = trim($_POST['username']);
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success'=>false,'message'=>'User not found']);
    exit;
}

$stmt->bind_result($id, $hashed);
$stmt->fetch();

if (!password_verify($password, $hashed)) {
    echo json_encode(['success'=>false,'message'=>'Invalid password']);
    exit;
}

echo json_encode(['success'=>true,'message'=>'Login successful', 'username'=>$username]);
?>
