# Environment Setup Guide

**Last Updated**: 2026-02-07
**Status**: Active

Complete guide for setting up your development environment for the TCDynamics WorkFlowAI project.

## Overview

This guide covers all required and optional environment variables for both frontend and backend development, as well as service account setup instructions.

### Setup Flow

```mermaid
flowchart LR
  Clone[Clone repo] --> Install[Install deps]
  Install --> Env[Create .env]
  Env --> Config[Configure variables]
  Config --> Start[Start dev servers]
```

### Environment Variable Scope

```mermaid
flowchart TB
  subgraph Frontend["Frontend (VITE_*)"]
    ViteClerk[VITE_CLERK_PUBLISHABLE_KEY]
    ViteSentry[VITE_SENTRY_DSN]
    ViteAPI[VITE_API_URL]
    VitePolar[VITE_POLAR_*]
  end

  subgraph API["API / Serverless Functions"]
    ClerkSecret[CLERK_SECRET_KEY]
    Mongo[MONGODB_URI]
    Sentry[SENTRY_DSN]
    Resend[RESEND_API_KEY]
    Polar[POLAR_ACCESS_TOKEN]
    Vertex[VERTEX_PROJECT_ID]
    OpenAI[OPENAI_API_KEY]
  end

  subgraph Backend["Backend (local Express)"]
    NodeEnv[NODE_ENV]
    BackendMongo[Mongo connection]
  end

  Frontend --> API
  API --> Backend
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/lawmight/TCDynamics.git
cd TCDynamics
```

### 2. Install Dependencies

```bash
npm install
# or
npm run install:all
```

### 3. Create Environment Files

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If example exists
# Or create manually
touch .env
```

**Note**: The `.env.example` file is located at `apps/frontend/.env.example`. Copy it to the project root and update with your values.

### 4. Configure Required Variables

Add required environment variables (see sections below).

### 5. Start Development Servers

```bash
# Run both frontend and Vercel dev server together (recommended)
npm run dev

# Or run individually:
# Terminal 1: Frontend dev server
npm run dev:frontend

# Terminal 2: Vercel dev server (API functions)
npm run dev:vercel

# Or run all three (frontend + API + Express backend):
npm run dev:all
```

**Important**: The main `npm run dev` command automatically starts both the frontend (Vite) and the Vercel dev server (API functions) together. This ensures API endpoints are available when developing locally.

**Node.js Header Size Fix**: The development setup includes a fix for large Clerk JWT tokens by using `NODE_OPTIONS="--max-http-header-size=65536"` in the package.json scripts.

---

## Environment Variables

### Frontend Variables (VITE\_ prefix)

Frontend environment variables must be prefixed with `VITE_` to be exposed to the client. These are configured in `apps/frontend/src/utils/config.ts`.

#### Required Frontend Variables

**`VITE_CLERK_PUBLISHABLE_KEY`** (Required)

- **Description**: Clerk publishable key for frontend authentication
- **Format**: Starts with `pk_test_` (development) or `pk_live_` (production)
- **Example**: `VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage**: Used by `@clerk/clerk-react` for user authentication
- **Where to get**: Clerk Dashboard → API Keys → Publishable Key

**`VITE_TURNSTILE_SITE_KEY`** (Optional but Recommended)

- **Description**: Cloudflare Turnstile site key for CAPTCHA
- **Example**: `VITE_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxx`
- **Usage**: Used by `Captcha` component for form protection
- **Where to get**: Cloudflare Dashboard → Turnstile → Sites

#### Optional Frontend Variables

**API Configuration**:

- `VITE_API_URL` (default: `/api`) - **CRITICAL** for local development - API base URL (relative for Vercel)
- `VITE_AZURE_FUNCTIONS_URL` - Azure Functions URL (if using Azure Functions)

**Environment**:

- `VITE_NODE_ENV` (default: `development`) - Environment: `development`, `production`, or `test`
- `VITE_APP_VERSION` (default: `1.0.0`) - Application version

**Analytics** (Optional):

- `VITE_ANALYTICS_GA_TRACKING_ID` - Google Analytics tracking ID
- `VITE_ANALYTICS_HOTJAR_ID` - Hotjar site ID
- `VITE_FEATURE_ENABLE_ANALYTICS` (default: `false`) - Enable analytics features

**Feature Flags** (Optional):

