<?php
// Simple native database and PHP diagnostics script
// Visit: https://kamalexpress.com.pk/api/test_db.php?secret=kamal_test_db_2026

$secret = isset($_GET['secret']) ? $_GET['secret'] : '';
if ($secret !== 'kamal_test_db_2026') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Unauthorized access.']);
    exit;
}

header('Content-Type: application/json');

$diagnostics = [];
$diagnostics['php_version'] = PHP_VERSION;
$diagnostics['extensions']['pdo'] = extension_loaded('pdo') ? 'YES' : 'NO';
$diagnostics['extensions']['pdo_mysql'] = extension_loaded('pdo_mysql') ? 'YES' : 'NO';

// Load config.php
$config_path = __DIR__ . '/config.php';
if (!file_exists($config_path)) {
    $diagnostics['config_file'] = 'MISSING';
    echo json_encode($diagnostics, JSON_PRETTY_PRINT);
    exit;
}

$diagnostics['config_file'] = 'FOUND';
require_once $config_path;

// Check defined constants
$diagnostics['config_constants'] = [
    'DB_DRIVER' => defined('DB_DRIVER') ? DB_DRIVER : 'UNDEFINED',
    'DB_HOST' => defined('DB_HOST') ? DB_HOST : 'UNDEFINED',
    'DB_NAME' => defined('DB_NAME') ? DB_NAME : 'UNDEFINED',
    'DB_USER' => defined('DB_USER') ? DB_USER : 'UNDEFINED',
    // Do not print password for security, just check if set
    'DB_PASS_SET' => defined('DB_PASS') && DB_PASS !== '' ? 'YES' : 'NO'
];

if (!extension_loaded('pdo') || !extension_loaded('pdo_mysql')) {
    $diagnostics['db_test'] = 'FAILED: PDO/pdo_mysql extensions missing';
    echo json_encode($diagnostics, JSON_PRETTY_PRINT);
    exit;
}

// Test Native PDO connection
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $diagnostics['db_connection'] = 'SUCCESS';
    
    // Check if tables exist
    $tables = ['inquiries', 'sales_transactions', 'users'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
            $exists = $stmt->rowCount() > 0;
            $diagnostics['tables'][$table]['exists'] = $exists ? 'YES' : 'NO';
            if ($exists) {
                // Get count
                $countStmt = $pdo->query("SELECT COUNT(*) as count FROM `{$table}`");
                $countRow = $countStmt->fetch();
                $diagnostics['tables'][$table]['row_count'] = intval($countRow['count']);
            }
        } catch (Exception $e) {
            $diagnostics['tables'][$table]['error'] = $e->getMessage();
        }
    }
} catch (Exception $e) {
    $diagnostics['db_connection'] = 'FAILED: ' . $e->getMessage();
}

echo json_encode($diagnostics, JSON_PRETTY_PRINT);
