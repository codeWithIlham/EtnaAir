#!/bin/bash
# ============================================================
# ETNAir — Script de déploiement Kubernetes
# Usage : bash k8s/deploy.sh
# ============================================================

set -e

echo "=== ETNAir — Déploiement Kubernetes ==="

# 1. Builder l'image Docker de l'API
echo ""
echo ">>> [1/5] Build de l'image Docker..."
docker build -t etnair-api:latest ./backend

# 2. Charger l'image dans le cluster (pour Docker Desktop / minikube)
# Si minikube : décommenter la ligne suivante
# minikube image load etnair-api:latest

# 3. Appliquer les manifests dans l'ordre
echo ""
echo ">>> [2/5] Création du namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo ">>> [3/5] Création des secrets et configmap..."
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

echo ""
echo ">>> [4/5] Déploiement PostgreSQL + MinIO..."
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/minio.yaml

echo ""
echo ">>> Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=ready pod -l app=postgres -n etnair --timeout=120s

echo ""
echo ">>> [5/5] Déploiement de l'API..."
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "=== Déploiement terminé ! ==="
echo ""
echo "Vérifier le statut :"
kubectl get pods -n etnair
echo ""
echo "URL de l'API :"
kubectl get service etnair-api-service -n etnair
