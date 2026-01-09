# TCDynamics Repository Graph Tree

**Repository**: `lawmight/TCDynamics`
**Type**: Monorepo (npm workspaces)
**Platform**: AI-powered automation platform for French SMEs
**Architecture**: Hybrid (Vercel serverless API + React frontend)

---

## Repository Structure Overview

```
TCDynamics/
├── 📦 Root (tcdynamics-workspace)
│   ├── Workspaces: apps/*
│   ├── Package Manager: npm (>=9.0.0)
│   └── Node.js: >=18.0.0
│
├── 🌐 Frontend Application (apps/frontend)
│   ├── Framework: React 18.3.1 + Vite 7.1.7
│   ├── Language: TypeScript 5.8.3
│   ├── UI: Tailwind CSS + shadcn/ui (Radix UI)
│   ├── State: TanStack Query 5.90.2
│   ├── Auth: Clerk React
│   ├── Testing: Vitest + Playwright
│   └── Deployment: Vercel
│
├── 🔌 API Layer (api/)
│   ├── Runtime: Vercel Serverless Functions (Node.js ESM)
│   ├── Database: MongoDB Atlas (Mongoose 9.1.1)
│   ├── Auth: Clerk Backend + API Key Auth
│   ├── Payments: Polar SDK
│   ├── Email: Resend 6.4.2
│   ├── AI: Google Vertex AI
│   └── Monitoring: Sentry 7.0.0
│
├── 🖥️ Backend Server (apps/backend)
│   ├── Framework: Express 4.21.2 (TypeScript)
│   ├── Validation: Joi 17.13.3
│   ├── Logging: Pino 8.19.0 + Winston 3.17.0
│   ├── Testing: Jest 30.2.0
│   └── Usage: Local development only (not deployed)
│
└── 📚 Archived Components
    └── Azure Functions (apps/functions-archive/)
        ├── Language: Python
        └── Status: Archived (deprecated)
```

---

## Detailed Directory Tree

### Root Configuration

```
TCDynamics/
│
├── 📄 package.json (workspace root)
├── 📄 package-lock.json
├── 📄 README.md
├── 📄 vercel.json (Vercel deployment config)
├── 📄 vercel.json.dev
├── 📄 eslint.config.js (root ESLint config)
├── 📄 jest.config.js
├── 📄 commitlint.config.cjs
├── 📄 greptile.json
│
├── 📁 api/ (Vercel Serverless Functions)
├── 📁 apps/ (npm workspaces)
├── 📁 docs/ (documentation)
├── 📁 docker/ (containerization configs)
├── 📁 scripts/ (deployment scripts)
├── 📁 tests/ (E2E tests)
├── 📁 tools/ (dev tools & configs)
└── 📁 node_modules/ (root dependencies)
```

---

### 🌐 Frontend Application (`apps/frontend/`)

