import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Simple test function"""
    return func.HttpResponse("OK", status_code=200)
