# TCDynamics Repository Graph Tree

**Repository**: `lawmight/TCDynamics`
**Type**: Monorepo (npm workspaces)
**Platform**: AI-powered automation platform for French SMEs
**Architecture**: Hybrid (Vercel serverless API + React frontend)

---

## Repository Structure Overview

```mermaid
flowchart TB
    Root[TCDynamics Root] --> Frontend[Frontend<br/>apps/frontend/]
    Root --> API[API Layer<br/>api/]
    Root --> Backend[Backend<br/>apps/backend/]
    Root --> Archived[Archived<br/>apps/functions-archive/]

    Frontend --> FE_Tech[React + Vite<br/>TypeScript]
    Frontend --> FE_UI[Tailwind CSS<br/>shadcn/ui]
    Frontend --> FE_Auth[Clerk Auth]

    API --> API_Tech[Serverless Functions<br/>Node.js ESM]
    API --> API_DB[MongoDB Atlas]
    API --> API_AI[Vertex AI + OpenAI]

    Backend --> BE_Tech[Express<br/>TypeScript]
    Backend --> BE_Note[Local Dev Only]
```

---

## Root Directory Structure

```mermaid
flowchart TD
    Root[TCDynamics/] --> Config[Config Files]
    Root --> API_Dir[api/]
    Root --> Apps_Dir[apps/]
    Root --> Docs_Dir[docs/]
    Root --> Scripts_Dir[scripts/]
    Root --> Tests_Dir[tests/]
    Root --> Tools_Dir[tools/]

    Config --> CF1[package.json]
    Config --> CF2[vercel.json]
    Config --> CF3[eslint.config.js]
    Config --> CF4[jest.config.js]
```

---

## Frontend Application Structure

```mermaid
flowchart TB
    Frontend[apps/frontend/] --> Src[src/]
    Frontend --> Config[Config Files]
    Frontend --> Public[public/]

    Src --> Pages[pages/<br/>31 route components]
    Src --> Components[components/<br/>64 TSX components]
    Src --> Hooks[hooks/<br/>Custom React hooks]
    Src --> API[api/<br/>API clients]
    Src --> Utils[utils/<br/>Utilities]

    Components --> UI[ui/<br/>20 shadcn/ui]
    Components --> AppComp[app/<br/>4 app-specific]
    Components --> MainComp[Main Components<br/>AIChatbot, AIDemo, etc.]

    Hooks --> HookFiles[useAuth<br/>useApiKeys<br/>useContactForm]

    API --> APIFiles[analytics.ts<br/>apiKeys.ts<br/>vertex.ts]

    Utils --> UtilFiles[aiCache.ts<br/>analytics.ts<br/>security.ts]
```

---

## API Layer Structure

```mermaid
flowchart TB
    API[api/] --> Lib[_lib/]
    API --> AppRoutes[app/]
    API --> Polar[polar/]
    API --> Webhooks[webhooks/]
    API --> Endpoints[Endpoints]

    Lib --> LibFiles[auth.js<br/>mongodb.js<br/>email.js<br/>vertex.js]
    Lib --> Models[models/<br/>10 Mongoose schemas]

    Models --> ModelFiles[User.js<br/>Contact.js<br/>ApiKey.js<br/>ChatConversation.js]

    AppRoutes --> APIKeys[api-keys/<br/>api-keys.js]

    Polar --> PolarFiles[checkout.js<br/>webhook.js]

    Endpoints --> EndpointFiles[analytics.js<br/>ai.js<br/>emails.js<br/>files.js<br/>forms.js<br/>user.js]
```

### API Endpoints

```mermaid
flowchart LR
    Endpoints[API Endpoints] --> Analytics[/api/analytics]
    Endpoints --> Chat[/api/ai?provider=openai&action=chat]
    Endpoints --> Files[/api/files]
    Endpoints --> Forms[/api/forms]
    Endpoints --> Vertex[/api/ai?provider=vertex&action=chat]
    Endpoints --> APIKeys[/api/app/api-keys]
    Endpoints --> Polar[/api/polar/*]
    Endpoints --> ClerkWebhook[/api/webhooks/clerk]
```

---

## Backend Server Structure

```mermaid
flowchart TB
    Backend[apps/backend/] --> Src[src/]
    Backend --> Config[Config Files]

    Src --> Routes[routes/<br/>8 routes]
    Src --> Middleware[middleware/<br/>5 files]
    Src --> Services[services/]
    Src --> Utils[utils/]
    Src --> ConfigDir[config/]

    Routes --> RouteFiles[contact.js<br/>demo.js<br/>feedback.js<br/>monitoring.js]

    Middleware --> MiddlewareFiles[auth.js<br/>csrf.js<br/>errorHandler.js<br/>security.js]

    Services --> ServiceFiles[email.service.ts]

    Utils --> UtilFiles[logger.js<br/>validation.js<br/>db.js]

    ConfigDir --> ConfigFiles[database.ts<br/>environment.ts<br/>email.js]

    Backend --> Note[⚠️ Local Dev Only]
```

---

## Technology Stack

```mermaid
flowchart TB
    Frontend[Frontend Application] --> API[API Layer]
    API --> External[External Services]
    Frontend --> CDN[Vercel CDN]

    subgraph FrontendStack["Frontend Stack"]
        FE1[React 18.3.1 + Vite]
        FE2[Clerk Auth]
        FE3[TanStack Query]
        FE4[shadcn/ui + Tailwind]
        FE5[Sentry Browser]
    end

    subgraph APILayer["API Layer"]
        API1[Serverless Functions]
        API2[Node.js ESM]
    end

    subgraph ExternalServices["External Services"]
        EXT1[Clerk]
        EXT2[MongoDB Atlas]
        EXT3[Polar]
        EXT4[Vertex AI]
        EXT5[OpenAI GPT-4o]
        EXT6[Resend]
        EXT7[Sentry Node]
    end

    Frontend --> FrontendStack
    API --> APILayer
    External --> ExternalServices
```

