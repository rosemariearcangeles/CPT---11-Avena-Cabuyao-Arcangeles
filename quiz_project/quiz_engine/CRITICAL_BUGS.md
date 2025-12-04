# Critical Bugs & Missing Functionality

## 🔴 CRITICAL BUGS

### 1. Database Column Mismatch - BREAKS STUDENT ENROLLMENT
**File**: `api/get_class_students.php`
**Line**: 23
**Issue**: Uses `cm.student_id` but should be `cm.user_id`
**Impact**: Students list won't load, breaks teacher view
**Fix**: Change `JOIN users u ON cm.student_id = u.id` to `JOIN users u ON cm.user_id = u.id`

### 2. Missing Credentials in API Calls - SESSION LOSS
**Files**: 
- `js/class_dashboard.js` - ALL fetch calls
- `js/dashboard.js` - ALL fetch calls
**Issue**: No `credentials: 'same-origin'` in fetch calls
**Impact**: Session cookies not sent, authentication fails randomly
**Fix**: Add `credentials: 'same-origin'` to all fetch calls

### 3. Missing API Endpoints - BREAKS FUNCTIONALITY
**Missing Files**:
- `api/get_teacher_quizzes.php` - Needed for assigning existing quizzes
- `api/assign_quiz.php` - Needed for quiz assignment
- `api/get_quizzes.php` - Needed for personal dashboard
- `api/delete_quiz.php` - Needed for quiz deletion
- `api/get_quiz_details.php` - Needed for viewing results

**Impact**: Core features completely broken

### 4. Missing Database Tables - BREAKS EDUCATION MODE
**Missing Tables**:
- `assignments` - Stores quiz assignments to classes
- `submissions` - Stores student quiz submissions
- `quizzes` - Stores quiz data

**Impact**: Education mode completely non-functional

### 5. XSS Vulnerability - SECURITY RISK
**File**: `js/class_dashboard.js`
**Lines**: Multiple innerHTML assignments with unsanitized data
**Issue**: User input directly inserted into HTML
**Impact**: Cross-site scripting attacks possible
**Fix**: Sanitize all user-generated content before display

### 6. SQL Injection Risk - SECURITY RISK
**File**: `js/class_dashboard.js`
**Line**: 147, 179
**Issue**: Query parameters concatenated directly
**Impact**: SQL injection possible
**Fix**: Use proper URL encoding or POST requests

## ⚠️ MAJOR ISSUES

### 7. No Error Handling for Missing classId
**File**: `js/class_dashboard.js`
**Issue**: If classId is null, all API calls fail silently
**Fix**: Redirect to education_dashboard if classId missing

### 8. Race Condition in Auth Check
**File**: `js/class_dashboard.js`
**Issue**: `renderClassDashboard()` called before `loadUserData()` completes
**Impact**: Wrong dashboard rendered for user role
**Fix**: Await loadUserData before rendering

### 9. No Cache Invalidation
**Files**: All dashboard files
**Issue**: Stale data shown after updates
**Fix**: Invalidate cache after create/update/delete operations

### 10. Missing CSRF Protection
**Files**: All POST requests in dashboard files
**Issue**: No CSRF tokens in POST requests
**Impact**: CSRF attacks possible
**Fix**: Add CSRF tokens to all state-changing requests

## 🟡 MEDIUM ISSUES

### 11. No Loading States
**Files**: All dashboard JS files
**Issue**: No visual feedback during API calls
**Impact**: Poor UX, users don't know if action succeeded

### 12. Memory Leak in Event Listeners
**File**: `js/class_dashboard.js`
**Issue**: Event listeners added but never removed
**Impact**: Memory leaks on navigation

### 13. No Offline Handling
**Files**: All dashboard files
**Issue**: No handling for network errors
**Impact**: App breaks when offline

### 14. Hardcoded Strings
**Files**: All JS files
**Issue**: Error messages and labels hardcoded
**Impact**: No internationalization possible

## 🔧 MISSING FUNCTIONALITY

### 15. No Quiz Editing
**Impact**: Can't modify quizzes after creation

### 16. No Bulk Operations
**Impact**: Can't delete/assign multiple items at once

### 17. No Search/Filter
**Impact**: Hard to find items in long lists

### 18. No Pagination
**Impact**: Performance issues with many items

### 19. No Export Functionality
**Impact**: Can't export grades/results

### 20. No Email Notifications
**Impact**: Students don't know about new assignments

## 🎯 IMMEDIATE ACTION REQUIRED

**Priority 1 (Fix Now)**:
1. Fix database column mismatch (#1)
2. Add credentials to all fetch calls (#2)
3. Create missing API endpoints (#3)
4. Create database tables (#4)

**Priority 2 (Fix Soon)**:
5. Add XSS protection (#5)
6. Fix SQL injection (#6)
7. Add error handling (#7)
8. Fix race condition (#8)

**Priority 3 (Fix Later)**:
9. Add CSRF protection (#10)
10. Add loading states (#11)
11. Add offline handling (#13)
