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

REM Check if Azure Functions Core Tools is installed
func --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Azure Functions Core Tools is not installed. Please install it first:
    echo    npm install -g azure-functions-core-tools@4 --unsafe-perm true
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

echo 📦 Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo 🔧 Testing functions locally...
start /B func start --verbose
set FUNC_PID=%!

REM Wait a few seconds for functions to start
timeout /t 5 /nobreak >nul

echo 🧪 Testing health endpoint...
curl -f http://localhost:7071/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Health endpoint not responding
    taskkill /PID !FUNC_PID! /F >nul 2>&1
    pause
    exit /b 1
) else (
    echo ✅ Health endpoint working
)

REM Kill local functions
taskkill /PID !FUNC_PID! /F >nul 2>&1
timeout /t 2 /nobreak >nul

echo ☁️ Deploying to Azure Functions...
func azure functionapp publish func-tcdynamics-contact --nozip

echo 🔍 Checking deployment status...
REM Wait for deployment to complete
timeout /t 10 /nobreak >nul

echo 🔗 Testing deployed functions...

REM Test health endpoint
echo Testing health endpoint...
curl -f https://func-tcdynamics-contact.azurewebsites.net/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Health endpoint not accessible after deployment
    echo    Please check Azure Portal for deployment errors
    pause
    exit /b 1
) else (
    echo ✅ Health endpoint deployed successfully
)

REM Test contact form endpoint
echo Testing contact form endpoint...
for /f "delims=" %%i in ('curl -s -X POST https://func-tcdynamics-contact.azurewebsites.net/api/contactform -H "Content-Type: application/json" -d "{"name":"Test User","email":"test@example.com","message":"Test message"}"') do set CONTACT_RESPONSE=%%i

echo !CONTACT_RESPONSE! | findstr "success.*true" >nul
if errorlevel 1 (
    echo ❌ Contact form endpoint not working properly
    echo    Response: !CONTACT_RESPONSE!
) else (
    echo ✅ Contact form endpoint working
)

REM Test AI chat endpoint (if configured)
echo Testing AI chat endpoint...
for /f "delims=" %%i in ('curl -s -X POST https://func-tcdynamics-contact.azurewebsites.net/api/chat -H "Content-Type: application/json" -d "{"message":"Hello","sessionId":"test123"}"') do set CHAT_RESPONSE=%%i

echo !CHAT_RESPONSE! | findstr "success.*true" >nul
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
echo 🔗 Function App URL: https://func-tcdynamics-contact.azurewebsites.net
echo 📊 Monitor logs: az functionapp log tail --name func-tcdynamics-contact --resource-group rg-TCDynamics

pause
