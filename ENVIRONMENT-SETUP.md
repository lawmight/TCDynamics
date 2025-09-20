# TCDynamics Environment Configuration Guide

This document outlines all environment variables required for the TCDynamics application.

## Quick Start

1. Copy `.env.example` to `.env` (create if it doesn't exist)
2. Fill in your actual values
3. Restart your development server

## Environment Variables

### Client-Side Configuration
These variables are exposed to the browser and must be prefixed with `VITE_`.

#### Required
```bash
VITE_AZURE_FUNCTIONS_URL=https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api
VITE_NODE_ENV=development
VITE_APP_VERSION=1.0.0
```

#### Optional
```bash
# Analytics
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_HOTJAR_ID=your-hotjar-id

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_LOGGING=false
VITE_ENABLE_CACHE=true
```

### Server-Side Configuration
These variables are used by Azure Functions and are kept server-side only.

#### Azure OpenAI (Required for AI Chat)
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
```

#### Azure Vision (Required for Document Processing)
```bash
AZURE_VISION_ENDPOINT=https://your-vision-resource.cognitiveservices.azure.com/
AZURE_VISION_KEY=your-azure-vision-key
```

#### Email Configuration (Required for Contact Forms)
```bash
ZOHO_EMAIL=contact@tcdynamics.fr
ZOHO_PASSWORD=your-zoho-app-password
```

#### Database (Optional, for advanced features)
```bash
COSMOS_CONNECTION_STRING=your-cosmos-connection-string
```

#### Security (Required)
```bash
ADMIN_KEY=change-this-to-a-secure-random-string-at-least-32-characters-long
FRONTEND_URL=https://tcdynamics.fr
```

#### Monitoring (Optional)
```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=your-app-insights-connection-string
```

#### Azure Functions (Required for local development)
```bash
AzureWebJobsStorage=UseDevelopmentStorage=true
```

## Security Best Practices

### Development
- Use different values for development and production
- Never commit real secrets to version control
- Use `.env` files (add to `.gitignore`)

### Production
- Use Azure Key Vault for sensitive data
- Enable Azure Managed Identities
- Rotate keys regularly
- Use Azure Application Insights for monitoring

### Azure Key Vault Setup

1. Create a Key Vault in your Azure subscription
2. Add secrets for each sensitive environment variable
3. Grant your Azure Functions access to the Key Vault
4. Update your Azure Functions configuration to reference Key Vault secrets

Example Key Vault references:
```
AZURE_OPENAI_KEY=@Microsoft.KeyVault(SecretUri=https://your-vault.vault.azure.net/secrets/azure-openai-key/)
```

## Validation

The application includes automatic validation for all environment variables:

- Client-side variables are validated on app startup
- Server-side variables are validated when Azure Functions start
- Missing required variables will cause the application to fail fast with clear error messages

## Testing Configuration

For testing, you can use mock values or set up test-specific environment variables:

```bash
# Test environment
VITE_NODE_ENV=test
VITE_AZURE_FUNCTIONS_URL=http://localhost:7071/api

# Use mock services for testing
AZURE_OPENAI_ENDPOINT=http://localhost:3001/mock-openai
AZURE_VISION_ENDPOINT=http://localhost:3001/mock-vision
```

## Troubleshooting

### Common Issues

1. **"Configuration validation failed"**
   - Check that all required environment variables are set
   - Verify variable names match exactly (case-sensitive)
   - Ensure URLs are properly formatted

2. **Azure Functions not connecting**
   - Verify `VITE_AZURE_FUNCTIONS_URL` is correct
   - Check CORS settings in Azure Functions
   - Ensure Azure Functions are deployed and running

3. **AI services not working**
   - Verify Azure OpenAI and Vision credentials
   - Check that endpoints are accessible
   - Ensure proper permissions are set in Azure

### Debug Mode

Enable debug logging to see configuration status:

```bash
VITE_ENABLE_DEBUG_LOGGING=true
```

This will log configuration status to the browser console without exposing sensitive data.

## Migration Guide

### From v1.0 to v1.1

If upgrading from an older version:

1. Add the new `VITE_ENABLE_CACHE` variable
2. Update `VITE_APP_VERSION` to current version
3. Review and update Azure service endpoints if changed

### Environment File Template

```bash
# .env file template
VITE_AZURE_FUNCTIONS_URL=your-functions-url
VITE_NODE_ENV=development
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_LOGGING=false
VITE_ENABLE_CACHE=true

AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_KEY=your-openai-key
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
AZURE_VISION_ENDPOINT=your-vision-endpoint
AZURE_VISION_KEY=your-vision-key
ZOHO_EMAIL=your-email
ZOHO_PASSWORD=your-password
ADMIN_KEY=your-secure-admin-key
FRONTEND_URL=your-frontend-url
AzureWebJobsStorage=UseDevelopmentStorage=true
```