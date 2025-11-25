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
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

if (!$username || !$email || !$password || !$confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

// Check if username or email already exists
foreach ($users as $u) {
    if ($u['username'] === $username) {
        echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        exit;
    }
    if ($u['email'] === $email) {
        echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
        exit;
    }
}

// Add new user
$newUser = [
    'username' => $username,
    'email' => $email,
    'password' => $password, // Note: in production, use password hashing!
];

$users[] = $newUser;

// Save updated users
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'message' => 'Registration successful.', 'username' => $username]);
exit;
?>
