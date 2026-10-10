# Deployment Plan: Kamal Express Website & API Architecture

This document provides the deployment plan for **Kamal Express Website**:
- **Frontend**: Hosted globally on **Cloudflare Pages** (edge CDN, zero server load, instant builds).
- **Backend API Stack**: Hosted on **VPS** managed via **Portainer / Docker Compose** behind a secure **Cloudflare Tunnel (`cloudflared`)**.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client_Browser ["Public Internet / Visitors"]
        Visitor["Visitor / Client Browser"]
    end

    subgraph Cloudflare_Edge ["Cloudflare Global Network"]
        CF_Pages["Cloudflare Pages<br/><b>kamalexpress.com</b><br/>(React 19 + Vite Static Assets)"]
        CF_DNS["Cloudflare DNS / Edge Proxy<br/><b>api.kamalexpress.com</b>"]
        CF_Tunnel["Cloudflare Tunnel (cloudflared)<br/>Zero Open Inbound Ports"]
    end

    subgraph VPS_Docker_Stack ["Portainer / Docker Stack (VPS)"]
        subgraph Docker_Network ["Bridge: kamal_network"]
            API_Container["kamal_api<br/>(PHP 8.3 CLI Slim 4)<br/>Internal Port: 8000"]
            DB_Container["kamal_db<br/>(MySQL 8.0)<br/>Internal Port: 3306 (Not Exposed)"]
        end
    end

    subgraph Internal_AI_Service ["Private AI Microservice"]
        AI_Service["KamalExpress-Agents<br/>(FastAPI / LangGraph)<br/>Port: 8080 (Token Auth)"]
    end

    Visitor -->|Browse Site| CF_Pages
    Visitor -->|API / Inquiries / Chat| CF_DNS
    CF_DNS -->|Encrypted Tunnel| CF_Tunnel
    CF_Tunnel -->|HTTP :8000| API_Container
    API_Container -->|Store Inquiries / Sales / Auth| DB_Container
    API_Container -->|Proxy /chat (X-Website-Token)| AI_Service
```

---

## 1. Frontend: Cloudflare Pages Deployment

### 1.1 Why Cloudflare Pages
- **Instant global performance**: Free automatic SSL, edge caching, zero maintenance.
- **Continuous Deployment (CI/CD)**: Triggers automatically on push to git branch `live-website`.
- **Decoupled**: The VPS only handles backend business logic (DB queries, forms, SMTP, proxying to agents).

### 1.2 Configuration in Cloudflare Pages Dashboard
1. Go to **Cloudflare Dashboard** $\to$ **Compute (Workers & Pages)** $\to$ **Create application** $\to$ **Pages** $\to$ **Connect to Git**.
2. Select repository: `kamal-express-website` (Branch: `live-website`).
3. **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://api.kamalexpress.com` | Base URL for API endpoints (`/inquiry`, `/contact`, `/chat`, `/admin/*`) |

### 1.3 Routing / SPA Fallback Rule (`_redirects` file)
Vite React apps using client-side routing (`react-router-dom`) require an edge rewrite rule so reloading pages like `/services`, `/contact`, or `/admin` doesn't return a 404.
- Create `frontend/public/_redirects`:
  ```text
  /*    /index.html   200
  ```

---

## 2. Backend: VPS Docker Stack via Portainer

Since the frontend is served on Cloudflare Pages, the VPS stack only needs:
1. `kamal_api` (PHP 8.3 Lightweight Slim API container).
2. `kamal_db` (MySQL 8.0 for CRM inquiries, transactions, and users).

The frontend container (`kamal_web` / Nginx) is **not required** on the VPS.

