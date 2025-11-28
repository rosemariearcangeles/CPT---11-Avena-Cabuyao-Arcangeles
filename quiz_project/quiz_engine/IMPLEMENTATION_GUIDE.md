# Dashboard, Profile & Session Protection Implementation Guide

## Overview
This guide covers the new dashboard, profile, and session protection features added to the Quiz Engine application.

---

## 📁 New Files Created

### 1. **dashboard.php**
- **Location**: Root directory
- **Purpose**: Main dashboard page for authenticated users
- **Features**:
  - User statistics (total quizzes, average score, best score, member since)
  - Quiz history with scores and percentages
  - In-progress quizzes with resume functionality
  - Account settings and preferences
  - Sidebar navigation between sections
  - Responsive design

### 2. **profile_new.php**
- **Location**: Root directory
- **Purpose**: Enhanced profile management page
- **Features**:
  - View account information
  - Edit username and email
  - CSRF token protection
  - Success/error alerts
  - Links to dashboard and password change
  - Account deletion option (placeholder)

### 3. **middleware.php**
- **Location**: Root directory
- **Purpose**: Session protection and authentication middleware
- **Key Functions**:
  - `AuthMiddleware::requireLogin()` - Protect routes
  - `AuthMiddleware::requireLogout()` - Redirect logged-in users
  - `AuthMiddleware::isAuthenticated()` - Check auth status
  - `AuthMiddleware::requireCSRFToken()` - Validate CSRF tokens
  - `AuthMiddleware::logAction()` - Audit trail logging
  - `AuthMiddleware::checkRateLimit()` - Rate limiting

### 4. **CSS Files**
- **dashboard.css** - Dashboard styling with responsive design
- **profile_new.css** - Modern profile page styling

### 5. **Database Schema**
- **database_schema_extended.sql** - Extended schema with new tables and views

---

## 🗄️ Database Changes

### New Tables

#### 1. **user_statistics**
Stores aggregated user statistics for dashboard display
```sql
- user_id (FK)
- total_quizzes_taken
- average_score
- best_score
- worst_score
- total_time_spent
```

#### 2. **user_activity_log**
Audit trail for user actions
```sql
- user_id (FK)
- action (login, logout, profile_update, etc.)
- details
- ip_address
- user_agent
- created_at
```

#### 3. **user_preferences**
User settings and preferences
```sql
- user_id (FK)
- theme (light/dark)
- notifications_enabled
- email_notifications
- language
- timezone
```

#### 4. **session_tokens**
Enhanced session management
```sql
- user_id (FK)
- token
- ip_address
- user_agent
- expires_at
- is_revoked
```

### New Views
- `user_dashboard_summary` - Aggregated dashboard data
- `recent_quiz_attempts` - Recent quiz history

### New Stored Procedures
- `update_user_statistics()` - Update stats after quiz completion
- `log_user_activity()` - Log user actions

---

## 🔐 Session Protection

### Using the Middleware

#### Protect a Route (Require Login)
```php
<?php
require_once "middleware.php";

// This will redirect to index.php if not logged in
AuthMiddleware::requireLogin();

// Your protected code here
?>
```

#### Check Authentication Status
```php
<?php
if (AuthMiddleware::isAuthenticated()) {
    $username = AuthMiddleware::getUsername();
    $user_id = AuthMiddleware::getUserId();
}
?>
```

