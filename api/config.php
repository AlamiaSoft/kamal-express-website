<?php
/**
 * Kamal Express API Configuration
 */

// Database Settings
define('DB_DRIVER', 'mysql');
define('DB_HOST', 'localhost');
define('DB_NAME', 'kamalexpresswebsite');
define('DB_USER', 'root');
define('DB_PASS', 'forgot');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATION', 'utf8mb4_unicode_ci');
define('DB_PREFIX', '');

// SMTP Email Settings
define('SMTP_HOST', 'mail.kamalexpress.com.pk');
define('SMTP_PORT', 465); // SSL port: 465
define('SMTP_USER', 'kamalexp');
define('SMTP_PASS', 'E#EK&^Tdkwgu364t');
define('SMTP_AUTH', true);
define('SMTP_SECURE', 'ssl'); // 'ssl' for port 465

// Recipient & Sender Coordinates
define('ADMIN_EMAIL', 'admin@kamalexpress.com.pk');
define('FROM_EMAIL', 'services@kamalexpress.com.pk');
define('FROM_NAME', 'Kamal Express Services');

// Admin CRM Credentials & Security Settings
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$12$YoyjGD.tEoRPWJYENjvGwODdyEGtDDrYbhSDZZBvjJ4ijIil8tAfO'); // Default password: 'kamal123'
define('JWT_SECRET', 'kamal_express_secure_jwt_secret_key_2026_98234');
