# 🚀 TCDynamics WorkFlowAI

**AI-powered automation platform for French SMEs**

A modern, scalable hybrid application built with React, Node.js, and Azure Functions, following monorepo best practices.

## 📁 Project Structure

```
TCDynamics/
├── apps/                          # Application entry points
│   ├── frontend/                  # React frontend (Vite + TypeScript)
│   ├── backend/                   # Node.js backend (Express)
│   └── functions/                 # Azure Functions (Python)
├── libs/                         # Shared libraries
│   ├── shared-types/             # TypeScript types
│   ├── shared-utils/             # Common utilities
│   └── shared-config/           # Configuration helpers
├── tools/                        # Development tools
│   ├── scripts/                  # Build and deployment scripts
│   └── configs/                 # Shared configurations
├── docs/                         # All documentation
│   ├── active/                   # Current documentation
│   ├── archive/                  # Historical documentation
│   ├── business/                 # Business documentation
│   └── deployment/               # Deployment guides
├── tests/                        # Cross-cutting tests
│   ├── e2e/                      # End-to-end tests
│   └── integration/               # Integration tests
├── docker/                       # Docker configurations
└── .github/                      # CI/CD workflows
```

## 🛠️ Technology Stack

| Component     | Technology                                | Status         |
| ------------- | ----------------------------------------- | -------------- |
| **Frontend**  | React 18.3 + TypeScript + Vite            | ✅ Production  |
| **Backend**   | Node.js + Express                         | ✅ Production  |
| **Functions** | Azure Functions (Python 3.11)             | ✅ Deployed    |
| **Database**  | Cosmos DB                                 | ✅ Configured  |
| **CI/CD**     | GitHub Actions                            | ✅ Operational |
| **Hosting**   | Vercel (frontend + API) + Azure Functions | ✅ Live        |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Azure Functions Core Tools
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/lawmight/TCDynamics.git
cd TCDynamics

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Development Commands

```bash
# Start all services
npm run dev

# Start individual services
npm run dev:frontend    # React frontend (port 5173)
npm run dev:backend     # Node.js backend (port 3000)
npm run dev:functions    # Azure Functions (port 7071)

# Build all applications
npm run build

# Run tests
npm run test

# Lint and format code
npm run lint
npm run format
```

## 📊 Current Status

- **Test Coverage**: 87% (255/287 tests passing)
- **Frontend**: ✅ Production ready
- **Backend**: ✅ Production ready
- **Azure Functions**: ✅ Deployed
- **CI/CD**: ✅ Operational

## 🔗 Live URLs

- **Frontend**: https://tcdynamics.fr
- **API**: https://func-tcdynamics-contact.azurewebsites.net/api
- **Health Check**: https://func-tcdynamics-contact.azurewebsites.net/api/health

## 📚 Documentation

- [Project Status](docs/active/PROJECT_STATUS.md)
- [Implementation Summary](docs/active/IMPLEMENTATION_SUMMARY.md)
- [What To Do Next](docs/active/WHAT_TO_DO_NEXT.md)
- [Deployment Guide](docs/deployment/)

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 7.1
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query + React hooks
- **Testing**: Vitest + React Testing Library + Playwright

### Backend (Node.js + Express)

- **Framework**: Express.js with TypeScript
- **Validation**: Joi schemas
- **Security**: Helmet, CORS, rate limiting
- **Email**: Nodemailer (Zoho Mail)
- **Testing**: Jest + Supertest

### Azure Functions (Python)

- **Runtime**: Python 3.11
- **Endpoints**: Contact, Demo, AI Chat, Vision
- **AI Services**: Azure OpenAI + Azure Vision
- **Testing**: pytest

## 🚀 Deployment

### Automated Deployment

- **Frontend + Backend API**: Vercel auto-deploy (via GitHub integration)
- **Azure Functions**: GitHub Actions → Azure
- **CI/CD**: Full pipeline with testing and health checks

### Manual Deployment

```bash
# Deploy to Vercel (frontend + API)
vercel --prod

# Deploy Azure Functions
cd apps/functions
func azure functionapp publish func-tcdynamics-contact
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:functions
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Build Time**: ~5s
- **Test Duration**: ~5s
- **Bundle Size**: 585 KB
- **Lighthouse Score**: TBD

## 🔧 Development Workflow

1. **Feature Development**: Create feature branches
2. **Testing**: All tests must pass before merge
3. **Code Quality**: ESLint + Prettier + TypeScript
4. **CI/CD**: Automated testing and deployment
5. **Documentation**: Keep docs updated

## 📞 Support

- **Email**: contact@tcdynamics.fr
- **GitHub Issues**: [Create an issue](https://github.com/lawmight/TCDynamics/issues)
- **Documentation**: Check `docs/` directory

## 📄 License

Proprietary - TCDynamics WorkFlowAI

---

**Ready to build! 🚀**