### 2.1 Production Docker Compose (`docker-compose.prod.yml`)
```yaml
version: '3.8'

services:
  api:
    image: kamal-express-api:prod
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: kamal_api
    restart: always
    expose:
      - "8000"
    ports:
      - "127.0.0.1:8000:8000"   # Bound to localhost only (routed via CF Tunnel)
    environment:
      - APP_ENV=production
      - DB_DRIVER=mysql
      - DB_HOST=db
      - DB_NAME=${DB_NAME:-kamalexpresswebsite}
      - DB_USER=${DB_USER:-kamal_user}
      - DB_PASS=${DB_PASS:-kamal_secure_pass_2026}
      - SMTP_HOST=${SMTP_HOST:-mail.kamalexpress.com.pk}
      - SMTP_PORT=${SMTP_PORT:-465}
      - SMTP_USER=${SMTP_USER:-kamalexp}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_AUTH=true
      - SMTP_SECURE=ssl
      - AI_AGENTS_URL=http://host.docker.internal:8080/api/website/chat
      - AI_AGENTS_TOKEN=${AI_AGENTS_TOKEN:-ke_website_secret_token_2026}
    extra_hosts:
      - "host.docker.internal:host-gateway"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - kamal_net

  db:
    image: mysql:8.0
    container_name: kamal_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASS:-root_prod_password_2026}
      MYSQL_DATABASE: ${DB_NAME:-kamalexpresswebsite}
      MYSQL_USER: ${DB_USER:-kamal_user}
      MYSQL_PASSWORD: ${DB_PASS:-kamal_secure_pass_2026}
    volumes:
      - db_data:/var/lib/mysql
      - ./api/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASS:-root_prod_password_2026}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kamal_net

networks:
  kamal_net:
    name: kamal_network

volumes:
  db_data:
    name: kamal_db_data
```

---

## 3. Cloudflare Tunnel Configuration

Cloudflare Tunnel (`cloudflared`) connects the VPS to the Cloudflare edge without exposing any ports on the public firewall.

### 3.1 Public Hostname Routing
In the **Cloudflare Zero Trust Dashboard** $\to$ **Networks** $\to$ **Tunnels** $\to$ Select Tunnel $\to$ **Public Hostname**:

| Subdomain | Domain | Service Type | URL |
| :--- | :--- | :--- | :--- |
| `api` | `kamalexpress.com` | `HTTP` | `localhost:8000` (or `kamal_api:8000` if cloudflared is in docker network) |

### 3.2 CORS Headers on Cloudflare / API
In `api/index.php`, CORS headers already allow origins. When in production, ensure:
- `Access-Control-Allow-Origin: https://kamalexpress.com` (and preview URLs from Pages if testing).
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`.

---

## 4. Frontend API Endpoint Harmonization

In the current frontend codebase, API requests use relative paths (`/api/...`).
To support hosting on Cloudflare Pages (`https://kamalexpress.com`) with the API at `https://api.kamalexpress.com`:

1. **Option A (Recommended: Cloudflare Pages Proxy / Function Route)**:
   - Configure a single rewrite in `_routes.json` or Cloudflare Transform Rule so that `https://kamalexpress.com/api/*` routes to `https://api.kamalexpress.com/*`.
   - **Benefit**: No cross-domain CORS preflight overhead, zero frontend code changes.

2. **Option B (Vite Environment Variable)**:
   - Standardize client fetches using a central helper `getApiUrl(path)`:
     ```ts
     const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
     ```
   - When deployed on Pages, `VITE_API_BASE_URL` points to `https://api.kamalexpress.com`.

---

## 5. Step-by-Step Execution Checklist

| Step | Action | Platform / Tool |
| :---: | :--- | :--- |
| **1** | Commit & push latest `live-website` branch clean updates | Git / GitHub |
| **2** | Add SPA `_redirects` file in `frontend/public/` | Git |
| **3** | Add `docker-compose.prod.yml` optimized for Portainer stack | Git |
| **4** | Connect repository to **Cloudflare Pages** and configure build settings | Cloudflare Dashboard |
| **5** | In Portainer on VPS: create new Stack **"kamal-express-api"** using `docker-compose.prod.yml` | Portainer |
| **6** | In Cloudflare Tunnel: route `api.kamalexpress.com` $\to$ `http://localhost:8000` | Cloudflare Zero Trust |
| **7** | Test live health, form submissions, and support chat | Production Browser |