```
apps/frontend/
│
├── 📄 package.json
├── 📄 vite.config.ts (Vite configuration)
├── 📄 tsconfig.json (TypeScript config)
├── 📄 tsconfig.app.json
├── 📄 tsconfig.e2e.json
├── 📄 tsconfig.node.json
├── 📄 vitest.config.ts (Vitest testing config)
├── 📄 playwright.config.ts (E2E testing)
├── 📄 tailwind.config.ts (Tailwind CSS config)
├── 📄 postcss.config.js
├── 📄 eslint.config.js
├── 📄 components.json (shadcn/ui config)
├── 📄 lighthouserc.js (Lighthouse CI)
├── 📄 index.html
├── 📄 staticwebapp.config.json
│
├── 📁 src/
│   ├── 📄 main.tsx (entry point)
│   ├── 📄 App.tsx (root component)
│   ├── 📄 App.css
│   ├── 📄 index.css
│   ├── 📄 vite-env.d.ts
│   │
│   ├── 📁 pages/ (30 route components)
│   │   ├── Index.tsx, About.tsx, Pricing.tsx
│   │   ├── Contact.tsx, Demo.tsx, Dashboard.tsx
│   │   └── ... (25 more pages)
│   │
│   ├── 📁 components/ (102 TSX components)
│   │   ├── 📁 ui/ (20 shadcn/ui primitives)
│   │   │   ├── button.tsx, input.tsx, card.tsx
│   │   │   ├── dialog.tsx, dropdown-menu.tsx
│   │   │   └── ... (15 more UI components)
│   │   │
│   │   ├── 📁 app/ (4 app-specific components)
│   │   │   └── AppLayout.tsx, ...
│   │   │
│   │   ├── 📁 __tests__/ (18 test files)
│   │   │
│   │   ├── AIChatbot.tsx
│   │   ├── AIDemo.tsx
│   │   ├── Contact.tsx
│   │   ├── DocumentProcessor.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── OptimizedImage.tsx
│   │   ├── Pricing.tsx
│   │   └── ... (other components)
│   │
│   ├── 📁 hooks/ (custom React hooks)
│   │   ├── 📁 __tests__/ (9 test files)
│   │   ├── useAuth.tsx (Clerk authentication)
│   │   ├── useApiKeys.ts
│   │   ├── useContactForm.ts
│   │   ├── useDemoForm.ts
│   │   ├── useFormSubmit.ts
│   │   ├── useIntersectionObserver.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useBodyScrollLock.ts
│   │   ├── useThrottle.ts
│   │   └── useToggle.ts
│   │
│   ├── 📁 api/ (API client functions)
│   │   ├── 📁 __tests__/ (1 test file)
│   │   ├── analytics.ts
│   │   ├── apiKeys.ts
│   │   ├── azureServices.ts (Azure Functions clients)
│   │   ├── files.ts
│   │   ├── metrics.ts
│   │   └── vertex.ts (Vertex AI client)
│   │
│   ├── 📁 utils/ (utility functions)
│   │   ├── 📁 __tests__/ (6 test files)
│   │   ├── aiCache.ts
│   │   ├── analytics.ts (Vercel Analytics)
│   │   ├── apiConfig.ts
│   │   ├── config.ts
│   │   ├── csrf.ts
│   │   ├── isomorphic.ts
│   │   ├── logger.ts
│   │   ├── math.ts
│   │   ├── monitoring.tsx
│   │   ├── performance.ts
│   │   ├── performance-optimized.ts
│   │   ├── polar.ts (Polar payment utils)
│   │   ├── security.ts
│   │   └── swRegistration.ts (Service Worker)
│   │
│   ├── 📁 lib/
│   │   └── utils.ts (cn() class utility)
│   │
│   ├── 📁 config/
│   │   └── clerkTheme.ts (Clerk UI theme)
│   │
│   ├── 📁 data/
│   │   └── productHighlights.ts
│   │
│   ├── 📁 assets/
│   │   ├── hero-automation-video.mp4
│   │   ├── hero-automation.jpg
│   │   └── hero-network.jpg
│   │
│   └── 📁 test/
│       ├── setup.ts (test setup)
│       ├── utils.tsx (test utilities)
│       └── 📁 mocks/ (2 mock files)
│
├── 📁 public/ (13 static assets)
│   ├── favicon.ico
│   ├── *.png (5 images)
│   └── *.js (4 scripts)
│
├── 📁 dist/ (build output)
├── 📁 node_modules/
│
├── 📁 plugins/
│   └── vite-csp-hash-plugin.ts (CSP hash generator)
│
├── 📁 scripts/
│   ├── check-coep-resources.js
│   └── compute-csp-hash.js
│
└── 📁 api/ (duplicated from root for Vercel deployment)
    └── ... (same structure as root api/)
```

---

### 🔌 API Layer (`api/`)

