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

    // Login/Register buttons - handled by auth.js
    // We only keep logout here as a fallback or for specific navbar behavior if needed
    const logoutBtn = document.getElementById('nav-logout-btn');

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
    // Apply cached state SYNCHRONOUSLY to prevent any flicker
    if (window.AuthCache && typeof window.AuthCache.getCachedState === 'function') {
      const cached = window.AuthCache.getCachedState();
      if (cached && cached.loggedIn && cached.username && cached.role) {
        this.applyAuthState(cached);
      }
    } else {
      // Fallback to direct sessionStorage read
      const cached = sessionStorage.getItem('authState');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.loggedIn && data.username && data.role) {
            this.applyAuthState(data);
          }
        } catch (e) {
          console.error('Error parsing cached auth state:', e);
        }
      }
    }
    
    // Then validate with server in background
    this.updateAuthUI();
  }

  async updateAuthUI() {
    // Prevent duplicate simultaneous requests
    if (this._authCheckInProgress) {
      return this._lastAuthResult || { loggedIn: false };
    }
    
    this._authCheckInProgress = true;
    
    try {
      // Use AuthCache if available for consistent caching
      let data;
      if (window.AuthCache && typeof window.AuthCache.getAuthState === 'function') {
        data = await window.AuthCache.getAuthState();
      } else {
        // Fallback to direct fetch
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        
        // Cache the auth state
        if (data.loggedIn && data.username && data.role) {
          sessionStorage.setItem('authState', JSON.stringify(data));
        } else {
          sessionStorage.removeItem('authState');
        }
      }
      
      // Only update UI if state actually changed
      const currentState = this._lastAuthResult;
      if (!currentState || 
          currentState.loggedIn !== data.loggedIn || 
          currentState.username !== data.username ||
          currentState.role !== data.role) {
        this.applyAuthState(data);
      }
      
      this._lastAuthResult = data;
      return data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      const loggedOutState = { loggedIn: false, username: null, role: null };
      this.applyAuthState(loggedOutState);
      this._lastAuthResult = loggedOutState;
      return loggedOutState;
    } finally {
      this._authCheckInProgress = false;
    }
  }

  applyAuthState(authData) {
    const { loggedIn, username, role } = authData;

    if (loggedIn && username) {
      this.showLoggedInState(username, role);
    } else {
      this.showLoggedOutState();
    }
  }

  showLoggedInState(username, role) {
    // Use opacity transitions for smooth, glitch-free state changes
    // Update all elements atomically
    requestAnimationFrame(() => {
      if (this.authButtons) {
        this.authButtons.style.display = 'none';
        this.authButtons.style.opacity = '0';
      }

      if (this.userMenu) {
        this.userMenu.style.display = 'block';
        this.userMenu.style.opacity = '1';
      }

      if (this.dashboardLink) {
        this.dashboardLink.style.display = 'block';
        this.dashboardLink.style.opacity = '1';
        
        // Update dashboard link href based on role
        const isEducationUser = (role === 'student' || role === 'teacher');
        const dashboardUrl = isEducationUser ? 'education_dashboard.html' : 'dashboard.html';
        const basePath = this.getBasePath();
        const dashboardLinkElement = this.dashboardLink.querySelector('a');
        if (dashboardLinkElement) {
          dashboardLinkElement.href = `${basePath}${dashboardUrl}`;
        }
      }

      // Update username displays
      if (this.usernameSpan) {
        this.usernameSpan.textContent = username;
      }
      
      if (this.dropdownUsername) {
        this.dropdownUsername.textContent = username;
      }

      // Update role badge if present
      const roleBadge = document.querySelector('#nav-role-badge');
      if (roleBadge && (role === 'student' || role === 'teacher')) {
        roleBadge.style.display = 'inline-flex';
        roleBadge.textContent = role === 'teacher' ? 'Teacher' : 'Student';
      } else if (roleBadge) {
        roleBadge.style.display = 'none';
      }
      
      // Update dropdown dashboard link
      const dropdownDashboardLink = document.querySelector('#nav-dropdown-dashboard');
      if (dropdownDashboardLink) {
          dropdownDashboardLink.href = `${basePath}${dashboardUrl}`;
      }
    });
  }

  showLoggedOutState() {
    // Use opacity transitions for smooth, glitch-free state changes
    // Update all elements atomically
    requestAnimationFrame(() => {
      if (this.authButtons) {
        this.authButtons.style.display = 'flex';
        this.authButtons.style.opacity = '1';
      }

      if (this.userMenu) {
        this.userMenu.style.display = 'none';
        this.userMenu.style.opacity = '0';
      }

      if (this.dashboardLink) {
        this.dashboardLink.style.display = 'none';
        this.dashboardLink.style.opacity = '0';
      }
      
      // Hide role badge
      const roleBadge = document.querySelector('#nav-role-badge');
      if (roleBadge) {
        roleBadge.style.display = 'none';
      }
    });
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
    // Always delegate to auth.js handler to prevent duplicate toasts
    if (typeof window.handleLogout === 'function') {
      return window.handleLogout();
    }
    console.warn('handleLogout function not found in auth.js');
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
    // Check auth immediately (but cache was already applied synchronously)
    this.updateAuthUI();
    
    // Set up periodic checks (every 30 seconds)
    if (this._authCheckInterval) {
      clearInterval(this._authCheckInterval);
    }
    this._authCheckInterval = setInterval(() => this.updateAuthUI(), 30000);
    
    // Check on page visibility change
    if (!this._visibilityHandler) {
      this._visibilityHandler = () => {
        if (!document.hidden) {
          this.updateAuthUI();
        }
      };
      document.addEventListener('visibilitychange', this._visibilityHandler);
    }
  }

  refresh() {
    this.updateAuthUI();
    this.setActiveNavLink();
  }
}

// Initialize navbar when script loads
const unifiedNavbar = new UnifiedNavbar();

window.UnifiedNavbar = UnifiedNavbar;
window.navbarInstance = unifiedNavbar;

