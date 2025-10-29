module.exports = {
  apps: [
    {
      name: 'tcdynamics-backend',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8080,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      error_log: 'logs/pm2-error.log',
      out_log: 'logs/pm2-out.log',
      merge_logs: true,
      time: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      autorestart: true,
      min_uptime: '10s',
    },
  ],
}
