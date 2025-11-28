// auth.js - Authentication functionality for all pages

// Determine base path relative to site root based on script src
const authScript = document.currentScript;
const BASE_PATH = (() => {
  if (!authScript) return '';
  const src = authScript.getAttribute('src') || '';
  // Count directory separators to determine how many levels up we need to go
  const pathParts = src.split('/').filter(part => part && part !== '.');
  const depth = pathParts.length - 1; // Subtract 1 for the filename
  return depth > 0 ? '../'.repeat(depth) : '';
})();

// Utility function to get CSRF token
function getCSRFToken() {
  // First try to get from meta tag
  let csrfInput = document.querySelector('meta[name="csrf-token"]');
  let token = csrfInput ? csrfInput.getAttribute('content') : '';
  
  // If not found in meta tag, try to get from session storage
  if (!token) {
    token = sessionStorage.getItem('csrf_token') || '';
    
    // If still not found, generate a new one
    if (!token) {
      token = generateCSRFToken();
      sessionStorage.setItem('csrf_token', token);
      
      // Also update the meta tag if it exists
      if (csrfInput) {
        csrfInput.setAttribute('content', token);
      }
    }
  }
  
  return token;
}

// Generate a random CSRF token
function generateCSRFToken() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Modal functions
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  clearFormErrors(modal);
}

function clearFormErrors(modal) {
  if (!modal) return;
  const errorMessages = modal.querySelectorAll('.error-message');
  errorMessages.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  
  const inputs = modal.querySelectorAll('input');
  inputs.forEach(input => input.classList.remove('error'));
}

// Modal toggles
function openLogin() {
  closeRegisterModal();
  const modal = document.getElementById('loginModal');
  
  // Set CSRF token in the login form
  const csrfInput = document.getElementById('login-csrf');
  if (csrfInput) {
    csrfInput.value = getCSRFToken();
  }
  
  openModal(modal);
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  closeModal(modal);
}

function openRegister() {
  closeLoginModal();
  const modal = document.getElementById('registerModal');
  
  // Set CSRF token in the register form
  const csrfInput = document.getElementById('register-csrf');
  if (csrfInput) {
    csrfInput.value = getCSRFToken();
  }
  
  openModal(modal);
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  closeModal(modal);
}

// Switch between login and register
function switchToRegister() {
  closeLoginModal();
  openRegister();
}

function switchToLogin() {
  closeRegisterModal();
  openLogin();
}

/* ===============================
   TOAST NOTIFICATION
   =============================== */
function showToast(message, success = true) {
  const toast = document.createElement('div');
  toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger reflow
  void toast.offsetWidth;

  toast.classList.add('visible');

  // Remove toast after delay
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ===============================
   LOGIN HANDLER
   =============================== */
async function handleLogin(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  const username = document.getElementById('login-username')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  
  // Basic validation
  if (!username || !password) {
    showToast('Please fill in all fields', false);
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    // Create form data object
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('csrf_token', getCSRFToken());
    
    const response = await fetch(`${BASE_PATH}login.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams(formData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      showToast('Login successful!', true);
      closeLoginModal();
      updateLoginUI();

      // Redirect if needed
      if (data.redirect) {
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1000);
      }
    } else {
      showToast(data.message || 'Login failed. Please try again.', false);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('An error occurred. Please try again.', false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/* ===============================
   REGISTER HANDLER
   =============================== */
async function handleRegister(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  const username = document.getElementById('register-username')?.value.trim();
  const email = document.getElementById('register-email')?.value.trim();
  const password = document.getElementById('register-password')?.value;
  const confirmPassword = document.getElementById('register-confirm-password')?.value;
  
  // Validation
  if (!username || !email || !password || !confirmPassword) {
    showToast('Please fill in all fields', false);
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', false);
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    // Create form data object
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('csrf_token', getCSRFToken());
    
    const response = await fetch(`${BASE_PATH}register.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams(formData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      showToast('Registration successful! Please log in.', true);
      closeRegisterModal();
      openLogin();
    } else {
      showToast(data.message || 'Registration failed. Please try again.', false);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('An error occurred. Please try again.', false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/* ===============================
   UPDATE UI AFTER LOGIN
   =============================== */
function updateLoginUI() {
  // Check if user is logged in by making an AJAX request
  fetch(`${BASE_PATH}check_auth.php`)
    .then(response => response.json())
    .then(data => {
      const loginBtn = document.getElementById('nav-login-btn');
      const registerBtn = document.getElementById('nav-register-btn');
      const usernameDisplay = document.getElementById('nav-username-display');
      const usernameSpan = document.getElementById('nav-username');
      const logoutBtn = document.getElementById('nav-logout-btn');
      const dashboardLink = document.getElementById('nav-profile-dashboard');
      
      if (data.loggedIn && data.username) {
        // User is logged in
        if (usernameDisplay) usernameDisplay.style.display = 'block';
        if (usernameSpan) usernameSpan.textContent = data.username || 'User';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'block';

        // Hide login/register buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
      } else {
        // User is not logged in
        if (usernameDisplay) usernameDisplay.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';

        // Show login/register buttons
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error checking auth status:', error);
    });
}

/* ===============================
   LOGOUT HANDLER
   =============================== */
function handleLogout() {
  fetch(`${BASE_PATH}logout.php`, {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': getCSRFToken()
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      showToast('Logged out successfully', true);
      updateLoginUI();

      // Redirect to home page if not already there
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = `${BASE_PATH}index.html`;
      }
    } else {
      showToast('Logout failed. Please try again.', false);
    }
  })
  .catch(error => {
    console.error('Logout error:', error);
    showToast('An error occurred during logout', false);
  });
}

/* ===============================
   EVENT LISTENERS
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
  // Update UI on page load
  updateLoginUI();
  
  // Close modals when clicking outside
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // Switch between login and register
  const switchToRegisterBtn = document.getElementById('switch-to-register');
  const switchToLoginBtn = document.getElementById('switch-to-login');
  
  if (switchToRegisterBtn) {
    switchToRegisterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      switchToRegister();
    });
  }
  
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      switchToLogin();
    });
  }
  
  // Form submissions
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Login/Register buttons in nav
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navRegisterBtn = document.getElementById('nav-register-btn');
  
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', openLogin);
  }
  
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', openRegister);
  }
});
