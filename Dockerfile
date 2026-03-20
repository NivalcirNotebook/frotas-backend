# Dockerfile para o Backend (Node.js + Express + Prisma)
FROM node:18-slim

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Copiar código do backend
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Script de inicialização
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
