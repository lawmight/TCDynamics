REM Use TEST_ENDPOINT_URL environment variable if set, otherwise default to localhost
if not "%TEST_ENDPOINT_URL%"=="" (
    set TEST_URL=%TEST_ENDPOINT_URL%
) else (
    set TEST_URL=http://localhost:7071/api/chat
)

echo Testing curl escape handling with endpoint: %TEST_URL%

for /f "delims=" %%i in ('curl -s -X POST %TEST_URL% -H "Content-Type: application/json" -d "{\"message\":\"Hello\",\"sessionId\":\"test123\"}"') do (
    echo %%i
)

REM Check curl exit status after the loop
if errorlevel 1 (
    echo.
    echo ❌ ERROR: curl command failed with exit code %ERRORLEVEL%
    echo    Endpoint: %TEST_URL%
    echo    This may indicate a connection error, invalid endpoint, or server error.
    echo    For local testing, ensure Azure Functions are running on localhost:7071
    echo    For remote testing, set TEST_ENDPOINT_URL environment variable.
    exit /b 1
)
