# TCDynamics Tech Stack Architecture

> **For Mermaid Live Editor**: Copy the raw code from `tech-stack-diagram.mmd` file (pure Mermaid syntax without markdown wrapper)

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        FE["React 18.3.1 + TypeScript 5.8.3"]
        VITE["Vite 7.1.7 Build"]
        TAIL["Tailwind CSS 3.4.17"]
        RADIX["Radix UI Components"]
        RQ["TanStack Query 5.90.2"]
        ROUTER["React Router 6.30.1"]
        ZOD["Zod 3.25.76"]
        FE --> VITE
        FE --> TAIL
        FE --> RADIX
        FE --> RQ
        FE --> ROUTER
        FE --> ZOD
    end

    subgraph Backend["Backend Layer"]
        EXPRESS["Express 4.21.2 + TS"]
        NODE["Node.js 18+"]
        EXPRESS --> NODE
    end

    subgraph Database["Database Layer"]
        PG[("PostgreSQL 15")]
        REDIS[("Redis 7")]
        SUPABASE[("Supabase")]
        PG --> SUPABASE
    end

    subgraph Serverless["Serverless Functions"]
        VFUNC["Vercel Functions<br/>Node.js"]
        AFUNC["Azure Functions<br/>Python 3"]
        OPENAI["OpenAI SDK"]
        AZUREAI["Azure AI Vision"]
        AFUNC --> OPENAI
        AFUNC --> AZUREAI
    end

    subgraph Services["Third-Party Services"]
        STRIPE["Stripe"]
        RESEND["Resend"]
        NODEMAILER["Nodemailer"]
        SENTRY["Sentry"]
        VERCEL_ANALYTICS["Vercel Analytics"]
    end

    subgraph Infrastructure["Infrastructure"]
        DOCKER["Docker + Compose"]
        NGINX["Nginx"]
        GHA["GitHub Actions CI/CD"]
        VERCEL_DEPLOY["Vercel Deployment"]
        AZURE_DEPLOY["Azure Deployment"]
    end

    subgraph DevTools["Dev Tools"]
        ESLINT["ESLint 9.36.0"]
        PRETTIER["Prettier 3.6.2"]
        HUSKY["Husky"]
        COMMITLINT["Commitlint"]
        VITEST["Vitest 3.2.4"]
        PLAYWRIGHT["Playwright E2E"]
        JEST["Jest 30.2.0"]
    end

    FE --> EXPRESS
    FE --> VFUNC
    FE --> STRIPE
    FE --> SUPABASE
    FE --> SENTRY
    FE --> VERCEL_ANALYTICS
    EXPRESS --> PG
    EXPRESS --> REDIS
    VFUNC --> STRIPE
    VFUNC --> RESEND
    VFUNC --> SUPABASE
    AFUNC --> STRIPE
    EXPRESS --> NODEMAILER
    VERCEL_DEPLOY --> FE
    AZURE_DEPLOY --> AFUNC
    DOCKER --> NGINX
    DOCKER --> EXPRESS
    DOCKER --> PG
    DOCKER --> REDIS
    GHA --> VERCEL_DEPLOY
    GHA --> AZURE_DEPLOY

    style FE fill:#61dafb
    style EXPRESS fill:#000000,color:#fff
    style PG fill:#336791,color:#fff
    style REDIS fill:#dc382d,color:#fff
    style SUPABASE fill:#3ecf8e,color:#fff
    style STRIPE fill:#635bff,color:#fff
    style VERCEL_DEPLOY fill:#000000,color:#fff
    style AZURE_DEPLOY fill:#0078d4,color:#fff
    style DOCKER fill:#2496ed,color:#fff
```

## Tech Stack Summary

### Frontend

- **Framework**: React 18.3.1 + TypeScript 5.8.3
- **Build**: Vite 7.1.7
- **UI**: Tailwind CSS 3.4.17 + Radix UI
- **State**: TanStack Query 5.90.2
- **Routing**: React Router 6.30.1
- **Validation**: Zod 3.25.76
- **Testing**: Vitest 3.2.4 + Playwright

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express 4.21.2 + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Logging**: Pino 8.19.0 + Winston 3.17.0
- **Security**: Helmet + CSRF + Rate Limiting
- **Testing**: Jest 30.2.0

### Serverless

- **Vercel Functions**: Node.js
- **Azure Functions**: Python 3
- **AI**: OpenAI SDK + Azure AI Vision

### Services

- **Database/Auth**: Supabase
- **Payments**: Stripe
- **Email**: Resend + Nodemailer
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics

### Infrastructure

- **Containers**: Docker + Docker Compose
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) + Azure (functions)

### Dev Tools

- **Linting**: ESLint 9.36.0
- **Formatting**: Prettier 3.6.2
- **Git Hooks**: Husky + Commitlint
- **Package Manager**: npm 9+








