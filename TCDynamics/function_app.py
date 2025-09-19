import azure.functions as func
import logging

# Import individual functions directly
from ContactForm import contact_form
from DemoForm import demo_form  
from AIFunctions import ai_chat, ai_vision

app = func.FunctionApp()

# Register functions directly
@app.route(route="ContactForm", methods=["POST"])
def contact_form_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    return contact_form(req)

@app.route(route="DemoForm", methods=["POST"]) 
def demo_form_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    return demo_form(req)

@app.route(route="chat", methods=["POST"])
def ai_chat_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    return ai_chat(req)

@app.route(route="vision", methods=["POST"])
def ai_vision_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    return ai_vision(req)

@app.route(route="health", methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Health check function processed a request.')
    return func.HttpResponse(
        "TCDynamics Azure Functions are running",
        status_code=200,
        headers={"Content-Type": "text/plain"}
    )

