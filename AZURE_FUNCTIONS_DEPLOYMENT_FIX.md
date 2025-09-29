# TCDynamics Azure Functions Deployment Fix Guide

## Executive Summary

**Current Status**: TCDynamics website is 95% operational with frontend deployed to OVHcloud, but Azure Functions backend is completely non-functional due to deployment failures.

**Critical Issues**:

- Azure Functions deployment failing in GitHub Actions
- Missing environment variables and secrets
- Function app connectivity issues
- CI/CD pipeline authentication problems

**Impact**: Contact forms, AI chat, document processing, and demo requests are all broken.

---

## Problem Analysis

### 1. Azure Functions Architecture Overview

**Expected Setup**:

- Function App: `func-tcdynamics-contact.azurewebsites.net`
- Runtime: Python 3.11
- Functions: ContactForm, DemoForm, AI Chat, Vision, Health, Payment/Stripe
- Dependencies: Azure OpenAI, Azure Vision, Zoho Mail, Cosmos DB

**Current State**: Functions are not deployed or accessible.

### 2. GitHub Actions Deployment Issues

**Workflow File**: `.github/workflows/tcdynamics-hybrid-deploy.yml`

**Problems Identified**:

- Azure CLI authentication failing (likely wrong AZURE_TENANT_ID)
- Function app existence checks failing
- ZIP deployment process issues
- Missing or incorrect secrets configuration

### 3. Environment Variables & Secrets Analysis

**Required Secrets** (from config.ts and function_app.py):

```bash
# Azure Services
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_TENANT_ID
AZURE_FUNCTIONAPP_PUBLISH_PROFILE

# AI Services
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_KEY
AZURE_OPENAI_DEPLOYMENT

# Vision Services
AZURE_VISION_ENDPOINT
AZURE_VISION_KEY

# Email Service
ZOHO_EMAIL
ZOHO_PASSWORD

# Database
COSMOS_CONNECTION_STRING
COSMOS_DATABASE
COSMOS_CONTAINER_CONTACTS
COSMOS_CONTAINER_DEMOS
COSMOS_CONTAINER_CONVERSATIONS

# Stripe (if implementing payments)
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

---

## Step-by-Step Fix Plan

### PHASE 1: Environment & Infrastructure Verification

#### Step 1.1: Verify Azure Function App Exists

```bash
# Check if function app exists
az login
az functionapp list --query '[].{name:name, location:location, rg:resourceGroup}' -o table

# Expected output should include: func-tcdynamics-contact
```

**If function app doesn't exist:**

```bash
# Create the function app
az functionapp create \
  --resource-group rg-TCDynamics \
  --name func-tcdynamics-contact \
  --storage-account [YOUR_STORAGE_ACCOUNT_NAME] \
  --consumption-plan-location francecentral \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4
```

#### Step 1.2: Verify Azure Services Exist

```bash
# Check Azure OpenAI
az cognitiveservices account list --query '[].{name:name, kind:kind, location:location}' -o table

# Check Azure Vision
az cognitiveservices account list --query '[].{name:name, kind:kind, location:location}' -o table

# Check Storage Account
az storage account list --query '[].{name:name, location:location}' -o table
```

#### Step 1.3: Test Function App Connectivity

```bash
# Test basic connectivity
curl -I https://func-tcdynamics-contact.azurewebsites.net

# Test health endpoint (should return 404 if no functions deployed)
curl https://func-tcdynamics-contact.azurewebsites.net/api/health
```

### PHASE 2: Local Development Setup

#### Step 2.1: Install Azure Functions Core Tools

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Verify installation
func --version
```

#### Step 2.2: Set Up Local Environment

```bash
cd TCDynamics

# Create proper local.settings.json with real values
cat > local.settings.json << 'EOF'
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",

    // ADD REAL VALUES HERE:
    "AZURE_OPENAI_ENDPOINT": "https://your-openai-service.openai.azure.com/",
    "AZURE_OPENAI_KEY": "your-openai-key",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-35-turbo",

    "AZURE_VISION_ENDPOINT": "https://your-vision-service.cognitiveservices.azure.com/",
    "AZURE_VISION_KEY": "your-vision-key",

    "ZOHO_EMAIL": "contact@tcdynamics.fr",
    "ZOHO_PASSWORD": "your-zoho-password",

    "COSMOS_CONNECTION_STRING": "your-cosmos-connection-string",
    "COSMOS_DATABASE": "tcdynamics",
    "COSMOS_CONTAINER_CONTACTS": "contacts",
    "COSMOS_CONTAINER_DEMOS": "demo_requests",
    "COSMOS_CONTAINER_CONVERSATIONS": "conversations"
  }
}
EOF
```

