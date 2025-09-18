# Auto-Start Setup for NIA MCP Server
# This script creates a scheduled task to auto-start MCP when you log in

Write-Host "🔧 Setting up NIA MCP Auto-Start..." -ForegroundColor Green
Write-Host ""

# Get current directory
$CurrentDir = Get-Location
$McpScript = Join-Path $CurrentDir "start-mcp-service.ps1"

# Check if the background script exists
if (!(Test-Path $McpScript)) {
    Write-Host "❌ Background script not found: $McpScript" -ForegroundColor Red
    Write-Host "Please run this script from the project directory." -ForegroundColor Yellow
    exit 1
}

# Create scheduled task
$TaskName = "NIA MCP Server Auto-Start"
$TaskDescription = "Automatically starts NIA MCP server on user login"

Write-Host "📋 Creating scheduled task..." -ForegroundColor Cyan

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "⚠️  Scheduled task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create new scheduled task
try {
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$McpScript`" -Silent"
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $TaskName -Description $TaskDescription -Action $action -Trigger $trigger -Principal $principal -Settings $settings

    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host "📍 Task will run automatically when you log in to Windows" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You can still start MCP manually using the startup scripts." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What you can do now:" -ForegroundColor Cyan
Write-Host "1. Log off and log back in to test auto-start" -ForegroundColor White
Write-Host "2. Or run: .\start-mcp-background.ps1 manually" -ForegroundColor White
Write-Host "3. Use Cursor with MCP already running!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Manual alternatives:" -ForegroundColor Magenta
Write-Host "• .\Start-MCP.ps1 (opens new window)" -ForegroundColor Gray
Write-Host "• .\start-mcp.bat (opens new window)" -ForegroundColor Gray
Write-Host "• .\start-mcp-background.ps1 (runs silently)" -ForegroundColor Gray

Write-Host ""
Read-Host "Press Enter to exit"
