<?php
$host = getenv("DB_HOST");
$user = getenv("DB_USER");
$pass = getenv("DB_PASS");
$dbname = getenv("DB_NAME");
$port = getenv("DB_PORT");

// Initialize MySQLi with SSL
$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

$success = mysqli_real_connect(
    $conn,
    $host,
    $user,
    $pass,
    $dbname,
    (int)$port,
    NULL,
    MYSQLI_CLIENT_SSL
);

if (!$success) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . mysqli_connect_error()
    ]));
}
?>
