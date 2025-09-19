# TCDynamics Environment Variables Setup

## Quick Setup Guide

### 1. Frontend Environment Variables (.env)

```bash
# Azure Functions Configuration
VITE_AZURE_FUNCTIONS_URL=https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api

# Azure OpenAI Configuration (for AI features)
VITE_AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
VITE_AZURE_OPENAI_KEY=your-azure-openai-key
VITE_AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Azure Vision Configuration (for document processing)
VITE_AZURE_VISION_ENDPOINT=your-azure-vision-endpoint
VITE_AZURE_VISION_KEY=your-azure-vision-key

# Cosmos DB Configuration (optional)
VITE_COSMOS_DB_CONNECTION_STRING=your-cosmos-connection-string
VITE_COSMOS_DB_DATABASE=tcdynamics
VITE_COSMOS_DB_CONTAINER_CONTACTS=contacts
VITE_COSMOS_DB_CONTAINER_CONVERSATIONS=conversations
```

### 2. Azure Functions Environment Variables

In Azure Portal → Function App → Configuration → Application settings:

```bash
# Email Configuration (Zoho Mail)
ZOHO_EMAIL=contact@tcdynamics.fr
ZOHO_PASSWORD=your-zoho-app-password

# Azure Functions Configuration
FUNCTIONS_WORKER_RUNTIME=python
AzureWebJobsStorage=your-storage-connection-string
APPLICATIONINSIGHTS_CONNECTION_STRING=your-app-insights-connection

# Security
ADMIN_KEY=your-secure-admin-key

# CORS (optional)
FRONTEND_URL=https://tcdynamics.fr
```

### 3. GitHub Secrets

In GitHub → Settings → Secrets and variables → Actions:

```bash
# Azure Deployment Credentials
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
AZURE_FUNCTIONAPP_PUBLISH_PROFILE=your-publish-profile-xml
```

## How to Get Azure Credentials

### AZURE_CREDENTIALS
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Create new registration or use existing
3. Go to Certificates & secrets → New client secret
4. Copy the JSON format:
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret", 
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

### AZURE_FUNCTIONAPP_PUBLISH_PROFILE
1. Go to Azure Portal → Function App → func-tcdynamics-contact
2. Go to Get publish profile
3. Download the .PublishSettings file
4. Copy the entire XML content

## Zoho Mail Setup

1. Go to Zoho Mail → Settings → Security
2. Enable 2-Factor Authentication
3. Generate App Password (not your regular password)
4. Use the app password in ZOHO_PASSWORD

## Testing Your Setup

### Local Testing
```bash
# Test frontend
npm run dev

# Test Azure Functions locally
cd TCDynamics
func start
```

### Production Testing
- Frontend: https://tcdynamics.fr
- Health Check: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health
- Contact Form: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/ContactForm
- Demo Form: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/DemoForm

## Troubleshooting

### Common Issues

1. **"Email credentials not configured"**
   - Check ZOHO_EMAIL and ZOHO_PASSWORD in Azure Functions settings
   - Ensure you're using app password, not regular password

2. **"CORS error"**
   - Check FRONTEND_URL in Azure Functions settings
   - Verify VITE_AZURE_FUNCTIONS_URL in frontend .env

3. **"Azure Functions deployment failed"**
   - Check AZURE_CREDENTIALS format in GitHub secrets
   - Verify function app name matches exactly

4. **"Frontend build failed"**
   - Check all VITE_* environment variables
   - Run `npm run type-check` locally

### Environment Variable Validation

Run this to check your setup:
```bash
# Check frontend env vars
npm run build

# Check Azure Functions
cd TCDynamics
python -c "import os; print('ZOHO_EMAIL:', os.environ.get('ZOHO_EMAIL', 'NOT SET'))"
```

## Security Best Practices

- ✅ Use app passwords for Zoho Mail
- ✅ Rotate Azure credentials regularly  
- ✅ Never commit .env files to git
- ✅ Use environment-specific values
- ✅ Monitor function app logs for security issues

