<?php
require_once "session_utils.php";

$session = SessionManager::getInstance();
if (!$session->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

require_once "config.php";

$user_id = $session->getUserId();
$stmt = $conn->prepare("SELECT username, email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email, $created_at);
$stmt->fetch();
$stmt->close();

// Handle profile update
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    $session->requireCSRFToken();

    $new_username = trim($_POST['username']);
    $new_email = trim($_POST['email']);

    if (empty($new_username) || empty($new_email)) {
        $message = 'All fields are required.';
    } elseif (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Invalid email format.';
    } else {
        // Check if username or email already exists (excluding current user)
        $stmt = $conn->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
        $stmt->bind_param("ssi", $new_username, $new_email, $user_id);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $message = 'Username or email already exists.';
        } else {
            // Update user
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
            $stmt->bind_param("ssi", $new_username, $new_email, $user_id);
            if ($stmt->execute()) {
                $message = 'Profile updated successfully!';
                $session->login($user_id, $new_username); // Update session with new username
                $username = $new_username;
                $email = $new_email;
            } else {
                $message = 'Update failed.';
            }
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="<?php echo htmlspecialchars($session->generateCSRFToken()); ?>">
    <title>My Profile</title>
    <link rel="stylesheet" href="css/profile.css">
</head>
<body>

<?php include "navbar.php"; ?> 

<div class="profile-container">
    <h1>My Profile</h1>

    <?php if ($message): ?>
        <div class="message <?= strpos($message, 'success') !== false ? 'success' : 'error' ?>">
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <div class="profile-card">
        <div class="profile-info">
            <p><strong>Username:</strong> <?= htmlspecialchars($username) ?></p>
            <p><strong>Email:</strong> <?= htmlspecialchars($email) ?></p>
            <p><strong>Member Since:</strong> <?= htmlspecialchars($created_at) ?></p>
        </div>

        <button id="editBtn" class="edit-btn">Edit Profile</button>
        <button id="logoutBtn" class="logout-btn">Log Out</button>
    </div>

    <!-- Edit Profile Form (hidden by default) -->
    <div id="editForm" class="edit-form" style="display: none;">
        <h2>Edit Profile</h2>
        <form method="POST" action="">
            <label for="edit-username">Username:</label>
            <input type="text" id="edit-username" name="username" value="<?= htmlspecialchars($username) ?>" required>

            <label for="edit-email">Email:</label>
            <input type="email" id="edit-email" name="email" value="<?= htmlspecialchars($email) ?>" required>

            <div class="form-actions">
                <button type="submit" class="save-btn">Save Changes</button>
                <button type="button" id="cancelBtn" class="cancel-btn">Cancel</button>
            </div>
        </form>
    </div>
</div>

<script src="script.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');
    const profileCard = document.querySelector('.profile-card');

    editBtn.addEventListener('click', () => {
        editForm.style.display = 'block';
        profileCard.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        editForm.style.display = 'none';
        profileCard.style.display = 'block';
    });
});
</script>
</body>
</html>
