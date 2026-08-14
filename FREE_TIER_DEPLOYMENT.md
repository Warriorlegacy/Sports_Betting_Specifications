# 🥇 100% Free Deployment Guide ($0 / Month)

This guide walks you step-by-step through deploying the entire **Sports Betting Exchange & Sportsbook Platform** at **$0 / month** using free-tier services.

---

## 🏗️ Architecture & Topology ($0 Budget)

```
[ Internet Users / Mobile & Web Traders ]
                  │
                  ├───> [ Cloudflare Pages / Vercel ] (Frontend React Portals) ── $0/mo
                  │        ├── Player Portal / Sportsbook (PWA)
                  │        └── Agent & Admin Hierarchy Management Portal
                  │
                  └───> [ Render.com Free Web Service ] (Node.js API + Socket.io) ── $0/mo
                           │
                           ├───> [ Neon.tech ] (Serverless PostgreSQL 16) ──────── $0/mo
                           └───> [ Upstash ] (Serverless Redis 7 Pub/Sub) ──────── $0/mo
```

---

## 📋 Step 1: Create Free PostgreSQL 16 Database on Neon.tech

1. Go to [https://neon.tech](https://neon.tech) and sign up with GitHub / Google (Free).
2. Click **Create Project**:
   - **Project Name**: `sports-exchange-db`
   - **Postgres Version**: `16`
   - **Region**: Choose closest to you (e.g. `US East`, `Europe`, `Asia`)
3. Copy your **Connection String** (it looks like this):
   ```text
   postgresql://alex:AbCdEf123456@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. *(Note: When the backend starts up, it automatically creates all double-entry ledger tables and seeds default admin and test accounts!)*

---

## ⚡ Step 2: Create Free Redis 7 on Upstash

1. Go to [https://upstash.com](https://upstash.com) and log in with GitHub (Free).
2. Click **Create Database**:
   - **Name**: `sports-exchange-redis`
   - **Type**: Regional (Free)
   - **Region**: Same general region as Neon (e.g. `us-east-1`)
3. Scroll down to the **Connect** section and select the **`redis://`** URL format.
4. Copy the connection URL:
   ```text
   rediss://default:your_token_here@smooth-zebra-12345.upstash.io:6379
   ```

---

## 🚀 Step 3: Deploy Backend API & Socket.io to Render.com

1. Go to [https://render.com](https://render.com) and sign in.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository (`Sports_Betting_Specifications`).
4. Configure the Web Service settings:
   - **Name**: `sports-exchange-api`
   - **Region**: `Oregon (US West)` or `Frankfurt`
   - **Root Directory**: `services/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Instance Type**: `Free` ($0/mo)

5. Under **Environment Variables**, add:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Render default web port |
   | `DATABASE_URL` | *(Paste Neon Connection String from Step 1)* | Database connection |
   | `REDIS_URL` | *(Paste Upstash Redis URL from Step 2)* | Pub/Sub & order book |
   | `JWT_SECRET` | `generate_any_random_64_character_secret_key_here_123456` | Secure session tokens |
   | `COMMISSION_RATE` | `0.02` | 2% standard exchange commission rake |
   | `SIMULATOR_ENABLED` | `true` | Runs continuous odds updates & ticker |

6. Click **Create Web Service**.
7. Render will build and launch your backend. Once deployed, note down your backend URL (e.g., `https://sports-exchange-api.onrender.com`).

---

## 🌐 Step 4: Deploy Frontends to Vercel or Cloudflare Pages

You have two frontend web apps:
- **Player Portal & Sportsbook**: `services/player-portal`
- **Agent & Master Hierarchy Portal**: `services/agent-portal`

### Deploying Player Portal on Vercel:
1. Go to [https://vercel.com](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Select your GitHub repository.
3. In project configuration:
   - **Project Name**: `sportsbook-player-portal`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`services/player-portal`**.
4. Expand **Environment Variables** and add:
   - **`VITE_API_URL`**: `https://sports-exchange-api.onrender.com` *(Your Render backend URL)*
   - **`VITE_SOCKET_URL`**: `https://sports-exchange-api.onrender.com`
5. Click **Deploy**.

### Deploying Agent Portal on Vercel:
1. Click **Add New...** $\rightarrow$ **Project**.
2. Select the same repository.
3. In project configuration:
   - **Project Name**: `sportsbook-agent-portal`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`services/agent-portal`**.
4. Add Environment Variable:
   - **`VITE_API_URL`**: `https://sports-exchange-api.onrender.com`
   - **`VITE_SOCKET_URL`**: `https://sports-exchange-api.onrender.com`
5. Click **Deploy**.

---

## 🧪 Step 5: Test & Verify Live Deployment

1. Open your Player Portal URL (e.g. `https://sportsbook-player-portal.vercel.app`).
2. Log in using pre-funded quick trader accounts:
   - **Username**: `player_rahul`
   - **Password**: `password123`
3. Try placing a live in-play bet, build a Same-Game Parlay (SGP), open the 2D Shot Map & Visualizer Hub, and test Early Cash-Out!
4. Open your Agent Portal URL (e.g. `https://sportsbook-agent-portal.vercel.app`) to view the downline credit hierarchy and risk monitoring:
   - **Username**: `admin`
   - **Password**: `password123`

---

## 💡 Free-Tier Tips & Best Practices

- **Render Cold Starts**: Render's free tier spins down web services after 15 minutes of inactivity. When a user visits the website, the first request might take ~30-40 seconds to wake up the server.
- **Keep-Alive Cron**: You can set up a free keep-alive monitor on [Cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) pinging `https://your-backend.onrender.com/api/markets` every 10 minutes to prevent sleep.
- **Custom Domains**: Both Cloudflare Pages and Vercel support connecting your own custom `.com` / `.io` domains with automatic free SSL renewal at zero cost.
