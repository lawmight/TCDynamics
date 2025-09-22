import azure.functions as func
import logging
import os
import json
import time
from datetime import datetime
import requests
from azure.cosmos import CosmosClient
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Optional Stripe import (only if available)
try:
    import stripe
    stripe_available = True
    # Configure Stripe if available
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')
except ImportError:
    stripe_available = False
    logging.warning("Stripe not available - payment functions will not work")

# Track application start time for uptime calculation
app_start_time = time.time()

func_app = func.FunctionApp()

# Contact Form Function
@func_app.route(route="ContactForm", methods=["POST"])
def contact_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle contact form submissions and send email via Zoho Mail"""
    logging.info('Contact form submission received.')

    try:
        # Parse request body
        req_body = req.get_json()
        name = req_body.get('name', '').strip()
        email = req_body.get('email', '').strip()
        company = req_body.get('company', '').strip()
        message = req_body.get('message', '').strip()

        # Validate required fields
        if not name or not email or not message:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Missing required fields: name, email, and message are required"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Send email via Zoho Mail
        email_sent = send_contact_email(name, email, company, message)

        # Store in Cosmos DB if available
        try:
            store_contact_submission(name, email, company, message)
        except Exception as db_error:
            logging.warning(f"Failed to store in database: {str(db_error)}")

        if email_sent:
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": "Contact form submitted successfully"
                }),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )
        else:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Failed to send email notification"
                }),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Invalid JSON in request body"
            }),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Contact form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": f"Internal server error: {str(e)}"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="DemoForm", methods=["POST"])
def demo_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle demo request form submissions and send email via Zoho Mail"""
    logging.info('Demo form submission received.')

    try:
        # Parse request body
        req_body = req.get_json()
        name = req_body.get('name', '').strip()
        email = req_body.get('email', '').strip()
        company = req_body.get('company', '').strip()
        phone = req_body.get('phone', '').strip()
        business_needs = req_body.get('businessNeeds', '').strip()
        timeline = req_body.get('timeline', '').strip()

        # Validate required fields
        if not name or not email or not business_needs:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Missing required fields: name, email, and business needs are required"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Send email via Zoho Mail
        email_sent = send_demo_email(name, email, company, phone, business_needs, timeline)

        # Store in Cosmos DB if available
        try:
            store_demo_submission(name, email, company, phone, business_needs, timeline)
        except Exception as db_error:
            logging.warning(f"Failed to store demo submission in database: {str(db_error)}")

        if email_sent:
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": "Demo request submitted successfully. We'll contact you soon!"
                }),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )
        else:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Failed to send demo request notification"
                }),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Invalid JSON in request body"
            }),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Demo form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": f"Internal server error: {str(e)}"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="chat", methods=["POST"])
