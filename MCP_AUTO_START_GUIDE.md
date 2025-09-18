# 🚀 NIA MCP Auto-Start Guide for Cursor

This guide shows you how to automatically start the NIA MCP server whenever you open Cursor, so you always have AI-powered code assistance ready.

## 🎯 Quick Start Options

### Option 1: One-Click Auto-Start (Recommended)

```powershell
# Run this once to set up automatic startup
.\setup-auto-start.ps1
```

This creates a Windows Scheduled Task that starts MCP when you log in to Windows.

### Option 2: Cursor Startup Script

Add this to your Cursor workspace settings:

```powershell
.\cursor-startup.ps1
```

### Option 3: Manual Background Start

```powershell
.\start-mcp-service.ps1
```

---

## 📋 Available Scripts

| Script                     | Purpose                            | Usage                                |
| -------------------------- | ---------------------------------- | ------------------------------------ |
| `start-mcp-service.ps1`    | Start MCP as background service    | `.\start-mcp-service.ps1`            |
| `start-mcp-background.ps1` | Silent background startup          | `.\start-mcp-background.ps1 -Silent` |
| `cursor-startup.ps1`       | Cursor-specific startup            | `.\cursor-startup.ps1`               |
| `setup-auto-start.ps1`     | Set up Windows auto-start          | `.\setup-auto-start.ps1`             |
| `Start-MCP.ps1`            | Interactive startup (opens window) | `.\Start-MCP.ps1`                    |
| `start-mcp.bat`            | Batch file startup (opens window)  | `start-mcp.bat`                      |

---

## 🔧 Detailed Setup Instructions

### Method 1: Windows Scheduled Task (Best)

This method starts MCP automatically when you log in to Windows.

1. **Run the setup script:**

   ```powershell
   .\setup-auto-start.ps1
   ```

2. **Test it:**
   - Log off and log back in, or
   - Run: `.\start-mcp-service.ps1 -Silent`

3. **Verify:**
   ```powershell
   Get-Process -Name "node" | Where-Object { $_.CommandLine -like "*nia-mcp-server*" }
   ```

### Method 2: Cursor Workspace Startup

Add the startup script to your Cursor workspace.

1. **Create a `.cursorrules` file** (already created)
2. **Add to Cursor settings:**
   - Open Cursor Settings
   - Go to "Workspace" → "Tasks"
   - Add: `powershell.exe -ExecutionPolicy Bypass -File .\cursor-startup.ps1`

### Method 3: Manual Service Control

Control the MCP service manually when needed.

```powershell
# Start service
.\start-mcp-service.ps1

# Stop service
.\start-mcp-service.ps1 -Stop

# Silent operation
.\start-mcp-service.ps1 -Silent
```

---

## 🔍 Troubleshooting

### Check if MCP is Running

```powershell
# Check for Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue

# Check network port
netstat -ano | findstr :3001

# Check PowerShell jobs
Get-Job
```

### Common Issues

#### ❌ "Node.js not found"

```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS
```

#### ❌ "MCP server not found"

- Ensure you're in the project root directory
- Check that `nia-mcp-server.js` exists

#### ❌ "Permission denied"

```powershell
# Run PowerShell as Administrator
# Or set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### ❌ "Port 3001 already in use"

```powershell
# Find what's using the port
netstat -ano | findstr :3001

# Kill the process
Stop-Process -Id <PID>
```

---

## ⚙️ Advanced Configuration

### Custom Port

Edit `nia-mcp-server.js` to change the default port (3001).

### Environment Variables

Create a `.env` file in the project root:

```bash
NIA_API_KEY=your_api_key_here
NODE_ENV=production
```

### Log Files

MCP server logs are written to the console. To save logs:

```powershell
.\start-mcp-service.ps1 > mcp-server.log 2>&1
```

---

## 🎯 What's Different Now

### ✅ Before

- Manual startup required each time
- Command windows opening
- No automation

### ✅ After

- **Automatic startup** with Windows login
- **Silent operation** (no windows)
- **Service-like behavior**
- **Always ready** when you open Cursor

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify Node.js is installed:** `node --version`
3. **Test manually:** `.\Start-MCP.ps1`
4. **Check permissions:** Run PowerShell as Administrator

---

## 🎉 Success!

Once set up, your NIA MCP server will:

- ✅ Start automatically with Windows
- ✅ Connect to Cursor seamlessly
- ✅ Provide AI-powered code assistance
- ✅ Index your repositories intelligently
- ✅ Work across all your projects

**Enjoy seamless AI-powered development! 🚀**