- `VITE_FEATURE_ENABLE_DEBUG_LOGGING` (default: `false`) - Enable debug logging
- `VITE_FEATURE_ENABLE_CACHE` (default: `true`) - Enable client-side caching
- `VITE_FEATURE_ENABLE_AI_CHAT` (default: `false`) - Enable AI chat feature
- `VITE_FEATURE_ENABLE_AI_VISION` (default: `false`) - Enable AI vision feature
- `VITE_FEATURE_ENABLE_CONTACT_FORM` (default: `true`) - Enable contact form
- `VITE_FEATURE_ENABLE_DEMO_FORM` (default: `true`) - Enable demo request form
- `VITE_FEATURE_ENABLE_AZURE_FUNCTIONS` (default: `false`) - Use Azure Functions
- `VITE_FEATURE_ENABLE_VERCEL_CHAT` (default: `false`) - Enable Vercel chat endpoint

**Cache Configuration** (Optional):

- `VITE_CACHE_MAX_SIZE` (default: `1000`) - Maximum cache entries
- `VITE_CACHE_DEFAULT_TTL` (default: `300000`) - Default TTL in milliseconds (5 minutes)
- `VITE_CACHE_CLEANUP_INTERVAL` (default: `300000`) - Cleanup interval in milliseconds

**Performance Monitoring** (Optional):

- `VITE_PERFORMANCE_ENABLE_SAMPLING` (default: `true`) - Enable performance sampling
- `VITE_PERFORMANCE_SAMPLE_RATE` (default: `0.1`) - Sampling rate (0.0-1.0)
- `VITE_PERFORMANCE_MAX_METRICS` (default: `1000`) - Maximum metrics to track

**Security** (Optional):

- `VITE_SECURITY_CSP_STRICT` (default: `false`) - Enable strict CSP
- `VITE_SECURITY_RATE_LIMIT_REQUESTS` (default: `100`) - Rate limit requests
- `VITE_SECURITY_RATE_LIMIT_WINDOW` (default: `60000`) - Rate limit window in milliseconds

**Sentry** (Optional):

- `VITE_SENTRY_DSN` - Sentry DSN for error tracking
- `VITE_SENTRY_TRACES_SAMPLE_RATE` (default: `0.1`) - Trace sample rate
- `VITE_SENTRY_RELEASE` - Release version for Sentry

**Polar Payments** (Optional):

- `VITE_POLAR_PRODUCT_STARTER` - Polar product ID for starter plan
- `VITE_POLAR_PRODUCT_PROFESSIONAL` - Polar product ID for professional plan
- `VITE_POLAR_PRODUCT_ENTERPRISE` - Polar product ID for enterprise plan

**URLs** (Optional):

- `VITE_DEMO_URL` (default: `/demo`) - Demo page URL
- `VITE_APP_URL` (default: `/app`) - Application base URL

---

### API Variables (Server-side)

API environment variables are used by Vercel serverless functions in the `api/` directory. See below for detailed documentation.

#### Required API Variables

**`CLERK_SECRET_KEY`** (Required)

- **Description**: Clerk secret key for backend authentication and JWT verification
- **Format**: Starts with `sk_test_` (development) or `sk_live_` (production)
- **Example**: `CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage**: Used by `api/_lib/auth.js` to verify JWT tokens
- **Where to get**: Clerk Dashboard → API Keys → Secret Key
- **⚠️ Important**: Do NOT confuse with `CLERK_API_KEY` - use `CLERK_SECRET_KEY`

**`MONGODB_URI`** (Required)

- **Description**: MongoDB Atlas connection string for data persistence
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Example**: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority`
- **Usage**: Used by `api/_lib/mongodb.js` for database connection
- **Where to get**: MongoDB Atlas → Connect → Drivers → Connection String

**`RESEND_API_KEY`** (Required for Email)
- **Description**: Resend API key for sending transactional emails
- **Format**: `re_` prefixed API key
- **Example**: `RESEND_API_KEY=re_ZSqttoZg_GHzVoHrtAd5hFxYc3srkqGHe`
- **Usage**: Used by `api/_lib/email.js` for sending contact/demo emails
- **Where to get**: Resend Dashboard → API Keys → Create API Key
- **Domain**: Must verify your domain in Resend settings

