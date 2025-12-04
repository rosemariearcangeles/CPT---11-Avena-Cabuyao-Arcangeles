<?php

class SessionManager {
    private static $instance = null;
    private $sessionStarted = false;

    private function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            // Set secure session parameters
            $sessionName = 'quiz_engine_sid';
            $secure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'; // Enable HTTPS security
            $httponly = true; // Prevent JavaScript access to session cookie

            // Set session cookie parameters
            session_set_cookie_params([
                'lifetime' => 86400, // 24 hours
                'path' => '/',
                'domain' => $_SERVER['HTTP_HOST'] ?? '',
                'secure' => $secure,
                'httponly' => $httponly,
                'samesite' => 'Lax' // CSRF protection
            ]);

            session_name($sessionName);
            session_start();
            $this->sessionStarted = true;

            // Regenerate session ID periodically to prevent session fixation
            if (!isset($_SESSION['last_regeneration'])) {
                $this->regenerateSession();
            } else {
                $interval = 1800; // 30 minutes
                if (time() - $_SESSION['last_regeneration'] > $interval) {
                    $this->regenerateSession();
                }
            }
        }
    }
    
    private function regenerateSession() {
        $_SESSION['last_regeneration'] = time();
        session_regenerate_id(true);
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new SessionManager();
        }
        return self::$instance;
    }

    public function login($userId, $username) {
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        $this->regenerateSession();
    }

    public function logout() {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 3600,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite'] ?? 'Lax'
            ]);
        }
        session_destroy();
    }

    public function isLoggedIn() {
        // Check if session has expired due to total login time (24 hours)
        $maxLoginTime = 86400; // 24 hours
        if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] > $maxLoginTime)) {
            $this->logout();
            return false;
        }

        // Check if session has expired due to inactivity (2 hours)
        $maxIdleTime = 7200; // 2 hours
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $maxIdleTime)) {
            $this->logout();
            return false;
        }

        // Update last activity time
        if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
            $_SESSION['last_activity'] = time();
        }

        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    public function getUserId() {
        return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    }

    public function getUsername() {
        return isset($_SESSION['username']) ? $_SESSION['username'] : null;
    }

    public function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public function requireCSRFToken() {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!$token || !isset($_SESSION['csrf_token']) ||
            !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Invalid CSRF token']);
            exit;
        }
    }

    public function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}

?>
