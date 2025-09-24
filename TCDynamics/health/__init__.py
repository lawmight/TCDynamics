import azure.functions as func
import logging
import time
import json
import sys

# Track application start time for uptime calculation
app_start_time = time.time()

# Handle optional imports that might fail
try:
    from datetime import datetime
    datetime_available = True
except ImportError as e:
    logging.warning(f"datetime library not available: {e}")
    datetime_available = False
    datetime = None

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint to verify function app is running"""
    logging.info('Health check function processed a request.')

    try:
        # Calculate uptime
        current_time = time.time()
        uptime_seconds = current_time - app_start_time

        # Basic system checks
        python_version = sys.version.split()[0] if sys.version else "unknown"

        # Count registered functions (simplified)
        function_count = 8  # Known number of functions

        # Create health response with diagnostic information
        health_data = {
            "status": "healthy",
            "uptime": uptime_seconds,
            "timestamp": "running",
            "python_version": python_version,
            "function_count": function_count,
            "environment": "Azure Functions",
            "azure_functions_version": "1.17.0"
        }

        logging.info(f"Health check successful: status={health_data['status']}, uptime={uptime_seconds:.1f}s, functions={function_count}")
        return func.HttpResponse(
            json.dumps(health_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Health check error: {str(e)}")
        logging.error(f"Error type: {type(e).__name__}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")

        error_data = {
            "status": "unhealthy",
            "error": str(e),
            "error_type": type(e).__name__,
            "timestamp": (datetime.utcnow().isoformat() + "Z" if datetime_available else "error")
        }
        return func.HttpResponse(
            json.dumps(error_data),
            status_code=503,
            headers={"Content-Type": "application/json"}
        )
