<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="nav-container">
    <div class="logo">
      <h1>Online Quiz Engine</h1>
    </div>

    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <ul class="nav-links">
      <li><a href="index.html" class="nav-link">Home</a></li>
      <li><a href="About/about.html" class="nav-link">About</a></li>
      <li><a href="Service/service.html" class="nav-link">Service</a></li>
      <li><a href="Contact/contact.html" class="nav-link">Contact Us</a></li>
      <li><a href="FAQ/FAQ.html" class="nav-link">FAQ</a></li>
      <li id="nav-profile-dashboard" style="display:none;">
        <a href="dashboard.html" class="nav-link">Dashboard</a>
      </li>

      <!-- Auth buttons for unauthenticated users -->
      <li class="auth-buttons">
        <button type="button" class="login-btn" id="nav-login-btn">Login</button>
        <button type="button" class="register-btn" id="nav-register-btn">Register</button>
      </li>

      <!-- User menu for authenticated users -->
      <li id="nav-user-menu" class="user-menu" style="display:none;">
        <div class="user-greeting">
          <span class="greeting-text">Hello, <span id="nav-username"></span>!</span>
          <button id="nav-logout-btn" class="logout-btn" aria-label="Logout">Logout</button>
        </div>
      </li>
    </ul>
  </div>
</nav>
