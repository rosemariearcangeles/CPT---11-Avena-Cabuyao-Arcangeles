# Debug Steps - Why No Quizzes Show

## Step 1: Check Database & Session

Open in browser: `http://your-site/test_db.php`

This will show:
- ✅ Are you logged in?
- ✅ Does the quizzes table exist?
- ✅ How many quizzes are in the database?
- ✅ Sample quiz data

## Step 2: Check Browser Console

1. Open dashboard.html
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for errors

Common issues:
- "Failed to load quizzes" = API problem
- "Not authenticated" = Not logged in
- Network errors = File path issues

## Step 3: Check Network Tab

1. F12 → Network tab
2. Refresh dashboard
3. Look for `get_quizzes.php` request
4. Click it and check:
   - Status: Should be 200
   - Response: Should show quiz data

## Step 4: Manual Database Check

Run this SQL in your database:

```sql
-- Check if table exists
SHOW TABLES LIKE 'quizzes';

-- Count all quizzes
SELECT COUNT(*) FROM quizzes;

-- See all quizzes
SELECT * FROM quizzes;
```

## Step 5: Test Quiz Save

1. Open browser console (F12)
2. Go to quiz.html (after generating a quiz)
3. In console, type:
```javascript
localStorage.getItem('current_quiz_id')
```
4. Should show a number (quiz ID) or null

## Common Problems & Solutions

### Problem 1: Table doesn't exist
**Solution:** Run `database_setup.sql`

### Problem 2: Quiz not saving
**Check:**
- Is `save_quiz_helper.js` loaded in quiz.html?
- Check console for errors
- Verify you're logged in

### Problem 3: API returns empty
**Check:**
- File path: `api/get_quizzes.php` exists?
- Database connection in `config.php`
- User ID in session

### Problem 4: CORS or 404 errors
**Solution:** Check file paths are correct

## Quick Fix Test

Add this to dashboard.js temporarily (after line 1):

```javascript
console.log('Dashboard loaded');

// Add after loadDashboardData() function
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    try {
        const response = await fetch('api/get_quizzes.php');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Data received:', data);
        
        // ... rest of function
    }
}
```

This will show exactly what's happening in the console.

## Need More Help?

Send me the output from:
1. `test_db.php` in browser
2. Browser console errors
3. Network tab response from `get_quizzes.php`
