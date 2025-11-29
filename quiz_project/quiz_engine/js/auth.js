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

// Utility function to get CSRF token from server
async function getCSRFToken() {
  try {
    const response = await fetch(`${BASE_PATH}csrf_token.php`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    return data.token || '';
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return '';
  }
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
async function openLogin() {
  closeRegisterModal();
  const modal = document.getElementById('loginModal');
  
  // Set CSRF token in the login form
  const csrfInput = document.getElementById('login-csrf');
  if (csrfInput) {
    csrfInput.value = await getCSRFToken();
  }
  
  openModal(modal);
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  closeModal(modal);
}

async function openRegister() {
  closeLoginModal();
  const modal = document.getElementById('registerModal');
  
  // Set CSRF token in the register form
  const csrfInput = document.getElementById('register-csrf');
  if (csrfInput) {
    csrfInput.value = await getCSRFToken();
  }
  
  openModal(modal);
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  closeModal(modal);
}

// Switch between login and register
async function switchToRegister() {
  closeLoginModal();
  await openRegister();
}

async function switchToLogin() {
  closeRegisterModal();
  await openLogin();
}

/* ===============================
   TOAST NOTIFICATION
   =============================== */
let activeToasts = [];
let lastToastMessage = '';
let lastToastTime = 0;
const TOAST_DUPLICATE_THRESHOLD = 1000; // 1 second

function showToast(message, success = true) {
  // Prevent duplicate toasts within threshold
  const now = Date.now();
  if (message === lastToastMessage && (now - lastToastTime) < TOAST_DUPLICATE_THRESHOLD) {
    return;
  }
  lastToastMessage = message;
  lastToastTime = now;

  // Remove existing toasts if more than 3
  if (activeToasts.length >= 3) {
    const oldToast = activeToasts.shift();
    if (oldToast && oldToast.parentNode) oldToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  document.body.appendChild(toast);
  activeToasts.push(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
        activeToasts = activeToasts.filter(t => t !== toast);
      }
    }, 300);
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
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnSpinner = submitBtn?.querySelector('.btn-spinner');
  let originalMinWidth = '';
  
  try {
    // Show loading state without changing layout
    submitBtn.disabled = true;
    originalMinWidth = submitBtn.style.minWidth;
    submitBtn.style.minWidth = submitBtn.offsetWidth + 'px';
    if (btnText) btnText.style.display = 'none';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
    
    // Create form data object
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('csrf_token', await getCSRFToken());
    
    const response = await fetch(`${BASE_PATH}login.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      showToast('Login successful!', true);
      closeLoginModal();
      form.reset();
      
      await updateLoginUI();
      
      if (data.redirect) {
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 500);
      }
    } else {
      showToast(data.message || 'Invalid username or password', false);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('An error occurred. Please try again.', false);
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.style.display = '';
    if (btnSpinner) btnSpinner.style.display = 'none';
    submitBtn.style.minWidth = originalMinWidth || '';
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
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnSpinner = submitBtn?.querySelector('.btn-spinner');
  let originalMinWidth = '';
  
  try {
    // Show loading state without changing layout
    submitBtn.disabled = true;
    originalMinWidth = submitBtn.style.minWidth;
    submitBtn.style.minWidth = submitBtn.offsetWidth + 'px';
    if (btnText) btnText.style.display = 'none';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
    
    // Create form data object
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('csrf_token', await getCSRFToken());
    
    const response = await fetch(`${BASE_PATH}register.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.status === 'success') {
      // Don't show success message here - the backend will redirect with a success message
      form.reset();
      closeRegisterModal();
      // Redirect to login page with success parameter
      window.location.href = `${BASE_PATH}login.php?registered=1`;
    } else {
      // Parse error message from backend
      let errorMessage = 'Registration failed. Please try again.';
      if (data && data.message) {
        if (data.message.includes('already exists')) {
          errorMessage = 'This username or email is already registered.';
        } else if (data.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.';
        } else {
          errorMessage = data.message;
        }
      }
      showToast(errorMessage, false);
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Network error. Please try again.', false);
  } finally {
    submitBtn.disabled = false;
    if (btnText) btnText.style.display = '';
    if (btnSpinner) btnSpinner.style.display = 'none';
    submitBtn.style.minWidth = originalMinWidth || '';
  }
}

/* ===============================
   UPDATE UI AFTER LOGIN
   =============================== */
// Check authentication status interval (1 minute)
const AUTH_CHECK_INTERVAL = 60000;
let authCheckInterval;

// Update UI based on authentication state
async function updateLoginUI() {
  try {
    const response = await fetch(`${BASE_PATH}check_auth.php`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    // Cache the auth state
    sessionStorage.setItem('authState', JSON.stringify(data));
    
    applyAuthState(data);
    return data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { loggedIn: false };
  }
}

function applyAuthState(data) {
  const authButtons = document.querySelector('.auth-buttons');
  const userMenu = document.querySelector('.user-menu');
  const dashboardLink = document.querySelector('.dashboard-link, #nav-dashboard-link');
  const usernameSpan = document.getElementById('nav-username');
  const dropdownUsername = document.getElementById('dropdown-username');

  if (data.loggedIn && data.username) {
    if (authButtons) {
      authButtons.style.display = 'none';
      authButtons.style.opacity = '0';
    }
    if (userMenu) {
      userMenu.style.display = 'block';
      userMenu.style.opacity = '1';
    }
    if (dashboardLink) {
      dashboardLink.style.display = 'block';
      dashboardLink.style.opacity = '1';
    }
    if (usernameSpan) usernameSpan.textContent = data.username;
    if (dropdownUsername) dropdownUsername.textContent = data.username;
    updateAuthenticatedUI(true);
  } else {
    if (userMenu) {
      userMenu.style.display = 'none';
      userMenu.style.opacity = '0';
    }
    if (dashboardLink) {
      dashboardLink.style.display = 'none';
      dashboardLink.style.opacity = '0';
    }
    if (authButtons) {
      authButtons.style.display = 'flex';
      authButtons.style.opacity = '1';
    }
    updateAuthenticatedUI(false);
  }
}

// Update UI elements based on authentication state
function updateAuthenticatedUI(isAuthenticated) {
  // Update any elements with data-auth-only or data-unauth-only attributes
  const authElements = document.querySelectorAll('[data-auth-only]');
  authElements.forEach(el => {
    el.style.display = isAuthenticated ? 'block' : 'none';
  });

  const unauthElements = document.querySelectorAll('[data-unauth-only]');
  unauthElements.forEach(el => {
    el.style.display = isAuthenticated ? 'none' : 'block';
  });
  
  // If user is not authenticated and we're on a protected page, redirect to login
  if (!isAuthenticated && isProtectedPage()) {
    window.location.href = `${BASE_PATH}index.html`;
  }
}

// Check if current page requires authentication
function isProtectedPage() {
  // Add paths that require authentication
  const protectedPaths = ['/dashboard.html', '/profile.html'];
  return protectedPaths.some(path => window.location.pathname.endsWith(path));
}

// Start periodic auth check
function startAuthCheck() {
  if (authCheckInterval) {
    clearInterval(authCheckInterval);
  }
  
  // Apply cached state immediately for seamless experience
  const cached = sessionStorage.getItem('authState');
  if (cached) {
    try {
      applyAuthState(JSON.parse(cached));
    } catch (e) {}
  }
  
  // Debounce initial check to prevent race with navbar.js
  setTimeout(() => {
    updateLoginUI();
    authCheckInterval = setInterval(updateLoginUI, AUTH_CHECK_INTERVAL);
  }, 100);
}

/* ===============================
   LOGOUT HANDLER
   =============================== */
async function handleLogout() {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      showToast('Failed to get security token. Please refresh the page and try again.', false);
      return;
    }
    
    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    
    const response = await fetch(`${BASE_PATH}logout.php`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin',
      body: new URLSearchParams(formData)
    });

    // Clear auth state immediately for better UX
    sessionStorage.removeItem('authState');
    updateAuthenticatedUI(false);
    
    // Show success message and redirect
    showToast('You have been logged out successfully', true);
    
    setTimeout(() => {
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = `${BASE_PATH}index.html`;
      } else {
        // Force a full page reload to ensure all state is cleared
        window.location.reload();
      }
    }, 500);
    
  } catch (error) {
    console.error('Logout error:', error);
    // Don't show error message if we've already logged out
    if (!sessionStorage.getItem('authState')) {
      showToast('Logged out successfully', true);
    } else {
      showToast('Network error during logout. Please refresh the page.', false);
    }
  }
}

/* ===============================
   EVENT LISTENERS
   =============================== */
document.addEventListener('DOMContentLoaded', function() {
  // Start the authentication check when the page loads
  startAuthCheck();
  
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
    switchToRegisterBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await switchToRegister();
    });
  }
  
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await switchToLogin();
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
    navLoginBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await openLogin();
    });
  }
  
  if (navRegisterBtn) {
    navRegisterBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await openRegister();
    });
  }
});
