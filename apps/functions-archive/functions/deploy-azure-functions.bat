@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Azure Functions deployment...

REM Check if Azure CLI is installed
az version >nul 2>&1
if errorlevel 1 (
    echo ❌ Azure CLI is not installed. Please install it first:
    echo    https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
    pause
    exit /b 1
)

REM Check if Python is installed and store executable
set PYTHON_CMD=
python --version >nul 2>&1
if not errorlevel 1 (
    set PYTHON_CMD=python
) else (
    python3 --version >nul 2>&1
    if not errorlevel 1 (
        set PYTHON_CMD=python3
    ) else (
        echo ❌ Python is not installed. Please install it first:
        echo    https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

REM Check if Azure Functions Core Tools is installed
func --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Azure Functions Core Tools is not installed. Please install it first:
    echo    npm install -g azure-functions-core-tools@4 --unsafe-perm true
    pause
    exit /b 1
)

REM Check if curl is installed
curl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ curl is not installed. Please install it first:
    echo    Windows 10+: curl is included - enable it in Windows Features
    echo    Or install Git for Windows (includes curl): https://git-scm.com/download/win
    echo    Or download from: https://curl.se/windows/
    pause
    exit /b 1
)

REM Check if we're logged into Azure
echo 🔐 Checking Azure login...
az account show >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged into Azure. Please login first:
    echo    az login
    pause
    exit /b 1
)

echo ✅ Azure login confirmed

REM ============================================================================
REM Function App Name Configuration
REM ============================================================================
REM Accept function app name from:
REM   1. Command line parameter (%1)
REM   2. Environment variable (FUNCTION_APP_NAME)
REM   3. Exit with usage message if neither provided

REM Check for help flag
if "%1"=="-h" goto :usage
if "%1"=="--help" goto :usage
if "%1"=="/?" goto :usage

REM Get function app name from parameter or environment variable
if not "%1"=="" (
    set FUNCTION_APP_NAME=%1
) else (
    REM Check environment variable (use %VAR% syntax to read actual env var)
    if not "%FUNCTION_APP_NAME%"=="" (
        REM Use environment variable if set (no need to reassign)
    ) else (
        REM No function app name provided
        goto :usage
    )
)

REM Validate function app name is not empty
if "!FUNCTION_APP_NAME!"=="" (
    goto :usage
)

echo 📝 Using Function App: !FUNCTION_APP_NAME!

REM ============================================================================
REM Resource Group Configuration
REM ============================================================================
REM Accept resource group from:
REM   1. Command line parameter (%2)
REM   2. Environment variable (RESOURCE_GROUP)
REM   3. Default to "rg-TCDynamics" if neither provided

REM Get resource group from parameter or environment variable
if not "%2"=="" (
    set RESOURCE_GROUP=%2
) else (
    REM Check environment variable
    if not "%RESOURCE_GROUP%"=="" (
        REM Use environment variable if set (no need to reassign)
    ) else (
        REM Use default
        set RESOURCE_GROUP=rg-TCDynamics
    )
)

echo 📝 Using Resource Group: !RESOURCE_GROUP!

REM Navigate to TCDynamics directory
cd /d "%~dp0"

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

REM Check if function_app.py exists
if not exist "function_app.py" (
    echo ❌ function_app.py not found
    pause
    exit /b 1
)

