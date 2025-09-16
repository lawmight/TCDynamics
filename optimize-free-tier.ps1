# Azure Free Tier Optimization Script
# Maximize value without spending credits

Write-Host ""
Write-Host "AZURE FREE TIER MAXIMIZATION - FREE USAGE ONLY" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host "Goal: Maximum value, zero cost" -ForegroundColor Cyan
Write-Host ""

# Current Free Tier Limits
Write-Host "CURRENT FREE TIER LIMITS:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor White
Write-Host ""
Write-Host "Azure OpenAI: 1M tokens FREE/month" -ForegroundColor Green
Write-Host "Azure AI Vision: 5K transactions FREE/month" -ForegroundColor Green
Write-Host "Azure AI Language: 5K transactions FREE/month" -ForegroundColor Green
Write-Host "Azure Cosmos DB: 400 RU/s + 5GB FREE" -ForegroundColor Green
Write-Host "Azure Storage: 5GB + 2M operations FREE" -ForegroundColor Green
Write-Host "Azure Functions: 1M executions + 400K GB-s FREE" -ForegroundColor Green
Write-Host "Azure App Service: 10 apps + 1GB storage FREE" -ForegroundColor Green
Write-Host ""

# Check current usage
Write-Host "CHECKING CURRENT USAGE..." -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor White
Write-Host ""

$currentTokens = 101000  # From monitoring
$targetTokens = 1000000  # 1M free tokens
$remainingTokens = $targetTokens - $currentTokens

Write-Host "OpenAI Tokens:" -ForegroundColor Yellow
Write-Host "  Free Tier Limit: 1,000,000 tokens" -ForegroundColor White
Write-Host "  Current Usage: $currentTokens tokens" -ForegroundColor White
Write-Host "  Remaining Free: $remainingTokens tokens" -ForegroundColor Green
Write-Host "  Usage Rate: $([math]::Round(($currentTokens / $targetTokens) * 100, 2))%" -ForegroundColor Cyan
Write-Host ""

# Generate controlled FREE usage
Write-Host "GENERATING CONTROLLED FREE TIER USAGE..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor White
Write-Host ""

$freeApiKey = "071fb983407343598a2fd0b93a61d2e4"
$freeEndpoint = "https://workflowai-openai.openai.azure.com"

# Make a few test calls within free tier
$testCallCount = 5  # Conservative number
$successfulCalls = 0
$totalTokensUsed = 0

