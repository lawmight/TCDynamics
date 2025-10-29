# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Installer les dépendances de build
RUN apk add --no-cache git

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant devDependencies pour le build)
RUN npm ci --only=production && npm cache clean --force

# Production stage avec PM2
FROM node:18-alpine AS production

# Installer PM2 globalement
RUN npm install -g pm2 @pm2/io && npm cache clean --force

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Copier les dépendances depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Copier le script de health check
COPY --chown=nodejs:nodejs healthcheck.js .

# Créer les dossiers nécessaires
RUN mkdir -p /app/logs /app/tmp && \
    chown -R nodejs:nodejs /app/logs /app/tmp

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 8080

# Variables d'environnement
ENV NODE_ENV=production
ENV PM2_PUBLIC_KEY=your_pm2_public_key
ENV PM2_SECRET_KEY=your_pm2_secret_key

# Configuration PM2
COPY --chown=nodejs:nodejs ecosystem.config.js ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Démarrer l'application avec PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]