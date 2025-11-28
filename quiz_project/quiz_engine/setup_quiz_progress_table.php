<?php
require_once "config.php";

// Create quiz_progress table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS quiz_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id VARCHAR(255) NOT NULL,
    quiz_data LONGTEXT NOT NULL,
    answers LONGTEXT NOT NULL,
    current_index INT DEFAULT 0,
    start_time BIGINT NOT NULL,
    last_saved BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_quiz (user_id, quiz_id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table quiz_progress created successfully or already exists.\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>
