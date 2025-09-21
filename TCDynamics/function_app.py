import azure.functions as func
import logging
import os
import json
import time
from datetime import datetime

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

app = func.FunctionApp()

# Simple inline functions to test basic routing
@app.route(route="ContactForm", methods=["POST"])
def contact_form_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Contact form processed a request.')
    return func.HttpResponse(
        json.dumps({"success": True, "message": "Contact form received"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

@app.route(route="DemoForm", methods=["POST"])
def demo_form_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Demo form processed a request.')
    return func.HttpResponse(
        json.dumps({"success": True, "message": "Demo form received"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

@app.route(route="chat", methods=["POST"])
def ai_chat_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Chat request processed.')
    return func.HttpResponse(
        json.dumps({"success": True, "message": "Chat request received"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

@app.route(route="vision", methods=["POST"])
def ai_vision_wrapper(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Vision request processed.')
    return func.HttpResponse(
        json.dumps({"success": True, "message": "Vision request received"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

@app.route(route="health", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
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

@app.route(route="create-payment-intent", methods=["POST"])
def create_payment_intent(req: func.HttpRequest) -> func.HttpResponse:
    """Créer une intention de paiement Stripe"""
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

@app.route(route="create-subscription", methods=["POST"])
def create_subscription(req: func.HttpRequest) -> func.HttpResponse:
    """Créer un abonnement Stripe"""
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

