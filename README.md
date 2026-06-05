# Kamal Express Website & API Services

A modern web application for **Kamal Express** featuring React Router path-based routing, a custom build-time static pre-rendering (SSG) system for SEO optimization, and an integrated PHP backend micro-service. It handles secure client booking requests, visa consultancies, general feedback routing, database storage, SMTP notifications, rate-limiting, and spam protection features.

---

## 📁 Repository Structure

The project has been refactored to separate the React client and PHP service, mirroring the target server directory structure:

- **[`/frontend`](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/frontend)**: React + TypeScript + Vite + Tailwind CSS static single page app.
- **[`/api`](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api)**: Slim PHP 4 micro-service utilizing Eloquent ORM and PHPMailer SMTP alerts.
- **[`/public_html`](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/public_html)**: Combined production assembly output compiled from both directories, ready to upload to cPanel.

---

## 🛠️ Local Development Setup

To run and test the codebase locally, execute the following steps:

### 1. Prerequisite Environments
- **Node.js** (v18 or higher recommended)
- **PHP** (v8.1 or higher)
- **MySQL Server** (local port 3306 or similar)

### 2. Dependency Installation
Run the installer at the root directory to install React node modules and PHP Composer packages automatically:
```bash
# Install node packages
npm install

# Install PHP composer packages
cd api
composer install
cd ..
```

### 3. Local Databases
Set up the local MySQL database with credentials `root` and password `forgot`:
```bash
php -f "C:/Users/Ali Raza/.gemini/antigravity/brain/2765a4ef-47e1-4e7a-a582-4ecf3371a3f9/scratch/db_init.php"
```

### 4. Running Dev Servers
Run both frontend and API servers simultaneously:

- **Start PHP API Server**:
  ```bash
  php -S localhost:8000 -t api
  ```
- **Start React Dev Server**:
  ```bash
  npm run dev
  ```
  *(The dev server is configured to proxy all `/api` calls to `http://localhost:8000` automatically)*

---

## 🚀 Assembly & Production Deployment

Reassemble the static assets and backend Slim endpoints into a single directory:
```bash
npm run build
```

This compiles the SPA and copies it along with `/api` folder to `/public_html/`.

### Deployment to cPanel
1. Compress/Zip the contents of `public_html/` folder.
2. Log into cPanel File Manager and upload it directly into the server's `public_html/` root.
3. Access **phpMyAdmin** and import `api/schema.sql` to generate the MySQL table structure.
4. Modify `public_html/api/config.php` to specify your production database credentials and SMTP email settings.

For details on spam filters, rate limiting, and email allocation, check:
👉 **[EMAIL_AND_SPAM_GUIDE.md](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/EMAIL_AND_SPAM_GUIDE.md)**

---

## 🔍 SEO & Pre-rendering (SSG)

During the build phase (`npm run build`), the build orchestrator (`build.js`) executes a static pre-rendering cycle for **31 distinct pathways** (including all primary pages, individual service details, tour packages, destinations, and blog guides).

1. **Crawler Indexability**: Creates physical subdirectories (e.g. `/destinations/united-kingdom/`) and writes a customized `index.html` file into each.
2. **SEO Meta Optimization**: Each page has customized `<title>`, `<meta name="description">`, keywords, and OpenGraph/Twitter card tags injected in the header.
3. **Semantic Fallback Content**: Raw text and structural HTML are written directly inside the `#root` container (hidden with `style="display:none;"` to prevent visual flashes). Search crawlers index this content directly, while the client bundle hydrates and replaces it on load.
4. **Apache Redirections**: A fallback `.htaccess` file ensures direct paths resolve to the React SPA while letting Apache serve static assets and pre-rendered indexes directly.
