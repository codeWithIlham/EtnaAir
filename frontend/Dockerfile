# ============================================================
# ETNAir — Dockerfile Frontend React (Vite)
# Build : docker build -t etnair-frontend ./frontend
# ============================================================

# ── Stage 1 : Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2 : Serve via nginx ─────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/bin/sh", "-c", "sed -i \"s|BACKEND_URL_PLACEHOLDER|${VITE_API_URL}|g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