```
api/
│
├── 📄 package.json (serverless functions)
│
├── 📁 _lib/ (shared utilities)
│   ├── auth.js (Clerk JWT verification)
│   ├── api-key-auth.js (API key authentication)
│   ├── mongodb.js (MongoDB connection singleton)
│   ├── mongodb-db.js (database utilities)
│   ├── cache.js (LRU cache implementation)
│   ├── email.js (Resend email service)
│   ├── vertex.js (Google Vertex AI client)
│   ├── sentry.js (Sentry error tracking)
│   ├── request-guards.js (request validation)
│   │
│   └── 📁 models/ (Mongoose schemas - 10 models)
│       ├── User.js (Clerk user sync)
│       ├── Contact.js
│       ├── DemoRequest.js
│       ├── Feedback.js
│       ├── ApiKey.js
│       ├── ChatConversation.js
│       ├── KnowledgeFile.js
│       ├── AnalyticsEvent.js
│       ├── PolarEvent.js (payment events)
│       └── UsageLog.js
│
├── 📁 app/ (application routes)
│   └── 📁 api-keys/
│       ├── api-keys.js (list/create API keys)
│       └── 📁 [id]/
│           └── restore.js (restore API key)
│
├── 📁 polar/ (Polar payment integration)
│   ├── create-checkout-session.js
│   ├── checkout-session.js
│   ├── webhook.js (payment webhook handler)
│   └── 📁 checkout/
│
├── 📁 webhooks/
│   └── clerk.js (Clerk user webhook)
│
├── 📁 scripts/ (database migration scripts)
│   ├── find-duplicate-emails.js
│   ├── migrate-email-unique.js
│   └── rollback-email-unique.js
│
├── 📄 analytics.js (analytics endpoint)
├── 📄 chat.js (AI chat endpoint)
├── 📄 files.js (file upload/management)
├── 📄 forms.js (form submissions)
├── 📄 vertex.js (Vertex AI endpoint)
├── 📄 vision.js (image analysis endpoint)
├── 📄 jest.config.js
└── 📁 node_modules/
```

**API Endpoints Summary:**
- `/api/analytics` - Analytics event tracking
- `/api/chat` - AI chat conversations
- `/api/files` - File upload/management
- `/api/forms` - Form submissions (contact/demo)
- `/api/vertex` - Google Vertex AI direct access
- `/api/vision` - Image analysis (archived functionality)
- `/api/app/api-keys` - API key management
- `/api/polar/*` - Payment processing
- `/api/webhooks/clerk` - Clerk user sync

---

### 🖥️ Backend Server (`apps/backend/`)

```
apps/backend/
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 jest.config.js
├── 📄 Dockerfile
├── 📄 ecosystem.config.js (PM2 config)
├── 📄 healthcheck.js
├── 📄 env.example
├── 📄 init.sql (database init - not used)
│
├── 📁 src/ (TypeScript source)
│   ├── 📄 server.ts (Express server entry)
│   ├── 📄 server.js (compiled JS)
│   ├── 📄 app.ts (Express app setup)
│   ├── 📄 swagger.js (API documentation)
│   │
│   ├── 📁 config/ (configuration)
│   │   ├── database.ts (DB connection)
│   │   ├── environment.ts (env validation)
│   │   ├── email.js (email config)
│   │   └── middleware.ts (middleware config)
│   │
│   ├── 📁 routes/ (Express routes - 8 routes)
│   │   ├── 📁 __tests__/ (3 test files)
│   │   ├── contact.js
│   │   ├── demo.js
│   │   ├── feedback.js
│   │   ├── monitoring.js
│   │   └── rum.js (Real User Monitoring)
│   │
│   ├── 📁 middleware/ (Express middleware - 5 files)
│   │   ├── 📁 __tests__/ (1 test file)
│   │   ├── auth.js (Clerk authentication)
│   │   ├── csrf.js (CSRF protection)
│   │   ├── errorHandler.js
│   │   └── security.js (Helmet config)
│   │
│   ├── 📁 services/ (business logic)
│   │   └── email.service.ts (email service)
│   │
│   ├── 📁 utils/ (utilities - 9 files)
│   │   ├── 📁 __tests__/ (3 test files)
│   │   ├── logger.js (Pino logger)
│   │   ├── logger.d.ts
│   │   ├── db.js (database helpers)
│   │   ├── routeFactory.js
│   │   ├── validation.js (Joi validation)
│   │   └── validationHelpers.js
│   │
│   ├── 📁 types/ (TypeScript types)
│   │   ├── logger.d.ts
│   │   └── routes.d.ts
│   │
│   ├── 📁 __tests__/ (test setup)
│   │   └── setup.js
│   │
│   └── 📁 logs/ (log files - gitignored)
│       ├── error.log
│       ├── exceptions.log
│       ├── rejections.log
│       └── security.log
│
├── 📁 dist/ (compiled JavaScript)
├── 📁 coverage/ (test coverage reports)
└── 📁 node_modules/
```

