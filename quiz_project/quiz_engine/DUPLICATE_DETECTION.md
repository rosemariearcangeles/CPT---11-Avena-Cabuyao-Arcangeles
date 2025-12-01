# Duplicate Quiz Detection

## ✅ Feature Added!

Your quiz system now detects when you try to retake the same quiz.

## How It Works

1. **When you generate a quiz**, the system checks if you've taken it before
2. **If duplicate found**, shows a warning with:
   - Date you took it
   - Your previous score
   - Option to retake or cancel

3. **If you choose "OK"**, you can retake the quiz
4. **If you choose "Cancel"**, redirects back to homepage

## Example Warning

```
⚠️ This quiz has already been taken!

Taken on: 1/15/2025
Score: 85%

Do you want to retake it?
```

## Technical Details

- Uses MD5 hash of quiz data to detect duplicates
- Compares against all your previous quizzes
- Shows most recent attempt if multiple exist
- Works only for logged-in users

## Files Updated

1. `api/check_duplicate.php` - New API endpoint
2. `save_quiz_helper.js` - Added duplicate check logic

## Testing

1. Login to your account
2. Generate a quiz from a text file
3. Complete the quiz
4. Upload the SAME text file again
5. Generate quiz
6. You'll see the duplicate warning! ⚠️

## Notes

- Only checks for logged-in users
- If not logged in, no duplicate check (quiz not saved anyway)
- Each retake creates a new entry in database
- You can see all attempts in the dashboard

Enjoy! 🎉