def ai_chat(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI chat requests using Azure OpenAI"""
    logging.info('AI chat request received.')

    try:
        # Parse request body
        req_body = req.get_json()
        message = req_body.get('message', '').strip()
        conversation_id = req_body.get('conversationId', '')

        # Validate required fields
        if not message:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Message is required"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Get Azure OpenAI configuration
        openai_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT', '')
        openai_key = os.getenv('AZURE_OPENAI_KEY', '')
        deployment_name = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-35-turbo')

        if not openai_endpoint or not openai_key:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Azure OpenAI configuration not available"
                }),
                status_code=503,
                headers={"Content-Type": "application/json"}
            )

        # Prepare OpenAI request
        headers = {
            'Content-Type': 'application/json',
            'api-key': openai_key
        }

        # Create system message for TCDynamics context
        system_message = {
            "role": "system",
            "content": """Tu es un assistant IA pour TCDynamics, une entreprise spécialisée dans l'automatisation des processus métier et l'intelligence artificielle.

Tu aides les utilisateurs à comprendre nos services, répondre à leurs questions sur l'automatisation, et les guider vers les bonnes solutions.

Services principaux de TCDynamics :
- Automatisation des processus métier
- Intelligence artificielle et machine learning
- Intégration de systèmes
- Consultation et accompagnement digital

Réponds de manière professionnelle, helpful et en français."""
        }

        # Create user message
        user_message = {
            "role": "user",
            "content": message
        }

        data = {
            "messages": [system_message, user_message],
            "max_tokens": 1000,
            "temperature": 0.7,
            "top_p": 0.95
        }

        # Call Azure OpenAI
        response = requests.post(
            f"{openai_endpoint}/openai/deployments/{deployment_name}/chat/completions?api-version=2023-12-01-preview",
            headers=headers,
            json=data,
            timeout=30
        )

        if response.status_code != 200:
            logging.error(f"OpenAI API error: {response.status_code} - {response.text}")
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "AI service temporarily unavailable"
                }),
                status_code=503,
                headers={"Content-Type": "application/json"}
            )

        # Parse response
        response_data = response.json()
        ai_response = response_data['choices'][0]['message']['content']

        # Store conversation in Cosmos DB if available
        try:
            store_chat_conversation(message, ai_response, conversation_id)
        except Exception as db_error:
            logging.warning(f"Failed to store conversation in database: {str(db_error)}")

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": ai_response,
                "conversationId": conversation_id or str(time.time())
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Invalid JSON in request body"
            }),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )
    except requests.exceptions.Timeout:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "AI service timeout - please try again"
            }),
            status_code=504,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": f"Internal server error: {str(e)}"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="vision", methods=["POST"])
def ai_vision(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI vision requests using Azure Computer Vision"""
    logging.info('AI vision request received.')

    try:
        # Parse request body
        req_body = req.get_json()
        image_url = req_body.get('imageUrl', '').strip()
        image_data = req_body.get('imageData', '')  # Base64 encoded image

        # Validate input
        if not image_url and not image_data:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Either imageUrl or imageData is required"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Get Azure Vision configuration
        vision_endpoint = os.getenv('AZURE_VISION_ENDPOINT', '')
        vision_key = os.getenv('AZURE_VISION_KEY', '')

        if not vision_endpoint or not vision_key:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Azure Vision configuration not available"
                }),
                status_code=503,
                headers={"Content-Type": "application/json"}
            )

        # Analyze image
        analysis_result = analyze_image_with_azure_vision(image_url, image_data, vision_endpoint, vision_key)

        if not analysis_result:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Failed to analyze image"
                }),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "result": analysis_result
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except json.JSONDecodeError:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Invalid JSON in request body"
            }),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"AI vision error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": f"Internal server error: {str(e)}"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="health", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Health check function processed a request.')

    try:
        # Calculate uptime
        current_time = time.time()
        uptime_seconds = current_time - app_start_time

        # Create health response
        health_data = {
            "status": "healthy",
            "uptime": uptime_seconds,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        return func.HttpResponse(
            json.dumps(health_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Health check error: {str(e)}")
        error_data = {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        return func.HttpResponse(
            json.dumps(error_data),
            status_code=503,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="create-payment-intent", methods=["POST"])
def create_payment_intent(req: func.HttpRequest) -> func.HttpResponse:
    """Créer une intention de paiement Stripe"""
    if not stripe_available:
        return func.HttpResponse(
            json.dumps({'error': 'Stripe not available'}),
            status_code=503,
            headers={"Content-Type": "application/json"}
        )

    try:
        req_body = req.get_json()
        amount = req_body.get('amount', 0)  # Montant en centimes
        currency = req_body.get('currency', 'eur')
        plan_name = req_body.get('plan', 'starter')

        # Créer l'intention de paiement
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={'plan': plan_name}
        )

        return func.HttpResponse(
            json.dumps({
                'clientSecret': intent.client_secret,
                'paymentIntentId': intent.id
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Erreur lors de la création de l'intention de paiement: {str(e)}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )

@func_app.route(route="create-subscription", methods=["POST"])
def create_subscription(req: func.HttpRequest) -> func.HttpResponse:
    """Créer un abonnement Stripe"""
    if not stripe_available:
        return func.HttpResponse(
            json.dumps({'error': 'Stripe not available'}),
            status_code=503,
            headers={"Content-Type": "application/json"}
        )

    try:
        req_body = req.get_json()
        customer_email = req_body.get('email')
        price_id = req_body.get('price_id')  # ID du prix Stripe

        # Créer ou récupérer le client
        customer = stripe.Customer.create(email=customer_email)

        # Créer l'abonnement avec période d'essai de 14 jours
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': price_id}],
            trial_period_days=14,
            metadata={'plan': req_body.get('plan', 'starter')}
        )

        return func.HttpResponse(
            json.dumps({
                'subscriptionId': subscription.id,
                'clientSecret': subscription.latest_invoice.payment_intent.client_secret,
                'customerId': customer.id
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Erreur lors de la création de l'abonnement: {str(e)}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )

# Helper Functions
def send_contact_email(name: str, email: str, company: str, message: str) -> bool:
    """Send contact form submission via Zoho Mail"""
    try:
        # Get Zoho Mail configuration from environment
        zoho_email = os.getenv('ZOHO_EMAIL', 'contact@tcdynamics.fr')
        zoho_password = os.getenv('ZOHO_PASSWORD', '')

        if not zoho_password:
            logging.error("ZOHO_PASSWORD environment variable not set")
            return False

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = zoho_email
        msg['To'] = zoho_email  # Send to ourselves
        msg['Subject'] = f"Nouveau message de contact - {name}"

        # Email body
        body = f"""
Nouveau message de contact reçu:

Nom: {name}
Email: {email}
Entreprise: {company if company else 'Non spécifiée'}

Message:
{message}

---
Ce message a été envoyé depuis le formulaire de contact TCDynamics.
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email via Zoho SMTP
        server = smtplib.SMTP('smtp.zoho.eu', 587)
        server.starttls()
        server.login(zoho_email, zoho_password)
        server.send_message(msg)
        server.quit()

        logging.info(f"Contact email sent successfully for {name}")
        return True

    except Exception as e:
        logging.error(f"Failed to send contact email: {str(e)}")
        return False

def store_contact_submission(name: str, email: str, company: str, message: str) -> None:
    """Store contact form submission in Cosmos DB"""
    try:
        # Get Cosmos DB configuration
        cosmos_connection = os.getenv('COSMOS_CONNECTION_STRING', '')
        if not cosmos_connection:
            logging.warning("COSMOS_CONNECTION_STRING not set, skipping database storage")
            return

        # Initialize Cosmos client
        client = CosmosClient.from_connection_string(cosmos_connection)
        database_name = os.getenv('COSMOS_DATABASE', 'tcdynamics')
        container_name = os.getenv('COSMOS_CONTAINER_CONTACTS', 'contacts')

        database = client.get_database_client(database_name)
        container = database.get_container_client(container_name)

        # Create contact document
        contact_doc = {
            'id': str(time.time()),  # Use timestamp as ID
            'type': 'contact_submission',
            'name': name,
            'email': email,
            'company': company,
            'message': message,
            'submitted_at': datetime.utcnow().isoformat() + 'Z',
            'ip_address': 'unknown',  # Could be extracted from request headers
            'user_agent': 'unknown'   # Could be extracted from request headers
        }

        container.create_item(body=contact_doc)
        logging.info(f"Contact submission stored in database for {name}")

    except Exception as e:
        logging.error(f"Failed to store contact submission in database: {str(e)}")
        raise

def send_demo_email(name: str, email: str, company: str, phone: str, business_needs: str, timeline: str) -> bool:
    """Send demo request via Zoho Mail"""
    try:
        # Get Zoho Mail configuration from environment
        zoho_email = os.getenv('ZOHO_EMAIL', 'contact@tcdynamics.fr')
        zoho_password = os.getenv('ZOHO_PASSWORD', '')

        if not zoho_password:
            logging.error("ZOHO_PASSWORD environment variable not set")
            return False

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = zoho_email
        msg['To'] = zoho_email  # Send to ourselves
        msg['Subject'] = f"Nouvelle demande de démonstration - {name}"

        # Email body
        body = f"""
Nouvelle demande de démonstration reçue:

Nom: {name}
Email: {email}
Entreprise: {company if company else 'Non spécifiée'}
Téléphone: {phone if phone else 'Non spécifié'}

Besoins métier:
{business_needs}

Échéancier:
{timeline if timeline else 'Non spécifié'}

---
Cette demande a été envoyée depuis le formulaire de démonstration TCDynamics.
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email via Zoho SMTP
        server = smtplib.SMTP('smtp.zoho.eu', 587)
        server.starttls()
        server.login(zoho_email, zoho_password)
        server.send_message(msg)
        server.quit()

        logging.info(f"Demo email sent successfully for {name}")
        return True

    except Exception as e:
        logging.error(f"Failed to send demo email: {str(e)}")
        return False

def store_demo_submission(name: str, email: str, company: str, phone: str, business_needs: str, timeline: str) -> None:
    """Store demo request in Cosmos DB"""
    try:
        # Get Cosmos DB configuration
        cosmos_connection = os.getenv('COSMOS_CONNECTION_STRING', '')
        if not cosmos_connection:
            logging.warning("COSMOS_CONNECTION_STRING not set, skipping database storage")
            return

        # Initialize Cosmos client
        client = CosmosClient.from_connection_string(cosmos_connection)
        database_name = os.getenv('COSMOS_DATABASE', 'tcdynamics')
        container_name = os.getenv('COSMOS_CONTAINER_DEMOS', 'demo_requests')

        database = client.get_database_client(database_name)
        container = database.get_container_client(container_name)

        # Create demo request document
        demo_doc = {
            'id': str(time.time()),  # Use timestamp as ID
            'type': 'demo_request',
            'name': name,
            'email': email,
            'company': company,
            'phone': phone,
            'business_needs': business_needs,
            'timeline': timeline,
            'submitted_at': datetime.utcnow().isoformat() + 'Z',
            'status': 'new',  # new, contacted, scheduled, completed
            'ip_address': 'unknown',
            'user_agent': 'unknown'
        }

        container.create_item(body=demo_doc)
        logging.info(f"Demo request stored in database for {name}")

    except Exception as e:
        logging.error(f"Failed to store demo request in database: {str(e)}")
        raise

def store_chat_conversation(user_message: str, ai_response: str, conversation_id: str) -> None:
    """Store chat conversation in Cosmos DB"""
    try:
        # Get Cosmos DB configuration
        cosmos_connection = os.getenv('COSMOS_CONNECTION_STRING', '')
        if not cosmos_connection:
            logging.warning("COSMOS_CONNECTION_STRING not set, skipping database storage")
            return

        # Initialize Cosmos client
        client = CosmosClient.from_connection_string(cosmos_connection)
        database_name = os.getenv('COSMOS_DATABASE', 'tcdynamics')
        container_name = os.getenv('COSMOS_CONTAINER_CONVERSATIONS', 'conversations')

        database = client.get_database_client(database_name)
        container = database.get_container_client(container_name)

        # Create conversation document
        conversation_doc = {
            'id': conversation_id or str(time.time()),  # Use provided ID or timestamp
            'type': 'chat_conversation',
            'user_message': user_message,
            'ai_response': ai_response,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'model_used': os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-35-turbo'),
            'tokens_used': 0,  # Could be calculated if needed
            'ip_address': 'unknown',
            'user_agent': 'unknown'
        }

        container.create_item(body=conversation_doc)
        logging.info(f"Chat conversation stored in database (ID: {conversation_doc['id']})")

    except Exception as e:
        logging.error(f"Failed to store chat conversation in database: {str(e)}")
        raise

def analyze_image_with_azure_vision(image_url: str, image_data: str, endpoint: str, key: str) -> dict:
    """Analyze image using Azure Computer Vision"""
    try:
        from azure.cognitiveservices.vision.computervision import ComputerVisionClient
        from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
        from msrest.authentication import CognitiveServicesCredentials

        # If no URL but we have image data, we'd need to handle base64
        # For now, we'll focus on URL-based analysis
        if not image_url and image_data:
            logging.warning("Base64 image data analysis not implemented yet")
            return None

        if not image_url:
            logging.error("No image URL provided and base64 analysis not implemented")
            return None

        # Create Computer Vision client
        credentials = CognitiveServicesCredentials(key)
        client = ComputerVisionClient(endpoint, credentials)

        # Analyze image
        features = [
            VisualFeatureTypes.categories,
            VisualFeatureTypes.description,
            VisualFeatureTypes.color,
            VisualFeatureTypes.tags
        ]

        # Analyze image by URL
        analysis = client.analyze_image(image_url, features)

        # Format the response
        formatted_result = {
            "description": "",
            "categories": [],
            "color": {},
            "tags": [],
            "confidence": 0.0
        }

        # Extract description
        if analysis.description and analysis.description.captions:
            caption = analysis.description.captions[0]
            formatted_result["description"] = caption.text
            formatted_result["confidence"] = caption.confidence

        # Extract categories
        if analysis.categories:
            formatted_result["categories"] = [
                {"name": cat.name, "score": cat.score}
                for cat in analysis.categories
                if cat.score > 0.5
            ]

        # Extract color information
        if analysis.color:
            color = analysis.color
            formatted_result["color"] = {
                "dominantColors": [color.dominant_color_foreground, color.dominant_color_background] if (hasattr(color, 'dominant_color_foreground') and hasattr(color, 'dominant_color_background')) else [],
                "accentColor": color.accent_color if hasattr(color, 'accent_color') else '',
                "isBlackAndWhite": color.is_bw_img if hasattr(color, 'is_bw_img') else False
            }

        # Extract tags
        if analysis.tags:
            formatted_result["tags"] = [
                {"name": tag.name, "confidence": tag.confidence}
                for tag in analysis.tags
            ]

        # Add metadata
        formatted_result["metadata"] = {
            "requestId": analysis.request_id if hasattr(analysis, 'request_id') else '',
            "modelVersion": analysis.model_version if hasattr(analysis, 'model_version') else '',
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        }

        logging.info(f"Image analysis completed successfully")
        return formatted_result

    except Exception as e:
        logging.error(f"Failed to analyze image with Azure Vision: {str(e)}")
        return None

