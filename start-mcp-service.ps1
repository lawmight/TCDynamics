# NIA MCP Service Starter
# This script starts the MCP server as a Windows service-like process

param(
    [switch]$Silent,
    [switch]$Stop
)

$ServiceName = "NIAMCPService"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$McpServerPath = Join-Path $ScriptDir "nia-mcp-server.js"

if ($Stop) {
    # Stop the service
    $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*nia-mcp-server.js*"
    }

    if ($existingProcess) {
        Stop-Process -Id $existingProcess.Id -Force
        if (-not $Silent) {
            Write-Host "✅ NIA MCP Server stopped" -ForegroundColor Green
        }
    } else {
        if (-not $Silent) {
            Write-Host "ℹ️  NIA MCP Server was not running" -ForegroundColor Yellow
        }
    }
    exit 0
}

# Check if already running
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*nia-mcp-server.js*"
}

if ($existingProcess) {
    if (-not $Silent) {
        Write-Host "ℹ️  NIA MCP Server is already running (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    }
    exit 0
}

# Check Node.js
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
} catch {
    if (-not $Silent) {
        Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    }
    exit 1
}

# Check MCP server file
if (!(Test-Path $McpServerPath)) {
    if (-not $Silent) {
        Write-Host "❌ ERROR: nia-mcp-server.js not found!" -ForegroundColor Red
    }
    exit 1
}

# Start the server
try {
    if (-not $Silent) {
        Write-Host "🚀 Starting NIA MCP Server..." -ForegroundColor Green
    }

    # Start as background job
    $job = Start-Job -ScriptBlock {
        param($ServerPath, $WorkingDir)
        Set-Location $WorkingDir
        & node $ServerPath
    } -ArgumentList $McpServerPath, $ScriptDir

    Start-Sleep -Seconds 2

    # Check if job is running
    if ($job.State -eq "Running") {
        if (-not $Silent) {
            Write-Host "✅ NIA MCP Server started successfully!" -ForegroundColor Green
            Write-Host "📍 Job ID: $($job.Id)" -ForegroundColor Cyan
            Write-Host "💡 The server is running in the background" -ForegroundColor Gray
        }
        exit 0
    } else {
        if (-not $Silent) {
            Write-Host "❌ Failed to start MCP server" -ForegroundColor Red
            $job | Receive-Job
        }
        exit 1
    }
} catch {
    if (-not $Silent) {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

