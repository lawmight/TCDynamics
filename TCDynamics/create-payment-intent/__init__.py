import azure.functions as func
import logging
import json
import os
import stripe

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe payment intent"""
    logging.info('Creating payment intent')

    try:
        stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        if not stripe_key:
            return func.HttpResponse(
                json.dumps({"error": "Stripe not configured"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

        stripe.api_key = stripe_key

        req_body = req.get_json()
        amount = req_body.get('amount', 1000)  # Default 10€
        currency = req_body.get('currency', 'eur')

        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={"enabled": True}
        )

        return func.HttpResponse(
            json.dumps({"clientSecret": intent.client_secret}),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except Exception as e:
        logging.error(f"Payment intent error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
