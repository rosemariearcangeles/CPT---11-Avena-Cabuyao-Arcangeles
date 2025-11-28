# Quick Start Guide - Dashboard & Profile Setup

## ⚡ 5-Minute Setup

### 1. Database Setup (2 minutes)
```bash
1. Open MySQL Workbench
2. Copy all SQL from: database_schema_extended.sql
3. Paste into a new query tab
4. Execute (Ctrl+Enter)
5. Done! ✓
```

### 2. File Integration (2 minutes)
```bash
1. Files already created in root directory:
   - dashboard.php
   - profile_new.php
   - middleware.php
   - css/dashboard.css
   - css/profile_new.css

2. Update navbar.php to add links:
   <a href="dashboard.php">Dashboard</a>
   <a href="profile_new.php">Profile</a>
```

### 3. Test It (1 minute)
```bash
1. Login to your app
2. Click "Dashboard" link
3. Should see user stats and quiz history
4. Click "Profile" to edit account
5. Done! ✓
```

---

## 🔐 Protect Your Routes

### Before (Old Way)
```php
<?php
require_once "session_utils.php";
$session = SessionManager::getInstance();
if (!$session->isLoggedIn()) {
    header("Location: index.php");
    exit;
}
?>
```

### After (New Way)
```php
<?php
require_once "middleware.php";
AuthMiddleware::requireLogin();
?>
```

---

## 📊 Dashboard Features

| Feature | Location | Status |
|---------|----------|--------|
| User Stats | Overview Tab | ✓ Ready |
| Quiz History | Quiz History Tab | ✓ Ready |
| In Progress | In Progress Tab | ✓ Ready |
| Settings | Settings Tab | ✓ Ready |
| Responsive | All Sections | ✓ Ready |

---

## 👤 Profile Features

| Feature | Status |
|---------|--------|
| View Account Info | ✓ Ready |
| Edit Username | ✓ Ready |
| Edit Email | ✓ Ready |
| CSRF Protection | ✓ Ready |
| Success/Error Alerts | ✓ Ready |
| Change Password | ⏳ Placeholder |
| Delete Account | ⏳ Placeholder |

---

## 🔒 Security Features

| Feature | Status |
|---------|--------|
| Session Protection | ✓ Ready |
| CSRF Token Validation | ✓ Ready |
| Activity Logging | ✓ Ready |
| Rate Limiting | ✓ Ready |
| IP Tracking | ✓ Ready |

---

## 📁 File Structure

```
quiz_engine/
├── dashboard.php                 (NEW)
├── profile_new.php              (NEW)
├── middleware.php               (NEW)
├── database_schema_extended.sql (NEW)
├── IMPLEMENTATION_GUIDE.md      (NEW)
├── QUICK_START.md              (NEW)
├── css/
│   ├── dashboard.css           (NEW)
│   └── profile_new.css         (NEW)
└── js/
    └── auth.js                 (existing)
```

---

## 🚀 Common Tasks

### Protect a Page
```php
<?php
require_once "middleware.php";
AuthMiddleware::requireLogin();
// Your code here
?>
```

### Get Current User
```php
<?php
$user_id = AuthMiddleware::getUserId();
$username = AuthMiddleware::getUsername();
?>
```

### Log User Action
```php
<?php
AuthMiddleware::logAction('quiz_completed', 'Score: 85%');
?>
```

### Validate CSRF Token
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    AuthMiddleware::requireCSRFToken();
}
?>
```

### Update User Stats
```php
<?php
$user_id = AuthMiddleware::getUserId();
$conn->query("CALL update_user_statistics($user_id)");
?>
```

---

## 🎯 Next Steps

1. **Run Database Setup**
   - Execute `database_schema_extended.sql`

2. **Update Navigation**
   - Add dashboard and profile links to navbar

3. **Update Quiz Handler**
   - Call `update_user_statistics()` after quiz completion

4. **Test Everything**
   - Login and check dashboard
   - Edit profile
   - Verify stats update

5. **Deploy**
   - Push to production
   - Monitor activity logs

---

## ✅ Verification Checklist

- [ ] Database tables created
- [ ] Dashboard page loads
- [ ] Profile page loads
- [ ] Can edit profile
- [ ] Stats display correctly
- [ ] Quiz history shows
- [ ] In-progress quizzes show
- [ ] Responsive design works
- [ ] CSRF protection works
- [ ] Activity logging works

---

## 📞 Need Help?

Check the detailed guide: `IMPLEMENTATION_GUIDE.md`

---

## 🎉 You're All Set!

Your dashboard and profile system is ready to use. Enjoy! 🚀