**`POLAR_ACCESS_TOKEN`** (Required for Payments)
- **Description**: Polar API access token for payment processing
- **Format**: `polar_oat_` prefixed token
- **Example**: `POLAR_ACCESS_TOKEN=polar_oat_egOSwJWVOnenYxHFVRINhWKWWhTUZJqQO2SZk3BpB1C`
- **Usage**: Used by `api/polar/` endpoints for payment processing
- **Where to get**: Polar Dashboard → Settings → API → Create Access Token
- **Server**: `POLAR_SERVER=production` or `POLAR_SERVER=sandbox` for testing

#### Optional API Variables

**Security**:

- `PII_HASH_SALT` (optional) - Salt for hashing PII before logging (recommended for production)
  - Generate: `openssl rand -hex 32`
  - Example: `PII_HASH_SALT=your-secure-random-salt-here`
- `IP_HASH_SALT` (optional) - Salt for hashing IP addresses (if IP logging enabled)
  - Generate: `openssl rand -hex 32`
- `ENABLE_CLIENT_IP_LOGGING` (default: `false`) - Enable IP address logging

**Payment (Polar)**:

- `POLAR_ACCESS_TOKEN` - Polar API access token
- `POLAR_SERVER` (default: `production`) - Polar server: `production` or `sandbox`
- `POLAR_PRODUCT_STARTER` - Polar product ID for starter plan
- `POLAR_PRODUCT_PROFESSIONAL` - Polar product ID for professional plan
- `POLAR_PRODUCT_ENTERPRISE` - Polar product ID for enterprise plan
- `PUBLIC_CHECKOUT_SECRET` (optional) - Secret token for public checkout endpoint
  - Generate: `openssl rand -hex 32`
- `MIN_CHECKOUT_AMOUNT` (default: `216000`) - Minimum checkout amount in cents (2160€)

**AI Services**:

- `OPENAI_API_KEY` - OpenAI API key (for GPT-3.5-turbo and GPT-4o Vision)
- `VERTEX_PROJECT_ID` - Google Cloud Vertex AI project ID
- `VERTEX_LOCATION` (default: `us-central1`) - Vertex AI location
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account JSON (for Vertex AI)

**Email (Resend)**:

- `RESEND_API_KEY` - Resend API key for sending emails

**Webhooks**:

- `CLERK_WEBHOOK_SIGNING_SECRET` - Clerk webhook signing secret (for user sync)
  - Where to get: Clerk Dashboard → Webhooks → Signing Secret
- `POLAR_WEBHOOK_SECRET` - Polar webhook signing secret (for payment events)

**Chat**:

- `ALLOW_VERCEL_CHAT` (default: `false`) - Enable Vercel chat endpoint (`/api/ai?provider=openai&action=chat`)
- `INTERNAL_CHAT_TOKEN` (optional) - Internal token for chat endpoint security
  - Generate: `openssl rand -hex 32`
- `ALLOWED_ORIGIN` (default: `https://your-domain.com`) - Allowed origin for chat endpoint
- `MAX_MESSAGE_LENGTH` (default: `2000`) - Maximum chat message length
- `MAX_TOKENS` (default: `512`) - Maximum tokens for AI responses

**Cursor hooks (awaiting-summary)**:

- `INTERNAL_HOOK_TOKEN` (optional) - Shared secret for `GET /api/awaiting-summary` (used by Cursor `sessionStart` to inject contact/demo/Polar counts). Generate: `openssl rand -hex 32`. Set in Vercel and in local env when using `status-inject.js`.

**Monitoring**:

- `SENTRY_DSN` - Sentry DSN for error tracking (server-side)
- `SENTRY_AUTH_TOKEN` - Sentry auth token (for releases)

**Environment**:

- `NODE_ENV` (default: `development`) - Node environment: `development`, `production`, or `test`
- `VERCEL_ENV` - Vercel environment (auto-set by Vercel)
- `FRONTEND_URL` (default: `https://your-domain.com`) - Frontend URL for CORS and links

## Husky Git Hooks Configuration

The project includes Husky for git hooks to ensure code quality and prevent issues.

### Current Hooks Setup

**Pre-commit hook** (`.husky/pre-commit`):
- Runs lint-staged (ESLint + Prettier)
- Type checks TypeScript files
- Validates commit message format using commitlint

**Commit message hook** (`.husky/commit-msg`):
- Validates commit message format using commitlint
- Enforces conventional commit standards

