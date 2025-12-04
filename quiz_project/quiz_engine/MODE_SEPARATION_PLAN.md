# Personal vs Education Mode - Complete Separation Plan

## Current State Analysis

### User Roles
1. **Personal** - Individual users creating personal quizzes
2. **Student** - Education mode, joins classes, takes quizzes
3. **Teacher** - Education mode, creates classes, assigns quizzes

## Required Separation

### 1. Registration Flow
- **NOT logged in**: Show mode toggle (Personal/Education)
- **Personal mode**: Register as "personal" role
- **Education mode**: Show role selector (Student/Teacher)

### 2. Login Redirect
- **Personal** → `index.html` (can create quizzes)
- **Student** → `education_dashboard.html` (see classes)
- **Teacher** → `education_dashboard.html` (see classes)

### 3. Index.html Behavior
**NOT logged in:**
- Show mode toggle
- Show quiz creation section
- Show role selector in register modal if education mode

**Logged in as Personal:**
- Hide mode toggle
- Show quiz creation section
- Dashboard link → `dashboard.html`

**Logged in as Student:**
- Hide mode toggle
- Show education indicator
- Hide quiz creation, show "My Classes" section
- Dashboard link → `education_dashboard.html`

**Logged in as Teacher:**
- Hide mode toggle
- Show education indicator
- Hide quiz creation, show "My Classes" section
- Dashboard link → `education_dashboard.html`

### 4. Dashboard Pages

**dashboard.html (Personal only)**
- Shows personal quizzes
- Create quiz button → `index.html`
- Back to Home → `index.html`

**education_dashboard.html (Student/Teacher only)**
- Shows classes
- Student: Join class button
- Teacher: Create class button
- Back to Home → `index.html`

**class_dashboard.html (Student/Teacher only)**
- Shows class details
- Teacher: Assign quizzes, view students
- Student: Take quizzes, view grades
- Back button → `education_dashboard.html`

## Implementation Checklist

### Phase 1: Fix Auth & Redirects ✅
- [x] `check_auth.php` returns role
- [x] `login.php` redirects based on role
- [x] Personal → `index.html`
- [x] Student/Teacher → `education_dashboard.html`

### Phase 2: Fix Index.html Logic ✅
- [x] Hide mode toggle when logged in
- [x] Show education indicator for student/teacher
- [x] Hide quiz creation for student/teacher
- [x] Show classes section for student/teacher
- [x] Dashboard link changes based on role

### Phase 3: Fix Dashboard Access (CURRENT)
- [ ] `dashboard.html` - Check if user is personal, redirect if not
- [ ] `education_dashboard.html` - Check if user is student/teacher, redirect if not
- [ ] `class_dashboard.html` - Check if user is student/teacher, redirect if not

### Phase 4: Fix API Endpoints
- [ ] Add credentials to all fetch calls
- [ ] Create missing endpoints
- [ ] Add proper error handling

### Phase 5: Database Schema
- [ ] Verify all tables exist
- [ ] Verify column names match code
- [ ] Add missing foreign keys

## Critical Fixes Needed Now

### 1. Dashboard Access Control
```javascript
// dashboard.html - Only allow personal users
if (role === 'student' || role === 'teacher') {
  window.location.href = 'education_dashboard.html';
}

// education_dashboard.html - Only allow student/teacher
if (role === 'personal') {
  window.location.href = 'dashboard.html';
}
```

### 2. Index.html - Simplify Logic
Current issue: Multiple auth checks causing conflicts
Solution: Single auth check that handles all cases

### 3. Cache Consistency
Issue: Cache not invalidated properly
Solution: Clear cache on login/logout, refresh on page load

## Testing Scenarios

### Scenario 1: New User (Not Logged In)
1. Visit index.html → See mode toggle
2. Select Personal → Register → Login → Redirect to index.html
3. See quiz creation, no mode toggle
4. Dashboard link → dashboard.html

### Scenario 2: New Student
1. Visit index.html → See mode toggle
2. Select Education → See role selector
3. Select Student → Register → Login → Redirect to education_dashboard.html
4. See classes, join class button
5. Back to index.html → See classes, no quiz creation

### Scenario 3: New Teacher
1. Visit index.html → See mode toggle
2. Select Education → See role selector
3. Select Teacher → Register → Login → Redirect to education_dashboard.html
4. See classes, create class button
5. Back to index.html → See classes, no quiz creation

### Scenario 4: Existing Personal User
1. Login → Redirect to index.html
2. See quiz creation, no mode toggle
3. Dashboard → dashboard.html with personal quizzes

### Scenario 5: Existing Student
1. Login → Redirect to education_dashboard.html
2. See classes
3. Back to index.html → See classes, no quiz creation
4. Dashboard → education_dashboard.html

### Scenario 6: Existing Teacher
1. Login → Redirect to education_dashboard.html
2. See classes
3. Back to index.html → See classes, no quiz creation
4. Dashboard → education_dashboard.html
