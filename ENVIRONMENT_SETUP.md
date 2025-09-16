# WorkFlowAI Environment Setup Guide

This guide will help you configure all the necessary environment variables for WorkFlowAI to function properly.

## 🚀 Quick Start

1. Copy the `.env` file and fill in your actual credentials
2. Update `local.settings.json` for Azure Functions development
3. Test the integrations

## 📋 Required Environment Variables

### Frontend (.env file)

```bash
# Azure OpenAI Service
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
VITE_AZURE_OPENAI_KEY=your-openai-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Azure AI Vision Service
VITE_AZURE_VISION_ENDPOINT=https://your-vision-resource.cognitiveservices.azure.com/
VITE_AZURE_VISION_KEY=your-vision-api-key-here

# Azure Cosmos DB
VITE_COSMOS_DB_CONNECTION_STRING=your-cosmos-connection-string-here
VITE_COSMOS_DB_DATABASE=workflowai-data
VITE_COSMOS_DB_CONTAINER_CONTACTS=contact-forms
VITE_COSMOS_DB_CONTAINER_CONVERSATIONS=ai-conversations

# Azure Functions (for contact form submissions)
VITE_AZURE_FUNCTIONS_URL=https://your-function-app.azurewebsites.net/api
```

### Backend (local.settings.json for Azure Functions)

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "ZOHO_EMAIL": "your-email@zoho.com",
    "ZOHO_PASSWORD": "your-app-password-here",
    "ADMIN_KEY": "your-secure-admin-key-change-this",
    "AZURE_OPENAI_ENDPOINT": "https://your-resource.openai.azure.com/",
    "AZURE_OPENAI_KEY": "your-openai-api-key-here",
    "COSMOS_DB_CONNECTION_STRING": "your-cosmos-connection-string-here"
  }
}
```

## 🔧 Step-by-Step Setup

### 1. Azure OpenAI Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Create an Azure OpenAI resource
3. Deploy a GPT-3.5-turbo model
4. Copy the endpoint and key to your `.env` file

### 2. Azure AI Vision Service

1. Create an Azure Cognitive Services resource
2. Enable the Computer Vision API
3. Copy the endpoint and key to your `.env` file

### 3. Azure Cosmos DB

1. Create an Azure Cosmos DB account
2. Create a database and containers
3. Copy the connection string to your `.env` file

### 4. Azure Functions

1. Create an Azure Functions app
2. Deploy your function code
3. Update the `VITE_AZURE_FUNCTIONS_URL` with your function URL

### 5. Zoho Email (Optional)

1. Create a Zoho Mail account
2. Generate an app password
3. Add credentials to both `.env` and `local.settings.json`

## 🧪 Testing Your Setup

### Test Azure OpenAI
```bash
# The AI chatbot should work in your browser
```

### Test Azure Vision
```bash
# Upload a document in the Document Processor component
```

### Test Contact Form
```bash
# Submit the contact form - should send email via Azure Functions
```

### Test Azure Functions
```bash
# Visit: https://your-function-app.azurewebsites.net/api/health
```

## 🔒 Security Notes

- ✅ Never commit API keys to version control
- ✅ Use Azure Key Vault for production secrets
- ✅ Rotate keys regularly
- ✅ Use managed identities when possible

## 🚨 Common Issues

### CORS Errors
- Check that your domain is in the `allowedOrigins` in `host.json`
- Update Azure Functions CORS settings in the portal

### API Key Errors
- Verify keys are not expired
- Check that endpoints match your Azure resources
- Ensure proper permissions are set

### Email Not Sending
- Verify Zoho credentials
- Check spam folder
- Ensure app password is correct

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test Azure services individually
4. Check Azure Functions logs

## 🔄 Environment Files Summary

- `.env` - Frontend environment variables (VITE_ prefix for Vite)
- `local.settings.json` - Azure Functions local development
- `host.json` - Azure Functions configuration (CORS, etc.)
- Environment variables in Azure Portal - Production settings
