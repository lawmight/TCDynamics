"""
Azure Functions app for TCDynamics - Refactored with service layer
Uses centralized client management, response building, and validation
"""

import sys
import logging
import json
import uuid
from datetime import datetime
import azure.functions as func
from azure.ai.vision.imageanalysis.models import VisualFeatures
import stripe

# Import service layer
from services import (
    ClientManager,
    ResponseBuilder,
    validate_required_fields,
    validate_url,
    validate_amount,
    send_email_smtp,
    save_to_cosmos,
)

# Initialize centralized client manager (Singleton)
client_manager = ClientManager()

# Create function app
app = func.FunctionApp()


@app.schedule(schedule="0 */5 * * * *", arg_name="timer", run_on_startup=True)
def warm_instances(timer: func.TimerRequest) -> None:
    """
    Periodic ping to keep Azure Functions warm.
    Triggered every 5 minutes and on startup.
    """
    logging.info("Warmup timer triggered at %s", datetime.utcnow().isoformat())


@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health_check(_req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint"""
    return ResponseBuilder.success(
        "healthy",
        {
            "timestamp": datetime.utcnow().isoformat(),
            "python_version": sys.version,
            "environment": "production",
        },
    )


@app.route(route="contactform", auth_level=func.AuthLevel.ANONYMOUS)
def contact_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle contact form submissions"""
    try:
        data = req.get_json()

        # Validate required fields
        error = validate_required_fields(data, ["name", "email", "message"])
        if error:
            return ResponseBuilder.validation_error(error)

        # Check Cosmos DB configuration
        if not client_manager.is_cosmos_configured():
            return ResponseBuilder.service_unavailable("Cosmos DB")

        # Prepare contact data
        contact_data = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "message": data.get("message", ""),
            "type": "contact",
        }

        # Save to Cosmos DB
        container = client_manager.get_cosmos_container("contacts")
        message_id = save_to_cosmos(container, contact_data)

        if not message_id:
            return ResponseBuilder.error(
                "Erreur lors de la sauvegarde des données",
                error_details="Failed to save to Cosmos DB",
            )

        # Send email notification
        email_body = f"""
Nouveau message de contact:

Nom: {contact_data['name']}
Email: {contact_data['email']}
Message: {contact_data['message']}

ID de référence: {message_id}
        """

        email_sent = False
        if client_manager.is_email_configured():
            email_sent = send_email_smtp(
                client_manager.zoho_email,
                client_manager.zoho_password,
                client_manager.zoho_email,
                f"Nouveau message de {contact_data['name']}",
                email_body,
            )

        return ResponseBuilder.success(
            "Message envoyé avec succès",
            {"messageId": message_id, "emailSent": email_sent},
        )

    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur serveur")


@app.route(route="demoform", auth_level=func.AuthLevel.ANONYMOUS)
def demo_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle demo request form submissions"""
    try:
        data = req.get_json()

        # Validate required fields
        error = validate_required_fields(data, ["name", "email", "businessNeeds"])
        if error:
            return ResponseBuilder.validation_error(error)

        # Check Cosmos DB configuration
        if not client_manager.is_cosmos_configured():
            return ResponseBuilder.service_unavailable("Cosmos DB")

        # Prepare demo data
        demo_data = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "company": data.get("company", ""),
            "businessNeeds": data.get("businessNeeds", ""),
            "type": "demo_request",
        }

        # Save to Cosmos DB
        container = client_manager.get_cosmos_container("demos")
        message_id = save_to_cosmos(container, demo_data)

        # Send email notification
        email_body = f"""
Nouvelle demande de démonstration:

Nom: {demo_data['name']}
Email: {demo_data['email']}
Entreprise: {demo_data['company']}
Besoins: {demo_data['businessNeeds']}

ID de référence: {message_id}
        """

        email_sent = False
        if client_manager.is_email_configured():
            email_sent = send_email_smtp(
                client_manager.zoho_email,
                client_manager.zoho_password,
                client_manager.zoho_email,
                f"Demande de démo de {demo_data['name']}",
                email_body,
            )

        return ResponseBuilder.success(
            "Demande de démonstration envoyée",
            {"messageId": message_id, "emailSent": email_sent},
        )

    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur serveur")


@app.route(route="chat", auth_level=func.AuthLevel.ANONYMOUS)
def ai_chat(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI chat requests"""
    try:
        data = req.get_json()
        message = data.get("message", "").strip()
        conversation_id = data.get("sessionId", str(uuid.uuid4()))

        if not message:
            return ResponseBuilder.validation_error("Message requis")

        # Check OpenAI configuration
        if not client_manager.is_openai_configured():
            return ResponseBuilder.service_unavailable("IA")

        # Get chat completion
        openai_client = client_manager.get_openai_client()
        response = openai_client.chat.completions.create(
            model=client_manager.azure_openai_deployment,
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant IA helpful pour TCDynamics, une entreprise française spécialisée dans l'automatisation et l'IA. Réponds en français de manière professionnelle et helpful.",
                },
                {"role": "user", "content": message},
            ],
            max_tokens=1000,
            temperature=0.7,
        )

        ai_response = response.choices[0].message.content

        # Save conversation to Cosmos DB (if configured)
        if client_manager.is_cosmos_configured():
            conversation_data = {
                "conversationId": conversation_id,
                "userMessage": message,
                "aiResponse": ai_response,
                "timestamp": datetime.utcnow().isoformat(),
                "type": "chat",
            }
            container = client_manager.get_cosmos_container("conversations")
            save_to_cosmos(container, conversation_data)

        return ResponseBuilder.success(
            ai_response, {"conversationId": conversation_id}
        )

    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur du service IA")


