# ETNAir — Guide d'utilisation

> Plateforme de location de logements en ligne — Projet ETNA C2W-CBI1

---

## 🚀 Démarrage rapide

### Lancer l'application

```bash
git clone <repo>
cd p2b
docker compose up --build -d
```

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | http://localhost | Application web |
| 📄 API Swagger | http://localhost:3000/api-docs | Documentation API |
| 🐘 pgAdmin | http://localhost:5050 | Interface PostgreSQL |
| 🗂 MinIO | http://localhost:9001 | Stockage d'images |
| 📊 Prometheus | http://localhost:9090 | Métriques |
| 📈 Grafana | http://localhost:3001 | Dashboards (admin/etnair2026) |

---

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|------|
| 👑 Admin | admin@etnair.com | password |
| 🏠 Hôte (James) | james.carter@email.com | password |
| 🏠 Hôte (Sarah) | sarah.wilson@email.com | password |
| 👤 Voyageur (Oliver) | oliver.davis@email.com | password |
| 👤 Voyageur (Emma) | emma.martin@email.com | password |

---

## 🔍 Fonctionnalités principales

### 1. Recherche de logements

1. Cliquez sur **🔍 Rechercher** dans la navbar
2. Filtrez par :
   - **Ville** : Paris, Lyon, Bordeaux, Nice, Marseille...
   - **Prix max** par nuit (€)
   - **Type** : Studio, Appartement, Maison, Villa
3. Cliquez sur un logement pour voir les détails

### 2. Réserver un logement

1. Ouvrez la fiche d'un logement
2. Choisissez vos **dates d'arrivée et de départ**
3. Le **prix total** se calcule automatiquement
4. Cliquez sur **🎯 Réserver maintenant**
   - Si non connecté → redirigé vers la page de connexion
5. Confirmation instantanée avec un message ✅

### 3. Mes réservations

1. Connectez-vous
2. Cliquez sur **📅 Réservations** dans la navbar
3. Visualisez toutes vos réservations avec leur statut :
   - ⏳ **En attente** — confirmation en cours
   - ✅ **Confirmée** — votre séjour est validé
   - 🏁 **Terminée** — séjour passé
   - ❌ **Annulée** — réservation annulée
4. Annulez une réservation active en cliquant sur **✕ Annuler**

### 4. Ajouter aux favoris ❤️

1. Connectez-vous (rôle guest ou host)
2. Sur n'importe quelle carte de logement, cliquez sur le **cœur 🤍**
3. Le cœur devient **❤️ rouge** → logement sauvegardé en favoris

---

## 🏠 Espace Hôte

*Disponible uniquement pour les comptes avec le rôle `host`*

### Accéder à l'espace hôte

1. Connectez-vous avec un compte hôte (ex: james.carter@email.com)
2. Cliquez sur **🏠 Espace hôte** dans la navbar

### Gérer ses logements

- **Voir tous ses logements** avec photo, ville et statut
- **Ajouter un logement** : cliquez sur **+ Ajouter un logement**
  - Remplissez : titre, description, prix/nuit, capacité, type, ville, adresse
  - Cliquez sur **🏠 Créer le logement**
- **Supprimer un logement** : icône 🗑 sur la carte

### Voir les réservations reçues

- Onglet **📅 Réservations reçues** : liste de toutes les réservations sur vos logements
- Colonnes : logement, arrivée, départ, montant, statut

---

## ⚡ Dashboard Admin

*Disponible uniquement pour les comptes avec le rôle `admin`*

1. Connectez-vous avec admin@etnair.com / password
2. Cliquez sur **⚡ Admin** dans la navbar

### 4 onglets disponibles

| Onglet | Contenu |
|--------|---------|
| 📊 Vue d'ensemble | Stats globales, activité récente, statuts réservations, top logements |
| 📅 Réservations | Tableau complet de toutes les réservations |
| 🏠 Logements | Tableau de tous les logements avec photos |
| 👥 Utilisateurs | Liste de tous les utilisateurs avec leurs rôles |

---

## 🛠 Tests

### Tests unitaires (Vitest)

```bash
cd frontend
npm install
npm test           # Run once
npm run test:watch # Mode watch
npm run test:coverage  # Rapport de couverture
```

### Tests E2E (Cypress)

```bash
# L'application doit tourner sur http://localhost:5173
cd frontend
npm run dev &
npm run test:e2e:open  # Interface graphique Cypress
npm run test:e2e       # Mode headless (CI)
```

### Tests backend (Jest)

```bash
cd backend
npm test
# 39/39 tests passent ✅
```

---

## 📊 Monitoring

### Grafana
- URL : http://localhost:3001
- Login : `admin` / `etnair2026`
- Source de données : Prometheus (auto-configuré)

### Métriques disponibles
- `http_requests_total` — nombre de requêtes par route/méthode/statut
- `http_request_duration_seconds` — latence des requêtes HTTP
- Métriques Node.js par défaut (CPU, mémoire, event loop)

---

## 🏗 Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Frontend │───▶│  nginx   │───▶│   API Node.js    │  │
│  │  React   │    │ :80/:443 │    │  Express + Prisma│  │
│  └──────────┘    └──────────┘    └────────┬─────────┘  │
│                                           │             │
│  ┌──────────┐    ┌──────────┐    ┌────────▼─────────┐  │
│  │ Grafana  │◀───│Prometheus│    │    PostgreSQL     │  │
│  │  :3001   │    │  :9090   │    │     :5432        │  │
│  └──────────┘    └──────────┘    └──────────────────┘  │
│                                                         │
│  ┌──────────┐    ┌──────────┐                          │
│  │  MinIO   │    │ pgAdmin  │                          │
│  │  :9000   │    │  :5050   │                          │
│  └──────────┘    └──────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📬 API Endpoints principaux

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | /auth/register | Créer un compte | Non |
| POST | /auth/login | Se connecter | Non |
| GET | /annonces | Lister les logements | Non |
| GET | /annonces/:id | Détail d'un logement | Non |
| POST | /annonces | Créer un logement | Host/Admin |
| GET | /bookings | Mes réservations | Oui |
| POST | /bookings | Créer une réservation | Oui |
| DELETE | /bookings/:id | Annuler | Oui |
| GET | /reviews/property/:id | Avis d'un logement | Non |
| POST | /reviews | Poster un avis | Oui |

Documentation complète : http://localhost:3000/api-docs
