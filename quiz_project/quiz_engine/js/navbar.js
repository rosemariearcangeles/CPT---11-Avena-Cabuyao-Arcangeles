// Unified Navbar Module
class UnifiedNavbar {
  constructor() {
    this.navbar = null;
    this.mobileMenuToggle = null;
    this.navbarMenu = null;
    this.userMenuToggle = null;
    this.userDropdown = null;
    this.authButtons = null;
    this.userMenu = null;
    this.dashboardLink = null;
    this.usernameSpan = null;
    this.dropdownUsername = null;
    
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
    this.authCheckInterval = null;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Get navbar elements
    this.navbar = document.querySelector('.navbar');
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.navbarMenu = document.querySelector('.navbar-menu');
    this.userMenuToggle = document.querySelector('#user-menu-toggle');
    this.userDropdown = document.querySelector('#user-dropdown');
    this.authButtons = document.querySelector('.auth-buttons');
    this.userMenu = document.querySelector('.user-menu');
    this.dashboardLink = document.querySelector('.dashboard-link');
    this.usernameSpan = document.querySelector('#nav-username');
    this.dropdownUsername = document.querySelector('#dropdown-username');

    if (!this.navbar) {
      console.warn('Navbar not found');
      return;
    }

    this.bindEvents();
    this.initializeAuth();
    this.setActiveNavLink();
    this.startAuthCheck();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // User menu toggle
    if (this.userMenuToggle) {
      this.userMenuToggle.addEventListener('click', () => this.toggleUserMenu());
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    // Close menus on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.closeUserMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());

    // Login/Register buttons
    const loginBtn = document.getElementById('nav-login-btn');
    const registerBtn = document.getElementById('nav-register-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLoginClick());
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', () => this.handleRegisterClick());
    }

    if (logoutBtn) {
      // Delegate logout handling to global auth.js handler if available to avoid duplicate toasts
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.handleLogout === 'function') {
          window.handleLogout();
        } else {
          // Fallback to internal handler (without toasts) if auth.js is not loaded
          this.handleLogoutClick();
        }
      });
    }

    // Close dropdown when clicking dropdown items
    if (this.userDropdown) {
      this.userDropdown.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-item')) {
          this.closeUserMenu();
        }
      });
    }
  }

  // Mobile menu functions
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
    
    if (this.navbarMenu) {
      this.navbarMenu.classList.add('show');
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
    
    if (this.navbarMenu) {
      this.navbarMenu.classList.remove('show');
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  // User menu functions
  toggleUserMenu() {
    if (this.isUserMenuOpen) {
      this.closeUserMenu();
    } else {
      this.openUserMenu();
    }
  }

  openUserMenu() {
    this.isUserMenuOpen = true;
    
    if (this.userMenuToggle) {
      this.userMenuToggle.setAttribute('aria-expanded', 'true');
    }
    
    if (this.userDropdown) {
      this.userDropdown.classList.add('show');
    }
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
    
    if (this.userMenuToggle) {
      this.userMenuToggle.setAttribute('aria-expanded', 'false');
    }
    
    if (this.userDropdown) {
      this.userDropdown.classList.remove('show');
    }
  }

  // Handle outside clicks
  handleOutsideClick(e) {
    // Close mobile menu if clicking outside
    if (this.isMenuOpen && 
        !this.navbarMenu?.contains(e.target) && 
        !this.mobileMenuToggle?.contains(e.target)) {
      this.closeMobileMenu();
    }

    // Close user menu if clicking outside
    if (this.isUserMenuOpen && 
        !this.userMenu?.contains(e.target)) {
      this.closeUserMenu();
    }
  }

  // Handle window resize
  handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Authentication functions
  initializeAuth() {
    // Initial auth state check
    this.updateAuthUI();
  }

  async updateAuthUI() {
    try {
      // Determine base path for API calls
      const basePath = this.getBasePath();
      
      const response = await fetch(`${basePath}check_auth.php`, {
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
      this.applyAuthState(data);
      
      return data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.applyAuthState({ loggedIn: false });
      return { loggedIn: false };
    }
  }

  applyAuthState(authData) {
    const { loggedIn, username } = authData;

    if (loggedIn && username) {
      this.showLoggedInState(username);
    } else {
      this.showLoggedOutState();
    }
  }

  showLoggedInState(username) {
    // Hide auth buttons with fade effect
    if (this.authButtons) {
      this.authButtons.classList.add('fade-out');
      setTimeout(() => {
        this.authButtons.style.display = 'none';
        this.authButtons.classList.remove('fade-out');
      }, 200);
    }

    // Show user menu with fade effect
    if (this.userMenu) {
      this.userMenu.style.display = 'block';
      this.userMenu.classList.add('fade-in');
      setTimeout(() => this.userMenu.classList.remove('fade-in'), 200);
    }

    // Show dashboard link with fade effect
    if (this.dashboardLink) {
      this.dashboardLink.style.display = 'block';
      this.dashboardLink.classList.add('fade-in');
      setTimeout(() => this.dashboardLink.classList.remove('fade-in'), 200);
    }

    // Update username displays
    if (this.usernameSpan) {
      this.usernameSpan.textContent = username;
    }
    
    if (this.dropdownUsername) {
      this.dropdownUsername.textContent = username;
    }
  }

  showLoggedOutState() {
    // Show auth buttons with fade effect
    if (this.authButtons) {
      this.authButtons.style.display = 'flex';
      this.authButtons.classList.add('fade-in');
      setTimeout(() => this.authButtons.classList.remove('fade-in'), 200);
    }

    // Hide user menu with fade effect
    if (this.userMenu) {
      this.userMenu.classList.add('fade-out');
      setTimeout(() => {
        this.userMenu.style.display = 'none';
        this.userMenu.classList.remove('fade-out');
      }, 200);
    }

    // Hide dashboard link with fade effect
    if (this.dashboardLink) {
      this.dashboardLink.classList.add('fade-out');
      setTimeout(() => {
        this.dashboardLink.style.display = 'none';
        this.dashboardLink.classList.remove('fade-out');
      }, 200);
    }
  }

  // Event handlers
  handleLoginClick() {
    if (typeof openLogin === 'function') {
      openLogin();
    } else {
      console.warn('openLogin function not found');
    }
  }

  handleRegisterClick() {
    if (typeof openRegister === 'function') {
      openRegister();
    } else {
      console.warn('openRegister function not found');
    }
  }

  async handleLogoutClick() {
    try {
      const basePath = this.getBasePath();

      // If global logout handler exists (from auth.js), use it and return to avoid duplicate flows
      if (typeof window.handleLogout === 'function') {
        return window.handleLogout();
      }

      // Fallback minimal logout without toast notifications to avoid duplicates
      const response = await fetch(`${basePath}logout.php`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update UI only; toasts are managed by auth.js when available
        this.updateAuthUI();
        if (!window.location.pathname.endsWith('index.html')) {
          setTimeout(() => {
            window.location.href = `${basePath}index.html`;
          }, 500);
        }
      } else {
        // No toast here to prevent duplicates
        console.warn('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Navigation functions
  setActiveNavLink() {
    const currentPage = this.getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    
    navLinks.forEach(link => {
      if (link.getAttribute('data-page') === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path.endsWith('/')) return 'home';
    if (path.includes('about.html')) return 'about';
    if (path.includes('service.html')) return 'service';
    if (path.includes('contact.html')) return 'contact';
    if (path.includes('faq.html') || path.includes('FAQ.html')) return 'faq';
    return 'home';
  }

  // Utility functions
  getBasePath() {
    const path = window.location.pathname;
    const depth = path.split('/').filter(part => part && part !== '.').length - 1;
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  startAuthCheck() {
    // Clear any existing interval
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    
    // Initial check
    this.updateAuthUI();
    
    // Set up periodic check (every minute)
    this.authCheckInterval = setInterval(() => {
      this.updateAuthUI();
    }, 60000);
  }

  stopAuthCheck() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
      this.authCheckInterval = null;
    }
  }

  // Public API methods
  refresh() {
    this.updateAuthUI();
    this.setActiveNavLink();
  }

  destroy() {
    this.stopAuthCheck();
    // Remove event listeners if needed
  }
}

// Initialize navbar when script loads
const unifiedNavbar = new UnifiedNavbar();

// Export for use in other scripts
window.UnifiedNavbar = UnifiedNavbar;
window.navbarInstance = unifiedNavbar;

// Legacy compatibility - expose key functions globally
window.updateLoginUI = () => {
  if (window.navbarInstance) {
    window.navbarInstance.updateAuthUI();
  }
};