---

## Data Flow

### User Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant CDN as Vercel CDN
    participant Router as React Router
    participant Component
    participant API as API Client
    participant Serverless as Serverless Function
    participant Auth
    participant Services as External Services
    participant Cache as React Query Cache

    Browser->>CDN: Request assets
    CDN-->>Browser: Serve cached assets
    Browser->>Router: Navigate
    Router->>Component: Render
    Component->>API: API call
    API->>Serverless: HTTP request
    Serverless->>Auth: Verify
    Auth-->>Serverless: Authenticated
    Serverless->>Services: Business Logic
    Services-->>Serverless: Response
    Serverless-->>API: JSON response
    API->>Cache: Store
    Cache->>Component: Return data
    Component->>Browser: Update UI
```

### External Service Flow

```mermaid
flowchart LR
    subgraph AuthFlow["Authentication"]
        A1[User Auth] -->|Clerk| A2[Webhook]
        A2 -->|Sync| A3[MongoDB User]
    end

    subgraph AIFlow["AI Services"]
        B1[Chat Request] -->|API| B2[Vertex AI]
        C1[Vision Request] -->|API| C2[OpenAI GPT-4o]
    end

    subgraph PaymentFlow["Payments"]
        D1[Checkout] -->|Create| D2[Polar]
        D2 -->|Webhook| D3[MongoDB Event]
    end

    subgraph EmailFlow["Email"]
        E1[Form] -->|Send| E2[Resend]
        E2 -->|Notify| E3[User]
    end
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Vercel["Vercel Deployment"]
        FrontendDeploy[Frontend<br/>Static Assets]
        APIDeploy[API Routes<br/>Serverless Functions]
        Config[vercel.json]
    end

    subgraph CDN["Vercel CDN"]
        CDN_Static[Static Assets]
        CDN_Edge[Edge Network]
    end

    subgraph External["External Services"]
        EXT1[MongoDB Atlas]
        EXT2[Polar]
        EXT3[Clerk]
        EXT4[Vertex AI]
        EXT5[OpenAI]
        EXT6[Resend]
        EXT7[Sentry]
    end

    FrontendDeploy --> CDN_Static
    CDN_Edge --> Users[Users]
    APIDeploy --> External
    Config -.-> FrontendDeploy
    Config -.-> APIDeploy
```

---

## Dependency Graph

```mermaid
flowchart LR
    subgraph FrontendDeps["Frontend"]
        FE1[React 18.3.1]
        FE2[React Router 6.30.3]
        FE3[TanStack Query 5.90.17]
        FE4[Clerk React 5.59.3]
        FE5[Tailwind CSS 3.4.19]
        FE6[Vitest 3.2.4]
        FE7[Vite 7.3.0]
    end

    subgraph APIDeps["API"]
        API1[Clerk Backend 1.0.0]
        API2[Mongoose 9.1.1]
        API3[Polar SDK 0.42.1]
        API4[Resend 6.4.2]
        API5[Sentry Node 7.0.0]
        API6[LRU Cache 11.0.1]
    end

    subgraph BackendDeps["Backend"]
        BE1[Express 4.22.1]
        BE2[Joi 17.13.3]
        BE3[Pino 8.19.0]
        BE4[Helmet 8.1.0]
        BE5[Jest 30.2.0]
    end
```

---

## Repository Statistics

```mermaid
pie title File Type Distribution
    "TypeScript/TSX" : 150
    "JavaScript" : 80
    "Python" : 7
    "Configuration" : 30
    "Documentation" : 11
    "Tests" : 35
```

### Statistics Summary

- **Total Files**: ~400+ source files
- **Lines of Code**: ~30,000+ (estimated)
- **Languages**: TypeScript, JavaScript, Python, SQL, Markdown
- **Workspaces**: 2 (frontend, backend)
- **Monorepo**: Yes (npm workspaces)
- **Deployment**: Vercel (production)
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (configured)

---

## Key Features

### Frontend Features

```mermaid
mindmap
  root((Frontend))
    Multi-page SPA
      30+ pages
      React Router
    Authentication
      Clerk integration
      Protected routes
    AI Features
      Chatbot
      Document processor
    UI/UX
      Responsive design
      Tailwind CSS
      shadcn/ui
    Performance
      Monitoring
      Error boundaries
      PWA
```

### API Features

```mermaid
mindmap
  root((API))
    Serverless
      Vercel Functions
      Node.js ESM
    Database
      MongoDB Atlas
      Mongoose ODM
    Authentication
      Clerk JWT
      API Key Auth
    Integrations
      Payment (Polar)
      Email (Resend)
      AI (Vertex AI)
      File Management
    Monitoring
      Analytics
      Webhooks
      Sentry
```

### Backend Features

```mermaid
mindmap
  root((Backend))
    Express REST API
      Swagger docs
      TypeScript
    Security
      Rate limiting
      CSRF protection
      Helmet headers
    Validation
      Joi schemas
      Request validation
    Logging
      Pino logger
      Winston logger
      Structured logs
```

---

**Last Updated**: 2026-01-09
**Repository**: lawmight/TCDynamics
**Documentation Generated**: Using Nia MCP + Local Filesystem Analysis
