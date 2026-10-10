-- Database Initialization Script for Kamal Express
-- Run this in your MySQL database (via phpMyAdmin or cPanel MySQL client)

-- 1. Inquiries Table
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `service_type` VARCHAR(100) NOT NULL,
  `destination` VARCHAR(100) NOT NULL,
  `notes` TEXT,
  `admin_notes` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `email_sent` TINYINT(1) DEFAULT 0,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Sales Transactions Table
CREATE TABLE IF NOT EXISTS `sales_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_id` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `serial_number` VARCHAR(100) NOT NULL,
  `services` TEXT NOT NULL, -- Stored as JSON
  `vendor_name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `sector` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(15, 2) NOT NULL,
  `received_amount` DECIMAL(15, 2) NOT NULL,
  `remaining_amount` DECIMAL(15, 2) NOT NULL,
  `collectors_name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending Approval',
  `approval_token` VARCHAR(100) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` VARCHAR(50) DEFAULT 'Staff', -- 'Admin', 'Staff', 'Viewer'
  `status` VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Suspended'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Chat Sessions Table (AI Support Logging & Lead Attribution)
CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `customer_email` VARCHAR(100) DEFAULT NULL,
  `service_interest` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `message_count` INT DEFAULT 0,
  `inquiry_id` INT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Chat Messages Table (Multi-turn AI Assistant Transcripts)
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `content` TEXT NOT NULL,
  `agent_name` VARCHAR(50) DEFAULT 'orchestrator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed Default Admin User
-- Default Credentials:
-- Username: kamal_admin_crm
-- Password: KE_crm_secure_2026!$
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `email`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (
  'kamal_admin_crm', 
  '$2y$12$YQOgKwym9oc8pyZOk/uDk.pctsaXktqTLXyYzo1Wwj08h.jCUmRWm', 
  'System Administrator', 
  'kamal@kamalexpress.com', 
  'Admin', 
  'Active', 
  NOW(), 
  NOW()
)
ON DUPLICATE KEY UPDATE `username`=`username`;
