# TCDynamics Hybrid Deployment Guide

## Architecture Overview

TCDynamics uses a hybrid architecture:

- **Frontend**: React app deployed to OVHcloud
- **Backend**: Azure Functions for contact/demo forms
- **Email**: Zoho Mail integration

## Environment Variables Setup

### 1. Frontend Environment Variables (.env)

Create a `.env` file in the root directory:

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

In Azure Portal, configure these application settings for `func-tcdynamics-contact`:

```bash
# Email Configuration
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

Configure these secrets in your GitHub repository:

```bash
# Azure Deployment
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
AZURE_FUNCTIONAPP_PUBLISH_PROFILE=your-publish-profile-xml

# Optional: OVHcloud deployment (if using automated deployment)
OVHCLOUD_HOST=your-ovhcloud-host
OVHCLOUD_USERNAME=your-username
OVHCLOUD_PASSWORD=your-password
```

## Deployment Process

### Automatic Deployment (GitHub Actions)

The hybrid workflow automatically:

1. **Tests Frontend**: Runs linting, type checking, and tests
2. **Tests Azure Functions**: Validates Python code and dependencies
3. **Deploys Azure Functions**: Deploys to `func-tcdynamics-contact`
4. **Deploys Frontend**: Creates OVHcloud deployment package
5. **Verifies Deployment**: Checks that all services are running

### Manual Deployment Steps

#### Azure Functions

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Deploy to Azure
func azure functionapp publish func-tcdynamics-contact --python
```

#### Frontend to OVHcloud

```bash
# Build the frontend
npm run build

# Upload dist/ folder to your OVHcloud hosting
# Configure web server to serve the React app
```

## Workflow Management

### Disable Redundant Workflows

To disable all redundant workflows and keep only the hybrid deployment:

1. Go to Actions tab in GitHub
2. Run the "Disable Redundant Workflows" workflow
3. Type "DISABLE" to confirm

### Active Workflow

Only one workflow is active: `tcdynamics-hybrid-deploy.yml`

This workflow handles:

- Frontend testing and building
- Azure Functions testing and deployment
- OVHcloud deployment package creation
- Health checks and verification

## Troubleshooting

### Common Issues

1. **Azure Functions deployment fails with 401 Unauthorized**
   - **Most Common**: SCM Basic Auth is disabled (see `AZURE_DEPLOYMENT_FIX.md`)
   - Use the PowerShell script: `.\fix-azure-deployment.ps1 -EnableBasicAuth`
   - Or migrate to OIDC authentication (recommended)
   - Check Azure credentials in GitHub secrets
   - Verify function app name matches `func-tcdynamics-contact`
   - Ensure Python dependencies are in `requirements.txt`

2. **"Failed to fetch Kudu App Settings" error**
   - This is the same 401 Unauthorized issue
   - Follow the fix in `AZURE_DEPLOYMENT_FIX.md`
   - Quick fix: Enable SCM Basic Auth in Azure Portal
   - Better fix: Switch to OIDC authentication

3. **Frontend build fails**
   - Check environment variables are set correctly
   - Verify all dependencies are installed
   - Run `npm run type-check` locally

4. **Email sending fails**
   - Verify Zoho email credentials in Azure Functions settings
   - Check SMTP settings (smtp.zoho.eu:465)
   - Ensure app password is used, not regular password

### Health Checks

- **Frontend**: https://tcdynamics.fr
- **Azure Functions**: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health
- **Contact Form**: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/ContactForm
- **Demo Form**: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/DemoForm

## Security Notes

- Never commit `.env` files to version control
- Use app passwords for Zoho Mail, not regular passwords
- Rotate Azure credentials regularly
- Monitor function app logs for security issues

## Support

For deployment issues:

1. Check GitHub Actions logs
2. Verify Azure Functions logs in Azure Portal
3. Test endpoints manually
4. Check environment variables configuration
