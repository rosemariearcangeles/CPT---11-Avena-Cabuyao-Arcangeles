<?php
require_once "session_utils.php";
$session = SessionManager::getInstance();
$isLoggedIn = $session->isLoggedIn();
$username = $isLoggedIn ? $session->getUsername() : '';
$role = $isLoggedIn ? $session->getRole() : '';
$isEducationMode = $isLoggedIn && ($role === 'student' || $role === 'teacher');
?>

<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <div class="logo">
      <h1 class="logo-text">Online Quiz Engine</h1>
    </div>

    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <ul class="nav-links">
      <li><a href="index.php" class="nav-link">Home</a></li>
      <li><a href="About/about.html" class="nav-link">About</a></li>
      <li><a href="Service/service.html" class="nav-link">Service</a></li>
      <li><a href="Contact/contact.html" class="nav-link">Contact Us</a></li>
      <li><a href="FAQ/FAQ.html" class="nav-link">FAQ</a></li>

      <?php if ($isLoggedIn): ?>
        <li id="nav-profile-dashboard">
          <a href="<?php echo $isEducationMode ? 'education_dashboard.html' : 'dashboard.php'; ?>" class="nav-link">
            Dashboard
            <span class="mode-badge" style="display: none;"></span>
          </a>
        </li>
        <li id="nav-user-menu" class="user-menu">
          <div class="user-greeting">
            <span class="greeting-text">Hello, <?php echo htmlspecialchars($username); ?>!</span>
            <button id="nav-logout-btn" class="logout-btn" aria-label="Logout">Logout</button>
          </div>
        </li>
      <?php else: ?>
        <li class="auth-buttons">
          <button type="button" class="login-btn" id="nav-login-btn">Login</button>
          <button type="button" class="register-btn" id="nav-register-btn">Register</button>
        </li>
      <?php endif; ?>
    </ul>
  </div>
</nav>
