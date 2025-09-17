/**
 * Configuration PM2 pour le déploiement en production
 * Usage: pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'tcdynamics-api',
      script: './backend/src/server.js',
      instances: 'max', // Utiliser tous les CPU disponibles
      exec_mode: 'cluster', // Mode cluster pour la scalabilité
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      // Auto restart si crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Monitoring
      monitoring: true,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Health check
      health_check: {
        interval: 30000,
        path: '/health',
      },
    },
  ],

  // Configuration de déploiement
  deploy: {
    production: {
      user: 'deploy',
      host: process.env.DEPLOY_HOST || 'tcdynamics.fr',
      ref: 'origin/main',
      repo: 'git@github.com:TCDynamics/TCDynamics.git',
      path: '/var/www/tcdynamics',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
}
