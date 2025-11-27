<?php
// InfinityFree MySQL Settings
$host = "sql213.infinityfree.com";
$user = "if0_40535178";
$pass = "Doomereternal1";
$dbname = "if0_40535178_quiz_engine_db";

// Create MySQL connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>