**Pre-push hook** (`.husky/pre-push`):
- Runs linting and type checks
- Ensures code quality before pushing

### Commit Message Format

The project uses commitlint with conventional commit format:

**Allowed types**:
- `build` - Build system changes
- `chore` - Maintenance tasks
- `ci` - CI/CD configuration
- `docs` - Documentation changes
- `feat` - New features
- `fix` - Bug fixes
- `perf` - Performance improvements
- `refactor` - Code refactoring
- `revert` - Reverting changes
- `style` - Code style changes
- `test` - Test changes

**Format**: `<type>: <description>`

**Examples**:
- `feat: add user authentication`
- `fix: resolve login error`
- `docs: update API documentation`

### Configuration Files

**Shared Configuration** (located in `tools/configs/`):
- Commitlint config: `tools/configs/commitlint.config.cjs`
- Prettier config: `tools/configs/.prettierrc` and `tools/configs/.prettierignore`
- Jest config: `tools/configs/jest.config.cjs` - Root-level configuration for backend only
- Components config: `tools/configs/components.json` - ShadCN UI component library

**Workspace-Specific Configuration**:
- ESLint config: Root `eslint.config.js` (extends frontend config for e2e tests)
- Frontend ESLint: `apps/frontend/eslint.config.js`
- Backend ESLint: `apps/backend/eslint.config.js`
- Frontend Prettier: `apps/frontend/.prettierignore`

**Note**: Previous standalone configuration files (`.prettierignore`, `.prettierrc`, `commitlint.config.cjs`, `jest.config.cjs`) have been consolidated into the `tools/configs/` directory for better organization and consistency across the monorepo.

### Troubleshooting

If you encounter git hook errors:

1. **Install Husky dependencies**:
   ```bash
   npm install
   ```

2. **Check hook permissions** (Linux/Mac):
   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   chmod +x .husky/pre-push
   ```

3. **Skip hooks temporarily** (use sparingly):
   ```bash
   git commit --no-verify -m "message"  # Skip pre-commit and commit-msg
   git push --no-verify                  # Skip pre-push
   ```

4. **Reset hooks**:
   ```bash
   npx husky install
   ```

---

## Service Account Setup

### 1. MongoDB Atlas

**Steps**:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user:
   - Database Access → Add New Database User
   - Choose username/password authentication
   - Set appropriate permissions (read/write)
4. Whitelist your IP address:
   - Network Access → Add IP Address
   - Allow access from anywhere (`0.0.0.0/0`) for development
   - For production, restrict to specific IPs
5. Get connection string:
   - Connect → Drivers → Connection String
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to `.env` as `MONGODB_URI`

**Example**:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

### 2. Clerk Authentication

**Steps**:

1. Create account at [Clerk](https://clerk.com)
2. Create a new application
3. Get API keys:
   - API Keys → Publishable Key (for frontend)
   - API Keys → Secret Key (for backend)
4. Configure webhooks:
   - Webhooks → Add Endpoint
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy webhook signing secret
5. Add to `.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
   ```

---

### 3. Vercel (Deployment)

**Steps**:

1. Create account at [Vercel](https://vercel.com)
2. Connect GitHub repository
3. Configure project:
   - Framework Preset: Vite
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel Dashboard:
   - Project Settings → Environment Variables
   - Add all required variables (see above)
   - Set for Production, Preview, and Development environments

**Note**: Frontend variables (`VITE_*`) are exposed to the client, so be careful with sensitive data.

---

### 4. Vertex AI (Optional)

**Steps**:

1. Create Google Cloud project
2. Enable Vertex AI API:
   - APIs & Services → Enable APIs and Services
   - Search for "Vertex AI API" and enable
3. Create service account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Grant "Vertex AI User" role
   - Create JSON key and download
4. Set up credentials:
   - Option A: Set `GOOGLE_APPLICATION_CREDENTIALS` to path of JSON key file
   - Option B: Use Application Default Credentials (recommended for production)
5. Add to `.env`:
   ```
   VERTEX_PROJECT_ID=your-project-id
   VERTEX_LOCATION=us-central1
   ```

---

### 5. OpenAI (Optional - for Chat/Vision)

**Steps**:

1. Create account at [OpenAI](https://platform.openai.com)
2. Get API key:
   - API Keys → Create New Secret Key
   - Copy the key (only shown once)
3. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

**Models Used**:

- GPT-3.5-turbo (for `/api/ai?provider=openai&action=chat`)
- GPT-4o (for `/api/ai?provider=openai&action=vision`)

---

### 6. Polar Payments (Optional)

**Steps**:

1. Create account at [Polar](https://polar.sh)
2. Create products:
   - Products → Create Product
   - Create products for starter, professional, and enterprise plans
   - Copy product IDs
3. Get API access token:
   - Settings → API → Create Access Token
   - Copy access token
4. Configure webhooks:
   - Settings → Webhooks → Add Webhook
   - Endpoint URL: `https://your-domain.com/api/polar/webhook`
   - Subscribe to events: `checkout.succeeded`, `subscription.created`, etc.
   - Copy webhook secret
