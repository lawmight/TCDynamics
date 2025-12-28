"""
Azure Functions app for TCDynamics - Refactored with service layer
Uses centralized client management, response building, and validation
"""

import sys
import logging
import json
import uuid
import os
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


# Timer trigger for keeping instances warm
# Only register in production (not when using development storage)
# Timer triggers require Azure Storage, which development storage emulator may not be running
storage_setting = os.environ.get("AzureWebJobsStorage", "")
is_local_dev = storage_setting == "UseDevelopmentStorage=true" or not storage_setting

if not is_local_dev:

    @app.schedule(schedule="0 */5 * * * *", arg_name="timer", run_on_startup=True)
    def warm_instances(timer: func.TimerRequest) -> None:
        """
        Periodic ping to keep Azure Functions warm.
        Triggered every 5 minutes and on startup.
        Only active in production (not local development).
        """
        logging.info("Warmup timer triggered at %s", datetime.utcnow().isoformat())

else:
    logging.info(
        "Timer trigger 'warm_instances' disabled for local development (requires Azure Storage)"
    )


@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint"""
    # Read environment from ENVIRONMENT or PYTHON_ENV, default to "production"
    environment = os.environ.get("ENVIRONMENT") or os.environ.get(
        "PYTHON_ENV", "production"
    )
    return ResponseBuilder.success(
        "healthy",
        {
            "timestamp": datetime.utcnow().isoformat(),
            "python_version": sys.version,
            "environment": environment,
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
                status_code=500,
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
            # Read credentials on-demand (not stored as instance attributes)
            zoho_email = client_manager.get_zoho_email()
            zoho_password = client_manager.get_zoho_password()
            if zoho_email and zoho_password:
                email_sent = send_email_smtp(
                    zoho_email,
                    zoho_password,
                    zoho_email,
                    f"Nouveau message de {contact_data['name']}",
                    email_body,
                )
                # Clear local variables after use
                zoho_email = None
                zoho_password = None
                del zoho_email, zoho_password

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
        }

        # Save to Cosmos DB
        container = client_manager.get_cosmos_container("demos")
        message_id = save_to_cosmos(container, demo_data)

        if not message_id:
            return ResponseBuilder.error(
                "Erreur lors de la sauvegarde des données",
                status_code=500,
                error_details="Failed to save to Cosmos DB",
            )

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
            # Read credentials on-demand (not stored as instance attributes)
            zoho_email = client_manager.get_zoho_email()
            zoho_password = client_manager.get_zoho_password()
            if zoho_email and zoho_password:
                email_sent = send_email_smtp(
                    zoho_email,
                    zoho_password,
                    zoho_email,
                    f"Demande de démo de {demo_data['name']}",
                    email_body,
                )
                # Clear local variables after use
                zoho_email = None
                zoho_password = None
                del zoho_email, zoho_password

        return ResponseBuilder.success(
            "Demande de démonstration envoyée",
            {"messageId": message_id, "emailSent": email_sent},
        )

    except (OSError, ValueError, json.JSONDecodeError) as e:
        return ResponseBuilder.from_exception(e, "Erreur serveur")


@app.route(route="vision", auth_level=func.AuthLevel.ANONYMOUS)
def ai_vision(req: func.HttpRequest) -> func.HttpResponse:
    """Analyze image using Azure Vision AI"""
    try:
        data = req.get_json()
        image_url = data.get("imageUrl", "").strip() if data else ""

        # Validate image URL
        if not image_url:
            return ResponseBuilder.validation_error("URL d'image requise", ["imageUrl"])

        error = validate_url(image_url)
        if error:
            return ResponseBuilder.validation_error(error)

        # Check Vision client configuration
        if not client_manager.is_vision_configured():
            return ResponseBuilder.service_unavailable("Vision AI")

        # Get vision client and analyze image
        vision_client = client_manager.get_vision_client()
        result = vision_client.analyze(
            image_url,
            visual_features=[VisualFeatures.CAPTION, VisualFeatures.READ],
        )

        # Extract text and description
        caption = result.caption.content if result.caption else ""
        text = ""
        if result.read and hasattr(result.read, "blocks") and result.read.blocks:
            for block in result.read.blocks:
                for line in block.lines:
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


@app.route(route="create-subscription", auth_level=func.AuthLevel.FUNCTION)
def create_subscription(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe subscription"""
    try:
        # Explicit authentication check
        # Check for Authorization header (Bearer token) or x-functions-key header
        auth_header = req.headers.get("Authorization", "")
        function_key = req.headers.get("x-functions-key", "")

        # Get expected key from environment variable
        expected_key = os.environ.get("SUBSCRIPTION_API_KEY") or os.environ.get(
            "FUNCTION_KEY"
        )

        if not expected_key:
            logging.error("SUBSCRIPTION_API_KEY or FUNCTION_KEY not configured")
        except (OSError, ValueError, stripe.error.StripeError) as e:
            logging.warning("Could not retrieve client secret", exc_info=True)
                status_code=500,
                error_details="Authentication not configured",
            )

        # Extract token from Authorization header if present (Bearer <token>)
        provided_key = None
        if auth_header.startswith("Bearer "):
            provided_key = auth_header.replace("Bearer ", "").strip()
        elif function_key:
            provided_key = function_key.strip()

        # Validate the provided key
        if not provided_key or provided_key != expected_key:
            logging.warning(
                "Unauthorized subscription creation attempt - "
                "has_auth_header=%s, has_function_key=%s, ip=%s",
                bool(auth_header),
                bool(function_key),
                req.headers.get("X-Forwarded-For", "unknown"),
            )
            return ResponseBuilder.error(
                "Unauthorized",
                status_code=401,
                error_details="Invalid or missing authentication credentials",
            )

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

        # Create subscription with expanded latest_invoice and payment_intent
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],
            metadata={"source": "tcdynamics"},
            expand=["latest_invoice.payment_intent", "latest_invoice"],
        )

        # Extract client secret (if available)
        client_secret = None
        try:
            if (
                subscription.latest_invoice
                and hasattr(subscription.latest_invoice, "payment_intent")
                and subscription.latest_invoice.payment_intent
                and hasattr(subscription.latest_invoice.payment_intent, "client_secret")
            ):
                client_secret = subscription.latest_invoice.payment_intent.client_secret
            elif subscription.latest_invoice and hasattr(
                subscription.latest_invoice, "id"
            ):
                # Fallback: retrieve invoice if not expanded or lacks payment_intent
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
