import azure.functions as func
import logging

# Initialize Azure Functions app
# Individual functions are now in separate directories (v2 model)
try:
    func_app = func.FunctionApp()
    logging.info("Azure Functions app initialized successfully")
except Exception as e:
    logging.error(f"Failed to initialize Azure Functions app: {str(e)}")
    raise

# All functions have been moved to individual directories:
# - test/
# - health/
# - contactform/
# - demoform/
# - chat/
# - vision/
# - create-payment-intent/
# - create-subscription/
#
# Each directory contains function.json and __init__.py
