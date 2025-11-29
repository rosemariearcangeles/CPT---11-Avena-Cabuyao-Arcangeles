<!-- LOGIN MODAL -->
<div id="loginModal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="login-title">
  <div class="modal-content">
    <button class="close close-login" aria-label="Close login modal">&times;</button>
    <div class="modal-header">
      <div class="modal-icon">🔑</div>
      <h2 id="login-title">Welcome Back</h2>
      <p class="modal-subtitle">Sign in to continue to your account</p>
    </div>

    <form id="loginForm" class="auth-form" onsubmit="handleLogin(event)" novalidate>
      <input type="hidden" id="login-csrf" name="csrf_token">

      <div class="form-group">
        <label for="login-username">Username</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input type="text" id="login-username" name="username" required placeholder="Enter your username" aria-describedby="login-username-error">
        </div>
        <div id="login-username-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-group">
        <label for="login-password">Password</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="login-password" name="password" required placeholder="Enter your password" aria-describedby="login-password-error">
        </div>
        <div id="login-password-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary btn-block" type="submit" id="login-submit-btn">
          <span class="btn-text">Sign In</span>
          <div class="btn-spinner" style="display: none;"></div>
        </button>
      </div>

      <div class="auth-footer">
        <p>Don't have an account? <a href="#" id="switch-to-register" class="auth-link">Sign up</a></p>
      </div>
    </form>
  </div>
</div>

<!-- REGISTER MODAL -->
<div id="registerModal" class="modal" aria-hidden="true" role="dialog" aria-labelledby="register-title">
  <div class="modal-content">
    <button class="close close-register" aria-label="Close register modal">&times;</button>
    <div class="modal-header">
      <div class="modal-icon">📝</div>
      <h2 id="register-title">Create Account</h2>
      <p class="modal-subtitle">Join our quiz community</p>
    </div>

    <form id="registerForm" class="auth-form" onsubmit="handleRegister(event)" novalidate>
      <input type="hidden" id="register-csrf" name="csrf_token">

      <div class="form-group">
        <label for="register-username">Username</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <input type="text" id="register-username" name="username" required placeholder="Choose a username" aria-describedby="register-username-error">
        </div>
        <div id="register-username-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-group">
        <label for="register-email">Email</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input type="email" id="register-email" name="email" required placeholder="your@email.com" aria-describedby="register-email-error">
        </div>
        <div id="register-email-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-group">
        <label for="register-password">Password</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="register-password" name="password" required placeholder="Create a password" aria-describedby="register-password-error">
        </div>
        <div id="register-password-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-group">
        <label for="register-confirm-password">Confirm Password</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="register-confirm-password" name="confirmPassword" required placeholder="Confirm your password" aria-describedby="register-confirm-error">
        </div>
        <div id="register-confirm-error" class="error-message" role="alert"></div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary btn-block" type="submit" id="register-submit-btn">
          <span class="btn-text">Create Account</span>
          <div class="btn-spinner" style="display: none;"></div>
        </button>
      </div>

      <div class="auth-footer">
        <p>Already have an account? <a href="#" id="switch-to-login" class="auth-link">Sign in</a></p>
      </div>
    </form>
  </div>
</div>