#### Step 2.3: Install Python Dependencies Locally

```bash
cd TCDynamics
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

#### Step 2.4: Test Functions Locally

```bash
# Start functions locally
func start --verbose

# In another terminal, test health endpoint
curl http://localhost:7071/api/health

# Test contact form (replace with real data)
curl -X POST http://localhost:7071/api/ContactForm \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'
```

### PHASE 3: Azure Deployment Fix

#### Step 3.1: Manual Deployment Test

```bash
cd TCDynamics

# Create deployment package
zip -r ../functions-deploy.zip . -x "*.pyc" "__pycache__/*" "*.git*" "local.settings.json"

# Deploy manually using Azure CLI
az login
az functionapp deployment source config-zip \
  --resource-group rg-TCDynamics \
  --name func-tcdynamics-contact \
  --src ../functions-deploy.zip
```

#### Step 3.2: Configure Function App Settings

```bash
# Set environment variables in Azure
az functionapp config appsettings set \
  --name func-tcdynamics-contact \
  --resource-group rg-TCDynamics \
  --settings \
    AZURE_OPENAI_ENDPOINT="https://your-openai-service.openai.azure.com/" \
    AZURE_OPENAI_KEY="your-openai-key" \
    AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo" \
    AZURE_VISION_ENDPOINT="https://your-vision-service.cognitiveservices.azure.com/" \
    AZURE_VISION_KEY="your-vision-key" \
    ZOHO_EMAIL="contact@tcdynamics.fr" \
    ZOHO_PASSWORD="your-zoho-password" \
    COSMOS_CONNECTION_STRING="your-cosmos-connection-string" \
    COSMOS_DATABASE="tcdynamics" \
    COSMOS_CONTAINER_CONTACTS="contacts" \
    COSMOS_CONTAINER_DEMOS="demo_requests" \
    COSMOS_CONTAINER_CONVERSATIONS="conversations"
```

#### Step 3.3: Test Deployed Functions

```bash
# Test health endpoint
curl https://func-tcdynamics-contact.azurewebsites.net/api/health

# Test contact form
curl -X POST https://func-tcdynamics-contact.azurewebsites.net/api/ContactForm \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'

# Test demo form
curl -X POST https://func-tcdynamics-contact.azurewebsites.net/api/DemoForm \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company","email":"test@example.com","businessNeeds":"Test needs"}'

# Test AI chat
curl -X POST https://func-tcdynamics-contact.azurewebsites.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'
```

### PHASE 4: GitHub Actions CI/CD Fix

#### Step 4.1: Verify GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

**Required Secrets**:

- `AZURE_CLIENT_ID`: Service principal client ID
- `AZURE_CLIENT_SECRET`: Service principal secret
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Function app publish profile
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint URL
- `AZURE_OPENAI_KEY`: Azure OpenAI key
- `AZURE_OPENAI_DEPLOYMENT`: Model deployment name (gpt-35-turbo)
- `AZURE_VISION_ENDPOINT`: Azure Vision endpoint URL
- `AZURE_VISION_KEY`: Azure Vision key
- `ZOHO_EMAIL`: Zoho email address
- `ZOHO_PASSWORD`: Zoho email password
- `COSMOS_CONNECTION_STRING`: Cosmos DB connection string
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (if using payments)

#### Step 4.2: Fix Workflow Authentication

The workflow uses Azure CLI with service principal. Issues could be:

- Wrong tenant ID
- Service principal lacks permissions
- Function app in different resource group

**Troubleshooting**:

```bash
# Test Azure CLI login locally
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID

# Check function app permissions
az functionapp show --name func-tcdynamics-contact --resource-group rg-TCDynamics
```

#### Step 4.3: Test Workflow Locally (Optional)

```bash
# Install act for local GitHub Actions testing
# This can help debug workflow issues locally
```

### PHASE 5: Frontend Integration Testing

#### Step 5.1: Update Frontend Environment Variables

Verify `.env` file or build environment has:

```bash
VITE_AZURE_FUNCTIONS_URL=https://func-tcdynamics-contact.azurewebsites.net/api
VITE_AZURE_OPENAI_ENDPOINT=https://your-openai-service.openai.azure.com/
VITE_AZURE_OPENAI_KEY=your-openai-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
VITE_AZURE_VISION_ENDPOINT=https://your-vision-service.cognitiveservices.azure.com/
VITE_AZURE_VISION_KEY=your-vision-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

#### Step 5.2: Test Frontend-Backend Integration

```bash
# Build frontend
npm run build

# Test contact form submission
# Open browser to https://tcdynamics.fr and test contact form

# Check browser network tab for API calls
# Verify calls go to: https://func-tcdynamics-contact.azurewebsites.net/api/ContactForm
```

