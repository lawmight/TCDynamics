# 🚀 AZURE USAGE GENERATOR
# Generate credit consumption quickly

Write-Host "🚀 AZURE USAGE GENERATOR - WorkFlowAI" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

$apiKey = "071fb983407343598a2fd0b93a61d2e4"
$endpoint = "https://workflowai-openai.openai.azure.com"

Write-Host "`n🤖 Generating AI API Calls (High Credit Usage)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor White

$callCount = 100
$successfulCalls = 0
$totalTokens = 0

for ($i = 1; $i -le $callCount; $i++) {
    Write-Host "   Processing call $i/$callCount..." -ForegroundColor Yellow

    $headers = @{
        "api-key" = $apiKey
        "Content-Type" = "application/json"
    }

    # Create a long, detailed prompt to consume more tokens
    $longPrompt = @"
Analyze this comprehensive French business scenario and provide detailed insights:

CONTEXT: You are a senior business consultant specializing in French SME digital transformation. A manufacturing company with 45 employees wants to implement AI automation.

TASK: Provide a complete 2000-word analysis covering:
1. Current market analysis for French manufacturing sector
2. Competitive landscape and positioning strategy
3. Detailed implementation roadmap with timelines
4. Risk assessment and mitigation strategies
5. ROI projections for 3-year period
6. Technology stack recommendations
7. Team training and change management plan
8. Integration with existing ERP systems
9. Compliance requirements (RGPD, industry standards)
10. Scalability and future growth projections

Make this analysis extremely detailed and comprehensive. Include specific numbers, timelines, and actionable recommendations.

Iteration: $($i)
"@

    $body = @{
        messages = @(
            @{
                role = "system"
                content = "You are a senior French business consultant with 20+ years experience. Provide extremely detailed, comprehensive analysis."
            },
            @{
                role = "user"
                content = $longPrompt
            }
        )
        max_tokens = 3000  # High token usage
        temperature = 0.8
        top_p = 0.95
        frequency_penalty = 0
        presence_penalty = 0
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$endpoint/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-02-01" -Method POST -Headers $headers -Body $body

        $successfulCalls++
        $tokensUsed = $response.usage.total_tokens
        $totalTokens += $tokensUsed

        Write-Host "   ✅ Call $i successful | Tokens: $tokensUsed | Total: $totalTokens" -ForegroundColor Green

    } catch {
        Write-Host "   ❌ Call $i failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Rate limiting to avoid throttling
    Start-Sleep -Milliseconds 200
}

Write-Host "`n📊 GENERATION SUMMARY:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor White
Write-Host "✅ Successful Calls: $successfulCalls/$callCount" -ForegroundColor Green
Write-Host "🔢 Total Tokens Used: $totalTokens" -ForegroundColor Yellow

if ($successfulCalls -gt 0) {
    $avgTokens = [math]::Round($totalTokens / $successfulCalls)
    Write-Host "📈 Average Tokens/Call: $avgTokens" -ForegroundColor Cyan

    # Estimate cost (rough calculation)
    # GPT-3.5-turbo pricing: ~$0.002 per 1K tokens
    $estimatedCost = [math]::Round(($totalTokens / 1000) * 0.002, 2)
    Write-Host "💰 Estimated Cost: `$$estimatedCost" -ForegroundColor Magenta
}

Write-Host "`n🔄 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor White
Write-Host "1. Check usage: .\azure-usage-monitor.ps1" -ForegroundColor White
Write-Host "2. Generate more: Run this script again" -ForegroundColor White
Write-Host "3. Test website: Visit tcdynamics.fr and use AI features" -ForegroundColor White

Write-Host "`n🎯 MISSION: Maximize `$200 credit usage in 7 days!" -ForegroundColor Green
