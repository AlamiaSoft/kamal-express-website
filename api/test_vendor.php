<?php
// Standalone script to test vendor files integrity
// Visit: https://kamalexpress.com.pk/api/test_vendor.php?secret=kamal_test_vendor_2026

$secret = isset($_GET['secret']) ? $_GET['secret'] : '';
if ($secret !== 'kamal_test_vendor_2026') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Unauthorized access.']);
    exit;
}

header('Content-Type: application/json');

$results = [];
$results['php_version'] = PHP_VERSION;

$autoload_path = __DIR__ . '/vendor/autoload.php';
$results['autoload_file']['exists'] = file_exists($autoload_path) ? 'YES' : 'NO';
if ($results['autoload_file']['exists'] === 'YES') {
    $results['autoload_file']['readable'] = is_readable($autoload_path) ? 'YES' : 'NO';
}

$files_to_check = [
    'vendor/autoload.php',
    'vendor/composer/autoload_real.php',
    'vendor/composer/autoload_static.php',
    'vendor/composer/autoload_psr4.php',
    'vendor/composer/autoload_files.php',
    'vendor/symfony/polyfill-mbstring/bootstrap.php',
    'vendor/illuminate/collections/functions.php',
    'vendor/illuminate/collections/helpers.php',
    'vendor/symfony/clock/Resources/now.php',
    'vendor/symfony/translation/Resources/functions.php',
    'vendor/illuminate/support/functions.php',
    'vendor/illuminate/support/helpers.php',
    'vendor/nikic/fast-route/src/functions.php',
    'vendor/ralouphie/getallheaders/src/getallheaders.php'
];

foreach ($files_to_check as $file) {
    $full_path = __DIR__ . '/' . $file;
    $exists = file_exists($full_path);
    $results['integrity'][$file]['exists'] = $exists ? 'YES' : 'NO';
    if ($exists) {
        $results['integrity'][$file]['readable'] = is_readable($full_path) ? 'YES' : 'NO';
        $results['integrity'][$file]['size'] = filesize($full_path);
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