#### Step 5.3: Monitor Error Logs

```bash
# Check function app logs
az functionapp logstream --name func-tcdynamics-contact --resource-group rg-TCDynamics

# Check Application Insights if configured
az monitor app-insights query --app [insights-name] --analytics-query "requests | where timestamp > ago(1h)"
```

### PHASE 6: Production Verification

#### Step 6.1: End-to-End Testing Checklist

- [ ] Contact form submits successfully and sends email
- [ ] Demo form submits successfully and sends email
- [ ] AI chat responds to messages
- [ ] Document processing works (if implemented)
- [ ] Payment processing works (if implemented)
- [ ] Error handling works gracefully
- [ ] Rate limiting prevents abuse
- [ ] CORS allows frontend requests

#### Step 6.2: Performance Testing

```bash
# Load test the functions
# Use tools like Apache Bench or similar
ab -n 100 -c 10 https://func-tcdynamics-contact.azurewebsites.net/api/health
```

#### Step 6.3: Monitoring Setup

- Configure Application Insights
- Set up alerts for function failures
- Monitor function execution times
- Track error rates

---

## Code Analysis: Key Files to Review

### Azure Functions Core (`TCDynamics/function_app.py`)

- **Lines 64-134**: `contact_form()` function
- **Lines 136-208**: `demo_form()` function
- **Lines 210-358**: `ai_chat()` function
- **Lines 360-436**: `ai_vision()` function
- **Lines 438-496**: `health_check()` function
- **Lines 498-578**: Payment functions (`create_payment_intent`, `create_subscription`)

### Frontend Integration (`src/api/azureServices.ts`)

- **Lines 21**: `getFunctionsBaseUrl()` function
- **Lines 414-445**: `contactAPI.submitContactForm()`
- **Lines 448-479**: `demoAPI.submitDemoForm()`
- **Lines 534-568**: `chatAPI.sendMessage()`
- **Lines 589-644**: `visionAPI.processDocument()`

### Configuration (`src/utils/config.ts`)

- **Lines 6-7**: Default functions base URL
- **Lines 12-14**: Azure Functions URL configuration
- **Lines 48-74**: Server-side config schema (Azure services)

### GitHub Actions Workflow (`.github/workflows/tcdynamics-hybrid-deploy.yml`)

- **Lines 31-35**: Environment variables
- **Lines 163-319**: Azure Functions deployment section
- **Lines 270-281**: Azure CLI authentication
- **Lines 287-292**: Function app deployment command

---

## Troubleshooting Common Issues

### Issue: Function App Deployment Fails

**Symptoms**: `az functionapp deployment source config-zip` fails
**Solutions**:

1. Check resource group exists: `az group show --name rg-TCDynamics`
2. Verify function app exists
3. Check storage account permissions
4. Validate ZIP file is not corrupted

### Issue: Functions Return 500 Errors

**Symptoms**: HTTP 500 from function endpoints
**Solutions**:

1. Check function logs: `az functionapp logstream`
2. Verify environment variables are set
3. Test dependencies locally
4. Check Azure service permissions

### Issue: Email Not Sending

**Symptoms**: Contact/demo forms submit but no email received
**Solutions**:

1. Verify Zoho credentials
2. Check SMTP server (smtp.zoho.eu:587)
3. Test email sending locally
4. Check spam folder

### Issue: AI Services Not Working

**Symptoms**: Chat/vision endpoints fail
**Solutions**:

1. Verify Azure OpenAI/Vision endpoints are accessible
2. Check API keys are correct
3. Test services directly with Azure CLI
4. Verify model deployment exists

### Issue: CORS Errors

**Symptoms**: Frontend gets CORS errors
**Solutions**:

1. Check function app CORS settings
2. Verify allowed origins include tcdynamics.fr
3. Test with curl from different origins

---

## Success Criteria

**Phase 1 Complete**: Function app exists and is accessible
**Phase 2 Complete**: Functions run locally with test data
**Phase 3 Complete**: Functions deploy successfully to Azure
**Phase 4 Complete**: GitHub Actions workflow runs successfully
**Phase 5 Complete**: Frontend integrates with backend APIs
**Phase 6 Complete**: All features work end-to-end in production

## Risk Assessment

**High Risk**: Contact/demo forms not working → lost leads
**Medium Risk**: AI features not working → reduced user engagement
**Low Risk**: Payment processing not working → can be added later

## Rollback Plan

If deployment fails:

1. Keep existing frontend working (fallback to email links)
2. Use local function testing for debugging
3. Deploy functions manually if CI/CD fails
4. Gradually enable features as they work

---

**Next Steps**: Start with Phase 1 - verify Azure infrastructure exists and is properly configured.