echo 📦 Setting up Python virtual environment...
if not exist ".venv" (
    %PYTHON_CMD% -m venv .venv
)
call .venv\Scripts\activate.bat
REM Verify activation by checking VIRTUAL_ENV variable
if not defined VIRTUAL_ENV (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

echo 📥 Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo 🔧 Testing functions locally...
REM Start the function host in background
start /B "FuncHost" func start --verbose --port 7071

REM Capture the PID of the started func.exe process
REM Wait a moment for the process to start, then find the most recently started func.exe
timeout /t 1 /nobreak >nul
set FUNC_PID=
REM Use PowerShell to find the most recently started func.exe process by StartTime
for /f "delims=" %%p in ('powershell -Command "$proc = Get-Process -Name func -ErrorAction SilentlyContinue | Sort-Object StartTime -Descending | Select-Object -First 1; if ($proc) { Write-Output $proc.Id }"') do (
    set FUNC_PID=%%p
    goto :pid_found
)
:pid_found

REM Verify func process is running and PID was captured
if "!FUNC_PID!"=="" (
    echo ❌ Functions host failed to start or PID could not be captured
    pause
    exit /b 1
)

echo ✅ Functions host started with PID: !FUNC_PID!

REM Read startup timeout from environment variable with default of 15 seconds
set STARTUP_TIMEOUT=15
if not "%AZURE_FUNCTIONS_STARTUP_TIMEOUT%"=="" (
    REM Try to parse as integer and validate it's a positive number
    set /a PARSED_TIMEOUT=%AZURE_FUNCTIONS_STARTUP_TIMEOUT% 2>nul
    REM set /a doesn't set errorlevel on parse failure, so validate the result
    REM Check if parsed value is valid (positive integer greater than 0)
    if !PARSED_TIMEOUT! GTR 0 (
        set STARTUP_TIMEOUT=!PARSED_TIMEOUT!
    ) else (
        echo ⚠️ Invalid AZURE_FUNCTIONS_STARTUP_TIMEOUT value "%AZURE_FUNCTIONS_STARTUP_TIMEOUT%" (must be positive integer), using default 15 seconds
    )
)
echo ⏱️ Startup timeout set to !STARTUP_TIMEOUT! seconds

REM Read health endpoint from environment variable with default of /api/health
REM HEALTH_ENDPOINT: Configurable health check endpoint path (default: /api/health)
REM Set this environment variable if your health endpoint uses a different path
REM Example: set HEALTH_ENDPOINT=/health or set HEALTH_ENDPOINT=/api/v1/health
if not "%HEALTH_ENDPOINT%"=="" (
    REM Use environment variable if set
    set HEALTH_ENDPOINT=%HEALTH_ENDPOINT%
) else (
    REM Use default if not set
    set HEALTH_ENDPOINT=/api/health
)
echo 🔗 Health endpoint: !HEALTH_ENDPOINT!

REM Wait for functions to start with readiness check loop
echo 🔄 Waiting for functions to be ready (max !STARTUP_TIMEOUT! seconds)...
set ELAPSED=0
set CHECK_INTERVAL=2
:wait_loop
curl -f http://localhost:7071!HEALTH_ENDPOINT! >nul 2>&1
if not errorlevel 1 (
    echo ✅ Health endpoint ready (after !ELAPSED! seconds)
    goto :health_ready
)
if !ELAPSED! GEQ !STARTUP_TIMEOUT! (
    echo ❌ Health endpoint not responding after !STARTUP_TIMEOUT! seconds
    if not "!FUNC_PID!"=="" (
        taskkill /PID !FUNC_PID! /F >nul 2>&1
    )
    pause
    exit /b 1
)
timeout /t !CHECK_INTERVAL! /nobreak >nul
set /a ELAPSED+=!CHECK_INTERVAL!
goto :wait_loop

:health_ready
echo 🧪 Functions host is ready and responding

REM Kill local functions using the captured PID
if not "!FUNC_PID!"=="" (
    taskkill /PID !FUNC_PID! /F >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo ☁️ Deploying to Azure Functions...
func azure functionapp publish !FUNCTION_APP_NAME! --nozip
if errorlevel 1 (
    echo ❌ Deployment to Azure Functions failed
    echo    Please check your Azure credentials and function app configuration
    pause
    exit /b 1
)
echo ✅ Deployment command completed successfully

echo 🔍 Checking deployment status...
REM Configure polling parameters
REM Read health check interval from environment variable with default of 5 seconds
set HEALTH_CHECK_INTERVAL=5
if not "%AZURE_FUNCTIONS_HEALTH_CHECK_INTERVAL%"=="" (
    set /a PARSED_INTERVAL=%AZURE_FUNCTIONS_HEALTH_CHECK_INTERVAL% 2>nul
    if !PARSED_INTERVAL! GTR 0 (
        set HEALTH_CHECK_INTERVAL=!PARSED_INTERVAL!
    ) else (
        echo ⚠️ Invalid AZURE_FUNCTIONS_HEALTH_CHECK_INTERVAL value "%AZURE_FUNCTIONS_HEALTH_CHECK_INTERVAL%" (must be positive integer), using default 5 seconds
    )
)

REM Read max timeout from environment variable with default of 180 seconds
set HEALTH_CHECK_MAX_TIMEOUT=180
if not "%AZURE_FUNCTIONS_HEALTH_CHECK_MAX_TIMEOUT%"=="" (
    set /a PARSED_MAX_TIMEOUT=%AZURE_FUNCTIONS_HEALTH_CHECK_MAX_TIMEOUT% 2>nul
    if !PARSED_MAX_TIMEOUT! GTR 0 (
        set HEALTH_CHECK_MAX_TIMEOUT=!PARSED_MAX_TIMEOUT!
    ) else (
        echo ⚠️ Invalid AZURE_FUNCTIONS_HEALTH_CHECK_MAX_TIMEOUT value "%AZURE_FUNCTIONS_HEALTH_CHECK_MAX_TIMEOUT%" (must be positive integer), using default 180 seconds
    )
)

echo ⏱️ Health check interval: !HEALTH_CHECK_INTERVAL! seconds, max timeout: !HEALTH_CHECK_MAX_TIMEOUT! seconds

echo 🔗 Testing deployed functions...
REM Poll health endpoint with retry loop
set ELAPSED=0
set ATTEMPT=0
set HEALTH_URL=https://!FUNCTION_APP_NAME!.azurewebsites.net!HEALTH_ENDPOINT!

:health_check_loop
set /a ATTEMPT+=1
echo [Attempt !ATTEMPT!] Checking health endpoint (elapsed: !ELAPSED!s)...

curl -f !HEALTH_URL! >nul 2>&1
if not errorlevel 1 (
    echo ✅ Health endpoint deployed successfully (after !ELAPSED! seconds, !ATTEMPT! attempts)
    goto :health_check_success
)

REM Check if max timeout reached
if !ELAPSED! GEQ !HEALTH_CHECK_MAX_TIMEOUT! (
    echo ❌ Health endpoint not accessible after !HEALTH_CHECK_MAX_TIMEOUT! seconds (!ATTEMPT! attempts)
    echo    Please check Azure Portal for deployment errors
    echo    Health endpoint URL: !HEALTH_URL!
    pause
    exit /b 1
)

REM Wait before next attempt
timeout /t !HEALTH_CHECK_INTERVAL! /nobreak >nul

REM Increment elapsed time after waiting
set /a ELAPSED+=!HEALTH_CHECK_INTERVAL!
goto :health_check_loop

:health_check_success

REM Test AI chat endpoint (if configured)
echo Testing AI chat endpoint...
for /f "delims=" %%i in ('curl -s -X POST https://!FUNCTION_APP_NAME!.azurewebsites.net/api/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello\",\"sessionId\":\"test123\"}"') do set CHAT_RESPONSE=%%i

echo !CHAT_RESPONSE! | findstr /C:"\"success\":true" >nul
if errorlevel 1 (
    echo ⚠️ AI chat endpoint may need Azure OpenAI configuration
    echo    Response: !CHAT_RESPONSE!
) else (
    echo ✅ AI chat endpoint working
)

echo.
echo 🎉 Azure Functions deployment completed!
echo.
echo 📋 Next steps:
echo 1. Go to Azure Portal → Function App → Configuration
echo 2. Add all environment variables from md/AZURE_FUNCTIONS_ENV_SETUP.md
echo 3. Set CORS allowed origins to include your domain
echo 4. Test your website frontend integration
echo.
echo 🔗 Function App URL: https://!FUNCTION_APP_NAME!.azurewebsites.net
echo 📊 Monitor logs: az functionapp log tail --name !FUNCTION_APP_NAME! --resource-group !RESOURCE_GROUP!

pause
exit /b 0

:usage
echo.
echo ════════════════════════════════════════════════════════════════════════
echo   Azure Functions Deployment Script - Usage
echo ════════════════════════════════════════════════════════════════════════
echo.
echo   USAGE:
echo     deploy-azure-functions.bat [FUNCTION_APP_NAME] [RESOURCE_GROUP]
echo     deploy-azure-functions.bat -h ^| --help ^| /?
echo.
echo   PARAMETERS:
echo     FUNCTION_APP_NAME    Name of the Azure Function App to deploy to
echo                         (required if not set via environment variable)
echo     RESOURCE_GROUP       Azure Resource Group name
echo                         (optional, defaults to "rg-TCDynamics" if not provided)
echo.
echo   ENVIRONMENT VARIABLES:
echo     FUNCTION_APP_NAME    Alternative way to specify the function app name
echo                         (used if no command line parameter provided)
echo     RESOURCE_GROUP       Alternative way to specify the resource group
echo                         (used if no command line parameter provided)
echo     HEALTH_ENDPOINT      Health check endpoint path (default: /api/health)
echo                         Set this if your health endpoint uses a different path
echo.
echo   EXAMPLES:
echo     deploy-azure-functions.bat func-tcdynamics-contact
echo     deploy-azure-functions.bat func-tcdynamics-contact rg-TCDynamics
echo     set FUNCTION_APP_NAME=func-tcdynamics-contact
echo     set RESOURCE_GROUP=rg-TCDynamics
echo     deploy-azure-functions.bat
echo.
echo   NOTE: The function app name must be provided either as a command line
echo         parameter or via the FUNCTION_APP_NAME environment variable.
echo.
echo ════════════════════════════════════════════════════════════════════════
echo.
pause
exit /b 1
