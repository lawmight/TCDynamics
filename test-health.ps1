# Simple test for Azure Functions health endpoint
Write-Host "🔍 Testing Azure Functions Health Endpoint" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$url = "https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api/health"

try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 15 -Method Get
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $response.Content
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red

    # Check if it's a 404 specifically
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "`n⚠️  404 Not Found - Functions may not be deployed yet" -ForegroundColor Yellow
        Write-Host "Check GitHub Actions to see if deployment completed" -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "`n🔴 500 Internal Server Error - Functions deployed but error occurred" -ForegroundColor Red
        Write-Host "Check Azure Functions logs for details" -ForegroundColor Red
    }
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. If failed: Check GitHub Actions deployment status" -ForegroundColor White
Write-Host "2. If 404: Wait for deployment to complete (~5-10 min)" -ForegroundColor White
Write-Host "3. If success: Test contact form functionality!" -ForegroundColor White
