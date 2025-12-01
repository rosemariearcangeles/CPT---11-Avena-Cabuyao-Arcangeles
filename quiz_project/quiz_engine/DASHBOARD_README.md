# Dashboard Setup Guide

## Database Setup

Run the following SQL to create the quizzes table:

```sql
-- Copy and paste the contents of database_setup.sql into your database
```

Or run directly:
```bash
mysql -u your_username -p your_database < database_setup.sql
```

## Features

### ✅ Implemented
- **User Authentication**: Secure login/logout with session management
- **Quiz Storage**: Save quiz data with user association
- **Dashboard Overview**: View total quizzes, completed count, and average score
- **Quiz Management**: View, continue, and delete quizzes
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean design matching your website theme

### 📊 Dashboard Sections
1. **Overview**: Quick stats and recent activity
2. **My Quizzes**: Complete list of all saved quizzes

## API Endpoints

### GET `/api/get_quizzes.php`
Fetches all quizzes for the logged-in user.

**Response:**
```json
{
  "success": true,
  "quizzes": [
    {
      "id": 1,
      "quiz_name": "Math Quiz",
      "total_questions": 10,
      "score": 8,
      "status": "completed",
      "created_at": "2025-01-15 10:30:00"
    }
  ]
}
```

### POST `/api/save_quiz.php`
Saves a new quiz.

**Request:**
```json
{
  "quiz_name": "Science Quiz",
  "quiz_data": {...},
  "total_questions": 15,
  "score": null,
  "status": "in_progress"
}
```

### POST `/api/update_quiz.php`
Updates quiz progress/score.

**Request:**
```json
{
  "quiz_id": 1,
  "score": 12,
  "status": "completed"
}
```

### POST `/api/delete_quiz.php`
Deletes a quiz.

**Request:**
```json
{
  "quiz_id": 1
}
```

## Integration with Quiz Generation

To integrate with your quiz generation system, add this code after generating a quiz:

```javascript
// After quiz is generated
async function saveQuizToDatabase(quizData) {
    const response = await fetch('api/save_quiz.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quiz_name: 'Generated Quiz',
            quiz_data: quizData,
            total_questions: quizData.length,
            status: 'in_progress'
        })
    });
    
    const result = await response.json();
    if (result.success) {
        console.log('Quiz saved with ID:', result.quiz_id);
    }
}

// When quiz is completed
async function completeQuiz(quizId, score, totalQuestions) {
    await fetch('api/update_quiz.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quiz_id: quizId,
            score: score,
            status: 'completed'
        })
    });
}
```

## Security Features

- ✅ Session-based authentication
- ✅ User ID verification on all API calls
- ✅ SQL injection prevention with prepared statements
- ✅ Foreign key constraints for data integrity
- ✅ CSRF protection (via existing auth.js)

## Styling

The dashboard uses your existing color scheme:
- Primary: `#6366f1` (Indigo)
- Secondary: `#ec4899` (Pink)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)

All styles are in `css/dashboard.css` and can be customized to match your exact preferences.

## Notes

- The dashboard automatically redirects to login if user is not authenticated
- All quiz data is stored per user (isolated by user_id)
- Deleting a user will cascade delete all their quizzes
- Quiz data is stored as JSON in the `quiz_data` column for flexibility
