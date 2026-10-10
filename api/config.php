<?php
/**
 * Kamal Express API Configuration
 */

// Database Settings
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'mysql');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'kamalexpresswebsite');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'forgot');
define('DB_CHARSET', getenv('DB_CHARSET') ?: 'utf8mb4');
define('DB_COLLATION', getenv('DB_COLLATION') ?: 'utf8mb4_unicode_ci');
define('DB_PREFIX', getenv('DB_PREFIX') ?: '');

// SMTP Email Settings
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'mail.kamalexpress.com.pk');
define('SMTP_PORT', getenv('SMTP_PORT') ? (int)getenv('SMTP_PORT') : 465); // SSL port: 465
define('SMTP_USER', getenv('SMTP_USER') ?: 'kamalexp');
define('SMTP_PASS', getenv('SMTP_PASS') ?: 'E#EK&^Tdkwgu364t');
define('SMTP_AUTH', getenv('SMTP_AUTH') !== false ? (getenv('SMTP_AUTH') === 'false' ? false : true) : true);
define('SMTP_SECURE', getenv('SMTP_SECURE') ?: 'ssl'); // 'ssl' for port 465

// Recipient & Sender Coordinates
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@kamalexpress.com.pk');
define('FROM_EMAIL', getenv('FROM_EMAIL') ?: 'services@kamalexpress.com.pk');
define('FROM_NAME', getenv('FROM_NAME') ?: 'Kamal Express Services');

// Admin CRM Credentials & Security Settings
define('ADMIN_USERNAME', getenv('ADMIN_USERNAME') ?: 'kamal_admin_crm');
define('ADMIN_PASSWORD_HASH', getenv('ADMIN_PASSWORD_HASH') ?: '$2y$12$YQOgKwym9oc8pyZOk/uDk.pctsaXktqTLXyYzo1Wwj08h.jCUmRWm'); // Default password: 'KE_crm_secure_2026!$'
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'kamal_express_secure_jwt_secret_key_2026_98234');

