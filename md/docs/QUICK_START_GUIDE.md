# 🚀 TCDynamics Quick Start Guide

**Get up and running with TCDynamics in minutes!**

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Azure Functions Core Tools** ([Install](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local))

## ⚡ Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/lawmight/TCDynamics.git
cd TCDynamics

# Install all dependencies
npm run install:all
```

### 2. Start Development

```bash
# Start all services (recommended)
npm run dev

# Or start individually
npm run dev:frontend    # React app on http://localhost:5173
npm run dev:backend     # Node.js API on http://localhost:8080
npm run dev:functions   # Azure Functions on http://localhost:7071
```

### 3. Verify Installation

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/health
- **Azure Functions**: http://localhost:7071/api/health

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:functions
npm run test:e2e
```

## 🏗️ Building

```bash
# Build all applications
npm run build

# Build individually
npm run build:frontend
npm run build:backend
```

## 📚 Key Documentation

- **[Project Master](PROJECT_MASTER.md)** - **START HERE** - Single source of truth
- **[Project Status](active/PROJECT_STATUS.md)** - Detailed status metrics
- **[What To Do Next](active/WHAT_TO_DO_NEXT.md)** - Next steps
- **[Testing Guide](active/TESTING_GUIDE.md)** - Testing procedures
- **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** - Deployment instructions

## 🔧 Development Commands

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm run dev`    | Start all development servers |
| `npm run build`  | Build all applications        |
| `npm run test`   | Run all tests                 |
| `npm run lint`   | Lint all code                 |
| `npm run format` | Format all code               |
| `npm run clean`  | Clean build artifacts         |

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in respective config files
2. **Dependencies**: Run `npm run install:all` to reinstall
3. **Python issues**: Ensure Python 3.11+ is installed
4. **Azure Functions**: Install Azure Functions Core Tools

### Getting Help

- Check [Project Status](active/PROJECT_STATUS.md) for current issues
- Review [Testing Guide](active/TESTING_GUIDE.md) for test problems
- See [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) for deployment issues

## 🎯 Next Steps

1. **Explore the codebase** in `apps/` directory
2. **Read the documentation** in `docs/active/`
3. **Run tests** to verify everything works
4. **Check deployment** guides for production setup

---

**Ready to build! 🚀**
