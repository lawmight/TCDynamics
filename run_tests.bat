@echo off
echo 🚀 Running WorkFlowAI Integration Tests
echo ======================================

echo 📋 Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo 📦 Installing required packages...
pip install python-dotenv aiohttp azure-cosmos

echo 🧪 Running Azure Services Tests...
python test_azure_services.py

echo.
echo ✨ Test completed!
pause
