import azure.functions as func
import logging
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import openai
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
import azure.cosmos as cosmos
import stripe

# Configuration from environment variables
AZURE_OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT')
AZURE_OPENAI_KEY = os.environ.get('AZURE_OPENAI_KEY')
AZURE_OPENAI_DEPLOYMENT = os.environ.get('AZURE_OPENAI_DEPLOYMENT', 'gpt-35-turbo')
AZURE_VISION_ENDPOINT = os.environ.get('AZURE_VISION_ENDPOINT')
AZURE_VISION_KEY = os.environ.get('AZURE_VISION_KEY')
ZOHO_EMAIL = os.environ.get('ZOHO_EMAIL')
ZOHO_PASSWORD = os.environ.get('ZOHO_PASSWORD')
COSMOS_CONNECTION_STRING = os.environ.get('COSMOS_CONNECTION_STRING')
COSMOS_DATABASE = os.environ.get('COSMOS_DATABASE', 'tcdynamics')
COSMOS_CONTAINER_CONTACTS = os.environ.get('COSMOS_CONTAINER_CONTACTS', 'contacts')
COSMOS_CONTAINER_DEMOS = os.environ.get('COSMOS_CONTAINER_DEMOS', 'demo_requests')
COSMOS_CONTAINER_CONVERSATIONS = os.environ.get('COSMOS_CONTAINER_CONVERSATIONS', 'conversations')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')

# Initialize clients
if AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY:
    openai_client = openai.AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_KEY,
        api_version="2024-02-15-preview"
    )

if AZURE_VISION_ENDPOINT and AZURE_VISION_KEY:
    vision_client = ImageAnalysisClient(
        endpoint=AZURE_VISION_ENDPOINT,
        credential=AzureKeyCredential(AZURE_VISION_KEY)
    )

if COSMOS_CONNECTION_STRING:
    cosmos_client = cosmos.CosmosClient.from_connection_string(COSMOS_CONNECTION_STRING)
    database = cosmos_client.get_database_client(COSMOS_DATABASE)
    contacts_container = database.get_container_client(COSMOS_CONTAINER_CONTACTS)
    demos_container = database.get_container_client(COSMOS_CONTAINER_DEMOS)
    conversations_container = database.get_container_client(COSMOS_CONTAINER_CONVERSATIONS)

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

app = func.FunctionApp()

def send_email_smtp(to_email: str, subject: str, body: str) -> bool:
    """Send email via Zoho SMTP"""
    try:
        msg = MimeMultipart()
        msg['From'] = ZOHO_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MimeText(body, 'plain'))

        server = smtplib.SMTP('smtp.zoho.eu', 587)
        server.starttls()
        server.login(ZOHO_EMAIL, ZOHO_PASSWORD)
        text = msg.as_string()
        server.sendmail(ZOHO_EMAIL, to_email, text)
        server.quit()
        return True
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        return False

def save_to_cosmos(container_client, data: Dict[str, Any]) -> str:
    """Save data to Cosmos DB"""
    try:
        data['id'] = str(uuid.uuid4())
        data['timestamp'] = datetime.utcnow().isoformat()
        container_client.create_item(body=data)
        return data['id']
    except Exception as e:
        logging.error(f"Failed to save to Cosmos: {str(e)}")
        return None

@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint"""
    return func.HttpResponse(
        json.dumps({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "python_version": os.sys.version,
            "environment": "production"
        }),
        mimetype="application/json"
    )

@app.route(route="contactform", auth_level=func.AuthLevel.ANONYMOUS)
def contact_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle contact form submissions"""
    try:
        data = req.get_json()
        name = data.get('name', '')
        email = data.get('email', '')
        message = data.get('message', '')

        if not all([name, email, message]):
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Tous les champs sont requis"}),
                status_code=400,
                mimetype="application/json"
            )

        # Save to Cosmos DB
        contact_data = {
            "name": name,
            "email": email,
            "message": message,
            "type": "contact"
        }
        message_id = save_to_cosmos(contacts_container, contact_data)

        # Send email notification
        email_body = f"""
Nouveau message de contact:

Nom: {name}
Email: {email}
Message: {message}

ID de référence: {message_id}
        """

        email_sent = send_email_smtp(
            ZOHO_EMAIL,
            f"Nouveau message de {name}",
            email_body
        )

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Message envoyé avec succès",
                "messageId": message_id,
                "emailSent": email_sent
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Contact form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur serveur"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="demoform", auth_level=func.AuthLevel.ANONYMOUS)
def demo_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle demo request form submissions"""
    try:
        data = req.get_json()
        name = data.get('name', '')
        email = data.get('email', '')
        company = data.get('company', '')
        business_needs = data.get('businessNeeds', '')

        if not all([name, email, business_needs]):
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Tous les champs sont requis"}),
                status_code=400,
                mimetype="application/json"
            )

        # Save to Cosmos DB
        demo_data = {
            "name": name,
            "email": email,
            "company": company,
            "businessNeeds": business_needs,
            "type": "demo_request"
        }
        message_id = save_to_cosmos(demos_container, demo_data)

        # Send email notification
        email_body = f"""
