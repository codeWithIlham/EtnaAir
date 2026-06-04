# ============================================================
# ETNAir — Dockerfile Backend Node.js
# ============================================================

FROM node:20-alpine

# Installer OpenSSL (requis par Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.js && node server.js"]
