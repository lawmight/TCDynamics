# Free Tier Alert Script
$logFile = "C:\Users\Tomco\OneDrive\Documents\Projects\azure-free-tier-log.txt"
$alertFile = "C:\Users\Tomco\OneDrive\Documents\Projects\azure-free-tier-alerts.txt"

# Get current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Simple token usage check (you can expand this)
$estimatedTokens = 101000  # Update this with actual API call
$tokenLimit = 1000000
$usagePercent = [math]::Round(($estimatedTokens / $tokenLimit) * 100, 2)

# Log the usage
Add-Content -Path $logFile -Value "$timestamp - Token Usage: $estimatedTokens / $tokenLimit ($usagePercent%)"

# Check thresholds and create alerts
if ($usagePercent -gt 80) {
    $alertMsg = "$timestamp - WARNING: Free tier usage at $usagePercent%!"
    Add-Content -Path $alertFile -Value $alertMsg
    
    # Show Windows notification
    Add-Type -AssemblyName System.Windows.Forms
    $notification = New-Object System.Windows.Forms.NotifyIcon
    $notification.Icon = [System.Drawing.SystemIcons]::Warning
    $notification.BalloonTipIcon = "Warning"
    $notification.BalloonTipTitle = "Azure Free Tier Alert"
    $notification.BalloonTipText = "Usage at $usagePercent% of free tier!"
    $notification.Visible = $true
    $notification.ShowBalloonTip(10000)
} elseif ($usagePercent -gt 60) {
    $alertMsg = "$timestamp - INFO: Free tier usage at $usagePercent%"
    Add-Content -Path $alertFile -Value $alertMsg
}

Write-Host "Free Tier Check Complete: $usagePercent% used" -ForegroundColor Green
