# Implementation Plan: PHP API Integration for Form Submissions & Emails

This plan outlines the design and integration of server-side PHP API endpoints with the React Single Page Application (SPA). This will enable saving inquiries and contact form submissions on the server and sending email notifications to the admin, while preserving the static hosting compatibility of the React frontend on cPanel.

---

## User Review Required

> [!IMPORTANT]
> - **Folder Structure Refactoring**: The project structure will be refactored to cleanly separate the frontend and backend codebase:
>   - `/frontend`: Holds the React SPA code.
>   - `/api`: Holds the Slim PHP backend code.
>   - `/public_html`: A root output directory that compiles the frontend and copies the API code together, perfectly mirroring the cPanel server structure for direct upload.
> - **Database choice**: MySQL will be used to store inquiries securely. A schema initialization script (`api/schema.sql`) will be provided to setup the tables in cPanel.
> - **Email Deliverability**: SMTP authentication (via PHPMailer) will be configured in `api/config.php` using host email accounts to ensure high deliverability and prevent messages from landing in spam folders.

---

## Architecture Decision: Slim Framework 4 + Eloquent ORM

We are using **Slim Framework 4** for micro-routing and **Eloquent ORM** for database interaction, along with **PHPMailer** for SMTP support:
1. **Repository Layout Refactoring**: To support a robust deployment workflow, the repository will be split into isolated `/frontend` and `/api` modules. The build script will compile the SPA and bundle `/api` under a single root `/public_html` directory, ready to copy to cPanel.
2. **Stable Databases & Delivery**: Storing submissions in MySQL (via Eloquent migrations or direct schema initialization) ensures durability. Direct SMTP routing (via PHPMailer) provides reliable message delivery.

---

## Technical Details: MySQL & SMTP Email Integration

### 1. Database Schema
We will create a MySQL database named `kamal_express_db` (or similar) containing a unified table to persist submissions:
- **`inquiries` table**:
  - `id` (INT, Primary Key, Auto Increment)
  - `reference_id` (VARCHAR, Unique reference ticket like `KE-2026-XXXX`)
  - `name` (VARCHAR, Applicant Name)
  - `email` (VARCHAR, Email)
  - `phone` (VARCHAR, Contact Phone)
  - `service_type` (VARCHAR, Visa consultancy, Ticketing, etc.)
  - `destination` (VARCHAR, Country, City, or "General Contact Message")
  - `notes` (TEXT, Special instructions or email message)
  - `date_logged` (TIMESTAMP, default CURRENT_TIMESTAMP)
  - `status` (VARCHAR, default 'Pending')

---

## Proposed Changes

### Repository Refactoring & Build Integration

We will reorganize the codebase to isolate the frontend code and the API code, creating a build system to combine them under `/public_html`.

#### [NEW] [package.json](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/package.json)
- The orchestrating package.json in the repository root. Contains scripts to trigger commands inside `/frontend`:
  - `"dev"`: Runs the React frontend development server (`npm run dev --prefix frontend`).
  - `"build"`: Compiles the React frontend and executes `build.js` to compile the combined public_html output.
  - `"postinstall"`: Runs `npm install` inside `/frontend` automatically when running `npm install` at the root.

#### [NEW] [build.js](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/build.js)
- A Node.js compilation utility that runs after `npm run build` in the frontend.
- Creates the root `/public_html` directory.
- Copies the compiled frontend assets from `/frontend/dist` into `/public_html`.
- Copies the `/api` directory (including `vendor/`, source files, configs, and router entrypoint, but excluding development files) into `/public_html/api`.

#### [NEW] [frontend/](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/frontend)
- Move all existing React SPA codebase directories (`src/`, `assets/`, `index.html`, config files) into this new subfolder.

---

### PHP API Backend

We will add a new `/api` directory in the repository root containing the Slim app, composer dependencies, database initialization, and controller files. This matches its destination `/api` subfolder inside cPanel's `public_html` directory.

#### [NEW] [composer.json](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/composer.json)
- Outlines dependencies for the PHP project:
  - `slim/slim`: "^4.12"
  - `slim/psr7`: "^1.6"
  - `illuminate/database`: "^11.0"
  - `phpmailer/phpmailer`: "^6.9"
- Enables PSR-4 autoloading for directory `/src` namespace `App\`.

#### [NEW] [index.php](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/index.php)
- Slim app entrypoint.
- Handles initialization of Eloquent Database Capsule Manager.
- Registers Slim middleware (including routing, body parsing, and error handlers).
- Defines API routes:
  - `POST /inquiry`: Handles visa & tour package inquiries.
  - `POST /contact`: Handles contact form messages.

#### [NEW] [config.php](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/config.php)
- Declares configuration constants for Database credentials and SMTP configuration details.

#### [NEW] [Inquiry.php](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/src/Models/Inquiry.php)
- Eloquent Model representing the `inquiries` table. Configured to disable automatic Laravel timestamps if desired, or handle standard column mappings.

#### [NEW] [FormController.php](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/src/Controllers/FormController.php)
- Controller processing HTTP POST requests.
- Validates the incoming JSON request payloads.
- Uses Eloquent Model calls (e.g. `Inquiry::create(...)`) to insert data into MySQL.
- Invokes PHPMailer to send email alerts to the admin mailbox.
- Formats success/error JSON responses.

#### [NEW] [.htaccess](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/.htaccess)
- Performs standard URL rewriting inside `/api` to route all incoming API endpoints to `/api/index.php`.

#### [NEW] [schema.sql](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/api/schema.sql)
- SQL definitions to initialize the `inquiries` database table structure.

---

### React Frontend

We will update form submissions to fetch our new PHP endpoints.

#### [MODIFY] [InquiryModal.tsx](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/src/components/InquiryModal.tsx)
- Modify `handleSubmit` to perform a `fetch` POST request to `/api/inquiry` with the inquiry details.
- Store the successfully returned ticket details in local state and client `localStorage` (so the user can still track their past inquiries locally).
- Handle HTTP errors gracefully by showing user-friendly messages.

#### [MODIFY] [ContactView.tsx](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/src/components/ContactView.tsx)
- Update `handleSubmit` to send a POST request to `/api/contact`.
- Display a success message upon successfully receiving a `200 OK` JSON response.

---

## Verification Plan

### Automated/Local Tests
Since we are running locally under a Node/Vite development server (port 3000), PHP scripts cannot run directly without a PHP interpreter.
- We will test the API scripts using a local PHP server during dev:
  ```bash
  php -S localhost:8000 -t api
  ```
- Alternatively, we can use a reverse proxy or configure Vite's dev server proxy inside [vite.config.ts](file:///e:/ali/ali-work/Clients/15-KamalExpress/kamal-express-website/vite.config.ts) to forward `/api/` calls to the PHP local server:
  ```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
  ```

### Manual Verification
- Deploy the compiled build and the PHP files to a staging subdomain/cPanel folder.
- Run the queries in `schema.sql` to initialize the database table.
- Submit inquiries and contact forms and verify:
  1. A success dialog displays on the frontend.
  2. The ticket is inserted successfully into the MySQL database table (verified by running a SQL select query).
  3. An email notification is successfully received by the administrator email address.
  4. Database connection errors (if database credentials are changed to be invalid) are handled gracefully by returning an appropriate HTTP 500 error code with a JSON error payload, without crashing the frontend.
