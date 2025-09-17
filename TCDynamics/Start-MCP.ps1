# PowerShell script to start NIA MCP Server for TCDynamics
Write-Host "🚀 Starting NIA MCP Server for TCDynamics..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please ensure Node.js is installed and added to PATH" -ForegroundColor Yellow
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MCP server file exists
if (!(Test-Path "nia-mcp-server.js")) {
    Write-Host "❌ ERROR: nia-mcp-server.js not found in current directory!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the MCP server
Write-Host "🔧 Launching MCP server..." -ForegroundColor Yellow
Write-Host ""

# Start the server in a new window
Start-Process -FilePath "cmd" -ArgumentList "/k cd /d `"$PWD`" && node nia-mcp-server.js" -WindowStyle Normal

Write-Host ""
Write-Host "✅ MCP Server started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open Cursor IDE" -ForegroundColor White
Write-Host "2. The MCP server should auto-connect" -ForegroundColor White
Write-Host "3. Start asking questions about your TCDynamics project!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Example questions to try:" -ForegroundColor Magenta
Write-Host "• 'What's this project about?'" -ForegroundColor Gray
Write-Host "• 'Analyze the security of my contact form'" -ForegroundColor Gray
Write-Host "• 'What should a beginner learn next in Python?'" -ForegroundColor Gray
Write-Host "• 'How do I add a new API endpoint?'" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to close this window"
