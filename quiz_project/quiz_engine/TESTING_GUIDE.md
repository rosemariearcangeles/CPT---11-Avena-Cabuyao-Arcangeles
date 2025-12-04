# Testing Guide for Bug Fixes

## Quick Test Scenarios

### 1. Navbar Session Persistence Test

**Test Steps:**
1. Open `index.html` in browser
2. Click "Login" button
3. Login with valid credentials
4. Verify navbar shows user menu (not login/register buttons)
5. Navigate to About page
6. Navigate to Service page
7. Navigate back to Home
8. **Expected:** User menu remains visible on all pages

**Test Logout:**
1. Click user menu dropdown
2. Click "Logout"
3. Navigate to different pages
4. **Expected:** Login/Register buttons visible on all pages

---

### 2. Personal Mode Dashboard Test

**Test Personal User:**
1. Create/login with personal account (not student/teacher)
2. Navigate to `dashboard.html`
3. **Expected:** Dashboard loads successfully
4. **Expected:** Can see personal quizzes

**Test Education User:**
1. Login with student or teacher account
2. Try to access `dashboard.html` directly
3. **Expected:** Automatically redirected to `education_dashboard.html`

---

### 3. Education Mode - Teacher Tests

**Test Create Class:**
1. Login as teacher
2. Go to `education_dashboard.html`
3. **Expected:** See "No Classes Created Yet" message with create button
4. Click "Create Class" button
5. **Expected:** Modal opens
6. Enter class name: "Test Class 101"
7. Enter description: "Test Description"
8. Click "Create Class"
9. **Expected:** Alert shows "Class created! Code: XXXXXX"
10. **Expected:** Class appears in the list

**Test Empty State:**
1. Login as new teacher (no classes)
2. Go to `education_dashboard.html`
3. **Expected:** See empty state with:
   - 📚 icon
   - "No Classes Created Yet" heading
   - "Create your first class to start teaching!" message
   - "Create Class" button

---

### 4. Education Mode - Student Tests

**Test Join Class:**
1. Login as student
2. Go to `education_dashboard.html`
3. **Expected:** See "No Classes Joined Yet" message with join button
4. Click "Join Class" button
5. **Expected:** Modal opens
6. Enter valid class code (from teacher)
7. Click "Join Class"
8. **Expected:** Alert shows "Successfully joined class!"
9. **Expected:** Class appears in the list

**Test Invalid Class Code:**
1. Click "Join Class"
2. Enter invalid code: "XXXXXX"
3. Click "Join Class"
4. **Expected:** Alert shows "Invalid class code"

**Test Empty State:**
1. Login as new student (no classes)
2. Go to `education_dashboard.html`
3. **Expected:** See empty state with:
   - 🎓 icon
   - "No Classes Joined Yet" heading
   - "Join a class using the code provided by your teacher." message
   - "Join Class" button

---

## Browser Console Checks

### Expected Console Logs:

**On Login:**
```
Auth check: {loggedIn: true, username: "...", role: "..."}
```

**On Create Class Click:**
```
Create class button clicked
Create class form submitted
Create class response: {success: true, class_code: "...", class_id: ...}
```

**On Join Class Click:**
```
Join class button clicked
Join class form submitted
Join class response: {success: true}
```

### Error Indicators:

**If you see these, there's a problem:**
```
Error checking auth status: ...
Create class modal not found
Join class modal not found
Failed to create class
Failed to join class
```

---

## Common Issues & Solutions

### Issue: Navbar shows wrong state
**Solution:** 
- Clear browser cache
- Clear sessionStorage: `sessionStorage.clear()`
- Refresh page

### Issue: Can't create/join class
**Solution:**
- Check browser console for errors
- Verify you're logged in
- Check database connection
- Verify API files exist in `/api/` folder

### Issue: Redirected to wrong dashboard
**Solution:**
- Check user role in database
- Clear cache and re-login
- Verify check_auth.php is working

### Issue: Empty state not showing
**Solution:**
- Verify no classes exist in database
- Check API response in Network tab
- Verify education_dashboard.js is loaded

---

## Database Verification

### Check User Roles:
```sql
SELECT id, username, role FROM users;
```

**Expected roles:**
- `personal` or `NULL` - Personal users
- `student` - Student users
- `teacher` - Teacher users

### Check Classes:
```sql
SELECT * FROM classes;
```

### Check Class Members:
```sql
SELECT * FROM class_members;
```

---

## Quick Fix Commands

### Clear All Sessions (Browser Console):
```javascript
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Force Auth Refresh (Browser Console):
```javascript
if (window.navbarInstance) {
  window.navbarInstance.updateAuthUI();
}
```

### Check Current Auth State (Browser Console):
```javascript
console.log(JSON.parse(sessionStorage.getItem('authState')));
```

---

## Test Accounts Setup

### Create Test Accounts:

**Personal User:**
- Username: `personal_user`
- Role: `personal` or `NULL`

**Teacher:**
- Username: `teacher_user`
- Role: `teacher`

**Student:**
- Username: `student_user`
- Role: `student`

---

## Success Criteria

✅ All navbar states persist across page navigation
✅ Personal users can access personal dashboard
✅ Education users redirected to education dashboard
✅ Teachers can create classes
✅ Students can join classes
✅ Empty states display correctly
✅ Error messages are clear and helpful
✅ No console errors during normal operation

---

## Reporting Issues

If you find a bug:
1. Note the exact steps to reproduce
2. Copy any console errors
3. Note your user role
4. Check Network tab for failed requests
5. Document expected vs actual behavior