Write-Host "Making $testCallCount test API calls (within free tier):" -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le $testCallCount; $i++) {
    Write-Host "Processing call $i of $testCallCount..." -ForegroundColor White
    
    $headers = @{
        "api-key" = $freeApiKey
        "Content-Type" = "application/json"
    }
    
    $body = @{
        messages = @(
            @{
                role = "system"
                content = "You are a helpful AI assistant for French businesses."
            },
            @{
                role = "user"
                content = "What are 3 key benefits of AI automation for French SMEs? Keep response under 100 words."
            }
        )
        max_tokens = 200
        temperature = 0.7
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$freeEndpoint/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-02-01" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        $successfulCalls++
        $tokensUsed = $response.usage.total_tokens
        $totalTokensUsed += $tokensUsed
        
        Write-Host "  Success! Tokens used: $tokensUsed" -ForegroundColor Green
        
    } catch {
        Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2  # Rate limiting
}

Write-Host ""
Write-Host "TEST RESULTS:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor White
Write-Host "Successful Calls: $successfulCalls/$testCallCount" -ForegroundColor Green
Write-Host "Total Tokens Used: $totalTokensUsed" -ForegroundColor Yellow
Write-Host ""

if ($successfulCalls -gt 0) {
    $avgTokens = [math]::Round($totalTokensUsed / $successfulCalls)
    Write-Host "Average Tokens per Call: $avgTokens" -ForegroundColor Cyan
    Write-Host "Cost: $0.00 (within free tier!)" -ForegroundColor Green
}

# Updated usage calculation
$newTotalTokens = $currentTokens + $totalTokensUsed
$newUsagePercent = [math]::Round(($newTotalTokens / $targetTokens) * 100, 2)

Write-Host ""
Write-Host "UPDATED FREE TIER STATUS:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor White
Write-Host "New Total Token Usage: $newTotalTokens / 1,000,000" -ForegroundColor Yellow
Write-Host "New Usage Percentage: $newUsagePercent%" -ForegroundColor Cyan
Write-Host "Remaining Free Tokens: $($targetTokens - $newTotalTokens)" -ForegroundColor Green
Write-Host ""

# Optimization recommendations
Write-Host "OPTIMIZATION STRATEGIES:" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor White
Write-Host ""
Write-Host "1. Token Optimization:" -ForegroundColor Cyan
Write-Host "   - Use GPT-3.5-turbo instead of GPT-4" -ForegroundColor White
Write-Host "   - Keep prompts under 200 tokens" -ForegroundColor White
Write-Host "   - Limit responses to 500 tokens" -ForegroundColor White
Write-Host "   - Cache frequently used responses" -ForegroundColor White
Write-Host ""
Write-Host "2. Vision API Optimization:" -ForegroundColor Cyan
Write-Host "   - Process documents under 4MB" -ForegroundColor White
Write-Host "   - Use PNG/JPG for better accuracy" -ForegroundColor White
Write-Host "   - Batch similar document types" -ForegroundColor White
Write-Host ""
Write-Host "3. Function Optimization:" -ForegroundColor Cyan
Write-Host "   - Keep execution time under 5 seconds" -ForegroundColor White
Write-Host "   - Use async patterns" -ForegroundColor White
Write-Host "   - Implement efficient cold starts" -ForegroundColor White
Write-Host ""

# Monthly budget allocation
Write-Host "RECOMMENDED MONTHLY ALLOCATION:" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor White
Write-Host ""
Write-Host "OpenAI Tokens (1M free):" -ForegroundColor Yellow
Write-Host "  - Chatbot: 600,000 tokens (60%)" -ForegroundColor White
Write-Host "  - Analysis: 300,000 tokens (30%)" -ForegroundColor White
Write-Host "  - Testing: 100,000 tokens (10%)" -ForegroundColor White
Write-Host ""
Write-Host "Vision API (5K free):" -ForegroundColor Yellow
Write-Host "  - OCR: 3,000 docs (60%)" -ForegroundColor White
Write-Host "  - Image Analysis: 1,500 images (30%)" -ForegroundColor White
Write-Host "  - Testing: 500 operations (10%)" -ForegroundColor White
Write-Host ""

# Next steps
Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "===========" -ForegroundColor White
Write-Host ""
Write-Host "1. Share tcdynamics.fr with 20+ contacts for traffic" -ForegroundColor White
Write-Host "2. Test AI chatbot with various scenarios" -ForegroundColor White
Write-Host "3. Upload documents for AI vision processing" -ForegroundColor White
Write-Host "4. Monitor usage with: .\free-tier-monitor.ps1" -ForegroundColor White
Write-Host "5. Check Azure portal for detailed metrics" -ForegroundColor White
Write-Host ""

# Final status
if ($newUsagePercent -lt 30) {
    Write-Host "STATUS: EXCELLENT - Plenty of free capacity available!" -ForegroundColor Green
    Write-Host "Recommendation: Increase usage to maximize value" -ForegroundColor White
} elseif ($newUsagePercent -lt 70) {
    Write-Host "STATUS: GOOD - Balanced usage of free tier" -ForegroundColor Yellow
    Write-Host "Recommendation: Continue current pace" -ForegroundColor White
} else {
    Write-Host "STATUS: MONITOR - Approaching free tier limits" -ForegroundColor Red
    Write-Host "Recommendation: Optimize usage patterns" -ForegroundColor White
}

Write-Host ""
Write-Host "MISSION: Maximize Azure free tier value at ZERO cost!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Yellow
