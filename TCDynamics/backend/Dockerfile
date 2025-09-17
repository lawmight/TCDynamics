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

# Créer les dossiers nécessaires
RUN mkdir -p /app/logs /app/tmp && \
    chown -R nodejs:nodejs /app/logs /app/tmp

# Utiliser l'utilisateur non-root
USER nodejs

# Exposer le port
EXPOSE 3001

# Variables d'environnement
ENV NODE_ENV=production
ENV PM2_PUBLIC_KEY=your_pm2_public_key
ENV PM2_SECRET_KEY=your_pm2_secret_key

# Configuration PM2
COPY --chown=nodejs:nodejs ecosystem.config.js ./

# Health check amélioré
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    });

    req.on('error', () => process.exit(1));
    req.on('timeout', () => {
      req.destroy();
      process.exit(1);
    });

    req.end();
  "

# Démarrer l'application avec PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]