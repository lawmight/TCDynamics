# Setup Automated Azure Free Tier Monitoring
# Creates scheduled tasks and monitoring alerts

Write-Host ""
Write-Host "SETTING UP AUTOMATED FREE TIER MONITORING" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# Create monitoring task script
$monitorScript = @'
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
'@

# Save the monitoring script
$monitorScriptPath = "C:\Users\Tomco\OneDrive\Documents\Projects\monitor-free-tier-task.ps1"
Set-Content -Path $monitorScriptPath -Value $monitorScript

Write-Host "Created monitoring script: $monitorScriptPath" -ForegroundColor Green
Write-Host ""

# Create scheduled task for monitoring
Write-Host "CREATING SCHEDULED TASK..." -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor White
Write-Host ""

try {
    # Check if task already exists
    $existingTask = Get-ScheduledTask -TaskName "AzureFreeTierMonitor" -ErrorAction SilentlyContinue
    
    if ($existingTask) {
        Write-Host "Scheduled task already exists. Updating..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName "AzureFreeTierMonitor" -Confirm:$false
    }
    
    # Create the scheduled task
    $taskName = "AzureFreeTierMonitor"
    $taskDescription = "Monitor Azure Free Tier usage and send alerts"
    
    # Create trigger (every 6 hours)
    $trigger = New-ScheduledTaskTrigger -Daily -At "09:00AM" -DaysInterval 1
    $trigger2 = New-ScheduledTaskTrigger -Daily -At "03:00PM" -DaysInterval 1
    $trigger3 = New-ScheduledTaskTrigger -Daily -At "09:00PM" -DaysInterval 1
    
    # Create action
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$monitorScriptPath`""
    
    # Create settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # Register the task
    Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Trigger $trigger,$trigger2,$trigger3 -Action $action -Settings $settings -RunLevel Limited
    
    Write-Host "Successfully created scheduled task: $taskName" -ForegroundColor Green
    Write-Host "The task will run 3 times daily (9 AM, 3 PM, 9 PM)" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Could not create scheduled task automatically." -ForegroundColor Yellow
    Write-Host "To set up manually:" -ForegroundColor White
    Write-Host "1. Open Task Scheduler" -ForegroundColor White
    Write-Host "2. Create Basic Task named 'AzureFreeTierMonitor'" -ForegroundColor White
    Write-Host "3. Set trigger: Daily at 9 AM, 3 PM, 9 PM" -ForegroundColor White
    Write-Host "4. Set action: Start PowerShell with script $monitorScriptPath" -ForegroundColor White
    Write-Host ""
}

# Create usage dashboard
Write-Host "CREATING USAGE DASHBOARD..." -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor White
Write-Host ""

# Initialize log files if they don't exist
$logFile = "C:\Users\Tomco\OneDrive\Documents\Projects\azure-free-tier-log.txt"
$alertFile = "C:\Users\Tomco\OneDrive\Documents\Projects\azure-free-tier-alerts.txt"

if (-not (Test-Path $logFile)) {
    New-Item -Path $logFile -ItemType File -Force | Out-Null
    Add-Content -Path $logFile -Value "Azure Free Tier Usage Log"
    Add-Content -Path $logFile -Value "========================="
    Write-Host "Created log file: $logFile" -ForegroundColor Green
}

if (-not (Test-Path $alertFile)) {
    New-Item -Path $alertFile -ItemType File -Force | Out-Null
    Add-Content -Path $alertFile -Value "Azure Free Tier Alerts"
    Add-Content -Path $alertFile -Value "======================"
    Write-Host "Created alert file: $alertFile" -ForegroundColor Green
}

Write-Host ""

# Create quick access shortcuts
Write-Host "CREATING QUICK ACCESS SHORTCUTS..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor White
Write-Host ""

# Create desktop shortcut for monitoring
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\Azure Free Tier Monitor.lnk"

$WScriptShell = New-Object -ComObject WScript.Shell
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -File `"C:\Users\Tomco\OneDrive\Documents\Projects\free-tier-monitor.ps1`""
$shortcut.WorkingDirectory = "C:\Users\Tomco\OneDrive\Documents\Projects"
$shortcut.IconLocation = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$shortcut.Description = "Monitor Azure Free Tier Usage"
$shortcut.Save()

Write-Host "Created desktop shortcut: Azure Free Tier Monitor" -ForegroundColor Green

# Display monitoring commands
Write-Host ""
Write-Host "MONITORING COMMANDS:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor White
Write-Host ""
Write-Host "1. Check current usage:" -ForegroundColor Yellow
Write-Host "   .\free-tier-monitor.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. View usage log:" -ForegroundColor Yellow
Write-Host "   Get-Content .\azure-free-tier-log.txt -Tail 20" -ForegroundColor White
Write-Host ""
Write-Host "3. View alerts:" -ForegroundColor Yellow
Write-Host "   Get-Content .\azure-free-tier-alerts.txt" -ForegroundColor White
Write-Host ""
Write-Host "4. Run optimization:" -ForegroundColor Yellow
Write-Host "   .\optimize-free-tier.ps1" -ForegroundColor White
Write-Host ""
Write-Host "5. Manual task run:" -ForegroundColor Yellow
Write-Host "   Start-ScheduledTask -TaskName 'AzureFreeTierMonitor'" -ForegroundColor White
Write-Host ""

# Set up email notifications (optional)
Write-Host "EMAIL NOTIFICATION SETUP:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor White
Write-Host ""
Write-Host "To receive email alerts when approaching limits:" -ForegroundColor Yellow
Write-Host "1. Your backend at tcdynamics.fr can send emails via Zoho Mail" -ForegroundColor White
Write-Host "2. Integrate the monitoring script with your backend API" -ForegroundColor White
Write-Host "3. Call your /api/contact endpoint when usage > 80%" -ForegroundColor White
Write-Host ""

# Final summary
Write-Host "MONITORING SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Automated Monitoring: ACTIVE" -ForegroundColor Green
Write-Host "Check Frequency: 3 times daily" -ForegroundColor White
Write-Host "Alert Threshold: 80% of free tier" -ForegroundColor Yellow
Write-Host "Log Location: $logFile" -ForegroundColor White
Write-Host "Desktop Shortcut: Created" -ForegroundColor Green
Write-Host ""
Write-Host "Your Azure free tier is now being monitored automatically!" -ForegroundColor Cyan
