# 🚀 Production Deployment Runbook & Operations Guide

## Enterprise Multi-Tier Sports Betting & Agent Exchange Platform

---

## 1. Architecture & Infrastructure Layout

The platform is designed to be deployed either via **Production Docker Compose** (single/multi-node VM) or natively onto **Kubernetes (AWS EKS, GCP GKE, Azure AKS)** behind **Cloudflare Enterprise WAF / SSL**:

```
[ Internet Traffic / Players & Agents ]
                   │
                   ▼ (HTTPS :443 / WSS)
       [ Cloudflare WAF / CDN / DDoS ]
                   │
                   ▼ (TLS Ingress Controller)
  ┌────────────────────────────────────────────────────────┐
  │ Kubernetes Cluster / Docker Production Network         │
  │                                                        │
  │   ├── Player Portal (PWA + Nginx :80) ──> :3001        │
  │   ├── Agent Portal (SPA + Nginx :80)  ──> :3000        │
  │   │                                                    │
  │   ├── Backend Cluster (Node.js API + Socket.io :5000)  │
  │   ├── Matching Engine (FIFO In-Memory Worker)          │
  │   │                                                    │
  │   ├── PostgreSQL 16 (StatefulSet / Aurora Multi-AZ)    │
  │   └── Redis 7 Cluster (In-Memory Orderbook & Pub/Sub)  │
  └────────────────────────────────────────────────────────┘
```

---

## 2. Option A: Fast Production Rollout with Docker Compose

### Step 1: Clone and Configure Environment
```bash
git clone <repository_url> sports-exchange
cd sports-exchange

# Generate production environment file
cp .env.production.example .env.production
```

Edit `.env.production` and configure your secure passwords and secret keys:
```ini
POSTGRES_PASSWORD=your_strong_postgres_password_here
REDIS_PASSWORD=your_strong_redis_password_here
JWT_SECRET=generate_a_secure_64_character_random_hex_string
COMMISSION_RATE=0.02
```

### Step 2: Launch Production Services
```bash
# On Linux / macOS
chmod +x scripts/deploy.sh
./scripts/deploy.sh docker

# On Windows PowerShell
.\scripts\deploy.ps1 -Mode docker
```

Or manually:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### Step 3: Verify Deployment
Run the automated healthcheck script:
```bash
node scripts/healthcheck.js
```

---

## 3. Option B: Cloud-Native Kubernetes (EKS / GKE) Rollout

### Prerequisites:
- A running Kubernetes cluster (v1.26+)
- `kubectl` configured with cluster administrator credentials
- NGINX Ingress Controller & Cert-Manager installed

### Step 1: Update Secrets and Domains
1. Edit `k8s/secrets.yaml` with your production base64/string secrets.
2. Edit `k8s/ingress.yaml` to specify your custom domains (e.g. `exchange.yourdomain.com` and `agent.yourdomain.com`).

### Step 2: Apply All Manifests with Kustomize
```bash
kubectl apply -k k8s/
```

### Step 3: Monitor Rollout Status
```bash
kubectl rollout status deployment/postgres -n sports-exchange
kubectl rollout status deployment/redis -n sports-exchange
kubectl rollout status deployment/backend -n sports-exchange
kubectl rollout status deployment/matching-engine -n sports-exchange
kubectl rollout status deployment/player-portal -n sports-exchange
kubectl rollout status deployment/agent-portal -n sports-exchange
```

### Step 4: Verify Active Ingress & SSL
```bash
kubectl get ingress -n sports-exchange
```

---

## 4. Port Map & Network Access

| Service | Container Internal Port | Production Exposed Port | Description |
| :--- | :--- | :--- | :--- |
| **Player Portal** | `80` | `3001` | PWA Trading Interface with Betfair Back/Lay Ladder |
| **Agent Portal** | `80` | `3000` | Management Dashboard with Downline Tree & Credit Controls |
| **Backend API** | `5000` | `5000` | REST API Endpoints & Real-Time Socket.io Gateway |
| **PostgreSQL 16**| `5432` | `5432` | Primary Database with Double-Entry Ledger Tables |
| **Redis 7** | `6379` | `6379` | In-Memory Order Book State & Pub/Sub Channels |

---

## 5. Security & Production Hardening Checklist

1. **Firewall & Ingress Rule Isolation**:
   - Only expose ports `80` and `443` through your cloud load balancer / Cloudflare reverse proxy.
   - Restrict port `5432` (PostgreSQL) and `6379` (Redis) strictly to internal container networks (`sports_exchange_network` / Kubernetes ClusterIP).
2. **Cloudflare WAF Settings**:
   - Enable DDoS Mitigation (HTTP Flood Protection).
   - Enforce WebSockets support (Cloudflare Dashboard $\rightarrow$ Network $\rightarrow$ WebSockets: Enabled).
   - Set SSL/TLS mode to **Full (Strict)**.
3. **Database Backup Automation**:
   - Schedule automated daily WAL archiving and snapshots using `pg_dump`:
   ```bash
   docker exec -t sports_exchange_postgres_prod pg_dump -U exchange_admin -d sports_exchange -F c -b -v -f /var/lib/postgresql/data/backup_$(date +%Y%m%d_%H%M%S).dump
   ```
4. **Horizontal Pod Autoscaling**:
   - Configured in `k8s/backend.yaml` to scale automatically from 3 up to 15 pod replicas when CPU utilization exceeds 70%.

---

## 6. Seed Accounts Reference

All seeded test accounts come pre-configured with the default password: `password123`

| Role | Username | Initial Credit | Administrative Scope |
| :--- | :--- | :--- | :--- |
| **Level 0 (Global Admin)** | `admin` | 10,000,000 | Platform root, odds stream controls, event settlement |
| **Level 1 (Super Master)** | `supermaster_asia` | 500,000 | Asia Regional Branch |
| **Level 2 (Master)** | `master_mumbai` | 100,000 | Mumbai Agency Group |
| **Level 3 (Agent)** | `agent_vikram` | 25,000 | Retail Cashier Desk |
| **Level 4 (Player)** | `player_rahul` | 10,000 | Retail Trader Account |
| **Level 4 (Player)** | `player_amit` | 10,000 | Retail Trader Account |