@app.route(route="vision", auth_level=func.AuthLevel.ANONYMOUS)
def ai_vision(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI vision requests for document processing"""
    try:
        data = req.get_json()
        image_url = data.get("imageUrl", "").strip()

        if not image_url:
            return ResponseBuilder.validation_error("URL d'image requise")

        # Validate URL format
        if not validate_url(image_url):
            return ResponseBuilder.validation_error("URL d'image invalide")

        # Check Vision configuration
        if not client_manager.is_vision_configured():
            return ResponseBuilder.service_unavailable("Vision")

        # Analyze image
        vision_client = client_manager.get_vision_client()
        result = vision_client.analyze(
            image_data=None,
            image_url=image_url,
            visual_features=[VisualFeatures.CAPTION, VisualFeatures.READ],
        )

        # Extract text and description
        caption = result.caption.content if result.caption else ""
        text = ""
        if result.read and hasattr(result.read, "blocks") and result.read.blocks:
            for line in result.read.blocks[0].lines:
                text += line.text + " "

        return ResponseBuilder.success(
            f"Image analysée: {caption}",
            {
                "caption": caption,
                "text": text.strip(),
                "description": f"Image analysée: {caption}. Texte extrait: {text.strip()}",
            },
        )

    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur du service de vision")


@app.route(route="create-payment-intent", auth_level=func.AuthLevel.ANONYMOUS)
def create_payment_intent(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe payment intent"""
    try:
        data = req.get_json()
        amount = data.get("amount", 0)
        currency = data.get("currency", "eur")

        # Validate amount
        error = validate_amount(amount)
        if error:
            return ResponseBuilder.validation_error(error)

        # Check Stripe configuration
        if not client_manager.is_stripe_configured():
            return ResponseBuilder.service_unavailable("Stripe")

        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount, currency=currency, metadata={"source": "tcdynamics"}
        )

        return ResponseBuilder.success(
            "Payment intent créé",
            {
                "clientSecret": payment_intent.client_secret,
                "paymentIntentId": payment_intent.id,
            },
        )

    except stripe.error.StripeError as e:
        return ResponseBuilder.from_exception(e, "Erreur de paiement")
    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur de paiement")


@app.route(route="create-subscription", auth_level=func.AuthLevel.ANONYMOUS)
def create_subscription(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe subscription"""
    try:
        data = req.get_json()
        customer_email = data.get("email", "").strip()
        price_id = data.get("priceId", "").strip()

        if not customer_email or not price_id:
            return ResponseBuilder.validation_error(
                "Email et priceId requis", ["email", "priceId"]
            )

        # Check Stripe configuration
        if not client_manager.is_stripe_configured():
            return ResponseBuilder.service_unavailable("Stripe")

        # Create or retrieve customer
        customers = stripe.Customer.list(email=customer_email)
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(email=customer_email)

        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],
            metadata={"source": "tcdynamics"},
        )

        # Extract client secret (if available)
        client_secret = None
        try:
            if (
                subscription.latest_invoice
                and subscription.latest_invoice.payment_intent
                and hasattr(subscription.latest_invoice.payment_intent, "client_secret")
            ):
                client_secret = subscription.latest_invoice.payment_intent.client_secret
            elif subscription.latest_invoice and hasattr(
                subscription.latest_invoice, "id"
            ):
                invoice = stripe.Invoice.retrieve(subscription.latest_invoice.id)
                if invoice.payment_intent and hasattr(
                    invoice.payment_intent, "client_secret"
                ):
                    client_secret = invoice.payment_intent.client_secret
        except (OSError, ValueError, stripe.error.StripeError) as e:
            logging.warning(f"Could not retrieve client secret: {e}")

        response_data = {"subscriptionId": subscription.id}
        if client_secret:
            response_data["clientSecret"] = client_secret

        return ResponseBuilder.success("Abonnement créé", response_data)

    except stripe.error.StripeError as e:
        return ResponseBuilder.from_exception(e, "Erreur d'abonnement")
    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur d'abonnement")

