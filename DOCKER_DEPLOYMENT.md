# 🐳 TCDynamics Docker Deployment Guide

This guide explains how to deploy TCDynamics using Docker and Docker Compose for production environments.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- 20GB free disk space
- Linux/Windows/Mac with Docker support

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/lawmight/TCDynamics.git
cd TCDynamics

# Copy environment files
cp docker-env.example .env
cp backend/env.example backend/.env

# Edit environment variables
nano .env
nano backend/.env
```

### 2. Build and Start Services

```bash
# Start all services
docker-compose up -d

# Start with monitoring
docker-compose --profile monitoring up -d

# Start with backup service
docker-compose --profile backup up -d
```

### 3. Check Status

```bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs -f

# Check health
curl http://localhost/health
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Node.js API   │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port: 80/443  │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis Cache   │    │   Prometheus     │    │   Grafana       │
│   Port: 6379    │    │   Port: 9090     │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚙️ Configuration

### Environment Variables

Edit `.env` with your configuration:

```bash
# Application
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=tcdynamics

# Email (Zoho)
EMAIL_USER=contact@yourdomain.com
EMAIL_PASS=your_zoho_app_password

# Security
JWT_SECRET=your_jwt_secret_32_chars_min
```

### SSL Configuration

For HTTPS support, place your SSL certificates in the `ssl/` directory:

```bash
ssl/
├── certificate.crt
├── private.key
└── ca-bundle.crt (optional)
```

## 📊 Monitoring & Observability

### Prometheus Metrics

Access Prometheus at: `http://localhost:9090`

### Grafana Dashboards

Access Grafana at: `http://localhost:3000`

- Default credentials: admin / admin

### Application Metrics

- Health check: `GET /health`
- API documentation: `GET /api-docs`
- Application logs: `./backend/logs/`

## 🔧 Management Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Scale backend instances
docker-compose up -d --scale backend=3
```

### Database Operations

```bash
# Backup database
docker-compose exec postgres pg_dump -U tcdynamics tcdynamics > backup.sql

# Restore database
docker-compose exec -T postgres psql -U tcdynamics tcdynamics < backup.sql

# Access database shell
docker-compose exec postgres psql -U tcdynamics tcdynamics
```

### Maintenance

```bash
# Update images
docker-compose pull

# Rebuild specific service
docker-compose build backend

# Clean up
docker-compose down -v
docker system prune -f
```

## 🔒 Security Best Practices

### Production Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable database backups
- [ ] Monitor resource usage

### Environment-Specific Configurations

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Find process using port
   lsof -i :3001
   # Change port in .env
   BACKEND_PORT=3002
   ```

2. **Database connection failed**

   ```bash
   # Check database logs
   docker-compose logs postgres

   # Reset database
   docker-compose down -v
   docker-compose up -d postgres
   ```

3. **Out of memory**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   ```

### Logs Location

- Application logs: `./backend/logs/`
- Nginx logs: `./nginx/logs/`
- Database logs: `docker-compose logs postgres`
- Redis logs: `docker-compose logs redis`

## 📈 Performance Optimization

### Resource Allocation

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Database Optimization

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_contact_created_at ON contact_submissions(created_at);
CREATE INDEX CONCURRENTLY idx_demo_status ON demo_requests(status);

-- Analyze tables
ANALYZE contact_submissions;
ANALYZE demo_requests;
```

## 🔄 Backup & Recovery

### Automated Backups

The backup service creates daily database backups:

```bash
# View backup files
ls -la backups/

# Manual backup
docker-compose exec postgres pg_dump -U tcdynamics tcdynamics > manual_backup.sql
```

### Recovery Process

```bash
# Stop application
docker-compose stop backend frontend

# Restore database
docker-compose exec -T postgres psql -U tcdynamics tcdynamics < backup.sql

# Restart application
docker-compose start backend frontend
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Redis Docker](https://hub.docker.com/_/redis)
- [PM2 Documentation](https://pm2.keymetrics.io/)

## 🆘 Support

For issues:

1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Test health endpoints: `curl http://localhost/health`
4. Contact: contact@tcdynamics.fr

---

**Deployment completed successfully!** 🎉

Your TCDynamics application is now running with:

- ✅ High availability
- ✅ Scalable architecture
- ✅ Production monitoring
- ✅ Automated backups
- ✅ Security best practices