**Note**: Backend is for local development only. Production uses Vercel serverless functions.

---

### 📚 Documentation (`docs/`)

```
docs/
│
├── 📄 AGENTS.md (AI agent documentation)
├── 📄 AZURE_FUNCTIONS.md (Azure Functions guide)
├── 📄 azure-vision-migration.md (migration planning)
├── 📄 coep-header-fix.md (COEP header rationale)
├── 📄 DEPLOYMENT.md (deployment guide)
├── 📄 GIT_STATUS.md (git workflow)
├── 📄 MCP_DIFFERENTIATION_STRATEGY.md
├── 📄 SECURITY_HEADERS.md (security configuration)
├── 📄 VERTEX_LOCATION_MIGRATION.md
├── 📄 WORKFLOW_RESEARCH.md
│
└── 📁 archive/
    ├── supabase-schema.sql (deprecated schema)
    └── vercel.json.backup (old config)
```

---

### 🐳 Docker Configuration (`docker/`)

```
docker/
│
├── 📄 docker-compose.yml (local development)
├── 📄 Dockerfile.frontend (Frontend container)
├── 📄 nginx.conf (Nginx reverse proxy)
└── 📄 redis.conf (Redis configuration)
```

---

### 🧪 Testing (`tests/`)

```
tests/
│
└── 📁 e2e/ (Playwright E2E tests - 5 files)
    ├── 📄 global-setup.ts
    ├── 📄 global-teardown.ts
    ├── 📄 navigation.spec.ts
    ├── 📄 contact-flow.spec.ts
    └── 📄 third-party-resources.spec.ts
```

---

### 🛠️ Tools & Scripts

```
tools/
│
├── 📁 configs/ (shared configurations)
│   ├── commitlint.config.cjs
│   ├── components.json
│   └── eslint.config.js
│
└── 📁 scripts/ (development scripts)
    ├── detect-workspace.js
    ├── fix-current.js
    ├── pre-push-checks.js
    ├── quick-check.js
    ├── setup-nginx-csp.sh
    └── test-this.js

scripts/ (root deployment scripts)
│
├── 📄 deploy-vercel.ps1 (full Vercel deployment)
├── 📄 deploy-vercel-frontend-only.ps1
└── 📄 migrate-stripe-to-polar.sql
```

---

### 📦 Archived Components

```
apps/functions-archive/
│
├── 📄 workflow-python-functions.yml (GitHub Actions)
│
└── 📁 functions/ (Azure Functions - Python)
    ├── 📄 *.py (7 Python function files)
    ├── 📄 *.txt (3 requirements/config files)
    └── 📄 *.bat (2 batch scripts)
```

**Status**: Archived - Azure Computer Vision API deprecated (retires 2028)

---

## Technology Stack Graph

```
┌─────────────────────────────────────────────────────────┐
│              TCDynamics Architecture                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Frontend       │         │   API Layer      │
│   (React + Vite) │◄────────┤ (Vercel Serverless)│
│                  │  HTTP   │                  │
│  - Clerk Auth    │         │  - MongoDB Atlas │
│  - TanStack Query│         │  - Vertex AI     │
│  - shadcn/ui     │         │  - Polar Payments│
│  - Tailwind CSS  │         │  - Resend Email  │
└──────────────────┘         └──────────────────┘
       │                             │
       │                             │
       ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│   Vercel CDN     │         │   External APIs  │
│   (Edge Network) │         │                  │
└──────────────────┘         │  - Clerk (Auth)  │
                             │  - Google (AI)   │
                             │  - Polar (Pay)   │
                             │  - MongoDB (DB)  │
                             │  - Sentry (Logs) │
                             └──────────────────┘

┌──────────────────┐
│   Backend        │
│   (Express - Dev)│
│                  │
│  - Local Testing │
│  - Not Deployed  │
└──────────────────┘
```

---

## Dependency Graph

### Frontend Dependencies
- **Core**: React 18.3.1, React DOM 18.3.1
- **Routing**: React Router DOM 6.30.3
- **State**: TanStack Query 5.90.2
- **Forms**: React Hook Form 7.54.2, Zod 3.25.76
- **Auth**: Clerk React 5.59.3
- **UI**: Radix UI, shadcn/ui, Tailwind CSS 3.4.17
- **Icons**: Lucide React
- **Testing**: Vitest 3.2.4, Playwright, Testing Library
- **Build**: Vite 7.1.7, SWC plugin

