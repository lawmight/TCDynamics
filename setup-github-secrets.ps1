# TCDynamics - GitHub Secrets Setup Script
# This script helps configure GitHub secrets for Azure OIDC authentication

Write-Host "🔐 TCDynamics GitHub Secrets Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n📋 Required GitHub Secrets for OIDC Authentication:" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

Write-Host "`nAZURE_CLIENT_ID: a2cbbac7-4421-4335-bcde-24367cf376f3" -ForegroundColor White
Write-Host "AZURE_TENANT_ID: 5de68602-165a-4563-869e-59dd763f5296" -ForegroundColor White
Write-Host "AZURE_SUBSCRIPTION_ID: 1c36990d-4423-495d-819b-008f0b44f285" -ForegroundColor White

Write-Host "`n🚀 Setup Instructions:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

Write-Host "`n1. Go to your GitHub repository: https://github.com/lawmight/TCDynamics" -ForegroundColor White
Write-Host "2. Click on 'Settings' tab" -ForegroundColor White
Write-Host "3. Click on 'Secrets and variables' → 'Actions' in the left sidebar" -ForegroundColor White
Write-Host "4. Click 'New repository secret'" -ForegroundColor White
Write-Host "5. Add each secret with the exact names and values shown above" -ForegroundColor White

Write-Host "`n📝 Secrets to Add:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow

Write-Host "`n• AZURE_CLIENT_ID" -ForegroundColor Green
Write-Host "  Value: a2cbbac7-4421-4335-bcde-24367cf376f3" -ForegroundColor Gray

Write-Host "`n• AZURE_TENANT_ID" -ForegroundColor Green
Write-Host "  Value: 5de68602-165a-4563-869e-59dd763f5296" -ForegroundColor Gray

Write-Host "`n• AZURE_SUBSCRIPTION_ID" -ForegroundColor Green
Write-Host "  Value: 1c36990d-4423-495d-819b-008f0b44f285" -ForegroundColor Gray

Write-Host "`n✅ Verification:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green

Write-Host "`nAfter setting up the secrets:" -ForegroundColor White
Write-Host "1. Push any change to the main branch" -ForegroundColor White
Write-Host "2. Check GitHub Actions to see if deployment succeeds" -ForegroundColor White
Write-Host "3. Test the health endpoint: https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health" -ForegroundColor White

Write-Host "`n🔒 Security Notes:" -ForegroundColor Red
Write-Host "=================" -ForegroundColor Red

Write-Host "`n• These credentials give GitHub contributor access to your Azure subscription" -ForegroundColor White
Write-Host "• The service principal is scoped to this specific subscription only" -ForegroundColor White
Write-Host "• OIDC authentication is more secure than publish profiles" -ForegroundColor White
Write-Host "• Rotate these credentials regularly for security" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

Write-Host "`n• Azure OIDC Setup: https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure" -ForegroundColor White
Write-Host "• GitHub Actions Security: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green

Write-Host "`n1. Set up the GitHub secrets listed above" -ForegroundColor White
Write-Host "2. Commit and push this change to trigger deployment" -ForegroundColor White
Write-Host "3. Monitor GitHub Actions for successful deployment" -ForegroundColor White
Write-Host "4. Test your application functionality" -ForegroundColor White

Write-Host "`n✨ Ready for secure, automated deployments!" -ForegroundColor Green
