# Azure Functions Environment Setup

## Frontend Environment Variables (.env)

Create a `.env` file in your project root with the following variables:

```bash
# =====================================================
# NODE.JS BACKEND CONFIGURATION (Fallback)
# =====================================================

# API Base URL for Node.js backend (fallback)
VITE_API_URL=http://localhost:3001

# =====================================================
# AZURE FUNCTIONS CONFIGURATION (Primary)
# =====================================================

# Azure Functions Base URL
VITE_AZURE_FUNCTIONS_URL=https://func-tcdynamics-contact.azurewebsites.net

# Azure OpenAI Configuration
VITE_AZURE_OPENAI_ENDPOINT=https://your-openai-service.openai.azure.com/
VITE_AZURE_OPENAI_KEY=your-openai-key-here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Azure Vision Configuration
VITE_AZURE_VISION_ENDPOINT=https://your-vision-service.cognitiveservices.azure.com/
VITE_AZURE_VISION_KEY=your-vision-key-here

# =====================================================
# AZURE FUNCTIONS SERVER CONFIGURATION
# (These are used by the Azure Functions themselves)
# =====================================================

# Azure OpenAI (for server-side)
AZURE_OPENAI_ENDPOINT=https://your-openai-service.openai.azure.com/
AZURE_OPENAI_KEY=your-openai-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Azure Vision (for server-side)
AZURE_VISION_ENDPOINT=https://your-vision-service.cognitiveservices.azure.com/
AZURE_VISION_KEY=your-vision-key-here

# Email Configuration (Zoho Mail)
ZOHO_EMAIL=contact@tcdynamics.fr
ZOHO_PASSWORD=your-zoho-app-password

# Cosmos DB Configuration
COSMOS_CONNECTION_STRING=AccountEndpoint=https://your-cosmos-account.documents.azure.com:443/;AccountKey=your-cosmos-account-key;
COSMOS_DATABASE=tcdynamics
COSMOS_CONTAINER_CONTACTS=contacts
COSMOS_CONTAINER_DEMOS=demo_requests
COSMOS_CONTAINER_CONVERSATIONS=conversations

# Stripe Configuration (Optional)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================

# Environment
VITE_NODE_ENV=development

# Application Version
VITE_APP_VERSION=1.0.0

# =====================================================
# FEATURE FLAGS
# =====================================================

# Enable/disable features
VITE_FEATURE_ENABLE_ANALYTICS=false
VITE_FEATURE_ENABLE_DEBUG_LOGGING=false
VITE_FEATURE_ENABLE_CACHE=true

# =====================================================
# PERFORMANCE & CACHING
# =====================================================

# Cache settings (in milliseconds)
VITE_CACHE_MAX_SIZE=1000
VITE_CACHE_DEFAULT_TTL=300000
VITE_CACHE_CLEANUP_INTERVAL=300000

# Performance monitoring
VITE_PERFORMANCE_ENABLE_SAMPLING=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1
VITE_PERFORMANCE_MAX_METRICS=1000

# =====================================================
# SECURITY
# =====================================================

# Content Security Policy
VITE_SECURITY_CSP_STRICT=false

# Rate limiting (requests per window)
VITE_SECURITY_RATE_LIMIT_REQUESTS=100
VITE_SECURITY_RATE_LIMIT_WINDOW=60000

# =====================================================
# ANALYTICS (Optional)
# =====================================================

# Google Analytics
VITE_ANALYTICS_GA_TRACKING_ID=

# Hotjar
VITE_ANALYTICS_HOTJAR_ID=
```

## Azure Functions Local Settings (TCDynamics/local.settings.json)

Update your `TCDynamics/local.settings.json` file:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",

    // Azure OpenAI
    "AZURE_OPENAI_ENDPOINT": "https://your-openai-service.openai.azure.com/",
    "AZURE_OPENAI_KEY": "your-openai-key-here",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-35-turbo",

    // Azure Vision
    "AZURE_VISION_ENDPOINT": "https://your-vision-service.cognitiveservices.azure.com/",
    "AZURE_VISION_KEY": "your-vision-key-here",

    // Email Service
    "ZOHO_EMAIL": "contact@tcdynamics.fr",
    "ZOHO_PASSWORD": "your-zoho-app-password",

    // Database
    "COSMOS_CONNECTION_STRING": "AccountEndpoint=https://your-cosmos-account.documents.azure.com:443/;AccountKey=your-cosmos-account-key;",
    "COSMOS_DATABASE": "tcdynamics",
    "COSMOS_CONTAINER_CONTACTS": "contacts",
    "COSMOS_CONTAINER_DEMOS": "demo_requests",
    "COSMOS_CONTAINER_CONVERSATIONS": "conversations",

    // Stripe (Optional)
    "STRIPE_PUBLISHABLE_KEY": "pk_test_your-stripe-publishable-key",
    "STRIPE_SECRET_KEY": "sk_test_your-stripe-secret-key"
  }
}
```

## Required Azure Resources

Make sure you have these Azure resources created and configured:

1. **Azure Functions App**: `func-tcdynamics-contact`
2. **Azure OpenAI Service**: With GPT-3.5 Turbo deployment
3. **Azure Vision Service**: Computer Vision resource
4. **Cosmos DB Account**: With database `tcdynamics` and containers
5. **Zoho Mail Account**: With app password for SMTP

## Testing Azure Functions

Once deployed, test your Azure Functions:

```bash
# Health check
curl https://func-tcdynamics-contact.azurewebsites.net/health

# Contact form
curl -X POST https://func-tcdynamics-contact.azurewebsites.net/contactform \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'

# AI Chat
curl -X POST https://func-tcdynamics-contact.azurewebsites.net/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","sessionId":"test123"}'
```

## Deployment Steps

1. **Deploy Azure Functions**:

   ```bash
   cd TCDynamics
   func azure functionapp publish func-tcdynamics-contact
   ```

2. **Set Environment Variables in Azure**:
   - Go to Azure Portal → Function App → Configuration
   - Add all the environment variables from above

3. **Test Frontend Integration**:
   - Open your website
   - Test contact form, demo form, and AI chat
   - Check browser network tab for API calls to Azure Functions

## Troubleshooting

If Azure Functions don't work:

1. Check function app logs in Azure Portal
2. Verify all environment variables are set correctly
3. Test functions locally first: `func start`
4. Check CORS settings in Azure Functions
5. Verify Azure service permissions and keys

## Fallback Behavior

Your frontend is configured to:

- Try Azure Functions first for all requests
- Fall back to Node.js backend if Azure Functions fail
- This ensures your site continues working even if Azure Functions have issues
