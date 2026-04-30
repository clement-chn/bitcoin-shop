# Ynov Exchange — Plateforme de trading BTC

Architecture microservices pour l'achat de Bitcoin (BTC) via un compte en Euros (EUR).

## Architecture
frontend (React)  →  api-gateway :3000  →  wallet-service :3001
→  asset-service  :3002
→  order-service  :3003
Kafka (broker de messages) — communication asynchrone entre les services

## Prérequis

- Node.js v18+
- Docker + Docker Compose
- npm

## Lancer le projet

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd bitcoin-shop
```

### 2. Lancer Kafka

```bash
docker compose up -d
```

### 3. Installer les dépendances de chaque service

```bash
cd wallet-service && npm install && cd ..
cd asset-service && npm install && cd ..
cd order-service && npm install && cd ..
cd api-gateway && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4. Lancer les services (5 terminaux)

**Terminal 1 — wallet-service**
```bash
cd wallet-service && node index.js
```

**Terminal 2 — asset-service**
```bash
cd asset-service && node index.js
```

**Terminal 3 — order-service**
```bash
cd order-service && node index.js
```

**Terminal 4 — api-gateway**
```bash
cd api-gateway && node index.js
```

**Terminal 5 — frontend**
```bash
cd frontend && npm run dev
```

### 5. Accéder à l'application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Swagger wallet-service | http://localhost:3001/docs |
| Swagger asset-service | http://localhost:3002/docs |
| Swagger order-service | http://localhost:3003/docs |

## Fonctionnement

### Saga Pattern — Achat de BTC

Frontend envoie POST /orders à l'api-gateway
order-service crée l'ordre (PENDING) et publie DEBIT_EUR sur Kafka
wallet-service débite l'EUR et publie EUR_DEBITED
order-service reçoit EUR_DEBITED et publie RESERVE_BTC
asset-service réserve le BTC et publie BTC_RESERVED
order-service reçoit BTC_RESERVED → ordre COMPLETED ✅

En cas d'échec (stock BTC épuisé) :
5b. asset-service publie BTC_RESERVATION_FAILED
6b. order-service publie REFUND_EUR
7b. wallet-service rembourse l'EUR → ordre FAILED ↩️

### Correlation-ID

Chaque requête reçoit un `correlationId` unique généré par l'api-gateway. Il permet de tracer le parcours complet d'un ordre à travers tous les services dans les logs.

## Topics Kafka

| Topic | Producteur | Consommateur |
|---|---|---|
| `DEBIT_EUR` | order-service | wallet-service |
| `EUR_DEBITED` | wallet-service | order-service |
| `RESERVE_BTC` | order-service | asset-service |
| `BTC_RESERVED` | asset-service | order-service |
| `BTC_RESERVATION_FAILED` | asset-service | order-service |
| `REFUND_EUR` | order-service | wallet-service |
| `EUR_REFUNDED` | wallet-service | order-service |

## Health Checks

```bash
curl http://localhost:3001/wallets/health
curl http://localhost:3002/assets/health
curl http://localhost:3003/orders/health
```

## Stock BTC

Le stock initial est de **10 BTC**. Si le stock est épuisé lors d'un achat, la Saga de compensation se déclenche automatiquement et rembourse l'utilisateur.

## Cours BTC

Le cours est récupéré en temps réel depuis l'API publique CoinGecko au moment de chaque ordre.