### API Dependencies
- **Auth**: Clerk Backend 1.0.0, bcryptjs 2.4.3
- **Database**: MongoDB 7.0.0, Mongoose 9.1.1
- **Payments**: Polar SDK 0.42.1
- **Email**: Resend 6.4.2
- **AI**: Google Auth Library 9.14.1
- **Monitoring**: Sentry Node 7.0.0
- **Caching**: LRU Cache 11.0.1
- **Webhooks**: Svix 1.84.1

### Backend Dependencies
- **Server**: Express 4.21.2
- **Validation**: Joi 17.13.3
- **Logging**: Pino 8.19.0, Winston 3.17.0
- **Security**: Helmet 8.1.0, CSRF-CSRF 4.0.3
- **Rate Limiting**: Express Rate Limit 7.5.1
- **Email**: Nodemailer 7.0.12
- **Testing**: Jest 30.2.0

---

## Data Flow Graph

```
User Request Flow:
─────────────────

1. Browser (React App)
   ↓
2. Vercel Edge Network (CDN)
   ↓
3. Frontend Route Handler (React Router)
   ↓
4. Component → API Client (fetch)
   ↓
5. Vercel Serverless Function (/api/*)
   ↓
6. Authentication (Clerk JWT or API Key)
   ↓
7. Business Logic (MongoDB queries, external APIs)
   ↓
8. Response → Frontend → React Query Cache
   ↓
9. UI Update (React re-render)

External Service Flow:
──────────────────────

- Clerk: User authentication → Webhook → MongoDB User sync
- Vertex AI: Chat requests → API endpoint → Vertex AI API
- Polar: Checkout → Session creation → Webhook → MongoDB event log
- Resend: Form submissions → Email API → User notification
- Sentry: Errors → Error tracking → Dashboard
```

---

## File Type Statistics

- **TypeScript/TSX**: ~150 files (frontend)
- **JavaScript**: ~80 files (API + backend)
- **Python**: 7 files (archived functions)
- **Configuration**: ~30 files (JSON, YAML, config files)
- **Documentation**: 11 markdown files
- **Tests**: ~35 test files (Vitest, Jest, Playwright)

---

## Key Features by Component

### Frontend
- ✅ Multi-page React SPA (30+ pages)
- ✅ Clerk authentication integration
- ✅ AI chatbot interface
- ✅ Document processor
- ✅ Responsive design (Tailwind CSS)
- ✅ Performance monitoring
- ✅ Error boundaries
- ✅ Service worker (PWA features)

### API Layer
- ✅ Serverless functions (Vercel)
- ✅ MongoDB database (Atlas)
- ✅ API key authentication
- ✅ Payment processing (Polar)
- ✅ Email notifications (Resend)
- ✅ AI chat (Vertex AI)
- ✅ File upload/management
- ✅ Analytics tracking
- ✅ Webhook handlers

### Backend (Dev Only)
- ✅ Express REST API
- ✅ Swagger documentation
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Security headers (Helmet)
- ✅ Request validation (Joi)
- ✅ Structured logging

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Vercel Deployment               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │  API Routes  │   │
│  │  (Static)    │  │ (Serverless) │   │
│  │              │  │              │   │
│  │  apps/       │  │  api/*.js    │   │
│  │  frontend/   │  │              │   │
│  │  dist/       │  │  12 function │   │
│  │              │  │   limit      │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  Configuration: vercel.json (root)     │
│  Build: npm run build:frontend         │
│  Deploy: npm run deploy:vercel         │
└─────────────────────────────────────────┘
```

---

## Repository Statistics

- **Total Files**: ~400+ source files
- **Lines of Code**: ~30,000+ (estimated)
- **Languages**: TypeScript, JavaScript, Python, SQL, Markdown
- **Workspaces**: 2 (frontend, backend)
- **Monorepo**: Yes (npm workspaces)
- **Deployment**: Vercel (production)
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (configured)

---

**Last Updated**: 2026-01-06
**Repository**: lawmight/TCDynamics
**Documentation Generated**: Using Nia MCP + Local Filesystem Analysis
