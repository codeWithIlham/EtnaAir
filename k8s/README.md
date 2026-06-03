# ETNAir — Kubernetes Deployment

## Prérequis
- kubectl configuré sur le cluster
- NGINX Ingress Controller installé
- cert-manager installé (pour TLS)

## Déploiement complet — Application

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yml

# 2. Base de données PostgreSQL
kubectl apply -f k8s/postgres.yml
kubectl wait --for=condition=ready pod -l app=postgres -n etnair --timeout=60s

# 3. MinIO (stockage images)
kubectl apply -f k8s/minio.yaml

# 4. API backend (avec HPA)
kubectl apply -f k8s/api.yml

# 5. Frontend React (avec HPA)
kubectl apply -f k8s/frontend.yml

# 6. Ingress TLS
kubectl apply -f k8s/ingress.yml

# 7. Backup automatique (CronJob)
kubectl apply -f k8s/backup-cronjob.yml
```

## Portainer (interface de gestion)

```bash
kubectl apply -f k8s/portainer.yml
# Accès : http://<NODE_IP>:30900
```

## GitLab CI/CD Runner

```bash
# 1. Remplacer REMPLACER_PAR_VOTRE_TOKEN_GITLAB dans gitlab-runner.yml
# 2. Déployer le runner
kubectl apply -f k8s/gitlab-runner.yml

# Vérifier l'enregistrement
kubectl logs deployment/gitlab-runner -n gitlab
```

## Vérifications
```bash
kubectl get pods -n etnair        # Pods de l'application
kubectl get hpa -n etnair         # Autoscalers
kubectl get ingress -n etnair     # Ingress
kubectl get cronjobs -n etnair    # Backup CronJobs
kubectl get pods -n portainer     # Portainer
kubectl get pods -n gitlab        # GitLab Runner
```

## Autoscaling (HPA)
| Service  | Min | Max | CPU trigger |
|----------|-----|-----|-------------|
| API      | 2   | 6   | 70%         |
| Frontend | 2   | 4   | 75%         |

## URLs publiques
- Frontend : https://app.etnair.com
- API : https://api.etnair.com
- Swagger : https://api.etnair.com/api-docs
- Portainer : http://NODE_IP:30900

## Tests de charge K6
```bash
# Smoke test (validation rapide)
k6 run k6/smoke-test.js

# Load test (test de charge complet)
k6 run k6/load-test.js

# Avec une URL spécifique
k6 run --env BASE_URL=https://api.etnair.com k6/load-test.js
```
