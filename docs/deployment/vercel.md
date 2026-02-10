# Vercel Deployment Guide

**Last Updated**: 2026-02-07
**Status**: Active

Complete guide for deploying TCDynamics WorkFlowAI to Vercel, including configuration, environment setup, and troubleshooting.

## Overview

TCDynamics WorkFlowAI is deployed to Vercel as a hybrid system:
- **Frontend**: React 18 + Vite application deployed as static site
- **API**: Vercel serverless functions for backend API endpoints
- **Authentication**: Clerk integration with custom domain and security headers

## Deployment Configuration

### vercel.json Configuration

The deployment uses a single root-level `vercel.json` configuration file located at project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "npm install && npm run build:frontend",
  "outputDirectory": "apps/frontend/dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self' https://tcdynamics.fr https://www.tcdynamics.fr; script-src 'self' 'unsafe-inline' https://tcdynamics.fr https://www.tcdynamics.fr https://clerk.tcdynamics.fr https://connect.facebook.net https://*.polar.sh https://browser.sentry-cdn.com https://cdn.vercel-insights.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.com https://datafa.st https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net; font-src 'self' data: https: https://fonts.gstatic.com; connect-src 'self' https://api.tcdynamics.fr https://tcdynamics.fr https://www.tcdynamics.fr https://clerk.tcdynamics.fr https://*.azurewebsites.net https://*.vercel.app https://vercel.live https://*.polar.sh https://*.ingest.sentry.io https://cdn.vercel-insights.com https://vitals.vercel-insights.com https://datafa.st https://*.clerk.accounts.dev https://*.clerk.com https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net; frame-src 'self' https://clerk.tcdynamics.fr https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com; worker-src 'self' blob:; manifest-src 'self' https://tcdynamics.fr https://www.tcdynamics.fr; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests;"
        },
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "credentialless"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "X-Permitted-Cross-Domain-Policies",
          "value": "none"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=(), unload=()"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/www.tcdynamics.fr/:path*",
      "destination": "https://tcdynamics.fr/:path*",
      "permanent": true
    }
  ],
  "rewrites": [{ "source": "/((?!api).*)", "destination": "/index.html" }],
  "env": {
    "USE_BYTECODE_CACHING": "1"
  }
}
```

### Key Configuration Details

- **Build Command**: `npm install && npm run build:frontend`
- **Output Directory**: `apps/frontend/dist` (monorepo structure)
- **API Functions**: Automatically detected from root `api/` directory
- **Security Headers**: Comprehensive CSP, HSTS, and other security headers
- **CORS**: API endpoints configured for `https://tcdynamics.fr`
- **Caching**: Static assets cached for 1 year, API responses non-cacheable

## Environment Variables

### Required for Production

#### Frontend Environment Variables
```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### Serverless Function Environment Variables
```bash
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_connection_string
SENTRY_DSN=your_sentry_dsn
SENTRY_RELEASE=your_release_version
PII_HASH_SALT=your_hash_salt_key
```

#### Vercel Project Environment Variables
```bash
VERCEL_GIT_COMMIT_SHA=auto_set_by_vercel
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TOKEN=your_vercel_token
```

### Setting Environment Variables

1. **Via Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development environments

2. **Via CLI**:
   ```bash
   vercel env add CLERK_SECRET_KEY production
   vercel env add MONGODB_URI production
   ```

## Deployment Process

### Automatic Deployment

Deployments are triggered automatically via GitHub Actions:

1. **Push to main branch**: Triggers deployment to production
2. **Pull requests**: Triggers preview deployments
3. **Manual dispatch**: Allows manual deployment with environment selection

### Manual Deployment

The project provides npm scripts and PowerShell scripts for manual deployment:

#### NPM Scripts

```bash
# Deploy frontend + API (full deployment)
npm run deploy:vercel

# Deploy frontend only (static build, avoids function limits)
npm run deploy:vercel:frontend
```

#### PowerShell Scripts

- **`scripts/deploy-vercel.ps1`** - Full deployment (frontend + API serverless functions)
- **`scripts/deploy-vercel-frontend-only.ps1`** - Frontend-only deployment (static files only)
- **`scripts/deploy-vercel-preview.ps1`** - Preview deployment
- **`scripts/monitor-deployments.ps1`** - Real-time monitoring of deployments

#### Manual Script Usage

```bash
# Full deployment via PowerShell
powershell -ExecutionPolicy Bypass -File ./scripts/deploy-vercel.ps1

