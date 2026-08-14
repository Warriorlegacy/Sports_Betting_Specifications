# ==============================================================================
# Multi-Tier Sports Betting Exchange - Automated Production Deployment Script (PowerShell)
# ==============================================================================

param (
    [string]$Mode = "docker" # "docker" or "k8s"
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Starting Sports Betting Exchange Deployment (Mode: $Mode)" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

if ($Mode -eq "docker") {
    Write-Host "1. Checking environment configuration..." -ForegroundColor Yellow
    if (-not (Test-Path ".env.production")) {
        Write-Host "Creating .env.production from template..." -ForegroundColor Yellow
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "WARNING: Created default .env.production. Please edit it with secure credentials!" -ForegroundColor Magenta
    }

    Write-Host "2. Building and starting production containers..." -ForegroundColor Yellow
    docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

    Write-Host "3. Waiting for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    Write-Host "4. Running automated healthcheck verification..." -ForegroundColor Yellow
    try {
        node scripts/healthcheck.js
    } catch {
        Write-Host "Healthcheck script encountered an error: $_" -ForegroundColor Red
    }

    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host " Deployment Succeeded!" -ForegroundColor Green
    Write-Host " Player Trading Terminal: http://localhost:3001" -ForegroundColor Green
    Write-Host " Agent & Admin Portal:    http://localhost:3000" -ForegroundColor Green
    Write-Host " Backend API Server:      http://localhost:5000" -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Green
}
elseif ($Mode -eq "k8s") {
    Write-Host "1. Verifying kubectl connection..." -ForegroundColor Yellow
    kubectl cluster-info

    Write-Host "2. Applying Kubernetes manifests via Kustomize..." -ForegroundColor Yellow
    kubectl apply -k k8s/

    Write-Host "3. Waiting for rollouts to complete..." -ForegroundColor Yellow
    kubectl rollout status deployment/postgres -n sports-exchange --timeout=180s
    kubectl rollout status deployment/redis -n sports-exchange --timeout=120s
    kubectl rollout status deployment/backend -n sports-exchange --timeout=180s
    kubectl rollout status deployment/matching-engine -n sports-exchange --timeout=120s
    kubectl rollout status deployment/agent-portal -n sports-exchange --timeout=120s
    kubectl rollout status deployment/player-portal -n sports-exchange --timeout=120s

    Write-Host "4. Getting active ingress endpoints..." -ForegroundColor Yellow
    kubectl get ingress -n sports-exchange

    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host " Kubernetes Rollout Completed Successfully!" -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Green
}
else {
    Write-Host "Unknown deployment mode: $Mode. Use 'docker' or 'k8s'." -ForegroundColor Red
    exit 1
}
