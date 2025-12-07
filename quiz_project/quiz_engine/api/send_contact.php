<?php
header('Content-Type: application/json; charset=utf-8');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Read JSON body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    // Fallback to form-encoded POST
    $data = $_POST;
}

$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : '(No subject)';
$message = isset($data['message']) ? trim($data['message']) : '';

// Basic validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, email and message are required']);
    exit;
}

// Recipient address requested by user
$to = 'godwinvincentavena@gmail.com';

// Build email headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = 'From: ' . $name . ' <' . $email . '>';
$headers[] = 'Reply-To: ' . $email;

$body = "You have received a new message from the contact form on the site:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Subject: $subject\n\n";
$body .= "Message:\n$message\n";

$mail_sent = false;

// Try using mail() if available
if (function_exists('mail')) {
    $mail_sent = mail($to, $subject, $body, implode("\r\n", $headers));
}

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Message sent']);
} else {
    // Still return success=false; but provide a helpful message
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Check server mail configuration.']);
}

?>
