# Azure Functions Deployment Fix - 401 Unauthorized Error

## Issue Description

The Azure Functions deployment is failing with:

```
Error: Failed to fetch Kudu App Settings. Unauthorized (CODE: 401)
```

This error occurs because **SCM Basic Auth Publishing Credentials** is disabled by default in Azure Function Apps for security reasons.

## Root Cause

Since SCM Basic Auth is already enabled, the 401 error is likely caused by **stale publish profile credentials**. When you enable/disable Basic Auth settings, the existing publish profile still contains old credentials. You must re-download the publish profile after enabling Basic Auth.

## Solutions (Choose One)

### Solution 1: Regenerate Publish Profile (RECOMMENDED - Since SCM Basic Auth is enabled)

**This is the most likely fix** since SCM Basic Auth is already enabled.

1. Go to Azure Portal
2. Navigate to your Function App: `func-tcdynamics-contact`
3. Click **Get publish profile** (in Overview blade)
4. Download the fresh `.PublishSettings` file
5. Open the file and copy the entire XML content
6. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
7. Update `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` with the new XML content
8. **Redeploy** your application

**Why this works**: When SCM Basic Auth is enabled/disabled, the existing publish profile contains stale credentials. You must download a fresh profile after any Basic Auth configuration changes.

### Solution 2: Use PowerShell Script (Automated)

Run the diagnostic and fix script:

```powershell
# Update the configuration variables in the script first
.\diagnose-azure-401.ps1
# OR
.\quick-fix-azure.ps1
```

### Solution 3: Check for Networking Issues

If the publish profile doesn't fix it, check for network restrictions:

1. In Azure Portal → Function App → **Networking**
2. Check **Access restrictions** and **Private endpoints**
3. Ensure public access is allowed or properly configured
4. If using VNet integration, verify DNS and routing

### Solution 4: Migrate to OIDC Authentication (Best Practice)

For better security, migrate from publish profiles to OIDC authentication:

#### Step 1: Configure Azure AD Application

1. Go to Azure Portal → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Name: `TCDynamics-GitHub-Actions`
4. Select **Single tenant**
5. Click **Register**

#### Step 2: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `GitHub Actions Deployment`
4. Expires: `24 months`
5. Click **Add**
6. **Copy the secret value immediately** (you won't see it again)

#### Step 3: Assign Permissions

1. Go to **Subscriptions** in Azure Portal
2. Select your subscription
3. Go to **Access control (IAM)**
4. Click **Add** → **Add role assignment**
5. Role: **Contributor**
6. Assign access to: **User, group, or service principal**
7. Select: Your new App registration
8. Click **Save**

#### Step 4: Update GitHub Secrets

Add these secrets to your GitHub repository:

```bash
AZURE_CLIENT_ID=your-app-registration-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_CLIENT_SECRET=your-client-secret-value
```

#### Step 5: Update Workflow (Switch to OIDC)

In `.github/workflows/tcdynamics-hybrid-deploy.yml`, replace the deployment step:

```yaml
- name: Login to Azure (OIDC)
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: Deploy to Azure Functions
  uses: Azure/functions-action@v1
  with:
    app-name: ${{ env.AZURE_FUNCTIONAPP_NAME }}
    package: ./azure-functions-deploy
    # Remove publish-profile parameter - using OIDC now
    scm-do-build-during-deployment: true
    enable-oryx-build: true
```

## Verification Steps

After applying any fix:

1. **Trigger deployment** by pushing to main branch
2. **Check GitHub Actions logs** for successful deployment
3. **Verify function endpoints**:
   - Health check: `https://func-tcdynamics-contact.azurewebsites.net/api/health`
   - Contact form: `https://func-tcdynamics-contact.azurewebsites.net/api/ContactForm`
4. **Check Azure Function App logs** in Azure Portal for any runtime errors

## Additional Debugging

If the issue persists:

1. **Check Function App Configuration**:
   - Ensure `FUNCTIONS_WORKER_RUNTIME=python` is set
   - Verify `AzureWebJobsStorage` connection string
   - Check `WEBSITE_RUN_FROM_PACKAGE=1`

2. **Validate Package Structure**:

   ```bash
   # In the deployment job, add this debug step:
   - name: Debug package contents
     run: |
       echo "Package structure:"
       find ./azure-functions-deploy -type f | head -20
       echo "host.json contents:"
       cat ./azure-functions-deploy/host.json
   ```

3. **Check Azure Resource Permissions**:
   - Ensure the service principal or publish profile has Contributor access
   - Verify the Function App exists and is accessible

## Prevention

To prevent this issue in future:

1. **Use OIDC authentication** instead of publish profiles
2. **Monitor Azure security updates** that may disable basic auth
3. **Regularly rotate credentials** and update GitHub secrets
4. **Test deployments** after Azure platform updates

## References

- [Azure Functions Action Documentation](https://github.com/Azure/functions-action)
- [SCM Basic Auth Publishing Credentials](https://docs.microsoft.com/en-us/azure/app-service/configure-basic-auth)
- [GitHub Actions OIDC with Azure](https://docs.microsoft.com/en-us/azure/developer/github/connect-from-azure)
