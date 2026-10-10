# 🚢 Kamal Express Website & API — Portainer & Cloudflare Deployment Guide

This guide explains how to deploy **Kamal Express Website**:
1. **Frontend**: Globally distributed on **Cloudflare Pages** (connected directly to GitHub).
2. **Backend API & Database**: Deployed via **Portainer Stack (Git Repository Mode)** on your Hetzner VPS and exposed through your existing **Cloudflare Tunnel** (`api.kamalexpress.com` or `kesys.alamiaconnect.com/api`).
3. **AI Support Assistant**: Proxied automatically through your backend API to the private AI agents stack on port `8085` / `8080`.

---

## 1. Frontend Deployment (Cloudflare Pages)

Because the frontend is a modern React 19 + Vite SPA, deploying it to Cloudflare Pages gives it edge CDN caching, instant loading speeds, automatic SSL, and zero server maintenance.

### Step 1: Connect GitHub to Cloudflare Pages
1. Log in to the **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. In the left navigation, go to **Compute (Workers & Pages)** $\to$ **Create application** $\to$ **Pages** $\to$ **Connect to Git**.
3. Select repository: `AlamiaSoft/kamal-express-website`.
4. Configure the build parameters:
   * **Project name:** `kamal-express-website`
   * **Production branch:** `live-website` (or `main`)
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Root directory:** `frontend`
5. **Environment Variables**:
   Under **Environment variables (production)**, add:
   ```ini
   VITE_API_BASE_URL=https://api.kamalexpress.com
   ```
   *(Or if using your subpath proxy: `https://kamalexpress.com/api`)*
6. Click **Save and Deploy**.

*(Note: The `frontend/public/_redirects` file is already added in the repository so client-side routes like `/services`, `/contact`, `/admin` will reload seamlessly).*

---

## 2. Portainer Stack Setup for Backend (Git Repository Mode)

On your VPS, Portainer will manage the PHP 8.3 API and MySQL 8.0 database containers.

1. Open your **Portainer Dashboard** (e.g. `https://portainer.yourdomain.com`).
2. Select your environment (`local` / `primary`).
3. Click **Stacks** in the left sidebar $\to$ Click **Add stack**.
4. Fill in the Stack details:
   * **Name:** `kamal-website-api`
   * **Build method:** Select **Repository**
   * **Repository URL:** `https://github.com/AlamiaSoft/kamal-express-website.git`
   * **Repository reference:** `refs/heads/live-website`
   * **Compose path:** `docker-compose.prod.yml`
5. **Environment Variables:**
   Under **Environment variables**, supply the database, mail credentials, and internal agent routing:
   ```ini
   # API & Database Ports
   HOST_API_PORT=8000
   DB_NAME=kamalexpresswebsite
   DB_USER=kamal_user
   DB_PASS=kamal_secure_pass_2026
   DB_ROOT_PASS=root_prod_pass_2026

   # Mail (SMTP for inquiries & notifications)
   SMTP_HOST=mail.kamalexpress.com.pk
   SMTP_PORT=465
   SMTP_USER=kamalexp
   SMTP_PASS=E#EK&^Tdkwgu364t

   # AI Agents Integration (Routing to KamalExpress-Agents on host)
   AI_AGENTS_URL=http://host.docker.internal:8085/api/website/chat
   AI_AGENTS_TOKEN=ke_website_secret_token_2026
   ```
6. Click **Deploy the stack**.
   * Portainer pulls the repo, builds the lightweight PHP API image, initializes MySQL with `api/schema.sql`, and starts the services.

---

## 3. Cloudflare Tunnel Configuration (`api.kamalexpress.com.pk`)

Connect your VPS backend API container to Cloudflare Tunnel without exposing any inbound ports on your server firewall.

1. Open **[Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)**.
2. Navigate to **Networks** $\to$ **Tunnels** $\to$ Select your Hetzner Server Tunnel.
3. Under **Public Hostname**, click **Add a public hostname**:
   * **Subdomain:** `api`
   * **Domain:** `kamalexpress.com.pk` (or `kamalexpress.com`)
   * **Path:** (leave blank)
   * **Service Type:** `HTTP`
   * **URL:** `localhost:8001` (or `127.0.0.1:8001`, matching your `HOST_API_PORT`)
4. Under **Additional application settings** $\to$ **HTTP Settings**:
   * **HTTP2 / WebSockets Support:** Enabled
   * **Connect Timeout:** 30s
5. Click **Save hostname**.

---

## 4. Connecting Cloudflare Pages to the API

Now connect the Cloudflare Pages frontend (`https://kamalexpress.com.pk`) to the backend API:

### Option A: Cloudflare Pages Proxy (Recommended — Zero CORS Issues)
In your repository, `frontend/public/_redirects` proxies all `/api/*` requests through Cloudflare directly to your tunnel:
```text
/api/*  https://api.kamalexpress.com.pk/:splat  200
/*      /index.html                             200
```
This ensures calls like `POST https://kamalexpress.com.pk/api/admin/login` work seamlessly without cross-origin preflight requests.

### Option B: Cloudflare Pages Environment Variable
In the Cloudflare Pages Dashboard for `kamal-express-website`:
- Go to **Settings** $\to$ **Environment variables (production)**:
  ```ini
  VITE_API_BASE_URL=https://api.kamalexpress.com.pk
  ```

---

## 4. End-to-End Verification & Health Checks

Once deployed, verify the end-to-end communication:

1. **Backend Health Check:**
   Visit: `https://api.kamalexpress.com/` or test in terminal:
   ```bash
   curl -X POST https://api.kamalexpress.com/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Assalamu Alaikum"}]}'
   ```
   *Should return HTTP 200 with JSON `{ "reply": "..." }` routed from your AI agents stack.*

2. **Public Website Frontend:**
   Visit your Cloudflare Pages domain (or custom domain `https://kamalexpress.com`):
   * Test the floating **AI Support Assistant** widget at the bottom right.
   * Submit a sample inquiry form from the **Contact** / **Services** page and check that it inserts into MySQL and sends confirmation emails.
   * Access the Admin CRM panel at `https://kamalexpress.com/admin` using system administrator credentials.

---

## 5. Summary Matrix

| Service | Hosting Location | Technology | Exposure / Routing |
| :--- | :--- | :--- | :--- |
| **Website Frontend** | Cloudflare Pages | React 19 + Vite | Public Edge CDN (`kamalexpress.com`) |
| **Backend API** | Hetzner VPS (Portainer) | PHP 8.3 CLI / Slim 4 | Cloudflare Tunnel (`api.kamalexpress.com` $\to$ `localhost:8000`) |
| **Database** | Hetzner VPS (Portainer) | MySQL 8.0 | Isolated in Docker bridge `kamal_net` (Not exposed) |
| **AI Agents Platform** | Hetzner VPS (Portainer) | Python / FastAPI / LangGraph | Internal `http://host.docker.internal:8085` + `X-Website-Token` |
