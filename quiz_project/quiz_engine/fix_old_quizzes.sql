-- Fix old quizzes that are marked as in_progress but should be completed
-- Run this SQL in your MySQL database (phpMyAdmin or MySQL client)

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Update quizzes
UPDATE quizzes 
SET status = 'completed', 
    score = COALESCE(score, 0)
WHERE quiz_data IS NOT NULL 
  AND quiz_data != '' 
  AND quiz_data != '[]'
  AND total_questions > 0
  AND status = 'in_progress';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the changes
SELECT id, quiz_name, total_questions, score, status, created_at 
FROM quizzes 
ORDER BY created_at DESC;