#### Validate CSRF Token
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    AuthMiddleware::requireCSRFToken();
    // Process form
}
?>
```

#### Log User Actions
```php
<?php
AuthMiddleware::logAction('quiz_completed', 'Quiz ID: 123, Score: 85%');
?>
```

---

## 🚀 Implementation Steps

### Step 1: Update Database
1. Copy the SQL from `database_schema_extended.sql`
2. Paste into your MySQL database
3. Run the queries to create new tables, views, and procedures

### Step 2: Update Navigation Links
Update your navbar/navigation to link to the new pages:
```html
<a href="dashboard.php">Dashboard</a>
<a href="profile_new.php">Profile</a>
```

### Step 3: Update Existing Pages
Update pages that need session protection:
```php
<?php
require_once "middleware.php";
AuthMiddleware::requireLogin();
?>
```

### Step 4: Update Quiz Completion Handler
After a quiz is completed, update user statistics:
```php
<?php
// After saving quiz attempt
$user_id = AuthMiddleware::getUserId();
$conn->query("CALL update_user_statistics($user_id)");
?>
```

### Step 5: Test Authentication Flow
1. Test login/logout on all pages
2. Verify dashboard displays correct stats
3. Test profile editing
4. Verify CSRF token validation
5. Check activity logging

---

## 📊 Dashboard Features

### Overview Section
- Total quizzes taken
- Average score
- Best score
- Member since date
- Continue learning (in-progress quizzes)

### Quiz History Section
- Table of completed quizzes
- Score and percentage
- Completion date
- Visual score bar

### In Progress Section
- List of incomplete quizzes
- Current question number
- Last saved timestamp
- Resume button

### Settings Section
- Edit profile link
- Change password (placeholder)
- Delete account (placeholder)

---

## 👤 Profile Features

### View Information
- Username
- Email
- Member since date

### Edit Profile
- Update username (3-50 characters)
- Update email (validated)
- CSRF token protection
- Success/error alerts

### Account Actions
- Link to dashboard
- Change password (placeholder)
- Delete account (placeholder)

---

## 🔒 Security Features

### CSRF Protection
- Token generation in SessionManager
- Token validation in middleware
- Token included in all forms

### Session Management
- Session singleton pattern
- Secure session handling
- Session timeout support

### Audit Logging
- User action logging
- IP address tracking
- User agent tracking
- Timestamp recording

### Rate Limiting
- Basic rate limiting implementation
- Configurable limits and time windows
- Per-user rate limiting

---

## 📱 Responsive Design

Both dashboard and profile pages are fully responsive:
- Desktop: Full sidebar navigation
- Tablet: Adjusted layout
- Mobile: Stacked layout with horizontal nav

---

## 🎨 Styling

### Color Scheme
- Primary: #6366f1 (Indigo)
- Secondary: #ec4899 (Pink)
- Success: #10b981 (Green)
- Danger: #ef4444 (Red)

### Typography
- Font: Inter (Google Fonts)
- Fallback: System fonts

### Spacing & Radius
- Border radius: 8px
- Consistent padding/margin scale

---

## 🧪 Testing Checklist

- [ ] Database schema created successfully
- [ ] Dashboard displays correct statistics
- [ ] Quiz history shows completed quizzes
- [ ] In-progress quizzes can be resumed
- [ ] Profile can be edited
- [ ] CSRF tokens are validated
- [ ] Session protection works on protected routes
- [ ] Activity logging records actions
- [ ] Responsive design works on mobile
- [ ] Alerts display correctly
- [ ] Navigation between sections works
- [ ] Logout functionality works

---

## 🔄 Integration with Existing Code

### Update navbar.php
Link to new dashboard and profile:
```php
<?php if ($session->isLoggedIn()): ?>
    <a href="dashboard.php">Dashboard</a>
    <a href="profile_new.php">Profile</a>
<?php endif; ?>
```

### Update quiz completion handler
After quiz completion:
```php
<?php
// Save quiz attempt
// ...

// Update statistics
$user_id = AuthMiddleware::getUserId();
$conn->query("CALL update_user_statistics($user_id)");

// Log action
AuthMiddleware::logAction('quiz_completed', "Quiz: $quiz_id, Score: $score");
?>
```

---

## 📝 Notes

- The `profile_new.php` is the updated version. You can replace the old `profile.php` with it.
- The middleware provides a centralized way to handle authentication across all pages.
- Database views and procedures improve performance for dashboard queries.
- All new files follow the existing code style and conventions.

---

## 🆘 Troubleshooting

### Dashboard not showing stats
- Verify database tables were created
- Check that quiz attempts are being saved
- Run `update_user_statistics()` procedure

### CSRF token errors
- Ensure meta tag is in HTML head
- Check token is being passed in forms
- Verify session is active

### Session not persisting
- Check PHP session configuration
- Verify cookies are enabled
- Check session timeout settings

---

## 📞 Support

For issues or questions, refer to the existing documentation or check the code comments in the PHP files.