# Frontend-only deployment via PowerShell
powershell -ExecutionPolicy Bypass -File ./scripts/deploy-vercel-frontend-only.ps1

# Monitor deployment progress
powershell -ExecutionPolicy Bypass -File ./scripts/monitor-deployments.ps1
```

### Deployment Workflow

The deployment process follows this sequence:

1. **Quality Gate**: Runs linting, type checking, tests, and build verification
2. **Build**: Executes `npm install && npm run build:frontend`
3. **API Copy**: Copies `api/` directory to `apps/frontend/api/` for Vercel
4. **Deploy**: Uses Vercel CLI to deploy to specified environment
5. **Verification**: Checks deployment status and provides feedback

## Monitoring and Observability

### Sentry Integration

Error tracking and performance monitoring via Sentry:

- **Frontend**: Captures client-side errors and performance metrics
- **Backend**: Captures server-side errors and API performance
- **Source Maps**: Automatically uploaded during build process

### Vercel Analytics

Web analytics and performance metrics:

- **Page Views**: Automatic tracking of user interactions
- **Web Vitals**: Core Web Vitals monitoring (LCP, FID, CLS)
- **Custom Events**: Manual tracking of business events

### Performance Monitoring

In-app performance monitoring component:

- **Load Time**: Tracks application load performance
- **Render Time**: Monitors component rendering performance
- **Memory Usage**: Tracks memory consumption
- **Bundle Size**: Monitors JavaScript bundle sizes

## Troubleshooting

### Common Issues

#### 431 Request Header Fields Too Large
**Cause**: Clerk authentication tokens exceed Vercel's default header size limit
**Solution**: Use `npm run dev` which configures Node.js to accept 32KB headers

#### API Functions Not Found
**Cause**: API directory not properly copied during build
**Solution**: Check build logs for API copy step, ensure `api/` directory exists

#### CORS Errors
**Cause**: API endpoints not configured for your domain
**Solution**: Update `vercel.json` CSP headers with your domain

#### 404 Errors on Routes
**Cause**: Rewrites not properly configured
**Solution**: Verify rewrites in `vercel.json` point to `/index.html`

### Debug Commands

```bash
# Check deployment status
vercel ls tc-dynamics

# View deployment logs
vercel inspect <deployment-id> --logs

# Test locally with Vercel dev
npm run dev:vercel

# Check environment variables
vercel env ls
```

## Performance Optimization

### Bundle Size Optimization

1. **Code Splitting**: Route-based splitting with `React.lazy()`
2. **Tree Shaking**: Unused code elimination via Vite
3. **Compression**: Automatic gzip/brotli compression
4. **Caching**: Long-term caching for static assets

### API Optimization

1. **Function Bundling**: Minimized serverless function bundles
2. **Cold Start**: Optimized function initialization
3. **Concurrency**: Efficient handling of concurrent requests

### Image Optimization

- **Next-Gen Formats**: WebP, AVIF support
- **Responsive Images**: Automatic size selection
- **Lazy Loading**: Intersection Observer API

## Security

### Content Security Policy

Comprehensive CSP configuration includes:
- **Script Sources**: Trusted domains only
- **Connect Sources**: API endpoints and third-party services
- **Frame Sources**: Controlled iframe embedding
- **Object Sources**: Prevents plugin execution

### Authentication Security

- **Clerk Integration**: Secure authentication with custom domain
- **Token Management**: Secure token handling and refresh
- **Session Management**: Proper session lifecycle management

### Data Protection

- **PII Hashing**: Automated hashing of sensitive identifiers
- **Error Sanitization**: Clean error messages without sensitive data
- **Audit Logging**: Comprehensive audit trails

## Cost Management

### Function Limits

- **Hobby Plan**: 12 serverless functions maximum
- **Pro/Enterprise**: Higher limits available
- **Monitoring**: Track function usage via Vercel dashboard

### Bandwidth Optimization

- **CDN Caching**: Global content delivery
- **Compression**: Minimized data transfer
- **Asset Optimization**: Optimized images and resources

## Related Documentation

- [CI/CD Guide](./ci-cd.md) - GitHub Actions workflows and deployment automation
- [Monitoring Setup](./monitoring.md) - Sentry, Vercel Analytics, and observability
- [Security Headers](../security/headers.md) - Security configuration details
- [Environment Setup](../development/environment-setup.md) - Development environment configuration

---

**Last Updated**: 2026-02-07