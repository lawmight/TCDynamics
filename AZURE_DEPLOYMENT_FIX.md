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

## Root Cause

DNS resolution failure for the Azure Functions SCM (Source Control Manager) endpoint. This is a common issue with Azure Functions deployments from GitHub Actions.

## Solutions Implemented

### 1. DNS Resolution Diagnostics

Added a diagnostic step that:

- Tests DNS resolution for the SCM endpoint
- Falls back to Google DNS (8.8.8.8) if default DNS fails
- Verifies SCM endpoint connectivity before deployment

### 2. Proxy Configuration Support

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

### Manual DNS Testing

```bash
# Test DNS resolution
nslookup func-tcdynamics-contact-bjgwe4aaaza9dpbk.scm.francecentral-01.azurewebsites.net

# Test with specific DNS server
nslookup func-tcdynamics-contact-bjgwe4aaaza9dpbk.scm.francecentral-01.azurewebsites.net 8.8.8.8

# Test connectivity
curl -I https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.scm.francecentral-01.azurewebsites.net
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
