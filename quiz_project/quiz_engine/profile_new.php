<?php
require_once "middleware.php";

// Require login
AuthMiddleware::requireLogin();

require_once "config.php";

$user_id = AuthMiddleware::getUserId();
$username = AuthMiddleware::getUsername();

// Fetch user data
$stmt = $conn->prepare("SELECT username, email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($username, $email, $created_at);
$stmt->fetch();
$stmt->close();

// Handle profile update
$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    AuthMiddleware::requireCSRFToken();
    
    $new_username = trim($_POST['username'] ?? '');
    $new_email = trim($_POST['email'] ?? '');

    if (empty($new_username) || empty($new_email)) {
        $message = 'All fields are required.';
        $message_type = 'error';
    } elseif (!filter_var($new_email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Invalid email format.';
        $message_type = 'error';
    } else {
        // Check if username or email already exists (excluding current user)
        $stmt = $conn->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
        $stmt->bind_param("ssi", $new_username, $new_email, $user_id);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $message = 'Username or email already exists.';
            $message_type = 'error';
        } else {
            // Update user
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
            $stmt->bind_param("ssi", $new_username, $new_email, $user_id);
            if ($stmt->execute()) {
                $message = 'Profile updated successfully!';
                $message_type = 'success';
                $_SESSION['username'] = $new_username;
                $username = $new_username;
                $email = $new_email;
                AuthMiddleware::logAction('profile_update', "Updated username and email");
            } else {
                $message = 'Update failed. Please try again.';
                $message_type = 'error';
            }
        }
        $stmt->close();
    }
}

$csrf_token = AuthMiddleware::getCSRFToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= htmlspecialchars($csrf_token) ?>">
    <title>My Profile - Online Quiz Engine</title>
    <link rel="stylesheet" href="css/profile.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<?php include "navbar.php"; ?>

<div class="profile-container">
    <div class="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
    </div>

    <?php if ($message): ?>
        <div class="alert alert-<?= htmlspecialchars($message_type) ?>">
            <span class="alert-icon"><?= $message_type === 'success' ? '✓' : '!' ?></span>
            <?= htmlspecialchars($message) ?>
        </div>
    <?php endif; ?>

    <div class="profile-content">
        <!-- Profile Info Card -->
        <div class="profile-card" id="profileCard">
            <div class="card-header">
                <h2>Account Information</h2>
                <button id="editBtn" class="btn btn-secondary btn-sm">Edit Profile</button>
            </div>

            <div class="profile-info">
                <div class="info-item">
                    <label>Username</label>
                    <p><?= htmlspecialchars($username) ?></p>
                </div>

                <div class="info-item">
                    <label>Email</label>
                    <p><?= htmlspecialchars($email) ?></p>
                </div>

                <div class="info-item">
                    <label>Member Since</label>
                    <p><?= date('F d, Y', strtotime($created_at)) ?></p>
                </div>
            </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="edit-card" id="editCard" style="display: none;">
            <div class="card-header">
                <h2>Edit Profile</h2>
            </div>

            <form method="POST" action="" class="profile-form">
                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">

                <div class="form-group">
                    <label for="edit-username">Username</label>
                    <input 
                        type="text" 
                        id="edit-username" 
                        name="username" 
                        value="<?= htmlspecialchars($username) ?>" 
                        required
                        minlength="3"
                        maxlength="50"
                    >
                    <small>3-50 characters</small>
                </div>

                <div class="form-group">
                    <label for="edit-email">Email</label>
                    <input 
                        type="email" 
                        id="edit-email" 
                        name="email" 
                        value="<?= htmlspecialchars($email) ?>" 
                        required
                    >
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" id="cancelBtn" class="btn btn-secondary">Cancel</button>
                </div>
            </form>
        </div>

        <!-- Account Actions -->
        <div class="actions-card">
            <h2>Account Actions</h2>
            
            <div class="action-item">
                <div class="action-info">
                    <h3>Change Password</h3>
                    <p>Update your password to keep your account secure</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="alert('Password change feature coming soon!')">Change</button>
            </div>

            <div class="action-item">
                <div class="action-info">
                    <h3>Go to Dashboard</h3>
                    <p>View your quiz history and statistics</p>
                </div>
                <a href="dashboard.php" class="btn btn-primary btn-sm">Dashboard</a>
            </div>

            <div class="action-item danger">
                <div class="action-info">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all associated data</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="if(confirm('Are you sure? This action cannot be undone.')) { alert('Account deletion coming soon!'); }">Delete</button>
            </div>
        </div>
    </div>
</div>

<script src="js/auth.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editCard = document.getElementById('editCard');
    const profileCard = document.getElementById('profileCard');

    editBtn.addEventListener('click', () => {
        profileCard.style.display = 'none';
        editCard.style.display = 'block';
        document.getElementById('edit-username').focus();
    });

    cancelBtn.addEventListener('click', () => {
        editCard.style.display = 'none';
        profileCard.style.display = 'block';
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});
</script>

</body>
</html>
