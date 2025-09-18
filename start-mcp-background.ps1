# Background MCP Server Starter for Cursor
# This script starts the NIA MCP server in the background without opening windows

param(
    [switch]$Silent
)

# Set the project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to check if MCP server is already running
function Test-MCPServer {
    try {
        $connections = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
        return $connections.Count -gt 0
    } catch {
        return $false
    }
}

# Function to start MCP server
function Start-MCPServer {
    param([string]$ProjectPath)

    # Check if Node.js is available
    try {
        $nodeVersion = & node --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
    } catch {
        if (-not $Silent) {
            Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
            Write-Host "Please ensure Node.js is installed and added to PATH" -ForegroundColor Yellow
        }
        return $false
    }

    # Check if MCP server file exists
    $mcpServerPath = Join-Path $ProjectPath "nia-mcp-server.js"
    if (!(Test-Path $mcpServerPath)) {
        if (-not $Silent) {
            Write-Host "❌ ERROR: nia-mcp-server.js not found!" -ForegroundColor Red
        }
        return $false
    }

    # Start the MCP server in background
    try {
        $process = Start-Process -FilePath "node" -ArgumentList $mcpServerPath -WorkingDirectory $ProjectPath -NoNewWindow -PassThru
        Start-Sleep -Seconds 2

        if (!$process.HasExited) {
            if (-not $Silent) {
                Write-Host "✅ NIA MCP Server started successfully (PID: $($process.Id))" -ForegroundColor Green
                Write-Host "📍 Running in background on port 3001" -ForegroundColor Cyan
            }
            return $true
        } else {
            if (-not $Silent) {
                Write-Host "❌ Failed to start MCP server" -ForegroundColor Red
            }
            return $false
        }
    } catch {
        if (-not $Silent) {
            Write-Host "❌ Error starting MCP server: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Main execution
if (Test-MCPServer) {
    if (-not $Silent) {
        Write-Host "ℹ️  NIA MCP Server is already running" -ForegroundColor Yellow
    }
    exit 0
}

$result = Start-MCPServer -ProjectPath $ProjectDir
if ($result) {
    exit 0
} else {
    if (-not $Silent) {
        Write-Host "❌ Failed to start NIA MCP Server" -ForegroundColor Red
    }
    exit 1
}

