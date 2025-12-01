-- Simple quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_name VARCHAR(255) DEFAULT 'Untitled Quiz',
    quiz_data TEXT,
    total_questions INT DEFAULT 0,
    score INT DEFAULT NULL,
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
