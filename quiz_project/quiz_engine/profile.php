<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

require_once "config.php";

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email, $created_at);
$stmt->fetch();
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Profile</title>
    <link rel="stylesheet" href="css/profile.css">
</head>
<body>

<?php include "navbar.php"; ?> 

<div class="profile-container">
    <h1>My Profile</h1>

    <div class="profile-card">
        <p><strong>Username:</strong> <?= htmlspecialchars($username) ?></p>
        <p><strong>Email:</strong> <?= htmlspecialchars($email) ?></p>
        <p><strong>Member Since:</strong> <?= htmlspecialchars($created_at) ?></p>

        <button id="logoutBtn" class="logout-btn">Log Out</button>
    </div>
</div>

<script src="script.js"></script>
</body>
</html>
