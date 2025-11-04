<?php
// Decide response type (AJAX json vs redirect fallback)
$accept = isset($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : '';
$useJson = strpos($accept, 'application/json') !== false;

function respond($ok, $msg) {
  global $useJson;
  if ($useJson) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['ok' => $ok, 'message' => $msg]);
  } else {
    $anchor = $ok ? '#sent-ok' : '#sent-error';
    header('Location: ' . dirname($_SERVER['PHP_SELF']) . '/../..' . '/index.html' . $anchor);
  }
  exit;
}

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'POST') {
  respond(false, 'Neplatná metoda');
}

// Inputs
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$phone = isset($_POST['phone']) ? trim((string)$_POST['phone']) : '';
$message = isset($_POST['message']) ? trim((string)$_POST['message']) : '';
$honeypot = isset($_POST['company']) ? trim((string)$_POST['company']) : '';

// Anti-spam honeypot
if ($honeypot !== '') {
  respond(true, 'Odesláno');
}

if (!$email || $phone === '' || $message === '') {
  respond(false, 'Vyplňte všechna pole');
}

$config = require __DIR__ . '/config.php';

$subject = 'Přihláška k vystavení auta';
$body = "E‑mail: {$email}\n" . "Telefon: {$phone}\n\n" . $message;

// Try PHPMailer first if available, else fallback to mail()
$phpMailerPath = __DIR__ . '/phpmailer/src/PHPMailer.php';
$smtpPath = __DIR__ . '/phpmailer/src/SMTP.php';
$exceptionPath = __DIR__ . '/phpmailer/src/Exception.php';

if (file_exists($phpMailerPath) && file_exists($smtpPath) && file_exists($exceptionPath)) {
  try {
    require $phpMailerPath;
    require $smtpPath;
    require $exceptionPath;

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_pass'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port = (int)$config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->isHTML(false);

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo($email);

    $mail->Subject = $subject;
    $mail->Body = $body;

    $mail->send();
    respond(true, 'Děkujeme, přihláška byla odeslána.');
  } catch (\Throwable $e) {
    // Fall through to mail() below
  }
}

// Fallback: PHP mail()
// Note: Works on most shared hostings where mail() is configured.
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: base64';
$headers[] = 'From: ' . ($config['from_name'] ? '"' . $config['from_name'] . '" ' : '') . '<' . $config['from_email'] . '>';
$headers[] = 'Reply-To: ' . $email;
$headersStr = implode("\r\n", $headers);
$bodyBase64 = base64_encode($body);

$ok = mail($config['to_email'], $encodedSubject, $bodyBase64, $headersStr);
if ($ok) {
  respond(true, 'Děkujeme, přihláška byla odeslána.');
}

respond(false, 'Odeslání selhalo. Zkuste to prosím později.');


