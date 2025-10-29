# 🚀 Deployment Documentation

**Purpose**: Production deployment guides and configuration
**Last Updated**: October 14, 2025

---

> **See also**: [PROJECT_MASTER.md](../PROJECT_MASTER.md) for complete project status

---

## 📚 Documents in This Folder

### 🟢 Active Deployment Guides

#### [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) ⭐ PRIMARY

**Use**: Main deployment guide for OVHcloud  
**Status**: ✅ Current and accurate  
**Contains**:

- Environment setup
- Deployment process
- Nginx configuration
- PM2 process management
- Troubleshooting

**Start here for**: Initial deployment or redeployment

---

#### [DEPLOYMENT_STATUS_CURRENT.md](./DEPLOYMENT_STATUS_CURRENT.md) ⭐ STATUS

**Use**: Current production status  
**Status**: ✅ Updated Oct 14, 2025  
**Contains**:

- System health overview
- Service status
- Performance metrics
- Known issues
- Emergency procedures

**Check this for**: Current deployment health

---

#### [AZURE_FUNCTIONS_ENV_SETUP.md](./AZURE_FUNCTIONS_ENV_SETUP.md) ⭐ CONFIG

**Use**: Azure Functions configuration  
**Status**: ✅ Current  
**Contains**:

- Environment variables
- local.settings.json setup
- Azure resources configuration
- Testing procedures

**Use this for**: Setting up Azure Functions

---

### 📋 Reference Guides

#### [AZURE_FUNCTIONS_DEPLOYMENT_FIX.md](./AZURE_FUNCTIONS_DEPLOYMENT_FIX.md)

**Use**: Troubleshooting Azure deployment issues  
**Status**: 📚 Reference  
**Contains**:

- Common deployment problems
- SCM Basic Auth issues
- OIDC migration guide
- Diagnostic procedures

**Use this when**: Azure deployment fails

---

#### [STRIPE_SETUP.md](./STRIPE_SETUP.md)

**Use**: Stripe payment integration  
**Status**: 📝 Future feature  
**Contains**:

- Product configuration
- Webhook setup
- Environment variables
- Testing procedures

**Use this when**: Implementing payments

---

### 🗂️ Archived Deployment Docs

#### [DEPLOYMENT_SUCCESS_SUMMARY.md](./DEPLOYMENT_SUCCESS_SUMMARY.md)

**Date**: September 29, 2025  
**Status**: ✅ Historical success record  
**Contains**: Initial Azure Functions deployment success

#### [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)

**Date**: October 7, 2025  
**Status**: ✅ Phase 1 deployment record  
**Contains**: Tinker optimization deployment

#### [DEPLOYMENT_PHASE1.md](./DEPLOYMENT_PHASE1.md)

**Date**: October 7, 2025  
**Status**: ✅ Phase 1 summary  
**Contains**: Phase 1 deployment details

#### [DEPLOYMENT_STATUS_FINAL.md](./DEPLOYMENT_STATUS_FINAL.md)

**Date**: October 7, 2025  
**Status**: ✅ Historical status  
**Contains**: Phase 1 final status

#### [DEPLOYMENT.md](./DEPLOYMENT.md)

**Date**: Earlier 2025  
**Status**: 📚 Historical reference  
**Contains**: Original hybrid deployment guide

---

## 🎯 Quick Start

### For Initial Deployment

1. Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) completely
2. Configure environment variables (see AZURE_FUNCTIONS_ENV_SETUP.md)
3. Follow step-by-step instructions
4. Verify with health checks

### For Redeployment

```bash
# 1. Build frontend
npm run build

# 2. Test backend
cd backend && npm test

# 3. Deploy Azure Functions
cd TCDynamics && func azure functionapp publish func-tcdynamics-contact

# 4. Upload frontend (if changed)
# Use FileZilla to OVHcloud

# 5. Verify
curl https://func-tcdynamics-contact.azurewebsites.net/api/health
curl https://tcdynamics.fr/health
```

### For Troubleshooting

1. Check [DEPLOYMENT_STATUS_CURRENT.md](./DEPLOYMENT_STATUS_CURRENT.md) for current health
2. Review [AZURE_FUNCTIONS_DEPLOYMENT_FIX.md](./AZURE_FUNCTIONS_DEPLOYMENT_FIX.md) for common issues
3. Check emergency procedures in DEPLOYMENT_STATUS_CURRENT.md

---

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (95%+)
- [ ] Build successful
- [ ] Environment variables set
- [ ] Security scan clean
- [ ] Backup created

### During Deployment

- [ ] Build frontend
- [ ] Deploy Azure Functions
- [ ] Upload to OVHcloud (if needed)
- [ ] Update Nginx config (if needed)
- [ ] Restart services (PM2)

### Post-Deployment

- [ ] Health checks pass
- [ ] Smoke test features
- [ ] Monitor error logs (24h)
- [ ] Verify performance
- [ ] Update deployment log

---

## 🔍 Health Check URLs

### Production Endpoints

```bash
# Frontend
https://tcdynamics.fr

# Backend API
https://tcdynamics.fr/health
https://tcdynamics.fr/api/test

# Azure Functions
https://func-tcdynamics-contact.azurewebsites.net/api/health
https://func-tcdynamics-contact.azurewebsites.net/api/contactform
```

### Test Commands

```bash
# Frontend health
curl -I https://tcdynamics.fr

# Backend health
curl https://tcdynamics.fr/health

# Azure Functions health
curl https://func-tcdynamics-contact.azurewebsites.net/api/health

# Contact form test
curl -X POST https://tcdynamics.fr/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test message"}'
```

---

## 📈 Deployment History

### Successful Deployments

| Date         | Type          | Components          | Status      |
| ------------ | ------------- | ------------------- | ----------- |
| Oct 14, 2025 | Documentation | Docs reorganization | ✅ Complete |
| Oct 8, 2025  | CI Fixes      | Test environment    | ✅ Complete |
| Oct 7, 2025  | Optimization  | Tinker Phase 1      | ✅ Complete |
| Sep 29, 2025 | Initial       | Azure Functions     | ✅ Complete |

### Total Deployments: 4+ successful

---

**Primary Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)  
**Current Status**: [DEPLOYMENT_STATUS_CURRENT.md](./DEPLOYMENT_STATUS_CURRENT.md)  
**Health**: 🟢 All systems operational