5. Add to `.env`:
   ```
   POLAR_ACCESS_TOKEN=polar_...
   POLAR_SERVER=production
   POLAR_PRODUCT_STARTER=prod_...
   POLAR_PRODUCT_PROFESSIONAL=prod_...
   POLAR_PRODUCT_ENTERPRISE=prod_...
   POLAR_WEBHOOK_SECRET=whsec_...
   ```

---

### 7. Resend Email (Optional)

**Steps**:

1. Create account at [Resend](https://resend.com)
2. Get API key:
   - API Keys → Create API Key
   - Copy the key
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_...
   ```

---

### 8. Sentry (Optional)

**Steps**:

1. Create account at [Sentry](https://sentry.io)
2. Create a project:
   - Select platform: JavaScript/React
   - Get DSN
3. Add to `.env`:
   ```
   VITE_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_DSN=https://...@sentry.io/...
   SENTRY_AUTH_TOKEN=sntrys_...
   ```

---

### 9. Cloudflare Turnstile (Optional but Recommended)

**Steps**:

1. Create account at [Cloudflare](https://cloudflare.com)
2. Create Turnstile site:
   - Dashboard → Turnstile → Sites → Add Site
   - Configure domain
   - Copy Site Key and Secret Key
3. Add to `.env`:
   ```
   VITE_TURNSTILE_SITE_KEY=0x4AAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAA...
   ```

---

## Environment File Example

### `.env` (Root)

```bash
# ========== CLERK (Required) ==========
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ========== MONGODB (Required) ==========
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# ========== EMAIL - RESEND (Required) ==========
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=your-email@your-domain.com
DEMO_EMAIL=your-email@your-domain.com

# ========== PAYMENT - POLAR (Required) ==========
POLAR_ACCESS_TOKEN=polar_oat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_SERVER=production
POLAR_PRODUCT_STARTER=prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_PROFESSIONAL=prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_PRODUCT_ENTERPRISE=prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ========== FRONTEND CONFIGURATION (Required) ==========
VITE_API_URL=/api
VITE_FRONTEND_URL=https://your-domain.com

# ========== AI SERVICES (Optional) ==========
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# ========== SECURITY (Optional) ==========
PII_HASH_SALT=your-secure-random-salt-here
IP_HASH_SALT=your-secure-random-salt-here
ENABLE_CLIENT_IP_LOGGING=false

# ========== WEBHOOKS ==========
# CLERK_WEBHOOK_SIGNING_SECRET (already above)
# POLAR_WEBHOOK_SECRET (already above)

# ========== CHAT (Optional) ==========
ALLOW_VERCEL_CHAT=true
INTERNAL_CHAT_TOKEN=your-secure-random-token-here
ALLOWED_ORIGIN=https://your-domain.com
MAX_MESSAGE_LENGTH=2000
MAX_TOKENS=512

# ========== CURSOR HOOKS (Optional) ==========
INTERNAL_HOOK_TOKEN=your-secure-random-token-here

# ========== MONITORING (Optional) ==========
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# ========== CAPTCHA (Optional but Recommended) ==========
VITE_TURNSTILE_SITE_KEY=0x4AAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAA...

# ========== ENVIRONMENT ==========
NODE_ENV=development
FRONTEND_URL=https://your-domain.com

# ========== FEATURE FLAGS (Optional) ==========
VITE_FEATURE_ENABLE_ANALYTICS=false
VITE_FEATURE_ENABLE_AI_CHAT=false
VITE_FEATURE_ENABLE_AI_VISION=false
VITE_FEATURE_ENABLE_VERCEL_CHAT=true
```

---

## Development vs Production

### Development

- Use test keys (`pk_test_`, `sk_test_`)
- Local MongoDB or MongoDB Atlas free tier
- Feature flags enabled for testing
- Debug logging enabled
- CORS allows localhost

### Production

- Use live keys (`pk_live_`, `sk_live_`)
- MongoDB Atlas production cluster
- Feature flags configured per environment
- Debug logging disabled
- Strict CORS configuration
- PII hashing enabled with salt
- Rate limiting enabled
- Security headers configured

---

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoServerError: bad auth`

**Solution**:

- Check `MONGODB_URI` format (replace `<password>` placeholder)
- Verify database user credentials
- Check IP whitelist in MongoDB Atlas

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:

- Check IP whitelist includes your IP
- Verify network access in MongoDB Atlas
- Check firewall settings

---

### Clerk Authentication Issues

**Error**: `401 Unauthorized`

**Solution**:

- Verify `CLERK_SECRET_KEY` format (starts with `sk_test_` or `sk_live_`)
- Check key is not expired or revoked
- Ensure `Authorization: Bearer <token>` header format

**Error**: Webhook signature verification failed

**Solution**:

- Verify `CLERK_WEBHOOK_SIGNING_SECRET` matches Clerk dashboard
- Check webhook endpoint URL is correct
- Verify webhook events are subscribed

---

### 431 Request Header Fields Too Large

**Error**: `431 Request Header Fields Too Large` when accessing API endpoints

**Cause**: This error occurs when request headers (primarily the Clerk JWT token in the Authorization header) exceed Node.js's default 16KB limit.

**Solution**:

1. Ensure you're running the development server with the correct command:

   ```bash
   npm run dev  # This includes the header size fix
   ```

2. If running Vercel dev manually, use the increased header size:

   ```bash
   NODE_OPTIONS="--max-http-header-size=32768" vercel dev --listen 3001
   ```

3. Try refreshing your Clerk session:
   - Sign out of the application
   - Sign back in
   - This generates a new, potentially smaller token

**Prevention**:

- Keep Clerk user metadata lean (avoid storing large objects)
- Use database references instead of embedding data in tokens
- Consider using Clerk sessions with shorter expiration times
- Avoid storing large arrays or objects in public/private metadata

**Production Deployment**:
The fix is automatically applied in production via Vercel's serverless functions configuration. If deploying elsewhere, ensure Node.js is started with:

```bash
NODE_OPTIONS="--max-http-header-size=65536" node server.js
```

---

### Resend Email Configuration Issues

**Error**: Email sending fails or domain not verified

**Solution**:
1. Verify your domain in Resend Dashboard
2. Ensure `RESEND_API_KEY` is correctly configured
3. Check that `CONTACT_EMAIL` and `DEMO_EMAIL` are valid email addresses
4. Test email sending with the `/api/test-email` endpoint

**Error**: Domain not verified
**Solution**:
1. Go to Resend Dashboard → Domains
2. Add your domain
3. Verify DNS records (TXT and MX records)
4. Wait for DNS propagation (up to 24 hours)

---

### Polar Payment Integration Issues

**Error**: Payment processing fails

**Solution**:
1. Verify `POLAR_ACCESS_TOKEN` is valid and has correct permissions
2. Check `POLAR_SERVER` is set to `production` or `sandbox`
3. Ensure product IDs (`POLAR_PRODUCT_STARTER`, etc.) are correct
4. Verify webhook secret is configured in Polar dashboard

**Error**: Webhook verification fails
**Solution**:
1. Ensure `POLAR_WEBHOOK_SECRET` matches Polar dashboard webhook settings
2. Check that webhook endpoint URL is correct (`/api/polar/webhook`)
3. Verify webhook events are properly subscribed

---

### Git Hook Issues

**Error**: Pre-commit hook fails

**Solution**:
1. Install dependencies: `npm install`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Run lint-staged manually: `npx lint-staged`
4. Skip hooks temporarily: `git commit --no-verify -m "message"`

**Error**: Commit message validation fails
**Solution**:
1. Follow conventional commit format: `<type>: <description>`
2. Use allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
3. Check commitlint config: `tools/configs/commitlint.config.cjs`

---

### Vercel Development Issues

**Error**: Vercel dev server fails to start

**Solution**:
1. Ensure Node.js version is 20.x (check with `node --version`)
2. Check that port 3001 is not in use
3. Clear Vercel cache: `vercel --clear`
4. Restart with header size fix: `npm run dev:vercel`

**Error**: API routes not found
**Solution**:
1. Ensure `VITE_API_URL` is set to `/api` for Vercel serverless functions
2. Check that API functions are in the `api/` directory
3. Verify Vercel dev server is running on port 3001
4. Check proxy configuration in `apps/frontend/vite.config.ts`

---

### Performance and Monitoring Issues

**Error**: Sentry not tracking errors

**Solution**:
1. Verify `SENTRY_DSN` is correctly configured
2. Check that `SENTRY_AUTH_TOKEN` is set for releases
3. Ensure Sentry environment variables are not exposed to client
4. Test error reporting with development builds

**Error**: Performance monitoring not working

**Solution**:
1. Verify `VITE_PERFORMANCE_ENABLE_SAMPLING` is set to `true`
2. Check that `VITE_PERFORMANCE_SAMPLE_RATE` is appropriate (0.1 = 10%)
3. Ensure performance monitoring component is loaded in `App.tsx`
4. Test performance metrics in development mode

---

### Node.js Header Size Issues (UPDATE)

**Error**: `431 Request Header Fields Too Large` when accessing API endpoints

**Cause**: This error occurs when request headers (primarily the Clerk JWT token in the Authorization header) exceed Node.js's default 16KB limit.

**Solution**:

1. Ensure you're running the development server with the correct command:
   ```bash
   npm run dev  # This includes the header size fix
   ```

2. If running Vercel dev manually, use the increased header size:
   ```bash
   NODE_OPTIONS="--max-http-header-size=65536" vercel dev --listen 3001
   ```

3. Try refreshing your Clerk session:
   - Sign out of the application
   - Sign back in
   - This generates a new, potentially smaller token

**Prevention**:

- Keep Clerk user metadata lean (avoid storing large objects)
- Use database references instead of embedding data in tokens
- Consider using Clerk sessions with shorter expiration times
- Avoid storing large arrays or objects in public/private metadata

**Production Deployment**:
The fix is automatically applied in production via Vercel's serverless functions configuration. If deploying elsewhere, ensure Node.js is started with:
```bash
NODE_OPTIONS="--max-http-header-size=65536" node server.js
```

---

## Configuration Changes

### Recent Configuration Migrations

The project has undergone configuration consolidation to improve maintainability and consistency across the monorepo:

**Moved to `tools/configs/` directory**:
- `commitlint.config.cjs` - Commit message validation rules
- `.prettierrc` - Prettier formatting configuration  
- `.prettierignore` - Files to ignore during formatting
- `jest.config.cjs` - Root-level Jest configuration for backend testing
- `components.json` - ShadCN UI component library settings

**Removed standalone files**:
- `.prettierignore` (root)
- `.prettierrc` (root) 
- `commitlint.config.cjs` (root)
- `jest.config.cjs` (root)

**Updated workspace scripts** to reference new config locations using relative paths:
```json
{
  "scripts": {
    "format": "prettier --write . --config ../../tools/configs/.prettierrc --ignore-path ../../tools/configs/.prettierignore",
    "lint:fix": "npx eslint --fix"
  }
}
```

**Benefits**:
- Centralized configuration management
- Consistent config sharing across workspaces
- Easier maintenance and updates
- Better separation of concerns

All workspace scripts have been updated to reference the new configuration locations. The ESLint configuration remains hierarchical with root, frontend, and backend-specific configs as before.

---

### Environment Variables Not Loading

**Issue**: Frontend variables (`VITE_*`) not accessible

**Solution**:

- Ensure variables start with `VITE_` prefix
- Restart Vite dev server after adding variables
- Check variable names match exactly (case-sensitive)
- Verify `.env` file is in project root

**Issue**: API variables not loading

**Solution**:

- For Vercel: Add variables in Vercel Dashboard
- For local: Ensure `.env` file is in project root
- Restart Vercel dev server after adding variables
- Check variable names match exactly (case-sensitive)

---

## Related Documentation

- This document contains all API environment variable documentation
- [Onboarding Guide](./onboarding.md) - Complete development guide
- [Deployment Guide](../deployment/ci-cd.md) - Production deployment setup
- [Configuration Utility](../../apps/frontend/src/utils/config.ts) - Frontend config implementation

---

**Last Updated**: 2026-01-09
