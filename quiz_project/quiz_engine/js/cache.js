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
    const cacheData = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + duration
    };
    sessionStorage.setItem(key, JSON.stringify(cacheData));
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
    sessionStorage.removeItem(key);
  },

  // Clear all cache
  clear() {
    Object.values(this.KEYS).forEach(key => this.remove(key));
  },

  // Check if cache is valid
  isValid(key) {
    const cached = sessionStorage.getItem(key);
    if (!cached) return false;

    try {
      const { expires } = JSON.parse(cached);
      return Date.now() < expires;
    } catch (e) {
      return false;
    }
  }
};

// Auth Cache Helper
const AuthCache = {
  async getAuthState() {
    let cached = CacheManager.get(CacheManager.KEYS.AUTH_STATE);
    if (cached) return cached;

    try {
      const response = await fetch('check_auth.php');
      const data = await response.json();
      CacheManager.set(CacheManager.KEYS.AUTH_STATE, data);
      return data;
    } catch (e) {
      return { loggedIn: false };
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
  }
};

// Data Cache Helper
const DataCache = {
  async getClasses(role) {
    const cacheKey = `${CacheManager.KEYS.CLASSES}_${role}`;
    let cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = role === 'teacher' ? 'api/get_teacher_classes.php' : 'api/get_student_classes.php';
      const response = await fetch(endpoint);
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
  const authState = await AuthCache.getAuthState();
  if (authState.loggedIn) {
    AuthCache.getUserRole();
    AuthCache.getUserData();
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
