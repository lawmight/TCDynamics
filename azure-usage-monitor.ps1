# 📊 AZURE CREDIT USAGE MONITOR
# Track your $200 credit consumption in real-time

Write-Host "📊 AZURE CREDIT MONITOR - WorkFlowAI" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Get current usage
Write-Host "`n💰 CURRENT CREDIT STATUS:" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor White

try {
    $usage = az consumption usage list --query "[].{Service:properties.consumedService, Cost:properties.pretaxCost, Date:properties.date}" -o json | ConvertFrom-Json

    $totalCost = 0
    $services = @{}

    foreach ($item in $usage) {
        if ($item.Cost -gt 0) {
            $totalCost += $item.Cost
            $services[$item.Service] = $item.Cost
        }
    }

    Write-Host "💵 Total Spent: `$$($totalCost.ToString('F2'))" -ForegroundColor Yellow
    Write-Host "💳 Remaining: `$($((200 - $totalCost).ToString('F2')))" -ForegroundColor Green
    Write-Host "📊 Usage: $(($totalCost / 2).ToString('F1'))% of `$200 credit" -ForegroundColor Cyan

    if ($services.Count -gt 0) {
        Write-Host "`n🔍 SERVICE BREAKDOWN:" -ForegroundColor White
        Write-Host "=====================" -ForegroundColor White

        foreach ($service in $services.GetEnumerator() | Sort-Object Value -Descending) {
            $percentage = (($service.Value / $totalCost) * 100).ToString('F1')
            Write-Host "  $($service.Key): `$$($service.Value.ToString('F2')) ($percentage%)" -ForegroundColor White
        }
    }

} catch {
    Write-Host "⚠️  Unable to fetch usage data (this is normal for new accounts)" -ForegroundColor Yellow
}

# Monitor AI service usage
Write-Host "`n🤖 AI SERVICES STATUS:" -ForegroundColor Green
Write-Host "======================" -ForegroundColor White

try {
    # OpenAI usage
    $openaiMetrics = az monitor metrics list --resource "/subscriptions/1c36990d-4423-495d-819b-008f0b44f285/resourceGroups/WorkFlowAI-rg/providers/Microsoft.CognitiveServices/accounts/workflowai-openai" --metric "TotalCalls" --query "value[0].timeseries[0].data[-1]" -o json 2>$null | ConvertFrom-Json

    if ($openaiMetrics.total) {
        Write-Host "🔄 OpenAI API Calls: $($openaiMetrics.total)" -ForegroundColor Cyan
        Write-Host "⏱️  Last Update: $($openaiMetrics.timeStamp)" -ForegroundColor White
    } else {
        Write-Host "🔄 OpenAI API Calls: 0 (metrics updating...)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "🔄 OpenAI: Service active, metrics pending" -ForegroundColor Yellow
}

# Calculate targets
Write-Host "`n🎯 CONSUMPTION TARGETS:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor White

$currentCredit = 200
$daysLeft = 7
$hoursLeft = $daysLeft * 24
$targetPerDay = $currentCredit / $daysLeft
$targetPerHour = $targetPerDay / 24

Write-Host "💰 Total Credit: `$200" -ForegroundColor White
Write-Host "⏰ Days Left: $daysLeft" -ForegroundColor White
Write-Host "🎯 Daily Target: `$$($targetPerDay.ToString('F2'))" -ForegroundColor Yellow
Write-Host "⚡ Hourly Target: `$$($targetPerHour.ToString('F2'))" -ForegroundColor Cyan

# Recommendations
Write-Host "`n🚀 RECOMMENDATIONS:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor White

if ($totalCost -lt 10) {
    Write-Host "🔥 HIGH PRIORITY: Generate AI API calls" -ForegroundColor Red
    Write-Host "   Run: .\maximize-azure-free-tier.ps1" -ForegroundColor White
}

if ($totalCost -lt 50) {
    Write-Host "📈 MEDIUM: Increase website traffic" -ForegroundColor Yellow
    Write-Host "   Share tcdynamics.fr with contacts" -ForegroundColor White
}

if ($totalCost -gt 100) {
    Write-Host "✅ GOOD: On track for 100% usage" -ForegroundColor Green
    Write-Host "   Continue current strategy" -ForegroundColor White
}

# Real-time suggestions
Write-Host "`n💡 IMMEDIATE ACTIONS:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor White
Write-Host "1. Open tcdynamics.fr and test AI chatbot multiple times" -ForegroundColor White
Write-Host "2. Upload documents to test AI Vision processing" -ForegroundColor White
Write-Host "3. Share website with 10+ contacts for traffic" -ForegroundColor White
Write-Host "4. Run AI processing scripts for bulk usage" -ForegroundColor White

Write-Host "`n🔄 REFRESH THIS MONITOR: .\azure-usage-monitor.ps1" -ForegroundColor Yellow
Write-Host "⏰ Check every 4-6 hours for updated usage" -ForegroundColor White
