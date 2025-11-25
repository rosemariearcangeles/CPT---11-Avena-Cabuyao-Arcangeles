<?php
header('Content-Type: application/json');

// Load users from JSON file
$usersFile = 'users.json';
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, json_encode([]));
}
$usersJson = file_get_contents($usersFile);
$users = json_decode($usersJson, true);

// Get POST data
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

// Find user by username
$user = null;
foreach ($users as $u) {
    if ($u['username'] === $username) {
        $user = $u;
        break;
    }
}

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

// Verify password (stored as plain text here, for production use hashed passwords)
if ($user['password'] !== $password) {
    echo json_encode(['success' => false, 'message' => 'Invalid password.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Login successful.', 'username' => $username]);
exit;
?>
