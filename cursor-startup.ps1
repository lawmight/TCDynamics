# Cursor Startup Script for NIA MCP
# Place this in your Cursor workspace and configure it to run on startup

Write-Host "🚀 Starting NIA MCP for Cursor..." -ForegroundColor Green

# Get the script directory (should be your project root)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start MCP server in background
$backgroundScript = Join-Path $ScriptDir "start-mcp-background.ps1"
if (Test-Path $backgroundScript) {
    & $backgroundScript -Silent
} else {
    Write-Host "❌ Background startup script not found: $backgroundScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cursor startup complete!" -ForegroundColor Green

