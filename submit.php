<?php
// Turnstile-verified Formspree proxy for the Maginnis consultation form.
// Replace TURNSTILE_SECRET below with your Cloudflare Turnstile Secret Key.

$TURNSTILE_SECRET = 'PASTE_YOUR_TURNSTILE_SECRET_KEY_HERE';
$FORMSPREE_URL    = 'https://formspree.io/f/mgaoznpd';

header('Content-Type: application/json');

function fail($status, $message) {
    http_response_code($status);
    echo json_encode(['errors' => [['message' => $message]]]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed.');
}

$token = $_POST['cf-turnstile-response'] ?? '';
if ($token === '') {
    fail(400, 'Verification missing. Please reload and try again.');
}

$verify = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
curl_setopt_array($verify, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'secret'   => $TURNSTILE_SECRET,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$verifyBody = curl_exec($verify);
curl_close($verify);

$verifyData = json_decode($verifyBody, true);
if (!$verifyData || empty($verifyData['success'])) {
    fail(400, 'Verification failed. Please try again or email us directly.');
}

$fields = $_POST;
unset($fields['cf-turnstile-response']);

$ch = curl_init($FORMSPREE_URL);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($fields),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    CURLOPT_TIMEOUT        => 15,
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    fail($status ?: 502, 'Could not deliver your request. Please email us directly.');
}

http_response_code($status);
echo $response;
