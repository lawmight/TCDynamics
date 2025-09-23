# Azure Functions Deployment ENOTFOUND Fix

## Problem

The GitHub Actions deployment was failing with:

```
Error: ENOTFOUND
Error: Execution Exception (state: ValidateAzureResource) (step: Invocation)
Error:   When request Azure resource at ValidateAzureResource, Get Function App Settings : Failed to acquire app settings from https://<scmsite>/api/settings with publish-profile
Error:     Failed to fetch Kudu App Settings.
getaddrinfo ENOTFOUND func-tcdynamics-contact-bjgwe4aaaza9dpbk.scm.francecentral-01.azurewebsites.net
```

## Root Cause Analysis

The deployment failure is due to DNS resolution issues for the Azure Functions SCM endpoint. However, the improved diagnostics now reveal that the **function app itself may not exist** in Azure.

### Possible Causes

1. **Function App Deleted**: The Azure Function App was accidentally deleted
2. **Wrong Function App Name**: Environment variable `AZURE_FUNCTIONAPP_NAME` points to non-existent app
3. **Wrong Region/Subscription**: Function app exists but in different Azure region or subscription
4. **DNS/Network Issues**: Temporary DNS resolution problems (less likely)

## Solutions Implemented

### 1. Function App Existence Check

Added comprehensive diagnostics that first verify if the Azure Function App exists:

- **DNS Resolution Test**: Checks if the function app URL resolves
- **Connectivity Test**: Verifies if the function app responds to requests
- **Clear Error Messages**: Provides specific guidance when function app doesn't exist
- **Creation Instructions**: Shows exact Azure CLI commands to recreate missing function apps

### 3. SCM Endpoint Diagnostics

Separate check for SCM endpoint accessibility:

- Tests SCM DNS resolution
- Verifies SCM connectivity (when authentication allows)
- Continues deployment even if SCM check fails (as it's authentication-protected)

### 4. Proxy Configuration Support

Added environment variables for corporate networks:

```yaml
env:
  HTTPS_PROXY: ${{ secrets.HTTPS_PROXY }}
  HTTP_PROXY: ${{ secrets.HTTP_PROXY }}
  NO_PROXY: .azurewebsites.net,.azure.net,.windows.net,.microsoft.com
```

### 3. Alternative Deployment Method

Added Azure CLI deployment as a fallback when the functions-action fails:

- Uses service principal authentication
- Deploys using `az functionapp deployment source config-zip`
- More reliable for DNS resolution issues

## Required GitHub Secrets (for Alternative Deployment)

If you want to enable the Azure CLI fallback, add these secrets:

- `AZURE_CLIENT_ID`: Service principal client ID
- `AZURE_CLIENT_SECRET`: Service principal secret
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_RESOURCE_GROUP`: Resource group name

## Troubleshooting Steps

### Function App Existence Check

The workflow now automatically checks if your function app exists. If it fails, you'll see detailed error messages with specific solutions.

### Manual Verification

```bash
# 1. Check if function app URL resolves
nslookup func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net 8.8.8.8

# 2. Test function app connectivity
curl -I https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net

# 3. List your Azure function apps
az functionapp list --query '[].{name:name, location:location, rg:resourceGroup}' -o table

# 4. Check specific function app details
az functionapp show --name func-tcdynamics-contact-bjgwe4aaaza9dpbk --resource-group YOUR_RESOURCE_GROUP
```

### Azure Portal Checks

1. Verify Function App exists and is running
2. Check Function App configuration
3. Verify publish profile credentials
4. Check for any network restrictions or firewalls

### Local Testing

Test the deployment locally using Azure Functions Core Tools:

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Login and deploy
az login
func azure functionapp publish func-tcdynamics-contact
```

## Common Issues and Solutions

### Issue: DNS Resolution Fails

**Solution**: The workflow now automatically switches to Google DNS servers.

### Issue: Corporate Network Blocks Azure

**Solution**: Configure proxy settings in GitHub secrets and uncomment the proxy environment variables.

### Issue: Publish Profile Expired

**Solution**: Generate a new publish profile in Azure Portal > Function App > Deployment Center.

### Issue: Function App Doesn't Exist

**Solution**: Verify the function app name and resource group in the workflow environment variables.

## Files Modified

- `.github/workflows/tcdynamics-hybrid-deploy.yml`: Added DNS diagnostics, proxy support, and Azure CLI fallback

## Monitoring

The updated workflow now provides detailed logging for:

- DNS resolution status
- SCM endpoint accessibility
- Deployment method used
- Verification results

## Next Steps

1. Commit and push these changes
2. Test the deployment
3. Monitor the GitHub Actions logs for diagnostic information
4. If issues persist, check the Azure CLI fallback deployment
