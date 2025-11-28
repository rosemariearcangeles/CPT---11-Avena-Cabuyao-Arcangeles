<?php
/**
 * Session Protection Middleware
 * Provides utilities for protecting routes and checking authentication
 */

require_once "session_utils.php";

class AuthMiddleware {
    /**
     * Require user to be logged in
     * Redirects to home page if not authenticated
     */
    public static function requireLogin() {
        $session = SessionManager::getInstance();
        if (!$session->isLoggedIn()) {
            header("Location: index.php");
            exit;
        }
    }

    /**
     * Require user to be logged OUT
     * Redirects to dashboard if already authenticated
     */
    public static function requireLogout() {
        $session = SessionManager::getInstance();
        if ($session->isLoggedIn()) {
            header("Location: dashboard.php");
            exit;
        }
    }

    /**
     * Check if user is logged in (returns boolean)
     */
    public static function isAuthenticated() {
        $session = SessionManager::getInstance();
        return $session->isLoggedIn();
    }

    /**
     * Get current user ID
     */
    public static function getUserId() {
        $session = SessionManager::getInstance();
        return $session->getUserId();
    }

    /**
     * Get current username
     */
    public static function getUsername() {
        $session = SessionManager::getInstance();
        return $session->getUsername();
    }

    /**
     * Require CSRF token for POST requests
     */
    public static function requireCSRFToken() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $session = SessionManager::getInstance();
            $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            
            if (!$token || !$session->validateCSRFToken($token)) {
                http_response_code(403);
                die(json_encode(['success' => false, 'message' => 'Invalid CSRF token']));
            }
        }
    }

    /**
     * Get CSRF token for forms
     */
    public static function getCSRFToken() {
        $session = SessionManager::getInstance();
        return $session->generateCSRFToken();
    }

    /**
     * Validate user owns resource (for user-specific data)
     */
    public static function validateUserOwnership($user_id) {
        $session = SessionManager::getInstance();
        if ($session->getUserId() !== (int)$user_id) {
            http_response_code(403);
            die(json_encode(['success' => false, 'message' => 'Unauthorized access']));
        }
    }

    /**
     * Log user action for audit trail
     */
    public static function logAction($action, $details = '') {
        $session = SessionManager::getInstance();
        if ($session->isLoggedIn()) {
            $user_id = $session->getUserId();
            $timestamp = date('Y-m-d H:i:s');
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            
            // Log to file or database as needed
            // This is a placeholder for audit logging
            error_log("[$timestamp] User $user_id - Action: $action - Details: $details - IP: $ip");
        }
    }

    /**
     * Rate limiting helper (basic implementation)
     */
    public static function checkRateLimit($action, $limit = 10, $window = 60) {
        $session = SessionManager::getInstance();
        if (!$session->isLoggedIn()) {
            return true;
        }

        $key = "rate_limit_{$action}_{$session->getUserId()}";
        $count = $_SESSION[$key] ?? 0;
        $timestamp = $_SESSION["{$key}_time"] ?? time();

        if (time() - $timestamp > $window) {
            $_SESSION[$key] = 1;
            $_SESSION["{$key}_time"] = time();
            return true;
        }

        if ($count >= $limit) {
            return false;
        }

        $_SESSION[$key] = $count + 1;
        return true;
    }
}

?>
