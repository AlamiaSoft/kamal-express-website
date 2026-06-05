# Kamal Express - Email Delivery & Anti-Spam Guide

This guide documents the email configurations, anti-spam filters, rate limiting, and hourly email quota management systems implemented for the Kamal Express website.

---

## 📬 Email Configuration

The system uses different email accounts tailored for distinct functions:

| Parameter | Selected Address | Purpose |
| :--- | :--- | :--- |
| **SMTP User / From Address** | `services@kamalexpress.com.pk` | Used to authenticate SMTP connection and send out inquiries. |
| **Admin Receiver** | `admin@kamalexpress.com.pk` | Receives all email notifications of new inquiries and contact forms. |
| **Fallback Channels** | `contact@kamalexpress.com.pk`<br>`customercare@kamalexpress.com.pk`<br>`marketing@kamalexpress.com.pk` | Available for manual replies, promotional alerts, or customer support operations. |

SMTP settings are defined in [api/config.php](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/config.php).

---

## 🛡️ Spam Protection & Quota Safety Layers

To protect the server from spam bots, database flooding, and IP blacklist bans (due to host email rate limits), three security layers are active:

### 1. Honeypot Spam Blocker
- **How it works**: A hidden input field named `website` is embedded in the React forms. Real users do not see this field (styled with `display: none`), but automated spam bots will fill it out.
- **Handling**: If the backend detects that the `website` field is not empty, it immediately short-circuits. It returns a fake success response to trick the bot, but **does not write to the database** and **does not send email notifications**.

### 2. IP Rate Limiting
- **How it works**: Form submissions log the sender's IP address (`ip_address` column).
- **Handling**: The backend counts submissions from the user's connection IP over the last 1 hour. If it exceeds **3 submissions**, the server rejects subsequent submissions with an HTTP `429 Too Many Requests` error.

### 3. Hourly Email Quota (5 Emails/Hour)
- **How it works**: The host has a strict email delivery limit. Sending too many emails causes delivery failures and bouncebacks.
- **Handling**: Before invoking PHPMailer to dispatch an alert, the backend counts how many database records have `email_sent = 1` in the last hour.
- **Bypass**:
  - If the count is **under 5**, the email is sent, and the column is marked `email_sent = 1`.
  - If the count is **5 or more**, the email is skipped. The inquiry is still safely saved in the database (marked `email_sent = 0`) to ensure you do not lose any leads, but no email is dispatched.

---

## 🧪 Local Testing Verification

Verify database and rate limits locally using the following steps:

1. **Verify Database Records**:
   Run the following script to check detail flags:
   ```bash
   php -f scratch/db_check_detailed.php
   ```
2. **Honeypot Trigger Test**:
   Submit a query with a honeypot field filled:
   ```powershell
   Invoke-RestMethod -Method POST -Uri http://localhost:8000/inquiry -Body (@{name='Spam'; email='spam@bot.com'; phone='000'; serviceType='Visa'; website='http://spam.com'} | ConvertTo-Json) -ContentType 'application/json'
   ```
   *Result: Succeeds, but is not saved to the database.*

3. **Rate Limit Test**:
   Send 4 consecutive inquiries from the same client IP.
   *Result: The 4th inquiry fails with `(429) Too Many Requests`.*

---

## 🚀 Production cPanel Upload Instructions

1. **Zip Output**: Zip the contents of the `public_html/` folder.
2. **File Transfer**: Upload and extract the zip file directly into the server's `public_html` folder.
3. **Database Migration**:
   - Access **phpMyAdmin** in your cPanel.
   - Run the updated SQL commands in `public_html/api/schema.sql` to generate the table structure.
4. **Configuration update**:
   - Open `/public_html/api/config.php` in the server editor.
   - Update `DB_NAME`, `DB_USER`, and `DB_PASS` with your MySQL cPanel details.
   - Update `SMTP_PASS` with the password of `services@kamalexpress.com.pk` to activate email delivery.
