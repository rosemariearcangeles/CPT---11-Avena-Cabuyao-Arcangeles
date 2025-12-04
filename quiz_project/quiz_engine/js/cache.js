// Cache Management System
const CacheManager = {
  // Cache keys
  KEYS: {
    AUTH_STATE: 'authState',
    USER_DATA: 'userData',
    USER_ROLE: 'userRole',
    CLASSES: 'userClasses',
    QUIZZES: 'userQuizzes',
    LAST_SYNC: 'lastSync'
  },

  // Cache duration (5 minutes)
  CACHE_DURATION: 5 * 60 * 1000,

  // Set cache with timestamp
  set(key, data, duration = this.CACHE_DURATION) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + duration
      };
      sessionStorage.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (e) {
      console.error('CacheManager.set error:', e);
      return false;
    }
  },

  // Get cache if not expired
  get(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    try {
      const { data, expires } = JSON.parse(cached);
      if (Date.now() > expires) {
        this.remove(key);
        return null;
      }
      return data;
    } catch (e) {
      this.remove(key);
      return null;
    }
  },

  // Remove cache
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('CacheManager.remove error:', e);
      return false;
    }
  },

  // Clear all cache
  clear() {
    try {
      Object.values(this.KEYS).forEach(key => this.remove(key));
      return true;
    } catch (e) {
      console.error('CacheManager.clear error:', e);
      return false;
    }
  },

  // Check if cache is valid
  isValid(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return false;

    try {
      const { expires } = JSON.parse(cached);
      return Date.now() < expires;
    } catch (e) {
      this.remove(key); // Clean up corrupted cache
      return false;
    }
  },

  // Get cache metadata without retrieving data
  getMetadata(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    try {
      const { timestamp, expires } = JSON.parse(cached);
      return {
        timestamp,
        expires,
        isValid: Date.now() < expires,
        age: Date.now() - timestamp
      };
    } catch (e) {
      this.remove(key);
      return null;
    }
  }
};

// Auth Cache Helper
const AuthCache = {
  async getAuthState(forceRefresh = false) {
    // Always check cache first unless force refresh
    if (!forceRefresh) {
      let cached = CacheManager.get(CacheManager.KEYS.AUTH_STATE);
      if (cached && cached.loggedIn && cached.username && cached.role) {
        return cached;
      }
    }

    try {
      const response = await fetch('check_auth.php', {
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
      
      const data = await response.json();
      
      // Cache valid auth state
      if (data.loggedIn && data.username && data.role) {
        CacheManager.set(CacheManager.KEYS.AUTH_STATE, data);
        CacheManager.set(CacheManager.KEYS.USER_ROLE, { 
          success: true, 
          role: data.role, 
          username: data.username 
        });
      } else {
        // Clear cache on logged out state
        this.invalidate();
      }
      
      return data;
    } catch (e) {
      console.error('AuthCache.getAuthState error:', e);
      // On error, clear cache and return logged out state
      this.invalidate();
      return { 
        status: 'error',
        loggedIn: false,
        username: null,
        userId: null,
        role: null,
        email: null
      };
    }
  },

  async getUserRole() {
    let cached = CacheManager.get(CacheManager.KEYS.USER_ROLE);
    if (cached) return cached;

    try {
      const response = await fetch('api/get_user_role.php');
      const data = await response.json();
      if (data.success) {
        CacheManager.set(CacheManager.KEYS.USER_ROLE, data);
        return data;
      }
    } catch (e) {}
    return null;
  },

  async getUserData() {
    let cached = CacheManager.get(CacheManager.KEYS.USER_DATA);
    if (cached) return cached;

    const authState = await this.getAuthState();
    if (authState.loggedIn) {
      const userData = {
        username: authState.username,
        email: authState.email,
        loggedIn: true
      };
      CacheManager.set(CacheManager.KEYS.USER_DATA, userData);
      return userData;
    }
    return null;
  },

  invalidate() {
    CacheManager.remove(CacheManager.KEYS.AUTH_STATE);
    CacheManager.remove(CacheManager.KEYS.USER_ROLE);
    CacheManager.remove(CacheManager.KEYS.USER_DATA);
  },

  setAuthState(data) {
    if (data && data.loggedIn && data.username && data.role) {
      CacheManager.set(CacheManager.KEYS.AUTH_STATE, data);
      CacheManager.set(CacheManager.KEYS.USER_ROLE, { 
        success: true, 
        role: data.role, 
        username: data.username 
      });
      return true;
    }
    return false;
  },

  // Get cached state synchronously (for immediate UI rendering)
  getCachedState() {
    return CacheManager.get(CacheManager.KEYS.AUTH_STATE);
  }
};

// Data Cache Helper
const DataCache = {
  async getClasses(role, forceRefresh = false) {
    const cacheKey = `${CacheManager.KEYS.CLASSES}_${role}`;
    if (!forceRefresh) {
      let cached = CacheManager.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const endpoint = role === 'teacher' ? 'api/get_teacher_classes.php' : 'api/get_student_classes.php';
      const response = await fetch(endpoint, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'same-origin'
      });
      const data = await response.json();
      if (data.success) {
        CacheManager.set(cacheKey, data);
        return data;
      }
    } catch (e) {}
    return null;
  },

  async getQuizzes() {
    let cached = CacheManager.get(CacheManager.KEYS.QUIZZES);
    if (cached) return cached;

    try {
      const response = await fetch('api/get_user_quizzes.php');
      const data = await response.json();
      if (data.success) {
        CacheManager.set(CacheManager.KEYS.QUIZZES, data);
        return data;
      }
    } catch (e) {}
    return null;
  },

  invalidateClasses() {
    CacheManager.remove(`${CacheManager.KEYS.CLASSES}_teacher`);
    CacheManager.remove(`${CacheManager.KEYS.CLASSES}_student`);
  },

  invalidateQuizzes() {
    CacheManager.remove(CacheManager.KEYS.QUIZZES);
  }
};

// Preload critical data
async function preloadCriticalData() {
  try {
    const authState = await AuthCache.getAuthState(true);
    if (authState.loggedIn) {
      AuthCache.getUserRole();
      AuthCache.getUserData();
    }
  } catch (e) {
    console.error('Preload failed:', e);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCriticalData);
} else {
  preloadCriticalData();
}

// Export for use in other scripts
window.CacheManager = CacheManager;
window.AuthCache = AuthCache;
window.DataCache = DataCache;
