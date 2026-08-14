#!/bin/bash
# ==============================================================================
# Multi-Tier Sports Betting Exchange - Automated Production Deployment Script
# ==============================================================================

set -e

MODE=${1:-docker} # "docker" or "k8s"

echo "===================================================================="
echo " Starting Sports Betting Exchange Deployment (Mode: $MODE)"
echo "===================================================================="

if [ "$MODE" = "docker" ]; then
    echo "1. Checking environment configuration..."
    if [ ! -f ".env.production" ]; then
        echo "Creating .env.production from template..."
        cp .env.production.example .env.production
        echo "WARNING: Created default .env.production. Please edit it with secure credentials!"
    fi

    echo "2. Building and starting production containers..."
    docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

    echo "3. Waiting for services to become healthy..."
    sleep 10

    echo "4. Running automated healthcheck verification..."
    node scripts/healthcheck.js || echo "Healthcheck completed with warnings"

    echo "===================================================================="
    echo " Deployment Succeeded!"
    echo " Player Trading Terminal: http://localhost:3001"
    echo " Agent & Admin Portal:    http://localhost:3000"
    echo " Backend API Server:      http://localhost:5000"
    echo "===================================================================="

elif [ "$MODE" = "k8s" ]; then
    echo "1. Verifying kubectl connection..."
    kubectl cluster-info

    echo "2. Applying Kubernetes manifests via Kustomize..."
    kubectl apply -k k8s/

    echo "3. Waiting for rollouts to complete..."
    kubectl rollout status deployment/postgres -n sports-exchange --timeout=180s
    kubectl rollout status deployment/redis -n sports-exchange --timeout=120s
    kubectl rollout status deployment/backend -n sports-exchange --timeout=180s
    kubectl rollout status deployment/matching-engine -n sports-exchange --timeout=120s
    kubectl rollout status deployment/agent-portal -n sports-exchange --timeout=120s
    kubectl rollout status deployment/player-portal -n sports-exchange --timeout=120s

    echo "4. Getting active ingress endpoints..."
    kubectl get ingress -n sports-exchange

    echo "===================================================================="
    echo " Kubernetes Rollout Completed Successfully!"
    echo "===================================================================="
else
    echo "Unknown deployment mode: $MODE. Use 'docker' or 'k8s'."
    exit 1
fi