Nouvelle demande de démonstration:

Nom: {name}
Email: {email}
Entreprise: {company}
Besoins: {business_needs}

ID de référence: {message_id}
        """

        email_sent = send_email_smtp(
            ZOHO_EMAIL,
            f"Demande de démo de {name}",
            email_body
        )

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Demande de démonstration envoyée",
                "messageId": message_id,
                "emailSent": email_sent
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Demo form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur serveur"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="chat", auth_level=func.AuthLevel.ANONYMOUS)
def ai_chat(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI chat requests"""
    try:
        data = req.get_json()
        message = data.get('message', '')
        conversation_id = data.get('sessionId', str(uuid.uuid4()))

        if not message:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Message requis"}),
                status_code=400,
                mimetype="application/json"
            )

        if not openai_client:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Service IA non configuré"}),
                status_code=503,
                mimetype="application/json"
            )

        # Get chat completion from Azure OpenAI
        response = openai_client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": "Tu es un assistant IA helpful pour TCDynamics, une entreprise française spécialisée dans l'automatisation et l'IA. Réponds en français de manière professionnelle et helpful."},
                {"role": "user", "content": message}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content

        # Save conversation to Cosmos DB
        conversation_data = {
            "conversationId": conversation_id,
            "userMessage": message,
            "aiResponse": ai_response,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "chat"
        }
        save_to_cosmos(conversations_container, conversation_data)

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": ai_response,
                "conversationId": conversation_id
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur du service IA"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="vision", auth_level=func.AuthLevel.ANONYMOUS)
def ai_vision(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI vision requests for document processing"""
    try:
        data = req.get_json()
        image_url = data.get('imageUrl', '')

        if not image_url:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "URL d'image requise"}),
                status_code=400,
                mimetype="application/json"
            )

        if not vision_client:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Service de vision non configuré"}),
                status_code=503,
                mimetype="application/json"
            )

        # Analyze image using Azure Vision
        result = vision_client.analyze(
            image_url=image_url,
            visual_features=[VisualFeatures.CAPTION, VisualFeatures.READ]
        )

        # Extract text and description
        caption = result.caption.content if result.caption else ""
        text = ""
        if result.read:
            for line in result.read.blocks[0].lines:
                text += line.text + " "

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "caption": caption,
                "text": text.strip(),
                "description": f"Image analysée: {caption}. Texte extrait: {text.strip()}"
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"AI vision error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur du service de vision"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="create-payment-intent", auth_level=func.AuthLevel.ANONYMOUS)
def create_payment_intent(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe payment intent"""
    try:
        data = req.get_json()
        amount = data.get('amount', 0)  # Amount in cents
        currency = data.get('currency', 'eur')

        if not stripe.api_key:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Stripe non configuré"}),
                status_code=503,
                mimetype="application/json"
            )

        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={"source": "tcdynamics"}
        )

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "clientSecret": payment_intent.client_secret,
                "paymentIntentId": payment_intent.id
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Payment intent error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur de paiement"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="create-subscription", auth_level=func.AuthLevel.ANONYMOUS)
def create_subscription(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe subscription"""
    try:
        data = req.get_json()
        customer_email = data.get('email', '')
        price_id = data.get('priceId', '')

        if not stripe.api_key:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Stripe non configuré"}),
                status_code=503,
                mimetype="application/json"
            )

        # Create or retrieve customer
        customers = stripe.Customer.list(email=customer_email)
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(email=customer_email)

        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],
            metadata={"source": "tcdynamics"}
        )

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "subscriptionId": subscription.id,
                "clientSecret": subscription.latest_invoice.payment_intent.client_secret
            }),
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Subscription error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur d'abonnement"}),
            status_code=500,
            mimetype="application/json"
        )
